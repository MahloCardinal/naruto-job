# NEXUS — avanzamento backend

## Migrazioni SQL
1. `0001_nexus_schema.sql` — schema di base, ruoli, profili, mazzi, Tier List, update e RLS.
2. `0002_nexus_workflows_and_card_catalog.sql` — catalogo carte e procedure iniziali.
3. `0003_community_and_updates_workflows.sql` — candidature, reazioni e revisione Update.
4. `0004_deck_and_tierlist_publication.sql` — invio transazionale di mazzi da collaboratori, revisione owner e pubblicazione atomica della Tier List.

## Procedure della migrazione 0004
- `submit_deck(...)`: richiede sessione autenticata e ruolo collaborator/owner; verifica 10 ID distinti, esistenza nel catalogo e appartenenza della carta principale; inserisce mazzo, carte, notifica e audit nella stessa transazione.
- `review_deck(uuid, decision)`: owner-only; approva o rifiuta esclusivamente proposte pending e registra l'operazione.
- `publish_tierlist(jsonb, note)`: owner-only; accetta solo mazzi pubblicati, impedisce duplicati e sostituisce l'intera Tier List in una singola transazione, registrando il rilascio.

## Non ancora attivo
Le migrazioni sono file sorgente: non sono state applicate a un progetto Supabase reale. Le procedure non sono quindi disponibili online finché il proprietario non configura Supabase e applica le migrazioni nell'ordine indicato. La UI amministrativa non invoca ancora queste procedure. OAuth Discord, MFA owner, notifiche Discord e backup richiedono configurazione e test esterni.

## Controlli eseguiti localmente
- Catalogo JSON validato con `scripts/validate_cards.py`.
- Non dichiarare la build Next.js superata finché le dipendenze non sono installate e `npm run build` non termina correttamente.

## 2026-11-10 — Update submission workflow

- Added migration `0006_update_submission.sql` with an atomic `submit_update` RPC.
- Submission is restricted to authenticated collaborators and the owner.
- Exactly four translations are required (EN/IT/ES/FR); title, summary and body lengths are validated server-side.
- The update and all translations are inserted in one database transaction, with an admin notification and audit event.
- Added `/updates/submit` page and server action. It checks the current authenticated profile role and sends valid submissions to the owner review queue.
- Added the submission route to the owner workspace and responsive form styling.

**Not yet live-tested:** migration still needs to be applied to a real Supabase project; OAuth, RLS and the RPC must be exercised with test accounts before production use.
