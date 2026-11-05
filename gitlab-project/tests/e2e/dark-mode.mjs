import {chromium} from 'playwright';import fs from 'fs';import {createRequire} from 'module';const AXE_PATH=createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const BASE=process.env.BASE_URL||'http://127.0.0.1:8098/employee-directory/';
const AXE=fs.readFileSync(AXE_PATH,'utf8');
const b=await chromium.launch();let fail=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fail++};
for(const th of ['dark','light']){const c=await b.newContext({bypassCSP:true,viewport:{width:1440,height:900}});await c.addInitScript(t=>{sessionStorage.setItem('dtd-review-auth','1');localStorage.setItem('dtd-theme',t)},th);const p=await c.newPage();
 const bgL=async sel=>p.evaluate(sel=>{const e=document.querySelector(sel);if(!e)return null;let m=getComputedStyle(e).backgroundColor.match(/[\d.]+/g).map(Number);let L=m.slice(0,3).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return {L:.2126*L[0]+.7152*L[1]+.0722*L[2],a:m[3]??1}},sel);
 await p.goto(BASE+'#/dashboard');await p.waitForTimeout(1500);
 let r=await bgL('#dkEdit');ok(th==='dark'?r.L<.5:true,`${th} dashboard customize button not white (L=${r.L.toFixed(2)})`);
 await p.goto(BASE+'#/manage/site');await p.waitForTimeout(1300);
 r=await bgL('.lg-box');ok(th==='dark'?r.L<.1:r.L>.9,`${th} empty logo box surface (L=${r.L.toFixed(2)})`);
 await p.goto(BASE+'#/manage/edit/6');await p.waitForTimeout(1300);
 r=await bgL('.preview-card');ok(r&&(th==='dark'?true:true),`${th} preview card present`);
 // inject conditional components into the live page and check axe contrast + surface
 await p.evaluate(()=>{const v=document.querySelector('#view');const d=document.createElement('div');d.id='probe';d.innerHTML=`<table><tbody><tr class="row-unmapped"><td>عمود غير مربوط</td></tr></tbody></table><div class="samples"><span>عينة قيمة</span></div><ul class="diffs"><li><span>الاسم</span><span class="dv dv-from">قديم</span><span class="dv dv-to">جديد</span></li></ul><div class="list-rows"><div class="list-row"><label>شهادة</label></div></div><div class="cropper" style="height:40px"></div><div class="oc-banner"><span class="oc-banner-e">x</span><div><strong>عيد ميلاد اليوم</strong><p>نتمنى له يومًا سعيدًا</p></div></div><div class="page-head"><p class="org-infnote"><span>ملاحظة التوزيع على الوحدات</span><button type="button" class="btn btn-sm org-infbtn">مراجعة واعتماد التوزيع</button></p></div>`;v.prepend(d)});
 for(const s of ['.row-unmapped td','.samples span','.dv-from','.list-row','.cropper','.oc-banner','.org-infnote','.org-infbtn']){let q=await bgL('#probe '+s);ok(th==='dark'?(q.L<.12||q.a<.4):true,`${th} ${s} surface L=${q.L.toFixed(2)} a=${q.a}`)}
 await p.addScriptTag({content:AXE});let ax=await p.evaluate(async()=>{let r=await axe.run('#probe',{runOnly:['wcag2aa']});return r.violations.flatMap(v=>v.nodes.map(n=>v.id+' '+n.target.join(' ')+' '+(n.any[0]?.data?.contrastRatio||'')))});
 ok(ax.length===0,`${th} axe on probed components: ${ax.join(' | ')||'clean'}`);
 await p.screenshot({path:`v106-${th}.png`});await c.close()}
await b.close();console.log(fail?fail+' FAILED':'ALL PASS');
