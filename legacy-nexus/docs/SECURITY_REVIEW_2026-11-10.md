# NEXUS — revisione sicurezza offline (10 novembre 2026)

## Intervento
Aggiunta la migrazione `0005_content_write_hardening.sql`.

La sola Row Level Security non sostituisce i privilegi SQL. La migrazione ora revoca ai ruoli `anon` e `authenticated` i privilegi diretti di scrittura sulle tabelle `decks`, `deck_cards`, `tierlist_entries`, `tierlist_releases`, `audit_log`, `admin_notifications` e `card_catalog`. Le letture restano consentite e continuano a essere filtrate dalle policy RLS. Le operazioni di scrittura previste devono passare dalle RPC validate già definite nelle migrazioni precedenti.

## Verifiche eseguite localmente
- `python scripts/validate_cards.py`: OK, 290 carte, ID univoci, campi obbligatori presenti.
- `python scripts/validate_project.py`: OK, catalogo sorgente e copia pubblica coerenti; migrazioni 0001–0005 presenti; marcatori delle procedure principali presenti; `.env.example` senza segreti valorizzati.
- Archivio ZIP: test CRC da eseguire dopo la generazione del pacchetto.

## Limiti
- Nessuna migrazione è stata applicata a un progetto Supabase remoto.
- Non è stato possibile installare i pacchetti npm: il registry ha restituito `EAI_AGAIN` (errore DNS/risoluzione host), non un errore TypeScript.
- Non sono stati eseguiti build Next.js, test SQL su PostgreSQL/Supabase o test end-to-end.
- La migrazione 0005 va prima provata su un progetto Supabase di test: la revoca dei privilegi è intenzionalmente restrittiva e richiede che le RPC siano le sole vie di scrittura previste.
