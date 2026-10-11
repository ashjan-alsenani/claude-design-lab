"use client";

import { useState } from "react";
import { CalendarHeartIcon, DownloadSimpleIcon, PlusIcon, ReceiptIcon, StorefrontIcon, WalletIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { budget, calendar, ics, orderPaid, parseMoney, toMajor, toMinor, type CalEntry } from "../model/engine";
import { budgetCats, type Appointment, type BudgetCat, type Currency, type Order, type OrderStatus, type Payment, type Vendor } from "../model/types";
import { EntitySheet, type Draft, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Bar, Button, Card, Chips, EmptyState, PageHeader, SectionTitle, Stat, cx, inputCls, type Tone } from "../ui/kit";
import { useAddParam } from "./Lists";
import { currencies } from "./Setup";

const oTone: Record<OrderStatus, Tone> = { quoted: "neutral", ordered: "primary", shipped: "amber", received: "sage", cancelled: "neutral" };

export function BudgetPage() {
  const { t, plan, dispatch, newId, money, date, access, currency } = useQ();
  const [tab, setTab] = useState<"overview" | "orders" | "payments" | "vendors">("overview");
  const [order, setOrder] = useState<Partial<Order> | null>(null);
  const [pay, setPay] = useState<Partial<Payment> | null>(null);
  const [vendor, setVendor] = useState<Partial<Vendor> | null>(null);
  useAddParam(() => (setTab("orders"), setOrder({ cat: "baby", status: "ordered" })));
  const b = budget(plan);
  const rowsByCat = new Map(b.rows.map((r) => [r.cat, r]));
  const orderFields: FieldSpec[] = [
    { key: "title", label: t.common.name, kind: "text", required: true },
    { key: "cat", label: t.budgetT.kind, kind: "select", required: true, half: true, options: budgetCats.map((c) => ({ value: c, label: t.cats.budget[c] })) },
    { key: "status", label: t.common.status, kind: "select", required: true, half: true, options: (Object.keys(t.status.order) as OrderStatus[]).map((s) => ({ value: s, label: t.status.order[s] })) },
    { key: "vendorId", label: t.budgetT.vendors, kind: "select", half: true, options: plan.vendors.map((v) => ({ value: v.id, label: v.name })) },
    { key: "ref", label: t.budgetT.ref, kind: "text", half: true },
    { key: "orderDate", label: t.budgetT.orderDate, kind: "date", half: true },
    { key: "deliveryDate", label: t.budgetT.delivery, kind: "date", half: true },
    { key: "fx", label: t.budgetT.foreign, kind: "check" },
    { key: "fxCurrency", label: t.settings.currency, kind: "select", half: true, options: currencies.filter((c) => c !== currency).map((c) => ({ value: c, label: c })), hidden: (d) => !d.fx },
    { key: "fxAmount", label: t.budgetT.foreignAmount, kind: "text", half: true, hidden: (d) => !d.fx },
    { key: "fxRate", label: t.budgetT.rate, kind: "text", half: true, hint: `1 → ${currency}`, hidden: (d) => !d.fx },
    { key: "amountMinor", label: `${t.budgetT.amount} (${currency})`, kind: "money", hint: t.budgetT.noFx },
    { key: "eventId", label: t.favorsT.event, kind: "select", options: plan.events.map((e) => ({ value: e.id, label: e.name })) },
    { key: "receiptFileId", label: t.budgetT.receipt, kind: "file", board: "receipts", accept: "image/jpeg,image/png,image/webp,application/pdf" },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  const orderDraft = (o: Partial<Order>): Draft => ({ ...o, fx: !!o.foreign, fxCurrency: o.foreign?.currency, fxAmount: o.foreign ? String(toMajor(o.foreign.amountMinor, o.foreign.currency)) : undefined, fxRate: o.foreign ? String(o.foreign.rate) : undefined });
  const saveOrder = (d: Draft) => {
    const { fx, fxCurrency, fxAmount, fxRate, ...rest } = d as Record<string, unknown>;
    let amountMinor = rest.amountMinor as number | undefined;
    let foreign: Order["foreign"];
    if (fx && fxCurrency && fxAmount) {
      const fc = fxCurrency as Currency;
      const fa = parseMoney(String(fxAmount), fc);
      const rate = Number(String(fxRate ?? "").replace(",", "."));
      if (fa === undefined || !(rate > 0)) return false;
      foreign = { currency: fc, amountMinor: fa, rate };
      if (amountMinor === undefined) amountMinor = toMinor(toMajor(fa, fc) * rate, currency); // converted only with the rate she typed
    }
    if (amountMinor === undefined) return false;
    return dispatch({ t: "put", c: "orders", item: { ...rest, amountMinor, foreign, id: order?.id ?? newId("or") } });
  };
  const payFields: FieldSpec[] = [
    { key: "label", label: t.common.name, kind: "text", required: true },
    { key: "amountMinor", label: t.budgetT.amount, kind: "money", required: true, half: true },
    { key: "orderId", label: t.budgetT.orders, kind: "select", half: true, options: plan.orders.map((o) => ({ value: o.id, label: o.title })) },
    { key: "due", label: t.budgetT.due, kind: "date", half: true },
    { key: "paidOn", label: t.budgetT.paidOn, kind: "date", half: true, hint: t.budgetT.unpaid },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  const vendorFields: FieldSpec[] = [
    { key: "name", label: t.common.name, kind: "text", required: true },
    { key: "kind", label: t.budgetT.kind, kind: "text", required: true, half: true },
    { key: "contact", label: t.favorsT.contact, kind: "text", half: true },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];
  const maxBar = Math.max(1, ...budgetCats.map((c) => Math.max(rowsByCat.get(c)?.planned ?? 0, rowsByCat.get(c)?.committed ?? 0)));
  return (
    <div className="space-y-6">
      <PageHeader title={t.budgetT.title} sub={t.budgetT.sub} icon={<WalletIcon size={22} />} action={access.canEdit ? <Button onClick={() => (setTab("orders"), setOrder({ cat: "baby", status: "ordered" }))}><PlusIcon size={18} /> {t.budgetT.addOrder}</Button> : undefined} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label={t.money.planned} value={b.planned ? money(b.planned) : "—"} />
        <Stat label={t.money.committed} value={money(b.committed)} />
        <Stat label={t.money.paid} value={money(b.paid)} tone="sage" />
        <Stat label={t.money.toPay} value={money(b.toPay)} />
        <Stat label={t.money.left} value={b.planned ? money(b.left) : "—"} tone={b.over ? "alert" : undefined} />
      </div>
      {b.over && <p role="status" className="rounded-[14px] bg-[var(--qd-amber-soft)] px-4 py-3 text-[13.5px] text-[var(--qd-amber)]">{t.money.over}</p>}
      <Chips label={t.budgetT.title} value={tab} onChange={setTab} options={[{ value: "overview" as const, label: t.money.planned }, { value: "orders" as const, label: t.budgetT.orders, count: plan.orders.length }, { value: "payments" as const, label: t.budgetT.payments, count: plan.payments.length }, { value: "vendors" as const, label: t.budgetT.vendors, count: plan.vendors.length }]} />
      {tab === "overview" && (
        <Card className="p-4 sm:p-5">
          <ul className="space-y-4">
            {budgetCats.map((c) => {
              const r = rowsByCat.get(c) ?? { planned: plan.budget[c] ?? 0, committed: 0, paid: 0, toPay: 0, left: 0 };
              return (
                <li key={c} className="grid gap-2 sm:grid-cols-[10rem_1fr_9rem] sm:items-center">
                  <span className="text-[14px] font-medium">{t.cats.budget[c]}</span>
                  <div>
                    <div className="h-2.5 rounded-full bg-[var(--qd-tint)]" style={{ width: `${(r.planned / maxBar) * 100}%`, minWidth: r.planned ? 8 : 0 }} title={t.money.planned} />
                    <div className={cx("mt-1 h-2.5 rounded-full", r.planned && r.committed > r.planned ? "bg-[var(--qd-alert)]" : "bg-[var(--qd-primary)]")} style={{ width: `${(r.committed / maxBar) * 100}%`, minWidth: r.committed ? 8 : 0 }} title={t.money.committed} />
                    <p className="mt-1 text-[12px] text-[var(--qd-muted)]">{t.money.committed}: {money(r.committed)} · {t.money.paid}: {money(r.paid)}</p>
                  </div>
                  <input aria-label={`${t.budgetT.setBudget}: ${t.cats.budget[c]}`} disabled={!access.canEdit} inputMode="decimal" dir="ltr" placeholder={t.money.planned} defaultValue={plan.budget[c] !== undefined ? String(toMajor(plan.budget[c]!, currency)) : ""} onBlur={(e) => { const v = e.target.value.trim(); if (!v) return dispatch({ t: "budget", cat: c as BudgetCat, amountMinor: null }); const m = parseMoney(v, currency); if (m !== undefined) dispatch({ t: "budget", cat: c as BudgetCat, amountMinor: m }); }} className={`${inputCls} !h-10 text-start`} />
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex flex-wrap gap-4 text-[12px] text-[var(--qd-muted)]"><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-[var(--qd-tint)]" />{t.money.planned}</span><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-5 rounded-full bg-[var(--qd-primary)]" />{t.money.committed}</span></p>
        </Card>
      )}
      {tab === "orders" && (
        plan.orders.length === 0 ? <EmptyState icon={<ReceiptIcon size={26} />} title={t.common.empty} /> : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {plan.orders.map((o) => {
              const paid = orderPaid(plan, o.id);
              return (
                <li key={o.id}>
                  <button type="button" onClick={() => setOrder(o)} className="qd-card flex w-full flex-col gap-1.5 rounded-[20px] p-4 text-start">
                    <span className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate font-semibold">{o.title}</span><Badge tone={oTone[o.status]}>{t.status.order[o.status]}</Badge></span>
                    <span className="text-[13px] text-[var(--qd-muted)]">{[t.cats.budget[o.cat], plan.vendors.find((v) => v.id === o.vendorId)?.name, o.deliveryDate && `${t.budgetT.delivery}: ${date(o.deliveryDate)}`].filter(Boolean).join(" · ")}</span>
                    <span className="text-[14px]"><b>{money(o.amountMinor)}</b>{o.foreign && <span className="text-[12px] text-[var(--qd-muted)]"> ({toMajor(o.foreign.amountMinor, o.foreign.currency)} {o.foreign.currency})</span>}</span>
                    {o.status !== "cancelled" && <><Bar value={o.amountMinor ? paid / o.amountMinor : 0} tone="sage" /><span className="text-[12px] text-[var(--qd-muted)]">{t.money.paid}: {money(paid)} · {t.money.remaining}: {money(Math.max(0, o.amountMinor - paid))}</span></>}
                  </button>
                </li>
              );
            })}
          </ul>
        )
      )}
      {tab === "payments" && (
        <section className="space-y-3">
          <div className="flex justify-end">{access.canEdit && <Button variant="soft" onClick={() => setPay({})}><PlusIcon size={16} /> {t.budgetT.addPayment}</Button>}</div>
          {plan.payments.length === 0 ? <p className="text-[14px] text-[var(--qd-muted)]">{t.common.empty}</p> : (
            <ul className="qd-card divide-y divide-[var(--qd-line)] rounded-[20px]">
              {[...plan.payments].sort((a, b) => (a.paidOn ? 1 : 0) - (b.paidOn ? 1 : 0) || (a.due ?? "9").localeCompare(b.due ?? "9")).map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-2">
                  <input type="checkbox" aria-label={`${t.money.paid}: ${p.label}`} checked={!!p.paidOn} disabled={!access.canEdit} onChange={(e) => dispatch({ t: "put", c: "payments", item: { ...p, paidOn: e.target.checked ? new Date().toISOString().slice(0, 10) : undefined } })} className="size-5 accent-[var(--qd-sage)]" />
                  <button type="button" onClick={() => setPay(p)} className="min-h-12 min-w-0 flex-1 text-start">
                    <span className="block text-[15px]">{p.label}</span>
                    <span className="block text-[12.5px] text-[var(--qd-muted)]">{[plan.orders.find((o) => o.id === p.orderId)?.title, p.paidOn ? `${t.money.paid} ${date(p.paidOn)}` : p.due && `${t.budgetT.due}: ${date(p.due)}`].filter(Boolean).join(" · ")}</span>
                  </button>
                  <span className="font-semibold tabular-nums">{money(p.amountMinor)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {tab === "vendors" && (
        <section className="space-y-3">
          <div className="flex justify-end">{access.canEdit && <Button variant="soft" onClick={() => setVendor({})}><PlusIcon size={16} /> {t.budgetT.addVendor}</Button>}</div>
          {plan.vendors.length === 0 ? <EmptyState icon={<StorefrontIcon size={26} />} title={t.common.empty} /> : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {plan.vendors.map((v) => (
                <li key={v.id}><button type="button" onClick={() => setVendor(v)} className="qd-card w-full rounded-[18px] p-4 text-start"><span className="block font-semibold">{v.name}</span><span className="block text-[13px] text-[var(--qd-muted)]">{[v.kind, v.contact].filter(Boolean).join(" · ")}</span></button></li>
              ))}
            </ul>
          )}
        </section>
      )}
      <EntitySheet open={!!order} onClose={() => setOrder(null)} title={order?.id ? order.title ?? "" : t.budgetT.addOrder} fields={orderFields} initial={order ? orderDraft(order) : {}} onSave={saveOrder} onDelete={order?.id ? () => dispatch({ t: "del", c: "orders", id: order.id! }) : undefined} />
      <EntitySheet open={!!pay} onClose={() => setPay(null)} title={pay?.id ? pay.label ?? "" : t.budgetT.addPayment} fields={payFields} initial={(pay ?? {}) as Draft} onSave={(d) => dispatch({ t: "put", c: "payments", item: { ...d, id: pay?.id ?? newId("pa") } })} onDelete={pay?.id ? () => dispatch({ t: "del", c: "payments", id: pay.id! }) : undefined} />
      <EntitySheet open={!!vendor} onClose={() => setVendor(null)} title={vendor?.id ? vendor.name ?? "" : t.budgetT.addVendor} fields={vendorFields} initial={(vendor ?? {}) as Draft} onSave={(d) => dispatch({ t: "put", c: "vendors", item: { ...d, id: vendor?.id ?? newId("vn") } })} onDelete={vendor?.id ? () => dispatch({ t: "del", c: "vendors", id: vendor.id! }) : undefined} />
    </div>
  );
}

export function CalendarPage() {
  const { t, plan, lang, today, date, timeLabel, dispatch, newId, access } = useQ();
  const [show, setShow] = useState<"upcoming" | "past">("upcoming");
  const [appt, setAppt] = useState<Partial<Appointment> | null>(null);
  useAddParam(() => setAppt({ kind: "personal", date: today }));
  const all = calendar(plan, lang);
  const list = all.filter((e) => (show === "upcoming" ? e.date >= today : e.date < today));
  const ordered = show === "past" ? [...list].reverse() : list;
  const months = [...new Set(ordered.map((e) => e.date.slice(0, 7)))];
  const download = () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    const blob = new Blob([ics(all.filter((e) => e.date >= today), plan.profile?.timeZone ?? "Asia/Muscat", stamp)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hikayat-qudoom.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const toggle = (e: CalEntry) => {
    const task = plan.tasks.find((x) => x.id === e.ref);
    if (e.kind === "task" && task) dispatch({ t: "put", c: "tasks", item: { ...task, status: task.status === "done" ? "todo" : "done" } });
    if (e.kind === "appt") setAppt(plan.appointments.find((a) => a.id === e.ref) ?? null);
  };
  const tone: Record<CalEntry["kind"], Tone> = { task: "neutral", order: "amber", visit: "sage", event: "primary", payment: "accent", appt: "lilac", help: "neutral", due: "primary" };
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
      <PageHeader title={t.cal.title} sub={t.cal.sub} icon={<CalendarHeartIcon size={22} />} action={access.canEdit ? <Button onClick={() => setAppt({ kind: "personal", date: today })}><PlusIcon size={18} /> {t.cal.add}</Button> : undefined} />
      <div className="flex flex-wrap items-center gap-3">
        <Chips label={t.cal.title} value={show} onChange={setShow} options={[{ value: "upcoming" as const, label: t.cal.upcoming }, { value: "past" as const, label: t.cal.past }]} />
        <span className="flex-1" />
        <Button variant="secondary" size="sm" onClick={download}><DownloadSimpleIcon size={16} /> {t.cal.ics}</Button>
      </div>
      <p className="text-[12.5px] text-[var(--qd-muted)]">{t.cal.icsNote}</p>
      {ordered.length === 0 ? (
        <EmptyState icon={<CalendarHeartIcon size={26} />} title={t.cal.none} />
      ) : (
        months.map((m) => (
          <section key={m} className="space-y-2">
            <SectionTitle title={date(`${m}-01`, "month")} />
            <ul className="qd-card divide-y divide-[var(--qd-line)] rounded-[20px]">
              {ordered.filter((e) => e.date.startsWith(m)).map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => toggle(e)} className="flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-start">
                    <span className="w-14 shrink-0 text-center"><span className="block text-[1.2rem] font-bold leading-none tabular-nums">{date(e.date, "short").split(" ")[0]}</span><span className="block text-[11.5px] text-[var(--qd-muted)]">{date(e.date, "day")}</span></span>
                    <span className="min-w-0 flex-1">
                      <span className={cx("block truncate text-[15px]", e.done && "text-[var(--qd-muted)] line-through")}>{e.title}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-[var(--qd-muted)]"><Badge tone={tone[e.kind]}>{t.cal.kinds[e.kind]}</Badge>{e.time && timeLabel(e.time)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      <EntitySheet open={!!appt} onClose={() => setAppt(null)} title={appt?.id ? appt.title ?? "" : t.cal.add} fields={apptFields} initial={(appt ?? {}) as Draft} onSave={(d) => dispatch({ t: "put", c: "appointments", item: { ...d, id: appt?.id ?? newId("ap") } })} onDelete={appt?.id ? () => dispatch({ t: "del", c: "appointments", id: appt.id! }) : undefined} />
    </div>
  );
}
