'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function submitCollaboratorApplication(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/collaborator/apply?error=supabase_not_configured');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/collaborator/apply?error=login_required');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role === 'owner' || profile?.role === 'collaborator') redirect('/collaborator/apply?error=already_authorized');
  const message = String(formData.get('message') || '').trim().slice(0, 2000);
  if (message.length < 30) redirect('/collaborator/apply?error=message_too_short');
  const { data: existing, error: lookupError } = await supabase.from('collaborator_applications').select('id,status').eq('user_id', user.id).eq('status', 'pending').maybeSingle();
  if (lookupError) redirect('/collaborator/apply?error=application_check_failed');
  if (existing) redirect('/collaborator/apply?error=already_pending');
  const { error } = await supabase.from('collaborator_applications').insert({ user_id: user.id, message, status: 'pending' });
  if (error) redirect(`/collaborator/apply?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin');
  redirect('/collaborator/apply?success=submitted');
}
