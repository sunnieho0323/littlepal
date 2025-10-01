// Load shared header partial and initialize dropdown
(async function loadHeader() {
  try {
    const host = document.getElementById('site-header');
    if (!host) return;
    const res = await fetch('/partials/header.html', { cache: 'no-cache' });
    const html = await res.text();
    host.innerHTML = html;
    if (window.M?.Dropdown) {
      const elems = document.querySelectorAll('.dropdown-trigger');
      M.Dropdown.init(elems, { constrainWidth: false, coverTrigger: false, alignment: 'right' });
    }
    // Notify others that header is ready
    document.dispatchEvent(new CustomEvent('site-header:ready'));
  } catch (_) {}
})();


