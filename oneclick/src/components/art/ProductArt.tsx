import type { ArtId, Hue } from "@/content/types";
import { hueVar } from "@/lib/hues";
import { Clicky } from "@/components/brand/Clicky";

/**
 * Original spot illustrations, one per product family. Flat, rounded, colorful shapes in the
 * brand palette; a product-colored Clicky peeks in. Decorative (aria-hidden).
 */
export function ProductArt({ hue, art, className = "", clicky = true }: { hue: Hue; art?: ArtId; className?: string; clicky?: boolean }) {
  const c = hueVar(hue);
  const scene = art ?? hue;
  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 140" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* soft blob backdrop */}
        <path d="M30 70 C20 30 70 10 110 18 C160 26 190 50 180 90 C170 128 110 136 70 124 C40 115 36 98 30 70 Z" fill={c} opacity=".16" />
        <circle cx="168" cy="26" r="6" fill="var(--oc-accent)" className="art-bob-2" />
        <circle cx="26" cy="112" r="4" fill="var(--oc-coral)" className="art-bob" />
        <path d="M24 30 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" fill="var(--oc-lilac)" className="clicky-twinkle" />
        <path d="M176 104 l2.5 5.5 l5.5 2.5 l-5.5 2.5 l-2.5 5.5 l-2.5 -5.5 l-5.5 -2.5 l5.5 -2.5 z" fill="var(--oc-accent)" className="clicky-twinkle" style={{ animationDelay: "-1.2s" }} />
        <g className="art-bob">{scenes[scene](c)}</g>
      </svg>
      {clicky && (
        <div className="absolute bottom-[4%] end-[6%] w-[24%]">
          <Clicky size={100} color={c} mood={moods[hue]} animate sparkle={false} style={{ width: "100%", height: "auto" }} />
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

const scenes: Record<ArtId, (c: string) => React.ReactNode> = {
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
  ramadan: (c) => (
    <g>
      <path d="M92 26 A34 34 0 1 0 128 74 A26 26 0 1 1 92 26 Z" fill={c} />
      <path d="M126 30 V44" stroke={ink} strokeWidth="3" />
      <path d="M116 44 H136 L140 56 L134 84 H118 L112 56 Z" fill="var(--oc-coral)" />
      <path d="M118 56 H134" stroke={paper} strokeWidth="3" />
      <circle cx="126" cy="68" r="6" fill="var(--oc-accent)" />
      <path d="M50 40 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 z" fill="var(--oc-accent)" />
    </g>
  ),
  meal: (c) => (
    <g>
      <path d="M44 72 H136 Q132 110 90 112 Q48 110 44 72 Z" fill={c} />
      <circle cx="74" cy="66" r="12" fill="var(--oc-coral)" />
      <circle cx="98" cy="62" r="14" fill="var(--oc-accent)" />
      <path d="M112 66 q8 -16 18 -12" stroke="var(--oc-hue-grocery)" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M70 40 q-6 -8 0 -16 M90 38 q-6 -8 0 -16 M110 40 q-6 -8 0 -16" stroke="var(--oc-line-strong)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  baby: (c) => (
    <g>
      <rect x="72" y="46" width="34" height="62" rx="12" fill={paper} />
      <rect x="72" y="70" width="34" height="38" rx="12" fill={c} opacity=".85" />
      <path d="M80 46 V36 Q89 22 98 36 V46 Z" fill="var(--oc-accent)" />
      <path d="M78 58 H90 M78 66 H86" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <circle cx="132" cy="56" r="14" fill="var(--oc-sky)" />
      <path d="M126 56 q6 6 12 0" stroke={paper} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M46 74 C34 66 38 56 46 61 C54 56 58 66 46 74 Z" fill="var(--oc-coral)" />
    </g>
  ),
  home: (c) => (
    <g>
      <path d="M52 66 L90 34 L128 66 V112 H52 Z" fill={c} />
      <path d="M44 70 L90 30 L136 70" stroke={ink} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="80" y="82" width="20" height="30" rx="5" fill={paper} />
      <rect x="104" y="76" width="14" height="14" rx="3" fill="var(--oc-accent)" />
      <path d="M140 100 l18 -28" stroke="var(--oc-coral)" strokeWidth="5" strokeLinecap="round" />
      <path d="M134 104 h18 l-4 10 h-10 z" fill="var(--oc-lilac)" />
    </g>
  ),
  kids: (c) => (
    <g>
      <rect x="46" y="34" width="92" height="76" rx="14" fill={paper} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((k) => (
          <path
            key={`${r}${k}`}
            d="M0 -7 L2 -2 L7 -2 L3 1.5 L4.5 7 L0 4 L-4.5 7 L-3 1.5 L-7 -2 L-2 -2 Z"
            transform={`translate(${62 + k * 20} ${52 + r * 20})`}
            fill={r * 4 + k < 7 ? (k % 2 ? "var(--oc-accent)" : c) : "var(--oc-line)"}
          />
        ))
      )}
      <circle cx="150" cy="96" r="14" fill="var(--oc-coral)" />
      <path d="M144 96 l4 4 l8 -8" stroke={paper} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  party: (c) => (
    <g>
      <ellipse cx="70" cy="52" rx="16" ry="20" fill={c} />
      <ellipse cx="100" cy="44" rx="16" ry="20" fill="var(--oc-accent)" />
      <ellipse cx="128" cy="56" rx="15" ry="19" fill="var(--oc-sky)" />
      <path d="M70 72 q4 20 -2 40 M100 64 q-4 24 2 48 M128 75 q4 18 -2 36" stroke={ink} strokeWidth="2.5" fill="none" />
      <rect x="50" y="96" width="12" height="6" rx="2" fill="var(--oc-lilac)" transform="rotate(20 56 99)" />
      <rect x="140" y="100" width="12" height="6" rx="2" fill="var(--oc-coral)" transform="rotate(-25 146 103)" />
    </g>
  ),
  gift: (c) => (
    <g>
      <rect x="56" y="64" width="72" height="50" rx="10" fill={c} />
      <rect x="50" y="50" width="84" height="20" rx="8" fill="var(--oc-coral)" />
      <rect x="86" y="50" width="12" height="64" fill="var(--oc-accent)" />
      <path d="M92 50 C74 30 64 46 92 50 C120 46 110 30 92 50 Z" fill="var(--oc-accent)" />
    </g>
  ),
  habit: (c) => (
    <g>
      <rect x="40" y="36" width="104" height="72" rx="14" fill={paper} />
      {Array.from({ length: 21 }).map((_, i) => (
        <rect key={i} x={52 + (i % 7) * 12} y={50 + Math.floor(i / 7) * 16} width="9" height="11" rx="3" fill={i < 16 ? (i % 3 ? c : "var(--oc-accent)") : "var(--oc-line)"} />
      ))}
      <path d="M150 50 c-10 10 -4 22 0 26 c8 -6 10 -18 0 -26 z" fill="var(--oc-coral)" />
    </g>
  ),
  business: (c) => (
    <g>
      <rect x="48" y="52" width="88" height="60" rx="12" fill={c} />
      <path d="M78 52 V42 Q78 36 84 36 H100 Q106 36 106 42 V52" stroke={ink} strokeWidth="5" fill="none" />
      <rect x="48" y="74" width="88" height="8" fill={paper} opacity=".5" />
      <rect x="140" y="80" width="10" height="30" rx="3" fill="var(--oc-accent)" />
      <rect x="154" y="66" width="10" height="44" rx="3" fill="var(--oc-coral)" />
      <rect x="168" y="52" width="10" height="58" rx="3" fill="var(--oc-hue-grocery)" />
    </g>
  ),
  bundle: (c) => (
    <g>
      <rect x="40" y="54" width="44" height="54" rx="12" fill="var(--oc-hue-planner)" transform="rotate(-8 62 81)" />
      <rect x="74" y="40" width="44" height="60" rx="12" fill="var(--oc-hue-grocery)" />
      <rect x="110" y="54" width="44" height="54" rx="12" fill="var(--oc-hue-budget)" transform="rotate(8 132 81)" />
      <path d="M86 70 l8 8 l14 -16" stroke={paper} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="140" cy="36" r="14" fill={c} />
      <path d="M134 36 h12 M140 30 v12" stroke={paper} strokeWidth="3.5" strokeLinecap="round" />
    </g>
  ),
};
