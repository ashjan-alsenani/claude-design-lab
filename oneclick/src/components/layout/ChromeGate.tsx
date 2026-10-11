"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Full-screen product apps (e.g. Bridal Journey) bring their own navigation. */
export function ChromeGate({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "";
  if (/^\/(en|ar)\/(app|demo)\/(bride-planner|hikayat-qudoom)(\/|$)/.test(path)) return null;
  // Qudoom helper view and the guests' public pages (gift list, visits, manage, invite) have their own frame.
  if (/^\/(en|ar)\/(shared\/hikayat-qudoom|q)\//.test(path)) return null;
  return <>{children}</>;
}
