/**
 * Screenshots explainer scenes frozen at a moment, to check them visually.
 *   node scripts/explain-shot.mjs <lessonId> [outDir] [port]
 * Needs a running preview (npm run build && npx vite preview --port 4176).
 * Writes <outDir>/<lesson>-s<scene>.png at the end of each scene (and -mid at the middle).
 */
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const [lesson, out = '/tmp/explain-shots', port = '4176'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await pw.chromium.launch();
const p = await b.newPage({ viewport: { width: 760, height: 900 } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(`http://localhost:${port}/#/explain/${lesson}?scene=0&t=0.1`);
await p.waitForTimeout(1500);
const n = await p.locator('.xplayer__dots li').count();
for (let s = 0; s < n; s++) {
  for (const [tag, frac] of [['mid', 0.5], ['end', 0.97]]) {
    await p.goto(`http://localhost:${port}/#/explain/${lesson}?scene=${s}&t=0`);
    await p.waitForTimeout(400);
    const D = await p.evaluate(() => {
      const st = document.querySelector('.xstage');
      const a = st && getComputedStyle(st.querySelector('.xactor') ?? st).animationDuration;
      return parseFloat(a) || 8;
    });
    await p.goto(`http://localhost:${port}/#/explain/${lesson}?scene=${s}&t=${(D * frac).toFixed(2)}`);
    await p.waitForTimeout(900);
    await p.locator('.xplayer__screen').screenshot({ path: `${out}/${lesson}-s${s + 1}-${tag}.png` });
  }
}
console.log(`${n} scenes → ${out}`, errors.length ? 'ERRORS ' + errors.join(' | ') : 'no errors');
await b.close();
