"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics/track";

// Newsletter sign-up: consent required. Email provider is NOT connected yet, so the
// form tells the truth and stores nothing (see OWNER_ACTIONS.md: email provider).
export function NewsletterForm({ d }: { d: Pick<Dictionary, "newsletter" | "form"> }) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(d.form.invalidEmail);
      return;
    }
    if (!form.get("consent")) {
      setError(d.form.required);
      return;
    }
    setError(null);
    track("newsletter_signup", { connected: false });
    setState("done");
  }

  if (state === "done") {
    return (
      <p role="status" className="rounded-[var(--radius-md)] bg-primary-soft p-4 text-sm text-ink">
        {d.newsletter.notConnected}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-labelledby="nl-title">
      <h2 id="nl-title" className="font-semibold text-ink">
        {d.newsletter.title}
      </h2>
      <p className="mt-1 text-sm text-muted">{d.newsletter.body}</p>
      <div className="mt-4 flex flex-col gap-2">
        <label htmlFor="nl-email" className="text-sm font-medium text-ink">
          {d.newsletter.email}
        </label>
        <div className="flex gap-2">
          <input
            id="nl-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!error}
            aria-describedby={error ? "nl-error" : undefined}
            className="h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-bg px-4 text-ink placeholder:text-muted focus:border-primary focus:outline-none"
          />
          <Button type="submit">{d.newsletter.submit}</Button>
        </div>
        <label className="mt-1 flex items-start gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="consent" className="mt-1 size-4 accent-[var(--oc-primary)]" required />
          <span>{d.newsletter.consent}</span>
        </label>
        {error && (
          <p id="nl-error" role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
