import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, CircleCheck, CircleX, Plus, RotateCcw, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { recordLab, update } from '../lib/store'
import { fmt } from '../lib/metrics'
import { Feedback, KnowledgeCheck, LabShell, NumberField } from './kit'
import type { LabProps } from './registry'

const EASE = [0.23, 1, 0.32, 1] as const
const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] } return r }

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

type UnitKey = 'seconds' | 'minutes' | 'hours' | 'days' | '%' | 'count'
const UNITS: UnitKey[] = ['seconds', 'minutes', 'hours', 'days', '%', 'count']
const UNIT_SHORT: Record<UnitKey, string> = { seconds: 's', minutes: 'min', hours: 'h', days: 'days', '%': '%', count: '' }
type LimitKind = 'USL' | 'LSL' | 'none'

interface Spec { metric: string; unit: UnitKey; limit: 'USL' | 'LSL'; def: string; target: number; limitValue: number }
interface Driver { id: string; label: string; spec?: Spec; poorWhy?: string }
interface Need { id: string; statement: string; short: string; who: string; drivers: Driver[]; business: string; solution: string }

const NEEDS: Need[] = [
  {
    id: 'fast', statement: 'I want fast service', short: 'Fast service', who: 'Northwind Fibre residential customers, from complaint calls and a survey',
    business: 'Average cost per call handled', solution: 'Number of new agents hired',
    drivers: [
      { id: 'answer', label: 'Speed of answer', spec: { metric: 'Time from call entering the queue to an agent answering', unit: 'seconds', limit: 'USL', def: 'Clock starts when the call leaves the menu and joins the queue; stops when an agent connects. Abandoned calls are reported separately.', target: 20, limitValue: 30 } },
      { id: 'restore', label: 'Time to restore a fault', spec: { metric: 'Elapsed time from fault report to service restored', unit: 'hours', limit: 'USL', def: 'Starts at the fault ticket time stamp; stops when the line test passes and the customer confirms service.', target: 4, limitValue: 8 } },
      { id: 'visit', label: 'Wait for an engineer visit', spec: { metric: 'Calendar days from booking request to first appointment offered', unit: 'days', limit: 'USL', def: 'Counted from the date the customer asks for a visit to the date of the first slot offered, weekends included.', target: 2, limitValue: 3 } },
      { id: 'quicker', label: 'Be quicker', poorWhy: 'This restates the need in other words. There is still nothing to measure.' },
      { id: 'hire', label: 'Hire more agents', poorWhy: 'This is a solution, not something the customer values. Drivers describe what matters to the customer.' },
    ],
  },
  {
    id: 'bill', statement: 'My bill should be right', short: 'Right bill', who: 'Kestrel Mobile post-pay customers, from billing complaints',
    business: 'Billing team salary cost', solution: 'Share of accounts migrated to the new billing platform',
    drivers: [
      { id: 'accurate', label: 'Correct charges', spec: { metric: 'Percentage of bills with no charge corrected after issue', unit: '%', limit: 'LSL', def: 'A bill counts as correct if no adjustment is raised against it within 60 days of issue.', target: 99.5, limitValue: 99 } },
      { id: 'ontime', label: 'Bill arrives on time', spec: { metric: 'Days from billing period end to bill delivered', unit: 'days', limit: 'USL', def: 'From the last day of the billing period to the date the e-bill is sent or the paper bill posted.', target: 3, limitValue: 5 } },
      { id: 'clear', label: 'Charges easy to understand', spec: { metric: 'Percentage of bills that trigger an explanation call within 30 days', unit: '%', limit: 'USL', def: 'Calls coded "bill query: explanation" within 30 days of issue, divided by bills issued that month.', target: 2, limitValue: 4 } },
      { id: 'better', label: 'Better billing', poorWhy: 'Vague: better in what way? A driver must point at one aspect of the need.' },
      { id: 'system', label: 'Install a new billing system', poorWhy: 'A solution. Jumping to solutions in Define closes off better options.' },
    ],
  },
  {
    id: 'ftf', statement: 'The engineer should fix it the first time', short: 'Fixed first time', who: 'Northwind Fibre customers who needed a home visit',
    business: 'Engineer jobs completed per day', solution: 'Number of tablets issued to engineers',
    drivers: [
      { id: 'firstvisit', label: 'Fixed on the first visit', spec: { metric: 'Percentage of faults resolved with no repeat visit within 30 days', unit: '%', limit: 'LSL', def: 'A fault counts as fixed first time if no new fault ticket is raised on the same line within 30 days of the visit.', target: 92, limitValue: 85 } },
      { id: 'parts', label: 'Engineer has the right part', spec: { metric: 'Percentage of visits needing a part where it was on the van', unit: '%', limit: 'LSL', def: 'From job closure codes: visits where the needed part was on the van, divided by all visits that needed a part.', target: 95, limitValue: 90 } },
      { id: 'slot', label: 'Engineer arrives in the booked slot', spec: { metric: 'Percentage of visits started within the booked time slot', unit: '%', limit: 'LSL', def: 'Engineer check-in time stamp compared with the slot confirmed to the customer the day before.', target: 98, limitValue: 95 } },
      { id: 'care', label: 'Engineers should care more', poorWhy: 'Not observable or measurable, and it blames people rather than describing what the customer receives.' },
      { id: 'tablet', label: 'Give every engineer a tablet', poorWhy: 'A solution, not a customer requirement.' },
    ],
  },
  {
    id: 'inform', statement: 'Keep me informed', short: 'Keep me informed', who: 'Business customers affected by outages, from account manager feedback',
    business: 'Monthly SMS messaging cost', solution: 'Downloads of a new customer app',
    drivers: [
      { id: 'outage', label: 'Told about outages early', spec: { metric: 'Time from outage detection to first customer notification', unit: 'minutes', limit: 'USL', def: 'From the network operations alarm time stamp to the time the first SMS is sent to affected customers.', target: 15, limitValue: 30 } },
      { id: 'status', label: 'Order status is accurate', spec: { metric: 'Percentage of order status checks showing the correct stage', unit: '%', limit: 'LSL', def: 'Weekly sample of 200 orders: status shown to the customer compared with the provisioning system.', target: 99, limitValue: 97 } },
      { id: 'eta', label: 'Reliable arrival time', spec: { metric: 'Gap between promised and actual engineer arrival', unit: 'minutes', limit: 'USL', def: 'Absolute difference between the ETA sent on the morning of the visit and the engineer check-in time.', target: 15, limitValue: 30 } },
      { id: 'comm', label: 'Communicate better', poorWhy: 'Vague: there is no way to tell whether it has been achieved.' },
      { id: 'app', label: 'Launch a new customer app', poorWhy: 'A solution. The customer wants information, not necessarily an app.' },
    ],
  },
]

type MetricKind = 'good' | 'vague' | 'business' | 'solution'
interface MetricOpt { text: string; kind: MetricKind }
const VAGUE_DEFS = ['Checked by the team whenever there is time', 'The supervisor\'s judgement at the end of each week']

interface Built { driverId: string; spec: Spec; target: number; limitValue: number; within: number }

/* ------------------------------------------------------------------ */
/* Tree                                                                */
/* ------------------------------------------------------------------ */

const trunc = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}.` : s)

function Tree({ need, picked, built }: { need: Need; picked: string[]; built: Built[] }) {
  const ds = need.drivers.filter(d => picked.includes(d.id))
  const H = Math.max(240, ds.length * 76 + 40)
  const rootY = H / 2
  const y = (i: number) => (ds.length <= 1 ? rootY : 40 + (i * (H - 80)) / (ds.length - 1))
  return (
    <svg viewBox={`0 0 720 ${H}`} className="h-auto w-full" role="img"
      aria-label={`CTQ tree for "${need.statement}". Drivers: ${ds.map(d => d.label).join(', ') || 'none yet'}. CTQs: ${built.length}.`}>
      <rect x={8} y={rootY - 34} width={168} height={68} rx={16} fill="var(--violet-soft)" stroke="var(--violet)" />
      <text x={92} y={rootY - 8} textAnchor="middle" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">Need</text>
      <text x={92} y={rootY + 12} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">{trunc(need.short, 20)}</text>
      <AnimatePresence>
        {ds.map((d, i) => {
          const b = built.find(x => x.driverId === d.id)
          const poor = !d.spec
          return (
            <motion.g key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <motion.path d={`M 176 ${rootY} C 210 ${rootY}, 214 ${y(i)}, 248 ${y(i)}`} fill="none" stroke={poor ? 'var(--coral)' : 'var(--teal)'} strokeWidth={2}
                strokeDasharray={poor ? '5 5' : undefined} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: EASE }} />
              <rect x={248} y={y(i) - 24} width={200} height={48} rx={12} fill={poor ? 'var(--coral-soft)' : 'var(--teal-soft)'} stroke={poor ? 'var(--coral)' : 'var(--teal)'} strokeDasharray={poor ? '5 4' : undefined} />
              <text x={348} y={y(i) - 5} textAnchor="middle" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">{poor ? 'Weak driver' : 'Driver'}</text>
              <text x={348} y={y(i) + 12} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ink)" fontFamily="var(--font-sans)">{trunc(d.label, 26)}</text>
              {b && (
                <motion.g initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}>
                  <motion.path d={`M 448 ${y(i)} L 478 ${y(i)}`} stroke="var(--good)" strokeWidth={2} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />
                  <rect x={478} y={y(i) - 28} width={234} height={56} rx={12} fill="var(--good-soft)" stroke="var(--good)" />
                  <text x={595} y={y(i) - 8} textAnchor="middle" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">CTQ</text>
                  <text x={595} y={y(i) + 12} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">
                    {b.spec.limit === 'USL' ? '≤' : '≥'} {fmt(b.limitValue)} {UNIT_SHORT[b.spec.unit]}, {fmt(b.within)}% of cases
                  </text>
                </motion.g>
              )}
              {!b && !poor && <text x={595} y={y(i) + 4} textAnchor="middle" fontSize={12} fill="var(--ink-3)" fontFamily="var(--font-sans)">CTQ not built yet</text>}
            </motion.g>
          )
        })}
      </AnimatePresence>
      {ds.length === 0 && <text x={460} y={rootY + 4} textAnchor="middle" fontSize={13} fill="var(--ink-3)" fontFamily="var(--font-sans)">Pick drivers to grow the tree</text>}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Builder                                                             */
/* ------------------------------------------------------------------ */

function Builder({ need, driver, onAdd }: { need: Need; driver: Driver & { spec: Spec }; onAdd: (b: Built) => void }) {
  const metrics = useMemo<MetricOpt[]>(() => shuffle([
    { text: driver.spec.metric, kind: 'good' },
    { text: `How satisfied customers feel about ${driver.label.toLowerCase()}`, kind: 'vague' },
    { text: need.business, kind: 'business' },
    { text: need.solution, kind: 'solution' },
  ]), [driver, need])
  const defs = useMemo(() => shuffle([driver.spec.def, ...VAGUE_DEFS]), [driver])
  const [m, setM] = useState<number | null>(null)
  const [d, setD] = useState<number | null>(null)
  const [unit, setUnit] = useState<UnitKey | ''>('')
  const [limit, setLimit] = useState<LimitKind>('none')
  const [limitValue, setLimitValue] = useState(0)
  const [target, setTarget] = useState(0)
  const [within, setWithin] = useState(95)

  const metric = m === null ? null : metrics[m]
  const s = driver.spec
  const better = (a: number, b: number) => (s.limit === 'USL' ? a <= b : a >= b)
  const rules = [
    { ok: !!metric && metric.kind !== 'vague', label: 'Measurable', why: metric?.kind === 'vague' ? 'Feelings about speed are not a measurable characteristic. Pick something you can count or time.' : 'Choose a metric you can count or time.' },
    { ok: !!metric && metric.kind !== 'business', label: 'Customer-focused', why: metric?.kind === 'business' ? 'That is a business KPI. It matters to us, not to the customer\'s experience.' : 'The metric should reflect what the customer experiences.' },
    { ok: !!metric && metric.kind !== 'solution', label: 'Free of solution language', why: metric?.kind === 'solution' ? 'This measures a solution being deployed, not the requirement.' : 'Describe the requirement, not a fix.' },
    { ok: d !== null && defs[d] === s.def, label: 'Precise operational definition', why: 'Two people measuring the same case must get the same answer: say when the clock starts and stops, or what counts.' },
    { ok: metric?.kind === 'good' && unit === s.unit, label: 'Has the right unit', why: metric?.kind === 'good' ? `This metric is measured in ${s.unit}.` : 'Pick a good metric first, then its unit.' },
    { ok: limit === s.limit && limitValue > 0, label: 'Has a specification limit', why: limit === 'none' ? 'Without a limit you cannot say whether a case is a defect.' : limit !== s.limit ? `For this metric ${s.limit === 'USL' ? 'smaller is better, so set an upper' : 'bigger is better, so set a lower'} specification limit.` : 'Enter a limit value above zero.' },
    { ok: target > 0 && limit === s.limit && limitValue > 0 && better(target, limitValue) && (unit !== '%' || (target <= 100 && limitValue <= 100)), label: 'Target sits inside the limit', why: 'The target is the ideal; the limit is the edge of acceptable. The target must be on the good side of the limit.' },
    { ok: within >= 50 && within <= 100, label: 'States how often the limit must be met', why: 'Say what share of cases must meet the limit, for example 95%.' },
  ]
  const passed = rules.filter(r => r.ok).length
  const all = passed === rules.length
  const statement = metric && unit && limit !== 'none'
    ? `${metric.text}: target ${fmt(target)} ${unit}, ${limit === 'USL' ? 'no more than' : 'at least'} ${fmt(limitValue)} ${unit} (${limit}) for ${fmt(within)}% of cases.`
    : 'Choose a metric, unit and limit to see the CTQ statement.'

  return (
    <div className="space-y-4 rounded-2xl border border-line p-4">
      <h4 className="font-display text-base font-semibold text-ink">Build a CTQ for "{driver.label}"</h4>
      <fieldset>
        <legend className="label">1. Metric</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {metrics.map((o, j) => (
            <button key={o.text} type="button" aria-pressed={m === j} onClick={() => setM(j)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${m === j ? 'border-violet bg-violet-soft' : 'border-line hover:border-line-2'}`}>{o.text}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">2. Operational definition</legend>
        <div className="space-y-2">
          {defs.map((o, j) => (
            <button key={o} type="button" aria-pressed={d === j} onClick={() => setD(j)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition-colors ${d === j ? 'border-violet bg-violet-soft' : 'border-line hover:border-line-2'}`}>{o}</button>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="ctq-unit">3. Unit</label>
          <select id="ctq-unit" className="field" value={unit} onChange={e => setUnit(e.target.value as UnitKey)}>
            <option value="">Choose</option>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="ctq-limit">4. Specification limit</label>
          <select id="ctq-limit" className="field" value={limit} onChange={e => setLimit(e.target.value as LimitKind)}>
            <option value="none">None</option>
            <option value="USL">Upper (USL)</option>
            <option value="LSL">Lower (LSL)</option>
          </select>
        </div>
        <NumberField id="ctq-lv" label="Limit value" value={limitValue} onChange={setLimitValue} step={0.5} />
        <NumberField id="ctq-t" label="5. Target" value={target} onChange={setTarget} step={0.5} />
        <NumberField id="ctq-w" label="Cases within limit" value={within} onChange={setWithin} min={0} max={100} suffix="%" />
      </div>

      <div className="rounded-xl bg-surface-2/70 p-3 text-sm text-ink"><span className="font-semibold">CTQ statement: </span>{statement}</div>

      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="text-sm font-semibold text-ink-2">Checks passed {passed} of {rules.length}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3"><motion.div className="h-full rounded-full bg-good" initial={false} animate={{ width: `${(passed / rules.length) * 100}%` }} transition={{ duration: 0.4, ease: EASE }} /></div>
        </div>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {rules.map(r => (
            <li key={r.label} className="flex gap-2 text-sm">
              {r.ok ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-good" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-bad" />}
              <span><span className="font-semibold text-ink">{r.label}.</span> {!r.ok && <span className="text-ink-2">{r.why}</span>}</span>
            </li>
          ))}
        </ul>
      </div>
      <button className="btn btn-primary" disabled={!all} onClick={() => onAdd({ driverId: driver.id, spec: s, target, limitValue, within })}><Plus className="size-4" /> Add CTQ to the tree</button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Challenge: spot the good CTQ                                        */
/* ------------------------------------------------------------------ */

interface Cand { text: string; good: boolean; flaw: string }
const SETS: { need: string; cands: Cand[] }[] = [
  { need: 'Customers say: "I want my call answered quickly."', cands: [
    { text: '95% of calls answered by an agent within 30 seconds of joining the queue', good: true, flaw: 'Metric, unit, limit and coverage are all stated.' },
    { text: 'Answer calls faster', good: false, flaw: 'No metric, no unit, no limit.' },
    { text: 'Hire 10 more agents by June', good: false, flaw: 'A solution, not a requirement.' },
    { text: 'Cut cost per call by 10%', good: false, flaw: 'A business goal, not customer-focused.' }] },
  { need: 'Customers say: "My bill should be right."', cands: [
    { text: 'At least 99% of bills issued with no charge corrected within 60 days', good: true, flaw: 'Measurable with a clear definition and a lower limit.' },
    { text: 'Bills should be accurate', good: false, flaw: 'Restates the need; nothing to measure.' },
    { text: 'Move all accounts to the new billing platform', good: false, flaw: 'A solution.' },
    { text: 'Track bill accuracy every month', good: false, flaw: 'Has a metric but no limit, so no way to call a bill defective.' }] },
  { need: 'Customers say: "Fix it the first time."', cands: [
    { text: 'At least 90% of faults resolved with no repeat visit within 30 days', good: true, flaw: 'Clear metric, window, and lower limit.' },
    { text: 'Engineers should fix faults properly', good: false, flaw: 'Vague and not measurable.' },
    { text: 'Engineers complete 8 jobs per day', good: false, flaw: 'Productivity KPI; may even work against fixing first time.' },
    { text: 'Report repeat visits weekly', good: false, flaw: 'A reporting activity with no limit.' }] },
  { need: 'Business customers say: "Keep me informed during outages."', cands: [
    { text: 'Affected customers receive an outage SMS within 15 minutes of detection, 95% of the time', good: true, flaw: 'Start point, unit, limit and coverage are all there.' },
    { text: 'Keep customers in the loop', good: false, flaw: 'Vague.' },
    { text: 'Send more SMS messages', good: false, flaw: 'A solution with no limit.' },
    { text: 'Reduce SMS costs by 20%', good: false, flaw: 'Business-focused, not what the customer asked for.' }] },
  { need: 'Suppliers say: "Pay our invoices on time."', cands: [
    { text: '95% of approved invoices paid within 30 calendar days of receipt', good: true, flaw: 'Measurable, with a start point and an upper limit.' },
    { text: 'Pay suppliers promptly', good: false, flaw: 'No metric or limit.' },
    { text: 'Implement automated invoice scanning', good: false, flaw: 'A solution.' },
    { text: 'Reduce accounts payable headcount by two', good: false, flaw: 'A cost goal, not a supplier requirement.' }] },
  { need: 'Customers say: "Get me connected quickly."', cands: [
    { text: 'New connections live within 10 working days of order for at least 90% of orders', good: true, flaw: 'Metric, unit, limit and coverage stated.' },
    { text: 'Fast installation', good: false, flaw: 'A need, not a CTQ.' },
    { text: 'Average installation time', good: false, flaw: 'A metric with no limit; averages also hide long waits.' },
    { text: 'Engineers to work weekends', good: false, flaw: 'A solution.' }] },
  { need: 'Business customers say: "Restore my line fast."', cands: [
    { text: 'Business-line faults restored within 4 hours of the ticket time stamp for 95% of faults', good: true, flaw: 'Precise start point, unit, limit and coverage.' },
    { text: 'Restore faults as fast as possible', good: false, flaw: 'No limit: "as fast as possible" cannot be tested.' },
    { text: 'Send the MTTR report weekly', good: false, flaw: 'Reporting is not a requirement.' },
    { text: 'Buy more spare parts', good: false, flaw: 'A potential solution, to be tested in Improve.' }] },
]

function Challenge() {
  const TOTAL = 5
  const [round, setRound] = useState(0)
  const qs = useMemo(() => shuffle(SETS).slice(0, TOTAL).map(s => ({ ...s, cands: shuffle(s.cands) })), [round])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [marks, setMarks] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const q = qs[i]
  const choose = (j: number) => {
    if (picked !== null) return
    setPicked(j)
    const ok = q.cands[j].good
    if (!ok) update(p => { p.mistakes.push({ at: Date.now(), tag: 'ctq-vague' }) })
    setMarks(m => [...m, ok])
  }
  const next = () => {
    if (i + 1 >= TOTAL) { recordLab('ctq', Math.round((marks.filter(Boolean).length / TOTAL) * 100)); setDone(true) }
    else { setI(i + 1); setPicked(null) }
  }
  const again = () => { setRound(r => r + 1); setI(0); setPicked(null); setMarks([]); setDone(false) }
  if (done) {
    const right = marks.filter(Boolean).length
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-teal-soft p-5">
        <Trophy className="size-6 text-teal" />
        <div className="flex-1">
          <div className="font-display text-lg font-semibold text-ink">{right} of {TOTAL} correct</div>
          <p className="text-sm text-ink-2">A good CTQ has a metric, a unit, a limit and stays focused on the customer.</p>
        </div>
        <button className="btn btn-primary" onClick={again}><RotateCcw className="size-4" /> New challenge</button>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-2">Five rounds. Each shows a customer statement and four candidate CTQs. Pick the one that is measurable, customer-focused, has a unit and a limit, and avoids solution language.</p>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-ink-2">Round {i + 1} of {TOTAL}</span>
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {Array.from({ length: TOTAL }, (_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k < marks.length ? (marks[k] ? 'bg-good' : 'bg-bad') : k === i ? 'bg-violet' : 'bg-surface-3'}`} />)}
        </div>
      </div>
      <div className="rounded-2xl bg-violet-soft/60 p-4 font-semibold text-ink">{q.need}</div>
      <div className="grid gap-2">
        {q.cands.map((c, j) => {
          const show = picked !== null
          return (
            <button key={c.text} disabled={show} onClick={() => choose(j)}
              className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${show && c.good ? 'border-good bg-good-soft' : show && picked === j ? 'border-bad bg-bad-soft' : 'border-line hover:border-violet hover:bg-violet-soft/40'} disabled:cursor-default`}>
              <span className="text-ink">{c.text}</span>
              {show && <span className="mt-1 block text-xs text-ink-2">{c.good ? 'Good CTQ: ' : 'Weak: '}{c.flaw}</span>}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <>
          <Feedback ok={q.cands[picked].good}>{q.cands[picked].good ? 'Correct. This one could be measured case by case and judged pass or fail.' : 'Not this one. Read the notes under each candidate.'}</Feedback>
          <button className="btn btn-primary" onClick={next}>{i + 1 >= TOTAL ? 'See score' : 'Next round'} <ArrowRight className="size-4" /></button>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function CtqLab({ embedded }: LabProps) {
  const [needId, setNeedId] = useState(NEEDS[0].id)
  const [order, setOrder] = useState(0)
  const need = NEEDS.find(n => n.id === needId)!
  const drivers = useMemo(() => (order === 0 ? need.drivers : shuffle(need.drivers)), [need, order])
  const [picked, setPicked] = useState<string[]>([])
  const [built, setBuilt] = useState<Built[]>([])
  const [active, setActive] = useState<string | null>(null)

  const choose = (id: string) => {
    setNeedId(id); setPicked([]); setBuilt([]); setActive(null)
  }
  const toggle = (d: Driver) => {
    setPicked(p => (p.includes(d.id) ? p.filter(x => x !== d.id) : [...p, d.id]))
    if (picked.includes(d.id)) { setBuilt(b => b.filter(x => x.driverId !== d.id)); if (active === d.id) setActive(null) }
    else if (d.spec && !built.some(b => b.driverId === d.id)) setActive(d.id)
  }
  const activeDriver = need.drivers.find(d => d.id === active && d.spec) as (Driver & { spec: Spec }) | undefined
  const lastPicked = need.drivers.find(d => d.id === picked[picked.length - 1])

  const explore = (
    <div className="space-y-5">
      <div>
        <div className="label">Customer statement</div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Customer statements">
          {NEEDS.map(n => (
            <button key={n.id} onClick={() => choose(n.id)} aria-pressed={needId === n.id}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${needId === n.id ? 'border-violet bg-violet-soft text-ink' : 'border-line text-ink-2 hover:border-line-2'}`}>"{n.statement}"</button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-3">Source: {need.who}.</p>
      </div>

      <div className="rounded-2xl border border-line p-3"><Tree need={need} picked={picked} built={built} /></div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-ink">Choose drivers</h3>
          <p className="text-sm text-ink-2">Which aspects of "{need.statement}" would the customer notice? Some options are vague or are solutions in disguise.</p>
          <div className="space-y-2">
            {drivers.map(d => {
              const on = picked.includes(d.id)
              const isBuilt = built.some(b => b.driverId === d.id)
              return (
                <div key={d.id} className="flex items-center gap-2">
                  <button aria-pressed={on} onClick={() => toggle(d)}
                    className={`flex-1 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${on ? (d.spec ? 'border-teal bg-teal-soft' : 'border-coral bg-coral-soft') : 'border-line hover:border-line-2'}`}>
                    {d.label}{isBuilt && <span className="ml-2 text-xs font-semibold text-good">CTQ built</span>}
                  </button>
                  {on && d.spec && !isBuilt && active !== d.id && <button className="btn btn-soft btn-sm" onClick={() => setActive(d.id)}>Build CTQ</button>}
                </div>
              )
            })}
          </div>
          {lastPicked && !lastPicked.spec && <Feedback ok={false}><strong>{lastPicked.label}</strong> is a weak driver. {lastPicked.poorWhy}</Feedback>}
        </div>

        <div className="min-w-0 space-y-4">
          {activeDriver ? (
            <Builder key={activeDriver.id} need={need} driver={activeDriver} onAdd={b => { setBuilt(x => [...x.filter(y => y.driverId !== b.driverId), b]); setActive(null) }} />
          ) : (
            <div className="rounded-2xl border border-dashed border-line-2 p-6 text-center text-sm text-ink-3">Pick a good driver, then build a measurable CTQ for it here.</div>
          )}
          {built.length > 0 && (
            <ul className="space-y-2">
              {built.map(b => {
                const d = need.drivers.find(x => x.id === b.driverId)!
                return (
                  <li key={b.driverId} className="rounded-xl bg-good-soft/60 px-3 py-2 text-sm text-ink">
                    <strong>{d.label}:</strong> {b.spec.metric}, target {fmt(b.target)} {b.spec.unit}, {b.spec.limit} {fmt(b.limitValue)} {b.spec.unit}, {fmt(b.within)}% of cases.
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-amber-soft/60 p-4 text-sm leading-relaxed text-ink-2">
        <h3 className="mb-1 font-display text-base font-semibold text-ink">Why "fast service" is not enough</h3>
        A vague statement cannot tell you whether a single case passed or failed, so you cannot count defects, calculate a sigma level or prove an improvement. Keep decomposing until you have a metric, a unit, an operational definition and a limit agreed with the customer. Specification limits come from the voice of the customer; control limits come from process data.
      </div>
    </div>
  )

  return (
    <LabShell
      lab="ctq"
      embedded={embedded}
      instructions="Choose a customer statement, pick the drivers that really matter to the customer, then build a CTQ for each by choosing a metric, an operational definition, a unit, a specification limit and a target. Rule-based checks tell you what is still missing. Each complete CTQ grows a branch on the tree."
      scenario={<>{need.who.split(',')[0]} keep saying: "{need.statement}". Turn that into requirements the operations team can measure.</>}
      onReset={() => { setOrder(0); choose(NEEDS[0].id) }}
      onNewExample={() => { const others = NEEDS.filter(n => n.id !== needId); choose(others[Math.floor(Math.random() * others.length)].id); setOrder(o => o + 1) }}
      explore={explore}
      challenge={<Challenge />}
      check={<KnowledgeCheck lab="ctq" items={[
        { q: 'Which of these is a CTQ rather than a need or a driver?', options: ['Fast service', 'Speed of answer', '95% of calls answered within 30 seconds', 'Hire more agents'], answer: 2, why: 'Fast service is the need, speed of answer the driver; the CTQ has a metric, a unit and a limit.' },
        { q: 'Why does a CTQ need an operational definition?', options: ['To make it sound professional', 'So different people measuring the same case get the same result', 'To set the control limits', 'To name the solution'], answer: 1, why: 'Operational definitions give consistent measurement: when the clock starts and stops, what counts.' },
        { q: 'Where do specification limits come from?', options: ['Process data', 'The voice of the customer', 'The project budget', 'The control chart'], answer: 1, why: 'Specification limits express what the customer will accept. Control limits come from process data.' },
        { q: 'A proposed CTQ reads "Reduce cost per call by 10%". What is wrong with it?', options: ['It has no unit', 'It is a business goal, not a customer requirement', 'It is too precise', 'Nothing'], answer: 1, why: 'Cost per call matters to the business, but customers do not experience it. A CTQ must be critical to the customer\'s view of quality.' },
      ]} />}
    />
  )
}
