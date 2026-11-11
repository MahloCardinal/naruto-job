# NEXUS — Specifica funzionale concordata

## Identità e interfaccia
- Tema esclusivamente scuro; identità ninja/competitiva.
- Responsive per smartphone, tablet e desktop.
- Lingue previste: EN, IT, ES, FR; inglese predefinito.
- Homepage con logo, invito Discord e quattro sezioni: Tier List, Mazzi, Tornei, Update.
- Invito Discord: https://discord.gg/Z37VKQytGv

## Tier List
- Fasce S/A/B/C con colori rispettivi rosso cremisi/oro/blu/verde.
- Ogni mazzo mostra una carta principale scelta fra le 10 carte del deck, nome e nessun dato autore/statistica.
- Ordinamento manuale; owner-only; data ultimo aggiornamento; badge NEW per 36 ore; solo versione corrente pubblica.

## Mazzi
- Ordinamento più recente prima.
- Elementi elenco: carta principale, nome, autore, breve descrizione.
- Filtri: autore, carte utilizzate, tipo strategia, Tier S/A/B/C.
- Scheda completa: 10 carte e informazioni strategiche.
- Un cuore per utente per mazzo, rimovibile; nessun commento e nessun collegamento Discord nella scheda.
- Profili pubblici con avatar/nome Discord sincronizzati, presentazione, ruolo e mazzi pubblicati; niente copertina, follow o feed.
- Collaboratori possono preparare mazzi; pubblicazione solo dopo approvazione owner.

## Stato prototipo Mazzi
- Pagina `decks.html` creata come interfaccia pubblica responsive.
- Filtri predisposti per autore, carte utilizzate, strategia e Tier; ordinamento latest previsto.
- Archivio inizialmente vuoto: nessun deck di esempio inventato.
- Invio collaboratori mostrato come non attivo finché non esistono login Discord e backend.

## Stato prototipo Tier List e Update
- `tierlist.html`: quattro fasce orizzontali S/A/B/C con palette concordata; vuota finché non esistono mazzi approvati.
- `updates.html`: aggiornamento in evidenza, filtri per categoria e archivio cronologico; vuota finché non vengono pubblicate notizie.
- Nessun contenuto o data di pubblicazione inventati. Le funzioni di gestione e badge temporizzati richiedono backend.

## Tornei
- In pausa. In futuro: calendario, tornei attivi e archivio; iscrizioni su Discord; risultati gestiti da owner e collaboratori; formati flessibili. Tabelloni da valutare successivamente.

## Update
- Un aggiornamento in evidenza, poi elenco cronologico con filtri per categoria.
- Categorie: Patch Notes, Eventi, Nuove Season, Aggiornamenti, Annunci.
- Owner e collaboratori preparano contenuti; pubblicazione dopo approvazione owner.
- Versioni EN/IT/ES/FR; allegati facoltativi: immagini, screenshot, video/trailer e fonti ufficiali.
- Badge NEW in homepage per 36 ore.

## Account e amministrazione
- Consultazione pubblica senza account.
- Login esclusivamente Discord OAuth2 per cuori e funzioni riservate; nickname e avatar sincronizzati da Discord.
- Un solo ruolo Collaboratore: può lavorare su contenuti, non approvare/pubblicare né modificare ruoli e permessi.
- Invito diretto ai collaboratori e candidature soggette ad approvazione owner.
- Dashboard completa, notifiche Discord per invii/candidature, 2FA per owner, backup giornalieri con retention 30 giorni, audit log non modificabile dai collaboratori, stato sistema.
- Pulsante admin visibile solo all'owner.

## Nota di sicurezza
I ruoli e le autorizzazioni devono essere applicati lato server/database, non solo nascondendo pulsanti nell'interfaccia. OAuth2 non sostituisce il 2FA amministrativo. Backup e notifiche devono essere verificati con test di ripristino e consegna.
