"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Button } from "@/components/ui/Button";
import { CONSENT_KEY, readConsent } from "@/lib/analytics/track";

const OPEN_EVENT = "oc:open-consent";

/** Non-blocking consent card. Appears after a short delay, never as a page-load popup wall. */
export function ConsentBanner({ d }: { d: Pick<Dictionary, "consent"> }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (readConsent() === null) setOpen(true);
    }, 1500);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(OPEN_EVENT, reopen);
    };
  }, []);

  const choose = (v: "analytics" | "essential") => {
    try {
      localStorage.setItem(CONSENT_KEY, v);
    } catch {}
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="region"
          aria-label={d.consent.title}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-[var(--radius-lg)] border border-line bg-surface-raised p-5 shadow-lift sm:inset-x-auto sm:end-5 sm:bottom-5"
        >
          <p className="font-semibold text-ink">{d.consent.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{d.consent.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => choose("analytics")}>
              {d.consent.accept}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => choose("essential")}>
              {d.consent.reject}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="self-start text-sm text-muted underline underline-offset-4 hover:text-ink" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      {label}
    </button>
  );
}
