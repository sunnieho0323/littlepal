// tests/api/memo-api.spec.ts
import { test, expect, request } from '@playwright/test';
import { nowPlusMinutes } from '../helpers';

const DEMO_USER = process.env.DEMO_USER_ID || 'userA';
const OTHER_USER = 'userB';

test.describe('Memo API', () => {
  test('CRUD + claim + expiry + permission', async ({ playwright }) => {
    const ctxA = await playwright.request.newContext({
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      extraHTTPHeaders: { 'x-user-id': DEMO_USER, 'Content-Type':'application/json' }
    });

    // Create
    const createRes = await ctxA.post('/api/memos', { data: {
      subject:'API Test', body:'hello', labels:['inbox'],
      attachments:[{ type:'currency', payload:{ gold: 50 } }],
      expiresAt: nowPlusMinutes(5)
    }});
    expect(createRes.ok()).toBeTruthy();
    const memo = await createRes.json();

    // Read
    const getRes = await ctxA.get(`/api/memos/${memo._id}`);
    expect(getRes.ok()).toBeTruthy();

    // Update（如果你有 update 端點，這裡示意）：
    // const put = await ctxA.put(`/api/memos/${memo._id}`, { data: { subject:'Updated' }});
    // expect(put.ok()).toBeTruthy();

    // Claim（一次性）
    const claim1 = await ctxA.post(`/api/memos/${memo._id}/claim`);
    expect(claim1.ok()).toBeTruthy();
    const claim2 = await ctxA.post(`/api/memos/${memo._id}/claim`);
    expect([409, 400]).toContain(claim2.status()); // already claimed

    // Permission（其他使用者不能讀或刪）
    const ctxB = await playwright.request.newContext({
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      extraHTTPHeaders: { 'x-user-id': OTHER_USER, 'Content-Type':'application/json' }
    });
    const forbiddenGet = await ctxB.get(`/api/memos/${memo._id}`);
    expect([403,404]).toContain(forbiddenGet.status());

    // 刪除（自己的 OK）
    const del = await ctxA.delete(`/api/memos/${memo._id}`);
    expect(del.ok()).toBeTruthy();
  });
});
