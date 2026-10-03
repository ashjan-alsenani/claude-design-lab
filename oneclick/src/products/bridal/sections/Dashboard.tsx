"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { ArrowRightIcon, CalendarBlankIcon, CheckSquareOffsetIcon, PlusIcon, ShoppingBagIcon, StorefrontIcon, UsersThreeIcon, WalletIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import { NoticeList } from "../app/Shell";
import { alerts, budgetSummary, diffDays, focusTasks, groupTasks, paymentStatus, progress, progressMessage, type AreaKey } from "../model/engine";
import { AppointmentCard, PaymentCard } from "../ui/cards";
import { Bar, Button, Card, CountUp, ProgressRing } from "../ui/kit";
import { Clicky } from "@/components/brand/Clicky";
import { NewTaskSheet, TaskList } from "../ui/tasks";

const statColors = [["#ddf6f2", "#0b7d73"], ["#fff1cc", "#a86b00"], ["#ffe4e6", "#d6455d"], ["#ece8ff", "#6a59e6"], ["#e0eeff", "#2f66d9"], ["#ffe3ee", "#c93b70"]];

export function Dashboard() {
  const { t, ws, tasks, today, num, pct, money, date, href, lang } = useBridal();
  const reduce = useReducedMotion();
  const [newTask, setNewTask] = useState(false);
  const p = ws.profile!;
  const days = diffDays(today, p.weddingDate);
  const prog = useMemo(() => progress(ws, tasks), [ws, tasks]);
  const groups = useMemo(() => groupTasks(tasks, today), [tasks, today]);
  const focus = useMemo(() => focusTasks(tasks, today, 5), [tasks, today]);
  const urgent = useMemo(() => alerts(ws, tasks, today), [ws, tasks, today]);
  const budget = useMemo(() => budgetSummary(ws), [ws]);
  const msg = t.dash.messages[progressMessage(prog.overall, groups.overdue.length)];
  const hour = new Date().getHours();
  const greet = hour < 12 ? t.greeting.morning : hour < 18 ? t.greeting.afternoon : t.greeting.evening;

  const nextPay = ws.payments.filter((x) => !x.paidOn).sort((a, b) => a.due.localeCompare(b.due))[0];
  const nextAppt = ws.appointments.filter((a) => !a.done && a.date >= today).sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")))[0];
  const weekAppts = ws.appointments.filter((a) => !a.done && diffDays(today, a.date) >= 0 && diffDays(today, a.date) <= 7).length;
  const doneCount = tasks.filter((x) => x.status === "done").length;
  const liveCount = tasks.filter((x) => x.status !== "skip").length;
  const vendors = ws.vendors.filter((v) => v.status !== "cancelled");
  const booked = vendors.filter((v) => v.status === "booked" || v.status === "completed").length;
  const people = ws.guests.reduce((s, g) => s + g.adults + g.children, 0);
  const confirmed = ws.guests.filter((g) => g.rsvp === "confirmed").reduce((s, g) => s + g.adults + g.children, 0);
  const shop = ws.items.filter((i) => i.list === "trousseau" && i.status !== "skip");
  const bought = shop.filter((i) => i.status === "bought" || i.status === "gift").length;

  const stats = [
    { key: "checklist", icon: CheckSquareOffsetIcon, label: t.dash.cards.checklist, value: `${num(doneCount)} / ${num(liveCount)}`, bar: doneCount / Math.max(1, liveCount) },
    { key: "budget", icon: WalletIcon, label: t.dash.cards.budget, value: `${money(budget.paid + budget.committed)}`, sub: `${t.common.of} ${money(budget.total)}`, bar: (budget.paid + budget.committed) / Math.max(1, budget.total) },
    { key: "vendors", icon: StorefrontIcon, label: t.dash.cards.vendors, value: `${num(booked)} / ${num(vendors.length)}`, sub: t.dash.booked, bar: booked / Math.max(1, vendors.length) },
    { key: "guests", icon: UsersThreeIcon, label: t.dash.cards.guests, value: `${num(people)}`, sub: `${t.dash.invited} · ${num(confirmed)} ${t.dash.confirmed}`, bar: confirmed / Math.max(1, people) },
    { key: "calendar", icon: CalendarBlankIcon, label: t.dash.cards.appointments, value: num(weekAppts), sub: t.dash.thisWeek },
    { key: "shopping", icon: ShoppingBagIcon, label: t.dash.cards.shopping, value: `${num(bought)} / ${num(shop.length)}`, sub: t.dash.purchased, bar: bought / Math.max(1, shop.length) },
  ];
  const areas: AreaKey[] = ["bride", "venue", "vendors", "guests", "shopping", ...(p.home !== "no" ? (["home"] as AreaKey[]) : []), ...(p.honeymoon !== "no" ? (["honeymoon"] as AreaKey[]) : [])];

  const rise = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] as const } });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section {...rise(0)} className="relative overflow-hidden rounded-[28px] border border-bj-line bg-[linear-gradient(135deg,#ddf6f2_0%,#fff3d1_55%,#ffe0e6_100%)] px-6 py-7 sm:px-9 sm:py-9">
        <div className="pointer-events-none absolute -end-16 -top-16 size-64 rounded-full bg-white/40" />
        <div className="pointer-events-none absolute -bottom-10 start-1/3 size-32 rounded-full bg-[#d9d1ff]/50" />
        <Clicky size={86} mood={prog.overall >= 0.5 ? "celebrate" : "love"} body wave animate className="pointer-events-none absolute bottom-2 end-[215px] hidden md:block" />
        <div className="relative flex items-start justify-between gap-4 sm:items-center">
          <div>
            <p className="text-[14px] text-bj-muted" suppressHydrationWarning>
              {greet}, {p.brideName} <span aria-hidden="true">🤍</span>
            </p>
            {days > 0 ? (
              <h1 className="mt-2 flex flex-wrap items-baseline gap-x-3">
                <span className="bj-serif text-[4rem] leading-none text-bj-ink sm:text-[5rem]">
                  <CountUp value={days} format={num} />
                </span>
                <span className="bj-serif text-[1.45rem] text-bj-ink-soft">{t.dash.daysUntil}</span>
              </h1>
            ) : (
              <h1 className="bj-serif mt-2 text-[2.6rem] leading-tight text-bj-ink">{days === 0 ? t.dash.weddingToday : t.dash.married}</h1>
            )}
            <p className="mt-2 text-[14px] text-bj-muted">{date(p.weddingDate, "long")}{p.city ? ` · ${p.city}` : ""}</p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-bj-ink">{msg}</p>
          </div>
          <div className="-mb-11 -ms-11 shrink-0 origin-top-right scale-[0.68] sm:m-0 sm:scale-100 rtl:origin-top-left">
            <ProgressRing value={prog.overall} size={136} stroke={6}>
              <span>
                <span className="bj-serif block text-[2.2rem] leading-none text-bj-ink">
                  <CountUp value={Math.round(prog.overall * 100)} format={pct} />
                </span>
                <span className="mt-1 block text-[12px] text-bj-muted">{t.dash.ready}</span>
              </span>
            </ProgressRing>
          </div>
        </div>
      </motion.section>

      {/* Urgent: only when needed */}
      {urgent.length > 0 && (
        <motion.section {...rise(1)} aria-labelledby="urgent-h">
          <h2 id="urgent-h" className="mb-3 flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.14em] text-bj-alert">
            <WarningCircleIcon size={16} />
            {t.dash.urgent}
          </h2>
          <NoticeList notes={urgent.slice(0, 4)} />
        </motion.section>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Focus */}
        <motion.section {...rise(2)} aria-labelledby="focus-h">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 id="focus-h" className="bj-serif text-[1.75rem] text-bj-ink">
                {t.dash.focus}
              </h2>
              <p className="text-[13.5px] text-bj-muted">{t.dash.focusSub}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setNewTask(true)} aria-label={t.task.newTask}>
              <PlusIcon size={15} />
              <span className="hidden sm:inline">{t.task.newTask}</span>
            </Button>
          </div>
          <TaskList tasks={focus} />
          <Link href={href("checklist")} className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-bj-gold-ink hover:text-bj-ink">
            {t.dash.allTasks}
            <ArrowRightIcon size={15} className="rtl:rotate-180" />
          </Link>
        </motion.section>

        <div className="space-y-6">
          <motion.section {...rise(3)} aria-labelledby="pay-h">
            <h2 id="pay-h" className="mb-3 text-[13px] font-medium uppercase tracking-[0.14em] text-bj-muted">
              {t.dash.nextPayment}
            </h2>
            {nextPay ? (
              <Link href={href("budget")} className="block">
                <PaymentCard pay={nextPay} />
              </Link>
            ) : (
              <p className="rounded-[16px] border border-dashed border-bj-beige px-4 py-4 text-sm text-bj-muted">{t.dash.noPayment}</p>
            )}
            {nextPay && paymentStatus(nextPay, today) === "soon" && <span className="sr-only">{t.budget.payStatus.soon}</span>}
          </motion.section>
          <motion.section {...rise(4)} aria-labelledby="appt-h">
            <h2 id="appt-h" className="mb-3 text-[13px] font-medium uppercase tracking-[0.14em] text-bj-muted">
              {t.dash.nextAppointment}
            </h2>
            {nextAppt ? (
              <Link href={href("calendar")} className="block">
                <AppointmentCard a={nextAppt} />
              </Link>
            ) : (
              <p className="rounded-[16px] border border-dashed border-bj-beige px-4 py-4 text-sm text-bj-muted">{t.dash.noAppointment}</p>
            )}
          </motion.section>
          <motion.section {...rise(5)} aria-labelledby="areas-h">
            <Card className="p-5">
              <h2 id="areas-h" className="mb-4 text-[13px] font-medium uppercase tracking-[0.14em] text-bj-muted">
                {t.dash.areas}
              </h2>
              <ul className="space-y-3.5">
                {areas.map((a) => (
                  <li key={a}>
                    <div className="mb-1.5 flex justify-between text-[13.5px]">
                      <span className="text-bj-ink">{t.areas[a]}</span>
                      <span className="tabular-nums text-bj-muted">{pct(Math.round(prog[a] * 100))}</span>
                    </div>
                    <Bar value={prog[a]} tone={a === "venue" || a === "vendors" ? "sage" : a === "bride" ? "rose" : "gold"} />
                  </li>
                ))}
              </ul>
            </Card>
          </motion.section>
        </div>
      </div>

      {/* Quick overview */}
      <motion.section {...rise(6)} aria-labelledby="ov-h">
        <h2 id="ov-h" className="bj-serif mb-4 text-[1.75rem] text-bj-ink">
          {t.dash.overview}
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stats.map((s, i) => (
            <li key={s.key}>
              <Link href={href(s.key)} className="flex h-full flex-col rounded-[20px] border border-bj-line bg-bj-paper p-4 transition-shadow hover:shadow-[0_18px_40px_-28px_rgba(30,27,58,.25)]">
                <span className="flex items-center gap-2 text-[12.5px] text-bj-muted">
                  <span className="grid size-8 place-items-center rounded-full" style={{ background: statColors[i % 6][0], color: statColors[i % 6][1] }}>
                    <s.icon size={17} weight="bold" />
                  </span>
                  {s.label}
                </span>
                <span className="mt-2 text-[1.3rem] font-medium tabular-nums leading-tight text-bj-ink" dir={lang === "ar" ? "rtl" : "ltr"}>
                  {s.value}
                </span>
                {s.sub && <span className="mt-0.5 text-[12px] text-bj-muted">{s.sub}</span>}
                {s.bar !== undefined && <Bar value={s.bar} className="mt-auto translate-y-1 pt-0" tone="gold" />}
              </Link>
            </li>
          ))}
        </ul>
      </motion.section>
      <NewTaskSheet open={newTask} onClose={() => setNewTask(false)} />
    </div>
  );
}
