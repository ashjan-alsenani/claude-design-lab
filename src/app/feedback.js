/* ==========================================================================
   How to use this website, feature ideas and team questions.
   This website has no server: ideas and questions are kept on this device,
   and the learner sends them to the team with Copy or Email. The page says
   so plainly, so nobody thinks a request went somewhere it did not.
   ========================================================================== */

const EXAMPLE_PERSON = { name: 'Ashjan Al Sinani', id: '71067' };

/* ---------- How to use this website ---------- */
function viewGuide(main) {
  const STEPS = [
    ['globe', '#7b68ee', tx('اختر لغتك', 'Choose your language'), tx('العربية أو الإنجليزية من أعلى الصفحة في أي وقت. لا يضيع تقدّمك ولا إجاباتك عند التبديل.', 'Arabic or English from the top of the page, at any time. Switching never loses your progress or answers.'), null],
    ['compass', '#ff02f0', tx('ابدأ بجولة ClickUp', 'Start with the ClickUp tour'), tx('12 جزءاً من التطبيق، كل جزء في 4 خطوات: تعرّف، لماذا، كيف، ثم تحقّق.', '12 parts of the app, each in 4 steps: meet it, why, how, then check.'), '#/tour'],
    ['book', '#e44bb6', tx('تعلّم من الدروس', 'Learn from the lessons'), tx('كل درس: شاهد عرضاً متحركاً، افهم الفكرة، تدرّب، ثم أجب عن سؤالين.', 'Each lesson: watch an animation, understand the idea, practise, then answer two questions.'), '#/library'],
    ['robot', '#ff4d6d', tx('ابنِ أتمتة', 'Build an automation'), tx('في ورشة الأتمتة تبني أتمتة كما في ClickUp وتجرّبها على مهمة تجريبية.', 'In the Automations workshop you build an automation the ClickUp way and test it on a sample task.'), '#/automations'],
    ['flask', '#1fb6e0', tx('تدرّب في المختبر', 'Practise in the lab'), tx('مساحة تشبه ClickUp ببيانات وهمية: أنشئ مهام وحرّكها دون خوف من الخطأ.', 'A ClickUp-like space with sample data: create and move tasks with no fear of mistakes.'), '#/lab'],
    ['message', '#14b8a6', tx('ابحث عن إجابة', 'Find an answer'), tx('الأسئلة الشائعة تجيب باختصار، وكل إجابة تأخذك إلى الجزء الذي يشرحها.', 'Common questions give short answers, and each one takes you to the part that shows it.'), '#/questions'],
    ['users', '#f5a524', tx('اسأل الفريق أو اقترح ميزة', 'Ask the team or suggest a feature'), tx('اكتب سؤالك أو فكرتك، ثم انسخها أو أرسلها بالبريد إلى فريقك.', 'Write your question or idea, then copy it or email it to your team.'), '#/support'],
    ['progress', '#22c38e', tx('تابع تقدّمك', 'Follow your progress'), tx('صفحة «تقدّمي» تعرض ما أنجزته وشاراتك. التقدّم محفوظ على هذا الجهاز فقط.', 'The My Progress page shows what you have done and your badges. Progress is saved on this device only.'), '#/progress']
  ];
  const TIPS = [
    ['panel', tx('ركّز على الصفحة', 'Focus on the page'), tx('زر القائمة في أول الشريط العلوي يخفي القائمة الجانبية على الشاشات الكبيرة، ويتذكر اختيارك.', 'The menu button at the start of the top bar hides the side menu on large screens and remembers your choice.')],
    ['play', tx('تحكّم في العروض', 'Control the animations'), tx('أوقف أي عرض متحرك، وتنقّل بين خطواته، وغيّر سرعته، أو فعّل «خطوة بخطوة».', 'Pause any animation, move between its steps, change its speed, or turn on “Step by step”.')],
    ['eye', tx('محاكاة آمنة', 'A safe simulation'), tx('الشاشات هنا إعادة بناء مبسّطة ولا تتصل بحسابك في ClickUp.', 'The screens here are simplified reconstructions and do not connect to your ClickUp account.')],
    ['mobile', tx('على الجوال أيضاً', 'On your phone too'), tx('الموقع يعمل على الجوال: افتح القائمة من الزر أعلى الشاشة.', 'The website works on phones: open the menu from the button at the top.')]
  ];
  main.innerHTML = '<div class="page guide">' +
    '<section class="hx hx-small" aria-labelledby="guideT"><div class="hx-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b3"></span><span class="hx-grid"></span></div><div class="hx-copy">' +
    '<span class="hero-kicker">' + icon('bulb', 'icon-sm') + tx('دليل سريع', 'Quick guide') + '</span><h1 id="guideT" tabindex="-1">' + tx('كيف تستخدم هذا الموقع', 'How to use this website') + '</h1>' +
    '<p class="lead">' + tx('ثماني خطوات بسيطة لتستفيد من كل جزء في المنصة. ابدأ من الأولى، أو اقفز إلى ما تحتاجه.', 'Eight simple steps to get the most from every part of the platform. Start at the first, or jump to what you need.') + '</p></div>' +
    '<ol class="guide-path" aria-hidden="true">' + STEPS.map((s, i) => '<li style="--tc:' + s[1] + ';--i:' + i + '"><span>' + icon(s[0]) + '</span></li>').join('') + '</ol></section>' +
    '<section class="hsec" aria-labelledby="gStepsT"><p class="h-kicker">' + tx('خطوة بخطوة', 'Step by step') + '</p><h2 id="gStepsT">' + tx('رحلتك في المنصة', 'Your journey through the platform') + '</h2><ol class="guide-steps">' +
    STEPS.map((s, i) => '<li class="guide-step" data-rv style="--tc:' + s[1] + '"><span class="gs-n num">' + (i + 1) + '</span><span class="ic-tile">' + icon(s[0]) + '</span><div><h3>' + s[2] + '</h3><p>' + s[3] + '</p>' + (s[4] ? '<a class="gs-go" href="' + s[4] + '">' + tx('افتح', 'Open') + icon('fwd', 'icon-sm') + '</a>' : '') + '</div></li>').join('') + '</ol></section>' +
    '<section class="hsec" aria-labelledby="gTipsT"><p class="h-kicker">' + tx('نصائح', 'Tips') + '</p><h2 id="gTipsT">' + tx('أشياء صغيرة تجعلها أسهل', 'Little things that make it easier') + '</h2><div class="au-know">' +
    TIPS.map(x => '<div class="why-card" data-rv style="--tc:#8930fd"><span class="ic-tile">' + icon(x[0]) + '</span><h3>' + x[1] + '</h3><p>' + x[2] + '</p></div>').join('') + '</div></section>' +
    '<div class="h-center"><a class="btn btn-primary btn-lg" href="#/tour">' + icon('rocket') + tx('ابدأ الجولة الآن', 'Start the tour now') + '</a></div></div>';
}

/* ---------- Ideas and team questions share one form engine ---------- */
const REQ_KINDS = {
  ideas: {
    prefix: 'IDEA', icon: 'sparkle', grad: 'linear-gradient(135deg,#a855f7,#ff02f0)',
    title: () => tx('اقترح ميزة جديدة', 'Suggest a new feature'),
    lead: () => tx('ما الذي تتمنى أن تضيفه إلى هذه المنصة أو إلى طريقة استخدامنا لـ ClickUp؟ كل فكرة تهمّنا.', 'What would you like added to this platform, or to the way we use ClickUp? Every idea matters.'),
    subjectLabel: () => tx('اسم الفكرة', 'Idea title'), subjectPh: () => tx('مثال: وضع ليلي للعمل مساءً', 'Example: a dark mode for evening work'),
    bodyLabel: () => tx('اشرح فكرتك وفائدتها', 'Describe your idea and how it helps'), bodyPh: () => tx('ما المشكلة التي تحلّها؟ ومن سيستفيد منها؟', 'What problem does it solve? Who will benefit?'),
    catLabel: () => tx('أين؟', 'Where?'), cats: () => [['site', tx('هذه المنصة التعليمية', 'This learning platform')], ['clickup', tx('إعداد ClickUp لدينا', 'Our ClickUp setup')], ['auto', tx('أتمتة جديدة', 'A new automation')], ['other', tx('أخرى', 'Other')]],
    levelLabel: () => tx('ما مدى أهميتها؟', 'How important is it?'), levels: () => [['nice', tx('فكرة لطيفة', 'Nice to have'), '#1fb6e0'], ['important', tx('مهمة', 'Important'), '#f5a524'], ['must', tx('ضرورية', 'Must have'), '#ff4d6d']],
    listTitle: () => tx('أفكارك', 'Your ideas'), send: () => tx('أرسل الفكرة', 'Submit idea'), saved: () => tx('حُفظت فكرتك. أرسلها إلى فريقك بالنسخ أو البريد.', 'Your idea is saved. Send it to your team by copying or email.'),
    example: { cat: 'site', level: 'important', subject: 'Add a dark mode for evening work', subjectAr: 'إضافة وضع ليلي للعمل مساءً', body: 'A darker theme would be easier on the eyes when we review tasks late in the day.', bodyAr: 'واجهة داكنة أريح للعين عندما نراجع المهام في آخر اليوم.' }
  },
  tickets: {
    prefix: 'REQ', icon: 'users', grad: 'linear-gradient(135deg,#1fb6e0,#22c38e)',
    title: () => tx('أسئلة الفريق والدعم', 'Team questions & support'),
    lead: () => tx('عالق في شيء أو عندك سؤال لفريقك؟ اكتب سؤالك هنا، وسنقترح عليك إجابات قد تساعد فوراً.', 'Stuck on something, or have a question for your team? Write it here and we will suggest answers that may help straight away.'),
    subjectLabel: () => tx('موضوع السؤال', 'Subject'), subjectPh: () => tx('مثال: كيف أشارك مهمة واحدة مع ضيف؟', 'Example: How do I share one task with a guest?'),
    bodyLabel: () => tx('اكتب التفاصيل', 'Details'), bodyPh: () => tx('ماذا حاولت؟ وماذا حدث؟ وأين (Space أو List)؟', 'What did you try? What happened? Where (Space or List)?'),
    catLabel: () => tx('نوع الطلب', 'Type of request'), cats: () => [['howto', tx('كيف أفعل شيئاً في ClickUp', 'How to do something in ClickUp')], ['access', tx('الوصول والصلاحيات', 'Access and permissions')], ['problem', tx('مشكلة أو خطأ', 'A problem or error')], ['site', tx('هذه المنصة التعليمية', 'This learning platform')], ['other', tx('أخرى', 'Other')]],
    levelLabel: () => tx('مدى الاستعجال', 'How urgent?'), levels: () => [['low', tx('غير عاجل', 'Not urgent'), '#22c38e'], ['normal', tx('عادي', 'Normal'), '#4f86f7'], ['urgent', tx('عاجل', 'Urgent'), '#ff4d6d']],
    listTitle: () => tx('أسئلتك', 'Your questions'), send: () => tx('أرسل السؤال', 'Submit question'), saved: () => tx('حُفظ سؤالك. أرسله إلى فريقك بالنسخ أو البريد.', 'Your question is saved. Send it to your team by copying or email.'),
    example: { cat: 'howto', level: 'normal', subject: 'How do I share one task with a guest?', subjectAr: 'كيف أشارك مهمة واحدة مع ضيف؟', body: 'I need an external consultant to comment on one task only, without seeing the rest of the List.', bodyAr: 'أحتاج أن يعلّق مستشار خارجي على مهمة واحدة فقط دون أن يرى بقية القائمة.' }
  }
};

function viewRequests(main, kind) {
  const K = REQ_KINDS[kind];
  const prof = Store.state.profile || {};
  const draft = UIState.get('req-' + kind) || { name: prof.name || '', emp: prof.emp || '', cat: K.cats()[0][0], level: K.levels()[1][0], subject: '', body: '' };
  const put = () => UIState.set('req-' + kind, draft);
  const other = kind === 'ideas' ? ['#/support', 'users', tx('عندك سؤال؟ اسأل الفريق', 'Have a question? Ask the team')] : ['#/ideas', 'sparkle', tx('عندك فكرة؟ اقترح ميزة', 'Have an idea? Suggest a feature')];
  const field = (id, label, input, hint) => '<div class="field rq-field"><label for="' + id + '">' + label + '</label>' + input + (hint ? '<p class="help-text">' + hint + '</p>' : '') + '<p class="rq-err" id="' + id + 'Err" hidden></p></div>';
  main.innerHTML = '<div class="page rq-page" style="--rg:' + K.grad + '">' +
    '<header class="rq-hero"><span class="rq-art" aria-hidden="true">' + icon(K.icon) + '</span><div><h1 tabindex="-1">' + K.title() + '</h1><p>' + K.lead() + '</p></div></header>' +
    '<div class="rq-grid"><form class="panel rq-form" novalidate data-rq>' +
    '<div class="rq-two">' + field('rqName', tx('الاسم', 'Name'), '<input class="input" id="rqName" autocomplete="name" value="' + esc(draft.name) + '" placeholder="' + tx('مثال: ', 'e.g. ') + EXAMPLE_PERSON.name + '" aria-describedby="rqNameErr">') +
    field('rqEmp', tx('الرقم الوظيفي', 'Employee ID'), '<input class="input num" id="rqEmp" inputmode="numeric" value="' + esc(draft.emp) + '" placeholder="' + tx('مثال: ', 'e.g. ') + EXAMPLE_PERSON.id + '" aria-describedby="rqEmpErr">') + '</div>' +
    field('rqCat', K.catLabel(), '<select class="select" id="rqCat">' + K.cats().map(c => '<option value="' + c[0] + '"' + (c[0] === draft.cat ? ' selected' : '') + '>' + c[1] + '</option>').join('') + '</select>') +
    field('rqSubject', K.subjectLabel(), '<input class="input" id="rqSubject" value="' + esc(draft.subject) + '" placeholder="' + esc(K.subjectPh()) + '" aria-describedby="rqSubjectErr">') +
    (kind === 'tickets' ? '<div class="rq-suggest" data-suggest aria-live="polite"></div>' : '') +
    field('rqBody', K.bodyLabel(), '<textarea class="input" id="rqBody" rows="5" placeholder="' + esc(K.bodyPh()) + '" aria-describedby="rqBodyErr">' + esc(draft.body) + '</textarea>') +
    '<div class="field"><span class="field-label" id="rqLvL">' + K.levelLabel() + '</span><div class="rq-levels" role="radiogroup" aria-labelledby="rqLvL">' + K.levels().map(l => '<button type="button" role="radio" data-level="' + l[0] + '" aria-checked="' + (l[0] === draft.level) + '" style="--lc:' + l[2] + '"><i></i>' + l[1] + '</button>').join('') + '</div></div>' +
    '<button type="submit" class="btn btn-primary btn-lg rq-send">' + icon('fwd', 'icon-sm') + K.send() + '</button>' +
    '<p class="rq-note">' + icon('info', 'icon-sm') + '<span>' + tx('هذا الموقع بلا خادم، لذلك يُحفظ طلبك على هذا الجهاز. استخدم «انسخ» أو «أرسل بالبريد» لإيصاله إلى فريقك.', 'This website has no server, so your request is saved on this device. Use “Copy” or “Email” to get it to your team.') + '</span></p></form>' +
    '<section class="rq-list" aria-labelledby="rqListT"><h2 id="rqListT">' + K.listTitle() + '</h2><div data-items></div>' +
    '<a class="rq-other" href="' + other[0] + '">' + icon(other[1], 'icon-sm') + other[2] + icon('fwd', 'icon-sm') + '</a></section></div></div>';

  const catName = v => { const c = K.cats().find(x => x[0] === v); return c ? c[1] : v; };
  const lvl = v => K.levels().find(x => x[0] === v) || K.levels()[1];
  const textOf = it => [K.title() + ' · ' + it.id, tx('الاسم: ', 'Name: ') + it.name, tx('الرقم الوظيفي: ', 'Employee ID: ') + it.emp, K.catLabel() + ': ' + catName(it.cat), K.levelLabel() + ': ' + lvl(it.level)[1], K.subjectLabel() + ': ' + it.subject, '', it.body].join('\n');
  const card = (it, example) => '<article class="rq-card' + (example ? ' is-example' : '') + '" style="--lc:' + lvl(it.level)[2] + '">' +
    '<div class="rq-card-h"><span class="rq-id num">' + (example ? tx('مثال', 'Example') : it.id) + '</span><span class="rq-lvl"><i></i>' + lvl(it.level)[1] + '</span></div>' +
    '<h3>' + esc(it.subject) + '</h3><p>' + esc(it.body) + '</p>' +
    '<p class="rq-meta"><span class="rq-av" aria-hidden="true">' + esc((it.name || '?').trim().charAt(0).toUpperCase()) + '</span><bdi>' + esc(it.name) + '</bdi><span class="num">· ' + tx('الرقم الوظيفي ', 'ID ') + '<bdi dir="ltr">' + esc(it.emp) + '</bdi></span><span>· ' + catName(it.cat) + '</span>' + (example ? '' : '<span>· ' + fmtStamp(it.at) + '</span>') + '</p>' +
    (example ? '' : '<div class="rq-actions"><span class="chip">' + icon('check', 'icon-sm') + tx('محفوظ على هذا الجهاز', 'Saved on this device') + '</span><button type="button" class="btn btn-ghost btn-sm" data-copy="' + it.id + '">' + icon('doc', 'icon-sm') + tx('انسخ', 'Copy') + '</button>' +
      '<a class="btn btn-ghost btn-sm" href="mailto:?subject=' + encodeURIComponent(K.title() + ' · ' + it.id + ' · ' + it.subject) + '&body=' + encodeURIComponent(textOf(it)) + '">' + icon('at', 'icon-sm') + tx('أرسل بالبريد', 'Email') + '</a>' +
      '<button type="button" class="icon-btn" data-remove="' + it.id + '" aria-label="' + tx('احذف: ', 'Delete: ') + esc(it.subject) + '">' + icon('trash', 'icon-sm') + '</button></div>') + '</article>';
  const paintList = () => {
    const ex = K.example;
    const exItem = { id: 'EX', name: EXAMPLE_PERSON.name, emp: EXAMPLE_PERSON.id, cat: ex.cat, level: ex.level, subject: tx(ex.subjectAr, ex.subject), body: tx(ex.bodyAr, ex.body) };
    const mine = Store.state[kind];
    $('[data-items]', main).innerHTML = mine.map(it => card(it, false)).join('') + card(exItem, true) + (mine.length ? '' : '<p class="help-text">' + tx('لم ترسل شيئاً بعد. هذا مثال لطريقة ظهور طلبك.', 'You have not sent anything yet. This is an example of how your request will look.') + '</p>');
  };
  const suggest = () => {
    const box = $('[data-suggest]', main); if (!box) return;
    const words = (draft.subject + ' ' + draft.body).toLowerCase().split(/[^\p{L}\p{N}@]+/u).filter(w => w.length > 2);
    if (!words.length) { box.innerHTML = ''; return; }
    const scored = CU_FAQ.map(f => { const hay = (tp(f.q) + ' ' + tp(f.a)).toLowerCase(); return { f, s: words.filter(w => hay.includes(w)).length }; }).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3);
    box.innerHTML = scored.length ? '<p class="rq-sg-t">' + icon('bulb', 'icon-sm') + tx('قد تجد الإجابة هنا:', 'You may find the answer here:') + '</p><ul>' + scored.map(x => '<li><a href="#/tour/' + x.f.part + '">' + icon('help', 'icon-sm') + tp(x.f.q) + '</a></li>').join('') + '</ul>' : '';
  };
  const setErr = (id, msg) => { const e = $('#' + id + 'Err', main), inp = $('#' + id, main); e.hidden = !msg; e.textContent = msg || ''; inp.setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg; };
  paintList(); suggest();

  const form = $('[data-rq]', main);
  form.addEventListener('input', debounce(e => {
    const map = { rqName: 'name', rqEmp: 'emp', rqSubject: 'subject', rqBody: 'body' };
    if (map[e.target.id]) { draft[map[e.target.id]] = e.target.value; put(); if (e.target.getAttribute('aria-invalid') === 'true') setErr(e.target.id, ''); if (e.target.id === 'rqSubject' || e.target.id === 'rqBody') suggest(); }
  }, 120));
  form.addEventListener('change', e => { if (e.target.id === 'rqCat') { draft.cat = e.target.value; put(); } });
  form.addEventListener('click', e => { const b = e.target.closest('[data-level]'); if (!b) return; draft.level = b.dataset.level; put(); $$('[data-level]', form).forEach(x => x.setAttribute('aria-checked', x === b)); });
  form.addEventListener('keydown', e => {
    const b = e.target.closest('[data-level]'); if (!b || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault(); const all = $$('[data-level]', form); const fwd = e.key === 'ArrowDown' || e.key === (isRTL() ? 'ArrowLeft' : 'ArrowRight');
    const n = all[(all.indexOf(b) + (fwd ? 1 : -1) + all.length) % all.length]; n.focus(); n.click();
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    ['name', 'emp', 'subject', 'body'].forEach(k => { draft[k] = $('#' + { name: 'rqName', emp: 'rqEmp', subject: 'rqSubject', body: 'rqBody' }[k], main).value.trim(); });
    const ok = [
      setErr('rqName', draft.name.length < 2 ? tx('اكتب اسمك.', 'Please write your name.') : ''),
      setErr('rqEmp', !/^\d{3,10}$/.test(draft.emp) ? tx('اكتب رقمك الوظيفي بالأرقام فقط، مثل ', 'Write your employee ID in digits only, such as ') + EXAMPLE_PERSON.id + '.' : ''),
      setErr('rqSubject', draft.subject.length < 4 ? tx('اكتب عنواناً قصيراً.', 'Please write a short title.') : ''),
      setErr('rqBody', draft.body.length < 10 ? tx('أضف تفاصيل أكثر قليلاً (10 أحرف على الأقل).', 'Please add a little more detail (at least 10 characters).') : '')
    ];
    if (ok.includes(false)) { const bad = $('[aria-invalid="true"]', form); if (bad) bad.focus(); return; }
    const n = Store.state[kind].reduce((m, x) => Math.max(m, +String(x.id).split('-')[1] || 0), 0) + 1;
    const item = { id: K.prefix + '-' + String(n).padStart(4, '0'), at: Date.now(), name: draft.name, emp: draft.emp, cat: draft.cat, level: draft.level, subject: draft.subject, body: draft.body };
    Store.addItem(kind, item); Store.setProfile({ name: draft.name, emp: draft.emp });
    draft.subject = ''; draft.body = ''; put();
    $('#rqSubject', main).value = ''; $('#rqBody', main).value = ''; suggest();
    paintList(); toast(K.saved()); Motion.confetti($('.rq-send', main), 45); announce(K.saved());
    const first = $('[data-items] .rq-card', main); if (first && !prefersReducedMotion()) first.animate([{ opacity: 0, transform: 'translateY(-10px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  });
  $('[data-items]', main).addEventListener('click', e => {
    const c = e.target.closest('[data-copy]');
    if (c) { const it = Store.state[kind].find(x => x.id === c.dataset.copy); copyText(textOf(it)).then(ok => toast(ok ? tx('نُسخ. الصقه في رسالة إلى فريقك.', 'Copied. Paste it into a message to your team.') : tx('تعذّر النسخ على هذا المتصفح.', 'Copying is not available on this browser.'))); return; }
    const r = e.target.closest('[data-remove]');
    if (r) confirmDialog(tx('حذف هذا الطلب؟', 'Delete this request?'), tx('سيُحذف من هذا الجهاز فقط.', 'It will be removed from this device only.'), tx('نعم، احذف', 'Yes, delete')).then(ok => { if (ok) { Store.removeItem(kind, r.dataset.remove); paintList(); } });
  });
}
function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => false);
  try { const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return Promise.resolve(ok); }
  catch (e) { return Promise.resolve(false); }
}
