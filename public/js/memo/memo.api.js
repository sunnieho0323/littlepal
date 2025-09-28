// public/js/memo/memo.api.js
const API = (p)=> `/api${p}`;

function getHeaders() {
  const h = { 'Content-Type':'application/json' };
  const token = localStorage.getItem('jwt');
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (window.DEMO_USER_ID) h['x-user-id'] = window.DEMO_USER_ID;
  return h;
}

export async function listMemos(params = {}) {
  const q = new URLSearchParams();
  const {
    page=1, pageSize=10, label, unread, sort='createdAt', order='desc', includeExpired
  } = params;
  q.set('page', page); q.set('pageSize', pageSize);
  q.set('sort', sort); q.set('order', order);
  if (label) q.set('label', label);
  if (typeof unread === 'boolean') q.set('unread', String(unread));
  if (includeExpired) q.set('includeExpired', 'true');
  const res = await fetch(API(`/memos?${q.toString()}`), { headers: getHeaders() });
  if (!res.ok) throw new Error(`listMemos failed: ${res.status}`);
  return res.json();
}

export async function getMemo(id) {
  const res = await fetch(API(`/memos/${id}`), { headers: getHeaders() });
  if (!res.ok) throw new Error(`getMemo failed: ${res.status}`);
  return res.json();
}

export async function createMemo({ subject, body='', label='inbox', attachments=[], expiresAt=null, recipientId }) {
  const payload = { subject, body, label, attachments, expiresAt };
  const path = recipientId ? '/memos/send' : '/memos';
  if (recipientId) payload.recipientId = recipientId;

  const res = await fetch(API(path), { method:'POST', headers:getHeaders(), body: JSON.stringify(payload) });
  const data = await res.json().catch(()=> ({}));
  if (!res.ok) throw new Error(data.message || data.code || `createMemo failed: ${res.status}`);
  return data;
}

export async function claimMemo(id) {
  const res = await fetch(API(`/memos/${id}/claim`), { method:'POST', headers: getHeaders() });
  const data = await res.json().catch(()=> ({}));
  if (!res.ok) throw new Error(data.message || data.code || `claim failed: ${res.status}`);
  return data;
}

export async function deleteMemoApi(id) {
  const res = await fetch(API(`/memos/${id}`), { method:'DELETE', headers: getHeaders() });
  if (!res.ok && res.status !== 204) {
    const txt = await res.text().catch(()=> '');
    throw new Error(`delete failed: ${res.status} ${txt}`);
  }
}
