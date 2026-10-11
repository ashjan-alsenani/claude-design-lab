"use client";

import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, BagIcon, BedIcon, CalendarPlusIcon, HandHeartIcon, PlusIcon, PrinterIcon, TrashIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { bagProgress, progress } from "../model/engine";
import type { Appointment, BagId, BagItem, FileMeta, HelpRow } from "../model/types";
import { EntitySheet, FileInput, type Draft, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Bar, Button, Card, ChoiceCard, Chips, EmptyState, Field, PageHeader, SectionTitle, Segmented, TextArea, Toggle, cx, inputCls, useConfirm } from "../ui/kit";
import { ItemList, TaskList, useAddParam } from "./Lists";

export function ItemsPage() {
  const { t, plan, pct } = useQ();
  const part = progress(plan).parts.find((p) => p.key === "baby");
  return (
    <div className="space-y-6">
      <PageHeader title={t.prep.title} sub={t.prep.sub} action={part && part.total > 0 ? <Badge tone="primary">{pct(Math.round((part.done / part.total) * 100))} {t.prep.ready}</Badge> : undefined} />
      <ItemList area="baby" autoAdd />
    </div>
  );
}

// ---------- Hospital bag ----------
const bags: BagId[] = ["mother", "baby", "companion", "docs"];
export function BagPage() {
  const { t, plan, dispatch, newId, num, access, lang } = useQ();
  const [bag, setBag] = useState<BagId>("mother");
  const [notPacked, setNotPacked] = useState(false);
  const [edit, setEdit] = useState<Partial<BagItem> | null>(null);
  useAddParam(() => setEdit({ bag, qty: 1, provided: false, packed: false }));
  const list = plan.bag.filter((b) => b.bag === bag && (!notPacked || (!b.packed && !b.skip)));
  const pr = bagProgress(plan, bag);
  const fields: FieldSpec[] = [
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "bag", label: t.nav.bag, kind: "select", required: true, half: true, options: bags.map((b) => ({ value: b, label: t.cats.bag[b] })) },
    { key: "qty", label: t.common.qty, kind: "number", required: true, half: true, min: 0, max: 99 },
    { key: "provided", label: t.bag.provided, kind: "check", half: true },
    { key: "packed", label: t.bag.packed, kind: "check", half: true },
    { key: "skip", label: t.common.skip, kind: "check" },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  const set = (b: BagItem, patch: Partial<BagItem>) => dispatch({ t: "put", c: "bag", item: { ...b, ...patch, ...(patch.packed ? { provided: true } : {}) } });
  return (
    <div className="space-y-6">
      <PageHeader title={t.bag.title} sub={t.bag.sub} icon={<BagIcon size={22} />} action={<Button variant="secondary" onClick={() => window.print()} className="qd-noprint"><PrinterIcon size={18} /> {t.common.print}</Button>} />
      <div className="qd-noprint grid grid-cols-2 gap-3 sm:grid-cols-4">
        {bags.map((b) => {
          const p = bagProgress(plan, b);
          return (
            <button key={b} type="button" aria-pressed={bag === b} onClick={() => setBag(b)} className={cx("rounded-[18px] border p-3.5 text-start transition-colors", bag === b ? "border-[var(--qd-primary)] bg-[var(--qd-tint-2)]" : "border-[var(--qd-line)] bg-[var(--qd-paper)]")}>
              <span className="block text-[14px] font-semibold">{t.cats.bag[b]}</span>
              <span className="mt-0.5 block text-[12.5px] text-[var(--qd-muted)]">{num(p.packed)}/{num(p.total)} {t.bag.packed}</span>
              <Bar className="mt-2" value={p.total ? p.packed / p.total : 0} tone="sage" />
            </button>
          );
        })}
      </div>
      <div className="qd-noprint flex flex-wrap items-center gap-3">
        <p className="text-[13.5px] text-[var(--qd-muted)]">{t.bag.provided}: {num(pr.provided)}/{num(pr.total)} · {t.bag.packed}: {num(pr.packed)}/{num(pr.total)}</p>
        <span className="flex-1" />
        <div className="min-w-48"><Toggle checked={notPacked} onChange={setNotPacked} label={t.bag.notPacked} /></div>
        {access.canEdit && <Button onClick={() => setEdit({ bag, qty: 1, provided: false, packed: false })}><PlusIcon size={18} /> {t.common.add}</Button>}
      </div>
      <div className="qd-noprint">
        {list.length === 0 ? (
          <EmptyState icon={<BagIcon size={26} />} title={t.common.empty} />
        ) : (
          <ul className="qd-card divide-y divide-[var(--qd-line)] rounded-[20px]">
            {list.map((b) => (
              <li key={b.id} className={cx("flex flex-wrap items-center gap-2 px-4 py-3", b.skip && "opacity-55")}>
                <button type="button" onClick={() => setEdit(b)} className="min-h-11 min-w-0 flex-1 basis-40 text-start">
                  <span className="block text-[15px]">{b.name}{b.qty > 1 ? ` ×${num(b.qty)}` : ""}</span>
                  {b.notes && <span className="block truncate text-[12.5px] text-[var(--qd-muted)]">{b.notes}</span>}
                </button>
                <label className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--qd-line)] px-3.5 text-[13.5px]">
                  <input type="checkbox" checked={b.provided || b.packed} disabled={!access.canEdit || b.packed} onChange={(e) => set(b, { provided: e.target.checked })} className="size-5 accent-[var(--qd-primary)]" />
                  {t.bag.provided}
                </label>
                <label className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--qd-line)] px-3.5 text-[13.5px]">
                  <input type="checkbox" checked={b.packed} disabled={!access.canEdit} onChange={(e) => set(b, { packed: e.target.checked })} className="size-5 accent-[var(--qd-sage)]" />
                  {t.bag.packed}
                </label>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--qd-muted)]">{t.bag.hospitalNote}</p>
      </div>

      {/* Print / PDF: all four bags, Arabic or English, no clipping (lines wrap, groups never split) */}
      <div className="hidden print:block" dir={lang === "ar" ? "rtl" : "ltr"}>
        <h1 className="mb-1 text-2xl font-bold">{t.bag.printTitle}</h1>
        <p className="mb-5 text-sm text-gray-600">{t.brand}{plan.profile?.babyName ? ` · ${plan.profile.babyName}` : ""}</p>
        {bags.map((b) => {
          const items = plan.bag.filter((x) => x.bag === b && !x.skip);
          if (!items.length) return null;
          return (
            <section key={b} className="qd-print mb-5 break-inside-avoid">
              <h2 className="mb-2 border-b pb-1 text-lg font-bold">{t.cats.bag[b]}</h2>
              <ul className="space-y-1.5 text-[14px]">
                {items.map((x) => (
                  <li key={x.id} className="flex items-start gap-2 break-inside-avoid">
                    <span className="mt-0.5 inline-block size-4 shrink-0 border border-gray-500">{x.packed ? "✓" : ""}</span>
                    <span className="min-w-0 break-words">{x.name}{x.qty > 1 ? ` ×${x.qty}` : ""}{x.notes ? ` — ${x.notes}` : ""}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? edit.name ?? "" : t.common.add}
        fields={fields}
        initial={(edit ?? {}) as Draft}
        onSave={(d) => dispatch({ t: "put", c: "bag", item: { ...d, id: edit?.id ?? newId("bg"), provided: !!d.provided || !!d.packed } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "bag", id: edit.id! }) : undefined}
      />
    </div>
  );
}

// ---------- Nursery (room or corner) ----------
export function NurseryPage() {
  const { t, plan, dispatch, access } = useQ();
  const kind = plan.profile!.nurseryKind;
  return (
    <div className="space-y-7">
      <PageHeader title={kind === "corner" ? t.nursery.titleCorner : t.nursery.title} sub={t.nursery.sub} icon={<BedIcon size={22} />} action={access.canEdit ? <Segmented label={t.nursery.kind} value={kind} onChange={(v) => dispatch({ t: "profile", patch: { nurseryKind: v } })} options={[{ value: "room", label: t.nursery.room }, { value: "corner", label: t.nursery.corner }]} /> : undefined} />
      <section className="space-y-3">
        <SectionTitle title={t.nursery.items} />
        <ItemList area="nursery" />
      </section>
      <TaskList area="nursery" title={t.nursery.tasks} />
      <Board board="nursery" title={t.nursery.board} sub={t.nursery.boardSub} />
    </div>
  );
}

/** Inspiration board: private photos with captions; add, caption, reorder, delete. */
export function Board({ board, title, sub }: { board: FileMeta["board"]; title: string; sub?: string }) {
  const { t, plan, dispatch, api, access } = useQ();
  const confirm = useConfirm();
  const [adding, setAdding] = useState(false);
  const files = plan.files.filter((f) => f.board === board).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= files.length) return;
    const a = files[i], b = files[j];
    dispatch({ t: "put", c: "files", item: { ...a, order: j } });
    dispatch({ t: "put", c: "files", item: { ...b, order: i } });
  };
  return (
    <section className="space-y-3">
      <SectionTitle title={title} sub={sub} action={access.canEdit ? <Button size="sm" variant="soft" onClick={() => setAdding(true)}><PlusIcon size={16} /> {t.common.addPhoto}</Button> : undefined} />
      {adding && (
        <Card className="p-4">
          <FileInput label={t.common.photo} board={board} onChange={(id) => { if (id) { const f = plan.files.find((x) => x.id === id); if (f) dispatch({ t: "put", c: "files", item: { ...f, order: files.length } }); } setAdding(false); }} />
        </Card>
      )}
      {files.length === 0 && !adding ? (
        <p className="rounded-[16px] bg-[var(--qd-paper)] px-4 py-3 text-[14px] text-[var(--qd-muted)]">{t.common.empty}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((f, i) => (
            <li key={f.id} className="qd-card overflow-hidden rounded-[18px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={api.fileUrl(f.id)} alt={f.caption ?? ""} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <div className="p-2.5">
                <input aria-label={t.nursery.caption} placeholder={t.nursery.caption} defaultValue={f.caption ?? ""} disabled={!access.canEdit} maxLength={200} onBlur={(e) => e.target.value !== (f.caption ?? "") && dispatch({ t: "put", c: "files", item: { ...f, caption: e.target.value || undefined } })} className={`${inputCls} !h-10 text-[13.5px]`} />
                {access.canEdit && (
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex">
                      <button type="button" className="grid size-10 place-items-center rounded-full hover:bg-[var(--qd-tint-2)]" onClick={() => move(i, -1)} aria-label={t.memoriesT.up}><ArrowUpIcon size={16} /></button>
                      <button type="button" className="grid size-10 place-items-center rounded-full hover:bg-[var(--qd-tint-2)]" onClick={() => move(i, 1)} aria-label={t.memoriesT.down}><ArrowDownIcon size={16} /></button>
                    </div>
                    <button type="button" className="grid size-10 place-items-center rounded-full text-[var(--qd-alert)] hover:bg-[var(--qd-alert-soft)]" aria-label={t.common.delete} onClick={() => confirm.ask(t.common.confirmDelete, () => { void api.deleteFile(f.id); dispatch({ t: "del", c: "files", id: f.id }); })}>
                      <TrashIcon size={16} />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {confirm.node(t.common.delete, t.common.cancel)}
    </section>
  );
}

// ---------- Mother & postpartum ----------
export function MotherPage() {
  const { t, plan, dispatch, newId, num, access, date, timeLabel, can } = useQ();
  const [edit, setEdit] = useState<Partial<HelpRow> | null>(null);
  const [appt, setAppt] = useState<Partial<Appointment> | null>(null);
  const [view, setView] = useState<"items" | "help" | "appts">("help");
  useAddParam(() => setEdit({ day: 1, kind: "meals", status: "todo" }));
  const days = plan.help.days;
  const rows = plan.helpRows.filter((r) => r.day <= days).sort((a, b) => a.day - b.day || (a.time ?? "").localeCompare(b.time ?? ""));
  const byDay = [...new Set(rows.map((r) => r.day))];
  const dayLabel = (d: number) => (plan.help.start ? `${t.mother.day} ${num(d)} · ${date(new Date(Date.parse(`${plan.help.start}T00:00:00Z`) + (d - 1) * 86_400_000).toISOString().slice(0, 10), "weekday")}` : `${t.mother.day} ${num(d)}`);
  const helpFields: FieldSpec[] = [
    { key: "title", label: t.common.name, kind: "text", required: true },
    { key: "kind", label: t.budgetT.kind, kind: "select", required: true, half: true, options: (["meals", "home", "family", "kids", "helper", "other"] as const).map((k) => ({ value: k, label: t.cats.help[k] })) },
    { key: "owner", label: t.common.owner, kind: "text", half: true },
    { key: "day", label: t.mother.day, kind: "number", required: true, half: true, min: 1, max: 120 },
    { key: "time", label: t.common.time, kind: "time", half: true },
    { key: "status", label: t.common.status, kind: "select", required: true, options: (["todo", "done", "skip"] as const).map((s) => ({ value: s, label: t.status.task[s] })) },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  const apptFields: FieldSpec[] = [
    { key: "title", label: t.common.name, kind: "text", required: true },
    { key: "kind", label: t.budgetT.kind, kind: "select", required: true, options: (["medical", "personal", "other"] as const).map((k) => ({ value: k, label: t.cats.appt[k] })) },
    { key: "date", label: t.common.date, kind: "date", required: true, half: true },
    { key: "time", label: t.common.time, kind: "time", half: true },
    { key: "place", label: t.reception.place, kind: "text" },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={t.mother.title} sub={t.mother.sub} icon={<HandHeartIcon size={22} />} />
      <Chips label={t.mother.title} value={view} onChange={setView} options={[{ value: "help" as const, label: t.mother.help }, { value: "items" as const, label: t.mother.items }, { value: "appts" as const, label: t.mother.appts }]} />
      {view === "items" && <ItemList area="mother" />}
      {view === "help" && (
        <section className="space-y-4">
          <Card className="grid gap-4 p-4 sm:grid-cols-2">
            <Field label={t.mother.helpDays} htmlFor="q-days">
              <input id="q-days" type="number" min={1} max={120} dir="ltr" className={`${inputCls} text-start`} value={days} disabled={!access.canEdit} onChange={(e) => { const n = Math.round(Number(e.target.value)); if (n >= 1 && n <= 120) dispatch({ t: "help", patch: { days: n } }); }} />
            </Field>
            <Field label={t.mother.helpStart} htmlFor="q-start" hint={t.common.optional}>
              <input id="q-start" type="date" dir="ltr" className={`${inputCls} text-start`} value={plan.help.start ?? ""} disabled={!access.canEdit} onChange={(e) => dispatch({ t: "help", patch: { start: e.target.value } })} />
            </Field>
          </Card>
          <div className="flex justify-end">{access.canEdit && <Button onClick={() => setEdit({ day: 1, kind: "meals", status: "todo" })}><PlusIcon size={18} /> {t.mother.row}</Button>}</div>
          {byDay.length === 0 ? (
            <EmptyState icon={<HandHeartIcon size={26} />} title={t.common.empty} />
          ) : (
            byDay.map((d) => (
              <section key={d} className="space-y-2">
                <h3 className="text-[14px] font-semibold text-[var(--qd-ink-soft)]">{dayLabel(d)}</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {rows.filter((r) => r.day === d).map((r) => (
                    <li key={r.id}>
                      <button type="button" onClick={() => setEdit(r)} className={cx("qd-card flex w-full items-start gap-3 rounded-[18px] p-3.5 text-start", r.status === "skip" && "opacity-55")}>
                        <span className={cx("mt-1 size-2.5 shrink-0 rounded-full", r.status === "done" ? "bg-[var(--qd-sage)]" : "bg-[var(--qd-accent)]")} />
                        <span className="min-w-0 flex-1">
                          <span className={cx("block text-[15px]", r.status === "done" && "line-through decoration-[var(--qd-muted)]/40")}>{r.title}</span>
                          <span className="mt-0.5 block text-[12.5px] text-[var(--qd-muted)]">{[t.cats.help[r.kind], r.owner, r.time && timeLabel(r.time), t.status.task[r.status]].filter(Boolean).join(" · ")}</span>
                          {r.notes && <span className="mt-1 block text-[12.5px] text-[var(--qd-ink-soft)]">{r.notes}</span>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </section>
      )}
      {view === "appts" && (
        <section className="space-y-3">
          <p className="rounded-[14px] bg-[var(--qd-tint-2)] px-4 py-3 text-[13px] leading-relaxed text-[var(--qd-ink-soft)]">{t.mother.apptNote}</p>
          <div className="flex justify-end">{access.canEdit && <Button onClick={() => setAppt({ kind: "medical" })}><CalendarPlusIcon size={18} /> {t.cal.add}</Button>}</div>
          {plan.appointments.length === 0 ? (
            <p className="text-[14px] text-[var(--qd-muted)]">{t.common.empty}</p>
          ) : (
            <ul className="qd-card divide-y divide-[var(--qd-line)] rounded-[20px]">
              {[...plan.appointments].sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? ""))).map((a) => (
                <li key={a.id}>
                  <button type="button" onClick={() => setAppt(a)} className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-start">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px]">{a.title}</span>
                      <span className="block text-[12.5px] text-[var(--qd-muted)]">{[t.cats.appt[a.kind], date(a.date, "weekday"), a.time && timeLabel(a.time), a.place].filter(Boolean).join(" · ")}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {can("mother") && <TaskList area="mother" title={t.mother.tasks} />}
      <EntitySheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? edit.title ?? "" : t.mother.row} fields={helpFields} initial={(edit ?? {}) as Draft} onSave={(d) => dispatch({ t: "put", c: "helpRows", item: { ...d, id: edit?.id ?? newId("hp") } })} onDelete={edit?.id ? () => dispatch({ t: "del", c: "helpRows", id: edit.id! }) : undefined} />
      <EntitySheet open={!!appt} onClose={() => setAppt(null)} title={appt?.id ? appt.title ?? "" : t.cal.add} fields={apptFields} initial={(appt ?? {}) as Draft} onSave={(d) => dispatch({ t: "put", c: "appointments", item: { ...d, id: appt?.id ?? newId("ap") } })} onDelete={appt?.id ? () => dispatch({ t: "del", c: "appointments", id: appt.id! }) : undefined} />
    </div>
  );
}

export function NoteBox({ value, onSave, label }: { value?: string; onSave: (v: string) => void; label: string }) {
  const { access } = useQ();
  return <TextArea aria-label={label} defaultValue={value ?? ""} disabled={!access.canEdit} onBlur={(e) => e.target.value !== (value ?? "") && onSave(e.target.value)} />;
}
export { ChoiceCard };
