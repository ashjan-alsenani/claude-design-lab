import "server-only";
import { todayIn } from "../model/engine";
import { openSlots, type Projection, type PublicGift } from "../model/share";
import { ownerStillHolds } from "./access";
import { qudoomStore } from "./store";
import { looksLikeToken, tokenHash } from "./tokens";

/**
 * What the guests' pages load. Only the published projection and counts: never the mother's
 * plan, never other guests' names, never notes, addresses or private photos.
 */
type Head = { name: string; theme: Projection["theme"]; currency: string };
const head = (p: Projection): Head => ({ name: p.name, theme: p.theme, currency: p.currency });

async function open(token: string, kind: "gifts" | "visits") {
  if (!looksLikeToken(token)) return null;
  const st = qudoomStore();
  const link = await st.linkByHash(tokenHash(token));
  if (!link || link.kind !== kind || !link.active || (link.expiresAt && Date.parse(link.expiresAt) <= Date.now())) return null;
  const owner = await st.owner(link.ownerId);
  if (!owner || !(await ownerStillHolds(link.ownerId))) return null;
  return owner;
}

export type GiftView = PublicGift & { available: number };
export async function giftPage(token: string): Promise<{ head: Head; gifts: GiftView[]; reserveDays: number } | null> {
  const owner = await open(token, "gifts");
  if (!owner) return null;
  const claims = await qudoomStore().claims(owner.ownerId);
  const now = Date.now();
  const taken: Record<string, number> = {};
  for (const c of claims) if (c.status === "purchased" || (c.status === "reserved" && Date.parse(c.expiresAt) > now)) taken[c.giftId] = (taken[c.giftId] ?? 0) + c.qty;
  const gifts = owner.projection.gifts.map((g) => ({ ...g, available: Math.max(0, g.qtyNeeded - (taken[g.id] ?? 0)) }));
  return { head: head(owner.projection), gifts, reserveDays: owner.reserveDays };
}

export async function visitPage(token: string): Promise<{ head: Head; paused: boolean; maxPeople: number; days: { date: string; times: string[] }[] } | null> {
  const owner = await open(token, "visits");
  if (!owner) return null;
  const p = owner.projection;
  const booked = await qudoomStore().booked(owner.ownerId, todayIn(p.tz));
  return { head: head(p), paused: p.visits.settings.paused, maxPeople: p.visits.settings.maxPeople, days: openSlots(p, booked) };
}

export type ManageView =
  | { kind: "gift"; head: Head; gift: string; qty: number; status: "reserved" | "purchased" | "cancelled" | "expired"; expiresAt: string; url?: string }
  | { kind: "visit"; head: Head; date: string; time: string; people: number; status: "pending" | "approved" | "declined" | "cancelled" | "expired" };

export async function managePage(token: string): Promise<ManageView | null> {
  if (!looksLikeToken(token)) return null;
  const st = qudoomStore();
  const h = tokenHash(token);
  const claim = await st.claimByHash(h);
  if (claim) {
    const owner = await st.owner(claim.ownerId);
    if (!owner) return null;
    const g = owner.projection.gifts.find((x) => x.id === claim.giftId);
    const expired = claim.status === "reserved" && Date.parse(claim.expiresAt) <= Date.now();
    return { kind: "gift", head: head(owner.projection), gift: g?.name ?? "—", qty: claim.qty, status: expired ? "expired" : claim.status, expiresAt: claim.expiresAt, url: g?.url };
  }
  const req = await st.requestByHash(h);
  if (req) {
    const owner = await st.owner(req.ownerId);
    if (!owner) return null;
    const expired = req.status === "pending" && Date.parse(req.holdUntil) <= Date.now();
    return { kind: "visit", head: head(owner.projection), date: req.day, time: req.slot, people: req.people, status: expired ? "expired" : req.status };
  }
  return null;
}

export async function invitePage(token: string): Promise<{ head: Head; email: string; status: "invited" | "active" | "revoked"; helperId: string; userId: string | null } | null> {
  if (!looksLikeToken(token)) return null;
  const st = qudoomStore();
  const h = await st.helperByInvite(tokenHash(token));
  if (!h) return null;
  const owner = await st.owner(h.ownerId);
  if (!owner) return null;
  return { head: head(owner.projection), email: h.email, status: h.status, helperId: h.id, userId: h.userId };
}
