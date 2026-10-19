// Explicit opt-in: creates two anonymous test users and removes only this run's items.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
if (process.env.LASTLY_LIVE_TEST !== 'ovcexehchfxqibspbsyp')
  throw Error('Set LASTLY_LIVE_TEST to the personal project ref to run');
const url = 'https://ovcexehchfxqibspbsyp.supabase.co';
const key = 'sb_publishable_7EYMkNv07La9fQWx8moAAw_qCxMVr1s';
const sessions = [];
for (let i = 0; i < 2; i++) {
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw error;
  sessions.push({ client, token: data.session.access_token, user: data.user.id });
}
async function call(path, method = 'GET', body, owner = 0, status = 200) {
  const response = await fetch(`${url}/functions/v1/api/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      authorization: `Bearer ${sessions[owner].token}`,
      'content-type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  assert.equal(response.status, status, `${method} ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}
const ids = [];
try {
  const name = `smoke-${crypto.randomUUID()}`;
  const item = await call(
    'items',
    'POST',
    { name, cadence: { unit: 'week', interval: 1 } },
    0,
    201,
  );
  ids.push(item.id);
  const path = `items/${item.id}`;
  await call(path, 'PATCH', { name: 'forbidden' }, 1, 404);
  const renamed = await call(path, 'PATCH', { name: ` ${name}-renamed ` });
  assert.equal(renamed.name, `${name}-renamed`);
  const log = await call(`${path}/logs`, 'POST', { doneOn: '2026-10-01', note: 'first' }, 0, 201);
  await call(`${path}/logs`, 'POST', { doneOn: '2026-10-10' }, 0, 201);
  const history = await call(`${path}/logs`);
  assert.equal(history.length, 2);
  assert.equal(history[0].gapDays, 9);
  await call(`${path}/logs`, 'GET', undefined, 1, 404);
  await call(`logs/${log.id}`, 'PATCH', { note: 'forbidden' }, 1, 404);
  await call(`logs/${log.id}`, 'DELETE', undefined, 1, 204);
  assert.equal((await call(`${path}/logs`)).length, 2);
  await call(`logs/${log.id}`, 'PATCH', { doneOn: '2026-10-12', note: null });
  let current = (await call('items')).find((x) => x.id === item.id);
  assert.equal(current.lastDoneOn, '2026-10-12');
  assert.equal(current.nextDueOn, '2026-10-19');
  await call(path, 'PATCH', { snoozedUntil: '2026-11-01' });
  current = await call(path, 'PATCH', { snoozedUntil: null });
  assert.equal(current.nextDueOn, '2026-10-19');
  await call(path, 'DELETE', undefined, 0, 204);
  assert.ok(!(await call('items')).some((x) => x.id === item.id));
  await call(`${path}/logs`, 'GET', undefined, 0, 404);
  await call(`${path}/logs`, 'POST', { doneOn: '2026-10-01' }, 0, 404);
  await call(path, 'PATCH', { name: 'archived edit' }, 0, 404);
  await call(`${path}/restore`, 'POST', undefined, 1, 404);
  const conflict = await call(
    'items',
    'POST',
    { name: renamed.name, cadence: { unit: 'day', interval: 1 } },
    0,
    201,
  );
  ids.push(conflict.id);
  await call(`${path}/restore`, 'POST', undefined, 0, 409);
  await call(`items/${conflict.id}`, 'DELETE', undefined, 0, 204);
  await call(`${path}/restore`, 'POST', undefined, 0, 204);
  assert.equal((await call(`${path}/logs`)).length, 2);
  await call(`logs/${log.id}`, 'DELETE', undefined, 0, 204);
  current = (await call('items')).find((x) => x.id === item.id);
  assert.equal(current.logCount, 1);
  assert.equal(current.lastDoneOn, '2026-10-10');
  console.log(
    'PASS: rename, history, edit/delete, schedule recomputation, archive/restore, duplicate conflict, cross-user isolation',
  );
} finally {
  if (ids.length) {
    const { data, error } = await sessions[0].client
      .from('items')
      .delete()
      .eq('user_id', sessions[0].user)
      .in('id', ids)
      .select('id');
    if (error) throw error;
    assert.equal(data.length, ids.length);
    console.log(
      `Cleaned ${data.length} test items and their cascading logs. Two empty anonymous auth users remain.`,
    );
  }
}
