/* ==========================================================================
   Practice Lab: one shared training data model. List, Board, Calendar,
   Table, the Dashboard Studio charts and the practical assessment all read
   from Lab.tasks(), so a change anywhere is reflected everywhere.
   All names, tasks and numbers are fictional training data.
   ========================================================================== */

const LAB_LISTS = [
  { id: 'weekly', name: 'التقارير الأسبوعية' },
  { id: 'requests', name: 'طلبات داخلية' },
  { id: 'audit', name: 'إجراءات التدقيق' },
  { id: 'service', name: 'مبادرة تحسين الخدمة' }
];
const LAB_LIST = Object.fromEntries(LAB_LISTS.map(l => [l.id, l]));
const CAPACITY_H = 10; // weekly capacity per person used by the workload chart

function badge(k) { return '<span class="status-badge st-' + k + '">' + STATUS[k].en + '</span>'; }
function prioHTML(k) { return k ? '<span class="prio prio-' + k + '">' + prioFlag() + '<span dir="ltr">' + PRIORITY[k].en + '</span></span>' : '<span class="muted small">-</span>'; }
function avatarHTML(pid, size) {
  if (!pid || !PERSON[pid]) return '<span class="avatar avatar-empty" title="بدون مسؤول" aria-label="بدون مسؤول">' + icon('user', 'icon-sm') + '</span>';
  const p = PERSON[pid]; const s = size ? ' style="width:' + size + 'px;height:' + size + 'px"' : '';
  return '<span class="avatar" style="background:' + p.color + (size ? ';width:' + size + 'px;height:' + size + 'px' : '') + '" title="' + esc(p.name) + '">' + p.initials + '</span>' + (s ? '' : '');
}
function isOverdue(task) { return task.status !== 'done' && task.due && task.due < todayISO(); }

const Lab = (() => {
  const listeners = new Set();
  let S = null;

  function seed() {
    const T = todayISO(); const d = n => addDays(T, n);
    const mk = (id, list, title, who, pr, status, start, due, est, extra) => Object.assign({
      id, list, title, desc: '', assignee: who, priority: pr, status, start: start == null ? '' : d(start), due: due == null ? '' : d(due),
      estimate: est || 0, tags: [], checklist: [], comments: [], deps: [], created: Date.now() - 86400000 * 30, completedAt: null, learner: false, activity: []
    }, extra || {});
    const done = (n) => ({ completedAt: new Date(parseISO(d(n)).getTime() + 13 * 3600000).getTime() });
    const tasks = [
      mk('w1', 'weekly', 'جمع أرقام مركز الاتصال للأسبوع', 'maryam', 'normal', 'todo', -1, 1, 2, { tags: ['weekly-report'] }),
      mk('w2', 'weekly', 'تحديث لوحة مؤشرات الشكاوى', 'maryam', 'high', 'progress', -3, -1, 4, { tags: ['weekly-report'] }),
      mk('w3', 'weekly', 'مراجعة ملاحظات اجتماع الأسبوع الماضي', 'salim', 'low', 'todo', null, 3, 1),
      mk('w4', 'weekly', 'إرسال تقرير الأسبوع الماضي للإدارة', 'noura', 'normal', 'done', -6, -4, 1, done(-5)),
      mk('w5', 'weekly', 'تدقيق أرقام الإيرادات مع المالية', 'salim', 'urgent', 'review', -2, 0, 3),
      mk('w6', 'weekly', 'قراءة دليل إعداد التقرير الأسبوعي', 'me', 'low', 'todo', null, 2, 1),
      mk('w7', 'weekly', 'أرشفة تقارير الربع الثاني', 'noura', 'low', 'done', -26, -24, 2, done(-24)),
      mk('w8', 'weekly', 'إعداد قالب التقرير الأسبوعي الجديد', 'maryam', 'normal', 'done', -33, -29, 3, done(-31)),
      mk('r1', 'requests', 'طلب تقرير مبيعات الباقات الشهري', 'khalid', 'high', 'progress', -2, 4, 5),
      mk('r2', 'requests', 'طلب تحديث بيانات فريق الدعم في الدليل', 'noura', 'normal', 'todo', null, 6, 1),
      mk('r3', 'requests', 'طلب طباعة بطاقات تعريف للمتدربين', 'salim', 'low', 'done', -11, -9, 1, done(-9)),
      mk('r4', 'requests', 'طلب إعداد عرض لزيارة الإدارة', 'maryam', 'high', 'todo', -4, -2, 6),
      mk('r5', 'requests', 'طلب مراجعة نموذج الإجازات', 'khalid', 'normal', 'review', -3, 2, 2),
      mk('r6', 'requests', 'طلب قائمة حضور ورشة نقل المعرفة', 'noura', 'normal', 'done', -4, -2, 1, done(-2)),
      mk('r7', 'requests', 'طلب تحديث قائمة جهات الاتصال', 'salim', 'normal', 'done', -32, -30, 1, done(-30)),
      mk('a1', 'audit', 'إغلاق ملاحظة التدقيق 7: صلاحيات النظام', 'salim', 'high', 'progress', -5, 5, 4, { tags: ['audit'] }),
      mk('a2', 'audit', 'تحديث سجل إجراءات التدقيق', 'maryam', 'normal', 'todo', -6, -3, 2, { tags: ['audit'] }),
      mk('a3', 'audit', 'جمع مستندات ملاحظة التدقيق 9', 'noura', 'normal', 'done', -15, -12, 2, Object.assign({ tags: ['audit'] }, done(-12))),
      mk('a4', 'audit', 'اعتماد خطة معالجة ملاحظة التدقيق 11', 'khalid', 'urgent', 'review', -4, -1, 1, { tags: ['audit'] }),
      mk('a5', 'audit', 'إغلاق ملاحظة التدقيق 4', 'salim', 'normal', 'done', -20, -16, 3, Object.assign({ tags: ['audit'] }, done(-16))),
      mk('a6', 'audit', 'مراجعة سياسة أرشفة المستندات', 'khalid', 'low', 'done', -22, -19, 2, done(-20)),
      mk('s1', 'service', 'تحليل أسباب تأخر الطلبات الداخلية', 'maryam', 'high', 'done', -21, -14, 6, done(-15)),
      mk('s2', 'service', 'تصميم نموذج طلب موحد', 'noura', 'high', 'done', -14, -8, 5, Object.assign({ deps: ['s1'] }, done(-7))),
      mk('s3', 'service', 'تجربة النموذج مع إدارة واحدة', 'khalid', 'normal', 'progress', -7, 2, 4, { deps: ['s2'] }),
      mk('s4', 'service', 'تدريب الفرق على النموذج الموحد', 'noura', 'normal', 'todo', 3, 8, 3, { deps: ['s3'] }),
      mk('s5', 'service', 'قياس وقت الاستجابة بعد التطبيق', 'maryam', 'normal', 'todo', 9, 20, 3, { deps: ['s4'] }),
      mk('s6', 'service', 'نشر دليل استخدام النموذج', 'khalid', 'low', 'todo', 3, 6, 2, { deps: ['s3'] }),
      mk('s7', 'service', 'إعداد جدول ورشة التدريب', 'salim', 'normal', 'done', -28, -26, 1, done(-26))
    ];
    tasks.find(x => x.id === 'w2').desc = 'المطلوب: تحديث مؤشرات الشكاوى بأرقام الأسبوع ومقارنتها بالأسبوع السابق.';
    tasks.find(x => x.id === 'a2').checklist = [{ id: 'k1', text: 'مراجعة الإجراءات المفتوحة', done: false }];
    tasks.find(x => x.id === 'r1').comments = [{ by: 'maryam', text: 'الأرقام الأولية جاهزة في المرفق.', at: Date.now() - 86400000 }];
    return {
      v: 1, seed: T, tasks, log: [],
      ui: { view: 'list', list: 'all', q: '', assignee: '', priority: '', status: '', sort: 'none', open: null, calMonth: T.slice(0, 7) }
    };
  }

  function load() {
    const saved = Store.state.lab;
    S = saved && saved.v === 1 && Array.isArray(saved.tasks) ? saved : seed();
    if (!saved) Store.setLab(S);
  }
  function commit(kind) { Store.setLab(S); listeners.forEach(fn => { try { fn(kind); } catch (e) { console.error(e); } }); }
  function log(entry) { entry.at = Date.now(); S.log.push(entry); if (S.log.length > 400) S.log.splice(0, S.log.length - 400); }

  return {
    init: load,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    get state() { return S; },
    get ui() { return S.ui; },
    tasks() { return S.tasks; },
    task(id) { return S.tasks.find(x => x.id === id); },
    setUI(patch, kind) { Object.assign(S.ui, patch); if (patch.view) log({ type: 'view', view: patch.view }); commit(kind || 'ui'); },
    update(id, patch, via) {
      const tk = this.task(id); if (!tk) return;
      Object.keys(patch).forEach(k => {
        const from = tk[k], to = patch[k];
        if (JSON.stringify(from) === JSON.stringify(to)) return;
        tk[k] = to;
        if (k === 'status') {
          tk.completedAt = to === 'done' ? Date.now() : null;
          log({ type: 'status', id, from, to, via: via || S.ui.view });
        } else log({ type: 'field', id, field: k, via: via || S.ui.view });
        if (['status', 'assignee', 'priority', 'due', 'start', 'list', 'title'].includes(k)) {
          tk.activity.push({ at: Date.now(), text: activityText(k, from, to) });
        }
      });
      commit('task');
    },
    create(data) {
      const id = 'n' + Date.now().toString(36);
      const tk = Object.assign({ id, list: 'weekly', title: '', desc: '', assignee: '', priority: '', status: 'todo', start: '', due: '', estimate: 0, tags: [], checklist: [], comments: [], deps: [], created: Date.now(), completedAt: null, learner: true, activity: [{ at: Date.now(), text: 'أنشأتَ المهمة' }] }, data);
      S.tasks.unshift(tk);
      log({ type: 'create', id, via: S.ui.view });
      commit('task');
      return tk;
    },
    addChecklist(id, text) { const tk = this.task(id); if (!tk || !text.trim()) return; tk.checklist.push({ id: uid('k'), text: text.trim(), done: false }); log({ type: 'checklist', id }); commit('task'); },
    toggleChecklist(id, kid) { const tk = this.task(id); const k = tk && tk.checklist.find(x => x.id === kid); if (!k) return; k.done = !k.done; log({ type: 'checklist', id }); commit('task'); },
    removeChecklist(id, kid) { const tk = this.task(id); if (!tk) return; tk.checklist = tk.checklist.filter(x => x.id !== kid); commit('task'); },
    addComment(id, text) { const tk = this.task(id); if (!tk || !text.trim()) return; tk.comments.push({ by: 'me', text: text.trim(), at: Date.now() }); log({ type: 'comment', id, mention: /@/.test(text) }); commit('task'); },
    logOpen(id) { log({ type: 'open', id, via: S.ui.view }); },
    reset() { S = seed(); Store.setLab(S); commit('reset'); },
    visible() {
      const u = S.ui; const q = u.q.trim();
      let out = S.tasks.filter(tk =>
        (u.list === 'all' || tk.list === u.list) &&
        (!u.assignee || (u.assignee === 'none' ? !tk.assignee : tk.assignee === u.assignee)) &&
        (!u.priority || tk.priority === u.priority) &&
        (!u.status || tk.status === u.status) &&
        (!q || tk.title.includes(q) || (tk.desc || '').includes(q) || tk.tags.some(g => g.includes(q))));
      return sortTasks(out, u.sort);
    },
    activeFilterCount() { const u = S.ui; return ['q', 'assignee', 'priority', 'status'].filter(k => u[k]).length; }
  };
})();

function activityText(k, from, to) {
  const lbl = { status: 'الحالة', assignee: 'المسؤول', priority: 'الأولوية', due: 'تاريخ الاستحقاق', start: 'تاريخ البدء', list: 'القائمة', title: 'العنوان' }[k];
  const fmt = v => k === 'status' ? STATUS[v].en : k === 'assignee' ? (v ? PERSON[v].short : 'بدون') : k === 'priority' ? (v ? PRIORITY[v].en : 'بدون') : (k === 'due' || k === 'start') ? (v ? fmtDate(v) : 'بدون') : k === 'list' ? LAB_LIST[v].name : v;
  return 'غيّرتَ ' + lbl + ' من «' + fmt(from) + '» إلى «' + fmt(to) + '»';
}
function sortTasks(arr, how) {
  const a = arr.slice();
  if (how === 'due') a.sort((x, y) => (x.due || '9999').localeCompare(y.due || '9999'));
  else if (how === 'priority') a.sort((x, y) => (x.priority ? PRIORITY[x.priority].rank : 9) - (y.priority ? PRIORITY[y.priority].rank : 9));
  else if (how === 'title') a.sort((x, y) => x.title.localeCompare(y.title, 'ar'));
  return a;
}

/* ---------- Guided challenges (validated against the model + action log) ---------- */
const CHALLENGES = [
  { id: 'c1', title: 'مهمة التقرير الأسبوعي', text: 'أنشئ مهمة لمراجعة التقرير الأسبوعي، وعيّن لها مسؤولاً، وحدد تاريخ استحقاق، ثم انقلها إلى IN PROGRESS.',
    steps: ['أنشئ مهمة جديدة يتضمن عنوانها «التقرير الأسبوعي»', 'عيّن لها مسؤولاً', 'حدد تاريخ استحقاق', 'انقلها إلى IN PROGRESS'],
    check(S) {
      const c = S.tasks.filter(x => x.learner && /التقرير\s*الأسبوعي/.test(x.title));
      const best = c.map(x => [true, !!x.assignee, !!x.due, x.status === 'progress']).sort((a, b) => b.filter(Boolean).length - a.filter(Boolean).length)[0];
      return best || [false, false, false, false];
    } },
  { id: 'c2', title: 'قائمة تحقق لسجل التدقيق', text: 'في مهمة «تحديث سجل إجراءات التدقيق» اجعل قائمة التحقق 3 بنود على الأقل، وعلّم بنداً واحداً مكتملاً.',
    steps: ['افتح مهمة «تحديث سجل إجراءات التدقيق»', 'اجعل عدد البنود 3 أو أكثر', 'علّم بنداً واحداً على الأقل مكتملاً'],
    check(S) { const tk = S.tasks.find(x => x.id === 'a2'); const opened = S.log.some(l => l.type === 'open' && l.id === 'a2'); return tk ? [opened, tk.checklist.length >= 3, tk.checklist.some(k => k.done)] : [false, false, false]; } },
  { id: 'c3', title: 'تصعيد مهمة متأخرة', text: 'مهمة «طلب إعداد عرض لزيارة الإدارة» متأخرة. ارفع أولويتها إلى Urgent، وأضف تعليقاً تشير فيه إلى زميل بـ @.',
    steps: ['غيّر الأولوية إلى Urgent', 'أضف تعليقاً يحتوي إشارة @'],
    check(S) { const tk = S.tasks.find(x => x.id === 'r4'); return tk ? [tk.priority === 'urgent', tk.comments.some(c => c.by === 'me' && /@/.test(c.text))] : [false, false]; } },
  { id: 'c4', title: 'لوحة مريم', text: 'اعرض طريقة Board، واجعلها تعرض مهام مريم فقط.',
    steps: ['انتقل إلى Board', 'صفِّ حسب المسؤول: مريم'],
    check(S) { return [S.ui.view === 'board', S.ui.assignee === 'maryam']; } },
  { id: 'c5', title: 'من المراجعة إلى الإكمال', text: 'في Board انقل «طلب مراجعة نموذج الإجازات» من REVIEW إلى COMPLETE.',
    steps: ['استخدم طريقة Board', 'انقل المهمة إلى COMPLETE'],
    check(S) { const mv = S.log.find(l => l.type === 'status' && l.id === 'r5' && l.to === 'done' && l.via === 'board'); const tk = S.tasks.find(x => x.id === 'r5'); return [S.ui.view === 'board' || !!mv, !!mv && tk.status === 'done']; } },
  { id: 'c6', title: 'الأقرب استحقاقاً أولاً', text: 'في List رتّب المهام حسب تاريخ الاستحقاق، ثم افتح مهمة متأخرة لتراجعها.',
    steps: ['استخدم List', 'رتّب حسب Due date', 'افتح مهمة متأخرة'],
    check(S) { const open = S.log.some(l => l.type === 'open' && l.via === 'list' && (() => { const tk = S.tasks.find(x => x.id === l.id); return tk && isOverdue(tk); })()); return [S.ui.view === 'list', S.ui.sort === 'due', open]; } }
];

const PRACTICAL = {
  title: 'التحدي العملي الشامل: طلب داخلي من البداية إلى المتابعة',
  scenario: 'وصلك طلب من إدارة خدمة العملاء لإعداد «ملخص شكاوى الربع الثالث» خلال أسبوع. سجّله وتابعه كما يفعل فريق محترف، وأغلق في الطريق إجراء تدقيق اعتُمد اليوم.',
  steps: [
    'أنشئ المهمة في قائمة «طلبات داخلية» بعنوان من 4 كلمات أو أكثر',
    'عيّن مسؤولاً، واجعل الأولوية High أو Urgent',
    'حدد تاريخ استحقاق خلال الأيام السبعة القادمة',
    'أضف بندين على الأقل إلى قائمة التحقق',
    'أضف تعليقاً على المهمة',
    'انقل المهمة إلى IN PROGRESS',
    'أغلق مهمة «اعتماد خطة معالجة ملاحظة التدقيق 11» بنقلها إلى COMPLETE'
  ],
  check(S) {
    const T = todayISO();
    const cands = S.tasks.filter(x => x.learner && x.list === 'requests' && words(x.title) >= 4);
    let best = [false, false, false, false, false, false];
    cands.forEach(x => {
      const r = [true, !!x.assignee && (x.priority === 'high' || x.priority === 'urgent'), !!x.due && x.due >= T && x.due <= addDays(T, 7), x.checklist.length >= 2, x.comments.some(c => c.by === 'me'), x.status === 'progress'];
      if (r.filter(Boolean).length > best.filter(Boolean).length) best = r;
    });
    const a4 = S.tasks.find(x => x.id === 'a4');
    return best.concat([!!a4 && a4.status === 'done']);
  }
};

/* ---------- Lab UI ---------- */
const LabUI = (() => {
  let root = null, unsub = null, drag = null, picked = null;

  function mount(el) {
    root = el;
    root.innerHTML =
      '<div class="page">' +
      '<div class="page-head"><div><div class="breadcrumbs"><a href="#/home">الرئيسية</a><span aria-hidden="true">/</span><span>مختبر التطبيق</span></div>' +
      '<h1>مختبر التطبيق <bdi class="en" dir="ltr" style="font-weight:400;color:var(--ink-3);font-size:1rem">Practice Lab</bdi></h1>' +
      '<p>مساحة عمل تدريبية على نمط ClickUp ببيانات وهمية. أنشئ المهام وعدّلها وحرّكها. كل طريقة عرض، وكل رسم في استوديو لوحات المعلومات، يقرأ البيانات نفسها.</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip chip-sim">' + icon('eye', 'icon-sm') + 'محاكاة تعليمية، ليست ClickUp الحقيقي</span>' +
      '<a class="btn btn-secondary btn-sm" href="#/studio">' + icon('chart', 'icon-sm') + 'افتح الاستوديو</a>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-act="reset">' + icon('reset', 'icon-sm') + 'إعادة ضبط المختبر</button></div></div>' +
      (Store.ok ? '' : '<div class="storage-note warn">' + icon('alert') + '<p>التخزين المحلي غير متاح في هذا المتصفح، لذلك ستعمل التغييرات أثناء هذه الجلسة فقط وتضيع عند إغلاق الصفحة.</p></div>') +
      '<div class="lab"><section class="panel lab-work" aria-label="مساحة العمل التدريبية"><div data-top></div><div data-tabs></div><div data-tools></div><div class="lab-view" data-view></div></section>' +
      '<aside class="lab-side" aria-label="التحديات الموجهة"><div data-challenges></div></aside></div>' +
      '</div>' +
      '<aside class="drawer" id="taskDrawer" aria-label="تفاصيل المهمة" aria-hidden="true"></aside>';
    bind();
    paint();
    unsub = Lab.on(kind => { paint(); });
  }
  function unmount() { document.removeEventListener('keydown', escHandler); if (unsub) unsub(); unsub = null; closeDrawer(true); const d = $('#taskDrawer'); if (d) d.remove(); root = null; }

  function focusKey() { const a = document.activeElement; return a && a.dataset ? a.dataset.fk : null; }
  function restoreFocus(k) { if (!k || !root) return; const el = document.querySelector('[data-fk="' + CSS.escape(k) + '"]'); if (el) el.focus({ preventScroll: true }); }

  function paint() {
    if (!root) return;
    const fk = focusKey();
    const u = Lab.ui;
    $('[data-top]', root).innerHTML = '<div class="lab-top"><h2>' + '<span class="space-avatar started">ع</span>' + 'Space: العمليات</h2>' +
      '<div class="lab-lists" role="group" aria-label="القوائم">' +
      [['all', 'كل القوائم']].concat(LAB_LISTS.map(l => [l.id, l.name])).map(l => '<button type="button" data-fk="list-' + l[0] + '" data-list="' + l[0] + '" aria-pressed="' + (u.list === l[0]) + '">' + t(l[1]) + '</button>').join('') + '</div></div>';
    $('[data-tabs]', root).innerHTML = '<div class="view-tabs" role="tablist" aria-label="طرق العرض">' +
      [['list', 'List', 'list'], ['board', 'Board', 'board'], ['calendar', 'Calendar', 'calendar'], ['table', 'Table', 'table']].map(v =>
        '<button type="button" role="tab" data-fk="view-' + v[0] + '" data-view-tab="' + v[0] + '" aria-selected="' + (u.view === v[0]) + '">' + icon(v[2], 'icon-sm') + '<span dir="ltr">' + v[1] + '</span></button>').join('') + '</div>';
    const n = Lab.activeFilterCount();
    $('[data-tools]', root).innerHTML = '<div class="lab-tools">' +
      '<label class="visually-hidden" for="labQ">بحث في المهام</label><input class="input" id="labQ" data-fk="q" type="search" placeholder="ابحث في المهام" value="' + esc(u.q) + '">' +
      '<label class="visually-hidden" for="labA">المسؤول</label><select class="select" id="labA" data-fk="fa" data-filter="assignee"><option value="">كل المسؤولين</option><option value="none"' + (u.assignee === 'none' ? ' selected' : '') + '>بدون مسؤول</option>' + PEOPLE.map(p => '<option value="' + p.id + '"' + (u.assignee === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select>' +
      '<label class="visually-hidden" for="labP">الأولوية</label><select class="select" id="labP" data-fk="fp" data-filter="priority"><option value="">كل الأولويات</option>' + PRIORITIES.map(p => '<option value="' + p.key + '"' + (u.priority === p.key ? ' selected' : '') + ' dir="ltr">' + p.en + '</option>').join('') + '</select>' +
      (u.view !== 'board' ? '<label class="visually-hidden" for="labS">الحالة</label><select class="select" id="labS" data-fk="fs" data-filter="status"><option value="">كل الحالات</option>' + STATUSES.map(s => '<option value="' + s.key + '"' + (u.status === s.key ? ' selected' : '') + ' dir="ltr">' + s.en + '</option>').join('') + '</select>' : '') +
      '<label class="visually-hidden" for="labSort">الترتيب</label><select class="select" id="labSort" data-fk="sort" data-sort><option value="none">الترتيب: الافتراضي</option><option value="due"' + (u.sort === 'due' ? ' selected' : '') + '>Sort: Due date</option><option value="priority"' + (u.sort === 'priority' ? ' selected' : '') + '>Sort: Priority</option><option value="title"' + (u.sort === 'title' ? ' selected' : '') + '>Sort: Task name</option></select>' +
      (n ? '<button type="button" class="btn btn-ghost btn-sm" data-act="clear" data-fk="clear">' + icon('x', 'icon-sm') + 'مسح المرشّحات (' + n + ')</button>' : '') +
      '<span class="spacer"></span><span class="filter-summary" aria-live="polite">' + Lab.visible().length + ' مهمة ظاهرة</span>' +
      '<button type="button" class="btn btn-primary btn-sm" data-act="new" data-fk="new">' + icon('plus', 'icon-sm') + 'مهمة جديدة</button></div>';
    const v = $('[data-view]', root);
    v.innerHTML = VIEWS[u.view]();
    $('[data-challenges]', root).innerHTML = challengesHTML();
    if (u.open) renderDrawer();
    else { const dr = $('#taskDrawer'); if (dr) { dr.classList.remove('open'); dr.setAttribute('aria-hidden', 'true'); } }
    restoreFocus(fk);
  }

  function rowHTML(tk) {
    const open = Lab.ui.open === tk.id;
    return '<div class="lab-row' + (open ? ' is-open' : '') + '" data-open="' + tk.id + '">' +
      '<button type="button" class="lr-title" data-fk="row-' + tk.id + '" data-open="' + tk.id + '" aria-label="افتح المهمة: ' + esc(tk.title) + '">' + '<span class="st-dot st-' + tk.status + '" aria-hidden="true"></span><span>' + t(tk.title) + '</span>' +
      (tk.checklist.length ? '<small class="muted num" style="flex:none">' + icon('checklist', 'icon-sm') + '</small><small class="muted num">' + tk.checklist.filter(k => k.done).length + '/' + tk.checklist.length + '</small>' : '') +
      (tk.comments.length ? '<small class="muted num" style="flex:none;display:inline-flex;gap:2px">' + icon('message', 'icon-sm') + tk.comments.length + '</small>' : '') + '</button>' +
      '<span class="hide-sm">' + avatarHTML(tk.assignee) + '</span>' +
      '<span class="hide-sm hide-xs">' + dueHTML(tk) + '</span>' +
      '<span class="hide-sm">' + prioHTML(tk.priority) + '</span>' +
      '<span class="hide-xs">' + badge(tk.status) + '</span></div>';
  }
  function dueHTML(tk) {
    if (!tk.due) return '<span class="date-chip muted">-</span>';
    const od = isOverdue(tk); const soon = !od && tk.status !== 'done' && daysBetween(todayISO(), tk.due) <= 1;
    return '<span class="date-chip' + (od ? ' overdue' : soon ? ' soon' : '') + '">' + (od ? '<span class="visually-hidden">متأخرة: </span>' : '') + relDate(tk.due) + '</span>';
  }

  const VIEWS = {
    list() {
      const tasks = Lab.visible();
      const groups = STATUSES.filter(s => !Lab.ui.status || Lab.ui.status === s.key);
      if (!tasks.length) return emptyHTML();
      return '<div class="lab-row-head" aria-hidden="true"><span>Name</span><span class="hide-sm">Assignee</span><span class="hide-sm hide-xs">Due date</span><span class="hide-sm">Priority</span><span class="hide-xs">Status</span></div>' +
        groups.map(s => {
          const g = tasks.filter(x => x.status === s.key);
          return '<section class="lab-group" aria-label="' + s.en + '"><div class="lab-group-h">' + badge(s.key) + '<span class="num">' + g.length + '</span></div>' +
            g.map(rowHTML).join('') +
            (s.key === 'todo' ? '<form class="add-row" data-add="todo"><label class="visually-hidden" for="addTodo">عنوان مهمة جديدة</label><input class="input" id="addTodo" data-fk="add-todo" placeholder="+ أضف مهمة إلى TO DO ثم اضغط Enter"><button class="btn btn-soft btn-sm" type="submit">إضافة</button></form>' : '') + '</section>';
        }).join('');
    },
    board() {
      const tasks = Lab.visible();
      return '<p class="kb-hint" style="padding:10px 16px 0">اسحب البطاقة إلى عمود آخر، أو استخدم «نقل إلى»، أو من لوحة المفاتيح: ركّز على البطاقة واضغط <kbd>Space</kbd> لالتقاطها، ثم الأسهم للتنقل بين الأعمدة، ثم <kbd>Space</kbd> للإفلات.</p>' +
        '<div class="board" data-board>' + STATUSES.map(s => {
          const g = tasks.filter(x => x.status === s.key);
          return '<section class="board-col" data-col="' + s.key + '" aria-label="' + s.en + '، ' + g.length + ' مهام"><div class="board-col-h">' + badge(s.key) + '<span class="count">' + g.length + '</span></div>' +
            g.map(cardHTML).join('') +
            '<form class="board-add" data-add="' + s.key + '"><label class="visually-hidden" for="badd-' + s.key + '">مهمة جديدة في ' + s.en + '</label><input class="input" id="badd-' + s.key + '" data-fk="badd-' + s.key + '" placeholder="+ مهمة"><button class="icon-btn" type="submit" aria-label="إضافة">' + icon('plus', 'icon-sm') + '</button></form></section>';
        }).join('') + '</div>';
    },
    calendar() {
      const ym = Lab.ui.calMonth; const [y, m] = ym.split('-').map(Number);
      const first = new Date(y, m - 1, 1); const startDow = first.getDay();
      const daysIn = new Date(y, m, 0).getDate();
      const tasks = Lab.visible();
      const cells = [];
      for (let i = 0; i < startDow; i++) { const d = new Date(y, m - 1, 1 - (startDow - i)); cells.push({ iso: isoDate(d), other: true }); }
      for (let d = 1; d <= daysIn; d++) cells.push({ iso: isoDate(new Date(y, m - 1, d)) });
      while (cells.length % 7) { const last = parseISO(cells[cells.length - 1].iso); last.setDate(last.getDate() + 1); cells.push({ iso: isoDate(last), other: true }); }
      const T = todayISO();
      const noDue = tasks.filter(x => !x.due);
      return '<div class="cal"><div class="cal-head"><button type="button" class="icon-btn" data-cal="-1" data-fk="cal-prev" aria-label="الشهر السابق">' + icon('chev-right') + '</button>' +
        '<h3 style="min-width:140px;text-align:center">' + AR_MONTHS[m - 1] + ' ' + y + '</h3><button type="button" class="icon-btn" data-cal="1" data-fk="cal-next" aria-label="الشهر التالي">' + icon('chev-left') + '</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-cal="0" data-fk="cal-today">اليوم</button><span class="spacer" style="flex:1"></span><span class="help-text">المهام تظهر في يوم استحقاقها</span></div>' +
        '<div class="cal-grid" role="grid" aria-label="تقويم ' + AR_MONTHS[m - 1] + '">' + AR_DOW.map(d => '<div class="cal-dow" role="columnheader">' + d + '</div>').join('') +
        cells.map(c => { const list = tasks.filter(x => x.due === c.iso); return '<div class="cal-day' + (c.other ? ' other' : '') + (c.iso === T ? ' today' : '') + '" role="gridcell" aria-label="' + fmtDate(c.iso, true) + (list.length ? '، ' + list.length + ' مهام' : '') + '"><span class="d">' + parseISO(c.iso).getDate() + '</span>' +
          list.map(x => '<button type="button" class="cal-task" data-open="' + x.id + '" data-fk="cal-' + x.id + '" title="' + esc(x.title) + '"><span class="st-dot st-' + x.status + '" aria-hidden="true"></span><span class="t">' + t(x.title) + '</span><span class="visually-hidden"> ' + STATUS[x.status].en + '</span></button>').join('') + '</div>'; }).join('') + '</div>' +
        (noDue.length ? '<p class="help-text" style="margin-top:10px">بدون تاريخ استحقاق: ' + noDue.map(x => '<button type="button" class="link-btn" data-open="' + x.id + '">' + t(x.title) + '</button>').join('، ') + '</p>' : '') + '</div>';
    },
    table() {
      const tasks = Lab.visible();
      if (!tasks.length) return emptyHTML();
      return '<div class="table-wrap"><table class="data-table"><caption class="visually-hidden">مهام المختبر في جدول</caption><thead><tr><th scope="col">Task</th><th scope="col">List</th><th scope="col">Status</th><th scope="col">Assignee</th><th scope="col">Priority</th><th scope="col">Start date</th><th scope="col">Due date</th><th scope="col" class="num">Estimate</th><th scope="col" class="num">Checklist</th></tr></thead><tbody>' +
        tasks.map(x => '<tr><td><button type="button" class="linkish" data-open="' + x.id + '" data-fk="tbl-' + x.id + '">' + t(x.title) + '</button></td><td>' + t(LAB_LIST[x.list].name) + '</td>' +
          '<td><label class="visually-hidden" for="ts-' + x.id + '">حالة ' + esc(x.title) + '</label><select class="select select-sm" id="ts-' + x.id + '" data-fk="ts-' + x.id + '" data-set="status" data-id="' + x.id + '" style="width:auto">' + STATUSES.map(s => '<option value="' + s.key + '"' + (s.key === x.status ? ' selected' : '') + ' dir="ltr">' + s.en + '</option>').join('') + '</select></td>' +
          '<td>' + (x.assignee ? t(PERSON[x.assignee].short) : '<span class="muted">-</span>') + '</td><td>' + prioHTML(x.priority) + '</td><td class="num">' + (x.start ? fmtDate(x.start) : '-') + '</td><td>' + dueHTML(x) + '</td>' +
          '<td class="num" dir="ltr">' + (x.estimate ? x.estimate + 'h' : '-') + '</td><td class="num">' + (x.checklist.length ? x.checklist.filter(k => k.done).length + '/' + x.checklist.length : '-') + '</td></tr>').join('') +
        '</tbody></table></div>';
    }
  };

  function cardHTML(x) {
    return '<article class="bcard' + (picked === x.id ? ' picked' : '') + '" tabindex="0" data-card="' + x.id + '" data-fk="card-' + x.id + '" aria-roledescription="بطاقة قابلة للسحب" aria-label="' + esc(x.title) + '، ' + STATUS[x.status].en + '">' +
      '<button type="button" class="bcard-title" data-open="' + x.id + '" tabindex="-1">' + t(x.title) + '</button>' +
      '<div class="bcard-meta">' + avatarHTML(x.assignee) + dueHTML(x) + prioHTML(x.priority) + '</div>' +
      '<div class="bcard-move"><label class="visually-hidden" for="mv-' + x.id + '">نقل إلى</label><select class="select" id="mv-' + x.id + '" data-fk="mv-' + x.id + '" data-set="status" data-id="' + x.id + '" data-via="board">' +
      STATUSES.map(s => '<option value="' + s.key + '"' + (s.key === x.status ? ' selected' : '') + ' dir="ltr">' + (s.key === x.status ? s.en : 'نقل إلى ' + s.en) + '</option>').join('') + '</select>' +
      '<span class="muted small" style="margin-inline-start:auto">' + t(LAB_LIST[x.list].name) + '</span></div></article>';
  }
  function emptyHTML() {
    return '<div class="empty-state">' + icon('filter') + '<h3>لا توجد مهام تطابق المرشّحات الحالية</h3><p>المرشّح يخفي المهام ولا يحذفها. امسح المرشّحات لرؤية كل المهام.</p>' +
      '<button type="button" class="btn btn-secondary" data-act="clear">مسح المرشّحات</button></div>';
  }

  function challengesHTML() {
    const S = Lab.state;
    const done = CHALLENGES.filter(c => Store.state.challenges[c.id]).length;
    return '<div class="challenge-head"><h2 style="font-size:1rem">التحديات الموجهة</h2><span class="chip num">' + done + ' / ' + CHALLENGES.length + '</span></div>' +
      '<p class="help-text" style="margin:4px 0 10px">كل تحدٍّ يتحقق من أفعالك الفعلية في المختبر.</p><div class="challenge-list">' +
      CHALLENGES.map(c => {
        const res = c.check(S); const all = res.every(Boolean);
        if (all && Store.completeChallenge(c.id)) setTimeout(() => toast('أحسنت! أكملت تحدي «' + c.title + '»'), 50);
        const isDone = !!Store.state.challenges[c.id];
        return '<div class="panel challenge' + (isDone ? ' is-done' : '') + '"><h3>' + (isDone ? '<span style="color:var(--ok)">' + icon('check-circle') + '</span>' : icon('flask')) + '<span>' + t(c.title) + '</span></h3><p class="small">' + t(c.text) + '</p>' +
          '<ul class="goal-list">' + c.steps.map((s, i) => '<li class="' + (res[i] || isDone ? 'met' : '') + '"><span class="gtick">' + (res[i] || isDone ? icon('check') : '') + '</span><span class="small">' + t(s) + '</span></li>').join('') + '</ul></div>';
      }).join('') + '</div>';
  }

  /* ---------- Drawer ---------- */
  function openTask(id, fromEl) {
    Lab.logOpen(id);
    lastTrigger = fromEl || document.activeElement;
    Lab.setUI({ open: id }, 'open');
    const d = $('#taskDrawer');
    requestAnimationFrame(() => { const f = d && d.querySelector('.title-input'); if (f) f.focus({ preventScroll: true }); });
  }
  let lastTrigger = null;
  function closeDrawer(silent) {
    const d = $('#taskDrawer'); if (!d) return;
    d.classList.remove('open'); d.setAttribute('aria-hidden', 'true');
    if (!silent && Lab.state && Lab.ui.open) { Lab.ui.open = null; Store.setLab(Lab.state); paint(); }
    if (!silent && lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
  }
  function renderDrawer() {
    const d = $('#taskDrawer'); const x = Lab.task(Lab.ui.open);
    if (!d) return;
    if (!x) { d.classList.remove('open'); return; }
    const deps = x.deps.map(id => Lab.task(id)).filter(Boolean);
    const waitingOnMe = Lab.tasks().filter(o => o.deps.includes(x.id));
    const fk = focusKey();
    d.innerHTML = '<div class="drawer-head"><span class="crumb">' + t('Space: العمليات / ' + LAB_LIST[x.list].name) + '</span><span style="flex:1"></span>' +
      '<span class="chip chip-sim">' + icon('eye', 'icon-sm') + 'محاكاة</span><button type="button" class="icon-btn" data-act="close" aria-label="إغلاق تفاصيل المهمة">' + icon('x') + '</button></div>' +
      '<div class="drawer-body">' +
      '<label class="visually-hidden" for="dTitle">عنوان المهمة</label><input class="input title-input" id="dTitle" data-fk="d-title" data-set="title" value="' + esc(x.title) + '">' +
      (isOverdue(x) ? '<div class="feedback bad">' + icon('alert') + '<div>متأخرة: تاريخ الاستحقاق ' + fmtDate(x.due) + ' مضى والمهمة غير مغلقة.</div></div>' : '') +
      '<div class="props">' +
      prop('Status', 'الحالة', '<select class="select select-sm" id="dStatus" data-fk="d-status" data-set="status">' + STATUSES.map(s => '<option value="' + s.key + '"' + (s.key === x.status ? ' selected' : '') + ' dir="ltr">' + s.en + '</option>').join('') + '</select>', 'dStatus') +
      prop('Assignee', 'المسؤول', '<select class="select select-sm" id="dAs" data-fk="d-as" data-set="assignee"><option value="">بدون مسؤول</option>' + PEOPLE.map(p => '<option value="' + p.id + '"' + (p.id === x.assignee ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select>', 'dAs') +
      prop('Priority', 'الأولوية', '<select class="select select-sm" id="dPr" data-fk="d-pr" data-set="priority"><option value="">بدون</option>' + PRIORITIES.map(p => '<option value="' + p.key + '"' + (p.key === x.priority ? ' selected' : '') + ' dir="ltr">' + p.en + '</option>').join('') + '</select>', 'dPr') +
      prop('Start date', 'تاريخ البدء', '<input type="date" class="input input-sm" id="dStart" data-fk="d-start" data-set="start" value="' + x.start + '">', 'dStart') +
      prop('Due date', 'تاريخ الاستحقاق', '<input type="date" class="input input-sm" id="dDue" data-fk="d-due" data-set="due" value="' + x.due + '">', 'dDue') +
      prop('Time estimate', 'تقدير الوقت (ساعات)', '<input type="number" min="0" max="80" step="0.5" class="input input-sm" id="dEst" data-fk="d-est" data-set="estimate" value="' + (x.estimate || '') + '" dir="ltr">', 'dEst') +
      prop('List', 'القائمة', '<select class="select select-sm" id="dList" data-fk="d-list" data-set="list">' + LAB_LISTS.map(l => '<option value="' + l.id + '"' + (l.id === x.list ? ' selected' : '') + '>' + esc(l.name) + '</option>').join('') + '</select>', 'dList') +
      prop('Tags', 'الوسوم', '<input class="input input-sm" id="dTags" data-fk="d-tags" data-set="tags" value="' + esc(x.tags.join('، ')) + '" placeholder="افصل بفاصلة">', 'dTags') +
      '</div>' +
      (deps.length || waitingOnMe.length ? '<div><p class="field-label">Dependencies</p><ul class="activity" style="color:var(--ink-2)">' + deps.map(o => '<li>' + icon('link', 'icon-sm') + ' تنتظر <bdi dir="ltr">(Waiting on)</bdi>: ' + t(o.title) + ' ' + badge(o.status) + '</li>').join('') + waitingOnMe.map(o => '<li>' + icon('link', 'icon-sm') + ' تحجب <bdi dir="ltr">(Blocking)</bdi>: ' + t(o.title) + '</li>').join('') + '</ul></div>' : '') +
      '<div class="field"><label for="dDesc">الوصف <bdi class="en" dir="ltr">Description</bdi></label><textarea class="textarea" id="dDesc" data-fk="d-desc" data-set="desc" placeholder="المطلوب: ... يُعدّ منجزاً عندما: ...">' + esc(x.desc) + '</textarea></div>' +
      '<div><p class="field-label" id="ckLbl">قائمة التحقق <bdi class="en" dir="ltr">Checklist</bdi> <span class="num muted">' + x.checklist.filter(k => k.done).length + '/' + x.checklist.length + '</span></p><ul class="checklist" aria-labelledby="ckLbl">' +
      x.checklist.map(k => '<li class="' + (k.done ? 'done' : '') + '"><input type="checkbox" id="ck-' + k.id + '" data-fk="ck-' + k.id + '" data-ck="' + k.id + '"' + (k.done ? ' checked' : '') + '><label for="ck-' + k.id + '"><span>' + t(k.text) + '</span></label><button type="button" class="icon-btn" data-ckdel="' + k.id + '" aria-label="حذف البند: ' + esc(k.text) + '">' + icon('trash', 'icon-sm') + '</button></li>').join('') + '</ul>' +
      '<form class="add-row" style="padding:6px 0 0" data-ckadd><label class="visually-hidden" for="ckNew">بند جديد</label><input class="input input-sm" id="ckNew" data-fk="ck-new" placeholder="+ أضف بنداً"><button class="btn btn-soft btn-sm" type="submit">إضافة</button></form></div>' +
      '<div><p class="field-label">التعليقات <bdi class="en" dir="ltr">Comments</bdi></p><div class="comments">' +
      (x.comments.length ? x.comments.map(c => '<div class="comment">' + avatarHTML(c.by) + '<div class="bubble"><small>' + t(PERSON[c.by].short) + '، ' + fmtStamp(c.at) + '</small>' + t(c.text).replace(/@([؀-ۿ\w]+)/g, '<b style="color:var(--accent-ink)">@$1</b>') + '</div></div>').join('') : '<p class="help-text">لا توجد تعليقات بعد.</p>') +
      '</div><form data-cmadd style="display:grid;gap:6px;margin-top:8px"><label class="visually-hidden" for="cmNew">تعليق جديد</label><textarea class="textarea" id="cmNew" data-fk="cm-new" style="min-height:64px" placeholder="اكتب تعليقاً. استخدم @ لإشارة زميل، مثل @مريم"></textarea><div><button class="btn btn-soft btn-sm" type="submit">' + icon('message', 'icon-sm') + 'إرسال التعليق</button></div></form></div>' +
      '<div><p class="field-label">سجل النشاط <bdi class="en" dir="ltr">Activity</bdi></p><ul class="activity">' + (x.activity.length ? x.activity.slice().reverse().slice(0, 8).map(a => '<li>' + fmtStamp(a.at) + ': ' + t(a.text) + '</li>').join('') : '<li>لا تغييرات مسجلة في هذا التدريب.</li>') + '</ul></div>' +
      '</div>';
    d.classList.add('open'); d.setAttribute('aria-hidden', 'false');
    restoreFocus(fk);
  }
  function prop(en, ar, control, id) { return '<label class="pk" for="' + id + '">' + ar + ' <bdi class="en muted" dir="ltr">' + en + '</bdi></label><div>' + control + '</div>'; }

  function setField(id, k, val, via) {
    if (k === 'tags') val = val.split(/[،,]/).map(s => s.trim()).filter(Boolean);
    if (k === 'estimate') val = Math.max(0, parseFloat(val) || 0);
    if (k === 'title' && !val.trim()) { toast('العنوان لا يمكن أن يكون فارغاً'); paint(); return; }
    Lab.update(id, { [k]: val }, via);
    if (k === 'status') announce('الحالة الآن ' + STATUS[val].en);
  }

  function bind() {
    root.addEventListener('click', e => {
      const a = e.target.closest('[data-act]');
      if (a) {
        const act = a.dataset.act;
        if (act === 'reset') {
          confirmDialog('إعادة ضبط المختبر؟', 'ستعود كل المهام إلى بياناتها التدريبية الأصلية وتُحذف المهام التي أنشأتها. تقدّمك في الدروس والتحديات المكتملة لا يتأثر.', 'إعادة الضبط').then(ok => { if (ok) { Lab.reset(); toast('أُعيد ضبط المختبر'); } });
        } else if (act === 'clear') Lab.setUI({ q: '', assignee: '', priority: '', status: '' });
        else if (act === 'new') { const tk = Lab.create({ list: Lab.ui.list === 'all' ? 'weekly' : Lab.ui.list, title: 'مهمة جديدة' }); openTask(tk.id); }
        else if (act === 'close') closeDrawer();
        return;
      }
      const lb = e.target.closest('[data-list]'); if (lb) { Lab.setUI({ list: lb.dataset.list }); return; }
      const vt = e.target.closest('[data-view-tab]'); if (vt) { picked = null; Lab.setUI({ view: vt.dataset.viewTab }); return; }
      const cal = e.target.closest('[data-cal]');
      if (cal) {
        const dlt = +cal.dataset.cal; let ym;
        if (dlt === 0) ym = todayISO().slice(0, 7);
        else { const [y, m] = Lab.ui.calMonth.split('-').map(Number); const dd = new Date(y, m - 1 + dlt, 1); ym = isoDate(dd).slice(0, 7); }
        Lab.setUI({ calMonth: ym }); return;
      }
      if (e.target.closest('select, input, label, textarea')) return;
      const op = e.target.closest('[data-open]');
      if (op && !(drag && drag.moved)) { openTask(op.dataset.open, op); }
    });
    const drawerEvents = d => {
      d.addEventListener('click', e => {
        const del = e.target.closest('[data-ckdel]'); if (del) Lab.removeChecklist(Lab.ui.open, del.dataset.ckdel);
      });
      d.addEventListener('change', e => {
        const k = e.target.dataset.set; const id = Lab.ui.open;
        if (k) setField(id, k, e.target.value, 'panel');
        if (e.target.dataset.ck) Lab.toggleChecklist(id, e.target.dataset.ck);
      });
      d.addEventListener('submit', e => {
        e.preventDefault(); const id = Lab.ui.open;
        if (e.target.matches('[data-ckadd]')) { const inp = $('#ckNew', d); const v = inp.value; if (v.trim()) { Lab.addChecklist(id, v); requestAnimationFrame(() => { const n = $('#ckNew'); if (n) n.focus(); }); } }
        if (e.target.matches('[data-cmadd]')) { const inp = $('#cmNew', d); if (inp.value.trim()) { Lab.addComment(id, inp.value); announce('أُضيف التعليق'); } }
      });
      d.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); closeDrawer(); } });
    };
    drawerEvents($('#taskDrawer'));
    root.addEventListener('change', e => {
      const f = e.target.dataset.filter; if (f) { Lab.setUI({ [f]: e.target.value }); return; }
      if (e.target.dataset.sort != null) { Lab.setUI({ sort: e.target.value }); return; }
      if (e.target.dataset.set && e.target.dataset.id) setField(e.target.dataset.id, e.target.dataset.set, e.target.value, e.target.dataset.via || Lab.ui.view);
    });
    root.addEventListener('input', debounce(e => { if (e.target.id === 'labQ') Lab.setUI({ q: e.target.value }); }, 180));
    root.addEventListener('submit', e => {
      const f = e.target.closest('[data-add]'); if (!f) return;
      e.preventDefault(); const inp = $('input', f); const title = inp.value.trim();
      if (!title) { inp.focus(); return; }
      Lab.create({ title, status: f.dataset.add, list: Lab.ui.list === 'all' ? 'weekly' : Lab.ui.list });
      toast('أُنشئت المهمة «' + title + '»');
      requestAnimationFrame(() => { const n = document.querySelector('[data-fk="' + (f.dataset.add === 'todo' && Lab.ui.view === 'list' ? 'add-todo' : 'badd-' + f.dataset.add) + '"]'); if (n) n.focus(); });
    });

    /* Keyboard: pick up / move / drop board cards */
    root.addEventListener('keydown', e => {
      const card = e.target.closest && e.target.closest('.bcard');
      if (!card || e.target !== card) return;
      const id = card.dataset.card; const order = STATUSES.map(s => s.key);
      if (e.key === 'Enter') { e.preventDefault(); openTask(id, card); return; }
      if (e.key === ' ') {
        e.preventDefault();
        if (picked === id) { picked = null; announce('أُفلتت البطاقة في ' + STATUS[Lab.task(id).status].en); paint(); }
        else { picked = id; announce('التُقطت البطاقة «' + Lab.task(id).title + '». استخدم الأسهم لنقلها ثم Space للإفلات، أو Escape للإلغاء.'); paint(); }
        return;
      }
      if (picked === id && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const cur = order.indexOf(Lab.task(id).status);
        const next = clamp(cur + (e.key === 'ArrowLeft' ? 1 : -1), 0, order.length - 1); // RTL: left = next column
        if (next !== cur) { Lab.update(id, { status: order[next] }, 'board'); announce('في عمود ' + STATUSES[next].en); }
        return;
      }
      if (e.key === 'Escape' && picked) { picked = null; announce('أُلغي النقل'); paint(); }
    });
    document.addEventListener('keydown', escHandler);

    /* Pointer drag for board cards (mouse and touch) */
    root.addEventListener('pointerdown', e => {
      const card = e.target.closest('.bcard');
      if (!card || e.button > 0 || e.target.closest('select, button:not(.bcard-title), input')) return;
      drag = { id: card.dataset.card, el: card, x: e.clientX, y: e.clientY, moved: false, pid: e.pointerId };
    });
    root.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.pid) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      if (!drag.moved) { drag.moved = true; drag.el.classList.add('dragging'); try { drag.el.setPointerCapture(e.pointerId); } catch (_) { } }
      drag.el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(1.5deg)';
      drag.el.style.pointerEvents = 'none';
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const col = under && under.closest('.board-col');
      $$('.board-col', root).forEach(c => c.classList.toggle('drop-target', c === col));
      drag.col = col ? col.dataset.col : null;
    });
    const endDrag = e => {
      if (!drag) return;
      const d = drag;
      if (d.moved) {
        d.el.style.transform = ''; d.el.style.pointerEvents = ''; d.el.classList.remove('dragging');
        $$('.board-col', root).forEach(c => c.classList.remove('drop-target'));
        if (d.col && Lab.task(d.id).status !== d.col) { Lab.update(d.id, { status: d.col }, 'board'); announce('نُقلت إلى ' + STATUS[d.col].en); }
        setTimeout(() => { drag = null; }, 0);
      } else drag = null;
    };
    root.addEventListener('pointerup', endDrag);
    root.addEventListener('pointercancel', endDrag);
  }
  function escHandler(e) { if (e.key === 'Escape' && Lab.state && Lab.ui.open && $('#taskDrawer') && $('#taskDrawer').classList.contains('open')) closeDrawer(); }

  return { mount, unmount };
})();
