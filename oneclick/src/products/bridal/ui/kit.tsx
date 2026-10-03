"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { XIcon } from "@phosphor-icons/react";
import { useBridal } from "../app/state";

/**
 * Bridal Journey design system "Pearl & Rose": pearl white, blush and rose gold with a deep
 * wine accent, calligraphic Arabic headings, soft shadows and graceful motion (reduced-motion safe).
 */
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type BtnVariant = "primary" | "secondary" | "ghost" | "soft" | "danger";
export function Button({ variant = "primary", size = "md", className, children, ...rest }: { variant?: BtnVariant; size?: "sm" | "md" | "lg" } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cx(
        "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,box-shadow,transform,color,filter] duration-300 ease-[cubic-bezier(.16,1,.3,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
        size === "sm" && "h-9 px-4 text-[13px]",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-[52px] px-7 text-[15px]",
        variant === "primary" && "bg-[linear-gradient(135deg,#8e3456_0%,#a8466b_100%)] text-white shadow-[0_10px_24px_-12px_rgba(142,52,86,.65)] hover:shadow-[0_14px_28px_-12px_rgba(142,52,86,.7)] hover:brightness-[1.06]",
        variant === "secondary" && "border border-bj-beige bg-bj-paper text-bj-ink hover:border-bj-taupe",
        variant === "soft" && "bg-bj-cream text-bj-ink hover:bg-bj-champagne/70",
        variant === "ghost" && "text-bj-ink-soft hover:bg-bj-cream",
        variant === "danger" && "text-bj-alert hover:bg-bj-alert-soft",
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
    <button type="button" aria-label={label} title={label} className={cx("grid size-10 shrink-0 place-items-center rounded-full text-bj-ink-soft transition-colors hover:bg-bj-cream hover:text-bj-ink", className)} {...rest}>
      {children}
    </button>
  );
}

export function Card({ className, children, as: As = "div", ...rest }: { className?: string; children: ReactNode; as?: "div" | "section" | "li" | "article" } & Record<string, unknown>) {
  return (
    <As className={cx("rounded-[24px] border border-bj-line bg-bj-paper shadow-[0_1px_2px_rgba(90,30,55,.03),0_14px_34px_-24px_rgba(90,30,55,.12)]", className)} {...rest}>
      {children}
    </As>
  );
}

export function SectionHeader({ eyebrow, title, sub, action, level = 1 }: { eyebrow?: string; title: string; sub?: string; action?: ReactNode; level?: 1 | 2 }) {
  const H = level === 1 ? "h1" : "h2";
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-bj-gold-ink">{eyebrow}</p>}
        <H className={cx("bj-serif text-bj-ink", level === 1 ? "text-[2rem] leading-tight sm:text-[2.4rem]" : "text-[1.5rem] leading-snug")}>{title}</H>
        {sub && <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-bj-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export type Tone = "neutral" | "sage" | "amber" | "alert" | "gold" | "rose" | "ink";
const tones: Record<Tone, string> = {
  neutral: "bg-bj-cream text-bj-ink-soft",
  sage: "bg-bj-sage-soft text-bj-sage",
  amber: "bg-bj-amber-soft text-bj-amber",
  alert: "bg-bj-alert-soft text-bj-alert",
  gold: "bg-[#f8ebe6] text-bj-gold-ink",
  rose: "bg-bj-blush text-bj-rose",
  ink: "bg-bj-gold-ink text-white",
};
export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[11.5px] font-medium", tones[tone], className)}>{children}</span>;
}

/** Animated circular progress. */
export function ProgressRing({ value, size = 120, stroke = 7, children, color = "#c48b78" }: { value: number; size?: number; stroke?: number; children?: ReactNode; color?: string }) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4e6ea" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? c * (1 - v) : c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ duration: reduce ? 0 : 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Bar({ value, tone = "gold", className }: { value: number; tone?: "gold" | "sage" | "alert" | "rose"; className?: string }) {
  const reduce = useReducedMotion();
  const color = { gold: "bg-bj-gold", sage: "bg-bj-sage", alert: "bg-bj-alert", rose: "bg-bj-rose" }[tone];
  return (
    <div className={cx("h-1.5 overflow-hidden rounded-full bg-[#f4e6ea]", className)}>
      <motion.div className={cx("h-full rounded-full", color)} initial={{ width: reduce ? `${value * 100}%` : 0 }} animate={{ width: `${Math.min(1, Math.max(0, value)) * 100}%` }} transition={{ duration: reduce ? 0 : 1, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  );
}

/** Number that counts up smoothly (formatted by the caller). */
export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => format(Math.round(v)));
  useEffect(() => {
    const c = animate(mv, value, { duration: reduce ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [value, mv, reduce]);
  return <motion.span>{text}</motion.span>;
}

export function EmptyState({ icon, title, sub, action }: { icon: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[20px] border border-dashed border-bj-beige bg-bj-paper/60 px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-bj-cream text-bj-gold-ink">{icon}</span>
      <p className="bj-serif mt-4 text-xl text-bj-ink">{title}</p>
      {sub && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-bj-muted">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("bj-skeleton rounded-2xl", className)} aria-hidden="true" />;
}

/** Bottom sheet on phones, side panel on larger screens. Native <dialog> for focus and Escape. */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
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
      className="bj m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-[26px] border-0 bg-bj-paper p-0 text-bj-ink shadow-[0_-20px_60px_-20px_rgba(90,30,55,.22)] open:flex open:flex-col sm:me-0 sm:ms-auto sm:mt-0 sm:h-dvh sm:max-h-dvh sm:w-[440px] sm:rounded-none sm:rounded-s-[26px]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-bj-line px-5 py-4">
        <h2 id={titleId} className="bj-serif text-[1.35rem] text-bj-ink">
          {title}
        </h2>
        <IconButton label="✕" onClick={onClose}>
          <XIcon size={18} weight="regular" />
        </IconButton>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      {footer && <div className="flex items-center gap-2 border-t border-bj-line bg-bj-paper px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">{footer}</div>}
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
    <dialog ref={ref} onClose={onNo} className="bj m-auto w-[min(92vw,380px)] rounded-[22px] border border-bj-line bg-bj-paper p-6 text-bj-ink">
      <p className="text-[15px] leading-relaxed">{text}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onNo}>
          {no}
        </Button>
        <Button variant="primary" onClick={onYes} className="!bg-bj-alert">
          {yes}
        </Button>
      </div>
    </dialog>
  );
}

// ---------- form controls ----------
const control = "w-full rounded-[14px] border border-bj-line bg-bj-ivory px-3.5 text-[15px] text-bj-ink placeholder:text-bj-muted/70 transition-colors focus:border-bj-gold focus:bg-bj-paper focus:outline-none";
export const inputCls = `${control} h-12`;

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-bj-ink-soft">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-bj-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-bj-alert">
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
    <div role="radiogroup" aria-label={label} className="bj-scroll-x flex max-w-full gap-1 overflow-x-auto rounded-full border border-bj-line bg-bj-paper p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx("h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] transition-colors", value === o.value ? "bg-bj-gold-ink text-white" : "text-bj-ink-soft hover:bg-bj-cream")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Chips<T extends string>({ value, onChange, options, label }: { value: T | "all"; onChange: (v: T | "all") => void; options: { value: T | "all"; label: string; count?: number }[]; label: string }) {
  const { num } = useBridal();
  return (
    <div role="group" aria-label={label} className="bj-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "h-9 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[13px] transition-colors",
            value === o.value ? "border-bj-gold-ink bg-bj-gold-ink text-white" : "border-bj-line bg-bj-paper text-bj-ink-soft hover:border-bj-taupe/50"
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="ms-1.5 opacity-60">{num(o.count)}</span>}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2 text-[15px]">
      <span>{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cx("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-bj-sage" : "bg-bj-beige")}>
        <span className={cx("absolute top-1 size-5 rounded-full bg-white shadow transition-[inset-inline-start] duration-200", checked ? "start-6" : "start-1")} />
      </button>
    </label>
  );
}

/** Choice cards used in onboarding and settings. */
export function ChoiceCard({ selected, onClick, children, icon, multi }: { selected: boolean; onClick: () => void; children: ReactNode; icon?: ReactNode; multi?: boolean }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={cx(
        "flex min-h-14 w-full items-center gap-3 rounded-[16px] border px-4 py-3 text-start text-[15px] transition-[border-color,background-color,box-shadow] duration-200",
        selected ? "border-bj-gold bg-[#fdf3f0] shadow-[0_0_0_3px_rgba(196,139,120,.22)]" : "border-bj-line bg-bj-paper hover:border-bj-taupe/40"
      )}
    >
      {icon && <span className={cx("grid size-9 shrink-0 place-items-center rounded-full", selected ? "bg-bj-gold text-white" : "bg-bj-cream text-bj-gold-ink")}>{icon}</span>}
      <span className="flex-1">{children}</span>
      <span aria-hidden="true" className={cx("grid size-5 shrink-0 place-items-center rounded-full border", selected ? "border-bj-gold bg-bj-gold text-white" : "border-bj-beige")}>
        {selected && <svg viewBox="0 0 12 12" className="size-3"><path d="M2.5 6.2l2.2 2.2 4.8-4.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
    </button>
  );
}

/** Round check that draws itself. */
export function CheckCircle({ checked, onClick, label, size = 26 }: { checked: boolean; onClick: () => void; label: string; size?: number }) {
  const reduce = useReducedMotion();
  return (
    <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={onClick} className="group grid shrink-0 place-items-center rounded-full" style={{ width: size + 14, height: size + 14 }}>
      <span className={cx("grid place-items-center rounded-full border transition-colors duration-300", checked ? "border-bj-sage bg-bj-sage" : "border-bj-beige bg-bj-paper group-hover:border-bj-gold")} style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" className="size-[62%]" aria-hidden="true">
          <motion.path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.35 }} />
        </svg>
      </span>
    </button>
  );
}

export function useConfirm() {
  const [state, setState] = useState<null | { text: string; run: () => void }>(null);
  return {
    ask: (text: string, run: () => void) => setState({ text, run }),
    node: (yes: string, no: string) => (
      <Confirm
        open={!!state}
        text={state?.text ?? ""}
        yes={yes}
        no={no}
        onYes={() => {
          state?.run();
          setState(null);
        }}
        onNo={() => setState(null)}
      />
    ),
  };
}

export { cx };
