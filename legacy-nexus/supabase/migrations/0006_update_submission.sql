-- Atomic submission of a fully translated update by collaborators or owner.
create or replace function public.submit_update(
  p_category public.update_category,
  p_featured boolean,
  p_translations jsonb
) returns uuid
language plpgsql security definer set search_path=public
as $$
declare
  v_user uuid := auth.uid(); v_id uuid; v_count integer; v_lang text; v_item jsonb;
begin
  if v_user is null then raise exception 'Accedi con Discord per inviare un aggiornamento'; end if;
  if not public.is_collaborator_or_owner() then raise exception 'Solo collaboratori e proprietario possono inviare aggiornamenti'; end if;
  if jsonb_typeof(p_translations) <> 'array' then raise exception 'Traduzioni non valide'; end if;
  select count(distinct value->>'language_code') into v_count from jsonb_array_elements(p_translations);
  if v_count <> 4 or jsonb_array_length(p_translations) <> 4 then raise exception 'Sono richieste esattamente quattro traduzioni: EN, IT, ES e FR'; end if;
  for v_item in select value from jsonb_array_elements(p_translations) loop
    v_lang := v_item->>'language_code';
    if v_lang is null or v_lang not in ('en','it','es','fr') then raise exception 'Lingua non supportata'; end if;
    if length(trim(coalesce(v_item->>'title',''))) < 3 or length(coalesce(v_item->>'title','')) > 140 then raise exception 'Titolo non valido'; end if;
    if length(trim(coalesce(v_item->>'summary',''))) < 10 or length(coalesce(v_item->>'summary','')) > 300 then raise exception 'Sommario non valido'; end if;
    if length(trim(coalesce(v_item->>'body',''))) < 20 or length(coalesce(v_item->>'body','')) > 20000 then raise exception 'Testo aggiornamento non valido'; end if;
  end loop;
  insert into public.updates(author_id,category,featured,status) values(v_user,p_category,coalesce(p_featured,false),'pending') returning id into v_id;
  insert into public.update_translations(update_id,language_code,title,summary,body)
    select v_id, x->>'language_code', trim(x->>'title'), trim(x->>'summary'), trim(x->>'body') from jsonb_array_elements(p_translations) x;
  insert into public.admin_notifications(event_type,entity_type,entity_id,payload) values('update_submitted','update',v_id::text,jsonb_build_object('author_id',v_user,'category',p_category));
  insert into public.audit_log(actor_id,action,entity_type,entity_id) values(v_user,'update_submitted','update',v_id::text);
  return v_id;
end;
$$;
revoke all on function public.submit_update(public.update_category,boolean,jsonb) from public;
grant execute on function public.submit_update(public.update_category,boolean,jsonb) to authenticated;
