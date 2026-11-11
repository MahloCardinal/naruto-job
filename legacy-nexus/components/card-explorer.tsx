'use client';

import { useMemo, useState } from 'react';
import type { Card } from '@/lib/cards';

const PAGE_SIZE = 24;

export function CardExplorer({ cards }: { cards: Card[] }) {
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => cards.filter((card) => {
    const matchesQuery = `${card.name} ${card.id}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (season === 'all' || String(card.season) === season) && (rarity === 'all' || card.rarity === rarity);
  }), [cards, query, season, rarity]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleCards = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rarities = Array.from(new Set(cards.map((card) => card.rarity))).sort();
  const reset = () => { setQuery(''); setSeason('all'); setRarity('all'); setPage(1); };

  return <>
    <div className="filters" aria-label="Filtri database carte">
      <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cerca nome o ID carta…" aria-label="Cerca carte" />
      <select value={season} onChange={(event) => { setSeason(event.target.value); setPage(1); }} aria-label="Filtra per season">
        <option value="all">Tutte le season</option><option value="1">Season 1</option><option value="2">Season 2</option><option value="3">Season 3</option><option value="Event">Event Scroll</option>
      </select>
      <select value={rarity} onChange={(event) => { setRarity(event.target.value); setPage(1); }} aria-label="Filtra per rarità">
        <option value="all">Tutte le rarità</option>{rarities.map((value) => <option key={value} value={value}>{value}</option>)}
      </select>
      <button className="filter-reset" type="button" onClick={reset}>Azzera filtri</button>
      <span className="result-count">{filtered.length} risultati su {cards.length}</span>
    </div>

    {visibleCards.length > 0 ? <div className="card-grid">
      {visibleCards.map((card) => <article className="game-card" key={card.id}>
        <img src={card.url} alt={card.name} loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />
        <div><b title={card.name}>{card.name}</b><span>{card.id} · {card.rarity} · {card.season === 'Event' ? 'Event Scroll' : `Season ${card.season}`}</span></div>
      </article>)}
    </div> : <p className="empty panel">Nessuna carta corrisponde ai filtri selezionati. Prova a modificare la ricerca.</p>}

    <div className="pagination" aria-label="Paginazione carte">
      <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>← Precedente</button>
      <span>Pagina {page} di {pageCount}</span>
      <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Successiva →</button>
    </div>
  </>;
}
