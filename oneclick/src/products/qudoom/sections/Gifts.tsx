"use client";

import { useState } from "react";
import { ArrowSquareOutIcon, CheckIcon, CopyIcon, GiftIcon, HeartIcon, LinkIcon, PlusIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import type { Gift, Priority, ReceivedGift, ReceivedKind } from "../model/types";
import { EntitySheet, type Draft, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Bar, Button, Card, Chips, EmptyState, Field, PageHeader, TextArea , IdeasLink } from "../ui/kit";
import { useAddParam } from "./Lists";
import { useLinkText } from "./Reception";

export function RegistryPage() {
  const { t, plan, dispatch, newId, num, money, access, pub, api, href, say, lang } = useQ();
  const [edit, setEdit] = useState<Partial<Gift> | null>(null);
  useAddParam(() => setEdit({ qtyNeeded: 1, priority: "essential" }));
  const url = useLinkText("gifts");
  const fields: FieldSpec[] = [
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "qtyNeeded", label: t.registry.needed, kind: "number", required: true, half: true, min: 1, max: 99 },
    { key: "priority", label: t.common.priority, kind: "select", required: true, half: true, options: (["essential", "optional", "later"] as Priority[]).map((p) => ({ value: p, label: t.status.priority[p] })) },
    { key: "priceMinor", label: t.common.price, kind: "money", half: true, hint: plan.profile?.currency },
    { key: "spec", label: t.prep.fields.spec, kind: "text", half: true },
    { key: "url", label: t.common.link, kind: "url", hint: "https://" },
    { key: "publicNote", label: t.registry.publicNote, kind: "text" },
    { key: "fileId", label: t.common.photo, kind: "file", board: "gifts" },
    { key: "hidden", label: t.registry.hide, kind: "check" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={t.registry.title} sub={t.registry.sub} icon={<GiftIcon size={22} />} action={access.canEdit ? <Button onClick={() => setEdit({ qtyNeeded: 1, priority: "essential" })}><PlusIcon size={18} /> {t.registry.add}</Button> : undefined} />
      {access.canEdit && <IdeasLink href={href("ideas")} label={lang === "ar" ? "أفكار هدايا جاهزة، أضيفيها بضغطة" : "Ready gift ideas, add with one tap"} />}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <LinkIcon size={20} className="text-[var(--qd-primary)]" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t.registry.shareTitle}</p>
          {url ? <p dir="ltr" className="truncate text-start text-[12.5px] text-[var(--qd-muted)]">{url}</p> : <p className="text-[12.5px] text-[var(--qd-muted)]">{t.shareT.off}</p>}
        </div>
        {url ? (
          <>
            <Button size="sm" variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(url); say(t.common.copied); } catch {} }}><CopyIcon size={16} /> {t.common.copy}</Button>
            {typeof navigator !== "undefined" && "share" in navigator && <Button size="sm" variant="secondary" onClick={() => navigator.share({ url }).catch(() => {})}><ShareNetworkIcon size={16} /> {t.common.share}</Button>}
          </>
        ) : (
          <a href={href("share")} className="inline-flex h-9 items-center rounded-full bg-[var(--qd-primary)] px-4 text-[13px] font-semibold text-white">{t.shareT.create}</a>
        )}
      </Card>
      <p className="text-[12.5px] text-[var(--qd-muted)]">{t.registry.noPayments}</p>
      {plan.gifts.length === 0 ? (
        <EmptyState icon={<GiftIcon size={26} />} title={t.common.empty} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {plan.gifts.map((g) => {
            const c = pub?.gifts[g.id] ?? { reserved: 0, purchased: 0, names: [] };
            const avail = Math.max(0, g.qtyNeeded - c.reserved - c.purchased);
            return (
              <li key={g.id} className="min-w-0">
                <button type="button" onClick={() => setEdit(g)} className="qd-card flex w-full min-w-0 gap-3 rounded-[20px] p-3.5 text-start">
                  <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-[var(--qd-tint-2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {g.fileId ? <img src={api.fileUrl(g.fileId)} alt="" className="size-full object-cover" /> : <GiftIcon size={26} className="text-[var(--qd-primary)]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate font-semibold">{g.name}</span>{g.hidden && <Badge>{t.registry.hide}</Badge>}</p>
                    <p className="mt-0.5 text-[12.5px] text-[var(--qd-muted)]">{[g.priceMinor !== undefined && money(g.priceMinor), g.spec, t.status.priority[g.priority]].filter(Boolean).join(" · ")}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="primary">{t.registry.available}: {num(avail)}</Badge>
                      {c.reserved > 0 && <Badge tone="amber">{t.registry.reserved}: {num(c.reserved)}</Badge>}
                      {c.purchased > 0 && <Badge tone="sage">{t.registry.purchased}: {num(c.purchased)}</Badge>}
                    </div>
                    <Bar className="mt-2" value={(c.reserved + c.purchased) / g.qtyNeeded} tone="sage" />
                    {c.names.length > 0 && <p className="mt-1.5 truncate text-[12px] text-[var(--qd-muted)]">{t.registry.whoReserved}: {c.names.join("، ")}</p>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? edit.name ?? "" : t.registry.add}
        fields={fields}
        initial={(edit ?? {}) as Draft}
        extra={edit?.url ? <a href={edit.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--qd-primary)]"><ArrowSquareOutIcon size={15} /> {t.pub.buyLink}</a> : undefined}
        onSave={(d) => dispatch({ t: "put", c: "gifts", item: { ...d, id: edit?.id ?? newId("gf"), itemId: edit?.itemId } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "gifts", id: edit.id! }) : undefined}
      />
    </div>
  );
}

export function ReceivedPage() {
  const { t, plan, dispatch, newId, money, date, today, access, say, num } = useQ();
  const [edit, setEdit] = useState<Partial<ReceivedGift> | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "thanked">("all");
  useAddParam(() => setEdit({ kind: "item", thanked: false, date: today }));
  const tpl = plan.thankTemplate ?? t.receivedT.defaultTemplate;
  const message = (g: ReceivedGift) => tpl.replaceAll("{name}", g.from).replaceAll("{gift}", g.desc || t.cats.received[g.kind]);
  const list = plan.received.filter((g) => filter === "all" || (filter === "pending" ? !g.thanked : g.thanked)).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const fields: FieldSpec[] = [
    { key: "from", label: t.receivedT.from, kind: "text", required: true },
    { key: "kind", label: t.receivedT.kind, kind: "select", required: true, half: true, options: (["item", "cash", "gold", "other"] as ReceivedKind[]).map((k) => ({ value: k, label: t.cats.received[k] })) },
    { key: "date", label: t.common.date, kind: "date", half: true },
    { key: "desc", label: t.common.name, kind: "text" },
    { key: "valueMinor", label: t.receivedT.value, kind: "money" },
    { key: "fileId", label: t.common.photo, kind: "file", board: "gifts" },
    { key: "thanked", label: t.receivedT.thanked, kind: "check" },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={t.receivedT.title} sub={t.receivedT.sub} icon={<HeartIcon size={22} />} action={access.canEdit ? <Button onClick={() => setEdit({ kind: "item", thanked: false, date: today })}><PlusIcon size={18} /> {t.receivedT.add}</Button> : undefined} />
      <Chips label={t.common.filters} value={filter} onChange={setFilter} options={[{ value: "all" as const, label: t.common.all, count: plan.received.length }, { value: "pending" as const, label: t.receivedT.notThanked, count: plan.received.filter((g) => !g.thanked).length }, { value: "thanked" as const, label: t.receivedT.thanked, count: plan.received.filter((g) => g.thanked).length }]} />
      {list.length === 0 ? (
        <EmptyState icon={<HeartIcon size={26} />} title={t.common.empty} />
      ) : (
        <ul className="space-y-2">
          {list.map((g) => (
            <li key={g.id} className="qd-card rounded-[18px] p-4">
              <button type="button" onClick={() => setEdit(g)} className="w-full text-start">
                <span className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-semibold">{g.from}</span>
                  <Badge tone={g.thanked ? "sage" : "accent"}>{g.thanked ? t.receivedT.thanked : t.receivedT.notThanked}</Badge>
                </span>
                <span className="mt-0.5 block text-[13px] text-[var(--qd-muted)]">{[t.cats.received[g.kind], g.desc, g.date && date(g.date), g.valueMinor !== undefined && money(g.valueMinor)].filter(Boolean).join(" · ")}</span>
              </button>
              {!g.thanked && access.canEdit && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={async () => { const m = message(g); if (typeof navigator.share === "function") navigator.share({ text: m }).catch(() => {}); else { try { await navigator.clipboard.writeText(m); say(t.common.copied); } catch {} } }}><ShareNetworkIcon size={16} /> {t.receivedT.openShare}</Button>
                  <Button size="sm" variant="soft" onClick={() => dispatch({ t: "put", c: "received", item: { ...g, thanked: true, thankedOn: today } })}><CheckIcon size={16} /> {t.receivedT.markThanked}</Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-[12.5px] text-[var(--qd-muted)]">{t.receivedT.shareNote}</p>
      <Card className="p-4">
        <Field label={t.receivedT.template} hint={t.receivedT.templateHint} htmlFor="q-tpl">
          <TextArea id="q-tpl" defaultValue={tpl} disabled={!access.canEdit} maxLength={1000} onBlur={(e) => e.target.value !== tpl && dispatch({ t: "thankTemplate", text: e.target.value })} />
        </Field>
        <p className="mt-2 text-[12px] text-[var(--qd-muted)]">{num(plan.received.length)} · {t.receivedT.thanked}: {num(plan.received.filter((g) => g.thanked).length)}</p>
      </Card>
      <EntitySheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? edit.from ?? "" : t.receivedT.add} fields={fields} initial={(edit ?? {}) as Draft} onSave={(d) => dispatch({ t: "put", c: "received", item: { ...d, id: edit?.id ?? newId("rc"), thanked: !!d.thanked, thankedOn: d.thanked ? (edit?.thankedOn ?? today) : undefined } })} onDelete={edit?.id ? () => dispatch({ t: "del", c: "received", id: edit.id! }) : undefined} />
    </div>
  );
}
