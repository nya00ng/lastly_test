import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import {
  ITEM_COLUMNS,
  parseCreateItem,
  toItem,
  type CreateItemInput,
  type ItemRow,
} from './items.ts';

type Rule = CreateItemInput['cadence'];
type ItemPatch = Partial<Pick<CreateItemInput, 'name' | 'cadence' | 'cadenceSource'>> & {
  status?: 'active' | 'archived';
  snoozedUntil?: string | null;
};
type LogInput = { doneOn?: string; note?: string | null };
type LogRow = {
  id: string;
  item_id: string;
  done_on: string;
  note: string | null;
  created_at: string;
};
const LOG_COLUMNS = 'id, item_id, done_on, note, created_at';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function date(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const ms = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value;
}
function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
export function parseItemPatch(value: unknown): ItemPatch | null {
  if (!object(value)) return null;
  const parsed = parseCreateItem({
    name: 'placeholder',
    cadence: { unit: 'day', interval: 1 },
    ...value,
    firstDoneOn: undefined,
  });
  if (!parsed) return null;
  if (value.status !== undefined && value.status !== 'active' && value.status !== 'archived')
    return null;
  if (value.snoozedUntil !== undefined && value.snoozedUntil !== null && !date(value.snoozedUntil))
    return null;
  const result: ItemPatch = {};
  if (value.name !== undefined) result.name = parsed.name;
  if (value.cadence !== undefined) result.cadence = parsed.cadence;
  if (value.cadenceSource !== undefined) result.cadenceSource = parsed.cadenceSource;
  if (value.status !== undefined) result.status = value.status;
  if (value.snoozedUntil !== undefined) result.snoozedUntil = value.snoozedUntil as string | null;
  return result;
}
export function parseLog(value: unknown, partial: boolean): LogInput | null {
  if (!object(value)) return null;
  if ((!partial || value.doneOn !== undefined) && !date(value.doneOn)) return null;
  if (
    value.note !== undefined &&
    value.note !== null &&
    (typeof value.note !== 'string' || value.note.length > 200)
  )
    return null;
  const result: LogInput = {};
  if (value.doneOn !== undefined) result.doneOn = value.doneOn as string;
  if (value.note !== undefined || !partial) result.note = (value.note ?? null) as string | null;
  return result;
}
const iso = (d: Date) => d.toISOString().slice(0, 10);
const add = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);
export function nextDueOn(
  last: string | null,
  rule: Pick<Rule, 'unit' | 'interval' | 'weekdays'>,
): string | null {
  if (!last) return null;
  const from = new Date(`${last}T00:00:00Z`);
  if (rule.unit === 'month') {
    const target = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + rule.interval, 1));
    const end = new Date(
      Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
    ).getUTCDate();
    target.setUTCDate(Math.min(from.getUTCDate(), end));
    return iso(target);
  }
  if (rule.unit === 'day' || !rule.weekdays.length)
    return iso(add(from, rule.interval * (rule.unit === 'week' ? 7 : 1)));
  const slot = [0, -1, 1, -2, 2, -3, 3]
    .map((k) => add(from, k))
    .find((d) => rule.weekdays.includes(d.getUTCDay()))!;
  const start = add(slot, -((slot.getUTCDay() + 6) % 7));
  const offsets = rule.weekdays.map((d) => (d + 6) % 7).sort((a, b) => a - b);
  return iso(
    offsets.map((d) => add(start, d)).find((d) => d > slot) ??
      add(start, rule.interval * 7 + offsets[0]),
  );
}
export function logEntries(rows: LogRow[]) {
  return rows.map((row, i) => ({
    id: row.id,
    itemId: row.item_id,
    doneOn: row.done_on,
    note: row.note,
    createdAt: row.created_at,
    gapDays: rows[i + 1]
      ? Math.round((Date.parse(row.done_on) - Date.parse(rows[i + 1].done_on)) / 86400000)
      : null,
  }));
}

interface Dependencies {
  today: string;
  allowedOrigins: string[];
  userClient(token: string): Promise<{ client: SupabaseClient; userId: string } | null>;
}

/** null means this module does not own the route. Queries always carry the caller's JWT and user_id. */
export async function handleLifecycle(req: Request, deps: Dependencies): Promise<Response | null> {
  const path = new URL(req.url).pathname;
  const match = path.match(/\/v1\/(items|logs)\/([^/]+)(?:\/(restore|logs))?\/?$/);
  if (!match || (match[1] === 'logs' && match[2] === 'undo') || match[2] === 'search') return null;
  const [, resource, id, action] = match;
  if (resource === 'logs' && action) return null;
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const origin = req.headers.get('origin');
  if (origin && deps.allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    headers.set('Access-Control-Allow-Headers', 'authorization, apikey, content-type');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  }
  const reply = (data: unknown, status = 200) =>
    new Response(status === 204 ? null : JSON.stringify(data), { status, headers });
  const fail = (status: number, code: string, message: string) =>
    reply({ error: { code, message } }, status);
  if (req.method === 'OPTIONS') return reply(null, 204);
  const methods =
    resource === 'logs'
      ? ['PATCH', 'DELETE']
      : action === 'restore'
        ? ['POST']
        : action === 'logs'
          ? ['GET', 'POST']
          : ['PATCH', 'DELETE'];
  if (!methods.includes(req.method))
    return fail(405, 'MethodNotAllowedException', '아직 지원하지 않는 요청입니다.');
  const token = req.headers.get('authorization');
  if (!token?.startsWith('Bearer '))
    return fail(401, 'UnauthorizedException', '인증이 필요합니다.');
  try {
    const auth = await deps.userClient(token.slice(7));
    if (!auth) return fail(401, 'UnauthorizedException', '세션이 만료되었습니다.');
    if (!uuid.test(id)) return fail(400, 'BadRequestException', 'ID가 올바르지 않습니다.');
    const { client, userId } = auth;
    const missing = () => fail(404, 'NotFoundException', '항목 또는 기록을 찾을 수 없습니다.');
    const check = (error: unknown) => {
      if (error) throw error;
    };
    const ownedItems = () =>
      client.from('items').select(ITEM_COLUMNS).eq('user_id', userId).eq('id', id);
    if (resource === 'logs') {
      if (req.method === 'DELETE') {
        const { error } = await client
          .from('item_logs')
          .delete()
          .eq('user_id', userId)
          .eq('id', id);
        check(error);
        return reply(null, 204);
      }
      const input = parseLog(await req.json().catch(() => null), true);
      if (!input) return fail(400, 'VALIDATION_FAILED', '요청 형식이 올바르지 않습니다.');
      if (input.doneOn && input.doneOn > deps.today)
        return fail(400, 'BadRequestException', '오늘 이후 날짜로는 기록할 수 없어요.');
      const patch: Record<string, unknown> = {};
      if (input.doneOn !== undefined) patch.done_on = input.doneOn;
      if (input.note !== undefined) patch.note = input.note;
      const query = Object.keys(patch).length
        ? client.from('item_logs').update(patch).select(LOG_COLUMNS)
        : client.from('item_logs').select(LOG_COLUMNS);
      const { data, error } = await query.eq('user_id', userId).eq('id', id).maybeSingle();
      check(error);
      return data ? reply(logEntries([data])[0]) : missing();
    }
    if (req.method === 'DELETE') {
      const { error } = await client
        .from('items')
        .update({ status: 'archived' })
        .eq('user_id', userId)
        .eq('id', id);
      check(error);
      return reply(null, 204);
    }
    const { data: current, error: readError } = await (
      action === 'restore' ? ownedItems() : ownedItems().eq('status', 'active')
    ).maybeSingle();
    check(readError);
    if (!current) return missing();
    if (action === 'logs') {
      if (req.method === 'GET') {
        const { data, error } = await client
          .from('item_logs')
          .select(LOG_COLUMNS)
          .eq('user_id', userId)
          .eq('item_id', id)
          .order('done_on', { ascending: false })
          .limit(20);
        check(error);
        return reply(logEntries(data ?? []));
      }
      const input = parseLog(await req.json().catch(() => null), false);
      if (!input) return fail(400, 'VALIDATION_FAILED', '요청 형식이 올바르지 않습니다.');
      if (input.doneOn! > deps.today)
        return fail(400, 'BadRequestException', '오늘 이후 날짜로는 기록할 수 없어요.');
      const { data, error } = await client
        .from('item_logs')
        .insert({
          user_id: userId,
          item_id: id,
          done_on: input.doneOn,
          note: input.note,
          source: 'manual',
        })
        .select(LOG_COLUMNS)
        .single();
      check(error);
      return reply(logEntries([data!])[0], 201);
    }
    let patch: Record<string, unknown> = { status: 'active' };
    if (action !== 'restore') {
      const input = parseItemPatch(await req.json().catch(() => null));
      if (!input) return fail(400, 'VALIDATION_FAILED', '요청 형식이 올바르지 않습니다.');
      patch = {};
      const name = input.name?.trim();
      if (name) {
        patch.name = name;
        if (name !== current.name) patch.name_embedding = null;
      }
      if (input.status !== undefined) patch.status = input.status;
      if (input.cadenceSource !== undefined) patch.cadence_source = input.cadenceSource;
      if (input.cadence)
        Object.assign(patch, {
          cadence_unit: input.cadence.unit,
          cadence_interval: input.cadence.interval,
          cadence_weekdays: input.cadence.weekdays,
          notify_time: input.cadence.notifyTimeLocal,
          cadence_source: input.cadenceSource ?? 'user',
        });
      if (input.snoozedUntil !== undefined) {
        patch.snoozed_until = input.snoozedUntil;
        patch.next_due_on =
          input.snoozedUntil ??
          nextDueOn(
            current.last_done_on,
            input.cadence ?? {
              unit: current.cadence_unit,
              interval: current.cadence_interval,
              weekdays: current.cadence_weekdays ?? [],
            },
          );
      }
    }
    if (!Object.keys(patch).length) return reply(toItem(current as ItemRow, deps.today));
    let update = client.from('items').update(patch).eq('user_id', userId).eq('id', id);
    if (action !== 'restore') update = update.eq('status', 'active');
    const { data, error } = await update.select(ITEM_COLUMNS).maybeSingle();
    if (error?.code === '23505')
      return fail(409, 'ConflictException', '같은 이름의 항목이 이미 있어요.');
    check(error);
    if (!data) return missing();
    return action === 'restore' ? reply(null, 204) : reply(toItem(data as ItemRow, deps.today));
  } catch (cause) {
    console.error('Lifecycle request failed', cause);
    return fail(500, 'INTERNAL_ERROR', '일시적인 오류가 발생했습니다.');
  }
}
