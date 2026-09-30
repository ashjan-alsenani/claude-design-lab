/* ==========================================================================
   Dashboard Learning Studio. Every chart is computed from Lab.tasks(), with
   a stated calculation, tooltips, a data-table alternative and a question
   whose correct answer is computed from the same data.
   Time axes run right-to-left to follow Arabic reading order.
   ========================================================================== */

const Studio = (() => {
  let root = null, unsub = null;
  const F = { list: 'all', assignee: '' };
  const answered = {};

  const W = 560, H = 250, PAD = { t: 22, r: 16, b: 34, l: 16 };

  function scope() {
    return Lab.tasks().filter(x => (F.list === 'all' || x.list === F.list) && (!F.assignee || x.assignee === F.assignee));
  }

  /* ---------- Chart builders (return {svg, table, legend?}) ---------- */
  function barsVertical(data, opts) {
    // data: [{label, value, color, tip}]
    const n = data.length; const iw = W - PAD.l - PAD.r; const ih = H - PAD.t - PAD.b;
    const max = Math.max(1, ...data.map(d => d.value)); const nice = niceMax(max);
    const band = iw / n; const bw = Math.min(40, band * 0.5);
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.aria) + '">';
    ticks(nice).forEach(v => { const y = PAD.t + ih - v / nice * ih; s += '<line class="grid" x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (W - PAD.r) + '" y="' + (y - 4) + '" text-anchor="end">' + v + '</text>'; });
    data.forEach((d, i) => {
      const cx = W - PAD.r - band * (i + 0.5); const h = d.value / nice * ih; const y = PAD.t + ih - h; const x = cx - bw / 2;
      s += '<path class="mark" data-i="' + i + '" d="' + roundTop(x, y, bw, h, 4) + '" fill="' + d.color + '"/>';
      s += '<text class="val" x="' + cx + '" y="' + (y - 6) + '" text-anchor="middle">' + d.value + '</text>';
      s += '<text x="' + cx + '" y="' + (H - 12) + '" text-anchor="middle"' + (d.ltr ? ' direction="ltr"' : ' direction="rtl"') + '>' + esc(d.label) + '</text>';
      s += '<rect class="hit" tabindex="0" data-i="' + i + '" x="' + (cx - band / 2) + '" y="' + PAD.t + '" width="' + band + '" height="' + ih + '" aria-label="' + esc(d.tip.replace(/<[^>]+>/g, '')) + '"/>';
    });
    s += '<line class="axis" x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + (PAD.t + ih) + '" y2="' + (PAD.t + ih) + '"/></svg>';
    return s;
  }
  function barsHorizontal(data, opts) {
    const rowH = 34, lw = 118; const h = PAD.t + data.length * rowH + 16;
    const max = Math.max(1, opts.ref || 0, ...data.map(d => d.value)); const nice = niceMax(max);
    const x0 = W - PAD.r - lw, iw = x0 - PAD.l - (opts.ref ? 104 : 34);
    let s = '<svg viewBox="0 0 ' + W + ' ' + h + '" role="img" aria-label="' + esc(opts.aria) + '">';
    ticks(nice).forEach(v => { const x = x0 - v / nice * iw; s += '<line class="grid" x1="' + x + '" x2="' + x + '" y1="' + (PAD.t - 6) + '" y2="' + (h - 16) + '"/><text x="' + x + '" y="' + (PAD.t - 10) + '" text-anchor="middle">' + v + '</text>'; });
    data.forEach((d, i) => {
      const y = PAD.t + i * rowH + 6; const bh = 20; const w = d.value / nice * iw;
      s += '<text x="' + (W - PAD.r) + '" y="' + (y + 14) + '" text-anchor="start" direction="rtl">' + esc(d.label) + '</text>';
      s += '<path class="mark" data-i="' + i + '" d="' + roundLeft(x0 - w, y, w, bh, 4) + '" fill="' + d.color + '"/>';
      s += '<text class="val" x="' + (x0 - w - 6) + '" y="' + (y + 14) + '" text-anchor="end">' + (opts.fmt ? opts.fmt(d.value) : d.value) + (d.flag ? ' فوق السعة' : '') + '</text>';
      s += '<rect class="hit" tabindex="0" data-i="' + i + '" x="' + PAD.l + '" y="' + (y - 5) + '" width="' + (W - PAD.l - PAD.r) + '" height="' + rowH + '" aria-label="' + esc(d.tip.replace(/<[^>]+>/g, '')) + '"/>';
    });
    if (opts.ref) { const x = x0 - opts.ref / nice * iw; s += '<line x1="' + x + '" x2="' + x + '" y1="' + (PAD.t - 4) + '" y2="' + (h - 14) + '" stroke="#1c1a27" stroke-width="2"/><text x="' + (x - 4) + '" y="' + (h - 2) + '" text-anchor="middle" class="val">السعة ' + opts.ref + 'h</text>'; }
    s += '<line class="axis" x1="' + x0 + '" x2="' + x0 + '" y1="' + (PAD.t - 6) + '" y2="' + (h - 16) + '"/></svg>';
    return s;
  }
  function line(data, opts) {
    const n = data.length; const iw = W - PAD.l - PAD.r - 24; const ih = H - PAD.t - PAD.b;
    const max = Math.max(1, ...data.map(d => d.value)); const nice = niceMax(max);
    const X = i => W - PAD.r - 12 - (n === 1 ? iw / 2 : i / (n - 1) * iw); const Y = v => PAD.t + ih - v / nice * ih;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.aria) + '">';
    ticks(nice).forEach(v => { const y = Y(v); s += '<line class="grid" x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + y + '" y2="' + y + '"/><text x="' + (W - PAD.r) + '" y="' + (y - 4) + '" text-anchor="end">' + v + '</text>'; });
    s += '<path d="M' + data.map((d, i) => X(i) + ' ' + Y(d.value)).join(' L') + ' L' + X(n - 1) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(0) + 'Z" fill="' + opts.color + '" opacity=".1"/>';
    s += '<polyline points="' + data.map((d, i) => X(i) + ',' + Y(d.value)).join(' ') + '" fill="none" stroke="' + opts.color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    data.forEach((d, i) => {
      s += '<circle class="mark" data-i="' + i + '" cx="' + X(i) + '" cy="' + Y(d.value) + '" r="' + (i === n - 1 ? 5 : 4) + '" fill="' + opts.color + '" stroke="#fff" stroke-width="2"/>';
      s += '<text x="' + X(i) + '" y="' + (H - 12) + '" text-anchor="middle" direction="rtl">' + esc(d.label) + '</text>';
      const bandW = n === 1 ? iw : iw / (n - 1);
      s += '<rect class="hit" tabindex="0" data-i="' + i + '" x="' + (X(i) - bandW / 2) + '" y="' + PAD.t + '" width="' + bandW + '" height="' + ih + '" aria-label="' + esc(d.tip.replace(/<[^>]+>/g, '')) + '"/>';
    });
    s += '<text class="val" x="' + (X(n - 1) - 8) + '" y="' + (Y(data[n - 1].value) + 4) + '" text-anchor="end">' + data[n - 1].value + '</text>';
    s += '<line class="axis" x1="' + PAD.l + '" x2="' + (W - PAD.r) + '" y1="' + (PAD.t + ih) + '" y2="' + (PAD.t + ih) + '"/></svg>';
    return s;
  }
  function gantt(tasks, opts) {
    if (!tasks.length) return '<p class="muted">لا توجد مهام بتواريخ في هذا النطاق.</p>';
    const all = tasks.flatMap(x => [x.start || x.due, x.due || x.start]);
    const min = all.reduce((a, b) => a < b ? a : b), maxD = all.reduce((a, b) => a > b ? a : b);
    const span = Math.max(1, daysBetween(min, maxD) + 1);
    const rowH = 30, lw = 170; const h = PAD.t + tasks.length * rowH + 20; const x0 = W - PAD.r - lw, iw = x0 - PAD.l;
    const X = iso => x0 - daysBetween(min, iso) / span * iw;
    const colOf = k => ({ todo: 'var(--st-todo)', progress: 'var(--st-progress)', review: 'var(--st-review)', done: 'var(--st-done)' })[k];
    let s = '<svg viewBox="0 0 ' + W + ' ' + h + '" role="img" aria-label="' + esc(opts.aria) + '"><defs><marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" fill="#454257"/></marker></defs>';
    const T = todayISO();
    for (let i = 0; i <= span; i += 7) { const iso = addDays(min, i); const x = X(iso); s += '<line class="grid" x1="' + x + '" x2="' + x + '" y1="' + (PAD.t - 6) + '" y2="' + (h - 14) + '"/><text x="' + x + '" y="' + (PAD.t - 10) + '" text-anchor="middle">' + fmtDate(iso) + '</text>'; }
    const pos = {};
    tasks.forEach((x, i) => {
      const y = PAD.t + i * rowH + 4; const a = X(x.start || x.due), b = X(addDays(x.due || x.start, 1)); const w = Math.max(6, a - b);
      pos[x.id] = { left: b, right: a, y: y + 10 };
      s += '<text x="' + (W - PAD.r) + '" y="' + (y + 14) + '" text-anchor="start" direction="rtl">' + esc(x.title.length > 26 ? x.title.slice(0, 25) + '…' : x.title) + '</text>';
      s += '<rect class="mark" data-i="' + i + '" x="' + b + '" y="' + y + '" width="' + w + '" height="18" rx="4" fill="' + colOf(x.status) + '"' + (isOverdue(x) ? ' stroke="#c0322f" stroke-width="2"' : '') + '/>';
      s += '<rect class="hit" tabindex="0" data-i="' + i + '" x="' + PAD.l + '" y="' + (y - 5) + '" width="' + (W - PAD.l - PAD.r) + '" height="' + rowH + '" aria-label="' + esc(opts.tips[i].replace(/<[^>]+>/g, '')) + '"/>';
    });
    tasks.forEach(x => x.deps.forEach(dId => {
      const p = pos[dId], q = pos[x.id]; if (!p || !q) return;
      const sx = p.left, sy = p.y, ex = q.right + 2, ey = q.y;
      s += '<path d="M' + sx + ' ' + sy + ' H' + (sx - 6) + ' V' + ey + ' H' + ex + '" fill="none" stroke="#454257" stroke-width="1.3" marker-end="url(#arr)"/>';
    }));
    if (T >= min && T <= addDays(maxD, 1)) { const x = X(T); s += '<line x1="' + x + '" x2="' + x + '" y1="' + (PAD.t - 4) + '" y2="' + (h - 12) + '" stroke="#c0322f" stroke-width="2"/><text x="' + x + '" y="' + (h - 1) + '" text-anchor="middle" class="val" style="fill:#c0322f">اليوم</text>'; }
    return s + '</svg>';
  }

  function niceMax(v) { if (v <= 5) return Math.max(2, Math.ceil(v)); const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; return (m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
  function ticks(max) { const step = max <= 5 ? 1 : max <= 10 ? 2 : max / 5; const out = []; for (let v = 0; v <= max + 1e-9; v += step) out.push(Math.round(v * 10) / 10); return out; }
  function roundTop(x, y, w, h, r) { if (h <= 0) return 'M' + x + ' ' + (y) + 'h' + w; r = Math.min(r, h, w / 2); return 'M' + x + ' ' + (y + h) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h) + 'Z'; }
  function roundLeft(x, y, w, h, r) { if (w <= 0) return 'M' + (x + w) + ' ' + y + 'v' + h; r = Math.min(r, w, h / 2); return 'M' + (x + w) + ' ' + y + 'H' + (x + r) + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y + r) + 'V' + (y + h - r) + 'Q' + x + ' ' + (y + h) + ' ' + (x + r) + ' ' + (y + h) + 'H' + (x + w) + 'Z'; }

  /* ---------- Metrics ---------- */
  function weeks() {
    const T = todayISO(); const out = [];
    for (let k = 5; k >= 0; k--) { const end = addDays(T, -7 * k); const start = addDays(end, -6); out.push({ start, end, label: k === 0 ? 'هذا الأسبوع' : 'قبل ' + (k === 1 ? 'أسبوع' : k === 2 ? 'أسبوعين' : k + ' أسابيع') }); }
    return out;
  }
  const CARDS = [
    {
      id: 'status', title: 'المهام حسب الحالة', en: 'Tasks by status',
      sub: 'كم مهمة في كل مرحلة من سير العمل.',
      calc: 'العدّ: كل مهمة في النطاق الحالي (القائمة والمسؤول المختاران) تُحسب مرة واحدة في عمود حالتها.',
      explain: 'عمود TO DO الطويل يعني عملاً لم يبدأ، وREVIEW الطويل يعني عنق زجاجة في المراجعة. قارن الأعمدة ببعضها لا بقيمة مثالية.',
      build(tasks) {
        const data = STATUSES.map(s => { const v = tasks.filter(x => x.status === s.key).length; return { label: s.en, value: v, ltr: true, color: 'var(--st-' + s.key + ')', tip: '<b>' + s.en + '</b><br>' + v + ' مهمة' }; });
        return { svg: barsVertical(data, { aria: 'رسم أعمدة لعدد المهام حسب الحالة' }), data, table: [['الحالة', 'عدد المهام'], ...data.map(d => [d.label, d.value])],
          q: { text: 'أي حالة تضم أكبر عدد من المهام في النطاق الحالي؟', options: data.map(d => d.label), correct: maxLabels(data), why: d => 'الأعلى: ' + maxLabels(data).join(' و') + ' (' + Math.max(...data.map(x => x.value)) + ' مهام).' } };
      }
    },
    {
      id: 'assignee', title: 'المهام المفتوحة حسب المسؤول', en: 'Open tasks by assignee',
      sub: 'توزيع العمل غير المغلق على الفريق.',
      calc: 'العدّ: المهام التي حالتها ليست COMPLETE، مجمّعة حسب المسؤول. المهام بلا مسؤول تظهر في صف مستقل.',
      explain: 'فرق كبير بين شخص وآخر يستدعي سؤالاً عن التوزيع قبل الحكم على الأداء. افتح المهام خلف الرقم في المختبر.',
      build(tasks) {
        const open = tasks.filter(x => x.status !== 'done');
        const rows = PEOPLE.map(p => ({ label: p.short, value: open.filter(x => x.assignee === p.id).length, id: p.id }));
        const none = open.filter(x => !x.assignee).length; if (none) rows.push({ label: 'بدون مسؤول', value: none, id: 'none' });
        const data = rows.filter(r => r.value > 0 || r.id !== 'none').map(r => ({ label: r.label, value: r.value, color: 'var(--c1)', tip: '<b>' + esc(r.label) + '</b><br>' + r.value + ' مهمة مفتوحة' }));
        return { svg: barsHorizontal(data, { aria: 'رسم أعمدة أفقية للمهام المفتوحة لكل مسؤول' }), data, table: [['المسؤول', 'مهام مفتوحة'], ...data.map(d => [d.label, d.value])],
          q: { text: 'من لديه أكبر عدد من المهام المفتوحة؟', options: data.filter(d => d.value > 0 || true).map(d => d.label), correct: maxLabels(data), why: () => 'الأعلى: ' + maxLabels(data).join(' و') + '.' } };
      }
    },
    {
      id: 'trend', title: 'الإنجاز الأسبوعي', en: 'Completed per week', wide: true,
      sub: 'عدد المهام التي انتقلت إلى COMPLETE في كل أسبوع من الأسابيع الستة الأخيرة. الزمن يسير من اليمين إلى اليسار.',
      calc: 'العدّ: المهام التي يقع تاريخ إكمالها داخل الأسبوع (7 أيام تنتهي في اليوم المعروض). أكمل مهمة في المختبر وسترى نقطة «هذا الأسبوع» ترتفع.',
      explain: 'اقرأ الاتجاه عبر عدة نقاط، لا أسبوعاً واحداً. ارتفاع مفاجئ قد يكون إغلاقاً متراكماً لمهام قديمة.',
      build(tasks) {
        const W6 = weeks();
        const data = W6.map(w => { const v = tasks.filter(x => x.completedAt && isoDate(new Date(x.completedAt)) >= w.start && isoDate(new Date(x.completedAt)) <= w.end).length; return { label: w.label, value: v, tip: '<b>' + w.label + '</b><br>' + fmtDate(w.start) + ' - ' + fmtDate(w.end) + '<br>' + v + ' مهام مكتملة' }; });
        return { svg: line(data, { aria: 'رسم خطي للمهام المكتملة أسبوعياً', color: 'var(--c1)' }), data, table: [['الأسبوع', 'الفترة', 'مهام مكتملة'], ...data.map((d, i) => [d.label, fmtDate(W6[i].start) + ' - ' + fmtDate(W6[i].end), d.value])],
          q: { text: 'في أي أسبوع كان عدد المهام المكتملة هو الأعلى؟', options: data.map(d => d.label), correct: maxLabels(data), why: () => 'الأعلى: ' + maxLabels(data).join(' و') + ' (' + Math.max(...data.map(x => x.value)) + ').' } };
      }
    },
    {
      id: 'overdue', title: 'المهام المتأخرة', en: 'Overdue tasks',
      sub: 'المهام غير المغلقة التي تجاوزت تاريخ استحقاقها، حسب المسؤول.',
      calc: 'متأخرة = الحالة ليست COMPLETE وتاريخ الاستحقاق قبل اليوم. النسبة = المتأخرة ÷ كل المهام المفتوحة في النطاق.',
      explain: 'العدد وحده مضلل عند مقارنة فرق مختلفة الحجم. انظر إلى النسبة، ثم افتح المهام نفسها لمعرفة السبب.',
      build(tasks) {
        const open = tasks.filter(x => x.status !== 'done'); const od = open.filter(isOverdue);
        const data = PEOPLE.map(p => ({ label: p.short, value: od.filter(x => x.assignee === p.id).length })).filter(d => d.value > 0).map(d => ({ label: d.label, value: d.value, color: 'var(--err)', tip: '<b>' + esc(d.label) + '</b><br>' + d.value + ' متأخرة' }));
        const pct = open.length ? Math.round(od.length / open.length * 100) : 0;
        const head = '<p class="small" style="margin-bottom:6px"><b class="num" style="font-size:1.6rem;color:var(--err)">' + od.length + '</b> متأخرة من <b class="num">' + open.length + '</b> مفتوحة، أي <b class="num">' + pct + '%</b></p>';
        const list = od.length ? '<ul class="activity" style="color:var(--ink-2);margin-top:6px">' + od.slice(0, 5).map(x => '<li>' + icon('alert', 'icon-sm') + ' ' + t(x.title) + ' <span class="muted">(' + fmtDate(x.due) + ')</span></li>').join('') + '</ul>' : '';
        const opts = uniq([pct + '%', (open.length ? Math.round(od.length / tasks.length * 100) : 0) + '%', od.length + '%', Math.min(100, pct + 20) + '%']);
        return { svg: head + (data.length ? barsHorizontal(data, { aria: 'رسم أعمدة للمهام المتأخرة لكل مسؤول' }) : '<p class="muted">لا توجد مهام متأخرة في هذا النطاق.</p>') + list, data,
          table: [['المهمة', 'المسؤول', 'تاريخ الاستحقاق', 'الحالة'], ...od.map(x => [x.title, x.assignee ? PERSON[x.assignee].short : '-', fmtDate(x.due), STATUS[x.status].en])],
          q: { text: 'ما نسبة المهام المتأخرة من المهام المفتوحة في النطاق الحالي؟', options: opts, correct: [pct + '%'], why: () => od.length + ' ÷ ' + open.length + ' = ' + pct + '%. القسمة على المفتوحة فقط، لأن المكتملة لا يمكن أن تتأخر.' } };
      }
    },
    {
      id: 'workload', title: 'عبء العمل مقابل السعة', en: 'Workload vs capacity',
      sub: 'ساعات التقدير للمهام المفتوحة المستحقة خلال 7 أيام (والمتأخرة)، مقابل سعة ' + CAPACITY_H + ' ساعات أسبوعياً لكل شخص.',
      calc: 'المجموع = تقدير الوقت (Time estimate) لكل مهمة مفتوحة تاريخ استحقاقها قبل نهاية الأيام السبعة القادمة. الخط الأسود = السعة. عبارة «فوق السعة» بجانب الشريط تعني تجاوزها.',
      explain: 'تجاوز السعة إشارة لإعادة التوزيع أو تعديل المواعيد، لا دليلاً على ضعف. التقديرات الناقصة تجعل العبء يبدو أقل من الحقيقة.',
      build(tasks) {
        const lim = addDays(todayISO(), 7);
        const rows = PEOPLE.map(p => { const v = tasks.filter(x => x.status !== 'done' && x.assignee === p.id && x.due && x.due <= lim).reduce((a, x) => a + (+x.estimate || 0), 0); return { label: p.short, value: Math.round(v * 10) / 10 }; });
        const data = rows.map(r => ({ label: r.label, value: r.value, flag: r.value > CAPACITY_H, color: 'var(--c1)', tip: '<b>' + esc(r.label) + '</b><br>' + r.value + ' ساعة من ' + CAPACITY_H + (r.value > CAPACITY_H ? '<br>فوق السعة' : '') }));
        const over = data.filter(d => d.flag).map(d => d.label);
        return { svg: barsHorizontal(data, { aria: 'رسم أعمدة أفقية لساعات العمل مقابل السعة', ref: CAPACITY_H, fmt: v => v + 'h' }), data, table: [['الشخص', 'ساعات مقدّرة', 'السعة', 'الحالة'], ...data.map(d => [d.label, d.value, CAPACITY_H, d.flag ? 'فوق السعة' : 'ضمن السعة'])],
          q: { text: 'من تجاوز سعته الأسبوعية؟', options: data.map(d => d.label).concat(['لا أحد']), correct: over.length ? over : ['لا أحد'], why: () => over.length ? 'فوق السعة: ' + over.join(' و') + '.' : 'لا أحد فوق ' + CAPACITY_H + ' ساعات.' } };
      }
    },
    {
      id: 'deps', title: 'خط زمني بالاعتماديات', en: 'Dependency timeline', wide: true, fixedList: 'service',
      sub: 'مهام «مبادرة تحسين الخدمة» بتواريخها. السهم يعني أن المهمة تنتظر (Waiting on) التي قبلها. الزمن يسير من اليمين إلى اليسار.',
      calc: 'طول الشريط من تاريخ البدء إلى تاريخ الاستحقاق. الإطار الأحمر = متأخرة. الخط الأحمر = اليوم.',
      explain: 'التأخير في مهمة يمتد إلى كل ما ينتظرها. جرّب زر التأخير لترى كيف تتحرك التواريخ في المختبر والرسم معاً.',
      build(all) {
        const tasks = Lab.tasks().filter(x => x.list === 'service' && (x.start || x.due)).sort((a, b) => (a.start || a.due).localeCompare(b.start || b.due));
        const tips = tasks.map(x => '<b>' + esc(x.title) + '</b><br>' + (x.start ? fmtDate(x.start) : '-') + ' ← ' + (x.due ? fmtDate(x.due) : '-') + '<br>' + STATUS[x.status].en + (x.deps.length ? '<br>تنتظر: ' + esc(x.deps.map(d => Lab.task(d).title).join('، ')) : ''));
        const focus = tasks.find(x => x.id === 's3') || tasks.find(x => x.status !== 'done');
        const affected = focus ? downstream(focus.id) : [];
        const names = affected.map(id => Lab.task(id).title);
        const others = tasks.filter(x => x.id !== (focus && focus.id) && !affected.includes(x.id)).map(x => x.title);
        const correct = names.length ? names.join('، ') : 'لا شيء';
        const opts = uniq([correct, names.slice(0, 1).join('') || 'لا شيء', others.slice(0, 2).join('، ') || 'لا شيء', tasks.map(x => x.title).filter(x => x !== (focus && focus.title)).join('، ')]).filter(Boolean);
        const legend = '<div class="legend">' + STATUSES.map(s => '<span><i style="background:var(--st-' + s.key + ')"></i><bdi dir="ltr">' + s.en + '</bdi></span>').join('') + '<span><i style="background:transparent;border:2px solid #c0322f"></i>متأخرة</span></div>';
        return { svg: legend + gantt(tasks, { aria: 'مخطط زمني لمهام مبادرة تحسين الخدمة مع الاعتماديات', tips }) +
            (focus ? '<div class="ex-actions" style="margin-top:8px"><button type="button" class="btn btn-secondary btn-sm" data-delay="' + focus.id + '">' + icon('clock', 'icon-sm') + 'أخّر «' + t(focus.title) + '» يوماً واحداً</button><span class="help-text">يعيد جدولة المهام المنتظرة كما يفعل إعداد إعادة جدولة الاعتماديات.</span></div>' : ''),
          data: tasks, tips,
          table: [['المهمة', 'البدء', 'الاستحقاق', 'الحالة', 'تنتظر'], ...tasks.map(x => [x.title, x.start ? fmtDate(x.start) : '-', x.due ? fmtDate(x.due) : '-', STATUS[x.status].en, x.deps.map(d => Lab.task(d).title).join('، ') || '-'])],
          q: focus ? { text: 'إذا تأخرت «' + focus.title + '»، ما المهام التي تتأثر مواعيدها؟', options: opts, correct: [correct], why: () => 'تتأثر كل مهمة تنتظرها مباشرة أو عبر سلسلة: ' + correct + '.' } : null };
      }
    }
  ];
  function downstream(id) { const out = []; const q = [id]; while (q.length) { const cur = q.shift(); Lab.tasks().forEach(x => { if (x.deps.includes(cur) && !out.includes(x.id)) { out.push(x.id); q.push(x.id); } }); } return out; }
  function maxLabels(data) { const m = Math.max(...data.map(d => d.value)); return data.filter(d => d.value === m).map(d => d.label); }
  function uniq(a) { return Array.from(new Set(a)); }

  function mount(el) {
    root = el;
    root.innerHTML = '<div class="page">' +
      '<div class="page-head"><div><div class="breadcrumbs"><a href="#/home">الرئيسية</a><span aria-hidden="true">/</span><span>استوديو لوحات المعلومات</span></div>' +
      '<h1>استوديو لوحات المعلومات <bdi class="en" dir="ltr" style="font-weight:400;color:var(--ink-3);font-size:1rem">Dashboard Learning Studio</bdi></h1>' +
      '<p>تعلّم قراءة البطاقات قبل إعدادها. كل رسم هنا يُحسب من مهام مختبر التطبيق نفسها: غيّر مهمة هناك وارجع لترى أثرها. لكل رسم شرح وطريقة حساب وسؤال وجدول بيانات.</p></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="chip chip-sim">' + icon('eye', 'icon-sm') + 'محاكاة تعليمية لبطاقات Dashboard</span><a class="btn btn-secondary btn-sm" href="#/lab">' + icon('flask', 'icon-sm') + 'افتح المختبر</a></div></div>' +
      '<div class="panel studio-filters" role="group" aria-label="مرشّحات اللوحة"><div class="field"><label for="stList">مصدر البيانات <bdi class="en" dir="ltr">Location</bdi></label><select class="select" id="stList" data-sf="list"><option value="all">كل القوائم</option>' + LAB_LISTS.map(l => '<option value="' + l.id + '">' + esc(l.name) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="stAs">المسؤول <bdi class="en" dir="ltr">Assignee</bdi></label><select class="select" id="stAs" data-sf="assignee"><option value="">الكل</option>' + PEOPLE.map(p => '<option value="' + p.id + '">' + esc(p.name) + '</option>').join('') + '</select></div>' +
      '<p class="help-text" style="flex:1;min-width:220px">هذه مرشّحات على مستوى اللوحة (Dashboard filters): تُطبّق على كل البطاقات المدعومة. بطاقة الخط الزمني مصدرها ثابت: «مبادرة تحسين الخدمة».</p></div>' +
      '<div class="chart-grid" data-charts></div></div>';
    $('#stList', root).value = F.list; $('#stAs', root).value = F.assignee;
    root.addEventListener('change', e => { const k = e.target.dataset.sf; if (k) { F[k] = e.target.value; paint(); announce('تحدّثت البطاقات'); } });
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
    const openDetails = new Set($$('details[data-tbl][open]', root).map(d => d.dataset.tbl));
    built = {};
    $('[data-charts]', root).innerHTML = CARDS.map(c => {
      const r = c.build(tasks); built[c.id] = r;
      const q = r.q; const a = answered[c.id];
      return '<article class="panel chart-card' + (c.wide ? ' wide' : '') + '" aria-labelledby="ch-' + c.id + '"><header><div><h2 id="ch-' + c.id + '" style="font-size:1.05rem">' + t(c.title) + ' <bdi class="en muted" dir="ltr" style="font-size:.78rem;font-weight:400">' + c.en + '</bdi></h2><p>' + t(c.sub) + '</p></div></header>' +
        '<div class="chart-box" data-chart="' + c.id + '">' + r.svg + '<div class="chart-tip" role="tooltip"></div></div>' +
        '<div class="chart-explain"><p>' + icon('bulb', 'icon-sm') + ' ' + t(c.explain) + '</p><p class="calc-def"><b>طريقة الحساب:</b> ' + t(c.calc) + '</p></div>' +
        '<details class="deeper" data-tbl="' + c.id + '"' + (openDetails.has(c.id) ? ' open' : '') + '><summary>' + icon('table', 'icon-sm') + 'عرض البيانات كجدول' + '<span class="chev" style="margin-inline-start:auto">' + icon('chev-left', 'icon-sm') + '</span></summary><div class="deeper-body"><div class="table-wrap"><table class="data-table"><caption class="visually-hidden">بيانات ' + esc(c.title) + '</caption><thead><tr>' + r.table[0].map(h => '<th scope="col">' + t(h) + '</th>').join('') + '</tr></thead><tbody>' +
        (r.table.length > 1 ? r.table.slice(1).map(row => '<tr>' + row.map((v, i) => '<td' + (typeof v === 'number' ? ' class="num"' : '') + '>' + t(v) + '</td>').join('') + '</tr>').join('') : '<tr><td colspan="' + r.table[0].length + '" class="muted">لا توجد بيانات في هذا النطاق</td></tr>') + '</tbody></table></div></div></details>' +
        (q ? '<div class="chart-q"><p class="q-title">' + icon('help', 'icon-sm') + ' ' + t(q.text) + '</p><div class="opts" role="group" aria-label="خيارات الإجابة">' +
          q.options.map(o => '<button type="button" class="btn btn-secondary btn-sm' + (a && a.choice === o ? (q.correct.includes(o) ? ' correct' : ' wrong') : '') + '" data-qa="' + c.id + '" data-v="' + esc(o) + '">' + t(o) + '</button>').join('') + '</div><div data-qfb>' +
          (a ? feedbackHTML(q.correct.includes(a.choice) ? 'ok' : 'bad', (q.correct.includes(a.choice) ? 'صحيح. ' : 'ليست هذه. ') + t(q.why())) : '') + '</div></div>' : '') +
        '</article>';
    }).join('');
  }
  function onClick(e) {
    const b = e.target.closest('[data-qa]');
    if (b) { answered[b.dataset.qa] = { choice: b.dataset.v }; paint(); const again = root.querySelector('[data-qa="' + b.dataset.qa + '"][data-v="' + CSS.escape(b.dataset.v) + '"]'); if (again) again.focus(); return; }
    const d = e.target.closest('[data-delay]');
    if (d) {
      const id = d.dataset.delay;
      const tk = Lab.task(id); const chain = downstream(id);
      Lab.update(id, { start: tk.start ? addDays(tk.start, 1) : '', due: tk.due ? addDays(tk.due, 1) : '' }, 'studio');
      chain.forEach(cid => { const c = Lab.task(cid); Lab.update(cid, { start: c.start ? addDays(c.start, 1) : '', due: c.due ? addDays(c.due, 1) : '' }, 'studio'); });
      delete answered.deps;
      toast('تأخرت المهمة يوماً، وأُعيدت جدولة ' + chain.length + ' مهام تنتظرها');
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
    const hit = e.target.closest && e.target.closest('.hit');
    if (!hit) { hideTips(); return; }
    const box = hit.closest('.chart-box'); const r = box.getBoundingClientRect();
    showTip(box, +hit.dataset.i, e.clientX - r.left, e.clientY - r.top - 8);
  }
  function onFocus(e) {
    const hit = e.target.closest && e.target.closest('.hit'); if (!hit) return;
    const box = hit.closest('.chart-box'); const br = box.getBoundingClientRect(); const hr = hit.getBoundingClientRect();
    showTip(box, +hit.dataset.i, hr.left - br.left + hr.width / 2, hr.top - br.top + 10);
  }
  return { mount, unmount };
})();
