import { APIRequestContext, expect } from '@playwright/test';
import { authHeaders, userA } from './test-users';

export async function createMemo(request: APIRequestContext, data: any = {}, user = userA) {
  const payload = {
    subject: 'T-' + Math.random().toString(36).slice(2, 8),
    body: 'Body',
    unread: true,
    labels: ['inbox'],
    ...data,
  };
  const res = await request.post('/api/memos', { headers: authHeaders(user), data: payload });
  expect([200, 201]).toContain(res.status());
  const json = await res.json();
  return json; // { _id, subject, ... }
}

export async function listMemos(request: APIRequestContext, params: Record<string, any> = {}, user = userA) {
  const res = await request.get('/api/memos', { headers: authHeaders(user), params });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  const items = Array.isArray(json) ? json : (json.items || json.data || json.results || []);
  return { items, raw: json, status: res.status() };
}

