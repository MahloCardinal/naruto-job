import { loadData, searchText } from './data.js';
import { cardTile, showCard } from './card-preview.js';
import { plural, t } from './i18n.js';

const PAGE_SIZE = 30;
const filters = document.querySelector('#filters');
const search = document.querySelector('#search');
const season = document.querySelector('#season');
const rarity = document.querySelector('#rarity');
const grid = document.querySelector('#cards');
const status = document.querySelector('#status');
const actions = document.querySelector('.catalog-actions');
const more = document.querySelector('#more');
const showAll = document.querySelector('#show-all');

async function start() {
  const cards = await loadData('cards');
  const indexed = cards.map(card => ({ card, search: searchText(`${card.name} ${card.ability} ${card.id}`) }));
  for (const value of [...new Set(cards.map(card => card.rarity))].sort()) {
    rarity.add(new Option(value, value));
  }

  let matches = [];
  let shown = 0;
  function appendCards(end) {
    const tiles = matches.slice(shown, end).map(({ card }) => cardTile(card));
    grid.append(...tiles);
    shown += tiles.length;
    more.hidden = shown >= matches.length;
    showAll.hidden = more.hidden;
    return tiles[0];
  }

  function applyFilters() {
    const query = searchText(search.value.trim());
    matches = indexed.filter(item => item.search.includes(query)
      && (!season.value || String(item.card.season) === season.value)
      && (!rarity.value || item.card.rarity === rarity.value));
    status.textContent = matches.length ? plural('cards.count', matches.length) : t('cards.empty');
    shown = 0;
    grid.replaceChildren();
    appendCards(PAGE_SIZE);
  }

  search.addEventListener('input', applyFilters);
  season.addEventListener('change', applyFilters);
  rarity.addEventListener('change', applyFilters);
  more.addEventListener('click', () => appendCards(shown + PAGE_SIZE)?.focus());
  showAll.addEventListener('click', () => appendCards(matches.length)?.focus());
  filters.hidden = false;
  applyFilters();
  actions.hidden = false;
  if (location.hash === '#search') search.focus();

  const selectedId = new URLSearchParams(location.search).get('card');
  if (selectedId) {
    const selected = cards.find(card => card.id === selectedId);
    if (selected) showCard(selected);
    else status.textContent = `${t('cards.notFound')} ${status.textContent}`;
  }
}

start().catch(() => { status.textContent = t('cards.error'); });
