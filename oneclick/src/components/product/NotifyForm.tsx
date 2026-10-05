"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/track";
import { subscribe } from "@/app/actions/subscribe";

/** "Tell me when it's available": stored only with explicit consent. */
export function NotifyForm({ productId, d, locale }: { productId: string; d: Pick<Dictionary, "newsletter" | "form" | "checkout">; locale: "ar" | "en" }) {
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <p role="status" className="mt-4 rounded-[var(--radius-md)] bg-primary-soft p-4 text-sm text-ink">
        {d.checkout.notifySuccess}
      </p>
    );
  }
  return (
    <form
      noValidate
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const email = String(f.get("email") || "");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(d.form.invalidEmail);
        if (!f.get("consent")) return setError(d.form.required);
        setError(null);
        setSending(true);
        const r = await subscribe({ email, consent: true, consentText: d.newsletter.consent, locale, productId });
        setSending(false);
        if (!r.ok) return setError(r.reason === "invalid" ? d.form.invalidEmail : d.form.tryAgain);
        track("notify_me", { product_id: productId });
        setDone(true);
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="notify-email" className="text-sm font-medium text-ink">
          {d.newsletter.email}
        </label>
        <input
          id="notify-email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!error}
          aria-describedby={error ? "notify-error" : undefined}
          className="h-12 rounded-[var(--radius-md)] border border-line-strong bg-bg px-4 text-ink focus:border-primary focus:outline-none"
        />
      </div>
      <label className="flex items-start gap-2 text-sm text-ink-soft">
        <input type="checkbox" name="consent" className="mt-1 size-4 accent-[var(--oc-primary)]" />
        {d.newsletter.consent}
      </label>
      {error && (
        <p id="notify-error" role="alert" className="text-sm text-error">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full sm:w-auto" disabled={sending}>
        {d.checkout.notify}
      </Button>
    </form>
  );
}
