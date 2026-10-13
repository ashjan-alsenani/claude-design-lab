import type { InviteDesign } from "../model/invites";
import { fontFamily, loadFont } from "../model/inviteFonts";
import { ART_H, ART_W, compose, type ArtSpec } from "./InviteArt";

/*
 * Draws an invitation on a story-size canvas (1080×1920): first the design's art (an SVG drawn as an
 * image), then the words, shaped by the browser (correct Arabic joining) in the design's fonts or the
 * ones she picked. The same code draws the small gallery previews and the full-size image she
 * downloads or prints. Everything happens on her device.
 */
export const INV_W = ART_W;
export const INV_H = ART_H;
export type InviteWords = { opener?: string; title?: string; name?: string; line?: string; date?: string; time?: string; place?: string; host?: string; note?: string };
export type InviteFonts = { name?: string; body?: string };

/** The art half of a design. */
export const artSpec = (d: InviteDesign): ArtSpec => ({ material: d.material, palette: d.palette, layout: d.layout, hero: d.hero, comps: d.comps, band: d.band, mirror: d.mirror, seed: d.n + 1 });

const art = new Map<string, Promise<HTMLImageElement | null>>();
function artImage(d: InviteDesign, w: number, h: number) {
  const key = `${d.id}|${d.palette.id}|${w}`;
  let p = art.get(key);
  if (!p) {
    const svg = compose(artSpec(d)).svg(w, h);
    p = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
    art.set(key, p);
    // Keep memory bounded: forget the oldest previews.
    if (art.size > 90) art.delete(art.keys().next().value!);
  }
  return p;
}

function wrap(c: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const w of words) { const t = line ? `${line} ${w}` : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
    if (line) out.push(line);
  }
  return out;
}

const turn = new WeakMap<HTMLCanvasElement, number>();

/** Draw the whole invitation. `scale` draws the small gallery previews with the same code. Resolves when done. */
export async function drawInvite(canvas: HTMLCanvasElement, d: InviteDesign, words: InviteWords, o: { lang: "ar" | "en"; fonts?: InviteFonts; scale?: number }) {
  const mine = (turn.get(canvas) ?? 0) + 1;
  turn.set(canvas, mine);
  const s = o.scale ?? 1;
  const nameFont = o.fonts?.name ?? d.font;
  const titleFont = o.fonts?.name ?? d.titleFont;
  const bodyFont = o.fonts?.body ?? d.body;
  const [img] = await Promise.all([artImage(d, Math.round(INV_W * s), Math.round(INV_H * s)), loadFont(nameFont), loadFont(titleFont), loadFont(bodyFont)]);
  if (turn.get(canvas) !== mine) return; // a newer drawing started
  const c = canvas.getContext("2d");
  if (!c) return;
  const { box } = compose(artSpec(d));
  const p = d.palette;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, canvas.width, canvas.height);
  if (img) c.drawImage(img, 0, 0, canvas.width, canvas.height);
  else { c.fillStyle = p.bg; c.fillRect(0, 0, canvas.width, canvas.height); }
  c.setTransform(s, 0, 0, s, 0, 0);
  c.direction = o.lang === "ar" ? "rtl" : "ltr";
  c.textAlign = "center";
  c.textBaseline = "alphabetic";

  type Row = { text: string; size: number; font: string; color: string; gap: number; name?: boolean; fit?: number };
  const rows: Row[] = [];
  if (words.opener) rows.push({ text: words.opener, size: 44, font: bodyFont, color: p.soft, gap: 34 });
  if (words.title) rows.push({ text: words.title, size: 96, font: titleFont, color: p.ink, gap: 26 });
  if (words.name) rows.push({ text: words.name, size: 230, font: nameFont, color: p.name, gap: 34, name: true });
  if (words.line) rows.push({ text: words.line, size: 44, font: bodyFont, color: p.soft, gap: 46 });
  const when = [words.date, words.time].filter(Boolean).join(" · ");
  if (when) rows.push({ text: when, size: 42, font: bodyFont, color: p.ink, gap: 14 });
  if (words.place) rows.push({ text: words.place, size: 38, font: bodyFont, color: p.soft, gap: 18 });
  if (words.host) rows.push({ text: words.host, size: 46, font: titleFont, color: p.ink, gap: 14 });
  if (words.note) rows.push({ text: words.note, size: 30, font: bodyFont, color: p.soft, gap: 10 });

  const W = box.right - box.left, Hh = box.bottom - box.top;
  const fontOf = (r: Row, k: number) => `${r.font.endsWith("-400") ? 400 : 700} ${Math.round(r.size * k * (r.fit ?? 1))}px ${fontFamily(r.font)}`;
  type Laid = { r: Row; lines: string[]; m: { a: number; d: number }[] };
  let k = 1, laid: Laid[] = [];
  // Each line takes its real inked height in its font (tall scripts like Nastaliq need more room).
  const lead = (r: Row) => r.size * k * (r.fit ?? 1) * (r.name ? 0.08 : 0.28);
  const height = (l: Laid[]) => l.reduce((t, { r, m }) => t + m.reduce((u, x) => u + x.a + x.d + lead(r), 0) + r.gap * k, 0);
  const metrics = (lines: string[], r: Row) => lines.map((t) => { const mm = c.measureText(t); const sz = r.size * k * (r.fit ?? 1); return { a: Math.max(mm.actualBoundingBoxAscent || 0, sz * 0.55), d: Math.max(mm.actualBoundingBoxDescent || 0, sz * 0.12) }; });
  for (let attempt = 0; attempt < 14; attempt++) {
    laid = rows.map((row) => {
      const r: Row = { ...row };
      c.font = fontOf(r, k);
      if (r.name) {
        // The name stays on one line: shrink it to the width instead of wrapping.
        const w = c.measureText(r.text).width;
        if (w > W) r.fit = W / w;
        c.font = fontOf(r, k);
        return { r, lines: [r.text], m: metrics([r.text], r) };
      }
      const lines = wrap(c, r.text, W);
      return { r, lines, m: metrics(lines, r) };
    });
    if (height(laid) <= Hh) break;
    k *= 0.93;
  }
  let y = box.top + Math.max(0, (Hh - height(laid)) / 2);
  const cx = (box.left + box.right) / 2;
  for (const { r, lines, m } of laid) {
    c.font = fontOf(r, k);
    c.fillStyle = r.color;
    if (r.name) {
      c.save();
      if (d.material === "watercolor" || d.material === "felt") { c.shadowColor = p.light; c.shadowOffsetX = 5 * k; c.shadowOffsetY = 6 * k; }
      else if (d.material === "paper") { c.shadowColor = "rgba(40,60,90,.18)"; c.shadowBlur = 12; c.shadowOffsetY = 6; }
      else if (d.material === "gold") { c.shadowColor = "rgba(246,217,140,.45)"; c.shadowBlur = 22; }
    }
    for (let i = 0; i < lines.length; i++) {
      y += m[i].a;
      c.fillText(lines[i], cx, y);
      y += m[i].d + lead(r);
    }
    if (r.name) c.restore();
    y += r.gap * k;
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
