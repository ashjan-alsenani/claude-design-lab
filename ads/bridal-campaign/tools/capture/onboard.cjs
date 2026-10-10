const { chromium } = require('/home/user/claude-design-lab/oneclick/node_modules/playwright');
const { clean } = require('./setup.cjs');
(async () => {
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'ar' });
  await p.goto('http://localhost:3100/ar/demo/bride-planner/settings', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'البدء من جديد' }).click(); await p.waitForTimeout(400);
  await p.getByRole('button', { name: 'نعم' }).click(); await p.waitForTimeout(1500);
  await clean(p); await p.screenshot({ path: 'shots/onb-welcome.png' });
  await p.getByRole('button', { name: /ابدئي مفكّرتي/ }).click(); await p.waitForTimeout(900);
  await p.locator('input').first().fill('ليان'); await clean(p); await p.screenshot({ path: 'shots/onb-name.png' });
  await p.getByRole('button', { name: /التالي/ }).click(); await p.waitForTimeout(900);
  await clean(p); await p.screenshot({ path: 'shots/onb-date-empty.png' });
  await p.locator('input[type="date"]').first().fill('2027-04-15'); await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.mouse.click(200, 650); await p.waitForTimeout(700);
  await clean(p); await p.screenshot({ path: 'shots/onb-date.png' });
  console.log((await p.evaluate(() => document.body.innerText)).slice(0, 300));
  await br.close();
})();
