"use client";

import { useMemo, useState } from "react";
import { CoatHangerIcon, PlusIcon, ShoppingBagIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import { listCats } from "../i18n";
import type { Item, ItemStatus, ListKey } from "../model/types";
import { ArtTile, closetMotif } from "../ui/Art";
import { EntitySheet, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Bar, Button, CheckCircle, Chips, EmptyState, SectionHeader, cx, type Tone } from "../ui/kit";

const statusTone: Record<ItemStatus, Tone> = { need: "neutral", bought: "sage", gift: "gold", skip: "neutral" };

/** Shared item manager: trousseau, new home, packing, SOS kit, groom. */
export function ItemList({ list, title, sub, header = true, compact = false }: { list: ListKey; title?: string; sub?: string; header?: boolean; compact?: boolean }) {
  const { t, ws, dispatch, newId, num, money } = useBridal();
  const I = t.items;
  const items = ws.items.filter((i) => i.list === list);
  const [cat, setCat] = useState<string | "all">("all");
  const [edit, setEdit] = useState<Partial<Item> | null>(null);
  const cats = useMemo(() => [...new Set([...listCats[list].filter((c) => items.some((i) => i.cat === c)), ...items.map((i) => i.cat)])], [items, list]);
  const live = items.filter((i) => i.status !== "skip");
  const done = live.filter((i) => i.status === "bought" || i.status === "gift").length;
  const spent = items.reduce((s, i) => s + (i.status === "bought" ? (i.price ?? 0) : 0), 0);
  const statuses = list === "home" ? I.homeStatuses : I.statuses;
  const simple = list === "sos" || list === "packing";
  const shown = cat === "all" ? items : items.filter((i) => i.cat === cat);
  const catLabel = (c: string) => t.itemCats[c] ?? c;

  const fields: FieldSpec[] = [
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "cat", label: t.common.category, kind: "select", required: true, half: true, options: listCats[list].map((c) => ({ value: c, label: catLabel(c) })) },
    { key: "status", label: t.common.status, kind: "select", required: true, half: true, options: (Object.keys(statuses) as ItemStatus[]).map((s) => ({ value: s, label: statuses[s] })) },
    { key: "qty", label: I.fields.qty, kind: "number", half: true },
    ...(simple
      ? []
      : ([
          { key: "budget", label: I.fields.budget, kind: "number", half: true },
          { key: "price", label: I.fields.price, kind: "number", half: true },
          { key: "store", label: I.fields.store, kind: "text", half: true },
          { key: "image", label: t.common.photo, kind: "image" },
        ] as FieldSpec[])),
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];

  return (
    <div className="space-y-5">
      {header && (
        <SectionHeader
          title={title!}
          sub={sub}
          action={
            <Button onClick={() => setEdit({ status: "need", cat: cat !== "all" ? cat : listCats[list][0] })}>
              <PlusIcon size={15} />
              {I.add}
            </Button>
          }
        />
      )}
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
        <div className="min-w-48 flex-1">
          <p className="text-[14px] text-bj-ink">{I.purchased(num(done), num(live.length))}</p>
          <Bar value={done / Math.max(1, live.length)} tone="sage" className="mt-2" />
        </div>
        {!simple && spent > 0 && (
          <p className="text-[13px] text-bj-muted">
            {I.spent}: <span className="tabular-nums text-bj-ink">{money(spent)}</span>
          </p>
        )}
        {!header && (
          <Button size="sm" variant="secondary" onClick={() => setEdit({ status: "need", cat: listCats[list][0] })}>
            <PlusIcon size={14} />
            {I.add}
          </Button>
        )}
      </div>
      {cats.length > 1 && <Chips label={t.common.category} value={cat} onChange={setCat} options={[{ value: "all", label: I.filterAll }, ...cats.map((c) => ({ value: c, label: catLabel(c), count: items.filter((i) => i.cat === c && i.status === "need").length }))]} />}
      {items.length === 0 ? (
        <EmptyState icon={<ShoppingBagIcon size={24} weight="regular" />} title={I.empty} action={<Button onClick={() => setEdit({ status: "need", cat: listCats[list][0] })}>{I.add}</Button>} />
      ) : (
        <ul className={cx("grid gap-2", !compact && "md:grid-cols-2")}>
          {shown.map((it) => {
            const got = it.status === "bought" || it.status === "gift";
            return (
              <li key={it.id} className={cx("flex items-center gap-1.5 rounded-[16px] border bg-[linear-gradient(180deg,#fffdfc,#fcf8f6)] shadow-[0_12px_30px_-26px_rgba(60,40,120,.35)] px-2.5 py-1.5", got ? "border-transparent" : "border-bj-line", it.status === "skip" && "opacity-55")}>
                <CheckCircle checked={got} onClick={() => dispatch({ t: "put", c: "items", item: { ...it, status: got ? "need" : "bought" } })} label={`${statuses.bought}: ${it.name}`} size={22} />
                {it.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt="" className="size-10 shrink-0 rounded-[10px] object-cover" />
                )}
                <button type="button" onClick={() => setEdit(it)} className="flex min-w-0 flex-1 items-center gap-2 py-2 text-start">
                  <span className="min-w-0 flex-1">
                    <span className={cx("block truncate text-[14.5px]", got ? "text-bj-muted line-through decoration-bj-beige" : "text-bj-ink")}>
                      {it.name}
                      {it.qty && it.qty > 1 ? <span className="text-bj-muted"> × {num(it.qty)}</span> : null}
                    </span>
                    <span className="text-[12px] text-bj-muted">
                      {catLabel(it.cat)}
                      {it.store ? ` · ${it.store}` : ""}
                      {it.price ? ` · ${money(it.price)}` : it.budget ? ` · ${money(it.budget)}` : ""}
                    </span>
                  </span>
                  {it.status === "gift" && <Badge tone={statusTone.gift}>{statuses.gift}</Badge>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? (edit.name ?? I.add) : I.add}
        fields={fields}
        initial={(edit ?? {}) as Record<string, string | number | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "items", item: { ...item, list, id: edit?.id ?? newId(list) } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "items", id: edit.id! }) : undefined}
      />
    </div>
  );
}

export function Shopping() {
  const { t } = useBridal();
  return <ItemList list="trousseau" title={t.shopping.title} sub={t.shopping.sub} />;
}

export function NewHome() {
  const { t, ws } = useBridal();
  if (ws.profile?.home === "no") return <EmptyState icon={<ShoppingBagIcon size={24} weight="regular" />} title={t.homeMod.off} />;
  return <ItemList list="home" title={t.homeMod.title} sub={t.homeMod.sub} />;
}

/** Bridal closet: an editorial gallery of looks for every occasion. */
export function Closet() {
  const { t, ws, dispatch, newId, money } = useBridal();
  const C = t.closet;
  const items = ws.items.filter((i) => i.list === "closet");
  const [cat, setCat] = useState<string | "all">("all");
  const [edit, setEdit] = useState<Partial<Item> | null>(null);
  const cats = listCats.closet.filter((c) => items.some((i) => i.cat === c));
  const shown = cat === "all" ? items : items.filter((i) => i.cat === cat);
  const fields: FieldSpec[] = [
    { key: "image", label: t.common.photo, kind: "image" },
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "cat", label: t.common.category, kind: "select", required: true, half: true, options: listCats.closet.map((c) => ({ value: c, label: t.itemCats[c] })) },
    { key: "status", label: t.common.status, kind: "select", required: true, half: true, options: (["need", "bought"] as ItemStatus[]).map((s) => ({ value: s, label: t.items.statuses[s] })) },
    { key: "event", label: t.items.fields.event, kind: "select", half: true, options: ["wedding", "milka", "henna", "shower", "honeymoon", "daily"].map((c) => ({ value: c, label: t.itemCats[c] })) },
    { key: "price", label: t.items.fields.price, kind: "number", half: true },
    { key: "store", label: t.items.fields.store, kind: "text", half: true },
    { key: "size", label: t.items.fields.size, kind: "text", half: true },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader
        title={C.title}
        sub={C.sub}
        action={
          <Button onClick={() => setEdit({ status: "need", cat: "wedding" })}>
            <PlusIcon size={15} />
            {t.items.add}
          </Button>
        }
      />
      {cats.length > 1 && <Chips label={t.common.category} value={cat} onChange={setCat} options={[{ value: "all", label: t.common.all }, ...cats.map((c) => ({ value: c, label: t.itemCats[c] }))]} />}
      {items.length === 0 ? (
        <EmptyState icon={<CoatHangerIcon size={24} weight="regular" />} title={C.empty} action={<Button onClick={() => setEdit({ status: "need", cat: "wedding" })}>{C.emptyCta}</Button>} />
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {shown.map((it, i) => (
            <li key={it.id}>
              <button type="button" onClick={() => setEdit(it)} className="group block w-full text-start">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-bj-line">
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt={it.name} className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  ) : (
                    <ArtTile motif={closetMotif[it.cat] ?? "dress"} tone={i} className="size-full transition-transform duration-700 group-hover:scale-[1.03]" />
                  )}
                  {it.status === "bought" && <Badge tone="sage" className="absolute start-2.5 top-2.5">{t.items.statuses.bought}</Badge>}
                </div>
                <p className="mt-2.5 line-clamp-2 text-[14.5px] leading-snug text-bj-ink">{it.name}</p>
                <p className="text-[12.5px] text-bj-muted">
                  {t.itemCats[it.cat] ?? it.cat}
                  {it.price ? ` · ${money(it.price)}` : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? (edit.name ?? t.items.add) : t.items.add}
        fields={fields}
        initial={(edit ?? {}) as Record<string, string | number | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "items", item: { ...item, list: "closet", id: edit?.id ?? newId("closet") } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "items", id: edit.id! }) : undefined}
      />
    </div>
  );
}
