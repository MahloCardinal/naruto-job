'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function requireOwner() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/admin?error=supabase_not_configured');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin?error=login_required');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'owner') redirect('/admin?error=owner_only');
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance?.currentLevel !== 'aal2') redirect('/admin?error=mfa_required');
  return supabase;
}

export async function reviewDeckAction(formData: FormData) {
  const supabase = await requireOwner();
  const id = String(formData.get('id') || '');
  const decision = String(formData.get('decision') || '');
  if (!id || !['publish', 'reject'].includes(decision)) redirect('/admin?error=invalid_request');
  const { error } = await supabase.rpc('review_deck', { p_deck_id: id, p_decision: decision });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin'); revalidatePath('/decks'); revalidatePath('/tierlist');
  redirect('/admin?success=deck_reviewed');
}

export async function reviewUpdateAction(formData: FormData) {
  const supabase = await requireOwner();
  const id = String(formData.get('id') || '');
  const decision = String(formData.get('decision') || '');
  if (!id || !['publish', 'reject'].includes(decision)) redirect('/admin?error=invalid_request');
  const { error } = await supabase.rpc('review_update', { p_update_id: id, p_decision: decision });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin'); revalidatePath('/updates');
  redirect('/admin?success=update_reviewed');
}

export async function reviewApplicationAction(formData: FormData) {
  const supabase = await requireOwner();
  const id = String(formData.get('id') || '');
  const decision = String(formData.get('decision') || '');
  if (!id || !['accept', 'reject'].includes(decision)) redirect('/admin?error=invalid_request');
  const { error } = await supabase.rpc('review_collaborator_application', { p_application_id: id, p_decision: decision });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin');
  redirect('/admin?success=application_reviewed');
}

export async function publishTierListAction(formData: FormData) {
  const supabase = await requireOwner();
  const raw = String(formData.get('entries') || '[]');
  const note = String(formData.get('note') || '').slice(0, 300);
  let entries: unknown;
  try { entries = JSON.parse(raw); } catch { redirect('/admin?error=invalid_tierlist_json'); }
  if (!Array.isArray(entries) || entries.length > 500) redirect('/admin?error=invalid_tierlist');
  const { error } = await supabase.rpc('publish_tierlist', { p_entries: entries, p_note: note });
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin'); revalidatePath('/tierlist');
  redirect('/admin?success=tierlist_published');
}
