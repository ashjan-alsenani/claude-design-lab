"use client";

import { useMemo, useState } from "react";
import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import { addDays, diffDays, paymentStatus } from "../model/engine";
import type { ApptKind, Appointment, EventKey } from "../model/types";
import { AppointmentCard, PaymentCard } from "../ui/cards";
import { EntitySheet, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Button, EmptyState, IconButton, SectionHeader, Segmented, Toggle, cx } from "../ui/kit";

type Entry = { kind: "appt" | "payment" | "task" | "event"; date: string; id: string; label: string };

export function useApptFields(): FieldSpec[] {
  const { t, ws } = useBridal();
  return [
    { key: "title", label: t.common.name, kind: "text", required: true },
    { key: "kind", label: t.common.category, kind: "select", required: true, options: (Object.keys(t.calendar.kinds) as ApptKind[]).map((k) => ({ value: k, label: t.calendar.kinds[k] })) },
    { key: "date", label: t.common.date, kind: "date", required: true, half: true },
    { key: "time", label: t.common.time, kind: "time", half: true },
    { key: "place", label: t.calendar.place, kind: "text" },
    { key: "vendorId", label: t.budget.vendor, kind: "select", options: ws.vendors.map((v) => ({ value: v.id, label: v.name })) },
    { key: "done", label: t.calendar.markDone, kind: "check" },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
}

export function Calendar() {
  const { t, ws, tasks, today, lang, date, dispatch, newId, num } = useBridal();
  const C = t.calendar;
  const [view, setView] = useState<"month" | "agenda">("month");
  const [month, setMonth] = useState(today.slice(0, 7));
  const [day, setDay] = useState(today);
  const [edit, setEdit] = useState<Partial<Appointment> | null>(null);
  const fields = useApptFields();
  const p = ws.profile!;

  const entries = useMemo(() => {
    const out: Entry[] = [];
    for (const a of ws.appointments) out.push({ kind: "appt", date: a.date, id: a.id, label: a.title });
    for (const x of ws.payments) if (!x.paidOn) out.push({ kind: "payment", date: x.due, id: x.id, label: x.label });
    if (p.calendarShowsTasks) for (const x of tasks) if (x.status !== "done" && x.status !== "skip") out.push({ kind: "task", date: x.due, id: x.id, label: x.title });
    for (const [k, d] of Object.entries({ ...p.eventDates, wedding: p.weddingDate })) if (d) out.push({ kind: "event", date: d, id: k, label: t.events[k as EventKey] });
    return out;
  }, [ws, tasks, p, t]);
  const byDate = useMemo(() => {
    const m = new Map<string, Entry[]>();
    for (const e of entries) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    return m;
  }, [entries]);

  const first = `${month}-01`;
  const startDow = new Date(`${first}T00:00:00Z`).getUTCDay();
  const daysInMonth = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((startDow + daysInMonth) / 7) * 7 }, (_, i) => (i < startDow || i >= startDow + daysInMonth ? null : addDays(first, i - startDow)));
  const shift = (n: number) => {
    const d = new Date(`${first}T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() + n);
    setMonth(d.toISOString().slice(0, 7));
  };
  const dayEntries = byDate.get(day) ?? [];
  const upcoming = ws.appointments.filter((a) => a.date >= today).sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
  const agenda = [...byDate.entries()].filter(([d]) => d >= today && diffDays(today, d) <= 120).sort(([a], [b]) => a.localeCompare(b));

  const renderEntry = (e: Entry) => {
    if (e.kind === "appt") {
      const a = ws.appointments.find((x) => x.id === e.id)!;
      return <AppointmentCard a={a} onClick={() => setEdit(a)} />;
    }
    if (e.kind === "payment") return <PaymentCard pay={ws.payments.find((x) => x.id === e.id)!} compact />;
    return (
      <div className={cx("flex items-center gap-3 rounded-[16px] border px-4 py-3 text-[14.5px]", e.kind === "event" ? "border-[#e6c2b6] bg-[#fdf3f0]" : "border-bj-line bg-bj-paper")}>
        <span className={cx("size-2 rounded-full", e.kind === "event" ? "bg-bj-gold" : "bg-bj-taupe")} />
        {e.label}
        <Badge className="ms-auto">{C.legend[e.kind]}</Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={C.title}
        sub={C.sub}
        action={
          <Button onClick={() => setEdit({ date: day, kind: "fitting" })}>
            <PlusIcon size={15} />
            {C.add}
          </Button>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented label={C.title} value={view} onChange={setView} options={[{ value: "month", label: C.month }, { value: "agenda", label: C.agenda }]} />
        <div className="text-[13px]">
          <Toggle checked={p.calendarShowsTasks} onChange={(v) => dispatch({ t: "profile", patch: { calendarShowsTasks: v } })} label={C.showTasks} />
        </div>
      </div>

      {view === "month" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <section className="min-w-0 rounded-[22px] border border-bj-line bg-bj-paper p-3 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <IconButton label={C.prev} onClick={() => shift(-1)}>
                <CaretLeftIcon size={18} className="rtl:rotate-180" />
              </IconButton>
              <h2 className="bj-serif text-[1.45rem]">{date(first, "month")}</h2>
              <IconButton label={C.next} onClick={() => shift(1)}>
                <CaretRightIcon size={18} className="rtl:rotate-180" />
              </IconButton>
            </div>
            <div className="grid grid-cols-7 text-center text-[11.5px] text-bj-muted">
              {C.weekdays.map((w) => (
                <span key={w} className="py-1.5">
                  {w}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1" role="grid" aria-label={date(first, "month")}>
              {cells.map((c, i) => {
                if (!c) return <span key={i} />;
                const es = byDate.get(c) ?? [];
                const isWedding = c === p.weddingDate;
                const selected = c === day;
                return (
                  <button
                    key={c}
                    type="button"
                    role="gridcell"
                    aria-selected={selected}
                    aria-label={`${date(c, "weekday")}${es.length ? `, ${num(es.length)}` : ""}`}
                    onClick={() => setDay(c)}
                    className={cx(
                      "flex aspect-square min-w-0 flex-col items-center justify-center gap-1 rounded-[12px] text-[14px] transition-colors",
                      selected ? "bg-bj-gold-ink text-white" : isWedding ? "bg-[#f8ebe3] text-bj-gold-ink" : c === today ? "border border-bj-gold text-bj-ink" : "text-bj-ink hover:bg-bj-cream"
                    )}
                  >
                    <span className="tabular-nums">{new Intl.DateTimeFormat(lang === "ar" ? "ar-OM" : "en-GB", { day: "numeric", timeZone: "UTC" }).format(new Date(`${c}T00:00:00Z`))}</span>
                    <span className="flex h-1.5 gap-0.5">
                      {es.some((e) => e.kind === "appt") && <span className={cx("size-1.5 rounded-full", selected ? "bg-[#f4d2dc]" : "bg-bj-rose")} />}
                      {es.some((e) => e.kind === "payment") && <span className="size-1.5 rounded-full bg-bj-gold" />}
                      {es.some((e) => e.kind === "task") && <span className={cx("size-1.5 rounded-full", selected ? "bg-bj-beige" : "bg-bj-taupe/60")} />}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-bj-muted">
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-bj-rose" />{C.legend.appt}</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-bj-gold" />{C.legend.payment}</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-bj-taupe/60" />{C.legend.task}</span>
            </p>
          </section>
          <section aria-live="polite" className="min-w-0">
            <h2 className="bj-serif mb-3 text-[1.4rem]">{date(day, "weekday")}</h2>
            {dayEntries.length ? (
              <ul className="space-y-2">
                {dayEntries.map((e) => (
                  <li key={`${e.kind}-${e.id}`}>{renderEntry(e)}</li>
                ))}
              </ul>
            ) : (
              <div className="rounded-[16px] border border-dashed border-bj-beige px-4 py-6 text-center">
                <p className="text-sm text-bj-muted">{C.empty}</p>
                <Button size="sm" variant="soft" className="mt-3" onClick={() => setEdit({ date: day, kind: "fitting" })}>
                  <PlusIcon size={14} />
                  {C.add}
                </Button>
              </div>
            )}
            <h2 className="bj-serif mb-3 mt-8 text-[1.4rem]">{C.upcoming}</h2>
            {upcoming.length ? (
              <ul className="space-y-2">
                {upcoming.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <AppointmentCard a={a} onClick={() => setEdit(a)} />
                    </div>
                    <IconButton label={C.markDone} onClick={() => dispatch({ t: "put", c: "appointments", item: { ...a, done: true } })} className="border border-bj-line bg-bj-paper">
                      <CheckIcon size={16} />
                    </IconButton>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-bj-muted">{C.emptyUpcoming}</p>
            )}
          </section>
        </div>
      ) : agenda.length ? (
        <ol className="space-y-6">
          {agenda.map(([d, es]) => (
            <li key={d} className="grid gap-3 sm:grid-cols-[160px_1fr]">
              <p className="pt-2 text-[13px] text-bj-muted">
                <span className="bj-serif block text-[1.25rem] text-bj-ink">{date(d, "weekday")}</span>
              </p>
              <ul className="space-y-2">
                {es.map((e) => (
                  <li key={`${e.kind}-${e.id}`}>{renderEntry(e)}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState icon={<CalendarBlankIcon size={24} weight="regular" />} title={C.emptyUpcoming} />
      )}
      {ws.payments.some((x) => paymentStatus(x, today) === "overdue") && <span className="sr-only">{t.budget.payStatus.overdue}</span>}

      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? (edit.title ?? C.add) : C.add}
        fields={fields}
        initial={(edit ?? {}) as Record<string, string | number | boolean | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "appointments", item: { ...item, id: edit?.id ?? newId("a") } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "appointments", id: edit.id! }) : undefined}
      />
    </div>
  );
}
