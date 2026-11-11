import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cards } from '@/lib/cards';

export const dynamic = 'force-dynamic';
const cardById = new Map(cards.map(card => [card.id, card]));

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <main className="container page"><div className="empty panel"><b>Profili non disponibili</b><p>I profili pubblici saranno attivi dopo la configurazione di Supabase.</p><Link href="/decks">Torna ai mazzi</Link></div></main>;

  const { data: profile, error } = await supabase.from('profiles').select('id,username,avatar_url,bio,role,created_at').eq('id', id).maybeSingle();
  if (error || !profile) notFound();
  const { data: decks } = await supabase.from('decks').select('id,name,description,tier,principal_card_id,published_at').eq('author_id', id).eq('status', 'published').order('published_at', { ascending: false });
  const roleLabel = profile.role === 'owner' ? 'Proprietario NEXUS' : profile.role === 'collaborator' ? 'Collaboratore' : 'Membro';

  return <main className="container page">
    <Link className="back-link" href="/decks">← Torna all'archivio</Link>
    <section className="profile-hero panel">
      {profile.avatar_url ? <Image className="profile-avatar" src={profile.avatar_url} alt={`Avatar di ${profile.username}`} width={104} height={104} unoptimized/> : <div className="profile-avatar profile-avatar-fallback" aria-hidden="true">{(profile.username || 'N').slice(0,1).toUpperCase()}</div>}
      <div><div className="eyebrow">NEXUS COMMUNITY PROFILE</div><h1>{profile.username || 'Ninja'}</h1><span className="profile-role">{roleLabel}</span><p>{profile.bio?.trim() || 'Questo membro non ha ancora aggiunto una presentazione.'}</p></div>
    </section>
    <div className="profile-section-heading"><h2 className="section-title">Mazzi pubblicati</h2><span>{decks?.length ?? 0}</span></div>
    {!decks?.length ? <div className="empty panel"><b>Nessun mazzo pubblicato</b><p>I mazzi approvati di questo autore appariranno qui.</p></div> : <div className="deck-archive">{decks.map(deck => { const card = cardById.get(deck.principal_card_id); return <Link href={`/decks/${deck.id}`} className="deck-archive-item panel" key={deck.id}>{card ? <Image src={card.url} alt={card.name} width={82} height={110} unoptimized/> : <div className="tier-card-missing">?</div>}<div className="deck-archive-copy"><h2>{deck.name}</h2><p>{deck.description}</p><small>{deck.tier ? `Tier ${deck.tier}` : 'Non classificato'}</small></div></Link>; })}</div>}
  </main>;
}
