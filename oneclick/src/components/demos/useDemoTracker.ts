"use client";

import { useCallback, useRef } from "react";
import { track } from "@/lib/analytics/track";

/** Fires `demo_interaction` once per page load for a demo. */
export function useDemoTracker(demoId: string) {
  const sent = useRef(false);
  return useCallback(() => {
    if (sent.current) return;
    sent.current = true;
    track("demo_interaction", { demo_id: demoId });
  }, [demoId]);
}
