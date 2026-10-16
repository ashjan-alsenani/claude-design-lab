import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Quote } from 'lucide-react'
import { useState } from 'react'
import type { LabProps } from './registry'
import { ClassifierGame, Feedback, KnowledgeCheck, LabShell, type Bucket, type CheckItem, type ClassItem } from './kit'
import { Segmented } from '../components/ui'
import { update } from '../lib/store'

const M = 'voice-confusion' as const
const ITEMS: ClassItem[] = [
  { id: 'c1', text: '"I was on hold for 25 minutes before anyone answered."', bucket: 'VOC', why: 'A customer describing their experience of speed.', mistake: M },
  { id: 'c2', text: '"I had to explain my fault three times to three people."', bucket: 'VOC', why: 'The receiver of the service wants resolution without repetition.', mistake: M },
  { id: 'c3', text: '"The engineer never turned up in the booked slot."', bucket: 'VOC', why: 'A customer need for reliable appointments.', mistake: M },
  { id: 'c4', text: '"My bill is impossible to understand."', bucket: 'VOC', why: 'Clarity as experienced by the customer.', mistake: M },
  { id: 'c5', text: '"When our line drops, nobody tells us anything."', bucket: 'VOC', why: 'A business customer asking for proactive updates.', mistake: M },
  { id: 'c6', text: 'Field engineering complains that dispatch sends jobs with no fault code', bucket: 'VOC', why: 'Field engineering is the internal customer of dispatch: this is the voice of an internal customer.', mistake: M },
  { id: 'c7', text: 'Billing says order entry passes them orders with missing tariffs', bucket: 'VOC', why: 'Billing receives order entry\'s output, so it is an internal customer.', mistake: M },
  { id: 'c8', text: 'A corporate client asks for a monthly outage report within 5 days of month end', bucket: 'VOC', why: 'A requirement from the receiver of the output.', mistake: M },
  { id: 'c9', text: 'Survey verbatim: "Setting up the router was easy, but activation took a week."', bucket: 'VOC', why: 'Customer feedback about the service.', mistake: M },
  { id: 'c10', text: 'Social media posts complaining about slow evening speeds', bucket: 'VOC', why: 'Unprompted customer opinions are still VOC.', mistake: M },
  { id: 'c11', text: '"I just want the fault fixed the first time."', bucket: 'VOC', why: 'A customer need for right-first-time repair.', mistake: M },
  { id: 'b1', text: 'Reduce cost per repair by 12% this financial year', bucket: 'VOB', why: 'A cost target: the business\'s need.', mistake: M },
  { id: 'b2', text: 'Grow fibre market share in the North region to 30%', bucket: 'VOB', why: 'Growth and market share are VOB.', mistake: M },
  { id: 'b3', text: 'The regulator requires fault-repair statistics to be published quarterly', bucket: 'VOB', why: 'Compliance with regulation is usually treated as VOB.', mistake: M },
  { id: 'b4', text: 'Service credits paid must fall below USD 50,000 a quarter', bucket: 'VOB', why: 'A financial target of the business.', mistake: M },
  { id: 'b5', text: 'Churn must not exceed 1.2% a month', bucket: 'VOB', why: 'Customer retention as a business metric.', mistake: M },
  { id: 'b6', text: 'Overtime spend is 18% over budget', bucket: 'VOB', why: 'A business cost concern.', mistake: M },
  { id: 'b7', text: 'Data protection law requires call recordings to be deleted after 90 days', bucket: 'VOB', why: 'A legal requirement on the business: VOB (compliance).', mistake: M },
  { id: 'b8', text: 'The board wants the margin on business broadband raised by 2 points', bucket: 'VOB', why: 'Profitability: VOB.', mistake: M },
  { id: 'b9', text: 'Shareholders expect revenue growth of 5% a year', bucket: 'VOB', why: 'Investor needs: VOB.', mistake: M },
  { id: 'b10', text: 'Audit requires two-person approval for payments above USD 10,000', bucket: 'VOB', why: 'A control and risk requirement of the business.', mistake: M },
  { id: 'e1', text: '"I need one screen, not four, to see a customer\'s history."', bucket: 'VOE', why: 'An agent describing the tools needed to do the work.', mistake: M },
  { id: 'e2', text: 'Engineers say the van stock list is out of date', bucket: 'VOE', why: 'Front-line insight about the work.', mistake: M },
  { id: 'e3', text: 'Agents report the new script makes calls longer', bucket: 'VOE', why: 'Employees\' knowledge of what fails in the process.', mistake: M },
  { id: 'e4', text: 'Staff survey: 64% feel workload is unmanageable on Mondays', bucket: 'VOE', why: 'Workload and morale: VOE.', mistake: M },
  { id: 'e5', text: 'An AP clerk suggests a cost-centre lookup to stop returned invoices', bucket: 'VOE', why: 'An improvement idea from the people doing the work.', mistake: M },
  { id: 'e6', text: 'Night-shift engineers ask for safety lighting at the depot', bucket: 'VOE', why: 'Safety needs of employees.', mistake: M },
  { id: 'e7', text: 'Nurses say the discharge forms duplicate each other', bucket: 'VOE', why: 'Front-line staff insight about the process.', mistake: M },
  { id: 'e8', text: 'Dispatchers want training on the new routing tool', bucket: 'VOE', why: 'Training needs of employees.', mistake: M },
  { id: 'e9', text: 'eNPS fell from +12 to -4 in the contact centre', bucket: 'VOE', why: 'An employee sentiment measure.', mistake: M },
  { id: 'e10', text: 'Engineers report that the fault-code list misses common fibre faults', bucket: 'VOE', why: 'Employees doing the work know where the process fails.', mistake: M },
]

const BUCKETS: Bucket[] = [
  { id: 'VOC', label: 'Voice of the Customer', hint: 'Receivers of the output, internal or external', tone: 'violet' },
  { id: 'VOB', label: 'Voice of the Business', hint: 'Cost, revenue, growth, risk, compliance', tone: 'teal' },
  { id: 'VOE', label: 'Voice of the Employee', hint: 'Workload, tools, training, safety, ideas', tone: 'amber' },
]

interface Translate { quote: string; needs: string[]; need: number; reqs: string[]; req: number; why: string }
const TRANSLATIONS: Translate[] = [
  { quote: '"I was on hold forever."', needs: ['Quick access to an agent', 'A cheaper tariff', 'A nicer hold music playlist'], need: 0,
    reqs: ['Answer calls faster', 'Time to answer at most 120 seconds for 90% of calls', 'Average handle time below 6 minutes'], req: 1,
    why: 'The need is quick access. The CTQ must be measurable with a target: "faster" is not measurable, and handle time measures something else.' },
  { quote: '"I had to explain my fault three times."', needs: ['Shorter calls', 'Resolve without repeating myself', 'More agents'], need: 1,
    reqs: ['Repeat contacts within 7 days below 8%', 'Agents should be friendlier', 'Hire 20 agents'], req: 0,
    why: 'The need is resolution without repetition. "Hire 20 agents" is a solution, not a requirement.' },
  { quote: '"The engineer never turned up."', needs: ['Reliable appointments', 'Cheaper installation', 'An app to track engineers'], need: 0,
    reqs: ['Appointments kept within the booked slot at least 97% of the time', 'Better scheduling', 'Engineers always on time, every time, instantly'], req: 0,
    why: 'Measurable with a target. "Always, instantly" fails RUMBA: not Reasonable or Achievable.' },
  { quote: '"When our line drops, nobody tells us anything."', needs: ['Proactive, timely updates during an outage', 'A discount on every outage', 'A dedicated account manager'], need: 0,
    reqs: ['Keep customers informed', 'First status update within 30 minutes of fault registration (target 15)', 'Send an email'], req: 1,
    why: 'Timestamps make it measurable, with a target and an upper limit.' },
  { quote: '"My invoice is always wrong."', needs: ['Accurate bills', 'Paper bills', 'Lower prices'], need: 0,
    reqs: ['Fewer than 0.5% of invoices need a correction', 'Make invoices better', 'Buy a new billing system'], req: 0,
    why: 'Accuracy expressed as a measurable rate. A new system is a solution; "better" is not measurable.' },
]

const QUICK = ITEMS.filter((_, i) => i % 3 === 0)

const CHECK: CheckItem[] = [
  { q: 'A regulator requires quarterly publication of repair statistics. Which voice is this usually treated as?', options: ['VOC', 'VOB', 'VOE', 'VOP'], answer: 1, why: 'Compliance and regulation are usually treated as Voice of the Business.' },
  { q: 'Field engineering complains that dispatch sends jobs without fault codes. Which voice?', options: ['VOB', 'VOE of dispatch', 'VOC of an internal customer', 'Not a voice'], answer: 2, why: 'Field engineering receives dispatch\'s output, so it is dispatch\'s internal customer.' },
  { q: 'Which is a valid CTQ rather than a need?', options: ['"Fast service"', '"Good communication"', 'Answer 90% of calls within 120 seconds', '"Fewer problems"'], answer: 2, why: 'A CTQ is measurable, with a target or limit.' },
  { q: '"Median fix time is 31 hours" describes which voice?', options: ['VOC', 'VOB', 'VOE', 'VOP (Voice of the Process)'], answer: 3, why: 'Measured performance is the Voice of the Process, which you compare with the other voices.' },
]

function useQuickSort() {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<string | null>(null)
  const it = QUICK[i % QUICK.length]
  const choose = (b: string) => {
    if (pick) return
    setPick(b)
    if (b !== it.bucket) update(p => { p.mistakes.push({ at: Date.now(), tag: 'voice-confusion', lesson: '1.1.5' }) })
  }
  return { i, setI: (n: number) => { setI(n); setPick(null) }, view: (
    <div className="rounded-2xl border border-line p-4">
      <h3 className="font-display text-base font-semibold text-ink">Whose voice is this?</h3>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p key={it.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-2 flex gap-2 rounded-xl bg-surface-2 px-3 py-3 text-[0.95rem] text-ink"><Quote className="mt-0.5 size-4 shrink-0 text-violet" />{it.text}</motion.p>
      </AnimatePresence>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {BUCKETS.map(b => {
          const show = pick !== null
          const cls = show && b.id === it.bucket ? 'border-good bg-good-soft' : show && b.id === pick ? 'border-bad bg-bad-soft' : 'border-line hover:bg-surface-2'
          return <button key={b.id} disabled={show} onClick={() => choose(b.id)} className={`rounded-xl border px-2 py-2.5 text-sm font-semibold text-ink transition-colors disabled:cursor-default ${cls}`}>{b.id}</button>
        })}
      </div>
      {pick && <><Feedback ok={pick === it.bucket}><strong>{BUCKETS.find(b => b.id === it.bucket)!.label}.</strong> {it.why}</Feedback><button className="btn btn-soft btn-sm mt-3" onClick={() => { setI(i + 1); setPick(null) }}>Next statement</button></>}
    </div>
  ) }
}

function Translator({ ti, onPick }: { ti: number; onPick: (n: number) => void }) {
  const t = TRANSLATIONS[ti]
  const [need, setNeed] = useState<number | null>(null)
  const [req, setReq] = useState<number | null>(null)
  const opt = (sel: number | null, j: number, ans: number) => sel === null ? 'border-line hover:bg-surface-2' : j === ans ? 'border-good bg-good-soft' : j === sel ? 'border-bad bg-bad-soft' : 'border-line opacity-70'
  return (
    <div className="rounded-2xl border border-line p-4">
      <h3 className="font-display text-base font-semibold text-ink">Translate the voice</h3>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Choose a customer quote">
        {TRANSLATIONS.map((x, k) => <button key={k} aria-pressed={k === ti} onClick={() => onPick(k)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${k === ti ? 'border-violet bg-violet-soft text-ink' : 'border-line text-ink-2 hover:text-ink'}`}>{x.quote}</button>)}
      </div>
      <div className="mt-4 grid items-start gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div>
          <div className="label">1. Verbatim</div>
          <p className="rounded-xl bg-violet-soft px-3 py-3 font-semibold text-ink">{t.quote}</p>
        </div>
        <ArrowRight className="mx-auto hidden size-5 self-center text-ink-3 md:block" aria-hidden />
        <fieldset>
          <legend className="label">2. Underlying need</legend>
          <div className="space-y-1.5">{t.needs.map((n, j) => <button key={j} disabled={need !== null} onClick={() => { setNeed(j); if (j !== t.need) update(p => { p.mistakes.push({ at: Date.now(), tag: 'ctq-vague', lesson: '1.1.5' }) }) }} className={`w-full rounded-xl border px-3 py-2 text-left text-sm text-ink transition-colors disabled:cursor-default ${opt(need, j, t.need)}`}>{n}</button>)}</div>
        </fieldset>
        <ArrowRight className="mx-auto hidden size-5 self-center text-ink-3 md:block" aria-hidden />
        <fieldset disabled={need === null} className="disabled:opacity-50">
          <legend className="label">3. Measurable requirement (CTQ)</legend>
          <div className="space-y-1.5">{t.reqs.map((r, j) => <button key={j} disabled={req !== null || need === null} onClick={() => { setReq(j); if (j !== t.req) update(p => { p.mistakes.push({ at: Date.now(), tag: 'ctq-vague', lesson: '1.1.5' }) }) }} className={`w-full rounded-xl border px-3 py-2 text-left text-sm text-ink transition-colors disabled:cursor-default ${opt(req, j, t.req)}`}>{r}</button>)}</div>
        </fieldset>
      </div>
      {req !== null && <Feedback ok={need === t.need && req === t.req}>{t.why} Check every CTQ with RUMBA: Reasonable, Understandable, Measurable, Believable, Achievable.</Feedback>}
    </div>
  )
}

export default function VoiceLab({ embedded }: LabProps) {
  const [mode, setMode] = useState<'sort' | 'translate'>('sort')
  const [ti, setTi] = useState(0)
  const [tKey, setTKey] = useState(0)
  const quick = useQuickSort()

  const explore = (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3">
        {[
          { id: 'VOC', t: 'Voice of the Customer', d: 'Needs of whoever receives the output, external or internal.', c: 'bg-violet-soft text-violet' },
          { id: 'VOB', t: 'Voice of the Business', d: 'Profit, cost, growth, risk and compliance.', c: 'bg-teal-soft text-teal' },
          { id: 'VOE', t: 'Voice of the Employee', d: 'Workload, tools, training, safety and ideas (supplementary).', c: 'bg-amber-soft text-amber' },
        ].map(v => (
          <div key={v.id} className="rounded-2xl border border-line p-3">
            <span className={`rounded-lg px-2 py-0.5 font-display text-sm font-bold ${v.c}`}>{v.id}</span>
            <div className="mt-1.5 font-semibold text-ink">{v.t}</div>
            <p className="text-sm text-ink-2">{v.d}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-ink-2">The Voice of the Process (VOP) is what the process actually does, shown by data. Improvement lives in the gap between what the voices want and what the process does.</p>
      <Segmented label="Activity" value={mode} onChange={setMode} options={[{ value: 'sort', label: 'Whose voice?' }, { value: 'translate', label: 'Translate the voice' }]} size="sm" />
      {mode === 'sort' ? quick.view : <Translator key={`${ti}-${tKey}`} ti={ti} onPick={setTi} />}
    </div>
  )

  return (
    <LabShell
      lab="voice"
      embedded={embedded}
      instructions="Read each statement and decide whose voice it is. Then switch to Translate the voice: pick a customer quote, choose the real need behind it and the measurable requirement that captures it."
      scenario="You have a pile of complaints, survey verbatims, budget targets and staff suggestions from a broadband provider, and need to sort them before building CTQs."
      explore={explore}
      challenge={<ClassifierGame lab="voice" items={ITEMS} buckets={BUCKETS} count={10} timed />}
      check={<KnowledgeCheck lab="voice" items={CHECK} />}
      onReset={() => { quick.setI(0); setTi(0); setTKey(k => k + 1) }}
      onNewExample={() => { if (mode === 'sort') quick.setI(quick.i + 1); else { setTi(x => (x + 1) % TRANSLATIONS.length); setTKey(k => k + 1) } }}
    />
  )
}
