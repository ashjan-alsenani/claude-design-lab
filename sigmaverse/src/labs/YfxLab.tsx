import { AnimatePresence, motion, useSpring, useTransform } from 'motion/react'
import { CloudLightning, Info, RotateCcw, Shuffle, Target, Trophy, Undo2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { recordLab } from '../lib/store'
import { fmt, improvementPercent } from '../lib/metrics'
import { Feedback, KnowledgeCheck, LabShell, Slider } from './kit'
import type { LabProps } from './registry'

const EASE = [0.23, 1, 0.32, 1] as const
const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

/* ------------------------------------------------------------------ */
/* Illustrative model                                                  */
/* ------------------------------------------------------------------ */

type XKey = 'corr' | 'skill' | 'spares' | 'handover'
type Xs = Record<XKey, number>

interface XDef { key: XKey; label: string; short: string; kind: 'C' | 'P'; min: number; max: number; step: number; best: number; unit: (v: number) => string; why: string }

const XDEFS: XDef[] = [
  { key: 'corr', label: 'Alarm correlation quality', short: 'Alarm correlation', kind: 'C', min: 30, max: 100, step: 5, best: 100, unit: v => `${v}%`, why: 'Poor correlation floods engineers with symptoms, so diagnosis takes longer.' },
  { key: 'skill', label: 'Engineer skill level', short: 'Engineer skill', kind: 'C', min: 1, max: 5, step: 1, best: 5, unit: v => `Level ${v}`, why: 'More experienced engineers isolate faults faster and need fewer escalations.' },
  { key: 'spares', label: 'Spare part availability', short: 'Spare parts', kind: 'P', min: 40, max: 100, step: 5, best: 100, unit: v => `${v}% in local depot`, why: 'When the part is not in the local depot, the engineer waits for a courier.' },
  { key: 'handover', label: 'Shift handover quality', short: 'Handover', kind: 'P', min: 40, max: 100, step: 5, best: 100, unit: v => `${v}% checklist complete`, why: 'Incomplete handovers mean the next shift repeats diagnosis already done.' },
]

const BASE_HOURS = 1.8
const STORM_MEAN = 1.4

/** Hours each input adds above its best setting (illustrative weights). */
function contributions(x: Xs): Record<XKey, number> {
  return {
    corr: (3.2 * (100 - x.corr)) / 70,
    skill: 0.55 * (5 - x.skill),
    spares: (4.2 * (100 - x.spares)) / 60,
    handover: (0.9 * (100 - x.handover)) / 60,
  }
}
function expectedMttr(x: Xs, storm: boolean) {
  const c = contributions(x)
  return BASE_HOURS + c.corr + c.skill + c.spares + c.handover + (storm ? STORM_MEAN : 0)
}

interface Noise { z: number[]; u: number[] }
function gauss() { let a = 0; for (let i = 0; i < 6; i++) a += Math.random(); return (a - 3) / Math.sqrt(0.5) }
const newNoise = (): Noise => ({ z: Array.from({ length: 20 }, gauss), u: Array.from({ length: 20 }, Math.random) })

function incidents(x: Xs, storm: boolean, n: Noise) {
  const calm = expectedMttr(x, false)
  return n.z.map((z, i) => Math.max(0.4, calm + z * 0.16 * calm + (storm ? 0.4 + 2 * n.u[i] : 0)))
}

const DEFAULT_X: Xs = { corr: 55, skill: 3, spares: 60, handover: 70 }
const REGIONS = ['North region NOC', 'Coastal region NOC', 'Metro core NOC', 'Highlands region NOC']

/* ------------------------------------------------------------------ */
/* Visuals                                                             */
/* ------------------------------------------------------------------ */

const NODE_Y = [52, 122, 192, 262]

function FlowDiagram({ x, storm, mttr }: { x: Xs; storm: boolean; mttr: number }) {
  const c = contributions(x)
  const px = 380, py = 157
  return (
    <svg viewBox="0 0 720 320" className="h-auto w-full" role="img"
      aria-label={`Four inputs feed the restoration process. ${XDEFS.map(d => `${d.short} adds ${fmt(c[d.key], 1)} hours`).join(', ')}. Storm noise is ${storm ? 'on' : 'off'}. Output Y, mean time to restore, is ${fmt(mttr, 1)} hours.`}>
      {XDEFS.map((d, i) => {
        const y = NODE_Y[i]
        const frac = (x[d.key] - d.min) / (d.max - d.min)
        const heavy = c[d.key]
        return (
          <g key={d.key}>
            <motion.path d={`M 150 ${y} C 250 ${y}, 270 ${py}, ${px - 70} ${py}`} fill="none" stroke="var(--violet)" strokeLinecap="round"
              initial={false} animate={{ strokeWidth: 1.5 + heavy * 2.2, opacity: 0.25 + Math.min(0.6, heavy / 4) }} transition={{ duration: 0.5, ease: EASE }} />
            <motion.circle key={`${d.key}-${x[d.key]}`} r={5} fill="var(--violet)"
              initial={{ cx: 150, cy: y, opacity: 1 }} animate={{ cx: px - 70, cy: py, opacity: 0 }} transition={{ duration: 0.8, ease: EASE }} />
            <circle cx={118} cy={y} r={26} fill="var(--surface)" stroke="var(--line-2)" strokeWidth={5} />
            <motion.circle cx={118} cy={y} r={26} fill="none" stroke="var(--violet)" strokeWidth={5} strokeLinecap="round" transform={`rotate(-90 118 ${y})`}
              initial={false} animate={{ pathLength: Math.max(0.02, frac) }} transition={{ duration: 0.5, ease: EASE }} />
            <text x={118} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">X{i + 1}</text>
            <text x={80} y={y - 4} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--ink)" fontFamily="var(--font-sans)">{d.short}</text>
            <text x={80} y={y + 12} textAnchor="end" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">{d.kind === 'C' ? 'controllable' : 'procedural'}</text>
          </g>
        )
      })}
      <g>
        <motion.path d={`M ${px} 300 L ${px} ${py + 46}`} fill="none" stroke="var(--coral)" strokeWidth={2.5} strokeDasharray="5 5" initial={false} animate={{ opacity: storm ? 1 : 0.18 }} />
        <rect x={px - 72} y={286} width={144} height={30} rx={15} fill={storm ? 'var(--coral-soft)' : 'var(--surface-2)'} stroke={storm ? 'var(--coral)' : 'var(--line)'} />
        <text x={px} y={306} textAnchor="middle" fontSize={12} fontWeight={600} fill={storm ? 'var(--coral)' : 'var(--ink-3)'} fontFamily="var(--font-sans)">Noise: storm {storm ? 'on' : 'off'}</text>
      </g>
      <rect x={px - 70} y={py - 44} width={140} height={88} rx={18} fill="var(--violet-soft)" stroke="var(--violet)" strokeWidth={1.5} />
      <text x={px} y={py - 8} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">Restore</text>
      <text x={px} y={py + 10} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--ink)" fontFamily="var(--font-sans)">failed site</text>
      <text x={px} y={py + 30} textAnchor="middle" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">process f</text>
      <path d={`M ${px + 70} ${py} L ${560} ${py}`} stroke="var(--teal)" strokeWidth={3} />
      <path d={`M 552 ${py - 6} L 562 ${py} L 552 ${py + 6}`} fill="none" stroke="var(--teal)" strokeWidth={3} />
      <circle cx={630} cy={py} r={58} fill="var(--teal-soft)" stroke="var(--teal)" strokeWidth={2} />
      <text x={630} y={py - 18} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ink-2)" fontFamily="var(--font-sans)">Y = MTTR</text>
      <motion.text key={fmt(mttr, 1)} x={630} y={py + 14} textAnchor="middle" fontSize={28} fontWeight={800} fill="var(--teal)" fontFamily="var(--font-display)"
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>{fmt(mttr, 1)}</motion.text>
      <text x={630} y={py + 34} textAnchor="middle" fontSize={12} fill="var(--ink-2)" fontFamily="var(--font-sans)">hours</text>
    </svg>
  )
}

const G_MAX = 14
function Gauge({ value, baseline, target }: { value: number; baseline?: number; target?: number }) {
  const ang = (v: number) => -90 + (Math.min(G_MAX, Math.max(0, v)) / G_MAX) * 180
  const pt = (v: number, r: number) => { const a = (ang(v) - 90) * (Math.PI / 180); return [160 + r * Math.cos(a), 150 + r * Math.sin(a)] }
  const spring = useSpring(value, { stiffness: 140, damping: 20 })
  useEffect(() => { spring.set(value) }, [spring, value])
  const nx = useTransform(spring, v => pt(v, 88)[0])
  const ny = useTransform(spring, v => pt(v, 88)[1])
  const arc = (a: number, b: number, r: number) => { const [x1, y1] = pt(a, r); const [x2, y2] = pt(b, r); return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}` }
  return (
    <svg viewBox="0 0 320 180" className="mx-auto h-auto w-full max-w-[320px]" role="img" aria-label={`Gauge: mean time to restore ${fmt(value, 1)} hours on a 0 to ${G_MAX} hour scale${target ? `, target ${fmt(target, 1)} hours` : ''}.`}>
      <path d={arc(0, G_MAX, 120)} fill="none" stroke="var(--surface-3)" strokeWidth={18} strokeLinecap="round" />
      <motion.path d={arc(0, G_MAX, 120)} fill="none" stroke={target !== undefined && value <= target ? 'var(--good)' : 'var(--teal)'} strokeWidth={18} strokeLinecap="round"
        initial={false} animate={{ pathLength: Math.max(0.01, Math.min(1, value / G_MAX)) }} transition={{ duration: 0.7, ease: EASE }} />
      {[0, 2, 4, 6, 8, 10, 12, 14].map(t => { const [x, y] = pt(t, 96); return <text key={t} x={x} y={y + 4} textAnchor="middle" fontSize={12} fill="var(--ink-3)" fontFamily="var(--font-sans)">{t}</text> })}
      {baseline !== undefined && (() => { const [x1, y1] = pt(baseline, 108); const [x2, y2] = pt(baseline, 134); return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink-3)" strokeWidth={2.5} strokeDasharray="3 3" /> })()}
      {target !== undefined && (() => { const [x1, y1] = pt(target, 106); const [x2, y2] = pt(target, 136); return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--coral)" strokeWidth={3.5} /> })()}
      <motion.line x1={160} y1={150} x2={nx} y2={ny} stroke="var(--ink)" strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={160} cy={150} r={8} fill="var(--ink)" />
      <text x={160} y={176} textAnchor="middle" fontSize={13} fill="var(--ink-2)" fontFamily="var(--font-sans)">hours to restore</text>
    </svg>
  )
}

function IncidentRun({ ys, mean, target }: { ys: number[]; mean: number; target?: number }) {
  const sx = (v: number) => 30 + (Math.min(G_MAX, v) / G_MAX) * 660
  return (
    <svg viewBox="0 0 720 120" className="h-auto w-full" role="img" aria-label={`20 simulated incidents ranging from ${fmt(Math.min(...ys), 1)} to ${fmt(Math.max(...ys), 1)} hours, mean ${fmt(mean, 1)} hours.`}>
      <line x1={30} x2={690} y1={84} y2={84} stroke="var(--line-2)" />
      {[0, 2, 4, 6, 8, 10, 12, 14].map(t => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={84} y2={90} stroke="var(--line-2)" />
          <text x={sx(t)} y={106} textAnchor="middle" fontSize={12} fill="var(--ink-3)" fontFamily="var(--font-sans)">{t} h</text>
        </g>
      ))}
      {target !== undefined && <line x1={sx(target)} x2={sx(target)} y1={8} y2={84} stroke="var(--coral)" strokeWidth={2} />}
      <motion.line y1={8} y2={84} stroke="var(--teal)" strokeWidth={2} strokeDasharray="4 4" initial={false} animate={{ x1: sx(mean), x2: sx(mean) }} transition={{ duration: 0.6, ease: EASE }} />
      {ys.map((y, i) => (
        <motion.circle key={i} r={6} cy={20 + (i % 4) * 16} initial={false} animate={{ cx: sx(y) }} transition={{ duration: 0.6, ease: EASE, delay: i * 0.015 }}
          fill={target !== undefined && y > target ? 'var(--coral)' : 'var(--violet)'} fillOpacity={0.8} />
      ))}
    </svg>
  )
}

function SensitivityBars({ x }: { x: Xs }) {
  const c = contributions(x)
  const rows = [...XDEFS].sort((a, b) => c[b.key] - c[a.key])
  const max = Math.max(0.5, ...rows.map(r => c[r.key]))
  return (
    <ul className="space-y-2.5" aria-label="Hours each input adds above its best setting">
      {rows.map((d, i) => (
        <motion.li layout key={d.key} transition={{ duration: 0.35, ease: EASE }}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className={`font-semibold ${i === 0 && c[d.key] > 0.05 ? 'text-violet' : 'text-ink-2'}`}>{d.short}{i === 0 && c[d.key] > 0.05 ? ' (biggest effect now)' : ''}</span>
            <span className="tabular text-ink-2">+{fmt(c[d.key], 2)} h</span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface-3">
            <motion.div className={`h-full rounded-full ${i === 0 ? 'bg-violet' : 'bg-violet/50'}`} initial={false} animate={{ width: `${(c[d.key] / max) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
          </div>
        </motion.li>
      ))}
    </ul>
  )
}

function Banner() {
  return (
    <div className="flex gap-2 rounded-xl bg-amber-soft px-3 py-2.5 text-sm font-semibold text-ink" role="note">
      <Info className="mt-0.5 size-4 shrink-0 text-amber" />
      Illustrative educational model, not a proven causal relationship.
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Challenge: hit the target by changing the fewest inputs              */
/* ------------------------------------------------------------------ */

function makeChallenge() {
  for (;;) {
    const x: Xs = { corr: ri(6, 12) * 5, skill: ri(1, 3), spares: ri(8, 15) * 5, handover: ri(8, 14) * 5 }
    const c = contributions(x)
    const order = [...XDEFS].sort((a, b) => c[b.key] - c[a.key]).map(d => d.key)
    if (c[order[1]] < 0.7 || c[order[0]] < 1.2) continue
    const top2: Xs = { ...x }
    for (const k of order.slice(0, 2)) top2[k] = XDEFS.find(d => d.key === k)!.best
    const target = Math.round((expectedMttr(top2, false) + 0.3) * 10) / 10
    const top1: Xs = { ...x, [order[0]]: XDEFS.find(d => d.key === order[0])!.best }
    if (expectedMttr(top1, false) <= target) continue
    return { base: x, target, vital: order.slice(0, 2), region: pick(REGIONS) }
  }
}

function Challenge() {
  const [ch, setCh] = useState(makeChallenge)
  const [x, setX] = useState<Xs>(ch.base)
  const [result, setResult] = useState<{ ok: boolean; changed: number; score: number } | null>(null)
  const noise = useMemo(newNoise, [ch])
  const mttr = expectedMttr(x, false)
  const changed = XDEFS.filter(d => x[d.key] !== ch.base[d.key])
  const fresh = () => { const n = makeChallenge(); setCh(n); setX(n.base); setResult(null) }

  const submit = () => {
    const ok = mttr <= ch.target
    const score = ok ? Math.max(40, 100 - (changed.length - 2) * 30) : 0
    setResult({ ok, changed: changed.length, score })
    if (ok) recordLab('yfx', score)
  }

  return (
    <div className="space-y-4">
      <Banner />
      <div className="rounded-2xl border border-line p-4 leading-relaxed text-ink">
        <div className="flex items-center gap-2 font-display text-lg font-semibold"><Target className="size-5 text-coral" /> Get MTTR at or below {fmt(ch.target, 1)} hours</div>
        <p className="mt-1 text-sm text-ink-2">
          {ch.region} restores sites in {fmt(expectedMttr(ch.base, false), 1)} hours on a calm week. Budget allows you to change as <strong>few inputs as possible</strong>: find the vital few. Experiment with the sliders, then submit your plan. Storm noise is left out because you cannot control the weather.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
        <div className="space-y-4">
          {XDEFS.map(d => (
            <div key={d.key} className={`rounded-xl border p-3 ${x[d.key] !== ch.base[d.key] ? 'border-violet bg-violet-soft/30' : 'border-line'}`}>
              <Slider id={`ch-${d.key}`} label={`${d.label} (${d.kind})`} min={d.min} max={d.max} step={d.step} value={x[d.key]} format={d.unit}
                onChange={v => { setX(s => ({ ...s, [d.key]: v })); setResult(null) }} />
              {x[d.key] !== ch.base[d.key] && (
                <button className="btn btn-ghost btn-sm mt-1" onClick={() => { setX(s => ({ ...s, [d.key]: ch.base[d.key] })); setResult(null) }}><Undo2 className="size-4" /> Back to {d.unit(ch.base[d.key])}</button>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Gauge value={mttr} baseline={expectedMttr(ch.base, false)} target={ch.target} />
          <div className="text-center">
            <div className="tabular font-display text-3xl font-bold text-ink">{fmt(mttr, 2)} h</div>
            <div className="text-sm text-ink-2">Inputs changed: <strong className="tabular">{changed.length}</strong> of 4</div>
          </div>
          <IncidentRun ys={incidents(x, false, noise)} mean={mttr} target={ch.target} />
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary flex-1" onClick={submit}>Submit plan</button>
            <button className="btn btn-soft" onClick={fresh}><Shuffle className="size-4" /> New scenario</button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Feedback ok={result.ok}>
              {result.ok ? (
                <>
                  <div className="flex items-center gap-2 font-semibold"><Trophy className="size-4 text-amber" /> Target met with {result.changed} input{result.changed === 1 ? '' : 's'} changed. Score {result.score}.</div>
                  <p className="mt-1">The vital few here were <strong>{ch.vital.map(k => XDEFS.find(d => d.key === k)!.short).join(' and ')}</strong>. {result.changed > 2 ? 'You reached the target, but you also spent effort on inputs that barely move Y. Focus beats spreading effort thin.' : 'You concentrated on the inputs that drive Y most. That is the vital few idea.'} In a real project, the Analyze phase would have to prove these effects with data before you invest.</p>
                </>
              ) : (
                <>
                  <div className="font-semibold">MTTR is {fmt(mttr, 2)} h, still above {fmt(ch.target, 1)} h.</div>
                  <p className="mt-1">Move one slider at a time and watch how far the needle moves. Some inputs barely matter; a couple matter a lot.</p>
                </>
              )}
            </Feedback>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Lab                                                                 */
/* ------------------------------------------------------------------ */

export default function YfxLab({ embedded }: LabProps) {
  const [region, setRegion] = useState(REGIONS[0])
  const [base, setBase] = useState<Xs>(DEFAULT_X)
  const [x, setX] = useState<Xs>(DEFAULT_X)
  const [storm, setStorm] = useState(false)
  const [noise, setNoise] = useState<Noise>(newNoise)

  const mttr = expectedMttr(x, storm)
  const baseMttr = expectedMttr(base, false)
  const ys = incidents(x, storm, noise)
  const runMean = ys.reduce((s, v) => s + v, 0) / ys.length
  const spread = Math.max(...ys) - Math.min(...ys)
  const change = improvementPercent(baseMttr, mttr)

  const reset = () => { setRegion(REGIONS[0]); setBase(DEFAULT_X); setX(DEFAULT_X); setStorm(false) }
  const another = () => {
    const nb: Xs = { corr: ri(7, 15) * 5, skill: ri(1, 4), spares: ri(9, 17) * 5, handover: ri(9, 17) * 5 }
    setRegion(pick(REGIONS.filter(r => r !== region))); setBase(nb); setX(nb); setStorm(false); setNoise(newNoise())
  }

  const explore = (
    <div className="space-y-5">
      <Banner />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="space-y-4">
          {XDEFS.map((d, i) => (
            <div key={d.key}>
              <Slider id={`yfx-${d.key}`} label={`X${i + 1} ${d.label}`} min={d.min} max={d.max} step={d.step} value={x[d.key]} format={d.unit} onChange={v => setX(s => ({ ...s, [d.key]: v }))} />
              <p className="mt-1 text-xs leading-relaxed text-ink-3"><span className="font-semibold">{d.kind === 'C' ? 'Controllable' : 'Procedural'}.</span> {d.why}</p>
            </div>
          ))}
          <div className={`rounded-xl border p-3 ${storm ? 'border-coral bg-coral-soft/50' : 'border-line'}`}>
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink"><CloudLightning className="size-4 text-coral" /> Noise: storm weather</span>
              <input type="checkbox" className="size-5 accent-[var(--coral)]" checked={storm} onChange={e => setStorm(e.target.checked)} />
            </label>
            <p className="mt-1 text-xs leading-relaxed text-ink-3">An uncontrollable (noise) input. Storms add travel delays that differ from incident to incident, so they widen the spread as well as raising the average.</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setNoise(newNoise())}><RotateCcw className="size-4" /> Simulate 20 new incidents</button>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-line p-3"><FlowDiagram x={x} storm={storm} mttr={mttr} /></div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-line p-3">
              <Gauge value={mttr} baseline={baseMttr} />
              <p className="text-center text-sm text-ink-2">
                {Math.abs(change) < 0.05 ? 'Same as the starting point (dashed tick).' : change > 0 ? <><strong className="text-good">{fmt(change, 1)}% faster</strong> than the starting point (dashed tick).</> : <><strong className="text-bad">{fmt(-change, 1)}% slower</strong> than the starting point (dashed tick).</>}
              </p>
            </div>
            <div className="rounded-2xl border border-line p-4">
              <h3 className="font-display text-base font-semibold text-ink">Which X matters most right now?</h3>
              <p className="mb-3 text-xs text-ink-3">Hours each input adds above its best setting, sorted.</p>
              <SensitivityBars x={x} />
            </div>
          </div>
          <div className="rounded-2xl border border-line p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
              <h3 className="font-display text-base font-semibold text-ink">20 simulated incidents</h3>
              <span className="tabular text-xs text-ink-2">mean {fmt(runMean, 1)} h, spread {fmt(spread, 1)} h</span>
            </div>
            <IncidentRun ys={ys} mean={runMean} />
            <p className="px-1 text-xs leading-relaxed text-ink-3">Same settings, different results: every incident is a little different. That variation is why Y = f(X) is written with an error term, and why one incident never proves a cause.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-violet-soft/60 p-4 text-sm leading-relaxed text-ink-2">
          <h3 className="mb-1 font-display text-base font-semibold text-ink">Potential causes, not proven root causes</h3>
          In Define you record the X's the team <em>suspects</em>. The numbers in this lab are invented to show the idea. In a real project each X stays a potential cause until data collected in Measure and tested in Analyze shows its effect on Y.
        </div>
        <div className="rounded-2xl bg-teal-soft/60 p-4 text-sm leading-relaxed text-ink-2">
          <h3 className="mb-1 font-display text-base font-semibold text-ink">Act on the X's, not on Y</h3>
          You cannot set MTTR directly. Tighter targets or more MTTR reports change nothing. Only a change to an input moves the needle, and usually a vital few inputs drive most of the result.
        </div>
      </div>
    </div>
  )

  return (
    <LabShell
      lab="yfx"
      embedded={embedded}
      instructions="Move the four input sliders (X's) and toggle storm noise. Watch the output Y, mean time to restore (MTTR), move on the gauge, the 20 simulated incidents spread out or tighten, and the sensitivity bars reveal which input matters most."
      scenario={<>Kestrel Mobile's {region} restores failed cell sites. Customers and the regulator care about one output: how many hours a site stays down. Four candidate inputs and one noise input feed the process.</>}
      onReset={reset}
      onNewExample={another}
      explore={explore}
      challenge={<Challenge />}
      check={<KnowledgeCheck lab="yfx" items={[
        { q: 'In Y = f(X), which statement is correct?', options: ['X depends on Y', 'Y is the output that depends on the inputs X', 'Y is always a cost', 'X is the customer requirement'], answer: 1, why: 'Y is the dependent output; the X\'s are the inputs that drive it.' },
        { q: 'During Define, the team agrees that poor alarm correlation is slowing restoration. How should this be recorded?', options: ['As the verified root cause', 'As a potential X to test later', 'As the project goal', 'As noise'], answer: 1, why: 'In Define it is a suspected cause. Only Analyze, using data, can prove it is a critical X.' },
        { q: 'Storm weather that the NOC cannot influence is best classed as:', options: ['A controllable input', 'A procedural input', 'A noise input', 'An output'], answer: 2, why: 'Noise inputs are ones you cannot control, do not know about or find too costly to control.' },
        { q: 'The manager wants to cut MTTR by setting a stricter MTTR target. Why is this weak?', options: ['Targets are illegal', 'It acts on Y directly instead of the X\'s that drive it', 'MTTR cannot be measured', 'It changes the noise'], answer: 1, why: 'Y = f(X): to change the output you must change the inputs that drive it.' },
      ]} />}
    />
  )
}
