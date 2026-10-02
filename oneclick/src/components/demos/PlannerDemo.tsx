"use client";

import { useState } from "react";
import { CalendarCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { CheckRow, ProductShell, useList } from "@/framework";
import type { Locale } from "@/i18n/config";
import { useDemoTracker } from "./useDemoTracker";

const days = [
  { en: "Sun", ar: "أحد" },
  { en: "Mon", ar: "اثنين" },
  { en: "Tue", ar: "ثلاثاء" },
  { en: "Wed", ar: "أربعاء" },
  { en: "Thu", ar: "خميس" },
];

// SAMPLE DATA: a fictional week. Each day holds three priorities.
const week = [
  [
    { en: "Send the Q3 report", ar: "إرسال تقرير الربع الثالث" },
    { en: "Gym, 30 minutes", ar: "نادي، ٣٠ دقيقة" },
    { en: "Call grandma", ar: "اتصال بالجدة" },
  ],
  [
    { en: "Team planning meeting", ar: "اجتماع تخطيط الفريق" },
    { en: "Pay electricity bill", ar: "دفع فاتورة الكهرباء" },
    { en: "Read 20 pages", ar: "قراءة ٢٠ صفحة" },
  ],
  [
    { en: "Dentist at 4:30", ar: "موعد الأسنان ٤:٣٠" },
    { en: "Draft the proposal", ar: "مسودة العرض" },
    { en: "Meal prep for 2 days", ar: "تجهيز أكل يومين" },
  ],
  [
    { en: "Client review", ar: "مراجعة مع العميل" },
    { en: "Kids' school forms", ar: "نماذج مدرسة العيال" },
    { en: "Evening walk", ar: "مشي المساء" },
  ],
  [
    { en: "Weekly review, 5 min", ar: "مراجعة الأسبوع، ٥ دقايق" },
    { en: "Plan the weekend", ar: "خطة الويكند" },
    { en: "Family dinner", ar: "عشاء العائلة" },
  ],
];

const initial = week.flatMap((list, d) => list.map((label, i) => ({ id: `${d}-${i}`, day: d, label, done: d < 1 || (d === 1 && i === 0) })));

const habits = [
  { label: { en: "Water", ar: "ماي" }, streak: [1, 1, 1, 0, 0] },
  { label: { en: "Walk", ar: "مشي" }, streak: [1, 0, 1, 0, 0] },
  { label: { en: "Read", ar: "قراءة" }, streak: [1, 1, 0, 0, 0] },
];

export function PlannerDemo({ locale, hue }: { locale: Locale; hue: string }) {
  const { items, update } = useList(initial);
  const [day, setDay] = useState(1);
  const touched = useDemoTracker("planner");
  const title = locale === "ar" ? "أسبوعي" : "My week";
  const top3 = locale === "ar" ? "أهم ثلاث اليوم" : "Today's top three";

  return (
    <ProductShell title={title} hue={hue} icon={<CalendarCheckIcon size={18} weight="bold" />} badge={locale === "ar" ? "تجريبي" : "Demo"}>
      <div className="grid grid-cols-5 gap-1.5" role="tablist" aria-label={title}>
        {days.map((d, i) => {
          const dayItems = items.filter((x) => x.day === i);
          const ratio = dayItems.filter((x) => x.done).length / dayItems.length;
          return (
            <button
              key={d.en}
              role="tab"
              aria-selected={day === i}
              onClick={() => {
                touched();
                setDay(i);
              }}
              className="flex flex-col items-center gap-1.5 rounded-[var(--radius-md)] border border-transparent py-2 text-xs text-muted transition-colors aria-selected:border-line aria-selected:bg-bg-sunken aria-selected:text-ink"
            >
              {d[locale]}
              <span className="flex gap-0.5" aria-hidden="true">
                {[0, 1, 2].map((k) => (
                  <span key={k} className="size-1.5 rounded-full" style={{ background: k < Math.round(ratio * 3) ? hue : "var(--oc-line-strong)" }} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 px-2 text-xs font-semibold text-muted">{top3}</p>
      <ul role="tabpanel">
        {items
          .filter((x) => x.day === day)
          .map((x) => (
            <li key={x.id}>
              <CheckRow
                checked={x.done}
                color={hue}
                onToggle={() => {
                  touched();
                  update(x.id, { done: !x.done });
                }}
              >
                {x.label[locale]}
              </CheckRow>
            </li>
          ))}
      </ul>

      <div className="mt-4 rounded-[var(--radius-md)] bg-bg-sunken/70 p-3">
        <p className="text-xs font-semibold text-muted">{locale === "ar" ? "العادات" : "Habits"}</p>
        <ul className="mt-2 space-y-2">
          {habits.map((h) => (
            <li key={h.label.en} className="flex items-center justify-between text-sm">
              <span className="text-ink">{h.label[locale]}</span>
              <span className="flex gap-1" aria-label={`${h.streak.filter(Boolean).length}/5`}>
                {h.streak.map((s, i) => (
                  <span key={i} className="size-4 rounded-[5px]" style={{ background: s ? hue : "var(--oc-line)" }} />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ProductShell>
  );
}
