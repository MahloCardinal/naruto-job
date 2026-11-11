'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function DeckLikeButton({ deckId, initialLiked, initialCount }: { deckId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        setMessage('Accedi con Discord per mettere Mi piace.');
        return;
      }
      const { data, error } = await supabase.rpc('toggle_deck_like', { p_deck_id: deckId });
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      if (!result) throw new Error('Risposta del server non valida.');
      setLiked(Boolean(result.liked));
      setCount(Number(result.likes_count ?? 0));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Non è stato possibile aggiornare il Mi piace.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="deck-like-control">
    <button type="button" className={`deck-like-button${liked ? ' is-liked' : ''}`} onClick={toggle} disabled={busy} aria-pressed={liked} aria-label={liked ? 'Rimuovi Mi piace' : 'Metti Mi piace'}>
      <span aria-hidden="true">{liked ? '♥' : '♡'}</span> {count}
    </button>
    {message && <small role="status">{message}</small>}
  </div>;
}
