"use client";

import { startTransition, useActionState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { submitContact, type ContactState } from "@/app/[locale]/contact/actions";
import { Button } from "@/components/ui/Button";
import { Field, describedBy, inputClass, textareaClass } from "@/components/ui/Field";

export function ContactForm({ d, locale, defaultTopic, defaultReference }: { d: Pick<Dictionary, "contact" | "custom" | "form">; locale: Locale; defaultTopic?: string; defaultReference?: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { status: "idle" });
  const errors = state.status === "invalid" ? state.errors : {};
  const msg = (k?: string) => (k ? (d.form as Record<string, string>)[k] ?? d.form.required : undefined);
  const c = d.contact;

  if (state.status === "ok") {
    return (
      <p role="status" className="rounded-[var(--radius-lg)] bg-primary-soft p-6 text-lg text-ink">
        {c.success.replace("{ref}", state.reference)}
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-6 rounded-[var(--radius-xl)] border border-line bg-surface p-5 sm:p-8"
    >
      <input type="hidden" name="locale" value={locale} />
      <div aria-hidden="true" className="absolute -start-[9999px] h-0 overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {(state.status === "error" || state.status === "rate_limited") && (
        <p role="alert" className="rounded-[var(--radius-md)] bg-error/10 p-4 text-sm text-error">
          {state.status === "rate_limited" ? d.custom.rateLimited : d.custom.error}
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="topic" label={c.topic}>
          <select id="topic" name="topic" defaultValue={defaultTopic ?? "support"} className={inputClass}>
            {Object.entries(c.topics).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field id="reference" label={c.reference}>
          <input id="reference" name="reference" defaultValue={defaultReference} maxLength={80} className={inputClass} />
        </Field>
        <Field id="cname" label={d.custom.name} error={msg(errors.name)}>
          <input id="cname" name="name" autoComplete="name" className={inputClass} aria-invalid={!!errors.name} aria-describedby={describedBy("cname", undefined, errors.name)} />
        </Field>
        <Field id="cemail" label={d.custom.email} error={msg(errors.email)}>
          <input id="cemail" name="email" type="email" dir="ltr" autoComplete="email" className={inputClass} aria-invalid={!!errors.email} aria-describedby={describedBy("cemail", undefined, errors.email)} />
        </Field>
      </div>
      <Field id="message" label={c.message} error={msg(errors.message)}>
        <textarea id="message" name="message" rows={6} maxLength={4000} className={textareaClass} aria-invalid={!!errors.message} aria-describedby={describedBy("message", undefined, errors.message)} />
      </Field>
      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input type="checkbox" name="privacy" className="mt-1 size-4 accent-[var(--oc-primary)]" />
        <span>
          {d.custom.privacy}
          {errors.privacy && <span className="mt-1 block text-error">{msg(errors.privacy)}</span>}
        </span>
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? d.custom.sending : c.submit}
      </Button>
    </form>
  );
}
