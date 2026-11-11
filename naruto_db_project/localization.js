'use strict';

const TRANSLATIONS = Object.fromEntries(
  Object.entries(LANGUAGE_CATALOGS).map(([code, metadata]) => [code, { ...metadata }])
);
const LOCALIZATION = (() => {
  const loaded = new Set(),
    pending = new Map();
  let initialLanguage = 'en';
  try {
    const raw = sessionStorage.getItem('naruto-ninja-cards.session');
    if (raw && raw.length <= 1_000_000) {
      const code = JSON.parse(raw)?.language;
      if (Object.hasOwn(LANGUAGE_CATALOGS, code)) initialLanguage = code;
    }
  } catch {
    /* Session validation and user feedback remain the app's responsibility. */
  }
  function register(code, catalog) {
    if (!Object.hasOwn(LANGUAGE_CATALOGS, code)) throw Error('Unknown language');
    TRANSLATIONS[code] = catalog;
    loaded.add(code);
  }
  function load(code) {
    if (!Object.hasOwn(LANGUAGE_CATALOGS, code)) return Promise.reject(Error('Unknown language'));
    if (loaded.has(code)) return Promise.resolve();
    if (!pending.has(code))
      pending.set(
        code,
        loadAssetScript(`locales/${code}.js`, { verify: () => loaded.has(code) })
          .then(() => {
            if (!loaded.has(code)) throw Error('Invalid language catalog');
          })
          .catch(error => {
            pending.delete(code);
            throw error;
          })
      );
    return pending.get(code);
  }
  return {
    register,
    load,
    initialLanguage,
    ready: Promise.all([...new Set(['en', initialLanguage])].map(load))
  };
})();
