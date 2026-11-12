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

`node import-data.cjs` rigenera il catalogo e i mazzi in italiano e in inglese, oltre alle immagini WebP condivise. Gli effetti vengono dal Deck Builder, gli ID pubblici delle Event Scroll da NEXUS. Le liste importate popolano l’archivio generale. Il file `site/data/top-decks.json` accetta un elenco ordinato di ID dei mazzi da mostrare nella selezione competitiva. L’importazione lascia intatta questa selezione.

I testi dell’interfaccia sono in `site/locales/it.js` e `site/locales/en.js`. Termini e informativa hanno entrambe le versioni nei rispettivi file HTML. Il selettore ricorda la lingua scelta nel browser.

## Vercel

Per un upload da terminale, avvia il deploy dalla cartella `site/`. Se colleghi un repository, imposta **Root Directory** su `site` e disattiva **Include source files outside of the Root Directory**. Il preset è **Other**, senza installazione o build, con output `.` come indicato in `site/vercel.json`. La `.vercelignore` alla radice limita a `site/` anche un upload via CLI avviato dalla cartella principale. Per tenere i progetti di riferimento fuori anche dal repository remoto, pubblica su Git soltanto `site/`.

## Supabase

Il menu Account nell’header usa Supabase Auth con Discord e `site/account.html` riceve il ritorno da OAuth. In Supabase, imposta il dominio di produzione come **Site URL** e aggiungi l’indirizzo completo di `/account.html` in **Redirect URLs**. Nel portale Discord registra come redirect OAuth2 il **Callback URL** mostrato dal provider Discord in Supabase. Inserisci il Client ID e il Client Secret dell’app nelle impostazioni del provider Supabase e disattiva gli altri metodi di accesso quando Discord è attivo.

Il frontend usa l’URL del progetto e la chiave pubblicabile in `site/js/account.js`. Catalogo e mazzi sono ancora letti dai file JSON. Prima di collegare i mazzi al database, verifica la corrispondenza del catalogo e collauda i permessi e le policy RLS in un progetto di test.
