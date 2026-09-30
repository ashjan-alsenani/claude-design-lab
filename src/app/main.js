/* ==========================================================================
   Boot, router, language selection, global search, navigation drawer, logos.
   ========================================================================== */

const ROUTES = {
  home: { view: viewHome, title: () => tx('الرئيسية', 'Home') },
  tour: { view: viewTour, title: () => tx('جولة ClickUp', 'ClickUp tour') },
  questions: { view: viewQuestions, title: () => tx('الأسئلة الشائعة', 'Common questions') },
  library: { view: viewLibrary, title: () => tx('مكتبة الدروس', 'Learning Library') },
  lesson: { view: viewLesson, title: () => tx('درس', 'Lesson') },
  lab: { view: (el) => { LabUI.mount(el); return () => LabUI.unmount(); }, title: () => tx('مختبر التطبيق', 'Practice Lab') },
  studio: { view: (el) => { Studio.mount(el); return () => Studio.unmount(); }, title: () => tx('استوديو لوحات المعلومات', 'Dashboard Studio') },
  assess: { view: viewAssess, title: () => tx('التقييمات', 'Assessments') },
  progress: { view: viewProgress, title: () => tx('تقدّمي', 'My Progress') },
  help: { view: viewHelp, title: () => tx('المصطلحات والمساعدة', 'Glossary & Help') },
  about: { view: viewAbout, title: () => tx('حول المنصة', 'About') }
};

let currentCleanup = null, currentRoute = null;

function parseHash() {
  const h = (location.hash || '#/home').replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean).map(decodeURIComponent);
  return { name: parts[0] || 'home', params: parts.slice(1) };
}

function rerender() { renderRoute(true); }

/* langSwitch: re-render the same screen in the other language, keeping the
   learner's in-progress state (UIState). Any other render starts fresh. */
function renderRoute(keepScroll, langSwitch) {
  const route = parseHash();
  const def = ROUTES[route.name];
  if (typeof currentCleanup === 'function') { try { currentCleanup(); } catch (e) { console.error(e); } }
  currentCleanup = null;
  if (!langSwitch) UIState.clear();
  const main = $('#main');
  const host = document.createElement('div');
  main.replaceChildren(host);
  const site = ' | Omantel | ClickUp Learning Hub';
  if (!def) { viewNotFound(host); currentRoute = route; document.title = tx('غير موجودة', 'Not found') + site; renderSidebar(route); return; }
  currentRoute = route;
  try { currentCleanup = def.view(host, route.params) || null; }
  catch (e) { console.error(e); host.innerHTML = '<div class="page page-narrow"><div class="panel empty-state">' + icon('alert') + '<h1 style="font-size:1.2rem">' + tx('حدث خطأ أثناء عرض هذه الصفحة', 'Something went wrong while showing this page') + '</h1><p>' + tx('أعد تحميل الصفحة. تقدّمك محفوظ.', 'Reload the page. Your progress is saved.') + '</p><a class="btn btn-primary" href="#/home">' + tx('الرئيسية', 'Home') + '</a></div></div>'; }
  const pageTitle = route.name === 'lesson' && LESSON[route.params[0]] ? LESSON[route.params[0]].title
    : route.name === 'tour' && TOUR_PART[route.params[0]] ? tp(TOUR_PART[route.params[0]].name) : def.title();
  document.title = pageTitle + site;
  renderSidebar(route);
  renderTopProgress();
  /* Blocks rise into view on a fresh visit; a language switch or in-place
     refresh keeps everything where the learner was. */
  if (keepScroll || langSwitch) Motion.settle(host); else Motion.reveal(host);
  if (!langSwitch) closeNav();
  if (!keepScroll) {
    window.scrollTo(0, 0);
    const h1 = host.querySelector('h1');
    if (h1 && routedByUser) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }
}
let routedByUser = false;

/* ---------- Mobile navigation drawer ---------- */
function openNav() { $('#sidebar').classList.add('open'); $('#scrim').hidden = false; $('#navToggle').setAttribute('aria-expanded', 'true'); const f = $('#sidebar a'); if (f) f.focus(); }
function closeNav() { const sb = $('#sidebar'); if (!sb.classList.contains('open')) return; sb.classList.remove('open'); $('#scrim').hidden = true; $('#navToggle').setAttribute('aria-expanded', 'false'); }

/* ---------- Static chrome strings (template) ---------- */
const CHROME = {
  skip: ['تخطَّ إلى المحتوى', 'Skip to content'],
  navOpen: ['فتح قائمة التنقل', 'Open navigation menu'],
  brand: ['Omantel | ClickUp Learning Hub، الصفحة الرئيسية', 'Omantel | ClickUp Learning Hub, home'],
  logoNeeded: ['شعار رسمي مطلوب', 'Official logo needed'],
  searchLabel: ['ابحث في الدروس والمصطلحات', 'Search lessons and terms'],
  searchPh: ['ابحث عن درس أو مصطلح، مثل: Due Date', 'Search for a lesson or term, e.g. Due Date'],
  mainNav: ['التنقل الرئيسي', 'Main navigation'],
  langGroup: ['اللغة', 'Language'],
  footerNote: ['منصة تعليمية مستقلة. الواجهات المعروضة محاكاة تعليمية مبسّطة، والمنصة غير معتمدة أو مدعومة رسمياً من ClickUp.', 'An independent learning platform. The screens shown are simplified educational simulations, and the platform is not officially certified or endorsed by ClickUp.'],
  about: ['حول المنصة', 'About the platform'],
  cancel: ['إلغاء', 'Cancel'],
  search: ['بحث', 'Search'],
  metaDesc: ['منصة تعلّم تفاعلية لاستخدام ClickUp بثقة: شاهد، افهم، تدرّب، ثم تحقّق.', 'An interactive platform for learning to use ClickUp with confidence: watch, understand, practise, then check.']
};
function applyChrome() {
  const html = document.documentElement;
  html.lang = LANG_META[LANG].html; html.dir = LANG_META[LANG].dir;
  const k = LANG === 'en' ? 1 : 0;
  $$('[data-t]').forEach(el => { el.textContent = CHROME[el.dataset.t][k]; });
  $$('[data-t-attr]').forEach(el => el.dataset.tAttr.split(';').forEach(pair => { const [attr, key] = pair.split(':'); el.setAttribute(attr, CHROME[key][k]); }));
  const md = $('meta[name="description"]'); if (md) md.setAttribute('content', CHROME.metaDesc[k]);
  $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
}

/* ---------- Language ---------- */
const LANG_KEY = 'omantel-clickup-hub:lang';
function readLangPref() { try { const v = window.localStorage.getItem(LANG_KEY); return v === 'ar' || v === 'en' ? v : null; } catch (e) { return null; } }
function saveLangPref(l) { try { window.localStorage.setItem(LANG_KEY, l); return true; } catch (e) { return false; } }

/* Capture what the learner is looking at and typing, switch every string in
   place, re-render the same screen, then put scroll, drafts and focus back. */
function setLanguage(lang, opts) {
  opts = opts || {};
  if (lang === LANG && !opts.force) return;
  const main = $('#main');
  // Scroll anchor. Both languages render the same structure, so the
  // anchor's index is stable.
  const blocks = $$('h1, h2, h3, .panel, .lesson-stage', main);
  const topH = $('.topbar').offsetHeight;
  // Prefer the first block that starts in view; fall back to one crossing the top edge.
  const pinned = el => { for (let e = el; e && e !== main; e = e.parentElement) { const pos = getComputedStyle(e).position; if (pos === 'sticky' || pos === 'fixed') return true; } return false; };
  let ai = blocks.findIndex(b => !pinned(b) && b.getBoundingClientRect().top >= topH - 2);
  if (ai < 0) ai = blocks.findIndex(b => !pinned(b) && b.getBoundingClientRect().bottom > topH + 4);
  const anchorTop = ai >= 0 ? blocks[ai].getBoundingClientRect().top : 0;
  const atTop = window.scrollY < 4;
  // Drafts typed but not yet submitted
  const drafts = {};
  $$('input[id]:not([type=checkbox]):not([type=radio]), textarea[id]', main).forEach(el => { if (el.value) drafts[el.id] = el.value; });
  const active = document.activeElement;
  const focusLang = active && active.dataset && active.dataset.lang;
  const focusId = !focusLang && active && active.id && main.contains(active) ? active.id : null;
  const navOpen = $('#sidebar').classList.contains('open');

  LANG = lang;
  I18N.set(lang);
  Lab.relocalize();
  applyChrome();
  buildSearch();
  // Hold the page height during the swap so the browser does not clamp the scroll position.
  main.style.minHeight = main.offsetHeight + 'px';
  if (currentRoute) renderRoute(true, true);
  if (navOpen) { $('#sidebar').classList.add('open'); $('#scrim').hidden = false; }

  Object.keys(drafts).forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) { el.value = drafts[id]; el.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  const nb = !atTop && ai >= 0 ? $$('h1, h2, h3, .panel, .lesson-stage', main)[ai] : null;
  const target = nb ? nb.getBoundingClientRect().top + window.scrollY - anchorTop : 0;
  main.style.minHeight = '';
  window.scrollTo(0, Math.max(0, target));
  if (focusLang) { const b = $('[data-lang="' + lang + '"]'); if (b) b.focus({ preventScroll: true }); }
  else if (focusId) { const el = document.getElementById(focusId); if (el) el.focus({ preventScroll: true }); }
  if (!opts.silent) announce(tx('اللغة الآن العربية', 'Language set to English'));
  if (!opts.noSave && !saveLangPref(lang) && !opts.silent) toast(tx('تعذّر حفظ اختيار اللغة على هذا المتصفح. سيبقى لهذه الجلسة فقط.', 'Your language choice could not be saved on this browser. It applies to this session only.'));
}

function setupLanguage() {
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => setLanguage(b.dataset.lang)));
  const gate = $('#langGate');
  if (readLangPref()) return;
  // First visit: equal choice between Arabic and English.
  gate.hidden = false;
  document.body.classList.add('gate-open');
  $('#appRoot').setAttribute('inert', '');
  $('#gateNote').hidden = Store.ok;
  // Focus the dialog, not an option, so neither language looks preselected.
  $('.gate-card', gate).focus();
  gate.addEventListener('click', e => {
    const b = e.target.closest('[data-gate]'); if (!b) return;
    setLanguage(b.dataset.gate, { force: true, silent: true });
    gate.classList.add('leaving');
    $('#appRoot').removeAttribute('inert');
    document.body.classList.remove('gate-open');
    setTimeout(() => { gate.hidden = true; gate.classList.remove('leaving'); }, prefersReducedMotion() ? 0 : 220);
    const h1 = $('#main h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
    announce(tx('تم اختيار العربية', 'English selected'));
  });
  gate.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const btns = $$('[data-gate]', gate); const i = btns.indexOf(document.activeElement);
    e.preventDefault(); btns[i < 0 ? (e.shiftKey ? btns.length - 1 : 0) : (i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length].focus();
  });
}

/* ---------- Global search ---------- */
let searchIndex = [];
function buildSearch() {
  const items = [];
  LESSONS.forEach(l => items.push({ kind: 'lesson', title: l.title, sub: tx('الوحدة ', 'Module ') + MODULE[l.module].n + ': ' + MODULE[l.module].title, href: '#/lesson/' + l.id, hay: (l.title + ' ' + l.objective + ' ' + MODULE[l.module].title + ' ' + MODULE[l.module].en + ' ' + l.explain.join(' ')).toLowerCase() }));
  GLOSSARY.forEach(g => items.push({ kind: 'term', title: isEN() ? g.en : g.en + ' | ' + g.ar, sub: g.def, href: '#/help/glossary', term: g.en, hay: (g.en + ' ' + g.ar + ' ' + g.def).toLowerCase() }));
  [['#/lab', tx('مختبر التطبيق Practice Lab', 'Practice Lab')], ['#/studio', tx('استوديو لوحات المعلومات Dashboard Studio', 'Dashboard Studio')], ['#/assess', tx('التقييمات Assessments', 'Assessments')], ['#/progress', tx('تقدّمي My Progress', 'My Progress')], ['#/help/faq', tx('أسئلة شائعة FAQ', 'FAQ')]].forEach(p => items.push({ kind: 'page', title: p[1], sub: tx('صفحة', 'Page'), href: p[0], hay: p[1].toLowerCase() }));
  TOUR_PARTS.forEach(p => items.push({ kind: 'tour', title: tp(p.name), sub: tp(p.one), href: '#/tour/' + p.id, hay: (tp(p.name) + ' ' + tp(p.one) + ' ' + p.name[1]).toLowerCase() }));
  CU_FAQ.forEach(f => items.push({ kind: 'faq', title: tp(f.q), sub: tp(f.a), href: '#/questions', hay: (tp(f.q) + ' ' + tp(f.a)).toLowerCase() }));
  [['#/tour', tx('جولة ClickUp ClickUp tour', 'ClickUp tour')], ['#/questions', tx('الأسئلة الشائعة Common questions', 'Common questions')]].forEach(p => items.push({ kind: 'page', title: p[1], sub: tx('صفحة', 'Page'), href: p[0], hay: p[1].toLowerCase() }));
  searchIndex = items;
  const box = $('#globalSearchResults'); if (box) { box.hidden = true; $('#globalSearchInput').setAttribute('aria-expanded', 'false'); }
}
function setupSearch() {
  buildSearch();
  const form = $('#globalSearch'), input = $('#globalSearchInput'), box = $('#globalSearchResults');
  let results = [], sel = -1;
  const close = () => { box.hidden = true; input.setAttribute('aria-expanded', 'false'); sel = -1; input.removeAttribute('aria-activedescendant'); };
  const paint = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { close(); return; }
    const terms = q.split(/\s+/);
    results = searchIndex.map(it => ({ it, score: terms.every(tm => it.hay.includes(tm)) ? (it.title.toLowerCase().includes(q) ? 2 : 1) : 0 })).filter(r => r.score).sort((a, b) => b.score - a.score).slice(0, 10).map(r => r.it);
    const groups = [['tour', tx('جولة ClickUp', 'ClickUp tour')], ['faq', tx('الأسئلة الشائعة', 'Common questions')], ['lesson', tx('الدروس', 'Lessons')], ['term', tx('المصطلحات', 'Terms')], ['page', tx('الصفحات', 'Pages')]];
    box.innerHTML = results.length ? groups.map(g => { const list = results.filter(r => r.kind === g[0]); if (!list.length) return ''; return '<div class="gs-group" role="presentation">' + g[1] + '</div>' + list.map(r => { const idx = results.indexOf(r); return '<a class="gs-item" role="option" id="gs-' + idx + '" data-idx="' + idx + '" href="' + r.href + '" aria-selected="false">' + icon({ lesson: 'book', term: 'tag', tour: 'rocket', faq: 'help' }[r.kind] || 'compass', 'icon-sm') + '<span>' + t(r.title) + '<small>' + t(r.sub.length > 90 ? r.sub.slice(0, 88) + '…' : r.sub) + '</small></span></a>'; }).join(''); }).join('')
      : '<div class="gs-empty">' + tx('لا نتائج لـ «' + esc(input.value) + '». جرّب كلمة أخرى أو', 'No results for “' + esc(input.value) + '”. Try another word or') + ' <a href="#/help/glossary">' + tx('تصفّح المصطلحات', 'browse the glossary') + '</a>.</div>';
    box.hidden = false; input.setAttribute('aria-expanded', 'true'); sel = -1;
  };
  const go = r => {
    if (!r) return;
    if (r.term) { try { window.sessionStorage.setItem('focusTerm', r.term); } catch (e) { } }
    close(); input.value = ''; input.blur();
    if (location.hash === r.href) rerender(); else location.hash = r.href;
    $('#globalSearch').classList.remove('show-mobile');
  };
  input.addEventListener('input', debounce(paint, 100));
  input.addEventListener('focus', () => { if (input.value.trim()) paint(); });
  input.addEventListener('keydown', e => {
    const items = $$('.gs-item', box);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return; e.preventDefault();
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((it, k) => it.setAttribute('aria-selected', k === sel));
      input.setAttribute('aria-activedescendant', items[sel].id); items[sel].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Escape') { close(); }
  });
  form.addEventListener('submit', e => { e.preventDefault(); const items = $$('.gs-item', box); const pick = sel >= 0 ? items[sel] : items[0]; if (pick) go(results[+pick.dataset.idx]); });
  box.addEventListener('click', e => { const a = e.target.closest('.gs-item'); if (!a) return; e.preventDefault(); go(results[+a.dataset.idx]); });
  document.addEventListener('click', e => { if (!form.contains(e.target)) close(); });

  // Mobile: a search button reveals the field
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'icon-btn mobile-search-btn'; btn.dataset.tAttr = 'aria-label:search'; btn.innerHTML = icon('search');
  $('.topbar').insertBefore(btn, $('.lang-switch'));
  btn.addEventListener('click', () => { form.classList.toggle('show-mobile'); if (form.classList.contains('show-mobile')) input.focus(); });
}

/* ---------- Logos: official files if supplied, clear placeholders otherwise ---------- */
function setupLogos() {
  // The logos are embedded once in the header; other placements reuse them.
  $$('img[data-logo]').forEach(img => { const src = $('.topbar .logo-' + img.dataset.logo); if (src) img.src = src.src; });
  $$('.logo-slot').forEach(slot => {
    const img = $('img', slot); const cands = (img.dataset.candidates || '').split(',').filter(Boolean);
    let i = 0;
    const tryNext = () => {
      if (i >= cands.length) return;
      const probe = new Image();
      probe.onload = () => { img.src = probe.src; img.hidden = false; slot.classList.add('has-logo'); };
      probe.onerror = () => { i++; tryNext(); };
      probe.src = cands[i];
    };
    tryNext();
  });
}

/* ---------- Boot ---------- */
function registerContent() {
  I18N.register('REVIEW', REVIEW, EN_CORE.REVIEW);
  I18N.register('LEVELS', LEVELS, EN_CORE.LEVELS);
  I18N.register('PEOPLE', PEOPLE, EN_CORE.PEOPLE);
  I18N.register('MODULES', MODULES, EN_CORE.MODULES);
  I18N.register('PATHWAYS', PATHWAYS, EN_CORE.PATHWAYS);
  I18N.register('GLOSSARY', GLOSSARY, EN_CORE.GLOSSARY);
  I18N.register('FAQ', FAQ, EN_CORE.FAQ);
  I18N.register('COMMON_MISTAKES', COMMON_MISTAKES, EN_CORE.COMMON_MISTAKES);
  I18N.register('RESOURCES', RESOURCES, EN_CORE.RESOURCES);
  I18N.register('LAB_LISTS', LAB_LISTS, EN_CORE.LAB_LISTS);
  I18N.register('CHALLENGES', CHALLENGES, EN_CORE.CHALLENGES);
  I18N.register('PRACTICAL', PRACTICAL, EN_CORE.PRACTICAL);
  I18N.register('HOME_DEMO', HOME_DEMO, EN_CORE.HOME_DEMO);
  I18N.register('LESSONS', LESSONS, EN_LESSONS);
  // Questions are addressed by their stable IDs in both languages
  const byId = {};
  LESSONS.forEach(l => l.check.forEach(q => { byId[q.id] = q; }));
  Object.keys(QUIZZES).forEach(m => QUIZZES[m].forEach(q => { byId[q.id] = q; }));
  Object.keys(EN_QUESTIONS).forEach(id => { if (byId[id]) I18N.register('Q:' + id, byId[id], EN_QUESTIONS[id]); else I18N.errors.push('unknown question ' + id); });
}

function boot() {
  registerContent();
  $('#navToggle').innerHTML = icon('menu');
  $('.gs-icon').innerHTML = icon('search', 'icon-sm');
  Lab.init();
  setupLogos();
  setupSearch();
  applyChrome();
  $('#navToggle').addEventListener('click', () => { if ($('#sidebar').classList.contains('open')) closeNav(); else openNav(); });
  $('#scrim').addEventListener('click', closeNav);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#sidebar').classList.contains('open')) { closeNav(); $('#navToggle').focus(); } });
  $('#sidebar').addEventListener('click', e => { if (e.target.closest('a')) closeNav(); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]:not([href^="#/"])');
    if (!a || e.defaultPrevented) return;
    e.preventDefault();
    const tgt = document.getElementById(a.getAttribute('href').slice(1));
    if (tgt) { tgt.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }); if (!tgt.hasAttribute('tabindex')) tgt.setAttribute('tabindex', '-1'); tgt.focus({ preventScroll: true }); }
  });
  window.addEventListener('hashchange', () => { routedByUser = true; renderRoute(); });
  Store.on(kind => {
    if (!currentRoute) return;
    renderSidebar(currentRoute); renderTopProgress();
    if (kind === 'reset' && currentRoute.name !== 'progress') rerender();
    if (kind === 'storage') toast(tx('تعذّر الحفظ على هذا الجهاز. سيعمل التقدم لهذه الجلسة فقط.', 'Saving failed on this device. Progress will work for this session only.'));
  });
  // Apply a remembered language before the first render, so the page renders once.
  const pref = readLangPref();
  if (pref && pref !== LANG) { LANG = pref; I18N.set(pref); Lab.relocalize(); applyChrome(); buildSearch(); }
  if (!location.hash) history.replaceState(null, '', '#/home');
  renderRoute();
  setupLanguage();
  window.__hub = { setLanguage, get lang() { return LANG; }, errors: I18N.errors, content: { LESSONS, MODULES, GLOSSARY, QUIZZES, FAQ, PATHWAYS, COMMON_MISTAKES, RESOURCES, PEOPLE, LAB_LISTS, CHALLENGES, PRACTICAL, HOME_DEMO }, demoStr, Lab };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
