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
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
}
export function getToken() { return localStorage.getItem('token'); }
export function setAuth({ user, token }) {
  if (user) localStorage.setItem('user', JSON.stringify(user));
  if (token) localStorage.setItem('token', token);
}
export function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  location.href = '/login.html'; // Owen after logout go to login page
}

// index avatar show user info
(function initAvatar() {
  const user = getUser();
  const avatarImg = document.getElementById('avatar-img');
  const avatarText = document.getElementById('avatar-text');
  const logoutBtn = document.getElementById('menu-logout');

  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  if (!user) {
    // not login -> go to login page (or stay here for Owen testing)
    avatarText && (avatarText.textContent = 'Guest');
    return;
  }

  // if user.avatar show image, else show initial
  if (user.avatarUrl) {
    avatarImg.src = user.avatarUrl;
    avatarText.textContent = user.name || user.email;
  } else {
    avatarImg.style.display = 'none';
    const initial = (user.name || user.email || '?').charAt(0).toUpperCase();
    avatarText.textContent = initial + ' · ' + (user.name || user.email);
  }
})();