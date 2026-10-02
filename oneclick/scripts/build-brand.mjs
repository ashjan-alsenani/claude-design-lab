// Generates the One Click Digital Hub logo system (Clicky) as outlined, editable SVG files.
// Run: node scripts/build-brand.mjs   (then scripts/render-brand-png.mjs for PNGs)
// Wordmark text is converted to vector outlines (Rubik Bold/SemiBold, SIL OFL 1.1).
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const OUT = path.resolve("public/brand");
fs.mkdirSync(OUT, { recursive: true });

export const COLORS = {
  teal: "#12B5A6",
  tealDark: "#2DD4BF",
  sun: "#FFC23D",
  coral: "#FF6B6B",
  lilac: "#8B7CF6",
  ink: "#1E1B3A",
  muted: "#6C6790",
  cream: "#FFF9F4",
  night: "#15132B",
  white: "#FFFFFF",
};

/** Clicky: rounded face, check-mark smile, sunshine "click" dimple. 100x100 grid. */
function clicky({ face, features = "#fff", dimple = COLORS.sun, highlight = true }) {
  return `<rect x="8" y="8" width="84" height="84" rx="30" fill="${face}"/>
  ${highlight ? `<path d="M22 26 Q24 16 36 15" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round" fill="none"/>` : ""}
  <circle cx="36" cy="40" r="6" fill="${features}"/><circle cx="64" cy="40" r="6" fill="${features}"/>
  <path d="M32 60 L44 70 L70 56" fill="none" stroke="${features}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="76" cy="60" r="5" fill="${dimple}"/>`;
}

function svg(w, h, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}">
  <title>${title}</title>
  ${body}
</svg>
`;
}

const bold = opentype.parse(fs.readFileSync("node_modules/@fontsource/rubik/files/rubik-latin-700-normal.woff").buffer);
const semi = opentype.parse(fs.readFileSync("node_modules/@fontsource/rubik/files/rubik-latin-600-normal.woff").buffer);

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

function textPath(font, text, x, baseline, size, tracking) {
  let cursor = x;
  const parts = [];
  const glyphs = [...text].map((ch) => font.charToGlyph(ch)); // no shaping needed for Latin caps/lowercase
  const scale = size / font.unitsPerEm;
  glyphs.forEach((g, i) => {
    parts.push(serialize(g.getPath(cursor, baseline, size).commands));
    let adv = g.advanceWidth * scale;
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * scale;
    cursor += adv + tracking * size;
  });
  return { d: parts.join(" "), width: cursor - x - tracking * size };
}

/** "One Click" over letter-spaced "DIGITAL HUB". */
function lockupText(x, top, big, color, sub, align = "left") {
  const small = big * 0.33;
  const mainW = textPath(bold, "One Click", 0, 0, big, -0.01).width;
  const subW = textPath(semi, "DIGITAL HUB", 0, 0, small, 0.26).width;
  const width = Math.max(mainW, subW);
  const mx = align === "center" ? x + (width - mainW) / 2 : x;
  const sx = align === "center" ? x + (width - subW) / 2 : x + 1;
  const main = textPath(bold, "One Click", mx, top + big * 0.72, big, -0.01);
  const subP = textPath(semi, "DIGITAL HUB", sx, top + big * 0.72 + small * 1.8, small, 0.26);
  return { width, height: big * 0.72 + small * 1.8, svg: `<path d="${main.d}" fill="${color}"/>\n  <path d="${subP.d}" fill="${sub}"/>` };
}

const NAME = "One Click Digital Hub";
const variants = {
  light: { face: COLORS.teal, text: COLORS.ink, sub: COLORS.muted, features: "#fff", dimple: COLORS.sun },
  dark: { face: COLORS.tealDark, text: COLORS.white, sub: "#A7A1CC", features: COLORS.night, dimple: COLORS.sun },
  mono: { face: COLORS.ink, text: COLORS.ink, sub: COLORS.ink, features: "#fff", dimple: "#fff" },
  "mono-white": { face: COLORS.white, text: COLORS.white, sub: COLORS.white, features: COLORS.ink, dimple: COLORS.ink },
};

for (const [name, v] of Object.entries(variants)) {
  const mark = clicky({ face: v.face, features: v.features, dimple: v.dimple, highlight: !name.startsWith("mono") });
  fs.writeFileSync(path.join(OUT, `oneclick-mark-${name}.svg`), svg(100, 100, mark, NAME));

  // Primary horizontal lockup
  const probe = lockupText(0, 0, 52, v.text, v.sub);
  const t = lockupText(116, (100 - probe.height) / 2, 52, v.text, v.sub);
  fs.writeFileSync(path.join(OUT, `oneclick-logo-${name}.svg`), svg(Math.ceil(116 + t.width + 6), 100, `${mark}\n  ${t.svg}`, NAME));

  // Stacked lockup
  const ps = lockupText(0, 0, 44, v.text, v.sub, "center");
  const SW = Math.ceil(Math.max(ps.width, 100) + 20);
  const st = lockupText((SW - ps.width) / 2, 120, 44, v.text, v.sub, "center");
  fs.writeFileSync(
    path.join(OUT, `oneclick-logo-stacked-${name}.svg`),
    svg(SW, Math.ceil(120 + st.height + 12), `<g transform="translate(${(SW - 100) / 2} 6)">${mark}</g>\n  ${st.svg}`, NAME)
  );

  // Wordmark only
  const wt = lockupText(2, 4, 52, v.text, v.sub);
  fs.writeFileSync(path.join(OUT, `oneclick-wordmark-${name}.svg`), svg(Math.ceil(wt.width + 6), Math.ceil(wt.height + 12), wt.svg, NAME));

  // OCDH monogram wordmark
  const oc = textPath(bold, "OCDH", 2, 44, 52, 0.02);
  fs.writeFileSync(path.join(OUT, `ocdh-monogram-${name}.svg`), svg(Math.ceil(oc.width + 6), 56, `<path d="${oc.d}" fill="${v.text}"/>`, "OCDH"));
}

// App icons: Clicky on a cream / night tile.
const tile = (bg, v) => `<rect width="512" height="512" rx="116" fill="${bg}"/><g transform="translate(56 56) scale(4)">${clicky(v)}</g>`;
fs.writeFileSync(path.join(OUT, "oneclick-app-icon.svg"), svg(512, 512, tile(COLORS.cream, { face: COLORS.teal }), NAME));
fs.writeFileSync(path.join(OUT, "oneclick-app-icon-dark.svg"), svg(512, 512, tile(COLORS.night, { face: COLORS.tealDark, features: COLORS.night }), NAME));
// Instagram avatar (circle crop safe): Clicky on sunshine.
fs.writeFileSync(
  path.join(OUT, "oneclick-instagram-avatar.svg"),
  svg(1080, 1080, `<rect width="1080" height="1080" fill="${COLORS.sun}"/><g transform="translate(190 190) scale(7)">${clicky({ face: COLORS.teal, dimple: COLORS.coral })}</g>`, NAME)
);
// Favicon: Clicky face without highlight (crisper at 16px), auto dark mode.
fs.writeFileSync(
  path.resolve("src/app/icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>.f{fill:${COLORS.teal}}@media (prefers-color-scheme:dark){.f{fill:${COLORS.tealDark}}}</style><rect class="f" x="4" y="4" width="92" height="92" rx="32"/><circle cx="35" cy="40" r="8" fill="#fff"/><circle cx="65" cy="40" r="8" fill="#fff"/><path d="M30 60 L44 72 L72 56" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`
);

console.log("Brand assets written to", OUT);
