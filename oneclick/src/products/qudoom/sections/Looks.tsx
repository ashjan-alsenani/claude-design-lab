"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircleIcon, CheckIcon, SparkleIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { isLookTask, lookChecklist, looks, lookTitle, palettes, places, themes, type Look, type LookPlace, type LookTheme } from "../model/looks";
import { LookArt } from "../ui/Illustrations";
import { Photo, lookPhoto } from "../ui/FavorPhoto";
import { BabyMascot } from "../ui/Mascot";
import { Sheet, cx } from "../ui/kit";

/**
 * «أشكال الاستقبال»: 1,000 illustrated welcome looks (10 themes × 20 palettes × 5 places). Filter
 * by place, theme and colour; open one to see it big with everything to prepare; adopt it and its
 * checklist becomes her welcome tasks (the look id in its notes tells the step-by-step guide).
 */
export function LooksPage() {
  const { t, lang, plan, dispatch, newId, access, say, num } = useQ();
  const reduce = useReducedMotion();
  const ar = lang === "ar";
  const [place, setPlace] = useState<LookPlace | "all">("all");
  const [theme, setTheme] = useState<LookTheme | "all">("all");
  const [pal, setPal] = useState<string>("all");
  const [shown, setShown] = useState(12);
  const [open, setOpen] = useState<Look | null>(null);
  const list = useMemo(() => looks.filter((l) => (place === "all" || l.place === place) && (theme === "all" || l.theme === theme) && (pal === "all" || l.palette.id === pal)), [place, theme, pal]);
  const chosen = plan.tasks.find(isLookTask);
  const reset = () => setShown(12);

  const adopt = (l: Look) => {
    const title = `${ar ? "شكل الاستقبال" : "Welcome look"}: ${lookTitle(l, lang)} · ${(ar ? places : places).find((p) => p.id === l.place)![ar ? "ar" : "en"]}`.slice(0, 160);
    // Replace an earlier choice's headline; keep any tasks she already ticked.
    if (chosen) dispatch({ t: "del", c: "tasks", id: chosen.id });
    dispatch({ t: "put", c: "tasks", item: { id: newId("tk"), title, area: "reception", status: "todo", notes: l.id } });
    for (const item of lookChecklist(l, lang)) if (!plan.tasks.some((k) => k.title === item)) dispatch({ t: "put", c: "tasks", item: { id: newId("tk"), title: item.slice(0, 160), area: "reception", status: "todo" } });
    say(ar ? "اعتمدنا الشكل، وانضافت قائمة التجهيز لمهام الاستقبال" : "Look adopted; its checklist is in your welcome tasks");
    setOpen(null);
  };

  const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button type="button" aria-pressed={on} onClick={onClick} className={cx("flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors", on ? "bg-[var(--qd-primary)] text-white" : "bg-[var(--qd-paper)] text-[var(--qd-ink-soft)]")}>
      {children}
    </button>
  );

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <BabyMascot size={58} theme={plan.profile?.theme} mood="celebrate" />
        <div className="min-w-0">
          <h1 className="text-[1.6rem] font-extrabold leading-tight">{t.nav.looks}</h1>
          <p className="text-[14px] text-[var(--qd-muted)]">{ar ? `${num(looks.length)} شكل مرسوم. اختاري المكان والطابع واللون.` : `${num(looks.length)} illustrated looks. Pick a place, a theme and colours.`}</p>
        </div>
      </header>

      {chosen && (
        <p className="flex items-center gap-2 rounded-[18px] bg-[var(--qd-tint)] px-4 py-3 text-[14px] font-semibold text-[var(--qd-primary-deep)]">
          <CheckCircleIcon size={20} weight="fill" /> {ar ? "شكلك المختار:" : "Your look:"} {chosen.title.replace(/^(\u2728 |شكل الاستقبال: |Welcome look: )/, "")}
        </p>
      )}

      {themes.some((th) => lookPhoto(th.id)) && (
        <section aria-label={ar ? "صور حقيقية تقريبية" : "Approximate real photos"}>
          <p className="mb-2 text-[14px] font-bold">{ar ? "شوفيها كصور حقيقية" : "See them as real photos"}</p>
          <div className="qd-scroll-x -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {themes.filter((th) => lookPhoto(th.id)).map((th) => (
              <button key={th.id} type="button" aria-pressed={theme === th.id} onClick={() => (setTheme(theme === th.id ? "all" : th.id), reset())} className={cx("w-36 shrink-0 overflow-hidden rounded-[20px] bg-[var(--qd-paper)] text-start ring-2", theme === th.id ? "ring-[var(--qd-primary)]" : "ring-transparent")}>
                <Photo src={lookPhoto(th.id)!} className="aspect-square w-full" />
                <span className="block truncate px-2.5 py-2 text-[13px] font-bold">{ar ? th.ar : th.en}</span>
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11.5px] text-[var(--qd-muted)]">{ar ? "صور تقريبية بالذكاء الاصطناعي لفكرة كل طابع." : "Approximate AI photos of each theme."}</p>
        </section>
      )}

      <div className="space-y-2">
        <div className="qd-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4">
          <Chip on={place === "all"} onClick={() => (setPlace("all"), reset())}>{ar ? "كل الأماكن" : "All places"}</Chip>
          {places.map((p) => <Chip key={p.id} on={place === p.id} onClick={() => (setPlace(p.id), reset())}>{ar ? p.ar : p.en}</Chip>)}
        </div>
        <div className="qd-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4">
          <Chip on={theme === "all"} onClick={() => (setTheme("all"), reset())}>{ar ? "كل الطوابع" : "All themes"}</Chip>
          {themes.map((th) => <Chip key={th.id} on={theme === th.id} onClick={() => (setTheme(th.id), reset())}>{ar ? th.ar : th.en}</Chip>)}
        </div>
        <div className="qd-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 py-1" role="group" aria-label={ar ? "الألوان" : "Colours"}>
          <button type="button" aria-pressed={pal === "all"} onClick={() => (setPal("all"), reset())} className={cx("h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold", pal === "all" ? "bg-[var(--qd-ink)] text-white" : "bg-[var(--qd-paper)]")}>{ar ? "كل الألوان" : "All colours"}</button>
          {palettes.map((p) => (
            <button key={p.id} type="button" aria-pressed={pal === p.id} title={ar ? p.ar : p.en} aria-label={ar ? p.ar : p.en} onClick={() => (setPal(p.id), reset())} className={cx("flex size-9 shrink-0 overflow-hidden rounded-full border-2 transition-transform", pal === p.id ? "scale-110 border-[var(--qd-ink)]" : "border-white")}>
              <span className="h-full w-1/2" style={{ background: p.main }} /><span className="h-full w-1/2" style={{ background: p.accent }} />
            </button>
          ))}
        </div>
      </div>

      <p className="text-[13px] font-semibold text-[var(--qd-muted)]">{ar ? `${num(list.length)} شكل` : `${num(list.length)} looks`}</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AnimatePresence initial={false}>
          {list.slice(0, shown).map((l, i) => (
            <motion.li key={l.id} initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, transition: { delay: Math.min(i, 8) * 0.03 } }}>
              <motion.button type="button" whileHover={reduce ? undefined : { y: -3 }} whileTap={reduce ? undefined : { scale: 0.97 }} onClick={() => setOpen(l)} className="qd-card block w-full overflow-hidden rounded-[22px] text-start">
                <LookArt look={l} className="aspect-[16/10] w-full" />
                <span className="block px-3 py-2.5">
                  <span className="block truncate text-[13.5px] font-bold">{lookTitle(l, lang)}</span>
                  <span className="block truncate text-[12px] text-[var(--qd-muted)]">{places.find((p) => p.id === l.place)![ar ? "ar" : "en"]}</span>
                </span>
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {list.length > shown && (
        <button type="button" onClick={() => setShown((n) => n + 12)} className="mx-auto block h-11 rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] px-6 text-[14px] font-semibold">
          {t.ideasT.more} ({num(list.length - shown)})
        </button>
      )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? lookTitle(open, lang) : ""} wide>
        {open && (
          <div className="space-y-4">
            {lookPhoto(open.theme) && (
              <figure className="relative overflow-hidden rounded-[18px]">
                <Photo src={lookPhoto(open.theme)!} alt={lookTitle(open, lang)} className="aspect-[4/3] w-full" />
                <figcaption className="absolute bottom-2 start-2 rounded-full bg-white/85 px-2.5 py-1 text-[11.5px] font-semibold text-[var(--qd-ink-soft)]">{ar ? "صورة تقريبية للطابع" : "Approximate photo of the theme"}</figcaption>
              </figure>
            )}
            <LookArt look={open} className="aspect-[16/10] w-full rounded-[18px]" />
            <p className="text-[14px] font-semibold text-[var(--qd-muted)]">{places.find((p) => p.id === open.place)![ar ? "ar" : "en"]}</p>
            <div>
              <p className="flex items-center gap-1.5 text-[15px] font-extrabold"><SparkleIcon size={18} weight="fill" className="text-[var(--qd-star)]" /> {ar ? "اللي تحتاجينه لهالشكل" : "What you'll need"}</p>
              <ul className="mt-2 space-y-1.5">
                {lookChecklist(open, lang).map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[14.5px]"><CheckIcon size={16} weight="bold" className="mt-1 shrink-0 text-[var(--qd-primary)]" /> {x}</li>
                ))}
              </ul>
            </div>
            {access.canEdit && (
              <button type="button" onClick={() => adopt(open)} className="h-12 w-full rounded-full bg-[var(--qd-primary)] text-[15px] font-bold text-white">
                {ar ? "اعتمدي هذا الشكل" : "Adopt this look"}
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
