import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { isDemoMode } from "@/lib/env";

/**
 * Inbound records: custom solution requests and support messages.
 * Production target: Supabase tables `custom_requests` and `support_requests`
 * (see supabase/migrations). Until connected, development writes to a local,
 * git-ignored JSON file so the full flow can be tested end to end.
 */
export type CustomRequestStatus = "new" | "reviewing" | "need_info" | "quoted" | "accepted" | "in_progress" | "review" | "completed" | "closed";
export type SupportStatus = "open" | "waiting_customer" | "resolved" | "closed";

export type StoredRecord = { kind: "custom_request" | "support_request"; reference: string; createdAt: string; status: string; data: Record<string, unknown> };

export interface LeadStore {
  readonly mode: "local-demo" | "database" | "unavailable";
  save(record: StoredRecord): Promise<void>;
  list(kind: StoredRecord["kind"]): Promise<StoredRecord[]>;
}

const FILE = path.join(process.cwd(), ".data", "leads.json");

class LocalJsonStore implements LeadStore {
  readonly mode = "local-demo" as const;
  private async readAll(): Promise<StoredRecord[]> {
    try {
      return JSON.parse(await fs.readFile(FILE, "utf8"));
    } catch {
      return [];
    }
  }
  async save(record: StoredRecord) {
    const all = await this.readAll();
    all.push(record);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2));
  }
  async list(kind: StoredRecord["kind"]) {
    return (await this.readAll()).filter((r) => r.kind === kind).reverse();
  }
}

class UnavailableStore implements LeadStore {
  readonly mode = "unavailable" as const;
  async save(): Promise<void> {
    throw new Error("LEAD_STORE_NOT_CONNECTED");
  }
  async list() {
    return [];
  }
}

export function getLeadStore(): LeadStore {
  // When Supabase is connected: return new SupabaseLeadStore().
  return isDemoMode() ? new LocalJsonStore() : new UnavailableStore();
}
