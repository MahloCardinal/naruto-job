'use client';

import { useMemo, useState } from 'react';

type Deck = { id: string; name: string; tier: 'S'|'A'|'B'|'C'|null; principal_card_id: string };
type Entry = { deck_id: string; tier: 'S'|'A'|'B'|'C'; sort_order: number };
const TIERS = ['S','A','B','C'] as const;

export function AdminTierListEditor({ decks, initialEntries, action }: {
  decks: Deck[];
  initialEntries: Entry[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [note, setNote] = useState('');
  const byId = useMemo(() => new Map(decks.map(deck => [deck.id, deck])), [decks]);
  const assigned = new Set(entries.map(entry => entry.deck_id));

  function normalize(next: Entry[]) {
    return TIERS.flatMap(tier => next.filter(entry => entry.tier === tier)
      .map((entry, index) => ({ ...entry, sort_order: index })));
  }
  function move(deckId: string, tier: Entry['tier']) {
    const current = entries.find(entry => entry.deck_id === deckId);
    const rest = entries.filter(entry => entry.deck_id !== deckId);
    const next = [...rest, { deck_id: deckId, tier, sort_order: 9999 }];
    setEntries(normalize(next));
  }
  function shift(deckId: string, delta: -1|1) {
    const current = entries.find(entry => entry.deck_id === deckId);
    if (!current) return;
    const group = entries.filter(entry => entry.tier === current.tier).sort((a,b)=>a.sort_order-b.sort_order);
    const index = group.findIndex(entry => entry.deck_id === deckId);
    const target = index + delta;
    if (target < 0 || target >= group.length) return;
    [group[index], group[target]] = [group[target], group[index]];
    const rest = entries.filter(entry => entry.tier !== current.tier);
    setEntries(normalize([...rest, ...group]));
  }

  return <section className="panel admin-queue">
    <h3>Editor Tier List</h3>
    <p className="muted">Aggiungi i mazzi pubblicati, assegna una fascia e modifica manualmente l'ordine. I mazzi non inseriti restano fuori dalla Tier List.</p>
    {TIERS.map(tier => <div className="tier-editor-group" key={tier}>
      <h4>Tier {tier}</h4>
      {entries.filter(entry=>entry.tier===tier).sort((a,b)=>a.sort_order-b.sort_order).map((entry,index)=>{
        const deck=byId.get(entry.deck_id);
        if(!deck) return null;
        return <div className="tier-editor-item" key={entry.deck_id}>
          <b>{index+1}. {deck.name}</b>
          <div className="admin-actions">
            <button type="button" className="secondary" onClick={()=>shift(entry.deck_id,-1)} disabled={index===0} aria-label={`Sposta ${deck.name} in alto`}>↑</button>
            <button type="button" className="secondary" onClick={()=>shift(entry.deck_id,1)} disabled={index===entries.filter(e=>e.tier===tier).length-1} aria-label={`Sposta ${deck.name} in basso`}>↓</button>
            <select aria-label={`Tier di ${deck.name}`} value={tier} onChange={event=>move(entry.deck_id,event.target.value as Entry['tier'])}>{TIERS.map(value=><option key={value}>{value}</option>)}</select>
            <button type="button" className="secondary" onClick={()=>setEntries(current=>normalize(current.filter(e=>e.deck_id!==entry.deck_id)))}>Rimuovi</button>
          </div>
        </div>;
      })}
      {!entries.some(entry=>entry.tier===tier)&&<p className="muted">Nessun mazzo in questa fascia.</p>}
    </div>)}
    <div className="tier-editor-add">
      <label>Aggiungi mazzo pubblicato
        <select id="tier-add-deck" defaultValue="">
          <option value="">Seleziona un mazzo…</option>
          {decks.filter(deck=>!assigned.has(deck.id)).map(deck=><option key={deck.id} value={deck.id}>{deck.name}</option>)}
        </select>
      </label>
      <label>Fascia iniziale<select id="tier-add-value" defaultValue="S">{TIERS.map(t=><option key={t}>{t}</option>)}</select></label>
      <button type="button" className="secondary" onClick={()=>{
        const select=document.getElementById('tier-add-deck') as HTMLSelectElement|null;
        const tier=document.getElementById('tier-add-value') as HTMLSelectElement|null;
        if(!select?.value||!tier) return;
        move(select.value,tier.value as Entry['tier']); select.value='';
      }}>Aggiungi</button>
    </div>
    <form action={action} className="tier-editor-publish">
      <input type="hidden" name="entries" value={JSON.stringify(normalize(entries))}/>
      <label>Nota interna della pubblicazione<input name="note" value={note} onChange={event=>setNote(event.target.value)} maxLength={300} placeholder="Es. Aggiornamento dopo il bilanciamento…"/></label>
      <button className="primary" type="submit">PUBBLICA TIER LIST</button>
    </form>
    <small>La pubblicazione sostituisce la Tier List corrente e registra data, ora e operazione nel registro amministrativo.</small>
  </section>;
}
