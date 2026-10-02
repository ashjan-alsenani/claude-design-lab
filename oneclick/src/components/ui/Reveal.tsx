"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Enter-on-scroll reveal. Static under reduced motion. */
export function Reveal({ children, delay = 0, className = "", y = 20 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
