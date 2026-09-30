/* ==========================================================================
   Clicky chatbot. A floating helper on every page: ask anything about
   ClickUp or this platform in Arabic or English, and Clicky answers from the
   platform's own knowledge (common questions, the 12 tour parts, glossary,
   lessons and workshops) with links to watch or try it. With a server
   configured (api.js), questions go to /clicky first and the local
   knowledge is the fallback.
   ========================================================================== */
const Clicky = (() => {
  const log = []; // the conversation survives page changes
  let open = false, busy = false, root = null, stopType = () => {};

  /* ---- Language helpers: Arabic normalisation, stop words, synonyms ---- */
  const STOP = new Set('how do does i the a an to can could what is are my in of for and with it on you me where why when which should would will please about this that from be at or your our we us there any get use using ClickUp clickup كيف ما ماذا هل في من على الى إلى عن ان أن هو هي لا او أو و مع اين أين لماذا هذا هذه ذلك التي الذي كل عند انا أنا لي لدي يمكن يمكنني أستطيع استطيع اريد أريد'.split(' ').map(w => w.toLowerCase()));
  const SYN = [
    ['notif', 'notification notifications notify inbox alert alerts إشعار اشعار إشعارات اشعارات الاشعارات تنبيه تنبيهات'],
    ['assign', 'assign assigned assignee assignees owner owners مسؤول المسؤول مسند اسند أسند تعيين عين'],
    ['due', 'due deadline deadlines date dates overdue late موعد مواعيد تاريخ استحقاق متأخر متاخر'],
    ['repeat', 'repeat repeats recurring recurrence every sunday تكرار متكرر متكررة تتكرر الأحد الاحد'],
    ['boss', 'manager managers boss مدير مديري المدير لمديري للمدير'],
    ['checklist', 'checklist checklists تحقق'],
    ['import', 'import importing excel csv spreadsheet sheet xlsx استيراد استورد اكسل إكسل جدول ملف'],
    ['export', 'export download exporting تصدير صدر اصدر أصدر تحميل حمل'],
    ['template', 'template templates reuse قالب قوالب'],
    ['auto', 'automation automations automate automatic automatically trigger action أتمتة اتمتة الأتمتة تلقائي تلقائيا تلقائياً'],
    ['ai', 'ai brain summarize summary summarise gpt ذكاء اصطناعي الذكاء لخص تلخيص ملخص'],
    ['dash', 'dashboard dashboards report reports reporting chart charts kpi لوحة لوحات تقرير تقارير رسم'],
    ['share', 'share sharing guest guests vendor contractor external outside permission permissions private مشاركة شارك ضيف مورد مقاول خارج صلاحية صلاحيات خاص خاصة'],
    ['view', 'view views board calendar gantt table workload list عرض طرق'],
    ['subtask', 'subtask subtasks steps break smaller خطوات فرعية فرعي أصغر'],
    ['comment', 'comment comments mention mentions reply email @ تعليق تعليقات اشارة إشارة بريد رد'],
    ['struct', 'space spaces folder folders workspace hierarchy مساحة مساحات مجلد مجلدات هيكل'],
    ['search', 'search find lost locate بحث ابحث اعثر أجد اجد'],
    ['mobile', 'mobile phone iphone android جوال الجوال هاتف ميداني'],
    ['form', 'form forms request requests intake نموذج نماذج طلب طلبات'],
    ['goal', 'goal goals target targets kpi objective هدف أهداف مستهدف مؤشر'],
    ['time', 'time timer track tracking estimate وقت الوقت مؤقت تتبع تقدير'],
    ['task', 'task tasks todo مهمة مهام المهمة المهام'],
    ['forum', 'forum community colleagues منتدى زملاء'],
    ['lang', 'language arabic english لغة عربي عربية العربية'],
    ['start', 'start begin beginner new first access login أبدأ ابدأ بداية جديد الوصول']
  ];
  const SYN_MAP = {}; SYN.forEach(([k, ws]) => ws.split(' ').forEach(w => { SYN_MAP[norm1(w)] = k; }));
  function norm1(w) {
    w = w.toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
    if (/^[؀-ۿ]/.test(w) && w.length > 4) w = w.replace(/^(وال|بال|فال|كال|لل|ال|و)/, '');
    if (/^[؀-ۿ]/.test(w) && w.length > 4) w = w.replace(/ا$/, '');
    return w;
  }
  function tokens(text) {
    return String(text).toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').split(/[^\p{L}\p{N}@]+/u).filter(Boolean).filter(w => !STOP.has(w)).map(norm1).filter(w => w.length > 1).flatMap(w => SYN_MAP[w] && SYN_MAP[w] !== w ? [w, SYN_MAP[w]] : [w]);
  }

  /* ---- The knowledge Clicky answers from (built in the current language) ---- */
  function knowledge() {
    const K = [];
    const add = (title, text, links, extra, w, def) => K.push({ title, text, links, w: w || 1, def: !!def, n: new Set(tokens(title)).size, t: new Set(tokens(title + ' ' + (extra || ''))), b: new Set(tokens(text)) });
    CLICKY_KB.forEach(r => add(tp(r[2]), tp(r[3]), [r[5] ? ['fwd', tx('افتح', 'Open'), r[5]] : null, ['compass', tx('في الجولة', 'In the tour'), '#/tour/' + r[0]]].filter(Boolean), r[2][0] + ' ' + r[2][1] + ' ' + r[4], 1.2, /^(what|ما )/i.test(r[2][1]) || /^ما (هو|هي|هم)/.test(r[2][0])));
    CU_FAQ.forEach(f => add(tp(f.q), tp(f.a), [f.demo ? ['play', tx('شاهد الدرس', 'Watch the lesson'), '#/lesson/' + f.demo] : null, f.go ? ['robot', tx('جرّبها', 'Try it'), f.go] : null, ['compass', tx('في الجولة', 'In the tour'), '#/tour/' + f.part]].filter(Boolean), '', 1.35));
    TOUR_PARTS.forEach(p => add(tp(p.name), tp(p.one) + ' ' + tx('أين تجده: ', 'Where: ') + tp(p.where), [['compass', tx('افتح هذا الجزء', 'Open this part'), '#/tour/' + p.id], ['book', tx('الدرس', 'Lesson'), '#/lesson/' + p.lesson]], p.name[0] + ' ' + p.name[1] + ' ' + p.how.map(tp).join(' '), 1, true));
    WORKSHOPS().forEach(w => add(w.t, w.d, [['robot', tx('افتح الورشة', 'Open the workshop'), w.href]]));
    GLOSSARY.forEach(g => add(g.en + (isEN() ? '' : ' (' + g.ar + ')'), t(g.def), g.lesson && LESSON[g.lesson] ? [['book', tx('تعلّمه', 'Learn it'), '#/lesson/' + g.lesson]] : [['tag', tx('المصطلحات', 'Glossary'), '#/help/glossary']], g.ar, 1.1, true));
    LESSONS.forEach(l => add(t(l.title), t(l.objective), [['play', tx('افتح الدرس', 'Open the lesson'), '#/lesson/' + l.id]]));
    [
      [tx('كيف أستخدم هذا الموقع؟', 'How do I use this website?'), tx('ابدأ بجولة ClickUp، ثم الدروس، ثم الورش والمختبر. الدليل يشرح كل خطوة.', 'Start with the ClickUp tour, then the lessons, then the workshops and the lab. The guide explains each step.'), '#/guide', 'guide help website site موقع دليل منصة'],
      [tx('المنتدى', 'The forum'), tx('اطرح سؤالاً أو شارك نصيحة، ووافق وأعجب وعلّق على منشورات زملائك.', 'Ask a question or share a tip, and agree, like and comment on colleagues’ posts.'), '#/forum', 'forum community منتدى'],
      [tx('اسأل الفريق', 'Ask the team'), tx('أرسل سؤالك إلى فريق الدعم من صفحة أسئلة الفريق.', 'Send your question to the support team from the Team questions page.'), '#/support', 'support team help problem error دعم فريق مشكلة خطأ'],
      [tx('اقترح ميزة', 'Suggest a feature'), tx('اكتب الميزة التي تتمنّاها في صفحة الاقتراحات.', 'Write the feature you hope to see on the ideas page.'), '#/ideas', 'idea feature suggest فكرة ميزة اقتراح'],
      [tx('تقدّمي', 'My progress'), tx('صفحة «تقدّمي» تعرض الدروس والاختبارات والشارات.', 'The My Progress page shows your lessons, quizzes and badges.'), '#/progress', 'progress badges score تقدم شارات نتيجة']
    ].forEach(x => add(x[0], x[1], [['fwd', tx('افتح', 'Open'), x[2]]], x[3]));
    return K;
  }
  /* Knowledge is cached per language, with its vocabulary for typo repair. */
  let cache = null;
  function kb() {
    if (cache && cache.lang === LANG) return cache;
    const K = knowledge(), vocab = new Set();
    K.forEach(k => { k.t.forEach(w => vocab.add(w)); k.b.forEach(w => vocab.add(w)); });
    Object.keys(SYN_MAP).forEach(w => vocab.add(w));
    return (cache = { lang: LANG, K, vocab: [...vocab] });
  }
  function dist(a, b, max) { // Levenshtein with an early exit
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let low = i;
      for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); low = Math.min(low, cur[j]); }
      if (low > max) return max + 1; prev = cur;
    }
    return prev[b.length];
  }
  // Unknown words (typos like "notifcations" or "اتمتت") snap to the closest known word.
  function repair(qt) {
    const { vocab } = kb(), known = new Set(vocab);
    return qt.flatMap(w => {
      if (known.has(w) || w.length < 4) return [w];
      const max = w.length > 7 ? 2 : 1; let best = w, bd = max + 1;
      for (const v of vocab) { if (Math.abs(v.length - w.length) > max) continue; const d = dist(w, v, max); if (d < bd) { bd = d; best = v; if (d === 1 && max === 1) break; } }
      if (best === w) return [w];
      const fixed = [{ w: best, f: .6 }]; if (SYN_MAP[best] && SYN_MAP[best] !== best) fixed.push({ w: SYN_MAP[best], f: .6 });
      return fixed;
    });
  }
  function score(qt, q) {
    const { K } = kb(); const whatIs = /^\s*(what\s+is|what\s+are|what's|whats|define|ما\s*هي|ما\s*هو|ماهي|ماهو|ما\s*معنى|ما\s*المقصود)/i.test(q);
    const seen = new Set();
    return K.map(k => { let s = 0; qt.forEach(x => { const w = x.w || x, f = x.f || 1; if (k.t.has(w)) s += 3 * f; else if (k.b.has(w)) s += f; }); return { k, s: k.w * (whatIs && k.def ? 1.8 : 1) * s / Math.sqrt(Math.min(k.t.size, k.n + 6) + 3) }; })
      .filter(x => x.s > 0).sort((a, b) => b.s - a.s).filter(x => !seen.has(x.k.title) && seen.add(x.k.title));
  }
  const FOLLOW = /^\s*((and|also|what about|how about|and if|then|same)\b|(طيب|وماذا|وكيف|وإذا|واذا|وهل|وعلى|وفي|ومن|ماذا عن|نفس)(\s|$))/i;
  let lastTopic = null; // tokens of the last answered question, for follow-ups
  function answer(q) {
    let qt = repair(tokens(q)); if (!qt.length) return null;
    let scored = score(qt, q);
    // Follow-ups ("and in the app?", "وعلى الجوال؟") borrow the previous topic.
    if (lastTopic && (FOLLOW.test(q) ? !scored.length || scored[0].s < 1.2 : qt.length <= 2 && scored.length && scored[0].s < .55)) {
      const merged = score(qt.concat(lastTopic.map(w => ({ w, f: .35 }))), q);
      if (merged.length && (!scored.length || merged[0].s > scored[0].s)) scored = merged;
    }
    if (!scored.length) return null;
    if (scored[0].s < 0.55) return scored[0].s >= 0.2 ? { guess: scored.slice(0, 3).map(x => x.k) } : null;
    // A weak tie means the question is vague: offer choices instead of guessing one.
    if (scored[0].s < 1.5 && scored[1] && scored[1].s >= scored[0].s * .9) return { guess: scored.slice(0, 3).map(x => x.k) };
    lastTopic = qt.filter(x => typeof x === 'string').slice(0, 8);
    return { best: scored[0].k, more: scored.slice(1, 3).map(x => x.k), s: scored.slice(0, 3).map(x => +x.s.toFixed(2)) };
  }
  const SMALL = [
    [/^(hi|hello|hey|salam|hola|مرحبا|مرحباً|اهلا|أهلا|هلا|السلام|صباح|مساء)/i, () => tx('أهلاً! أنا Clicky. اسألني أي شيء عن ClickUp، مثل «كيف أكرر مهمة كل أحد؟».', 'Hi! I’m Clicky. Ask me anything about ClickUp, like “how do I repeat a task every Sunday?”.')],
    [/(thank|thanks|thx|شكرا|شكراً|مشكور|يعطيك)/i, () => tx('العفو! سعيد بمساعدتك. هل لديك سؤال آخر؟', 'You’re welcome! Happy to help. Anything else?')],
    [/(who are you|what are you|your name|من انت|من أنت|اسمك)/i, () => tx('أنا Clicky، مساعد منصة تعلّم ClickUp لموظفي Omantel. أجيب عن أسئلتك وأدلّك على الدرس أو الورشة المناسبة.', 'I’m Clicky, the helper of the ClickUp Learning Hub for Omantel employees. I answer your questions and point you to the right lesson or workshop.')]
  ];
  const suggestions = () => {
    const ids = ['start-where', 'weekly-repeat', 'excel-import', 'auto-move', 'notifs', 'vendor', 'ai-summary', 'assign'];
    const pick = ids.sort(() => Math.random() - .5).slice(0, 3).map(id => CU_FAQ.find(f => f.id === id)).filter(Boolean);
    return pick.map(f => tp(f.q));
  };

  /* ---- UI ---- */
  const $log = () => $('.cc-log', root);
  function bubble(html, who) {
    const el = document.createElement('div'); el.className = 'cc-msg ' + (who === 'me' ? 'me' : 'bot'); el.innerHTML = html;
    $log().appendChild(el); $log().scrollTop = $log().scrollHeight; return el;
  }
  function renderAnswer(el, res, q) {
    if (!res) {
      el.innerHTML = '<p>' + tx('لم أجد إجابة دقيقة لهذا السؤال بعد. جرّب كلمات أخرى، أو اسأل زملاءك وفريق الدعم:', 'I don’t have an exact answer for that yet. Try other words, or ask your colleagues and the support team:') + '</p><div class="cc-links"><a href="#/forum">' + icon('users', 'icon-sm') + tx('اسأل في المنتدى', 'Ask the forum') + '</a><a href="#/support">' + icon('send', 'icon-sm') + tx('اسأل الفريق', 'Ask the team') + '</a><a href="#/questions">' + icon('message', 'icon-sm') + tx('الأسئلة الشائعة', 'Common questions') + '</a></div>';
      return;
    }
    if (res.guess) {
      el.innerHTML = '<p>' + tx('لست متأكداً مما تقصد. هل تقصد أحد هذه؟', 'I’m not sure what you mean. Did you mean one of these?') + '</p><div class="cc-sugs in">' + res.guess.map(m => '<button type="button" data-cq>' + esc(m.title) + '</button>').join('') + '</div><div class="cc-links"><a href="#/forum">' + icon('users', 'icon-sm') + tx('اسأل في المنتدى', 'Ask the forum') + '</a><a href="#/support">' + icon('send', 'icon-sm') + tx('اسأل الفريق', 'Ask the team') + '</a></div>';
      return;
    }
    const b = res.best;
    el.innerHTML = '<p class="cc-t">' + esc(b.title) + '</p><p class="cc-a"></p>';
    stopType = typeInto($('.cc-a', el), b.text, () => {
      el.insertAdjacentHTML('beforeend', '<div class="cc-links">' + b.links.map(l => '<a href="' + l[2] + '">' + icon(l[0], 'icon-sm') + l[1] + '</a>').join('') + '</div>' +
        (res.more.length ? '<p class="cc-more">' + tx('قد يهمك أيضاً:', 'You might also like:') + '</p><div class="cc-sugs in">' + res.more.map(m => '<button type="button" data-cq>' + esc(m.title) + '</button>').join('') + '</div>' : '') +
        '<div class="cc-rate"><span>' + tx('هل ساعدك هذا؟', 'Did this help?') + '</span><button type="button" data-rate="up" aria-label="' + tx('نعم', 'Yes') + '">' + icon('thumb', 'icon-sm') + '</button><button type="button" data-rate="down" class="down" aria-label="' + tx('لا', 'No') + '">' + icon('thumb', 'icon-sm') + '</button></div>');
      $log().scrollTop = $log().scrollHeight;
    });
  }
  function ask(q) {
    q = q.trim(); if (!q || busy) return;
    busy = true; bubble(esc(q), 'me'); log.push({ me: q });
    const el = bubble('<span class="cc-dots"><i></i><i></i><i></i></span>', 'bot');
    const small = SMALL.find(s => s[0].test(q));
    const local = () => {
      Sound.play('pop');
      if (small) { el.innerHTML = '<p></p>'; stopType = typeInto($('p', el), small[1](), () => { busy = false; }); return; }
      renderAnswer(el, answer(q), q); busy = false;
    };
    const wait = prefersReducedMotion() ? 60 : 650;
    if (Api.on && !small) {
      Api.post('chat', { question: cleanText(q, 500), lang: LANG }).then(r => {
        const text = r && cleanText(r.answer, 3000);
        if (!text) return local();
        Sound.play('pop'); el.innerHTML = '<p class="cc-a"></p>'; stopType = typeInto($('.cc-a', el), text, () => { busy = false; });
      }, () => setTimeout(local, 50));
    } else setTimeout(local, wait);
  }
  function build() {
    root = document.createElement('div'); root.className = 'clicky-bot';
    root.innerHTML = '<p class="cb-hint" hidden></p><button type="button" class="clicky-fab" aria-expanded="false" aria-controls="clickyChat">' + mascot('mascot-fab') + '<span class="cf-label"></span></button>' +
      '<section class="clicky-chat" id="clickyChat" role="dialog" aria-modal="false" aria-labelledby="ccTitle" hidden><header>' + mascot('mascot-head') + '<div><b id="ccTitle">Clicky</b><small><i></i><span class="cc-sub"></span></small></div><button type="button" class="icon-btn cc-close">' + icon('x') + '</button></header>' +
      '<div class="cc-log" aria-live="polite"></div><div class="cc-sugs" data-sugs></div>' +
      '<form class="cc-input"><input class="input" maxlength="300" autocomplete="off"><button type="submit" class="icon-btn cc-send">' + icon('send', 'icon-sm') + '</button></form></section>';
    $('#appRoot').appendChild(root);
    const fab = $('.clicky-fab', root), chat = $('.clicky-chat', root);
    fab.addEventListener('click', () => toggle(!open));
    $('.cc-close', root).addEventListener('click', () => { toggle(false); fab.focus(); });
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && open) { toggle(false); fab.focus(); } });
    $('.cc-input', root).addEventListener('submit', e => { e.preventDefault(); const inp = $('.cc-input input', root); const q = inp.value; inp.value = ''; ask(q); });
    root.addEventListener('click', e => {
      const s = e.target.closest('[data-cq]'); if (s) { ask(s.textContent); return; }
      const r = e.target.closest('[data-rate]');
      if (r) { const box = r.closest('.cc-rate'); box.innerHTML = r.dataset.rate === 'up' ? '<span>' + icon('heart', 'icon-sm') + tx('رائع! سعيد أنني ساعدتك.', 'Great! Glad I could help.') + '</span>' : '<span>' + tx('آسف! جرّب المنتدى أو اسأل الفريق.', 'Sorry! Try the forum or ask the team.') + ' <a href="#/forum">' + tx('المنتدى', 'Forum') + '</a> · <a href="#/support">' + tx('اسأل الفريق', 'Ask the team') + '</a></span>'; Sound.play(r.dataset.rate === 'up' ? 'like' : 'tap'); return; }
      if (e.target.closest('.cc-log a, .cc-links a') && window.matchMedia('(max-width: 640px)').matches) toggle(false);
    });
    relabel();
    try { if (!window.sessionStorage.getItem('clicky-hint')) { setTimeout(() => { if (open) return; const h = $('.cb-hint', root); h.hidden = false; h.classList.add('tip-in'); window.sessionStorage.setItem('clicky-hint', '1'); setTimeout(() => { h.hidden = true; }, 6000); }, 3000); } } catch (e) { /* optional */ }
    return chat;
  }
  function relabel() {
    if (!root) return;
    const fab = $('.clicky-fab', root);
    $('.cf-label', root).textContent = tx('اسأل Clicky', 'Ask Clicky');
    fab.setAttribute('aria-label', tx('اسأل Clicky، مساعد ClickUp', 'Ask Clicky, the ClickUp helper'));
    $('.cc-sub', root).textContent = tx('متصل · مساعد ClickUp', 'Online · ClickUp helper');
    $('.cc-close', root).setAttribute('aria-label', tx('أغلق المحادثة', 'Close the chat'));
    $('.cc-input input', root).placeholder = tx('اكتب سؤالك عن ClickUp…', 'Type your question about ClickUp…');
    $('.cc-input input', root).setAttribute('aria-label', tx('سؤالك لـ Clicky', 'Your question for Clicky'));
    $('.cc-send', root).setAttribute('aria-label', tx('أرسل', 'Send'));
    $('.cb-hint', root).textContent = tx('عندك سؤال عن ClickUp؟ اسألني!', 'Got a ClickUp question? Ask me!');
    const sugs = $('[data-sugs]', root);
    sugs.innerHTML = suggestions().map(s => '<button type="button" data-cq>' + esc(s) + '</button>').join('');
  }
  function toggle(v) {
    open = v; const chat = $('.clicky-chat', root); const fab = $('.clicky-fab', root);
    chat.hidden = !v; fab.setAttribute('aria-expanded', String(v)); root.classList.toggle('is-open', v); $('.cb-hint', root).hidden = true;
    if (v) {
      Sound.play('pop');
      if (!$log().children.length) bubble('<p>' + tx('أهلاً! أنا Clicky. اسألني أي سؤال عن ClickUp أو عن هذه المنصة، أو اختر سؤالاً من الأسفل.', 'Hi! I’m Clicky. Ask me any question about ClickUp or this platform, or pick one below.') + '</p>', 'bot');
      setTimeout(() => $('.cc-input input', root).focus(), 50);
    } else stopType();
  }
  return { init: () => build(), relabel, open: () => toggle(true), ask: q => { toggle(true); ask(q); }, debug: q => ({ tokens: repair(tokens(q)), res: answer(q) }) };
})();
