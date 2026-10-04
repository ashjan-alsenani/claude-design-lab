import { cookies } from "next/headers";
import { exchangeCode, PROVIDERS, providerConfig, verifyIdToken, type ProviderId } from "@/lib/auth/oidc";
import { oauthCookie, redirectUriFor } from "@/lib/auth/oauth-web";
import { clientInfo, licensing, startSession, unsealValue } from "@/lib/licensing/server";
import { safeEqual } from "@/lib/licensing/crypto";

type Sealed = { p: ProviderId; state: string; nonce: string; verifier: string; locale: "en" | "ar"; next: string; exp: number };

const go = (to: string, req: Request) => new Response(null, { status: 303, headers: { Location: new URL(to, req.url).toString(), "Cache-Control": "no-store" } });

/**
 * Apple answers with a cross-site form POST, which doesn't carry our SameSite=Lax cookies.
 * Bounce it to a GET on this same URL: a top-level GET navigation does carry them.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const u = new URL(req.url);
  for (const k of ["code", "state", "error", "user"]) {
    const v = form.get(k);
    if (typeof v === "string") u.searchParams.set(k, v.slice(0, 4000));
  }
  return go(u.pathname + u.search, req);
}

export async function GET(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const u = new URL(req.url);
  const jar = await cookies();
  const sealed = unsealValue<Sealed>(jar.get(oauthCookie)?.value);
  jar.delete({ name: oauthCookie, path: "/api/auth" });
  const locale = sealed?.locale ?? "en";
  const fail = (reason: string) => go(`/${locale}/account?e=${reason}`, req);

  const cfg = (PROVIDERS as string[]).includes(provider) ? providerConfig(provider as ProviderId) : null;
  if (!cfg) return fail("oauth_unavailable");
  if (u.searchParams.get("error")) return fail("oauth_cancelled"); // person closed or declined the provider's page
  const code = u.searchParams.get("code"), state = u.searchParams.get("state");
  if (!sealed || sealed.p !== cfg.id || sealed.exp < Date.now() || !code || !state || !safeEqual(state, sealed.state)) return fail("oauth_failed");

  try {
    const idToken = await exchangeCode(cfg, { code, verifier: sealed.verifier, redirectUri: redirectUriFor(cfg.id, req) });
    const claims = await verifyIdToken(cfg, idToken, sealed.nonce);
    let name = claims.name;
    if (!name && cfg.id === "apple") {
      // Apple sends the name once, outside the token, on the first sign-in only.
      try {
        const n = (JSON.parse(u.searchParams.get("user") ?? "{}") as { name?: { firstName?: string; lastName?: string } }).name;
        name = [n?.firstName, n?.lastName].filter(Boolean).join(" ") || undefined;
      } catch {}
    }
    const r = await licensing().engine.providerSignIn({ provider: cfg.id, subject: claims.sub, email: claims.email, emailVerified: claims.emailVerified, name, client: await clientInfo(), locale });
    if (!r.ok) return fail(r.reason === "account_suspended" ? "account_suspended" : "oauth_failed");
    const dest = await startSession(r, locale, sealed.next || null);
    return go(r.deviceState === "pending" ? `/${locale}/account/devices?authorize=1` : dest, req);
  } catch (e) {
    console.error(`oauth: ${cfg.id} sign-in failed: ${e instanceof Error ? e.message : "unknown"}`);
    return fail("oauth_failed");
  }
}
