// Launch reels engine: every frame is a pure function of t (seconds), so render.cjs can step through it.
// Visual language = the OneClick site: cream background, Rubik, the flat Clicky, soft blobs, colored underline.
const INK = "#1E1B3A";
const BODY = "M50 6 C78 6 94 18 94 48 C94 80 78 94 50 94 C22 94 6 80 6 48 C6 18 22 6 50 6 Z";
const C = { bg: "#fff9f4", ink: INK, soft: "#46416c", brand: "#12b5a6", primary: "#0b7d73", sun: "#ffc23d", coral: "#ff6b6b", lilac: "#8b7cf6", pink: "#f0567a" };
const mix = (c, pct, base = C.bg) => `color-mix(in oklab, ${c} ${pct}%, ${base})`;

// easing
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, s, d) => clamp((t - s) / d);
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeIn = x => x * x * x;
const easeInOut = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x, s = 1.7) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const elastic = x => (x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (2 * Math.PI / 3)) + 1);
const lerp = (a, b, x) => a + (b - a) * x;
// window: 0 before s, rises over inD, holds, falls over outD ending at e
const win = (t, s, e, inD = .4, outD = .4) => Math.min(easeOut(prog(t, s, inD)), 1 - easeIn(prog(t, e - outD, outD)));

const eye = cx => `<ellipse cx="${cx}" cy="44" rx="8.5" ry="10" fill="#fff"/><circle cx="${cx + 1.5}" cy="46" r="5.5" fill="${INK}"/><circle cx="${cx + 3.5}" cy="43.5" r="2" fill="#fff"/>`;
const cheeks = `<g fill="#FF8FAB" opacity=".85"><ellipse cx="23" cy="63" rx="6.5" ry="4"/><ellipse cx="77" cy="63" rx="6.5" ry="4"/></g>`;
const smile = `<path d="M38 64 L47 72 L64 58" fill="none" stroke="${INK}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`;
const FACES = {
  happy: eye(36) + eye(64) + cheeks + smile,
  wink: eye(36) + `<path d="M56 46 Q64 38 72 46" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>` + cheeks + smile,
  love: `<path d="M36 54 C22 45 26 33 36 39 C46 33 50 45 36 54 Z" fill="#FF5A7A"/><path d="M64 54 C50 45 54 33 64 39 C74 33 78 45 64 54 Z" fill="#FF5A7A"/>` + cheeks + smile,
  celebrate: `<path d="M28 46 Q36 36 44 46" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M56 46 Q64 36 72 46" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/>` + cheeks + `<path d="M36 58 Q50 80 64 58 Z" fill="${INK}"/><path d="M42 66 Q50 72 58 66" fill="#FF8FAB"/>`,
};
const ACC = {
  spark: `<path d="M84 2 L86.5 9.5 L94 12 L86.5 14.5 L84 22 L81.5 14.5 L74 12 L81.5 9.5 Z" fill="#FFC23D"/>`,
  bulb: `<g stroke="#FFC23D" stroke-width="3" stroke-linecap="round"><path d="M84 -6 L84 -11"/><path d="M96 -1 L100 -5"/><path d="M72 -1 L68 -5"/></g><circle cx="84" cy="10" r="11" fill="#FFF6D6" stroke="${INK}" stroke-width="2.5"/><path d="M80 12 Q84 5 88 12" fill="none" stroke="#FFC23D" stroke-width="2.5" stroke-linecap="round"/><rect x="78.5" y="20" width="11" height="8" rx="2.5" fill="#B9B4C8" stroke="${INK}" stroke-width="2.5"/>`,
  shield: `<path d="M84 -4 L97 1 V11 C97 20 91 26 84 29 C77 26 71 20 71 11 V1 Z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M78.5 12 L82.5 16 L90 8" fill="none" stroke="#8B7CF6" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  heart: `<path d="M85 26 C70 16 73 0 85 7 C97 0 100 16 85 26 Z" fill="#FF3D6E" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`,
  chat: `<path d="M71 -2 H99 A5 5 0 0 1 104 3 V15 A5 5 0 0 1 99 20 H86 L79 27 L80 20 H71 A5 5 0 0 1 66 15 V3 A5 5 0 0 1 71 -2 Z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><g fill="#FF6B6B"><circle cx="77" cy="9" r="2.6"/><circle cx="85" cy="9" r="2.6"/><circle cx="93" cy="9" r="2.6"/></g>`,
};
let gidN = 0;
// A Clicky element with arms/legs; returns a div whose parts are animated by setClicky().
function makeClicky({ color = C.brand, mood = "wink", acc = "spark", size = 300, id }) {
  const g = "g" + (gidN++);
  const el = document.createElement("div");
  el.className = "clicky"; if (id) el.id = id;
  el.style.cssText = `position:absolute;width:${size}px;height:${size * 1.3}px;transform-origin:50% 100%;will-change:transform`;
  el.innerHTML = `<svg viewBox="-24 -20 148 150" width="100%" height="100%" style="overflow:visible">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="color-mix(in oklab, ${color} 72%, #ffffff)"/><stop offset="1" stop-color="color-mix(in oklab, ${color} 90%, #000000)"/></linearGradient></defs>
    <ellipse class="shadow" cx="50" cy="118" rx="30" ry="4.5" fill="${INK}" opacity=".12"/>
    <g class="all">
      <g stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"><path d="M38 92 L36 112"/><path d="M62 92 L64 112"/><path d="M28 114 L40 114"/><path d="M60 114 L72 114"/></g>
      <g class="armL" style="transform-origin:8px 58px"><path d="M8 58 Q-2 66 2 80" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/></g>
      <g class="armR" style="transform-origin:92px 58px"><path d="M92 58 Q104 46 100 32" stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none"/></g>
      <g class="body" style="transform-origin:50px 94px">
        <path d="${BODY}" fill="url(#${g})"/><path d="M20 30 Q22 16 38 13" stroke="#fff" stroke-opacity=".45" stroke-width="5" stroke-linecap="round" fill="none"/>
        <g class="face">${FACES[mood]}</g>${acc ? `<g class="acc">${ACC[acc]}</g>` : ""}
      </g>
    </g></svg>`;
  return el;
}
// pose: x,y = bottom-center position; s scale; rot; squash (1 = none); wave (rad on right arm); armsUp
function setClicky(el, { x, y, s = 1, rot = 0, squash = 1, wave = 0, armL = 0, op = 1, hop = 0 }) {
  const w = parseFloat(el.style.width), h = parseFloat(el.style.height);
  el.style.left = (x - w / 2) + "px"; el.style.top = (y - h) + "px";
  el.style.opacity = op;
  el.style.transform = `translateY(${-hop}px) rotate(${rot}deg) scale(${s * (2 - squash)}, ${s * squash})`;
  el.querySelector(".armR").style.transform = `rotate(${wave}rad)`;
  el.querySelector(".armL").style.transform = `rotate(${armL}rad)`;
  const sh = el.querySelector(".shadow"); sh.setAttribute("rx", 30 * clamp(1 - hop / 400, .4, 1));
}
function setFace(el, mood) { const f = el.querySelector(".face"); if (f.dataset.m !== mood) { f.innerHTML = FACES[mood]; f.dataset.m = mood; } }

// text block helper (Arabic, Rubik)
function txt(html, css) { const d = document.createElement("div"); d.className = "txt"; d.style.cssText = css; d.innerHTML = html; return d; }
// colored hand-drawn underline (as on the site's hero title)
const UL = c => `<svg class="ul" viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M3 14 C50 4 120 2 197 10" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
function setUL(root, x) { root.querySelectorAll(".ul path").forEach(p => p.setAttribute("stroke-dashoffset", 1 - x)); }

// confetti in the site's colors, deterministic
function seeded(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function makeConfetti(n, seed) {
  const R = seeded(seed), cols = [C.brand, C.sun, C.coral, C.lilac, C.pink, "#3D7BFF"];
  return Array.from({ length: n }, () => ({ a: -Math.PI / 2 + (R() - .5) * 2.4, v: 900 + R() * 1300, spin: (R() - .5) * 14, c: cols[Math.floor(R() * cols.length)], w: 14 + R() * 18, h: 10 + R() * 12, round: R() < .35, sway: R() * 6 }));
}
function drawConfetti(layer, pieces, t, t0, ox, oy) {
  const dt = t - t0;
  if (!layer.children.length) pieces.forEach(p => { const d = document.createElement("i"); d.style.cssText = `position:absolute;left:0;top:0;width:${p.w}px;height:${p.h}px;background:${p.c};border-radius:${p.round ? "50%" : "3px"}`; layer.appendChild(d); });
  [...layer.children].forEach((d, i) => {
    const p = pieces[i];
    if (dt < 0 || dt > 3.6) { d.style.opacity = 0; return; }
    const x = ox + Math.cos(p.a) * p.v * dt * .55 + Math.sin(dt * 3 + p.sway) * 30;
    const y = oy + Math.sin(p.a) * p.v * dt * .55 + 900 * dt * dt;
    d.style.opacity = clamp(1.4 - dt / 2.6);
    d.style.transform = `translate(${x}px,${y}px) rotate(${p.spin * dt}rad)`;
  });
}

// shared page skeleton: fonts, cream stage, soft site shapes
function stage() {
  document.head.insertAdjacentHTML("beforeend", `<style>
  @font-face{font-family:R;src:url(../../assets/rubik-arabic-v1.woff2)}@font-face{font-family:R;src:url(../../assets/rubik-latin-v1.woff2);unicode-range:U+0000-024F}
  html,body{margin:0;background:${C.bg}}#s{position:relative;width:1080px;height:1920px;overflow:hidden;background:${C.bg};font-family:R;color:${C.ink}}
  .txt{position:absolute;left:60px;right:60px;text-align:center;direction:rtl;will-change:transform,opacity}
  .h1{font-weight:700;letter-spacing:-.03em;line-height:1.08}
  .u{position:relative;display:inline-block}.u>span{position:relative;z-index:1}.ul{position:absolute;left:0;bottom:-.04em;width:100%;height:.32em;z-index:0}
  .blob{position:absolute;will-change:transform}
  img.chip{position:absolute;height:120px;will-change:transform}
  </style>`);
  const s = document.createElement("div"); s.id = "s"; document.body.appendChild(s); return s;
}
function blob(stageEl, css) { const b = document.createElement("div"); b.className = "blob"; b.style.cssText = css; stageEl.appendChild(b); return b; }
// end card: Clicky + wordmark + site + "link in bio"
function endCard(s) {
  const wrap = document.createElement("div"); wrap.style.cssText = "position:absolute;inset:0;opacity:0"; s.appendChild(wrap);
  const ck = makeClicky({ mood: "wink", size: 300 }); wrap.appendChild(ck);
  const t1 = txt(`<div style="font:700 150px/1 R;letter-spacing:-4px;direction:ltr">One Click</div><div style="font:500 52px/1.4 R;color:${C.soft};margin-top:14px">ون كليك</div>`, "top:1010px");
  const t2 = txt(`<div style="display:inline-block;padding:22px 52px;border-radius:999px;background:${C.primary};color:#fff;font:700 50px R;box-shadow:0 8px 0 #075e57">oneclick.computer</div><div style="font:500 44px R;color:${C.soft};margin-top:34px">الرابط في البايو</div>`, "top:1290px");
  wrap.append(t1, t2);
  return (t, t0) => {
    const k = prog(t, t0, .5); wrap.style.opacity = easeOut(k);
    const b = backOut(prog(t, t0, .7));
    setClicky(ck, { x: 540, y: 960, s: lerp(.4, 1, b), wave: Math.sin((t - t0) * 7) * .5 - .2, hop: Math.max(0, Math.sin((t - t0) * 5)) * 26 });
    t1.style.transform = `translateY(${(1 - easeOut(prog(t, t0 + .2, .5))) * 60}px)`; t1.style.opacity = easeOut(prog(t, t0 + .2, .5));
    t2.style.transform = `scale(${lerp(.7, 1, backOut(prog(t, t0 + .45, .5)))})`; t2.style.opacity = easeOut(prog(t, t0 + .45, .4));
  };
}

// Product chips exactly like the site's ProductParade (tinted pill + the product's own Clicky), drawn as HTML so they stay crisp and transparent.
const PRODUCTS = [
  ["مخطط رمضان", "#4F46E5", "happy"], ["قائمة المقاضي", "#16A34A", "happy"], ["مخطط الميزانية", "#CA8A04", "happy"], ["متابعة اللياقة", "#FF7A2F", "celebrate"],
  ["مخطط الدراسة", "#8B5CF6", "happy"], ["المخطط الأسبوعي", "#3D7BFF", "wink"], ["مخطط الوجبات", "#EF4444", "happy"], ["متابعة البيبي", "#60A5FA", "love"],
  ["ترتيب البيت", "#06B6D4", "happy"], ["مهام الأطفال", "#65A30D", "celebrate"], ["مخطط السفر", "#0EA5E9", "wink"], ["متابعة العادات", "#F59E0B", "wink"],
  ["مخطط العمرة", "#047857", "happy"], ["مخطط الهدايا", "#E11D48", "love"], ["مخطط المناسبات", "#D946EF", "celebrate"], ["منظّم المشاريع", "#475569", "wink"],
  ["قائمة ترتيب الأسبوع", "#14B8A6", "wink"], ["مفكّرة عروسة العُمر", "#F0567A", "love"],
];
function faceSvg(color, mood, size) {
  const g = "c" + (gidN++);
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="flex:none;overflow:visible"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="color-mix(in oklab, ${color} 72%, #ffffff)"/><stop offset="1" stop-color="color-mix(in oklab, ${color} 88%, #000000)"/></linearGradient></defs><path d="${BODY}" fill="url(#${g})"/><path d="M20 30 Q22 16 38 13" stroke="#fff" stroke-opacity=".45" stroke-width="5" stroke-linecap="round" fill="none"/>${FACES[mood]}</svg>`;
}
function makeChip([name, color, mood], scale = 1) {
  const d = document.createElement("div");
  d.className = "pchip";
  d.style.cssText = `position:absolute;left:0;top:0;display:flex;align-items:center;gap:${18 * scale}px;white-space:nowrap;direction:rtl;padding:${13 * scale}px ${34 * scale}px ${13 * scale}px ${14 * scale}px;border-radius:999px;border:${4 * scale}px solid ${mix(color, 45, "#fffefc")};background:${mix(color, 10, "#fffefc")};font:600 ${46 * scale}px R;color:${INK};box-shadow:0 2px 4px rgba(30,27,58,.05),0 18px 40px -20px rgba(30,27,58,.25);will-change:transform`;
  d.innerHTML = faceSvg(color, mood, 72 * scale) + `<span>${name}</span>`;
  return d;
}
