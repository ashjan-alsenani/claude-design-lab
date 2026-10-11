import { addDays } from "./engine";
import { applyOp } from "./reducer";
import { emptyPlan, sectionsFor, type Plan } from "./types";

/**
 * The public demo: a fictional mother ("أم سلمى" / "Salma's mum") 5 weeks before her expected date.
 * Built through the same reducer as real plans, so the demo behaves exactly like the product.
 * It is never saved, sends nothing and touches no customer data.
 */
export function demoPlan(today: string, lang: "ar" | "en"): Plan {
  const ar = lang === "ar";
  let p = applyOp(emptyPlan(), {
    t: "setup",
    lang,
    today,
    profile: {
      motherName: ar ? "أم سلمى" : "Salma's mum",
      babyName: ar ? "سلمى" : "Salma",
      dueDate: addDays(today, 35),
      firstTime: "yes",
      country: "OM",
      currency: "OMR",
      timeZone: "Asia/Muscat",
      budgetMinor: 900_000,
      preset: "full",
      sections: sectionsFor("full"),
      receptionKinds: ["hospital", "home"],
      theme: "cloud",
      babyGender: "girl",
      nurseryKind: "corner",
      createdAt: `${today}T08:00:00.000Z`,
    },
  });
  // A realistic mix: some items ready, some ordered, some still to do.
  p.items = p.items.map((it, i) => (i % 3 === 0 ? { ...it, status: "have", qtyHave: it.qtyNeeded } : i % 5 === 1 ? { ...it, status: "ordered" } : it));
  p.bag = p.bag.map((b, i) => (i < 5 ? { ...b, provided: true, packed: i < 3 } : b));
  p.tasks = p.tasks.map((t, i) => (i === 0 ? { ...t, status: "done" } : { ...t, due: addDays(today, 2 + i * 3) }));
  p.budget = { baby: 350_000, nursery: 200_000, reception: 150_000, hospitality: 60_000, favors: 90_000, mother: 50_000 };

  const ev = p.events[1] ?? p.events[0];
  if (ev) {
    ev.date = addDays(today, 50);
    ev.time = "17:00";
    ev.expected = 25;
    ev.place = ar ? "البيت" : "Home";
    ev.checks[0] = { ...ev.checks[0], done: true };
  }
  p.vendors = [{ id: "vn-sweet", name: ar ? "حلويات الندى" : "Al Nada Sweets", kind: ar ? "توزيعات" : "Favors" }];
  p.orders = [
    { id: "or-stroller", title: ar ? "عربة وكرسي سيارة" : "Stroller and car seat", cat: "baby", orderDate: addDays(today, -6), deliveryDate: addDays(today, 4), amountMinor: 185_000, status: "shipped" },
    { id: "or-favors", title: ar ? "توزيعات الاستقبال" : "Welcome favors", cat: "favors", vendorId: "vn-sweet", deliveryDate: addDays(today, 40), amountMinor: 66_000, status: "ordered", eventId: ev?.id },
  ];
  p.payments = [
    { id: "pa-1", orderId: "or-stroller", label: ar ? "دفع كامل" : "Paid in full", amountMinor: 185_000, paidOn: addDays(today, -6) },
    { id: "pa-2", orderId: "or-favors", label: ar ? "العربون" : "Deposit", amountMinor: 20_000, paidOn: addDays(today, -2) },
    { id: "pa-3", orderId: "or-favors", label: ar ? "المبلغ المتبقي" : "Balance", amountMinor: 46_000, due: addDays(today, 40) },
  ];
  p.favors = [
    {
      id: "fv-1", eventId: ev?.id, type: ar ? "علب شوكولاتة باسم البيبي" : "Chocolate boxes with the baby's name", vendor: ar ? "حلويات الندى" : "Al Nada Sweets",
      printedText: ar ? "أهلًا بسلمى 🤍" : "Welcome Salma 🤍", babyName: ar ? "سلمى" : "Salma", qtyBase: 50, qtyExtra: 5, unitMinor: 1_200, feesMinor: 0, depositMinor: 20_000,
      sampleApprovedOn: addDays(today, -1), deliveryDate: addDays(today, 40), status: "approved", qtyReceived: 0, qtyGiven: 0, orderId: "or-favors",
    },
  ];
  p.items = p.items.map((it) => (it.cat === "outing" && it.priority === "essential" ? { ...it, status: "ordered", orderId: "or-stroller" } : it));
  p.gifts = [
    { id: "gf-1", name: ar ? "جهاز مراقبة البيبي" : "Baby monitor", qtyNeeded: 1, priority: "optional", priceMinor: 45_000, publicNote: ar ? "أي لون" : "Any colour" },
    { id: "gf-2", name: ar ? "أطقم بودي مقاس ٠–٣ أشهر" : "Bodysuits, 0–3 months", qtyNeeded: 4, priority: "essential", priceMinor: 6_000, spec: ar ? "قطن" : "Cotton" },
    { id: "gf-3", name: ar ? "كرسي هزاز" : "Baby bouncer", qtyNeeded: 1, priority: "later", priceMinor: 38_000 },
  ];
  p.visits = [
    { id: "vs-1", name: ar ? "خالة مريم وبناتها" : "Aunt Maryam and daughters", group: "family", people: 3, confirmed: { date: addDays(today, 38), time: "17:00" }, status: "confirmed" },
    { id: "vs-2", name: ar ? "صديقات الدوام" : "Friends from work", group: "colleagues", people: 4, proposed: { date: addDays(today, 39), time: "18:00" }, status: "requested", requestId: "demo-req" },
  ];
  p.received = [{ id: "rc-1", from: ar ? "جدة سلمى" : "Salma's grandma", kind: "gold", desc: ar ? "سوار صغير" : "A small bracelet", date: today, thanked: false }];
  p.helpRows = p.helpRows.map((h, i) => ({ ...h, owner: i % 2 ? (ar ? "أمي" : "Mum") : ar ? "زوجي" : "My husband" }));
  p.appointments = [{ id: "ap-1", title: ar ? "موعد المتابعة" : "Check-up appointment", kind: "medical", date: addDays(today, 6), time: "10:30" }];
  p.memories = [{ id: "mm-1", title: ar ? "أول غرض اشتريناه" : "The first thing we bought", date: addDays(today, -20), text: ar ? "طقم أبيض صغير، ما قدرنا نقاومه." : "A tiny white outfit we couldn't resist.", order: 0 }];
  p.hospitality = p.hospitality.map((h) => ({ ...h, unitPriceMinor: h.kind === "coffee" ? 1_500 : h.kind === "dates" ? 4_000 : 150 }));
  return p;
}

/** Fictional public-side activity for the demo (never from a database). */
export const demoReservations = (lang: "ar" | "en") => ({
  "gf-2": { reserved: 2, purchased: 1, names: [lang === "ar" ? "مريم" : "Maryam", lang === "ar" ? "(اختارت إخفاء الاسم)" : "(chose to stay anonymous)"] },
  "gf-1": { reserved: 0, purchased: 0, names: [] as string[] },
});
