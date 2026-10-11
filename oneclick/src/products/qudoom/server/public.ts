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

export type GiftView = PublicGift & { available: number; priceLabel?: string };
const loc = (lang: "ar" | "en") => (lang === "ar" ? "ar-OM" : "en-GB");
const digits: Record<string, number> = { OMR: 3, KWD: 3, BHD: 3, SAR: 2, AED: 2, QAR: 2 };
const moneyLabel = (minor: number, cur: string, lang: "ar" | "en") => {
  const d = digits[cur] ?? 2;
  return new Intl.NumberFormat(loc(lang), { style: "currency", currency: cur in digits ? cur : "OMR", minimumFractionDigits: 0, maximumFractionDigits: d }).format(minor / 10 ** d);
};
const stampLabel = (iso: string, lang: "ar" | "en", tz: string) => new Intl.DateTimeFormat(loc(lang), { day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: tz }).format(new Date(iso));
export async function giftPage(token: string, lang: "ar" | "en" = "ar"): Promise<{ head: Head; gifts: GiftView[]; reserveDays: number } | null> {
  const owner = await open(token, "gifts");
  if (!owner) return null;
  const claims = await qudoomStore().claims(owner.ownerId);
  const now = Date.now();
  const taken: Record<string, number> = {};
  for (const c of claims) if (c.status === "purchased" || (c.status === "reserved" && Date.parse(c.expiresAt) > now)) taken[c.giftId] = (taken[c.giftId] ?? 0) + c.qty;
  const gifts = owner.projection.gifts.map((g) => ({ ...g, available: Math.max(0, g.qtyNeeded - (taken[g.id] ?? 0)), ...(g.priceMinor !== undefined ? { priceLabel: moneyLabel(g.priceMinor, owner.projection.currency, lang) } : {}) }));
  return { head: head(owner.projection), gifts, reserveDays: owner.reserveDays };
}

export type DayView = { date: string; label: string; long: string; times: { t: string; label: string }[] };
/** Labels are formatted here, once, so the page shows the same text on the server and in the browser. */
function dayViews(days: { date: string; times: string[] }[], lang: "ar" | "en"): DayView[] {
  const loc = lang === "ar" ? "ar-OM" : "en-GB";
  const d1 = new Intl.DateTimeFormat(loc, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const d2 = new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const tf = new Intl.DateTimeFormat(loc, { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  return days.map((d) => ({ date: d.date, label: d1.format(new Date(`${d.date}T00:00:00Z`)), long: d2.format(new Date(`${d.date}T00:00:00Z`)), times: d.times.map((t) => ({ t, label: tf.format(new Date(`2000-01-01T${t}:00Z`)) })) }));
}

export async function visitPage(token: string, lang: "ar" | "en" = "ar"): Promise<{ head: Head; paused: boolean; maxPeople: number; days: DayView[] } | null> {
  const owner = await open(token, "visits");
  if (!owner) return null;
  const p = owner.projection;
  const booked = await qudoomStore().booked(owner.ownerId, todayIn(p.tz));
  return { head: head(p), paused: p.visits.settings.paused, maxPeople: p.visits.settings.maxPeople, days: dayViews(openSlots(p, booked), lang) };
}

export type ManageView =
  | { kind: "gift"; head: Head; gift: string; qty: number; status: "reserved" | "purchased" | "cancelled" | "expired"; expiresAt: string; expiresLabel: string; url?: string }
  | { kind: "visit"; head: Head; date: string; time: string; whenLabel: string; people: number; status: "pending" | "approved" | "declined" | "cancelled" | "expired" };

export async function managePage(token: string, lang: "ar" | "en" = "ar"): Promise<ManageView | null> {
  if (!looksLikeToken(token)) return null;
  const st = qudoomStore();
  const h = tokenHash(token);
  const claim = await st.claimByHash(h);
  if (claim) {
    const owner = await st.owner(claim.ownerId);
    if (!owner) return null;
    const g = owner.projection.gifts.find((x) => x.id === claim.giftId);
    const expired = claim.status === "reserved" && Date.parse(claim.expiresAt) <= Date.now();
    return { kind: "gift", head: head(owner.projection), gift: g?.name ?? "—", qty: claim.qty, status: expired ? "expired" : claim.status, expiresAt: claim.expiresAt, expiresLabel: stampLabel(claim.expiresAt, lang, owner.projection.tz), url: g?.url };
  }
  const req = await st.requestByHash(h);
  if (req) {
    const owner = await st.owner(req.ownerId);
    if (!owner) return null;
    const expired = req.status === "pending" && Date.parse(req.holdUntil) <= Date.now();
    const dv = dayViews([{ date: req.day, times: [req.slot] }], lang)[0];
    return { kind: "visit", head: head(owner.projection), date: req.day, time: req.slot, whenLabel: `${dv.long} · ${dv.times[0].label}`, people: req.people, status: expired ? "expired" : req.status };
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
