/* Small helpers shared by every module */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* Wrap Latin runs (ClickUp terms, shortcuts, formulas) in LTR isolates so they
   read correctly inside Arabic sentences. Input is trusted authored HTML. */
function bidi(html) {
  if (html == null) return '';
  // Skip tags, entities and existing isolates; wrap the rest of each Latin run.
  return String(html).replace(/(<(bdi|kbd|code)\b[^>]*>[\s\S]*?<\/\2>)|(<[^>]+>)|(&[#a-zA-Z0-9]+;)|([A-Za-z](?:[A-Za-z0-9+'’./:@#\-]*[A-Za-z0-9)])?(?:[ ](?:\(?[A-Za-z0-9][A-Za-z0-9+'’./:@#\-]*[A-Za-z0-9)]?|[+&\/→]))*(?<![ +&\/→]))/g, (m, iso, _n, tag, ent, run) => {
    if (iso || tag || ent) return m;
    return '<bdi class="en" dir="ltr">' + run + '</bdi>';
  });
}
/* Plain text -> escaped + bidi */
function t(s) { return bidi(esc(s)); }

function uid(prefix) { return (prefix || 'id') + '-' + Math.random().toString(36).slice(2, 9); }

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function debounce(fn, ms) {
  let h; return function () { const a = arguments; clearTimeout(h); h = setTimeout(() => fn.apply(this, a), ms); };
}

/* Deterministic shuffle so option order is stable per render key */
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function seededShuffle(arr, seed) {
  const a = arr.slice(); let x = hashStr(String(seed)) || 1;
  for (let i = a.length - 1; i > 0; i--) {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Dates: ISO yyyy-mm-dd strings in local time */
function isoDate(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
function todayISO() { return isoDate(new Date()); }
function addDays(iso, n) { const d = parseISO(iso); d.setDate(d.getDate() + n); return isoDate(d); }
function parseISO(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
function daysBetween(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 86400000); }
const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const AR_DOW = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
function fmtDate(iso, withYear) {
  if (!iso) return '';
  const d = parseISO(iso);
  return d.getDate() + ' ' + AR_MONTHS[d.getMonth()] + (withYear ? ' ' + d.getFullYear() : '');
}
function relDate(iso) {
  if (!iso) return '';
  const n = daysBetween(todayISO(), iso);
  if (n === 0) return 'اليوم';
  if (n === 1) return 'غداً';
  if (n === -1) return 'أمس';
  return fmtDate(iso);
}
function fmtStamp(ts) {
  const d = new Date(ts);
  return fmtDate(isoDate(d)) + '، ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
/* Arabic plural helper for counts */
function plural(n, one, two, few, many) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return n + ' ' + few;
  return n + ' ' + many;
}

function announce(msg) {
  const el = $('#announcer'); if (!el) return;
  el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 30);
}

function toast(msg) {
  const region = $('#toasts'); if (!region) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = icon('check-circle') + '<span>' + t(msg) + '</span>';
  region.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 220); }, 3200);
}

function confirmDialog(title, body, okLabel) {
  const dlg = $('#confirmDialog');
  $('#confirmTitle').textContent = title;
  $('#confirmBody').textContent = body;
  $('#confirmOk').textContent = okLabel || 'تأكيد';
  return new Promise(resolve => {
    if (typeof dlg.showModal !== 'function') { resolve(window.confirm(title + '\n' + body)); return; }
    dlg.returnValue = '';
    dlg.addEventListener('close', function onClose() {
      dlg.removeEventListener('close', onClose);
      resolve(dlg.returnValue === 'ok');
    });
    dlg.showModal();
  });
}

const prefersReducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
