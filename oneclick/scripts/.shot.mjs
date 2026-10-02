import { chromium } from "@playwright/test";
const [,, url, out, w, h, scheme] = process.argv;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: +w || 1280, height: +h || 800 }, colorScheme: scheme || "light", reducedMotion: process.env.RM ? "reduce" : "no-preference" });
const errs = []; await p.addInitScript(() => localStorage.setItem("oc-consent","essential"));
p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
p.on("pageerror", e => errs.push(e.message));
await p.goto(url, { waitUntil: "networkidle" }); await p.waitForTimeout(+process.env.WAIT || 2600);
if (process.env.FULL) { await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0,0); }); await p.waitForTimeout(800); }
await p.screenshot({ path: out, fullPage: !!process.env.FULL });
if (errs.length) console.log("CONSOLE ERRORS:\n" + errs.join("\n"));
await b.close();
