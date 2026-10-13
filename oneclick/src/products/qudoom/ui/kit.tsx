"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { CaretDownIcon, SparkleIcon, XIcon } from "@phosphor-icons/react";
import { useQ } from "../app/state";

/**
 * Hikayat Qudoom design system: the OneClick base (Rubik, ink, cream, soft cards, pill buttons,
 * Phosphor icons) with a calm motherhood layer whose secondary colours come from the chosen theme
 * (CSS variables on .qd). Motion is short and stops under prefers-reduced-motion.
 */
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type BtnVariant = "primary" | "secondary" | "ghost" | "soft" | "danger";
export function Button({ variant = "primary", size = "md", className, children, ...rest }: { variant?: BtnVariant; size?: "sm" | "md" | "lg" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background-color,box-shadow,transform,color] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
        size === "sm" && "h-9 px-4 text-[13px]",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-[52px] px-7 text-[15px]",
        variant === "primary" && "bg-[var(--qd-primary)] text-white shadow-[0_4px_0_-1px_var(--qd-primary-deep)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
        variant === "secondary" && "border-2 border-[var(--qd-line)] bg-[var(--qd-paper)] text-[var(--qd-ink)] hover:border-[color-mix(in_oklab,var(--qd-primary)_40%,var(--qd-line))]",
        variant === "soft" && "bg-[var(--qd-tint)] text-[var(--qd-primary-deep)] hover:brightness-[0.97]",
        variant === "ghost" && "font-medium text-[var(--qd-ink-soft)] hover:bg-[var(--qd-tint-2)]",
        variant === "danger" && "font-medium text-[var(--qd-alert)] hover:bg-[var(--qd-alert-soft)]",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, className, children, ...rest }: { label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" aria-label={label} title={label} className={cx("grid size-11 shrink-0 place-items-center rounded-full text-[var(--qd-ink-soft)] transition-colors hover:bg-[var(--qd-tint-2)] hover:text-[var(--qd-ink)]", className)} {...rest}>
      {children}
    </button>
  );
}

export function Card({ className, children, as: As = "div", ...rest }: { className?: string; children: ReactNode; as?: "div" | "section" | "li" | "article" } & Record<string, unknown>) {
  return (
    <As className={cx("qd-card rounded-[24px]", className)} {...rest}>
      {children}
    </As>
  );
}

/** Page title as in «مفكّرة عروسة العُمر»: big bold ink title, soft subtitle, the action at the end. */
export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-2 sm:pt-4">
      <div className="min-w-0">
        <h1 className="text-[2rem] font-bold leading-[1.2] text-[var(--qd-ink)] sm:text-[2.5rem]">{title}</h1>
        {sub && <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--qd-ink-soft)]">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
export function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h2 className="text-[1.5rem] font-bold leading-snug text-[var(--qd-ink)]">{title}</h2>
        {sub && <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-[var(--qd-muted)]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export type Tone = "neutral" | "primary" | "sage" | "amber" | "alert" | "accent" | "lilac";
const tones: Record<Tone, string> = {
  neutral: "bg-[#f4eee8] text-[var(--qd-ink-soft)]",
  primary: "bg-[var(--qd-tint)] text-[var(--qd-primary-deep)]",
  sage: "bg-[var(--qd-sage-soft)] text-[#3f6a45]",
  amber: "bg-[var(--qd-amber-soft)] text-[var(--qd-amber)]",
  alert: "bg-[var(--qd-alert-soft)] text-[var(--qd-alert)]",
  accent: "bg-[var(--qd-accent-soft)] text-[#8a4a2a]",
  lilac: "bg-[var(--qd-lilac-soft)] text-[#4e43a8]",
};
export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[12px] font-medium", tones[tone], className)}>{children}</span>;
}

export function Ring({ value, size = 112, stroke = 9, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--qd-tint)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--qd-primary)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: reduce ? c * (1 - v) : c }} animate={{ strokeDashoffset: c * (1 - v) }} transition={{ duration: reduce ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Bar({ value, tone = "primary", className, label }: { value: number; tone?: "primary" | "sage" | "alert" | "accent"; className?: string; label?: string }) {
  const reduce = useReducedMotion();
  const color = { primary: "bg-[var(--qd-primary)]", sage: "bg-[var(--qd-sage)]", alert: "bg-[var(--qd-alert)]", accent: "bg-[var(--qd-accent)]" }[tone];
  const v = Math.min(1, Math.max(0, value));
  return (
    <div role={label ? "progressbar" : undefined} aria-label={label} aria-valuenow={label ? Math.round(v * 100) : undefined} aria-valuemin={label ? 0 : undefined} aria-valuemax={label ? 100 : undefined} className={cx("h-2 overflow-hidden rounded-full bg-[var(--qd-tint)]", className)}>
      <motion.div className={cx("h-full rounded-full", color)} initial={{ width: reduce ? `${v * 100}%` : 0 }} animate={{ width: `${v * 100}%` }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  );
}

export function EmptyState({ icon, title, sub, action }: { icon: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[22px] border border-dashed border-[var(--qd-line)] bg-[var(--qd-paper)]/70 px-6 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-[var(--qd-tint)] text-[var(--qd-primary)]">{icon}</span>
      <p className="mt-4 text-lg font-semibold">{title}</p>
      {sub && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--qd-muted)]">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("qd-skeleton rounded-2xl", className)} aria-hidden="true" />;
}

/** Bottom sheet on phones, side panel on larger screens. Native <dialog> gives focus trapping and Escape. */
export function Sheet({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { t, plan } = useQ();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      data-theme={plan.profile?.theme ?? "cloud"}
      className={cx("qd m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-[26px] border-0 p-0 shadow-[0_-20px_60px_-20px_rgba(60,40,30,.25)] backdrop:bg-[#3f3b52]/25 open:flex open:flex-col sm:me-0 sm:ms-auto sm:mt-0 sm:h-dvh sm:max-h-dvh sm:rounded-none sm:rounded-s-[26px]", wide ? "sm:w-[560px]" : "sm:w-[460px]")}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--qd-line)] bg-[var(--qd-paper)] px-5 py-3.5">
        <h2 id={titleId} className="text-[1.2rem] font-bold">
          {title}
        </h2>
        <IconButton label={t.common.close} onClick={onClose}>
          <XIcon size={18} />
        </IconButton>
      </div>
      <div className="flex-1 overflow-y-auto bg-[var(--qd-bg)] px-5 py-5">{children}</div>
      {footer && <div className="flex items-center gap-2 border-t border-[var(--qd-line)] bg-[var(--qd-paper)] px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
    </dialog>
  );
}

export function Confirm({ open, text, yes, no, onYes, onNo }: { open: boolean; text: string; yes: string; no: string; onYes: () => void; onNo: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && open && !d.open) d.showModal();
    if (d && !open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onNo} className="qd m-auto w-[min(92vw,400px)] rounded-[22px] border border-[var(--qd-line)] p-6 backdrop:bg-[#3f3b52]/25">
      <p className="text-[15px] leading-relaxed">{text}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onNo}>
          {no}
        </Button>
        <Button onClick={onYes} className="!bg-[var(--qd-alert)] !shadow-none">
          {yes}
        </Button>
      </div>
    </dialog>
  );
}
export function useConfirm() {
  const [state, setState] = useState<null | { text: string; run: () => void }>(null);
  return {
    ask: (text: string, run: () => void) => setState({ text, run }),
    node: (yes: string, no: string) => <Confirm open={!!state} text={state?.text ?? ""} yes={yes} no={no} onYes={() => (state?.run(), setState(null))} onNo={() => setState(null)} />,
  };
}

// ---------- form controls ----------
const control = "w-full rounded-[14px] border border-[var(--qd-line)] bg-[var(--qd-paper)] px-3.5 text-[15px] text-[var(--qd-ink)] placeholder:text-[var(--qd-muted)]/70 transition-colors focus:border-[var(--qd-primary)] focus:outline-none aria-[invalid=true]:border-[var(--qd-alert)]";
export const inputCls = `${control} h-12`;
export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-[var(--qd-ink-soft)]">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs leading-relaxed text-[var(--qd-muted)]">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-[var(--qd-alert)]">
          {error}
        </p>
      )}
    </div>
  );
}
export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} min-h-24 py-3 leading-relaxed ${props.className ?? ""}`} />;
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="qd-scroll-x flex max-w-full gap-1 overflow-x-auto rounded-full border border-[var(--qd-line)] bg-[var(--qd-paper)] p-1">
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} className={cx("h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-[13.5px] transition-colors", value === o.value ? "bg-[var(--qd-primary)] font-semibold text-white" : "text-[var(--qd-ink-soft)] hover:bg-[var(--qd-tint-2)]")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
export function Chips<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[]; label: string }) {
  const { num } = useQ();
  return (
    <div role="group" aria-label={label} className="qd-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className={cx("h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[13px] transition-colors", value === o.value ? "border-[var(--qd-primary)] bg-[var(--qd-primary)] font-semibold text-white" : "border-[var(--qd-line)] bg-[var(--qd-paper)] text-[var(--qd-ink-soft)] hover:border-[color-mix(in_oklab,var(--qd-primary)_35%,var(--qd-line))]")}>
          {o.label}
          {o.count !== undefined && <span className="ms-1.5 opacity-70">{num(o.count)}</span>}
        </button>
      ))}
    </div>
  );
}
export function Toggle({ checked, onChange, label, sub, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <label htmlFor={id} className="min-w-0 cursor-pointer text-[15px]">
        {label}
        {sub && <span className="mt-0.5 block text-[12.5px] text-[var(--qd-muted)]">{sub}</span>}
      </label>
      <button id={id} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={cx("relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50", checked ? "bg-[var(--qd-primary)]" : "bg-[#e3d9cf]")}>
        <span className={cx("absolute top-1 size-5 rounded-full bg-white shadow transition-[inset-inline-start] duration-200", checked ? "start-6" : "start-1")} />
      </button>
    </div>
  );
}
export function ChoiceCard({ selected, onClick, children, icon, multi, sub }: { selected: boolean; onClick: () => void; children: ReactNode; icon?: ReactNode; multi?: boolean; sub?: string }) {
  return (
    <button type="button" role={multi ? "checkbox" : "radio"} aria-checked={selected} onClick={onClick} className={cx("flex min-h-14 w-full items-center gap-3 rounded-[16px] border px-4 py-3 text-start text-[15px] transition-[border-color,background-color,box-shadow] duration-200", selected ? "border-[var(--qd-primary)] bg-[var(--qd-tint-2)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--qd-primary)_18%,transparent)]" : "border-[var(--qd-line)] bg-[var(--qd-paper)] hover:border-[color-mix(in_oklab,var(--qd-primary)_35%,var(--qd-line))]")}>
      {icon && <span className={cx("grid size-10 shrink-0 place-items-center rounded-full", selected ? "bg-[var(--qd-primary)] text-white" : "bg-[var(--qd-tint)] text-[var(--qd-primary)]")}>{icon}</span>}
      <span className="flex-1">
        {children}
        {sub && <span className="mt-0.5 block text-[12.5px] text-[var(--qd-muted)]">{sub}</span>}
      </span>
      <span aria-hidden="true" className={cx("grid size-5 shrink-0 place-items-center border", multi ? "rounded-[6px]" : "rounded-full", selected ? "border-[var(--qd-primary)] bg-[var(--qd-primary)] text-white" : "border-[#d9cec3]")}>
        {selected && <svg viewBox="0 0 12 12" className="size-3"><path d="M2.5 6.2l2.2 2.2 4.8-4.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
    </button>
  );
}
/** Round check that draws itself (a small, calm "done" moment). */
export function CheckCircle({ checked, onClick, label, size = 26, disabled }: { checked: boolean; onClick: () => void; label: string; size?: number; disabled?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={onClick} disabled={disabled} className="group grid shrink-0 place-items-center rounded-full disabled:opacity-60" style={{ width: Math.max(44, size + 14), height: Math.max(44, size + 14) }}>
      <span className={cx("grid place-items-center rounded-full border-2 transition-colors duration-300", checked ? "border-[var(--qd-sage)] bg-[var(--qd-sage)]" : "border-[#d9cec3] bg-[var(--qd-paper)] group-hover:border-[var(--qd-primary)]")} style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" className="size-[62%]" aria-hidden="true">
          <motion.path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.3 }} />
        </svg>
      </span>
    </button>
  );
}
/** Collapsible group (long lists on a phone). */
export function Fold({ title, count, children, defaultOpen = true, aside }: { title: string; count?: string; children: ReactNode; defaultOpen?: boolean; aside?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="qd-card overflow-hidden rounded-[20px]">
      <div className="flex items-center gap-2 pe-2">
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="flex min-h-14 flex-1 items-center gap-3 px-4 text-start">
          <CaretDownIcon size={16} className={cx("shrink-0 text-[var(--qd-muted)] transition-transform", !open && "-rotate-90 rtl:rotate-90")} />
          <span className="font-semibold">{title}</span>
          {count && <span className="text-[13px] text-[var(--qd-muted)]">{count}</span>}
        </button>
        {aside}
      </div>
      {open && <div id={id} className="border-t border-[var(--qd-line)]">{children}</div>}
    </section>
  );
}
export function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "alert" | "sage" }) {
  return (
    <div className="qd-card min-w-0 rounded-[20px] px-4 py-3.5">
      <p className="text-[13px] font-medium text-[var(--qd-muted)]">{label}</p>
      <p className={cx("mt-1 truncate text-[1.5rem] font-bold leading-tight tabular-nums text-[var(--qd-ink)]", tone === "alert" && "text-[var(--qd-alert)]", tone === "sage" && "text-[#3f6a45]")}>{value}</p>
      {sub && <p className="mt-0.5 text-[11.5px] text-[var(--qd-muted)]">{sub}</p>}
    </div>
  );
}

/** A cheerful link to the ready ideas (gifts and favors). */
export function IdeasLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-[22px] border-2 border-dashed border-[var(--qd-star)] bg-[var(--qd-paper)]/90 px-4 py-3 text-[15px] font-semibold">
      <span className="grid size-9 place-items-center rounded-full bg-[var(--qd-star)] text-white"><SparkleIcon size={18} weight="fill" /></span>
      <span className="flex-1">{label}</span>
      <span aria-hidden="true" className="text-[var(--qd-amber)] rtl:rotate-180">→</span>
    </a>
  );
}
