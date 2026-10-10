"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * A thin bar at the top that starts the instant an internal link is clicked and finishes when the
 * new page is on screen. It only listens; navigation itself stays with Next's <Link>. Clicks that
 * open a new tab, downloads, hash links and links to the current page are ignored.
 */
export function NavProgress() {
  const path = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const loading = useRef(false);
  const failsafe = useRef<number | undefined>(undefined);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      // Capture phase: <Link> calls preventDefault() in its own handler, which runs before a bubbling listener.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      loading.current = true;
      setState("loading");
      // A link whose own handler cancels navigation must not leave the bar running.
      window.clearTimeout(failsafe.current);
      failsafe.current = window.setTimeout(() => {
        loading.current = false;
        setState("idle");
      }, 10_000);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!loading.current) return;
    loading.current = false;
    window.clearTimeout(failsafe.current);
    setState("done");
    const t = window.setTimeout(() => setState("idle"), 400);
    return () => window.clearTimeout(t);
  }, [path, search]);

  if (state === "idle") return null;
  return <div aria-hidden="true" className="oc-navbar" data-state={state} />;
}
