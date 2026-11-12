import { cardImage, element } from './data.js';
import { t } from './i18n.js';

let dialog;
let detail;

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
  name.append(element('span', `${season} #${number}`, 'card-number'), ` ${card.name}`);

  const effect = element('section', '', 'effect');
  const level = element('label', t('card.level'), 'effect-level');
  const select = element('select');
  card.descriptions.forEach((_text, index) => select.add(new Option(`Lv ${index + 1}`, index)));
  const description = element('p', card.descriptions[0]);
  description.setAttribute('aria-live', 'polite');
  select.addEventListener('change', () => {
    description.textContent = card.descriptions[select.selectedIndex];
  });
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
