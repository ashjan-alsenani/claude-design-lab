import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { hmac, randomToken } from "@/lib/licensing/crypto";
import { licensingSecret } from "@/lib/licensing/server";

/**
 * Link tokens. The database stores only an HMAC of each token (keyed with LICENSING_SECRET) for
 * lookups, so a database leak gives no working links. Links the mother may copy again later (her
 * gift list, her visits page, a helper invite) also keep an AES-256-GCM sealed copy, readable only
 * by this server with the same secret.
 */
export const newToken = () => randomToken(24);
export const tokenHash = (token: string) => hmac(licensingSecret(), `qudoom:${token}`);

const key = () => createHash("sha256").update(`qudoom-seal:${licensingSecret()}`).digest();

export function seal(plain: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), body].map((b) => b.toString("base64url")).join(".");
}

export function unseal(sealed: string): string | null {
  try {
    const [iv, tag, body] = sealed.split(".").map((x) => Buffer.from(x, "base64url"));
    const d = createDecipheriv("aes-256-gcm", key(), iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(body), d.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Tokens in URLs are base64url of fixed length; anything else is rejected before a lookup. */
export const looksLikeToken = (t: unknown): t is string => typeof t === "string" && /^[A-Za-z0-9_-]{32}$/.test(t);
