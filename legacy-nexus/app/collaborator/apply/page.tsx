import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { submitCollaboratorApplication } from './actions';

export const dynamic = 'force-dynamic';
export default async function CollaboratorApplication({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  let signedIn = false;
  let currentStatus: string | null = null;
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    signedIn = Boolean(user);
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (profile?.role === 'owner' || profile?.role === 'collaborator') currentStatus = profile.role;
      const { data: application } = await supabase.from('collaborator_applications').select('status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!currentStatus) currentStatus = application?.status ?? null;
    }
  }
  const messages: Record<string, string> = { supabase_not_configured: 'Il servizio non è ancora configurato.', login_required: 'Accedi con Discord prima di inviare la candidatura.', already_authorized: 'Il tuo account possiede già un ruolo autorizzato.', message_too_short: 'Scrivi una presentazione di almeno 30 caratteri.', application_check_failed: 'Non è stato possibile verificare le candidature precedenti.', already_pending: 'Hai già una candidatura in attesa.' };
  return <main className="container page"><div className="page-heading"><div className="eyebrow">NEXUS COMMUNITY</div><h1>DIVENTA <em>COLLABORATORE</em></h1><p>Aiuta a mantenere aggiornato NEXUS preparando mazzi e comunicazioni. Ogni contributo viene revisionato dal proprietario prima della pubblicazione.</p></div>
    {params.error && <div className="panel admin-warning" role="alert">{messages[params.error] ?? params.error}</div>}
    {params.success && <div className="panel" role="status"><b>Candidatura inviata.</b><p>È stata inserita nella coda di revisione del proprietario.</p></div>}
    {currentStatus === 'collaborator' || currentStatus === 'owner' ? <div className="panel empty"><b>Ruolo già attivo</b><p>Il tuo account è già autorizzato come {currentStatus === 'owner' ? 'proprietario' : 'collaboratore'}.</p></div> : currentStatus === 'pending' ? <div className="panel empty"><b>Candidatura in revisione</b><p>Hai già una candidatura in attesa. Ti verrà comunicato l'esito tramite i canali NEXUS previsti.</p></div> : !signedIn ? <div className="panel empty"><b>Accesso richiesto</b><p>Per candidarti devi prima accedere con Discord.</p><Link className="primary" href="/">Torna alla homepage e accedi</Link></div> : <form className="update-submit-form panel" action={submitCollaboratorApplication}><label htmlFor="application-message">Presentati e racconta come vorresti contribuire</label><textarea id="application-message" name="message" rows={8} minLength={30} maxLength={2000} required placeholder="Esperienza con Naruto Ninja Cards, mazzi, traduzioni, aggiornamenti…"/><small>Da 30 a 2000 caratteri. Il proprietario valuterà la candidatura.</small><button className="primary" type="submit">Invia candidatura</button></form>}
  </main>;
}
