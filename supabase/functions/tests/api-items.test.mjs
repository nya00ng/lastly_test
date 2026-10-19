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
    {
      allowedOrigins: ['https://my-app.example'],
      today: '2026-10-19',
      async listItems() {
        return null;
      },
    },
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

test('creates an item with the same response shape and cadence defaults', async () => {
  let input;
  const response = await handleApiRequest(
    new Request('https://example.supabase.co/functions/v1/api/v1/items', {
      method: 'POST',
      headers: { authorization: 'Bearer user-jwt', 'content-type': 'application/json' },
      body: JSON.stringify({ name: '책 읽기', cadence: { unit: 'week', interval: 1 } }),
    }),
    {
      allowedOrigins: [],
      today: '2026-10-19',
      async listItems() {
        return [];
      },
      async createItem(_token, parsed) {
        input = parsed;
        return row;
      },
    },
  );
  assert.equal(response.status, 201);
  assert.deepEqual(input, {
    name: '책 읽기',
    cadence: { unit: 'week', interval: 1, weekdays: [], notifyTimeLocal: null },
    cadenceSource: 'user',
    firstDoneOn: undefined,
  });
  assert.equal((await response.json()).name, '책 읽기');
});

test('rejects a future first completion before inserting the item', async () => {
  let inserted = false;
  const response = await handleApiRequest(
    new Request('https://example.supabase.co/functions/v1/api/v1/items', {
      method: 'POST',
      headers: { authorization: 'Bearer user-jwt', 'content-type': 'application/json' },
      body: JSON.stringify({
        name: '책 읽기',
        cadence: { unit: 'week', interval: 1, weekdays: [] },
        firstDoneOn: '2026-10-20',
      }),
    }),
    {
      allowedOrigins: [],
      today: '2026-10-19',
      async listItems() {
        return [];
      },
      async createItem() {
        inserted = true;
        return row;
      },
    },
  );
  assert.equal(response.status, 400);
  assert.equal(inserted, false);
});

test('returns conflict rather than success for an existing active item name', async () => {
  const response = await handleApiRequest(
    new Request('https://example.supabase.co/functions/v1/api/v1/items', {
      method: 'POST',
      headers: { authorization: 'Bearer user-jwt', 'content-type': 'application/json' },
      body: JSON.stringify({ name: '책 읽기', cadence: { unit: 'day', interval: 1 } }),
    }),
    {
      allowedOrigins: [],
      today: '2026-10-19',
      async listItems() {
        return [];
      },
      async createItem() {
        return 'duplicate';
      },
    },
  );
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error.code, 'ConflictException');
});

test('completes one owned active item and returns a reversible log token', async () => {
  const expected = {
    log: {
      id: 'cfc06f3e-79c5-46f8-a0b7-af589d26f1ed',
      itemId: row.id,
      doneOn: '2026-10-19',
      note: null,
      gapDays: null,
      createdAt: '2026-10-19T00:00:00Z',
    },
    itemId: row.id,
    itemName: row.name,
    nextDueOn: '2026-10-26',
    undoToken: 'cfc06f3e-79c5-46f8-a0b7-af589d26f1ed',
  };
  const response = await handleApiRequest(
    new Request(`https://example.supabase.co/functions/v1/api/v1/items/${row.id}/complete`, {
      method: 'POST',
      headers: { authorization: 'Bearer user-jwt' },
    }),
    {
      allowedOrigins: [],
      today: '2026-10-19',
      async listItems() {
        return [];
      },
      async completeItem(token, id, today) {
        assert.equal(token, 'user-jwt');
        assert.equal(id, row.id);
        assert.equal(today, '2026-10-19');
        return expected;
      },
    },
  );
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), expected);
});

test('does not create a completion for another user or an archived item', async () => {
  let attempted = false;
  const response = await handleApiRequest(
    new Request(`https://example.supabase.co/functions/v1/api/v1/items/${row.id}/complete`, {
      method: 'POST',
      headers: { authorization: 'Bearer user-jwt' },
    }),
    {
      allowedOrigins: [],
      today: '2026-10-19',
      async listItems() {
        return [];
      },
      async completeItem() {
        attempted = true;
        return 'not-found';
      },
    },
  );
  assert.equal(response.status, 404);
  assert.equal(attempted, true);
});

test('undoes only the authenticated user log and returns no response body', async () => {
  const undoToken = 'cfc06f3e-79c5-46f8-a0b7-af589d26f1ed';
  let received;
  const response = await handleApiRequest(
    new Request('https://example.supabase.co/functions/v1/api/v1/logs/undo', {
      method: 'POST',
      headers: { authorization: 'Bearer user-jwt', 'content-type': 'application/json' },
      body: JSON.stringify({ undoToken }),
    }),
    {
      allowedOrigins: [],
      today: '2026-10-19',
      async listItems() {
        return [];
      },
      async undoLog(token, id) {
        received = { token, id };
      },
    },
  );
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
  assert.deepEqual(received, { token: 'user-jwt', id: undoToken });
});

test('rejects a missing undo token without touching logs', async () => {
  let deleted = false;
  const response = await handleApiRequest(
    new Request('https://example.supabase.co/functions/v1/api/v1/logs/undo', {
      method: 'POST',
      headers: { authorization: 'Bearer user-jwt', 'content-type': 'application/json' },
      body: '{}',
    }),
    {
      allowedOrigins: [],
      today: '2026-10-19',
      async listItems() {
        return [];
      },
      async undoLog() {
        deleted = true;
      },
    },
  );
  assert.equal(response.status, 400);
  assert.equal(deleted, false);
});
