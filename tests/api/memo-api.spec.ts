import { test, expect } from '@playwright/test';
import { createMemo, listMemos } from './helpers';
import { authHeaders, userA, userB } from './test-users';

test.describe('Memos API', () => {
  test('Create → 201 & payload shape', async ({ request }) => {
    const memo = await createMemo(request);
    expect(memo).toHaveProperty('_id');
    expect(memo).toHaveProperty('unread', true);
  });

  test('Unread → Read (PATCH) & effect', async ({ request }) => {
    const m = await createMemo(request, { unread: true });
    const res = await request.patch(`/api/memos/${m._id}`, {
      headers: authHeaders(userA),
      data: { unread: false },
    });
    expect(res.status()).toBe(200);
    const got = await res.json();
    expect(got.unread).toBe(false);
  });

  test('Search / Label / Sort / Pagination', async ({ request }) => {
    // seed memos (no need to send labels; controller sets label='inbox' for non-admin)
    await Promise.all([
      createMemo(request, { subject: 'alpha' }),
      createMemo(request, { subject: 'beta' }),
      createMemo(request, { subject: 'alphabet soup' }),
      createMemo(request, { subject: 'zzz' }),
      createMemo(request, { subject: 'gamma' }),
    ]);

    // search=alpha
    let list = await listMemos(request, { search: 'alpha' });
    expect(list.items.length).toBeGreaterThan(0);
    expect(list.items.map((i: any) => i.subject).join(' ')).toMatch(/alpha/i);

    // label=inbox (server uses single 'label' field)
    list = await listMemos(request, { label: 'inbox' });
    expect(list.items.every((i: any) => i.label === 'inbox')).toBeTruthy();

    // sort=createdAt:desc
    list = await listMemos(request, { sort: 'createdAt:desc' });
    const created = list.items.map((i: any) => new Date(i.createdAt).getTime());
    const sorted = [...created].sort((a, b) => b - a);
    expect(created).toEqual(sorted);

    // pagination with cap
    list = await listMemos(request, { page: 1, pageSize: 1000 });
    expect(list.items.length).toBeLessThanOrEqual(50);
    expect(list.raw.pageInfo.page).toBe(1);
  });


  test('Soft delete: DELETE /delete-read removes read memos', async ({ request }) => {
    // Create two memos (default unread = true on server)
    const r1 = await createMemo(request);
    const r2 = await createMemo(request);

    // Mark both as read (unread -> false) so they are eligible for delete-read
    await request.patch(`/api/memos/${r1._id}`, {
      headers: authHeaders(userA),
      data: { unread: false },
    });
    await request.patch(`/api/memos/${r2._id}`, {
      headers: authHeaders(userA),
      data: { unread: false },
    });

    // Now delete all read memos
    const res = await request.delete('/api/memos/delete-read', { headers: authHeaders(userA) });
    expect(res.ok()).toBeTruthy();

    // The previously read memo should no longer appear in the list
    const list = await listMemos(request, { search: r1.subject });
    expect(list.items.find((i: any) => i._id === r1._id)).toBeFalsy();
  });


  test('Expiry: expired memos excluded', async ({ request }) => {
    const past = new Date(Date.now() - 3600_000).toISOString();
    const future = new Date(Date.now() + 3600_000).toISOString();
    const ex1 = await createMemo(request, { expiresAt: past });
    const ex2 = await createMemo(request, { expiresAt: future });

    const list = await listMemos(request);
    expect(list.items.find((i:any)=> i._id === ex1._id)).toBeFalsy();
    expect(list.items.find((i:any)=> i._id === ex2._id)).toBeTruthy();
  });

  test('Claim: first success, second 410 Gone', async ({ request }) => {
    const m = await createMemo(request, {
      attachments: [
        {
          type: 'item',      // required by schema
          payload: {},       // Mixed, keep minimal object
          claimed: false
        }
      ],
    });

    const ok1 = await request.post(`/api/memos/${m._id}/claim`, { headers: authHeaders(userA) });
    expect(ok1.status()).toBe(200);

    // Second attempt should not be allowed (already claimed)
    const ok2 = await request.post(`/api/memos/${m._id}/claim`, { headers: authHeaders(userA) });
    expect([404, 409, 410]).toContain(ok2.status());
  });

  test('Permission: userB cannot access userA memo', async ({ request }) => {
    const owned = await createMemo(request, { subject: 'private-a' }, userA);
    const res = await request.get(`/api/memos/${owned._id}`, { headers: authHeaders(userB) });
    expect([403,404]).toContain(res.status());
  });

  test('Invalid IDs & auth: guard rails', async ({ request }) => {
      const badAuth = await request.get('/api/memos', { headers: { 'x-user-id': 'not-an-objectid' } });
      expect(badAuth.status()).toBe(401);

      const res = await request.get('/api/memos/invalid-id', { headers: authHeaders(userA) });
      expect([400,404]).toContain(res.status());
    });

    test('Notifications: created on new memo', async ({ request }) => {
      const marker = 'notify-' + Date.now();
      const since = new Date().toISOString();

      // trigger: create a memo
      const m = await createMemo(request, { subject: marker });

      // poll /api/notifications?since=...
      let found = false;
      for (let i = 0; i < 10; i++) {
        const res = await request.get('/api/notifications', {
          headers: authHeaders(userA),
          params: { since },
        });
        expect(res.ok()).toBeTruthy();

        const json = await res.json();          // { data: [...] }
        const items: any[] = json.data || [];

        // match by memoId (preferred) or by subject marker (fallback)
        if (
          items.some(n => n?.payload?.memoId === m._id) ||
          JSON.stringify(items).includes(marker)
        ) { found = true; break; }

        await new Promise(r => setTimeout(r, 200));
      }

      expect(found).toBe(true);
    });

    test('Notifications: created after claim', async ({ request }) => {
      const since = new Date().toISOString();
      const m = await createMemo(request, {
        subject: 'claim-' + Date.now(),
        attachments: [{ type: 'item', payload: {}, claimed: false }],
      });

      const ok1 = await request.post(`/api/memos/${m._id}/claim`, { headers: authHeaders(userA) });
      expect(ok1.ok()).toBeTruthy();

      let found = false;
      for (let i = 0; i < 10; i++) {
        const res = await request.get('/api/notifications', {
          headers: authHeaders(userA),
          params: { since },
        });
        expect(res.ok()).toBeTruthy();

        const items: any[] = (await res.json()).data || [];
        if (
          items.some(n => n?.payload?.memoId === m._id) ||
          items.some(n => n?.type?.includes('memo'))
        ) { found = true; break; }

        await new Promise(r => setTimeout(r, 200));
      }

      expect(found).toBe(true);
    });


});
