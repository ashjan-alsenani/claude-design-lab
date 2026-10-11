"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ArrowsClockwiseIcon, BabyIcon, BagIcon, CheckIcon, GiftIcon, PlusIcon, SparkleIcon, UsersThreeIcon, WalletIcon, type Icon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { bagProgress, budget, daysBetween, itemDone, progress, upcoming, type CalEntry } from "../model/engine";
import { allIdeas } from "../model/all-ideas";
import { BabyMascot } from "../ui/Mascot";
import { cx } from "../ui/kit";

const ease = [0.22, 1, 0.36, 1] as const;

/** A number that counts up once when it appears (static under reduced motion). */
function Count({ to, fmt }: { to: number; fmt: (n: number) => string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? to : 0);
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) return setV(to);
    const c = animate(mv, to, { duration: 1.1, ease });
    const un = mv.on("change", (x) => setV(Math.round(x)));
    return () => (c.stop(), un());
  }, [to, reduce, mv]);
  return <>{fmt(v)}</>;
}

/** Readiness ring that draws itself. */
function Ring({ pct, size = 112 }: { pct: number; size?: number }) {
  const reduce = useReducedMotion();
  const p = useMotionValue(reduce ? pct : 0);
  useEffect(() => {
    if (!reduce) animate(p, pct, { duration: 1.2, ease });
  }, [pct, reduce, p]);
  const dash = useTransform(p, (x) => `${(163.4 * x) / 100} 999`);
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--qd-tint)" strokeWidth="7" />
      <motion.circle cx="32" cy="32" r="26" fill="none" stroke="var(--qd-primary)" strokeWidth="7" strokeLinecap="round" style={{ strokeDasharray: dash }} />
    </svg>
  );
}

function Bar({ value }: { value: number }) {
  const reduce = useReducedMotion();
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--qd-tint)]">
      <motion.div className="h-full rounded-full bg-[var(--qd-primary)]" initial={{ width: reduce ? `${value * 100}%` : 0 }} animate={{ width: `${Math.max(0.03, value) * 100}%` }} transition={{ duration: 1, ease, delay: 0.2 }} />
    </div>
  );
}

const card = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } } };

/**
 * The mother's dashboard: everything at a glance, calm and alive. A greeting with the countdown and
 * readiness, today's few steps, one tile per part of the plan, the road to the expected date, and an
 * idea of the day. Every tile opens its page.
 */
export function Home() {
  const { plan, t, lang, today, num, pct, money, date, rel, href, dispatch, can, mode, access, pub, newId, say } = useQ();
  const reduce = useReducedMotion();
  const p = plan.profile!;
  const h = t.home;
  const d = h.dash;
  const prog = progress(plan);
  const next = upcoming(plan, today, lang, 3);
  const arrived = !!p.arrived;
  const daysLeft = p.dueDate ? daysBetween(today, p.dueDate) : undefined;
  const baby = plan.items.filter((i) => i.area !== "mother" && i.status !== "skip");
  const bag = bagProgress(plan);
  const confirmed = plan.visits.filter((v) => v.status === "confirmed").length;
  const pending = (pub?.requests ?? []).filter((r) => r.status === "pending").length;
  const reserved = Object.values(pub?.gifts ?? {}).reduce((n, g) => n + g.reserved + g.purchased, 0);
  const toThank = plan.received.filter((r) => !r.thanked).length;
  const favReady = plan.favors.filter((f) => f.status === "ready" || f.status === "received").length;
  const b = budget(plan);
  const [ideaShift, setIdeaShift] = useState(0);
  const pool = allIdeas.filter((x) => x.kind === "favor" || x.kind === "gift" || x.kind === "decor");
  const idea = pool[(Number(today.replaceAll("-", "")) + ideaShift * 7919) % pool.length];

  const toggle = (e: CalEntry) => {
    const task = plan.tasks.find((x) => x.id === e.ref);
    if (task) dispatch({ t: "put", c: "tasks", item: { ...task, status: task.status === "done" ? "todo" : "done" } });
  };

  const tiles: { to: string; show: boolean; color: string; icon: Icon; title: string; value: number; of?: number; fmt?: (n: number) => string; sub: string; bar?: number }[] = [
    { to: "items", show: can("prep"), color: "#a9c1dc", icon: BabyIcon, title: d.prep, value: baby.filter(itemDone).length, of: baby.length, sub: h.ofN(num(baby.filter(itemDone).length), num(baby.length)), bar: baby.length ? baby.filter(itemDone).length / baby.length : 0 },
    { to: "bag", show: can("bag"), color: "#e8a5b5", icon: BagIcon, title: d.bag, value: bag.packed, of: bag.total, sub: h.ofN(num(bag.packed), num(bag.total)), bar: bag.total ? bag.packed / bag.total : 0 },
    { to: "visits", show: can("visits"), color: "#c9b8e0", icon: UsersThreeIcon, title: d.visits, value: confirmed, sub: pending ? d.reqs(num(pending)) : h.visitsN(num(confirmed)) },
    { to: "registry", show: can("registry") || can("received"), color: "#efd28f", icon: GiftIcon, title: d.gifts, value: reserved + plan.received.length, sub: toThank ? d.thanks(num(toThank)) : d.reserved(num(reserved)) },
    { to: "favors", show: can("favors"), color: "#bcd3b3", icon: SparkleIcon, title: d.favors, value: plan.favors.length, sub: d.favorsReady(num(favReady), num(plan.favors.length)), bar: plan.favors.length ? favReady / plan.favors.length : 0 },
    { to: "budget", show: can("budget"), color: "#d9b38c", icon: WalletIcon, title: d.money, value: 0, fmt: () => (b.planned ? money(b.paid) : "—"), sub: b.planned ? d.spent(money(b.paid)) : d.noBudget, bar: b.planned ? Math.min(1, b.committed / b.planned) : undefined },
  ];

  const weeksTotal = 40;
  const weeksLeft = daysLeft !== undefined ? Math.max(0, Math.ceil(daysLeft / 7)) : undefined;
  const along = weeksLeft !== undefined ? Math.min(1, Math.max(0, (weeksTotal - weeksLeft) / weeksTotal)) : undefined;

  const addIdea = () => {
    const name = lang === "ar" ? idea.ar : idea.en;
    const ok =
      idea.kind === "favor"
        ? dispatch({ t: "put", c: "favors", item: { id: newId("fv"), type: name.slice(0, 80), qtyBase: 0, qtyExtra: 0, unitMinor: 0, feesMinor: 0, depositMinor: 0, status: "idea", qtyReceived: 0, qtyGiven: 0 } })
        : idea.kind === "gift"
          ? dispatch({ t: "put", c: "gifts", item: { id: newId("gf"), name: name.slice(0, 120), qtyNeeded: 1, priority: "optional" } })
          : dispatch({ t: "put", c: "tasks", item: { id: newId("tk"), title: name.slice(0, 160), area: "reception", status: "todo" } });
    if (ok) say(t.ideasT.addedToast);
  };

  return (
    <motion.div className="space-y-4" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.07 } } }}>
      {/* Greeting + countdown + readiness */}
      <motion.section variants={card} className="qd-card relative overflow-hidden rounded-[32px] p-5 sm:p-6">
        <div className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-[var(--qd-tint)]" />
        <div className="relative flex items-center gap-4">
          <motion.div animate={reduce ? undefined : { y: [0, -6, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} className="shrink-0">
            <BabyMascot size={84} theme={p.theme} mood={arrived ? "celebrate" : "love"} body />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-[var(--qd-primary)]">{h.hello(p.motherName)} 🤍</p>
            {arrived ? (
              <h1 className="mt-1 text-[1.6rem] font-extrabold leading-tight">{h.arrivedTitle(p.babyName)}</h1>
            ) : daysLeft !== undefined && daysLeft > 0 ? (
              <h1 className="mt-1 text-[1.6rem] font-extrabold leading-tight">
                <span className="text-[2.4rem] text-[var(--qd-primary)]"><Count to={daysLeft} fmt={num} /></span> {lang === "ar" ? "يوم" : "days"}
                <span className="block text-[1rem] font-semibold text-[var(--qd-ink-soft)]">{h.andSee(p.babyName)}</span>
              </h1>
            ) : (
              <h1 className="mt-1 text-[1.5rem] font-extrabold leading-tight">{daysLeft === 0 ? h.dueToday : h.lines[0]}</h1>
            )}
          </div>
          {!arrived && (
            <div className="relative hidden shrink-0 sm:block">
              <Ring pct={prog.pct} />
              <span className="absolute inset-0 grid place-items-center text-center">
                <span>
                  <span className="block text-[1.35rem] font-extrabold"><Count to={prog.pct} fmt={(n) => pct(n)} /></span>
                  <span className="block text-[11px] text-[var(--qd-muted)]">{d.ready}</span>
                </span>
              </span>
            </div>
          )}
        </div>
        {!arrived && (
          <div className="relative mt-4 flex items-center gap-3 sm:hidden">
            <div className="flex-1"><Bar value={prog.pct / 100} /></div>
            <span className="text-[14px] font-extrabold"><Count to={prog.pct} fmt={(n) => pct(n)} /> {d.ready}</span>
          </div>
        )}
        {!arrived && mode !== "helper" && daysLeft !== undefined && daysLeft <= 14 && (
          <div className="relative mt-4 flex flex-wrap items-center gap-3 rounded-[18px] bg-[var(--qd-tint-2)] px-4 py-3">
            <span className="flex-1 text-[14.5px] font-semibold">{h.arrivedAsk}</span>
            <button type="button" onClick={() => dispatch({ t: "arrived", on: true, date: today })} className="h-10 rounded-full bg-[var(--qd-primary)] px-4 text-[14px] font-bold text-white">
              {h.arrivedYes}
            </button>
          </div>
        )}
        {arrived && mode !== "helper" && (
          <button type="button" className="relative mt-3 text-[12.5px] text-[var(--qd-muted)] underline-offset-4 hover:underline" onClick={() => dispatch({ t: "arrived", on: false })}>
            {h.undoArrived}
          </button>
        )}
      </motion.section>

      {/* Today */}
      <motion.section variants={card} className="qd-card rounded-[28px] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-extrabold">{d.today}</h2>
          {can("calendar") && <Link href={href("calendar")} className="text-[13px] font-semibold text-[var(--qd-primary)]">{h.all}</Link>}
        </div>
        {next.length === 0 ? (
          <p className="mt-2 text-[14.5px] text-[var(--qd-ink-soft)]">{h.allDone}</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {next.map((e) => (
              <li key={`${e.kind}-${e.id}`} className="flex items-center gap-3 rounded-[16px] px-1 py-2">
                {e.kind === "task" && access.canEdit ? (
                  <motion.button whileTap={reduce ? undefined : { scale: 0.85 }} type="button" onClick={() => toggle(e)} aria-label={e.title} className="group grid size-8 shrink-0 place-items-center rounded-full border-[2.5px] border-[var(--qd-primary)] text-[var(--qd-primary)] transition-colors hover:bg-[var(--qd-tint)]">
                    <CheckIcon size={15} weight="bold" className="opacity-0 transition-opacity group-hover:opacity-100" />
                  </motion.button>
                ) : (
                  <span className="size-8 shrink-0 rounded-full bg-[var(--qd-tint)]" />
                )}
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{e.title}</span>
                <span className="shrink-0 rounded-full bg-[var(--qd-tint-2)] px-2.5 py-1 text-[12px] font-bold text-[var(--qd-primary-deep)]">{rel(e.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      {/* One tile per part of the plan */}
      <motion.section variants={card} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.filter((x) => x.show).map((x) => (
          <motion.div key={x.to} whileHover={reduce ? undefined : { y: -3 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
            <Link href={href(x.to)} className="qd-card block h-full rounded-[24px] p-4">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-[14px]" style={{ background: `color-mix(in oklab, ${x.color} 45%, var(--qd-paper))`, color: `color-mix(in oklab, ${x.color} 30%, #3b3346)` }}>
                  <x.icon size={21} weight="fill" />
                </span>
                <span className="text-[1.45rem] font-extrabold tabular-nums">{x.fmt ? x.fmt(0) : <Count to={x.value} fmt={num} />}</span>
              </div>
              <p className="mt-3 text-[15px] font-bold">{x.title}</p>
              <p className="mt-0.5 truncate text-[12.5px] text-[var(--qd-muted)]">{x.sub}</p>
              {x.bar !== undefined && <div className="mt-2.5"><Bar value={x.bar} /></div>}
            </Link>
          </motion.div>
        ))}
      </motion.section>

      {/* The road to the expected date */}
      {!arrived && along !== undefined && (
        <motion.section variants={card} className="qd-card rounded-[28px] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-extrabold">{d.journey}</h2>
            <span className="text-[13px] font-semibold text-[var(--qd-muted)]">{d.weeksLeft(num(weeksLeft!))}</span>
          </div>
          <div className="relative mt-5 h-12">
            <div className="absolute inset-x-2 top-1/2 h-[3px] -translate-y-1/2 rounded-full border-t-[3px] border-dashed border-[var(--qd-line)]" />
            <motion.div className="absolute inset-y-0 start-2 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[var(--qd-primary)]" initial={{ width: 0 }} animate={{ width: `calc((100% - 4.5rem) * ${along} + 1rem)` }} transition={{ duration: 1.4, ease }} />
            <motion.div className="absolute top-1/2 -translate-y-1/2" initial={{ insetInlineStart: "0%" }} animate={{ insetInlineStart: `calc((100% - 4.5rem) * ${along})` }} transition={{ duration: 1.4, ease }}>
              <BabyMascot size={40} theme={p.theme} animate={false} />
            </motion.div>
            <span className="absolute end-0 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-[var(--qd-tint)] text-[18px]">🍼</span>
          </div>
          <div className="mt-1 flex justify-between text-[12px] text-[var(--qd-muted)]">
            <span>{d.now}</span>
            <span>{d.due}: {date(p.dueDate!, "long")}</span>
          </div>
        </motion.section>
      )}

      {/* Idea of the day */}
      {idea && (
        <motion.section variants={card} className="relative overflow-hidden rounded-[28px] bg-[var(--qd-tint)] p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-bold text-[var(--qd-primary-deep)]">{d.idea}</p>
            <button type="button" onClick={() => setIdeaShift((n) => n + 1)} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--qd-primary-deep)]">
              <ArrowsClockwiseIcon size={14} /> {d.another}
            </button>
          </div>
          <motion.p key={idea.id} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-[17px] font-extrabold leading-snug">
            {lang === "ar" ? idea.ar : idea.en}
          </motion.p>
          {(lang === "ar" ? idea.arNote : idea.enNote) && <p className="mt-1 text-[13px] text-[var(--qd-ink-soft)]">{lang === "ar" ? idea.arNote : idea.enNote}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {access.canEdit && (
              <button type="button" onClick={addIdea} className="inline-flex h-9 items-center gap-1 rounded-full bg-[var(--qd-primary)] px-4 text-[13px] font-bold text-white">
                <PlusIcon size={14} weight="bold" /> {t.common.add}
              </button>
            )}
            <Link href={href("ideas")} className={cx("inline-flex h-9 items-center rounded-full bg-[var(--qd-paper)] px-4 text-[13px] font-bold")}>{t.nav.ideas}</Link>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
