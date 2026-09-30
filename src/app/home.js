/* ==========================================================================
   Home. One clear message, one big piece of living art, and three simple
   choices. Everything else lives one click away.
   ========================================================================== */

/* The hero art: a small ClickUp world built from HTML, not an image, so it
   speaks both languages and moves. Layers drift gently with the pointer. */
function heroArt() {
  const card = (w, c, av) => '<span class="hb-card"><i style="width:' + w + '%"></i><i style="width:' + (w - 25) + '%"></i><b style="background:' + c + '">' + av + '</b></span>';
  return '<div class="hx-art" aria-hidden="true">' +
    '<div class="hx-layer" data-depth="8"><div class="hb-win"><div class="hb-bar"><i></i><i></i><i></i><span>Board</span></div><div class="hb-cols">' +
      '<div class="hb-col"><span class="hb-h" style="--c:#87909e">TO DO</span>' + card(80, '#ff7a45', 'S') + card(65, '#1fb6e0', 'M') + '</div>' +
      '<div class="hb-col"><span class="hb-h" style="--c:#4f86f7">IN PROGRESS</span>' + card(70, '#a855f7', 'A') + '</div>' +
      '<div class="hb-col"><span class="hb-h" style="--c:#22c38e">COMPLETE</span>' + card(75, '#22c38e', 'K') + '</div>' +
      '<span class="hb-mover"><span class="hb-card hb-live"><span class="hb-st"><em class="s1">TO DO</em><em class="s2">IN PROGRESS</em><em class="s3">COMPLETE</em></span><i style="width:85%"></i><b style="background:#e44bb6">N</b></span></span>' +
    '</div></div></div>' +
    '<div class="hx-layer hx-l-task" data-depth="22"><div class="hx-float f1"><div class="hx-task"><span class="ht-top">' + icon('checklist', 'icon-sm') + '<b>' + tx('تجهيز التقرير الأسبوعي', 'Prepare the weekly report') + '</b></span>' +
      '<span class="ht-row"><span class="ht-av" style="background:#e44bb6">N</span><span class="ht-chip">' + icon('calendar', 'icon-sm') + tx('الخميس', 'Thu') + '</span><span class="ht-chip ht-flag">' + icon('flag', 'icon-sm') + 'High</span></span>' +
      '<span class="ht-prog"><i></i></span></div></div></div>' +
    '<div class="hx-layer hx-l-donut" data-depth="30"><div class="hx-float f2"><div class="hx-donut"><span class="num">75%</span></div><small>' + tx('أُنجز هذا الأسبوع', 'Done this week') + '</small></div></div>' +
    '<div class="hx-layer hx-l-chat" data-depth="16"><div class="hx-float f3"><div class="hx-chat"><span class="ht-av" style="background:#ff7a45">S</span><span>' + tx('عمل رائع <b>@أشجان</b>!', 'Great work <b>@Ashjan</b>!') + '</span></div></div></div>' +
    '<div class="hx-layer hx-l-check" data-depth="36"><div class="hx-check">' + icon('check') + '</div></div>' +
    '<div class="hx-layer hx-l-bell" data-depth="26"><div class="hx-bell">' + icon('bell') + '<b>3</b></div></div>' +
    '<div class="hx-layer hx-l-zap" data-depth="40"><div class="hx-float f2"><div class="hx-zap">' + icon('zap') + '</div></div></div>' +
    '<span class="hx-shape s-ring" data-depth="12"></span><span class="hx-shape s-tri" data-depth="34"></span><span class="hx-shape s-dot" data-depth="20"></span>' +
    '<svg class="hx-shape s-squig" data-depth="28" viewBox="0 0 80 24"><path d="M2 12c8-12 14 12 22 0s14 12 22 0 14 12 22 0 8-6 10-4" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>' +
    '</div>';
}
function bindParallax(root) {
  const art = $('.hx-art', root);
  if (!art || prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const layers = $$('[data-depth]', art); let raf = 0, tx0 = 0, ty0 = 0;
  const hero = art.closest('.hx');
  const move = e => {
    const r = hero.getBoundingClientRect();
    tx0 = ((e.clientX - r.left) / r.width - .5); ty0 = ((e.clientY - r.top) / r.height - .5);
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; layers.forEach(l => { const d = +l.dataset.depth; l.style.translate = (-tx0 * d).toFixed(1) + 'px ' + (-ty0 * d).toFixed(1) + 'px'; }); });
  };
  const leave = () => layers.forEach(l => { l.style.translate = '0 0'; });
  hero.addEventListener('pointermove', move); hero.addEventListener('pointerleave', leave);
  return () => { hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); };
}

function viewHome(main) {
  const next = nextLessonId();
  const last = Store.state.last && LESSON[Store.state.last.lesson] ? LESSON[Store.state.last.lesson] : null;
  const done = LESSONS.filter(l => Store.isDone(l.id)).length;
  const toured = tourDone();
  const started = done > 0 || toured > 0 || !!last;
  const WAYS = [
    { href: '#/tour', g: 'linear-gradient(140deg,#ff02f0 0%,#ff5f7e 55%,#ffb13d 100%)', icon: 'compass', tag: tx('ابدأ من هنا', 'Start here'),
      t: tx('خذ جولة في ClickUp', 'Take the ClickUp tour'), d: tx('تعرّف على كل جزء من التطبيق في 4 خطوات سهلة ومتحركة.', 'Meet every part of the app in 4 easy, animated steps.'),
      art: '<div class="w-screen"><i></i><i></i><i></i><span class="w-pin" style="--x:22%;--y:30%">1</span><span class="w-pin" style="--x:64%;--y:22%">2</span><span class="w-pin" style="--x:44%;--y:66%">3</span></div>' },
    { href: next ? lessonLink(next) : '#/library', g: 'linear-gradient(140deg,#6a3ef6 0%,#8930fd 45%,#49ccf9 100%)', icon: 'book', tag: tx(LESSONS.length + ' درساً قصيراً', LESSONS.length + ' short lessons'),
      t: tx('تعلّم خطوة بخطوة', 'Learn step by step'), d: tx('شاهد، افهم، تدرّب، ثم تحقّق. درس قصير في كل مرة.', 'Watch, understand, practise, then check. One short lesson at a time.'),
      art: '<div class="w-stack"><span></span><span></span><span><b>' + icon('play') + '</b></span></div>' },
    { href: '#/lab', g: 'linear-gradient(140deg,#0fb5a3 0%,#1fb6e0 55%,#4f86f7 100%)', icon: 'flask', tag: tx('بيانات وهمية آمنة', 'Safe sample data'),
      t: tx('جرّب بنفسك', 'Try it yourself'), d: tx('مساحة تدريب تشبه ClickUp: أنشئ مهام وحرّكها دون خوف من الخطأ.', 'A ClickUp-style practice space: create and move tasks with no fear of mistakes.'),
      art: '<div class="w-board"><span></span><span></span><span></span><i></i></div>' }
  ];
  const faqs = ['start-where', 'weekly-repeat', 'excel-import'].map(id => CU_FAQ.find(f => f.id === id));
  main.innerHTML = '<div class="page home">' +
    '<section class="hx" aria-labelledby="homeTitle"><div class="hx-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><span class="hx-grid"></span></div>' +
    '<div class="hx-copy"><span class="hero-kicker">' + icon('sparkle', 'icon-sm') + tx('لموظفي Omantel · ClickUp', 'For Omantel Employees · ClickUp') + '</span>' +
    '<h1 id="homeTitle">' + tx('اكتشف <span class="grad-text">ClickUp</span> بطريقة سهلة وممتعة', 'Discover <span class="grad-text">ClickUp</span> the easy, fun way') + '</h1>' +
    '<p class="lead">' + tx('دليل ملوّن ومتحرك يشرح لك كل جزء من ClickUp خطوة بخطوة، حتى تنجز عملك اليومي بثقة.', 'A colourful, animated guide that shows you every part of ClickUp, step by step, so you can handle your daily work with confidence.') + '</p>' +
    '<div class="hero-actions"><a class="btn btn-primary btn-lg hx-cta" href="#/tour' + (toured ? '/' + tourNext() : '') + '">' + icon('rocket') + (toured ? tx('تابع الجولة', 'Continue the tour') : tx('ابدأ الجولة', 'Start the tour')) + '</a>' +
    '<a class="btn btn-secondary btn-lg" href="#/library">' + icon('book') + tx('تصفّح الدروس', 'Browse lessons') + '</a></div>' +
    '<a class="hx-guide" href="#/guide">' + icon('bulb', 'icon-sm') + tx('جديد هنا؟ تعرّف كيف تستخدم هذا الموقع', 'New here? See how to use this website') + icon('fwd', 'icon-sm') + '</a>' +
    (started ? '<a class="hx-resume" href="' + (last && !Store.isDone(last.id) ? lessonLink(last.id) : '#/progress') + '">' + ring(Math.round((done + toured) / (LESSONS.length + 12) * 100), { size: 34, stroke: 5, color: '#ffc800', track: 'rgb(255 255 255 / .2)' }) +
      '<span><small class="num">' + tx(toured + '/12 من الجولة · ' + done + '/' + LESSONS.length + ' درساً', toured + '/12 tour parts · ' + done + '/' + LESSONS.length + ' lessons') + '</small>' + (last && !Store.isDone(last.id) ? tx('تابع: ', 'Continue: ') + t(last.title) : tx('شاهد تقدّمي', 'See my progress')) + '</span>' + icon('fwd', 'icon-sm') + '</a>'
      : '<p class="hx-facts"><span>' + icon('compass', 'icon-sm') + tx('12 جزءاً', '12 parts') + '</span><span>' + icon('play', 'icon-sm') + tx('عروض متحركة', 'Animated demos') + '</span><span>' + icon('flask', 'icon-sm') + tx('تدريب عملي', 'Hands-on practice') + '</span></p>') +
    '</div>' + heroArt() + '</section>' +

    '<section class="hsec" aria-labelledby="waysT"><p class="h-kicker">' + tx('اختر طريقتك', 'Pick your way') + '</p><h2 id="waysT">' + tx('ثلاث طرق ممتعة لتتعلّم', 'Three fun ways to learn') + '</h2>' +
    '<div class="ways">' + WAYS.map(w => '<a class="way" data-rv href="' + w.href + '" style="--g:' + w.g + '"><div class="way-art">' + w.art + '</div><div class="way-body"><span class="way-tag">' + icon(w.icon, 'icon-sm') + w.tag + '</span><h3>' + w.t + '</h3><p>' + w.d + '</p><span class="way-go">' + tx('هيا بنا', 'Let’s go') + icon('fwd', 'icon-sm') + '</span></div></a>').join('') + '</div></section>' +

    '<a class="au-banner" data-rv href="#/workshops"><span class="au-bn-art" aria-hidden="true"><span class="au-bn-robot">' + icon('robot') + '</span><i></i><i></i><i></i></span><span class="au-bn-text"><span class="way-tag">' + icon('zap', 'icon-sm') + tx('جديد', 'New') + '</span><b>' + tx('الورش التفاعلية', 'Hands-on workshops') + '</b><span>' + tx('الأتمتة، والذكاء الاصطناعي، والاستيراد والتصدير، والقوالب: جرّبها بيدك.', 'Automations, AI, Import & Export and Templates: try them with your own hands.') + '</span></span><span class="btn btn-primary">' + tx('ابدأ', 'Start') + icon('fwd', 'icon-sm') + '</span></a>' +

    '<section class="clicky" aria-label="' + tx('نصائح Clicky', 'Tips from Clicky') + '"><button type="button" class="clicky-btn" data-clicky aria-label="' + tx('اضغط Clicky لنصيحة جديدة', 'Tap Clicky for a new tip') + '">' + mascot() + '</button><p class="clicky-say" data-clicky-say aria-live="polite"></p></section>' +

    '<section class="hsec" aria-labelledby="whyT"><p class="h-kicker">' + tx('لماذا ClickUp؟', 'Why ClickUp?') + '</p><h2 id="whyT">' + tx('من الفوضى إلى الوضوح في لحظة', 'From chaos to clarity in a moment') + '</h2>' +
    '<div class="panel why-home" data-rv>' + beforeAfter() + '</div></section>' +

    '<section class="hsec" aria-labelledby="discT"><p class="h-kicker">' + tx('الجولة', 'The tour') + '</p><h2 id="discT">' + tx('12 جزءاً، اختر ما يهمك', '12 parts. Pick what you need.') + '</h2>' +
    '<div class="bubbles">' + TOUR_PARTS.map((p, i) => '<a class="bubble' + (Store.isToured(p.id) ? ' seen' : '') + '" data-rv href="#/tour/' + p.id + '" style="' + modStyle(p.mod) + ';--i:' + i + '"><span class="bb-ic">' + icon(p.icon) + '</span><span class="bb-t">' + tp(TOUR_SHORT[p.id]) + '</span>' + (Store.isToured(p.id) ? '<span class="bb-ok">' + icon('check', 'icon-sm') + '<span class="visually-hidden">' + tx('مكتشف', 'Explored') + '</span></span>' : '') + '</a>').join('') + '</div></section>' +

    '<section class="hsec hsec-narrow" aria-labelledby="faqT"><p class="h-kicker">' + tx('أسئلة سريعة', 'Quick answers') + '</p><h2 id="faqT">' + tx('يسأل الناس كثيراً', 'People often ask') + '</h2><div class="cuq-list">' +
    faqs.map(faqItem).join('') +
    '</div><div class="h-center h-row"><a class="btn btn-secondary" href="#/questions">' + icon('message') + tx('كل الأسئلة الشائعة', 'All common questions') + '</a><a class="btn btn-primary" href="#/forum">' + icon('users') + tx('اسأل زملاءك في المنتدى', 'Ask colleagues in the forum') + '</a></div></section>' +

    '<p class="help-text h-center">' + tx('الواجهات داخل المنصة محاكاة تعليمية مبسّطة، وليست تسجيلات من ClickUp. المنصة مستقلة وغير معتمدة أو مدعومة من ClickUp.', 'Screens inside the platform are simplified educational simulations, not recordings of ClickUp. The platform is independent and is not certified or endorsed by ClickUp.') + ' <a href="#/about">' + tx('اعرف المزيد', 'Learn more') + '</a></p>' +
    '</div>';
  const offP = bindParallax(main);
  bindClicky(main);
  const offBA = bindBeforeAfter(main);
  const offF = bindFaqDemos(main);
  return () => { offP(); offBA(); offF(); };
}
