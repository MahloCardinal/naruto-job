import Image from 'next/image';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cards } from '@/lib/cards';

export const dynamic = 'force-dynamic';
const cardById = new Map(cards.map(card => [card.id, card]));
export default async function Decks({ searchParams }: { searchParams: Promise<{ q?: string; tier?: string; strategy?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  let decks: any[] = [];
  let unavailable = false;
  if (supabase) {
    let query = supabase.from('decks').select('id,name,description,strategy,tier,principal_card_id,published_at,author:profiles!decks_author_id_fkey(id,username),deck_likes(count)').eq('status', 'published').order('published_at', { ascending: false });
    if (params.tier && ['S','A','B','C'].includes(params.tier)) query = query.eq('tier', params.tier);
    if (params.strategy) query = query.eq('strategy', params.strategy);
    const result = await query;
    if (result.error) unavailable = true; else decks = result.data ?? [];
  }
  const filtered = decks.filter(deck => !params.q || `${deck.name} ${deck.description} ${deck.author?.username ?? ''}`.toLocaleLowerCase().includes(params.q.toLocaleLowerCase()));
  const strategies = [...new Set(decks.map(deck => deck.strategy).filter(Boolean))];
  return <main className="container page">
    <div className="page-heading"><div className="eyebrow">COMMUNITY DECK LIBRARY</div><h1>ARCHIVIO <em>MAZZI</em></h1><p>Mazzi, combo e strategie condivisi dalla community. I contenuti pubblici compaiono dopo l'approvazione.</p></div>
    <form className="deck-archive-filters" method="get"><input name="q" defaultValue={params.q ?? ''} placeholder="Cerca mazzo, autore o descrizione…" aria-label="Cerca mazzi"/><select name="tier" defaultValue={params.tier ?? ''}><option value="">Tutti i Tier</option>{['S','A','B','C'].map(t=><option key={t}>{t}</option>)}</select><select name="strategy" defaultValue={params.strategy ?? ''}><option value="">Tutte le strategie</option>{strategies.map(s=><option key={s} value={s}>{s}</option>)}</select><button className="filter-reset" type="submit">Filtra</button><Link className="filter-reset" href="/decks">Azzera</Link></form>
    {unavailable ? <div className="empty panel"><b>Archivio non disponibile</b><p>Il database online sarà disponibile dopo la configurazione di Supabase.</p></div> : !filtered.length ? <div className="empty panel"><b>Nessun mazzo pubblicato</b><p>{decks.length ? 'Nessun mazzo corrisponde ai filtri selezionati.' : 'L’archivio si popolerà con i mazzi inviati e approvati. Non mostriamo mazzi di esempio inventati.'}</p><small>La consultazione pubblica è libera; invio e cuori richiedono il login Discord.</small></div> : <div className="deck-archive">{filtered.map(deck=>{const card=cardById.get(deck.principal_card_id);const likes=deck.deck_likes?.[0]?.count??0;return <article className="deck-archive-item panel" key={deck.id}>{card?<Image src={card.url} alt={card.name} width={82} height={110} unoptimized/>:<div className="tier-card-missing">?</div>}<div className="deck-archive-copy"><h2><Link href={`/decks/${deck.id}`}>{deck.name}</Link></h2><p>{deck.description}</p><small>Autore: {deck.author?.id ? <Link href={`/profiles/${deck.author.id}`} className="inline-profile-link">{deck.author.username ?? 'Utente'}</Link> : (deck.author?.username??'Utente')} · Strategia: {deck.strategy}</small></div><div className="deck-archive-side">{deck.tier&&<b className={`deck-tier tier-${deck.tier.toLowerCase()}`}>{deck.tier}</b>}<span>♥ {likes}</span></div></article>})}</div>}
  </main>;
}
