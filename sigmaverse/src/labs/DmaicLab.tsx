import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { LabProps } from './registry'
import { ClassifierGame, Feedback, KnowledgeCheck, LabShell, type Bucket, type CheckItem, type ClassItem } from './kit'
import { update } from '../lib/store'

type Phase = 'D' | 'M' | 'A' | 'I' | 'C'

const PHASES: { id: Phase; name: string; verb: string; question: string; goals: string[]; deliverables: string[]; trap: string; tone: Bucket['tone'] }[] = [
  { id: 'D', name: 'Define', verb: 'frames', question: 'What is the problem, why does it matter, and who will fix it?', tone: 'violet',
    goals: ['Identify the problem area and settle the project focus', 'Estimate the cost of poor quality', 'Establish the team'],
    deliverables: ['Project charter: business case, problem and goal statements, scope, team, timeline', 'High-level process view and boundaries', 'VOC translated into CTQs', 'Preliminary COPQ estimate', 'Stakeholder analysis and Champion sign-off'],
    trap: 'Define may record suspected causes, but never confirms them.' },
  { id: 'M', name: 'Measure', verb: 'quantifies', question: 'How big is the problem, really, and can we trust the data?', tone: 'teal',
    goals: ['Assess stability and capability', 'Validate the measurement system'],
    deliverables: ['Detailed process map and SIPOC (syllabus 2.1.2)', 'Operational definitions and data collection plan', 'Measurement system analysis (MSA)', 'Baseline performance, stability and capability', 'List of potential X\'s'],
    trap: 'In this syllabus detailed SIPOC and process mapping sit in Measure, even though Define needs a high-level view.' },
  { id: 'A', name: 'Analyze', verb: 'proves', question: 'Which causes actually drive the problem?', tone: 'sky',
    goals: ['List and prioritise the possible X\'s', 'Prove or disprove their effect on Y'],
    deliverables: ['Prioritised X\'s', 'Hypothesis tests and data analysis', 'Verified root causes with evidence', 'Quantified effect of each critical X'],
    trap: 'Words such as verify, confirm or prove a root cause point to Analyze.' },
  { id: 'I', name: 'Improve', verb: 'changes', question: 'What change removes or controls the root causes?', tone: 'coral',
    goals: ['Identify, select and implement solutions'],
    deliverables: ['Generated and evaluated solutions', 'Selected solution with risk review', 'Pilot results', 'Implementation plan', 'Confirmed improvement in Y'],
    trap: 'A charter that names a fix has skipped three phases.' },
  { id: 'C', name: 'Control', verb: 'sustains', question: 'How do we keep the gain and prove its value?', tone: 'amber',
    goals: ['Put a control plan in place so the problem does not return', 'Verify the financial impact'],
    deliverables: ['Control plan with monitoring and response plans', 'Updated procedures and training', 'Handover to the Process Owner', 'Finance-verified benefits', 'Lessons learned and closure'],
    trap: 'Estimated benefits are Define; verified, realised benefits are Control.' },
]
const P = (id: Phase) => PHASES.find(p => p.id === id)!

const ITEMS: ClassItem[] = [
  { id: 'd1', text: 'Write the problem statement', bucket: 'D', why: 'Framing the problem is Define.', mistake: 'phase-boundary' },
  { id: 'd2', text: 'Estimate the cost of poor quality', bucket: 'D', why: 'The book roadmap places estimating COPQ in Define, to size the prize.', mistake: 'phase-boundary' },
  { id: 'd3', text: 'Get the Champion to sign the charter', bucket: 'D', why: 'Charter approval closes Define.', mistake: 'phase-boundary' },
  { id: 'd4', text: 'Agree in-scope and out-of-scope lists', bucket: 'D', why: 'Scope is part of the charter.', mistake: 'phase-boundary' },
  { id: 'd5', text: 'Translate customer complaints into CTQs', bucket: 'D', why: 'VOC to CTQ supports the Define charter.', mistake: 'phase-boundary' },
  { id: 'd6', text: 'Sketch a high-level view of the process boundaries', bucket: 'D', why: 'Only a high-level view is needed in Define; detail comes in Measure.', mistake: 'phase-boundary' },
  { id: 'd7', text: 'Form the team and assign roles', bucket: 'D', why: 'Establishing the team is a Define goal.', mistake: 'phase-boundary' },
  { id: 'm1', text: 'Build a detailed SIPOC with requirements', bucket: 'M', why: 'The IASSC syllabus places SIPOC and process mapping in Measure (2.1.2).', mistake: 'phase-boundary' },
  { id: 'm2', text: 'Run a measurement system analysis', bucket: 'M', why: 'Validating the measurement system is Measure.', mistake: 'phase-boundary' },
  { id: 'm3', text: 'Write operational definitions for each metric', bucket: 'M', why: 'Part of the data collection plan in Measure.', mistake: 'phase-boundary' },
  { id: 'm4', text: 'Establish baseline capability', bucket: 'M', why: 'Measure assesses stability and capability.', mistake: 'phase-boundary' },
  { id: 'm5', text: 'Create a data collection plan', bucket: 'M', why: 'Measure quantifies the problem with trusted data.', mistake: 'phase-boundary' },
  { id: 'm6', text: 'Draw a detailed value stream map', bucket: 'M', why: 'Process mapping and VSM are Measure in the syllabus (2.1.2).', mistake: 'phase-boundary' },
  { id: 'm7', text: 'Brainstorm a list of potential X\'s', bucket: 'M', why: 'Listing potential X\'s ends Measure; proving them is Analyze.', mistake: 'phase-boundary' },
  { id: 'a1', text: 'Prove which X drives the repeat-visit rate', bucket: 'A', why: 'Proving root cause is Analyze.', mistake: 'phase-boundary' },
  { id: 'a2', text: 'Run a hypothesis test on two shifts', bucket: 'A', why: 'Statistical tests that confirm causes are Analyze.', mistake: 'phase-boundary' },
  { id: 'a3', text: 'Verify the root cause with data', bucket: 'A', why: '"Verify the root cause" is the classic Analyze signal.', mistake: 'phase-boundary' },
  { id: 'a4', text: 'Quantify the effect of each critical X', bucket: 'A', why: 'Analyze quantifies Y = f(X).', mistake: 'phase-boundary' },
  { id: 'a5', text: 'Prioritise the X\'s with the team', bucket: 'A', why: 'The roadmap: Analyze lists and prioritises X\'s, then proves them.', mistake: 'phase-boundary' },
  { id: 'a6', text: 'Disprove a popular theory about the cause', bucket: 'A', why: 'Proving or disproving an effect is Analyze.', mistake: 'phase-boundary' },
  { id: 'i1', text: 'Pilot the new dispatch rule in one region', bucket: 'I', why: 'Piloting a solution is Improve.', mistake: 'phase-boundary' },
  { id: 'i2', text: 'Generate and evaluate solution options', bucket: 'I', why: 'Improve identifies and selects solutions.', mistake: 'phase-boundary' },
  { id: 'i3', text: 'Run a risk review of the chosen solution', bucket: 'I', why: 'Solution risk review belongs to Improve.', mistake: 'phase-boundary' },
  { id: 'i4', text: 'Write the implementation plan', bucket: 'I', why: 'Implementing solutions is Improve.', mistake: 'phase-boundary' },
  { id: 'i5', text: 'Confirm the Y improved after the change', bucket: 'I', why: 'Improve confirms the improvement; Control then sustains it.', mistake: 'phase-boundary' },
  { id: 'i6', text: 'Optimise settings for the critical X\'s', bucket: 'I', why: 'Changing the process to remove causes is Improve.', mistake: 'phase-boundary' },
  { id: 'c1', text: 'Document the control plan with a response plan', bucket: 'C', why: 'The documented control plan is a Control deliverable.', mistake: 'phase-boundary' },
  { id: 'c2', text: 'Verify the financial impact with Finance', bucket: 'C', why: 'Realised, verified benefits are confirmed in Control.', mistake: 'phase-boundary' },
  { id: 'c3', text: 'Hand the process over to the Process Owner', bucket: 'C', why: 'Handover is part of closing in Control.', mistake: 'phase-boundary' },
  { id: 'c4', text: 'Update procedures and train the team', bucket: 'C', why: 'Standardising the new way of working sustains the gain.', mistake: 'phase-boundary' },
  { id: 'c5', text: 'Set up a control chart to monitor the Y', bucket: 'C', why: 'Monitoring to hold the gain is Control.', mistake: 'phase-boundary' },
  { id: 'c6', text: 'Record lessons learned and close the project', bucket: 'C', why: 'Closure is the last Control step.', mistake: 'phase-boundary' },
  { id: 'c7', text: 'Apply 5S to sustain the new layout', bucket: 'C', why: '5S is revisited in Control (5.1.1) as a method to sustain gains.', mistake: 'phase-boundary' },
]

const BUCKETS: Bucket[] = PHASES.map(p => ({ id: p.id, label: p.name, hint: p.verb, tone: p.tone }))

const TONE_CLS: Record<Bucket['tone'], { on: string; text: string }> = {
  violet: { on: 'bg-violet text-surface', text: 'text-violet' }, teal: { on: 'bg-teal text-surface', text: 'text-teal' },
  sky: { on: 'bg-sky text-surface', text: 'text-sky' }, coral: { on: 'bg-coral text-surface', text: 'text-coral' },
  amber: { on: 'bg-amber text-surface', text: 'text-amber' }, indigo: { on: 'bg-indigo text-surface', text: 'text-indigo' },
}

function Roadmap({ value, onChange }: { value: Phase; onChange: (p: Phase) => void }) {
  return (
    <div className="grid grid-cols-5 gap-1" role="tablist" aria-label="DMAIC phases">
      {PHASES.map((p, i) => {
        const on = value === p.id
        return (
          <button key={p.id} role="tab" aria-selected={on} onClick={() => onChange(p.id)}
            className={`relative flex flex-col items-center rounded-xl px-1 py-2.5 transition-colors ${on ? TONE_CLS[p.tone].on : 'bg-surface-2 text-ink hover:bg-surface-3'}`}
            style={{ clipPath: i < 4 ? 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)' : undefined }}>
            <span className="font-display text-2xl font-bold leading-none">{p.id}</span>
            <span className="mt-1 hidden text-xs font-semibold sm:block">{p.name}</span>
          </button>
        )
      })}
    </div>
  )
}

const CHECK: CheckItem[] = [
  { q: 'In the IASSC syllabus, where is a detailed SIPOC covered?', options: ['Define', 'Measure (2.1.2)', 'Analyze', 'Control'], answer: 1, why: 'Process mapping, SIPOC and value stream mapping are classified under Measure, even though Define uses a high-level view.' },
  { q: 'A team confirms with a hypothesis test that one shift causes most defects. Which phase?', options: ['Define', 'Measure', 'Analyze', 'Improve'], answer: 2, why: 'Proving a root cause with data is Analyze.' },
  { q: 'When are benefits verified by Finance?', options: ['Define', 'Measure', 'Improve', 'Control'], answer: 3, why: 'Benefits are estimated in Define and verified, realised benefits are confirmed in Control.' },
  { q: 'Which is a Define deliverable?', options: ['Control plan', 'Pilot results', 'Preliminary COPQ estimate', 'Measurement system analysis'], answer: 2, why: 'The book roadmap places estimating the cost of poor quality in Define.' },
]

export default function DmaicLab({ embedded }: LabProps) {
  const [phase, setPhase] = useState<Phase>('D')
  const [card, setCard] = useState(() => ITEMS[Math.floor(Math.random() * ITEMS.length)])
  const [answer, setAnswer] = useState<Phase | null>(null)
  const [tally, setTally] = useState({ right: 0, total: 0 })
  const ph = P(phase)

  const another = () => {
    const pool = ITEMS.filter(i => i.id !== card.id)
    setCard(pool[Math.floor(Math.random() * pool.length)]); setAnswer(null)
  }
  const place = (p: Phase) => {
    if (answer) return
    setAnswer(p)
    const ok = p === card.bucket
    setTally(t => ({ right: t.right + (ok ? 1 : 0), total: t.total + 1 }))
    if (!ok) update(x => { x.mistakes.push({ at: Date.now(), tag: 'phase-boundary', lesson: '1.1.3' }) })
    setPhase(card.bucket as Phase)
  }

  const explore = (
    <div className="space-y-5">
      <Roadmap value={phase} onChange={setPhase} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className="grid gap-4 rounded-2xl border border-line p-4 md:grid-cols-2">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">{ph.name} <span className={`text-base ${TONE_CLS[ph.tone].text}`}>{ph.verb}</span></h3>
            <p className="mt-1 text-[0.95rem] text-ink-2">{ph.question}</p>
            <h4 className="mt-3 text-sm font-semibold text-ink">Goals (book roadmap, paraphrased)</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-2">{ph.goals.map(g => <li key={g}>{g}</li>)}</ul>
            <p className="mt-3 rounded-xl bg-coral-soft px-3 py-2 text-sm text-ink"><strong className="text-coral">Boundary trap: </strong>{ph.trap}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink">Typical deliverables</h4>
            <ul className="mt-2 space-y-1.5">
              {ph.deliverables.map((d, i) => (
                <motion.li key={d} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.2 }} className="rounded-lg bg-surface-2 px-3 py-1.5 text-sm text-ink">{d}</motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="rounded-2xl border border-dashed border-line-2 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-ink">Where does it belong?</h3>
          <span className="tabular text-sm text-ink-3">{tally.right} of {tally.total} correct this session</span>
        </div>
        <p className="mt-2 rounded-xl bg-surface-2 px-3 py-2.5 font-semibold text-ink">{card.text}</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {PHASES.map(p => {
            const show = answer !== null
            const cls = show && p.id === card.bucket ? 'border-good bg-good-soft' : show && p.id === answer ? 'border-bad bg-bad-soft' : 'border-line hover:bg-surface-2'
            return <button key={p.id} disabled={show} onClick={() => place(p.id)} className={`rounded-xl border px-1 py-2 text-sm font-semibold text-ink transition-colors disabled:cursor-default ${cls}`} aria-label={`Place in ${p.name}`}><span className="sm:hidden">{p.id}</span><span className="hidden sm:inline">{p.name}</span></button>
          })}
        </div>
        {answer && <Feedback ok={answer === card.bucket}><strong>{P(card.bucket as Phase).name}.</strong> {card.why}</Feedback>}
        {answer && <button className="btn btn-soft btn-sm mt-3" onClick={another}>Next activity</button>}
      </div>
    </div>
  )

  return (
    <LabShell
      lab="dmaic"
      embedded={embedded}
      instructions="Select a phase on the roadmap to see its goals, typical deliverables and the boundary trap examiners like. Then test yourself: place each project activity in its phase. The roadmap jumps to the right phase so you can see why."
      scenario="Riverside Telecom's first-contact resolution has fallen from 71% to 62%. You are planning the DMAIC project and must decide what the team does in each phase."
      explore={explore}
      challenge={<ClassifierGame lab="dmaic" items={ITEMS} buckets={BUCKETS} count={10} timed />}
      check={<KnowledgeCheck lab="dmaic" items={CHECK} />}
      onReset={() => { setPhase('D'); setAnswer(null); setTally({ right: 0, total: 0 }) }}
      onNewExample={another}
    />
  )
}
