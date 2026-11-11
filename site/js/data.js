export async function loadData(name) {
  const response = await fetch(new URL(`../data/${name}.json`, import.meta.url));
  if (!response.ok) throw new Error(`Impossibile caricare ${name}: ${response.status}`);
  return response.json();
}

export function element(tag, text = '', className = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function searchText(text) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

export function cardImage(card) {
  const image = element('img');
  image.src = `images/${card.id}.webp`;
  image.alt = `${card.name} — ${card.ability}`;
  image.width = 320;
  image.height = 346;
  image.loading = 'lazy';
  return image;
}
