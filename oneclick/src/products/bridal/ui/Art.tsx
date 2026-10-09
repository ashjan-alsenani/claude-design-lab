/**
 * Bridal artwork in the One Click style: line motifs on soft brand-hue tiles, the product mark and the
 * petal celebration. Motion is CSS only and stops under reduced-motion.
 */
import type { CSSProperties } from "react";
import { HeartIcon } from "@phosphor-icons/react";

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

// One Click's soft hues (bride pink first), with the matching deep line color.
const palettes = [
  ["#fde7ec", "#fbd0db", "#c8325a"], // bride
  ["#fff1cc", "#ffe29a", "#8a5a00"], // sunshine
  ["#ece9fe", "#d9d3fc", "#5b49c9"], // lilac
  ["#dcf5f1", "#bdeee6", "#0b7d73"], // teal
  ["#e0f0ff", "#c4e2ff", "#1f6fc2"], // sky
  ["#ffe3e3", "#ffc9c9", "#c23a3a"], // coral
];

/** A 4-point sparkle centered on (x, y). */
export const sparklePath = (x: number, y: number, r: number) => `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

function Twinkle({ x, y, r, delay = 0, fill = "#d9b8a8" }: { x: number; y: number; r: number; delay?: number; fill?: string }) {
  return <path d={sparklePath(x, y, r)} fill={fill} className="bj-twinkle" style={{ animationDelay: `${delay}s` }} />;
}

export function ArtTile({ motif, tone = 0, className = "", label }: { motif: Motif; tone?: number; className?: string; label?: string }) {
  const [a, b, ink] = palettes[((tone % palettes.length) + palettes.length) % palettes.length];
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: `linear-gradient(160deg, ${a}, ${b})` }} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto h-[72%] w-[72%]" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="50" cy="54" r="33" fill="#ffffff" fillOpacity=".75" />
        <path d={paths[motif]} stroke={ink} strokeWidth="2.2" />
        <Twinkle x={80} y={24} r={5} delay={-(tone % 4) * 0.7} fill="#ffc23d" />
        <Twinkle x={22} y={78} r={3} delay={-(tone % 3) * 0.9 - 1.2} fill="#f0567a" />
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

/** Product mark in the One Click style: the Bride-hue tile with a heart, the name, and "One Click". */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid size-10 place-items-center rounded-[12px] bg-[#f0567a] text-white shadow-[0_4px_0_-1px_#c8325a] transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-rotate-6 group-hover:scale-105">
        <HeartIcon size={22} weight="fill" />
      </span>
      <span className="leading-none">
        <span className="block text-[1.15rem] font-bold text-bj-ink">رحلة العروس</span>
        <span className="mt-1 block text-[0.78rem] font-medium text-bj-muted" lang="en" dir="ltr">Bridal Journey · One Click</span>
      </span>
    </span>
  );
}

export const moodMotif: Record<string, Motif> = { dress: "dress", makeup: "lips", hair: "comb", kosha: "arch", flowers: "rose", tables: "table", invitation: "envelope", cake: "cake", photo: "camera", henna: "henna", home: "home", honeymoon: "suitcase" };
export const closetMotif: Record<string, Motif> = { wedding: "dress", milka: "dress", henna: "henna", shower: "rose", honeymoon: "suitcase", daily: "abaya", shoes: "shoe", bags: "bag", jewellery: "pearl", accessories: "pearl", beauty: "lips" };
