/**
 * Hikayat Qudoom (حكاية قدوم): data model.
 *
 * One plan document per mother (per licensed account), saved on the server through the same
 * licensing-checked, compare-and-swap path as the bridal planner. Entities reference each other by
 * id (item → order, favor → order/event, payment → order, gift → item), so nothing is counted twice
 * and the document maps 1:1 onto relational tables later.
 *
 * Money is always an integer number of MINOR units of the plan's currency (OMR/KWD/BHD = 1/1000,
 * SAR/AED/QAR = 1/100). Dates are local calendar dates "YYYY-MM-DD" (never converted between time
 * zones); times are local "HH:MM" in the plan's time zone.
 *
 * Things that strangers touch (gift reservations, visit requests, share links) do NOT live here:
 * they are rows in the database, written atomically (see server/store.ts).
 */
export type Currency = "OMR" | "SAR" | "AED" | "KWD" | "BHD" | "QAR";
export const currencyDigits: Record<Currency, number> = { OMR: 3, KWD: 3, BHD: 3, SAR: 2, AED: 2, QAR: 2 };
export type Country = "OM" | "SA" | "AE" | "KW" | "BH" | "QA" | "other";

export type ThemeId = "cloud" | "moon" | "garden" | "pearl";
export type SectionId = "prep" | "bag" | "nursery" | "mother" | "reception" | "visits" | "hospitality" | "registry" | "received" | "favors" | "budget" | "calendar" | "memories";
export const allSections: SectionId[] = ["prep", "bag", "nursery", "mother", "reception", "visits", "hospitality", "registry", "received", "favors", "budget", "calendar", "memories"];
export type ExperiencePreset = "prep" | "prepReception" | "full" | "custom";
export type ReceptionKind = "hospital" | "home" | "family" | "aqiqah" | "custom";

export type Profile = {
  motherName: string;
  babyName?: string;
  /** Expected date only: never shown as a confirmed birth date. */
  dueDate?: string;
  firstTime?: "yes" | "no";
  country: Country;
  currency: Currency;
  /** IANA time zone used for "today" and visit slots, e.g. "Asia/Muscat". */
  timeZone: string;
  budgetMinor?: number;
  preset: ExperiencePreset;
  sections: Record<SectionId, boolean>;
  receptionKinds: ReceptionKind[];
  theme: ThemeId;
  nurseryKind: "room" | "corner";
  /** Set by the mother herself ("وصل صغيرنا"), never automatically from the due date. */
  arrived?: { date?: string };
  createdAt: string;
};

// ---------- Preparations (baby items, nursery items and the mother's own items share one shape) ----------
export type ItemArea = "baby" | "nursery" | "mother";
export type ItemCat =
  | "clothes" | "sleep" | "diaper" | "bath" | "outing" | "feeding" | "storage" | "extra"
  | "furniture" | "decor" | "nurseryTextile"
  | "personal" | "comfort" | "custom";
export type Priority = "essential" | "optional" | "later";
export type ItemStatus = "todo" | "have" | "buying" | "ordered" | "received" | "skip";
export type Item = {
  id: string;
  area: ItemArea;
  name: string;
  cat: ItemCat;
  customCat?: string;
  qtyNeeded: number;
  qtyHave: number;
  priority: Priority;
  status: ItemStatus;
  plannedMinor?: number;
  actualMinor?: number;
  url?: string;
  store?: string;
  fileId?: string;
  spec?: string;
  notes?: string;
  needBy?: string;
  owner?: string;
  /** Linked request on the public gift list. A gifted item is never counted as a cost. */
  giftId?: string;
  /** Bought through an order: the order carries the cost, so the item does not. */
  orderId?: string;
};

// ---------- Hospital bag ----------
export type BagId = "mother" | "baby" | "companion" | "docs";
export type BagItem = { id: string; bag: BagId; name: string; qty: number; provided: boolean; packed: boolean; skip?: boolean; notes?: string };

// ---------- Tasks (any section) ----------
export type TaskArea = "general" | "nursery" | "mother" | "reception" | "favors" | "visits";
export type TaskStatus = "todo" | "done" | "skip";
export type Task = { id: string; title: string; area: TaskArea; due?: string; time?: string; status: TaskStatus; owner?: string; notes?: string; eventId?: string };

// ---------- Mother & postpartum help plan ----------
export type HelpKind = "meals" | "home" | "family" | "kids" | "helper" | "other";
export type HelpRow = { id: string; title: string; kind: HelpKind; owner?: string; day: number; time?: string; status: TaskStatus; notes?: string };
export type HelpPlan = { days: number; start?: string };

// ---------- Reception plans ----------
export type EventArea = "decor" | "nameboard" | "flowers" | "sweets" | "hospitality" | "favors" | "photo" | "other";
export type EventCheck = { id: string; area: EventArea; title: string; done: boolean; owner?: string; notes?: string };
export type ReceptionEvent = {
  id: string;
  kind: ReceptionKind;
  name: string;
  date?: string;
  time?: string;
  place?: string;
  expected?: number;
  theme?: string;
  budgetMinor?: number;
  notes?: string;
  checks: EventCheck[];
};

// ---------- Visits ----------
export type VisitGroup = "family" | "friends" | "colleagues" | "other";
export type VisitStatus = "waiting" | "requested" | "confirmed" | "declined" | "cancelled" | "done";
export type Slot = { date: string; time: string };
export type Visit = {
  id: string;
  name: string;
  group: VisitGroup;
  people: number;
  contact?: string;
  proposed?: Slot;
  confirmed?: Slot;
  status: VisitStatus;
  notes?: string;
  /** Set when the visit came from the booking link (row in oc_qd_visit_requests). */
  requestId?: string;
};
export type Window = { from: string; to: string };
export type VisitSettings = {
  /** Weekly hours, 0 = Sunday … 6 = Saturday. */
  week: Record<"0" | "1" | "2" | "3" | "4" | "5" | "6", Window[]>;
  slotMinutes: number;
  maxPeople: number;
  closedDates: string[];
  breaks: Window[];
  paused: boolean;
  /** Visitors' requests always wait for the mother's approval in this version. */
  needsApproval: true;
  /** How long a request holds its seats while waiting for approval (then it stops blocking). */
  holdHours: number;
  from?: string;
  to?: string;
  message: string;
};

// ---------- Hospitality ----------
export type HospKind = "coffee" | "tea" | "water" | "juice" | "dates" | "chocolate" | "sweets" | "savory" | "meal" | "custom";
export type HospUnit = "cup" | "piece" | "box" | "tray" | "bottle" | "kg" | "plate" | "pack" | "thermos" | "custom";
export type HospItem = {
  id: string;
  name: string;
  kind: HospKind;
  unit: HospUnit;
  customUnit?: string;
  /** Servings each guest takes (e.g. 2 cups of coffee). */
  perGuest: number;
  /** Servings one unit gives (e.g. a thermos = 12 cups). */
  servingsPerUnit: number;
  reservePct: number;
  /** Guest count: from a reception, from a visit, or typed by hand. */
  source: { eventId?: string; visitId?: string; manual?: number };
  unitPriceMinor?: number;
  notes?: string;
  /** Private: allergies or preferences. Never shared. */
  dietNotes?: string;
};

// ---------- Gift list (the mother's side; reservations live in the database) ----------
export type Gift = {
  id: string;
  name: string;
  fileId?: string;
  url?: string;
  priceMinor?: number;
  spec?: string;
  qtyNeeded: number;
  priority: Priority;
  /** Shown to gift givers. */
  publicNote?: string;
  itemId?: string;
  hidden?: boolean;
};

// ---------- Received gifts (private) ----------
export type ReceivedKind = "item" | "cash" | "gold" | "other";
export type ReceivedGift = { id: string; from: string; kind: ReceivedKind; desc?: string; date?: string; fileId?: string; valueMinor?: number; notes?: string; thanked: boolean; thankedOn?: string };

// ---------- Favors (توزيعات) ----------
export type FavorStatus = "idea" | "quote" | "sample" | "approved" | "making" | "ready" | "received";
export type Favor = {
  id: string;
  eventId?: string;
  type: string;
  inspirationFileId?: string;
  sampleFileId?: string;
  vendor?: string;
  contact?: string;
  printedText?: string;
  babyName?: string;
  qtyBase: number;
  qtyExtra: number;
  unitMinor: number;
  feesMinor: number;
  depositMinor: number;
  sampleApprovedOn?: string;
  deliveryDate?: string;
  status: FavorStatus;
  qtyReceived: number;
  qtyGiven: number;
  notes?: string;
  /** When the favor is also an order, the order carries the money (counted once). */
  orderId?: string;
};

// ---------- Budget, vendors, orders, payments ----------
export type BudgetCat = "baby" | "mother" | "nursery" | "reception" | "hospitality" | "favors" | "photo" | "other";
export const budgetCats: BudgetCat[] = ["baby", "mother", "nursery", "reception", "hospitality", "favors", "photo", "other"];
export type Vendor = { id: string; name: string; kind: string; contact?: string; notes?: string };
export type OrderStatus = "quoted" | "ordered" | "shipped" | "received" | "cancelled";
export type Order = {
  id: string;
  title: string;
  cat: BudgetCat;
  vendorId?: string;
  ref?: string;
  orderDate?: string;
  deliveryDate?: string;
  /** In the plan currency. For a foreign-currency order this is the converted value the mother entered. */
  amountMinor: number;
  /** Original amount when paid in another currency (recorded, never summed). */
  foreign?: { currency: Currency; amountMinor: number; rate: number };
  status: OrderStatus;
  receiptFileId?: string;
  eventId?: string;
  notes?: string;
};
export type Payment = { id: string; orderId?: string; label: string; amountMinor: number; due?: string; paidOn?: string; notes?: string };

// ---------- Calendar & memories ----------
export type ApptKind = "medical" | "personal" | "other";
export type Appointment = { id: string; title: string; kind: ApptKind; date: string; time?: string; place?: string; notes?: string };
export type Memory = { id: string; title: string; date?: string; text?: string; fileId?: string; order: number };
export type CardTemplate = "arrived" | "invite" | "thanks" | "favor";
export type CardDesign = { id: string; template: CardTemplate; title: string; name?: string; text?: string; date?: string; tone: "theme" | "warm" | "calm"; showDate: boolean; showDetails: boolean; details?: string; fileId?: string };

// ---------- Files (bytes live server-side, private; only metadata here) ----------
export type FileMeta = { id: string; name: string; mime: string; size: number; createdAt: string; caption?: string; order?: number; board?: "nursery" | "memories" | "receipts" | "gifts" | "favors" | "items" };

export type Plan = {
  v: 1;
  profile: Profile | null;
  items: Item[];
  bag: BagItem[];
  tasks: Task[];
  help: HelpPlan;
  helpRows: HelpRow[];
  events: ReceptionEvent[];
  visits: Visit[];
  visitSettings: VisitSettings;
  hospitality: HospItem[];
  gifts: Gift[];
  received: ReceivedGift[];
  favors: Favor[];
  vendors: Vendor[];
  orders: Order[];
  payments: Payment[];
  budget: Partial<Record<BudgetCat, number>>;
  appointments: Appointment[];
  memories: Memory[];
  cards: CardDesign[];
  files: FileMeta[];
  thankTemplate?: string;
  seen: string[];
  updatedAt?: string;
};

export const defaultVisitSettings = (lang: "ar" | "en" = "ar"): VisitSettings => ({
  week: { "0": [{ from: "16:00", to: "20:00" }], "1": [{ from: "16:00", to: "20:00" }], "2": [{ from: "16:00", to: "20:00" }], "3": [{ from: "16:00", to: "20:00" }], "4": [{ from: "16:00", to: "20:00" }], "5": [], "6": [{ from: "16:00", to: "20:00" }] },
  slotMinutes: 60,
  maxPeople: 6,
  closedDates: [],
  breaks: [],
  paused: false,
  needsApproval: true,
  holdHours: 24,
  message:
    lang === "ar"
      ? "هلا والله 🤍 حابين نشارككم فرحتنا بقدوم صغيرنا. اختاروا الوقت اللي يناسبكم للزيارة من الرابط، وبنأكد لكم الموعد."
      : "Hello! We'd love to share our joy with you. Pick a time that suits you for a visit from the link, and we'll confirm it.",
});

export function emptyPlan(): Plan {
  return {
    v: 1,
    profile: null,
    items: [],
    bag: [],
    tasks: [],
    help: { days: 40 },
    helpRows: [],
    events: [],
    visits: [],
    visitSettings: defaultVisitSettings(),
    hospitality: [],
    gifts: [],
    received: [],
    favors: [],
    vendors: [],
    orders: [],
    payments: [],
    budget: {},
    appointments: [],
    memories: [],
    cards: [],
    files: [],
    seen: [],
  };
}

export const presetSections: Record<Exclude<ExperiencePreset, "custom">, SectionId[]> = {
  prep: ["prep", "bag", "nursery", "mother", "budget", "calendar"],
  prepReception: ["prep", "bag", "nursery", "mother", "reception", "visits", "hospitality", "budget", "calendar"],
  full: allSections,
};
export function sectionsFor(preset: ExperiencePreset, custom?: SectionId[]): Record<SectionId, boolean> {
  const on = new Set(preset === "custom" ? custom ?? allSections : presetSections[preset]);
  return Object.fromEntries(allSections.map((s) => [s, on.has(s)])) as Record<SectionId, boolean>;
}
