/**
 * Bridal artwork ("Pearl & Rose") used where photos would go: pearl and blush tints, a
 * rose-gold line motif, a small rose sprig and a pearl. Real photos can replace any tile
 * (brides add their own). Motion is CSS only and stops under reduced-motion.
 */
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
  ["#fdf3f5", "#f6dde4"], // blush
  ["#fbf6f2", "#f1e1d8"], // champagne
  ["#fbf7f9", "#ece3ea"], // pearl
  ["#fcf1ef", "#f3d9d3"], // rose quartz
  ["#f9f3f6", "#ead9e3"], // mauve
  ["#fdf8f4", "#f4e5dc"], // silk
];
const ROSE_GOLD = "url(#bj-rg)";

/** Shared SVG gradient for rose-gold strokes (render once per svg). */
function RoseGoldDefs({ id = "bj-rg" }: { id?: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#b97968" />
        <stop offset=".5" stopColor="#dcae9c" />
        <stop offset="1" stopColor="#a8644f" />
      </linearGradient>
    </defs>
  );
}

const sprig = "M14 86c6-10 14-14 24-14M20 80c-6-2-8-8-4-12 4 2 6 6 4 12zm8-6c-2-6 2-10 6-10 0 4-2 8-6 10z";

export function ArtTile({ motif, tone = 0, className = "", label }: { motif: Motif; tone?: number; className?: string; label?: string }) {
  const [a, b] = palettes[((tone % palettes.length) + palettes.length) % palettes.length];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `radial-gradient(120% 90% at 30% 10%, ${a}, ${b})` }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto h-[74%] w-[74%]" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <RoseGoldDefs />
        <circle cx="50" cy="54" r="33" fill="#ffffff" fillOpacity=".55" />
        <circle cx="50" cy="54" r="36" stroke={ROSE_GOLD} strokeWidth=".6" strokeDasharray="1 3" />
        <path d={paths[motif]} stroke={ROSE_GOLD} strokeWidth="1.8" />
        <path d={sprig} stroke="#c9909b" strokeWidth="1.2" fill="#f2c9d2" fillOpacity=".6" />
        <circle cx="82" cy="22" r="3.2" fill="#ffffff" stroke="#e2c6bd" strokeWidth=".8" className="bj-sparkle" />
      </svg>
    </div>
  );
}

/** A small ornamental divider: rose-gold line, pearl, line. */
export function Flourish({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 14" className={`h-3.5 w-40 ${className}`} fill="none" aria-hidden="true">
      <RoseGoldDefs id="bj-rg-fl" />
      <path d="M2 7h58M100 7h58" stroke="url(#bj-rg-fl)" strokeWidth="1" />
      <path d="M66 7c4-5 10-5 14 0-4 5-10 5-14 0zm14 0c4-5 10-5 14 0-4 5-10 5-14 0z" stroke="url(#bj-rg-fl)" strokeWidth="1" />
      <circle cx="80" cy="7" r="2.6" fill="#fff" stroke="url(#bj-rg-fl)" strokeWidth=".8" />
    </svg>
  );
}

/** Rose garland for card corners (decorative). */
export function RoseCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} fill="none" aria-hidden="true">
      <RoseGoldDefs id="bj-rg-rc" />
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 112C30 70 70 40 152 20" stroke="url(#bj-rg-rc)" strokeWidth="1.2" />
        <path d="M44 74c-10-2-16-12-10-20 8 4 12 12 10 20zm22-16c-2-10 6-18 14-16 0 8-6 14-14 16zm32-14c4-10 14-12 20-6-4 6-12 8-20 6z" fill="#f4d2dc" stroke="#c9909b" strokeWidth="1" />
        <circle cx="118" cy="30" r="13" fill="#f7dbe2" stroke="#c98d9b" strokeWidth="1.1" />
        <path d="M118 22c-5 0-8 4-6 8 3-2 7-2 9 1 2-4 0-9-3-9zm-6 8c-2 5 2 9 7 9 4 0 7-4 5-8" stroke="#b5707f" strokeWidth="1" />
        <circle cx="72" cy="46" r="9" fill="#fbe7ed" stroke="#c98d9b" strokeWidth="1" />
        <path d="M72 40c-3 0-5 3-4 5 2-1 5-1 6 1 1-3-0-6-2-6z" stroke="#b5707f" strokeWidth=".9" />
        <circle cx="30" cy="96" r="3" fill="#fff" stroke="#e2c6bd" />
        <circle cx="140" cy="16" r="2.4" fill="#fff" stroke="#e2c6bd" />
        <circle cx="96" cy="50" r="2" fill="#fff" stroke="#e2c6bd" />
      </g>
    </svg>
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
          style={{ insetInlineStart: `${(i * 53) % 100}%`, background: i % 3 === 0 ? "#f4c9d3" : i % 3 === 1 ? "#ecb6c2" : "#f7dde3", animationDelay: `${(i % 6) * 0.18}s`, animationDuration: `${2.2 + (i % 5) * 0.35}s` }}
        />
      ))}
    </div>
  );
}

/** Hero: a floral arch framing a gown with a flowing veil, pearls and soft light. */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 480" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bj-h-arch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf2f5" />
          <stop offset="1" stopColor="#f5dfe5" />
        </linearGradient>
        <linearGradient id="bj-h-veil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fbe9ee" stopOpacity=".55" />
        </linearGradient>
        <linearGradient id="bj-h-rg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b97968" />
          <stop offset=".5" stopColor="#e2b8a6" />
          <stop offset="1" stopColor="#a8644f" />
        </linearGradient>
        <radialGradient id="bj-h-glow" cx=".5" cy=".35" r=".6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="210" r="190" fill="url(#bj-h-glow)" />
      <path d="M70 470V210a130 130 0 0 1 260 0v260z" fill="url(#bj-h-arch)" />
      <path d="M90 470V214a110 110 0 0 1 220 0v256" stroke="url(#bj-h-rg)" strokeWidth="1.6" />
      <path d="M104 470V218a96 96 0 0 1 192 0v252" stroke="url(#bj-h-rg)" strokeWidth=".7" strokeDasharray="1 5" />
      {/* gown */}
      <path d="M186 168c4 10 24 10 28 0l6 32c-12 6-28 6-40 0z" fill="#ffffff" stroke="#d9b3a6" strokeWidth="1.2" />
      <path d="M180 200c14 6 26 6 40 0l46 220c-44 22-88 22-132 0z" fill="#ffffff" stroke="#d9b3a6" strokeWidth="1.2" />
      <path d="M180 200c14 6 26 6 40 0" stroke="url(#bj-h-rg)" strokeWidth="2.2" />
      <path d="M170 260c20 10 40 10 60 0M160 320c26 12 54 12 80 0M150 380c32 14 68 14 100 0" stroke="#efd9d2" strokeWidth="1" />
      {/* veil */}
      <path d="M200 140c-30 30-70 120-96 300 40 18 70 22 96 20" fill="url(#bj-h-veil)" stroke="#ead0c7" strokeWidth="1" />
      <path d="M200 140c30 30 70 120 96 300-40 18-70 22-96 20" fill="url(#bj-h-veil)" stroke="#ead0c7" strokeWidth="1" opacity=".7" />
      <circle cx="200" cy="140" r="6" fill="#fff" stroke="url(#bj-h-rg)" strokeWidth="1.4" />
      {/* garland of roses */}
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M84 214c30-80 70-112 116-118 46 6 86 38 116 118" stroke="#c9909b" strokeWidth="1.1" />
        {[[96, 176, 15], [128, 128, 12], [168, 102, 13], [232, 102, 13], [272, 128, 12], [304, 176, 15], [200, 92, 16]].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={i % 2 ? "#f7dbe2" : "#fbe7ed"} stroke="#c98d9b" strokeWidth="1.1" />
            <path d={`M${x} ${y - r * 0.55}c-${r * 0.4} 0-${r * 0.6} ${r * 0.35}-${r * 0.45} ${r * 0.6} ${r * 0.25}-${r * 0.15} ${r * 0.55}-${r * 0.15} ${r * 0.7} ${r * 0.1} ${r * 0.15}-${r * 0.35}-${r * 0.05}-${r * 0.7}-${r * 0.25}-${r * 0.7}z`} stroke="#b5707f" strokeWidth="1" />
          </g>
        ))}
        <path d="M108 160c-12-4-18-14-12-22 10 4 14 14 12 22zm184 0c12-4 18-14 12-22-10 4-14 14-12 22zM148 112c-10-6-12-16-4-22 8 6 8 16 4 22zm104 0c10-6 12-16 4-22-8 6-8 16-4 22z" fill="#e9c9c0" stroke="#c49a8c" strokeWidth=".9" />
      </g>
      {/* pearls */}
      {[[60, 300], [342, 260], [330, 420], [74, 420], [48, 360]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 4 : 5.5} fill="#ffffff" stroke="#e2c6bd" strokeWidth="1" className="bj-sparkle" style={{ animationDelay: `${-i * 0.6}s` }} />
      ))}
    </svg>
  );
}

export const moodMotif: Record<string, Motif> = { dress: "dress", makeup: "lips", hair: "comb", kosha: "arch", flowers: "rose", tables: "table", invitation: "envelope", cake: "cake", photo: "camera", henna: "henna", home: "home", honeymoon: "suitcase" };
export const closetMotif: Record<string, Motif> = { wedding: "dress", milka: "dress", henna: "henna", shower: "rose", honeymoon: "suitcase", daily: "abaya", shoes: "shoe", bags: "bag", jewellery: "pearl", accessories: "pearl", beauty: "lips" };
