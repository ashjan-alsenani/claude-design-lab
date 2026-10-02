/* ==========================================================================
   CX: the "Watch how" animation engine for the Courses section.
   A simplified, reconstructed ClickUp screen is drawn from a state object.
   Each step of a demo changes the state; the engine re-draws and then
   animates the difference: elements with the same data-k glide to their new
   place (FLIP), new elements fade in, a pointer travels to the highlighted
   element and clicks, and text can be typed in. One stage size (820 x 470)
   is scaled to fit. With reduced motion everything changes instantly.
   Screens are educational simulations, not real ClickUp screenshots.
   ========================================================================== */
const CX = (() => {
  const W = 820, H = 470;
  const L = x => Array.isArray(x) ? tx(x[0], x[1]) : (x == null ? '' : String(x));
  const E = x => esc(L(x));
  const I = n => icon(n, 'cxi');
  const K = key => key ? ' data-k="' + key + '"' : '';
  const CAST = {
    me: { n: ['أشجان', 'Ashjan'], c: '#7b68ee' }, salim: { n: ['سالم', 'Salim'], c: '#e8590c' }, maryam: { n: ['مريم', 'Maryam'], c: '#0ea5e9' },
    khalid: { n: ['خالد', 'Khalid'], c: '#10b981' }, noura: { n: ['نورة', 'Noura'], c: '#ec4899' }, ai: { n: ['Brain', 'Brain'], c: '#a855f7' }, agent: { n: ['وكيل', 'Agent'], c: '#14b8a6' }
  };
  const who = id => L((CAST[id] || CAST.me).n);
  const av = (id, k) => { const p = CAST[id] || CAST.me; return '<span class="cx-av" style="--c:' + p.c + '"' + K(k) + ' title="' + esc(L(p.n)) + '">' + (id === 'ai' || id === 'agent' ? I(id === 'ai' ? 'sparkle' : 'robot') : esc(L(p.n).charAt(0))) + '</span>'; };
  const ST = { todo: ['TO DO', '#87909e'], prog: ['IN PROGRESS', '#5b45d6'], rev: ['REVIEW', '#e8590c'], done: ['COMPLETE', '#10b981'], wait: ['WAITING', '#d9480f'] };
  const st = (s, k) => '<span class="cx-st" style="--c:' + (ST[s] || ST.todo)[1] + '"' + K(k) + '>' + dot(s, 1) + (ST[s] || ST.todo)[0] + '</span>';
  /* ClickUp-style status circle: dashed when not started, part-filled in progress, green tick when complete */
  const dot = (s, inv) => { s = ST[s] ? s : 'todo'; return '<span class="cx-dot s-' + s + (inv ? ' inv' : '') + '" style="--c:' + ST[s][1] + '">' + (s === 'done' ? I('check') : '') + '</span>'; };
  const PR = { urgent: '#e03131', high: '#f59f00', normal: '#4c6ef5', low: '#adb5bd' };
  const pr = (p, k) => '<span class="cx-pr' + (p ? '' : ' none') + '" style="--c:' + (PR[p] || '#c3c7d0') + '"' + K(k) + '>' + I('flag') + '</span>';
  /* Flag with its word, as ClickUp shows priority in List and Board */
  const prl = (p, k) => p ? '<span class="cx-prl" style="--c:' + PR[p] + '"' + K(k) + '>' + I('flag') + p.charAt(0).toUpperCase() + p.slice(1) + '</span>' : pr(null, k);
  const spav = (n, c, cls) => '<span class="cx-spav' + (cls ? ' ' + cls : '') + '" style="--c:' + (c || '#7b68ee') + '">' + esc(L(n).charAt(0)) + '</span>';
  const btn = (k, label, cls, ic) => '<span class="cx-b' + (cls ? ' ' + cls : '') + '"' + K(k) + '>' + (ic ? I(ic) : '') + E(label) + '</span>';
  const tog = (k, on) => '<span class="cx-tog' + (on ? ' on' : '') + '"' + K(k) + '><i></i></span>';
  const pop = (k, items, style, title) => '<div class="cx-pop"' + K(k) + ' style="' + (style || 'top:70px;inset-inline-end:18px') + '">' + (title ? '<div class="cx-pop-h">' + E(title) + '</div>' : '') + items + '</div>';
  const mi = (k, label, ic, on) => '<div class="cx-mi' + (on ? ' on' : '') + '"' + K(k) + '>' + (ic ? I(ic) : '') + '<span>' + E(label) + '</span></div>';
  const kbd = keys => '<span class="cx-kbd">' + keys.split('+').map(x => '<b>' + esc(x) + '</b>').join('') + '</span>';
  const DAYS = () => [tx('الأحد', 'Sun'), tx('الإثنين', 'Mon'), tx('الثلاثاء', 'Tue'), tx('الأربعاء', 'Wed'), tx('الخميس', 'Thu')];
  const TI = { ws: 'globe', space: 'layers', folder: 'folder', list: 'list', task: 'checklist', doc: 'doc' };
  const TREE = [
    { k: 'sp-ops', l: 0, t: 'space', n: ['العمليات', 'Operations'] },
    { k: 'fd-fibre', l: 1, t: 'folder', n: ['إطلاق الألياف - صلالة', 'Fibre launch - Salalah'] },
    { k: 'ls-plan', l: 2, t: 'list', n: ['التخطيط', 'Planning'] },
    { k: 'ls-del', l: 2, t: 'list', n: ['التنفيذ', 'Delivery'] },
    { k: 'ls-req', l: 1, t: 'list', n: ['الطلبات', 'Requests'] }
  ];

  /* ---------- App shell (ClickUp 4.0 layout) ----------
     Dark "L" frame: top bar + Global Navigation rail. Inside it, a white
     workspace with the Spaces sidebar and the open view. */
  const SPC = ['#7b68ee', '#0ea5e9', '#f59f00', '#10b981', '#ec4899'];
  const CNT = { 'ls-plan': 6, 'ls-del': 4, 'ls-req': 9 };
  function side(s) {
    const tree = s.tree || TREE; let si = 0;
    const node = n => {
      let ic;
      if (n.t === 'space') ic = spav(n.n, n.c || SPC[si++ % SPC.length]);
      else if (n.t === 'folder') ic = '<span class="cx-fic">' + I('folder') + '</span>';
      else if (n.t === 'list') ic = '<span class="cx-lic">' + I('list') + '</span>';
      else ic = I(TI[n.t] || 'list');
      const cnt = n.cnt != null ? n.cnt : CNT[n.k];
      return '<div class="cx-tn l' + n.l + ' t-' + n.t + (s.sel === n.k ? ' on' : '') + '"' + K(n.k) + '>' + ic + '<span>' + E(n.n) + '</span>' + (cnt && n.t === 'list' ? '<em>' + cnt + '</em>' : '') + '</div>';
    };
    return '<aside class="cx-side"' + K('side') + '><div class="cx-ws"' + K('ws') + '><span class="cx-sq">T</span><span>' + E(['مساحة عمل التدريب', 'Training Workspace']) + '</span>' + I('chev-down') + '</div>' +
      '<div class="cx-tn quick">' + I('inbox') + '<span>Inbox</span><em class="hot">3</em></div><div class="cx-tn quick">' + I('checklist') + '<span>My Tasks</span></div>' +
      (s.favs ? '<div class="cx-sh">Favorites</div>' + s.favs.map(f => '<div class="cx-tn"' + K('fav-' + f.k) + '>' + I('star') + '<span>' + E(f.n) + '</span></div>').join('') : '') +
      '<div class="cx-sh">Spaces<span class="cx-plus"' + K('addSpace') + '>' + I('plus') + '</span></div>' +
      '<div class="cx-tn quick">' + I('layers') + '<span>Everything</span></div>' + tree.map(node).join('') + '</aside>';
  }
  function shell(s, main, opt) {
    opt = opt || {};
    const navs = [['home', 'home', 'Home'], ['inbox', 'inbox', 'Inbox'], ['planner', 'calendar', 'Planner'], ['ai', 'sparkle', 'AI'], ['chat', 'message', 'Chat'], ['docs', 'doc', 'Docs'], ['dash', 'chart', 'Dashboards'], ['wb', 'whiteboard', 'Whiteboards'], ['more', 'grip', 'More']];
    return '<div class="cx-app' + (s.dark ? ' dark' : '') + '" style="--ac:' + (s.accent || '#7b68ee') + '">' +
      '<div class="cx-top"><span class="cx-brand"><span class="cx-logo"' + K('logo') + '></span><b>ClickUp</b></span>' +
      '<span class="cx-search' + (s.searchOn ? ' on' : '') + '"' + K('search') + '>' + I('search') + '<span' + K('searchText') + '>' + (s.searchText ? E(s.searchText) : 'Search…') + '</span>' + kbd('Ctrl+K') + '</span>' +
      '<span class="cx-topr"><span class="cx-b ai"' + K('askAI') + '>' + I('sparkle') + 'Ask AI</span><span class="cx-b pri"' + K('create') + '>' + I('plus') + 'Create</span><span class="cx-bell">' + I('bell') + '<i></i></span>' + av('me', 'meAv') + '</span></div>' +
      '<div class="cx-body"><nav class="cx-nav"' + K('nav') + '><span class="cx-sq big">T</span>' + navs.map(n => '<span class="cx-nv' + (s.nav === n[0] ? ' on' : '') + '"' + K('nav-' + n[0]) + '>' + I(n[1]) + '<small>' + n[2] + '</small></span>').join('') + '</nav>' +
      '<div class="cx-work' + (opt.noSide ? ' noside' : '') + '">' + (opt.noSide ? '' : side(s)) + '<main class="cx-main"' + K('main') + '>' + main + '</main></div></div>' +
      (s.results ? pop('results', s.results.map((r, i) => mi('res' + i, r[1], r[0], i === 0)).join(''), 'top:44px;inset-inline-start:260px;width:300px') : '') +
      (s.toast ? '<div class="cx-toast"' + K('toast') + '>' + I('check') + '<span>' + E(s.toast) + '</span></div>' : '') + '</div>';
  }
  /* View header: location, list name, and the header buttons ClickUp shows on the right */
  const crumbs = s => '<div class="cx-vh"><div class="cx-crumb">' + spav(['العمليات', 'Operations'], '#7b68ee', 'sm') + '<span>' + E(['العمليات', 'Operations']) + '</span><i>/</i><b>' + E(s.title || ['التخطيط', 'Planning']) + '</b>' + I('star') + '</div><span class="cx-gap"></span>' +
    '<span class="cx-hb ai">' + I('sparkle') + 'Ask AI</span><span class="cx-hb">' + I('share') + 'Share</span><span class="cx-hb">' + I('zap') + 'Automations</span><span class="cx-hb">···</span></div>';
  const tabs = (s, on) => '<div class="cx-tabs">' + [['list', 'list', 'List'], ['board', 'board', 'Board'], ['calendar', 'calendar', 'Calendar'], ['gantt', 'gantt', 'Gantt'], ['table', 'table', 'Table']].concat(s.extraTabs || []).map(t => '<span class="cx-tab' + (on === t[0] ? ' on' : '') + '"' + K('tab-' + t[0]) + '>' + I(t[1]) + t[2] + '</span>').join('') + '<span class="cx-tab add"' + K('addView') + '>' + I('plus') + 'View</span></div>';

  /* ---------- Scenes ---------- */
  const SC = {};

  SC.journey = s => '<div class="cx-journey">' + s.items.map((it, i) => '<div class="cx-stop' + (i < (s.lit || 0) ? ' lit' : '') + '"' + K('stop' + i) + ' style="--c:' + it[2] + '"><span>' + I(it[0]) + '</span><small>' + E(it[1]) + '</small></div>').join('<i class="cx-road' + '"></i>') + '</div>' +
    (s.hello ? '<div class="cx-hello"' + K('hello') + '>' + av('me') + '<p>' + E(s.hello) + '</p></div>' : '');

  SC.login = s => {
    let card = '';
    if (s.view === 'invite') card = '<div class="cx-mail"' + K('mail') + '><div class="cx-mail-h">' + I('inbox') + E(['بريدك الوارد', 'Your inbox']) + '</div><div class="cx-mail-b">' + av('maryam') + '<div><b>' + E(['مريم دعتك إلى «مساحة عمل التدريب»', 'Maryam invited you to “Training Workspace”']) + '</b><p>' + E(['انضم لتعمل مع فريقك في ClickUp.', 'Join to work with your team in ClickUp.']) + '</p>' + btn('join', 'Join Workspace', 'pri') + '</div></div></div>';
    else if (s.view === 'profile') card = '<div class="cx-card cx-prof"><h4>My Settings</h4><div class="cx-prof-row"><span class="cx-bigav' + (s.photo ? ' on' : '') + '"' + K('photo') + '>' + (s.photo ? E(['أ', 'A']) : I('user')) + '</span><div><small>Name</small><div class="cx-in"' + K('name') + '>' + E(s.name || '') + '</div></div></div><small>Time zone</small><div class="cx-in"' + K('tz') + '>' + E(s.tz || 'Select…') + '</div>' + btn('save', 'Save changes', 'pri') + '</div>';
    else card = '<div class="cx-card cx-sign"><span class="cx-logo big"></span><h4>' + E(['تسجيل الدخول إلى ClickUp', 'Sign in to ClickUp']) + '</h4><small>Work email</small><div class="cx-in"' + K('email') + '>' + E(s.email || '') + '</div>' + btn('go', 'Continue', 'pri wide') + '<div class="cx-or">or</div>' + btn('sso', 'Continue with SSO', 'wide', 'lock') + '</div>';
    return '<div class="cx-center">' + card + '</div>' + (s.toast ? '<div class="cx-toast"' + K('toast') + '>' + I('check') + '<span>' + E(s.toast) + '</span></div>' : '');
  };

  SC.shell = s => shell(s, crumbs(s) + tabs(s, 'list') + listBody(Object.assign({ cols: ['assignee', 'due'] }, s)));

  SC.tree = s => shell(s, '<div class="cx-treeview"><div class="cx-levels">' + [['ws', 'Workspace', ['الشركة كلها', 'The whole company']], ['space', 'Space', ['قسم أو فريق', 'A department or team']], ['folder', 'Folder', ['مشروع', 'A project']], ['list', 'List', ['مرحلة أو نوع عمل', 'A stage or kind of work']], ['task', 'Task', ['عمل ينجزه شخص', 'Work one person does']]].map((x, i) =>
    '<div class="cx-lv' + (s.level === x[0] ? ' on' : '') + '"' + K('lv-' + x[0]) + ' style="--i:' + i + '">' + I(TI[x[0]]) + '<b>' + x[1] + '</b><small>' + E(x[2]) + '</small></div>').join('') + '</div>' +
    '<div class="cx-build">' + (s.nodes || []).map(n => '<div class="cx-node l' + n.l + '"' + K(n.k) + '>' + I(TI[n.t]) + '<span>' + E(n.n) + '</span><em>' + ({ ws: 'Workspace', space: 'Space', folder: 'Folder', list: 'List', task: 'Task' })[n.t] + '</em></div>').join('') +
    (s.menu ? pop('menu', s.menu.map(m => mi('m-' + m[0], m[1], m[2])).join(''), 'top:' + (s.menuTop || 120) + 'px;inset-inline-end:40px;width:190px', 'Create') : '') + '</div></div>');

  /* List view body, shared by list, shell and filter scenes */
  const COLN = { assignee: 'Assignee', due: 'Due date', prio: 'Priority', status: 'Status', region: ['المنطقة', 'Region'], est: 'Time estimate', start: 'Start date' };
  function cell(c, r) {
    if (c === 'assignee') return r.who ? (Array.isArray(r.who) ? r.who : [r.who]).map(w => av(w)).join('') : '<span class="cx-empty">' + I('user') + '</span>';
    if (c === 'due' || c === 'start') { const v = r[c]; return v ? '<span class="cx-date' + (r.late && c === 'due' ? ' late' : '') + '">' + E(v) + '</span>' : '<span class="cx-empty">' + I('calendar') + '</span>'; }
    if (c === 'prio') return prl(r.prio);
    if (c === 'status') return st(r.st || 'todo');
    if (c === 'region') return r.region ? '<span class="cx-tag">' + E(r.region) + '</span>' : '<span class="cx-empty">—</span>';
    if (c === 'est') return r.est ? '<span class="cx-date">' + E(r.est) + '</span>' : '<span class="cx-empty">—</span>';
    return '';
  }
  function listRow(r, cols) {
    return '<div class="cx-row' + (r.p ? ' sub' : '') + (r.sel ? ' sel' : '') + '"' + K(r.k) + '><span class="cx-cb' + (r.sel ? ' on' : '') + '"' + K(r.k + '-cb') + '></span>' + dot(r.st || 'todo') +
      '<span class="cx-name"' + K(r.k + '-name') + '>' + E(r.n) + (r.subs ? '<span class="cx-subs"' + K(r.k + '-subs') + '>' + I('subtask') + r.subs + '</span>' : '') + '</span>' +
      cols.map(c => '<span class="cx-c c-' + c + '"' + K(r.k + '-' + c) + '>' + cell(c, r) + '</span>').join('') + '<span class="cx-c"></span></div>';
  }
  /* ClickUp's List view is grouped by status by default. Each group header shows
     the status pill, a count and the column names; "+ Add Task" sits under it. */
  function listBody(s) {
    const cols = s.cols || ['assignee', 'due', 'prio'];
    const rows = (s.rows || []).filter(r => !r.p || (s.rows.find(x => x.k === r.p) || {}).open);
    const grp = s.group === 'none' ? null : (s.group || 'status');
    const heads = first => cols.map(c => '<span class="cx-c ch"' + (first ? K('col-' + c) : '') + '>' + E(COLN[c] || c) + '</span>').join('') + '<span class="cx-c add"' + (first ? K('addCol') : '') + '>' + I('plus') + '</span>';
    const addRow = keyed => '<div class="cx-addrow"' + (keyed ? K('addTask') : '') + '>' + I('plus') + '<span' + (keyed ? K('newTask') : '') + '>' + (keyed && s.newTask ? E(s.newTask) : 'Add Task') + '</span></div>';
    let body = '', first = true;
    if (grp) {
      const keyOf = r => grp === 'assignee' ? (Array.isArray(r.who) ? r.who[0] : r.who) || 'none' : grp === 'prio' ? r.prio || 'none' : r.st || 'todo';
      const order = grp === 'assignee' ? ['me', 'salim', 'maryam', 'khalid', 'noura', 'none'] : grp === 'prio' ? ['urgent', 'high', 'normal', 'low', 'none'] : ['todo', 'prog', 'rev', 'wait', 'done'];
      order.forEach(g => {
        const rs = rows.filter(r => keyOf(r) === g); if (!rs.length) return;
        const label = grp === 'assignee' ? (g === 'none' ? '<span class="cx-gl">' + I('user') + 'Unassigned</span>' : '<span class="cx-gl">' + av(g) + esc(who(g)) + '</span>') : grp === 'prio' ? (g === 'none' ? '<span class="cx-gl">' + pr(null) + 'No priority</span>' : '<span class="cx-gl" style="--c:' + PR[g] + '">' + prl(g) + '</span>') : st(g);
        body += '<div class="cx-ghead"><span class="cx-gname">' + I('chev-down') + '<span class="cx-gk"' + K('g-' + g) + '>' + label + '<small>' + rs.length + '</small></span><span class="cx-gadd">' + I('plus') + 'Add Task</span></span>' + heads(first) + '</div>' +
          rs.map(r => listRow(r, cols)).join('') + (first ? addRow(true) : '');
        first = false;
      });
    }
    if (!body) body = '<div class="cx-lhead"><span></span><span></span><span>Name</span>' + heads(true) + '</div>' + rows.map(r => listRow(r, cols)).join('') + addRow(true);
    const sel = (s.rows || []).filter(r => r.sel).length;
    const gname = { assignee: 'Assignee', status: 'Status', prio: 'Priority' };
    return '<div class="cx-tools">' + btn('grp', 'Group: ' + (grp ? gname[grp] : 'None'), grp ? 'on' : '', 'layers') + '<span class="cx-b">' + I('subtask') + 'Subtasks</span><span class="cx-gap"></span>' +
      btn('sort', s.sort ? s.sort : 'Sort', s.sort ? 'on' : '', 'sort') + btn('flt', s.filter ? s.filter : 'Filter', s.filter ? 'on' : '', 'filter') + btn('meBtn', 'Me', s.me ? 'on' : '', 'user') +
      (s.dirty ? btn('saveView', 'Save view', 'pri') : '') + btn('more', '···') + '<span class="cx-b pri">' + I('plus') + 'Task</span></div>' +
      '<div class="cx-list" style="--cols:' + cols.length + '">' + body + '</div>' +
      (sel ? '<div class="cx-bulk"' + K('bulk') + '><b>' + sel + ' ' + E(['محددة', 'selected']) + '</b>' + btn('bAssign', 'Assignee', '', 'user') + btn('bStatus', 'Status', '', 'check') + btn('bDate', 'Dates', '', 'calendar') + btn('bMove', 'Move', '', 'arrow-end') + btn('bDel', 'Delete', '', 'trash') + '</div>' : '') +
      listPop(s);
  }
  function listPop(s) {
    const p = s.pop; if (!p) return '';
    if (p === 'assignee') return pop('pop', ['salim', 'maryam', 'khalid', 'noura'].map(w => '<div class="cx-mi"' + K('p-' + w) + '>' + av(w) + '<span>' + esc(who(w)) + '</span></div>').join(''), 'top:118px;inset-inline-end:150px;width:170px', 'Assignee');
    if (p === 'date') return pop('pop', '<div class="cx-cal">' + Array.from({ length: 28 }, (_, i) => '<span' + K('d' + (i + 1)) + (s.pick === i + 1 ? ' class="on"' : '') + '>' + (i + 1) + '</span>').join('') + '</div><div class="cx-pop-f">' + mi('rec', 'Recurring', 'repeat', s.recurring) + '</div>', 'top:110px;inset-inline-end:60px;width:230px', 'Due date');
    if (p === 'col') return pop('pop', [['dd', 'Dropdown', 'list'], ['num', 'Number', 'chart'], ['money', 'Money', 'tag'], ['date', 'Date', 'calendar'], ['text', 'Text', 'doc'], ['formula', 'Formula', 'zap']].map(x => mi('ft-' + x[0], x[1], x[2])).join(''), 'top:96px;inset-inline-end:16px;width:180px', 'New field');
    if (p === 'group') return pop('pop', [['status', 'Status', 'check'], ['assignee', 'Assignee', 'user'], ['prio', 'Priority', 'flag'], ['due', 'Due date', 'calendar']].map(x => mi('gp-' + x[0], x[1], x[2], s.group === x[0])).join(''), 'top:96px;inset-inline-start:20px;width:170px', 'Group by');
    if (p === 'filter') return pop('pop', '<div class="cx-rule"' + K('rule1') + '><span>Assignee</span><span>is</span><span>' + av('me') + E(['أنا', 'Me']) + '</span></div>' + (s.rule2 ? '<div class="cx-rule"' + K('rule2') + '><span>Priority</span><span>is</span><span>' + pr('urgent') + 'Urgent</span></div>' : '') + '<div class="cx-mi"' + K('addRule') + '>' + I('plus') + '<span>Add filter</span></div>', 'top:96px;inset-inline-start:90px;width:280px', 'Filters');
    if (p === 'sort') return pop('pop', [['due', 'Due date', 'calendar'], ['prio', 'Priority', 'flag'], ['name', 'Name', 'sort']].map(x => mi('so-' + x[0], x[1], x[2])).join(''), 'top:96px;inset-inline-start:250px;width:170px', 'Sort by');
    if (p === 'views') return pop('pop', [['board', 'Board', 'board'], ['calendar', 'Calendar', 'calendar'], ['gantt', 'Gantt', 'gantt'], ['wb', 'Whiteboard', 'whiteboard'], ['form', 'Form', 'form'], ['doc', 'Doc', 'doc'], ['map', 'Map', 'compass'], ['mind', 'Mind Map', 'path']].map(x => mi('v-' + x[0], x[1], x[2])).join(''), 'top:70px;inset-inline-start:330px;width:180px', 'Add view');
    if (p === 'dd') return pop('pop', (s.ddOpts || []).map((o, i) => '<div class="cx-mi"' + K('o' + i) + '><span class="cx-tag">' + E(o) + '</span></div>').join(''), 'top:110px;inset-inline-end:16px;width:180px', ['خيارات القائمة', 'Dropdown options']);
    return '';
  }
  SC.list = s => shell(s, crumbs(s) + tabs(s, 'list') + listBody(s));

  SC.board = s => shell(s, crumbs(s) + tabs(s, 'board') + '<div class="cx-tools">' + btn('', 'Group: Status', 'on', 'layers') + '<span class="cx-gap"></span>' + btn('', 'Filter', '', 'filter') + btn('', 'Me', '', 'user') + '<span class="cx-b pri">' + I('plus') + 'Task</span></div>' +
    '<div class="cx-boardv">' + (s.cols || []).map(c => '<div class="cx-col" style="--c:' + (ST[c.st] || ST.todo)[1] + '"' + K('col-' + c.st) + '><div class="cx-col-h">' + st(c.st) + '<small>' + c.cards.length + '</small><span class="cx-gap"></span><span class="cx-cm">···</span></div>' +
    c.cards.map(cd => '<div class="cx-card2"' + K(cd.k) + '><b>' + E(cd.n) + '</b><div>' + (cd.who ? av(cd.who) : '<span class="cx-empty">' + I('user') + '</span>') + (cd.due ? '<span class="cx-date">' + I('calendar') + E(cd.due) + '</span>' : '') + (cd.prio ? prl(cd.prio) : '') + '</div></div>').join('') +
    '<div class="cx-addcard"' + K('add-' + c.st) + '>' + I('plus') + 'Add Task</div></div>').join('') + '</div>');

  SC.calendar = s => shell(s, crumbs(s) + tabs(s, 'calendar') + '<div class="cx-calv"><div class="cx-cal-tools">' + ['Day', 'Week', 'Month'].map(x => '<span class="cx-b' + ((s.range || 'Week') === x ? ' on' : '') + '"' + K('r-' + x) + '>' + x + '</span>').join('') + '</div><div class="cx-week">' +
    DAYS().map((d, i) => '<div class="cx-day"' + K('day' + i) + '><small>' + d + ' ' + (12 + i) + '</small>' + (s.items || []).filter(t => t.d === i).map(t => '<span class="cx-chip" style="--c:' + (t.c || '#7b68ee') + '"' + K(t.k) + '>' + E(t.n) + '</span>').join('') + '</div>').join('') + '</div>' +
    (s.uns ? '<div class="cx-uns"' + K('uns') + '><small>' + E(['بلا موعد', 'Unscheduled']) + '</small>' + s.uns.map(t => '<span class="cx-chip" style="--c:#87909e"' + K(t.k) + '>' + E(t.n) + '</span>').join('') + '</div>' : '') + '</div>');

  SC.gantt = s => {
    const cw = 42, rh = 40, n = 10;
    const rows = s.rows || [];
    const bar = (r, i) => r.ms ? '<span class="cx-ms"' + K(r.k) + ' style="left:' + (r.s * cw + 6) + 'px;top:' + (i * rh + 12) + 'px"></span>'
      : '<span class="cx-bar' + (r.crit ? ' crit' : '') + '"' + K(r.k) + ' style="left:' + (r.s * cw + 2) + 'px;top:' + (i * rh + 9) + 'px;width:' + (r.w * cw - 4) + 'px;--c:' + (r.c || '#7b68ee') + '">' + (r.who ? av(r.who) : '') + '</span>';
    const idx = k => rows.findIndex(r => r.k === k);
    const lines = (s.deps || []).map(d => { const a = rows[idx(d[0])], b = rows[idx(d[1])]; if (!a || !b) return ''; const x1 = (a.s + (a.w || 0.5)) * cw, y1 = idx(d[0]) * rh + 20, x2 = b.s * cw + 4, y2 = idx(d[1]) * rh + 20; return '<path d="M' + x1 + ' ' + y1 + ' H' + (x1 + 10) + ' V' + y2 + ' H' + x2 + '" />'; }).join('');
    return shell(s, crumbs(s) + tabs(s, s.timeline ? 'gantt' : 'gantt') + '<div class="cx-gantt" dir="ltr"><div class="cx-g-names">' + '<div class="cx-g-h">' + (s.timeline ? 'Assignee' : 'Task') + '</div>' + rows.map(r => '<div class="cx-g-n">' + (s.timeline && r.who ? av(r.who) + ' ' : '') + E(r.n) + '</div>').join('') + '</div>' +
      '<div class="cx-g-track"><div class="cx-g-h">' + Array.from({ length: n }, (_, i) => '<span>' + (12 + i) + '</span>').join('') + '</div><div class="cx-g-area" style="height:' + rows.length * rh + 'px">' + Array.from({ length: n }, (_, i) => '<i style="left:' + i * cw + 'px"></i>').join('') +
      (s.today != null ? '<b class="cx-today" style="left:' + s.today * cw + 'px"></b>' : '') + '<svg class="cx-deps" width="' + n * cw + '" height="' + rows.length * rh + '">' + lines + '</svg>' + rows.map(bar).join('') + '</div></div></div>');
  };

  SC.table = s => shell(s, crumbs(s) + tabs(s, 'table') + '<div class="cx-sheet"><div class="cx-tr th">' + (s.cols || []).map(c => '<span>' + E(c) + '</span>').join('') + '</div>' +
    (s.rows || []).map((r, ri) => '<div class="cx-tr">' + r.map((v, ci) => '<span class="' + (s.edit && s.edit[0] === ri && s.edit[1] === ci ? 'edit' : '') + '"' + K('c' + ri + '-' + ci) + '>' + E(v) + '</span>').join('') + '</div>').join('') + '</div>');

  SC.whiteboard = s => shell(s, '<div class="cx-wb"><div class="cx-wb-tools">' + [['tSticky', 'doc'], ['tShape', 'module'], ['tText', 'tag'], ['tLine', 'path']].map(x => '<span' + K(x[0]) + '>' + I(x[1]) + '</span>').join('') + '</div>' +
    '<svg class="cx-wb-lines">' + (s.arrows || []).map(a => { const f = (s.notes || []).find(n => n.k === a[0]), t = (s.notes || []).find(n => n.k === a[1]); return f && t ? '<line x1="' + (f.x + 70) + '" y1="' + (f.y + 38) + '" x2="' + (t.x + 70) + '" y2="' + (t.y + 38) + '"/>' : ''; }).join('') + '</svg>' +
    (s.notes || []).map(n => '<div class="cx-sticky' + (n.task ? ' task' : '') + '"' + K(n.k) + ' style="left:' + n.x + 'px;top:' + n.y + 'px;--c:' + (n.c || '#ffe066') + '">' + (n.task ? '<em>' + I('checklist') + 'Task</em>' : '') + E(n.t) + '</div>').join('') +
    (s.menu ? pop('menu', mi('toTask', 'Convert to task', 'checklist') + mi('dup', 'Duplicate', 'template'), s.menuStyle || 'top:150px;left:330px;width:180px') : '') + '</div>', { noSide: true });

  SC.workload = s => shell(s, crumbs(s) + tabs(s, 'workload', s.extraTabs) + '<div class="cx-wl"><div class="cx-wl-h"><span></span>' + DAYS().map(d => '<span>' + d + '</span>').join('') + '</div>' +
    (s.people || []).map(p => '<div class="cx-wl-r"' + K('p-' + p.who) + '><span>' + av(p.who) + esc(who(p.who)) + '</span>' + p.h.map((h, i) => '<span class="cx-wl-c' + (h > 8 ? ' over' : h < 4 ? ' low' : '') + '"' + K(p.who + '-' + i) + '><i style="height:' + Math.min(100, h / 8 * 100) + '%"></i><b>' + h + 'h</b></span>').join('') + '</div>').join('') + '<div class="cx-wl-cap">' + E(['السعة: 8 ساعات يومياً', 'Capacity: 8h per day']) + '</div></div>');

  SC.activity = s => shell(s, crumbs(s) + tabs(s, 'activity', [['activity', 'clock', 'Activity']]) + '<div class="cx-feed">' + (s.feed || []).map(f => '<div class="cx-ev"' + K(f.k) + '>' + av(f.who) + '<div><b>' + esc(who(f.who)) + '</b> ' + E(f.x) + '<small>' + E(f.t || ['الآن', 'just now']) + '</small></div></div>').join('') +
    (s.flt ? '<div class="cx-feedf"' + K('feedf') + '>' + I('filter') + E(s.flt) + '</div>' : '') + '</div>');

  SC.doc = s => shell(s, '<div class="cx-doc"><div class="cx-doc-t"' + K('docTitle') + '>' + E(s.title || 'Untitled') + '</div>' + (s.blocks || []).map(b => {
    if (b.ty === 'h') return '<h5' + K(b.k) + '>' + E(b.x) + '</h5>';
    if (b.ty === 'li') return '<div class="cx-li"' + K(b.k) + '><span>' + (b.n || '•') + '</span>' + E(b.x) + '</div>';
    if (b.ty === 'task') return '<div class="cx-li task"' + K(b.k) + '>' + I('checklist') + E(b.x) + (b.who ? av(b.who) : '') + '</div>';
    if (b.ty === 'ai') return '<div class="cx-aiw"' + K(b.k) + '>' + I('sparkle') + E(b.x) + '</div>';
    return '<p' + K(b.k) + '>' + E(b.x) + '</p>';
  }).join('') + '<div class="cx-caret"' + K('cursor') + '>' + E(s.typing || '') + '</div>' +
    (s.slash ? pop('slash', [['sAI', 'Write with AI', 'sparkle'], ['sTask', 'Task', 'checklist'], ['sH', 'Heading', 'tag'], ['sTable', 'Table', 'table']].map(x => mi(x[0], x[1], x[2], x[0] === s.slash)).join(''), 'top:150px;inset-inline-start:60px;width:200px') : '') +
    (s.aiBox ? '<div class="cx-aibox"' + K('aiBox') + '>' + I('sparkle') + '<span' + K('aiPrompt') + '>' + E(s.aiBox) + '</span>' + (s.aiGen ? '<span class="cx-dots"><i></i><i></i><i></i></span>' : btn('aiGo', 'Generate', 'pri')) + '</div>' : '') + '</div>', { noSide: !!s.noSide });

  SC.form = s => shell(s, crumbs(s) + tabs(s, 'form', [['form', 'form', 'Form']]) + '<div class="cx-formv">' +
    (s.palette ? '<div class="cx-fpal">' + [['short', 'Short text', 'tag'], ['dd', 'Dropdown', 'list'], ['date', 'Date', 'calendar'], ['file', 'Attachment', 'clip']].map(x => '<span' + K('fp-' + x[0]) + '>' + I(x[2]) + x[1] + '</span>').join('') + '</div>' : '') +
    '<div class="cx-fcard"' + K('fcard') + '><h5>' + E(s.ftitle || ['طلب صيانة', 'Maintenance request']) + '</h5>' + (s.fields || []).map(f => '<label' + K(f.k) + '><small>' + E(f.l) + (f.req ? ' <b>*</b>' : '') + '</small><span class="cx-in"' + K(f.k + '-v') + '>' + E(f.v || '') + '</span></label>').join('') + btn('submit', 'Submit', 'pri') + '</div>' +
    (s.out ? '<div class="cx-fout"><small>' + E(['قائمة الطلبات', 'Requests List']) + '</small>' + s.out.map(r => '<div class="cx-row mini"' + K(r.k) + '>' + dot('todo') + '<span>' + E(r.n) + '</span>' + (r.who ? av(r.who) : '') + '</div>').join('') + '</div>' : '') + '</div>');

  SC.mindmap = s => {
    const nodes = s.nodes || []; const at = k => nodes.find(n => n.k === k);
    return shell(s, '<div class="cx-mind"><svg>' + nodes.filter(n => n.p && at(n.p)).map(n => { const p = at(n.p); return '<path d="M' + (p.x + 60) + ' ' + (p.y + 16) + ' C' + (p.x + 120) + ' ' + (p.y + 16) + ' ' + (n.x - 40) + ' ' + (n.y + 16) + ' ' + n.x + ' ' + (n.y + 16) + '"/>'; }).join('') + '</svg>' +
      nodes.map(n => '<div class="cx-mn' + (n.p ? '' : ' root') + (n.task ? ' task' : '') + '"' + K(n.k) + ' style="left:' + n.x + 'px;top:' + n.y + 'px">' + (n.task ? I('checklist') : '') + E(n.n) + '</div>').join('') + '</div>', { noSide: true });
  };
  SC.map = s => shell(s, crumbs(s) + tabs(s, 'map', [['map', 'compass', 'Map']]) + '<div class="cx-mapv"><svg viewBox="0 0 600 300" preserveAspectRatio="none"><path d="M40 260 C120 200 160 210 230 150 S360 60 470 40 L600 20 L600 300 L0 300Z" class="land"/><path d="M60 280 C200 220 300 200 420 120" class="road"/><path d="M200 300 C260 230 330 210 560 160" class="road"/></svg>' +
    (s.pins || []).map(p => '<span class="cx-pin" style="left:' + p.x + '%;top:' + p.y + '%;--c:' + (p.c || '#e03131') + '"' + K(p.k) + '>' + I('target') + (s.open === p.k ? '<em>' + E(p.n) + '</em>' : '') + '</span>').join('') + '</div>');

  SC.ai = s => shell(s, '<div class="cx-aiv"><div class="cx-ctx"' + K('ctx') + '>' + (s.ctx ? '<h5>' + I(s.ctx.ic || 'checklist') + E(s.ctx.t) + '</h5>' + (s.ctx.lines || []).map((l, i) => '<p' + K('cl' + i) + '>' + E(l) + '</p>').join('') : '') + '</div>' +
    '<div class="cx-aip"' + K('aiPanel') + '><div class="cx-aip-h">' + I('sparkle') + (s.aiTitle || 'Brain') + '</div><div class="cx-aip-b">' + (s.chat || []).map(m => '<div class="cx-msg ' + m.w + '"' + K(m.k) + '>' + (m.w === 'ai' ? av('ai') : '') + '<div>' + E(m.x) + (m.list ? '<ul>' + m.list.map(x => '<li>' + E(x) + '</li>').join('') + '</ul>' : '') + (m.src ? '<small class="cx-src">' + I('link') + E(m.src) + '</small>' : '') + '</div></div>').join('') +
    (s.thinking ? '<div class="cx-msg ai">' + av('ai') + '<span class="cx-dots"><i></i><i></i><i></i></span></div>' : '') + '</div><div class="cx-in ask"' + K('aiInput') + '>' + E(s.ask || ['اسأل أو اطلب أي شيء…', 'Ask or request anything…']) + '</div></div></div>', { noSide: true });

  SC.agent = s => {
    const a = s.agent || {};
    const chips = (arr, k) => '<div class="cx-chips"' + K(k) + '>' + (arr || []).map((c, i) => '<span' + K(k + i) + '>' + E(c) + '</span>').join('') + '</div>';
    return shell(s, '<div class="cx-agentv"><div class="cx-aip"' + K('builder') + '><div class="cx-aip-h">' + I('robot') + 'Super Agent builder</div><div class="cx-aip-b">' + (s.chat || []).map(m => '<div class="cx-msg ' + m.w + '"' + K(m.k) + '>' + (m.w === 'ai' ? av('ai') : '') + '<div>' + E(m.x) + '</div></div>').join('') + '</div><div class="cx-in ask"' + K('bInput') + '>' + E(s.ask || ['صف ما تريد أن يفعله الوكيل…', 'Describe what the agent should do…']) + '</div></div>' +
      '<div class="cx-acard"' + K('acard') + '><div class="cx-acard-h">' + av('agent') + '<div><b' + K('aName') + '>' + E(a.name || ['وكيل جديد', 'New agent']) + '</b><small>' + (a.active ? '● Active' : '○ Draft') + '</small></div></div>' +
      '<small>' + E(['المهمة', 'Job']) + '</small><p' + K('aJob') + '>' + E(a.job || '—') + '</p><small>Triggers</small>' + chips(a.trig, 'aTrig') + '<small>' + E(['الأدوات والصلاحيات', 'Tools & access']) + '</small>' + chips(a.tools, 'aTools') + '<small>' + E(['المعرفة', 'Knowledge']) + '</small>' + chips(a.know, 'aKnow') +
      (a.log ? '<div class="cx-alog">' + a.log.map((l, i) => '<div' + K('log' + i) + '>' + I('check') + E(l) + '</div>').join('') + '</div>' : '') + btn('activate', a.active ? 'Edit agent' : 'Activate', a.active ? '' : 'pri') + '</div></div>', { noSide: true });
  };

  SC.meeting = s => '<div class="cx-meet"><div class="cx-tiles">' + ['me', 'salim', 'maryam', 'khalid'].map(w => '<div class="cx-tile' + (s.speaker === w ? ' talk' : '') + '"' + K('t-' + w) + '>' + av(w) + '<small>' + esc(who(w)) + '</small></div>').join('') +
    '<div class="cx-rec' + (s.rec ? ' on' : '') + '"' + K('rec') + '><i></i>' + (s.rec ? 'AI Notetaker · recording' : 'AI Notetaker') + '</div></div>' +
    '<div class="cx-notes"' + K('notes') + '><div class="cx-ntabs">' + [['tr', 'Transcript'], ['sum', 'Summary'], ['act', 'Action items']].map(t => '<span class="' + ((s.tab || 'tr') === t[0] ? 'on' : '') + '"' + K('nt-' + t[0]) + '>' + t[1] + '</span>').join('') + '</div><div class="cx-nbody">' +
    ((s.tab || 'tr') === 'tr' ? (s.lines || []).map((l, i) => '<p' + K('ln' + i) + '><b>' + esc(who(l.w)) + ':</b> ' + E(l.x) + '</p>').join('') : '') +
    (s.tab === 'sum' ? (s.sum || []).map((l, i) => '<div class="cx-li"' + K('sm' + i) + '><span>•</span>' + E(l) + '</div>').join('') : '') +
    (s.tab === 'act' ? (s.acts || []).map(a => '<div class="cx-li task' + (a.task ? ' made' : '') + '"' + K(a.k) + '>' + I('checklist') + E(a.x) + av(a.w) + (a.task ? '<em>Task</em>' : '') + '</div>').join('') + (s.mk ? btn('mkTasks', ['أنشئ المهام', 'Create tasks'], 'pri') : '') : '') + '</div></div></div>';

  SC.task = s => {
    const subs = s.subs ? '<div class="cx-sec"><b>Subtasks</b>' + s.subs.map(x => '<div class="cx-row mini"' + K(x.k) + '>' + dot(x.st || 'todo') + '<span>' + E(x.n) + '</span>' + (x.who ? av(x.who) : '<span class="cx-empty">' + I('user') + '</span>') + (x.due ? '<span class="cx-date">' + E(x.due) + '</span>' : '') + '</div>').join('') + '<div class="cx-addrow"' + K('addSub') + '>' + I('plus') + '<span' + K('newSub') + '>' + E(s.newSub || 'Add subtask') + '</span></div></div>' : '';
    const check = s.check ? '<div class="cx-sec"><b>Checklist</b>' + s.check.map(x => '<div class="cx-chk' + (x.done ? ' on' : '') + '"' + K(x.k) + '><span class="cx-cb' + (x.done ? ' on' : '') + '"></span>' + E(x.n) + '</div>').join('') + '</div>' : '';
    const com = (s.comments || []).map(c => '<div class="cx-com' + (c.as ? ' as' : '') + (c.res ? ' res' : '') + '"' + K(c.k) + '>' + av(c.w) + '<div><b>' + esc(who(c.w)) + '</b><p>' + E(c.x) + '</p>' + (c.as ? '<small>' + I('user') + E(['مسند إلى ', 'Assigned to ']) + esc(who(c.as)) + (c.res ? ' · Resolved ✓' : '') + '</small>' : '') + '</div></div>').join('');
    const lab = (ic, t) => '<small>' + I(ic) + t + '</small>';
    return shell(s, '<div class="cx-taskv"><div class="cx-tmain"><div class="cx-thead"><div class="cx-crumb">' + spav(['العمليات', 'Operations'], '#7b68ee', 'sm') + '<span>' + E(['العمليات', 'Operations']) + '</span><i>/</i><b>' + E(s.title2 || ['التخطيط', 'Planning']) + '</b></div><span class="cx-gap"></span><span class="cx-hb ai">' + I('sparkle') + 'Ask AI</span><span class="cx-hb">' + I('share') + 'Share</span></div>' +
      '<span class="cx-ttype">' + dot(s.st || 'todo') + 'Task</span><div class="cx-ttl"' + K('tTitle') + '>' + E(s.title || '') + '</div>' +
      '<div class="cx-props"><div>' + lab('check-circle', 'Status') + '<span class="cx-stw">' + st(s.st || 'todo', 'tStatus') + '<span class="cx-stok">' + I('check') + '</span></span></div><div>' + lab('users', 'Assignees') + '<span' + K('tWho') + '>' + ((s.who || []).length ? s.who.map(w => av(w)).join('') : '<span class="cx-empty">Empty</span>') + '</span></div>' +
      '<div>' + lab('calendar', 'Dates') + '<span class="cx-date"' + K('tDue') + '>' + E(s.due || 'Empty') + '</span></div><div>' + lab('flag', 'Priority') + prl(s.prio, 'tPrio') + '</div>' +
      (s.timer != null ? '<div>' + lab('timer', 'Track time') + '<span class="cx-timer' + (s.run ? ' on' : '') + '"' + K('tTimer') + '>' + I(s.run ? 'pause' : 'play') + E(s.timer) + '</span></div>' : '') +
      (s.est ? '<div>' + lab('clock', 'Time estimate') + '<span class="cx-date"' + K('tEst') + '>' + E(s.est) + '</span></div>' : '') + '</div>' +
      (s.desc ? '<p class="cx-desc"' + K('tDesc') + '>' + E(s.desc) + '</p>' : '<div class="cx-tadd">' + I('doc') + 'Add description<span class="cx-ai-w">' + I('sparkle') + 'Write with AI</span></div>') + subs + check +
      (subs || check ? '' : '<div class="cx-tchips"><span>' + I('subtask') + 'Add subtask</span><span>' + I('checklist') + 'Checklist</span><span>' + I('clip') + 'Attach file</span></div>') + '</div>' +
      '<div class="cx-tside"><div class="cx-tside-h"><b>Activity</b><span class="cx-watch"' + K('tWatch') + '>' + I('eye') + (s.watch != null ? s.watch : 2) + '</span></div>' + '<small class="cx-act">' + E(['أنشأتَ هذه المهمة', 'You created this task']) + '</small>' + (s.act || []).map((a, i) => '<small class="cx-act"' + K('act' + i) + '>' + E(a) + '</small>').join('') + com +
      '<div class="cx-in cbox"' + K('cBox') + '>' + E(s.cText || ['اكتب تعليقاً…', 'Write a comment…']) + '</div>' +
      (s.mention ? pop('mention', ['salim', 'maryam', 'khalid'].map(w => '<div class="cx-mi"' + K('mn-' + w) + '>' + av(w) + '<span>' + esc(who(w)) + '</span></div>').join(''), 'bottom:60px;inset-inline-end:20px;width:170px', '@') : '') + '</div>' + listPop(s) + '</div>', { noSide: true });
  };

  SC.chat = s => shell(s, '<div class="cx-chatv"><div class="cx-chs"><small>Channels</small>' + (s.channels || []).map(c => '<div class="cx-ch' + (s.cur === c.k ? ' on' : '') + '"' + K(c.k) + '># ' + E(c.n) + (c.u ? '<em>' + c.u + '</em>' : '') + '</div>').join('') + '<span class="cx-plus"' + K('newCh') + '>+ Channel</span><small>Direct messages</small>' + ['salim', 'maryam'].map(w => '<div class="cx-ch"' + K('dm-' + w) + '>' + av(w) + esc(who(w)) + '</div>').join('') + '</div>' +
    '<div class="cx-msgs"><div class="cx-msgs-h"' + K('chHead') + '><b>' + E(s.head || '# general') + '</b>' + (s.members ? '<span>' + s.members.map(w => av(w)).join('') + '</span>' : '') + (s.pinned ? '<em' + K('pinned') + '>' + I('bookmark') + E(s.pinned) + '</em>' : '') + '</div>' + (s.msgs || []).map(m => '<div class="cx-cm"' + K(m.k) + '>' + av(m.w) + '<div><b>' + esc(who(m.w)) + '</b><p>' + E(m.x) + '</p>' + (m.task ? '<span class="cx-tlink">' + I('checklist') + E(m.task) + '</span>' : '') + '</div></div>').join('') +
    (s.menu ? pop('menu', mi('reply', 'Reply in thread', 'message') + mi('mkTask', 'Create task', 'checklist') + mi('pin', 'Pin message', 'bookmark'), s.menuStyle || 'top:130px;inset-inline-end:30px;width:190px') : '') +
    '<div class="cx-in ask"' + K('compose') + '>' + E(s.compose || ['اكتب رسالة…', 'Write a message…']) + '</div></div></div>', { noSide: true });

  SC.dash = s => shell(s, '<div class="cx-dash"><div class="cx-dash-h"><b' + K('dTitle') + '>' + E(s.title || ['لوحة المشروع', 'Project dashboard']) + '</b>' + (s.filter ? '<span class="cx-b on"' + K('dFilter') + '>' + I('filter') + E(s.filter) + '</span>' : btn('dFilter', 'Filter', '', 'filter')) + btn('addCard', 'Add card', 'pri', 'plus') + btn('dShare', 'Share', '', 'share') + '</div><div class="cx-cards">' +
    (s.cards || []).map(c => '<div class="cx-dc ' + c.ty + '"' + K(c.k) + '><small>' + E(c.t) + '</small>' +
      (c.ty === 'num' ? '<b style="color:' + (c.c || 'inherit') + '">' + E(c.v) + '</b>' : '') +
      (c.ty === 'bar' ? '<div class="cx-bars">' + c.v.map((v, i) => '<i style="height:' + v + '%;--c:' + ['#87909e', '#5b45d6', '#e8590c', '#10b981'][i % 4] + '"></i>').join('') + '</div>' : '') +
      (c.ty === 'pie' ? '<div class="cx-pie" style="--a:' + c.v[0] + ';--b:' + c.v[1] + '"></div>' : '') +
      (c.ty === 'list' ? (c.v || []).map(x => '<div class="cx-li"><span>•</span>' + E(x) + '</div>').join('') : '') + '</div>').join('') + '</div>' +
    (s.menu ? pop('menu', [['num', 'Number / Count', 'chart'], ['bar', 'Bar chart', 'chart'], ['pie', 'Pie chart', 'target'], ['calc', 'Calculation', 'zap'], ['time', 'Time tracking', 'timer'], ['work', 'Workload', 'workload']].map(x => mi('ct-' + x[0], x[1], x[2])).join(''), 'top:52px;inset-inline-end:90px;width:200px', 'Add card') : '') +
    (s.gallery ? '<div class="cx-gal"' + K('gal') + '>' + s.gallery.map(g => '<div class="cx-gc"' + K(g.k) + '>' + I(g.ic) + '<b>' + E(g.n) + '</b></div>').join('') + '</div>' : '') + '</div>', { noSide: true });

  SC.file = s => {
    let body = '';
    if (s.stage === 'source') body = '<h5>' + E(['استيراد إلى ClickUp', 'Import to ClickUp']) + '</h5><div class="cx-srcs">' + [['xlsx', 'Excel / CSV', 'table', '#1f9d55'], ['trello', 'Trello', 'board', '#0079bf'], ['asana', 'Asana', 'target', '#f06a6a'], ['jira', 'Jira', 'module', '#2684ff']].map(x => '<div class="cx-srct"' + K('src-' + x[0]) + ' style="--c:' + x[3] + '">' + I(x[2]) + '<b>' + x[1] + '</b></div>').join('') + '</div>';
    else if (s.stage === 'map') body = '<h5>' + E(['طابق الأعمدة', 'Map your columns']) + '</h5><div class="cx-mapc">' + (s.map || []).map((m, i) => '<div class="cx-mrow' + (m[2] ? ' ok' : '') + '"' + K('mp' + i) + '><span class="cx-tag">' + E(m[0]) + '</span>' + I('arrow-end') + '<span class="cx-b">' + E(m[1]) + '</span></div>').join('') + '</div>' + btn('impGo', 'Import', 'pri');
    else if (s.stage === 'sheet') body = '<div class="cx-xl"' + K('xl') + '><div class="cx-xl-h">' + I('table') + 'requests.xlsx</div>' + (s.sheet || []).map((r, i) => '<div class="cx-tr' + (i ? '' : ' th') + '">' + r.map(v => '<span>' + E(v) + '</span>').join('') + '</div>').join('') + '</div>';
    return shell(s, s.stage === 'list' || !s.stage ? crumbs(s) + tabs(s, 'list') + listBody(s) + (s.exp ? pop('exp', [['csv', 'CSV', 'doc'], ['xlsx', 'Excel', 'table']].map(x => mi('fmt-' + x[0], x[1], x[2])).join('') + (s.file ? '<div class="cx-file"' + K('file') + '>' + I('download') + E(s.file) + '</div>' : ''), 'top:96px;inset-inline-end:16px;width:200px', 'Export view') : '') : '<div class="cx-wiz">' + body + '</div>');
  };

  SC.templates = s => shell(s, '<div class="cx-tc"><div class="cx-tc-h"><b>Template Center</b><span class="cx-in"' + K('tSearch') + '>' + I('search') + E(s.q || 'Search templates') + '</span></div><div class="cx-tc-cats">' + ['All', 'Project', 'IT', 'HR', 'Ops'].map(c => '<span class="' + ((s.cat || 'All') === c ? 'on' : '') + '"' + K('cat-' + c) + '>' + c + '</span>').join('') + '</div>' +
    '<div class="cx-tc-grid">' + (s.cards || []).map(c => '<div class="cx-tcc' + (s.preview === c.k ? ' on' : '') + '"' + K(c.k) + ' style="--c:' + (c.c || '#7b68ee') + '">' + I(c.ic || 'template') + '<b>' + E(c.n) + '</b><small>' + E(c.d || '') + '</small></div>').join('') + '</div>' +
    (s.dlg ? '<div class="cx-dlg"' + K('dlg') + '><b>' + E(s.dlg.t) + '</b><small>' + E(['الاسم', 'Name']) + '</small><div class="cx-in"' + K('dName') + '>' + E(s.dlg.n || '') + '</div><small>' + E(['يتضمن', 'Include']) + '</small>' + (s.dlg.opts || []).map((o, i) => '<div class="cx-chk' + (o[1] ? ' on' : '') + '"' + K('op' + i) + '><span class="cx-cb' + (o[1] ? ' on' : '') + '"></span>' + E(o[0]) + '</div>').join('') + btn('dlgGo', s.dlg.b || 'Use template', 'pri') + '</div>' : '') + '</div>', { noSide: true });

  SC.settings = s => {
    const menu = [['profile', 'My Settings', 'user'], ['notif', 'Notifications', 'bell'], ['security', 'Security & 2FA', 'lock'], ['themes', 'Themes', 'star'], ['keys', 'Shortcuts', 'keyboard'], ['-', 'Workspace'], ['people', 'People', 'users'], ['clickapps', 'ClickApps', 'module'], ['schedule', 'Work schedule', 'calendar'], ['perms', 'Security & permissions', 'lock'], ['apps', 'App Center', 'globe']];
    const T = s.tg || {};
    let p = '';
    if (s.page === 'notif') p = '<h5>Notifications</h5><div class="cx-ntbl"><div class="th"><span></span><span>In-app</span><span>Email</span><span>Mobile</span></div>' + [['mention', ['الإشارة إليّ', 'When I am @mentioned']], ['assign', ['مهمة أُسندت إليّ', 'Task assigned to me']], ['status', ['تغيّر الحالة', 'Status changes']], ['comment', ['كل تعليق جديد', 'Every new comment']]].map(r => '<div><span>' + E(r[1]) + '</span>' + ['app', 'mail', 'mob'].map(c => tog('tg-' + r[0] + '-' + c, T[r[0] + '-' + c] !== false)).join('') + '</div>').join('') + '</div>';
    else if (s.page === 'security') p = '<h5>Two-factor authentication</h5><div class="cx-2fa"><div class="cx-qr' + (s.qr ? ' on' : '') + '"' + K('qr') + '>' + (s.qr ? Array.from({ length: 49 }, (_, i) => '<i' + ((i * 7 + i % 5) % 3 ? '' : ' class="b"') + '></i>').join('') : I('lock')) + '</div><div><p>' + E(['1. افتح تطبيق المصادقة وامسح الرمز.', '1. Open your authenticator app and scan the code.']) + '</p><p>' + E(['2. اكتب الرمز المكوّن من 6 أرقام.', '2. Enter the 6-digit code.']) + '</p><div class="cx-in"' + K('code') + '>' + E(s.code || '') + '</div>' + (s.on2fa ? '<span class="cx-ok"' + K('on2fa') + '>' + I('check') + '2FA enabled</span>' : btn('enable2fa', 'Enable 2FA', 'pri')) + '</div></div>';
    else if (s.page === 'themes') p = '<h5>Themes</h5><div class="cx-modes">' + [['light', 'Light'], ['dark', 'Dark'], ['auto', 'Auto']].map(m => '<div class="cx-mode ' + m[0] + ((s.mode || 'light') === m[0] ? ' on' : '') + '"' + K('th-' + m[0]) + '><i></i>' + m[1] + '</div>').join('') + '</div><small>Accent color</small><div class="cx-acc">' + ['#7b68ee', '#0ea5e9', '#10b981', '#e8590c', '#ec4899'].map(c => '<span style="--c:' + c + '"' + K('ac-' + c.slice(1)) + (s.accent === c ? ' class="on"' : '') + '></span>').join('') + '</div>';
    else if (s.page === 'keys') p = '<h5>Keyboard shortcuts</h5><div class="cx-krow">' + tog('tg-kb', s.kb) + E(['تفعيل الاختصارات', 'Enable keyboard shortcuts']) + '</div>' + [['Ctrl+K', ['بحث في كل شيء', 'Search everything']], ['T', ['مهمة جديدة', 'New task']], ['R', ['تذكير جديد', 'New reminder']], ['M', ['أسند المهمة لي', 'Assign to me']], ['Shift+S', ['تغيير الحالة', 'Change status']]].map(r => '<div class="cx-krow' + (s.press === r[0] ? ' hit' : '') + '"' + K('k-' + r[0]) + '>' + kbd(r[0]) + E(r[1]) + '</div>').join('');
    else if (s.page === 'profile') p = '<h5>My Settings</h5>' + [['pName', 'Full name', s.name || ['أشجان السناني', 'Ashjan Al Sinani']], ['pTz', 'Time zone', s.tz || 'Asia/Muscat (GMT+4)'], ['pLang', 'Language', 'English'], ['pDate', 'Date format', s.df || 'dd/mm/yyyy']].map(f => '<small>' + f[1] + '</small><div class="cx-in"' + K(f[0]) + '>' + E(f[2]) + '</div>').join('');
    else if (s.page === 'people') p = '<h5>People</h5>' + (s.members || []).map(m => '<div class="cx-mem"' + K('mem-' + m.w) + '>' + av(m.w) + '<span>' + esc(who(m.w)) + '</span><span class="cx-tag">' + m.r + '</span></div>').join('') + btn('invite', 'Invite people', 'pri', 'plus') + (s.inv ? '<div class="cx-dlg in"' + K('invDlg') + '><small>' + E(s.inv.l1 || 'Email') + '</small><div class="cx-in"' + K('invEmail') + '>' + E(s.inv.e || '') + '</div><small>' + E(s.inv.l2 || 'Role') + '</small><div class="cx-in"' + K('invRole') + '>' + E(s.inv.r || 'Member') + '</div>' + btn('invGo', s.inv.b || 'Send invite', 'pri') + '</div>' : '');
    else if (s.page === 'clickapps') p = '<h5>ClickApps</h5>' + [['time', 'Time Tracking'], ['multi', 'Multiple Assignees'], ['sprint', 'Sprints'], ['prio', 'Priorities'], ['est', 'Time Estimates']].map(r => '<div class="cx-krow"' + K('ca-' + r[0]) + '>' + tog('tg-' + r[0], T[r[0]]) + r[1] + '</div>').join('');
    else if (s.page === 'schedule') p = '<h5>Work schedule</h5><small>' + E(['أيام العمل', 'Working days']) + '</small><div class="cx-days">' + [tx('أحد', 'Sun'), tx('إثن', 'Mon'), tx('ثلا', 'Tue'), tx('أرب', 'Wed'), tx('خمي', 'Thu'), tx('جمع', 'Fri'), tx('سبت', 'Sat')].map((d, i) => '<span class="' + ((s.days || [])[i] ? 'on' : '') + '"' + K('wd' + i) + '>' + d + '</span>').join('') + '</div><small>' + E(['الساعات', 'Hours']) + '</small><div class="cx-in"' + K('hours') + '>' + E(s.hours || '07:30 – 15:30') + '</div><small>' + E(['العطل الرسمية', 'Public holidays']) + '</small>' + (s.hol || []).map((h, i) => '<div class="cx-li"' + K('hol' + i) + '>' + I('calendar') + E(h) + '</div>').join('') + '<div class="cx-addrow"' + K('addHol') + '>' + I('plus') + 'Add holiday</div>';
    else if (s.page === 'perms') p = '<h5>' + E(s.ptitle || 'Security & permissions') + '</h5>' + (s.share ? '<div class="cx-share"' + K('shareDlg') + '><div class="cx-krow">' + I('lock') + E(['خاص', 'Private']) + tog('private', s.priv) + '</div>' + (s.share || []).map(x => '<div class="cx-mem"' + K('sh-' + x.w) + '>' + av(x.w) + '<span>' + esc(who(x.w)) + '</span><span class="cx-tag"' + K('lvl-' + x.w) + '>' + x.l + '</span></div>').join('') + (s.levels ? pop('lvls', ['View', 'Comment', 'Edit', 'Full'].map(l => mi('lv-' + l, l, l === 'View' ? 'eye' : l === 'Comment' ? 'message' : l === 'Edit' ? 'doc' : 'lock', s.lvl === l)).join(''), 'top:150px;inset-inline-end:20px;width:150px') : '') + '</div>' :
      '<div class="cx-roles">' + [['Owner', 5], ['Admin', 4], ['Member', 3], ['Limited Member', 2], ['Guest', 1]].map((r, i) => '<div' + K('role' + i) + (s.role === i ? ' class="on"' : '') + '><b>' + r[0] + '</b><span>' + '●'.repeat(r[1]) + '<em>' + '●'.repeat(5 - r[1]) + '</em></span></div>').join('') + '</div>' + (s.req2fa != null ? '<div class="cx-krow"' + K('req2fa') + '>' + tog('tg-req', s.req2fa) + 'Require 2FA for everyone</div>' : ''));
    else if (s.page === 'apps') p = '<h5>App Center</h5><div class="cx-apps">' + (s.apps || []).map(a => '<div class="cx-app-t"' + K('app-' + a.k) + ' style="--c:' + a.c + '"><span>' + E(a.n.charAt(0)) + '</span><b>' + E(a.n) + '</b>' + (a.on ? '<em class="cx-ok">' + I('check') + 'Connected</em>' : btn('con-' + a.k, 'Connect')) + '</div>').join('') + '</div>';
    return shell(Object.assign({}, s, { nav: '' }), '<div class="cx-set"><div class="cx-setm">' + menu.map(m => m[0] === '-' ? '<small>' + m[1] + '</small>' : mi('m-' + m[0], m[1], m[2], s.page === m[0])).join('') + '</div><div class="cx-setp">' + p + '</div></div>', { noSide: true });
  };

  SC.trash = s => shell(s, '<div class="cx-trash"><h5>' + I('trash') + 'Trash <small>' + E(['تبقى العناصر نحو 30 يوماً', 'Items stay about 30 days']) + '</small></h5>' + (s.items || []).map(t => '<div class="cx-row tr"' + K(t.k) + '>' + I(t.ic || 'checklist') + '<span class="cx-name">' + E(t.n) + '</span><small>' + E(t.d) + '</small>' + btn(t.k + '-r', 'Restore', 'pri', 'reset') + '</div>').join('') +
    (s.arch ? '<h5 style="margin-top:14px">' + I('bookmark') + 'Archived</h5>' + s.arch.map(t => '<div class="cx-row tr"' + K(t.k) + '>' + I('list') + '<span class="cx-name">' + E(t.n) + '</span><small>' + E(['محفوظة دائماً', 'kept forever']) + '</small></div>').join('') : '') + '</div>');

  SC.mywork = s => shell(s, '<div class="cx-mw"><h5>My Work</h5><div class="cx-mwt">' + ['To Do', 'Done', 'Delegated'].map(t => '<span class="' + ((s.tab || 'To Do') === t ? 'on' : '') + '"' + K('mw-' + t) + '>' + t + '</span>').join('') + '</div>' +
    [['today', 'Today', '#5b45d6'], ['overdue', 'Overdue', '#e03131'], ['next', 'Next', '#0ea5e9'], ['uns', 'Unscheduled', '#87909e']].map(sec => { const rs = (s.rows || []).filter(r => r.sec === sec[0]); return '<div class="cx-mws"' + K('sec-' + sec[0]) + '><b style="color:' + sec[2] + '">' + sec[1] + ' <small>' + rs.length + '</small></b>' + rs.map(r => '<div class="cx-row mini"' + K(r.k) + '>' + (r.rem ? I('bell') : dot(r.st || 'todo')) + '<span>' + E(r.n) + '</span>' + (r.due ? '<span class="cx-date' + (sec[0] === 'overdue' ? ' late' : '') + '">' + E(r.due) + '</span>' : '') + '</div>').join('') + '</div>'; }).join('') + '</div>' +
    (s.rem ? '<div class="cx-dlg rem"' + K('remDlg') + '><b>' + I('bell') + 'Reminder</b><div class="cx-in"' + K('remText') + '>' + E(s.rem.x || '') + '</div><div class="cx-in"' + K('remTime') + '>' + I('clock') + E(s.rem.t || ['اليوم 10:00', 'Today 10:00']) + '</div>' + btn('remSave', 'Create reminder', 'pri') + '</div>' : '') +
    (s.note ? '<div class="cx-note"' + K('notepad') + '><b>' + I('doc') + 'Notepad <small>' + E(['خاص بك', 'private']) + '</small></b>' + s.note.map((n, i) => '<div class="cx-chk' + (n.d ? ' on' : '') + '"' + K('nl' + i) + '><span class="cx-cb' + (n.d ? ' on' : '') + '"></span>' + E(n.x) + '</div>').join('') + btn('toTask', 'Convert to task', '', 'checklist') + '</div>' : ''));

  SC.auto = s => shell(s, crumbs(s) + '<div class="cx-autov"><div class="cx-ab"><div class="cx-ab-h">' + I('zap') + 'Automations</div>' +
    '<div class="cx-arow"' + K('trig') + '><small>When</small><span class="' + (s.trig ? 'set' : '') + '">' + E(s.trig || ['اختر مُشغِّلاً', 'Choose a trigger']) + '</span></div>' +
    (s.cond !== undefined ? '<div class="cx-arow"' + K('cond') + '><small>If</small><span class="' + (s.cond ? 'set' : '') + '">' + E(s.cond || ['شرط (اختياري)', 'Condition (optional)']) + '</span></div>' : '') +
    '<div class="cx-arow"' + K('act') + '><small>Then</small><span class="' + ((s.acts || []).length ? 'set' : '') + '">' + ((s.acts || []).length ? s.acts.map(a => E(a)).join('<br>') : E(['اختر إجراءً', 'Choose an action'])) + '</span></div>' + btn('mkAuto', s.made ? 'Saved ✓' : 'Create', s.made ? '' : 'pri') +
    (s.list ? '<div class="cx-alist">' + s.list.map(a => '<div class="cx-krow"' + K(a.k) + '>' + tog(a.k + '-t', a.on) + '<span>' + E(a.n) + '</span>' + (a.runs != null ? '<small>' + a.runs + ' runs</small>' : '') + '</div>').join('') + '</div>' : '') + '</div>' +
    '<div class="cx-arun">' + (s.run ? '<div class="cx-card2"' + K('runCard') + '><b>' + E(s.run.n) + '</b><div>' + st(s.run.st || 'todo', 'runSt') + '<span class="cx-gap"></span>' + (s.run.who ? av(s.run.who) : '') + '</div>' + (s.run.check ? '<div class="cx-chk on"><span class="cx-cb on"></span>' + E(s.run.check) + '</div>' : '') + '</div>' : '') +
    (s.log ? '<div class="cx-alog">' + s.log.map((l, i) => '<div' + K('lg' + i) + '>' + I('zap') + E(l) + '</div>').join('') + '</div>' : '') + '</div></div>' +
    (s.pick ? pop('pick', s.pick.map((x, i) => mi('pk' + i, x, 'zap', s.pickOn === i)).join(''), s.pickStyle || 'top:120px;inset-inline-start:250px;width:240px') : ''));

  /* ---------- Player ---------- */
  function mount(host, demo) {
    const reduce = prefersReducedMotion();
    const transient = { hl: null, click: false, type: null, pop: null, toast: null, menu: null, results: null, mention: false };
    let acc = {};
    const states = demo.steps.map(st0 => { acc = Object.assign({}, acc, transient, st0); return acc; });
    host.innerHTML = '<div class="cx-player"><div class="cx-frame" aria-hidden="true"><div class="cx-stage" style="width:' + W + 'px;height:' + H + 'px"><div class="cx-scene"></div><span class="cx-ring" hidden></span><span class="cx-ptr">' + '<svg viewBox="0 0 24 24"><path d="M5 3l14 8-6 2-3 6z"/></svg><i></i></span></div></div>' +
      '<div class="cx-cap" aria-live="polite"><span class="cx-cap-n num"></span><p></p></div>' +
      '<div class="cx-ctrl"><button type="button" class="cx-cb2" data-cx="prev" aria-label="' + tx('الخطوة السابقة', 'Previous step') + '">' + icon('step-prev') + '</button><button type="button" class="cx-cb2 play" data-cx="play"></button><button type="button" class="cx-cb2" data-cx="next" aria-label="' + tx('الخطوة التالية', 'Next step') + '">' + icon('step-next') + '</button>' +
      '<div class="cx-dots2">' + states.map((_, i) => '<button type="button" data-cx-go="' + i + '" aria-label="' + tx('الخطوة ', 'Step ') + (i + 1) + '"></button>').join('') + '</div><button type="button" class="cx-cb2" data-cx="replay" aria-label="' + tx('أعد من البداية', 'Replay') + '">' + icon('replay') + '</button><button type="button" class="cx-cb2" data-cx="full" aria-pressed="false" aria-label="' + tx('تكبير العرض', 'Enlarge the demo') + '">' + icon('panel') + '</button></div></div>';
    const frame = $('.cx-frame', host), stage = $('.cx-stage', host), scene = $('.cx-scene', host), ptr = $('.cx-ptr', host), ring = $('.cx-ring', host);
    let i = -1, playing = false, timers = [], scale = 1, ptrPos = { x: W * 0.6, y: H * 0.7 };
    const clear = () => { timers.forEach(t => clearTimeout(t)); timers = []; };
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    const fit = () => { scale = Math.min(1.35, frame.clientWidth / W) || 1; stage.style.transform = 'scale(' + scale + ')'; frame.style.height = Math.round(H * scale) + 'px'; };
    const rectOf = el => { const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect(); return { x: (r.left - s.left) / scale, y: (r.top - s.top) / scale, w: r.width / scale, h: r.height / scale }; };
    const placePtr = (p, instant) => { ptr.style.transition = instant || reduce ? 'none' : ''; ptr.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)'; ptrPos = p; };
    function render(n, animate) {
      const old = {};
      if (animate && !reduce) $$('[data-k]', scene).forEach(el => { old[el.dataset.k] = rectOf(el); });
      scene.innerHTML = SC[demo.scene](states[n]);
      if (animate && !reduce) $$('[data-k]', scene).forEach(el => {
        const o = old[el.dataset.k]; if (!el.animate) return;
        if (!o) { el.animate([{ opacity: 0, transform: 'translateY(6px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.23,1,.32,1)' }); return; }
        const r = rectOf(el), dx = o.x - r.x, dy = o.y - r.y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.65,0,.35,1)' });
      });
    }
    function go(n, opts) {
      opts = opts || {}; clear(); n = Math.max(0, Math.min(states.length - 1, n));
      const animate = n === i + 1 && !opts.jump; i = n; const s = states[i];
      render(i, animate);
      $('.cx-cap-n', host).textContent = (i + 1) + '/' + states.length;
      const cap = $('.cx-cap p', host); cap.textContent = L(demo.steps[i].c || ''); if (!reduce && cap.animate) cap.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
      $$('[data-cx-go]', host).forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('done', k < i); b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
      ring.hidden = true;
      const target = s.hl ? $('[data-k="' + s.hl + '"]', scene) : null;
      let wait = 0;
      if (target) {
        const r = rectOf(target); const p = { x: r.x + Math.min(r.w * 0.5, 60), y: r.y + r.h * 0.55 };
        placePtr(p, opts.jump); wait = reduce || opts.jump ? 0 : 720;
        later(() => { ring.hidden = false; ring.style.cssText = 'left:' + (r.x - 4) + 'px;top:' + (r.y - 4) + 'px;width:' + (r.w + 8) + 'px;height:' + (r.h + 8) + 'px'; if (s.click && !reduce) { ptr.classList.remove('clk'); void ptr.offsetWidth; ptr.classList.add('clk'); Sound.play('tap'); } }, wait);
      }
      let typeMs = 0;
      if (s.type) {
        const el = $('[data-k="' + s.type.k + '"]', scene); const full = L(s.type.x);
        if (el) {
          if (reduce || opts.jump) el.textContent = full;
          else { el.textContent = ''; el.classList.add('typing'); const per = 38; typeMs = full.length * per; for (let c = 1; c <= full.length; c++) later(() => { el.textContent = full.slice(0, c); }, wait + 100 + c * per); later(() => el.classList.remove('typing'), wait + 140 + typeMs); }
        }
      }
      if (playing) later(() => { if (i < states.length - 1) go(i + 1); else { setPlaying(false); host.dispatchEvent(new CustomEvent('cx-end', { bubbles: true })); } }, Math.max(3400, wait + typeMs + 2600));
    }
    function setPlaying(on) {
      playing = on; const b = $('[data-cx="play"]', host);
      b.innerHTML = icon(on ? 'pause' : 'play') + '<span>' + (on ? tx('إيقاف مؤقت', 'Pause') : i >= states.length - 1 ? tx('أعد التشغيل', 'Play again') : tx('شاهد', 'Watch')) + '</span>';
      b.setAttribute('aria-pressed', String(on));
    }
    host.addEventListener('click', e => {
      const b = e.target.closest('[data-cx]'), d = e.target.closest('[data-cx-go]');
      if (d) { setPlaying(false); go(+d.dataset.cxGo, { jump: true }); return; }
      if (!b) return; const a = b.dataset.cx;
      if (a === 'play') { if (playing) { setPlaying(false); clear(); } else { setPlaying(true); if (i >= states.length - 1) go(0, { jump: true }); else go(i + 1); } }
      if (a === 'next') { setPlaying(false); go(i + 1); }
      if (a === 'prev') { setPlaying(false); go(i - 1, { jump: true }); }
      if (a === 'replay') { setPlaying(true); go(0, { jump: true }); }
      if (a === 'full') setFull(!$('.cx-player', host).classList.contains('full'));
      Sound.play('tap');
    });
    // Enlarge: full screen, turned sideways on portrait phones so the stage fills the screen
    const onKey = e => { if (e.key === 'Escape') setFull(false); };
    function setFull(on) {
      const pl = $('.cx-player', host); pl.classList.toggle('full', on); document.documentElement.classList.toggle('cx-lock', on);
      const b = $('[data-cx="full"]', host); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? tx('إغلاق التكبير', 'Close full screen') : tx('تكبير العرض', 'Enlarge the demo')); b.innerHTML = icon(on ? 'x' : 'panel');
      if (on) document.addEventListener('keydown', onKey); else document.removeEventListener('keydown', onKey);
      requestAnimationFrame(() => { fit(); go(i, { jump: true }); });
    }
    const ro = 'ResizeObserver' in window ? new ResizeObserver(fit) : null; if (ro) ro.observe(frame);
    fit(); placePtr(ptrPos, true); go(0, { jump: true }); setPlaying(false);
    let io = null;
    if (!reduce && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(es => { if (es[0].isIntersecting && i === 0 && !playing) { setPlaying(true); later(() => go(1), 900); io.disconnect(); } }, { threshold: 0.6 });
      io.observe(frame);
    }
    return () => { clear(); if (ro) ro.disconnect(); if (io) io.disconnect(); document.removeEventListener('keydown', onKey); document.documentElement.classList.remove('cx-lock'); };
  }
  /* For tests: the cumulative state of every step, the way the player builds it. */
  const states = demo => { const tr = { hl: null, click: false, type: null, pop: null, toast: null, menu: null, results: null, mention: false }; let acc = {}; return demo.steps.map(x => (acc = Object.assign({}, acc, tr, x))); };
  return { mount, SC, L, who, states };
})();
