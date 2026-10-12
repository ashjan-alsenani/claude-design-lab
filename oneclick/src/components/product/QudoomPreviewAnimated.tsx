"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Clicky } from "@/components/brand/Clicky";
import { LookArt, FavorArt } from "@/products/qudoom/ui/Illustrations";
import { looks } from "@/products/qudoom/model/looks";
import type { Locale } from "@/i18n/config";

/**
 * The «حكاية قدوم» product page preview: a moving picture of what's inside (not a demo). It plays by
 * itself through the dashboard, step by step, welcome looks and favor ideas, with sample content.
 * Pauses on hover; under reduced motion it shows one still frame with the dots to move by hand.
 */
const PINK = "#c7366b", NAVY = "#1f3d6b";

function Phone({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-[38px] border-[8px] border-[#e4dde8] bg-[#fff9f4] shadow-[0_30px_60px_-30px_rgba(90,85,112,.35)]">
      <div className="absolute -start-12 top-16 size-36 rounded-full bg-[#fff1cc]" />
      <div className="absolute -end-10 top-56 size-28 rounded-full" style={{ background: `color-mix(in oklab, ${color} 14%, #fff)` }} />
      <div className="relative h-full p-4">{children}</div>
    </div>
  );
}

const bar = (v: number, c: string) => (
  <div className="h-1.5 overflow-hidden rounded-full bg-black/5"><motion.div className="h-full rounded-full" style={{ background: c }} initial={{ width: 0 }} animate={{ width: `${v * 100}%` }} transition={{ duration: 1, delay: 0.3 }} /></div>
);

export function QudoomPreviewAnimated({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (reduce || pause) return;
    const id = setInterval(() => setI((n) => (n + 1) % 4), 3400);
    return () => clearInterval(id);
  }, [reduce, pause]);

  const slides = [
    {
      key: "dash", color: PINK, label: ar ? "لوحة الأم" : "Mum's dashboard",
      body: (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 rounded-[20px] bg-white p-3 shadow-sm">
            <motion.div animate={reduce ? undefined : { y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity }}><Clicky size={46} color="#ff9fb8" ink="#5a5570" accessory="girl" mood="sweet" /></motion.div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold" style={{ color: PINK }}>{ar ? "يا هلا أم سلمى" : "Hello, Salma's mum"}</p>
              <p className="text-[18px] font-extrabold text-[#3f3b52]"><span style={{ color: PINK }}>٣٥</span> {ar ? "يوم ونشوف سلمى" : "days to meet Salma"}</p>
            </div>
          </div>
          <div className="rounded-[18px] p-3 text-white" style={{ background: PINK }}>
            <p className="text-[10px] opacity-80">{ar ? "خطوة بخطوة · ٤ من ١٢" : "Step by step · 4 of 12"}</p>
            <p className="text-[13px] font-bold">{ar ? "اختاري التوزيعات واطلبيها بدري" : "Pick favors and order early"}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[[ar ? "التجهيز" : "Prep", 0.62, "#a9c1dc"], [ar ? "الشنطة" : "Bag", 0.4, "#e8a5b5"], [ar ? "الهدايا" : "Gifts", 0.3, "#efd28f"], [ar ? "التوزيعات" : "Favors", 0.5, "#bcd3b3"]].map(([l, v, c]) => (
              <div key={l as string} className="rounded-[16px] bg-white p-2.5 shadow-sm">
                <span className="mb-1.5 block size-6 rounded-[8px]" style={{ background: c as string }} />
                <p className="text-[11.5px] font-bold text-[#3f3b52]">{l as string}</p>
                <div className="mt-1.5">{bar(v as number, PINK)}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "steps", color: NAVY, label: ar ? "خطوة بخطوة" : "Step by step",
      body: (
        <div className="space-y-2">
          <div className="flex items-center gap-2"><Clicky size={40} color="#7ea6dc" ink="#5a5570" accessory="boy" mood="sweet" /><p className="text-[15px] font-extrabold text-[#3f3b52]">{ar ? "من وين أبدأ؟" : "Where do I start?"}</p></div>
          {(ar ? ["علّمي اللي عندك من أغراض البيبي", "جهزي الغرفة أو الركن", "اختاري التوزيعات", "اختاري شكل الاستقبال", "جهزي شنطة المستشفى"] : ["Tick the baby things you have", "Get the room ready", "Pick favors", "Choose the welcome look", "Pack the hospital bag"]).map((s, k) => (
            <motion.div key={s} initial={reduce ? false : { opacity: 0, x: ar ? 12 : -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 * k }} className="flex items-center gap-2 rounded-[14px] bg-white p-2 shadow-sm">
              <span className="grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: k < 2 ? NAVY : "#c9d3e6" }}>{k < 2 ? "✓" : k + 1}</span>
              <span className={`text-[11.5px] font-semibold ${k < 2 ? "text-[#8a86a8] line-through" : "text-[#3f3b52]"}`}>{s}</span>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      key: "looks", color: PINK, label: ar ? "٥٠٠ فكرة استقبال" : "500 welcome ideas",
      body: (
        <div className="space-y-2">
          <p className="text-[15px] font-extrabold text-[#3f3b52]">{ar ? "أشكال الاستقبال" : "Welcome looks"}</p>
          <div className="grid grid-cols-2 gap-2">
            {[looks[3], looks[120], looks[200], looks[270], looks[340], looks[460]].map((l, k) => (
              <motion.div key={l.id} initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * k }} className="overflow-hidden rounded-[14px] bg-white shadow-sm">
                <LookArt look={l} className="aspect-[16/10] w-full" />
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "favors", color: NAVY, label: ar ? "مئات أفكار التوزيعات" : "Hundreds of favor ideas",
      body: (
        <div className="space-y-2">
          <p className="text-[15px] font-extrabold text-[#3f3b52]">{ar ? "أفكار التوزيعات" : "Favor ideas"}</p>
          {(["sweets", "scents", "plants", "keepsakes"] as const).map((c, k) => (
            <motion.div key={c} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * k }} className="flex items-center gap-2 rounded-[14px] bg-white p-2 shadow-sm">
              <FavorArt cat={c} color={["#e8a5b5", "#c9b8e0", "#bcd3b3", "#efd28f"][k]} className="size-11 shrink-0" />
              <span className="min-w-0 flex-1 text-[11.5px] font-bold text-[#3f3b52]">{ar ? ["كوكيز باسم البيبي", "شمعة بعطر البودرة", "بذور «تكبر معنا»", "ميدالية بالاسم والتاريخ"][k] : ["Name cookies", "Powder-scent candle", "Grow-with-us seeds", "Name & date keychain"][k]}</span>
              <span className="grid size-6 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: NAVY }}>+</span>
            </motion.div>
          ))}
        </div>
      ),
    },
  ];
  const s = slides[i];

  return (
    <div id="preview" className="scroll-mt-24" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
      <Phone color={s.color}>
        <AnimatePresence mode="wait">
          <motion.div key={s.key} initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
            {s.body}
          </motion.div>
        </AnimatePresence>
      </Phone>
      <div className="mt-4 flex items-center justify-center gap-3">
        {slides.map((x, k) => (
          <button key={x.key} type="button" onClick={() => setI(k)} aria-label={x.label} aria-current={k === i} className={`h-2.5 rounded-full transition-all ${k === i ? "w-8 bg-[#5a5570]" : "w-2.5 bg-[#d9cfc4]"}`} />
        ))}
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-ink-soft">{s.label}</p>
      <p className="mt-1 text-center text-xs text-muted">{ar ? "صورة متحركة ببيانات توضيحية" : "Moving preview with sample content"}</p>
    </div>
  );
}
