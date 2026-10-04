import { cookies } from "next/headers";
import { isLocale } from "@/i18n/config";
import { authorizeUrl, PROVIDERS, providerConfig, randomValue, type ProviderId } from "@/lib/auth/oidc";
import { oauthCookie, redirectUriFor } from "@/lib/auth/oauth-web";
import { cookieOptions, licensingMode, safeNext, sealValue } from "@/lib/licensing/server";

/** Starts "Continue with Google / Apple": remembers state, nonce and PKCE verifier in a sealed cookie, then hands off. */
export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const u = new URL(req.url);
  const l = u.searchParams.get("locale") ?? "en";
  const locale = isLocale(l) ? l : "en";
  const cfg = (PROVIDERS as string[]).includes(provider) ? providerConfig(provider as ProviderId) : null;
  if (!cfg || licensingMode() === "unavailable") return Response.redirect(new URL(`/${locale}/account?e=oauth_unavailable`, req.url), 303);
  const state = randomValue(), nonce = randomValue(), verifier = randomValue();
  const next = safeNext(u.searchParams.get("next"), locale) ?? "";
  (await cookies()).set(oauthCookie, sealValue({ p: cfg.id, state, nonce, verifier, locale, next, exp: Date.now() + 10 * 60 * 1000 }), { ...cookieOptions(600), path: "/api/auth" });
  return new Response(null, { status: 303, headers: { Location: authorizeUrl(cfg, { redirectUri: redirectUriFor(cfg.id, req), state, nonce, verifier, locale }), "Cache-Control": "no-store" } });
}
