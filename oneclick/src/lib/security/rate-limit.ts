import "server-only";

/**
 * Fixed-window rate limiter. In-memory: correct for a single server instance and for
 * development. On serverless/multi-instance hosting, back this with the database or a
 * KV store (see SECURITY.md) - the interface stays the same.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (b.count >= limit) return { ok: false, remaining: 0, retryAfterMs: b.resetAt - now };
  b.count += 1;
  // Opportunistic cleanup to bound memory.
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  return { ok: true, remaining: limit - b.count };
}

export function clientKey(headers: Headers) {
  const fwd = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || headers.get("x-real-ip") || "unknown";
}
