-- NEXUS community reactions, collaborator applications and update publication.
-- Apply after migrations 0001 and 0002.

-- A user can keep one open collaborator application at a time.
create unique index if not exists collaborator_one_pending_per_user
  on public.collaborator_applications(user_id) where status='pending';

create policy "users read own collaborator applications"
  on public.collaborator_applications for select
  using (auth.uid()=user_id or public.is_owner());
create policy "users submit own collaborator applications"
  on public.collaborator_applications for insert
  with check (auth.uid()=user_id and status='pending' and reviewed_by is null and reviewed_at is null);
create policy "owner reviews collaborator applications"
  on public.collaborator_applications for update
  using (public.is_owner()) with check (public.is_owner());

create or replace function public.apply_as_collaborator(p_message text)
returns uuid
language plpgsql security definer set search_path=public
as $$
declare v_user uuid := auth.uid(); v_id uuid;
begin
  if v_user is null then raise exception 'Accedi con Discord per candidarti'; end if;
  if public.current_role() in ('collaborator','owner') then raise exception 'Il tuo profilo dispone già dei permessi di collaborazione'; end if;
  if length(trim(coalesce(p_message,''))) < 20 or length(p_message) > 1200 then
    raise exception 'La presentazione deve contenere da 20 a 1200 caratteri';
  end if;
  insert into public.collaborator_applications(user_id,message)
  values(v_user,trim(p_message)) returning id into v_id;
  insert into public.admin_notifications(event_type,entity_type,entity_id,payload)
  values('collaborator_application','application',v_id::text,jsonb_build_object('user_id',v_user));
  insert into public.audit_log(actor_id,action,entity_type,entity_id)
  values(v_user,'collaborator_applied','application',v_id::text);
  return v_id;
exception when unique_violation then
  raise exception 'Hai già una candidatura in attesa di revisione';
end;
$$;

create or replace function public.review_collaborator_application(p_application_id uuid,p_decision text)
returns void
language plpgsql security definer set search_path=public
as $$
declare v_user uuid := auth.uid(); v_app public.collaborator_applications%rowtype;
begin
  if v_user is null or not public.is_owner() then raise exception 'Operazione riservata al proprietario'; end if;
  if p_decision not in ('accept','reject') then raise exception 'Decisione non valida'; end if;
  select * into v_app from public.collaborator_applications where id=p_application_id for update;
  if not found or v_app.status <> 'pending' then raise exception 'Candidatura non trovata o già revisionata'; end if;
  update public.collaborator_applications
    set status=case when p_decision='accept' then 'accepted' else 'rejected' end,
        reviewed_by=v_user,reviewed_at=now()
    where id=p_application_id;
  if p_decision='accept' then
    update public.profiles set role='collaborator',updated_at=now()
      where id=v_app.user_id and role='user';
  end if;
  insert into public.audit_log(actor_id,action,entity_type,entity_id,details)
  values(v_user,'collaborator_application_'||p_decision,'application',p_application_id::text,
         jsonb_build_object('applicant_id',v_app.user_id));
end;
$$;

-- Like/unlike is idempotent and always acts on the authenticated user.
create or replace function public.toggle_deck_like(p_deck_id uuid)
returns table(liked boolean,likes_count bigint)
language plpgsql security definer set search_path=public
as $$
declare v_user uuid := auth.uid(); v_deleted integer;
begin
  if v_user is null then raise exception 'Accedi con Discord per mettere Mi piace'; end if;
  perform 1 from public.decks where id=p_deck_id and status='published' for update;
  if not found then raise exception 'Mazzo non disponibile'; end if;
  delete from public.deck_likes where deck_id=p_deck_id and user_id=v_user;
  get diagnostics v_deleted = row_count;
  if v_deleted=0 then
    insert into public.deck_likes(deck_id,user_id) values(p_deck_id,v_user);
    liked := true;
  else
    liked := false;
  end if;
  select count(*) into likes_count from public.deck_likes where deck_id=p_deck_id;
  return next;
end;
$$;

-- Owner-only update publication: four localized versions are mandatory.
create or replace function public.review_update(p_update_id uuid,p_decision text)
returns void
language plpgsql security definer set search_path=public
as $$
declare v_user uuid := auth.uid(); v_update public.updates%rowtype; v_languages integer;
begin
  if v_user is null or not public.is_owner() then raise exception 'Operazione riservata al proprietario'; end if;
  if p_decision not in ('publish','reject') then raise exception 'Decisione non valida'; end if;
  select * into v_update from public.updates where id=p_update_id for update;
  if not found or v_update.status not in ('draft','pending','rejected') then
    raise exception 'Aggiornamento non trovato o non revisionabile';
  end if;
  if p_decision='publish' then
    select count(distinct language_code) into v_languages
      from public.update_translations where update_id=p_update_id and language_code in ('en','it','es','fr')
      and length(trim(title))>0 and length(trim(body))>0;
    if v_languages <> 4 then raise exception 'Per pubblicare servono le traduzioni complete EN, IT, ES e FR'; end if;
    update public.updates set status='published',published_at=now(),approved_by=v_user,approved_at=now(),updated_at=now()
      where id=p_update_id;
  else
    update public.updates set status='rejected',approved_by=v_user,approved_at=now(),updated_at=now()
      where id=p_update_id;
  end if;
  insert into public.audit_log(actor_id,action,entity_type,entity_id,details)
  values(v_user,'update_'||p_decision,'update',p_update_id::text,jsonb_build_object('category',v_update.category));
end;
$$;

revoke all on function public.apply_as_collaborator(text) from public;
revoke all on function public.review_collaborator_application(uuid,text) from public;
revoke all on function public.toggle_deck_like(uuid) from public;
revoke all on function public.review_update(uuid,text) from public;
grant execute on function public.apply_as_collaborator(text) to authenticated;
grant execute on function public.review_collaborator_application(uuid,text) to authenticated;
grant execute on function public.toggle_deck_like(uuid) to authenticated;
grant execute on function public.review_update(uuid,text) to authenticated;

-- Notification rows are private to the owner; service code delivers Discord webhooks.
create policy "owner reads admin notifications"
  on public.admin_notifications for select using (public.is_owner());
revoke all on public.admin_notifications from anon, authenticated;
grant select on public.admin_notifications to authenticated;
