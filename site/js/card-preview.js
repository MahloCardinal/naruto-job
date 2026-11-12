import effectTerms from '../locales/effect-terms.js';
import { cardImage, element } from './data.js';
import { language, t } from './i18n.js';

const terms = Object.entries(effectTerms[language])
  .map(([effect, pattern]) => `(?<${effect}>${pattern})`).join('|');
// An effect and its parameter are a single token, as in the reference site.
const descriptionPattern = new RegExp(
  String.raw`(?<![\p{L}\p{M}\p{N}_])(?:${terms})(?![\p{L}\p{M}\p{N}_])(?:\s*[([][+−-]?\d+(?:[.,]\d+)?s?[)\]])?|\p{L}[\p{L}\p{M}]*|\d+(?:[.,]\d+)?|\S`,
  'giu',
);

let dialog;
let detail;

function compareDescriptions(descriptions) {
  const levels = descriptions.map(text => Array.from(text.matchAll(descriptionPattern), match => ({
    text: match[0],
    start: match.index,
    effect: Object.keys(match.groups).find(effect => match.groups[effect] !== undefined),
    key: match[0].toLocaleLowerCase(language),
    changed: descriptions.length === 2,
  })));
  const [first, second] = levels;
  if (levels.length !== 2) return levels;

  // Keep the longest sequence of shared tokens unmarked, including when text is inserted mid-sentence.
  const shared = Array.from({ length: first.length + 1 }, () => new Uint16Array(second.length + 1));
  for (let i = first.length - 1; i >= 0; i--) {
    for (let j = second.length - 1; j >= 0; j--) {
      shared[i][j] = first[i].key === second[j].key
        ? shared[i + 1][j + 1] + 1
        : Math.max(shared[i + 1][j], shared[i][j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < first.length && j < second.length) {
    if (first[i].key === second[j].key) {
      first[i++].changed = false;
      second[j++].changed = false;
    } else if (shared[i + 1][j] >= shared[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return levels;
}

function renderDescription(container, text, tokens) {
  const fragment = document.createDocumentFragment();
  let start = 0;
  for (const token of tokens) {
    if (!token.effect && !token.changed) continue;
    fragment.append(text.slice(start, token.start));
    const part = token.effect
      ? element('strong', token.text, 'effect-keyword')
      : element('span', token.text);
    if (token.effect) part.dataset.effect = token.effect;
    if (token.changed) part.classList.add('level-change');
    fragment.append(part);
    start = token.start + token.text.length;
  }
  fragment.append(text.slice(start));
  container.replaceChildren(fragment);
}

function createDialog() {
  dialog = element('dialog');
  dialog.id = 'card-dialog';
  dialog.setAttribute('aria-labelledby', 'card-name');
  const form = element('form', '', 'dialog-close');
  form.method = 'dialog';
  const close = element('button', '×', 'button');
  close.setAttribute('aria-label', t('card.close'));
  close.autofocus = true;
  form.append(close);
  detail = element('div', '', 'card-detail');
  dialog.append(form, detail);
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const { left, right, top, bottom } = dialog.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) {
      dialog.close();
    }
  });
  document.body.append(dialog);
}

export function showCard(card) {
  if (!dialog) createDialog();
  const image = cardImage(card);
  image.loading = 'eager';
  const content = element('div');
  const name = element('h2');
  name.id = 'card-name';
  const [season, number] = card.id.split('_');
  name.append(`${card.name} `, element('span', `${season} #${number}`, 'card-number'));

  const effect = element('section', '', 'effect');
  const level = element('label', t('card.level'), 'effect-level');
  const select = element('select');
  card.descriptions.forEach((_text, index) => select.add(new Option(String(index + 1), index)));
  const description = element('p');
  description.setAttribute('aria-live', 'polite');
  const levels = compareDescriptions(card.descriptions);
  const updateDescription = () => {
    const index = select.selectedIndex;
    renderDescription(description, card.descriptions[index], levels[index]);
  };
  select.addEventListener('change', updateDescription);
  updateDescription();
  level.append(select);
  effect.append(level, description);

  content.append(
    name,
    element('h3', card.ability),
    element('p', `${t('card.cost')} ${card.cost} · Chakra ${card.chakra}`, 'muted'),
    element('p', card.effects.join(' · '), 'effect-labels'),
    effect,
  );
  detail.replaceChildren(image, content);
  if (!dialog.open) dialog.showModal();
}

export function cardTile(card) {
  const tile = element('button', '', 'card-tile');
  tile.type = 'button';
  const image = cardImage(card);
  image.alt = '';
  tile.append(image, element('strong', card.name), element('span', card.ability));
  tile.addEventListener('click', () => showCard(card));
  return tile;
}
