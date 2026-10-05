"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState, type CSSProperties } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";
import { addDays, diffDays, resolveTasks } from "../model/engine";
import { applyOp } from "../model/reducer";
import { emptyWorkspace, type Currency, type EventKey, type Profile } from "../model/types";
import { Flourish, Petals } from "../ui/Art";
import heroPhoto from "../assets/bride-hero.jpg";

import { Button, ChoiceCard, Field, inputCls } from "../ui/kit";

const currencies: Currency[] = ["OMR", "AED", "SAR", "QAR", "KWD", "BHD", "USD"];
const countries = [
  { en: "Oman", ar: "عُمان", cur: "OMR" },
  { en: "United Arab Emirates", ar: "الإمارات", cur: "AED" },
  { en: "Saudi Arabia", ar: "السعودية", cur: "SAR" },
  { en: "Qatar", ar: "قطر", cur: "QAR" },
  { en: "Kuwait", ar: "الكويت", cur: "KWD" },
  { en: "Bahrain", ar: "البحرين", cur: "BHD" },
] as const;
const eventOrder: EventKey[] = ["proposal", "engagement", "milka", "henna", "shower", "wedding", "sabahiya", "other"];
const STEPS = 8;

export function Welcome({ onStart, exitHref }: { onStart: () => void; exitHref: string }) {
  const { t, dispatch, today, lang, mode } = useBridal();
  return (
    <div className="bj relative min-h-dvh overflow-hidden" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      <div className="mx-auto grid min-h-dvh max-w-6xl items-center gap-8 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="bj-enter order-2 lg:order-1">
          <p className="text-[12px] uppercase tracking-[0.22em] text-bj-gold-ink">{t.welcome.eyebrow}</p>
          <h1 className="bj-serif mt-4 text-[2.6rem] leading-[1.12] text-bj-ink sm:text-[3.4rem]">{t.welcome.title}</h1>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-bj-ink-soft">{t.welcome.sub}</p>
          <ul className="mt-7 space-y-2.5">
            {t.welcome.points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] text-bj-ink">
                <span className="grid size-6 place-items-center rounded-full bg-bj-sage-soft text-bj-sage">
                  <CheckIcon size={13} weight="bold" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" onClick={onStart}>
              {t.welcome.cta}
              <ArrowRightIcon size={18} className="rtl:rotate-180" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => dispatch({ t: "demo", today, lang })}>
              {t.welcome.demo}
            </Button>
          </div>
          {mode === "licensed" && (
            <Link href={exitHref} className="mt-8 inline-flex items-center gap-1.5 text-[13px] text-bj-muted hover:text-bj-ink">
              <ArrowLeftIcon size={14} className="rtl:rotate-180" />
              {t.top.exit}
            </Link>
          )}
        </div>
        <div style={{ "--bj-enter-delay": "120ms" } as CSSProperties} className="bj-enter order-1 mx-auto w-full max-w-[220px] sm:max-w-[300px] lg:order-2 lg:max-w-[420px]">
          <BridePhoto alt={t.dash.heroAlt} sizes="(min-width: 1024px) 420px, 300px" priority />
        </div>
      </div>
    </div>
  );
}

/** The approved bride photograph inside an arch, echoing the dashboard hero. */
function BridePhoto({ alt, sizes, priority, className = "w-full" }: { alt: string; sizes: string; priority?: boolean; className?: string }) {
  return (
    <div className={`relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[28px] border-4 border-bj-paper shadow-[0_30px_60px_-30px_rgba(110,70,60,.45)] ${className}`}>
      <Image src={heroPhoto} quality={85} alt={alt} fill priority={priority} sizes={sizes} placeholder="blur" className="object-cover object-[32%_30%] ltr:-scale-x-100" />
    </div>
  );
}

export function Onboarding({ onCancel }: { onCancel: () => void }) {
  const { t, dispatch, today, lang, num } = useBridal();
  const reduce = useReducedMotion();
  const o = t.onboarding;
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [p, setP] = useState<Profile>({
    brideName: "",
    weddingDate: addDays(today, 300),
    country: lang === "ar" ? "عُمان" : "Oman",
    city: "",
    budget: 0,
    currency: "OMR",
    guests: 200,
    events: ["milka", "henna", "wedding"],
    eventDates: {},
    home: "yes",
    honeymoon: "yes",
    style: "classic",
    planning: "family",
    stage: 0,
    groomSection: false,
    calendarShowsTasks: true,
    planStart: today,
  });
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => (setP((x) => ({ ...x, [k]: v })), setError(null));

  const preview = useMemo(() => (ready ? resolveTasks(applyOp(emptyWorkspace(), { t: "setup", profile: p, lang }), lang) : []), [ready, p, lang]);

  const validate = () => {
    if (step === 1 && !p.brideName.trim()) return o.errors.name;
    if (step === 2 && (!p.weddingDate || p.weddingDate <= today)) return o.errors.date;
    if (step === 4 && !(p.budget > 0)) return o.errors.budget;
    if (step === 6 && p.events.length === 0) return o.errors.events;
    return null;
  };
  const next = () => {
    const e = validate();
    if (e) return setError(e);
    setDir(1);
    if (step === STEPS) setReady(true);
    else setStep(step + 1);
  };
  const back = () => {
    setError(null);
    setDir(-1);
    if (step === 1) onCancel();
    else setStep(step - 1);
  };

  if (ready) {
    const days = diffDays(today, p.weddingDate);
    return (
      <div className="bj grid min-h-dvh place-items-center px-6 text-center" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
        <div className="bj-enter max-w-md">
          <div className="mx-auto w-fit">
            <div className="relative">
              <Petals count={22} />
              <BridePhoto alt="" sizes="176px" className="w-44" />
            </div>
          </div>
          <h1 className="bj-serif mt-8 text-[2.4rem] leading-tight text-bj-ink">
            {o.ready}
          </h1>
          <Flourish className="mx-auto mt-3" />
          <p className="mt-3 leading-relaxed text-bj-ink-soft">{o.readySub(num(preview.filter((x) => x.status !== "done").length), num(days))}</p>
          <Button size="lg" className="mt-8" onClick={() => dispatch({ t: "setup", profile: { ...p, brideName: p.brideName.trim(), planStart: today }, lang })}>
            {o.readyCta}
            <ArrowRightIcon size={18} className="rtl:rotate-180" />
          </Button>
        </div>
      </div>
    );
  }

  const Q = ({ title, hint }: { title: string; hint?: string }) => (
    <div className="mb-7">
      <h1 className="bj-serif text-[2rem] leading-tight text-bj-ink sm:text-[2.4rem]">{title}</h1>
      {hint && <p className="mt-2 text-[14.5px] leading-relaxed text-bj-muted">{hint}</p>}
    </div>
  );

  return (
    <div className="bj flex min-h-dvh flex-col" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
      <div className="mx-auto w-full max-w-xl px-6 pt-8">
        <div className="flex items-center justify-between text-[12.5px] text-bj-muted">
          <span>{o.step(num(step), num(STEPS))}</span>
          <span className="bj-serif text-[15px] text-bj-ink">{t.brand}</span>
        </div>
        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-bj-line" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step}>
          <motion.div className="h-full rounded-full bg-bj-gold" animate={{ width: `${(step / STEPS) * 100}%` }} transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }} />
        </div>
      </div>

      <form
        className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 pb-8 pt-10"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={reduce ? false : { opacity: 0, x: (lang === "ar" ? -1 : 1) * dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: (lang === "ar" ? 1 : -1) * dir * 24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
          >
            {step === 1 && (
              <>
                <Q title={o.q.name} hint={o.q.nameHint} />
                <div className="space-y-5">
                  <input aria-label={o.q.name} value={p.brideName} onChange={(e) => set("brideName", e.target.value)} className={`${inputCls} h-14 text-lg`} maxLength={60} autoFocus autoComplete="given-name" />
                  <Field label={o.q.partner} htmlFor="ob-partner">
                    <input id="ob-partner" value={p.partnerName ?? ""} onChange={(e) => set("partnerName", e.target.value || undefined)} className={inputCls} maxLength={60} />
                  </Field>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <Q title={o.q.date} hint={o.q.dateHint} />
                <input type="date" aria-label={o.q.date} dir="ltr" min={addDays(today, 1)} value={p.weddingDate} onChange={(e) => set("weddingDate", e.target.value)} className={`${inputCls} h-14 text-start text-lg`} />
                {p.weddingDate > today && <p className="bj-serif mt-6 text-center text-[1.6rem] text-bj-gold-ink">{num(diffDays(today, p.weddingDate))} {t.dash.daysUntil}</p>}
              </>
            )}
            {step === 3 && (
              <>
                <Q title={o.q.place} />
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={o.q.country}>
                    {countries.map((c) => (
                      <ChoiceCard key={c.en} selected={p.country === c[lang]} onClick={() => (set("country", c[lang]), set("currency", c.cur))}>
                        {c[lang]}
                      </ChoiceCard>
                    ))}
                  </div>
                  <Field label={o.q.country} htmlFor="ob-country">
                    <input id="ob-country" value={p.country} onChange={(e) => set("country", e.target.value)} className={inputCls} maxLength={60} />
                  </Field>
                  <Field label={o.q.city} htmlFor="ob-city">
                    <input id="ob-city" value={p.city} onChange={(e) => set("city", e.target.value)} className={inputCls} maxLength={60} autoComplete="address-level2" />
                  </Field>
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <Q title={o.q.budget} hint={o.q.budgetHint} />
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <input aria-label={o.q.budget} type="number" inputMode="numeric" min={0} dir="ltr" value={p.budget || ""} onChange={(e) => set("budget", Number(e.target.value))} className={`${inputCls} h-14 text-start text-lg`} autoFocus />
                  <select aria-label={o.q.currency} value={p.currency} onChange={(e) => set("currency", e.target.value as Currency)} className={`${inputCls} h-14 w-28`}>
                    {currencies.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[5000, 10000, 15000, 25000, 40000].map((b) => (
                    <Button key={b} size="sm" variant={p.budget === b ? "primary" : "soft"} onClick={() => set("budget", b)}>
                      {num(b)}
                    </Button>
                  ))}
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <Q title={o.q.guests} />
                <input aria-label={o.q.guests} type="number" inputMode="numeric" min={0} dir="ltr" value={p.guests || ""} onChange={(e) => set("guests", Math.max(0, Math.round(Number(e.target.value))))} className={`${inputCls} h-14 text-start text-lg`} />
                <input type="range" min={20} max={1000} step={10} value={Math.min(1000, p.guests)} onChange={(e) => set("guests", Number(e.target.value))} aria-label={o.q.guests} className="mt-6 w-full accent-[#c9a49a]" />
                <p className="bj-serif mt-3 text-center text-[1.8rem] text-bj-gold-ink">{num(p.guests)}</p>
              </>
            )}
            {step === 6 && (
              <>
                <Q title={o.q.events} hint={o.q.eventsHint} />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {eventOrder.map((ev) => (
                    <ChoiceCard key={ev} multi selected={p.events.includes(ev)} onClick={() => set("events", p.events.includes(ev) ? p.events.filter((x) => x !== ev) : [...p.events, ev])}>
                      {t.events[ev]}
                    </ChoiceCard>
                  ))}
                </div>
              </>
            )}
            {step === 7 && (
              <>
                <Q title={o.q.homeHoneymoon} />
                <fieldset>
                  <legend className="mb-3 text-[15px] font-medium text-bj-ink">{o.q.home}</legend>
                  <div className="grid grid-cols-3 gap-2.5" role="radiogroup">
                    {(["yes", "partial", "no"] as const).map((v) => (
                      <ChoiceCard key={v} selected={p.home === v} onClick={() => set("home", v)}>
                        {t.homeOpt[v]}
                      </ChoiceCard>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-8">
                  <legend className="mb-3 text-[15px] font-medium text-bj-ink">{o.q.honeymoon}</legend>
                  <div className="grid grid-cols-3 gap-2.5" role="radiogroup">
                    {(["yes", "notyet", "no"] as const).map((v) => (
                      <ChoiceCard key={v} selected={p.honeymoon === v} onClick={() => set("honeymoon", v)}>
                        {t.honeyOpt[v]}
                      </ChoiceCard>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            {step === 8 && (
              <>
                <Q title={o.q.style} />
                <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={o.q.style}>
                  {(Object.keys(t.styles) as Profile["style"][]).map((s) => (
                    <ChoiceCard key={s} selected={p.style === s} onClick={() => set("style", s)}>
                      {t.styles[s]}
                    </ChoiceCard>
                  ))}
                </div>
                <h2 className="mb-3 mt-8 text-[15px] font-medium text-bj-ink">{o.q.planning}</h2>
                <div className="grid gap-2.5" role="radiogroup" aria-label={o.q.planning}>
                  {(Object.keys(t.planningOpt) as Profile["planning"][]).map((s) => (
                    <ChoiceCard key={s} selected={p.planning === s} onClick={() => set("planning", s)}>
                      {t.planningOpt[s]}
                    </ChoiceCard>
                  ))}
                </div>
                <h2 className="mb-1 mt-8 text-[15px] font-medium text-bj-ink">{o.q.stage}</h2>
                <p className="mb-3 text-[13px] text-bj-muted">{o.q.stageHint}</p>
                <div className="grid gap-2.5" role="radiogroup" aria-label={o.q.stage}>
                  {t.stages.map((s, i) => (
                    <ChoiceCard key={s} selected={p.stage === i} onClick={() => set("stage", i as Profile["stage"])}>
                      {s}
                    </ChoiceCard>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-5 rounded-[12px] bg-bj-alert-soft px-4 py-2.5 text-sm text-bj-alert">
            {error}
          </p>
        )}
        <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-3 bg-bj-ivory/90 py-4 backdrop-blur">
          <Button variant="ghost" onClick={back}>
            <ArrowLeftIcon size={16} className="rtl:rotate-180" />
            {o.back}
          </Button>
          <Button size="lg" type="submit">
            {step === STEPS ? o.finish : o.next}
            <ArrowRightIcon size={18} className="rtl:rotate-180" />
          </Button>
        </div>
      </form>
    </div>
  );
}
