import { generateKeyPairSync, sign, verify } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { _resetJwksCache, appleClientSecret, authorizeUrl, enabledProviders, pkceChallenge, providerConfig, verifyIdToken } from "@/lib/auth/oidc";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...(publicKey.export({ format: "jwk" }) as object), kid: "k1", alg: "RS256", use: "sig" };
const other = generateKeyPairSync("rsa", { modulusLength: 2048 });
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
const now = Math.floor(Date.now() / 1000);

function token(claims: Record<string, unknown>, key = privateKey, kid = "k1") {
  const head = b64({ alg: "RS256", kid, typ: "JWT" });
  const body = b64({ iss: "https://accounts.google.com", aud: "client-123", sub: "g-1", exp: now + 600, iat: now, nonce: "n1", email: "sara@gmail.com", email_verified: true, ...claims });
  return `${head}.${body}.${sign("sha256", Buffer.from(`${head}.${body}`), key).toString("base64url")}`;
}
const fakeFetch = (async () => new Response(JSON.stringify({ keys: [jwk] }))) as unknown as typeof fetch;
const google = providerConfig("google", { GOOGLE_CLIENT_ID: "client-123", GOOGLE_CLIENT_SECRET: "s" })!;

beforeEach(() => _resetJwksCache());

describe("Continue with Google / Apple", () => {
  it("switches on only with credentials", () => {
    expect(enabledProviders({})).toEqual([]);
    expect(enabledProviders({ GOOGLE_CLIENT_ID: "a", GOOGLE_CLIENT_SECRET: "b" })).toEqual(["google"]);
    expect(enabledProviders({ APPLE_CLIENT_ID: "a", APPLE_TEAM_ID: "t" })).toEqual([]);
  });

  it("asks Google for an authorization code with PKCE, state and nonce", () => {
    const u = new URL(authorizeUrl(google, { redirectUri: "https://www.oneclick.computer/api/auth/google/callback", state: "st", nonce: "n1", verifier: "v".repeat(43), locale: "ar" }));
    expect(u.origin + u.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(Object.fromEntries(u.searchParams)).toMatchObject({ response_type: "code", state: "st", nonce: "n1", code_challenge_method: "S256", code_challenge: pkceChallenge("v".repeat(43)), scope: "openid email profile" });
  });

  it("accepts a valid ID token and reads the verified email", async () => {
    expect(await verifyIdToken(google, token({ name: "Sara" }), "n1", fakeFetch, now)).toEqual({ sub: "g-1", email: "sara@gmail.com", emailVerified: true, name: "Sara" });
  });

  it.each([
    ["a forged signature", token({}, other.privateKey), "OIDC_SIGNATURE"],
    ["an unknown key id", token({}, privateKey, "nope"), "OIDC_KID"],
    ["another app's token", token({ aud: "someone-else" }), "OIDC_AUDIENCE"],
    ["another issuer", token({ iss: "https://evil.example" }), "OIDC_ISSUER"],
    ["an expired token", token({ exp: now - 3600 }), "OIDC_EXPIRED"],
    ["a replayed token (wrong nonce)", token({ nonce: "old" }), "OIDC_NONCE"],
  ])("refuses %s", async (_label, t, err) => {
    await expect(verifyIdToken(google, t, "n1", fakeFetch, now)).rejects.toThrow(err);
  });

  it("refuses unsigned tokens", async () => {
    const t = `${b64({ alg: "none", kid: "k1" })}.${b64({ sub: "x" })}.`;
    await expect(verifyIdToken(google, t, "n1", fakeFetch, now)).rejects.toThrow();
  });

  it("signs Apple's client secret with ES256 and reads Apple's string email_verified", async () => {
    const ec = generateKeyPairSync("ec", { namedCurve: "P-256" });
    const apple = providerConfig("apple", { APPLE_CLIENT_ID: "com.oneclick.web", APPLE_TEAM_ID: "TEAM", APPLE_KEY_ID: "KEY", APPLE_PRIVATE_KEY: ec.privateKey.export({ format: "pem", type: "pkcs8" }).toString() })!;
    const secret = appleClientSecret(apple as Extract<typeof apple, { id: "apple" }>, now);
    const [h, p, s] = secret.split(".");
    expect(JSON.parse(Buffer.from(h, "base64url").toString())).toMatchObject({ alg: "ES256", kid: "KEY" });
    expect(JSON.parse(Buffer.from(p, "base64url").toString())).toMatchObject({ iss: "TEAM", sub: "com.oneclick.web", aud: "https://appleid.apple.com" });
    expect(verify("sha256", Buffer.from(`${h}.${p}`), { key: ec.publicKey, dsaEncoding: "ieee-p1363" }, Buffer.from(s, "base64url"))).toBe(true);
    const t = token({ iss: "https://appleid.apple.com", aud: "com.oneclick.web", email: "x@privaterelay.appleid.com", email_verified: "true" });
    expect(await verifyIdToken(apple, t, "n1", fakeFetch, now)).toMatchObject({ emailVerified: true, email: "x@privaterelay.appleid.com" });
  });
});
