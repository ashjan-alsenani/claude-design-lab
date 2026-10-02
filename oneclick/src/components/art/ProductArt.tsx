import type { Hue } from "@/content/types";
import { hueVar } from "@/lib/hues";
import { Clicky } from "@/components/brand/Clicky";

/**
 * Original spot illustrations, one per product family. Flat, rounded, colorful shapes in the
 * brand palette; a product-colored Clicky peeks in. Decorative (aria-hidden).
 */
export function ProductArt({ hue, className = "", clicky = true }: { hue: Hue; className?: string; clicky?: boolean }) {
  const c = hueVar(hue);
  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 140" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* soft blob backdrop */}
        <path d="M30 70 C20 30 70 10 110 18 C160 26 190 50 180 90 C170 128 110 136 70 124 C40 115 36 98 30 70 Z" fill={c} opacity=".16" />
        <circle cx="168" cy="26" r="6" fill="var(--oc-accent)" />
        <circle cx="26" cy="112" r="4" fill="var(--oc-coral)" />
        <path d="M150 116 l4 8 l8 4 l-8 4 l-4 8 l-4 -8 l-8 -4 l8 -4 z" fill="var(--oc-lilac)" transform="scale(.7) translate(64 40)" />
        {scenes[hue](c)}
      </svg>
      {clicky && (
        <div className="absolute bottom-[4%] end-[6%] w-[24%]">
          <Clicky size={100} color={c} mood={moods[hue]} style={{ width: "100%", height: "auto" }} />
        </div>
      )}
    </div>
  );
}

const moods: Record<Hue, "happy" | "love" | "wink" | "celebrate" | "think"> = {
  bride: "love",
  grocery: "happy",
  planner: "wink",
  fit: "celebrate",
  budget: "happy",
  study: "think",
  travel: "wink",
  brand: "celebrate",
};

const ink = "var(--oc-ink)";
const paper = "var(--oc-surface-raised)";

const scenes: Record<Hue, (c: string) => React.ReactNode> = {
  bride: (c) => (
    <g>
      {/* ring */}
      <circle cx="78" cy="84" r="26" fill="none" stroke="var(--oc-accent)" strokeWidth="9" />
      <path d="M66 52 L78 38 L90 52 L78 62 Z" fill="var(--oc-sky)" stroke={paper} strokeWidth="3" strokeLinejoin="round" />
      {/* heart */}
      <path d="M128 66 C104 50 112 28 128 38 C144 28 152 50 128 66 Z" fill={c} />
      {/* checklist card */}
      <rect x="112" y="76" width="40" height="34" rx="8" fill={paper} />
      <path d="M118 88 l4 4 l7 -8" stroke={c} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M134 88 h12 M118 100 h28" stroke="var(--oc-line-strong)" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ),
  grocery: (c) => (
    <g>
      {/* basket */}
      <path d="M50 70 Q90 30 130 70" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="74" cy="60" r="12" fill="var(--oc-coral)" />
      <path d="M74 48 q4 -8 10 -8" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M96 62 L112 34" stroke="var(--oc-hue-fit)" strokeWidth="10" strokeLinecap="round" />
      <path d="M112 34 l6 -8 M112 34 l9 -2" stroke={c} strokeWidth="4" strokeLinecap="round" />
      <path d="M40 70 H140 L130 112 Q128 118 122 118 H58 Q52 118 50 112 Z" fill={c} />
      <path d="M62 80 V108 M80 80 V108 M98 80 V108 M116 80 V108" stroke={paper} strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
  planner: (c) => (
    <g>
      <rect x="44" y="30" width="96" height="84" rx="14" fill={paper} />
      <path d="M44 44 Q44 30 58 30 H126 Q140 30 140 44 V52 H44 Z" fill={c} />
      <path d="M66 22 V38 M118 22 V38" stroke={ink} strokeWidth="5" strokeLinecap="round" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((k) => (
          <rect key={`${r}${k}`} x={56 + k * 20} y={62 + r * 16} width="12" height="10" rx="3" fill={r === 1 && k === 2 ? "var(--oc-accent)" : "var(--oc-line)"} />
        ))
      )}
      <circle cx="146" cy="96" r="18" fill="var(--oc-lilac)" />
      <path d="M146 86 V96 L153 101" stroke={paper} strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>
  ),
  fit: (c) => (
    <g>
      <rect x="40" y="62" width="100" height="10" rx="5" fill={ink} />
      <rect x="44" y="44" width="16" height="46" rx="6" fill={c} />
      <rect x="120" y="44" width="16" height="46" rx="6" fill={c} />
      <rect x="30" y="52" width="12" height="30" rx="5" fill="var(--oc-coral)" />
      <rect x="138" y="52" width="12" height="30" rx="5" fill="var(--oc-coral)" />
      <path d="M40 110 H70 L78 96 L88 120 L98 100 H140" stroke="var(--oc-sky)" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  budget: (c) => (
    <g>
      <rect x="44" y="50" width="96" height="62" rx="14" fill={c} />
      <rect x="110" y="70" width="38" height="22" rx="10" fill={paper} />
      <circle cx="122" cy="81" r="5" fill="var(--oc-accent)" />
      <ellipse cx="72" cy="42" rx="16" ry="6" fill="var(--oc-accent)" />
      <ellipse cx="72" cy="34" rx="16" ry="6" fill="var(--oc-accent)" stroke={paper} strokeWidth="2" />
      <ellipse cx="96" cy="38" rx="12" ry="5" fill="var(--oc-accent)" stroke={paper} strokeWidth="2" />
    </g>
  ),
  study: (c) => (
    <g>
      <path d="M40 46 Q66 36 90 50 V112 Q66 98 40 108 Z" fill={c} />
      <path d="M140 46 Q114 36 90 50 V112 Q114 98 140 108 Z" fill="var(--oc-lilac)" />
      <path d="M52 62 Q66 58 78 64 M52 76 Q66 72 78 78 M102 64 Q114 58 128 62" stroke={paper} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M140 30 L150 20 L160 30 L150 76 Z" fill="var(--oc-accent)" transform="rotate(30 150 50)" />
    </g>
  ),
  travel: (c) => (
    <g>
      <rect x="56" y="54" width="70" height="60" rx="12" fill={c} />
      <path d="M78 54 V44 Q78 38 84 38 H98 Q104 38 104 44 V54" stroke={ink} strokeWidth="5" fill="none" />
      <path d="M72 72 H110 M72 90 H110" stroke={paper} strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" />
      <path d="M128 40 L160 30 L150 38 L162 48 L154 50 L144 44 L134 48 Z" fill="var(--oc-sky)" />
      <path d="M36 44 a10 10 0 0 1 18 -4 a8 8 0 0 1 10 10 h-28 z" fill={paper} />
    </g>
  ),
  brand: (c) => (
    <g>
      <rect x="48" y="30" width="84" height="88" rx="16" fill={paper} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="66" cy={54 + i * 22} r="8" fill={i < 2 ? c : "var(--oc-line)"} />
          {i < 2 && <path d={`M62 ${54 + i * 22} l3 3 l6 -6`} stroke={paper} strokeWidth="3" fill="none" strokeLinecap="round" />}
          <path d={`M82 ${54 + i * 22} H116`} stroke="var(--oc-line-strong)" strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}
    </g>
  ),
};
