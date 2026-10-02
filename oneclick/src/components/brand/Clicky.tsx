import type { CSSProperties } from "react";

/**
 * Clicky: the One Click Digital Hub logo and mascot. A friendly face whose smile is a check
 * mark (a job done, happily) with a sunshine "click" dimple.
 * Moods change the eyes/mouth; `body` adds arms and feet for illustrations.
 * Animations are pure CSS (globals.css) and switch off under prefers-reduced-motion.
 */
export type ClickyMood = "happy" | "wink" | "celebrate" | "think" | "love" | "surprised";

export function Clicky({
  size = 64,
  mood = "happy",
  color = "var(--oc-brand)",
  body = false,
  animate = false,
  wave = false,
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
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  const h = body ? 128 : 100;
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
      {body && (
        <g stroke="var(--oc-ink)" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M38 94 L36 114" />
          <path d="M62 94 L64 114" />
          <path d="M28 116 L40 116" />
          <path d="M60 116 L72 116" />
          <path d="M10 62 Q0 70 4 82" />
          <path d="M90 62 Q102 50 98 36" className={wave ? "clicky-wave" : undefined} style={{ transformOrigin: "90px 62px" }} />
        </g>
      )}
      <rect x="8" y="8" width="84" height="84" rx="30" fill={color} />
      {/* highlight for a soft, toy-like feel */}
      <path d="M22 26 Q24 16 36 15" stroke="#fff" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" fill="none" />
      <Face mood={mood} />
      <circle cx="76" cy="60" r="5" fill="var(--oc-accent)" />
    </svg>
  );
}

function Face({ mood }: { mood: ClickyMood }) {
  const w = "#fff";
  const smile = <path d="M32 60 L44 70 L70 56" fill="none" stroke={w} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />;
  switch (mood) {
    case "wink":
      return (
        <g>
          <circle cx="36" cy="40" r="6" fill={w} className="clicky-blink" />
          <path d="M58 41 Q64 35 70 41" stroke={w} strokeWidth="5" strokeLinecap="round" fill="none" />
          {smile}
        </g>
      );
    case "celebrate":
      return (
        <g>
          <path d="M29 42 Q36 34 43 42" stroke={w} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M57 42 Q64 34 71 42" stroke={w} strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M30 56 Q50 80 70 56 Z" fill={w} />
        </g>
      );
    case "think":
      return (
        <g>
          <circle cx="38" cy="36" r="5.5" fill={w} />
          <circle cx="66" cy="36" r="5.5" fill={w} />
          <path d="M40 64 L60 62" stroke={w} strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case "love":
      return (
        <g fill="var(--oc-coral)" stroke={w} strokeWidth="2">
          <path d="M36 48 C24 40 28 30 36 35 C44 30 48 40 36 48 Z" />
          <path d="M64 48 C52 40 56 30 64 35 C72 30 76 40 64 48 Z" />
          <g stroke="none">{smile}</g>
        </g>
      );
    case "surprised":
      return (
        <g>
          <circle cx="36" cy="40" r="7" fill={w} />
          <circle cx="64" cy="40" r="7" fill={w} />
          <ellipse cx="50" cy="64" rx="7" ry="8" fill={w} />
        </g>
      );
    default:
      return (
        <g>
          <g className="clicky-blink">
            <circle cx="36" cy="40" r="6" fill={w} />
            <circle cx="64" cy="40" r="6" fill={w} />
          </g>
          {smile}
        </g>
      );
  }
}
