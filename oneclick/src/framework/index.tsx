"use client";

/**
 * OCDH Digital Product Framework (client primitives).
 * Shared building blocks every interactive product composes: progress, checklists,
 * stat tiles, a product shell and a local-state list hook. Each product supplies its
 * own data model, copy and hue, so products share foundations but feel distinct.
 * Server-side pieces (entitlements, orders) live in src/lib/commerce.
 */
import { motion, useReducedMotion } from "motion/react";
import { CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { useCallback, useId, useState, type ReactNode } from "react";

export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  color = "var(--oc-primary)",
  label,
  children,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  color?: string;
  label: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--oc-line)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 22 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export function CheckRow({
  checked,
  onToggle,
  color = "var(--oc-primary)",
  children,
  meta,
}: {
  checked: boolean;
  onToggle: () => void;
  color?: string;
  children: ReactNode;
  meta?: ReactNode;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <label htmlFor={id} className="group flex min-h-12 cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 hover:bg-bg-sunken/70">
      <input id={id} type="checkbox" checked={checked} onChange={onToggle} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--oc-primary)]"
        style={{ borderColor: checked ? color : "var(--oc-line-strong)", background: checked ? color : "transparent" }}
      >
        <motion.span initial={false} animate={{ scale: checked ? 1 : 0 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 28 }}>
          <CheckIcon size={14} weight="bold" color="var(--oc-surface)" />
        </motion.span>
      </span>
      <span className={`flex-1 text-[0.95rem] transition-colors ${checked ? "text-muted line-through decoration-1" : "text-ink"}`}>{children}</span>
      {meta && <span className="text-sm text-muted tabular">{meta}</span>}
    </label>
  );
}

export function StatTile({ label, value, sub, color }: { label: string; value: ReactNode; sub?: ReactNode; color?: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-bg-sunken/70 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular" style={{ color: color ?? "var(--oc-ink)" }}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

/** Frame used by every product demo / app view. */
export function ProductShell({
  title,
  icon,
  hue,
  badge,
  children,
  className = "",
}: {
  title: string;
  icon?: ReactNode;
  hue: string;
  badge?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface-raised shadow-lift ${className}`}>
      <div className="flex items-center gap-3 border-b border-line px-4 py-3" style={{ background: `color-mix(in oklab, ${hue} 8%, var(--oc-surface-raised))` }}>
        <span className="grid size-8 place-items-center rounded-[10px] text-on-primary" style={{ background: hue }} aria-hidden="true">
          {icon}
        </span>
        <p className="font-semibold text-ink">{title}</p>
        {badge && <span className="ms-auto rounded-full border border-line-strong px-2.5 py-0.5 text-[11px] font-medium text-muted">{badge}</span>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/** Minimal list state with toggle/add/remove. Products persist via their own storage adapter. */
export function useList<T extends { id: string }>(initial: T[]) {
  const [items, setItems] = useState(initial);
  const update = useCallback((id: string, patch: Partial<T>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x))), []);
  const add = useCallback((item: T) => setItems((xs) => [...xs, item]), []);
  const remove = useCallback((id: string) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  return { items, setItems, update, add, remove };
}
