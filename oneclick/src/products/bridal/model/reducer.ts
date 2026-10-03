import { demoWorkspace } from "./demo";
import { milestones, resolveTasks } from "./engine";
import { parseItem, type Coll, type Op } from "./schema";
import { seedLists, seedTimeline } from "./seed";
import { emptyWorkspace, type Workspace } from "./types";

/**
 * Applies one change to a workspace. Pure and deterministic: the browser applies it
 * instantly (optimistic UI) and the server applies the same operation to the stored copy.
 */
export function applyOp(ws: Workspace, op: Op): Workspace {
  const next: Workspace = structuredClone(ws);
  switch (op.t) {
    case "setup": {
      const p = op.profile;
      const fresh = emptyWorkspace();
      fresh.profile = p;
      fresh.items = seedLists(op.lang, { home: p.home !== "no", honeymoon: p.honeymoon !== "no", groom: p.groomSection });
      fresh.timeline = seedTimeline(op.lang);
      // Milestones already reached during onboarding are not "celebrated" again.
      fresh.seenMilestones = milestones(fresh, resolveTasks(fresh, op.lang), op.lang).map((m) => m.id);
      return fresh;
    }
    case "profile":
      if (!next.profile) return next;
      next.profile = { ...next.profile, ...op.patch } as Workspace["profile"];
      return next;
    case "task": {
      const custom = next.customTasks.find((c) => c.id === op.id);
      if (custom) {
        if (op.patch.status) custom.status = op.patch.status;
        if (op.patch.due) custom.due = op.patch.due;
        if (op.patch.notes !== undefined) custom.notes = op.patch.notes;
        if (op.patch.priority) custom.priority = op.patch.priority;
        return next;
      }
      const st = { ...next.taskStates[op.id] };
      if (op.patch.status) st.status = op.patch.status;
      if (op.patch.due !== undefined) st.due = op.patch.due ?? undefined;
      if (op.patch.notes !== undefined) st.notes = op.patch.notes || undefined;
      if (op.patch.priority !== undefined) st.priority = op.patch.priority ?? undefined;
      next.taskStates[op.id] = st;
      return next;
    }
    case "put": {
      const item = parseItem(op.c, op.item) as { id: string };
      const list = next[op.c] as { id: string }[];
      const i = list.findIndex((x) => x.id === item.id);
      if (i >= 0) list[i] = item;
      else list.push(item);
      return next;
    }
    case "del": {
      (next as Record<Coll, { id: string }[]>)[op.c] = (next[op.c] as { id: string }[]).filter((x) => x.id !== op.id);
      if (op.c === "tables") next.guests = next.guests.map((g) => (g.tableId === op.id ? { ...g, tableId: undefined } : g));
      if (op.c === "vendors") {
        next.expenses = next.expenses.map((e) => (e.vendorId === op.id ? { ...e, vendorId: undefined } : e));
        next.payments = next.payments.map((x) => (x.vendorId === op.id ? { ...x, vendorId: undefined } : x));
        next.appointments = next.appointments.map((a) => (a.vendorId === op.id ? { ...a, vendorId: undefined } : a));
      }
      if (op.c === "expenses") next.payments = next.payments.map((x) => (x.expenseId === op.id ? { ...x, expenseId: undefined } : x));
      return next;
    }
    case "guests": {
      const ids = new Set(op.ids);
      next.guests = next.guests.map((g) =>
        ids.has(g.id) ? { ...g, ...(op.patch.rsvp ? { rsvp: op.patch.rsvp } : {}), ...(op.patch.tableId !== undefined ? { tableId: op.patch.tableId ?? undefined } : {}) } : g
      );
      return next;
    }
    case "honeymoon":
      next.honeymoon = { ...next.honeymoon, ...op.patch };
      return next;
    case "budget":
      if (op.amount === null) delete next.categoryBudgets[op.cat];
      else next.categoryBudgets[op.cat] = op.amount;
      return next;
    case "seen":
      if (!next.seenMilestones.includes(op.id)) next.seenMilestones.push(op.id);
      return next;
    case "demo":
      return demoWorkspace(op.today, op.lang);
    case "reset":
      return emptyWorkspace();
  }
}
