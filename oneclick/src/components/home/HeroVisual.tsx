"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckRow, ProgressRing } from "@/framework";
import { LogoMark } from "@/components/brand/Logo";
import { num, type Locale } from "@/i18n/config";

// Hero storytelling: scattered notes (chaos) settle into one calm One Click Digital Hub list (clarity).
// Runs once, then the list stays interactive. Reduced motion shows the final state.
const notes = [
  { en: "milk!! + eggs", ar: "حليب!! + بيض", x: "4%", y: "6%", r: -8 },
  { en: "hall deposit?", ar: "عربون القاعة؟", x: "58%", y: "2%", r: 6 },
  { en: "dentist thu 4:30", ar: "الأسنان الخميس ٤:٣٠", x: "62%", y: "70%", r: -5 },
  { en: "call photographer", ar: "كلّم المصورة", x: "0%", y: "64%", r: 7 },
  { en: "gym??", ar: "النادي؟؟", x: "36%", y: "84%", r: -3 },
];

const list = [
  { id: "a", en: "Buy milk and eggs", ar: "شراء حليب وبيض", tag: { en: "Grocery", ar: "مقاضي" }, hue: "var(--oc-hue-grocery)" },
  { id: "b", en: "Pay hall deposit", ar: "دفع عربون القاعة", tag: { en: "Bride", ar: "عروس" }, hue: "var(--oc-hue-bride)" },
  { id: "c", en: "Dentist, Thu 4:30", ar: "الأسنان، الخميس ٤:٣٠", tag: { en: "Planner", ar: "مخطط" }, hue: "var(--oc-hue-planner)" },
  { id: "d", en: "Confirm photographer", ar: "تأكيد المصورة", tag: { en: "Bride", ar: "عروس" }, hue: "var(--oc-hue-bride)" },
  { id: "e", en: "Gym, 30 minutes", ar: "النادي، ٣٠ دقيقة", tag: { en: "Fit", ar: "لياقة" }, hue: "var(--oc-hue-fit)" },
];

export function HeroVisual({ locale }: { locale: Locale }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"chaos" | "clear">(reduce ? "clear" : "chaos");
  const [done, setDone] = useState<Record<string, boolean>>({ a: true });

  useEffect(() => {
    if (reduce) return setPhase("clear");
    const t = window.setTimeout(() => setPhase("clear"), 1700);
    return () => window.clearTimeout(t);
  }, [reduce]);

  const count = Object.values(done).filter(Boolean).length;

  return (
    <div className="relative mx-auto aspect-[4/4.4] w-full max-w-[480px] sm:aspect-[4/3.9]">
      {/* brand field: soft color + the logo's open orbit, drawn large */}
      <div
        aria-hidden="true"
        className="absolute -inset-[10%] blur-2xl"
        style={{
          background:
            "radial-gradient(55% 55% at 25% 20%, color-mix(in oklab, var(--oc-primary) 26%, transparent), transparent 70%), radial-gradient(45% 45% at 85% 85%, color-mix(in oklab, var(--oc-accent) 34%, transparent), transparent 70%), radial-gradient(40% 40% at 90% 15%, color-mix(in oklab, var(--oc-hue-bride) 18%, transparent), transparent 70%)",
        }}
      />
      <svg aria-hidden="true" viewBox="0 0 64 64" className="absolute -end-[12%] -top-[14%] w-[78%] opacity-[0.10]">
        <path d="M47.56 16.44 A22 22 0 1 0 53.25 37.69" fill="none" stroke="var(--oc-primary)" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="53.25" cy="26.31" r="1.6" fill="var(--oc-accent)" />
      </svg>
      <AnimatePresence>
        {phase === "chaos" &&
          notes.map((n, i) => (
            <motion.div
              key={n.en}
              aria-hidden="true"
              className="absolute rounded-[10px] border border-line bg-surface-raised px-3 py-2 text-sm text-ink-soft shadow-soft"
              style={{ insetInlineStart: n.x, top: n.y }}
              initial={{ opacity: 0, scale: 0.9, rotate: n.r * 1.6 }}
              animate={{ opacity: 1, scale: 1, rotate: n.r }}
              exit={{ opacity: 0, scale: 0.7, rotate: 0, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {n[locale]}
            </motion.div>
          ))}
      </AnimatePresence>

      <motion.div
        className="absolute inset-x-[7%] top-[9%] rounded-[var(--radius-xl)] border border-line bg-surface-raised p-4 shadow-lift sm:p-5"
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={phase === "clear" ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3">
          <LogoMark size={28} />
          <div className="flex-1">
            <p className="font-semibold text-ink">{locale === "ar" ? "يومك" : "Your day"}</p>
            <p className="text-xs text-muted">{locale === "ar" ? "بيانات تجريبية" : "Sample data"}</p>
          </div>
          <ProgressRing value={count / list.length} size={46} stroke={5} label={`${count}/${list.length}`}>
            <span dir="ltr" className="text-xs font-semibold tabular text-ink">
              {num(count, locale)}/{num(list.length, locale)}
            </span>
          </ProgressRing>
        </div>
        <ul className="mt-3">
          {list.map((item, i) => (
            <motion.li
              key={item.id}
              initial={reduce ? false : { opacity: 0, x: locale === "ar" ? -12 : 12 }}
              animate={phase === "clear" ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.25 + i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <CheckRow
                checked={!!done[item.id]}
                color={item.hue}
                onToggle={() => setDone((d) => ({ ...d, [item.id]: !d[item.id] }))}
                meta={
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ color: item.hue, background: `color-mix(in oklab, ${item.hue} 12%, transparent)` }}>
                    {item.tag[locale]}
                  </span>
                }
              >
                {item[locale]}
              </CheckRow>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Floating outcome chips: each product's "clear result", in its own hue */}
      {chips.map((c, i) => (
        <motion.div
          key={c.key}
          aria-hidden="true"
          className={`absolute flex items-center gap-2.5 rounded-[14px] border border-line bg-surface-raised px-3 py-2 shadow-lift ${c.pos}`}
          initial={reduce ? false : { opacity: 0, y: 12, scale: 0.94 }}
          animate={phase === "clear" ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="size-2.5 rounded-full" style={{ background: c.hue }} />
          <span className="text-xs text-muted">{c.label[locale]}</span>
          <span className="text-sm font-semibold tabular text-ink">{c.value[locale]}</span>
        </motion.div>
      ))}
    </div>
  );
}

const chips = [
  { key: "bride", hue: "var(--oc-hue-bride)", pos: "-start-[2%] top-[0%] sm:-start-[8%]", label: { en: "Wedding in", ar: "العرس بعد" }, value: { en: "94 days", ar: "٩٤ يوم" } },
  { key: "grocery", hue: "var(--oc-hue-grocery)", pos: "-end-[1%] bottom-[2%] sm:-end-[6%]", label: { en: "Est. total", ar: "المجموع" }, value: { en: "OMR 4.950", ar: "٤٫٩٥٠ ر.ع." } },
];
