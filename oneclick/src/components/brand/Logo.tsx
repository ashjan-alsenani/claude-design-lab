import { Clicky } from "./Clicky";

/** Logo mark = Clicky. `animated` adds the gentle float + twinkle. */
export function LogoMark({ size = 32, className = "", animated = false, color }: { size?: number; className?: string; animated?: boolean; color?: string }) {
  return <Clicky size={size} className={className} animate={animated} color={color} />;
}

/**
 * Primary lockup: Clicky + the name. On Arabic pages the name reads «ون كليك» and the lockup runs
 * right-to-left (Clicky on the right, where Arabic readers start); otherwise "One Click", left-to-right.
 */
export function Logo({ className = "", locale = "en" }: { className?: string; locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  return (
    <span className={`group inline-flex items-center gap-2 ${className}`} dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"} style={{ fontFamily: "Rubik, sans-serif" }}>
      <Clicky size={38} blink className="transition-transform duration-300 ease-[var(--ease-bounce)] group-hover:-rotate-6 group-hover:scale-110" />
      <span className={`font-bold text-ink ${ar ? "text-[1.45rem] leading-none" : "text-[1.4rem] tracking-[-0.01em]"}`}>{ar ? "ون كليك" : "One Click"}</span>
    </span>
  );
}
