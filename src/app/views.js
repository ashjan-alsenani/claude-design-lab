/* ==========================================================================
   Page views. Each view renders into <main> and returns an optional cleanup.
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
function levelChip(lv) { return '<span class="chip chip-level-' + lv + '">' + LEVELS[lv].ar + '</span>'; }
function timeChip(min) { return '<span class="chip" title="تقدير تقريبي">' + icon('clock', 'icon-sm') + '≈ ' + min + ' دقائق (تقدير)</span>'; }
function lessonLink(id) { return '#/lesson/' + id; }

/* ---------- Sidebar & top progress ---------- */
function renderSidebar(route) {
  const nav = $('#sidebar'); const cur = route.name;
  const last = Store.state.last && LESSON[Store.state.last.lesson] ? Store.state.last.lesson : null;
  const item = (href, ic, label, active, extra) => '<li><a class="nav-link" href="' + href + '"' + (active ? ' aria-current="page"' : '') + '>' + icon(ic) + '<span>' + label + '</span>' + (extra || '') + '</a></li>';
  const done = LESSONS.filter(l => Store.isDone(l.id)).length;
  nav.innerHTML =
    '<div><p class="nav-group-title">المنصة</p><ul class="nav-list">' +
    item('#/home', 'home', 'الرئيسية', cur === 'home') +
    item('#/library', 'book', 'مكتبة الدروس', cur === 'library', '<span class="count num">' + LESSONS.length + '</span>') +
    (last ? item(lessonLink(last), 'play', 'متابعة الدرس', cur === 'lesson') : '') +
    item('#/lab', 'flask', 'مختبر التطبيق', cur === 'lab') +
    item('#/studio', 'chart', 'استوديو لوحات المعلومات', cur === 'studio') +
    item('#/assess', 'assess', 'التقييمات', cur === 'assess') +
    item('#/progress', 'progress', 'تقدّمي', cur === 'progress', '<span class="count num">' + done + '/' + LESSONS.length + '</span>') +
    item('#/help', 'help', 'المصطلحات والمساعدة', cur === 'help') +
    item('#/about', 'info', 'حول المنصة', cur === 'about') +
    '</ul></div>' +
    '<div><p class="nav-group-title">الوحدات</p><ul class="nav-list">' + MODULES.map(m => {
      const p = moduleProgress(m.id); const st = p.done === p.total ? 'done' : p.started ? 'started' : '';
      const target = m.lessons.find(id => !Store.isDone(id)) || m.lessons[0];
      const active = cur === 'lesson' && route.params[0] && LESSON[route.params[0]] && LESSON[route.params[0]].module === m.id;
      return '<li><a class="nav-link" href="' + lessonLink(target) + '"' + (active ? ' aria-current="page"' : '') + '><span class="space-avatar ' + st + '">' + m.n + '</span><span>' + t(m.title) + '</span>' +
        (p.done === p.total ? '<span class="mini-check" aria-label="مكتملة">' + icon('check', 'icon-sm') + '</span>' : '<span class="count num">' + p.done + '/' + p.total + '</span>') + '</a></li>';
    }).join('') + '</ul></div>' +
    '<div class="sidebar-foot"><p>' + (Store.ok ? 'يُحفظ تقدّمك على هذا المتصفح وهذا الجهاز فقط.' : 'التخزين المحلي غير متاح: التقدّم لهذه الجلسة فقط.') + '</p><p class="credit" lang="en">' + CREDIT + '</p></div>';
}
function renderTopProgress() {
  const done = LESSONS.filter(l => Store.isDone(l.id)).length;
  $('#topProgress').innerHTML = '<span class="num tp-long">' + done + ' من ' + LESSONS.length + ' درساً</span><span class="num tp-short">' + done + '/' + LESSONS.length + '</span><span class="meter" aria-hidden="true"><i style="width:' + (done / LESSONS.length * 100) + '%"></i></span>';
  $('#topProgress').setAttribute('aria-label', 'تقدّمي: ' + done + ' من ' + LESSONS.length + ' درساً مكتملاً');
}

/* ---------- Home ---------- */
function viewHome(main) {
  const next = nextLessonId();
  const last = Store.state.last && LESSON[Store.state.last.lesson] ? LESSON[Store.state.last.lesson] : null;
  const anyProgress = LESSONS.some(l => lessonStatusKey(l.id) !== 'todo');
  const previews = ['l3-2', 'l4-2', 'l9-1', 'l11-2'].map(id => LESSON[id]);
  main.innerHTML = '<div class="page">' +
    '<section class="home-hero" aria-labelledby="homeTitle"><div>' +
    '<h1 id="homeTitle">تعلّم ClickUp بالممارسة، خطوة بخطوة</h1>' +
    '<p class="lead">من أول مهمة إلى سير عمل متكامل: دروس قصيرة بالعربية، وعروض متحركة، ومساحة تدريب تشبه ClickUp، لتنجز عملك اليومي بثقة.</p>' +
    '<div class="hero-actions"><a class="btn btn-primary btn-lg" href="' + lessonLink(anyProgress && next ? next : 'l1-1') + '">' + icon('play') + (anyProgress ? 'تابع التعلّم' : 'ابدأ التعلّم') + '</a>' +
    '<a class="btn btn-secondary btn-lg" href="#/lab">' + icon('flask') + 'جرّب مختبر التطبيق</a></div>' +
    (last && !Store.isDone(last.id) ? '<a class="resume-card" href="' + lessonLink(last.id) + '">' + icon('replay') + '<span><small>آخر درس فتحته</small>' + t(last.title) + '</span><span style="margin-inline-start:auto">' + icon('chev-left') + '</span></a>' : '') +
    '</div><div data-home-demo></div></section>' +

    '<section class="section" aria-labelledby="loopT"><div class="section-head"><h2 id="loopT">كل درس يسير في أربع خطوات</h2></div>' +
    '<div class="loop-grid">' + [
      ['WATCH', 'play', 'شاهد', 'عرض متحرك يُظهر المؤشر والنقر وتغيّر الحالة، مع شرح عربي لكل خطوة، وتحكم كامل في التشغيل.'],
      ['UNDERSTAND', 'bulb', 'افهم', 'شرح مختصر أولاً، وتفاصيل أعمق عند الطلب، وخطأ شائع مع طريقة تجنّبه.'],
      ['PRACTICE', 'flask', 'تدرّب', 'نشاط تفاعلي يتحقق من إجابتك الفعلية، ثم مختبر يشبه مساحة عمل حقيقية.'],
      ['CHECK', 'assess', 'تحقّق', 'أسئلة قصيرة بشرح لكل إجابة، واختبارات للوحدات، وتحدٍّ عملي شامل.']
    ].map(s => '<div class="loop-step"><span class="loop-en">' + s[0] + '</span><h3>' + icon(s[1]) + s[2] + '</h3><p>' + s[3] + '</p></div>').join('') + '</div></section>' +

    '<section class="section" aria-labelledby="pathT"><div class="section-head"><h2 id="pathT">مسارات التعلّم</h2><p>اختر المسار الأقرب لعملك، أو اتبع الوحدات بالترتيب.</p></div><div class="path-grid">' +
    PATHWAYS.map(p => {
      const ls = p.modules.flatMap(m => MODULE[m].lessons); const done = ls.filter(id => Store.isDone(id)).length;
      return '<div class="panel path-card"><h3>' + icon(p.icon) + p.title + '</h3><p class="small muted">' + p.who + '</p><p class="small">' + t(p.goal) + '</p>' +
        '<ol>' + p.modules.map(m => '<li><a href="' + lessonLink(MODULE[m].lessons[0]) + '"><span class="space-avatar ' + (moduleProgress(m).done === moduleProgress(m).total ? 'done' : moduleProgress(m).started ? 'started' : '') + '">' + MODULE[m].n + '</span>' + t(MODULE[m].title) + '</a></li>').join('') + '</ol>' +
        '<p class="small muted num">' + done + ' من ' + ls.length + ' دروس مكتملة</p></div>';
    }).join('') + '</div></section>' +

    '<section class="section" aria-labelledby="mapT"><div class="section-head"><h2 id="mapT">خريطة المنهج</h2><p>12 وحدة من المستوى المبتدئ إلى المتقدم.</p></div>' +
    '<div class="panel curriculum-map"><div class="cmap">' + ['beginner', 'intermediate', 'advanced'].map(lv =>
      '<div class="cmap-row-label">' + LEVELS[lv].ar + ' <bdi dir="ltr">' + LEVELS[lv].en + '</bdi></div>' +
      MODULES.filter(m => m.level === lv).map(m => { const p = moduleProgress(m.id); return '<a class="cmap-node" href="' + lessonLink(m.lessons.find(id => !Store.isDone(id)) || m.lessons[0]) + '"><span class="cmap-top"><span class="space-avatar ' + (p.done === p.total ? 'done' : p.started ? 'started' : '') + '">' + m.n + '</span><small class="num">' + p.done + '/' + p.total + '</small></span><strong>' + t(m.title) + '</strong><small dir="ltr" style="text-align:end">' + m.en + '</small><span class="bar" aria-hidden="true"><i style="width:' + (p.done / p.total * 100) + '%"></i></span></a>'; }).join('')).join('') +
    '</div></div></section>' +

    '<section class="section" aria-labelledby="prevT"><div class="section-head"><h2 id="prevT">من داخل الدروس</h2><a class="btn btn-ghost" href="#/library">كل الدروس ' + icon('chev-left', 'icon-sm') + '</a></div><div class="preview-list">' +
    previews.map(l => '<a class="panel lesson-preview" href="' + lessonLink(l.id) + '"><span class="meta"><span class="space-avatar">' + MODULE[l.module].n + '</span>' + levelChip(l.level) + timeChip(l.minutes) + '</span><h3>' + t(l.title) + '</h3><p class="obj">' + t(l.objective) + '</p><p class="scenario-quote">' + icon('users', 'icon-sm') + ' ' + t(l.scenario) + '</p></a>').join('') +
    '</div></section>' +
    '<p class="help-text">الواجهات داخل المنصة محاكاة تعليمية مبسّطة، وليست تسجيلات من ClickUp. المنصة مستقلة وغير معتمدة أو مدعومة من ClickUp. <a href="#/about">اعرف المزيد</a></p>' +
    '</div>';
  const demoEl = $('[data-home-demo]', main);
  const player = new DemoPlayer(demoEl, HOME_DEMO, { autoplay: true });
  return () => player.destroy();
}

/* ---------- Library ---------- */
const LibState = { q: '', module: '', level: '', status: '', bookmarks: false };
function viewLibrary(main) {
  main.innerHTML = '<div class="page">' +
    '<div class="page-head"><div><h1>مكتبة الدروس <bdi class="en" dir="ltr" style="font-weight:400;color:var(--ink-3);font-size:1rem">Learning Library</bdi></h1><p>' + LESSONS.length + ' درساً في 12 وحدة. الأوقات المعروضة تقديرية.</p></div></div>' +
    '<div class="panel filters-bar" role="search"><div class="field grow"><label for="libQ">بحث</label><input class="input" id="libQ" type="search" placeholder="ابحث في العناوين والأهداف" value="' + esc(LibState.q) + '"></div>' +
    '<div class="field"><label for="libM">الوحدة (الموضوع)</label><select class="select" id="libM"><option value="">كل الوحدات</option>' + MODULES.map(m => '<option value="' + m.id + '"' + (LibState.module === m.id ? ' selected' : '') + '>' + m.n + '. ' + esc(m.title) + '</option>').join('') + '</select></div>' +
    '<div class="field"><span class="field-label" id="libLvL">المستوى</span><div class="seg" role="group" aria-labelledby="libLvL">' + [['', 'الكل'], ['beginner', 'مبتدئ'], ['intermediate', 'متوسط'], ['advanced', 'متقدم']].map(l => '<button type="button" data-lv="' + l[0] + '" aria-pressed="' + (LibState.level === l[0]) + '">' + l[1] + '</button>').join('') + '</div></div>' +
    '<div class="field"><label for="libS">حالة الإكمال</label><select class="select" id="libS"><option value="">الكل</option><option value="todo"' + (LibState.status === 'todo' ? ' selected' : '') + '>لم يبدأ</option><option value="progress"' + (LibState.status === 'progress' ? ' selected' : '') + '>قيد التعلم</option><option value="done"' + (LibState.status === 'done' ? ' selected' : '') + '>مكتمل</option></select></div>' +
    '<label class="check" style="margin-bottom:9px"><input type="checkbox" id="libB"' + (LibState.bookmarks ? ' checked' : '') + '> المحفوظة فقط</label></div>' +
    '<p class="filter-summary" id="libCount" aria-live="polite"></p><div data-results style="display:grid;gap:16px"></div></div>';
  const paint = () => {
    const q = LibState.q.trim();
    const res = LESSONS.filter(l => (!LibState.module || l.module === LibState.module) && (!LibState.level || l.level === LibState.level) &&
      (!LibState.status || lessonStatusKey(l.id) === LibState.status) && (!LibState.bookmarks || Store.isBookmarked(l.id)) &&
      (!q || l.title.includes(q) || l.objective.includes(q) || MODULE[l.module].title.includes(q) || MODULE[l.module].en.toLowerCase().includes(q.toLowerCase()) || l.title.toLowerCase().includes(q.toLowerCase())));
    $('#libCount').textContent = res.length + ' من ' + LESSONS.length + ' دروس ظاهرة';
    const box = $('[data-results]', main);
    if (!res.length) { box.innerHTML = '<div class="panel empty-state">' + icon('search') + '<h2 style="font-size:1.05rem">لا توجد دروس تطابق هذه المرشّحات</h2><p>جرّب كلمة أخرى أو امسح المرشّحات.</p><button type="button" class="btn btn-secondary" data-clear>مسح المرشّحات</button></div>'; return; }
    box.innerHTML = MODULES.filter(m => res.some(l => l.module === m.id)).map(m => {
      const p = moduleProgress(m.id);
      return '<section class="panel module-group" aria-labelledby="mg-' + m.id + '"><header><span class="space-avatar ' + (p.done === p.total ? 'done' : p.started ? 'started' : '') + '">' + m.n + '</span><h2 id="mg-' + m.id + '">' + t(m.title) + '</h2><bdi class="en muted small" dir="ltr">' + m.en + '</bdi><span class="muted num">' + p.done + '/' + p.total + ' مكتمل</span></header><ul class="task-rows">' +
        res.filter(l => l.module === m.id).map(l => {
          const st = lessonStatusKey(l.id); const bm = Store.isBookmarked(l.id);
          return '<li class="task-row"><span aria-hidden="true">' + (st === 'done' ? '<span style="color:var(--st-done)">' + icon('check-circle') + '</span>' : st === 'progress' ? '<span style="color:var(--st-progress)">' + icon('play') + '</span>' : '<span style="color:var(--ink-4)">' + icon('book') + '</span>') + '</span>' +
            '<div><a class="t-title" href="' + lessonLink(l.id) + '">' + t(l.title) + '</a><span class="t-sub">' + t(l.objective) + '</span></div>' +
            '<span class="hide-sm">' + levelChip(l.level) + '</span><span class="t-time hide-sm num" title="تقدير">≈ ' + l.minutes + ' د</span>' +
            '<span>' + badge(st) + '<span class="visually-hidden">' + (st === 'done' ? 'مكتمل' : st === 'progress' ? 'قيد التعلم' : 'لم يبدأ') + '</span></span>' +
            '<button type="button" class="icon-btn bookmark-btn" data-bm="' + l.id + '" aria-pressed="' + bm + '" aria-label="' + (bm ? 'إزالة من المحفوظات: ' : 'حفظ الدرس: ') + esc(l.title) + '">' + icon('bookmark') + '</button></li>';
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
    const bm = e.target.closest('[data-bm]'); if (bm) { const on = Store.toggleBookmark(bm.dataset.bm); toast(on ? 'حُفظ الدرس في المحفوظات' : 'أُزيل الدرس من المحفوظات'); paint(); const again = main.querySelector('[data-bm="' + bm.dataset.bm + '"]'); if (again) again.focus(); return; }
    if (e.target.closest('[data-clear]')) { Object.assign(LibState, { q: '', module: '', level: '', status: '', bookmarks: false }); rerender(); }
  });
}

/* ---------- Lesson player ---------- */
function viewLesson(main, params) {
  const L = LESSON[params[0]];
  if (!L) return viewNotFound(main);
  const M = MODULE[L.module];
  Store.visit(L.id);
  const idx = LESSONS.indexOf(L); const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
  const noteHTML = n => {
    const map = { plan: ['callout-plan', 'alert', 'يعتمد على الخطة أو الإعدادات'], admin: ['callout-admin', 'lock', 'إجراء إداري'], uncertain: ['callout-uncertain', 'info', 'تنبيه دقة'], sim: ['callout-uncertain', 'eye', 'إرشاد عام ومحاكاة'] }[n.kind];
    return '<div class="callout ' + map[0] + '">' + icon(map[1]) + '<div><h3>' + map[2] + '</h3><p class="small">' + t(n.text) + '</p></div></div>';
  };
  const kinds = new Set((L.notes || []).map(n => n.kind));
  main.innerHTML = '<div class="lesson-layout">' +
    '<nav class="panel lesson-nav collapsible" aria-label="دروس الوحدة"><h2><span class="space-avatar started">' + M.n + '</span>' + t(M.title) + '</h2>' +
    '<button type="button" class="btn btn-ghost btn-sm" data-toggle-nav style="width:100%;justify-content:space-between" aria-expanded="false">دروس هذه الوحدة (' + M.lessons.length + ')' + icon('chev-down', 'icon-sm') + '</button>' +
    '<ol>' + M.lessons.map(id => '<li><a href="' + lessonLink(id) + '"' + (id === L.id ? ' aria-current="page"' : '') + '><span class="ln-state' + (Store.isDone(id) ? ' done' : '') + '">' + (Store.isDone(id) ? icon('check') : '') + '</span><span>' + t(LESSON[id].title) + '</span></a></li>').join('') + '</ol>' +
    '<div class="other-modules"><a class="btn btn-ghost btn-sm" href="#/library">' + icon('book', 'icon-sm') + 'كل الوحدات والدروس</a></div></nav>' +
    '<article class="lesson-main" aria-labelledby="lessonTitle">' +
    '<header class="lesson-head"><div class="breadcrumbs"><a href="#/library">مكتبة الدروس</a><span aria-hidden="true">/</span><span>الوحدة ' + M.n + ': ' + t(M.title) + '</span></div>' +
    '<div class="meta">' + levelChip(L.level) + timeChip(L.minutes) + '<span class="chip">' + icon('check-circle', 'icon-sm') + 'روجع في ' + fmtDate(REVIEW_DATE, true) + '</span>' +
    (kinds.has('plan') ? '<span class="chip chip-plan">يعتمد على الخطة أو الإعدادات</span>' : '') + (kinds.has('admin') ? '<span class="chip chip-admin">يتضمن إجراءً إدارياً</span>' : '') +
    '<button type="button" class="btn btn-ghost btn-sm bookmark-btn" data-bm="' + L.id + '" aria-pressed="' + Store.isBookmarked(L.id) + '">' + icon('bookmark', 'icon-sm') + '<span>' + (Store.isBookmarked(L.id) ? 'محفوظ' : 'حفظ') + '</span></button></div>' +
    '<h1 id="lessonTitle" tabindex="-1">' + t(L.title) + '</h1></header>' +
    '<nav class="stage-rail" aria-label="مراحل الدرس" data-rail></nav>' +
    '<div class="panel lesson-intro"><div><h2>' + icon('target', 'icon-sm') + 'هدف التعلّم</h2><p>' + t(L.objective) + '</p></div><div><h2>' + icon('users', 'icon-sm') + 'موقف من العمل</h2><p>' + t(L.scenario) + '</p></div></div>' +

    '<section class="lesson-stage" id="watch" aria-labelledby="stWatch"><div class="stage-title"><span class="stage-num">' + icon('play', 'icon-sm') + '</span><h2 id="stWatch">شاهد</h2><span class="en">WATCH</span></div>' +
    '<p class="help-text">عرض متحرك صامت بلا صوت. استخدم الإيقاف المؤقت والخطوات والسرعة كما يناسبك. الشاشة محاكاة تعليمية مبسّطة، وليست تسجيلاً من ClickUp.</p><div data-demo></div></section>' +

    '<section class="lesson-stage" id="understand" aria-labelledby="stUnd"><div class="stage-title"><span class="stage-num">' + icon('bulb', 'icon-sm') + '</span><h2 id="stUnd">افهم</h2><span class="en">UNDERSTAND</span></div>' +
    '<div class="panel explain"><div class="prose">' + L.explain.map(p => '<p>' + bidi(p) + '</p>').join('') + '</div>' +
    (L.hier ? '<div data-hier></div>' : '') +
    (L.deeper ? '<details class="deeper"><summary>' + icon('plus', 'icon-sm') + t(L.deeper.title) + '<span class="chev" style="margin-inline-start:auto">' + icon('chev-left', 'icon-sm') + '</span></summary><div class="deeper-body prose">' + L.deeper.body.map(p => '<p>' + bidi(p) + '</p>').join('') + '</div></details>' : '') +
    ((L.notes || []).length ? '<div style="display:grid;gap:10px">' + L.notes.map(noteHTML).join('') + '</div>' : '') + '</div>' +
    '<div class="mistake" role="group" aria-label="خطأ شائع"><div class="wrong"><h3>' + icon('x-circle', 'icon-sm') + 'خطأ شائع</h3><p>' + t(L.mistake.wrong) + '</p></div><div class="right"><h3>' + icon('check-circle', 'icon-sm') + 'كيف تتجنبه</h3><p>' + t(L.mistake.right) + '</p></div></div></section>' +

    '<section class="lesson-stage" id="practice" aria-labelledby="stPr"><div class="stage-title"><span class="stage-num">' + icon('flask', 'icon-sm') + '</span><h2 id="stPr">تدرّب</h2><span class="en">PRACTICE</span></div><div class="panel" data-ex></div>' +
    '<p class="help-text">تريد تدريباً أوسع؟ <a href="#/lab">افتح مختبر التطبيق</a> وجرّب التحديات الموجهة على مساحة عمل كاملة.</p></section>' +

    '<section class="lesson-stage" id="check" aria-labelledby="stCk"><div class="stage-title"><span class="stage-num">' + icon('assess', 'icon-sm') + '</span><h2 id="stCk">تحقّق</h2><span class="en">CHECK</span></div><div data-quiz></div></section>' +

    '<section class="panel panel-pad" aria-labelledby="sumT" style="display:grid;gap:14px"><h2 id="sumT" style="font-size:1.1rem">الخلاصة</h2><ul class="summary-list">' + L.summary.map(s => '<li>' + icon('check') + '<span>' + t(s) + '</span></li>').join('') + '</ul>' +
    '<div class="ref-row"><strong>المرجع الرسمي:</strong>' + L.refs.map(r => '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + icon('external', 'icon-sm') + '<bdi dir="ltr">' + esc(r.label) + '</bdi><span class="visually-hidden"> (يفتح في نافذة جديدة)</span></a>').join('') + '</div>' +
    '<p class="help-text">' + t(REVIEW_NOTE) + '</p></section>' +

    '<div class="panel complete-bar" data-complete></div>' +
    '<nav class="lesson-footer-nav" aria-label="التنقل بين الدروس">' +
    (prev ? '<a class="btn btn-secondary" href="' + lessonLink(prev.id) + '">' + icon('chev-right', 'icon-sm') + '<span>السابق: ' + t(prev.title) + '</span></a>' : '<span></span>') +
    (next ? '<a class="btn btn-secondary" href="' + lessonLink(next.id) + '"><span>التالي: ' + t(next.title) + '</span>' + icon('chev-left', 'icon-sm') + '</a>' : '<a class="btn btn-primary" href="#/assess">إلى التقييمات ' + icon('chev-left', 'icon-sm') + '</a>') +
    '</nav></article></div>';

  const player = new DemoPlayer($('[data-demo]', main), L.demo, { onWatched: () => { Store.mark(L.id, 'watched', true); toast('اكتملت مرحلة «شاهد»'); } });
  if (L.hier) renderHierExplorer($('[data-hier]', main));
  renderExercise($('[data-ex]', main), L.exercise, L.id, () => { if (!Store.lessonState(L.id).practiced) { Store.mark(L.id, 'practiced', true); toast('اكتملت مرحلة «تدرّب»'); } });
  renderQuiz($('[data-quiz]', main), L.check, 'chk-' + L.id, { onSubmit: (s, n) => { Store.mark(L.id, 'checked', { score: s, total: n }); }, resultNote: 'يمكنك إعادة المحاولة. لإكمال الدرس يكفي أن تجيب عن الأسئلة، ونتيجتك تساعدك على معرفة ما تراجعه.' });

  const paintRail = () => {
    const s = Store.lessonState(L.id);
    const stages = [['watch', 'شاهد', 'WATCH', s.watched], ['understand', 'افهم', 'UNDERSTAND', s.watched || s.practiced || !!s.checked], ['practice', 'تدرّب', 'PRACTICE', s.practiced], ['check', 'تحقّق', 'CHECK', !!s.checked]];
    $('[data-rail]', main).innerHTML = stages.map(st => '<a href="#' + st[0] + '" data-stage="' + st[0] + '" class="' + (st[3] ? 'done' : '') + '"><span class="sr-tick" aria-hidden="true">' + (st[3] ? icon('check') : '') + '</span><span>' + st[1] + '</span><span class="sr-en">' + st[2] + '</span><span class="visually-hidden">' + (st[3] ? ' (مكتملة)' : '') + '</span></a>').join('');
    const cb = $('[data-complete]', main);
    if (s.done) cb.innerHTML = '<div style="display:flex;gap:10px;align-items:center"><span style="color:var(--ok)">' + icon('check-circle', 'icon-lg') + '</span><div><strong>أكملت هذا الدرس</strong><p class="help-text">في ' + fmtStamp(s.done) + '</p></div></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-ghost btn-sm" data-undone>إلغاء تحديده كمكتمل</button>' + (next ? '<a class="btn btn-primary" href="' + lessonLink(next.id) + '">الدرس التالي ' + icon('chev-left', 'icon-sm') + '</a>' : '<a class="btn btn-primary" href="#/assess">إلى التقييمات</a>') + '</div>';
    else {
      const ready = !!s.checked;
      const missing = []; if (!s.watched) missing.push('شاهد'); if (!s.practiced) missing.push('تدرّب'); if (!s.checked) missing.push('تحقّق');
      cb.innerHTML = '<div><strong>' + (ready ? 'جاهز لإكمال الدرس' : 'أجب عن أسئلة «تحقّق» لإكمال الدرس') + '</strong><p class="help-text">' + (missing.length ? 'مراحل لم تكتمل بعد: ' + missing.join('، ') + '.' : 'أنهيت كل المراحل.') + '</p></div>' +
        '<button type="button" class="btn btn-primary" data-done' + (ready ? '' : ' disabled aria-disabled="true"') + '>' + icon('check') + 'تحديد الدرس كمكتمل</button>';
    }
  };
  paintRail();
  const off = Store.on(kind => { if (kind === 'lesson' || kind === 'bookmark') paintRail(); });

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { $$('[data-stage]', main).forEach(a => a.classList.toggle('is-active', a.dataset.stage === en.target.id)); } });
  }, { rootMargin: '-40% 0px -55% 0px' });
  ['watch', 'understand', 'practice', 'check'].forEach(id => io.observe($('#' + id, main)));

  main.addEventListener('click', e => {
    if (e.target.closest('[data-done]')) { Store.complete(L.id); toast('أحسنت! أكملت درس «' + L.title + '»'); announce('اكتمل الدرس'); const n = main.querySelector('[data-complete] a.btn-primary'); if (n) n.focus(); return; }
    if (e.target.closest('[data-undone]')) { Store.uncomplete(L.id); return; }
    const bm = e.target.closest('[data-bm]');
    if (bm) { const on = Store.toggleBookmark(L.id); bm.setAttribute('aria-pressed', on); $('span', bm).textContent = on ? 'محفوظ' : 'حفظ'; toast(on ? 'حُفظ الدرس' : 'أُزيل من المحفوظات'); return; }
    const tn = e.target.closest('[data-toggle-nav]'); if (tn) { const nav = tn.closest('.lesson-nav'); const on = !nav.classList.contains('show'); nav.classList.toggle('show', on); tn.setAttribute('aria-expanded', on); return; }
    const a = e.target.closest('a[href^="#"]:not([href^="#/"])');
    if (a) { e.preventDefault(); const tgt = $(a.getAttribute('href'), main); if (tgt) { tgt.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }); const h = $('h2', tgt); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } } }
  });
  return () => { player.destroy(); off(); io.disconnect(); };
}

/* Expandable hierarchy diagram (lesson 2.1) */
function renderHierExplorer(el) {
  const TREE = { kind: 'Workspace', name: 'مساحة عمل التدريب', info: 'أعلى مستوى: المؤسسة كلها بأعضائها وإعداداتها وكل أعمالها.', kids: [
    { kind: 'Space', name: 'العمليات', info: 'قسم رئيسي لإدارة أو فريق. هنا تُضبط كثير من الإعدادات التي ترثها المستويات الأدنى.', kids: [
      { kind: 'Folder', name: 'متابعة التدقيق', opt: true, info: 'مستوى اختياري يجمع قوائم مترابطة. يمكن الاستغناء عنه ووضع القوائم في Space مباشرة.', kids: [
        { kind: 'List', name: 'الربع الثالث', info: 'الحاوية الإلزامية للمهام. لا توجد مهمة خارج List.', kids: [
          { kind: 'Task', name: 'إغلاق ملاحظة التدقيق 7', info: 'وحدة العمل: مسؤول، حالة، تواريخ، أولوية، وتفاصيل.', kids: [
            { kind: 'Subtask', name: 'جمع المستندات الداعمة', info: 'خطوة أصغر لها مسؤول وتاريخ مستقلان. يمكن أن تتداخل المهام الفرعية أيضاً.' }] }] }] },
      { kind: 'List', name: 'طلبات داخلية', info: 'قائمة مباشرة داخل Space دون Folder، وهذا شائع ومناسب للأعمال البسيطة.', kids: [
        { kind: 'Task', name: 'طلب تقرير مبيعات الباقات', info: 'مهمة داخل قائمة موجودة مباشرة في Space.' }] }] }] };
  let n = 0; const flat = {};
  const node = (x, depth) => {
    const id = 'h' + (n++); flat[id] = x;
    return '<li><button type="button" class="hier-node" data-h="' + id + '"' + (x.kids ? ' aria-expanded="' + (depth < 1) + '"' : '') + '>' + (x.kids ? icon('chev-down', 'icon-sm') : '<span style="width:15px"></span>') +
      '<span class="h-kind">' + x.kind + '</span><span class="h-name">' + t(x.name) + '</span>' + (x.opt ? '<span class="chip h-opt">اختياري</span>' : '') + '</button>' +
      (x.kids ? '<ul' + (depth < 1 ? '' : ' hidden') + '>' + x.kids.map(k => node(k, depth + 1)).join('') + '</ul>' : '') + '</li>';
  };
  el.innerHTML = '<div class="panel hier" style="box-shadow:none"><h3>' + icon('layers', 'icon-sm') + ' مخطط تفاعلي للهيكل</h3><p class="help-text">افتح كل مستوى لترى ما بداخله، واختر أي عنصر لقراءة دوره.</p>' +
    '<ul class="hier-tree" role="tree">' + node(TREE, 0) + '</ul><div class="hier-detail" aria-live="polite" data-hd>اختر مستوى من المخطط.</div>' +
    '<div class="ex-actions"><button type="button" class="btn btn-ghost btn-sm" data-expand-all>' + icon('plus', 'icon-sm') + 'افتح كل المستويات</button></div></div>';
  el.addEventListener('click', e => {
    if (e.target.closest('[data-expand-all]')) { $$('.hier-tree ul', el).forEach(u => u.hidden = false); $$('[aria-expanded]', el).forEach(b => b.setAttribute('aria-expanded', 'true')); return; }
    const b = e.target.closest('[data-h]'); if (!b) return;
    const x = flat[b.dataset.h];
    const ul = b.nextElementSibling;
    if (ul && ul.tagName === 'UL') { const open = ul.hidden; ul.hidden = !open; b.setAttribute('aria-expanded', open); }
    $('[data-hd]', el).innerHTML = '<strong dir="ltr">' + x.kind + '</strong>: ' + t(x.info);
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
  main.innerHTML = '<div class="page"><div class="page-head"><div><h1>التقييمات <bdi class="en" dir="ltr" style="font-weight:400;color:var(--ink-3);font-size:1rem">Assessments</bdi></h1><p>اختبارات قصيرة لكل وحدة، وتقييم نهائي، وتحدٍّ عملي شامل. النتائج للتعلّم الذاتي وتُحفظ على هذا الجهاز فقط، وليست شهادة رسمية أو اعتماداً.</p></div></div>' +
    '<div class="big-cards"><div class="panel big-card"><h2>' + icon('assess') + 'التقييم النهائي</h2><p>18 سؤالاً من الوحدات الاثنتي عشرة، بشرح لكل إجابة. نسبة الاجتياز ' + Math.round(FINAL_PASS * 100) + '%.</p>' +
    '<p class="small">' + (fin ? 'أفضل نتيجة: <b class="num">' + fin.best + '/' + fin.total + '</b>، آخر نتيجة: <b class="num">' + fin.last + '/' + fin.total + '</b>، المحاولات: <span class="num">' + fin.attempts + '</span>' : 'لم تبدأ بعد.') + '</p>' +
    '<div><a class="btn btn-primary" href="#/assess/final">' + (fin ? 'إعادة التقييم' : 'ابدأ التقييم النهائي') + '</a></div></div>' +
    '<div class="panel big-card"><h2>' + icon('flask') + 'التحدي العملي الشامل</h2><p>' + t(PRACTICAL.scenario) + '</p><p class="small num">' + prac.filter(Boolean).length + ' من ' + prac.length + ' خطوات مكتملة' + (pracDone ? ' ' + '<b style="color:var(--ok)">(مكتمل)</b>' : '') + '</p>' +
    '<div><a class="btn btn-primary" href="#/assess/practical">' + (pracDone ? 'راجع التحدي' : 'ابدأ التحدي') + '</a></div></div></div>' +
    '<section class="section" aria-labelledby="mqT"><div class="section-head"><h2 id="mqT">اختبارات الوحدات</h2><p>4 أسئلة لكل وحدة. نسبة الاجتياز ' + Math.round(QUIZ_PASS * 100) + '%.</p></div><div class="assess-grid">' +
    MODULES.map(m => { const r = S.quizzes[m.id]; const passed = r && r.best / r.total >= QUIZ_PASS;
      return '<div class="panel assess-card"><h3><span class="space-avatar ' + (passed ? 'done' : r ? 'started' : '') + '">' + m.n + '</span>' + t(m.title) + '</h3><div class="row"><span class="small muted">' + (r ? 'أفضل نتيجة <b class="num">' + r.best + '/' + r.total + '</b>' + (passed ? ' ، ناجح' : '') : 'لم يُختبر بعد') + '</span>' +
        '<a class="btn btn-secondary btn-sm" href="#/assess/' + m.id + '">' + (r ? 'إعادة' : 'ابدأ') + '<span class="visually-hidden"> اختبار الوحدة ' + m.n + '</span></a></div></div>'; }).join('') + '</div></section></div>';
}
function viewModuleQuiz(main, mid) {
  const M = MODULE[mid]; const rec = Store.state.quizzes[mid];
  main.innerHTML = '<div class="page page-narrow"><div class="page-head"><div><div class="breadcrumbs"><a href="#/assess">التقييمات</a><span aria-hidden="true">/</span><span>الوحدة ' + M.n + '</span></div><h1 tabindex="-1">اختبار الوحدة ' + M.n + ': ' + t(M.title) + '</h1><p>' + QUIZZES[mid].length + ' أسئلة. ترتيب الخيارات يتغير في كل محاولة.' + (rec ? ' أفضل نتيجة سابقة: ' + rec.best + '/' + rec.total + '.' : '') + '</p></div>' +
    '<a class="btn btn-ghost" href="' + lessonLink(M.lessons[0]) + '">' + icon('book', 'icon-sm') + 'راجع دروس الوحدة</a></div><div data-q></div></div>';
  renderQuiz($('[data-q]', main), QUIZZES[mid], 'mq-' + mid, { pass: QUIZ_PASS, attempt: rec ? rec.attempts : 0, onSubmit: (s, n) => Store.recordQuiz(mid, s, n) });
}
function viewFinal(main) {
  const rec = Store.state.final; const attempt = rec ? rec.attempts : 0;
  const qs = buildFinal(attempt);
  main.innerHTML = '<div class="page page-narrow"><div class="page-head"><div><div class="breadcrumbs"><a href="#/assess">التقييمات</a><span aria-hidden="true">/</span><span>التقييم النهائي</span></div><h1 tabindex="-1">التقييم النهائي للمعرفة</h1><p>' + qs.length + ' سؤالاً تغطي الوحدات الاثنتي عشرة. نسبة الاجتياز ' + Math.round(FINAL_PASS * 100) + '%. كل محاولة جديدة تعرض مزيجاً مختلفاً من الأسئلة.</p></div></div><div data-q></div></div>';
  renderQuiz($('[data-q]', main), qs, 'final-' + attempt, { pass: FINAL_PASS, attempt, submitLabel: 'إنهاء التقييم وعرض النتيجة', onSubmit: (s, n) => { const r = Store.recordQuiz('final', s, n); if (s / n >= FINAL_PASS) toast('اجتزت التقييم النهائي'); void r; },
    resultNote: 'النتيجة للتعلّم الذاتي وتُحفظ على هذا الجهاز فقط. لعرض مزيج جديد من الأسئلة افتح التقييم النهائي من صفحة التقييمات مرة أخرى.' });
}
function viewPractical(main) {
  const paint = () => {
    const res = PRACTICAL.check(Lab.state); const all = res.every(Boolean);
    if (all) Store.setPractical();
    main.innerHTML = '<div class="page page-narrow"><div class="page-head"><div><div class="breadcrumbs"><a href="#/assess">التقييمات</a><span aria-hidden="true">/</span><span>التحدي العملي</span></div><h1 tabindex="-1">' + t(PRACTICAL.title) + '</h1><p>' + t(PRACTICAL.scenario) + '</p></div></div>' +
      '<div class="panel panel-pad" style="display:grid;gap:14px"><h2 style="font-size:1.05rem">الخطوات <span class="num muted" style="font-weight:400">(' + res.filter(Boolean).length + '/' + res.length + ')</span></h2><ul class="goal-list">' +
      PRACTICAL.steps.map((s, i) => '<li class="' + (res[i] ? 'met' : '') + '"><span class="gtick">' + (res[i] ? icon('check') : '') + '</span><span>' + t(s) + '<span class="visually-hidden">' + (res[i] ? ' (مكتملة)' : ' (غير مكتملة)') + '</span></span></li>').join('') + '</ul>' +
      (all || Store.state.practical ? feedbackHTML('ok', '<strong>أكملت التحدي العملي.</strong> سجّلت الطلب وتابعته بكل البيانات اللازمة وأغلقت الإجراء المعتمد. هذا ما يحتاجه العمل اليومي فعلاً.') : feedbackHTML('info', 'نفّذ الخطوات في مختبر التطبيق. هذه الصفحة تتحقق من أفعالك الفعلية وتتحدث تلقائياً.')) +
      '<div class="ex-actions"><a class="btn btn-primary" href="#/lab" data-go-lab>' + icon('flask') + 'افتح المختبر على قائمة الطلبات</a><a class="btn btn-ghost" href="' + lessonLink('l3-2') + '">راجع درس بيانات المهمة</a></div>' +
      '<p class="help-text">تلميح: يمكنك تنفيذ كل الخطوات من لوحة تفاصيل المهمة (افتح المهمة بعد إنشائها). ولإغلاق مهمة التدقيق غيّر حالتها إلى COMPLETE في أي طريقة عرض.</p></div></div>';
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
    main.innerHTML = '<div class="page"><div class="page-head"><div><h1 tabindex="-1">تقدّمي <bdi class="en" dir="ltr" style="font-weight:400;color:var(--ink-3);font-size:1rem">My Progress</bdi></h1><p>ملخص ما أنجزته في الدروس والتقييمات والتحديات.</p></div>' +
      (next ? '<a class="btn btn-primary" href="' + lessonLink(next) + '">' + icon('play') + 'تابع التعلّم: ' + t(LESSON[next].title) + '</a>' : '') + '</div>' +
      '<div class="storage-note' + (Store.ok ? '' : ' warn') + '">' + icon(Store.ok ? 'info' : 'alert') + '<p>' + (Store.ok ? 'يُحفظ هذا التقدم في متصفحك على هذا الجهاز فقط. لا توجد حسابات ولا مزامنة بين الأجهزة ولا تقارير مركزية للموظفين. مسح بيانات المتصفح أو استخدام جهاز آخر يعني البدء من جديد.' : 'التخزين المحلي غير متاح في هذا المتصفح (مثل وضع التصفح الخاص أو إعدادات تمنعه). يعمل التقدم أثناء هذه الجلسة فقط ويضيع عند إغلاق الصفحة.') + '</p></div>' +
      (allDone ? '<div class="panel panel-pad" style="display:flex;gap:14px;align-items:center;border-color:#b6dcc6;background:#f7fcf9">' + icon('check-circle', 'icon-lg') + '<div><h2 style="font-size:1.1rem">أكملت المسار التعليمي كاملاً</h2><p class="small">كل الدروس، والتقييم النهائي، والتحدي العملي. هذا سجل شخصي على جهازك، وليس شهادة رسمية أو اعتماداً من أي جهة.</p></div></div>' : '') +
      '<div class="panel stat-row">' +
      '<div class="stat"><span class="v">' + done + '<span class="muted" style="font-size:1rem">/' + LESSONS.length + '</span></span><span class="l">دروس مكتملة</span></div>' +
      '<div class="stat"><span class="v">' + passed + '<span class="muted" style="font-size:1rem">/12</span></span><span class="l">اختبارات وحدات ناجحة</span></div>' +
      '<div class="stat"><span class="v">' + (S.final ? S.final.best + '<span class="muted" style="font-size:1rem">/' + S.final.total + '</span>' : '-') + '</span><span class="l">أفضل نتيجة في التقييم النهائي</span></div>' +
      '<div class="stat"><span class="v">' + ch + '<span class="muted" style="font-size:1rem">/' + CHALLENGES.length + '</span></span><span class="l">تحديات المختبر' + (S.practical ? '، والتحدي الشامل مكتمل' : '') + '</span></div></div>' +
      '<section class="section" aria-labelledby="pmT"><h2 id="pmT">حسب الوحدة</h2><ul class="panel module-progress">' + MODULES.map(m => { const p = moduleProgress(m.id); const q = S.quizzes[m.id];
        return '<li><span class="space-avatar ' + (p.done === p.total ? 'done' : p.started ? 'started' : '') + '">' + m.n + '</span><a href="' + lessonLink(m.lessons.find(id => !Store.isDone(id)) || m.lessons[0]) + '">' + t(m.title) + '</a>' +
          '<span class="meter-cell"><span class="meter" style="width:100%" aria-hidden="true"><i style="width:' + (p.done / p.total * 100) + '%"></i></span></span><span class="small num muted">' + p.done + '/' + p.total + (q ? ' ، اختبار ' + q.best + '/' + q.total : '') + '</span></li>'; }).join('') + '</ul></section>' +
      '<section class="section" aria-labelledby="bmT"><h2 id="bmT">الدروس المحفوظة</h2>' + (S.bookmarks.length ? '<ul class="panel task-rows">' + S.bookmarks.filter(id => LESSON[id]).map(id => '<li class="task-row" style="grid-template-columns:26px minmax(0,1fr) auto 40px"><span aria-hidden="true">' + icon('bookmark') + '</span><div><a class="t-title" href="' + lessonLink(id) + '">' + t(LESSON[id].title) + '</a><span class="t-sub">الوحدة ' + MODULE[LESSON[id].module].n + '</span></div>' + badge(lessonStatusKey(id)) + '<button type="button" class="icon-btn bookmark-btn" aria-pressed="true" data-bm="' + id + '" aria-label="إزالة من المحفوظات: ' + esc(LESSON[id].title) + '">' + icon('bookmark') + '</button></li>').join('') + '</ul>' : '<div class="panel empty-state">' + icon('bookmark') + '<p>لم تحفظ أي درس بعد. اضغط زر الحفظ في أي درس للرجوع إليه من هنا.</p><a class="btn btn-secondary" href="#/library">تصفح المكتبة</a></div>') + '</section>' +
      '<section class="section" aria-labelledby="arT"><h2 id="arT">نتائج التقييمات</h2><div class="panel table-wrap"><table class="data-table"><caption class="visually-hidden">نتائج التقييمات</caption><thead><tr><th scope="col">التقييم</th><th scope="col" class="num">أفضل نتيجة</th><th scope="col" class="num">آخر نتيجة</th><th scope="col" class="num">المحاولات</th><th scope="col">آخر محاولة</th></tr></thead><tbody>' +
      [['التقييم النهائي', S.final]].concat(MODULES.map(m => ['الوحدة ' + m.n + ': ' + m.title, S.quizzes[m.id]])).filter(r => r[1]).map(r => '<tr><td>' + t(r[0]) + '</td><td class="num">' + r[1].best + '/' + r[1].total + '</td><td class="num">' + r[1].last + '/' + r[1].total + '</td><td class="num">' + r[1].attempts + '</td><td>' + fmtStamp(r[1].at) + '</td></tr>').join('') +
      ((S.final || Object.keys(S.quizzes).length) ? '' : '<tr><td colspan="5" class="muted">لم تُجرِ أي تقييم بعد. <a href="#/assess">ابدأ من صفحة التقييمات</a>.</td></tr>') + '</tbody></table></div></section>' +
      '<div class="panel danger-zone"><div><h2 style="font-size:1rem">إعادة ضبط التقدم</h2><p class="small muted">يحذف كل التقدم والنتائج والمحفوظات، ويعيد مختبر التطبيق إلى بياناته الأصلية على هذا الجهاز.</p></div><button type="button" class="btn btn-danger" data-reset>' + icon('trash', 'icon-sm') + 'إعادة ضبط كل التقدم</button></div></div>';
  };
  paint();
  main.addEventListener('click', e => {
    const bm = e.target.closest('[data-bm]'); if (bm) { Store.toggleBookmark(bm.dataset.bm); paint(); return; }
    if (e.target.closest('[data-reset]')) {
      confirmDialog('إعادة ضبط كل التقدم؟', 'سيُحذف تقدّمك في كل الدروس ونتائج التقييمات والمحفوظات والتحديات، ويعود المختبر إلى بياناته الأصلية. لا يمكن التراجع عن ذلك.', 'نعم، أعد الضبط').then(ok => {
        if (!ok) return; Store.resetAll(); Lab.init(); toast('أُعيد ضبط التقدم'); paint();
      });
    }
  });
}

/* ---------- Glossary & Help ---------- */
function viewHelp(main, params) {
  const tab = params[0] || 'glossary';
  const tabs = [['glossary', 'المصطلحات'], ['faq', 'أسئلة شائعة'], ['mistakes', 'أخطاء شائعة'], ['resources', 'مصادر رسمية']];
  let body = '';
  if (tab === 'glossary') {
    const letters = Array.from(new Set(GLOSSARY.map(g => g.en[0].toUpperCase()))).sort();
    body = '<div class="panel filters-bar" role="search"><div class="field grow"><label for="glQ">ابحث عن مصطلح بالعربية أو الإنجليزية</label><input class="input" id="glQ" type="search" placeholder="مثل: Dependency أو المسؤول"></div>' +
      '<nav class="alpha-nav" aria-label="انتقل حسب الحرف">' + letters.map(l => '<a href="#gl-' + l + '">' + l + '</a>').join('') + '</nav></div>' +
      '<p class="filter-summary" id="glCount" aria-live="polite"></p><ul class="panel gloss-list" data-gl></ul>';
  } else if (tab === 'faq') {
    body = '<div class="faq">' + FAQ.map((f, i) => '<details' + (i === 0 ? ' open' : '') + '><summary>' + icon('help', 'icon-sm') + t(f.q) + '<span class="chev">' + icon('chev-left', 'icon-sm') + '</span></summary><div class="faq-body"><p>' + t(f.a) + '</p></div></details>').join('') + '</div>';
  } else if (tab === 'mistakes') {
    body = '<div style="display:grid;gap:12px">' + COMMON_MISTAKES.map(m => '<div class="panel panel-pad" style="display:grid;gap:10px"><h2 style="font-size:1rem">' + t(m.title) + '</h2><div class="mistake"><div class="wrong"><h3>' + icon('x-circle', 'icon-sm') + 'الخطأ</h3><p>' + t(m.wrong) + '</p></div><div class="right"><h3>' + icon('check-circle', 'icon-sm') + 'الأفضل</h3><p>' + t(m.right) + '</p></div></div><a href="' + lessonLink(m.lesson) + '">' + icon('book', 'icon-sm') + ' الدرس المرتبط: ' + t(LESSON[m.lesson].title) + '</a></div>').join('') + '</div>';
  } else {
    body = '<div class="panel panel-pad" style="display:grid;gap:14px"><p>المراجع الرسمية هي المصدر الأدق دائماً. كل درس يربطك بالمقال الرسمي الذي روجع مقابله.</p><ul class="res-list">' +
      RESOURCES.map(r => '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + icon('external', 'icon-sm') + '<span>' + t(r.title) + '</span><span class="visually-hidden"> (يفتح في نافذة جديدة)</span></a><p class="help-text">' + t(r.note) + '</p></li>').join('') + '</ul><p class="help-text">' + t(REVIEW_NOTE) + '</p></div>';
  }
  main.innerHTML = '<div class="page page-narrow"><div class="page-head"><div><h1 tabindex="-1">المصطلحات والمساعدة <bdi class="en" dir="ltr" style="font-weight:400;color:var(--ink-3);font-size:1rem">Glossary and Help</bdi></h1><p>مصطلحات ClickUp بالعربية، وإجابات الأسئلة المتكررة، والأخطاء الشائعة، والمصادر الرسمية.</p></div></div>' +
    '<nav class="tabs" aria-label="أقسام المساعدة">' + tabs.map(tb => '<a href="#/help/' + tb[0] + '"' + (tb[0] === tab ? ' aria-current="page"' : '') + '>' + tb[1] + '</a>').join('') + '</nav>' + body + '</div>';
  if (tab === 'glossary') {
    const paint = q => {
      q = (q || '').trim().toLowerCase();
      const res = GLOSSARY.slice().sort((a, b) => a.en.localeCompare(b.en)).filter(g => !q || g.en.toLowerCase().includes(q) || g.ar.includes(q) || g.def.includes(q));
      $('#glCount').textContent = res.length + ' مصطلح';
      const seen = {};
      $('[data-gl]', main).innerHTML = res.length ? res.map(g => { const L0 = g.en[0].toUpperCase(); const anchor = !seen[L0] ? (seen[L0] = 1, ' id="gl-' + L0 + '"') : '';
        return '<li class="gloss-item"' + anchor + ' data-term="' + esc(g.en) + '"><h3><span class="en" lang="en">' + esc(g.en) + '</span><span class="ar">' + esc(g.ar) + '</span></h3><p>' + t(g.def) + '</p><p class="ex">مثال: ' + t(g.ex) + '</p>' + (g.lesson && LESSON[g.lesson] ? '<a class="small" href="' + lessonLink(g.lesson) + '">' + icon('book', 'icon-sm') + ' تعلّمه في: ' + t(LESSON[g.lesson].title) + '</a>' : '') + '</li>'; }).join('')
        : '<li class="empty-state">' + icon('search') + '<p>لا يوجد مصطلح مطابق. جرّب كلمة أخرى.</p></li>';
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
  main.innerHTML = '<div class="page page-narrow"><div class="page-head"><div><h1 tabindex="-1">حول المنصة <bdi class="en" dir="ltr" style="font-weight:400;color:var(--ink-3);font-size:1rem">About</bdi></h1><p><bdi dir="ltr">Omantel | ClickUp Learning Hub</bdi>: <bdi dir="ltr">Learn. Practice. Achieve.</bdi></p></div></div>' +
    '<section class="panel panel-pad prose" style="max-width:none"><h2>ما هذه المنصة؟</h2><p>منصة تعليمية تفاعلية تساعد موظفي Omantel على استخدام ClickUp بثقة، من الأساسيات إلى سير العمل المتقدم. تعتمد على منهج شاهد، ثم افهم، ثم تدرّب، ثم تحقّق، مع مساحة تدريب ببيانات وهمية.</p>' +
    '<h2>ما الذي يجب أن تعرفه</h2><ul>' +
    '<li><strong>محاكاة تعليمية:</strong> الشاشات والعروض المتحركة ومختبر التطبيق إعادة بناء مبسّطة لأغراض التعلّم، وليست تسجيلات من ClickUp ولا تتصل به.</li>' +
    '<li><strong>ليست جهة معتمدة:</strong> المنصة مستقلة، وغير معتمدة أو مدعومة رسمياً من ClickUp، ولا تمنح شهادة رسمية أو اعتماداً.</li>' +
    '<li><strong>بيانات وهمية:</strong> كل الأسماء والمهام والأرقام في الأمثلة خيالية، ولا تمثل سياسات Omantel أو إجراءاتها أو بيانات موظفيها.</li>' +
    '<li><strong>التقدّم محلي:</strong> يُحفظ في متصفحك على هذا الجهاز فقط، دون حسابات أو مزامنة أو تقارير مركزية.</li>' +
    '<li><strong>دقة المحتوى:</strong> ' + t(REVIEW_NOTE) + ' نقاط لم يمكن التحقق منها بالكامل معلّمة داخل الدروس بتنبيه «تنبيه دقة».</li>' +
    '<li><strong>الشعارات:</strong> الشعاران الرسميان لـ Omantel وClickUp يُضافان من ملفات أصلية مرفقة في مجلد <code>assets</code>. إلى أن تتوفر تظهر عناصر نائبة واضحة.</li></ul>' +
    '<h2>المهارات المستخدمة في التصميم</h2><p>صُممت الواجهة بالاستعانة بثلاث مهارات تصميم: Impeccable للبنية والطباعة والمسافات وإمكانية الوصول، وEmil Design Engineering للحركة والتفاعل، وTaste لاتجاه الواجهات التعريفية.</p></section>' +
    '<section class="panel panel-pad" style="display:grid;gap:6px"><h2 style="font-size:1rem">التصميم</h2><p class="about-credit" lang="en">' + CREDIT + '</p></section></div>';
}

function viewNotFound(main) {
  main.innerHTML = '<div class="page page-narrow"><div class="panel empty-state">' + icon('compass') + '<h1 tabindex="-1" style="font-size:1.3rem">الصفحة غير موجودة</h1><p>ربما تغيّر الرابط. ابدأ من الرئيسية أو المكتبة.</p><div class="hero-actions" style="margin-top:0"><a class="btn btn-primary" href="#/home">الرئيسية</a><a class="btn btn-secondary" href="#/library">مكتبة الدروس</a></div></div></div>';
}
