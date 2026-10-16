/**
 * Shared building blocks for every interactive lab.
 * Every lab = <LabShell> with an Explore tab (the simulation), a Challenge tab and
 * a Knowledge check tab. Labs call recordLab() when the learner finishes a challenge.
 */
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, CircleX, GripVertical, RotateCcw, Shuffle, Trophy } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import type { LabKey, MistakeTag } from '../data/types'
import { Rich } from '../components/Rich'
import { Segmented } from '../components/ui'
import { recordLab, update } from '../lib/store'

export type LabTab = 'explore' | 'challenge' | 'check'

export function LabShell({
  lab, instructions, scenario, explore, challenge, check, embedded, onReset, onNewExample, tab: tabProp, onTab,
}: {
  lab: LabKey
  instructions: ReactNode
  scenario?: ReactNode
  explore: ReactNode
  challenge?: ReactNode
  check?: ReactNode
  embedded?: boolean
  onReset?: () => void
  onNewExample?: () => void
  tab?: LabTab
  onTab?: (t: LabTab) => void
}) {
  const [own, setOwn] = useState<LabTab>('explore')
  const tab = tabProp ?? own
  const setTab = onTab ?? setOwn
  const options: { value: LabTab; label: string }[] = [{ value: 'explore', label: 'Explore' }]
  if (challenge) options.push({ value: 'challenge', label: 'Challenge mode' })
  if (check) options.push({ value: 'check', label: 'Knowledge check' })
  return (
    <div className={`rounded-3xl border border-line bg-surface font-sans shadow-md ${embedded ? '' : ''}`} data-lab={lab}>
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <Segmented label="Lab mode" value={tab} onChange={setTab} options={options} size="sm" />
        <div className="flex flex-wrap gap-2">
          {onNewExample && tab === 'explore' && <button className="btn btn-soft btn-sm" onClick={onNewExample}><Shuffle className="size-4" /> Try another example</button>}
          {onReset && tab === 'explore' && <button className="btn btn-ghost btn-sm" onClick={onReset}><RotateCcw className="size-4" /> Reset</button>}
        </div>
      </div>
      {tab === 'explore' && (
        <div className="space-y-2 border-b border-line bg-surface-2/60 px-4 py-4 text-[0.95rem] leading-relaxed text-ink-2 sm:px-5">
          <div><span className="font-semibold text-ink">How it works: </span>{instructions}</div>
          {scenario && <div><span className="font-semibold text-ink">Scenario: </span>{scenario}</div>}
        </div>
      )}
      <div className="p-4 sm:p-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === 'explore' && explore}
            {tab === 'challenge' && challenge}
            {tab === 'check' && check}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export interface CheckItem { q: string; options: string[]; answer: number; why: string }

/** A short multiple-choice knowledge check. Records completion when every item is answered. */
export function KnowledgeCheck({ lab, items }: { lab: LabKey; items: CheckItem[] }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => items.map(() => null))
  const done = picked.every(p => p !== null)
  const score = picked.filter((p, i) => p === items[i].answer).length
  return (
    <div className="space-y-5">
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl border border-line p-4">
          <div className="font-semibold text-ink"><span className="tabular mr-2 text-ink-3">{i + 1}.</span><Rich text={it.q} /></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {it.options.map((o, j) => {
              const chosen = picked[i] === j
              const show = picked[i] !== null
              const correct = j === it.answer
              return (
                <button
                  key={j}
                  disabled={show}
                  onClick={() => {
                    const next = [...picked]; next[i] = j; setPicked(next)
                    if (next.every(p => p !== null)) recordLab(lab, Math.round(next.filter((p, k) => p === items[k].answer).length / items.length * 100))
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${show && correct ? 'border-good bg-good-soft text-ink' : show && chosen ? 'border-bad bg-bad-soft text-ink' : 'border-line hover:border-violet hover:bg-violet-soft/40'} disabled:cursor-default`}
                >
                  <Rich text={o} />
                </button>
              )
            })}
          </div>
          {picked[i] !== null && (
            <p className={`mt-3 flex gap-2 text-sm leading-relaxed ${picked[i] === it.answer ? 'text-good' : 'text-bad'}`}>
              {picked[i] === it.answer ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <CircleX className="mt-0.5 size-4 shrink-0" />}
              <span className="text-ink-2"><Rich text={it.why} /></span>
            </p>
          )}
        </div>
      ))}
      {done && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-violet-soft p-4">
          <Trophy className="size-5 text-violet" />
          <span className="font-semibold text-ink">You scored {score} of {items.length}.</span>
          <button className="btn btn-soft btn-sm ml-auto" onClick={() => setPicked(items.map(() => null))}><RotateCcw className="size-4" /> Try again</button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Classifier game: drag (or tap) items into buckets, then check.      */
/* ------------------------------------------------------------------ */

export interface ClassItem { id: string; text: string; bucket: string; why: string; mistake?: MistakeTag }
export interface Bucket { id: string; label: string; hint?: string; tone: 'violet' | 'teal' | 'coral' | 'amber' | 'sky' | 'indigo' }

const TONE_CLS = {
  violet: 'border-violet/40 bg-violet-soft/50', teal: 'border-teal/40 bg-teal-soft/50', coral: 'border-coral/40 bg-coral-soft/50',
  amber: 'border-amber/40 bg-amber-soft/50', sky: 'border-sky/40 bg-sky-soft/50', indigo: 'border-indigo/40 bg-indigo-soft/50',
} as const
const TONE_TEXT = { violet: 'text-violet', teal: 'text-teal', coral: 'text-coral', amber: 'text-amber', sky: 'text-sky', indigo: 'text-indigo' } as const

function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] }
  return r
}

/**
 * Accessible sorting game. Tap an item, then tap a bucket (or drag on desktop).
 * `count` limits how many items from the pool appear per round.
 */
export function ClassifierGame({ lab, items, buckets, count = 8, timed = false, onFinish }: { lab: LabKey; items: ClassItem[]; buckets: Bucket[]; count?: number; timed?: boolean; onFinish?: (score: number, total: number) => void }) {
  const [round, setRound] = useState(0)
  const pool = useMemo(() => shuffle(items).slice(0, count), [items, count, round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [placed, setPlaced] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [dragId, setDragId] = useState<string | null>(null)

  const unplaced = pool.filter(i => !placed[i.id])
  const correct = pool.filter(i => placed[i.id] === i.bucket).length

  const place = (itemId: string, bucketId: string) => {
    if (checked) return
    setPlaced(p => ({ ...p, [itemId]: bucketId }))
    setSelected(null)
  }
  const check = () => {
    setChecked(true)
    const secs = Math.round((Date.now() - startedAt) / 1000)
    const score = Math.round((correct / pool.length) * 100)
    recordLab(lab, timed ? Math.max(0, score - Math.max(0, secs - 60)) : score)
    update(p => {
      for (const it of pool) if (placed[it.id] !== it.bucket && it.mistake) p.mistakes.push({ at: Date.now(), tag: it.mistake })
    })
    onFinish?.(correct, pool.length)
  }
  const again = () => { setRound(r => r + 1); setPlaced({}); setChecked(false); setSelected(null); setStartedAt(Date.now()) }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-3">
        <span>{checked ? `${correct} of ${pool.length} correct` : `${pool.length - unplaced.length} of ${pool.length} placed`}{timed && !checked ? ' · timed round: speed counts after 60 seconds' : ''}</span>
        <span className="hidden sm:inline">Tap a card, then tap a bucket. On desktop you can also drag.</span>
      </div>
      <div className="flex min-h-14 flex-wrap gap-2 rounded-2xl border border-dashed border-line-2 p-3" aria-label="Items to sort">
        {unplaced.length === 0 && !checked && <span className="text-sm text-ink-3">All placed. Check your answers when ready.</span>}
        {unplaced.map(it => (
          <button
            key={it.id}
            draggable
            onDragStart={() => setDragId(it.id)}
            onDragEnd={() => setDragId(null)}
            onClick={() => setSelected(s => (s === it.id ? null : it.id))}
            aria-pressed={selected === it.id}
            className={`flex max-w-full items-start gap-1.5 rounded-xl border px-3 py-2 text-left text-sm shadow-sm transition-all ${selected === it.id ? 'border-violet bg-violet-soft ring-2 ring-violet/30' : 'border-line bg-surface hover:-translate-y-0.5 hover:border-line-2'}`}
          >
            <GripVertical className="mt-0.5 hidden size-3.5 shrink-0 text-ink-3 sm:block" /><span><Rich text={it.text} noLinks /></span>
          </button>
        ))}
      </div>
      <div className={`mt-4 grid gap-3 ${buckets.length === 2 ? 'sm:grid-cols-2' : buckets.length === 3 ? 'md:grid-cols-3' : buckets.length === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {buckets.map(b => {
          const inB = pool.filter(i => placed[i.id] === b.id)
          return (
            <div
              key={b.id}
              role="button"
              tabIndex={0}
              aria-label={`Place selected item in ${b.label}`}
              onClick={() => selected && place(selected, b.id)}
              onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && selected) { e.preventDefault(); place(selected, b.id) } }}
              onDragOver={e => e.preventDefault()}
              onDrop={() => dragId && place(dragId, b.id)}
              className={`min-h-32 rounded-2xl border-2 p-3 transition-colors ${TONE_CLS[b.tone]} ${selected ? 'cursor-pointer ring-2 ring-violet/20' : ''}`}
            >
              <div className={`font-display font-semibold ${TONE_TEXT[b.tone]}`}>{b.label}</div>
              {b.hint && <div className="text-xs text-ink-3">{b.hint}</div>}
              <ul className="mt-2 space-y-1.5">
                {inB.map(it => {
                  const ok = it.bucket === b.id
                  return (
                    <li key={it.id}>
                      <button
                        onClick={e => { e.stopPropagation(); if (!checked) setPlaced(p => { const n = { ...p }; delete n[it.id]; return n }) }}
                        className={`w-full rounded-lg border px-2.5 py-1.5 text-left text-[13px] ${checked ? (ok ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft') : 'border-line bg-surface'}`}
                        aria-label={checked ? undefined : 'Remove from bucket'}
                      >
                        <span className="flex gap-1.5">
                          {checked && (ok ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-good" /> : <CircleX className="mt-0.5 size-3.5 shrink-0 text-bad" />)}
                          <span><Rich text={it.text} noLinks /></span>
                        </span>
                        {checked && <span className="mt-1 block text-xs leading-relaxed text-ink-2">{!ok && <strong>Belongs in {buckets.find(x => x.id === it.bucket)?.label}. </strong>}<Rich text={it.why} noLinks /></span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!checked && <button className="btn btn-primary" disabled={unplaced.length > 0} onClick={check}>Check answers</button>}
        {checked && <button className="btn btn-primary" onClick={again}><Shuffle className="size-4" /> New round</button>}
        {!checked && Object.keys(placed).length > 0 && <button className="btn btn-ghost" onClick={() => setPlaced({})}>Clear</button>}
      </div>
    </div>
  )
}

/** Labelled number input with optional unit suffix. */
export function NumberField({ label, value, onChange, min = 0, max, step = 1, suffix, id }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string; id: string }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} type="number" inputMode="decimal" className="field tabular pr-14" value={Number.isFinite(value) ? value : ''} min={min} max={max} step={step}
          onChange={e => { const v = e.target.valueAsNumber; onChange(Number.isFinite(v) ? v : 0) }} />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-3">{suffix}</span>}
      </div>
    </div>
  )
}

/** Labelled slider with live value. */
export function Slider({ label, value, onChange, min, max, step = 1, format, id }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; format?: (v: number) => string; id: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="label mb-0" htmlFor={id}>{label}</label>
        <span className="tabular text-sm font-semibold text-ink">{format ? format(value) : value}</span>
      </div>
      <input id={id} type="range" className="mt-2 w-full accent-[var(--violet)]" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  )
}

/** Inline feedback line. */
export function Feedback({ ok, children }: { ok: boolean | null; children: ReactNode }) {
  if (ok === null) return null
  return (
    <div className={`mt-3 flex gap-2 rounded-xl px-3 py-2.5 text-sm leading-relaxed ${ok ? 'bg-good-soft text-ink' : 'bg-bad-soft text-ink'}`} role="status">
      {ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-good" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-bad" />}
      <div>{children}</div>
    </div>
  )
}

export { shuffle }
