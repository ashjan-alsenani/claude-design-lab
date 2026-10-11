"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CopyIcon, GiftIcon, LinkSimpleIcon, MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { itemDone } from "../model/engine";
import type { Item, ItemArea, ItemCat, ItemStatus, Priority, Task, TaskArea } from "../model/types";
import { EntitySheet, type Draft, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Button, CheckCircle, Chips, EmptyState, Fold, Toggle, cx, inputCls, type Tone } from "../ui/kit";

/** Opens a section's "add" sheet when arriving from a quick-add shortcut (?add=1). */
export function useAddParam(open: () => void) {
  const sp = useSearchParams();
  useEffect(() => {
    if (sp.get("add") === "1") open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export const itemCats: Record<ItemArea, ItemCat[]> = {
  baby: ["clothes", "sleep", "diaper", "bath", "outing", "feeding", "storage", "extra", "custom"],
  nursery: ["furniture", "sleep", "nurseryTextile", "decor", "storage", "custom"],
  mother: ["personal", "comfort", "custom"],
};
export const statusTone: Record<ItemStatus, Tone> = { todo: "neutral", have: "sage", buying: "amber", ordered: "primary", received: "sage", skip: "neutral" };
const prioRank: Record<Priority, number> = { essential: 0, optional: 1, later: 2 };

export function ItemList({ area, autoAdd = false }: { area: ItemArea; autoAdd?: boolean }) {
  const { plan, t, dispatch, newId, money, num, date, say, access, can } = useQ();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ItemCat | "all">("all");
  const [missing, setMissing] = useState(false);
  const [byPrio, setByPrio] = useState(true);
  const [edit, setEdit] = useState<Partial<Item> | null>(null);
  const openNew = () => setEdit({ area, cat: itemCats[area][0], qtyNeeded: 1, qtyHave: 0, priority: "essential", status: "todo" });
  useAddParam(() => autoAdd && openNew());

  const all = plan.items.filter((i) => i.area === area);
  const shown = useMemo(() => {
    let list = all.filter((i) => (cat === "all" || i.cat === cat) && (!missing || (!itemDone(i) && i.status !== "skip")) && (!q || `${i.name} ${i.store ?? ""} ${i.spec ?? ""} ${i.notes ?? ""}`.toLowerCase().includes(q.toLowerCase())));
    if (byPrio) list = [...list].sort((a, b) => prioRank[a.priority] - prioRank[b.priority]);
    return list;
  }, [all, cat, missing, q, byPrio]);
  const cats = itemCats[area].filter((c) => all.some((i) => i.cat === c) || c === "custom");
  const groups = cat === "all" ? cats.filter((c) => shown.some((i) => i.cat === c)) : [cat];
  const label = (i: Item) => (i.cat === "custom" && i.customCat ? i.customCat : t.cats.item[i.cat]);

  const quick = (i: Item) => dispatch({ t: "put", c: "items", item: { ...i, status: itemDone(i) ? "todo" : "have", qtyHave: itemDone(i) ? i.qtyHave : Math.max(i.qtyHave, i.qtyNeeded) } });
  const toGift = (i: Item) => {
    const gid = newId("gf");
    if (dispatch({ t: "put", c: "gifts", item: { id: gid, name: i.name, qtyNeeded: Math.max(1, i.qtyNeeded - i.qtyHave), priority: i.priority, url: i.url, spec: i.spec, priceMinor: i.plannedMinor, itemId: i.id } })) {
      dispatch({ t: "put", c: "items", item: { ...i, giftId: gid } });
      say(t.prep.inGifts);
    }
  };
  const copyText = async () => {
    const lines = groups.flatMap((c) => [`■ ${t.cats.item[c]}`, ...shown.filter((i) => i.cat === c).map((i) => `${itemDone(i) ? "✓" : "○"} ${i.name}${i.qtyNeeded > 1 ? ` ×${i.qtyNeeded}` : ""}${i.spec ? ` (${i.spec})` : ""}`), ""]);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      say(t.prep.copied);
    } catch {}
  };

  const fields: FieldSpec[] = [
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "cat", label: t.prep.fields.cat, kind: "select", required: true, half: true, options: itemCats[area].map((c) => ({ value: c, label: t.cats.item[c] })) },
    { key: "customCat", label: t.prep.fields.customCat, kind: "text", half: true, hidden: (d) => d.cat !== "custom" },
    { key: "priority", label: t.common.priority, kind: "select", required: true, half: true, options: (["essential", "optional", "later"] as Priority[]).map((p) => ({ value: p, label: t.status.priority[p] })) },
    { key: "status", label: t.common.status, kind: "select", required: true, half: true, options: (["todo", "have", "buying", "ordered", "received", "skip"] as ItemStatus[]).map((s) => ({ value: s, label: t.status.item[s] })) },
    { key: "qtyNeeded", label: t.prep.fields.needed, kind: "number", required: true, half: true, min: 0, max: 999 },
    { key: "qtyHave", label: t.prep.fields.have, kind: "number", required: true, half: true, min: 0, max: 999 },
    ...(can("budget") ? ([
      { key: "plannedMinor", label: t.prep.fields.planned, kind: "money", half: true },
      { key: "actualMinor", label: t.prep.fields.actual, kind: "money", half: true },
      { key: "orderId", label: t.prep.fields.linkOrder, kind: "select", options: plan.orders.filter((o) => o.status !== "cancelled").map((o) => ({ value: o.id, label: o.title })), hint: t.favorsT.linkedOrder },
    ] as FieldSpec[]) : []),
    { key: "spec", label: t.prep.fields.spec, kind: "text" },
    { key: "store", label: t.common.store, kind: "text", half: true },
    { key: "needBy", label: t.prep.fields.needBy, kind: "date", half: true },
    { key: "url", label: t.common.link, kind: "url", hint: "https://" },
    { key: "owner", label: t.common.owner, kind: "text", half: true },
    { key: "fileId", label: t.common.photo, kind: "file", board: "items" },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];

  const missingCount = all.filter((i) => !itemDone(i) && i.status !== "skip").length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-56">
          <MagnifyingGlassIcon size={18} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--qd-muted)]" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.prep.searchPh} aria-label={t.prep.searchPh} className={`${inputCls} ps-10`} />
        </div>
        {access.canEdit && (
          <Button onClick={openNew}>
            <PlusIcon size={18} /> {t.prep.addItem}
          </Button>
        )}
      </div>
      <Chips label={t.prep.fields.cat} value={cat} onChange={setCat} options={[{ value: "all" as const, label: t.common.all, count: all.length }, ...cats.map((c) => ({ value: c, label: t.cats.item[c], count: all.filter((i) => i.cat === c).length }))]} />
      <div className="flex flex-wrap items-center gap-x-6">
        <div className="min-w-56"><Toggle checked={missing} onChange={setMissing} label={`${t.common.onlyMissing} (${num(missingCount)})`} /></div>
        <div className="min-w-56"><Toggle checked={byPrio} onChange={setByPrio} label={t.common.sortPriority} /></div>
        <Button size="sm" variant="ghost" onClick={copyText}><CopyIcon size={16} /> {t.prep.copyList}</Button>
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={<GiftIcon size={26} />} title={t.common.empty} action={access.canEdit ? <Button onClick={openNew}>{t.prep.addItem}</Button> : undefined} />
      ) : (
        <div className="space-y-3">
          {groups.map((c) => {
            const list = shown.filter((i) => i.cat === c);
            if (!list.length) return null;
            const done = list.filter(itemDone).length;
            return (
              <Fold key={c} title={c === "custom" ? t.cats.item.custom : t.cats.item[c]} count={`${num(done)}/${num(list.filter((i) => i.status !== "skip").length)}`}>
                <ul className="divide-y divide-[var(--qd-line)]">
                  {list.map((i) => (
                    <li key={i.id} className={cx("flex items-center gap-1 pe-3 ps-1", i.status === "skip" && "opacity-55")}>
                      <CheckCircle checked={itemDone(i)} onClick={() => quick(i)} label={`${t.status.item.have}: ${i.name}`} disabled={!access.canEdit} />
                      <button type="button" onClick={() => setEdit(i)} className="min-h-14 min-w-0 flex-1 py-2.5 text-start">
                        <span className={cx("block text-[15px]", itemDone(i) && "text-[var(--qd-muted)] line-through decoration-[var(--qd-muted)]/40")}>{i.name}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-[var(--qd-muted)]">
                          <Badge tone={statusTone[i.status]}>{t.status.item[i.status]}</Badge>
                          {i.priority !== "optional" && <Badge tone={i.priority === "essential" ? "accent" : "neutral"}>{t.status.priority[i.priority]}</Badge>}
                          {i.qtyNeeded > 1 && <span>{num(i.qtyHave)}/{num(i.qtyNeeded)}</span>}
                          {i.cat === "custom" && i.customCat && <span>{label(i)}</span>}
                          {i.actualMinor !== undefined && can("budget") ? <span>{money(i.actualMinor)}</span> : i.plannedMinor !== undefined && can("budget") ? <span>≈ {money(i.plannedMinor)}</span> : null}
                          {i.needBy && <span>· {date(i.needBy)}</span>}
                          {i.giftId && <Badge tone="lilac"><GiftIcon size={12} /> {t.prep.inGifts}</Badge>}
                          {i.orderId && <LinkSimpleIcon size={13} />}
                        </span>
                      </button>
                      {can("registry") && access.canEdit && !i.giftId && !itemDone(i) && i.status !== "skip" && (
                        <button type="button" onClick={() => toGift(i)} className="grid size-11 shrink-0 place-items-center rounded-full text-[var(--qd-muted)] hover:bg-[var(--qd-tint-2)] hover:text-[var(--qd-primary)]" aria-label={`${t.prep.toGift}: ${i.name}`} title={t.prep.toGift}>
                          <GiftIcon size={19} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </Fold>
            );
          })}
        </div>
      )}
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? edit.name ?? t.common.edit : t.prep.addItem}
        fields={fields}
        initial={(edit ?? {}) as Draft}
        onSave={(d) => dispatch({ t: "put", c: "items", item: { ...d, id: edit?.id ?? newId("it"), area } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "items", id: edit.id! }) : undefined}
      />
    </div>
  );
}

export function TaskList({ area, eventId, title }: { area: TaskArea; eventId?: string; title?: string }) {
  const { plan, t, dispatch, newId, rel, timeLabel, access } = useQ();
  const [edit, setEdit] = useState<Partial<Task> | null>(null);
  const list = plan.tasks.filter((x) => x.area === area && (eventId ? x.eventId === eventId : true)).sort((a, b) => (a.status === "done" ? 1 : 0) - (b.status === "done" ? 1 : 0) || (a.due ?? "9").localeCompare(b.due ?? "9"));
  const fields: FieldSpec[] = [
    { key: "title", label: t.common.name, kind: "text", required: true },
    { key: "due", label: t.common.date, kind: "date", half: true },
    { key: "time", label: t.common.time, kind: "time", half: true },
    { key: "status", label: t.common.status, kind: "select", required: true, half: true, options: (["todo", "done", "skip"] as const).map((s) => ({ value: s, label: t.status.task[s] })) },
    { key: "owner", label: t.common.owner, kind: "text", half: true },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  return (
    <section className="space-y-2">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-[1.1rem] font-bold">{title}</h2>
          {access.canEdit && <Button size="sm" variant="soft" onClick={() => setEdit({ area, status: "todo", eventId })}><PlusIcon size={16} /> {t.common.add}</Button>}
        </div>
      )}
      {list.length === 0 ? (
        <p className="rounded-[16px] bg-[var(--qd-paper)] px-4 py-3 text-[14px] text-[var(--qd-muted)]">{t.common.empty}</p>
      ) : (
        <ul className="qd-card divide-y divide-[var(--qd-line)] rounded-[20px]">
          {list.map((x) => (
            <li key={x.id} className={cx("flex items-center gap-1 pe-3 ps-1", x.status === "skip" && "opacity-55")}>
              <CheckCircle checked={x.status === "done"} disabled={!access.canEdit} label={`${t.common.done}: ${x.title}`} onClick={() => dispatch({ t: "put", c: "tasks", item: { ...x, status: x.status === "done" ? "todo" : "done" } })} />
              <button type="button" onClick={() => setEdit(x)} className="min-h-14 min-w-0 flex-1 py-2.5 text-start">
                <span className={cx("block text-[15px]", x.status === "done" && "text-[var(--qd-muted)] line-through decoration-[var(--qd-muted)]/40")}>{x.title}</span>
                {(x.due || x.owner) && <span className="mt-0.5 block text-[12.5px] text-[var(--qd-muted)]">{[x.due && rel(x.due), x.time && timeLabel(x.time), x.owner].filter(Boolean).join(" · ")}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? edit.title ?? "" : `${t.common.add}`}
        fields={fields}
        initial={(edit ?? {}) as Draft}
        onSave={(d) => dispatch({ t: "put", c: "tasks", item: { ...d, id: edit?.id ?? newId("tk"), area, eventId: edit?.eventId } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "tasks", id: edit.id! }) : undefined}
      />
    </section>
  );
}
