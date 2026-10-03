import { useState } from 'react';
import type { MascotMood } from '../data/types';
import { play } from '../lib/sound';

export type Outfit = 'none' | 'doctor' | 'ranger' | 'chemist' | 'cap' | 'crown' | 'headband' | 'headphones' | 'hardhat';

interface Props {
  mood?: MascotMood;
  size?: number;
  outfit?: Outfit;
  /** react (jump + giggle) when tapped */
  interactive?: boolean;
  className?: string;
  label?: string;
}

/** Arm angles (left, right) per mood. Positive left = outward. */
const arms: Record<MascotMood, [number, number]> = {
  happy: [22, -150],
  excited: [150, -150],
  thinking: [22, -128],
  surprised: [60, -60],
  celebrating: [160, -160],
  encouraging: [22, -140],
};

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case 'excited':
    case 'celebrating':
      return <path d="M86 104 Q100 124 114 104 Z" fill="#ff8fa3" stroke="#9ff3ff" strokeWidth="3" strokeLinejoin="round" />;
    case 'surprised':
      return <ellipse cx="100" cy="110" rx="7" ry="9" fill="none" stroke="#9ff3ff" strokeWidth="4" />;
    case 'thinking':
      return <path d="M90 110 Q100 106 111 111" fill="none" stroke="#9ff3ff" strokeWidth="4" strokeLinecap="round" />;
    case 'encouraging':
      return <path d="M88 105 Q100 116 112 105" fill="none" stroke="#9ff3ff" strokeWidth="4.5" strokeLinecap="round" />;
    default:
      return <path d="M86 104 Q100 118 114 104" fill="none" stroke="#9ff3ff" strokeWidth="4.5" strokeLinecap="round" />;
  }
}

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === 'celebrating') {
    return (
      <g fill="none" stroke="#9ff3ff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M71 90 L80 81 L89 90" />
        <path d="M111 90 L120 81 L129 90" />
      </g>
    );
  }
  const big = mood === 'surprised' || mood === 'excited';
  const look = mood === 'thinking' ? { dx: 4, dy: -4 } : { dx: 0, dy: 0 };
  return (
    <g className="mascot-eyes">
      {[80, 120].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={86} rx={big ? 12 : 10} ry={big ? 14 : 12} fill="#9ff3ff" />
          <circle cx={cx + look.dx} cy={86 + look.dy} r={big ? 5.5 : 5} fill="#1f2a4d" />
          <circle cx={cx + look.dx + 2.5} cy={83 + look.dy} r={2} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function Arm({ side, angle, wave }: { side: 'l' | 'r'; angle: number; wave: boolean }) {
  const x = side === 'l' ? 66 : 134;
  return (
    <g transform={`translate(${x} 146)`}>
      <g className={wave ? 'mascot-wave' : undefined} style={{ transform: `rotate(${angle}deg)`, transformOrigin: '0 0' }}>
        <rect x="-7" y="0" width="14" height="38" rx="7" fill="#7c86a6" />
        <circle cx="0" cy="42" r="10" fill="#19c3d6" stroke="#1f2a4d" strokeWidth="3" />
      </g>
    </g>
  );
}

function OutfitLayer({ outfit }: { outfit: Outfit }) {
  if (outfit === 'doctor')
    return (
      <g>
        {/* head mirror + stethoscope */}
        <circle cx="100" cy="46" r="12" fill="#e6f2ff" stroke="#1f2a4d" strokeWidth="3" />
        <circle cx="100" cy="46" r="5" fill="#cfe6ff" />
        <path d="M78 140 Q100 176 122 140" fill="none" stroke="#1f2a4d" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="166" r="7" fill="#c0c7dd" stroke="#1f2a4d" strokeWidth="3" />
      </g>
    );
  if (outfit === 'ranger')
    return (
      <g>
        <path d="M44 52 Q100 6 156 52 Z" fill="#2fbf71" stroke="#1f2a4d" strokeWidth="3" strokeLinejoin="round" />
        <path d="M32 54 L168 54" stroke="#1f9a59" strokeWidth="8" strokeLinecap="round" />
        <path d="M128 30 q14 -14 22 -2 q-12 6 -22 2z" fill="#9be15d" stroke="#1f2a4d" strokeWidth="2.5" />
      </g>
    );
  if (outfit === 'chemist')
    return (
      <g>
        <rect x="54" y="66" width="92" height="32" rx="16" fill="rgba(159,243,255,.35)" stroke="#9b5de5" strokeWidth="5" />
        <path d="M100 66 v32" stroke="#9b5de5" strokeWidth="4" />
      </g>
    );
  if (outfit === 'cap')
    return (
      <g>
        {/* graduation cap */}
        <path d="M52 44 L100 26 L148 44 L100 62Z" fill="#1f2a4d" stroke="#1f2a4d" strokeWidth="3" strokeLinejoin="round" />
        <path d="M72 52 V66 Q100 78 128 66 V52" fill="#2f3b63" stroke="#1f2a4d" strokeWidth="3" />
        <path d="M148 44 V70" stroke="#ffc83d" strokeWidth="4" strokeLinecap="round" />
        <circle cx="148" cy="73" r="5" fill="#ffc83d" />
      </g>
    );
  if (outfit === 'crown')
    return (
      <g>
        <path d="M58 52 L66 22 L84 40 L100 16 L116 40 L134 22 L142 52Z" fill="#ffc83d" stroke="#1f2a4d" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="100" cy="40" r="5" fill="#ff6b6b" />
        <circle cx="76" cy="44" r="4" fill="#2f7ff0" />
        <circle cx="124" cy="44" r="4" fill="#2fbf71" />
      </g>
    );
  if (outfit === 'headband')
    return (
      <g>
        {/* sporty headband */}
        <path d="M46 58 Q100 40 154 58 L152 70 Q100 52 48 70Z" fill="#ff6b6b" stroke="#1f2a4d" strokeWidth="3" strokeLinejoin="round" />
        <path d="M70 56 L74 66 M130 56 L126 66" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      </g>
    );
  if (outfit === 'hardhat')
    return (
      <g>
        {/* architect's hard hat */}
        <path d="M50 58 Q50 20 100 20 Q150 20 150 58Z" fill="#ffc83d" stroke="#1f2a4d" strokeWidth="3" strokeLinejoin="round" />
        <path d="M38 58 L162 58" stroke="#1f2a4d" strokeWidth="9" strokeLinecap="round" />
        <path d="M38 58 L162 58" stroke="#f2a900" strokeWidth="5" strokeLinecap="round" />
        <path d="M100 20 V50" stroke="#e09a00" strokeWidth="6" strokeLinecap="round" />
      </g>
    );
  if (outfit === 'headphones')
    return (
      <g>
        <path d="M42 92 Q42 18 100 18 Q158 18 158 92" fill="none" stroke="#1f2a4d" strokeWidth="8" strokeLinecap="round" />
        <path d="M42 92 Q42 18 100 18 Q158 18 158 92" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
        <rect x="28" y="78" width="22" height="36" rx="10" fill="#8b5cf6" stroke="#1f2a4d" strokeWidth="3" />
        <rect x="150" y="78" width="22" height="36" rx="10" fill="#8b5cf6" stroke="#1f2a4d" strokeWidth="3" />
      </g>
    );
  return null;
}

/** نوري — the friendly robot guide. Pure SVG so it is crisp and tiny. */
export function Mascot({ mood = 'happy', size = 160, outfit = 'none', interactive = false, className = '', label }: Props) {
  const [bounce, setBounce] = useState(0);
  const [l, r] = arms[mood];
  const react = () => {
    if (!interactive) return;
    play('tap');
    setBounce((b) => b + 1);
  };

  const svg = (
    <svg viewBox="0 0 200 222" width={size} height={size * 1.11} aria-hidden="true" className="mascot-svg">
      <defs>
        <linearGradient id="nouri-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fe0ee" />
          <stop offset="1" stopColor="#19b3c6" />
        </linearGradient>
        <linearGradient id="nouri-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc861" />
          <stop offset="1" stopColor="#ff9a3d" />
        </linearGradient>
        <radialGradient id="nouri-bulb">
          <stop offset="0" stopColor="#fff6c9" />
          <stop offset="1" stopColor="#ffc83d" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="212" rx="44" ry="7" fill="#1f2a4d" opacity="0.12" className="mascot-shadow" />
      <g className="mascot-body">
        {/* legs */}
        <rect x="76" y="180" width="18" height="24" rx="9" fill="#7c86a6" />
        <rect x="106" y="180" width="18" height="24" rx="9" fill="#7c86a6" />
        <ellipse cx="85" cy="205" rx="14" ry="7" fill="#19c3d6" stroke="#1f2a4d" strokeWidth="3" />
        <ellipse cx="115" cy="205" rx="14" ry="7" fill="#19c3d6" stroke="#1f2a4d" strokeWidth="3" />
        <Arm side="l" angle={l} wave={false} />
        <Arm side="r" angle={r} wave={mood === 'happy' || mood === 'excited'} />
        {/* torso */}
        <rect x="62" y="132" width="76" height="56" rx="26" fill="url(#nouri-body)" stroke="#1f2a4d" strokeWidth="3.5" />
        <path d="M100 145 l4.7 9.5 10.5 1.5 -7.6 7.4 1.8 10.4 -9.4 -4.9 -9.4 4.9 1.8 -10.4 -7.6 -7.4 10.5 -1.5z" fill="#fff6c9" stroke="#1f2a4d" strokeWidth="2.5" strokeLinejoin="round" />
        {/* antenna */}
        <path d="M100 42 V20" stroke="#1f2a4d" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="15" r="10" fill="url(#nouri-bulb)" stroke="#1f2a4d" strokeWidth="3" className="mascot-bulb" />
        {/* ears */}
        <rect x="26" y="76" width="16" height="30" rx="8" fill="#ffc83d" stroke="#1f2a4d" strokeWidth="3" />
        <rect x="158" y="76" width="16" height="30" rx="8" fill="#ffc83d" stroke="#1f2a4d" strokeWidth="3" />
        {/* head */}
        <rect x="36" y="40" width="128" height="98" rx="46" fill="url(#nouri-head)" stroke="#1f2a4d" strokeWidth="3.5" />
        <path d="M58 52 Q76 44 96 46" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        {/* face screen */}
        <rect x="52" y="58" width="96" height="68" rx="30" fill="#1f2a4d" />
        <Eyes mood={mood} />
        <Mouth mood={mood} />
        <ellipse cx="64" cy="110" rx="6" ry="4" fill="#ff8fa3" opacity="0.7" />
        <ellipse cx="136" cy="110" rx="6" ry="4" fill="#ff8fa3" opacity="0.7" />
        <OutfitLayer outfit={outfit} />
        {mood === 'thinking' && (
          <text x="166" y="40" fontSize="34" fontWeight="800" fill="#5b5bf7" className="mascot-q">
            ؟
          </text>
        )}
        {mood === 'celebrating' && (
          <g className="mascot-sparkles">
            <path d="M24 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#ffc83d" />
            <path d="M176 120 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" fill="#ff6b6b" />
            <circle cx="170" cy="30" r="5" fill="#2fbf71" />
            <circle cx="30" cy="130" r="4" fill="#9b5de5" />
          </g>
        )}
      </g>
    </svg>
  );

  const classes = `mascot mascot--${mood} ${className}`;
  if (!interactive) return <div className={classes} aria-hidden={label ? undefined : true} aria-label={label}>{svg}</div>;
  return (
    <button type="button" className={`${classes} mascot--interactive`} onClick={react} aria-label={label ?? 'نوري يلوّح لك'}>
      <span key={bounce} className={bounce ? 'mascot-jump' : undefined}>
        {svg}
      </span>
    </button>
  );
}
