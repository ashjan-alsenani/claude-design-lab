import type { Hue } from "@/content/types";

/** CSS color for a collection hue. Brand = primary. */
export function hueVar(hue: Hue) {
  return hue === "brand" ? "var(--oc-brand)" : `var(--oc-hue-${hue})`;
}

/** Soft tinted background derived from the hue (works in both themes). */
export function hueSoft(hue: Hue, pct = 12) {
  return `color-mix(in oklab, ${hueVar(hue)} ${pct}%, var(--oc-surface))`;
}
