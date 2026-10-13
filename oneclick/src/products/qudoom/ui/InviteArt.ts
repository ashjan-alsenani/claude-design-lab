/*
 * Invitation art, drawn as SVG (1080×1920, story size). One motif library rendered in six materials:
 * knitted wool and beads, stitched felt, cut paper, watercolour, fine line and gold on dark. Every
 * motif is plain shapes tagged with a colour role; the material decides how each role is painted
 * (a knit pattern, a dashed stitch, a soft wash…) and how the piece sits on the page (raised relief,
 * a paper shadow, a pigment edge). Pure string building: no DOM, so tests and previews can use it.
 */

export const ART_W = 1080;
export const ART_H = 1920;

export type Material = "knit" | "felt" | "paper" | "watercolor" | "line" | "gold";
export type ArtPalette = {
  id: string; ar: string; en: string;
  bg: string; bg2: string;
  /** Colour roles used by the motifs. */
  main: string; light: string; accent: string; leaf: string; dark: string; sun: string;
  /** Words: headings, the name, the softer lines. */
  ink: string; name: string; soft: string;
  /** A dark page (gold on navy and friends). */
  night?: boolean;
};
type Role = "main" | "light" | "accent" | "leaf" | "dark" | "sun" | "white";

// ───────────────────────── colour helpers ─────────────────────────
const hex = (c: string) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
};
const lighten = (c: string, t: number) => mix(c, "#ffffff", t);
const darken = (c: string, t: number) => mix(c, "#000000", t);
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ───────────────────────── drawing context ─────────────────────────
export class Art {
  defs: string[] = [];
  private n = 0;
  mat: Material;
  pal: ArtPalette;
  seed: number;
  constructor(mat: Material, pal: ArtPalette, seed = 1) {
    this.mat = mat;
    this.pal = pal;
    this.seed = seed;
  }
  uid(p: string) { return `${p}${++this.n}`; }
  color(r: Role) {
    const p = this.pal;
    if (r === "white") return this.mat === "watercolor" ? mix(p.light, p.main, 0.18) : p.night ? lighten(p.bg2, 0.85) : "#fffdf8";
    if (r === "light" && this.mat === "watercolor") return mix(p.light, p.main, 0.3);
    return p[r];
  }
  /** Ink for small details: mouths, ropes, veins. */
  get ink() { return this.mat === "line" ? this.pal.dark : this.mat === "gold" ? "#f3dc9a" : this.pal.dark; }
  get line() { return this.mat === "line"; }
  /** Fill/stroke attributes for a role in this material. */
  paint(r: Role): string {
    const c = this.color(r);
    switch (this.mat) {
      case "knit":
        return r === "dark" ? `fill="${c}"` : `fill="url(#${r === "light" || r === "white" ? "bd" : "kn"}-${r})"`;
      case "felt":
        return r === "dark" ? `fill="${c}"` : `fill="url(#fl-${r})" stroke="${darken(c, 0.28)}" stroke-width="2.6" stroke-dasharray="7 6" vector-effect="non-scaling-stroke"`;
      case "paper":
        return r === "dark" ? `fill="${c}"` : `fill="url(#pp-${r})"`;
      case "watercolor":
        return r === "dark" ? `fill="${c}"` : `fill="url(#wc-${r})"`;
      case "line":
        return r === "dark" ? `fill="${c}"` : `fill="none" stroke="${this.pal.dark}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"`;
      case "gold":
        return r === "dark" ? `fill="${this.pal.bg}"` : `fill="url(#gd-${r === "light" || r === "white" ? "soft" : r === "leaf" ? "leaf" : "main"})" stroke="#8f6f2e" stroke-width="1.4" vector-effect="non-scaling-stroke"`;
    }
  }
  /** How a whole motif sits on the page. */
  get fx() {
    switch (this.mat) {
      case "knit": return `filter="url(#fx-relief)"`;
      case "felt": return `filter="url(#fx-felt)"`;
      case "paper": return `filter="url(#fx-paper)"`;
      case "watercolor": return `filter="url(#fx-wc)" style="mix-blend-mode:multiply"`;
      case "gold": return `filter="url(#fx-glow)"`;
      default: return "";
    }
  }
  /** A detail stroke (not filled). */
  stroke(w = 3, color = this.ink, extra = "") { return `fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" ${extra}`; }
  /** Whether soft extras (blush, highlights) should be drawn. */
  get soft() { return this.mat !== "line" && this.mat !== "gold"; }
}

/** The shared definitions: grain, the material's filters and its fills for every role. */
function materialDefs(x: Art) {
  const p = x.pal;
  const roles: Role[] = ["main", "light", "accent", "leaf", "sun", "white"];
  const out: string[] = [
    `<filter id="fx-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="${x.seed % 97}"/><feColorMatrix type="matrix" values="0 0 0 0 ${p.night ? 1 : 0}  0 0 0 0 ${p.night ? 1 : 0}  0 0 0 0 ${p.night ? 1 : 0}  0 0 0 ${p.night ? 0.05 : 0.075} 0"/></filter>`,
  ];
  if (x.mat === "knit") {
    for (const r of roles) {
      const c = x.color(r);
      if (r === "light" || r === "white") {
        out.push(`<radialGradient id="bdg-${r}" cx=".38" cy=".34" r=".72"><stop offset="0" stop-color="${lighten(c, 0.55)}"/><stop offset="1" stop-color="${darken(c, 0.08)}"/></radialGradient>
<pattern id="bd-${r}" width="14" height="24" patternUnits="userSpaceOnUse"><rect width="14" height="24" fill="${darken(c, 0.14)}"/><circle cx="7" cy="6" r="6.2" fill="url(#bdg-${r})"/><circle cx="0" cy="18" r="6.2" fill="url(#bdg-${r})"/><circle cx="14" cy="18" r="6.2" fill="url(#bdg-${r})"/></pattern>`);
      } else {
        out.push(`<linearGradient id="kng-${r}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(c, 0.22)}"/><stop offset="1" stop-color="${darken(c, 0.1)}"/></linearGradient>
<pattern id="kn-${r}" width="16" height="13" patternUnits="userSpaceOnUse"><rect width="16" height="13" fill="${darken(c, 0.28)}"/><ellipse cx="4.4" cy="6.5" rx="3.8" ry="7" transform="rotate(-28 4.4 6.5)" fill="url(#kng-${r})"/><ellipse cx="11.6" cy="6.5" rx="3.8" ry="7" transform="rotate(28 11.6 6.5)" fill="url(#kng-${r})"/></pattern>`);
      }
    }
    out.push(`<filter id="fx-relief" x="-15%" y="-15%" width="130%" height="135%"><feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/><feSpecularLighting in="b" surfaceScale="3" specularConstant=".5" specularExponent="16" lighting-color="#fff" result="s"><fePointLight x="-300" y="-500" z="420"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k2="1" k3=".32"/><feDropShadow dx="3" dy="8" stdDeviation="7" flood-color="${darken(p.bg, 0.55)}" flood-opacity=".35"/></filter>`);
  }
  if (x.mat === "felt") {
    for (const r of roles) { const c = x.color(r); out.push(`<linearGradient id="fl-${r}" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" stop-color="${lighten(c, 0.1)}"/><stop offset="1" stop-color="${darken(c, 0.05)}"/></linearGradient>`); }
    out.push(`<filter id="fx-felt" x="-15%" y="-15%" width="130%" height="135%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="4" seed="7" result="n"/><feDiffuseLighting in="n" surfaceScale="1.4" lighting-color="#fff" result="l"><feDistantLight azimuth="225" elevation="60"/></feDiffuseLighting><feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1=".38" k2=".7" k4="-.06" result="t"/><feComposite in="t" in2="SourceAlpha" operator="in" result="t2"/><feDropShadow in="t2" dx="2" dy="6" stdDeviation="5" flood-color="${darken(p.bg, 0.6)}" flood-opacity=".3"/></filter>`);
  }
  if (x.mat === "paper") {
    for (const r of roles) { const c = x.color(r); out.push(`<linearGradient id="pp-${r}" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="${lighten(c, 0.12)}"/><stop offset="1" stop-color="${darken(c, 0.06)}"/></linearGradient>`); }
    out.push(`<filter id="fx-paper" x="-15%" y="-15%" width="130%" height="140%"><feMorphology in="SourceAlpha" operator="erode" radius="2.5" result="e"/><feOffset in="e" dx="-1.5" dy="-1.5" result="eo"/><feComposite in="SourceAlpha" in2="eo" operator="out" result="edge"/><feFlood flood-color="#ffffff" flood-opacity=".55"/><feComposite in2="edge" operator="in" result="hi"/><feMerge result="m"><feMergeNode in="SourceGraphic"/><feMergeNode in="hi"/></feMerge><feComposite in="m" in2="SourceAlpha" operator="in" result="m2"/><feDropShadow in="m2" dx="2" dy="7" stdDeviation="6" flood-color="${darken(p.bg, 0.6)}" flood-opacity=".26"/></filter>`);
  }
  if (x.mat === "watercolor") {
    for (const r of roles) { const c = x.color(r); out.push(`<radialGradient id="wc-${r}" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="${lighten(c, 0.35)}" stop-opacity=".85"/><stop offset=".75" stop-color="${c}" stop-opacity=".9"/><stop offset="1" stop-color="${darken(c, 0.12)}"/></radialGradient>`); }
    out.push(`<filter id="fx-wc" x="-10%" y="-10%" width="120%" height="125%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="${(x.seed % 50) + 3}" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="11" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.8 1.2" result="ga"/><feComposite in="d" in2="ga" operator="in"/></filter>`);
  }
  if (x.mat === "gold") {
    out.push(`<linearGradient id="gd-main" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbeab0"/><stop offset=".45" stop-color="#d4ad55"/><stop offset=".7" stop-color="#f4dc93"/><stop offset="1" stop-color="#b98e3c"/></linearGradient>
<linearGradient id="gd-leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efe2b8"/><stop offset="1" stop-color="#bfa25e"/></linearGradient>
<linearGradient id="gd-soft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6dc"/><stop offset=".5" stop-color="#ecd9a6"/><stop offset="1" stop-color="#d9bf7c"/></linearGradient>
<filter id="fx-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b"/><feFlood flood-color="#f6d98c" flood-opacity=".35"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
  }
  return out.join("");
}

// ───────────────────────── shape helpers ─────────────────────────
const el = (x: Art, r: Role, tag: string, a: string) => `<${tag} ${a} ${x.paint(r)}/>`;
const C = (x: Art, r: Role, cx: number, cy: number, rad: number) => el(x, r, "circle", `cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(rad)}"`);
const E = (x: Art, r: Role, cx: number, cy: number, rx: number, ry: number, rot = 0) => el(x, r, "ellipse", `cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}"${rot ? ` transform="rotate(${rot} ${f1(cx)} ${f1(cy)})"` : ""}`);
const P = (x: Art, r: Role, d: string) => el(x, r, "path", `d="${d}"`);
const eye = (x: Art, cx: number, cy: number, r = 6) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${x.mat === "gold" ? "#f3dc9a" : x.pal.dark}"/>${x.soft ? `<circle cx="${cx + r * 0.35}" cy="${cy - r * 0.35}" r="${r * 0.32}" fill="#fff" opacity=".85"/>` : ""}`;
const blush = (x: Art, cx: number, cy: number, r = 9) => (x.soft ? `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.6}" fill="${x.pal.accent}" opacity=".45"/>` : "");
const smile = (x: Art, cx: number, cy: number, w = 10) => `<path d="M${cx - w} ${cy} Q${cx} ${cy + w * 0.9} ${cx + w} ${cy}" ${x.stroke(3)}/>`;

/** A closed bumpy outline around an ellipse: wool, clouds, manes, blossoms. */
export function bumpy(rx: number, ry: number, n: number, bump = 1, cx = 0, cy = 0) {
  const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  const seg = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
  const r = (seg / 2) * bump;
  return `M${f1(pts[0][0])} ${f1(pts[0][1])}` + pts.map((_, i) => { const q = pts[(i + 1) % n]; return `A${f1(r)} ${f1(r)} 0 0 1 ${f1(q[0])} ${f1(q[1])}`; }).join("") + "Z";
}
const starPath = (r: number, inner = 0.46, pts = 5, cx = 0, cy = 0) => "M" + Array.from({ length: pts * 2 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / pts, rr = i % 2 ? r * inner : r; return `${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))}`; }).join("L") + "Z";
const heartPath = (s: number, cx = 0, cy = 0) => `M${cx} ${cy + 38 * s}C${cx - 70 * s} ${cy - 8 * s} ${cx - 52 * s} ${cy - 70 * s} ${cx} ${cy - 40 * s}C${cx + 52 * s} ${cy - 70 * s} ${cx + 70 * s} ${cy - 8 * s} ${cx} ${cy + 38 * s}Z`;
export const CLOUD = "M-110 40A44 44 0 0 1-92-28A62 62 0 0 1 8-62A56 56 0 0 1 96-24A44 44 0 0 1 112 40Z";

/** Crescent: the part of circle A (radius R at the origin) outside circle B. */
function crescent(R: number, bx: number, by: number, r: number) {
  const d = Math.hypot(bx, by), a = (R * R - r * r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, R * R - a * a));
  const px = (a * bx) / d, py = (a * by) / d, ox = (-by / d) * h, oy = (bx / d) * h;
  const i1 = [px + ox, py + oy], i2 = [px - ox, py - oy];
  return `M${f1(i1[0])} ${f1(i1[1])}A${R} ${R} 0 1 1 ${f1(i2[0])} ${f1(i2[1])}A${r} ${r} 0 0 0 ${f1(i1[0])} ${f1(i1[1])}Z`;
}

// ───────────────────────── the motifs ─────────────────────────
// Each draws around (0,0) at roughly 200 units tall, colours by role.
type MotifFn = (x: Art) => string;
export const motifs: Record<string, MotifFn> = {
  moon: (x) => P(x, "white", crescent(95, 42, -26, 82)) + (x.soft ? `<path d="M-52 4 q10 8 20 0" ${x.stroke(3)}/>${blush(x, -46, 22, 8)}` : ""),
  star: (x) => P(x, "main", starPath(60, 0.48)),
  sparkle: (x) => P(x, "sun", "M0-60C6-14 14-6 60 0C14 6 6 14 0 60C-6 14-14 6-60 0C-14-6-6-14 0-60Z"),
  cloud: (x) => P(x, "white", CLOUD),
  heart: (x) => P(x, "accent", heartPath(1.15, 0, 4)),
  sun: (x) => {
    let s = "";
    for (let i = 0; i < 12; i++) s += `<g transform="rotate(${i * 30})">${P(x, "sun", "M-10-62L0-92L10-62Z")}</g>`;
    return s + C(x, "sun", 0, 0, 56) + (x.soft ? `${eye(x, -18, -6, 5)}${eye(x, 18, -6, 5)}${smile(x, 0, 14, 12)}${blush(x, -32, 12)}${blush(x, 32, 12)}` : "");
  },
  rainbow: (x) => {
    const arc = (r: number, w: number, role: Role) => `<path d="M${-r} 40A${r} ${r} 0 0 1 ${r} 40" ${x.line ? x.paint(role) : `fill="none" stroke="${x.mat === "knit" ? `url(#kn-${role})` : x.mat === "gold" ? "url(#gd-main)" : x.mat === "watercolor" ? `url(#wc-${role})` : x.mat === "paper" ? `url(#pp-${role})` : `url(#fl-${role})`}" stroke-width="${w}"`}/>`;
    return arc(118, 30, "accent") + arc(86, 30, "sun") + arc(54, 30, "main") + `<g transform="translate(-112 52) scale(.45)">${P(x, "white", CLOUD)}</g><g transform="translate(112 52) scale(.45)">${P(x, "white", CLOUD)}</g>`;
  },
  hotair: (x) =>
    P(x, "main", "M0-112C-82-112-96-26-62 22C-46 46-24 60-18 76L18 76C24 60 46 46 62 22C96-26 82-112 0-112Z") +
    P(x, "accent", "M0-112C-30-96-34-20-18 76L18 76C34-20 30-96 0-112Z") +
    `<path d="M-18 76L-22 108M18 76L22 108" ${x.stroke(3)}/>` + P(x, "light", "M-30 104H30L24 140H-24Z"),
  kite: (x) => P(x, "main", "M0-90L56-10L0 70L-56-10Z") + P(x, "accent", "M0-90L56-10L0-10Z") + P(x, "accent", "M0-10L0 70L-56-10Z") +
    `<path d="M0 70C20 100-20 120 0 150S-10 190 6 206" ${x.stroke(3)}/>` + [110, 150, 190].map((y, i) => P(x, i % 2 ? "sun" : "accent", `M${-2 + (i % 2) * 6} ${y}l-14-8v16zM${-2 + (i % 2) * 6} ${y}l14-8v16z`)).join(""),
  paperplane: (x) => P(x, "white", "M-90 10L90-60L-20 40Z") + P(x, "light", "M-20 40L90-60L-6 74Z") + P(x, "main", "M-20 40L-6 74L4 46Z") +
    `<path d="M-100 30C-150 60-150 110-200 120" ${x.stroke(3, x.ink, 'stroke-dasharray="10 10"')}/>`,
  umbrella: (x) => P(x, "main", "M-100 0A100 90 0 0 1 100 0Q75-18 50 0Q25-18 0 0Q-25-18-50 0Q-75-18-100 0Z") + P(x, "accent", "M0-90A50 90 0 0 1 50 0Q25-18 0 0Q-25-18-50 0A50 90 0 0 1 0-90Z") +
    `<path d="M0 0V90Q0 110-18 104" ${x.stroke(5)}/>` + [[-80, 50], [70, 60], [-40, 110], [90, 120]].map(([a, b]) => P(x, "light", `M${a} ${b - 14}Q${a + 9} ${b} ${a} ${b + 6}Q${a - 9} ${b} ${a} ${b - 14}Z`)).join(""),
  teddy: (x) =>
    E(x, "main", -78, 64, 30, 46, 30) + E(x, "main", 78, 64, 30, 46, -30) +
    E(x, "main", 0, 78, 82, 78) + E(x, "light", 0, 92, 46, 48) +
    E(x, "main", -52, 148, 40, 30) + E(x, "main", 52, 148, 40, 30) + E(x, "light", -54, 152, 22, 17) + E(x, "light", 54, 152, 22, 17) +
    C(x, "main", -58, -108, 30) + C(x, "main", 58, -108, 30) + C(x, "light", -58, -108, 16) + C(x, "light", 58, -108, 16) +
    E(x, "main", 0, -50, 82, 74) + E(x, "light", 0, -24, 34, 27) +
    `${eye(x, -30, -60, 7)}${eye(x, 30, -60, 7)}<path d="M-10-36Q0-42 10-36Q8-26 0-24Q-8-26-10-36Z" fill="${x.mat === "gold" ? "#f3dc9a" : x.pal.dark}"/><path d="M0-24V-16M-11-12Q-5-6 0-14Q5-6 11-12" ${x.stroke(2.6)}/>${blush(x, -52, -30)}${blush(x, 52, -30)}` +
    P(x, "accent", "M0 16L-40-4Q-48 16-40 36Z") + P(x, "accent", "M0 16L40-4Q48 16 40 36Z") + C(x, "accent", 0, 16, 11),
  bunny: (x) =>
    E(x, "main", -22, -128, 16, 52, -10) + E(x, "main", 22, -128, 16, 52, 10) + E(x, "light", -22, -124, 7, 36, -10) + E(x, "light", 22, -124, 7, 36, 10) +
    E(x, "main", 0, 66, 70, 78) + C(x, "white", 62, 118, 20) + E(x, "light", 0, 80, 38, 46) +
    E(x, "main", -40, 140, 34, 18) + E(x, "main", 40, 140, 34, 18) +
    C(x, "main", 0, -44, 60) + `${eye(x, -22, -50, 6)}${eye(x, 22, -50, 6)}` + P(x, "accent", "M-7-32H7L0-24Z") + `<path d="M0-24V-18M-8-14Q-4-10 0-16Q4-10 8-14" ${x.stroke(2.4)}/>${blush(x, -38, -30)}${blush(x, 38, -30)}`,
  elephant: (x) =>
    E(x, "main", 0, 88, 78, 60) + E(x, "main", -46, 140, 22, 26) + E(x, "main", 46, 140, 22, 26) +
    E(x, "main", -82, -18, 50, 64, -12) + E(x, "main", 82, -18, 50, 64, 12) + E(x, "light", -84, -16, 32, 44, -12) + E(x, "light", 84, -16, 32, 44, 12) +
    C(x, "main", 0, -24, 66) + P(x, "main", "M-18 18C-22 60-8 92 22 100C38 104 44 86 30 82C14 78 12 56 16 24Z") +
    `${eye(x, -26, -36, 6)}${eye(x, 26, -36, 6)}${blush(x, -40, -10)}${blush(x, 40, -10)}` + P(x, "accent", "M-30-82Q0-110 30-82Q14-70 0-76Q-14-70-30-82Z"),
  lamb: (x) =>
    `<path d="M-40 70V130M-6 80V138M30 80V138M60 66V126" ${x.stroke(9, x.line ? x.pal.dark : x.pal.dark)}/>` +
    P(x, "white", bumpy(98, 64, 16, 1.15, 10, 30)) +
    E(x, "main", -86, -6, 36, 44, 18) +
    E(x, "main", -122, -26, 18, 9, -30) + E(x, "main", -52, -36, 18, 9, 30) +
    P(x, "white", bumpy(30, 18, 7, 1.2, -84, -48)) + `${eye(x, -98, -4, 5)}${eye(x, -72, -4, 5)}${blush(x, -104, 14, 6)}${blush(x, -66, 14, 6)}`,
  duckling: (x) =>
    E(x, "sun", 10, 54, 92, 64) + P(x, "sun", "M90 30Q130 10 120 50Q110 70 90 60Z") + C(x, "sun", -38, -36, 52) +
    P(x, "accent", "M-86-36Q-112-30-114-18Q-96-12-80-20Z") + `${eye(x, -50, -46, 6)}${blush(x, -34, -20)}` + P(x, "light", "M10 34Q50 20 70 50Q40 82 10 62Z") +
    `<path d="M-20 116V138M30 116V138" ${x.stroke(6, x.line ? x.pal.dark : x.pal.accent)}/>`,
  owl: (x) =>
    P(x, "main", "M-70-70L-58-108L-28-84Q0-92 28-84L58-108L70-70Q96 0 80 70Q60 130 0 132Q-60 130-80 70Q-96 0-70-70Z") +
    E(x, "light", 0, 52, 52, 62) + [0, 1, 2].map((r) => [-1, 0, 1].map((c) => `<path d="M${c * 26 - 10} ${30 + r * 24}q10 10 20 0" ${x.stroke(2.4)}/>`).join("")).join("") +
    C(x, "white", -32, -40, 30) + C(x, "white", 32, -40, 30) + `${eye(x, -32, -40, 13)}${eye(x, 32, -40, 13)}` + P(x, "accent", "M-10-14H10L0 6Z") +
    E(x, "main", -84, 34, 18, 50, 14) + E(x, "main", 84, 34, 18, 50, -14) + `<path d="M-24 132v12M-14 132v12M14 132v12M24 132v12" ${x.stroke(5, x.line ? x.pal.dark : x.pal.accent)}/>`,
  bird: (x) =>
    `<path d="M-140 70Q0 40 150 80" ${x.stroke(8, x.line ? x.pal.dark : darken(x.pal.leaf, 0.3))}/>` + [[-100, 62, -30], [-40, 52, 20], [70, 60, -24], [120, 72, 30]].map(([a, b, r]) => E(x, "leaf", a, b - 14, 12, 26, r)).join("") +
    P(x, "main", "M-60 10Q-70-50-10-62Q40-70 56-30Q70 10 40 40Q0 60-40 44L-90 64Q-80 40-60 10Z") + P(x, "light", "M-20 0Q20-20 40 10Q20 40-20 30Z") +
    P(x, "accent", "M54-36L82-28L56-20Z") + eye(x, 34, -34, 6) + blush(x, 30, -14, 7),
  butterfly: (x) => E(x, "main", -46, -30, 46, 56, -24) + E(x, "main", 46, -30, 46, 56, 24) + E(x, "accent", -36, 46, 30, 38, 24) + E(x, "accent", 36, 46, 30, 38, -24) +
    C(x, "light", -50, -40, 16) + C(x, "light", 50, -40, 16) + E(x, "dark", 0, 6, 9, 62) + `<path d="M-4-52Q-20-90-36-96M4-52Q20-90 36-96" ${x.stroke(3)}/>`,
  bee: (x) => E(x, "light", -24, -50, 34, 46, -24) + E(x, "light", 24, -50, 34, 46, 24) + E(x, "sun", 0, 20, 70, 56) +
    `<path d="M-30-26Q-38 20-30 66M6-34Q-2 20 6 74M40-26Q32 20 40 64" ${x.stroke(12, x.line ? x.pal.dark : x.pal.dark)}/>` + `${eye(x, -50, 6, 6)}${smile(x, -54, 26, 8)}${blush(x, -34, 30, 7)}` + `<path d="M70 20L92 26" ${x.stroke(4)}/>`,
  whale: (x) => `<g transform="scale(.27) translate(-470 -260)">` +
    P(x, "main", "M178 196C150 150 105 92 40 40C95 58 140 72 168 92C150 58 158 22 196 0C210 64 204 132 186 196Z") +
    P(x, "main", "M170 190C260 250 380 262 480 232C600 192 720 108 850 88C884 84 904 106 884 128C840 192 760 292 620 332C480 392 330 352 230 262C200 240 180 220 170 190Z") +
    P(x, "light", "M232 262C330 252 470 300 600 252C720 204 820 144 884 126C840 194 760 292 620 332C480 392 330 352 232 262Z") +
    (x.line ? "" : [0, 1, 2, 3, 4].map((i) => `<path d="M${300 + i * 60} ${282 + i * 2}Q${420 + i * 50} ${300 - i * 22} ${560 + i * 50} ${262 - i * 30}" ${x.stroke(3, darken(x.pal.light, 0.15))} opacity=".7"/>`).join("")) +
    P(x, "main", "M560 318C572 380 548 450 470 515C452 530 432 514 448 498C505 440 520 385 515 330Z") +
    `${eye(x, 780, 150, 12)}<path d="M720 40Q730 0 700-20M740 36Q760 0 790-10" ${x.stroke(4)}/></g>`,
  fish: (x) => P(x, "main", "M-90 0Q-30-70 50-30L100-66L96 0L100 66L50 30Q-30 70-90 0Z") + P(x, "accent", "M-10-46Q10-80 40-40Z") +
    [0, 1, 2].map((i) => `<path d="M${-10 + i * 22}-24Q${2 + i * 22} 0 ${-10 + i * 22} 24" ${x.stroke(3, x.line ? x.pal.dark : lighten(x.pal.main, 0.4))}/>`).join("") + eye(x, -54, -8, 7) + blush(x, -50, 14, 7),
  turtle: (x) => E(x, "light", -96, 0, 30, 26) + E(x, "light", -56, 54, 18, 22, 20) + E(x, "light", 56, 54, 18, 22, -20) + E(x, "light", 92, 34, 14, 10) +
    P(x, "main", "M-76 40Q-76-70 0-72Q76-70 76 40Z") + `<path d="M-40 40L-30-20L0-44L30-20L40 40M-30-20H30M-60 10L-30-20M60 10L30-20" ${x.stroke(3, x.line ? x.pal.dark : lighten(x.pal.main, 0.35))}/>` + eye(x, -104, -6, 5) + blush(x, -92, 10, 6),
  lion: (x) => P(x, "sun", bumpy(96, 96, 14, 1.25)) + C(x, "main", -46, -50, 18) + C(x, "main", 46, -50, 18) + C(x, "light", 0, 0, 64) +
    `${eye(x, -24, -10, 7)}${eye(x, 24, -10, 7)}` + P(x, "accent", "M-12 12H12L0 24Z") + `<path d="M0 24V32M-14 36Q-6 44 0 34Q6 44 14 36" ${x.stroke(2.6)}/>${blush(x, -40, 16)}${blush(x, 40, 16)}`,
  camel: (x) => `<path d="M-64 40V146M-34 46V150M34 46V150M62 40V146" ${x.stroke(13, x.line ? x.pal.dark : darken(x.pal.main, 0.12))}/>` +
    P(x, "main", "M-104 24Q-104-34-50-44Q-22-112 18-48Q66-44 86 0Q92 40 60 52L-66 54Q-104 52-104 24Z") +
    P(x, "main", "M64 6Q104-14 106-80Q108-118 136-122Q168-124 176-104L162-94Q144-100 140-80Q136-14 88 34Z") +
    eye(x, 150, -106, 5) + blush(x, 156, -92, 6) + `<path d="M-104 20Q-124 40-118 70" ${x.stroke(5, x.line ? x.pal.dark : darken(x.pal.main, 0.12))}/>` +
    P(x, "accent", "M-62-30Q-20-58 34-30L30-6Q-16-28-58-6Z"),
  swan: (x) => P(x, "white", "M-110 40Q-120-20-60-20Q0-20 40 20Q60-40 40-80Q20-120 60-130Q100-130 96-96L80-90Q70-110 60-104Q46-96 66-60Q100 0 70 50Q30 90-40 80Q-100 70-110 40Z") +
    P(x, "accent", "M96-96L122-90L94-82Z") + eye(x, 78, -104, 5) + P(x, "light", "M-80 30Q-40-10 20 30Q-30 50-80 30Z"),
  feet: (x) => [-1, 1].map((m) => `<g transform="translate(${m * 46} 0) rotate(${m * 8}) scale(${m} 1)">${P(x, "main", "M-6 92C-34 92-44 64-40 36C-37 14-26 4-28-18C-30-44-18-66 6-68C32-70 46-48 42-20C38 10 36 40 34 62C32 82 20 92-6 92Z")}${[[-26, -86, 9], [-6, -94, 7.5], [12, -92, 6.5], [27, -85, 5.8], [39, -74, 5]].map(([a, b, r]) => C(x, "main", a, b, r)).join("")}</g>`).join(""),
  boat: (x) => P(x, "light", "M-100-10L100-10L60 50H-60Z") + P(x, "white", "M0-10L0-120L70-10Z") + P(x, "main", "M0-10L0-100L-60-10Z") + `<path d="M0-10V-124" ${x.stroke(4)}/>` +
    `<path d="M-120 64q20-14 40 0t40 0 40 0 40 0 40 0 40 0" ${x.stroke(4, x.line ? x.pal.dark : x.pal.main)}/>`,
  dhow: (x) => P(x, "main", "M-120-6Q-60 6 0 6Q70 6 120-30L96 40Q0 56-96 40Z") + P(x, "white", "M-6-150Q60-90 96-16L-10-12Q30-80-6-150Z") + P(x, "light", "M-20-120Q-60-60-90-16L-24-12Q-36-70-20-120Z") +
    `<path d="M-14 4L-10-156" ${x.stroke(5)}/>` + P(x, "accent", "M-10-156L22-146L-10-138Z") + `<path d="M-140 62q24-16 48 0t48 0 48 0 48 0 48 0 48 0" ${x.stroke(4, x.line ? x.pal.dark : x.pal.main)}/>`,
  palm: (x) => P(x, "main", "M-14 160Q-24 40 0-60L16-60Q4 40 14 160Z") + `<path d="M-14 130H14M-12 90H12M-8 50H10M-4 10H10M0-30H12" ${x.stroke(3, x.line ? x.pal.dark : darken(x.pal.main, 0.25))}/>` +
    [-150, -120, -80, -40, -10, 25].map((a, i) => `<g transform="translate(6 -62) rotate(${a + 90})">${P(x, "leaf", `M0 0Q${40 + (i % 2) * 10}-26 ${110 + (i % 3) * 10} ${10 + (i % 2) * 8}Q50 8 0 0Z`)}</g>`).join("") +
    [[-8, -44], [6, -40], [-2, -30], [14, -30], [-14, -30]].map(([a, b]) => C(x, "accent", a, b, 8)).join(""),
  dallah: (x) => P(x, "main", "M-46 110H46L36 60Q60 10 30-30H-30Q-60 10-36 60Z") + P(x, "main", "M-30-30Q-40-70-16-80H16Q40-70 30-30Z") + P(x, "accent", "M-16-80Q0-120 16-80Z") + C(x, "accent", 0, -116, 7) +
    P(x, "main", "M-40 40Q-90 20-100-60Q-106-80-96-82Q-80-40-40 0Z") + `<path d="M36 0Q90 10 70 70Q60 90 40 90" ${x.stroke(8, x.line ? x.pal.dark : darken(x.pal.main, 0.2))}/>` + P(x, "accent", "M-38 56H38L36 70H-36Z"),
  lantern: (x) => `<path d="M0-180V-118" ${x.stroke(3)}/>` + P(x, "main", "M-30-118H30L20-96H-20Z") + P(x, "main", "M-46-96H46L56 50L30 86H-30L-56 50Z") +
    P(x, "sun", "M-30-80H30L38 40L20 66H-20L-38 40Z") + `<path d="M0-80V66M-34-20H34" ${x.stroke(3, x.line ? x.pal.dark : x.pal.main)}/>` + P(x, "main", "M-12 86H12L0 112Z"),
  pram: (x) => P(x, "main", "M-90-10A90 90 0 0 1 0-100L0-10Z") + P(x, "light", "M-100-10H90Q90 70 0 70Q-100 70-100-10Z") + `<path d="M90-10L130-70H150" ${x.stroke(6)}/>` +
    ["-60", "50"].map((cx) => `<circle cx="${cx}" cy="96" r="26" ${x.line ? x.paint("main") : `fill="none" stroke="${x.mat === "gold" ? "#e6c470" : x.pal.dark}" stroke-width="8"`}/><circle cx="${cx}" cy="96" r="5" fill="${x.mat === "gold" ? "#e6c470" : x.pal.dark}"/>`).join("") + P(x, "accent", "M-100-10H90V6H-100Z"),
  gift: (x) => P(x, "main", "M-80-20H80V100H-80Z") + P(x, "main", "M-92-52H92V-20H-92Z") + P(x, "accent", "M-14-52H14V100H-14Z") + P(x, "accent", "M0-52C-40-110-90-80-50-56Z") + P(x, "accent", "M0-52C40-110 90-80 50-56Z"),
  balloons: (x) => `<path d="M-60-20Q-20 60 0 130M10-40Q10 50 0 130M70-10Q30 60 0 130" ${x.stroke(2.4)}/>` +
    [[-60, -60, "main"], [10, -96, "accent"], [70, -50, "sun"]].map(([a, b, r]) => E(x, r as Role, a as number, b as number, 44, 54) + P(x, r as Role, `M${(a as number) - 7} ${(b as number) + 58}h14l-7-10z`) + (x.soft ? `<ellipse cx="${(a as number) - 16}" cy="${(b as number) - 22}" rx="9" ry="14" fill="#fff" opacity=".4"/>` : "")).join("") +
    P(x, "accent", "M0 130L-20 118L-18 142ZM0 130L20 118L18 142Z"),
  crown: (x) => P(x, "sun", "M-80 40L-90-50L-44-10L0-70L44-10L90-50L80 40Z") + P(x, "accent", "M-80 40H80V62H-80Z") + C(x, "light", 0, 0, 12) + C(x, "light", -46, 16, 9) + C(x, "light", 46, 16, 9) + C(x, "light", -90, -56, 9) + C(x, "light", 90, -56, 9) + C(x, "light", 0, -76, 9),
  bow: (x) => P(x, "accent", "M0 0C-40-60-110-50-100 0C-110 50-40 60 0 0Z") + P(x, "accent", "M0 0C40-60 110-50 100 0C110 50 40 60 0 0Z") + P(x, "accent", "M-8 6L-50 100L-24 90L-10 110ZM8 6L50 100L24 90L10 110Z") + C(x, "main", 0, 0, 18),
  shell: (x) => P(x, "light", "M0 70L-90-10Q-60-90 0-96Q60-90 90-10Z") + [-60, -30, 0, 30, 60].map((a) => `<path d="M0 66L${a * 1.3}-${Math.cos((a * Math.PI) / 180) * 90 + 4}" ${x.stroke(3, x.line ? x.pal.dark : darken(x.pal.light, 0.2))}/>`).join("") + P(x, "light", "M-24 70H24L16 88H-16Z") +
    C(x, "white", 74, 64, 18) + C(x, "white", 108, 58, 14) + (x.soft ? `<circle cx="68" cy="58" r="5" fill="#fff" opacity=".8"/>` : ""),
  mushroom: (x) => P(x, "light", "M-26 10Q-34 90-40 100H40Q34 90 26 10Z") + P(x, "accent", "M-100 20Q-90-90 0-96Q90-90 100 20Q0 40-100 20Z") + [[-50, -30, 14], [10, -60, 11], [52, -14, 12], [-10, -8, 9]].map(([a, b, r]) => C(x, "white", a, b, r)).join(""),
  cornflower: (x) => {
    let s = `<path d="M0 30V200" ${x.stroke(5, x.line ? x.pal.dark : x.pal.leaf)}/>` + E(x, "leaf", 24, 130, 8, 40, 30) + E(x, "leaf", -22, 170, 8, 36, -30);
    for (let i = 0; i < 9; i++) s += `<g transform="rotate(${-80 + i * 20})">${P(x, "main", "M0 0C-8-30-18-50-20-66l7 5 7-7 6 7 6-7 7 7 7-5C18-50 8-30 0 0Z")}</g>`;
    return s + E(x, "leaf", 0, 14, 14, 18) + C(x, "dark", 0, -8, 7);
  },
  rose: (x) => `<path d="M0 50V200" ${x.stroke(5, x.line ? x.pal.dark : x.pal.leaf)}/>` + E(x, "leaf", 26, 130, 12, 34, 40) + E(x, "leaf", -24, 160, 12, 30, -40) +
    P(x, "main", bumpy(70, 62, 9, 1.1)) + P(x, "accent", bumpy(48, 42, 7, 1.12, 0, -2)) + P(x, "main", bumpy(28, 24, 6, 1.1, 0, -4)) + `<path d="M-8-4Q0-16 10-4Q4 8-6 2" ${x.stroke(3, x.line ? x.pal.dark : darken(x.pal.main, 0.25))}/>`,
  tulip: (x) => `<path d="M0 30V200" ${x.stroke(5, x.line ? x.pal.dark : x.pal.leaf)}/>` + P(x, "leaf", "M0 190Q-60 120-40 60Q-10 120 0 190Z") + P(x, "leaf", "M0 190Q60 140 50 80Q14 130 0 190Z") +
    P(x, "main", "M-50-60Q-60 30 0 40Q60 30 50-60L26-30L0-74L-26-30Z") + P(x, "accent", "M0-74L26-30Q20 20 0 40Q-20 20-26-30Z"),
  daisy: (x) => { let s = `<path d="M0 20V200" ${x.stroke(5, x.line ? x.pal.dark : x.pal.leaf)}/>` + E(x, "leaf", 22, 120, 9, 34, 36); for (let i = 0; i < 12; i++) s += `<g transform="rotate(${i * 30})">${E(x, "white", 0, -48, 14, 40)}</g>`; return s + C(x, "sun", 0, 0, 24); },
  sprig: (x) => `<path d="M0 200Q-10 60 10-120" ${x.stroke(4, x.line ? x.pal.dark : darken(x.pal.leaf, 0.2))}/>` +
    Array.from({ length: 8 }, (_, i) => { const y = 170 - i * 38, side = i % 2 ? 1 : -1; return E(x, "leaf", side * 22 + (i * 1.5), y - 6, 13, 26, side * 50); }).join("") + E(x, "leaf", 10, -130, 12, 24),
  pampas: (x) => `<path d="M0 200Q-6 60-30-110M0 200Q10 80 40-90M0 200Q0 100 4-130" ${x.stroke(3, x.line ? x.pal.dark : darken(x.pal.light, 0.3))}/>` +
    [[-30, -110, -12], [40, -90, 14], [4, -130, 0]].map(([a, b, r]) => E(x, "light", a, b + 40, 22, 64, r) + E(x, "white", a, b + 30, 13, 46, r)).join(""),
  cotton: (x) => `<path d="M0 200Q0 80-40-60M0 120Q30 60 60-10M-20 60Q-60 30-80 0" ${x.stroke(5, x.line ? x.pal.dark : darken(x.pal.main, 0.3))}/>` +
    [[-40, -70, 32], [62, -20, 26], [-82, -6, 22]].map(([a, b, r]) => P(x, "main", `M${a - r} ${b + r * 0.6}l${r * 0.6}-${r * 0.2} ${r * 0.4} ${r * 0.4} ${r * 0.4}-${r * 0.4} ${r * 0.6} ${r * 0.2}Z`) + P(x, "white", bumpy(r, r * 0.8, 6, 1.25, a, b))).join(""),
  dandelion: (x) => `<path d="M0 200Q-6 80 0 0" ${x.stroke(4, x.line ? x.pal.dark : x.pal.leaf)}/>` +
    Array.from({ length: 22 }, (_, i) => { const a = (i / 22) * Math.PI * 2; return `<path d="M0 0L${f1(Math.cos(a) * 62)} ${f1(Math.sin(a) * 62)}" ${x.stroke(2, x.line ? x.pal.dark : darken(x.pal.light, 0.2))}/>` + C(x, "white", Math.cos(a) * 64, Math.sin(a) * 64, 6); }).join("") +
    [[90, -80], [120, -40], [70, -120]].map(([a, b]) => `<path d="M${a} ${b}l12 12" ${x.stroke(2)}/>` + C(x, "white", a, b, 5)).join("") + C(x, "main", 0, 0, 12),
  rattle: (x) => C(x, "main", 0, -50, 52) + P(x, "accent", "M-52-50A52 52 0 0 0 52-50Z") + `<path d="M0 0V110" ${x.stroke(14, x.line ? x.pal.dark : x.pal.accent)}/>` + C(x, "light", 0, 116, 18) + P(x, "sun", starPath(18, 0.5, 5, 0, -66)),
  mobile: (x) => `<path d="M0-170V-130M-110-90Q0-150 110-90M-110-90V-30M-40-118V0M40-118V-40M110-90V-10" ${x.stroke(3)}/>` +
    `<g transform="translate(-110 0) scale(.42)">${P(x, "white", CLOUD)}</g>` + P(x, "main", starPath(26, 0.5, 5, -40, 26)) + `<g transform="translate(40 -14) scale(.32)">${P(x, "white", crescent(95, 42, -26, 82))}</g>` + C(x, "accent", 110, 14, 20),
  bunting: (x) => `<path d="M-200-40Q0 40 200-40" ${x.stroke(3)}/>` + [-160, -100, -40, 20, 80, 140].map((a, i) => { const y = -40 + 80 * (1 - ((a + 30) / 200) ** 2) * 0.48; return P(x, (["main", "accent", "light"] as Role[])[i % 3], `M${a} ${f1(y)}L${a + 40} ${f1(y + 4)}L${a + 18} ${f1(y + 56)}Z`); }).join(""),
};

export const motifNames = Object.keys(motifs);

/** Place a motif: centre (cx,cy), scale (1 ≈ 200px tall), optional mirror and turn. */
export function put(x: Art, name: string, cx: number, cy: number, s: number, o: { flip?: boolean; rot?: number; fx?: boolean } = {}) {
  const t = `translate(${f1(cx)} ${f1(cy)})${o.rot ? ` rotate(${o.rot})` : ""} scale(${o.flip ? -s : s} ${s})`;
  return `<g transform="${t}" ${o.fx === false ? "" : x.fx}>${motifs[name](x)}</g>`;
}

// ───────────────────────── bands & frames ─────────────────────────
export function band(x: Art, kind: "clouds" | "waves" | "hills" | "grass" | "dunes", y: number) {
  const r = rng(x.seed * 7 + y);
  if (kind === "clouds") return [0, 1, 2, 3, 4].map((i) => put(x, "cloud", -40 + i * 270 + r() * 60, y + (i % 2) * 60 + r() * 30, 1.2 + r() * 0.5)).join("");
  if (kind === "waves") {
    return [0, 1, 2].map((i) => { const yy = y + i * 70; let d = `M-20 ${yy}`; for (let k = 0; k < 12; k++) d += `q${45} -${34 - i * 6} 90 0`; d += `V${ART_H + 20}H-20Z`; return `<g ${x.fx}>${P(x, i === 0 ? "light" : i === 1 ? "main" : "white", d)}</g>`; }).join("");
  }
  if (kind === "hills") return `<g ${x.fx}>${P(x, "leaf", `M-40 ${y + 60}Q260 ${y - 70} 560 ${y + 40}T1120 ${y}V${ART_H + 20}H-40Z`)}</g><g ${x.fx}>${P(x, "light", `M-40 ${y + 150}Q340 ${y + 40} 700 ${y + 140}T1120 ${y + 120}V${ART_H + 20}H-40Z`)}</g>`;
  if (kind === "dunes") return `<g ${x.fx}>${P(x, "sun", `M-40 ${y + 40}Q300 ${y - 80} 640 ${y + 30}T1120 ${y - 10}V${ART_H + 20}H-40Z`)}</g><g ${x.fx}>${P(x, "light", `M-40 ${y + 160}Q400 ${y + 40} 760 ${y + 150}T1120 ${y + 110}V${ART_H + 20}H-40Z`)}</g>`;
  // grass: tufts along a ground strip
  let tufts = "";
  for (let i = 0; i < 18; i++) { const gx = i * 64 + r() * 20; tufts += `<path d="M${f1(gx)} ${y + 40}q-6-40-20-56q20 14 24 40q4-36 20-52q-8 26-6 58Z" ${x.paint("leaf")}/>`; }
  return `<g ${x.fx}>${P(x, "leaf", `M-20 ${y + 40}H1100V${ART_H + 20}H-20Z`)}${tufts}</g>`;
}

/** A tall arch around the words: a paper cut-out ring, a stitched felt frame, or a fine line. */
export function archFrame(x: Art, top: number, bottom: number, inset = 110) {
  const w = ART_W - inset * 2, r = w / 2;
  const outer = `M${inset} ${bottom}V${top + r}A${r} ${r} 0 0 1 ${ART_W - inset} ${top + r}V${bottom}Z`;
  const t = 22, inner = `M${inset + t} ${bottom - t}V${top + r}A${r - t} ${r - t} 0 0 1 ${ART_W - inset - t} ${top + r}V${bottom - t}Z`;
  if (x.line || x.mat === "gold") return `<path d="${outer}" ${x.stroke(3, x.mat === "gold" ? "#e6c470" : x.pal.dark)}/><path d="${inner}" ${x.stroke(1.6, x.mat === "gold" ? "#e6c470" : x.pal.dark)} opacity=".6"/>`;
  return `<g ${x.fx}><path d="${outer}${inner}" fill-rule="evenodd" ${x.paint("light").replace(/stroke-dasharray="[^"]*"/, 'stroke-dasharray="7 6"')}/></g>`;
}

/** A ring of leaves (and the occasional bloom) around a point. */
export function wreath(x: Art, cx: number, cy: number, R: number, bloom: string) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" ${x.stroke(4, x.line ? x.pal.dark : darken(x.pal.leaf, 0.25))}/>`;
  const n = 26;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R, deg = (a * 180) / Math.PI;
    s += `<g ${x.fx}>${E(x, "leaf", px + Math.cos(a + 0.5) * 18, py + Math.sin(a + 0.5) * 18, 12, 28, deg + 40)}${E(x, "leaf", px + Math.cos(a - 0.5) * 18, py + Math.sin(a - 0.5) * 18, 12, 28, deg - 40)}</g>`;
  }
  for (const a of [-2.3, -0.9, 0.5, 2.0]) s += put(x, bloom, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 0.36, { rot: 0 });
  return s;
}

/** Scatter little things in the margins, leaving the middle clear. */
export function scatter(x: Art, names: string[], count: number, box: { top: number; bottom: number; left: number; right: number }) {
  const r = rng(x.seed * 31 + count);
  let s = "", placed = 0, tries = 0;
  const pts: [number, number][] = [];
  while (placed < count && tries++ < 600) {
    const px = 40 + r() * (ART_W - 80), py = 60 + r() * (ART_H - 120);
    if (px > box.left && px < box.right && py > box.top && py < box.bottom) continue;
    if (pts.some(([a, b]) => Math.hypot(a - px, b - py) < 120)) continue;
    pts.push([px, py]);
    s += put(x, names[placed % names.length], px, py, 0.22 + r() * 0.16, { rot: Math.round((r() - 0.5) * 40) });
    placed++;
  }
  return s;
}

/** The page: background, grain and art in one SVG string. */
export function svgPage(x: Art, art: string, w = ART_W, h = ART_H) {
  const p = x.pal;
  const wash = x.mat === "line" || x.mat === "watercolor" ? `<circle cx="${ART_W * 0.5}" cy="${ART_H * 0.48}" r="620" fill="url(#bg-wash)"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${ART_W} ${ART_H}"><defs>${materialDefs(x)}
<linearGradient id="bg-g" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="${p.bg2}"/></linearGradient>
<radialGradient id="bg-wash"><stop offset="0" stop-color="${p.light}" stop-opacity=".22"/><stop offset="1" stop-color="${p.light}" stop-opacity="0"/></radialGradient>${x.defs.join("")}</defs>
<rect width="${ART_W}" height="${ART_H}" fill="url(#bg-g)"/>${wash}<rect width="${ART_W}" height="${ART_H}" filter="url(#fx-grain)"/>${art}</svg>`;
}

// ───────────────────────── page layouts ─────────────────────────
export type ArtLayout = "corner" | "bottom" | "top" | "frame" | "arch" | "medallion" | "mobile" | "garden" | "scatter" | "vine" | "window";
export type Band = "clouds" | "waves" | "hills" | "grass" | "dunes";
export type ArtSpec = { material: Material; palette: ArtPalette; layout: ArtLayout; hero: string; comps: string[]; band: Band; mirror: boolean; seed: number };
/** Where the words go (in the 1080×1920 page). */
export type TextBox = { top: number; bottom: number; left: number; right: number };

const FLORA = new Set(["cornflower", "rose", "tulip", "daisy", "sprig", "pampas", "cotton", "dandelion", "palm"]);

export function compose(spec: ArtSpec): { svg: (w?: number, h?: number) => string; box: TextBox } {
  const x = new Art(spec.material, spec.palette, spec.seed);
  const r = rng(spec.seed * 13 + 5);
  const [a, b = "star", c = "sparkle"] = spec.comps;
  const H = spec.hero;
  let art = "";
  let box: TextBox = { top: 420, bottom: 1450, left: 120, right: 960 };
  const stars = (list: [number, number, number][], name = "star") => list.map(([px, py, s]) => put(x, name, px, py, s, { rot: Math.round((r() - 0.5) * 30) })).join("");
  switch (spec.layout) {
    case "corner":
      art = put(x, a, 250, 300, 1.55) + stars([[470, 160, 0.42], [400, 330, 0.34], [560, 360, 0.3], [990, 780, 0.34]], b) + put(x, c === "sparkle" ? "hotair" : c, 820, 330, 1.45) +
        put(x, "cloud", 120, 880, 1.05) + put(x, H, 280, 1640, 1.45) + put(x, "cloud", 860, 1760, 1.25);
      box = { top: 640, bottom: 1470, left: 140, right: 940 };
      break;
    case "bottom":
      art = (spec.band === "clouds" ? band(x, "clouds", 120) : "") + stars([[160, 120, 0.3], [330, 260, 0.24], [560, 110, 0.3], [740, 240, 0.26], [930, 140, 0.32], [90, 330, 0.2], [1000, 360, 0.22]], b) +
        put(x, a, 900, 420, 0.7) + put(x, H, 540, 1500, 2.4) + band(x, spec.band, 1690);
      box = { top: 420, bottom: 1240, left: 120, right: 960 };
      break;
    case "top":
      art = stars([[150, 160, 0.3], [930, 140, 0.34], [120, 560, 0.24], [960, 600, 0.26]], b) + put(x, H, 540, 380, 1.75) + put(x, a, 220, 1660, 0.75) + put(x, c, 880, 1680, 0.7) + band(x, spec.band, 1730);
      box = { top: 720, bottom: 1600, left: 120, right: 960 };
      break;
    case "frame": {
      const fl = (px: number, py: number, s: number, rot: number, name = H) => put(x, name, px, py, s, { rot });
      art = fl(90, 150, 1.05, 172) + fl(230, 70, 0.85, 186, a) + fl(990, 150, 1.05, 188) + fl(850, 70, 0.85, 174, a) +
        fl(90, 1740, 1.2, -8) + fl(220, 1820, 0.95, 10, a) + fl(990, 1740, 1.2, 8) + fl(860, 1820, 0.95, -10, a) + put(x, b === "star" ? "heart" : b, 540, 1690, 1.1);
      box = { top: 330, bottom: 1450, left: 150, right: 930 };
      break;
    }
    case "arch":
      art = archFrame(x, 260, 1660, 120) + stars([[540, 430, 0.3], [400, 520, 0.2], [680, 520, 0.22]], b) + put(x, FLORA.has(a) ? a : "sprig", 170, 700, 0.85, { rot: -12 }) + put(x, FLORA.has(a) ? a : "sprig", 910, 700, 0.85, { rot: 12, flip: true }) +
        put(x, H, 540, 1630, 1.35) + put(x, c, 230, 1760, 0.55) + put(x, c, 850, 1770, 0.5);
      box = { top: 620, bottom: 1420, left: 210, right: 870 };
      break;
    case "medallion":
      art = wreath(x, 540, 470, 250, FLORA.has(a) ? a : "rose") + put(x, H, 540, 480, 1.05) + put(x, b, 160, 1760, 0.6) + put(x, c, 920, 1770, 0.6) + stars([[140, 900, 0.22], [950, 1000, 0.2], [120, 1400, 0.2], [960, 1500, 0.22]], "sparkle");
      box = { top: 800, bottom: 1680, left: 130, right: 950 };
      break;
    case "mobile":
      art = `<g transform="translate(540 330) scale(2.15)">${motifs.mobile(x)}</g>`.replace("<g ", `<g ${x.fx} `) + put(x, H, 540, 1620, 1.3) + band(x, "clouds", 1760) + stars([[150, 700, 0.24], [940, 760, 0.26]], b);
      box = { top: 700, bottom: 1480, left: 130, right: 950 };
      break;
    case "garden":
      art = `<g transform="translate(540 120) scale(2.7)" ${x.fx}>${motifs.bunting(x)}</g>` + band(x, spec.band === "clouds" ? "grass" : spec.band, 1700) + put(x, H, 300, 1600, 1.3) + put(x, a, 760, 1660, 0.85) + put(x, a, 920, 1690, 0.7, { rot: 8 }) + put(x, b, 960, 1380, 0.4);
      box = { top: 380, bottom: 1440, left: 130, right: 950 };
      break;
    case "scatter":
      art = scatter(x, [b, "heart", "sparkle", "star", "cloud", "moon"].filter((v, i, l) => l.indexOf(v) === i), 26, { top: 260, bottom: 1500, left: 150, right: 930 }) + put(x, H, 540, 1700, 1.15);
      box = { top: 300, bottom: 1460, left: 160, right: 920 };
      break;
    case "vine": {
      let v = `<path d="M985 -20C930 300 1040 600 975 960S940 1600 990 1960" ${x.stroke(4, x.line ? x.pal.dark : darken(x.pal.leaf, 0.25))}/>`;
      for (let i = 0; i < 9; i++) v += put(x, i % 3 === 1 ? (FLORA.has(a) ? a : "sprig") : "sprig", 975 + (i % 2 ? -22 : 18), 80 + i * 205, 0.62, { rot: i % 2 ? -24 : 22, flip: i % 2 === 1 });
      art = v + put(x, H, 260, 1640, 1.4) + stars([[140, 200, 0.26], [300, 120, 0.2]], b);
      box = { top: 320, bottom: 1440, left: 90, right: 860 };
      break;
    }
    case "window":
      art = `<g ${x.fx}>${C(x, "light", 540, 560, 330)}</g>` + stars([[140, 220, 0.3], [940, 180, 0.34], [110, 800, 0.22], [970, 860, 0.24], [300, 120, 0.2]], b) + put(x, H, 540, 640, 1.65) + put(x, a, 210, 1760, 0.6) + put(x, a, 870, 1770, 0.6, { flip: true });
      box = { top: 1000, bottom: 1700, left: 130, right: 950 };
      break;
  }
  if (spec.mirror && (spec.layout === "corner" || spec.layout === "vine")) {
    art = `<g transform="translate(${ART_W} 0) scale(-1 1)">${art}</g>`;
    box = { ...box, left: ART_W - box.right, right: ART_W - box.left };
  }
  return { svg: (w = ART_W, h = ART_H) => svgPage(x, art, w, h), box };
}
