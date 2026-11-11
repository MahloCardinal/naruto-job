-- NEXUS initial schema for Supabase / PostgreSQL
-- Apply only after configuring Supabase Auth with Discord OAuth.
create extension if not exists pgcrypto;

create type public.nexus_role as enum ('user','collaborator','owner');
create type public.content_status as enum ('draft','pending','published','rejected');
create type public.deck_tier as enum ('S','A','B','C');
create type public.update_category as enum ('patch_notes','events','new_season','updates','announcements');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  discord_id text unique,
  username text not null,
  avatar_url text,
  bio text not null default '',
  role public.nexus_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decks (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  name text not null,
  description text not null default '',
  strategy text not null,
  tier public.deck_tier,
  season text,
  difficulty text,
  win_condition text not null default '',
  strengths text not null default '',
  weaknesses text not null default '',
  combos text not null default '',
  status public.content_status not null default 'draft',
  principal_card_id text not null,
  published_at timestamptz,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deck_name_length check (char_length(name) between 2 and 80),
  constraint deck_description_length check (char_length(description) <= 500)
);

create table public.deck_cards (
  deck_id uuid not null references public.decks(id) on delete cascade,
  card_id text not null,
  position smallint not null check (position between 1 and 10),
  primary key(deck_id, position),
  unique(deck_id, card_id)
);

create table public.deck_likes (
  deck_id uuid not null references public.decks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(deck_id,user_id)
);

create table public.tierlist_entries (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  tier public.deck_tier not null,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(deck_id)
);

create table public.tierlist_releases (
  id uuid primary key default gen_random_uuid(),
  published_at timestamptz not null default now(),
  published_by uuid not null references public.profiles(id),
  note text not null default ''
);

create table public.updates (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  category public.update_category not null,
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.update_translations (
  update_id uuid not null references public.updates(id) on delete cascade,
  language_code text not null check (language_code in ('en','it','es','fr')),
  title text not null,
  summary text not null default '',
  body text not null,
  primary key(update_id, language_code)
);

create table public.update_attachments (
  id uuid primary key default gen_random_uuid(),
  update_id uuid not null references public.updates(id) on delete cascade,
  kind text not null check (kind in ('image','video','source')),
  url text not null,
  label text not null default '',
  sort_order integer not null default 0
);

create table public.collaborator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index decks_public_latest_idx on public.decks(published_at desc) where status='published';
create index updates_public_latest_idx on public.updates(published_at desc) where status='published';
create index tierlist_order_idx on public.tierlist_entries(tier,sort_order);
create index deck_cards_card_idx on public.deck_cards(card_id);

create or replace function public.current_role()
returns public.nexus_role language sql stable security definer set search_path=public
as $$ select role from public.profiles where id=auth.uid() $$;
create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(public.current_role()='owner',false) $$;
create or replace function public.is_collaborator_or_owner()
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(public.current_role() in ('collaborator','owner'),false) $$;

alter table public.profiles enable row level security;
alter table public.decks enable row level security;
alter table public.deck_cards enable row level security;
alter table public.deck_likes enable row level security;
alter table public.tierlist_entries enable row level security;
alter table public.tierlist_releases enable row level security;
alter table public.updates enable row level security;
alter table public.update_translations enable row level security;
alter table public.update_attachments enable row level security;
alter table public.collaborator_applications enable row level security;
alter table public.audit_log enable row level security;
alter table public.admin_notifications enable row level security;

create policy "public profiles readable" on public.profiles for select using (true);
create policy "users update own bio only" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);
-- Role, Discord identity and avatar synchronization must be performed by trusted server code.

create policy "published decks public" on public.decks for select using (status='published' or auth.uid()=author_id or public.is_owner());
create policy "collaborators create own drafts" on public.decks for insert with check (public.is_collaborator_or_owner() and author_id=auth.uid() and status in ('draft','pending'));
create policy "authors edit own unapproved decks" on public.decks for update using ((author_id=auth.uid() and status in ('draft','pending','rejected')) or public.is_owner()) with check ((author_id=auth.uid() and status in ('draft','pending','rejected')) or public.is_owner());
create policy "deck cards readable with deck" on public.deck_cards for select using (exists(select 1 from public.decks d where d.id=deck_id and (d.status='published' or d.author_id=auth.uid() or public.is_owner())));
create policy "authors manage own deck cards" on public.deck_cards for all using (exists(select 1 from public.decks d where d.id=deck_id and (d.author_id=auth.uid() or public.is_owner()))) with check (exists(select 1 from public.decks d where d.id=deck_id and (d.author_id=auth.uid() or public.is_owner())));
create policy "likes public readable" on public.deck_likes for select using (true);
create policy "authenticated users add own like" on public.deck_likes for insert with check (auth.uid()=user_id);
create policy "users remove own like" on public.deck_likes for delete using (auth.uid()=user_id);
create policy "tier list public readable" on public.tierlist_entries for select using (true);
create policy "owner manages tier list" on public.tierlist_entries for all using (public.is_owner()) with check (public.is_owner());
create policy "tier releases public readable" on public.tierlist_releases for select using (true);
create policy "owner creates tier releases" on public.tierlist_releases for insert with check (public.is_owner() and published_by=auth.uid());
create policy "published updates public" on public.updates for select using (status='published' or author_id=auth.uid() or public.is_owner());
create policy "collaborators create own updates" on public.updates for insert with check (public.is_collaborator_or_owner() and author_id=auth.uid() and status in ('draft','pending'));
create policy "authors edit unapproved updates" on public.updates for update using ((author_id=auth.uid() and status in ('draft','pending','rejected')) or public.is_owner()) with check ((author_id=auth.uid() and status in ('draft','pending','rejected')) or public.is_owner());
create policy "translations visible with update" on public.update_translations for select using (exists(select 1 from public.updates u where u.id=update_id and (u.status='published' or u.author_id=auth.uid() or public.is_owner())));
create policy "authors manage translations" on public.update_translations for all using (exists(select 1 from public.updates u where u.id=update_id and (u.author_id=auth.uid() or public.is_owner()))) with check (exists(select 1 from public.updates u where u.id=update_id and (u.author_id=auth.uid() or public.is_owner())));
create policy "attachments visible with update" on public.update_attachments for select using (exists(select 1 from public.updates u where u.id=update_id and (u.status='published' or u.author_id=auth.uid() or public.is_owner())));
create policy "authors manage attachments" on public.update_attachments for all using (exists(select 1 from public.updates u where u.id=update_id and (u.author_id=auth.uid() or public.is_owner()))) with check (exists(select 1 from public.updates u where u.id=update_id and (u.author_id=auth.uid() or public.is_owner())));
create policy "users view own applications" on public.collaborator_applications for select using (auth.uid()=user_id or public.is_owner());
create policy "users submit own application" on public.collaborator_applications for insert with check (auth.uid()=user_id);
create policy "owner reviews applications" on public.collaborator_applications for update using (public.is_owner()) with check (public.is_owner());
create policy "owner reads audit log" on public.audit_log for select using (public.is_owner());
create policy "no client audit writes" on public.audit_log for insert with check (false);
create policy "no client audit changes" on public.audit_log for update using (false);
create policy "no client audit deletes" on public.audit_log for delete using (false);
create policy "owner reads notifications" on public.admin_notifications for select using (public.is_owner());

-- Important setup after migration:
-- 1. Configure Discord provider in Supabase Auth.
-- 2. Set the first owner's role to 'owner' manually from a trusted SQL console.
-- 3. Use server-side service role only for Discord profile sync, role changes, audit logging,
--    approval/publication, Discord webhook delivery and immutable administrative events.
-- 4. Enable Supabase MFA (TOTP) and require aal2 for owner-only server actions.
-- 5. Configure scheduled encrypted database backups and test restore procedures.

-- Safe profile bootstrap from Discord OAuth user metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  insert into public.profiles(id, discord_id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'provider_id', new.raw_user_meta_data->>'sub'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'user_name', 'Ninja'),
    new.raw_user_meta_data->>'avatar_url'
  ) on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Prevent self-promotion or client-side tampering with Discord identity.
revoke update on public.profiles from authenticated;
grant update (bio) on public.profiles to authenticated;

-- Collaborators may edit card slots only while their own deck is not published.
drop policy if exists "authors manage own deck cards" on public.deck_cards;
create policy "authors manage unapproved deck cards" on public.deck_cards for all
using (exists(select 1 from public.decks d where d.id=deck_id and ((d.author_id=auth.uid() and d.status in ('draft','pending','rejected')) or public.is_owner())))
with check (exists(select 1 from public.decks d where d.id=deck_id and ((d.author_id=auth.uid() and d.status in ('draft','pending','rejected')) or public.is_owner())));
