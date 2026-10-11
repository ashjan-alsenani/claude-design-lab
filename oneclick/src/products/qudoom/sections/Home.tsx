"use client";

import Link from "next/link";
import { BabyIcon, CalendarCheckIcon, CheckIcon, GiftIcon, HeartIcon, ImagesIcon, ListChecksIcon, PackageIcon, TruckIcon, UsersThreeIcon, WalletIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { budget, daysBetween, nextVisit, pendingDeliveries, progress, upcoming, type CalEntry } from "../model/engine";
import { ThemeArt } from "../ui/Art";
import { Badge, Bar, Button, Card, Ring, SectionTitle, Stat, cx } from "../ui/kit";

const idTime = (id: string) => {
  const m = /^[a-z]+-([0-9a-z]{8,9})/.exec(id);
  const n = m ? parseInt(m[1], 36) : NaN;
  return n > 1.6e12 && n < 4e12 ? n : 0;
};

export function Home() {
  const { plan, t, lang, today, num, pct, money, date, rel, href, dispatch, can, timeLabel, mode, access } = useQ();
  const p = plan.profile!;
  const h = t.home;
  const prog = progress(plan);
  const b = budget(plan);
  const next = upcoming(plan, today, lang, 5);
  const waiting = pendingDeliveries(plan).slice(0, 3);
  const visit = nextVisit(plan, today);
  const arrived = !!p.arrived;
  const daysLeft = p.dueDate ? daysBetween(today, p.dueDate) : undefined;
  const line = h.lines[(Number(today.slice(8, 10)) + p.motherName.length) % h.lines.length];
  const thanksPending = plan.received.filter((r) => !r.thanked).length;
  const recent = [
    ...plan.items.map((x) => ({ id: x.id, label: x.name, icon: BabyIcon, to: "items" })),
    ...plan.gifts.map((x) => ({ id: x.id, label: x.name, icon: GiftIcon, to: "registry" })),
    ...plan.received.map((x) => ({ id: x.id, label: `${x.from}`, icon: HeartIcon, to: "received" })),
    ...plan.visits.map((x) => ({ id: x.id, label: x.name, icon: UsersThreeIcon, to: "visits" })),
    ...plan.orders.map((x) => ({ id: x.id, label: x.title, icon: PackageIcon, to: "budget" })),
    ...plan.memories.map((x) => ({ id: x.id, label: x.title, icon: ImagesIcon, to: "memories" })),
  ]
    .map((x) => ({ ...x, at: idTime(x.id) }))
    .filter((x) => x.at)
    .sort((a, b) => b.at - a.at)
    .slice(0, 4);

  const toggleTask = (e: CalEntry) => {
    const task = plan.tasks.find((x) => x.id === e.ref);
    if (task) dispatch({ t: "put", c: "tasks", item: { ...task, status: task.status === "done" ? "todo" : "done" } });
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <section className="qd-card relative overflow-hidden rounded-[28px]">
        <ThemeArt theme={p.theme} className="pointer-events-none absolute inset-0 size-full opacity-70" />
        <div className="relative grid gap-6 p-6 sm:grid-cols-[1.3fr_1fr] sm:p-8">
          <div>
            <p className="text-[14px] font-medium text-[var(--qd-primary)]">{h.hello(p.motherName)}</p>
            <h1 className="mt-1 text-[1.75rem] font-bold leading-tight sm:text-[2.2rem]">{arrived ? h.arrivedTitle(p.babyName) : p.babyName ? (lang === "ar" ? `بانتظار ${p.babyName} 🤍` : `Waiting for ${p.babyName} 🤍`) : line}</h1>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[var(--qd-ink-soft)]">{arrived ? h.arrivedSub : p.babyName ? line : h.restTip}</p>
            {!arrived && (
              <div className="mt-4">
                {daysLeft === undefined ? (
                  <p className="text-[13.5px] text-[var(--qd-muted)]">{h.noDue}</p>
                ) : daysLeft > 0 ? (
                  <p className="inline-flex flex-wrap items-baseline gap-x-2 rounded-[16px] bg-[var(--qd-paper)]/85 px-4 py-2.5">
                    <span className="text-[13px] text-[var(--qd-muted)]">{h.expected}: {date(p.dueDate!, "long")}</span>
                    <span className="text-[15px] font-semibold">{h.daysLeft(num(daysLeft))}</span>
                  </p>
                ) : (
                  <p className="text-[14px] font-medium">{daysLeft === 0 ? h.dueToday : h.pastDue}</p>
                )}
              </div>
            )}
          </div>
          {!arrived && (
            <div className="flex items-center gap-4 sm:justify-end">
              <Ring value={prog.pct / 100} size={120}>
                <span>
                  <span className="block text-[1.6rem] font-bold tabular-nums">{pct(prog.pct)}</span>
                  <span className="block text-[11.5px] text-[var(--qd-muted)]">{h.ready}</span>
                </span>
              </Ring>
              <div className="max-w-[12rem]">
                <p className="text-[14px] font-semibold">{h.readyOf(num(prog.done), num(prog.total))}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--qd-muted)]">{h.readyHow}</p>
              </div>
            </div>
          )}
        </div>
        {!arrived && mode !== "helper" && daysLeft !== undefined && daysLeft <= 14 && (
          <div className="relative flex flex-wrap items-center gap-3 border-t border-[var(--qd-line)] bg-[var(--qd-paper)]/80 px-6 py-3 sm:px-8">
            <span className="text-[14px]">{h.arrivedAsk}</span>
            <Button size="sm" variant="soft" onClick={() => dispatch({ t: "arrived", on: true, date: today })}>
              {h.arrivedYes}
            </Button>
          </div>
        )}
        {arrived && mode !== "helper" && (
          <div className="relative border-t border-[var(--qd-line)] px-6 py-2 sm:px-8">
            <button type="button" className="text-[12.5px] text-[var(--qd-muted)] underline-offset-4 hover:underline" onClick={() => dispatch({ t: "arrived", on: false })}>
              {h.undoArrived}
            </button>
          </div>
        )}
      </section>

      {/* After arrival: rest, visits, gifts and memories come first */}
      {arrived && (
        <div className="grid gap-3 sm:grid-cols-3">
          {can("visits") && <QuickCard to={href("visits")} icon={UsersThreeIcon} title={t.nav.visits} sub={visit ? `${date(visit.confirmed!.date, "weekday")} · ${timeLabel(visit.confirmed!.time)}` : h.noVisit} />}
          {can("received") && <QuickCard to={href("received")} icon={HeartIcon} title={t.nav.received} sub={thanksPending ? `${t.receivedT.notThanked}: ${num(thanksPending)}` : t.receivedT.thanked} />}
          {can("memories") && <QuickCard to={href("memories")} icon={ImagesIcon} title={t.nav.memories} sub={t.memoriesT.sub} />}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <Card className="p-5 sm:p-6">
          <SectionTitle title={h.next} action={can("calendar") ? <Link href={href("calendar")} className="text-[13px] font-semibold text-[var(--qd-primary)]">{t.nav.calendar}</Link> : undefined} />
          {next.length === 0 ? (
            <p className="mt-4 text-[14px] text-[var(--qd-muted)]">{h.noNext}</p>
          ) : (
            <ul className="mt-3 divide-y divide-[var(--qd-line)]">
              {next.map((e) => (
                <li key={e.id} className="flex min-h-14 items-center gap-3 py-2">
                  {e.kind === "task" ? (
                    <button type="button" onClick={() => toggleTask(e)} aria-label={`${t.common.done}: ${e.title}`} className="grid size-11 shrink-0 place-items-center">
                      <span className="grid size-6 place-items-center rounded-full border-2 border-[#d9cec3]"><CheckIcon size={12} className="opacity-0" /></span>
                    </button>
                  ) : (
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--qd-tint)] text-[var(--qd-primary)]"><CalendarCheckIcon size={18} /></span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px]">{e.title}</p>
                    <p className="text-[12.5px] text-[var(--qd-muted)]">{t.cal.kinds[e.kind]} · {rel(e.date)}{e.time ? ` · ${timeLabel(e.time)}` : ""}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          {can("budget") && (
            <Card className="p-5 sm:p-6">
              <SectionTitle title={h.budget} action={<Link href={href("budget")} className="text-[13px] font-semibold text-[var(--qd-primary)]"><WalletIcon size={18} className="inline" /></Link>} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat label={t.money.committed} value={money(b.committed)} />
                <Stat label={t.money.paid} value={money(b.paid)} tone="sage" />
                <Stat label={t.money.toPay} value={money(b.toPay)} />
                <Stat label={t.money.left} value={b.planned ? money(b.left) : "—"} tone={b.over ? "alert" : undefined} />
              </div>
              {b.planned > 0 && <Bar className="mt-4" value={b.committed / b.planned} tone={b.over ? "alert" : "primary"} label={t.money.committed} />}
              {b.over && <p className="mt-2 text-[12.5px] text-[var(--qd-muted)]">{t.money.over}</p>}
            </Card>
          )}
          {(waiting.length > 0 || can("visits")) && (
            <Card className="p-5 sm:p-6">
              {waiting.length > 0 && (
                <>
                  <SectionTitle title={h.waiting} />
                  <ul className="mt-2 space-y-1.5">
                    {waiting.map((w) => (
                      <li key={w.id} className="flex items-center gap-2.5 text-[14px]">
                        <TruckIcon size={18} className="shrink-0 text-[var(--qd-primary)]" />
                        <span className="min-w-0 flex-1 truncate">{w.title}</span>
                        {w.date && <Badge>{rel(w.date)}</Badge>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {can("visits") && !arrived && (
                <div className={cx(waiting.length > 0 && "mt-5 border-t border-[var(--qd-line)] pt-4")}>
                  <p className="text-[13px] text-[var(--qd-muted)]">{h.nextVisit}</p>
                  <p className="mt-1 text-[15px] font-semibold">{visit ? `${visit.name} · ${date(visit.confirmed!.date, "weekday")} · ${timeLabel(visit.confirmed!.time)}` : h.noVisit}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {access.canEdit ? (
        <section>
          <SectionTitle title={h.quick} />
          <div className="qd-scroll-x -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {[
              { to: "items", label: h.qItem, s: "prep" as const, icon: BabyIcon },
              { to: "calendar", label: h.qTask, s: "calendar" as const, icon: ListChecksIcon },
              { to: "visits", label: h.qVisit, s: "visits" as const, icon: UsersThreeIcon },
              { to: "received", label: h.qGift, s: "received" as const, icon: HeartIcon },
              { to: "budget", label: h.qOrder, s: "budget" as const, icon: PackageIcon },
            ]
              .filter((x) => can(x.s))
              .map((x) => (
                <Link key={x.to} href={`${href(x.to)}?add=1`} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] px-4 text-[14px] font-medium hover:border-[var(--qd-primary)]">
                  <x.icon size={18} className="text-[var(--qd-primary)]" /> + {x.label}
                </Link>
              ))}
          </div>
        </section>
      ) : null}

      {recent.length > 0 && (
        <section>
          <SectionTitle title={h.activity} />
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {recent.map((r) => (
              <li key={r.id}>
                <Link href={href(r.to)} className="flex min-h-12 items-center gap-3 rounded-[16px] bg-[var(--qd-paper)] px-4 py-2.5 text-[14px] hover:bg-[var(--qd-tint-2)]">
                  <r.icon size={18} className="shrink-0 text-[var(--qd-primary)]" />
                  <span className="min-w-0 flex-1 truncate">{r.label}</span>
                  <span className="text-[12px] text-[var(--qd-muted)]">{rel(new Date(r.at).toISOString().slice(0, 10))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function QuickCard({ to, icon: I, title, sub }: { to: string; icon: typeof HeartIcon; title: string; sub: string }) {
  return (
    <Link href={to} className="qd-card flex items-center gap-3 rounded-[20px] p-4 hover:border-[var(--qd-primary)]">
      <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[var(--qd-tint)] text-[var(--qd-primary)]"><I size={20} /></span>
      <span className="min-w-0">
        <span className="block font-semibold">{title}</span>
        <span className="block truncate text-[12.5px] text-[var(--qd-muted)]">{sub}</span>
      </span>
    </Link>
  );
}
