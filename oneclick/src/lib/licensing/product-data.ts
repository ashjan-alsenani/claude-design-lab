import "server-only";
import fs from "node:fs";
import path from "node:path";
import { licensingMode } from "./server";

/**
 * Per-customer, per-product private data (e.g. a bride's whole planner).
 * Production target: Supabase table `product_data` (user_id, product_id, data, version),
 * whose RLS policy already requires an active license (has_active_license).
 * Sandbox: one git-ignored JSON file per customer and product.
 * Callers MUST authorize with the licensing engine first.
 */
export type Stored<T> = { version: number; data: T | null };

export interface ProductDataStore {
  get<T>(userId: string, productId: string): Promise<Stored<T>>;
  put<T>(userId: string, productId: string, data: T, version: number): Promise<void>;
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
}

class UnavailableProductDataStore implements ProductDataStore {
  async get<T>(): Promise<Stored<T>> {
    return { version: 0, data: null };
  }
  async put(): Promise<void> {
    throw new Error("PRODUCT_DATA_NOT_CONNECTED");
  }
}

const g = globalThis as unknown as { __ocProductData?: ProductDataStore };
export function productData(): ProductDataStore {
  g.__ocProductData ??= licensingMode() === "sandbox" ? new FileProductDataStore() : new UnavailableProductDataStore();
  return g.__ocProductData;
}
