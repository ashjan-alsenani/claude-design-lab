// Records the "how to use the site" tutorial video by driving the real site in Chromium.
// Captions and a visible cursor are overlaid in the page; frames come from the CDP
// screencast and are encoded to H.264 MP4 with ffmpeg.
//
// Usage:  npx vite --port 4173 &   then   node scripts/record-tutorial.mjs [url] [out.mp4]
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4173/';
const OUT = resolve(process.argv[3] ?? 'public/media/how-to-use.mp4');
const W = 1280;
const H = 720;
const LOCAL = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const STATEMENT_SOURCE = {
  'كلام الله تعالى المتعبَّد بتلاوته': 'القرآن الكريم',
  'ما ثبت عن النبي ﷺ من قول أو فعل أو تقرير': 'السنة النبوية',
  'يبدأ بسورة الفاتحة ويُختم بسورة الناس': 'القرآن الكريم',
  'بيّنت كيفية الصلاة والزكاة والصيام والحج': 'السنة النبوية',
  'نزل على النبي ﷺ بواسطة جبريل عليه السلام': 'القرآن الكريم',
  'تشمل الصفات الخَلقية والخُلُقية للنبي ﷺ': 'السنة النبوية',
};

/* ───────── in-page overlay: captions, title cards, cursor ───────── */
const overlay = () => {
  const css = `
  #tut-cap{position:fixed;left:50%;bottom:26px;translate:-50% 0;z-index:2147483000;max-width:min(1060px,92vw);
    display:flex;align-items:center;gap:16px;padding:16px 26px;border-radius:22px;direction:rtl;
    font:600 26px/1.6 'Readex Pro',system-ui,sans-serif;color:#fff;background:rgba(20,12,52,.9);
    box-shadow:0 0 0 2px rgba(255,214,110,.75),0 24px 60px -20px rgba(0,0,0,.8);transition:opacity .35s,transform .35s;pointer-events:none;}
  #tut-cap[data-hidden]{opacity:0;transform:translateY(16px)}
  #tut-cap b{flex:none;display:grid;place-items:center;min-width:46px;height:46px;border-radius:50%;
    font:700 22px 'El Messiri',sans-serif;color:#5c3a06;background:linear-gradient(180deg,#ffe6a3,#f5c048)}
  #tut-title{position:fixed;inset:0;z-index:2147483001;display:grid;place-items:center;align-content:center;gap:18px;
    text-align:center;direction:rtl;background:radial-gradient(circle at 50% 40%,#4e3196,#1c1248 70%);transition:opacity .6s}
  #tut-title[data-hidden]{opacity:0;pointer-events:none}
  #tut-title h1{margin:0;font:700 64px/1.3 'El Messiri',sans-serif;color:#fff4d1;text-shadow:0 0 40px rgba(255,214,110,.5)}
  #tut-title p{margin:0;font:500 30px 'Readex Pro',sans-serif;color:#dccdff}
  #tut-cursor{position:fixed;z-index:2147483002;left:0;top:0;width:30px;height:30px;margin:-4px 0 0 -4px;pointer-events:none;
    transition:transform .08s linear}
  #tut-cursor svg{filter:drop-shadow(0 3px 4px rgba(0,0,0,.5))}
  .tut-ripple{position:fixed;z-index:2147483001;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;
    border:4px solid #ffd66e;pointer-events:none;animation:tut-r .6s ease-out forwards}
  @keyframes tut-r{to{transform:scale(3.4);opacity:0}}`;
  const boot = () => {
    if (document.getElementById('tut-cap')) return;
    const st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    const cap = document.createElement('div');
    cap.id = 'tut-cap';
    cap.dataset.hidden = '';
    cap.innerHTML = '<b></b><span></span>';
    document.body.appendChild(cap);
    const title = document.createElement('div');
    title.id = 'tut-title';
    title.dataset.hidden = '';
    document.body.appendChild(title);
    const cur = document.createElement('div');
    cur.id = 'tut-cursor';
    cur.innerHTML =
      '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2l15 9-7 1.5L9 20z" fill="#fff" stroke="#20144a" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.body.appendChild(cur);
    addEventListener('mousemove', (e) => (cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`), true);
    addEventListener(
      'mousedown',
      (e) => {
        const r = document.createElement('div');
        r.className = 'tut-ripple';
        r.style.left = e.clientX + 'px';
        r.style.top = e.clientY + 'px';
        document.body.appendChild(r);
        setTimeout(() => r.remove(), 700);
      },
      true,
    );
    window.__cap = (n, t) => {
      if (!t) return (cap.dataset.hidden = '');
      cap.querySelector('b').textContent = n;
      cap.querySelector('span').textContent = t;
      delete cap.dataset.hidden;
    };
    window.__title = (h, p) => {
      if (!h) return (title.dataset.hidden = '');
      title.innerHTML = `<h1>${h}</h1>${p ? `<p>${p}</p>` : ''}`;
      delete title.dataset.hidden;
    };
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();
};

const browser = await chromium.launch(existsSync(LOCAL) ? { executablePath: LOCAL } : {});
const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await context.addInitScript(overlay);
await context.addInitScript(() => {
  if (!sessionStorage.getItem('tut-cleared')) {
    localStorage.clear();
    sessionStorage.setItem('tut-cleared', '1');
  }
});
const page = await context.newPage();
page.on('pageerror', (e) => console.error('page error:', e.message));

/* ───────── screencast capture ───────── */
const frameDir = join(tmpdir(), `tut-frames-${Date.now()}`);
mkdirSync(frameDir, { recursive: true });
const frames = [];
const cdp = await context.newCDPSession(page);
cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
  const file = join(frameDir, `f${String(frames.length).padStart(6, '0')}.jpg`);
  writeFileSync(file, Buffer.from(data, 'base64'));
  frames.push({ file, t: metadata.timestamp });
  await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
});

const wait = (ms) => page.waitForTimeout(ms);
const cap = async (n, text, hold = 2600) => {
  await page.evaluate(([a, b]) => window.__cap(a, b), [String(n), text]);
  await wait(hold);
};
const hideCap = () => page.evaluate(() => window.__cap());
const title = async (h, p, hold = 3200) => {
  await page.evaluate(([a, b]) => window.__title(a, b), [h, p]);
  await wait(hold);
  await page.evaluate(() => window.__title());
  await wait(700);
};
let mouse = { x: W / 2, y: H / 2 };
async function moveTo(x, y, steps = 22) {
  await page.mouse.move(x, y, { steps });
  mouse = { x, y };
}
async function point(locator) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  let b = await locator.boundingBox();
  // keep the target clear of the caption box at the bottom of the frame
  if (b && b.y + b.height > H - 150 && b.height < H - 300) {
    await page.evaluate((dy) => window.scrollBy({ top: dy, behavior: 'smooth' }), b.y + b.height - (H - 170));
    await wait(600);
    b = await locator.boundingBox();
  }
  if (!b) throw new Error('not visible: ' + locator);
  await moveTo(b.x + b.width / 2, b.y + b.height / 2);
  return b;
}
async function click(locator, pause = 500) {
  const b = await point(locator);
  await wait(250);
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await wait(pause);
}
async function drag(from, to) {
  const a = await point(from);
  const b = await to.boundingBox();
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8, { steps: 4 });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 30 });
  await page.mouse.up();
  await wait(1200);
}
const smoothScroll = (top) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), top);
const go = (hash) => page.evaluate((h) => (location.hash = h), hash);

/* ───────── the walkthrough ───────── */
await page.goto(BASE);
await page.evaluate(() => document.fonts.ready);
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 82, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
await moveTo(W * 0.7, H * 0.6, 1);

await title('دليل استخدام «رحلة إلى كنوز المعرفة»', 'إعداد الطالبة: جنى الخاطري', 3800);
await wait(1800);
await cap(1, 'افتحي الموقع على السبورة، واضغطي F11 لملء الشاشة.', 3400);
await point(page.getByRole('button', { name: /تشغيل الموسيقى/ }));
await cap(2, 'من هذين الزرين تشغّلين الموسيقى الهادئة والمؤثرات الصوتية أو تكتمينها.', 3400);
await cap(3, 'اضغطي «لنبدأ المغامرة» لتنفتح البوابة.', 1800);
await click(page.getByRole('button', { name: 'لنبدأ المغامرة' }), 3200);

await cap(4, 'اختاري «جماعي» لتصبح الرحلة فعالية للصف كله على السبورة.', 3000);
await click(page.getByRole('button', { name: /^جماعي/ }), 1200);
await cap(5, 'حدّدي الفرق المشاركة واكتبي اسم الصف، ثم اضغطي «ابدئي الفعالية».', 2200);
await click(page.locator('label.team-toggle', { hasText: 'فريق القمر' }), 700);
await click(page.locator('label.team-toggle', { hasText: 'فريق القمر' }), 700);
await click(page.getByPlaceholder(/اسم الصف/), 300);
await page.keyboard.type('الصف السابع ٢', { delay: 90 });
await wait(600);
await click(page.getByRole('button', { name: 'ابدئي الفعالية' }), 2600);

await cap(6, 'هذه خريطة الجزر الثماني. في الأعلى لوحة نقاط الفرق، والفريق صاحب الدور مضيء.', 4200);
await point(page.locator('.tb-team[data-active="true"]'));
await wait(1500);
await cap(7, 'الجزر تُفتح بالتسلسل. اضغطي «بوابة المعرفة» للبدء.', 2200);
await click(page.getByRole('button', { name: /1\. بوابة المعرفة/ }), 2000);

await cap(8, 'الفريق صاحب الدور يفتح البوابة ويكشف بطاقات المعلومات بالضغط عليها.', 2200);
await click(page.getByRole('button', { name: 'بوابة القرآن الكريم' }), 1500);
async function revealFacts(pause) {
  await page.locator('.fact').nth(4).waitFor();
  await wait(900);
  for (let round = 0; round < 3; round++)
    for (let i = 0; i < 5; i++) {
      const f = page.locator('.fact').nth(i);
      if ((await f.getAttribute('data-on')) !== 'true') await click(f, pause);
    }
}
await revealFacts(650);
await click(page.getByRole('button', { name: 'إلى سؤال البوابة' }), 900);
await cap(9, 'بعد الشرح سؤال قصير: إذا أجاب الفريق صحيحًا أخذ النقاط، ثم ينتقل الدور للفريق التالي.', 2600);
await click(page.locator('.gate-quiz .qopt', { hasText: 'سورة الناس' }), 3800);
await click(page.getByRole('button', { name: 'العودة إلى القاعة' }), 1200);
await click(page.getByRole('button', { name: 'بوابة السنة النبوية' }), 1200);
await revealFacts(350);
await click(page.getByRole('button', { name: 'إلى سؤال البوابة' }), 700);
await cap(10, 'الإجابة الخاطئة تُظهر شرحًا يوضّح السبب، ويمكن المحاولة مرة أخرى.', 1200);
await click(page.locator('.gate-quiz .qopt', { hasText: 'كُتبت قبل' }), 3200);
await click(page.locator('.gate-quiz .qopt', { hasText: 'لا ينطق عن الهوى' }), 2600);
await click(page.getByRole('button', { name: 'العودة إلى القاعة' }), 1000);
await cap(11, 'في التحدي الأخير تحدّد الفرق مصدر كل عبارة: القرآن الكريم أم السنة النبوية.', 1500);
await click(page.getByRole('button', { name: 'ابدئي التحدي النهائي' }), 1200);
for (let i = 0; i < 6; i++) {
  const text = (await page.locator('.final-text').textContent()).replace(/[«»]/g, '').trim();
  await click(page.locator('.final-choice', { hasText: STATEMENT_SOURCE[text] ?? 'القرآن الكريم' }), i < 2 ? 1500 : 600);
  await click(page.getByRole('button', { name: /العبارة التالية|استلمي الجوهرة/ }), 500);
}
await cap(12, 'عند إكمال الجزيرة يحصل الصف على جوهرة، وتُفتح الجزيرة التالية على الخريطة.', 3600);
await click(page.getByRole('button', { name: 'العودة إلى الخريطة' }), 3400);

await cap(13, 'لوحة المعلمة: تجدينها في الصفحة الأولى، ومنها تديرين بنك الأسئلة.', 1200);
await go('#/teacher');
await wait(2400);
await cap(14, 'يمكنكِ إضافة الأسئلة وتعديلها وحذفها، وتحديد الإجابة الصحيحة وكتابة تفسيرها.', 1400);
await smoothScroll(420);
await wait(2400);
await smoothScroll(0);
await click(page.getByRole('tab', { name: 'الإعدادات' }), 900);
await cap(15, 'ومن «الإعدادات» تضبطين المؤقتات، ويمكنكِ فتح جميع الجزر لتشغيل أي نشاط مباشرة.', 1600);
await click(page.locator('.switch-row input'), 2200);

await go('#/map');
await wait(1600);
await cap(16, 'صندوق الكنوز: اسحبي البطاقة إلى صندوق قسمها، أو اضغطي البطاقة ثم الصندوق.', 1200);
await click(page.getByRole('button', { name: /2\. صندوق الكنوز المفقودة/ }), 2000);
for (let k = 0; k < 2; k++) {
  const card = page.locator('.tcard').first();
  const text = (await card.textContent()) ?? '';
  const kind = /قالها|«المسلم/.test(text) ? 'qawliyya' : /صحابي/.test(text) ? 'taqririyya' : 'filiyya';
  await drag(card, page.locator(`[data-drop="${kind}"]`));
  await wait(1600);
}
await go('#/map');
await wait(1400);
await cap(17, 'عجلة التحديات: اضغطي «أديري العجلة»، ونوع التحدي يحدده مكان توقفها.', 1000);
await click(page.getByRole('button', { name: /3\. عجلة التحديات/ }), 1800);
await click(page.getByRole('button', { name: /أديري العجلة/ }), 6400);
await click(page.locator('.qcard .qopt').first(), 3000);

await go('#/map');
await wait(1200);
await cap(18, 'المحققة الذكية: الفرق تفحص الأدلة المضيئة ثم تحلّ القضية.', 800);
await click(page.getByRole('button', { name: /4\. المحققة الذكية/ }), 1600);
await click(page.locator('.clue').first(), 1500);
await click(page.locator('.case-options .qopt', { hasText: 'السنة الفعلية' }), 3400);

await go('#/map');
await wait(1200);
await cap(19, 'السينما التفاعلية: فيلم قصير يتوقف عند أسئلة يجيب عنها الفريق صاحب الدور.', 800);
await click(page.getByRole('button', { name: /6\. السينما التفاعلية/ }), 1600);
await click(page.getByRole('button', { name: 'ابدئي العرض' }), 9000);

await go('#/map');
await wait(1200);
await cap(20, 'تحدي البرق: أسئلة سريعة بمؤقت، والنقاط حسب الصواب والسرعة.', 800);
await click(page.getByRole('button', { name: /7\. تحدي البرق/ }), 1500);
await click(page.getByRole('button', { name: /تحدي الفرق/ }), 3000);
await click(page.locator('.qcard .qopt').first(), 3200);

await go('#/map');
await wait(1200);
await cap(21, 'قصر التتويج: ترتيب الفرق على المنصة، واللقب، وشهادة الفريق المتصدّر.', 800);
await click(page.getByRole('button', { name: /8\. قصر التتويج/ }), 1600);
await click(page.getByRole('button', { name: 'افتحي البوابة الذهبية' }), 4200);
const podium = await page.locator('.crown-podium').boundingBox();
if (podium) await smoothScroll(podium.y + (await page.evaluate(() => scrollY)) - 90);
await wait(3600);
const cert = await page.locator('.cert-section').boundingBox();
if (cert) await smoothScroll(cert.y + (await page.evaluate(() => scrollY)) - 40);
await cap(22, 'يمكن تنزيل الشهادة صورة أو طباعتها. ولبدء صف جديد: «رحلة جديدة» في الصفحة الأولى.', 4800);
await hideCap();
await title('استمتعن بالرحلة!', 'رحلة إلى كنوز المعرفة · إعداد الطالبة: جنى الخاطري', 3800);

await cdp.send('Page.stopScreencast');
await wait(300);
await browser.close();

/* ───────── encode ───────── */
const list = frames
  .map((f, i) => {
    const next = frames[i + 1]?.t ?? f.t + 1.5;
    const d = Math.max(0.01, Math.min(5, next - f.t));
    return `file '${f.file}'\nduration ${d.toFixed(4)}`;
  })
  .join('\n');
const listFile = join(frameDir, 'list.txt');
writeFileSync(listFile, `${list}\nfile '${frames[frames.length - 1].file}'\n`);
mkdirSync(resolve(OUT, '..'), { recursive: true });
execFileSync(
  'ffmpeg',
  ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile, '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-tune', 'animation', '-r', '24', '-movflags', '+faststart', OUT],
  { stdio: 'inherit' },
);
// WebM/VP9 twin for browsers without H.264 (e.g. open-source Chromium builds)
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', OUT, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '42', '-row-mt', '1', '-an', OUT.replace(/\.mp4$/, '.webm')], { stdio: 'inherit' });
rmSync(frameDir, { recursive: true, force: true });
console.log(`frames: ${frames.length} → ${OUT}`);
