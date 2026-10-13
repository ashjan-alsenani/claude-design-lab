"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CheckIcon, MapTrifoldIcon } from "@phosphor-icons/react";
import { isLookTask } from "../model/looks";
import { useQ } from "../app/state";
import { PageHeader } from "../ui/kit";
import { bagProgress, daysBetween, itemDone } from "../model/engine";
import type { Plan, SectionId } from "../model/types";
import { cx } from "../ui/kit";

/**
 * «خطوة بخطوة»: where to start and what comes next, in order, with a rough time for each step
 * counted back from the expected date. Each step ticks itself when the plan shows it's done, and
 * opens the page where it happens. Organising only, no medical advice.
 */
export type Step = { id: string; to: string; section?: SectionId; weeks?: number; ar: [string, string]; en: [string, string]; done: (p: Plan, ctx: { links: number }) => boolean };

const pct = (done: number, total: number) => (total ? done / total : 0);

export const steps: Step[] = [
  { id: "start", to: "settings", ar: ["ابدئي ملفك", "اسمك، ولد ولا بنت، والموعد المتوقع إذا تبين."], en: ["Start your profile", "Your name, boy or girl, and the expected date if you like."], done: (p) => !!p.profile },
  { id: "items", to: "items", section: "prep", weeks: 14, ar: ["علّمي اللي عندك من أغراض البيبي", "القائمة جاهزة، بس اضغطي على اللي متوفر عندك."], en: ["Tick the baby things you already have", "The list is ready; just tap what you have."], done: (p) => { const l = p.items.filter((i) => i.area === "baby" && i.status !== "skip"); return pct(l.filter(itemDone).length, l.length) >= 0.5; } },
  { id: "nursery", to: "nursery", section: "nursery", weeks: 10, ar: ["جهزي غرفة أو ركن البيبي", "السرير والتخزين والإضاءة، خطوة خطوة."], en: ["Get the room or corner ready", "Bed, storage and light, one by one."], done: (p) => { const l = p.items.filter((i) => i.area === "nursery" && i.status !== "skip"); return pct(l.filter(itemDone).length, l.length) >= 0.5; } },
  { id: "favors", to: "ideas", section: "favors", weeks: 8, ar: ["اختاري التوزيعات واطلبيها بدري", "اختاري من مئات الأفكار، والطلب المبكر يريحك."], en: ["Pick your favors and order early", "Choose from hundreds of ideas; ordering early is calmer."], done: (p) => p.favors.some((f) => f.status !== "idea") },
  { id: "look", to: "looks", section: "reception", weeks: 7, ar: ["اختاري شكل استقبال البيبي", "ألف شكل مرسوم بالألوان، اختاري اللي يشبهك."], en: ["Choose the welcome look", "A thousand illustrated looks; pick the one that feels like you."], done: (p) => p.tasks.some(isLookTask) },
  { id: "registry", to: "registry", section: "registry", weeks: 6, ar: ["جهزي قائمة الهدايا وشاركي الرابط", "حتى ما تتكرر الهدايا، والأهل يعرفون اللي تحتاجينه."], en: ["Make the gift list and share it", "So gifts don't repeat and family knows what you need."], done: (p, c) => p.gifts.length >= 3 && c.links > 0 },
  { id: "bag", to: "bag", section: "bag", weeks: 5, ar: ["جهزي شنطة المستشفى", "شنطة لك، وللبيبي، وللمرافقة، والأوراق."], en: ["Pack the hospital bag", "One for you, one for baby, one for your companion, and papers."], done: (p) => { const b = bagProgress(p); return pct(b.packed, b.total) >= 0.8; } },
  { id: "rest", to: "mother", section: "mother", weeks: 4, ar: ["رتبي خطة راحتك بعد الولادة", "مين يساعد بالأكل والبيت والأهل في الأيام الأولى."], en: ["Plan your rest after birth", "Who helps with meals, home and family in the first days."], done: (p) => p.helpRows.some((r) => !!r.owner) },
  { id: "hosp", to: "hospitality", section: "hospitality", weeks: 3, ar: ["حضّري الضيافة", "القهوة والتمر والحلويات بكميات تقديرية."], en: ["Plan the hospitality", "Coffee, dates and sweets with estimated amounts."], done: (p) => p.hospitality.length >= 3 },
  { id: "visits", to: "visits", section: "visits", weeks: 2, ar: ["حددي أوقات الزيارات", "شاركي رابط، والزوار يختارون من أوقاتك."], en: ["Set your visiting hours", "Share a link; visitors pick from your times."], done: (_p, c) => c.links > 1 },
  { id: "thanks", to: "received", section: "received", ar: ["بعد الوصول: سجلي الهدايا واشكري", "رسائل شكر جاهزة، وأنتِ ترسلينها بنفسك."], en: ["After arrival: log gifts and say thanks", "Ready thank-you notes that you send yourself."], done: (p) => !!p.profile?.arrived && p.received.length > 0 && p.received.every((r) => r.thanked) },
  { id: "memories", to: "memories", section: "memories", ar: ["احفظي الذكريات", "أول صورة، أول زيارة، وأول ابتسامة."], en: ["Keep the memories", "First photo, first visit, first smile."], done: (p) => p.memories.length > 0 },
];

export function useSteps() {
  const { plan, can, pub } = useQ();
  const links = (pub?.links ?? []).filter((l) => l.active).length;
  const list = steps.filter((s) => !s.section || can(s.section));
  const done = list.map((s) => s.done(plan, { links }));
  const current = done.findIndex((d) => !d);
  return { list, done, current: current === -1 ? list.length : current };
}

export function StepsPage() {
  const { t, lang, plan, href, today, num, date } = useQ();
  const reduce = useReducedMotion();
  const { list, done, current } = useSteps();
  const ar = lang === "ar";
  const due = plan.profile?.dueDate;
  const when = (w?: number) => {
    if (w === undefined) return ar ? "بعد الوصول" : "After arrival";
    if (!due) return ar ? `قبل الموعد بحوالي ${num(w)} أسابيع` : `About ${num(w)} weeks before`;
    const d = new Date(`${due}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - w * 7);
    const iso = d.toISOString().slice(0, 10);
    return daysBetween(today, iso) <= 0 ? (ar ? "الحين وقتها" : "Now is a good time") : `${ar ? "من" : "From"} ${date(iso)}`;
  };
  const doneCount = done.filter(Boolean).length;
  return (
    <div className="space-y-5">
      <PageHeader title={t.nav.steps} sub={ar ? `خلصتي ${num(doneCount)} من ${num(list.length)}. ابدئي من الخطوة الملونة.` : `${num(doneCount)} of ${num(list.length)} done. Start with the highlighted step.`} />
      <ol className="relative space-y-3">
        <span aria-hidden="true" className="absolute bottom-6 start-[1.35rem] top-6 w-[3px] rounded-full bg-[var(--qd-line)]" />
        <motion.span aria-hidden="true" className="absolute start-[1.35rem] top-6 w-[3px] rounded-full bg-[var(--qd-primary)]" initial={{ height: 0 }} animate={{ height: `${(Math.min(current, list.length - 1) / Math.max(1, list.length - 1)) * 100}%` }} transition={{ duration: reduce ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }} />
        {list.map((s, i) => {
          const isDone = done[i];
          const isNow = i === current;
          const [title, why] = ar ? s.ar : s.en;
          return (
            <motion.li key={s.id} initial={reduce ? false : { opacity: 0, x: ar ? 16 : -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.4 }} className="relative flex gap-3">
              <span className={cx("relative z-10 grid size-11 shrink-0 place-items-center rounded-full border-[3px] text-[15px] font-extrabold", isDone ? "border-[var(--qd-primary)] bg-[var(--qd-primary)] text-white" : isNow ? "border-[var(--qd-primary)] bg-[var(--qd-paper)] text-[var(--qd-primary)]" : "border-[var(--qd-line)] bg-[var(--qd-paper)] text-[var(--qd-muted)]")}>
                {isDone ? <CheckIcon size={20} weight="bold" /> : num(i + 1)}
                {isNow && !reduce && <motion.span className="absolute inset-[-6px] rounded-full border-2 border-[var(--qd-primary)]" animate={{ opacity: [0.6, 0], scale: [1, 1.25] }} transition={{ duration: 1.6, repeat: Infinity }} />}
              </span>
              <Link href={href(s.to)} className={cx("min-w-0 flex-1 rounded-[22px] p-4 transition-shadow", isNow ? "qd-card shadow-[0_10px_30px_-16px_var(--qd-primary)]" : "bg-[var(--qd-paper)]/80")}>
                <div className="flex items-start gap-2">
                  <p className={cx("min-w-0 flex-1 text-[16px] font-bold leading-snug", isDone && "text-[var(--qd-muted)] line-through decoration-2")}>{title}</p>
                  <span className={cx("shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold", isNow ? "bg-[var(--qd-primary)] text-white" : "bg-[var(--qd-tint-2)] text-[var(--qd-primary-deep)]")}>{when(s.weeks)}</span>
                </div>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--qd-ink-soft)]">{why}</p>
                {isNow && <p className="mt-2 text-[13px] font-bold text-[var(--qd-primary)]">{ar ? "ابدئي هنا ←" : "Start here →"}</p>}
              </Link>
            </motion.li>
          );
        })}
      </ol>
      <p className="text-[12.5px] text-[var(--qd-muted)]">{ar ? "المواعيد تقريبية للتنظيم فقط، وأي شي يخص صحتك ارجعي فيه لطبيبتك." : "Timings are rough, for organising only. For anything about your health, ask your doctor."}</p>
    </div>
  );
}
