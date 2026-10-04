import "server-only";
import { siteUrl } from "@/lib/seo";
import type { ProviderId } from "./oidc";

export const oauthCookie = "oc_oauth";

/**
 * The callback address registered with Google / Apple. Production always uses the canonical
 * site address (NEXT_PUBLIC_SITE_URL); local development uses the address it is served on.
 */
export function redirectUriFor(p: ProviderId, req: Request) {
  const base = process.env.NODE_ENV === "production" ? siteUrl : new URL(req.url).origin;
  return `${base.replace(/\/+$/, "")}/api/auth/${p}/callback`;
}
