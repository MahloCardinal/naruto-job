import { cardImage, element, loadData, searchText } from './data.js';

const main = document.querySelector('#decks');
const status = document.querySelector('#status');
const list = document.querySelector('#deck-list');
const topView = main.dataset.view === 'top';

function deckTile(deck, cards) {
  const link = element('a', '', 'deck-tile');
  link.href = `decks.html?deck=${encodeURIComponent(deck.id)}`;
  const image = cardImage(cards.get(deck.cover));
  image.alt = '';
  const label = element('div');
  label.append(element('strong', deck.name), element('span', deck.author || `${deck.cards.length} carte`));
  link.append(image, label);
  return link;
}

function showDeck(deck, cards) {
  document.title = `${deck.name} · NEXUS`;
  const intro = document.querySelector('#deck-intro');
  const back = element('a', '← Tutti i mazzi', 'text-link');
  back.href = 'decks.html';
  intro.replaceChildren(back, element('h1', deck.name));
  if (deck.author) intro.append(element('p', `Mazzo di ${deck.author}`));
  if (deck.description) intro.append(element('p', deck.description, 'deck-description'));
  status.textContent = `${deck.cards.length} carte nel mazzo`;
  list.className = 'card-grid';
  for (const id of deck.cards) {
    const card = cards.get(id);
    const link = element('a', '', 'card-tile');
    link.href = `cards.html?card=${encodeURIComponent(id)}`;
    const image = cardImage(card);
    image.alt = '';
    link.append(image, element('strong', card.name), element('span', card.ability), element('small', id));
    list.append(link);
  }
}

async function start() {
  const [catalog, decks] = await Promise.all([loadData('cards'), loadData('decks')]);
  const cards = new Map(catalog.map(card => [card.id, card]));
  const byId = new Map(decks.map(deck => [deck.id, deck]));
  if (topView) {
    const ids = await loadData('top-decks');
    const selected = [...new Set(ids)].map(id => byId.get(id)).filter(Boolean);
    status.textContent = selected.length ? `${selected.length} mazzi selezionati` : 'La selezione dei Top Decks non è ancora stata pubblicata.';
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
  const indexed = decks.sort((a, b) => a.name.localeCompare(b.name, 'it')).map(deck => {
    const cardNames = deck.cards.map(id => `${id} ${cards.get(id).name} ${cards.get(id).ability}`);
    return { deck, search: searchText([deck.name, deck.author, ...cardNames].join(' ')) };
  });
  function render() {
    const query = searchText(search.value.trim());
    const matches = indexed.filter(item => item.search.includes(query));
    const message = matches.length ? `${matches.length} mazzi trovati` : 'Nessun mazzo corrisponde alla ricerca.';
    status.textContent = selectedId && !query ? `Mazzo richiesto non trovato. ${message}` : message;
    list.replaceChildren(...matches.map(({ deck }) => deckTile(deck, cards)));
  }
  search.addEventListener('input', render);
  document.querySelector('#deck-filters').hidden = false;
  render();
}

start().catch(() => { status.textContent = 'I mazzi non sono disponibili. Ricarica la pagina per riprovare.'; });
