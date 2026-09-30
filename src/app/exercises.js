/* ==========================================================================
   Practice activities and knowledge checks. Every activity validates the
   learner's actual input; nothing is marked done by simply visiting.
   ========================================================================== */

function feedbackHTML(kind, html) {
  const ic = kind === 'ok' ? 'check-circle' : kind === 'bad' ? 'x-circle' : 'info';
  return '<div class="feedback ' + kind + '" role="status">' + icon(ic) + '<div>' + html + '</div></div>';
}
const words = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;

function renderExercise(root, ex, key, onSolved) {
  const solved = () => { if (onSolved) onSolved(); };
  const head = '<div class="ex-task"><h3>' + icon('flask') + 'نشاط تطبيقي</h3><p>' + t(ex.prompt) + '</p></div>';
  const R = EX_RENDER[ex.type];
  if (!R) { root.innerHTML = head; return; }
  root.classList.add('exercise');
  R(root, ex, key, solved, head);
}

const EX_RENDER = {
  order(root, ex, key, solved, head) {
    let order = seededShuffle(ex.items.map((_, i) => i), key + 'o');
    if (order.every((v, i) => v === i)) order.reverse();
    const draw = (marks) => {
      root.innerHTML = head + '<ol class="order-list" aria-label="العناصر بالترتيب الحالي">' + order.map((idx, pos) =>
        '<li class="order-item' + (marks ? (marks[pos] ? ' ok' : ' bad') : '') + '"><span>' + t(ex.items[idx]) + '</span><span class="order-btns">' +
        '<button type="button" class="icon-btn" data-mv="-1" data-pos="' + pos + '" aria-label="انقل «' + esc(ex.items[idx]) + '» للأعلى"' + (pos === 0 ? ' disabled' : '') + '>' + icon('up') + '</button>' +
        '<button type="button" class="icon-btn" data-mv="1" data-pos="' + pos + '" aria-label="انقل «' + esc(ex.items[idx]) + '» للأسفل"' + (pos === order.length - 1 ? ' disabled' : '') + '>' + icon('down') + '</button></span></li>').join('') + '</ol>' +
        '<div class="ex-actions"><button type="button" class="btn btn-primary" data-check>تحقق من الترتيب</button></div><div data-fb></div>';
    };
    draw();
    root.onclick = e => {
      const mv = e.target.closest('[data-mv]');
      if (mv) {
        const p = +mv.dataset.pos, d = +mv.dataset.mv, q = p + d;
        [order[p], order[q]] = [order[q], order[p]];
        draw();
        const btn = root.querySelector('[data-pos="' + q + '"][data-mv="' + d + '"]') || root.querySelector('[data-pos="' + q + '"]');
        if (btn) btn.focus();
        announce('نُقل العنصر إلى الموضع ' + (q + 1));
        return;
      }
      if (e.target.closest('[data-check]')) {
        const marks = order.map((v, i) => v === i);
        draw(marks);
        const n = marks.filter(Boolean).length;
        $('[data-fb]', root).innerHTML = n === order.length
          ? feedbackHTML('ok', 'ترتيب صحيح بالكامل. أحسنت.')
          : feedbackHTML('bad', n + ' من ' + order.length + ' في موضعها الصحيح. العناصر المظللة بالأحمر تحتاج نقلاً.');
        if (n === order.length) solved();
      }
    };
  },

  match(root, ex, key, solved, head) {
    const choices = seededShuffle(ex.choices, key + 'm');
    const rows = seededShuffle(ex.pairs.map((p, i) => i), key + 'r');
    root.innerHTML = head + '<div class="match">' + rows.map(i => {
      const id = key + '-m' + i;
      return '<div class="match-row" data-i="' + i + '"><label class="term" for="' + id + '">' + t(ex.pairs[i][0]) + '</label>' +
        '<select class="select" id="' + id + '"><option value="">اختر...</option>' + choices.map(c => '<option>' + esc(c) + '</option>').join('') + '</select>' +
        '<span class="res" aria-hidden="true"></span></div>';
    }).join('') + '</div><div class="ex-actions"><button type="button" class="btn btn-primary" data-check>تحقق</button></div><div data-fb></div>';
    root.onclick = e => {
      if (!e.target.closest('[data-check]')) return;
      let ok = 0, empty = 0;
      $$('.match-row', root).forEach(r => {
        const i = +r.dataset.i, v = $('select', r).value, res = $('.res', r);
        if (!v) { empty++; res.className = 'res'; res.innerHTML = ''; return; }
        const good = v === ex.pairs[i][1];
        if (good) ok++;
        res.className = 'res ' + (good ? 'ok' : 'bad');
        res.innerHTML = icon(good ? 'check' : 'x');
        $('select', r).setAttribute('aria-invalid', good ? 'false' : 'true');
      });
      const fb = $('[data-fb]', root);
      if (empty) { fb.innerHTML = feedbackHTML('info', 'اختر إجابة لكل عنصر أولاً (' + empty + ' متبقية).'); return; }
      if (ok === ex.pairs.length) { fb.innerHTML = feedbackHTML('ok', 'كل المطابقات صحيحة.'); solved(); }
      else fb.innerHTML = feedbackHTML('bad', ok + ' من ' + ex.pairs.length + ' صحيحة. راجع العناصر المعلّمة ثم حاول مجدداً.');
    };
  },

  choice(root, ex, key, solved, head) {
    const opts = seededShuffle(ex.options.map((o, i) => i), key + 'c');
    const name = key + '-ch';
    root.innerHTML = head + '<fieldset style="border:0;margin:0;padding:0;display:grid;gap:8px"><legend class="visually-hidden">اختر الإجابة</legend>' + opts.map(i =>
      '<label class="opt"><input type="radio" name="' + name + '" value="' + i + '"><span>' + t(ex.options[i].t) + '</span></label>').join('') + '</fieldset>' +
      '<div class="ex-actions"><button type="button" class="btn btn-primary" data-check>تحقق</button></div><div data-fb></div>';
    root.onclick = e => {
      if (!e.target.closest('[data-check]')) return;
      const sel = $('input[name="' + name + '"]:checked', root); const fb = $('[data-fb]', root);
      if (!sel) { fb.innerHTML = feedbackHTML('info', 'اختر إجابة أولاً.'); return; }
      const o = ex.options[+sel.value];
      $$('.opt', root).forEach(l => l.classList.remove('correct', 'wrong'));
      sel.closest('.opt').classList.add(o.ok ? 'correct' : 'wrong');
      fb.innerHTML = feedbackHTML(o.ok ? 'ok' : 'bad', t(o.fb) + (o.ok ? '' : ' حاول مرة أخرى.'));
      if (o.ok) solved();
    };
  },

  taskSim(root, ex, key, solved, head) {
    const st = Object.assign({}, ex.start);
    const f = ex.fields;
    const today = todayISO();
    const fld = (name, html) => '<div class="field' + (name === 'title' || name === 'desc' ? ' full' : '') + '">' + html + '</div>';
    let form = '';
    if (st.title && !f.includes('title')) form += '<div class="full"><strong>' + t(st.title) + '</strong></div>';
    if (f.includes('title')) form += fld('title', '<label for="' + key + '-ti">عنوان المهمة <bdi class="en" dir="ltr">Task name</bdi></label><input class="input" id="' + key + '-ti" data-f="title" placeholder="ابدأ بفعل، مثل: تحضير...">');
    if (f.includes('desc')) form += fld('desc', '<label for="' + key + '-de">الوصف <bdi class="en" dir="ltr">Description</bdi></label><textarea class="textarea" id="' + key + '-de" data-f="desc" placeholder="المطلوب: ... يُعدّ منجزاً عندما: ..."></textarea>');
    if (f.includes('status')) form += fld('status', '<label for="' + key + '-st">الحالة <bdi class="en" dir="ltr">Status</bdi></label><select class="select" id="' + key + '-st" data-f="status">' + STATUSES.map(s => '<option value="' + s.key + '"' + (st.status === s.key ? ' selected' : '') + ' dir="ltr">' + s.en + '</option>').join('') + '</select>');
    if (f.includes('assignee')) form += fld('assignee', '<label for="' + key + '-as">المسؤول <bdi class="en" dir="ltr">Assignee</bdi></label><select class="select" id="' + key + '-as" data-f="assignee"><option value="">بدون مسؤول</option>' + PEOPLE.map(p => '<option value="' + p.id + '">' + esc(p.name) + '</option>').join('') + '</select>');
    if (f.includes('priority')) form += fld('priority', '<label for="' + key + '-pr">الأولوية <bdi class="en" dir="ltr">Priority</bdi></label><select class="select" id="' + key + '-pr" data-f="priority"><option value="">بدون</option>' + PRIORITIES.map(p => '<option value="' + p.key + '" dir="ltr">' + p.en + '</option>').join('') + '</select>');
    if (f.includes('start')) form += fld('start', '<label for="' + key + '-sd">تاريخ البدء <bdi class="en" dir="ltr">Start date</bdi></label><input type="date" class="input" id="' + key + '-sd" data-f="start">');
    if (f.includes('due')) form += fld('due', '<label for="' + key + '-dd">تاريخ الاستحقاق <bdi class="en" dir="ltr">Due date</bdi></label><input type="date" class="input" id="' + key + '-dd" data-f="due">');
    root.innerHTML = head + '<div class="sim-task">' + form + '</div>' +
      '<div><p class="field-label" style="margin-bottom:6px">المطلوب لإكمال النشاط</p><ul class="goal-list" data-goals></ul></div><div data-fb></div>';
    const test = g => {
      const v = g.field === 'dates' ? null : String(st[g.field] || '');
      if (g.minWords) return words(v) >= g.minWords;
      if (g.anyOf) return g.anyOf.some(w => v.includes(w));
      if (g.eq != null) return v === g.eq;
      if (g.valid) return !!st.start && !!st.due && st.start <= today && st.due > st.start;
      return false;
    };
    let done = false;
    const paint = () => {
      const res = ex.goals.map(g => test(g.test));
      $('[data-goals]', root).innerHTML = ex.goals.map((g, i) => '<li class="' + (res[i] ? 'met' : '') + '"><span class="gtick">' + (res[i] ? icon('check') : '') + '</span><span>' + t(g.text) + '<span class="visually-hidden">' + (res[i] ? ' (مكتمل)' : ' (غير مكتمل)') + '</span></span></li>').join('');
      if (res.every(Boolean) && !done) {
        done = true;
        $('[data-fb]', root).innerHTML = feedbackHTML('ok', 'اكتملت كل المتطلبات. هذه مهمة يفهمها أي زميل.');
        solved();
      }
    };
    root.oninput = root.onchange = e => { const k = e.target.dataset.f; if (!k) return; st[k] = e.target.value; paint(); };
    paint();
  },

  board(root, ex, key, solved, head) {
    const pos = Object.fromEntries(ex.cards.map(c => [c.id, c.status]));
    let marks = null;
    const draw = () => {
      root.innerHTML = head + '<div class="mini-board">' + STATUSES.map(s =>
        '<div class="mini-col" data-col="' + s.key + '"><h4><span class="status-badge st-' + s.key + '">' + s.en + '</span></h4>' +
        ex.cards.filter(c => pos[c.id] === s.key).map(c => '<div class="mini-card" draggable="true" data-card="' + c.id + '"' + (marks ? ' style="border-color:' + (marks[c.id] ? '#9fd0b4' : '#eab3b1') + '"' : '') + '>' +
          '<strong style="font-weight:500">' + t(c.title) + '</strong><span class="help-text">' + t(c.note) + '</span>' +
          '<label class="visually-hidden" for="' + key + c.id + '">نقل «' + esc(c.title) + '» إلى</label><select class="select select-sm" id="' + key + c.id + '" data-move="' + c.id + '">' +
          STATUSES.map(o => '<option value="' + o.key + '"' + (o.key === pos[c.id] ? ' selected' : '') + ' dir="ltr">' + o.en + '</option>').join('') + '</select></div>').join('') +
        '</div>').join('') + '</div><div class="ex-actions"><button type="button" class="btn btn-primary" data-check>تحقق من اللوحة</button><span class="help-text">اسحب البطاقة، أو غيّر قائمة الحالة داخلها.</span></div><div data-fb></div>';
    };
    draw();
    root.onchange = e => { const id = e.target.dataset.move; if (!id) return; pos[id] = e.target.value; marks = null; draw(); const s = root.querySelector('[data-move="' + id + '"]'); if (s) s.focus(); announce('نُقلت البطاقة إلى ' + STATUS[pos[id]].en); };
    root.ondragstart = e => { const c = e.target.closest('[data-card]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.card); e.dataTransfer.effectAllowed = 'move'; } };
    root.ondragover = e => { const col = e.target.closest('[data-col]'); if (col) { e.preventDefault(); col.style.boxShadow = 'inset 0 0 0 2px var(--accent)'; } };
    root.ondragleave = e => { const col = e.target.closest('[data-col]'); if (col) col.style.boxShadow = ''; };
    root.ondrop = e => { const col = e.target.closest('[data-col]'); if (!col) return; e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (pos[id]) { pos[id] = col.dataset.col; marks = null; draw(); } };
    root.onclick = e => {
      if (!e.target.closest('[data-check]')) return;
      marks = Object.fromEntries(ex.cards.map(c => [c.id, pos[c.id] === c.target]));
      const n = Object.values(marks).filter(Boolean).length;
      draw();
      $('[data-fb]', root).innerHTML = n === ex.cards.length ? feedbackHTML('ok', 'اللوحة تطابق ما قيل في الاجتماع.') : feedbackHTML('bad', n + ' من ' + ex.cards.length + ' في العمود الصحيح. اقرأ الملاحظة داخل كل بطاقة.');
      if (n === ex.cards.length) solved();
    };
  },

  builder(root, ex, key, solved, head) {
    const val = {};
    root.innerHTML = head + '<div class="builder">' + ex.slots.map(s => {
      const id = key + '-b-' + s.key;
      return '<div class="builder-slot"><label class="slot-k" for="' + id + '">' + t(s.label) + '</label><select class="select" id="' + id + '" data-slot="' + s.key + '"><option value="">اختر...</option>' +
        seededShuffle(s.options, key + s.key).map(o => '<option>' + esc(o) + '</option>').join('') + '</select></div>';
    }).join('') + '</div>' + (ex.preview ? '<div data-preview></div>' : '') +
      '<div class="ex-actions"><button type="button" class="btn btn-primary" data-check>تحقق</button></div><div data-fb></div>';
    const pv = () => { if (ex.preview && PREVIEWS[ex.preview]) $('[data-preview]', root).innerHTML = PREVIEWS[ex.preview](val); };
    root.onchange = e => { const k = e.target.dataset.slot; if (!k) return; val[k] = e.target.value; e.target.removeAttribute('aria-invalid'); pv(); };
    pv();
    root.onclick = e => {
      if (!e.target.closest('[data-check]')) return;
      const fb = $('[data-fb]', root);
      const missing = ex.slots.filter(s => !val[s.key]).length;
      if (missing) { fb.innerHTML = feedbackHTML('info', 'أكمل كل الاختيارات أولاً (' + missing + ' متبقية).'); return; }
      const wrong = ex.slots.filter(s => val[s.key] !== s.answer);
      $$('[data-slot]', root).forEach(sel => { const s = ex.slots.find(x => x.key === sel.dataset.slot); sel.setAttribute('aria-invalid', val[s.key] !== s.answer ? 'true' : 'false'); sel.style.borderColor = val[s.key] !== s.answer ? 'var(--err)' : 'var(--ok)'; });
      if (!wrong.length) { fb.innerHTML = feedbackHTML('ok', t(ex.success || 'إعداد صحيح.')); solved(); }
      else fb.innerHTML = feedbackHTML('bad', 'يحتاج ' + (wrong.length === 1 ? 'اختيار واحد' : wrong.length + ' اختيارات') + ' إلى مراجعة: ' + wrong.map(w => '«' + t(w.label) + '»').join('، ') + '.');
    };
  }
};

/* Live previews for builder activities */
const PREVIEWS = {
  filterList(v) {
    const base = todayISO();
    const rows = [
      ['تحديث لوحة المؤشرات', 'مريم', 'Urgent', 2], ['تدقيق عقود الموردين', 'مريم', 'Urgent', 5], ['جمع أرقام مركز الاتصال', 'مريم', 'Normal', 1],
      ['إغلاق ملاحظة التدقيق 9', 'سالم', 'Urgent', 3], ['تنسيق عرض الإدارة', 'نورة', 'High', 4], ['خطة نقل المعرفة', 'مريم', 'High', 7]
    ].map(r => ({ title: r[0], who: r[1], pr: r[2], due: addDays(base, r[3]) }));
    let out = rows.filter(r => (!v.assignee || v.assignee === 'الكل' || r.who === v.assignee) && (!v.priority || v.priority === 'الكل' || r.pr === v.priority));
    if (v.sort === 'Due date') out.sort((a, b) => a.due.localeCompare(b.due));
    if (v.sort === 'Task name') out.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    return '<div class="builder-preview"><p class="field-label" style="margin-bottom:6px">معاينة العرض (' + out.length + ' مهام)</p><table class="formula-table"><thead><tr><th>المهمة</th><th>المسؤول</th><th>Priority</th><th>Due date</th></tr></thead><tbody>' +
      out.map(r => '<tr><td>' + t(r.title) + '</td><td>' + t(r.who) + '</td><td dir="ltr">' + r.pr + '</td><td class="num">' + fmtDate(r.due) + '</td></tr>').join('') + '</tbody></table></div>';
  },
  formula(v) {
    const rows = [['طلب تقرير مبيعات الباقات', 0, 4], ['تحديث نموذج الإجازات', 1, 8], ['تدقيق عقود الموردين', -4, 10]].map(r => ({ name: r[0], start: addDays(todayISO(), r[1]), due: addDays(todayISO(), r[2]) }));
    const fn = v.fn || 'DAYS', a = v.a || '…', b = v.b || '…';
    const text = fn === 'TODAY' ? 'TODAY()' : fn + '(' + a + ', ' + b + ')';
    const valOf = (arg, r) => arg === 'field("Due date")' ? r.due : arg === 'field("Start date")' ? r.start : arg === 'TODAY()' ? todayISO() : null;
    const cell = r => {
      if (fn === 'TODAY') return fmtDate(todayISO()) + ' <span class="muted small">(تاريخ، لا عدد أيام)</span>';
      const A = valOf(v.a, r), B = valOf(v.b, r);
      if (!A || !B) return '<span class="muted">-</span>';
      const d = daysBetween(B, A);
      return '<b class="num" style="color:' + (d < 0 ? 'var(--err)' : d === 0 ? 'var(--warn)' : 'var(--ink)') + '">' + d + '</b>';
    };
    return '<div class="builder-preview" style="display:grid;gap:10px"><div class="formula-box" aria-label="المعادلة">' + esc(text) + '</div>' +
      '<table class="formula-table"><thead><tr><th>Task</th><th>Start date</th><th>Due date</th><th>النتيجة</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td>' + t(r.name) + '</td><td class="num">' + fmtDate(r.start) + '</td><td class="num">' + fmtDate(r.due) + '</td><td>' + cell(r) + '</td></tr>').join('') + '</tbody></table>' +
      '<p class="help-text">الأرقام السالبة تعني أن ترتيب المدخلات معكوس. الصفر يعني المدخلين التاريخ نفسه.</p></div>';
  },
  automation(v) {
    const sample = [['طلب طباعة بطاقات', 'Urgent'], ['طلب تحديث بيانات موظف', 'Normal'], ['طلب تقرير عاجل للإدارة', 'Urgent']];
    const when = v.trigger === 'Task created' ? 'عند إنشاء مهمة' : v.trigger === 'Status changes' ? 'عند تغيّر الحالة' : v.trigger === 'Due date arrives' ? 'عند حلول تاريخ الاستحقاق' : '...';
    const cond = !v.cond ? '...' : v.cond === 'بدون شرط' ? 'دون شرط' : 'إذا ' + v.cond;
    const act = v.action ? 'نفّذ: ' + v.action : '...';
    let sim = '';
    if (v.trigger === 'Task created' && v.cond && v.action) {
      sim = '<ul class="goal-list" style="margin-top:8px">' + sample.map(s => {
        const run = v.cond === 'بدون شرط' || (v.cond === 'Priority is Urgent' && s[1] === 'Urgent');
        return '<li class="' + (run ? 'met' : '') + '"><span class="gtick">' + (run ? icon('check') : '') + '</span><span>' + t(s[0]) + ' <bdi dir="ltr">(' + s[1] + ')</bdi>: ' + (run ? t(v.action) : 'تُخطيت') + '</span></li>';
      }).join('') + '</ul>';
    }
    return '<div class="builder-preview"><p><strong>' + t(when) + '</strong>، ' + t(cond) + '، ' + t(act) + '.</p>' + (sim ? '<p class="help-text" style="margin-top:8px">محاكاة على ثلاثة طلبات جديدة:</p>' + sim : '') + '</div>';
  },
  card(v) {
    const data = { 'طلبات داخلية': { Assignee: [['مريم', 4], ['سالم', 2], ['نورة', 3]], Status: [['TO DO', 5], ['IN PROGRESS', 3], ['COMPLETE', 6]], 'Due date': [['هذا الأسبوع', 4], ['الأسبوع القادم', 5]] },
      'كل مساحة العمل': { Assignee: [['مريم', 11], ['سالم', 7], ['نورة', 9], ['خالد', 5]], Status: [['TO DO', 14], ['IN PROGRESS', 9], ['COMPLETE', 22]], 'Due date': [['هذا الأسبوع', 12], ['الأسبوع القادم', 10]] },
      'التقارير الأسبوعية': { Assignee: [['مريم', 3], ['نورة', 1]], Status: [['TO DO', 2], ['IN PROGRESS', 2], ['COMPLETE', 5]], 'Due date': [['هذا الأسبوع', 3], ['الأسبوع القادم', 1]] } };
    if (!v.loc || !v.group) return '<div class="builder-preview muted">اختر مصدر البيانات والتجميع لرؤية المعاينة.</div>';
    let rows = data[v.loc][v.group].slice();
    if (v.filter === 'المهام المفتوحة فقط' && v.group === 'Status') rows = rows.filter(r => r[0] !== 'COMPLETE');
    if (v.filter === 'المغلقة فقط' && v.group === 'Status') rows = rows.filter(r => r[0] === 'COMPLETE');
    if (v.filter === 'كل المهام' && v.group === 'Assignee') rows = rows.map(r => [r[0], r[1] + 2]);
    if (v.filter === 'المغلقة فقط' && v.group === 'Assignee') rows = rows.map(r => [r[0], 2]);
    const max = Math.max.apply(null, rows.map(r => r[1]).concat(1));
    return '<div class="builder-preview"><p class="field-label" style="margin-bottom:8px">' + t(v.type || 'Card') + ': ' + t(v.loc) + '، حسب ' + t(v.group) + (v.filter ? '، ' + t(v.filter) : '') + '</p>' +
      rows.map(r => '<div style="display:grid;grid-template-columns:110px 1fr 30px;gap:8px;align-items:center;margin-bottom:4px"><span class="small">' + t(r[0]) + '</span><span style="height:14px;border-radius:0 4px 4px 0;background:var(--c1);width:' + (r[1] / max * 100) + '%"></span><b class="num small">' + r[1] + '</b></div>').join('') + '</div>';
  },
  share(v) {
    if (!v.what) return '<div class="builder-preview muted">اختر ما تريد مشاركته لرؤية النتيجة.</div>';
    const scope = v.what === 'المهمة فقط' ? 'يرى المستشار مهمة «مراجعة عقد المورد» وحدها' : v.what === 'القائمة كاملة' ? 'يرى المستشار كل مهام «إجراءات التدقيق» الحساسة' : 'يرى المستشار كل ما في Space العمليات';
    const risk = v.what !== 'المهمة فقط';
    const perm = v.perm ? { 'View only': 'يشاهد فقط', 'Comment': 'يشاهد ويعلّق', 'Edit': 'يعدّل البيانات', 'Full edit': 'يعدّل بالكامل' }[v.perm] : '...';
    return '<div class="builder-preview" style="display:grid;gap:6px"><p>' + icon(risk ? 'alert' : 'lock', 'icon-sm') + ' ' + t(scope) + '، و' + t(perm) + '.</p>' +
      (risk ? '<p class="small" style="color:var(--err)">هذا أوسع من الحاجة ويكشف بيانات لا تخصه.</p>' : '') +
      (v.role === 'Member' || v.role === 'Admin' ? '<p class="small" style="color:var(--err)">شخص من خارج المؤسسة يُدعى ضيفاً (Guest)، لا عضواً.</p>' : '') + '</div>';
  }
};

/* ---------- Quiz (lesson checks, module quizzes, final) ---------- */
function renderQuiz(root, questions, key, opts) {
  opts = opts || {};
  let attempt = opts.attempt || 0;
  const draw = () => {
    const seed = key + ':' + attempt;
    root.innerHTML = '<div class="quiz">' + questions.map((q, qi) => {
      const order = seededShuffle(q.options.map((_, i) => i), seed + qi);
      return '<div class="panel q-block" data-q="' + qi + '"><fieldset><legend class="q-title"><span class="q-num">سؤال ' + (qi + 1) + ' من ' + questions.length + '</span><br>' + t(q.q) + '</legend>' +
        order.map(i => '<label class="opt"><input type="radio" name="' + esc(key) + '-q' + qi + '" value="' + i + '"><span>' + t(q.options[i]) + '</span></label>').join('') +
        '</fieldset><div class="q-why" data-why></div></div>';
    }).join('') + '</div>' +
      '<div class="ex-actions" style="margin-top:14px"><button type="button" class="btn btn-primary" data-submit>' + (opts.submitLabel || 'تحقق من إجاباتي') + '</button><span data-msg class="help-text" role="status"></span></div><div data-result></div>';
  };
  draw();
  root.onclick = e => {
    if (e.target.closest('[data-retry]')) { attempt++; draw(); const f = root.querySelector('input'); if (f) f.focus(); return; }
    if (!e.target.closest('[data-submit]')) return;
    const answers = questions.map((q, qi) => { const s = root.querySelector('input[name="' + CSS.escape(key + '-q' + qi) + '"]:checked'); return s ? +s.value : null; });
    const missing = answers.filter(a => a === null).length;
    if (missing) { $('[data-msg]', root).textContent = 'أجب عن كل الأسئلة أولاً (' + missing + ' متبقية).'; const first = answers.indexOf(null); root.querySelector('[data-q="' + first + '"] input').focus(); return; }
    let score = 0;
    questions.forEach((q, qi) => {
      const block = root.querySelector('[data-q="' + qi + '"]'); const ok = answers[qi] === q.answer; if (ok) score++;
      $$('input', block).forEach(inp => {
        inp.disabled = true;
        const l = inp.closest('.opt');
        if (+inp.value === q.answer) l.classList.add('correct');
        else if (inp.checked) l.classList.add('wrong');
      });
      $('[data-why]', block).innerHTML = feedbackHTML(ok ? 'ok' : 'bad', (ok ? 'إجابة صحيحة. ' : 'الإجابة الصحيحة: «' + t(q.options[q.answer]) + '». ') + t(q.why));
    });
    $('[data-submit]', root).hidden = true;
    $('[data-msg]', root).textContent = '';
    const pass = opts.pass || 0;
    const passed = score / questions.length >= pass;
    $('[data-result]', root).innerHTML = '<div class="panel score-card" style="margin-top:16px"><div class="score-big">' + score + '<span class="muted" style="font-size:1.2rem"> / ' + questions.length + '</span></div>' +
      '<div style="display:grid;gap:4px"><span class="verdict" style="color:' + (passed ? 'var(--ok)' : 'var(--warn)') + '">' + (opts.pass ? (passed ? 'اجتزت هذا التقييم' : 'لم تصل بعد إلى ' + Math.round(pass * 100) + '%') : (score === questions.length ? 'ممتاز، كل الإجابات صحيحة' : 'راجع الشرح تحت كل سؤال')) + '</span>' +
      '<span class="help-text">' + (opts.resultNote || 'يمكنك إعادة المحاولة في أي وقت. يُحفظ أفضل نتيجة وآخر نتيجة على هذا الجهاز.') + '</span></div>' +
      '<button type="button" class="btn btn-secondary" data-retry>' + icon('reset') + 'إعادة المحاولة</button></div>';
    $('[data-result]', root).querySelector('.score-card').scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    announce('النتيجة ' + score + ' من ' + questions.length);
    if (opts.onSubmit) opts.onSubmit(score, questions.length);
  };
}
