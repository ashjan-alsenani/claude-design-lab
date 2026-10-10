import "server-only";
import fs from "node:fs";
import path from "node:path";
import { supabaseServerConfig } from "@/lib/env";
import { createRest, eq, expectOk, type Rest } from "@/lib/supabase/rest";
import { licensingMode } from "./server";

/**
 * Per-customer, per-product private data (e.g. a bride's whole planner).
 * Production: Supabase table `oc_product_data` (server only, service role).
 * Sandbox: one git-ignored JSON file per customer and product.
 * Callers MUST authorize with the licensing engine first.
 */
export type Stored<T> = { version: number; data: T | null };

export interface ProductDataStore {
  get<T>(userId: string, productId: string): Promise<Stored<T>>;
  put<T>(userId: string, productId: string, data: T, version: number): Promise<void>;
  /**
   * Compare-and-swap write: stores `data` as `expected + 1` only if the stored version is still
   * `expected` (0 = no row yet). Returns false when another save got there first, so the caller can
   * re-read, re-apply its changes and try again instead of overwriting them.
   */
  putIfVersion<T>(userId: string, productId: string, data: T, expected: number): Promise<boolean>;
}

const safe = (s: string) => s.replace(/[^A-Za-z0-9_-]/g, "_");

class FileProductDataStore implements ProductDataStore {
  private dir = path.join(process.cwd(), ".data", "product-data");
  private queue: Promise<unknown> = Promise.resolve();
  private file(u: string, p: string) {
    return path.join(this.dir, `${safe(u)}--${safe(p)}.json`);
  }
  async get<T>(u: string, p: string): Promise<Stored<T>> {
    await this.queue;
    try {
      return JSON.parse(fs.readFileSync(this.file(u, p), "utf8"));
    } catch {
      return { version: 0, data: null };
    }
  }
  put<T>(u: string, p: string, data: T, version: number) {
    const run = this.queue.then(() => {
      fs.mkdirSync(this.dir, { recursive: true });
      const f = this.file(u, p);
      fs.writeFileSync(`${f}.tmp`, JSON.stringify({ version, data }));
      fs.renameSync(`${f}.tmp`, f);
    });
    this.queue = run.catch(() => undefined);
    return run;
  }
  putIfVersion<T>(u: string, p: string, data: T, expected: number) {
    const run = this.queue.then(() => {
      let current = 0;
      try {
        current = Number(JSON.parse(fs.readFileSync(this.file(u, p), "utf8")).version) || 0;
      } catch {}
      if (current !== expected) return false;
      fs.mkdirSync(this.dir, { recursive: true });
      const f = this.file(u, p);
      fs.writeFileSync(`${f}.tmp`, JSON.stringify({ version: expected + 1, data }));
      fs.renameSync(`${f}.tmp`, f);
      return true;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }
}

export class SupabaseProductDataStore implements ProductDataStore {
  constructor(private rest: Rest) {}
  async get<T>(u: string, p: string): Promise<Stored<T>> {
    const r = await this.rest(`oc_product_data?user_id=${eq(u)}&product_id=${eq(p)}&select=data,version`);
    expectOk(r, "PRODUCT_DATA_READ");
    const row = (r.data as { data: T | null; version: number }[])[0];
    return row ? { version: Number(row.version), data: row.data } : { version: 0, data: null };
  }
  async put<T>(u: string, p: string, data: T, version: number) {
    const r = await this.rest("oc_product_data?on_conflict=user_id,product_id", {
      method: "POST",
      body: { user_id: u, product_id: p, data, version, updated_at: new Date().toISOString() },
      prefer: "resolution=merge-duplicates,return=minimal",
    });
    expectOk(r, "PRODUCT_DATA_WRITE");
  }
  async putIfVersion<T>(u: string, p: string, data: T, expected: number) {
    const body = { data, version: expected + 1, updated_at: new Date().toISOString() };
    if (expected === 0) {
      // First save: a plain insert. If a row appeared meanwhile, the primary key rejects it (409).
      const r = await this.rest("oc_product_data", { method: "POST", body: { user_id: u, product_id: p, ...body }, prefer: "return=minimal" });
      if (r.status === 409) return false;
      expectOk(r, "PRODUCT_DATA_WRITE");
      return true;
    }
    const r = await this.rest(`oc_product_data?user_id=${eq(u)}&product_id=${eq(p)}&version=eq.${expected}&select=version`, { method: "PATCH", body, prefer: "return=representation" });
    expectOk(r, "PRODUCT_DATA_WRITE");
    return Array.isArray(r.data) && r.data.length === 1;
  }
}

class UnavailableProductDataStore implements ProductDataStore {
  async get<T>(): Promise<Stored<T>> {
    return { version: 0, data: null };
  }
  async put(): Promise<void> {
    throw new Error("PRODUCT_DATA_NOT_CONNECTED");
  }
  async putIfVersion(): Promise<boolean> {
    throw new Error("PRODUCT_DATA_NOT_CONNECTED");
  }
}

const g = globalThis as unknown as { __ocProductData?: ProductDataStore };
export function productData(): ProductDataStore {
  if (!g.__ocProductData) {
    const mode = licensingMode(), db = supabaseServerConfig();
    g.__ocProductData = mode === "sandbox" ? new FileProductDataStore() : mode === "database" && db ? new SupabaseProductDataStore(createRest(db)) : new UnavailableProductDataStore();
  }
  return g.__ocProductData;
}
