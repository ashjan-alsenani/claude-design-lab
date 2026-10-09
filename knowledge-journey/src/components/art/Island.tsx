import { useId, type ReactNode } from 'react';
import type { ActivityId } from '../../lib/types';

interface Palette {
  lawn: [string, string];
  rock: [string, string, string];
  glow: string;
  crystal: string;
}

export const ISLAND_PALETTES: Record<ActivityId, Palette> = {
  gates: { lawn: ['#c9f7ef', '#5fd6c9'], rock: ['#a283f1', '#6745bd', '#2f1c63'], glow: '#7fe3dc', crystal: '#c2a9fb' },
  chests: { lawn: ['#fff1c9', '#ffc977'], rock: ['#ffbfa8', '#d27a63', '#6b2f3c'], glow: '#ffd66e', crystal: '#ffe6a3' },
  wheel: { lawn: ['#ffe2ef', '#f8a8cb'], rock: ['#d9a3ff', '#9a5bd1', '#43206e'], glow: '#f8a8cb', crystal: '#fdd0e3' },
  detective: { lawn: ['#d4fbf5', '#7fe3dc'], rock: ['#7fb8e8', '#3f6fb3', '#1d2f66'], glow: '#9adff5', crystal: '#b5f3ee' },
  puzzle: { lawn: ['#e3f6ff', '#9adff5'], rock: ['#a7b5ff', '#5f6fd6', '#272f7a'], glow: '#9adff5', crystal: '#dfe6ff' },
  cinema: { lawn: ['#ffe9e1', '#ffbfa8'], rock: ['#c2a9fb', '#8260dc', '#36216d'], glow: '#ff9f87', crystal: '#ffdccf' },
  lightning: { lawn: ['#fff6d1', '#ffe08a'], rock: ['#6fd6d0', '#19868f', '#0b3a52'], glow: '#ffd66e', crystal: '#b5f3ee' },
  crown: { lawn: ['#fffaf0', '#ffe6a3'], rock: ['#ffd66e', '#c7862a', '#5c3a06'], glow: '#fff1b8', crystal: '#fff4d1' },
};

/** Floating island base (viewBox 0 0 200 200, surface ≈ y 118). */
export function IslandBase({ palette, children, ghost }: { palette: Palette; children?: ReactNode; ghost?: boolean }) {
  const id = useId().replace(/:/g, '');
  const { lawn, rock, glow, crystal } = palette;
  return (
    <svg viewBox="0 0 200 210" aria-hidden style={{ overflow: 'visible', width: '100%', height: '100%', filter: ghost ? 'saturate(.25) brightness(.8)' : undefined }}>
      <defs>
        <linearGradient id={`${id}rock`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={rock[0]} />
          <stop offset=".45" stopColor={rock[1]} />
          <stop offset="1" stopColor={rock[2]} />
        </linearGradient>
        <linearGradient id={`${id}lawn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lawn[0]} />
          <stop offset="1" stopColor={lawn[1]} />
        </linearGradient>
        <radialGradient id={`${id}glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={glow} stopOpacity=".7" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}cry`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor={crystal} />
        </linearGradient>
      </defs>
      {/* under-glow */}
      <ellipse cx="100" cy="185" rx="70" ry="22" fill={`url(#${id}glow)`} />
      {/* rock body */}
      <path
        d="M22 120c0-6 10-10 22-11 18-2 38-3 56-3s38 1 56 3c12 1 22 5 22 11 0 8-8 14-16 20-10 7-18 16-26 26-8 10-18 26-36 26s-26-14-34-24c-8-10-18-20-28-28-8-6-16-12-16-20Z"
        fill={`url(#${id}rock)`}
      />
      {/* strata lines */}
      <path d="M38 140c20 6 44 8 62 8s44-2 62-8" stroke="#fff" strokeOpacity=".18" strokeWidth="2" fill="none" />
      <path d="M58 162c14 4 28 5 42 5s28-1 42-5" stroke="#fff" strokeOpacity=".14" strokeWidth="2" fill="none" />
      {/* hanging crystals */}
      <path d="M86 186l6 18 6-16-6-6Z" fill={`url(#${id}cry)`} opacity=".9" />
      <path d="M112 176l4 12 4-11-4-4Z" fill={`url(#${id}cry)`} opacity=".8" />
      <path d="M64 160l3 10 4-9-3-3Z" fill={`url(#${id}cry)`} opacity=".7" />
      {/* lawn top */}
      <ellipse cx="100" cy="118" rx="80" ry="17" fill={`url(#${id}lawn)`} />
      <ellipse cx="100" cy="114" rx="72" ry="12" fill="#fff" opacity=".22" />
      {/* edge shine */}
      <path d="M26 120c6 6 20 10 34 12" stroke="#fff" strokeOpacity=".5" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {children}
    </svg>
  );
}

/* ───────── Landmarks (drawn in island coordinates, base at y≈116) ───────── */

function Portal() {
  return (
    <g>
      <defs>
        <radialGradient id="portal-core" cx="50%" cy="60%" r="60%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#9ff3ea" />
          <stop offset="1" stopColor="#7d5ad8" />
        </radialGradient>
      </defs>
      <path d="M62 118V74a38 38 0 0 1 76 0v44h-14V76a24 24 0 0 0-48 0v42H62Z" fill="#f7f2ff" stroke="#a283f1" strokeWidth="2" />
      <path d="M76 118V76a24 24 0 0 1 48 0v42Z" fill="url(#portal-core)" className="pulse" />
      <circle cx="100" cy="40" r="5" fill="#ffd66e" />
      <path d="M86 118v-30M114 118v-30" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
      <circle cx="56" cy="114" r="5" fill="#ffd66e" opacity=".9" />
      <circle cx="144" cy="114" r="5" fill="#ffd66e" opacity=".9" />
    </g>
  );
}

function Chest() {
  return (
    <g>
      <path d="M66 86h68v32H66Z" fill="#b8642b" />
      <path d="M66 86h68v32H66Z" fill="url(#chest-wood)" />
      <defs>
        <linearGradient id="chest-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e08a4a" />
          <stop offset="1" stopColor="#8f4520" />
        </linearGradient>
        <linearGradient id="chest-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2a35f" />
          <stop offset="1" stopColor="#b8642b" />
        </linearGradient>
      </defs>
      <path d="M64 86c0-16 16-26 36-26s36 10 36 26Z" fill="url(#chest-lid)" />
      <path d="M64 86h72" stroke="#ffd66e" strokeWidth="5" />
      <path d="M78 62v56M122 62v56" stroke="#ffd66e" strokeWidth="5" />
      <rect x="93" y="80" width="14" height="16" rx="3" fill="#ffe6a3" stroke="#b5751a" strokeWidth="2" />
      <path d="M86 58l14-14 14 14" stroke="#fff3c4" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".9" />
      <circle cx="100" cy="40" r="4" fill="#fff3c4" />
    </g>
  );
}

function Wheel() {
  const segs = ['#f8a8cb', '#c2a9fb', '#7fe3dc', '#ffd66e', '#ffbfa8', '#9adff5'];
  return (
    <g>
      <path d="M100 82l-18 36h36Z" fill="#8260dc" />
      <g transform="translate(100 72)">
        <g className="spin-slow">
          {segs.map((c, i) => {
            const a0 = (i * 60 * Math.PI) / 180;
            const a1 = ((i + 1) * 60 * Math.PI) / 180;
            return <path key={i} d={`M0 0L${34 * Math.cos(a0)} ${34 * Math.sin(a0)}A34 34 0 0 1 ${34 * Math.cos(a1)} ${34 * Math.sin(a1)}Z`} fill={c} />;
          })}
        </g>
        <circle r="34" fill="none" stroke="#fff" strokeWidth="4" />
        <circle r="7" fill="#fff" stroke="#e09e2c" strokeWidth="3" />
      </g>
      <path d="M100 32l7 10h-14Z" fill="#ffd66e" stroke="#b5751a" strokeWidth="1.5" />
    </g>
  );
}

function Magnifier() {
  return (
    <g>
      <rect x="58" y="92" width="44" height="26" rx="4" fill="#fff8e6" transform="rotate(-8 80 105)" />
      <path d="M64 100h28M64 107h22" stroke="#c7a46a" strokeWidth="2" transform="rotate(-8 80 105)" />
      <circle cx="112" cy="72" r="22" fill="#d4fbf5" fillOpacity=".55" stroke="#ffd66e" strokeWidth="7" />
      <path d="M104 64a11 11 0 0 1 10-4" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M128 88l16 22" stroke="#7a4a1a" strokeWidth="9" strokeLinecap="round" />
      <circle cx="70" cy="70" r="3" fill="#9adff5" />
      <circle cx="148" cy="62" r="2.5" fill="#fff" />
    </g>
  );
}

function PuzzlePieces() {
  const piece = 'M0 0h14a6 6 0 1 1 12 0h14v14a6 6 0 1 0 0 12v14H26a6 6 0 1 0-12 0H0V26a6 6 0 1 1 0-12Z';
  return (
    <g>
      <path d={piece} transform="translate(58 76)" fill="#9adff5" stroke="#fff" strokeWidth="2" />
      <path d={piece} transform="translate(102 76)" fill="#c2a9fb" stroke="#fff" strokeWidth="2" />
      <g transform="translate(80 36) rotate(12 20 20)">
        <path d={piece} fill="#ffd66e" stroke="#fff" strokeWidth="2" className="bob" />
      </g>
    </g>
  );
}

function Screen() {
  return (
    <g>
      <rect x="54" y="48" width="92" height="56" rx="8" fill="#36216d" stroke="#ffd66e" strokeWidth="4" />
      <rect x="62" y="56" width="76" height="40" rx="4" fill="url(#screen-glow)" />
      <defs>
        <linearGradient id="screen-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffdccf" />
          <stop offset="1" stopColor="#a283f1" />
        </linearGradient>
      </defs>
      <path d="M94 66v20l16-10Z" fill="#fff" />
      <path d="M76 104l-8 14M124 104l8 14" stroke="#8260dc" strokeWidth="4" strokeLinecap="round" />
      <circle cx="58" cy="44" r="3" fill="#ffd66e" />
      <circle cx="142" cy="44" r="3" fill="#ffd66e" />
    </g>
  );
}

function Bolt() {
  return (
    <g>
      <path d="M100 30 132 100H68Z" fill="#19b2ae" opacity=".25" />
      <path d="M108 36 80 82h18l-8 34 32-48h-19l9-32Z" fill="#ffd66e" stroke="#fff3c4" strokeWidth="2.5" strokeLinejoin="round" className="pulse" />
      <circle cx="70" cy="58" r="3" fill="#b5f3ee" />
      <circle cx="134" cy="76" r="3.5" fill="#b5f3ee" />
    </g>
  );
}

function Palace() {
  return (
    <g>
      <defs>
        <linearGradient id="palace-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#f3dcff" />
        </linearGradient>
        <linearGradient id="palace-dome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe6a3" />
          <stop offset="1" stopColor="#e09e2c" />
        </linearGradient>
      </defs>
      <rect x="52" y="74" width="16" height="44" fill="url(#palace-wall)" />
      <rect x="132" y="74" width="16" height="44" fill="url(#palace-wall)" />
      <path d="M50 76c0-10 10-18 10-26 0 8 10 16 10 26Z" fill="url(#palace-dome)" />
      <path d="M130 76c0-10 10-18 10-26 0 8 10 16 10 26Z" fill="url(#palace-dome)" />
      <rect x="68" y="80" width="64" height="38" fill="url(#palace-wall)" />
      <path d="M72 82c0-22 12-36 28-44 16 8 28 22 28 44Z" fill="url(#palace-dome)" />
      <path d="M100 38v-12" stroke="#e09e2c" strokeWidth="3" />
      <circle cx="100" cy="23" r="4" fill="#ffd66e" />
      <path d="M90 118v-18a10 10 0 0 1 20 0v18Z" fill="#8260dc" />
      <path d="M93 118v-17a7 7 0 0 1 14 0v17Z" fill="#ffd66e" opacity=".85" className="pulse" />
      <path d="M78 98a5 5 0 0 1 10 0v6H78Zm34 0a5 5 0 0 1 10 0v6h-10Z" fill="#c2a9fb" />
    </g>
  );
}

const LANDMARKS: Record<ActivityId, () => ReactNode> = {
  gates: Portal,
  chests: Chest,
  wheel: Wheel,
  detective: Magnifier,
  puzzle: PuzzlePieces,
  cinema: Screen,
  lightning: Bolt,
  crown: Palace,
};

export function IslandArt({ id, locked }: { id: ActivityId; locked?: boolean }) {
  const Landmark = LANDMARKS[id];
  return (
    <IslandBase palette={ISLAND_PALETTES[id]} ghost={locked}>
      <Landmark />
    </IslandBase>
  );
}
