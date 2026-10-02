// Generates the One Click logo system (Clicky) as outlined, editable SVG files.
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

function clicky({ face, dark = false }) {
  // Clicky v3: soft blob, big shiny eyes, rosy cheeks, check-mark smile, sunshine sparkle.
  const ink = "#1E1B3A";
  const eye = (cx) => `<ellipse cx="${cx}" cy="44" rx="8.5" ry="10" fill="#fff"/><circle cx="${cx + 1.5}" cy="46" r="5.5" fill="${ink}"/><circle cx="${cx + 3.5}" cy="43.5" r="2" fill="#fff"/>`;
  const id = "g" + face.replace("#", "");
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(face)}"/><stop offset="1" stop-color="${face}"/></linearGradient></defs>
  <path d="M50 6 C78 6 94 18 94 48 C94 80 78 94 50 94 C22 94 6 80 6 48 C6 18 22 6 50 6 Z" fill="url(#${id})"/>
  <path d="M20 30 Q22 16 38 13" stroke="#fff" stroke-opacity=".45" stroke-width="5" stroke-linecap="round" fill="none"/>
  ${eye(36)}${eye(64)}
  <g fill="#FF8FAB" opacity=".85"><ellipse cx="23" cy="63" rx="6.5" ry="4"/><ellipse cx="77" cy="63" rx="6.5" ry="4"/></g>
  <path d="M38 64 L47 72 L64 58" fill="none" stroke="${ink}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M84 2 L86.5 9.5 L94 12 L86.5 14.5 L84 22 L81.5 14.5 L74 12 L81.5 9.5 Z" fill="${dark ? "#FFCB57" : "#FFC23D"}"/>`;
}

function lighten(hex) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c) => Math.round(c + (255 - c) * 0.3);
  const r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
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

/** Wordmark: "One Click" in Rubik Bold. */
function lockupText(x, top, big, color, _sub, align = "left") {
  const w = textPath(bold, "One Click", 0, 0, big, -0.01).width;
  const mx = align === "center" ? x : x;
  const main = textPath(bold, "One Click", mx, top + big * 0.74, big, -0.01);
  return { width: w, height: big * 0.95, svg: `<path d="${main.d}" fill="${color}"/>` };
}

const NAME = "One Click";
const variants = {
  light: { face: COLORS.teal, text: COLORS.ink, sub: COLORS.muted },
  dark: { face: COLORS.tealDark, text: COLORS.white, sub: "#A7A1CC", dark: true },
  mono: { face: COLORS.ink, text: COLORS.ink, sub: COLORS.ink },
  "mono-white": { face: COLORS.white, text: COLORS.white, sub: COLORS.white },
};

for (const [name, v] of Object.entries(variants)) {
  const mark = clicky({ face: v.face, dark: v.dark });
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

}

// App icons: Clicky on a cream / night tile.
const tile = (bg, v) => `<rect width="512" height="512" rx="116" fill="${bg}"/><g transform="translate(56 56) scale(4)">${clicky(v)}</g>`;
fs.writeFileSync(path.join(OUT, "oneclick-app-icon.svg"), svg(512, 512, tile(COLORS.cream, { face: COLORS.teal }), NAME));
fs.writeFileSync(path.join(OUT, "oneclick-app-icon-dark.svg"), svg(512, 512, tile(COLORS.night, { face: COLORS.tealDark, dark: true }), NAME));
// Instagram avatar (circle crop safe): Clicky on sunshine.
fs.writeFileSync(
  path.join(OUT, "oneclick-instagram-avatar.svg"),
  svg(1080, 1080, `<rect width="1080" height="1080" fill="${COLORS.sun}"/><g transform="translate(190 190) scale(7)">${clicky({ face: COLORS.teal })}</g>`, NAME)
);
// Favicon: Clicky v3 simplified for 16-32px (bigger eyes, no sparkle), auto dark mode.
fs.writeFileSync(
  path.resolve("src/app/icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>.f{fill:${COLORS.teal}}@media (prefers-color-scheme:dark){.f{fill:${COLORS.tealDark}}}</style><path class="f" d="M50 3 C80 3 97 16 97 48 C97 82 80 97 50 97 C20 97 3 82 3 48 C3 16 20 3 50 3 Z"/><ellipse cx="34" cy="42" rx="11" ry="13" fill="#fff"/><ellipse cx="66" cy="42" rx="11" ry="13" fill="#fff"/><circle cx="36" cy="45" r="7" fill="#1E1B3A"/><circle cx="68" cy="45" r="7" fill="#1E1B3A"/><path d="M36 66 L47 76 L66 60" fill="none" stroke="#1E1B3A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`
);

console.log("Brand assets written to", OUT);
