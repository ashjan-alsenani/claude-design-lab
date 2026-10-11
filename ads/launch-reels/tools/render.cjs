// Deterministic frame renderer: loads an ad page, calls window.render(t) for each frame and screenshots it.
// usage: node render.cjs page.html outDir startFrame endFrame [fps=30]
//        node render.cjs page.html --still out.png t1[,t2...]   (preview stills; out name gets -t suffix)
const path = require('path'), fs = require('fs');
let pw; try { pw = require('playwright'); } catch { pw = require('/home/user/claude-design-lab/oneclick/node_modules/playwright'); }
(async () => {
  const [pageFile, a, b, c, d] = process.argv.slice(2);
  const br = await pw.chromium.launch();
  const p = await br.newPage({ viewport: { width: 1080, height: +(process.env.VH || 1920) } });
  await p.goto('file://' + path.resolve(pageFile));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every(i => i.complete));
  await p.waitForTimeout(300);
  if (a === '--still') {
    for (const t of c.split(',').map(Number)) {
      await p.evaluate((t) => window.render(t), t);
      await p.waitForTimeout(60);
      await p.screenshot({ path: b.replace(/\.(png|jpg)$/, `-${t}.$1`), type: b.endsWith('.png') ? 'png' : 'jpeg', quality: b.endsWith('.png') ? undefined : 92 });
    }
  } else {
    const fps = +(d || 30); fs.mkdirSync(a, { recursive: true });
    for (let f = +b; f < +c; f++) {
      await p.evaluate((t) => window.render(t), f / fps);
      await p.screenshot({ path: `${a}/f${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 93 });
    }
  }
  await br.close();
})();
