import { motion } from 'motion/react'
import { Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { Segmented } from '../components/ui'
import { costOfQuality, fmt, pct, type CostOfQuality } from '../lib/metrics'
import { ClassifierGame, KnowledgeCheck, LabShell, NumberField, Slider, type Bucket, type ClassItem } from './kit'
import type { LabProps } from './registry'

const EASE = [0.23, 1, 0.32, 1] as const
const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const money = (v: number) => `$${fmt(v, 0)}`

/* ------------------------------------------------------------------ */
/* Classification pool                                                 */
/* ------------------------------------------------------------------ */

type Cat = 'prevention' | 'appraisal' | 'internal' | 'external'

const BUCKETS: Bucket[] = [
  { id: 'prevention', label: 'Prevention', hint: 'Stops defects being created', tone: 'teal' },
  { id: 'appraisal', label: 'Appraisal', hint: 'Checks whether work meets requirements', tone: 'sky' },
  { id: 'internal', label: 'Internal failure', hint: 'Defect found before the customer', tone: 'amber' },
  { id: 'external', label: 'External failure', hint: 'Defect found by or after the customer', tone: 'coral' },
]

const it = (id: string, text: string, bucket: Cat, why: string): ClassItem => ({ id, text, bucket, why, mistake: 'copq-classification' })

const ITEMS: ClassItem[] = [
  it('p1', 'Training new contact centre agents on billing rules', 'prevention', 'Training reduces the chance of errors being made in the first place.'),
  it('p2', 'Mistake-proofing the order form so the postcode must match the address database', 'prevention', 'Mistake-proofing stops the defect from being created.'),
  it('p3', 'Qualifying a new router supplier before the first order', 'prevention', 'Supplier qualification happens before any product arrives, to prevent defects.'),
  it('p4', 'Writing standard work instructions for fibre splicing', 'prevention', 'Standard work designs quality into the process.'),
  it('p5', 'Quality planning workshop before a new tariff launch', 'prevention', 'Planning to avoid errors is a prevention activity.'),
  it('p6', 'Preventive maintenance on a modem assembly machine', 'prevention', 'Maintenance keeps the machine from producing defects.'),
  it('a1', 'Inspecting incoming circuit boards from a supplier', 'appraisal', 'Inspection checks conformance; it does not prevent or fix defects.'),
  it('a2', 'Team leaders monitoring and scoring recorded calls', 'appraisal', 'Call monitoring evaluates whether work meets the standard.'),
  it('a3', 'Calibrating the line test equipment', 'appraisal', 'Calibration keeps measurement trustworthy, part of appraisal.'),
  it('a4', 'Final inspection of finished modems before shipping', 'appraisal', 'Checking product before release is appraisal.'),
  it('a5', 'Monthly audit of invoice approvals', 'appraisal', 'Audits measure compliance with requirements.'),
  it('a6', 'Testing a billing software release before deployment', 'appraisal', 'Testing verifies the release meets requirements.'),
  it('i1', 'Re-keying activation orders rejected by the provisioning system', 'internal', 'The defect was caught inside before the customer was affected.'),
  it('i2', 'Scrapping circuit boards with soldering faults found in the factory', 'internal', 'Scrap found before shipping is internal failure.'),
  it('i3', 'Re-testing a modem after it has been reworked', 'internal', 'This test only exists because of the failure, so it is failure cost, not appraisal.'),
  it('i4', 'Engineer overtime to fix a provisioning error before the customer goes live', 'internal', 'Fixed before the customer noticed, so internal.'),
  it('i5', 'Production line idle while a defective batch is sorted', 'internal', 'Downtime caused by defects found internally.'),
  it('i6', 'Accounts payable correcting invoice errors before payment', 'internal', 'Caught inside the organisation before reaching the supplier or customer.'),
  it('e1', 'Repeat truck roll to a customer whose fault was not fixed', 'external', 'The customer experienced the failure, so external.'),
  it('e2', 'SLA credits paid to a business customer after an outage', 'external', 'Penalties paid to customers are external failure.'),
  it('e3', 'Handling complaints about wrong bills', 'external', 'The customer found the defect.'),
  it('e4', 'Warranty replacement of routers that failed in customers\' homes', 'external', 'Warranty costs arise after delivery to the customer.'),
  it('e5', 'Recalling a batch of faulty set-top boxes', 'external', 'The product already reached customers.'),
  it('e6', 'Margin lost when customers leave after repeated billing errors', 'external', 'Lost customers are a hidden external failure cost.'),
  it('e7', 'Compensation paid for a missed installation appointment', 'external', 'Paid because the customer experienced the failure.'),
]

/* ------------------------------------------------------------------ */
/* Calculator data                                                     */
/* ------------------------------------------------------------------ */

interface Line { id: string; text: string; amount: number; cat: Cat; visible: boolean }
let lid = 0
const ln = (text: string, amount: number, cat: Cat, visible: boolean): Line => ({ id: `l${++lid}`, text, amount, cat, visible })
const DEFAULT_LINES = () => [
  ln('Agent training on fault diagnosis', 6000, 'prevention', true),
  ln('Mistake-proofing the booking tool', 4500, 'prevention', true),
  ln('Call quality monitoring', 7800, 'appraisal', true),
  ln('Line test equipment calibration', 1200, 'appraisal', true),
  ln('Re-keying rejected orders (staff time)', 9400, 'internal', false),
  ln('Engineer overtime fixing failed installs', 12600, 'internal', true),
  ln('Repeat truck rolls', 31000, 'external', true),
  ln('SLA credits', 18500, 'external', true),
  ln('Complaint handling time', 14200, 'external', false),
  ln('Margin lost from churned customers (estimate)', 42000, 'external', false),
]
const DEFAULT_CATS: CostOfQuality = { prevention: 10500, appraisal: 9000, internalFailure: 22000, externalFailure: 105700 }

const CAT_META: { key: keyof CostOfQuality; cat: Cat; label: string; color: string }[] = [
  { key: 'prevention', cat: 'prevention', label: 'Prevention', color: 'var(--teal)' },
  { key: 'appraisal', cat: 'appraisal', label: 'Appraisal', color: 'var(--sky)' },
  { key: 'internalFailure', cat: 'internal', label: 'Internal failure', color: 'var(--amber)' },
  { key: 'externalFailure', cat: 'external', label: 'External failure', color: 'var(--coral)' },
]

/* ------------------------------------------------------------------ */
/* Visuals                                                             */
/* ------------------------------------------------------------------ */

function StackBar({ c }: { c: CostOfQuality }) {
  const tot = costOfQuality(c).total || 1
  let acc = 0
  const segs = CAT_META.map(m => { const x = 10 + (acc / tot) * 700; const w = (c[m.key] / tot) * 700; acc += c[m.key]; return { m, x, w } })
  const failX = segs[2].x
  return (
    <svg viewBox="0 0 720 112" className="h-auto w-full" role="img" aria-label={`Cost of quality split: ${CAT_META.map(m => `${m.label} ${money(c[m.key])}`).join(', ')}.`}>
      {segs.map(({ m, x, w }) => (
        <g key={m.key}>
          <motion.rect y={14} height={44} rx={6} fill={m.color} initial={false} animate={{ x, width: Math.max(0, w - 2) }} transition={{ duration: 0.6, ease: EASE }} />
          {w > 64 && <motion.text y={41} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--surface)" fontFamily="var(--font-sans)" initial={false} animate={{ x: x + w / 2 }} transition={{ duration: 0.6, ease: EASE }}>{pct(c[m.key] / tot, 0)}</motion.text>}
        </g>
      ))}
      <motion.path initial={false} animate={{ d: `M ${failX} 70 L ${failX} 78 L 710 78 L 710 70` }} transition={{ duration: 0.6, ease: EASE }} fill="none" stroke="var(--bad)" strokeWidth={2} />
      <motion.text y={100} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--bad)" fontFamily="var(--font-sans)" initial={false} animate={{ x: (failX + 710) / 2 }} transition={{ duration: 0.6, ease: EASE }}>strict COPQ</motion.text>
      <motion.path initial={false} animate={{ d: `M 10 70 L 10 78 L ${Math.max(10, failX - 4)} 78 L ${Math.max(10, failX - 4)} 70` }} transition={{ duration: 0.6, ease: EASE }} fill="none" stroke="var(--good)" strokeWidth={2} />
      {failX > 150 && <motion.text y={100} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--good)" fontFamily="var(--font-sans)" initial={false} animate={{ x: (10 + failX) / 2 }} transition={{ duration: 0.6, ease: EASE }}>cost of good quality</motion.text>}
    </svg>
  )
}

function Iceberg({ visible, hidden }: { visible: number; hidden: number }) {
  const tot = visible + hidden
  const f = tot > 0 ? Math.max(0.06, Math.min(0.9, visible / tot)) : 0.5
  const water = 104, H = 230
  const top = water - f * H
  const shape = 'M 360 0 L 410 34 L 440 70 L 470 96 L 520 150 L 560 190 L 540 230 L 450 230 L 330 230 L 200 230 L 180 196 L 230 150 L 270 104 L 300 60 L 330 26 Z'
  return (
    <svg viewBox="0 0 720 300" className="h-auto w-full" role="img" aria-label={`Iceberg: ${money(visible)} of failure cost is visible in the accounts and ${money(hidden)} is hidden below the waterline.`}>
      <rect x={0} y={0} width={720} height={water} fill="var(--surface)" />
      <motion.g initial={false} animate={{ y: top }} transition={{ duration: 0.8, ease: EASE }}>
        <path d={shape} fill="var(--surface-2)" stroke="var(--ink-3)" strokeWidth={1.5} strokeLinejoin="round" />
      </motion.g>
      <rect x={0} y={water} width={720} height={300 - water} fill="var(--sky)" opacity={0.16} />
      <line x1={0} x2={720} y1={water} y2={water} stroke="var(--sky)" strokeWidth={2} />
      <text x={22} y={water - 52} fontSize={13} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">Visible</text>
      <text x={22} y={water - 32} fontSize={13} fill="var(--ink-2)" fontFamily="var(--font-sans)">{money(visible)}</text>
      <text x={22} y={water - 14} fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">on budget lines</text>
      <text x={22} y={water + 34} fontSize={13} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">Hidden</text>
      <text x={22} y={water + 54} fontSize={13} fill="var(--ink-2)" fontFamily="var(--font-sans)">{money(hidden)}</text>
      <text x={22} y={water + 72} fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">hidden factory, lost customers</text>
      <text x={22} y={water + 104} fontSize={13} fontWeight={700} fill="var(--sky)" fontFamily="var(--font-sans)">{tot > 0 ? pct(hidden / tot, 0) : '0%'} below the waterline</text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function CopqLab({ embedded }: LabProps) {
  const [mode, setMode] = useState<'items' | 'category'>('items')
  const [lines, setLines] = useState<Line[]>(DEFAULT_LINES)
  const [cats, setCats] = useState<CostOfQuality>(DEFAULT_CATS)
  const [visShare, setVisShare] = useState(40)
  const [revenue, setRevenue] = useState(1_200_000)

  const fromLines: CostOfQuality = {
    prevention: lines.filter(l => l.cat === 'prevention').reduce((s, l) => s + l.amount, 0),
    appraisal: lines.filter(l => l.cat === 'appraisal').reduce((s, l) => s + l.amount, 0),
    internalFailure: lines.filter(l => l.cat === 'internal').reduce((s, l) => s + l.amount, 0),
    externalFailure: lines.filter(l => l.cat === 'external').reduce((s, l) => s + l.amount, 0),
  }
  const c = mode === 'items' ? fromLines : cats
  const q = costOfQuality(c)
  const failVisible = mode === 'items'
    ? lines.filter(l => (l.cat === 'internal' || l.cat === 'external') && l.visible).reduce((s, l) => s + l.amount, 0)
    : (q.copqStrict * visShare) / 100
  const failHidden = q.copqStrict - failVisible

  const editLine = (id: string, p: Partial<Line>) => setLines(ls => ls.map(l => (l.id === id ? { ...l, ...p } : l)))
  const reset = () => { setLines(DEFAULT_LINES()); setCats(DEFAULT_CATS); setVisShare(40); setRevenue(1_200_000) }
  const another = () => {
    const k = 0.6 + Math.random() * 0.9
    setLines(DEFAULT_LINES().map(l => ({ ...l, amount: Math.round((l.amount * k * (0.6 + Math.random() * 0.8)) / 100) * 100 })))
    setCats({ prevention: ri(40, 200) * 100, appraisal: ri(40, 200) * 100, internalFailure: ri(100, 500) * 100, externalFailure: ri(200, 1400) * 100 })
    setVisShare(ri(4, 12) * 5)
    setRevenue(ri(6, 30) * 100_000)
  }

  const explore = (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">Monthly cost of quality calculator</h3>
        <Segmented size="sm" label="Enter costs" value={mode} onChange={setMode} options={[{ value: 'items', label: 'Itemised' }, { value: 'category', label: 'By category' }]} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-3">
          {mode === 'items' ? (
            <>
              <div className="overflow-x-auto rounded-2xl border border-line">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="bg-surface-2 text-left text-xs text-ink-2">
                    <tr><th className="px-2 py-2">Cost item</th><th className="w-24 px-2 py-2">$ / month</th><th className="w-36 px-2 py-2">Category</th><th className="w-14 px-2 py-2">Visible</th><th className="w-10 px-2 py-2"><span className="sr-only">Remove</span></th></tr>
                  </thead>
                  <tbody>
                    {lines.map(l => (
                      <tr key={l.id} className="border-t border-line">
                        <td className="px-2 py-1.5"><input aria-label="Cost item description" className="field h-9 py-1" value={l.text} onChange={e => editLine(l.id, { text: e.target.value })} /></td>
                        <td className="px-2 py-1.5"><input aria-label={`Monthly amount for ${l.text}`} type="number" min={0} step={100} className="field tabular h-9 py-1" value={l.amount} onChange={e => editLine(l.id, { amount: Math.max(0, e.target.valueAsNumber || 0) })} /></td>
                        <td className="px-2 py-1.5">
                          <select aria-label={`Category for ${l.text}`} className="field h-9 py-1" value={l.cat} onChange={e => editLine(l.id, { cat: e.target.value as Cat })}>
                            {BUCKETS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-1.5 text-center"><input type="checkbox" className="size-4 accent-[var(--sky)]" aria-label={`${l.text} is visible in the accounts`} checked={l.visible} onChange={e => editLine(l.id, { visible: e.target.checked })} /></td>
                        <td className="px-2 py-1.5"><button className="btn btn-ghost btn-icon btn-sm" aria-label={`Remove ${l.text}`} onClick={() => setLines(ls => ls.filter(x => x.id !== l.id))}><Trash className="size-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-soft btn-sm" onClick={() => setLines(ls => [...ls, ln('New cost item', 1000, 'internal', true)])}><Plus className="size-4" /> Add cost item</button>
              <p className="text-xs leading-relaxed text-ink-3">Visible means the cost appears on its own budget line. Staff time spent on rework, complaint handling and lost customers usually does not: that is the hidden factory.</p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <NumberField id="copq-p" label="Prevention" value={cats.prevention} onChange={v => setCats(s => ({ ...s, prevention: Math.max(0, v) }))} step={500} suffix="$/mo" />
                <NumberField id="copq-a" label="Appraisal" value={cats.appraisal} onChange={v => setCats(s => ({ ...s, appraisal: Math.max(0, v) }))} step={500} suffix="$/mo" />
                <NumberField id="copq-i" label="Internal failure" value={cats.internalFailure} onChange={v => setCats(s => ({ ...s, internalFailure: Math.max(0, v) }))} step={500} suffix="$/mo" />
                <NumberField id="copq-e" label="External failure" value={cats.externalFailure} onChange={v => setCats(s => ({ ...s, externalFailure: Math.max(0, v) }))} step={500} suffix="$/mo" />
              </div>
              <Slider id="copq-vis" label="Share of failure cost visible in the accounts" min={0} max={100} step={5} value={visShare} onChange={setVisShare} format={v => `${v}%`} />
            </div>
          )}
          <NumberField id="copq-rev" label="Monthly revenue" value={revenue} onChange={v => setRevenue(Math.max(0, v))} step={50000} suffix="$" />
        </div>

        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: 'Total cost of quality', v: money(q.total), s: 'all four categories', c: 'text-ink' },
              { l: 'Strict COPQ', v: money(q.copqStrict), s: 'internal + external failure', c: 'text-bad' },
              { l: 'COPQ as % of revenue', v: revenue > 0 ? pct(q.copqStrict / revenue, 1) : 'n/a', s: 'strict basis', c: 'text-bad' },
              { l: 'Strict COPQ per year', v: money(q.copqStrict * 12), s: 'monthly x 12', c: 'text-ink' },
            ].map(k => (
              <div key={k.l} className="rounded-2xl border border-line p-3">
                <div className="text-xs font-semibold text-ink-3">{k.l}</div>
                <motion.div key={k.v} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`tabular font-display text-xl font-bold ${k.c}`}>{k.v}</motion.div>
                <div className="text-xs text-ink-3">{k.s}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-line p-3"><StackBar c={c} /></div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-line p-3">
          <h3 className="px-1 font-display text-base font-semibold text-ink">The failure-cost iceberg</h3>
          <Iceberg visible={failVisible} hidden={failHidden} />
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-ink-2">
          <div className="rounded-2xl bg-teal-soft/60 p-4">
            <h3 className="mb-1 font-display text-base font-semibold text-ink">Strict definition (use this in the exam)</h3>
            COPQ = internal failure + external failure = <strong className="tabular text-ink">{money(q.copqStrict)}</strong>. Prevention and appraisal ({money(q.conformance)}) are the <em>cost of good quality</em>.
          </div>
          <div className="rounded-2xl bg-surface-2/70 p-4">
            <h3 className="mb-1 font-display text-base font-semibold text-ink">Loose definition</h3>
            Some programmes call all four categories COPQ, which here would be <strong className="tabular text-ink">{money(q.total)}</strong>. Always state which basis you are using. Total Cost of Quality is the clearer name for this figure.
          </div>
          <p>Internal versus external depends on <strong className="text-ink">where the defect was found</strong>, not where it was caused. Spending a little more on prevention usually cuts failure costs by far more, which is why the 1-10-100 rule of thumb is so often quoted.</p>
        </div>
      </div>
    </div>
  )

  return (
    <LabShell
      lab="copq"
      embedded={embedded}
      instructions="Enter one month of quality-related costs, either line by line or as category totals, plus monthly revenue. The calculator splits cost of good quality from strict COPQ, shows COPQ as a share of revenue and sinks hidden failure costs below the iceberg's waterline. The challenge asks you to classify costs into the four categories."
      scenario="Northwind Fibre's operations director suspects that poor quality costs far more than the budget shows. You are pulling together one month of costs from service operations and the modem repair workshop."
      onReset={reset}
      onNewExample={another}
      explore={explore}
      challenge={
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-2">Sort 8 costs drawn at random from a pool of {ITEMS.length} service and manufacturing examples. Ask two questions for each: does it prevent, check or fix? If it fixes, who found the defect: us or the customer? Each new round draws a fresh set.</p>
          <ClassifierGame lab="copq" items={ITEMS} buckets={BUCKETS} count={8} />
        </div>
      }
      check={<KnowledgeCheck lab="copq" items={[
        { q: 'A billing error is created by the billing team but discovered by the customer. Which category is the cost of correcting it?', options: ['Prevention', 'Appraisal', 'Internal failure', 'External failure'], answer: 3, why: 'Classification depends on where the defect was found. The customer found it, so it is external failure.' },
        { q: 'Re-testing a unit after rework is classified as:', options: ['Appraisal, because it is a test', 'Internal failure, because it exists only because of the failure', 'Prevention', 'External failure'], answer: 1, why: 'The test would not be needed without the failure, so it is internal failure cost.' },
        { q: 'A cost list contains training 5,000, inspection 8,000, scrap 12,000 and warranty 20,000. What is strict COPQ?', options: ['45,000', '32,000', '25,000', '13,000'], answer: 1, why: 'Strict COPQ counts failure costs only: 12,000 + 20,000 = 32,000. Total Cost of Quality would be 45,000.' },
        { q: 'Why is COPQ often compared to an iceberg?', options: ['It melts over time', 'Many failure costs such as lost customers and hidden rework do not appear on budget lines', 'It is always 80% of revenue', 'Prevention costs are hidden'], answer: 1, why: 'Visible costs like scrap and credits are only the tip; hidden factory effort and lost goodwill sit below the waterline.' },
      ]} />}
    />
  )
}
