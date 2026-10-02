import type { ReactNode } from "react";

const control =
  "w-full rounded-[var(--radius-md)] border bg-bg px-4 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-[var(--oc-primary)]/30 aria-[invalid=true]:border-error border-line-strong focus:border-primary";

export const inputClass = `${control} h-12`;
export const textareaClass = `${control} py-3 leading-relaxed`;

/** Label above, helper below label, error below control. Never placeholder-as-label. */
export function Field({
  id,
  label,
  help,
  error,
  optional,
  optionalLabel,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  optional?: boolean;
  optionalLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {optional && <span className="ms-2 font-normal text-muted">({optionalLabel})</span>}
      </label>
      {help && (
        <p id={`${id}-help`} className="-mt-1 text-sm text-muted">
          {help}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, help?: string, error?: string) {
  return [help ? `${id}-help` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
}

export function ChoiceGroup({
  name,
  legend,
  options,
  type = "radio",
  defaultValue,
  error,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  type?: "radio" | "checkbox";
  defaultValue?: string | string[];
  error?: string;
}) {
  const isDefault = (v: string) => (Array.isArray(defaultValue) ? defaultValue.includes(v) : defaultValue === v);
  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-2 text-sm font-medium text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="relative cursor-pointer">
            <input type={type} name={name} value={o.value} defaultChecked={isDefault(o.value)} className="peer sr-only" />
            <span className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-4 text-sm text-ink-soft transition-colors peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--oc-primary)]">
              {o.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} className="text-sm text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
