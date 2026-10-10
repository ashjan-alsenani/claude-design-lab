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

export type LeadKind = "custom_request" | "support_request" | "newsletter" | "product_notify";
export type StoredRecord = { kind: LeadKind; reference: string; createdAt: string; status: string; data: Record<string, unknown> };

export const CUSTOM_STATUSES: CustomRequestStatus[] = ["new", "reviewing", "need_info", "quoted", "accepted", "in_progress", "review", "completed", "closed"];
export const SUPPORT_STATUSES: SupportStatus[] = ["open", "waiting_customer", "resolved", "closed"];
/** Still needs the owner's attention. */
export const isOpenLead = (r: StoredRecord) => !["completed", "closed", "resolved", "subscribed", "unsubscribed"].includes(r.status);

export interface LeadStore {
  readonly mode: "local-demo" | "database" | "unavailable";
  save(record: StoredRecord): Promise<void>;
  list(kind: StoredRecord["kind"]): Promise<StoredRecord[]>;
  setStatus(reference: string, status: string): Promise<boolean>;
}

const FILE = path.join(process.cwd(), ".data", "leads.json");

/** Thrown by save() when the same email is already signed up for the same thing. */
export const DUPLICATE_LEAD = "LEAD_DUPLICATE";

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
  async setStatus(reference: string, status: string) {
    const all = await this.readAll();
    const r = all.find((x) => x.reference === reference);
    if (!r) return false;
    r.status = status;
    await fs.writeFile(FILE, JSON.stringify(all, null, 2));
    return true;
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
    // 409 = the unique sign-up index (supabase/migrations/20261010000000_unique_signups.sql).
    if (r.status === 409) throw new Error(DUPLICATE_LEAD);
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
  async setStatus(reference: string, status: string) {
    const r = await this.rest(`oc_leads?reference=${eq(reference)}&select=reference`, { method: "PATCH", body: { status }, prefer: "return=representation" });
    expectOk(r, "LEAD_UPDATE");
    return Array.isArray(r.data) && r.data.length > 0;
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
  async setStatus() {
    return false;
  }
}

export function getLeadStore(): LeadStore {
  if (isDemoMode()) return new LocalJsonStore();
  const db = supabaseServerConfig();
  return db ? new SupabaseLeadStore(createRest(db)) : new UnavailableStore();
}

/** Where new-request notifications go: OWNER_NOTIFICATION_EMAIL, else the first owner email. */
export function ownerNotifyAddress() {
  return process.env.OWNER_NOTIFICATION_EMAIL || (process.env.ONECLICK_OWNER_EMAILS ?? "").split(",").map((x) => x.trim()).find((x) => x.includes("@")) || null;
}
