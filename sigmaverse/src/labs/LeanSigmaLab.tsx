import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { LabProps } from './registry'
import { ClassifierGame, Feedback, KnowledgeCheck, LabShell, type Bucket, type CheckItem, type ClassItem } from './kit'
import { update } from '../lib/store'

const ROWS: { id: string; aspect: string; lean: string; sigma: string }[] = [
  { id: 'focus', aspect: 'Focus', lean: 'Waste, flow and speed', sigma: 'Variation and defects' },
  { id: 'question', aspect: 'Core question', lean: 'Where does time and effort go that the customer does not value?', sigma: 'Why do some units turn out differently from others?' },
  { id: 'goal', aspect: 'Goal', lean: 'Faster, simpler process with less effort', sigma: 'Consistent, capable process that meets CTQs' },
  { id: 'tools', aspect: 'Typical tools', lean: 'Value stream map, 5S, standard work, kanban, kaizen events', sigma: 'DMAIC, MSA, capability, hypothesis tests, regression, control charts' },
  { id: 'metrics', aspect: 'Typical metrics', lean: 'Lead time, WIP, value-added ratio, handoffs', sigma: 'DPMO, DPU, RTY, capability, standard deviation' },
  { id: 'projects', aspect: 'Typical projects', lean: 'Backlogs, long lead times, duplicated approvals, clutter', sigma: 'Billing errors, repeat faults, inconsistent install success' },
  { id: 'cause', aspect: 'Cause visibility', lean: 'Often visible once you walk the process', sigma: 'Hidden in data; must be proved' },
  { id: 'speed', aspect: 'Speed of results', lean: 'Often days to weeks', sigma: 'Usually months (a full DMAIC cycle)' },
]

const CASES: { text: string; answer: 'lean' | 'sigma' | 'both'; why: string }[] = [
  { text: 'Every invoice is printed, signed and scanned back in before approval.', answer: 'lean', why: 'The same unnecessary steps happen every time: consistent waste. If every unit went through identically, the problem would remain.' },
  { text: 'Invoice approval takes 1 day for some suppliers and 19 days for others.', answer: 'sigma', why: 'The spread is the problem; the average hides it. Variation calls for Six Sigma.' },
  { text: 'Install success varies sharply between engineers, and lead time is 14 days because orders queue twice.', answer: 'both', why: 'Variation between engineers (Six Sigma) plus queueing waste (Lean).' },
  { text: 'Customers wait an average 26 minutes in a queue that adds nothing.', answer: 'lean', why: 'Waiting is one of the seven wastes.' },
  { text: '6.8% of repairs fail within a week, and nobody knows why.', answer: 'sigma', why: 'Defects with an unknown cause that data must prove: Six Sigma.' },
  { text: 'Two teams perform identical checks on every new contract.', answer: 'lean', why: 'Overprocessing waste, visible as soon as you walk the process.' },
  { text: 'Repair time ranges from 3 to 70 hours, and tickets bounce between three teams.', answer: 'both', why: 'A wide spread (variation) and handoffs (conveyance waste).' },
]

const ITEMS: ClassItem[] = [
  { id: 'l1', text: 'Tickets wait 14 hours for triage', bucket: 'lean', why: 'Waiting waste: Lean.', mistake: 'lean-vs-sigma' },
  { id: 'l2', text: 'Orders are re-keyed into a second system', bucket: 'lean', why: 'Overprocessing and correction risk; remove the step.', mistake: 'lean-vs-sigma' },
  { id: 'l3', text: 'A shared drive is full of old versions of every form', bucket: 'lean', why: 'A 5S problem: Lean.', mistake: 'lean-vs-sigma' },
  { id: 'l4', text: 'Kits are built for forecast and many are scrapped', bucket: 'lean', why: 'Overproduction: switch to pull.', mistake: 'lean-vs-sigma' },
  { id: 'l5', text: 'A refund needs three signatures for USD 40', bucket: 'lean', why: 'Overprocessing: obvious once seen.', mistake: 'lean-vs-sigma' },
  { id: 'l6', text: 'Paper contracts are posted between offices', bucket: 'lean', why: 'Conveyance waste.', mistake: 'lean-vs-sigma' },
  { id: 'l7', text: 'Lead time is 9 days but work time is 40 minutes', bucket: 'lean', why: 'A low value-added ratio: Lean targets the queues.', mistake: 'lean-vs-sigma' },
  { id: 'l8', text: 'A backlog of 1,874 orders sits in provisioning', bucket: 'lean', why: 'Inventory and flow: Lean.', mistake: 'lean-vs-sigma' },
  { id: 's1', text: 'Bill amounts are wrong on 3.1% of invoices, cause unknown', bucket: 'sigma', why: 'Defects with an unknown cause: Six Sigma.', mistake: 'lean-vs-sigma' },
  { id: 's2', text: 'Signal strength after install varies widely by region', bucket: 'sigma', why: 'Variation in an output: Six Sigma.', mistake: 'lean-vs-sigma' },
  { id: 's3', text: 'The process cannot meet the 24-hour CTQ consistently', bucket: 'sigma', why: 'Capability against a CTQ: Six Sigma.', mistake: 'lean-vs-sigma' },
  { id: 's4', text: 'First-contact resolution dropped from 71% to 62% and nobody agrees why', bucket: 'sigma', why: 'An unknown cause that needs data: Six Sigma.', mistake: 'lean-vs-sigma' },
  { id: 's5', text: 'Repair success differs sharply between shifts', bucket: 'sigma', why: 'Variation between groups: prove the cause with data.', mistake: 'lean-vs-sigma' },
  { id: 's6', text: 'Measured call times swing between 2 and 40 minutes', bucket: 'sigma', why: 'A wide spread: variation.', mistake: 'lean-vs-sigma' },
  { id: 's7', text: 'DPMO for activations is 31,000 and must fall', bucket: 'sigma', why: 'Defect rate per opportunity: Six Sigma metric.', mistake: 'lean-vs-sigma' },
  { id: 'b1', text: 'Orders queue for days and 12% are returned with errors', bucket: 'both', why: 'Waiting waste plus defects.', mistake: 'lean-vs-sigma' },
  { id: 'b2', text: 'Repairs take 3 to 70 hours and pass through four teams', bucket: 'both', why: 'Variation plus conveyance waste.', mistake: 'lean-vs-sigma' },
  { id: 'b3', text: 'Long discharge waits and frequent medication errors on the same ward', bucket: 'both', why: 'Waiting waste and defects together.', mistake: 'lean-vs-sigma' },
  { id: 'b4', text: 'A backlog hides an inconsistent approval decision rate', bucket: 'both', why: 'Inventory waste and variation in decisions.', mistake: 'lean-vs-sigma' },
  { id: 'b5', text: 'Slow invoice cycle with a high, unexplained duplicate-payment rate', bucket: 'both', why: 'Speed (Lean) and defects with unknown cause (Six Sigma).', mistake: 'lean-vs-sigma' },
]

const BUCKETS: Bucket[] = [
  { id: 'lean', label: 'Lean', hint: 'Waste, flow, speed', tone: 'amber' },
  { id: 'sigma', label: 'Six Sigma', hint: 'Variation, defects', tone: 'violet' },
  { id: 'both', label: 'Both', hint: 'Waste and variation together', tone: 'teal' },
]

const CHECK: CheckItem[] = [
  { q: 'Which words in a question point MOST strongly to Six Sigma?', options: ['Flow and pull', 'Variation and defects', 'Waste and value', '5S and kanban'], answer: 1, why: 'Variation, defects, data and capability point to Six Sigma; speed, flow and waste point to Lean.' },
  { q: 'According to the book, what do Lean tools add to Six Sigma projects?', options: ['Statistical power', 'The discipline to sustain the gains', 'A replacement for DMAIC', 'Faster hypothesis tests'], answer: 1, why: 'The book\'s chain ends in 5S: Lean controls give the discipline to hold Six Sigma gains.' },
  { q: 'If every unit went through exactly the same way and the problem would remain, it is mainly...', options: ['A variation problem', 'A waste problem', 'A measurement problem', 'A role problem'], answer: 1, why: 'A consistently slow or wasteful process is a waste problem.' },
  { q: 'Which statement is true?', options: ['Lean replaces Six Sigma', 'Six Sigma makes Lean unnecessary', 'Lean Six Sigma uses DMAIC as its backbone with Lean tools inserted where they fit', 'They cannot be used together'], answer: 2, why: 'They combine: one roadmap, two toolkits.' },
]

export default function LeanSigmaLab({ embedded }: LabProps) {
  const [rows, setRows] = useState<Record<string, boolean>>({ focus: true, tools: true, metrics: true, projects: true })
  const [ci, setCi] = useState(0)
  const [pick, setPick] = useState<'lean' | 'sigma' | 'both' | null>(null)
  const c = CASES[ci]
  const visible = ROWS.filter(r => rows[r.id])

  const choose = (a: 'lean' | 'sigma' | 'both') => {
    if (pick) return
    setPick(a)
    if (a !== c.answer) update(p => { p.mistakes.push({ at: Date.now(), tag: 'lean-vs-sigma', lesson: '1.4.3' }) })
  }
  const another = () => { setCi(i => (i + 1) % CASES.length); setPick(null) }
  const label = { lean: 'Lean', sigma: 'Six Sigma', both: 'Both' } as const

  const explore = (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Rows to compare">
          {ROWS.map(r => (
            <button key={r.id} aria-pressed={!!rows[r.id]} onClick={() => setRows(x => ({ ...x, [r.id]: !x[r.id] }))}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${rows[r.id] ? 'border-amber bg-amber-soft text-ink' : 'border-line text-ink-3 hover:text-ink'}`}>{r.aspect}</button>
          ))}
        </div>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="bg-surface-2 text-left">
                <th className="w-[22%] px-3 py-2.5 font-semibold text-ink-3">Aspect</th>
                <th className="px-3 py-2.5 font-display text-base font-semibold text-amber">Lean</th>
                <th className="px-3 py-2.5 font-display text-base font-semibold text-violet">Six Sigma</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {visible.map(r => (
                  <motion.tr key={r.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-line align-top">
                    <th scope="row" className="px-3 py-2.5 text-left font-semibold text-ink">{r.aspect}</th>
                    <td className="px-3 py-2.5 text-ink-2">{r.lean}</td>
                    <td className="px-3 py-2.5 text-ink-2">{r.sigma}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {visible.length === 0 && <tr><td colSpan={3} className="px-3 py-4 text-center text-ink-3">Select a row above to compare.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-ink-2">Lean makes the process faster and leaner; Six Sigma makes it more consistent and capable. Lean Six Sigma runs on the DMAIC roadmap with Lean tools inserted where they fit.</p>
      </div>

      <div className="rounded-2xl border border-dashed border-line-2 p-4">
        <h3 className="font-display text-base font-semibold text-ink">Waste or variation?</h3>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">{c.text}</p>
        <p className="mt-2 text-sm text-ink-2"><strong className="text-ink">Test:</strong> if every unit went through the process exactly the same way, would the problem still exist? Yes suggests waste; no suggests variation.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(['lean', 'sigma', 'both'] as const).map(a => {
            const show = pick !== null
            const cls = show && a === c.answer ? 'border-good bg-good-soft' : show && a === pick ? 'border-bad bg-bad-soft' : 'border-line hover:bg-surface-2'
            return <button key={a} disabled={show} onClick={() => choose(a)} className={`rounded-xl border px-2 py-2.5 text-sm font-semibold text-ink transition-colors disabled:cursor-default ${cls}`}>{label[a]}</button>
          })}
        </div>
        {pick && <><Feedback ok={pick === c.answer}><strong>{label[c.answer]}.</strong> {c.why}</Feedback><button className="btn btn-soft btn-sm mt-3" onClick={another}>Next case</button></>}
      </div>
    </div>
  )

  return (
    <LabShell
      lab="lean-sigma"
      embedded={embedded}
      instructions="Toggle rows of the comparison table to compare Lean and Six Sigma side by side. Then judge each case: is it mainly waste (Lean), mainly variation (Six Sigma), or both?"
      scenario="A broadband provider has a list of improvement ideas and must decide which need a quick Lean kaizen and which need a data-driven Six Sigma project."
      explore={explore}
      challenge={<ClassifierGame lab="lean-sigma" items={ITEMS} buckets={BUCKETS} count={9} timed />}
      check={<KnowledgeCheck lab="lean-sigma" items={CHECK} />}
      onReset={() => { setRows({ focus: true, tools: true, metrics: true, projects: true }); setCi(0); setPick(null) }}
      onNewExample={another}
    />
  )
}
