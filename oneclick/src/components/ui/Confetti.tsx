"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

const palette = ["#FFC23D", "#FF6B6B", "#8B7CF6", "#3DA5FF", "#12B5A6", "#F0567A"];

/** A short, celebratory burst. Render it with a changing `key` to replay. Reduced motion: nothing. */
export function Confetti({ pieces = 28 }: { pieces?: number }) {
  const reduce = useReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        x: (Math.random() - 0.5) * 320,
        y: -80 - Math.random() * 160,
        r: Math.random() * 540 - 270,
        c: palette[i % palette.length],
        w: 6 + Math.random() * 6,
        round: Math.random() > 0.5,
        d: Math.random() * 0.15,
      })),
    [pieces]
  );
  if (reduce) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 grid place-items-center overflow-visible">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ width: b.w, height: b.round ? b.w : b.w * 0.5, background: b.c, borderRadius: b.round ? 999 : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 220], opacity: [1, 1, 0], rotate: b.r, scale: 1 }}
          transition={{ duration: 1.6, delay: b.d, ease: "easeOut", times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}
