"use client";

import { useState } from "react";
import { CloudIcon, FlowerLotusIcon, MoonStarsIcon, CircleIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { parseMoney } from "../model/engine";
import { allSections, sectionsFor, type Country, type Currency, type ExperiencePreset, type ReceptionKind, type SectionId, type ThemeId } from "../model/types";
import { ThemeArt } from "../ui/Art";
import { Button, ChoiceCard, Field, cx, inputCls } from "../ui/kit";

export const countries: { c: Country; cur: Currency; tz: string; ar: string; en: string }[] = [
  { c: "OM", cur: "OMR", tz: "Asia/Muscat", ar: "سلطنة عُمان", en: "Oman" },
  { c: "SA", cur: "SAR", tz: "Asia/Riyadh", ar: "السعودية", en: "Saudi Arabia" },
  { c: "AE", cur: "AED", tz: "Asia/Dubai", ar: "الإمارات", en: "UAE" },
  { c: "KW", cur: "KWD", tz: "Asia/Kuwait", ar: "الكويت", en: "Kuwait" },
  { c: "BH", cur: "BHD", tz: "Asia/Bahrain", ar: "البحرين", en: "Bahrain" },
  { c: "QA", cur: "QAR", tz: "Asia/Qatar", ar: "قطر", en: "Qatar" },
  { c: "other", cur: "OMR", tz: "Asia/Muscat", ar: "دولة أخرى", en: "Another country" },
];
export const currencies: Currency[] = ["OMR", "SAR", "AED", "KWD", "BHD", "QAR"];
export const themeIcons: Record<ThemeId, typeof CloudIcon> = { cloud: CloudIcon, moon: MoonStarsIcon, garden: FlowerLotusIcon, pearl: CircleIcon };
const kinds: ReceptionKind[] = ["hospital", "home", "family", "aqiqah", "custom"];

export function sectionLabel(t: ReturnType<typeof useQ>["t"], s: SectionId) {
  const m: Record<SectionId, string> = { prep: t.nav.items, bag: t.nav.bag, nursery: t.nav.nursery, mother: t.nav.mother, reception: t.nav.events, visits: t.nav.visits, hospitality: t.nav.hospitality, registry: t.nav.registry, received: t.nav.received, favors: t.nav.favors, budget: t.nav.budget, calendar: t.nav.calendar, memories: t.nav.memories };
  return m[s];
}

/** First-run setup: a few short steps, every one optional except a name to greet her by. */
export function Setup() {
  const { t, lang, dispatch, today } = useQ();
  const s = t.setup;
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [baby, setBaby] = useState("");
  const [due, setDue] = useState("");
  const [first, setFirst] = useState<"yes" | "no" | undefined>();
  const [country, setCountry] = useState<Country>("OM");
  const [currency, setCurrency] = useState<Currency>("OMR");
  const [budgetTxt, setBudgetTxt] = useState("");
  const [preset, setPreset] = useState<ExperiencePreset>("full");
  const [custom, setCustom] = useState<SectionId[]>(allSections);
  const [kindsOn, setKindsOn] = useState<ReceptionKind[]>(["home"]);
  const [theme, setTheme] = useState<ThemeId>("cloud");
  const [nursery, setNursery] = useState<"room" | "corner">("room");
  const [err, setErr] = useState<string | null>(null);

  const finish = (skip = false) => {
    const budgetMinor = budgetTxt ? parseMoney(budgetTxt, currency) : undefined;
    if (!skip && budgetTxt && budgetMinor === undefined) {
      setStep(1);
      return setErr(t.common.invalidMoney);
    }
    const tz = countries.find((x) => x.c === country)?.tz ?? "Asia/Muscat";
    const sections = sectionsFor(skip ? "full" : preset, custom);
    const ok = dispatch({
      t: "setup",
      lang,
      today,
      profile: {
        motherName: (name.trim() || (lang === "ar" ? "ماما" : "Mum")).slice(0, 60),
        babyName: baby.trim() || undefined,
        dueDate: due || undefined,
        firstTime: first,
        country,
        currency,
        timeZone: tz,
        budgetMinor,
        preset: skip ? "full" : preset,
        sections,
        receptionKinds: sections.reception ? (skip ? ["home"] : kindsOn) : [],
        theme,
        nurseryKind: nursery,
        createdAt: new Date().toISOString(),
      },
    });
    if (!ok) setErr(t.common.saveError);
  };

  const steps = [
    <div key="0" className="space-y-4">
      <Field label={s.you} htmlFor="q-name">
        <input id="q-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={s.youPh} maxLength={60} autoComplete="nickname" />
      </Field>
      <Field label={s.baby} htmlFor="q-baby">
        <input id="q-baby" className={inputCls} value={baby} onChange={(e) => setBaby(e.target.value)} placeholder={s.babyPh} maxLength={60} />
      </Field>
      <Field label={s.due} hint={s.dueHint} htmlFor="q-due">
        <input id="q-due" type="date" dir="ltr" className={`${inputCls} text-start`} value={due} onChange={(e) => setDue(e.target.value)} />
      </Field>
      <fieldset className="min-w-0">
        <legend className="mb-2 text-[13px] font-medium text-[var(--qd-ink-soft)]">{s.first}</legend>
        <div role="radiogroup" className="grid grid-cols-2 gap-2">
          <ChoiceCard selected={first === "yes"} onClick={() => setFirst(first === "yes" ? undefined : "yes")}>{t.common.yes}</ChoiceCard>
          <ChoiceCard selected={first === "no"} onClick={() => setFirst(first === "no" ? undefined : "no")}>{t.common.no}</ChoiceCard>
        </div>
      </fieldset>
    </div>,
    <div key="1" className="space-y-4">
      <Field label={t.settings.country} htmlFor="q-country">
        <select id="q-country" className={inputCls} value={country} onChange={(e) => { const c = countries.find((x) => x.c === e.target.value)!; setCountry(c.c); setCurrency(c.cur); }}>
          {countries.map((c) => <option key={c.c} value={c.c}>{c[lang]}</option>)}
        </select>
      </Field>
      <Field label={t.settings.currency} htmlFor="q-cur">
        <select id="q-cur" className={inputCls} value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
          {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label={s.budget} hint={s.budgetHint} htmlFor="q-budget" error={err ?? undefined}>
        <input id="q-budget" inputMode="decimal" dir="ltr" className={`${inputCls} text-start`} value={budgetTxt} onChange={(e) => (setBudgetTxt(e.target.value), setErr(null))} aria-invalid={!!err} />
      </Field>
    </div>,
    <div key="2" className="space-y-3">
      <p className="text-[14px] font-medium text-[var(--qd-ink-soft)]">{s.experience}</p>
      <div role="radiogroup" className="space-y-2">
        {(["prep", "prepReception", "full", "custom"] as ExperiencePreset[]).map((p) => (
          <ChoiceCard key={p} selected={preset === p} onClick={() => setPreset(p)}>{s.presets[p]}</ChoiceCard>
        ))}
      </div>
      {preset === "custom" && (
        <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
          {allSections.map((x) => (
            <ChoiceCard key={x} multi selected={custom.includes(x)} onClick={() => setCustom(custom.includes(x) ? custom.filter((y) => y !== x) : [...custom, x])}>{sectionLabel(t, x)}</ChoiceCard>
          ))}
        </div>
      )}
      {sectionsFor(preset, custom).reception && (
        <div className="pt-3">
          <p className="text-[14px] font-medium text-[var(--qd-ink-soft)]">{s.reception}</p>
          <p className="mb-2 text-[12.5px] text-[var(--qd-muted)]">{s.receptionHint}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {kinds.map((k) => (
              <ChoiceCard key={k} multi selected={kindsOn.includes(k)} onClick={() => setKindsOn(kindsOn.includes(k) ? kindsOn.filter((x) => x !== k) : [...kindsOn, k])}>{t.cats.reception[k]}</ChoiceCard>
            ))}
          </div>
        </div>
      )}
    </div>,
    <div key="3" className="space-y-4">
      <p className="text-[14px] font-medium text-[var(--qd-ink-soft)]">{s.look}</p>
      <div role="radiogroup" className="grid grid-cols-2 gap-3">
        {(["cloud", "moon", "garden", "pearl"] as ThemeId[]).map((th) => (
          <button key={th} type="button" role="radio" aria-checked={theme === th} onClick={() => setTheme(th)} data-theme={th} className={cx("qd overflow-hidden rounded-[18px] border-2 text-start transition-shadow", theme === th ? "border-[var(--qd-primary)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--qd-primary)_20%,transparent)]" : "border-[var(--qd-line)]")}>
            <div className="h-20 bg-[var(--qd-tint)]"><ThemeArt theme={th} className="size-full" /></div>
            <p className="px-3 py-2.5 text-[14px] font-semibold">{t.settings.themes[th]}</p>
          </button>
        ))}
      </div>
      <p className="pt-2 text-[14px] font-medium text-[var(--qd-ink-soft)]">{s.nurseryQ}</p>
      <div role="radiogroup" className="grid grid-cols-2 gap-2">
        <ChoiceCard selected={nursery === "room"} onClick={() => setNursery("room")}>{t.nursery.room}</ChoiceCard>
        <ChoiceCard selected={nursery === "corner"} onClick={() => setNursery("corner")}>{t.nursery.corner}</ChoiceCard>
      </div>
    </div>,
  ];

  return (
    <div className="mx-auto max-w-xl">
      <div className="qd-card overflow-hidden rounded-[28px]">
        <div className="relative h-36 bg-[var(--qd-tint)]">
          <ThemeArt theme={theme} className="absolute inset-0 size-full" />
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-[1.8rem] font-bold">{s.welcome}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--qd-ink-soft)]">{s.welcomeSub}</p>
          <div className="mt-5 flex gap-1.5" aria-hidden="true">
            {steps.map((_, i) => <span key={i} className={cx("h-1.5 flex-1 rounded-full", i <= step ? "bg-[var(--qd-primary)]" : "bg-[var(--qd-tint)]")} />)}
          </div>
          <div className="mt-6">{steps[step]}</div>
          {err && step !== 1 && <p role="alert" className="mt-4 text-sm text-[var(--qd-alert)]">{err}</p>}
          <div className="mt-7 flex flex-wrap items-center gap-2">
            {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>{s.back}</Button>}
            <span className="flex-1" />
            {step < steps.length - 1 ? <Button onClick={() => setStep(step + 1)}>{s.next}</Button> : <Button size="lg" onClick={() => finish()}>{s.start}</Button>}
          </div>
          <button type="button" onClick={() => finish(true)} className="mt-5 text-[13.5px] font-medium text-[var(--qd-primary)] underline-offset-4 hover:underline">
            {s.skip}
          </button>
        </div>
      </div>
    </div>
  );
}
