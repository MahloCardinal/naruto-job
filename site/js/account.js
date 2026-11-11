const projectUrl = 'https://yydfahurqzljthofoexe.supabase.co';
const publishableKey = 'sb_publishable_x-O7CQbM7RVxB97LV8PqJw_e8-q7KB8';
const status = document.querySelector('#auth-status');
const signIn = document.querySelector('#sign-in');
const signOut = document.querySelector('#sign-out');

async function startAccount() {
  if (!window.supabase) throw new Error('Client Supabase non disponibile');

  const returnUrl = new URL('account.html', location.href);
  const currentUrl = new URL(location.href);
  const callbackError = currentUrl.searchParams.has('error') || new URLSearchParams(currentUrl.hash.slice(1)).has('error');
  const callbackCode = currentUrl.searchParams.has('code');
  const client = window.supabase.createClient(projectUrl, publishableKey, {
    auth: { flowType: 'pkce' },
  });

  client.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION' && (callbackError || callbackCode)) {
      history.replaceState(history.state, '', returnUrl);
    }
    signOut.hidden = !session;
    signIn.hidden = Boolean(session);
    if (session) {
      const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
      status.textContent = name ? `Connesso come ${name}.` : 'Sessione attiva.';
    } else if (event === 'INITIAL_SESSION' && (callbackError || callbackCode)) {
      status.textContent = 'Accesso Discord non completato. Riprova.';
    } else {
      status.textContent = 'Accedi con il tuo account Discord.';
    }
  });

  signIn.addEventListener('click', async () => {
    signIn.disabled = true;
    status.textContent = 'Apertura di Discord…';
    try {
      const response = await fetch(`${projectUrl}/auth/v1/settings`, { headers: { apikey: publishableKey } });
      if (!response.ok) throw new Error('Configurazione Auth non disponibile');
      const settings = await response.json();
      if (!settings.external?.discord) {
        status.textContent = 'Il login Discord sarà disponibile dopo l’attivazione del provider.';
        return;
      }
      const { error } = await client.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: returnUrl.href },
      });
      if (error) throw error;
    } catch {
      status.textContent = 'Impossibile avviare il login Discord. Riprova.';
    } finally {
      signIn.disabled = false;
    }
  });

  signOut.addEventListener('click', async () => {
    signOut.disabled = true;
    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } catch {
      status.textContent = 'Impossibile terminare la sessione. Riprova.';
    } finally {
      signOut.disabled = false;
    }
  });
}

startAccount().catch(() => { status.textContent = 'Il servizio di accesso è temporaneamente indisponibile.'; });
