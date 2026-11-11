import Image from 'next/image';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cards } from '@/lib/cards';
const tiers = [{key:'S',color:'#c52e3b',label:'TOP META'},{key:'A',color:'#c5a45d',label:'COMPETITIVI'},{key:'B',color:'#3977bd',label:'SITUAZIONALI'},{key:'C',color:'#399768',label:'DA SVILUPPARE'}] as const;
const cardById = new Map(cards.map(card => [card.id, card]));
export const dynamic = 'force-dynamic';
export default async function TierList(){
 const supabase=await createSupabaseServerClient(); let entries:any[]=[]; let publishedAt:string|null=null; let unavailable=false;
 if(supabase){const [e,r]=await Promise.all([supabase.from('tierlist_entries').select('id,tier,sort_order,deck:decks!inner(id,name,principal_card_id,status)').eq('deck.status','published').order('sort_order',{ascending:true}),supabase.from('tierlist_releases').select('published_at').order('published_at',{ascending:false}).limit(1).maybeSingle()]); if(e.error)unavailable=true;else entries=e.data??[];publishedAt=r.data?.published_at??null;}
 const isNew=publishedAt?Date.now()-new Date(publishedAt).getTime()<36*60*60*1000:false;
 return <main className="container page"><div className="page-heading"><div className="eyebrow">NEXUS META RANKING</div><h1>TIER <em>LIST</em></h1><p>Classifica manuale dei mazzi competitivi. L’ordinamento viene gestito dal proprietario.</p>{publishedAt?<div className="tier-update-date"><b>Tier List aggiornata il {new Intl.DateTimeFormat('it-IT',{dateStyle:'long',timeZone:'Europe/Rome'}).format(new Date(publishedAt))}</b>{isNew&&<span className="new-badge">NEW</span>}</div>:<b>Nessun aggiornamento pubblicato</b>}</div>
 {unavailable&&<div className="panel empty"><b>Database non raggiungibile</b><p>La Tier List online sarà disponibile dopo la configurazione di Supabase.</p></div>}
 <div className="tiers">{tiers.map(t=>{const list=entries.filter(e=>e.tier===t.key).sort((a,b)=>a.sort_order-b.sort_order);return <section className="tier-row" key={t.key}><div style={{background:t.color}}><strong>{t.key}</strong><small>{t.label}</small></div><div className="tier-decks">{list.length?list.map(e=>{const d=Array.isArray(e.deck)?e.deck[0]:e.deck;const c=cardById.get(d?.principal_card_id);return <article className="tier-deck" key={e.id}>{c?<Image src={c.url} alt={c.name} width={72} height={96} unoptimized/>:<div className="tier-card-missing">?</div>}<b>{d?.name??'Mazzo'}</b></article>}):<p className="tier-empty">Non ci sono ancora mazzi pubblicati in questa fascia.</p>}</div></section>})}</div><p className="muted">La Tier List mostra esclusivamente mazzi pubblicati e approvati dal proprietario.</p></main>
}
