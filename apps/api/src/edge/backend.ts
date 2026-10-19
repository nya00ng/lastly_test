import { Buffer } from 'node:buffer';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  createItemSchema,
  updateItemSchema,
  createLogSchema,
  updateLogSchema,
  interpretRequestSchema,
  commitRequestSchema,
  cadencePreviewRequestSchema,
  signupPromptSchema,
  updateNotificationSettingsSchema,
  pushSubscriptionSchema,
  notificationActionSchema,
} from '@lastly/contracts';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { ConfigService } from '@nestjs/config';
import type { SupabaseService } from '../infra/supabase/supabase.service';
import type { AiClient } from '../infra/ai/ai.client';
import type { PushService } from '../infra/push/push.service';
import { CadenceService } from '../modules/cadence/cadence.service';
import { PriorsRepository } from '../modules/cadence/priors.repository';
import { ItemsRepository } from '../modules/items/items.repository';
import { LogsRepository } from '../modules/items/logs.repository';
import { ItemsService } from '../modules/items/items.service';
import { LogsService } from '../modules/items/logs.service';
import { ProfileService } from '../modules/profile/profile.service';
import { NotificationsService } from '../modules/notifications/notifications.service';
import { CaptureService } from '../modules/capture/capture.service';
import { DraftTokenService } from '../modules/capture/draft-token.service';
import { appToday } from '../common/clock';

// DraftTokenService uses Node-compatible HMAC/Buffer, supported by Supabase Edge.
globalThis.Buffer ??= Buffer;

export interface BackendDependencies {
  allowedOrigins: string[];
  draftSecret: string;
  vapidPublicKey?: string;
  authenticate(token: string): Promise<{ client: SupabaseClient; user: User } | null>;
  deleteUser(id: string): Promise<void>;
  ai?: Pick<AiClient, 'embed' | 'parseUtterance' | 'suggestCadence' | 'warmUp'>;
}
const offlineAi = {
  embed: async () => null,
  parseUtterance: async () => null,
  suggestCadence: async () => null,
  warmUp() {},
};
export function services(
  client: SupabaseClient,
  secret: string,
  ai = offlineAi as BackendDependencies['ai'],
) {
  const db = { admin: client } as SupabaseService;
  const cadence = new CadenceService();
  const items = new ItemsRepository(db);
  const logRepo = new LogsRepository(db);
  const logs = new LogsService(logRepo, items);
  const itemService = new ItemsService(items, logRepo, cadence, ai as AiClient);
  const draft = new DraftTokenService({ getOrThrow: () => secret } as unknown as ConfigService);
  const capture = new CaptureService(
    ai as AiClient,
    items,
    itemService,
    logs,
    cadence,
    new PriorsRepository(db),
    draft,
  );
  const profile = new ProfileService(db);
  const notifications = new NotificationsService(db, {} as PushService, items, logs, cadence, {
    get: () => 'false',
  } as unknown as ConfigService);
  return { items: itemService, logs, capture, profile, notifications, draft };
}

export async function handleBackend(req: Request, deps: BackendDependencies): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname
    .replace(/^\/functions\/v1\/api/, '')
    .replace(/^\/api/, '')
    .replace(/\/$/, '');
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  });
  const origin = req.headers.get('origin');
  if (origin && deps.allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Headers', 'authorization, apikey, content-type');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }
  const reply = (body: unknown, status = 200) =>
    new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
  const fail = (status: number, code: string, message: string) =>
    reply({ error: { code, message } }, status);
  if (req.method === 'OPTIONS') return reply(null, 204);
  if (path === '/v1/health' && req.method === 'GET')
    return reply({
      status: 'ok',
      backend: 'supabase',
      cloudAi: !!deps.ai,
      vapidPublicKey: deps.vapidPublicKey ?? null,
    });
  const bearer = req.headers.get('authorization');
  if (!bearer?.startsWith('Bearer '))
    return fail(401, 'UnauthorizedException', '인증이 필요합니다.');
  try {
    const auth = await deps.authenticate(bearer.slice(7));
    if (!auth)
      return fail(401, 'UnauthorizedException', '세션이 만료되었습니다. 다시 로그인해 주세요.');
    const { client, user } = auth;
    const uid = user.id;
    const s = services(client, deps.draftSecret, deps.ai);
    const body = async <T extends z.ZodTypeAny>(schema: T): Promise<z.output<T>> =>
      schema.parse(await req.json().catch(() => null));
    const id = (value: string) => z.string().uuid().parse(value);
    const method = req.method;
    if (path === '/v1/items') {
      if (method === 'GET') return reply(await s.items.list(uid));
      if (method === 'POST')
        return reply(await s.items.create(uid, await body(createItemSchema)), 201);
    }
    if (path === '/v1/items/search' && method === 'GET')
      return reply(await s.items.search(uid, url.searchParams.get('q') ?? ''));
    const item = path.match(/^\/v1\/items\/([^/]+)(?:\/(complete|restore|logs))?$/);
    if (item) {
      const itemId = id(item[1]!);
      if (!item[2]) {
        if (method === 'GET') return reply(await s.items.findOne(uid, itemId));
        if (method === 'PATCH')
          return reply(await s.items.update(uid, itemId, await body(updateItemSchema)));
        if (method === 'DELETE') {
          await s.items.remove(uid, itemId);
          return reply(null, 204);
        }
      }
      if (item[2] === 'complete' && method === 'POST')
        return reply(await s.logs.completeToday(uid, itemId), 201);
      if (item[2] === 'restore' && method === 'POST') {
        await s.items.restore(uid, itemId);
        return reply(null, 204);
      }
      if (item[2] === 'logs') {
        if (method === 'GET') return reply(await s.logs.listByItem(uid, itemId));
        if (method === 'POST')
          return reply(await s.logs.add(uid, itemId, await body(createLogSchema)), 201);
      }
    }
    if (path === '/v1/logs/undo' && method === 'POST') {
      const input = await body(z.object({ undoToken: z.string().uuid() }));
      await s.logs.undo(uid, input.undoToken);
      return reply(null, 204);
    }
    const log = path.match(/^\/v1\/logs\/([^/]+)$/);
    if (log) {
      const logId = id(log[1]!);
      if (method === 'PATCH')
        return reply(await s.logs.update(uid, logId, await body(updateLogSchema)));
      if (method === 'DELETE') {
        await s.logs.remove(uid, logId);
        return reply(null, 204);
      }
    }
    if (path === '/v1/home/feed' && method === 'GET') {
      const profile = await s.profile.get(uid);
      return reply(
        await s.items.homeFeed(uid, profile.display_name, appToday(), {
          isAnonymous: user.is_anonymous ?? false,
          promptsSeen: profile.signup_prompts_seen,
        }),
      );
    }
    if (path === '/v1/home/calendar' && method === 'GET') {
      const month = url.searchParams.get('month') ?? format(appToday(), 'yyyy-MM');
      z.string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
        .parse(month);
      return reply(await s.items.calendar(uid, month));
    }
    if (method === 'POST') {
      if (path === '/v1/capture/interpret')
        return reply(await s.capture.interpret(uid, await body(interpretRequestSchema)), 201);
      if (path === '/v1/capture/commit')
        return reply(await s.capture.commit(uid, await body(commitRequestSchema)), 201);
      if (path === '/v1/capture/cadence')
        return reply(
          await s.capture.previewCadence(uid, await body(cadencePreviewRequestSchema)),
          201,
        );
    }
    if (path === '/v1/me') {
      if (method === 'GET') return reply(await s.profile.get(uid));
      if (method === 'DELETE') {
        await deps.deleteUser(uid);
        return reply(null, 204);
      }
    }
    if (path === '/v1/me/export' && method === 'GET') return reply(await s.profile.exportData(uid));
    if (path === '/v1/me/signup-prompts' && method === 'POST') {
      const input = await body(z.object({ prompt: signupPromptSchema }));
      await s.profile.markSignupPromptSeen(uid, input.prompt);
      return reply(null, 204);
    }
    if (path === '/v1/me/notification-settings') {
      if (method === 'GET')
        return reply(await s.profile.getNotificationSettings(uid, user.is_anonymous));
      if (method === 'PATCH')
        return reply(
          await s.profile.updateNotificationSettings(
            uid,
            await body(updateNotificationSettingsSchema),
          ),
        );
    }
    if (path === '/v1/notifications/subscribe') {
      if (method === 'POST') {
        await s.notifications.subscribe(uid, await body(pushSubscriptionSchema));
        return reply(null, 204);
      }
      if (method === 'DELETE') {
        const input = await body(z.object({ endpoint: z.string().url() }));
        await s.notifications.unsubscribe(uid, input.endpoint);
        return reply(null, 204);
      }
    }
    const action = path.match(/^\/v1\/notifications\/items\/([^/]+)\/action$/);
    if (action && method === 'POST') {
      const input = await body(z.object({ action: notificationActionSchema }));
      return reply(await s.notifications.handleAction(uid, id(action[1]!), input.action), 201);
    }
    return fail(404, 'NotFoundException', '주소를 찾을 수 없습니다.');
  } catch (error) {
    if (error instanceof z.ZodError)
      return fail(400, 'VALIDATION_FAILED', '요청 형식이 올바르지 않습니다.');
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505')
      return fail(409, 'ConflictException', '같은 이름의 항목이 이미 있어요.');
    if (error instanceof Error && 'getStatus' in error && typeof error.getStatus === 'function')
      return fail(error.getStatus(), error.name, error.message);
    console.error('Backend request failed', error instanceof Error ? error.name : 'database error');
    return fail(500, 'INTERNAL_ERROR', '일시적인 오류가 발생했습니다.');
  }
}
