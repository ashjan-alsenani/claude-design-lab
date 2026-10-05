import * as z from "zod/mini";

/**
 * Validation for every change sent to the server. The server never trusts the browser:
 * each operation is parsed with these schemas before it touches the bride's data.
 * Uses zod/mini (same rules, a small fraction of the size) because the browser bundles this file too.
 */
const id = z.string().check(z.regex(/^[A-Za-z0-9_-]{1,48}$/));
const date = z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/));
const time = z.string().check(z.regex(/^\d{2}:\d{2}$/));
const text = (max = 200, min = 0) => z.string().check(z.trim(), z.maxLength(max), ...(min ? [z.minLength(min)] : []));
const money = z.number().check(z.minimum(0), z.maximum(100_000_000));
const int = (min: number, max: number) => z.int().check(z.minimum(min), z.maximum(max));
const opt = z.optional;
const image = z
  .string()
  .check(
    z.maxLength(90_000),
    z.refine((s) => /^https:\/\//.test(s) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s), "image"),
  );
const url = z.string().check(z.maxLength(500), z.refine((s) => /^https?:\/\//.test(s), "url"));

export const currency = z.enum(["OMR", "AED", "SAR", "QAR", "KWD", "BHD", "USD"]);
export const eventKey = z.enum(["engagement", "proposal", "milka", "henna", "shower", "wedding", "sabahiya", "other"]);
const priority = z.enum(["low", "normal", "high", "urgent"]);
const taskStatus = z.enum(["todo", "doing", "waiting", "done", "skip"]);
const category = z.enum(["planning", "venue", "planner", "photo", "dress", "look", "beauty", "jewellery", "accessories", "trousseau", "groom", "invitations", "guests", "catering", "decor", "entertainment", "henna", "milka", "shower", "engagement", "home", "honeymoon", "weddingday", "after"]);
const rsvp = z.enum(["invited", "sent", "confirmed", "declined", "pending"]);
const budgetCat = z.enum(["venue", "dress", "jewellery", "beauty", "photo", "video", "decor", "catering", "entertainment", "invitations", "henna", "milka", "honeymoon", "home", "gifts", "transport", "misc"]);

export const profileSchema = z.object({
  brideName: text(60, 1),
  partnerName: opt(text(60)),
  weddingDate: date,
  country: text(60),
  city: text(60),
  budget: money,
  currency,
  guests: int(0, 5000),
  events: z.array(eventKey).check(z.maxLength(8)),
  eventDates: z.partialRecord(eventKey, date),
  home: z.enum(["yes", "partial", "no"]),
  honeymoon: z.enum(["yes", "notyet", "no"]),
  style: z.enum(["ballroom", "classic", "modern", "minimal", "outdoor", "gulf", "intimate", "custom"]),
  planning: z.enum(["self", "family", "planner"]),
  stage: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  groomSection: z.boolean(),
  calendarShowsTasks: z.boolean(),
  planStart: date,
});

const itemSchemas = {
  customTasks: z.object({ id, title: text(120, 1), cat: category, due: date, priority, status: taskStatus, notes: opt(text(1000)), effort: opt(z.enum(["quick", "hour", "half", "day"])) }),
  expenses: z.object({ id, item: text(120, 1), cat: budgetCat, vendorId: opt(id), estimated: money, actual: opt(money), status: z.enum(["planned", "booked", "paid", "cancelled"]), notes: opt(text(1000)) }),
  payments: z.object({ id, label: text(120, 1), amount: money, due: date, paidOn: opt(date), paidAmount: opt(money), expenseId: opt(id), vendorId: opt(id), notes: opt(text(500)) }),
  vendors: z.object({
    id,
    name: text(120, 1),
    cat: z.enum(["venue", "photo", "video", "makeup", "hair", "dress", "flowers", "decor", "catering", "cake", "entertainment", "henna", "transport", "planner", "other"]),
    status: z.enum(["considering", "contacted", "quoted", "shortlisted", "booked", "completed", "cancelled"]),
    contact: opt(text(80)),
    phone: opt(text(40)),
    instagram: opt(text(80)),
    website: opt(z.union([url, z.literal("")])),
    quoted: opt(money),
    final: opt(money),
    deposit: opt(money),
    contractSigned: opt(z.boolean()),
    bookedOn: opt(date),
    notes: opt(text(1000)),
  }),
  guests: z.object({ id, name: text(120, 1), family: opt(text(80)), side: z.enum(["bride", "groom", "both"]), phone: opt(text(40)), adults: int(0, 50), children: int(0, 50), rsvp, tableId: opt(id), notes: opt(text(500)) }),
  tables: z.object({ id, name: text(60), number: int(0, 999), capacity: int(1, 100) }),
  appointments: z.object({
    id,
    title: text(120, 1),
    kind: z.enum(["fitting", "makeup", "hair", "salon", "facial", "venue", "vendor", "tasting", "photo", "henna", "documents", "beauty", "other"]),
    date,
    time: opt(time),
    place: opt(text(120)),
    vendorId: opt(id),
    notes: opt(text(1000)),
    done: opt(z.boolean()),
  }),
  items: z.object({
    id,
    list: z.enum(["trousseau", "home", "closet", "packing", "sos", "groom"]),
    name: text(120, 1),
    cat: text(40),
    status: z.enum(["need", "bought", "gift", "skip"]),
    qty: opt(int(0, 999)),
    budget: opt(money),
    price: opt(money),
    store: opt(text(80)),
    size: opt(text(20)),
    event: opt(text(40)),
    image: opt(image),
    notes: opt(text(500)),
  }),
  bookings: z.object({ id, kind: z.enum(["flight", "hotel", "transfer", "activity", "restaurant", "other"]), title: text(120, 1), date: opt(date), ref: opt(text(60)), notes: opt(text(500)) }),
  timeline: z.object({ id, time, title: text(120, 1), who: opt(text(60)), notes: opt(text(300)), done: opt(z.boolean()) }),
  mood: z.object({
    id,
    cat: z.enum(["dress", "makeup", "hair", "kosha", "flowers", "tables", "invitation", "cake", "photo", "henna", "home", "honeymoon"]),
    image: opt(image),
    link: opt(url),
    note: opt(text(300)),
    fav: opt(z.boolean()),
    tone: opt(int(0, 7)),
  }),
  docs: z.object({ id, name: text(120, 1), cat: z.enum(["contract", "receipt", "quote", "marriage", "passport", "visa", "flight", "hotel", "other"]), date: opt(date), notes: opt(text(500)), holder: opt(text(60)) }),
} as const;

export type Coll = keyof typeof itemSchemas;
export const collections = Object.keys(itemSchemas) as Coll[];
const collEnum = z.enum(collections as [Coll, ...Coll[]]);

const honeymoonSchema = z.object({
  destination: opt(text(80)),
  from: opt(date),
  to: opt(date),
  passportExpiry: opt(date),
  visa: opt(z.enum(["not_needed", "needed", "applied", "approved"])),
  insurance: opt(z.boolean()),
  currencyNote: opt(text(80)),
  esim: opt(z.boolean()),
  emergency: opt(text(200)),
  notes: opt(text(1000)),
});

export const opSchema = z.discriminatedUnion("t", [
  z.object({ t: z.literal("setup"), profile: profileSchema, lang: z.enum(["en", "ar"]) }),
  z.object({ t: z.literal("profile"), patch: z.partial(profileSchema) }),
  z.object({ t: z.literal("task"), id, patch: z.object({ status: opt(taskStatus), due: opt(z.nullable(date)), notes: opt(text(1000)), priority: opt(z.nullable(priority)) }) }),
  z.object({ t: z.literal("put"), c: collEnum, item: z.record(z.string(), z.unknown()) }),
  z.object({ t: z.literal("del"), c: collEnum, id }),
  z.object({ t: z.literal("guests"), ids: z.array(id).check(z.maxLength(2000)), patch: z.object({ rsvp: opt(rsvp), tableId: opt(z.nullable(id)) }) }),
  z.object({ t: z.literal("honeymoon"), patch: honeymoonSchema }),
  z.object({ t: z.literal("budget"), cat: budgetCat, amount: z.nullable(money) }),
  z.object({ t: z.literal("seen"), id: z.string().check(z.maxLength(48)) }),
  z.object({ t: z.literal("demo"), today: date, lang: z.enum(["en", "ar"]) }),
  z.object({ t: z.literal("reset") }),
]);
export type Op = z.infer<typeof opSchema>;

export function parseItem(c: Coll, item: unknown) {
  return itemSchemas[c].parse(item);
}

export const MAX_DOC_BYTES = 2_500_000;
