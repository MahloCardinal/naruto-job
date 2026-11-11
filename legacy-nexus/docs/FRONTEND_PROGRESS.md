# NEXUS — avanzamento frontend

## Aggiornamento 10 novembre 2026
- Header condiviso con logo NEXUS, navigazione principale e invito Discord.
- Homepage riorganizzata con logo centrale, descrizione sintetica e quattro sezioni.
- Collegamenti interni alle pagine Tier List, Mazzi, Tornei e Update.
- Catalogo carte separato in componente interattivo con ricerca, filtri e paginazione.
- Compositore mazzi con selezione di 10 carte, carta principale, bozza locale ed esportazione JSON.
- Pagina Tornei mantenuta volutamente in pausa.

## Stato reale
Questa è ancora una base frontend. Il login Discord, il salvataggio condiviso, le approvazioni, i cuori, la pubblicazione della Tier List e gli aggiornamenti dal database non sono attivi finché non vengono implementati gli endpoint/server actions e configurato un progetto Supabase reale.

## Aggiornamento 2026-11-10 — pagine pubbliche collegate ai dati
- Tier List: lettura delle fasce pubblicate da Supabase, ordinamento manuale, carta principale reale dal catalogo locale e badge NEW per 36 ore dall'ultima release.
- Update: lettura degli aggiornamenti pubblicati, filtri categoria, selettore lingua EN/IT/ES/FR e fallback alla traduzione inglese o disponibile.
- Archivio Mazzi: lettura dei soli mazzi pubblicati, ordinamento più recenti, ricerca testuale e filtri Tier/strategia, visualizzazione carta principale, autore e cuori.
- Dettaglio mazzo: pagina dinamica con le 10 carte, carta principale, autore, descrizione, strategia, combo, punti di forza e debolezze.
- Le pagine mostrano stati espliciti quando Supabase non è configurato o non è raggiungibile. Nessun contenuto fittizio è stato aggiunto.
- Limite residuo: non è stata eseguita una build TypeScript/Next.js perché `node_modules` non è presente nell'ambiente di lavoro; serve installare le dipendenze.

## Reazioni ai mazzi — 10 novembre 2026
La pagina di dettaglio del mazzo integra ora `DeckLikeButton`: legge la reazione dell'utente autenticato sul server e invoca la RPC `toggle_deck_like` per aggiungere/rimuovere il cuore, mostrando il conteggio restituito dal database. Se l'utente non ha effettuato l'accesso, viene mostrato un invito ad accedere con Discord. La funzione dipende dalla migrazione `0003_community_and_updates_workflows.sql` e da Supabase configurato; non è attiva in modalità statica.

## 2026-11-10 — Profili pubblici e candidatura collaboratori
- Aggiunta la pagina pubblica `/profiles/[id]` con avatar Discord, nome sincronizzato, ruolo, bio e mazzi pubblicati.
- Collegato il nome autore nelle schede mazzo al profilo pubblico.
- Aggiunta la pagina `/collaborator/apply` con accesso Discord obbligatorio, presentazione (30–2000 caratteri), controllo ruolo già attivo e controllo candidatura pendente.
- La candidatura viene inserita in `collaborator_applications` e resa visibile nella coda di revisione del proprietario.
- Aggiunto il collegamento “Collabora” alla navigazione.
- Stato: implementato nel codice; richiede Supabase e Discord configurati per test end-to-end.

## Correzione accessibilità archivio Mazzi — 10 novembre 2026

- Corretto il markup dell'archivio: prima il collegamento all'intera scheda conteneva un secondo collegamento al profilo autore (anchor annidati, HTML non valido).
- La scheda ora è un `article` e titolo e autore hanno collegamenti indipendenti e semanticamente validi.
- Nessun cambiamento ai dati o alle regole di pubblicazione.
- Verifica offline: catalogo e struttura progetto controllati; build Next.js ancora non eseguibile senza dipendenze installate.
