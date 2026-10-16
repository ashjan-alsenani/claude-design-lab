import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, RotateCcw, TriangleAlert, Trophy } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import type { LabKey, MistakeTag } from '../data/types'
import { Tex } from '../components/Math'
import { recordLab, update } from '../lib/store'
import { MILLION, closeEnough, dpmo, dpo, dpu, fmt, parseNumber, pct, proportionDefective, sigmaFromDpmo } from '../lib/metrics'
import { Feedback, KnowledgeCheck, LabShell, NumberField } from './kit'
import type { LabProps } from './registry'

const EASE = [0.23, 1, 0.32, 1] as const
const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
const tx = (n: number, d = 4) => fmt(n, d).replace(/,/g, '{,}')

function logMistake(tag: MistakeTag) {
  update(p => {
    p.mistakes.push({ at: Date.now(), tag })
    if (p.mistakes.length > 600) p.mistakes.splice(0, p.mistakes.length - 600)
  })
}

/* ------------------------------------------------------------------ */
/* Scenarios                                                           */
/* ------------------------------------------------------------------ */

interface Scenario { id: string; unit: string; units: string; opp: string; text: string; units0: number; opps: number; defects: number; defectives: number }

const KINDS = [
  { id: 'invoice', unit: 'invoice', units: 'invoices', opp: 'fields that can be wrong (supplier ID, PO number, amount, VAT code, due date, cost centre)', where: 'Halden Health accounts payable audits a batch of supplier invoices.' },
  { id: 'activation', unit: 'order', units: 'activation orders', opp: 'checkpoints that can fail (SIM pairing, number port, tariff, address, credit check)', where: 'Kestrel Mobile reviews a week of mobile activation orders.' },
  { id: 'ticket', unit: 'ticket', units: 'closed tickets', opp: 'quality attributes (category, priority, resolution note, customer confirmation)', where: 'A telecom service desk audits closed fault tickets.' },
]

const DEFAULT: Scenario = { id: 'invoice', unit: 'invoice', units: 'invoices', opp: KINDS[0].opp, text: KINDS[0].where, units0: 500, opps: 6, defects: 84, defectives: 60 }

function randomScenario(): Scenario {
  const k = pick(KINDS)
  const opps = k.id === 'invoice' ? ri(4, 8) : k.id === 'activation' ? ri(3, 6) : ri(3, 5)
  const units = ri(8, 40) * 25
  const defectives = Math.max(2, Math.round(units * (0.02 + Math.random() * 0.1)))
  const defects = defectives + ri(0, Math.round(defectives * 0.7))
  return { id: k.id, unit: k.unit, units: k.units, opp: k.opp, text: k.where, units0: units, opps, defects, defectives }
}

function validate(u: number, o: number, d: number, dv: number): string[] {
  const out: string[] = []
  if (!(u > 0) || !Number.isInteger(u)) out.push('Units must be a whole number greater than zero.')
  if (!(o > 0) || !Number.isInteger(o)) out.push('Opportunities per unit must be a whole number greater than zero.')
  if (d < 0 || dv < 0 || !Number.isInteger(d) || !Number.isInteger(dv)) out.push('Defects and defective units are whole counts of zero or more.')
  if (dv > u) out.push('Defective units cannot exceed the number of units inspected.')
  if (dv > d) out.push('Every defective unit carries at least one defect, so total defects must be at least the number of defective units.')
  if (d > 0 && dv === 0) out.push('If defects were found, at least one unit must be defective.')
  if (u > 0 && o > 0 && d > u * o) out.push('Defects cannot exceed the total number of opportunities (units x opportunities per unit).')
  return out
}

/* ------------------------------------------------------------------ */
/* Visuals                                                             */
/* ------------------------------------------------------------------ */

function Stage({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: 'ink' | 'teal' | 'coral' | 'violet' }) {
  const cls = { ink: 'text-ink', teal: 'text-teal', coral: 'text-coral', violet: 'text-violet' }[tone]
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-line bg-surface-2/60 px-3 py-3">
      <div className="text-xs font-semibold text-ink-3">{label}</div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={value} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: EASE }}
          className={`tabular font-display text-xl font-bold sm:text-2xl ${cls}`}>{value}</motion.div>
      </AnimatePresence>
      {sub && <div className="text-xs text-ink-3">{sub}</div>}
    </div>
  )
}

/** A sample of 20 units, scaled from the totals, showing defects (marks) versus defective units (outlined). */
function UnitSample({ u, o, d, dv }: { u: number; o: number; d: number; dv: number }) {
  const N = 20
  const slots = Math.min(o, 8)
  const defShown = Math.min(N, Math.round((dv / u) * N))
  const marksShown = Math.min(defShown * slots, Math.max(defShown, Math.round((d / u) * N)))
  const marks: number[] = Array.from({ length: N }, () => 0)
  for (let m = 0; m < marksShown; m++) marks[m % Math.max(1, defShown)] += 1
  const cols = 5
  const cw = 136, ch = 52
  return (
    <svg viewBox={`0 0 ${cols * cw} ${4 * ch + 8}`} className="h-auto w-full" role="img"
      aria-label={`A scaled sample of 20 units: ${defShown} are defective and they carry ${marksShown} defects across ${slots} opportunity slots each.`}>
      {Array.from({ length: N }, (_, i) => {
        const x = (i % cols) * cw + 6, y = Math.floor(i / cols) * ch + 6
        const bad = i < defShown
        return (
          <g key={i}>
            <motion.rect x={x} y={y} width={cw - 14} height={ch - 12} rx={10} fill="var(--surface)" strokeWidth={bad ? 2 : 1}
              animate={{ stroke: bad ? 'var(--coral)' : 'var(--line-2)' }} transition={{ duration: 0.3 }} />
            {Array.from({ length: slots }, (_, s) => {
              const sw = (cw - 30) / slots
              const hit = s < marks[i]
              return (
                <motion.rect key={s} x={x + 8 + s * sw} y={y + 13} width={Math.max(4, sw - 4)} height={14} rx={3}
                  initial={false} animate={{ fill: hit ? 'var(--coral)' : 'var(--teal-soft)', scale: hit ? 1 : 0.92 }}
                  transition={{ duration: 0.35, delay: hit ? 0.02 * s : 0, ease: EASE }} />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

function SigmaScale({ sigma }: { sigma: number }) {
  const s = Number.isFinite(sigma) ? Math.max(0, Math.min(6.5, sigma)) : sigma > 0 ? 6.5 : 0
  const x = 20 + (s / 6.5) * 680
  return (
    <svg viewBox="0 0 720 74" className="h-auto w-full" role="img" aria-label={`Sigma level marker at ${fmt(sigma, 2)} on a scale from 0 to 6.5`}>
      <rect x={20} y={30} width={680} height={10} rx={5} fill="var(--surface-3)" />
      <motion.rect x={20} y={30} height={10} rx={5} fill="var(--teal)" initial={false} animate={{ width: Math.max(0, x - 20) }} transition={{ duration: 0.7, ease: EASE }} />
      {[0, 1, 2, 3, 4, 5, 6].map(t => (
        <g key={t}>
          <line x1={20 + (t / 6.5) * 680} x2={20 + (t / 6.5) * 680} y1={44} y2={50} stroke="var(--line-2)" />
          <text x={20 + (t / 6.5) * 680} y={66} textAnchor="middle" fontSize={13} fill="var(--ink-2)" fontFamily="var(--font-sans)">{t}</text>
        </g>
      ))}
      <motion.g initial={false} animate={{ x }} transition={{ duration: 0.7, ease: EASE }}>
        <circle cx={0} cy={35} r={9} fill="var(--surface)" stroke="var(--teal)" strokeWidth={3} />
        <text x={0} y={18} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">{fmt(sigma, 2)}</text>
      </motion.g>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Challenge runner                                                    */
/* ------------------------------------------------------------------ */

interface Trap { value: number; tag: MistakeTag; msg: string }
interface NumQ { prompt: ReactNode; answer: number; percent?: boolean; explain: ReactNode; traps: Trap[]; hint: string }

function readAnswer(raw: string, percent?: boolean): number | null {
  const v = parseNumber(raw)
  if (v === null) return null
  if (!percent) return v
  return raw.trim().endsWith('%') || v > 1 ? v / 100 : v
}

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
    const v = readAnswer(raw, q.percent)
    if (v === null) { setRes({ ok: false, msg: 'Enter a number, for example 0.035, 35,000 or 3.5%.' }); return }
    const ok = closeEnough(v, q.answer, 0.01)
    let msg = ok ? 'Correct.' : 'Not quite.'
    if (!ok) {
      const trap = q.traps.find(t => closeEnough(v, t.value, 0.01))
      if (trap) { msg = trap.msg; logMistake(trap.tag) }
      else if (q.percent && closeEnough(v * 100, q.answer, 0.01)) { msg = 'Looks like a percentage slip: check whether you divided by 100 twice.'; logMistake('percent-conversion') }
    }
    setRes({ ok, msg })
    setMarks(m => [...m, ok])
  }
  const next = () => {
    if (i + 1 >= total) {
      const score = Math.round((marks.filter(Boolean).length / total) * 100)
      recordLab(lab, score)
      setDone(true)
    } else { setI(i + 1); setRaw(''); setRes(null) }
  }
  const again = () => { setRound(r => r + 1); setI(0); setRaw(''); setRes(null); setMarks([]); setDone(false) }

  if (done) {
    const right = marks.filter(Boolean).length
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-teal-soft p-5">
        <Trophy className="size-6 text-teal" />
        <div className="flex-1">
          <div className="font-display text-lg font-semibold text-ink">{right} of {total} correct</div>
          <p className="text-sm text-ink-2">{right === total ? 'Clean sweep. You avoided every classic DPMO trap.' : 'Review the feedback on the questions you missed, then try a fresh set.'}</p>
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
          {Array.from({ length: total }, (_, k) => (
            <span key={k} className={`h-1.5 flex-1 rounded-full ${k < marks.length ? (marks[k] ? 'bg-good' : 'bg-bad') : k === i ? 'bg-violet' : 'bg-surface-3'}`} />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-line p-4 leading-relaxed text-ink">{q.prompt}</div>
      <form className="flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); if (!res) submit() }}>
        <div className="min-w-0 flex-1">
          <label className="label" htmlFor="dpmo-ans">Your answer</label>
          <input id="dpmo-ans" className="field tabular" value={raw} onChange={e => setRaw(e.target.value)} disabled={!!res} placeholder={q.hint} autoComplete="off" />
        </div>
        {!res ? <button className="btn btn-primary" type="submit" disabled={!raw.trim()}>Check</button>
          : <button className="btn btn-primary" type="button" onClick={next}>{i + 1 >= total ? 'See score' : 'Next question'} <ArrowRight className="size-4" /></button>}
      </form>
      {res && <Feedback ok={res.ok}><div className="font-semibold">{res.msg}</div><div className="mt-1 text-ink-2">{q.explain}</div></Feedback>}
    </div>
  )
}

type Ask = 'dpu' | 'dpo' | 'dpmo' | 'prop'

function makeQuestion(kind: Ask): NumQ {
  const s = randomScenario()
  const U = s.units0, O = s.opps, D = s.defects, DV = s.defectives
  const stem = (
    <>
      <p>{s.text} The team inspected <strong>{fmt(U)}</strong> {s.units}. Each {s.unit} has <strong>{O}</strong> {s.opp}. They found <strong>{fmt(D)}</strong> defects in total, spread across <strong>{fmt(DV)}</strong> defective {s.units}.</p>
    </>
  )
  const vDpu = dpu(D, U), vDpo = dpo(D, U, O), vDpmo = dpmo(D, U, O), vProp = proportionDefective(DV, U)
  if (kind === 'dpu') return {
    prompt: <>{stem}<p className="mt-2 font-semibold">What is the DPU (defects per unit)?</p></>,
    answer: vDpu, hint: 'e.g. 0.125',
    explain: <Tex tex={`\\text{DPU} = \\frac{${tx(D)}}{${tx(U)}} = ${tx(vDpu)}`} />,
    traps: [
      { value: DV / U, tag: 'defects-vs-defectives', msg: 'You used defective units. DPU counts every defect, so the numerator is total defects.' },
      { value: vDpo, tag: 'dpu-vs-dpmo', msg: 'That is DPO: you divided by opportunities as well. DPU only divides by units.' },
    ],
  }
  if (kind === 'dpo') return {
    prompt: <>{stem}<p className="mt-2 font-semibold">What is the DPO (defects per opportunity)? Give at least three significant figures.</p></>,
    answer: vDpo, hint: 'e.g. 0.0213',
    explain: <Tex tex={`\\text{DPO} = \\frac{${tx(D)}}{${tx(U)} \\times ${O}} = \\frac{${tx(D)}}{${tx(U * O)}} = ${tx(vDpo, 6)}`} />,
    traps: [
      { value: vDpu, tag: 'missing-opportunities', msg: 'That is DPU. You forgot to multiply units by opportunities per unit in the denominator.' },
      { value: vDpmo, tag: 'missing-million', msg: 'That is DPMO. The question asks for defects per opportunity, before multiplying by 1,000,000.' },
      { value: DV / (U * O), tag: 'defects-vs-defectives', msg: 'You used defective units. DPO counts defects, not defective units.' },
    ],
  }
  if (kind === 'dpmo') return {
    prompt: <>{stem}<p className="mt-2 font-semibold">What is the DPMO?</p></>,
    answer: vDpmo, hint: 'e.g. 21,300',
    explain: <Tex tex={`\\text{DPMO} = \\frac{${tx(D)}}{${tx(U)} \\times ${O}} \\times 1{,}000{,}000 = ${tx(vDpmo, 1)}`} />,
    traps: [
      { value: vDpu * MILLION, tag: 'missing-opportunities', msg: `You forgot the opportunities. Your answer is ${O} times too large.` },
      { value: vDpo, tag: 'missing-million', msg: 'That is DPO, a tiny decimal. Multiply by 1,000,000 to express it per million opportunities.' },
      { value: dpmo(DV, U, O), tag: 'defects-vs-defectives', msg: 'You used defective units in the numerator. DPMO counts total defects.' },
      { value: vDpu, tag: 'dpu-vs-dpmo', msg: 'That is DPU. DPMO divides by opportunities and scales to one million.' },
    ],
  }
  return {
    prompt: <>{stem}<p className="mt-2 font-semibold">What proportion of {s.units} were defective? Answer as a percentage or a decimal.</p></>,
    answer: vProp, percent: true, hint: 'e.g. 8.4%',
    explain: <Tex tex={`p = \\frac{${tx(DV)}}{${tx(U)}} = ${tx(vProp)} = ${tx(vProp * 100, 2)}\\%`} />,
    traps: [{ value: D / U, tag: 'defects-vs-defectives', msg: 'You used total defects. Proportion defective counts units with at least one defect.' }],
  }
}

function makeSet(i: number): NumQ {
  const order: Ask[] = ['dpu', 'dpmo', 'prop', 'dpo', 'dpmo']
  return makeQuestion(order[i % order.length])
}

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function DpmoLab({ embedded }: LabProps) {
  const [sc, setSc] = useState<Scenario>(DEFAULT)
  const [u, setU] = useState(DEFAULT.units0)
  const [o, setO] = useState(DEFAULT.opps)
  const [d, setD] = useState(DEFAULT.defects)
  const [dv, setDv] = useState(DEFAULT.defectives)

  const load = (s: Scenario) => { setSc(s); setU(s.units0); setO(s.opps); setD(s.defects); setDv(s.defectives) }
  const errors = validate(u, o, d, dv)
  const ok = errors.length === 0

  const m = ok ? (() => {
    const vDpu = dpu(d, u), vDpo = dpo(d, u, o), vDpmo = dpmo(d, u, o), vProp = proportionDefective(dv, u)
    return { vDpu, vDpo, vDpmo, vProp, sigma: sigmaFromDpmo(vDpmo), noOpp: vDpu * MILLION, noMillion: vDpo, wrongNumerator: dpmo(dv, u, o) }
  })() : null

  const explore = (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <NumberField id="dpmo-u" label={`Units (${sc.units})`} value={u} onChange={setU} min={1} />
          <NumberField id="dpmo-o" label="Opportunities per unit" value={o} onChange={setO} min={1} />
          <NumberField id="dpmo-d" label="Total defects" value={d} onChange={setD} />
          <NumberField id="dpmo-dv" label="Defective units" value={dv} onChange={setDv} />
        </div>
        <AnimatePresence initial={false}>
          {errors.length > 0 && (
            <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-1.5 rounded-xl bg-amber-soft p-3 text-sm text-ink" role="alert">
              {errors.map(e => <li key={e} className="flex gap-2"><TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber" />{e}</li>)}
            </motion.ul>
          )}
        </AnimatePresence>
        <div className="rounded-2xl border border-line p-4 text-sm leading-relaxed text-ink-2">
          <p><strong className="text-ink">Defect</strong>: one thing wrong. One {sc.unit} can carry several.</p>
          <p className="mt-1.5"><strong className="text-ink">Defective unit</strong>: a {sc.unit} with at least one defect.</p>
          <p className="mt-1.5"><strong className="text-ink">Opportunity</strong>: a characteristic that can fail and matters to the customer. Padding this number makes DPMO look better without any real improvement.</p>
        </div>
      </div>

      <div className="min-w-0 space-y-5">
        <div>
          <div className="flex flex-wrap items-stretch gap-2">
            <Stage label="Units (U)" value={fmt(u)} tone="ink" />
            <ArrowRight className="hidden size-4 self-center text-ink-3 sm:block" aria-hidden />
            <Stage label="Opportunities (U x O)" value={u > 0 && o > 0 ? fmt(u * o) : '-'} sub={`${fmt(o)} per unit`} tone="violet" />
            <ArrowRight className="hidden size-4 self-center text-ink-3 sm:block" aria-hidden />
            <Stage label="Defects (D)" value={fmt(d)} sub={`in ${fmt(dv)} defective units`} tone="coral" />
          </div>
          <div className="mt-3 rounded-2xl border border-line p-3">
            <div className="mb-1 text-xs font-semibold text-ink-3">A scaled sample of 20 {sc.units}: outlined cards are defective, filled slots are defects</div>
            {ok ? <UnitSample u={u} o={o} d={d} dv={dv} /> : <p className="py-6 text-center text-sm text-ink-3">Fix the inputs to see the sample.</p>}
          </div>
        </div>

        {m && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stage label="DPU" value={fmt(m.vDpu, 4)} sub="defects per unit" tone="teal" />
              <Stage label="DPO" value={fmt(m.vDpo, 6)} sub="defects per opportunity" tone="teal" />
              <Stage label="DPMO" value={fmt(m.vDpmo, 0)} sub="per million opportunities" tone="teal" />
              <Stage label="Proportion defective" value={pct(m.vProp)} sub="defective units / units" tone="coral" />
            </div>

            <div className="space-y-1 rounded-2xl bg-surface-2/60 p-4 text-ink">
              <Tex block tex={`\\text{DPU} = \\frac{D}{U} = \\frac{${tx(d)}}{${tx(u)}} = ${tx(m.vDpu)}`} />
              <Tex block tex={`\\text{DPO} = \\frac{D}{U \\times O} = \\frac{${tx(d)}}{${tx(u)} \\times ${tx(o)}} = \\frac{${tx(d)}}{${tx(u * o)}} = ${tx(m.vDpo, 6)}`} />
              <Tex block tex={`\\text{DPMO} = \\text{DPO} \\times 1{,}000{,}000 = ${tx(m.vDpmo, 1)}`} />
              <Tex block tex={`p_{\\text{defective}} = \\frac{\\text{defective units}}{U} = \\frac{${tx(dv)}}{${tx(u)}} = ${tx(m.vProp * 100, 2)}\\%`} />
            </div>

            <div className="rounded-2xl border border-line p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-ink">Sigma level {fmt(m.sigma, 2)}</h3>
                <span className="text-xs text-ink-3">Short-term, using the conventional 1.5 sigma shift</span>
              </div>
              <SigmaScale sigma={m.sigma} />
              <p className="text-sm leading-relaxed text-ink-2">
                {fmt(m.vDpmo, 0)} defects per million opportunities. A six sigma process allows only 3.4. Each step up the scale needs a much larger cut in DPMO than the one before.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-display text-lg font-semibold text-ink">Common mistakes, live</h3>
              <div className="grid gap-2 md:grid-cols-3">
                {[
                  { t: 'If you forgot opportunities', v: fmt(m.noOpp, 0), why: `D / U x 1,000,000. ${o > 1 ? `${o} times too large.` : 'Same here only because O = 1.'}` },
                  { t: 'If you forgot x 1,000,000', v: fmt(m.noMillion, 6), why: 'That is DPO, a tiny decimal, not DPMO.' },
                  { t: 'If you used defective units', v: fmt(m.wrongNumerator, 0), why: d === dv ? 'Same here only because each defective unit has one defect.' : 'Undercounts units that carry several defects.' },
                ].map(c => (
                  <div key={c.t} className="rounded-xl border border-dashed border-bad/40 bg-bad-soft/40 p-3">
                    <div className="text-xs font-semibold text-ink-2">{c.t}</div>
                    <div className="tabular font-display text-lg font-semibold text-bad line-through decoration-2">{c.v}</div>
                    <div className="text-xs text-ink-2">{c.why}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  const check = (
    <KnowledgeCheck lab="dpmo" items={[
      { q: 'An inspector finds 3 defects on one invoice. How many defective units is that?', options: ['3', '1', '0', 'It depends on the number of opportunities'], answer: 1, why: 'A unit is defective if it has at least one defect, so one invoice with three defects is one defective unit and three defects.' },
      { q: 'A learner calculates DPMO and gets 0.0214. What most likely went wrong?', options: ['They forgot the opportunities', 'They forgot to multiply by 1,000,000', 'They used defective units', 'Nothing, DPMO is always below 1'], answer: 1, why: 'A tiny decimal is DPO. DPMO multiplies DPO by 1,000,000, giving 21,400.' },
      { q: 'Why can adding fields that never fail to the opportunity count be misleading?', options: ['It raises DPU', 'It makes DPMO look better without any real improvement', 'It changes the number of defective units', 'It has no effect'], answer: 1, why: 'More opportunities in the denominator lower DPMO even though the same defects reach the customer. Count only characteristics that can fail and matter to the customer.' },
      { q: 'Which measure uses defective units rather than total defects?', options: ['DPU', 'DPO', 'DPMO', 'Proportion defective'], answer: 3, why: 'DPU, DPO and DPMO all count defects. Proportion defective counts units with one or more defects.' },
    ]} />
  )

  return (
    <LabShell
      lab="dpmo"
      embedded={embedded}
      instructions="Change the four counts on the left. The pipeline, the 20-unit sample, every formula and the sigma level update from your numbers. Watch the common mistakes panel to see how far off each classic slip would put you."
      scenario={<>{sc.text} Each {sc.unit} has {fmt(o)} {sc.opp.split(' (')[0]}.</>}
      onReset={() => load(DEFAULT)}
      onNewExample={() => load(randomScenario())}
      explore={explore}
      challenge={
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-2">Five randomised problems. Answers within 1% count, so round sensibly. The feedback recognises the classic mistakes: forgetting opportunities, forgetting the million and counting defectives instead of defects.</p>
          <Runner lab="dpmo" make={makeSet} />
        </div>
      }
      check={check}
    />
  )
}

