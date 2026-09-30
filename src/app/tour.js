/* ==========================================================================
   ClickUp tour: explains the app itself. An interactive map of the ClickUp
   screen, a before/after story of why teams use it, a step-by-step chapter
   for each of the 12 parts (meet it, why you'll love it, how to use it with
   an animated walkthrough, quick check and questions), and a page of the
   questions people ask most.
   ========================================================================== */

const TOUR_SHORT = {
  start: ['Home وInbox', 'Home & Inbox'], structure: ['Spaces وLists', 'Spaces & Lists'], tasks: ['المهام', 'Tasks'], views: ['طرق العرض', 'Views'],
  fields: ['الحقول المخصصة', 'Custom Fields'], collab: ['التعاون', 'Collaboration'], time: ['الوقت والتخطيط', 'Time & planning'], dash: ['لوحات المعلومات', 'Dashboards'],
  auto: ['الأتمتة', 'Automations'], forms: ['النماذج والأهداف', 'Forms & Goals'], share: ['المشاركة', 'Sharing'], power: ['أدوات السرعة', 'Power tools']
};
const tourN = id => TOUR_PARTS.findIndex(p => p.id === id) + 1;
const tourDone = () => TOUR_PARTS.filter(p => Store.isToured(p.id)).length;
const tourNext = () => { const p = TOUR_PARTS.find(x => !Store.isToured(x.id)); return p ? p.id : 'start'; };

/* ---------- The app map: a simplified ClickUp screen with 12 numbered pins ---------- */
function appMap(opts) {
  opts = opts || {};
  const pin = id => opts.pins === false ? '' : '<button type="button" class="am-pin" data-pin="' + id + '" style="' + modStyle(TOUR_PART[id].mod) + '" aria-label="' + tx('الجزء ', 'Part ') + tourN(id) + ': ' + esc(tp(TOUR_PART[id].name)) + '">' + tourN(id) + '</button>';
  const P = (id, cls, inner, first) => '<div class="am-x ' + cls + '" data-part="' + id + '">' + inner + (first ? pin(id) : '') + '</div>';
  const S = (cls, inner) => '<span class="am-x ' + cls + '">' + inner + '</span>';
  const ic = (n, s) => DM.ic(n, s || 13);
  const st = (k) => '<span class="mx-status st-' + k + '">' + STATUS[k].en + '</span>';
  const rows = [
    ['progress', tx('تجهيز التقرير الأسبوعي', 'Prepare the weekly report'), 'noura', tx('الخميس', 'Thu'), 'high', tx('العمليات', 'Operations')],
    ['todo', tx('مراجعة أرقام المبيعات', 'Check the sales figures'), 'salim', tx('الأحد', 'Sun'), 'normal', tx('المالية', 'Finance')],
    ['review', tx('تحديث لوحة الأداء', 'Update the performance board'), 'maryam', tx('اليوم', 'Today'), 'urgent', tx('التسويق', 'Marketing')],
    ['done', tx('إرسال محضر الاجتماع', 'Send the meeting notes'), 'me', tx('أمس', 'Yest.'), 'low', tx('العمليات', 'Operations')]
  ];
  return '<div class="am-wrap" data-am><div class="am' + (opts.focus ? ' has-focus' : '') + '" data-focus="' + (opts.focus || '') + '">' +
    '<div class="am-top">' + S('am-logo', '<i></i><i></i><i></i>') +
    P('power', 'am-search', ic('search') + '<span>Search</span><span class="mx-kbd"><span>Ctrl</span><span>K</span></span>', true) +
    P('power', 'am-ai', ic('sparkle') + '<span>AI</span>') + P('start', 'am-bell', ic('bell') + '<b>3</b>') + S('am-me', DM.av('me', 22)) + '</div>' +
    '<div class="am-body"><aside class="am-side">' + S('am-ws', '<span class="mx-sq">' + tx('ت', 'T') + '</span>' + tx('مساحة عمل التدريب', 'Training Workspace')) +
    P('start', 'am-si', ic('home') + 'Home', true) + P('start', 'am-si', ic('inbox') + 'Inbox<b>3</b>') +
    P('collab', 'am-si', ic('doc') + 'Docs') + P('dash', 'am-si', ic('chart') + 'Dashboards', true) + P('forms', 'am-si', ic('target') + 'Goals', true) +
    S('am-sh', 'Spaces') +
    P('structure', 'am-tree', '<span class="am-si"><span class="mx-sq">' + tx('ع', 'O') + '</span>' + L_OPS() + '</span><span class="am-si sub">' + ic('folder') + tx('متابعة التدقيق', 'Audit follow-up') + '</span><span class="am-si sub on">' + ic('list') + L_WEEKLY() + '</span><span class="am-si sub">' + ic('list') + L_REQ() + '</span>', true) +
    '</aside><section class="am-main"><div class="am-head">' + S('am-crumb', L_OPS() + ' / <b>' + L_WEEKLY() + '</b>') +
    P('auto', 'am-btn', ic('zap') + 'Automate', true) + P('share', 'am-btn am-share', ic('share') + 'Share', true) + '</div>' +
    '<div class="am-tabs">' + P('views', 'am-tab on', ic('list', 12) + 'List', true) + P('views', 'am-tab', ic('board', 12) + 'Board') + P('views', 'am-tab', ic('calendar', 12) + 'Calendar') +
    P('time', 'am-tab', ic('gantt', 12) + 'Gantt') + P('forms', 'am-tab', ic('form', 12) + 'Form') + S('am-tab', '+ View') + '</div>' +
    '<div class="am-table"><div class="am-row am-hr">' + S('', 'Name') + S('', 'Assignee') + S('', 'Due date') + S('', 'Priority') + P('fields', '', ic('table', 11) + tx('الإدارة', 'Department'), true) + '</div>' +
    rows.map((r, i) => '<div class="am-row">' + P('tasks', 'am-name', st(r[0]) + '<span class="txt">' + r[1] + '</span>', i === 0) + S('', DM.av(r[2])) +
      P('time', 'am-due' + (r[3] === tx('اليوم', 'Today') ? ' soon' : ''), ic('calendar', 11) + r[3], i === 0) + S('', DM.pr(r[4])) + P('fields', 'am-chip', r[5]) + '</div>').join('') + '</div>' +
    P('collab', 'am-comment', DM.av('salim') + '<span>' + tx('<b>سالم:</b> <span class="mx-mention">@نورة</span> هل الأرقام نهائية؟', '<b>Salim:</b> <span class="mx-mention">@Noura</span> are the figures final?') + '</span>', true) +
    '</section></div></div></div>';
}
/* Scale the fixed-size map to its container, like the walkthrough stage. */
function fitMap(wrap) {
  const am = $('.am', wrap); if (!am) return () => {};
  const fit = () => { const w = wrap.clientWidth || 860; const s = Math.min(w / 860, 1); am.style.transform = 'scale(' + s + ')'; wrap.style.height = Math.round(480 * s) + 'px'; am.style.setProperty('--inv', Math.min(1 / s, 2.2).toFixed(2)); };
  fit(); const ro = new ResizeObserver(fit); ro.observe(wrap);
  return () => ro.disconnect();
}
function focusMap(wrap, id) {
  const am = $('.am', wrap);
  am.classList.toggle('has-focus', !!id);
  $$('[data-part]', am).forEach(el => el.classList.toggle('am-on', el.dataset.part === id));
  $$('.am-pin', am).forEach(el => el.classList.toggle('on', el.dataset.pin === id));
  if (id) am.style.cssText += ';' + modStyle(TOUR_PART[id].mod);
}

/* ---------- Before / after: why teams move to ClickUp ---------- */
function beforeAfter() {
  const chips = [
    ['message', tx('بريد: «رد: رد: من يجهّز التقرير؟»', 'Email: “Re: Re: who’s doing the report?”'), '-190px', '-92px', '-6deg'],
    ['table', 'tracker_v7_FINAL.xlsx', '170px', '-104px', '5deg'],
    ['users', tx('محادثة: «متى الموعد؟»', 'Chat: “when is it due?”'), '-210px', '40px', '4deg'],
    ['bookmark', tx('ورقة لاصقة: «الخميس؟»', 'Sticky note: “Thursday?”'), '190px', '26px', '-4deg'],
    ['bell', tx('مكالمة فائتة: «هل انتهيت؟»', 'Missed call: “is it done?”'), '-10px', '112px', '2deg']
  ];
  return '<div class="ba" data-ba><div class="ba-stage" aria-hidden="true">' +
    chips.map((c, i) => '<span class="ba-chip" style="--x:' + c[2] + ';--y:' + c[3] + ';--r:' + c[4] + ';--i:' + i + '">' + icon(c[0], 'icon-sm') + '<span>' + c[1] + '</span></span>').join('') +
    '<div class="ba-card"><div class="ba-f ba-title">' + icon('checklist', 'icon-sm') + '<b>' + tx('تجهيز التقرير الأسبوعي', 'Prepare the weekly report') + '</b></div>' +
    '<div class="ba-f"><span>' + tx('المسؤول', 'Assignee') + '</span><span>' + DM.av('noura', 22) + ' ' + PN('noura') + '</span></div>' +
    '<div class="ba-f"><span>' + tx('الموعد', 'Due date') + '</span><span>' + icon('calendar', 'icon-sm') + tx('الخميس', 'Thursday') + '</span></div>' +
    '<div class="ba-f"><span>' + tx('الحالة', 'Status') + '</span><span class="mx-status st-progress">IN PROGRESS</span></div>' +
    '<div class="ba-f"><span>' + tx('الأولوية', 'Priority') + '</span><span>' + DM.pr('high') + '</span></div>' +
    '<div class="ba-f"><span>' + tx('النقاش والملفات', 'Comments & files') + '</span><span>' + icon('message', 'icon-sm') + '3 · ' + icon('clip', 'icon-sm') + '1</span></div></div></div>' +
    '<div class="ba-ctrl"><div class="seg" role="group" aria-label="' + tx('قارن', 'Compare') + '"><button type="button" data-ba-set="before" aria-pressed="true">' + tx('بدون ClickUp', 'Without ClickUp') + '</button><button type="button" data-ba-set="after" aria-pressed="false">' + tx('مع ClickUp', 'With ClickUp') + '</button></div>' +
    '<p class="ba-cap" aria-live="polite"></p></div></div>';
}
function bindBeforeAfter(root) {
  const el = $('[data-ba]', root); if (!el) return () => {};
  const caps = {
    before: tx('بدون ClickUp: العمل متفرّق بين البريد والجداول والمحادثات، ولا أحد متأكد من المسؤول أو الموعد.', 'Without ClickUp: work is scattered across email, spreadsheets and chats, and nobody is sure who owns it or when it is due.'),
    after: tx('مع ClickUp: مهمة واحدة تجمع المسؤول والموعد والحالة والأولوية والنقاش والملفات، ويراها الجميع.', 'With ClickUp: one task holds the owner, due date, status, priority, conversation and files, and everyone can see it.')
  };
  let touched = false, timer = null;
  const set = (k, user) => {
    if (user) touched = true;
    el.classList.toggle('after', k === 'after');
    $$('[data-ba-set]', el).forEach(b => b.setAttribute('aria-pressed', b.dataset.baSet === k));
    $('.ba-cap', el).textContent = caps[k];
    UIState.set('ba', k);
  };
  set(UIState.get('ba') || 'before');
  el.addEventListener('click', e => { const b = e.target.closest('[data-ba-set]'); if (b) set(b.dataset.baSet, true); });
  let io = null;
  if (!UIState.get('ba') || UIState.get('ba') === 'before') {
    if (!prefersReducedMotion() && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(en => { if (en[0].isIntersecting) { io.disconnect(); timer = setTimeout(() => { if (!touched) set('after'); }, 1600); } }, { threshold: .5 });
      io.observe(el);
    }
  }
  return () => { if (io) io.disconnect(); clearTimeout(timer); };
}

/* ---------- Tour overview ---------- */
function viewTour(main, params) {
  if (params[0]) return TOUR_PART[params[0]] ? viewTourPart(main, params[0]) : viewNotFound(main);
  const done = tourDone();
  main.innerHTML = '<div class="page">' +
    '<section class="hero-x tour-hero" aria-labelledby="tourTitle"><div class="hero-art" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><span class="grid-lines"></span></div><div>' +
    '<span class="hero-kicker">' + icon('compass', 'icon-sm') + tx('جولة ClickUp · 12 جزءاً · خطوة بخطوة', 'ClickUp tour · 12 parts · step by step') + '</span>' +
    '<h1 id="tourTitle" tabindex="-1">' + tx('تعرّف على <span class="grad-text">ClickUp</span>: كل عمل الفريق في مكان واحد', 'Meet <span class="grad-text">ClickUp</span>: all your team’s work in one place') + '</h1>' +
    '<p class="lead">' + tx('جولة مصورة ومتحركة تشرح كل جزء من التطبيق: ما هو، ولماذا ستحبه، وكيف تستخدمه خطوة بخطوة.', 'An animated, visual tour of every part of the app: what it is, why you will love it and how to use it, step by step.') + '</p>' +
    '<div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/tour/' + tourNext() + '">' + icon('rocket') + (done ? tx('تابع الجولة', 'Continue the tour') : tx('ابدأ الجولة', 'Start the tour')) + '</a>' +
    '<a class="btn btn-secondary btn-lg" href="#/questions">' + icon('message') + tx('الأسئلة الشائعة', 'Common questions') + '</a></div>' +
    '<p class="tour-count">' + ring(Math.round(done / 12 * 100), { size: 40, stroke: 5, color: '#ffc800', track: 'rgb(255 255 255 / .18)' }) + '<span class="num">' + tx(done + ' من 12 جزءاً مكتشفاً', done + ' of 12 parts explored') + '</span></p></div>' +
    '<div class="icon-cloud" aria-hidden="true">' + TOUR_PARTS.map((p, i) => '<span class="ic-float" style="' + modStyle(p.mod) + ';--i:' + i + '">' + icon(p.icon) + '</span>').join('') + '</div></section>' +

    '<section class="section" aria-labelledby="mapT"><div class="section-head"><h2 id="mapT">' + tx('استكشف الشاشة', 'Explore the screen') + '</h2><p>' + tx('هذه شاشة ClickUp مبسّطة. اضغط أي رقم لتعرف ما هذا الجزء، أو شغّل الجولة لتتنقل بينها تلقائياً.', 'This is a simplified ClickUp screen. Press any number to learn what that part is, or play the tour to move through them automatically.') + '</p></div>' +
    '<div class="panel map-panel" data-rv><div class="map-bar"><button type="button" class="btn btn-primary btn-sm" data-am-play>' + icon('play', 'icon-sm') + '<span>' + tx('شغّل الجولة', 'Play the tour') + '</span></button><span class="chip chip-sim">' + icon('eye', 'icon-sm') + tx('محاكاة تعليمية مبسّطة', 'Simplified educational simulation') + '</span></div>' +
    appMap() + '<div class="am-tip" data-am-tip aria-live="polite"></div></div></section>' +

    '<section class="section" aria-labelledby="partsT"><div class="section-head"><h2 id="partsT">' + tx('أجزاء ClickUp الاثنا عشر', 'The 12 parts of ClickUp') + '</h2><p>' + tx('كل جزء في أربع خطوات قصيرة: تعرّف، ولماذا، وكيف، وتحقّق.', 'Each part in four short steps: meet it, why, how, and check.') + '</p></div><div class="tour-grid">' +
    TOUR_PARTS.map((p, i) => '<a class="tour-card' + (Store.isToured(p.id) ? ' seen' : '') + '" data-rv href="#/tour/' + p.id + '" style="' + modStyle(p.mod) + '"><span class="tc-top"><span class="ic-tile">' + icon(p.icon) + '</span><span class="tc-n num">' + (i + 1) + '</span>' + (Store.isToured(p.id) ? '<span class="tc-seen">' + icon('check', 'icon-sm') + '<span class="visually-hidden">' + tx('مكتشف', 'Explored') + '</span></span>' : '') + '</span><strong>' + tp(p.name) + '</strong><p>' + tp(p.one) + '</p><span class="tc-go">' + tx('ابدأ هذا الجزء', 'Start this part') + icon('fwd', 'icon-sm') + '</span></a>').join('') + '</div></section>' +

    '<p class="h-center tour-more">' + icon('message', 'icon-sm') + tx('لديك سؤال؟ ', 'Got a question? ') + '<a href="#/questions">' + tx('اقرأ الأسئلة الشائعة', 'Read the common questions') + '</a></p>' +
    '</div>';

  // Map interactions
  const panel = $('.map-panel', main); const wrap = $('[data-am]', panel); const tip = $('[data-am-tip]', panel);
  const stopFit = fitMap(wrap);
  const showTip = id => {
    const p = TOUR_PART[id];
    focusMap(wrap, id);
    tip.style.cssText = modStyle(p.mod);
    tip.innerHTML = '<span class="ic-tile">' + icon(p.icon) + '</span><div><p class="am-tip-n num">' + tx('الجزء ', 'Part ') + tourN(id) + tx(' من 12', ' of 12') + '</p><h3>' + tp(p.name) + '</h3><p>' + tp(p.one) + '</p><p class="tip-where">' + icon('compass', 'icon-sm') + '<span>' + tp(p.where) + '</span></p></div><a class="btn btn-primary btn-sm" href="#/tour/' + id + '">' + tx('تعلّم هذا الجزء', 'Learn this part') + icon('fwd', 'icon-sm') + '</a>';
    tip.classList.remove('tip-in'); void tip.offsetWidth; tip.classList.add('tip-in');
    UIState.set('am-sel', id);
  };
  const idle = () => { focusMap(wrap, null); tip.innerHTML = '<p class="muted">' + icon('cursor', 'icon-sm') + ' ' + tx('اضغط رقماً على الشاشة لتبدأ.', 'Press a number on the screen to begin.') + '</p>'; };
  UIState.get('am-sel') ? showTip(UIState.get('am-sel')) : idle();
  let playT = null; const playBtn = $('[data-am-play]', panel);
  const stop = () => { clearInterval(playT); playT = null; playBtn.innerHTML = icon('play', 'icon-sm') + '<span>' + tx('شغّل الجولة', 'Play the tour') + '</span>'; };
  const play = () => {
    let i = Math.max(0, TOUR_PARTS.findIndex(p => p.id === UIState.get('am-sel')) + 1) % 12;
    showTip(TOUR_PARTS[i].id);
    playT = setInterval(() => { i++; if (i >= 12) { stop(); return; } showTip(TOUR_PARTS[i].id); }, 3200);
    playBtn.innerHTML = icon('pause', 'icon-sm') + '<span>' + tx('إيقاف', 'Pause') + '</span>';
  };
  playBtn.addEventListener('click', () => playT ? stop() : play());
  wrap.addEventListener('click', e => {
    const pn = e.target.closest('[data-pin]'); const reg = e.target.closest('[data-part]');
    const id = pn ? pn.dataset.pin : reg ? reg.dataset.part : null;
    if (id) { stop(); showTip(id); }
  });
  return () => { stop(); stopFit(); };
}

/* ---------- One part of the tour, in four steps ---------- */
function viewTourPart(main, id) {
  const p = TOUR_PART[id]; const n = tourN(id); const L = LESSON[p.lesson];
  const prevP = TOUR_PARTS[n - 2], nextP = TOUR_PARTS[n];
  const STEPS = [['eye', tx('تعرّف', 'Meet it')], ['bulb', tx('لماذا ستحبه', 'Why you’ll love it')], ['play', tx('كيف تستخدمه', 'How to use it')], ['assess', tx('تحقّق وأسئلة', 'Check & questions')]];
  const key = 'tstep:' + id;
  let step = UIState.get(key) || 0, player = null, stopFit = () => {}, faqOff = () => {};
  main.innerHTML = '<div class="page tour-part" style="' + modStyle(p.mod) + '">' +
    '<header class="lesson-hero"><span class="lh-art" aria-hidden="true">' + icon(p.icon) + '</span><div class="breadcrumbs"><a href="#/tour">' + tx('جولة ClickUp', 'ClickUp tour') + '</a><span aria-hidden="true">/</span><span class="num">' + tx('الجزء ' + n + ' من 12', 'Part ' + n + ' of 12') + '</span></div>' +
    '<h1 id="tpTitle" tabindex="-1">' + tp(p.name) + '</h1><div class="lh-progress" data-tp-prog></div>' +
    '<nav class="tp-dots" aria-label="' + tx('أجزاء الجولة', 'Tour parts') + '">' + TOUR_PARTS.map((x, i) => '<a href="#/tour/' + x.id + '"' + (x.id === id ? ' aria-current="page"' : '') + (Store.isToured(x.id) ? ' class="seen"' : '') + ' aria-label="' + tx('الجزء ', 'Part ') + (i + 1) + ': ' + esc(tp(TOUR_SHORT[x.id])) + '" title="' + esc(tp(TOUR_SHORT[x.id])) + '"><span class="num">' + (i + 1) + '</span></a>').join('') + '</nav></header>' +
    '<div class="tour-steps" role="group" aria-label="' + tx('خطوات هذا الجزء', 'Steps in this part') + '">' + STEPS.map((s, i) => '<button type="button" data-tstep="' + i + '"><span class="ts-n num">' + (i + 1) + '</span>' + icon(s[0], 'icon-sm') + '<span>' + s[1] + '</span></button>').join('') + '</div>' +
    '<section class="panel tour-panel" data-tp aria-live="polite"></section>' +
    '<nav class="tour-nav" aria-label="' + tx('التنقل بين الخطوات', 'Step navigation') + '"><button type="button" class="btn btn-secondary" data-tgo="-1">' + icon('back', 'icon-sm') + '<span></span></button><button type="button" class="btn btn-primary" data-tgo="1"><span></span>' + icon('fwd', 'icon-sm') + '</button></nav></div>';

  const panel = $('[data-tp]', main);
  const faqs = CU_FAQ.filter(f => f.part === id);
  const body = i => {
    if (i === 0) return '<div class="tp-meet"><div><p class="tp-kicker">' + tx('ما هذا؟', 'What is it?') + '</p><h2>' + tp(p.name) + '</h2><p class="tp-lead">' + tp(p.one) + '</p>' +
      '<p class="tp-where">' + icon('compass', 'icon-sm') + '<span><b>' + tx('أين تجده: ', 'Where to find it: ') + '</b>' + tp(p.where) + '</span></p></div><div class="tp-map">' + appMap({ focus: id, pins: false }) + '</div></div>';
    if (i === 1) return '<p class="tp-kicker">' + tx('لماذا ستحبه؟', 'Why you’ll love it') + '</p><h2>' + tx('ثلاثة أسباب تجعل ', 'Three reasons ') + tp(TOUR_SHORT[id]) + tx(' يسهّل يومك', ' make your day easier') + '</h2><div class="tp-why">' +
      p.why.map((w, k) => '<div class="tp-why-card" style="--k:' + k + '"><span class="medal">' + icon(w[0]) + '</span><p>' + tp(w[1]) + '</p></div>').join('') + '</div>';
    if (i === 2) return '<p class="tp-kicker">' + tx('كيف تستخدمه؟', 'How do I use it?') + '</p><h2>' + tx('خطوة بخطوة', 'Step by step') + '</h2><div class="tp-how"><ol class="tp-steps">' +
      p.how.map((h, k) => '<li style="--k:' + k + '"><span class="num">' + (k + 1) + '</span><p>' + tp(h) + '</p></li>').join('') + '</ol>' +
      '<div><p class="tp-watch">' + icon('play', 'icon-sm') + tx('شاهدها تحدث أمامك:', 'Watch it happen:') + '</p><div data-tp-demo></div></div></div>' +
      (id === 'auto' ? '<a class="au-banner au-banner-sm" href="#/automations"><span class="au-bn-robot" aria-hidden="true">' + icon('robot') + '</span><span class="au-bn-text"><b>' + tx('ابنِ أتمتة بنفسك', 'Build one yourself') + '</b><span>' + tx('افتح ورشة الأتمتة وجرّبها على مهمة تجريبية.', 'Open the Automations workshop and test it on a sample task.') + '</span></span>' + icon('fwd') + '</a>' : '') +
      '<p class="help-text">' + tx('تريد أن تجرّب بنفسك؟', 'Want to try it yourself?') + ' <a href="#/lab">' + tx('افتح مختبر التطبيق', 'Open the Practice Lab') + '</a></p>';
    return '<div class="tp-check"><div><p class="tp-kicker">' + tx('سؤال سريع', 'Quick check') + '</p><h2>' + tx('هل فهمت الفكرة؟', 'Did you get it?') + '</h2><div data-tp-quiz></div></div>' +
      '<div><p class="tp-kicker">' + tx('أسئلة يطرحها الناس', 'Questions people ask') + '</p><div class="cuq-list">' + faqs.map(faqItem).join('') + '</div>' +
      '<p class="tp-kicker" style="margin-top:18px">' + tx('تعمّق أكثر', 'Go deeper') + '</p><ul class="tp-lessons">' + p.lessons.map(lid => '<li><a href="#/lesson/' + lid + '">' + icon('book', 'icon-sm') + t(LESSON[lid].title) + '</a></li>').join('') + '</ul></div></div>';
  };
  const paint = (dir) => {
    if (dir) Sound.play('whoosh');
    if (player) { player.destroy(); player = null; } stopFit(); faqOff(); faqOff = () => {};
    panel.innerHTML = '<div class="tp-body' + (dir ? ' tp-in' : '') + '" style="--dir:' + (dir || 1) + '">' + body(step) + '</div>';
    $$('[data-tstep]', main).forEach(b => { const k = +b.dataset.tstep; b.setAttribute('aria-current', k === step ? 'step' : 'false'); b.classList.toggle('done', k < step || (k === 3 && Store.isToured(id))); });
    $('[data-tp-prog]', main).innerHTML = '<span class="lh-bar" aria-hidden="true"><i style="width:' + ((step + 1) / 4 * 100) + '%"></i></span><span class="num">' + tx('الخطوة ' + (step + 1) + ' من 4', 'Step ' + (step + 1) + ' of 4') + '</span>';
    const back = $('[data-tgo="-1"]', main), fwd = $('[data-tgo="1"]', main);
    back.hidden = step === 0 && !prevP;
    $('span', back).textContent = step === 0 ? tx('الجزء السابق', 'Previous part') : tx('السابق', 'Back');
    $('span', fwd).textContent = step < 3 ? tx('التالي: ', 'Next: ') + STEPS[step + 1][1] : nextP ? tx('الجزء التالي: ', 'Next part: ') + tp(TOUR_SHORT[nextP.id]) : tx('العودة إلى الجولة', 'Back to the tour');
    if (step === 0) { const w = $('[data-am]', panel); stopFit = fitMap(w); focusMap(w, id); }
    if (step === 2) player = new DemoPlayer($('[data-tp-demo]', panel), L.demo, { key: 'tour-' + id });
    if (step === 3) {
      faqOff = bindFaqDemos(panel);
      const q = L.check && L.check[0];
      if (q) renderQuiz($('[data-tp-quiz]', panel), [q], 'tour-q-' + id, { onSubmit: (s, total) => { if (s === total) Motion.confetti($('[data-tp-quiz]', panel), 45); } });
      if (Store.tourSeen(id)) {
        const all = tourDone() === 12;
        toast(all ? tx('رائع! اكتشفت أجزاء ClickUp الاثني عشر كلها', 'Amazing! You explored all 12 parts of ClickUp') : tx('اكتشفت جزء «' + tp(TOUR_SHORT[id]) + '»', 'You explored “' + tp(TOUR_SHORT[id]) + '”'));
        if (all) Motion.confetti(null, 120);
        const chip = main.querySelector('.tp-dots [aria-current]'); if (chip) chip.classList.add('seen');
        $$('[data-tstep]', main)[3].classList.add('done');
      }
    }
    UIState.set(key, step);
  };
  const go = (d) => {
    const to = step + d;
    if (to < 0) { if (prevP) location.hash = '#/tour/' + prevP.id; return; }
    if (to > 3) { location.hash = nextP ? '#/tour/' + nextP.id : '#/tour'; return; }
    step = to; paint(d);
    const top = panel.getBoundingClientRect().top;
    if (top < 70 || top > window.innerHeight * .6) $('.tour-steps', main).scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    const h = $('h2', panel); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  };
  paint(0);
  main.addEventListener('click', e => {
    const s = e.target.closest('[data-tstep]'); if (s) { const to = +s.dataset.tstep; if (to !== step) { const d = to > step ? 1 : -1; step = to; paint(d); } return; }
    const g = e.target.closest('[data-tgo]'); if (g) go(+g.dataset.tgo);
  });
  return () => { if (player) player.destroy(); stopFit(); faqOff(); };
}

/* ---------- Answers you can watch ----------
   Opening a question plays the matching lesson's animated walkthrough right
   inside the answer (one open at a time), or offers the hands-on workshop. */
function faqItem(f) {
  const p = TOUR_PART[f.part];
  const isWs = f.go && (f.go.indexOf('#/workshops') === 0 || f.go === '#/automations');
  return '<details class="cuq" data-fid="' + f.id + '" style="' + modStyle(p.mod) + '"><summary>' + icon('help', 'icon-sm') + '<span>' + tp(f.q) + '</span><span class="chev">' + icon('fwd', 'icon-sm') + '</span></summary><div class="cuq-a"><p>' + tp(f.a) + '</p>' +
    (f.demo ? '<p class="cuq-watch">' + icon('play', 'icon-sm') + tx('شاهدها تحدث:', 'Watch it happen:') + '</p><div class="cuq-demo" data-cdemo="' + f.demo + '"></div>'
      : '<a class="cuq-visual" href="' + f.go + '"><span class="ic-tile" style="--tc:' + MODULE_COLORS[p.mod].c + '">' + icon(isWs ? 'robot' : p.icon) + '</span><span><b>' + (isWs ? tx('تعلّمها بيدك', 'Learn it hands-on') : tp(TOUR_SHORT[f.part])) + '</b><small>' + (isWs ? tx('افتح الورشة وجرّبها خطوة بخطوة.', 'Open the workshop and try it step by step.') : tx('شاهد هذا الجزء في جولة ClickUp.', 'See this part in the ClickUp tour.')) + '</small></span>' + icon('fwd', 'icon-sm') + '</a>') +
    '<div class="cuq-links">' + (f.demo && f.go ? '<a class="cuq-show" href="' + f.go + '">' + icon('robot', 'icon-sm') + tx('جرّبها في الورشة', 'Try it in the workshop') + '</a>' : '') +
    (f.demo ? '<a class="cuq-show alt" href="#/lesson/' + f.demo + '">' + icon('book', 'icon-sm') + tx('الدرس كاملاً', 'Full lesson') + '</a>' : '') +
    '<a class="cuq-show alt" href="#/tour/' + f.part + '">' + icon('compass', 'icon-sm') + tx('في الجولة', 'In the tour') + '</a></div></div></details>';
}
function bindFaqDemos(root, onOpen) {
  const players = new Map();
  const onToggle = e => {
    const d = e.target; if (!d.matches || !d.matches('details.cuq[data-fid]')) return;
    if (d.open) {
      $$('details.cuq[data-fid][open]', root).forEach(o => { if (o !== d) o.open = false; });
      const box = $('[data-cdemo]', d); const L = box && LESSON[box.dataset.cdemo];
      if (L && L.demo && !players.has(d)) players.set(d, new DemoPlayer(box, L.demo, { autoplay: true }));
    } else if (players.has(d)) { players.get(d).destroy(); players.delete(d); const box = $('[data-cdemo]', d); if (box) { box.innerHTML = ''; box.className = 'cuq-demo'; } }
    if (onOpen) onOpen();
  };
  root.addEventListener('toggle', onToggle, true);
  $$('details.cuq[data-fid][open]', root).forEach(d => onToggle({ target: d }));
  return () => { players.forEach(p => p.destroy()); players.clear(); root.removeEventListener('toggle', onToggle, true); };
}

/* ---------- The questions people ask most ---------- */
function viewQuestions(main) {
  const st = UIState.get('cuq') || { q: '', part: '', open: null };
  main.innerHTML = '<div class="page page-narrow cuq-page"><div class="cuq-hero"><div><h1 tabindex="-1">' + tx('أكثر ما يسأل عنه موظفو Omantel', 'What Omantel employees ask most') + '</h1><p>' + tx('اضغط أي سؤال: تظهر الإجابة ومعها عرض متحرك يريك كيف تفعلها في ClickUp.', 'Tap any question: the answer opens with a short animation that shows you how to do it in ClickUp.') + '</p></div>' + mascot() + '</div>' +
    '<div class="panel cuq-tools"><div class="field grow"><label for="cuqQ">' + tx('ابحث في الأسئلة', 'Search the questions') + '</label><input class="input" id="cuqQ" type="search" placeholder="' + tx('مثل: الإشعارات أو Excel', 'For example: notifications or Excel') + '" value="' + esc(st.q) + '"></div>' +
    '<div class="cuq-cats" role="group" aria-label="' + tx('التصنيفات', 'Categories') + '"><button type="button" data-cat="" aria-pressed="' + !st.part + '">' + tx('الكل', 'All') + '</button>' +
    TOUR_PARTS.filter(p => CU_FAQ.some(f => f.part === p.id)).map(p => '<button type="button" data-cat="' + p.id + '" style="' + modStyle(p.mod) + '" aria-pressed="' + (st.part === p.id) + '">' + icon(p.icon, 'icon-sm') + tp(TOUR_SHORT[p.id]) + '</button>').join('') + '</div></div>' +
    '<p class="filter-summary" id="cuqCount" aria-live="polite"></p><div data-cuq></div>' +
    '<div class="panel panel-pad cuq-more"><span class="ic-tile" style="--tc:#14b8a6">' + icon('users') + '</span><div><h2>' + tx('لم تجد سؤالك؟', 'Didn’t find your question?') + '</h2><p class="small muted">' + tx('اسأله في المنتدى ليجيبك الزملاء، أو اسأل الفريق مباشرة.', 'Ask it in the forum so colleagues can answer, or ask the team directly.') + '</p></div><a class="btn btn-primary" href="#/forum">' + icon('message', 'icon-sm') + tx('المنتدى', 'Forum') + '</a><a class="btn btn-secondary" href="#/support">' + tx('اسأل الفريق', 'Ask the team') + '</a></div></div>';
  let off = () => {};
  const paint = () => {
    off();
    const q = st.q.trim().toLowerCase();
    const list = CU_FAQ.filter(f => (!st.part || f.part === st.part) && (!q || (tp(f.q) + ' ' + tp(f.a) + ' ' + tp(TOUR_SHORT[f.part])).toLowerCase().includes(q)));
    $('#cuqCount').textContent = tx(list.length + ' سؤالاً', nEn(list.length, 'question'));
    const box = $('[data-cuq]', main);
    if (!list.length) { box.innerHTML = '<div class="panel empty-state">' + icon('search') + '<p>' + tx('لا يوجد سؤال مطابق. جرّب كلمة أخرى أو اسأل في المنتدى.', 'No matching question. Try another word or ask in the forum.') + '</p></div>'; return; }
    box.innerHTML = TOUR_PARTS.filter(p => list.some(f => f.part === p.id)).map(p => '<section class="cuq-group" style="' + modStyle(p.mod) + '" aria-labelledby="cg-' + p.id + '"><header><span class="ic-tile">' + icon(p.icon) + '</span><h2 id="cg-' + p.id + '">' + tp(TOUR_SHORT[p.id]) + '</h2></header>' +
      list.filter(f => f.part === p.id).map(faqItem).join('') + '</section>').join('');
    if (st.open) { const d = box.querySelector('[data-fid="' + st.open + '"]'); if (d) d.open = true; }
    off = bindFaqDemos(box, () => { const o = box.querySelector('details.cuq[open]'); st.open = o ? o.dataset.fid : null; UIState.set('cuq', st); });
  };
  paint();
  main.addEventListener('input', debounce(e => { if (e.target.id === 'cuqQ') { st.q = e.target.value; UIState.set('cuq', st); paint(); } }, 140));
  main.addEventListener('click', e => { const c = e.target.closest('[data-cat]'); if (c) { st.part = c.dataset.cat; UIState.set('cuq', st); $$('[data-cat]', main).forEach(b => b.setAttribute('aria-pressed', b === c)); paint(); } });
  return () => off();
}
