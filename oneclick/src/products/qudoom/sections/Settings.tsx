"use client";

import Link from "next/link";
import { useState } from "react";
import { DownloadSimpleIcon, GearSixIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { parseMoney, toMajor } from "../model/engine";
import { allSections, themeFor, type Country, type Currency, type ReceptionKind } from "../model/types";
import { Clicky } from "@/components/brand/Clicky";
import { Button, Card, ChoiceCard, Field, PageHeader, SectionTitle, Toggle, cx, inputCls, useConfirm } from "../ui/kit";
import { countries, currencies, sectionLabel } from "./Setup";
import { groups } from "../constants";
import { ProfileSheet } from "../ui/ProfileSheet";
import { BabyMascot } from "../ui/Mascot";
import { pageIcons, usePageLabel, usePageVisible } from "../app/Shell";

export function SettingsPage({ switchHref }: { switchHref: string }) {
  const { t, plan, dispatch, lang, mode, api, say, today } = useQ();
  const p = plan.profile!;
  const confirm = useConfirm();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const set = (patch: Partial<typeof p>) => dispatch({ t: "profile", patch });
  const exportData = () => {
    if (api.exportUrl) return void (window.location.href = api.exportUrl);
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hikayat-qudoom.json";
    a.click();
  };
  const del = () =>
    confirm.ask(t.settings.delConfirm, async () => {
      setBusy(true);
      const r = await api.deleteAll();
      setBusy(false);
      if (!r.ok && r.reason !== "demo") return say(t.common.saveError);
      dispatch({ t: "reset" });
      say(t.settings.delDone);
      setTimeout(() => window.location.reload(), 600);
    });
  return (
    <div className="space-y-6">
      <PageHeader title={t.settings.title} sub={t.settings.sub} icon={<GearSixIcon size={22} />} />
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3 rounded-[20px] bg-[var(--qd-tint-2)] p-3">
          <BabyMascot size={48} theme={p.theme} animate={false} />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold">{p.babyName || (lang === "ar" ? "البيبي" : "Baby")} · {p.motherName}</p>
            <p className="text-[13px] text-[var(--qd-muted)]">{lang === "ar" ? "الاسم والموعد وولد ولا بنت" : "Names, due date, boy or girl"}</p>
          </div>
          <Button onClick={() => setEditing(true)}><PencilSimpleIcon size={17} /> {lang === "ar" ? "تعديل المعلومات" : "Edit details"}</Button>
        </div>
        <ProfileSheet open={editing} onClose={() => setEditing(false)} />
        <SectionTitle title={t.settings.profile} />
        <div key={`${p.motherName}|${p.babyName ?? ""}|${p.dueDate ?? ""}`} className="grid gap-4 sm:grid-cols-2">
          <Field label={t.setup.you} htmlFor="s-name"><input id="s-name" className={inputCls} defaultValue={p.motherName} maxLength={60} onBlur={(e) => e.target.value.trim() && e.target.value !== p.motherName && set({ motherName: e.target.value.trim() })} /></Field>
          <Field label={t.setup.baby} htmlFor="s-baby"><input id="s-baby" className={inputCls} defaultValue={p.babyName ?? ""} maxLength={60} onBlur={(e) => e.target.value !== (p.babyName ?? "") && set({ babyName: e.target.value.trim() || undefined })} /></Field>
          <Field label={t.setup.due} hint={t.setup.dueHint} htmlFor="s-due"><input id="s-due" type="date" dir="ltr" className={`${inputCls} text-start`} defaultValue={p.dueDate ?? ""} onChange={(e) => set({ dueDate: e.target.value || undefined })} /></Field>
          <Field label={t.setup.first} htmlFor="s-first">
            <select id="s-first" className={inputCls} value={p.firstTime ?? ""} onChange={(e) => set({ firstTime: (e.target.value || undefined) as typeof p.firstTime })}><option value="">—</option><option value="yes">{t.common.yes}</option><option value="no">{t.common.no}</option></select>
          </Field>
          <Field label={t.settings.country} htmlFor="s-country">
            <select id="s-country" className={inputCls} value={p.country} onChange={(e) => { const c = countries.find((x) => x.c === e.target.value)!; set({ country: c.c as Country, timeZone: c.tz }); }}>{countries.map((c) => <option key={c.c} value={c.c}>{c[lang]}</option>)}</select>
          </Field>
          <Field label={t.settings.currency} hint={t.budgetT.noFx} htmlFor="s-cur">
            <select id="s-cur" className={inputCls} value={p.currency} onChange={(e) => set({ currency: e.target.value as Currency })}>{currencies.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </Field>
          <Field label={t.setup.budget} hint={t.setup.budgetHint} htmlFor="s-budget"><input id="s-budget" inputMode="decimal" dir="ltr" className={`${inputCls} text-start`} defaultValue={p.budgetMinor !== undefined ? String(toMajor(p.budgetMinor, p.currency)) : ""} onBlur={(e) => { const v = e.target.value.trim(); if (!v) return set({ budgetMinor: undefined }); const m = parseMoney(v, p.currency); if (m !== undefined) set({ budgetMinor: m }); }} /></Field>
          <Field label={t.settings.tz} htmlFor="s-tz"><input id="s-tz" dir="ltr" className={`${inputCls} text-start`} defaultValue={p.timeZone} maxLength={40} onBlur={(e) => { const v = e.target.value.trim(); try { new Intl.DateTimeFormat("en", { timeZone: v }); if (v !== p.timeZone) set({ timeZone: v }); } catch {} }} /></Field>
        </div>
        <Toggle checked={!!p.arrived} onChange={(v) => dispatch({ t: "arrived", on: v, date: today })} label={t.home.arrivedYes} />
        <Link href={switchHref} className="inline-flex h-10 items-center rounded-full border border-[var(--qd-line)] px-4 text-[14px]">{t.top.lang}</Link>
      </Card>
      <Card className="space-y-3 p-4 sm:p-5">
        <SectionTitle title={t.settings.sections} />
        <div className="grid gap-x-6 sm:grid-cols-2">
          {allSections.map((s) => <Toggle key={s} checked={p.sections[s]} onChange={(v) => set({ sections: { ...p.sections, [s]: v }, preset: "custom" })} label={sectionLabel(t, s)} />)}
        </div>
        <p className="pt-2 text-[13px] font-medium text-[var(--qd-ink-soft)]">{t.setup.reception}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(["hospital", "home", "family", "aqiqah", "shower", "reveal", "custom"] as ReceptionKind[]).map((k) => <ChoiceCard key={k} multi selected={p.receptionKinds.includes(k)} onClick={() => set({ receptionKinds: p.receptionKinds.includes(k) ? p.receptionKinds.filter((x) => x !== k) : [...p.receptionKinds, k] })}>{t.cats.reception[k]}</ChoiceCard>)}
        </div>
      </Card>
      <Card className="space-y-3 p-4 sm:p-5">
        <SectionTitle title={t.setup.genderQ} />
        <div role="radiogroup" className="grid grid-cols-3 gap-2.5">
          {([["boy", t.setup.boy, "#7ea6dc"], ["girl", t.setup.girl, "#ff9fb8"], ["surprise", t.setup.surprise, "#12b5a6"]] as const).map(([g, label, color]) => {
            const on = (p.babyGender ?? (p.theme === "moon" ? "boy" : p.theme === "garden" ? "surprise" : "girl")) === g;
            return (
              <button key={g} type="button" role="radio" aria-checked={on} onClick={() => set({ babyGender: g, theme: themeFor(g) })} className={cx("flex flex-col items-center gap-1.5 rounded-[20px] border-2 py-3 transition-colors", on ? "border-[var(--qd-primary)] bg-[var(--qd-tint)]" : "border-transparent bg-[var(--qd-tint-2)]")}>
                <Clicky size={40} color={color} ink="#5a5570" accessory={g === "girl" ? "girl" : g === "boy" ? "boy" : "baby"} mood={on ? "love" : "sweet"} />
                <span className="text-[14.5px] font-bold">{label}</span>
              </button>
            );
          })}
        </div>
      </Card>
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1"><p className="font-semibold">{t.settings.export}</p><p className="text-[13px] text-[var(--qd-muted)]">{t.settings.exportSub}</p></div>
          <Button variant="secondary" onClick={exportData}><DownloadSimpleIcon size={17} /> {t.settings.export}</Button>
        </div>
        {mode !== "helper" && (
          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--qd-line)] pt-4">
            <div className="min-w-0 flex-1"><p className="font-semibold text-[var(--qd-alert)]">{t.settings.del}</p><p className="text-[13px] text-[var(--qd-muted)]">{t.settings.delSub}</p><p className="text-[12px] text-[var(--qd-muted)]">{t.settings.account}</p></div>
            <Button variant="danger" disabled={busy} onClick={del}><TrashIcon size={17} /> {t.settings.del}</Button>
          </div>
        )}
      </Card>
      {confirm.node(t.common.delete, t.common.cancel)}
    </div>
  );
}

export function MorePage() {
  const { t, href } = useQ();
  const label = usePageLabel();
  const visible = usePageVisible();
  const list = [...groups.find((g) => g.key === "more")!.pages.filter((p) => p !== "more"), ...groups.filter((g) => g.key !== "more" && g.key !== "home").flatMap((g) => g.pages)].filter(visible);
  return (
    <div className="space-y-5">
      <h1 className="text-[1.75rem] font-bold">{t.nav.more}</h1>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {list.map((p) => {
          const I = pageIcons[p];
          return (
            <li key={p}>
              <Link href={href(p)} className="qd-card flex min-h-24 flex-col justify-between gap-2 rounded-[20px] p-4 hover:border-[var(--qd-primary)]">
                <span className="grid size-10 place-items-center rounded-[12px] bg-[var(--qd-tint)] text-[var(--qd-primary)]"><I size={20} /></span>
                <span className="text-[14.5px] font-semibold">{label(p)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
