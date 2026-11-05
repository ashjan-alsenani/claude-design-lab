import {chromium} from 'playwright';
const BASE=process.env.BASE_URL||'http://127.0.0.1:8098/employee-directory/';
const b=await chromium.launch();let F=0;const ok=(n,v,x='')=>{v||F++;console.log(v?'PASS':'FAIL',n,v?'':x)};const U=BASE;const errs=[];
const pg=async(l,w,h=900,auth=true)=>{const c=await b.newContext({viewport:{width:w,height:h}});await c.addInitScript(([l,a])=>{if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');a&&sessionStorage.setItem('dtd-review-auth','1');localStorage.setItem('dtd-lang',l)}},[l,auth]);const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));return p};
// home order + fold
let p=await pg('en',1440);await p.goto(U+'#/home');await p.waitForTimeout(2000);
const order=await p.evaluate(()=>[...document.querySelector('#view .page').children].map(e=>(e.className||e.tagName).toString().split(' ')[0]));console.log('home order:',order.join(' > '));
ok('home: unit map directly under the KPI cards, then the needs-action grid; quick numbers folded',order.indexOf('hp')===order.indexOf('ho-kpis')+1&&order.indexOf('ho-grid')===order.indexOf('hp')+1&&await p.locator('details.he-fold:not([open])').count()===1,order.join(','));
await p.screenshot({path:'d-home-en.png',fullPage:true});
await p.click('.he-fold > summary');await p.waitForTimeout(400);ok('fold opens with tiles',await p.locator('.he-fold[open] .he-tile').count()>=5);await p.reload();await p.waitForTimeout(1500);ok('fold remembers open state',await p.locator('.he-fold[open]').count()===1);await p.click('.he-fold > summary');await p.waitForTimeout(200);
// directory chips
await p.evaluate(()=>location.hash='#/directory');await p.waitForTimeout(1200);const chips=await p.$$eval('.pill-miss',x=>x.map(e=>e.innerText));console.log('profile chips:',chips.length,chips.slice(0,4));
ok('directory: completeness note only on profiles under 80%, neutral colour',chips.every(t=>/Profile (\d+)%/.test(t)&&Number(t.match(/(\d+)%/)[1])<80)&&await p.evaluate(()=>{let e=document.querySelector('.pill-miss');return !e||getComputedStyle(e).color!=='rgb(185, 28, 28)'}));
await p.screenshot({path:'d-dir-en.png'});
// allowance note
await p.evaluate(()=>location.hash='#/allowances');await p.waitForTimeout(1500);ok('allowances summary: no "nobody eligible" note now that people are eligible',!/Nobody is eligible in the current data/.test(await p.textContent('#view')));
await p.context().close();
// phone checks
for(const l of ['ar','en'])for(const w of [320,360,375,390,414]){p=await pg(l,w,820);await p.goto(U+'#/directory');await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>({ov:document.documentElement.scrollWidth-innerWidth,data:getComputedStyle(document.querySelector('.demo-badge .db-s')).display,save:getComputedStyle(document.querySelector('.topbar .save-state')).display,add:document.querySelector('.page-directory .head-actions .btn-primary')?.innerText.trim()}));
 ok(`${l} ${w}: no overflow; one data menu${w>360?' labelled':''}; Add labelled`,r.ov<=0&&r.save==='none'&&(w>360?r.data!=='none':r.data==='none')&&!!r.add,JSON.stringify(r));
 if(w===390){await p.locator('.topbar').screenshot({path:`d-topbar-${l}.png`});await p.screenshot({path:`d-dir-${l}-m.png`});
  await p.evaluate(()=>location.hash='#/dashboard');await p.waitForTimeout(1500);const sx=await p.evaluate(()=>[...document.querySelectorAll('.dx-tw,.table-wrap,.km-wrap')].filter(e=>e.scrollWidth>e.clientWidth+4).map(e=>e.dataset.sx));console.log('   dashboard scroll cues',l,sx);
  ok(`${l} wide table shows a fade at the end before scrolling`,sx.length&&sx[0]==='e');
  await p.evaluate(()=>{let e=[...document.querySelectorAll('.dx-tw,.table-wrap')].find(e=>e.scrollWidth>e.clientWidth+4);e.scrollLeft=(document.dir==='rtl'?-1:1)*60});await p.waitForTimeout(300);const sx2=await p.evaluate(()=>[...document.querySelectorAll('.dx-tw,.table-wrap')].find(e=>e.scrollWidth>e.clientWidth+4).dataset.sx);ok(`${l} after scrolling a little: fades both edges`,sx2==='se',sx2);
  await p.locator('.dx-tw, .table-wrap').first().screenshot({path:`d-table-${l}.png`})}
 await p.context().close()}
// login
for(const [l,w] of [['en',1440],['ar',390]]){p=await pg(l,w,860,false);await p.goto(U);await p.waitForTimeout(1500);ok(`login (${l}) shows how to get access`,/(No account yet|ليس لديك حساب)/.test(await p.innerText('body')));await p.screenshot({path:`d-login-${l}-${w}.png`});
 if(w===1440){await p.focus('#email');await p.keyboard.press('Tab');}await p.context().close()}
p=await pg('en',1440);await p.goto(U+'#/home');await p.waitForTimeout(1500);await p.focus('#h2q');await p.waitForTimeout(200);await p.locator('.ho-search').screenshot({path:'d-search-focus.png'});ok('home search shows a visible focus ring',/0px 0px 0px 3px/.test(await p.evaluate(()=>getComputedStyle(document.querySelector('.ho-search')).boxShadow)));
ok('no JS errors',!errs.length,errs.join(' | '));console.log(F?F+' FAILED':'ALL PASS');await b.close();
