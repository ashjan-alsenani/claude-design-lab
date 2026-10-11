import { describe, expect, it } from "vitest";
import { demoPlan } from "@/products/qudoom/model/demo";
import { helperMayApply, helperMayTouch, isOpenSlot, openSlots, planForHelper, projection } from "@/products/qudoom/model/share";

const today = "2026-10-11";
const plan = demoPlan(today, "ar");

describe("public projection", () => {
  it("publishes only gift basics and visit hours: no notes, budget, guests or addresses", () => {
    const p = projection(plan)!;
    const json = JSON.stringify(p);
    for (const v of plan.visits) expect(json).not.toContain(v.name);
    for (const r of plan.received) expect(json).not.toContain(r.from);
    expect(json).not.toContain("budget");
    expect(json).not.toContain("dietNotes");
    expect(json).not.toContain("message");
    expect(p.gifts.every((g) => Object.keys(g).every((k) => ["id", "name", "qtyNeeded", "priority", "priceMinor", "spec", "url", "publicNote"].includes(k)))).toBe(true);
  });
  it("hides hidden gifts and pauses visits when the section is off", () => {
    const off = { ...plan, gifts: plan.gifts.map((g, i) => ({ ...g, hidden: i === 0 })), profile: { ...plan.profile!, sections: { ...plan.profile!.sections, visits: false } } };
    const p = projection(off)!;
    expect(p.gifts.find((g) => g.id === plan.gifts[0].id)).toBeUndefined();
    expect(p.visits.settings.paused).toBe(true);
    expect(openSlots(p, {})).toEqual([]);
  });
  it("offers only free future slots within capacity", () => {
    const p = projection(plan)!;
    const now = Date.parse("2026-10-11T08:00:00Z");
    const days = openSlots(p, {}, now);
    expect(days.length).toBeGreaterThan(0);
    const { date, times } = days[0];
    const full = { [`${date}T${times[0]}`]: p.visits.settings.maxPeople };
    expect(openSlots(p, full, now)[0].times).not.toContain(times[0]);
    expect(isOpenSlot(p, "2020-01-01", "17:00", now)).toBe(false);
  });
});

describe("helpers", () => {
  it("receive only their sections", () => {
    const v = planForHelper(plan, ["bag", "visits"]);
    expect(v.bag.length).toBe(plan.bag.length);
    expect(v.orders).toEqual([]);
    expect(v.payments).toEqual([]);
    expect(v.received).toEqual([]);
    expect(v.budget).toEqual({});
    expect(v.profile!.budgetMinor).toBeUndefined();
    expect(v.items).toEqual([]);
  });
  it("may change only what they were given, and never settings", () => {
    const put = { t: "put" as const, c: "bag" as const, item: { id: "x" } };
    expect(helperMayApply(put, ["bag"], true)).toBe(true);
    expect(helperMayApply(put, ["bag"], false)).toBe(false);
    expect(helperMayApply({ t: "put", c: "orders", item: {} }, ["bag"], true)).toBe(false);
    expect(helperMayApply({ t: "profile", patch: {} }, ["bag", "budget"], true)).toBe(false);
    expect(helperMayApply({ t: "reset" }, ["bag"], true)).toBe(false);
    expect(helperMayApply({ t: "put", c: "items", item: { area: "mother" } }, ["prep"], true)).toBe(false);
    expect(helperMayApply({ t: "put", c: "items", item: { area: "baby" } }, ["prep"], true)).toBe(true);
  });
  it("can't overwrite a record hidden from them", () => {
    const hidden = plan.items.find((i) => i.area !== "baby")!;
    expect(helperMayTouch(plan, { t: "put", c: "items", item: { ...hidden, area: "baby" } }, ["prep"])).toBe(false);
    expect(helperMayTouch(plan, { t: "del", c: "items", id: hidden.id }, ["prep"])).toBe(false);
  });
});

describe("ideas library", () => {
  it("every idea is distinct, in both languages", async () => {
    const { allIdeas } = await import("@/products/qudoom/model/all-ideas");
    expect(allIdeas.length).toBeGreaterThan(600);
    expect(new Set(allIdeas.map((x) => x.ar)).size).toBe(allIdeas.length);
    expect(new Set(allIdeas.map((x) => x.en)).size).toBe(allIdeas.length);
    expect(new Set(allIdeas.map((x) => x.id)).size).toBe(allIdeas.length);
  });
});
