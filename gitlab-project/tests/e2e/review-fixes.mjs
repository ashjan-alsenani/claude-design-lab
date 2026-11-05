import {chromium} from 'playwright';import fs from 'fs';import {createRequire} from 'module';const AXE_PATH=createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const BASE=process.env.BASE_URL||'http://127.0.0.1:8098/employee-directory/';
const AXE=fs.readFileSync(AXE_PATH,'utf8');
const b=await chromium.launch();let F=0;const ok=(n,v,x='')=>{v||F++;console.log(v?'PASS':'FAIL',n,v?'':x)};const U=BASE;
const ctx=async(lang,vp,auth=true)=>{const c=await b.newContext({bypassCSP:true,viewport:{width:vp[0],height:vp[1]}});await c.addInitScript(([l,a])=>{if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');a&&sessionStorage.setItem('dtd-review-auth','1');localStorage.setItem('dtd-lang',l)}},[lang,auth]);const p=await c.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));return p};
const axe=async(p)=>{await p.addScriptTag({content:AXE});return p.evaluate(async()=>(await axe.run(document.querySelector('#view')||document,{runOnly:['wcag2a','wcag2aa']})).violations.map(v=>v.id+'x'+v.nodes.length))};
let allErr=[];
// 1 hero button
for(const [l,vp] of [['en',[1440,900]],['ar',[390,844]]]){let p=await ctx(l,vp);await p.goto(U+'#/home');await p.waitForTimeout(2000);
 const r=await p.evaluate(()=>{let e=[...document.querySelectorAll('#view .ho-acts .btn-primary')][0],cs=getComputedStyle(e);return[cs.backgroundColor,cs.backgroundImage,cs.color]});ok(`1 home Add button is a standard, visible primary button (${l})`,r[2]==='rgb(255, 255, 255)'&&(r[1]!=='none'||r[0]!=='rgba(0, 0, 0, 0)'),r.join(' '));
 if(l==='ar'){await p.locator('#view .ho-head').screenshot({path:'fx-hero-ar-m.png'});
  // 2 badge
  const g=await p.evaluate(()=>{let bb=document.querySelector('.bell-badge').getBoundingClientRect(),bt=document.querySelector('.bell-btn').getBoundingClientRect(),ls=document.querySelector('.lang-seg').getBoundingClientRect();return{badge:[bb.left,bb.right],bell:[bt.left,bt.right],lang:[ls.left,ls.right]}});
  ok('2 badge inside bell, clear of language toggle',g.badge[0]>=g.bell[0]-0.5&&g.badge[1]<=g.bell[1]+0.5&&(g.lang[1]<=g.bell[0]-2||g.lang[0]>=g.bell[1]+2),JSON.stringify(g));await p.locator('.topbar').screenshot({path:'fx-topbar-ar.png'});
  // 11 placeholder
  const ph=await p.evaluate(()=>{let i=document.querySelector('#view .ho-search input');return[i.placeholder,i.dataset.phFull]});console.log('   home placeholder:',ph);ok('11 home placeholder fits (shortened with …)',ph[0]!==ph[1]&&/…$/.test(ph[0]));
  await p.evaluate(()=>location.hash='#/directory');await p.waitForTimeout(1000);const ph2=await p.evaluate(()=>{let i=document.querySelector('#view input[type=search]');let cv=document.createElement('canvas').getContext('2d'),cs=getComputedStyle(i);cv.font=cs.font;return[i.placeholder,Math.round(cv.measureText(i.placeholder).width),i.clientWidth]});console.log('   directory placeholder:',ph2);ok('11 directory placeholder fits',ph2[1]<=ph2[2]);
 }
 allErr.push(...p.errs);await p.context().close()}
let p=await ctx('en',[1440,900]);await p.goto(U+'#/home');await p.waitForTimeout(1500);await p.evaluate(()=>location.hash='#/directory');await p.waitForTimeout(800);
ok('11 desktop placeholder unchanged (full text)',await p.evaluate(()=>{let i=document.querySelector('#view input[type=search]');return !i.dataset.phFull||i.placeholder===i.dataset.phFull}));
// 4 404
await p.evaluate(()=>location.hash='#/nope/page');await p.waitForTimeout(800);ok('4 unknown address shows Page not found + Home link',/Page not found/.test(await p.innerText('#view'))&&await p.locator('#view a[href="#/home"]').count()===1);
await p.evaluate(()=>location.hash='#/');await p.waitForTimeout(800);const h1=await p.evaluate(()=>[location.hash,document.querySelector('#view h1')?.innerText]);console.log('   "#/" ->',h1);ok('4 "#/" still opens a real page (not 404)',!/Page not found/.test(await p.innerText('#view')));
for(const h of ['home','directory','parking','allowances','employee/3','manage/edit/3','benefits']){await p.evaluate(x=>location.hash='#/'+x,h);await p.waitForTimeout(700);if(/Page not found/.test(await p.innerText('#view')))ok('4 valid route not 404: '+h,false)}
// 5 studio
await p.evaluate(()=>location.hash='#/studio');await p.waitForTimeout(1200);let v=await axe(p);ok('5 studio: no axe violations',!v.length,v.join(','));
// 6 compare table (mobile)
allErr.push(...p.errs);await p.context().close();
p=await ctx('en',[390,844]);await p.goto(U+'#/allowances/elig');await p.waitForTimeout(1800);v=await axe(p);ok('6 eligibility tab (mobile): no axe violations',!v.length,v.join(','));
ok('6 comparison table focusable region',await p.evaluate(()=>{let e=document.querySelector('.ax-cmp');return e.tabIndex===0&&e.getAttribute('role')==='region'&&!!e.getAttribute('aria-label')}));
// 10 tabs visible
await p.evaluate(()=>location.hash='#/allowances');await p.waitForTimeout(1000);const tb=await p.evaluate(()=>[...document.querySelectorAll('.al-tabs [role=tab]')].map(t=>{let r=t.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}));ok('10 all 4 allowance tabs visible on phone',tb.length===4&&tb.every(Boolean),JSON.stringify(tb));await p.locator('.al-tabs').screenshot({path:'fx-tabs-en.png'});
await p.evaluate(()=>location.hash='#/parking');await p.waitForTimeout(1000);const tb2=await p.evaluate(()=>[...document.querySelectorAll('.al-tabs [role=tab]')].map(t=>{let r=t.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}));ok('10 all 4 parking tabs visible on phone',tb2.length===4&&tb2.every(Boolean));
ok('   no horizontal page scroll (parking, phone)',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
// 7 org chart
await p.evaluate(()=>location.hash='#/orgchart');await p.waitForTimeout(1500);const oc=await p.evaluate(()=>{let t=[...document.querySelectorAll('.oc-tog')].filter(e=>e.offsetParent).map(e=>{let r=e.getBoundingClientRect();return[Math.round(r.width),Math.round(r.height)]});let n=document.querySelector('.oc-name');return{zoom:document.querySelector('#ocPct').textContent,tog:t.slice(0,3),nameFont:getComputedStyle(n).fontSize,nameH:Math.round(n.getBoundingClientRect().height)}});console.log('   org chart:',JSON.stringify(oc));ok('7 org chart toggles ≥24×24 on phone, 100% zoom',oc.zoom==='100%'&&oc.tog.length&&oc.tog.every(([w,h])=>w>=24&&h>=24));
ok('   org chart page itself no horizontal scroll',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:'fx-orgchart-m.png'});
allErr.push(...p.errs);await p.context().close();
// 8 parking banner AR
p=await ctx('ar',[390,844]);await p.goto(U+'#/parking');await p.waitForTimeout(1800);const bn=await p.evaluate(()=>{let s=document.querySelector('.pk-banner.pk-ok');return[s.querySelectorAll('bdi').length,s.innerText]});console.log('   banner:',bn[1].replace(/\s+/g,' '));ok('8 parking banner isolates English names (5 <bdi>), no glued "و"',bn[0]===5&&!/و[A-Z]/.test(bn[1]));await p.locator('.pk-banner.pk-ok').screenshot({path:'fx-banner-ar.png'});
allErr.push(...p.errs);await p.context().close();
// 3 sign-in
p=await ctx('en',[1440,900],false);await p.goto(U);await p.waitForTimeout(1200);await p.click('.ln-submit');await p.waitForTimeout(300);
let s3=await p.evaluate(()=>[document.querySelector('.form-error').innerText,document.activeElement.id,document.querySelector('#email').getAttribute('aria-invalid'),document.querySelector('#password').getAttribute('aria-invalid'),document.querySelector('#email').getAttribute('aria-describedby')]);ok('3 empty submit: asks for both, focus on ID field',/Enter your employee ID or username, and your password/.test(s3[0])&&s3[1]==='email'&&s3[2]==='true'&&s3[3]==='true'&&s3[4]==='lnErr',JSON.stringify(s3));
await p.fill('#email','12345');await p.click('.ln-submit');await p.waitForTimeout(300);s3=await p.evaluate(()=>[document.querySelector('.form-error').innerText,document.activeElement.id,document.querySelector('#email').getAttribute('aria-invalid')]);ok('3 missing password only: asks for password, focus there',/Enter your password/.test(s3[0])&&s3[1]==='password'&&s3[2]==='false',JSON.stringify(s3));
await p.fill('#password','wrong');await p.click('.ln-submit');await p.waitForTimeout(1500);s3=await p.evaluate(()=>[document.querySelector('.form-error').innerText,document.activeElement.id,window.getSelection().toString()||document.activeElement.selectionEnd]);ok('3 wrong credentials: message + focus back on password',/incorrect/.test(s3[0])&&s3[1]==='password',JSON.stringify(s3));
await p.click('#langBtn');await p.waitForTimeout(800);await p.click('.ln-submit');await p.waitForTimeout(300);ok('3 Arabic message',/اكتب رقم الموظف/.test(await p.textContent('.form-error')));
allErr.push(...p.errs);await p.context().close();
ok('no JS errors anywhere',!allErr.length,allErr.join(' | '));console.log(F?F+' FAILED':'ALL PASS');await b.close();
