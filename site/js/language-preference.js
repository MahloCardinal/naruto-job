(() => {
  const root = document.documentElement;
  let preference = new URLSearchParams(location.search).get('lang');
  if (preference !== 'it' && preference !== 'en') {
    try { preference = localStorage.getItem('nexus-language'); } catch { /* Default to Italian. */ }
  }
  if (preference !== 'en') return;

  root.lang = 'en';
  root.setAttribute('data-i18n-pending', '');
  document.addEventListener('DOMContentLoaded', () => {
    if (!root.hasAttribute('data-i18n-pending')) return;
    root.lang = 'it';
    root.removeAttribute('data-i18n-pending');
  }, { once: true });
})();
