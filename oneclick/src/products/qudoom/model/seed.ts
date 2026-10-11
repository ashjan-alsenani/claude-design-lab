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
  custom: [["other", { ar: "أول خطوة", en: "First step" }]],
};
export const receptionNames: Record<ReceptionKind, L> = {
  hospital: { ar: "استقبال المستشفى", en: "Hospital welcome" },
  home: { ar: "استقبال البيت", en: "Home welcome" },
  family: { ar: "تجمع العائلة", en: "Family gathering" },
  aqiqah: { ar: "العقيقة", en: "Aqiqah" },
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
export function seedHospitality(lang: Lang, eventId?: string): HospItem[] {
  const src = eventId ? { eventId } : { manual: 10 };
  return [
    { id: sid("hs"), name: lang === "ar" ? "قهوة عربية" : "Arabic coffee", kind: "coffee", unit: "thermos", perGuest: 2, servingsPerUnit: 12, reservePct: 15, source: src },
    { id: sid("hs"), name: lang === "ar" ? "تمر" : "Dates", kind: "dates", unit: "kg", perGuest: 3, servingsPerUnit: 60, reservePct: 10, source: src },
    { id: sid("hs"), name: lang === "ar" ? "ماء" : "Water", kind: "water", unit: "bottle", perGuest: 1, servingsPerUnit: 1, reservePct: 20, source: src },
  ];
}
