import type { CSSProperties } from "react";

/**
 * Clicky: the One Click logo and mascot. A soft, rounded friend with big shiny eyes,
 * rosy cheeks, a check-mark smile (a job done, happily) and a sunshine sparkle.
 * Moods change eyes and mouth; `body` adds arms and feet; any face color works.
 * Animations are CSS only (globals.css) and stop under prefers-reduced-motion.
 */
export type ClickyMood = "happy" | "wink" | "celebrate" | "think" | "love" | "surprised";

const INK = "#1E1B3A";
const BODY = "M50 6 C78 6 94 18 94 48 C94 80 78 94 50 94 C22 94 6 80 6 48 C6 18 22 6 50 6 Z";

function gid(color: string) {
  let h = 0;
  for (const ch of color) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return `ck${(h >>> 0).toString(36)}`;
}

export function Clicky({
  size = 64,
  mood = "happy",
  color = "#12B5A6",
  body = false,
  animate = false,
  wave = false,
  sparkle = true,
  className = "",
  style,
  title,
}: {
  size?: number;
  mood?: ClickyMood;
  color?: string;
  body?: boolean;
  animate?: boolean;
  wave?: boolean;
  sparkle?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  const h = body ? 126 : 100;
  const id = gid(color);
  return (
    <svg
      viewBox={`0 0 100 ${h}`}
      width={size}
      height={(size * h) / 100}
      className={`${animate ? "clicky-float" : ""} ${className}`}
      style={{ overflow: "visible", ...style }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: `color-mix(in oklab, ${color} 72%, #ffffff)` }} />
          <stop offset="1" style={{ stopColor: `color-mix(in oklab, ${color} 88%, #000000)` }} />
        </linearGradient>
      </defs>
      {body && (
        <g stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M38 92 L36 112" />
          <path d="M62 92 L64 112" />
          <path d="M28 114 L40 114" />
          <path d="M60 114 L72 114" />
          <path d="M8 58 Q-2 66 2 80" />
          <path d="M92 58 Q104 46 100 32" className={wave ? "clicky-wave" : undefined} style={{ transformOrigin: "92px 58px" }} />
        </g>
      )}
      <path d={BODY} fill={`url(#${id})`} />
      <path d="M20 30 Q22 16 38 13" stroke="#fff" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Face mood={mood} />
      {sparkle && (
        <path d="M84 2 L86.5 9.5 L94 12 L86.5 14.5 L84 22 L81.5 14.5 L74 12 L81.5 9.5 Z" fill="#FFC23D" className={animate ? "clicky-twinkle" : undefined} />
      )}
    </svg>
  );
}

const cheeks = (
  <g fill="#FF8FAB" opacity=".85">
    <ellipse cx="23" cy="63" rx="6.5" ry="4" />
    <ellipse cx="77" cy="63" rx="6.5" ry="4" />
  </g>
);
const smile = <path d="M38 64 L47 72 L64 58" fill="none" stroke={INK} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />;
const eye = (cx: number) => (
  <g>
    <ellipse cx={cx} cy="44" rx="8.5" ry="10" fill="#fff" />
    <circle cx={cx + 1.5} cy="46" r="5.5" fill={INK} />
    <circle cx={cx + 3.5} cy="43.5" r="2" fill="#fff" />
  </g>
);

function Face({ mood }: { mood: ClickyMood }) {
  switch (mood) {
    case "wink":
      return (
        <g>
          <g className="clicky-blink">{eye(36)}</g>
          <path d="M56 46 Q64 38 72 46" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
          {cheeks}
          {smile}
        </g>
      );
    case "celebrate":
      return (
        <g>
          <path d="M28 46 Q36 36 44 46" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M56 46 Q64 36 72 46" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
          {cheeks}
          <path d="M36 58 Q50 80 64 58 Z" fill={INK} />
          <path d="M42 66 Q50 72 58 66" fill="#FF8FAB" />
        </g>
      );
    case "think":
      return (
        <g>
          <ellipse cx="36" cy="44" rx="8.5" ry="10" fill="#fff" />
          <ellipse cx="64" cy="44" rx="8.5" ry="10" fill="#fff" />
          <circle cx="39" cy="40" r="5" fill={INK} />
          <circle cx="67" cy="40" r="5" fill={INK} />
          {cheeks}
          <path d="M42 64 Q51 71 60 62" stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      );
    case "love":
      return (
        <g>
          <path d="M36 54 C22 45 26 33 36 39 C46 33 50 45 36 54 Z" fill="#FF5A7A" />
          <path d="M64 54 C50 45 54 33 64 39 C74 33 78 45 64 54 Z" fill="#FF5A7A" />
          {cheeks}
          {smile}
        </g>
      );
    case "surprised":
      return (
        <g>
          {eye(36)}
          {eye(64)}
          {cheeks}
          <ellipse cx="50" cy="67" rx="6" ry="7" fill={INK} />
        </g>
      );
    default:
      return (
        <g>
          <g className="clicky-blink">
            {eye(36)}
            {eye(64)}
          </g>
          {cheeks}
          {smile}
        </g>
      );
  }
}
