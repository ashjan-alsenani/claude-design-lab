/* ==========================================================================
   Dashboard Learning Studio. Every chart is computed from Lab.tasks(), with
   a stated calculation, tooltips, a data-table alternative and a question
   whose correct answer is computed from the same data.
   Geometry is laid out in reading order: time axes and category order run
   right-to-left in Arabic and left-to-right in English. The numbers are
   identical in both languages because both read the same shared data.
   ========================================================================== */

const Studio = (() => {
  let root = null, unsub = null;
  const F = { list: 'all', assignee: '' };
  const answered = {}; // card id -> index of the chosen option (language independent)

  const W = 560, H = 250, PAD = { t: 22, r: 16, b: 34, l: 16 };
  /* Every x below is computed in "reading space" (0 = where reading starts).
     X() maps it to the SVG: mirrored for right-to-left. */
  const rtl = () => isRTL();
  const X = x => rtl() ? W - x : x;
  const anchor = a => a === 'middle' ? a : (rtl() ? a : (a === 'start' ? 'end' : 'start'));
  const DIR = () => rtl() ? 'rtl' : 'ltr';
  // A horizontal span [x1, x2] in reading space, returned as SVG left + width
  const span = (x1, x2) => { const a = X(x1), b = X(x2); return { x: Math.min(a, b), w: Math.abs(b - a) }; };

  function scope() {
    return Lab.tasks().filter(x => (F.list === 'all' || x.list === F.list) && (!F.assignee || x.assignee === F.assignee));
  }

  /* ---------- Chart builders ---------- */
  function hit(i, x, y, w, h, tip) { return '<rect class="hit" tabindex="0" data-i="' + i + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" aria-label="' + esc(tip.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) + '"/>'; }
  function hGrid(nice, ih) {
    return ticks(nice).map(v => { const y = PAD.t + ih - v / nice * ih; return '<line class="grid" x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + y + '" y2="' + y + '"/><text x="' + X(PAD.r) + '" y="' + (y - 4) + '" text-anchor="' + anchor('end') + '">' + v + '</text>'; }).join('');
  }
  function barsVertical(data, opts) {
    const n = data.length; const iw = W - PAD.l - PAD.r; const ih = H - PAD.t - PAD.b;
    const max = Math.max(1, ...data.map(d => d.value)); const nice = niceMax(max);
    const band = iw / n; const bw = Math.min(40, band * 0.5);
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.aria) + '">' + hGrid(nice, ih);
    data.forEach((d, i) => {
      const cx = X(PAD.r + band * (i + 0.5)); const h = d.value / nice * ih; const y = PAD.t + ih - h; const x = cx - bw / 2;
      s += '<path class="mark" data-i="' + i + '" d="' + roundTop(x, y, bw, h, 4) + '" fill="' + d.color + '"/>';
      s += '<text class="val" x="' + cx + '" y="' + (y - 6) + '" text-anchor="middle">' + d.value + '</text>';
      s += '<text x="' + cx + '" y="' + (H - 12) + '" text-anchor="middle" direction="' + (d.ltr ? 'ltr' : DIR()) + '">' + esc(d.label) + '</text>';
      s += hit(i, cx - band / 2, PAD.t, band, ih, d.tip);
    });
    return s + '<line class="axis" x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + (PAD.t + ih) + '" y2="' + (PAD.t + ih) + '"/></svg>';
  }
  function barsHorizontal(data, opts) {
    const rowH = 34, lw = 118; const h = PAD.t + data.length * rowH + 16;
    const max = Math.max(1, opts.ref || 0, ...data.map(d => d.value)); const nice = niceMax(max);
    const x0 = PAD.r + lw, iw = (W - PAD.l - (opts.ref ? 104 : 34)) - x0; // reading space
    let s = '<svg viewBox="0 0 ' + W + ' ' + h + '" role="img" aria-label="' + esc(opts.aria) + '">';
    ticks(nice).forEach(v => { const x = X(x0 + v / nice * iw); s += '<line class="grid" x1="' + x + '" x2="' + x + '" y1="' + (PAD.t - 6) + '" y2="' + (h - 16) + '"/><text x="' + x + '" y="' + (PAD.t - 10) + '" text-anchor="middle">' + v + '</text>'; });
    data.forEach((d, i) => {
      const y = PAD.t + i * rowH + 6; const bh = 20; const w = d.value / nice * iw;
      s += '<text x="' + X(PAD.r) + '" y="' + (y + 14) + '" text-anchor="start" direction="' + DIR() + '">' + esc(d.label) + '</text>';
      const sp = span(x0, x0 + w);
      s += '<path class="mark" data-i="' + i + '" d="' + roundEnd(sp.x, y, sp.w, bh, 4) + '" fill="' + d.color + '"/>';
      s += '<text class="val" x="' + X(x0 + w + 6) + '" y="' + (y + 14) + '" text-anchor="' + anchor('end') + '">' + (opts.fmt ? opts.fmt(d.value) : d.value) + (d.flag ? tx(' فوق السعة', ' over capacity') : '') + '</text>';
      s += hit(i, PAD.l, y - 5, W - PAD.l - PAD.r, rowH, d.tip);
    });
    if (opts.ref) { const x = X(x0 + opts.ref / nice * iw); s += '<line x1="' + x + '" x2="' + x + '" y1="' + (PAD.t - 4) + '" y2="' + (h - 14) + '" stroke="#1c1a27" stroke-width="2"/><text x="' + x + '" y="' + (h - 2) + '" text-anchor="middle" class="val">' + tx('السعة ', 'Capacity ') + opts.ref + 'h</text>'; }
    return s + '<line class="axis" x1="' + X(x0) + '" x2="' + X(x0) + '" y1="' + (PAD.t - 6) + '" y2="' + (h - 16) + '"/></svg>';
  }
  function line(data, opts) {
    const n = data.length; const iw = W - PAD.l - PAD.r - 24; const ih = H - PAD.t - PAD.b;
    const max = Math.max(1, ...data.map(d => d.value)); const nice = niceMax(max);
    const PX = i => X(PAD.r + 12 + (n === 1 ? iw / 2 : i / (n - 1) * iw)); const Y = v => PAD.t + ih - v / nice * ih;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.aria) + '">' + hGrid(nice, ih);
    s += '<path d="M' + data.map((d, i) => PX(i) + ' ' + Y(d.value)).join(' L') + ' L' + PX(n - 1) + ' ' + Y(0) + ' L' + PX(0) + ' ' + Y(0) + 'Z" fill="' + opts.color + '" opacity=".1"/>';
    s += '<polyline points="' + data.map((d, i) => PX(i) + ',' + Y(d.value)).join(' ') + '" fill="none" stroke="' + opts.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    const bandW = n === 1 ? iw : iw / (n - 1);
    data.forEach((d, i) => {
      s += '<circle class="mark" data-i="' + i + '" cx="' + PX(i) + '" cy="' + Y(d.value) + '" r="' + (i === n - 1 ? 5 : 4) + '" fill="' + opts.color + '" stroke="#fff" stroke-width="2"/>';
      s += '<text x="' + PX(i) + '" y="' + (H - 12) + '" text-anchor="middle" direction="' + DIR() + '">' + esc(d.label) + '</text>';
      s += hit(i, PX(i) - bandW / 2, PAD.t, bandW, ih, d.tip);
    });
    s += '<text class="val" x="' + (PX(n - 1) + (rtl() ? -8 : 8)) + '" y="' + (Y(data[n - 1].value) + 4) + '" text-anchor="' + anchor('end') + '">' + data[n - 1].value + '</text>';
    return s + '<line class="axis" x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + (PAD.t + ih) + '" y2="' + (PAD.t + ih) + '"/></svg>';
  }
  function gantt(tasks, opts) {
    if (!tasks.length) return '<p class="muted">' + tx('لا توجد مهام بتواريخ في هذا النطاق.', 'There are no dated tasks in this scope.') + '</p>';
    const all = tasks.flatMap(x => [x.start || x.due, x.due || x.start]);
    const min = all.reduce((a, b) => a < b ? a : b), maxD = all.reduce((a, b) => a > b ? a : b);
    const dayspan = Math.max(1, daysBetween(min, maxD) + 1);
    const rowH = 30, lw = 170; const h = PAD.t + tasks.length * rowH + 20; const x0 = PAD.r + lw, iw = W - PAD.l - x0;
    const T0 = iso => x0 + daysBetween(min, iso) / dayspan * iw; // reading space
    const colOf = k => ({ todo: 'var(--st-todo)', progress: 'var(--st-progress)', review: 'var(--st-review)', done: 'var(--st-done)' })[k];
    let s = '<svg viewBox="0 0 ' + W + ' ' + h + '" role="img" aria-label="' + esc(opts.aria) + '"><defs><marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="#454257"/></marker></defs>';
    const T = todayISO();
    for (let i = 0; i <= dayspan; i += 7) { const iso = addDays(min, i); const x = X(T0(iso)); s += '<line class="grid" x1="' + x + '" x2="' + x + '" y1="' + (PAD.t - 6) + '" y2="' + (h - 14) + '"/><text x="' + x + '" y="' + (PAD.t - 10) + '" text-anchor="middle">' + fmtDate(iso) + '</text>'; }
    const pos = {};
    tasks.forEach((x, i) => {
      const y = PAD.t + i * rowH + 4; const a = T0(x.start || x.due), b = Math.max(a + 6, T0(addDays(x.due || x.start, 1)));
      pos[x.id] = { start: a, end: b, y: y + 10 };
      s += '<text x="' + X(PAD.r) + '" y="' + (y + 14) + '" text-anchor="start" direction="' + DIR() + '">' + esc(x.title.length > 26 ? x.title.slice(0, 25) + '…' : x.title) + '</text>';
      const sp = span(a, b);
      s += '<rect class="mark" data-i="' + i + '" x="' + sp.x + '" y="' + y + '" width="' + sp.w + '" height="18" rx="4" fill="' + colOf(x.status) + '"' + (isOverdue(x) ? ' stroke="#c0322f" stroke-width="2"' : '') + '/>';
      s += hit(i, PAD.l, y - 5, W - PAD.l - PAD.r, rowH, opts.tips[i]);
    });
    tasks.forEach(x => x.deps.forEach(dId => {
      const p = pos[dId], q = pos[x.id]; if (!p || !q) return;
      const sx = p.end, ex = q.start - 2;
      s += '<path d="M' + X(sx) + ' ' + p.y + ' H' + X(sx + 6) + ' V' + q.y + ' H' + X(ex) + '" fill="none" stroke="#454257" stroke-width="1.3" marker-end="url(#arr)"/>';
    }));
    if (T >= min && T <= addDays(maxD, 1)) { const x = X(T0(T)); s += '<line x1="' + x + '" x2="' + x + '" y1="' + (PAD.t - 4) + '" y2="' + (h - 12) + '" stroke="#c0322f" stroke-width="2"/><text x="' + x + '" y="' + (h - 1) + '" text-anchor="middle" class="val" style="fill:#c0322f">' + tx('اليوم', 'Today') + '</text>'; }
    return s + '</svg>';
  }

  function niceMax(v) { if (v <= 5) return Math.max(2, Math.ceil(v)); const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; return (m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
  function ticks(max) { const step = max <= 5 ? 1 : max <= 10 ? 2 : max / 5; const out = []; for (let v = 0; v <= max + 1e-9; v += step) out.push(Math.round(v * 10) / 10); return out; }
  function roundTop(x, y, w, h, r) { if (h <= 0) return 'M' + x + ' ' + (y) + 'h' + w; r = Math.min(r, h, w / 2); return 'M' + x + ' ' + (y + h) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h) + 'Z'; }
  /* Horizontal bar rounded at the end it grows toward (left in RTL, right in LTR) */
  function roundEnd(x, y, w, h, r) {
    if (w <= 0) return 'M' + x + ' ' + y + 'v' + h;
    r = Math.min(r, w, h / 2);
    if (rtl()) return 'M' + (x + w) + ' ' + y + 'H' + (x + r) + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y + r) + 'V' + (y + h - r) + 'Q' + x + ' ' + (y + h) + ' ' + (x + r) + ' ' + (y + h) + 'H' + (x + w) + 'Z';
    return 'M' + x + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h - r) + 'Q' + (x + w) + ' ' + (y + h) + ' ' + (x + w - r) + ' ' + (y + h) + 'H' + x + 'Z';
  }

  /* ---------- Metrics ---------- */
  function weeks() {
    const T = todayISO(); const out = [];
    for (let k = 5; k >= 0; k--) {
      const end = addDays(T, -7 * k); const start = addDays(end, -6);
      const label = k === 0 ? tx('هذا الأسبوع', 'This week') : tx('قبل ' + (k === 1 ? 'أسبوع' : k === 2 ? 'أسبوعين' : k + ' أسابيع'), k === 1 ? '1 week ago' : k + ' weeks ago');
      out.push({ start, end, label });
    }
    return out;
  }
  const tasksN = n => tx(n + ' مهمة', nEn(n, 'task'));
  const and = () => tx(' و', ' and ');
  const CARDS = [
    {
      id: 'status', title: () => tx('المهام حسب الحالة', 'Tasks by status'), en: 'Tasks by status',
      sub: () => tx('كم مهمة في كل مرحلة من سير العمل.', 'How many tasks are at each stage of the workflow.'),
      calc: () => tx('العدّ: كل مهمة في النطاق الحالي (القائمة والمسؤول المختاران) تُحسب مرة واحدة في عمود حالتها.', 'Count: every task in the current scope (the selected List and assignee) is counted once, in the column for its status.'),
      explain: () => tx('عمود TO DO الطويل يعني عملاً لم يبدأ، وREVIEW الطويل يعني عنق زجاجة في المراجعة. قارن الأعمدة ببعضها لا بقيمة مثالية.', 'A tall TO DO bar means work that has not started; a tall REVIEW bar means a review bottleneck. Compare the bars with each other, not with an ideal value.'),
      build(tasks) {
        const data = STATUSES.map(s => { const v = tasks.filter(x => x.status === s.key).length; return { label: s.en, value: v, ltr: true, color: 'var(--st-' + s.key + ')', tip: '<b>' + s.en + '</b><br>' + tasksN(v) }; });
        return { svg: barsVertical(data, { aria: tx('رسم أعمدة لعدد المهام حسب الحالة', 'Bar chart of the number of tasks by status') }), data, table: [[tx('الحالة', 'Status'), tx('عدد المهام', 'Tasks')], ...data.map(d => [d.label, d.value])],
          q: { text: tx('أي حالة تضم أكبر عدد من المهام في النطاق الحالي؟', 'Which status has the most tasks in the current scope?'), options: data.map(d => d.label), correct: maxLabels(data), why: () => tx('الأعلى: ', 'Highest: ') + maxLabels(data).join(and()) + ' (' + tasksN(Math.max(...data.map(x => x.value))) + ').' } };
      }
    },
    {
      id: 'assignee', title: () => tx('المهام المفتوحة حسب المسؤول', 'Open tasks by assignee'), en: 'Open tasks by assignee',
      sub: () => tx('توزيع العمل غير المغلق على الفريق.', 'How work that is not closed is spread across the team.'),
      calc: () => tx('العدّ: المهام التي حالتها ليست COMPLETE، مجمّعة حسب المسؤول. المهام بلا مسؤول تظهر في صف مستقل.', 'Count: tasks whose status is not COMPLETE, grouped by assignee. Tasks with no assignee appear in a separate row.'),
      explain: () => tx('فرق كبير بين شخص وآخر يستدعي سؤالاً عن التوزيع قبل الحكم على الأداء. افتح المهام خلف الرقم في المختبر.', 'A big gap between two people calls for a question about distribution before any judgement about performance. Open the tasks behind the number in the lab.'),
      build(tasks) {
        const open = tasks.filter(x => x.status !== 'done');
        const rows = PEOPLE.map(p => ({ label: p.short, value: open.filter(x => x.assignee === p.id).length, id: p.id }));
        const none = open.filter(x => !x.assignee).length; if (none) rows.push({ label: tx('بدون مسؤول', 'No assignee'), value: none, id: 'none' });
        const data = rows.map(r => ({ label: r.label, value: r.value, color: 'var(--c1)', tip: '<b>' + esc(r.label) + '</b><br>' + tx(r.value + ' مهمة مفتوحة', nEn(r.value, 'open task')) }));
        return { svg: barsHorizontal(data, { aria: tx('رسم أعمدة أفقية للمهام المفتوحة لكل مسؤول', 'Horizontal bar chart of open tasks per assignee') }), data, table: [[tx('المسؤول', 'Assignee'), tx('مهام مفتوحة', 'Open tasks')], ...data.map(d => [d.label, d.value])],
          q: { text: tx('من لديه أكبر عدد من المهام المفتوحة؟', 'Who has the most open tasks?'), options: data.map(d => d.label), correct: maxLabels(data), why: () => tx('الأعلى: ', 'Highest: ') + maxLabels(data).join(and()) + '.' } };
      }
    },
    {
      id: 'trend', title: () => tx('الإنجاز الأسبوعي', 'Completed per week'), en: 'Completed per week', wide: true,
      sub: () => tx('عدد المهام التي انتقلت إلى COMPLETE في كل أسبوع من الأسابيع الستة الأخيرة. الزمن يسير من اليمين إلى اليسار.', 'The number of tasks that moved to COMPLETE in each of the last six weeks. Time runs from left to right.'),
      calc: () => tx('العدّ: المهام التي يقع تاريخ إكمالها داخل الأسبوع (7 أيام تنتهي في اليوم المعروض). أكمل مهمة في المختبر وسترى نقطة «هذا الأسبوع» ترتفع.', 'Count: tasks whose completion date falls inside the week (7 days ending on the day shown). Complete a task in the lab and the “This week” point goes up.'),
      explain: () => tx('اقرأ الاتجاه عبر عدة نقاط، لا أسبوعاً واحداً. ارتفاع مفاجئ قد يكون إغلاقاً متراكماً لمهام قديمة.', 'Read the trend across several points, not one week. A sudden jump may be a backlog of old tasks being closed at once.'),
      build(tasks) {
        const W6 = weeks();
        const data = W6.map(w => { const v = tasks.filter(x => x.completedAt && isoDate(new Date(x.completedAt)) >= w.start && isoDate(new Date(x.completedAt)) <= w.end).length; return { label: w.label, value: v, tip: '<b>' + w.label + '</b><br>' + fmtDate(w.start) + ' - ' + fmtDate(w.end) + '<br>' + tx(v + ' مهام مكتملة', nEn(v, 'task') + ' completed') }; });
        return { svg: line(data, { aria: tx('رسم خطي للمهام المكتملة أسبوعياً', 'Line chart of tasks completed per week'), color: 'var(--c1)' }), data, table: [[tx('الأسبوع', 'Week'), tx('الفترة', 'Period'), tx('مهام مكتملة', 'Tasks completed')], ...data.map((d, i) => [d.label, fmtDate(W6[i].start) + ' - ' + fmtDate(W6[i].end), d.value])],
          q: { text: tx('في أي أسبوع كان عدد المهام المكتملة هو الأعلى؟', 'In which week were the most tasks completed?'), options: data.map(d => d.label), correct: maxLabels(data), why: () => tx('الأعلى: ', 'Highest: ') + maxLabels(data).join(and()) + ' (' + Math.max(...data.map(x => x.value)) + ').' } };
      }
    },
    {
      id: 'overdue', title: () => tx('المهام المتأخرة', 'Overdue tasks'), en: 'Overdue tasks',
      sub: () => tx('المهام غير المغلقة التي تجاوزت تاريخ استحقاقها، حسب المسؤول.', 'Tasks that are not closed and are past their due date, by assignee.'),
      calc: () => tx('متأخرة = الحالة ليست COMPLETE وتاريخ الاستحقاق قبل اليوم. النسبة = المتأخرة ÷ كل المهام المفتوحة في النطاق.', 'Overdue = status is not COMPLETE and the due date is before today. Rate = overdue ÷ all open tasks in the scope.'),
      explain: () => tx('العدد وحده مضلل عند مقارنة فرق مختلفة الحجم. انظر إلى النسبة، ثم افتح المهام نفسها لمعرفة السبب.', 'The count alone is misleading when you compare teams of different sizes. Look at the rate, then open the tasks themselves to find the reason.'),
      build(tasks) {
        const open = tasks.filter(x => x.status !== 'done'); const od = open.filter(isOverdue);
        const data = PEOPLE.map(p => ({ label: p.short, value: od.filter(x => x.assignee === p.id).length })).filter(d => d.value > 0).map(d => ({ label: d.label, value: d.value, color: 'var(--err)', tip: '<b>' + esc(d.label) + '</b><br>' + d.value + tx(' متأخرة', ' overdue') }));
        const pct = open.length ? Math.round(od.length / open.length * 100) : 0;
        const head = '<p class="small" style="margin-bottom:6px"><b class="num" style="font-size:1.6rem;color:var(--err)">' + od.length + '</b>' + tx(' متأخرة من ', ' overdue out of ') + '<b class="num">' + open.length + '</b>' + tx(' مفتوحة، أي ', ' open, which is ') + '<b class="num">' + pct + '%</b></p>';
        const list = od.length ? '<ul class="activity" style="color:var(--ink-2);margin-top:6px">' + od.slice(0, 5).map(x => '<li>' + icon('alert', 'icon-sm') + ' ' + t(x.title) + ' <span class="muted">(' + fmtDate(x.due) + ')</span></li>').join('') + '</ul>' : '';
        const opts = uniq([pct + '%', (open.length ? Math.round(od.length / tasks.length * 100) : 0) + '%', od.length + '%', Math.min(100, pct + 20) + '%']);
        return { svg: head + (data.length ? barsHorizontal(data, { aria: tx('رسم أعمدة للمهام المتأخرة لكل مسؤول', 'Bar chart of overdue tasks per assignee') }) : '<p class="muted">' + tx('لا توجد مهام متأخرة في هذا النطاق.', 'There are no overdue tasks in this scope.') + '</p>') + list, data,
          table: [[tx('المهمة', 'Task'), tx('المسؤول', 'Assignee'), tx('تاريخ الاستحقاق', 'Due date'), tx('الحالة', 'Status')], ...od.map(x => [x.title, x.assignee ? PERSON[x.assignee].short : '-', fmtDate(x.due), STATUS[x.status].en])],
          q: { text: tx('ما نسبة المهام المتأخرة من المهام المفتوحة في النطاق الحالي؟', 'What share of the open tasks in the current scope is overdue?'), options: opts, correct: [pct + '%'], why: () => od.length + ' ÷ ' + open.length + ' = ' + pct + tx('%. القسمة على المفتوحة فقط، لأن المكتملة لا يمكن أن تتأخر.', '%. Divide by open tasks only, because completed tasks cannot be overdue.') } };
      }
    },
    {
      id: 'workload', title: () => tx('عبء العمل مقابل السعة', 'Workload vs capacity'), en: 'Workload vs capacity',
      sub: () => tx('ساعات التقدير للمهام المفتوحة المستحقة خلال 7 أيام (والمتأخرة)، مقابل سعة ' + CAPACITY_H + ' ساعات أسبوعياً لكل شخص.', 'Estimated hours for open tasks due within 7 days (and overdue ones), against a capacity of ' + CAPACITY_H + ' hours a week per person.'),
      calc: () => tx('المجموع = تقدير الوقت (Time estimate) لكل مهمة مفتوحة تاريخ استحقاقها قبل نهاية الأيام السبعة القادمة. الخط الأسود = السعة. عبارة «فوق السعة» بجانب الشريط تعني تجاوزها.', 'Total = the Time estimate of every open task due before the end of the next seven days. The black line = capacity. “Over capacity” beside a bar means it is exceeded.'),
      explain: () => tx('تجاوز السعة إشارة لإعادة التوزيع أو تعديل المواعيد، لا دليلاً على ضعف. التقديرات الناقصة تجعل العبء يبدو أقل من الحقيقة.', 'Going over capacity is a signal to redistribute work or adjust dates, not evidence of weakness. Missing estimates make the load look lighter than it is.'),
      build(tasks) {
        const lim = addDays(todayISO(), 7);
        const rows = PEOPLE.map(p => { const v = tasks.filter(x => x.status !== 'done' && x.assignee === p.id && x.due && x.due <= lim).reduce((a, x) => a + (+x.estimate || 0), 0); return { label: p.short, value: Math.round(v * 10) / 10 }; });
        const data = rows.map(r => ({ label: r.label, value: r.value, flag: r.value > CAPACITY_H, color: 'var(--c1)', tip: '<b>' + esc(r.label) + '</b><br>' + tx(r.value + ' ساعة من ' + CAPACITY_H, r.value + ' of ' + CAPACITY_H + ' hours') + (r.value > CAPACITY_H ? '<br>' + tx('فوق السعة', 'Over capacity') : '') }));
        const over = data.filter(d => d.flag).map(d => d.label);
        const nobody = tx('لا أحد', 'Nobody');
        return { svg: barsHorizontal(data, { aria: tx('رسم أعمدة أفقية لساعات العمل مقابل السعة', 'Horizontal bar chart of work hours against capacity'), ref: CAPACITY_H, fmt: v => v + 'h' }), data, table: [[tx('الشخص', 'Person'), tx('ساعات مقدّرة', 'Estimated hours'), tx('السعة', 'Capacity'), tx('الحالة', 'Status')], ...data.map(d => [d.label, d.value, CAPACITY_H, d.flag ? tx('فوق السعة', 'Over capacity') : tx('ضمن السعة', 'Within capacity')])],
          q: { text: tx('من تجاوز سعته الأسبوعية؟', 'Who is over their weekly capacity?'), options: data.map(d => d.label).concat([nobody]), correct: over.length ? over : [nobody], why: () => over.length ? tx('فوق السعة: ', 'Over capacity: ') + over.join(and()) + '.' : tx('لا أحد فوق ' + CAPACITY_H + ' ساعات.', 'Nobody is above ' + CAPACITY_H + ' hours.') } };
      }
    },
    {
      id: 'deps', title: () => tx('خط زمني بالاعتماديات', 'Dependency timeline'), en: 'Dependency timeline', wide: true, fixedList: 'service',
      sub: () => tx('مهام «مبادرة تحسين الخدمة» بتواريخها. السهم يعني أن المهمة تنتظر (Waiting on) التي قبلها. الزمن يسير من اليمين إلى اليسار.', 'Tasks in the “Service improvement initiative” with their dates. An arrow means a task is Waiting on the one before it. Time runs from left to right.'),
      calc: () => tx('طول الشريط من تاريخ البدء إلى تاريخ الاستحقاق. الإطار الأحمر = متأخرة. الخط الأحمر = اليوم.', 'Each bar runs from the start date to the due date. Red outline = overdue. Red line = today.'),
      explain: () => tx('التأخير في مهمة يمتد إلى كل ما ينتظرها. جرّب زر التأخير لترى كيف تتحرك التواريخ في المختبر والرسم معاً.', 'A delay in one task spreads to everything waiting on it. Try the delay button to see the dates move in the lab and in the chart together.'),
      build() {
        const tasks = Lab.tasks().filter(x => x.list === 'service' && (x.start || x.due)).sort((a, b) => (a.start || a.due).localeCompare(b.start || b.due));
        const sep = tx('، ', ', ');
        const tips = tasks.map(x => '<b>' + esc(x.title) + '</b><br>' + (x.start ? fmtDate(x.start) : '-') + (rtl() ? ' ← ' : ' → ') + (x.due ? fmtDate(x.due) : '-') + '<br>' + STATUS[x.status].en + (x.deps.length ? '<br>' + tx('تنتظر: ', 'Waiting on: ') + esc(x.deps.map(d => Lab.task(d).title).join(sep)) : ''));
        const focus = tasks.find(x => x.id === 's3') || tasks.find(x => x.status !== 'done');
        const affected = focus ? downstream(focus.id) : [];
        const names = affected.map(id => Lab.task(id).title);
        const others = tasks.filter(x => x.id !== (focus && focus.id) && !affected.includes(x.id)).map(x => x.title);
        const nothing = tx('لا شيء', 'Nothing');
        const correct = names.length ? names.join(sep) : nothing;
        const opts = uniq([correct, names.slice(0, 1).join('') || nothing, others.slice(0, 2).join(sep) || nothing, tasks.map(x => x.title).filter(x => x !== (focus && focus.title)).join(sep)]).filter(Boolean);
        const legend = '<div class="legend">' + STATUSES.map(s => '<span><i style="background:var(--st-' + s.key + ')"></i><bdi dir="ltr">' + s.en + '</bdi></span>').join('') + '<span><i style="background:transparent;border:2px solid #c0322f"></i>' + tx('متأخرة', 'Overdue') + '</span></div>';
        return { svg: legend + gantt(tasks, { aria: tx('مخطط زمني لمهام مبادرة تحسين الخدمة مع الاعتماديات', 'Timeline of the service improvement initiative tasks with dependencies'), tips }) +
            (focus ? '<div class="ex-actions" style="margin-top:8px"><button type="button" class="btn btn-secondary btn-sm" data-delay="' + focus.id + '">' + icon('clock', 'icon-sm') + tx('أخّر «' + t(focus.title) + '» يوماً واحداً', 'Delay “' + t(focus.title) + '” by one day') + '</button><span class="help-text">' + tx('يعيد جدولة المهام المنتظرة كما يفعل إعداد إعادة جدولة الاعتماديات.', 'Reschedules the waiting tasks, as the dependency rescheduling setting does.') + '</span></div>' : ''),
          data: tasks, tips,
          table: [[tx('المهمة', 'Task'), tx('البدء', 'Start'), tx('الاستحقاق', 'Due'), tx('الحالة', 'Status'), tx('تنتظر', 'Waiting on')], ...tasks.map(x => [x.title, x.start ? fmtDate(x.start) : '-', x.due ? fmtDate(x.due) : '-', STATUS[x.status].en, x.deps.map(d => Lab.task(d).title).join(sep) || '-'])],
          q: focus ? { text: tx('إذا تأخرت «' + focus.title + '»، ما المهام التي تتأثر مواعيدها؟', 'If “' + focus.title + '” is delayed, which tasks have their dates affected?'), options: opts, correct: [correct], why: () => tx('تتأثر كل مهمة تنتظرها مباشرة أو عبر سلسلة: ', 'Every task that waits on it, directly or through a chain, is affected: ') + correct + '.' } : null };
      }
    }
  ];
  function downstream(id) { const out = []; const q = [id]; while (q.length) { const cur = q.shift(); Lab.tasks().forEach(x => { if (x.deps.includes(cur) && !out.includes(x.id)) { out.push(x.id); q.push(x.id); } }); } return out; }
  function maxLabels(data) { const m = Math.max(...data.map(d => d.value)); return data.filter(d => d.value === m).map(d => d.label); }
  function uniq(a) { return Array.from(new Set(a)); }

  function mount(el) {
    root = el;
    root.innerHTML = '<div class="page">' +
      '<div class="page-head"><div><div class="breadcrumbs"><a href="#/home">' + tx('الرئيسية', 'Home') + '</a><span aria-hidden="true">/</span><span>' + tx('استوديو لوحات المعلومات', 'Dashboard Studio') + '</span></div>' +
      '<h1>' + tx('استوديو لوحات المعلومات', 'Dashboard Learning Studio') + enSub('Dashboard Learning Studio') + '</h1>' +
      '<p>' + tx('تعلّم قراءة البطاقات قبل إعدادها. كل رسم هنا يُحسب من مهام مختبر التطبيق نفسها: غيّر مهمة هناك وارجع لترى أثرها. لكل رسم شرح وطريقة حساب وسؤال وجدول بيانات.', 'Learn to read cards before you build them. Every chart here is calculated from the Practice Lab tasks themselves: change a task there and come back to see the effect. Each chart has an explanation, a calculation method, a question and a data table.') + '</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip chip-sim">' + icon('eye', 'icon-sm') + tx('محاكاة تعليمية لبطاقات Dashboard', 'Educational simulation of Dashboard cards') + '</span><a class="btn btn-secondary btn-sm" href="#/lab">' + icon('flask', 'icon-sm') + tx('افتح المختبر', 'Open the lab') + '</a></div></div>' +
      '<div class="panel studio-filters" role="group" aria-label="' + tx('مرشّحات اللوحة', 'Dashboard filters') + '"><div class="field"><label for="stList">' + tx('مصدر البيانات', 'Data source (Location)') + enSub('Location', 'en') + '</label><select class="select" id="stList" data-sf="list"><option value="all">' + tx('كل القوائم', 'All Lists') + '</option>' + LAB_LISTS.map(l => '<option value="' + l.id + '">' + esc(l.name) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="stAs">' + tx('المسؤول', 'Assignee') + enSub('Assignee', 'en') + '</label><select class="select" id="stAs" data-sf="assignee"><option value="">' + tx('الكل', 'All') + '</option>' + PEOPLE.map(p => '<option value="' + p.id + '">' + esc(p.name) + '</option>').join('') + '</select></div>' +
      '<p class="help-text" style="flex:1;min-width:220px">' + t(tx('هذه مرشّحات على مستوى اللوحة (Dashboard filters): تُطبّق على كل البطاقات المدعومة. بطاقة الخط الزمني مصدرها ثابت: «مبادرة تحسين الخدمة».', 'These are Dashboard filters: they apply to every supported card. The timeline card has a fixed source: “Service improvement initiative”.')) + '</p></div>' +
      '<div class="chart-grid" data-charts></div></div>';
    $('#stList', root).value = F.list; $('#stAs', root).value = F.assignee;
    root.addEventListener('change', e => { const k = e.target.dataset.sf; if (k) { F[k] = e.target.value; paint(); announce(tx('تحدّثت البطاقات', 'Cards updated')); } });
    root.addEventListener('click', onClick);
    root.addEventListener('pointermove', onHover);
    root.addEventListener('pointerleave', hideTips, true);
    root.addEventListener('focusin', onFocus);
    root.addEventListener('focusout', e => { if (e.target.classList && e.target.classList.contains('hit')) hideTips(); });
    paint();
    unsub = Lab.on(() => paint());
  }
  function unmount() { if (unsub) unsub(); unsub = null; root = null; }

  let built = {};
  function paint() {
    if (!root) return;
    const tasks = scope();
    const openDetails = new Set($$('details[data-tbl][open]', root).map(d => d.dataset.tbl).concat(UIState.get('studio-tables') || []));
    built = {};
    $('[data-charts]', root).innerHTML = CARDS.map(c => {
      const r = c.build(tasks); built[c.id] = r;
      const q = r.q; const a = answered[c.id];
      const chosen = a && q ? q.options[a.idx] : null;
      return '<article class="panel chart-card' + (c.wide ? ' wide' : '') + '" aria-labelledby="ch-' + c.id + '"><header><div><h2 id="ch-' + c.id + '" style="font-size:1.05rem">' + t(c.title()) + enSub(c.en, 'muted chart-en') + '</h2><p>' + t(c.sub()) + '</p></div></header>' +
        '<div class="chart-box" data-chart="' + c.id + '">' + r.svg + '<div class="chart-tip" role="tooltip"></div></div>' +
        '<div class="chart-explain"><p>' + icon('bulb', 'icon-sm') + ' ' + t(c.explain()) + '</p><p class="calc-def"><b>' + tx('طريقة الحساب:', 'How it is calculated:') + '</b> ' + t(c.calc()) + '</p></div>' +
        '<details class="deeper" data-tbl="' + c.id + '"' + (openDetails.has(c.id) ? ' open' : '') + '><summary>' + icon('table', 'icon-sm') + tx('عرض البيانات كجدول', 'Show the data as a table') + '<span class="chev" style="margin-inline-start:auto">' + icon('fwd', 'icon-sm') + '</span></summary><div class="deeper-body"><div class="table-wrap"><table class="data-table"><caption class="visually-hidden">' + tx('بيانات ', 'Data: ') + esc(c.title()) + '</caption><thead><tr>' + r.table[0].map(h => '<th scope="col">' + t(h) + '</th>').join('') + '</tr></thead><tbody>' +
        (r.table.length > 1 ? r.table.slice(1).map(row => '<tr>' + row.map(v => '<td' + (typeof v === 'number' ? ' class="num"' : '') + '>' + t(v) + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + r.table[0].length + '" class="muted">' + tx('لا توجد بيانات في هذا النطاق', 'No data in this scope') + '</td></tr>') + '</tbody></table></div></div></details>' +
        (q ? '<div class="chart-q"><p class="q-title">' + icon('help', 'icon-sm') + ' ' + t(q.text) + '</p><div class="opts" role="group" aria-label="' + tx('خيارات الإجابة', 'Answer options') + '">' +
          q.options.map((o, i) => '<button type="button" class="btn btn-secondary btn-sm' + (a && a.idx === i ? (q.correct.includes(o) ? ' correct' : ' wrong') : '') + '" data-qa="' + c.id + '" data-i="' + i + '">' + t(o) + '</button>').join('') + '</div><div data-qfb>' +
          (chosen != null ? feedbackHTML(q.correct.includes(chosen) ? 'ok' : 'bad', (q.correct.includes(chosen) ? tx('صحيح. ', 'Correct. ') : tx('ليست هذه. ', 'Not this one. ')) + t(q.why())) : '') + '</div></div>' : '') +
        '</article>';
    }).join('');
    $$('details[data-tbl]', root).forEach(d => d.addEventListener('toggle', () => UIState.set('studio-tables', $$('details[data-tbl][open]', root).map(x => x.dataset.tbl))));
  }
  function onClick(e) {
    const b = e.target.closest('[data-qa]');
    if (b) { answered[b.dataset.qa] = { idx: +b.dataset.i }; paint(); const again = root.querySelector('[data-qa="' + b.dataset.qa + '"][data-i="' + b.dataset.i + '"]'); if (again) again.focus(); return; }
    const d = e.target.closest('[data-delay]');
    if (d) {
      const id = d.dataset.delay;
      const tk = Lab.task(id); const chain = downstream(id);
      Lab.update(id, { start: tk.start ? addDays(tk.start, 1) : '', due: tk.due ? addDays(tk.due, 1) : '' }, 'studio');
      chain.forEach(cid => { const c = Lab.task(cid); Lab.update(cid, { start: c.start ? addDays(c.start, 1) : '', due: c.due ? addDays(c.due, 1) : '' }, 'studio'); });
      delete answered.deps;
      toast(tx('تأخرت المهمة يوماً، وأُعيدت جدولة ' + chain.length + ' مهام تنتظرها', 'The task moved by one day, and ' + nEn(chain.length, 'waiting task') + ' were rescheduled'));
    }
  }
  function tipFor(box, i) {
    const id = box.dataset.chart; const r = built[id]; if (!r) return '';
    if (id === 'deps') return r.tips[i];
    return r.data[i] ? r.data[i].tip : '';
  }
  function showTip(box, i, x, y) {
    const tip = $('.chart-tip', box); const html = tipFor(box, i); if (!html) return;
    tip.innerHTML = html; tip.classList.add('show');
    const bw = box.clientWidth; tip.style.left = clamp(x, 70, bw - 70) + 'px'; tip.style.top = Math.max(y, 40) + 'px';
    box.classList.add('hovering'); $$('.mark', box).forEach(m => m.classList.toggle('is-hover', m.dataset.i === String(i)));
  }
  function hideTips() { if (!root) return; $$('.chart-tip.show', root).forEach(tp => tp.classList.remove('show')); $$('.chart-box.hovering', root).forEach(b => b.classList.remove('hovering')); }
  function onHover(e) {
    const h = e.target.closest && e.target.closest('.hit');
    if (!h) { hideTips(); return; }
    const box = h.closest('.chart-box'); const r = box.getBoundingClientRect();
    showTip(box, +h.dataset.i, e.clientX - r.left, e.clientY - r.top - 8);
  }
  function onFocus(e) {
    const h = e.target.closest && e.target.closest('.hit'); if (!h) return;
    const box = h.closest('.chart-box'); const br = box.getBoundingClientRect(); const hr = h.getBoundingClientRect();
    showTip(box, +h.dataset.i, hr.left - br.left + hr.width / 2, hr.top - br.top + 10);
  }
  return { mount, unmount };
})();
