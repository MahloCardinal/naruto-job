-- NEXUS migration 0004: secure deck submission/review and atomic Tier List releases.
-- Apply after migrations 0001, 0002 and 0003.

-- Collaborators (and owner) can submit a complete 10-card deck in one transaction.
create or replace function public.submit_deck(
  p_name text,
  p_description text,
  p_strategy text,
  p_tier public.deck_tier,
  p_card_ids text[],
  p_principal_card_id text,
  p_combos text default '',
  p_strengths text default '',
  p_weaknesses text default ''
) returns uuid
language plpgsql security definer set search_path=public
as $$
declare
  v_user uuid := auth.uid();
  v_deck uuid;
  v_distinct integer;
  v_valid integer;
begin
  if v_user is null then raise exception 'Accedi con Discord per inviare un mazzo'; end if;
  if public.current_role() not in ('collaborator','owner') then
    raise exception 'Solo i collaboratori autorizzati possono inviare mazzi';
  end if;
  if length(trim(coalesce(p_name,''))) not between 2 and 80 then raise exception 'Il nome deve contenere da 2 a 80 caratteri'; end if;
  if length(trim(coalesce(p_description,''))) < 10 or length(p_description)>500 then raise exception 'La descrizione deve contenere da 10 a 500 caratteri'; end if;
  if length(trim(coalesce(p_strategy,'')))=0 or length(p_strategy)>80 then raise exception 'Indica il tipo di strategia'; end if;
  if coalesce(array_length(p_card_ids,1),0) <> 10 then raise exception 'Un mazzo deve contenere esattamente 10 carte'; end if;
  select count(distinct x) into v_distinct from unnest(p_card_ids) x;
  if v_distinct <> 10 then raise exception 'Le 10 carte devono essere uniche'; end if;
  if p_principal_card_id is null or not (p_principal_card_id=any(p_card_ids)) then
    raise exception 'La carta principale deve appartenere alle 10 carte selezionate';
  end if;
  select count(*) into v_valid from public.card_catalog where id=any(p_card_ids);
  if v_valid <> 10 then raise exception 'Una o più carte non esistono nel catalogo NEXUS'; end if;

  insert into public.decks(author_id,name,description,strategy,tier,status,principal_card_id,combos,strengths,weaknesses)
  values(v_user,trim(p_name),trim(p_description),trim(p_strategy),p_tier,'pending',p_principal_card_id,
         coalesce(p_combos,''),coalesce(p_strengths,''),coalesce(p_weaknesses,'')) returning id into v_deck;
  insert into public.deck_cards(deck_id,card_id,position)
  select v_deck,card_id,ordinality::smallint from unnest(p_card_ids) with ordinality as c(card_id,ordinality);
  insert into public.admin_notifications(event_type,entity_type,entity_id,payload)
  values('deck_submission','deck',v_deck::text,jsonb_build_object('author_id',v_user,'name',trim(p_name)));
  insert into public.audit_log(actor_id,action,entity_type,entity_id)
  values(v_user,'deck_submitted','deck',v_deck::text);
  return v_deck;
end;
$$;

create or replace function public.review_deck(p_deck_id uuid,p_decision text)
returns void
language plpgsql security definer set search_path=public
as $$
declare v_user uuid := auth.uid(); v_deck public.decks%rowtype; v_count integer;
begin
  if v_user is null or not public.is_owner() then raise exception 'Operazione riservata al proprietario'; end if;
  if p_decision not in ('publish','reject') then raise exception 'Decisione non valida'; end if;
  select * into v_deck from public.decks where id=p_deck_id for update;
  if not found or v_deck.status <> 'pending' then raise exception 'Mazzo non trovato o non in attesa'; end if;
  select count(*) into v_count from public.deck_cards where deck_id=p_deck_id;
  if p_decision='publish' and v_count <> 10 then raise exception 'Il mazzo non contiene esattamente 10 carte'; end if;
  update public.decks set status=case when p_decision='publish' then 'published'::public.content_status else 'rejected'::public.content_status end,
    approved_by=v_user,approved_at=now(),published_at=case when p_decision='publish' then now() else null end,updated_at=now()
    where id=p_deck_id;
  insert into public.audit_log(actor_id,action,entity_type,entity_id)
  values(v_user,'deck_'||p_decision,'deck',p_deck_id::text);
end;
$$;

-- Owner publishes the entire current Tier List as one atomic replacement.
-- Payload format: [{"deck_id":"uuid","tier":"S","sort_order":0}, ...]
create or replace function public.publish_tierlist(p_entries jsonb,p_note text default '')
returns uuid
language plpgsql security definer set search_path=public
as $$
declare v_user uuid := auth.uid(); v_release uuid; v_total integer; v_unique integer; v_valid integer;
begin
  if v_user is null or not public.is_owner() then raise exception 'Operazione riservata al proprietario'; end if;
  if jsonb_typeof(p_entries) <> 'array' then raise exception 'La Tier List deve essere un elenco'; end if;
  if jsonb_array_length(p_entries) > 500 then raise exception 'Numero massimo di mazzi superato'; end if;
  select count(*) into v_total from jsonb_to_recordset(p_entries) as x(deck_id uuid,tier text,sort_order integer);
  select count(distinct deck_id) into v_unique from jsonb_to_recordset(p_entries) as x(deck_id uuid,tier text,sort_order integer);
  if v_total <> v_unique then raise exception 'Un mazzo non può comparire più di una volta'; end if;
  if exists(select 1 from jsonb_to_recordset(p_entries) as x(deck_id uuid,tier text,sort_order integer)
    where x.tier not in ('S','A','B','C') or x.sort_order is null or x.sort_order < 0) then
    raise exception 'Fascia o ordinamento non valido';
  end if;
  select count(*) into v_valid from jsonb_to_recordset(p_entries) as x(deck_id uuid,tier text,sort_order integer)
    join public.decks d on d.id=x.deck_id and d.status='published';
  if v_valid <> v_total then raise exception 'La Tier List può contenere soltanto mazzi pubblicati'; end if;

  delete from public.tierlist_entries;
  insert into public.tierlist_entries(deck_id,tier,sort_order)
  select deck_id,tier::public.deck_tier,sort_order
  from jsonb_to_recordset(p_entries) as x(deck_id uuid,tier text,sort_order integer);
  insert into public.tierlist_releases(published_by,note) values(v_user,coalesce(p_note,'')) returning id into v_release;
  insert into public.audit_log(actor_id,action,entity_type,entity_id,details)
  values(v_user,'tierlist_published','tierlist',v_release::text,jsonb_build_object('entries',v_total));
  return v_release;
end;
$$;

revoke all on function public.submit_deck(text,text,text,public.deck_tier,text[],text,text,text,text) from public;
revoke all on function public.review_deck(uuid,text) from public;
revoke all on function public.publish_tierlist(jsonb,text) from public;
grant execute on function public.submit_deck(text,text,text,public.deck_tier,text[],text,text,text,text) to authenticated;
grant execute on function public.review_deck(uuid,text) to authenticated;
grant execute on function public.publish_tierlist(jsonb,text) to authenticated;
