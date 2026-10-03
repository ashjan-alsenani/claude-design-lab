"use client";

import { useMemo, useState } from "react";
import { CheckIcon, PencilSimpleIcon, PlusIcon, ReceiptIcon, WalletIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import { budgetSummary, paidOf, paymentStatus } from "../model/engine";
import type { BudgetCat, Expense, Payment } from "../model/types";
import { PaymentCard } from "../ui/cards";
import { EntitySheet, type FieldSpec } from "../ui/EntitySheet";
import { Badge, Bar, Button, Card, CountUp, EmptyState, IconButton, SectionHeader, Segmented, cx } from "../ui/kit";

export function Budget() {
  const { t, ws, money, today, dispatch, newId } = useBridal();
  const b = useMemo(() => budgetSummary(ws), [ws]);
  const [tab, setTab] = useState<"overview" | "expenses" | "payments">("overview");
  const [exp, setExp] = useState<Partial<Expense> | null>(null);
  const [pay, setPay] = useState<Partial<Payment> | null>(null);
  const [alloc, setAlloc] = useState<BudgetCat | null>(null);
  const upcoming = ws.payments.filter((x) => !x.paidOn).sort((a, c) => a.due.localeCompare(c.due));
  const B = t.budget;

  const expFields: FieldSpec[] = [
    { key: "item", label: B.item, kind: "text", required: true },
    { key: "cat", label: t.common.category, kind: "select", required: true, options: b.perCat.map((c) => ({ value: c.cat, label: t.budgetCats[c.cat] })) },
    { key: "vendorId", label: B.vendor, kind: "select", options: ws.vendors.map((v) => ({ value: v.id, label: v.name })) },
    { key: "estimated", label: B.estimated, kind: "number", required: true, half: true },
    { key: "actual", label: B.actual, kind: "number", half: true },
    { key: "status", label: t.common.status, kind: "select", required: true, options: (Object.keys(B.expenseStatus) as Expense["status"][]).map((s) => ({ value: s, label: B.expenseStatus[s] })) },
    { key: "notes", label: t.common.notes, kind: "textarea", hint: B.receipt },
  ];
  const payFields: FieldSpec[] = [
    { key: "label", label: t.common.name, kind: "text", required: true },
    { key: "amount", label: t.common.amount, kind: "number", required: true, half: true },
    { key: "due", label: t.common.date, kind: "date", required: true, half: true },
    { key: "expenseId", label: B.expense, kind: "select", options: ws.expenses.map((e) => ({ value: e.id, label: e.item })) },
    { key: "vendorId", label: B.vendor, kind: "select", options: ws.vendors.map((v) => ({ value: v.id, label: v.name })) },
    { key: "paidOn", label: B.paidOn, kind: "date", half: true },
    { key: "paidAmount", label: B.paidAmount, kind: "number", half: true },
    { key: "notes", label: t.common.notes, kind: "textarea" },
  ];

  const tiles = [
    { label: B.total, value: b.total, tone: "text-bj-ink" },
    { label: B.paid, value: b.paid, tone: "text-bj-sage" },
    { label: B.committed, value: b.committed, tone: "text-bj-gold-ink" },
    { label: B.remaining, value: b.remaining, tone: b.remaining < 0 ? "text-bj-alert" : "text-bj-ink" },
  ];
  const pct = (n: number) => `${Math.max(0, Math.min(100, (n / Math.max(1, b.total)) * 100))}%`;

  return (
    <div className="space-y-7">
      <SectionHeader
        title={B.title}
        sub={B.sub}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPay({ due: today })}>
              <PlusIcon size={15} />
              {B.addPayment}
            </Button>
            <Button onClick={() => setExp({ status: "planned", cat: "misc" })}>
              <PlusIcon size={15} />
              {B.addExpense}
            </Button>
          </div>
        }
      />

      <Card className="p-5 sm:p-6">
        <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {tiles.map((x) => (
            <div key={x.label}>
              <dt className="text-[12.5px] text-bj-muted">{x.label}</dt>
              <dd className={cx("mt-1 text-[1.4rem] font-semibold leading-tight tabular-nums", x.tone)}>
                <CountUp value={x.value} format={(n) => money(n)} />
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-[#f4e6ea]" aria-hidden="true">
          <span className="h-full bg-bj-sage transition-[width] duration-700" style={{ width: pct(b.paid) }} />
          <span className="h-full bg-bj-gold transition-[width] duration-700" style={{ width: pct(b.committed) }} />
          <span className="h-full bg-[#ead0d8] transition-[width] duration-700" style={{ width: pct(b.planned) }} />
        </div>
        <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-bj-muted">
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-bj-sage" />{B.paid}</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-bj-gold" />{B.committed}</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#ead0d8]" />{B.planned} · {money(b.planned)}</span>
        </p>
      </Card>

      <Segmented label={B.title} value={tab} onChange={setTab} options={[{ value: "overview", label: B.byCategory }, { value: "expenses", label: B.expenses }, { value: "payments", label: B.payments }]} />

      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Card as="section" className="p-5">
            <h2 className="bj-serif mb-4 text-[1.4rem]">{B.byCategory}</h2>
            <ul className="divide-y divide-bj-line">
              {b.perCat.map((c) => {
                const used = c.booked + c.planned;
                const over = used > c.allocated && c.allocated > 0;
                return (
                  <li key={c.cat} className="py-3">
                    <div className="flex items-center justify-between gap-3 text-[14px]">
                      <span className="text-bj-ink">{t.budgetCats[c.cat]}</span>
                      <span className="flex items-center gap-1 tabular-nums text-bj-muted">
                        <span className={over ? "text-bj-alert" : "text-bj-ink"}>{money(used)}</span> / {money(c.allocated)}
                        <IconButton label={`${B.allocated}: ${t.budgetCats[c.cat]}`} onClick={() => setAlloc(c.cat)} className="size-8">
                          <PencilSimpleIcon size={14} weight="regular" />
                        </IconButton>
                      </span>
                    </div>
                    <Bar value={used / Math.max(1, c.allocated)} tone={over ? "alert" : c.paid >= used && used > 0 ? "sage" : "gold"} className="mt-1.5" />
                    {over && <p className="mt-1 text-[11.5px] text-bj-alert">{B.over}</p>}
                  </li>
                );
              })}
            </ul>
          </Card>
          <section>
            <h2 className="bj-serif mb-3 text-[1.4rem]">{B.upcoming}</h2>
            {upcoming.length ? (
              <ul className="space-y-2">
                {upcoming.slice(0, 6).map((x) => (
                  <li key={x.id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <PaymentCard pay={x} onClick={() => setPay(x)} />
                    </div>
                    <IconButton label={B.markPaid} onClick={() => dispatch({ t: "put", c: "payments", item: { ...x, paidOn: today } })} className="border border-bj-line bg-bj-paper">
                      <CheckIcon size={17} />
                    </IconButton>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={<WalletIcon size={24} weight="regular" />} title={B.emptyPayments} />
            )}
          </section>
        </div>
      )}

      {tab === "expenses" &&
        (ws.expenses.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {ws.expenses.map((e) => {
              const paid = ws.payments.filter((x) => x.expenseId === e.id).reduce((s, x) => s + paidOf(x), 0);
              const cost = e.actual ?? e.estimated;
              const v = ws.vendors.find((x) => x.id === e.vendorId);
              return (
                <li key={e.id}>
                  <button type="button" onClick={() => setExp(e)} className="w-full rounded-[18px] border border-bj-line bg-bj-paper p-4 text-start hover:border-bj-taupe/40">
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] text-bj-ink">{e.item}</span>
                        <span className="text-[12.5px] text-bj-muted">
                          {t.budgetCats[e.cat]}
                          {v ? ` · ${v.name}` : ""}
                        </span>
                      </span>
                      <Badge tone={e.status === "paid" ? "sage" : e.status === "booked" ? "gold" : "neutral"}>{B.expenseStatus[e.status]}</Badge>
                    </span>
                    <span className="mt-3 grid grid-cols-3 gap-2 text-[12px] text-bj-muted">
                      <span>
                        {B.estimated}
                        <span className="block text-[14px] tabular-nums text-bj-ink">{money(e.estimated)}</span>
                      </span>
                      <span>
                        {B.paid}
                        <span className="block text-[14px] tabular-nums text-bj-sage">{money(paid)}</span>
                      </span>
                      <span>
                        {B.remaining}
                        <span className="block text-[14px] tabular-nums text-bj-ink">{money(Math.max(0, cost - paid))}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={<ReceiptIcon size={24} weight="regular" />} title={B.emptyExpenses} action={<Button onClick={() => setExp({ status: "planned", cat: "misc" })}>{B.addExpense}</Button>} />
        ))}

      {tab === "payments" &&
        (ws.payments.length ? (
          <ul className="space-y-2">
            {[...ws.payments].sort((a, c) => a.due.localeCompare(c.due)).map((x) => (
              <li key={x.id} className={cx(paymentStatus(x, today) === "paid" && "opacity-75")}>
                <PaymentCard pay={x} onClick={() => setPay(x)} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<WalletIcon size={24} weight="regular" />} title={B.emptyPayments} action={<Button onClick={() => setPay({ due: today })}>{B.addPayment}</Button>} />
        ))}

      <EntitySheet
        open={!!exp}
        onClose={() => setExp(null)}
        title={exp?.id ? exp.item ?? B.addExpense : B.addExpense}
        fields={expFields}
        initial={(exp ?? {}) as Record<string, string | number | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "expenses", item: { ...item, id: exp?.id ?? newId("e") } })}
        onDelete={exp?.id ? () => dispatch({ t: "del", c: "expenses", id: exp.id! }) : undefined}
      />
      <EntitySheet
        open={!!pay}
        onClose={() => setPay(null)}
        title={pay?.id ? pay.label ?? B.addPayment : B.addPayment}
        fields={payFields}
        initial={(pay ?? {}) as Record<string, string | number | undefined>}
        onSave={(item) => dispatch({ t: "put", c: "payments", item: { ...item, id: pay?.id ?? newId("p") } })}
        onDelete={pay?.id ? () => dispatch({ t: "del", c: "payments", id: pay.id! }) : undefined}
      />
      <EntitySheet
        open={!!alloc}
        onClose={() => setAlloc(null)}
        title={alloc ? `${B.allocated}: ${t.budgetCats[alloc]}` : ""}
        fields={[{ key: "amount", label: B.allocated, kind: "number", hint: B.allocationHint }]}
        initial={{ amount: alloc ? ws.categoryBudgets[alloc] : undefined }}
        onSave={(x) => dispatch({ t: "budget", cat: alloc!, amount: x.amount === undefined ? null : Number(x.amount) })}
      />
    </div>
  );
}
