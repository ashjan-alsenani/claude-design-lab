"use client";

import { useMemo, useState } from "react";
import { PlusIcon, StorefrontIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import type { Vendor, VendorCat, VendorStatus } from "../model/types";
import { VendorCard } from "../ui/cards";
import { EntitySheet, type FieldSpec } from "../ui/EntitySheet";
import { Bar, Button, Chips, EmptyState, SectionHeader } from "../ui/kit";

export function Vendors() {
  const { t, ws, dispatch, newId, num } = useBridal();
  const V = t.vendors;
  const [edit, setEdit] = useState<Partial<Vendor> | null>(null);
  const [cat, setCat] = useState<VendorCat | "all">("all");
  const [status, setStatus] = useState<VendorStatus | "all">("all");
  const live = ws.vendors.filter((v) => v.status !== "cancelled");
  const booked = live.filter((v) => v.status === "booked" || v.status === "completed").length;
  const cats = useMemo(() => [...new Set(ws.vendors.map((v) => v.cat))], [ws.vendors]);
  const list = ws.vendors.filter((v) => (cat === "all" || v.cat === cat) && (status === "all" || v.status === status));

  const fields: FieldSpec[] = [
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "cat", label: t.common.category, kind: "select", required: true, half: true, options: (Object.keys(V.cats) as VendorCat[]).map((c) => ({ value: c, label: V.cats[c] })) },
    { key: "status", label: t.common.status, kind: "select", required: true, half: true, options: (Object.keys(V.status) as VendorStatus[]).map((c) => ({ value: c, label: V.status[c] })) },
    { key: "contact", label: V.fields.contact, kind: "text", half: true },
    { key: "phone", label: V.fields.phone, kind: "tel", half: true },
    { key: "instagram", label: V.fields.instagram, kind: "text", half: true },
    { key: "website", label: V.fields.website, kind: "url", half: true },
    { key: "quoted", label: V.fields.quoted, kind: "number", half: true },
    { key: "final", label: V.fields.final, kind: "number", half: true },
    { key: "deposit", label: V.fields.deposit, kind: "number", half: true },
    { key: "bookedOn", label: V.fields.bookedOn, kind: "date", half: true },
    { key: "contractSigned", label: V.fields.contract, kind: "check" },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={V.title}
        sub={V.sub}
        action={
          <Button onClick={() => setEdit({ status: "considering", cat: "other" })}>
            <PlusIcon size={15} />
            {V.add}
          </Button>
        }
      />
      {ws.vendors.length === 0 ? (
        <EmptyState icon={<StorefrontIcon size={24} weight="regular" />} title={V.empty} sub={V.emptySub} action={<Button onClick={() => setEdit({ status: "considering", cat: "other" })}>{V.emptyCta}</Button>} />
      ) : (
        <>
          <div className="max-w-md">
            <p className="text-[14px] text-bj-ink">{V.booked(num(booked), num(live.length))}</p>
            <Bar value={booked / Math.max(1, live.length)} tone="sage" className="mt-2" />
          </div>
          <Chips label={t.common.category} value={cat} onChange={setCat} options={[{ value: "all", label: t.common.all }, ...cats.map((c) => ({ value: c, label: V.cats[c], count: ws.vendors.filter((v) => v.cat === c).length }))]} />
          <Chips label={t.common.status} value={status} onChange={setStatus} options={[{ value: "all", label: t.common.all }, ...(["shortlisted", "quoted", "booked", "considering", "contacted", "completed", "cancelled"] as VendorStatus[]).filter((s) => ws.vendors.some((v) => v.status === s)).map((s) => ({ value: s, label: V.status[s] }))]} />
          <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {list.map((v) => (
              <li key={v.id}>
                <VendorCard v={v} onClick={() => setEdit(v)} />
              </li>
            ))}
          </ul>
        </>
      )}
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? (edit.name ?? V.add) : V.add}
        fields={fields}
        initial={(edit ?? {}) as Record<string, string | number | boolean | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "vendors", item: { ...item, id: edit?.id ?? newId("v") } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "vendors", id: edit.id! }) : undefined}
      />
    </div>
  );
}
