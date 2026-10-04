import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { createLicensingEngine, type SessionContext } from "@/lib/licensing/engine";
import { SupabaseLicensingStore } from "@/lib/licensing/store";
import type { Rest } from "@/lib/supabase/rest";
import type { EmailContent } from "@/lib/email/templates";

/** A tiny stand-in for PostgREST that implements exactly the calls the store makes, with latency. */
function fakeSupabase(latency = 3) {
  const t = { row: null as null | { version: number; doc: unknown }, events: [] as unknown[], calls: 0 };
  const wait = () => new Promise((r) => setTimeout(r, Math.random() * latency));
  const rest: Rest = async (path, init = {}) => {
    t.calls++;
    await wait();
    const [table, q = ""] = path.split("?");
    const params = new URLSearchParams(q);
    const method = init.method ?? "GET";
    const body = init.body === undefined ? undefined : JSON.parse(JSON.stringify(init.body));
    if (table === "oc_licensing_state") {
      if (method === "GET") {
        if (!t.row) return { status: 200, data: [] };
        const cols = (params.get("select") ?? "").split(",");
        return { status: 200, data: [Object.fromEntries(cols.map((c) => [c, JSON.parse(JSON.stringify((t.row as Record<string, unknown>)[c]))]))] };
      }
      if (method === "POST") {
        if (t.row) return { status: 409, data: { code: "23505" } };
        t.row = { version: body.version, doc: body.doc };
        return { status: 201, data: null };
      }
      if (method === "PATCH") {
        const expected = Number(params.get("version")!.slice(3));
        if (!t.row || t.row.version !== expected) return { status: 200, data: [] };
        t.row = { version: body.version, doc: body.doc };
        return { status: 200, data: [{ version: body.version }] };
      }
    }
    if (table === "oc_licensing_events" && method === "POST") {
      t.events.push(...body);
      return { status: 201, data: null };
    }
    return { status: 404, data: { code: "PGRST205" } };
  };
  return { rest, t };
}

describe("Supabase licensing store", () => {
  it("saves and reads back across server instances", async () => {
    const { rest } = fakeSupabase();
    const a = new SupabaseLicensingStore(rest), b = new SupabaseLicensingStore(rest);
    await a.write((db) => void (db.policy.defaultDeviceLimit = 3));
    expect(await b.read((db) => db.policy.defaultDeviceLimit)).toBe(3);
    await b.write((db) => void (db.policy.defaultDeviceLimit = 4));
    expect(await a.read((db) => db.policy.defaultDeviceLimit)).toBe(4);
  });

  it("never loses a change when two instances save at the same time", async () => {
    const { rest, t } = fakeSupabase(6);
    const a = new SupabaseLicensingStore(rest, { retries: 40 }), b = new SupabaseLicensingStore(rest, { retries: 40 });
    const jobs = Array.from({ length: 24 }, (_, i) =>
      (i % 2 ? a : b).write((db) => db.audit.push({ id: `aud_${i}`, at: new Date().toISOString(), actorId: null, action: "test", target: String(i) } as never))
    );
    await Promise.all(jobs);
    const ids = await a.read((db) => db.audit.map((x) => x.id).sort());
    expect(ids).toHaveLength(24);
    expect(t.row!.version).toBe(24);
    expect(t.events).toHaveLength(24);
  });

  it("a failed change saves nothing", async () => {
    const { rest, t } = fakeSupabase();
    const s = new SupabaseLicensingStore(rest);
    await expect(s.write(() => { throw new Error("NOPE"); })).rejects.toThrow("NOPE");
    expect(t.row).toBeNull();
  });

  it("keeps the working record small and the full history in the events table", async () => {
    const { rest, t } = fakeSupabase(0);
    const s = new SupabaseLicensingStore(rest, { maxDocLogs: 5 });
    for (let i = 0; i < 12; i++) await s.write((db) => db.accessLogs.push({ id: `log_${i}`, at: new Date().toISOString(), event: "product_open", outcome: "allowed" } as never));
    expect(await s.read((db) => db.accessLogs.length)).toBe(5);
    expect(t.events).toHaveLength(12);
  });

  it("runs the licensing engine end to end: verified sign-in creates a working session", async () => {
    const { rest } = fakeSupabase(1);
    const mails: { to: string; content: EmailContent }[] = [];
    const engine = createLicensingEngine({
      store: new SupabaseLicensingStore(rest),
      products,
      secret: "test-secret-test-secret-test-secret-123",
      baseUrl: "https://oneclick.test",
      mail: async (to, content) => void mails.push({ to, content }),
      ownerEmails: ["owner@example.com"],
    });
    const ch = await engine.startVerification({ email: "owner@example.com", purpose: "signin", locale: "en" });
    if (!ch.ok) throw new Error(ch.reason);
    const code = mails.at(-1)!.content.text.match(/\b(\d{6})\b/)![1];
    const r = await engine.completeVerification({ challengeId: ch.challengeId, code, client: { userAgent: "Mozilla/5.0 (Macintosh) Chrome/130" }, locale: "en" });
    expect(r.kind).toBe("signed_in");
    const ctx = (await engine.getSessionContext((r as { sessionToken: string }).sessionToken)) as SessionContext;
    expect(ctx.roles).toContain("owner");
    expect((await engine.checkAccess(ctx, "prd_bride")).allowed).toBe(true);
  });
});

describe("Supabase REST client", () => {
  it("sends legacy JWT keys in both headers and new secret keys in apikey only", async () => {
    const { createRest } = await import("@/lib/supabase/rest");
    const seen: Record<string, string>[] = [];
    const fake = (async (_url: string, init: RequestInit) => {
      seen.push(init.headers as Record<string, string>);
      return new Response("[]", { status: 200 });
    }) as unknown as typeof fetch;
    await createRest({ url: "https://x.supabase.co/", key: "eyJ.a.b", fetch: fake })("oc_leads");
    await createRest({ url: "https://x.supabase.co", key: "sb_secret_abc", fetch: fake })("oc_leads");
    expect(seen[0].Authorization).toBe("Bearer eyJ.a.b");
    expect(seen[1].Authorization).toBeUndefined();
    expect(seen[1].apikey).toBe("sb_secret_abc");
  });
});
