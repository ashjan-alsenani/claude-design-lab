"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircleIcon, CheckIcon, MagnifyingGlassIcon, SparkleIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { PageHeader } from "../ui/kit";
import { isLookTask, lookChecklist, looks, lookTitle, motifs, palettes, places, regions, type Look, type LookMotif, type LookPlace, type LookRegion } from "../model/looks";
import { LookArt } from "../ui/Illustrations";
import { Photo, lookPhotoFor } from "../ui/FavorPhoto";
import { Filter, FilterBar } from "../ui/Filter";
import { Sheet } from "../ui/kit";

/**
 * «أشكال الاستقبال»: 500+ distinct welcome setups across hospital, entrance, majlis, family, outdoors,
 * aqiqah, baby shower and gender reveal, each with a Gulf flavour and its own list of what to prepare.
 * Four dropdown filters (place, country, style, colours) and a search; adopt one and its list becomes
 * her welcome tasks.
 */
export function LooksPage() {
  const { t, lang, plan, dispatch, newId, access, say, num } = useQ();
  const reduce = useReducedMotion();
  const ar = lang === "ar";
  const L = <T extends { ar: string; en: string }>(x: T) => (ar ? x.ar : x.en);
  const [place, setPlace] = useState<LookPlace | "all">("all");
  const [region, setRegion] = useState<LookRegion | "all">("all");
  const [motif, setMotif] = useState<LookMotif | "all">("all");
  const [pal, setPal] = useState<string | "all">("all");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(12);
  const [open, setOpen] = useState<Look | null>(null);
  // Arriving from the baby shower or gender reveal plans opens their looks.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("place");
    if (p && places.some((x) => x.id === p)) setPlace(p as LookPlace);
  }, []);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return looks.filter(
      (l) =>
        (place === "all" || l.place === place) &&
        (region === "all" || l.region === region) &&
        (motif === "all" || l.motif === motif) &&
        (pal === "all" || l.palette.id === pal) &&
        (!needle || `${l.ar} ${l.en} ${l.arItems.join(" ")} ${l.enItems.join(" ")}`.toLowerCase().includes(needle)),
    );
  }, [place, region, motif, pal, q]);
  const count = <K extends keyof Look>(k: K, v: Look[K]) => looks.filter((l) => l[k] === v).length;
  const chosen = plan.tasks.find(isLookTask);
  const reset = () => setShown(12);
  const pick = <T,>(set: (v: T) => void) => (v: T) => (set(v), reset());
  const clear = () => (setPlace("all"), setRegion("all"), setMotif("all"), setPal("all"), setQ(""), reset());

  const adopt = (l: Look) => {
    const title = `${ar ? "شكل الاستقبال" : "Welcome look"}: ${lookTitle(l, lang)} · ${L(places.find((p) => p.id === l.place)!)}`.slice(0, 160);
    // Replace an earlier choice's headline; keep any tasks she already ticked.
    if (chosen) dispatch({ t: "del", c: "tasks", id: chosen.id });
    dispatch({ t: "put", c: "tasks", item: { id: newId("tk"), title, area: "reception", status: "todo", notes: `look:${l.id}` } });
    for (const item of lookChecklist(l, lang)) if (!plan.tasks.some((k) => k.title === item)) dispatch({ t: "put", c: "tasks", item: { id: newId("tk"), title: item.slice(0, 160), area: "reception", status: "todo" } });
    say(ar ? "اعتمدنا الشكل، وانضافت قائمة التجهيز لمهام الاستقبال" : "Look adopted; its checklist is in your welcome tasks");
    setOpen(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader title={t.nav.looks} sub={ar ? `${num(looks.length)} فكرة استقبال، كل وحدة غير عن الثانية.` : `${num(looks.length)} welcome ideas, each one different.`} />

      {chosen && (
        <p className="flex items-center gap-2 rounded-[18px] bg-[var(--qd-tint)] px-4 py-3 text-[14px] font-semibold text-[var(--qd-primary-deep)]">
          <CheckCircleIcon size={20} weight="fill" className="shrink-0" /> <span className="min-w-0">{ar ? "شكلك المختار:" : "Your look:"} {chosen.title.replace(/^(✨ |شكل الاستقبال: |Welcome look: )/, "")}</span>
        </p>
      )}

      <div className="relative">
        <MagnifyingGlassIcon size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--qd-muted)]" />
        <input type="search" value={q} onChange={(e) => (setQ(e.target.value), reset())} placeholder={ar ? "دوري: لؤلؤ، قهوة، غيوم…" : "Search: pearls, coffee, clouds…"} aria-label={ar ? "بحث" : "Search"} className="h-12 w-full rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] ps-11 pe-5 text-[15px] outline-none focus:border-[var(--qd-primary)]" />
      </div>
      <FilterBar active={place !== "all" || region !== "all" || motif !== "all" || pal !== "all" || !!q} onClear={clear} clearLabel={ar ? "مسح" : "Clear"}>
        <Filter label={ar ? "المكان" : "Place"} all={ar ? "كل الأماكن" : "All places"} value={place} onChange={pick(setPlace)} options={places.map((p) => ({ value: p.id, label: L(p), count: count("place", p.id) }))} />
        <Filter label={ar ? "البلد" : "Country"} all={ar ? "كل الخليج" : "All the Gulf"} value={region} onChange={pick(setRegion)} options={regions.map((r) => ({ value: r.id, label: L(r), count: count("region", r.id) }))} />
        <Filter label={ar ? "الطابع" : "Style"} all={ar ? "كل الطوابع" : "All styles"} value={motif} onChange={pick(setMotif)} options={motifs.map((m) => ({ value: m.id, label: L(m), count: count("motif", m.id) }))} />
        <Filter label={ar ? "الألوان" : "Colours"} all={ar ? "كل الألوان" : "All colours"} value={pal} onChange={pick(setPal)} options={palettes.map((p) => ({ value: p.id, label: L(p) }))} />
      </FilterBar>

      <p className="text-[13px] font-semibold text-[var(--qd-muted)]">{ar ? `${num(list.length)} فكرة` : `${num(list.length)} ideas`}</p>
      {list.length === 0 ? (
        <p className="py-8 text-center text-[15px] text-[var(--qd-muted)]">{ar ? "ما فيه أفكار بهالفلاتر. جربي تمسحين واحد منها." : "No ideas match. Try clearing a filter."}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence initial={false}>
            {list.slice(0, shown).map((l, i) => (
              <motion.li key={l.id} initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, transition: { delay: Math.min(i, 8) * 0.03 } }}>
                <motion.button type="button" whileHover={reduce ? undefined : { y: -3 }} whileTap={reduce ? undefined : { scale: 0.97 }} onClick={() => setOpen(l)} className="qd-card block h-full w-full overflow-hidden rounded-[22px] text-start">
                  <LookArt look={l} className="aspect-[16/10] w-full" />
                  <span className="block px-3 py-2.5">
                    <span className="line-clamp-2 block text-[13.5px] font-bold leading-snug">{lookTitle(l, lang)}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-[var(--qd-muted)]">{L(places.find((p) => p.id === l.place)!)} · {L(regions.find((r) => r.id === l.region)!)}</span>
                  </span>
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      {list.length > shown && (
        <button type="button" onClick={() => setShown((n) => n + 12)} className="mx-auto block h-11 rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] px-6 text-[14px] font-semibold">
          {t.ideasT.more} ({num(list.length - shown)})
        </button>
      )}

      <Sheet open={!!open} onClose={() => setOpen(null)} title={open ? lookTitle(open, lang) : ""} wide>
        {open && (
          <div className="space-y-4">
            <LookArt look={open} className="aspect-[16/10] w-full rounded-[18px]" />
            <p className="flex flex-wrap gap-1.5 text-[12.5px] font-semibold">
              {[L(places.find((p) => p.id === open.place)!), L(regions.find((r) => r.id === open.region)!), L(motifs.find((m) => m.id === open.motif)!)].map((x) => (
                <span key={x} className="rounded-full bg-[var(--qd-tint-2)] px-2.5 py-1 text-[var(--qd-ink-soft)]">{x}</span>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--qd-tint-2)] px-2.5 py-1 text-[var(--qd-ink-soft)]">
                <span className="flex size-3.5 overflow-hidden rounded-full"><span className="w-1/2" style={{ background: open.palette.main }} /><span className="w-1/2" style={{ background: open.palette.accent }} /></span>
                {L(open.palette)}
              </span>
            </p>
            <div>
              <p className="flex items-center gap-1.5 text-[15px] font-extrabold"><SparkleIcon size={18} weight="fill" className="text-[var(--qd-star)]" /> {ar ? "اللي تحتاجينه لهالفكرة" : "What you'll need"}</p>
              <ul className="mt-2 space-y-1.5">
                {lookChecklist(open, lang).map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[14.5px]"><CheckIcon size={16} weight="bold" className="mt-1 shrink-0 text-[var(--qd-primary)]" /> {x}</li>
                ))}
              </ul>
            </div>
            {lookPhotoFor(open) && (
              <figure className="relative overflow-hidden rounded-[18px]">
                <Photo src={lookPhotoFor(open)!} alt="" className="aspect-[4/3] w-full" />
                <figcaption className="absolute bottom-2 start-2 rounded-full bg-white/85 px-2.5 py-1 text-[11.5px] font-semibold text-[var(--qd-ink-soft)]">{ar ? "صورة إلهام قريبة بالذكاء الاصطناعي" : "A close AI inspiration photo"}</figcaption>
              </figure>
            )}
            {access.canEdit && (
              <button type="button" onClick={() => adopt(open)} className="h-12 w-full rounded-full bg-[var(--qd-primary)] text-[15px] font-bold text-white">
                {ar ? "اعتمدي هذي الفكرة" : "Adopt this idea"}
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
