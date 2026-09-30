/* ==========================================================================
   Server connection (optional).
   The page works on its own. When it is hosted on your server, set the base
   address in index.html:
     <meta name="hub-api" content="/api">
   and the forum, ideas, support questions and Clicky send to and read from
   these endpoints (same origin, JSON, cookies for your sign-in). See
   SERVER.md for the exact contract and the security headers to add.
   ========================================================================== */
const Api = (() => {
  const meta = document.querySelector('meta[name="hub-api"]');
  const base = meta ? String(meta.getAttribute('content') || '').trim().replace(/\/+$/, '') : '';
  // Only same-origin paths ("/api") or https addresses are accepted.
  const ok = base && (base.charAt(0) === '/' || /^https:\/\//i.test(base));
  const PATHS = { forum: '/forum', ideas: '/ideas', tickets: '/support', chat: '/clicky' };
  async function call(method, key, body, sub) {
    if (!ok) throw new Error('offline');
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 12000);
    try {
      const res = await fetch(base + PATHS[key] + (sub || ''), {
        method, credentials: 'same-origin', signal: ctl.signal,
        headers: body ? { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' } : { 'X-Requested-With': 'fetch' },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const type = res.headers.get('content-type') || '';
      return type.indexOf('application/json') >= 0 ? res.json() : null;
    } finally { clearTimeout(timer); }
  }
  return {
    get on() { return !!ok; },
    get: (key, sub) => call('GET', key, null, sub),
    post: (key, body, sub) => call('POST', key, body, sub)
  };
})();

/* Plain text only from the server: strip anything that is not a string and cap the length. */
const cleanText = (v, max) => String(v == null ? '' : v).slice(0, max || 2000);
