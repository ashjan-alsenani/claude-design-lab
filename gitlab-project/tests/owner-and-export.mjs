// The owner account comes from the build settings (not the code), and an exported single-file copy still signs the owner in.
// Needs TEST_OWNER_USERNAME and TEST_OWNER_PASSWORD matching the OWNER_* values the site was built with. Skips otherwise.
import {chromium} from 'playwright';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
const BASE=process.env.BASE_URL||'http://127.0.0.1:8080/employee-directory/';
const U=process.env.TEST_OWNER_USERNAME,PW=process.env.TEST_OWNER_PASSWORD;
if(!U||!PW){console.log('SKIP owner sign-in checks: set TEST_OWNER_USERNAME and TEST_OWNER_PASSWORD');process.exit(0)}
const b=await chromium.launch();let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};
const c=await b.newContext({viewport:{width:1280,height:800},acceptDownloads:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
const signIn=async(pg,u,pw)=>{await pg.fill('#email',u);await pg.fill('#password',pw);await pg.locator('button[type=submit]').click();await pg.waitForTimeout(1500)};
await p.goto(BASE);await p.waitForTimeout(1500);
await signIn(p,U,'wrong-password-123');ok(await p.locator('#password').count()===1,'wrong owner password is refused');
await p.reload();await p.waitForTimeout(1200);
await signIn(p,U,PW);ok(await p.locator('#password').count()===0&&await p.locator('#userBtn').count()===1,'owner signs in with the configured username and password');
let who=await p.locator('#userBtn').innerText();ok(/admin|مسؤول/i.test(who),'owner is an administrator: '+who.replace(/\s+/g,' '));
// export the site with data, open the file, sign in again
await p.click('#userBtn');await p.waitForTimeout(300);await p.locator('#userPop').getByText(/Export the site|تصدير الموقع/).first().click();await p.waitForTimeout(600);
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:30000}),p.locator('.modal button').filter({hasText:/Export|Create|تصدير|إنشاء|Download|تنزيل/}).last().click()]);
const f=join(mkdtempSync(join(tmpdir(),'dtd-export-')),'export.html');await dl.saveAs(f);ok(true,'exported a single-file copy');
const c2=await b.newContext({viewport:{width:1280,height:800}});const q=await c2.newPage();const e2=[];q.on('pageerror',e=>e2.push(e.message));
await q.goto('file://'+f);await q.waitForTimeout(2000);await signIn(q,U,PW);
ok(await q.locator('#password').count()===0,'owner signs in to the exported copy');
await q.evaluate(()=>location.hash='#/directory');await q.waitForTimeout(1200);ok(/25|\d+/.test(await q.locator('#view').innerText()),'exported copy shows the directory');
ok(errs.length===0&&e2.length===0,'no JavaScript errors '+[...errs,...e2].join(' | '));
await b.close();console.log(fail?fail+' FAILED':'ALL PASS');process.exit(fail?1:0);
