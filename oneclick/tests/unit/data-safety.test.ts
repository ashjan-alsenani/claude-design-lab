import { describe, expect, it } from "vitest";
import { SupabaseProductDataStore } from "@/lib/licensing/product-data";
import type { Rest } from "@/lib/supabase/rest";

/** PostgREST stand-in for oc_product_data: primary key on insert, version filter on update. */
function fakeProductData() {
  const rows = new Map<string, { data: unknown; version: number }>();
  const key = (p: URLSearchParams) => `${p.get("user_id")!.slice(3)}|${p.get("product_id")!.slice(3)}`;
  const rest: Rest = async (path, init = {}) => {
    const [, q = ""] = path.split("?");
    const params = new URLSearchParams(q);
    const body = init.body as { user_id?: string; product_id?: string; data: unknown; version: number };
    await new Promise((r) => setTimeout(r, Math.random() * 3));
    if ((init.method ?? "GET") === "GET") {
      const row = rows.get(key(params));
      return { status: 200, data: row ? [row] : [] };
    }
    if (init.method === "POST") {
      const k = `${body.user_id}|${body.product_id}`;
      if (rows.has(k)) return { status: 409, data: { code: "23505" } };
      rows.set(k, { data: body.data, version: body.version });
      return { status: 201, data: null };
    }
    if (init.method === "PATCH") {
      const k = key(params);
      const expected = Number(params.get("version")!.slice(3));
      const row = rows.get(k);
      if (!row || row.version !== expected) return { status: 200, data: [] };
      rows.set(k, { data: body.data, version: body.version });
      return { status: 200, data: [{ version: body.version }] };
    }
    return { status: 400, data: null };
  };
  return { rest, rows };
}

/** The bridal save loop in miniature: read, apply own change, compare-and-swap, retry on conflict. */
async function addItem(store: SupabaseProductDataStore, item: string) {
  for (let i = 0; i < 20; i++) {
    const cur = await store.get<string[]>("u1", "bride-planner");
    const next = [...(cur.data ?? []), item];
    if (await store.putIfVersion("u1", "bride-planner", next, cur.version)) return true;
  }
  return false;
}

describe("product data: saves from two devices never overwrite each other", () => {
  it("refuses a write based on a stale version", async () => {
    const { rest } = fakeProductData();
    const store = new SupabaseProductDataStore(rest);
    expect(await store.putIfVersion("u1", "p", ["a"], 0)).toBe(true);
    expect(await store.putIfVersion("u1", "p", ["b"], 0)).toBe(false); // second "first save"
    expect(await store.putIfVersion("u1", "p", ["a", "c"], 1)).toBe(true);
    expect(await store.putIfVersion("u1", "p", ["a", "d"], 1)).toBe(false); // stale
    expect((await store.get("u1", "p")).data).toEqual(["a", "c"]);
  });

  it("keeps every change when many saves race", async () => {
    const { rest } = fakeProductData();
    const store = new SupabaseProductDataStore(rest);
    const items = Array.from({ length: 12 }, (_, i) => `item-${i}`);
    const results = await Promise.all(items.map((it) => addItem(store, it)));
    expect(results.every(Boolean)).toBe(true);
    const final = await store.get<string[]>("u1", "bride-planner");
    expect(final.version).toBe(items.length);
    expect([...final.data!].sort()).toEqual([...items].sort());
  });
});
