"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BagIcon, BellIcon, BellRingingIcon, CalendarHeartIcon, CaretLeftIcon, HandHeartIcon, PackageIcon, UsersThreeIcon, WalletIcon, CheckSquareIcon, type Icon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { reminders, type Reminder } from "../model/engine";
import { Sheet, cx } from "./kit";

const icons: Record<Reminder["kind"], Icon> = { appt: CalendarHeartIcon, task: CheckSquareIcon, payment: WalletIcon, visit: UsersThreeIcon, request: UsersThreeIcon, delivery: PackageIcon, bag: BagIcon, thanks: HandHeartIcon };

/** Reminders the current viewer may see (helpers only get the sections they were given). */
export function useReminders() {
  const { plan, today, can } = useQ();
  return useMemo(() => {
    const allowed: Record<Reminder["page"], boolean> = { calendar: can("calendar"), budget: can("budget"), visits: can("visits"), bag: can("bag"), received: can("received"), favors: can("favors") };
    return reminders(plan, today).filter((r) => allowed[r.page]);
  }, [plan, today, can]);
}

function useText() {
  const { lang, num, rel, timeLabel, date } = useQ();
  const ar = lang === "ar";
  return (r: Reminder) => {
    const when = r.date ? `${r.tone === "late" ? (ar ? `فات موعدها (${date(r.date)})` : `overdue (${date(r.date)})`) : rel(r.date)}${r.time ? ` · ${timeLabel(r.time)}` : ""}` : "";
    const n = num(r.count ?? 0);
    switch (r.kind) {
      case "appt": return { title: ar ? `موعدك: ${r.title}` : `Appointment: ${r.title}`, when };
      case "task": return { title: ar ? `لا تنسين: ${r.title}` : `Don't forget: ${r.title}`, when };
      case "payment": return { title: ar ? `دفعة: ${r.title}` : `Payment: ${r.title}`, when };
      case "visit": return { title: ar ? `زيارة ${r.title}` : `Visit: ${r.title}`, when };
      case "delivery": return { title: ar ? `يوصلك: ${r.title}` : `Arriving: ${r.title}`, when };
      case "request": return { title: ar ? `عندك ${n} طلب زيارة ينتظر ردك` : `${n} visit request(s) waiting for you`, when: ar ? "اقبلي أو اعتذري بضغطة" : "Accept or decline with one tap" };
      case "bag": return { title: ar ? `شنطة المستشفى: باقي ${n} غرض` : `Hospital bag: ${n} item(s) left`, when: ar ? "الموعد قرّب، جهزيها من الحين" : "The date is close; pack it now" };
      case "thanks": return { title: ar ? `باقي ${n} شكر ما أرسلتيه` : `${n} thank-you(s) still to send`, when: ar ? "رسالة الشكر جاهزة" : "Your thank-you message is ready" };
    }
  };
}

const toneCls = { late: "bg-[var(--qd-alert-soft)] text-[var(--qd-alert)]", soon: "bg-[var(--qd-tint)] text-[var(--qd-primary)]", info: "bg-[var(--qd-accent-soft)] text-[var(--qd-amber)]" };

function Row({ r, onGo }: { r: Reminder; onGo?: () => void }) {
  const { href } = useQ();
  const text = useText()(r);
  const I = icons[r.kind];
  return (
    <li>
      <Link href={href(r.page)} onClick={onGo} className="flex items-center gap-3 rounded-[18px] bg-[var(--qd-paper)] p-3 ring-1 ring-[var(--qd-line)] hover:ring-[var(--qd-primary)]">
        <span className={cx("grid size-10 shrink-0 place-items-center rounded-full", toneCls[r.tone])}><I size={20} weight="duotone" /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14.5px] font-bold">{text.title}</span>
          {text.when && <span className={cx("block truncate text-[12.5px]", r.tone === "late" ? "font-semibold text-[var(--qd-alert)]" : "text-[var(--qd-muted)]")}>{text.when}</span>}
        </span>
        <CaretLeftIcon size={16} className="shrink-0 text-[var(--qd-muted)] ltr:rotate-180" />
      </Link>
    </li>
  );
}

/** The bell in the header: a count and a sheet with every reminder. */
export function RemindersBell() {
  const { lang, num } = useQ();
  const list = useReminders();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ar = lang === "ar";
  const label = ar ? "التنبيهات" : "Reminders";
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={list.length ? `${label} (${list.length})` : label} title={label} className="relative grid size-10 place-items-center rounded-full bg-white/70 text-[var(--qd-ink-soft)] hover:bg-white">
        <motion.span animate={list.length && !reduce ? { rotate: [0, -14, 12, -8, 0] } : undefined} transition={{ duration: 0.9, delay: 0.8, repeat: list.length ? 2 : 0, repeatDelay: 4 }} className="grid place-items-center">
          {list.length ? <BellRingingIcon size={20} weight="duotone" /> : <BellIcon size={20} />}
        </motion.span>
        {list.length > 0 && <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--qd-primary)] px-1 text-[11px] font-bold text-white">{list.length > 9 ? `${num(9)}+` : num(list.length)}</span>}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        {!open ? null : list.length ? (
          <ul className="space-y-2">{list.map((r) => <Row key={r.id} r={r} onGo={() => setOpen(false)} />)}</ul>
        ) : (
          <p className="py-6 text-center text-[15px] text-[var(--qd-muted)]">{ar ? "ما عندك شي مستعجل. استمتعي بيومك" : "Nothing urgent. Enjoy your day"}</p>
        )}
        <p className="mt-4 text-[12.5px] text-[var(--qd-muted)]">{ar ? "التنبيهات داخل التطبيق فقط، وما نرسل أي رسالة باسمك." : "Reminders stay in the app; nothing is sent in your name."}</p>
      </Sheet>
    </>
  );
}

/** «لا تنسين» on the dashboard: the top three, with a link to see all. */
export function RemindersCard() {
  const { lang, num } = useQ();
  const list = useReminders();
  const [all, setAll] = useState(false);
  if (!list.length) return null;
  const ar = lang === "ar";
  const shown = all ? list : list.slice(0, 3);
  return (
    <section className="qd-card rounded-[28px] p-4 sm:p-5" aria-labelledby="qd-rem">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-full bg-[var(--qd-tint)] text-[var(--qd-primary)]"><BellRingingIcon size={19} weight="duotone" /></span>
        <h2 id="qd-rem" className="flex-1 text-[1.1rem] font-extrabold">{ar ? "لا تنسين" : "Don't forget"}</h2>
        <span className="text-[13px] text-[var(--qd-muted)]">{num(list.length)}</span>
      </div>
      <ul className="space-y-2">{shown.map((r) => <Row key={r.id} r={r} />)}</ul>
      {list.length > 3 && (
        <button type="button" onClick={() => setAll(!all)} className="mt-2 text-[13px] font-semibold text-[var(--qd-primary)]">{all ? (ar ? "أقل" : "Show less") : ar ? `عرض الكل (${num(list.length)})` : `Show all (${list.length})`}</button>
      )}
    </section>
  );
}
