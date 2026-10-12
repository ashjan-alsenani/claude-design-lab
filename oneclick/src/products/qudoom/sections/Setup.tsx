"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Clicky } from "@/components/brand/Clicky";
import { BabyMascot } from "../ui/Mascot";
import { CloudIcon, FlowerLotusIcon, MoonStarsIcon, CircleIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { allSections, sectionsFor, themeFor, type BabyGender, type Country, type Currency, type ReceptionKind, type SectionId, type ThemeId } from "../model/types";
import { Button, Field, cx, inputCls } from "../ui/kit";

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

export function sectionLabel(t: ReturnType<typeof useQ>["t"], s: SectionId) {
  const m: Record<SectionId, string> = { prep: t.nav.items, bag: t.nav.bag, nursery: t.nav.nursery, mother: t.nav.mother, reception: t.nav.events, visits: t.nav.visits, hospitality: t.nav.hospitality, registry: t.nav.registry, received: t.nav.received, favors: t.nav.favors, budget: t.nav.budget, calendar: t.nav.calendar, memories: t.nav.memories };
  return m[s];
}

/**
 * First run, one calm screen: boy, girl or surprise (that sets the colours), an optional name and
 * expected date, and everything else is pre-filled with ready lists. Nothing has to be typed.
 */
export function Setup() {
  const { t, lang, dispatch, today } = useQ();
  const s = t.setup;
  const [gender, setGender] = useState<BabyGender>("girl");
  const [name, setName] = useState("");
  const [baby, setBaby] = useState("");
  const [due, setDue] = useState("");
  const [country, setCountry] = useState<Country>("OM");
  const [currency, setCurrency] = useState<Currency>("OMR");
  const [err, setErr] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const finish = () => {
    const tz = countries.find((x) => x.c === country)?.tz ?? "Asia/Muscat";
    const ok = dispatch({
      t: "setup",
      lang,
      today,
      profile: {
        motherName: (name.trim() || (lang === "ar" ? "ماما" : "Mum")).slice(0, 60),
        babyName: baby.trim() || undefined,
        dueDate: due || undefined,
        country,
        currency,
        timeZone: tz,
        preset: "full",
        sections: sectionsFor("full", allSections),
        receptionKinds: ["hospital", "home"] as ReceptionKind[],
        theme: themeFor(gender),
        babyGender: gender,
        nurseryKind: "room",
        createdAt: new Date().toISOString(),
      },
    });
    if (!ok) setErr(t.common.saveError);
  };

  const options: { g: BabyGender; label: string; color: string; theme: ThemeId }[] = [
    { g: "boy", label: s.boy, color: "#7ea6dc", theme: "moon" },
    { g: "girl", label: s.girl, color: "#ff9fb8", theme: "cloud" },
    { g: "surprise", label: s.surprise, color: "#12b5a6", theme: "garden" },
  ];

  return (
    <div data-theme={themeFor(gender)} className="qd qd-wallpaper min-h-dvh px-4 py-8 transition-colors duration-500" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-lg">
        <div className="qd-card rounded-[32px] p-6 text-center sm:p-8">
          <motion.div key={gender} initial={reduce ? false : { scale: 0.8, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="mx-auto w-fit">
            <BabyMascot size={104} theme={themeFor(gender)} mood="sweet" body />
          </motion.div>
          <h1 className="mt-3 text-[1.9rem] font-extrabold">{s.welcome}</h1>
          <p className="mt-1 text-[15px] text-[var(--qd-ink-soft)]">{s.welcomeSub}</p>

          <p className="mt-6 text-[15px] font-bold">{s.genderQ}</p>
          <div role="radiogroup" aria-label={s.genderQ} className="mt-3 grid grid-cols-3 gap-2.5">
            {options.map((o) => (
              <motion.button
                key={o.g}
                type="button"
                role="radio"
                aria-checked={gender === o.g}
                onClick={() => setGender(o.g)}
                whileTap={reduce ? undefined : { scale: 0.95 }}
                className={cx("flex flex-col items-center gap-1.5 rounded-[22px] border-2 px-2 py-3 transition-colors", gender === o.g ? "border-[var(--qd-primary)] bg-[var(--qd-tint)]" : "border-transparent bg-[var(--qd-tint-2)]")}
              >
                <Clicky size={44} color={o.color} ink="#5a5570" accessory={o.g === "girl" ? "girl" : o.g === "boy" ? "boy" : "baby"} mood={gender === o.g ? "love" : "sweet"} />
                <span className="text-[15px] font-bold">{o.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 text-start sm:grid-cols-2">
            <Field label={s.you} htmlFor="q-name">
              <input id="q-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={s.youPh} maxLength={60} autoComplete="nickname" />
            </Field>
            <Field label={s.due} htmlFor="q-due">
              <input id="q-due" type="date" dir="ltr" className={`${inputCls} text-start`} value={due} onChange={(e) => setDue(e.target.value)} />
            </Field>
          </div>
          <details className="mt-3 text-start">
            <summary className="cursor-pointer py-2 text-[13.5px] font-semibold text-[var(--qd-ink-soft)]">{s.moreOpts}</summary>
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <Field label={s.baby} htmlFor="q-baby">
                <input id="q-baby" className={inputCls} value={baby} onChange={(e) => setBaby(e.target.value)} placeholder={s.babyPh} maxLength={60} />
              </Field>
              <Field label={t.settings.country} htmlFor="q-country">
                <select id="q-country" className={inputCls} value={country} onChange={(e) => { const c = countries.find((x) => x.c === e.target.value)!; setCountry(c.c); setCurrency(c.cur); }}>
                  {countries.map((c) => <option key={c.c} value={c.c}>{c[lang]}</option>)}
                </select>
              </Field>
            </div>
          </details>
          {err && <p role="alert" className="mt-3 text-sm text-[var(--qd-alert)]">{err}</p>}
          <Button size="lg" className="mt-6 w-full" onClick={finish}>{s.start}</Button>
          <p className="mt-3 text-[12.5px] text-[var(--qd-muted)]">{s.ready}</p>
          <button type="button" onClick={finish} className="sr-only">{s.skip}</button>
        </div>
      </motion.div>
    </div>
  );
}
