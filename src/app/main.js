/* ==========================================================================
   Boot, router, global search, navigation drawer, logo slots.
   ========================================================================== */

const ROUTES = {
  home: { view: viewHome, title: 'الرئيسية' },
  library: { view: viewLibrary, title: 'مكتبة الدروس' },
  lesson: { view: viewLesson, title: 'درس' },
  lab: { view: (el) => { LabUI.mount(el); return () => LabUI.unmount(); }, title: 'مختبر التطبيق' },
  studio: { view: (el) => { Studio.mount(el); return () => Studio.unmount(); }, title: 'استوديو لوحات المعلومات' },
  assess: { view: viewAssess, title: 'التقييمات' },
  progress: { view: viewProgress, title: 'تقدّمي' },
  help: { view: viewHelp, title: 'المصطلحات والمساعدة' },
  about: { view: viewAbout, title: 'حول المنصة' }
};

let currentCleanup = null, currentRoute = null;

function parseHash() {
  const h = (location.hash || '#/home').replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean).map(decodeURIComponent);
  return { name: parts[0] || 'home', params: parts.slice(1) };
}

function rerender() { renderRoute(true); }

function renderRoute(keepScroll) {
  const route = parseHash();
  const def = ROUTES[route.name];
  if (typeof currentCleanup === 'function') { try { currentCleanup(); } catch (e) { console.error(e); } }
  currentCleanup = null;
  const main = $('#main');
  const host = document.createElement('div');
  main.replaceChildren(host);
  if (!def) { viewNotFound(host); currentRoute = route; document.title = 'غير موجودة | Omantel | ClickUp Learning Hub'; return; }
  currentRoute = route;
  try { currentCleanup = def.view(host, route.params) || null; }
  catch (e) { console.error(e); host.innerHTML = '<div class="page page-narrow"><div class="panel empty-state">' + icon('alert') + '<h1 style="font-size:1.2rem">حدث خطأ أثناء عرض هذه الصفحة</h1><p>أعد تحميل الصفحة. تقدّمك محفوظ.</p><a class="btn btn-primary" href="#/home">الرئيسية</a></div></div>'; }
  const pageTitle = route.name === 'lesson' && LESSON[route.params[0]] ? LESSON[route.params[0]].title : def.title;
  document.title = pageTitle + ' | Omantel | ClickUp Learning Hub';
  renderSidebar(route);
  renderTopProgress();
  closeNav();
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

/* ---------- Global search ---------- */
function buildSearchIndex() {
  const items = [];
  LESSONS.forEach(l => items.push({ kind: 'lesson', title: l.title, sub: 'الوحدة ' + MODULE[l.module].n + ': ' + MODULE[l.module].title, href: '#/lesson/' + l.id, hay: (l.title + ' ' + l.objective + ' ' + MODULE[l.module].title + ' ' + MODULE[l.module].en + ' ' + l.explain.join(' ')).toLowerCase() }));
  GLOSSARY.forEach(g => items.push({ kind: 'term', title: g.en + ' | ' + g.ar, sub: g.def, href: '#/help/glossary', term: g.en, hay: (g.en + ' ' + g.ar + ' ' + g.def).toLowerCase() }));
  [['#/lab', 'مختبر التطبيق Practice Lab'], ['#/studio', 'استوديو لوحات المعلومات Dashboard Studio'], ['#/assess', 'التقييمات Assessments'], ['#/progress', 'تقدّمي My Progress'], ['#/help/faq', 'أسئلة شائعة FAQ']].forEach(p => items.push({ kind: 'page', title: p[1], sub: 'صفحة', href: p[0], hay: p[1].toLowerCase() }));
  return items;
}
function setupSearch() {
  const index = buildSearchIndex();
  const form = $('#globalSearch'), input = $('#globalSearchInput'), box = $('#globalSearchResults');
  let results = [], sel = -1;
  const close = () => { box.hidden = true; input.setAttribute('aria-expanded', 'false'); sel = -1; input.removeAttribute('aria-activedescendant'); };
  const paint = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { close(); return; }
    const terms = q.split(/\s+/);
    results = index.map(it => ({ it, score: terms.every(tm => it.hay.includes(tm)) ? (it.title.toLowerCase().includes(q) ? 2 : 1) : 0 })).filter(r => r.score).sort((a, b) => b.score - a.score).slice(0, 10).map(r => r.it);
    const groups = [['lesson', 'الدروس'], ['term', 'المصطلحات'], ['page', 'الصفحات']];
    let i = 0;
    box.innerHTML = results.length ? groups.map(g => { const list = results.filter(r => r.kind === g[0]); if (!list.length) return ''; return '<div class="gs-group" role="presentation">' + g[1] + '</div>' + list.map(r => { const idx = results.indexOf(r); i++; return '<a class="gs-item" role="option" id="gs-' + idx + '" data-idx="' + idx + '" href="' + r.href + '" aria-selected="false">' + icon(r.kind === 'lesson' ? 'book' : r.kind === 'term' ? 'tag' : 'compass', 'icon-sm') + '<span>' + t(r.title) + '<small>' + t(r.sub.length > 90 ? r.sub.slice(0, 88) + '…' : r.sub) + '</small></span></a>'; }).join(''); }).join('')
      : '<div class="gs-empty">لا نتائج لـ «' + esc(input.value) + '». جرّب كلمة أخرى أو <a href="#/help/glossary">تصفّح المصطلحات</a>.</div>';
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
  btn.type = 'button'; btn.className = 'icon-btn mobile-search-btn'; btn.setAttribute('aria-label', 'بحث'); btn.innerHTML = icon('search');
  $('.topbar').insertBefore(btn, $('#topProgress'));
  btn.addEventListener('click', () => { form.classList.toggle('show-mobile'); if (form.classList.contains('show-mobile')) input.focus(); });
}

/* ---------- Logos: official files if supplied, clear placeholders otherwise ---------- */
function setupLogos() {
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
function boot() {
  $('#navToggle').innerHTML = icon('menu');
  $('.gs-icon').innerHTML = icon('search', 'icon-sm');
  Lab.init();
  setupLogos();
  setupSearch();
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
    if (kind === 'storage') toast('تعذّر الحفظ على هذا الجهاز. سيعمل التقدم لهذه الجلسة فقط.');
  });
  if (!location.hash) history.replaceState(null, '', '#/home');
  renderRoute();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
