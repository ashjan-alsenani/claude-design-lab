"use client";

import { CaretDownIcon, FunnelSimpleIcon, XIcon } from "@phosphor-icons/react";
import { cx } from "./kit";

/** One compact dropdown filter (a native select, so it opens the phone's own picker). */
export function Filter<T extends string>({ label, value, onChange, options, all }: { label: string; value: T | "all"; onChange: (v: T | "all") => void; options: { value: T; label: string; count?: number }[]; all: string }) {
  const on = value !== "all";
  return (
    <label className={cx("relative flex h-11 min-w-0 items-center rounded-full border ps-4 pe-9 text-[13.5px] font-semibold transition-colors", on ? "border-[var(--qd-primary)] bg-[var(--qd-tint)] text-[var(--qd-primary-deep)]" : "border-[var(--qd-line)] bg-[var(--qd-paper)] text-[var(--qd-ink-soft)]")}>
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none truncate">{on ? options.find((o) => o.value === value)?.label : label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T | "all")} aria-label={label} className="absolute inset-0 cursor-pointer appearance-none opacity-0">
        <option value="all">{all}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
            {o.count !== undefined ? ` (${o.count})` : ""}
          </option>
        ))}
      </select>
      <CaretDownIcon size={15} weight="bold" className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2" />
    </label>
  );
}

/** A row of filters that wraps neatly, with a clear-all link when any is set. */
export function FilterBar({ children, active, onClear, clearLabel }: { children: React.ReactNode; active: boolean; onClear: () => void; clearLabel: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FunnelSimpleIcon size={18} className="shrink-0 text-[var(--qd-muted)]" aria-hidden="true" />
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:flex sm:flex-wrap">{children}</div>
      {active && (
        <button type="button" onClick={onClear} className="inline-flex h-11 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-[var(--qd-primary)]">
          <XIcon size={14} weight="bold" /> {clearLabel}
        </button>
      )}
    </div>
  );
}
