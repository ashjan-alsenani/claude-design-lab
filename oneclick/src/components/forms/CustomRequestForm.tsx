"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "motion/react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { submitCustomRequest, type CustomRequestState } from "@/app/[locale]/custom/actions";
import { Button } from "@/components/ui/Button";
import { ChoiceGroup, Field, describedBy, inputClass, textareaClass } from "@/components/ui/Field";
import { track } from "@/lib/analytics/track";

// Fields per step, used to jump to the first step with a server-side error.
const stepFields = [
  ["goal", "solutionType", "audience"],
  ["features", "references", "languages"],
  ["deadline", "budget", "branding", "payments", "notes"],
  ["name", "email", "phone", "country", "privacy"],
];

export function CustomRequestForm({ d, locale }: { d: Pick<Dictionary, "custom" | "form" | "product">; locale: Locale }) {
  const [state, action, pending] = useActionState<CustomRequestState, FormData>(submitCustomRequest, { status: "idle" });
  const [step, setStep] = useState(0);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const c = d.custom;

  const serverErrors = state.status === "invalid" ? state.errors : {};
  const errors = { ...serverErrors, ...clientErrors };
  const msg = (key?: string) => (key ? (d.form as Record<string, string>)[key] ?? d.form.required : undefined);

  useEffect(() => {
    if (state.status === "invalid") {
      const first = stepFields.findIndex((fields) => fields.some((f) => state.errors[f]));
      if (first >= 0) setStep(first);
    }
    if (state.status === "ok") track("custom_request", { solution_type: "submitted" });
  }, [state]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function validateStep(): boolean {
    const form = formRef.current;
    if (!form) return true;
    const fd = new FormData(form);
    const e: Record<string, string> = {};
    const val = (k: string) => String(fd.get(k) ?? "").trim();
    if (step === 0) {
      if (val("goal").length < 10) e.goal = "tooShort";
      if (!val("solutionType")) e.solutionType = "required";
    }
    if (step === 1) {
      if (val("features").length < 5) e.features = "tooShort";
      if (fd.getAll("languages").length === 0) e.languages = "required";
    }
    if (step === 2) {
      if (!val("budget")) e.budget = "required";
      if (!val("branding")) e.branding = "required";
      if (!val("payments")) e.payments = "required";
    }
    if (step === 3) {
      if (val("name").length < 2) e.name = "required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) e.email = "invalidEmail";
      if (!fd.get("privacy")) e.privacy = "required";
    }
    setClientErrors(e);
    return Object.keys(e).length === 0;
  }

  if (state.status === "ok") {
    return (
      <motion.div
        role="status"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[var(--radius-xl)] border border-line bg-surface p-8 text-center sm:p-12"
      >
        <CheckCircleIcon size={56} weight="duotone" className="mx-auto text-primary" />
        <h2 className="mt-4 text-2xl font-semibold text-ink">{c.successTitle}</h2>
        <p className="mt-2 text-lg text-ink-soft">{c.successBody.replace("{ref}", state.reference)}</p>
        {state.mode === "local-demo" && <p className="mx-auto mt-6 max-w-md rounded-[var(--radius-md)] bg-accent-soft p-3 text-sm text-ink-soft">{c.successDemo}</p>}
      </motion.div>
    );
  }

  const stepClass = (i: number) => (i === step ? "space-y-6" : "hidden");

  return (
    <form
      ref={formRef}
      noValidate
      onInput={(e) => {
        const n = (e.target as HTMLInputElement).name;
        if (clientErrors[n]) setClientErrors(({ [n]: _removed, ...rest }) => rest);
      }}
      // Submit manually so React does not reset the fields: answers survive server errors.
      onSubmit={(e) => {
        e.preventDefault();
        if (!validateStep()) return;
        if (step < 3) return setStep((s) => s + 1);
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }} className="rounded-[var(--radius-xl)] border border-line bg-surface p-5 sm:p-8">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot (hidden from people and screen readers) */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-0 overflow-hidden">
        <label>
          Leave this field empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <ol className="mb-8 grid grid-cols-4 gap-2" aria-label="Progress">
        {c.steps.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <span className="block h-1.5 rounded-full transition-colors duration-300" style={{ background: i <= step ? "var(--oc-primary)" : "var(--oc-line)" }} />
            <span className={`mt-2 block text-xs ${i === step ? "font-semibold text-ink" : "text-muted"}`}>{label}</span>
          </li>
        ))}
      </ol>

      <h2 ref={headingRef} tabIndex={-1} className="mb-6 scroll-mt-28 text-xl font-semibold text-ink outline-none">
        {c.steps[step]}
      </h2>

      {(state.status === "error" || state.status === "rate_limited") && (
        <p role="alert" className="mb-6 rounded-[var(--radius-md)] bg-error/10 p-4 text-sm text-error">
          {state.status === "rate_limited" ? c.rateLimited : c.error}
        </p>
      )}
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="mb-6 text-sm text-error">
          {d.form.fixErrors}
        </p>
      )}

      <div className={stepClass(0)}>
        <Field id="goal" label={c.goal} help={c.goalHelp} error={msg(errors.goal)}>
          <textarea id="goal" name="goal" rows={3} maxLength={1000} className={textareaClass} aria-invalid={!!errors.goal} aria-describedby={describedBy("goal", c.goalHelp, errors.goal)} />
        </Field>
        <ChoiceGroup name="solutionType" legend={c.type} error={msg(errors.solutionType)} options={Object.entries(c.types).map(([value, label]) => ({ value, label }))} />
        <Field id="audience" label={c.audience} optional optionalLabel={d.form.optional}>
          <input id="audience" name="audience" maxLength={500} className={inputClass} />
        </Field>
      </div>

      <div className={stepClass(1)}>
        <Field id="features" label={c.features} help={c.featuresHelp} error={msg(errors.features)}>
          <textarea id="features" name="features" rows={4} maxLength={2000} className={textareaClass} aria-invalid={!!errors.features} aria-describedby={describedBy("features", c.featuresHelp, errors.features)} />
        </Field>
        <Field id="references" label={c.references} help={c.referencesHelp}>
          <textarea id="references" name="references" rows={3} maxLength={2000} className={textareaClass} dir="ltr" aria-describedby="references-help" />
        </Field>
        <ChoiceGroup
          name="languages"
          type="checkbox"
          legend={c.languages}
          error={msg(errors.languages)}
          defaultValue={[locale]}
          options={[
            { value: "ar", label: d.product.langNames.ar },
            { value: "en", label: d.product.langNames.en },
            { value: "other", label: c.types.other },
          ]}
        />
      </div>

      <div className={stepClass(2)}>
        <Field id="deadline" label={c.deadline} optional optionalLabel={d.form.optional}>
          <input id="deadline" name="deadline" type="date" className={`${inputClass} sm:max-w-xs`} />
        </Field>
        <ChoiceGroup name="budget" legend={c.budget} error={msg(errors.budget)} options={Object.entries(c.budgets).map(([value, label]) => ({ value, label }))} />
        <ChoiceGroup name="branding" legend={c.branding} error={msg(errors.branding)} options={Object.entries(c.brandingOptions).map(([value, label]) => ({ value, label }))} />
        <ChoiceGroup
          name="payments"
          legend={c.payments}
          error={msg(errors.payments)}
          options={[
            { value: "yes", label: c.yes },
            { value: "no", label: c.no },
            { value: "unsure", label: c.unsure },
          ]}
        />
        <div className="rounded-[var(--radius-md)] border border-dashed border-line-strong p-4">
          <p className="text-sm font-medium text-ink">{c.attachments}</p>
          <p className="mt-1 text-sm text-muted">{c.attachmentsNote}</p>
        </div>
        <Field id="notes" label={c.notes} optional optionalLabel={d.form.optional}>
          <textarea id="notes" name="notes" rows={3} maxLength={2000} className={textareaClass} />
        </Field>
      </div>

      <div className={stepClass(3)}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="name" label={c.name} error={msg(errors.name)}>
            <input id="name" name="name" autoComplete="name" maxLength={120} className={inputClass} aria-invalid={!!errors.name} aria-describedby={describedBy("name", undefined, errors.name)} />
          </Field>
          <Field id="email" label={c.email} error={msg(errors.email)}>
            <input id="email" name="email" type="email" autoComplete="email" dir="ltr" maxLength={200} className={inputClass} aria-invalid={!!errors.email} aria-describedby={describedBy("email", undefined, errors.email)} />
          </Field>
          <Field id="phone" label={c.phone} optional optionalLabel={d.form.optional}>
            <input id="phone" name="phone" type="tel" autoComplete="tel" dir="ltr" maxLength={40} className={inputClass} />
          </Field>
          <Field id="country" label={c.country} optional optionalLabel={d.form.optional}>
            <input id="country" name="country" autoComplete="country-name" maxLength={80} className={inputClass} />
          </Field>
        </div>
        <label className="flex items-start gap-3 text-sm text-ink-soft">
          <input type="checkbox" name="privacy" className="mt-1 size-4 accent-[var(--oc-primary)]" aria-invalid={!!errors.privacy} />
          <span>
            {c.privacy}
            {errors.privacy && <span className="mt-1 block text-error">{msg(errors.privacy)}</span>}
          </span>
        </label>
      </div>

      <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
        {step > 0 ? (
          <Button key="prev" type="button" variant="ghost" onClick={() => { setClientErrors({}); setStep((s) => s - 1); }}>
            {c.prev}
          </Button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          // Distinct keys: React must not morph this button into the submit button mid-click.
          <Button key="next" type="button" onClick={() => validateStep() && setStep((s) => s + 1)}>
            {c.next}
          </Button>
        ) : (
          <Button key="submit" type="submit" disabled={pending}>
            {pending ? c.sending : c.submit}
          </Button>
        )}
      </div>
    </form>
  );
}
