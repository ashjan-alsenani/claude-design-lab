import { motion } from 'motion/react'
import { ArrowRight, Plus, RotateCcw, Trash, Trophy } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import type { LabKey, MistakeTag } from '../data/types'
import { Segmented } from '../components/ui'
import { recordLab, update } from '../lib/store'
import { closeEnough, fmt, pareto, parseNumber, vitalFew, type ParetoRow } from '../lib/metrics'
import { Feedback, KnowledgeCheck, LabShell } from './kit'
import type { LabProps } from './registry'

const EASE = [0.23, 1, 0.32, 1] as const
const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

function logMistake(tag: MistakeTag) {
  update(p => {
    p.mistakes.push({ at: Date.now(), tag })
    if (p.mistakes.length > 600) p.mistakes.splice(0, p.mistakes.length - 600)
  })
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface Row { id: string; label: string; count: number; cost: number }
let rid = 0
const r = (label: string, count: number, cost: number): Row => ({ id: `p${++rid}`, label, count, cost })

interface Preset { id: string; name: string; unit: string; context: string; rows: () => Row[] }
const PRESETS: Preset[] = [
  { id: 'telecom', name: 'Telecom complaints', unit: 'complaints', context: 'Northwind Fibre logged one quarter of residential complaints. Cost per occurrence is the average handling, credit and truck-roll cost.', rows: () => [
    r('Repair took too long', 186, 35), r('Billing error', 142, 60), r('Missed appointment', 97, 120), r('Router setup problem', 64, 15), r('Unhelpful agent', 28, 10), r('Contract confusion', 21, 25), r('Other', 18, 20)] },
  { id: 'invoice', name: 'Invoice errors', unit: 'invoice exceptions', context: 'Halden Health accounts payable recorded a month of invoice exceptions. Cost per occurrence is the cost to resolve each one, including late payment penalties.', rows: () => [
    r('Wrong PO number', 118, 12), r('Missing approval', 96, 18), r('Price mismatch', 54, 40), r('Duplicate invoice', 22, 310), r('Wrong VAT code', 15, 25), r('Other', 11, 10)] },
  { id: 'desk', name: 'Service desk tickets', unit: 'tickets', context: 'An internal service desk categorised a month of tickets. Cost per occurrence is the average handling cost.', rows: () => [
    r('Password reset', 340, 5), r('Email access', 120, 15), r('Printer fault', 85, 20), r('VPN connection', 60, 30), r('Software install', 40, 25), r('Hardware failure', 25, 120), r('Other', 30, 10)] },
  { id: 'flat', name: 'Flat (no clear vital few)', unit: 'defects', context: 'An order-entry team counted defect types for a month. The categories are all of similar size.', rows: () => [
    r('Wrong tariff', 52, 20), r('Missing address detail', 49, 20), r('Wrong start date', 47, 20), r('Duplicate order', 45, 20), r('Unsigned contract', 44, 20), r('Wrong bundle', 41, 20), r('Other', 22, 20)] },
]

type Mode = 'count' | 'cost'
const val = (row: Row, mode: Mode) => (mode === 'count' ? row.count : row.count * row.cost)

interface PRow extends ParetoRow { id: string; name: string }

function build(data: Row[], mode: Mode): PRow[] {
  const valid = data.filter(d => val(d, mode) > 0)
  const otherRow = valid.find(d => d.label.trim().toLowerCase() === 'other')
  const rows = pareto(valid.map(d => ({ label: d === otherRow ? 'Other' : d.id, value: val(d, mode) })))
  return rows.map(p => {
    const src = p.label === 'Other' ? otherRow! : valid.find(d => d.id === p.label)!
    return { ...p, id: src.id, name: src.label.trim() || 'Unnamed' }
  })
}

const money = (v: number) => `$${fmt(v, 0)}`

/* ------------------------------------------------------------------ */
/* Chart                                                               */
/* ------------------------------------------------------------------ */

function ParetoChart({ rows, vital, mode, showCumLabels = true, unit }: { rows: PRow[]; vital: number; mode: Mode; showCumLabels?: boolean; unit: string }) {
  const L = 70, R = 650, T = 26, B = 290
  const total = rows.length ? rows[rows.length - 1].cumValue : 1
  const n = Math.max(1, rows.length)
  const slot = (R - L) / n
  const bw = slot * 0.72
  const yv = (v: number) => B - (v / total) * (B - T)
  const yp = (p: number) => B - (p / 100) * (B - T)
  const cx = (i: number) => L + slot * i + slot / 2
  const pts = rows.map((p, i) => `${cx(i)} ${yp(p.cumPercent)}`)
  const d = pts.length ? `M ${pts.join(' L ')}` : ''
  const tilt = n > 6
  const fmtV = (v: number) => (mode === 'cost' ? money(v) : fmt(v, 0))
  const vitalPct = vital > 0 ? rows[vital - 1].cumPercent : 0
  return (
    <svg viewBox="0 0 720 380" className="h-auto w-full" role="img"
      aria-label={`Pareto chart of ${unit} by ${mode === 'cost' ? 'cost' : 'count'}. ${rows.map(p => `${p.name} ${fmtV(p.value)}, cumulative ${fmt(p.cumPercent, 1)}%`).join('; ')}. The first ${vital} categories reach ${fmt(vitalPct, 1)}%.`}>
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <g key={f}>
          <line x1={L} x2={R} y1={B - f * (B - T)} y2={B - f * (B - T)} stroke="var(--line)" />
          <text x={L - 8} y={B - f * (B - T) + 4} textAnchor="end" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">{mode === 'cost' ? `$${fmt((total * f) / 1000, 1)}k` : fmt(total * f, 0)}</text>
          <text x={R + 8} y={B - f * (B - T) + 4} fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">{f * 100}%</text>
        </g>
      ))}
      <text x={14} y={T - 10} fontSize={12} fontWeight={600} fill="var(--ink-2)" fontFamily="var(--font-sans)">{mode === 'cost' ? 'Cost' : 'Count'}</text>
      <text x={706} y={T - 10} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--ink-2)" fontFamily="var(--font-sans)">Cumulative %</text>
      {rows.map((p, i) => {
        const isV = i < vital
        const h = Math.max(1, B - yv(p.value))
        return (
          <g key={p.id}>
            <motion.rect width={bw} rx={5} initial={false} animate={{ x: cx(i) - bw / 2, y: B - h, height: h }} transition={{ duration: 0.6, ease: EASE }}
              fill={isV ? 'var(--teal)' : 'var(--line-2)'} />
            <motion.text textAnchor="middle" fontSize={12} fontWeight={600} fill={h > 26 ? (isV ? 'var(--surface)' : 'var(--ink)') : 'var(--ink)'} fontFamily="var(--font-sans)" initial={false}
              animate={{ x: cx(i), y: h > 26 ? B - h + 18 : B - h - 8 }} transition={{ duration: 0.6, ease: EASE }}>{fmtV(p.value)}</motion.text>
            <motion.g initial={false} animate={{ x: cx(i), y: B + 16 }} transition={{ duration: 0.6, ease: EASE }}>
              <text textAnchor={tilt ? 'end' : 'middle'} transform={tilt ? 'rotate(-32)' : undefined} fontSize={12} fill={isV ? 'var(--ink)' : 'var(--ink-2)'} fontWeight={isV ? 600 : 400} fontFamily="var(--font-sans)">
                {p.name.length > (tilt ? 16 : Math.floor(slot / 7)) ? `${p.name.slice(0, tilt ? 15 : Math.floor(slot / 7) - 1)}.` : p.name}
              </text>
            </motion.g>
          </g>
        )
      })}
      <line x1={L} x2={R} y1={yp(80)} y2={yp(80)} stroke="var(--coral)" strokeWidth={1.5} strokeDasharray="6 5" />
      <text x={L + 4} y={yp(80) - 6} fontSize={12} fontWeight={600} fill="var(--coral)" fontFamily="var(--font-sans)">80%</text>
      {d && <motion.path d={d} fill="none" stroke="var(--violet)" strokeWidth={2.5} strokeLinejoin="round" initial={false} animate={{ d }} transition={{ duration: 0.6, ease: EASE }} />}
      {rows.map((p, i) => (
        <g key={`pt-${p.id}`}>
          <motion.circle r={4.5} fill="var(--surface)" stroke="var(--violet)" strokeWidth={2.5} initial={false} animate={{ cx: cx(i), cy: yp(p.cumPercent) }} transition={{ duration: 0.6, ease: EASE }} />
          {showCumLabels && (
            <motion.text fontSize={12} textAnchor="middle" fill="var(--violet)" fontWeight={600} fontFamily="var(--font-sans)" initial={false}
              animate={{ x: cx(i), y: Math.min(yp(p.cumPercent) - 10, (B - Math.max(1, B - yv(p.value))) - (B - yv(p.value) > 26 ? 10 : 24)) }} transition={{ duration: 0.6, ease: EASE }}>{fmt(p.cumPercent, 0)}%</motion.text>
          )}
        </g>
      ))}
      <line x1={L} x2={L} y1={T} y2={B} stroke="var(--line-2)" />
      <line x1={R} x2={R} y1={T} y2={B} stroke="var(--line-2)" />
      <line x1={L} x2={R} y1={B} y2={B} stroke="var(--ink-3)" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Challenge                                                           */
/* ------------------------------------------------------------------ */

interface Trap { value: number; tag: MistakeTag; msg: string }
interface NumQ { prompt: ReactNode; visual: ReactNode; answer: number; percent: boolean; explain: ReactNode; traps: Trap[]; hint: string; tag: MistakeTag }

const POOLS = [
  { unit: 'complaints', names: ['Slow repair', 'Billing error', 'Missed appointment', 'Router setup', 'No callback', 'Wrong tariff', 'Rude agent', 'Contract confusion'] },
  { unit: 'invoice exceptions', names: ['Wrong PO', 'Missing approval', 'Price mismatch', 'Duplicate', 'Wrong VAT code', 'Bad bank details', 'Late receipt'] },
  { unit: 'tickets', names: ['Password reset', 'Email access', 'Printer', 'VPN', 'Software install', 'Hardware fault', 'Phone setup'] },
]

function randomDataset(): { rows: Row[]; unit: string } {
  const pool = pick(POOLS)
  const n = ri(5, 7)
  const names = [...pool.names].sort(() => Math.random() - 0.5).slice(0, n)
  let v = ri(120, 260)
  const rows = names.map(nm => { const row = r(nm, v, 1); v = Math.max(4, Math.round(v * (0.45 + Math.random() * 0.4))); return row })
  if (Math.random() < 0.6) rows.push(r('Other', ri(6, 20), 1))
  return { rows, unit: pool.unit }
}

function makeQ(i: number): NumQ {
  const { rows: data, unit } = randomDataset()
  const rows = build(data, 'count')
  const vital = vitalFew(rows).length
  const total = rows[rows.length - 1].cumValue
  const otherV = rows.find(p => p.name === 'Other')?.value ?? 0
  const visual = <ParetoChart rows={rows} vital={0} mode="count" showCumLabels={false} unit={unit} />
  const kind = ['k80', 'cum', 'share', 'cum', 'k80'][i % 5]
  if (kind === 'k80') {
    const prev = vital > 1 ? rows[vital - 2] : null
    return {
      visual, percent: false, hint: 'e.g. 3', answer: vital, tag: 'pareto-reading',
      prompt: <>This chart shows {total} {unit}. What is the <strong>smallest number of categories</strong> that together account for <strong>at least 80%</strong>?</>,
      explain: <>Cumulative percentages: {rows.map((p, k) => <span key={p.id}>{k > 0 && ', '}{p.name} {fmt(p.cumPercent, 1)}%</span>)}. The first row at or above 80% is row {vital}, so the vital few are {vital} categories.</>,
      traps: prev ? [{ value: vital - 1, tag: 'pareto-reading', msg: `After ${vital - 1} categories you only have ${fmt(prev.cumPercent, 1)}%. Pick the first row that reaches 80% or more, not the one closest to 80%.` }] : [],
    }
  }
  if (kind === 'cum') {
    const j = ri(2, Math.min(4, rows.length - 1))
    const row = rows[j - 1]
    return {
      visual, percent: true, hint: 'e.g. 72.4', answer: row.cumPercent, tag: 'cumulative-percent',
      prompt: <>Bar counts are shown on the chart. What is the <strong>cumulative percentage</strong> at bar {j} ({row.name})? Give one decimal place.</>,
      explain: <>Running total {rows.slice(0, j).map(p => p.value).join(' + ')} = {row.cumValue}. Divide by the grand total {total} (including Other): {row.cumValue} / {total} = {fmt(row.cumPercent, 1)}%.</>,
      traps: [
        { value: row.percent, tag: 'cumulative-percent', msg: `That is ${row.name}'s own share. The cumulative percentage adds every bar up to and including this one.` },
        ...(otherV > 0 ? [{ value: (row.cumValue / (total - otherV)) * 100, tag: 'cumulative-percent' as MistakeTag, msg: 'You left Other out of the grand total. Divide by the total of every category, Other included.' }] : []),
      ],
    }
  }
  const j = ri(1, Math.min(3, rows.length))
  const row = rows[j - 1]
  return {
    visual, percent: true, hint: 'e.g. 31.5', answer: row.percent, tag: 'pareto-reading',
    prompt: <>What percentage of all {unit} does <strong>{row.name}</strong> account for on its own? Give one decimal place.</>,
    explain: <>{row.value} / {total} = {fmt(row.percent, 1)}%.</>,
    traps: [
      { value: row.cumPercent, tag: 'cumulative-percent', msg: 'That is the cumulative percentage at this bar. The question asks for this category alone.' },
      ...(otherV > 0 ? [{ value: (row.value / (total - otherV)) * 100, tag: 'cumulative-percent' as MistakeTag, msg: 'Include Other in the grand total.' }] : []),
    ],
  }
}

function Runner({ lab, make, total = 5 }: { lab: LabKey; make: (i: number) => NumQ; total?: number }) {
  const [round, setRound] = useState(0)
  const qs = useMemo(() => Array.from({ length: total }, (_, i) => make(i)), [round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [raw, setRaw] = useState('')
  const [res, setRes] = useState<{ ok: boolean; msg: string } | null>(null)
  const [marks, setMarks] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const q = qs[i]
  const submit = () => {
    let v = parseNumber(raw)
    if (v === null) { setRes({ ok: false, msg: 'Enter a number such as 3 or 72.4.' }); return }
    if (q.percent && v <= 1 && !raw.includes('%') && q.answer > 1) v *= 100
    const ok = q.percent ? Math.abs(v - q.answer) <= 0.15 : closeEnough(v, q.answer)
    let msg = ok ? 'Correct.' : 'Not quite.'
    if (!ok) {
      const t = q.traps.find(t => (q.percent ? Math.abs(v! - t.value) <= 0.15 : closeEnough(v!, t.value)))
      if (t) { msg = t.msg; logMistake(t.tag) } else logMistake(q.tag)
    }
    setRes({ ok, msg }); setMarks(m => [...m, ok])
  }
  const next = () => {
    if (i + 1 >= total) { recordLab(lab, Math.round((marks.filter(Boolean).length / total) * 100)); setDone(true) }
    else { setI(i + 1); setRaw(''); setRes(null) }
  }
  const again = () => { setRound(x => x + 1); setI(0); setRaw(''); setRes(null); setMarks([]); setDone(false) }
  if (done) {
    const right = marks.filter(Boolean).length
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-teal-soft p-5">
        <Trophy className="size-6 text-teal" />
        <div className="flex-1">
          <div className="font-display text-lg font-semibold text-ink">{right} of {total} correct</div>
          <p className="text-sm text-ink-2">{right === total ? 'You read every chart like an analyst.' : 'Review the explanations, then try new charts.'}</p>
        </div>
        <button className="btn btn-primary" onClick={again}><RotateCcw className="size-4" /> New challenge</button>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-ink-2">Chart {i + 1} of {total}</span>
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k < marks.length ? (marks[k] ? 'bg-good' : 'bg-bad') : k === i ? 'bg-violet' : 'bg-surface-3'}`} />)}
        </div>
      </div>
      <div className="rounded-2xl border border-line p-3">{q.visual}</div>
      <div className="rounded-2xl bg-surface-2/60 p-4 leading-relaxed text-ink">{q.prompt}</div>
      <form className="flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); if (!res) submit() }}>
        <div className="min-w-0 flex-1">
          <label className="label" htmlFor="par-ans">Your answer{q.percent ? ' (%)' : ''}</label>
          <input id="par-ans" className="field tabular" value={raw} onChange={e => setRaw(e.target.value)} disabled={!!res} placeholder={q.hint} autoComplete="off" />
        </div>
        {!res ? <button className="btn btn-primary" type="submit" disabled={!raw.trim()}>Check</button>
          : <button className="btn btn-primary" type="button" onClick={next}>{i + 1 >= total ? 'See score' : 'Next chart'} <ArrowRight className="size-4" /></button>}
      </form>
      {res && <Feedback ok={res.ok}><div className="font-semibold">{res.msg}</div><div className="mt-1 text-ink-2">{q.explain}</div></Feedback>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function ParetoLab({ embedded }: LabProps) {
  const [preset, setPreset] = useState<Preset>(PRESETS[0])
  const [data, setData] = useState<Row[]>(PRESETS[0].rows)
  const [mode, setMode] = useState<Mode>('count')

  const rows = build(data, mode)
  const vf = vitalFew(rows)
  const k = vf.length, n = rows.length
  const reached = k ? vf[k - 1].cumPercent : 0
  const flat = n > 0 && k / n > 0.6
  const freqTop = build(data, 'count')[0]?.name
  const costTop = build(data, 'cost')[0]?.name

  const load = (p: Preset) => { setPreset(p); setData(p.rows()); setMode('count') }
  const edit = (id: string, patch: Partial<Row>) => setData(d => d.map(x => (x.id === id ? { ...x, ...patch } : x)))
  const another = () => {
    const others = PRESETS.filter(p => p.id !== preset.id)
    const p = pick(others)
    setPreset(p)
    setData(p.rows().map(x => ({ ...x, count: Math.max(1, Math.round(x.count * (0.7 + Math.random() * 0.6))) })))
    setMode('count')
  }

  const explore = (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Preset datasets">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => load(p)} aria-pressed={preset.id === p.id}
              className={`chip cursor-pointer ${preset.id === p.id ? 'border-teal bg-teal-soft text-teal' : 'hover:border-line-2'}`}>{p.name}</button>
          ))}
        </div>
        <div className="ml-auto"><Segmented size="sm" label="Weight bars by" value={mode} onChange={setMode} options={[{ value: 'count', label: 'Frequency' }, { value: 'cost', label: 'Cost impact' }]} /></div>
      </div>

      <div className="rounded-2xl border border-line p-3">
        {n > 0 ? <ParetoChart rows={rows} vital={k} mode={mode} unit={preset.unit} /> : <p className="py-16 text-center text-sm text-ink-3">Enter at least one category with a value above zero.</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-4 rounded bg-teal" aria-hidden />vital few</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-4 rounded bg-line-2" aria-hidden />useful many</span>
          <span className="inline-flex items-center gap-1.5"><svg width="18" height="10" aria-hidden><line x1="0" y1="5" x2="18" y2="5" stroke="var(--violet)" strokeWidth="2.5" /></svg>cumulative %</span>
          <span>Left axis runs to the grand total so both scales line up. Other always sits last.</span>
        </div>
      </div>

      {n > 0 && (
        <div className={`rounded-2xl p-4 text-sm leading-relaxed ${flat ? 'bg-amber-soft/70' : 'bg-teal-soft/60'} text-ink-2`} role="status">
          <strong className="text-ink">{k} of {n} categories ({fmt((k / n) * 100, 0)}% of them) account for {fmt(reached, 1)}% of the {mode === 'cost' ? 'cost' : preset.unit}.</strong>{' '}
          {flat
            ? 'No clear vital few: the bars are of similar height, so attacking one category gains little. Try a different stratification (by region, product or shift) or drill into one category with a second-level Pareto.'
            : `That is not exactly 80/20, and it does not need to be. Pareto is a rule of thumb that says effort should start where the problem concentrates.`}
          {mode === 'cost' && freqTop && costTop && freqTop !== costTop && <> Weighted by cost, <strong className="text-ink">{costTop}</strong> leads instead of <strong className="text-ink">{freqTop}</strong>: the most frequent problem is not always the most expensive.</>}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">Your data</h3>
            <button className="btn btn-soft btn-sm" disabled={data.length >= 10} onClick={() => setData(d => [...d, r(`Category ${d.length + 1}`, 10, 20)])}><Plus className="size-4" /> Add category</button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[340px] text-sm">
              <thead className="bg-surface-2 text-left text-xs text-ink-2">
                <tr><th className="px-2 py-2">Category</th><th className="w-20 px-2 py-2">Count</th>{mode === 'cost' && <th className="w-24 px-2 py-2">Cost each ($)</th>}<th className="w-10 px-2 py-2"><span className="sr-only">Remove</span></th></tr>
              </thead>
              <tbody>
                {data.map(d => (
                  <tr key={d.id} className="border-t border-line">
                    <td className="px-2 py-1.5"><input aria-label="Category name" className="field h-9 py-1" value={d.label} onChange={e => edit(d.id, { label: e.target.value })} /></td>
                    <td className="px-2 py-1.5"><input aria-label={`Count for ${d.label}`} type="number" min={0} className="field tabular h-9 py-1" value={d.count} onChange={e => edit(d.id, { count: Math.max(0, Math.round(e.target.valueAsNumber || 0)) })} /></td>
                    {mode === 'cost' && <td className="px-2 py-1.5"><input aria-label={`Cost per occurrence for ${d.label}`} type="number" min={0} className="field tabular h-9 py-1" value={d.cost} onChange={e => edit(d.id, { cost: Math.max(0, e.target.valueAsNumber || 0) })} /></td>}
                    <td className="px-2 py-1.5"><button className="btn btn-ghost btn-icon btn-sm" aria-label={`Remove ${d.label}`} disabled={data.length <= 2} onClick={() => setData(x => x.filter(y => y.id !== d.id))}><Trash className="size-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-3">Name a row "Other" to keep it last whatever its size. {mode === 'count' ? 'Switch to Cost impact to edit cost per occurrence.' : 'Bar value = count x cost per occurrence.'}</p>
        </div>
        <div>
          <h3 className="mb-2 font-display text-lg font-semibold text-ink">Pareto table</h3>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[380px] text-sm">
              <thead className="bg-surface-2 text-left text-xs text-ink-2">
                <tr><th className="px-3 py-2">Category</th><th className="px-3 py-2 text-right">{mode === 'cost' ? 'Cost' : 'Count'}</th><th className="px-3 py-2 text-right">%</th><th className="px-3 py-2 text-right">Cum.</th><th className="px-3 py-2 text-right">Cum. %</th></tr>
              </thead>
              <tbody className="tabular">
                {rows.map((p, i) => (
                  <motion.tr layout key={p.id} transition={{ duration: 0.4, ease: EASE }} className={`border-t border-line ${i < k ? 'bg-teal-soft/40' : ''}`}>
                    <td className="px-3 py-2 text-ink">{p.name}</td>
                    <td className="px-3 py-2 text-right">{mode === 'cost' ? money(p.value) : fmt(p.value, 0)}</td>
                    <td className="px-3 py-2 text-right">{fmt(p.percent, 1)}</td>
                    <td className="px-3 py-2 text-right">{mode === 'cost' ? money(p.cumValue) : fmt(p.cumValue, 0)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmt(p.cumPercent, 1)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-3">Cumulative % comes from the running total divided by the grand total, never from adding rounded percentages, so the last row is exactly 100%.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-violet-soft/50 p-4 text-sm leading-relaxed text-ink-2">
        <h3 className="mb-1 font-display text-base font-semibold text-ink">Why is it rarely exactly 80/20?</h3>
        The 80/20 split is an observation about many real processes, not a law. Your data might show 3 of 7 categories giving 74%, or 2 of 9 giving 85%. The two numbers do not have to add to 100 either: they count different things (categories versus occurrences). What matters is whether a small group of categories clearly dominates. Pareto shows <em>where to look first</em>; it does not prove <em>why</em> the problem happens. That is Analyze work.
      </div>
    </div>
  )

  return (
    <LabShell
      lab="pareto"
      embedded={embedded}
      instructions="Pick a preset or edit the table: rename, add or remove categories and change the counts. The chart re-sorts itself, recalculates the cumulative line and highlights the vital few that first reach 80%. Switch to Cost impact to weight each category by its cost per occurrence."
      scenario={preset.context}
      onReset={() => load(PRESETS[0])}
      onNewExample={another}
      explore={explore}
      challenge={
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-2">Five randomised charts. Read the bar counts to find the vital few, a cumulative percentage or a single category's share. Percentages within 0.15 points count.</p>
          <Runner lab="pareto" make={makeQ} />
        </div>
      }
      check={<KnowledgeCheck lab="pareto" items={[
        { q: 'Where does the "Other" category go on a Pareto chart?', options: ['First, because it is often large', 'In size order like any category', 'Always last', 'It is left off the chart'], answer: 2, why: 'Other is a mix of small categories, so it always goes last even if it is bigger than some named bars. It still counts in the grand total.' },
        { q: 'Categories have cumulative percentages of 45%, 71%, 84% and 93%. How many make up the vital few at 80%?', options: ['2', '3', '4', 'It depends on the costs'], answer: 1, why: 'Choose the first row that reaches at least 80%: the third, at 84%. The second (71%) has not reached 80%.' },
        { q: 'What does the right-hand axis of a Pareto chart show?', options: ['Counts', 'Cost', 'Cumulative percentage from 0% to 100%', 'Time'], answer: 2, why: 'Counts (or cost) go on the left axis; the cumulative percentage line uses the right axis.' },
        { q: 'A frequency Pareto and a cost-weighted Pareto rank different categories first. What should the team do?', options: ['Always use frequency', 'Choose the view that matches the project goal, such as reducing cost', 'Average the two charts', 'Discard the data'], answer: 1, why: 'The most frequent problem is not always the most expensive. Pick the weighting that reflects the impact the project is trying to change.' },
      ]} />}
    />
  )
}
