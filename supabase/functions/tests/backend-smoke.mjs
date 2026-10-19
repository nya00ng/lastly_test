import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
if (process.env.LASTLY_LIVE_TEST !== 'ovcexehchfxqibspbsyp')
  throw Error('Explicit personal-project opt-in required');
const url = 'https://ovcexehchfxqibspbsyp.supabase.co';
const key = 'sb_publishable_7EYMkNv07La9fQWx8moAAw_qCxMVr1s';
const accounts = [];
async function call(path, method = 'GET', body, who = 0, expected = 200) {
  const r = await fetch(`${url}/functions/v1/api/v1/${path}`, {
    method,
    signal: AbortSignal.timeout(25000),
    headers: {
      authorization: `Bearer ${accounts[who].token}`,
      apikey: key,
      'content-type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  assert.equal(r.status, expected, `${method} ${path}: ${text}`);
  return text ? JSON.parse(text) : null;
}
try {
  for (let i = 0; i < 2; i++) {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw error;
    accounts.push({ client, id: data.user.id, token: data.session.access_token });
  }
  const today = (await call('home/feed')).today;
  const name = `검증-${crypto.randomUUID().slice(0, 8)}`;
  const item = await call(
    'items',
    'POST',
    { name, cadence: { unit: 'week', interval: 1 }, firstDoneOn: today },
    0,
    201,
  );
  assert.equal((await call(`items/${item.id}`)).logCount, 1);
  await call(`items/${item.id}`, 'GET', undefined, 1, 404);
  await call(
    `items/${item.id}/logs`,
    'POST',
    { doneOn: '2026-10-01', note: '검색용 메모' },
    0,
    201,
  );
  assert.equal((await call(`items/search?q=${encodeURIComponent(name)}`)).items.length, 1);
  assert.equal((await call(`items/search?q=${encodeURIComponent('검색용')}`)).notes.length, 1);
  const feed = await call('home/feed');
  assert.ok(feed.summary.completedThisWeek >= 1);
  const calendar = await call(`home/calendar?month=${today.slice(0, 7)}`);
  assert.ok(calendar.days[today].some((x) => x.itemId === item.id && x.kind === 'done'));
  await call('home/calendar?month=2026-13', 'GET', undefined, 0, 400);
  const settings = await call('me/notification-settings', 'PATCH', {
    digestTimeLocal: '09:30',
    weekendEnabled: false,
  });
  assert.equal(settings.digestTimeLocal, '09:30');
  assert.equal(settings.weekendEnabled, false);
  await call('me/signup-prompts', 'POST', { prompt: 'records' }, 0, 204);
  assert.ok((await call('me')).signup_prompts_seen.includes('records'));
  const exported = await call('me/export');
  assert.ok(exported.items.every((x) => x.user_id === accounts[0].id));
  assert.equal((await call('me/export', 'GET', undefined, 1)).items.length, 0);
  const parsed = await call(
    'capture/interpret',
    'POST',
    { text: '오늘 책 읽었고 일주일에 한번씩 읽을거야', mode: 'text', referenceDate: today },
    0,
    201,
  );
  assert.equal(parsed.outcome, 'new_item');
  assert.ok(parsed.normalizedName.includes('책'));
  assert.ok(!parsed.normalizedName.includes('일주일'));
  const committed = await call(
    'capture/commit',
    'POST',
    {
      draftToken: parsed.draftToken,
      newItemName: parsed.normalizedName,
      doneOn: today,
      cadence: { unit: 'week', interval: 1 },
    },
    0,
    201,
  );
  assert.equal(committed.itemCreated, true);
  await call(
    'capture/commit',
    'POST',
    { draftToken: parsed.draftToken, itemId: item.id, doneOn: today },
    1,
    400,
  );
  const lookup = await call(
    'capture/interpret',
    'POST',
    {
      text: `${name} 마지막에 언제 했지?`,
      slots: {
        intent: 'query',
        itemName: name,
        daysAgo: 0,
        statedCadenceDays: null,
        confidence: 1,
      },
    },
    0,
    201,
  );
  assert.equal(lookup.outcome, 'answered');
  assert.equal(lookup.answer.itemId, item.id);
  const bad = await accounts[1].client
    .from('item_logs')
    .insert({ user_id: accounts[1].id, item_id: item.id, done_on: today, source: 'manual' });
  assert.ok(bad.error, 'RLS must deny attaching a log to another account item');
  const alias = await accounts[1].client.rpc('bump_item_alias', {
    p_user_id: accounts[0].id,
    p_item_id: item.id,
    p_phrase: 'foreign',
  });
  assert.ok(alias.error, 'RPC must reject spoofed user id');
  await call(`notifications/items/${item.id}/action`, 'POST', { action: 'snooze_3d' }, 0, 201);
  await call(`notifications/items/${item.id}/action`, 'POST', { action: 'complete' }, 1, 404);
  // Synthetic subscription is immediately removed; no notification is sent to it.
  const endpoint = `https://example.invalid/push/${crypto.randomUUID()}`;
  await call(
    'notifications/subscribe',
    'POST',
    { endpoint, keys: { p256dh: 'test-public-key', auth: 'test-auth' } },
    0,
    204,
  );
  assert.equal((await call('me/notification-settings')).pushGranted, true);
  await call('notifications/subscribe', 'DELETE', { endpoint }, 0, 204);
  assert.equal((await call('me/notification-settings')).pushGranted, false);
  console.log(
    'PASS: detail, feed, search, calendar, profile, export, rule interpretation/commit, query, draft ownership, RLS, notification settings/actions/subscriptions',
  );
} finally {
  // These accounts were created by this script only; deletion also tests account cleanup.
  for (let i = 0; i < accounts.length; i++) {
    await call('me', 'DELETE', undefined, i, 204);
    const { data } = await accounts[i].client.auth.getUser(accounts[i].token);
    assert.equal(data.user, null);
  }
  console.log(`Deleted ${accounts.length} temporary accounts and their test data.`);
}
