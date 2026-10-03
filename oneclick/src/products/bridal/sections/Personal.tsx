"use client";

import Link from "next/link";
import { useState } from "react";
import { AirplaneTiltIcon, ArrowRightIcon, CheckIcon, InfoIcon, PlusIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import { diffDays } from "../model/engine";
import type { Appointment, CategoryKey, Honeymoon as HoneymoonT, TimelineItem, TravelBooking } from "../model/types";
import { fmtTime } from "../ui/cards";
import { EntitySheet, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Button, Card, EmptyState, Field, SectionHeader, Segmented, Toggle, cx, inputCls } from "../ui/kit";
import { TaskList } from "../ui/tasks";
import { ItemList } from "./Lists";
import { useApptFields } from "./Calendar";

/** Bride: dress, look, beauty (with her own appointments), jewellery, accessories. */
export function Bride() {
  const { t, tasks, ws, href, dispatch, newId, today, rel } = useBridal();
  const [tab, setTab] = useState<CategoryKey>("dress");
  const [appt, setAppt] = useState<Partial<Appointment> | null>(null);
  const fields = useApptFields();
  const tabs: CategoryKey[] = ["dress", "look", "beauty", "jewellery", "accessories"];
  const list = tasks.filter((x) => x.cat === tab);
  const open = list.filter((x) => x.status !== "done" && x.status !== "skip");
  const done = list.filter((x) => x.status === "done");
  const beautyAppts = ws.appointments.filter((a) => ["beauty", "facial", "salon", "makeup", "hair"].includes(a.kind) && a.date >= today);
  return (
    <div className="space-y-6">
      <SectionHeader
        title={t.bride.title}
        sub={t.bride.sub}
        action={
          <Link href={href("closet")} className="inline-flex h-11 items-center gap-2 rounded-full border border-bj-line bg-bj-paper px-5 text-sm hover:border-bj-taupe/50">
            {t.bride.closetLink}
            <ArrowRightIcon size={15} className="rtl:rotate-180" />
          </Link>
        }
      />
      <Segmented label={t.bride.title} value={tab} onChange={setTab} options={tabs.map((k) => ({ value: k, label: t.bride.sections[k as keyof typeof t.bride.sections] }))} />
      {tab === "beauty" && (
        <>
          <p className="flex items-start gap-2 rounded-[14px] bg-bj-cream px-4 py-3 text-[13px] leading-relaxed text-bj-ink-soft">
            <InfoIcon size={17} className="mt-0.5 shrink-0 text-bj-gold-ink" />
            {t.bride.beautyNote}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {beautyAppts.map((a) => (
              <button key={a.id} type="button" onClick={() => setAppt(a)} className="rounded-full border border-bj-line bg-bj-paper px-3.5 py-1.5 text-[13px]">
                {a.title} · {rel(a.date)}
              </button>
            ))}
            <Button size="sm" variant="secondary" onClick={() => setAppt({ kind: "beauty", date: today })}>
              <PlusIcon size={14} />
              {t.bride.beautyAppt}
            </Button>
          </div>
        </>
      )}
      <TaskList tasks={open} empty={t.checklist.empty} />
      {done.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-[13.5px] text-bj-muted">
            {t.buckets.done} ({done.length})
          </summary>
          <div className="mt-3">
            <TaskList tasks={done} />
          </div>
        </details>
      )}
      {ws.profile?.groomSection && (
        <section className="pt-4">
          <h2 className="bj-serif mb-4 text-[1.5rem]">{t.bride.groom}</h2>
          <ItemList list="groom" header={false} />
        </section>
      )}
      <EntitySheet
        open={!!appt}
        onClose={() => setAppt(null)}
        title={appt?.id ? (appt.title ?? t.bride.beautyAppt) : t.bride.beautyAppt}
        fields={fields}
        initial={(appt ?? {}) as Record<string, string | number | boolean | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "appointments", item: { ...item, id: appt?.id ?? newId("a") } })}
        onDelete={appt?.id ? () => dispatch({ t: "del", c: "appointments", id: appt.id! }) : undefined}
      />
    </div>
  );
}

export function Honeymoon() {
  const { t, ws, tasks, dispatch, newId, date } = useBridal();
  const H = t.honeymoon;
  const h = ws.honeymoon;
  const [draft, setDraft] = useState<HoneymoonT>(h);
  const [saved, setSaved] = useState(false);
  const [bk, setBk] = useState<Partial<TravelBooking> | null>(null);
  if (ws.profile?.honeymoon === "no") return <EmptyState icon={<AirplaneTiltIcon size={24} weight="regular" />} title={H.off} />;
  const set = <K extends keyof HoneymoonT>(k: K, v: HoneymoonT[K]) => (setDraft((d) => ({ ...d, [k]: v })), setSaved(false));
  const passportRisk = draft.passportExpiry && diffDays(draft.to ?? draft.from ?? ws.profile!.weddingDate, draft.passportExpiry) < 183;
  const open = tasks.filter((x) => x.cat === "honeymoon" && x.status !== "done" && x.status !== "skip");
  const d = (k: "from" | "to" | "passportExpiry") => (
    <input type="date" dir="ltr" value={draft[k] ?? ""} onChange={(e) => set(k, e.target.value || undefined)} className={`${inputCls} text-start`} id={`hm-${k}`} />
  );
  return (
    <div className="space-y-7">
      <SectionHeader title={H.title} sub={H.sub} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card as="section" className="p-5 sm:p-6">
          <h2 className="bj-serif mb-5 text-[1.45rem]">{H.trip}</h2>
          <form
            className="grid grid-cols-2 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (dispatch({ t: "honeymoon", patch: draft })) setSaved(true);
            }}
          >
            <div className="col-span-2">
              <Field label={H.destination} htmlFor="hm-dest">
                <input id="hm-dest" value={draft.destination ?? ""} onChange={(e) => set("destination", e.target.value || undefined)} className={inputCls} maxLength={80} />
              </Field>
            </div>
            <Field label={H.from} htmlFor="hm-from">{d("from")}</Field>
            <Field label={H.to} htmlFor="hm-to">{d("to")}</Field>
            <Field label={H.passport} htmlFor="hm-passportExpiry">{d("passportExpiry")}</Field>
            <Field label={H.visa} htmlFor="hm-visa">
              <select id="hm-visa" value={draft.visa ?? ""} onChange={(e) => set("visa", (e.target.value || undefined) as HoneymoonT["visa"])} className={inputCls}>
                <option value="">—</option>
                {(Object.keys(H.visaOpt) as NonNullable<HoneymoonT["visa"]>[]).map((v) => (
                  <option key={v} value={v}>
                    {H.visaOpt[v]}
                  </option>
                ))}
              </select>
            </Field>
            {passportRisk && (
              <p role="alert" className="col-span-2 flex items-center gap-2 rounded-[12px] bg-bj-alert-soft px-3.5 py-2.5 text-[13px] text-bj-alert">
                <WarningCircleIcon size={17} />
                {t.alerts.passport}
              </p>
            )}
            <div className="col-span-2 divide-y divide-bj-line rounded-[14px] border border-bj-line px-4">
              <Toggle checked={!!draft.insurance} onChange={(v) => set("insurance", v)} label={H.insurance} />
              <Toggle checked={!!draft.esim} onChange={(v) => set("esim", v)} label={H.esim} />
            </div>
            <Field label={H.currency} htmlFor="hm-cur">
              <input id="hm-cur" value={draft.currencyNote ?? ""} onChange={(e) => set("currencyNote", e.target.value || undefined)} className={inputCls} maxLength={80} />
            </Field>
            <Field label={H.emergency} htmlFor="hm-em">
              <input id="hm-em" value={draft.emergency ?? ""} onChange={(e) => set("emergency", e.target.value || undefined)} className={inputCls} maxLength={200} />
            </Field>
            <p className="col-span-2 text-[12.5px] text-bj-muted">{H.weather}</p>
            <div className="col-span-2 flex items-center gap-3">
              <Button type="submit">{t.common.save}</Button>
              {saved && (
                <span role="status" className="inline-flex items-center gap-1 text-[13px] text-bj-sage">
                  <CheckIcon size={15} />
                  {t.settings.saved}
                </span>
              )}
            </div>
          </form>
        </Card>
        <section className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="bj-serif text-[1.45rem]">{H.bookings}</h2>
              <Button size="sm" variant="secondary" onClick={() => setBk({ kind: "flight" })}>
                <PlusIcon size={14} />
                {H.addBooking}
              </Button>
            </div>
            <ul className="space-y-2">
              {ws.bookings.map((b) => (
                <li key={b.id}>
                  <button type="button" onClick={() => setBk(b)} className="flex w-full items-center gap-3 rounded-[16px] border border-bj-line bg-bj-paper px-4 py-3 text-start">
                    <Badge tone="rose">{H.kinds[b.kind]}</Badge>
                    <span className="min-w-0 flex-1 truncate text-[14.5px]">{b.title}</span>
                    {b.date && <span className="text-[12.5px] text-bj-muted">{date(b.date)}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {open.length > 0 && (
            <div>
              <h2 className="bj-serif mb-3 text-[1.45rem]">{t.checklist.title}</h2>
              <TaskList tasks={open} compact />
            </div>
          )}
        </section>
      </div>
      <section>
        <h2 className="bj-serif mb-4 text-[1.45rem]">{H.packing}</h2>
        <ItemList list="packing" header={false} />
      </section>
      <EntitySheet
        open={!!bk}
        onClose={() => setBk(null)}
        title={bk?.id ? (bk.title ?? H.addBooking) : H.addBooking}
        fields={[
          { key: "kind", label: t.common.category, kind: "select", required: true, half: true, options: (Object.keys(H.kinds) as TravelBooking["kind"][]).map((k) => ({ value: k, label: H.kinds[k] })) },
          { key: "date", label: t.common.date, kind: "date", half: true },
          { key: "title", label: t.common.name, kind: "text", required: true },
          { key: "ref", label: H.ref, kind: "text" },
          { key: "notes", label: t.common.notes, kind: "textarea" },
        ]}
        initial={(bk ?? {}) as Record<string, string | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "bookings", item: { ...item, id: bk?.id ?? newId("b") } })}
        onDelete={bk?.id ? () => dispatch({ t: "del", c: "bookings", id: bk.id! }) : undefined}
      />
    </div>
  );
}

/** Wedding day: minute-by-minute timeline with responsible people, plus the SOS kit. */
export function WeddingDay() {
  const { t, ws, dispatch, newId, lang } = useBridal();
  const D = t.day;
  const [edit, setEdit] = useState<Partial<TimelineItem> | null>(null);
  const items = [...ws.timeline].sort((a, b) => a.time.localeCompare(b.time));
  return (
    <div className="space-y-8">
      <SectionHeader
        title={D.title}
        sub={D.sub}
        action={
          <Button onClick={() => setEdit({ time: "12:00" })}>
            <PlusIcon size={15} />
            {D.add}
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section aria-labelledby="tl-h">
          <h2 id="tl-h" className="bj-serif mb-4 text-[1.45rem]">
            {D.timeline}
          </h2>
          <ol className="relative space-y-1 border-s border-[#a8e6de] ps-6">
            {items.map((it) => (
              <li key={it.id} className="relative">
                <span className={cx("absolute -start-[31px] top-4 size-3 rounded-full border-2 border-bj-ivory", it.done ? "bg-bj-sage" : "bg-bj-gold")} />
                <div className="flex items-start gap-2 rounded-[16px] px-2 py-2 hover:bg-bj-paper">
                  <button type="button" onClick={() => setEdit(it)} className="flex min-w-0 flex-1 gap-4 text-start">
                    <span className="w-[72px] shrink-0 pt-0.5 text-[13.5px] font-medium tabular-nums text-bj-gold-ink" dir="ltr">
                      {fmtTime(it.time, lang)}
                    </span>
                    <span className="min-w-0">
                      <span className={cx("block text-[15px]", it.done ? "text-bj-muted line-through" : "text-bj-ink")}>{it.title}</span>
                      {(it.who || it.notes) && <span className="text-[12.5px] text-bj-muted">{[it.who, it.notes].filter(Boolean).join(" · ")}</span>}
                    </span>
                  </button>
                  <button type="button" aria-pressed={!!it.done} aria-label={t.common.done} onClick={() => dispatch({ t: "put", c: "timeline", item: { ...it, done: !it.done } })} className={cx("grid size-8 shrink-0 place-items-center rounded-full border", it.done ? "border-bj-sage bg-bj-sage text-white" : "border-bj-beige text-transparent hover:text-bj-beige")}>
                    <CheckIcon size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="sos-h">
          <h2 id="sos-h" className="bj-serif text-[1.45rem]">
            {D.sos}
          </h2>
          <p className="mb-4 text-[13.5px] text-bj-muted">{D.sosSub}</p>
          <ItemList list="sos" header={false} compact />
        </section>
      </div>
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? (edit.title ?? D.add) : D.add}
        fields={[
          { key: "time", label: t.common.time, kind: "time", required: true, half: true },
          { key: "who", label: D.who, kind: "text", half: true, list: D.people },
          { key: "title", label: t.common.name, kind: "text", required: true },
          { key: "notes", label: t.common.notes, kind: "text" },
        ]}
        initial={(edit ?? {}) as Record<string, string | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "timeline", item: { ...item, id: edit?.id ?? newId("tl"), done: edit?.done } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "timeline", id: edit.id! }) : undefined}
      />
    </div>
  );
}
