# NEXUS — avanzamento pannello amministrativo

## Implementato nel codice
- Verifica server-side della sessione Supabase e del ruolo `owner` prima di mostrare i dati amministrativi.
- Dashboard con contatori di mazzi pubblicati, mazzi in attesa, aggiornamenti pubblicati e candidature aperte.
- Elenco delle proposte di mazzo, degli aggiornamenti e delle candidature collaboratori.
- Azioni server-side per pubblicare/rifiutare mazzi e aggiornamenti e accettare/rifiutare candidature.
- Le azioni invocano esclusivamente le RPC SQL `review_deck`, `review_update` e `review_collaborator_application`; non modificano direttamente i ruoli dal browser.
- Revalidation delle pagine interessate dopo le operazioni.
- Layout responsive per la dashboard.

## Dipendenze esterne ancora necessarie
- Applicare in Supabase, nell'ordine, le migrazioni `0001`–`0004`.
- Configurare Discord OAuth e le URL di callback in Supabase.
- Configurare MFA per il proprietario e verificare AAL2 anche nelle azioni privilegiate prima della messa online.
- Configurare le variabili d'ambiente e verificare il progetto con `npm install`, `npm run typecheck` e `npm run build` in un ambiente con accesso al registry npm.

## Limiti dichiarati
La dashboard è collegata alle query e alle RPC previste, ma non è collaudabile contro un backend finché Supabase non è configurato e le migrazioni non sono state applicate. La verifica del ruolo owner è presente; il requisito MFA/AAL2 deve essere completato nelle azioni server-side prima di autorizzare operazioni reali in produzione.

## Editor Tier List nel pannello owner (10 novembre 2026)
È stato aggiunto `components/admin-tierlist-editor.tsx`, integrato in `/admin`. Il proprietario può aggiungere o rimuovere mazzi pubblicati, assegnare le fasce S/A/B/C, riordinare ogni fascia con controlli su/giù e pubblicare la composizione corrente tramite la RPC `publish_tierlist`. L'azione server verifica nuovamente owner + MFA AAL2, valida il payload JSON e invalida le pagine `/admin` e `/tierlist` dopo la pubblicazione. L'interfaccia non è utilizzabile online finché Supabase e le migrazioni non sono configurati; la compilazione resta da eseguire con le dipendenze installate.
