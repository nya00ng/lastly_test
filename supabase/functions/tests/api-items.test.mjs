import assert from 'node:assert/strict';
import test from 'node:test';

import { toItem } from '../api/items.ts';
import { handleApiRequest } from '../api/handler.ts';

const row = {
  id: '1417bd93-c79f-40a6-bd3a-2879c3fbe213',
  name: '책 읽기',
  status: 'active',
  cadence_unit: 'week',
  cadence_interval: 1,
  cadence_weekdays: [0],
  notify_time: '09:30:00',
  cadence_source: 'user',
  last_done_on: '2026-10-18',
  next_due_on: '2026-10-25',
  snoozed_until: null,
  average_interval_days: 7,
  log_count: 3,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-18T00:00:00Z',
};

test('keeps the existing API item shape and date calculations', () => {
  assert.deepEqual(toItem(row, '2026-10-19'), {
    id: row.id,
    name: '책 읽기',
    status: 'active',
    cadence: { unit: 'week', interval: 1, weekdays: [0], notifyTimeLocal: '09:30' },
    cadenceSource: 'user',
    lastDoneOn: '2026-10-18',
    nextDueOn: '2026-10-25',
    snoozedUntil: null,
    daysSinceLastDone: 1,
    daysUntilDue: 6,
    bucket: 'upcoming',
    averageIntervalDays: 7,
    cadenceDrift: null,
    logCount: 3,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
});

test('overdue, undated, and snoozed items stay in their original buckets', () => {
  assert.equal(toItem({ ...row, next_due_on: '2026-10-18' }, '2026-10-19').bucket, 'due');
  assert.equal(toItem({ ...row, next_due_on: null }, '2026-10-19').bucket, 'due');
  assert.equal(toItem({ ...row, snoozed_until: '2026-10-30' }, '2026-10-19').bucket, 'later');
});

test('rejects an unauthenticated list without querying items', async () => {
  let queried = false;
  const response = await handleApiRequest(
    new Request('https://example.supabase.co/functions/v1/api/v1/items'),
    {
      allowedOrigins: ['https://my-app.example'],
      today: '2026-10-19',
      async listItems() {
        queried = true;
        return [row];
      },
    },
  );
  assert.equal(response.status, 401);
  assert.equal(queried, false);
});

test('returns the original list shape after passing the user token', async () => {
  let receivedToken;
  const response = await handleApiRequest(
    new Request('https://example.supabase.co/functions/v1/api/v1/items', {
      headers: { authorization: 'Bearer user-jwt', origin: 'https://my-app.example' },
    }),
    {
      allowedOrigins: ['https://my-app.example'],
      today: '2026-10-19',
      async listItems(token) {
        receivedToken = token;
        return [row];
      },
    },
  );
  assert.equal(receivedToken, 'user-jwt');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://my-app.example');
  assert.equal((await response.json())[0].daysUntilDue, 6);
});

test('denies an invalid token and unrelated browser origins', async () => {
  const response = await handleApiRequest(
    new Request('https://example.supabase.co/functions/v1/api/v1/items', {
      headers: { authorization: 'Bearer invalid', origin: 'https://unrelated.example' },
    }),
    { allowedOrigins: ['https://my-app.example'], today: '2026-10-19', async listItems() { return null; } },
  );
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
});

test('answers allowed browser preflight without invoking authentication or the database', async () => {
  let queried = false;
  const response = await handleApiRequest(
    new Request('https://example.supabase.co/functions/v1/api/v1/items', {
      method: 'OPTIONS',
      headers: {
        origin: 'https://my-app.example',
        'access-control-request-method': 'GET',
        'access-control-request-headers': 'authorization, apikey',
      },
    }),
    {
      allowedOrigins: ['https://my-app.example'],
      today: '2026-10-19',
      async listItems() {
        queried = true;
        return [row];
      },
    },
  );
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://my-app.example');
  assert.match(response.headers.get('Access-Control-Allow-Headers'), /authorization/);
  assert.equal(queried, false);
});
