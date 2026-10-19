import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseItemPatch,
  parseLog,
  nextDueOn,
  logEntries,
  handleLifecycle,
} from '../api/lifecycle.ts';

test('partial item edits preserve omitted cadence and reject invalid values', () => {
  assert.deepEqual(parseItemPatch({ name: '책 읽기', user_id: 'other' }), { name: '책 읽기' });
  assert.equal(parseItemPatch({ cadence: { unit: 'day', interval: 0 } }), null);
  assert.equal(parseItemPatch({ status: 'deleted' }), null);
  assert.deepEqual(parseItemPatch({ snoozedUntil: null }), { snoozedUntil: null });
});
test('log edits preserve omitted notes, permit clearing, and validate real dates', () => {
  assert.deepEqual(parseLog({ doneOn: '2026-10-10' }, true), { doneOn: '2026-10-10' });
  assert.deepEqual(parseLog({ note: null }, true), { note: null });
  assert.deepEqual(parseLog({ doneOn: '2026-10-10' }, false), { doneOn: '2026-10-10', note: null });
  assert.equal(parseLog({ doneOn: '2026-02-30' }, false), null);
  assert.equal(parseLog({ note: 'a'.repeat(201) }, true), null);
});
test('resume dates clamp month ends and preserve nearest weekday slots', () => {
  assert.equal(nextDueOn('2026-01-31', { unit: 'month', interval: 1, weekdays: [] }), '2026-02-28');
  assert.equal(
    nextDueOn('2026-10-20', { unit: 'week', interval: 2, weekdays: [1, 4] }),
    '2026-10-22',
  );
  assert.equal(
    nextDueOn('2026-10-23', { unit: 'week', interval: 2, weekdays: [1, 4] }),
    '2026-11-02',
  );
  assert.equal(nextDueOn(null, { unit: 'day', interval: 1, weekdays: [] }), null);
});
test('history maps gaps against the older record', () => {
  const rows = ['2026-10-18', '2026-10-10', '2026-10-01'].map((done_on, id) => ({
    id,
    item_id: 'x',
    done_on,
    note: null,
    created_at: 'now',
  }));
  assert.deepEqual(
    logEntries(rows).map((x) => x.gapDays),
    [8, 9, null],
  );
});
const id = '11111111-1111-4111-8111-111111111111';
test('lifecycle rejects unauthenticated mutations before accessing data', async () => {
  for (const [method, path] of [
    ['PATCH', `items/${id}`],
    ['DELETE', `items/${id}`],
    ['POST', `items/${id}/restore`],
    ['GET', `items/${id}/logs`],
    ['PATCH', `logs/${id}`],
  ]) {
    const res = await handleLifecycle(new Request(`https://test/v1/${path}`, { method }), {
      today: '2026-10-19',
      allowedOrigins: [],
      userClient: async () => {
        throw Error('must not run');
      },
    });
    assert.equal(res.status, 401);
  }
});
test('future log dates are rejected and CORS permits edit/delete', async () => {
  const deps = {
    today: '2026-10-19',
    allowedOrigins: ['http://localhost:3000'],
    userClient: async () => ({ client: {}, userId: 'a' }),
  };
  const res = await handleLifecycle(
    new Request(`https://test/v1/logs/${id}`, {
      method: 'PATCH',
      headers: {
        authorization: 'Bearer test',
        origin: 'http://localhost:3000',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ doneOn: '2026-10-20' }),
    }),
    deps,
  );
  assert.equal(res.status, 400);
  assert.match(res.headers.get('Access-Control-Allow-Methods'), /PATCH/);
  assert.match(res.headers.get('Access-Control-Allow-Methods'), /DELETE/);
});
