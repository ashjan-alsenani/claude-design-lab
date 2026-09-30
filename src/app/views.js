/* ==========================================================================
   Page views. Each view renders into <main> and returns an optional cleanup.
   Every string is bilingual: tx('عربي', 'English') for interface copy, and
   content fields (lesson text, glossary...) switch through the overlay model.
   ========================================================================== */

const CREDIT = 'Designed by Ashjan Al Sinani';

function lessonStatusKey(id) {
  const s = Store.lessonState(id);
  if (s.done) return 'done';
  if (s.watched || s.practiced || s.checked) return 'progress';
  return 'todo';
}
function moduleProgress(mid) {
  const ls = MODULE[mid].lessons; const done = ls.filter(id => Store.isDone(id)).length;
  return { done, total: ls.length, started: ls.some(id => lessonStatusKey(id) !== 'todo') };
}
function nextLessonId() {
  const last = Store.state.last && Store.state.last.lesson;
  if (last && LESSON[last] && !Store.isDone(last)) return last;
  const n = LESSONS.find(l => !Store.isDone(l.id));
  return n ? n.id : null;
}
function levelChip(lv) { return '<span class="chip chip-level-' + lv + '">' + LEVELS[lv].name + '</span>'; }
function timeChip(min) { return '<span class="chip" title="' + tx('تقدير تقريبي', 'Approximate estimate') + '">' + icon('clock', 'icon-sm') + '≈ ' + min + tx(' دقائق (تقدير)', ' min (estimate)') + '</span>'; }
/* Secondary English label beside an Arabic heading. Hidden in English mode, where it would repeat the heading. */
function enSub(en, cls) { return LANG === 'en' ? '' : ' <bdi class="en ' + (cls || 'h1-sub') + '" dir="ltr">' + en + '</bdi>'; }
function lessonLink(id) { return '#/lesson/' + id; }
function stAvatar(p) { return p.done === p.total ? 'done' : p.started ? 'started' : ''; }
const NEW_TAB = () => '<span class="visually-hidden">' + tx(' (يفتح في نافذة جديدة)', ' (opens in a new tab)') + '</span>';
const statusWord = st => st === 'done' ? tx('مكتمل', 'Completed') : st === 'progress' ? tx('قيد التعلم', 'In progress') : tx('لم يبدأ', 'Not started');
const moduleLabel = n => tx('الوحدة ', 'Module ') + n;

/* ---------- Sidebar & top progress ---------- */
function renderSidebar(route) {
  const nav = $('#sidebar'); const cur = route.name;
  const last = Store.state.last && LESSON[Store.state.last.lesson] ? Store.state.last.lesson : null;
  const NAV_C = { compass: '#ff02f0', message: '#14b8a6', home: '#7b68ee', book: '#e44bb6', play: '#ff7a45', flask: '#1fb6e0', chart: '#4f86f7', assess: '#22c38e', progress: '#f5a524', help: '#a855f7', info: '#8a86a0' };
  const item = (href, ic, label, active, extra) => '<li><a class="nav-link" href="' + href + '"' + (active ? ' aria-current="page"' : '') + '><span class="ic-tile" style="--tc:' + NAV_C[ic] + '">' + icon(ic) + '</span><span>' + label + '</span>' + (extra || '') + '</a></li>';
  const done = LESSONS.filter(l => Store.isDone(l.id)).length;
  const inLesson = cur === 'lesson' || cur === 'library';
  nav.innerHTML =
    '<div><p class="nav-group-title">' + tx('ابدأ هنا', 'Start here') + '</p><ul class="nav-list nav-main">' +
    item('#/home', 'home', tx('الرئيسية', 'Home'), cur === 'home') +
    item('#/tour', 'compass', tx('جولة ClickUp', 'ClickUp tour'), cur === 'tour', '<span class="count num">' + tourDone() + '/12</span>') +
    item('#/library', 'book', tx('الدروس', 'Lessons'), cur === 'library' || (cur === 'lesson' && !last), '<span class="count num">' + done + '/' + LESSONS.length + '</span>') +
    (last ? item(lessonLink(last), 'play', tx('متابعة الدرس', 'Continue lesson'), cur === 'lesson') : '') +
    item('#/lab', 'flask', tx('مختبر التطبيق', 'Practice Lab'), cur === 'lab') +
    item('#/questions', 'message', tx('الأسئلة الشائعة', 'Common questions'), cur === 'questions') +
    '</ul></div>' +
    '<details class="nav-more"' + (['studio', 'assess', 'progress', 'help', 'about'].includes(cur) || UIState.get('nav-more') ? ' open' : '') + '><summary class="nav-group-title">' + tx('المزيد', 'More') + icon('chev-down', 'icon-sm') + '</summary><ul class="nav-list">' +
    item('#/progress', 'progress', tx('تقدّمي', 'My Progress'), cur === 'progress') +
    item('#/assess', 'assess', tx('التقييمات', 'Assessments'), cur === 'assess') +
    item('#/studio', 'chart', tx('استوديو لوحات المعلومات', 'Dashboard Studio'), cur === 'studio') +
    item('#/help', 'help', tx('المصطلحات والمساعدة', 'Glossary & Help'), cur === 'help') +
    item('#/about', 'info', tx('حول المنصة', 'About'), cur === 'about') +
    '</ul></details>' +
    '<details class="nav-more"' + (inLesson ? ' open' : '') + '><summary class="nav-group-title">' + tx('الوحدات الاثنتا عشرة', 'The 12 modules') + icon('chev-down', 'icon-sm') + '</summary><ul class="nav-list">' + MODULES.map(m => {
      const p = moduleProgress(m.id);
      const target = m.lessons.find(id => !Store.isDone(id)) || m.lessons[0];
      const active = cur === 'lesson' && route.params[0] && LESSON[route.params[0]] && LESSON[route.params[0]].module === m.id;
      return '<li><a class="nav-link" style="' + modStyle(m.id) + '" href="' + lessonLink(target) + '"' + (active ? ' aria-current="page"' : '') + '><span class="space-avatar ' + stAvatar(p) + '">' + m.n + '</span><span>' + t(m.title) + '</span>' +
        (p.done === p.total ? '<span class="mini-check" aria-label="' + tx('مكتملة', 'Completed') + '">' + icon('check', 'icon-sm') + '</span>' : '<span class="count num">' + p.done + '/' + p.total + '</span>') + '</a></li>';
    }).join('') + '</ul></details>' +
    '<div class="sidebar-foot"><p>' + (Store.ok ? tx('يُحفظ تقدّمك على هذا المتصفح وهذا الجهاز فقط.', 'Your progress is saved on this browser and this device only.') : tx('التخزين المحلي غير متاح: التقدّم لهذه الجلسة فقط.', 'Local storage is unavailable: progress lasts for this session only.')) + '</p><p class="credit" lang="en" dir="ltr">' + CREDIT + '</p></div>';
}
function renderTopProgress() {
  const done = LESSONS.filter(l => Store.isDone(l.id)).length;
  $('#topProgress').innerHTML = '<span class="num tp-long">' + tx(done + ' من ' + LESSONS.length + ' درساً', done + ' of ' + LESSONS.length + ' lessons') + '</span><span class="num tp-short">' + done + '/' + LESSONS.length + '</span><span class="meter" aria-hidden="true"><i style="width:' + (done / LESSONS.length * 100) + '%"></i></span>';
  $('#topProgress').setAttribute('aria-label', tx('تقدّمي: ' + done + ' من ' + LESSONS.length + ' درساً مكتملاً', 'My progress: ' + done + ' of ' + LESSONS.length + ' lessons completed'));
}

/* ---------- Library ---------- */
const LibState = { q: '', module: '', level: '', status: '', bookmarks: false };
function viewLibrary(main) {
  main.innerHTML = '<div class="page">' +
    '<div class="page-head"><div><h1>' + tx('مكتبة الدروس', 'Learning Library') + enSub('Learning Library') + '</h1><p>' + tx(LESSONS.length + ' درساً في 12 وحدة. الأوقات المعروضة تقديرية.', LESSONS.length + ' lessons in 12 modules. Times shown are estimates.') + '</p></div></div>' +
    '<div class="panel filters-bar" role="search"><div class="field grow"><label for="libQ">' + tx('بحث', 'Search') + '</label><input class="input" id="libQ" type="search" placeholder="' + tx('ابحث في العناوين والأهداف', 'Search titles and objectives') + '" value="' + esc(LibState.q) + '"></div>' +
    '<div class="field"><label for="libM">' + tx('الوحدة (الموضوع)', 'Module (topic)') + '</label><select class="select" id="libM"><option value="">' + tx('كل الوحدات', 'All modules') + '</option>' + MODULES.map(m => '<option value="' + m.id + '"' + (LibState.module === m.id ? ' selected' : '') + '>' + m.n + '. ' + esc(m.title) + '</option>').join('') + '</select></div>' +
    '<div class="field"><span class="field-label" id="libLvL">' + tx('المستوى', 'Level') + '</span><div class="seg" role="group" aria-labelledby="libLvL">' + [['', tx('الكل', 'All')], ['beginner', LEVELS.beginner.name], ['intermediate', LEVELS.intermediate.name], ['advanced', LEVELS.advanced.name]].map(l => '<button type="button" data-lv="' + l[0] + '" aria-pressed="' + (LibState.level === l[0]) + '">' + l[1] + '</button>').join('') + '</div></div>' +
    '<div class="field"><label for="libS">' + tx('حالة الإكمال', 'Completion') + '</label><select class="select" id="libS"><option value="">' + tx('الكل', 'All') + '</option>' + ['todo', 'progress', 'done'].map(k => '<option value="' + k + '"' + (LibState.status === k ? ' selected' : '') + '>' + statusWord(k) + '</option>').join('') + '</select></div>' +
    '<label class="check" style="margin-bottom:9px"><input type="checkbox" id="libB"' + (LibState.bookmarks ? ' checked' : '') + '> ' + tx('المحفوظة فقط', 'Saved only') + '</label></div>' +
    '<p class="filter-summary" id="libCount" aria-live="polite"></p><div data-results style="display:grid;gap:16px"></div></div>';
  const paint = () => {
    const q = LibState.q.trim(); const ql = q.toLowerCase();
    const res = LESSONS.filter(l => (!LibState.module || l.module === LibState.module) && (!LibState.level || l.level === LibState.level) &&
      (!LibState.status || lessonStatusKey(l.id) === LibState.status) && (!LibState.bookmarks || Store.isBookmarked(l.id)) &&
      (!q || [l.title, l.objective, MODULE[l.module].title, MODULE[l.module].en].some(x => x.toLowerCase().includes(ql))));
    $('#libCount').textContent = tx(res.length + ' من ' + LESSONS.length + ' دروس ظاهرة', res.length + ' of ' + LESSONS.length + ' lessons shown');
    const box = $('[data-results]', main);
    if (!res.length) { box.innerHTML = '<div class="panel empty-state">' + icon('search') + '<h2 style="font-size:1.05rem">' + tx('لا توجد دروس تطابق هذه المرشّحات', 'No lessons match these filters') + '</h2><p>' + tx('جرّب كلمة أخرى أو امسح المرشّحات.', 'Try another word or clear the filters.') + '</p><button type="button" class="btn btn-secondary" data-clear>' + tx('مسح المرشّحات', 'Clear filters') + '</button></div>'; return; }
    box.innerHTML = MODULES.filter(m => res.some(l => l.module === m.id)).map(m => {
      const p = moduleProgress(m.id);
      return '<section class="panel module-group" style="' + modStyle(m.id) + '" aria-labelledby="mg-' + m.id + '"><header><span class="ic-tile">' + icon(m.icon) + '</span><span class="space-avatar ' + stAvatar(p) + '">' + m.n + '</span><h2 id="mg-' + m.id + '">' + t(m.title) + '</h2>' + enSub(m.en, 'muted small') + '<span class="muted num">' + p.done + '/' + p.total + tx(' مكتمل', ' completed') + '</span></header><ul class="task-rows">' +
        res.filter(l => l.module === m.id).map(l => {
          const st = lessonStatusKey(l.id); const bm = Store.isBookmarked(l.id);
          return '<li class="task-row"><span aria-hidden="true">' + (st === 'done' ? '<span style="color:var(--st-done)">' + icon('check-circle') + '</span>' : st === 'progress' ? '<span style="color:var(--st-progress)">' + icon('play') + '</span>' : '<span style="color:var(--ink-4)">' + icon('book') + '</span>') + '</span>' +
            '<div><a class="t-title" href="' + lessonLink(l.id) + '">' + t(l.title) + '</a><span class="t-sub">' + t(l.objective) + '</span></div>' +
            '<span class="hide-sm">' + levelChip(l.level) + '</span><span class="t-time hide-sm num" title="' + tx('تقدير', 'Estimate') + '">≈ ' + l.minutes + tx(' د', ' min') + '</span>' +
            '<span>' + badge(st) + '<span class="visually-hidden">' + statusWord(st) + '</span></span>' +
            '<button type="button" class="icon-btn bookmark-btn" data-bm="' + l.id + '" aria-pressed="' + bm + '" aria-label="' + (bm ? tx('إزالة من المحفوظات: ', 'Remove from saved: ') : tx('حفظ الدرس: ', 'Save lesson: ')) + esc(l.title) + '">' + icon('bookmark') + '</button></li>';
        }).join('') + '</ul></section>';
    }).join('');
  };
  paint();
  main.addEventListener('input', debounce(e => { if (e.target.id === 'libQ') { LibState.q = e.target.value; paint(); } }, 150));
  main.addEventListener('change', e => {
    if (e.target.id === 'libM') LibState.module = e.target.value;
    if (e.target.id === 'libS') LibState.status = e.target.value;
    if (e.target.id === 'libB') LibState.bookmarks = e.target.checked;
    paint();
  });
  main.addEventListener('click', e => {
    const lv = e.target.closest('[data-lv]'); if (lv) { LibState.level = lv.dataset.lv; $$('[data-lv]', main).forEach(b => b.setAttribute('aria-pressed', b === lv)); paint(); return; }
    const bm = e.target.closest('[data-bm]'); if (bm) { const on = Store.toggleBookmark(bm.dataset.bm); toast(on ? tx('حُفظ الدرس في المحفوظات', 'Lesson saved') : tx('أُزيل الدرس من المحفوظات', 'Lesson removed from saved')); paint(); const again = main.querySelector('[data-bm="' + bm.dataset.bm + '"]'); if (again) again.focus(); return; }
    if (e.target.closest('[data-clear]')) { Object.assign(LibState, { q: '', module: '', level: '', status: '', bookmarks: false }); rerender(); }
  });
}

/* ---------- Lesson player ---------- */
const STAGES = () => [['watch', tx('شاهد', 'Watch'), 'WATCH'], ['understand', tx('افهم', 'Understand'), 'UNDERSTAND'], ['practice', tx('تدرّب', 'Practice'), 'PRACTICE'], ['check', tx('تحقّق', 'Check'), 'CHECK']];
function stageTitle(id, ic, idx) {
  const s = STAGES()[idx];
  return '<div class="stage-title" style="--sc:' + STAGE_COLORS[s[0]] + '"><span class="stage-num">' + icon(ic, 'icon-sm') + '</span><h2 id="' + id + '">' + s[1] + '</h2>' + (isEN() ? '' : '<span class="en">' + s[2] + '</span>') + '</div>';
}
function viewLesson(main, params) {
  const L = LESSON[params[0]];
  if (!L) return viewNotFound(main);
  const M = MODULE[L.module];
  Store.visit(L.id);
  const idx = LESSONS.indexOf(L); const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
  const noteHTML = n => {
    const map = { plan: ['callout-plan', 'alert', tx('يعتمد على الخطة أو الإعدادات', 'Depends on plan or settings')], admin: ['callout-admin', 'lock', tx('إجراء إداري', 'Administrator action')], uncertain: ['callout-uncertain', 'info', tx('تنبيه دقة', 'Accuracy note')], sim: ['callout-uncertain', 'eye', tx('إرشاد عام ومحاكاة', 'General guidance and simulation')] }[n.kind];
    return '<div class="callout ' + map[0] + '">' + icon(map[1]) + '<div><h3>' + map[2] + '</h3><p class="small">' + t(n.text) + '</p></div></div>';
  };
  const kinds = new Set((L.notes || []).map(n => n.kind));
  const saveLbl = on => on ? tx('محفوظ', 'Saved') : tx('حفظ', 'Save');
  main.innerHTML = '<div class="lesson-layout" style="' + modStyle(M.id) + '">' +
    '<nav class="panel lesson-nav collapsible" aria-label="' + tx('دروس الوحدة', 'Lessons in this module') + '"><h2><span class="space-avatar started">' + M.n + '</span>' + t(M.title) + '</h2>' +
    '<button type="button" class="btn btn-ghost btn-sm" data-toggle-nav style="width:100%;justify-content:space-between" aria-expanded="false">' + tx('دروس هذه الوحدة', 'Lessons in this module') + ' (' + M.lessons.length + ')' + icon('chev-down', 'icon-sm') + '</button>' +
    '<ol>' + M.lessons.map(id => '<li><a href="' + lessonLink(id) + '"' + (id === L.id ? ' aria-current="page"' : '') + '><span class="ln-state' + (Store.isDone(id) ? ' done' : '') + '">' + (Store.isDone(id) ? icon('check') : '') + '</span><span>' + t(LESSON[id].title) + '</span></a></li>').join('') + '</ol>' +
    '<div class="other-modules"><a class="btn btn-ghost btn-sm" href="#/library">' + icon('book', 'icon-sm') + tx('كل الوحدات والدروس', 'All modules and lessons') + '</a></div></nav>' +
    '<article class="lesson-main" aria-labelledby="lessonTitle">' +
    '<header class="lesson-hero" style="' + modStyle(M.id) + '"><span class="lh-art" aria-hidden="true">' + icon(M.icon) + '</span><div class="breadcrumbs"><a href="#/library">' + tx('مكتبة الدروس', 'Learning Library') + '</a><span aria-hidden="true">/</span><span>' + moduleLabel(M.n) + ': ' + t(M.title) + '</span></div>' +
    '<div class="meta">' + levelChip(L.level) + timeChip(L.minutes) + '<span class="chip">' + icon('check-circle', 'icon-sm') + tx('روجع في ', 'Reviewed ') + fmtDate(REVIEW_DATE, true) + '</span>' +
    (kinds.has('plan') ? '<span class="chip chip-plan">' + tx('يعتمد على الخطة أو الإعدادات', 'Depends on plan or settings') + '</span>' : '') + (kinds.has('admin') ? '<span class="chip chip-admin">' + tx('يتضمن إجراءً إدارياً', 'Includes an admin action') + '</span>' : '') +
    '<button type="button" class="btn btn-ghost btn-sm bookmark-btn" data-bm="' + L.id + '" aria-pressed="' + Store.isBookmarked(L.id) + '">' + icon('bookmark', 'icon-sm') + '<span>' + saveLbl(Store.isBookmarked(L.id)) + '</span></button></div>' +
    '<h1 id="lessonTitle" tabindex="-1">' + t(L.title) + '</h1><div class="lh-progress" data-lhp></div></header>' +
    '<nav class="stage-rail" aria-label="' + tx('مراحل الدرس', 'Lesson stages') + '" data-rail></nav>' +
    '<div class="panel lesson-intro"><div><h2>' + icon('target', 'icon-sm') + tx('هدف التعلّم', 'Learning objective') + '</h2><p>' + t(L.objective) + '</p></div><div><h2>' + icon('users', 'icon-sm') + tx('موقف من العمل', 'Workplace scenario') + '</h2><p>' + t(L.scenario) + '</p></div></div>' +

    '<section class="lesson-stage" id="watch" aria-labelledby="stWatch">' + stageTitle('stWatch', 'play', 0) +
    '<p class="help-text">' + tx('عرض متحرك صامت بلا صوت. استخدم الإيقاف المؤقت والخطوات والسرعة كما يناسبك. الشاشة محاكاة تعليمية مبسّطة، وليست تسجيلاً من ClickUp.', 'A silent animated walkthrough with no audio. Use pause, steps and speed as you like. The screen is a simplified educational simulation, not a recording of ClickUp.') + '</p><div data-demo></div></section>' +

    '<section class="lesson-stage" id="understand" aria-labelledby="stUnd">' + stageTitle('stUnd', 'bulb', 1) +
    '<div class="panel explain"><div class="prose">' + L.explain.map(p => '<p>' + bidi(p) + '</p>').join('') + '</div>' +
    (L.hier ? '<div data-hier></div>' : '') +
    (L.deeper ? '<details class="deeper"' + (UIState.get('deeper-' + L.id) ? ' open' : '') + ' data-keep="deeper-' + L.id + '"><summary>' + icon('plus', 'icon-sm') + t(L.deeper.title) + '<span class="chev" style="margin-inline-start:auto">' + icon('fwd', 'icon-sm') + '</span></summary><div class="deeper-body prose">' + L.deeper.body.map(p => '<p>' + bidi(p) + '</p>').join('') + '</div></details>' : '') +
    ((L.notes || []).length ? '<div style="display:grid;gap:10px">' + L.notes.map(noteHTML).join('') + '</div>' : '') + '</div>' +
    '<div class="mistake" role="group" aria-label="' + tx('خطأ شائع', 'Common mistake') + '"><div class="wrong"><h3>' + icon('x-circle', 'icon-sm') + tx('خطأ شائع', 'Common mistake') + '</h3><p>' + t(L.mistake.wrong) + '</p></div><div class="right"><h3>' + icon('check-circle', 'icon-sm') + tx('كيف تتجنبه', 'How to avoid it') + '</h3><p>' + t(L.mistake.right) + '</p></div></div></section>' +

    '<section class="lesson-stage" id="practice" aria-labelledby="stPr">' + stageTitle('stPr', 'flask', 2) + '<div class="panel" data-ex></div>' +
    '<p class="help-text">' + tx('تريد تدريباً أوسع؟', 'Want more practice?') + ' <a href="#/lab">' + tx('افتح مختبر التطبيق', 'Open the Practice Lab') + '</a> ' + tx('وجرّب التحديات الموجهة على مساحة عمل كاملة.', 'and try the guided challenges in a complete workspace.') + '</p></section>' +

    '<section class="lesson-stage" id="check" aria-labelledby="stCk">' + stageTitle('stCk', 'assess', 3) + '<div data-quiz></div></section>' +

    '<section class="panel panel-pad" aria-labelledby="sumT" style="display:grid;gap:14px"><h2 id="sumT" style="font-size:1.1rem">' + tx('الخلاصة', 'Summary') + '</h2><ul class="summary-list">' + L.summary.map(s => '<li>' + icon('check') + '<span>' + t(s) + '</span></li>').join('') + '</ul>' +
    '<div class="ref-row"><strong>' + tx('المرجع الرسمي:', 'Official reference:') + '</strong>' + L.refs.map(r => '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + icon('external', 'icon-sm') + '<bdi dir="auto">' + esc(r.label) + '</bdi>' + NEW_TAB() + '</a>').join('') + '</div>' +
    '<p class="help-text">' + t(REVIEW.note) + '</p></section>' +

    '<div class="panel complete-bar" data-complete></div>' +
    '<nav class="lesson-footer-nav" aria-label="' + tx('التنقل بين الدروس', 'Lesson navigation') + '">' +
    (prev ? '<a class="btn btn-secondary" href="' + lessonLink(prev.id) + '">' + icon('back', 'icon-sm') + '<span>' + tx('السابق: ', 'Previous: ') + t(prev.title) + '</span></a>' : '<span></span>') +
    (next ? '<a class="btn btn-secondary" href="' + lessonLink(next.id) + '"><span>' + tx('التالي: ', 'Next: ') + t(next.title) + '</span>' + icon('fwd', 'icon-sm') + '</a>' : '<a class="btn btn-primary" href="#/assess">' + tx('إلى التقييمات ', 'Go to assessments ') + icon('fwd', 'icon-sm') + '</a>') +
    '</nav></article></div>';

  const player = new DemoPlayer($('[data-demo]', main), L.demo, { key: 'demo-' + L.id, onWatched: () => { if (!Store.lessonState(L.id).watched) { Store.mark(L.id, 'watched', true); toast(tx('اكتملت مرحلة «شاهد»', 'Watch stage completed')); } } });
  if (L.hier) renderHierExplorer($('[data-hier]', main));
  renderExercise($('[data-ex]', main), L.exercise, L.id, () => { if (!Store.lessonState(L.id).practiced) { Motion.confetti($('[data-ex]', main), 40); Store.mark(L.id, 'practiced', true); toast(tx('اكتملت مرحلة «تدرّب»', 'Practice stage completed')); } });
  renderQuiz($('[data-quiz]', main), L.check, 'chk-' + L.id, { onSubmit: (s, n) => { Store.mark(L.id, 'checked', { score: s, total: n }); if (s === n) Motion.confetti($('[data-quiz]', main), 50); }, resultNote: () => tx('يمكنك إعادة المحاولة. لإكمال الدرس يكفي أن تجيب عن الأسئلة، ونتيجتك تساعدك على معرفة ما تراجعه.', 'You can try again. Answering the questions is enough to complete the lesson; your score shows you what to review.') });

  const paintRail = () => {
    const s = Store.lessonState(L.id);
    const doneFlags = [s.watched, s.watched || s.practiced || !!s.checked, s.practiced, !!s.checked];
    $('[data-rail]', main).innerHTML = STAGES().map((st, i) => '<a href="#' + st[0] + '" data-stage="' + st[0] + '" style="--sc:' + STAGE_COLORS[st[0]] + '" class="' + (doneFlags[i] ? 'done' : '') + '"><span class="sr-tick" aria-hidden="true">' + (doneFlags[i] ? icon('check') : '') + '</span><span>' + st[1] + '</span>' + (isEN() ? '' : '<span class="sr-en">' + st[2] + '</span>') + '<span class="visually-hidden">' + (doneFlags[i] ? tx(' (مكتملة)', ' (completed)') : '') + '</span></a>').join('');
    const nDone = s.done ? 4 : doneFlags.filter(Boolean).length;
    $('[data-lhp]', main).innerHTML = '<span class="lh-bar" aria-hidden="true"><i style="width:' + (nDone / 4 * 100) + '%"></i></span><span class="num">' + (s.done ? tx('الدرس مكتمل', 'Lesson completed') : tx(nDone + ' من 4 مراحل', nDone + ' of 4 stages')) + '</span>';
    const cb = $('[data-complete]', main);
    cb.classList.toggle('is-done', !!s.done);
    if (s.done) cb.innerHTML = '<div style="display:flex;gap:10px;align-items:center"><span style="color:var(--ok)">' + icon('check-circle', 'icon-lg') + '</span><div><strong>' + tx('أكملت هذا الدرس', 'You completed this lesson') + '</strong><p class="help-text">' + tx('في ', 'On ') + fmtStamp(s.done) + '</p></div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-ghost btn-sm" data-undone>' + tx('إلغاء تحديده كمكتمل', 'Mark as not completed') + '</button>' + (next ? '<a class="btn btn-primary" href="' + lessonLink(next.id) + '">' + tx('الدرس التالي ', 'Next lesson ') + icon('fwd', 'icon-sm') + '</a>' : '<a class="btn btn-primary" href="#/assess">' + tx('إلى التقييمات', 'Go to assessments') + '</a>') + '</div>';
    else {
      const ready = !!s.checked;
      const missing = []; if (!s.watched) missing.push(STAGES()[0][1]); if (!s.practiced) missing.push(STAGES()[2][1]); if (!s.checked) missing.push(STAGES()[3][1]);
      cb.innerHTML = '<div><strong>' + (ready ? tx('جاهز لإكمال الدرس', 'Ready to complete the lesson') : tx('أجب عن أسئلة «تحقّق» لإكمال الدرس', 'Answer the “Check” questions to complete the lesson')) + '</strong><p class="help-text">' + (missing.length ? tx('مراحل لم تكتمل بعد: ', 'Stages not completed yet: ') + missing.join(tx('، ', ', ')) + '.' : tx('أنهيت كل المراحل.', 'You finished every stage.')) + '</p></div>' +
        '<button type="button" class="btn btn-primary" data-done' + (ready ? '' : ' disabled aria-disabled="true"') + '>' + icon('check') + tx('تحديد الدرس كمكتمل', 'Mark lesson as completed') + '</button>';
    }
  };
  paintRail();
  const off = Store.on(kind => { if (kind === 'lesson' || kind === 'bookmark') paintRail(); });

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { $$('[data-stage]', main).forEach(a => a.classList.toggle('is-active', a.dataset.stage === en.target.id)); } });
  }, { rootMargin: '-40% 0px -55% 0px' });
  ['watch', 'understand', 'practice', 'check'].forEach(id => io.observe($('#' + id, main)));

  main.addEventListener('toggle', e => { const k = e.target.dataset && e.target.dataset.keep; if (k) UIState.set(k, e.target.open); }, true);
  main.addEventListener('click', e => {
    if (e.target.closest('[data-done]')) { Motion.confetti(e.target.closest('[data-done]'), 70); Store.complete(L.id); toast(tx('أحسنت! أكملت درس «' + L.title + '»', 'Well done! You completed “' + L.title + '”')); announce(tx('اكتمل الدرس', 'Lesson completed')); const n = main.querySelector('[data-complete] a.btn-primary'); if (n) n.focus(); return; }
    if (e.target.closest('[data-undone]')) { Store.uncomplete(L.id); return; }
    const bm = e.target.closest('[data-bm]');
    if (bm) { const on = Store.toggleBookmark(L.id); bm.setAttribute('aria-pressed', on); $('span', bm).textContent = saveLbl(on); toast(on ? tx('حُفظ الدرس', 'Lesson saved') : tx('أُزيل من المحفوظات', 'Removed from saved')); return; }
    const tn = e.target.closest('[data-toggle-nav]'); if (tn) { const nav = tn.closest('.lesson-nav'); const on = !nav.classList.contains('show'); nav.classList.toggle('show', on); tn.setAttribute('aria-expanded', on); return; }
    const a = e.target.closest('a[href^="#"]:not([href^="#/"])');
    if (a) { e.preventDefault(); const tgt = $(a.getAttribute('href'), main); if (tgt) { tgt.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }); const h = $('h2', tgt); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } } }
  });
  return () => { player.destroy(); off(); io.disconnect(); };
}

/* Expandable hierarchy diagram (lesson 2.1) */
function renderHierExplorer(el) {
  const TREE = { kind: 'Workspace', name: tx('مساحة عمل التدريب', 'Training Workspace'), info: tx('أعلى مستوى: المؤسسة كلها بأعضائها وإعداداتها وكل أعمالها.', 'The top level: the whole organization with its members, settings and all of its work.'), kids: [
    { kind: 'Space', name: tx('العمليات', 'Operations'), info: tx('قسم رئيسي لإدارة أو فريق. هنا تُضبط كثير من الإعدادات التي ترثها المستويات الأدنى.', 'A main area for a department or team. Many settings inherited by lower levels are set here.'), kids: [
      { kind: 'Folder', name: tx('متابعة التدقيق', 'Audit follow-up'), opt: true, info: tx('مستوى اختياري يجمع قوائم مترابطة. يمكن الاستغناء عنه ووضع القوائم في Space مباشرة.', 'An optional level that groups related Lists. You can skip it and place Lists directly in the Space.'), kids: [
        { kind: 'List', name: tx('الربع الثالث', 'Q3'), info: tx('الحاوية الإلزامية للمهام. لا توجد مهمة خارج List.', 'The required container for tasks. No task exists outside a List.'), kids: [
          { kind: 'Task', name: tx('إغلاق ملاحظة التدقيق 7', 'Close audit finding 7'), info: tx('وحدة العمل: مسؤول، حالة، تواريخ، أولوية، وتفاصيل.', 'The unit of work: assignee, status, dates, priority and details.'), kids: [
            { kind: 'Subtask', name: tx('جمع المستندات الداعمة', 'Collect supporting documents'), info: tx('خطوة أصغر لها مسؤول وتاريخ مستقلان. يمكن أن تتداخل المهام الفرعية أيضاً.', 'A smaller step with its own assignee and date. Subtasks can also be nested.') }] }] }] },
      { kind: 'List', name: tx('طلبات داخلية', 'Internal requests'), info: tx('قائمة مباشرة داخل Space دون Folder، وهذا شائع ومناسب للأعمال البسيطة.', 'A List placed directly in the Space without a Folder. This is common and suits simple work.'), kids: [
        { kind: 'Task', name: tx('طلب تقرير مبيعات الباقات', 'Plan sales report request'), info: tx('مهمة داخل قائمة موجودة مباشرة في Space.', 'A task inside a List that sits directly in the Space.') }] }] }] };
  const open = UIState.get('hier') || { exp: {}, sel: null };
  let n = 0; const flat = {};
  const node = (x, depth) => {
    const id = 'h' + (n++); flat[id] = x;
    const ex = open.exp[id] != null ? open.exp[id] : depth < 1;
    return '<li><button type="button" class="hier-node" data-h="' + id + '"' + (x.kids ? ' aria-expanded="' + ex + '"' : '') + '>' + (x.kids ? icon('chev-down', 'icon-sm') : '<span style="width:15px"></span>') +
      '<span class="h-kind">' + x.kind + '</span><span class="h-name">' + t(x.name) + '</span>' + (x.opt ? '<span class="chip h-opt">' + tx('اختياري', 'Optional') + '</span>' : '') + '</button>' +
      (x.kids ? '<ul' + (ex ? '' : ' hidden') + '>' + x.kids.map(k => node(k, depth + 1)).join('') + '</ul>' : '') + '</li>';
  };
  const detail = id => '<strong dir="ltr">' + flat[id].kind + '</strong>: ' + t(flat[id].info);
  el.innerHTML = '<div class="panel hier" style="box-shadow:none"><h3>' + icon('layers', 'icon-sm') + ' ' + tx('مخطط تفاعلي للهيكل', 'Interactive hierarchy diagram') + '</h3><p class="help-text">' + tx('افتح كل مستوى لترى ما بداخله، واختر أي عنصر لقراءة دوره.', 'Open each level to see what it contains, and select any item to read its role.') + '</p>' +
    '<ul class="hier-tree" role="tree">' + node(TREE, 0) + '</ul><div class="hier-detail" aria-live="polite" data-hd></div>' +
    '<div class="ex-actions"><button type="button" class="btn btn-ghost btn-sm" data-expand-all>' + icon('plus', 'icon-sm') + tx('افتح كل المستويات', 'Expand all levels') + '</button></div></div>';
  $('[data-hd]', el).innerHTML = open.sel ? detail(open.sel) : tx('اختر مستوى من المخطط.', 'Choose a level in the diagram.');
  el.addEventListener('click', e => {
    if (e.target.closest('[data-expand-all]')) { $$('.hier-tree ul', el).forEach(u => u.hidden = false); $$('[aria-expanded]', el).forEach(b => { b.setAttribute('aria-expanded', 'true'); open.exp[b.dataset.h] = true; }); UIState.set('hier', open); return; }
    const b = e.target.closest('[data-h]'); if (!b) return;
    const ul = b.nextElementSibling;
    if (ul && ul.tagName === 'UL') { const o = ul.hidden; ul.hidden = !o; b.setAttribute('aria-expanded', o); open.exp[b.dataset.h] = o; }
    open.sel = b.dataset.h; UIState.set('hier', open);
    $('[data-hd]', el).innerHTML = detail(b.dataset.h);
  });
}

/* ---------- Assessments ---------- */
function viewAssess(main, params) {
  const sub = params[0];
  if (sub === 'final') return viewFinal(main);
  if (sub === 'practical') return viewPractical(main);
  if (sub && QUIZZES[sub]) return viewModuleQuiz(main, sub);
  const S = Store.state;
  const fin = S.final; const prac = PRACTICAL.check(Lab.state);
  const pracDone = !!S.practical || prac.every(Boolean);
  main.innerHTML = '<div class="page"><div class="page-head"><div><h1>' + tx('التقييمات', 'Assessments') + enSub('Assessments') + '</h1><p>' + tx('اختبارات قصيرة لكل وحدة، وتقييم نهائي، وتحدٍّ عملي شامل. النتائج للتعلّم الذاتي وتُحفظ على هذا الجهاز فقط، وليست شهادة رسمية أو اعتماداً.', 'Short quizzes for each module, a final assessment and an end-to-end practical challenge. Results are for self-study, are saved on this device only, and are not an official certificate or accreditation.') + '</p></div></div>' +
    '<div class="big-cards"><div class="panel big-card" data-rv style="--tg:linear-gradient(135deg,#22c38e,#14b8a6)"><h2><span class="ic-tile">' + icon('trophy') + '</span>' + tx('التقييم النهائي', 'Final assessment') + '</h2><p>' + tx('18 سؤالاً من الوحدات الاثنتي عشرة، بشرح لكل إجابة. نسبة الاجتياز ', '18 questions across all twelve modules, with an explanation for every answer. Pass mark ') + Math.round(FINAL_PASS * 100) + '%.</p>' +
    '<p class="small">' + (fin ? tx('أفضل نتيجة: ', 'Best score: ') + '<b class="num">' + fin.best + '/' + fin.total + '</b>' + tx('، آخر نتيجة: ', ', last score: ') + '<b class="num">' + fin.last + '/' + fin.total + '</b>' + tx('، المحاولات: ', ', attempts: ') + '<span class="num">' + fin.attempts + '</span>' : tx('لم تبدأ بعد.', 'Not started yet.')) + '</p>' +
    '<div><a class="btn btn-primary" href="#/assess/final">' + (fin ? tx('إعادة التقييم', 'Retake the assessment') : tx('ابدأ التقييم النهائي', 'Start the final assessment')) + '</a></div></div>' +
    '<div class="panel big-card" data-rv style="--tg:linear-gradient(135deg,#ff02f0,#ff7a45)"><h2><span class="ic-tile">' + icon('flask') + '</span>' + tx('التحدي العملي الشامل', 'End-to-end practical challenge') + '</h2><p>' + t(PRACTICAL.scenario) + '</p><p class="small num">' + tx(prac.filter(Boolean).length + ' من ' + prac.length + ' خطوات مكتملة', prac.filter(Boolean).length + ' of ' + prac.length + ' steps completed') + (pracDone ? ' <b style="color:var(--ok)">' + tx('(مكتمل)', '(completed)') + '</b>' : '') + '</p>' +
    '<div><a class="btn btn-primary" href="#/assess/practical">' + (pracDone ? tx('راجع التحدي', 'Review the challenge') : tx('ابدأ التحدي', 'Start the challenge')) + '</a></div></div></div>' +
    '<section class="section" aria-labelledby="mqT"><div class="section-head"><h2 id="mqT">' + tx('اختبارات الوحدات', 'Module quizzes') + '</h2><p>' + tx('4 أسئلة لكل وحدة. نسبة الاجتياز ', '4 questions per module. Pass mark ') + Math.round(QUIZ_PASS * 100) + '%.</p></div><div class="assess-grid">' +
    MODULES.map(m => { const r = S.quizzes[m.id]; const passed = r && r.best / r.total >= QUIZ_PASS;
      return '<div class="panel assess-card" data-rv style="' + modStyle(m.id) + '"><h3><span><span class="space-avatar ' + (passed ? 'done' : r ? 'started' : '') + '">' + m.n + '</span>' + t(m.title) + '</span>' + ring(r ? Math.round(r.best / r.total * 100) : 0, { size: 40, stroke: 5, color: passed ? '#22c38e' : MODULE_COLORS[m.id].c, label: '<small class="num">' + (r ? Math.round(r.best / r.total * 100) + '%' : '') + '</small>' }) + '</h3><div class="row"><span class="small muted">' + (r ? tx('أفضل نتيجة ', 'Best score ') + '<b class="num">' + r.best + '/' + r.total + '</b>' + (passed ? tx(' ، ناجح', ', passed') : '') : tx('لم يُختبر بعد', 'Not taken yet')) + '</span>' +
        '<a class="btn btn-secondary btn-sm" href="#/assess/' + m.id + '">' + (r ? tx('إعادة', 'Retake') : tx('ابدأ', 'Start')) + '<span class="visually-hidden">' + tx(' اختبار الوحدة ', ' module quiz ') + m.n + '</span></a></div></div>'; }).join('') + '</div></section></div>';
}
function viewModuleQuiz(main, mid) {
  const M = MODULE[mid]; const rec = Store.state.quizzes[mid];
  main.innerHTML = '<div class="page page-narrow"><div class="page-head"><div><div class="breadcrumbs"><a href="#/assess">' + tx('التقييمات', 'Assessments') + '</a><span aria-hidden="true">/</span><span>' + moduleLabel(M.n) + '</span></div><h1 tabindex="-1">' + tx('اختبار الوحدة ', 'Module ') + M.n + tx(': ', ' quiz: ') + t(M.title) + '</h1><p>' + tx(QUIZZES[mid].length + ' أسئلة. ترتيب الخيارات يتغير في كل محاولة.', QUIZZES[mid].length + ' questions. The order of options changes with each attempt.') + (rec ? tx(' أفضل نتيجة سابقة: ', ' Previous best score: ') + rec.best + '/' + rec.total + '.' : '') + '</p></div>' +
    '<a class="btn btn-ghost" href="' + lessonLink(M.lessons[0]) + '">' + icon('book', 'icon-sm') + tx('راجع دروس الوحدة', 'Review the module lessons') + '</a></div><div data-q></div></div>';
  renderQuiz($('[data-q]', main), QUIZZES[mid], 'mq-' + mid, { pass: QUIZ_PASS, attempt: rec ? rec.attempts : 0, onSubmit: (s, n) => { Store.recordQuiz(mid, s, n); if (s / n >= QUIZ_PASS) Motion.confetti(null, 70); } });
}
function viewFinal(main) {
  const rec = Store.state.final;
  const kept = UIState.get('quiz:final');
  const attempt = kept ? kept.attempt : (rec ? rec.attempts : 0);
  const qs = buildFinal(attempt);
  main.innerHTML = '<div class="page page-narrow"><div class="page-head"><div><div class="breadcrumbs"><a href="#/assess">' + tx('التقييمات', 'Assessments') + '</a><span aria-hidden="true">/</span><span>' + tx('التقييم النهائي', 'Final assessment') + '</span></div><h1 tabindex="-1">' + tx('التقييم النهائي للمعرفة', 'Final knowledge assessment') + '</h1><p>' + tx(qs.length + ' سؤالاً تغطي الوحدات الاثنتي عشرة. نسبة الاجتياز ', qs.length + ' questions covering all twelve modules. Pass mark ') + Math.round(FINAL_PASS * 100) + tx('%. كل محاولة جديدة تعرض مزيجاً مختلفاً من الأسئلة.', '%. Each new attempt shows a different mix of questions.') + '</p></div></div><div data-q></div></div>';
  renderQuiz($('[data-q]', main), qs, 'final', { pass: FINAL_PASS, attempt, fixedSet: true, submitLabel: () => tx('إنهاء التقييم وعرض النتيجة', 'Finish and see my result'), onSubmit: (s, n) => { Store.recordQuiz('final', s, n); if (s / n >= FINAL_PASS) { Motion.confetti(null, 110); } if (s / n >= FINAL_PASS) toast(tx('اجتزت التقييم النهائي', 'You passed the final assessment')); },
    resultNote: () => tx('النتيجة للتعلّم الذاتي وتُحفظ على هذا الجهاز فقط. لعرض مزيج جديد من الأسئلة افتح التقييم النهائي من صفحة التقييمات مرة أخرى.', 'The result is for self-study and is saved on this device only. To get a new mix of questions, open the final assessment again from the Assessments page.') });
}
function viewPractical(main) {
  const paint = () => {
    const res = PRACTICAL.check(Lab.state); const all = res.every(Boolean);
    if (all) Store.setPractical();
    main.innerHTML = '<div class="page page-narrow"><div class="page-head"><div><div class="breadcrumbs"><a href="#/assess">' + tx('التقييمات', 'Assessments') + '</a><span aria-hidden="true">/</span><span>' + tx('التحدي العملي', 'Practical challenge') + '</span></div><h1 tabindex="-1">' + t(PRACTICAL.title) + '</h1><p>' + t(PRACTICAL.scenario) + '</p></div></div>' +
      '<div class="panel panel-pad" style="display:grid;gap:14px"><h2 style="font-size:1.05rem">' + tx('الخطوات', 'Steps') + ' <span class="num muted" style="font-weight:400">(' + res.filter(Boolean).length + '/' + res.length + ')</span></h2><ul class="goal-list">' +
      PRACTICAL.steps.map((s, i) => '<li class="' + (res[i] ? 'met' : '') + '"><span class="gtick">' + (res[i] ? icon('check') : '') + '</span><span>' + t(s) + '<span class="visually-hidden">' + (res[i] ? tx(' (مكتملة)', ' (done)') : tx(' (غير مكتملة)', ' (not done)')) + '</span></span></li>').join('') + '</ul>' +
      (all || Store.state.practical ? feedbackHTML('ok', tx('<strong>أكملت التحدي العملي.</strong> سجّلت الطلب وتابعته بكل البيانات اللازمة وأغلقت الإجراء المعتمد. هذا ما يحتاجه العمل اليومي فعلاً.', '<strong>You completed the practical challenge.</strong> You logged the request, followed it up with all the data it needs and closed the approved action. That is exactly what daily work requires.')) : feedbackHTML('info', tx('نفّذ الخطوات في مختبر التطبيق. هذه الصفحة تتحقق من أفعالك الفعلية وتتحدث تلقائياً.', 'Carry out the steps in the Practice Lab. This page checks what you actually do and updates automatically.'))) +
      '<div class="ex-actions"><a class="btn btn-primary" href="#/lab" data-go-lab>' + icon('flask') + tx('افتح المختبر على قائمة الطلبات', 'Open the lab on the requests List') + '</a><a class="btn btn-ghost" href="' + lessonLink('l3-2') + '">' + tx('راجع درس بيانات المهمة', 'Review the task details lesson') + '</a></div>' +
      '<p class="help-text">' + tx('تلميح: يمكنك تنفيذ كل الخطوات من لوحة تفاصيل المهمة (افتح المهمة بعد إنشائها). ولإغلاق مهمة التدقيق غيّر حالتها إلى COMPLETE في أي طريقة عرض.', 'Tip: you can complete every step from the task detail panel (open the task after creating it). To close the audit task, change its status to COMPLETE in any view.') + '</p></div></div>';
  };
  paint();
  const off = Lab.on(paint);
  main.addEventListener('click', e => { if (e.target.closest('[data-go-lab]')) { Lab.setUI({ list: 'requests', view: 'list', q: '', assignee: '', priority: '', status: '' }); } });
  return off;
}

/* ---------- Progress ---------- */
function viewProgress(main) {
  const paint = () => {
    const S = Store.state;
    const done = LESSONS.filter(l => Store.isDone(l.id)).length;
    const passed = MODULES.filter(m => S.quizzes[m.id] && S.quizzes[m.id].best / S.quizzes[m.id].total >= QUIZ_PASS).length;
    const ch = CHALLENGES.filter(c => S.challenges[c.id]).length;
    const next = nextLessonId();
    const allDone = done === LESSONS.length && S.final && S.final.best / S.final.total >= FINAL_PASS && S.practical;
    main.innerHTML = '<div class="page"><div class="page-head"><div><h1 tabindex="-1">' + tx('تقدّمي', 'My Progress') + enSub('My Progress') + '</h1><p>' + tx('ملخص ما أنجزته في الدروس والتقييمات والتحديات.', 'A summary of what you have completed in lessons, assessments and challenges.') + '</p></div>' +
      (next ? '<a class="btn btn-primary" href="' + lessonLink(next) + '">' + icon('play') + tx('تابع التعلّم: ', 'Continue: ') + t(LESSON[next].title) + '</a>' : '') + '</div>' +
      '<div class="storage-note' + (Store.ok ? '' : ' warn') + '">' + icon(Store.ok ? 'info' : 'alert') + '<p>' + (Store.ok ? tx('يُحفظ هذا التقدم في متصفحك على هذا الجهاز فقط. لا توجد حسابات ولا مزامنة بين الأجهزة ولا تقارير مركزية للموظفين. مسح بيانات المتصفح أو استخدام جهاز آخر يعني البدء من جديد.', 'This progress is saved in your browser on this device only. There are no accounts, no sync between devices and no central reporting on employees. Clearing browser data or using another device means starting again.') : tx('التخزين المحلي غير متاح في هذا المتصفح (مثل وضع التصفح الخاص أو إعدادات تمنعه). يعمل التقدم أثناء هذه الجلسة فقط ويضيع عند إغلاق الصفحة.', 'Local storage is not available in this browser (for example in private browsing, or when settings block it). Progress works for this session only and is lost when you close the page.')) + '</p></div>' +
      (allDone ? '<div class="panel panel-pad" style="display:flex;gap:14px;align-items:center;border-color:#b6dcc6;background:#f7fcf9">' + icon('check-circle', 'icon-lg') + '<div><h2 style="font-size:1.1rem">' + tx('أكملت المسار التعليمي كاملاً', 'You completed the full learning path') + '</h2><p class="small">' + tx('كل الدروس، والتقييم النهائي، والتحدي العملي. هذا سجل شخصي على جهازك، وليس شهادة رسمية أو اعتماداً من أي جهة.', 'Every lesson, the final assessment and the practical challenge. This is a personal record on your device, not an official certificate or accreditation from any body.') + '</p></div></div>' : '') +
      '<div class="panel prog-hero" data-rv>' + ring(Math.round(done / LESSONS.length * 100), { size: 132, stroke: 14, label: '<b class="num">' + countEl(Math.round(done / LESSONS.length * 100), '%') + '</b><small>' + tx('من الدروس', 'of lessons') + '</small>' }) +
      '<div><h2>' + (done ? tx('عمل رائع، استمر!', 'Great work, keep going!') : tx('ابدأ أول درس لتظهر إنجازاتك هنا', 'Start your first lesson to see your achievements here')) + '</h2><p class="small muted">' + tx('كل رقم هنا محسوب من نشاطك الفعلي على هذا الجهاز.', 'Every number here is calculated from your real activity on this device.') + '</p><div class="prog-minis">' +
      [[tourDone(), 12, tx('أجزاء مكتشفة في جولة ClickUp', 'ClickUp tour parts explored'), '#ff02f0'], [done, LESSONS.length, tx('دروس مكتملة', 'Lessons completed'), '#7b68ee'], [passed, 12, tx('اختبارات وحدات ناجحة', 'Module quizzes passed'), '#22c38e'], [S.final ? S.final.best : 0, S.final ? S.final.total : 18, tx('أفضل نتيجة في التقييم النهائي', 'Best final assessment score'), '#f5a524', !S.final], [ch, CHALLENGES.length, tx('تحديات المختبر', 'Lab challenges') + (S.practical ? tx('، والتحدي الشامل مكتمل', ', plus the end-to-end challenge') : ''), '#1fb6e0']]
        .map(x => '<div class="prog-mini">' + ring(Math.round(x[0] / x[1] * 100), { size: 44, stroke: 6, color: x[3] }) + '<span><b class="num">' + (x[4] ? '-' : x[0] + '/' + x[1]) + '</b>' + x[2] + '</span></div>').join('') + '</div></div></div>' +
      '<section class="section" aria-labelledby="bdT"><div class="section-head"><h2 id="bdT">' + tx('الإنجازات', 'Achievements') + '</h2><p class="num">' + tx(achievements().filter(x => x.got).length + ' من ' + achievements().length + ' مفتوحة', achievements().filter(x => x.got).length + ' of ' + achievements().length + ' unlocked') + '</p></div><ul class="badges" role="list">' +
      achievements().map(x => '<li class="badge-card' + (x.got ? '' : ' locked') + '" data-rv style="--bc:' + x.c + '"><span class="medal" aria-hidden="true">' + icon(x.got ? x.icon : 'lock') + '</span><h3>' + x.t + '</h3><p>' + x.d + '</p><span class="state">' + (x.got ? tx('مفتوح', 'Unlocked') : tx('مقفل', 'Locked')) + '</span></li>').join('') + '</ul></section>' +
      '<section class="section" aria-labelledby="pmT"><h2 id="pmT">' + tx('حسب الوحدة', 'By module') + '</h2><div class="panel bar-chart" data-rv role="list">' + MODULES.map((m, i) => { const p = moduleProgress(m.id); const q = S.quizzes[m.id];
        return '<a role="listitem" class="bar-row" style="' + modStyle(m.id) + '" href="' + lessonLink(m.lessons.find(id => !Store.isDone(id)) || m.lessons[0]) + '"><span class="space-avatar ' + stAvatar(p) + '">' + m.n + '</span><span class="bar-name">' + t(m.title) + '</span>' +
          '<span class="bar-track" aria-hidden="true"><i class="grow-bar" data-i="' + i + '" style="width:' + (p.done / p.total * 100) + '%"></i></span><span class="bar-val num">' + p.done + '/' + p.total + (q ? ' · ' + tx('اختبار ', 'quiz ') + q.best + '/' + q.total : '') + '</span></a>'; }).join('') + '</div></section>' +
      '<section class="section" aria-labelledby="bmT"><h2 id="bmT">' + tx('الدروس المحفوظة', 'Saved lessons') + '</h2>' + (S.bookmarks.length ? '<ul class="panel task-rows">' + S.bookmarks.filter(id => LESSON[id]).map(id => '<li class="task-row" style="grid-template-columns:26px minmax(0,1fr) auto 40px"><span aria-hidden="true">' + icon('bookmark') + '</span><div><a class="t-title" href="' + lessonLink(id) + '">' + t(LESSON[id].title) + '</a><span class="t-sub">' + moduleLabel(MODULE[LESSON[id].module].n) + '</span></div>' + badge(lessonStatusKey(id)) + '<button type="button" class="icon-btn bookmark-btn" aria-pressed="true" data-bm="' + id + '" aria-label="' + tx('إزالة من المحفوظات: ', 'Remove from saved: ') + esc(LESSON[id].title) + '">' + icon('bookmark') + '</button></li>').join('') + '</ul>' : '<div class="panel empty-state">' + icon('bookmark') + '<p>' + tx('لم تحفظ أي درس بعد. اضغط زر الحفظ في أي درس للرجوع إليه من هنا.', 'You have not saved any lessons yet. Press Save in any lesson to come back to it from here.') + '</p><a class="btn btn-secondary" href="#/library">' + tx('تصفح المكتبة', 'Browse the library') + '</a></div>') + '</section>' +
      '<section class="section" aria-labelledby="arT"><h2 id="arT">' + tx('نتائج التقييمات', 'Assessment results') + '</h2><div class="panel table-wrap"><table class="data-table"><caption class="visually-hidden">' + tx('نتائج التقييمات', 'Assessment results') + '</caption><thead><tr><th scope="col">' + tx('التقييم', 'Assessment') + '</th><th scope="col" class="num">' + tx('أفضل نتيجة', 'Best') + '</th><th scope="col" class="num">' + tx('آخر نتيجة', 'Last') + '</th><th scope="col" class="num">' + tx('المحاولات', 'Attempts') + '</th><th scope="col">' + tx('آخر محاولة', 'Last attempt') + '</th></tr></thead><tbody>' +
      [[tx('التقييم النهائي', 'Final assessment'), S.final]].concat(MODULES.map(m => [moduleLabel(m.n) + ': ' + m.title, S.quizzes[m.id]])).filter(r => r[1]).map(r => '<tr><td>' + t(r[0]) + '</td><td class="num">' + r[1].best + '/' + r[1].total + '</td><td class="num">' + r[1].last + '/' + r[1].total + '</td><td class="num">' + r[1].attempts + '</td><td>' + fmtStamp(r[1].at) + '</td></tr>').join('') +
      ((S.final || Object.keys(S.quizzes).length) ? '' : '<tr><td colspan="5" class="muted">' + tx('لم تُجرِ أي تقييم بعد.', 'You have not taken any assessment yet.') + ' <a href="#/assess">' + tx('ابدأ من صفحة التقييمات', 'Start from the Assessments page') + '</a>.</td></tr>') + '</tbody></table></div></section>' +
      '<div class="panel danger-zone"><div><h2 style="font-size:1rem">' + tx('إعادة ضبط التقدم', 'Reset progress') + '</h2><p class="small muted">' + tx('يحذف كل التقدم والنتائج والمحفوظات، ويعيد مختبر التطبيق إلى بياناته الأصلية على هذا الجهاز.', 'Deletes all progress, results and saved lessons, and returns the Practice Lab to its original data on this device.') + '</p></div><button type="button" class="btn btn-danger" data-reset>' + icon('trash', 'icon-sm') + tx('إعادة ضبط كل التقدم', 'Reset all progress') + '</button></div></div>';
  };
  paint();
  main.addEventListener('click', e => {
    const bm = e.target.closest('[data-bm]'); if (bm) { Store.toggleBookmark(bm.dataset.bm); paint(); Motion.settle(main); return; }
    if (e.target.closest('[data-reset]')) {
      confirmDialog(tx('إعادة ضبط كل التقدم؟', 'Reset all progress?'), tx('سيُحذف تقدّمك في كل الدروس ونتائج التقييمات والمحفوظات والتحديات، ويعود المختبر إلى بياناته الأصلية. لا يمكن التراجع عن ذلك. تبقى لغتك المختارة كما هي.', 'Your progress in every lesson, assessment results, saved lessons and challenges will be deleted, and the lab returns to its original data. This cannot be undone. Your language choice is kept.'), tx('نعم، أعد الضبط', 'Yes, reset')).then(ok => {
        if (!ok) return; Store.resetAll(); Lab.init(); UIState.clear(); toast(tx('أُعيد ضبط التقدم', 'Progress reset')); paint(); Motion.settle(main);
      });
    }
  });
}

/* ---------- Glossary & Help ---------- */
function viewHelp(main, params) {
  const tab = params[0] || 'glossary';
  const tabs = [['glossary', tx('المصطلحات', 'Glossary')], ['faq', tx('أسئلة شائعة', 'FAQ')], ['mistakes', tx('أخطاء شائعة', 'Common mistakes')], ['resources', tx('مصادر رسمية', 'Official resources')]];
  let body = '';
  if (tab === 'glossary') {
    const letters = Array.from(new Set(GLOSSARY.map(g => g.en[0].toUpperCase()))).sort();
    body = '<div class="panel filters-bar" role="search"><div class="field grow"><label for="glQ">' + tx('ابحث عن مصطلح بالعربية أو الإنجليزية', 'Search for a term in English or Arabic') + '</label><input class="input" id="glQ" type="search" placeholder="' + tx('مثل: Dependency أو المسؤول', 'For example: Dependency or Assignee') + '"></div>' +
      '<nav class="alpha-nav" aria-label="' + tx('انتقل حسب الحرف', 'Jump to letter') + '">' + letters.map(l => '<a href="#gl-' + l + '">' + l + '</a>').join('') + '</nav></div>' +
      '<p class="filter-summary" id="glCount" aria-live="polite"></p><ul class="panel gloss-list" data-gl></ul>';
  } else if (tab === 'faq') {
    const openSet = UIState.get('faq-open') || [0];
    body = '<div class="faq">' + FAQ.map((f, i) => '<details data-faq="' + i + '"' + (openSet.includes(i) ? ' open' : '') + '><summary>' + icon('help', 'icon-sm') + t(f.q) + '<span class="chev">' + icon('fwd', 'icon-sm') + '</span></summary><div class="faq-body"><p>' + t(f.a) + '</p></div></details>').join('') + '</div>';
  } else if (tab === 'mistakes') {
    body = '<div style="display:grid;gap:12px">' + COMMON_MISTAKES.map(m => '<div class="panel panel-pad" style="display:grid;gap:10px"><h2 style="font-size:1rem">' + t(m.title) + '</h2><div class="mistake"><div class="wrong"><h3>' + icon('x-circle', 'icon-sm') + tx('الخطأ', 'The mistake') + '</h3><p>' + t(m.wrong) + '</p></div><div class="right"><h3>' + icon('check-circle', 'icon-sm') + tx('الأفضل', 'Better') + '</h3><p>' + t(m.right) + '</p></div></div><a href="' + lessonLink(m.lesson) + '">' + icon('book', 'icon-sm') + tx(' الدرس المرتبط: ', ' Related lesson: ') + t(LESSON[m.lesson].title) + '</a></div>').join('') + '</div>';
  } else {
    body = '<div class="panel panel-pad" style="display:grid;gap:14px"><p>' + tx('المراجع الرسمية هي المصدر الأدق دائماً. كل درس يربطك بالمقال الرسمي الذي روجع مقابله.', 'Official references are always the most accurate source. Every lesson links to the official article it was checked against.') + '</p><ul class="res-list">' +
      RESOURCES.map(r => '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + icon('external', 'icon-sm') + '<span>' + t(r.title) + '</span>' + NEW_TAB() + '</a><p class="help-text">' + t(r.note) + '</p></li>').join('') + '</ul><p class="help-text">' + t(REVIEW.note) + '</p></div>';
  }
  main.innerHTML = '<div class="page page-narrow"><div class="page-head"><div><h1 tabindex="-1">' + tx('المصطلحات والمساعدة', 'Glossary & Help') + enSub('Glossary and Help') + '</h1><p>' + tx('مصطلحات ClickUp بالعربية، وإجابات الأسئلة المتكررة، والأخطاء الشائعة، والمصادر الرسمية.', 'ClickUp terms explained, answers to frequent questions, common mistakes and official resources.') + '</p></div></div>' +
    '<nav class="tabs" aria-label="' + tx('أقسام المساعدة', 'Help sections') + '">' + tabs.map(tb => '<a href="#/help/' + tb[0] + '"' + (tb[0] === tab ? ' aria-current="page"' : '') + '>' + tb[1] + '</a>').join('') + '</nav>' + body + '</div>';
  if (tab === 'faq') main.addEventListener('toggle', () => UIState.set('faq-open', $$('[data-faq]', main).filter(d => d.open).map(d => +d.dataset.faq)), true);
  if (tab === 'glossary') {
    const paint = q => {
      q = (q || '').trim().toLowerCase();
      const res = GLOSSARY.slice().sort((a, b) => a.en.localeCompare(b.en)).filter(g => !q || g.en.toLowerCase().includes(q) || g.ar.includes(q) || g.def.toLowerCase().includes(q));
      $('#glCount').textContent = tx(res.length + ' مصطلح', nEn(res.length, 'term'));
      const seen = {};
      $('[data-gl]', main).innerHTML = res.length ? res.map(g => { const L0 = g.en[0].toUpperCase(); const anchor = !seen[L0] ? (seen[L0] = 1, ' id="gl-' + L0 + '"') : '';
        return '<li class="gloss-item"' + anchor + ' data-term="' + esc(g.en) + '"><h3><span class="en" lang="en">' + esc(g.en) + '</span>' +
          (isEN() ? '<span class="ar"><span class="visually-hidden">In Arabic: </span><span lang="ar" dir="rtl">' + esc(g.ar) + '</span></span>' : '<span class="ar">' + esc(g.ar) + '</span>') + '</h3><p>' + t(g.def) + '</p><p class="ex">' + tx('مثال: ', 'Example: ') + t(g.ex) + '</p>' + (g.lesson && LESSON[g.lesson] ? '<a class="small" href="' + lessonLink(g.lesson) + '">' + icon('book', 'icon-sm') + tx(' تعلّمه في: ', ' Learn it in: ') + t(LESSON[g.lesson].title) + '</a>' : '') + '</li>'; }).join('')
        : '<li class="empty-state">' + icon('search') + '<p>' + tx('لا يوجد مصطلح مطابق. جرّب كلمة أخرى.', 'No matching term. Try another word.') + '</p></li>';
    };
    paint('');
    $('#glQ', main).addEventListener('input', debounce(e => paint(e.target.value), 120));
    const focusTerm = sessionStorageGet('focusTerm');
    if (focusTerm) { const el = main.querySelector('[data-term="' + CSS.escape(focusTerm) + '"]'); if (el) { el.classList.add('flash'); el.scrollIntoView({ block: 'center' }); } }
  }
}
function sessionStorageGet(k) { try { const v = window.sessionStorage.getItem(k); window.sessionStorage.removeItem(k); return v; } catch (e) { return null; } }

/* ---------- About ---------- */
function viewAbout(main) {
  main.innerHTML = '<div class="page page-narrow"><div class="page-head"><div><h1 tabindex="-1">' + tx('حول المنصة', 'About the platform') + enSub('About') + '</h1><p><bdi dir="ltr">Omantel | ClickUp Learning Hub</bdi>: <bdi dir="ltr">Learn. Practice. Achieve.</bdi></p></div></div>' +
    '<section class="panel panel-pad prose" style="max-width:none"><h2>' + tx('ما هذه المنصة؟', 'What is this platform?') + '</h2><p>' + t(tx('منصة تعليمية تفاعلية تساعد موظفي Omantel على استخدام ClickUp بثقة، من الأساسيات إلى سير العمل المتقدم. تعتمد على منهج شاهد، ثم افهم، ثم تدرّب، ثم تحقّق، مع مساحة تدريب ببيانات وهمية.', 'An interactive learning platform that helps Omantel employees use ClickUp with confidence, from the basics to advanced workflows. It follows a Watch, Understand, Practice, Check approach, with a practice space that uses fictional data.')) + '</p>' +
    '<p>' + tx('المنصة متاحة بالكامل بالعربية والإنجليزية. يمكنك التبديل بين اللغتين في أي وقت من أعلى الصفحة دون أن تفقد تقدّمك أو إجاباتك.', 'The platform is fully available in Arabic and English. You can switch languages at any time from the top of the page without losing your progress or your answers.') + '</p>' +
    '<h2>' + tx('ما الذي يجب أن تعرفه', 'What you should know') + '</h2><ul>' +
    '<li><strong>' + tx('محاكاة تعليمية:', 'Educational simulation:') + '</strong> ' + t(tx('الشاشات والعروض المتحركة ومختبر التطبيق إعادة بناء مبسّطة لأغراض التعلّم، وليست تسجيلات من ClickUp ولا تتصل به.', 'The screens, animated walkthroughs and Practice Lab are simplified reconstructions for learning. They are not recordings of ClickUp and do not connect to it.')) + '</li>' +
    '<li><strong>' + tx('ليست جهة معتمدة:', 'Not an accrediting body:') + '</strong> ' + t(tx('المنصة مستقلة، وغير معتمدة أو مدعومة رسمياً من ClickUp، ولا تمنح شهادة رسمية أو اعتماداً.', 'The platform is independent, is not officially certified or endorsed by ClickUp, and does not award an official certificate or accreditation.')) + '</li>' +
    '<li><strong>' + tx('بيانات وهمية:', 'Fictional data:') + '</strong> ' + t(tx('كل الأسماء والمهام والأرقام في الأمثلة خيالية، ولا تمثل سياسات Omantel أو إجراءاتها أو بيانات موظفيها.', 'All names, tasks and numbers in the examples are fictional. They do not represent Omantel policies, procedures or employee data.')) + '</li>' +
    '<li><strong>' + tx('التقدّم محلي:', 'Progress is local:') + '</strong> ' + tx('يُحفظ في متصفحك على هذا الجهاز فقط، دون حسابات أو مزامنة أو تقارير مركزية.', 'It is saved in your browser on this device only, with no accounts, sync or central reporting.') + '</li>' +
    '<li><strong>' + tx('دقة المحتوى:', 'Content accuracy:') + '</strong> ' + t(REVIEW.note) + tx(' نقاط لم يمكن التحقق منها بالكامل معلّمة داخل الدروس بتنبيه «تنبيه دقة».', ' Points that could not be fully verified are marked inside the lessons with an “Accuracy note”.') + '</li>' +
    '<li><strong>' + tx('الشعارات:', 'Logos:') + '</strong> ' + tx('يظهر شعارا Omantel وClickUp الأصليان كما هما، دون إعادة رسم أو تغيير ألوان، في النسختين العربية والإنجليزية.', 'The original Omantel and ClickUp logos appear unchanged, never redrawn or recoloured, in both the Arabic and English versions.') + '</li></ul>' +
    '<h2>' + tx('المهارات المستخدمة في التصميم', 'Design skills used') + '</h2><p>' + t(tx('صُممت الواجهة بالاستعانة بثلاث مهارات تصميم: Impeccable للبنية والطباعة والمسافات وإمكانية الوصول، وEmil Design Engineering للحركة والتفاعل، وTaste لاتجاه الواجهات التعريفية.', 'The interface was designed with three design skills: Impeccable for structure, typography, spacing and accessibility; Emil Design Engineering for motion and interaction; and Taste for the direction of introductory screens.')) + '</p></section>' +
    '<section class="panel panel-pad" style="display:grid;gap:6px"><h2 style="font-size:1rem">' + tx('التصميم', 'Design') + '</h2><p class="about-credit" lang="en" dir="ltr">' + CREDIT + '</p></section></div>';
}

function viewNotFound(main) {
  main.innerHTML = '<div class="page page-narrow"><div class="panel empty-state">' + icon('compass') + '<h1 tabindex="-1" style="font-size:1.3rem">' + tx('الصفحة غير موجودة', 'Page not found') + '</h1><p>' + tx('ربما تغيّر الرابط. ابدأ من الرئيسية أو المكتبة.', 'The link may have changed. Start from Home or the library.') + '</p><div class="hero-actions" style="margin-top:0"><a class="btn btn-primary" href="#/home">' + tx('الرئيسية', 'Home') + '</a><a class="btn btn-secondary" href="#/library">' + tx('مكتبة الدروس', 'Learning Library') + '</a></div></div></div>';
}
