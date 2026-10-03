/**
 * Bridal artwork ("Soft Modern"): warm white and nude tints, cocoa line motifs and twinkling
 * sparkles. The bride is drawn from behind (her face is never shown): hair bun, pearl buttons,
 * a full skirt and a veil that sways. Real photos can replace any tile (brides add their own).
 * Motion is CSS only and stops under reduced-motion.
 */
import type { CSSProperties } from "react";

export type Motif = "ring" | "rose" | "dress" | "arch" | "cake" | "envelope" | "suitcase" | "camera" | "home" | "henna" | "lips" | "comb" | "table" | "pearl" | "shoe" | "bag" | "abaya" | "doc" | "star";

const paths: Record<Motif, string> = {
  ring: "M50 64a18 18 0 1 0 0.1 0M41 47l9-10 9 10M44 47h12",
  rose: "M50 70V40M50 54c-8-2-12-8-10-14 6 0 10 4 10 14m0-6c8-2 12-8 10-14-6 0-10 4-10 14M50 40c-6 0-9-5-7-10 3 2 5 2 7 0 2 2 4 2 7 0 2 5-1 10-7 10",
  dress: "M44 24h12M45 24l-3 14 8 4 8-4-3-14M42 38l-10 40h36L58 38",
  arch: "M28 80V44a22 22 0 0 1 44 0v36M36 80V46a14 14 0 0 1 28 0v34M22 80h56",
  cake: "M34 78h32V62H34zM38 62V50h24v12M42 50V40h16v10M50 40v-6M48 32a2 2 0 1 0 4 0",
  envelope: "M26 36h48v34H26zM26 36l24 20 24-20M44 52l-18 18M56 52l18 18",
  suitcase: "M30 42h40v34H30zM42 42v-8h16v8M30 56h40M40 42v34M60 42v34",
  camera: "M28 40h44v32H28zM40 40l4-7h12l4 7M50 64a8 8 0 1 0 0.1 0",
  home: "M28 52l22-18 22 18M33 48v28h34V48M45 76V62h10v14",
  henna: "M42 78V48c0-4 6-4 6 0v-8c0-4 6-4 6 0v8c0-4 6-4 6 0v20c0 6-4 10-10 10H48c-4 0-6-2-6-6M50 56a3 3 0 1 0 0.1 0M46 66h8",
  lips: "M30 54c6-6 12-8 20-4 8-4 14-2 20 4-6 10-12 14-20 14S36 64 30 54zM30 54h40",
  comb: "M30 44h40v8H30zM34 52v16M40 52v16M46 52v16M52 52v16M58 52v16M64 52v16",
  table: "M26 52h48M34 52l-4 24M66 52l4 24M44 44a6 6 0 0 1 12 0M50 32v6",
  pearl: "M30 40c4 18 36 18 40 0M34 50a3 3 0 1 0 0.1 0M42 56a3 3 0 1 0 0.1 0M50 58a3 3 0 1 0 0.1 0M58 56a3 3 0 1 0 0.1 0M66 50a3 3 0 1 0 0.1 0",
  shoe: "M28 66c10 0 16-4 22-14l8-12c2 8 6 14 14 16v10H28zM62 56v20",
  bag: "M30 50h40l-4 26H34zM40 50c0-12 20-12 20 0",
  abaya: "M42 26h16l4 10 12 42H26l12-42zM50 26v52",
  doc: "M34 26h24l10 10v42H34zM58 26v10h10M40 50h20M40 58h20M40 66h12",
  star: "M50 28l5 15 15 5-15 5-5 15-5-15-15-5 15-5z",
};

const palettes = [
  ["#fbf6f3", "#f1e4de"], // nude
  ["#fbf8f5", "#efe6dc"], // linen
  ["#faf6f6", "#ece2e2"], // pearl
  ["#fcf4f1", "#f2ddd6"], // blush
  ["#f8f5f2", "#e8e0d8"], // sand
  ["#fdf8f5", "#f4e7df"], // silk
];

/** A 4-point sparkle centered on (x, y). */
export const sparklePath = (x: number, y: number, r: number) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

function Twinkle({ x, y, r, delay = 0, fill = "#d9b8a8" }: { x: number; y: number; r: number; delay?: number; fill?: string }) {
  return <path d={sparklePath(x, y, r)} fill={fill} className="bj-twinkle" style={{ animationDelay: `${delay}s` }} />;
}

export function ArtTile({ motif, tone = 0, className = "", label }: { motif: Motif; tone?: number; className?: string; label?: string }) {
  const [a, b] = palettes[((tone % palettes.length) + palettes.length) % palettes.length];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `radial-gradient(120% 90% at 30% 10%, ${a}, ${b})` }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto h-[72%] w-[72%]" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="50" cy="54" r="33" fill="#ffffff" fillOpacity=".6" />
        <path d={paths[motif]} stroke="#9a6b60" strokeWidth="1.7" />
        <Twinkle x={80} y={24} r={5} delay={-(tone % 4) * 0.7} />
        <Twinkle x={22} y={78} r={3} delay={-(tone % 3) * 0.9 - 1.2} fill="#e6cfc5" />
      </svg>
    </div>
  );
}

/** A small divider: hairline, sparkle, hairline. */
export function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 14" className={`h-3.5 w-28 ${className}`} fill="none" aria-hidden="true">
      <path d="M2 7h46M72 7h46" stroke="#d9c2b8" strokeWidth="1" strokeLinecap="round" />
      <Twinkle x={60} y={7} r={6} fill="#c9a49a" />
    </svg>
  );
}

/** A loose field of twinkling sparkles to lay over a card (decorative). */
export function Sparkles({ className = "", count = 9 }: { className?: string; count?: number }) {
  const spots = [[12, 18, 5], [84, 12, 7], [70, 40, 4], [92, 64, 5], [26, 70, 4], [52, 16, 3], [8, 48, 3], [60, 82, 5], [38, 34, 3], [78, 88, 3]];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`pointer-events-none ${className}`} aria-hidden="true">
      {spots.slice(0, count).map(([x, y, r], i) => (
        <Twinkle key={i} x={x} y={y} r={r} delay={-i * 0.45} fill={i % 3 ? "#dcbfb2" : "#ffffff"} />
      ))}
    </svg>
  );
}

/** Tiny hearts and sparkles drifting up (decorative). */
export function Floaters({ className = "", count = 6 }: { className?: string; count?: number }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {Array.from({ length: count }, (_, i) => {
        const style: CSSProperties = { insetInlineStart: `${8 + ((i * 37) % 84)}%`, bottom: `${(i * 13) % 30}%`, animationDelay: `${-i * 1.15}s`, animationDuration: `${6 + (i % 3)}s` };
        return (
          <span key={i} className="bj-rise absolute block opacity-0" style={style}>
            {i % 2 ? (
              <svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z" fill="#e7c6ba" /></svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24"><path d={sparklePath(12, 12, 11)} fill="#d6b4a6" /></svg>
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Rose petals drifting down: the celebration effect (reduced motion: nothing). */
export function Petals({ count = 18 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="bj-petals absolute inset-0 overflow-visible">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="bj-petal absolute top-0 block h-3 w-2.5 rounded-[60%_10%_60%_10%]"
          style={{ insetInlineStart: `${(i * 53) % 100}%`, background: i % 3 === 0 ? "#ecd3ca" : i % 3 === 1 ? "#dfbcae" : "#f5e6e0", animationDelay: `${(i % 6) * 0.18}s`, animationDuration: `${2.2 + (i % 5) * 0.35}s` }}
        />
      ))}
    </div>
  );
}

/**
 * The bride, seen from behind so her face never shows: a soft arch, her hair in a bun with a
 * pearl comb, an off-shoulder gown with pearl buttons down the back, a small bouquet at her side
 * and a long veil that sways. `arch={false}` drops the backdrop for use inside busy cards.
 */
export function BrideArt({ className = "", arch = true, sparkles = true }: { className?: string; arch?: boolean; sparkles?: boolean }) {
  const skin = "#e9c6b5";
  const hair = "#7a5548";
  return (
    <svg viewBox="0 0 300 400" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bj-b-skirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3e9e4" />
        </linearGradient>
        <linearGradient id="bj-b-veil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".45" />
        </linearGradient>
        <radialGradient id="bj-b-glow" cx=".5" cy=".4" r=".55">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {arch && (
        <>
          <path d="M46 396V172a104 104 0 0 1 208 0v224z" fill="#f3e8e3" />
          <path d="M60 396V176a90 90 0 0 1 180 0v220" stroke="#e3cfc6" strokeWidth="1" />
          <circle cx="150" cy="190" r="150" fill="url(#bj-b-glow)" opacity=".8" />
        </>
      )}
      <ellipse cx="150" cy="390" rx="112" ry="7" fill="#e3d0c8" opacity=".55" />

      {/* veil, back layer */}
      <g className="bj-sway">
        <path d="M150 70C116 124 70 250 34 392h232C230 250 184 124 150 70z" fill="#ffffff" opacity=".5" />
      </g>

      {/* skirt */}
      <path d="M124 206c16 6 36 6 52 0 24 54 56 114 76 168-52 18-152 18-204 0 20-54 52-114 76-168z" fill="url(#bj-b-skirt)" stroke="#e7dad3" strokeWidth="1.2" />
      <path d="M140 214c-10 66-28 116-40 166M160 214c8 66 26 116 38 168M150 214v172" stroke="#ecdfd9" strokeWidth="1.1" strokeLinecap="round" />

      {/* arms */}
      <path d="M110 152c-10 20-13 44-9 70l10 1c0-22 3-44 9-62z" fill={skin} />
      <path d="M190 152c10 20 13 44 9 70l-10 1c0-22-3-44-9-62z" fill={skin} />

      {/* bouquet at her side */}
      <g>
        <path d="M200 230l14-6M200 230l10 6" stroke="#9fae92" strokeWidth="2" strokeLinecap="round" />
        <circle cx="198" cy="222" r="7" fill="#efd5cb" />
        <circle cx="208" cy="230" r="6" fill="#fbf1ec" stroke="#e7d2c9" />
        <circle cx="193" cy="233" r="5.5" fill="#dcb3a5" />
        <circle cx="205" cy="217" r="4" fill="#fbf1ec" stroke="#e7d2c9" />
      </g>

      {/* shoulders and back */}
      <path d="M106 152c8-16 26-22 44-22s36 6 44 22l-6 8H112z" fill={skin} />
      <path d="M110 152c20-6 60-6 80 0l-14 56c-16 4-36 4-52 0z" fill="#ffffff" stroke="#e7dad3" strokeWidth="1.2" />
      <path d="M122 204c18 8 38 8 56 0l-1 9c-17 7-37 7-54 0z" fill="#ead3ca" />
      <path d="M150 208c-8-8-20-6-18 2 2 6 12 4 18-2zm0 0c8-8 20-6 18 2-2 6-12 4-18-2z" fill="#e2c3b8" />
      {[160, 170, 180, 190].map((y) => (
        <circle key={y} cx="150" cy={y} r="1.8" fill="#e2cfc6" />
      ))}

      {/* veil, front layer */}
      <g className="bj-sway" style={{ animationDelay: "-1.5s" }}>
        <path d="M140 98c-24 56-48 160-74 296 54 10 118 10 172 0-26-136-56-240-78-296z" fill="url(#bj-b-veil)" />
        <path d="M66 394c54 10 118 10 172 0" stroke="#e6d3ca" strokeWidth="1" strokeDasharray="1 4" strokeLinecap="round" />
      </g>

      {/* neck and hair from behind: no face */}
      <rect x="142" y="104" width="16" height="30" rx="7" fill={skin} />
      <ellipse cx="150" cy="86" rx="27" ry="30" fill={hair} />
      <path d="M131 76c7-12 25-15 37-4" stroke="#9b7365" strokeWidth="2.2" strokeLinecap="round" opacity=".7" />
      <path d="M136 70c-4 12-4 26 4 40M146 64c-3 16-2 32 3 50M156 64c3 16 2 32-3 50M165 70c4 12 4 26-4 40" stroke="#664539" strokeWidth="1.3" strokeLinecap="round" opacity=".55" />
      <circle cx="150" cy="62" r="15" fill="#6c4a3f" />
      <path d="M140 60c4-7 15-8 20 0M143 66c4 4 10 4 14 0" stroke="#8d685b" strokeWidth="1.6" strokeLinecap="round" />
      {[-60, -30, 0, 30, 60].map((a, i) => {
        const r = (a * Math.PI) / 180;
        return <circle key={i} cx={150 + Math.sin(r) * 19} cy={74 - Math.cos(r) * 3 + Math.abs(Math.sin(r)) * 4} r="2.4" fill="#ffffff" stroke="#e6d3ca" strokeWidth=".6" />;
      })}

      {sparkles && (
        <>
          <Twinkle x={64} y={128} r={9} delay={0} />
          <Twinkle x={238} y={96} r={11} delay={-0.9} fill="#ffffff" />
          <Twinkle x={252} y={250} r={7} delay={-1.6} />
          <Twinkle x={44} y={276} r={6} delay={-2.2} fill="#ffffff" />
          <Twinkle x={200} y={54} r={5} delay={-0.4} />
          <Twinkle x={98} y={58} r={4} delay={-1.2} />
        </>
      )}
    </svg>
  );
}

/**
 * The hero backdrop: a terrace with white arches opening onto soft mountains and the sea, with
 * blossoms climbing the columns. The bride stands on the "end" side (drawn separately).
 * The scene is drawn bride-on-the-left; flip it in LTR so she always faces the text.
 */
export function TerraceScene({ className = "" }: { className?: string }) {
  const arches = [0, 300, 600, 900];
  const blossom = (x: number, y: number, k: number) => (
    <g key={`${x}-${y}`}>
      {[[0, 0, 9], [12, -6, 7], [-10, 8, 6], [6, 12, 5], [-14, -8, 5]].map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={r} fill={(i + k) % 3 === 0 ? "#f1cfd0" : (i + k) % 3 === 1 ? "#fbeeee" : "#e8b9bd"} stroke="#ead6d4" strokeWidth=".6" />
      ))}
      <path d={`M${x - 18} ${y + 4}c-8-2-12-8-10-14 6 2 10 8 10 14zM${x + 16} ${y + 10}c8 0 12-6 12-12-6 0-10 6-12 12z`} fill="#b9c6ad" />
    </g>
  );
  return (
    <svg viewBox="0 0 1200 480" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bj-t-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3e9e4" />
          <stop offset=".6" stopColor="#f9f1ec" />
          <stop offset="1" stopColor="#fbf6f2" />
        </linearGradient>
        <linearGradient id="bj-t-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe3e4" />
          <stop offset="1" stopColor="#ece9e6" />
        </linearGradient>
        <radialGradient id="bj-t-sun" cx=".25" cy=".25" r=".5">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bj-t-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf7f4" />
          <stop offset="1" stopColor="#f3ebe6" />
        </linearGradient>
      </defs>
      <rect width="1200" height="480" fill="url(#bj-t-sky)" />
      <rect width="1200" height="480" fill="url(#bj-t-sun)" />
      <path d="M0 262l90-58 70 34 120-92 110 76 80-40 150 86 120-70 130 64 90-40 240 66v62H0z" fill="#e4d6d3" />
      <path d="M0 290l140-46 110 30 140-60 130 58 120-30 160 52 140-36 260 48v40H0z" fill="#d9c8c5" />
      <rect y="300" width="1200" height="34" fill="url(#bj-t-sea)" />
      <path d="M120 312h60M320 320h90M560 310h50M760 322h80M980 314h60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity=".8" />
      {/* balustrade */}
      <rect y="334" width="1200" height="146" fill="#f5ede8" />
      <rect y="330" width="1200" height="10" fill="#fbf7f4" stroke="#eadfd8" />
      {Array.from({ length: 40 }, (_, i) => (
        <path key={i} d={`M${i * 30 + 10} 340h10v6c-4 4-4 14 0 18v14h-10v-14c4-4 4-14 0-18z`} fill="#fbf7f4" stroke="#ebe0da" strokeWidth=".8" />
      ))}
      <rect y="378" width="1200" height="8" fill="#fbf7f4" stroke="#eadfd8" />
      {/* arcade with arched openings */}
      <path fillRule="evenodd" fill="url(#bj-t-wall)" d={`M0 0H1200V480H0Z${arches.map((x) => `M${x + 40} 480V190A110 110 0 0 1 ${x + 260} 190V480Z`).join("")}`} />
      {arches.map((x) => (
        <g key={x}>
          <path d={`M${x + 40} 480V190A110 110 0 0 1 ${x + 260} 190V480`} fill="none" stroke="#e8ddd6" strokeWidth="2" />
          <path d={`M${x + 28} 480V188A122 122 0 0 1 ${x + 272} 188V480`} fill="none" stroke="#efe6e1" strokeWidth="1" />
        </g>
      ))}
      {/* blossoms climbing the arches, heavier on the bride's side */}
      {[[40, 200], [52, 150], [74, 108], [108, 84], [28, 260], [36, 330], [262, 170], [252, 230], [280, 120], [330, 100], [344, 220], [550, 120], [560, 180]].map(([x, y], i) => blossom(x, y, i))}
      {[[880, 130], [900, 190], [1160, 160], [1170, 240]].map(([x, y], i) => (
        <g key={i} opacity=".55">{blossom(x, y, i)}</g>
      ))}
      {/* blossoms on the terrace floor */}
      {[[18, 430], [60, 452], [300, 446], [340, 464]].map(([x, y], i) => blossom(x, y, i + 2))}
    </svg>
  );
}

/** A line lotus: the Bridal Journey mark. */
export function Lotus({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 36" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M24 4c-5 6-6 15 0 26 6-11 5-20 0-26z" />
      <path d="M24 30c-7-2-12-8-12-17 6 1 10 5 12 10" />
      <path d="M24 30c7-2 12-8 12-17-6 1-10 5-12 10" />
      <path d="M24 30C15 31 7 27 3 19c6-1 11 1 15 5" />
      <path d="M24 30c9 1 17-3 21-11-6-1-11 1-15 5" />
      <path d="M12 33h24" />
    </svg>
  );
}

/** Lotus + "رحلة العروس" over "Bridal Journey". */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <Lotus className="h-8 w-10 text-bj-taupe transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-0.5 group-hover:scale-110" />
      <span className="leading-none">
        <span className="bj-glitter block text-[1.25rem] font-medium" lang="ar">رحلة العروس</span>
        <span className="bj-latin mt-1 block text-[0.82rem] italic text-bj-muted" lang="en" dir="ltr">Bridal Journey</span>
      </span>
    </span>
  );
}

/** Kept for the landing and welcome screens: the bride inside her arch, floating gently. */
export function HeroArt({ className = "" }: { className?: string }) {
  return <BrideArt className={className} />;
}

export const moodMotif: Record<string, Motif> = { dress: "dress", makeup: "lips", hair: "comb", kosha: "arch", flowers: "rose", tables: "table", invitation: "envelope", cake: "cake", photo: "camera", henna: "henna", home: "home", honeymoon: "suitcase" };
export const closetMotif: Record<string, Motif> = { wedding: "dress", milka: "dress", henna: "henna", shower: "rose", honeymoon: "suitcase", daily: "abaya", shoes: "shoe", bags: "bag", jewellery: "pearl", accessories: "pearl", beauty: "lips" };
