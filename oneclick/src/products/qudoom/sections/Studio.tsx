"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpIcon, DownloadSimpleIcon, FloppyDiskIcon, PrinterIcon, TrashIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { inviteDesigns, inviteFonts, invitePalettes, inviteStyles, occasions, occasionText, type InviteDesign, type InviteFont, type InviteOccasion, type InviteStyle } from "../model/invites";
import type { CardDesign } from "../model/types";
import { drawInvite, INV_H, INV_W, loadInviteFonts, type InviteWords } from "../ui/InviteCanvas";
import { Filter, FilterBar } from "../ui/Filter";
import { BabyMascot } from "../ui/Mascot";
import { Button, Field, cx, inputCls } from "../ui/kit";

/**
 * «استوديو الدعوات»: 300 invitation designs. She picks the occasion, browses the designs (filter by
 * style and colours), taps one, edits every line and the font, then downloads it as an image, prints
 * it, or saves it to come back later. Everything is drawn on her device; nothing is sent anywhere.
 */
export function StudioPage() {
  const { lang, plan, dispatch, newId, access, say, num, date, timeLabel } = useQ();
  const ar = lang === "ar";
  const reduce = useReducedMotion();
  const p = plan.profile;
  const [occasion, setOccasion] = useState<InviteOccasion>("welcome");
  const [style, setStyle] = useState<InviteStyle | "all">("all");
  const [pal, setPal] = useState<string | "all">("all");
  const [shown, setShown] = useState(24);
  const [design, setDesign] = useState<InviteDesign | null>(null);
  const [font, setFont] = useState<InviteFont | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const defaults = (o: InviteOccasion) => occasionText[o][lang];
  const [w, setW] = useState({ opener: defaults("welcome").opener, title: defaults("welcome").title, name: p?.babyName ?? "", line: defaults("welcome").line, date: "", time: "", place: "", host: p?.motherName ? (ar ? `${p.motherName} وأسرتها` : `${p.motherName} and family`) : "", note: "" });
  const [ready, setReady] = useState(false);
  const editor = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let live = true;
    void loadInviteFonts().then(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);

  const list = useMemo(() => inviteDesigns.filter((d) => (style === "all" || d.style === style) && (pal === "all" || d.palette.id === pal)), [style, pal]);
  const words: InviteWords = {
    opener: w.opener,
    title: w.title,
    name: w.name,
    line: w.line,
    date: w.date ? date(w.date, "weekday") : undefined,
    time: w.time ? timeLabel(w.time) : undefined,
    place: w.place,
    host: w.host,
    note: w.note,
  };
  const sample: InviteWords = { opener: w.opener, title: w.title, name: w.name || (ar ? "سلمى" : "Salma"), line: w.line, date: words.date, place: w.place };

  useEffect(() => {
    if (big.current && design) drawInvite(big.current, design, words, { lang, font: font ?? undefined });
  });

  const pickOccasion = (o: InviteOccasion) => {
    setOccasion(o);
    const d = defaults(o);
    setW((x) => ({ ...x, opener: d.opener, title: d.title, line: d.line }));
  };
  const open = (d: InviteDesign) => {
    setDesign(d);
    setFont(null);
    requestAnimationFrame(() => editor.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };
  const set = (k: keyof typeof w) => (e: React.ChangeEvent<HTMLInputElement>) => setW((x) => ({ ...x, [k]: e.target.value }));

  const download = () => {
    if (!big.current || !design) return;
    big.current.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `${ar ? "دعوة" : "invitation"}-${w.name || design.id}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  };
  const save = () => {
    if (!design) return;
    const card: CardDesign = {
      id: cardId ?? newId("cd"),
      template: "invite",
      title: (w.title || (ar ? "دعوة" : "Invitation")).slice(0, 80),
      name: w.name.slice(0, 60) || undefined,
      text: w.line.slice(0, 300) || undefined,
      date: w.date || undefined,
      tone: "theme",
      showDate: !!w.date,
      showDetails: !!w.place,
      details: w.place.slice(0, 200) || undefined,
      design: design.id,
      font: font ?? undefined,
      occasion,
      opener: w.opener.slice(0, 120) || undefined,
      time: w.time.slice(0, 40) || undefined,
      host: w.host.slice(0, 120) || undefined,
      note: w.note.slice(0, 160) || undefined,
    };
    if (dispatch({ t: "put", c: "cards", item: card })) {
      setCardId(card.id);
      say(ar ? "انحفظت الدعوة" : "Invitation saved");
    }
  };
  const mine = plan.cards.filter((c) => c.template === "invite" && c.design);
  const reopen = (c: CardDesign) => {
    const d = inviteDesigns.find((x) => x.id === c.design);
    if (!d) return;
    setCardId(c.id);
    setOccasion(c.occasion ?? "welcome");
    setFont(c.font ?? null);
    setW({ opener: c.opener ?? "", title: c.title, name: c.name ?? "", line: c.text ?? "", date: c.date ?? "", time: c.time ?? "", place: c.details ?? "", host: c.host ?? "", note: c.note ?? "" });
    setDesign(d);
    requestAnimationFrame(() => editor.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  return (
    <div className="space-y-5">
      <header className="qd-noprint flex items-center gap-3">
        <BabyMascot size={58} theme={p?.theme} mood="celebrate" />
        <div className="min-w-0">
          <h1 className="text-[1.6rem] font-extrabold leading-tight">{ar ? "استوديو الدعوات" : "Invitation studio"}</h1>
          <p className="text-[14px] text-[var(--qd-muted)]">{ar ? `${num(inviteDesigns.length)} تصميم. اختاري، عدّلي الكلام، وحمّليها صورة أو اطبعيها.` : `${num(inviteDesigns.length)} designs. Pick one, edit the words, then download or print.`}</p>
        </div>
      </header>

      <div role="group" aria-label={ar ? "المناسبة" : "Occasion"} className="qd-noprint grid grid-cols-2 gap-2 sm:grid-cols-4">
        {occasions.map((o) => (
          <button key={o.id} type="button" aria-pressed={occasion === o.id} onClick={() => pickOccasion(o.id)} className={cx("h-12 rounded-[16px] border-2 text-[14px] font-bold transition-colors", occasion === o.id ? "border-[var(--qd-primary)] bg-[var(--qd-tint)] text-[var(--qd-primary-deep)]" : "border-transparent bg-[var(--qd-paper)] text-[var(--qd-ink-soft)]")}>
            {ar ? o.ar : o.en}
          </button>
        ))}
      </div>

      {mine.length > 0 && (
        <section className="qd-noprint space-y-2">
          <h2 className="text-[15px] font-extrabold">{ar ? "دعواتك المحفوظة" : "Your saved invitations"}</h2>
          <ul className="qd-scroll-x -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {mine.map((c) => {
              const d = inviteDesigns.find((x) => x.id === c.design);
              return d ? (
                <li key={c.id} className="relative w-28 shrink-0">
                  <button type="button" onClick={() => reopen(c)} className="block w-full overflow-hidden rounded-[14px] ring-2 ring-transparent hover:ring-[var(--qd-primary)]">
                    <Thumb design={d} words={{ opener: c.opener, title: c.title, name: c.name, line: c.text }} lang={lang} font={c.font} ready={ready} />
                  </button>
                  {access.canEdit && (
                    <button type="button" onClick={() => dispatch({ t: "del", c: "cards", id: c.id })} aria-label={ar ? "احذفي الدعوة" : "Delete invitation"} className="absolute end-1 top-1 grid size-8 place-items-center rounded-full bg-white/90 text-[var(--qd-alert)] shadow">
                      <TrashIcon size={15} />
                    </button>
                  )}
                </li>
              ) : null;
            })}
          </ul>
        </section>
      )}

      {design && (
        <section ref={editor} className="scroll-mt-4 space-y-4 rounded-[24px] bg-[var(--qd-paper)] p-3 sm:p-4 print:bg-transparent print:p-0" aria-label={ar ? "تعديل الدعوة" : "Edit the invitation"}>
          <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
            <canvas ref={big} width={INV_W} height={INV_H} className="h-auto w-full rounded-[16px] shadow-[0_18px_40px_-24px_rgba(90,85,112,.6)]" role="img" aria-label={[w.title, w.name].filter(Boolean).join(" ")} />
            <div className="qd-noprint space-y-3">
              <p className="text-[13px] font-semibold text-[var(--qd-muted)]">{ar ? design.ar : design.en}</p>
              <Field label={ar ? "سطر البداية" : "Opening line"} htmlFor="iv-op"><input id="iv-op" className={inputCls} value={w.opener} maxLength={120} onChange={set("opener")} /></Field>
              <Field label={ar ? "العنوان" : "Title"} htmlFor="iv-ti"><input id="iv-ti" className={inputCls} value={w.title} maxLength={80} onChange={set("title")} /></Field>
              <Field label={ar ? "اسم البيبي" : "Baby's name"} htmlFor="iv-nm"><input id="iv-nm" className={inputCls} value={w.name} maxLength={60} onChange={set("name")} /></Field>
              <Field label={ar ? "الجملة" : "Message"} htmlFor="iv-ln"><input id="iv-ln" className={inputCls} value={w.line} maxLength={300} onChange={set("line")} /></Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label={ar ? "التاريخ" : "Date"} htmlFor="iv-dt"><input id="iv-dt" type="date" dir="ltr" className={`${inputCls} text-start`} value={w.date} onChange={set("date")} /></Field>
                <Field label={ar ? "الوقت" : "Time"} htmlFor="iv-tm"><input id="iv-tm" type="time" dir="ltr" className={`${inputCls} text-start`} value={w.time} onChange={set("time")} /></Field>
              </div>
              <Field label={ar ? "المكان" : "Place"} htmlFor="iv-pl"><input id="iv-pl" className={inputCls} value={w.place} maxLength={200} onChange={set("place")} placeholder={ar ? "مثال: بيت الجد، حي الخوض" : "e.g. Grandpa's house"} /></Field>
              <Field label={ar ? "الداعي" : "From"} htmlFor="iv-hs"><input id="iv-hs" className={inputCls} value={w.host} maxLength={120} onChange={set("host")} /></Field>
              <Field label={ar ? "ملاحظة صغيرة" : "Small note"} htmlFor="iv-nt"><input id="iv-nt" className={inputCls} value={w.note} maxLength={160} onChange={set("note")} placeholder={ar ? "مثال: نعتذر عن استقبال الأطفال" : "e.g. Adults only, please"} /></Field>
              <Field label={ar ? "الخط" : "Font"} htmlFor="iv-ft">
                <select id="iv-ft" className={inputCls} value={font ?? design.font} onChange={(e) => setFont(e.target.value as InviteFont)}>
                  {inviteFonts.map((f) => <option key={f.id} value={f.id}>{ar ? f.ar : f.en}</option>)}
                </select>
              </Field>
              <div>
                <p className="mb-1.5 text-[13px] font-semibold">{ar ? "نفس التصميم بألوان ثانية" : "Same design, other colours"}</p>
                <div className="flex flex-wrap gap-2">
                  {inviteDesigns.filter((x) => x.layout === design.layout).map((x) => (
                    <button key={x.id} type="button" aria-pressed={x.id === design.id} title={ar ? x.palette.ar : x.palette.en} aria-label={ar ? x.palette.ar : x.palette.en} onClick={() => setDesign(x)} className={cx("flex size-9 overflow-hidden rounded-full border-2", x.id === design.id ? "border-[var(--qd-ink)]" : "border-white")}>
                      <span className="w-1/2" style={{ background: x.palette.bg2 }} /><span className="w-1/2" style={{ background: x.palette.accent }} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button onClick={download}><DownloadSimpleIcon size={18} /> {ar ? "حمّليها صورة" : "Download"}</Button>
                <Button variant="secondary" onClick={() => window.print()}><PrinterIcon size={18} /> {ar ? "اطبعي" : "Print"}</Button>
                {access.canEdit && <Button variant="ghost" onClick={save}><FloppyDiskIcon size={18} /> {ar ? "احفظي" : "Save"}</Button>}
              </div>
              <p className="text-[12px] text-[var(--qd-muted)]">{ar ? "الصورة تنرسم في جهازك ولا تنرسل لأي مكان. المشاركة قرارك." : "The image is drawn on your device and sent nowhere. Sharing is your choice."}</p>
            </div>
          </div>
        </section>
      )}

      <section className="qd-noprint space-y-3">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-[15px] font-extrabold">{ar ? "اختاري تصميم" : "Pick a design"}</h2>
          <span className="text-[13px] font-semibold text-[var(--qd-muted)]">{ar ? `${num(list.length)} تصميم` : `${num(list.length)} designs`}</span>
        </div>
        <FilterBar active={style !== "all" || pal !== "all"} onClear={() => (setStyle("all"), setPal("all"), setShown(24))} clearLabel={ar ? "مسح" : "Clear"}>
          <Filter label={ar ? "الطابع" : "Style"} all={ar ? "كل الطوابع" : "All styles"} value={style} onChange={(v) => (setStyle(v), setShown(24))} options={inviteStyles.map((s) => ({ value: s.id, label: ar ? s.ar : s.en, count: inviteDesigns.filter((d) => d.style === s.id).length }))} />
          <Filter label={ar ? "الألوان" : "Colours"} all={ar ? "كل الألوان" : "All colours"} value={pal} onChange={(v) => (setPal(v), setShown(24))} options={invitePalettes.map((x) => ({ value: x.id, label: ar ? x.ar : x.en, count: inviteDesigns.filter((d) => d.palette.id === x.id).length }))} />
        </FilterBar>
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {list.slice(0, shown).map((d) => (
            <li key={d.id}>
              <motion.button type="button" whileTap={reduce ? undefined : { scale: 0.96 }} onClick={() => open(d)} aria-label={ar ? d.ar : d.en} className={cx("block w-full overflow-hidden rounded-[14px] ring-2 transition-shadow", design?.id === d.id ? "ring-[var(--qd-primary)]" : "ring-transparent hover:ring-[var(--qd-line)]")}>
                <Thumb design={d} words={sample} lang={lang} ready={ready} />
              </motion.button>
            </li>
          ))}
        </ul>
        {list.length > shown && (
          <button type="button" onClick={() => setShown((n) => n + 24)} className="mx-auto block h-11 rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] px-6 text-[14px] font-semibold">
            {ar ? `تصاميم أكثر (${num(list.length - shown)})` : `More designs (${num(list.length - shown)})`}
          </button>
        )}
        {design && (
          <button type="button" onClick={() => editor.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })} className="mx-auto flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-[var(--qd-primary)]">
            <ArrowUpIcon size={15} /> {ar ? "رجوع للتعديل" : "Back to editing"}
          </button>
        )}
      </section>
    </div>
  );
}

/** A small preview, drawn only when it scrolls into view. */
function Thumb({ design, words, lang, font, ready }: { design: InviteDesign; words: InviteWords; lang: "ar" | "en"; font?: InviteFont; ready: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const key = `${design.id}|${font}|${words.opener}|${words.title}|${words.name}|${words.line}|${ready}`;
  useEffect(() => {
    if (seen && ref.current) drawInvite(ref.current, design, words, { lang, font, scale: 0.25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, key]);
  return <canvas ref={ref} width={INV_W / 4} height={INV_H / 4} className="block aspect-[4/5] h-auto w-full bg-[var(--qd-tint-2)]" aria-hidden="true" />;
}
