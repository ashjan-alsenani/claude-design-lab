import { motion } from 'motion/react'
import { ArrowRight, Play, Plus, RotateCcw, Trash, Trophy } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { LabKey, MistakeTag } from '../data/types'
import { Tex } from '../components/Math'
import { recordLab, update } from '../lib/store'
import { useDur, useReduced } from '../lib/motion'
import { closeEnough, finalYield, fmt, fty, parseNumber, pct, rty } from '../lib/metrics'
import { Feedback, KnowledgeCheck, LabShell, Slider } from './kit'
import type { LabProps } from './registry'

const EASE = [0.23, 1, 0.32, 1] as const
const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const tx = (n: number, d = 4) => fmt(n, d).replace(/,/g, '{,}')

function logMistake(tag: MistakeTag) {
  update(p => {
    p.mistakes.push({ at: Date.now(), tag })
    if (p.mistakes.length > 600) p.mistakes.splice(0, p.mistakes.length - 600)
  })
}

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

interface Step { id: string; name: string; fty: number; rework: number }

const NAMES = ['Order entry', 'Credit check', 'Provisioning', 'Activation', 'Welcome call', 'Number port', 'Address check', 'Billing setup']
let sid = 0
const mk = (name: string, f: number, r: number): Step => ({ id: `s${++sid}`, name, fty: f, rework: r })
const DEFAULT_STEPS = () => [mk('Order entry', 0.97, 0.8), mk('Credit check', 0.93, 0.6), mk('Provisioning', 0.89, 0.7), mk('Activation', 0.98, 0.5)]

function randomSteps(): Step[] {
  const n = ri(3, 5)
  const pool = [...NAMES].sort(() => Math.random() - 0.5)
  return Array.from({ length: n }, (_, i) => mk(pool[i], ri(80, 99) / 100, ri(3, 9) / 10))
}

interface Fate { failAt: boolean[]; scrapAt: number | null }
interface Run { fates: Fate[]; steps: Step[] }
const N_UNITS = 100

function simulate(steps: Step[]): Run {
  const fates: Fate[] = Array.from({ length: N_UNITS }, () => {
    const failAt: boolean[] = []
    let scrapAt: number | null = null
    for (let k = 0; k < steps.length; k++) {
      if (scrapAt !== null) { failAt.push(false); continue }
      const fail = Math.random() > steps[k].fty
      failAt.push(fail)
      if (fail && Math.random() > steps[k].rework) scrapAt = k
    }
    return { failAt, scrapAt }
  })
  return { fates, steps: steps.map(s => ({ ...s })) }
}

function stats(run: Run) {
  return run.steps.map((s, k) => {
    const entered = run.fates.filter(f => f.scrapAt === null || f.scrapAt >= k).length
    const failed = run.fates.filter(f => (f.scrapAt === null || f.scrapAt >= k) && f.failAt[k]).length
    const scrapped = run.fates.filter(f => f.scrapAt === k).length
    const reworked = failed - scrapped
    return {
      name: s.name, entered, reworked, scrapped, passed: entered - failed,
      fty: entered > 0 ? fty(entered, scrapped, reworked) : 0,
      final: entered > 0 ? finalYield(entered, scrapped) : 0,
    }
  })
}

/* ------------------------------------------------------------------ */
/* Animated line                                                       */
/* ------------------------------------------------------------------ */

function Line({ steps: live, run, phase }: { steps: Step[]; run: Run | null; phase: number }) {
  const steps = run?.steps ?? live
  const n = steps.length
  const cols = n + 2
  const W = 720, cw = W / cols
  const colX = (c: number) => c * cw + cw / 2
  const gridY = 66, sp = Math.min(7.2, (cw - 18) / 10)
  const dotR = Math.max(2, sp * 0.36)
  const final = 3 * n + 1

  const binIndex = useMemo(() => {
    const m = new Map<number, number>()
    if (!run) return m
    const count: number[] = Array.from({ length: n }, () => 0)
    run.fates.forEach((f, u) => { if (f.scrapAt !== null) { m.set(u, count[f.scrapAt]); count[f.scrapAt] += 1 } })
    return m
  }, [run, n])

  const place = (u: number, f: Fate) => {
    const gx = (u % 10 - 4.5) * sp, gy = Math.floor(u / 10) * sp
    let col = 0, sub = 0, k = -1
    if (phase >= final) { col = n + 1 } else if (phase > 0) { k = Math.floor((phase - 1) / 3); sub = (phase - 1) % 3; col = k + 1 }
    const scrapSeen = f.scrapAt !== null && (phase >= final || k > f.scrapAt || (k === f.scrapAt && sub === 2))
    const reworkedSeen = f.failAt.some((x, j) => x && j !== f.scrapAt && (j < k || (j === k && sub === 2) || phase >= final))
    const failingNow = k >= 0 && sub === 1 && f.failAt[k]
    const cleanSoFar = !f.failAt.some((x, j) => x && (j < k || (j === k && sub >= 1) || phase >= final))
    const inspected = phase >= final || (k >= 0 && (sub >= 1 || k > 0))
    if (scrapSeen) {
      const b = binIndex.get(u) ?? 0
      return { x: colX((f.scrapAt ?? 0) + 1) + (b % 10 - 4.5) * sp, y: 196 + Math.floor(b / 10) * sp, fill: 'var(--coral)', o: 0.45 }
    }
    const fill = failingNow ? 'var(--coral)' : reworkedSeen ? 'var(--amber)' : inspected && cleanSoFar ? 'var(--good)' : 'var(--ink-3)'
    return { x: colX(col) + gx, y: gridY + gy, fill, o: 1 }
  }

  const label = run
    ? `Process line with ${n} steps. ${phase >= final ? 'Run complete.' : `Animation phase ${phase} of ${final}.`}`
    : 'Process line, not yet run.'

  return (
    <svg viewBox={`0 0 ${W} 236`} className="h-auto w-full" role="img" aria-label={label}>
      {Array.from({ length: cols }, (_, c) => {
        const isStep = c > 0 && c <= n
        const title = c === 0 ? 'Start' : c === n + 1 ? 'Done' : steps[c - 1].name
        return (
          <g key={c}>
            <rect x={c * cw + 5} y={42} width={cw - 10} height={sp * 10 + 34} rx={12} fill={isStep ? 'var(--surface-2)' : 'none'} stroke="var(--line)" strokeDasharray={isStep ? undefined : '4 4'} />
            <text x={colX(c)} y={20} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--ink)" fontFamily="var(--font-sans)">{title.length > 13 ? `${title.slice(0, 12)}.` : title}</text>
            {isStep && <text x={colX(c)} y={35} textAnchor="middle" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">FTY {fmt(steps[c - 1].fty * 100, 0)}%</text>}
            {isStep && <rect x={c * cw + 8} y={186} width={cw - 16} height={42} rx={8} fill="var(--coral-soft)" opacity={0.6} />}
            {isStep && <text x={colX(c)} y={182} textAnchor="middle" fontSize={12} fill="var(--coral)" fontFamily="var(--font-sans)">scrap</text>}
            {c < cols - 1 && <path d={`M ${(c + 1) * cw - 4} ${gridY + sp * 4.5} l 8 0`} stroke="var(--ink-3)" strokeWidth={1.5} />}
          </g>
        )
      })}
      {run?.fates.map((f, u) => {
        const p = place(u, f)
        return (
          <motion.circle key={u} r={dotR} initial={false}
            animate={{ cx: p.x, cy: p.y, fill: p.fill, opacity: p.o }}
            transition={{ duration: 0.55, ease: EASE, delay: (u % 10) * 0.012 }} />
        )
      })}
      {!run && <text x={W / 2} y={140} textAnchor="middle" fontSize={14} fill="var(--ink-3)" fontFamily="var(--font-sans)">Press Run 100 units to send work through the line</text>}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Challenge runner                                                    */
/* ------------------------------------------------------------------ */

interface Trap { value: number; tag: MistakeTag; msg: string }
type Q = { prompt: ReactNode; explain: ReactNode } & (
  | { kind: 'num'; answer: number; percent?: boolean; traps: Trap[]; hint: string }
  | { kind: 'choice'; options: string[]; correct: number; tag?: MistakeTag }
)

function readAnswer(raw: string, percent?: boolean): number | null {
  const v = parseNumber(raw)
  if (v === null) return null
  if (!percent) return v
  return raw.trim().endsWith('%') || v > 1 ? v / 100 : v
}

function Runner({ lab, make, total = 5, intro }: { lab: LabKey; make: (i: number) => Q; total?: number; intro: ReactNode }) {
  const [round, setRound] = useState(0)
  const qs = useMemo(() => Array.from({ length: total }, (_, i) => make(i)), [round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [raw, setRaw] = useState('')
  const [picked, setPicked] = useState<number | null>(null)
  const [res, setRes] = useState<{ ok: boolean; msg: string } | null>(null)
  const [marks, setMarks] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const q = qs[i]

  const finish = (ok: boolean, msg: string) => { setRes({ ok, msg }); setMarks(m => [...m, ok]) }
  const submitNum = () => {
    if (q.kind !== 'num') return
    const v = readAnswer(raw, q.percent)
    if (v === null) { setRes({ ok: false, msg: 'Enter a number such as 0.82 or 82%.' }); return }
    const ok = closeEnough(v, q.answer, 0.005, 0.0015)
    let msg = ok ? 'Correct.' : 'Not quite.'
    if (!ok) { const t = q.traps.find(t => closeEnough(v, t.value, 0.005, 0.0015)); if (t) { msg = t.msg; logMistake(t.tag) } }
    finish(ok, msg)
  }
  const choose = (j: number) => {
    if (q.kind !== 'choice' || res) return
    setPicked(j)
    const ok = j === q.correct
    if (!ok && q.tag) logMistake(q.tag)
    finish(ok, ok ? 'Correct.' : 'Not the best choice.')
  }
  const next = () => {
    if (i + 1 >= total) { recordLab(lab, Math.round((marks.filter(Boolean).length / total) * 100)); setDone(true) }
    else { setI(i + 1); setRaw(''); setRes(null); setPicked(null) }
  }
  const again = () => { setRound(r => r + 1); setI(0); setRaw(''); setRes(null); setPicked(null); setMarks([]); setDone(false) }

  if (done) {
    const right = marks.filter(Boolean).length
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-teal-soft p-5">
        <Trophy className="size-6 text-teal" />
        <div className="flex-1">
          <div className="font-display text-lg font-semibold text-ink">{right} of {total} correct</div>
          <p className="text-sm text-ink-2">{right === total ? 'Every yield handled correctly: product of first time yields, nothing else.' : 'Look back at the explanations, then try a fresh set of numbers.'}</p>
        </div>
        <button className="btn btn-primary" onClick={again}><RotateCcw className="size-4" /> New challenge</button>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-2">{intro}</p>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-ink-2">Question {i + 1} of {total}</span>
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k < marks.length ? (marks[k] ? 'bg-good' : 'bg-bad') : k === i ? 'bg-violet' : 'bg-surface-3'}`} />)}
        </div>
      </div>
      <div className="rounded-2xl border border-line p-4 leading-relaxed text-ink">{q.prompt}</div>
      {q.kind === 'num' ? (
        <form className="flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); if (!res) submitNum() }}>
          <div className="min-w-0 flex-1">
            <label className="label" htmlFor="rty-ans">Your answer</label>
            <input id="rty-ans" className="field tabular" value={raw} onChange={e => setRaw(e.target.value)} disabled={!!res} placeholder={q.hint} autoComplete="off" />
          </div>
          {!res ? <button className="btn btn-primary" type="submit" disabled={!raw.trim()}>Check</button>
            : <button className="btn btn-primary" type="button" onClick={next}>{i + 1 >= total ? 'See score' : 'Next question'} <ArrowRight className="size-4" /></button>}
        </form>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((o, j) => (
              <button key={j} disabled={!!res} onClick={() => choose(j)}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${res && j === q.correct ? 'border-good bg-good-soft' : res && j === picked ? 'border-bad bg-bad-soft' : 'border-line hover:border-violet hover:bg-violet-soft/40'} disabled:cursor-default`}>{o}</button>
            ))}
          </div>
          {res && <button className="btn btn-primary" onClick={next}>{i + 1 >= total ? 'See score' : 'Next question'} <ArrowRight className="size-4" /></button>}
        </div>
      )}
      {res && <Feedback ok={res.ok}><div className="font-semibold">{res.msg}</div><div className="mt-1 text-ink-2">{q.explain}</div></Feedback>}
    </div>
  )
}

const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length

function makeQ(i: number): Q {
  const kind = ['rty', 'fty', 'improve', 'rty', 'improve'][i % 5]
  if (kind === 'rty') {
    const n = ri(3, 5)
    const ys = Array.from({ length: n }, () => ri(82, 99) / 100)
    const names = [...NAMES].sort(() => Math.random() - 0.5).slice(0, n)
    const ans = rty(ys)
    return {
      kind: 'num', percent: true, answer: ans, hint: 'e.g. 76.4%',
      prompt: <>Northwind Fibre provisions a new connection in {n} steps with these first time yields: {names.map((nm, k) => <span key={nm}>{k > 0 && ', '}<strong>{nm} {fmt(ys[k] * 100, 0)}%</strong></span>)}. What is the rolled throughput yield?</>,
      explain: <Tex tex={`RTY = ${ys.map(y => tx(y, 2)).join(' \\times ')} = ${tx(ans, 4)} = ${tx(ans * 100, 2)}\\%`} />,
      traps: [
        { value: avg(ys), tag: 'rty-added-or-averaged', msg: 'You averaged the yields. Losses compound from step to step, so RTY multiplies them.' },
        { value: 1 - ys.reduce((s, y) => s + (1 - y), 0), tag: 'rty-added-or-averaged', msg: 'You subtracted the summed losses from 100%. That ignores how each step only receives what the previous one passed. Multiply instead.' },
        { value: Math.min(...ys), tag: 'rty-added-or-averaged', msg: 'That is the weakest step alone. Every step loses some units, so RTY is lower than the minimum.' },
      ],
    }
  }
  if (kind === 'fty') {
    const entered = ri(12, 40) * 10
    const rw = ri(Math.round(entered * 0.04), Math.round(entered * 0.15))
    const sc = ri(2, Math.round(entered * 0.05))
    const ans = fty(entered, sc, rw)
    return {
      kind: 'num', percent: true, answer: ans, hint: 'e.g. 88.5%',
      prompt: <>A tier-1 support queue received <strong>{entered}</strong> tickets. <strong>{rw}</strong> had to be reopened and reworked before they were resolved, and <strong>{sc}</strong> were abandoned as unresolvable. What is the first time yield of this step?</>,
      explain: <Tex tex={`FTY = \\frac{${entered} - ${sc} - ${rw}}{${entered}} = \\frac{${entered - sc - rw}}{${entered}} = ${tx(ans * 100, 2)}\\%`} />,
      traps: [
        { value: finalYield(entered, sc), tag: 'fty-includes-rework', msg: 'That is final yield: it counts reworked tickets as good. First time yield excludes rework.' },
        { value: (entered - sc - rw) / (entered - sc), tag: 'fty-includes-rework', msg: 'Keep scrapped (abandoned) tickets in the denominator: they entered the step.' },
        { value: (entered - rw) / entered, tag: 'fty-includes-rework', msg: 'You removed the rework but forgot the scrapped tickets. Both are first time failures.' },
      ],
    }
  }
  const n = ri(3, 4)
  const ys = Array.from({ length: n }, () => ri(84, 98) / 100)
  while (new Set(ys).size < n) ys[ri(0, n - 1)] = ri(84, 98) / 100
  const names = [...NAMES].sort(() => Math.random() - 0.5).slice(0, n)
  const base = rty(ys)
  const lifted = ys.map((_, k) => rty(ys.map((y, j) => (j === k ? Math.min(1, y + 0.04) : y))))
  const best = lifted.indexOf(Math.max(...lifted))
  return {
    kind: 'choice', tag: 'fty-vs-rty',
    options: names.map((nm, k) => `${nm} (FTY ${fmt(ys[k] * 100, 0)}%)`),
    correct: best,
    prompt: <>Current RTY is <strong>{pct(base)}</strong>. You can raise any <strong>one</strong> step's first time yield by 4 points. Which step should you improve first to lift RTY the most?</>,
    explain: <>Because RTY is a product, the same 4-point gain is worth most on the step with the lowest yield. RTY after each option: {names.map((nm, k) => <span key={nm}>{k > 0 && '; '}{nm} {pct(lifted[k])}</span>)}.</>,
  }
}

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function RtyLab({ embedded }: LabProps) {
  const [steps, setSteps] = useState<Step[]>(DEFAULT_STEPS)
  const [run, setRun] = useState<Run | null>(null)
  const [phase, setPhase] = useState(0)
  const reduced = useReduced()
  const dur = useDur()
  const timer = useRef<number | null>(null)

  const final = run ? 3 * run.steps.length + 1 : 0
  const running = !!run && phase < final

  useEffect(() => {
    if (!run || phase >= final) return
    timer.current = window.setTimeout(() => setPhase(p => p + 1), Math.max(120, dur(0.75) * 1000))
    return () => { if (timer.current) window.clearTimeout(timer.current) }
  }, [run, phase, final, dur])

  const start = () => {
    const r = simulate(steps)
    setRun(r)
    setPhase(reduced ? 3 * r.steps.length + 1 : 0)
  }
  const edit = (id: string, patch: Partial<Step>) => { setSteps(s => s.map(x => (x.id === id ? { ...x, ...patch } : x))); setRun(null) }
  const reset = () => { setSteps(DEFAULT_STEPS()); setRun(null) }
  const another = () => { setSteps(randomSteps()); setRun(null) }

  const ys = steps.map(s => s.fty)
  const theo = rty(ys)
  const finals = steps.map(s => finalYield(1, (1 - s.fty) * (1 - s.rework)))
  const wrong = [
    { label: 'Average of the FTYs', v: avg(ys), why: 'Treats steps as independent attempts. Losses compound, so averaging is far too optimistic.' },
    { label: '100% minus the summed losses', v: 1 - ys.reduce((s, y) => s + (1 - y), 0), why: 'Each step only receives what earlier steps passed. Close sometimes by luck, never by design.' },
    { label: 'Lowest single FTY', v: Math.min(...ys), why: 'Every other step also loses units, so RTY is always lower than the weakest step.' },
    { label: 'Product of final yields', v: rty(finals), why: 'Final yields count reworked units as good, hiding the rework the hidden factory performs.' },
  ]

  const st = run && phase >= final ? stats(run) : null
  const clean = run ? run.fates.filter(f => !f.failAt.some(Boolean)).length : 0
  const scrapTotal = run ? run.fates.filter(f => f.scrapAt !== null).length : 0
  const reworkedUnits = run ? run.fates.filter(f => f.scrapAt === null && f.failAt.some(Boolean)).length : 0

  const explore = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-line p-3 sm:p-4">
        <Line steps={steps} run={run} phase={phase} />
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5"><svg width="10" height="10" aria-hidden><circle cx="5" cy="5" r="4" fill="var(--good)" /></svg>first time right so far</span>
          <span className="inline-flex items-center gap-1.5"><svg width="10" height="10" aria-hidden><circle cx="5" cy="5" r="4" fill="var(--coral)" /></svg>failed first time</span>
          <span className="inline-flex items-center gap-1.5"><svg width="10" height="10" aria-hidden><circle cx="5" cy="5" r="4" fill="var(--amber)" /></svg>reworked (hidden factory)</span>
          <button className="btn btn-primary btn-sm ml-auto" onClick={start} disabled={running}><Play className="size-4" /> {run ? 'Run another 100 units' : 'Run 100 units'}</button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink">Process steps ({steps.length})</h3>
            <button className="btn btn-soft btn-sm" disabled={steps.length >= 5} onClick={() => { setSteps(s => [...s, mk(NAMES.find(nm => !s.some(x => x.name === nm)) ?? 'New step', 0.95, 0.6)]); setRun(null) }}><Plus className="size-4" /> Add step</button>
          </div>
          {steps.map((s, k) => (
            <motion.div layout key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="rounded-2xl border border-line p-3">
              <div className="flex items-center gap-2">
                <span className="tabular grid size-7 shrink-0 place-items-center rounded-lg bg-teal-soft text-sm font-bold text-teal">{k + 1}</span>
                <input aria-label={`Name of step ${k + 1}`} className="field h-9 py-1" value={s.name} onChange={e => edit(s.id, { name: e.target.value })} />
                <button className="btn btn-ghost btn-icon btn-sm" aria-label={`Remove ${s.name}`} disabled={steps.length <= 3} onClick={() => { setSteps(x => x.filter(y => y.id !== s.id)); setRun(null) }}><Trash className="size-4" /></button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Slider id={`fty-${s.id}`} label="First time yield" min={0.5} max={1} step={0.01} value={s.fty} onChange={v => edit(s.id, { fty: v })} format={v => `${fmt(v * 100, 0)}%`} />
                <Slider id={`rw-${s.id}`} label="Failures reworked" min={0} max={1} step={0.05} value={s.rework} onChange={v => edit(s.id, { rework: v })} format={v => `${fmt(v * 100, 0)}% rework, ${fmt(100 - v * 100, 0)}% scrap`} />
              </div>
            </motion.div>
          ))}
          {steps.length <= 3 && <p className="text-xs text-ink-3">The lab keeps between 3 and 5 steps.</p>}
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl bg-teal-soft/60 p-4">
            <div className="text-sm font-semibold text-ink-2">Rolled throughput yield</div>
            <motion.div key={fmt(theo, 4)} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="tabular font-display text-4xl font-bold text-teal">{pct(theo)}</motion.div>
            <Tex block tex={`RTY = ${ys.map(y => tx(y, 2)).join(' \\times ')} = ${tx(theo, 4)}`} />
            <p className="text-sm leading-relaxed text-ink-2">The chance that one unit passes every step first time with no rework and no scrap.</p>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-ink">Tempting but wrong</div>
            <ul className="space-y-2">
              {wrong.map(w => (
                <li key={w.label} className="rounded-xl border border-dashed border-bad/40 p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-ink-2">{w.label}</span>
                    <span className="tabular font-semibold text-bad line-through decoration-2">{pct(w.v)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-3">{w.why}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {st ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { l: 'First time through all steps', v: `${clean} of 100`, c: 'text-good' },
              { l: 'Final yield', v: pct(finalYield(N_UNITS, scrapTotal)), c: 'text-ink' },
              { l: 'Reworked but delivered', v: `${reworkedUnits} units`, c: 'text-amber' },
              { l: 'Scrapped', v: `${scrapTotal} units`, c: 'text-coral' },
            ].map(c => (
              <div key={c.l} className="rounded-2xl border border-line p-3">
                <div className="text-xs font-semibold text-ink-3">{c.l}</div>
                <div className={`tabular font-display text-xl font-bold ${c.c}`}>{c.v}</div>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-ink-2">
            Final yield says {pct(finalYield(N_UNITS, scrapTotal), 0)} of orders came out, but only {clean} went through every step right first time. The gap of {fmt(N_UNITS - scrapTotal - clean, 0)} units is the <strong className="text-ink">hidden factory</strong>: rework that final yield hides. Random variation means this run will not match the calculated RTY of {pct(theo, 1)} exactly.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-surface-2 text-left text-xs text-ink-2">
                <tr>{['Step', 'Entered', 'First pass', 'Reworked', 'Scrapped', 'FTY', 'Final yield'].map(h => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="tabular">
                {st.map(r => (
                  <tr key={r.name} className="border-t border-line">
                    <td className="px-3 py-2 font-semibold text-ink">{r.name}</td>
                    <td className="px-3 py-2">{r.entered}</td>
                    <td className="px-3 py-2 text-good">{r.passed}</td>
                    <td className="px-3 py-2 text-amber">{r.reworked}</td>
                    <td className="px-3 py-2 text-coral">{r.scrapped}</td>
                    <td className="px-3 py-2 font-semibold">{pct(r.fty, 1)}</td>
                    <td className="px-3 py-2">{pct(r.final, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="rounded-2xl bg-surface-2/60 p-4 text-sm text-ink-2">{running ? 'Units are travelling through the line...' : 'Run the simulation to see per-step counts, FTY and final yield side by side.'}</p>
      )}
    </div>
  )

  return (
    <LabShell
      lab="rty"
      embedded={embedded}
      instructions="Set each step's first time yield and how its failures are handled (reworked and passed on, or scrapped). RTY updates live. Press Run 100 units to watch orders travel the line: failures flash coral, reworked units turn amber and scrapped units drop into the bin."
      scenario="Northwind Fibre provisions new broadband connections through several hand-offs. Management reports a healthy final yield, yet customers complain about delays. Where is the hidden rework?"
      onReset={reset}
      onNewExample={another}
      explore={explore}
      challenge={<Runner lab="rty" make={makeQ} intro="Five randomised questions: compute RTY, compute FTY from counts and decide which step to improve first. Answers within half a percentage point count." />}
      check={<KnowledgeCheck lab="rty" items={[
        { q: 'A step receives 200 orders: 170 pass first time, 22 are reworked and then pass, 8 are scrapped. What is the first time yield?', options: ['96%', '85%', '89%', '81%'], answer: 1, why: 'FTY = 170 / 200 = 85%. Final yield would be 192 / 200 = 96% because it counts reworked orders as good.' },
        { q: 'Three steps have FTYs of 90%, 95% and 80%. What is the RTY?', options: ['88.3%', '80%', '68.4%', '65%'], answer: 2, why: '0.90 x 0.95 x 0.80 = 0.684. The average (88.3%) and the minimum (80%) are both too optimistic.' },
        { q: 'Why is final yield usually higher than RTY?', options: ['Final yield includes scrap', 'Final yield counts reworked units as good, hiding rework', 'RTY ignores the last step', 'They measure different processes'], answer: 1, why: 'Rework is invisible in final yield. RTY exposes it because it only counts units that pass every step first time.' },
        { q: 'Each step could gain 3 points of FTY. Which one should you improve first to raise RTY most?', options: ['The step with the highest FTY', 'The step with the lowest FTY', 'The last step', 'It makes no difference'], answer: 1, why: 'RTY is a product, so a fixed gain gives the biggest relative lift where the yield is lowest.' },
      ]} />}
    />
  )
}
