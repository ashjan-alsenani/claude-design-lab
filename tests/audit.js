const { chromium } = require('./pw');
const URL = 'file://' + require('path').resolve(__dirname, '../index.html');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  await p.goto(URL); await p.waitForTimeout(300);
  // 1. content completeness
  const content = await p.evaluate(() => {
    const H = window.__hub; const AR = /[؀-ۿ]/; const out = [];
    const snap = JSON.stringify(H.content, (k, v) => typeof v === 'function' ? undefined : v);
    H.setLanguage('en', { silent: true, noSave: true });
    const walk = (o, path) => {
      if (typeof o === 'string') { if (AR.test(o)) out.push(path + ' = ' + o.slice(0, 60)); return; }
      if (!o || typeof o !== 'object') return;
      for (const k of Object.keys(o)) { if (k === 'canon' || k === 'anyOf' || (k === 'ar' && path.includes('GLOSSARY'))) continue;
        if (k === 'act') { o[k].forEach((a, i) => a.forEach(x => { if (typeof x === 'string' && AR.test(H.demoStr(x))) out.push(path + '.act ' + x.slice(0, 50)); })); continue; }
        walk(o[k], path + '.' + k); }
    };
    walk(H.content, 'C');
    // structural checks
    H.content.LESSONS.forEach(l => { const ex = l.exercise;
      if (ex.type === 'match') ex.pairs.forEach(p => { if (!ex.choices.includes(p[1])) out.push(l.id + ' match answer missing: ' + p[1]); });
      if (ex.type === 'builder') ex.slots.forEach(s => { if (s.options.indexOf(s.answer) !== s.canon.indexOf(s.canon[s.options.indexOf(s.answer)]) || s.options.indexOf(s.answer) < 0) out.push(l.id + ' builder answer ' + s.key); });
    });
    const enMatch = H.content.LESSONS.filter(l => l.exercise.type === 'match').map(l => l.exercise.pairs.map(p => l.exercise.choices.indexOf(p[1])).join());
    const enBuild = H.content.LESSONS.filter(l => l.exercise.type === 'builder').map(l => l.exercise.slots.map(s => s.options.indexOf(s.answer)).join());
    H.setLanguage('ar', { silent: true, noSave: true });
    const arMatch = H.content.LESSONS.filter(l => l.exercise.type === 'match').map(l => l.exercise.pairs.map(p => l.exercise.choices.indexOf(p[1])).join());
    const arBuild = H.content.LESSONS.filter(l => l.exercise.type === 'builder').map(l => l.exercise.slots.map(s => s.options.indexOf(s.answer)).join());
    if (JSON.stringify(enMatch) !== JSON.stringify(arMatch)) out.push('match answer indexes differ');
    if (JSON.stringify(enBuild) !== JSON.stringify(arBuild)) out.push('builder answer indexes differ ' + enBuild + ' | ' + arBuild);
    const snap2 = JSON.stringify(H.content, (k, v) => typeof v === 'function' ? undefined : v);
    if (snap !== snap2) out.push('AR content not restored after round trip');
    return out.concat(H.errors.map(e => 'ERR ' + e));
  });
  console.log('CONTENT ISSUES', content.length); content.slice(0, 40).forEach(x => console.log('  ' + x));
  await b.close();
  console.log(errs.join('\n'));
})();
