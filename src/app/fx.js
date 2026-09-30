/* ==========================================================================
   Visual system helpers: module colours, rings and bar charts built from real
   progress data, scroll reveal, count-up numbers and celebration confetti.
   Every motion here explains or acknowledges something (a number arriving,
   progress filling, an achievement), and all of it is skipped when the
   learner prefers reduced motion.
   ========================================================================== */

/* Each module has its own colour, like a ClickUp Space. `c` is the vivid tone
   for fills and charts, `d` is a darker tone that carries white text. */
const MODULE_COLORS = {
  m1: { c: '#7b68ee', d: '#5b45d6' }, m2: { c: '#e44bb6', d: '#b3288a' }, m3: { c: '#ff7a45', d: '#c2491a' },
  m4: { c: '#1fb6e0', d: '#0a7a9c' }, m5: { c: '#f5a524', d: '#a26100' }, m6: { c: '#22c38e', d: '#0f7f58' },
  m7: { c: '#4f86f7', d: '#2659c7' }, m8: { c: '#a855f7', d: '#7e2fc8' }, m9: { c: '#ff4d6d', d: '#c2233f' },
  m10: { c: '#14b8a6', d: '#0b776c' }, m11: { c: '#4957e6', d: '#3037b5' }, m12: { c: '#ec4899', d: '#b5206b' }
};
const modStyle = mid => { const m = MODULE_COLORS[mid] || MODULE_COLORS.m1; return '--mc:' + m.c + ';--md:' + m.d; };
/* The four lesson stages keep one colour each, everywhere they appear. */
const STAGE_COLORS = { watch: '#e44bb6', understand: '#f59e0b', practice: '#1fb6e0', check: '#22c38e' };

/* Progress ring. pct 0-100. Animates from empty when it scrolls into view. */
function ring(pct, opts) {
  opts = opts || {};
  const size = opts.size || 72, sw = opts.stroke || 8, r = (size - sw) / 2, c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct || 0));
  const id = uid('rg');
  const grad = opts.color ? '' : '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff02f0"/><stop offset=".5" stop-color="#8930fd"/><stop offset="1" stop-color="#49ccf9"/></linearGradient></defs>';
  return '<span class="ring' + (opts.cls ? ' ' + opts.cls : '') + '" style="width:' + size + 'px;height:' + size + 'px">' +
    '<svg viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true">' + grad +
    '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + (opts.track || 'var(--ring-track)') + '" stroke-width="' + sw + '"/>' +
    '<circle class="ring-val" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + (opts.color || 'url(#' + id + ')') + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - p / 100)).toFixed(2) + '" style="--full:' + c.toFixed(2) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/></svg>' +
    (opts.label != null ? '<span class="ring-label">' + opts.label + '</span>' : '') + '</span>';
}

/* Count-up number: <b data-count="29">29</b> animates when revealed. */
function countEl(n, suffix) { return '<span class="num" data-count="' + n + '"' + (suffix ? ' data-suffix="' + suffix + '"' : '') + '>' + n + (suffix || '') + '</span>'; }

const Motion = (() => {
  let io = null;
  const reduce = () => prefersReducedMotion();
  function animateCount(el) {
    const to = +el.dataset.count; const suf = el.dataset.suffix || '';
    if (reduce() || !(to > 0)) { el.textContent = to + suf; return; }
    const t0 = performance.now(), dur = 900;
    const step = now => { const k = Math.min(1, (now - t0) / dur); const e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e) + suf; if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0' + suf; requestAnimationFrame(step);
  }
  function animateRing(svgCircle) {
    if (reduce()) return;
    const full = svgCircle.style.getPropertyValue('--full'); const end = svgCircle.getAttribute('stroke-dashoffset');
    svgCircle.animate([{ strokeDashoffset: full }, { strokeDashoffset: end }], { duration: 1000, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  }
  function enter(el) {
    el.classList.add('rv-in');
    $$('[data-count]', el).forEach(animateCount);
    if (el.matches('[data-count]')) animateCount(el);
    $$('.ring-val', el).forEach(animateRing);
    $$('.grow-bar', el).forEach(b => { if (!reduce()) b.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 900, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', delay: (+b.dataset.i || 0) * 45 }); });
  }
  /* Reveal blocks as they scroll into view, with a short stagger per group. */
  function reveal(root) {
    if (io) io.disconnect();
    const items = $$('[data-rv]', root);
    if (reduce() || !('IntersectionObserver' in window)) { items.forEach(enter); return; }
    items.forEach(el => {
      const sib = el.parentElement ? Array.from(el.parentElement.children).filter(x => x.hasAttribute('data-rv')) : [];
      el.style.setProperty('--rv-delay', Math.min(sib.indexOf(el), 8) * 55 + 'ms');
      el.classList.add('rv');
    });
    io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); enter(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(el => io.observe(el));
  }
  /* Show everything at once (used after a language switch, where content
     should simply stay where the learner was). */
  function settle(root) { if (io) io.disconnect(); $$('[data-rv]', root).forEach(el => el.classList.add('rv-in')); }

  /* Confetti in ClickUp colours, from a point (or the top centre). */
  const COLORS = ['#ff02f0', '#ff7a45', '#ffc800', '#8930fd', '#49ccf9', '#22c38e'];
  function confetti(origin, amount) {
    Sound.play((amount || 60) >= 80 ? 'party' : 'success');
    if (reduce()) return;
    const layer = document.createElement('div'); layer.className = 'confetti'; layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    let x = window.innerWidth / 2, y = window.innerHeight * 0.3;
    if (origin && origin.getBoundingClientRect) { const r = origin.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    const n = amount || 60;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      const size = 6 + Math.random() * 7;
      p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + size + 'px;height:' + (size * (Math.random() > .5 ? 1 : .45)) + 'px;background:' + COLORS[i % COLORS.length] + ';border-radius:' + (Math.random() > .6 ? '50%' : '2px');
      layer.appendChild(p);
      const ang = Math.random() * Math.PI * 2, v = 120 + Math.random() * 260;
      const dx = Math.cos(ang) * v, dy = Math.sin(ang) * v - 160;
      p.animate([
        { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + (dy + 380) + 'px)) rotate(' + (Math.random() * 720 - 360) + 'deg)', opacity: 0 }
      ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'forwards' });
    }
    setTimeout(() => layer.remove(), 2000);
  }
  return { reveal, settle, confetti };
})();

/* Achievements are computed from real progress only; nothing is invented. */
function achievements() {
  const S = Store.state;
  const done = LESSONS.filter(l => Store.isDone(l.id)).length;
  const modsDone = MODULES.filter(m => m.lessons.every(id => Store.isDone(id))).length;
  const quizPassed = MODULES.filter(m => S.quizzes[m.id] && S.quizzes[m.id].best / S.quizzes[m.id].total >= QUIZ_PASS).length;
  const perfect = Object.values(S.quizzes).some(q => q.best === q.total);
  const ch = CHALLENGES.filter(c => S.challenges[c.id]).length;
  const finalPass = S.final && S.final.best / S.final.total >= FINAL_PASS;
  return [
    { id: 'first', icon: 'rocket', c: '#ff7a45', t: tx('الخطوة الأولى', 'First step'), d: tx('أكمل أول درس', 'Complete your first lesson'), got: done >= 1 },
    { id: 'module', icon: 'layers', c: '#7b68ee', t: tx('وحدة كاملة', 'Module complete'), d: tx('أكمل كل دروس وحدة', 'Finish every lesson in a module'), got: modsDone >= 1 },
    { id: 'quiz', icon: 'assess', c: '#22c38e', t: tx('اجتياز اختبار', 'Quiz passed'), d: tx('اجتز اختبار وحدة', 'Pass a module quiz'), got: quizPassed >= 1 },
    { id: 'perfect', icon: 'star', c: '#f5a524', t: tx('علامة كاملة', 'Full marks'), d: tx('كل الإجابات صحيحة في اختبار', 'Get every answer right in a quiz'), got: perfect },
    { id: 'lab', icon: 'flask', c: '#1fb6e0', t: tx('يد عملية', 'Hands-on'), d: tx('أكمل 3 تحديات في المختبر', 'Complete 3 lab challenges'), got: ch >= 3 },
    { id: 'half', icon: 'flame', c: '#ec4899', t: tx('في منتصف الطريق', 'Halfway there'), d: tx('أكمل نصف الدروس', 'Complete half of the lessons'), got: done >= Math.ceil(LESSONS.length / 2) },
    { id: 'practical', icon: 'target', c: '#a855f7', t: tx('من البداية إلى المتابعة', 'Start to follow-up'), d: tx('أكمل التحدي العملي الشامل', 'Complete the end-to-end challenge'), got: !!S.practical },
    { id: 'explorer', icon: 'compass', c: '#ff02f0', t: tx('مستكشف ClickUp', 'ClickUp explorer'), d: tx('اكتشف أجزاء الجولة الاثني عشر', 'Explore all 12 parts of the tour'), got: TOUR_PARTS.every(p => Store.isToured(p.id)) },
    { id: 'final', icon: 'trophy', c: '#ffb800', t: tx('خبير ClickUp', 'ClickUp pro'), d: tx('اجتز التقييم النهائي', 'Pass the final assessment'), got: !!finalPass }
  ];
}

/* Clicky, the friendly helper robot in ClickUp colours. Pure SVG, so it
   scales crisply and speaks no particular language. */
function mascot(cls) {
  const g = uid('mg');
  return '<span class="mascot' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><svg viewBox="0 0 120 132">' +
    '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff02f0"/><stop offset=".55" stop-color="#8930fd"/><stop offset="1" stop-color="#49ccf9"/></linearGradient></defs>' +
    '<ellipse class="m-shadow" cx="60" cy="128" rx="30" ry="4" fill="#1b1340" opacity=".15"/>' +
    '<line x1="60" y1="24" x2="60" y2="10" stroke="#8930fd" stroke-width="4" stroke-linecap="round"/><circle class="m-bulb" cx="60" cy="9" r="6.5" fill="#ffc800"/>' +
    '<rect x="16" y="22" width="88" height="68" rx="26" fill="url(#' + g + ')"/><rect x="26" y="33" width="68" height="44" rx="18" fill="#fff"/>' +
    '<g class="m-eyes"><circle cx="46" cy="53" r="6.5" fill="#1b1340"/><circle cx="74" cy="53" r="6.5" fill="#1b1340"/><circle cx="48" cy="51" r="2" fill="#fff"/><circle cx="76" cy="51" r="2" fill="#fff"/></g>' +
    '<path d="M50 66q10 7.5 20 0" stroke="#1b1340" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
    '<circle cx="35" cy="65" r="4.5" fill="#ff9ad8" opacity=".75"/><circle cx="85" cy="65" r="4.5" fill="#ff9ad8" opacity=".75"/>' +
    '<rect x="36" y="93" width="48" height="30" rx="13" fill="url(#' + g + ')"/><path d="M50 112l10-7 10 7" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="14" y="97" width="24" height="10" rx="5" fill="#a855f7"/>' +
    '<g class="m-arm"><rect x="84" y="78" width="10" height="28" rx="5" fill="#a855f7"/><circle cx="89" cy="78" r="6" fill="#ffc800"/></g>' +
    '</svg></span>';
}
const CLICKY_TIPS = () => [
  tx('مرحباً! أنا Clicky. اضغطني لأعطيك نصيحة عن ClickUp.', 'Hi! I’m Clicky. Tap me for a ClickUp tip.'),
  tx('ابدأ يومك من Home: المتأخر أولاً، ثم مهام اليوم.', 'Start your day from Home: overdue first, then today’s tasks.'),
  tx('اكتب @ واسم زميلك في التعليق بدلاً من إرسال بريد.', 'Type @ and a colleague’s name in a comment instead of sending an email.'),
  tx('Ctrl+K يفتح البحث السريع في ClickUp.', 'Ctrl+K opens quick search in ClickUp.'),
  tx('مهمة واحدة = مسؤول واحد + موعد واضح.', 'One task = one owner + a clear due date.'),
  tx('كرّرت الخطوات نفسها أكثر من مرة؟ جرّب الأتمتة!', 'Doing the same steps again and again? Try an automation!'),
  tx('احفظ المهام المتكررة كقالب ووفّر وقتك.', 'Save repeated tasks as a template and save time.'),
  tx('Board تُظهر أين وصل كل عمل بلمحة.', 'Board view shows where every piece of work stands at a glance.')
];
function bindClicky(root) {
  const chatBtn = root.querySelector('[data-open-clicky]'); if (chatBtn) chatBtn.addEventListener('click', () => Clicky.open());
  const btn = root.querySelector('[data-clicky]'); if (!btn) return;
  const bub = root.querySelector('[data-clicky-say]'); let i = 0;
  bub.textContent = CLICKY_TIPS()[0];
  btn.addEventListener('click', () => {
    i = (i + 1) % CLICKY_TIPS().length; if (i === 0) i = 1;
    bub.textContent = CLICKY_TIPS()[i]; Sound.play('like');
    btn.classList.remove('jump'); void btn.offsetWidth; btn.classList.add('jump');
    bub.classList.remove('tip-in'); void bub.offsetWidth; bub.classList.add('tip-in');
  });
}
