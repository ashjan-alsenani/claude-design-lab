"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CardsIcon, DownloadSimpleIcon, ImagesIcon, PlusIcon, PrinterIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";
import type { CardDesign, CardTemplate, Memory } from "../model/types";
import { EntitySheet, type Draft, type FieldSpec } from "../ui/EntitySheet";
import { Button, Card, ChoiceCard, EmptyState, Field, PageHeader, Segmented, Toggle, cx, inputCls } from "../ui/kit";
import { useAddParam } from "./Lists";

export function MemoriesPage() {
  const { t, plan, dispatch, newId, date, api, access, today } = useQ();
  const [edit, setEdit] = useState<Partial<Memory> | null>(null);
  useAddParam(() => setEdit({ date: today }));
  const list = [...plan.memories].sort((a, b) => a.order - b.order);
  const fields: FieldSpec[] = [
    { key: "title", label: t.common.name, kind: "text", required: true },
    { key: "date", label: t.common.date, kind: "date" },
    { key: "text", label: t.memoriesT.text, kind: "textarea" },
    { key: "fileId", label: t.common.photo, kind: "file", board: "memories" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={t.memoriesT.title} sub={t.memoriesT.sub} icon={<ImagesIcon size={22} />} action={access.canEdit ? <Button onClick={() => setEdit({ date: today })}><PlusIcon size={18} /> {t.memoriesT.add}</Button> : undefined} />
      {list.length === 0 ? (
        <EmptyState icon={<ImagesIcon size={26} />} title={t.common.empty} sub={t.memoriesT.sub} />
      ) : (
        <ol className="relative space-y-5 before:absolute before:inset-y-2 before:start-[11px] before:w-0.5 before:bg-[var(--qd-tint)]">
          {list.map((m, i) => (
            <li key={m.id} className="relative ps-9">
              <span className="absolute start-0 top-5 size-6 rounded-full border-4 border-[var(--qd-bg)] bg-[var(--qd-accent)]" aria-hidden="true" />
              <Card className="overflow-hidden">
                {m.fileId && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={api.fileUrl(m.fileId)} alt="" className="max-h-80 w-full object-cover" loading="lazy" />
                )}
                <div className="flex items-start gap-2 p-4">
                  <button type="button" onClick={() => setEdit(m)} className="min-w-0 flex-1 text-start">
                    {m.date && <span className="block text-[12.5px] text-[var(--qd-muted)]">{date(m.date, "long")}</span>}
                    <span className="block text-[1.1rem] font-bold">{m.title}</span>
                    {m.text && <span className="mt-1 block whitespace-pre-line text-[14.5px] leading-relaxed text-[var(--qd-ink-soft)]">{m.text}</span>}
                  </button>
                  {access.canEdit && (
                    <div className="flex flex-col">
                      <button type="button" disabled={i === 0} onClick={() => dispatch({ t: "reorderMemory", id: m.id, dir: "up" })} aria-label={t.memoriesT.up} className="grid size-10 place-items-center rounded-full hover:bg-[var(--qd-tint-2)] disabled:opacity-30"><ArrowUpIcon size={16} /></button>
                      <button type="button" disabled={i === list.length - 1} onClick={() => dispatch({ t: "reorderMemory", id: m.id, dir: "down" })} aria-label={t.memoriesT.down} className="grid size-10 place-items-center rounded-full hover:bg-[var(--qd-tint-2)] disabled:opacity-30"><ArrowDownIcon size={16} /></button>
                    </div>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
      <EntitySheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? edit.title ?? "" : t.memoriesT.add} fields={fields} initial={(edit ?? {}) as Draft} onSave={(d) => dispatch({ t: "put", c: "memories", item: { ...d, id: edit?.id ?? newId("mm"), order: edit?.order ?? plan.memories.length } })} onDelete={edit?.id ? () => dispatch({ t: "del", c: "memories", id: edit.id! }) : undefined} />
    </div>
  );
}

// ---------- Cards ----------
const templates: CardTemplate[] = ["arrived", "thanks", "favor"];
export function CardsPage() {
  const { t, plan, dispatch, newId, lang, date, access } = useQ();
  const p = plan.profile!;
  const blank = (tpl: CardTemplate): CardDesign => ({ id: newId("cd"), template: tpl, title: t.cardsT.defaults[tpl], name: p.babyName, text: tpl === "invite" ? undefined : undefined, date: p.arrived?.date, tone: "theme", showDate: tpl !== "favor", showDetails: tpl === "invite", details: undefined });
  const [card, setCard] = useState<CardDesign>(() => plan.cards.find((c) => c.template !== "invite") ?? blank("arrived"));
  const set = (patch: Partial<CardDesign>) => setCard((c) => ({ ...c, ...patch }));
  const canvas = useRef<HTMLCanvasElement>(null);
  const saved = plan.cards.some((c) => c.id === card.id);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    let alive = true;
    void document.fonts.ready.then(() => alive && drawCard(c, card, { lang, theme: getComputedStyle(c), dateLabel: card.date ? date(card.date, "long") : "", brand: t.brand }));
    return () => {
      alive = false;
    };
  }, [card, lang, date, t.brand, p.theme]);

  const download = () => {
    const c = canvas.current;
    if (!c) return;
    c.toBlob((b) => {
      if (!b) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `${card.template}-${card.name ?? "card"}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, "image/png");
  };
  return (
    <div className="space-y-6">
      <PageHeader title={t.cardsT.title} sub={t.cardsT.sub} icon={<CardsIcon size={22} />} />
      <div className="qd-noprint grid grid-cols-2 gap-2 sm:grid-cols-4">
        {templates.map((tp) => (
          <ChoiceCard key={tp} selected={card.template === tp} onClick={() => setCard(plan.cards.find((c) => c.template === tp) ?? blank(tp))}>{t.cardsT.templates[tp]}</ChoiceCard>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="qd-card overflow-hidden rounded-[22px] p-3 print:border-0 print:p-0 print:shadow-none">
          <canvas ref={canvas} width={1080} height={1350} className="h-auto w-full rounded-[16px]" role="img" aria-label={`${card.title} ${card.name ?? ""}`} />
        </div>
        <Card className="qd-noprint space-y-4 p-4">
          <Field label={t.common.name} htmlFor="c-title"><input id="c-title" className={inputCls} value={card.title} maxLength={80} onChange={(e) => set({ title: e.target.value })} /></Field>
          <Field label={t.favorsT.baby} htmlFor="c-name"><input id="c-name" className={inputCls} value={card.name ?? ""} maxLength={60} onChange={(e) => set({ name: e.target.value || undefined })} /></Field>
          <Field label={t.memoriesT.text} htmlFor="c-text"><input id="c-text" className={inputCls} value={card.text ?? ""} maxLength={300} onChange={(e) => set({ text: e.target.value || undefined })} /></Field>
          <Field label={t.common.date} htmlFor="c-date"><input id="c-date" type="date" dir="ltr" className={`${inputCls} text-start`} value={card.date ?? ""} onChange={(e) => set({ date: e.target.value || undefined })} /></Field>
          <Toggle checked={card.showDate} onChange={(v) => set({ showDate: v })} label={t.cardsT.showDate} />
          <Toggle checked={card.showDetails} onChange={(v) => set({ showDetails: v })} label={t.cardsT.showDetails} />
          {card.showDetails && <Field label={t.cardsT.details} htmlFor="c-det"><input id="c-det" className={inputCls} value={card.details ?? ""} maxLength={200} onChange={(e) => set({ details: e.target.value || undefined })} /></Field>}
          <Segmented label={t.cardsT.tone} value={card.tone} onChange={(v) => set({ tone: v })} options={(["theme", "warm", "calm"] as const).map((x) => ({ value: x, label: t.cardsT.tones[x] }))} />
          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={download}><DownloadSimpleIcon size={18} /> {t.cardsT.download}</Button>
            <Button variant="secondary" onClick={() => window.print()}><PrinterIcon size={18} /> {t.common.print}</Button>
            {access.canEdit && <Button variant="ghost" onClick={() => dispatch({ t: "put", c: "cards", item: card })}>{saved ? t.common.save : `${t.common.save} ✓`}</Button>}
          </div>
          <p className={cx("text-[12px] text-[var(--qd-muted)]")}>{t.cardsT.privacy}</p>
        </Card>
      </div>
    </div>
  );
}

/** Draws a card on a canvas with the page's own fonts (correct Arabic shaping) and theme colours. No watermark. */
function drawCard(c: HTMLCanvasElement, card: CardDesign, o: { lang: "ar" | "en"; theme: CSSStyleDeclaration; dateLabel: string; brand: string }) {
  const ctx = c.getContext("2d");
  if (!ctx) return;
  const W = c.width, H = c.height;
  const v = (n: string, f: string) => o.theme.getPropertyValue(n).trim() || f;
  const palettes = {
    theme: { bg: v("--qd-tint-2", "#f1f8f6"), deco: v("--qd-tint", "#e3f2ef"), ink: "#3f3b52", accent: v("--qd-primary", "#2f7a71"), soft: v("--qd-accent", "#f2a57c") },
    warm: { bg: "#fdf3ea", deco: "#f9e1cf", ink: "#3b2a22", accent: "#b2643a", soft: "#e9b48f" },
    calm: { bg: "#f2f4f8", deco: "#e2e7f1", ink: "#1e2440", accent: "#4f5d8f", soft: "#a9b6d6" },
  }[card.tone];
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = palettes.bg;
  ctx.fillRect(0, 0, W, H);
  // soft decoration
  ctx.fillStyle = palettes.deco;
  ctx.beginPath(); ctx.arc(W * 0.85, H * 0.12, 210, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W * 0.1, H * 0.92, 260, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = palettes.soft;
  for (const [x, y, r] of [[0.18, 0.18, 10], [0.8, 0.32, 7], [0.25, 0.75, 8], [0.88, 0.82, 11], [0.5, 0.1, 6]] as const) { ctx.beginPath(); ctx.arc(W * x, H * y, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = palettes.accent; ctx.globalAlpha = 0.25; ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, W - 120, H - 120);
  ctx.globalAlpha = 1;
  ctx.direction = o.lang === "ar" ? "rtl" : "ltr";
  ctx.textAlign = "center";
  const font = (w: number, s: number) => `${w} ${s}px Rubik, system-ui, sans-serif`;
  const wrap = (text: string, y: number, size: number, weight: number, color: string, maxW = W - 220, lh = 1.3) => {
    ctx.font = font(weight, size); ctx.fillStyle = color;
    const words = text.split(/\s+/); const lines: string[] = []; let line = "";
    for (const w of words) { const test = line ? `${line} ${w}` : w; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
    if (line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, W / 2, y + i * size * lh));
    return y + lines.length * size * lh;
  };
  let y = 470;
  y = wrap(card.title, y, 64, 600, palettes.ink);
  if (card.name) y = wrap(card.name, y + 60, 150, 700, palettes.accent) + 10;
  if (card.text) y = wrap(card.text, y + 30, 44, 400, palettes.ink);
  if (card.showDate && o.dateLabel) y = wrap(o.dateLabel, y + 40, 40, 500, palettes.accent);
  if (card.showDetails && card.details) wrap(card.details, y + 30, 38, 400, palettes.ink);
  ctx.font = font(500, 26); ctx.fillStyle = palettes.ink; ctx.globalAlpha = 0.35;
  ctx.fillText("✦", W / 2, H - 110);
  ctx.globalAlpha = 1;
}
