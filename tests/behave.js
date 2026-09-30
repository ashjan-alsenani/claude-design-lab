const { chromium } = require('./pw');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch();
  const errs = [];
  // 1. First visit gate + remembered choice
  let ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  let p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL);
  ok(await p.isVisible('#langGate'), 'language screen on first visit');
  ok(await p.evaluate(() => document.activeElement.classList.contains('gate-card')), 'focus starts on the dialog, no option preselected'); await p.keyboard.press('Tab'); ok(await p.evaluate(() => !!document.activeElement.dataset.gate), 'Tab reaches an option');
  await p.click('[data-gate="en"]'); await p.waitForTimeout(400);
  ok(!(await p.isVisible('#langGate')), 'screen closes after choice');
  ok(await p.evaluate(() => document.documentElement.dir === 'ltr' && document.documentElement.lang === 'en'), 'html dir=ltr lang=en');
  ok(await p.evaluate(() => localStorage.getItem('omantel-clickup-hub:lang') === 'en'), 'choice saved locally');
  await p.reload(); await p.waitForTimeout(300);
  ok(!(await p.isVisible('#langGate')) && (await p.evaluate(() => document.documentElement.dir)) === 'ltr', 'reload keeps English, no screen');
  ok((await p.textContent('#main h1')).includes('Discover ClickUp'), 'home in English');
  ok(await p.isVisible('.lang-switch'), 'header switcher visible');

  // 2. State preservation mid-lesson
  await p.evaluate(() => { location.hash = '#/lesson/l1-1'; }); await p.waitForTimeout(300);
  // demo: go to step 3
  await p.$$eval('.demo-track button', x => x[2].click()); await p.waitForTimeout(50);
  await p.selectOption('[data-speed], [data-c="speed"]', '1.5');
  // match exercise: answer two rows
  const rows = await p.$$('.match-row');
  await rows[0].$eval('select', s => { s.selectedIndex = 1; s.dispatchEvent(new Event('change', { bubbles: true })); });
  await rows[1].$eval('select', s => { s.selectedIndex = 2; s.dispatchEvent(new Event('change', { bubbles: true })); });
  const matchBefore = await p.$$eval('.match-row select', s => s.map(x => x.value));
  // quiz: answer q1 with option value 0
  await p.check('input[name="chk-l1-1-q0"][value="0"]');
  // deeper panel open
  await p.click('details.deeper summary');
  await p.evaluate(() => document.getElementById('practice').scrollIntoView());
  await p.waitForTimeout(100);
  const yBefore = await p.evaluate(() => document.getElementById('practice').getBoundingClientRect().top);
  // real pointer click at the button's position (p.click would scroll the page first)
  const bb = await p.$eval('[data-lang="ar"]', e => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await p.mouse.click(bb[0], bb[1]); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.documentElement.dir === 'rtl'), 'switched to Arabic');
  ok((await p.evaluate(() => location.hash)) === '#/lesson/l1-1', 'same lesson after switch');
  ok((await p.textContent('.step-count')).includes('3'), 'demo stays on step 3: ' + (await p.textContent('.step-count')));
  ok((await p.$eval('[data-c="speed"]', s => s.value)) === '1.5', 'demo speed kept');
  ok(JSON.stringify(await p.$$eval('.match-row select', s => s.map(x => x.value))) === JSON.stringify(matchBefore), 'match answers kept');
  ok(await p.isChecked('input[name="chk-l1-1-q0"][value="0"]'), 'quiz answer kept');
  ok(await p.$eval('details.deeper', d => d.open), 'expanded panel kept');
  const yAfter = await p.evaluate(() => document.getElementById('practice').getBoundingClientRect().top);
  ok(Math.abs(yAfter - yBefore) < 60, 'scroll position kept (' + Math.round(yBefore) + ' vs ' + Math.round(yAfter) + ')');
  ok(await p.evaluate(() => document.activeElement.dataset.lang === 'ar'), 'focus stays on switcher');
  ok((await p.evaluate(() => localStorage.getItem('omantel-clickup-hub:lang'))) === 'ar', 'new choice saved');

  // 3. Solve exercises in English, progress shared
  await p.click('[data-lang="en"]'); await p.waitForTimeout(300);
  await p.evaluate(() => {
    const ex = window.__hub.content.LESSONS.find(l => l.id === 'l1-1').exercise;
    document.querySelectorAll('.match-row').forEach(r => { const i = +r.dataset.i; const s = r.querySelector('select'); s.value = String(ex.choices.indexOf(ex.pairs[i][1])); s.dispatchEvent(new Event('change', { bubbles: true })); });
  });
  await p.click('[data-ex] [data-check]'); await p.waitForTimeout(100);
  ok((await p.textContent('[data-ex] [data-fb]')).includes('All matches are correct'), 'match exercise solvable in English');
  await p.$$eval('.q-block', bs => bs.forEach(bk => bk.querySelector('input').click()));
  await p.click('[data-submit]'); await p.waitForTimeout(100);
  ok(await p.isVisible('.score-card'), 'quiz grades in English');
  await p.click('[data-lang="ar"]'); await p.waitForTimeout(300);
  ok(await p.isVisible('.score-card') && (await p.textContent('.score-card')).includes('إعادة المحاولة'), 'graded result survives switch, now in Arabic');
  ok(await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('omantel-clickup-hub:v1')); return s.lessons['l1-1'].practiced && !!s.lessons['l1-1'].checked; }), 'progress saved once, shared by both languages');

  // builder + taskSim in English
  await p.click('[data-lang="en"]'); await p.waitForTimeout(200);
  await p.evaluate(() => { location.hash = '#/lesson/l9-1'; }); await p.waitForTimeout(300);
  await p.evaluate(() => { const ex = window.__hub.content.LESSONS.find(l => l.id === 'l9-1').exercise; ex.slots.forEach(s => { const sel = document.querySelector('[data-slot="' + s.key + '"]'); sel.value = String(s.options.indexOf(s.answer)); sel.dispatchEvent(new Event('change', { bubbles: true })); }); });
  ok((await p.textContent('[data-preview]')).includes('Simulated on three new requests'), 'automation preview live in English');
  await p.click('[data-ex] [data-check]');
  ok((await p.textContent('[data-ex] [data-fb]')).includes('automation is correct'), 'builder solvable in English');
  await p.evaluate(() => { location.hash = '#/lesson/l3-1'; }); await p.waitForTimeout(300);
  await p.fill('[data-f="title"]', 'Prepare minutes for the Sunday requests meeting');
  await p.fill('[data-f="desc"]', 'Required: minutes with decisions, owners and dates for each request, sent to the team by Monday noon.');
  ok((await p.$$eval('[data-goals] li.met', x => x.length)) === 3, 'task-writing activity accepts English');
  await p.click('[data-lang="ar"]'); await p.waitForTimeout(300);
  ok((await p.inputValue('[data-f="title"]')).startsWith('Prepare minutes'), 'typed text kept after switch (mixed-language)');

  // 4. Lab: seeded data translates, learner data untouched, drafts kept
  await p.evaluate(() => { location.hash = '#/lab'; }); await p.waitForTimeout(300);
  await p.click('[data-open="a2"].lr-title'); await p.waitForTimeout(200);
  await p.fill('#cmNew', 'مسودة تعليق @سالم');
  await p.click('[data-lang="en"]'); await p.waitForTimeout(300);
  ok((await p.inputValue('#dTitle')) === 'Update the audit actions log', 'seeded task title in English');
  ok((await p.inputValue('#cmNew')) === 'مسودة تعليق @سالم', 'unsent comment draft kept');
  ok(await p.isVisible('#taskDrawer'), 'task drawer still open');
  await p.fill('#dTitle', 'My own title'); await p.$eval('#dTitle', e => e.dispatchEvent(new Event('change', { bubbles: true }))); await p.waitForTimeout(100);
  await p.click('[data-lang="ar"]'); await p.waitForTimeout(300);
  ok((await p.inputValue('#dTitle')) === 'My own title', 'learner edit not overwritten by translation');

  // 4b. ClickUp tour: step kept across a language switch, part marked explored
  await p.evaluate(() => { location.hash = '#/tour/tasks'; }); await p.waitForTimeout(300);
  await p.click('[data-tgo="1"]'); await p.waitForTimeout(150); await p.click('[data-tgo="1"]'); await p.waitForTimeout(300);
  await p.click('[data-lang="en"]'); await p.waitForTimeout(300);
  ok(await p.$eval('[data-tstep="2"]', e => e.getAttribute('aria-current') === 'step'), 'tour step kept after switch');
  ok(await p.isVisible('[data-tp-demo] .demo-stage'), 'tour walkthrough shown in English');
  await p.click('[data-tgo="1"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('omantel-clickup-hub:v1')).tour.tasks > 0), 'tour part saved as explored');
  await p.evaluate(() => { location.hash = '#/questions'; }); await p.waitForTimeout(300);
  await p.fill('#cuqQ', 'dashboard'); await p.waitForTimeout(300);
  ok((await p.$$('details.cuq')).length >= 2, 'questions search finds matches');
  // 4c. Focus mode: hide the sidebar, remembered after reload
  await p.click('#navToggle'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.documentElement.classList.contains('nav-hidden')) && !(await p.isVisible('#sidebar .nav-link')), 'menu hidden for focus');
  await p.reload(); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.documentElement.classList.contains('nav-hidden')), 'hidden menu remembered');
  await p.click('#navToggle'); await p.waitForTimeout(400);
  ok(await p.isVisible('#sidebar .nav-link'), 'menu shown again');
  ok(!(await p.$('#globalSearch')), 'header search removed');

  // 4d. Automations workshop: build an automation with a condition, then test it
  await p.evaluate(() => { location.hash = '#/automations'; }); await p.waitForTimeout(300);
  await p.click('[data-astep="2"]'); await p.waitForTimeout(200);
  await p.click('[data-new]'); await p.waitForTimeout(100);
  await p.selectOption('[data-f="t.k"]', 'priority'); await p.selectOption('[data-f="t.v"]', 'urgent');
  await p.click('[data-add="c"]'); await p.selectOption('[data-f="c.0.k"]', 'dept'); await p.selectOption('[data-f="c.0.v"]', 'fin');
  await p.selectOption('[data-f="a.0.k"]', 'status'); await p.selectOption('[data-f="a.0.v"]', 'progress');
  await p.click('[data-create]'); await p.waitForTimeout(200);
  ok((await p.$$('.cu-manage li')).length === 2, 'automation created and listed');
  await p.selectOption('[data-f="ev.priority"]', 'urgent'); await p.waitForTimeout(200);
  ok((await p.textContent('.au-log li')).includes('condition'), 'condition not met: skipped, no actions used');
  await p.selectOption('[data-f="ev.field"]', 'fin'); await p.selectOption('[data-f="ev.priority"]', 'high'); await p.selectOption('[data-f="ev.priority"]', 'urgent'); await p.waitForTimeout(200);
  ok((await p.textContent('.au-task .mx-status')).includes('IN PROGRESS'), 'automation ran and changed the status');
  await p.click('[data-new]'); await p.selectOption('[data-f="a.0.k"]', 'email'); await p.click('[data-add="a"]'); await p.waitForTimeout(100);
  ok(await p.$eval('[data-create]', b => b.disabled), 'Send email cannot mix with other actions');

  // 4e. Support and ideas: validation, saved request, example with the owner's name and ID
  await p.evaluate(() => { location.hash = '#/support'; }); await p.waitForTimeout(300);
  ok((await p.textContent('.rq-card.is-example')).includes('Ashjan Al Sinani') && (await p.textContent('.rq-card.is-example')).includes('71067'), 'example shows Ashjan Al Sinani and ID 71067');
  await p.click('.rq-send'); await p.waitForTimeout(100);
  ok(await p.isVisible('#rqNameErr') && await p.isVisible('#rqEmpErr'), 'empty form shows errors');
  await p.fill('#rqName', 'Ashjan Al Sinani'); await p.fill('#rqEmp', '71067'); await p.fill('#rqSubject', 'Share one task with a guest'); await p.fill('#rqBody', 'The consultant should see one task only.');
  await p.click('.rq-send'); await p.waitForTimeout(300);
  ok((await p.textContent('.rq-card .rq-id')).includes('REQ-0001'), 'question saved as REQ-0001');
  await p.evaluate(() => { location.hash = '#/ideas'; }); await p.waitForTimeout(300);
  ok((await p.inputValue('#rqName')) === 'Ashjan Al Sinani' && (await p.inputValue('#rqEmp')) === '71067', 'name and ID remembered for the next form');
  await ctx.close();

  // 5. Storage blocked
  ctx = await b.newContext();
  await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
  p = await ctx.newPage(); p.on('pageerror', e => errs.push('nostorage: ' + e.message));
  await p.goto(URL); await p.waitForTimeout(300);
  ok(await p.isVisible('#gateNote'), 'no-storage note on language screen');
  await p.click('[data-gate="en"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.documentElement.dir === 'ltr'), 'works without storage');
  await ctx.close();
  console.log('page errors:', errs);
  await b.close();
})();
