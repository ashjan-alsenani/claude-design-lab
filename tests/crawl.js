const { chromium } = require('./pw');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
const lessons = ['l1-1','l1-2','l1-3','l2-1','l2-2','l3-1','l3-2','l3-3','l3-4','l3-5','l4-1','l4-2','l4-3','l5-1','l5-2','l6-1','l6-2','l7-1','l7-2','l8-1','l8-2','l9-1','l9-2','l10-1','l10-2','l11-1','l11-2','l12-1','l12-2'];
const routes = ['home','library','lab','studio','assess','assess/final','assess/practical','progress','help/glossary','help/faq','help/mistakes','help/resources','about','course','course/intro','course/hierarchy','course/superagent','course/auto-deep','course/interview','nowhere']
  .concat(Array.from({length:12},(_,i)=>'assess/m'+(i+1))).concat(lessons.map(l=>'lesson/'+l))
  .concat(['tour', 'questions', 'automations', 'guide', 'ideas', 'support', 'forum', 'workshops', 'workshops/ai', 'workshops/import', 'workshops/templates']).concat(['start','structure','tasks','views','fields','collab','time','dash','auto','forms','share','power'].map(x => 'tour/' + x));
(async () => {
  const b = await chromium.launch();
  for (const lang of ['en', 'ar']) for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const ctx = await b.newContext({ viewport: vp });
    await ctx.addInitScript(l => { try { localStorage.setItem('omantel-clickup-hub:lang', l); } catch (e) {} }, lang);
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL + '#/home'); await p.waitForTimeout(200);
    const issues = [];
    for (const r of routes) {
      await p.evaluate(h => { location.hash = '#/' + h; }, r); await p.waitForTimeout(120);
      if (r === 'lab') { // visit every view and open the drawer
        for (const v of ['board', 'calendar', 'table', 'list']) { await p.click('[data-view-tab="' + v + '"]'); await p.waitForTimeout(60); await scan(p, r + ':' + v, lang, issues); }
        await p.click('.lr-title'); await p.waitForTimeout(150); await scan(p, 'lab:drawer', lang, issues);
        await p.keyboard.press('Escape');
        continue;
      }
      if (r.startsWith('lesson/')) { // every demo step
        const n = await p.$$eval('.demo-track button', x => x.length);
        for (let i = 0; i < n; i++) { await p.$$eval('.demo-track button', (x, i) => x[i].click(), i); await p.waitForTimeout(20); await p.evaluate(() => {}); }
        await p.click('[data-c="next"]'); await p.waitForTimeout(30);
        // open deeper panels and details to scan hidden text too
        await p.$$eval('details', ds => ds.forEach(d => d.open = true));
      }
      if (r === 'studio') await p.$$eval('details', ds => ds.forEach(d => d.open = true));
      if (r.startsWith('tour/')) { // every step of the part
        for (let s = 0; s < 3; s++) { await p.$$eval('[data-tstep]', (x, s) => x[s].click(), s); await p.waitForTimeout(60); await scan(p, r + ':step' + (s + 1), lang, issues); }
        await p.$$eval('[data-tstep]', x => x[3].click()); await p.waitForTimeout(60);
        await p.$$eval('details', ds => ds.forEach(d => d.open = true));
      }
      if (r === 'tour') { for (const pin of ['start', 'fields', 'power']) { await p.$eval('[data-pin="' + pin + '"]', b => b.click()); await p.waitForTimeout(40); } }
      if (r === 'home') { await p.$eval('[data-ba-set="after"]', b => b.click()); await p.$$eval('details', ds => ds.forEach(d => d.open = true)); }
      if (r === 'questions') { await p.click('[data-fid="assign"] summary'); await p.waitForTimeout(80); await p.$$eval('details', ds => ds.forEach(d => { if (!d.querySelector('[data-cdemo]')) d.open = true; })); }
      if (r.startsWith('workshops/')) { const n = await p.$$eval('[data-wstep]', x => x.length);
        for (let s = 0; s < n; s++) { await p.$$eval('[data-wstep]', (x, s) => x[s].click(), s); await p.waitForTimeout(60);
          if (r === 'workshops/import' && s === 1) { await p.click('[data-sample]'); await p.click('[data-doimport]'); }
          if (r === 'workshops/templates' && s === 1) await p.click('[data-tuse="weekly"]');
          if (r === 'workshops/templates' && s === 2) { await p.click('[data-mkform] button[type=submit]'); await p.click('[data-mkuse]'); }
          await p.$$eval('details', ds => ds.forEach(d => d.open = true)); await scan(p, r + ':step' + (s + 1), lang, issues); }
        continue; }
      if (r === 'forum') { await p.click('[data-thread="s1"]'); await p.waitForTimeout(60); }
      if (r === 'automations') { // every section, the builder with a condition, a test event
        for (let s = 0; s < 5; s++) { await p.$$eval('[data-astep]', (x, s) => x[s].click(), s); await p.waitForTimeout(60);
          if (s === 2) { await p.click('[data-new]'); await p.click('[data-add="c"]'); await p.selectOption('[data-f="ev.status"]', 'review'); await p.waitForTimeout(60); }
          if (s === 4) await p.$$eval('details', ds => ds.forEach(d => d.open = true));
          await scan(p, r + ':section' + (s + 1), lang, issues); }
        continue;
      }
      if (r === 'support') { await p.fill('#rqSubject', 'guest'); await p.waitForTimeout(200); }
      await scan(p, r, lang, issues);
    }
    console.log(`== ${lang} ${vp.width}px: ${issues.length} issues, ${errs.length} page errors`);
    [...new Set(issues)].slice(0, 30).forEach(x => console.log('  ' + x));
    errs.slice(0, 10).forEach(x => console.log('  ERR ' + x));
    await ctx.close();
  }
  await b.close();
})();
async function scan(p, r, lang, issues) {
  const res = await p.evaluate(lang => {
    const out = [];
    const W = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > W + 1) out.push('OVERFLOW ' + document.documentElement.scrollWidth + '>' + W);
    if (lang === 'en') {
      const AR = /[؀-ۿ]/;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = walker.nextNode())) {
        if (!AR.test(n.nodeValue)) continue;
        const el = n.parentElement; if (el.closest('[lang="ar"], #langGate, script, .toast-region')) continue;
        out.push('AR "' + n.nodeValue.trim().slice(0, 50) + '" in <' + el.tagName.toLowerCase() + '.' + el.className + '>');
      }
      document.querySelectorAll('[aria-label],[placeholder],[title]').forEach(el => { if (el.closest('[lang="ar"], #langGate')) return; ['aria-label', 'placeholder', 'title'].forEach(a => { const v = el.getAttribute(a); if (v && AR.test(v)) out.push('AR attr ' + a + '="' + v.slice(0, 40) + '"'); }); });
      if (document.documentElement.dir !== 'ltr') out.push('dir not ltr');
    }
    // text overflowing its own box horizontally (clipped buttons etc.)
    document.querySelectorAll('.btn, .chip, .nav-link, .lang-switch button, .status-badge').forEach(el => { if (el.offsetParent && el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible') out.push('CLIP ' + el.className + ' "' + el.textContent.trim().slice(0, 30) + '"'); });
    return out;
  }, lang);
  res.forEach(x => issues.push(r + ': ' + x));
}
