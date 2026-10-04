/**
 * Minimal server-side client for Supabase's REST API (PostgREST), using the service role key.
 * Server only: the key bypasses Row Level Security and must never reach a browser. No SDK
 * dependency; every call is a plain fetch so it is easy to audit and to fake in tests.
 */
export type RestResponse = { status: number; data: unknown };
export type Rest = (path: string, init?: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; prefer?: string }) => Promise<RestResponse>;

export function createRest(opts: { url: string; key: string; fetch?: typeof fetch; timeoutMs?: number }): Rest {
  const base = `${opts.url.replace(/\/+$/, "")}/rest/v1/`;
  const doFetch = opts.fetch ?? fetch;
  return async (path, init = {}) => {
    const res = await doFetch(base + path, {
      method: init.method ?? "GET",
      headers: {
        apikey: opts.key,
        // Legacy service_role keys are JWTs and go in both headers. New secret keys (sb_secret_…)
        // are not JWTs: the API gateway reads them from `apikey` only.
        ...(opts.key.startsWith("sb_") ? {} : { Authorization: `Bearer ${opts.key}` }),
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(opts.timeoutMs ?? 10_000),
    });
    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    return { status: res.status, data };
  };
}

/** Throws a short error (status + PostgREST code only, never row data) for unexpected responses. */
export function expectOk(r: RestResponse, what: string) {
  if (r.status >= 200 && r.status < 300) return;
  const code = r.data && typeof r.data === "object" && "code" in r.data ? String((r.data as { code: unknown }).code) : "";
  throw new Error(`SUPABASE_${what}_${r.status}${code ? `_${code}` : ""}`);
}

export const eq = (v: string) => `eq.${encodeURIComponent(v)}`;
