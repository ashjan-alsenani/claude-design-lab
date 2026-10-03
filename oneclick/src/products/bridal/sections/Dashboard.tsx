"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
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
  HeartIcon,
  PlusIcon,
  ShoppingBagIcon,
  SparkleIcon,
  StorefrontIcon,
  UsersThreeIcon,
  WalletIcon,
  WarningCircleIcon,
  type Icon,
} from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import { NoticeList } from "../app/Shell";
import { alerts, budgetSummary, diffDays, focusTasks, groupTasks, paymentStatus, progress, progressMessage, type AreaKey } from "../model/engine";
import { fmtTime } from "../ui/cards";
import { Bar, Card, CountUp, IconButton, ProgressRing } from "../ui/kit";
import { ArtTile, BrideArt, Floaters, Sparkles, TerraceScene, type Motif } from "../ui/Art";
import type { ApptKind, BudgetCat } from "../model/types";
import { NewTaskSheet, TaskList } from "../ui/tasks";

const catIcons: Partial<Record<BudgetCat, Icon>> = { venue: BuildingsIcon, dress: DressIcon, jewellery: DiamondIcon, beauty: SparkleIcon, photo: CameraIcon, video: CameraIcon, decor: FlowerIcon, catering: BowlFoodIcon };
const apptMotif: Partial<Record<ApptKind, Motif>> = { fitting: "dress", makeup: "lips", hair: "comb", salon: "comb", beauty: "lips", facial: "lips", venue: "arch", vendor: "rose", tasting: "cake", photo: "camera", henna: "henna", documents: "doc" };

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

  const rise = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: 0.07 * i, ease: [0.16, 1, 0.3, 1] as const } });

  return (
    <div className="space-y-6 lg:space-y-7">
      {/* Hero: the terrace, the bride (from behind), the countdown and readiness */}
      <motion.section {...rise(0)} className="relative overflow-hidden rounded-[28px] border border-bj-line bg-bj-cream shadow-[0_30px_70px_-45px_rgba(80,50,40,.45)]">
        <div className="relative h-[300px] sm:h-[360px] lg:h-[440px]">
          <TerraceScene className="absolute inset-0 h-full w-full ltr:-scale-x-100" />
          <BrideArt arch={false} className="absolute -bottom-1 end-[-4%] h-[96%] w-auto sm:end-[4%] lg:end-[9%] ltr:-scale-x-100" />
          <Floaters className="hidden sm:block" count={7} />
          <div className="absolute inset-0 ltr:bg-[linear-gradient(90deg,rgba(251,247,244,.95)_0%,rgba(251,247,244,.7)_40%,rgba(251,247,244,0)_68%)] rtl:bg-[linear-gradient(270deg,rgba(251,247,244,.95)_0%,rgba(251,247,244,.7)_40%,rgba(251,247,244,0)_68%)]" />
          <div className="relative flex h-full max-w-[66%] flex-col px-5 pt-6 sm:max-w-[56%] sm:px-9 sm:pt-10 lg:pt-12">
            <p className="text-[13px] text-bj-ink-soft sm:text-[15px]" suppressHydrationWarning>
              {greet}{lang === "ar" ? " يا عروستنا " : ", "}
              <span className="bj-glitter font-medium">{p.brideName}</span>
            </p>
            <h1 className="bj-glitter mt-2 text-[1.85rem] font-light leading-[1.2] sm:text-[3rem] lg:text-[3.6rem]">{t.brand}</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-bj-ink-soft sm:text-[1.1rem]">{t.tagline}</p>
            {lang === "ar" && (
              <p className="bj-latin mt-1 hidden text-right text-[1.1rem] italic text-bj-muted sm:block" dir="ltr" lang="en">
                Everything you need. Nothing forgotten.
              </p>
            )}
          </div>
        </div>

        {/* Countdown + readiness: glass cards over the scene on large screens, below it on phones */}
        <div className="relative grid grid-cols-2 gap-3 p-3 sm:gap-4 sm:p-5 lg:absolute lg:bottom-7 lg:start-9 lg:w-[min(620px,54%)] lg:p-0">
          <div className="bj-glass bj-shine relative overflow-hidden rounded-[22px] px-4 py-4 sm:px-6 sm:py-5" style={{ ["--bj-shine-delay" as string]: "0.6s" }}>
            {days > 0 ? (
              <>
                <p className="flex flex-wrap items-baseline gap-x-2 text-bj-ink">
                  {t.dash.left && <span className="text-[1rem] sm:text-[1.2rem]">{t.dash.left}</span>}
                  <span className="text-[2.3rem] font-medium leading-none tabular-nums sm:text-[2.8rem]">
                    <CountUp value={days} format={num} />
                  </span>
                  <span className="text-[1rem] sm:text-[1.2rem]">{t.dash.daysWord}</span>
                </p>
                <p className="mt-1 text-[14px] text-bj-ink-soft sm:text-[1.05rem]">{t.dash.untilWedding}</p>
              </>
            ) : (
              <p className="text-[1.4rem] font-medium leading-tight text-bj-ink">{days === 0 ? t.dash.weddingToday : t.dash.married}</p>
            )}
            <p className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] text-bj-muted sm:text-[13px]">
              <CalendarBlankIcon size={14} className="text-bj-gold-ink" />
              {date(p.weddingDate, "long")}
            </p>
            <Sparkles className="absolute -bottom-2 end-1 h-16 w-16 opacity-80" count={4} />
          </div>
          <div className="bj-glass bj-shine flex flex-col items-center justify-center gap-2 rounded-[22px] px-3 py-4 text-center sm:flex-row sm:gap-4 sm:px-5 sm:text-start" style={{ ["--bj-shine-delay" as string]: "2.4s" }}>
            <ProgressRing value={prog.overall} size={84} stroke={6}>
              <span>
                <span className="block text-[1.3rem] font-medium leading-none text-bj-ink">
                  <CountUp value={Math.round(prog.overall * 100)} format={pct} />
                </span>
                <span className="mt-0.5 block text-[11px] text-bj-muted">{t.dash.ready}</span>
              </span>
            </ProgressRing>
            <p className="line-clamp-3 max-w-[16rem] text-[12px] leading-relaxed text-bj-ink-soft sm:text-[13.5px]">
              <HeartIcon size={14} weight="fill" className="bj-icon-breathe me-1 inline-block align-[-2px] text-[#d9a99b]" />
              {msg}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Quick cards: icon, title, a short number, arrow */}
      <motion.section {...rise(1)} aria-label={t.dash.overview}>
        <ul className="bj-scroll-x -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {stats.map((s, i) => (
            <li key={s.key} className="w-[44%] shrink-0 snap-start sm:w-auto">
              <Link href={href(s.key)} className="bj-icon-hover group flex h-full flex-col items-center rounded-[20px] border border-bj-line bg-bj-paper px-3 pb-3 pt-5 text-center transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_-30px_rgba(80,50,40,.35)]">
                <span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(145deg,#f7ece7,#efdcd4)] text-bj-gold-ink">
                  <s.icon size={24} weight="duotone" className="bj-icon bj-icon-breathe" style={{ animationDelay: `${-i * 0.5}s` }} />
                </span>
                <span className="mt-3 text-[14.5px] font-medium text-bj-ink">{s.label}</span>
                <span className="mt-1 text-[12px] tabular-nums text-bj-muted">{s.value}</span>
                <CaretLeftIcon size={14} className="mt-2 self-end text-bj-taupe transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </motion.section>

      {/* Urgent: only when needed */}
      {urgent.length > 0 && (
        <motion.section {...rise(2)} aria-labelledby="urgent-h">
          <h2 id="urgent-h" className="mb-3 flex items-center gap-2 text-[13px] font-medium text-bj-alert">
            <WarningCircleIcon size={16} className="bj-icon-breathe" />
            {t.dash.urgent}
          </h2>
          <NoticeList notes={urgent.slice(0, 3)} />
        </motion.section>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Focus this week */}
        <motion.section {...rise(3)} aria-labelledby="focus-h">
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
        </motion.section>

        {/* Upcoming appointments */}
        <motion.section {...rise(4)} aria-labelledby="appt-h">
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
        </motion.section>

        {/* Budget at a glance */}
        <motion.section {...rise(5)} aria-labelledby="budget-h">
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
        </motion.section>
      </div>

      <NewTaskSheet open={newTask} onClose={() => setNewTask(false)} />
    </div>
  );
}
