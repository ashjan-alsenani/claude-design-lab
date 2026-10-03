import { MAX_LEAD, templates } from "./templates";
import type { BudgetCat, CategoryKey, Item, Payment, Priority, Profile, Task, TaskTemplate, Workspace } from "./types";

/**
 * The smart planning engine (pure functions, no I/O): dates, priorities, focus,
 * dependencies, progress, budget, alerts, notifications, search. Used identically on the
 * server and in the browser, and covered by unit tests.
 */

// ---------- dates (calendar days, timezone-safe: everything is UTC midnight) ----------
export const DAY = 86_400_000;
export const toDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`);
export const toIso = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => toIso(new Date(toDate(iso).getTime() + n * DAY));
export const diffDays = (from: string, to: string) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / DAY);
export const todayIso = (now = new Date()) => toIso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));

const rank: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
export const weight: Record<Priority, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
const isOpen = (t: Task) => t.status !== "done" && t.status !== "skip";

export function applies(tpl: TaskTemplate, p: Profile) {
  if (!tpl.when) return true;
  if (tpl.when === "home") return p.home !== "no";
  if (tpl.when === "honeymoon") return p.honeymoon !== "no";
  if (tpl.when === "groom") return p.groomSection;
  return p.events.includes(tpl.when);
}

/**
 * Catch-up scheduling: if the plan started with less time than the full timeline needs,
 * early tasks are compressed into the remaining window (order preserved, last month untouched).
 */
export function scheduleOffset(daysBefore: number, lead: number) {
  if (daysBefore <= 30 || lead >= MAX_LEAD) return daysBefore;
  const room = Math.max(0, lead * 0.92 - 30);
  return 30 + ((daysBefore - 30) * room) / (MAX_LEAD - 30);
}

export function resolveTasks(ws: Workspace, lang: "en" | "ar"): Task[] {
  const p = ws.profile;
  if (!p) return [];
  const lead = Math.max(0, diffDays(p.planStart, p.weddingDate));
  const out: Task[] = [];
  for (const tpl of templates) {
    if (!applies(tpl, p)) continue;
    const st = ws.taskStates[tpl.id] ?? {};
    const autoDone = (tpl.doneAt !== undefined && p.stage >= tpl.doneAt) || (lead <= 30 && tpl.due > 60);
    const due = st.due ?? addDays(p.weddingDate, -Math.round(scheduleOffset(tpl.due, lead)));
    const startBefore = Math.round(scheduleOffset(tpl.start ?? tpl.due + 21, lead));
    out.push({
      id: tpl.id,
      custom: false,
      title: tpl.title[lang],
      cat: tpl.cat,
      due,
      start: [addDays(p.weddingDate, -startBefore), due].sort()[0],
      priority: st.priority ?? tpl.priority,
      effort: tpl.effort,
      status: st.status ?? (autoDone ? "done" : "todo"),
      notes: st.notes,
      deps: tpl.deps ?? [],
      blockedBy: [],
      milestone: tpl.milestone?.[lang],
      event: tpl.when,
    });
  }
  for (const c of ws.customTasks) {
    out.push({ id: c.id, custom: true, title: c.title, cat: c.cat, due: c.due, start: addDays(c.due, -14), priority: c.priority, effort: c.effort ?? "hour", status: c.status, notes: c.notes, deps: [], blockedBy: [] });
  }
  const byId = new Map(out.map((t) => [t.id, t]));
  for (const t of out) t.blockedBy = t.deps.filter((d) => byId.has(d) && isOpen(byId.get(d)!));
  return out.sort((a, b) => a.due.localeCompare(b.due) || rank[a.priority] - rank[b.priority]);
}

export type Bucket = "overdue" | "today" | "week" | "soon" | "later";
export function bucketOf(t: Task, today: string): Bucket {
  const d = diffDays(today, t.due);
  if (d < 0) return "overdue";
  if (d === 0) return "today";
  if (d <= 7) return "week";
  if (d <= 30) return "soon";
  return "later";
}

export function groupTasks(tasks: Task[], today: string) {
  const g: Record<Bucket, Task[]> = { overdue: [], today: [], week: [], soon: [], later: [] };
  for (const t of tasks) if (isOpen(t)) g[bucketOf(t, today)].push(t);
  return g;
}

/** "Your focus this week": 3-6 doable tasks, most important first. Never hundreds. */
export function focusTasks(tasks: Task[], today: string, max = 5) {
  const horizon = addDays(today, 14);
  const ready = tasks.filter((t) => isOpen(t) && t.blockedBy.length === 0);
  const now = ready
    .filter((t) => t.start <= addDays(today, 7) || t.due <= horizon)
    .sort((a, b) => Number(b.due < today) - Number(a.due < today) || rank[a.priority] - rank[b.priority] || a.due.localeCompare(b.due))
    .slice(0, max);
  if (now.length >= 3) return now;
  // Quiet week: suggest the next few things to get ahead on, never an empty screen.
  const ahead = ready.filter((t) => !now.includes(t)).sort((a, b) => a.start.localeCompare(b.start) || rank[a.priority] - rank[b.priority]);
  return [...now, ...ahead].slice(0, Math.min(max, 4));
}

// ---------- progress ----------
export function weightedProgress(tasks: Task[]) {
  let done = 0, all = 0;
  for (const t of tasks) {
    if (t.status === "skip") continue;
    all += weight[t.priority];
    if (t.status === "done") done += weight[t.priority];
  }
  return all === 0 ? 0 : done / all;
}

const ratio = (a: number, b: number) => (b === 0 ? null : a / b);
const blend = (...xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => x !== null);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0;
};
const itemsDone = (items: Item[], list: Item["list"]) => {
  const l = items.filter((i) => i.list === list && i.status !== "skip");
  return ratio(l.filter((i) => i.status === "bought" || i.status === "gift").length, l.length);
};
const tasksIn = (tasks: Task[], cats: CategoryKey[]) => {
  const l = tasks.filter((t) => cats.includes(t.cat));
  return l.length ? weightedProgress(l) : null;
};

export type AreaKey = "overall" | "bride" | "venue" | "vendors" | "guests" | "shopping" | "home" | "honeymoon";
export function progress(ws: Workspace, tasks: Task[]): Record<AreaKey, number> {
  const p = ws.profile;
  const vendors = ws.vendors.filter((v) => v.status !== "cancelled");
  const guests = ws.guests;
  const answered = guests.filter((g) => g.rsvp === "confirmed" || g.rsvp === "declined").length;
  return {
    overall: weightedProgress(tasks),
    bride: blend(tasksIn(tasks, ["dress", "look", "beauty", "jewellery", "accessories"])),
    venue: blend(tasksIn(tasks, ["venue"])),
    vendors: blend(tasksIn(tasks, ["planner", "photo", "catering", "decor", "entertainment"]), ratio(vendors.filter((v) => v.status === "booked" || v.status === "completed").length, vendors.length)),
    guests: blend(tasksIn(tasks, ["invitations", "guests"]), ratio(answered, guests.length)),
    shopping: blend(tasksIn(tasks, ["trousseau"]), itemsDone(ws.items, "trousseau")),
    home: p?.home === "no" ? 1 : blend(tasksIn(tasks, ["home"]), itemsDone(ws.items, "home")),
    honeymoon: p?.honeymoon === "no" ? 1 : blend(tasksIn(tasks, ["honeymoon"]), itemsDone(ws.items, "packing")),
  };
}

export function progressMessage(pct: number, overdue: number): "ontrack" | "focus" | "start" | "almost" {
  if (pct >= 0.85) return "almost";
  if (overdue >= 3) return "focus";
  if (pct < 0.08) return "start";
  return "ontrack";
}

// ---------- budget & payments ----------
export const budgetCats: BudgetCat[] = ["venue", "catering", "dress", "jewellery", "beauty", "photo", "video", "decor", "entertainment", "invitations", "henna", "milka", "honeymoon", "home", "gifts", "transport", "misc"];
const share: Record<BudgetCat, number> = { venue: 0.22, catering: 0.14, dress: 0.08, jewellery: 0.1, beauty: 0.04, photo: 0.06, video: 0.03, decor: 0.1, entertainment: 0.04, invitations: 0.015, henna: 0.03, milka: 0.03, honeymoon: 0.08, home: 0.08, gifts: 0.015, transport: 0.01, misc: 0.02 };

export function activeBudgetCats(p: Profile) {
  return budgetCats.filter((c) => (c === "henna" ? p.events.includes("henna") : c === "milka" ? p.events.includes("milka") : c === "honeymoon" ? p.honeymoon !== "no" : c === "home" ? p.home !== "no" : true));
}

export function paymentStatus(pay: Payment, today: string): "paid" | "partial" | "overdue" | "soon" | "later" {
  if (pay.paidOn) return pay.paidAmount !== undefined && pay.paidAmount < pay.amount ? "partial" : "paid";
  const d = diffDays(today, pay.due);
  if (d < 0) return "overdue";
  if (d <= 7) return "soon";
  return "later";
}
export const paidOf = (pay: Payment) => (pay.paidOn ? (pay.paidAmount ?? pay.amount) : 0);

export function budgetSummary(ws: Workspace) {
  const p = ws.profile!;
  const live = ws.expenses.filter((e) => e.status !== "cancelled");
  const cost = (e: (typeof live)[number]) => e.actual ?? e.estimated;
  const paid = ws.payments.reduce((s, x) => s + paidOf(x), 0);
  const booked = live.filter((e) => e.status !== "planned").reduce((s, e) => s + cost(e), 0);
  const planned = live.filter((e) => e.status === "planned").reduce((s, e) => s + cost(e), 0);
  const committed = Math.max(0, booked - paid);
  const cats = activeBudgetCats(p);
  // Explicit allocations win; the rest of the budget is spread over the other categories.
  const explicit = cats.reduce((s, c) => s + (ws.categoryBudgets[c] ?? 0), 0);
  const rest = Math.max(0, p.budget - explicit);
  const shareSum = cats.filter((c) => ws.categoryBudgets[c] === undefined).reduce((s, c) => s + share[c], 0) || 1;
  const perCat = cats.map((c) => {
    const exp = live.filter((e) => e.cat === c);
    const ids = new Set(exp.map((e) => e.id));
    const catPaid = ws.payments.filter((x) => x.expenseId && ids.has(x.expenseId)).reduce((s, x) => s + paidOf(x), 0);
    const catBooked = exp.filter((e) => e.status !== "planned").reduce((s, e) => s + cost(e), 0);
    const catPlanned = exp.filter((e) => e.status === "planned").reduce((s, e) => s + cost(e), 0);
    const allocated = ws.categoryBudgets[c] ?? Math.round((rest * share[c]) / shareSum / 10) * 10;
    return { cat: c, allocated, paid: catPaid, booked: catBooked, planned: catPlanned, count: exp.length };
  });
  return { total: p.budget, paid, committed, planned, remaining: p.budget - paid - committed, perCat };
}

// ---------- alerts (only when needed) & notifications ----------
export type Alert = {
  id: string;
  tone: "urgent" | "soon";
  kind: "payment_overdue" | "payment_soon" | "task_overdue" | "appt_soon" | "passport" | "rsvp" | "contract";
  ref?: string;
  label: string;
  days: number;
  amount?: number;
  count?: number;
  section: string;
};

export function alerts(ws: Workspace, tasks: Task[], today: string): Alert[] {
  const p = ws.profile;
  if (!p) return [];
  const out: Alert[] = [];
  for (const pay of ws.payments) {
    const s = paymentStatus(pay, today);
    const d = diffDays(today, pay.due);
    if (s === "overdue") out.push({ id: `pay-${pay.id}`, tone: "urgent", kind: "payment_overdue", ref: pay.id, label: pay.label, days: -d, amount: pay.amount, section: "budget" });
    else if (s === "soon" && d <= 3) out.push({ id: `pay-${pay.id}`, tone: "soon", kind: "payment_soon", ref: pay.id, label: pay.label, days: d, amount: pay.amount, section: "budget" });
  }
  tasks
    .filter((t) => isOpen(t) && t.due < today && (t.priority === "urgent" || t.priority === "high"))
    .slice(0, 3)
    .forEach((t) => out.push({ id: `task-${t.id}`, tone: "urgent", kind: "task_overdue", ref: t.id, label: t.title, days: diffDays(t.due, today), section: "checklist" }));
  for (const a of ws.appointments) {
    const d = diffDays(today, a.date);
    if (!a.done && d >= 0 && d <= 2) out.push({ id: `appt-${a.id}`, tone: "soon", kind: "appt_soon", ref: a.id, label: a.title, days: d, section: "calendar" });
  }
  const h = ws.honeymoon;
  if (p.honeymoon !== "no" && h.passportExpiry) {
    const back = h.to ?? h.from ?? p.weddingDate;
    if (diffDays(back, h.passportExpiry) < 183) out.push({ id: "passport", tone: "urgent", kind: "passport", label: "", days: diffDays(today, h.passportExpiry), section: "honeymoon" });
  }
  const daysLeft = diffDays(today, p.weddingDate);
  const waiting = ws.guests.filter((g) => g.rsvp !== "confirmed" && g.rsvp !== "declined").length;
  if (daysLeft >= 0 && daysLeft <= 21 && waiting > 0) out.push({ id: "rsvp", tone: "soon", kind: "rsvp", label: "", days: daysLeft, count: waiting, section: "guests" });
  for (const v of ws.vendors) if (v.status === "booked" && !v.contractSigned) out.push({ id: `contract-${v.id}`, tone: "soon", kind: "contract", ref: v.id, label: v.name, days: 0, section: "vendors" });
  return out.sort((a, b) => Number(b.tone === "urgent") - Number(a.tone === "urgent"));
}

export type Notice = { id: string; kind: "appt" | "payment" | "milestone" | "countdown" | Alert["kind"]; label: string; days: number; amount?: number; count?: number; section: string };

/** Actionable notifications: alerts first, then what's coming in the next week. */
export function notifications(ws: Workspace, tasks: Task[], today: string): Notice[] {
  const p = ws.profile;
  if (!p) return [];
  const list: Notice[] = alerts(ws, tasks, today).map((a) => ({ ...a }));
  const seen = new Set(list.map((n) => n.id));
  for (const a of ws.appointments) {
    const d = diffDays(today, a.date);
    if (!a.done && d > 2 && d <= 7 && !seen.has(`appt-${a.id}`)) list.push({ id: `appt-${a.id}`, kind: "appt", label: a.title, days: d, section: "calendar" });
  }
  for (const pay of ws.payments) {
    const d = diffDays(today, pay.due);
    if (!pay.paidOn && d > 3 && d <= 10 && !seen.has(`pay-${pay.id}`)) list.push({ id: `pay-${pay.id}`, kind: "payment", label: pay.label, days: d, amount: pay.amount, section: "budget" });
  }
  const left = diffDays(today, p.weddingDate);
  if ([100, 60, 30, 14, 7, 1].some((m) => left <= m && left > m - 7)) list.push({ id: "countdown", kind: "countdown", label: "", days: left, section: "checklist" });
  return list;
}

/** Milestones reached (tasks marked as milestones, plus RSVP complete). */
export function milestones(ws: Workspace, tasks: Task[], lang: "en" | "ar") {
  const out = tasks.filter((t) => t.milestone && t.status === "done").map((t) => ({ id: t.id, label: t.milestone! }));
  if (ws.guests.length >= 5 && ws.guests.every((g) => g.rsvp === "confirmed" || g.rsvp === "declined")) out.push({ id: "rsvp-complete", label: lang === "ar" ? "اكتملت ردود المدعوين ١٠٠٪" : "100% guest RSVPs complete" });
  return out;
}

// ---------- search ----------
export type Hit = { kind: "task" | "vendor" | "appointment" | "item" | "document" | "guest" | "payment"; id: string; title: string; sub?: string; section: string };

export function search(ws: Workspace, tasks: Task[], q: string): Hit[] {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  const has = (...xs: (string | undefined)[]) => xs.some((x) => x?.toLowerCase().includes(s));
  const hits: Hit[] = [];
  for (const t of tasks) if (has(t.title, t.notes, t.cat)) hits.push({ kind: "task", id: t.id, title: t.title, sub: t.due, section: "checklist" });
  for (const v of ws.vendors) if (has(v.name, v.cat, v.contact, v.notes, v.instagram)) hits.push({ kind: "vendor", id: v.id, title: v.name, sub: v.cat, section: "vendors" });
  for (const a of ws.appointments) if (has(a.title, a.place, a.notes, a.kind)) hits.push({ kind: "appointment", id: a.id, title: a.title, sub: a.date, section: "calendar" });
  for (const i of ws.items) if (has(i.name, i.cat, i.store, i.notes)) hits.push({ kind: "item", id: i.id, title: i.name, sub: i.cat, section: i.list === "home" ? "home" : i.list === "closet" ? "closet" : i.list === "packing" ? "honeymoon" : i.list === "sos" ? "day" : "shopping" });
  for (const d of ws.docs) if (has(d.name, d.cat, d.notes)) hits.push({ kind: "document", id: d.id, title: d.name, sub: d.cat, section: "documents" });
  for (const g of ws.guests) if (has(g.name, g.family, g.phone, g.notes)) hits.push({ kind: "guest", id: g.id, title: g.name, sub: g.family, section: "guests" });
  for (const p of ws.payments) if (has(p.label, p.notes)) hits.push({ kind: "payment", id: p.id, title: p.label, sub: p.due, section: "budget" });
  return hits.slice(0, 40);
}
