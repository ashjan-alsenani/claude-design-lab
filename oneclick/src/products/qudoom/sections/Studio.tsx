"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpIcon, DownloadSimpleIcon, FloppyDiskIcon, PrinterIcon, TrashIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import { PageHeader } from "../ui/kit";
import { designById, genderize, inviteDesigns, materials, occasions, occasionText, palettes, textSets, themes, type InviteDesign, type InviteOccasion, type InviteTheme, type TextSet } from "../model/invites";
import { fontById, fontFamily, fontGroups, inviteBodyFonts, inviteFonts, loadFont } from "../model/inviteFonts";
import type { Material } from "../ui/InviteArt";
import type { CardDesign } from "../model/types";
import { drawInvite, INV_H, INV_W, type InviteWords } from "../ui/InviteCanvas";
import { Filter, FilterBar } from "../ui/Filter";
import { Button, Field, cx, inputCls } from "../ui/kit";

/** A saved card keeps its design and colourway as "design~palette". */
const encode = (d: InviteDesign) => `${d.id}~${d.palette.id}`.slice(0, 60);
function decode(v?: string): InviteDesign | undefined {
  if (!v) return undefined;
  const [id, pid] = v.split("~");
  const d = designById(id) ?? inviteDesigns[[...v].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % inviteDesigns.length];
  const p = pid ? palettes[d.material].find((x) => x.id === pid) : undefined;
  return p ? { ...d, palette: p } : d;
}

/**
 * «استوديو الدعوات»: 300 story-size invitation designs, each its own idea (a motif, a layout and a
 * material: knitted wool, felt, cut paper, watercolour, fine line or gold on dark). She picks the
 * occasion, browses, taps a design, edits every line, picks from 44 Arabic fonts and the colours,
 * then downloads it, prints it or saves it. Everything is drawn on her device; nothing is sent.
 */
export function StudioPage() {
  const { lang, plan, dispatch, newId, access, say, num, date, timeLabel } = useQ();
  const ar = lang === "ar";
  const reduce = useReducedMotion();
  const p = plan.profile;
  const girl = p?.babyGender === "girl";
  const [occasion, setOccasion] = useState<InviteOccasion>("welcome");
  const [mat, setMat] = useState<Material | "all">("all");
  const [theme, setTheme] = useState<InviteTheme | "all">("all");
  const [shown, setShown] = useState(24);
  const [design, setDesign] = useState<InviteDesign | null>(null);
  const [nameFont, setNameFont] = useState<string | null>(null);
  const [bodyFont, setBodyFont] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [edited, setEdited] = useState(false);
  const host = p?.motherName ? (ar ? `${p.motherName} وأسرتها` : `${p.motherName} and family`) : "";
  const [w, setW] = useState({ opener: "", title: "", name: p?.babyName ?? "", line: "", date: "", time: "", place: "", host, note: "" });
  const editor = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLCanvasElement>(null);

  /** The design's own words for this occasion, in the baby's gender. */
  const wordsFor = (d: InviteDesign, o: InviteOccasion): TextSet => {
    const t = o === "welcome" ? textSets[d.text][lang] : occasionText[o][lang];
    return { opener: genderize(t.opener, girl), title: genderize(t.title, girl), line: genderize(t.line, girl) };
  };
  const sampleName = p?.babyName || (ar ? (girl ? "سلمى" : "يوسف") : girl ? "Salma" : "Yousef");

  const list = useMemo(() => inviteDesigns.filter((d) => (mat === "all" || d.material === mat) && (theme === "all" || d.theme === theme)), [mat, theme]);
  const words: InviteWords = {
    opener: w.opener, title: w.title, name: w.name, line: w.line,
    date: w.date ? date(w.date, "weekday") : undefined, time: w.time ? timeLabel(w.time) : undefined,
    place: w.place, host: w.host, note: w.note,
  };
  const fonts = { name: nameFont ?? undefined, body: bodyFont ?? undefined };

  useEffect(() => {
    if (big.current && design) void drawInvite(big.current, design, words, { lang, fonts });
  });

  const pickOccasion = (o: InviteOccasion) => {
    setOccasion(o);
    if (design) setW((x) => ({ ...x, ...wordsFor(design, o) }));
    setEdited(false);
  };
  const open = (d: InviteDesign) => {
    setDesign(d);
    setNameFont(null);
    setBodyFont(null);
    if (!edited) setW((x) => ({ ...x, ...wordsFor(d, occasion) }));
    requestAnimationFrame(() => editor.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };
  const set = (k: keyof typeof w) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setW((x) => ({ ...x, [k]: e.target.value }));
    if (k === "opener" || k === "title" || k === "line") setEdited(true);
  };

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
      title: (w.title || w.name || (ar ? "دعوة" : "Invitation")).slice(0, 80),
      name: w.name.slice(0, 60) || undefined,
      text: w.line.slice(0, 300) || undefined,
      date: w.date || undefined,
      tone: "theme",
      showDate: !!w.date,
      showDetails: !!w.place,
      details: w.place.slice(0, 200) || undefined,
      design: encode(design),
      font: nameFont ?? undefined,
      bodyFont: bodyFont ?? undefined,
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
    const d = decode(c.design);
    if (!d) return;
    setCardId(c.id);
    setOccasion(c.occasion ?? "welcome");
    setNameFont(c.font && fontById(c.font) ? c.font : null);
    setBodyFont(c.bodyFont && fontById(c.bodyFont) ? c.bodyFont : null);
    setW({ opener: c.opener ?? "", title: c.title === c.name ? "" : c.title, name: c.name ?? "", line: c.text ?? "", date: c.date ?? "", time: c.time ?? "", place: c.details ?? "", host: c.host ?? "", note: c.note ?? "" });
    setEdited(true);
    setDesign(d);
    requestAnimationFrame(() => editor.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  return (
    <div className="space-y-5">
      <div className="qd-noprint"><PageHeader title={ar ? "استوديو الدعوات" : "Invitation studio"} sub={ar ? `${num(inviteDesigns.length)} تصميم بمقاس الستوري و${num(inviteFonts.length)} خط عربي. اختاري، عدّلي الكلام، وحمّليها صورة أو اطبعيها.` : `${num(inviteDesigns.length)} story-size designs and ${num(inviteFonts.length)} Arabic fonts. Pick one, edit the words, then download or print.`} /></div>

      <div role="group" aria-label={ar ? "المناسبة" : "Occasion"} className="qd-noprint grid grid-cols-2 gap-2 sm:grid-cols-4">
        {occasions.map((o) => (
          <button key={o.id} type="button" aria-pressed={occasion === o.id} onClick={() => pickOccasion(o.id)} className={cx("h-12 rounded-[16px] border-2 text-[14px] font-bold transition-colors", occasion === o.id ? "border-[var(--qd-primary)] bg-[var(--qd-tint)] text-[var(--qd-primary-deep)]" : "border-[var(--qd-line)] bg-[var(--qd-paper)] text-[var(--qd-ink-soft)]")}>
            {ar ? o.ar : o.en}
          </button>
        ))}
      </div>

      {mine.length > 0 && (
        <section className="qd-noprint space-y-2">
          <h2 className="text-[15px] font-extrabold">{ar ? "دعواتك المحفوظة" : "Your saved invitations"}</h2>
          <ul className="qd-scroll-x -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {mine.map((c) => {
              const d = decode(c.design);
              return d ? (
                <li key={c.id} className="relative w-24 shrink-0">
                  <button type="button" onClick={() => reopen(c)} className="block w-full overflow-hidden rounded-[14px] ring-2 ring-transparent hover:ring-[var(--qd-primary)]">
                    <Thumb design={d} words={{ opener: c.opener, title: c.title === c.name ? "" : c.title, name: c.name, line: c.text }} lang={lang} fonts={{ name: c.font, body: c.bodyFont }} />
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
        <section ref={editor} className="qd-card scroll-mt-4 space-y-4 rounded-[24px] p-3 sm:p-5 print:border-0 print:bg-transparent print:p-0 print:shadow-none" aria-label={ar ? "تعديل الدعوة" : "Edit the invitation"}>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,26rem)_1fr]">
            <canvas ref={big} width={INV_W} height={INV_H} className="mx-auto h-auto w-full max-w-[26rem] rounded-[18px] shadow-[0_18px_40px_-24px_rgba(90,85,112,.6)] print:max-w-none" role="img" aria-label={[w.title, w.name].filter(Boolean).join(" ")} />
            <div className="qd-noprint min-w-0 space-y-3">
              <p className="text-[13px] font-semibold text-[var(--qd-muted)]">{ar ? design.ar : design.en}</p>
              <Field label={ar ? "اسم البيبي" : "Baby's name"} htmlFor="iv-nm"><input id="iv-nm" className={inputCls} value={w.name} maxLength={60} onChange={set("name")} /></Field>
              <FontPicker label={ar ? "خط الاسم والعنوان" : "Name & title font"} sample={w.name || sampleName} value={nameFont ?? design.font} onChange={setNameFont} lang={lang} />
              <Field label={ar ? "سطر البداية" : "Opening line"} htmlFor="iv-op"><textarea id="iv-op" rows={2} className={cx(inputCls, "h-auto py-2.5")} value={w.opener} maxLength={120} onChange={set("opener")} /></Field>
              <Field label={ar ? "العنوان" : "Title"} htmlFor="iv-ti"><input id="iv-ti" className={inputCls} value={w.title} maxLength={80} onChange={set("title")} /></Field>
              <Field label={ar ? "الدعاء أو الجملة" : "Message"} htmlFor="iv-ln"><textarea id="iv-ln" rows={2} className={cx(inputCls, "h-auto py-2.5")} value={w.line} maxLength={300} onChange={set("line")} /></Field>
              <Field label={ar ? "خط الكلام" : "Text font"} htmlFor="iv-bf">
                <select id="iv-bf" className={inputCls} value={bodyFont ?? design.body} onChange={(e) => setBodyFont(e.target.value)}>
                  {inviteBodyFonts.map((f) => <option key={f.id} value={f.id}>{ar ? f.ar : f.en}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label={ar ? "التاريخ" : "Date"} htmlFor="iv-dt"><input id="iv-dt" type="date" dir="ltr" className={`${inputCls} text-start`} value={w.date} onChange={set("date")} /></Field>
                <Field label={ar ? "الوقت" : "Time"} htmlFor="iv-tm"><input id="iv-tm" type="time" dir="ltr" className={`${inputCls} text-start`} value={w.time} onChange={set("time")} /></Field>
              </div>
              <Field label={ar ? "المكان" : "Place"} htmlFor="iv-pl"><input id="iv-pl" className={inputCls} value={w.place} maxLength={200} onChange={set("place")} placeholder={ar ? "مثال: بيت الجد، حي الخوض" : "e.g. Grandpa's house"} /></Field>
              <Field label={ar ? "الداعي" : "From"} htmlFor="iv-hs"><input id="iv-hs" className={inputCls} value={w.host} maxLength={120} onChange={set("host")} /></Field>
              <Field label={ar ? "ملاحظة صغيرة" : "Small note"} htmlFor="iv-nt"><input id="iv-nt" className={inputCls} value={w.note} maxLength={160} onChange={set("note")} placeholder={ar ? "مثال: نعتذر عن استقبال الأطفال" : "e.g. Adults only, please"} /></Field>
              <div>
                <p className="mb-1.5 text-[13px] font-semibold">{ar ? "نفس التصميم بألوان ثانية" : "Same design, other colours"}</p>
                <div className="flex flex-wrap gap-2">
                  {palettes[design.material].map((x) => (
                    <button key={x.id} type="button" aria-pressed={x.id === design.palette.id} title={ar ? x.ar : x.en} aria-label={ar ? x.ar : x.en} onClick={() => setDesign({ ...design, palette: x })} className={cx("flex size-9 overflow-hidden rounded-full border-2", x.id === design.palette.id ? "border-[var(--qd-ink)]" : "border-white shadow-sm")}>
                      <span className="w-1/2" style={{ background: x.bg }} /><span className="w-1/2" style={{ background: x.night ? x.main : x.name }} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button onClick={download}><DownloadSimpleIcon size={18} /> {ar ? "حمّليها صورة" : "Download"}</Button>
                <Button variant="secondary" onClick={() => window.print()}><PrinterIcon size={18} /> {ar ? "اطبعي" : "Print"}</Button>
                {access.canEdit && <Button variant="ghost" onClick={save}><FloppyDiskIcon size={18} /> {ar ? "احفظي" : "Save"}</Button>}
              </div>
              <p className="text-[12px] text-[var(--qd-muted)]">{ar ? "مقاس ستوري ١٠٨٠×١٩٢٠. الصورة تنرسم في جهازك ولا تنرسل لأي مكان. المشاركة قرارك." : "Story size 1080×1920. Drawn on your device and sent nowhere. Sharing is your choice."}</p>
            </div>
          </div>
        </section>
      )}

      <section className="qd-noprint space-y-3">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-[15px] font-extrabold">{ar ? "اختاري تصميم" : "Pick a design"}</h2>
          <span className="text-[13px] font-semibold text-[var(--qd-muted)]">{ar ? `${num(list.length)} تصميم` : `${num(list.length)} designs`}</span>
        </div>
        <FilterBar active={mat !== "all" || theme !== "all"} onClear={() => (setMat("all"), setTheme("all"), setShown(24))} clearLabel={ar ? "مسح" : "Clear"}>
          <Filter label={ar ? "الخامة" : "Material"} all={ar ? "كل الخامات" : "All materials"} value={mat} onChange={(v) => (setMat(v), setShown(24))} options={materials.map((m) => ({ value: m.id, label: ar ? m.ar : m.en, count: inviteDesigns.filter((d) => d.material === m.id).length }))} />
          <Filter label={ar ? "الفكرة" : "Theme"} all={ar ? "كل الأفكار" : "All themes"} value={theme} onChange={(v) => (setTheme(v), setShown(24))} options={themes.map((t) => ({ value: t.id, label: ar ? t.ar : t.en, count: inviteDesigns.filter((d) => d.theme === t.id).length }))} />
        </FilterBar>
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
          {list.slice(0, shown).map((d) => {
            const t = wordsFor(d, occasion);
            return (
              <li key={d.id}>
                <motion.button type="button" whileTap={reduce ? undefined : { scale: 0.96 }} onClick={() => open(d)} aria-label={ar ? d.ar : d.en} className={cx("block w-full overflow-hidden rounded-[14px] ring-2 transition-shadow", design?.id === d.id ? "ring-[var(--qd-primary)]" : "ring-transparent hover:ring-[var(--qd-line)]")}>
                  <Thumb design={d} words={{ ...t, name: w.name || sampleName }} lang={lang} />
                </motion.button>
              </li>
            );
          })}
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

/** Every display font, each showing the baby's name in itself; fonts load as they scroll into view. */
function FontPicker({ label, sample, value, onChange, lang }: { label: string; sample: string; value: string; onChange: (id: string) => void; lang: "ar" | "en" }) {
  const ar = lang === "ar";
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-[13px] font-semibold">{label}</legend>
      <div className="qd-scroll-x -mx-1 flex max-h-[15.5rem] flex-wrap gap-2 overflow-y-auto p-1">
        {fontGroups.map((g) => {
          const fs = inviteFonts.filter((f) => f.group === g.id);
          return (
            <div key={g.id} className="w-full">
              <p className="mb-1 text-[11.5px] font-bold text-[var(--qd-muted)]">{ar ? g.ar : g.en}</p>
              <div className="flex flex-wrap gap-1.5">
                {fs.map((f) => <FontChip key={f.id} id={f.id} title={ar ? f.ar : f.en} sample={sample} on={value === f.id} onPick={() => onChange(f.id)} />)}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
function FontChip({ id, title, sample, on, onPick }: { id: string; title: string; sample: string; on: boolean; onPick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (void loadFont(id), io.disconnect()), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, [id]);
  return (
    <button ref={ref} type="button" aria-pressed={on} title={title} aria-label={title} onClick={onPick} className={cx("flex h-12 min-w-[5.5rem] items-center justify-center rounded-[12px] border-2 px-3 text-[22px] leading-none", on ? "border-[var(--qd-primary)] bg-[var(--qd-tint)]" : "border-[var(--qd-line)] bg-white")} style={{ fontFamily: fontFamily(id) }}>
      {sample.slice(0, 12)}
    </button>
  );
}

/** A small preview, drawn only when it scrolls into view. */
function Thumb({ design, words, lang, fonts }: { design: InviteDesign; words: InviteWords; lang: "ar" | "en"; fonts?: { name?: string; body?: string } }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const key = `${design.id}|${design.palette.id}|${fonts?.name}|${fonts?.body}|${words.opener}|${words.title}|${words.name}|${words.line}`;
  useEffect(() => {
    if (seen && ref.current) void drawInvite(ref.current, design, words, { lang, fonts, scale: 0.25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, key]);
  return <canvas ref={ref} width={INV_W / 4} height={INV_H / 4} className="block aspect-[9/16] h-auto w-full" style={{ background: design.palette.bg }} aria-hidden="true" />;
}
