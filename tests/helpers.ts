// tests/helpers.ts
import { APIRequestContext, Page, expect } from '@playwright/test';

export async function seedMemo(request: APIRequestContext, payload: any, token?: string, demoUserId?: string) {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (demoUserId) headers['x-user-id'] = demoUserId;
  const res = await request.post('/api/memos', { headers, data: payload });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function loginViaLocalStorage(page: Page, token?: string, demoUserId?: string) {
  await page.addInitScript(({ token, demoUserId }) => {
    if (token) localStorage.setItem('jwt', token);
    if (demoUserId) (window as any).DEMO_USER_ID = demoUserId;
  }, { token, demoUserId });
}

export function nowPlusMinutes(min=10) {
  return new Date(Date.now() + min*60*1000).toISOString();
}
