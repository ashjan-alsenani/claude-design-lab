// Renders raster brand assets (PNG) from the SVG/HTML sources with headless Chromium.
// Run after build-brand.mjs: node scripts/render-brand-png.mjs
// Outputs: app icons, Open Graph image, Instagram avatar + highlight covers.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(".");
const OUT = path.join(ROOT, "public/brand");
const exe = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});

const fontCss = `
@font-face{font-family:Geist;src:url(file://${ROOT}/src/fonts/Geist-Variable-latin.woff2) format("woff2");font-weight:100 900}
@font-face{font-family:PlexAr;src:url(file://${ROOT}/src/fonts/IBMPlexSansArabic-600.woff2) format("woff2");font-weight:600}
@font-face{font-family:PlexAr;src:url(file://${ROOT}/src/fonts/IBMPlexSansArabic-400.woff2) format("woff2");font-weight:400}
*{margin:0;box-sizing:border-box}`;

const MARK = (stroke, dot, sw = 6.6) =>
  `<svg viewBox="0 0 64 64" width="100%" height="100%"><path d="M20.5 32.5 L28.5 40.5 L47.56 16.44 A22 22 0 1 0 53.25 37.69" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="53.25" cy="26.31" r="4.3" fill="${dot}"/></svg>`;

async function render(html, file, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  // Load from a file:// URL so the local @font-face files are allowed to load.
  const tmp = path.join(ROOT, ".data", `render-${file}.html`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}</style></head><body>${html}</body></html>`);
  await page.goto(`file://${tmp}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, file), omitBackground: false });
  await page.close();
  fs.rmSync(tmp);
  console.log("wrote", file);
}

const icon = (size) =>
  `<div style="width:${size}px;height:${size}px;background:#F5F7F6;border-radius:${size * 0.22}px;display:grid;place-items:center"><div style="width:${size * 0.75}px;height:${size * 0.75}px">${MARK("#0C6B66", "#F0A030")}</div></div>`;
await render(icon(512), "oneclick-app-icon.png", 512, 512);
await render(icon(192), "oneclick-app-icon-192.png", 192, 192);
await render(`<div style="width:180px;height:180px;background:#F5F7F6;display:grid;place-items:center"><div style="width:140px;height:140px">${MARK("#0C6B66", "#F0A030")}</div></div>`, "apple-touch-icon.png", 180, 180);

await render(
  `<div style="width:1080px;height:1080px;background:#0C6B66;display:grid;place-items:center"><div style="width:720px;height:720px">${MARK("#FCFDFC", "#F0A030")}</div></div>`,
  "oneclick-instagram-avatar.png",
  1080,
  1080
);

// Open Graph default: mark, wordmark, bilingual slogan.
await render(
  `<div style="width:1200px;height:630px;background:#F5F7F6;position:relative;overflow:hidden;font-family:Geist">
    <div style="position:absolute;inset:-20%;background:radial-gradient(40% 50% at 15% 20%, rgba(12,107,102,.22), transparent 70%),radial-gradient(35% 45% at 90% 90%, rgba(240,160,48,.28), transparent 70%),radial-gradient(30% 40% at 85% 10%, rgba(196,80,122,.14), transparent 70%)"></div>
    <div style="position:absolute;right:-120px;top:-140px;width:620px;height:620px;opacity:.10">${MARK("#0C6B66", "#F0A030", 2.2)}</div>
    <div style="position:absolute;left:88px;top:96px;display:flex;align-items:center;gap:22px">
      <div style="width:96px;height:96px">${MARK("#0C6B66", "#F0A030")}</div>
      <span style="display:flex;flex-direction:column;line-height:1"><span style="font-size:64px;font-weight:600;letter-spacing:-0.02em;color:#121826">One Click</span><span style="margin-top:8px;font-size:22px;font-weight:600;letter-spacing:0.24em;color:#5B6573">DIGITAL HUB</span></span>
    </div>
    <p style="position:absolute;left:92px;top:300px;font-size:62px;font-weight:600;letter-spacing:-0.03em;color:#121826">Less effort. More life.</p>
    <p dir="rtl" style="position:absolute;left:92px;top:398px;font-family:PlexAr;font-size:46px;font-weight:600;color:#3A4352">جهد أقل. حياة أكثر.</p>
    <p style="position:absolute;left:92px;bottom:62px;font-size:24px;color:#5B6573">Smart planners & organizers for everyday life · Arabic + English</p>
  </div>`,
  "og-default.png",
  1200,
  630
);

// Instagram highlight covers (1080x1920, icon area centered for the circular crop).
const highlights = [
  { key: "products", en: "Products", color: "#0C6B66" },
  { key: "bride", en: "Bride", color: "#C4507A" },
  { key: "grocery", en: "Grocery", color: "#3A8A4C" },
  { key: "planner", en: "Planner", color: "#3C58CF" },
  { key: "tips", en: "Tips", color: "#A97C12" },
  { key: "custom", en: "Custom", color: "#121826" },
];
for (const h of highlights) {
  await render(
    `<div style="width:1080px;height:1920px;background:${h.color};display:grid;place-items:center">
      <div style="width:520px;height:520px;border-radius:50%;background:rgba(255,255,255,.12);display:grid;place-items:center">
        <div style="width:300px;height:300px">${MARK("#FCFDFC", "#F0A030")}</div>
      </div></div>`,
    `instagram-highlight-${h.key}.png`,
    1080,
    1920
  );
}

await browser.close();
