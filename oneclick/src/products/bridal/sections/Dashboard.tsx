"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowRightIcon,
  BowlFoodIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  CameraIcon,
  CaretLeftIcon,
  CheckSquareOffsetIcon,
  DiamondIcon,
  DressIcon,
  FlowerIcon,
  PlusIcon,
  ShoppingBagIcon,
  SparkleIcon,
  StorefrontIcon,
  UsersThreeIcon,
  WalletIcon,
  WarningCircleIcon,
  type Icon,
} from "@phosphor-icons/react";
import { Clicky } from "@/components/brand/Clicky";
import { useBridal } from "../app/state";
import { NoticeList } from "../app/Shell";
import { alerts, budgetSummary, diffDays, focusTasks, groupTasks, paymentStatus, progress, progressMessage, type AreaKey } from "../model/engine";
import { fmtTime } from "../ui/cards";
import { Bar, Card, CountUp, IconButton, ProgressRing } from "../ui/kit";
import { ArtTile, type Motif } from "../ui/Art";
import type { ApptKind, BudgetCat } from "../model/types";
import { NewTaskSheet, TaskList } from "../ui/tasks";

const catIcons: Partial<Record<BudgetCat, Icon>> = { venue: BuildingsIcon, dress: DressIcon, jewellery: DiamondIcon, beauty: SparkleIcon, photo: CameraIcon, video: CameraIcon, decor: FlowerIcon, catering: BowlFoodIcon };
// The approved design's photos for the appointment kinds they show; other kinds keep their drawn motif.
const apptMotif: Partial<Record<ApptKind, Motif>> = { fitting: "dress", makeup: "lips", hair: "comb", salon: "comb", beauty: "lips", facial: "lips", venue: "arch", vendor: "rose", tasting: "cake", photo: "camera", henna: "henna", documents: "doc" };

export function Dashboard() {
  const { t, ws, tasks, today, num, pct, money, date, href, lang } = useBridal();
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
    { key: "checklist", icon: CheckSquareOffsetIcon, label: t.nav.checklist, value: `${num(doneCount)} ${t.common.of} ${num(liveCount)}` },
    { key: "calendar", icon: CalendarBlankIcon, label: t.nav.calendar, value: `${num(weekAppts)} · ${t.dash.thisWeek}` },
    { key: "vendors", icon: StorefrontIcon, label: t.nav.vendors, value: `${num(booked)} / ${num(vendors.length)} ${t.dash.booked}` },
    { key: "budget", icon: WalletIcon, label: t.nav.budget, value: `${money(budget.paid + budget.committed)}` },
    { key: "guests", icon: UsersThreeIcon, label: t.nav.guests, value: `${num(people)} ${t.dash.invited}` },
    { key: "shopping", icon: ShoppingBagIcon, label: t.nav.shopping, value: `${num(bought)} / ${num(shop.length)}` },
  ];
  const appts = ws.appointments.filter((a) => !a.done && a.date >= today).sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? ""))).slice(0, 3);
  const used = budget.paid + budget.committed;
  const cats = [...budget.perCat].filter((c) => c.allocated > 0).sort((a, b) => b.allocated - a.allocated).slice(0, 5);

  const ringSize = useRingSize();
  // CSS entrance (not JS): the server-rendered page is visible at first paint, before the app script loads.
  const enter = (i: number) => ({ "--bj-enter-delay": `${70 * i}ms` }) as CSSProperties;

  return (
    <div className="space-y-6 lg:space-y-7">
      {/* Hero in the One Click style: Clicky greets the bride, then the two numbers that matter */}
      <section style={enter(0)} className="bj-enter relative overflow-hidden rounded-[32px] border border-bj-line bg-[linear-gradient(180deg,#fde7ec_0%,#ffffff_75%)] p-5 shadow-[0_1px_2px_rgba(60,40,120,.05),0_10px_28px_-14px_rgba(60,40,120,.22)] sm:p-8 lg:p-10">
        <span aria-hidden="true" className="pointer-events-none absolute -end-16 -top-20 size-64 rounded-full bg-[#ffc23d]/25" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-24 end-1/3 size-56 rounded-full border-[3px] border-dashed border-[#f0567a]/30" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-10">
          <div className="flex items-start gap-4 sm:gap-5">
            <Clicky size={88} body wave animate mood="love" color="#f0567a" className="h-auto w-14 shrink-0 sm:w-[88px]" />
            <div className="min-w-0">
              <p className="text-[14px] font-medium text-bj-muted sm:text-[15px]" suppressHydrationWarning>
                {greet}
              </p>
              <h1 className="mt-1 text-[2rem] font-bold leading-[1.2] text-bj-ink sm:text-[2.6rem]">
                {lang === "ar" ? "يا عروستنا " : ""}
                <span className="relative inline-block text-[#c8325a]">
                  {p.brideName}
                  <span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-[#ffc23d]/70 -z-10" />
                </span>
              </h1>
              <p className="mt-2 text-[15px] text-bj-ink-soft sm:text-[17px]">{t.tagline}</p>
            </div>
          </div>

          {/* Countdown + readiness, as One Click stat tiles */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex min-h-[148px] flex-col justify-between rounded-[20px] bg-[#fbf0e6] p-4 sm:p-5">
              <p className="text-[13px] font-medium text-bj-muted">{t.dash.untilWedding}</p>
              {days > 0 ? (
                <p className="flex items-baseline gap-1.5">
                  <span className="text-[2.6rem] font-bold leading-none tabular-nums text-bj-ink sm:text-[3rem]">
                    <CountUp value={days} format={num} />
                  </span>
                  <span className="text-[15px] font-semibold text-bj-ink-soft">{t.dash.daysWord}</span>
                </p>
              ) : (
                <p className="text-[1.3rem] font-bold leading-tight text-bj-ink">{days === 0 ? t.dash.weddingToday : t.dash.married}</p>
              )}
              <p className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-bj-ink-soft">
                <CalendarBlankIcon size={15} weight="bold" className="text-[#f0567a]" />
                {date(p.weddingDate, "long")}
              </p>
            </div>
            <div className="flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-[20px] bg-[#fbf0e6] p-4 text-center sm:p-5">
              <ProgressRing value={prog.overall} size={ringSize} stroke={9} color="#f0567a">
                <span>
                  <span className="block text-[1.4rem] font-bold leading-none text-bj-ink sm:text-[1.7rem]">
                    <CountUp value={Math.round(prog.overall * 100)} format={pct} />
                  </span>
                  <span className="mt-1 block text-[11.5px] font-medium text-bj-muted sm:text-[12.5px]">{t.dash.ready}</span>
                </span>
              </ProgressRing>
              <p className="text-[11.5px] leading-snug text-bj-muted sm:text-[12.5px]">{msg}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section style={enter(1)} aria-label={t.dash.overview} className="bj-enter">
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {stats.map((s, i) => (
            <li key={s.key}>
              <Link
                href={href(s.key)}
                className="bj-card bj-icon-hover group relative flex h-full min-h-[66px] items-center gap-3 rounded-[20px] hover:-translate-y-0.5 px-3.5 py-2.5 transition-[transform,box-shadow] duration-200 active:scale-[0.98] sm:min-h-[120px] sm:flex-col sm:justify-center sm:gap-1 sm:px-3 sm:pb-6 sm:pt-4 sm:text-center hover:shadow-[0_20px_40px_-24px_rgba(60,40,120,.5)]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-[#fde7ec] text-[#e0456c] sm:mb-1 sm:size-11">
                  <s.icon size={22} weight="duotone" className="bj-icon bj-icon-breathe" style={{ animationDelay: `${-i * 0.5}s` }} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-bj-ink sm:text-[15.5px]">{s.label}</span>
                  <span className="block truncate text-[11.5px] tabular-nums text-bj-muted sm:text-[13px]">{s.value}</span>
                </span>
                <CaretLeftIcon size={14} className="absolute bottom-3 end-3.5 hidden text-bj-muted transition-transform duration-200 group-hover:-translate-x-0.5 sm:block ltr:rotate-180 ltr:group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Urgent: only when needed */}
      {urgent.length > 0 && (
        <section style={enter(2)} className="bj-enter" aria-labelledby="urgent-h">
          <h2 id="urgent-h" className="mb-3 flex items-center gap-2 text-[13px] font-medium text-bj-alert">
            <WarningCircleIcon size={16} className="bj-icon-breathe" />
            {t.dash.urgent}
          </h2>
          <NoticeList notes={urgent.slice(0, 3)} />
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Focus this week */}
        <section style={enter(3)} className="bj-enter" aria-labelledby="focus-h">
          <Card className="h-full p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="focus-h" className="text-[1.15rem] font-medium text-bj-ink">
                {t.dash.focus}
              </h2>
              <div className="flex items-center gap-1.5">
                <IconButton label={t.task.newTask} onClick={() => setNewTask(true)} className="size-8 border border-bj-line">
                  <PlusIcon size={14} />
                </IconButton>
                <Link href={href("checklist")} className="rounded-full bg-bj-cream px-3 py-1 text-[12px] text-bj-gold-ink hover:bg-bj-champagne">
                  {t.dash.viewAll}
                </Link>
              </div>
            </div>
            <TaskList tasks={focus} />
          </Card>
        </section>

        {/* Upcoming appointments */}
        <section style={enter(4)} className="bj-enter" aria-labelledby="appt-h">
          <Card className="h-full p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="appt-h" className="text-[1.15rem] font-medium text-bj-ink">
                {t.dash.upcoming}
              </h2>
              <Link href={href("calendar")} className="rounded-full bg-bj-cream px-3 py-1 text-[12px] text-bj-gold-ink hover:bg-bj-champagne">
                {t.dash.viewAll}
              </Link>
            </div>
            {appts.length ? (
              <ul className="space-y-2.5">
                {appts.map((a, i) => (
                  <li key={a.id}>
                    <Link href={href("calendar")} className="flex items-center gap-3 rounded-[16px] border border-bj-line bg-bj-ivory/60 p-2.5 transition-colors hover:bg-bj-cream">
                      <ArtTile motif={apptMotif[a.kind] ?? "star"} tone={i + 1} className="size-14 shrink-0 rounded-[12px]" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11.5px] text-bj-muted">{date(a.date, "weekday")}</span>
                        <span className="block truncate text-[14px] font-medium text-bj-ink">{a.title}</span>
                      </span>
                      {a.time && (
                        <span className="shrink-0 text-[12px] tabular-nums text-bj-muted" dir="ltr">
                          {fmtTime(a.time, lang)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-[16px] border border-dashed border-bj-beige px-4 py-4 text-sm text-bj-muted">{t.dash.noAppointment}</p>
            )}
          </Card>
        </section>

        {/* Budget at a glance */}
        <section style={enter(5)} className="bj-enter" aria-labelledby="budget-h">
          <Card className="h-full p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="budget-h" className="text-[1.15rem] font-medium text-bj-ink">
                {t.dash.budgetGlance}
              </h2>
              <Link href={href("budget")} aria-label={t.nav.budget} className="grid size-8 place-items-center rounded-full text-bj-muted hover:bg-bj-cream">
                <ArrowRightIcon size={16} className="rtl:rotate-180" />
              </Link>
            </div>
            <p className="text-[1.6rem] font-medium tabular-nums leading-none text-bj-ink">{money(used)}</p>
            <p className="mt-1 text-[12.5px] text-bj-muted">
              {t.common.of} {money(budget.total)}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Bar value={used / Math.max(1, budget.total)} tone="sage" className="h-2 flex-1" />
              <span className="text-[12.5px] tabular-nums text-bj-muted">{pct(Math.round((used / Math.max(1, budget.total)) * 100))}</span>
            </div>
            <ul className="mt-4 divide-y divide-bj-line">
              {cats.map((c) => {
                const CatIcon = catIcons[c.cat] ?? WalletIcon;
                return (
                  <li key={c.cat} className="bj-icon-hover flex items-center gap-3 py-2.5 text-[13.5px]">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-bj-cream text-bj-gold-ink">
                      <CatIcon size={16} className="bj-icon" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-bj-ink">{t.budgetCats[c.cat]}</span>
                    <span className="tabular-nums text-bj-ink-soft">{money(c.allocated)}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      </div>

      <NewTaskSheet open={newTask} onClose={() => setNewTask(false)} />
    </div>
  );
}

/** The readiness ring is 118px on larger screens and 84px on phones (as in the approved design). */
function useRingSize() {
  const [size, setSize] = useState(84);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const set = () => setSize(mq.matches ? 112 : 84);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return size;
}
