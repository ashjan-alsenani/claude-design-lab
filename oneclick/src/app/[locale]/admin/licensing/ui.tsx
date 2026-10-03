import type { ReactNode } from "react";

// Small shared pieces for the admin licensing screens (server components).
export const field = "h-10 rounded-[var(--radius-sm)] border border-line-strong bg-bg px-3 text-sm text-ink";
export const btn = "h-10 rounded-full bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover";
export const btnDanger = "h-10 rounded-full bg-error px-4 text-sm font-semibold text-white";

export function Hidden({ locale, back, ...rest }: { locale: string; back: string } & Record<string, string>) {
  return (
    <>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="back" value={back} />
      {Object.entries(rest).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
    </>
  );
}

export function Confirm({ label = "I confirm" }: { label?: string }) {
  return (
    <label className="flex items-center gap-2 text-xs text-ink-soft">
      <input type="checkbox" name="confirm" required className="size-4 accent-[var(--oc-error)]" />
      {label}
    </label>
  );
}

export function Card({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="min-w-0 rounded-[var(--radius-lg)] border border-line bg-surface p-5">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Flash({ sp }: { sp: Record<string, string | undefined> }) {
  if (sp.ok) return <p role="status" className="mt-4 rounded-[var(--radius-md)] bg-primary-soft px-4 py-2 text-sm font-medium text-ink">Saved. The change is in the audit log.</p>;
  if (sp.e)
    return (
      <p role="alert" className="mt-4 rounded-[var(--radius-md)] bg-[color-mix(in_oklab,var(--oc-error)_10%,transparent)] px-4 py-2 text-sm font-medium text-error">
        {sp.e === "confirm" ? "Please tick the confirmation box and choose an action." : sp.e === "reason_required" ? "Please write a reason (3+ characters)." : `Not done: ${sp.e.replace(/_/g, " ")}.`}
      </p>
    );
  return null;
}

export const when = (iso?: string) => (iso ? new Date(iso).toISOString().replace("T", " ").slice(0, 16) : "—");
