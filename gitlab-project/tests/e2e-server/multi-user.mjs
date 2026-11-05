// Several people using the shared version at once, through the real interface.
// Needs a running server with AUTH_MODE=dev, ADMIN_EMAILS including admin@example.com, and INITIAL_DATA=sample
// on a fresh database (see tests/e2e-server/run-all.mjs, which starts one).
import { chromium } from 'playwright';
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8080/employee-directory/';
const b = await chromium.launch();
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

async function person(email, hash = '#/home') {
  const c = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await c.addInitScript(() => { localStorage.setItem('dtd-lang', 'en'); document.addEventListener('securitypolicyviolation', e => (window.__csp = window.__csp || []).push(e.violatedDirective)); });
  const p = await c.newPage();
  p.errors = [];
  p.on('pageerror', e => p.errors.push(process.env.DEBUG ? (e.stack || e.message).slice(0, 400) : e.message));
  p.on('console', m => { if (process.env.DEBUG && m.type() === 'warning') console.log('   ', email, 'console:', m.text()); });
  p.on('response', r => { if (r.url().includes('state/changes') && r.status() !== 200 && process.env.DEBUG) console.log('   ', email, 'save ->', r.status()); });
  await p.goto(BASE + hash);
  await p.waitForSelector('#email', { timeout: 15000 });
  await p.fill('#email', email);
  await p.locator('button[type=submit]').click();
  await p.waitForTimeout(2500);
  return p;
}
const setName = (p, name) => p.evaluate(n => {
  const lab = [...document.querySelectorAll('#view label')].find(x => x.textContent.trim().startsWith('Full name (English)'));
  const f = lab.control || document.getElementById(lab.htmlFor); f.value = n; f.dispatchEvent(new Event('input', { bubbles: true }));
}, name);
const save = async p => { await p.locator('button:has-text("Save")').last().click(); await p.waitForTimeout(2500); };
const toasts = p => p.evaluate(() => [...document.querySelectorAll('.toast')].map(t => t.innerText).join(' | '));

// 1. administrator signs in and returns to the page they asked for
const admin = await person('admin@example.com', '#/employee/6');
ok(/#\/employee\/6$/.test(admin.url()), 'after sign-in the administrator lands on the link they opened');
ok((await admin.locator('h1').first().textContent()).includes('Noura'), 'profile loads from the server');
ok(await admin.evaluate(() => !Object.keys(localStorage).some(k => k.startsWith('dtd-review-v5'))), 'no directory data is kept in the browser\'s storage');

// 2. administrator adds two accounts in Users & access (no passwords in the shared version)
await admin.goto(BASE + '#/manage/users'); await admin.waitForTimeout(1500);
ok(/company account/i.test(await admin.locator('.us-note').innerText()), 'Users & access explains company sign-in');
for (const [name, email, role] of [['Test Viewer', 'viewer.one@example.com', 'viewer'], ['Test Manager', 'mgr.one@example.com', 'manager']]) {
  await admin.locator('#view button').filter({ hasText: /Add a user/ }).first().click(); await admin.waitForTimeout(600);
  const m = admin.locator('.modal');
  ok(!(await m.locator('#uf_p').isVisible()), `no password field when adding ${role}`);
  await m.getByLabel(/^Name/).fill(name); await m.getByLabel(/^Username/).fill(email);
  await m.locator(`input[name=uf_r][value=${role}]`).check({ force: true });
  if (role === 'manager') {
    await m.locator('input[name=uf_s][value=some]').check({ force: true });
    await m.locator('label').filter({ hasText: 'Digital Network & Security Operations' }).locator('input').first().check({ force: true });
    await m.locator('input[value=edit]').check({ force: true });
  }
  await m.locator('button').filter({ hasText: /Add user/ }).last().click(); await admin.waitForTimeout(1500);
}
ok(/sign in with their company account/i.test(await toasts(admin)), 'confirmation says how the person signs in');

// 3. the administrator changes a name; a viewer on another computer sees it
await admin.goto(BASE + '#/manage/edit/6'); await admin.waitForTimeout(1500);
await setName(admin, 'Noura Shared-Change'); await save(admin);
const viewer = await person('viewer.one@example.com', '#/employee/6');
ok((await viewer.locator('h1').first().textContent()).includes('Shared-Change'), 'viewer sees the administrator\'s change');
ok(!/\+968/.test(await viewer.locator('#view').innerText()), 'viewer does not see the phone number (restricted field)');
await viewer.goto(BASE + '#/manage/users'); await viewer.waitForTimeout(1200);
ok(/isn.t available to your account/.test(await viewer.locator('#view').innerText()), 'viewer cannot open Users & access');
const st = await viewer.evaluate(async () => (await fetch('api/state?doc=main', { headers: { 'X-DTD-Request': '1' } })).json());
ok(st.data.users.length === 1 && (st.data.audit || []).length === 0 && !st.data.allow, 'the server sends a viewer only their own account, no activity log and no allowances');

// 4. live update: the viewer keeps a profile open while the administrator changes it
await viewer.goto(BASE + '#/employee/6'); await viewer.waitForTimeout(1200);
await admin.goto(BASE + '#/manage/edit/6'); await admin.waitForTimeout(1500);
await setName(admin, 'Noura Live-Update'); await save(admin);
await viewer.waitForTimeout(23000);
ok((await viewer.locator('h1').first().textContent()).includes('Live-Update'), 'an open page picks up a colleague\'s change within about 20 seconds');

// 5. two people edit the same employee: the second save is reported, not silently overwriting
const mgr = await person('mgr.one@example.com', '#/manage/edit/6');
await admin.goto(BASE + '#/manage/edit/6'); await admin.waitForTimeout(1500);
await mgr.waitForTimeout(500);
await setName(mgr, 'Noura By-Manager'); await save(mgr);
if (process.env.DEBUG) console.log('   mgr after save:', await mgr.locator('h1').first().textContent().catch(()=>'-'), '|', await toasts(mgr), '| user:', JSON.stringify((await mgr.evaluate(async () => (await (await fetch('api/state?doc=main', { headers: { 'X-DTD-Request': '1' } })).json()))).data.users), '| writable emp:', await mgr.evaluate(async () => (await (await fetch('api/state?doc=main', { headers: { 'X-DTD-Request': '1' } })).json()).writable.includes('employees')));
await setName(admin, 'Noura By-Admin'); await save(admin);
const msg = await toasts(admin);
ok(/changed the same information/.test(msg) || /changed elsewhere/.test(msg), 'the second person is told about the conflict: ' + msg.slice(0, 90));
await admin.goto(BASE + '#/employee/6'); await admin.waitForTimeout(800);
// leaving the form that still has the unsaved (refused) edit asks first
const discard = admin.locator('.modal button').filter({ hasText: /Discard/ });
if (await discard.count()) { await discard.first().click(); await admin.waitForTimeout(1200); }
if (process.env.DEBUG) console.log('   admin continuity:', await admin.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('dtd-review-v5')).continuity)), 'server:', await admin.evaluate(async () => JSON.stringify((await (await fetch('api/state?doc=main', { headers: { 'X-DTD-Request': '1' } })).json()).data.continuity)));
if (process.env.DEBUG) { await admin.screenshot({ path: '/tmp/adm-after-conflict.png' }); console.log('   admin errors', JSON.stringify(admin.errors), 'admin url', admin.url(), '| body:', (await admin.locator('body').innerText()).slice(0, 200).replace(/\n/g, ' / ')); }
ok((await admin.locator('h1').first().textContent()).includes('By-Manager'), 'the first save is kept');

// 6. the manager can't edit outside their department (the server refuses even a direct request)
const r = await mgr.evaluate(async () => {
  const s = await (await fetch('api/state?doc=main', { headers: { 'X-DTD-Request': '1' } })).json();
  const e = s.data.employees.find(x => x.id === 2);
  return (await fetch('api/state/changes', { method: 'POST', headers: { 'X-DTD-Request': '1', 'Content-Type': 'application/json' }, body: JSON.stringify({ doc: 'main', changes: [{ part: 'employees', base: 1, ops: { upsert: { 2: { ...e, emp_no: 'X' } }, remove: [], base: {} } }] }) })).status;
});
ok(r === 403, 'direct request to change another department is refused (' + r + ')');

// 7. sign out ends the server session
await viewer.click('#userBtn'); await viewer.waitForTimeout(300);
await viewer.locator('#userPop').getByText(/Sign out/).first().click(); await viewer.waitForTimeout(2500);
ok(await viewer.evaluate(async u => (await fetch(u + 'api/session', { headers: { 'X-DTD-Request': '1' } })).status, BASE) === 401, 'after sign out the server session is gone');
ok(/sign-in/i.test(await viewer.locator('body').innerText()), 'after sign out the sign-in page is shown');

// 8. someone not added to the directory
const stranger = await person('stranger@example.com');
ok(/has(n.t| not) been added/.test(await stranger.locator('body').innerText()), 'an account not in Users & access sees a clear message');

for (const [who, p] of [['admin', admin], ['viewer', viewer], ['manager', mgr]]) {
  ok(p.errors.length === 0, `${who}: no JavaScript errors ${p.errors.slice(0, 2).join(' | ')}`);
  ok((await p.evaluate(() => (window.__csp || []).length)) === 0, `${who}: no Content-Security-Policy violations`);
}
await b.close();
console.log(fail ? fail + ' FAILED' : 'ALL PASS');
process.exit(fail ? 1 : 0);
