import { motion } from 'motion/react'
import { ArrowRight, Clock, Plus, RotateCcw, Trash, Trophy } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import type { LabKey, MistakeTag } from '../data/types'
import { Tex } from '../components/Math'
import { StatusBadge, Segmented } from '../components/ui'
import { recordLab, update } from '../lib/store'
import { closeEnough, fmt, littleLeadTime, parseNumber, pct, taktTime } from '../lib/metrics'
import { Feedback, KnowledgeCheck, LabShell, NumberField } from './kit'
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

/** Minutes to "H h M min". */
function hm(mins: number) {
  const total = Math.round(mins)
  const h = Math.floor(total / 60), m = total % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}
function clock(startMin: number, plus: number) {
  const t = Math.round(startMin + plus)
  const day = Math.floor(t / 1440), r = t % 1440
  const s = `${String(Math.floor(r / 60)).padStart(2, '0')}:${String(r % 60).padStart(2, '0')}`
  return day > 0 ? `${s} (+${day} day${day > 1 ? 's' : ''})` : s
}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

type Unit = 'min' | 'h'
interface Stage { id: string; name: string; minutes: number; unit: Unit; kind: 'work' | 'wait' }
let sid = 0
const st = (name: string, minutes: number, unit: Unit, kind: 'work' | 'wait'): Stage => ({ id: `c${++sid}`, name, minutes, unit, kind })

const DEFAULTS = () => [
  st('Log the fault', 12, 'min', 'work'),
  st('Diagnose remotely', 45, 'min', 'work'),
  st('Wait for engineer and part', 390, 'h', 'wait'),
  st('Repair on site', 75, 'h', 'work'),
  st('Confirm with customer', 20, 'min', 'work'),
]

function randomStages(): Stage[] {
  return [
    st('Log the fault', ri(5, 20), 'min', 'work'),
    st('Diagnose remotely', ri(2, 10) * 10, pick<Unit>(['min', 'h']), 'work'),
    st('Wait for engineer and part', ri(6, 40) * 15, 'h', 'wait'),
    st('Repair on site', ri(3, 12) * 15, pick<Unit>(['min', 'h']), 'work'),
    st('Confirm with customer', ri(1, 8) * 5, 'min', 'work'),
  ]
}

const shown = (s: Stage) => (s.unit === 'h' ? Math.round((s.minutes / 60) * 10000) / 10000 : s.minutes)

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

function Timeline({ stages, start }: { stages: Stage[]; start: number }) {
  const total = stages.reduce((s, x) => s + x.minutes, 0) || 1
  const W = 680
  let acc = 0
  const segs = stages.map(s => { const x = 20 + (acc / total) * W; const w = (s.minutes / total) * W; acc += s.minutes; return { s, x, w } })
  return (
    <svg viewBox="0 0 720 132" className="h-auto w-full" role="img"
      aria-label={`Ticket timeline from ${clock(start, 0)} to ${clock(start, total)}, total ${hm(total)}. ${stages.map(s => `${s.name} ${hm(s.minutes)} (${s.kind === 'work' ? 'working' : 'waiting'})`).join(', ')}.`}>
      {segs.map(({ s, x, w }) => (
        <g key={s.id}>
          <motion.rect y={34} height={46} rx={6} initial={false} animate={{ x, width: Math.max(1, w - 2) }} transition={{ duration: 0.6, ease: EASE }}
            fill={s.kind === 'work' ? 'var(--teal)' : 'var(--amber-soft)'} stroke={s.kind === 'work' ? 'none' : 'var(--amber)'} strokeDasharray={s.kind === 'work' ? undefined : '5 4'} />
          {w > 70 && (
            <motion.text y={62} textAnchor="middle" fontSize={12} fontWeight={600} initial={false} animate={{ x: x + w / 2 }} transition={{ duration: 0.6, ease: EASE }}
              fill={s.kind === 'work' ? 'var(--surface)' : 'var(--ink)'} fontFamily="var(--font-sans)">{hm(s.minutes)}</motion.text>
          )}
        </g>
      ))}
      <text x={20} y={22} fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">Logged {clock(start, 0)}</text>
      <text x={700} y={22} textAnchor="end" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">Closed {clock(start, total)}</text>
      <line x1={20} x2={700} y1={96} y2={96} stroke="var(--line-2)" />
      <text x={360} y={120} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">Cycle time {hm(total)} ({fmt(total / 60, 2)} h)</text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Challenge                                                           */
/* ------------------------------------------------------------------ */

interface Trap { value: number; tag: MistakeTag; msg: string }
interface NumQ { prompt: ReactNode; answer: number; unit: string; explain: ReactNode; traps: Trap[]; hint: string }

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
    const v = parseNumber(raw)
    if (v === null) { setRes({ ok: false, msg: 'Enter a number, for example 135 or 2.25.' }); return }
    const ok = closeEnough(v, q.answer, 0.005, 0.011)
    let msg = ok ? 'Correct.' : 'Not quite.'
    if (!ok) { const t = q.traps.find(t => closeEnough(v, t.value, 0.005, 0.011)); if (t) { msg = t.msg; logMistake(t.tag) } }
    setRes({ ok, msg }); setMarks(m => [...m, ok])
  }
  const next = () => {
    if (i + 1 >= total) { recordLab(lab, Math.round((marks.filter(Boolean).length / total) * 100)); setDone(true) }
    else { setI(i + 1); setRaw(''); setRes(null) }
  }
  const again = () => { setRound(r => r + 1); setI(0); setRaw(''); setRes(null); setMarks([]); setDone(false) }
  if (done) {
    const right = marks.filter(Boolean).length
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-teal-soft p-5">
        <Trophy className="size-6 text-teal" />
        <div className="flex-1">
          <div className="font-display text-lg font-semibold text-ink">{right} of {total} correct</div>
          <p className="text-sm text-ink-2">{right === total ? 'Units under control: 60 minutes per hour, every time.' : 'Check the worked conversions, then try a new set.'}</p>
        </div>
        <button className="btn btn-primary" onClick={again}><RotateCcw className="size-4" /> New challenge</button>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-ink-2">Question {i + 1} of {total}</span>
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k < marks.length ? (marks[k] ? 'bg-good' : 'bg-bad') : k === i ? 'bg-violet' : 'bg-surface-3'}`} />)}
        </div>
      </div>
      <div className="rounded-2xl border border-line p-4 leading-relaxed text-ink">{q.prompt}</div>
      <form className="flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); if (!res) submit() }}>
        <div className="relative min-w-0 flex-1">
          <label className="label" htmlFor="cyc-ans">Your answer ({q.unit})</label>
          <input id="cyc-ans" className="field tabular" value={raw} onChange={e => setRaw(e.target.value)} disabled={!!res} placeholder={q.hint} autoComplete="off" />
        </div>
        {!res ? <button className="btn btn-primary" type="submit" disabled={!raw.trim()}>Check</button>
          : <button className="btn btn-primary" type="button" onClick={next}>{i + 1 >= total ? 'See score' : 'Next question'} <ArrowRight className="size-4" /></button>}
      </form>
      {res && <Feedback ok={res.ok}><div className="font-semibold">{res.msg}</div><div className="mt-1 text-ink-2">{q.explain}</div></Feedback>}
    </div>
  )
}

/** Reads "h.dd hours" the wrong way: 1.75 h as 1 h 75 min. */
const misread = (h: number) => Math.floor(h) * 60 + Math.round((h - Math.floor(h)) * 100)

function makeQ(i: number): NumQ {
  const kind = ['sum', 'decimal', 'average', 'takt', 'lead'][i % 5]
  if (kind === 'sum') {
    const log = ri(5, 25), diagH = pick([0.25, 0.75, 1.25, 1.5, 1.75, 2.25]), waitH = ri(2, 6), waitM = ri(1, 11) * 5, rep = ri(40, 130)
    const ans = log + diagH * 60 + waitH * 60 + waitM + rep
    return {
      unit: 'minutes', hint: 'e.g. 412', answer: ans,
      prompt: <>A broadband fault ticket at Northwind Fibre: logging took <strong>{log} min</strong>, remote diagnosis <strong>{diagH} h</strong>, waiting for an engineer <strong>{waitH} h {waitM} min</strong> and the repair <strong>{rep} min</strong>. What is the total cycle time in minutes?</>,
      explain: <Tex tex={`${log} + (${diagH} \\times 60) + (${waitH} \\times 60 + ${waitM}) + ${rep} = ${log} + ${diagH * 60} + ${waitH * 60 + waitM} + ${rep} = ${ans}\\text{ min}`} />,
      traps: [{ value: log + misread(diagH) + waitH * 60 + waitM + rep, tag: 'time-units', msg: `You read ${diagH} h as ${Math.floor(diagH)} h ${Math.round((diagH % 1) * 100)} min. Decimal hours multiply by 60: ${diagH} h is ${diagH * 60} min.` },
        { value: ans / 60, tag: 'time-units', msg: 'That is the total in hours. The question asks for minutes.' }],
    }
  }
  if (kind === 'decimal') {
    const h = ri(3, 30) + pick([0.15, 0.25, 0.4, 0.6, 0.75, 0.85, 0.9])
    const mins = Math.round((h % 1) * 60)
    return {
      unit: 'minutes', hint: 'e.g. 45', answer: mins,
      prompt: <>The service desk report shows an average restoration time of <strong>{fmt(h, 2)} hours</strong>. Written as hours and minutes this is {Math.floor(h)} hours and how many minutes?</>,
      explain: <Tex tex={`0.${String(Math.round((h % 1) * 100)).padStart(2, '0')} \\times 60 = ${mins}\\text{ min, so } ${fmt(h, 2)}\\text{ h} = ${Math.floor(h)}\\text{ h } ${mins}\\text{ min}`} />,
      traps: [{ value: Math.round((h % 1) * 100), tag: 'time-units', msg: 'The digits after the decimal point are hundredths of an hour, not minutes. Multiply the decimal part by 60.' }],
    }
  }
  if (kind === 'average') {
    const a = pick([1.25, 1.5, 1.75, 2.5]), b = ri(4, 16) * 5, cH = ri(1, 3), cM = ri(1, 11) * 5
    const totalMin = a * 60 + b + cH * 60 + cM
    const ans = totalMin / 3 / 60
    return {
      unit: 'hours', hint: 'e.g. 1.67', answer: ans,
      prompt: <>Three invoice disputes took <strong>{a} h</strong>, <strong>{b} min</strong> and <strong>{cH} h {cM} min</strong> to resolve. What is the average cycle time in <strong>hours</strong>? Give two decimal places.</>,
      explain: <>Convert first: {a * 60} + {b} + {cH * 60 + cM} = {totalMin} min. Average {fmt(totalMin / 3, 2)} min, divided by 60 = {fmt(ans, 2)} h ({hm(totalMin / 3)}).</>,
      traps: [{ value: totalMin / 3, tag: 'time-units', msg: 'That is the average in minutes. Divide by 60 for hours.' },
        { value: (a + b + cH + cM / 100) / 3, tag: 'time-units', msg: 'You averaged numbers in different units. Convert every time to one unit before averaging.' }],
    }
  }
  if (kind === 'takt') {
    const availH = pick([7, 7.5, 8, 10]), demand = pick([60, 75, 90, 120, 150, 210])
    const ans = taktTime(availH * 60, demand)
    return {
      unit: 'minutes per ticket', hint: 'e.g. 3.5', answer: ans,
      prompt: <>Supplementary: the repair desk is open <strong>{availH} hours</strong> a day and customers raise <strong>{demand} tickets</strong> a day. What is the takt time in minutes per ticket?</>,
      explain: <Tex tex={`\\text{Takt} = \\frac{${availH} \\times 60}{${demand}} = \\frac{${availH * 60}}{${demand}} = ${fmt(ans, 2)}\\text{ min per ticket}`} />,
      traps: [{ value: taktTime(availH, demand), tag: 'time-units', msg: 'That is in hours. Convert the available time to minutes first.' },
        { value: demand / (availH * 60), tag: 'cycle-time', msg: 'You inverted the ratio. Takt time is available time divided by demand.' }],
    }
  }
  const wip = ri(8, 40) * 10, thr = pick([20, 25, 30, 40, 50, 60, 80])
  const ans = littleLeadTime(wip, thr)
  return {
    unit: 'days', hint: 'e.g. 4.5', answer: ans,
    prompt: <>Supplementary: Halden Health has <strong>{wip} invoices</strong> in progress and the team completes <strong>{thr} invoices a day</strong>. Using Little's Law, what is the average lead time in days?</>,
    explain: <Tex tex={`\\text{Lead time} = \\frac{\\text{WIP}}{\\text{throughput}} = \\frac{${wip}}{${thr}} = ${fmt(ans, 2)}\\text{ days}`} />,
    traps: [{ value: thr / wip, tag: 'cycle-time', msg: 'You divided throughput by WIP. Lead time is WIP divided by throughput.' }],
  }
}

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function CycleLab({ embedded }: LabProps) {
  const [stages, setStages] = useState<Stage[]>(DEFAULTS)
  const [start, setStart] = useState(8 * 60)
  const [availH, setAvailH] = useState(8)
  const [demand, setDemand] = useState(60)
  const [done, setDone] = useState(52)
  const [wip, setWip] = useState(180)

  const total = stages.reduce((s, x) => s + x.minutes, 0)
  const work = stages.filter(s => s.kind === 'work').reduce((s, x) => s + x.minutes, 0)
  const wait = total - work

  const edit = (id: string, p: Partial<Stage>) => setStages(s => s.map(x => (x.id === id ? { ...x, ...p } : x)))
  const reset = () => { setStages(DEFAULTS()); setStart(8 * 60); setAvailH(8); setDemand(60); setDone(52); setWip(180) }
  const another = () => {
    setStages(randomStages()); setStart(ri(7, 16) * 60 + pick([0, 15, 30, 45]))
    setAvailH(pick([7.5, 8, 10, 12])); setDemand(ri(4, 16) * 5); setDone(ri(4, 16) * 5); setWip(ri(6, 30) * 10)
  }

  const supOk = availH > 0 && demand > 0 && done > 0 && wip >= 0
  const takt = supOk ? taktTime(availH * 60, demand) : 0
  const interval = supOk ? taktTime(availH * 60, done) : 0
  const lead = supOk ? littleLeadTime(wip, done) : 0
  const keeps = done >= demand

  const explore = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line p-3">
        <Timeline stages={stages} start={start} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-4 rounded bg-teal" aria-hidden />work on the ticket {hm(work)} ({total > 0 ? pct(work / total, 0) : '0%'})</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-4 rounded border border-dashed border-amber bg-amber-soft" aria-hidden />waiting {hm(wait)} ({total > 0 ? pct(wait / total, 0) : '0%'})</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-ink">Ticket stages</h3>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-ink-2" htmlFor="cyc-start">Logged at</label>
              <input id="cyc-start" type="time" className="field h-9 w-auto py-1" value={clock(start, 0).slice(0, 5)}
                onChange={e => { const [h, m] = e.target.value.split(':').map(Number); if (Number.isFinite(h) && Number.isFinite(m)) setStart(h * 60 + m) }} />
            </div>
          </div>
          {stages.map((s, k) => (
            <motion.div layout key={s.id} transition={{ duration: 0.25, ease: EASE }} className="rounded-2xl border border-line p-3">
              <div className="flex items-center gap-2">
                <span className={`tabular grid size-7 shrink-0 place-items-center rounded-lg text-sm font-bold ${s.kind === 'work' ? 'bg-teal-soft text-teal' : 'bg-amber-soft text-amber'}`}>{k + 1}</span>
                <input aria-label={`Name of stage ${k + 1}`} className="field h-9 py-1" value={s.name} onChange={e => edit(s.id, { name: e.target.value })} />
                <button className="btn btn-ghost btn-icon btn-sm" aria-label={`Remove ${s.name}`} disabled={stages.length <= 2} onClick={() => setStages(x => x.filter(y => y.id !== s.id))}><Trash className="size-4" /></button>
              </div>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <div className="w-32">
                  <NumberField id={`cyc-v-${s.id}`} label="Duration" value={shown(s)} step={s.unit === 'h' ? 0.25 : 1} suffix={s.unit}
                    onChange={v => edit(s.id, { minutes: Math.max(0, s.unit === 'h' ? v * 60 : v) })} />
                </div>
                <Segmented size="sm" label={`Unit for ${s.name}`} value={s.unit} onChange={u => edit(s.id, { unit: u })} options={[{ value: 'min', label: 'minutes' }, { value: 'h', label: 'hours' }]} />
                <Segmented size="sm" label={`Type of ${s.name}`} value={s.kind} onChange={kd => edit(s.id, { kind: kd })} options={[{ value: 'work', label: 'work' }, { value: 'wait', label: 'waiting' }]} />
              </div>
            </motion.div>
          ))}
          <button className="btn btn-soft btn-sm" disabled={stages.length >= 7} onClick={() => setStages(s => [...s, st('New stage', 15, 'min', 'work')])}><Plus className="size-4" /> Add stage</button>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl bg-teal-soft/60 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-2"><Clock className="size-4 text-teal" /> Cycle time for this ticket</div>
            <div className="tabular font-display text-4xl font-bold text-teal">{hm(total)}</div>
            <div className="tabular text-sm text-ink-2">= {fmt(total, 0)} minutes = {fmt(total / 60, 2)} hours</div>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[360px] text-sm">
              <thead className="bg-surface-2 text-left text-xs text-ink-2"><tr><th className="px-3 py-2">Stage</th><th className="px-3 py-2">Entered</th><th className="px-3 py-2">Conversion</th><th className="px-3 py-2 text-right">Minutes</th></tr></thead>
              <tbody className="tabular">
                {stages.map(s => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="px-3 py-2 text-ink">{s.name}</td>
                    <td className="px-3 py-2">{fmt(shown(s), 4)} {s.unit}</td>
                    <td className="px-3 py-2 text-ink-2">{s.unit === 'h' ? `${fmt(shown(s), 4)} x 60` : 'already minutes'}</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmt(s.minutes, 1)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-line-2 font-semibold"><td className="px-3 py-2" colSpan={3}>Total, then / 60 for hours</td><td className="px-3 py-2 text-right">{fmt(total, 1)}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl bg-amber-soft/60 p-4 text-sm leading-relaxed text-ink-2">
            <strong className="text-ink">Watch the decimals.</strong> {fmt(total / 60, 2)} h is {hm(total)}, not {Math.floor(total / 60)} h {Math.round(((total / 60) % 1) * 100)} min. The digits after the point are hundredths of an hour, so multiply them by 60. Convert every stage to one unit before adding or averaging.
          </div>
          <p className="text-sm leading-relaxed text-ink-2">
            Cycle time here is the elapsed time from logging to closing one ticket. {wait > work ? `Most of it (${pct(wait / Math.max(1, total), 0)}) is waiting, not work. Shortening the repair itself would barely move the customer's experience.` : 'Most of it is work on the ticket.'}
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-dashed border-amber/60 p-4 sm:p-5" aria-labelledby="cyc-sup">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="cyc-sup" className="font-display text-lg font-semibold text-ink">Supplementary: takt time and lead time</h3>
          <StatusBadge status="supplementary" />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink-2">Not in the Define syllabus, but easily confused with cycle time. Takt time is the pace demand requires. Lead time is how long a customer waits from request to delivery, including the queue before anyone starts.</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <div className="grid grid-cols-2 gap-3">
            <NumberField id="cyc-avail" label="Desk open per day" value={availH} onChange={setAvailH} min={0.5} step={0.5} suffix="h" />
            <NumberField id="cyc-demand" label="Tickets raised per day" value={demand} onChange={setDemand} min={1} />
            <NumberField id="cyc-done" label="Tickets closed per day" value={done} onChange={setDone} min={1} />
            <NumberField id="cyc-wip" label="Tickets open (WIP)" value={wip} onChange={setWip} min={0} />
          </div>
          {supOk ? (
            <div className="min-w-0 space-y-3">
              <div className="space-y-2">
                {[{ l: 'Takt time (pace demand needs)', v: takt, c: 'bg-violet' }, { l: 'Time between closures (actual pace)', v: interval, c: keeps ? 'bg-good' : 'bg-bad' }].map(b => (
                  <div key={b.l}>
                    <div className="flex justify-between gap-2 text-sm"><span className="text-ink-2">{b.l}</span><span className="tabular font-semibold text-ink">{fmt(b.v, 2)} min</span></div>
                    <div className="mt-1 h-3 overflow-hidden rounded-full bg-surface-3">
                      <motion.div className={`h-full rounded-full ${b.c}`} initial={false} animate={{ width: `${(b.v / Math.max(takt, interval)) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
                    </div>
                  </div>
                ))}
              </div>
              <Feedback ok={keeps}>{keeps ? `The desk closes a ticket every ${fmt(interval, 2)} min, at least as fast as the ${fmt(takt, 2)} min demand requires. It keeps pace.` : `Customers raise a ticket every ${fmt(takt, 2)} min but the desk closes one every ${fmt(interval, 2)} min. The backlog grows by ${demand - done} tickets a day.`}</Feedback>
              <div className="space-y-1 rounded-2xl bg-surface-2/60 p-3 text-ink">
                <Tex block tex={`\\text{Takt} = \\frac{\\text{available time}}{\\text{demand}} = \\frac{${fmt(availH * 60, 1)}\\text{ min}}{${demand}} = ${fmt(takt, 2)}\\text{ min}`} />
                <Tex block tex={`\\text{Lead time} = \\frac{\\text{WIP}}{\\text{throughput}} = \\frac{${wip}}{${done}\\text{ per day}} = ${fmt(lead, 2)}\\text{ days}`} />
              </div>
              <p className="text-sm leading-relaxed text-ink-2">A new ticket joins a queue of {wip}. At {done} closures a day it waits about {fmt(lead, 1)} days in total, far longer than the {hm(total)} cycle time of one ticket once work starts.</p>
            </div>
          ) : <p className="text-sm text-ink-3">Enter positive values to compare takt and lead time.</p>}
        </div>
      </section>
    </div>
  )

  return (
    <LabShell
      lab="cycle"
      embedded={embedded}
      instructions="Edit each stage's duration and switch its unit between minutes and hours: the duration stays the same, only the way it is written changes. Mark stages as work or waiting. The timeline, the conversion table and the total update as you go."
      scenario="A residential broadband fault at Northwind Fibre: the customer calls, the desk logs and diagnoses, the ticket waits for an engineer and a part, the engineer repairs, and the desk confirms with the customer."
      onReset={reset}
      onNewExample={another}
      explore={explore}
      challenge={
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-2">Five randomised problems on adding, converting and averaging times in mixed units, plus two supplementary questions on takt time and lead time. Answers within 0.5% count.</p>
          <Runner lab="cycle" make={makeQ} />
        </div>
      }
      check={<KnowledgeCheck lab="cycle" items={[
        { q: 'A repair took 2.75 hours. How long is that in hours and minutes?', options: ['2 h 75 min', '2 h 45 min', '3 h 15 min', '2 h 7.5 min'], answer: 1, why: '0.75 h x 60 = 45 min. Decimal hours are hundredths of an hour, not minutes.' },
        { q: 'Which is the best definition of cycle time in this lesson?', options: ['Time customers wait including the queue before work starts', 'Elapsed time for one unit to pass through the process from start to finish', 'Available time divided by demand', 'The number of units in progress'], answer: 1, why: 'Cycle time is the elapsed time of one unit through the process. The other options describe lead time, takt time and WIP.' },
        { q: 'Supplementary: 420 minutes are available and demand is 210 orders. What is the takt time?', options: ['0.5 min', '2 min', '210 min', '630 min'], answer: 1, why: 'Takt = available time / demand = 420 / 210 = 2 minutes per order.' },
        { q: 'Three tickets took 90 min, 1.5 h and 2 h. What is the average?', options: ['31.2', '1.5 h', '1 h 40 min', '2 h'], answer: 2, why: 'Convert first: 90 + 90 + 120 = 300 min, average 100 min = 1 h 40 min.' },
      ]} />}
    />
  )
}
