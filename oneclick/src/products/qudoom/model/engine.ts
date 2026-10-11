import { currencyDigits, type BagId, type BudgetCat, type Currency, type HospItem, type Item, type Plan, type Slot, type VisitSettings } from "./types";

/**
 * Pure calculations. Everything the mother sees as a number (progress, money, quantities, slots)
 * is computed here from her real records, never stored as a fixed figure.
 */

// ---------- dates ----------
export const toIso = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (iso: string, days: number) => toIso(new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000));
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
/** Calendar date "now" in an IANA time zone, so the day flips at the mother's local midnight. */
export function todayIn(timeZone: string, now = new Date()): string {
  try {
    const p = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
    return /^\d{4}-\d{2}-\d{2}$/.test(p) ? p : toIso(now);
  } catch {
    return toIso(now);
  }
}
export const weekday = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();
const toMin = (hm: string) => Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));
const toHm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

// ---------- money (integers in minor units) ----------
export const digits = (c: Currency) => currencyDigits[c];
export const toMinor = (major: number, c: Currency) => Math.round(major * 10 ** digits(c));
export const toMajor = (minorUnits: number, c: Currency) => minorUnits / 10 ** digits(c);
/** "12.5" typed in a field → minor units, or undefined when empty/invalid. */
export function parseMoney(input: string, c: Currency): number | undefined {
  const s = input.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[,،\s]/g, "").replace("٫", ".");
  if (!s) return undefined;
  if (!/^\d+(\.\d+)?$/.test(s)) return undefined;
  const [, frac = ""] = s.split(".");
  if (frac.length > digits(c)) return undefined;
  return toMinor(Number(s), c);
}

// ---------- progress ----------
/**
 * Overall readiness = completed ÷ counted, over everything the mother switched on.
 * Counted: items (baby/nursery/mother) not marked "not needed", hospital-bag items not skipped,
 * tasks not skipped, reception checklist entries. Completed: item have/received, bag item packed,
 * task done, check done. Sections she turned off are not counted at all.
 */
export const itemDone = (i: Item) => i.status === "have" || i.status === "received";
export function progress(p: Plan) {
  const on = p.profile?.sections;
  const parts: { key: string; done: number; total: number }[] = [];
  const areaOn = { baby: on?.prep !== false, nursery: on?.nursery !== false, mother: on?.mother !== false };
  for (const area of ["baby", "nursery", "mother"] as const) {
    if (!areaOn[area]) continue;
    const list = p.items.filter((i) => i.area === area && i.status !== "skip");
    parts.push({ key: area, done: list.filter(itemDone).length, total: list.length });
  }
  if (on?.bag !== false) {
    const list = p.bag.filter((b) => !b.skip);
    parts.push({ key: "bag", done: list.filter((b) => b.packed).length, total: list.length });
  }
  const tasks = p.tasks.filter((t) => t.status !== "skip" && (on?.[areaSection(t.area)] ?? true));
  parts.push({ key: "tasks", done: tasks.filter((t) => t.status === "done").length, total: tasks.length });
  if (on?.reception !== false) {
    const checks = p.events.flatMap((e) => e.checks);
    parts.push({ key: "reception", done: checks.filter((c) => c.done).length, total: checks.length });
  }
  const done = parts.reduce((s, x) => s + x.done, 0), total = parts.reduce((s, x) => s + x.total, 0);
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0, parts };
}
function areaSection(a: Plan["tasks"][number]["area"]) {
  return ({ general: "prep", nursery: "nursery", mother: "mother", reception: "reception", favors: "favors", visits: "visits" } as const)[a];
}
export function bagProgress(p: Plan, bag?: BagId) {
  const list = p.bag.filter((b) => !b.skip && (!bag || b.bag === bag));
  return { provided: list.filter((b) => b.provided || b.packed).length, packed: list.filter((b) => b.packed).length, total: list.length };
}
export function eventReadiness(e: Plan["events"][number], p: Plan) {
  const tasks = p.tasks.filter((t) => t.eventId === e.id && t.status !== "skip");
  const total = e.checks.length + tasks.length;
  const done = e.checks.filter((c) => c.done).length + tasks.filter((t) => t.status === "done").length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

// ---------- budget ----------
/**
 * Five separate figures, never mixed:
 *  planned      what she set aside (per category),
 *  committed    orders not cancelled + standalone costs (items/favors that are not part of an order),
 *  paid         payments marked paid,
 *  toPay        committed − paid (money still owed, NOT money available),
 *  left         planned − committed (what is still free to spend).
 * An item linked to an order, or bought as a gift by someone else, adds nothing on its own.
 */
export const favorTotal = (f: Plan["favors"][number]) => (f.qtyBase + f.qtyExtra) * f.unitMinor + f.feesMinor;
const itemCat = (i: Item): BudgetCat => (i.area === "nursery" ? "nursery" : i.area === "mother" ? "mother" : "baby");
export function budget(p: Plan) {
  const cats = {} as Record<BudgetCat, { planned: number; committed: number; paid: number }>;
  const z = () => ({ planned: 0, committed: 0, paid: 0 });
  const get = (c: BudgetCat) => (cats[c] ??= z());
  for (const [c, v] of Object.entries(p.budget)) get(c as BudgetCat).planned = v ?? 0;
  const liveOrders = new Map(p.orders.filter((o) => o.status !== "cancelled").map((o) => [o.id, o]));
  for (const o of liveOrders.values()) get(o.cat).committed += o.amountMinor;
  for (const i of p.items) {
    if (i.orderId && liveOrders.has(i.orderId)) continue; // the order carries it
    if (i.giftId && i.status === "received" && i.actualMinor === undefined) continue; // gifted
    if (i.status === "skip" || i.actualMinor === undefined) continue;
    get(itemCat(i)).committed += i.actualMinor;
  }
  for (const f of p.favors) {
    if (f.orderId && liveOrders.has(f.orderId)) continue;
    if (f.status === "idea" || f.status === "quote") continue; // not committed yet
    get("favors").committed += favorTotal(f);
  }
  // Favor deposits count as paid only when the favor is not an order with its own payments.
  for (const f of p.favors) if (!(f.orderId && liveOrders.has(f.orderId)) && f.status !== "idea" && f.status !== "quote") get("favors").paid += Math.min(f.depositMinor, favorTotal(f));
  for (const pay of p.payments) {
    if (!pay.paidOn) continue;
    const o = pay.orderId ? liveOrders.get(pay.orderId) : undefined;
    if (pay.orderId && !o) continue; // payment of a cancelled/removed order is not counted
    get(o ? o.cat : "other").paid += pay.amountMinor;
  }
  const rows = (Object.keys(cats) as BudgetCat[]).map((cat) => ({ cat, ...cats[cat], toPay: Math.max(0, cats[cat].committed - cats[cat].paid), left: cats[cat].planned - cats[cat].committed }));
  const sum = (k: "planned" | "committed" | "paid" | "toPay") => rows.reduce((s, r) => s + r[k], 0);
  const plannedTotal = p.profile?.budgetMinor ?? sum("planned");
  const committed = sum("committed");
  return { rows, planned: plannedTotal, committed, paid: sum("paid"), toPay: sum("toPay"), left: plannedTotal - committed, over: plannedTotal > 0 && committed > plannedTotal };
}
export function orderPaid(p: Plan, orderId: string) {
  return p.payments.filter((x) => x.orderId === orderId && x.paidOn).reduce((s, x) => s + x.amountMinor, 0);
}

// ---------- hospitality ----------
/**
 * Units needed = ceil( ceil(guests) × servings per guest × (1 + reserve%) ÷ servings per unit ).
 * Each line keeps its own unit: cups, pieces and trays are never added together.
 */
export function guestsFor(h: HospItem, p: Plan) {
  if (h.source.manual !== undefined) return h.source.manual;
  if (h.source.eventId) return p.events.find((e) => e.id === h.source.eventId)?.expected ?? 0;
  if (h.source.visitId) return p.visits.find((v) => v.id === h.source.visitId)?.people ?? 0;
  return 0;
}
export function hospQty(h: HospItem, guests: number) {
  if (h.servingsPerUnit <= 0) return 0;
  const raw = Math.ceil(guests) * h.perGuest * (1 + h.reservePct / 100);
  return Math.ceil(Math.round((raw / h.servingsPerUnit) * 1e6) / 1e6);
}
export const hospCost = (h: HospItem, units: number) => (h.unitPriceMinor === undefined ? undefined : units * h.unitPriceMinor);

// ---------- visits ----------
/** Slots offered on a date, honoring weekly hours, closed dates, breaks, the window and pause. */
export function slotsOn(date: string, s: VisitSettings): string[] {
  if (s.paused || s.closedDates.includes(date)) return [];
  if (s.from && date < s.from) return [];
  if (s.to && date > s.to) return [];
  const wins = s.week[String(weekday(date)) as keyof VisitSettings["week"]] ?? [];
  const out: string[] = [];
  for (const w of wins) {
    for (let m = toMin(w.from); m + s.slotMinutes <= toMin(w.to); m += s.slotMinutes) {
      const end = m + s.slotMinutes;
      if (s.breaks.some((b) => m < toMin(b.to) && end > toMin(b.from))) continue;
      out.push(toHm(m));
    }
  }
  return [...new Set(out)].sort();
}
export const slotKey = (x: Slot) => `${x.date}T${x.time}`;
/** People already holding a slot through visits the mother added or confirmed herself. */
export function manualLoad(p: Plan) {
  const load: Record<string, number> = {};
  for (const v of p.visits) {
    if (v.requestId) continue; // link requests are counted from the database
    if (v.status === "confirmed" && v.confirmed) load[slotKey(v.confirmed)] = (load[slotKey(v.confirmed)] ?? 0) + v.people;
  }
  return load;
}

// ---------- calendar ----------
export type CalKind = "task" | "order" | "visit" | "event" | "payment" | "appt" | "help" | "due";
export type CalEntry = { id: string; kind: CalKind; date: string; time?: string; title: string; ref: string; done?: boolean };
export function calendar(p: Plan, lang: "ar" | "en"): CalEntry[] {
  const out: CalEntry[] = [];
  const on = p.profile?.sections;
  for (const t of p.tasks) if (t.due && t.status !== "skip") out.push({ id: `t:${t.id}`, kind: "task", date: t.due, time: t.time, title: t.title, ref: t.id, done: t.status === "done" });
  for (const o of p.orders) if (o.deliveryDate && o.status !== "cancelled") out.push({ id: `o:${o.id}`, kind: "order", date: o.deliveryDate, title: o.title, ref: o.id, done: o.status === "received" });
  if (on?.visits !== false) for (const v of p.visits) if (v.status === "confirmed" && v.confirmed) out.push({ id: `v:${v.id}`, kind: "visit", date: v.confirmed.date, time: v.confirmed.time, title: v.name, ref: v.id });
  if (on?.reception !== false) for (const e of p.events) if (e.date) out.push({ id: `e:${e.id}`, kind: "event", date: e.date, time: e.time, title: e.name, ref: e.id });
  for (const x of p.payments) if (x.due && !x.paidOn) out.push({ id: `p:${x.id}`, kind: "payment", date: x.due, title: x.label, ref: x.id });
  for (const a of p.appointments) out.push({ id: `a:${a.id}`, kind: "appt", date: a.date, time: a.time, title: a.title, ref: a.id });
  for (const f of p.favors) if (f.deliveryDate && f.status !== "received") out.push({ id: `f:${f.id}`, kind: "order", date: f.deliveryDate, title: f.type, ref: f.id });
  if (p.profile?.dueDate && !p.profile.arrived) out.push({ id: "due", kind: "due", date: p.profile.dueDate, title: lang === "ar" ? "الموعد المتوقع" : "Expected date", ref: "due" });
  return out.sort((a, b) => (a.date + (a.time ?? "99")).localeCompare(b.date + (b.time ?? "99")));
}

// ---------- ICS (add to calendar; one-way, no sync) ----------
const icsEsc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
export function ics(entries: CalEntry[], tz: string, stamp: string) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//OneClick//Hikayat Qudoom//AR", "CALSCALE:GREGORIAN"];
  for (const e of entries) {
    lines.push("BEGIN:VEVENT", `UID:${e.id.replace(/[^A-Za-z0-9:-]/g, "")}@hikayat-qudoom.oneclick`, `DTSTAMP:${stamp}`);
    const d = e.date.replace(/-/g, "");
    if (e.time) {
      const [h, m] = e.time.split(":").map(Number);
      const end = h * 60 + m + 60;
      lines.push(`DTSTART;TZID=${tz}:${d}T${e.time.replace(":", "")}00`, `DTEND;TZID=${tz}:${d}T${String(Math.min(23, Math.floor(end / 60))).padStart(2, "0")}${String(end >= 1440 ? 59 : end % 60).padStart(2, "0")}00`);
    } else {
      // Date-only: an all-day event, which calendars never shift between time zones.
      lines.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${addDays(e.date, 1).replace(/-/g, "")}`);
    }
    lines.push(`SUMMARY:${icsEsc(e.title)}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// ---------- "what's next" ----------
export function upcoming(p: Plan, today: string, lang: "ar" | "en", n = 5) {
  return calendar(p, lang).filter((e) => !e.done && e.date >= today && e.kind !== "due").slice(0, n);
}
export function pendingDeliveries(p: Plan) {
  return [
    ...p.orders.filter((o) => o.status === "ordered" || o.status === "shipped").map((o) => ({ id: o.id, title: o.title, date: o.deliveryDate, kind: "order" as const })),
    ...p.favors.filter((f) => ["approved", "making", "ready"].includes(f.status)).map((f) => ({ id: f.id, title: f.type, date: f.deliveryDate, kind: "favor" as const })),
  ].sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
}
export function nextVisit(p: Plan, today: string) {
  return p.visits.filter((v) => v.status === "confirmed" && v.confirmed && v.confirmed.date >= today).sort((a, b) => slotKey(a.confirmed!).localeCompare(slotKey(b.confirmed!)))[0];
}
