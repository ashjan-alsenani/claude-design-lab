import type { ThemeId } from "../model/types";

/**
 * Decorative illustrations per theme. Purely visual (aria-hidden), drawn in SVG so they stay crisp,
 * tiny and recolour with the theme's CSS variables. Never people or sleep scenes.
 */
export function ThemeArt({ theme, className = "" }: { theme: ThemeId; className?: string }) {
  return (
    <svg viewBox="0 0 320 180" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {theme === "cloud" && (
        <g>
          <circle cx="262" cy="38" r="22" fill="var(--qd-accent)" opacity=".55" />
          <path d="M40 120c0-17 14-30 31-30 5-16 20-27 38-27 20 0 36 14 39 33 15 1 27 13 27 28 0 16-13 28-29 28H69c-16 0-29-14-29-32z" fill="#fff" opacity=".95" />
          <path d="M190 92c0-11 9-20 20-20 3-10 13-17 24-17 13 0 23 9 25 21 10 1 17 9 17 18 0 10-8 18-18 18h-50c-10 0-18-9-18-20z" fill="#fff" opacity=".8" />
          <g fill="var(--qd-primary)" opacity=".35"><circle cx="150" cy="40" r="3" /><circle cx="214" cy="140" r="2.5" /><circle cx="28" cy="60" r="2" /></g>
        </g>
      )}
      {theme === "moon" && (
        <g>
          <path d="M248 22a40 40 0 1 0 34 62 32 32 0 1 1-34-62z" fill="var(--qd-accent)" opacity=".8" />
          {[[60, 40, 5], [110, 90, 3.5], [180, 30, 4], [40, 130, 3], [210, 120, 5], [150, 150, 3]].map(([x, y, r], i) => (
            <path key={i} transform={`translate(${x} ${y}) scale(${r / 5})`} d="M0 -10 L2.4 -2.4 L10 0 L2.4 2.4 L0 10 L-2.4 2.4 L-10 0 L-2.4 -2.4 Z" fill={i % 2 ? "#fff" : "var(--qd-primary)"} opacity={i % 2 ? 0.95 : 0.4} />
          ))}
        </g>
      )}
      {theme === "garden" && (
        <g>
          <circle cx="258" cy="40" r="20" fill="var(--qd-accent)" opacity=".5" />
          {[[40, 170, -20], [80, 175, 10], [250, 172, -8], [290, 168, 22]].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
              <path d="M0 0 C-2 -40 4 -70 2 -100" stroke="var(--qd-primary)" strokeWidth="3" fill="none" opacity=".45" />
              <path d="M2 -60 C20 -70 30 -60 26 -48 C14 -46 6 -52 2 -60z" fill="var(--qd-primary)" opacity=".35" />
              <path d="M1 -35 C-18 -44 -28 -34 -24 -22 C-12 -20 -4 -26 1 -35z" fill="var(--qd-primary)" opacity=".3" />
              <circle cx="2" cy="-102" r="7" fill="var(--qd-accent)" opacity=".8" />
            </g>
          ))}
        </g>
      )}
      {theme === "pearl" && (
        <g>
          <path d="M20 40 Q160 120 300 40" stroke="var(--qd-primary)" strokeWidth="1.5" fill="none" opacity=".25" />
          {Array.from({ length: 11 }, (_, i) => {
            const x = 30 + i * 26;
            const y = 40 + Math.sin((i / 10) * Math.PI) * 40;
            return <circle key={i} cx={x} cy={y} r={i % 2 ? 7 : 9} fill="#fff" stroke="var(--qd-accent)" strokeWidth="1.5" />;
          })}
          <circle cx="262" cy="130" r="18" fill="var(--qd-accent)" opacity=".35" />
        </g>
      )}
    </svg>
  );
}

/** Small mark used in the app header: a crescent-and-heart "qudoom" sign in the theme colour. */
export function QudoomMark({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="var(--qd-primary)" />
      <path d="M24.5 9.5a11 11 0 1 0 6 18.6A9 9 0 1 1 24.5 9.5z" fill="#fff" opacity=".95" />
      <path d="M21.5 25.5c-3.6-2.4-4.2-5.2-2.3-6.4 1-.6 2-.2 2.3.6.3-.8 1.3-1.2 2.3-.6 1.9 1.2 1.3 4-2.3 6.4z" fill="var(--qd-accent)" />
    </svg>
  );
}
