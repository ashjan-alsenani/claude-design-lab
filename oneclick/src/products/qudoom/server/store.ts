import "server-only";
import fs from "node:fs";
import path from "node:path";
import { supabaseServerConfig } from "@/lib/env";
import { licensingMode } from "@/lib/licensing/server";
import { createRest, eq, expectOk, type Rest } from "@/lib/supabase/rest";
import type { SectionId } from "../model/types";
import type { Projection } from "../model/share";

/**
 * The shared side of «حكاية قدوم»: public-link projections, guests' gift reservations and visit
 * requests, and invited helpers. Production: Supabase tables oc_qd_* (server only); the races that
 * matter (last gift, last seats) are decided inside PostgreSQL functions under a row lock.
 * Sandbox: one JSON file with the same rules, serialized in-process.
 */
export type Kind = "gifts" | "visits";
export type OwnerRow = { ownerId: string; projection: Projection; reserveDays: number };
export type LinkRow = { ownerId: string; kind: Kind; tokenHash: string; tokenSealed: string; active: boolean; expiresAt: string | null; createdAt: string };
export type ClaimRow = { id: string; ownerId: string; giftId: string; qty: number; status: "reserved" | "purchased" | "cancelled"; guestName: string; anonymous: boolean; manageHash: string; expiresAt: string; createdAt: string };
export type RequestRow = { id: string; ownerId: string; name: string; phone: string | null; people: number; day: string; slot: string; note: string | null; status: "pending" | "approved" | "declined" | "cancelled"; holdUntil: string; manageHash: string; createdAt: string };
export type HelperRow = { id: string; ownerId: string; email: string; sections: SectionId[]; canEdit: boolean; status: "invited" | "active" | "revoked"; inviteHash: string; inviteSealed: string; userId: string | null; createdAt: string };
export type Outcome = "ok" | "full" | "not_found";

export interface QudoomStore {
  owner(ownerId: string): Promise<OwnerRow | null>;
  /** Creates the owner's row if needed and stores the projection. */
  publish(ownerId: string, projection: Projection): Promise<void>;
  /** Updates the projection only if the owner already has a row (i.e. has shared something). */
  republish(ownerId: string, projection: Projection): Promise<void>;
  setReserveDays(ownerId: string, days: number): Promise<void>;
  links(ownerId: string): Promise<LinkRow[]>;
  linkByHash(hash: string): Promise<LinkRow | null>;
  putLink(row: LinkRow): Promise<void>;
  setLinkActive(ownerId: string, kind: Kind, active: boolean): Promise<void>;
  claims(ownerId: string): Promise<ClaimRow[]>;
  claimByHash(hash: string): Promise<ClaimRow | null>;
  reserveGift(c: Omit<ClaimRow, "status" | "createdAt"> & { purchased: boolean }): Promise<Outcome>;
  claimAction(manageHash: string, action: "purchase" | "cancel"): Promise<Outcome>;
  requests(ownerId: string): Promise<RequestRow[]>;
  requestByHash(hash: string): Promise<RequestRow | null>;
  /** Seats taken per "YYYY-MM-DDTHH:MM" by approved requests and pending ones still on hold. */
  booked(ownerId: string, fromDay: string): Promise<Record<string, number>>;
  requestVisit(r: Omit<RequestRow, "status" | "createdAt">): Promise<Outcome>;
  decideVisit(ownerId: string, id: string, decision: "approve" | "decline"): Promise<Outcome>;
  cancelVisit(manageHash: string): Promise<Outcome>;
  helpers(ownerId: string): Promise<HelperRow[]>;
  helper(id: string): Promise<HelperRow | null>;
  helperByInvite(hash: string): Promise<HelperRow | null>;
  helpersOfUser(userId: string): Promise<HelperRow[]>;
  putHelper(row: HelperRow): Promise<void>;
  updateHelper(ownerId: string, id: string, patch: Partial<Pick<HelperRow, "sections" | "canEdit" | "status" | "userId">>): Promise<boolean>;
  /** Removes the owner's links, reservations, requests and helpers (her plan is deleted separately). */
  deleteOwner(ownerId: string): Promise<void>;
}

const live = (r: { status: string; holdUntil: string }, now: number) => r.status === "approved" || (r.status === "pending" && Date.parse(r.holdUntil) > now);
const holds = (c: { status: string; expiresAt: string }, now: number) => c.status === "purchased" || (c.status === "reserved" && Date.parse(c.expiresAt) > now);

// ---------- sandbox ----------
type FileDb = { owners: OwnerRow[]; links: LinkRow[]; claims: ClaimRow[]; requests: RequestRow[]; helpers: HelperRow[] };

class FileQudoomStore implements QudoomStore {
  private file = path.join(process.cwd(), ".data", "qudoom.json");
  private queue: Promise<unknown> = Promise.resolve();
  private read(): FileDb {
    try {
      return JSON.parse(fs.readFileSync(this.file, "utf8"));
    } catch {
      return { owners: [], links: [], claims: [], requests: [], helpers: [] };
    }
  }
  private tx<T>(fn: (db: FileDb) => T, write = true): Promise<T> {
    const run = this.queue.then(() => {
      const db = this.read();
      const out = fn(db);
      if (write) {
        fs.mkdirSync(path.dirname(this.file), { recursive: true });
        fs.writeFileSync(`${this.file}.tmp`, JSON.stringify(db));
        fs.renameSync(`${this.file}.tmp`, this.file);
      }
      return out;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }
  owner = (id: string) => this.tx((db) => db.owners.find((o) => o.ownerId === id) ?? null, false);
  publish = (id: string, projection: Projection) =>
    this.tx((db) => {
      const o = db.owners.find((x) => x.ownerId === id);
      if (o) o.projection = projection;
      else db.owners.push({ ownerId: id, projection, reserveDays: 7 });
    });
  republish = (id: string, projection: Projection) =>
    this.tx((db) => {
      const o = db.owners.find((x) => x.ownerId === id);
      if (o) o.projection = projection;
    });
  setReserveDays = (id: string, days: number) =>
    this.tx((db) => {
      const o = db.owners.find((x) => x.ownerId === id);
      if (o) o.reserveDays = days;
    });
  links = (id: string) => this.tx((db) => db.links.filter((l) => l.ownerId === id), false);
  linkByHash = (h: string) => this.tx((db) => db.links.find((l) => l.tokenHash === h) ?? null, false);
  putLink = (row: LinkRow) =>
    this.tx((db) => {
      db.links = db.links.filter((l) => !(l.ownerId === row.ownerId && l.kind === row.kind));
      db.links.push(row);
    });
  setLinkActive = (id: string, kind: Kind, active: boolean) =>
    this.tx((db) => {
      const l = db.links.find((x) => x.ownerId === id && x.kind === kind);
      if (l) l.active = active;
    });
  claims = (id: string) => this.tx((db) => db.claims.filter((c) => c.ownerId === id), false);
  claimByHash = (h: string) => this.tx((db) => db.claims.find((c) => c.manageHash === h) ?? null, false);
  reserveGift = (c: Omit<ClaimRow, "status" | "createdAt"> & { purchased: boolean }) =>
    this.tx((db): Outcome => {
      const o = db.owners.find((x) => x.ownerId === c.ownerId);
      const g = o?.projection.gifts.find((x) => x.id === c.giftId);
      if (!o || !g) return "not_found";
      const now = Date.now();
      const taken = db.claims.filter((x) => x.ownerId === c.ownerId && x.giftId === c.giftId && holds(x, now)).reduce((n, x) => n + x.qty, 0);
      if (taken + c.qty > g.qtyNeeded) return "full";
      const { purchased, ...row } = c;
      db.claims.push({ ...row, status: purchased ? "purchased" : "reserved", createdAt: new Date().toISOString() });
      return "ok";
    });
  claimAction = (h: string, action: "purchase" | "cancel") =>
    this.tx((db): Outcome => {
      const c = db.claims.find((x) => x.manageHash === h);
      if (!c || c.status === "cancelled") return "not_found";
      if (action === "cancel") {
        if (c.status !== "reserved") return "not_found";
        c.status = "cancelled";
        return "ok";
      }
      if (c.status === "purchased") return "ok";
      const now = Date.now();
      if (Date.parse(c.expiresAt) <= now) {
        const g = db.owners.find((x) => x.ownerId === c.ownerId)?.projection.gifts.find((x) => x.id === c.giftId);
        const taken = db.claims.filter((x) => x.id !== c.id && x.ownerId === c.ownerId && x.giftId === c.giftId && holds(x, now)).reduce((n, x) => n + x.qty, 0);
        if (!g || taken + c.qty > g.qtyNeeded) return "full";
      }
      c.status = "purchased";
      return "ok";
    });
  requests = (id: string) => this.tx((db) => db.requests.filter((r) => r.ownerId === id), false);
  requestByHash = (h: string) => this.tx((db) => db.requests.find((r) => r.manageHash === h) ?? null, false);
  booked = (id: string, from: string) =>
    this.tx((db) => {
      const now = Date.now();
      const out: Record<string, number> = {};
      for (const r of db.requests) if (r.ownerId === id && r.day >= from && live(r, now)) out[`${r.day}T${r.slot}`] = (out[`${r.day}T${r.slot}`] ?? 0) + r.people;
      return out;
    }, false);
  private taken(db: FileDb, o: OwnerRow, day: string, slot: string, except?: string) {
    const now = Date.now();
    return (o.projection.visits.manual[`${day}T${slot}`] ?? 0) + db.requests.filter((r) => r.ownerId === o.ownerId && r.day === day && r.slot === slot && r.id !== except && live(r, now)).reduce((n, r) => n + r.people, 0);
  }
  requestVisit = (r: Omit<RequestRow, "status" | "createdAt">) =>
    this.tx((db): Outcome => {
      const o = db.owners.find((x) => x.ownerId === r.ownerId);
      if (!o) return "not_found";
      if (this.taken(db, o, r.day, r.slot) + r.people > o.projection.visits.settings.maxPeople) return "full";
      db.requests.push({ ...r, status: "pending", createdAt: new Date().toISOString() });
      return "ok";
    });
  decideVisit = (ownerId: string, id: string, decision: "approve" | "decline") =>
    this.tx((db): Outcome => {
      const o = db.owners.find((x) => x.ownerId === ownerId);
      const r = db.requests.find((x) => x.id === id && x.ownerId === ownerId);
      if (!o || !r || r.status !== "pending") return "not_found";
      if (decision === "approve" && Date.parse(r.holdUntil) <= Date.now() && this.taken(db, o, r.day, r.slot, r.id) + r.people > o.projection.visits.settings.maxPeople) return "full";
      r.status = decision === "approve" ? "approved" : "declined";
      return "ok";
    });
  cancelVisit = (h: string) =>
    this.tx((db): Outcome => {
      const r = db.requests.find((x) => x.manageHash === h);
      if (!r || (r.status !== "pending" && r.status !== "approved")) return "not_found";
      r.status = "cancelled";
      return "ok";
    });
  helpers = (id: string) => this.tx((db) => db.helpers.filter((x) => x.ownerId === id), false);
  helper = (id: string) => this.tx((db) => db.helpers.find((x) => x.id === id) ?? null, false);
  helperByInvite = (h: string) => this.tx((db) => db.helpers.find((x) => x.inviteHash === h) ?? null, false);
  helpersOfUser = (u: string) => this.tx((db) => db.helpers.filter((x) => x.userId === u && x.status === "active"), false);
  putHelper = (row: HelperRow) =>
    this.tx((db) => {
      db.helpers.push(row);
    });
  updateHelper = (ownerId: string, id: string, patch: Partial<Pick<HelperRow, "sections" | "canEdit" | "status" | "userId">>) =>
    this.tx((db) => {
      const h = db.helpers.find((x) => x.id === id && x.ownerId === ownerId);
      if (h) Object.assign(h, patch);
      return !!h;
    });
  deleteOwner = (id: string) =>
    this.tx((db) => {
      db.owners = db.owners.filter((x) => x.ownerId !== id);
      db.links = db.links.filter((x) => x.ownerId !== id);
      db.claims = db.claims.filter((x) => x.ownerId !== id);
      db.requests = db.requests.filter((x) => x.ownerId !== id);
      db.helpers = db.helpers.filter((x) => x.ownerId !== id);
    });
}

// ---------- Supabase ----------
type Row = Record<string, unknown>;
const toOwner = (r: Row): OwnerRow => ({ ownerId: String(r.owner_id), projection: r.projection as Projection, reserveDays: Number(r.reserve_days) });
const toLink = (r: Row): LinkRow => ({ ownerId: String(r.owner_id), kind: r.kind as Kind, tokenHash: String(r.token_hash), tokenSealed: String(r.token_sealed), active: !!r.active, expiresAt: (r.expires_at as string) ?? null, createdAt: String(r.created_at) });
const toClaim = (r: Row): ClaimRow => ({ id: String(r.id), ownerId: String(r.owner_id), giftId: String(r.gift_id), qty: Number(r.qty), status: r.status as ClaimRow["status"], guestName: String(r.guest_name ?? ""), anonymous: !!r.anonymous, manageHash: String(r.manage_hash), expiresAt: String(r.expires_at), createdAt: String(r.created_at) });
const toRequest = (r: Row): RequestRow => ({ id: String(r.id), ownerId: String(r.owner_id), name: String(r.name), phone: (r.phone as string) ?? null, people: Number(r.people), day: String(r.day), slot: String(r.slot), note: (r.note as string) ?? null, status: r.status as RequestRow["status"], holdUntil: String(r.hold_until), manageHash: String(r.manage_hash), createdAt: String(r.created_at) });
const toHelper = (r: Row): HelperRow => ({ id: String(r.id), ownerId: String(r.owner_id), email: String(r.email), sections: (r.sections as SectionId[]) ?? [], canEdit: !!r.can_edit, status: r.status as HelperRow["status"], inviteHash: String(r.invite_hash), inviteSealed: String(r.invite_sealed), userId: (r.user_id as string) ?? null, createdAt: String(r.created_at) });

export class SupabaseQudoomStore implements QudoomStore {
  constructor(private rest: Rest) {}
  private async rows(p: string, what: string) {
    const r = await this.rest(p);
    expectOk(r, what);
    return r.data as Row[];
  }
  private async rpc(fn: string, body: Row): Promise<Outcome> {
    const r = await this.rest(`rpc/${fn}`, { method: "POST", body });
    expectOk(r, "QD_RPC");
    const v = String(r.data);
    return v === "ok" || v === "full" ? v : "not_found";
  }
  async owner(id: string) {
    const r = await this.rows(`oc_qd_owners?owner_id=${eq(id)}&select=*`, "QD_OWNER");
    return r[0] ? toOwner(r[0]) : null;
  }
  async publish(id: string, projection: Projection) {
    const r = await this.rest("oc_qd_owners?on_conflict=owner_id", { method: "POST", body: { owner_id: id, projection, updated_at: new Date().toISOString() }, prefer: "resolution=merge-duplicates,return=minimal" });
    expectOk(r, "QD_PUBLISH");
  }
  async republish(id: string, projection: Projection) {
    const r = await this.rest(`oc_qd_owners?owner_id=${eq(id)}`, { method: "PATCH", body: { projection, updated_at: new Date().toISOString() }, prefer: "return=minimal" });
    expectOk(r, "QD_PUBLISH");
  }
  async setReserveDays(id: string, days: number) {
    const r = await this.rest(`oc_qd_owners?owner_id=${eq(id)}`, { method: "PATCH", body: { reserve_days: days }, prefer: "return=minimal" });
    expectOk(r, "QD_OWNER");
  }
  async links(id: string) {
    return (await this.rows(`oc_qd_links?owner_id=${eq(id)}&select=*`, "QD_LINKS")).map(toLink);
  }
  async linkByHash(h: string) {
    const r = await this.rows(`oc_qd_links?token_hash=${eq(h)}&select=*`, "QD_LINKS");
    return r[0] ? toLink(r[0]) : null;
  }
  async putLink(l: LinkRow) {
    const r = await this.rest("oc_qd_links?on_conflict=owner_id,kind", {
      method: "POST",
      body: { owner_id: l.ownerId, kind: l.kind, token_hash: l.tokenHash, token_sealed: l.tokenSealed, active: l.active, expires_at: l.expiresAt, created_at: l.createdAt },
      prefer: "resolution=merge-duplicates,return=minimal",
    });
    expectOk(r, "QD_LINKS");
  }
  async setLinkActive(id: string, kind: Kind, active: boolean) {
    const r = await this.rest(`oc_qd_links?owner_id=${eq(id)}&kind=${eq(kind)}`, { method: "PATCH", body: { active }, prefer: "return=minimal" });
    expectOk(r, "QD_LINKS");
  }
  async claims(id: string) {
    return (await this.rows(`oc_qd_gift_claims?owner_id=${eq(id)}&select=*&order=created_at.asc&limit=2000`, "QD_CLAIMS")).map(toClaim);
  }
  async claimByHash(h: string) {
    const r = await this.rows(`oc_qd_gift_claims?manage_hash=${eq(h)}&select=*`, "QD_CLAIMS");
    return r[0] ? toClaim(r[0]) : null;
  }
  reserveGift(c: Omit<ClaimRow, "status" | "createdAt"> & { purchased: boolean }) {
    return this.rpc("oc_qd_reserve_gift", { p_owner: c.ownerId, p_gift: c.giftId, p_qty: c.qty, p_id: c.id, p_name: c.guestName, p_anonymous: c.anonymous, p_manage_hash: c.manageHash, p_expires: c.expiresAt, p_purchased: c.purchased });
  }
  claimAction(h: string, action: "purchase" | "cancel") {
    return this.rpc("oc_qd_claim_action", { p_manage_hash: h, p_action: action });
  }
  async requests(id: string) {
    return (await this.rows(`oc_qd_visit_requests?owner_id=${eq(id)}&select=*&order=created_at.desc&limit=1000`, "QD_REQUESTS")).map(toRequest);
  }
  async requestByHash(h: string) {
    const r = await this.rows(`oc_qd_visit_requests?manage_hash=${eq(h)}&select=*`, "QD_REQUESTS");
    return r[0] ? toRequest(r[0]) : null;
  }
  async booked(id: string, from: string) {
    const rows = (await this.rows(`oc_qd_visit_requests?owner_id=${eq(id)}&day=gte.${encodeURIComponent(from)}&status=in.(pending,approved)&select=day,slot,people,status,hold_until`, "QD_REQUESTS")) as Row[];
    const now = Date.now();
    const out: Record<string, number> = {};
    for (const r of rows) if (live({ status: String(r.status), holdUntil: String(r.hold_until) }, now)) out[`${r.day}T${r.slot}`] = (out[`${r.day}T${r.slot}`] ?? 0) + Number(r.people);
    return out;
  }
  requestVisit(r: Omit<RequestRow, "status" | "createdAt">) {
    return this.rpc("oc_qd_request_visit", { p_owner: r.ownerId, p_id: r.id, p_name: r.name, p_phone: r.phone ?? "", p_people: r.people, p_day: r.day, p_slot: r.slot, p_note: r.note ?? "", p_manage_hash: r.manageHash, p_hold_until: r.holdUntil });
  }
  decideVisit(ownerId: string, id: string, decision: "approve" | "decline") {
    return this.rpc("oc_qd_decide_visit", { p_owner: ownerId, p_id: id, p_decision: decision });
  }
  async cancelVisit(h: string): Promise<Outcome> {
    const r = await this.rest(`oc_qd_visit_requests?manage_hash=${eq(h)}&status=in.(pending,approved)&select=id`, { method: "PATCH", body: { status: "cancelled", decided_at: new Date().toISOString() }, prefer: "return=representation" });
    expectOk(r, "QD_REQUESTS");
    return Array.isArray(r.data) && r.data.length ? "ok" : "not_found";
  }
  async helpers(id: string) {
    return (await this.rows(`oc_qd_helpers?owner_id=${eq(id)}&select=*&order=created_at.asc`, "QD_HELPERS")).map(toHelper);
  }
  async helper(id: string) {
    const r = await this.rows(`oc_qd_helpers?id=${eq(id)}&select=*`, "QD_HELPERS");
    return r[0] ? toHelper(r[0]) : null;
  }
  async helperByInvite(h: string) {
    const r = await this.rows(`oc_qd_helpers?invite_hash=${eq(h)}&select=*`, "QD_HELPERS");
    return r[0] ? toHelper(r[0]) : null;
  }
  async helpersOfUser(u: string) {
    return (await this.rows(`oc_qd_helpers?user_id=${eq(u)}&status=eq.active&select=*`, "QD_HELPERS")).map(toHelper);
  }
  async putHelper(h: HelperRow) {
    const r = await this.rest("oc_qd_helpers", {
      method: "POST",
      body: { id: h.id, owner_id: h.ownerId, email: h.email, sections: h.sections, can_edit: h.canEdit, status: h.status, invite_hash: h.inviteHash, invite_sealed: h.inviteSealed, user_id: h.userId, created_at: h.createdAt },
      prefer: "return=minimal",
    });
    expectOk(r, "QD_HELPERS");
  }
  async updateHelper(ownerId: string, id: string, patch: Partial<Pick<HelperRow, "sections" | "canEdit" | "status" | "userId">>) {
    const body: Row = {};
    if (patch.sections) body.sections = patch.sections;
    if (patch.canEdit !== undefined) body.can_edit = patch.canEdit;
    if (patch.status) body.status = patch.status;
    if (patch.userId !== undefined) body.user_id = patch.userId;
    if (patch.status === "active") body.accepted_at = new Date().toISOString();
    const r = await this.rest(`oc_qd_helpers?id=${eq(id)}&owner_id=${eq(ownerId)}&select=id`, { method: "PATCH", body, prefer: "return=representation" });
    expectOk(r, "QD_HELPERS");
    return Array.isArray(r.data) && r.data.length === 1;
  }
  async deleteOwner(id: string) {
    // Links, reservations, requests and helpers go with the owner row (on delete cascade).
    const r = await this.rest(`oc_qd_owners?owner_id=${eq(id)}`, { method: "DELETE", prefer: "return=minimal" });
    expectOk(r, "QD_DELETE");
  }
}

// Not connected (production without its settings): fail closed, never fall back to local files.
const unavailable = new Proxy({}, { get: () => async () => { throw new Error("QUDOOM_STORE_NOT_CONNECTED"); } }) as QudoomStore;

const g = globalThis as unknown as { __ocQudoom?: QudoomStore };
export function qudoomStore(): QudoomStore {
  if (!g.__ocQudoom) {
    const mode = licensingMode(),
      db = supabaseServerConfig();
    g.__ocQudoom = mode === "database" && db ? new SupabaseQudoomStore(createRest(db)) : mode === "sandbox" ? new FileQudoomStore() : unavailable;
  }
  return g.__ocQudoom;
}
