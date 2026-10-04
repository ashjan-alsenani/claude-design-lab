import { createHash, createPrivateKey, createPublicKey, randomBytes, sign as cryptoSign, verify as cryptoVerify } from "node:crypto";

/**
 * "Continue with Google / Apple" (OpenID Connect, authorization-code flow).
 * Server-only. Each provider switches on only when its credentials are in the environment:
 *   Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *   Apple:  APPLE_CLIENT_ID (Services ID), APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY (.p8 contents)
 * The ID token is verified here (signature against the provider's published keys, issuer,
 * audience, expiry and nonce); a provider-asserted email is used only when marked verified.
 */
export type ProviderId = "google" | "apple";
export const PROVIDERS: ProviderId[] = ["google", "apple"];

type Endpoints = { authorize: string; token: string; jwks: string; issuers: string[] };
const ENDPOINTS: Record<ProviderId, Endpoints> = {
  google: {
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    jwks: "https://www.googleapis.com/oauth2/v3/certs",
    issuers: ["https://accounts.google.com", "accounts.google.com"],
  },
  apple: {
    authorize: "https://appleid.apple.com/auth/authorize",
    token: "https://appleid.apple.com/auth/token",
    jwks: "https://appleid.apple.com/auth/keys",
    issuers: ["https://appleid.apple.com"],
  },
};

type Env = Record<string, string | undefined>;
export type ProviderConfig =
  | { id: "google"; clientId: string; clientSecret: string; endpoints: Endpoints }
  | { id: "apple"; clientId: string; teamId: string; keyId: string; privateKey: string; endpoints: Endpoints };

export function providerConfig(id: ProviderId, env: Env = process.env): ProviderConfig | null {
  if (id === "google" && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    return { id, clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, endpoints: ENDPOINTS.google };
  }
  if (id === "apple" && env.APPLE_CLIENT_ID && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY) {
    // Vercel stores multi-line values fine, but accept "\n"-escaped keys too.
    return { id, clientId: env.APPLE_CLIENT_ID, teamId: env.APPLE_TEAM_ID, keyId: env.APPLE_KEY_ID, privateKey: env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"), endpoints: ENDPOINTS.apple };
  }
  return null;
}

export function enabledProviders(env: Env = process.env): ProviderId[] {
  return PROVIDERS.filter((p) => providerConfig(p, env));
}

const b64url = (b: Buffer) => b.toString("base64url");
export const randomValue = () => b64url(randomBytes(32));
export const pkceChallenge = (verifier: string) => b64url(createHash("sha256").update(verifier).digest());

export function authorizeUrl(cfg: ProviderConfig, p: { redirectUri: string; state: string; nonce: string; verifier: string; locale: string }) {
  const u = new URL(cfg.endpoints.authorize);
  u.searchParams.set("client_id", cfg.clientId);
  u.searchParams.set("redirect_uri", p.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("state", p.state);
  u.searchParams.set("nonce", p.nonce);
  if (cfg.id === "google") {
    u.searchParams.set("scope", "openid email profile");
    u.searchParams.set("code_challenge", pkceChallenge(p.verifier));
    u.searchParams.set("code_challenge_method", "S256");
    u.searchParams.set("prompt", "select_account");
    u.searchParams.set("hl", p.locale);
  } else {
    // Apple only returns email and name when asked, and then requires a form POST back.
    u.searchParams.set("scope", "name email");
    u.searchParams.set("response_mode", "form_post");
    u.searchParams.set("locale", p.locale === "ar" ? "ar_SA" : "en_US");
  }
  return u.toString();
}

/** Apple's client secret is a short-lived ES256 JWT signed with the team's private key. */
export function appleClientSecret(cfg: Extract<ProviderConfig, { id: "apple" }>, nowSec = Math.floor(Date.now() / 1000)) {
  const header = b64url(Buffer.from(JSON.stringify({ alg: "ES256", kid: cfg.keyId, typ: "JWT" })));
  const payload = b64url(Buffer.from(JSON.stringify({ iss: cfg.teamId, iat: nowSec, exp: nowSec + 300, aud: "https://appleid.apple.com", sub: cfg.clientId })));
  const sig = cryptoSign("sha256", Buffer.from(`${header}.${payload}`), { key: createPrivateKey(cfg.privateKey), dsaEncoding: "ieee-p1363" });
  return `${header}.${payload}.${b64url(sig)}`;
}

type Fetch = typeof fetch;

export async function exchangeCode(cfg: ProviderConfig, p: { code: string; verifier: string; redirectUri: string }, f: Fetch = fetch) {
  const body = new URLSearchParams({ grant_type: "authorization_code", code: p.code, redirect_uri: p.redirectUri, client_id: cfg.clientId });
  if (cfg.id === "google") {
    body.set("client_secret", cfg.clientSecret);
    body.set("code_verifier", p.verifier);
  } else {
    body.set("client_secret", appleClientSecret(cfg));
  }
  const res = await f(cfg.endpoints.token, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`OIDC_TOKEN_${res.status}`);
  const json = (await res.json()) as { id_token?: string };
  if (!json.id_token) throw new Error("OIDC_NO_ID_TOKEN");
  return json.id_token;
}

type Jwk = JsonWebKey & { kid?: string; alg?: string };
const jwksCache = new Map<string, { at: number; keys: Jwk[] }>();

async function keysFor(url: string, f: Fetch, refresh = false) {
  const hit = jwksCache.get(url);
  if (hit && !refresh && Date.now() - hit.at < 3600_000) return hit.keys;
  const res = await f(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`OIDC_JWKS_${res.status}`);
  const keys = ((await res.json()) as { keys: Jwk[] }).keys ?? [];
  jwksCache.set(url, { at: Date.now(), keys });
  return keys;
}

export type IdClaims = { sub: string; email?: string; emailVerified: boolean; name?: string };

export async function verifyIdToken(cfg: ProviderConfig, token: string, expectedNonce: string, f: Fetch = fetch, nowSec = Math.floor(Date.now() / 1000)): Promise<IdClaims> {
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) throw new Error("OIDC_MALFORMED");
  const header = JSON.parse(Buffer.from(h, "base64url").toString()) as { alg?: string; kid?: string };
  if (header.alg !== "RS256" || !header.kid) throw new Error("OIDC_ALG");
  let jwk = (await keysFor(cfg.endpoints.jwks, f)).find((k) => k.kid === header.kid);
  if (!jwk) jwk = (await keysFor(cfg.endpoints.jwks, f, true)).find((k) => k.kid === header.kid); // keys rotate
  if (!jwk) throw new Error("OIDC_KID");
  const ok = cryptoVerify("sha256", Buffer.from(`${h}.${p}`), createPublicKey({ key: jwk, format: "jwk" }), Buffer.from(s, "base64url"));
  if (!ok) throw new Error("OIDC_SIGNATURE");
  const c = JSON.parse(Buffer.from(p, "base64url").toString()) as Record<string, unknown>;
  const aud = Array.isArray(c.aud) ? c.aud : [c.aud];
  if (!cfg.endpoints.issuers.includes(String(c.iss))) throw new Error("OIDC_ISSUER");
  if (!aud.includes(cfg.clientId)) throw new Error("OIDC_AUDIENCE");
  if (typeof c.exp !== "number" || c.exp < nowSec - 60) throw new Error("OIDC_EXPIRED");
  if (typeof c.iat === "number" && c.iat > nowSec + 300) throw new Error("OIDC_IAT");
  if (c.nonce !== expectedNonce) throw new Error("OIDC_NONCE");
  if (typeof c.sub !== "string" || !c.sub) throw new Error("OIDC_SUB");
  // Apple sends email_verified as the string "true".
  const emailVerified = c.email_verified === true || c.email_verified === "true";
  return { sub: c.sub, email: typeof c.email === "string" ? c.email : undefined, emailVerified, name: typeof c.name === "string" ? c.name : undefined };
}

/** For tests: forget cached provider keys. */
export function _resetJwksCache() {
  jwksCache.clear();
}
