"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Full-screen product apps (e.g. Bridal Journey) bring their own navigation. */
export function ChromeGate({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "";
  if (/^\/(en|ar)\/(app|demo)\/bride-planner(\/|$)/.test(path)) return null;
  return <>{children}</>;
}
