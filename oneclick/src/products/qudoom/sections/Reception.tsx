"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckIcon, CoffeeIcon, EnvelopeOpenIcon, CopyIcon, PencilSimpleIcon, PlusIcon, ShareNetworkIcon, SparkleIcon, StarIcon, UsersThreeIcon, XIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { eventReadiness, favorTotal, guestsFor, hospCost, hospQty, manualLoad, slotKey, slotsOn, weekday, addDays } from "../model/engine";
import type { EventArea, Favor, FavorStatus, HospItem, ReceptionEvent, ReceptionKind, Visit, VisitGroup, VisitSettings, VisitStatus, Window } from "../model/types";
import { EntitySheet, type Draft, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Bar, Button, Card, Chips, EmptyState, Field, Fold, PageHeader, SectionTitle, Stat, TextArea, Toggle, cx, inputCls, type Tone , IdeasLink } from "../ui/kit";
import { TaskList, useAddParam } from "./Lists";
import { hospCatalog, hospFromCatalog, hospGroupOf, receptionNames, seedEvent, type HospGroup } from "../model/seed";

const lookPlaceOf: Record<ReceptionKind, string> = { hospital: "hospital", home: "entrance", family: "family", aqiqah: "aqiqah", shower: "shower", reveal: "reveal", custom: "majlis" };
const areas: EventArea[] = ["decor", "nameboard", "flowers", "sweets", "hospitality", "favors", "photo", "other"];

// ---------- Welcome plans ----------
export function EventsPage() {
  const { t, plan, dispatch, newId, lang, date, timeLabel, money, num, pct, access, can, href } = useQ();
  const [edit, setEdit] = useState<Partial<ReceptionEvent> | null>(null);
  const [adding, setAdding] = useState<Record<string, string>>({});
  useAddParam(() => setEdit({ kind: "home", checks: [] }));
  const fields: FieldSpec[] = [
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "kind", label: t.budgetT.kind, kind: "select", required: true, options: (Object.keys(receptionNames) as ReceptionKind[]).map((k) => ({ value: k, label: t.cats.reception[k] })) },
    { key: "date", label: t.common.date, kind: "date", half: true },
    { key: "time", label: t.common.time, kind: "time", half: true },
    { key: "place", label: t.reception.place, kind: "text", half: true },
    { key: "expected", label: t.reception.expected, kind: "number", half: true, min: 0, max: 5000 },
    { key: "theme", label: t.reception.theme, kind: "text" },
    ...(can("budget") ? ([{ key: "budgetMinor", label: t.reception.budget, kind: "money" }] as FieldSpec[]) : []),
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  const save = (d: Draft) => {
    if (edit?.id) return dispatch({ t: "put", c: "events", item: { ...edit, ...d } });
    const fresh = seedEvent((d.kind as ReceptionKind) ?? "custom", lang);
    return dispatch({ t: "put", c: "events", item: { ...fresh, ...d, id: newId("ev"), checks: fresh.checks } });
  };
  const putEvent = (e: ReceptionEvent) => dispatch({ t: "put", c: "events", item: e });
  const spent = (e: ReceptionEvent) =>
    plan.orders.filter((o) => o.eventId === e.id && o.status !== "cancelled").reduce((s, o) => s + o.amountMinor, 0) +
    plan.favors.filter((f) => f.eventId === e.id && !f.orderId && f.status !== "idea" && f.status !== "quote").reduce((s, f) => s + favorTotal(f), 0);
  return (
    <div className="space-y-6">
      <PageHeader title={t.reception.title} sub={t.reception.sub} icon={<StarIcon size={22} />} action={access.canEdit ? <Button onClick={() => setEdit({ kind: "home", checks: [] })}><PlusIcon size={18} /> {t.reception.add}</Button> : undefined} />
      {access.canEdit && (["shower", "reveal"] as const).some((k) => !plan.events.some((e) => e.kind === k)) && (
        <div className="rounded-[20px] bg-[var(--qd-paper)] p-4">
          <p className="text-[14px] font-bold">{lang === "ar" ? "مناسبات اختيارية قبل الولادة" : "Optional events before the birth"}</p>
          <p className="mt-0.5 text-[13px] text-[var(--qd-muted)]">{lang === "ar" ? "إذا تبينها، ضيفيها بضغطة وتجيك بقائمة تجهيز وأفكار ودعوة." : "If you'd like them, add with one tap: a checklist, ideas and an invitation come with it."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["shower", "reveal"] as const).filter((k) => !plan.events.some((e) => e.kind === k)).map((k) => (
              <Button key={k} size="sm" variant="secondary" onClick={() => dispatch({ t: "put", c: "events", item: { ...seedEvent(k, lang), id: newId("ev") } })}><PlusIcon size={16} /> {receptionNames[k][lang]}</Button>
            ))}
          </div>
        </div>
      )}
      {plan.events.length === 0 ? (
        <EmptyState icon={<StarIcon size={26} />} title={t.common.empty} sub={t.reception.sub} />
      ) : (
        plan.events.map((e) => {
          const r = eventReadiness(e, plan);
          const cost = spent(e);
          return (
            <Card key={e.id} as="section" className="overflow-hidden">
              <div className="flex flex-wrap items-start gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <Badge tone="primary">{t.cats.reception[e.kind]}</Badge>
                  <h2 className="mt-2 text-[1.3rem] font-bold">{e.name}</h2>
                  <p className="mt-1 text-[13.5px] text-[var(--qd-muted)]">{[e.date && date(e.date, "weekday"), e.time && timeLabel(e.time), e.place, e.expected !== undefined && `${num(e.expected)} ${t.visits.people}`, e.theme].filter(Boolean).join(" · ") || "—"}</p>
                  <p className="mt-2 flex flex-wrap gap-2 text-[13px] font-semibold">
                    <Link href={`${href("looks")}?place=${lookPlaceOf[e.kind]}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--qd-tint)] px-3 text-[var(--qd-primary-deep)]"><SparkleIcon size={15} weight="fill" /> {lang === "ar" ? "أفكار لشكلها" : "Ideas for the look"}</Link>
                    <Link href={href("invite")} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--qd-tint)] px-3 text-[var(--qd-primary-deep)]"><EnvelopeOpenIcon size={15} weight="fill" /> {lang === "ar" ? "صممي الدعوة" : "Design the invitation"}</Link>
                  </p>
                </div>
                {access.canEdit && <Button size="sm" variant="secondary" onClick={() => setEdit(e)}><PencilSimpleIcon size={16} /> {t.common.edit}</Button>}
              </div>
              <div className="grid gap-3 border-t border-[var(--qd-line)] px-5 py-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <p className="text-[13px] text-[var(--qd-muted)]">{t.reception.readiness}: {pct(r.pct)} ({num(r.done)}/{num(r.total)})</p>
                  <Bar className="mt-2" value={r.total ? r.done / r.total : 0} tone="sage" />
                </div>
                {can("budget") && <p className="text-[13px] text-[var(--qd-muted)]">{t.money.committed}: <b className="text-[var(--qd-ink)]">{money(cost)}</b>{e.budgetMinor !== undefined && <> / {money(e.budgetMinor)}</>}</p>}
              </div>
              <Fold title={t.reception.checklist} count={`${num(e.checks.filter((c) => c.done).length)}/${num(e.checks.length)}`} defaultOpen={false}>
                <ul className="divide-y divide-[var(--qd-line)]">
                  {e.checks.map((c) => (
                    <li key={c.id} className="flex items-center gap-2 px-3 py-1.5">
                      <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-3">
                        <input type="checkbox" checked={c.done} disabled={!access.canEdit} onChange={() => putEvent({ ...e, checks: e.checks.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)) })} className="size-5 accent-[var(--qd-sage)]" />
                        <span className={cx("text-[15px]", c.done && "line-through decoration-[var(--qd-muted)]/40")}>{c.title}</span>
                        <Badge>{t.cats.eventArea[c.area]}</Badge>
                      </label>
                      {access.canEdit && <button type="button" className="grid size-10 place-items-center rounded-full text-[var(--qd-muted)] hover:bg-[var(--qd-alert-soft)] hover:text-[var(--qd-alert)]" aria-label={`${t.common.delete}: ${c.title}`} onClick={() => putEvent({ ...e, checks: e.checks.filter((x) => x.id !== c.id) })}><XIcon size={15} /></button>}
                    </li>
                  ))}
                </ul>
                {access.canEdit && (
                  <form className="flex flex-wrap gap-2 border-t border-[var(--qd-line)] p-3" onSubmit={(ev) => { ev.preventDefault(); const title = (adding[e.id] ?? "").trim(); if (!title) return; const area = (new FormData(ev.currentTarget).get("area") as EventArea) || "other"; if (putEvent({ ...e, checks: [...e.checks, { id: newId("ck"), area, title, done: false }] })) setAdding({ ...adding, [e.id]: "" }); }}>
                    <input value={adding[e.id] ?? ""} onChange={(x) => setAdding({ ...adding, [e.id]: x.target.value })} placeholder={t.reception.addCheck} aria-label={t.reception.addCheck} maxLength={120} className={`${inputCls} min-w-0 flex-1 basis-48`} />
                    <select name="area" aria-label={t.budgetT.kind} className={`${inputCls} w-auto`} defaultValue="other">{areas.map((a) => <option key={a} value={a}>{t.cats.eventArea[a]}</option>)}</select>
                    <Button type="submit" variant="soft">{t.common.add}</Button>
                  </form>
                )}
              </Fold>
              <div className="p-4"><TaskList area="reception" eventId={e.id} title={t.reception.tasks} /></div>
            </Card>
          );
        })
      )}
      <EntitySheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? edit.name ?? "" : t.reception.add} fields={fields} initial={(edit ?? {}) as Draft} onSave={save} onDelete={edit?.id ? () => dispatch({ t: "del", c: "events", id: edit.id! }) : undefined} />
    </div>
  );
}

// ---------- Visits ----------
const vTone: Record<VisitStatus, Tone> = { waiting: "neutral", requested: "amber", confirmed: "sage", declined: "neutral", cancelled: "neutral", done: "primary" };
export function VisitsPage() {
  const { t, plan, dispatch, newId, date, timeLabel, num, access, pub, api, refreshPub, say, mode, today } = useQ();
  const [tab, setTab] = useState<"list" | "requests" | "hours" | "invite">("list");
  const [filter, setFilter] = useState<VisitStatus | "all">("all");
  const [edit, setEdit] = useState<Partial<Visit> | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  useAddParam(() => setEdit({ group: "family", people: 1, status: "confirmed" }));
  const pending = (pub?.requests ?? []).filter((r) => r.status === "pending" || r.status === "expired");
  // A visitor who cancels from her own link frees the seats in the database; mirror it in the list once.
  useEffect(() => {
    if (!access.canEdit) return;
    for (const r of pub?.requests ?? []) {
      if (r.status !== "cancelled") continue;
      const v = plan.visits.find((x) => x.requestId === r.id && x.status === "confirmed");
      if (v) dispatch({ t: "put", c: "visits", item: { ...v, status: "cancelled" } });
    }
  }, [pub, plan.visits, access.canEdit, dispatch]);
  const list = plan.visits.filter((v) => filter === "all" || v.status === filter).sort((a, b) => slotKey(a.confirmed ?? a.proposed ?? { date: "9999", time: "" }).localeCompare(slotKey(b.confirmed ?? b.proposed ?? { date: "9999", time: "" })));
  const load = manualLoad(plan);
  const over = (v: Partial<Visit>) => v.status === "confirmed" && v.confirmed && (load[slotKey(v.confirmed)] ?? 0) - (plan.visits.find((x) => x.id === v.id)?.people ?? 0) + (v.people ?? 0) > plan.visitSettings.maxPeople;
  const fields: FieldSpec[] = [
    { key: "name", label: t.pub.name, kind: "text", required: true },
    { key: "group", label: t.budgetT.kind, kind: "select", required: true, half: true, options: (["family", "friends", "colleagues", "other"] as VisitGroup[]).map((g) => ({ value: g, label: t.cats.visitGroup[g] })) },
    { key: "people", label: t.visits.people, kind: "number", required: true, half: true, min: 1, max: 100 },
    { key: "status", label: t.common.status, kind: "select", required: true, options: (["waiting", "requested", "confirmed", "declined", "cancelled", "done"] as VisitStatus[]).map((s) => ({ value: s, label: t.status.visit[s] })) },
    { key: "pDate", label: `${t.visits.proposed} · ${t.common.date}`, kind: "date", half: true },
    { key: "pTime", label: t.common.time, kind: "time", half: true },
    { key: "cDate", label: `${t.visits.confirmed} · ${t.common.date}`, kind: "date", half: true },
    { key: "cTime", label: t.common.time, kind: "time", half: true },
    { key: "contact", label: t.visits.contact, kind: "tel", hint: t.common.optional },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  const toDraft = (v: Partial<Visit>): Draft => ({ ...v, pDate: v.proposed?.date, pTime: v.proposed?.time, cDate: v.confirmed?.date, cTime: v.confirmed?.time });
  const fromDraft = (d: Draft): Partial<Visit> => {
    const { pDate, pTime, cDate, cTime, ...rest } = d as Record<string, unknown>;
    return { ...(rest as Partial<Visit>), proposed: pDate && pTime ? { date: pDate as string, time: pTime as string } : undefined, confirmed: cDate && cTime ? { date: cDate as string, time: cTime as string } : undefined };
  };
  const decide = async (id: string, decision: "approve" | "decline") => {
    setBusy(id);
    const r = await api.decideVisit(id, decision);
    setBusy(null);
    if (!r.ok) return say(r.reason === "demo" ? t.common.demoBlocked : r.reason === "full" ? t.pub.full : t.common.saveError);
    const req = pub?.requests.find((x) => x.id === id);
    if (req && decision === "approve") dispatch({ t: "put", c: "visits", item: { id: newId("vs"), name: req.name, group: "other", people: req.people, confirmed: { date: req.date, time: req.time }, status: "confirmed", requestId: req.id, notes: req.note } });
    await refreshPub();
  };
  return (
    <div className="space-y-6">
      <PageHeader title={t.visits.title} sub={t.visits.sub} icon={<UsersThreeIcon size={22} />} action={access.canEdit ? <Button onClick={() => setEdit({ group: "family", people: 1, status: "confirmed" })}><PlusIcon size={18} /> {t.visits.add}</Button> : undefined} />
      <Chips label={t.visits.title} value={tab} onChange={setTab} options={[{ value: "list" as const, label: t.visits.title, count: plan.visits.length }, { value: "requests" as const, label: t.visits.requests, count: pending.length }, ...(mode === "helper" ? [] : [{ value: "hours" as const, label: t.visits.settings }, { value: "invite" as const, label: t.visits.link }])]} />
      {tab === "list" && (
        <>
          {plan.visits.length > 6 && <Chips label={t.common.status} value={filter} onChange={setFilter} options={[{ value: "all" as const, label: t.common.all }, ...(["confirmed", "requested", "waiting", "done", "declined", "cancelled"] as VisitStatus[]).filter((s) => plan.visits.some((v) => v.status === s)).map((s) => ({ value: s, label: t.status.visit[s], count: plan.visits.filter((v) => v.status === s).length }))]} />}
          {list.length === 0 ? (
            <EmptyState icon={<UsersThreeIcon size={26} />} title={t.common.empty} />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {list.map((v) => {
                const s = v.confirmed ?? v.proposed;
                return (
                  <li key={v.id}>
                    <button type="button" onClick={() => setEdit(v)} className="qd-card flex w-full flex-col gap-1.5 rounded-[18px] p-4 text-start">
                      <span className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-[15.5px] font-semibold">{v.name}</span><Badge tone={vTone[v.status]}>{t.status.visit[v.status]}</Badge></span>
                      <span className="text-[13px] text-[var(--qd-muted)]">{[t.cats.visitGroup[v.group], `${num(v.people)} ${t.visits.people}`, s && `${date(s.date, "weekday")} · ${timeLabel(s.time)}`].filter(Boolean).join(" · ")}</span>
                      {v.status === "confirmed" && v.confirmed && v.confirmed.date <= today && access.canEdit && (
                        <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[var(--qd-tint)] px-3 py-1 text-[12.5px] font-semibold text-[var(--qd-primary-deep)]" role="button" tabIndex={0} onClick={(ev) => { ev.stopPropagation(); dispatch({ t: "put", c: "visits", item: { ...v, status: "done" } }); }}><CheckIcon size={13} /> {t.visits.markDone}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
      {tab === "requests" && (
        <section className="space-y-3">
          <p className="rounded-[14px] bg-[var(--qd-tint-2)] px-4 py-3 text-[13px] leading-relaxed text-[var(--qd-ink-soft)]">{t.visits.holdNote}</p>
          {pending.length === 0 ? (
            <p className="text-[14px] text-[var(--qd-muted)]">{t.visits.noRequests}</p>
          ) : (
            <ul className="space-y-2">
              {pending.map((r) => (
                <li key={r.id} className="qd-card flex flex-wrap items-center gap-3 rounded-[18px] p-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold">{r.name}{r.status === "expired" && <Badge>{t.pub.reqStatus.expired}</Badge>}</p>
                    <p className="text-[13px] text-[var(--qd-muted)]">{num(r.people)} {t.visits.people} · {date(r.date, "weekday")} · {timeLabel(r.time)}</p>
                    {r.note && <p className="mt-1 text-[13px]">{r.note}</p>}
                  </div>
                  {access.canEdit && (
                    <div className="flex gap-2">
                      <Button size="sm" disabled={busy === r.id} onClick={() => decide(r.id, "approve")}>{t.visits.approve}</Button>
                      <Button size="sm" variant="secondary" disabled={busy === r.id} onClick={() => decide(r.id, "decline")}>{t.visits.decline}</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {tab === "hours" && <VisitHours />}
      {tab === "invite" && <VisitInvite />}
      <EntitySheet
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.id ? edit.name ?? "" : t.visits.add}
        fields={fields}
        initial={edit ? toDraft(edit) : {}}
        extra={edit && over(edit) ? <p className="rounded-[12px] bg-[var(--qd-amber-soft)] px-3.5 py-2.5 text-[13px] text-[var(--qd-amber)]">{t.visits.max}: {num(plan.visitSettings.maxPeople)}</p> : undefined}
        onSave={(d) => dispatch({ t: "put", c: "visits", item: { ...fromDraft(d), id: edit?.id ?? newId("vs"), requestId: edit?.requestId } })}
        onDelete={edit?.id ? () => dispatch({ t: "del", c: "visits", id: edit.id! }) : undefined}
      />
    </div>
  );
}

function VisitHours() {
  const { t, plan, dispatch, num, date, today, access } = useQ();
  const s = plan.visitSettings;
  const set = (patch: Partial<VisitSettings>) => dispatch({ t: "visitSettings", patch });
  const [closed, setClosed] = useState("");
  const setDay = (d: keyof VisitSettings["week"], wins: Window[]) => set({ week: { ...s.week, [d]: wins } });
  const preview = Array.from({ length: 7 }, (_, i) => addDays(today, i + 1)).map((d) => ({ d, slots: slotsOn(d, s) }));
  return (
    <fieldset disabled={!access.canEdit} className="min-w-0 space-y-5">
      <Card className="p-4">
        <Toggle checked={s.paused} onChange={(v) => set({ paused: v })} label={t.visits.paused} />
      </Card>
      <Card className="space-y-3 p-4">
        <SectionTitle title={t.visits.week} />
        {(["0", "1", "2", "3", "4", "5", "6"] as const).map((d) => (
          <div key={d} className="flex flex-wrap items-center gap-2 border-t border-[var(--qd-line)] pt-3 first:border-0 first:pt-0">
            <span className="w-24 text-[14px] font-medium">{t.visits.weekdays[Number(d)]}</span>
            <div className="flex flex-1 flex-wrap gap-2">
              {s.week[d].length === 0 && <span className="text-[13px] text-[var(--qd-muted)]">—</span>}
              {s.week[d].map((w, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] ps-2">
                  <input type="time" dir="ltr" aria-label={`${t.visits.from} ${t.visits.weekdays[Number(d)]}`} value={w.from} onChange={(e) => setDay(d, s.week[d].map((x, j) => (j === i ? { ...x, from: e.target.value } : x)))} className="h-10 bg-transparent text-[13px]" />
                  –
                  <input type="time" dir="ltr" aria-label={`${t.visits.to} ${t.visits.weekdays[Number(d)]}`} value={w.to} onChange={(e) => setDay(d, s.week[d].map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))} className="h-10 bg-transparent text-[13px]" />
                  <button type="button" aria-label={t.common.delete} onClick={() => setDay(d, s.week[d].filter((_, j) => j !== i))} className="grid size-9 place-items-center rounded-full hover:bg-[var(--qd-alert-soft)]"><XIcon size={14} /></button>
                </span>
              ))}
            </div>
            {s.week[d].length < 4 && <Button size="sm" variant="ghost" onClick={() => setDay(d, [...s.week[d], { from: "16:00", to: "19:00" }])}><PlusIcon size={14} /> {t.visits.addWindow}</Button>}
          </div>
        ))}
      </Card>
      <Card className="grid gap-4 p-4 sm:grid-cols-3">
        <Field label={t.visits.slot} htmlFor="v-slot"><input id="v-slot" type="number" min={15} max={240} step={15} dir="ltr" className={`${inputCls} text-start`} value={s.slotMinutes} onChange={(e) => { const n = Number(e.target.value); if (n >= 15 && n <= 240) set({ slotMinutes: n }); }} /></Field>
        <Field label={t.visits.max} htmlFor="v-max"><input id="v-max" type="number" min={1} max={200} dir="ltr" className={`${inputCls} text-start`} value={s.maxPeople} onChange={(e) => { const n = Number(e.target.value); if (n >= 1 && n <= 200) set({ maxPeople: n }); }} /></Field>
        <Field label={t.visits.hold} htmlFor="v-hold"><input id="v-hold" type="number" min={1} max={168} dir="ltr" className={`${inputCls} text-start`} value={s.holdHours} onChange={(e) => { const n = Number(e.target.value); if (n >= 1 && n <= 168) set({ holdHours: n }); }} /></Field>
      </Card>
      <Card className="space-y-3 p-4">
        <SectionTitle title={t.visits.breaks} />
        <div className="flex flex-wrap gap-2">
          {s.breaks.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full border border-[var(--qd-line)] ps-2">
              <input type="time" dir="ltr" aria-label={t.visits.from} value={b.from} onChange={(e) => set({ breaks: s.breaks.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)) })} className="h-10 bg-transparent text-[13px]" />–
              <input type="time" dir="ltr" aria-label={t.visits.to} value={b.to} onChange={(e) => set({ breaks: s.breaks.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)) })} className="h-10 bg-transparent text-[13px]" />
              <button type="button" aria-label={t.common.delete} onClick={() => set({ breaks: s.breaks.filter((_, j) => j !== i) })} className="grid size-9 place-items-center rounded-full hover:bg-[var(--qd-alert-soft)]"><XIcon size={14} /></button>
            </span>
          ))}
          {s.breaks.length < 6 && <Button size="sm" variant="ghost" onClick={() => set({ breaks: [...s.breaks, { from: "18:00", to: "18:30" }] })}><PlusIcon size={14} /> {t.common.add}</Button>}
        </div>
        <SectionTitle title={t.visits.closed} />
        <div className="flex flex-wrap items-center gap-2">
          {s.closedDates.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 rounded-full bg-[var(--qd-tint-2)] ps-3 text-[13px]">{date(d, "weekday")}<button type="button" aria-label={t.common.delete} onClick={() => set({ closedDates: s.closedDates.filter((x) => x !== d) })} className="grid size-9 place-items-center rounded-full"><XIcon size={13} /></button></span>
          ))}
          <input type="date" dir="ltr" aria-label={t.visits.closedAdd} value={closed} onChange={(e) => setClosed(e.target.value)} className={`${inputCls} !h-10 w-auto`} />
          <Button size="sm" variant="soft" onClick={() => closed && !s.closedDates.includes(closed) && (set({ closedDates: [...s.closedDates, closed].sort() }), setClosed(""))}>{t.visits.closedAdd}</Button>
        </div>
      </Card>
      <Card className="p-4">
        <SectionTitle title={t.cal.upcoming} />
        <ul className="mt-3 space-y-2">
          {preview.map(({ d, slots }) => (
            <li key={d} className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="w-32 font-medium">{date(d, "weekday")}</span>
              {slots.length ? slots.map((x) => <Badge key={x} tone="primary">{x}</Badge>) : <span className="text-[var(--qd-muted)]">—</span>}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px] text-[var(--qd-muted)]">{t.visits.max}: {num(s.maxPeople)}</p>
      </Card>
    </fieldset>
  );
}

export function useLinkText(kind: "gifts" | "visits") {
  const { pub } = useQ();
  return pub?.links.find((l) => l.kind === kind && l.active)?.url;
}
function VisitInvite() {
  const { t, plan, dispatch, say, access, href } = useQ();
  const url = useLinkText("visits");
  const msg = plan.visitSettings.message;
  const full = url ? `${msg}\n${url}` : msg;
  return (
    <section className="space-y-4">
      <Card className="space-y-3 p-4">
        <Field label={t.visits.message} htmlFor="v-msg">
          <TextArea id="v-msg" defaultValue={msg} disabled={!access.canEdit} maxLength={1000} onBlur={(e) => e.target.value !== msg && dispatch({ t: "visitSettings", patch: { message: e.target.value } })} />
        </Field>
        {url ? (
          <>
            <p dir="ltr" className="truncate rounded-[12px] bg-[var(--qd-tint-2)] px-3 py-2 text-start text-[13px]">{url}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(full); say(t.common.copied); } catch {} }}><CopyIcon size={17} /> {t.common.copy}</Button>
              {typeof navigator !== "undefined" && "share" in navigator && <Button variant="secondary" onClick={() => navigator.share({ text: full }).catch(() => {})}><ShareNetworkIcon size={17} /> {t.common.share}</Button>}
            </div>
          </>
        ) : (
          <a href={href("share")} className="inline-flex h-11 items-center rounded-full bg-[var(--qd-primary)] px-5 text-sm font-semibold text-white">{t.shareT.create}</a>
        )}
      </Card>
    </section>
  );
}

// ---------- Hospitality ----------
export function HospitalityPage() {
  const { t, plan, dispatch, newId, num, money, access, can, lang } = useQ();
  const [edit, setEdit] = useState<(Partial<HospItem> & { src?: string; manual?: number }) | null>(null);
  useAddParam(() => setEdit({ kind: "custom", unit: "piece", perGuest: 1, servingsPerUnit: 1, reservePct: 10, src: "manual", manual: 10 }));
  const units = Object.keys(t.cats.unit) as HospItem["unit"][];
  const fields: FieldSpec[] = [
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "kind", label: t.budgetT.kind, kind: "select", required: true, half: true, options: (Object.keys(t.cats.hosp) as HospItem["kind"][]).map((k) => ({ value: k, label: t.cats.hosp[k] })) },
    { key: "unit", label: t.hosp.unit, kind: "select", required: true, half: true, options: units.map((u) => ({ value: u, label: t.cats.unit[u] })) },
    { key: "customUnit", label: t.hosp.unit, kind: "text", hidden: (d) => d.unit !== "custom" },
    { key: "perGuest", label: t.hosp.perGuest, kind: "number", required: true, half: true, min: 0, max: 50 },
    { key: "servingsPerUnit", label: t.hosp.perUnit, kind: "number", required: true, half: true, min: 0.01, max: 10000 },
    { key: "reservePct", label: t.hosp.reserve, kind: "number", required: true, half: true, min: 0, max: 200 },
    { key: "src", label: t.hosp.source, kind: "select", required: true, half: true, options: [{ value: "manual", label: t.hosp.manual }, ...plan.events.map((e) => ({ value: `e:${e.id}`, label: `${t.hosp.fromEvent}: ${e.name}` })), ...plan.visits.filter((v) => v.status === "confirmed").map((v) => ({ value: `v:${v.id}`, label: `${t.hosp.fromVisit}: ${v.name}` }))] },
    { key: "manual", label: t.hosp.guests, kind: "number", min: 0, max: 10000, hidden: (d) => d.src !== "manual" },
    ...(can("budget") ? ([{ key: "unitPriceMinor", label: t.hosp.unitPrice, kind: "money" }] as FieldSpec[]) : []),
    { key: "notes", label: t.common.notes, kind: "textarea" },
    { key: "dietNotes", label: t.hosp.diet, kind: "textarea" },
  ];
  const toDraft = (h: HospItem): Draft => ({ ...h, src: h.source.eventId ? `e:${h.source.eventId}` : h.source.visitId ? `v:${h.source.visitId}` : "manual", manual: h.source.manual });
  const save = (d: Draft) => {
    const { src, manual, ...rest } = d as Record<string, unknown>;
    const s = String(src ?? "manual");
    const source = s.startsWith("e:") ? { eventId: s.slice(2) } : s.startsWith("v:") ? { visitId: s.slice(2) } : { manual: Number(manual ?? 0) };
    return dispatch({ t: "put", c: "hospitality", item: { ...rest, id: edit?.id ?? newId("hs"), source } });
  };
  const totalCost = plan.hospitality.reduce((s, h) => s + (hospCost(h, hospQty(h, guestsFor(h, plan))) ?? 0), 0);
  const ar = lang === "ar";
  const [undo, setUndo] = useState<HospItem | null>(null);
  useEffect(() => {
    if (!undo) return;
    const id = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(id);
  }, [undo]);
  // One guest count for the whole list: the linked welcome plan's expected guests, or her own number.
  const setGuests = (n: number) => {
    const evIds = new Set(plan.hospitality.map((h) => h.source.eventId).filter(Boolean) as string[]);
    for (const id of evIds) { const ev = plan.events.find((e) => e.id === id); if (ev) dispatch({ t: "put", c: "events", item: { ...ev, expected: n } }); }
    for (const h of plan.hospitality) if (!h.source.eventId && !h.source.visitId) dispatch({ t: "put", c: "hospitality", item: { ...h, source: { manual: n } } });
  };
  const remove = (h: HospItem) => dispatch({ t: "del", c: "hospitality", id: h.id }) && setUndo(h);
  const have = new Set(plan.hospitality.map((h) => h.name));
  const missing = hospCatalog.filter((c) => !have.has(c.ar) && !have.has(c.en));
  const firstSource = plan.hospitality[0]?.source ?? (plan.events[0] ? { eventId: plan.events[0].id } : { manual: 10 });
  const addMissing = () => missing.forEach((c) => dispatch({ t: "put", c: "hospitality", item: { ...hospFromCatalog(c, lang, firstSource), id: newId("hs") } }));
  const groupNames: Record<HospGroup | "other", string> = ar
    ? { drinks: "المشروبات", sweets: "التمر والحلويات", savory: "الموالح", meal: "الوجبات", supplies: "الأدوات والتقديم", other: "أشياء أضفتيها" }
    : { drinks: "Drinks", sweets: "Dates & sweets", savory: "Savouries", meal: "Meals", supplies: "Serving supplies", other: "Your own additions" };
  const grouped = (["drinks", "sweets", "savory", "meal", "supplies", "other"] as const)
    .map((g) => ({ g, items: plan.hospitality.filter((h) => (hospGroupOf(h.name) ?? (h.kind === "custom" ? "other" : h.kind === "meal" ? "meal" : h.kind === "savory" ? "savory" : ["coffee", "tea", "water", "juice"].includes(h.kind) ? "drinks" : "sweets")) === g) }))
    .filter((x) => x.items.length);
  return (
    <div className="space-y-6">
      <PageHeader title={t.hosp.title} sub={ar ? "جهزنا لك كل شي ممكن تحتاجينه بالكميات. احذفي اللي ما تبينه بضغطة ✕." : "We've listed everything you might need, with amounts. Remove what you won't serve with one tap on ✕."} icon={<CoffeeIcon size={22} />} action={access.canEdit ? <Button onClick={() => setEdit({ kind: "custom", unit: "piece", perGuest: 1, servingsPerUnit: 1, reservePct: 10, src: "manual", manual: 10 })}><PlusIcon size={18} /> {t.hosp.add}</Button> : undefined} />
      {access.canEdit && missing.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-[18px] bg-[var(--qd-tint)] px-4 py-3">
          <p className="min-w-0 flex-1 text-[14px] font-semibold text-[var(--qd-primary-deep)]">{ar ? `في قائمتنا الجاهزة ${num(missing.length)} عنصر مو عندك.` : `${num(missing.length)} items from our ready list aren't in yours.`}</p>
          <Button size="sm" onClick={addMissing}><PlusIcon size={16} /> {ar ? "ضيفيهم كلهم" : "Add them all"}</Button>
        </div>
      )}
      {plan.hospitality.length > 0 && (
        <label className="flex flex-wrap items-center gap-3 rounded-[18px] bg-[var(--qd-paper)] px-4 py-3">
          <span className="min-w-0 flex-1 text-[15px] font-bold">{ar ? "كم ضيف تتوقعين؟" : "How many guests do you expect?"}<span className="block text-[12.5px] font-normal text-[var(--qd-muted)]">{ar ? "كل الكميات تتحسب من هالرقم." : "Every amount is worked out from this."}</span></span>
          <input type="number" inputMode="numeric" min={0} max={5000} value={guestsFor(plan.hospitality[0], plan) || ""} placeholder="0" disabled={!access.canEdit} onChange={(e) => setGuests(Math.max(0, Math.min(5000, Number(e.target.value) || 0)))} className={`${inputCls} w-28 text-center text-[1.2rem] font-bold`} aria-label={ar ? "عدد الضيوف" : "Guests"} />
        </label>
      )}
      <p className="rounded-[14px] bg-[var(--qd-tint-2)] px-4 py-3 text-[13px] leading-relaxed text-[var(--qd-ink-soft)]">{t.hosp.formula}</p>
      {plan.hospitality.length === 0 ? (
        <EmptyState icon={<CoffeeIcon size={26} />} title={t.common.empty} />
      ) : (
        grouped.map(({ g, items }) => (
          <section key={g} className="space-y-2.5">
            <h2 className="text-[15px] font-extrabold">{groupNames[g]} <span className="text-[13px] font-semibold text-[var(--qd-muted)]">({num(items.length)})</span></h2>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {items.map((h) => {
                const gs = guestsFor(h, plan);
                const q = hospQty(h, gs);
                const unit = h.unit === "custom" ? h.customUnit ?? t.cats.unit.custom : t.cats.unit[h.unit];
                const cost = hospCost(h, q);
                return (
                  <li key={h.id} className="qd-card flex items-stretch overflow-hidden rounded-[20px]">
                    <button type="button" onClick={() => setEdit(toDraft(h) as never)} className="flex min-w-0 flex-1 flex-col gap-1 p-3.5 text-start">
                      <span className="truncate font-semibold">{h.name}</span>
                      <span className="text-[1.35rem] font-bold tabular-nums text-[var(--qd-primary)]">{num(q)} <span className="text-[14px] font-semibold">{unit}</span></span>
                      <span className="text-[12px] text-[var(--qd-muted)]">{t.hosp.guests}: {num(gs)} · {t.hosp.perGuest}: {num(h.perGuest)} · {t.common.estimated}</span>
                      {can("budget") && cost !== undefined && <span className="text-[12.5px]">{t.hosp.cost}: <b>{money(cost)}</b></span>}
                    </button>
                    {access.canEdit && (
                      <button type="button" onClick={() => remove(h)} aria-label={ar ? `احذفي ${h.name}` : `Remove ${h.name}`} title={ar ? "احذفي" : "Remove"} className="grid w-12 shrink-0 place-items-center border-s border-[var(--qd-line)] text-[var(--qd-muted)] hover:bg-[var(--qd-alert-soft)] hover:text-[var(--qd-alert)]">
                        <XIcon size={18} weight="bold" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
      {can("budget") && totalCost > 0 && <Stat label={`${t.hosp.cost} · ${t.money.total}`} value={money(totalCost)} sub={t.common.estimated} />}
      {undo && (
        <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 lg:bottom-8">
          <p className="qd-pop flex items-center gap-3 rounded-full bg-[var(--qd-ink)] py-2 pe-2 ps-5 text-[14px] text-white shadow-lg">
            {ar ? `انحذف: ${undo.name}` : `Removed: ${undo.name}`}
            <button type="button" onClick={() => (dispatch({ t: "put", c: "hospitality", item: undo }), setUndo(null))} className="rounded-full bg-white/15 px-3 py-1 font-semibold hover:bg-white/25">{ar ? "تراجع" : "Undo"}</button>
          </p>
        </div>
      )}
      <EntitySheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? edit.name ?? "" : t.hosp.add} fields={fields} initial={(edit ?? {}) as Draft} onSave={save} onDelete={edit?.id ? () => dispatch({ t: "del", c: "hospitality", id: edit.id! }) : undefined} />
    </div>
  );
}

// ---------- Favors ----------
const fTone: Record<FavorStatus, Tone> = { idea: "neutral", quote: "amber", sample: "lilac", approved: "primary", making: "accent", ready: "sage", received: "sage" };
export function FavorsPage() {
  const { t, plan, dispatch, newId, num, money, date, access, can, href, lang } = useQ();
  const [edit, setEdit] = useState<Partial<Favor> | null>(null);
  useAddParam(() => setEdit(blank()));
  const blank = (): Partial<Favor> => ({ status: "idea", qtyBase: 0, qtyExtra: 0, unitMinor: 0, feesMinor: 0, depositMinor: 0, qtyReceived: 0, qtyGiven: 0, babyName: plan.profile?.babyName });
  const fields: FieldSpec[] = [
    { key: "type", label: t.favorsT.type, kind: "text", required: true },
    { key: "status", label: t.common.status, kind: "select", required: true, half: true, options: (Object.keys(t.status.favor) as FavorStatus[]).map((s) => ({ value: s, label: t.status.favor[s] })) },
    { key: "eventId", label: t.favorsT.event, kind: "select", half: true, options: plan.events.map((e) => ({ value: e.id, label: e.name })) },
    { key: "vendor", label: t.favorsT.vendor, kind: "text", half: true },
    { key: "contact", label: t.favorsT.contact, kind: "text", half: true },
    { key: "printedText", label: t.favorsT.printed, kind: "text" },
    { key: "babyName", label: t.favorsT.baby, kind: "text", half: true },
    { key: "deliveryDate", label: t.favorsT.delivery, kind: "date", half: true },
    { key: "qtyBase", label: t.favorsT.base, kind: "number", required: true, half: true, min: 0, max: 10000 },
    { key: "qtyExtra", label: t.favorsT.extra, kind: "number", required: true, half: true, min: 0, max: 10000 },
    ...(can("budget") ? ([
      { key: "unitMinor", label: t.favorsT.unit, kind: "money", required: true, half: true },
      { key: "feesMinor", label: t.favorsT.fees, kind: "money", required: true, half: true },
      { key: "depositMinor", label: t.favorsT.deposit, kind: "money", required: true, half: true },
      { key: "orderId", label: t.prep.fields.linkOrder, kind: "select", half: true, options: plan.orders.filter((o) => o.status !== "cancelled").map((o) => ({ value: o.id, label: o.title })), hint: t.favorsT.linkedOrder },
    ] as FieldSpec[]) : []),
    { key: "sampleApprovedOn", label: t.favorsT.approvedOn, kind: "date", half: true },
    { key: "qtyReceived", label: t.favorsT.gotQty, kind: "number", required: true, half: true, min: 0, max: 20000 },
    { key: "qtyGiven", label: t.favorsT.given, kind: "number", required: true, half: true, min: 0, max: 20000 },
    { key: "inspirationFileId", label: t.favorsT.inspiration, kind: "file", board: "favors" },
    { key: "sampleFileId", label: t.favorsT.sample, kind: "file", board: "favors" },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={t.favorsT.title} sub={t.favorsT.sub} icon={<SparkleIcon size={22} />} action={access.canEdit ? <Button onClick={() => setEdit(blank())}><PlusIcon size={18} /> {t.favorsT.add}</Button> : undefined} />
      {access.canEdit && <IdeasLink href={href("ideas")} label={lang === "ar" ? "أفكار توزيعات جاهزة، أضيفيها بضغطة" : "Ready favor ideas, add with one tap"} />}
      {plan.favors.length === 0 ? (
        <EmptyState icon={<SparkleIcon size={26} />} title={t.common.empty} />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {plan.favors.map((f) => {
            const total = favorTotal(f);
            const orderPaid = f.orderId ? plan.payments.filter((p) => p.orderId === f.orderId && p.paidOn).reduce((s, p) => s + p.amountMinor, 0) : f.depositMinor;
            const qty = f.qtyBase + f.qtyExtra;
            const step = (k: "qtyReceived" | "qtyGiven", d: number) => dispatch({ t: "put", c: "favors", item: { ...f, [k]: Math.max(0, f[k] + d) } });
            return (
              <li key={f.id} className="qd-card min-w-0 rounded-[22px] p-4">
                <button type="button" onClick={() => setEdit(f)} className="w-full text-start">
                  <span className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-[16px] font-semibold">{f.type}</span><Badge tone={fTone[f.status]}>{t.status.favor[f.status]}</Badge></span>
                  <span className="mt-1 block text-[13px] text-[var(--qd-muted)]">{[f.vendor, f.deliveryDate && `${t.favorsT.delivery}: ${date(f.deliveryDate)}`, f.eventId && plan.events.find((e) => e.id === f.eventId)?.name].filter(Boolean).join(" · ") || "—"}</span>
                  {f.printedText && <span className="mt-1 block text-[13px]">“{f.printedText}”</span>}
                </button>
                {can("budget") && (
                  <div className="mt-3 grid grid-cols-3 gap-2 [&>*]:min-w-0">
                    <Stat label={t.money.total} value={money(total)} />
                    <Stat label={f.orderId ? t.money.paid : t.money.deposit} value={money(orderPaid)} tone="sage" />
                    <Stat label={t.money.remaining} value={money(Math.max(0, total - orderPaid))} />
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[12.5px]">
                  {([["qtyReceived", t.favorsT.gotQty], ["qtyGiven", t.favorsT.given]] as const).map(([k, l]) => (
                    <div key={k} className="min-w-0 rounded-[14px] bg-[var(--qd-tint-2)] p-2">
                      <p className="text-[var(--qd-muted)]">{l}</p>
                      <div className="mt-1 flex items-center justify-center gap-1">
                        {access.canEdit && <button type="button" aria-label={`− ${l}`} onClick={() => step(k, -1)} className="grid size-9 place-items-center rounded-full bg-[var(--qd-paper)]">−</button>}
                        <span className="min-w-8 font-bold tabular-nums">{num(f[k])}</span>
                        {access.canEdit && <button type="button" aria-label={`+ ${l}`} onClick={() => step(k, 1)} className="grid size-9 place-items-center rounded-full bg-[var(--qd-paper)]">+</button>}
                      </div>
                    </div>
                  ))}
                  <p className="col-span-2 text-[13px] text-[var(--qd-muted)]">{t.favorsT.leftQty}: <b className="tabular-nums text-[var(--qd-ink)]">{num(Math.max(0, f.qtyReceived - f.qtyGiven))} / {num(qty)}</b></p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <EntitySheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? edit.type ?? "" : t.favorsT.add} fields={fields} initial={(edit ?? {}) as Draft} onSave={(d) => dispatch({ t: "put", c: "favors", item: { ...blank(), ...d, id: edit?.id ?? newId("fv") } })} onDelete={edit?.id ? () => dispatch({ t: "del", c: "favors", id: edit.id! }) : undefined} />
    </div>
  );
}
