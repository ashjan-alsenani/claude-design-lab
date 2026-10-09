import { useId } from 'react';

export type GemHue = 'violet' | 'teal' | 'rose' | 'gold' | 'sky' | 'peach';

const HUES: Record<GemHue, [string, string, string]> = {
  violet: ['#efe4ff', '#a283f1', '#4e3196'],
  teal: ['#dcfffb', '#3fd0c9', '#0b6a6f'],
  rose: ['#ffe6f1', '#ef82b2', '#8f2f5e'],
  gold: ['#fff6d6', '#f5c048', '#9a5f10'],
  sky: ['#e6f9ff', '#73cdf0', '#1f6d96'],
  peach: ['#fff0ea', '#ff9f87', '#a2442f'],
};

/** Faceted cut gem with highlights. */
export function Gem({ hue = 'violet', size = 32, className, dim = false }: { hue?: GemHue; size?: number; className?: string; dim?: boolean }) {
  const id = useId().replace(/:/g, '');
  const [hi, mid, lo] = HUES[hue];
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden style={dim ? { filter: 'grayscale(1) opacity(.35)' } : undefined}>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mid} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
      </defs>
      <path d="M18 8h28l12 14-26 34L6 22 18 8Z" fill={`url(#${id}b)`} />
      <path d="M6 22h52L32 56 6 22Z" fill={`url(#${id}b)`} />
      <path d="M18 8 24 22h16l6-14H18Z" fill={`url(#${id}a)`} />
      <path d="M6 22 18 8l6 14H6Zm52 0L46 8l-6 14h18Z" fill={mid} opacity=".85" />
      <path d="M24 22h16L32 56 24 22Z" fill={hi} opacity=".55" />
      <path d="M6 22h18l8 34L6 22Z" fill={lo} opacity=".35" />
      <path d="M21 12.5h7l-2.5 6h-5.5l1-6Z" fill="#fff" opacity=".85" />
      <circle cx="44" cy="14" r="1.6" fill="#fff" opacity=".9" />
    </svg>
  );
}

export const ACTIVITY_GEM: Record<string, GemHue> = {
  gates: 'violet',
  chests: 'gold',
  wheel: 'rose',
  detective: 'teal',
  puzzle: 'sky',
  cinema: 'peach',
  lightning: 'gold',
  crown: 'violet',
};
