"use client";

import type { AnalyticsEvent, EventProps } from "./events";

export const CONSENT_KEY = "oc-consent";
export type ConsentState = "analytics" | "essential" | null;

export function readConsent(): ConsentState {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "analytics" || v === "essential" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Provider-independent tracking. Sends nothing unless the visitor allowed analytics
 * AND a provider adapter is registered. No provider is connected yet (COSTS.md).
 */
type Adapter = (event: AnalyticsEvent, props: EventProps) => void;
let adapter: Adapter | null = null;
export function registerAnalyticsAdapter(a: Adapter) {
  adapter = a;
}

export function track(event: AnalyticsEvent, props: EventProps = {}) {
  if (typeof window === "undefined") return;
  if (readConsent() !== "analytics") return;
  if (adapter) adapter(event, props);
  else if (process.env.NODE_ENV === "development") console.debug("[analytics:not-connected]", event, props);
}
