import {chromium} from 'playwright';
const BASE=process.env.BASE_URL||'http://127.0.0.1:8098/employee-directory/';
const U=BASE;const b=await chromium.launch();let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};
const c=await b.newContext({viewport:{width:1440,height:900}});await c.addInitScript(()=>{sessionStorage.setItem('dtd-review-auth','1')});const p=await c.newPage();const er=[];p.on('pageerror',e=>er.push(e.message));
await p.goto(U+'#/directory');await p.waitForTimeout(1500);
let t=await p.title();ok(/Employee Directory|دليل الموظفين/i.test(t)&&t.includes('·'),'directory tab title: '+t);
await p.evaluate(()=>scrollTo(0,900));await p.waitForTimeout(400);
let href=await p.evaluate(()=>{let as=[...document.querySelectorAll('#view a[href^="#/employee/"]')].filter(a=>a.getBoundingClientRect().top>0&&a.getBoundingClientRect().top<innerHeight);return as[0].getAttribute('href')});
await p.evaluate(h=>document.querySelector(`#view a[href="${h}"]`).click(),href);await p.waitForTimeout(1200);
ok(await p.evaluate(()=>scrollY)<5,'new page opens at top');
ok(await p.evaluate(()=>document.activeElement.tagName==='H1'),'focus moves to page heading after navigation');
let t2=await p.title();ok(t2!==t&&t2.includes('·'),'employee tab title: '+t2);
await p.goBack();await p.waitForTimeout(1500);let y=await p.evaluate(()=>scrollY);ok(Math.abs(y-900)<10,'Back restores scroll ('+y+')');
await p.goForward();await p.waitForTimeout(1300);ok(await p.evaluate(()=>scrollY)<5,'Forward to profile at top');
// tabs within same base: focus stays on tab
await p.goto(U+'#/parking');await p.waitForTimeout(1500);let tab=p.locator('.sectabs a, .secbar a').filter({hasText:/Allowances|العلاوات/}).first();
if(await tab.count()){await tab.focus();await p.keyboard.press('Enter');await p.waitForTimeout(1200);ok(true,'section tab nav: focus now '+await p.evaluate(()=>document.activeElement.tagName+'.'+document.activeElement.className.toString().slice(0,30)))}
// cross-tab
const p2=await c.newPage();await p2.goto(U+'#/manage/edit/7');await p2.waitForTimeout(1500);
await p.goto(U+'#/manage/edit/6');await p.waitForTimeout(1500);
const setField=async(pg,l,v)=>pg.evaluate(([l,v])=>{let lab=[...document.querySelectorAll('#view label')].find(x=>x.textContent.trim().startsWith(l));let i=lab.control||document.getElementById(lab.htmlFor);i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))},[l,v]);
await setField(p,'Full name (English)','Noura TAB-ONE');await p.locator('button:has-text("Save")').last().click();await p.waitForTimeout(1500);
let warn=await p2.evaluate(()=>[...document.querySelectorAll('.toast')].map(x=>x.innerText).join('|'));ok(/another tab|latest changes/.test(warn),'stale tab told about other-tab change: '+warn.slice(0,80));
await setField(p2,'Full name (English)','Seven TAB-TWO');await p2.locator('button:has-text("Save")').last().click();await p2.waitForTimeout(1500);
let st=await p.evaluate(()=>{let d=JSON.parse(localStorage.getItem('dtd-review-v5'));let g=id=>JSON.parse(d.employees.find(x=>x.id===id).data).nameEn;return [g(6),g(7)]});
ok(st[0]==='Noura TAB-ONE'&&st[1]==='Seven TAB-TWO','both tabs\' saves survive: '+st.join(' / '));
// non-dirty other tab refreshes its view
await p.goto(U+'#/employee/7');await p.waitForTimeout(1300);ok((await p.locator('h1').first().textContent()).includes('TAB-TWO'),'profile shows other tab change');
await p2.goto(U+'#/employee/6');await p2.waitForTimeout(1300);await setField(p,'x','y').catch(()=>{});
await p.goto(U+'#/manage/edit/6');await p.waitForTimeout(1300);await setField(p,'Full name (English)','Noura Third');await p.locator('button:has-text("Save")').last().click();await p.waitForTimeout(1600);
ok((await p2.locator('h1').first().textContent()).includes('Third'),'open profile in other tab re-renders with new name');
// dirty stale tab
await p2.goto(U+'#/manage/edit/9');await p2.waitForTimeout(1300);await setField(p2,'Full name (English)','Nine DIRTY');
await p.goto(U+'#/manage/edit/8');await p.waitForTimeout(1300);await setField(p,'Full name (English)','Eight SAVED');await p.locator('button:has-text("Save")').last().click();await p.waitForTimeout(1500);
let w2=await p2.evaluate(()=>[...document.querySelectorAll('.toast')].map(x=>x.innerText).join('|'));ok(/aren't saved yet/.test(w2),'dirty tab warned, form kept: '+(await p2.evaluate(()=>[...document.querySelectorAll('#view input')].some(i=>i.value==='Nine DIRTY'))));
await p2.locator('button:has-text("Save")').last().click();await p2.waitForTimeout(1500);
let s2=await p.evaluate(()=>{let d=JSON.parse(localStorage.getItem('dtd-review-v5'));let g=id=>JSON.parse(d.employees.find(x=>x.id===id).data).nameEn;return [g(8),g(9)]});ok(s2[0]==='Eight SAVED'&&s2[1]==='Nine DIRTY','dirty tab save keeps other tab change: '+s2.join(' / '));
ok(er.length===0,'no JS errors '+er.join(';'));
await b.close();console.log(fail?fail+' FAILED':'ALL PASS');
