"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const colors = ["var(--oc-accent)", "var(--oc-coral)", "var(--oc-lilac)", "var(--oc-brand)"];

/**
 * Headline with a rotating, highlighted last word ("simpler" → "calmer" → "happier").
 * Screen readers get the stable sentence; the animation is decorative.
 */
export function HeroTitle({ full, prefix, words }: { full: string; prefix: string; words: readonly string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % words.length), 2600);
    return () => window.clearInterval(t);
  }, [reduce, words.length]);

  return (
    <h1 className="display text-[2.7rem] font-bold leading-[1.08] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[4.3rem]">
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">
        {prefix}{" "}
        <span className="relative inline-grid whitespace-nowrap align-baseline">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={words[i]}
              className="relative col-start-1 row-start-1 inline-block"
              initial={reduce ? false : { y: "60%", opacity: 0, rotate: -4 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: "-60%", opacity: 0, rotate: 4 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <span className="relative z-10">{words[i]}</span>
              <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="absolute -bottom-1 start-0 z-0 h-[0.32em] w-full">
                <motion.path
                  d="M3 14 C50 4 120 2 197 10"
                  fill="none"
                  stroke={colors[i % colors.length]}
                  strokeWidth="10"
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </h1>
  );
}
