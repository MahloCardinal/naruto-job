'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function AuthControl() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setReady(true);
      return;
    }
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async () => {
    setBusy(true); setMessage('');
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Accesso Discord non riuscito.');
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    setMessage(error?.message ?? 'Disconnessione completata.');
    setBusy(false);
  };

  if (!ready) return <span className="auth-status">Controllo accesso…</span>;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <span className="auth-status" title="Configurazione necessaria prima di attivare il login">Login Discord in configurazione</span>;
  }
  return <div className="auth-control">
    {user ? <><span className="auth-status">{user.user_metadata?.full_name ?? user.user_metadata?.name ?? 'Ninja'}</span><button type="button" className="auth-button" onClick={logout} disabled={busy}>Esci</button></> : <button type="button" className="auth-button" onClick={login} disabled={busy}>{busy ? 'Attendi…' : 'Accedi con Discord'}</button>}
    {message && <span className="auth-message" role="status">{message}</span>}
  </div>;
}
