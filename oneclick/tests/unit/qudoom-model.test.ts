import { describe, expect, it } from "vitest";
import { applyOp } from "@/products/qudoom/model/reducer";
import { demoPlan } from "@/products/qudoom/model/demo";
import { budget, calendar, hospQty, ics, parseMoney, progress, slotsOn, todayIn, bagProgress, manualLoad } from "@/products/qudoom/model/engine";
import { opSchema, MAX_DOC_BYTES } from "@/products/qudoom/model/schema";
import { defaultVisitSettings, emptyPlan, sectionsFor, type Plan } from "@/products/qudoom/model/types";

const today = "2026-10-12";
const setup = (sections = sectionsFor("full")): Plan =>
  applyOp(emptyPlan(), {
    t: "setup", lang: "ar", today,
    profile: { motherName: "أم راشد", country: "OM", currency: "OMR", timeZone: "Asia/Muscat", preset: "full", sections, receptionKinds: ["home"], theme: "cloud", nurseryKind: "room", createdAt: today },
  });

describe("progress", () => {
  it("is completed ÷ counted, ignoring skipped items and switched-off sections", () => {
    let p = setup();
    const before = progress(p);
    expect(before.done).toBe(0);
    const first = p.items[0];
    p = applyOp(p, { t: "put", c: "items", item: { ...first, status: "received" } });
    p = applyOp(p, { t: "put", c: "items", item: { ...p.items[1], status: "skip" } });
    const after = progress(p);
    expect(after.done).toBe(1);
    expect(after.total).toBe(before.total - 1);
    // Turning the bag off removes its items from the count.
    p = applyOp(p, { t: "profile", patch: { sections: { ...p.profile!.sections, bag: false } } });
    expect(progress(p).total).toBe(after.total - p.bag.length);
  });
  it("counts a bag item only when packed, not when merely provided", () => {
    let p = setup();
    p = applyOp(p, { t: "put", c: "bag", item: { ...p.bag[0], provided: true } });
    expect(bagProgress(p).packed).toBe(0);
    expect(bagProgress(p).provided).toBe(1);
    p = applyOp(p, { t: "put", c: "bag", item: { ...p.bag[0], provided: true, packed: true } });
    expect(bagProgress(p).packed).toBe(1);
  });
});

describe("budget", () => {
  it("never counts an item twice when it is part of an order", () => {
    let p = setup();
    p = applyOp(p, { t: "put", c: "orders", item: { id: "o1", title: "Stroller", cat: "baby", amountMinor: 100_000, status: "ordered" } });
    p = applyOp(p, { t: "put", c: "items", item: { ...p.items[0], actualMinor: 100_000, orderId: "o1" } });
    expect(budget(p).committed).toBe(100_000);
  });
  it("keeps 'still to pay' separate from 'left to spend'", () => {
    let p = setup();
    p = applyOp(p, { t: "budget", cat: "baby", amountMinor: 300_000 });
    p = applyOp(p, { t: "put", c: "orders", item: { id: "o1", title: "Crib", cat: "baby", amountMinor: 120_000, status: "ordered" } });
    p = applyOp(p, { t: "put", c: "payments", item: { id: "p1", orderId: "o1", label: "Deposit", amountMinor: 20_000, paidOn: today } });
    const b = budget(p);
    expect(b.paid).toBe(20_000);
    expect(b.toPay).toBe(100_000);
    expect(b.left).toBe(180_000);
  });
  it("counts a favor through its order only", () => {
    const p = demoPlan(today, "ar");
    const fav = budget(p).rows.find((r) => r.cat === "favors")!;
    expect(fav.committed).toBe(66_000); // the order, not order + favor total
    expect(fav.paid).toBe(20_000); // the deposit payment, not deposit twice
  });
  it("ignores payments of cancelled orders", () => {
    let p = setup();
    p = applyOp(p, { t: "put", c: "orders", item: { id: "o1", title: "X", cat: "other", amountMinor: 5_000, status: "cancelled" } });
    p = applyOp(p, { t: "put", c: "payments", item: { id: "p1", orderId: "o1", label: "x", amountMinor: 5_000, paidOn: today } });
    expect(budget(p).paid).toBe(0);
    expect(budget(p).committed).toBe(0);
  });
});

describe("money input", () => {
  it("parses Arabic digits and respects currency precision", () => {
    expect(parseMoney("١٢٫٥", "OMR")).toBe(12_500);
    expect(parseMoney("12.345", "OMR")).toBe(12_345);
    expect(parseMoney("12.345", "SAR")).toBeUndefined();
    expect(parseMoney("abc", "OMR")).toBeUndefined();
  });
});

describe("hospitality", () => {
  it("rounds up: guests × per guest × reserve ÷ servings per unit", () => {
    const h = { id: "h", name: "قهوة", kind: "coffee" as const, unit: "thermos" as const, perGuest: 2, servingsPerUnit: 12, reservePct: 15, source: { manual: 25 } };
    expect(hospQty(h, 25)).toBe(5); // 25×2×1.15 = 57.5 → 4.79 → 5
    expect(hospQty({ ...h, reservePct: 0 }, 24)).toBe(4); // exact multiple stays exact
  });
});

describe("visit slots", () => {
  it("honors closed dates, breaks and pause", () => {
    const s = { ...defaultVisitSettings(), breaks: [{ from: "17:00", to: "18:00" }] };
    const sunday = "2026-10-11";
    expect(slotsOn(sunday, s)).toEqual(["16:00", "18:00", "19:00"]);
    expect(slotsOn(sunday, { ...s, closedDates: [sunday] })).toEqual([]);
    expect(slotsOn(sunday, { ...s, paused: true })).toEqual([]);
    expect(slotsOn("2026-10-16", s)).toEqual([]); // Friday has no hours by default
  });
  it("counts the mother's own confirmed visits against capacity", () => {
    const p = demoPlan(today, "ar");
    const v = p.visits.find((x) => x.status === "confirmed")!;
    expect(manualLoad(p)[`${v.confirmed!.date}T${v.confirmed!.time}`]).toBe(v.people);
  });
});

describe("dates and calendar", () => {
  it("computes today in the mother's time zone", () => {
    expect(todayIn("Asia/Muscat", new Date("2026-10-11T21:30:00Z"))).toBe("2026-10-12");
    expect(todayIn("Asia/Riyadh", new Date("2026-10-11T21:30:00Z"))).toBe("2026-10-12");
    expect(todayIn("Europe/London", new Date("2026-10-11T21:30:00Z"))).toBe("2026-10-11");
  });
  it("exports date-only entries as all-day events (never shifted)", () => {
    const out = ics([{ id: "t:1", kind: "task", date: "2026-10-20", title: "Wash clothes, fold", ref: "1" }], "Asia/Muscat", "20261012T000000Z");
    expect(out).toContain("DTSTART;VALUE=DATE:20261020");
    expect(out).toContain("DTEND;VALUE=DATE:20261021");
    expect(out).toContain("SUMMARY:Wash clothes\\, fold");
  });
  it("lists the expected date until the baby arrives", () => {
    let p = demoPlan(today, "ar");
    expect(calendar(p, "ar").some((e) => e.kind === "due")).toBe(true);
    p = applyOp(p, { t: "arrived", on: true, date: today });
    expect(calendar(p, "ar").some((e) => e.kind === "due")).toBe(false);
  });
});

describe("validation", () => {
  it("rejects bad input before it touches the plan", () => {
    const p = setup();
    expect(() => applyOp(p, { t: "put", c: "items", item: { id: "x", name: "" } })).toThrow();
    expect(opSchema.safeParse({ t: "put", c: "nope", item: {} }).success).toBe(false);
    expect(opSchema.safeParse({ t: "budget", cat: "baby", amountMinor: -5 }).success).toBe(false);
    expect(() => applyOp(p, { t: "put", c: "gifts", item: { id: "g", name: "x", qtyNeeded: 1, priority: "essential", url: "javascript:alert(1)" } })).toThrow();
  });
  it("detaches links when a record is deleted", () => {
    let p = demoPlan(today, "ar");
    p = applyOp(p, { t: "del", c: "orders", id: "or-favors" });
    expect(p.favors[0].orderId).toBeUndefined();
    expect(p.payments.some((x) => x.orderId === "or-favors")).toBe(false);
  });
  it("demo plan is valid and small", () => {
    const p = demoPlan(today, "en");
    expect(JSON.stringify(p).length).toBeLessThan(MAX_DOC_BYTES);
    expect(p.profile?.babyName).toBe("Salma");
  });
});
