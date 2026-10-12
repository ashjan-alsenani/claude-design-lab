// node still.cjs page.html out.png width height  (transparent background)
const path = require('path');
const pw = require('/home/user/claude-design-lab/oneclick/node_modules/playwright');
(async () => {
  const [f, out, w, h] = process.argv.slice(2);
  const br = await pw.chromium.launch();
  const p = await br.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve(f));
  await p.waitForFunction(() => [...document.images].every(i => i.complete));
  await p.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: +w, height: +h } });
  await br.close();
})();
