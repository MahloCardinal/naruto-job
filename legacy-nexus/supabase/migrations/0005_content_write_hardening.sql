-- NEXUS migration 0005: force public content changes through validated RPC workflows.
-- Apply after migrations 0001–0004.
-- RLS policies are not sufficient on their own: PostgreSQL table grants must also
-- prevent authenticated clients from bypassing submit_deck/review_deck/publish_tierlist.

-- Decks are publicly readable according to RLS, but client writes must go through
-- the SECURITY DEFINER RPCs so the 10-card and principal-card checks cannot be bypassed.
revoke insert, update, delete, truncate, references, trigger on table public.decks from anon, authenticated;
grant select on table public.decks to anon, authenticated;

revoke insert, update, delete, truncate, references, trigger on table public.deck_cards from anon, authenticated;
grant select on table public.deck_cards to anon, authenticated;

-- Tier List replacement is performed only by publish_tierlist() in one transaction.
revoke insert, update, delete, truncate, references, trigger on table public.tierlist_entries from anon, authenticated;
grant select on table public.tierlist_entries to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on table public.tierlist_releases from anon, authenticated;
grant select on table public.tierlist_releases to anon, authenticated;

-- Prevent direct client writes to immutable administrative history and notifications.
revoke insert, update, delete, truncate, references, trigger on table public.audit_log from anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on table public.admin_notifications from anon, authenticated;
grant select on table public.admin_notifications to authenticated;

-- Keep the card catalog read-only for all client roles.
revoke insert, update, delete, truncate, references, trigger on table public.card_catalog from anon, authenticated;
grant select on table public.card_catalog to anon, authenticated;

