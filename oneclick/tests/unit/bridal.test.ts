import { describe, expect, it } from "vitest";
import { addDays, alerts, budgetSummary, focusTasks, groupTasks, milestones, paymentStatus, progress, resolveTasks, scheduleOffset, search } from "@/products/bridal/model/engine";
import { demoWorkspace } from "@/products/bridal/model/demo";
import { applyOp } from "@/products/bridal/model/reducer";
import { opSchema } from "@/products/bridal/model/schema";
import { templates } from "@/products/bridal/model/templates";
import { emptyWorkspace, type Profile } from "@/products/bridal/model/types";

const today = "2026-10-03";
const profile = (o: Partial<Profile> = {}): Profile => ({
  brideName: "Sara", weddingDate: "2027-09-01", country: "Oman", city: "Muscat", budget: 12000, currency: "OMR", guests: 200,
  events: ["wedding", "henna"], eventDates: {}, home: "yes", honeymoon: "yes", style: "classic", planning: "self", stage: 0,
  groomSection: false, calendarShowsTasks: true, planStart: today, ...o,
});
const setup = (p: Profile) => applyOp(emptyWorkspace(), { t: "setup", profile: p, lang: "en" });

describe("bridal planning engine", () => {
  it("template ids are unique and dependencies exist", () => {
    const ids = new Set(templates.map((t) => t.id));
    expect(ids.size).toBe(templates.length);
    for (const t of templates) for (const d of t.deps ?? []) expect(ids.has(d), `${t.id} -> ${d}`).toBe(true);
    expect(templates.length).toBeGreaterThan(180);
  });

  it("only includes tasks for enabled events and plans", () => {
    const ws = setup(profile({ events: ["wedding"], home: "no", honeymoon: "no" }));
    const tasks = resolveTasks(ws, "en");
    expect(tasks.some((t) => t.cat === "henna")).toBe(false);
    expect(tasks.some((t) => t.cat === "home" || t.cat === "honeymoon")).toBe(false);
    expect(setup(profile()).items.some((i) => i.list === "home")).toBe(true);
  });

  it("10 months away: no honeymoon packing in focus; 7 days away: no venue research", () => {
    const far = resolveTasks(setup(profile({ weddingDate: addDays(today, 300) })), "en");
    const focusFar = focusTasks(far, today);
    expect(focusFar.length).toBeGreaterThanOrEqual(3);
    expect(focusFar.length).toBeLessThanOrEqual(6);
    expect(focusFar.some((t) => t.id === "hy-pack")).toBe(false);
    const near = resolveTasks(setup(profile({ weddingDate: addDays(today, 7), stage: 0 })), "en");
    const focusNear = focusTasks(near, today);
    expect(focusNear.some((t) => t.id === "ve-research")).toBe(false);
    expect(near.find((t) => t.id === "ve-research")!.status).toBe("done");
  });

  it("compresses a short timeline while keeping order and the last month", () => {
    expect(scheduleOffset(14, 120)).toBe(14);
    expect(scheduleOffset(365, 120)).toBeLessThan(120);
    expect(scheduleOffset(300, 120)).toBeLessThan(scheduleOffset(365, 120));
    const tasks = resolveTasks(setup(profile({ weddingDate: addDays(today, 120) })), "en");
    expect(tasks.filter((t) => t.status === "todo").every((t) => t.due >= today)).toBe(true);
  });

  it("dependencies block tasks until earlier steps are done", () => {
    let ws = setup(profile());
    const fit2 = () => resolveTasks(ws, "en").find((t) => t.id === "dr-fit2")!;
    expect(fit2().blockedBy).toContain("dr-fit1");
    ws = applyOp(ws, { t: "task", id: "dr-fit1", patch: { status: "done" } });
    expect(fit2().blockedBy).toEqual([]);
  });

  it("progress is weighted by priority, not raw counts", () => {
    let ws = setup(profile({ events: ["wedding"] }));
    const urgent = resolveTasks(ws, "en").find((t) => t.priority === "urgent" && t.status !== "done")!;
    const low = resolveTasks(ws, "en").find((t) => t.priority === "low" && t.status !== "done")!;
    const a = applyOp(ws, { t: "task", id: urgent.id, patch: { status: "done" } });
    const b = applyOp(ws, { t: "task", id: low.id, patch: { status: "done" } });
    expect(progress(a, resolveTasks(a, "en")).overall).toBeGreaterThan(progress(b, resolveTasks(b, "en")).overall);
    ws = applyOp(ws, { t: "task", id: low.id, patch: { status: "skip" } });
    expect(resolveTasks(ws, "en").find((t) => t.id === low.id)!.status).toBe("skip");
  });

  it("groups tasks into today / this week / coming soon / later", () => {
    const tasks = resolveTasks(setup(profile()), "en");
    const g = groupTasks(tasks, today);
    expect(g.later.length).toBeGreaterThan(g.week.length);
  });
});

describe("Layan demo, budget, alerts", () => {
  const ws = demoWorkspace(today, "en");
  const tasks = resolveTasks(ws, "en");
  it("is alive and personal", () => {
    expect(ws.profile!.weddingDate).toBe("2027-06-15");
    const p = progress(ws, tasks).overall;
    expect(p).toBeGreaterThan(0.2);
    expect(p).toBeLessThan(0.7);
  });
  it("budget adds up", () => {
    const b = budgetSummary(ws);
    expect(b.total).toBe(15000);
    expect(b.paid).toBe(1500 + 900 + 150 + 700 + 600 + 1200);
    expect(b.perCat.reduce((s, c) => s + c.allocated, 0)).toBeLessThanOrEqual(15000 + 50);
    expect(b.remaining).toBe(b.total - b.paid - b.committed);
    expect(b.perCat.find((c) => c.cat === "venue")!.paid).toBe(1500);
  });
  it("payments have the right status", () => {
    const venue2 = ws.payments.find((p) => p.id === "p-venue2")!;
    expect(paymentStatus(venue2, today)).toBe("soon");
    expect(paymentStatus(venue2, addDays(today, 6))).toBe("overdue");
    expect(paymentStatus({ ...venue2, paidOn: today, paidAmount: 100 }, today)).toBe("partial");
  });
  it("raises only the alerts that matter", () => {
    const kinds = alerts(ws, tasks, today).map((a) => a.kind);
    expect(kinds).toContain("passport");
    expect(kinds).toContain("contract");
    expect(kinds).not.toContain("rsvp"); // wedding far away
    expect(alerts(ws, tasks, addDays(today, 3)).some((a) => a.kind === "payment_soon")).toBe(true);
  });
  it("search finds across modules", () => {
    expect(search(ws, tasks, "photographer").length).toBeGreaterThan(1);
    expect(search(ws, tasks, "passport").some((h) => h.kind === "document")).toBe(true);
    expect(search(ws, tasks, "x")).toEqual([]);
  });
  it("milestones reflect completed key tasks", () => {
    expect(milestones(ws, tasks, "en").map((m) => m.id)).toContain("ve-contract");
  });
});

describe("operations are validated", () => {
  it("rejects bad input", () => {
    expect(opSchema.safeParse({ t: "put", c: "guests", item: { id: "g1", name: "A", side: "bride", adults: 1, children: 0, rsvp: "sent" } }).success).toBe(true);
    const ws = setup(profile());
    expect(() => applyOp(ws, { t: "put", c: "guests", item: { id: "g1", name: "", side: "bride", adults: 1, children: 0, rsvp: "sent" } })).toThrow();
    expect(() => applyOp(ws, { t: "put", c: "mood", item: { id: "m1", cat: "cake", image: "javascript:alert(1)" } })).toThrow();
    expect(opSchema.safeParse({ t: "put", c: "users", item: {} }).success).toBe(false);
  });
  it("deleting a table unassigns its guests", () => {
    let ws = demoWorkspace(today, "ar");
    ws = applyOp(ws, { t: "del", c: "tables", id: "t-1" });
    expect(ws.guests.some((g) => g.tableId === "t-1")).toBe(false);
  });
});
