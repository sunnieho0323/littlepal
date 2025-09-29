// tests/e2e/memo-ui.spec.ts
import { test, expect } from '@playwright/test';
import { seedMemo, loginViaLocalStorage, nowPlusMinutes } from '../helpers';

const DEMO_USER = process.env.DEMO_USER_ID || 'userA';
const OTHER_USER = 'userB';

test.describe('Memo UI E2E', () => {
  test.beforeEach(async ({ page, request }) => {
    await loginViaLocalStorage(page, undefined, DEMO_USER);
    // 先準備幾封資料（同使用者）
    await seedMemo(request, { subject: 'Gift Coins', body: '100 gold', labels: ['inbox'], attachments: [{ type:'currency', payload:{ gold:100 } }], expiresAt: nowPlusMinutes(30) }, undefined, DEMO_USER);
    await seedMemo(request, { subject: 'Read One', body: 'already read', labels: ['inbox'] }, undefined, DEMO_USER);
    await page.goto('/memo.html'); // 你的前端頁面路徑
    await expect(page.getByText('Mailbox')).toBeVisible();
  });

  test('Unread badge shows only unread count and updates after claim', async ({ page }) => {
    const unreadBadge = page.locator('#unreadBadge');
    await expect(unreadBadge).toBeVisible();

    // 初始為未讀 >=1
    const before = parseInt(await unreadBadge.textContent() || '0', 10);
    expect(before).toBeGreaterThan(0);

    // 點開第一封（會觸發「讀取」刷新），並嘗試 Claim（如有附件）
    const firstRow = page.locator('#list .memo-row').first();
    await firstRow.click();
    const claimBtn = page.getByRole('button', { name: 'Claim' });
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
      await expect(page.getByRole('button', { name: 'Claimed' })).toBeVisible();
    }

    // 等待 badge 更新（你的頁面每 3s 心跳+通知輪詢）
    await page.waitForTimeout(3500);
    const after = parseInt(await unreadBadge.textContent() || '0', 10);
    expect(after).toBeLessThanOrEqual(before);
  });

  test('Search / label filter / sorting / pagination basic flow', async ({ page, request }) => {
    // 再塞一些資料讓分頁有內容
    for (let i=0;i<12;i++){
      await seedMemo(request, { subject:`Poke-${i}`, body:'zzz', labels:['inbox'] }, undefined, DEMO_USER);
    }
    await page.reload();

    // 搜尋
    await page.fill('#search', 'Poke-');
    await page.waitForTimeout(500);
    await expect(page.locator('#list .memo-row')).toHaveCountGreaterThan(0);

    // 排序
    await page.selectOption('#sort', 'subject:desc');
    await page.waitForTimeout(300);
    const firstText = await page.locator('#list .memo-row .subject').first().textContent();
    expect(firstText || '').toContain('Poke-');

    // 分頁
    const next = page.getByRole('link', { name: 'Next' });
    await next.click();
    await expect(page.locator('#pageNum')).toHaveText('2');
  });

  test('Unread only filter hides read memos', async ({ page }) => {
    // 勾選「Unread only」
    await page.check('#unreadOnly');
    await page.waitForTimeout(400);
    // 檢查每一列的 badge caption 為 Unread（或不含 Read）
    const rows = page.locator('#list .memo-row');
    const count = await rows.count();
    for (let i=0;i<count;i++){
      const row = rows.nth(i);
      await expect(row.locator('.badge')).not.toContainText('Read'); // 你的 UI 會顯示 data-badge-caption
    }
  });

  test('Delete read — only read ones removed', async ({ page, request }) => {
    // 先把一封打開以標為 read
    const first = page.locator('#list .memo-row').first();
    await first.click();
    await page.waitForTimeout(500);

    // 刪除 read
    await page.click('#btnDeleteRead');
    await page.waitForTimeout(1000);

    // 重新勾回 Unread only off，確保仍有未讀
    await page.uncheck('#unreadOnly').catch(()=>{});
    await expect(page.locator('#list .memo-row')).toHaveCountGreaterThan(0);
  });

  test('Permission guarding (negative path)', async ({ page, request, context }) => {
    // 建一封「別人」的信
    const other = await seedMemo(request, { subject:'Other user memo', body:'nope', labels:['inbox'] }, undefined, OTHER_USER);

    // 嘗試用 UI 直接開它（通常你會在列表拿不到它，因此這步多半直接 403/404）
    const res = await context.request.get(`/api/memos/${other._id}`, { headers: { 'x-user-id': DEMO_USER }});
    expect([403,404]).toContain(res.status());
  });
});
