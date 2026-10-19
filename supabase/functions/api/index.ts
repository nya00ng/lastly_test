import { createClient } from 'jsr:@supabase/supabase-js@2';

import { handleApiRequest } from './handler.ts';
import { ITEM_COLUMNS, type ItemRow } from './items.ts';

const projectUrl = Deno.env.get('SUPABASE_URL');
const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}') as Record<string, string>;
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

Deno.serve((req) =>
  handleApiRequest(req, {
    allowedOrigins,
    today: todayInSeoul(),
    async listItems(token) {
      if (!projectUrl || !apiKey) throw new Error('Supabase project environment is incomplete');
      const authorization = `Bearer ${token}`;
      const client = createClient(projectUrl, apiKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: authorization } },
      });

      const { data: auth, error: authError } = await client.auth.getUser(token);
      if (authError || !auth.user) return null;

      // 사용자 JWT로 쿼리하므로 RLS가 적용된다. user_id도 명시해 범위를 좁힌다.
      const { data, error } = await client
        .from('items')
        .select(ITEM_COLUMNS)
        .eq('user_id', auth.user.id)
        .eq('status', 'active')
        .order('next_due_on', { ascending: true, nullsFirst: true });
      if (error) throw error;
      return (data ?? []) as ItemRow[];
    },
  }),
);
