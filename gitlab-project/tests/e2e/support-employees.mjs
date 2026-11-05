import {chromium} from 'playwright';
const BASE=process.env.BASE_URL||'http://127.0.0.1:8098/employee-directory/';
const b=await chromium.launch();let F=0;const ok=(n,v,x='')=>{v||F++;console.log(v?'PASS':'FAIL',n,v?'':x)};const U=BASE;const errs=[];
const ctx=async(l='ar',w=1440)=>{const c=await b.newContext({viewport:{width:w,height:900}});await c.addInitScript(l=>{if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');sessionStorage.setItem('dtd-review-auth','1');localStorage.setItem('dtd-lang',l)}},l);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));return p};
const LS=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('dtd-review-v5')));
// fresh browser
let p=await ctx();await p.goto(U+'#/allowances');await p.waitForTimeout(2200);let D=await LS(p);
ok('fresh sample: 25 employees, 6 new at Support & operations',D.employees.length===25&&D.employees.filter(e=>e.level_id===6&&/^5002[0-5]$/.test(e.emp_no)).length===6);
ok('5 fictional allowance records + type mapping',D.allow.recs.filter(r=>/^smp-/.test(r.id)).length===5&&D.allow.elig.tmap['علاوة الأعمال الفنية']==='spec');
const kp=await p.$$eval('.ax-kpi',x=>x.map(k=>k.innerText.replace(/\s+/g,' ')));console.log(kp.join('\n'));
ok('summary: eligible for each allowance now shows 1',kp.some(k=>/المساعدة.*\b1\b/.test(k))&&kp.some(k=>/مؤهل — الأعمال الفنية[^م].*\b1\b/.test(k)));
ok('the "nobody is eligible" note is gone',await p.locator('.ax-none').count()===0);
const hero=(await p.textContent('.ax-nfp .ax-nfhero').catch(()=>'')).replace(/\s+/g,' ');console.log('not-entitled panel:',hero);
await p.click('[data-al-tab="elig"]');await p.waitForTimeout(800);
const res=await p.evaluate(()=>Object.fromEntries([20,21,22,23,24,25].map(id=>{let r=document.querySelector(`tr[data-ax-open="${id}"]`);return[id,r?r.innerText.replace(/\s+/g,' '):'NOT IN TABLE']})));for(const [k,v] of Object.entries(res))console.log(k,v.slice(0,200));
ok('20 eligible technical',/مؤهل لعلاوة الأعمال الفنية/.test(res[20]));ok('21 eligible assistant',/مؤهل لعلاوة الأعمال الفنية المساعدة/.test(res[21]));
ok('22 not yet (qualifying period)',/مدة الاستحقاق|لم يكمل/.test(res[22]));ok('23 doesn\'t meet conditions',/لا يستوفي|غير مؤهل/.test(res[23]));
ok('24 payment suspended',/موقوف|إجازة/.test(res[24]));ok('25 needs review/verification',/مراجعة|تحقق/.test(res[25]));
await p.screenshot({path:'v102-elig.png',fullPage:false});
await p.click('[data-al-tab="reg"]');await p.waitForTimeout(800);const flagged=await p.$$eval('.al-table tbody tr',x=>x.filter(r=>r.querySelector('.al-nf')).map(r=>(r.innerText.match(/500\d\d/)||[''])[0]));console.log('flagged in register:',flagged);
ok('register flags 22, 23, 24 (and not 20, 21)',['50022','50023','50024'].every(n=>flagged.includes(n))&&!flagged.includes('50020')&&!flagged.includes('50021'));
await p.click('[data-al-tab="ov"]');await p.waitForTimeout(800);await p.screenshot({path:'v102-ov.png',fullPage:true});
// directory & org chart
await p.evaluate(()=>location.hash='#/directory');await p.waitForTimeout(1000);ok('directory shows 25 people',/25/.test(await p.textContent('#view .page-sub')));
await p.evaluate(()=>location.hash='#/employee/21');await p.waitForTimeout(1000);ok('profile of a new person opens with manager link',/أسماء راشد الهنائية/.test(await p.textContent('#view h1'))&&/عائشة|Aisha/.test(await p.innerText('#view')));
// parking: support level not eligible
await p.evaluate(()=>location.hash='#/parking');await p.waitForTimeout(1200);ok('parking: Support & operations level not eligible',/غير مؤهل/.test(await p.locator('.pk-table tr:has([data-pk-emp="20"])').innerText()));
// reload: not added twice
await p.reload();await p.waitForTimeout(1500);D=await LS(p);ok('reload does not add them twice',D.employees.length===25&&D.allow.recs.filter(r=>/^smp-/.test(r.id)).length===5);
await p.context().close();
// existing edited dataset is not touched
p=await ctx();await p.goto(U+'#/home');await p.waitForTimeout(1500);await p.evaluate(()=>{let D=JSON.parse(localStorage.getItem('dtd-review-v5'));D.employees=D.employees.filter(e=>!/^5002/.test(e.emp_no));D.employees.push({...D.employees[0],id:1001,emp_no:"77001"});delete D.supV1;D.allow.recs=D.allow.recs.filter(r=>!/^smp-/.test(r.id));localStorage.setItem('dtd-review-v5',JSON.stringify(D))});
await p.reload();await p.waitForTimeout(1500);D=await LS(p);ok('own/edited data is left alone',D.employees.length===20&&!D.employees.some(e=>/^5002/.test(e.emp_no))&&D.supV1===1);
await p.context().close();
ok('no JS errors',!errs.length,errs.join(' | '));console.log(F?F+' FAILED':'ALL PASS');await b.close();
