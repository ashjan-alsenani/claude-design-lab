import { AnimatePresence, motion } from 'motion/react'
import { useId, useSyncExternalStore, type ReactNode } from 'react'
import type { DiagramView } from './Diagram'
import { dpmoFromSigma, fmt, normCdf, normInv } from '../lib/metrics'
import { useReduced } from '../lib/motion'

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1]
const SANS = 'var(--font-sans)'
const DISPLAY = 'var(--font-display)'
type Tone = 'violet' | 'teal' | 'coral' | 'amber' | 'sky' | 'indigo' | 'good' | 'bad'
const c = (t: Tone) => `var(--${t})`
const soft = (t: Tone) => `var(--${t}-soft)`

const NARROW_QUERY = '(max-width: 600px)'
function subscribeNarrow(cb: () => void) {
  const mq = window.matchMedia(NARROW_QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
/** True on phone-sized viewports, where diagrams switch to a taller, narrower layout. */
function useNarrow() {
  return useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW_QUERY).matches, () => false)
}

/** Greedy word wrap by approximate character count. */
function wrap(text: string, max: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const w of text.split(' ')) {
    if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w } else cur = cur ? `${cur} ${w}` : w
  }
  if (cur) out.push(cur)
  return out
}

/** Fades and lifts a group in when `on` becomes true; reverses when stepping back. */
function Show({ on, children, delay = 0, dy = 8 }: { on: boolean; children: ReactNode; delay?: number; dy?: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: dy }}
      animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: dy }}
      transition={{ duration: 0.55, ease: EASE, delay: on ? delay : 0 }}
      style={{ pointerEvents: on ? 'auto' : 'none' }}
      aria-hidden={!on}
    >
      {children}
    </motion.g>
  )
}

function Svg({ w, h, label, children }: { w: number; h: number; label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={label} fontFamily={SANS}>
      {children}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* 1. Sigma curve                                                      */
/* ------------------------------------------------------------------ */

const SPEC = 3
const DOM: [number, number] = [-5, 5]
const pdf = (x: number, m: number, s: number) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI))
const BANDS = [3, 2, 1].map(k => ({ k, share: (2 * normCdf(k) - 1) * 100 }))
const START_SD = 1.5
const OUTSIDE_START = 2 * (1 - normCdf(SPEC / START_SD)) * 100
const LONG_TERM_DPMO = dpmoFromSigma(6)
const RUG = Array.from({ length: 36 }, (_, i) => normInv((i + 0.5) / 36))

function SigmaCurveView({ step }: { step: number }) {
  const n = useNarrow()
  const W = n ? 360 : 720
  const padX = n ? 16 : 48
  const top = 84
  const base = n ? 238 : 262
  const H = base + 60
  const sx = (v: number) => padX + ((v - DOM[0]) / (DOM[1] - DOM[0])) * (W - 2 * padX)
  // Vertical scale is per phase: tall enough to show the wide curve's tails, then the narrow one.
  const YMAX = step >= 3 ? 0.86 : 0.3
  const sy = (p: number) => base - (p / YMAX) * (base - top)
  const sd = step >= 3 ? 0.5 : START_SD
  const mean = step >= 4 ? 0.75 : 0

  const line = (m: number, s: number) => {
    const N = 161
    let d = ''
    for (let i = 0; i < N; i++) {
      const x = DOM[0] + ((DOM[1] - DOM[0]) * i) / (N - 1)
      d += `${i ? 'L' : 'M'}${sx(x).toFixed(2)},${sy(pdf(x, m, s)).toFixed(2)}`
    }
    return d
  }
  const area = (a: number, b: number, m: number, s: number, N = 60) => {
    let d = `M${sx(a).toFixed(2)},${base}`
    for (let i = 0; i < N; i++) {
      const x = a + ((b - a) * i) / (N - 1)
      d += `L${sx(x).toFixed(2)},${sy(pdf(x, m, s)).toFixed(2)}`
    }
    return `${d}L${sx(b).toFixed(2)},${base}Z`
  }
  const t = { duration: 0.9, ease: EASE }
  const fs = n ? 12 : 13
  const labelRow = base + 44
  const peakY = sy(pdf(mean, mean, sd))

  const label = [
    'A bell-shaped curve of process output around its mean.',
    'Standard deviation marks from minus 3 to plus 3 sigma around the mean.',
    `Lower and upper specification limits; ${fmt(OUTSIDE_START, 2)}% of output falls outside them.`,
    'The curve is narrowed so six standard deviations fit between the mean and each limit.',
    `The mean shifts by 1.5 sigma; the tail beyond the upper limit is ${fmt(LONG_TERM_DPMO, 1)} defects per million opportunities.`,
  ][Math.min(step, 4)]

  return (
    <Svg w={W} h={H} label={label}>
      {/* sigma bands */}
      <Show on={step >= 1} dy={0}>
        {BANDS.map(({ k }, i) => (
          <motion.path key={k} initial={false} animate={{ d: area(mean - k * sd, mean + k * sd, mean, sd) }} transition={t} fill={c('violet')} fillOpacity={0.09 + i * 0.05} />
        ))}
      </Show>

      {/* defect tails */}
      <Show on={step >= 2} dy={0}>
        <motion.path initial={false} animate={{ d: area(DOM[0], -SPEC, mean, sd) }} transition={t} fill={c('bad')} fillOpacity={0.55} />
        <motion.path initial={false} animate={{ d: area(SPEC, DOM[1], mean, sd) }} transition={t} fill={c('bad')} fillOpacity={0.55} />
      </Show>

      {/* ghost of the centred process during the shift step */}
      <Show on={step >= 4} dy={0}>
        <path d={line(0, 0.5)} fill="none" stroke="var(--ink-3)" strokeWidth={1.5} strokeDasharray="4 5" />
      </Show>

      {/* axis */}
      <line x1={padX} x2={W - padX} y1={base} y2={base} stroke="var(--line-2)" strokeWidth={1.5} />

      {/* mean line */}
      <motion.g initial={false} animate={{ x: sx(mean) }} transition={t}>
        <motion.line x1={0} x2={0} y1={base} initial={false} animate={{ y2: peakY }} transition={t} stroke="var(--ink-3)" strokeWidth={1.25} strokeDasharray="3 4" />
      </motion.g>

      {/* the curve */}
      <motion.path initial={false} animate={{ d: line(mean, sd) }} transition={t} fill="none" stroke={c('violet')} strokeWidth={2.75} strokeLinejoin="round" />

      {/* rug of measured outputs */}
      {RUG.map((z, i) => (
        <motion.circle key={i} cy={base + 11 + (i % 3) * 5} r={2.5} initial={false} animate={{ cx: sx(mean + z * sd) }} transition={{ ...t, delay: (i % 6) * 0.015 }} fill={c('violet')} fillOpacity={0.6} />
      ))}

      {/* sigma tick marks (steps 1 and 2) */}
      {[-3, -2, -1, 1, 2, 3].map(k => {
        const on = step >= 1 && step <= 2
        const x = sx(mean + k * sd)
        return (
          <Show key={k} on={on} dy={0} delay={on ? Math.abs(k) * 0.08 : 0}>
            <line x1={x} x2={x} y1={base} y2={sy(pdf(mean + k * sd, mean, sd))} stroke={c('violet')} strokeOpacity={0.55} strokeWidth={1} />
            <text x={x} y={labelRow} textAnchor="middle" fontSize={fs} fontWeight={600} fill="var(--ink-2)">{k < 0 ? `−${-k}σ` : `+${k}σ`}</text>
          </Show>
        )
      })}
      <Show on={step <= 2} dy={0}>
        <text x={sx(0)} y={labelRow} textAnchor="middle" fontSize={fs} fontWeight={700} fill="var(--ink)">Mean</text>
      </Show>
      {step === 0 && (
        <Show on dy={0} delay={0.3}>
          <text x={padX} y={labelRow} fontSize={fs - 1} fill="var(--ink-3)">{n ? 'Dot = one result' : 'Each dot is one measured result'}</text>
        </Show>
      )}

      {/* band legend */}
      <Show on={step >= 1}>
        {BANDS.slice().reverse().map(({ k, share }, i) => (
          <g key={k} transform={`translate(${padX}, ${18 + i * 17})`}>
            <rect width={12} height={10} y={-9} rx={2} fill={c('violet')} fillOpacity={[0.38, 0.22, 0.09][i]} />
            <text x={18} fontSize={fs} fill="var(--ink-2)"><tspan fontWeight={700} fill="var(--ink)">±{k}σ</tspan> holds {fmt(share, 2)}%</text>
          </g>
        ))}
      </Show>

      {/* spec limits */}
      <Show on={step >= 2} dy={0}>
        {[-SPEC, SPEC].map(v => (
          <g key={v}>
            <line x1={sx(v)} x2={sx(v)} y1={top - 2} y2={base} stroke={c('bad')} strokeWidth={2} />
            <text x={sx(v)} y={top - 9} textAnchor="middle" fontSize={fs} fontWeight={700} fill={c('bad')}>{v < 0 ? 'LSL' : 'USL'}</text>
          </g>
        ))}
      </Show>

      {/* 6 sigma brackets */}
      <Show on={step >= 3} dy={0}>
        {[-1, 1].map(side => {
          const a = sx(mean)
          const b = sx(side * SPEC)
          const dist = Math.abs(side * SPEC - mean) / sd
          const mid = (a + b) / 2
          return (
            <g key={side}>
              <motion.line initial={false} animate={{ x1: a, x2: b }} transition={t} y1={labelRow - 4} y2={labelRow - 4} stroke="var(--ink-2)" strokeWidth={1.25} />
              <line x1={b} x2={b} y1={labelRow - 9} y2={labelRow + 1} stroke="var(--ink-2)" strokeWidth={1.25} />
              <motion.line initial={false} animate={{ x1: a, x2: a }} transition={t} y1={labelRow - 9} y2={labelRow + 1} stroke="var(--ink-2)" strokeWidth={1.25} />
              <motion.g initial={false} animate={{ x: mid }} transition={t}>
                <rect x={-22} y={labelRow - 15} width={44} height={20} rx={6} fill="var(--surface)" />
                <text y={labelRow} textAnchor="middle" fontSize={fs + 1} fontWeight={700} fill={step >= 4 && side > 0 ? c('coral') : 'var(--ink)'} className="tabular">{fmt(dist, 1)}σ</text>
              </motion.g>
            </g>
          )
        })}
      </Show>

      {/* 1.5 sigma shift arrow */}
      <Show on={step >= 4} dy={0}>
        <line x1={sx(0)} x2={sx(0.75) - 3} y1={peakY - 10} y2={peakY - 10} stroke={c('coral')} strokeWidth={2} />
        <path d={`M${sx(0.75)},${peakY - 10} l-7,-4.5 v9 z`} fill={c('coral')} />
        <text x={sx(0) - 8} y={peakY - 6} textAnchor="end" fontSize={fs} fontWeight={700} fill={c('coral')}>1.5σ shift</text>
        <circle cx={sx(SPEC)} cy={base} r={6} fill="none" stroke={c('coral')} strokeWidth={2} />
        <path d={`M${sx(SPEC) + 5},${base - 5} L${W - padX - 30},${n ? 50 : 52}`} stroke={c('coral')} strokeWidth={1.25} fill="none" />
      </Show>

      {/* headline readout */}
      <AnimatePresence mode="wait">
        {step >= 2 && (
          <motion.g key={step >= 4 ? 'shift' : step >= 3 ? 'six' : 'spec'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }}>
            <text x={W - padX} y={22} textAnchor="end" fontSize={fs} fill="var(--ink-2)">
              {step >= 4 ? 'Long term, beyond USL' : step >= 3 ? '±6σ fits inside the limits' : 'Outside the limits'}
            </text>
            <text x={W - padX} y={44} textAnchor="end" fontSize={n ? 18 : 20} fontWeight={700} fontFamily={DISPLAY} fill={step === 3 ? c('good') : c('bad')} className="tabular">
              {step >= 4 ? `${fmt(LONG_TERM_DPMO, 1)} DPMO` : step >= 3 ? 'Practically zero' : `${fmt(OUTSIDE_START, 2)}% defective`}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </Svg>
  )
}

export const sigmaCurve: DiagramView = {
  title: 'From variation to six sigma',
  steps: [
    "Every process output **varies**. Measure the same result many times and the values scatter around a mean, often in a bell-shaped curve.",
    `The [[Standard Deviation|standard deviation]] (σ) measures that spread. About ${fmt(BANDS[2].share, 1)}% of results fall within ±1σ, ${fmt(BANDS[1].share, 1)}% within ±2σ and ${fmt(BANDS[0].share, 1)}% within ±3σ.`,
    `The customer sets [[Specification Limits|specification limits]]. Anything beyond LSL or USL is a [[Defect|defect]]: here the limits sit only 2σ from the mean, so ${fmt(OUTSIDE_START, 2)}% of output is defective.`,
    "Six Sigma attacks **variation**, not the limits. Shrink σ until six standard deviations fit between the mean and each limit, and the tails almost vanish.",
    `Over time a process mean drifts, conventionally by **1.5σ**. The nearer limit is then 4.5σ away, leaving ${fmt(LONG_TERM_DPMO, 1)} defects per million opportunities: that is why a six [[Sigma Level|sigma level]] is quoted as 3.4 DPMO.`,
  ],
  View: SigmaCurveView,
}

/* ------------------------------------------------------------------ */
/* 2. Timeline                                                         */
/* ------------------------------------------------------------------ */

const ERAS: { name: string; span: string; tone: Tone }[] = [
  { name: 'Foundations', span: '1924 to 1950s', tone: 'indigo' },
  { name: 'Japan and cost', span: '1950s to 1979', tone: 'teal' },
  { name: 'Six Sigma born', span: '1986 to 1988', tone: 'violet' },
  { name: 'Going corporate', span: '1991 to 1995', tone: 'coral' },
  { name: 'Lean joins in', span: '1996 to 2000s', tone: 'amber' },
]
const EVENTS: { year: string; lines: [string, string]; era: number }[] = [
  { year: '1924', lines: ['Shewhart draws the', 'first control chart'], era: 0 },
  { year: '1950', lines: ['Deming lectures', 'in Japan'], era: 0 },
  { year: '1950s', lines: ['Juran and', 'Feigenbaum (TQC)'], era: 0 },
  { year: '1950s-70s', lines: ['Toyota Production', 'System takes shape'], era: 1 },
  { year: '1979', lines: ['Crosby publishes', 'Quality is Free'], era: 1 },
  { year: '1986', lines: ['Motorola launches', 'Six Sigma'], era: 2 },
  { year: '1988', lines: ['Motorola wins', 'the Baldrige Award'], era: 2 },
  { year: '1991', lines: ['AlliedSignal', 'adopts Six Sigma'], era: 3 },
  { year: '1995', lines: ['GE rolls it out', 'under Jack Welch'], era: 3 },
  { year: '1996', lines: ['Lean Thinking', 'is published'], era: 4 },
  { year: 'Early 2000s', lines: ['Lean Six Sigma', 'becomes the norm'], era: 4 },
]

function TimelineView({ step }: { step: number }) {
  const n = useNarrow()
  const era = Math.min(step, ERAS.length - 1)
  const visible = EVENTS.filter(e => e.era <= era).length
  const t = { duration: 0.8, ease: EASE }
  const label = `Timeline up to ${ERAS[era].span}: ${EVENTS.filter(e => e.era <= era).map(e => `${e.year} ${e.lines.join(' ')}`).join('; ')}.`

  if (n) {
    const W = 360
    const ax = 180
    const y0 = 84
    const gap = 42
    const H = y0 + (EVENTS.length - 1) * gap + 52
    const yOf = (i: number) => y0 + i * gap
    return (
      <Svg w={W} h={H} label={label}>
        <AnimatePresence mode="wait">
          <motion.g key={era} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
            <text x={W / 2} y={28} textAnchor="middle" fontFamily={DISPLAY} fontSize={17} fontWeight={700} fill={c(ERAS[era].tone)}>{ERAS[era].name}</text>
            <text x={W / 2} y={47} textAnchor="middle" fontSize={12} fill="var(--ink-3)" className="tabular">{ERAS[era].span}</text>
          </motion.g>
        </AnimatePresence>
        <line x1={ax} x2={ax} y1={y0 - 14} y2={yOf(EVENTS.length - 1) + 14} stroke="var(--line)" strokeWidth={3} strokeLinecap="round" />
        {ERAS.map((e, k) => {
          const idx = EVENTS.map((ev, i) => (ev.era === k ? i : -1)).filter(i => i >= 0)
          const a = yOf(idx[0]) - 10
          const b = yOf(idx[idx.length - 1]) + 10
          return (
            <motion.line key={k} x1={ax} x2={ax} y1={a} initial={{ y2: a, opacity: 0 }} animate={{ y2: k <= era ? b : a, opacity: k <= era ? 1 : 0 }} transition={t} stroke={c(e.tone)} strokeWidth={4} strokeLinecap="round" />
          )
        })}
        {EVENTS.map((ev, i) => {
          const left = i % 2 === 0
          const cur = ev.era === era
          const y = yOf(i)
          const tx = left ? ax - 16 : ax + 16
          return (
            <Show key={i} on={i < visible} delay={cur ? (i - EVENTS.findIndex(e => e.era === era)) * 0.12 : 0} dy={0}>
              <circle cx={ax} cy={y} r={cur ? 6 : 4.5} fill={cur ? c(ERAS[ev.era].tone) : 'var(--surface)'} stroke={c(ERAS[ev.era].tone)} strokeWidth={2} />
              <text x={tx} y={y - 6} textAnchor={left ? 'end' : 'start'} fontFamily={DISPLAY} fontSize={14} fontWeight={700} fill={cur ? c(ERAS[ev.era].tone) : 'var(--ink-2)'} className="tabular">{ev.year}</text>
              <text x={tx} y={y + 9} textAnchor={left ? 'end' : 'start'} fontSize={12} fill={cur ? 'var(--ink)' : 'var(--ink-3)'}>
                <tspan x={tx}>{ev.lines[0]}</tspan>
                <tspan x={tx} dy={14}>{ev.lines[1]}</tspan>
              </text>
            </Show>
          )
        })}
      </Svg>
    )
  }

  const W = 760
  const H = 268
  const ay = 176
  const x0 = 64
  const gap = 63.2
  const xOf = (i: number) => x0 + i * gap
  return (
    <Svg w={W} h={H} label={label}>
      <line x1={x0 - 22} x2={xOf(EVENTS.length - 1) + 22} y1={ay} y2={ay} stroke="var(--line)" strokeWidth={3} strokeLinecap="round" />
      {ERAS.map((e, k) => {
        const idx = EVENTS.map((ev, i) => (ev.era === k ? i : -1)).filter(i => i >= 0)
        const a = xOf(idx[0]) - 14
        const b = xOf(idx[idx.length - 1]) + 14
        const on = k <= era
        return (
          <g key={k}>
            <motion.line y1={ay} y2={ay} x1={a} initial={{ x2: a, opacity: 0 }} animate={{ x2: on ? b : a, opacity: on ? 1 : 0 }} transition={t} stroke={c(e.tone)} strokeWidth={4} strokeLinecap="round" />
            <Show on={on}>
              <text x={(a + b) / 2} y={24} textAnchor="middle" fontFamily={DISPLAY} fontSize={13} fontWeight={700} fill={k === era ? c(e.tone) : 'var(--ink-3)'}>{e.name}</text>
              <line x1={a} x2={b} y1={34} y2={34} stroke={c(e.tone)} strokeOpacity={k === era ? 1 : 0.4} strokeWidth={2} strokeLinecap="round" />
            </Show>
          </g>
        )
      })}
      {EVENTS.map((ev, i) => {
        const up = i % 2 === 0
        const cur = ev.era === era
        const x = xOf(i)
        const yy = up ? 80 : 218
        return (
          <Show key={i} on={i < visible} delay={cur ? (i - EVENTS.findIndex(e => e.era === era)) * 0.12 : 0} dy={up ? 8 : -8}>
            <line x1={x} x2={x} y1={up ? ay - 8 : ay + 8} y2={up ? 128 : 204} stroke={c(ERAS[ev.era].tone)} strokeOpacity={cur ? 0.8 : 0.35} strokeWidth={1.5} />
            <circle cx={x} cy={ay} r={cur ? 6.5 : 5} fill={cur ? c(ERAS[ev.era].tone) : 'var(--surface)'} stroke={c(ERAS[ev.era].tone)} strokeWidth={2} />
            <text x={x} y={yy} textAnchor="middle" fontFamily={DISPLAY} fontSize={15} fontWeight={700} fill={cur ? c(ERAS[ev.era].tone) : 'var(--ink-2)'} className="tabular">{ev.year}</text>
            <text x={x} y={yy + 18} textAnchor="middle" fontSize={12.5} fill={cur ? 'var(--ink)' : 'var(--ink-3)'}>
              <tspan x={x}>{ev.lines[0]}</tspan>
              <tspan x={x} dy={15}>{ev.lines[1]}</tspan>
            </text>
          </Show>
        )
      })}
    </Svg>
  )
}

export const timeline: DiagramView = {
  title: 'A century of quality thinking',
  steps: [
    "**Statistical foundations.** Shewhart's control chart (1924) separates routine from special variation; Deming carries the ideas to Japan in 1950, and Juran and Feigenbaum add management and quality cost thinking.",
    "**Japan and the cost of quality.** The [[Toyota Production System]] builds flow and waste elimination from the 1950s to the 1970s, and Crosby's *Quality is Free* (1979) argues that prevention pays for itself.",
    "**Six Sigma is born.** Motorola launches [[Six Sigma]] in 1986 with a defect target of 3.4 DPMO, and wins the first Malcolm Baldrige National Quality Award in 1988.",
    "**Going corporate.** AlliedSignal adopts the method in 1991, and GE's 1995 launch under Jack Welch ties it to executive goals and proves it works in services as well as factories.",
    "**Lean joins in.** Womack and Jones publish *Lean Thinking* in 1996, and by the early 2000s organisations combine speed and flow with variation reduction as **Lean Six Sigma**.",
  ],
  View: TimelineView,
}

/* ------------------------------------------------------------------ */
/* 3. DMAIC                                                            */
/* ------------------------------------------------------------------ */

const PHASES: { k: string; name: string; tone: Tone; outputs: string[] }[] = [
  { k: 'D', name: 'Define', tone: 'violet', outputs: ['Project charter', 'VOC and CTQs', 'High-level process map', 'COPQ estimate', 'Team and roles'] },
  { k: 'M', name: 'Measure', tone: 'sky', outputs: ['Baseline performance', 'Measurement system analysis', 'Process capability'] },
  { k: 'A', name: 'Analyze', tone: 'coral', outputs: ['Potential causes narrowed down', 'Root causes proven with data'] },
  { k: 'I', name: 'Improve', tone: 'amber', outputs: ['Solutions selected', 'Solutions piloted and verified'] },
  { k: 'C', name: 'Control', tone: 'teal', outputs: ['Control plan', 'Handover to the Process Owner', 'Savings verified by Finance'] },
]

function Check({ x, y, tone }: { x: number; y: number; tone: Tone }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={9} fill={soft(tone)} />
      <path d="M-4,0.5 L-1.2,3.2 L4.2,-2.6" fill="none" stroke={c(tone)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

function DmaicView({ step }: { step: number }) {
  const n = useNarrow()
  const W = n ? 360 : 720
  const r = n ? 25 : 40
  const cy = n ? 82 : 104
  const cxOf = (i: number) => (n ? 42 + i * 69 : 104 + i * 128)
  const focus = step === 0 ? -1 : step <= 5 ? step - 1 : 0
  const done = (i: number) => (step === 6 ? i > 0 : i < focus)
  const panelY = n ? 150 : 200
  const ph = focus >= 0 ? PHASES[focus] : null
  const rowH = n ? 30 : 32
  const cols = n ? 1 : 2
  const panelH = n ? 52 + 5 * rowH : 54 + 3 * rowH
  const H = panelY + panelH + 14
  const t = { duration: 0.5, ease: EASE }
  const label = step === 0
    ? 'Five DMAIC phases linked in sequence: Define, Measure, Analyze, Improve, Control.'
    : `${PHASES[focus].name} phase highlighted. Key outputs: ${PHASES[focus].outputs.join(', ')}.`

  return (
    <Svg w={W} h={H} label={label}>
      {/* links */}
      {PHASES.slice(0, -1).map((p, i) => {
        const a = cxOf(i) + r + 6
        const b = cxOf(i + 1) - r - 6
        const lit = step === 6 || i < focus
        return (
          <Show key={p.k} on delay={0.1 + i * 0.1} dy={0}>
            <line x1={a} x2={b - 5} y1={cy} y2={cy} stroke="var(--line-2)" strokeWidth={2} />
            <motion.line x1={a} y1={cy} y2={cy} initial={false} animate={{ x2: lit ? b - 5 : a }} transition={{ duration: 0.6, ease: EASE }} stroke={c(PHASES[i].tone)} strokeWidth={2.5} />
            <path d={`M${b},${cy} l-7,-4.5 v9 z`} fill={lit ? c(PHASES[i].tone) : 'var(--line-2)'} />
          </Show>
        )
      })}

      {/* phases */}
      {PHASES.map((p, i) => {
        const active = i === focus
        const cx = cxOf(i)
        return (
          <Show key={p.k} on delay={i * 0.1}>
            <motion.circle cx={cx} cy={cy} initial={false} animate={{ r: active ? r + 3 : r }} transition={t}
              fill={active ? c(p.tone) : done(i) ? soft(p.tone) : 'var(--surface)'} stroke={c(p.tone)} strokeWidth={active ? 0 : 2} />
            <text x={cx} y={cy + (n ? 7 : 11)} textAnchor="middle" fontFamily={DISPLAY} fontSize={n ? 21 : 32} fontWeight={700} fill={active ? 'var(--surface)' : c(p.tone)}>{p.k}</text>
            <text x={cx} y={cy + r + (n ? 20 : 26)} textAnchor="middle" fontSize={n ? 12 : 14} fontWeight={active ? 700 : 600} fill={active ? 'var(--ink)' : 'var(--ink-2)'}>{p.name}</text>
            {done(i) && !active && <Check x={cx + r * 0.72} y={cy - r * 0.72} tone={p.tone} />}
          </Show>
        )
      })}

      {/* "this course" tag on Define */}
      <Show on delay={0.5}>
        <rect x={cxOf(0) - (n ? 38 : 42)} y={cy - r - (n ? 32 : 36)} width={n ? 76 : 84} height={22} rx={11} fill={soft('violet')} />
        <text x={cxOf(0)} y={cy - r - (n ? 17 : 21)} textAnchor="middle" fontSize={n ? 11.5 : 12} fontWeight={700} fill={c('violet')}>This course</text>
      </Show>

      {/* pointer from focus phase to panel */}
      <motion.g initial={false} animate={{ x: focus >= 0 ? cxOf(focus) : W / 2, opacity: focus >= 0 ? 1 : 0 }} transition={t}>
        <path d={`M0,${panelY - 10} l-9,11 h18 z`} fill="var(--surface-2)" />
      </motion.g>

      {/* outputs panel */}
      <rect x={n ? 8 : 24} y={panelY} width={W - (n ? 16 : 48)} height={panelH} rx={16} fill="var(--surface-2)" stroke="var(--line)" />
      <AnimatePresence mode="wait">
        <motion.g key={step === 6 ? 'back' : String(focus)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
          {ph ? (
            <>
              <text x={n ? 24 : 48} y={panelY + 32} fontFamily={DISPLAY} fontSize={n ? 15 : 17} fontWeight={700} fill={c(ph.tone)}>
                {step === 6 ? 'Back to Define: it sets the direction' : `${ph.name} outputs`}
              </text>
              {ph.outputs.map((o, j) => {
                const col = j % cols
                const row = Math.floor(j / cols)
                const x = (n ? 24 : 48) + col * ((W - 96) / 2)
                const y = panelY + 52 + row * rowH + 12
                return (
                  <motion.g key={o} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: EASE, delay: 0.1 + j * 0.08 }}>
                    <Check x={x + 9} y={y - 4} tone={ph.tone} />
                    <text x={x + 26} y={y + 1} fontSize={n ? 13 : 14} fill="var(--ink)">{o}</text>
                  </motion.g>
                )
              })}
            </>
          ) : (
            <>
              <text x={n ? 24 : 48} y={panelY + 32} fontFamily={DISPLAY} fontSize={n ? 15 : 17} fontWeight={700} fill="var(--ink)">One project, five phases</text>
              {wrap('Each phase ends with a tollgate review: the team shows its outputs before the Champion lets it move on.', n ? 44 : 80).map((l, j) => (
                <text key={j} x={n ? 24 : 48} y={panelY + 58 + j * 20} fontSize={n ? 13 : 14} fill="var(--ink-2)">{l}</text>
              ))}
            </>
          )}
        </motion.g>
      </AnimatePresence>
    </Svg>
  )
}

export const dmaic: DiagramView = {
  title: 'DMAIC: five linked phases',
  steps: [
    "[[DMAIC]] links five phases in a fixed order. This course covers the first one, **Define**, where the project is framed before any data is collected.",
    "**Define** produces the project charter, the customer's voice translated into CTQs, a high-level process map, a COPQ estimate and a named team.",
    "**Measure** establishes the baseline, checks that the measurement system can be trusted, and assesses process capability.",
    "**Analyze** narrows the candidate causes and proves the real root causes with data, not opinion.",
    "**Improve** selects solutions that remove the proven causes and pilots them to verify the gain.",
    "**Control** locks in the gain with a control plan, hands the process to its [[Process Owner]] and has Finance verify the savings.",
    "Back to **Define**: every later phase depends on its outputs. A vague charter or the wrong CTQ sends the whole project in the wrong direction.",
  ],
  View: DmaicView,
}

/* ------------------------------------------------------------------ */
/* 4. Y = f(X)                                                         */
/* ------------------------------------------------------------------ */

const XS: { id: string; name: string; short: string; vital: boolean }[] = [
  { id: '1', name: 'Alarm correlation', short: 'Alarm correlation', vital: true },
  { id: '2', name: 'Engineer skill', short: 'Engineer skill', vital: false },
  { id: '3', name: 'Spare part availability', short: 'Spare parts on hand', vital: true },
  { id: '4', name: 'Handover quality', short: 'Handover quality', vital: false },
]

function Sub({ base, sub, size }: { base: string; sub: string; size: number }) {
  return (
    <>
      <tspan>{base}</tspan>
      <tspan fontSize={size * 0.72} dy={size * 0.28}>{sub}</tspan>
      <tspan dy={-size * 0.28}>{' '}</tspan>
    </>
  )
}

function FlowPath({ d, on, dim, tone, wavy }: { d: string; on: boolean; dim: boolean; tone: Tone | 'ink'; wavy?: boolean }) {
  const reduced = useReduced()
  const stroke = tone === 'ink' ? 'var(--ink-3)' : c(tone)
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeDasharray={wavy ? '3 5' : '6 6'}
      strokeLinecap="round"
      initial={{ opacity: 0, strokeDashoffset: 0 }}
      animate={{ opacity: on ? (dim ? 0.22 : 0.9) : 0, strokeDashoffset: on && !reduced ? -48 : 0 }}
      transition={{
        opacity: { duration: 0.5, ease: EASE },
        strokeDashoffset: on && !reduced ? { duration: 2, ease: 'linear', repeat: Infinity } : { duration: 0 },
      }}
    />
  )
}

function YfxView({ step }: { step: number }) {
  const n = useNarrow()
  const W = n ? 360 : 720
  const H = n ? 420 : 372
  const vitalStep = step >= 4
  // geometry
  const xBox = (i: number) => (n
    ? { x: i % 2 === 0 ? 12 : 198, y: i < 2 ? 22 : 88, w: 150, h: 54 }
    : { x: 20, y: 34 + i * 74, w: 196, h: 56 })
  const proc = n ? { x: 40, y: 190, w: 280, h: 96 } : { x: 292, y: 128, w: 200, h: 110 }
  const noise = n ? { x: 12, y: 330, w: 150, h: 54 } : { x: 292, y: 296, w: 200, h: 56 }
  const yBox = n ? { x: 198, y: 330, w: 150, h: 54 } : { x: 540, y: 150, w: 164, h: 66 }
  const pcx = proc.x + proc.w / 2
  const pcy = proc.y + proc.h / 2

  const inPath = (i: number) => {
    const b = xBox(i)
    if (n) {
      if (i < 2) {
        // top row: run down the gutter between the two columns
        const sx = i === 0 ? b.x + b.w : b.x
        const gx = i === 0 ? 172 : 188
        const sy = b.y + b.h / 2
        return `M${sx},${sy} Q${gx},${sy} ${gx},${sy + 13} L${gx},${proc.y}`
      }
      const sx = b.x + b.w / 2
      const sy = b.y + b.h
      const tx = i === 2 ? 110 : 250
      return `M${sx},${sy} C${sx},${sy + 26} ${tx},${proc.y - 26} ${tx},${proc.y}`
    }
    const sx = b.x + b.w
    const sy = b.y + b.h / 2
    const ty = proc.y + 22 + i * 22
    return `M${sx},${sy} C${sx + 50},${sy} ${proc.x - 50},${ty} ${proc.x},${ty}`
  }
  const outPath = n
    ? `M${pcx + 40},${proc.y + proc.h} C${pcx + 40},${proc.y + proc.h + 20} ${yBox.x + yBox.w / 2},${yBox.y - 20} ${yBox.x + yBox.w / 2},${yBox.y}`
    : `M${proc.x + proc.w},${pcy} L${yBox.x},${pcy}`
  const noisePath = n
    ? `M${noise.x + noise.w / 2},${noise.y} C${noise.x + noise.w / 2},${noise.y - 20} ${pcx - 40},${proc.y + proc.h + 20} ${pcx - 40},${proc.y + proc.h}`
    : `M${pcx},${noise.y} L${pcx},${proc.y + proc.h}`

  const fs = n ? 12.5 : 13.5
  const label = [
    'The output Y: mean time to restore service.',
    'Four inputs X1 to X4 appear: alarm correlation, engineer skill, spare part availability, handover quality.',
    'The inputs flow into the restoration process, which produces Y as a function of the Xs.',
    'A noise input of uncontrolled factors also flows into the process.',
    'The vital few inputs, alarm correlation and spare part availability, are highlighted; the others are dimmed.',
  ][Math.min(step, 4)]

  return (
    <Svg w={W} h={H} label={label}>
      {/* connectors */}
      {XS.map((x, i) => <FlowPath key={x.id} d={inPath(i)} on={step >= 2} dim={vitalStep && !x.vital} tone={vitalStep && x.vital ? 'violet' : 'ink'} />)}
      <FlowPath d={outPath} on={step >= 2} dim={false} tone="teal" />
      <FlowPath d={noisePath} on={step >= 3} dim={false} tone="amber" wavy />

      {/* inputs */}
      {XS.map((x, i) => {
        const b = xBox(i)
        const hl = vitalStep && x.vital
        const dim = vitalStep && !x.vital
        return (
          <Show key={x.id} on={step >= 1} delay={i * 0.1}>
            <motion.g initial={false} animate={{ opacity: dim ? 0.45 : 1 }} transition={{ duration: 0.4 }}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={12} fill={hl ? soft('violet') : 'var(--surface)'} stroke={hl ? c('violet') : 'var(--line-2)'} strokeWidth={hl ? 2 : 1.25} />
              <text x={b.x + 14} y={b.y + 22} fontFamily={DISPLAY} fontSize={fs + 1} fontWeight={700} fill={c('violet')}><Sub base="X" sub={x.id} size={fs + 1} /></text>
              {hl && <text x={b.x + b.w - 12} y={b.y + 21} textAnchor="end" fontSize={11.5} fontWeight={700} fill={c('violet')}>Vital few</text>}
              <text x={b.x + 14} y={b.y + 42} fontSize={fs} fill="var(--ink)">{n ? x.short : x.name}</text>
            </motion.g>
          </Show>
        )
      })}

      {/* process */}
      <Show on={step >= 2}>
        <rect x={proc.x} y={proc.y} width={proc.w} height={proc.h} rx={16} fill="var(--surface-2)" stroke={c('indigo')} strokeWidth={1.5} />
        <text x={pcx} y={proc.y + 28} textAnchor="middle" fontSize={fs} fontWeight={600} fill="var(--ink-2)">Fault restoration process</text>
        <text x={pcx - (n ? 16 : 17) * 0.56 * 10.5} y={proc.y + 58} fontFamily={DISPLAY} fontSize={n ? 16 : 17} fontWeight={700} fill="var(--ink)">
          Y = f(<Sub base="X" sub="1" size={16} />, <Sub base="X" sub="2" size={16} />, <Sub base="X" sub="3" size={16} />, <Sub base="X" sub="4" size={16} />)
        </text>
        <Show on={step >= 3} dy={4}>
          <text x={pcx} y={proc.y + 82} textAnchor="middle" fontFamily={DISPLAY} fontSize={n ? 15 : 16} fontWeight={700} fill={c('amber')}>+ noise</text>
        </Show>
      </Show>

      {/* noise */}
      <Show on={step >= 3}>
        <rect x={noise.x} y={noise.y} width={noise.w} height={noise.h} rx={12} fill={soft('amber')} stroke={c('amber')} strokeWidth={1.25} strokeDasharray="4 4" />
        <text x={noise.x + 14} y={noise.y + 22} fontSize={fs} fontWeight={700} fill={c('amber')}>Noise (uncontrolled)</text>
        <text x={noise.x + 14} y={noise.y + 41} fontSize={fs - 0.5} fill="var(--ink-2)">Weather, fault surges</text>
      </Show>

      {/* output */}
      <Show on>
        <rect x={yBox.x} y={yBox.y} width={yBox.w} height={yBox.h} rx={14} fill={soft('teal')} stroke={c('teal')} strokeWidth={2} />
        <text x={yBox.x + 14} y={yBox.y + (n ? 22 : 26)} fontFamily={DISPLAY} fontSize={n ? 16 : 18} fontWeight={700} fill={c('teal')}>Y</text>
        <text x={yBox.x + 14} y={yBox.y + (n ? 42 : 48)} fontSize={fs} fill="var(--ink)">Mean time to restore</text>
      </Show>

      {/* vital-few note */}
      <Show on={vitalStep}>
        <text x={n ? 12 : yBox.x} y={n ? H - 14 : yBox.y + yBox.h + 30} fontSize={n ? 12 : 12.5} fill="var(--ink-3)">
          {(n ? ['Illustrative model. Analyze tests which Xs really drive Y.'] : ['Illustrative model.', 'Analyze tests which Xs', 'really drive Y.']).map((l, j) => (
            <tspan key={j} x={n ? 12 : yBox.x} dy={j ? 17 : 0}>{l}</tspan>
          ))}
        </text>
      </Show>
    </Svg>
  )
}

export const yfx: DiagramView = {
  title: 'Y = f(X): outputs depend on inputs',
  steps: [
    "Start with the **output (Y)** the customer feels: here, the mean time to restore a broken service, in hours.",
    "List the candidate **inputs (Xs)** that could drive it: alarm correlation, engineer skill, spare part availability and handover quality.",
    "The process turns inputs into output: **Y = f(X)**. To change Y in a lasting way, you have to change the Xs, not just demand a better Y.",
    "Some factors are outside the team's control, such as weather or sudden fault surges. These [[Noise Input|noise inputs]] add variation to Y too.",
    "Analysis usually shows a **vital few** Xs drive most of the change in Y. Here alarm correlation and spare part availability are the [[Critical X|critical Xs]] to improve.",
  ],
  View: YfxView,
}

/* ------------------------------------------------------------------ */
/* 5. Voices                                                           */
/* ------------------------------------------------------------------ */

const VOICES: { k: string; who: string; tone: Tone; title: string; says: string[] }[] = [
  { k: 'VOC', who: 'Customer', tone: 'teal', title: 'Voice of the Customer', says: ['"Fix my line within 24 hours."', '"Tell me when the engineer will arrive."', '"Do not make me call twice."'] },
  { k: 'VOB', who: 'Business', tone: 'violet', title: 'Voice of the Business', says: ['"Keep cost per repair within budget."', '"Pay fewer SLA credits."', '"Keep our business customers."'] },
  { k: 'VOE', who: 'Employee', tone: 'amber', title: 'Voice of the Employee', says: ['"Duplicate alarms bury the real fault."', '"The part I need is never at the depot."', '"I need one screen, not four."'] },
]
const VOP_ROWS: { what: string; gap: string }[] = [
  { what: 'Median fix time: 31 hours', gap: 'VOC wants 24 hours' },
  { what: 'Repair cost: 18% over budget', gap: 'VOB wants it within budget' },
  { what: 'Repeat visits: 1 fault in 5', gap: 'VOE: parts are missing' },
]

function VoicesView({ step }: { step: number }) {
  const n = useNarrow()
  const id = useId().replace(/:/g, '')
  const W = n ? 360 : 720
  const cx = n ? 180 : 210
  const cy = n ? 168 : 200
  const r = n ? 80 : 98
  const d = n ? 46 : 56
  const centers = [-150, -30, 90].map(a => ({ x: cx + d * Math.cos((a * Math.PI) / 180), y: cy + d * Math.sin((a * Math.PI) / 180) }))
  const ring = r + d + (n ? 14 : 18)
  const panel = n ? { x: 12, y: cy + ring + 24, w: 336, h: 190 } : { x: 444, y: 46, w: 260, h: 308 }
  const H = n ? panel.y + panel.h + 10 : 400
  const maxChars = n ? 44 : 32
  const fs = n ? 13 : 13.5

  const labelPos = [-150, -30, 90].map(a => ({ x: cx + (d + r * 0.56) * Math.cos((a * Math.PI) / 180), y: cy + (d + r * 0.56) * Math.sin((a * Math.PI) / 180) }))
  const label = [
    'A project at the centre: faster fault restoration.',
    'Voice of the Customer circle added with customer statements.',
    'Voice of the Business circle added, overlapping the first.',
    'Voice of the Employee circle added, completing three overlapping circles.',
    'The central overlap of all three voices is highlighted.',
    'Voice of the Process ring surrounds the voices, comparing actual performance with what each voice wants.',
  ][Math.min(step, 5)]

  let title = 'The project'
  let tone: Tone | 'ink' = 'ink'
  let lines: { text: string; strong?: boolean; tone?: Tone }[] = [
    { text: 'Faster fault restoration for business customers', strong: true },
    { text: 'Three groups have a stake in it. Who are they, and what do they want?' },
  ]
  if (step >= 1 && step <= 3) {
    const v = VOICES[step - 1]
    title = v.title
    tone = v.tone
    lines = v.says.map(s => ({ text: s }))
  } else if (step === 4) {
    title = 'Where all three agree'
    tone = 'good'
    lines = [
      { text: 'Restore faults right first time.', strong: true },
      { text: 'Customers get service back sooner, the business pays fewer credits, and engineers waste less effort.' },
    ]
  } else if (step >= 5) {
    title = 'Voice of the Process'
    tone = 'sky'
    lines = VOP_ROWS.flatMap(row => [{ text: row.what, strong: true }, { text: row.gap, tone: 'coral' as Tone }])
  }

  return (
    <Svg w={W} h={H} label={label}>
      <defs>
        <clipPath id={`${id}-a`}><circle cx={centers[0].x} cy={centers[0].y} r={r} /></clipPath>
        <clipPath id={`${id}-b`}><circle cx={centers[1].x} cy={centers[1].y} r={r} /></clipPath>
      </defs>

      {/* VOP ring */}
      <Show on={step >= 5} dy={0}>
        <circle cx={cx} cy={cy} r={ring} fill="none" stroke={c('sky')} strokeWidth={2} strokeDasharray="6 6" />
        <rect x={cx - 34} y={cy + ring - 12} width={68} height={24} rx={12} fill={c('sky')} />
        <text x={cx} y={cy + ring + 4.5} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--surface)">VOP</text>
      </Show>

      {/* voice circles */}
      {VOICES.map((v, i) => (
        <Show key={v.k} on={step >= i + 1} dy={0}>
          <circle cx={centers[i].x} cy={centers[i].y} r={r}
            fill={c(v.tone)} fillOpacity={step === i + 1 ? 0.16 : 0.1} stroke={c(v.tone)} strokeWidth={step === i + 1 ? 2.5 : 1.5} />
          <text x={labelPos[i].x} y={labelPos[i].y - 2} textAnchor="middle" fontFamily={DISPLAY} fontSize={n ? 16 : 19} fontWeight={700} fill={c(v.tone)}>{v.k}</text>
          <text x={labelPos[i].x} y={labelPos[i].y + 15} textAnchor="middle" fontSize={n ? 11.5 : 12.5} fill="var(--ink-2)">{v.who}</text>
        </Show>
      ))}

      {/* triple overlap */}
      <Show on={step >= 4} dy={0}>
        <g clipPath={`url(#${id}-a)`}>
          <g clipPath={`url(#${id}-b)`}>
            <circle cx={centers[2].x} cy={centers[2].y} r={r} fill={c('good')} fillOpacity={step === 4 ? 0.42 : 0.28} />
          </g>
        </g>
      </Show>

      {/* project */}
      <Show on>
        <rect x={cx - (n ? 36 : 42)} y={cy - 13} width={n ? 72 : 84} height={26} rx={13} fill="var(--surface)" stroke="var(--ink-2)" strokeWidth={1.25} />
        <text x={cx} y={cy + 4.5} textAnchor="middle" fontSize={n ? 12 : 13} fontWeight={700} fill="var(--ink)">Project</text>
      </Show>

      {/* content panel */}
      <rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} rx={16} fill="var(--surface-2)" stroke="var(--line)" />
      <AnimatePresence mode="wait">
        <motion.g key={Math.min(step, 5)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
          <text x={panel.x + 16} y={panel.y + 30} fontFamily={DISPLAY} fontSize={n ? 15 : 16} fontWeight={700} fill={tone === 'ink' ? 'var(--ink)' : c(tone)}>{title}</text>
          {(() => {
            let y = panel.y + 56
            const tight = step >= 5
            return lines.map((ln, j) => {
              const parts = wrap(ln.text, maxChars)
              const g = (
                <motion.text key={j} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 + j * 0.08, duration: 0.3 }}
                  x={panel.x + 16} y={y} fontSize={fs} fontWeight={ln.strong ? 700 : 400} fill={ln.tone ? c(ln.tone) : ln.strong ? 'var(--ink)' : 'var(--ink-2)'}>
                  {parts.map((p, k) => <tspan key={k} x={panel.x + 16} dy={k ? 18 : 0}>{p}</tspan>)}
                </motion.text>
              )
              y += parts.length * 18 + (tight ? (j % 2 ? (n ? 6 : 14) : 0) : n ? 8 : 12)
              return g
            })
          })()}
        </motion.g>
      </AnimatePresence>
    </Svg>
  )
}

export const voices: DiagramView = {
  title: 'Three voices, one project',
  steps: [
    "Every project sits among people who care about the result. Before choosing a target, listen to each group.",
    "The [[Voice of the Customer]] (VOC) is what the receivers of the output need, often stated in their own vague words.",
    "The [[Voice of the Business]] (VOB) covers cost, revenue, retention, risk and compliance.",
    "The [[Voice of the Employee]] (VOE) comes from the people doing the work. They often know first why the process fails.",
    "**A good project balances all three.** Aim for the overlap: a fix that customers feel, the business values and employees can sustain.",
    "The [[Voice of the Process]] (VOP) is not a person: it is what the process actually delivers, shown by its data. The gap between VOP and the other voices becomes the problem statement.",
  ],
  View: VoicesView,
}

/* ------------------------------------------------------------------ */
/* 6. Roles                                                            */
/* ------------------------------------------------------------------ */

type RoleId = 'sponsor' | 'champion' | 'owner' | 'bb' | 'mbb' | 'gb' | 'team' | 'finance'
const ROLES: { id: RoleId; name: string; sub: string; tone: Tone; does: [string, string] }[] = [
  { id: 'sponsor', name: 'Executive Sponsor', sub: 'Senior leader', tone: 'indigo', does: ['Sets strategic direction and priorities.', 'Funds the programme and reviews its results.'] },
  { id: 'champion', name: 'Champion', sub: 'Senior manager', tone: 'violet', does: ['Selects and scopes projects, signs the charter.', 'Removes barriers and chairs tollgate reviews.'] },
  { id: 'owner', name: 'Process Owner', sub: 'Owns the process', tone: 'teal', does: ['Accountable for the process day to day.', 'Owns the process and control plan after handover.'] },
  { id: 'bb', name: 'Black Belt', sub: 'Full time', tone: 'indigo', does: ['Leads complex, cross-functional projects.', 'Often coaches Green Belts.'] },
  { id: 'mbb', name: 'Master Black Belt', sub: 'Coach, full time', tone: 'coral', does: ['Trains and mentors Belts, reviews their projects.', 'Technical expert who supports Champions.'] },
  { id: 'gb', name: 'Green Belt', sub: 'Part time', tone: 'good', does: ['Leads smaller projects in their own area.', 'Supports Black Belt projects.'] },
  { id: 'team', name: 'Yellow Belts and team', sub: 'Team members', tone: 'amber', does: ['Bring process knowledge and collect data.', 'Test solutions and apply the concepts in their job.'] },
  { id: 'finance', name: 'Finance Representative', sub: 'Validates savings', tone: 'sky', does: ['Independently evaluates hard and soft savings.', 'Estimates in Define, verifies in Control.'] },
]
const ORDER: RoleId[] = ROLES.map(r => r.id)

function RolesView({ step }: { step: number }) {
  const n = useNarrow()
  const W = n ? 360 : 720
  const cur = Math.min(step, ROLES.length - 1)
  const nodeH = n ? 46 : 50
  const pos: Record<RoleId, { x: number; y: number; w: number }> = n
    ? {
        sponsor: { x: 150, y: 16, w: 196 },
        champion: { x: 150, y: 82, w: 196 },
        bb: { x: 150, y: 166, w: 196 },
        gb: { x: 150, y: 232, w: 196 },
        team: { x: 150, y: 298, w: 196 },
        owner: { x: 10, y: 82, w: 126 },
        finance: { x: 10, y: 140, w: 126 },
        mbb: { x: 10, y: 210, w: 126 },
      }
    : {
        sponsor: { x: 265, y: 18, w: 190 },
        champion: { x: 265, y: 96, w: 190 },
        bb: { x: 265, y: 184, w: 190 },
        gb: { x: 265, y: 262, w: 190 },
        team: { x: 265, y: 340, w: 190 },
        mbb: { x: 30, y: 223, w: 190 },
        owner: { x: 496, y: 96, w: 200 },
        finance: { x: 496, y: 184, w: 200 },
      }
  const stripY = (n ? 298 : 340) + nodeH + 20
  const H = stripY + 92
  const shown = (id: RoleId) => ORDER.indexOf(id) <= cur
  const mid = (id: RoleId) => ({ x: pos[id].x + pos[id].w / 2, y: pos[id].y + nodeH / 2 })
  const edge = (a: RoleId, b: RoleId) => {
    const pa = pos[a]
    const pb = pos[b]
    // vertical chain within the centre column
    if (pa.x === pb.x) return `M${mid(a).x},${pa.y + nodeH} L${mid(b).x},${pb.y}`
    const left = pa.x < pb.x
    const sx = left ? pa.x + pa.w : pa.x
    const tx = left ? pb.x : pb.x + pb.w
    const sy = mid(a).y
    const ty = mid(b).y
    const mx = (sx + tx) / 2
    return `M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`
  }
  const EDGES: { a: RoleId; b: RoleId; dashed?: boolean; appear: RoleId }[] = [
    { a: 'sponsor', b: 'champion', appear: 'champion' },
    { a: 'champion', b: 'bb', appear: 'bb' },
    { a: 'bb', b: 'gb', appear: 'gb' },
    { a: 'gb', b: 'team', appear: 'team' },
    { a: 'owner', b: 'champion', dashed: true, appear: 'owner' },
    { a: 'mbb', b: 'bb', dashed: true, appear: 'mbb' },
    { a: 'mbb', b: 'gb', dashed: true, appear: 'gb' },
    { a: 'finance', b: 'bb', dashed: true, appear: 'finance' },
  ]
  const role = ROLES[cur]
  const fs = n ? 12.5 : 14

  return (
    <Svg w={W} h={H} label={`${role.name}: ${role.does.join(' ')}`}>
      {EDGES.map(e => {
        const on = shown(e.appear) && shown(e.a) && shown(e.b)
        return (
          <motion.path key={`${e.a}-${e.b}`} d={edge(e.a, e.b)} fill="none" stroke={e.dashed ? 'var(--ink-3)' : 'var(--line-2)'} strokeWidth={e.dashed ? 1.5 : 2}
            strokeDasharray={e.dashed ? '5 5' : undefined}
            initial={{ opacity: 0 }} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.5, ease: EASE, delay: on ? 0.2 : 0 }} />
        )
      })}
      {ROLES.map(r => {
        const p = pos[r.id]
        const active = r.id === role.id
        const side = !(p.x === pos.sponsor.x)
        return (
          <Show key={r.id} on={shown(r.id)}>
            <motion.rect x={p.x} y={p.y} width={p.w} height={nodeH} rx={12} initial={false}
              animate={{ strokeWidth: active ? 2.5 : 1.25 }} transition={{ duration: 0.3 }}
              fill={active ? soft(r.tone) : 'var(--surface)'} stroke={active ? c(r.tone) : 'var(--line-2)'} strokeDasharray={side && !active ? '4 3' : undefined} />
            <text x={p.x + p.w / 2} y={p.y + (n ? 20 : 22)} textAnchor="middle" fontSize={n && side ? 12 : fs} fontWeight={700} fill={active ? c(r.tone) : 'var(--ink)'}>
              {n && r.id === 'finance' ? 'Finance Rep' : n && r.id === 'mbb' ? 'Master BB' : r.name}
            </text>
            <text x={p.x + p.w / 2} y={p.y + (n ? 37 : 40)} textAnchor="middle" fontSize={n ? 11.5 : 12} fill="var(--ink-3)">{r.sub}</text>
          </Show>
        )
      })}
      {/* "alongside" label for side roles */}
      <Show on={shown('owner')}>
        <text x={n ? 73 : 596} y={n ? 72 : 86} textAnchor="middle" fontSize={11.5} fill="var(--ink-3)">Alongside the project</text>
      </Show>

      {/* responsibilities strip */}
      <rect x={n ? 8 : 24} y={stripY} width={W - (n ? 16 : 48)} height={80} rx={14} fill="var(--surface-2)" stroke="var(--line)" />
      <AnimatePresence mode="wait">
        <motion.g key={role.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease: EASE }}>
          <text x={n ? 22 : 42} y={stripY + 24} fontFamily={DISPLAY} fontSize={n ? 14 : 15} fontWeight={700} fill={c(role.tone)}>{role.name}</text>
          {role.does.map((dline, j) => <text key={j} x={n ? 22 : 42} y={stripY + 46 + j * 19} fontSize={n ? 12 : 13.5} fill="var(--ink-2)">{dline}</text>)}
        </motion.g>
      </AnimatePresence>
    </Svg>
  )
}

export const roles: DiagramView = {
  title: 'Who does what in a Six Sigma project',
  steps: [
    "The [[Executive Sponsor]] sets the strategic direction for the programme, funds it and reviews its results.",
    "The [[Champion]] is the senior manager closest to each project: they select and scope it, sign the charter and remove barriers.",
    "The [[Process Owner]] works alongside the project. They run the process day to day and own it, with its control plan, after handover.",
    "The [[Black Belt]] is a full-time leader of complex, cross-functional projects, working under the Champion.",
    "The [[Master Black Belt]] stands beside the belts as coach: training, mentoring and reviewing their projects.",
    "The [[Green Belt]] leads smaller projects part time in their own area and supports Black Belt projects.",
    "[[Yellow Belt|Yellow Belts]] and other team members bring process knowledge, collect data and test solutions.",
    "The [[Finance Representative]] independently evaluates savings: estimating them in Define and verifying them in Control so the claims are credible.",
  ],
  View: RolesView,
}
