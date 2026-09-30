/* ==========================================================================
   Community forum: questions, tips and ideas from employees, with Agree,
   Like and comments.

   Storage: this single-file website has no server, so ForumStore keeps
   posts, reactions and comments on this device (inside Store). To make the
   forum shared by every employee, replace ForumStore's methods with calls to
   a shared database (for example SharePoint / Microsoft Lists or another
   API); the page only talks to ForumStore. The page says this plainly.
   ========================================================================== */

const FORUM_SEED = () => {
  const h = 3600e3, now = Date.now();
  const P = (id, name, emp) => ({ name, emp, pid: id });
  return [
    { id: 's4', seed: true, type: 'idea', part: 'power', at: now - 2 * h, by: P('ashjan', EXAMPLE_PERSON.name, EXAMPLE_PERSON.id), likes: 17, agrees: 14,
      text: tx('فكرة: لننشئ قالباً مشتركاً واحداً لطلبات العملاء، حتى تستخدم كل الفرق قائمة التحقق نفسها.', 'Idea: let’s create one shared template for customer requests, so every team uses the same checklist.'),
      comments: [{ id: 's4c1', by: P('salim', PERSON.salim.name, '70231'), at: now - 1.5 * h, likes: 4, text: tx('نعم رجاءً! سأستخدمه من الغد.', 'Yes please! I’d use it from tomorrow.') }] },
    { id: 's2', seed: true, type: 'tip', part: 'auto', at: now - 5 * h, by: P('noura', PERSON.noura.name, '70819'), likes: 21, agrees: 9,
      text: tx('نصيحة: أضفنا أتمتة تعيّن المراجع عندما تنتقل المهمة إلى REVIEW. انتهت رسائل «من سيراجع هذا؟».', 'Tip: we added an automation that assigns the reviewer when a task moves to REVIEW. No more “who is checking this?” messages.'),
      comments: [{ id: 's2c1', by: P('khalid', PERSON.khalid.name, '71102'), at: now - 4 * h, likes: 2, text: tx('فكرة رائعة، سننقلها لفريقنا.', 'Great idea, we’ll copy it for our team.') }] },
    { id: 's1', seed: true, type: 'q', part: 'start', at: now - 26 * h, by: P('salim', PERSON.salim.name, '70231'), likes: 8, agrees: 12,
      text: tx('كيف تنظّمون Inbox؟ يمتلئ عندي بالإشعارات كل صباح.', 'How do you all organise your Inbox? Mine fills up with notifications every morning.'),
      comments: [{ id: 's1c1', by: P('noura', PERSON.noura.name, '70819'), at: now - 25 * h, likes: 6, text: tx('أمسح كل ما انتهى في آخر اليوم، وأنقل الباقي إلى Later.', 'I clear everything that’s done at the end of the day and move the rest to Later.') },
        { id: 's1c2', by: P('maryam', PERSON.maryam.name, '70458'), at: now - 23 * h, likes: 3, text: tx('إيقاف إشعارات المتابعة للقوائم الكبيرة ساعدني كثيراً.', 'Turning off watcher notifications for big Lists helped me a lot.') }] },
    { id: 's3', seed: true, type: 'q', part: 'views', at: now - 50 * h, by: P('khalid', PERSON.khalid.name, '71102'), likes: 5, agrees: 3,
      text: tx('أي عرض تفضّلون لاجتماع الفريق الأسبوعي: Board أم Workload؟', 'Which view do you prefer for the weekly team meeting: Board or Workload?'),
      comments: [{ id: 's3c1', by: P('maryam', PERSON.maryam.name, '70458'), at: now - 49 * h, likes: 5, text: tx('Board للحديث عن التقدم، وWorkload لإعادة توزيع المهام.', 'Board to talk about progress, Workload to rebalance tasks.') }] },
    { id: 's5', seed: true, type: 'tip', part: 'tasks', at: now - 74 * h, by: P('maryam', PERSON.maryam.name, '70458'), likes: 11, agrees: 10,
      text: tx('اكتب عنوان المهمة بفعل: «أرسل التقرير» وليس «التقرير». القوائم تصبح أوضح بكثير.', 'Write task titles that start with a verb: “Send the report”, not “Report”. Lists become so much clearer.'), comments: [] }
  ];
};

/* The only place the forum reads or writes data. Local for now. */
const ForumStore = {
  shared: false,
  all() {
    const F = Store.forum();
    return F.posts.concat(FORUM_SEED()).map(p => Object.assign({}, p, {
      liked: !!F.likes[p.id], agreed: !!F.agrees[p.id],
      likeCount: (p.likes || 0) + (F.likes[p.id] ? 1 : 0), agreeCount: (p.agrees || 0) + (F.agrees[p.id] ? 1 : 0),
      thread: (p.comments || []).concat(F.comments[p.id] || []).map(c => Object.assign({}, c, { liked: !!F.likes[c.id], likeCount: (c.likes || 0) + (F.likes[c.id] ? 1 : 0) }))
    }));
  },
  add(post) { Store.forum().posts.unshift(post); Store.saveForum(); },
  toggle(kind, id) { const F = Store.forum(); const m = kind === 'like' ? F.likes : F.agrees; if (m[id]) delete m[id]; else m[id] = Date.now(); Store.saveForum(); return !!m[id]; },
  comment(postId, c) { const F = Store.forum(); (F.comments[postId] = F.comments[postId] || []).push(c); Store.saveForum(); },
  remove(id) { const F = Store.forum(); F.posts = F.posts.filter(p => p.id !== id); Store.saveForum(); }
};

function viewForum(main) {
  const TYPES = () => [['q', tx('سؤال', 'Question'), 'help', '#4f86f7'], ['tip', tx('نصيحة', 'Tip'), 'bulb', '#22c38e'], ['idea', tx('فكرة', 'Idea'), 'sparkle', '#a855f7']];
  const typeOf = k => TYPES().find(t => t[0] === k) || TYPES()[0];
  const prof = Store.state.profile || {};
  const st = UIState.get('forum') || { filter: '', sort: 'new', open: {}, type: 'q', part: 'start', text: '', name: prof.name || '', emp: prof.emp || '' };
  const put = () => UIState.set('forum', st);
  const hue = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
  const av = (name, size) => '<span class="fm-av" style="--h:' + hue(name) + ';width:' + (size || 38) + 'px;height:' + (size || 38) + 'px">' + esc(String(name || '?').trim().charAt(0).toUpperCase()) + '</span>';
  const ago = t => { const m = Math.max(1, Math.round((Date.now() - t) / 60000)); return m < 60 ? tx('قبل ' + m + ' د', m + 'm ago') : m < 1440 ? tx('قبل ' + Math.round(m / 60) + ' س', Math.round(m / 60) + 'h ago') : tx('قبل ' + Math.round(m / 1440) + ' يوم', Math.round(m / 1440) + 'd ago'); };
  const who = b => '<b><bdi>' + esc(b.name) + '</bdi></b>' + (b.emp ? '<span class="fm-id num">' + tx('الرقم الوظيفي ', 'ID ') + '<bdi dir="ltr">' + esc(b.emp) + '</bdi></span>' : '');

  main.innerHTML = '<div class="page page-narrow forum">' +
    '<header class="fm-hero"><div><span class="hero-kicker">' + icon('users', 'icon-sm') + tx('مجتمع موظفي Omantel', 'Omantel employee community') + '</span><h1 tabindex="-1">' + tx('منتدى ClickUp', 'ClickUp Forum') + '</h1><p>' + tx('اسأل، وشارك نصيحة أو فكرة. وافق على ما يفيدك، وأعجب به، وعلّق لتساعد زملاءك.', 'Ask, share a tip or an idea. Agree with what helps you, like it and comment to help colleagues.') + '</p></div>' + mascot('mascot-md') + '</header>' +
    (ForumStore.shared ? '' : '<p class="fm-note">' + icon('info', 'icon-sm') + '<span>' + tx('نسخة تجريبية: المنشورات والإعجابات والتعليقات التي تضيفها تُحفظ على هذا الجهاز. لتصبح مرئية لكل الموظفين يلزم ربط المنتدى بقاعدة بيانات مشتركة (مثل SharePoint أو Microsoft Lists)، والصفحة جاهزة لذلك.', 'Preview: the posts, likes and comments you add are saved on this device. To make them visible to every employee, the forum needs to be connected to a shared database (such as SharePoint or Microsoft Lists); the page is ready for it.') + '</span></p>') +
    '<form class="panel fm-compose" data-compose novalidate><div class="fm-row">' + av(st.name || EXAMPLE_PERSON.name, 42) +
    '<textarea class="input" id="fmText" rows="3" placeholder="' + tx('اكتب سؤالك أو نصيحتك أو فكرتك…', 'Write your question, tip or idea…') + '" aria-label="' + tx('نص المنشور', 'Post text') + '">' + esc(st.text) + '</textarea></div>' +
    '<div class="fm-opts"><div class="fm-types" role="radiogroup" aria-label="' + tx('نوع المنشور', 'Post type') + '">' + TYPES().map(t => '<button type="button" role="radio" data-ptype="' + t[0] + '" aria-checked="' + (st.type === t[0]) + '" style="--tc:' + t[3] + '">' + icon(t[2], 'icon-sm') + t[1] + '</button>').join('') + '</div>' +
    '<label class="fm-topic">' + tx('الموضوع', 'Topic') + '<select class="select select-sm" id="fmPart">' + TOUR_PARTS.map(p => '<option value="' + p.id + '"' + (p.id === st.part ? ' selected' : '') + '>' + tp(TOUR_SHORT[p.id]) + '</option>').join('') + '</select></label></div>' +
    '<div class="fm-opts"><input class="input" id="fmName" value="' + esc(st.name) + '" placeholder="' + tx('الاسم، مثال: ', 'Name, e.g. ') + EXAMPLE_PERSON.name + '" aria-label="' + tx('الاسم', 'Name') + '"><input class="input num" id="fmEmp" inputmode="numeric" value="' + esc(st.emp) + '" placeholder="' + tx('الرقم الوظيفي، مثال: ', 'Employee ID, e.g. ') + EXAMPLE_PERSON.id + '" aria-label="' + tx('الرقم الوظيفي', 'Employee ID') + '">' +
    '<button type="submit" class="btn btn-primary" data-post>' + icon('send', 'icon-sm') + tx('انشر', 'Post') + '</button></div><p class="rq-err" id="fmErr" hidden></p></form>' +
    '<div class="fm-bar"><div class="cuq-cats" role="group" aria-label="' + tx('تصفية', 'Filter') + '"><button type="button" data-ffilter="" aria-pressed="' + !st.filter + '">' + tx('الكل', 'All') + '</button>' + TYPES().map(t => '<button type="button" data-ffilter="' + t[0] + '" aria-pressed="' + (st.filter === t[0]) + '" style="--mc:' + t[3] + ';--md:' + t[3] + '">' + icon(t[2], 'icon-sm') + t[1] + '</button>').join('') + '</div>' +
    '<label class="fm-sort">' + tx('الترتيب', 'Sort') + '<select class="select select-sm" id="fmSort"><option value="new"' + (st.sort === 'new' ? ' selected' : '') + '>' + tx('الأحدث', 'Newest') + '</option><option value="top"' + (st.sort === 'top' ? ' selected' : '') + '>' + tx('الأكثر إعجاباً', 'Most liked') + '</option><option value="talk"' + (st.sort === 'talk' ? ' selected' : '') + '>' + tx('الأكثر نقاشاً', 'Most discussed') + '</option></select></label></div>' +
    '<div class="fm-list" data-posts aria-live="polite"></div></div>';

  const paint = () => {
    let list = ForumStore.all().filter(p => !st.filter || p.type === st.filter);
    list.sort((a, b) => st.sort === 'top' ? (b.likeCount + b.agreeCount) - (a.likeCount + a.agreeCount) : st.sort === 'talk' ? b.thread.length - a.thread.length : b.at - a.at);
    $('[data-posts]', main).innerHTML = list.length ? list.map(p => { const T = typeOf(p.type); const part = TOUR_PART[p.part]; const open = !!st.open[p.id];
      return '<article class="fm-post' + (p.seed ? '' : ' mine') + '" data-pid="' + p.id + '" style="--tc:' + T[3] + '"><header>' + av(p.by.name) + '<div class="fm-who">' + who(p.by) + '<span class="fm-time">' + ago(p.at) + '</span></div><span class="fm-type">' + icon(T[2], 'icon-sm') + T[1] + '</span></header>' +
        '<p class="fm-text">' + esc(p.text) + '</p>' + (part ? '<a class="chip fm-part" href="#/tour/' + part.id + '">' + icon(part.icon, 'icon-sm') + tp(TOUR_SHORT[part.id]) + '</a>' : '') +
        '<div class="fm-actions"><button type="button" class="fm-btn agree" data-agree="' + p.id + '" aria-pressed="' + p.agreed + '">' + icon('thumb', 'icon-sm') + '<span>' + tx('أوافق', 'Agree') + '</span><b class="num">' + p.agreeCount + '</b></button>' +
        '<button type="button" class="fm-btn like" data-like="' + p.id + '" aria-pressed="' + p.liked + '">' + icon('heart', 'icon-sm') + '<span>' + tx('إعجاب', 'Like') + '</span><b class="num">' + p.likeCount + '</b></button>' +
        '<button type="button" class="fm-btn" data-thread="' + p.id + '" aria-expanded="' + open + '">' + icon('message', 'icon-sm') + '<span>' + tx('تعليقات', 'Comments') + '</span><b class="num">' + p.thread.length + '</b></button>' +
        (p.seed ? '' : '<button type="button" class="icon-btn fm-del" data-fdel="' + p.id + '" aria-label="' + tx('احذف منشوري', 'Delete my post') + '">' + icon('trash', 'icon-sm') + '</button>') + '</div>' +
        (open ? '<div class="fm-thread">' + p.thread.map(c => '<div class="fm-c">' + av(c.by.name, 30) + '<div><p class="fm-who">' + who(c.by) + '<span class="fm-time">' + ago(c.at) + '</span></p><p>' + esc(c.text) + '</p><button type="button" class="fm-mini like" data-like="' + c.id + '" aria-pressed="' + c.liked + '">' + icon('heart', 'icon-sm') + '<b class="num">' + c.likeCount + '</b><span class="visually-hidden">' + tx('إعجاب', 'Like') + '</span></button></div></div>').join('') +
          '<form class="fm-reply" data-reply="' + p.id + '">' + av(st.name || '?', 30) + '<input class="input" placeholder="' + tx('اكتب تعليقاً…', 'Write a comment…') + '" aria-label="' + tx('تعليقك', 'Your comment') + '"><button type="submit" class="icon-btn" aria-label="' + tx('أرسل التعليق', 'Send comment') + '">' + icon('send', 'icon-sm') + '</button></form></div>' : '') + '</article>'; }).join('')
      : '<div class="panel empty-state">' + mascot() + '<p>' + tx('لا توجد منشورات هنا بعد. كن أول من يكتب!', 'Nothing here yet. Be the first to post!') + '</p></div>';
  };
  paint();
  const burst = btn => { if (prefersReducedMotion() || !btn) return; btn.classList.remove('burst'); void btn.offsetWidth; btn.classList.add('burst'); };
  const needName = () => { if (!st.name.trim()) { const e = $('#fmErr', main); e.hidden = false; e.textContent = tx('اكتب اسمك أولاً في نموذج النشر.', 'Write your name in the post form first.'); $('#fmName', main).focus(); Sound.play('error'); return true; } return false; };

  main.addEventListener('input', e => {
    if (e.target.id === 'fmText') st.text = e.target.value; if (e.target.id === 'fmName') st.name = e.target.value; if (e.target.id === 'fmEmp') st.emp = e.target.value; put();
  });
  main.addEventListener('change', e => { if (e.target.id === 'fmPart') { st.part = e.target.value; put(); } if (e.target.id === 'fmSort') { st.sort = e.target.value; put(); paint(); } });
  main.addEventListener('click', e => {
    const t = e.target.closest('[data-ptype]'); if (t) { st.type = t.dataset.ptype; put(); $$('[data-ptype]', main).forEach(b => b.setAttribute('aria-checked', b === t)); return; }
    const f = e.target.closest('[data-ffilter]'); if (f) { st.filter = f.dataset.ffilter; put(); $$('[data-ffilter]', main).forEach(b => b.setAttribute('aria-pressed', b === f)); paint(); return; }
    const lk = e.target.closest('[data-like]'); if (lk) { const on = ForumStore.toggle('like', lk.dataset.like); Sound.play(on ? 'like' : 'tap'); paint(); const again = $('[data-like="' + lk.dataset.like + '"]', main); if (again) { again.focus(); if (on) burst(again); } return; }
    const ag = e.target.closest('[data-agree]'); if (ag) { const on = ForumStore.toggle('agree', ag.dataset.agree); Sound.play(on ? 'pop' : 'tap'); paint(); const again = $('[data-agree="' + ag.dataset.agree + '"]', main); if (again) { again.focus(); if (on) burst(again); } return; }
    const th = e.target.closest('[data-thread]'); if (th) { st.open[th.dataset.thread] = !st.open[th.dataset.thread]; put(); paint(); const inp = $('[data-reply="' + th.dataset.thread + '"] input', main); if (inp) inp.focus(); else { const again = $('[data-thread="' + th.dataset.thread + '"]', main); if (again) again.focus(); } return; }
    const dl = e.target.closest('[data-fdel]'); if (dl) confirmDialog(tx('حذف منشورك؟', 'Delete your post?'), tx('سيُحذف من هذا الجهاز.', 'It will be removed from this device.'), tx('نعم، احذف', 'Yes, delete')).then(ok => { if (ok) { ForumStore.remove(dl.dataset.fdel); paint(); } });
  });
  main.addEventListener('submit', e => {
    e.preventDefault();
    const rep = e.target.closest('[data-reply]');
    if (rep) {
      const inp = $('input', rep); const text = inp.value.trim(); if (!text) return; if (needName()) return;
      ForumStore.comment(rep.dataset.reply, { id: uid('c'), by: { name: st.name.trim(), emp: st.emp.trim() }, at: Date.now(), likes: 0, text });
      Store.setProfile({ name: st.name.trim(), emp: st.emp.trim() }); Sound.play('success'); paint();
      const again = $('[data-reply="' + rep.dataset.reply + '"] input', main); if (again) again.focus(); return;
    }
    if (!e.target.matches('[data-compose]')) return;
    const err = $('#fmErr', main); let msg = '';
    if (st.text.trim().length < 5) msg = tx('اكتب منشوراً من 5 أحرف على الأقل.', 'Write at least 5 characters.');
    else if (!st.name.trim()) msg = tx('اكتب اسمك.', 'Please write your name.');
    else if (st.emp && !/^\d{3,10}$/.test(st.emp.trim())) msg = tx('الرقم الوظيفي أرقام فقط، مثل ', 'The employee ID is digits only, such as ') + EXAMPLE_PERSON.id + '.';
    err.hidden = !msg; err.textContent = msg;
    if (msg) { Sound.play('error'); return; }
    ForumStore.add({ id: uid('p'), type: st.type, part: st.part, at: Date.now(), by: { name: st.name.trim(), emp: st.emp.trim() }, text: st.text.trim(), likes: 0, agrees: 0, comments: [] });
    Store.setProfile({ name: st.name.trim(), emp: st.emp.trim() });
    st.text = ''; st.filter = ''; st.sort = 'new'; put(); $('#fmText', main).value = ''; $('#fmSort', main).value = 'new'; $$('[data-ffilter]', main).forEach(b => b.setAttribute('aria-pressed', !b.dataset.ffilter));
    paint(); Motion.confetti($('[data-post]', main), 50); toast(tx('نُشر منشورك', 'Your post is published'));
    const first = $('.fm-post', main); if (first && !prefersReducedMotion()) first.animate([{ opacity: 0, transform: 'translateY(-12px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  });
}
