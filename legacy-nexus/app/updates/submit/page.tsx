import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { submitUpdateAction } from './actions';
export const dynamic='force-dynamic';
const langs=[{code:'en',label:'English'},{code:'it',label:'Italiano'},{code:'es',label:'Español'},{code:'fr',label:'Français'}];
export default async function SubmitUpdate({searchParams}:{searchParams:Promise<{error?:string;success?:string}>}) {
 const params=await searchParams;const supabase=await createSupabaseServerClient();let role='guest';
 if(supabase){const {data:{user}}=await supabase.auth.getUser();if(user){const {data}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();role=data?.role??'user';}}
 const messages:Record<string,string>={supabase_not_configured:'Il database non è ancora configurato.',login_required:'Accedi con Discord per continuare.',collaborator_only:'L’invio è riservato ai collaboratori e al proprietario.',invalid_category:'Categoria non valida.'};
 const error=params.error?(messages[params.error]??decodeURIComponent(params.error)):'';
 return <main className="container page"><div className="page-heading"><div className="eyebrow">CONTRIBUTOR WORKSPACE</div><h1>INVIA UN <em>UPDATE</em></h1><p>Prepara una comunicazione per la community. La pubblicazione avviene soltanto dopo l’approvazione del proprietario.</p></div>
 {params.success&&<div className="panel" role="status"><b>Proposta inviata.</b><p>L’aggiornamento è in attesa di revisione.</p></div>}{error&&<div className="panel admin-warning" role="alert"><b>Invio non completato</b><p>{error}</p></div>}
 {role==='guest'||role==='user'?<section className="panel empty"><b>Accesso collaboratore richiesto</b><p>Devi accedere con Discord e avere il ruolo collaboratore o proprietario.</p><Link className="primary" href="/">Torna alla homepage</Link></section>:<form action={submitUpdateAction} className="panel update-submit-form">
 <label>Categoria<select name="category" required defaultValue="updates"><option value="patch_notes">Patch Notes</option><option value="events">Eventi</option><option value="new_season">Nuove Season</option><option value="updates">Aggiornamenti</option><option value="announcements">Annunci</option></select></label>
 <label className="check-line"><input type="checkbox" name="featured"/> Proponi come aggiornamento in evidenza</label><p className="muted">Compila tutte e quattro le lingue. Titolo: 3–140 caratteri; sommario: 10–300; testo: 20–20.000.</p>
 {langs.map(lang=><fieldset className="translation-fieldset" key={lang.code}><legend>{lang.label} · {lang.code.toUpperCase()}</legend><label>Titolo<input name={`${lang.code}_title`} required minLength={3} maxLength={140}/></label><label>Sommario<textarea name={`${lang.code}_summary`} required minLength={10} maxLength={300} rows={2}/></label><label>Testo completo<textarea name={`${lang.code}_body`} required minLength={20} maxLength={20000} rows={6}/></label></fieldset>)}
 <button className="primary" type="submit">Invia per approvazione</button></form>}</main>;
}
