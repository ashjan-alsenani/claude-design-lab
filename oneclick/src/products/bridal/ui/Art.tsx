import { Clicky } from "@/components/brand/Clicky";

/**
 * Colorful, friendly artwork used instead of stock photos: bright tints, a bold line motif
 * that gently bobs, and a twinkling sparkle. One Click style; motion respects reduced-motion.
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
  ["#ddf6f2", "#bfede6", "#0b9e91"], // teal
  ["#fff1cc", "#ffe09a", "#c98a00"], // sunshine
  ["#ffe4e6", "#ffc9cf", "#e5484d"], // coral
  ["#ece8ff", "#d9d1ff", "#7c6cf0"], // lilac
  ["#e0eeff", "#c7deff", "#3d7bff"], // sky
  ["#ffe3ee", "#ffc6dc", "#e0457b"], // pink
  ["#dff5e7", "#c2ebd2", "#1f9e57"], // green
  ["#ffebdd", "#ffd3b5", "#e07a2e"], // peach
];

export function ArtTile({ motif, tone = 0, className = "", label }: { motif: Motif; tone?: number; className?: string; label?: string }) {
  const [a, b, ink] = palettes[((tone % palettes.length) + palettes.length) % palettes.length];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(150deg, ${a}, ${b})` }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto h-[72%] w-[72%]" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 56 C12 30 40 14 62 20 C86 26 92 50 84 70 C76 90 46 92 30 84 C20 79 20 68 18 56 Z" fill="#ffffff" fillOpacity=".7" stroke="none" />
        <g className="art-bob">
          <path d={paths[motif]} />
        </g>
        <path d="M82 18l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" fill="#ffc23d" stroke="none" className="clicky-twinkle" />
        <circle cx="16" cy="84" r="3.5" fill={ink} fillOpacity=".5" stroke="none" className="art-bob-2" />
      </svg>
    </div>
  );
}

/** Joyful hero: Clicky in a colorful wedding arch with hearts, rings and sparkles. */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-[400/460] ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 460" className="absolute inset-0 h-full w-full" fill="none">
        <circle cx="310" cy="96" r="74" fill="#ffe09a" />
        <circle cx="62" cy="330" r="46" fill="#d9d1ff" />
        <circle cx="352" cy="372" r="34" fill="#ffc9cf" />
        <path d="M78 450V210a122 122 0 0 1 244 0v240z" fill="#bfede6" />
        <path d="M104 450V214a96 96 0 0 1 192 0v236" stroke="#12b5a6" strokeWidth="5" strokeLinecap="round" strokeDasharray="2 14" />
        <g strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M96 216c-16-10-18-30-4-38 12 10 14 24 4 38zm0 0c16-4 30 2 30 18-16 0-26-6-30-18z" fill="#ff8fab" stroke="#e0457b" />
          <path d="M304 216c16-10 18-30 4-38-12 10-14 24-4 38zm0 0c-16-4-30 2-30 18 16 0 26-6 30-18z" fill="#ffc23d" stroke="#c98a00" />
          <path d="M200 96c-14 0-22-9-20-20 7 5 13 5 20 0 7 5 13 5 20 0 2 11-6 20-20 20z" fill="#ff6b6b" stroke="#e5484d" />
        </g>
        <path d="M60 120c0-9 12-12 16-4 4-8 16-5 16 4 0 10-16 18-16 18s-16-8-16-18z" fill="#ff6b6b" className="art-bob" />
        <path d="M330 250c0-7 9-9 12-3 3-6 12-4 12 3 0 8-12 14-12 14s-12-6-12-14z" fill="#e0457b" className="art-bob-2" />
        <circle cx="70" cy="420" r="14" stroke="#7c6cf0" strokeWidth="5" />
        <circle cx="86" cy="420" r="14" stroke="#ffc23d" strokeWidth="5" />
        <path d="M352 168l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="#ffc23d" className="clicky-twinkle" />
        <path d="M44 210l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#12b5a6" className="clicky-twinkle" style={{ animationDelay: "-1s" }} />
      </svg>
      <div className="absolute left-1/2 top-[44%] w-[46%] -translate-x-1/2">
        <Clicky size={180} mood="love" body wave animate className="h-auto w-full" />
      </div>
    </div>
  );
}

export const moodMotif: Record<string, Motif> = { dress: "dress", makeup: "lips", hair: "comb", kosha: "arch", flowers: "rose", tables: "table", invitation: "envelope", cake: "cake", photo: "camera", henna: "henna", home: "home", honeymoon: "suitcase" };
export const closetMotif: Record<string, Motif> = { wedding: "dress", milka: "dress", henna: "henna", shower: "rose", honeymoon: "suitcase", daily: "abaya", shoes: "shoe", bags: "bag", jewellery: "pearl", accessories: "pearl", beauty: "lips" };
