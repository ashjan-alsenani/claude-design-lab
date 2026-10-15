import type { BagId, BagItem, EventArea, EventCheck, HelpKind, HelpRow, HospItem, Item, ItemArea, ItemCat, Priority, ReceptionEvent, ReceptionKind, Task } from "./types";

/**
 * Starter lists. They are organizing suggestions the mother edits freely, not medical advice and not
 * an assumption that every family needs every item. Feeding items stay neutral (she picks what fits).
 * Seeded once, in the language she sets up in; switching language later never rewrites her data.
 */
type L = { ar: string; en: string };
type Lang = "ar" | "en";
const tx = (l: L, lang: Lang) => l[lang];

const babyList: [ItemCat, Priority, number, L][] = [
  ["clothes", "essential", 6, { ar: "أطقم نوم قطنية (بودي)", en: "Cotton bodysuits" }],
  ["clothes", "essential", 4, { ar: "بيجامات بسحاب أو أزرار", en: "Sleepsuits" }],
  ["clothes", "optional", 2, { ar: "طقم خروج المستشفى", en: "Going-home outfit" }],
  ["clothes", "optional", 4, { ar: "جوارب وقفازات خفيفة", en: "Socks and light mittens" }],
  ["clothes", "optional", 2, { ar: "طاقية قطن", en: "Cotton hat" }],
  ["sleep", "essential", 1, { ar: "سرير أو مهد", en: "Crib or bassinet" }],
  ["sleep", "essential", 2, { ar: "شراشف مطاطية بمقاس المرتبة", en: "Fitted sheets for the mattress" }],
  ["sleep", "optional", 2, { ar: "كيس نوم مناسب للعمر", en: "Age-appropriate sleep sack" }],
  ["diaper", "essential", 1, { ar: "حفاضات مقاس حديث الولادة", en: "Newborn diapers" }],
  ["diaper", "essential", 1, { ar: "مناديل مبللة أو قطن وماء", en: "Wipes or cotton and water" }],
  ["diaper", "optional", 1, { ar: "مفرش تغيير", en: "Changing mat" }],
  ["diaper", "optional", 1, { ar: "كريم للحفاض", en: "Diaper cream" }],
  ["bath", "essential", 2, { ar: "مناشف بغطاء رأس", en: "Hooded towels" }],
  ["bath", "optional", 1, { ar: "حوض استحمام", en: "Baby bath" }],
  ["bath", "optional", 1, { ar: "مقص أظافر للأطفال", en: "Baby nail clippers" }],
  ["outing", "essential", 1, { ar: "كرسي سيارة", en: "Car seat" }],
  ["outing", "optional", 1, { ar: "عربة", en: "Stroller" }],
  ["outing", "optional", 1, { ar: "شنطة أغراض البيبي", en: "Diaper bag" }],
  ["feeding", "optional", 1, { ar: "مستلزمات الرضاعة حسب اختيارك", en: "Feeding supplies of your choice" }],
  ["feeding", "optional", 4, { ar: "مرايل ومناديل قماش", en: "Bibs and burp cloths" }],
  ["storage", "optional", 1, { ar: "منظم أدراج للملابس", en: "Drawer organizers" }],
  ["storage", "later", 1, { ar: "سلة للأغراض اليومية", en: "Basket for daily things" }],
  ["extra", "later", 1, { ar: "ألبوم أو صندوق ذكريات", en: "Memory box or album" }],
];
const nurseryList: [ItemCat, Priority, number, L][] = [
  ["furniture", "essential", 1, { ar: "مكان نوم آمن للبيبي", en: "A safe sleep space" }],
  ["furniture", "optional", 1, { ar: "كرسي مريح للأم", en: "Comfortable chair for you" }],
  ["furniture", "optional", 1, { ar: "دولاب أو أدراج", en: "Wardrobe or drawers" }],
  ["nurseryTextile", "optional", 1, { ar: "ستائر تعتيم", en: "Blackout curtains" }],
  ["decor", "later", 1, { ar: "لوحة بالاسم", en: "Name sign" }],
  ["decor", "optional", 1, { ar: "إضاءة ليلية خافتة", en: "Soft night light" }],
];
const motherList: [ItemCat, Priority, number, L][] = [
  ["personal", "essential", 2, { ar: "ملابس مريحة سهلة الفتح", en: "Comfortable, easy-open clothes" }],
  ["personal", "optional", 1, { ar: "شبشب مريح", en: "Comfortable slippers" }],
  ["comfort", "optional", 1, { ar: "مخدة مريحة للجلوس", en: "Supportive cushion" }],
  ["comfort", "optional", 1, { ar: "قارورة ماء كبيرة", en: "Large water bottle" }],
  ["personal", "later", 1, { ar: "أغراض العناية الشخصية", en: "Personal care things" }],
];

const bagList: [BagId, number, L][] = [
  ["mother", 2, { ar: "ملابس نوم مريحة", en: "Comfortable nightwear" }],
  ["mother", 1, { ar: "شبشب", en: "Slippers" }],
  ["mother", 1, { ar: "أغراض العناية الشخصية", en: "Toiletries" }],
  ["mother", 1, { ar: "شاحن الجوال وكيبل طويل", en: "Phone charger with a long cable" }],
  ["mother", 1, { ar: "طقم خروج مريح", en: "Comfortable going-home outfit" }],
  ["baby", 3, { ar: "أطقم بودي", en: "Bodysuits" }],
  ["baby", 1, { ar: "طقم الخروج", en: "Going-home outfit" }],
  ["baby", 1, { ar: "بطانية خفيفة", en: "Light blanket" }],
  ["baby", 1, { ar: "حفاضات حديث الولادة", en: "Newborn diapers" }],
  ["baby", 1, { ar: "كرسي السيارة (في السيارة)", en: "Car seat (in the car)" }],
  ["companion", 1, { ar: "ملابس بديلة", en: "Change of clothes" }],
  ["companion", 1, { ar: "أكل خفيف وماء", en: "Snacks and water" }],
  ["docs", 1, { ar: "الهوية / الجواز", en: "ID / passport" }],
  ["docs", 1, { ar: "بطاقة التأمين إن وجدت", en: "Insurance card, if any" }],
  ["docs", 1, { ar: "ملف المتابعة", en: "Your follow-up file" }],
];

const taskList: [Task["area"], L][] = [
  ["general", { ar: "اختاري أهم التجهيزات وابدئي فيها", en: "Pick the essentials and start with them" }],
  ["nursery", { ar: "حددي مكان نوم البيبي ونظّفيه", en: "Choose and clean the baby's sleep space" }],
  ["nursery", { ar: "اغسلي ملابس البيبي ورتبيها", en: "Wash and fold the baby's clothes" }],
  ["mother", { ar: "رتّبي من يساعدك في أول الأيام", en: "Arrange who helps you in the first days" }],
  ["general", { ar: "ركّبي كرسي السيارة وجربيه", en: "Install and try the car seat" }],
];

const helpList: [HelpKind, number, L][] = [
  ["meals", 1, { ar: "تجهيز وجبة الغداء", en: "Prepare lunch" }],
  ["home", 2, { ar: "ترتيب البيت والغسيل", en: "Tidy up and laundry" }],
  ["family", 3, { ar: "زيارة أمي للمساعدة", en: "Mum visits to help" }],
  ["meals", 4, { ar: "تجهيز وجبات للفريزر", en: "Batch meals for the freezer" }],
];

const eventChecks: Record<ReceptionKind, [EventArea, L][]> = {
  hospital: [["decor", { ar: "زينة بسيطة للغرفة", en: "Simple room decor" }], ["sweets", { ar: "شوكولاتة أو حلويات للزوار", en: "Chocolate or sweets for visitors" }], ["favors", { ar: "توزيعات صغيرة", en: "Small favors" }]],
  home: [["decor", { ar: "ترتيب ركن الاستقبال", en: "Set up the welcome corner" }], ["nameboard", { ar: "لوحة اسم البيبي", en: "Baby name sign" }], ["hospitality", { ar: "القهوة والتمر", en: "Coffee and dates" }], ["flowers", { ar: "ورد", en: "Flowers" }]],
  family: [["hospitality", { ar: "الضيافة", en: "Hospitality" }], ["sweets", { ar: "الحلويات", en: "Sweets" }], ["photo", { ar: "تصوير العائلة", en: "Family photos" }]],
  aqiqah: [["hospitality", { ar: "ترتيب الوليمة", en: "Arrange the meal" }], ["favors", { ar: "التوزيعات", en: "Favors" }], ["decor", { ar: "تجهيز المكان", en: "Prepare the place" }]],
  shower: [["decor", { ar: "ديكور الشاور (اختاري فكرة من أشكال الاستقبال)", en: "Shower decor (pick an idea from Welcome looks)" }], ["sweets", { ar: "كيك وطاولة حلويات", en: "Cake and sweets table" }], ["other", { ar: "ألعاب للضيفات (تخمين الوزن، رسائل للبيبي)", en: "Guest games (guess the weight, letters to baby)" }], ["photo", { ar: "ركن تصوير", en: "Photo corner" }], ["other", { ar: "إرسال الدعوات للضيفات", en: "Send the invitations" }]],
  reveal: [["other", { ar: "طريقة الكشف (بالونة، كيك، ظرف…)", en: "How to reveal (balloon, cake, envelope…)" }], ["other", { ar: "ظرف مختوم بالجواب من الطبيبة", en: "Sealed answer envelope from the doctor" }], ["decor", { ar: "ديكور بلونين", en: "Two-colour decor" }], ["other", { ar: "تصويت الضيوف ولد ولا بنت", en: "Guests vote boy or girl" }], ["photo", { ar: "تصوير لحظة الكشف بالفيديو", en: "Film the reveal moment" }]],
  custom: [["other", { ar: "أول خطوة", en: "First step" }]],
};
export const receptionNames: Record<ReceptionKind, L> = {
  hospital: { ar: "استقبال المستشفى", en: "Hospital welcome" },
  home: { ar: "استقبال البيت", en: "Home welcome" },
  family: { ar: "تجمع العائلة", en: "Family gathering" },
  aqiqah: { ar: "العقيقة", en: "Aqiqah" },
  shower: { ar: "بيبي شاور", en: "Baby shower" },
  reveal: { ar: "حفلة كشف الجنس", en: "Gender reveal" },
  custom: { ar: "مناسبة خاصة", en: "Our own occasion" },
};

let n = 0;
const sid = (p: string) => `${p}-${(n++).toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function seedItems(lang: Lang, areas: ItemArea[]): Item[] {
  const out: Item[] = [];
  const add = (area: ItemArea, list: [ItemCat, Priority, number, L][]) =>
    list.forEach(([cat, priority, qty, name]) => out.push({ id: sid("it"), area, name: tx(name, lang), cat, qtyNeeded: qty, qtyHave: 0, priority, status: "todo" }));
  if (areas.includes("baby")) add("baby", babyList);
  if (areas.includes("nursery")) add("nursery", nurseryList);
  if (areas.includes("mother")) add("mother", motherList);
  return out;
}
export const seedBag = (lang: Lang): BagItem[] => bagList.map(([bag, qty, name]) => ({ id: sid("bg"), bag, name: tx(name, lang), qty, provided: false, packed: false }));
export const seedTasks = (lang: Lang): Task[] => taskList.map(([area, title]) => ({ id: sid("tk"), title: tx(title, lang), area, status: "todo" }));
export const seedHelp = (lang: Lang): HelpRow[] => helpList.map(([kind, day, title]) => ({ id: sid("hp"), title: tx(title, lang), kind, day, status: "todo" }));
export function seedEvent(kind: ReceptionKind, lang: Lang): ReceptionEvent {
  const checks: EventCheck[] = eventChecks[kind].map(([area, title]) => ({ id: sid("ck"), area, title: tx(title, lang), done: false }));
  return { id: sid("ev"), kind, name: tx(receptionNames[kind], lang), checks };
}
/** Everything a Gulf welcome usually needs, ready so she only removes what she won't serve. */
export type HospGroup = "drinks" | "sweets" | "savory" | "meal" | "supplies";
export const hospCatalog: { group: HospGroup; ar: string; en: string; kind: HospItem["kind"]; unit: HospItem["unit"]; perGuest: number; servingsPerUnit: number; reservePct: number }[] = [
  { group: "drinks", ar: "قهوة عربية", en: "Arabic coffee", kind: "coffee", unit: "thermos", perGuest: 2, servingsPerUnit: 12, reservePct: 15 },
  { group: "drinks", ar: "شاي أحمر", en: "Black tea", kind: "tea", unit: "thermos", perGuest: 1, servingsPerUnit: 10, reservePct: 15 },
  { group: "drinks", ar: "شاي كرك", en: "Karak tea", kind: "tea", unit: "thermos", perGuest: 1, servingsPerUnit: 10, reservePct: 15 },
  { group: "drinks", ar: "حليب بالزعفران والهيل", en: "Saffron-cardamom milk", kind: "tea", unit: "thermos", perGuest: 0.5, servingsPerUnit: 10, reservePct: 10 },
  { group: "drinks", ar: "ماء", en: "Water", kind: "water", unit: "bottle", perGuest: 1, servingsPerUnit: 1, reservePct: 20 },
  { group: "drinks", ar: "عصير برتقال", en: "Orange juice", kind: "juice", unit: "bottle", perGuest: 0.5, servingsPerUnit: 4, reservePct: 10 },
  { group: "drinks", ar: "ليمون بالنعناع", en: "Mint lemonade", kind: "juice", unit: "bottle", perGuest: 0.5, servingsPerUnit: 4, reservePct: 10 },
  { group: "drinks", ar: "لبن بارد", en: "Cold laban", kind: "juice", unit: "bottle", perGuest: 0.3, servingsPerUnit: 1, reservePct: 10 },
  { group: "sweets", ar: "تمر", en: "Dates", kind: "dates", unit: "kg", perGuest: 3, servingsPerUnit: 60, reservePct: 10 },
  { group: "sweets", ar: "تمر محشي", en: "Stuffed dates", kind: "dates", unit: "box", perGuest: 2, servingsPerUnit: 20, reservePct: 10 },
  { group: "sweets", ar: "شوكولاتة", en: "Chocolates", kind: "chocolate", unit: "box", perGuest: 2, servingsPerUnit: 30, reservePct: 10 },
  { group: "sweets", ar: "معمول", en: "Maamoul", kind: "sweets", unit: "box", perGuest: 2, servingsPerUnit: 24, reservePct: 10 },
  { group: "sweets", ar: "كيك الاستقبال", en: "Welcome cake", kind: "sweets", unit: "piece", perGuest: 1, servingsPerUnit: 20, reservePct: 10 },
  { group: "sweets", ar: "كب كيك", en: "Cupcakes", kind: "sweets", unit: "piece", perGuest: 1, servingsPerUnit: 1, reservePct: 10 },
  { group: "sweets", ar: "لقيمات", en: "Luqaimat", kind: "sweets", unit: "tray", perGuest: 4, servingsPerUnit: 60, reservePct: 10 },
  { group: "sweets", ar: "بسبوسة أو كنافة", en: "Basbousa or kunafa", kind: "sweets", unit: "tray", perGuest: 1, servingsPerUnit: 24, reservePct: 10 },
  { group: "sweets", ar: "حلوى خليجية", en: "Gulf halwa", kind: "sweets", unit: "box", perGuest: 1, servingsPerUnit: 20, reservePct: 10 },
  { group: "sweets", ar: "فواكه مقطعة", en: "Cut fruit", kind: "sweets", unit: "tray", perGuest: 1, servingsPerUnit: 20, reservePct: 10 },
  { group: "savory", ar: "مكسرات", en: "Mixed nuts", kind: "savory", unit: "kg", perGuest: 1, servingsPerUnit: 30, reservePct: 10 },
  { group: "savory", ar: "معجنات زعتر وجبن", en: "Za'atar and cheese pastries", kind: "savory", unit: "tray", perGuest: 2, servingsPerUnit: 30, reservePct: 10 },
  { group: "savory", ar: "سمبوسة", en: "Sambousa", kind: "savory", unit: "tray", perGuest: 2, servingsPerUnit: 40, reservePct: 10 },
  { group: "savory", ar: "ساندويتشات ميني", en: "Mini sandwiches", kind: "savory", unit: "tray", perGuest: 2, servingsPerUnit: 30, reservePct: 10 },
  { group: "meal", ar: "عشاء الضيوف (مندي أو مجبوس)", en: "Guests' dinner (mandi or machboos)", kind: "meal", unit: "tray", perGuest: 1, servingsPerUnit: 6, reservePct: 10 },
  { group: "meal", ar: "سلطة", en: "Salad", kind: "meal", unit: "plate", perGuest: 1, servingsPerUnit: 8, reservePct: 10 },
  { group: "supplies", ar: "فناجين قهوة ورقية", en: "Paper coffee cups", kind: "custom", unit: "pack", perGuest: 3, servingsPerUnit: 50, reservePct: 20 },
  { group: "supplies", ar: "أكواب عصير وماء", en: "Juice and water cups", kind: "custom", unit: "pack", perGuest: 2, servingsPerUnit: 50, reservePct: 20 },
  { group: "supplies", ar: "صحون صغيرة", en: "Small plates", kind: "custom", unit: "pack", perGuest: 2, servingsPerUnit: 50, reservePct: 20 },
  { group: "supplies", ar: "ملاعق وشوك", en: "Spoons and forks", kind: "custom", unit: "pack", perGuest: 2, servingsPerUnit: 50, reservePct: 20 },
  { group: "supplies", ar: "مناديل", en: "Napkins", kind: "custom", unit: "pack", perGuest: 3, servingsPerUnit: 100, reservePct: 20 },
  { group: "supplies", ar: "مناديل مبللة", en: "Wet wipes", kind: "custom", unit: "pack", perGuest: 1, servingsPerUnit: 80, reservePct: 20 },
  { group: "supplies", ar: "ثلج", en: "Ice", kind: "custom", unit: "pack", perGuest: 0.1, servingsPerUnit: 1, reservePct: 20 },
  { group: "supplies", ar: "بخور وفحم", en: "Bakhoor and charcoal", kind: "custom", unit: "box", perGuest: 0.05, servingsPerUnit: 1, reservePct: 0 },
];
export const hospGroupOf = (name: string): HospGroup | undefined => hospCatalog.find((c) => c.ar === name || c.en === name)?.group;
export function hospFromCatalog(c: (typeof hospCatalog)[number], lang: Lang, source: HospItem["source"]): HospItem {
  return { id: sid("hs"), name: lang === "ar" ? c.ar : c.en, kind: c.kind, unit: c.unit, perGuest: c.perGuest, servingsPerUnit: c.servingsPerUnit, reservePct: c.reservePct, source };
}
export function seedHospitality(lang: Lang, eventId?: string): HospItem[] {
  const src = eventId ? { eventId } : { manual: 10 };
  return hospCatalog.map((c) => hospFromCatalog(c, lang, src));
}
