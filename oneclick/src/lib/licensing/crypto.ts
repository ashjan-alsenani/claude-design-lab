import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Small, dependency-free crypto helpers for the licensing engine.
 * - Random tokens: 32 bytes from the OS CSPRNG, base64url.
 * - Stored secrets (session/device/claim tokens, verification codes) are kept only as
 *   HMAC-SHA256 digests keyed with LICENSING_SECRET, so a database leak does not
 *   reveal usable tokens or codes.
 * - Passwords: scrypt with a per-user salt.
 */
export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function randomId(prefix: string) {
  return `${prefix}_${randomBytes(12).toString("base64url")}`;
}

export function hmac(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** 6-digit numeric one-time code, uniformly random. */
export function generateCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function isValidEmail(email: string) {
  return email.length <= 254 && EMAIL_RE.test(email);
}

/** "sara@example.com" -> "s•••a@example.com". Shown when the full address must stay private. */
export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return "•••";
  const shown = local.length <= 2 ? local[0] + "•" : `${local[0]}•••${local[local.length - 1]}`;
  return `${shown}@${domain}`;
}

const SCRYPT = { N: 16384, r: 8, p: 1, len: 64 };

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, SCRYPT.len, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p }).toString("base64url");
  return `scrypt$${SCRYPT.N}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string | undefined) {
  // Always do the work, even without a stored hash, so timing does not reveal accounts.
  const [, n, salt, hash] = (stored ?? `scrypt$${SCRYPT.N}$${"x".repeat(22)}$${"x".repeat(86)}`).split("$");
  const derived = scryptSync(password, salt, SCRYPT.len, { N: Number(n), r: SCRYPT.r, p: SCRYPT.p }).toString("base64url");
  return !!stored && safeEqual(derived, hash);
}

/** Signed, expiring token for short-lived links (e.g. downloads). Not a secret store. */
export function signPayload(secret: string, payload: Record<string, string | number>) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(secret, body)}`;
}

export function verifySignedPayload<T>(secret: string, token: string): T | null {
  const [body, sig] = token.split(".");
  if (!body || !sig || !safeEqual(sig, hmac(secret, body))) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}
