import type { CSSProperties } from "react";

/**
 * Clicky: the One Click logo and mascot. A soft, rounded friend with big shiny eyes,
 * rosy cheeks, a check-mark smile (a job done, happily) and a sunshine sparkle.
 * Moods change eyes and mouth; `body` adds arms and feet; any face color works.
 * Animations are CSS only (globals.css) and stop under prefers-reduced-motion.
 */
export type ClickyMood = "happy" | "wink" | "celebrate" | "think" | "love" | "surprised";
export type ClickyAccessory = "bulb" | "shield" | "heart" | "chat" | "baby" | "bow" | "cap";

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
  blink = animate,
  wave = false,
  sparkle = true,
  accessory,
  className = "",
  style,
  title,
}: {
  size?: number;
  mood?: ClickyMood;
  color?: string;
  body?: boolean;
  animate?: boolean;
  /** Occasional blink. Off by default for decorative copies (lists, cards, the parade). */
  blink?: boolean;
  wave?: boolean;
  sparkle?: boolean;
  /** Family role badge (replaces the sparkle): Shams' bulb, Lilac's shield, Toot's heart, Marjan's chat. */
  accessory?: ClickyAccessory;
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
        // Limbs follow the page ink so they stay visible in dark mode (the face stays dark on the body).
        <g stroke={INK} strokeWidth="5" strokeLinecap="round" fill="none" style={{ stroke: `var(--oc-ink, ${INK})` }}>
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
      <Face mood={mood} blink={blink} />
      {accessory && <Accessory kind={accessory} />}
      {sparkle && !accessory && (
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

function Face({ mood, blink }: { mood: ClickyMood; blink: boolean }) {
  switch (mood) {
    case "wink":
      return (
        <g>
          <g className={blink ? "clicky-blink" : undefined}>{eye(36)}</g>
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
          <g className={blink ? "clicky-blink" : undefined}>
            {eye(36)}
            {eye(64)}
          </g>
          {cheeks}
          {smile}
        </g>
      );
  }
}

/** Small role badges drawn at the top corner of the face (in the sparkle's place). */
function Accessory({ kind }: { kind: ClickyAccessory }) {
  switch (kind) {
    case "bulb":
      return (
        <g>
          <g stroke="#FFC23D" strokeWidth="3" strokeLinecap="round">
            <path d="M84 -6 L84 -11" />
            <path d="M96 -1 L100 -5" />
            <path d="M72 -1 L68 -5" />
          </g>
          <circle cx="84" cy="10" r="11" fill="#FFF6D6" stroke={INK} strokeWidth="2.5" />
          <path d="M80 12 Q84 5 88 12" fill="none" stroke="#FFC23D" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="78.5" y="20" width="11" height="8" rx="2.5" fill="#B9B4C8" stroke={INK} strokeWidth="2.5" />
        </g>
      );
    case "shield":
      return (
        <g>
          <path d="M84 -4 L97 1 V11 C97 20 91 26 84 29 C77 26 71 20 71 11 V1 Z" fill="#fff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M78.5 12 L82.5 16 L90 8" fill="none" stroke="#8B7CF6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "baby":
      // A newborn: just one soft hair curl on top.
      return <path d="M50 7 C46 -2 56 -5 57 1 C58 6 51 6 52 2" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />;
    case "cap":
      // A newborn's soft knitted cap with a pompom (for a baby boy).
      return (
        <g>
          <path d="M22 26 C24 4 76 4 78 26 Z" fill="#2C4E86" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M19 27 Q50 19 81 27 L80 33 Q50 25 20 33 Z" fill="#9DBBE8" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="50" cy="3" r="6" fill="#9DBBE8" stroke={INK} strokeWidth="2.5" />
          <path d="M36 12 Q38 9 41 10 M58 10 Q61 9 63 12" stroke="#9DBBE8" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </g>
      );
    case "bow":
      return (
        <g>
          <path d="M50 10 L36 1 C31 -1 30 15 36 15 Z" fill="#FF8FAB" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M50 10 L64 1 C69 -1 70 15 64 15 Z" fill="#FF8FAB" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="50" cy="9" r="4.5" fill="#FF5A7A" stroke={INK} strokeWidth="2.5" />
        </g>
      );
    case "heart":
      return <path d="M85 26 C70 16 73 0 85 7 C97 0 100 16 85 26 Z" fill="#FF3D6E" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />;
    case "chat":
      return (
        <g>
          <path d="M71 -2 H99 A5 5 0 0 1 104 3 V15 A5 5 0 0 1 99 20 H86 L79 27 L80 20 H71 A5 5 0 0 1 66 15 V3 A5 5 0 0 1 71 -2 Z" fill="#fff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <g fill="#FF6B6B">
            <circle cx="77" cy="9" r="2.6" />
            <circle cx="85" cy="9" r="2.6" />
            <circle cx="93" cy="9" r="2.6" />
          </g>
        </g>
      );
  }
}
