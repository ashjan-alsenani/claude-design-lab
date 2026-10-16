import { motion } from 'motion/react'
import { ArrowRight, RotateCcw, Trophy } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import type { LabKey, MistakeTag } from '../data/types'
import { Tex } from '../components/Math'
import { Segmented, StatusBadge } from '../components/ui'
import { recordLab, update } from '../lib/store'
import { closeEnough, fmt, improvementPercent, parseNumber, paybackPeriods, roiPercent } from '../lib/metrics'
import { Feedback, KnowledgeCheck, LabShell, NumberField } from './kit'
import type { LabProps } from './registry'

const EASE = [0.23, 1, 0.32, 1] as const
const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
const money = (v: number) => `${v < 0 ? '-' : ''}$${fmt(Math.abs(v), 0)}`
const tm = (v: number) => `\\$${fmt(v, 0).replace(/,/g, '{,}')}`

function logMistake(tag: MistakeTag) {
  update(p => {
    p.mistakes.push({ at: Date.now(), tag })
    if (p.mistakes.length > 600) p.mistakes.splice(0, p.mistakes.length - 600)
  })
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

interface Inputs { oneOff: number; running: number; hard: number; soft: number; avoid: number; countSoft: boolean; countAvoid: boolean; horizon: 12 | 24 | 36; baseline: number; after: number; realized: number }
const DEFAULT: Inputs = { oneOff: 72100, running: 1500, hard: 14200, soft: 6500, avoid: 3000, countSoft: false, countAvoid: false, horizon: 12, baseline: 420, after: 290, realized: 11800 }

function randomInputs(): Inputs {
  const hard = ri(40, 200) * 100
  const baseline = ri(20, 80) * 10
  return {
    oneOff: ri(30, 150) * 1000, running: ri(5, 40) * 100, hard, soft: ri(10, 100) * 100, avoid: ri(0, 60) * 100,
    countSoft: false, countAvoid: false, horizon: pick<12 | 24 | 36>([12, 24, 36]),
    baseline, after: Math.round(baseline * (0.5 + Math.random() * 0.35)), realized: Math.round((hard * (0.6 + Math.random() * 0.5)) / 100) * 100,
  }
}

/* ------------------------------------------------------------------ */
/* Cash flow chart                                                     */
/* ------------------------------------------------------------------ */

function CashChart({ oneOff, monthlyNet, horizon, payback }: { oneOff: number; monthlyNet: number; horizon: number; payback: number | null }) {
  const vals = Array.from({ length: horizon + 1 }, (_, m) => -oneOff + monthlyNet * m)
  const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals)
  const span = hi - lo || 1
  const L = 70, R = 700, T = 20, B = 220
  const x = (m: number) => L + (m / horizon) * (R - L)
  const y = (v: number) => B - ((v - lo) / span) * (B - T)
  const d = vals.map((v, m) => `${m === 0 ? 'M' : 'L'} ${x(m)} ${y(v)}`).join(' ')
  const area = `${d} L ${x(horizon)} ${y(0)} L ${x(0)} ${y(0)} Z`
  return (
    <svg viewBox="0 0 720 256" className="h-auto w-full" role="img"
      aria-label={`Cumulative net cash position starting at ${money(-oneOff)} and ending at ${money(vals[horizon])} after ${horizon} months. ${payback !== null && payback <= horizon ? `Break-even after ${fmt(payback, 1)} months.` : 'No break-even within the horizon.'}`}>
      {[lo, (lo + hi) / 2, hi].map((v, k) => (
        <g key={k}>
          <line x1={L} x2={R} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">{`${v < 0 ? '-' : ''}$${fmt(Math.abs(v) / 1000, 0)}k`}</text>
        </g>
      ))}
      <line x1={L} x2={R} y1={y(0)} y2={y(0)} stroke="var(--ink-3)" strokeWidth={1.5} />
      <text x={R} y={y(0) - 6} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--ink-2)" fontFamily="var(--font-sans)">break-even</text>
      <motion.path initial={false} animate={{ d: area }} transition={{ duration: 0.6, ease: EASE }} fill="var(--teal)" opacity={0.12} />
      <motion.path initial={false} animate={{ d }} transition={{ duration: 0.6, ease: EASE }} fill="none" stroke="var(--teal)" strokeWidth={3} strokeLinejoin="round" />
      {payback !== null && payback <= horizon && (
        <motion.g initial={false} animate={{ x: x(payback) }} transition={{ duration: 0.6, ease: EASE }}>
          <line x1={0} x2={0} y1={T} y2={B} stroke="var(--violet)" strokeWidth={2} strokeDasharray="5 4" />
          <circle cx={0} cy={y(0)} r={6} fill="var(--surface)" stroke="var(--violet)" strokeWidth={3} />
          <text x={payback / horizon > 0.75 ? -8 : 8} y={T + 12} textAnchor={payback / horizon > 0.75 ? 'end' : 'start'} fontSize={12} fontWeight={700} fill="var(--violet)" fontFamily="var(--font-sans)">payback {fmt(payback, 1)} months</text>
        </motion.g>
      )}
      {[0, horizon / 4, horizon / 2, (3 * horizon) / 4, horizon].map(m => (
        <text key={m} x={x(m)} y={B + 22} textAnchor="middle" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">{fmt(m, 0)}</text>
      ))}
      <text x={(L + R) / 2} y={B + 36} textAnchor="middle" fontSize={12} fill="var(--ink-3)" fontFamily="var(--font-sans)">months after go-live</text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Challenge                                                           */
/* ------------------------------------------------------------------ */

interface Trap { value: number; tag: MistakeTag; msg: string }
type Q = { prompt: ReactNode; explain: ReactNode } & (
  | { kind: 'num'; answer: number; traps: Trap[]; hint: string; unit: string }
  | { kind: 'choice'; options: string[]; correct: number }
)

const SAVINGS: { text: string; cls: 0 | 1 | 2; why: string }[] = [
  { text: 'Contractor repeat visits fall by 180 a month at $118 each, and the contractor invoices fall accordingly.', cls: 0, why: 'Spending on the P&L goes down and stays down: hard savings.' },
  { text: 'Overtime paid to the billing team falls by $4,000 a month.', cls: 0, why: 'A real reduction in money paid out: hard savings.' },
  { text: 'SLA credits paid to business customers drop by $9,000 a month.', cls: 0, why: 'Fewer credits paid means lower spending: hard savings.' },
  { text: 'Courier spend on urgent spare parts is cut by $2,500 a month.', cls: 0, why: 'A budget line falls: hard savings.' },
  { text: 'Engineers gain 160 hours a month of capacity, but no hours or headcount are cut.', cls: 1, why: 'Freed capacity is real but no spending falls unless management converts it: soft savings.' },
  { text: 'Customer satisfaction rises by 6 points.', cls: 1, why: 'Valuable but indirect; it does not reduce spending on its own: soft savings.' },
  { text: 'Agents spend 20 fewer minutes a shift on rework and use the time for coaching.', cls: 1, why: 'Productivity gain with no budget reduction: soft savings.' },
  { text: 'The risk of a regulatory fine is lower.', cls: 1, why: 'Risk reduction is a soft benefit unless Finance agrees a method to value it.' },
  { text: 'A planned extra dispatch team for next year is no longer needed.', cls: 2, why: 'It prevents a future cost that is not in the current budget: cost avoidance.' },
  { text: 'A budgeted server upgrade to cope with re-sent invoices is cancelled before purchase.', cls: 2, why: 'The spend was planned but not yet incurred: cost avoidance.' },
  { text: 'Plans to hire four extra accounts payable clerks next quarter are dropped.', cls: 2, why: 'Avoids future spending rather than cutting current spending: cost avoidance.' },
]
const CLASSES = ['Hard savings', 'Soft savings', 'Cost avoidance']

function makeQ(i: number, used: Set<number>): Q {
  const kind = ['class', 'class', 'payback', 'class', 'roi', 'class'][i % 6]
  if (kind === 'class') {
    let k = ri(0, SAVINGS.length - 1)
    while (used.has(k)) k = ri(0, SAVINGS.length - 1)
    used.add(k)
    const s = SAVINGS[k]
    return { kind: 'choice', options: CLASSES, correct: s.cls, prompt: <>Kestrel Mobile's Finance representative asks you to classify this benefit: <strong>"{s.text}"</strong></>, explain: s.why }
  }
  if (kind === 'payback') {
    const oneOff = ri(20, 120) * 1000, savings = ri(40, 160) * 100, running = ri(5, 30) * 100
    const ans = paybackPeriods(oneOff, savings - running)
    return {
      kind: 'num', answer: ans, unit: 'months', hint: 'e.g. 8.4',
      prompt: <>A repeat-visit project costs <strong>{money(oneOff)}</strong> to implement. It saves <strong>{money(savings)} a month</strong> in contractor invoices and adds <strong>{money(running)} a month</strong> in monitoring costs. What is the payback period in <strong>months</strong>? One decimal place.</>,
      explain: <Tex tex={`\\text{Payback} = \\frac{${tm(oneOff)}}{${tm(savings)} - ${tm(running)}} = \\frac{${tm(oneOff)}}{${tm(savings - running)}} = ${fmt(ans, 2)}\\text{ months}`} />,
      traps: [
        { value: paybackPeriods(oneOff, savings), tag: 'gross-vs-net', msg: 'You used gross savings. Subtract the running cost first: payback uses net savings per period.' },
        { value: ans / 12, tag: 'time-units', msg: 'That is in years. Monthly savings give a payback in months.' },
      ],
    }
  }
  const oneOff = ri(20, 90) * 1000, savings = ri(50, 200) * 100, running = ri(5, 30) * 100
  const benefit = savings * 12, cost = oneOff + running * 12
  const ans = roiPercent(benefit, cost)
  return {
    kind: 'num', answer: ans, unit: '%', hint: 'e.g. 85.3',
    prompt: <>First-year figures for an invoice-matching project: one-off cost <strong>{money(oneOff)}</strong>, running cost <strong>{money(running)} a month</strong>, hard savings <strong>{money(savings)} a month</strong>. What is the first-year ROI on a net basis, as a percentage? One decimal place.</>,
    explain: <Tex tex={`ROI = \\frac{${tm(benefit)} - ${tm(cost)}}{${tm(cost)}} \\times 100 = ${fmt(ans, 1)}\\%`} />,
    traps: [
      { value: (benefit / cost) * 100, tag: 'gross-vs-net', msg: 'That is the benefit-to-cost ratio. ROI subtracts the cost from the benefit first.' },
      { value: roiPercent(benefit, oneOff), tag: 'gross-vs-net', msg: 'You left out the running costs. Total cost includes the one-off cost plus 12 months of running cost.' },
      { value: roiPercent(savings, oneOff + running), tag: 'time-units', msg: 'You mixed one month of savings with the full one-off cost. Annualise first.' },
    ],
  }
}

function Runner({ lab, total = 6 }: { lab: LabKey; total?: number }) {
  const [round, setRound] = useState(0)
  const qs = useMemo(() => { const used = new Set<number>(); return Array.from({ length: total }, (_, i) => makeQ(i, used)) }, [round, total])
  const [i, setI] = useState(0)
  const [raw, setRaw] = useState('')
  const [picked, setPicked] = useState<number | null>(null)
  const [res, setRes] = useState<{ ok: boolean; msg: string } | null>(null)
  const [marks, setMarks] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const q = qs[i]
  const finish = (ok: boolean, msg: string) => { setRes({ ok, msg }); setMarks(m => [...m, ok]) }
  const submitNum = () => {
    if (q.kind !== 'num') return
    const v = parseNumber(raw)
    if (v === null) { setRes({ ok: false, msg: 'Enter a number such as 7.5.' }); return }
    const ok = closeEnough(v, q.answer, 0.01, 0.06)
    let msg = ok ? 'Correct.' : 'Not quite.'
    if (!ok) { const t = q.traps.find(t => closeEnough(v, t.value, 0.01, 0.06)); if (t) { msg = t.msg; logMistake(t.tag) } }
    finish(ok, msg)
  }
  const choose = (j: number) => { if (q.kind !== 'choice' || res) return; setPicked(j); finish(j === q.correct, j === q.correct ? 'Correct.' : `Not quite: this is ${CLASSES[q.correct].toLowerCase()}.`) }
  const next = () => {
    if (i + 1 >= total) { recordLab(lab, Math.round((marks.filter(Boolean).length / total) * 100)); setDone(true) }
    else { setI(i + 1); setRaw(''); setRes(null); setPicked(null) }
  }
  const again = () => { setRound(r => r + 1); setI(0); setRaw(''); setRes(null); setPicked(null); setMarks([]); setDone(false) }
  if (done) {
    const right = marks.filter(Boolean).length
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-teal-soft p-5">
        <Trophy className="size-6 text-teal" />
        <div className="flex-1">
          <div className="font-display text-lg font-semibold text-ink">{right} of {total} correct</div>
          <p className="text-sm text-ink-2">{right === total ? 'Finance would sign this off.' : 'Review the classifications and units, then try again.'}</p>
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
      {q.kind === 'num' ? (
        <form className="flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); if (!res) submitNum() }}>
          <div className="min-w-0 flex-1">
            <label className="label" htmlFor="fin-ans">Your answer ({q.unit})</label>
            <input id="fin-ans" className="field tabular" value={raw} onChange={e => setRaw(e.target.value)} disabled={!!res} placeholder={q.hint} autoComplete="off" />
          </div>
          {!res ? <button className="btn btn-primary" type="submit" disabled={!raw.trim()}>Check</button>
            : <button className="btn btn-primary" type="button" onClick={next}>{i + 1 >= total ? 'See score' : 'Next question'} <ArrowRight className="size-4" /></button>}
        </form>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            {q.options.map((o, j) => (
              <button key={o} disabled={!!res} onClick={() => choose(j)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${res && j === q.correct ? 'border-good bg-good-soft' : res && j === picked ? 'border-bad bg-bad-soft' : 'border-line hover:border-violet hover:bg-violet-soft/40'} disabled:cursor-default`}>{o}</button>
            ))}
          </div>
          {res && <button className="btn btn-primary" onClick={next}>{i + 1 >= total ? 'See score' : 'Next question'} <ArrowRight className="size-4" /></button>}
        </div>
      )}
      {res && <Feedback ok={res.ok}><div className="font-semibold">{res.msg}</div><div className="mt-1 text-ink-2">{q.explain}</div></Feedback>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function FinanceLab({ embedded }: LabProps) {
  const [v, setV] = useState<Inputs>(DEFAULT)
  const set = <K extends keyof Inputs>(k: K, val: Inputs[K]) => setV(s => ({ ...s, [k]: val }))
  const nn = (x: number) => Math.max(0, x)

  const gross = v.hard + (v.countSoft ? v.soft : 0) + (v.countAvoid ? v.avoid : 0)
  const net = gross - v.running
  const H = v.horizon
  const benefit = gross * H
  const cost = v.oneOff + v.running * H
  const roi = cost > 0 ? roiPercent(benefit, cost) : null
  const payM = net > 0 ? paybackPeriods(v.oneOff, net) : null
  const payY = net > 0 ? paybackPeriods(v.oneOff, net * 12) : null
  const impr = v.baseline > 0 ? improvementPercent(v.baseline, v.after) : null
  const realizedNet = v.realized - v.running
  const realizedPay = realizedNet > 0 ? paybackPeriods(v.oneOff, realizedNet) : null
  const shortfall = v.hard > 0 ? improvementPercent(v.hard, v.realized) : null
  const after = v.after

  const counted = [`${tm(v.hard)}`, v.countSoft ? tm(v.soft) : null, v.countAvoid ? tm(v.avoid) : null].filter(Boolean).join(' + ')

  const explore = (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberField id="fin-one" label="One-off cost" value={v.oneOff} onChange={x => set('oneOff', nn(x))} step={1000} suffix="$" />
            <NumberField id="fin-run" label="Running cost" value={v.running} onChange={x => set('running', nn(x))} step={100} suffix="$/mo" />
          </div>
          <div className="rounded-2xl border border-line p-3">
            <div className="mb-2 text-sm font-semibold text-ink">Monthly savings by type</div>
            <div className="grid grid-cols-1 gap-3">
              <NumberField id="fin-hard" label="Hard savings (budget lines fall)" value={v.hard} onChange={x => set('hard', nn(x))} step={100} suffix="$/mo" />
              <div>
                <NumberField id="fin-soft" label="Soft savings (capacity, satisfaction)" value={v.soft} onChange={x => set('soft', nn(x))} step={100} suffix="$/mo" />
                <label className="mt-1.5 flex items-center gap-2 text-xs text-ink-2"><input type="checkbox" className="size-4 accent-[var(--violet)]" checked={v.countSoft} onChange={e => set('countSoft', e.target.checked)} /> Finance agrees to count soft savings</label>
              </div>
              <div>
                <NumberField id="fin-avoid" label="Cost avoidance (future spend prevented)" value={v.avoid} onChange={x => set('avoid', nn(x))} step={100} suffix="$/mo" />
                <label className="mt-1.5 flex items-center gap-2 text-xs text-ink-2"><input type="checkbox" className="size-4 accent-[var(--violet)]" checked={v.countAvoid} onChange={e => set('countAvoid', e.target.checked)} /> Finance agrees to count cost avoidance</label>
              </div>
            </div>
          </div>
          <div>
            <div className="label">Evaluation horizon</div>
            <Segmented size="sm" label="Evaluation horizon" value={v.horizon} onChange={h => set('horizon', h)} options={[{ value: 12, label: '12 months' }, { value: 24, label: '24 months' }, { value: 36, label: '36 months' }]} />
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { l: 'Gross benefit', v: money(benefit), s: `${H} months`, c: 'text-ink' },
              { l: 'Total cost', v: money(cost), s: 'one-off + running', c: 'text-coral' },
              { l: 'Net benefit', v: money(benefit - cost), s: 'gross minus cost', c: benefit - cost >= 0 ? 'text-good' : 'text-bad' },
              { l: 'Annualised gross', v: money(gross * 12), s: 'monthly x 12', c: 'text-ink' },
            ].map(k => (
              <div key={k.l} className="rounded-2xl border border-line p-3">
                <div className="text-xs font-semibold text-ink-3">{k.l}</div>
                <motion.div key={k.v} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`tabular font-display text-lg font-bold sm:text-xl ${k.c}`}>{k.v}</motion.div>
                <div className="text-xs text-ink-3">{k.s}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl bg-violet-soft/60 p-4">
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-ink-2">ROI, net basis</span><StatusBadge status="supplementary" /></div>
              <div className="tabular font-display text-3xl font-bold text-violet">{roi === null ? 'n/a' : `${fmt(roi, 1)}%`}</div>
              <div className="text-xs text-ink-2">over {H} months</div>
            </div>
            <div className="rounded-2xl bg-teal-soft/60 p-4">
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-ink-2">Payback period</span><StatusBadge status="supplementary" /></div>
              <div className="tabular font-display text-3xl font-bold text-teal">{payM === null ? 'Never' : `${fmt(payM, 1)} months`}</div>
              <div className="text-xs text-ink-2">{payY === null ? 'Running costs exceed the counted savings.' : `= ${fmt(payY, 2)} years`}</div>
            </div>
          </div>
          <div className="rounded-2xl border border-line p-3"><CashChart oneOff={v.oneOff} monthlyNet={net} horizon={H} payback={payM} /></div>
        </div>
      </div>

      <section className="rounded-2xl border border-line p-4" aria-labelledby="fin-steps">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="fin-steps" className="font-display text-lg font-semibold text-ink">Worked steps</h3>
          <span className="text-xs text-ink-3">ROI and payback formulas are supplementary business finance; always state the basis and the units.</span>
        </div>
        <ol className="mt-2 space-y-1 text-ink">
          <li><Tex block tex={`\\text{1. Monthly gross savings} = ${counted} = ${tm(gross)}`} /></li>
          <li><Tex block tex={`\\text{2. Monthly net savings} = ${tm(gross)} - ${tm(v.running)} = ${tm(net)}`} /></li>
          <li><Tex block tex={`\\text{3. Total cost over ${H} months} = ${tm(v.oneOff)} + ${tm(v.running)} \\times ${H} = ${tm(cost)}`} /></li>
          <li><Tex block tex={`\\text{4. ROI (Supplementary)} = \\frac{${tm(benefit)} - ${tm(cost)}}{${tm(cost)}} \\times 100 = ${roi === null ? '\\text{n/a}' : `${fmt(roi, 1)}\\%`}`} /></li>
          <li><Tex block tex={`\\text{5. Payback (Supplementary)} = \\frac{${tm(v.oneOff)}}{${tm(net)}\\text{ per month}} = ${payM === null ? '\\text{never}' : `${fmt(payM, 2)}\\text{ months} = ${fmt(payY ?? 0, 2)}\\text{ years}`}`} /></li>
        </ol>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <div className="rounded-xl border border-dashed border-bad/40 p-3 text-sm">
            <div className="flex items-baseline justify-between gap-2"><span className="font-semibold text-ink-2">Benefit-to-cost ratio, not ROI</span><span className="tabular font-semibold text-bad line-through decoration-2">{cost > 0 ? `${fmt((benefit / cost) * 100, 1)}%` : 'n/a'}</span></div>
            <p className="mt-1 text-xs text-ink-3">Dividing benefit by cost without subtracting cost first overstates the return by 100 points.</p>
          </div>
          <div className="rounded-xl border border-dashed border-bad/40 p-3 text-sm">
            <div className="flex items-baseline justify-between gap-2"><span className="font-semibold text-ink-2">Payback on gross savings</span><span className="tabular font-semibold text-bad line-through decoration-2">{gross > 0 ? `${fmt(paybackPeriods(v.oneOff, gross), 1)} months` : 'n/a'}</span></div>
            <p className="mt-1 text-xs text-ink-3">Ignores the running cost, so it looks faster than it is.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-line p-4" aria-labelledby="fin-impr">
          <h3 id="fin-impr" className="font-display text-lg font-semibold text-ink">Percentage improvement</h3>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <NumberField id="fin-base" label="Repeat visits a month, before" value={v.baseline} onChange={x => set('baseline', nn(x))} />
            <NumberField id="fin-after" label="After" value={after} onChange={x => set('after', nn(x))} />
          </div>
          {impr !== null && v.baseline > 0 && (
            <>
              <Tex block tex={`\\frac{${v.baseline} - ${after}}{${v.baseline}} \\times 100 = ${fmt(improvementPercent(v.baseline, after), 1)}\\%`} />
              <p className="text-sm text-ink-2">Lower is better here, so a positive figure is an improvement. Always divide by the baseline, not by the new value.</p>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-line p-4" aria-labelledby="fin-real">
          <h3 id="fin-real" className="font-display text-lg font-semibold text-ink">Estimated versus realized (Finance verification)</h3>
          <div className="mt-2 max-w-xs"><NumberField id="fin-realized" label="Realized hard savings, verified in Control" value={v.realized} onChange={x => set('realized', nn(x))} step={100} suffix="$/mo" /></div>
          <div className="mt-3 space-y-2">
            {[{ l: 'Estimated in Define', val: v.hard, c: 'bg-line-2' }, { l: 'Realized after Control', val: v.realized, c: v.realized >= v.hard ? 'bg-good' : 'bg-amber' }].map(b => (
              <div key={b.l}>
                <div className="flex justify-between gap-2 text-sm"><span className="text-ink-2">{b.l}</span><span className="tabular font-semibold text-ink">{money(b.val)}/mo</span></div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-surface-3"><motion.div className={`h-full rounded-full ${b.c}`} initial={false} animate={{ width: `${(b.val / Math.max(1, v.hard, v.realized)) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} /></div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            {shortfall === null ? 'Enter estimated hard savings above.' : shortfall > 0
              ? <>Realized savings are <strong className="text-ink">{fmt(shortfall, 1)}% below</strong> the estimate. {realizedPay === null ? 'At this level the running cost is not covered.' : <>Payback stretches to {fmt(realizedPay, 1)} months.</>}</>
              : <>Realized savings meet or beat the estimate by {fmt(-shortfall, 1)}%.</>}
            {' '}Estimates belong in the charter; only figures the Finance representative has verified from actual results count as realized benefits.
          </p>
        </section>
      </div>
    </div>
  )

  return (
    <LabShell
      lab="finance"
      embedded={embedded}
      instructions="Enter the one-off and running costs and the monthly savings by type. Decide whether Finance lets you count soft savings and cost avoidance, and pick a horizon. Gross and net benefit, ROI, payback, the cash curve and every worked step update together. Then compare the estimate with the savings Finance verified."
      scenario="Northwind Fibre's repeat-visit project: better diagnostic scripts and van stock rules should cut contractor repeat visits. The charter needs a credible business case, and Finance will check the numbers again after Control."
      onReset={() => setV(DEFAULT)}
      onNewExample={() => setV(randomInputs())}
      explore={explore}
      challenge={
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-2">Six randomised questions: classify benefits as hard savings, soft savings or cost avoidance, then calculate payback and ROI with fresh numbers. Numeric answers within 1% count.</p>
          <Runner lab="finance" />
        </div>
      }
      check={<KnowledgeCheck lab="finance" items={[
        { q: 'Engineers gain 1,900 hours of capacity a year but no hours or headcount are reduced. This is:', options: ['Hard savings', 'Soft savings', 'Cost avoidance', 'Revenue enhancement'], answer: 1, why: 'Capacity freed is real but no spending falls unless management converts it, so it is soft.' },
        { q: 'A project costs 60,000 and saves 5,000 a month net. What is the payback period?', options: ['12 years', '12 months', '1.2 months', '83 months'], answer: 1, why: 'Payback = 60,000 / 5,000 = 12, in the unit of the savings: months.' },
        { q: 'First-year benefit is 150,000 and total cost is 100,000. What is ROI on a net basis?', options: ['150%', '50%', '250%', '33%'], answer: 1, why: 'ROI = (150,000 - 100,000) / 100,000 x 100 = 50%. 150% is the benefit-to-cost ratio.' },
        { q: 'Who should independently validate the project\'s hard and soft savings?', options: ['The Green Belt who led the project', 'The process owner alone', 'The Finance representative', 'The customer'], answer: 2, why: 'The Finance representative provides independent evaluation, especially of realized benefits.' },
      ]} />}
    />
  )
}
