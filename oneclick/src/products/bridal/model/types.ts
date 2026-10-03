/**
 * Bridal Journey: data model.
 *
 * One workspace document per bride (per licensed account). Entities carry ids and
 * reference each other by id (Expense -> Vendor, Payment -> Expense/Vendor, Guest -> Table,
 * Appointment -> Vendor, etc.), so the document maps 1:1 onto relational tables later
 * (see docs/BRIDAL_JOURNEY.md). System tasks are generated from TaskTemplates in code; only
 * the bride's changes to them (status, date, notes) are stored.
 */
export type Currency = "OMR" | "AED" | "SAR" | "QAR" | "KWD" | "BHD" | "USD";
export type L = { en: string; ar: string };

export type EventKey = "engagement" | "proposal" | "milka" | "henna" | "shower" | "wedding" | "sabahiya" | "other";
export type HomePlan = "yes" | "partial" | "no";
export type HoneymoonPlan = "yes" | "notyet" | "no";
export type WeddingStyle = "ballroom" | "classic" | "modern" | "minimal" | "outdoor" | "gulf" | "intimate" | "custom";
export type PlanningMode = "self" | "family" | "planner";
export type ProgressStage = 0 | 1 | 2 | 3 | 4; // just started .. almost ready

export type Profile = {
  brideName: string;
  partnerName?: string;
  weddingDate: string; // YYYY-MM-DD
  country: string;
  city: string;
  budget: number; // whole currency units
  currency: Currency;
  guests: number;
  events: EventKey[];
  eventDates: Partial<Record<EventKey, string>>;
  home: HomePlan;
  honeymoon: HoneymoonPlan;
  style: WeddingStyle;
  planning: PlanningMode;
  stage: ProgressStage;
  groomSection: boolean;
  calendarShowsTasks: boolean;
  planStart: string; // YYYY-MM-DD, when the plan was generated (used for catch-up scheduling)
};

export type Priority = "low" | "normal" | "high" | "urgent";
export type TaskStatus = "todo" | "doing" | "waiting" | "done" | "skip";
export type Effort = "quick" | "hour" | "half" | "day";

export type CategoryKey =
  | "planning"
  | "venue"
  | "planner"
  | "photo"
  | "dress"
  | "look"
  | "beauty"
  | "jewellery"
  | "accessories"
  | "trousseau"
  | "groom"
  | "invitations"
  | "guests"
  | "catering"
  | "decor"
  | "entertainment"
  | "henna"
  | "milka"
  | "shower"
  | "engagement"
  | "home"
  | "honeymoon"
  | "weddingday"
  | "after";

export type TaskTemplate = {
  id: string;
  cat: CategoryKey;
  title: L;
  /** Due this many days before the wedding (negative = after). */
  due: number;
  /** Recommended start, days before the wedding (defaults to due + 21). */
  start?: number;
  priority: Priority;
  effort: Effort;
  /** Only when this event / plan applies. */
  when?: EventKey | "home" | "honeymoon" | "groom";
  deps?: string[];
  /** Auto-done when onboarding progress stage >= this value. */
  doneAt?: ProgressStage;
  milestone?: L;
};

/** The bride's changes to a system task. */
export type TaskState = { status?: TaskStatus; due?: string; notes?: string; priority?: Priority };

export type CustomTask = {
  id: string;
  title: string;
  cat: CategoryKey;
  due: string;
  priority: Priority;
  status: TaskStatus;
  notes?: string;
  effort?: Effort;
};

/** A task as the app sees it (system or custom), with dates resolved. */
export type Task = {
  id: string;
  custom: boolean;
  title: string;
  cat: CategoryKey;
  due: string;
  start: string;
  priority: Priority;
  effort: Effort;
  status: TaskStatus;
  notes?: string;
  deps: string[];
  blockedBy: string[];
  milestone?: string;
  event?: TaskTemplate["when"];
};

export type ExpenseStatus = "planned" | "booked" | "paid" | "cancelled";
export type Expense = {
  id: string;
  item: string;
  cat: BudgetCat;
  vendorId?: string;
  estimated: number;
  actual?: number;
  status: ExpenseStatus;
  notes?: string;
};

export type BudgetCat =
  | "venue"
  | "dress"
  | "jewellery"
  | "beauty"
  | "photo"
  | "video"
  | "decor"
  | "catering"
  | "entertainment"
  | "invitations"
  | "henna"
  | "milka"
  | "honeymoon"
  | "home"
  | "gifts"
  | "transport"
  | "misc";

export type Payment = {
  id: string;
  label: string;
  amount: number;
  due: string;
  paidOn?: string;
  paidAmount?: number;
  expenseId?: string;
  vendorId?: string;
  notes?: string;
};

export type VendorCat = "venue" | "photo" | "video" | "makeup" | "hair" | "dress" | "flowers" | "decor" | "catering" | "cake" | "entertainment" | "henna" | "transport" | "planner" | "other";
export type VendorStatus = "considering" | "contacted" | "quoted" | "shortlisted" | "booked" | "completed" | "cancelled";
export type Vendor = {
  id: string;
  name: string;
  cat: VendorCat;
  status: VendorStatus;
  contact?: string;
  phone?: string;
  instagram?: string;
  website?: string;
  quoted?: number;
  final?: number;
  deposit?: number;
  contractSigned?: boolean;
  bookedOn?: string;
  notes?: string;
};

export type Rsvp = "invited" | "sent" | "confirmed" | "declined" | "pending";
export type Guest = {
  id: string;
  name: string;
  family?: string;
  side: "bride" | "groom" | "both";
  phone?: string;
  adults: number;
  children: number;
  rsvp: Rsvp;
  tableId?: string;
  notes?: string;
};

export type SeatTable = { id: string; name: string; number: number; capacity: number };

export type ApptKind = "fitting" | "makeup" | "hair" | "salon" | "facial" | "venue" | "vendor" | "tasting" | "photo" | "henna" | "documents" | "beauty" | "other";
export type Appointment = {
  id: string;
  title: string;
  kind: ApptKind;
  date: string;
  time?: string;
  place?: string;
  vendorId?: string;
  notes?: string;
  done?: boolean;
};

/** Shopping-style lists share one shape. */
export type ListKey = "trousseau" | "home" | "closet" | "packing" | "sos" | "groom";
export type ItemStatus = "need" | "bought" | "gift" | "skip";
export type Item = {
  id: string;
  list: ListKey;
  name: string;
  cat: string;
  status: ItemStatus;
  qty?: number;
  budget?: number;
  price?: number;
  store?: string;
  size?: string;
  event?: string;
  image?: string;
  notes?: string;
};

export type Honeymoon = {
  destination?: string;
  from?: string;
  to?: string;
  passportExpiry?: string;
  visa?: "not_needed" | "needed" | "applied" | "approved";
  insurance?: boolean;
  currencyNote?: string;
  esim?: boolean;
  emergency?: string;
  notes?: string;
};
export type TravelBooking = { id: string; kind: "flight" | "hotel" | "transfer" | "activity" | "restaurant" | "other"; title: string; date?: string; ref?: string; notes?: string };

export type TimelineItem = { id: string; time: string; title: string; who?: string; notes?: string; done?: boolean };

export type MoodCat = "dress" | "makeup" | "hair" | "kosha" | "flowers" | "tables" | "invitation" | "cake" | "photo" | "henna" | "home" | "honeymoon";
export type MoodItem = { id: string; cat: MoodCat; image?: string; link?: string; note?: string; fav?: boolean; tone?: number };

export type DocCat = "contract" | "receipt" | "quote" | "marriage" | "passport" | "visa" | "flight" | "hotel" | "other";
export type DocRecord = { id: string; name: string; cat: DocCat; date?: string; notes?: string; holder?: string };

export type Workspace = {
  v: 1;
  profile: Profile | null;
  taskStates: Record<string, TaskState>;
  customTasks: CustomTask[];
  expenses: Expense[];
  categoryBudgets: Partial<Record<BudgetCat, number>>;
  payments: Payment[];
  vendors: Vendor[];
  guests: Guest[];
  tables: SeatTable[];
  appointments: Appointment[];
  items: Item[];
  honeymoon: Honeymoon;
  bookings: TravelBooking[];
  timeline: TimelineItem[];
  mood: MoodItem[];
  docs: DocRecord[];
  seenMilestones: string[];
  updatedAt?: string;
};

export function emptyWorkspace(): Workspace {
  return {
    v: 1,
    profile: null,
    taskStates: {},
    customTasks: [],
    expenses: [],
    categoryBudgets: {},
    payments: [],
    vendors: [],
    guests: [],
    tables: [],
    appointments: [],
    items: [],
    honeymoon: {},
    bookings: [],
    timeline: [],
    mood: [],
    docs: [],
    seenMilestones: [],
  };
}
