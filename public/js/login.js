// 显示/隐藏密码
document.getElementById('togglePw').addEventListener('click', () => {
  const pw = document.getElementById('password');
  const isPwd = pw.type === 'password';
  pw.type = isPwd ? 'text' : 'password';
  document.getElementById('togglePw').setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
});

// 登录表单提交
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pw = document.getElementById('password').value;
  const err = document.getElementById('error');
  const btn = document.querySelector('.primary');

  if (!email || !pw) { err.textContent = 'Please enter email and password.'; err.hidden = false; return; }

  try {
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pw })
    });

    const data = await res.json();
    if (!res.ok) {
      err.textContent = data?.message || 'Login failed.';
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = 'Sign in';
      return;
    }

    localStorage.setItem('lp_user', data.user.email);
    window.location.href = '/index.html';
  } catch {
    err.textContent = 'Network error. Please try again.';
    err.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
});
