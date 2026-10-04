import type { ReactNode } from "react";

// Personal pages: always rendered per request, so they follow the live database settings and the
// visitor's own session, never a copy baked at build time.
export const dynamic = "force-dynamic";

export default function PrivateSegmentLayout({ children }: { children: ReactNode }) {
  return children;
}
