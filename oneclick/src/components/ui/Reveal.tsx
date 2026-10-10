import type { CSSProperties, ReactNode } from "react";

/**
 * Entrance motion in CSS only, so content is painted with the HTML instead of waiting for
 * JavaScript. `above` (first screen): a short rise that starts at first paint, staggered by
 * `delay`. Otherwise: a scroll-driven reveal where the browser supports `animation-timeline`,
 * and plain visible content where it does not. Static under reduced motion (globals.css).
 */
export function Reveal({ children, delay = 0, className = "", y = 20, above = false }: { children: ReactNode; delay?: number; className?: string; y?: number; above?: boolean }) {
  const style = { "--rd": `${Math.round(delay * 1000)}ms`, "--ry": `${y}px` } as CSSProperties;
  return (
    <div className={`${above ? "oc-rise" : "oc-reveal"} ${className}`} style={style}>
      {children}
    </div>
  );
}
