"use client";

import { useEffect, useState } from "react";
import { useQ } from "../app/state";
import { themeFor, type BabyGender, type Country } from "../model/types";
import { countries } from "../sections/Setup";
import { Clicky } from "@/components/brand/Clicky";
import { QD_INK } from "./Mascot";
import { Field, Sheet, cx, inputCls } from "./kit";

/**
 * «تعديل المعلومات»: one clear place to change the mother's name, the baby's name, the due date and
 * boy/girl. Opened from the pencil on the dashboard and from Settings; nothing saves until «حفظ».
 */
export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, plan, dispatch, say, lang } = useQ();
  const p = plan.profile!;
  const ar = lang === "ar";
  const initial = () => ({ mother: p.motherName, baby: p.babyName ?? "", due: p.dueDate ?? "", country: p.country, city: p.city ?? "", gender: p.babyGender ?? (p.theme === "moon" ? "boy" : p.theme === "garden" ? "surprise" : "girl") as BabyGender });
  const [f, setF] = useState(initial);
  useEffect(() => { if (open) setF(initial()); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    const mother = f.mother.trim();
    if (!mother) return;
    dispatch({ t: "profile", patch: { motherName: mother.slice(0, 60), babyName: f.baby.trim().slice(0, 60) || undefined, dueDate: f.due || undefined, babyGender: f.gender, theme: themeFor(f.gender), city: f.city.trim().slice(0, 60) || undefined, ...(f.country !== p.country ? { country: f.country, timeZone: countries.find((c) => c.c === f.country)!.tz } : {}) } });
    say(ar ? "انحفظت المعلومات" : "Details saved");
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={ar ? "تعديل المعلومات" : "Edit details"}
      footer={
        <div className="flex w-full gap-2">
          <button type="button" onClick={save} disabled={!f.mother.trim()} className="h-12 min-w-32 flex-1 rounded-full bg-[var(--qd-primary)] text-[15px] font-bold text-white disabled:opacity-50">{ar ? "حفظ" : "Save"}</button>
          <button type="button" onClick={onClose} className="h-12 rounded-full border border-[var(--qd-line)] px-5 text-[15px] font-semibold">{t.common.cancel}</button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-[14px] text-[var(--qd-muted)]">{ar ? "غيّري أي شي، واضغطي «حفظ». ينعكس على كل الصفحات." : "Change anything, then tap Save. It updates every page."}</p>
        <Field label={ar ? "اسم البيبي" : "Baby's name"} hint={ar ? "تقدرين تكتبين اسم مؤقت وتغيرينه بعدين" : "A placeholder is fine; change it any time"} htmlFor="ps-baby">
          <input id="ps-baby" className={inputCls} value={f.baby} maxLength={60} onChange={(e) => setF({ ...f, baby: e.target.value })} />
        </Field>
        <Field label={ar ? "اسمك (وش نناديك)" : "Your name (what we call you)"} htmlFor="ps-mother">
          <input id="ps-mother" className={inputCls} value={f.mother} maxLength={60} onChange={(e) => setF({ ...f, mother: e.target.value })} />
        </Field>
        <Field label={t.setup.due} htmlFor="ps-due">
          <input id="ps-due" type="date" dir="ltr" className={`${inputCls} text-start`} value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.settings.country} htmlFor="ps-country">
            <select id="ps-country" className={inputCls} value={f.country} onChange={(e) => setF({ ...f, country: e.target.value as Country })}>{countries.map((c) => <option key={c.c} value={c.c}>{c[lang]}</option>)}</select>
          </Field>
          <Field label={ar ? "المدينة" : "City"} htmlFor="ps-city">
            <input id="ps-city" className={inputCls} value={f.city} maxLength={60} placeholder={ar ? "اختياري" : "Optional"} onChange={(e) => setF({ ...f, city: e.target.value })} />
          </Field>
        </div>
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-[var(--qd-ink-soft)]">{t.setup.genderQ}</p>
          <div role="radiogroup" className="grid grid-cols-3 gap-2">
            {([["boy", t.setup.boy, "#7ea6dc"], ["girl", t.setup.girl, "#ff9fb8"], ["surprise", t.setup.surprise, "#12b5a6"]] as const).map(([g, label, color]) => {
              const on = f.gender === g;
              return (
                <button key={g} type="button" role="radio" aria-checked={on} onClick={() => setF({ ...f, gender: g })} className={cx("flex flex-col items-center gap-1 rounded-[18px] border-2 py-2.5", on ? "border-[var(--qd-primary)] bg-[var(--qd-tint)]" : "border-transparent bg-[var(--qd-tint-2)]")}>
                  <Clicky size={36} color={color} ink={QD_INK} accessory={g === "girl" ? "girl" : g === "boy" ? "boy" : "baby"} mood="sweet" />
                  <span className="text-[13.5px] font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

