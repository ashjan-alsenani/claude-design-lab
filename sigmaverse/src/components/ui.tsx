import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { TONE, type Tone } from '../data/curriculum'
import { useReduced } from '../lib/motion'

export function PageHeader({ title, lead, children, icon }: { title: string; lead?: ReactNode; children?: ReactNode; icon?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          {icon && <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-soft text-indigo">{icon}</span>}
          <h1 className="text-3xl font-bold text-ink md:text-4xl">{title}</h1>
        </div>
        {lead && <p className="mt-3 text-base leading-relaxed text-ink-2 md:text-lg">{lead}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  )
}

export function Section({ title, children, action, className = '' }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={`mt-10 ${className}`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-ink md:text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Meter({ value, tone = 'violet', label, className = '' }: { value: number; tone?: Tone; label?: string; className?: string }) {
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-3 ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} aria-label={label}>
      <div className={`h-full rounded-full ${TONE[tone].bg} transition-[width] duration-700 ease-[var(--ease-out)]`} style={{ width: `${v * 100}%` }} />
    </div>
  )
}

export function Ring({ value, size = 64, stroke = 6, tone = 'violet', children }: { value: number; size?: number; stroke?: number; tone?: Tone; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TONE[tone].hex} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: 'stroke-dashoffset 900ms var(--ease-out)' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export function Disclosure({ title, children, defaultOpen = false, icon, tone }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; icon?: ReactNode; tone?: Tone }) {
  const [open, setOpen] = useState(defaultOpen)
  const reduced = useReduced()
  const id = useId()
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-surface ${tone ? '' : ''}`}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left font-sans font-semibold text-ink hover:bg-surface-2">
        {icon && <span className={tone ? TONE[tone].text : 'text-violet'}>{icon}</span>}
        <span className="flex-1">{title}</span>
        <ChevronDown className={`size-4 shrink-0 text-ink-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={reduced ? undefined : { height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}>
            <div className="border-t border-line px-4 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Segmented<T extends string | number>({ value, onChange, options, label, size = 'md' }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; label: string; size?: 'sm' | 'md' }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-line bg-surface-2 p-1">
      {options.map(o => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg font-semibold transition-colors duration-150 ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'} ${value === o.value ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Empty({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-2 bg-surface/60 px-6 py-10 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-violet-soft text-violet">{icon}</span>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      {children && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-2">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function StatusBadge({ status }: { status: 'source-supported' | 'partial-source' | 'supplementary' }) {
  const map = {
    'source-supported': { label: 'Source supported', cls: 'bg-good-soft text-good' },
    'partial-source': { label: 'Partly source supported', cls: 'bg-sky-soft text-sky' },
    supplementary: { label: 'Supplementary content', cls: 'bg-amber-soft text-amber' },
  }[status]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map.cls}`}>{map.label}</span>
}

export function DifficultyBadge({ d }: { d: string }) {
  const map: Record<string, string> = {
    beginner: 'bg-teal-soft text-teal', intermediate: 'bg-sky-soft text-sky', advanced: 'bg-violet-soft text-violet', trap: 'bg-coral-soft text-coral', master: 'bg-amber-soft text-amber',
  }
  const label = d === 'trap' ? 'Exam trap' : d === 'master' ? 'Master challenge' : d[0].toUpperCase() + d.slice(1)
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[d] ?? 'bg-surface-2 text-ink-2'}`}>{label}</span>
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded-md border border-line-2 bg-surface px-1.5 py-0.5 font-mono text-[11px] font-medium text-ink-2">{children}</kbd>
}
