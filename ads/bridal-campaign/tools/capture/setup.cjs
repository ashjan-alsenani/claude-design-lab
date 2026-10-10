// Shared: open the real demo, set the campaign profile (Riyadh, SAR, 187 days) and tick real tasks to reach 42%.
const { chromium } = require('/home/user/claude-design-lab/oneclick/node_modules/playwright');
const BASE = 'http://localhost:3100/ar/demo/bride-planner';
const go = async (p, s) => { await p.evaluate((u) => window.next.router.push(u), BASE + (s ? '/' + s : '')); await p.waitForTimeout(1600); };
const readiness = async (p) => { await go(p, ''); const t = await p.evaluate(() => document.body.innerText); const m = t.match(/([٠-٩]+)٪/); return m ? +m[1].replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)) : -1; };
async function open(opts = {}) {
  const br = await chromium.launch();
  const p = await br.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, locale: 'ar', ...opts });
  await p.goto(BASE + '/settings', { waitUntil: 'networkidle' });
  await p.fill('#st-date', '2027-04-15'); await p.fill('#st-country', 'السعودية'); await p.fill('#st-city', 'الرياض');
  await p.selectOption('#st-cur', 'SAR');
  await p.getByRole('button', { name: 'حفظ', exact: true }).click(); await p.waitForTimeout(400);
  // a real payment entered through the app's own form: photographer, due in 3 days
  await go(p, 'budget');
  await p.getByRole('button', { name: /دفعة جديدة/ }).click(); await p.waitForTimeout(600);
  const dlg = p.getByRole('dialog', { name: 'دفعة جديدة' });
  await dlg.getByLabel('الاسم', { exact: true }).fill('المصورة: الدفعة الثانية');
  await dlg.getByLabel('المبلغ', { exact: true }).fill('1500');
  await dlg.getByLabel('التاريخ', { exact: true }).fill('2026-10-13');
  const sel = dlg.getByLabel('المورد', { exact: true });
  const vopts = await sel.locator('option').allTextContents(); const ph = vopts.find(o => /لوميير|عدسة/.test(o)); if (ph) await sel.selectOption({ label: ph });
  await dlg.getByRole('button', { name: 'حفظ', exact: true }).click(); await p.waitForTimeout(600);
  let r = await readiness(p);
  let guard = 0;
  while (r < 42 && guard++ < 60) {
    await go(p, 'checklist');
    const n = r < 38 ? 3 : 1;
    for (let k = 0; k < n; k++) {
      const b = p.locator('button[aria-label^="تمّت:"]').first(); if (!(await b.count())) break;
      await b.click({ timeout: 5000 }).catch(() => {}); await p.waitForTimeout(350);
      const close = await p.$('[role="dialog"] button'); if (close) { await p.keyboard.press('Escape'); await p.waitForTimeout(150); }
    }
    r = await readiness(p);
  }
  return { br, p, go, readiness: r };
}
const CLEAN = `nextjs-portal{display:none!important}`;
async function clean(p) {
  await p.addStyleTag({ content: CLEAN }).catch(() => {});
  await p.evaluate(() => { const el = [...document.querySelectorAll('div,p,span')].find(e => e.textContent.trim().startsWith('نسخة تجريبية') && e.textContent.length < 80); if (el) { let x = el; while (x.parentElement && x.parentElement.textContent.trim().length < 80) x = x.parentElement; x.style.display = 'none'; } });
}
module.exports = { open, BASE, clean };
if (require.main === module) open().then(async ({ br, p, readiness }) => { console.log('readiness', readiness); console.log((await p.evaluate(() => document.body.innerText)).slice(0, 400)); await br.close(); });
