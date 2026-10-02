"use client";

import { useState } from "react";
import { BarbellIcon, MinusIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { ProductShell, StatTile } from "@/framework";
import type { Locale } from "@/i18n/config";
import { useDemoTracker } from "./useDemoTracker";

// SAMPLE DATA: a fictional user's log. Not training advice.
const exercises = [
  { id: "squat", name: { en: "Goblet squat", ar: "سكوات بالدمبل" }, sets: 3, reps: 10, kg: 12 },
  { id: "row", name: { en: "Dumbbell row", ar: "سحب بالدمبل" }, sets: 3, reps: 12, kg: 10 },
  { id: "press", name: { en: "Shoulder press", ar: "ضغط أكتاف" }, sets: 3, reps: 10, kg: 8 },
];
const weeks = [2, 3, 3, 4, 3, 4]; // sessions per week, last 6 weeks

export function FitDemo({ locale, hue }: { locale: Locale; hue: string }) {
  const [log, setLog] = useState(exercises);
  const touched = useDemoTracker("fit");
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-OM" : "en");
  const volume = log.reduce((a, e) => a + e.sets * e.reps * e.kg, 0);
  const max = Math.max(...weeks);

  const bump = (id: string, delta: number) => {
    touched();
    setLog((xs) => xs.map((e) => (e.id === id ? { ...e, kg: Math.max(0, e.kg + delta) } : e)));
  };

  return (
    <ProductShell title={locale === "ar" ? "تمرين اليوم" : "Today's workout"} hue={hue} icon={<BarbellIcon size={18} weight="bold" />} badge={locale === "ar" ? "تجريبي" : "Demo"}>
      <div className="grid grid-cols-2 gap-2">
        <StatTile label={locale === "ar" ? "الحجم الكلي (كجم)" : "Total volume (kg)"} value={nf.format(volume)} color={hue} />
        <div className="rounded-[var(--radius-md)] bg-bg-sunken/70 p-3">
          <p className="text-xs text-muted">{locale === "ar" ? "جلسات / أسبوع" : "Sessions / week"}</p>
          <div className="mt-2 flex h-9 items-end gap-1" role="img" aria-label={weeks.join(", ")}>
            {weeks.map((w, i) => (
              <span key={i} className="flex-1 rounded-t-[3px]" style={{ height: `${(w / max) * 100}%`, background: i === weeks.length - 1 ? hue : `color-mix(in oklab, ${hue} 35%, transparent)` }} />
            ))}
          </div>
        </div>
      </div>
      <ul className="mt-4 divide-y divide-line">
        {log.map((e) => (
          <li key={e.id} className="flex items-center gap-3 py-3">
            <div className="flex-1">
              <p className="text-[0.95rem] text-ink">{e.name[locale]}</p>
              <p className="text-xs text-muted tabular">
                {nf.format(e.sets)} × {nf.format(e.reps)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => bump(e.id, -1)} className="grid size-9 place-items-center rounded-full border border-line text-ink-soft active:scale-95" aria-label={locale === "ar" ? "إنقاص الوزن" : "Decrease weight"}>
                <MinusIcon size={14} />
              </button>
              <span className="w-14 text-center text-sm font-semibold tabular text-ink" aria-live="polite">
                {nf.format(e.kg)} {locale === "ar" ? "كجم" : "kg"}
              </span>
              <button type="button" onClick={() => bump(e.id, 1)} className="grid size-9 place-items-center rounded-full text-white active:scale-95" style={{ background: hue }} aria-label={locale === "ar" ? "زيادة الوزن" : "Increase weight"}>
                <PlusIcon size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </ProductShell>
  );
}
