import { inviteFonts, type InviteDesign, type InviteFont } from "../model/invites";

/*
 * Draws an invitation on a 1080×1350 canvas: the layout's composition in its colourway, then the
 * words, shaped by the browser (correct Arabic joining) in the chosen display font. The same code
 * draws the small gallery previews (scaled) and the full-size image she downloads or prints.
 */
export const INV_W = 1080;
export const INV_H = 1350;
export type InviteWords = { opener?: string; title?: string; name?: string; line?: string; date?: string; time?: string; place?: string; host?: string; note?: string };

type Ctx = CanvasRenderingContext2D;
type P = InviteDesign["palette"];
const TAU = Math.PI * 2;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const circle = (c: Ctx, x: number, y: number, r: number, fill: string, alpha = 1) => { c.globalAlpha = alpha; c.fillStyle = fill; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.globalAlpha = 1; };
function star(c: Ctx, x: number, y: number, r: number, fill: string, points = 5) {
  c.fillStyle = fill; c.beginPath();
  for (let i = 0; i < points * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / points, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); }
  c.closePath(); c.fill();
}
function cloud(c: Ctx, x: number, y: number, s: number, fill: string, alpha = 1) {
  c.globalAlpha = alpha; c.fillStyle = fill; c.beginPath();
  c.arc(x, y, 40 * s, 0, TAU); c.arc(x + 50 * s, y - 26 * s, 52 * s, 0, TAU); c.arc(x + 108 * s, y, 42 * s, 0, TAU); c.rect(x, y - 4 * s, 108 * s, 44 * s);
  c.fill(); c.globalAlpha = 1;
}
function leaf(c: Ctx, x: number, y: number, len: number, ang: number, fill: string) {
  c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = fill; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.5, -len * 0.28, len, 0); c.quadraticCurveTo(len * 0.5, len * 0.28, 0, 0); c.fill(); c.restore();
}
function flower(c: Ctx, x: number, y: number, r: number, petal: string, mid: string, n = 6) {
  for (let i = 0; i < n; i++) { c.save(); c.translate(x, y); c.rotate((i * TAU) / n); c.fillStyle = petal; c.beginPath(); c.ellipse(0, -r * 0.62, r * 0.42, r * 0.62, 0, 0, TAU); c.fill(); c.restore(); }
  circle(c, x, y, r * 0.32, mid);
}
function balloon(c: Ctx, x: number, y: number, s: number, fill: string, string: string) {
  c.strokeStyle = string; c.lineWidth = 2; c.globalAlpha = 0.5; c.beginPath(); c.moveTo(x, y + 62 * s); c.bezierCurveTo(x - 14 * s, y + 110 * s, x + 14 * s, y + 150 * s, x, y + 200 * s); c.stroke(); c.globalAlpha = 1;
  c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, 46 * s, 58 * s, 0, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(x - 7 * s, y + 64 * s); c.lineTo(x + 7 * s, y + 64 * s); c.lineTo(x, y + 54 * s); c.fill();
  circle(c, x - 15 * s, y - 20 * s, 10 * s, "#ffffff", 0.45);
}
function crescent(c: Ctx, x: number, y: number, r: number, fill: string, bg: string) { circle(c, x, y, r, fill); circle(c, x + r * 0.42, y - r * 0.18, r * 0.86, bg); }
function heart(c: Ctx, x: number, y: number, s: number, fill: string) {
  c.fillStyle = fill; c.beginPath(); c.moveTo(x, y + 10 * s); c.bezierCurveTo(x - 26 * s, y - 8 * s, x - 12 * s, y - 30 * s, x, y - 14 * s); c.bezierCurveTo(x + 12 * s, y - 30 * s, x + 26 * s, y - 8 * s, x, y + 10 * s); c.fill();
}
function hex(c: Ctx, x: number, y: number, r: number, stroke: string, fill?: string) {
  c.beginPath(); for (let i = 0; i < 6; i++) c.lineTo(x + r * Math.cos((Math.PI / 3) * i), y + r * Math.sin((Math.PI / 3) * i)); c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  c.strokeStyle = stroke; c.lineWidth = 3; c.stroke();
}
function roundRect(c: Ctx, x: number, y: number, w: number, h: number, r: number) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function lantern(c: Ctx, x: number, y: number, s: number, body: string, glow: string, line: string) {
  c.strokeStyle = line; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y); c.stroke();
  c.fillStyle = body; c.beginPath(); c.moveTo(x - 12 * s, y); c.lineTo(x + 12 * s, y); c.lineTo(x + 26 * s, y + 24 * s); c.lineTo(x + 26 * s, y + 72 * s); c.lineTo(x + 12 * s, y + 96 * s); c.lineTo(x - 12 * s, y + 96 * s); c.lineTo(x - 26 * s, y + 72 * s); c.lineTo(x - 26 * s, y + 24 * s); c.closePath(); c.fill();
  c.fillStyle = glow; roundRect(c, x - 13 * s, y + 26 * s, 26 * s, 44 * s, 6 * s); c.fill();
  c.fillStyle = body; c.beginPath(); c.moveTo(x, y + 96 * s); c.lineTo(x + 6 * s, y + 112 * s); c.lineTo(x - 6 * s, y + 112 * s); c.fill();
}
function palm(c: Ctx, x: number, y: number, s: number, frond: string, trunk: string, date: string) {
  c.strokeStyle = trunk; c.lineWidth = 16 * s; c.lineCap = "round"; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 12 * s, y - 160 * s, x + 6 * s, y - 300 * s); c.stroke();
  const tx = x + 6 * s, ty = y - 300 * s;
  c.lineWidth = 12 * s; c.strokeStyle = frond;
  for (const a of [-2.7, -2.2, -1.6, -1.0, -0.45, 0.1]) { c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.cos(a - 0.4) * 90 * s, ty + Math.sin(a - 0.4) * 90 * s, tx + Math.cos(a) * 170 * s, ty + Math.sin(a) * 170 * s + 50 * s); c.stroke(); }
  for (let i = 0; i < 7; i++) circle(c, tx - 14 * s + (i % 4) * 10 * s, ty + 18 * s + Math.floor(i / 4) * 12 * s, 8 * s, date);
  c.lineCap = "butt";
}
function waves(c: Ctx, y: number, amp: number, color: string, width: number, alpha = 1) {
  c.globalAlpha = alpha; c.strokeStyle = color; c.lineWidth = width; c.beginPath();
  for (let x = -40; x <= INV_W + 40; x += 10) c.lineTo(x, y + Math.sin(x / 70) * amp);
  c.stroke(); c.globalAlpha = 1;
}
function butterfly(c: Ctx, x: number, y: number, s: number, fill: string, ang = 0) {
  c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = fill;
  for (const d of [-1, 1]) { c.beginPath(); c.ellipse(d * 22 * s, -12 * s, 22 * s, 28 * s, d * 0.4, 0, TAU); c.fill(); c.globalAlpha = 0.75; c.beginPath(); c.ellipse(d * 16 * s, 18 * s, 14 * s, 18 * s, -d * 0.3, 0, TAU); c.fill(); c.globalAlpha = 1; }
  c.fillStyle = "rgba(60,50,70,.6)"; roundRect(c, -3 * s, -26 * s, 6 * s, 52 * s, 3 * s); c.fill(); c.restore();
}
function hotair(c: Ctx, x: number, y: number, s: number, a: string, b: string, line: string) {
  c.fillStyle = a; c.beginPath(); c.moveTo(x, y - 90 * s); c.bezierCurveTo(x + 90 * s, y - 90 * s, x + 80 * s, y + 20 * s, x + 20 * s, y + 70 * s); c.lineTo(x - 20 * s, y + 70 * s); c.bezierCurveTo(x - 80 * s, y + 20 * s, x - 90 * s, y - 90 * s, x, y - 90 * s); c.fill();
  c.fillStyle = b; c.beginPath(); c.moveTo(x, y - 90 * s); c.bezierCurveTo(x + 30 * s, y - 80 * s, x + 26 * s, y + 20 * s, x + 8 * s, y + 70 * s); c.lineTo(x - 8 * s, y + 70 * s); c.bezierCurveTo(x - 26 * s, y + 20 * s, x - 30 * s, y - 80 * s, x, y - 90 * s); c.fill();
  c.strokeStyle = line; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 18 * s, y + 70 * s); c.lineTo(x - 14 * s, y + 100 * s); c.moveTo(x + 18 * s, y + 70 * s); c.lineTo(x + 14 * s, y + 100 * s); c.stroke();
  c.fillStyle = "#b8895a"; roundRect(c, x - 18 * s, y + 100 * s, 36 * s, 26 * s, 4 * s); c.fill();
}
function teddy(c: Ctx, x: number, y: number, s: number, fill: string, light: string, ink: string) {
  for (const d of [-1, 1]) circle(c, x + d * 62 * s, y - 64 * s, 30 * s, fill);
  for (const d of [-1, 1]) circle(c, x + d * 62 * s, y - 64 * s, 15 * s, light);
  circle(c, x, y, 88 * s, fill);
  c.fillStyle = light; c.beginPath(); c.ellipse(x, y + 28 * s, 40 * s, 30 * s, 0, 0, TAU); c.fill();
  for (const d of [-1, 1]) circle(c, x + d * 30 * s, y - 14 * s, 8 * s, ink);
  circle(c, x, y + 18 * s, 10 * s, ink);
}
function dallah(c: Ctx, x: number, y: number, s: number, fill: string, line: string) {
  c.fillStyle = fill; c.beginPath(); c.moveTo(x - 50 * s, y + 90 * s); c.bezierCurveTo(x - 70 * s, y + 10 * s, x - 30 * s, y - 20 * s, x - 22 * s, y - 50 * s); c.lineTo(x + 22 * s, y - 50 * s); c.bezierCurveTo(x + 30 * s, y - 20 * s, x + 70 * s, y + 10 * s, x + 50 * s, y + 90 * s); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x - 22 * s, y - 50 * s); c.quadraticCurveTo(x, y - 110 * s, x + 22 * s, y - 50 * s); c.fill();
  circle(c, x, y - 112 * s, 10 * s, fill);
  c.strokeStyle = fill; c.lineWidth = 12 * s; c.beginPath(); c.moveTo(x + 50 * s, y + 10 * s); c.quadraticCurveTo(x + 120 * s, y - 10 * s, x + 130 * s, y - 70 * s); c.stroke();
  c.strokeStyle = line; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 46 * s, y + 40 * s); c.lineTo(x + 46 * s, y + 40 * s); c.stroke();
}
function cup(c: Ctx, x: number, y: number, s: number, fill: string, line: string) {
  c.fillStyle = fill; c.beginPath(); c.moveTo(x - 26 * s, y); c.lineTo(x + 26 * s, y); c.lineTo(x + 18 * s, y + 34 * s); c.lineTo(x - 18 * s, y + 34 * s); c.closePath(); c.fill();
  c.strokeStyle = line; c.lineWidth = 2; c.stroke();
}
function arabesqueCorner(c: Ctx, x: number, y: number, size: number, rot: number, color: string) {
  c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = color; c.lineWidth = 4;
  for (let i = 1; i <= 3; i++) { c.beginPath(); c.arc(0, 0, size * i * 0.3, 0, Math.PI / 2); c.stroke(); }
  c.beginPath(); c.moveTo(0, 0); c.lineTo(size, 0); c.moveTo(0, 0); c.lineTo(0, size); c.stroke();
  c.fillStyle = color;
  for (let i = 0; i < 4; i++) { const a = (i + 0.5) * (Math.PI / 8); star(c, Math.cos(a) * size * 0.75, Math.sin(a) * size * 0.75, 10, color, 4); }
  c.restore();
}
function saduBand(c: Ctx, y: number, h: number, a: string, b: string, k: string) {
  c.fillStyle = k; c.fillRect(0, y, INV_W, h);
  const n = 18, w = INV_W / n;
  for (let i = 0; i < n; i++) {
    c.fillStyle = i % 2 ? a : b; c.beginPath(); c.moveTo(i * w, y + h); c.lineTo(i * w + w / 2, y + 6); c.lineTo(i * w + w, y + h); c.fill();
    c.fillStyle = k; c.beginPath(); c.moveTo(i * w + w * 0.3, y + h); c.lineTo(i * w + w / 2, y + h * 0.5); c.lineTo(i * w + w * 0.7, y + h); c.fill();
  }
}
function frameLine(c: Ctx, inset: number, color: string, width: number, r = 0, alpha = 1) { c.globalAlpha = alpha; c.strokeStyle = color; c.lineWidth = width; roundRect(c, inset, inset, INV_W - inset * 2, INV_H - inset * 2, r); c.stroke(); c.globalAlpha = 1; }

/** Each layout draws its decoration and returns where the words go. */
type Box = { x: number; y: number; w: number; h: number; ink?: string; nameScale?: number };
function decorate(c: Ctx, d: InviteDesign): Box {
  const p = d.palette;
  const R = rng(d.n * 97 + 13);
  const full: Box = { x: 150, y: 250, w: INV_W - 300, h: INV_H - 500 };
  switch (d.layout) {
    case "arch": {
      c.fillStyle = p.bg2; c.beginPath(); c.moveTo(170, INV_H - 120); c.lineTo(170, 520); c.arc(INV_W / 2, 520, INV_W / 2 - 170, Math.PI, 0); c.lineTo(INV_W - 170, INV_H - 120); c.closePath(); c.fill();
      c.strokeStyle = p.accent; c.lineWidth = 4; c.stroke();
      for (let i = 0; i < 26; i++) { const a = Math.PI + (i / 25) * Math.PI; const rx = INV_W / 2 + Math.cos(a) * (INV_W / 2 - 170), ry = 520 + Math.sin(a) * (INV_W / 2 - 170); leaf(c, rx, ry, 70, a + (i % 2 ? 0.9 : -0.9), i % 3 ? p.accent : p.soft); }
      return { x: 230, y: 420, w: INV_W - 460, h: 760 };
    }
    case "watercolor": {
      for (const [x, y, r, col] of [[120, 160, 360, p.soft], [960, 260, 300, p.bg2], [980, 1210, 380, p.soft], [90, 1190, 300, p.bg2], [540, 680, 200, p.bg2]] as const) {
        const g = c.createRadialGradient(x, y, 10, x, y, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, INV_W, INV_H);
      }
      for (let i = 0; i < 26; i++) circle(c, R() * INV_W, R() * INV_H, 3 + R() * 8, p.accent, 0.25);
      return full;
    }
    case "minimal": {
      frameLine(c, 70, p.accent, 2); frameLine(c, 86, p.accent, 1, 0, 0.6);
      star(c, INV_W / 2, 200, 16, p.accent, 4); star(c, INV_W / 2, INV_H - 200, 12, p.accent, 4);
      return full;
    }
    case "clouds": {
      for (let i = 0; i < 6; i++) cloud(c, -40 + i * 200, INV_H - 120 - (i % 2) * 40, 1.4, "#ffffff", 0.95);
      cloud(c, 60, 160, 1.1, p.bg2); cloud(c, 760, 120, 1.3, p.bg2);
      for (let i = 0; i < 12; i++) star(c, 80 + R() * 920, 80 + R() * 260, 8 + R() * 10, p.accent);
      return { ...full, y: 300, h: 760 };
    }
    case "balloons": {
      const cols = [p.accent, p.soft, p.bg2, p.accent];
      [[150, 230, 1.6], [270, 170, 1.3], [380, 260, 1.1], [760, 200, 1.5], [880, 280, 1.2], [960, 150, 1]].forEach(([x, y, s], i) => balloon(c, x, y, s, cols[i % 4], p.ink));
      return { ...full, y: 480, h: 720 };
    }
    case "teddy": {
      c.fillStyle = p.bg2; c.beginPath(); c.ellipse(INV_W / 2, INV_H + 120, 700, 360, 0, 0, TAU); c.fill();
      teddy(c, INV_W / 2, INV_H - 230, 1.3, p.accent, p.soft, p.ink);
      for (let i = 0; i < 6; i++) heart(c, 120 + i * 170, 150 + (i % 2) * 40, 1.1, i % 2 ? p.soft : p.accent);
      return { ...full, y: 260, h: 700 };
    }
    case "sadu": {
      saduBand(c, 0, 150, p.accent, p.soft, p.ink); saduBand(c, INV_H - 150, 150, p.soft, p.accent, p.ink);
      frameLine(c, 190, p.accent, 3);
      return { x: 230, y: 300, w: INV_W - 460, h: INV_H - 600 };
    }
    case "arabesque": {
      frameLine(c, 60, p.accent, 3); frameLine(c, 78, p.accent, 1.5);
      arabesqueCorner(c, 78, 78, 210, 0, p.accent); arabesqueCorner(c, INV_W - 78, 78, 210, Math.PI / 2, p.accent);
      arabesqueCorner(c, INV_W - 78, INV_H - 78, 210, Math.PI, p.accent); arabesqueCorner(c, 78, INV_H - 78, 210, -Math.PI / 2, p.accent);
      return full;
    }
    case "florals": {
      for (const [x, y, sx, sy] of [[90, 110, 1, 1], [INV_W - 90, 110, -1, 1], [90, INV_H - 110, 1, -1], [INV_W - 90, INV_H - 110, -1, -1]] as const) {
        for (let i = 0; i < 6; i++) leaf(c, x, y, 150, Math.atan2(sy, sx) + (i - 2.5) * 0.35, i % 2 ? p.accent : p.soft);
        flower(c, x + sx * 60, y + sy * 40, 56, p.soft, p.accent); flower(c, x + sx * 10, y + sy * 110, 40, p.bg2, p.accent); flower(c, x + sx * 130, y + sy * 10, 34, p.accent, p.bg);
      }
      return full;
    }
    case "pampas": {
      for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
        const bx = side < 0 ? 120 + i * 12 : INV_W - 120 - i * 12, by = INV_H - 120;
        const ang = -Math.PI / 2 + side * (0.15 + i * 0.07);
        c.strokeStyle = p.accent; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + Math.cos(ang) * 520, by + Math.sin(ang) * 520); c.stroke();
        for (let k = 0; k < 18; k++) leaf(c, bx + Math.cos(ang) * (300 + k * 12), by + Math.sin(ang) * (300 + k * 12), 40, ang + (k % 2 ? 0.6 : -0.6), i % 2 ? p.soft : p.bg2);
      }
      c.fillStyle = p.bg2; c.beginPath(); c.arc(INV_W / 2, INV_H - 40, 220, Math.PI, 0); c.fill();
      return { ...full, y: 200, h: 820 };
    }
    case "rainbow": {
      const cols = [p.accent, p.soft, p.bg2, p.accent];
      cols.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = 46; c.beginPath(); c.arc(INV_W / 2, 470, 330 - i * 50, Math.PI, 0); c.stroke(); });
      cloud(c, 120, 470, 1.1, "#ffffff"); cloud(c, 780, 470, 1.1, "#ffffff");
      return { ...full, y: 560, h: 640 };
    }
    case "polaroid": {
      c.save(); c.translate(INV_W / 2, 420); c.rotate(-0.05); c.fillStyle = "#ffffff"; c.shadowColor = "rgba(0,0,0,.18)"; c.shadowBlur = 30; c.fillRect(-250, -260, 500, 560); c.shadowBlur = 0;
      const g = c.createLinearGradient(-220, -230, 220, 200); g.addColorStop(0, p.soft); g.addColorStop(1, p.bg2); c.fillStyle = g; c.fillRect(-220, -230, 440, 430);
      cloud(c, -170, 60, 1, "#ffffff", 0.9); star(c, 120, -120, 30, "#ffffff"); crescent(c, -110, -110, 50, "#ffffff", p.soft);
      c.fillStyle = p.accent; c.globalAlpha = 0.5; c.fillRect(-60, -290, 120, 50); c.globalAlpha = 1; c.restore();
      return { ...full, y: 760, h: 460 };
    }
    case "ticket": {
      c.fillStyle = p.bg2; roundRect(c, 90, 180, INV_W - 180, INV_H - 360, 40); c.fill();
      c.fillStyle = p.bg; for (const y of [180, INV_H - 180]) for (let x = 140; x < INV_W - 100; x += 60) circle(c, x, y, 16, p.bg);
      c.setLineDash([14, 14]); c.strokeStyle = p.accent; c.lineWidth = 3; c.beginPath(); c.moveTo(130, 420); c.lineTo(INV_W - 130, 420); c.stroke(); c.setLineDash([]);
      hotair(c, INV_W - 200, 300, 0.7, p.accent, p.soft, p.ink); star(c, 200, 300, 26, p.accent);
      return { x: 160, y: 460, w: INV_W - 320, h: 680 };
    }
    case "envelope": {
      c.fillStyle = p.bg2; c.fillRect(80, 160, INV_W - 160, INV_H - 320);
      c.fillStyle = p.soft; c.beginPath(); c.moveTo(80, 160); c.lineTo(INV_W / 2, 560); c.lineTo(INV_W - 80, 160); c.closePath(); c.fill();
      circle(c, INV_W / 2, 560, 64, p.accent); heart(c, INV_W / 2, 572, 1.3, p.bg);
      c.fillStyle = "#ffffff"; roundRect(c, 150, 660, INV_W - 300, 560, 16); c.fill();
      return { x: 180, y: 690, w: INV_W - 360, h: 500, nameScale: 0.8 };
    }
    case "stamp": {
      c.fillStyle = "#ffffff"; c.fillRect(110, 110, INV_W - 220, INV_H - 220);
      c.fillStyle = p.bg; for (let x = 110; x <= INV_W - 110; x += 40) { circle(c, x, 110, 14, p.bg); circle(c, x, INV_H - 110, 14, p.bg); }
      for (let y = 110; y <= INV_H - 110; y += 40) { circle(c, 110, y, 14, p.bg); circle(c, INV_W - 110, y, 14, p.bg); }
      c.fillStyle = p.bg2; c.fillRect(170, 170, INV_W - 340, INV_H - 340);
      c.strokeStyle = p.accent; c.lineWidth = 4; c.beginPath(); c.arc(INV_W - 270, 290, 80, 0, TAU); c.stroke(); waves(c, 290, 8, p.accent, 3, 0.5);
      return { x: 210, y: 420, w: INV_W - 420, h: 740 };
    }
    case "palm": {
      palm(c, 170, INV_H - 60, 1.4, p.accent, "#a07a4f", "#8a5a2b"); palm(c, INV_W - 150, INV_H - 40, 1.1, p.soft, "#a07a4f", "#8a5a2b");
      c.fillStyle = p.bg2; c.fillRect(0, INV_H - 90, INV_W, 90);
      return { ...full, x: 220, w: INV_W - 440, y: 200, h: 760 };
    }
    case "waves": {
      for (let i = 0; i < 6; i++) waves(c, INV_H - 300 + i * 46, 18, i % 2 ? p.accent : p.soft, 14, 0.85);
      circle(c, 860, 220, 90, p.soft);
      return { ...full, y: 200, h: 760 };
    }
    case "pearls": {
      for (let row = 0; row < 3; row++) for (let i = 0; i <= 26; i++) { const x = (i / 26) * INV_W; circle(c, x, 80 + row * 46 + Math.sin(i / 2.2 + row) * 26, 13, "#ffffff"); c.strokeStyle = p.accent; c.lineWidth = 1.5; c.beginPath(); c.arc(x, 80 + row * 46 + Math.sin(i / 2.2 + row) * 26, 13, 0, TAU); c.stroke(); }
      c.fillStyle = p.accent; c.beginPath(); c.moveTo(INV_W / 2 - 90, INV_H - 120); c.quadraticCurveTo(INV_W / 2, INV_H - 260, INV_W / 2 + 90, INV_H - 120); c.closePath(); c.fill();
      circle(c, INV_W / 2, INV_H - 160, 30, "#ffffff");
      return { ...full, y: 300, h: 720 };
    }
    case "honey": {
      for (let i = 0; i < 16; i++) { const x = (i % 4) * 74 + (Math.floor(i / 4) % 2) * 37 + 40, y = Math.floor(i / 4) * 64 + 60; hex(c, x, y, 40, p.accent, i % 3 ? p.bg2 : p.soft); hex(c, INV_W - x, INV_H - y, 40, p.accent, i % 3 ? p.bg2 : p.soft); }
      for (const [x, y] of [[780, 200], [300, 1150]] as const) { c.fillStyle = "#f2c14e"; c.beginPath(); c.ellipse(x, y, 34, 24, 0, 0, TAU); c.fill(); c.fillStyle = p.ink; c.fillRect(x - 10, y - 24, 8, 48); c.fillRect(x + 6, y - 24, 8, 48); circle(c, x - 10, y - 30, 16, "#ffffff", 0.8); circle(c, x + 12, y - 30, 16, "#ffffff", 0.8); }
      return full;
    }
    case "butterflies": {
      for (let i = 0; i < 14; i++) { const top = i < 7; butterfly(c, 80 + (i % 7) * 150 + R() * 40, top ? 120 + R() * 140 : INV_H - 120 - R() * 140, 1 + R() * 0.8, i % 3 ? p.accent : p.soft, (R() - 0.5) * 0.8); }
      return full;
    }
    case "hotair": {
      hotair(c, 220, 280, 1.6, p.accent, p.soft, p.ink); hotair(c, 860, 200, 1.1, p.soft, p.bg2, p.ink); hotair(c, 820, INV_H - 300, 0.8, p.accent, p.bg2, p.ink);
      cloud(c, 420, 170, 0.9, "#ffffff"); cloud(c, 80, INV_H - 160, 1.1, "#ffffff");
      return { ...full, y: 520, h: 640 };
    }
    case "confetti": {
      for (let i = 0; i < 140; i++) { const x = R() * INV_W, y = R() * INV_H; if (x > 150 && x < INV_W - 150 && y > 260 && y < INV_H - 260) continue; c.save(); c.translate(x, y); c.rotate(R() * TAU); c.fillStyle = [p.accent, p.soft, p.bg2, p.ink][i % 4]; c.globalAlpha = i % 4 === 3 ? 0.25 : 0.9; c.fillRect(-6, -14, 12, 28); c.restore(); }
      c.globalAlpha = 1;
      return full;
    }
    case "awning": {
      const n = 9, w = INV_W / n;
      for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? p.accent : "#ffffff"; c.fillRect(i * w, 0, w, 200); c.beginPath(); c.arc(i * w + w / 2, 200, w / 2, 0, Math.PI); c.fill(); }
      c.fillStyle = p.bg2; c.fillRect(0, INV_H - 70, INV_W, 70);
      return { ...full, y: 360, h: 760 };
    }
    case "gingham": {
      c.globalAlpha = 0.35; c.fillStyle = p.accent; for (let x = 0; x < INV_W; x += 90) c.fillRect(x, 0, 45, INV_H); for (let y = 0; y < INV_H; y += 90) c.fillRect(0, y, INV_W, 45); c.globalAlpha = 1;
      c.fillStyle = p.bg; roundRect(c, 130, 170, INV_W - 260, INV_H - 340, 36); c.fill(); c.strokeStyle = p.accent; c.lineWidth = 4; c.stroke();
      return { x: 180, y: 260, w: INV_W - 360, h: INV_H - 520 };
    }
    case "bigtype": {
      c.fillStyle = p.bg2; c.fillRect(0, 0, INV_W, 520);
      circle(c, INV_W - 140, 130, 60, p.accent); circle(c, 120, 440, 30, p.soft);
      return { x: 120, y: 160, w: INV_W - 240, h: 1000, nameScale: 1.35 };
    }
    case "wreath": {
      const cx = INV_W / 2, cy = 620, r = 380;
      for (let i = 0; i < 64; i++) { const a = (i / 64) * TAU; leaf(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 64, a + Math.PI / 2 + (i % 2 ? 0.5 : -0.5), i % 3 ? p.accent : p.soft); }
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.2; flower(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 30, p.soft, p.accent); }
      return { x: cx - 300, y: cy - 280, w: 600, h: 560 };
    }
    case "window": {
      const x0 = 160, x1 = INV_W - 160, top = 420;
      c.fillStyle = p.bg2; c.beginPath(); c.moveTo(x0, INV_H - 110); c.lineTo(x0, top); c.quadraticCurveTo(INV_W / 2, 40, x1, top); c.lineTo(x1, INV_H - 110); c.closePath(); c.fill();
      c.strokeStyle = p.accent; c.lineWidth = 10; c.stroke();
      c.lineWidth = 2; c.globalAlpha = 0.5; for (let x = x0 + 60; x < x1; x += 60) { c.beginPath(); c.moveTo(x, top); c.lineTo(x, top + 70); c.stroke(); } c.globalAlpha = 1;
      for (let x = x0 + 30; x < x1; x += 80) star(c, x + 10, top + 34, 14, p.accent, 8);
      return { x: x0 + 60, y: top + 120, w: x1 - x0 - 120, h: 700 };
    }
    case "dallah": {
      dallah(c, 220, INV_H - 230, 1.5, p.accent, p.bg);
      [0, 1, 2].forEach((i) => cup(c, 760 + i * 90, INV_H - 170, 1.4, "#ffffff", p.accent));
      c.fillStyle = p.bg2; c.fillRect(0, INV_H - 100, INV_W, 100);
      return { ...full, y: 200, h: 760 };
    }
    case "moon": {
      crescent(c, INV_W - 240, 260, 130, p.accent, p.bg);
      for (let i = 0; i < 60; i++) star(c, R() * INV_W, R() * INV_H, 3 + R() * 7, i % 5 ? p.ink : p.accent);
      return full;
    }
    case "lanterns": {
      [[160, 150, 1.4], [330, 60, 1], [750, 90, 1.2], [920, 200, 1.5]].forEach(([x, y, s], i) => lantern(c, x, y, s, i % 2 ? p.accent : p.soft, "#fff2c7", p.accent));
      return { ...full, y: 460, h: 720 };
    }
    case "starfield": {
      for (let i = 0; i < 140; i++) circle(c, R() * INV_W, R() * INV_H, 1 + R() * 2.5, p.ink, 0.3 + R() * 0.6);
      for (let i = 0; i < 8; i++) star(c, R() * INV_W, R() * INV_H, 10 + R() * 12, p.accent, 4);
      c.strokeStyle = p.accent; c.lineWidth = 2; c.globalAlpha = 0.7; c.beginPath(); c.arc(INV_W / 2, INV_H / 2, 470, 0, TAU); c.stroke(); c.globalAlpha = 1;
      return full;
    }
    case "goldnight": {
      frameLine(c, 60, p.accent, 3); frameLine(c, 80, p.accent, 1);
      arabesqueCorner(c, 80, 80, 180, 0, p.accent); arabesqueCorner(c, INV_W - 80, INV_H - 80, 180, Math.PI, p.accent);
      c.fillStyle = p.accent; c.fillRect(INV_W / 2 - 120, 210, 240, 3); c.fillRect(INV_W / 2 - 120, INV_H - 210, 240, 3);
      return full;
    }
  }
}

const fontFamily = (f: InviteFont) => inviteFonts.find((x) => x.id === f)!.family;

function wrap(c: Ctx, text: string, maxW: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) { const t = line ? `${line} ${w}` : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  return lines;
}

/** Draw the whole invitation. `scale` lets the gallery draw small previews with the same code. */
export function drawInvite(canvas: HTMLCanvasElement, d: InviteDesign, words: InviteWords, o: { lang: "ar" | "en"; font?: InviteFont; scale?: number }) {
  const c = canvas.getContext("2d");
  if (!c) return;
  const s = o.scale ?? 1;
  c.setTransform(s, 0, 0, s, 0, 0);
  const p: P = d.palette;
  const g = c.createLinearGradient(0, 0, 0, INV_H);
  g.addColorStop(0, p.bg); g.addColorStop(1, p.dark ? p.bg2 : p.bg);
  c.fillStyle = g; c.fillRect(0, 0, INV_W, INV_H);
  const box = decorate(c, d);
  const ink = box.ink ?? p.ink;
  const display = fontFamily(o.font ?? d.font);
  const body = o.lang === "ar" ? '"QD Messiri", "Rubik", sans-serif' : '"Rubik", sans-serif';
  c.direction = o.lang === "ar" ? "rtl" : "ltr";
  c.textAlign = "center";
  c.textBaseline = "alphabetic";
  const cx = box.x + box.w / 2;
  // Build the stack, then shrink everything until it fits the layout's box.
  type Row = { text: string; size: number; font: string; color: string; gap: number };
  const rows: Row[] = [];
  const nameSize = 150 * (box.nameScale ?? 1);
  if (words.opener) rows.push({ text: words.opener, size: 40, font: body, color: p.accent, gap: 18 });
  if (words.title) rows.push({ text: words.title, size: 56, font: display, color: ink, gap: 22 });
  if (words.name) rows.push({ text: words.name, size: nameSize, font: display, color: p.accent, gap: 30 });
  if (words.line) rows.push({ text: words.line, size: 40, font: body, color: ink, gap: 30 });
  const when = [words.date, words.time].filter(Boolean).join(o.lang === "ar" ? " · " : " · ");
  if (when) rows.push({ text: when, size: 44, font: body, color: ink, gap: 14 });
  if (words.place) rows.push({ text: words.place, size: 40, font: body, color: ink, gap: 14 });
  if (words.host) rows.push({ text: words.host, size: 38, font: display, color: p.accent, gap: 20 });
  if (words.note) rows.push({ text: words.note, size: 30, font: body, color: ink, gap: 12 });
  let k = 1;
  let laid: { lines: string[]; r: Row }[] = [];
  for (let attempt = 0; attempt < 12; attempt++) {
    laid = rows.map((r) => { c.font = `${r.font === body ? 500 : 700} ${r.size * k}px ${r.font}`; return { lines: wrap(c, r.text, box.w), r }; });
    const total = laid.reduce((t, { lines, r }) => t + lines.length * r.size * k * 1.25 + r.gap * k, 0);
    if (total <= box.h) break;
    k *= 0.92;
  }
  const total = laid.reduce((t, { lines, r }) => t + lines.length * r.size * k * 1.25 + r.gap * k, 0);
  let y = box.y + Math.max(0, (box.h - total) / 2);
  for (const { lines, r } of laid) {
    c.font = `${r.font === body ? 500 : 700} ${r.size * k}px ${r.font}`;
    c.fillStyle = r.color;
    for (const line of lines) { y += r.size * k * 1.05; c.fillText(line, cx, y); y += r.size * k * 0.2; }
    y += r.gap * k;
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

/** Make sure the studio fonts are ready before drawing (canvas does not wait for them). */
export async function loadInviteFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(["QD Ruqaa", "QD Kufi", "QD Naskh", "QD Messiri", "Rubik"].map((f) => document.fonts.load(`700 40px "${f}"`, "أب ab").catch(() => [])));
}
