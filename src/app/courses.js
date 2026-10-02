/* ==========================================================================
   Courses for Beginners section.
     #/courses                      all courses
     #/courses/:course              course overview (sections and topics)
     #/courses/:course/:topic       an interactive topic: Understand, Watch
                                    (animated demo), Try it, Real example,
                                    Common mistake (flip card), Quick check
     #/courses/:course/interview    role play
   Progress is kept on this device, per course.
   ========================================================================== */
const CourseProgress = (() => {
  const cache = {};
  const key = cid => 'omantel-clickup-hub:course:' + cid;
  const load = cid => {
    if (cache[cid]) return cache[cid];
    let ids = [];
    try {
      const raw = window.localStorage.getItem(key(cid)) || (cid === 'clickup4' ? window.localStorage.getItem('omantel-clickup-hub:course') : null);
      ids = JSON.parse(raw || '[]'); if (!Array.isArray(ids)) ids = [];
    } catch (e) { ids = []; }
    return (cache[cid] = new Set(ids.filter(x => typeof x === 'string')));
  };
  const save = cid => { try { window.localStorage.setItem(key(cid), JSON.stringify([...cache[cid]])); } catch (e) { /* this device only */ } };
  return {
    has: (cid, id) => load(cid).has(id),
    set(cid, id, on) { const s = load(cid); if (on) s.add(id); else s.delete(id); save(cid); return on; },
    count: (cid, ids) => { const s = load(cid); return ids.filter(id => s.has(id)).length; }
  };
})();

const coursePath = (c, t) => '#/courses/' + c.id + (t ? '/' + t : '');
function courseLinkOf(link) {
  if (!link) return null;
  if (link.charAt(0) === '#') {
    const names = { '#/workshops/ai': tx('ورشة الذكاء الاصطناعي', 'AI workshop'), '#/workshops/import': tx('ورشة الاستيراد والتصدير', 'Import & export workshop'), '#/workshops/templates': tx('ورشة القوالب', 'Templates workshop'), '#/workshops': tx('الورش التفاعلية', 'Workshops'), '#/automations': tx('ورشة الأتمتة', 'Automations workshop'), '#/studio': tx('استوديو لوحات المعلومات', 'Dashboard Studio'), '#/tour': tx('جولة ClickUp', 'ClickUp tour') };
    return { href: link, label: names[link] || tx('افتح', 'Open'), ic: 'robot' };
  }
  return LESSON[link] ? { href: '#/lesson/' + link, label: LESSON[link].title, ic: 'book' } : null;
}

function viewCourses(main, params) {
  if (!params[0]) return viewCoursesHub(main);
  const c = COURSE_BY_ID(params[0]); if (!c) return viewNotFound(main);
  if (!params[1]) return viewCourseHome(main, c);
  if (params[1] === 'interview') return viewCourseInterview(main, c);
  const T = c.topics(); const i = T.findIndex(t => t.id === params[1]);
  return i < 0 ? viewNotFound(main) : viewCourseTopic(main, c, T, i);
}

/* ---------- All courses ---------- */
function viewCoursesHub(main) {
  main.innerHTML = '<div class="page courses">' +
    '<section class="hx hx-small cs-hero" aria-labelledby="csT"><div class="hx-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><span class="hx-grid"></span></div>' +
    '<div class="hx-copy"><span class="hero-kicker">' + icon('book', 'icon-sm') + tx('تعلّم خطوة بخطوة', 'Learn step by step') + '</span><h1 id="csT" tabindex="-1">' + tx('دورات للمبتدئين', 'Courses for beginners') + '</h1>' +
    '<p class="lead">' + tx('دورات كاملة تشرح كل موضوع بعمق: فكرة واضحة، وعرض متحرك يريك أين تنقر، وتطبيق عملي، واختبار قصير. ابدأ من الصفر وتقدّم بثقة.', 'Complete courses that explain every topic in depth: a clear idea, an animation that shows you where to click, hands-on practice and a short check. Start from zero and progress with confidence.') + '</p></div>' +
    '<div class="cs-hero-art" aria-hidden="true">' + mascot('mascot-lg') + '</div></section>' +
    '<div class="cs-grid">' + COURSES.map((c, k) => {
      const T = c.topics(); const d = CourseProgress.count(c.id, T.map(t => t.id)); const pct = Math.round(d / T.length * 100);
      return '<a class="cs-card" data-rv href="' + coursePath(c) + '" style="--g:' + c.g + ';--cc:' + c.c + ';--i:' + k + '"><span class="cs-art"><span class="ic-tile">' + icon(c.ic) + '</span><i></i><i></i><i></i><b class="cs-level">' + tp(c.level) + '</b></span>' +
        '<span class="cs-body"><h2>' + tp(c.title) + '</h2><p>' + tp(c.sub) + '</p><span class="cs-meta">' + icon('layers', 'icon-sm') + tx(c.sections().length + ' أقسام · ' + T.length + ' موضوعاً', c.sections().length + ' sections · ' + T.length + ' topics') + '</span>' +
        '<span class="cs-prog"><i style="width:' + pct + '%"></i></span><span class="way-go">' + (d ? tx('تابع التعلّم', 'Continue learning') + ' · ' + pct + '%' : tx('ابدأ الدورة', 'Start the course')) + icon('fwd', 'icon-sm') + '</span></span></a>';
    }).join('') +
    '<div class="cs-card cs-soon"><span class="cs-soon-ic">' + icon('plus') + '</span><h2>' + tx('دورات جديدة قريباً', 'More courses coming soon') + '</h2><p>' + tx('ستُضاف دورات أخرى للمبتدئين هنا.', 'More beginner courses will be added here.') + '</p></div></div></div>';
}

/* ---------- Course overview ---------- */
function viewCourseHome(main, c) {
  const T = c.topics(); const S = c.sections(); const ids = T.map(t => t.id); const doneN = CourseProgress.count(c.id, ids);
  const next = T.find(t => !CourseProgress.has(c.id, t.id)) || T[0]; const pct = Math.round(doneN / T.length * 100);
  const incl = [['layers', tx(S.length + ' قسماً و' + T.length + ' موضوعاً', S.length + ' sections, ' + T.length + ' topics')], ['play', tx('عرض متحرك لكل موضوع', 'An animated demo for every topic')], ['check', tx('اختبار قصير وتطبيق عملي', 'A quick check and hands-on practice')], ['users', tx('تمثيل أدوار: مقابلة عمل', '1 role play: a job interview')], ['globe', tx('بالعربية والإنجليزية', 'In Arabic and English')], ['mobile', tx('على الجوال والحاسوب · التقدم محفوظ على هذا الجهاز', 'Mobile and desktop · progress saved on this device')]];
  main.innerHTML = '<div class="page course" style="--cc:' + c.c + '">' +
    '<div class="breadcrumbs cs-bc"><a href="#/courses">' + tx('دورات للمبتدئين', 'Courses for beginners') + '</a><span aria-hidden="true">/</span><span>' + tp(c.short) + '</span></div>' +
    '<section class="hx hx-small co-hero" aria-labelledby="coT" style="background:' + c.g + '"><div class="hx-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b3"></span><span class="hx-grid"></span></div>' +
    '<div class="hx-copy"><span class="hero-kicker">' + icon(c.ic, 'icon-sm') + tp(c.level) + ' · ' + tx('إصدار 2026', '2026 edition') + '</span><h1 id="coT" tabindex="-1">' + tp(c.title) + '</h1><p class="lead">' + tp(c.sub) + '</p>' +
    '<div class="co-cta"><a class="btn btn-primary btn-lg" href="' + coursePath(c, next.id) + '">' + icon('play', 'icon-sm') + '<span>' + (doneN ? tx('تابع: ', 'Continue: ') + esc(tp(next.t)) : tx('ابدأ الدورة', 'Start the course')) + '</span></a></div></div>' +
    '<div class="co-ring" role="img" aria-label="' + tx('أنجزت ' + doneN + ' من ' + T.length, doneN + ' of ' + T.length + ' done') + '" style="--p:' + pct + '"><span class="num">' + pct + '%</span><small>' + tx('تقدّمك', 'your progress') + '</small></div></section>' +
    '<div class="co-top"><section class="panel co-learn"><h2>' + tx('ماذا ستتعلم', 'What you’ll learn') + '</h2><ul>' + c.learn.map(l => '<li>' + icon('check', 'icon-sm') + '<span>' + tp(l) + '</span></li>').join('') + '</ul></section>' +
    '<section class="panel co-incl"><h2>' + tx('تتضمن هذه الدورة', 'This course includes') + '</h2><ul>' + incl.map(x => '<li>' + icon(x[0], 'icon-sm') + '<span>' + x[1] + '</span></li>').join('') + '</ul></section></div>' +
    '<h2 class="co-h">' + tx('محتوى الدورة', 'Course content') + ' <small>' + tx(S.length + ' قسماً · ' + T.length + ' موضوعاً · تمثيل أدوار', S.length + ' sections · ' + T.length + ' topics · 1 role play') + '</small></h2>' +
    '<div class="co-secs">' + S.map((s, si) => {
      const list = T.filter(t => t.sec === s.id); const d = CourseProgress.count(c.id, list.map(t => t.id));
      const open = UIState.get('co-open:' + c.id + s.id); const isOpen = open == null ? si === 0 : open;
      return '<details class="co-sec" data-sec="' + s.id + '" style="--sc:' + s.c + '"' + (isOpen ? ' open' : '') + '><summary><span class="co-sic">' + icon(s.ic) + '</span><span class="co-st"><b><span class="num">' + (si + 1) + '.</span> ' + tp(s.t) + '</b><small>' + tx(list.length + ' مواضيع · أنجزت ' + d, list.length + ' topics · ' + d + ' done') + '</small></span><span class="co-bar" aria-hidden="true"><i style="width:' + Math.round(d / list.length * 100) + '%"></i></span>' + icon('down', 'icon-sm co-chev') + '</summary>' +
        '<ol class="co-list">' + list.map(t => { const n = T.indexOf(t) + 1; const done = CourseProgress.has(c.id, t.id); return '<li><a href="' + coursePath(c, t.id) + '"' + (done ? ' class="done"' : '') + '><span class="co-n num">' + n + '</span><span>' + esc(tp(t.t)) + '</span>' + (t.demo ? '<span class="co-has" title="' + tx('عرض متحرك', 'Animated demo') + '">' + icon('play', 'icon-sm') + '</span>' : '') + (done ? '<span class="co-ok">' + icon('check', 'icon-sm') + '<span class="visually-hidden">' + tx('تم', 'done') + '</span></span>' : '') + '</a></li>'; }).join('') + '</ol></details>';
    }).join('') +
    '<a class="co-sec co-rp" href="' + coursePath(c, 'interview') + '" style="--sc:#0f766e"><span class="co-sic">' + icon('users') + '</span><span class="co-st"><b>' + tx('تمثيل أدوار: ', 'Role play: ') + tp(c.rpTitle) + '</b><small>' + tx('أثبت خبرتك في خمسة أسئلة مقابلة', 'Show your expertise in five interview questions') + '</small></span>' + icon('fwd', 'icon-sm') + '</a></div></div>';
  $$('details.co-sec', main).forEach(d => d.addEventListener('toggle', () => { UIState.set('co-open:' + c.id + d.dataset.sec, d.open); if (d.open) Sound.play('tap'); }));
}

/* ---------- Interactive topic ---------- */
function viewCourseTopic(main, c, T, i) {
  const t = T[i]; const S = c.sections(); const sec = S.find(s => s.id === t.sec); const prev = T[i - 1], next = T[i + 1];
  const link = courseLinkOf(t.link); let cleanup = null;
  const parts = [['u', 'bulb', tx('افهم', 'Understand')]].concat(t.demo ? [['w', 'play', tx('شاهد', 'Watch')]] : []).concat([['t', 'checklist', tx('جرّب', 'Try')]]).concat(t.quiz ? [['c', 'target', tx('اختبر نفسك', 'Check')]] : []);
  const doneNow = () => CourseProgress.has(c.id, t.id);
  main.innerHTML = '<div class="page course co-topic" style="--sc:' + sec.c + '">' +
    '<header class="co-head"><div class="breadcrumbs"><a href="#/courses">' + tx('دورات للمبتدئين', 'Courses') + '</a><span aria-hidden="true">/</span><a href="' + coursePath(c) + '">' + tp(c.short) + '</a><span aria-hidden="true">/</span><span>' + tp(sec.t) + '</span></div>' +
    '<span class="co-chip">' + icon(sec.ic, 'icon-sm') + tx('الموضوع ' + (i + 1) + ' من ' + T.length, 'Topic ' + (i + 1) + ' of ' + T.length) + '</span>' +
    '<h1 tabindex="-1">' + esc(tp(t.t)) + '</h1>' +
    '<nav class="co-parts" aria-label="' + tx('أجزاء الموضوع', 'Topic parts') + '">' + parts.map((p, k) => '<button type="button" data-part="' + p[0] + '"><span class="num">' + (k + 1) + '</span>' + icon(p[1], 'icon-sm') + p[2] + '</button>').join('') + '</nav></header>' +

    '<section class="panel co-u" id="cp-u" data-sec="u"><h2>' + icon('bulb', 'icon-sm') + tx('افهم الفكرة', 'Understand the idea') + '</h2><div class="co-u-body"><span class="co-mascot" aria-hidden="true">' + mascot('mascot-sm') + '</span><div><p class="co-lead">' + esc(tp(t.explain)) + '</p>' + (t.more ? '<p>' + esc(tp(t.more)) + '</p>' : '') + '</div></div>' +
    (t.like ? '<div class="co-like"><span class="co-like-ic">' + icon('sparkle') + '</span><div><b>' + tx('تخيّلها هكذا', 'Think of it like this') + '</b><p>' + esc(tp(t.like)) + '</p></div></div>' : '') + '</section>' +

    (t.demo ? '<section class="panel co-w" id="cp-w" data-sec="w"><h2>' + icon('play', 'icon-sm') + tx('شاهد كيف', 'Watch how') + '<small>' + tx('محاكاة تعليمية مبسّطة', 'Simplified educational simulation') + '</small></h2><div class="co-demo"></div></section>' : '') +

    '<section class="panel co-t" id="cp-t" data-sec="t"><h2>' + icon('checklist', 'icon-sm') + tx('جرّبها بنفسك في ClickUp', 'Try it yourself in ClickUp') + '</h2><p class="co-hint">' + tx('نفّذ كل خطوة ثم اضغط عليها لتعليمها.', 'Do each step, then tap it to tick it off.') + '</p>' +
    '<ol class="co-try">' + t.doit.map((s, k) => '<li><button type="button" data-try="' + k + '" aria-pressed="false" style="--k:' + k + '"><span class="co-tick">' + icon('check', 'icon-sm') + '</span><span class="num">' + (k + 1) + '</span><span>' + esc(tp(s)) + '</span></button></li>').join('') + '</ol><p class="co-try-done" aria-live="polite"></p></section>' +

    (t.ex ? '<section class="co-ex"><span class="co-ex-ic">' + icon('users') + '</span><div><b>' + tx('مثال من بيئة العمل', 'A real workplace example') + '</b><p>' + esc(tp(t.ex)) + '</p></div></section>' : '') +

    (t.wrong ? '<section class="co-flip" aria-label="' + tx('خطأ شائع والطريقة الصحيحة', 'Common mistake and the right way') + '"><div class="co-flip-in"><div class="co-face wrong"><b>' + icon('x-circle', 'icon-sm') + tx('خطأ شائع', 'Common mistake') + '</b><p>' + esc(tp(t.wrong)) + '</p><button type="button" class="btn btn-secondary" data-flip>' + tx('اقلب لترى الطريقة الصحيحة', 'Flip to see the right way') + icon('reset', 'icon-sm') + '</button></div>' +
      '<div class="co-face right"><b>' + icon('check-circle', 'icon-sm') + tx('الطريقة الصحيحة', 'The right way') + '</b><p>' + esc(tp(t.right)) + '</p><button type="button" class="btn btn-ghost" data-flip>' + tx('اقلب مجدداً', 'Flip back') + icon('reset', 'icon-sm') + '</button></div></div></section>' : '') +

    (t.quiz ? '<section class="panel co-c" id="cp-c" data-sec="c"><h2>' + icon('target', 'icon-sm') + tx('اختبر نفسك', 'Quick check') + '</h2><p class="co-q-t">' + esc(tp(t.quiz.q)) + '</p><div class="co-opts" role="group" aria-label="' + esc(tp(t.quiz.q)) + '">' +
      t.quiz.o.map((o, k) => '<button type="button" class="co-opt" data-opt="' + k + '"><span class="co-ol">' + 'ABC'.charAt(k) + '</span><span>' + esc(tp(o)) + '</span></button>').join('') + '</div><div class="co-why" aria-live="polite"></div></section>' : '') +

    '<aside class="co-tip">' + icon('bulb') + '<div><b>' + tx('نصيحة المحترفين', 'Pro tip') + '</b><p>' + esc(tp(t.tip)) + '</p></div></aside>' +
    '<div class="co-actions"><button type="button" class="btn" data-done></button>' +
      (link ? '<a class="btn btn-ghost" href="' + link.href + '">' + icon(link.ic, 'icon-sm') + tx('للتعمق: ', 'Go deeper: ') + esc(link.label) + '</a>' : '') +
      '<button type="button" class="btn btn-ghost" data-askc>' + icon('robot', 'icon-sm') + tx('اسأل كليكي عن هذا', 'Ask Clicky about this') + '</button></div>' +
    '<nav class="tour-nav co-nav" aria-label="' + tx('التنقل بين المواضيع', 'Topic navigation') + '">' +
      (prev ? '<a class="btn btn-secondary" href="' + coursePath(c, prev.id) + '">' + icon('back', 'icon-sm') + '<span>' + esc(tp(prev.t)) + '</span></a>' : '<a class="btn btn-secondary" href="' + coursePath(c) + '">' + icon('back', 'icon-sm') + '<span>' + tx('محتوى الدورة', 'Course content') + '</span></a>') +
      (next ? '<a class="btn btn-primary" href="' + coursePath(c, next.id) + '"><span>' + tx('التالي: ', 'Next: ') + esc(tp(next.t)) + '</span>' + icon('fwd', 'icon-sm') + '</a>' : '<a class="btn btn-primary" href="' + coursePath(c, 'interview') + '"><span>' + tx('التالي: تمثيل الأدوار', 'Next: the role play') + '</span>' + icon('fwd', 'icon-sm') + '</a>') +
    '</nav></div>';

  const paintDone = () => { const b = $('[data-done]', main); const on = doneNow(); b.className = 'btn ' + (on ? 'btn-secondary is-done' : 'btn-primary'); b.setAttribute('aria-pressed', String(on)); b.innerHTML = icon('check', 'icon-sm') + (on ? tx('أنجزت هذا الموضوع', 'Topic done') : tx('علّمه «تم»', 'Mark as done')); };
  const setDone = on => { CourseProgress.set(c.id, t.id, on); paintDone(); if (on) { Sound.play('success'); if (CourseProgress.count(c.id, T.map(x => x.id)) === T.length && typeof Motion !== 'undefined') Motion.confetti(); } };
  paintDone();
  $('[data-done]', main).addEventListener('click', () => setDone(!doneNow()));
  $('[data-askc]', main).addEventListener('click', () => Clicky.ask(tx('اشرح لي ببساطة: ', 'Explain simply: ') + tp(t.t)));

  if (t.demo) cleanup = CX.mount($('.co-demo', main), t.demo);

  // Topic parts nav: scroll to a part, and light the part in view
  $$('[data-part]', main).forEach(b => b.addEventListener('click', () => { const el = $('#cp-' + b.dataset.part, main); if (el) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }); Sound.play('tap'); }));
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('[data-part]', main).forEach(b => b.classList.toggle('on', b.dataset.part === e.target.dataset.sec)); }), { rootMargin: '-40% 0px -50% 0px' });
    $$('[data-sec]', main).forEach(s => { if (s.id) io.observe(s); });
  }

  // Try it yourself: tick steps
  main.addEventListener('click', e => {
    const tr = e.target.closest('[data-try]');
    if (tr) {
      const on = tr.getAttribute('aria-pressed') !== 'true'; tr.setAttribute('aria-pressed', String(on)); Sound.play(on ? 'pop' : 'tap');
      const all = $$('[data-try]', main); const n = all.filter(b => b.getAttribute('aria-pressed') === 'true').length;
      $('.co-try-done', main).textContent = n === all.length ? tx('رائع! نفّذت كل الخطوات بنفسك.', 'Great! You did every step yourself.') : '';
      if (n === all.length) $('.co-t', main).classList.add('all');
      else $('.co-t', main).classList.remove('all');
      return;
    }
    const fl = e.target.closest('[data-flip]');
    if (fl) { const box = fl.closest('.co-flip'); box.classList.toggle('on'); Sound.play('whoosh'); const face = $(box.classList.contains('on') ? '.co-face.right button' : '.co-face.wrong button', box); setTimeout(() => face.focus({ preventScroll: true }), 50); return; }
    const op = e.target.closest('[data-opt]');
    if (op && t.quiz) {
      const k = +op.dataset.opt; const ok = k === t.quiz.a;
      $$('[data-opt]', main).forEach(b => { b.classList.remove('wrong'); if (+b.dataset.opt === t.quiz.a && ok) b.classList.add('right'); });
      op.classList.add(ok ? 'right' : 'wrong');
      const why = $('.co-why', main);
      why.innerHTML = ok ? '<p class="ok">' + icon('check-circle', 'icon-sm') + '<b>' + tx('إجابة صحيحة!', 'Correct!') + '</b> ' + esc(tp(t.quiz.why)) + '</p>' + (doneNow() ? '' : '<button type="button" class="btn btn-primary" data-done2>' + icon('check', 'icon-sm') + tx('علّم الموضوع «تم»', 'Mark this topic as done') + '</button>')
        : '<p class="no">' + icon('x-circle', 'icon-sm') + '<b>' + tx('ليست هذه.', 'Not quite.') + '</b> ' + tx('راجع فقرة «افهم الفكرة» وجرّب مرة أخرى.', 'Look back at “Understand the idea” and try again.') + '</p>';
      Sound.play(ok ? 'success' : 'error');
      if (ok) $$('[data-opt]', main).forEach(b => { b.disabled = true; });
      return;
    }
    if (e.target.closest('[data-done2]')) { setDone(true); e.target.closest('[data-done2]').remove(); }
  });
  return () => { if (typeof cleanup === 'function') cleanup(); if (io) io.disconnect(); };
}

/* ---------- Role play ---------- */
function viewCourseInterview(main, c) {
  const Q = c.interview().map(q => ({ q: tp(q[0]), a: tp(q[1]) }));
  main.innerHTML = '<div class="page course co-topic" style="--sc:#0f766e">' +
    '<header class="co-head"><div class="breadcrumbs"><a href="#/courses">' + tx('دورات للمبتدئين', 'Courses') + '</a><span aria-hidden="true">/</span><a href="' + coursePath(c) + '">' + tp(c.short) + '</a><span aria-hidden="true">/</span><span>' + tx('تمثيل الأدوار', 'Role play') + '</span></div>' +
    '<span class="co-chip">' + icon('users', 'icon-sm') + tx('تمثيل أدوار', 'Role play') + '</span><h1 tabindex="-1">' + tp(c.rpTitle) + '</h1></header>' +
    '<section class="panel co-u"><div class="co-u-body"><span class="co-mascot" aria-hidden="true">' + mascot('mascot-sm') + '</span><div><h2>' + tx('كيف تلعبها', 'How to play') + '</h2><p>' + tx('تخيّل أنك في مقابلة عمل وكليكي هو المحاوِر. اقرأ السؤال، اكتب إجابتك أو قلها بصوت عالٍ، ثم اكشف إجابة نموذجية وقارنها. ما تكتبه يبقى في هذه الصفحة فقط ولا يُحفظ.', 'Imagine you are in a job interview and Clicky is the interviewer. Read the question, write your answer or say it out loud, then reveal a model answer and compare. What you type stays on this page only and is not saved.') + '</p></div></div></section>' +
    '<ol class="co-rp-list">' + Q.map((x, k) => '<li class="panel co-q" data-q="' + k + '"><p class="co-qt"><span class="num">' + (k + 1) + '</span>' + esc(x.q) + '</p>' +
      '<label class="visually-hidden" for="coA' + k + '">' + tx('إجابتك', 'Your answer') + '</label><textarea class="textarea" id="coA' + k + '" rows="3" placeholder="' + tx('اكتب إجابتك هنا…', 'Type your answer here…') + '"></textarea>' +
      '<button type="button" class="btn btn-secondary" data-reveal aria-expanded="false">' + icon('eye', 'icon-sm') + tx('اكشف الإجابة النموذجية', 'Reveal a model answer') + '</button>' +
      '<div class="co-model" hidden><b>' + tx('إجابة نموذجية', 'Model answer') + '</b><p>' + esc(x.a) + '</p><div class="co-rate"><span>' + tx('كيف كانت إجابتك؟', 'How was your answer?') + '</span><button type="button" class="btn btn-ghost" data-rate="good" aria-pressed="false">' + icon('thumb', 'icon-sm') + tx('واثق', 'Confident') + '</button><button type="button" class="btn btn-ghost" data-rate="again" aria-pressed="false">' + icon('replay', 'icon-sm') + tx('أحتاج تدريباً', 'Need practice') + '</button></div></div></li>').join('') + '</ol>' +
    '<p class="co-score" aria-live="polite"></p><nav class="tour-nav co-nav"><a class="btn btn-secondary" href="' + coursePath(c) + '">' + icon('back', 'icon-sm') + '<span>' + tx('محتوى الدورة', 'Course content') + '</span></a></nav></div>';
  const rated = {};
  main.addEventListener('click', e => {
    const r = e.target.closest('[data-reveal]');
    if (r) { const m = $('.co-model', r.closest('.co-q')); m.hidden = !m.hidden; r.setAttribute('aria-expanded', String(!m.hidden)); Sound.play(m.hidden ? 'tap' : 'pop'); return; }
    const g = e.target.closest('[data-rate]');
    if (g) {
      const k = g.closest('.co-q').dataset.q; rated[k] = g.dataset.rate;
      $$('[data-rate]', g.parentNode).forEach(b => b.setAttribute('aria-pressed', String(b === g)));
      const good = Object.values(rated).filter(v => v === 'good').length, all = Object.keys(rated).length;
      $('.co-score', main).textContent = all === Q.length ? (good === Q.length ? tx('ممتاز! أنت جاهز للمقابلة.', 'Excellent! You are ready for the interview.') : tx('واثق في ' + good + ' من ' + Q.length + '. راجع المواضيع المرتبطة ثم أعد المحاولة.', 'Confident in ' + good + ' of ' + Q.length + '. Review the related topics and try again.')) : '';
      Sound.play(g.dataset.rate === 'good' ? 'like' : 'tap');
      if (all === Q.length && good === Q.length && typeof Motion !== 'undefined') Motion.confetti();
    }
  });
}
