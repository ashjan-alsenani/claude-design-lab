const { open, clean } = require('./setup.cjs');
const fs = require('fs');
(async () => {
  const { br, p, go } = await open();
  fs.mkdirSync('shots', { recursive: true });
  const secs = ['', 'checklist', 'calendar', 'budget', 'vendors', 'guests', 'bride', 'closet', 'shopping', 'home', 'honeymoon', 'day', 'documents', 'more'];
  for (const s of secs) {
    await p.setViewportSize({ width: 390, height: 844 });
    await go(p, s); await p.evaluate(() => window.scrollTo(0, 0)); await clean(p); await p.waitForTimeout(900);
    await p.screenshot({ path: `shots/${s || 'dashboard'}-screen.png` });
    await p.setViewportSize({ width: 390, height: 3200 }); await clean(p); await p.waitForTimeout(900);
    const h = await p.evaluate(() => Math.min(3200, document.documentElement.scrollHeight));
    await p.screenshot({ path: `shots/${s || 'dashboard'}-tall.png`, clip: { x: 0, y: 0, width: 390, height: h } });
    const boxes = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3,section,.bj-card,ul,li,table')].map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), cls: (e.className && e.className.baseVal === undefined ? e.className : '').toString().slice(0, 40), x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height), text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 50) }; }).filter(b => b.w > 100 && b.h > 20));
    fs.writeFileSync(`shots/${s || 'dashboard'}-boxes.json`, JSON.stringify(boxes, null, 1));
    console.log(s || 'dashboard', h);
  }
  await br.close();
})();
