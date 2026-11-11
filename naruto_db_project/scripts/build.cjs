'use strict';

const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto');
const { minify } = require('terser');
const root = path.resolve(__dirname, '..'),
  out = path.join(root, 'dist');

async function build() {
  if (path.dirname(out) !== root || path.basename(out) !== 'dist')
    throw Error('Unsafe build output');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const manifest = {},
    cardHashes = {},
    written = new Map();
  const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  function emit(name, buffer, card = false) {
    const ext = path.extname(name),
      digest = hash(buffer),
      destination = 'assets/' + name.slice(0, -ext.length) + '.' + digest + ext;
    const absolute = path.join(out, destination);
    if (written.has(destination) && !written.get(destination).equals(buffer))
      throw Error('Asset hash collision');
    written.set(destination, buffer);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, buffer);
    if (!card) manifest[name] = destination;
    return digest;
  }
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script defer src="([^"]+)"/g)].map(match => match[1]);
  const generated = require('./generate-data.cjs')();
  async function minimize(name, source) {
    const result = await minify(source.toString(), {
      // Preserve classic-script globals shared with lazy scripts. The bookmarklet
      // serializes its own function, so only strip formatting from that file.
      compress: name === 'collection.js' ? false : { toplevel: false, unused: false },
      mangle: name === 'collection.js' ? false : { toplevel: false },
      toplevel: false,
      keep_fnames: true,
      keep_classnames: true,
      format: { comments: false, semicolons: true }
    });
    return Buffer.from(result.code);
  }
  const runtime = [];
  for (const name of scripts) {
    const source = generated.get(name) || fs.readFileSync(path.join(root, name));
    runtime.push(await minimize(name, source));
  }
  emit('runtime.js', Buffer.from(runtime.map(buffer => buffer.toString()).join(';\n')));
  for (const name of ['app.js', 'deck-autobuilder.js'])
    emit(name, await minimize(name, fs.readFileSync(path.join(root, name))));
  emit('styles.css', fs.readFileSync(path.join(root, 'styles.css')));
  for (const [name, data] of generated)
    if (name !== 'locales/manifest.js') emit(name, await minimize(name, data));
  for (const file of fs.readdirSync(path.join(root, 'misc_images'))) {
    if (/^flag-.*\.svg$/.test(file)) continue;
    emit('misc_images/' + file, fs.readFileSync(path.join(root, 'misc_images', file)));
  }
  for (const file of fs
    .readdirSync(path.join(root, 'card_images'))
    .filter(file => file.endsWith('.webp'))) {
    const sizes = ['', '160/', '320/'];
    cardHashes[file.slice(0, -5)] = sizes.map(size => {
      const source = path.join(root, 'card_images', size, file);
      if (!fs.existsSync(source))
        throw Error('Missing thumbnail; run scripts/generate-thumbnails.py: ' + source);
      return emit('card_images/' + size + file, fs.readFileSync(source), true);
    });
  }
  const globals = `<script>window.NARUTO_ASSETS=${JSON.stringify(manifest)};window.NARUTO_CARD_HASHES=${JSON.stringify(cardHashes)};</script>`;
  let runtimeInserted = false;
  const bundled = html.replace(/<script defer src="[^"]+"><\/script>\s*/g, () => {
    if (runtimeInserted) return '';
    runtimeInserted = true;
    return '<script defer src="runtime.js"></script>\n';
  });
  const built = bundled
    .replace(/(src|href)="([^"]+)"/g, (match, attribute, name) =>
      manifest[name] ? `${attribute}="${manifest[name]}"` : match
    )
    .replace(/<script defer/, globals + '\n<script defer');
  fs.writeFileSync(path.join(out, 'index.html'), built);
  console.log(
    `Built ${written.size} versioned assets; ${scripts.length} startup scripts combined into one minified runtime.`
  );
}
build().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
