"use client";

import Link from "next/link";
import { BabyIcon, BagIcon, CalendarHeartIcon, CaretLeftIcon, CheckIcon, GiftIcon, StarIcon, type Icon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { bagProgress, daysBetween, itemDone, progress, upcoming, type CalEntry } from "../model/engine";
import { BabyMascot } from "../ui/Mascot";
import { cx } from "../ui/kit";

/**
 * Home, in the OneClick look: a warm greeting with Baby Clicky, one readiness number, the single
 * next step, and four big colorful doors. Everything else lives one tap away.
 */
export function Home() {
  const { plan, t, lang, today, num, pct, date, rel, href, dispatch, can, mode, access } = useQ();
  const p = plan.profile!;
  const h = t.home;
  const prog = progress(plan);
  const next = upcoming(plan, today, lang, 4);
  const first = next[0];
  const arrived = !!p.arrived;
  const daysLeft = p.dueDate ? daysBetween(today, p.dueDate) : undefined;
  const babyItems = plan.items.filter((i) => i.area === "baby" && i.status !== "skip");
  const bag = bagProgress(plan);
  const confirmed = plan.visits.filter((v) => v.status === "confirmed").length;

  const toggle = (e: CalEntry) => {
    const task = plan.tasks.find((x) => x.id === e.ref);
    if (task) dispatch({ t: "put", c: "tasks", item: { ...task, status: task.status === "done" ? "todo" : "done" } });
  };

  const doors: { to: string; show: boolean; color: string; icon: Icon; title: string; sub: string }[] = [
    { to: "items", show: can("prep"), color: "#a9c1dc", icon: BabyIcon, title: h.tPrep, sub: h.ofN(num(babyItems.filter(itemDone).length), num(babyItems.length)) },
    { to: "bag", show: can("bag"), color: "#e8a5b5", icon: BagIcon, title: h.tBag, sub: h.ofN(num(bag.packed), num(bag.total)) },
    { to: can("visits") ? "visits" : "events", show: can("visits") || can("reception"), color: "#c9b8e0", icon: StarIcon, title: h.tReception, sub: h.visitsN(num(confirmed)) },
    { to: "ideas", show: can("registry") || can("favors"), color: "#efd28f", icon: GiftIcon, title: h.tIdeas, sub: h.tIdeasSub },
  ];

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <section className="flex items-end gap-3 pt-1">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[var(--qd-primary)]">{h.hello(p.motherName)} 🤍</p>
          <h1 className="mt-1 text-[2rem] font-extrabold leading-[1.15] sm:text-[2.5rem]">
            {arrived ? (
              h.arrivedTitle(p.babyName)
            ) : daysLeft !== undefined && daysLeft > 0 ? (
              <>
                <span className="relative inline-block">
                  {h.bigLeft(num(daysLeft))}
                  <svg className="absolute -bottom-2 start-0 h-3 w-full" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 7 Q50 0 98 6" stroke="#e8a5b5" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
                <br />
                {h.andSee(p.babyName)}
              </>
            ) : daysLeft === 0 ? (
              h.dueToday
            ) : (
              h.lines[0]
            )}
          </h1>
          {!arrived && p.dueDate && <p className="mt-3 text-[13px] text-[var(--qd-muted)]">{h.expected}: {date(p.dueDate, "long")}</p>}
          {arrived && <p className="mt-2 text-[15px] text-[var(--qd-ink-soft)]">{h.arrivedSub}</p>}
        </div>
        <BabyMascot size={96} theme={p.theme} mood={arrived ? "celebrate" : "happy"} body />
      </section>

      {/* Readiness */}
      {!arrived && (
        <section className="qd-card flex items-center gap-4 rounded-[26px] p-4">
          <svg viewBox="0 0 64 64" className="size-[68px] shrink-0 -rotate-90" aria-hidden="true">
            <circle cx="32" cy="32" r="26" fill="none" stroke="var(--qd-tint)" strokeWidth="9" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="var(--qd-primary)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(163.4 * prog.pct) / 100} 999`} />
          </svg>
          <div className="min-w-0">
            <p className="text-[1.45rem] font-extrabold">{h.readyPct(pct(prog.pct))}</p>
            <p className="text-[13px] text-[var(--qd-muted)]">{h.readyOf(num(prog.done), num(prog.total))} · {h.lines[0]}</p>
          </div>
        </section>
      )}

      {!arrived && mode !== "helper" && daysLeft !== undefined && daysLeft <= 14 && (
        <section className="flex flex-wrap items-center gap-3 rounded-[22px] bg-[var(--qd-blob-3)] px-4 py-3">
          <span className="flex-1 text-[15px] font-semibold">{h.arrivedAsk}</span>
          <button type="button" onClick={() => dispatch({ t: "arrived", on: true, date: today })} className="h-10 rounded-full bg-[var(--qd-primary)] px-4 text-[14px] font-bold text-white">
            {h.arrivedYes}
          </button>
        </section>
      )}
      {arrived && mode !== "helper" && (
        <button type="button" className="text-[12.5px] text-[var(--qd-muted)] underline-offset-4 hover:underline" onClick={() => dispatch({ t: "arrived", on: false })}>
          {h.undoArrived}
        </button>
      )}

      {/* The one next step */}
      <section className="rounded-[22px] border-2 border-dashed border-[var(--qd-star)] bg-[var(--qd-paper)]/90 p-4">
        <p className="text-[13px] font-bold text-[var(--qd-amber)]">{h.nextStep}</p>
        {first ? (
          <div className="mt-2 flex items-center gap-3">
            {first.kind === "task" && access.canEdit ? (
              <button type="button" onClick={() => toggle(first)} aria-label={first.title} className="grid size-8 shrink-0 place-items-center rounded-full border-[3px] border-[var(--qd-primary)] text-[var(--qd-primary)] hover:bg-[var(--qd-tint)]">
                <CheckIcon size={15} weight="bold" className="opacity-0 hover:opacity-100" />
              </button>
            ) : (
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--qd-tint)] text-[var(--qd-primary)]"><CalendarHeartIcon size={17} weight="fill" /></span>
            )}
            <p className="min-w-0 flex-1 text-[16px] font-semibold">{first.title}</p>
            <span className="shrink-0 rounded-full bg-[var(--qd-tint)] px-3 py-1 text-[12px] font-bold text-[var(--qd-primary-deep)]">{rel(first.date)}</span>
          </div>
        ) : (
          <p className="mt-1 text-[15px]">{h.allDone}</p>
        )}
      </section>

      {/* Four doors */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {doors.filter((d) => d.show).map((d) => (
          <Link key={d.title} href={href(d.to)} className="group rounded-[26px] p-4 transition-transform active:scale-[0.98]" style={{ background: `color-mix(in oklab, ${d.color} 28%, var(--qd-paper))` }}>
            <span className="grid size-12 place-items-center rounded-2xl transition-transform group-hover:-rotate-6" style={{ background: d.color, color: `color-mix(in oklab, ${d.color} 30%, #3b3346)` }}>
              <d.icon size={24} weight="fill" />
            </span>
            <p className="mt-3 text-[16.5px] font-bold">{d.title}</p>
            <p className="text-[13px] text-[var(--qd-muted)]">{d.sub}</p>
          </Link>
        ))}
      </section>

      {/* Coming up (in-app reminders) */}
      {next.length > 1 && can("calendar") && (
        <section className="qd-card rounded-[26px] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold">{h.soon}</h2>
            <Link href={href("calendar")} className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-[var(--qd-primary)]">
              {h.all} <CaretLeftIcon size={13} className="ltr:rotate-180" />
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-[var(--qd-line)]">
            {next.slice(1).map((e) => (
              <li key={`${e.kind}-${e.id}`} className="flex items-center gap-3 py-2.5">
                <span className={cx("size-2.5 shrink-0 rounded-full", e.kind === "task" ? "bg-[#a8c09f]" : e.kind === "visit" ? "bg-[#c9b8e0]" : "bg-[#efd28f]")} />
                <span className="min-w-0 flex-1 truncate text-[14.5px]">{e.title}</span>
                <span className="shrink-0 text-[12.5px] text-[var(--qd-muted)]">{rel(e.date)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
