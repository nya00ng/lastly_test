import { createClient } from 'jsr:@supabase/supabase-js@2';
import { handleBackend } from '../_shared/backend.js';

const required = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};
const url = required('SUPABASE_URL');
const publicKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}');
const key = publicKeys.default ?? required('SUPABASE_ANON_KEY');
const draftSecret = required('DRAFT_TOKEN_SECRET');
const allowedOrigins = (Deno.env.get('CORS_ORIGIN') ?? 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

Deno.serve((req) =>
  handleBackend(req, {
    allowedOrigins,
    draftSecret,
    vapidPublicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
    async authenticate(token: string) {
      const client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data, error } = await client.auth.getUser(token);
      return error || !data.user ? null : { client, user: data.user };
    },
    async deleteUser(id: string) {
      // Privileged credentials are used only for the already-authenticated caller's deletion.
      const admin = createClient(url, required('SUPABASE_SERVICE_ROLE_KEY'), {
        auth: { persistSession: false },
      });
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) throw error;
    },
  }),
);
