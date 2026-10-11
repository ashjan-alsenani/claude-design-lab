"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { isValidEmail, normalizeEmail, randomId } from "@/lib/licensing/crypto";
import { currentContext } from "@/lib/licensing/server";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";
import { siteUrl } from "@/lib/seo";
import { todayIn } from "../model/engine";
import { applyOp } from "../model/reducer";
import { MAX_DOC_BYTES, opSchema, type Op } from "../model/schema";
import { helperMayApply, helperMayTouch, isOpenSlot, planForHelper, projection } from "../model/share";
import { allSections, type Plan, type SectionId } from "../model/types";
import type { SyncResult } from "../app/state";
import type { Fail, GiftCounts, HelperInfo, LinkInfo, PublicState, Res, ShareKind, VisitRequest } from "../app/api-types";
import { fileKey, helperData, isFileId, ownerData, ownerStillHolds, readPlan, republish, trackFile, type Data } from "./access";
import { looksLikeToken, newToken, seal, tokenHash, unseal } from "./tokens";
import { qudoomStore, type LinkRow } from "./store";

type Scoped = Omit<Data, "ctx">;
const fail = (reason: Fail["reason"]): Fail => ({ ok: false, reason });
const loc = (l: unknown) => (l === "en" ? "en" : "ar");
const linkUrl = (locale: string, kind: ShareKind, token: string) => `${siteUrl}/${locale}/q/${kind === "gifts" ? "g" : "v"}/${token}`;
const ip = async () => clientKey(await headers());

// ---------- saving ----------

/** Applies validated operations to a plan with compare-and-swap, retrying on top of newer saves. */
async function save(d: Scoped, ops: Op[], baseVersion: unknown, check?: (doc: Plan, op: Op) => boolean, view?: (p: Plan) => Plan): Promise<SyncResult> {
  let stored: { version: number; plan: Plan } | undefined;
  let doc: Plan | undefined;
  let saved = false;
  for (let attempt = 0; attempt < 4 && !saved; attempt++) {
    try {
      stored = await readPlan(d);
    } catch {
      return { ok: false, reason: "unavailable" };
    }
    doc = stored.plan;
    try {
      for (const op of ops) {
        if (check && !check(doc, op)) return { ok: false, reason: "readonly" };
        doc = applyOp(doc, op);
      }
    } catch {
      return { ok: false, reason: "invalid" };
    }
    doc.updatedAt = new Date().toISOString();
    if (JSON.stringify(doc).length > MAX_DOC_BYTES) return { ok: false, reason: "too_large" };
    try {
      saved = await d.putIfVersion(doc, stored.version);
    } catch {
      return { ok: false, reason: "unavailable" };
    }
  }
  if (!saved || !stored || !doc) return { ok: false, reason: "unavailable" };
  await republish(d.userId, stored.plan, doc);
  const version = stored.version + 1;
  return { ok: true, version, doc: stored.version !== baseVersion ? (view ? view(doc) : doc) : undefined };
}

/** The mother saves. Every call re-checks session, account, license and device on the server. */
export async function qudoomSync(rawOps: unknown, baseVersion: unknown): Promise<SyncResult> {
  const d = await ownerData();
  if (!d) return { ok: false, reason: "denied" };
  if (!rateLimit(`qudoom:${d.userId}`, 900, 10 * 60 * 1000).ok) return { ok: false, reason: "rate_limited" };
  const ops = z.array(opSchema).min(1).max(200).safeParse(rawOps);
  if (!ops.success) return { ok: false, reason: "invalid" };
  return save(d, ops.data as Op[], baseVersion);
}

/** An invited helper saves: only in her sections, only if she may edit, never settings or deletion of the plan. */
export async function helperSync(helperId: unknown, rawOps: unknown, baseVersion: unknown): Promise<SyncResult> {
  const h = await helperData(helperId);
  if (!h) return { ok: false, reason: "denied" };
  if (!rateLimit(`qudoom-helper:${h.helper.id}`, 600, 10 * 60 * 1000).ok) return { ok: false, reason: "rate_limited" };
  const ops = z.array(opSchema).min(1).max(200).safeParse(rawOps);
  if (!ops.success) return { ok: false, reason: "invalid" };
  const { sections, canEdit } = h.helper;
  return save(
    h.data,
    ops.data as Op[],
    baseVersion,
    (doc, op) => helperMayApply(op, sections, canEdit) && (op.t !== "put" && op.t !== "del" ? true : helperMayTouch(doc, op, sections)),
    (p) => planForHelper(p, sections)
  );
}

// ---------- the mother's sharing panel ----------

function linkInfo(l: LinkRow, locale: string): LinkInfo {
  const token = unseal(l.tokenSealed);
  const expired = !!l.expiresAt && Date.parse(l.expiresAt) <= Date.now();
  return { kind: l.kind, active: l.active && !expired && !!token, url: token ? linkUrl(locale, l.kind, token) : undefined, expiresAt: l.expiresAt ?? undefined, createdAt: l.createdAt };
}

export async function qudoomPublicState(locale: unknown): Promise<Res<{ state: PublicState }>> {
  const d = await ownerData();
  if (!d) return fail("denied");
  const lang = loc(locale);
  try {
    const st = qudoomStore();
    const [owner, links, claims, requests, helpers] = await Promise.all([st.owner(d.userId), st.links(d.userId), st.claims(d.userId), st.requests(d.userId), st.helpers(d.userId)]);
    const now = Date.now();
    const gifts: Record<string, GiftCounts> = {};
    for (const c of claims) {
      const live = c.status === "purchased" || (c.status === "reserved" && Date.parse(c.expiresAt) > now);
      if (!live) continue;
      const g = (gifts[c.giftId] ??= { reserved: 0, purchased: 0, names: [] });
      if (c.status === "purchased") g.purchased += c.qty;
      else g.reserved += c.qty;
      g.names.push(c.anonymous || !c.guestName ? (lang === "ar" ? "(بدون اسم)" : "(no name)") : c.guestName);
    }
    const reqs: VisitRequest[] = requests.map((r) => ({
      id: r.id,
      name: r.name,
      people: r.people,
      date: r.day,
      time: r.slot,
      note: [r.note, r.phone].filter(Boolean).join(" · ") || undefined,
      status: r.status === "pending" && Date.parse(r.holdUntil) <= now ? "expired" : r.status,
      createdAt: r.createdAt,
      holdUntil: r.holdUntil,
    }));
    const hs: HelperInfo[] = helpers.map((h) => {
      const t = h.status === "invited" ? unseal(h.inviteSealed) : null;
      return { id: h.id, email: h.email, sections: h.sections, canEdit: h.canEdit, status: h.status, createdAt: h.createdAt, inviteUrl: t ? `${siteUrl}/${lang}/q/h/${t}` : undefined };
    });
    return { ok: true, state: { links: links.map((l) => linkInfo(l, lang)), gifts, requests: reqs, helpers: hs, reserveDays: owner?.reserveDays ?? 7 } };
  } catch {
    return fail("unavailable");
  }
}

/** Makes sure the owner's public projection exists and is current before something is shared. */
async function ensureOwner(d: Scoped, lang: "ar" | "en") {
  const { plan } = await readPlan(d);
  const proj = projection(plan, lang);
  if (!proj) return false;
  await qudoomStore().publish(d.userId, proj);
  return true;
}

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export async function qudoomLink(kind: unknown, action: unknown, opts: unknown, locale: unknown): Promise<Res<{ link: LinkInfo }>> {
  const d = await ownerData();
  if (!d) return fail("denied");
  const k = z.enum(["gifts", "visits"]).safeParse(kind);
  const a = z.enum(["create", "disable", "regenerate"]).safeParse(action);
  const o = z.object({ expiresAt: dateOnly.optional() }).safeParse(opts ?? {});
  if (!k.success || !a.success || !o.success) return fail("invalid");
  if (!rateLimit(`qudoom-link:${d.userId}`, 60, 60 * 60 * 1000).ok) return fail("rate_limited");
  const lang = loc(locale);
  try {
    const st = qudoomStore();
    if (a.data === "disable") {
      await st.setLinkActive(d.userId, k.data, false);
      const l = (await st.links(d.userId)).find((x) => x.kind === k.data);
      return l ? { ok: true, link: linkInfo(l, lang) } : fail("not_found");
    }
    if (!(await ensureOwner(d, lang))) return fail("invalid");
    const { plan } = await readPlan(d);
    const tz = plan.profile?.timeZone ?? "Asia/Muscat";
    if (o.data.expiresAt && o.data.expiresAt < todayIn(tz)) return fail("invalid");
    const token = newToken();
    const row: LinkRow = { ownerId: d.userId, kind: k.data, tokenHash: tokenHash(token), tokenSealed: seal(token), active: true, expiresAt: o.data.expiresAt ? `${o.data.expiresAt}T23:59:59.000Z` : null, createdAt: new Date().toISOString() };
    await st.putLink(row);
    return { ok: true, link: linkInfo(row, lang) };
  } catch {
    return fail("unavailable");
  }
}

export async function qudoomReserveDays(days: unknown): Promise<Res> {
  const d = await ownerData();
  if (!d) return fail("denied");
  const n = z.number().int().min(1).max(30).safeParse(days);
  if (!n.success) return fail("invalid");
  try {
    if (!(await qudoomStore().owner(d.userId))) await ensureOwner(d, "ar");
    await qudoomStore().setReserveDays(d.userId, n.data);
    return { ok: true };
  } catch {
    return fail("unavailable");
  }
}

export async function qudoomDecideVisit(id: unknown, decision: unknown): Promise<Res> {
  const d = await ownerData();
  if (!d) return fail("denied");
  const i = z.string().max(60).safeParse(id), dec = z.enum(["approve", "decline"]).safeParse(decision);
  if (!i.success || !dec.success) return fail("invalid");
  try {
    const r = await qudoomStore().decideVisit(d.userId, i.data, dec.data);
    return r === "ok" ? { ok: true } : fail(r);
  } catch {
    return fail("unavailable");
  }
}

const sectionList = z.array(z.enum(allSections as [SectionId, ...SectionId[]])).max(allSections.length);

export async function qudoomInviteHelper(email: unknown, sections: unknown, canEdit: unknown, locale: unknown): Promise<Res<{ helper: HelperInfo }>> {
  const d = await ownerData();
  if (!d) return fail("denied");
  const e = z.string().max(254).safeParse(email), s = sectionList.min(1).safeParse(sections), c = z.boolean().safeParse(canEdit);
  if (!e.success || !s.success || !c.success || !isValidEmail(normalizeEmail(e.data))) return fail("invalid");
  const addr = normalizeEmail(e.data);
  if (addr === normalizeEmail(d.ctx.user.email)) return fail("invalid");
  if (!rateLimit(`qudoom-invite:${d.userId}`, 20, 60 * 60 * 1000).ok) return fail("rate_limited");
  const lang = loc(locale);
  try {
    const st = qudoomStore();
    const current = (await st.helpers(d.userId)).filter((h) => h.status !== "revoked");
    if (current.length >= 10) return fail("full");
    if (current.some((h) => h.email === addr)) return fail("invalid");
    if (!(await qudoomStore().owner(d.userId)) && !(await ensureOwner(d, lang))) return fail("invalid");
    const token = newToken();
    const row = { id: randomId("qh"), ownerId: d.userId, email: addr, sections: [...new Set(s.data)], canEdit: c.data, status: "invited" as const, inviteHash: tokenHash(token), inviteSealed: seal(token), userId: null, createdAt: new Date().toISOString() };
    await st.putHelper(row);
    // Nothing is emailed: the mother copies the invite link and sends it herself.
    return { ok: true, helper: { id: row.id, email: row.email, sections: row.sections, canEdit: row.canEdit, status: row.status, createdAt: row.createdAt, inviteUrl: `${siteUrl}/${lang}/q/h/${token}` } };
  } catch {
    return fail("unavailable");
  }
}

export async function qudoomUpdateHelper(id: unknown, patch: unknown): Promise<Res> {
  const d = await ownerData();
  if (!d) return fail("denied");
  const i = z.string().max(60).safeParse(id);
  const p = z.object({ sections: sectionList.min(1).optional(), canEdit: z.boolean().optional(), revoke: z.literal(true).optional() }).safeParse(patch);
  if (!i.success || !p.success) return fail("invalid");
  try {
    const ok = await qudoomStore().updateHelper(d.userId, i.data, { ...(p.data.sections ? { sections: p.data.sections } : {}), ...(p.data.canEdit !== undefined ? { canEdit: p.data.canEdit } : {}), ...(p.data.revoke ? { status: "revoked" as const } : {}) });
    return ok ? { ok: true } : fail("not_found");
  } catch {
    return fail("unavailable");
  }
}

/** Deletes the planner: the plan, every stored photo, links, reservations, requests and helpers. The account stays. */
export async function qudoomDeleteAll(): Promise<Res> {
  const d = await ownerData();
  if (!d) return fail("denied");
  try {
    const files = await d.get<string[]>("files");
    for (const id of files.data ?? []) {
      const f = await d.get(fileKey(id));
      if (f.data) await d.put(null, f.version + 1, fileKey(id));
    }
    if (files.data) await d.put(null, files.version + 1, "files");
    for (let i = 0; i < 4; i++) {
      const cur = await d.get<Plan>();
      if (await d.putIfVersion(null, cur.version)) break;
    }
    await qudoomStore().deleteOwner(d.userId);
    return { ok: true };
  } catch {
    return fail("unavailable");
  }
}

/** Deletes one private file (the mother, or a helper who can see and edit it). */
export async function qudoomDeleteFile(id: unknown, helperId?: unknown): Promise<Res> {
  if (!isFileId(id)) return fail("invalid");
  let d: Scoped | null = null;
  if (helperId) {
    const h = await helperData(helperId);
    if (h && h.helper.canEdit) {
      const { plan } = await readPlan(h.data);
      if (planForHelper(plan, h.helper.sections).files.some((f) => f.id === id)) d = h.data;
    }
  } else d = await ownerData();
  if (!d) return fail("denied");
  try {
    const f = await d.get(fileKey(id));
    if (f.data) await d.put(null, f.version + 1, fileKey(id));
    await trackFile(d, id, false);
    return { ok: true };
  } catch {
    return fail("unavailable");
  }
}

// ---------- guests (no account) ----------

async function openLink(token: unknown, kind: ShareKind) {
  if (!looksLikeToken(token)) return null;
  const st = qudoomStore();
  const link = await st.linkByHash(tokenHash(token));
  if (!link || link.kind !== kind || !link.active || (link.expiresAt && Date.parse(link.expiresAt) <= Date.now())) return null;
  const owner = await st.owner(link.ownerId);
  if (!owner || !(await ownerStillHolds(link.ownerId))) return null;
  return { link, owner };
}

const guestName = z.string().trim().max(60);

export async function reserveGift(input: unknown): Promise<Res<{ manageUrl: string; expiresAt: string; purchased: boolean }>> {
  const p = z.object({ token: z.string(), giftId: z.string().max(60), qty: z.number().int().min(1).max(99), name: guestName, anonymous: z.boolean(), purchased: z.boolean(), locale: z.string() }).safeParse(input);
  if (!p.success) return fail("invalid");
  if (!rateLimit(`qd-guest:${await ip()}`, 30, 10 * 60 * 1000).ok) return fail("rate_limited");
  try {
    const o = await openLink(p.data.token, "gifts");
    if (!o) return fail("not_found");
    const manage = newToken();
    const expiresAt = new Date(Date.now() + o.owner.reserveDays * 86_400_000).toISOString();
    const r = await qudoomStore().reserveGift({ id: randomId("qc"), ownerId: o.link.ownerId, giftId: p.data.giftId, qty: p.data.qty, guestName: p.data.name, anonymous: p.data.anonymous, manageHash: tokenHash(manage), expiresAt, purchased: p.data.purchased });
    if (r !== "ok") return fail(r);
    return { ok: true, manageUrl: `${siteUrl}/${loc(p.data.locale)}/q/m/${manage}`, expiresAt, purchased: p.data.purchased };
  } catch {
    return fail("unavailable");
  }
}

export async function requestVisit(input: unknown): Promise<Res<{ manageUrl: string }>> {
  const p = z
    .object({ token: z.string(), date: dateOnly, time: z.string().regex(/^\d{2}:\d{2}$/), people: z.number().int().min(1).max(30), name: z.string().trim().min(1).max(60), phone: z.string().trim().max(30), note: z.string().trim().max(300), locale: z.string() })
    .safeParse(input);
  if (!p.success) return fail("invalid");
  if (!rateLimit(`qd-guest:${await ip()}`, 30, 10 * 60 * 1000).ok) return fail("rate_limited");
  try {
    const o = await openLink(p.data.token, "visits");
    if (!o) return fail("not_found");
    const s = o.owner.projection.visits.settings;
    if (s.paused || p.data.people > s.maxPeople || !isOpenSlot(o.owner.projection, p.data.date, p.data.time)) return fail("full");
    const manage = newToken();
    const r = await qudoomStore().requestVisit({
      id: randomId("qv"),
      ownerId: o.link.ownerId,
      name: p.data.name,
      phone: p.data.phone || null,
      people: p.data.people,
      day: p.data.date,
      slot: p.data.time,
      note: p.data.note || null,
      holdUntil: new Date(Date.now() + Math.max(1, s.holdHours) * 3_600_000).toISOString(),
      manageHash: tokenHash(manage),
    });
    if (r !== "ok") return fail(r);
    return { ok: true, manageUrl: `${siteUrl}/${loc(p.data.locale)}/q/m/${manage}` };
  } catch {
    return fail("unavailable");
  }
}

/** From a guest's private manage link: confirm a purchase, cancel a reservation, or cancel a visit request. */
export async function manageAction(token: unknown, action: unknown): Promise<Res> {
  const a = z.enum(["purchase", "cancel"]).safeParse(action);
  if (!looksLikeToken(token) || !a.success) return fail("invalid");
  if (!rateLimit(`qd-guest:${await ip()}`, 30, 10 * 60 * 1000).ok) return fail("rate_limited");
  try {
    const st = qudoomStore();
    const h = tokenHash(token);
    const claim = await st.claimByHash(h);
    if (claim) {
      const r = await st.claimAction(h, a.data);
      return r === "ok" ? { ok: true } : fail(r);
    }
    const req = await st.requestByHash(h);
    if (req && a.data === "cancel") {
      const r = await st.cancelVisit(h);
      return r === "ok" ? { ok: true } : fail(r);
    }
    return fail("not_found");
  } catch {
    return fail("unavailable");
  }
}

/** A helper accepts an invite while signed in with the invited email. */
export async function acceptHelperInvite(token: unknown): Promise<Res<{ helperId: string }>> {
  if (!looksLikeToken(token)) return fail("invalid");
  const ctx = await currentContext();
  if (!ctx) return fail("denied");
  try {
    const st = qudoomStore();
    const h = await st.helperByInvite(tokenHash(token));
    if (!h || h.status === "revoked") return fail("not_found");
    if (h.status === "active") return h.userId === ctx.user.id ? { ok: true, helperId: h.id } : fail("not_found");
    if (normalizeEmail(ctx.user.email) !== h.email) return fail("type");
    if (!(await ownerStillHolds(h.ownerId))) return fail("not_found");
    await st.updateHelper(h.ownerId, h.id, { status: "active", userId: ctx.user.id });
    return { ok: true, helperId: h.id };
  } catch {
    return fail("unavailable");
  }
}
