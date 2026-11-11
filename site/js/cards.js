import { cardImage, element, loadData, searchText } from './data.js';

const PAGE_SIZE = 30;
const filters = document.querySelector('#filters');
const search = document.querySelector('#search');
const season = document.querySelector('#season');
const rarity = document.querySelector('#rarity');
const grid = document.querySelector('#cards');
const status = document.querySelector('#status');
const more = document.querySelector('#more');
const dialog = document.querySelector('#card-dialog');
const detail = document.querySelector('#card-detail');

function seasonName(card) {
  return card.season === 'Event' ? 'Event Scroll' : `Season ${card.season}`;
}

function showCard(card) {
  const image = cardImage(card);
  image.loading = 'eager';
  const content = element('div');
  const name = element('h2', card.name);
  name.id = 'card-name';
  content.append(
    element('p', `${card.id} · ${seasonName(card)} · ${card.rarity}`, 'eyebrow'),
    name,
    element('h3', card.ability),
    element('p', `Costo ${card.cost} · Chakra ${card.chakra}`, 'muted'),
    element('p', card.effects.join(' · '), 'effect-labels'),
  );
  card.descriptions.forEach((text, index) => {
    const effect = element('section', '', 'effect');
    effect.append(element('h4', `Livello ${index + 1}`), element('p', text));
    content.append(effect);
  });
  detail.replaceChildren(image, content);
  dialog.showModal();
}

function cardTile(card) {
  const tile = element('button', '', 'card-tile');
  tile.type = 'button';
  const image = cardImage(card);
  image.alt = '';
  tile.append(image, element('strong', card.name), element('span', card.ability), element('small', card.id));
  tile.addEventListener('click', () => showCard(card));
  return tile;
}

async function start() {
  const cards = await loadData('cards');
  const indexed = cards.map(card => ({ card, search: searchText(`${card.name} ${card.ability} ${card.id}`) }));
  for (const value of [...new Set(cards.map(card => card.rarity))].sort()) {
    rarity.add(new Option(value, value));
  }

  let matches = [];
  let shown = 0;
  function appendPage() {
    const tiles = matches.slice(shown, shown + PAGE_SIZE).map(({ card }) => cardTile(card));
    grid.append(...tiles);
    shown += tiles.length;
    more.hidden = shown >= matches.length;
    return tiles[0];
  }

  function applyFilters() {
    const query = searchText(search.value.trim());
    matches = indexed.filter(item => item.search.includes(query)
      && (!season.value || String(item.card.season) === season.value)
      && (!rarity.value || item.card.rarity === rarity.value));
    status.textContent = matches.length ? `${matches.length} carte trovate` : 'Nessuna carta corrisponde ai filtri.';
    shown = 0;
    grid.replaceChildren();
    appendPage();
  }

  search.addEventListener('input', applyFilters);
  season.addEventListener('change', applyFilters);
  rarity.addEventListener('change', applyFilters);
  more.addEventListener('click', () => appendPage()?.focus());
  filters.hidden = false;
  applyFilters();
  if (location.hash === '#search') search.focus();

  const selectedId = new URLSearchParams(location.search).get('card');
  if (selectedId) {
    const selected = cards.find(card => card.id === selectedId);
    if (selected) showCard(selected);
    else status.textContent = `Carta richiesta non trovata. ${status.textContent}`;
  }
}

start().catch(() => { status.textContent = 'Il catalogo non è disponibile. Ricarica la pagina per riprovare.'; });
