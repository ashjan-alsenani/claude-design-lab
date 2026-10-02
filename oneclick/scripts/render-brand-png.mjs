// Renders raster brand assets (PNG) with headless Chromium.
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
@font-face{font-family:Rubik;src:url(file://${ROOT}/src/fonts/Rubik-Variable-latin.woff2) format("woff2");font-weight:300 900}
@font-face{font-family:Rubik;src:url(file://${ROOT}/src/fonts/Rubik-Variable-arabic.woff2) format("woff2");font-weight:300 900;unicode-range:U+0600-06FF,U+FB50-FDFF,U+FE70-FEFF}
*{margin:0;box-sizing:border-box}html,body{background:transparent;font-family:Rubik}`;

const CLICKY = (face = "#12B5A6", features = "#fff", dimple = "#FFC23D") =>
  `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="8" y="8" width="84" height="84" rx="30" fill="${face}"/><path d="M22 26 Q24 16 36 15" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="36" cy="40" r="6" fill="${features}"/><circle cx="64" cy="40" r="6" fill="${features}"/><path d="M32 60 L44 70 L70 56" fill="none" stroke="${features}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="76" cy="60" r="5" fill="${dimple}"/></svg>`;

async function render(html, file, w, h) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  // Load from a file:// URL so the local @font-face files are allowed to load.
  const tmp = path.join(ROOT, ".data", `render-${file}.html`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${fontCss}</style></head><body>${html}</body></html>`);
  await page.goto(`file://${tmp}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, file), omitBackground: true });
  await page.close();
  fs.rmSync(tmp);
  console.log("wrote", file);
}

const icon = (size) =>
  `<div style="width:${size}px;height:${size}px;background:#FFF9F4;border-radius:${size * 0.22}px;display:grid;place-items:center"><div style="width:${size * 0.8}px;height:${size * 0.8}px">${CLICKY()}</div></div>`;
await render(icon(512), "oneclick-app-icon.png", 512, 512);
await render(icon(192), "oneclick-app-icon-192.png", 192, 192);
await render(`<div style="width:180px;height:180px;background:#FFF9F4;display:grid;place-items:center"><div style="width:150px;height:150px">${CLICKY()}</div></div>`, "apple-touch-icon.png", 180, 180);
await render(
  `<div style="width:1080px;height:1080px;background:#FFC23D;display:grid;place-items:center"><div style="width:700px;height:700px">${CLICKY("#12B5A6", "#fff", "#FF6B6B")}</div></div>`,
  "oneclick-instagram-avatar.png",
  1080,
  1080
);

// Open Graph default: Clicky, name, bilingual slogan, playful color.
await render(
  `<div style="width:1200px;height:630px;background:#FFF9F4;position:relative;overflow:hidden">
    <div style="position:absolute;right:-60px;top:-80px;width:420px;height:420px;border-radius:50%;background:#FFE6A6"></div>
    <div style="position:absolute;right:120px;bottom:-140px;width:360px;height:360px;border-radius:42%;background:#D9F4F0"></div>
    <div style="position:absolute;right:420px;top:60px;width:90px;height:90px;border-radius:30%;background:#E6E1FF;transform:rotate(14deg)"></div>
    <div style="position:absolute;right:110px;top:150px;width:330px;height:330px;transform:rotate(-6deg)">${CLICKY()}</div>
    <div style="position:absolute;left:80px;top:80px;display:flex;flex-direction:column;line-height:1">
      <span style="font-size:58px;font-weight:700;color:#1E1B3A;letter-spacing:-.01em">One Click</span>
      <span style="margin-top:10px;font-size:20px;font-weight:600;letter-spacing:.26em;color:#6C6790">DIGITAL HUB</span>
    </div>
    <p style="position:absolute;left:80px;top:250px;font-size:64px;line-height:1.1;font-weight:700;color:#1E1B3A;letter-spacing:-.02em">Less effort.<br>More <span style="background:linear-gradient(transparent 62%,#FFC23D 62%)">life.</span></p>
    <p dir="rtl" style="position:absolute;left:80px;top:470px;font-size:42px;font-weight:700;color:#46416C">جهد أقل. حياة أكثر.</p>
  </div>`,
  "og-default.png",
  1200,
  630
);

// Instagram highlight covers: Clicky in each collection color on a soft tint.
const highlights = [
  { key: "products", face: "#12B5A6", bg: "#D9F4F0" },
  { key: "bride", face: "#F0567A", bg: "#FFE0E8" },
  { key: "grocery", face: "#1F9E57", bg: "#DDF3E6" },
  { key: "planner", face: "#3D7BFF", bg: "#E0EAFF" },
  { key: "tips", face: "#E09E00", bg: "#FFF1CC" },
  { key: "custom", face: "#8B6CF6", bg: "#ECE6FF" },
];
for (const h of highlights) {
  await render(
    `<div style="width:1080px;height:1920px;background:${h.bg};display:grid;place-items:center"><div style="width:460px;height:460px">${CLICKY(h.face)}</div></div>`,
    `instagram-highlight-${h.key}.png`,
    1080,
    1920
  );
}

await browser.close();
