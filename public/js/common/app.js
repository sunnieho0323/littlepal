// using fetch to call backend API with JSON and auth token
export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? null : res.json();
}

// simple toast function using Materialize CSS or fallback to alert
export function toast(msg) {
  if (window.M?.toast) M.toast({ html: msg });
  else alert(msg);
}

// Token / user information（Owen login page localStorage）
export function getUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) return user;
    const raw = localStorage.getItem('lp_user');
    if (!raw) return null;

    const obj = (raw[0] === '{') ? JSON.parse(raw) : { email: raw };
    return {
      id: obj.id || obj._id || undefined,
      email: obj.email || '',
      role: obj.role || 'user',
      avatarUrl: obj.avatarUrl
    };
  } catch { return null; }
}
export function getToken() { return localStorage.getItem('token'); }
export function setAuth({ user, token }) {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  if (token) localStorage.setItem('token', token);
}
export function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('lp_user');
  location.replace('/login.html'); // Owen after logout go to login page
}

// index avatar show user info
function renderAvatar() {
  const user = getUser();
  const avatarImg = document.getElementById('avatar-img');
  const avatarText = document.getElementById('avatar-text');
  const logoutBtn = document.getElementById('menu-logout');

  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  if (!user) {
    if (avatarText) avatarText.textContent = 'Guest';
    return;
  }

  const fallbackUrl = '/img/monster_cat.png';
  const url = user.avatarUrl || fallbackUrl;
  if (avatarImg) {
    avatarImg.style.display = '';
    avatarImg.src = url;
  }
  if (avatarText) avatarText.textContent = user.name || user.email;
}

// Render on DOM ready and also when header partial has been injected
document.addEventListener('DOMContentLoaded', renderAvatar);
document.addEventListener('site-header:ready', renderAvatar);