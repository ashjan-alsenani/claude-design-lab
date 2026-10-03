import { addDays, diffDays } from "./engine";
import { seedLists, seedTimeline } from "./seed";
import type { Guest, Item, Workspace } from "./types";

/**
 * Sample wedding for "Layan" (fictional). Dates are relative to today so the demo always
 * looks alive; the wedding is 15 June 2027 while that date is still ahead.
 */
export function demoWorkspace(today: string, lang: "en" | "ar"): Workspace {
  const n = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const wedding = diffDays(today, "2027-06-15") > 45 ? "2027-06-15" : addDays(today, 255);
  const rel = (d: number) => addDays(today, d);
  const before = (d: number) => addDays(wedding, -d);

  const done = ["ph-research", "ph-portfolios", "ph-style", "ph-package", "ph-female", "pn-research", "pn-quotes", "pn-portfolio", "lk-mua-research", "lk-mua-book", "dr-budget", "dr-inspo", "dr-research", "dr-consult", "dr-select", "dr-measure", "dr-deposit", "de-theme", "de-mood", "de-book", "ca-select", "pl-legal", "pl-contacts", "jw-plan", "jw-gold", "eg-date", "eg-outfit", "eg-hosting", "hm-plan", "hm-budget", "hy-destination", "gu-list", "gu-sides", "in-style"];
  const taskStates: Workspace["taskStates"] = Object.fromEntries(done.map((id) => [id, { status: "done" as const }]));
  taskStates["ve-deposit"] = { status: "doing", due: rel(5), notes: n("Second instalment of 1,250 OMR.", "الدفعة الثانية ١٬٢٥٠ ر.ع.") };
  taskStates["ph-book"] = { status: "doing", due: rel(6) };
  taskStates["in-design"] = { status: "waiting", due: rel(6), notes: n("Waiting for the designer's second draft.", "بانتظار المسودة الثانية من المصممة.") };

  const items: Item[] = seedLists(lang, { home: true, honeymoon: true, groom: false }).map((it, i) => {
    if (it.list === "trousseau" && i % 3 === 0) return { ...it, status: "bought", price: 45 + (i % 5) * 20, store: n("Avenues Mall", "أفنيوز مول") };
    if (it.list === "home" && i % 4 === 0) return { ...it, status: i % 8 === 0 ? "gift" : "bought", price: 120 + (i % 6) * 35 };
    if (it.list === "sos" && i < 6) return { ...it, status: "bought" };
    return it;
  });
  const closet: [string, string, string, string, number, number][] = [
    ["wedding", "Wedding gown, Atelier Reem", "فستان الزفاف من أتيليه ريم", "wedding", 2200, 0],
    ["milka", "Champagne milka dress", "فستان الملكة الشامبين", "milka", 480, 1],
    ["henna", "Green embroidered jalabiya", "جلابية الحناء الخضراء المطرزة", "henna", 260, 2],
    ["shoes", "Ivory satin heels", "كعب ساتان عاجي", "wedding", 140, 3],
    ["jewellery", "Pearl drop earrings", "أقراط لؤلؤ", "wedding", 95, 4],
    ["honeymoon", "Linen resort set", "طقم كتان للمنتجع", "honeymoon", 75, 5],
    ["bags", "Pearl clutch", "حقيبة سهرة لؤلؤية", "wedding", 120, 6],
    ["daily", "Soft beige abaya", "عباية بيج ناعمة", "daily", 90, 7],
  ];
  closet.forEach(([cat, en, ar, event, price, tone], i) =>
    items.push({ id: `closet-${i + 1}`, list: "closet", cat, name: n(en, ar), status: i < 6 ? "bought" : "need", price, event, notes: tone ? undefined : n("Final fitting two weeks before.", "البروفة الأخيرة قبل أسبوعين.") })
  );

  const guestNames: [string, string, string, string][] = [
    ["Al Harthy family", "عائلة الحارثي", "Al Harthy", "الحارثي"],
    ["Al Busaidi family", "عائلة البوسعيدي", "Al Busaidi", "البوسعيدي"],
    ["Al Lawati family", "عائلة اللواتي", "Al Lawati", "اللواتي"],
    ["Al Rawahi family", "عائلة الرواحي", "Al Rawahi", "الرواحي"],
    ["Al Balushi family", "عائلة البلوشي", "Al Balushi", "البلوشي"],
    ["Al Hinai family", "عائلة الهنائي", "Al Hinai", "الهنائي"],
    ["Al Maskari family", "عائلة المسكري", "Al Maskari", "المسكري"],
    ["Al Kindi family", "عائلة الكندي", "Al Kindi", "الكندي"],
    ["Al Zadjali family", "عائلة الزدجالي", "Al Zadjali", "الزدجالي"],
    ["Al Farsi family", "عائلة الفارسي", "Al Farsi", "الفارسي"],
  ];
  const firsts: [string, string][] = [["Aunt Muna", "الخالة منى"], ["Sara & daughters", "سارة وبناتها"], ["Grandmother Aisha", "الجدة عائشة"], ["Cousins", "بنات العم"], ["Neighbours", "الجيران"]];
  const rsvps: Guest["rsvp"][] = ["confirmed", "confirmed", "confirmed", "sent", "confirmed", "pending", "confirmed", "declined", "confirmed", "sent"];
  const guests: Guest[] = [];
  let gi = 0;
  for (const [fen, far, sen, sar] of guestNames) {
    for (const [ien, iar] of firsts.slice(0, 4)) {
      gi++;
      guests.push({ id: `g-${gi}`, name: n(`${ien} ${sen}`, `${iar} ${sar}`), family: n(fen, far), side: gi % 3 === 0 ? "groom" : "bride", adults: 3 + (gi % 4), children: gi % 3, rsvp: rsvps[gi % rsvps.length], phone: `+968 9${(1000000 + gi * 7919) % 9000000 + 1000000}`, tableId: gi <= 18 ? `t-${((gi - 1) % 6) + 1}` : undefined });
    }
  }
  const tables = Array.from({ length: 8 }, (_, i) => ({ id: `t-${i + 1}`, name: n(i < 2 ? "Family" : "Guests", i < 2 ? "العائلة" : "الضيوف"), number: i + 1, capacity: 12 }));

  return {
    v: 1,
    profile: {
      brideName: n("Layan", "ليان"),
      partnerName: n("Faisal", "فيصل"),
      weddingDate: wedding,
      country: n("Oman", "عُمان"),
      city: n("Muscat", "مسقط"),
      budget: 15000,
      currency: "OMR",
      guests: 250,
      events: ["engagement", "milka", "henna", "wedding", "sabahiya"],
      eventDates: { milka: before(60), henna: before(2), wedding, sabahiya: addDays(wedding, 1) },
      home: "yes",
      honeymoon: "yes",
      style: "classic",
      planning: "family",
      stage: 1,
      groomSection: false,
      calendarShowsTasks: true,
      planStart: rel(-60),
    },
    taskStates,
    customTasks: [
      { id: "c-shortlist", title: n("Confirm photographer shortlist", "تأكيد قائمة المصورات المرشحات"), cat: "photo", due: rel(2), priority: "high", status: "todo" },
      { id: "c-invite", title: n("Review invitation design with Mum", "مراجعة تصميم الدعوة مع الوالدة"), cat: "invitations", due: rel(6), priority: "normal", status: "todo" },
    ],
    vendors: [
      { id: "v-venue", name: n("Qasr Al Noor Ballroom", "قاعة قصر النور"), cat: "venue", status: "booked", contact: n("Ms. Huda", "أ. هدى"), phone: "+968 2400 1122", final: 4000, deposit: 1500, contractSigned: true, bookedOn: rel(-50) },
      { id: "v-photo1", name: n("Lumière Studio", "استوديو لوميير"), cat: "photo", status: "shortlisted", instagram: "@lumiere.studio", quoted: 950, notes: n("Female team, soft natural editing.", "فريق نسائي وتعديل طبيعي ناعم.") },
      { id: "v-photo2", name: n("Noor Lens", "عدسة نور"), cat: "photo", status: "quoted", instagram: "@noorlens", quoted: 850 },
      { id: "v-video", name: n("Reel Moments", "لحظات"), cat: "video", status: "contacted", instagram: "@reelmoments" },
      { id: "v-mua", name: n("Maha Beauty", "مها بيوتي"), cat: "makeup", status: "booked", instagram: "@maha.beauty", final: 500, deposit: 150, contractSigned: false, bookedOn: rel(-20) },
      { id: "v-hair", name: n("Silk Hair Studio", "سلك للشعر"), cat: "hair", status: "considering", instagram: "@silkhair" },
      { id: "v-dress", name: n("Atelier Reem", "أتيليه ريم"), cat: "dress", status: "booked", phone: "+968 9911 2200", final: 1800, deposit: 900, contractSigned: true, bookedOn: rel(-30) },
      { id: "v-flowers", name: n("Petal & Oud", "بتلة وعود"), cat: "flowers", status: "quoted", quoted: 700 },
      { id: "v-decor", name: n("Kosha by Hessa", "كوشة حصة"), cat: "decor", status: "booked", final: 2000, deposit: 700, contractSigned: true, bookedOn: rel(-25) },
      { id: "v-catering", name: n("Saffron Catering", "زعفران للضيافة"), cat: "catering", status: "booked", final: 2400, deposit: 600, contractSigned: true, bookedOn: rel(-15) },
      { id: "v-cake", name: n("Sugar Atelier", "أتيليه السكر"), cat: "cake", status: "considering" },
      { id: "v-zaffa", name: n("Al Wasl Zaffa Group", "فرقة الوصل للزفة"), cat: "entertainment", status: "contacted" },
      { id: "v-henna", name: n("Henna by Aisha", "حناء عائشة"), cat: "henna", status: "shortlisted", quoted: 180 },
    ],
    expenses: [
      { id: "e-venue", item: n("Wedding venue", "قاعة الزفاف"), cat: "venue", vendorId: "v-venue", estimated: 4000, actual: 4000, status: "booked" },
      { id: "e-dress", item: n("Wedding dress", "فستان الزفاف"), cat: "dress", vendorId: "v-dress", estimated: 2000, actual: 1800, status: "booked" },
      { id: "e-mua", item: n("Bridal makeup", "مكياج العروس"), cat: "beauty", vendorId: "v-mua", estimated: 500, actual: 500, status: "booked" },
      { id: "e-decor", item: n("Kosha and decoration", "الكوشة والديكور"), cat: "decor", vendorId: "v-decor", estimated: 2000, actual: 2000, status: "booked" },
      { id: "e-catering", item: n("Catering", "الضيافة"), cat: "catering", vendorId: "v-catering", estimated: 2400, actual: 2400, status: "booked" },
      { id: "e-gold", item: n("Gold set", "طقم الذهب"), cat: "jewellery", estimated: 1200, actual: 1200, status: "paid" },
      { id: "e-photo", item: n("Photography", "التصوير"), cat: "photo", estimated: 800, status: "planned" },
      { id: "e-honeymoon", item: n("Honeymoon", "شهر العسل"), cat: "honeymoon", estimated: 1100, status: "planned" },
      { id: "e-invites", item: n("Invitations", "الدعوات"), cat: "invitations", estimated: 150, status: "planned" },
      { id: "e-henna", item: n("Henna night", "ليلة الحناء"), cat: "henna", estimated: 350, status: "planned" },
    ],
    categoryBudgets: { venue: 4000, catering: 2400, dress: 1800, jewellery: 1200, beauty: 500, photo: 800, video: 200, decor: 2000, entertainment: 250, invitations: 150, henna: 350, milka: 250, honeymoon: 1100 },
    payments: [
      { id: "p-venue1", label: n("Venue deposit", "عربون القاعة"), amount: 1500, due: rel(-50), paidOn: rel(-50), expenseId: "e-venue", vendorId: "v-venue" },
      { id: "p-venue2", label: n("Wedding venue: second instalment", "القاعة: الدفعة الثانية"), amount: 1250, due: rel(5), expenseId: "e-venue", vendorId: "v-venue" },
      { id: "p-venue3", label: n("Wedding venue: final payment", "القاعة: الدفعة الأخيرة"), amount: 1250, due: before(14), expenseId: "e-venue", vendorId: "v-venue" },
      { id: "p-dress1", label: n("Dress deposit", "عربون الفستان"), amount: 900, due: rel(-30), paidOn: rel(-30), expenseId: "e-dress", vendorId: "v-dress" },
      { id: "p-dress2", label: n("Dress balance", "باقي مبلغ الفستان"), amount: 900, due: before(30), expenseId: "e-dress", vendorId: "v-dress" },
      { id: "p-mua1", label: n("Makeup artist deposit", "عربون خبيرة المكياج"), amount: 150, due: rel(-20), paidOn: rel(-20), expenseId: "e-mua", vendorId: "v-mua" },
      { id: "p-mua2", label: n("Makeup artist balance", "باقي مبلغ خبيرة المكياج"), amount: 350, due: before(3), expenseId: "e-mua", vendorId: "v-mua" },
      { id: "p-decor1", label: n("Decoration deposit", "عربون الديكور"), amount: 700, due: rel(-25), paidOn: rel(-25), expenseId: "e-decor", vendorId: "v-decor" },
      { id: "p-decor2", label: n("Decoration: second payment", "الديكور: الدفعة الثانية"), amount: 650, due: rel(40), expenseId: "e-decor", vendorId: "v-decor" },
      { id: "p-decor3", label: n("Decoration: final payment", "الديكور: الدفعة الأخيرة"), amount: 650, due: before(7), expenseId: "e-decor", vendorId: "v-decor" },
      { id: "p-cat1", label: n("Catering deposit", "عربون الضيافة"), amount: 600, due: rel(-15), paidOn: rel(-15), expenseId: "e-catering", vendorId: "v-catering" },
      { id: "p-cat2", label: n("Catering balance", "باقي مبلغ الضيافة"), amount: 1800, due: before(7), expenseId: "e-catering", vendorId: "v-catering" },
      { id: "p-gold", label: n("Gold set", "طقم الذهب"), amount: 1200, due: rel(-20), paidOn: rel(-20), expenseId: "e-gold" },
    ],
    guests,
    tables,
    appointments: [
      { id: "a-fit", title: n("Wedding dress fitting", "بروفة فستان الزفاف"), kind: "fitting", date: rel(4), time: "17:00", place: n("Atelier Reem, Al Khuwair", "أتيليه ريم، الخوير"), vendorId: "v-dress" },
      { id: "a-venue", title: n("Venue layout meeting", "اجتماع توزيع القاعة"), kind: "venue", date: rel(9), time: "11:00", vendorId: "v-venue" },
      { id: "a-mua", title: n("Makeup trial", "تجربة المكياج"), kind: "makeup", date: rel(12), time: "16:00", vendorId: "v-mua" },
      { id: "a-facial", title: n("Facial", "تنظيف البشرة"), kind: "facial", date: rel(16), time: "18:30" },
      { id: "a-tasting", title: n("Menu tasting", "تذوق قائمة الطعام"), kind: "tasting", date: rel(21), time: "19:00", vendorId: "v-catering" },
      { id: "a-henna", title: n("Meet the henna artist", "لقاء نقّاشة الحناء"), kind: "henna", date: rel(30), time: "17:30", vendorId: "v-henna" },
      { id: "a-docs", title: n("Documents appointment", "موعد الأوراق الرسمية"), kind: "documents", date: rel(45), time: "09:00" },
      { id: "a-visit", title: n("Venue visit with Mum", "زيارة القاعة مع الوالدة"), kind: "venue", date: rel(-10), time: "10:00", done: true },
    ],
    items,
    honeymoon: { destination: n("Maldives", "جزر المالديف"), from: addDays(wedding, 3), to: addDays(wedding, 10), passportExpiry: addDays(wedding, 120), visa: "not_needed", insurance: false, esim: true },
    bookings: [
      { id: "b-flight", kind: "flight", title: n("Muscat to Malé", "مسقط إلى ماليه"), date: addDays(wedding, 3), notes: n("Not booked yet: prices watched.", "لم يُحجز بعد: نتابع الأسعار.") },
      { id: "b-hotel", kind: "hotel", title: n("Overwater villa, 7 nights", "فيلا فوق الماء، ٧ ليالٍ"), date: addDays(wedding, 3), ref: "HX-20417" },
    ],
    timeline: seedTimeline(lang),
    mood: [
      ["dress", "Off-shoulder, soft lace sleeves", "أكتاف مكشوفة وأكمام دانتيل ناعمة", 0],
      ["kosha", "Ivory arch with white roses and soft lighting", "قوس عاجي بورود بيضاء وإضاءة ناعمة", 1],
      ["flowers", "Garden roses and baby's breath", "ورد جوري وزهرة الجبسوفيلا", 2],
      ["makeup", "Soft glam, warm nude lips", "مكياج ناعم وشفاه نود دافئة", 3],
      ["hair", "Low chignon with pearl pins", "شينيون منخفض بدبابيس لؤلؤ", 4],
      ["tables", "Champagne linens and candles", "مفارش شامبين وشموع", 5],
      ["cake", "Four tiers, sugar flowers", "أربعة أدوار بورود سكر", 6],
      ["invitation", "Deckle-edge card, gold foil Arabic calligraphy", "بطاقة بحواف طبيعية وخط عربي ذهبي", 7],
      ["henna", "Fine floral henna, fingertips dipped", "نقش ورود ناعم وأطراف مغموسة", 1],
      ["honeymoon", "Sunset dinner on the beach", "عشاء على الشاطئ وقت الغروب", 2],
    ].map(([cat, en, ar, tone], i) => ({ id: `m-${i + 1}`, cat: cat as Workspace["mood"][number]["cat"], note: n(en as string, ar as string), tone: tone as number, fav: i % 3 === 0 })),
    docs: [
      { id: "d-venue", name: n("Venue contract", "عقد القاعة"), cat: "contract", date: rel(-50), holder: n("Mum", "الوالدة") },
      { id: "d-dress", name: n("Dress receipt", "إيصال الفستان"), cat: "receipt", date: rel(-30) },
      { id: "d-decor", name: n("Decoration quotation", "عرض سعر الديكور"), cat: "quote", date: rel(-28) },
      { id: "d-catering", name: n("Catering contract", "عقد الضيافة"), cat: "contract", date: rel(-15) },
      { id: "d-passport", name: n("Passport copy", "نسخة الجواز"), cat: "passport", notes: n("Renewal needed before the honeymoon.", "يحتاج تجديد قبل شهر العسل.") },
      { id: "d-hotel", name: n("Hotel booking", "حجز الفندق"), cat: "hotel", date: rel(-5) },
    ],
    seenMilestones: ["ve-contract", "dr-select", "lk-mua-book"],
  };
}
