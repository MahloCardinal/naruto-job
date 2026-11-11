import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cards } from '@/lib/cards';
import { DeckLikeButton } from '@/components/deck-like-button';
export const dynamic='force-dynamic';
const cardById=new Map(cards.map(card=>[card.id,card]));
export default async function DeckDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const supabase=await createSupabaseServerClient();if(!supabase)return <main className="container page"><div className="empty panel"><b>Database non configurato</b><p>Le schede mazzo saranno disponibili dopo il collegamento a Supabase.</p><Link href="/decks">Torna ai mazzi</Link></div></main>;
 const {data:deck,error}=await supabase.from('decks').select('id,name,description,strategy,tier,win_condition,strengths,weaknesses,combos,principal_card_id,published_at,author:profiles!decks_author_id_fkey(id,username),deck_cards(card_id,position),deck_likes(count)').eq('id',id).eq('status','published').maybeSingle();if(error||!deck)notFound();
 const ordered=(deck.deck_cards??[]).sort((a:any,b:any)=>a.position-b.position);const main=cardById.get(deck.principal_card_id);const likes=deck.deck_likes?.[0]?.count??0;
 const { data: { user } } = await supabase.auth.getUser();
 const { data: ownLike } = user ? await supabase.from('deck_likes').select('deck_id').eq('deck_id', id).eq('user_id', user.id).maybeSingle() : { data: null };
 const blocks=[['Strategia',deck.strategy],['Condizione di vittoria',deck.win_condition],['Combo principali',deck.combos],['Punti di forza',deck.strengths],['Punti deboli',deck.weaknesses]].filter((x:any)=>x[1]);
 return <main className="container page"><Link className="back-link" href="/decks">← Torna all'archivio</Link><div className="deck-detail-head panel">{main&&<Image src={main.url} alt={main.name} width={120} height={160} unoptimized/>}<div><div className="eyebrow">COMMUNITY DECK</div><h1>{deck.name}</h1><p>{deck.description}</p><small>Autore: {deck.author?.id ? <Link href={`/profiles/${deck.author.id}`} className="inline-profile-link">{deck.author.username ?? 'Utente'}</Link> : (deck.author?.username??'Utente')} · {deck.tier?`Tier ${deck.tier}`:''}</small><DeckLikeButton deckId={id} initialLiked={Boolean(ownLike)} initialCount={likes}/></div></div><h2 className="section-title">Le 10 carte</h2><div className="deck-detail-cards">{ordered.map((entry:any)=>{const c=cardById.get(entry.card_id);return c?<article key={entry.card_id}><Image src={c.url} alt={c.name} width={100} height={134} unoptimized/><b>{c.name}</b>{entry.card_id===deck.principal_card_id&&<small>CARTA PRINCIPALE</small>}</article>:null})}</div><h2 className="section-title">Strategia e dettagli</h2><div className="deck-detail-blocks">{blocks.map(([title,body]:any)=><section className="panel" key={title}><h3>{title}</h3><p>{body}</p></section>)}</div></main>;
}
