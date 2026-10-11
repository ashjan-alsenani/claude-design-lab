import type { Metadata } from "next";

/**
 * Guests' pages for «حكاية قدوم» (gift list, visit booking, a guest's own reservation, helper
 * invites). Reached only through random links the mother shares: never indexed, never cached,
 * and the link never leaks to other sites through the Referer header.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true }, referrer: "no-referrer" };

export default function QudoomPublicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
