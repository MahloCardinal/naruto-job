# NEXUS — Backend e messa online

Questa cartella contiene lo schema iniziale PostgreSQL per Supabase. Non contiene chiavi, password o credenziali reali.

## Servizi da configurare
1. Creare un progetto Supabase.
2. Applicare `supabase/migrations/0001_nexus_schema.sql` dal SQL Editor.
3. In Supabase Auth abilitare Discord come provider OAuth e inserire Client ID/Secret creati nel Discord Developer Portal.
4. Impostare gli URL di redirect OAuth autorizzati per ambiente locale e dominio di produzione.
5. Effettuare il primo login Discord e assegnare `owner` al profilo corrispondente da una sessione SQL amministrativa fidata. Non assegnare mai questo ruolo da un form pubblico.
6. Configurare MFA/TOTP Supabase e richiedere livello AAL2 per le azioni owner.
7. Configurare lo storage per immagini e allegati, con policy di accesso appropriate.
8. Configurare una funzione server-side per sincronizzare periodicamente username/avatar Discord, inviare notifiche Discord e scrivere l'audit log.
9. Configurare backup giornalieri con retention 30 giorni e provare un ripristino prima del lancio.
10. Collegare il frontend al backend, eseguire test RLS con account anonimo, utente, collaboratore e owner.
11. Configurare hosting, dominio, HTTPS, variabili ambiente e monitoraggio.

## Regole di sicurezza da mantenere
- Non inserire mai `SUPABASE_SERVICE_ROLE_KEY`, Discord Client Secret o webhook privati nel browser.
- Le autorizzazioni devono essere applicate nel database e nelle API server-side, non soltanto nascondendo pulsanti.
- L'owner approva e pubblica contenuti; collaboratori possono preparare e inviare bozze.
- Il ruolo viene modificato soltanto da operazioni amministrative fidate.
- L'audit log non è modificabile dai client.
- Il login Discord non sostituisce MFA/2FA del proprietario.
- Prima della pubblicazione, implementare una procedura server-side atomica che verifichi esattamente 10 carte per mazzo e che la carta principale appartenga a quelle 10.
- Per gli Update, verificare la presenza delle traduzioni richieste EN/IT/ES/FR prima della pubblicazione.

## Variabili ambiente
Copiare `.env.example` in `.env.local` e compilare i valori nel proprio ambiente di hosting. Non condividere il file compilato e non inserirlo nel repository.

## Limiti attuali
Lo schema è una base backend da applicare e testare in un progetto Supabase reale. OAuth Discord, MFA, notifiche, backup, storage, hosting e procedure di approvazione non diventano attivi finché non vengono configurati e verificati nei rispettivi servizi.
