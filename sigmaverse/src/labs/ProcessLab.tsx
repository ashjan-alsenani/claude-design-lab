import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowUp, Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { LabProps } from './registry'
import { Feedback, KnowledgeCheck, LabShell, shuffle, type CheckItem } from './kit'
import { useDur } from '../lib/motion'
import { recordLab, update } from '../lib/store'

type Zone = 'S' | 'I' | 'P' | 'O' | 'C' | 'X'
interface Card { id: string; text: string; zone: Zone; order?: number; why: string }
interface Scenario { id: string; name: string; intro: string; cards: Card[]; starts: { text: string; ok: boolean; why: string }[]; ends: { text: string; ok: boolean; why: string }[] }

const SCENARIOS: Scenario[] = [
  {
    id: 'incident', name: 'Incident management', intro: 'Northwind Fibre restores broadband service when a customer reports a fault or an alarm fires.',
    cards: [
      { id: 's1', text: 'Customers', zone: 'S', why: 'Customers supply the fault report.' },
      { id: 's2', text: 'Network monitoring system', zone: 'S', why: 'It supplies alarm data, an information input.' },
      { id: 's3', text: 'Field engineering contractor', zone: 'S', why: 'Supplies engineer availability, a resource input.' },
      { id: 'i1', text: 'Fault report', zone: 'I', why: 'Information the process consumes.' },
      { id: 'i2', text: 'Line test results', zone: 'I', why: 'Diagnostic information is an input (an X).' },
      { id: 'i3', text: 'Engineer availability', zone: 'I', why: 'People and capacity are inputs too.' },
      { id: 'p1', text: 'Log and prioritise', zone: 'P', order: 0, why: 'First major step after the trigger.' },
      { id: 'p2', text: 'Diagnose', zone: 'P', order: 1, why: 'Diagnosis follows logging.' },
      { id: 'p3', text: 'Fix the fault', zone: 'P', order: 2, why: 'The fix follows diagnosis.' },
      { id: 'p4', text: 'Confirm with customer', zone: 'P', order: 3, why: 'Confirmation stops tickets being closed while the fault persists.' },
      { id: 'p5', text: 'Close the ticket', zone: 'P', order: 4, why: 'The last step inside the boundary.' },
      { id: 'o1', text: 'Restored service', zone: 'O', why: 'What the process hands over.' },
      { id: 'o2', text: 'Closed incident record', zone: 'O', why: 'An output used by problem management.' },
      { id: 'c1', text: 'Affected customers', zone: 'C', why: 'External customers receive the restored service.' },
      { id: 'c2', text: 'Problem management team', zone: 'C', why: 'An internal customer of the incident records.' },
      { id: 'x1', text: 'Customer trusts us and renews the contract', zone: 'X', why: 'That is an outcome, the result of good outputs, not an output of this process.' },
      { id: 'x2', text: 'Check the fibre splice loss on port 3 of the ONT', zone: 'X', why: 'Too detailed for a Level 1 view. Detailed mapping belongs to Measure (2.1.2).' },
      { id: 'x3', text: 'Send next month\'s bill', zone: 'X', why: 'Outside the agreed boundaries: billing is a different process.' },
    ],
    starts: [
      { text: 'An incident is reported by a customer or raised by an alarm', ok: true, why: 'An observable trigger event.' },
      { text: 'The service desk starts its shift', ok: false, why: 'A shift start is not linked to any single incident.' },
      { text: 'The engineer arrives on site', ok: false, why: 'Too late: logging and diagnosis would be cut off, and the cause might sit before the boundary.' },
    ],
    ends: [
      { text: 'The customer confirms service is restored and the ticket is closed', ok: true, why: 'An observable event that proves the output was delivered.' },
      { text: 'The engineer leaves site', ok: false, why: 'The fault may persist; confirmation and closure would be outside the map.' },
      { text: 'The customer renews their contract', ok: false, why: 'That is a business outcome months later, not the end of this process.' },
    ],
  },
  {
    id: 'invoice', name: 'Invoice processing', intro: 'Kestrel Mobile\'s accounts payable team processes about 7,900 supplier invoices a month.',
    cards: [
      { id: 's1', text: 'Suppliers', zone: 'S', why: 'Suppliers send the invoices.' },
      { id: 's2', text: 'Procurement team', zone: 'S', why: 'Procurement supplies the purchase orders, an internal supplier.' },
      { id: 's3', text: 'Budget-holding approvers', zone: 'S', why: 'They supply the approval decision.' },
      { id: 'i1', text: 'Supplier invoice', zone: 'I', why: 'The item the process transforms.' },
      { id: 'i2', text: 'Purchase order', zone: 'I', why: 'Information used to match the invoice.' },
      { id: 'i3', text: 'Approval policy', zone: 'I', why: 'Policies are inputs (X\'s) too.' },
      { id: 'p1', text: 'Receive and scan', zone: 'P', order: 0, why: 'First step after the trigger.' },
      { id: 'p2', text: 'Match to purchase order', zone: 'P', order: 1, why: 'Matching follows capture.' },
      { id: 'p3', text: 'Route for approval', zone: 'P', order: 2, why: 'Approval follows a successful match.' },
      { id: 'p4', text: 'Approve', zone: 'P', order: 3, why: 'The decision step.' },
      { id: 'p5', text: 'Release for payment', zone: 'P', order: 4, why: 'The last step inside the boundary.' },
      { id: 'o1', text: 'Approved invoice', zone: 'O', why: 'An output of the process.' },
      { id: 'o2', text: 'Payment file sent to the bank', zone: 'O', why: 'An output handed to treasury and the bank.' },
      { id: 'c1', text: 'Suppliers awaiting payment', zone: 'C', why: 'External customers of the payment.' },
      { id: 'c2', text: 'Treasury team', zone: 'C', why: 'An internal customer of the payment file.' },
      { id: 'x1', text: 'Suppliers keep offering favourable terms', zone: 'X', why: 'An outcome of good outputs, not an output itself.' },
      { id: 'x2', text: 'Type the VAT number into field 14', zone: 'X', why: 'Too detailed for the high-level view; detailed mapping is Measure (2.1.2).' },
      { id: 'x3', text: 'Negotiate the supplier contract', zone: 'X', why: 'Outside the boundaries: contracting happens upstream in procurement.' },
    ],
    starts: [
      { text: 'An invoice arrives in the accounts payable mailbox', ok: true, why: 'A clear, observable trigger.' },
      { text: 'Procurement signs the supplier contract', ok: false, why: 'Too early: that is a different process with its own owner.' },
      { text: 'The approver opens the invoice', ok: false, why: 'Too late: receiving and matching, where delays often start, would be cut off.' },
    ],
    ends: [
      { text: 'The invoice is approved and released for payment', ok: true, why: 'Observable, and within the team\'s control.' },
      { text: 'The approver clicks Approve', ok: false, why: 'Release for payment would be left out of the map.' },
      { text: 'The supplier feels valued', ok: false, why: 'An outcome, not an observable end event.' },
    ],
  },
]

const ZONES: { id: Zone; label: string; hint: string }[] = [
  { id: 'S', label: 'Suppliers', hint: 'Who provides inputs' },
  { id: 'I', label: 'Inputs', hint: 'What goes in' },
  { id: 'P', label: 'Process steps', hint: 'In order, 4 to 8 boxes' },
  { id: 'O', label: 'Outputs', hint: 'What comes out' },
  { id: 'C', label: 'Customers', hint: 'Who receives outputs' },
]

/* ------------------------------------------------------------------ */
/* Challenge                                                           */
/* ------------------------------------------------------------------ */

interface Q { q: string; options: string[]; answer: number; why: string }
const POOL: Q[] = [
  { q: 'A closed ticket is handed to the problem management team. Is "closed ticket" an output or an outcome?', options: ['Output', 'Outcome'], answer: 0, why: 'It is what the process hands over: an output.' },
  { q: '"The customer can work again and renews the contract." Output or outcome?', options: ['Output', 'Outcome'], answer: 1, why: 'The resulting change for the customer and business is an outcome.' },
  { q: '"Payment file sent to the bank." Output or outcome?', options: ['Output', 'Outcome'], answer: 0, why: 'A tangible thing the process produces: an output.' },
  { q: '"Early-payment discounts captured." Output or outcome?', options: ['Output', 'Outcome'], answer: 1, why: 'A business result that follows from the outputs: an outcome.' },
  { q: 'Which is the best start boundary for a SIM swap process?', options: ['The customer requests a SIM swap', 'The store opens', 'The new SIM is activated', 'The customer receives the next bill'], answer: 0, why: 'A start boundary is an observable trigger tied to each unit of work.' },
  { q: 'Which is the best end boundary for a broadband installation process?', options: ['The engineer leaves', 'The line passes the activation test and the customer confirms service', 'The customer is happy', 'The order is keyed'], answer: 1, why: 'An observable event that proves the output was delivered.' },
  { q: 'Billing receives the order records from order entry. What is billing?', options: ['A supplier of order entry', 'An internal customer of order entry', 'An external customer', 'An input'], answer: 1, why: 'Whoever must use your output to do their job is your customer, inside or outside the organisation.' },
  { q: 'Where does the IASSC syllabus place detailed SIPOC and process mapping?', options: ['Define (1.2.1)', 'Measure (2.1.2)', 'Improve', 'Control'], answer: 1, why: 'Measure, topic 2.1.2. Define needs only a high-level view of the boundaries.' },
  { q: 'Which of these is an input in a service process?', options: ['A restored line', 'The approval policy', 'A satisfied customer', 'The closed ticket'], answer: 1, why: 'Policies, information, people and systems are inputs (X\'s).' },
]

function Challenge() {
  const [seed, setSeed] = useState(0)
  const rounds = useMemo(() => shuffle(POOL).slice(0, 6), [seed]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  if (i >= rounds.length) {
    return (
      <div className="rounded-2xl bg-teal-soft p-5">
        <p className="font-display text-2xl font-semibold text-ink">{score} of {rounds.length} correct</p>
        <p className="mt-1 text-sm text-ink-2">Boundaries are observable trigger events; outputs are handed over, outcomes follow from them.</p>
        <button className="btn btn-primary mt-4" onClick={() => { setSeed(s => s + 1); setI(0); setPicked(null); setScore(0) }}>New challenge</button>
      </div>
    )
  }
  const r = rounds[i]
  const choose = (j: number) => {
    if (picked !== null) return
    setPicked(j)
    if (j === r.answer) setScore(s => s + 1)
    else update(p => { p.mistakes.push({ at: Date.now(), tag: 'process-boundary', lesson: '1.2.1' }) })
  }
  const next = () => { setI(i + 1); setPicked(null); if (i + 1 >= rounds.length) recordLab('process', Math.round((score / rounds.length) * 100)) }
  return (
    <div>
      <div className="mb-3 flex justify-between text-sm text-ink-3"><span className="tabular">Question {i + 1} of {rounds.length}</span><span className="tabular">Score {score}</span></div>
      <h3 className="text-lg font-semibold leading-snug text-ink">{r.q}</h3>
      <div className={`mt-3 grid gap-2 ${r.options.length === 2 ? 'grid-cols-2' : 'sm:grid-cols-2'}`}>
        {r.options.map((o, j) => {
          const show = picked !== null
          const cls = show && j === r.answer ? 'border-good bg-good-soft' : show && j === picked ? 'border-bad bg-bad-soft' : 'border-line hover:border-teal hover:bg-teal-soft/40'
          return <button key={j} disabled={show} onClick={() => choose(j)} className={`rounded-xl border px-3 py-2.5 text-left text-sm text-ink transition-colors disabled:cursor-default ${cls}`}>{o}</button>
        })}
      </div>
      {picked !== null && <><Feedback ok={picked === r.answer}>{r.why}</Feedback><button className="btn btn-primary mt-3" onClick={next}>{i + 1 < rounds.length ? 'Next question' : 'See score'}</button></>}
    </div>
  )
}

const CHECK: CheckItem[] = [
  { q: 'How should a process boundary be defined?', options: ['As a department name', 'As an observable trigger event', 'As the name of the system used', 'As a vague phase such as "early on"'], answer: 1, why: 'Boundaries are observable events, such as "invoice arrives in the mailbox".' },
  { q: 'Which is an outcome rather than an output?', options: ['Closed ticket', 'Approved invoice', 'Customer renews the contract', 'Payment file'], answer: 2, why: 'Outcomes are the resulting change for the customer or business; outputs are what the process hands over.' },
  { q: 'The book advises including at least one step before and after the suspected problem area. Why?', options: ['To make the map longer', 'So the map does not cut off the cause', 'Because SIPOC needs exactly seven steps', 'To include billing'], answer: 1, why: 'Mapping a little wider avoids excluding the step where the cause actually sits.' },
]

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function ProcessLab({ embedded }: LabProps) {
  const [scIdx, setScIdx] = useState(0)
  const sc = SCENARIOS[scIdx]
  const [deckSeed, setDeckSeed] = useState(0)
  const deck = useMemo(() => shuffle(sc.cards), [sc, deckSeed]) // eslint-disable-line react-hooks/exhaustive-deps
  const [placed, setPlaced] = useState<Record<string, Zone>>({})
  const [steps, setSteps] = useState<string[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const [start, setStart] = useState<number | null>(null)
  const [end, setEnd] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const dur = useDur()

  const byId = (id: string) => sc.cards.find(c => c.id === id)!
  const unplaced = deck.filter(c => !placed[c.id])

  const place = (z: Zone) => {
    if (!sel || checked) return
    setPlaced(p => ({ ...p, [sel]: z }))
    setSteps(s => (z === 'P' ? [...s.filter(x => x !== sel), sel] : s.filter(x => x !== sel)))
    setSel(null)
  }
  const unplace = (id: string) => {
    if (checked) return
    setPlaced(p => { const n = { ...p }; delete n[id]; return n })
    setSteps(s => s.filter(x => x !== id))
  }
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (checked || j < 0 || j >= steps.length) return
    const n = [...steps]; [n[i], n[j]] = [n[j], n[i]]; setSteps(n)
  }
  const reset = (nextSc = scIdx) => { setScIdx(nextSc); setDeckSeed(s => s + 1); setPlaced({}); setSteps([]); setSel(null); setStart(null); setEnd(null); setChecked(false) }

  // Evaluation
  const cardOk = (c: Card) => placed[c.id] === c.zone
  const correctSteps = sc.cards.filter(c => c.zone === 'P').sort((a, b) => a.order! - b.order!).map(c => c.id)
  const stepsInP = steps.filter(id => byId(id).zone === 'P')
  const orderOk = stepsInP.length === correctSteps.length && stepsInP.every((id, i) => id === correctSteps[i])
  const startOk = start !== null && sc.starts[start].ok
  const endOk = end !== null && sc.ends[end].ok
  const cardsRight = sc.cards.filter(cardOk).length
  const allOk = cardsRight === sc.cards.length && orderOk && startOk && endOk
  const ready = unplaced.length === 0 && start !== null && end !== null

  const check = () => {
    setChecked(true)
    const wrong = sc.cards.length - cardsRight + (orderOk ? 0 : 1) + (startOk ? 0 : 1) + (endOk ? 0 : 1)
    if (wrong) update(p => { p.mistakes.push({ at: Date.now(), tag: 'process-boundary', lesson: '1.2.1' }) })
  }

  const chipCls = (c: Card) => checked ? (cardOk(c) ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft') : 'border-line bg-surface'

  const zoneBox = (z: Zone, label: string, hint: string) => {
    const inZone = z === 'P' ? steps.map(byId) : sc.cards.filter(c => placed[c.id] === z)
    return (
      <div key={z} role="button" tabIndex={0} aria-label={`Place selected card in ${label}`}
        onClick={() => place(z)} onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && sel) { e.preventDefault(); place(z) } }}
        className={`min-h-28 rounded-2xl border-2 p-2.5 transition-colors ${z === 'X' ? 'border-dashed border-line-2 bg-surface-2/40' : 'border-teal/30 bg-teal-soft/30'} ${sel ? 'cursor-pointer ring-2 ring-teal/25' : ''}`}>
        <div className="font-display text-sm font-semibold text-teal">{label}</div>
        <div className="text-xs text-ink-3">{hint}</div>
        <ul className="mt-2 space-y-1.5">
          <AnimatePresence initial={false}>
            {inZone.map((c, i) => (
              <motion.li key={c.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[13px] text-ink ${chipCls(c)}`}>
                {z === 'P' && <span className="tabular w-4 shrink-0 text-xs font-semibold text-ink-3">{i + 1}</span>}
                <button className="flex-1 text-left" onClick={e => { e.stopPropagation(); unplace(c.id) }} aria-label={checked ? c.text : `${c.text}: remove from ${label}`}>
                  {c.text}
                  {checked && !cardOk(c) && <span className="mt-0.5 block text-xs text-ink-2">{c.zone === 'X' ? 'Leave out. ' : `Belongs in ${c.zone === 'P' ? 'Process steps' : ZONES.find(x => x.id === c.zone)!.label}. `}{c.why}</span>}
                </button>
                {z === 'P' && !checked && <>
                  <button className="btn btn-ghost btn-icon h-6 w-6 rounded-md" aria-label={`Move ${c.text} up`} disabled={i === 0} onClick={e => { e.stopPropagation(); move(i, -1) }}><ArrowUp className="size-3.5" /></button>
                  <button className="btn btn-ghost btn-icon h-6 w-6 rounded-md" aria-label={`Move ${c.text} down`} disabled={i === inZone.length - 1} onClick={e => { e.stopPropagation(); move(i, 1) }}><ArrowDown className="size-3.5" /></button>
                </>}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    )
  }

  const flow = allOk && checked && (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-good/40 bg-good-soft/40 p-3">
      <svg viewBox="0 0 720 150" className="h-auto w-full" role="img" aria-label={`High-level process: ${correctSteps.map(id => byId(id).text).join(', then ')}`}>
        <defs><marker id="pl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="var(--teal)" /></marker></defs>
        <text x={8} y={22} fontFamily="var(--font-sans)" fontSize={12} fill="var(--ink-2)">Start: {sc.starts[start!].text}</text>
        {correctSteps.map((id, i) => {
          const x = 10 + i * 142
          return (
            <motion.g key={id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: dur(0.12 * i), duration: dur(0.3) }}>
              <rect x={x} y={42} width={120} height={58} rx={10} fill="var(--surface)" stroke="var(--teal)" strokeWidth={2} />
              <foreignObject x={x + 4} y={46} width={112} height={50}><div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, lineHeight: 1.2, color: 'var(--ink)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>{byId(id).text}</div></foreignObject>
              {i < correctSteps.length - 1 && <motion.path d={`M${x + 122} 71 H ${x + 140}`} stroke="var(--teal)" strokeWidth={2} markerEnd="url(#pl-arrow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: dur(0.12 * i + 0.2), duration: dur(0.3) }} />}
            </motion.g>
          )
        })}
        <text x={712} y={132} textAnchor="end" fontFamily="var(--font-sans)" fontSize={12} fill="var(--ink-2)">End: {sc.ends[end!].text}</text>
      </svg>
    </motion.div>
  )

  const explore = (
    <div className="space-y-4">
      <p className="text-sm text-ink-2"><strong className="text-ink">{sc.name}.</strong> {sc.intro}</p>
      <div className="rounded-2xl border border-dashed border-line-2 p-3">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm"><span className="font-semibold text-ink">Cards to place</span><span className="text-ink-3">Tap a card, then tap a zone. Tap a placed card to return it.</span></div>
        <div className="flex min-h-10 flex-wrap gap-2">
          {unplaced.length === 0 && <span className="text-sm text-ink-3">All cards placed.</span>}
          {unplaced.map(c => (
            <motion.button layout key={c.id} onClick={() => setSel(s => (s === c.id ? null : c.id))} aria-pressed={sel === c.id}
              className={`rounded-xl border px-3 py-1.5 text-left text-sm shadow-sm transition-colors ${sel === c.id ? 'border-teal bg-teal-soft ring-2 ring-teal/30' : 'border-line bg-surface hover:border-line-2'}`}>{c.text}</motion.button>
          ))}
        </div>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {ZONES.map(z => zoneBox(z.id, z.label, z.hint))}
      </div>
      {zoneBox('X', 'Leave out of this high-level map', 'Outcomes, detail and steps outside the boundaries')}
      <div className="grid gap-3 md:grid-cols-2">
        {([['Start trigger', sc.starts, start, setStart], ['End point', sc.ends, end, setEnd]] as const).map(([label, opts, val, set]) => (
          <fieldset key={label} className="rounded-2xl border border-line p-3">
            <legend className="px-1 text-sm font-semibold text-ink">{label}</legend>
            <div className="space-y-1.5">
              {opts.map((o, i) => {
                const show = checked && val === i
                return (
                  <label key={i} className={`flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 text-sm ${show ? (o.ok ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft') : val === i ? 'border-teal bg-teal-soft/50' : 'border-line'}`}>
                    <input type="radio" name={`${sc.id}-${label}`} className="mt-1 accent-[var(--teal)]" checked={val === i} disabled={checked} onChange={() => set(i)} />
                    <span>{o.text}{show && <span className="mt-0.5 block text-xs text-ink-2">{o.why}</span>}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {!checked ? <button className="btn btn-primary" disabled={!ready} onClick={check}>Check my process</button>
          : <button className="btn btn-soft" onClick={() => setChecked(false)}>Keep editing</button>}
      </div>
      {checked && (
        <Feedback ok={allOk}>
          {allOk ? 'A clean high-level view: clear triggers, steps in order, outputs separated from outcomes.' : (
            <ul className="space-y-1">
              {cardsRight < sc.cards.length && <li>{sc.cards.length - cardsRight} card{sc.cards.length - cardsRight === 1 ? '' : 's'} in the wrong zone. Red cards explain why.</li>}
              {!orderOk && <li>Process steps are not in the right order{stepsInP.length !== correctSteps.length ? ' or not all present' : ''}. A Level 1 map flows from trigger to end.</li>}
              {!startOk && <li>Start trigger: {start !== null ? sc.starts[start].why : 'choose one.'}</li>}
              {!endOk && <li>End point: {end !== null ? sc.ends[end].why : 'choose one.'}</li>}
            </ul>
          )}
        </Feedback>
      )}
      {flow}
      <p className="flex gap-2 rounded-xl bg-sky-soft px-3 py-2.5 text-sm text-ink"><Info className="mt-0.5 size-4 shrink-0 text-sky" />This is the high-level view a Define charter needs. In the IASSC syllabus, detailed process mapping and the full SIPOC with requirements are Measure topics (2.1.2).</p>
    </div>
  )

  return (
    <LabShell
      lab="process"
      embedded={embedded}
      instructions="Place each card into Suppliers, Inputs, Process steps, Outputs or Customers, or leave it out if it is an outcome, too detailed, or outside the boundaries. Order the process steps, choose the start trigger and end point, then check."
      scenario="Your Champion wants a one-page, high-level view of the process before the charter is signed, so everyone agrees where the project starts and stops."
      explore={explore}
      challenge={<Challenge />}
      check={<KnowledgeCheck lab="process" items={CHECK} />}
      onReset={() => reset()}
      onNewExample={() => reset((scIdx + 1) % SCENARIOS.length)}
    />
  )
}
