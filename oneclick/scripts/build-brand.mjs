// Generates the One Click Digital Hub logo system as editable, outlined SVG files.
// Run: node scripts/build-brand.mjs
// The wordmark is converted to vector outlines so the files render identically
// everywhere (no font dependency). Source font: Geist SemiBold (SIL OFL 1.1).
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const OUT = path.resolve("public/brand");
fs.mkdirSync(OUT, { recursive: true });

export const COLORS = {
  ink: "#121826",
  oasis: "#0C6B66",
  saffron: "#F0A030",
  paper: "#F5F7F6",
  night: "#0C1014",
  oasisBright: "#3FB5AC",
  white: "#FCFDFC",
};

// The mark: one continuous stroke. A check (completion) that keeps moving and
// becomes an open orbit (the "O" of One Click, flow, connection). The saffron
// dot sits in the opening: the single click that closes the loop.
// Geometry lives on a 64 x 64 grid.
const MARK_PATH = "M20.5 32.5 L28.5 40.5 L47.56 16.44 A22 22 0 1 0 53.25 37.69";
const DOT = { cx: 53.25, cy: 26.31, r: 4.3 };
const STROKE = 6.6;

function markGroup({ stroke, dot }) {
  return `<path d="${MARK_PATH}" fill="none" stroke="${stroke}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${DOT.cx}" cy="${DOT.cy}" r="${DOT.r}" fill="${dot}"/>`;
}

function svg(w, h, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}">
  <title>${title}</title>
  ${body}
</svg>
`;
}

const font = opentype.parse(
  fs.readFileSync("node_modules/@fontsource/geist/files/geist-latin-600-normal.woff").buffer
);

function serialize(cmds) {
  const n = (v) => {
    if (!Number.isFinite(v)) throw new Error("Non-finite coordinate in glyph outline");
    return +v.toFixed(2);
  };
  return cmds
    .map((c) => {
      if (c.type === "M" || c.type === "L") return `${c.type}${n(c.x)} ${n(c.y)}`;
      if (c.type === "Q") return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
      if (c.type === "C") return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
      return "Z";
    })
    .join("");
}

function wordmarkPath(text, x, baseline, size, tracking) {
  // Lay out glyph by glyph to apply tight tracking (brand: -0.02em).
  let cursor = x;
  const parts = [];
  const glyphs = font.stringToGlyphs(text);
  const scale = size / font.unitsPerEm;
  glyphs.forEach((g, i) => {
    const p = g.getPath(cursor, baseline, size);
    parts.push(serialize(p.commands));
    let adv = g.advanceWidth * scale;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * scale;
    cursor += adv + tracking * size;
  });
  return { d: parts.join(" "), width: cursor - x };
}

const variants = {
  light: { stroke: COLORS.oasis, dot: COLORS.saffron, text: COLORS.ink, bg: null },
  dark: { stroke: COLORS.oasisBright, dot: COLORS.saffron, text: COLORS.white, bg: null },
  mono: { stroke: COLORS.ink, dot: COLORS.ink, text: COLORS.ink, bg: null },
  "mono-white": { stroke: COLORS.white, dot: COLORS.white, text: COLORS.white, bg: null },
};

const NAME = "One Click Digital Hub";
const muted = { light: "#5B6573", dark: "#96A19D", mono: COLORS.ink, "mono-white": COLORS.white };

/** Two-line wordmark: "One Click" over letter-spaced "DIGITAL HUB", left-aligned or centered. */
function lockupText(x, top, big, color, sub, align = "left") {
  const main = wordmarkPath("One Click", 0, 0, big, -0.02);
  const small = big * 0.34;
  const subW = wordmarkPath("DIGITAL HUB", 0, 0, small, 0.24).width - small * 0.24;
  const width = Math.max(main.width, subW);
  const mx = align === "center" ? x + (width - main.width) / 2 : x;
  const sx = align === "center" ? x + (width - subW) / 2 : x + 1;
  const mainAt = wordmarkPath("One Click", mx, top + big * 0.74, big, -0.02);
  const subAt = wordmarkPath("DIGITAL HUB", sx, top + big * 0.74 + small * 1.75, small, 0.24);
  return { width, height: big * 0.74 + small * 1.75, svg: `<path d="${mainAt.d}" fill="${color}"/>\n  <path d="${subAt.d}" fill="${sub}"/>` };
}

for (const [name, v] of Object.entries(variants)) {
  const sub = muted[name];
  // Icon mark
  fs.writeFileSync(path.join(OUT, `oneclick-mark-${name}.svg`), svg(64, 64, markGroup(v), NAME));

  // Primary horizontal logo: mark + two-line wordmark, vertically centred on the mark
  const probe = lockupText(0, 0, 34, v.text, sub);
  const t = lockupText(78, (64 - probe.height) / 2 + 1, 34, v.text, sub);
  fs.writeFileSync(path.join(OUT, `oneclick-logo-${name}.svg`), svg(Math.ceil(78 + t.width + 4), 64, `${markGroup(v)}\n  ${t.svg}`, NAME));

  // Secondary stacked logo
  const ps = lockupText(0, 0, 30, v.text, sub, "center");
  const SW = Math.ceil(Math.max(ps.width, 64) + 16);
  const st = lockupText((SW - ps.width) / 2, 84, 30, v.text, sub, "center");
  fs.writeFileSync(
    path.join(OUT, `oneclick-logo-stacked-${name}.svg`),
    svg(SW, Math.ceil(84 + st.height + 10), `<g transform="translate(${(SW - 64) / 2} 8)">${markGroup(v)}</g>\n  ${st.svg}`, NAME)
  );

  // Wordmark only (two lines)
  const wt = lockupText(2, 4, 40, v.text, sub);
  fs.writeFileSync(path.join(OUT, `oneclick-wordmark-${name}.svg`), svg(Math.ceil(wt.width + 6), Math.ceil(wt.height + 10), wt.svg, NAME));

  // OCDH monogram wordmark for tight spaces
  const oc = wordmarkPath("OCDH", 2, 34, 40, 0.02);
  fs.writeFileSync(path.join(OUT, `ocdh-monogram-${name}.svg`), svg(Math.ceil(oc.width + 6), 44, `<path d="${oc.d}" fill="${v.text}"/>`, "OCDH"));
}

// App icon / social avatar: mark on a soft rounded tile.
function tile(bg, v, rx) {
  return `<rect width="512" height="512" rx="${rx}" fill="${bg}"/>
  <g transform="translate(64 64) scale(6)">${markGroup(v)}</g>`;
}
fs.writeFileSync(path.join(OUT, "oneclick-app-icon.svg"), svg(512, 512, tile(COLORS.paper, variants.light, 112), NAME));
fs.writeFileSync(path.join(OUT, "oneclick-app-icon-dark.svg"), svg(512, 512, tile(COLORS.night, variants.dark, 112), NAME));
// Instagram avatar is cropped to a circle by Instagram: full-bleed square, centered mark.
fs.writeFileSync(
  path.join(OUT, "oneclick-instagram-avatar.svg"),
  svg(1080, 1080, `<rect width="1080" height="1080" fill="${COLORS.oasis}"/>
  <g transform="translate(180 180) scale(11.25)">${markGroup({ stroke: COLORS.white, dot: COLORS.saffron })}</g>`, NAME)
);
// Favicon (tuned: slightly heavier stroke for 16px legibility)
fs.writeFileSync(
  path.resolve("src/app/icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>path{stroke:${COLORS.oasis}}@media (prefers-color-scheme:dark){path{stroke:${COLORS.oasisBright}}}</style><path d="${MARK_PATH}" fill="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${DOT.cx}" cy="${DOT.cy}" r="4.8" fill="${COLORS.saffron}"/></svg>\n`
);

console.log("Brand assets written to", OUT);
