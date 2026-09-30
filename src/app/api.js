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
  // Clicky's AI can be switched on by itself: <meta name="clicky-api" content="/api/clicky">
  const cm = document.querySelector('meta[name="clicky-api"]');
  const cRaw = cm ? String(cm.getAttribute('content') || '').trim() : '';
  const chatUrl = cRaw && (cRaw.charAt(0) === '/' || /^https:\/\//i.test(cRaw)) ? cRaw : ok ? base + PATHS.chat : '';
  /* Streams the answer: onPiece(text) for each piece; resolves with the whole text, or rejects. */
  async function chat(body, onPiece, ctl) {
    if (!chatUrl) throw new Error('offline');
    const timer = setTimeout(() => ctl.abort(), 60000);
    try {
      const res = await fetch(chatUrl, {
        method: 'POST', credentials: 'same-origin', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
        body: JSON.stringify(Object.assign({ stream: true }, body))
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const type = res.headers.get('content-type') || '';
      if (type.indexOf('application/json') >= 0) { const r = await res.json(); const t = cleanText(r && r.answer, 6000); if (!t) throw new Error('empty'); onPiece(t); return t; }
      if (!res.body || type.indexOf('ndjson') < 0) throw new Error('format');
      const reader = res.body.getReader(), dec = new TextDecoder(); let buf = '', all = '', done = false;
      while (!done) {
        const r = await reader.read(); if (r.done) break;
        buf += dec.decode(r.value, { stream: true });
        let i; while ((i = buf.indexOf('\n')) >= 0) {
          const ln = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!ln) continue;
          const m = JSON.parse(ln);
          if (m.error) throw new Error(String(m.error));
          if (m.done) { done = true; break; }
          if (typeof m.t === 'string' && all.length < 8000) { all += m.t; onPiece(m.t); }
        }
      }
      if (!all.trim()) throw new Error('empty');
      return all;
    } finally { clearTimeout(timer); }
  }
  return {
    get on() { return !!ok; },
    get chatOn() { return !!chatUrl; },
    chat,
    get: (key, sub) => call('GET', key, null, sub),
    post: (key, body, sub) => call('POST', key, body, sub)
  };
})();

/* Plain text only from the server: strip anything that is not a string and cap the length. */
const cleanText = (v, max) => String(v == null ? '' : v).slice(0, max || 2000);
