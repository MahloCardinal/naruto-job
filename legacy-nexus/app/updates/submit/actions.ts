'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
const languages = ['en','it','es','fr'] as const;
export async function submitUpdateAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/updates/submit?error=supabase_not_configured');
  const { data:{user} } = await supabase.auth.getUser();
  if (!user) redirect('/updates/submit?error=login_required');
  const { data:profile } = await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if (!profile || !['collaborator','owner'].includes(profile.role)) redirect('/updates/submit?error=collaborator_only');
  const category = String(formData.get('category') || '');
  if (!['patch_notes','events','new_season','updates','announcements'].includes(category)) redirect('/updates/submit?error=invalid_category');
  const translations = languages.map(language_code => ({language_code,title:String(formData.get(`${language_code}_title`)||'').trim(),summary:String(formData.get(`${language_code}_summary`)||'').trim(),body:String(formData.get(`${language_code}_body`)||'').trim()}));
  const {error} = await supabase.rpc('submit_update',{p_category:category,p_featured:formData.get('featured')==='on',p_translations:translations});
  if (error) redirect(`/updates/submit?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin');
  redirect('/updates/submit?success=submitted');
}
