"use client";

import { useMemo, useState } from "react";
import { HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { CheckRow, ProductShell, ProgressRing, StatTile, useList } from "@/framework";
import type { Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/money";
import { useDemoTracker } from "./useDemoTracker";

type Task = { id: string; label: { en: string; ar: string }; phase: "6m" | "3m" | "1m"; done: boolean };

// SAMPLE DATA: a fictional wedding 94 days away with an illustrative budget.
const tasks: Task[] = [
  { id: "1", label: { en: "Book the hall", ar: "حجز القاعة" }, phase: "6m", done: true },
  { id: "2", label: { en: "Set the budget with family", ar: "تحديد الميزانية مع الأهل" }, phase: "6m", done: true },
  { id: "3", label: { en: "Choose the dress designer", ar: "اختيار مصممة الفستان" }, phase: "6m", done: true },
  { id: "4", label: { en: "Confirm photographer", ar: "تأكيد المصورة" }, phase: "3m", done: false },
  { id: "5", label: { en: "Henna night plan", ar: "ترتيبات ليلة الحناء" }, phase: "3m", done: false },
  { id: "6", label: { en: "Send invitations", ar: "إرسال الدعوات" }, phase: "3m", done: false },
  { id: "7", label: { en: "Final dress fitting", ar: "البروفة الأخيرة للفستان" }, phase: "1m", done: false },
];

const phases = {
  "6m": { en: "6 months to go", ar: "قبل ٦ أشهر" },
  "3m": { en: "3 months to go", ar: "قبل ٣ أشهر" },
  "1m": { en: "Final month", ar: "الشهر الأخير" },
};

const budget = [
  { key: "hall", label: { en: "Hall", ar: "القاعة" }, planned: 3500, spent: 3500 },
  { key: "dress", label: { en: "Dress", ar: "الفستان" }, planned: 1200, spent: 600 },
  { key: "photo", label: { en: "Photography", ar: "التصوير" }, planned: 800, spent: 0 },
  { key: "flowers", label: { en: "Flowers & kosha", ar: "الورد والكوشة" }, planned: 1500, spent: 450 },
];

const t = {
  title: { en: "Our wedding", ar: "عرسنا" },
  days: { en: "days to go", ar: "يوم متبقي" },
  done: { en: "of tasks done", ar: "من المهام" },
  budget: { en: "Budget", ar: "الميزانية" },
  spent: { en: "Spent", ar: "المصروف" },
  tabs: { tasks: { en: "Checklist", ar: "المهام" }, budget: { en: "Budget", ar: "الميزانية" } },
};

export function BrideDemo({ locale, hue }: { locale: Locale; hue: string }) {
  const { items, update } = useList(tasks);
  const [tab, setTab] = useState<"tasks" | "budget">("tasks");
  const touched = useDemoTracker("bride");
  const done = items.filter((i) => i.done).length;
  const pct = done / items.length;
  const totals = useMemo(() => budget.reduce((a, b) => ({ planned: a.planned + b.planned, spent: a.spent + b.spent }), { planned: 0, spent: 0 }), []);
  const omr = (v: number) => formatMoney({ amountMinor: v * 1000, currency: "OMR" }, locale);
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-OM" : "en");

  return (
    <ProductShell title={t.title[locale]} hue={hue} icon={<HeartIcon size={18} weight="fill" />} badge={locale === "ar" ? "تجريبي" : "Demo"}>
      <div className="flex items-center gap-4">
        <ProgressRing value={pct} size={84} stroke={7} color={hue} label={`${Math.round(pct * 100)}%`}>
          <span className="text-lg font-semibold tabular text-ink">{nf.format(Math.round(pct * 100))}%</span>
        </ProgressRing>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <StatTile label={t.days[locale]} value={nf.format(94)} color={hue} />
          <StatTile label={t.spent[locale]} value={omr(totals.spent)} sub={`/ ${omr(totals.planned)}`} />
        </div>
      </div>

      <div role="tablist" aria-label={t.title[locale]} className="mt-4 inline-flex rounded-full bg-bg-sunken p-1">
        {(["tasks", "budget"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            id={`bride-tab-${k}`}
            aria-selected={tab === k}
            aria-controls={`bride-panel-${k}`}
            onClick={() => {
              touched();
              setTab(k);
            }}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-muted transition-colors aria-selected:bg-surface-raised aria-selected:text-ink aria-selected:shadow-soft"
          >
            {t.tabs[k][locale]}
          </button>
        ))}
      </div>

      {tab === "tasks" ? (
        <div id="bride-panel-tasks" role="tabpanel" aria-labelledby="bride-tab-tasks" className="mt-3 max-h-[280px] space-y-2 overflow-y-auto pe-1">
          {(Object.keys(phases) as (keyof typeof phases)[]).map((p) => (
            <section key={p}>
              <h3 className="px-2 text-xs font-semibold text-muted">{phases[p][locale]}</h3>
              <ul>
                {items
                  .filter((i) => i.phase === p)
                  .map((i) => (
                    <li key={i.id}>
                      <CheckRow
                        checked={i.done}
                        color={hue}
                        onToggle={() => {
                          touched();
                          update(i.id, { done: !i.done });
                        }}
                      >
                        {i.label[locale]}
                      </CheckRow>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul id="bride-panel-budget" role="tabpanel" aria-labelledby="bride-tab-budget" className="mt-4 space-y-4">
          {budget.map((b) => {
            const ratio = b.planned ? b.spent / b.planned : 0;
            return (
              <li key={b.key}>
                <div className="flex justify-between text-sm">
                  <span className="text-ink">{b.label[locale]}</span>
                  <span className="tabular text-muted">
                    {omr(b.spent)} / {omr(b.planned)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full" style={{ background: `color-mix(in oklab, ${hue} 14%, transparent)` }} aria-hidden="true">
                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.min(100, ratio * 100)}%`, background: hue }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ProductShell>
  );
}
