# NEXUS · Naruto Ninja Cards

- `site/` contiene il sito HTML, CSS e JavaScript pubblicabile.
- `legacy-nexus/` conserva il prototipo originale, incluse specifiche e migrazioni Supabase.
- `naruto_db_project/` è il progetto di riferimento per carte, immagini e mazzi.

## Anteprima locale

Dalla cartella `Naruto job`:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory site
```

Apri <http://127.0.0.1:8000/>. Il sito carica i moduli JavaScript e i JSON via HTTP.

## Dati

`node import-data.cjs` rigenera il catalogo italiano, le immagini WebP e i mazzi di riferimento. Gli effetti vengono dal Deck Builder, gli ID pubblici delle Event Scroll da NEXUS. Le liste importate popolano l’archivio generale. Il file `site/data/top-decks.json` accetta un elenco ordinato di ID dei mazzi da mostrare nella selezione competitiva. L’importazione lascia intatta questa selezione.

## Vercel

Per un upload da terminale, avvia il deploy dalla cartella `site/`. Se colleghi un repository, imposta **Root Directory** su `site` e disattiva **Include source files outside of the Root Directory**. Il preset è **Other**, senza installazione o build, con output `.` come indicato in `site/vercel.json`. La `.vercelignore` alla radice limita a `site/` anche un upload via CLI avviato dalla cartella principale. Per tenere i progetti di riferimento fuori anche dal repository remoto, pubblica su Git soltanto `site/`.

## Supabase

Il sito attuale legge da file statici. Per la fase con utenti e mazzi condivisi, abilita Discord in Supabase Auth, disattiva gli altri metodi di accesso e configura gli URL di ritorno. Usa una chiave pubblicabile nel frontend e applica i permessi di lettura e scrittura nel database. Le credenziali Discord vanno nelle impostazioni di Supabase. Prima di riusare le migrazioni del prototipo, verifica la corrispondenza del catalogo e collauda i ruoli in un progetto di test.
