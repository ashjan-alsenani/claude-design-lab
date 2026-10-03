"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon, DownloadSimpleIcon, TranslateIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useBridal } from "../app/state";
import { navIcons, useNavLabel, type SectionKey } from "../app/Shell";
import type { Currency, EventKey, Profile } from "../model/types";
import { Button, Card, ChoiceCard, Field, SectionHeader, Toggle, inputCls, useConfirm } from "../ui/kit";

const currencies: Currency[] = ["OMR", "AED", "SAR", "QAR", "KWD", "BHD", "USD"];
const eventOrder: EventKey[] = ["proposal", "engagement", "milka", "henna", "shower", "wedding", "sabahiya", "other"];

export function Settings({ accountHref }: { accountHref: string }) {
  const { t, ws, dispatch, today, lang, mode } = useBridal();
  const S = t.settings;
  const p = ws.profile!;
  const [d, setD] = useState<Profile>(p);
  const [saved, setSaved] = useState(false);
  const confirm = useConfirm();
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => (setD((x) => ({ ...x, [k]: v })), setSaved(false));
  const save = () => {
    if (!d.brideName.trim() || !d.weddingDate) return;
    if (dispatch({ t: "profile", patch: { ...d, brideName: d.brideName.trim() } })) setSaved(true);
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(ws, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bridal-journey-${today}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="max-w-3xl space-y-6">
      <SectionHeader title={S.title} sub={S.sub} />
      <Card as="section" className="p-5 sm:p-6">
        <h2 className="bj-serif mb-5 text-[1.45rem]">{S.wedding}</h2>
        <form
          className="grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <Field label={t.onboarding.q.name} htmlFor="st-name">
            <input id="st-name" value={d.brideName} onChange={(e) => set("brideName", e.target.value)} className={inputCls} maxLength={60} required />
          </Field>
          <Field label={t.onboarding.q.partner} htmlFor="st-partner">
            <input id="st-partner" value={d.partnerName ?? ""} onChange={(e) => set("partnerName", e.target.value || undefined)} className={inputCls} maxLength={60} />
          </Field>
          <Field label={t.onboarding.q.date} htmlFor="st-date">
            <input id="st-date" type="date" dir="ltr" value={d.weddingDate} onChange={(e) => e.target.value && set("weddingDate", e.target.value)} className={`${inputCls} text-start`} />
          </Field>
          <Field label={t.onboarding.q.guests} htmlFor="st-guests">
            <input id="st-guests" type="number" dir="ltr" min={0} value={d.guests} onChange={(e) => set("guests", Math.max(0, Math.round(Number(e.target.value))))} className={`${inputCls} text-start`} />
          </Field>
          <Field label={t.onboarding.q.country} htmlFor="st-country">
            <input id="st-country" value={d.country} onChange={(e) => set("country", e.target.value)} className={inputCls} maxLength={60} />
          </Field>
          <Field label={t.onboarding.q.city} htmlFor="st-city">
            <input id="st-city" value={d.city} onChange={(e) => set("city", e.target.value)} className={inputCls} maxLength={60} />
          </Field>
          <Field label={t.budget.total} htmlFor="st-budget">
            <input id="st-budget" type="number" dir="ltr" min={0} value={d.budget} onChange={(e) => set("budget", Math.max(0, Number(e.target.value)))} className={`${inputCls} text-start`} />
          </Field>
          <Field label={t.onboarding.q.currency} htmlFor="st-cur">
            <select id="st-cur" value={d.currency} onChange={(e) => set("currency", e.target.value as Currency)} className={inputCls}>
              {currencies.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label={t.onboarding.q.style} htmlFor="st-style">
            <select id="st-style" value={d.style} onChange={(e) => set("style", e.target.value as Profile["style"])} className={inputCls}>
              {(Object.keys(t.styles) as Profile["style"][]).map((s) => (
                <option key={s} value={s}>
                  {t.styles[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.onboarding.q.planning} htmlFor="st-plan">
            <select id="st-plan" value={d.planning} onChange={(e) => set("planning", e.target.value as Profile["planning"])} className={inputCls}>
              {(Object.keys(t.planningOpt) as Profile["planning"][]).map((s) => (
                <option key={s} value={s}>
                  {t.planningOpt[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.onboarding.q.home} htmlFor="st-home">
            <select id="st-home" value={d.home} onChange={(e) => set("home", e.target.value as Profile["home"])} className={inputCls}>
              {(["yes", "partial", "no"] as const).map((v) => (
                <option key={v} value={v}>
                  {t.homeOpt[v]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.onboarding.q.honeymoon} htmlFor="st-honey">
            <select id="st-honey" value={d.honeymoon} onChange={(e) => set("honeymoon", e.target.value as Profile["honeymoon"])} className={inputCls}>
              {(["yes", "notyet", "no"] as const).map((v) => (
                <option key={v} value={v}>
                  {t.honeyOpt[v]}
                </option>
              ))}
            </select>
          </Field>
          <fieldset className="col-span-2 mt-2">
            <legend className="mb-3 text-[13px] font-medium text-bj-ink-soft">{S.eventsTitle}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {eventOrder.map((ev) => (
                <div key={ev}>
                  <ChoiceCard multi selected={d.events.includes(ev)} onClick={() => set("events", d.events.includes(ev) ? d.events.filter((x) => x !== ev) : [...d.events, ev])}>
                    {t.events[ev]}
                  </ChoiceCard>
                  {d.events.includes(ev) && ev !== "wedding" && (
                    <input
                      type="date"
                      dir="ltr"
                      aria-label={`${S.eventDate}: ${t.events[ev]}`}
                      value={d.eventDates[ev] ?? ""}
                      onChange={(e) => set("eventDates", { ...d.eventDates, [ev]: e.target.value || undefined })}
                      className={`${inputCls} mt-1.5 h-10 text-start text-sm`}
                    />
                  )}
                </div>
              ))}
            </div>
          </fieldset>
          <div className="col-span-2 flex items-center gap-3 pt-2">
            <Button type="submit">{t.common.save}</Button>
            {saved && (
              <span role="status" className="inline-flex items-center gap-1 text-[13px] text-bj-sage">
                <CheckIcon size={15} />
                {S.saved}
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card as="section" className="p-5 sm:p-6">
        <h2 className="bj-serif mb-2 text-[1.45rem]">{S.preferences}</h2>
        <div className="divide-y divide-bj-line">
          <Toggle checked={p.groomSection} onChange={(v) => dispatch({ t: "profile", patch: { groomSection: v } })} label={S.groom} />
          <Toggle checked={p.calendarShowsTasks} onChange={(v) => dispatch({ t: "profile", patch: { calendarShowsTasks: v } })} label={S.calendarTasks} />
        </div>
      </Card>

      <Card as="section" className="p-5 sm:p-6">
        <h2 className="bj-serif mb-4 text-[1.45rem]">{S.data}</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportData}>
            <DownloadSimpleIcon size={16} />
            {S.export}
          </Button>
          <Button variant="soft" onClick={() => confirm.ask(S.demoConfirm, () => dispatch({ t: "demo", today, lang }))}>
            {S.demo}
          </Button>
          <Button variant="danger" onClick={() => confirm.ask(S.resetConfirm, () => dispatch({ t: "reset" }))}>
            {S.reset}
          </Button>
        </div>
      </Card>

      {mode === "licensed" && (
        <Link href={accountHref} className="inline-flex items-center gap-2 text-[14px] text-bj-gold-ink">
          {S.accountLink}
          <ArrowRightIcon size={15} className="rtl:rotate-180" />
        </Link>
      )}
      {confirm.node(t.common.yes, t.common.cancel)}
    </div>
  );
}

export function More() {
  const { t, href, locale } = useBridal();
  const label = useNavLabel();
  const pathname = usePathname();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const keys: Exclude<SectionKey, "" | "more">[] = ["vendors", "guests", "bride", "closet", "shopping", "home", "honeymoon", "day", "inspiration", "documents", "settings"];
  return (
    <div className="space-y-6">
      <SectionHeader title={t.more.title} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {keys.map((k) => {
          const I = navIcons[k];
          return (
            <li key={k}>
              <Link href={href(k)} className="bj-icon-hover flex h-28 flex-col justify-between rounded-[20px] border border-bj-line bg-bj-paper p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(80,50,40,.3)]">
                <span className="grid size-10 place-items-center rounded-2xl bg-[linear-gradient(145deg,#f7ece7,#efdcd4)] text-bj-gold-ink">
                  <I size={21} weight="duotone" className="bj-icon" />
                </span>
                <span className="text-[15px] text-bj-ink">{label(k)}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link href={pathname.replace(`/${locale}/`, `/${otherLocale}/`)} hrefLang={otherLocale} className="bj-icon-hover flex h-28 flex-col justify-between rounded-[20px] border border-bj-line bg-bj-paper p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-[linear-gradient(145deg,#f7ece7,#efdcd4)] text-bj-gold-ink">
              <TranslateIcon size={21} weight="duotone" className="bj-icon" />
            </span>
            <span className="text-[15px] text-bj-ink">{t.top.switchLang}</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
