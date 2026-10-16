import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, ArrowLeft, BookOpen, CheckCircle2, CircleX, Lightbulb, Play, RotateCcw, Shuffle, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Tex } from '../components/Math'
import { Rich } from '../components/Rich'
import { DifficultyBadge, Segmented } from '../components/ui'
import { lessonMeta } from '../data/curriculum'
import { formulaDef } from '../data/formulas'
import type { Difficulty } from '../data/types'
import { checkAnswer, generateProblem, type CheckResult, type Problem } from '../lib/problems'
import { recordFormula, useProfile } from '../lib/store'
import { useDur } from '../lib/motion'
import { NotFound } from './NotFound'

const LEVELS: { value: Difficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'trap', label: 'Exam Trap' },
  { value: 'master', label: 'Master' },
]

export default function FormulaScreen() {
  const { id } = useParams()
  const f = formulaDef(id ?? '')
  if (!f) return <NotFound />
  return <Screen key={f.id} id={f.id} />
}

function Screen({ id }: { id: string }) {
  const f = formulaDef(id)!
  const stats = useProfile(p => p.formulas[f.id])
  const [level, setLevel] = useState<Difficulty>('beginner')
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9))
  const problem = useMemo(() => generateProblem(f.id, level, seed), [f.id, level, seed])
  const [subStep, setSubStep] = useState(0)
  const dur = useDur()

  // Animated substitution of the worked example.
  useEffect(() => {
    setSubStep(0)
  }, [id])
  useEffect(() => {
    if (subStep === 0 || subStep > f.example.substitution.length) return
    const t = window.setTimeout(() => setSubStep(s => s + 1), Math.max(10, dur(1.3) * 1000))
    return () => window.clearTimeout(t)
  }, [subStep, f.example.substitution.length, dur])

  return (
    <div>
      <Link to="/formulas" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-3 hover:text-ink"><ArrowLeft className="size-4" /> Formula Master</Link>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{f.short}</span>
            {f.supplementary && <span className="chip border-amber/40 bg-amber-soft text-amber"><Sparkles className="size-3.5" /> Supplementary</span>}
            {stats && <span className="chip">{stats.correct}/{stats.attempts} correct · streak {stats.streak}</span>}
          </div>
          <h1 className="mt-3 text-3xl font-bold text-ink md:text-4xl">{f.name}</h1>
        </div>
        <Link to={`/lessons/${f.lesson}`} className="btn btn-soft"><BookOpen className="size-4" /> Lesson {f.lesson}: {lessonMeta(f.lesson).short}</Link>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* Formula card */}
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-md">
          <p className="text-[1.02rem] leading-relaxed text-ink-2">{f.definition}</p>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="my-6 overflow-x-auto rounded-2xl bg-gradient-to-br from-violet-soft to-surface-2 px-4 py-6 text-center text-2xl text-ink">
            <Tex tex={f.tex} block />
          </motion.div>
          <h2 className="font-display text-lg font-semibold text-ink">What each variable means</h2>
          <dl className="mt-2 divide-y divide-line">
            {f.variables.map(v => (
              <div key={v.sym} className="flex gap-4 py-2.5 text-sm">
                <dt className="w-28 shrink-0 font-mono font-semibold text-violet">{v.sym}</dt>
                <dd className="leading-relaxed text-ink-2">{v.meaning}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed"><div className="mb-1 font-semibold text-ink">When to use it</div><span className="text-ink-2">{f.when}</span></div>
            <div className="rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed"><div className="mb-1 font-semibold text-ink">Units</div><span className="text-ink-2">{f.units}</span></div>
            <div className="rounded-2xl bg-sky-soft p-4 text-sm leading-relaxed sm:col-span-2"><div className="mb-1 font-semibold text-ink">The denominator</div><span className="text-ink-2">{f.denominator}</span></div>
          </div>
        </section>

        {/* Worked example with animated substitution */}
        <section className="flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink">Worked example</h2>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-2">{f.example.scenario}</p>
          <ol className="mt-4 space-y-2">
            <AnimatePresence>
              {f.example.substitution.slice(0, Math.max(0, subStep)).map((s, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 rounded-xl bg-surface-2 px-3 py-2.5 font-mono text-sm text-ink">
                  <span className="tabular grid size-6 shrink-0 place-items-center rounded-md bg-violet-soft text-xs font-bold text-violet">{i + 1}</span>{s}
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {subStep > f.example.substitution.length && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 rounded-xl border border-good/40 bg-good-soft px-4 py-3 font-display text-lg font-semibold text-ink">{f.example.result}</motion.div>
          )}
          <div className="mt-4 flex gap-2">
            {subStep === 0 ? (
              <button className="btn btn-primary btn-sm" onClick={() => setSubStep(1)}><Play className="size-4" /> Animate the substitution</button>
            ) : (
              <button className="btn btn-soft btn-sm" onClick={() => setSubStep(1)}><RotateCcw className="size-4" /> Replay</button>
            )}
            {subStep > 0 && subStep <= f.example.substitution.length && <button className="btn btn-ghost btn-sm" onClick={() => setSubStep(f.example.substitution.length + 1)}>Skip to result</button>}
          </div>
          <div className="mt-auto pt-5">
            <div className="rounded-2xl border border-coral/30 bg-coral-soft/60 p-4 text-sm leading-relaxed">
              <div className="mb-1 flex items-center gap-2 font-semibold text-coral"><AlertTriangle className="size-4" /> Common exam trap</div>
              <span className="text-ink">{f.trap}</span>
            </div>
            <div className="mt-3 rounded-2xl border border-line p-4 text-sm leading-relaxed">
              <div className="mb-1 font-semibold text-ink">Incorrect calculation</div>
              <div className="font-mono text-bad line-through decoration-2">{f.wrong.work}</div>
              <div className="mt-1 text-ink-2"><span className="font-semibold text-ink">Why it is wrong: </span>{f.wrong.why}</div>
            </div>
          </div>
        </section>
      </div>

      {/* Practice */}
      <section className="mt-8 rounded-3xl border border-line bg-surface p-5 shadow-md sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Practise with fresh numbers</h2>
          <Segmented label="Difficulty" value={level} onChange={v => { setLevel(v); setSeed(Math.floor(Math.random() * 1e9)) }} options={LEVELS} size="sm" />
        </div>
        <PracticeProblem key={problem.id} problem={problem} onNext={() => setSeed(Math.floor(Math.random() * 1e9))} />
      </section>
    </div>
  )
}

export function PracticeProblem({ problem, onNext }: { problem: Problem; onNext: () => void }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [hints, setHints] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const submit = () => {
    const r = checkAnswer(problem, input)
    setResult(r)
    if (r.kind === 'invalid') return
    if (!attempted) {
      setAttempted(true)
      recordFormula(problem.formula, problem.difficulty, r.kind === 'correct', r.kind === 'mistake' ? r.mistake.tag : undefined)
    }
    if (r.kind === 'correct') setShowSolution(true)
  }

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="mb-2"><DifficultyBadge d={problem.difficulty} /></div>
        <p className="text-[1.02rem] leading-relaxed text-ink">{problem.context}</p>
        {problem.table && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-line">
            <table className="tabular w-full min-w-[320px] text-sm">
              <thead><tr className="bg-surface-2">{problem.table.head.map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-ink">{h}</th>)}</tr></thead>
              <tbody>{problem.table.rows.map((r, i) => <tr key={i} className="border-t border-line">{r.map((c, j) => <td key={j} className="px-3 py-2 text-ink-2">{typeof c === 'number' ? c.toLocaleString('en-US') : c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
        <p className="mt-3 font-semibold text-ink">{problem.question}</p>
        <form className="mt-3 flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); submit() }}>
          <div className="min-w-[12rem] flex-1">
            <label className="label" htmlFor="answer">Your answer{problem.unit ? ` (${problem.unit})` : ''}</label>
            <input id="answer" className="field tabular text-lg" inputMode="decimal" autoComplete="off" value={input} onChange={e => setInput(e.target.value)} placeholder={problem.percent ? 'e.g. 91.5 or 91.5%' : 'Type a number'} />
          </div>
          <button className="btn btn-primary h-[2.9rem]" type="submit" disabled={!input.trim()}>Check</button>
        </form>
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`mt-3 flex gap-2 rounded-xl px-3 py-3 text-sm leading-relaxed ${result.kind === 'correct' ? 'bg-good-soft' : result.kind === 'invalid' ? 'bg-amber-soft' : 'bg-bad-soft'}`} role="status">
              {result.kind === 'correct' ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-good" /> : <CircleX className="mt-0.5 size-4 shrink-0 text-bad" />}
              <div className="text-ink">
                {result.kind === 'correct' && <><strong>Correct.</strong> {result.note ?? `The answer is ${problem.expected.toLocaleString('en-US', { maximumFractionDigits: problem.decimals })}${problem.percent ? '%' : ''}.`}</>}
                {result.kind === 'mistake' && <><strong>Common mistake detected.</strong> {result.mistake.message} Try again or take a hint.</>}
                {result.kind === 'wrong' && <><strong>Not quite.</strong> Check the rounding asked for, or take a hint.</>}
                {result.kind === 'invalid' && <>Enter a number, for example <code className="inline-code">0.0045</code>, <code className="inline-code">12,500</code> or <code className="inline-code">91.5%</code>.</>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-soft btn-sm" onClick={() => setHints(h => Math.min(problem.hints.length, h + 1))} disabled={hints >= problem.hints.length}><Lightbulb className="size-4" /> {hints === 0 ? 'Hint' : `Hint ${hints + 1} of ${problem.hints.length}`}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setShowSolution(true); if (!attempted) { setAttempted(true); recordFormula(problem.formula, problem.difficulty, false) } }}>Show solution</button>
          <button className="btn btn-primary btn-sm ml-auto" onClick={onNext}><Shuffle className="size-4" /> New problem</button>
        </div>
        {hints > 0 && (
          <ul className="mt-3 space-y-1.5">
            {problem.hints.slice(0, hints).map((h, i) => <li key={i} className="rounded-lg bg-amber-soft/70 px-3 py-2 text-sm text-ink"><Rich text={h} /></li>)}
          </ul>
        )}
      </div>
      <div className={`rounded-2xl border border-line p-4 transition-opacity ${showSolution ? '' : 'opacity-60'}`}>
        <div className="font-display font-semibold text-ink">Step-by-step solution</div>
        {showSolution ? (
          <ol className="mt-3 space-y-2">
            {problem.solution.map((s, i) => (
              <motion.li key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} className="flex gap-2.5 text-sm leading-relaxed text-ink">
                <span className="tabular grid size-5 shrink-0 place-items-center rounded bg-violet-soft text-[11px] font-bold text-violet">{i + 1}</span><span><Rich text={s} /></span>
              </motion.li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-ink-3">Solve it first. The full solution appears when you answer correctly or choose Show solution.</p>
        )}
      </div>
    </div>
  )
}
