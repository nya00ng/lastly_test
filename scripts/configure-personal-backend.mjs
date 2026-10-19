import { randomBytes, createECDH } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const ref = 'ovcexehchfxqibspbsyp';
if (process.env.LASTLY_CONFIGURE_PROJECT !== ref)
  throw Error('Explicit personal project opt-in required');
const bin = path.resolve(
  'node_modules/.pnpm/@supabase+cli-windows-x64@2.116.0/node_modules/@supabase/cli-windows-x64/bin/supabase.exe',
);
function cli(args) {
  const result = spawnSync(bin, [...args, '--output-format', 'json', '--agent', 'no'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0)
    throw Error(`Supabase ${args[0]} ${args[1]} failed (output suppressed to protect secrets)`);
  return result.stdout;
}
// Never rotate an existing push key: subscriptions are tied to its public key.
const existing = cli(['secrets', 'list', '--project-ref', ref]);
const alreadyConfigured = existing.includes('VAPID_PRIVATE_KEY');
const cron = randomBytes(32).toString('hex');
const draft = randomBytes(32).toString('hex');
const ecdh = createECDH('prime256v1');
ecdh.generateKeys();
const publicKey = ecdh.getPublicKey().toString('base64url');
const newSecrets = alreadyConfigured
  ? []
  : [
      `DRAFT_TOKEN_SECRET=${draft}`,
      `VAPID_PUBLIC_KEY=${publicKey}`,
      `VAPID_PRIVATE_KEY=${ecdh.getPrivateKey().toString('base64url')}`,
      'VAPID_SUBJECT=https://github.com/nya00ng/lastly_test',
      'CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000',
    ];
cli(['secrets', 'set', '--project-ref', ref, `CRON_SECRET=${cron}`, ...newSecrets]);
const sql = `do $$ begin
if exists(select 1 from vault.secrets where name='cron_secret') then
perform vault.update_secret((select id from vault.secrets where name='cron_secret'), '${cron}');
else perform vault.create_secret('${cron}', 'cron_secret'); end if;
if exists(select 1 from vault.secrets where name='supabase_url') then
perform vault.update_secret((select id from vault.secrets where name='supabase_url'), 'https://${ref}.supabase.co');
else perform vault.create_secret('https://${ref}.supabase.co', 'supabase_url'); end if;
end $$;`;
cli(['db', 'query', '--linked', '--project-ref', ref, sql]);
console.log('Configured draft signing, push keys, cron and Vault in personal project.');
if (!alreadyConfigured) console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`);
