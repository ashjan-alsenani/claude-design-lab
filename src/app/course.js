/* ==========================================================================
   Course page: "ClickUp 4.0 for Beginners". A course overview with progress,
   one friendly page per topic (explanation, steps, pro tip, related lesson,
   ask Clicky), and an interview role play. Progress is kept on this device.
   ========================================================================== */
const COURSE_KEY = 'omantel-clickup-hub:course';
const CourseProgress = (() => {
  let done = null;
  const load = () => { if (done) return done; try { done = new Set(JSON.parse(window.localStorage.getItem(COURSE_KEY) || '[]')); } catch (e) { done = new Set(); } return done; };
  const save = () => { try { window.localStorage.setItem(COURSE_KEY, JSON.stringify([...done])); } catch (e) { /* this device only; fine without storage */ } };
  return {
    has: id => load().has(id),
    toggle(id) { load(); if (done.has(id)) done.delete(id); else done.add(id); save(); return done.has(id); },
    count: ids => { load(); return ids.filter(id => done.has(id)).length; }
  };
})();

const courseTopics = () => COURSE.map((r, i) => ({ sec: r[0], id: r[1], n: i + 1, t: tp(r[2]), what: tp(r[3]), steps: r[4].map(tp), tip: tp(r[5]), link: r[6] }));
const courseTitle = () => tx('ClickUp 4.0 للمبتدئين: أتقن مساحة العمل المدعومة بالذكاء الاصطناعي', 'ClickUp 4.0 for Beginners: Master the AI-Powered Workspace');
function courseLink(link) {
  if (!link) return null;
  if (link.charAt(0) === '#') {
    const names = { '#/workshops/ai': tx('ورشة الذكاء الاصطناعي', 'AI workshop'), '#/workshops/import': tx('ورشة الاستيراد والتصدير', 'Import & export workshop'), '#/workshops/templates': tx('ورشة القوالب', 'Templates workshop'), '#/workshops': tx('الورش التفاعلية', 'Workshops'), '#/automations': tx('ورشة الأتمتة', 'Automations workshop'), '#/studio': tx('استوديو لوحات المعلومات', 'Dashboard Studio'), '#/tour': tx('جولة ClickUp', 'ClickUp tour') };
    return { href: link, label: names[link] || tx('افتح', 'Open'), ic: 'robot' };
  }
  return LESSON[link] ? { href: '#/lesson/' + link, label: LESSON[link].title, ic: 'book' } : null;
}

function viewCourse(main, params) {
  if (params[0] === 'interview') return viewCourseInterview(main);
  if (params[0]) { const T = courseTopics(); const i = T.findIndex(t => t.id === params[0]); return i < 0 ? viewNotFound(main) : viewCourseTopic(main, T, i); }
  const T = courseTopics(); const ids = T.map(t => t.id); const doneN = CourseProgress.count(ids);
  const next = T.find(t => !CourseProgress.has(t.id)) || T[0];
  const pct = Math.round(doneN / T.length * 100);
  const learn = [
    tx('كيف تستخدم ClickUp لإدارة أي مشروع أو فريق', 'How to use ClickUp to manage any project or team'),
    tx('أفضل الممارسات عند العمل في ClickUp', 'Best practices when using ClickUp'),
    tx('حيل ونصائح لتستخدم ClickUp كالمحترفين', 'Tips and tricks to use ClickUp like a pro'),
    tx('كل الميزات الرئيسية في ClickUp وكيف تستخدمها، ومنها الذكاء الاصطناعي والوكلاء', 'All the main ClickUp features and how to use them, including AI and Super Agents')
  ];
  const incl = [
    ['layers', tx('11 قسماً و' + T.length + ' موضوعاً', '11 sections, ' + T.length + ' topics')],
    ['users', tx('تمثيل أدوار: مقابلة عمل', '1 role play: a job interview')],
    ['globe', tx('بالعربية والإنجليزية', 'In Arabic and English')],
    ['mobile', tx('يعمل على الجوال والحاسوب', 'Works on mobile and desktop')],
    ['check', tx('تقدّمك محفوظ على هذا الجهاز', 'Progress saved on this device')],
    ['robot', tx('كليكي تشات بوت يجيب عن أسئلتك', 'Clicky Chatbot answers your questions')]
  ];
  main.innerHTML = '<div class="page course">' +
    '<section class="hx hx-small co-hero" aria-labelledby="coT"><div class="hx-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b3"></span><span class="hx-grid"></span></div>' +
    '<div class="hx-copy"><span class="hero-kicker">' + icon('sparkle', 'icon-sm') + tx('دورة جديدة · إصدار 2026', 'New course · 2026 edition') + '</span><h1 id="coT" tabindex="-1">' + courseTitle() + '</h1>' +
    '<p class="lead">' + tx('دليل ClickUp 4.0 الشامل: من أول مهمة إلى بناء فرق تعمل باستقلالية وإدارة الوكلاء الأذكياء (Super Agents).', 'The complete ClickUp 4.0 blueprint: from your first task to building autonomous teams and managing Super Agents.') + '</p>' +
    '<div class="co-cta"><a class="btn btn-primary btn-lg" href="#/course/' + next.id + '">' + icon('play', 'icon-sm') + (doneN ? tx('تابع: ', 'Continue: ') + esc(next.t) : tx('ابدأ الدورة', 'Start the course')) + '</a></div></div>' +
    '<div class="co-ring" role="img" aria-label="' + tx('أنجزت ' + doneN + ' من ' + T.length, doneN + ' of ' + T.length + ' done') + '" style="--p:' + pct + '"><span class="num">' + pct + '%</span><small>' + tx('تقدّمك', 'your progress') + '</small></div></section>' +
    '<div class="co-top"><section class="panel co-learn"><h2>' + tx('ماذا ستتعلم', 'What you’ll learn') + '</h2><ul>' + learn.map(l => '<li>' + icon('check', 'icon-sm') + '<span>' + l + '</span></li>').join('') + '</ul></section>' +
    '<section class="panel co-incl"><h2>' + tx('تتضمن هذه الدورة', 'This course includes') + '</h2><ul>' + incl.map(x => '<li>' + icon(x[0], 'icon-sm') + '<span>' + x[1] + '</span></li>').join('') + '</ul></section></div>' +
    '<h2 class="co-h">' + tx('محتوى الدورة', 'Course content') + ' <small>' + tx('11 قسماً · ' + T.length + ' موضوعاً · تمثيل أدوار', '11 sections · ' + T.length + ' topics · 1 role play') + '</small></h2>' +
    '<div class="co-secs">' + COURSE_SECTIONS.map((s, si) => {
      const list = T.filter(t => t.sec === s.id); const d = CourseProgress.count(list.map(t => t.id));
      const open = UIState.get('co-open:' + s.id); const isOpen = open == null ? si === 0 : open;
      return '<details class="co-sec" data-sec="' + s.id + '" style="--sc:' + s.c + '"' + (isOpen ? ' open' : '') + '><summary><span class="co-sic">' + icon(s.ic) + '</span><span class="co-st"><b><span class="num">' + (si + 1) + '.</span> ' + tp(s.t) + '</b><small>' + tx(list.length + ' مواضيع · أنجزت ' + d, list.length + ' topics · ' + d + ' done') + '</small></span><span class="co-bar" aria-hidden="true"><i style="width:' + Math.round(d / list.length * 100) + '%"></i></span>' + icon('down', 'icon-sm co-chev') + '</summary>' +
        '<ol class="co-list">' + list.map(t => '<li><a href="#/course/' + t.id + '"' + (CourseProgress.has(t.id) ? ' class="done"' : '') + '><span class="co-n num">' + t.n + '</span><span>' + esc(t.t) + '</span>' + (CourseProgress.has(t.id) ? '<span class="co-ok">' + icon('check', 'icon-sm') + '<span class="visually-hidden">' + tx('تم', 'done') + '</span></span>' : '') + '</a></li>').join('') + '</ol></details>';
    }).join('') +
    '<a class="co-sec co-rp" href="#/course/interview" style="--sc:#0f766e"><span class="co-sic">' + icon('users') + '</span><span class="co-st"><b>' + tx('تمثيل أدوار: مقابلة لوظيفة تعاون في المشاريع', 'Role play: interviewing for a project collaboration role') + '</b><small>' + tx('أثبت خبرتك في ClickUp بخمسة أسئلة مقابلة', 'Show your ClickUp expertise in five interview questions') + '</small></span>' + icon('fwd', 'icon-sm') + '</a></div></div>';
  $$('details.co-sec', main).forEach(d => d.addEventListener('toggle', () => { UIState.set('co-open:' + d.dataset.sec, d.open); if (d.open) Sound.play('tap'); }));
}

function viewCourseTopic(main, T, i) {
  const t = T[i]; const sec = COURSE_SECTIONS.find(s => s.id === t.sec); const prev = T[i - 1], next = T[i + 1];
  const link = courseLink(t.link);
  const paint = () => {
    const done = CourseProgress.has(t.id);
    main.innerHTML = '<div class="page course co-topic" style="--sc:' + sec.c + '">' +
      '<header class="co-head"><div class="breadcrumbs"><a href="#/course">' + tx('دورة ClickUp 4.0', 'ClickUp 4.0 course') + '</a><span aria-hidden="true">/</span><span>' + tp(sec.t) + '</span></div>' +
      '<span class="co-chip">' + icon(sec.ic, 'icon-sm') + tx('الموضوع ' + t.n + ' من ' + T.length, 'Topic ' + t.n + ' of ' + T.length) + '</span>' +
      '<h1 tabindex="-1">' + esc(t.t) + '</h1></header>' +
      '<section class="panel co-what"><span class="co-mascot" aria-hidden="true">' + mascot('mascot-sm') + '</span><div><h2>' + tx('ببساطة', 'In plain words') + '</h2><p>' + esc(t.what) + '</p></div></section>' +
      '<section class="panel co-steps"><h2>' + icon('list', 'icon-sm') + tx('جرّبها خطوة بخطوة', 'Try it step by step') + '</h2><ol>' + t.steps.map((s, k) => '<li style="--k:' + k + '"><span class="num">' + (k + 1) + '</span><p>' + esc(s) + '</p></li>').join('') + '</ol></section>' +
      '<aside class="co-tip">' + icon('bulb') + '<div><b>' + tx('نصيحة المحترفين', 'Pro tip') + '</b><p>' + esc(t.tip) + '</p></div></aside>' +
      '<div class="co-actions">' +
        '<button type="button" class="btn ' + (done ? 'btn-secondary' : 'btn-primary') + '" data-done aria-pressed="' + done + '">' + icon('check', 'icon-sm') + (done ? tx('تم ✓', 'Done ✓') : tx('علّمه «تم»', 'Mark as done')) + '</button>' +
        (link ? '<a class="btn btn-ghost" href="' + link.href + '">' + icon(link.ic, 'icon-sm') + tx('للتعمق: ', 'Go deeper: ') + esc(link.label) + '</a>' : '') +
        '<button type="button" class="btn btn-ghost" data-askc>' + icon('robot', 'icon-sm') + tx('اسأل كليكي عن هذا', 'Ask Clicky about this') + '</button></div>' +
      '<nav class="tour-nav co-nav" aria-label="' + tx('التنقل بين المواضيع', 'Topic navigation') + '">' +
        (prev ? '<a class="btn btn-secondary" href="#/course/' + prev.id + '">' + icon('back', 'icon-sm') + '<span>' + esc(prev.t) + '</span></a>' : '<a class="btn btn-secondary" href="#/course">' + icon('back', 'icon-sm') + '<span>' + tx('محتوى الدورة', 'Course content') + '</span></a>') +
        (next ? '<a class="btn btn-primary" href="#/course/' + next.id + '"><span>' + tx('التالي: ', 'Next: ') + esc(next.t) + '</span>' + icon('fwd', 'icon-sm') + '</a>' : '<a class="btn btn-primary" href="#/course/interview"><span>' + tx('التالي: تمثيل الأدوار', 'Next: the role play') + '</span>' + icon('fwd', 'icon-sm') + '</a>') +
      '</nav></div>';
    $('[data-done]', main).addEventListener('click', () => {
      const on = CourseProgress.toggle(t.id); Sound.play(on ? 'success' : 'tap');
      if (on && CourseProgress.count(T.map(x => x.id)) === T.length && typeof Motion !== 'undefined') Motion.confetti();
      paint(); $('[data-done]', main).focus();
    });
    $('[data-askc]', main).addEventListener('click', () => Clicky.ask(tx('اشرح لي ببساطة: ', 'Explain simply: ') + t.t));
  };
  paint();
}

function viewCourseInterview(main) {
  const Q = COURSE_INTERVIEW.map(q => ({ q: tp(q[0]), a: tp(q[1]) }));
  main.innerHTML = '<div class="page course co-topic" style="--sc:#0f766e">' +
    '<header class="co-head"><div class="breadcrumbs"><a href="#/course">' + tx('دورة ClickUp 4.0', 'ClickUp 4.0 course') + '</a><span aria-hidden="true">/</span><span>' + tx('تمثيل الأدوار', 'Role play') + '</span></div>' +
    '<span class="co-chip">' + icon('users', 'icon-sm') + tx('تمثيل أدوار', 'Role play') + '</span>' +
    '<h1 tabindex="-1">' + tx('مقابلة لوظيفة تعاون في المشاريع: أثبت خبرتك في ClickUp', 'Interviewing for a project collaboration role: show your ClickUp expertise') + '</h1></header>' +
    '<section class="panel co-what"><span class="co-mascot" aria-hidden="true">' + mascot('mascot-sm') + '</span><div><h2>' + tx('كيف تلعبها', 'How to play') + '</h2><p>' + tx('تخيّل أنك في مقابلة عمل وكليكي هو المحاوِر. اقرأ السؤال، اكتب إجابتك أو قلها بصوت عالٍ، ثم اكشف إجابة نموذجية وقارنها. ما تكتبه يبقى في هذه الصفحة فقط ولا يُحفظ.', 'Imagine you are in a job interview and Clicky is the interviewer. Read the question, write your answer or say it out loud, then reveal a model answer and compare. What you type stays on this page only and is not saved.') + '</p></div></section>' +
    '<ol class="co-rp-list">' + Q.map((x, k) => '<li class="panel co-q" data-q="' + k + '"><p class="co-qt"><span class="num">' + (k + 1) + '</span>' + esc(x.q) + '</p>' +
      '<label class="visually-hidden" for="coA' + k + '">' + tx('إجابتك', 'Your answer') + '</label><textarea class="textarea" id="coA' + k + '" rows="3" placeholder="' + tx('اكتب إجابتك هنا…', 'Type your answer here…') + '"></textarea>' +
      '<button type="button" class="btn btn-secondary" data-reveal aria-expanded="false">' + icon('eye', 'icon-sm') + tx('اكشف الإجابة النموذجية', 'Reveal a model answer') + '</button>' +
      '<div class="co-model" hidden><b>' + tx('إجابة نموذجية', 'Model answer') + '</b><p>' + esc(x.a) + '</p><div class="co-rate"><span>' + tx('كيف كانت إجابتك؟', 'How was your answer?') + '</span><button type="button" class="btn btn-ghost" data-rate="good">' + icon('thumb', 'icon-sm') + tx('واثق', 'Confident') + '</button><button type="button" class="btn btn-ghost" data-rate="again">' + icon('replay', 'icon-sm') + tx('أحتاج تدريباً', 'Need practice') + '</button></div></div></li>').join('') + '</ol>' +
    '<p class="co-score" aria-live="polite"></p>' +
    '<nav class="tour-nav co-nav"><a class="btn btn-secondary" href="#/course">' + icon('back', 'icon-sm') + '<span>' + tx('محتوى الدورة', 'Course content') + '</span></a></nav></div>';
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
