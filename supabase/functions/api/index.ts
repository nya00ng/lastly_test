import { createClient } from 'jsr:@supabase/supabase-js@2';

import { handleApiRequest } from './handler.ts';
import { handleLifecycle } from './lifecycle.ts';
import {
  ITEM_COLUMNS,
  type CompleteItemResult,
  type CreateItemInput,
  type ItemRow,
} from './items.ts';

const projectUrl = Deno.env.get('SUPABASE_URL');
const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}') as Record<
  string,
  string
>;
const apiKey = publishableKeys.default ?? Deno.env.get('SUPABASE_ANON_KEY');
const allowedOrigins = (Deno.env.get('CORS_ORIGIN') ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function todayInSeoul(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

async function userClient(token: string) {
  if (!projectUrl || !apiKey) throw new Error('Supabase project environment is incomplete');
  const client = createClient(projectUrl, apiKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: auth, error } = await client.auth.getUser(token);
  return error || !auth.user ? null : { client, userId: auth.user.id };
}

async function insertItem(
  token: string,
  input: CreateItemInput,
): Promise<ItemRow | 'duplicate' | null> {
  const auth = await userClient(token);
  if (!auth) return null;

  const { data: existing, error: lookupError } = await auth.client
    .from('items')
    .select('id')
    .eq('user_id', auth.userId)
    .eq('name', input.name)
    .eq('status', 'active')
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return 'duplicate';

  const { data: created, error: insertError } = await auth.client
    .from('items')
    .insert({
      user_id: auth.userId,
      name: input.name,
      cadence_unit: input.cadence.unit,
      cadence_interval: input.cadence.interval,
      cadence_weekdays: input.cadence.weekdays,
      notify_time: input.cadence.notifyTimeLocal,
      cadence_source: input.cadenceSource,
    })
    .select(ITEM_COLUMNS)
    .single();
  if (insertError?.code === '23505') return 'duplicate';
  if (insertError) throw insertError;
  if (!input.firstDoneOn) return created as ItemRow;

  const { error: logError } = await auth.client.from('item_logs').insert({
    user_id: auth.userId,
    item_id: created.id,
    done_on: input.firstDoneOn,
    note: null,
    source: 'manual',
  });
  if (logError) throw logError;

  // 기록 트리거가 다음 예정일과 횟수를 갱신한 뒤 다시 읽는다.
  const { data: refreshed, error: readError } = await auth.client
    .from('items')
    .select(ITEM_COLUMNS)
    .eq('id', created.id)
    .eq('user_id', auth.userId)
    .single();
  if (readError) throw readError;
  return refreshed as ItemRow;
}

async function completeItem(
  token: string,
  itemId: string,
  today: string,
): Promise<CompleteItemResult | 'not-found' | null> {
  const auth = await userClient(token);
  if (!auth) return null;

  const { data: item, error: itemError } = await auth.client
    .from('items')
    .select('id, name')
    .eq('id', itemId)
    .eq('user_id', auth.userId)
    .eq('status', 'active')
    .maybeSingle();
  if (itemError) throw itemError;
  if (!item) return 'not-found';

  const { data: log, error: logError } = await auth.client
    .from('item_logs')
    .insert({ user_id: auth.userId, item_id: itemId, done_on: today, note: null, source: 'manual' })
    .select('id, item_id, done_on, note, created_at')
    .single();
  if (logError) throw logError;

  const { data: refreshed, error: readError } = await auth.client
    .from('items')
    .select('name, next_due_on')
    .eq('id', itemId)
    .eq('user_id', auth.userId)
    .single();
  if (readError) throw readError;

  return {
    log: {
      id: log.id,
      itemId: log.item_id,
      doneOn: log.done_on,
      note: log.note,
      gapDays: null,
      createdAt: log.created_at,
    },
    itemId,
    itemName: refreshed.name,
    nextDueOn: refreshed.next_due_on,
    undoToken: log.id,
  };
}

async function undoLog(token: string, undoToken: string): Promise<void | null> {
  const auth = await userClient(token);
  if (!auth) return null;
  const { error } = await auth.client
    .from('item_logs')
    .delete()
    .eq('id', undoToken)
    .eq('user_id', auth.userId);
  if (error) throw error;
}

Deno.serve(
  async (req) =>
    (await handleLifecycle(req, { allowedOrigins, today: todayInSeoul(), userClient })) ??
    handleApiRequest(req, {
      allowedOrigins,
      today: todayInSeoul(),
      async listItems(token) {
        const auth = await userClient(token);
        if (!auth) return null;

        // 사용자 JWT로 쿼리하므로 RLS가 적용된다. user_id도 명시해 범위를 좁힌다.
        const { data, error } = await auth.client
          .from('items')
          .select(ITEM_COLUMNS)
          .eq('user_id', auth.userId)
          .eq('status', 'active')
          .order('next_due_on', { ascending: true, nullsFirst: true });
        if (error) throw error;
        return (data ?? []) as ItemRow[];
      },
      createItem: insertItem,
      completeItem,
      undoLog,
    }),
);
