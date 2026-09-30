/* ==========================================================================
   Workshops: hands-on, step-by-step pages for the bigger ClickUp features.
   Automations has its own page (automations.js); this file holds the hub and
   the AI, Import & Export and Templates workshops, which share one stepper.
   Every screen here is a simplified educational simulation.
   ========================================================================== */

const WORKSHOPS = () => [
  { id: 'automations', href: '#/automations', icon: 'robot', c: '#ff4d6d', g: 'linear-gradient(140deg,#ff4d6d,#ff7a45)', t: tx('الأتمتة', 'Automations'), d: tx('دع ClickUp يتولى الخطوات المتكررة: When ثم If ثم Then.', 'Let ClickUp handle repeated steps: When, If, Then.') },
  { id: 'ai', href: '#/workshops/ai', icon: 'sparkle', c: '#a855f7', g: 'linear-gradient(140deg,#8930fd,#ff02f0)', t: tx('الذكاء الاصطناعي ClickUp Brain', 'AI with ClickUp Brain'), d: tx('لخّص، واكتب، واطلب مهاماً فرعية، واسأل عن عملك.', 'Summarize, write, get subtasks and ask about your work.') },
  { id: 'import', href: '#/workshops/import', icon: 'upload', c: '#1fb6e0', g: 'linear-gradient(140deg,#1fb6e0,#22c38e)', t: tx('الاستيراد والتصدير', 'Import & Export'), d: tx('انقل جدول Excel إلى ClickUp، وصدّر مهامك إلى ملف.', 'Bring an Excel sheet into ClickUp, and export your tasks to a file.') },
  { id: 'templates', href: '#/workshops/templates', icon: 'template', c: '#22c38e', g: 'linear-gradient(140deg,#22c38e,#14b8a6)', t: tx('القوالب', 'Templates'), d: tx('اختر قالباً جاهزاً، أو أنشئ قالبك الخاص وأعد استخدامه.', 'Pick a ready template, or create your own and reuse it.') },
  { id: 'studio', href: '#/studio', icon: 'chart', c: '#4f86f7', g: 'linear-gradient(140deg,#4f86f7,#49ccf9)', t: tx('لوحات المعلومات', 'Dashboards'), d: tx('اقرأ الرسوم والأرقام في استوديو لوحات المعلومات.', 'Read charts and numbers in the Dashboard Studio.') },
  { id: 'lab', href: '#/lab', icon: 'flask', c: '#f5a524', g: 'linear-gradient(140deg,#f5a524,#ff7a45)', t: tx('مختبر التطبيق', 'Practice Lab'), d: tx('مساحة كاملة تشبه ClickUp للتدرّب بحرية.', 'A full ClickUp-like space to practise freely.') }
];

function viewWorkshops(main, params) {
  if (params[0]) return WS_DEF[params[0]] ? viewWorkshop(main, params[0]) : viewNotFound(main);
  main.innerHTML = '<div class="page ws-hub">' +
    '<section class="hx hx-small" aria-labelledby="wsT"><div class="hx-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b3"></span><span class="hx-grid"></span></div>' +
    '<div class="hx-copy"><span class="hero-kicker">' + icon('robot', 'icon-sm') + tx('تعلّم بيدك', 'Learn by doing') + '</span><h1 id="wsT" tabindex="-1">' + tx('الورش التفاعلية', 'Hands-on workshops') + '</h1>' +
    '<p class="lead">' + tx('كل ورشة تشرح ميزة كبيرة في ClickUp خطوة بخطوة، ثم تتركك تجرّبها بنفسك في محاكاة آمنة.', 'Each workshop explains a big ClickUp feature step by step, then lets you try it yourself in a safe simulation.') + '</p></div>' +
    '<div class="ws-hero-art">' + mascot('mascot-lg') + '</div></section>' +
    '<div class="ws-grid">' + WORKSHOPS().map((w, i) => '<a class="ws-card" data-rv href="' + w.href + '" style="--g:' + w.g + ';--tc:' + w.c + ';--i:' + i + '"><span class="ws-art"><span class="ic-tile">' + icon(w.icon) + '</span><i></i><i></i><i></i></span><span class="ws-body"><h2>' + w.t + '</h2><p>' + w.d + '</p><span class="way-go">' + tx('ابدأ الورشة', 'Start workshop') + icon('fwd', 'icon-sm') + '</span></span></a>').join('') + '</div></div>';
}

/* One stepper for every workshop: numbered steps, animated panels, back/next. */
function viewWorkshop(main, id) {
  const W = WS_DEF[id]; const meta = WORKSHOPS().find(w => w.id === id);
  const steps = W.steps();
  let step = UIState.get('ws-step:' + id) || 0; let cleanup = null;
  main.innerHTML = '<div class="page tour-part ws-page" style="--mc:' + meta.c + ';--md:' + W.dark + '">' +
    '<header class="lesson-hero" style="background:' + meta.g + '"><span class="lh-art" aria-hidden="true">' + icon(meta.icon) + '</span><div class="breadcrumbs"><a href="#/workshops">' + tx('الورش التفاعلية', 'Workshops') + '</a><span aria-hidden="true">/</span><span>' + meta.t + '</span></div>' +
    '<h1 tabindex="-1">' + W.title() + '</h1><p class="au-sub">' + W.sub() + '</p></header>' +
    '<div class="tour-steps" role="group" aria-label="' + tx('خطوات الورشة', 'Workshop steps') + '">' + steps.map((s, i) => '<button type="button" data-wstep="' + i + '"><span class="ts-n num">' + (i + 1) + '</span>' + icon(s.ic, 'icon-sm') + '<span>' + s.label + '</span></button>').join('') + '</div>' +
    '<section class="panel tour-panel" data-wp aria-live="polite"></section>' +
    '<nav class="tour-nav" aria-label="' + tx('التنقل', 'Navigation') + '"><button type="button" class="btn btn-secondary" data-wgo="-1">' + icon('back', 'icon-sm') + '<span>' + tx('السابق', 'Back') + '</span></button><button type="button" class="btn btn-primary" data-wgo="1"><span></span>' + icon('fwd', 'icon-sm') + '</button></nav>' +
    '<a class="rq-other ws-back" href="#/workshops">' + icon('robot', 'icon-sm') + tx('كل الورش', 'All workshops') + icon('fwd', 'icon-sm') + '</a></div>';
  const panel = $('[data-wp]', main);
  const paint = dir => {
    if (dir) Sound.play('whoosh');
    if (typeof cleanup === 'function') cleanup(); cleanup = null;
    panel.innerHTML = '<div class="tp-body' + (dir ? ' tp-in' : '') + '" style="--dir:' + (dir || 1) + '">' + steps[step].html() + '</div>';
    if (steps[step].mount) cleanup = steps[step].mount(panel);
    $$('[data-wstep]', main).forEach(b => { const k = +b.dataset.wstep; b.setAttribute('aria-current', k === step ? 'step' : 'false'); b.classList.toggle('done', k < step); });
    $('[data-wgo="-1"]', main).hidden = step === 0;
    const fwd = $('[data-wgo="1"]', main); fwd.hidden = step === steps.length - 1;
    if (step < steps.length - 1) $('span', fwd).textContent = tx('التالي: ', 'Next: ') + steps[step + 1].label;
    UIState.set('ws-step:' + id, step);
  };
  const go = to => {
    const d = to > step ? 1 : -1; step = to; paint(d);
    const top = panel.getBoundingClientRect().top;
    if (top < 70 || top > window.innerHeight * .6) $('.tour-steps', main).scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    const h = $('h2', panel); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  };
  paint(0);
  main.addEventListener('click', e => {
    const s = e.target.closest('[data-wstep]'); if (s) { if (+s.dataset.wstep !== step) go(+s.dataset.wstep); return; }
    const g = e.target.closest('[data-wgo]'); if (g) go(clamp(step + +g.dataset.wgo, 0, steps.length - 1));
  });
  return () => { if (typeof cleanup === 'function') cleanup(); };
}

/* Shared bits */
const wsKicker = (k, h) => '<p class="tp-kicker">' + k + '</p><h2>' + h + '</h2>';
const wsSteps = list => '<ol class="tp-steps">' + list.map((h, k) => '<li style="--k:' + k + '"><span class="num">' + (k + 1) + '</span><p>' + h + '</p></li>').join('') + '</ol>';
const wsCards = list => '<div class="au-know">' + list.map(x => '<div class="why-card" style="--tc:' + x[1] + '"><span class="ic-tile">' + icon(x[0]) + '</span><h3>' + x[2] + '</h3><p>' + x[3] + '</p></div>').join('') + '</div>';
const wsFaq = list => '<p class="tp-kicker" style="margin-top:22px">' + tx('أسئلة شائعة', 'Common questions') + '</p><div class="cuq-list">' + list.map(f => '<details class="cuq"><summary>' + icon('help', 'icon-sm') + '<span>' + f[0] + '</span><span class="chev">' + icon('fwd', 'icon-sm') + '</span></summary><div class="cuq-a"><p>' + f[1] + '</p></div></details>').join('') + '</div>';
const wsNote = t => '<p class="help-text au-note">' + icon('eye', 'icon-sm') + '<span>' + t + '</span></p>';
const wsVersion = () => wsNote(tx('قد تختلف أسماء الأزرار ومواضعها قليلاً بين إصدارات ClickUp وخطط الاشتراك.', 'Button names and positions may differ slightly between ClickUp versions and plans.'));
function typeInto(el, text, done) {
  if (prefersReducedMotion()) { el.textContent = text; if (done) done(); return () => {}; }
  let i = 0; el.textContent = '';
  const t = setInterval(() => { i += Math.max(1, Math.round(text.length / 60)); el.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(t); if (done) done(); } }, 22);
  return () => clearInterval(t);
}
function downloadFile(name, text, type) {
  const blob = new Blob([text], { type: type || 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function parseCSV(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
    else if (ch === '"') q = true; else if (ch === ',' || ch === ';' || ch === '\t') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some(c => c.trim())) rows.push(row); row = []; }
    else cell += ch;
  }
  row.push(cell); if (row.some(c => c.trim())) rows.push(row);
  return rows.map(r => r.map(c => c.trim()));
}
/* CSV cell, safe for spreadsheets: a value starting with = + - @ (or a tab or
   carriage return) could run as a formula in Excel, so it gets a leading apostrophe. */
const csvCell = v => { let s = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

const WS_DEF = {
  /* ---------------- AI ---------------- */
  ai: {
    dark: '#6d28d9',
    title: () => tx('الذكاء الاصطناعي في ClickUp: ClickUp Brain', 'AI in ClickUp: ClickUp Brain'),
    sub: () => tx('تعرّف ماذا يفعل، وجرّبه على مهمة تجريبية، وتعلّم كتابة طلبات واضحة.', 'See what it does, try it on a sample task, and learn to write clear requests.'),
    steps: () => [
      { ic: 'bulb', label: tx('ما هو؟', 'What is it?'), html: () => wsKicker(tx('مساعد داخل عملك', 'An assistant inside your work'), tx('ClickUp Brain يفهم مهامك ومستنداتك ويساعدك بثلاث طرق', 'ClickUp Brain understands your tasks and Docs and helps in three ways')) +
        '<div class="ai-orbit" aria-hidden="true"><span class="ai-core">' + icon('sparkle') + '</span><span class="ai-ring"></span>' +
        [['help', '#4f86f7', tx('اسأل', 'Ask'), tx('«ما الذي يؤخر تقرير الربع؟»', '“What’s holding up the Q3 report?”')], ['doc', '#ff02f0', tx('اكتب', 'Write'), tx('لخّص، أعد الصياغة، ترجم', 'Summarize, rewrite, translate')], ['checklist', '#22c38e', tx('نفّذ', 'Do'), tx('مهام فرعية، تحديثات، أتمتة بالكلمات', 'Subtasks, updates, automations from words')]]
          .map((s, i) => '<span class="ai-sat s' + i + '" style="--tc:' + s[1] + '"><span class="ic-tile">' + icon(s[0], 'icon-sm') + '</span><b>' + s[2] + '</b><small>' + s[3] + '</small></span>').join('') + '</div>' +
        wsCards([
          ['help', '#4f86f7', tx('اسأل عن عملك', 'Ask about your work'), tx('اسأل بلغة بسيطة عن المهام والمستندات، مثل «ما المتأخر في قائمتي؟».', 'Ask in plain words about tasks and Docs, such as “what’s overdue in my List?”.')],
          ['doc', '#ff02f0', tx('اكتب أسرع', 'Write faster'), tx('لخّص نقاشاً طويلاً، اكتب تحديث حالة، حسّن الصياغة أو ترجمها.', 'Summarize a long thread, write a status update, improve or translate wording.')],
          ['checklist', '#22c38e', tx('أنجز أكثر', 'Get more done'), tx('اقترح مهاماً فرعية، وجهّز ملخصات، وابنِ أتمتة بوصفها بالكلمات.', 'Suggest subtasks, prepare summaries and build automations by describing them.')]
        ]) + wsNote(tx('يعتمد توفر ClickUp Brain وميزاته على خطة الاشتراك وإعدادات المسؤول، وقد تتغير أسماء الميزات.', 'ClickUp Brain and its features depend on your plan and admin settings, and feature names can change.')) },
      { ic: 'play', label: tx('جرّبه', 'Try it'), html: () => wsKicker(tx('جرّبه', 'Try it'), tx('اطلب من Brain المساعدة في هذه المهمة', 'Ask Brain to help with this task')) +
        '<div class="ai-lab"><div class="ai-task"><div class="au-trow"><span class="mx-status st-progress">IN PROGRESS</span><b>' + tx('تجهيز تقرير رضا العملاء للربع الثالث', 'Prepare the Q3 customer satisfaction report') + '</b></div>' +
        '<p class="ai-desc">' + tx('جمع نتائج الاستبيان، وتحديث الرسوم، وكتابة الملخص التنفيذي قبل اجتماع الأحد.', 'Collect the survey results, update the charts and write the executive summary before Sunday’s meeting.') + '</p>' +
        '<div class="ai-thread">' + [['salim', tx('ما زلت أنتظر أرقام الاستبيان النهائية من التسويق.', 'Still waiting for the final survey numbers from Marketing.')], ['noura', tx('الرسوم جاهزة، سأحدّثها عند وصول الأرقام.', 'The charts are ready; I’ll update them when the numbers arrive.')], ['maryam', tx('لنراجع المسودة يوم الأحد.', 'Let’s review the draft on Sunday.')]].map(c => '<p>' + DM.av(c[0], 22) + '<span><b>' + PN(c[0]) + '</b> ' + c[1] + '</span></p>').join('') + '</div>' +
        '<div class="ai-subs" data-subs></div></div>' +
        '<div class="ai-panel"><div class="ai-ph"><span class="ai-core sm">' + icon('sparkle', 'icon-sm') + '</span><b>ClickUp Brain</b><span class="chip chip-sim">' + tx('محاكاة', 'Simulation') + '</span></div>' +
        '<div class="ai-chat" data-chat aria-live="polite"><p class="ai-msg ai-bot">' + tx('مرحباً! ماذا تريد أن أفعل بهذه المهمة؟', 'Hi! What would you like me to do with this task?') + '</p></div>' +
        '<div class="ai-chips">' + [['sum', tx('لخّص المهمة', 'Summarize this task')], ['upd', tx('اكتب تحديث حالة', 'Write a status update')], ['subs', tx('اقترح مهاماً فرعية', 'Suggest subtasks')], ['reply', tx('اكتب رداً على سالم', 'Draft a reply to Salim')], ['tr', tx('ترجم الوصف إلى الإنجليزية', 'Translate the description to Arabic')]].map(c => '<button type="button" class="ai-chip" data-ask="' + c[0] + '">' + icon('sparkle', 'icon-sm') + c[1] + '</button>').join('') + '</div>' +
        '<form class="ai-input" data-askform><input class="input" data-askq placeholder="' + tx('اكتب طلبك…', 'Type your request…') + '" aria-label="' + tx('طلبك لـ ClickUp Brain', 'Your request to ClickUp Brain') + '"><button type="submit" class="icon-btn" aria-label="' + tx('أرسل', 'Send') + '">' + icon('send', 'icon-sm') + '</button></form></div></div>',
        mount: panel => {
          const chat = $('[data-chat]', panel); let stop = () => {}; let busy = false;
          const ANS = {
            sum: tx('الملخص: التقرير شبه جاهز. الرسوم جاهزة عند نورة، وسالم ينتظر أرقام الاستبيان النهائية من التسويق. الخطوة التالية: مراجعة المسودة مع مريم يوم الأحد.', 'Summary: the report is nearly ready. Noura’s charts are done, and Salim is waiting for the final survey numbers from Marketing. Next step: review the draft with Maryam on Sunday.'),
            upd: tx('تحديث الحالة: الرسوم جاهزة والمسودة قيد المراجعة. عائق واحد: أرقام الاستبيان النهائية من التسويق. نحن على المسار لمراجعة يوم الأحد.', 'Status update: the charts are ready and the draft is in review. One blocker: the final survey numbers from Marketing. We are on track for Sunday’s review.'),
            subs: tx('إليك مهام فرعية مقترحة:', 'Here are suggested subtasks:'),
            reply: tx('مسودة رد: شكراً يا سالم! سأتابع مع التسويق اليوم لنحصل على الأرقام النهائية قبل الخميس.', 'Draft reply: Thanks, Salim! I’ll follow up with Marketing today so we have the final numbers before Thursday.'),
            tr: tx('Collect the survey results, update the charts and write the executive summary before Sunday’s meeting.', 'جمع نتائج الاستبيان، وتحديث الرسوم، وكتابة الملخص التنفيذي قبل اجتماع الأحد.')
          };
          const SUBS = [tx('استلام أرقام الاستبيان النهائية من التسويق', 'Get the final survey numbers from Marketing'), tx('تحديث الرسوم بأرقام الربع الثالث', 'Update the charts with Q3 numbers'), tx('كتابة الملخص التنفيذي', 'Write the executive summary'), tx('مراجعة المسودة مع مريم يوم الأحد', 'Review the draft with Maryam on Sunday')];
          const guess = q => { q = q.toLowerCase(); return /summar|لخص|لخّص|ملخص/.test(q) ? 'sum' : /update|status|تحديث/.test(q) ? 'upd' : /subtask|step|فرعي|خطوات/.test(q) ? 'subs' : /reply|respond|رد/.test(q) ? 'reply' : /translat|ترجم/.test(q) ? 'tr' : null; };
          const ask = (key, label) => {
            if (busy) return; busy = true;
            chat.insertAdjacentHTML('beforeend', '<p class="ai-msg ai-me">' + esc(label) + '</p><p class="ai-msg ai-bot ai-think"><i></i><i></i><i></i></p>');
            chat.scrollTop = chat.scrollHeight;
            setTimeout(() => {
              const th = $('.ai-think', chat); if (!th) { busy = false; return; }
              th.classList.remove('ai-think'); th.innerHTML = '<span></span>'; Sound.play('pop');
              const text = key ? ANS[key] : tx('في هذه المحاكاة جرّب أحد الاقتراحات أعلاه. في ClickUp يستطيع Brain الإجابة عن أسئلة أكثر بكثير.', 'In this simulation, try one of the suggestions above. In ClickUp, Brain can answer many more kinds of requests.');
              stop = typeInto($('span', th), text, () => {
                busy = false;
                if (key === 'subs') { th.insertAdjacentHTML('beforeend', '<ul>' + SUBS.map(s => '<li>' + icon('subtask', 'icon-sm') + s + '</li>').join('') + '</ul><button type="button" class="btn btn-primary btn-sm" data-addsubs>' + icon('plus', 'icon-sm') + tx('أضفها كمهام فرعية', 'Add as subtasks') + '</button>'); }
                chat.scrollTop = chat.scrollHeight;
              });
            }, prefersReducedMotion() ? 50 : 800);
          };
          const onClick = e => {
            const c = e.target.closest('[data-ask]'); if (c) { ask(c.dataset.ask, c.textContent); return; }
            if (e.target.closest('[data-addsubs]')) {
              const box = $('[data-subs]', panel); if (box.children.length) return;
              box.innerHTML = '<p class="ai-subs-h">' + icon('subtask', 'icon-sm') + tx('المهام الفرعية', 'Subtasks') + '</p>' + SUBS.map((s, i) => '<p class="ai-sub" style="--k:' + i + '"><span class="mx-status st-todo">TO DO</span>' + s + '</p>').join('');
              e.target.closest('[data-addsubs]').disabled = true; Motion.confetti(box, 40); toast(tx('أُضيفت 4 مهام فرعية', '4 subtasks added'));
            }
          };
          const onSubmit = e => { e.preventDefault(); const inp = $('[data-askq]', panel); const q = inp.value.trim(); if (!q) return; inp.value = ''; ask(guess(q), q); };
          panel.addEventListener('click', onClick); $('[data-askform]', panel).addEventListener('submit', onSubmit);
          return () => { stop(); panel.removeEventListener('click', onClick); };
        } },
      { ic: 'doc', label: tx('طلبات جيدة', 'Good prompts'), html: () => {
        const opt = (k, list) => '<label>' + list[0] + '<select class="select select-sm" data-pb="' + k + '">' + list.slice(1).map((o, i) => '<option value="' + i + '">' + o + '</option>').join('') + '</select></label>';
        return wsKicker(tx('ابنِ طلباً واضحاً', 'Build a clear request'), tx('الطلب الواضح = هدف + جمهور + أسلوب + شكل', 'A clear request = goal + audience + tone + format')) +
          '<div class="pb"><div class="pb-controls">' + opt('goal', [tx('الهدف', 'Goal'), tx('لخّص', 'Summarize'), tx('اكتب تحديث حالة عن', 'Write a status update about'), tx('اقترح خطوات لـ', 'Suggest steps for'), tx('اكتب رسالة عن', 'Draft a message about')]) +
          opt('aud', [tx('لمن؟', 'For whom?'), tx('مديري', 'my manager'), tx('فريقي', 'my team'), tx('قسم آخر', 'another department')]) +
          opt('tone', [tx('الأسلوب', 'Tone'), tx('قصير وواضح', 'short and clear'), tx('ودود', 'friendly'), tx('رسمي', 'formal')]) +
          opt('fmt', [tx('الشكل', 'Format'), tx('3 نقاط', '3 bullet points'), tx('فقرة واحدة', 'one paragraph'), tx('جدول', 'a table')]) + '</div>' +
          '<div class="pb-out"><span class="ai-core sm">' + icon('sparkle', 'icon-sm') + '</span><p data-pbout></p><button type="button" class="btn btn-secondary btn-sm" data-pbcopy>' + icon('doc', 'icon-sm') + tx('انسخ', 'Copy') + '</button></div></div>' +
          wsCards([
            ['target', '#7b68ee', tx('كن محدداً', 'Be specific'), tx('اذكر المهمة أو القائمة والفترة، مثل «هذا الأسبوع».', 'Name the task or List and the period, such as “this week”.')],
            ['users', '#e44bb6', tx('اذكر الجمهور', 'Say who it’s for'), tx('ما يُكتب للمدير يختلف عما يُكتب للفريق.', 'What you write for a manager differs from what you write for the team.')],
            ['table', '#1fb6e0', tx('اطلب شكلاً', 'Ask for a format'), tx('نقاط أو جدول أو فقرة قصيرة.', 'Bullet points, a table or a short paragraph.')],
            ['eye', '#f5a524', tx('راجع دائماً', 'Always review'), tx('تحقق من الأرقام والأسماء قبل المشاركة.', 'Check numbers and names before sharing.')]
          ]);
      }, mount: panel => {
        const out = $('[data-pbout]', panel);
        const G = [tx('لخّص', 'Summarize'), tx('اكتب تحديث حالة عن', 'Write a status update about'), tx('اقترح خطوات لـ', 'Suggest steps for'), tx('اكتب رسالة عن', 'Draft a message about')];
        const A = [tx('مديري', 'my manager'), tx('فريقي', 'my team'), tx('قسم آخر', 'another department')];
        const T = [tx('قصير وواضح', 'short and clear'), tx('ودود', 'friendly'), tx('رسمي', 'formal')];
        const F = [tx('3 نقاط', '3 bullet points'), tx('فقرة واحدة', 'one paragraph'), tx('جدول', 'a table')];
        const v = k => +$('[data-pb="' + k + '"]', panel).value;
        const render = () => { out.textContent = tx(G[v('goal')] + ' مهمة «تقرير الربع الثالث» لـ' + A[v('aud')] + '. اجعله ' + T[v('tone')] + '، على شكل ' + F[v('fmt')] + '، واذكر أي عائق وموعده.', G[v('goal')] + ' the “Q3 report” task for ' + A[v('aud')] + '. Keep it ' + T[v('tone')] + ', as ' + F[v('fmt')] + ', and mention any blocker and its date.'); out.classList.remove('tip-in'); void out.offsetWidth; out.classList.add('tip-in'); };
        render();
        const onChange = e => { if (e.target.dataset.pb) render(); };
        const onClick = e => { if (e.target.closest('[data-pbcopy]')) copyText(out.textContent).then(ok => toast(ok ? tx('نُسخ الطلب', 'Prompt copied') : tx('تعذّر النسخ', 'Copying is not available'))); };
        panel.addEventListener('change', onChange); panel.addEventListener('click', onClick);
        return () => { panel.removeEventListener('change', onChange); panel.removeEventListener('click', onClick); };
      } },
      { ic: 'list', label: tx('في ClickUp', 'In ClickUp'), html: () => wsKicker(tx('داخل ClickUp', 'Inside ClickUp'), tx('كيف تستخدم Brain خطوة بخطوة', 'How to use Brain, step by step')) +
        '<div class="tp-how">' + wsSteps([
          tx('ابحث عن زر الذكاء الاصطناعي (Brain أو Ask AI) في الشريط العلوي أو داخل المهمة أو المستند.', 'Look for the AI button (Brain or Ask AI) in the top bar, or inside a task or Doc.'),
          tx('اكتب طلبك بلغة بسيطة، مثل «ما الذي يؤخر تقرير الربع؟».', 'Type your request in plain words, such as “what’s holding up the Q3 report?”.'),
          tx('داخل المهمة: اطلب ملخصاً للنشاط أو اقتراح مهام فرعية.', 'Inside a task: ask for an activity summary or suggested subtasks.'),
          tx('داخل مستند أو تعليق: حدّد النص واطلب تحسينه أو اختصاره أو ترجمته.', 'Inside a Doc or comment: select text and ask to improve, shorten or translate it.'),
          tx('راجع النتيجة، وعدّلها، ثم طبّقها.', 'Review the result, edit it, then apply it.')
        ]) + '<div class="au-shot" aria-hidden="true"><div class="au-shot-bar"><span>' + L_OPS() + ' / <b>' + L_WEEKLY() + '</b></span><span class="au-shot-robot ai-shot">' + icon('sparkle') + '</span><span class="au-shot-share">Share</span></div><div class="au-shot-menu"><b>ClickUp Brain</b><span class="au-shot-create">' + icon('sparkle', 'icon-sm') + 'Ask AI</span><span>' + icon('doc', 'icon-sm') + tx('اكتب', 'Write') + '</span><span>' + icon('checklist', 'icon-sm') + tx('لخّص', 'Summarize') + '</span></div></div></div>' + wsVersion() },
      { ic: 'info', label: tx('معلومات مهمة', 'Good to know'), html: () => wsKicker(tx('استخدمه بمسؤولية', 'Use it responsibly'), tx('نصائح مهمة قبل أن تبدأ', 'Important tips before you start')) + wsCards([
          ['lock', '#ff4d6d', tx('البيانات الحساسة', 'Sensitive data'), tx('لا تضع بيانات العملاء الشخصية أو المعلومات السرية إلا بما تسمح به سياسة المؤسسة.', 'Don’t include customers’ personal data or confidential information beyond what company policy allows.')],
          ['eye', '#f5a524', tx('تحقّق من النتيجة', 'Check the result'), tx('قد يخطئ الذكاء الاصطناعي. راجع الأرقام والأسماء والتواريخ.', 'AI can be wrong. Check numbers, names and dates.')],
          ['chart', '#4f86f7', tx('التوفر', 'Availability'), tx('يعتمد على الخطة أو الإضافة وإعدادات المسؤول في مساحة العمل.', 'It depends on your plan or add-on and the Workspace admin settings.')],
          ['users', '#22c38e', tx('أنت المسؤول', 'You are responsible'), tx('ما تشاركه باسمك مسؤوليتك، حتى لو كتبه الذكاء الاصطناعي.', 'What you share under your name is your responsibility, even if AI wrote it.')]
        ]) + wsFaq([
          [tx('هل يرى Brain كل شيء في مساحة العمل؟', 'Can Brain see everything in the Workspace?'), tx('يعمل ضمن صلاحياتك: يستخدم ما تستطيع أنت الوصول إليه. تفاصيل الخصوصية يحددها ClickUp ومسؤول مساحة العمل.', 'It works within your permissions, using what you can access. Privacy details are set by ClickUp and your Workspace admin.')],
          [tx('هل يكتب بالعربية؟', 'Can it write in Arabic?'), tx('يمكنك أن تطلب منه الكتابة أو الترجمة بالعربية. راجع الصياغة دائماً قبل المشاركة.', 'You can ask it to write or translate in Arabic. Always review the wording before sharing.')],
          [tx('هل يبني أتمتة؟', 'Can it build automations?'), tx('نعم، يمكنك وصف الأتمتة بالكلمات ليقترحها، ثم تراجعها وتحفظها. جرّب الفكرة في ورشة الأتمتة.', 'Yes, you can describe an automation in words for it to suggest, then review and save it. Try the idea in the Automations workshop.')]
        ]) }
    ]
  },

  /* ---------------- Import & Export ---------------- */
  import: {
    dark: '#0a7a9c',
    title: () => tx('الاستيراد والتصدير: من Excel إلى ClickUp وبالعكس', 'Import & Export: from Excel to ClickUp and back'),
    sub: () => tx('انقل جدولك إلى قائمة مهام في دقائق، ثم صدّر مهامك إلى ملف تفتحه في Excel.', 'Turn your spreadsheet into a List of tasks in minutes, then export your tasks to a file you can open in Excel.'),
    steps: () => [
      { ic: 'bulb', label: tx('كيف يعمل', 'How it works'), html: () => wsKicker(tx('الفكرة', 'The idea'), tx('كل صف في الجدول يصبح مهمة، وكل عمود يصبح حقلاً', 'Each spreadsheet row becomes a task, and each column becomes a field')) +
        '<div class="ie-flow" aria-hidden="true"><div class="ie-sheet">' + ['A', 'B', 'C'].map(c => '<span class="ie-h">' + c + '</span>').join('') + [0, 1, 2].map(r => '<span class="ie-row" style="--r:' + r + '"><i></i><i></i><i></i></span>').join('') + '<b>.xlsx / .csv</b></div>' +
        '<span class="ie-arrow">' + icon('fwd') + '<small>Import</small></span><div class="ie-list"><b>' + L_REQ() + '</b>' + ['todo', 'progress', 'done'].map((s, r) => '<span class="ie-task" style="--r:' + r + '"><span class="mx-status st-' + s + '">' + STATUS[s].en + '</span><i></i></span>').join('') + '</div>' +
        '<span class="ie-arrow">' + icon('fwd') + '<small>Export</small></span><div class="ie-file">' + icon('download') + '<b>clickup-export.csv</b></div></div>' +
        wsCards([
          ['upload', '#1fb6e0', 'Import', tx('من ملف CSV أو Excel، أو من تطبيقات أخرى مثل Asana وTrello وJira وMonday.com.', 'From a CSV or Excel file, or from other apps such as Asana, Trello, Jira and Monday.com.')],
          ['table', '#7b68ee', tx('ربط الأعمدة', 'Map the columns'), tx('تختار لكل عمود الحقل المقابل: اسم المهمة، المسؤول، التاريخ، الحالة…', 'For each column you pick the matching field: task name, assignee, date, status…')],
          ['download', '#22c38e', 'Export', tx('صدّر ما يعرضه View إلى ملف CSV أو Excel، ويستطيع المسؤول تصدير مساحة العمل كاملة.', 'Export what a view shows to a CSV or Excel file; admins can export the whole Workspace.')]
        ]) },
      { ic: 'upload', label: tx('جرّب الاستيراد', 'Try importing'), html: () => wsKicker(tx('جرّب الاستيراد', 'Try importing'), tx('اربط الأعمدة ثم استورد', 'Map the columns, then import')) +
        '<div class="ie-src"><button type="button" class="btn btn-secondary btn-sm" data-sample>' + icon('table', 'icon-sm') + tx('استخدم الجدول التجريبي', 'Use the sample sheet') + '</button><label class="btn btn-secondary btn-sm ie-up">' + icon('upload', 'icon-sm') + tx('أو ارفع ملف CSV من جهازك', 'Or upload a CSV from your device') + '<input type="file" accept=".csv,text/csv" data-csv hidden></label><span class="help-text">' + tx('الملف يُقرأ في متصفحك فقط ولا يُرسل إلى أي مكان.', 'The file is read in your browser only and is not sent anywhere.') + '</span></div>' +
        '<div data-imp></div>', mount: panel => {
        const box = $('[data-imp]', panel);
        const FIELDS = () => [['name', tx('اسم المهمة', 'Task name')], ['assignee', 'Assignee'], ['due', 'Due date'], ['status', 'Status'], ['priority', 'Priority'], ['field', 'Custom Field'], ['skip', tx('لا تستورد', 'Don’t import')]];
        const sample = () => [[tx('المهمة', 'Task'), tx('المسؤول', 'Owner'), tx('الموعد', 'Due'), tx('الحالة', 'Status'), tx('الأولوية', 'Priority'), tx('الإدارة', 'Department')],
          [tx('تحديث عرض المبيعات', 'Update the sales deck'), PN('salim'), '2026-10-04', 'In progress', 'High', tx('المبيعات', 'Sales')],
          [tx('مراجعة عقود الموردين', 'Review supplier contracts'), PN('maryam'), '2026-10-06', 'To do', 'Urgent', tx('المشتريات', 'Procurement')],
          [tx('تجهيز استبيان العملاء', 'Prepare the customer survey'), PN('noura'), '2026-10-08', 'Review', 'Normal', tx('التسويق', 'Marketing')],
          [tx('إغلاق ملاحظة التدقيق 4', 'Close audit finding 4'), tx('أحمد', 'Ahmed'), '2026-10-01', 'Done', 'Low', tx('التدقيق', 'Audit')],
          [tx('طلب شاشات لقاعة الاجتماعات', 'Order screens for the meeting room'), PN('khalid'), '2026-10-12', 'To do', 'Normal', tx('العمليات', 'Operations')]];
        const guessField = h => { h = h.toLowerCase(); return /task|name|title|مهمة|عنوان|اسم/.test(h) ? 'name' : /owner|assign|who|مسؤول|المالك/.test(h) ? 'assignee' : /due|date|deadline|موعد|تاريخ/.test(h) ? 'due' : /status|state|حالة/.test(h) ? 'status' : /prio|أولوية/.test(h) ? 'priority' : 'field'; };
        const s = UIState.get('imp') || { rows: null, map: [] };
        const toStatus = v => { v = (v || '').toLowerCase(); return /done|complete|closed|مكتمل|منجز/.test(v) ? 'done' : /review|مراجع/.test(v) ? 'review' : /progress|doing|تنفيذ|جار/.test(v) ? 'progress' : 'todo'; };
        const toPrio = v => { v = (v || '').toLowerCase(); return /urgent|عاجل/.test(v) ? 'urgent' : /high|عال/.test(v) ? 'high' : /low|منخفض/.test(v) ? 'low' : /normal|عادي/.test(v) ? 'normal' : null; };
        const people = () => PPL_IE().reduce((m, p) => (m[PN(p).toLowerCase()] = p, m), {});
        const load = rows => { rows = rows.slice(0, 51).map(r => r.slice(0, 8)); s.rows = rows; s.map = rows[0].map(guessField); if (!s.map.includes('name')) s.map[0] = 'name'; s.done = null; UIState.set('imp', s); paint(); Sound.play('pop'); };
        const paint = () => {
          if (!s.rows) { box.innerHTML = '<div class="empty-state">' + icon('table') + '<p>' + tx('اختر الجدول التجريبي أو ارفع ملفك لتبدأ.', 'Choose the sample sheet or upload your file to begin.') + '</p></div>'; return; }
          const head = s.rows[0], body = s.rows.slice(1);
          const nameCount = s.map.filter(m => m === 'name').length;
          box.innerHTML = '<div class="ie-map table-wrap"><table class="data-table"><thead><tr>' + head.map((h, i) => '<th scope="col"><span class="ie-colname">' + esc(h || '—') + '</span><select class="select select-sm" data-map="' + i + '" aria-label="' + tx('اربط العمود ', 'Map column ') + esc(h) + '">' + FIELDS().map(f => '<option value="' + f[0] + '"' + (f[0] === s.map[i] ? ' selected' : '') + '>' + f[1] + '</option>').join('') + '</select></th>').join('') + '</tr></thead><tbody>' +
            body.slice(0, 5).map(r => '<tr>' + head.map((h, i) => '<td class="' + (s.map[i] === 'skip' ? 'ie-skip' : '') + '">' + esc(r[i] || '') + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>' +
            '<p class="help-text">' + tx(body.length + ' صفاً في الملف', body.length + ' rows in the file') + (body.length > 5 ? tx(' (نعرض أول 5)', ' (showing the first 5)') : '') + '</p>' +
            (nameCount !== 1 ? feedbackHTML('bad', tx('اربط عموداً واحداً بالضبط بـ «اسم المهمة».', 'Map exactly one column to “Task name”.')) : '') +
            '<div class="ex-actions"><button type="button" class="btn btn-primary" data-doimport' + (nameCount !== 1 ? ' disabled' : '') + '>' + icon('upload', 'icon-sm') + tx('استورد إلى ', 'Import to ') + L_REQ() + '</button></div><div data-result></div>';
          if (s.done) result();
        };
        const result = () => {
          const head = s.rows[0], body = s.rows.slice(1), ppl = people(); const warn = [];
          const tasks = body.map(r => { const t = { name: '', assignee: null, due: '', status: 'todo', priority: null, field: '' };
            s.map.forEach((m, i) => { const v = r[i] || ''; if (m === 'name') t.name = v; if (m === 'due') t.due = v; if (m === 'status') t.status = toStatus(v); if (m === 'priority') t.priority = toPrio(v); if (m === 'field') t.field = t.field ? t.field + ' · ' + v : v;
              if (m === 'assignee' && v) { const p = ppl[v.toLowerCase()]; if (p) t.assignee = p; else warn.push(v); } });
            return t; }).filter(t => t.name);
          s.tasks = tasks; UIState.set('imp', s);
          $('[data-result]', box).innerHTML = '<div class="ie-done"><p class="ie-sum">' + icon('check-circle', 'icon-sm') + tx(tasks.length + ' مهام استُوردت إلى «' + L_REQ() + '»', tasks.length + ' tasks imported into “' + L_REQ() + '”') + (s.map.includes('skip') ? tx(' · تُخطّي عمود', ' · a column was skipped') : '') + '</p>' +
            (warn.length ? '<p class="ie-warn">' + icon('alert', 'icon-sm') + '<span>' + tx('«' + [...new Set(warn)].join('، ') + '» ليس عضواً في مساحة العمل، فاستُوردت مهمته بلا مسؤول. في ClickUp يجب أن يكون المسؤول عضواً.', '“' + [...new Set(warn)].join(', ') + '” is not a Workspace member, so the task was imported without an assignee. In ClickUp, assignees must be members.') + '</span></p>' : '') +
            '<div class="ie-listview">' + tasks.map((t, i) => '<div class="ie-trow" style="--k:' + i + '"><span class="mx-status st-' + t.status + '">' + STATUS[t.status].en + '</span><span class="ie-tn">' + esc(t.name) + '</span><span>' + (t.assignee ? DM.av(t.assignee, 20) : DM.noav()) + '</span><span class="num">' + esc(t.due) + '</span><span>' + (t.priority ? DM.pr(t.priority) : '<span class="mx-note">-</span>') + '</span>' + (t.field ? '<span class="chip">' + esc(t.field) + '</span>' : '<span></span>') + '</div>').join('') + '</div>' +
            '<p class="help-text">' + tx('التالي: صدّر هذه المهام إلى ملف من الخطوة 3.', 'Next: export these tasks to a file in step 3.') + '</p></div>';
        };
        const onClick = e => {
          if (e.target.closest('[data-sample]')) { load(sample()); return; }
          if (e.target.closest('[data-doimport]')) { s.done = true; UIState.set('imp', s); result(); Motion.confetti($('[data-result]', box), 50); }
        };
        const onChange = e => {
          if (e.target.dataset.map != null) { s.map[+e.target.dataset.map] = e.target.value; s.done = null; UIState.set('imp', s); paint(); const again = $('[data-map="' + e.target.dataset.map + '"]', box); if (again) again.focus(); return; }
          if (e.target.matches('[data-csv]') && e.target.files[0]) {
            const f = e.target.files[0]; if (f.size > 2e6) { toast(tx('الملف كبير جداً لهذه المحاكاة (الحد 2 ميغابايت).', 'The file is too large for this simulation (2 MB limit).')); return; }
            const rd = new FileReader(); rd.onload = () => { const rows = parseCSV(String(rd.result).replace(/^﻿/, '')); if (rows.length < 2) { toast(tx('لم نجد صفوفاً في الملف.', 'No rows found in the file.')); return; } load(rows); }; rd.readAsText(f);
          }
        };
        paint();
        panel.addEventListener('click', onClick); panel.addEventListener('change', onChange);
        return () => { panel.removeEventListener('click', onClick); panel.removeEventListener('change', onChange); };
      } },
      { ic: 'download', label: tx('جرّب التصدير', 'Try exporting'), html: () => wsKicker(tx('جرّب التصدير', 'Try exporting'), tx('اختر الأعمدة وحمّل ملفاً حقيقياً', 'Pick the columns and download a real file')) + '<div data-exp></div>', mount: panel => {
        const box = $('[data-exp]', panel);
        const s = UIState.get('imp') || {};
        const tasks = s.tasks && s.tasks.length ? s.tasks : [
          { name: tx('تحديث عرض المبيعات', 'Update the sales deck'), assignee: 'salim', due: '2026-10-04', status: 'progress', priority: 'high', field: tx('المبيعات', 'Sales') },
          { name: tx('مراجعة عقود الموردين', 'Review supplier contracts'), assignee: 'maryam', due: '2026-10-06', status: 'todo', priority: 'urgent', field: tx('المشتريات', 'Procurement') },
          { name: tx('تجهيز استبيان العملاء', 'Prepare the customer survey'), assignee: 'noura', due: '2026-10-08', status: 'review', priority: 'normal', field: tx('التسويق', 'Marketing') }];
        const COLS = () => [['name', 'Task name', true], ['status', 'Status', true], ['assignee', 'Assignee', true], ['due', 'Due date', true], ['priority', 'Priority', true], ['field', tx('الإدارة', 'Department'), false]];
        box.innerHTML = '<div class="ie-exp"><div class="ie-cols"><p class="field-label">' + tx('الأعمدة', 'Columns') + '</p>' + COLS().map(c => '<label class="check"><input type="checkbox" data-col="' + c[0] + '"' + (c[2] ? ' checked' : '') + '> ' + c[1] + '</label>').join('') +
          '<p class="field-label" style="margin-top:10px">' + tx('الصيغة', 'Format') + '</p><label class="check"><input type="radio" name="fmt" value="csv" checked> CSV</label><label class="check"><input type="radio" name="fmt" value="xls"> ' + tx('CSV مناسب لـ Excel (يحفظ العربية)', 'Excel-friendly CSV (keeps Arabic)') + '</label>' +
          '<button type="button" class="btn btn-primary" data-doexport>' + icon('download', 'icon-sm') + tx('صدّر وحمّل الملف', 'Export and download') + '</button></div>' +
          '<div class="ie-preview"><p class="field-label">' + tx('معاينة ', 'Preview · ') + (s.tasks && s.tasks.length ? tx('المهام التي استوردتها', 'the tasks you imported') : tx('مهام تجريبية', 'sample tasks')) + '</p><pre data-csvprev dir="auto"></pre><div class="ie-file ie-got" data-got hidden>' + icon('check-circle') + '<b>clickup-export.csv</b></div></div></div>';
        const build = () => { const cols = COLS().filter(c => $('[data-col="' + c[0] + '"]', box).checked); const lines = [cols.map(c => c[1]).join(',')].concat(tasks.map(t => cols.map(c => csvCell(c[0] === 'status' ? STATUS[t.status].en : c[0] === 'assignee' ? (t.assignee ? PN(t.assignee) : '') : c[0] === 'priority' ? (t.priority ? PRIORITY[t.priority].en : '') : (t[c[0]] || ''))).join(','))); return lines.join('\r\n'); };
        const prev = () => { $('[data-csvprev]', box).textContent = build(); };
        prev();
        const onChange = e => { if (e.target.dataset.col) prev(); };
        const onClick = e => {
          if (!e.target.closest('[data-doexport]')) return;
          const xls = $('input[name="fmt"]:checked', box).value === 'xls';
          downloadFile('clickup-export.csv', (xls ? '﻿' : '') + build());
          const got = $('[data-got]', box); got.hidden = false; got.classList.remove('tip-in'); void got.offsetWidth; got.classList.add('tip-in');
          Sound.play('success'); toast(tx('حُمّل الملف clickup-export.csv', 'Downloaded clickup-export.csv'));
        };
        panel.addEventListener('change', onChange); panel.addEventListener('click', onClick);
        return () => { panel.removeEventListener('change', onChange); panel.removeEventListener('click', onClick); };
      } },
      { ic: 'list', label: tx('في ClickUp', 'In ClickUp'), html: () => wsKicker(tx('داخل ClickUp', 'Inside ClickUp'), tx('الخطوات الحقيقية', 'The real steps')) +
        '<div class="ie-two"><div><h3 class="ws-h3">' + icon('upload', 'icon-sm') + 'Import</h3>' + wsSteps([
          tx('افتح إعدادات مساحة العمل واختر Imports، أو استخدم خيار الاستيراد من قائمة + في Space.', 'Open your Workspace settings and choose Imports, or use the import option from a Space’s + menu.'),
          tx('اختر المصدر: ملف CSV أو Excel، أو تطبيقاً آخر.', 'Choose the source: a CSV or Excel file, or another app.'),
          tx('ارفع الملف أو اربط التطبيق.', 'Upload the file or connect the app.'),
          tx('اربط كل عمود بحقل في ClickUp، واختر القائمة التي ستستقبل المهام.', 'Map each column to a ClickUp field and choose the List that will receive the tasks.'),
          tx('ابدأ الاستيراد، ثم راجع المهام.', 'Start the import, then check the tasks.')
        ]) + '</div><div><h3 class="ws-h3">' + icon('download', 'icon-sm') + 'Export</h3>' + wsSteps([
          tx('افتح القائمة في عرض List أو Table.', 'Open the List in List or Table view.'),
          tx('افتح قائمة خيارات العرض (…) واختر Export view.', 'Open the view options (…) and choose Export view.'),
          tx('اختر CSV أو Excel والأعمدة المطلوبة.', 'Choose CSV or Excel and the columns you need.'),
          tx('حمّل الملف. تصدير مساحة العمل كاملة من الإعدادات للمسؤولين.', 'Download the file. Exporting the whole Workspace is in settings, for admins.')
        ]) + '</div></div>' + wsVersion() },
      { ic: 'info', label: tx('معلومات مهمة', 'Good to know'), html: () => wsKicker(tx('قبل الاستيراد', 'Before you import'), tx('جهّز جدولك لنتيجة نظيفة', 'Prepare your sheet for a clean result')) + wsCards([
          ['table', '#1fb6e0', tx('صف لكل مهمة', 'One row per task'), tx('صف عناوين واحد في الأعلى، وصف واحد لكل مهمة، بلا خلايا مدمجة.', 'One header row at the top and one row per task, with no merged cells.')],
          ['calendar', '#f5a524', tx('تواريخ متسقة', 'Consistent dates'), tx('اكتب كل التواريخ بالصيغة نفسها، مثل 2026-10-04.', 'Write every date in the same format, such as 2026-10-04.')],
          ['user', '#e44bb6', tx('المسؤولون أعضاء', 'Assignees are members'), tx('استخدم أسماء أو بريد أعضاء مساحة العمل حتى يُعيَّنوا تلقائياً.', 'Use the names or emails of Workspace members so they are assigned automatically.')],
          ['flask', '#22c38e', tx('جرّب صغيراً', 'Start small'), tx('استورد 5 صفوف أولاً وتأكد من النتيجة قبل الملف كاملاً.', 'Import 5 rows first and check the result before the whole file.')],
          ['lock', '#ff4d6d', tx('احمِ الملفات المصدّرة', 'Protect exported files'), tx('الملفات المصدّرة قد تحتوي بيانات حساسة، فاحفظها حسب سياسة المؤسسة.', 'Exported files can contain sensitive data, so store them according to company policy.')]
        ]) + wsFaq([
          [tx('هل تُستورد الحالات كما هي؟', 'Are statuses imported as they are?'), tx('تُربط بحالات القائمة. إن لم تطابق حالة موجودة، راجعها بعد الاستيراد أو أضفها للقائمة أولاً.', 'They are matched to the List’s statuses. If one doesn’t match, review it after import or add it to the List first.')],
          [tx('ماذا يصدّر Export view؟', 'What does Export view include?'), tx('المهام والأعمدة الظاهرة في ذلك العرض، بما فيها أثر المرشّحات.', 'The tasks and columns visible in that view, including the effect of filters.')]
        ]) }
    ]
  },

  /* ---------------- Templates ---------------- */
  templates: {
    dark: '#0f7f58',
    title: () => tx('القوالب: ابدأ جاهزاً ولا تكرر العمل', 'Templates: start ready, never repeat the setup'),
    sub: () => tx('اختر قالباً من مركز القوالب، أو احفظ عملك كقالب وأعد استخدامه بنقرة.', 'Pick one from the Template Center, or save your own work as a template and reuse it in one click.'),
    steps: () => [
      { ic: 'bulb', label: tx('ما هي؟', 'What are they?'), html: () => wsKicker(tx('الفكرة', 'The idea'), tx('القالب نسخة جاهزة من هيكل عمل تعيد استخدامه متى شئت', 'A template is a ready copy of a work structure you can reuse any time')) +
        '<div class="tp-stamp" aria-hidden="true"><span class="stamp">' + icon('template') + '</span>' + [0, 1, 2].map(i => '<span class="stamp-copy" style="--k:' + i + '"><b>' + tx('تقرير أسبوعي', 'Weekly report') + '</b><i></i><i></i><i></i></span>').join('') + '</div>' +
        wsCards([
          ['checklist', '#22c38e', tx('قوالب المهام', 'Task templates'), tx('مهمة بمهامها الفرعية وقائمة تحققها، مثل «طلب عميل جديد».', 'A task with its subtasks and checklist, such as “new customer request”.')],
          ['list', '#7b68ee', tx('قوالب القوائم والمجلدات', 'List and Folder templates'), tx('هيكل كامل بالحالات والحقول والمهام، مثل «خطة فعالية».', 'A full structure with statuses, fields and tasks, such as “event plan”.')],
          ['doc', '#e44bb6', tx('قوالب المستندات والعروض', 'Doc and view templates'), tx('محضر اجتماع جاهز، أو عرض Board بمرشّحاته.', 'A ready meeting-notes Doc, or a Board view with its filters.')]
        ]) },
      { ic: 'layers', label: tx('اختر قالباً', 'Choose a template'), html: () => wsKicker(tx('مركز القوالب', 'Template Center'), tx('اختر قالباً واستخدمه', 'Pick a template and use it')) + '<div class="tc" data-tc></div>', mount: panel => {
        const box = $('[data-tc]', panel);
        const T = () => [
          { id: 'weekly', cat: 'rep', ic: 'chart', c: '#4f86f7', type: 'List', t: tx('تقرير أسبوعي', 'Weekly report'), st: ['todo', 'progress', 'review', 'done'], f: [tx('الإدارة', 'Department'), tx('الأسبوع', 'Week')], tasks: [tx('جمع الأرقام', 'Collect the figures'), tx('كتابة الملخص', 'Write the summary'), tx('مراجعة المدير', 'Manager review')] },
          { id: 'intake', cat: 'ops', ic: 'inbox', c: '#1fb6e0', type: 'List + Form', t: tx('استقبال طلبات العملاء', 'Customer request intake'), st: ['todo', 'progress', 'done'], f: [tx('نوع الطلب', 'Request type'), tx('القناة', 'Channel')], tasks: [tx('فرز الطلب', 'Triage the request'), tx('تعيين مسؤول', 'Assign an owner'), tx('الرد على العميل', 'Reply to the customer')] },
          { id: 'onboard', cat: 'hr', ic: 'users', c: '#e44bb6', type: 'List', t: tx('تهيئة موظف جديد', 'New employee onboarding'), st: ['todo', 'progress', 'done'], f: [tx('الإدارة', 'Department'), tx('تاريخ البدء', 'Start date')], tasks: [tx('تجهيز الجهاز والحساب', 'Prepare device and account'), tx('جولة تعريفية', 'Welcome tour'), tx('خطة أول 30 يوماً', 'First 30-day plan')] },
          { id: 'event', cat: 'proj', ic: 'calendar', c: '#f5a524', type: 'Folder', t: tx('خطة فعالية', 'Event plan'), st: ['todo', 'progress', 'review', 'done'], f: [tx('الميزانية', 'Budget'), tx('المكان', 'Venue')], tasks: [tx('حجز القاعة', 'Book the venue'), tx('الدعوات', 'Invitations'), tx('التجهيزات', 'Logistics')] },
          { id: 'audit', cat: 'ops', ic: 'checklist', c: '#22c38e', type: 'List', t: tx('متابعة ملاحظات التدقيق', 'Audit follow-up'), st: ['todo', 'progress', 'review', 'done'], f: [tx('الخطورة', 'Severity')], tasks: [tx('تحليل السبب', 'Root cause'), tx('خطة التصحيح', 'Corrective plan'), tx('إغلاق الملاحظة', 'Close the finding')] },
          { id: 'notes', cat: 'proj', ic: 'doc', c: '#a855f7', type: 'Doc', t: tx('محضر اجتماع', 'Meeting notes'), st: [], f: [], tasks: [tx('الحضور', 'Attendees'), tx('القرارات', 'Decisions'), tx('المهام التالية', 'Next actions')] }
        ];
        const CATS = () => [['', tx('الكل', 'All')], ['ops', tx('العمليات', 'Operations')], ['rep', tx('التقارير', 'Reporting')], ['hr', tx('الموارد البشرية', 'HR')], ['proj', tx('المشاريع', 'Projects')]];
        const s = UIState.get('tc') || { cat: '', sel: 'weekly', made: [] };
        const paint = () => {
          const list = T().filter(x => !s.cat || x.cat === s.cat); const cur = T().find(x => x.id === s.sel) || T()[0];
          box.innerHTML = '<div class="tc-win"><div class="tc-head">' + icon('template', 'icon-sm') + '<b>Template Center</b><div class="cuq-cats">' + CATS().map(c => '<button type="button" data-tcat="' + c[0] + '" aria-pressed="' + (s.cat === c[0]) + '">' + c[1] + '</button>').join('') + '</div></div>' +
            '<div class="tc-body"><div class="tc-grid">' + list.map(x => '<button type="button" class="tc-card' + (x.id === cur.id ? ' on' : '') + '" data-tsel="' + x.id + '" style="--tc:' + x.c + '" aria-pressed="' + (x.id === cur.id) + '"><span class="ic-tile">' + icon(x.ic) + '</span><b>' + x.t + '</b><small>' + x.type + '</small></button>').join('') + '</div>' +
            '<div class="tc-prev" style="--tc:' + cur.c + '"><span class="ic-tile">' + icon(cur.ic) + '</span><h3>' + cur.t + '</h3><span class="chip">' + cur.type + '</span>' +
            (cur.st.length ? '<p class="field-label">Statuses</p><p class="tc-st">' + cur.st.map(k => '<span class="mx-status st-' + k + '">' + STATUS[k].en + '</span>').join('') + '</p>' : '') +
            (cur.f.length ? '<p class="field-label">Custom Fields</p><p>' + cur.f.map(f => '<span class="chip">' + icon('table', 'icon-sm') + f + '</span>').join(' ') + '</p>' : '') +
            '<p class="field-label">' + (cur.type === 'Doc' ? tx('الأقسام', 'Sections') : tx('المهام', 'Tasks')) + '</p><ul>' + cur.tasks.map(t => '<li>' + icon('check', 'icon-sm') + t + '</li>').join('') + '</ul>' +
            '<button type="button" class="btn btn-primary" data-tuse="' + cur.id + '">' + icon('plus', 'icon-sm') + 'Use template</button></div></div></div>' +
            '<div class="tc-side"><p class="field-label">' + tx('مساحتك', 'Your Space') + ' · ' + L_OPS() + '</p>' + ['weekly-base'].concat(s.made).map((m, i) => { const x = m === 'weekly-base' ? null : T().find(y => y.id === m); return '<div class="tc-made' + (x && i === s.made.length ? ' new' : '') + '">' + icon(x ? (x.type === 'Doc' ? 'doc' : x.type === 'Folder' ? 'folder' : 'list') : 'list', 'icon-sm') + '<span>' + (x ? x.t : L_REQ()) + '</span>' + (x ? '<span class="chip">' + tx('من قالب', 'From template') + '</span>' : '') + '</div>'; }).join('') + '</div>';
        };
        paint();
        const onClick = e => {
          const c = e.target.closest('[data-tcat]'); if (c) { s.cat = c.dataset.tcat; UIState.set('tc', s); paint(); return; }
          const sl = e.target.closest('[data-tsel]'); if (sl) { s.sel = sl.dataset.tsel; UIState.set('tc', s); paint(); const again = $('[data-tsel="' + s.sel + '"]', box); if (again) again.focus(); return; }
          const u = e.target.closest('[data-tuse]'); if (u) { s.made.push(u.dataset.tuse); UIState.set('tc', s); paint(); Motion.confetti($('.tc-side', box), 45); toast(tx('أُنشئ من القالب في مساحتك', 'Created from the template in your Space')); }
        };
        panel.addEventListener('click', onClick);
        return () => panel.removeEventListener('click', onClick);
      } },
      { ic: 'plus', label: tx('أنشئ قالبك', 'Create your own'), html: () => wsKicker(tx('أنشئ قالبك', 'Create your own'), tx('احفظ هذه المهمة كقالب، ثم استخدمه', 'Save this task as a template, then use it')) + '<div class="mk" data-mk></div>', mount: panel => {
        const box = $('[data-mk]', panel);
        const s = UIState.get('mk') || { name: tx('تقرير الأداء الشهري', 'Monthly performance report'), inc: { subs: true, check: true, fields: true, assg: false, dates: true }, share: 'ws', saved: null, used: 0 };
        const INC = () => [['subs', tx('المهام الفرعية', 'Subtasks')], ['check', tx('قوائم التحقق', 'Checklists')], ['fields', 'Custom Fields'], ['assg', tx('المسؤولون', 'Assignees')], ['dates', tx('التواريخ (تُعاد جدولتها)', 'Dates (remapped)')]];
        const task = inc => '<div class="mk-task"><div class="au-trow"><span class="mx-status st-todo">TO DO</span><b>' + esc(s.name) + '</b>' + (inc.assg ? DM.av('noura', 22) : '') + '</div>' +
          '<p class="au-tmeta">' + (inc.dates ? '<span class="chip">' + icon('calendar', 'icon-sm') + tx('بعد 30 يوماً', 'In 30 days') + '</span>' : '') + (inc.fields ? '<span class="chip">' + icon('table', 'icon-sm') + tx('الإدارة: العمليات', 'Department: Operations') + '</span>' : '') + DM.pr('high') + '</p>' +
          (inc.subs ? '<p class="mk-sub">' + icon('subtask', 'icon-sm') + tx('جمع الأرقام · إعداد الرسوم · المراجعة', 'Collect figures · Build charts · Review') + '</p>' : '') +
          (inc.check ? '<p class="mk-sub">' + icon('checklist', 'icon-sm') + tx('قائمة تحقق: 4 بنود', 'Checklist: 4 items') + '</p>' : '') + '</div>';
        const paint = () => {
          box.innerHTML = '<div class="mk-grid"><div><p class="field-label">' + tx('المهمة الأصلية', 'The original task') + '</p>' + task({ subs: true, check: true, fields: true, assg: true, dates: true }) +
            '<form class="mk-form" data-mkform><p class="field-label">' + icon('template', 'icon-sm') + ' Save as template</p>' +
            '<div class="field"><label for="mkName">' + tx('اسم القالب', 'Template name') + '</label><input class="input" id="mkName" value="' + esc(s.name) + '"></div>' +
            '<p class="field-label">' + tx('ما الذي يُضمَّن؟', 'What to include') + '</p><div class="mk-inc">' + INC().map(o => '<label class="check"><input type="checkbox" data-inc="' + o[0] + '"' + (s.inc[o[0]] ? ' checked' : '') + '> ' + o[1] + '</label>').join('') + '</div>' +
            '<p class="field-label">' + tx('المشاركة', 'Sharing') + '</p><div class="seg" role="group"><button type="button" data-share="me" aria-pressed="' + (s.share === 'me') + '">' + tx('أنا فقط', 'Only me') + '</button><button type="button" data-share="ws" aria-pressed="' + (s.share === 'ws') + '">' + tx('كل مساحة العمل', 'Whole Workspace') + '</button></div>' +
            '<button type="submit" class="btn btn-primary">' + icon('template', 'icon-sm') + tx('احفظ القالب', 'Save template') + '</button></form></div>' +
            '<div><p class="field-label">' + tx('قوالبي', 'My templates') + '</p>' + (s.saved ? '<div class="mk-saved"><span class="ic-tile" style="--tc:#22c38e">' + icon('template') + '</span><div><b>' + esc(s.saved.name) + '</b><small>' + (s.saved.share === 'ws' ? tx('مشترك مع مساحة العمل', 'Shared with the Workspace') : tx('لك فقط', 'Only you')) + '</small></div><button type="button" class="btn btn-secondary btn-sm" data-mkuse>' + icon('plus', 'icon-sm') + 'Use</button></div>' : '<div class="empty-state">' + icon('template') + '<p>' + tx('احفظ القالب ليظهر هنا.', 'Save the template to see it here.') + '</p></div>') +
            (s.used ? '<p class="field-label" style="margin-top:12px">' + tx('مهام جديدة من القالب', 'New tasks from the template') + '</p>' + Array.from({ length: s.used }, () => task(s.saved.inc)).join('') + '<p class="help-text">' + tx('لاحظ: ما لم تضمّنه (مثل المسؤول) لا يظهر في المهمة الجديدة.', 'Notice: what you did not include (such as the assignee) does not appear in the new task.') + '</p>' : '') + '</div></div>';
        };
        paint();
        const onClick = e => {
          const sh = e.target.closest('[data-share]'); if (sh) { s.share = sh.dataset.share; UIState.set('mk', s); $$('[data-share]', box).forEach(b => b.setAttribute('aria-pressed', b === sh)); return; }
          if (e.target.closest('[data-mkuse]')) { s.used++; UIState.set('mk', s); paint(); Motion.confetti($('[data-mkuse]', box) || box, 40); }
        };
        const onChange = e => { if (e.target.dataset.inc) { s.inc[e.target.dataset.inc] = e.target.checked; UIState.set('mk', s); } };
        const onInput = e => { if (e.target.id === 'mkName') { s.name = e.target.value; UIState.set('mk', s); } };
        const onSubmit = e => { if (!e.target.matches('[data-mkform]')) return; e.preventDefault(); if (!s.name.trim()) { toast(tx('اكتب اسماً للقالب.', 'Give the template a name.')); Sound.play('error'); return; } s.saved = { name: s.name.trim(), inc: Object.assign({}, s.inc), share: s.share }; s.used = 0; UIState.set('mk', s); paint(); Sound.play('success'); toast(tx('حُفظ القالب', 'Template saved')); };
        panel.addEventListener('click', onClick); panel.addEventListener('change', onChange); panel.addEventListener('input', onInput); panel.addEventListener('submit', onSubmit);
        return () => { panel.removeEventListener('click', onClick); panel.removeEventListener('change', onChange); panel.removeEventListener('input', onInput); panel.removeEventListener('submit', onSubmit); };
      } },
      { ic: 'list', label: tx('في ClickUp', 'In ClickUp'), html: () => wsKicker(tx('داخل ClickUp', 'Inside ClickUp'), tx('الخطوات الحقيقية', 'The real steps')) +
        '<div class="ie-two"><div><h3 class="ws-h3">' + icon('layers', 'icon-sm') + tx('استخدم قالباً', 'Use a template') + '</h3>' + wsSteps([
          tx('اضغط + لإنشاء Space أو Folder أو List أو مهمة، واختر Templates، أو افتح Template Center.', 'Press + to create a Space, Folder, List or task and choose Templates, or open the Template Center.'),
          tx('تصفّح أو ابحث، وافتح المعاينة لترى ما يتضمنه.', 'Browse or search, and open the preview to see what it includes.'),
          tx('اضغط Use template، واختر المكان والخيارات مثل التواريخ.', 'Press Use template and choose the location and options such as dates.')
        ]) + '</div><div><h3 class="ws-h3">' + icon('template', 'icon-sm') + tx('احفظ قالبك', 'Save your own') + '</h3>' + wsSteps([
          tx('افتح المهمة أو القائمة أو المستند الذي تريد تكراره.', 'Open the task, List or Doc you want to reuse.'),
          tx('افتح قائمة الخيارات (…) ثم Templates ثم Save as template.', 'Open the options menu (…), then Templates, then Save as template.'),
          tx('سمّه، واختر ما يتضمنه، وحدد من يستطيع استخدامه.', 'Name it, choose what to include and who can use it.')
        ]) + '</div></div>' + wsVersion() },
      { ic: 'info', label: tx('معلومات مهمة', 'Good to know'), html: () => wsKicker(tx('قوالب ناجحة', 'Templates that work'), tx('نصائح لقوالب يحبها الفريق', 'Tips for templates your team will love')) + wsCards([
          ['tag', '#22c38e', tx('أسماء واضحة', 'Clear names'), tx('اسم يقول متى يُستخدم، مثل «طلب عميل – شكوى».', 'A name that says when to use it, such as “Customer request – complaint”.')],
          ['user', '#e44bb6', tx('بلا أسماء ثابتة', 'No fixed people'), tx('في القوالب العامة لا تضمّن المسؤولين، ودع كل فريق يعيّن من يناسبه.', 'In general templates, leave assignees out and let each team assign its own.')],
          ['calendar', '#f5a524', tx('أعد جدولة التواريخ', 'Remap dates'), tx('اجعل التواريخ نسبية لتبدأ من يوم الاستخدام.', 'Make dates relative so they start from the day you use the template.')],
          ['repeat', '#7b68ee', tx('حدّثها', 'Keep them updated'), tx('عندما يتغير الإجراء، حدّث القالب حتى لا يتكرر القديم.', 'When a process changes, update the template so the old one isn’t repeated.')]
        ]) + wsFaq([
          [tx('هل تغيير القالب يغيّر ما أُنشئ منه؟', 'Does changing a template change what was made from it?'), tx('لا، ما أُنشئ سابقاً يبقى كما هو. التغيير يظهر في الاستخدامات الجديدة فقط.', 'No, what was created earlier stays as it is. Changes appear only in new uses.')],
          [tx('من يستطيع رؤية قالبي؟', 'Who can see my template?'), tx('بحسب إعداد المشاركة عند الحفظ: أنت فقط أو أعضاء مساحة العمل.', 'It depends on the sharing you chose when saving: only you, or Workspace members.')]
        ]) }
    ]
  }
};
const PPL_IE = () => ['salim', 'maryam', 'noura', 'khalid', 'me'];
