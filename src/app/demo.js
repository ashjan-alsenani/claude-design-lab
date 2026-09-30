/* ==========================================================================
   Demo engine: an "Educational Simulation" player.
   Everything (pointer, typing, card moves, chart bars) is a function of one
   clock that only advances while playing, so Pause genuinely stops and Replay
   genuinely resets. Scenes are reconstructed, simplified interfaces.
   Scenes are authored right-to-left; in English the stage runs left-to-right
   and every inline left/right position is mirrored.
   ========================================================================== */

const DM = {
  st: (k, d) => '<span class="mx-status st-' + k + '"' + (d ? ' data-d="' + d + '"' : '') + '>' + STATUS[k].en + '</span>',
  av: (pid, size) => { const p = PERSON[pid]; const s = size || 20; return '<span class="avatar" style="width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s / 2) + 'px;border-width:1px;background:' + p.color + '" title="' + esc(p.short) + '">' + p.initials + '</span>'; },
  noav: () => '<span class="avatar avatar-empty" style="width:20px;height:20px;font-size:10px;border-width:1px">+</span>',
  pr: k => '<span class="prio prio-' + k + '">' + prioFlag() + '<span dir="ltr">' + PRIORITY[k].en + '</span></span>',
  ic: (n, s) => '<svg class="icon" viewBox="0 0 24 24" style="width:' + (s || 13) + 'px;height:' + (s || 13) + 'px">' + ICONS[n] + '</svg>',
  kbd: keys => '<span class="mx-kbd">' + keys.split('+').map(k => '<span>' + esc(k) + '</span>').join('') + '</span>'
};
const PN = id => PERSON[id].short; // person's short name in the current language
const DAY = i => DAYN(i);
const DAYN = i => tx(['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][i], ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i]);
const L_WEEKLY = () => tx('التقارير الأسبوعية', 'Weekly reports');
const L_REQ = () => tx('طلبات داخلية', 'Internal requests');
const L_OPS = () => tx('العمليات', 'Operations');

/* Resolve @macros used in demo scripts (text actions) */
function demoMacro(v) {
  if (typeof v !== 'string') return '';
  return demoStr(v).replace(/@av:(\w+)/g, (m, id) => DM.av(id))
    .replace(/@st:(\w+)/g, (m, k) => DM.st(k))
    .replace(/@pr:(\w+)/g, (m, k) => DM.pr(k))
    .replace(/@kbd:([\w+?]+)/g, (m, k) => DM.kbd(k))
    .replace(/@ic:([\w-]+)/g, (m, k) => DM.ic(k));
}
/* Mirror inline left/right positions for the left-to-right stage */
function mirrorStyles(html) {
  if (isRTL()) return html;
  return html.replace(/style="([^"]*)"/g, (m, s) => 'style="' + s.replace(/\b(left|right)(?=\s*:)/g, w => w === 'left' ? 'right' : 'left') + '"');
}

function mxSide(active, opts) {
  opts = opts || {};
  const item = (d, label, ic, cls) => '<div class="mx-item' + (active === d ? ' on' : '') + (cls ? ' ' + cls : '') + '" data-d="' + d + '">' + (ic ? DM.ic(ic) : '') + '<span>' + label + '</span></div>';
  return '<aside class="mx-side">' +
    '<div class="mx-ws"><span class="mx-sq">' + tx('ت', 'T') + '</span><span>' + tx('مساحة عمل التدريب', 'Training Workspace') + '</span></div>' +
    item('side-home', 'Home', 'home') + item('side-inbox', 'Inbox', 'inbox') +
    (opts.extra || '') +
    '<div class="mx-note" style="padding:8px 8px 2px">Spaces</div>' +
    '<div class="mx-item' + (active === 'side-space' ? ' on' : '') + '" data-d="side-space"><span class="mx-sq">' + tx('ع', 'O') + '</span><span>' + L_OPS() + '</span></div>' +
    item('side-list-weekly', L_WEEKLY(), 'list', 'sub') +
    item('side-list-req', L_REQ(), 'list', 'sub') +
    item('side-list-audit', tx('إجراءات التدقيق', 'Audit actions'), opts.auditLock ? 'lock' : 'list', 'sub') +
    '</aside>';
}
function mxMain(title, crumb, tabs, body, extra) {
  return '<section class="mx-main"><div class="mx-head">' + title + (crumb ? '<span class="mx-crumb">' + crumb + '</span>' : '') + '</div>' +
    (tabs ? '<div class="mx-tabs">' + tabs + '</div>' : '<div></div>') +
    '<div class="mx-body" data-d="body">' + body + '</div>' + (extra || '') + '</section>';
}
const mxTab = (d, label, ic, on) => '<span class="mx-tab' + (on ? ' on' : '') + '" data-d="' + d + '">' + (ic ? DM.ic(ic, 12) : '') + label + '</span>';
const mxMenu = (d, style, items) => '<div class="mx-menu mx-hidden" data-d="' + d + '" style="' + style + '">' +
  items.map(i => '<div class="mx-mi' + (i[2] ? ' rtl' : '') + '" data-d="' + i[0] + '">' + i[1] + '</div>').join('') + '</div>';

const SCENES = {
  /* Home, Inbox, search */
  home() {
    const body =
      '<div class="mx-input" data-d="search" style="margin-bottom:10px;width:300px">' + DM.ic('search') + '<span data-d="search-text" class="mx-note">Search</span></div>' +
      '<div data-d="search-results" class="mx-menu mx-hidden" style="top:44px;right:14px;width:300px">' +
      '<div class="mx-mi rtl hl" data-d="sr1">' + DM.ic('checklist') + ' ' + tx('مراجعة التقرير الأسبوعي', 'Review the weekly report') + '</div>' +
      '<div class="mx-mi rtl" data-d="sr2">' + DM.ic('doc') + ' ' + tx('دليل إعداد التقارير (Doc)', 'Report preparation guide (Doc)') + '</div>' +
      '<div class="mx-mi rtl" data-d="sr3">' + DM.ic('list') + ' ' + L_WEEKLY() + ' (List)</div></div>' +
      '<div data-d="mywork" style="display:grid;gap:8px">' +
      '<div class="mx-group-h"><b>My Work</b><span class="mx-note">' + tx('مهامك المسندة إليك', 'Tasks assigned to you') + '</span></div>' +
      '<div class="mx-note" style="color:#c0322f">Overdue</div>' +
      '<div class="mx-row" data-d="w1"><span class="mx-t">' + DM.st('progress') + '<span class="txt">' + tx('تحديث سجل إجراءات التدقيق', 'Update the audit actions log') + '</span></span><span style="color:#c0322f">' + tx('أمس', 'Yesterday') + '</span><span>' + DM.pr('high') + '</span><span>' + DM.av('me') + '</span></div>' +
      '<div class="mx-note">Today</div>' +
      '<div class="mx-row" data-d="w2"><span class="mx-t">' + DM.st('todo') + '<span class="txt">' + tx('مراجعة التقرير الأسبوعي', 'Review the weekly report') + '</span></span><span>' + tx('اليوم', 'Today') + '</span><span>' + DM.pr('normal') + '</span><span>' + DM.av('me') + '</span></div>' +
      '<div class="mx-row" data-d="w3"><span class="mx-t">' + DM.st('todo') + '<span class="txt">' + tx('تجهيز جدول اجتماع الأحد', 'Prepare the Sunday meeting agenda') + '</span></span><span>' + tx('اليوم', 'Today') + '</span><span>' + DM.pr('low') + '</span><span>' + DM.av('me') + '</span></div>' +
      '</div>' +
      '<div data-d="inbox" class="mx-hidden" style="display:grid;gap:8px">' +
      '<div class="mx-tabs" style="padding:0"><span class="mx-tab on" data-d="ib-primary">Primary</span><span class="mx-tab" data-d="ib-other">Other</span><span class="mx-tab" data-d="ib-later">Later</span><span class="mx-tab" data-d="ib-cleared">Cleared</span></div>' +
      '<div data-d="ib-list" style="display:grid;gap:6px">' +
      '<div class="mx-comment" data-d="n1">' + DM.av('salim') + '<div>' + tx('<b>سالم</b> أشار إليك في «مراجعة الأرقام»: <span class="mx-mention">@أنت</span> هل الجدول نهائي؟', '<b>Salim</b> mentioned you in “Check the figures”: <span class="mx-mention">@You</span> is the table final?') + '<div style="display:flex;gap:6px;margin-top:4px"><span class="mx-btn ghost" data-d="n1-reply">Reply</span><span class="mx-btn ghost" data-d="n1-later">Later</span><span class="mx-btn ghost" data-d="n1-clear">Clear</span></div></div></div>' +
      '<div class="mx-comment" data-d="n2">' + DM.av('maryam') + '<div>' + tx('<b>مريم</b> عيّنتك على «تجهيز جدول اجتماع الأحد».', '<b>Maryam</b> assigned you to “Prepare the Sunday meeting agenda”.') + '</div></div>' +
      '</div><div data-d="ib-later-list" class="mx-hidden mx-note">' + tx('عناصر محفوظة لوقت لاحق', 'Items saved for later') + '</div></div>';
    return '<div class="mx">' + mxSide('side-home') + mxMain('Home', '', null, body) + '</div>';
  },

  /* Hierarchy explorer */
  hier() {
    const side = '<aside class="mx-side">' +
      '<div class="mx-ws" data-d="tree-ws"><span class="mx-sq">' + tx('ت', 'T') + '</span><span>' + tx('مساحة عمل التدريب', 'Training Workspace') + '</span></div>' +
      '<div class="mx-item" data-d="tree-space">' + DM.ic('chev-down') + '<span class="mx-sq">' + tx('ع', 'O') + '</span><span>' + L_OPS() + '</span><span data-d="space-plus" style="margin-inline-start:auto">' + DM.ic('plus') + '</span></div>' +
      '<div data-d="kids-space" class="mx-hidden">' +
      '<div class="mx-item sub" data-d="tree-folder">' + DM.ic('folder') + '<span>' + tx('متابعة التدقيق', 'Audit follow-up') + '</span></div>' +
      '<div data-d="kids-folder" class="mx-hidden">' +
      '<div class="mx-item sub2" data-d="tree-list-q3">' + DM.ic('list') + '<span>' + tx('الربع الثالث', 'Q3') + '</span></div>' +
      '<div class="mx-item sub2" data-d="tree-list-q4">' + DM.ic('list') + '<span>' + tx('الربع الرابع', 'Q4') + '</span></div></div>' +
      '<div class="mx-item sub" data-d="tree-list-req">' + DM.ic('list') + '<span>' + L_REQ() + '</span></div>' +
      '<div class="mx-item sub mx-hidden" data-d="tree-list-new">' + DM.ic('list') + '<span>' + tx('تحسين الخدمة', 'Service improvement') + '</span></div></div>' +
      '</aside>';
    const ladder = [
      ['lv-ws', 'Workspace', tx('المؤسسة كلها', 'The whole organization')], ['lv-space', 'Space', tx('إدارة أو فريق أو مبادرة', 'A department, team or initiative')], ['lv-folder', 'Folder', tx('اختياري: يجمع قوائم مترابطة', 'Optional: groups related Lists')],
      ['lv-list', 'List', tx('الحاوية التي تعيش فيها المهام', 'The container where tasks live')], ['lv-task', 'Task', tx('وحدة العمل', 'The unit of work')], ['lv-sub', 'Subtask', tx('خطوة أصغر داخل المهمة', 'A smaller step inside a task')]
    ].map((l, i) => '<div class="mx-field" data-d="' + l[0] + '" style="grid-template-columns:90px 1fr;margin-inline-start:' + (i * 14) + 'px;padding:2px 6px;border-radius:6px"><span style="font-weight:600;color:#4a36b8">' + l[1] + '</span><span>' + l[2] + '</span></div>').join('');
    const body = '<div data-d="ladder" style="display:grid;gap:4px">' + ladder + '</div>' +
      '<div data-d="pane-tasks" class="mx-hidden" style="display:grid;gap:4px;margin-top:8px">' +
      '<div class="mx-row" data-d="task-a"><span class="mx-t"><span data-d="task-a-exp">' + DM.ic(isRTL() ? 'chev-left' : 'chev-right') + '</span>' + DM.st('progress') + '<span class="txt">' + tx('إغلاق ملاحظة التدقيق 7', 'Close audit finding 7') + '</span></span><span>' + DAY(4) + '</span><span>' + DM.pr('high') + '</span><span>' + DM.av('salim') + '</span></div>' +
      '<div data-d="subs-a" class="mx-hidden">' +
      '<div class="mx-row" style="padding-inline-start:30px"><span class="mx-t">' + DM.ic('subtask') + DM.st('done') + '<span class="txt">' + tx('جمع المستندات الداعمة', 'Collect supporting documents') + '</span></span><span>' + DAY(1) + '</span><span></span><span>' + DM.av('noura') + '</span></div>' +
      '<div class="mx-row" style="padding-inline-start:30px"><span class="mx-t">' + DM.ic('subtask') + DM.st('todo') + '<span class="txt">' + tx('اعتماد الإغلاق من المدير', 'Manager approves the closure') + '</span></span><span>' + DAY(4) + '</span><span></span><span>' + DM.av('maryam') + '</span></div></div></div>' +
      mxMenu('create-menu', 'top:40px;right:150px', [['cm-folder', DM.ic('folder') + ' Folder'], ['cm-list', DM.ic('list') + ' List'], ['cm-doc', DM.ic('doc') + ' Doc']]);
    return '<div class="mx">' + side + mxMain(L_OPS(), 'Space', null, body) + '</div>';
  },

  /* List view with create/assign/date/priority/status, filters, bulk */
  list() {
    const row = (d, st, title, date, pr, who, extra) => '<div class="mx-row" data-d="' + d + '"' + (extra || '') + '><span class="mx-t"><span class="mx-chk" data-d="chk-' + d + '"></span>' + DM.st(st, d + '-st') + '<span class="txt" data-d="' + d + '-title">' + title + '</span></span><span data-d="' + d + '-due">' + date + '</span><span data-d="' + d + '-pr">' + (pr ? DM.pr(pr) : '<span class="mx-note">-</span>') + '</span><span data-d="' + d + '-as">' + (who ? DM.av(who) : DM.noav()) + '</span></div>';
    const tools = '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">' +
      '<span class="mx-btn ghost" data-d="group-btn">' + DM.ic('layers') + '<span data-d="group-label">Group: Status</span></span>' +
      '<span class="mx-btn ghost" data-d="filter-btn">' + DM.ic('filter') + 'Filter</span>' +
      '<span class="mx-btn ghost" data-d="sort-btn">' + DM.ic('sort') + 'Sort</span>' +
      '<span class="mx-tag mx-hidden" data-d="filter-chip">Assignee: ' + PN('maryam') + '</span>' +
      '<span class="mx-tag mx-hidden" data-d="sort-chip">Sort: Due date</span>' +
      '<span style="flex:1"></span><span class="mx-btn" data-d="add-task">' + DM.ic('plus') + 'Add Task</span></div>';
    const head = '<div class="mx-row" style="font-size:10.5px;color:#8a879c;background:none"><span>Name</span><span>Due date</span><span>Priority</span><span>Assignee</span></div>';
    const body = tools + head +
      '<div class="mx-group-h" data-d="gh-todo">' + DM.st('todo') + '<span data-d="n-todo">2</span></div><div data-d="g-todo">' +
      '<div class="mx-row mx-hidden" data-d="r-new"><span class="mx-t"><span class="mx-chk"></span>' + DM.st('todo', 'r-new-st') + '<span class="txt mx-input" data-d="r-new-title" style="min-width:170px;min-height:20px;padding:0 6px"></span></span><span data-d="r-new-due">' + DM.ic('calendar') + '</span><span data-d="r-new-pr">' + DM.ic('flag') + '</span><span data-d="r-new-as">' + DM.noav() + '</span></div>' +
      row('r1', 'todo', tx('جمع أرقام مركز الاتصال', 'Collect call centre figures'), DAY(0), 'normal', 'maryam') +
      row('r2', 'todo', tx('مراجعة ملاحظات الأسبوع الماضي', 'Review last week’s notes'), DAY(1), 'low', 'salim') + '</div>' +
      '<div class="mx-group-h" data-d="gh-progress">' + DM.st('progress') + '<span data-d="n-progress">1</span></div><div data-d="g-progress">' +
      row('r3', 'progress', tx('تحديث لوحة المؤشرات', 'Update the KPI dashboard'), DAY(2), 'high', 'maryam') + '</div>' +
      '<div class="mx-group-h" data-d="gh-done">' + DM.st('done') + '<span data-d="n-done">1</span></div><div data-d="g-done">' +
      row('r4', 'done', tx('إرسال تقرير الأسبوع 37', 'Send the week 37 report'), DAY(4), 'normal', 'noura') + '</div>' +
      '<div class="mx-card mx-hidden" data-d="bulk-bar" style="position:absolute;bottom:10px;left:0;right:0;margin:0 auto;width:max-content;display:flex;gap:6px;align-items:center;background:#1c1a27;color:#fff;border:0"><span data-d="bulk-count">2 selected</span><span class="mx-btn" data-d="bulk-status">Status</span><span class="mx-btn" data-d="bulk-assign">Assignee</span></div>' +
      mxMenu('assignee-menu', 'top:120px;left:10px', [['am-noura', DM.av('noura') + ' ' + PN('noura'), 1], ['am-maryam', DM.av('maryam') + ' ' + PN('maryam'), 1], ['am-salim', DM.av('salim') + ' ' + PN('salim'), 1]]) +
      mxMenu('date-menu', 'top:120px;left:130px', [['dm-today', 'Today'], ['dm-thu', 'Thursday'], ['dm-next', 'Next week']]) +
      mxMenu('prio-menu', 'top:120px;left:70px', [['pm-urgent', DM.pr('urgent')], ['pm-high', DM.pr('high')], ['pm-normal', DM.pr('normal')], ['pm-low', DM.pr('low')]]) +
      mxMenu('status-menu', 'top:120px;right:40px', [['sm-todo', DM.st('todo')], ['sm-progress', DM.st('progress')], ['sm-review', DM.st('review')], ['sm-done', DM.st('done')]]) +
      mxMenu('filter-menu', 'top:40px;right:120px', [['fm-assignee', 'Assignee is ' + PN('maryam')], ['fm-prio', 'Priority is Urgent'], ['fm-due', 'Due date is overdue']]) +
      mxMenu('sort-menu', 'top:40px;right:180px', [['srt-due', 'Due date'], ['srt-prio', 'Priority'], ['srt-name', 'Task name']]) +
      mxMenu('group-menu', 'top:40px;right:14px', [['gm-status', 'Status'], ['gm-assignee', 'Assignee'], ['gm-prio', 'Priority']]);
    return '<div class="mx">' + mxSide('side-list-weekly') + mxMain(L_WEEKLY(), L_OPS() + ' / List',
      mxTab('t-list', 'List', 'list', true) + mxTab('t-board', 'Board', 'board') + mxTab('t-cal', 'Calendar', 'calendar'), body) + '</div>';
  },

  /* Task detail */
  task() {
    const prop = (label, d, html) => '<div class="mx-field"><span>' + label + '</span><span data-d="' + d + '">' + html + '</span></div>';
    const left = '<div style="display:grid;gap:4px;align-content:start">' +
      '<div data-d="tk-title" style="font-size:15px;font-weight:600;min-height:24px;border-radius:6px;padding:0 4px">' + tx('مراجعة التقرير الأسبوعي', 'Review the weekly report') + '</div>' +
      prop('Status', 'tk-status', DM.st('todo', 'tk-st')) +
      prop('Assignees', 'tk-as', DM.noav()) +
      prop('Dates', 'tk-dates', '<span class="mx-note">Start → Due</span>') +
      prop('Priority', 'tk-pr', '<span class="mx-note">' + DM.ic('flag') + '</span>') +
      prop('Time estimate', 'tk-est', '<span class="mx-note">-</span>') +
      prop('Track time', 'tk-track', '<span class="mx-btn ghost" data-d="tk-timer">' + DM.ic('play', 11) + '<span data-d="tk-timer-val">0:00:00</span></span>') +
      prop('Tags', 'tk-tags', '<span class="mx-tag mx-hidden" data-d="tag-new">weekly-report</span><span class="mx-note" data-d="tag-add">' + DM.ic('plus') + '</span>') +
      '<div class="mx-input" data-d="tk-desc" style="min-height:52px;align-items:flex-start;margin-top:4px"><span class="mx-note" data-d="tk-desc-ph">Add description</span></div>' +
      '<div style="display:flex;gap:6px;margin-top:4px"><span class="mx-btn ghost" data-d="tk-att">' + DM.ic('clip') + 'Attach</span><span class="mx-tag mx-hidden" data-d="att-new">report-w38.xlsx</span>' +
      '<span class="mx-btn ghost" data-d="tk-recur">' + DM.ic('repeat') + '<span data-d="tk-recur-label">Recurring</span></span><span class="mx-btn ghost" data-d="tk-tpl">' + DM.ic('template') + 'Template</span></div>' +
      '</div>';
    const right = '<div style="display:grid;grid-template-rows:auto 1fr;border-inline-start:1px solid #ebe8f3;padding-inline-start:10px;min-height:0">' +
      '<div class="mx-tabs" style="padding:0">' + mxTab('tab-check', 'Checklist', 'checklist', true) + mxTab('tab-subs', 'Subtasks', 'subtask') + mxTab('tab-comments', 'Comments', 'message') + mxTab('tab-activity', 'Activity', 'clock') + '</div>' +
      '<div style="position:relative;padding-top:8px">' +
      '<div data-d="pane-check" style="display:grid;gap:5px">' +
      '<div style="display:flex;gap:6px;align-items:center" data-d="ck1"><span class="mx-chk" data-d="ck1-box"></span>' + tx('التحقق من الأرقام مع المصدر', 'Check the figures against the source') + '</div>' +
      '<div style="display:flex;gap:6px;align-items:center" data-d="ck2"><span class="mx-chk" data-d="ck2-box"></span>' + tx('إضافة الرسم البياني الأسبوعي', 'Add the weekly chart') + '</div>' +
      '<div style="display:flex;gap:6px;align-items:center" class="mx-hidden" data-d="ck3"><span class="mx-chk" data-d="ck3-box"></span><span data-d="ck3-text"></span></div>' +
      '<div class="mx-note" data-d="ck-add">' + DM.ic('plus') + ' Add item</div></div>' +
      '<div data-d="pane-subs" class="mx-hidden" style="display:grid;gap:5px">' +
      '<div class="mx-row" style="grid-template-columns:1fr 50px"><span class="mx-t">' + DM.st('done') + '<span class="txt">' + tx('جمع البيانات من الأقسام', 'Collect data from the sections') + '</span></span><span>' + DM.av('noura') + '</span></div>' +
      '<div class="mx-row mx-hidden" data-d="sub-new" style="grid-template-columns:1fr 50px"><span class="mx-t">' + DM.st('todo') + '<span class="txt" data-d="sub-new-text"></span></span><span data-d="sub-new-as">' + DM.noav() + '</span></div>' +
      '<div class="mx-note" data-d="sub-add">' + DM.ic('plus') + ' Add subtask</div></div>' +
      '<div data-d="pane-comments" class="mx-hidden" style="display:grid;gap:6px">' +
      '<div class="mx-comment" data-d="c1">' + DM.av('maryam') + '<div>' + tx('<b>مريم</b> أضفت أرقام الأسبوع في المرفق.', '<b>Maryam</b> I added this week’s figures as an attachment.') + '</div></div>' +
      '<div class="mx-comment mx-hidden" data-d="c-new">' + DM.av('me') + '<div><b>' + PN('me') + '</b> <span data-d="c-new-text"></span><div class="mx-note mx-hidden" data-d="c-assigned">' + DM.ic('user') + ' Assigned to ' + PN('salim') + ' <span class="mx-chk" data-d="c-resolve"></span> Resolve</div></div></div>' +
      '<div class="mx-input" data-d="cm-input"><span class="mx-note" data-d="cm-ph">Comment</span></div>' +
      '<div style="display:flex;gap:6px"><span class="mx-btn ghost" data-d="cm-assign">' + DM.ic('user') + 'Assign</span><span class="mx-btn" data-d="cm-send">Send</span></div></div>' +
      '<div data-d="pane-activity" class="mx-hidden" style="display:grid;gap:4px">' +
      '<div class="mx-note">' + tx('أنشأت مريم المهمة', 'Maryam created the task') + '</div><div class="mx-note">' + tx('مريم أرفقت ملفاً', 'Maryam attached a file') + '</div>' +
      '<div class="mx-note mx-hidden" data-d="act-new">' + tx('أنت غيّرت الحالة من TO DO إلى IN PROGRESS', 'You changed the status from TO DO to IN PROGRESS') + '</div></div>' +
      mxMenu('status-menu', 'top:30px;right:0', [['sm-todo', DM.st('todo')], ['sm-progress', DM.st('progress')], ['sm-review', DM.st('review')], ['sm-done', DM.st('done')]]) +
      '</div></div>';
    const menus =
      mxMenu('assignee-menu', 'top:92px;right:250px', [['am-noura', DM.av('noura') + ' ' + PN('noura'), 1], ['am-maryam', DM.av('maryam') + ' ' + PN('maryam'), 1], ['am-me', DM.av('me') + ' ' + PN('me'), 1]]) +
      mxMenu('date-menu', 'top:120px;right:250px', [['dm-start', 'Start: Sunday'], ['dm-due', 'Due: Thursday']]) +
      mxMenu('prio-menu', 'top:146px;right:250px', [['pm-urgent', DM.pr('urgent')], ['pm-high', DM.pr('high')], ['pm-normal', DM.pr('normal')]]) +
      mxMenu('est-menu', 'top:172px;right:250px', [['em-3h', '3h'], ['em-5h', '5h']]) +
      mxMenu('st-menu2', 'top:64px;right:250px', [['s2-todo', DM.st('todo')], ['s2-progress', DM.st('progress')], ['s2-review', DM.st('review')], ['s2-done', DM.st('done')]]) +
      mxMenu('recur-menu', 'top:250px;right:120px', [['rm-weekly', 'Weekly on Sunday'], ['rm-monthly', 'Monthly']]) +
      mxMenu('tpl-menu', 'top:250px;right:40px', [['tp-save', 'Save as template'], ['tp-apply', 'Apply template']]) +
      mxMenu('assign-to-menu', 'top:250px;left:20px', [['at-salim', DM.av('salim') + ' ' + PN('salim'), 1], ['at-noura', DM.av('noura') + ' ' + PN('noura'), 1]]);
    const body = '<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:12px;height:100%">' + left + right + '</div>' + menus;
    return '<div class="mx">' + mxSide('side-list-weekly') + mxMain(tx('مهمة', 'Task'), L_OPS() + ' / ' + L_WEEKLY(), null, body) + '</div>';
  },

  /* Board with columns; flow variant adds a chart and hides sidebar */
  board(opts) {
    opts = opts || {};
    const card = (d, title, who, pr, date) => '<div class="mx-card" data-d="' + d + '"><span>' + title + '</span><div class="mx-meta">' + DM.av(who) + (pr ? DM.pr(pr) : '') + '<span>' + (date || '') + '</span></div></div>';
    const DAY = i => isRTL() ? DAYN(i) : DAYN(i).slice(0, 3); // short day names on small cards
    const col = (k, cards, n) => '<div class="mx-col" data-d="col-' + k + '"><div class="mx-col-h">' + DM.st(k) + '<span data-d="n-' + k + '">' + n + '</span></div>' + cards + '</div>';
    const cols = '<div class="mx-cols" data-d="cols"' + (opts.flow ? ' style="grid-template-columns:repeat(4,minmax(0,1fr))"' : '') + '>' +
      col('todo', card('c1', tx('مراجعة التقرير الأسبوعي', 'Review the weekly report'), 'me', 'high', DAY(4)) + card('c2', tx('تجهيز محضر الاجتماع', 'Prepare the meeting minutes'), 'noura', 'normal', DAY(0)), 2) +
      col('progress', card('c3', tx('تحديث سجل الطلبات', 'Update the requests log'), 'maryam', 'normal', DAY(2)), 1) +
      col('review', card('c4', tx('خطة نقل المعرفة', 'Knowledge transfer plan'), 'khalid', 'low', DAY(1)), 1) +
      col('done', card('c5', tx('إغلاق ملاحظة التدقيق 4', 'Close audit finding 4'), 'salim', 'normal', tx('أمس', 'Yest.')), 1) + '</div>';
    if (opts.flow) {
      const lbls = ['TO DO', 'PROG.', 'REVIEW', 'DONE'];
      const bars = '<div class="mx-dash-card" style="position:absolute;left:12px;top:12px;width:200px"><b style="font-size:12px">Tasks by status</b>' +
        '<div class="mx-bars" data-d="bars" data-max="4" data-h="110" style="height:130px;justify-content:space-around">' +
        ['todo', 'progress', 'review', 'done'].map((k, i) => '<div class="mx-bar st-' + k + '" style="height:' + ([2, 1, 1, 1][i] / 4 * 110) + 'px"><b>' + [2, 1, 1, 1][i] + '</b></div>').join('') + '</div>' +
        '<div style="display:flex;justify-content:space-around;font-size:9.5px;color:#8a879c;direction:ltr"><span>' + (isRTL() ? lbls.slice().reverse() : lbls).join('</span><span>') + '</span></div>' +
        '<div class="mx-note" data-d="flow-note">' + tx('المخطط يقرأ الحالات من المهام نفسها', 'The chart reads statuses from the tasks themselves') + '</div></div>';
      return '<div class="mx" style="grid-template-columns:1fr"><section class="mx-main"><div class="mx-head">' + tx('مبادرة تحسين الخدمة', 'Service improvement initiative') + '<span class="mx-crumb">Board</span></div><div></div>' +
        '<div class="mx-body" style="padding-left:226px">' + cols + '</div>' + bars + '</section></div>';
    }
    return '<div class="mx">' + mxSide('side-list-weekly') + mxMain(L_WEEKLY(), L_OPS() + ' / Board',
      mxTab('t-list', 'List', 'list') + mxTab('t-board', 'Board', 'board', true), cols) + '</div>';
  },

  /* Views switcher */
  views() {
    const tabs = mxTab('v-list', 'List', 'list', true) + mxTab('v-board', 'Board', 'board') + mxTab('v-cal', 'Calendar', 'calendar') +
      mxTab('v-table', 'Table', 'table') + mxTab('v-gantt', 'Gantt', 'gantt') + mxTab('v-workload', 'Workload', 'workload') + mxTab('v-add', '+ View', '');
    const rows = [['todo', tx('جمع أرقام مركز الاتصال', 'Collect call centre figures'), DAY(0), 'maryam'], ['progress', tx('تحديث لوحة المؤشرات', 'Update the KPI dashboard'), DAY(2), 'maryam'], ['review', tx('خطة نقل المعرفة', 'Knowledge transfer plan'), DAY(1), 'khalid'], ['done', tx('إرسال تقرير الأسبوع 37', 'Send the week 37 report'), DAY(4), 'noura']];
    const list = '<div data-d="pane-list">' + rows.map(r => '<div class="mx-row"><span class="mx-t">' + DM.st(r[0]) + '<span class="txt">' + r[1] + '</span></span><span>' + r[2] + '</span><span></span><span>' + DM.av(r[3]) + '</span></div>').join('') + '</div>';
    const board = '<div data-d="pane-board" class="mx-hidden"><div class="mx-cols">' + ['todo', 'progress', 'review', 'done'].map((k, i) => '<div class="mx-col" style="min-height:180px"><div class="mx-col-h">' + DM.st(k) + '</div><div class="mx-card">' + rows[i][1] + '</div></div>').join('') + '</div></div>';
    let cal = '<div data-d="pane-cal" class="mx-hidden"><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;font-size:10.5px">';
    cal += [0, 1, 2, 3, 4, 5, 6].map(d => '<div style="text-align:center;color:#8a879c">' + (isRTL() ? DAY(d) : DAY(d).slice(0, 3)) + '</div>').join('');
    for (let i = 0; i < 14; i++) {
      const on = { 0: rows[0], 1: rows[2], 2: rows[1], 4: rows[3] }[i];
      cal += '<div style="min-height:62px;border:1px solid #eeecf4;border-radius:5px;padding:3px">' + (i + 14) + (on ? '<div class="mx-card" style="padding:2px 4px;font-size:10px">' + on[1] + '</div>' : '') + '</div>';
    }
    cal += '</div></div>';
    const depts = [tx('خدمة العملاء', 'Customer Service'), tx('المالية', 'Finance'), tx('الموارد البشرية', 'Human Resources'), tx('خدمة العملاء', 'Customer Service')];
    const table = '<div data-d="pane-table" class="mx-hidden"><div class="mx-row" style="grid-template-columns:1.4fr 1fr .8fr .8fr;font-weight:600;background:#f6f5fa"><span>Task</span><span>' + tx('الإدارة الطالبة', 'Requesting dept.') + '</span><span>Due</span><span>Estimate</span></div>' +
      rows.map((r, i) => '<div class="mx-row" style="grid-template-columns:1.4fr 1fr .8fr .8fr"><span>' + r[1] + '</span><span>' + depts[i] + '</span><span>' + r[2] + '</span><span dir="ltr">' + [2, 5, 3, 1][i] + 'h</span></div>').join('') + '</div>';
    const gantt = '<div data-d="pane-gantt" class="mx-hidden mx-gantt">' + rows.map((r, i) => '<div class="mx-grow"><span>' + r[1] + '</span><div class="mx-track"><div class="mx-gbar" style="right:' + (i * 60) + 'px;width:' + (90 + i * 10) + 'px;background:var(--st-' + r[0] + ')"></div></div></div>').join('') + '</div>';
    const wl = '<div data-d="pane-workload" class="mx-hidden mx-gantt">' + [['maryam', 7, 6], ['khalid', 3, 6], ['noura', 5, 6], ['salim', 2, 6]].map(w => '<div class="mx-grow"><span>' + DM.av(w[0]) + ' ' + PN(w[0]) + '</span><div class="mx-track" style="background:#f3f1f8"><div class="mx-gbar" style="right:0;width:' + (w[1] / 8 * 100) + '%;background:' + (w[1] > w[2] ? '#cf3434' : '#1baf7a') + '"></div><span style="position:absolute;right:' + (w[2] / 8 * 100) + '%;top:-2px;bottom:-2px;width:2px;background:#1c1a27"></span></div></div>').join('') + '<div class="mx-note">' + tx('الخط الأسود = السعة. الأحمر = أكثر من السعة.', 'Black line = capacity. Red = over capacity.') + '</div></div>';
    const menu = mxMenu('view-menu', 'top:4px;right:280px', [['vm-cal', DM.ic('calendar') + ' Calendar'], ['vm-gantt', DM.ic('gantt') + ' Gantt'], ['vm-timeline', DM.ic('timeline') + ' Timeline'], ['vm-workload', DM.ic('workload') + ' Workload'], ['vm-table', DM.ic('table') + ' Table']]);
    return '<div class="mx">' + mxSide('side-list-weekly') + mxMain(L_WEEKLY(), tx('نفس المهام، طرق عرض مختلفة', 'Same tasks, different views'), tabs, list + board + cal + table + gantt + wl + menu) + '</div>';
  },

  /* Custom fields and formula */
  fields() {
    const g = 'grid-template-columns:1.4fr .9fr .9fr .9fr .8fr';
    const r = (i, name, st, s, d) => '<div class="mx-row" style="' + g + '"><span class="mx-t">' + DM.st(st) + '<span class="txt">' + name + '</span></span><span>' + s + '</span><span>' + d + '</span>' +
      '<span data-d="d' + i + '" class="mx-fade">-</span><span data-d="x' + i + '" class="mx-fade" dir="ltr">-</span></div>';
    const sep = n => isRTL() ? n + ' سبتمبر' : n + ' Sep';
    const body = '<div class="mx-row" style="' + g + ';font-size:10.5px;color:#8a879c;background:none"><span>Task</span><span>Start date</span><span>Due date</span>' +
      '<span data-d="col-dept" class="mx-fade">' + tx('الإدارة الطالبة', 'Requesting dept.') + '</span><span data-d="col-fx" class="mx-fade">' + tx('المدة (أيام)', 'Duration (days)') + '</span></div>' +
      r(1, tx('طلب تقرير مبيعات الباقات', 'Plan sales report request'), 'progress', sep(14), sep(18)) + r(2, tx('تحديث نموذج الإجازات', 'Update the leave form'), 'todo', sep(15), sep(22)) + r(3, tx('تدقيق عقود الموردين', 'Audit supplier contracts'), 'review', sep(10), sep(24)) +
      '<div style="position:absolute;top:10px;left:10px"><span class="mx-btn ghost" data-d="add-field">' + DM.ic('plus') + 'Field</span></div>' +
      mxMenu('field-menu', 'top:40px;left:10px;min-width:170px', [['ft-dropdown', 'Dropdown'], ['ft-number', 'Number'], ['ft-date', 'Date'], ['ft-money', 'Money'], ['ft-checkbox', 'Checkbox'], ['ft-formula', 'Formula'], ['ft-text', 'Text']]) +
      '<div class="mx-card mx-hidden" data-d="field-cfg" style="position:absolute;top:40px;left:10px;width:260px"><b>Dropdown</b>' +
      '<div class="mx-field"><span>Field name</span><span class="mx-input" data-d="fc-name"></span></div>' +
      '<div class="mx-field"><span>Options</span><span style="display:flex;gap:4px;flex-wrap:wrap"><span class="mx-tag" style="background:#e6f4ec;color:#135f3b">' + tx('خدمة العملاء', 'Customer Service') + '</span><span class="mx-tag">' + tx('المالية', 'Finance') + '</span><span class="mx-tag" style="background:#fdf2e1;color:#9a5a00">' + tx('الموارد البشرية', 'Human Resources') + '</span></span></div>' +
      '<span class="mx-btn" data-d="fc-ok" style="justify-self:start">Create</span></div>' +
      '<div class="mx-card mx-hidden" data-d="fx-editor" style="position:absolute;top:40px;left:10px;width:330px"><b>Formula</b>' +
      '<div class="mx-field"><span>Field name</span><span class="mx-input">' + tx('المدة (أيام)', 'Duration (days)') + '</span></div>' +
      '<div class="mx-input" data-d="fx-input" style="direction:ltr;font-family:ui-monospace,monospace;font-size:11px;background:#1f1d2b;color:#efeaff;border-color:#1f1d2b"></div>' +
      '<div class="mx-note" data-d="fx-hint">DAYS(end date, start date) returns the number of days</div>' +
      '<span class="mx-btn" data-d="fx-ok" style="justify-self:start">Create</span></div>';
    return '<div class="mx">' + mxSide('side-list-req') + mxMain(L_REQ(), 'Table view', mxTab('t-table', 'Table', 'table', true), body) + '</div>';
  },

  /* Collaboration: Doc, Chat, Whiteboard */
  collab() {
    const tabs = mxTab('tab-doc', 'Doc', 'doc', true) + mxTab('tab-chat', 'Chat', 'message') + mxTab('tab-wb', 'Whiteboard', 'whiteboard');
    const doc = '<div data-d="pane-doc" style="display:grid;gap:6px;max-width:470px">' +
      '<b style="font-size:14px">' + tx('دليل إعداد التقرير الأسبوعي', 'Weekly report preparation guide') + '</b>' +
      '<div class="mx-note">' + tx('آخر تحديث: نورة', 'Last updated by Noura') + '</div>' +
      '<div>' + tx('1. اجمع الأرقام من لوحة المؤشرات قبل ظهر الأربعاء.', '1. Collect the figures from the KPI dashboard before Wednesday noon.') + '</div><div>' + tx('2. اكتب الملاحظات في قسم «أبرز التغييرات».', '2. Write your notes in the “Key changes” section.') + '</div>' +
      '<div class="mx-input" data-d="doc-line" style="border-style:dashed"><span data-d="doc-type"></span></div>' +
      '<div class="mx-card mx-hidden" data-d="doc-task" style="display:flex;gap:6px;align-items:center;justify-self:start">' + DM.ic('checklist') + DM.st('todo') + '<span>' + tx('مراجعة التقرير الأسبوعي', 'Review the weekly report') + '</span>' + DM.av('me') + '</div>' +
      mxMenu('slash-menu', 'top:140px;right:30px', [['sl-task', DM.ic('checklist') + ' Task'], ['sl-table', DM.ic('table') + ' Table'], ['sl-mention', DM.ic('at') + ' Mention']]) + '</div>';
    const chat = '<div data-d="pane-chat" class="mx-hidden" style="display:grid;gap:6px;max-width:500px"><div class="mx-note">' + tx('# فريق-التقارير', '# reporting-team') + '</div>' +
      '<div class="mx-comment" data-d="m1">' + DM.av('maryam') + '<div>' + tx('<b>مريم</b> وصلتنا ملاحظة من المالية على أرقام الأسبوع.', '<b>Maryam</b> Finance sent us a comment on this week’s figures.') + '</div></div>' +
      '<div class="mx-comment" data-d="m2" style="position:relative">' + DM.av('khalid') + '<div>' + tx('<b>خالد</b> نحتاج تصحيح جدول الإيرادات قبل الخميس.', '<b>Khalid</b> We need to fix the revenue table before Thursday.') +
      '<div class="mx-hidden" data-d="m2-actions" style="display:flex;gap:4px;margin-top:4px"><span class="mx-btn ghost" data-d="m2-task">' + DM.ic('checklist') + 'Create task</span><span class="mx-btn ghost">' + DM.ic('message') + 'Reply</span></div></div></div>' +
      '<div class="mx-card mx-hidden" data-d="chat-task" style="display:flex;gap:6px;align-items:center;justify-self:start">' + DM.ic('link') + DM.st('todo') + '<span>' + tx('تصحيح جدول الإيرادات', 'Fix the revenue table') + '</span><span class="mx-note">' + tx('مرتبطة بالرسالة', 'Linked to the message') + '</span></div>' +
      '<div class="mx-input" style="gap:8px"><span class="mx-note">Message</span><span style="flex:1"></span><span data-d="clip-btn">' + DM.ic('bell') + '</span></div>' +
      '<div class="mx-card mx-hidden" data-d="clip-new" style="display:flex;gap:6px;align-items:center;justify-self:start">' + DM.ic('play', 11) + '<span>Voice clip 0:24</span></div></div>';
    const wb = '<div data-d="pane-wb" class="mx-hidden" style="position:relative;height:250px;background:radial-gradient(#e2dff0 1px,transparent 1px) 0 0/14px 14px;border-radius:8px">' +
      '<div class="mx-card" data-d="wb1" style="position:absolute;top:20px;right:30px;width:140px;background:#fff6d6">' + tx('تقليل وقت الرد على الطلبات الداخلية', 'Shorten response time for internal requests') + '</div>' +
      '<div class="mx-card" data-d="wb2" style="position:absolute;top:110px;right:200px;width:140px;background:#e6f4ec">' + tx('نموذج موحد للطلبات', 'One standard request form') + '</div>' +
      '<div class="mx-hidden" data-d="wb-actions" style="position:absolute;top:84px;right:200px"><span class="mx-btn" data-d="wb-convert">' + DM.ic('checklist') + 'Convert to task</span></div>' +
      '<div class="mx-card mx-hidden" data-d="wb-task" style="position:absolute;top:180px;right:200px;display:flex;gap:6px;align-items:center">' + DM.st('todo') + '<span>' + tx('نموذج موحد للطلبات', 'One standard request form') + '</span></div></div>';
    return '<div class="mx">' + mxSide('side-list-weekly') + mxMain(tx('التعاون حول العمل', 'Collaborating around work'), '', tabs, doc + chat + wb) + '</div>';
  },

  /* Gantt with dependencies */
  gantt() {
    const bar = (d, right, w, color) => '<div class="mx-gbar" data-d="' + d + '" style="right:' + right + 'px;width:' + w + 'px;background:' + color + '"></div>';
    const rows = [
      [tx('جمع البيانات', 'Collect data'), bar('g1', 0, 80, '#2f6bd6')], [tx('تحليل النتائج', 'Analyse results'), bar('g2', 80, 120, '#2f6bd6')],
      [tx('اعتماد الأرقام', 'Approve figures'), bar('g3', 200, 40, '#b25f00')], [tx('نشر التقرير', 'Publish the report'), bar('g4', 240, 40, '#687083')]
    ];
    const body = '<div style="display:flex;gap:6px;margin-bottom:8px;align-items:center"><span class="mx-note">' + tx('سبتمبر', 'September') + '</span><span style="flex:1"></span><span class="mx-tag mx-hidden" data-d="warn" style="background:#fcebea;color:#c0322f">Dependency warning</span></div>' +
      '<div class="mx-gantt" data-d="chart" style="position:relative">' + rows.map((r, i) => '<div class="mx-grow" data-d="row' + (i + 1) + '"><span>' + r[0] + '</span><div class="mx-track">' + r[1] + '</div></div>').join('') +
      '<svg data-d="deps" class="mx-hidden mx-deps" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible" viewBox="0 0 576 124" preserveAspectRatio="none"><path d="M376 14 h8 v28 h-8" fill="none" stroke="#1c1a27" stroke-width="1.5"/><path d="M256 44 h8 v28 h-8" fill="none" stroke="#1c1a27" stroke-width="1.5"/><path d="M216 74 h8 v28 h-8" fill="none" stroke="#1c1a27" stroke-width="1.5"/></svg>' +
      '<div style="position:absolute;top:-6px;bottom:0;right:' + (128 + 150) + 'px;width:2px;background:#cf3434" data-d="today"></div></div>' +
      '<div class="mx-card mx-hidden" data-d="dep-card" style="margin-top:10px;display:grid;gap:4px;width:300px"><b>Dependencies</b><span>' + DM.ic('link') + tx(' «تحليل النتائج» <b>Waiting on</b> «جمع البيانات»', ' “Analyse results” <b>Waiting on</b> “Collect data”') + '</span><span class="mx-note">' + tx('المهمة الحاجبة: Blocking', 'The task holding it up: Blocking') + '</span></div>' +
      '<div class="mx-card mx-hidden" data-d="late-card" style="margin-top:10px;width:300px;border-color:#efc3c1;background:#fff8f8">' + tx('«اعتماد الأرقام» متأخرة: تاريخ الاستحقاق مضى والحالة ليست مغلقة.', '“Approve figures” is overdue: the due date has passed and the status is not closed.') + '</div>' +
      '<div class="mx-card mx-hidden" data-d="est-card" style="margin-top:10px;width:300px;display:grid;gap:4px"><b>Time estimate vs tracked</b><div style="height:8px;border-radius:6px;background:#e2dcfb;position:relative"><div data-d="est-fill" style="position:absolute;inset-block:0;right:0;width:20%;border-radius:6px;background:#5b45d6"></div></div><span class="mx-note" data-d="est-text">' + tx('1h من 5h', '1h of 5h') + '</span></div>' +
      mxMenu('dep-menu', 'top:40px;left:20px', [['dp-waiting', 'Waiting on'], ['dp-blocking', 'Blocking'], ['dp-link', 'Link to (Relationship)']]);
    return '<div class="mx">' + mxSide('side-list-weekly') + mxMain(tx('إعداد التقرير الشهري', 'Preparing the monthly report'), 'Gantt', mxTab('t-gantt', 'Gantt', 'gantt', true) + mxTab('t-list', 'List', 'list'), body) + '</div>';
  },

  /* Dashboard */
  dash() {
    const bars = (d, vals, max, colors) => '<div class="mx-bars" data-d="' + d + '" data-max="' + max + '" style="height:100px">' + vals.map((v, i) => '<div class="mx-bar" style="height:' + (v / max * 90) + 'px;background:' + colors[i] + '"><b>' + v + '</b></div>').join('') + '</div>';
    const st = ['TO DO', 'PROG.', 'REVIEW', 'DONE'];
    const body = '<div style="display:flex;gap:6px;margin-bottom:8px;align-items:center"><span class="mx-btn ghost" data-d="dash-filter">' + DM.ic('filter') + '<span data-d="dash-filter-label">Filters</span></span><span class="mx-tag mx-hidden" data-d="dash-chip">Location: ' + L_WEEKLY() + '</span><span style="flex:1"></span><span class="mx-btn" data-d="add-card">' + DM.ic('plus') + 'Add card</span></div>' +
      '<div style="display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:8px">' +
      '<div class="mx-dash-card" data-d="card-status"><b style="font-size:12px">Tasks by status</b>' + bars('bars-status', [6, 4, 2, 9], 10, ['#687083', '#2f6bd6', '#b25f00', '#18814f']) +
      '<div style="display:flex;justify-content:space-around;font-size:9px;color:#8a879c;direction:ltr"><span>' + (isRTL() ? st.slice().reverse() : st).join('</span><span>') + '</span></div></div>' +
      '<div class="mx-dash-card" data-d="card-overdue"><b style="font-size:12px">Overdue</b><div style="font-size:34px;font-weight:600;color:#c0322f" data-d="overdue-n">5</div><div class="mx-note" data-d="overdue-note">' + tx('مهام تجاوزت تاريخ الاستحقاق', 'Tasks past their due date') + '</div></div>' +
      '<div class="mx-dash-card" data-d="card-wl"><b style="font-size:12px">Open tasks by assignee</b>' + bars('bars-wl', [5, 2, 3, 2], 6, ['#2a78d6', '#2a78d6', '#2a78d6', '#2a78d6']) +
      '<div style="display:flex;justify-content:space-around;font-size:9.5px;color:#8a879c"><span>' + PN('maryam') + '</span><span>' + PN('salim') + '</span><span>' + PN('noura') + '</span><span>' + PN('khalid') + '</span></div></div>' +
      '<div class="mx-dash-card mx-hidden" data-d="card-new" style="grid-column:1/-1"><b style="font-size:12px">Completed per week</b><svg class="mx-line" viewBox="0 0 400 60" style="width:100%;height:60px"><polyline points="0,50 80,42 160,44 240,30 320,26 400,18" fill="none" stroke="#2a78d6" stroke-width="2"/></svg></div></div>' +
      mxMenu('card-menu', 'top:40px;left:10px', [['cd-bar', DM.ic('chart') + ' Bar Chart'], ['cd-pie', DM.ic('target') + ' Pie Chart'], ['cd-line', DM.ic('progress') + ' Line Chart'], ['cd-custom', DM.ic('module') + ' Custom card']]) +
      '<div class="mx-card mx-hidden" data-d="card-cfg" style="position:absolute;top:40px;left:10px;width:260px"><b>Line Chart</b>' +
      '<div class="mx-field"><span>Location</span><span class="mx-input" data-d="cfg-loc"><span class="mx-note">Choose data source</span></span></div>' +
      '<div class="mx-field"><span>Y-axis</span><span class="mx-input">Tasks closed</span></div><div class="mx-field"><span>Period</span><span class="mx-input">Weekly</span></div>' +
      '<span class="mx-btn" data-d="cfg-ok" style="justify-self:start">Add</span></div>' +
      mxMenu('dfilter-menu', 'top:40px;right:14px', [['df-loc', 'Location: ' + L_WEEKLY(), 1], ['df-assignee', 'Assignee: ' + PN('maryam'), 1]]);
    return '<div class="mx">' + mxSide('', { extra: '<div class="mx-item on" data-d="side-dash">' + DM.ic('chart') + '<span>Dashboards</span></div>' }) + mxMain(tx('متابعة التقارير', 'Report follow-up'), 'Dashboard', null, body) + '</div>';
  },

  /* Automation builder */
  auto() {
    const body = '<div style="display:grid;grid-template-columns:1fr 270px;gap:12px">' +
      '<div style="display:grid;gap:4px;align-content:start">' +
      '<div class="mx-row" data-d="a1" style="grid-template-columns:1fr 80px 50px"><span class="mx-t"><span data-d="a1-stw">' + DM.st('progress') + '</span><span class="txt">' + tx('تحديث لوحة المؤشرات', 'Update the KPI dashboard') + '</span></span><span data-d="a1-pr">' + DM.pr('urgent') + '</span><span data-d="a1-as">' + DM.av('maryam') + '</span></div>' +
      '<div class="mx-row" data-d="a2" style="grid-template-columns:1fr 80px 50px"><span class="mx-t"><span data-d="a2-stw">' + DM.st('progress') + '</span><span class="txt">' + tx('تنسيق شرائح العرض', 'Format the presentation slides') + '</span></span><span>' + DM.pr('low') + '</span><span data-d="a2-as">' + DM.av('noura') + '</span></div>' +
      '<div class="mx-comment mx-hidden" data-d="au-log">' + DM.ic('zap') + '<div data-d="au-log-text">' + tx('شُغّلت الأتمتة: عُيّن سالم مراجِعاً.', 'Automation ran: Salim was assigned as reviewer.') + '</div></div>' +
      '<div class="mx-note mx-hidden" data-d="au-skip">' + tx('«تنسيق شرائح العرض» لم تطابق الشرط، فلم يُنفَّذ الإجراء.', '“Format the presentation slides” did not match the condition, so the action did not run.') + '</div></div>' +
      '<div class="mx-dash-card mx-flow" data-d="au-panel"><b style="font-size:12px">Automation</b>' +
      '<div class="mx-node" data-d="au-trigger"><span class="k">WHEN (Trigger)</span><span data-d="au-trigger-text" class="mx-note">Choose a trigger</span></div><div class="mx-arrow"></div>' +
      '<div class="mx-node" data-d="au-cond"><span class="k">IF (Condition, optional)</span><span data-d="au-cond-text" class="mx-note">Add condition</span></div><div class="mx-arrow"></div>' +
      '<div class="mx-node" data-d="au-action"><span class="k">THEN (Action)</span><span data-d="au-action-text" class="mx-note">Choose an action</span></div>' +
      '<div style="display:flex;gap:6px;align-items:center"><span class="mx-btn" data-d="au-save">Create</span><span class="mx-toggle" data-d="au-on"></span><span class="mx-note">Active</span></div></div></div>' +
      mxMenu('trig-menu', 'top:70px;left:40px', [['tm-status', 'Status changes'], ['tm-created', 'Task created'], ['tm-due', 'Due date arrives']]) +
      mxMenu('cond-menu', 'top:130px;left:40px', [['cm-prio', 'Priority is Urgent'], ['cm-assignee', 'Assignee is…']]) +
      mxMenu('act-menu', 'top:190px;left:40px', [['ac-assign', 'Assign to ' + PN('salim')], ['ac-comment', 'Add a comment'], ['ac-status', 'Change status']]) +
      mxMenu('st-menu', 'top:40px;right:40px', [['s-review', DM.st('review')], ['s-done', DM.st('done')]]);
    return '<div class="mx">' + mxSide('side-list-weekly') + mxMain(L_WEEKLY(), 'Automations', null, body) + '</div>';
  },

  /* Form view and Goals */
  form() {
    const q = (d, label, type) => '<div class="mx-card" data-d="' + d + '" style="display:grid;gap:2px"><b style="font-size:11.5px">' + label + '</b><span class="mx-note" dir="ltr" style="text-align:start">' + type + '</span></div>';
    const body = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      '<div data-d="builder" style="display:grid;gap:6px;align-content:start"><b>' + tx('نموذج طلب داخلي', 'Internal request form') + '</b>' +
      q('q1', tx('عنوان الطلب', 'Request title'), 'Task name') + q('q2', tx('الإدارة الطالبة', 'Requesting department'), 'Dropdown (Custom Field)') + q('q3', tx('التاريخ المطلوب', 'Date needed'), 'Due date') +
      '<div class="mx-hidden" data-d="q4">' + q('q4c', tx('مستوى الاستعجال', 'Urgency'), 'Priority') + '</div>' +
      '<div class="mx-note" data-d="q-add">' + DM.ic('plus') + ' Add field</div>' +
      '<div class="mx-card" data-d="fs" style="display:grid;gap:3px"><b style="font-size:11px">Settings: After submitting form</b><span data-d="fs-list">Create task in: ' + L_REQ() + '</span><span data-d="fs-assign" class="mx-note">Assign to: -</span></div></div>' +
      '<div data-d="preview" style="display:grid;gap:6px;align-content:start;background:#f6f5fa;border-radius:8px;padding:10px"><b>' + tx('معاينة النموذج', 'Form preview') + '</b>' +
      '<div class="mx-field" style="grid-template-columns:90px 1fr"><span>' + tx('عنوان الطلب', 'Request title') + '</span><span class="mx-input" data-d="fp-name"></span></div>' +
      '<div class="mx-field" style="grid-template-columns:90px 1fr"><span>' + tx('الإدارة', 'Department') + '</span><span class="mx-input" data-d="fp-dept"></span></div>' +
      '<div class="mx-field" style="grid-template-columns:90px 1fr"><span>' + tx('التاريخ', 'Date') + '</span><span class="mx-input" data-d="fp-date"></span></div>' +
      '<span class="mx-btn" data-d="fp-submit" style="justify-self:start">Submit</span>' +
      '<div class="mx-row mx-hidden" data-d="form-task" style="grid-template-columns:1fr 50px"><span class="mx-t">' + DM.st('todo') + '<span class="txt">' + tx('تقرير مبيعات الباقات الشهري', 'Monthly plan sales report') + '</span></span><span data-d="form-task-as">' + DM.av('maryam') + '</span></div>' +
      '<div class="mx-note mx-hidden" data-d="form-note">' + tx('أُنشئت مهمة جديدة في «طلبات داخلية»', 'A new task was created in “Internal requests”') + '</div></div></div>' +
      mxMenu('assign-menu', 'top:250px;right:60px', [['fa-maryam', DM.av('maryam') + ' ' + PN('maryam'), 1], ['fa-salim', DM.av('salim') + ' ' + PN('salim'), 1]]);
    return '<div class="mx">' + mxSide('side-list-req') + mxMain(L_REQ(), 'Form view', mxTab('t-list', 'List', 'list') + mxTab('t-form', 'Form', 'form', true), body) + '</div>';
  },
  goals() {
    const tg = (d, name, type, val, pct) => '<div class="mx-card" data-d="' + d + '" style="display:grid;gap:4px"><div style="display:flex;justify-content:space-between"><b style="font-size:11.5px">' + name + '</b><span class="mx-note" dir="ltr">' + type + '</span></div>' +
      '<div style="height:6px;border-radius:5px;background:#e2dcfb;position:relative"><div data-d="' + d + '-bar" style="position:absolute;inset-block:0;right:0;width:' + pct + '%;border-radius:5px;background:#5b45d6"></div></div><span class="mx-note" data-d="' + d + '-val">' + val + '</span></div>';
    const body = '<div style="display:grid;gap:8px;max-width:520px">' +
      '<div class="mx-dash-card"><div style="display:flex;justify-content:space-between;align-items:center"><b>' + tx('إغلاق إجراءات التدقيق للربع الثالث', 'Close Q3 audit actions') + '</b><b data-d="goal-pct" style="color:#4a36b8">30%</b></div>' +
      '<div style="height:8px;border-radius:6px;background:#e2dcfb;position:relative"><div data-d="goal-bar" style="position:absolute;inset-block:0;right:0;width:30%;border-radius:6px;background:#5b45d6"></div></div>' +
      '<span class="mx-note">Owner: ' + DM.av('salim') + ' ' + PN('salim') + '</span></div>' +
      tg('t1', tx('إغلاق 10 ملاحظات تدقيق', 'Close 10 audit findings'), 'Number', '3 / 10', 30) +
      tg('t2', tx('اعتماد تقرير الإغلاق من الإدارة', 'Management approves the closure report'), 'True/False', 'Not done', 0) +
      '<div class="mx-hidden" data-d="t3wrap">' + tg('t3', tx('مهام قائمة «الربع الثالث»', 'Tasks in the “Q3” List'), 'Task', '4 / 8 tasks done', 50) + '</div>' +
      '<div class="mx-note" data-d="add-target">' + DM.ic('plus') + ' Add Target</div></div>' +
      mxMenu('target-menu', 'top:200px;left:40px', [['tt-number', 'Number'], ['tt-tf', 'True/False'], ['tt-currency', 'Currency'], ['tt-task', 'Task']]);
    return '<div class="mx">' + mxSide('', { extra: '<div class="mx-item on">' + DM.ic('target') + '<span>Goals</span></div>' }) + mxMain('Goals', tx('متابعة الأهداف', 'Tracking goals'), null, body) + '</div>';
  },

  /* Sharing and permissions */
  share(opts) {
    opts = opts || {};
    const person = (d, who, perm, on) => '<div class="mx-field" style="grid-template-columns:1fr 90px 30px" data-d="' + d + '"><span style="direction:' + (isRTL() ? 'rtl' : 'ltr') + ';color:#1c1a27;display:flex;gap:6px;align-items:center">' + who + '</span><span class="mx-input" data-d="' + d + '-perm" style="direction:ltr">' + perm + '</span><span class="mx-toggle' + (on ? ' on' : '') + '" data-d="' + d + '-tg"></span></div>';
    const rows = '<div class="mx-row" style="grid-template-columns:1fr 80px 50px"><span class="mx-t">' + DM.st('progress') + '<span class="txt">' + tx('إغلاق ملاحظة التدقيق 7', 'Close audit finding 7') + '</span></span><span>' + DAY(4) + '</span><span>' + DM.av('salim') + '</span></div>' +
      '<div class="mx-row" data-d="task-x" style="grid-template-columns:1fr 80px 50px"><span class="mx-t">' + DM.st('todo') + '<span class="txt">' + tx('مراجعة عقد المورد مع المستشار', 'Review the supplier contract with the consultant') + '</span></span><span>' + DAY(0) + '</span><span data-d="task-x-as">' + DM.av('khalid') + '</span></div>';
    const modal = '<div class="mx-modal mx-hidden" data-d="share-modal"><div>' +
      '<b data-d="share-title">' + tx('مشاركة القائمة: إجراءات التدقيق', 'Share List: Audit actions') + '</b>' +
      '<div style="display:flex;gap:6px;align-items:center"><span class="mx-toggle" data-d="priv-toggle"></span><span>' + DM.ic('lock') + ' Make private</span></div>' +
      '<div class="mx-input" data-d="invite"><span class="mx-note" data-d="invite-ph">Invite by name or email</span></div>' +
      person('p-maryam', DM.av('maryam') + ' ' + PN('maryam') + ' (Member)', 'Full edit', true) +
      person('p-noura', DM.av('noura') + ' ' + PN('noura') + ' (Member)', 'Edit', false) +
      '<div class="mx-hidden" data-d="p-guest-wrap">' + person('p-guest', DM.ic('user') + ' consultant@example.com (Guest)', 'Comment', true) + '</div>' +
      '<div class="mx-note" data-d="inherit-note">' + tx('الصلاحيات هنا تُورَّث إلى المهام داخل القائمة ما لم تُغيَّر.', 'Permissions set here are inherited by the tasks in the List unless changed.') + '</div>' +
      '<span class="mx-btn" data-d="share-done" style="justify-self:start">Done</span></div></div>';
    const body = '<div style="display:flex;gap:6px;margin-bottom:8px"><span style="flex:1"></span><span class="mx-btn ghost" data-d="share-btn">' + DM.ic('share') + 'Share</span></div>' + rows +
      mxMenu('perm-menu', 'top:170px;left:120px', [['pm-view', 'View only'], ['pm-comment', 'Comment'], ['pm-edit', 'Edit'], ['pm-full', 'Full edit']]) +
      '<div class="mx-menu mx-hidden" data-d="row-menu" style="top:80px;left:30px"><div class="mx-mi" data-d="rm-share">' + DM.ic('share') + ' Share task</div><div class="mx-mi" data-d="rm-copy">' + DM.ic('link') + ' Copy link</div></div>';
    return '<div class="mx">' + mxSide('side-list-audit', { auditLock: opts.lock }) + mxMain(tx('إجراءات التدقيق', 'Audit actions'), L_OPS() + ' / List', null, body, modal) + '</div>';
  },

  /* Command bar, shortcuts, AI, integrations */
  cmd() {
    const fld = (ar, en, k) => '<div class="mx-field" style="grid-template-columns:1fr 110px"><span style="direction:' + (isRTL() ? 'rtl' : 'ltr') + ';color:#1c1a27">' + tx(ar, en) + '</span>' + DM.kbd(k) + '</div>';
    const body = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><span class="mx-note">' + tx('اضغط', 'Press') + '</span><span data-d="kbd">' + DM.kbd('Ctrl+K') + '</span><span style="flex:1"></span><span class="mx-btn ghost" data-d="ai-btn">' + DM.ic('sparkle') + 'AI</span><span class="mx-btn ghost" data-d="int-btn">' + DM.ic('link') + 'Integrations</span></div>' +
      '<div class="mx-row"><span class="mx-t">' + DM.st('progress') + '<span class="txt">' + tx('تحديث لوحة المؤشرات', 'Update the KPI dashboard') + '</span></span><span>' + DAY(2) + '</span><span>' + DM.pr('high') + '</span><span>' + DM.av('maryam') + '</span></div>' +
      '<div class="mx-row"><span class="mx-t">' + DM.st('todo') + '<span class="txt">' + tx('مراجعة التقرير الأسبوعي', 'Review the weekly report') + '</span></span><span>' + DAY(4) + '</span><span>' + DM.pr('normal') + '</span><span>' + DM.av('me') + '</span></div>' +
      '<div class="mx-modal mx-hidden" data-d="cmdk" style="align-items:start;padding-top:30px"><div style="width:420px">' +
      '<div class="mx-input" data-d="cmd-input">' + DM.ic('search') + '<span data-d="cmd-text"></span></div>' +
      '<div style="display:flex;gap:4px"><span class="mx-tag" data-d="cf-all">All</span><span class="mx-tag" data-d="cf-tasks" style="background:#fff;color:#625f76;border:1px solid #e3e0ee">Tasks</span><span class="mx-tag" style="background:#fff;color:#625f76;border:1px solid #e3e0ee">Docs</span><span class="mx-tag" data-d="cf-assignee" style="background:#fff;color:#625f76;border:1px solid #e3e0ee">Assignee: me</span></div>' +
      '<div data-d="cmd-results" class="mx-hidden" style="display:grid;gap:2px">' +
      '<div class="mx-mi rtl hl" data-d="cr1" style="display:flex;gap:6px;padding:5px 8px;border-radius:5px">' + DM.ic('checklist') + ' ' + tx('مراجعة التقرير الأسبوعي', 'Review the weekly report') + ' <span class="mx-note">' + L_WEEKLY() + '</span></div>' +
      '<div class="mx-mi rtl" data-d="cr2" style="display:flex;gap:6px;padding:5px 8px">' + DM.ic('doc') + ' ' + tx('دليل إعداد التقرير الأسبوعي', 'Weekly report preparation guide') + ' <span class="mx-note">Doc</span></div>' +
      '<div class="mx-mi rtl" data-d="cr3" style="display:flex;gap:6px;padding:5px 8px">' + DM.ic('checklist') + ' ' + tx('إرسال تقرير الأسبوع 37', 'Send the week 37 report') + ' <span class="mx-note">' + tx('مكتملة', 'Complete') + '</span></div></div></div></div>' +
      '<div class="mx-modal mx-hidden" data-d="sheet"><div style="width:380px"><b>Keyboard shortcuts</b>' +
      fld('عرض قائمة الاختصارات', 'Show the shortcut list', 'Shift+?') +
      fld('فتح شريط الأوامر والبحث', 'Open the command bar and search', 'Ctrl+K') +
      fld('إنشاء مهمة من تطبيق سطح المكتب', 'Create a task from the desktop app', 'Ctrl+E') +
      '<div class="mx-note">' + tx('الاختصارات معطّلة افتراضياً وتُفعّل من الإعدادات الشخصية.', 'Shortcuts are off by default and are turned on in your personal settings.') + '</div></div></div>' +
      '<div class="mx-card mx-hidden" data-d="ai-out" style="position:absolute;top:44px;left:14px;width:300px;display:grid;gap:4px"><b>' + DM.ic('sparkle') + tx(' ملخص (AI)', ' Summary (AI)') + '</b><span data-d="ai-text"></span><span class="mx-note">' + tx('راجع الناتج قبل الاعتماد عليه. الميزة تعتمد على الخطة.', 'Review the output before relying on it. The feature depends on your plan.') + '</span></div>' +
      '<div class="mx-card mx-hidden" data-d="int-out" style="position:absolute;top:44px;left:14px;width:300px;display:grid;gap:6px"><b>Integrations</b>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="mx-tag">Email</span><span class="mx-tag">Calendar</span><span class="mx-tag">Cloud storage</span><span class="mx-tag">Chat apps</span></div><span class="mx-note">' + tx('تفعيل التكاملات يخضع لسياسة مؤسستك ومسؤول مساحة العمل.', 'Turning on integrations is subject to your organization’s policy and your Workspace admin.') + '</span></div>';
    return '<div class="mx">' + mxSide('side-list-weekly') + mxMain(L_WEEKLY(), 'List', null, body) + '</div>';
  }
};

/* Durations (ms at 1x) */
const DUR = { move: 750, click: 380, show: 240, hide: 200, on: 200, off: 200, text: 220, status: 260, check: 260, toggle: 300, moveTo: 750, bars: 850, shift: 850, width: 850, wait: 600 };
const CONTINUOUS = { move: 1, type: 1, moveTo: 1, bars: 1, shift: 1, width: 1 };

class DemoPlayer {
  constructor(root, spec, options) {
    this.root = root; this.spec = spec; this.opts = options || {};
    this.key = this.opts.key ? 'demo:' + this.opts.key : null;
    const saved = this.key ? UIState.get(this.key) : null;
    this.speed = saved ? saved.speed : 1; this.stepMode = saved ? saved.stepMode : false;
    this.playing = false; this.t = 0; this.watched = saved ? saved.watched : false;
    this.visited = saved && saved.visited ? new Set(saved.visited) : null;
    this.reduced = prefersReducedMotion();
    this.side = isRTL() ? 'right' : 'left';
    this.buildTimeline();
    this.render();
    this.reset();
    this.bind(saved);
    if (saved) {
      // Resume at the same step and position within it, in the new language.
      const st = this.steps[clamp(saved.step, 0, this.steps.length - 1)];
      this.seek(saved.done ? this.total : st.start + (st.end - st.start) * saved.frac, true);
      if (saved.playing) this.setPlaying(true);
    } else if (this.opts.autoplay && !this.reduced) this.observeAutoplay();
  }

  buildTimeline() {
    let t = 0; this.actions = []; this.steps = [];
    this.spec.steps.forEach((step, si) => {
      const start = t;
      (step.act || []).forEach(a => {
        const kind = a[0];
        const args = a.slice(1);
        if (kind === 'type') args[1] = demoStr(args[1]);
        let dur = kind === 'type' ? 260 + String(args[1]).length * 55 : kind === 'wait' ? (a[1] || DUR.wait) : (DUR[kind] || 240);
        this.actions.push({ kind, args, start: t, dur, end: t + dur, step: si });
        t += dur;
      });
      const actEnd = t;
      const hold = clamp(1300 + step.cap.length * 22, 1800, 3600);
      t += hold;
      this.steps.push({ start, actEnd, end: t, cap: step.cap });
    });
    this.total = t;
  }

  render() {
    const n = this.steps.length;
    this.root.classList.add('demo');
    this.root.innerHTML =
      '<div class="demo-bar"><span class="sim-label">' + icon('eye', 'icon-sm') + (isEN() ? 'Educational Simulation' : 'محاكاة تعليمية <span dir="ltr">Educational Simulation</span>') + '</span>' +
      '<span class="step-count num" aria-hidden="true"></span></div>' +
      '<div class="demo-viewport"><div class="demo-stage" aria-hidden="true"></div></div>' +
      '<div class="demo-caption"><span class="cap-step num" aria-hidden="true">1</span><p aria-live="polite"></p></div>' +
      '<div class="demo-controls" role="group" aria-label="' + tx('التحكم في العرض التوضيحي', 'Walkthrough controls') + '">' +
      '<button type="button" class="icon-btn play-btn" data-c="play" aria-label="' + tx('تشغيل', 'Play') + '">' + icon('play') + '</button>' +
      '<button type="button" class="icon-btn" data-c="prev" aria-label="' + tx('الخطوة السابقة', 'Previous step') + '">' + icon('step-prev') + '</button>' +
      '<button type="button" class="icon-btn" data-c="next" aria-label="' + tx('الخطوة التالية', 'Next step') + '">' + icon('step-next') + '</button>' +
      '<button type="button" class="icon-btn" data-c="replay" aria-label="' + tx('إعادة التشغيل من البداية', 'Replay from the start') + '">' + icon('replay') + '</button>' +
      '<div class="demo-track" aria-label="' + tx('الخطوات', 'Steps') + '">' + this.steps.map((s, i) => '<button type="button" data-step="' + i + '" aria-label="' + tx('انتقل إلى الخطوة ' + (i + 1) + ' من ' + n, 'Go to step ' + (i + 1) + ' of ' + n) + '"><i></i></button>').join('') + '</div>' +
      '<label class="speed-wrap"><span class="visually-hidden">' + tx('سرعة التشغيل', 'Playback speed') + '</span><select class="select select-sm" data-c="speed" aria-label="' + tx('سرعة التشغيل', 'Playback speed') + '">' +
      [0.5, 0.75, 1, 1.25, 1.5, 2].map(s => '<option value="' + s + '"' + (s === this.speed ? ' selected' : '') + ' dir="ltr">' + s + 'x</option>').join('') + '</select></label>' +
      '<label class="check step-mode"><input type="checkbox" data-c="stepmode"' + (this.stepMode ? ' checked' : '') + '> ' + tx('خطوة بخطوة', 'Step by step') + '</label>' +
      '<span class="demo-done"' + (this.watched ? '' : ' hidden') + '>' + icon('check-circle', 'icon-sm') + tx('تمت المشاهدة', 'Watched') + '</span>' +
      '</div>';
    this.stage = $('.demo-stage', this.root);
    this.viewport = $('.demo-viewport', this.root);
    this.capEl = $('.demo-caption p', this.root);
    this.capNum = $('.cap-step', this.root);
    this.countEl = $('.step-count', this.root);
    this.playBtn = $('[data-c="play"]', this.root);
    this.fills = $$('.demo-track i', this.root);
    this.doneEl = $('.demo-done', this.root);
    this.fit();
    this.ro = new ResizeObserver(() => this.fit());
    this.ro.observe(this.viewport);
  }

  fit() {
    const w = this.viewport.clientWidth || 760;
    this.scale = Math.min(w / 760, 1.3);
    this.stage.style.transform = 'scale(' + this.scale + ')';
    this.viewport.style.height = Math.round(400 * this.scale) + 'px';
  }

  reset() {
    this.stage.innerHTML = mirrorStyles(SCENES[this.spec.scene](this.spec.opts)) +
      '<div class="click-ring"></div><div class="pointer">' + '<svg viewBox="0 0 24 24">' + ICONS.cursor + '</svg></div>';
    this.pointer = $('.pointer', this.stage);
    this.ring = $('.click-ring', this.stage);
    this.ptr = { x: isRTL() ? 600 : 140, y: 330 };
    this.placePointer();
    this.actions.forEach(a => { a.begun = false; a.finished = false; });
    this.t = 0; this.lastRenderedT = 0; this.stepPauseAt = -1;
  }

  el(d) { return d ? this.stage.querySelector('[data-d="' + d + '"]') : null; }
  placePointer() { this.pointer.style.transform = 'translate(' + this.ptr.x + 'px,' + this.ptr.y + 'px)'; }
  centerOf(el) {
    const s = this.stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: (r.left - s.left + r.width / 2) / this.scale - 4, y: (r.top - s.top + r.height / 2) / this.scale - 3 };
  }

  begin(a, instant) {
    const [x1, x2, x3] = a.args;
    const el = this.el(x1);
    switch (a.kind) {
      case 'move': { a.from = { x: this.ptr.x, y: this.ptr.y }; a.to = el ? this.centerOf(el) : a.from; this.target = el; break; }
      case 'click': {
        if (!instant && !this.reduced) {
          this.ring.style.left = (this.ptr.x + 4) + 'px'; this.ring.style.top = (this.ptr.y + 3) + 'px';
          this.ring.animate([{ opacity: .9, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(1.2)' }], { duration: 380 / this.speed, easing: 'cubic-bezier(0.23,1,0.32,1)' });
        }
        break;
      }
      case 'type': { if (el) { el.classList.add('focus'); a.el = el; a.prefix = x3 ? el.innerHTML : ''; } break; }
      case 'show': if (el) el.classList.remove('mx-hidden'); break;
      case 'hide': if (el) el.classList.add('mx-hidden'); break;
      case 'on': if (el) el.classList.add(x2 || 'on'); break;
      case 'off': if (el) el.classList.remove(x2 || 'on'); break;
      case 'text': if (el) el.innerHTML = demoMacro(x2); break;
      case 'status': if (el) { el.className = 'mx-status st-' + x2; el.textContent = STATUS[x2].en; } break;
      case 'check': if (el) el.classList.add('on'); break;
      case 'toggle': if (el) el.classList.toggle('on'); break;
      case 'moveTo': {
        const box = this.el(x2); if (!el || !box) break;
        a.el = el;
        const r1 = el.getBoundingClientRect();
        if (x3 === 'first') { const ref = box.querySelector('.mx-card, .mx-row'); box.insertBefore(el, ref || null); }
        else box.appendChild(el);
        const r2 = el.getBoundingClientRect();
        a.dx = (r1.left - r2.left) / this.scale; a.dy = (r1.top - r2.top) / this.scale;
        break;
      }
      case 'bars': {
        if (!el) break; a.el = el; a.max = +el.dataset.max || 10;
        a.bars = $$('.mx-bar', el); a.from = a.bars.map(b => parseFloat(b.style.height) || 0);
        a.to = x2.map(v => v / a.max * (+el.dataset.h || 90));
        a.bars.forEach((b, i) => { const lab = b.querySelector('b'); if (lab) lab.textContent = x2[i]; });
        break;
      }
      case 'shift': { if (!el) break; a.el = el; a.from = parseFloat(el.style[this.side]) || 0; a.to = a.from + x2; break; }
      case 'width': { if (!el) break; a.el = el; a.unit = x3 || '%'; a.from = parseFloat(el.style.width) || 0; a.to = x2; break; }
    }
  }

  update(a, p) {
    const e = this.reduced ? 1 : (p < 1 ? 1 - Math.pow(1 - p, 3) : 1);
    switch (a.kind) {
      case 'move': {
        const k = this.reduced ? (p >= 1 ? 1 : 0) : (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
        this.ptr.x = a.from.x + (a.to.x - a.from.x) * k; this.ptr.y = a.from.y + (a.to.y - a.from.y) * k; this.placePointer(); break;
      }
      case 'type': {
        if (!a.el) break;
        const s = String(a.args[1]); const n = Math.round(s.length * clamp(p, 0, 1));
        a.el.innerHTML = a.prefix + esc(s.slice(0, n)) + (p < 1 ? '<span class="caret"></span>' : '');
        if (p >= 1) a.el.classList.remove('focus');
        break;
      }
      case 'moveTo': if (a.el) a.el.style.transform = p >= 1 ? '' : 'translate(' + (a.dx * (1 - e)) + 'px,' + (a.dy * (1 - e)) + 'px)'; break;
      case 'bars': if (a.el) a.bars.forEach((b, i) => { b.style.height = (a.from[i] + (a.to[i] - a.from[i]) * e) + 'px'; }); break;
      case 'shift': if (a.el) a.el.style[this.side] = (a.from + (a.to - a.from) * e) + 'px'; break;
      case 'width': if (a.el) a.el.style.width = (a.from + (a.to - a.from) * e) + a.unit; break;
    }
  }

  seek(t, instant) {
    t = clamp(t, 0, this.total);
    if (t < this.lastRenderedT - 0.5) { this.reset(); instant = true; }
    for (const a of this.actions) {
      if (a.start > t) break;
      if (!a.begun) { a.begun = true; this.begin(a, instant || a.end <= t); }
      if (CONTINUOUS[a.kind] && !a.finished) {
        const p = a.end <= t ? 1 : (t - a.start) / a.dur;
        this.update(a, instant ? (a.end <= t ? 1 : p) : p);
        if (p >= 1) a.finished = true;
      } else if (a.end <= t) a.finished = true;
    }
    this.t = t; this.lastRenderedT = t;
    this.paintUI();
  }

  currentStep() {
    for (let i = this.steps.length - 1; i >= 0; i--) if (this.t >= this.steps[i].start - 0.001) return i;
    return 0;
  }

  save() {
    if (!this.key || this.destroyed) return;
    const i = this.currentStep(); const s = this.steps[i];
    UIState.set(this.key, { step: i, frac: clamp((this.t - s.start) / (s.end - s.start), 0, 1), done: this.t >= this.total, speed: this.speed, stepMode: this.stepMode, playing: this.playing, watched: this.watched, visited: this.visited ? Array.from(this.visited) : null });
  }

  paintUI() {
    const i = this.currentStep(); const s = this.steps[i];
    if (this.shownStep !== i) {
      this.shownStep = i;
      this.capEl.innerHTML = t(s.cap);
      this.capNum.textContent = i + 1;
    }
    this.countEl.textContent = tx('الخطوة ' + (i + 1) + ' من ' + this.steps.length, 'Step ' + (i + 1) + ' of ' + this.steps.length);
    this.fills.forEach((f, k) => {
      const st = this.steps[k];
      const p = this.t >= st.end ? 1 : this.t <= st.start ? 0 : (this.t - st.start) / (st.end - st.start);
      f.style.width = (p * 100) + '%';
    });
    this.save();
  }

  setPlaying(on) {
    this.playing = on;
    this.playBtn.innerHTML = icon(on ? 'pause' : 'play');
    this.playBtn.setAttribute('aria-label', on ? tx('إيقاف مؤقت', 'Pause') : (this.t >= this.total ? tx('إعادة التشغيل', 'Replay') : tx('تشغيل', 'Play')));
    if (on) { this.last = performance.now(); this.loop(); }
    else cancelAnimationFrame(this.raf);
    this.save();
  }

  loop() {
    this.raf = requestAnimationFrame(now => {
      if (!this.playing) return;
      const dt = Math.min(now - this.last, 100); this.last = now;
      let next = this.t + dt * this.speed;
      if (this.stepMode) {
        const s = this.steps[this.currentStep()];
        if (this.t < s.actEnd && next >= s.actEnd && this.stepPauseAt !== s.actEnd) {
          next = s.actEnd; this.stepPauseAt = s.actEnd; this.seek(next); this.setPlaying(false);
          announce(tx('انتهت الخطوة. اضغط الخطوة التالية للمتابعة.', 'Step finished. Press Next step to continue.')); return;
        }
      }
      if (next >= this.total) { this.seek(this.total); this.setPlaying(false); this.finish(); return; }
      this.seek(next);
      this.loop();
    });
  }

  finish() {
    if (!this.watched) {
      this.watched = true; this.doneEl.hidden = false; this.save();
      if (this.opts.onWatched) this.opts.onWatched();
    }
  }

  goStep(i) {
    i = clamp(i, 0, this.steps.length - 1);
    const target = this.steps[i].start;
    this.seek(target, true);
    this.stepPauseAt = -1;
    if (i === this.steps.length - 1 && this.visitedAll()) this.finish();
  }
  visitedAll() { this.visited = this.visited || new Set(); this.visited.add(this.currentStep()); return this.visited.size >= this.steps.length; }

  bind(saved) {
    this.root.addEventListener('click', e => {
      const b = e.target.closest('[data-c],[data-step]'); if (!b) return;
      const c = b.dataset.c;
      if (b.dataset.step != null) { const was = this.playing; this.setPlaying(false); this.goStep(+b.dataset.step); if (was) this.setPlaying(true); return; }
      if (c === 'play') {
        if (this.playing) { this.setPlaying(false); announce(tx('تم الإيقاف المؤقت', 'Paused')); }
        else { if (this.t >= this.total) { this.reset(); this.seek(0); } this.setPlaying(true); }
      } else if (c === 'replay') { this.setPlaying(false); this.reset(); this.visited = null; this.seek(0); this.setPlaying(true); }
      else if (c === 'prev') {
        const i = this.currentStep(); const s = this.steps[i];
        const was = this.playing; this.setPlaying(false);
        this.goStep(this.t - s.start < 700 ? i - 1 : i); this.visitedAll();
        if (was) this.setPlaying(true);
      } else if (c === 'next') {
        const i = this.currentStep(); const was = this.playing; this.setPlaying(false);
        if (i >= this.steps.length - 1) { this.seek(this.total, true); this.visitedAll(); this.finish(); }
        else { this.goStep(i + 1); this.visitedAll(); if (was) this.setPlaying(true); }
      }
      this.playBtn.setAttribute('aria-label', this.playing ? tx('إيقاف مؤقت', 'Pause') : tx('تشغيل', 'Play'));
    });
    this.root.addEventListener('change', e => {
      if (e.target.dataset.c === 'speed') this.speed = parseFloat(e.target.value) || 1;
      if (e.target.dataset.c === 'stepmode') { this.stepMode = e.target.checked; this.stepPauseAt = -1; }
      this.save();
    });
    this.onVis = () => { if (document.hidden && this.playing) this.setPlaying(false); };
    document.addEventListener('visibilitychange', this.onVis);
    this.seek(0, true);
    if (!saved) this.visitedAll();
  }

  observeAutoplay() {
    let started = false;
    this.io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting && !started) { started = true; setTimeout(() => { if (!this.destroyed && this.t === 0) this.setPlaying(true); }, 500); }
        if (!en.isIntersecting && this.playing) this.setPlaying(false);
      });
    }, { threshold: 0.5 });
    this.io.observe(this.root);
  }

  destroy() {
    this.save();
    this.destroyed = true; this.playing = false; cancelAnimationFrame(this.raf);
    if (this.ro) this.ro.disconnect(); if (this.io) this.io.disconnect();
    document.removeEventListener('visibilitychange', this.onVis);
  }
}

/* Home demo: a task travels TO DO -> COMPLETE while the status chart follows */
const HOME_DEMO = {
  scene: 'board', opts: { flow: true },
  steps: [
    { cap: 'هذه لوحة Board لمبادرة تحسين الخدمة. كل عمود حالة، وكل بطاقة مهمة. المخطط على اليسار يقرأ الحالات من المهام نفسها.', act: [['move', 'c1'], ['on', 'c1', 'mx-highlight']] },
    { cap: 'نبدأ العمل على «مراجعة التقرير الأسبوعي»: ننقلها إلى IN PROGRESS، فيتحدث المخطط فوراً.', act: [['click'], ['moveTo', 'c1', 'col-progress', 'first'], ['text', 'n-todo', '1'], ['text', 'n-progress', '2'], ['bars', 'bars', [1, 2, 1, 1]]] },
    { cap: 'انتهت المسودة، فتنتقل إلى REVIEW ليراجعها شخص آخر قبل الإغلاق.', act: [['move', 'c1'], ['click'], ['moveTo', 'c1', 'col-review', 'first'], ['text', 'n-progress', '1'], ['text', 'n-review', '2'], ['bars', 'bars', [1, 1, 2, 1]]] },
    { cap: 'بعد الموافقة تنتقل إلى COMPLETE. العدد في كل عمود والمخطط يطابقان المهام الفعلية دائماً.', act: [['move', 'c1'], ['click'], ['moveTo', 'c1', 'col-done', 'first'], ['text', 'n-review', '1'], ['text', 'n-done', '2'], ['bars', 'bars', [1, 1, 1, 2]], ['off', 'c1', 'mx-highlight']] },
    { cap: 'هذا ما ستتدرّب عليه: تحريك العمل، وقراءة أثره، داخل مساحة تدريب آمنة ببيانات وهمية.', act: [['move', 'flow-note'], ['wait', 400]] }
  ]
};
