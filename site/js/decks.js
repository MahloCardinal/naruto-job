import { cardImage, element, loadData, searchText } from './data.js';
import { cardTile } from './card-preview.js';
import { language, localizedUrl, plural, t } from './i18n.js';

const main = document.querySelector('#decks');
const status = document.querySelector('#status');
const list = document.querySelector('#deck-list');
const topView = main.dataset.view === 'top';

function deckTile(deck, cards) {
  const link = element('a', '', 'deck-tile');
  link.href = localizedUrl(`decks.html?deck=${encodeURIComponent(deck.id)}`);
  const image = cardImage(cards.get(deck.cover));
  image.alt = '';
  const label = element('div');
  label.append(element('strong', deck.name));
  if (deck.author?.trim()) label.append(element('span', deck.author));
  link.append(image, label);
  return link;
}

function showDeck(deck, cards) {
  document.title = `${deck.name} · NEXUS`;
  const intro = document.querySelector('#deck-intro');
  const back = element('a', t('decks.back'), 'text-link');
  back.href = localizedUrl('decks.html');
  const heading = intro.querySelector('.section-heading');
  heading.querySelector('h1').textContent = deck.name;
  intro.replaceChildren(back, heading);
  if (deck.author?.trim()) intro.append(element('p', t('decks.author', { name: deck.author })));
  if (deck.description) intro.append(element('p', deck.description, 'deck-description'));
  list.className = 'card-grid';
  list.replaceChildren(...deck.cards.map((id) => cardTile(cards.get(id))));
  status.hidden = true;
}

async function start() {
  const [catalog, decks] = await Promise.all([loadData('cards'), loadData('decks')]);
  const cards = new Map(catalog.map(card => [card.id, card]));
  const byId = new Map(decks.map(deck => [deck.id, deck]));
  if (topView) {
    const ids = await loadData('top-decks');
    const selected = [...new Set(ids)].map(id => byId.get(id)).filter(Boolean);
    status.textContent = selected.length ? plural('top.count', selected.length) : t('top.empty');
    list.replaceChildren(...selected.map(deck => deckTile(deck, cards)));
    return;
  }

  const selectedId = new URLSearchParams(location.search).get('deck');
  const selected = byId.get(selectedId);
  if (selected) {
    showDeck(selected, cards);
    return;
  }

  const search = document.querySelector('#deck-search');
  const indexed = decks.sort((a, b) => a.name.localeCompare(b.name, language)).map(deck => {
    const cardNames = deck.cards.map(id => `${id} ${cards.get(id).name} ${cards.get(id).ability}`);
    return { deck, search: searchText([deck.name, deck.author, ...cardNames].join(' ')) };
  });
  function render() {
    const query = searchText(search.value.trim());
    const matches = indexed.filter(item => item.search.includes(query));
    const message = matches.length ? plural('decks.count', matches.length) : t('decks.empty');
    status.textContent = selectedId && !query ? `${t('decks.notFound')} ${message}` : message;
    list.replaceChildren(...matches.map(({ deck }) => deckTile(deck, cards)));
  }
  search.addEventListener('input', render);
  document.querySelector('#deck-filters').hidden = false;
  render();
}

start().catch(() => { status.textContent = t('decks.error'); });
