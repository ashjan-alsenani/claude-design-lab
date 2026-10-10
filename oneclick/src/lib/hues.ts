import type { Hue } from "@/content/types";

/** CSS color for a collection hue. Brand = primary. */
export function hueVar(hue: Hue) {
  return hue === "brand" ? "var(--oc-brand)" : `var(--oc-hue-${hue})`;
}

/** Soft tinted background derived from the hue (works in both themes). */
export function hueSoft(hue: Hue, pct = 12) {
  return `color-mix(in oklab, ${hueVar(hue)} ${pct}%, var(--oc-surface))`;
}

/**
 * Readable text in a hue's color: the hue mixed toward the theme's ink (darker on light pages,
 * lighter on dark ones), which keeps small colored text above WCAG AA contrast on tinted backgrounds.
 */
export function inkTint(color: string) {
  return `color-mix(in oklab, ${color} 58%, var(--oc-ink))`;
}

export function hueText(hue: Hue) {
  return inkTint(hueVar(hue));
}
