/* ==========================================================================
   Practice activities and knowledge checks. Every activity validates the
   learner's actual input; nothing is marked done by simply visiting.
   Answers are stored as indexes into the shared content model, so the same
   answer stays selected when the learner switches language.
   ========================================================================== */

function feedbackHTML(kind, html) {
  if (kind === 'ok') Sound.play('success'); else if (kind === 'bad') Sound.play('error');
  const ic = kind === 'ok' ? 'check-circle' : kind === 'bad' ? 'x-circle' : 'info';
  return '<div class="feedback ' + kind + '" role="status">' + icon(ic) + '<div>' + html + '</div></div>';
}
const words = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const Q = s => tx('«' + s + '»', '“' + s + '”');

/* Builder answers are compared in the canonical (authored) option list so
   previews behave identically in both languages. Captured before any overlay. */
LESSONS.forEach(l => { if (l.exercise && l.exercise.type === 'builder') l.exercise.slots.forEach(s => { s.canon = s.options.slice(); }); });

function renderExercise(root, ex, key, onSolved) {
  const solved = () => { if (onSolved) onSolved(); };
  const head = '<div class="ex-task"><h3>' + icon('flask') + tx('نشاط تطبيقي', 'Practice activity') + '</h3><p>' + t(ex.prompt) + '</p></div>';
  const R = EX_RENDER[ex.type];
  if (!R) { root.innerHTML = head; return; }
  root.classList.add('exercise');
  const state = UIState.get('ex:' + key) || {};
  UIState.set('ex:' + key, state);
  R(root, ex, key, solved, head, state);
}

const EX_RENDER = {
  order(root, ex, key, solved, head, S) {
    if (!S.order) { S.order = seededShuffle(ex.items.map((_, i) => i), key + 'o'); if (S.order.every((v, i) => v === i)) S.order.reverse(); }
    const order = S.order;
    const draw = (marks) => {
      root.innerHTML = head + '<ol class="order-list" aria-label="' + tx('العناصر بالترتيب الحالي', 'Items in their current order') + '">' + order.map((idx, pos) =>
        '<li class="order-item' + (marks ? (marks[pos] ? ' ok' : ' bad') : '') + '"><span>' + t(ex.items[idx]) + '</span><span class="order-btns">' +
        '<button type="button" class="icon-btn" data-mv="-1" data-pos="' + pos + '" aria-label="' + tx('انقل ' + Q(esc(ex.items[idx])) + ' للأعلى', 'Move ' + Q(esc(ex.items[idx])) + ' up') + '"' + (pos === 0 ? ' disabled' : '') + '>' + icon('up') + '</button>' +
        '<button type="button" class="icon-btn" data-mv="1" data-pos="' + pos + '" aria-label="' + tx('انقل ' + Q(esc(ex.items[idx])) + ' للأسفل', 'Move ' + Q(esc(ex.items[idx])) + ' down') + '"' + (pos === order.length - 1 ? ' disabled' : '') + '>' + icon('down') + '</button></span></li>').join('') + '</ol>' +
        '<div class="ex-actions"><button type="button" class="btn btn-primary" data-check>' + tx('تحقق من الترتيب', 'Check the order') + '</button></div><div data-fb></div>';
    };
    const check = () => {
      const marks = order.map((v, i) => v === i);
      draw(marks);
      const n = marks.filter(Boolean).length;
      $('[data-fb]', root).innerHTML = n === order.length
        ? feedbackHTML('ok', tx('ترتيب صحيح بالكامل. أحسنت.', 'Completely correct order. Well done.'))
        : feedbackHTML('bad', tx(n + ' من ' + order.length + ' في موضعها الصحيح. العناصر المظللة بالأحمر تحتاج نقلاً.', n + ' of ' + order.length + ' are in the right position. Items highlighted in red need moving.'));
      if (n === order.length) solved();
    };
    if (S.checked) check(); else draw();
    root.onclick = e => {
      const mv = e.target.closest('[data-mv]');
      if (mv) {
        const p = +mv.dataset.pos, d = +mv.dataset.mv, q = p + d;
        [order[p], order[q]] = [order[q], order[p]];
        S.checked = false; draw();
        const btn = root.querySelector('[data-pos="' + q + '"][data-mv="' + d + '"]') || root.querySelector('[data-pos="' + q + '"]');
        if (btn) btn.focus();
        announce(tx('نُقل العنصر إلى الموضع ' + (q + 1), 'Item moved to position ' + (q + 1)));
        return;
      }
      if (e.target.closest('[data-check]')) { S.checked = true; check(); }
    };
  },

  match(root, ex, key, solved, head, S) {
    S.sel = S.sel || {};
    const choiceOrder = seededShuffle(ex.choices.map((_, i) => i), key + 'm');
    const rows = seededShuffle(ex.pairs.map((p, i) => i), key + 'r');
    const correctIdx = i => ex.choices.indexOf(ex.pairs[i][1]);
    root.innerHTML = head + '<div class="match">' + rows.map(i => {
      const id = key + '-m' + i;
      return '<div class="match-row" data-i="' + i + '"><label class="term" for="' + id + '">' + t(ex.pairs[i][0]) + '</label>' +
        '<select class="select" id="' + id + '"><option value="">' + tx('اختر...', 'Choose...') + '</option>' + choiceOrder.map(c => '<option value="' + c + '"' + (S.sel[i] === c ? ' selected' : '') + '>' + esc(ex.choices[c]) + '</option>').join('') + '</select>' +
        '<span class="res" aria-hidden="true"></span></div>';
    }).join('') + '</div><div class="ex-actions"><button type="button" class="btn btn-primary" data-check>' + tx('تحقق', 'Check') + '</button></div><div data-fb></div>';
    const check = () => {
      let ok = 0, empty = 0;
      $$('.match-row', root).forEach(r => {
        const i = +r.dataset.i, v = $('select', r).value, res = $('.res', r);
        if (v === '') { empty++; res.className = 'res'; res.innerHTML = ''; return; }
        const good = +v === correctIdx(i);
        if (good) ok++;
        res.className = 'res ' + (good ? 'ok' : 'bad');
        res.innerHTML = icon(good ? 'check' : 'x');
        $('select', r).setAttribute('aria-invalid', good ? 'false' : 'true');
      });
      const fb = $('[data-fb]', root);
      if (empty) { fb.innerHTML = feedbackHTML('info', tx('اختر إجابة لكل عنصر أولاً (' + empty + ' متبقية).', 'Choose an answer for every item first (' + empty + ' left).')); return; }
      if (ok === ex.pairs.length) { fb.innerHTML = feedbackHTML('ok', tx('كل المطابقات صحيحة.', 'All matches are correct.')); solved(); }
      else fb.innerHTML = feedbackHTML('bad', tx(ok + ' من ' + ex.pairs.length + ' صحيحة. راجع العناصر المعلّمة ثم حاول مجدداً.', ok + ' of ' + ex.pairs.length + ' are correct. Review the marked items and try again.'));
    };
    if (S.checked) check();
    root.onchange = e => { const r = e.target.closest('.match-row'); if (!r) return; S.sel[r.dataset.i] = e.target.value === '' ? undefined : +e.target.value; };
    root.onclick = e => { if (e.target.closest('[data-check]')) { S.checked = true; check(); } };
  },

  choice(root, ex, key, solved, head, S) {
    const opts = seededShuffle(ex.options.map((o, i) => i), key + 'c');
    const name = key + '-ch';
    root.innerHTML = head + '<fieldset style="border:0;margin:0;padding:0;display:grid;gap:8px"><legend class="visually-hidden">' + tx('اختر الإجابة', 'Choose the answer') + '</legend>' + opts.map(i =>
      '<label class="opt"><input type="radio" name="' + name + '" value="' + i + '"' + (S.sel === i ? ' checked' : '') + '><span>' + t(ex.options[i].t) + '</span></label>').join('') + '</fieldset>' +
      '<div class="ex-actions"><button type="button" class="btn btn-primary" data-check>' + tx('تحقق', 'Check') + '</button></div><div data-fb></div>';
    const check = () => {
      const sel = $('input[name="' + name + '"]:checked', root); const fb = $('[data-fb]', root);
      if (!sel) { fb.innerHTML = feedbackHTML('info', tx('اختر إجابة أولاً.', 'Choose an answer first.')); return; }
      const o = ex.options[+sel.value];
      $$('.opt', root).forEach(l => l.classList.remove('correct', 'wrong'));
      sel.closest('.opt').classList.add(o.ok ? 'correct' : 'wrong');
      fb.innerHTML = feedbackHTML(o.ok ? 'ok' : 'bad', t(o.fb) + (o.ok ? '' : tx(' حاول مرة أخرى.', ' Try again.')));
      if (o.ok) solved();
    };
    if (S.checked) check();
    root.onchange = e => { if (e.target.name === name) { S.sel = +e.target.value; } };
    root.onclick = e => { if (e.target.closest('[data-check]')) { S.checked = true; check(); } };
  },

  taskSim(root, ex, key, solved, head, S) {
    if (!S.st) S.st = Object.assign({}, ex.start);
    const st = S.st;
    const f = ex.fields;
    const today = todayISO();
    const fld = (name, html) => '<div class="field' + (name === 'title' || name === 'desc' ? ' full' : '') + '">' + html + '</div>';
    const lbl = (ar, en) => isEN() ? en : ar + ' <bdi class="en" dir="ltr">' + en + '</bdi>';
    let form = '';
    if (ex.start.title && !f.includes('title')) form += '<div class="full"><strong>' + t(ex.start.title) + '</strong></div>';
    if (f.includes('title')) form += fld('title', '<label for="' + key + '-ti">' + lbl('عنوان المهمة', 'Task name') + '</label><input class="input" id="' + key + '-ti" data-f="title" value="' + esc(st.title || '') + '" placeholder="' + tx('ابدأ بفعل، مثل: تحضير...', 'Start with a verb, for example: Prepare...') + '">');
    if (f.includes('desc')) form += fld('desc', '<label for="' + key + '-de">' + lbl('الوصف', 'Description') + '</label><textarea class="textarea" id="' + key + '-de" data-f="desc" placeholder="' + tx('المطلوب: ... يُعدّ منجزاً عندما: ...', 'Required: ... Done when: ...') + '">' + esc(st.desc || '') + '</textarea>');
    if (f.includes('status')) form += fld('status', '<label for="' + key + '-st">' + lbl('الحالة', 'Status') + '</label><select class="select" id="' + key + '-st" data-f="status">' + STATUSES.map(s => '<option value="' + s.key + '"' + (st.status === s.key ? ' selected' : '') + ' dir="ltr">' + s.en + '</option>').join('') + '</select>');
    if (f.includes('assignee')) form += fld('assignee', '<label for="' + key + '-as">' + lbl('المسؤول', 'Assignee') + '</label><select class="select" id="' + key + '-as" data-f="assignee"><option value="">' + tx('بدون مسؤول', 'No assignee') + '</option>' + PEOPLE.map(p => '<option value="' + p.id + '"' + (st.assignee === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select>');
    if (f.includes('priority')) form += fld('priority', '<label for="' + key + '-pr">' + lbl('الأولوية', 'Priority') + '</label><select class="select" id="' + key + '-pr" data-f="priority"><option value="">' + tx('بدون', 'None') + '</option>' + PRIORITIES.map(p => '<option value="' + p.key + '"' + (st.priority === p.key ? ' selected' : '') + ' dir="ltr">' + p.en + '</option>').join('') + '</select>');
    if (f.includes('start')) form += fld('start', '<label for="' + key + '-sd">' + lbl('تاريخ البدء', 'Start date') + '</label><input type="date" class="input" id="' + key + '-sd" data-f="start" value="' + esc(st.start || '') + '">');
    if (f.includes('due')) form += fld('due', '<label for="' + key + '-dd">' + lbl('تاريخ الاستحقاق', 'Due date') + '</label><input type="date" class="input" id="' + key + '-dd" data-f="due" value="' + esc(st.due || '') + '">');
    root.innerHTML = head + '<div class="sim-task">' + form + '</div>' +
      '<div><p class="field-label" style="margin-bottom:6px">' + tx('المطلوب لإكمال النشاط', 'What you need to complete the activity') + '</p><ul class="goal-list" data-goals></ul></div><div data-fb></div>';
    const test = g => {
      const v = g.field === 'dates' ? null : String(st[g.field] || '');
      if (g.minWords) return words(v) >= g.minWords;
      if (g.anyOf) { const lv = v.toLowerCase(); return g.anyOf.concat(g.alt || []).some(w => lv.includes(w.toLowerCase())); }
      if (g.eq != null) return v === g.eq;
      if (g.valid) return !!st.start && !!st.due && st.start <= today && st.due > st.start;
      return false;
    };
    let announced = false;
    const paint = () => {
      const res = ex.goals.map(g => test(g.test));
      $('[data-goals]', root).innerHTML = ex.goals.map((g, i) => '<li class="' + (res[i] ? 'met' : '') + '"><span class="gtick">' + (res[i] ? icon('check') : '') + '</span><span>' + t(g.text) + '<span class="visually-hidden">' + (res[i] ? tx(' (مكتمل)', ' (done)') : tx(' (غير مكتمل)', ' (not done)')) + '</span></span></li>').join('');
      if (res.every(Boolean)) {
        if (!announced) { announced = true; $('[data-fb]', root).innerHTML = feedbackHTML('ok', tx('اكتملت كل المتطلبات. هذه مهمة يفهمها أي زميل.', 'Every requirement is met. Any colleague would understand this task.')); solved(); }
      } else if (announced) { announced = false; $('[data-fb]', root).innerHTML = ''; }
    };
    root.oninput = root.onchange = e => { const k = e.target.dataset.f; if (!k) return; st[k] = e.target.value; paint(); };
    paint();
  },

  board(root, ex, key, solved, head, S) {
    if (!S.pos) S.pos = Object.fromEntries(ex.cards.map(c => [c.id, c.status]));
    const pos = S.pos;
    let marks = S.checked ? Object.fromEntries(ex.cards.map(c => [c.id, pos[c.id] === c.target])) : null;
    const draw = () => {
      root.innerHTML = head + '<div class="mini-board">' + STATUSES.map(s =>
        '<div class="mini-col" data-col="' + s.key + '"><h4><span class="status-badge st-' + s.key + '">' + s.en + '</span></h4>' +
        ex.cards.filter(c => pos[c.id] === s.key).map(c => '<div class="mini-card" draggable="true" data-card="' + c.id + '"' + (marks ? ' style="border-color:' + (marks[c.id] ? '#9fd0b4' : '#eab3b1') + '"' : '') + '>' +
          '<strong style="font-weight:500">' + t(c.title) + '</strong><span class="help-text">' + t(c.note) + '</span>' +
          '<label class="visually-hidden" for="' + key + c.id + '">' + tx('نقل ' + Q(esc(c.title)) + ' إلى', 'Move ' + Q(esc(c.title)) + ' to') + '</label><select class="select select-sm" id="' + key + c.id + '" data-move="' + c.id + '">' +
          STATUSES.map(o => '<option value="' + o.key + '"' + (o.key === pos[c.id] ? ' selected' : '') + ' dir="ltr">' + o.en + '</option>').join('') + '</select></div>').join('') +
        '</div>').join('') + '</div><div class="ex-actions"><button type="button" class="btn btn-primary" data-check>' + tx('تحقق من اللوحة', 'Check the board') + '</button><span class="help-text">' + tx('اسحب البطاقة، أو غيّر قائمة الحالة داخلها.', 'Drag a card, or change the status menu inside it.') + '</span></div><div data-fb></div>';
      if (marks) {
        const n = Object.values(marks).filter(Boolean).length;
        $('[data-fb]', root).innerHTML = n === ex.cards.length ? feedbackHTML('ok', tx('اللوحة تطابق ما قيل في الاجتماع.', 'The board matches what was said in the meeting.')) : feedbackHTML('bad', tx(n + ' من ' + ex.cards.length + ' في العمود الصحيح. اقرأ الملاحظة داخل كل بطاقة.', n + ' of ' + ex.cards.length + ' are in the right column. Read the note inside each card.'));
        if (n === ex.cards.length) solved();
      }
    };
    const moved = () => { marks = null; S.checked = false; };
    draw();
    root.onchange = e => { const id = e.target.dataset.move; if (!id) return; pos[id] = e.target.value; moved(); draw(); const s = root.querySelector('[data-move="' + id + '"]'); if (s) s.focus(); announce(tx('نُقلت البطاقة إلى ', 'Card moved to ') + STATUS[pos[id]].en); };
    root.ondragstart = e => { const c = e.target.closest('[data-card]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.card); e.dataTransfer.effectAllowed = 'move'; } };
    root.ondragover = e => { const col = e.target.closest('[data-col]'); if (col) { e.preventDefault(); col.style.boxShadow = 'inset 0 0 0 2px var(--accent)'; } };
    root.ondragleave = e => { const col = e.target.closest('[data-col]'); if (col) col.style.boxShadow = ''; };
    root.ondrop = e => { const col = e.target.closest('[data-col]'); if (!col) return; e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (pos[id]) { pos[id] = col.dataset.col; moved(); draw(); } };
    root.onclick = e => {
      if (!e.target.closest('[data-check]')) return;
      S.checked = true; marks = Object.fromEntries(ex.cards.map(c => [c.id, pos[c.id] === c.target]));
      draw();
    };
  },

  builder(root, ex, key, solved, head, S) {
    S.val = S.val || {};
    const val = S.val; // slot key -> option index
    const answerIdx = s => s.options.indexOf(s.answer);
    const pvArgs = () => {
      const v = {}, lbl = {};
      ex.slots.forEach(s => { if (val[s.key] != null) { v[s.key] = s.canon[val[s.key]]; lbl[s.key] = s.options[val[s.key]]; } });
      return [v, lbl];
    };
    root.innerHTML = head + '<div class="builder">' + ex.slots.map(s => {
      const id = key + '-b-' + s.key;
      return '<div class="builder-slot"><label class="slot-k" for="' + id + '">' + t(s.label) + '</label><select class="select" id="' + id + '" data-slot="' + s.key + '"><option value="">' + tx('اختر...', 'Choose...') + '</option>' +
        seededShuffle(s.options.map((_, i) => i), key + s.key).map(i => '<option value="' + i + '"' + (val[s.key] === i ? ' selected' : '') + '>' + esc(s.options[i]) + '</option>').join('') + '</select></div>';
    }).join('') + '</div>' + (ex.preview ? '<div data-preview></div>' : '') +
      '<div class="ex-actions"><button type="button" class="btn btn-primary" data-check>' + tx('تحقق', 'Check') + '</button></div><div data-fb></div>';
    const pv = () => { if (ex.preview && PREVIEWS[ex.preview]) $('[data-preview]', root).innerHTML = PREVIEWS[ex.preview].apply(null, pvArgs()); };
    const check = () => {
      const fb = $('[data-fb]', root);
      const missing = ex.slots.filter(s => val[s.key] == null).length;
      if (missing) { fb.innerHTML = feedbackHTML('info', tx('أكمل كل الاختيارات أولاً (' + missing + ' متبقية).', 'Complete every choice first (' + missing + ' left).')); return; }
      const bad = s => val[s.key] !== answerIdx(s);
      const wrong = ex.slots.filter(bad);
      $$('[data-slot]', root).forEach(sel => { const s = ex.slots.find(x => x.key === sel.dataset.slot); sel.setAttribute('aria-invalid', bad(s) ? 'true' : 'false'); sel.style.borderColor = bad(s) ? 'var(--err)' : 'var(--ok)'; });
      if (!wrong.length) { fb.innerHTML = feedbackHTML('ok', t(ex.success || tx('إعداد صحيح.', 'Correct setup.'))); solved(); }
      else fb.innerHTML = feedbackHTML('bad', tx('يحتاج ' + (wrong.length === 1 ? 'اختيار واحد' : wrong.length + ' اختيارات') + ' إلى مراجعة: ', (wrong.length === 1 ? 'One choice needs' : wrong.length + ' choices need') + ' another look: ') + wrong.map(w => Q(t(w.label))).join(tx('، ', ', ')) + '.');
    };
    root.onchange = e => { const k = e.target.dataset.slot; if (!k) return; val[k] = e.target.value === '' ? undefined : +e.target.value; e.target.removeAttribute('aria-invalid'); e.target.style.borderColor = ''; pv(); };
    pv();
    if (S.checked) check();
    root.onclick = e => { if (e.target.closest('[data-check]')) { S.checked = true; check(); } };
  }
};

/* Live previews for builder activities. `v` holds canonical (authored) values
   used for logic; `lbl` holds the labels in the current language. */
const PERSON_BY_AR = { 'مريم': 'maryam', 'سالم': 'salim', 'نورة': 'noura', 'خالد': 'khalid' };
const pname = id => PERSON[id].short;
const PREVIEWS = {
  filterList(v) {
    const base = todayISO();
    const rows = [
      [tx('تحديث لوحة المؤشرات', 'Update the KPI dashboard'), 'maryam', 'Urgent', 2], [tx('تدقيق عقود الموردين', 'Audit supplier contracts'), 'maryam', 'Urgent', 5], [tx('جمع أرقام مركز الاتصال', 'Collect call centre figures'), 'maryam', 'Normal', 1],
      [tx('إغلاق ملاحظة التدقيق 9', 'Close audit finding 9'), 'salim', 'Urgent', 3], [tx('تنسيق عرض الإدارة', 'Format the management presentation'), 'noura', 'High', 4], [tx('خطة نقل المعرفة', 'Knowledge transfer plan'), 'maryam', 'High', 7]
    ].map(r => ({ title: r[0], who: r[1], pr: r[2], due: addDays(base, r[3]) }));
    const who = v.assignee && PERSON_BY_AR[v.assignee];
    let out = rows.filter(r => (!who || r.who === who) && (!v.priority || v.priority === 'الكل' || r.pr === v.priority));
    if (v.sort === 'Due date') out.sort((a, b) => a.due.localeCompare(b.due));
    if (v.sort === 'Task name') out.sort((a, b) => a.title.localeCompare(b.title, LANG));
    return '<div class="builder-preview"><p class="field-label" style="margin-bottom:6px">' + tx('معاينة العرض (' + out.length + ' مهام)', 'View preview (' + nEn(out.length, 'task') + ')') + '</p><table class="formula-table"><thead><tr><th>' + tx('المهمة', 'Task') + '</th><th>' + tx('المسؤول', 'Assignee') + '</th><th>Priority</th><th>Due date</th></tr></thead><tbody>' +
      out.map(r => '<tr><td>' + t(r.title) + '</td><td>' + t(pname(r.who)) + '</td><td dir="ltr">' + r.pr + '</td><td class="num">' + fmtDate(r.due) + '</td></tr>').join('') + '</tbody></table></div>';
  },
  formula(v) {
    const rows = [[tx('طلب تقرير مبيعات الباقات', 'Plan sales report request'), 0, 4], [tx('تحديث نموذج الإجازات', 'Update the leave form'), 1, 8], [tx('تدقيق عقود الموردين', 'Audit supplier contracts'), -4, 10]].map(r => ({ name: r[0], start: addDays(todayISO(), r[1]), due: addDays(todayISO(), r[2]) }));
    const fn = v.fn || 'DAYS', a = v.a || '…', b = v.b || '…';
    const text = fn === 'TODAY' ? 'TODAY()' : fn + '(' + a + ', ' + b + ')';
    const valOf = (arg, r) => arg === 'field("Due date")' ? r.due : arg === 'field("Start date")' ? r.start : arg === 'TODAY()' ? todayISO() : null;
    const cell = r => {
      if (fn === 'TODAY') return fmtDate(todayISO()) + ' <span class="muted small">' + tx('(تاريخ، لا عدد أيام)', '(a date, not a number of days)') + '</span>';
      const A = valOf(v.a, r), B = valOf(v.b, r);
      if (!A || !B) return '<span class="muted">-</span>';
      const d = daysBetween(B, A);
      return '<b class="num" style="color:' + (d < 0 ? 'var(--err)' : d === 0 ? 'var(--warn)' : 'var(--ink)') + '">' + d + '</b>';
    };
    return '<div class="builder-preview" style="display:grid;gap:10px"><div class="formula-box" aria-label="' + tx('المعادلة', 'Formula') + '">' + esc(text) + '</div>' +
      '<table class="formula-table"><thead><tr><th>Task</th><th>Start date</th><th>Due date</th><th>' + tx('النتيجة', 'Result') + '</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td>' + t(r.name) + '</td><td class="num">' + fmtDate(r.start) + '</td><td class="num">' + fmtDate(r.due) + '</td><td>' + cell(r) + '</td></tr>').join('') + '</tbody></table>' +
      '<p class="help-text">' + tx('الأرقام السالبة تعني أن ترتيب المدخلات معكوس. الصفر يعني المدخلين التاريخ نفسه.', 'Negative numbers mean the inputs are in reverse order. Zero means both inputs are the same date.') + '</p></div>';
  },
  automation(v, lbl) {
    const sample = [[tx('طلب طباعة بطاقات', 'Card printing request'), 'Urgent'], [tx('طلب تحديث بيانات موظف', 'Employee data update request'), 'Normal'], [tx('طلب تقرير عاجل للإدارة', 'Urgent report request for management'), 'Urgent']];
    const when = v.trigger === 'Task created' ? tx('عند إنشاء مهمة', 'When a task is created') : v.trigger === 'Status changes' ? tx('عند تغيّر الحالة', 'When the status changes') : v.trigger === 'Due date arrives' ? tx('عند حلول تاريخ الاستحقاق', 'When the due date arrives') : '...';
    const noCond = v.cond === 'بدون شرط';
    const cond = !v.cond ? '...' : noCond ? tx('دون شرط', 'with no condition') : tx('إذا ', 'if ') + lbl.cond;
    const act = v.action ? tx('نفّذ: ', 'then: ') + lbl.action : '...';
    let sim = '';
    if (v.trigger === 'Task created' && v.cond && v.action) {
      sim = '<ul class="goal-list" style="margin-top:8px">' + sample.map(s => {
        const run = noCond || (v.cond === 'Priority is Urgent' && s[1] === 'Urgent');
        return '<li class="' + (run ? 'met' : '') + '"><span class="gtick">' + (run ? icon('check') : '') + '</span><span>' + t(s[0]) + ' <bdi dir="ltr">(' + s[1] + ')</bdi>: ' + (run ? t(lbl.action) : tx('تُخطيت', 'skipped')) + '</span></li>';
      }).join('') + '</ul>';
    }
    return '<div class="builder-preview"><p><strong>' + t(when) + '</strong>' + tx('، ', ', ') + t(cond) + tx('، ', ', ') + t(act) + '.</p>' + (sim ? '<p class="help-text" style="margin-top:8px">' + tx('محاكاة على ثلاثة طلبات جديدة:', 'Simulated on three new requests:') + '</p>' + sim : '') + '</div>';
  },
  card(v, lbl) {
    const WEEK = [tx('هذا الأسبوع', 'This week'), tx('الأسبوع القادم', 'Next week')];
    const P = id => pname(id);
    const data = { 'طلبات داخلية': { Assignee: [[P('maryam'), 4], [P('salim'), 2], [P('noura'), 3]], Status: [['TO DO', 5], ['IN PROGRESS', 3], ['COMPLETE', 6]], 'Due date': [[WEEK[0], 4], [WEEK[1], 5]] },
      'كل مساحة العمل': { Assignee: [[P('maryam'), 11], [P('salim'), 7], [P('noura'), 9], [P('khalid'), 5]], Status: [['TO DO', 14], ['IN PROGRESS', 9], ['COMPLETE', 22]], 'Due date': [[WEEK[0], 12], [WEEK[1], 10]] },
      'التقارير الأسبوعية': { Assignee: [[P('maryam'), 3], [P('noura'), 1]], Status: [['TO DO', 2], ['IN PROGRESS', 2], ['COMPLETE', 5]], 'Due date': [[WEEK[0], 3], [WEEK[1], 1]] } };
    if (!v.loc || !v.group) return '<div class="builder-preview muted">' + tx('اختر مصدر البيانات والتجميع لرؤية المعاينة.', 'Choose a data source and grouping to see the preview.') + '</div>';
    let rows = data[v.loc][v.group].slice();
    if (v.filter === 'المهام المفتوحة فقط' && v.group === 'Status') rows = rows.filter(r => r[0] !== 'COMPLETE');
    if (v.filter === 'المغلقة فقط' && v.group === 'Status') rows = rows.filter(r => r[0] === 'COMPLETE');
    if (v.filter === 'كل المهام' && v.group === 'Assignee') rows = rows.map(r => [r[0], r[1] + 2]);
    if (v.filter === 'المغلقة فقط' && v.group === 'Assignee') rows = rows.map(r => [r[0], 2]);
    const max = Math.max.apply(null, rows.map(r => r[1]).concat(1));
    return '<div class="builder-preview"><p class="field-label" style="margin-bottom:8px">' + t(lbl.type || 'Card') + ': ' + t(lbl.loc) + tx('، حسب ', ', by ') + t(lbl.group) + (v.filter ? tx('، ', ', ') + t(lbl.filter) : '') + '</p>' +
      rows.map(r => '<div style="display:grid;grid-template-columns:110px 1fr 30px;gap:8px;align-items:center;margin-bottom:4px"><span class="small">' + t(r[0]) + '</span><span style="height:14px;border-radius:4px;background:var(--c1);width:' + (r[1] / max * 100) + '%"></span><b class="num small">' + r[1] + '</b></div>').join('') + '</div>';
  },
  share(v) {
    if (!v.what) return '<div class="builder-preview muted">' + tx('اختر ما تريد مشاركته لرؤية النتيجة.', 'Choose what to share to see the result.') + '</div>';
    const scope = v.what === 'المهمة فقط' ? tx('يرى المستشار مهمة «مراجعة عقد المورد» وحدها', 'The consultant sees only the “Review the supplier contract” task') : v.what === 'القائمة كاملة' ? tx('يرى المستشار كل مهام «إجراءات التدقيق» الحساسة', 'The consultant sees every sensitive task in “Audit actions”') : tx('يرى المستشار كل ما في Space العمليات', 'The consultant sees everything in the Operations Space');
    const risk = v.what !== 'المهمة فقط';
    const perm = v.perm ? { 'View only': tx('يشاهد فقط', 'can only view'), 'Comment': tx('يشاهد ويعلّق', 'can view and comment'), 'Edit': tx('يعدّل البيانات', 'can edit data'), 'Full edit': tx('يعدّل بالكامل', 'has full edit rights') }[v.perm] : '...';
    return '<div class="builder-preview" style="display:grid;gap:6px"><p>' + icon(risk ? 'alert' : 'lock', 'icon-sm') + ' ' + t(scope) + tx('، و', ', and ') + t(perm) + '.</p>' +
      (risk ? '<p class="small" style="color:var(--err)">' + tx('هذا أوسع من الحاجة ويكشف بيانات لا تخصه.', 'This is wider than needed and exposes data that is not theirs to see.') + '</p>' : '') +
      (v.role === 'Member' || v.role === 'Admin' ? '<p class="small" style="color:var(--err)">' + tx('شخص من خارج المؤسسة يُدعى ضيفاً (Guest)، لا عضواً.', 'Someone from outside the organization is invited as a Guest, not a member.') + '</p>' : '') + '</div>';
  }
};

/* ---------- Quiz (lesson checks, module quizzes, final) ---------- */
function renderQuiz(root, questions, key, opts) {
  opts = opts || {};
  const S = UIState.get('quiz:' + key) || { attempt: opts.attempt || 0, answers: {}, submitted: false };
  UIState.set('quiz:' + key, S);
  const lbl = v => typeof v === 'function' ? v() : v;
  const draw = () => {
    const seed = key + ':' + S.attempt;
    root.innerHTML = '<div class="quiz">' + questions.map((q, qi) => {
      const order = seededShuffle(q.options.map((_, i) => i), seed + qi);
      return '<div class="panel q-block" data-q="' + qi + '" data-qid="' + esc(q.id || '') + '"><fieldset><legend class="q-title"><span class="q-num">' + tx('سؤال ' + (qi + 1) + ' من ' + questions.length, 'Question ' + (qi + 1) + ' of ' + questions.length) + '</span><br>' + t(q.q) + '</legend>' +
        order.map(i => '<label class="opt"><input type="radio" name="' + esc(key) + '-q' + qi + '" value="' + i + '"' + (S.answers[qi] === i ? ' checked' : '') + '><span>' + t(q.options[i]) + '</span></label>').join('') +
        '</fieldset><div class="q-why" data-why></div></div>';
    }).join('') + '</div>' +
      '<div class="ex-actions" style="margin-top:14px"><button type="button" class="btn btn-primary" data-submit>' + (lbl(opts.submitLabel) || tx('تحقق من إجاباتي', 'Check my answers')) + '</button><span data-msg class="help-text" role="status"></span></div><div data-result></div>';
  };
  const grade = fresh => {
    const answers = questions.map((q, qi) => S.answers[qi] == null ? null : S.answers[qi]);
    let score = 0;
    questions.forEach((q, qi) => {
      const block = root.querySelector('[data-q="' + qi + '"]'); const ok = answers[qi] === q.answer; if (ok) score++;
      $$('input', block).forEach(inp => {
        inp.disabled = true;
        const l = inp.closest('.opt');
        if (+inp.value === q.answer) l.classList.add('correct');
        else if (inp.checked) l.classList.add('wrong');
      });
      $('[data-why]', block).innerHTML = feedbackHTML(ok ? 'ok' : 'bad', (ok ? tx('إجابة صحيحة. ', 'Correct. ') : tx('الإجابة الصحيحة: ', 'The correct answer: ') + Q(t(q.options[q.answer])) + '. ') + t(q.why));
    });
    $('[data-submit]', root).hidden = true;
    $('[data-msg]', root).textContent = '';
    const pass = opts.pass || 0;
    const passed = score / questions.length >= pass;
    $('[data-result]', root).innerHTML = '<div class="panel score-card" style="margin-top:16px"><div class="score-big">' + score + '<span class="muted" style="font-size:1.2rem"> / ' + questions.length + '</span></div>' +
      '<div style="display:grid;gap:4px"><span class="verdict" style="color:' + (passed ? 'var(--ok)' : 'var(--warn)') + '">' + (opts.pass ? (passed ? tx('اجتزت هذا التقييم', 'You passed this assessment') : tx('لم تصل بعد إلى ', 'Not yet at ') + Math.round(pass * 100) + '%') : (score === questions.length ? tx('ممتاز، كل الإجابات صحيحة', 'Excellent, every answer is correct') : tx('راجع الشرح تحت كل سؤال', 'Review the explanation under each question'))) + '</span>' +
      '<span class="help-text">' + (lbl(opts.resultNote) || tx('يمكنك إعادة المحاولة في أي وقت. يُحفظ أفضل نتيجة وآخر نتيجة على هذا الجهاز.', 'You can try again at any time. Your best and last scores are saved on this device.')) + '</span></div>' +
      '<button type="button" class="btn btn-secondary" data-retry>' + icon('reset') + tx('إعادة المحاولة', 'Try again') + '</button></div>';
    if (fresh) {
      $('[data-result]', root).querySelector('.score-card').scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      announce(tx('النتيجة ' + score + ' من ' + questions.length, 'Score ' + score + ' of ' + questions.length));
      if (opts.onSubmit) opts.onSubmit(score, questions.length);
    }
  };
  draw();
  if (S.submitted) grade(false);
  root.onchange = e => { const m = e.target.name && e.target.name.match(/-q(\d+)$/); if (m && !S.submitted) S.answers[+m[1]] = +e.target.value; };
  root.onclick = e => {
    if (e.target.closest('[data-retry]')) {
      if (opts.fixedSet) { UIState.set('quiz:' + key, null); rerender(); return; }
      S.attempt++; S.answers = {}; S.submitted = false; draw(); const f = root.querySelector('input'); if (f) f.focus(); return;
    }
    if (!e.target.closest('[data-submit]')) return;
    const missing = questions.filter((q, qi) => S.answers[qi] == null).length;
    if (missing) { $('[data-msg]', root).textContent = tx('أجب عن كل الأسئلة أولاً (' + missing + ' متبقية).', 'Answer every question first (' + missing + ' left).'); const first = questions.findIndex((q, qi) => S.answers[qi] == null); root.querySelector('[data-q="' + first + '"] input').focus(); return; }
    S.submitted = true;
    grade(true);
  };
}
