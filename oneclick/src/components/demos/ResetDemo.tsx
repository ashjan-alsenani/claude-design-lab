"use client";

import { useEffect, useState } from "react";
import { SparkleIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/ssr";
import { CheckRow, ProductShell, ProgressRing } from "@/framework";
import { num, type Locale } from "@/i18n/config";
import { useDemoTracker } from "./useDemoTracker";
import { Confetti } from "@/components/ui/Confetti";

// The free lead-magnet product. Real, complete and saved on the visitor's device.
const sections = [
  {
    title: { en: "Digital", ar: "رقمي" },
    items: [
      { id: "d1", en: "Clear email inbox to under 20", ar: "خفّف الإيميل لأقل من ٢٠ رسالة" },
      { id: "d2", en: "Delete screenshots you no longer need", ar: "احذف الصور والسكرين شوت اللي ما تحتاجها" },
    ],
  },
  {
    title: { en: "Home", ar: "البيت" },
    items: [
      { id: "h1", en: "Reset the kitchen counters", ar: "رتّب سطح المطبخ" },
      { id: "h2", en: "Start one load of laundry", ar: "شغّل غسلة ملابس وحدة" },
    ],
  },
  {
    title: { en: "Food", ar: "الأكل" },
    items: [
      { id: "f1", en: "Plan 3 dinners", ar: "خطط ٣ عشاءات" },
      { id: "f2", en: "Write the grocery list", ar: "اكتب قائمة المقاضي" },
    ],
  },
  {
    title: { en: "Week ahead", ar: "الأسبوع الجاي" },
    items: [
      { id: "w1", en: "Check the calendar for Sunday to Thursday", ar: "راجع التقويم من الأحد للخميس" },
      { id: "w2", en: "Pick one priority for the week", ar: "اختر أولوية وحدة للأسبوع" },
    ],
  },
];

const STORAGE_KEY = "oc-free-reset";

export function ResetDemo({ locale, hue }: { locale: Locale; hue: string }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const touched = useDemoTracker("reset");
  const total = sections.reduce((a, s) => a + s.items.length, 0);
  const count = Object.values(done).filter(Boolean).length;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved && typeof saved === "object") setDone(saved);
    } catch {}
  }, []);

  const toggle = (id: string) => {
    touched();
    setDone((d) => {
      const next = { ...d, [id]: !d[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <ProductShell title={locale === "ar" ? "ترتيب الأسبوع" : "Weekly reset"} hue={hue} icon={<SparkleIcon size={18} weight="fill" />} badge={locale === "ar" ? "مجاني" : "Free"}>
      <div className="flex items-center gap-4">
        <ProgressRing value={count / total} size={64} color={hue} label={`${count}/${total}`}>
          <span dir="ltr" className="text-sm font-semibold tabular text-ink">
            {num(count, locale)}/{num(total, locale)}
          </span>
        </ProgressRing>
        <p className="flex-1 text-sm text-ink-soft">
          {count === total
            ? locale === "ar"
              ? "خلصت! أسبوعك جاهز."
              : "Done. Your week is ready."
            : locale === "ar"
              ? "١٥ دقيقة وتبدأ أسبوعك مرتب."
              : "15 minutes to a calmer week."}
        </p>
        <button
          type="button"
          onClick={() => {
            setDone({});
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {}
          }}
          className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-ink"
          aria-label={locale === "ar" ? "ابدأ من جديد" : "Start over"}
        >
          <ArrowCounterClockwiseIcon size={16} />
        </button>
      </div>
      {count === total && (
        <div className="relative">
          <Confetti key="reset-done" />
        </div>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <section key={s.title.en}>
            <h4 className="px-2 text-xs font-semibold text-muted">{s.title[locale]}</h4>
            <ul>
              {s.items.map((i) => (
                <li key={i.id}>
                  <CheckRow checked={!!done[i.id]} color={hue} onToggle={() => toggle(i.id)}>
                    {i[locale]}
                  </CheckRow>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ProductShell>
  );
}
