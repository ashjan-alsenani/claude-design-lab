import { Clicky } from "./Clicky";

/** Logo mark = Clicky. `animated` adds the gentle float + twinkle. */
export function LogoMark({ size = 32, className = "", animated = false, color }: { size?: number; className?: string; animated?: boolean; color?: string }) {
  return <Clicky size={size} className={className} animate={animated} color={color} />;
}

/** Primary lockup: Clicky + "One Click". Always left-to-right. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`group inline-flex items-center gap-2 ${className}`} dir="ltr" style={{ fontFamily: "Rubik, sans-serif" }}>
      <Clicky size={38} className="transition-transform duration-300 ease-[var(--ease-bounce)] group-hover:-rotate-6 group-hover:scale-110" />
      <span className="text-[1.4rem] font-bold tracking-[-0.01em] text-ink">One Click</span>
    </span>
  );
}
