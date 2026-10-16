import { motion } from 'motion/react'
import { useState } from 'react'
import type { LabProps } from './registry'
import { ClassifierGame, Feedback, KnowledgeCheck, LabShell, type Bucket, type CheckItem, type ClassItem } from './kit'
import { Segmented } from '../components/ui'
import { pct } from '../lib/metrics'
import { update } from '../lib/store'

type Cat = 'va' | 'rnva' | 'waste'
interface Step { id: string; name: string; min: number; cat: Cat; queue?: boolean; form: boolean; pay: boolean; rft: boolean; required: boolean; why: string }
interface Proc { id: string; name: string; intro: string; steps: Step[] }

const PROCS: Proc[] = [
  {
    id: 'broadband', name: 'Broadband order', intro: 'A residential fibre order at Northwind Fibre, from order to working line.',
    steps: [
      { id: 'b1', name: 'Credit check with recorded consent', min: 3, cat: 'rnva', form: false, pay: false, rft: true, required: true, why: 'Adds nothing the customer would pay for, but the business and regulation require it. Simplify and automate it.' },
      { id: 'b2', name: 'Re-key the order into the provisioning system', min: 6, cat: 'waste', form: false, pay: false, rft: true, required: false, why: 'Copying data between systems changes nothing for the customer and nobody requires it.' },
      { id: 'b3', name: 'Order waits in the provisioning queue', min: 2880, cat: 'waste', queue: true, form: false, pay: false, rft: true, required: false, why: 'Two days of waiting: pure waste, and most of the lead time.' },
      { id: 'b4', name: 'Chase the customer for missing address data', min: 15, cat: 'waste', form: false, pay: false, rft: false, required: false, why: 'Fixing data that was not captured right the first time.' },
      { id: 'b5', name: 'Second supervisor approves a standard order', min: 10, cat: 'waste', form: false, pay: false, rft: true, required: false, why: 'An extra check nobody requires: overprocessing.' },
      { id: 'b6', name: 'Wait for an engineer appointment slot', min: 4320, cat: 'waste', queue: true, form: false, pay: false, rft: true, required: false, why: 'Three days in a queue add no value.' },
      { id: 'b7', name: 'Engineer splices fibre and installs the router', min: 55, cat: 'va', form: true, pay: true, rft: true, required: false, why: 'Changes the form and function of the service, the customer pays for it, done right first time.' },
      { id: 'b8', name: 'Activate the line', min: 10, cat: 'va', form: true, pay: true, rft: true, required: false, why: 'The line now works: a change in function the customer wants.' },
      { id: 'b9', name: 'Log the number port for the regulator', min: 5, cat: 'rnva', form: false, pay: false, rft: true, required: true, why: 'Required by regulation, so it stays, but keep it as small as possible.' },
      { id: 'b10', name: 'Revisit to fix a wrongly patched port', min: 60, cat: 'waste', form: true, pay: false, rft: false, required: false, why: 'It changes the line, but only because it was wrong the first time: Correction.' },
    ],
  },
  {
    id: 'discharge', name: 'Patient discharge', intro: 'A planned discharge from a medical ward, from the decision to discharge to the patient leaving.',
    steps: [
      { id: 'h1', name: 'Doctor confirms the patient is fit to go home', min: 15, cat: 'va', form: true, pay: true, rft: true, required: false, why: 'The clinical decision the patient needs: value added.' },
      { id: 'h2', name: 'Patient waits for discharge medicines', min: 240, cat: 'waste', queue: true, form: false, pay: false, rft: true, required: false, why: 'Four hours of idle waiting.' },
      { id: 'h3', name: 'Pharmacist checks and dispenses medicines', min: 20, cat: 'va', form: true, pay: true, rft: true, required: false, why: 'Prepares exactly what the patient needs.' },
      { id: 'h4', name: 'Copy patient details onto four forms', min: 25, cat: 'waste', form: false, pay: false, rft: true, required: false, why: 'Duplicated effort nobody requires: overprocessing.' },
      { id: 'h5', name: 'Record the discharge in the national reporting system', min: 5, cat: 'rnva', form: false, pay: false, rft: true, required: true, why: 'Mandatory reporting: required non-value added.' },
      { id: 'h6', name: 'Nurse explains medicines and care plan', min: 15, cat: 'va', form: true, pay: true, rft: true, required: false, why: 'Changes what the patient knows and can do at home: value the patient wants.' },
      { id: 'h7', name: 'Porter carries the notes to the records office', min: 20, cat: 'waste', form: false, pay: false, rft: true, required: false, why: 'Moving paper between locations: conveyance.' },
      { id: 'h8', name: 'Repeat a blood test after a mislabelled sample', min: 30, cat: 'waste', form: false, pay: false, rft: false, required: false, why: 'Correction: the first test was not right first time.' },
      { id: 'h9', name: 'Safeguarding check required by policy', min: 10, cat: 'rnva', form: false, pay: false, rft: true, required: true, why: 'Required by policy and law, so it stays; make it quick.' },
      { id: 'h10', name: 'Patient waits for transport home', min: 90, cat: 'waste', queue: true, form: false, pay: false, rft: true, required: false, why: 'Waiting with a bed blocked.' },
    ],
  },
]

const CAT: Record<Cat, { label: string; short: string; bar: string; chip: string }> = {
  va: { label: 'Value added', short: 'VA', bar: 'bg-good', chip: 'bg-good-soft text-good' },
  rnva: { label: 'Required non-value added', short: 'Required NVA', bar: 'bg-sky', chip: 'bg-sky-soft text-sky' },
  waste: { label: 'Waste', short: 'Waste', bar: 'bg-bad', chip: 'bg-bad-soft text-bad' },
}

const fmtMin = (m: number) => (m >= 1440 ? `${+(m / 1440).toFixed(1)} d` : m >= 60 ? `${+(m / 60).toFixed(1)} h` : `${m} min`)

function RatioBar({ steps, cats, basis, title }: { steps: Step[]; cats: Record<string, Cat | undefined>; basis: 'all' | 'touch'; title: string }) {
  const counted = steps.filter(s => cats[s.id] && (basis === 'all' || !s.queue))
  const total = counted.reduce((a, s) => a + s.min, 0)
  const by = (c: Cat) => counted.filter(s => cats[s.id] === c).reduce((a, s) => a + s.min, 0)
  const ratio = total > 0 ? by('va') / total : 0
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{title}</span>
        <span className="tabular font-display text-xl font-semibold text-ink">{total > 0 ? pct(ratio, ratio < 0.01 ? 2 : 1) : '0%'}</span>
      </div>
      <div className="mt-1.5 flex h-4 w-full overflow-hidden rounded-full bg-surface-3" role="img" aria-label={`${title}: value added ${pct(ratio, 1)} of ${fmtMin(total)}`}>
        {(['va', 'rnva', 'waste'] as Cat[]).map(c => (
          <motion.div key={c} className={`${CAT[c].bar} h-full`} initial={false} animate={{ width: total ? `${Math.max(by(c) > 0 ? 0.8 : 0, (by(c) / total) * 100)}%` : '0%' }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2 tabular">
        {(['va', 'rnva', 'waste'] as Cat[]).map(c => <span key={c} className="flex items-center gap-1.5"><span className={`size-2.5 rounded-sm ${CAT[c].bar}`} />{CAT[c].short} {fmtMin(by(c))}</span>)}
      </div>
    </div>
  )
}

const ITEMS: ClassItem[] = [
  ...PROCS.flatMap(p => p.steps.map(s => ({ id: s.id, text: s.name, bucket: s.cat, why: s.why, mistake: 'waste-confusion' as const }))),
  { id: 'x1', text: 'Print, sign and scan back every invoice', bucket: 'waste', why: 'Unneeded steps every time.', mistake: 'waste-confusion' },
  { id: 'x2', text: 'Verify identity before a SIM swap', bucket: 'rnva', why: 'Required to prevent fraud and by regulation: keep it, make it fast.', mistake: 'waste-confusion' },
  { id: 'x3', text: 'Configure the customer\'s router to their order', bucket: 'va', why: 'Changes function in a way the customer pays for.', mistake: 'waste-confusion' },
  { id: 'x4', text: 'Add tax fields to the invoice', bucket: 'rnva', why: 'Required by law, not valued by the customer.', mistake: 'waste-confusion' },
]
const BUCKETS: Bucket[] = [
  { id: 'va', label: 'Value added', hint: 'Changes form, fit or function; customer pays; right first time', tone: 'teal' },
  { id: 'rnva', label: 'Required NVA', hint: 'No customer value but mandated by law or the business', tone: 'sky' },
  { id: 'waste', label: 'Waste', hint: 'No value and nobody requires it', tone: 'coral' },
]

const CHECK: CheckItem[] = [
  { q: 'Which two questions does the book use to test whether a step is value added?', options: ['Is it fast? Is it cheap?', 'Does it change form, fit or function? Is the customer willing to pay for it?', 'Is it automated? Is it audited?', 'Does management want it? Is it documented?'], answer: 1, why: 'Both must be yes. Many texts add a third: done right the first time.' },
  { q: 'An identity check before a SIM swap is required by regulation. How is it classified?', options: ['Value added', 'Required (business) non-value added', 'Pure waste', 'Overproduction'], answer: 1, why: 'It adds no value for the customer but cannot be removed. Minimise its cost.' },
  { q: 'A technician fixes a line that was patched wrongly last week. Value added?', options: ['Yes, it changes the line', 'No: it is Correction, because the work was not right the first time', 'Yes, the customer wants a working line', 'Only if it is quick'], answer: 1, why: 'Doing it a second time adds cost but no extra value.' },
]

export default function ValueLab({ embedded }: LabProps) {
  const [pi, setPi] = useState(0)
  const proc = PROCS[pi]
  const [picks, setPicks] = useState<Record<string, Cat>>({})
  const [basis, setBasis] = useState<'all' | 'touch'>('all')
  const done = proc.steps.every(s => picks[s.id])
  const right = proc.steps.filter(s => picks[s.id] === s.cat).length
  const expert = Object.fromEntries(proc.steps.map(s => [s.id, s.cat])) as Record<string, Cat>

  const pick = (s: Step, c: Cat) => {
    if (picks[s.id]) return
    setPicks(p => ({ ...p, [s.id]: c }))
    if (c !== s.cat) update(x => { x.mistakes.push({ at: Date.now(), tag: 'waste-confusion', lesson: '1.4.1' }) })
  }
  const yn = (b: boolean) => (b ? 'Yes' : 'No')

  const explore = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-2"><strong className="text-ink">{proc.name}.</strong> {proc.intro}</p>
        <Segmented label="Time basis" value={basis} onChange={setBasis} options={[{ value: 'all', label: 'Total lead time' }, { value: 'touch', label: 'Work time only' }]} size="sm" />
      </div>
      <div className="space-y-3 rounded-2xl border border-line bg-surface-2/40 p-4">
        <RatioBar steps={proc.steps} cats={picks} basis={basis} title="Your value-added ratio" />
        {done && <RatioBar steps={proc.steps} cats={expert} basis={basis} title="Expert classification" />}
        <p className="text-xs leading-relaxed text-ink-3"><span className="rounded-full bg-amber-soft px-2 py-0.5 font-semibold text-amber">Supplementary</span> Value-added ratio (process cycle efficiency) = value-added time / total time, in the same units. {basis === 'all' ? 'Queues included: notice how small the ratio becomes.' : 'Queue time excluded, so only work steps count.'}</p>
      </div>
      <ul className="space-y-2">
        {proc.steps.map((s, i) => {
          const c = picks[s.id]
          return (
            <motion.li key={`${proc.id}-${s.id}`} layout className={`rounded-2xl border p-3 ${c ? (c === s.cat ? 'border-good/50' : 'border-bad/50') : 'border-line'}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1"><span className="tabular mr-1.5 text-sm text-ink-3">{i + 1}.</span><span className="font-semibold text-ink">{s.name}</span></div>
                <span className={`tabular chip ${s.queue ? 'border-amber/40 text-amber' : ''}`}>{fmtMin(s.min)}{s.queue ? ' queue' : ''}</span>
              </div>
              {!c ? (
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {(['va', 'rnva', 'waste'] as Cat[]).map(k => <button key={k} className="btn btn-soft btn-sm h-auto whitespace-normal px-1.5 py-1.5 leading-tight" onClick={() => pick(s, k)}>{CAT[k].short}</button>)}
                </div>
              ) : (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${CAT[s.cat].chip}`}>{CAT[s.cat].label}</span>
                    <span className="chip">Changes form, fit or function: {yn(s.form)}</span>
                    <span className="chip">Customer would pay: {yn(s.pay)}</span>
                    <span className="chip">Right first time: {yn(s.rft)}</span>
                    <span className="chip">Required by law or business: {yn(s.required)}</span>
                  </div>
                  <p className={`mt-1.5 text-sm leading-relaxed ${c === s.cat ? 'text-ink-2' : 'text-ink'}`}>{c !== s.cat && <strong className="text-bad">You chose {CAT[c].label}. </strong>}{s.why}</p>
                </div>
              )}
            </motion.li>
          )
        })}
      </ul>
      {done && <Feedback ok={right === proc.steps.length}>{right} of {proc.steps.length} steps classified like the expert. Most of the lead time is waste, mainly queues: Lean looks first at waiting and handoffs, not at speeding up the value-added minutes.</Feedback>}
    </div>
  )

  return (
    <LabShell
      lab="value"
      embedded={embedded}
      instructions="Classify each step as value added, required non-value added or waste. A step is value added only if it changes form, fit or function, the customer would pay for it, and it is done right the first time. The ratio bar updates as you go; switch the time basis to see the effect of queues."
      scenario="You are walking a process with its Process Owner, timing each step, to decide what to protect, what to shrink and what to remove."
      explore={explore}
      challenge={<ClassifierGame lab="value" items={ITEMS} buckets={BUCKETS} count={9} timed />}
      check={<KnowledgeCheck lab="value" items={CHECK} />}
      onReset={() => setPicks({})}
      onNewExample={() => { setPi(i => (i + 1) % PROCS.length); setPicks({}) }}
    />
  )
}
