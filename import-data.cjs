const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { CARDS } = require('./naruto_db_project/cards.js');
const { it } = require('./naruto_db_project/translations.js');
const { cards: nexusCards } = require('./legacy-nexus/data/cards.json');

const reference = path.join(__dirname, 'naruto_db_project');
const site = path.join(__dirname, 'site');
const eventIds = new Map([
  ['ES_001', 'SR_001'], // Sakura Haruno — Healing Student
  ['ES_002', 'SR_004'], // Hoki — Reverse Scale Formation
  ['ES_003', 'SR_003'], // Hoki — Full Arsenal
  ['ES_004', 'SR_002'], // Seimei — Ultimate Form
  ['ES_005', 'SR_005'], // Gaara — Shukaku's Spear
]);

const sourceByKey = new Map(CARDS.map(card => [card.card_key, card]));
const idByKey = new Map(CARDS.map(card => [card.card_key, eventIds.get(card.card_key) ?? card.card_key]));
const keysById = new Map([...idByKey].map(([key, id]) => [id, key]));
assert.equal(keysById.size, CARDS.length, 'Gli ID delle carte devono essere univoci');
assert.equal(keysById.size, nexusCards.length, 'Il catalogo deve corrispondere a NEXUS');

const cards = nexusCards.map(({ id, season }) => {
  const key = keysById.get(id);
  assert.ok(key, `Carta assente nel progetto di riferimento: ${id}`);
  const card = sourceByKey.get(key);
  const text = it.cards[key];
  const artwork = path.join(reference, 'card_images', '320', `${key}.webp`);
  assert.ok(text?.name && text.ability && text.descriptions?.length, `Testi incompleti: ${key}`);
  assert.ok(fs.existsSync(artwork), `Immagine assente: ${key}`);
  return {
    id,
    season,
    name: text.name,
    ability: text.ability,
    rarity: card.rarity,
    cost: card.energy_cost,
    chakra: card.chakra,
    effects: card.skill_types_original.map(effect => it.effects[effect] ?? effect),
    descriptions: text.descriptions,
  };
});

const presets = fs.readFileSync(path.join(reference, 'prebuilt-decks.js'), 'utf8');
const deckList = presets.match(/const PREBUILT_DECKS = (\[[\s\S]*\]);\s*$/);
assert.ok(deckList, 'Formato dei mazzi di riferimento inatteso');
const decks = JSON.parse(deckList[1]).map(deck => {
  const cardIds = deck.cards.map(key => idByKey.get(key));
  assert.ok(cardIds.every(Boolean), `Carta sconosciuta nel mazzo ${deck.id}`);
  assert.ok(cardIds.length === 10 && new Set(cardIds).size === 10, `Mazzo non valido: ${deck.id}`);
  const cover = idByKey.get(deck.core?.[0]);
  return {
    id: deck.id,
    name: it.ui[`presetName_${deck.id}`] ?? deck.name,
    author: deck.author ?? null,
    description: it.ui[`preset_${deck.id}`] ?? '',
    cards: cardIds,
    cover: cardIds.includes(cover) ? cover : cardIds[0],
  };
});
assert.equal(new Set(decks.map(deck => deck.id)).size, decks.length, 'Gli ID dei mazzi devono essere univoci');

fs.mkdirSync(path.join(site, 'data'), { recursive: true });
fs.mkdirSync(path.join(site, 'images'), { recursive: true });
for (const { id } of cards) {
  const key = keysById.get(id);
  fs.copyFileSync(path.join(reference, 'card_images', '320', `${key}.webp`), path.join(site, 'images', `${id}.webp`));
}
fs.writeFileSync(path.join(site, 'data', 'cards.json'), `${JSON.stringify(cards, null, 2)}\n`);
fs.writeFileSync(path.join(site, 'data', 'decks.json'), `${JSON.stringify(decks, null, 2)}\n`);
console.log(`Importate ${cards.length} carte e ${decks.length} liste dal progetto di riferimento.`);
