"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { DemoId, Hue } from "@/content/types";
import type { Locale } from "@/i18n/config";
import { DemoById } from "@/components/demos/DemoById";
import { hueVar, inkTint } from "@/lib/hues";

export type ShowcaseItem = {
  slug: string;
  name: string;
  tagline: string;
  chaos: string;
  result: string;
  demo: DemoId;
  hue: Hue;
};

export function StoryShowcase({
  items,
  locale,
  labels,
}: {
  items: ShowcaseItem[];
  locale: Locale;
  labels: { before: string; after: string; view: string; demoNote: string };
}) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const item = items[active];
  const hue = hueVar(item.hue);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
      <div className="min-w-0">
        <div role="tablist" aria-label="One Click" className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          {items.map((it, i) => (
            <button
              key={it.slug}
              role="tab"
              id={`story-tab-${it.slug}`}
              aria-selected={active === i}
              aria-controls="story-panel"
              onClick={() => setActive(i)}
              className="shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium transition-colors"
              style={
                active === i
                  ? { borderColor: hueVar(it.hue), color: inkTint(hueVar(it.hue)), background: `color-mix(in oklab, ${hueVar(it.hue)} 10%, var(--oc-surface))` }
                  : { borderColor: "var(--oc-line)", color: "var(--oc-ink-soft)" }
              }
            >
              {it.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={item.slug}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <ol className="relative space-y-6 border-s-2 border-dashed border-line-strong ps-6">
              <li>
                <span className="absolute -start-[7px] mt-1.5 size-3 rounded-full bg-line-strong" aria-hidden="true" />
                <p className="text-sm font-medium text-muted">{labels.before}</p>
                <p className="mt-1 text-lg text-ink-soft line-through decoration-error/50 decoration-2">{item.chaos}</p>
              </li>
              <li>
                <span className="absolute -start-[7px] mt-1.5 size-3 rounded-full" style={{ background: hue }} aria-hidden="true" />
                <p className="text-sm font-medium" style={{ color: inkTint(hue) }}>
                  {item.name}
                </p>
                <p className="mt-1 text-lg text-ink">{item.tagline}</p>
              </li>
              <li>
                <span className="absolute -start-[7px] mt-1.5 size-3 rounded-full bg-primary" aria-hidden="true" />
                <p className="text-sm font-medium text-muted">{labels.after}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{item.result}</p>
              </li>
            </ol>
            <Link href={`/${locale}/products/${item.slug}`} className="mt-8 inline-flex items-center gap-2 font-medium text-primary hover:underline underline-offset-4">
              {labels.view}
              <ArrowRightIcon size={16} className="flip-rtl" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div id="story-panel" className="min-w-0" role="tabpanel" aria-labelledby={`story-tab-${item.slug}`}>
        <div className="relative">
          <div aria-hidden="true" className="absolute -inset-4 rounded-[36px] sm:-inset-6" style={{ background: `color-mix(in oklab, ${hue} 9%, transparent)` }} />
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.slug}
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DemoById id={item.demo} locale={locale} hue={hue} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted">{labels.demoNote}</p>
      </div>
    </div>
  );
}
