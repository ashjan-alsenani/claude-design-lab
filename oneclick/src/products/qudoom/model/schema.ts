import * as z from "zod/mini";

/**
 * Validation for every change sent to the server. The server never trusts the browser: each
 * operation is parsed here before it touches a mother's plan. zod/mini because the browser bundles
 * this file too (the same rules run in both places).
 */
export const idRe = /^[A-Za-z0-9_-]{1,48}$/;
const id = z.string().check(z.regex(idRe));
const date = z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/));
const time = z.string().check(z.regex(/^([01]\d|2[0-3]):[0-5]\d$/));
const text = (max = 200, min = 0) => z.string().check(z.trim(), z.maxLength(max), ...(min ? [z.minLength(min)] : []));
const minor = z.int().check(z.minimum(0), z.maximum(10_000_000_000));
const int = (min: number, max: number) => z.int().check(z.minimum(min), z.maximum(max));
const num = (min: number, max: number) => z.number().check(z.minimum(min), z.maximum(max));
const opt = z.optional;
const url = z.string().check(z.maxLength(600), z.refine((s) => /^https?:\/\/[^\s]+$/.test(s), "url"));

export const currency = z.enum(["OMR", "SAR", "AED", "KWD", "BHD", "QAR"]);
const section = z.enum(["prep", "bag", "nursery", "mother", "reception", "visits", "hospitality", "registry", "received", "favors", "budget", "calendar", "memories"]);
const receptionKind = z.enum(["hospital", "home", "family", "aqiqah", "custom"]);
const priority = z.enum(["essential", "optional", "later"]);
const taskStatus = z.enum(["todo", "done", "skip"]);
const budgetCat = z.enum(["baby", "mother", "nursery", "reception", "hospitality", "favors", "photo", "other"]);
const slot = z.object({ date, time });
const win = z.object({ from: time, to: time });

export const profileSchema = z.object({
  motherName: text(60, 1),
  babyName: opt(text(60)),
  dueDate: opt(date),
  firstTime: opt(z.enum(["yes", "no"])),
  country: z.enum(["OM", "SA", "AE", "KW", "BH", "QA", "other"]),
  currency,
  timeZone: z.string().check(z.regex(/^[A-Za-z_]+(\/[A-Za-z_+-]+){0,2}$/), z.maxLength(40)),
  budgetMinor: opt(minor),
  preset: z.enum(["prep", "prepReception", "full", "custom"]),
  sections: z.record(section, z.boolean()),
  receptionKinds: z.array(receptionKind).check(z.maxLength(5)),
  theme: z.enum(["cloud", "moon", "garden", "pearl"]),
  nurseryKind: z.enum(["room", "corner"]),
  arrived: opt(z.object({ date: opt(date) })),
  createdAt: z.string().check(z.maxLength(40)),
});

export const visitSettingsSchema = z.object({
  week: z.object({ "0": z.array(win).check(z.maxLength(4)), "1": z.array(win).check(z.maxLength(4)), "2": z.array(win).check(z.maxLength(4)), "3": z.array(win).check(z.maxLength(4)), "4": z.array(win).check(z.maxLength(4)), "5": z.array(win).check(z.maxLength(4)), "6": z.array(win).check(z.maxLength(4)) }),
  slotMinutes: int(15, 240),
  maxPeople: int(1, 200),
  closedDates: z.array(date).check(z.maxLength(400)),
  breaks: z.array(win).check(z.maxLength(6)),
  paused: z.boolean(),
  needsApproval: z.literal(true),
  holdHours: int(1, 168),
  from: opt(date),
  to: opt(date),
  message: text(1000),
});

const itemSchemas = {
  items: z.object({
    id,
    area: z.enum(["baby", "nursery", "mother"]),
    name: text(120, 1),
    cat: z.enum(["clothes", "sleep", "diaper", "bath", "outing", "feeding", "storage", "extra", "furniture", "decor", "nurseryTextile", "personal", "comfort", "custom"]),
    customCat: opt(text(40)),
    qtyNeeded: int(0, 999),
    qtyHave: int(0, 999),
    priority,
    status: z.enum(["todo", "have", "buying", "ordered", "received", "skip"]),
    plannedMinor: opt(minor),
    actualMinor: opt(minor),
    url: opt(url),
    store: opt(text(80)),
    fileId: opt(id),
    spec: opt(text(200)),
    notes: opt(text(1000)),
    needBy: opt(date),
    owner: opt(text(60)),
    giftId: opt(id),
    orderId: opt(id),
  }),
  bag: z.object({ id, bag: z.enum(["mother", "baby", "companion", "docs"]), name: text(120, 1), qty: int(0, 99), provided: z.boolean(), packed: z.boolean(), skip: opt(z.boolean()), notes: opt(text(500)) }),
  tasks: z.object({ id, title: text(160, 1), area: z.enum(["general", "nursery", "mother", "reception", "favors", "visits"]), due: opt(date), time: opt(time), status: taskStatus, owner: opt(text(60)), notes: opt(text(1000)), eventId: opt(id) }),
  helpRows: z.object({ id, title: text(160, 1), kind: z.enum(["meals", "home", "family", "kids", "helper", "other"]), owner: opt(text(60)), day: int(1, 120), time: opt(time), status: taskStatus, notes: opt(text(500)) }),
  events: z.object({
    id,
    kind: receptionKind,
    name: text(80, 1),
    date: opt(date),
    time: opt(time),
    place: opt(text(120)),
    expected: opt(int(0, 5000)),
    theme: opt(text(80)),
    budgetMinor: opt(minor),
    notes: opt(text(1000)),
    checks: z.array(z.object({ id, area: z.enum(["decor", "nameboard", "flowers", "sweets", "hospitality", "favors", "photo", "other"]), title: text(120, 1), done: z.boolean(), owner: opt(text(60)), notes: opt(text(300)) })).check(z.maxLength(80)),
  }),
  visits: z.object({
    id,
    name: text(80, 1),
    group: z.enum(["family", "friends", "colleagues", "other"]),
    people: int(1, 100),
    contact: opt(text(60)),
    proposed: opt(slot),
    confirmed: opt(slot),
    status: z.enum(["waiting", "requested", "confirmed", "declined", "cancelled", "done"]),
    notes: opt(text(500)),
    requestId: opt(id),
  }),
  hospitality: z.object({
    id,
    name: text(80, 1),
    kind: z.enum(["coffee", "tea", "water", "juice", "dates", "chocolate", "sweets", "savory", "meal", "custom"]),
    unit: z.enum(["cup", "piece", "box", "tray", "bottle", "kg", "plate", "pack", "thermos", "custom"]),
    customUnit: opt(text(30)),
    perGuest: num(0, 50),
    servingsPerUnit: num(0.01, 10_000),
    reservePct: int(0, 200),
    source: z.object({ eventId: opt(id), visitId: opt(id), manual: opt(int(0, 10_000)) }),
    unitPriceMinor: opt(minor),
    notes: opt(text(300)),
    dietNotes: opt(text(300)),
  }),
  gifts: z.object({ id, name: text(120, 1), fileId: opt(id), url: opt(url), priceMinor: opt(minor), spec: opt(text(200)), qtyNeeded: int(1, 99), priority, publicNote: opt(text(300)), itemId: opt(id), hidden: opt(z.boolean()) }),
  received: z.object({ id, from: text(80, 1), kind: z.enum(["item", "cash", "gold", "other"]), desc: opt(text(200)), date: opt(date), fileId: opt(id), valueMinor: opt(minor), notes: opt(text(500)), thanked: z.boolean(), thankedOn: opt(date) }),
  favors: z.object({
    id,
    eventId: opt(id),
    type: text(80, 1),
    inspirationFileId: opt(id),
    sampleFileId: opt(id),
    vendor: opt(text(80)),
    contact: opt(text(80)),
    printedText: opt(text(200)),
    babyName: opt(text(60)),
    qtyBase: int(0, 10_000),
    qtyExtra: int(0, 10_000),
    unitMinor: minor,
    feesMinor: minor,
    depositMinor: minor,
    sampleApprovedOn: opt(date),
    deliveryDate: opt(date),
    status: z.enum(["idea", "quote", "sample", "approved", "making", "ready", "received"]),
    qtyReceived: int(0, 20_000),
    qtyGiven: int(0, 20_000),
    notes: opt(text(1000)),
    orderId: opt(id),
  }),
  vendors: z.object({ id, name: text(80, 1), kind: text(60), contact: opt(text(80)), notes: opt(text(500)) }),
  orders: z.object({
    id,
    title: text(120, 1),
    cat: budgetCat,
    vendorId: opt(id),
    ref: opt(text(60)),
    orderDate: opt(date),
    deliveryDate: opt(date),
    amountMinor: minor,
    foreign: opt(z.object({ currency, amountMinor: minor, rate: num(0.000001, 1_000_000) })),
    status: z.enum(["quoted", "ordered", "shipped", "received", "cancelled"]),
    receiptFileId: opt(id),
    eventId: opt(id),
    notes: opt(text(1000)),
  }),
  payments: z.object({ id, orderId: opt(id), label: text(120, 1), amountMinor: minor, due: opt(date), paidOn: opt(date), notes: opt(text(300)) }),
  appointments: z.object({ id, title: text(120, 1), kind: z.enum(["medical", "personal", "other"]), date, time: opt(time), place: opt(text(120)), notes: opt(text(500)) }),
  memories: z.object({ id, title: text(120, 1), date: opt(date), text: opt(text(2000)), fileId: opt(id), order: int(0, 100_000) }),
  cards: z.object({ id, template: z.enum(["arrived", "invite", "thanks", "favor"]), title: text(80, 1), name: opt(text(60)), text: opt(text(300)), date: opt(date), tone: z.enum(["theme", "warm", "calm"]), showDate: z.boolean(), showDetails: z.boolean(), details: opt(text(200)), fileId: opt(id) }),
  files: z.object({ id, name: text(120, 1), mime: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]), size: int(1, 3_000_000), createdAt: z.string().check(z.maxLength(40)), caption: opt(text(200)), order: opt(int(0, 100_000)), board: opt(z.enum(["nursery", "memories", "receipts", "gifts", "favors", "items"])) }),
} as const;

export type Coll = keyof typeof itemSchemas;
export const collections = Object.keys(itemSchemas) as Coll[];
export const collLimits: Record<Coll, number> = { items: 600, bag: 200, tasks: 500, helpRows: 600, events: 20, visits: 600, hospitality: 100, gifts: 200, received: 600, favors: 40, vendors: 150, orders: 400, payments: 800, appointments: 400, memories: 300, cards: 40, files: 300 };
export function parseItem(c: Coll, item: unknown) {
  return itemSchemas[c].parse(item);
}

const collEnum = z.enum(collections as [Coll, ...Coll[]]);
export const opSchema = z.discriminatedUnion("t", [
  z.object({ t: z.literal("setup"), profile: profileSchema, lang: z.enum(["ar", "en"]), today: date }),
  z.object({ t: z.literal("profile"), patch: z.partial(profileSchema) }),
  z.object({ t: z.literal("put"), c: collEnum, item: z.unknown() }),
  z.object({ t: z.literal("del"), c: collEnum, id }),
  z.object({ t: z.literal("visitSettings"), patch: z.partial(visitSettingsSchema) }),
  z.object({ t: z.literal("help"), patch: z.object({ days: opt(int(1, 120)), start: opt(z.union([date, z.literal("")])) }) }),
  z.object({ t: z.literal("budget"), cat: budgetCat, amountMinor: z.nullable(minor) }),
  z.object({ t: z.literal("arrived"), on: z.boolean(), date: opt(date) }),
  z.object({ t: z.literal("thankTemplate"), text: text(1000) }),
  z.object({ t: z.literal("seen"), id: z.string().check(z.maxLength(60)) }),
  z.object({ t: z.literal("reorderMemory"), id, dir: z.enum(["up", "down"]) }),
  z.object({ t: z.literal("reset") }),
]);
export type Op = z.infer<typeof opSchema>;
export const MAX_DOC_BYTES = 1_500_000;
