'use strict';

const fs = require('node:fs'),
  path = require('node:path');
const root = path.resolve(__dirname, '..');

// One source of truth for browser catalogs and the small server-side projection.
function generateData() {
  const catalogs = require('../translations.js'),
    { CARDS } = require('../cards.js');
  const labels = [
    'database',
    'synergies',
    'builder',
    'prebuiltDecks',
    'collectionManage',
    'navDatabase',
    'navSynergies',
    'navBuilder',
    'navDecks'
  ];
  const metadata = {},
    assets = new Map();
  for (const [code, catalog] of Object.entries(catalogs)) {
    metadata[code] = {
      name: catalog.name,
      locale: catalog.locale,
      flag: catalog.flag,
      ui: Object.fromEntries(labels.map(key => [key, catalog.ui[key]]))
    };
    assets.set(
      `locales/${code}.js`,
      Buffer.from(
        `'use strict';\nLOCALIZATION.register(${JSON.stringify(code)},${JSON.stringify(catalog)});\n`
      )
    );
  }
  assets.set(
    'locales/manifest.js',
    Buffer.from(`'use strict';\nconst LANGUAGE_CATALOGS=${JSON.stringify(metadata)};\n`)
  );
  fs.mkdirSync(path.join(root, 'locales'), { recursive: true });
  for (const [name, data] of assets) fs.writeFileSync(path.join(root, name), data);
  const proposals = {
    languages: Object.fromEntries(
      Object.entries(catalogs).map(([code, catalog]) => [
        code,
        { name: catalog.name, proposalNoDescription: catalog.ui.proposalNoDescription }
      ])
    ),
    cards: Object.fromEntries(
      CARDS.map(card => {
        const text = catalogs.en.cards[card.card_key];
        return [card.card_key, { season: card.season, name: text.name, ability: text.ability }];
      })
    )
  };
  fs.mkdirSync(path.join(root, 'server-data'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'server-data', 'proposals.json'),
    JSON.stringify(proposals) + '\n'
  );
  return assets;
}
if (require.main === module) {
  generateData();
  console.log('Generated locale catalogs and proposal data.');
}
module.exports = generateData;
