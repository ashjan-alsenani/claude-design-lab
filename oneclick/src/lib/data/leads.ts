import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { isDemoMode, supabaseServerConfig } from "@/lib/env";
import { createRest, eq, expectOk, type Rest } from "@/lib/supabase/rest";

/**
 * Inbound records: custom solution requests and support messages.
 * Production: Supabase table `oc_leads` (server only, service role).
 * Development (demo mode) writes to a local, git-ignored JSON file instead.
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

class SupabaseLeadStore implements LeadStore {
  readonly mode = "database" as const;
  constructor(private rest: Rest) {}
  async save(record: StoredRecord) {
    const r = await this.rest("oc_leads", {
      method: "POST",
      body: { kind: record.kind, reference: record.reference, status: record.status, data: record.data, created_at: record.createdAt },
      prefer: "return=minimal",
    });
    expectOk(r, "LEAD_WRITE");
  }
  async list(kind: StoredRecord["kind"]) {
    const r = await this.rest(`oc_leads?kind=${eq(kind)}&select=kind,reference,status,data,created_at&order=created_at.desc&limit=500`);
    expectOk(r, "LEAD_READ");
    return (r.data as { kind: StoredRecord["kind"]; reference: string; status: string; data: Record<string, unknown>; created_at: string }[]).map((x) => ({
      kind: x.kind,
      reference: x.reference,
      status: x.status,
      data: x.data,
      createdAt: x.created_at,
    }));
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
  if (isDemoMode()) return new LocalJsonStore();
  const db = supabaseServerConfig();
  return db ? new SupabaseLeadStore(createRest(db)) : new UnavailableStore();
}
