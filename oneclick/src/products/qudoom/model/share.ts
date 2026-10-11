import { addDays, manualLoad, slotKey, slotsOn, todayIn } from "./engine";
import type { Op } from "./schema";
import type { Coll } from "./schema";
import type { Gift, ItemArea, Plan, Priority, SectionId, TaskArea, VisitSettings } from "./types";

/**
 * What the public links may know about a plan, and nothing more. Published to the database when
 * the mother saves, so a guest's page never reads her private document. No addresses, no
 * phone numbers, no guests' names, no notes, no private photos.
 */
export type PublicGift = { id: string; name: string; qtyNeeded: number; priority: Priority; priceMinor?: number; spec?: string; url?: string; publicNote?: string };
export type Projection = {
  name: string;
  lang: "ar" | "en";
  currency: string;
  tz: string;
  gifts: PublicGift[];
  visits: { settings: Omit<VisitSettings, "message">; manual: Record<string, number> };
};

export function projection(p: Plan, lang: "ar" | "en" = "ar"): Projection | null {
  if (!p.profile) return null;
  const tz = p.profile.timeZone;
  const today = todayIn(tz);
  const gifts = p.profile.sections.registry === false ? [] : p.gifts.filter((g) => !g.hidden).map(publicGift);
  const { message: _m, ...settings } = p.visitSettings;
  const manual = Object.fromEntries(Object.entries(manualLoad(p)).filter(([k]) => k.slice(0, 10) >= today));
  return { name: p.profile.motherName, lang, currency: p.profile.currency, tz, gifts, visits: { settings: p.profile.sections.visits === false ? { ...settings, paused: true } : settings, manual } };
}

const publicGift = (g: Gift): PublicGift => ({
  id: g.id,
  name: g.name,
  qtyNeeded: g.qtyNeeded,
  priority: g.priority,
  ...(g.priceMinor !== undefined ? { priceMinor: g.priceMinor } : {}),
  ...(g.spec ? { spec: g.spec } : {}),
  ...(g.url ? { url: g.url } : {}),
  ...(g.publicNote ? { publicNote: g.publicNote } : {}),
});

/** Days a visitor may choose from: today onward, at most `horizon` days, inside the mother's dates. */
export function openSlots(proj: Projection, booked: Record<string, number>, nowMs = Date.now(), horizon = 30) {
  const s = proj.visits.settings as VisitSettings;
  if (s.paused) return [];
  const today = todayIn(proj.tz, new Date(nowMs));
  const nowHm = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: proj.tz }).format(new Date(nowMs));
  const out: { date: string; times: string[] }[] = [];
  for (let i = 0; i < horizon; i++) {
    const date = addDays(today, i);
    const times = slotsOn(date, s).filter((time) => {
      if (date === today && time <= nowHm) return false;
      const k = slotKey({ date, time });
      return (proj.visits.manual[k] ?? 0) + (booked[k] ?? 0) < s.maxPeople;
    });
    if (times.length) out.push({ date, times });
  }
  return out;
}

export function isOpenSlot(proj: Projection, date: string, time: string, nowMs = Date.now()) {
  return openSlots(proj, {}, nowMs, 60).some((d) => d.date === date && d.times.includes(time));
}

// ---------- invited helpers ----------

const itemSection: Record<ItemArea, SectionId> = { baby: "prep", nursery: "nursery", mother: "mother" };
const taskSection: Record<TaskArea, SectionId> = { general: "prep", nursery: "nursery", mother: "mother", reception: "reception", favors: "favors", visits: "visits" };
const collSection: Partial<Record<Coll, SectionId>> = {
  bag: "bag",
  helpRows: "mother",
  events: "reception",
  visits: "visits",
  hospitality: "hospitality",
  gifts: "registry",
  received: "received",
  favors: "favors",
  vendors: "budget",
  orders: "budget",
  payments: "budget",
  appointments: "calendar",
  memories: "memories",
  cards: "memories",
};

/** The part of the plan a helper with these sections may see. Everything else is removed before it leaves the server. */
export function planForHelper(p: Plan, sections: SectionId[]): Plan {
  const has = (s: SectionId) => sections.includes(s);
  const keep = <T,>(list: T[], s: SectionId) => (has(s) ? list : []);
  const out: Plan = {
    ...p,
    profile: p.profile && {
      ...p.profile,
      budgetMinor: has("budget") ? p.profile.budgetMinor : undefined,
      sections: Object.fromEntries(Object.entries(p.profile.sections).map(([k, v]) => [k, v && has(k as SectionId)])) as typeof p.profile.sections,
    },
    items: p.items.filter((i) => has(itemSection[i.area])),
    bag: keep(p.bag, "bag"),
    tasks: p.tasks.filter((t) => has(taskSection[t.area])),
    helpRows: keep(p.helpRows, "mother"),
    events: keep(p.events, "reception"),
    visits: keep(p.visits, "visits"),
    hospitality: keep(p.hospitality, "hospitality"),
    gifts: keep(p.gifts, "registry"),
    received: keep(p.received, "received"),
    favors: keep(p.favors, "favors"),
    vendors: keep(p.vendors, "budget"),
    orders: keep(p.orders, "budget"),
    payments: keep(p.payments, "budget"),
    budget: has("budget") ? p.budget : {},
    appointments: keep(p.appointments, "calendar"),
    memories: keep(p.memories, "memories"),
    cards: keep(p.cards, "memories"),
    thankTemplate: has("received") ? p.thankTemplate : undefined,
    seen: [],
    files: [],
  };
  const used = new Set<string>();
  const scan = (x: unknown) => {
    if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) (k === "fileId" && typeof v === "string" ? used.add(v) : scan(v));
  };
  scan({ ...out, files: [] });
  const boardSection: Record<string, SectionId> = { nursery: "nursery", memories: "memories", receipts: "budget", gifts: "registry", favors: "favors", items: "prep" };
  out.files = p.files.filter((f) => used.has(f.id) || (f.board && has(boardSection[f.board])));
  return out;
}

/** Whether a helper with these rights may apply this change. Settings, setup and deletion of the whole plan stay with the mother. */
export function helperMayApply(op: Op, sections: SectionId[], canEdit: boolean): boolean {
  if (!canEdit) return false;
  const has = (s: SectionId) => sections.includes(s);
  switch (op.t) {
    case "put":
    case "del": {
      if (op.c === "items" || op.c === "tasks") {
        if (op.t === "del") return true; // checked against the stored record by the caller
        const area = (op.item as { area?: string } | null)?.area;
        return op.c === "items" ? !!area && area in itemSection && has(itemSection[area as ItemArea]) : !!area && area in taskSection && has(taskSection[area as TaskArea]);
      }
      if (op.c === "files") return true; // checked by the caller against what the helper uploaded or can see
      const s = collSection[op.c];
      return !!s && has(s);
    }
    case "visitSettings":
      return has("visits");
    case "help":
      return has("mother");
    case "budget":
      return has("budget");
    case "thankTemplate":
      return has("received");
    case "reorderMemory":
      return has("memories");
    default:
      return false;
  }
}

/**
 * For changes to items, tasks and files: the record already stored under that id (if any) must
 * also be one the helper can see, so a helper can never overwrite or delete something hidden from her.
 */
export function helperMayTouch(p: Plan, op: Extract<Op, { t: "put" | "del" }>, sections: SectionId[]) {
  const id = op.t === "del" ? op.id : (op.item as { id?: unknown } | null)?.id;
  if (typeof id !== "string") return op.t === "put";
  if (op.c === "items") {
    const it = p.items.find((i) => i.id === id);
    return !it || sections.includes(itemSection[it.area]);
  }
  if (op.c === "tasks") {
    const tk = p.tasks.find((i) => i.id === id);
    return !tk || sections.includes(taskSection[tk.area]);
  }
  if (op.c === "files") {
    const f = p.files.find((x) => x.id === id);
    return op.t === "put" ? !f || planForHelper(p, sections).files.some((x) => x.id === id) : !!f && planForHelper(p, sections).files.some((x) => x.id === id);
  }
  return true;
}
