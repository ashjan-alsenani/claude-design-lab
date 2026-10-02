import { Clicky } from "./Clicky";

/** Logo mark = Clicky's face. `animated` adds the gentle float. */
export function LogoMark({ size = 32, className = "", animated = false }: { size?: number; className?: string; animated?: boolean }) {
  return <Clicky size={size} className={className} animate={animated} />;
}

/** Primary lockup: Clicky + "One Click" with "DIGITAL HUB" beneath. Always left-to-right. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} dir="ltr" style={{ fontFamily: "Rubik, sans-serif" }}>
      <Clicky size={36} />
      <span className="flex flex-col leading-none">
        <span className="text-[1.22rem] font-bold tracking-[-0.01em] text-ink">One Click</span>
        <span className="mt-[4px] text-[0.58rem] font-semibold tracking-[0.26em] text-muted">DIGITAL HUB</span>
      </span>
    </span>
  );
}
