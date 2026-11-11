# NEXUS — Naruto Ninja Cards

Progetto NEXUS: interfaccia dark responsive, catalogo carte e specifiche per il backend.

## Avvio rapido (anteprima frontend)
Aprire `index.html` in un browser. Per un server locale, dalla cartella del progetto eseguire:

```bash
python -m http.server 8000
```

Poi visitare `http://localhost:8000`.

## Pagine
- `index.html` — homepage NEXUS e navigazione alle quattro aree.
- `cards.html` — galleria delle 290 carte con ricerca e filtri.
- `decks.html` — archivio Mazzi con ordinamento e filtri predisposti.
- `tierlist.html` — fasce S/A/B/C secondo i colori concordati.
- `updates.html` — aggiornamento in evidenza, categorie e archivio.
- `tournaments.html` — sezione volutamente in pausa.
- `admin.html` — anteprima grafica del pannello amministratore, non autenticata.

## Dati
- `data/cards.json` — catalogo normalizzato di 290 carte.
- `data/NEXUS_Season1.json`, `NEXUS_Season2.json`, `NEXUS_Season3_V3.json` — sorgenti originali conservate.
- `docs/DATABASE_AUDIT.md` — verifica e distribuzione del catalogo.
- `docs/database_290_reference.html` — riferimento HTML del catalogo consolidato.

## Backend e pubblicazione
- `supabase/migrations/0001_nexus_schema.sql` — schema PostgreSQL iniziale e policy RLS.
- `supabase/migrations/0005_content_write_hardening.sql` — revoca le scritture dirette dai client sulle tabelle di mazzi, carte del mazzo, Tier List, audit e notifiche; le modifiche devono passare dalle RPC validate.
- `.env.example` — nomi delle variabili richieste, senza segreti.
- `docs/BACKEND_SETUP.md` — passaggi per Discord OAuth, Supabase, MFA, notifiche, backup e hosting.
- `docs/PROJECT_SPEC.md` — specifiche funzionali concordate.

## Stato reale
Il pacchetto è un prototipo frontend e una base di backend/documentazione. Non è ancora un servizio online: login Discord, ruoli reali, cuori persistenti, invio/approvazione contenuti, notifiche, MFA, backup schedulati e monitoraggio richiedono configurazione e test su servizi esterni. La pagina admin è solo una preview e non protegge dati reali.

## Verifica catalogo
```bash
python scripts/validate_cards.py
```

## Applicazione Next.js (nuova base di sviluppo)
È stata aggiunta una struttura Next.js App Router in `app/`, con homepage, navigazione comune e pagine dedicate. Il catalogo validato è esposto in `public/data/cards.json` e la pagina `/cards` dispone di ricerca e filtri funzionanti lato browser. Le pagine Mazzi, Tier List, Update e Admin sono ancora stati pubblici/placeholder: le azioni persistenti richiedono l'integrazione Supabase e l'autenticazione server-side.

Per avviare la nuova applicazione, con Node.js 20.9+:
```bash
npm install
npm run dev
```
Aprire `http://localhost:3000`. La versione HTML originale resta disponibile come riferimento e anteprima statica.

## Aggiornamenti tecnici
- La galleria carte usa paginazione client-side (24 carte per pagina), ricerca per nome/ID, filtri Season e rarità e azzeramento rapido.
- Le pagine hanno metadati condivisi, tema scuro dichiarato per il browser e una pagina 404 dedicata.
- `robots.txt` generato da Next.js impedisce l'indicizzazione del percorso `/admin`; questo non sostituisce l'autenticazione e non rende sicura l'area amministrativa.
- Le immagini delle carte hanno gestione di errore lato interfaccia; se un URL esterno non risponde, la relativa immagine viene nascosta senza bloccare il catalogo.

## Limiti attuali da non confondere con funzionalità attive
La paginazione e i filtri del catalogo sono operativi nel frontend. Le funzioni che modificano dati (login, invio mazzi, approvazioni, cuori, Tier List e Update) restano disabilitate finché non saranno implementate le API server-side e collegate a un progetto Supabase configurato. Il dominio definitivo non è ancora noto e quindi non viene impostato nei metadati.

## Ultimo avanzamento — preparazione invio mazzi
La pagina Next.js `/decks` ora include un compositore interattivo lato browser: nome, descrizione, tipo strategia, tier proposto, selezione vincolata a 10 carte dal catalogo verificato e scelta della carta principale tra le 10. L'anteprima verifica i dati inseriti. **Non invia né salva il mazzo**: invio, associazione dell'autore Discord e workflow di approvazione saranno attivati solo dopo l'integrazione server-side Supabase. Nessun contenuto fittizio è stato aggiunto all'archivio pubblico.

## Ultimo avanzamento — preparazione invio mazzi
La pagina Next.js `/decks` ora include un compositore interattivo lato browser: nome, descrizione, tipo strategia, tier proposto, selezione vincolata a 10 carte dal catalogo verificato e scelta della carta principale tra le 10. L'anteprima verifica i dati inseriti. **Non invia né salva il mazzo**: invio, associazione dell'autore Discord e workflow di approvazione saranno attivati solo dopo l'integrazione server-side Supabase. Nessun contenuto fittizio è stato aggiunto all'archivio pubblico.

## Backend — nuova migrazione di workflow
È stata aggiunta `supabase/migrations/0002_nexus_workflows_and_card_catalog.sql`:
- importa il catalogo ufficiale di 290 carte in `card_catalog` e rende le carte referenziabili con chiavi esterne;
- `submit_deck(...)` crea una proposta in stato `pending` in un'unica transazione, verificando 10 carte distinte, carta principale inclusa e appartenenza al catalogo;
- `review_deck(...)` consente al solo proprietario di pubblicare o respingere una proposta, registrando approvatore, timestamp, audit e notifiche;
- `publish_tierlist(...)` sostituisce la Tier List atomicamente e registra ogni rilascio;
- `published_deck_archive` espone soltanto i mazzi pubblicati.

La migrazione è codice preparato ma non applicato: richiede un progetto Supabase configurato. Le funzioni RPC non sono ancora collegate a un'interfaccia server Next.js e non devono essere considerate attive finché non vengono applicate e testate nel progetto remoto.

### Authentication progress

A Supabase SSR client, Discord OAuth sign-in control, and `/auth/callback` route are now included in the Next.js source. They remain inactive until a Supabase project and Discord OAuth provider are configured. See `docs/BACKEND_PROGRESS.md` and `.env.example`. Authentication does not by itself grant admin permissions.

## Migrazione 0003 — community e Update
La migrazione `supabase/migrations/0003_community_and_updates_workflows.sql
- `supabase/migrations/0004_deck_and_tierlist_publication.sql`: invio/revisione mazzi e pubblicazione atomica Tier List` aggiunge le RPC per candidature collaboratore, revisione proprietario-only, Mi piace sui mazzi pubblicati e approvazione Update con traduzioni obbligatorie in quattro lingue. Include audit log e policy di lettura delle notifiche amministrative. È codice SQL preparato, non applicato a un progetto Supabase remoto.


## Ultimo avanzamento (10 novembre 2026)
- Aggiunta la route OAuth `/auth/callback` che scambia il codice Discord/Supabase con una sessione e rifiuta redirect esterni.
- La pagina `/admin` ora verifica la sessione sul server e controlla il ruolo `owner` nel profilo; il semplice login non concede privilegi.
- La dashboard owner mostra collegamenti alle aree principali e dichiara esplicitamente quali flussi restano da collegare.
- La verifica runtime/build Next.js non è stata eseguita in questo ambiente perché le dipendenze npm non sono installate.

## Pannello amministrativo — ultimo aggiornamento
La dashboard Next.js ora include code di revisione per mazzi, update e candidature collaboratori, contatori e azioni server-side che invocano le RPC SQL dedicate. Le azioni richiedono il ruolo `owner` e una sessione Supabase MFA di livello AAL2. Vedi `docs/ADMIN_PROGRESS.md` per limiti e passaggi di configurazione ancora necessari.

## Ultimo aggiornamento frontend (10 novembre 2026)
Le pagine pubbliche Tier List, Update e Mazzi ora leggono i contenuti pubblicati da Supabase quando il progetto è configurato. L'archivio Mazzi include ricerca e filtri, e ogni mazzo ha una pagina di dettaglio con il proprio elenco di carte. La Tier List mostra le carte principali reali dal catalogo e la data dell'ultima pubblicazione; Update supporta filtri categoria e selezione lingua.

Queste funzioni dipendono dalle migrazioni Supabase e dai dati pubblicati. In assenza di configurazione, le pagine mostrano uno stato vuoto/di configurazione e non inventano contenuti. La build Next.js non è stata eseguita in questo ambiente perché non è presente `node_modules`.

## Reazioni ai mazzi — ultimo aggiornamento
La pagina di dettaglio integra il pulsante cuore collegato alla RPC `toggle_deck_like`: una reazione per utente/mazzo, con possibilità di rimuoverla e conteggio aggiornato. Lo stato iniziale viene letto per l'utente autenticato. Per attivarlo online è necessario configurare Supabase e applicare le migrazioni 0001–0004. Il test end-to-end non è ancora eseguibile senza credenziali e database remoto.

## Editor proprietario Tier List
La dashboard `/admin` include ora un editor interattivo della Tier List: aggiunta/rimozione di mazzi pubblicati, assegnazione a S/A/B/C, ordinamento manuale e pubblicazione tramite RPC atomica `publish_tierlist`. L'azione server richiede profilo owner e MFA AAL2. Il flusso è predisposto nel codice, ma richiede le migrazioni Supabase applicate e una build verificata prima dell'uso online.


## Hardening dei permessi (migrazione 0005)
La migrazione `0005_content_write_hardening.sql` riduce la superficie di attacco: i client anonimi/autenticati possono leggere i contenuti pubblici secondo RLS, ma non possono modificare direttamente mazzi, righe delle 10 carte, Tier List, catalogo, audit log o notifiche. Le scritture previste passano dalle funzioni RPC con validazione. La migrazione deve essere applicata dopo 0001–0004 e verificata in un progetto Supabase di test prima della produzione.

## Controllo offline del pacchetto
Eseguire `python scripts/validate_project.py` (oppure `npm run validate:project`) per verificare conteggio/ID delle carte, coerenza della copia pubblica, presenza delle migrazioni e assenza di segreti valorizzati nel template `.env.example`. Questo controllo strutturale non sostituisce la build Next.js né i test d'integrazione.

### Update submission

Collaborators and the owner can prepare an update at `/updates/submit`. The form requires English, Italian, Spanish and French versions. The server action checks the current authenticated profile role and submits the content through the `submit_update` database function. The new migration is `supabase/migrations/0006_update_submission.sql`; apply migrations in numeric order before testing this workflow. A normal user cannot submit updates, and all submissions remain pending until owner approval.

### Ultimo aggiornamento — 10 novembre 2026
Aggiunte le pagine dei profili pubblici (`/profiles/[id]`) e il flusso di candidatura collaboratori (`/collaborator/apply`). I profili mostrano identità/avatar Discord, ruolo, bio e mazzi pubblicati. Le candidature richiedono login, validano la presentazione e controllano candidature già pendenti. Queste funzioni sono implementate nel codice ma richiedono il progetto Supabase/Discord configurato per il test end-to-end.

## Controllo qualità tecnico (10 novembre 2026)
Il rapporto `docs/QA_STATUS_2026-11-10.md` registra separatamente i controlli superati e quelli ancora bloccati. I controlli offline del catalogo, della struttura e dell'archivio sono superati. La build e il typecheck Next.js non sono ancora verificati perché l'installazione npm termina per timeout e le dipendenze non sono presenti; le migrazioni e OAuth non sono state testate su servizi remoti.
