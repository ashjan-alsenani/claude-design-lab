/**
 * Server mode: the application code (public/assets/app.js) keeps working exactly as before, but the
 * document it reads from and saves to "localStorage" is really held here and synchronised with the server:
 *
 *   app.js ──localStorage.setItem(doc)──▶ bridge ──POST api/state/changes (only what changed)──▶ server
 *   app.js ◀──"storage" event (latest)── bridge ◀──GET api/state (on load, after a conflict, every 20 s)── server
 *
 * Nothing confidential is written to the browser's real storage.
 */
import { RECORD_PARTS, diffRecords, join, split, stable, type Doc, type Json, type RecordOps } from '../shared/parts';
import { applyServerUi, notify, setSaveState } from './ui';

type Fetch = typeof fetch;
interface DocState { key: string; doc: 'main' | 'vendors'; json: string | null; snapshot: Map<string, Json>; versions: Record<string, number>; writable: Set<string>; pending: string | null; inFlight: boolean; timer: number }
interface StateResponse { doc: 'main' | 'vendors'; initialized: boolean; data: Doc | null; versions: Record<string, number>; writable: string[]; admin: boolean }

const KEYS: Record<string, 'main' | 'vendors'> = { 'dtd-review-v5': 'main', 'dtd-review-v5-vendors': 'vendors' };
const POLL_MS = 20_000;
/** Parts the app updates on its own (sign-in time, data-format flags) that only administrators store: not worth a warning. */
const BENIGN = /^(users|role|nextId|\w+V\d*|pkSmp1|supV1|vacSeed|ui\.lastBackup|ui\.dismissed|ui\.greetSent)$/;
let realFetch: Fetch;
const docs = new Map<string, DocState>();
const ar = () => document.documentElement.lang === 'ar';
const T = (a: string, e: string) => (ar() ? a : e);

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const r = await realFetch(path, { credentials: 'same-origin', ...init, headers: { 'X-DTD-Request': '1', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...(init.headers || {}) } });
  if (r.status === 401) { signInAgain(); throw new Error('signed out'); }
  return r;
}

function signInAgain() {
  const ret = encodeURIComponent(location.hash || '#/home');
  location.href = `auth/login?returnTo=${ret}`;
}

function setFromServer(d: DocState, s: StateResponse) {
  const server = s.data ? split(s.data) : new Map<string, Json>();
  // Keep parts the app created in this browser but that aren't stored (yet, or for this account): the app expects them.
  if (d.json && s.data) {
    try { for (const [k, v] of split(JSON.parse(d.json))) if (!server.has(k)) server.set(k, v); } catch {}
  }
  d.json = s.data ? JSON.stringify(join(server)) : null;
  d.snapshot = s.data ? split(s.data) : new Map();
  d.versions = s.versions;
  d.writable = new Set(s.writable);
}

async function fetchState(doc: 'main' | 'vendors'): Promise<StateResponse> {
  const r = await api(`api/state?doc=${doc}`);
  if (!r.ok) throw Object.assign(new Error('state ' + r.status), { status: r.status, body: await r.json().catch(() => ({})) });
  return r.json();
}

/** Load the latest from the server and hand it to the app (which re-renders, or warns if a form is open). */
async function refresh(d: DocState) {
  const s = await fetchState(d.doc);
  setFromServer(d, s);
  if (d.json && currentKey() === d.key) window.dispatchEvent(new StorageEvent('storage', { key: d.key, newValue: d.json }));
}

const currentKey = () => (document.documentElement.dataset.ws === 'vendors' ? 'dtd-review-v5-vendors' : 'dtd-review-v5');

/** Work out what changed since the server's last copy, and send just that. */
async function push(d: DocState) {
  if (d.inFlight || d.pending === null) return;
  const json = d.pending;
  d.pending = null;
  let next: Doc;
  try { next = JSON.parse(json); } catch { return; }
  const parts = split(next);
  const changes: { part: string; base: number; value?: Json; ops?: RecordOps }[] = [];
  const refused: string[] = [];
  for (const [part, value] of parts) {
    if (part === 'role') continue;
    const before = d.snapshot.get(part);
    if (before !== undefined && stable(before) === stable(value)) continue;
    const emptyNew = before === undefined && (stable(value) === '{}' || stable(value) === '[]' || value === null);
    if (!d.writable.has(part)) {
      if (emptyNew) continue; // the app created an empty container on first use: nothing to refuse
      if (!BENIGN.test(part)) refused.push(part); // the server would refuse it
      continue;
    }
    const kind = RECORD_PARTS[part];
    if (kind) {
      let ops = diffRecords(kind, before ?? (kind === 'array' ? [] : {}), value);
      // A list the app just created (still empty): create it on the server too, so it exists for everyone.
      if (!ops && before === undefined) ops = { upsert: {}, remove: [], base: {}, ...(kind === 'array' ? { order: [] } : {}) };
      if (ops) changes.push({ part, base: d.versions[part] ?? 0, ops });
    } else changes.push({ part, base: d.versions[part] ?? 0, value });
  }
  if (refused.length) {
    // The app allowed a change this account isn't permitted to make. Say so, and put the real data back.
    console.warn('Not saved (no permission):', refused.join(', '));
    notify(T('ليست لديك صلاحية لتغيير هذه المعلومات، فلم يُحفظ التغيير.', 'You don\'t have permission to change this information, so the change wasn\'t saved.'), 'error');
    setSaveState('error', T('لم يُحفظ: لا صلاحية', 'Not saved: no permission'));
    if (!changes.length) { await refresh(d); setSaveState('local'); return; }
  }
  if (!changes.length) { setSaveState('saved'); return; }

  d.inFlight = true;
  setSaveState('saving');
  try {
    const r = await api('api/state/changes', { method: 'POST', body: JSON.stringify({ doc: d.doc, changes }) });
    const body = await r.json().catch(() => ({}));
    if (r.ok) {
      let merged = false;
      for (const [part, v] of Object.entries(body.versions || {})) d.versions[part] = v as number;
      for (const [part, v] of Object.entries(body.parts || {})) {
        if (stable(v) !== stable(parts.get(part))) merged = true; // someone else's records were merged in
        d.snapshot.set(part, v as Json);
      }
      // Local copy = what the app has now, with the server's confirmed version of each saved part.
      const local = d.pending !== null ? split(JSON.parse(d.pending)) : parts;
      for (const [part, v] of Object.entries(body.parts || {})) local.set(part, v as Json);
      d.json = JSON.stringify(join(local));
      setSaveState('saved');
      if (merged && d.pending === null) await refresh(d);
    } else if (r.status === 409) {
      notify(T('غيّر شخص آخر المعلومات نفسها قبل لحظات، فلم يُحفظ تعديلك الأخير. تظهر الآن أحدث نسخة؛ أعد التعديل إن لزم.',
        'Someone else changed the same information a moment ago, so your last change wasn\'t saved. The latest version is shown now; make your change again if it\'s still needed.'), 'warning');
      setSaveState('error', T('لم يُحفظ: تعارض', 'Not saved: conflict'));
      d.pending = null; await refresh(d); setSaveState('local');
    } else if (r.status === 403) {
      notify(T('ليست لديك صلاحية لتغيير هذه المعلومات، فلم يُحفظ التغيير.', 'You don\'t have permission to change this information, so the change wasn\'t saved.'), 'error');
      setSaveState('error', T('لم يُحفظ: لا صلاحية', 'Not saved: no permission'));
      d.pending = null; await refresh(d); setSaveState('local');
    } else {
      throw new Error(body.error || 'save failed ' + r.status);
    }
  } catch (e) {
    if ((e as Error).message === 'signed out') return;
    // Network or server trouble: keep the change and try again.
    if (d.pending === null) d.pending = json;
    setSaveState('error', T('لم يُحفظ بعد: إعادة المحاولة…', 'Not saved yet: retrying…'));
    window.setTimeout(() => push(d), 5000);
  } finally {
    d.inFlight = false;
    if (d.pending !== null) window.setTimeout(() => push(d), 50);
  }
}

/** Every 20 seconds (and when the tab comes back into view), pick up colleagues' changes. */
async function poll() {
  for (const d of docs.values()) {
    if (d.inFlight || d.pending !== null || !d.json) continue;
    // Don't swap the data under an open form with unsaved changes: its save is checked against what it was opened with.
    if ((window as unknown as { __dtdDirty?: () => boolean }).__dtdDirty?.()) continue;
    try {
      const r = await api(`api/state/versions?doc=${d.doc}`);
      if (!r.ok) continue;
      const v = (await r.json()).versions as Record<string, number>;
      const changed = Object.keys(v).some(k => v[k] !== d.versions[k]) || Object.keys(d.versions).some(k => !(k in v));
      if (changed) await refresh(d);
    } catch {}
  }
}

/** Install the storage bridge, then start the application. Returns false when the user can't use the app. */
export async function startServerMode(fetchImpl: Fetch, loadApp: () => Promise<void>): Promise<boolean> {
  realFetch = fetchImpl;
  const sr = await api('api/session').catch(() => null);
  if (!sr) return false;
  if (sr.status === 403) { const b = await sr.json().catch(() => ({})); blocked(b.message || ''); return false; }
  if (!sr.ok) { blocked(T('تعذّر الاتصال بالخادم. حاول لاحقًا.', 'The server couldn\'t be reached. Try again later.')); return false; }
  const me = await sr.json() as { email: string; name: string; uid: number; role: string };

  for (const [key, doc] of Object.entries(KEYS)) {
    const s = await fetchState(doc);
    const d: DocState = { key, doc, json: null, snapshot: new Map(), versions: {}, writable: new Set(), pending: null, inFlight: false, timer: 0 };
    setFromServer(d, s);
    docs.set(key, d);
  }

  // The app keeps its session marker in sessionStorage; the server is the real authority.
  sessionStorage.setItem('dtd-review-auth', '1');
  sessionStorage.setItem('dtd-review-uid', String(me.uid));
  document.documentElement.dataset.srv = '1';
  if (me.role === 'admin') document.documentElement.dataset.srvAdmin = '1';

  const proto = Storage.prototype;
  const get = proto.getItem, set = proto.setItem, del = proto.removeItem;
  proto.getItem = function (k: string) {
    if (this === window.localStorage && docs.has(k)) return docs.get(k)!.json;
    return get.call(this, k);
  };
  proto.setItem = function (k: string, v: string) {
    if (this === window.localStorage && docs.has(k)) {
      const d = docs.get(k)!;
      d.json = String(v);
      d.pending = String(v);
      window.clearTimeout(d.timer);
      d.timer = window.setTimeout(() => push(d), 300);
      return;
    }
    return set.call(this, k, v);
  };
  proto.removeItem = function (k: string) {
    if (this === window.localStorage && docs.has(k)) return; // resetting shared data from the browser isn't allowed
    return del.call(this, k);
  };

  await loadApp();
  applyServerUi({
    signOut: async () => {
      for (const d of docs.values()) if (d.pending !== null) await push(d);
      const r = await realFetch('auth/logout', { method: 'POST', headers: { 'X-DTD-Request': '1' }, credentials: 'same-origin' }).catch(() => null);
      const next = r && r.ok ? (await r.json()).next : 'auth/login';
      sessionStorage.removeItem('dtd-review-auth');
      location.href = next;
    },
  });
  window.setInterval(poll, POLL_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
  window.addEventListener('beforeunload', e => {
    for (const d of docs.values()) if (d.pending !== null || d.inFlight) { e.preventDefault(); e.returnValue = ''; }
  });
  return true;
}

function blocked(message: string) {
  document.body.innerHTML = '';
  const m = document.createElement('main');
  m.className = 'srv-blocked';
  m.innerHTML = `<h1>${T('لا يمكنك استخدام الدليل بعد', 'You can\'t use the directory yet')}</h1><p></p>
    <button type="button" class="btn btn-primary">${T('تسجيل الخروج', 'Sign out')}</button>`;
  m.querySelector('p')!.textContent = message || T('حسابك غير مضاف في الدليل. اطلب من مسؤول الدليل إضافتك في «المستخدمون والصلاحيات».',
    'Your account hasn\'t been added to the directory. Ask the directory administrator to add you in Users & access.');
  m.querySelector('button')!.addEventListener('click', async () => {
    const r = await realFetch('auth/logout', { method: 'POST', headers: { 'X-DTD-Request': '1' } }).catch(() => null);
    location.href = r && r.ok ? (await r.json()).next : './';
  });
  document.body.appendChild(m);
}
