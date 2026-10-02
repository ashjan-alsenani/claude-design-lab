"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/track";

/** Launch notification sign-up. Honest while email is not connected: nothing is stored. */
export function NotifyForm({ productId, d }: { productId: string; d: Pick<Dictionary, "newsletter" | "form" | "checkout"> }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <p role="status" className="mt-4 rounded-[var(--radius-md)] bg-primary-soft p-4 text-sm text-ink">
        {d.newsletter.notConnected}
      </p>
    );
  }
  return (
    <form
      noValidate
      className="mt-4 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(f.get("email") || ""))) return setError(d.form.invalidEmail);
        if (!f.get("consent")) return setError(d.form.required);
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
      <Button type="submit" className="w-full sm:w-auto">
        {d.checkout.notify}
      </Button>
    </form>
  );
}
