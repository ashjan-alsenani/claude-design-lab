import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import type { LabProps } from './registry'
import { ClassifierGame, Feedback, KnowledgeCheck, LabShell, shuffle, type Bucket, type CheckItem, type ClassItem } from './kit'
import { Segmented } from '../components/ui'
import { recordLab, update } from '../lib/store'

interface Opt { text: string; note: string }
interface Problem { id: string; title: string; context: string; primary: Opt[]; pAns: number; secondary: Opt[]; sAns: number }

const PROBLEMS: Problem[] = [
  {
    id: 'sla', title: 'Incident restoration', context: 'Kestrel Mobile restores only 81.3% of P2 incidents within the 4-hour SLA. Service credits are rising.',
    primary: [
      { text: '% of P2 incidents restored within 4 hours', note: 'The customer-facing outcome in the problem statement: this is the project Y.' },
      { text: 'Service credits paid per month', note: 'A financial consequence of the Y, useful for the business case but not the Y itself.' },
      { text: 'Number of engineers on shift', note: 'An input (an X), not the result the project exists to improve.' },
      { text: 'Average time to assign a ticket', note: 'A process measure that may be a driver (X), and a good leading indicator, but not the primary metric.' },
    ], pAns: 0,
    secondary: [
      { text: '% of restored incidents reopened within 72 hours', note: 'A guardrail: faster restoration must not mean sloppier fixes.' },
      { text: '% of P2 incidents restored within 4 hours', note: 'That is the primary metric, not a guardrail.' },
      { text: 'Number of tickets logged', note: 'Volume is context, not a side effect that must not worsen.' },
      { text: 'Customer NPS next year', note: 'Too lagging and too broad to act as a guardrail for this project.' },
    ], sAns: 0,
  },
  {
    id: 'aht', title: 'Contact centre handle time', context: 'Average handle time on the billing line is 9.4 minutes against a 6-minute target. Leaders worry agents will rush customers.',
    primary: [
      { text: 'Average handle time (minutes per call)', note: 'The metric in the problem and goal: the project Y.' },
      { text: 'Number of agents trained', note: 'An activity count, not a result.' },
      { text: 'Cost per contact', note: 'A financial translation of the Y.' },
      { text: 'Calls answered per day', note: 'Volume depends on demand, not only on the process.' },
    ], pAns: 0,
    secondary: [
      { text: 'Repeat contacts within 7 days (%)', note: 'The classic guardrail: shorter calls must not push customers to call back.' },
      { text: 'Average handle time', note: 'That is the primary metric.' },
      { text: 'Number of calls offered', note: 'Context, not a guardrail.' },
      { text: 'Office electricity cost', note: 'Not affected by this project.' },
    ], sAns: 0,
  },
  {
    id: 'invoice', title: 'Invoice approval speed', context: 'Supplier invoices take a median of 11.3 working days to approve against a 5-day policy.',
    primary: [
      { text: 'Number of approvers', note: 'An input, not a result.' },
      { text: 'Median approval time (working days)', note: 'Matches the problem statement: the project Y.' },
      { text: 'Late-payment charges (USD)', note: 'A financial consequence, used in the business case.' },
      { text: 'Invoices received per month', note: 'Demand, not performance.' },
    ], pAns: 1,
    secondary: [
      { text: 'Median approval time', note: 'That is the primary metric.' },
      { text: 'Number of suppliers', note: 'Context, not a side effect.' },
      { text: 'Payment error rate (% of invoices paid wrongly or twice)', note: 'A guardrail: faster approval must not increase errors.' },
      { text: 'Pages in the approval policy', note: 'Not a performance measure.' },
    ], sAns: 2,
  },
  {
    id: 'repeat', title: 'Repeat field visits', context: '18.4% of North region fault visits are followed by a repeat visit within 30 days, against a 9% target.',
    primary: [
      { text: 'Engineer overtime hours', note: 'A possible guardrail, not the Y.' },
      { text: 'Number of vans', note: 'A resource, not a result.' },
      { text: '30-day repeat visit rate (%)', note: 'The Y in the problem statement.' },
      { text: 'Cost of repeat visits (USD)', note: 'Financial translation, not the Y.' },
    ], pAns: 2,
    secondary: [
      { text: 'Average visit duration (minutes)', note: 'A guardrail: engineers must not simply spend much longer on each visit.' },
      { text: '30-day repeat visit rate', note: 'That is the primary metric.' },
      { text: 'Number of faults reported', note: 'Demand, outside the team\'s control.' },
      { text: 'Training hours delivered', note: 'An activity, not a side effect to protect.' },
    ], sAns: 0,
  },
  {
    id: 'discharge', title: 'Hospital discharge timing', context: 'On Ward 7, only 59% of planned discharges are completed before noon, blocking beds for afternoon admissions.',
    primary: [
      { text: '% of planned discharges completed before noon', note: 'The outcome in the problem: the project Y.' },
      { text: 'Number of discharge letters written', note: 'An activity count.' },
      { text: 'Number of nurses on the ward', note: 'An input.' },
      { text: 'Annual bed budget', note: 'Financial context, not the Y.' },
    ], pAns: 0,
    secondary: [
      { text: 'Readmissions within 30 days (%)', note: 'The guardrail: discharging earlier must not send patients home too soon.' },
      { text: '% of discharges before noon', note: 'That is the primary metric.' },
      { text: 'Number of visitors', note: 'Not related.' },
      { text: 'Car park occupancy', note: 'Not a guardrail for this project.' },
    ], sAns: 0,
  },
]

type MType = 'outcome' | 'process' | 'financial'
type Lag = 'leading' | 'lagging'
interface Metric { text: string; type: MType; lag: Lag; why: string }
const METRICS: Metric[] = [
  { text: 'P2 incidents restored within SLA (% per month)', type: 'outcome', lag: 'lagging', why: 'What the customer receives, reported after the month.' },
  { text: 'Tickets assigned to a resolver group within 10 minutes (%)', type: 'process', lag: 'leading', why: 'How the work is done inside the process; it moves early and predicts SLA attainment.' },
  { text: 'Service credits paid (USD per month)', type: 'financial', lag: 'lagging', why: 'The money consequence of the outcome, known after the fact.' },
  { text: 'First contact resolution (%)', type: 'outcome', lag: 'lagging', why: 'The result the customer experiences.' },
  { text: 'Open backlog older than 2 hours (count)', type: 'process', lag: 'leading', why: 'A queue inside the process that warns of a coming SLA miss.' },
  { text: 'Cost per contact (USD)', type: 'financial', lag: 'lagging', why: 'Money per unit of output.' },
  { text: 'Invoices with complete PO data at receipt (%)', type: 'process', lag: 'leading', why: 'A process input condition that predicts approval speed.' },
  { text: 'Invoices paid on time (%)', type: 'outcome', lag: 'lagging', why: 'The result suppliers experience.' },
  { text: 'Engineer overtime spend (USD per month)', type: 'financial', lag: 'lagging', why: 'A cost measure.' },
  { text: 'Fault tickets with a complete fault code (%)', type: 'process', lag: 'leading', why: 'A process quality check that predicts diagnosis accuracy.' },
  { text: 'Customer churn rate (%)', type: 'outcome', lag: 'lagging', why: 'A business and customer result, reported late.' },
  { text: 'Cost of poor quality (USD per quarter)', type: 'financial', lag: 'lagging', why: 'Quality failures translated into money.' },
]

const TYPE_ITEMS: ClassItem[] = METRICS.map((m, i) => ({ id: `m${i}`, text: m.text, bucket: m.type, why: m.why, mistake: 'metric-type' }))
const TYPE_BUCKETS: Bucket[] = [
  { id: 'outcome', label: 'Outcome', hint: 'What the customer or business receives', tone: 'coral' },
  { id: 'process', label: 'Process', hint: 'How the work is performed', tone: 'teal' },
  { id: 'financial', label: 'Financial', hint: 'The result in money', tone: 'amber' },
]

function OptionList({ name, opts, value, onChange, answer, checked }: { name: string; opts: Opt[]; value: number | null; onChange: (i: number) => void; answer: number; checked: boolean }) {
  return (
    <div className="space-y-1.5">
      {opts.map((o, i) => {
        const show = checked && (i === answer || i === value)
        const cls = show ? (i === answer ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft') : value === i ? 'border-coral bg-coral-soft/50' : 'border-line hover:bg-surface-2'
        return (
          <label key={i} className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${cls}`}>
            <input type="radio" name={name} className="mt-1 accent-[var(--coral)]" checked={value === i} disabled={checked} onChange={() => onChange(i)} />
            <span><span className="text-ink">{o.text}</span>{show && <span className="mt-0.5 block text-xs leading-relaxed text-ink-2">{o.note}</span>}</span>
          </label>
        )
      })}
    </div>
  )
}

function ProblemCard({ p: raw, onDone }: { p: Problem; onDone?: (score: number) => void }) {
  const p = useMemo(() => {
    const po = shuffle(raw.primary.map((_, i) => i)), so = shuffle(raw.secondary.map((_, i) => i))
    return { ...raw, primary: po.map(i => raw.primary[i]), pAns: po.indexOf(raw.pAns), secondary: so.map(i => raw.secondary[i]), sAns: so.indexOf(raw.sAns) }
  }, [raw])
  const [pv, setPv] = useState<number | null>(null)
  const [sv, setSv] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const ok = pv === p.pAns && sv === p.sAns
  const check = () => {
    setChecked(true)
    if (!ok) update(x => { x.mistakes.push({ at: Date.now(), tag: 'metric-type', lesson: '1.3.2' }) })
    onDone?.((pv === p.pAns ? 1 : 0) + (sv === p.sAns ? 1 : 0))
  }
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">{p.title}</h3>
        <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{p.context}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <fieldset><legend className="label">Primary metric (the project Y)</legend><OptionList name={`${p.id}-p`} opts={p.primary} value={pv} onChange={setPv} answer={p.pAns} checked={checked} /></fieldset>
        <fieldset><legend className="label">Secondary metric (guardrail that must not worsen)</legend><OptionList name={`${p.id}-s`} opts={p.secondary} value={sv} onChange={setSv} answer={p.sAns} checked={checked} /></fieldset>
      </div>
      {!checked && <button className="btn btn-primary" disabled={pv === null || sv === null} onClick={check}>Check</button>}
      {checked && <Feedback ok={ok}>{ok ? 'Right pair: the primary metric is the Y in the goal statement; the secondary metric protects against a side effect.' : 'Primary means the Y in the problem and goal statements. Secondary means a guardrail that must not get worse as the Y improves.'}</Feedback>}
    </div>
  )
}

function TypeTrainer() {
  const [order, setOrder] = useState(() => shuffle(METRICS.map((_, i) => i)))
  const [k, setK] = useState(0)
  const [type, setType] = useState<MType | null>(null)
  const [lag, setLag] = useState<Lag | null>(null)
  const m = METRICS[order[k % order.length]]
  const next = () => { if (k + 1 >= order.length) { setOrder(shuffle(order)); setK(0) } else setK(k + 1); setType(null); setLag(null) }
  return (
    <div className="rounded-2xl border border-line p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-ink">Classify the metric</h3>
        <span className="tabular text-xs text-ink-3">{k + 1} of {order.length}</span>
      </div>
      <motion.p key={m.text} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 rounded-xl bg-surface-2 px-3 py-2.5 font-semibold text-ink">{m.text}</motion.p>
      <div className="mt-3 space-y-3">
        <div>
          <div className="label">Type</div>
          <div className="grid grid-cols-3 gap-2">
            {(['outcome', 'process', 'financial'] as MType[]).map(t => {
              const show = type !== null
              const cls = show && t === m.type ? 'border-good bg-good-soft' : show && t === type ? 'border-bad bg-bad-soft' : 'border-line hover:bg-surface-2'
              return <button key={t} disabled={show} onClick={() => { setType(t); if (t !== m.type) update(x => { x.mistakes.push({ at: Date.now(), tag: 'metric-type', lesson: '1.3.2' }) }) }} className={`rounded-xl border px-2 py-2 text-sm font-semibold capitalize text-ink transition-colors disabled:cursor-default ${cls}`}>{t}</button>
            })}
          </div>
        </div>
        <div>
          <div className="label flex items-center gap-2">Leading or lagging <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[11px] font-semibold text-amber">Supplementary</span></div>
          <div className="grid grid-cols-2 gap-2">
            {(['leading', 'lagging'] as Lag[]).map(t => {
              const show = lag !== null
              const cls = show && t === m.lag ? 'border-good bg-good-soft' : show && t === lag ? 'border-bad bg-bad-soft' : 'border-line hover:bg-surface-2'
              return <button key={t} disabled={show} onClick={() => setLag(t)} className={`rounded-xl border px-2 py-2 text-sm font-semibold capitalize text-ink transition-colors disabled:cursor-default ${cls}`}>{t}</button>
            })}
          </div>
        </div>
      </div>
      {type && lag && <><Feedback ok={type === m.type && lag === m.lag}><strong className="capitalize">{m.type}, {m.lag}.</strong> {m.why}</Feedback><button className="btn btn-soft btn-sm mt-3" onClick={next}>Next metric</button></>}
      <p className="mt-3 text-xs leading-relaxed text-ink-3">Leading indicators move early and predict a result; lagging indicators report it afterwards. This distinction is widely used supporting context, not part of the supplied sources.</p>
    </div>
  )
}

function Challenge() {
  const [mode, setMode] = useState<'pair' | 'types'>('pair')
  const [seed, setSeed] = useState(0)
  const set = useMemo(() => shuffle(PROBLEMS).slice(0, 3), [seed]) // eslint-disable-line react-hooks/exhaustive-deps
  const [scores, setScores] = useState<Record<string, number>>({})
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const finished = set.every(p => scores[p.id] !== undefined)
  return (
    <div className="space-y-4">
      <Segmented label="Challenge type" value={mode} onChange={setMode} options={[{ value: 'pair', label: 'Primary and secondary' }, { value: 'types', label: 'Metric types' }]} size="sm" />
      {mode === 'pair' ? (
        <div className="space-y-6">
          {set.map((p, i) => (
            <div key={`${seed}-${p.id}`} className="rounded-2xl border border-line p-4">
              <div className="mb-1 text-xs font-semibold text-ink-3 tabular">Problem {i + 1} of {set.length}</div>
              <ProblemCard p={p} onDone={s => {
                const n = { ...scores, [p.id]: s }
                setScores(n)
                if (set.every(q => n[q.id] !== undefined)) recordLab('metrics', Math.round((Object.values(n).reduce((a, b) => a + b, 0) / (set.length * 2)) * 100))
              }} />
            </div>
          ))}
          {finished && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-coral-soft p-4">
              <span className="font-semibold text-ink tabular">{total} of {set.length * 2} picks correct.</span>
              <button className="btn btn-primary btn-sm ml-auto" onClick={() => { setSeed(s => s + 1); setScores({}) }}>New problems</button>
            </div>
          )}
        </div>
      ) : (
        <ClassifierGame lab="metrics" items={TYPE_ITEMS} buckets={TYPE_BUCKETS} count={9} timed />
      )}
    </div>
  )
}

const CHECK: CheckItem[] = [
  { q: 'What is the PRIMARY metric of a project?', options: ['The cheapest metric to collect', 'The Y in the problem and goal statements', 'Any metric the Champion likes', 'The cost of the project'], answer: 1, why: 'The primary metric is the single measure the project exists to improve.' },
  { q: 'A contact centre cuts handle time. Which is the best secondary metric?', options: ['Handle time', 'Repeat contacts within 7 days', 'Calls offered', 'Number of agents'], answer: 1, why: 'Secondary metrics are guardrails: shorter calls must not drive customers to call back.' },
  { q: '"Tickets assigned within 10 minutes" is best described as a...', options: ['Financial metric', 'Outcome metric', 'Process metric', 'Customer satisfaction score'], answer: 2, why: 'It describes how the work is done inside the process; it often predicts the outcome.' },
  { q: 'A metric improves from 81.3% to 90.2%. That is an improvement of...', options: ['8.9 percentage points', '8.9%', '90.2%', '81.3 percentage points'], answer: 0, why: 'The difference is 8.9 percentage points, which is about 10.9% in relative terms.' },
]

export default function MetricsLab({ embedded }: LabProps) {
  const [idx, setIdx] = useState(0)
  const [key, setKey] = useState(0)
  const explore = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-line p-4"><ProblemCard key={`${idx}-${key}`} p={PROBLEMS[idx]} /></div>
      <TypeTrainer />
    </div>
  )
  return (
    <LabShell
      lab="metrics"
      embedded={embedded}
      instructions="For each business problem pick the primary metric (the project Y) and a secondary metric (a guardrail that must not worsen), then check. On the right, classify metrics as outcome, process or financial, and as leading or lagging."
      scenario="You are filling in the metrics section of a charter. Your Champion asks: what will we improve, and what must we protect while we do it?"
      explore={explore}
      challenge={<Challenge />}
      check={<KnowledgeCheck lab="metrics" items={CHECK} />}
      onReset={() => setKey(k => k + 1)}
      onNewExample={() => { setIdx(i => (i + 1) % PROBLEMS.length); setKey(k => k + 1) }}
    />
  )
}
