// public/js/memo/memo.page.js
import { memoApi } from './memo.api.js';

const el = {
  list: document.querySelector('[data-memo-list]') || document.getElementById('memo-list'),
  badge: document.querySelector('[data-unread-badge]') || document.getElementById('unread-badge'),
  pagerPrev: document.querySelector('[data-pager-prev]'),
  pagerNext: document.querySelector('[data-pager-next]'),
};

let state = { page: 1, pageSize: 10, sort: 'createdAt', order: 'desc', label: '', unread: undefined };

function tplItem(m) {
  const canClaim = !!(m.attachments && !m.attachments.claimed && !m.expiresAt);
  const claimed = !!(m.attachments && m.attachments.claimed);
  return `
    <li class="collection-item">
      <div>
        <strong>${m.subject}</strong>
        ${m.unread ? '<span class="new badge red" data-badge-caption="unread"></span>' : ''}
        <div class="grey-text text-darken-1">${m.body || ''}</div>
        <div class="grey-text text-lighten-1" style="font-size:12px">
          ${new Date(m.createdAt).toLocaleString()} · label: ${m.label}
        </div>
      </div>
      <div class="secondary-content">
        ${m.attachments ? `
          <button class="btn-small ${claimed ? 'disabled' : ''}" data-claim="${m._id}">
            ${claimed ? 'Claimed' : 'Claim'}
          </button>` : ''
        }
      </div>
    </li>`;
}

function renderList(items) {
  if (!el.list) return;
  if (!items.length) {
    el.list.innerHTML = `<li class="collection-item grey-text">No memos</li>`;
    return;
  }
  el.list.innerHTML = items.map(tplItem).join('');
}

function updateBadge(count) {
  if (!el.badge) return;
  el.badge.textContent = String(count || 0);
}

function renderPager({ page, pageSize, total }) {
  if (el.pagerPrev) {
    el.pagerPrev.toggleAttribute('disabled', page <= 1);
  }
  if (el.pagerNext) {
    const hasNext = page * pageSize < total;
    el.pagerNext.toggleAttribute('disabled', !hasNext);
  }
}

async function load() {
  try {
    const res = await memoApi.list({
      page: state.page,
      pageSize: state.pageSize,
      label: state.label || undefined,
      unread: typeof state.unread === 'boolean' ? state.unread : undefined,
      sort: state.sort,
      order: state.order,
    });
    const { data, pageInfo, unreadCount } = res;   // 👈 取 data/頁碼/徽章
    renderList(data);
    renderPager(pageInfo);
    updateBadge(unreadCount);
  } catch (e) {
    console.error('Load memos failed', e);
    if (el.list) el.list.innerHTML = `<li class="collection-item red-text">Failed to load memos</li>`;
  }
}

document.addEventListener('click', async (ev) => {
  const btn = ev.target.closest('[data-claim]');
  if (!btn) return;
  btn.disabled = true;
  const id = btn.getAttribute('data-claim');
  try {
    await memoApi.claim(id);
  } catch (e) {
    // allow showing error if needed
    console.warn(e.message || e);
  } finally {
    load(); // refresh list & badges after claim
  }
});

if (el.pagerPrev) el.pagerPrev.addEventListener('click', () => { state.page = Math.max(1, state.page - 1); load(); });
if (el.pagerNext) el.pagerNext.addEventListener('click', () => { state.page += 1; load(); });

document.addEventListener('DOMContentLoaded', load);
