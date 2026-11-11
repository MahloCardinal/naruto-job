'use strict';

// Source files work with any static server; production URLs are content-addressed.
function assetPath(path) {
  const direct = globalThis.NARUTO_ASSETS?.[path];
  if (direct) return direct;
  const card = /^card_images\/(?:(160|320)\/)?((?:S\d+|ES)_\d+)\.webp$/.exec(path);
  const hashes = card && globalThis.NARUTO_CARD_HASHES?.[card[2]];
  if (hashes)
    return `assets/card_images/${card[1] ? card[1] + '/' : ''}${card[2]}.${hashes[card[1] === '160' ? 1 : card[1] === '320' ? 2 : 0]}.webp`;
  return path;
}
const loadedScripts = new Map();
function loadAssetScript(path, { verify } = {}) {
  if (!loadedScripts.has(path))
    loadedScripts.set(
      path,
      new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = assetPath(path);
        script.onerror = () => {
          loadedScripts.delete(path);
          script.remove();
          reject(Error('Asset unavailable: ' + path));
        };
        script.onload = () => {
          if (verify && !verify()) script.onerror();
          else resolve();
        };
        document.head.append(script);
      })
    );
  return loadedScripts.get(path);
}
const cardImageSizes = {
  card: '(max-width:700px) 160px, 186px',
  mini: '(max-width:700px) 72px, 110px',
  compact: '(max-width:700px) 62px, 90px'
};
function cardImageAttributes(card, size = 'card') {
  const full = assetPath(`card_images/${card.card_key}.webp`);
  const small = assetPath(`card_images/160/${card.card_key}.webp`);
  const medium = assetPath(`card_images/320/${card.card_key}.webp`);
  return `data-card-art="${card.card_key}" src="${size === 'card' ? medium : small}" srcset="${small} 160w, ${medium} 320w, ${full} 600w" sizes="${cardImageSizes[size]}" width="${CARD_ART.width}" height="${CARD_ART.height}" loading="lazy" decoding="async"`;
}

// The dialog first reuses artwork already displayed by the catalog, then swaps in
// the original only after it has decoded. Never replace a visible preview with a
// higher-resolution image that is still loading.
const cardPreviews = new Map(),
  detailArtwork = new Map();
document.addEventListener(
  'load',
  event => {
    const image = event.target,
      key = image.dataset?.cardArt;
    if (key && image.naturalWidth && (cardPreviews.get(key)?.width || 0) <= image.naturalWidth)
      cardPreviews.set(key, { src: image.currentSrc || image.src, width: image.naturalWidth });
  },
  true
);
function dialogImageAttributes(card) {
  const ready = detailArtwork.get(card.card_key),
    preview = cardPreviews.get(card.card_key);
  const src = ready?.decoded
    ? ready.image.src
    : preview?.src || assetPath(`card_images/320/${card.card_key}.webp`);
  return `data-card-art="${card.card_key}" src="${src}" width="${CARD_ART.width}" height="${CARD_ART.height}" loading="eager" decoding="sync" fetchpriority="high"`;
}
async function upgradeDialogArtwork(target, card) {
  const key = card.card_key;
  if (!detailArtwork.has(key)) {
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'high';
    const entry = { image, decoded: false };
    image.src = assetPath(`card_images/${key}.webp`);
    entry.ready = image
      .decode()
      .then(() => {
        entry.decoded = true;
        return image;
      })
      .catch(error => {
        if (detailArtwork.get(key) === entry) detailArtwork.delete(key);
        throw error;
      });
    detailArtwork.set(key, entry);
    // Keep only a few decoded originals, not the full collection in memory.
    while (detailArtwork.size > 8) detailArtwork.delete(detailArtwork.keys().next().value);
  }
  try {
    const image = await detailArtwork.get(key).ready;
    if (target.isConnected && target.closest('dialog')?.open && target.src !== image.src)
      target.src = image.src;
  } catch {
    /* The already visible preview remains usable if the original fails. */
  }
}
