import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { publishTierListAction, reviewApplicationAction, reviewDeckAction, reviewUpdateAction } from './actions';
import { AdminTierListEditor } from '@/components/admin-tierlist-editor';

export const dynamic = 'force-dynamic';

function dateLabel(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Rome' }).format(new Date(value));
}

export default async function Admin({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <main className="container page"><div className="page-heading"><div className="eyebrow">RESTRICTED AREA</div><h1>NEXUS <em>CONTROL</em></h1><p>Area riservata al proprietario.</p></div><div className="empty panel"><b>Configurazione non completata</b><p>Collega Supabase e configura Discord OAuth per attivare l'accesso. Nessuna funzione amministrativa è disponibile finché la configurazione non è verificata.</p></div></main>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="container page"><div className="page-heading"><div className="eyebrow">RESTRICTED AREA</div><h1>NEXUS <em>CONTROL</em></h1></div><div className="empty panel"><b>Accesso richiesto</b><p>Accedi con Discord per verificare i permessi del tuo profilo.</p><Link className="primary" href="/">Torna alla homepage</Link></div></main>;

  const { data: profile, error: profileError } = await supabase.from('profiles').select('role, username').eq('id', user.id).maybeSingle();
  if (profileError || profile?.role !== 'owner') return <main className="container page"><div className="page-heading"><div className="eyebrow">ACCESS DENIED</div><h1>NEXUS <em>CONTROL</em></h1></div><div className="empty panel"><b>Permessi insufficienti</b><p>Questa area è riservata esclusivamente al proprietario NEXUS. Il login Discord da solo non concede privilegi amministrativi.</p></div></main>;

  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const mfaReady = assurance?.currentLevel === 'aal2';

  const [decksCount, pendingDecks, updatesCount, pendingUpdates, applicationsCount, applications, lastTier, publishedDecks, currentTierEntries] = await Promise.all([
    supabase.from('decks').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('decks').select('id,name,description,strategy,tier,created_at,author:profiles!decks_author_id_fkey(username)').eq('status', 'pending').order('created_at', { ascending: true }).limit(30),
    supabase.from('updates').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('updates').select('id,category,created_at,author:profiles!updates_author_id_fkey(username),update_translations(language_code,title,summary)').in('status', ['draft','pending']).order('created_at', { ascending: true }).limit(30),
    supabase.from('collaborator_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('collaborator_applications').select('id,message,created_at,applicant:profiles!collaborator_applications_user_id_fkey(username)').eq('status', 'pending').order('created_at', { ascending: true }).limit(30),
    supabase.from('tierlist_releases').select('published_at').order('published_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('decks').select('id,name,tier,principal_card_id').eq('status','published').order('name'),
    supabase.from('tierlist_entries').select('deck_id,tier,sort_order').order('tier').order('sort_order'),
  ]);

  const links = [['Tier List','/tierlist','Gestione fasce e ordine'],['Mazzi','/decks','Archivio e invio proposte'],['Update','/updates','Notizie e traduzioni'],['Invia Update','/updates/submit','Prepara una comunicazione'],['Database carte','/cards','Catalogo delle 290 carte']];
  const queryError = params.error ? decodeURIComponent(params.error) : '';
  return <main className="container page">
    <div className="page-heading"><div className="eyebrow">OWNER WORKSPACE</div><h1>NEXUS <em>CONTROL</em></h1><p>Sessione proprietario verificata · {profile.username || user.email || 'Owner'}</p></div>
    {!mfaReady && <div className="panel admin-warning" role="alert"><b>Verifica MFA richiesta</b><p>Per eseguire operazioni amministrative devi attivare e completare l'autenticazione a due fattori. Le azioni di revisione restano bloccate finché la sessione non raggiunge il livello AAL2.</p></div>}
    {queryError && <div className="panel admin-warning" role="alert"><b>Operazione non completata</b><p>{queryError}</p></div>}
    {params.success && <div className="panel" role="status"><b>Operazione completata.</b></div>}
    <div className="admin-stats">
      <div className="panel"><small>Mazzi pubblicati</small><strong>{decksCount.count ?? '—'}</strong></div>
      <div className="panel"><small>Mazzi in attesa</small><strong>{pendingDecks.data?.length ?? '—'}</strong></div>
      <div className="panel"><small>Update pubblicati</small><strong>{updatesCount.count ?? '—'}</strong></div>
      <div className="panel"><small>Candidature aperte</small><strong>{applicationsCount.count ?? '—'}</strong></div>
    </div>
    <div className="panel admin-last-update"><b>Ultima pubblicazione Tier List:</b> {dateLabel(lastTier.data?.published_at)}</div>
    <h2 className="section-title">Revisioni in sospeso</h2>
    <section className="panel admin-queue"><h3>Mazzi da approvare ({pendingDecks.data?.length ?? 0})</h3>
      {!pendingDecks.data?.length ? <p className="muted">Nessun mazzo in attesa.</p> : pendingDecks.data.map((deck: any) => <article className="admin-queue-item" key={deck.id}><div><b>{deck.name}</b><p>{deck.description}</p><small>Autore: {deck.author?.username ?? 'Utente'} · Strategia: {deck.strategy} · {dateLabel(deck.created_at)}</small></div><div className="admin-actions"><form action={reviewDeckAction}><input type="hidden" name="id" value={deck.id}/><button className="primary" name="decision" value="publish">Pubblica</button></form><form action={reviewDeckAction}><input type="hidden" name="id" value={deck.id}/><button className="secondary" name="decision" value="reject">Rifiuta</button></form></div></article>)}</section>
    <section className="panel admin-queue"><h3>Update da revisionare ({pendingUpdates.data?.length ?? 0})</h3>
      {!pendingUpdates.data?.length ? <p className="muted">Nessun aggiornamento in attesa.</p> : pendingUpdates.data.map((item: any) => { const translations = item.update_translations ?? []; const title = translations.find((t: any) => t.language_code === 'it')?.title ?? translations[0]?.title ?? 'Titolo non disponibile'; return <article className="admin-queue-item" key={item.id}><div><b>{title}</b><p>{item.category}</p><small>Autore: {item.author?.username ?? 'Utente'} · {dateLabel(item.created_at)} · Traduzioni: {translations.length}/4</small></div><div className="admin-actions"><form action={reviewUpdateAction}><input type="hidden" name="id" value={item.id}/><button className="primary" name="decision" value="publish">Pubblica</button></form><form action={reviewUpdateAction}><input type="hidden" name="id" value={item.id}/><button className="secondary" name="decision" value="reject">Rifiuta</button></form></div></article>; })}</section>
    <section className="panel admin-queue"><h3>Candidature collaboratori ({applications.data?.length ?? 0})</h3>
      {!applications.data?.length ? <p className="muted">Nessuna candidatura in attesa.</p> : applications.data.map((item: any) => <article className="admin-queue-item" key={item.id}><div><b>{item.applicant?.username ?? 'Utente'}</b><p>{item.message}</p><small>{dateLabel(item.created_at)}</small></div><div className="admin-actions"><form action={reviewApplicationAction}><input type="hidden" name="id" value={item.id}/><button className="primary" name="decision" value="accept">Accetta</button></form><form action={reviewApplicationAction}><input type="hidden" name="id" value={item.id}/><button className="secondary" name="decision" value="reject">Rifiuta</button></form></div></article>)}</section>
    <h2 className="section-title">Tier List</h2><AdminTierListEditor decks={publishedDecks.data ?? []} initialEntries={currentTierEntries.data ?? []} action={publishTierListAction} />
    <h2 className="section-title">Gestione NEXUS</h2><div className="admin-grid">{links.map(([title,href,desc])=><Link className="admin-link panel" href={href} key={href}><b>{title}</b><span>{desc}</span><i>Apri →</i></Link>)}</div>
    <div className="panel admin-warning"><b>Protezione amministrativa</b><p>Le azioni vengono eseguite da funzioni SQL con controllo del ruolo owner. Prima di attivare l'area online occorre applicare tutte le migrazioni Supabase e configurare MFA per il proprietario.</p></div>
  </main>;
}
