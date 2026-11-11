'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Card } from '@/lib/cards';

type DeckDraft = { name: string; description: string; strategy: string; tier: string; selected: string[]; main: string; savedAt: string };
const DRAFT_KEY = 'nexus-deck-draft-v1';

export function DeckSubmission({ cards }: { cards: Card[] }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [strategy, setStrategy] = useState('');
  const [tier, setTier] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [main, setMain] = useState('');
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const selectedCards = useMemo(() => selected.map(id => cards.find(card => card.id === id)).filter((card): card is Card => Boolean(card)), [selected, cards]);
  const matches = useMemo(() => cards.filter(card => `${card.name} ${card.id}`.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 60), [cards, query]);
  const valid = name.trim().length >= 3 && selected.length === 10 && Boolean(main) && selected.includes(main) && description.trim().length >= 10;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<DeckDraft>;
        if (typeof draft.name === 'string') setName(draft.name);
        if (typeof draft.description === 'string') setDescription(draft.description);
        if (typeof draft.strategy === 'string') setStrategy(draft.strategy);
        if (typeof draft.tier === 'string') setTier(draft.tier);
        if (Array.isArray(draft.selected)) setSelected(draft.selected.filter((id): id is string => typeof id === 'string' && cards.some(card => card.id === id)).slice(0, 10));
        if (typeof draft.main === 'string' && cards.some(card => card.id === draft.main)) setMain(draft.main);
        setNotice('Bozza precedente recuperata da questo dispositivo.');
      }
    } catch { window.localStorage.removeItem(DRAFT_KEY); }
    setHydrated(true);
  }, [cards]);

  const makeDraft = (): DeckDraft => ({ name, description, strategy, tier, selected, main, savedAt: new Date().toISOString() });
  const saveDraft = () => {
    try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(makeDraft())); setNotice('Bozza salvata su questo dispositivo. Non è stata inviata online.'); }
    catch { setNotice('Impossibile salvare la bozza: controlla lo spazio disponibile nel browser.'); }
  };
  const exportDraft = () => {
    const draft = { ...makeDraft(), cards: selectedCards.map(card => ({ id: card.id, name: card.name, season: card.season, rarity: card.rarity })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `${(name.trim() || 'nexus-bozza-mazzo').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    link.click(); URL.revokeObjectURL(url); setNotice('File JSON della bozza esportato.');
  };
  const clearDraft = () => {
    if (!window.confirm('Vuoi cancellare la bozza salvata e svuotare il modulo?')) return;
    window.localStorage.removeItem(DRAFT_KEY); setName(''); setDescription(''); setStrategy(''); setTier(''); setSelected([]); setMain(''); setQuery(''); setPreview(false); setNotice('Bozza cancellata.');
  };
  const toggle = (id: string) => {
    setSelected(current => {
      if (current.includes(id)) { if (main === id) setMain(''); return current.filter(item => item !== id); }
      if (current.length >= 10) return current;
      return [...current, id];
    }); setPreview(false);
  };

  return <section className="deck-submit panel">
    <div className="deck-submit-head"><div><span className="eyebrow">CONTRIBUTI COMMUNITY</span><h2>PREPARA UN MAZZO</h2><p>Seleziona esattamente 10 carte e indica quella principale. Puoi salvare la bozza e riprenderla in seguito.</p></div><span className="deck-counter">{selected.length}/10</span></div>
    <div className="deck-form-grid">
      <label>Nome del mazzo<input value={name} onChange={e=>setName(e.target.value)} placeholder="Es. Control Konoha" maxLength={60}/></label>
      <label>Tier proposto<select value={tier} onChange={e=>setTier(e.target.value)}><option value="">Non specificato</option>{['S','A','B','C'].map(v=><option key={v}>{v}</option>)}</select></label>
      <label className="wide">Descrizione breve<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Spiega l'idea del mazzo e come si gioca…" rows={3} maxLength={500}/></label>
      <label>Tipo di strategia<input value={strategy} onChange={e=>setStrategy(e.target.value)} placeholder="Es. Control, Aggro, Combo" maxLength={40}/></label>
    </div>
    <div className="picker-head"><h3>Seleziona le 10 carte</h3><span>{selected.length===10?'Mazzo completo':`Ancora ${10-selected.length} da selezionare`}</span></div>
    <input className="card-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca per nome o ID carta…" aria-label="Cerca carta per il mazzo"/>
    <div className="picker-grid">{matches.map(card=>{const active=selected.includes(card.id);return <button type="button" className={`picker-card ${active?'selected':''}`} key={card.id} onClick={()=>toggle(card.id)} disabled={!active&&selected.length===10} aria-pressed={active}><img src={card.url} alt="" loading="lazy"/><span>{active?'✓ ':''}{card.name}</span></button>})}</div>
    <div className="selected-list"><b>Carte selezionate</b>{selectedCards.length?selectedCards.map((card,i)=><div className="selected-card" key={card.id}><span>{i+1}. {card.name}</span><label><input type="radio" name="main-card" checked={main===card.id} onChange={()=>setMain(card.id)}/> Carta principale</label><button type="button" onClick={()=>toggle(card.id)} aria-label={`Rimuovi ${card.name}`}>×</button></div>):<p>Nessuna carta selezionata.</p>}</div>
    <div className="draft-actions"><button type="button" className="filter-reset" onClick={saveDraft} disabled={!hydrated}>SALVA BOZZA</button><button type="button" className="filter-reset" onClick={exportDraft} disabled={!hydrated||selected.length===0}>ESPORTA JSON</button><button type="button" className="filter-reset" onClick={clearDraft} disabled={!hydrated}>CANCELLA</button><button className="primary submit-preview" type="button" disabled={!valid} onClick={()=>setPreview(true)}>CONTROLLA ANTEPRIMA</button></div>
    {notice&&<p className="draft-notice" role="status">{notice}</p>}
    {preview&&<div className="preview-box"><b>Anteprima pronta: {name}</b><p>{selectedCards.length} carte · Carta principale: {cards.find(c=>c.id===main)?.name} · Tier: {tier||'Non specificato'}</p><p>{description}</p>{strategy&&<p>Strategia: {strategy}</p>}<div className="preview-cards">{selectedCards.map(card=><span key={card.id}>{card.name}</span>)}</div><small>Anteprima locale. L'invio e la pubblicazione saranno attivati dopo il collegamento del login Discord e del backend NEXUS.</small><button type="button" className="filter-reset" onClick={()=>setPreview(false)}>Chiudi anteprima</button></div>}
    <p className="form-note">La bozza viene salvata soltanto nel browser di questo dispositivo. Non viene inviata al sito né resa pubblica. L'autore sarà associato al profilo Discord quando sarà attivo il backend; ogni mazzo richiederà l'approvazione del proprietario.</p>
  </section>;
}
