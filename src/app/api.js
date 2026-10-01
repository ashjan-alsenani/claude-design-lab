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
  /* Clicky Chatbot's AI service. Errors carry a kind (network, timeout, rate_limited, busy,
     not_configured, unauthorized, service, refused, cancelled) so the chat can say what happened. */
  const fail = kind => { const e = new Error(kind); e.kind = kind; return e; };
  async function chatStatus() {
    if (!chatUrl) return { ready: false, engine: 'none' };
    const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 8000);
    try {
      const res = await fetch(chatUrl.replace(/\/+$/, '') + '/status', { credentials: 'same-origin', signal: ctl.signal, headers: { 'X-Requested-With': 'fetch' } });
      if (res.status === 401) throw fail('unauthorized');
      if (!res.ok) throw fail('service');
      const r = await res.json(); return { ready: r && r.ready === true, engine: String((r && r.engine) || '') };
    } catch (e) { throw e.kind ? e : fail('network'); } finally { clearTimeout(timer); }
  }
  /* Streams one answer: onSources([{n, id}]) once, onPiece(text) per piece; resolves with the whole text. */
  async function chat(body, onPiece, ctl, onSources, onWait) {
    if (!chatUrl) throw fail('not_configured');
    // Gives up only after 90 s with no data at all (slow self-hosted models stream steadily but start late).
    let timedOut = false, timer = 0; const idle = () => { clearTimeout(timer); timer = setTimeout(() => { timedOut = true; ctl.abort(); }, 90000); }; idle();
    try {
      let res;
      try {
        res = await fetch(chatUrl, {
          method: 'POST', credentials: 'same-origin', signal: ctl.signal,
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
          body: JSON.stringify(Object.assign({ stream: true }, body))
        });
      } catch (e) { throw fail(timedOut ? 'timeout' : ctl.signal.aborted ? 'cancelled' : 'network'); }
      if (!res.ok) {
        let kind = res.status === 429 ? 'rate_limited' : res.status === 401 ? 'unauthorized' : 'service';
        try { const j = await res.json(); if (j && typeof j.error === 'string' && /^[a-z_]{2,20}$/.test(j.error)) kind = j.error; } catch (e) { /* keep status-based kind */ }
        throw fail(kind);
      }
      const type = res.headers.get('content-type') || '';
      if (!res.body || type.indexOf('ndjson') < 0) throw fail('service');
      const reader = res.body.getReader(), dec = new TextDecoder(); let buf = '', all = '', done = false;
      try {
        while (!done) {
          const r = await reader.read(); if (r.done) break; idle();
          buf += dec.decode(r.value, { stream: true });
          let i; while ((i = buf.indexOf('\n')) >= 0) {
            const ln = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!ln) continue;
            let m; try { m = JSON.parse(ln); } catch (e) { throw fail('service'); }
            if (m.error) throw fail(/^[a-z_]{2,20}$/.test(String(m.error)) ? String(m.error) : 'service');
            if (m.done) { done = true; break; }
            if (m.wait) { if (onWait) onWait(); continue; }
            if (Array.isArray(m.sources)) { if (onSources) onSources(m.sources.filter(x => x && typeof x.id === 'string' && Number.isInteger(x.n)).slice(0, 8)); continue; }
            if (typeof m.t === 'string' && all.length < 8000) { all += m.t; onPiece(m.t); }
          }
        }
      } catch (e) { throw e.kind ? e : fail(timedOut ? 'timeout' : ctl.signal.aborted ? 'cancelled' : 'network'); }
      if (!done) throw fail('network'); // the stream ended early
      if (!all.trim()) throw fail('service');
      return all;
    } finally { clearTimeout(timer); }
  }
  return {
    get on() { return !!ok; },
    get chatOn() { return !!chatUrl; },
    chat, chatStatus,
    get: (key, sub) => call('GET', key, null, sub),
    post: (key, body, sub) => call('POST', key, body, sub)
  };
})();

/* Plain text only from the server: strip anything that is not a string and cap the length. */
const cleanText = (v, max) => String(v == null ? '' : v).slice(0, max || 2000);
