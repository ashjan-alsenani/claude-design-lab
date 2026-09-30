/* ==========================================================================
   Automations workshop. Explains Trigger → Condition → Action, shows the
   kinds of automations teams use, and lets the learner build automations in
   a simplified ClickUp-style "Automations" window and test them on a sample
   task. Nothing here connects to ClickUp; it is an educational simulation.
   ========================================================================== */

const AU = (() => {
  const ST = ['todo', 'progress', 'review', 'done'];
  const PR = ['urgent', 'high', 'normal', 'low'];
  const PPL = ['salim', 'maryam', 'noura', 'khalid'];
  const OPT = {
    status: () => ST.map(k => [k, STATUS[k].en]),
    priority: () => PR.map(k => [k, PRIORITY[k].en]),
    person: () => PPL.map(k => [k, PN(k)]),
    dept: () => [['ops', tx('العمليات', 'Operations')], ['fin', tx('المالية', 'Finance')], ['mkt', tx('التسويق', 'Marketing')]],
    list: () => [['weekly', L_WEEKLY()], ['req', L_REQ()], ['audit', tx('إجراءات التدقيق', 'Audit actions')]],
    comment: () => [['review', tx('جاهزة لمراجعتك، شكراً!', 'Ready for your review, thanks!')], ['done', tx('تم الإنجاز. عمل رائع!', 'Done. Great work, everyone!')], ['due', tx('تذكير: موعد هذه المهمة اليوم.', 'Reminder: this task is due today.')]],
    template: () => [['review', tx('قائمة تحقق المراجعة', 'Review checklist')]],
    email: () => [['assignees', tx('إلى المسؤولين', 'To the assignees')]]
  };
  const TRIG = {
    created: { en: 'Task or subtask created', ar: 'عند إنشاء مهمة أو مهمة فرعية', ic: 'plus' },
    status: { en: 'Status changes', ar: 'عندما تتغير الحالة', ic: 'board', p: 'status' },
    priority: { en: 'Priority changes', ar: 'عندما تتغير الأولوية', ic: 'flag', p: 'priority' },
    assignee: { en: 'Assignee added', ar: 'عند إضافة مسؤول', ic: 'user' },
    due: { en: 'Due date arrives', ar: 'عندما يحين تاريخ الاستحقاق', ic: 'calendar' },
    field: { en: 'Custom Field changes', ar: 'عندما يتغير حقل مخصص', ic: 'table', p: 'dept' }
  };
  const COND = {
    priority: { en: 'Priority is', ar: 'الأولوية هي', p: 'priority' },
    dept: { en: 'Department is', ar: 'الإدارة هي', p: 'dept' },
    assignee: { en: 'Assignee is', ar: 'المسؤول هو', p: 'person' }
  };
  const ACT = {
    status: { en: 'Change status', ar: 'غيّر الحالة', ic: 'board', p: 'status' },
    assignee: { en: 'Add assignee', ar: 'أضف مسؤولاً', ic: 'user', p: 'person' },
    priority: { en: 'Change priority', ar: 'غيّر الأولوية', ic: 'flag', p: 'priority' },
    comment: { en: 'Add a comment', ar: 'أضف تعليقاً', ic: 'message', p: 'comment' },
    move: { en: 'Move to List', ar: 'انقل إلى قائمة', ic: 'list', p: 'list' },
    template: { en: 'Apply a template', ar: 'طبّق قالباً', ic: 'template', p: 'template' },
    email: { en: 'Send email', ar: 'أرسل بريداً', ic: 'at', p: 'email' }
  };
  const lab = (p, v) => { const o = (OPT[p] ? OPT[p]() : []).find(x => x[0] === v); return o ? o[1] : ''; };
  const first = p => OPT[p]()[0][0];
  const R = (k, v, c, a, by) => ({ t: { k, v }, c: c.map(x => ({ k: x[0], v: x[1] })), a: a.map(x => ({ k: x[0], v: x[1] })), by });
  const trigSent = t => { const T = TRIG[t.k]; return tx(T.ar + (T.p ? ' إلى ' + lab(T.p, t.v) : ''), 'When ' + T.en.charAt(0).toLowerCase() + T.en.slice(1) + (T.p ? ' to ' + lab(T.p, t.v) : '')); };
  const condSent = c => tx(COND[c.k].ar + ' ' + lab(COND[c.k].p, c.v), COND[c.k].en.toLowerCase() + ' ' + lab(COND[c.k].p, c.v));
  const actSent = a => tx(ACT[a.k].ar + ': ' + lab(ACT[a.k].p, a.v), ACT[a.k].en.toLowerCase() + ': ' + lab(ACT[a.k].p, a.v));
  const sentence = au => { const s = trigSent(au.t) + (au.c.length ? tx(' وكان ', ', if ') + au.c.map(condSent).join(tx(' و', ' and ')) : '') + tx('، ', ', ') + au.a.map(actSent).join(tx('، ثم ', ', then ')); return /[.!؟?]$/.test(s) ? s : s + '.'; };
  const emailMix = a => a.some(x => x.k === 'email') && a.some(x => x.k !== 'email');

  const TYPES = () => [
    { ic: 'board', c: '#7b68ee', t: tx('الحالة وسير العمل', 'Status & workflow'), d: tx('حرّك العمل وأبلغ الشخص التالي عندما تتغير الحالة.', 'Move work along and tell the next person when a status changes.'),
      r: [R('status', 'review', [], [['assignee', 'salim'], ['comment', 'review']]), R('status', 'done', [], [['comment', 'done'], ['move', 'audit']])] },
    { ic: 'user', c: '#e44bb6', t: tx('المسؤولون والتسليم', 'Assignees & hand-offs'), d: tx('لا تبقى مهمة بلا صاحب.', 'No task is ever left without an owner.'),
      r: [R('created', null, [], [['assignee', 'maryam']]), R('assignee', null, [], [['status', 'progress']])] },
    { ic: 'flag', c: '#ff7a45', t: tx('الأولويات', 'Priorities'), d: tx('العاجل يصل إلى الشخص المناسب فوراً.', 'Urgent work reaches the right person straight away.'),
      r: [R('priority', 'urgent', [], [['email', 'assignees']]), R('priority', 'urgent', [['dept', 'fin']], [['assignee', 'khalid']])] },
    { ic: 'calendar', c: '#1fb6e0', t: tx('المواعيد والتذكير', 'Dates & reminders'), d: tx('تذكير تلقائي قبل أن يفوت الموعد.', 'Automatic reminders before a deadline slips.'),
      r: [R('due', null, [], [['priority', 'urgent'], ['comment', 'due']])] },
    { ic: 'template', c: '#22c38e', t: tx('القوالب وقوائم التحقق', 'Templates & checklists'), d: tx('كل مهمة جديدة تبدأ بالخطوات نفسها.', 'Every new task starts with the same steps.'),
      r: [R('created', null, [], [['template', 'review']])] },
    { ic: 'table', c: '#f5a524', t: tx('الحقول المخصصة', 'Custom Fields'), d: tx('وجّه العمل حسب بياناته، مثل الإدارة.', 'Route work by its data, such as the department.'),
      r: [R('field', 'fin', [], [['move', 'req'], ['assignee', 'khalid']])] },
    { ic: 'link', c: '#4f86f7', t: tx('التكاملات', 'Integrations'), d: tx('أرسل رسالة إلى Slack أو اربط GitHub أو البريد عند حدوث تغيير. تُضبط داخل ClickUp بعد ربط التطبيقات، ولا نحاكيها هنا.', 'Post to Slack, connect GitHub or email when something changes. These are set up inside ClickUp after connecting the apps, so they are not simulated here.') },
    { ic: 'sparkle', c: '#a855f7', t: tx('ابنها بالذكاء الاصطناعي', 'Build it with AI'), d: tx('صف ما تريده بكلمات بسيطة، مثل «عندما تصبح المهمة عاجلة أبلغ مريم»، فيجهّز ClickUp Brain الأتمتة لك. يعتمد توفره على خطتكم وإعدادات المسؤول.', 'Describe what you want in plain words, such as “when a task becomes urgent, tell Maryam”, and ClickUp Brain sets up the automation. Availability depends on your plan and admin settings.') }
  ];
  const seed = () => [Object.assign(R('status', 'review', [], [['assignee', 'salim'], ['comment', 'review']], 'Ashjan Al Sinani · 71067'), { id: 'au1', on: true })];
  const autos = () => Store.state.autos || seed();
  const saveAutos = list => Store.setAutos(list);
  const newTask = () => ({ status: 'todo', priority: 'normal', assignees: ['noura'], dept: 'ops', list: 'req', comments: [], checklist: false, emails: 0, flash: [] });
  return { OPT, TRIG, COND, ACT, lab, first, R, sentence, emailMix, TYPES, autos, saveAutos, newTask, trigSent, actSent };
})();

function viewAutomations(main) {
  const STEPS = [['bulb', tx('كيف تعمل', 'How it works')], ['layers', tx('أنواعها', 'Types')], ['robot', tx('ابنِ وجرّب', 'Build & test')], ['list', tx('في ClickUp', 'In ClickUp')], ['info', tx('معلومات مهمة', 'Good to know')]];
  let step = UIState.get('au-step') || 0;
  const S = () => UIState.get('au') || { view: 'manage', draft: null, task: AU.newTask(), log: [], used: 0 };
  const put = s => UIState.set('au', s);
  const sel = (f, opts, v, lbl) => '<select class="select select-sm" data-f="' + f + '" aria-label="' + esc(lbl) + '">' + opts.map(o => '<option value="' + o[0] + '"' + (o[0] === v ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select>';
  const ic = n => '<span class="au-ic">' + icon(n, 'icon-sm') + '</span>';

  main.innerHTML = '<div class="page tour-part au-page" style="' + modStyle('m9') + '">' +
    '<header class="lesson-hero"><span class="lh-art" aria-hidden="true">' + icon('robot') + '</span><div class="breadcrumbs"><a href="#/home">' + tx('الرئيسية', 'Home') + '</a><span aria-hidden="true">/</span><span>Automations</span></div>' +
    '<h1 tabindex="-1">' + tx('ورشة الأتمتة: دع ClickUp يتولى الروتين', 'Automations workshop: let ClickUp handle the routine') + '</h1>' +
    '<p class="au-sub">' + tx('تعلّم الفكرة، واختر النوع المناسب، ثم ابنِ أتمتة بنفسك وجرّبها على مهمة تجريبية.', 'Learn the idea, pick the right type, then build an automation yourself and test it on a sample task.') + '</p>' +
    '<div class="au-pills"><span>When</span>' + icon('fwd', 'icon-sm') + '<span>If</span>' + icon('fwd', 'icon-sm') + '<span>Then</span></div></header>' +
    '<div class="tour-steps" role="group" aria-label="' + tx('أقسام الورشة', 'Workshop sections') + '">' + STEPS.map((s, i) => '<button type="button" data-astep="' + i + '"><span class="ts-n num">' + (i + 1) + '</span>' + icon(s[0], 'icon-sm') + '<span>' + s[1] + '</span></button>').join('') + '</div>' +
    '<section class="panel tour-panel" data-ap aria-live="polite"></section>' +
    '<nav class="tour-nav" aria-label="' + tx('التنقل', 'Navigation') + '"><button type="button" class="btn btn-secondary" data-ago="-1">' + icon('back', 'icon-sm') + '<span>' + tx('السابق', 'Back') + '</span></button><button type="button" class="btn btn-primary" data-ago="1"><span></span>' + icon('fwd', 'icon-sm') + '</button></nav></div>';
  const panel = $('[data-ap]', main);

  /* ---- 1. How it works ---- */
  const howHTML = () => '<p class="tp-kicker">' + tx('الفكرة في جملة', 'The idea in one sentence') + '</p><h2>' + tx('عندما يحدث شيء، وإذا تحقق شرط، ينفّذ ClickUp إجراءً عنك', 'When something happens, and a condition is true, ClickUp takes an action for you') + '</h2>' +
    '<div class="au-flow" aria-hidden="true">' +
    '<div class="au-node n-when"><span class="au-nic">' + icon('zap') + '</span><b>When</b><small>Trigger · ' + tx('المُشغِّل', 'what happens') + '</small><p>' + tx('تتغير الحالة إلى REVIEW', 'Status changes to REVIEW') + '</p></div><span class="au-wire"><i></i></span>' +
    '<div class="au-node n-if"><span class="au-nic">' + icon('filter') + '</span><b>If</b><small>Condition · ' + tx('اختياري', 'optional') + '</small><p>' + tx('الأولوية High', 'Priority is High') + '</p></div><span class="au-wire"><i></i></span>' +
    '<div class="au-node n-then"><span class="au-nic">' + icon('check') + '</span><b>Then</b><small>Action · ' + tx('الإجراء', 'what ClickUp does') + '</small><p>' + tx('أضف سالم مراجعاً وأضف تعليقاً', 'Add Salim as reviewer and post a comment') + '</p></div></div>' +
    '<div class="au-live" aria-hidden="true"><div class="au-mini"><span class="au-mst"><em class="m1">IN PROGRESS</em><em class="m2">REVIEW</em></span><b>' + tx('تجهيز التقرير الأسبوعي', 'Prepare the weekly report') + '</b><span class="au-mav">' + DM.av('noura', 22) + '<span class="au-pop">' + DM.av('salim', 22) + '</span></span></div>' +
    '<div class="au-mcomment">' + icon('robot', 'icon-sm') + '<span><b>Automation</b> · ' + tx('جاهزة لمراجعتك يا سالم', 'Ready for your review, Salim') + '</span></div></div>' +
    '<div class="au-three">' + [
      ['zap', '#e44bb6', 'Trigger', tx('الحدث الذي يبدأ الأتمتة، مثل إنشاء مهمة أو تغيّر الحالة أو حلول الموعد.', 'The event that starts the automation, such as a task being created, a status changing or a due date arriving.')],
      ['filter', '#f59e0b', 'Condition', tx('شرط اختياري يحدد أي المهام تُنفَّذ عليها الأتمتة، مثل «الأولوية High». متاح في خطة Business وما فوقها.', 'An optional filter for which tasks it runs on, such as “Priority is High”. Available on the Business plan and above.')],
      ['check', '#22c38e', 'Action', tx('ما ينفّذه ClickUp: تغيير الحالة، إضافة مسؤول، تعليق، نقل، بريد... ويمكن إضافة أكثر من إجراء.', 'What ClickUp does: change status, add an assignee, comment, move, email and more. You can add several actions.')]
    ].map(x => '<div class="why-card" style="--tc:' + x[1] + '"><span class="ic-tile">' + icon(x[0]) + '</span><h3>' + x[2] + '</h3><p>' + x[3] + '</p></div>').join('') + '</div>';

  /* ---- 2. Types ---- */
  const typesHTML = () => '<p class="tp-kicker">' + tx('ماذا يمكن أن تؤتمت؟', 'What can you automate?') + '</p><h2>' + tx('أنواع الأتمتة الأكثر استخداماً', 'The most useful types of automation') + '</h2><div class="au-types">' +
    AU.TYPES().map((ty, i) => '<div class="au-type" style="--tc:' + ty.c + '"><div class="au-type-h"><span class="ic-tile">' + icon(ty.ic) + '</span><h3>' + ty.t + '</h3></div><p>' + ty.d + '</p>' +
      (ty.r ? '<ul>' + ty.r.map((r, j) => '<li><span>' + AU.sentence(r) + '</span><button type="button" class="btn btn-ghost btn-sm" data-try="' + i + ':' + j + '">' + icon('play', 'icon-sm') + tx('جرّبها', 'Try it') + '</button></li>').join('') + '</ul>' : '<span class="chip">' + icon('eye', 'icon-sm') + tx('داخل ClickUp فقط', 'Inside ClickUp only') + '</span>') + '</div>').join('') + '</div>';

  /* ---- 3. Build & test ---- */
  const buildHTML = () => '<p class="tp-kicker">' + tx('ابنِ وجرّب', 'Build & test') + '</p><h2>' + tx('ابنِ أتمتة كما في ClickUp، ثم جرّبها', 'Build an automation the ClickUp way, then test it') + '</h2>' +
    '<div class="au-lab"><div class="cu-modal" data-modal></div><div class="au-sand" data-sand></div></div>' +
    '<p class="help-text au-note">' + icon('eye', 'icon-sm') + '<span>' + tx('محاكاة تعليمية مبسّطة لنافذة Automations. في هذه المحاكاة لا تُشغِّل إجراءات الأتمتة أتمتة أخرى.', 'A simplified educational simulation of the Automations window. In this simulation, automation actions do not start other automations.') + '</span></p>';
  const modalHTML = () => {
    const s = S(); const list = AU.autos();
    const head = '<div class="cu-mhead"><span class="cu-robot">' + icon('robot') + '</span><div><b>Automations</b><small>List · ' + L_REQ() + '</small></div>' +
      '<div class="cu-mtabs" role="tablist"><button type="button" role="tab" data-view="browse" aria-selected="' + (s.view === 'browse') + '">Templates</button><button type="button" role="tab" data-view="manage" aria-selected="' + (s.view === 'manage') + '">Manage <span class="num">' + list.length + '</span></button></div>' +
      '<button type="button" class="btn btn-primary btn-sm" data-new>' + icon('plus', 'icon-sm') + 'Add Automation</button></div>';
    let body = '';
    if (s.view === 'build' && s.draft) {
      const d = s.draft; const T = AU.TRIG[d.t.k];
      body = '<div class="cu-build">' +
        '<div class="cu-block cu-when"><span class="cu-lbl">When</span><span class="cu-hint">Trigger</span><div class="cu-row">' + ic(T.ic) + AU_sel('t.k', Object.keys(AU.TRIG).map(k => [k, AU.TRIG[k].en]), d.t.k, 'Trigger') + (T.p ? '<span class="cu-to">to</span>' + AU_sel('t.v', AU.OPT[T.p](), d.t.v, T.en) : '') + '</div>' + (isEN() ? '' : '<p class="cu-help">' + T.ar + '</p>') + '</div>' +
        d.c.map((c, i) => '<div class="cu-block cu-if"><span class="cu-lbl">If</span><span class="cu-hint">Condition</span><div class="cu-row">' + AU_sel('c.' + i + '.k', Object.keys(AU.COND).map(k => [k, AU.COND[k].en]), c.k, 'Condition') + AU_sel('c.' + i + '.v', AU.OPT[AU.COND[c.k].p](), c.v, 'Value') + '<button type="button" class="icon-btn" data-rm="c.' + i + '" aria-label="' + tx('احذف الشرط', 'Remove condition') + '">' + icon('x', 'icon-sm') + '</button></div></div>').join('') +
        '<div class="cu-link"><button type="button" class="cu-plus" data-add="c">' + icon('plus', 'icon-sm') + 'Add condition</button><span class="cu-plan">' + tx('خطة Business وما فوقها', 'Business plan and above') + '</span></div>' +
        '<div class="cu-block cu-then"><span class="cu-lbl">Then</span><span class="cu-hint">Action</span>' +
        d.a.map((a, i) => '<div class="cu-row">' + ic(AU.ACT[a.k].ic) + AU_sel('a.' + i + '.k', Object.keys(AU.ACT).map(k => [k, AU.ACT[k].en]), a.k, 'Action') + AU_sel('a.' + i + '.v', AU.OPT[AU.ACT[a.k].p](), a.v, 'Value') + (d.a.length > 1 ? '<button type="button" class="icon-btn" data-rm="a.' + i + '" aria-label="' + tx('احذف الإجراء', 'Remove action') + '">' + icon('x', 'icon-sm') + '</button>' : '') + '</div>').join('') +
        '<button type="button" class="cu-plus" data-add="a">' + icon('plus', 'icon-sm') + 'Add action</button></div>' +
        (AU.emailMix(d.a) ? feedbackHTML('bad', tx('في ClickUp، إجراء Send email يُجمع فقط مع إجراءات Send email أخرى. احذف أحد النوعين.', 'In ClickUp, a Send email action can only be combined with other Send email actions. Remove one kind.')) : '') +
        '<p class="cu-sum">' + icon('robot', 'icon-sm') + '<span>' + AU.sentence(d) + '</span></p>' +
        '<div class="cu-foot"><button type="button" class="btn btn-ghost btn-sm" data-cancel>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-create' + (AU.emailMix(d.a) ? ' disabled' : '') + '>Create</button></div></div>';
    } else if (s.view === 'browse') {
      body = '<div class="cu-tpls">' + AU.TYPES().filter(ty => ty.r).map((ty, i) => ty.r.map((r, j) => '<button type="button" class="cu-tpl" data-try="' + i + ':' + j + '" style="--tc:' + ty.c + '"><span class="ic-tile">' + icon(ty.ic, 'icon-sm') + '</span><span>' + AU.sentence(r) + '</span></button>').join('')).join('') + '</div>';
    } else {
      body = list.length ? '<ul class="cu-manage">' + list.map(a => '<li class="' + (a.on ? '' : 'off') + '"><button type="button" class="cu-switch" role="switch" aria-checked="' + a.on + '" data-toggle="' + a.id + '" aria-label="' + tx('تشغيل أو إيقاف: ', 'Turn on or off: ') + esc(AU.sentence(a)) + '"><i></i></button><div><p>' + AU.sentence(a) + '</p>' + (a.by ? '<small>' + tx('أنشأها ', 'Created by ') + '<bdi dir="ltr">' + esc(a.by) + '</bdi></small>' : '') + '</div><button type="button" class="icon-btn" data-del="' + a.id + '" aria-label="' + tx('احذف الأتمتة', 'Delete automation') + '">' + icon('trash', 'icon-sm') + '</button></li>').join('') + '</ul>'
        : '<div class="empty-state">' + icon('robot') + '<p>' + tx('لا توجد أتمتة بعد. اضغط Add Automation.', 'No automations yet. Press Add Automation.') + '</p></div>';
    }
    return head + '<div class="cu-mbody">' + body + '</div>';
  };
  function AU_sel(f, opts, v, lbl) { return sel(f, opts, v, lbl); }
  const sandHTML = () => {
    const s = S(); const tk = s.task; const fl = k => tk.flash.includes(k) ? ' au-flash' : '';
    return '<h3>' + icon('checklist', 'icon-sm') + tx('مهمة تجريبية', 'Sample task') + '</h3>' +
      '<div class="au-task"><div class="au-trow"><span class="mx-status st-' + tk.status + fl('status') + '">' + STATUS[tk.status].en + '</span><b>' + tx('طلب تقرير مبيعات الباقات', 'Plan sales report request') + '</b></div>' +
      '<div class="au-tmeta"><span class="' + fl('priority') + '">' + DM.pr(tk.priority) + '</span><span class="au-avs' + fl('assignee') + '">' + tk.assignees.map(p => DM.av(p, 22)).join('') + '</span><span class="chip' + fl('dept') + '">' + icon('table', 'icon-sm') + AU.lab('dept', tk.dept) + '</span><span class="chip' + fl('move') + '">' + icon('list', 'icon-sm') + AU.lab('list', tk.list) + '</span>' +
      (tk.checklist ? '<span class="chip' + fl('template') + '">' + icon('checklist', 'icon-sm') + AU.lab('template', 'review') + '</span>' : '') + (tk.emails ? '<span class="chip' + fl('email') + '">' + icon('at', 'icon-sm') + tx('بريد: ', 'Emails: ') + tk.emails + '</span>' : '') + '</div>' +
      (tk.comments.length ? '<div class="au-comments">' + tk.comments.map((c, i) => '<p class="' + (i === tk.comments.length - 1 ? fl('comment') : '') + '">' + icon('robot', 'icon-sm') + c + '</p>').join('') + '</div>' : '') + '</div>' +
      '<p class="au-do">' + tx('افعل شيئاً بالمهمة، وشاهد ماذا تفعل الأتمتة:', 'Do something to the task and watch what the automations do:') + '</p><div class="au-events">' +
      '<button type="button" class="btn btn-secondary btn-sm" data-ev="created">' + icon('plus', 'icon-sm') + tx('أنشئ مهمة جديدة', 'Create a new task') + '</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" data-ev="due">' + icon('calendar', 'icon-sm') + tx('حلّ الموعد', 'Due date arrives') + '</button>' +
      '<label>' + tx('الحالة', 'Status') + AU_sel('ev.status', AU.OPT.status(), tk.status, tx('الحالة', 'Status')) + '</label>' +
      '<label>' + tx('الأولوية', 'Priority') + AU_sel('ev.priority', AU.OPT.priority(), tk.priority, tx('الأولوية', 'Priority')) + '</label>' +
      '<label>' + tx('أضف مسؤولاً', 'Add assignee') + AU_sel('ev.assignee', [['', '—']].concat(AU.OPT.person()), '', tx('أضف مسؤولاً', 'Add assignee')) + '</label>' +
      '<label>' + tx('الإدارة', 'Department') + AU_sel('ev.field', AU.OPT.dept(), tk.dept, tx('الإدارة', 'Department')) + '</label></div>' +
      '<div class="au-log-h"><h3>' + icon('clock', 'icon-sm') + 'Activity</h3><span class="chip num">' + tx('الإجراءات المستخدمة: ', 'Actions used: ') + s.used + '</span></div>' +
      '<ul class="au-log" aria-live="polite">' + (s.log.length ? s.log.slice(0, 6).map(l => '<li class="lg-' + l.k + '">' + icon(l.k === 'ok' ? 'check-circle' : l.k === 'skip' ? 'alert' : 'info', 'icon-sm') + '<span>' + l.t + '</span></li>').join('') : '<li class="lg-none">' + icon('info', 'icon-sm') + '<span>' + tx('لم يحدث شيء بعد.', 'Nothing has happened yet.') + '</span></li>') + '</ul>';
  };
  const paintLab = () => { const m = $('[data-modal]', panel), sd = $('[data-sand]', panel); if (m) m.innerHTML = modalHTML(); if (sd) sd.innerHTML = sandHTML(); };

  /* The engine: apply the learner's change, then every matching automation. */
  const fire = (k, v) => {
    const s = S(); const tk = s.task; tk.flash = [];
    if (k === 'created') { Object.assign(tk, AU.newTask()); }
    if (k === 'status') { if (tk.status === v) return; tk.status = v; tk.flash.push('status'); }
    if (k === 'priority') { if (tk.priority === v) return; tk.priority = v; tk.flash.push('priority'); }
    if (k === 'assignee') { if (!v || tk.assignees.includes(v)) return; tk.assignees.push(v); tk.flash.push('assignee'); }
    if (k === 'field') { if (tk.dept === v) return; tk.dept = v; tk.flash.push('dept'); }
    const matches = AU.autos().filter(a => a.on && a.t.k === k && (!AU.TRIG[k].p || a.t.v === v));
    const evLabel = AU.trigSent({ k, v });
    if (!matches.length) s.log.unshift({ k: 'none', t: evLabel + tx(': لا توجد أتمتة لهذا التغيير.', ': no automation for this change.') });
    matches.forEach(a => {
      const pass = a.c.every(c => c.k === 'priority' ? tk.priority === c.v : c.k === 'dept' ? tk.dept === c.v : tk.assignees.includes(c.v));
      if (!pass) { s.log.unshift({ k: 'skip', t: tx('تخطّت الأتمتة التشغيل لأن الشرط غير متحقق. لم يُستخدم أي إجراء.', 'Skipped because the condition was not met. No actions used.') }); return; }
      a.a.forEach(x => {
        if (x.k === 'status') tk.status = x.v; if (x.k === 'priority') tk.priority = x.v; if (x.k === 'move') tk.list = x.v; if (x.k === 'template') tk.checklist = true;
        if (x.k === 'assignee' && !tk.assignees.includes(x.v)) tk.assignees.push(x.v);
        if (x.k === 'comment') tk.comments.push(AU.lab('comment', x.v)); if (x.k === 'email') tk.emails++;
        tk.flash.push(x.k); s.used++;
      });
      s.log.unshift({ k: 'ok', t: tx('نُفّذت: ', 'Ran: ') + AU.sentence(a) });
    });
    put(s); paintLab();
    if (matches.length && !prefersReducedMotion()) { const t = $('.au-task', panel); if (t) t.animate([{ boxShadow: '0 0 0 4px rgb(255 77 109 / .45)' }, { boxShadow: '0 0 0 0 rgb(255 77 109 / 0)' }], { duration: 900, easing: 'ease-out' }); }
  };

  /* ---- 4. In ClickUp ---- */
  const inClickUpHTML = () => '<p class="tp-kicker">' + tx('داخل ClickUp', 'Inside ClickUp') + '</p><h2>' + tx('كيف تنشئ أتمتة، خطوة بخطوة', 'How to create an automation, step by step') + '</h2>' +
    '<div class="tp-how"><ol class="tp-steps">' + [
      tx('افتح Space أو Folder أو List حيث يحدث العمل.', 'Open the Space, Folder or List where the work happens.'),
      tx('اضغط أيقونة الروبوت (Automations) أعلى العرض.', 'Click the robot icon (Automations) at the top of the view.'),
      tx('اضغط Create Automation، أو Add Automation أعلى يمين النافذة.', 'Click Create Automation, or Add Automation in the upper-right of the window.'),
      tx('اختر أتمتة مقترحة، أو قالباً جاهزاً، أو ابنِ واحدة من البداية.', 'Choose a suggested automation, a ready template, or build one from scratch.'),
      tx('اختر Trigger: متى تبدأ الأتمتة.', 'Choose a Trigger: when the automation starts.'),
      tx('اختياري: اضغط + أسفل Trigger لإضافة Conditions (خطة Business وما فوقها).', 'Optional: click + below the Trigger to add Conditions (Business plan and above).'),
      tx('أضف Action واحداً أو أكثر: ما يفعله ClickUp.', 'Add one or more Actions: what ClickUp does.'),
      tx('أنشئها وجرّبها على مهمة تجريبية. يمكنك إيقافها أو تعديلها لاحقاً من قائمة الإدارة.', 'Create it and test it on a sample task. You can turn it off or edit it later from the manage list.')
    ].map((h, k) => '<li style="--k:' + k + '"><span class="num">' + (k + 1) + '</span><p>' + h + '</p></li>').join('') + '</ol>' +
    '<div class="au-shot" aria-hidden="true"><div class="au-shot-bar"><span>' + L_OPS() + ' / <b>' + L_REQ() + '</b></span><span class="au-shot-robot">' + icon('robot') + '</span><span class="au-shot-share">Share</span></div>' +
    '<div class="au-shot-menu"><b>Automations</b><span class="au-shot-create">' + icon('plus', 'icon-sm') + 'Create Automation</span><span>' + icon('sparkle', 'icon-sm') + tx('اقتراحات', 'Suggested') + '</span><span>' + icon('template', 'icon-sm') + 'Templates</span></div></div></div>' +
    '<p class="help-text">' + tx('قد تختلف أسماء الأزرار ومواضعها قليلاً بين إصدارات ClickUp.', 'Button names and positions may differ slightly between ClickUp versions.') + ' <a href="https://help.clickup.com/hc/en-us/articles/6312102752791-Intro-to-Automations" target="_blank" rel="noopener noreferrer">' + icon('external', 'icon-sm') + 'Intro to Automations' + NEW_TAB() + '</a></p>';

  /* ---- 5. Good to know ---- */
  const knowHTML = () => {
    const faq = [
      [tx('لماذا لم تعمل الأتمتة؟', 'Why didn’t my automation run?'), tx('تأكد أنها مفعّلة، وأن الحدث يطابق Trigger تماماً (مثل الحالة الصحيحة)، وأن الشروط متحققة، وأن مساحة العمل لم تصل إلى حدها الشهري من الإجراءات.', 'Check it is turned on, that the event matches the Trigger exactly (such as the right status), that the conditions are true, and that the Workspace has not reached its monthly action limit.')],
      [tx('هل يمكن لأتمتة واحدة أن تفعل عدة أشياء؟', 'Can one automation do several things?'), tx('نعم، أضف أكثر من Action. الاستثناء: إجراء Send email يُجمع فقط مع إجراءات Send email أخرى.', 'Yes, add several Actions. The exception: a Send email action can only be combined with other Send email actions.')]
    ].concat(CU_FAQ.filter(f => f.part === 'auto').map(f => [tp(f.q), tp(f.a)]));
    return '<p class="tp-kicker">' + tx('قبل أن تبدأ', 'Before you start') + '</p><h2>' + tx('معلومات مهمة ونصائح', 'Good to know, and tips') + '</h2><div class="au-know">' + [
      ['chart', '#ff4d6d', tx('الحد الشهري', 'Monthly limit'), tx('لكل مساحة عمل عدد شهري من إجراءات الأتمتة يعتمد على الخطة. كل إجراء يُنفَّذ يُحسب حتى لو فشل، أما الإجراء الذي تخطّاه شرط فلا يُحسب. عند بلوغ الحد تتوقف الأتمتة حتى الشهر التالي.', 'Each Workspace has a monthly number of automation actions that depends on the plan. Every action that runs counts, even if it fails; an action skipped by a condition does not. When the limit is reached, automations pause until the next month.')],
      ['flask', '#1fb6e0', tx('جرّب أولاً', 'Test first'), tx('جرّب الأتمتة على مهمة تجريبية قبل الاعتماد عليها في عمل حقيقي.', 'Try an automation on a sample task before relying on it for real work.')],
      ['repeat', '#f5a524', tx('تجنّب التعارض', 'Avoid clashes'), tx('لا تجعل أتمتتين تغيّران الشيء نفسه بطريقتين مختلفتين، وكن محدداً في الشروط.', 'Don’t let two automations change the same thing in different ways, and be specific with conditions.')],
      ['sparkle', '#a855f7', tx('صفها بكلماتك', 'Describe it in words'), tx('إن كان ClickUp Brain متاحاً لكم، صف الأتمتة بكلمات بسيطة وراجع ما يقترحه قبل الحفظ.', 'If ClickUp Brain is available to you, describe the automation in plain words and review what it suggests before saving.')]
    ].map(x => '<div class="why-card" style="--tc:' + x[1] + '"><span class="ic-tile">' + icon(x[0]) + '</span><h3>' + x[2] + '</h3><p>' + x[3] + '</p></div>').join('') + '</div>' +
      '<p class="tp-kicker" style="margin-top:22px">' + tx('أسئلة شائعة', 'Common questions') + '</p><div class="cuq-list">' + faq.map(f => '<details class="cuq"><summary>' + icon('help', 'icon-sm') + '<span>' + f[0] + '</span><span class="chev">' + icon('fwd', 'icon-sm') + '</span></summary><div class="cuq-a"><p>' + f[1] + '</p></div></details>').join('') + '</div>' +
      '<div class="ex-actions" style="margin-top:16px"><a class="btn btn-secondary" href="#/lesson/l9-1">' + icon('book', 'icon-sm') + tx('درس: Trigger ثم Condition ثم Action', 'Lesson: Trigger, Condition, Action') + '</a><a class="btn btn-secondary" href="#/support">' + icon('users', 'icon-sm') + tx('اسأل الفريق', 'Ask the team') + '</a></div>';
  };

  const BODY = [howHTML, typesHTML, buildHTML, inClickUpHTML, knowHTML];
  const paint = dir => {
    panel.innerHTML = '<div class="tp-body' + (dir ? ' tp-in' : '') + '" style="--dir:' + (dir || 1) + '">' + BODY[step]() + '</div>';
    if (step === 2) paintLab();
    $$('[data-astep]', main).forEach(b => { const k = +b.dataset.astep; b.setAttribute('aria-current', k === step ? 'step' : 'false'); b.classList.toggle('done', k < step); });
    $('[data-ago="-1"]', main).hidden = step === 0;
    const fwd = $('[data-ago="1"]', main); fwd.hidden = step === 4;
    if (step < 4) $('span', fwd).textContent = tx('التالي: ', 'Next: ') + STEPS[step + 1][1];
    UIState.set('au-step', step);
  };
  const goStep = (to, focus) => {
    const d = to > step ? 1 : -1; step = to; paint(d);
    const top = panel.getBoundingClientRect().top;
    if (top < 70 || top > window.innerHeight * .6) $('.tour-steps', main).scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    if (focus) { const h = $('h2', panel); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
  };
  paint(0);

  main.addEventListener('click', e => {
    const st = e.target.closest('[data-astep]'); if (st) { if (+st.dataset.astep !== step) goStep(+st.dataset.astep, true); return; }
    const g = e.target.closest('[data-ago]'); if (g) { goStep(clamp(step + +g.dataset.ago, 0, 4), true); return; }
    const tr = e.target.closest('[data-try]');
    if (tr) { const [i, j] = tr.dataset.try.split(':').map(Number); const r = AU.TYPES()[i].r[j]; const s = S(); s.draft = JSON.parse(JSON.stringify(r)); s.view = 'build'; put(s); if (step !== 2) goStep(2, false); else paintLab(); return; }
    const s = S();
    const v = e.target.closest('[data-view]'); if (v) { s.view = v.dataset.view; put(s); paintLab(); return; }
    if (e.target.closest('[data-new]')) { s.draft = { t: { k: 'status', v: 'review' }, c: [], a: [{ k: 'assignee', v: 'salim' }] }; s.view = 'build'; put(s); paintLab(); const f = $('[data-f="t.k"]', panel); if (f) f.focus(); return; }
    if (e.target.closest('[data-cancel]')) { s.view = 'manage'; s.draft = null; put(s); paintLab(); return; }
    const add = e.target.closest('[data-add]');
    if (add && s.draft) { if (add.dataset.add === 'c') s.draft.c.push({ k: 'priority', v: 'high' }); else s.draft.a.push({ k: 'comment', v: 'review' }); put(s); paintLab(); return; }
    const rm = e.target.closest('[data-rm]');
    if (rm && s.draft) { const [arr, i] = rm.dataset.rm.split('.'); s.draft[arr].splice(+i, 1); put(s); paintLab(); return; }
    if (e.target.closest('[data-create]') && s.draft && !AU.emailMix(s.draft.a)) {
      const list = AU.autos().concat([Object.assign(JSON.parse(JSON.stringify(s.draft)), { id: uid('au'), on: true, by: null })]);
      AU.saveAutos(list); s.view = 'manage'; s.draft = null; put(s); paintLab();
      toast(tx('أُنشئت الأتمتة. جرّبها على المهمة التجريبية.', 'Automation created. Try it on the sample task.')); Motion.confetti($('[data-modal]', panel), 40); return;
    }
    const tg = e.target.closest('[data-toggle]'); if (tg) { AU.saveAutos(AU.autos().map(a => a.id === tg.dataset.toggle ? Object.assign(a, { on: !a.on }) : a)); paintLab(); const again = $('[data-toggle="' + tg.dataset.toggle + '"]', panel); if (again) again.focus(); return; }
    const dl = e.target.closest('[data-del]'); if (dl) { AU.saveAutos(AU.autos().filter(a => a.id !== dl.dataset.del)); paintLab(); return; }
    const ev = e.target.closest('[data-ev]'); if (ev) { fire(ev.dataset.ev); return; }
  });
  main.addEventListener('change', e => {
    const f = e.target.dataset && e.target.dataset.f; if (!f) return;
    const s = S(); const parts = f.split('.');
    if (parts[0] === 'ev') { fire(parts[1], e.target.value); return; }
    if (!s.draft) return;
    const d = s.draft; const val = e.target.value;
    if (parts[0] === 't') { if (parts[1] === 'k') { d.t = { k: val, v: AU.TRIG[val].p ? AU.first(AU.TRIG[val].p) : null }; } else d.t.v = val; }
    else { const item = d[parts[0]][+parts[1]]; const DEF = parts[0] === 'c' ? AU.COND : AU.ACT; if (parts[2] === 'k') { item.k = val; item.v = AU.first(DEF[val].p); } else item.v = val; }
    put(s); paintLab(); const again = $('[data-f="' + f + '"]', panel); if (again) again.focus();
  });
}
