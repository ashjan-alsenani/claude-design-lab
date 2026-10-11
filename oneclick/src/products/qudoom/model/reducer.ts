import { collLimits, parseItem, type Coll, type Op } from "./schema";
import { seedBag, seedEvent, seedHelp, seedHospitality, seedItems, seedTasks } from "./seed";
import { defaultVisitSettings, emptyPlan, type ItemArea, type Plan } from "./types";

/**
 * Applies one change to a plan. Pure and deterministic: the browser applies it instantly (optimistic
 * UI) and the server applies the same, re-validated operation to the stored copy. Invalid input
 * throws, so nothing half-applied is ever saved.
 */
export function applyOp(plan: Plan, op: Op): Plan {
  const next: Plan = structuredClone(plan);
  switch (op.t) {
    case "setup": {
      const p = op.profile;
      const fresh = emptyPlan();
      fresh.profile = p;
      const areas: ItemArea[] = [];
      if (p.sections.prep) areas.push("baby");
      if (p.sections.nursery) areas.push("nursery");
      if (p.sections.mother) areas.push("mother");
      fresh.items = seedItems(op.lang, areas);
      fresh.bag = p.sections.bag ? seedBag(op.lang) : [];
      fresh.tasks = seedTasks(op.lang);
      fresh.helpRows = p.sections.mother ? seedHelp(op.lang) : [];
      fresh.events = p.sections.reception ? p.receptionKinds.map((k) => seedEvent(k, op.lang)) : [];
      fresh.hospitality = p.sections.hospitality ? seedHospitality(op.lang, fresh.events[0]?.id) : [];
      fresh.visitSettings = defaultVisitSettings(op.lang);
      fresh.seen = [];
      return fresh;
    }
    case "profile": {
      if (!next.profile) throw new Error("NO_PROFILE");
      next.profile = { ...next.profile, ...op.patch } as Plan["profile"];
      return next;
    }
    case "put": {
      const item = parseItem(op.c, op.item) as { id: string };
      const list = next[op.c] as { id: string }[];
      const i = list.findIndex((x) => x.id === item.id);
      if (i >= 0) list[i] = item;
      else {
        if (list.length >= collLimits[op.c]) throw new Error("LIMIT");
        list.push(item);
      }
      return next;
    }
    case "del":
      return removeFrom(next, op.c, op.id);
    case "visitSettings":
      next.visitSettings = { ...next.visitSettings, ...op.patch };
      return next;
    case "help":
      next.help = { days: op.patch.days ?? next.help.days, start: op.patch.start === "" ? undefined : op.patch.start ?? next.help.start };
      return next;
    case "budget":
      if (op.amountMinor === null) delete next.budget[op.cat];
      else next.budget[op.cat] = op.amountMinor;
      return next;
    case "arrived":
      if (!next.profile) throw new Error("NO_PROFILE");
      next.profile.arrived = op.on ? { date: op.date } : undefined;
      return next;
    case "thankTemplate":
      next.thankTemplate = op.text;
      return next;
    case "seen":
      if (!next.seen.includes(op.id)) next.seen.push(op.id);
      return next;
    case "reorderMemory": {
      const list = [...next.memories].sort((a, b) => a.order - b.order);
      const i = list.findIndex((m) => m.id === op.id);
      const j = op.dir === "up" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= list.length) return next;
      [list[i], list[j]] = [list[j], list[i]];
      next.memories = list.map((m, k) => ({ ...m, order: k }));
      return next;
    }
    case "reset":
      return emptyPlan();
  }
}

/** Deletes a record and detaches anything that pointed at it, so no link dangles. */
function removeFrom(next: Plan, c: Coll, id: string): Plan {
  (next as unknown as Record<Coll, { id: string }[]>)[c] = (next[c] as { id: string }[]).filter((x) => x.id !== id);
  const drop = <T extends object, K extends keyof T>(list: T[], key: K) => list.map((x) => (x[key] === (id as unknown) ? { ...x, [key]: undefined } : x));
  switch (c) {
    case "orders":
      next.items = drop(next.items, "orderId");
      next.favors = drop(next.favors, "orderId");
      next.payments = drop(next.payments, "orderId");
      break;
    case "gifts":
      next.items = drop(next.items, "giftId");
      break;
    case "items":
      next.gifts = drop(next.gifts, "itemId");
      break;
    case "events":
      next.tasks = drop(next.tasks, "eventId");
      next.favors = drop(next.favors, "eventId");
      next.orders = drop(next.orders, "eventId");
      next.hospitality = next.hospitality.map((h) => (h.source.eventId === id ? { ...h, source: { manual: 0 } } : h));
      break;
    case "visits":
      next.hospitality = next.hospitality.map((h) => (h.source.visitId === id ? { ...h, source: { manual: 0 } } : h));
      break;
    case "vendors":
      next.orders = drop(next.orders, "vendorId");
      break;
    case "files":
      next.items = drop(next.items, "fileId");
      next.gifts = drop(next.gifts, "fileId");
      next.received = drop(next.received, "fileId");
      next.memories = drop(next.memories, "fileId");
      next.cards = drop(next.cards, "fileId");
      next.orders = drop(next.orders, "receiptFileId");
      next.favors = drop(drop(next.favors, "inspirationFileId"), "sampleFileId");
      break;
  }
  return next;
}
