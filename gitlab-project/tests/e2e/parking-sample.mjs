import {chromium} from 'playwright';
const BASE=process.env.BASE_URL||'http://127.0.0.1:8098/employee-directory/';
const b=await chromium.launch();let F=0;const ok=(n,v,x='')=>{v||F++;console.log(v?'PASS':'FAIL',n,v?'':x)};const U=BASE;const errs=[];
const ctx=async(l='ar',w=1440)=>{const c=await b.newContext({viewport:{width:w,height:900}});await c.addInitScript(l=>{if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');sessionStorage.setItem('dtd-review-auth','1');localStorage.setItem('dtd-lang',l)}},l);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));return p};
const LS=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('dtd-review-v5')));
let p=await ctx();await p.goto(U+'#/parking');await p.waitForTimeout(2200);let D=await LS(p);
ok('12 spaces, 9 allocations, 2 on waiting list, 1 exception',D.park.spots.length===12&&D.park.asg.length===9&&D.park.wait.length===2&&D.park.exc.length===1);
const kp=await p.$$eval('.pk-kpi',x=>x.map(k=>k.querySelector('.al-kpi-l').innerText.trim()+'='+k.querySelector('b').firstChild.textContent));console.log(kp.join(' | '));
const K=Object.fromEntries(kp.map(s=>s.split('=')));
ok('KPIs: total 12, allocated 9, available 1, reserved 1, out of service 1, waiting 2',K['إجمالي المواقف']==='12'&&K['مخصصة حاليًا']==='9'&&K['متاحة']==='1'&&K['محجوزة']==='1'&&K['خارج الخدمة']==='1'&&K['في قائمة الانتظار']==='2',JSON.stringify(K));
ok('capacity bar: 12 recorded, 8 not yet',/مسجل 12/.test(await p.textContent('.pk-cap'))&&/غير مسجل بعد 8/.test(await p.textContent('.pk-cap')));
const hero=(await p.textContent('.pk-nfp .ax-nfhero')).replace(/\s+/g,' ');console.log('panel:',hero);ok('panel: 1 of 9 holding a space without entitlement',/^\s*1/.test(hero)&&/من 9 لديهم موقف/.test(hero));
const row=async id=>(await p.locator(`.pk-table tr:has([data-pk-emp="${id}"])`).first().innerText()).replace(/\s+/g,' ');
for(const id of [1,2,3,5,6,7,8]){let r=await row(id);ok(`emp ${id}: eligible + allocated`,/مؤهل/.test(r)&&!/غير مؤهل/.test(r)&&/مخصص له/.test(r)&&/P-0/.test(r),r.slice(0,140))}
let r4=await row(4);ok('emp 4 (Manager): eligible by exception, allocated',/مؤهل باستثناء/.test(r4)&&/EX-SMP-01/.test(r4)&&/P-04/.test(r4),r4.slice(0,200));
let r19=await row(19);ok('emp 19 (resigned): not eligible, still holds P-09, marked !',/غير مؤهل/.test(r19)&&/P-09/.test(r19)&&await p.locator('.pk-table tr:has([data-pk-emp="19"]) .al-nf').count()===1);
for(const id of [9,10]){let r=await row(id);ok(`emp ${id}: eligible, on waiting list`,/مؤهل/.test(r)&&/قائمة انتظار/.test(r))}
ok('no overlapping allocations',await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('dtd-review-v5')).park,E=x=>x||'9999-12-31',A=d.asg;for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++){let x=A[i],y=A[j];if((x.spot===y.spot||x.emp===y.emp)&&x.from<=E(y.to)&&y.from<=E(x.to))return false}return true}));
await p.screenshot({path:'v103-emp.png'});
await p.click('[data-pk-tab="spots"]');await p.waitForTimeout(700);await p.screenshot({path:'v103-spots.png',fullPage:true});ok('spaces shown as 12 cards',await p.locator('.pk-spot').count()===12);
await p.click('[data-pk-tab="wait"]');await p.waitForTimeout(700);ok('waiting list ordered with reasons',/أقدم طلب مسجّل/.test(await p.textContent('#pkBody'))&&await p.locator('#pkBody tbody tr').count()===2);
// action still works on sample: allocate the free accessible space P-10 to emp 9
await p.click('[data-pk-tab="emp"]');await p.waitForTimeout(500);await p.click('.page-pk .al-admin summary');await p.click('.page-pk .al-admin-pop [data-pk-assign]');await p.waitForTimeout(500);await p.selectOption('#pa_emp','9');await p.selectOption('#pa_spot','PK-smp10');await p.click('.modal-foot .btn-primary');await p.waitForTimeout(700);
D=await LS(p);ok('allocating P-10 to emp 9 works and takes them off the waiting list',D.park.asg.length===10&&D.park.wait.find(w=>w.emp===9).out);
await p.reload();await p.waitForTimeout(1500);D=await LS(p);ok('reload does not add the sample again',D.park.spots.length===12&&D.park.asg.length===10);
// profile card
await p.evaluate(()=>location.hash='#/employee/1');await p.waitForTimeout(1200);ok('VP profile shows parking card with P-01',/P-01/.test(await p.locator('section:has(#ps-park)').innerText()));
await p.context().close();
// own data untouched
p=await ctx();await p.goto(U+'#/home');await p.waitForTimeout(1500);await p.evaluate(()=>{let D=JSON.parse(localStorage.getItem('dtd-review-v5'));D.park={spots:[],asg:[],wait:[],exc:[]};delete D.pkSmp1;D.employees.push({...D.employees[0],id:1002,emp_no:"77002"});localStorage.setItem('dtd-review-v5',JSON.stringify(D))});await p.reload();await p.waitForTimeout(1500);D=await LS(p);ok('own/edited data: no parking sample added',D.park.spots.length===0&&D.pkSmp1===1);
await p.context().close();
ok('no JS errors',!errs.length,errs.join(' | '));console.log(F?F+' FAILED':'ALL PASS');await b.close();
