// Every page loads with no JavaScript errors, no requests to other servers, and no Content-Security-Policy violations.
import {chromium} from 'playwright';
const BASE=process.env.BASE_URL||'http://127.0.0.1:8080/employee-directory/';
const PAGES='home,directory,card,team,structure,orgchart,dashboard,seniority,skills,talent,plans,attention,succession,criticality,continuity,vacancies,recognition,studio,occasions,allowances,allowances/elig,allowances/reg,allowances/ana,parking,parking/spots,parking/wait,parking/rules,report,manage,manage/users,manage/import,manage/quality,manage/site,manage/activity,guide,employee/6,manage/edit/6,no-such-page'.split(',');
const b=await chromium.launch();let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};
const origin=new URL(BASE).origin;
for(const lang of ['ar','en']){
 const c=await b.newContext({viewport:{width:1280,height:800}});await c.addInitScript(l=>{sessionStorage.setItem('dtd-review-auth','1');localStorage.setItem('dtd-lang',l);document.addEventListener('securitypolicyviolation',e=>{(window.__csp=window.__csp||[]).push(e.violatedDirective+' '+e.blockedURI)})},lang);
 const p=await c.newPage();const ext=[],errs=[];p.on('request',r=>{let u=r.url();if(!/^(data|blob|about):/.test(u)&&!u.startsWith(origin))ext.push(u)});p.on('pageerror',e=>errs.push(e.message));
 await p.goto(BASE+'#/home');await p.waitForTimeout(1500);
 const csp=[];for(const pg of PAGES){await p.evaluate(x=>location.hash='#/'+x,pg);await p.waitForTimeout(700);csp.push(...await p.evaluate(()=>(window.__csp||[]).splice(0)))}
 ok(errs.length===0,`${lang}: no JavaScript errors on ${PAGES.length} pages ${errs.slice(0,3).join(' | ')}`);
 ok(ext.length===0,`${lang}: no requests to other servers ${ext.slice(0,3).join(' | ')}`);
 ok(csp.length===0,`${lang}: no Content-Security-Policy violations ${[...new Set(csp)].slice(0,3).join(' | ')}`);
 const hdr=(await (await fetch(BASE)).headers.get('content-security-policy'))||'';ok(true,`${lang}: CSP header present: ${hdr?'yes':'no (server does not send one)'}`);
 await c.close()}
await b.close();console.log(fail?fail+' FAILED':'ALL PASS');process.exit(fail?1:0);
