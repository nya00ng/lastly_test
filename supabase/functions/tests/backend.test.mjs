import test from 'node:test';
import assert from 'node:assert/strict';
import { handleBackend, services } from '../_shared/backend.js';
const deps = {
  allowedOrigins: ['http://localhost:3000'],
  draftSecret: 'test-only-secret',
  authenticate: async () => null,
  deleteUser: async () => {
    throw Error('must not delete');
  },
};
test('every new route rejects missing and invalid user sessions', async () => {
  for (const path of [
    'home/feed',
    'home/calendar',
    'items/search',
    'me',
    'me/export',
    'me/notification-settings',
    'capture/interpret',
  ]) {
    for (const headers of [{}, { authorization: 'Bearer invalid' }]) {
      assert.equal(
        (await handleBackend(new Request(`https://test/v1/${path}`, { headers }), deps)).status,
        401,
      );
    }
  }
});
test('preflight supports browser edits without auth', async () => {
  const response = await handleBackend(
    new Request('https://test/v1/me', {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:3000' },
    }),
    deps,
  );
  assert.equal(response.status, 204);
  assert.match(response.headers.get('access-control-allow-methods'), /PATCH/);
});
test('draft signatures reject tampering and a different account', () => {
  const { draft } = services({}, 'test-only-secret');
  const payload = {
    userId: 'a',
    rawInput: '오늘 책 읽음',
    normalizedName: '책 읽기',
    doneOn: '2026-10-19',
    matchedItemId: null,
    mode: 'text',
    issuedAt: Date.now(),
  };
  const token = draft.sign(payload);
  assert.deepEqual(draft.verify(token, 'a'), payload);
  assert.throws(() => draft.verify(token, 'b'));
  assert.throws(() => draft.verify(`${token}x`, 'a'));
});
