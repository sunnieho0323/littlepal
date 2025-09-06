import { api } from '../common/app.js';

export const listMemos = () => api('/api/memos');
export const createMemo = (text) => api('/api/memos', { method:'POST', body: JSON.stringify({ text }) });
export const updateMemo = (id, payload) => api(`/api/memos/${id}`, { method:'PATCH', body: JSON.stringify(payload) });
export const deleteMemo = (id) => api(`/api/memos/${id}`, { method:'DELETE' });
export const completeMemo = (id) => api(`/api/memos/${id}/complete`, { method:'POST' });
export const notifyMemo = (id) => api(`/api/memos/${id}/notify`, { method:'POST' }); // HD: email or socket
