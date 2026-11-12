import it from '../locales/it.js';
import en from '../locales/en.js';

const languages = {
  it: { name: 'Italiano', flag: 'it', messages: it },
  en: { name: 'English', flag: 'gb', messages: en },
};
const storageKey = 'nexus-language';
const requested = new URLSearchParams(location.search).get('lang');
const explicitLanguage = Object.hasOwn(languages, requested);
const root = document.documentElement;
export const language = root.lang;
const pluralRules = new Intl.PluralRules(language);

export function t(key, values = {}) {
  return (languages[language].messages[key] ?? it[key] ?? key)
    .replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}

export function plural(key, count) {
  return t(`${key}.${pluralRules.select(count)}`, { count });
}

export function localizedUrl(href) {
  const url = new URL(href, location.href);
  if (explicitLanguage && url.origin === location.origin) url.searchParams.set('lang', language);
  return url.href;
}

for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
for (const node of document.querySelectorAll('[data-i18n-attr]')) {
  const [attribute, key] = node.dataset.i18nAttr.split(':');
  node.setAttribute(attribute, t(key));
}
for (const node of document.querySelectorAll('[data-language-content]')) {
  node.hidden = node.dataset.languageContent !== language;
}
if (root.dataset.title) {
  document.title = `${t(root.dataset.title)} · NEXUS`;
}

const menu = document.querySelector('.language-menu');
if (menu) {
  const summary = menu.querySelector('summary');
  const flag = summary.querySelector('img');
  flag.src = `img_misc/flag-${languages[language].flag}.svg`;
  summary.querySelector('.language-code').textContent = language.toUpperCase();
  summary.setAttribute('aria-label', `${t('language')}: ${languages[language].name}`);
  for (const button of menu.querySelectorAll('[data-language]')) {
    const code = button.dataset.language;
    button.setAttribute('aria-pressed', String(code === language));
    button.addEventListener('click', () => {
      menu.open = false;
      if (code === language) {
        summary.focus();
        return;
      }
      const next = new URL(location.href);
      try {
        localStorage.setItem(storageKey, code);
        next.searchParams.delete('lang');
      } catch {
        next.searchParams.set('lang', code);
      }
      location.assign(next);
    });
  }
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    summary.focus();
  });
}
if (explicitLanguage) {
  for (const link of document.querySelectorAll('a[href]')) link.href = localizedUrl(link.href);
}
root.removeAttribute('data-i18n-pending');
