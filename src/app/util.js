/* Small helpers shared by every module */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* Isolate the "other" script inside a sentence so mixed Arabic-English text
   reads correctly. Arabic mode: Latin runs (ClickUp terms, shortcuts,
   formulas) become LTR isolates. English mode: Arabic runs (for example a
   task title a learner typed in Arabic) become RTL isolates.
   Input is trusted authored HTML. */
const BIDI_LATIN = /(<(bdi|kbd|code)\b[^>]*>[\s\S]*?<\/\2>)|(<[^>]+>)|(&[#a-zA-Z0-9]+;)|([A-Za-z](?:[A-Za-z0-9+'’./:@#\-]*[A-Za-z0-9)])?(?:[ ](?:\(?[A-Za-z0-9][A-Za-z0-9+'’./:@#\-]*[A-Za-z0-9)]?|[+&\/→]))*(?<![ +&\/→]))/g;
const BIDI_ARABIC = /(<(bdi|kbd|code)\b[^>]*>[\s\S]*?<\/\2>)|(<[^>]+>)|(&[#a-zA-Z0-9]+;)|(@?[\u0600-\u06FF](?:[\u0600-\u06FF\u064B-\u065F0-9،؛ .:\-]*[\u0600-\u06FF0-9])?)/g;
function bidi(html) {
  if (html == null) return '';
  if (LANG === 'en') {
    return String(html).replace(BIDI_ARABIC, (m, iso, _n, tag, ent, run) => (iso || tag || ent) ? m : '<bdi dir="rtl" lang="ar">' + run + '</bdi>');
  }
  return String(html).replace(BIDI_LATIN, (m, iso, _n, tag, ent, run) => (iso || tag || ent) ? m : '<bdi class="en" dir="ltr">' + run + '</bdi>');
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
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EN_DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthName = m => (LANG === 'en' ? EN_MONTHS : AR_MONTHS)[m];
const dowNames = () => LANG === 'en' ? EN_DOW : AR_DOW;
/* Arabic: "30 سبتمبر 2026". English (day-month, as used in Oman): "30 Sep 2026" */
function fmtDate(iso, withYear) {
  if (!iso) return '';
  const d = parseISO(iso);
  if (LANG === 'en') return d.getDate() + ' ' + (withYear ? EN_MONTHS[d.getMonth()] : EN_MONTHS[d.getMonth()].slice(0, 3)) + (withYear ? ' ' + d.getFullYear() : '');
  return d.getDate() + ' ' + AR_MONTHS[d.getMonth()] + (withYear ? ' ' + d.getFullYear() : '');
}
function relDate(iso) {
  if (!iso) return '';
  const n = daysBetween(todayISO(), iso);
  if (n === 0) return tx('اليوم', 'Today');
  if (n === 1) return tx('غداً', 'Tomorrow');
  if (n === -1) return tx('أمس', 'Yesterday');
  return fmtDate(iso);
}
function fmtStamp(ts) {
  const d = new Date(ts);
  return fmtDate(isoDate(d)) + tx('، ', ', ') + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
/* English count + noun: nEn(3, 'task') -> "3 tasks" */
function nEn(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

function announce(msg) {
  const el = $('#announcer'); if (!el) return;
  el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 30);
}

function toast(msg) { Sound.play('pop');
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
  $('#confirmOk').textContent = okLabel || tx('تأكيد', 'Confirm');
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
