"use client";

import { useEffect, useState } from "react";
import { Confetti } from "@/components/ui/Confetti";

/** A few rounds of confetti to the beat of Clicky's dance (Confetti itself skips under reduced motion). */
export function PurchaseParty({ bursts = 4, everyMs = 1300 }: { bursts?: number; everyMs?: number }) {
  // -1 until mounted: confetti positions are random, so they are only drawn in the browser.
  const [n, setN] = useState(-1);
  useEffect(() => {
    if (n === -1) return setN(0);
    if (n >= bursts - 1) return;
    const t = window.setTimeout(() => setN((v) => v + 1), everyMs);
    return () => window.clearTimeout(t);
  }, [n, bursts, everyMs]);
  return n < 0 ? null : <Confetti key={n} pieces={40} />;
}
