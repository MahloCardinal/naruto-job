const projectUrl = 'https://yydfahurqzljthofoexe.supabase.co';
const publishableKey = 'sb_publishable_x-O7CQbM7RVxB97LV8PqJw_e8-q7KB8';
const sessionKey = 'sb-yydfahurqzljthofoexe-auth-token';
const popupKey = 'nexus-discord-popup';
const returnKey = 'nexus-discord-return';
const errorKey = 'nexus-discord-error';
const callbackUrl = new URL('account.html', location.href);
const homeUrl = new URL('index.html', location.href);
const status = document.querySelector('#auth-status');
const menu = document.querySelector('#account-menu');
const loginFailed = 'Accesso Discord non completato. Riprova.';

function startAccountMenu(client) {
  const summary = document.querySelector('#account-label');
  const signIn = document.querySelector('#sign-in');
  const signOut = document.querySelector('#sign-out');
  const segmenter = new Intl.Segmenter('it', { granularity: 'grapheme' });
  let oauthPopup;
  let returnError = sessionStorage.getItem(errorKey) === '1';
  sessionStorage.removeItem(errorKey);

  function renderSession(session) {
    const metadata = session?.user.user_metadata;
    const name = [metadata?.preferred_username, metadata?.user_name, metadata?.username, metadata?.name, metadata?.full_name]
      .find((value) => typeof value === 'string' && value.trim()) || 'Profilo';
    const characters = Array.from(segmenter.segment(name), ({ segment }) => segment);
    const shortened = characters.length > 10 ? characters.slice(0, 10).join('') + '...' : name;
    summary.textContent = session ? shortened : 'Accedi';
    summary.title = session ? name : '';
    signIn.hidden = Boolean(session);
    signOut.hidden = !session;
    status.textContent = session ? name : 'Accedi con il tuo account Discord.';
    if (returnError && !session) {
      status.textContent = loginFailed;
      menu.open = true;
      returnError = false;
    }
  }

  client.auth.onAuthStateChange((_event, session) => renderSession(session));
  window.addEventListener('storage', async (event) => {
    if (event.key !== sessionKey) return;
    const { data, error } = await client.auth.getSession();
    if (!error) renderSession(data.session);
  });
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  menu.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    summary.focus();
  });

  signIn.addEventListener('click', async () => {
    if (oauthPopup && !oauthPopup.closed) {
      oauthPopup.focus();
      return;
    }
    signIn.disabled = true;
    status.textContent = 'Apertura di Discord…';
    try {
      oauthPopup = window.open('about:blank', '_blank', 'popup,width=540,height=720');
      if (oauthPopup) {
        oauthPopup.sessionStorage.setItem(popupKey, '1');
        oauthPopup.opener = null;
      }
      sessionStorage.setItem(returnKey, location.href);
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: callbackUrl.href, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error || new Error('URL OAuth mancante');
      if (!oauthPopup) {
        location.assign(data.url);
      } else if (!oauthPopup.closed) {
        oauthPopup.location.replace(data.url);
        status.textContent = 'Completa l’accesso nella finestra di Discord.';
      } else {
        status.textContent = loginFailed;
      }
    } catch {
      oauthPopup?.close();
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

async function finishDiscordLogin(client) {
  const currentUrl = new URL(location.href);
  const returnedError = currentUrl.searchParams.has('error') || new URLSearchParams(currentUrl.hash.slice(1)).has('error');
  const returnedCode = currentUrl.searchParams.has('code');
  const { data, error } = await client.auth.getSession();
  const failed = returnedError || error || (returnedCode && !data.session);
  const inPopup = sessionStorage.getItem(popupKey) === '1';
  const previous = new URL(sessionStorage.getItem(returnKey) || homeUrl, location.href);
  sessionStorage.removeItem(popupKey);
  sessionStorage.removeItem(returnKey);

  if (inPopup) {
    history.replaceState(history.state, '', callbackUrl);
    status.textContent = failed ? loginFailed : 'Accesso completato. Puoi chiudere questa finestra.';
    if (!failed) window.close();
    return;
  }

  if (failed) sessionStorage.setItem(errorKey, '1');
  const sameSite = previous.origin === homeUrl.origin && previous.pathname !== callbackUrl.pathname;
  location.replace(sameSite ? previous.href : homeUrl.href);
}

async function startAccount() {
  const client = window.supabase.createClient(projectUrl, publishableKey, {
    auth: { flowType: 'pkce', storageKey: sessionKey, detectSessionInUrl: !menu },
  });
  if (menu) startAccountMenu(client);
  else await finishDiscordLogin(client);
}

startAccount().catch(() => { status.textContent = 'Il servizio di accesso è temporaneamente indisponibile.'; });
