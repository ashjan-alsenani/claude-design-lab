/**
 * Editorial fine-line artwork used instead of stock photos: soft paper tones with a single
 * gold line motif. Light, crisp at any size, and never "cartoon".
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
  ["#f4ece0", "#efe2cf"], // champagne
  ["#f5e8e5", "#ecd6d2"], // blush
  ["#e9eee5", "#dbe4d6"], // sage
  ["#f8f4ec", "#eee6d8"], // ivory
  ["#efe8e2", "#e1d6cc"], // taupe
  ["#f3e3e4", "#e6cdcf"], // rose
  ["#f2ebde", "#e7dbc5"], // sand
  ["#eef0f1", "#e0e4e6"], // pearl
];

export function ArtTile({ motif, tone = 0, className = "", label }: { motif: Motif; tone?: number; className?: string; label?: string }) {
  const [a, b] = palettes[((tone % palettes.length) + palettes.length) % palettes.length];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(160deg, ${a}, ${b})` }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto h-[70%] w-[70%]" fill="none" stroke="#b8955a" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="50" cy="54" r="34" stroke="#ffffff" strokeOpacity=".55" strokeWidth="0.8" />
        <path d={paths[motif]} />
        <path d="M80 22l1.4 4 4 1.4-4 1.4-1.4 4-1.4-4-4-1.4 4-1.4z" fill="#d9bf8c" stroke="none" className="bj-sparkle" />
      </svg>
    </div>
  );
}

/** Large hero composition: an arch with roses, a sparkle and soft paper circles. */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 460" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bj-arch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6eee2" />
          <stop offset="1" stopColor="#efe2cf" />
        </linearGradient>
        <linearGradient id="bj-blush" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e7e3" />
          <stop offset="1" stopColor="#ecd5d0" />
        </linearGradient>
      </defs>
      <circle cx="300" cy="110" r="70" fill="url(#bj-blush)" opacity=".8" />
      <path d="M70 440V200a130 130 0 0 1 260 0v240z" fill="url(#bj-arch)" />
      <path d="M92 440V204a108 108 0 0 1 216 0v236" stroke="#b8955a" strokeWidth="1.2" />
      <path d="M120 440V210a80 80 0 0 1 160 0v230" stroke="#d9c39a" strokeWidth=".8" />
      <g stroke="#b8955a" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M86 214c-14-10-16-28-4-36 10 10 12 22 4 36zm0 0c14-4 26 2 26 16-14 0-22-6-26-16zM96 188c4-14 18-20 28-12-6 10-16 14-28 12z" />
        <path d="M314 214c14-10 16-28 4-36-10 10-12 22-4 36zm0 0c-14-4-26 2-26 16 14 0 22-6 26-16zM304 188c-4-14-18-20-28-12 6 10 16 14 28 12z" />
        <path d="M200 120c-12 0-20-8-18-18 6 4 12 4 18 0 6 4 12 4 18 0 2 10-6 18-18 18zm0 0v14M186 104c-8-6-6-16 2-18 4 6 4 12-2 18zm28 0c8-6 6-16-2-18-4 6-4 12 2 18z" />
        <path d="M172 360c10-34 46-34 56 0M180 360h40M196 330v-24l4-6 4 6v24" opacity=".75" />
      </g>
      <path d="M340 300l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#d9bf8c" className="bj-sparkle" />
      <path d="M58 140l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#d9bf8c" className="bj-sparkle" style={{ animationDelay: "-1.2s" }} />
      <circle cx="350" cy="380" r="24" fill="#e7ece3" />
      <circle cx="44" cy="300" r="14" fill="#f3e5e2" />
    </svg>
  );
}

export const moodMotif: Record<string, Motif> = { dress: "dress", makeup: "lips", hair: "comb", kosha: "arch", flowers: "rose", tables: "table", invitation: "envelope", cake: "cake", photo: "camera", henna: "henna", home: "home", honeymoon: "suitcase" };
export const closetMotif: Record<string, Motif> = { wedding: "dress", milka: "dress", henna: "henna", shower: "rose", honeymoon: "suitcase", daily: "abaya", shoes: "shoe", bags: "bag", jewellery: "pearl", accessories: "pearl", beauty: "lips" };
