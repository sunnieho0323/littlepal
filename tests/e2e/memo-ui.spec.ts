import { test, expect } from '@playwright/test';
import { userA, userB, admin } from '../test-users';

// Pick a distinct user per browser project to avoid cross-project interference
const userByProject: Record<string, { id: string; email: string; role: string }> = {
  chromium: userA,
  firefox:  userB,
  webkit:   admin,
};

// ---------- shared helpers (single copy only) ----------
function randomObjectId() {
  const hex = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < 24; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

async function primeAuth(page: import('@playwright/test').Page, user: { id: string; email: string; role: string }) {
  // Pre-auth local storage (UI reads from lp_user)
  await page.addInitScript((u) => {
    localStorage.setItem('lp_user', JSON.stringify(u));
  }, user);

  // Inject auth headers into in-page fetch
  await page.addInitScript((headers) => {
    const orig = window.fetch;
    window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
      const h = new Headers(init?.headers || {});
      h.set('x-user-id',    (headers as any).id);
      h.set('x-user-email', (headers as any).email);
      h.set('x-user-role',  (headers as any).role);
      return orig(input, { ...init, headers: h });
    };
  }, user);
}

// Single place that really "boots" the page (first navigation + waits)
async function boot(page: import('@playwright/test').Page, user?: { id: string; email: string; role: string }) {
  const u = user ?? (userByProject[test.info().project.name] || userA);
  await primeAuth(page, u);
  await page.goto('/memo.html');
  await page.waitForLoadState('networkidle'); // allow client inits to settle
  await page.waitForSelector('#list', { state: 'visible' });
}

// ============ NORMAL UI FLOWS ============
test.describe('Mailbox UI @ui', () => {
  test('Create memo via modal', async ({ page }) => {
    await boot(page);

    const createBtn = page.getByTestId('create-btn');
    await createBtn.waitFor({ state: 'visible' });
    await createBtn.click();

    const subject = `UI test subject ${Date.now()}`;
    await page.getByLabel(/subject/i).or(page.locator('#subject')).fill(subject);
    await page.getByLabel(/body/i).or(page.locator('#body')).fill('UI test body');

    const saveBtn = page.getByRole('button', { name: /save|send/i })
      .or(page.locator('#btnSubmit'))
      .or(page.locator('#saveBtn'));
    await saveBtn.click();

    // Wait for list reload then assert the new row appears exactly once
    await page.waitForResponse(r => r.url().includes('/api/memos?') && r.request().method() === 'GET');
    const newRow = page.locator('.memo-item').filter({ hasText: subject });
    await expect(newRow).toHaveCount(1);
    await expect(newRow.first()).toBeVisible();
  });

  test('Unread badge updates', async ({ page }) => {
    await boot(page);

    const badge = page.getByTestId('unread-badge').or(page.locator('#unreadBadge'));
    await badge.waitFor();

    const initial = parseInt((await badge.textContent()) || '0', 10);

    await page.getByTestId('create-btn').click();
    const subject = `Unread badge test ${Date.now()}`;
    await page.getByLabel(/subject/i).or(page.locator('#subject')).fill(subject);
    await page.getByLabel(/body/i).or(page.locator('#body')).fill('...');

    const saveBtn = page.getByRole('button', { name: /save|send/i })
      .or(page.locator('#btnSubmit'))
      .or(page.locator('#saveBtn'));
    await saveBtn.click();

    // Wait for a successful list reload after creation
    await page.waitForResponse(r => r.url().includes('/api/memos?') && r.request().method() === 'GET');

    // Badge is updated via polling; assert it increased by >= 1
    await expect.poll(async () => {
      const txt = await badge.textContent();
      return parseInt(txt || '0', 10);
    }, { timeout: 10000, message: 'unread badge should increase by at least 1' })
    .toBeGreaterThanOrEqual(initial + 1);
  });

  test('Claim button updates state', async ({ page, request }) => {
    const u = userByProject[test.info().project.name] || userA;
    await boot(page, u);

    const subject = `Claimable ${Date.now()}`;
    const res = await request.post('/api/memos', {
      data: { subject, body: 'has claimable attachment', attachments: [{ type: 'heart', payload: { heart: 1 } }] },
      headers: { 'Content-Type': 'application/json', 'x-user-id': u.id, 'x-user-email': u.email, 'x-user-role': u.role }
    });
    expect(res.ok()).toBeTruthy();

    await page.waitForResponse(r => r.url().includes('/api/memos?') && r.request().method() === 'GET');
    const row = page.locator('.memo-item', { hasText: subject });
    await expect(row).toBeVisible();

    const claimBtn = row.locator('.btn', { hasText: /claim/i }).first();
    await claimBtn.click();
    await expect(claimBtn).toHaveText(/claimed/i);
  });
});

// ============ EMPTY / ERROR / LOADING ============
test.describe('Mailbox UI @ui (empty + error/loading)', () => {
  test('Empty via intercept: shows empty placeholder', async ({ page }) => {
    // Install intercept BEFORE first navigation so the very first list call is captured
    await page.route('**/api/memos**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pageInfo: { page: 1, pageSize: 10, total: 0, hasNext: false },
        }),
      });
    });

    await boot(page); // first /api/memos is intercepted above

    await expect(page.locator('#list')).toContainText('Your mailbox is empty');
    await expect(page.locator('#pageNum')).toHaveText('1');
    await expect(page.locator('#prevLi')).toHaveClass(/disabled/);
    await expect(page.locator('#nextLi')).toHaveClass(/disabled/);

    await page.unroute('**/api/memos**');
  });

  test('Empty state: brand new user sees empty placeholder', async ({ page }) => {
    // Use a brand-new user so this account has no memos
    const newUser = { id: randomObjectId(), email: `empty-${Date.now()}@example.com`, role: 'user' };
    await boot(page, newUser);

    await expect(page.locator('#list')).toContainText('Your mailbox is empty');
    await expect(page.locator('#pageNum')).toHaveText('1');
    await expect(page.locator('#prevLi')).toHaveClass(/disabled/);
    await expect(page.locator('#nextLi')).toHaveClass(/disabled/);
  });

  test('Error/loading: shows error on 500, and Loading... during delay', async ({ page }) => {
    // --- Part A: 500 error on first load ---
    await page.route('**/api/memos**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'boom',
      });
    });

    await boot(page);

    await expect(page.locator('#list')).toContainText(/Failed to load\./i);
    await expect(page.locator('#list .btn-flat')).toHaveText(/Retry/i);

    // Clean the route for the next step
    await page.unroute('**/api/memos**');

    // --- Part B: delay next load to show Loading... then disappear ---
    let delayedOnce = false;
    await page.route('**/api/memos**', async (route) => {
      if (!delayedOnce) {
        delayedOnce = true;
        await new Promise((r) => setTimeout(r, 1200));
      }
      await route.continue();
    });

    await page.reload();

    await expect(page.locator('#list')).toContainText(/Loading\.\.\./i);
    await expect(page.locator('#list')).not.toContainText(/Loading\.\.\./i, { timeout: 10000 });

    const items = await page.locator('.memo-item').count();
    const empty = await page.locator('#list', { hasText: 'Your mailbox is empty' }).count();
    expect(items > 0 || empty > 0).toBeTruthy();

    await page.unroute('**/api/memos**');
  });
});
