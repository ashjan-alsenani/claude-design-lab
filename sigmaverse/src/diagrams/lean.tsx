import { AnimatePresence, motion } from 'motion/react'
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { DiagramView } from './Diagram'
import { pct } from '../lib/metrics'
import { useDur } from '../lib/motion'

/* ------------------------------------------------------------------ */
/* Shared SVG helpers                                                  */
/* ------------------------------------------------------------------ */

const EASE = [0.23, 1, 0.32, 1] as const
const SANS = 'var(--font-sans)'
const DISPLAY = 'var(--font-display)'
const COLOR_T = 'fill 300ms var(--ease-out), stroke 300ms var(--ease-out), opacity 300ms var(--ease-out)'

/** Switches to the compact layout when the rendered SVG is narrower than `threshold` CSS pixels. */
function useCompact(threshold = 540) {
  const ref = useRef<SVGSVGElement>(null)
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.innerWidth < threshold + 40)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setCompact(e.contentRect.width < threshold))
    ro.observe(el)
    return () => ro.disconnect()
  }, [threshold])
  return [ref, compact] as const
}

function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}

/** Greedy word wrap using an average glyph width estimate. */
function wrap(text: string, maxW: number, size: number): string[] {
  const maxChars = Math.max(6, Math.floor(maxW / (size * 0.54)))
  const out: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxChars && line) { out.push(line); line = word } else line = next
  }
  if (line) out.push(line)
  return out
}

function Lines({ x, y, lines, size = 13, lh, fill = 'var(--ink-2)', weight = 400, anchor = 'start', family = SANS, italic = false }: {
  x: number; y: number; lines: string[]; size?: number; lh?: number; fill?: string; weight?: number
  anchor?: 'start' | 'middle' | 'end'; family?: string; italic?: boolean
}) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor} fontFamily={family} fontStyle={italic ? 'italic' : undefined}>
      {lines.map((l, i) => <tspan key={i} x={x} dy={i === 0 ? 0 : (lh ?? size * 1.38)}>{l}</tspan>)}
    </text>
  )
}

/* ------------------------------------------------------------------ */
/* 1. Batch and queue versus one-piece flow                            */
/* ------------------------------------------------------------------ */

const FLOW_STEPS = ['Check', 'Build', 'Activate']
type Zone = 'entry' | 'b0' | 'q1' | 'b1' | 'q2' | 'b2' | 'exit'
/** Illustrative minutes for one order: [waiting, value-added] per process step. */
const BATCH_TIME = [[40, 10], [40, 10], [40, 10]]
const FLOW_TIME = [[2, 10], [2, 10], [2, 10]]
const timeTotals = (t: number[][]) => ({ lead: t.reduce((s, [w, v]) => s + w + v, 0), va: t.reduce((s, [, v]) => s + v, 0) })
const BATCH = timeTotals(BATCH_TIME)
const FLOW = timeTotals(FLOW_TIME)

const BATCH_UNITS: Zone[] = [...Array(5).fill('entry'), ...Array(5).fill('q1'), 'b1', ...Array(4).fill('q2'), 'exit', 'exit']
const FLOW_UNITS: Zone[] = ['exit', 'exit', 'exit', 'b2', 'b1', 'b0', 'entry']

function LeanFlowView({ step }: { step: number }) {
  const [ref, compact] = useCompact()
  const dur = useDur()
  const W = compact ? 380 : 720
  const e = compact ? 46 : 74
  const bw = compact ? 62 : 120
  const g = compact ? 44 : 80
  const ex = compact ? 46 : 74
  const ox = (W - (e + 3 * bw + 2 * g + ex)) / 2
  const bh = compact ? 50 : 56
  const u = compact ? 9 : 13
  const sp = u + (compact ? 3 : 4)
  const cols = compact ? 2 : 3
  const laneH = compact ? 140 : 146
  const laneGap = compact ? 14 : 18
  const lanes = [compact ? 10 : 14, (compact ? 10 : 14) + laneH + laneGap]
  const legendY = lanes[1] + laneH + (compact ? 22 : 26)
  const H = legendY + (compact ? 56 : 40)

  const zoneX: Record<Zone, number> = {
    entry: ox + e / 2,
    b0: ox + e + bw / 2,
    q1: ox + e + bw + g / 2,
    b1: ox + e + bw + g + bw / 2,
    q2: ox + e + 2 * bw + g + g / 2,
    b2: ox + e + 2 * bw + 2 * g + bw / 2,
    exit: ox + e + 3 * bw + 2 * g + ex / 2,
  }
  const boxX = (i: number) => ox + e + i * (bw + g)
  const floor = (lane: number) => lanes[lane] + 30 + bh

  /** Position of the k-th unit placed in a zone (piles grow upward in a small grid). */
  const slot = (lane: number, zone: Zone, k: number) => {
    if (zone.startsWith('b')) return { x: zoneX[zone], y: floor(lane) - 12 - u / 2 }
    const c = k % cols
    const r = Math.floor(k / cols)
    return { x: zoneX[zone] + (c - (cols - 1) / 2) * sp, y: floor(lane) - 4 - u / 2 - r * sp }
  }
  const place = (lane: number, zones: Zone[]) => {
    const count: Partial<Record<Zone, number>> = {}
    return zones.map(z => { const k = count[z] ?? 0; count[z] = k + 1; return { zone: z, ...slot(lane, z, k) } })
  }
  const batchUnits = place(0, BATCH_UNITS)
  const flowUnits = place(1, FLOW_UNITS)

  const maxBar = W - ox * 2 - (compact ? 64 : 92)
  const scale = maxBar / BATCH.lead

  const timeBar = (lane: number, times: number[][], show: boolean) => {
    const y = floor(lane) + (compact ? 34 : 38)
    let x = ox
    const segs: { x: number; w: number; va: boolean; i: number }[] = []
    times.forEach(([wait, va]) => {
      segs.push({ x, w: wait * scale, va: false, i: segs.length }); x += wait * scale
      segs.push({ x, w: va * scale, va: true, i: segs.length }); x += va * scale
    })
    const total = timeTotals(times)
    return (
      <g>
        <text x={ox} y={y - 8} fontFamily={SANS} fontSize={12} fill="var(--ink-3)">Lead time for one order</text>
        {show && (
          <>
            {segs.map(s => (
              <motion.rect key={s.i} x={s.x} y={y} height={14} fill={s.va ? 'var(--teal)' : 'var(--coral)'} opacity={s.va ? 1 : 0.8}
                initial={{ width: 0 }} animate={{ width: Math.max(0.5, s.w) }} transition={{ duration: dur(0.35), delay: dur(0.2 + s.i * 0.12), ease: EASE }} />
            ))}
            <motion.text x={x + 8} y={y + 11.5} fontFamily={SANS} fontSize={12.5} fontWeight={700} fill="var(--ink)" className="tabular"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur(0.9), duration: dur(0.3) }}>
              {total.lead} min
            </motion.text>
          </>
        )}
      </g>
    )
  }

  const label = [
    `Batch and queue: orders pile up between steps; ${BATCH_UNITS.length} orders in the system.`,
    `Waiting highlighted: lead time ${BATCH.lead} minutes of which ${BATCH.va} are value-added.`,
    `One-piece flow added: lead time ${FLOW.lead} minutes of which ${FLOW.va} are value-added.`,
    `Value-added ratio: batch ${pct(BATCH.va / BATCH.lead, 0)}, flow ${pct(FLOW.va / FLOW.lead, 0)}.`,
  ][step]

  const lane = (li: number, title: string, show: boolean, children: ReactNode) => {
    const top = lanes[li]
    const ratio = li === 0 ? BATCH.va / BATCH.lead : FLOW.va / FLOW.lead
    return (
      <g>
        <rect x={ox - (compact ? 4 : 10)} y={top} width={W - 2 * ox + (compact ? 8 : 20)} height={laneH} rx={16}
          style={{ fill: show ? 'var(--surface)' : 'var(--surface-2)', stroke: show ? 'var(--line-2)' : 'var(--line)', transition: COLOR_T }}
          strokeDasharray={show ? undefined : '5 5'} />
        <text x={ox} y={top + 20} fontFamily={DISPLAY} fontSize={14.5} fontWeight={650} fill={show ? 'var(--ink)' : 'var(--ink-3)'}>{title}</text>
        {step >= 3 && (
          <motion.text x={W - ox} y={top + 21} textAnchor="end" fontFamily={DISPLAY} fontSize={15} fontWeight={700} fill={li === 0 ? 'var(--coral)' : 'var(--teal)'}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur(0.4), delay: dur(0.1 + li * 0.2), ease: EASE }} className="tabular">
            VA ratio {pct(ratio, 0)}
          </motion.text>
        )}
        {FLOW_STEPS.map((name, i) => (
          <g key={name} opacity={show ? 1 : 0.45}>
            <rect x={boxX(i)} y={top + 30} width={bw} height={bh} rx={12} fill="var(--surface-2)" stroke="var(--line-2)" />
            <text x={boxX(i) + bw / 2} y={top + 47} textAnchor="middle" fontFamily={SANS} fontSize={12.5} fontWeight={600} fill="var(--ink-2)">{name}</text>
          </g>
        ))}
        <line x1={ox} x2={W - ox} y1={floor(li)} y2={floor(li)} stroke="var(--line-2)" strokeWidth={1.2} opacity={show ? 1 : 0.4} />
        {children}
      </g>
    )
  }

  const clock = (x: number, y: number) => (
    <g transform={`translate(${x} ${y})`} fill="none" stroke="var(--coral)" strokeWidth={1.6} strokeLinecap="round">
      <circle r={6.5} fill="var(--surface)" />
      <path d="M0 -3.5 V0 L2.5 1.8" />
    </g>
  )

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      {lane(0, 'Batch and queue', true, (
        <g>
          {step >= 1 && (['entry', 'q1', 'q2'] as Zone[]).map((z, k) => {
            const n = BATCH_UNITS.filter(v => v === z).length
            const rows = Math.ceil(n / cols)
            const hw = (cols * sp) / 2 + 6
            return (
              <motion.g key={z} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur(0.35), delay: dur(k * 0.12) }}>
                <rect x={zoneX[z] - hw} y={floor(0) - rows * sp - 10} width={hw * 2} height={rows * sp + 8} rx={8} fill="var(--coral-soft)" stroke="var(--coral)" strokeWidth={1.2} />
                {clock(zoneX[z], floor(0) - rows * sp - 20)}
              </motion.g>
            )
          })}
          {batchUnits.map((p, i) => {
            const batchMove = p.zone === 'q1'
            return (
              <motion.rect key={i} x={-u / 2} y={-u / 2} width={u} height={u} rx={3}
                fill={p.zone === 'exit' ? 'var(--teal)' : 'var(--indigo)'}
                initial={batchMove ? { x: zoneX.b0, y: p.y, opacity: 1 } : { x: p.x, y: p.y - 10, opacity: 0 }}
                animate={{ x: p.x, y: p.y, opacity: 1 }}
                transition={batchMove
                  ? { duration: dur(0.8), delay: dur(0.9), ease: EASE }
                  : { duration: dur(0.35), delay: dur(0.04 * i), ease: EASE }}
              />
            )
          })}
        </g>
      ))}
      {timeBar(0, BATCH_TIME, step >= 1)}

      {lane(1, 'One-piece flow', step >= 2, step >= 2 ? (
        <g>
          {flowUnits.map((p, j) => {
            const path: Zone[] = ['entry', 'b0', 'b1', 'b2', 'exit']
            const end = path.indexOf(p.zone)
            const xs: number[] = []
            for (let k = 0; k <= end; k++) {
              const px = k === end ? p.x : zoneX[path[k]]
              xs.push(px)
              if (k > 0 && k < end) xs.push(px)
            }
            const hops = Math.max(1, end)
            const hop = 0.42
            const times = xs.map((_, k) => (xs.length === 1 ? 1 : k / (xs.length - 1)))
            return (
              <motion.rect key={j} x={-u / 2} y={p.y - u / 2} width={u} height={u} rx={3}
                fill={p.zone === 'exit' ? 'var(--teal)' : 'var(--indigo)'}
                initial={{ x: zoneX.entry, opacity: 0 }}
                animate={{ x: xs.length > 1 ? xs : p.x, opacity: 1 }}
                transition={{ x: { duration: dur(hops * hop), delay: dur(j * hop), times, ease: 'easeInOut' }, opacity: { duration: dur(0.2), delay: dur(j * hop) } }}
              />
            )
          })}
        </g>
      ) : null)}
      {timeBar(1, FLOW_TIME, step >= 2)}

      {/* Legend */}
      <g>
        <rect x={ox} y={legendY - 10} width={14} height={12} rx={3} fill="var(--teal)" />
        <text x={ox + 20} y={legendY} fontFamily={SANS} fontSize={12.5} fill="var(--ink-2)">Value-added time</text>
        <rect x={ox + (compact ? 132 : 160)} y={legendY - 10} width={14} height={12} rx={3} fill="var(--coral)" opacity={0.8} />
        <text x={ox + (compact ? 152 : 180)} y={legendY} fontFamily={SANS} fontSize={12.5} fill="var(--ink-2)">Waiting (non-value-added)</text>
        <Lines x={ox} y={legendY + 20} lines={wrap('Illustrative minutes. Supplementary: VA ratio (process cycle efficiency) = value-added time / lead time.', W - 2 * ox, 12)} size={12} lh={15} fill="var(--ink-3)" />
      </g>
    </svg>
  )
}

export const leanFlow: DiagramView = {
  title: 'Batch and queue versus one-piece flow',
  steps: [
    'In a **batch and queue** process, orders move in groups of five. A finished batch moves on all at once, so piles of work build up in front of every step.',
    `Most of an order's life is **waiting** in those piles. Lead time is ${BATCH.lead} minutes, yet only ${BATCH.va} minutes of it are value-added work (teal).`,
    `In **one-piece flow** each order moves to the next step as soon as it is done. The same ${FLOW.va} minutes of work now take ${FLOW.lead} minutes from start to finish.`,
    `Compare the **value-added ratio**: ${pct(BATCH.va / BATCH.lead, 0)} for batch and queue against ${pct(FLOW.va / FLOW.lead, 0)} for flow. Nobody worked faster; the waiting was removed.`,
  ],
  View: LeanFlowView,
}

/* ------------------------------------------------------------------ */
/* 2. History of Lean                                                  */
/* ------------------------------------------------------------------ */

type Era = 'sky' | 'amber' | 'violet' | 'teal'
const EVENTS: { year: string; title: string; detail: string; era: Era }[] = [
  { year: '1913', title: 'Ford moving line', era: 'sky', detail: 'At Highland Park the car moves past workers doing short, standard tasks. Flow, but at huge volume and low variety.' },
  { year: '1924', title: 'Toyoda automatic loom', era: 'amber', detail: 'Sakichi Toyoda\'s looms stop when a thread breaks (early 1900s); the Type G automatic loom follows in 1924. The root of jidoka.' },
  { year: '1937', title: 'Toyota founded', era: 'amber', detail: 'Kiichiro Toyoda founds Toyota Motor Co. and pushes making only what the next process needs, when it needs it: Just-in-Time.' },
  { year: '1950s', title: 'Ohno builds TPS', era: 'amber', detail: 'Taiichi Ohno builds the Toyota Production System on the shop floor: kanban pull, small batches and the seven wastes.' },
  { year: '1960s', title: 'Shingo: SMED, poka-yoke', era: 'amber', detail: 'Shigeo Shingo develops SMED for quick changeovers and poka-yoke for mistake proofing.' },
  { year: '1973', title: 'Oil crisis', era: 'amber', detail: 'Toyota recovers from the oil crisis faster than most manufacturers, and the world starts studying TPS.' },
  { year: '1988', title: 'Krafcik coins "lean"', era: 'violet', detail: 'MIT researcher John Krafcik uses the word lean to describe Toyota-style production that uses less of everything.' },
  { year: '1990', title: 'The Machine That Changed the World', era: 'violet', detail: 'Womack, Jones and Roos publish the book that makes lean production a mainstream term.' },
  { year: '1996', title: 'Lean Thinking', era: 'violet', detail: 'Womack and Jones set out five principles: value, value stream, flow, pull and perfection.' },
  { year: '2000s', title: 'Services, healthcare, LSS', era: 'teal', detail: 'Lean spreads to offices, hospitals and telecoms, and joins Six Sigma as Lean Six Sigma.' },
]
const ERA_NAMES: { era: Era; label: string }[] = [
  { era: 'sky', label: 'Mass production' },
  { era: 'amber', label: 'Toyota' },
  { era: 'violet', label: 'Named and studied' },
  { era: 'teal', label: 'Everywhere' },
]

function LeanHistoryView({ step }: { step: number }) {
  const [ref, compact] = useCompact()
  const dur = useDur()
  const ev = EVENTS[step]
  const label = `Lean history timeline up to ${ev.year}: ${ev.title}`

  if (compact) {
    const W = 360
    const axisX = 72
    const rowH = 42
    const detailW = W - axisX - 30
    const detailLines = EVENTS.map(e2 => wrap(e2.detail, detailW, 12.5))
    const maxExtra = Math.max(...detailLines.map(l => l.length)) * 17 + 6
    const top = 26
    const H = top + EVENTS.length * rowH + maxExtra + 40
    const rowY = (i: number) => top + i * rowH + (i > step ? detailLines[step].length * 17 + 6 : 0)
    return (
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
        <line x1={axisX} x2={axisX} y1={top - 10} y2={rowY(EVENTS.length - 1) + 10} stroke="var(--line-2)" strokeWidth={2} strokeLinecap="round" />
        <motion.line x1={axisX} x2={axisX} y1={top - 10} initial={false} animate={{ y2: rowY(step) }} stroke="var(--violet)" strokeWidth={2.5} strokeLinecap="round" transition={{ duration: dur(0.5), ease: EASE }} />
        {EVENTS.map((e2, i) => {
          const state = i === step ? 'active' : i < step ? 'done' : 'future'
          return (
            <motion.g key={e2.year} initial={false} animate={{ y: rowY(i), opacity: state === 'future' ? 0.32 : 1 }} transition={{ duration: dur(0.45), ease: EASE }}>
              <text x={axisX - 16} y={5} textAnchor="end" fontFamily={DISPLAY} fontSize={state === 'active' ? 15 : 13.5} fontWeight={700} fill={state === 'future' ? 'var(--ink-3)' : `var(--${e2.era})`} className="tabular">{e2.year}</text>
              {state === 'active' && <circle cx={axisX} cy={0} r={11} fill="none" stroke={`var(--${e2.era})`} strokeWidth={1.5} opacity={0.5} />}
              <circle cx={axisX} cy={0} r={state === 'active' ? 6.5 : 5} style={{ fill: state === 'future' ? 'var(--surface)' : `var(--${e2.era})`, transition: COLOR_T }} stroke={state === 'future' ? 'var(--line-2)' : `var(--${e2.era})`} strokeWidth={1.5} />
              <text x={axisX + 18} y={5} fontFamily={SANS} fontSize={13} fontWeight={state === 'active' ? 700 : 600} fill={state === 'future' ? 'var(--ink-3)' : 'var(--ink)'}>{wrap(e2.title, W - axisX - 30, 13)[0]}{wrap(e2.title, W - axisX - 30, 13).length > 1 ? '...' : ''}</text>
            </motion.g>
          )
        })}
        <AnimatePresence initial={false}>
          <motion.g key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur(0.3), delay: dur(0.2) }}>
            <Lines x={axisX + 18} y={rowY(step) + 24} lines={detailLines[step]} size={12.5} lh={17} fill="var(--ink-2)" />
          </motion.g>
        </AnimatePresence>
        {ERA_NAMES.map((er, k) => (
          <g key={er.era} transform={`translate(${16 + (k % 2) * 170} ${H - 30 + Math.floor(k / 2) * 18})`}>
            <circle cx={5} cy={-4} r={5} fill={`var(--${er.era})`} />
            <text x={16} y={0} fontFamily={SANS} fontSize={12} fill="var(--ink-2)">{er.label}</text>
          </g>
        ))}
      </svg>
    )
  }

  const W = 720
  const H = 420
  const axisY = 168
  const x0 = 64
  const x1 = 656
  const sp = (x1 - x0) / (EVENTS.length - 1)
  const ex = (i: number) => x0 + i * sp

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      {/* Era bands */}
      {ERA_NAMES.map(er => {
        const idx = EVENTS.map((e2, i) => (e2.era === er.era ? i : -1)).filter(i => i >= 0)
        const a = ex(idx[0]) - sp / 2 + 3
        const b = ex(idx[idx.length - 1]) + sp / 2 - 3
        return (
          <g key={er.era}>
            <rect x={a} y={axisY - 4} width={b - a} height={8} rx={4} fill={`var(--${er.era}-soft)`} />
            <text x={(a + b) / 2} y={22} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={600} fill={`var(--${er.era})`}>{er.label}</text>
            <line x1={a} x2={b} y1={30} y2={30} stroke={`var(--${er.era})`} strokeWidth={1.5} opacity={0.5} />
          </g>
        )
      })}
      <motion.line x1={x0 - sp / 2} y1={axisY} y2={axisY} initial={false} animate={{ x2: ex(step) }} stroke="var(--ink-3)" strokeWidth={2} strokeLinecap="round" transition={{ duration: dur(0.5), ease: EASE }} />

      {EVENTS.map((e2, i) => {
        const state = i === step ? 'active' : i < step ? 'done' : 'future'
        const above = i % 2 === 0
        const lines = wrap(e2.title, sp * 2 - 14, 12.5)
        const yearY = above ? 66 : axisY + 60
        return (
          <g key={e2.year}>
            {state !== 'future' && (
              <motion.g initial={{ opacity: 0, y: above ? 6 : -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur(0.4), ease: EASE }}>
                <line x1={ex(i)} x2={ex(i)} y1={above ? yearY + 14 + lines.length * 15 - 6 : axisY + 12} y2={above ? axisY - 12 : yearY - 18} stroke={`var(--${e2.era})`} strokeWidth={1.2} opacity={0.6} />
                <text x={ex(i)} y={yearY} textAnchor="middle" fontFamily={DISPLAY} fontSize={state === 'active' ? 17 : 15} fontWeight={700} fill={`var(--${e2.era})`} className="tabular">{e2.year}</text>
                <Lines x={ex(i)} y={yearY + 17} lines={lines} size={12.5} lh={15} anchor="middle" fill={state === 'active' ? 'var(--ink)' : 'var(--ink-2)'} weight={state === 'active' ? 700 : 500} />
              </motion.g>
            )}
            {state === 'active' && <circle cx={ex(i)} cy={axisY} r={14} fill="none" stroke={`var(--${e2.era})`} strokeWidth={1.5} opacity={0.45} />}
            <circle cx={ex(i)} cy={axisY} r={state === 'active' ? 8 : state === 'done' ? 6 : 4.5}
              style={{ fill: state === 'future' ? 'var(--surface)' : `var(--${e2.era})`, transition: COLOR_T }}
              stroke={state === 'future' ? 'var(--line-2)' : `var(--${e2.era})`} strokeWidth={1.5} />
          </g>
        )
      })}

      {/* Detail band */}
      <rect x={24} y={282} width={672} height={118} rx={18} fill="var(--surface)" stroke="var(--line-2)" />
      <rect x={24} y={282} width={8} height={118} rx={4} fill={`var(--${ev.era})`} opacity={0} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.g key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>
          <text x={48} y={338} fontFamily={DISPLAY} fontSize={34} fontWeight={700} fill={`var(--${ev.era})`} className="tabular">{ev.year}</text>
          <text x={48} y={366} fontFamily={SANS} fontSize={12.5} fontWeight={600} fill="var(--ink-3)">{ERA_NAMES.find(er => er.era === ev.era)?.label}</text>
          <text x={172} y={318} fontFamily={DISPLAY} fontSize={17} fontWeight={650} fill="var(--ink)">{ev.title}</text>
          <Lines x={172} y={342} lines={wrap(ev.detail, 500, 13.5)} size={13.5} lh={19} fill="var(--ink-2)" />
        </motion.g>
      </AnimatePresence>
    </svg>
  )
}

export const leanHistory: DiagramView = {
  title: 'How Lean grew up',
  steps: [
    '**1913:** Henry Ford\'s moving assembly line at Highland Park brings the car to the worker. It proves the power of flow, but relies on huge volumes and little variety.',
    '**Early 1900s to 1924:** Sakichi Toyoda builds looms that stop when a thread breaks, leading to the Type G automatic loom in 1924. Stopping at the first defect becomes [[Jidoka|jidoka]].',
    '**1937:** Kiichiro Toyoda founds Toyota Motor Co. and promotes making only what the next process needs, when it needs it: the seed of [[Just-in-Time]].',
    '**1950s:** Taiichi Ohno builds the Toyota Production System on the shop floor, with kanban pull, small batches and the seven wastes.',
    '**1960s and 1970s:** Shigeo Shingo adds SMED, which cuts changeovers from hours to minutes, and poka-yoke, which makes mistakes hard to make.',
    '**1973:** After the oil crisis Toyota recovers faster than most manufacturers, and the wider world starts paying attention to TPS.',
    '**1988:** MIT researcher John Krafcik coins the word **lean** for Toyota-style production that uses less of every resource.',
    '**1990:** Womack, Jones and Roos publish *The Machine That Changed the World*, which makes lean production a mainstream term.',
    '**1996:** Womack and Jones publish *Lean Thinking* with five principles: value, value stream, flow, pull and perfection.',
    '**2000s:** Lean spreads into services, healthcare and telecoms, and merges with Six Sigma as **Lean Six Sigma**.',
  ],
  View: LeanHistoryView,
}

/* ------------------------------------------------------------------ */
/* 3. Lean versus Six Sigma                                            */
/* ------------------------------------------------------------------ */

/** Illustrative days for one order: value-added and waste segments, before and after Lean. */
const LT_SEGS = [
  { va: true, before: 1, after: 1, name: '' },
  { va: false, before: 3, after: 0.5, name: 'Waiting' },
  { va: true, before: 1, after: 1, name: '' },
  { va: false, before: 2.5, after: 0, name: 'Rework' },
  { va: true, before: 1, after: 1, name: '' },
  { va: false, before: 2.5, after: 0.5, name: 'Handoffs' },
  { va: true, before: 1, after: 1, name: '' },
]
const LT_BEFORE = LT_SEGS.reduce((s, x) => s + x.before, 0)
const LT_AFTER = LT_SEGS.reduce((s, x) => s + x.after, 0)

const COMPARE: { row: string; lean: string; sigma: string }[] = [
  { row: 'Focus', lean: 'Waste, flow and speed', sigma: 'Variation and defects' },
  { row: 'Tools', lean: 'Value stream map, 5S, kanban, standard work', sigma: 'DMAIC, MSA, capability, hypothesis tests, control charts' },
  { row: 'Metrics', lean: 'Lead time, cycle time, WIP, process cycle efficiency', sigma: 'DPMO, sigma level, yield, capability indices' },
]

function normalPath(cx: number, base: number, halfW: number, sigmaPx: number, peak: number, n = 72) {
  const pts: string[] = [`M ${cx - halfW} ${base}`]
  for (let i = 0; i <= n; i++) {
    const x = -halfW + (2 * halfW * i) / n
    const y = base - peak * Math.exp(-(x * x) / (2 * sigmaPx * sigmaPx))
    pts.push(`L ${(cx + x).toFixed(2)} ${y.toFixed(2)}`)
  }
  pts.push(`L ${cx + halfW} ${base} Z`)
  return pts.join(' ')
}

function LeanVsSigmaView({ step }: { step: number }) {
  const [ref, compact] = useCompact()
  const dur = useDur()
  const clip = useSvgId('spec')
  const W = compact ? 380 : 720
  const P1 = compact ? { x: 12, y: 12, w: 356, h: 196 } : { x: 20, y: 16, w: 332, h: 228 }
  const P2 = compact ? { x: 12, y: 222, w: 356, h: 196 } : { x: 368, y: 16, w: 332, h: 228 }
  const M = compact ? { x: 12, y: 434, w: 356, h: 86 } : { x: 20, y: 266, w: 680, h: 84 }
  const H = M.y + M.h + (compact ? 12 : 16)
  const showTable = step >= 5
  const panelFade = showTable ? 0.1 : 1

  // Lean bar
  const bx = P1.x + 18
  const bwFull = P1.w - 36
  const by = P1.y + (compact ? 86 : 100)
  const dayPx = bwFull / LT_BEFORE
  const removed = step >= 1
  let acc = 0
  const segs = LT_SEGS.map((s, i) => {
    const w = (removed ? s.after : s.before) * dayPx
    const r = { ...s, x: bx + acc, w, i }
    acc += w
    return r
  })
  const leadNow = removed ? LT_AFTER : LT_BEFORE

  // Sigma curve
  const cBase = P2.y + P2.h - (compact ? 40 : 46)
  const cx = P2.x + P2.w / 2
  const halfW = P2.w / 2 - 22
  const specHalf = halfW * 0.56
  const narrow = step >= 3
  const sigmaPx = narrow ? specHalf / 3.75 : specHalf / 1.5
  const peakMax = cBase - (P2.y + (compact ? 70 : 78))
  const peak = narrow ? peakMax : peakMax * (1.5 / 3.75)
  const curve = normalPath(cx, cBase, halfW, sigmaPx, peak)
  const showSigma = step >= 2

  // Table
  const tLabelW = compact ? 64 : 92
  const tColW = (P1.x + (compact ? P1.w : P2.x + P2.w - P1.x) - P1.x - tLabelW - 16) / 2
  const tX = P1.x + 8
  const tRows = COMPARE.map(r => ({ ...r, l1: wrap(r.lean, tColW - 14, 12.5), l2: wrap(r.sigma, tColW - 14, 12.5) }))

  const label = [
    `Lean view: lead time ${LT_BEFORE} days, mostly waste.`,
    `Waste removed: lead time ${LT_AFTER} days.`,
    'Six Sigma view: wide distribution spilling outside the specification limits.',
    'Variation reduced: distribution narrow and inside the specification limits.',
    'Lean Six Sigma: faster and more consistent.',
    'Comparison table of focus, tools and metrics for Lean and Six Sigma.',
  ][step]

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          <rect x={P2.x} y={P2.y} width={cx - specHalf - P2.x} height={P2.h} />
          <rect x={cx + specHalf} y={P2.y} width={P2.x + P2.w - cx - specHalf} height={P2.h} />
        </clipPath>
      </defs>

      {/* Lean panel */}
      <motion.g initial={false} animate={{ opacity: panelFade }} transition={{ duration: dur(0.4) }}>
        <rect x={P1.x} y={P1.y} width={P1.w} height={P1.h} rx={18} fill="var(--surface)" stroke={step <= 1 ? 'var(--teal)' : 'var(--line-2)'} strokeWidth={step <= 1 ? 2 : 1} />
        <text x={P1.x + 18} y={P1.y + 30} fontFamily={DISPLAY} fontSize={18} fontWeight={700} fill="var(--teal)">Lean</text>
        <text x={P1.x + 18} y={P1.y + 50} fontFamily={SANS} fontSize={12.5} fill="var(--ink-3)">Removes waste, so lead time shrinks</text>
        {removed && <rect x={bx} y={by - 3} width={LT_BEFORE * dayPx} height={30} rx={6} fill="none" stroke="var(--line-2)" strokeDasharray="4 4" />}
        {segs.map(s => (
          <motion.rect key={s.i} y={by} height={24} rx={s.va ? 4 : 2}
            fill={s.va ? 'var(--teal)' : 'var(--coral-soft)'} stroke={s.va ? 'none' : 'var(--coral)'} strokeWidth={1.2}
            initial={false} animate={{ x: s.x, width: Math.max(0, s.w), opacity: s.w < 0.5 ? 0 : 1 }}
            transition={{ duration: dur(0.8), delay: dur(s.va ? 0 : 0.1 + s.i * 0.08), ease: EASE }} />
        ))}
        {segs.filter(s => s.va).map(s => (
          <motion.text key={`t${s.i}`} y={by + 16} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--surface)"
            initial={false} animate={{ x: s.x + s.w / 2 }} transition={{ duration: dur(0.8), ease: EASE }}>VA</motion.text>
        ))}
        {LT_SEGS.map((s, i) => (!s.va ? (
          <motion.text key={`n${i}`} x={bx + LT_SEGS.slice(0, i).reduce((a, x) => a + x.before, 0) * dayPx + (s.before * dayPx) / 2} y={by + 44}
            textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={600} fill="var(--coral)"
            initial={false} animate={{ opacity: removed ? 0 : 1 }} transition={{ duration: dur(0.3) }}>{s.name}</motion.text>
        ) : null))}
        {/* Lead time bracket */}
        <motion.path initial={false}
          animate={{ d: `M ${bx} ${by + 58} v 8 H ${bx + leadNow * dayPx} v -8` }}
          fill="none" stroke="var(--ink-2)" strokeWidth={1.5} transition={{ duration: dur(0.8), ease: EASE }} />
        <motion.text y={by + 84} fontFamily={SANS} fontSize={13} fontWeight={700} fill="var(--ink)" textAnchor="middle" className="tabular"
          initial={false} animate={{ x: bx + (leadNow * dayPx) / 2 }} transition={{ duration: dur(0.8), ease: EASE }}>
          Lead time {leadNow} days
        </motion.text>
        {removed && (
          <motion.text x={bx + bwFull} y={by + 84} textAnchor="end" fontFamily={SANS} fontSize={12} fill="var(--ink-3)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur(0.6) }}>was {LT_BEFORE}</motion.text>
        )}
        <text x={P1.x + P1.w - 16} y={P1.y + P1.h - 12} textAnchor="end" fontFamily={SANS} fontSize={12} fill="var(--ink-3)">Illustrative</text>
      </motion.g>

      {/* Six Sigma panel */}
      <motion.g initial={false} animate={{ opacity: panelFade }} transition={{ duration: dur(0.4) }}>
        <rect x={P2.x} y={P2.y} width={P2.w} height={P2.h} rx={18}
          style={{ fill: showSigma ? 'var(--surface)' : 'var(--surface-2)', transition: COLOR_T }}
          stroke={step === 2 || step === 3 ? 'var(--violet)' : 'var(--line-2)'} strokeWidth={step === 2 || step === 3 ? 2 : 1} strokeDasharray={showSigma ? undefined : '5 5'} />
        <text x={P2.x + 18} y={P2.y + 30} fontFamily={DISPLAY} fontSize={18} fontWeight={700} fill={showSigma ? 'var(--violet)' : 'var(--ink-3)'}>Six Sigma</text>
        <text x={P2.x + 18} y={P2.y + 50} fontFamily={SANS} fontSize={12.5} fill="var(--ink-3)">Reduces variation, so defects fall</text>
        {showSigma && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur(0.4) }}>
            <motion.path initial={false} animate={{ d: curve }} fill="var(--violet-soft)" stroke="var(--violet)" strokeWidth={1.8} transition={{ duration: dur(0.9), ease: EASE }} />
            <motion.path initial={false} animate={{ d: curve }} fill="var(--coral)" opacity={0.75} clipPath={`url(#${clip})`} transition={{ duration: dur(0.9), ease: EASE }} />
            <line x1={P2.x + 18} x2={P2.x + P2.w - 18} y1={cBase} y2={cBase} stroke="var(--line-2)" strokeWidth={1.5} />
            {[-1, 1].map(sgn => (
              <g key={sgn}>
                <line x1={cx + sgn * specHalf} x2={cx + sgn * specHalf} y1={P2.y + 62} y2={cBase + 6} stroke="var(--ink-2)" strokeWidth={1.5} strokeDasharray="5 4" />
                <text x={cx + sgn * specHalf} y={cBase + 22} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--ink-2)">{sgn < 0 ? 'LSL' : 'USL'}</text>
              </g>
            ))}
            <motion.g initial={false} animate={{ opacity: narrow ? 0 : 1 }} transition={{ duration: dur(0.3) }}>
              <text x={P2.x + P2.w - 22} y={cBase - 26} textAnchor="end" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--coral)">Defects</text>
              <text x={P2.x + 22} y={cBase - 26} fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--coral)">Defects</text>
            </motion.g>
            {narrow && (
              <motion.text x={cx + specHalf + 8} y={P2.y + 80} fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--good)"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur(0.7) }}>Consistent</motion.text>
            )}
          </motion.g>
        )}
      </motion.g>

      {/* Merge */}
      {!compact && step >= 4 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur(0.4) }} fill="none" stroke="var(--indigo)" strokeWidth={1.6} strokeLinecap="round">
          <motion.path d={`M ${P1.x + P1.w / 2} ${P1.y + P1.h} C ${P1.x + P1.w / 2} ${M.y - 4}, ${W / 2 - 40} ${P1.y + P1.h}, ${W / 2 - 20} ${M.y}`}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur(0.6), ease: EASE }} />
          <motion.path d={`M ${P2.x + P2.w / 2} ${P2.y + P2.h} C ${P2.x + P2.w / 2} ${M.y - 4}, ${W / 2 + 40} ${P2.y + P2.h}, ${W / 2 + 20} ${M.y}`}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur(0.6), ease: EASE }} />
        </motion.g>
      )}
      <rect x={M.x} y={M.y} width={M.w} height={M.h} rx={18}
        style={{ fill: step >= 4 ? 'var(--indigo-soft)' : 'var(--surface-2)', stroke: step >= 4 ? 'var(--indigo)' : 'var(--line)', transition: COLOR_T }}
        strokeWidth={step === 4 ? 2 : 1} strokeDasharray={step >= 4 ? undefined : '5 5'} />
      {step >= 4 ? (
        <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur(0.45), delay: dur(0.3), ease: EASE }}>
          <text x={M.x + 20} y={M.y + 36} fontFamily={DISPLAY} fontSize={compact ? 18 : 20} fontWeight={700} fill="var(--indigo)">Lean Six Sigma</text>
          <text x={M.x + 20} y={M.y + 60} fontFamily={SANS} fontSize={13} fill="var(--ink)">
            Faster <tspan fontWeight={800}>AND</tspan> more consistent
          </text>
          {(() => {
            const gx = M.x + M.w - (compact ? 112 : 170)
            const gy = M.y + 30
            return (
              <g>
                {[1, 0.25, 1, 0.25, 1].map((v, k, arr) => {
                  const x = gx + arr.slice(0, k).reduce((a, b) => a + b * 14, 0)
                  return <rect key={k} x={x} y={gy + 14} width={v * 14} height={14} rx={2} fill={k % 2 === 0 ? 'var(--teal)' : 'var(--coral)'} opacity={k % 2 === 0 ? 1 : 0.8} />
                })}
                <path d={normalPath(gx + (compact ? 76 : 100), gy + 30, 24, 6, 26, 30)} fill="var(--violet-soft)" stroke="var(--violet)" strokeWidth={1.5} />
              </g>
            )
          })()}
        </motion.g>
      ) : (
        <text x={M.x + M.w / 2} y={M.y + M.h / 2 + 5} textAnchor="middle" fontFamily={SANS} fontSize={13} fill="var(--ink-3)">Combine both lenses</text>
      )}

      {/* Comparison table over the panels */}
      {showTable && (() => {
        let y = P1.y + 8
        const rows: ReactNode[] = []
        rows.push(
          <g key="h">
            <text x={tX + tLabelW} y={y + 20} fontFamily={DISPLAY} fontSize={15} fontWeight={700} fill="var(--teal)">Lean</text>
            <text x={tX + tLabelW + tColW + 8} y={y + 20} fontFamily={DISPLAY} fontSize={15} fontWeight={700} fill="var(--violet)">Six Sigma</text>
          </g>,
        )
        y += 32
        tRows.forEach((r, k) => {
          const n = Math.max(r.l1.length, r.l2.length)
          const hRow = n * 16.5 + 18
          rows.push(
            <motion.g key={r.row} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur(0.35), delay: dur(0.15 + k * 0.15), ease: EASE }}>
              <rect x={tX - 8} y={y} width={tLabelW + 2 * tColW + 24} height={hRow - 6} rx={12} fill={k % 2 === 0 ? 'var(--surface-2)' : 'var(--surface)'} stroke="var(--line)" />
              <text x={tX + 4} y={y + 21} fontFamily={SANS} fontSize={12.5} fontWeight={700} fill="var(--ink)">{r.row}</text>
              <Lines x={tX + tLabelW} y={y + 21} lines={r.l1} size={12.5} lh={16.5} fill="var(--ink-2)" />
              <Lines x={tX + tLabelW + tColW + 8} y={y + 21} lines={r.l2} size={12.5} lh={16.5} fill="var(--ink-2)" />
            </motion.g>,
          )
          y += hRow
        })
        return <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur(0.3) }}>{rows}</motion.g>
      })()}
    </svg>
  )
}

export const leanVsSigma: DiagramView = {
  title: 'Lean, Six Sigma and Lean Six Sigma',
  steps: [
    '**Lean** looks along the process timeline. Most of the lead time is waste sitting between the value-added steps: waiting, rework and handoffs.',
    `Remove the waste and the same value-added work flows through faster. Lead time falls from ${LT_BEFORE} days to ${LT_AFTER} days (illustrative).`,
    '**Six Sigma** looks at the spread of results. A wide distribution spills outside the specification limits, and every result outside them is a defect.',
    'Find and control the root causes of variation, and the distribution narrows inside the limits. Results become consistent and capable.',
    '**Lean Six Sigma** combines both lenses: remove waste to go faster AND reduce variation to be more consistent. Waste costs time; variation costs predictability.',
    'Side by side: the focus, the typical tools and the typical metrics of each approach.',
  ],
  View: LeanVsSigmaView,
}

/* ------------------------------------------------------------------ */
/* 4. The seven elements of waste                                      */
/* ------------------------------------------------------------------ */

/** Pictograms on a 24 x 24 grid, drawn with one consistent stroke. */
const ICONS: Record<string, ReactNode> = {
  overproduction: (
    <>
      <rect x={2.5} y={14} width={8} height={7.5} rx={1} />
      <rect x={11.5} y={14} width={8} height={7.5} rx={1} />
      <rect x={7} y={6} width={8} height={7.5} rx={1} />
      <path d="M19.5 2.5v6M16.5 5.5h6" />
    </>
  ),
  correction: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.5 3.5v4.5H16" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </>
  ),
  inventory: (
    <>
      <path d="M3 3v18M21 3v18M3 12h18M3 21h18" />
      <rect x={5.5} y={6} width={5} height={5.5} rx={0.8} />
      <rect x={12} y={7.5} width={6} height={4} rx={0.8} />
      <rect x={5.5} y={15} width={6} height={5.5} rx={0.8} />
      <rect x={13} y={15} width={5} height={5.5} rx={0.8} />
    </>
  ),
  motion: (
    <>
      <circle cx={8} cy={4.5} r={2} />
      <path d="M8 8v7l-3 6M8 15l3 6M8 10.5l7-3" />
      <path d="M17.5 3.5c2 1.3 3 3.2 3 5.3M17 12c1.3-.8 2-2 2.2-3.4" />
    </>
  ),
  overprocessing: (
    <>
      <rect x={5} y={2.5} width={14} height={19} rx={1.5} />
      <path d="M8 7h8M8 10.5h5" />
      <circle cx={8.5} cy={16} r={1.8} />
      <circle cx={12.5} cy={16} r={1.8} />
      <circle cx={16.5} cy={16} r={1.8} />
    </>
  ),
  conveyance: (
    <>
      <path d="M1.5 6.5h12v10h-12z" />
      <path d="M13.5 10h4l3.5 3.5v3h-7.5z" />
      <circle cx={6} cy={18.5} r={2} />
      <circle cx={17} cy={18.5} r={2} />
    </>
  ),
  waiting: (
    <>
      <path d="M6 2.5h12M6 21.5h12" />
      <path d="M7 2.5c0 5 5 6.5 5 9.5s-5 4.5-5 9.5M17 2.5c0 5-5 6.5-5 9.5s5 4.5 5 9.5" />
      <path d="M9.5 19.5h5" />
    </>
  ),
  talent: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 2.5a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5v.5h6v-.5c0-.9.2-1.7 1-2.5a6 6 0 0 0-4-10.5z" />
    </>
  ),
}

const WASTES = [
  { key: 'overproduction', name: 'Overproduction', example: 'Printing 2,400 welcome packs for a fibre launch when 1,130 customers sign up.', spot: 'Finished work with no customer order attached.' },
  { key: 'correction', name: 'Correction', example: 'A technician revisits a fault that was closed but not fixed.', spot: 'Words like re-open, re-issue, credit note.' },
  { key: 'inventory', name: 'Inventory', example: '1,874 unprocessed orders sitting in a provisioning backlog.', spot: 'Piles, backlogs, tickets parked in one status.' },
  { key: 'motion', name: 'Motion', example: 'An agent toggles between six systems to answer one billing query.', spot: 'Count reaches, walks and clicks for 15 minutes.' },
  { key: 'overprocessing', name: 'Overprocessing', example: 'Three sign-offs for a $40 refund.', spot: 'Would the customer notice if this step vanished?' },
  { key: 'conveyance', name: 'Conveyance', example: 'A ticket bounced between four resolver groups.', spot: 'Count handoffs in the ticket history.' },
  { key: 'waiting', name: 'Waiting', example: 'An engineer on site waits 40 minutes for remote activation.', spot: 'Status pending, awaiting approval, idle staff.' },
]
const MAPPING: [string, string][] = [['Correction', 'Defects'], ['Conveyance', 'Transportation'], ['Overprocessing', 'Extra-processing']]

function Icon({ k, size, color }: { k: string; size: number; color: string }) {
  return (
    <g transform={`translate(${-size / 2} ${-size / 2}) scale(${size / 24})`} fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
      <g style={{ vectorEffect: 'non-scaling-stroke' }}>{ICONS[k]}</g>
    </g>
  )
}

function WastesView({ step }: { step: number }) {
  const [ref, compact] = useCompact()
  const dur = useDur()
  const final = step >= 7
  const W = compact ? 360 : 720
  const c = compact ? { x: 180, y: 166 } : { x: 236, y: 206 }
  const R = compact ? 110 : 140
  const nr = compact ? 25 : 31
  const cr = compact ? 44 : 58
  const iconSize = compact ? 26 : 32
  const node = (i: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7
    return { x: c.x + R * Math.cos(a), y: c.y + R * Math.sin(a) }
  }
  const eighth = compact ? { x: 38, y: 346 } : { x: 54, y: 440 }
  const cardW = compact ? 336 : 236
  const cardX = compact ? 12 : 468
  const cardY = compact ? (final ? 384 : 324) : 96
  const inner = cardW - 32

  const cardBody = (): { h: number; node: ReactNode } => {
    if (final) {
      const parts: ReactNode[] = []
      parts.push(<text key="t" x={16} y={32} fontFamily={DISPLAY} fontSize={16.5} fontWeight={650} fill="var(--ink)">Same wastes, other names</text>)
      MAPPING.forEach(([a, b], k) => {
        const y = 62 + k * 26
        parts.push(
          <g key={a}>
            <text x={16} y={y} fontFamily={SANS} fontSize={13} fontWeight={700} fill="var(--coral)">{a}</text>
            <text x={compact ? 134 : 124} y={y} fontFamily={SANS} fontSize={13} fill="var(--ink-3)">=</text>
            <text x={compact ? 150 : 138} y={y} fontFamily={SANS} fontSize={13} fill="var(--ink-2)">{b}</text>
          </g>,
        )
      })
      const note = wrap('On the exam, use the seven syllabus names.', inner, 12.5)
      parts.push(<Lines key="n" x={16} y={62 + 3 * 26 + 4} lines={note} size={12.5} lh={16} fill="var(--ink-3)" />)
      return { h: 62 + 3 * 26 + 4 + (note.length - 1) * 16 + 18, node: <>{parts}</> }
    }
    const w = WASTES[step]
    const ex = wrap(w.example, inner, 13)
    const sp = wrap(w.spot, inner, 12.5)
    const y1 = 58
    const y2 = y1 + (ex.length - 1) * 18 + 30
    return {
      h: y2 + (sp.length - 1) * 16 + 20,
      node: (
        <>
          <text x={16} y={32} fontFamily={DISPLAY} fontSize={18} fontWeight={700} fill="var(--coral)">{w.name}</text>
          <text x={cardW - 16} y={32} textAnchor="end" fontFamily={SANS} fontSize={12} fill="var(--ink-3)" className="tabular">{step + 1} of 7</text>
          <Lines x={16} y={y1} lines={ex} size={13} lh={18} fill="var(--ink)" />
          <text x={16} y={y2} fontFamily={SANS} fontSize={12.5} fontWeight={700} fill="var(--ink-2)">Spot it: <tspan fontWeight={400}>{sp[0]}</tspan></text>
          {sp.length > 1 && <Lines x={16} y={y2 + 16} lines={sp.slice(1)} size={12.5} lh={16} fill="var(--ink-2)" />}
        </>
      ),
    }
  }
  const card = cardBody()
  const allCards = [...WASTES.map((_, i) => i)].map(i => {
    const w = WASTES[i]
    return 58 + (wrap(w.example, inner, 13).length - 1) * 18 + 30 + (wrap(w.spot, inner, 12.5).length - 1) * 16 + 20
  })
  const maxCardH = Math.max(...allCards, 170)
  const H = compact ? 384 + maxCardH + 12 : 476
  const cardYWide = c.y - card.h / 2
  const cy = compact ? cardY : cardYWide

  const label = final
    ? 'Seven wastes ring plus a dashed eighth node, Non-Utilized Talent, from the 8-waste DOWNTIME model, not the syllabus list.'
    : `Seven elements of waste around Waste (Muda); ${WASTES[step].name} highlighted. Example: ${WASTES[step].example}`

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      <circle cx={c.x} cy={c.y} r={R} fill="none" stroke="var(--line)" strokeWidth={1.5} />
      {/* Spoke to the active waste */}
      {!final && (
        <motion.line x1={c.x} y1={c.y} initial={false} animate={{ x2: node(step).x, y2: node(step).y }} stroke="var(--coral)" strokeWidth={2} transition={{ duration: dur(0.45), ease: EASE }} />
      )}
      <circle cx={c.x} cy={c.y} r={cr} fill="var(--surface)" stroke="var(--line-2)" strokeWidth={1.5} />
      <text x={c.x} y={c.y - 2} textAnchor="middle" fontFamily={DISPLAY} fontSize={compact ? 16 : 19} fontWeight={700} fill="var(--ink)">Waste</text>
      <text x={c.x} y={c.y + (compact ? 16 : 19)} textAnchor="middle" fontFamily={SANS} fontSize={compact ? 12.5 : 14} fontStyle="italic" fill="var(--ink-2)">(Muda)</text>

      {WASTES.map((w, i) => {
        const p = node(i)
        const state = final ? 'done' : i === step ? 'active' : i < step ? 'done' : 'future'
        return (
          <g key={w.key}>
            <motion.g initial={false} animate={{ scale: state === 'active' ? 1.12 : 1 }} transition={{ duration: dur(0.35), ease: EASE }} style={{ originX: `${p.x}px`, originY: `${p.y}px` }}>
              <circle cx={p.x} cy={p.y} r={nr} strokeWidth={state === 'active' ? 2.2 : 1.4}
                style={{
                  fill: state === 'active' ? 'var(--coral-soft)' : state === 'done' ? 'var(--surface)' : 'var(--surface-2)',
                  stroke: state === 'active' ? 'var(--coral)' : state === 'done' ? 'var(--line-2)' : 'var(--line)',
                  transition: COLOR_T,
                }} />
              <g transform={`translate(${p.x} ${p.y})`} opacity={state === 'future' ? 0.5 : 1}>
                <Icon k={w.key} size={iconSize} color={state === 'active' ? 'var(--coral)' : state === 'done' ? 'var(--ink-2)' : 'var(--ink-3)'} />
              </g>
            </motion.g>
            <text x={p.x} y={p.y + nr + (compact ? 15 : 18)} textAnchor="middle" fontFamily={SANS} fontSize={compact ? 12 : 13} fontWeight={state === 'active' ? 700 : 600}
              fill={state === 'active' ? 'var(--coral)' : state === 'future' ? 'var(--ink-3)' : 'var(--ink)'}>{w.name}</text>
          </g>
        )
      })}

      {/* Eighth waste from the separate 8-waste framework */}
      {final && (
        <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur(0.5), ease: EASE }}>
          <path d={`M ${eighth.x + (compact ? 20 : 24)} ${eighth.y - (compact ? 16 : 20)} Q ${eighth.x + 30} ${c.y + R * 0.75}, ${node(4).x - nr * 0.7} ${node(4).y + nr * 0.7}`} fill="none" stroke="var(--ink-3)" strokeWidth={1.4} strokeDasharray="4 4" />
          <circle cx={eighth.x} cy={eighth.y} r={compact ? 22 : 26} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.6} strokeDasharray="5 4" />
          <g transform={`translate(${eighth.x} ${eighth.y})`}><Icon k="talent" size={compact ? 22 : 26} color="var(--ink-2)" /></g>
          <text x={eighth.x + (compact ? 32 : 38)} y={eighth.y - 4} fontFamily={SANS} fontSize={13} fontWeight={700} fill="var(--ink)">Non-Utilized Talent</text>
          <text x={eighth.x + (compact ? 32 : 38)} y={eighth.y + 13} fontFamily={SANS} fontSize={12} fill="var(--ink-2)">8-waste model (DOWNTIME), not the syllabus list</text>
        </motion.g>
      )}

      {/* Card */}
      <motion.g initial={false} animate={{ x: cardX, y: cy }} transition={{ duration: dur(0.4), ease: EASE }}>
        <motion.rect width={cardW} rx={16} initial={false} animate={{ height: card.h }} transition={{ duration: dur(0.3), ease: EASE }}
          fill="var(--surface)" stroke={final ? 'var(--line-2)' : 'var(--coral)'} strokeWidth={1.5} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.g key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: EASE }}>
            {card.node}
          </motion.g>
        </AnimatePresence>
      </motion.g>
    </svg>
  )
}

export const wastes: DiagramView = {
  title: 'The seven elements of waste',
  steps: [
    '**Overproduction**: making more than is needed, or earlier than needed. Example: printing 2,400 welcome packs when 1,130 customers sign up. Ohno called it the worst waste.',
    '**Correction**: effort spent finding and fixing work that was not right first time. Example: a technician revisits a fault that was closed but not fixed.',
    '**Inventory**: work, information or material held beyond what is needed now. Example: 1,874 unprocessed orders in a provisioning backlog.',
    '**Motion**: unnecessary movement of people within a workstation. Example: an agent toggling between six systems to answer one billing query.',
    '**Overprocessing**: doing more, or higher-grade, work than the customer requires. Example: three sign-offs for a USD 40 refund.',
    '**Conveyance**: moving work or information between places or teams without adding value. Example: a ticket bounced between four resolver groups.',
    '**Waiting**: people or work sit idle until the next input arrives. Example: an engineer on site waits 40 minutes for remote activation.',
    'A separate **8-waste model (DOWNTIME)** adds Non-Utilized Talent and renames three: Correction = Defects, Conveyance = Transportation, Overprocessing = Extra-processing. It is not the syllabus list; use the seven names on the exam.',
  ],
  View: WastesView,
}

/* ------------------------------------------------------------------ */
/* 5. 5S at a service desk                                             */
/* ------------------------------------------------------------------ */

interface Pose { x: number; y: number; r?: number; s?: number }
interface Item { id: string; needed: boolean; poses: Partial<Record<number, Pose>>; draw: ReactNode }

const paper = (
  <g>
    <rect x={-11} y={-15} width={22} height={30} rx={2} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.3} />
    <path d="M-6 -8h12M-6 -3h12M-6 2h8" stroke="var(--line-2)" strokeWidth={1.5} strokeLinecap="round" />
  </g>
)
const headset = (broken: boolean) => (
  <g fill={broken ? 'var(--surface-3)' : 'var(--sky-soft)'} stroke={broken ? 'var(--ink-3)' : 'var(--sky)'} strokeWidth={1.8} strokeLinecap="round">
    {broken
      ? <path d="M-12 4 a12 12 0 0 1 9 -11.6 M3 -8.5 a12 12 0 0 1 9 12.5" fill="none" />
      : <path d="M-12 4 a12 12 0 0 1 24 0" fill="none" />}
    <rect x={-16} y={0} width={7} height={11} rx={3} />
    <rect x={9} y={0} width={7} height={11} rx={3} />
    {!broken && <path d="M-12 10 q2 8 10 7" fill="none" />}
  </g>
)
const redTag = (
  <g transform="translate(10 -16) rotate(12)">
    <path d="M0 0 h14 l4 5 l-4 5 h-14 z" fill="var(--coral)" />
    <circle cx={3.5} cy={5} r={1.5} fill="var(--surface)" />
  </g>
)

const ITEMS: Item[] = [
  { id: 'paperA', needed: true, poses: { 0: { x: 70, y: 182, r: -18 }, 2: { x: 46, y: 174, s: 0.8 } }, draw: paper },
  { id: 'paperB', needed: true, poses: { 0: { x: 118, y: 284, r: 84 }, 2: { x: 53, y: 172, s: 0.8 } }, draw: paper },
  { id: 'paperC', needed: true, poses: { 0: { x: 272, y: 180, r: 14 }, 2: { x: 60, y: 170, s: 0.8 } }, draw: paper },
  {
    id: 'mug', needed: true, poses: { 0: { x: 112, y: 186, r: -8 }, 2: { x: 296, y: 186 } },
    draw: (
      <g fill="var(--violet-soft)" stroke="var(--violet)" strokeWidth={1.6}>
        <rect x={-8} y={-10} width={16} height={20} rx={3} />
        <path d="M8 -5 a5 5 0 0 1 0 10" fill="none" />
      </g>
    ),
  },
  { id: 'headset', needed: true, poses: { 0: { x: 236, y: 184, r: 24 }, 2: { x: 288, y: 58 } }, draw: headset(false) },
  {
    id: 'stapler', needed: true, poses: { 0: { x: 150, y: 189, r: 10 }, 2: { x: 330, y: 42 } },
    draw: (
      <g fill="var(--indigo-soft)" stroke="var(--indigo)" strokeWidth={1.6} strokeLinejoin="round">
        <rect x={-16} y={2} width={32} height={6} rx={3} />
        <path d="M-16 2 L12 -6 L16 -2 L16 2 Z" />
      </g>
    ),
  },
  {
    id: 'scissors', needed: true, poses: { 0: { x: 300, y: 284, r: 30 }, 2: { x: 330, y: 80 } },
    draw: (
      <g fill="none" stroke="var(--ink-2)" strokeWidth={1.8} strokeLinecap="round">
        <circle cx={-10} cy={-5} r={4} />
        <circle cx={-10} cy={5} r={4} />
        <path d="M-6 -3 L14 4 M-6 3 L14 -4" />
      </g>
    ),
  },
  {
    id: 'spares', needed: true, poses: { 0: { x: 152, y: 272, r: -6 }, 2: { x: 82, y: 272 } },
    draw: (
      <g>
        <rect x={-22} y={-18} width={44} height={36} rx={3} fill="var(--amber-soft)" stroke="var(--amber)" strokeWidth={1.6} />
        <path d="M-22 -10 h44" stroke="var(--amber)" strokeWidth={1.4} />
      </g>
    ),
  },
  { id: 'brokenHeadset', needed: false, poses: { 0: { x: 198, y: 282, r: -24 }, 1: { x: 398, y: 256, s: 0.8 } }, draw: headset(true) },
  {
    id: 'oldPhone', needed: false, poses: { 0: { x: 304, y: 186, r: -6 }, 1: { x: 444, y: 254, s: 0.8 } },
    draw: (
      <g fill="var(--surface-3)" stroke="var(--ink-3)" strokeWidth={1.6} strokeLinejoin="round">
        <rect x={-13} y={-3} width={26} height={12} rx={3} />
        <path d="M-15 -4 q0 -6 6 -6 h18 q6 0 6 6 v2 h-6 v-2 h-18 v2 h-6 z" />
      </g>
    ),
  },
  {
    id: 'oldPapers', needed: false, poses: { 0: { x: 84, y: 284 }, 1: { x: 400, y: 283, s: 0.8 } },
    draw: (
      <g fill="var(--amber-soft)" stroke="var(--ink-3)" strokeWidth={1.2}>
        {[0, 1, 2, 3].map(k => <rect key={k} x={-20 + (k % 2) * 3} y={2 - k * 5} width={40} height={5} rx={1} />)}
      </g>
    ),
  },
  {
    id: 'unknownBox', needed: false, poses: { 0: { x: 248, y: 276, r: 8 }, 1: { x: 444, y: 280, s: 0.7 } },
    draw: (
      <g>
        <rect x={-18} y={-15} width={36} height={30} rx={3} fill="var(--surface-3)" stroke="var(--ink-3)" strokeWidth={1.6} />
        <text x={0} y={6} textAnchor="middle" fontFamily={DISPLAY} fontSize={16} fontWeight={700} fill="var(--ink-3)">?</text>
      </g>
    ),
  },
]

const poseAt = (item: Item, step: number): Pose => {
  for (let s = step; s >= 0; s--) { const p = item.poses[s]; if (p) return p }
  return item.poses[0] as Pose
}

const CABLE_TANGLED = 'M 205 196 C 240 204, 262 226, 236 246 C 210 266, 172 246, 188 228 C 204 210, 262 262, 290 276 C 312 286, 330 286, 346 283'
const CABLE_NEAT = 'M 205 196 C 230 199, 300 200, 322 204 C 330 206, 333 212, 333 222 C 333 240, 333 256, 333 268 C 333 278, 338 283, 346 283'

const FIVE_S = [
  { name: 'Before 5S', jp: '', book: '', action: '' },
  { name: 'Sort', jp: 'Seiri', book: 'Sorting', action: 'Red-tag what is not needed for current work, then move it to the red-tag area.' },
  { name: 'Straighten', jp: 'Seiton', book: 'Straightening', action: 'Give every needed item a marked home: shadow board, trays, bundled cables.' },
  { name: 'Shine', jp: 'Seiso', book: 'Shining', action: 'Clean everything, and clean to inspect: the frayed cable shows up.' },
  { name: 'Standardize', jp: 'Seiketsu', book: 'Standardizing', action: 'Labels, colour coding and a daily checklist make the standard visible.' },
  { name: 'Self-Discipline', jp: 'Shitsuke', book: 'Sustaining', action: 'Follow the standard daily; audits track the habit.' },
]
const AUDIT = [52, 63, 71, 78, 86, 92]
const HABIT_MISSES = new Set([2, 9])

function FiveSView({ step }: { step: number }) {
  const [ref, compact] = useCompact()
  const dur = useDur()
  const clip = useSvgId('desk')
  const W = compact ? 360 : 720
  const sc = compact ? 0.7 : 1
  const scene = compact ? { x: 12, y: 12 } : { x: 16, y: 16 }
  const card = compact ? { x: 12, y: 12 + 300 * sc + 12, w: 336, h: 200 } : { x: 512, y: 16, w: 192, h: 300 }
  const H = card.y + card.h + (compact ? 12 : 16)
  const sorted = step >= 1
  const straight = step >= 2
  const shine = step >= 3
  const std = step >= 4
  const sustain = step >= 5
  const neededCount = ITEMS.filter(i => i.needed).length
  const unneededCount = ITEMS.length - neededCount
  const s = FIVE_S[step]

  const label = [
    `Cluttered service desk with ${ITEMS.length} loose items, tangled cables, dirt and unlabeled boxes.`,
    `Sort: ${unneededCount} unneeded items red-tagged and moved to the red-tag area.`,
    'Straighten: tools on a shadow board, papers in trays, cables bundled.',
    'Shine: dirt removed; cleaning reveals a frayed cable.',
    'Standardize: labels, colour-coded trays and a daily checklist.',
    `Self-Discipline: weekly audit score rising from ${AUDIT[0]} to ${AUDIT[AUDIT.length - 1]}, habit calendar filled.`,
  ][step]

  const fade = (show: boolean, delay = 0) => ({ initial: false as const, animate: { opacity: show ? 1 : 0 }, transition: { duration: dur(0.4), delay: show ? dur(delay) : 0 } })

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <clipPath id={clip}><rect width={480} height={300} rx={18} /></clipPath>
      </defs>
      <g transform={`translate(${scene.x} ${scene.y}) scale(${sc})`}>
        <g clipPath={`url(#${clip})`}>
          <rect width={480} height={300} fill="var(--surface)" />
          <rect width={480} height={200} fill="var(--surface-2)" />
          <line x1={0} x2={480} y1={292} y2={292} stroke="var(--line-2)" strokeWidth={1.5} />

          {/* Red-tag area */}
          <motion.g {...fade(sorted)}>
            <rect x={368} y={214} width={102} height={78} rx={10} fill="var(--coral-soft)" stroke="var(--coral)" strokeWidth={1.5} strokeDasharray="5 4" />
            <text x={419} y={234} textAnchor="middle" fontFamily={SANS} fontSize={14} fontWeight={700} fill="var(--coral)">Red-tag area</text>
          </motion.g>

          {/* Checklist board (Standardize) */}
          <motion.g {...fade(std)}>
            <rect x={20} y={20} width={100} height={104} rx={8} fill="var(--surface)" stroke="var(--violet)" strokeWidth={1.6} />
            <text x={32} y={42} fontFamily={SANS} fontSize={14} fontWeight={700} fill="var(--violet)">Daily 5S</text>
            {[0, 1, 2, 3].map(k => (
              <g key={k}>
                <rect x={32} y={54 + k * 17} width={10} height={10} rx={2} fill="none" stroke="var(--ink-3)" strokeWidth={1.3} />
                <rect x={48} y={57 + k * 17} width={56 - (k % 2) * 14} height={4} rx={2} fill="var(--surface-3)" />
                {sustain && (
                  <motion.path d={`M ${33.5} ${59 + k * 17} l 3 3 l 5 -6`} fill="none" stroke="var(--good)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur(0.3), delay: dur(0.3 + k * 0.2) }} />
                )}
              </g>
            ))}
          </motion.g>

          {/* Shadow board (Straighten) */}
          <motion.g {...fade(straight)}>
            <rect x={262} y={20} width={96} height={88} rx={8} fill="var(--surface)" stroke={std ? 'var(--amber)' : 'var(--line-2)'} strokeWidth={1.5} style={{ transition: COLOR_T }} />
            <g opacity={0.55} fill="var(--surface-3)" stroke={std ? 'var(--amber)' : 'var(--ink-3)'} strokeDasharray="3 2" strokeWidth={1.2}>
              <rect x={270} y={46} width={36} height={26} rx={6} />
              <rect x={312} y={34} width={36} height={18} rx={4} />
              <rect x={314} y={70} width={32} height={20} rx={4} />
            </g>
          </motion.g>

          {/* Monitor */}
          <g>
            <rect x={150} y={104} width={110} height={70} rx={6} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.6} />
            <rect x={157} y={111} width={96} height={56} rx={3} fill="var(--sky-soft)" />
            <rect x={199} y={174} width={12} height={16} fill="var(--surface-3)" stroke="var(--ink-3)" strokeWidth={1.2} />
            <rect x={182} y={190} width={46} height={6} rx={2} fill="var(--surface-3)" stroke="var(--ink-3)" strokeWidth={1.2} />
          </g>

          {/* Dirt (gone after Shine) */}
          <motion.g {...fade(!shine)} fill="var(--ink-3)">
            <ellipse cx={108} cy={148} rx={12} ry={6} opacity={0.18} />
            <ellipse cx={176} cy={128} rx={9} ry={5} opacity={0.2} />
            <ellipse cx={186} cy={293} rx={22} ry={4} opacity={0.22} />
            <ellipse cx={272} cy={292} rx={16} ry={3.5} opacity={0.22} />
            <ellipse cx={60} cy={162} rx={7} ry={4} opacity={0.18} />
          </motion.g>

          {/* Desk */}
          <rect x={16} y={196} width={336} height={12} rx={3} fill="var(--surface-3)" stroke="var(--line-2)" />
          <rect x={30} y={208} width={10} height={84} fill="var(--surface-3)" stroke="var(--line-2)" />
          <rect x={328} y={208} width={10} height={84} fill="var(--surface-3)" stroke="var(--line-2)" />

          {/* Cable */}
          <rect x={340} y={274} width={12} height={16} rx={2} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.2} />
          <motion.path initial={false} animate={{ d: straight ? CABLE_NEAT : CABLE_TANGLED }} fill="none" stroke="var(--ink-2)" strokeWidth={2.4} strokeLinecap="round"
            transition={{ duration: dur(0.9), ease: EASE }} />
          <motion.g {...fade(straight, 0.6)} fill="var(--ink-2)">
            <rect x={329} y={228} width={8} height={4} rx={1} />
            <rect x={329} y={258} width={8} height={4} rx={1} />
          </motion.g>

          {/* Floor zone and labels (Standardize) */}
          <motion.g {...fade(std)}>
            <rect x={52} y={246} width={60} height={46} rx={4} fill="none" stroke="var(--amber)" strokeWidth={1.5} strokeDasharray="6 4" />
          </motion.g>

          {/* Items */}
          {ITEMS.map(item => {
            const p = poseAt(item, step)
            const leaving = !item.needed && step === 1
            return (
              <motion.g key={item.id} initial={false}
                animate={{ x: p.x, y: p.y, rotate: p.r ?? 0, scale: p.s ?? 1 }}
                transition={{ duration: dur(0.9), delay: leaving ? dur(1.0) : straight && step === 2 ? dur(0.05 * ITEMS.indexOf(item)) : 0, ease: EASE }}>
                {item.draw}
                {!item.needed && sorted && (
                  <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: dur(0.3), delay: dur(0.2 + ITEMS.indexOf(item) * 0.1) }}>
                    {redTag}
                  </motion.g>
                )}
                {item.id === 'spares' && (
                  <motion.g {...fade(std, 0.2)}>
                    <rect x={-20} y={-6} width={40} height={16} rx={3} fill="var(--surface)" stroke="var(--amber)" />
                    <text x={0} y={6.5} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--amber)">Spares</text>
                  </motion.g>
                )}
              </motion.g>
            )
          })}

          {/* Trays (front faces drawn over the papers) */}
          <motion.g {...fade(straight)}>
            <rect x={30} y={180} width={46} height={16} rx={3} strokeWidth={1.5}
              style={{ fill: std ? 'var(--teal-soft)' : 'var(--surface-3)', stroke: std ? 'var(--teal)' : 'var(--ink-3)', transition: COLOR_T }} />
            <rect x={84} y={180} width={46} height={16} rx={3} strokeWidth={1.5}
              style={{ fill: std ? 'var(--sky-soft)' : 'var(--surface-3)', stroke: std ? 'var(--sky)' : 'var(--ink-3)', transition: COLOR_T }} />
            <motion.g {...fade(std, 0.2)}>
              <text x={53} y={193} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--teal)">In</text>
              <text x={107} y={193} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--sky)">Out</text>
            </motion.g>
          </motion.g>

          {/* Inspection (Shine) */}
          {step === 3 && (
            <g>
              <motion.circle cx={333} cy={246} r={10} fill="none" stroke="var(--amber)" strokeWidth={2.2}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: dur(1.2), duration: dur(0.3) }} />
              <motion.g initial={{ x: 120, y: 180, opacity: 0 }} animate={{ x: 318, y: 232, opacity: 1 }} transition={{ duration: dur(1.1), delay: dur(0.2), ease: EASE }}
                fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round">
                <circle cx={0} cy={0} r={9} fill="var(--surface)" fillOpacity={0.35} />
                <path d="M -6.5 -6.5 L -14 -14" />
              </motion.g>
              <motion.text x={308} y={250} textAnchor="end" fontFamily={SANS} fontSize={14} fontWeight={700} fill="var(--amber)"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur(1.4), duration: dur(0.3) }}>Frayed cable found</motion.text>
            </g>
          )}
        </g>
        <rect width={480} height={300} rx={18} fill="none" stroke="var(--line-2)" />
      </g>

      {/* Stage card */}
      <g transform={`translate(${card.x} ${card.y})`}>
        <rect width={card.w} height={card.h} rx={18} fill="var(--surface)" stroke={step === 0 ? 'var(--line-2)' : 'var(--violet)'} strokeWidth={1.5} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.g key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: EASE }}>
            {step > 0 && (
              <g>
                <circle cx={30} cy={32} r={15} fill="var(--violet)" />
                <text x={30} y={37.5} textAnchor="middle" fontFamily={DISPLAY} fontSize={15} fontWeight={700} fill="var(--surface)">{step}</text>
              </g>
            )}
            <text x={step > 0 ? 54 : 16} y={39} fontFamily={DISPLAY} fontSize={compact ? 19 : 18} fontWeight={700} fill="var(--ink)">{s.name}</text>
            {step === 0 ? (
              <g>
                <Lines x={16} y={70} lines={wrap(`Loose items in the work area: ${ITEMS.length}.`, card.w - 32, 13)} size={13} lh={18} fill="var(--ink)" />
                <Lines x={16} y={compact ? 92 : 112} lines={wrap(`Only ${neededCount} are needed for current work. Clutter hides what matters and slows every search.`, card.w - 32, 13)} size={13} lh={18} fill="var(--ink-2)" />
              </g>
            ) : (
              <g>
                {compact ? (
                  <text x={16} y={70} fontFamily={SANS} fontSize={14} fill="var(--ink)">
                    <tspan fontStyle="italic" fontWeight={600}>{s.jp}</tspan>
                    <tspan fill="var(--ink-3)" fontSize={12.5}>{`   Book label: ${s.book}`}</tspan>
                  </text>
                ) : (
                  <>
                    <text x={16} y={74} fontFamily={SANS} fontSize={15} fontStyle="italic" fontWeight={600} fill="var(--ink)">{s.jp}</text>
                    <text x={16} y={94} fontFamily={SANS} fontSize={12.5} fill="var(--ink-3)">Book label: {s.book}</text>
                  </>
                )}
                {!sustain && <Lines x={16} y={compact ? 96 : 122} lines={wrap(s.action, card.w - 32, 13)} size={13} lh={18} fill="var(--ink-2)" />}
              </g>
            )}
            {sustain && (() => {
              const chart = compact ? { x: 16, y: 86, w: 150, h: 62 } : { x: 16, y: 120, w: 160, h: 62 }
              const cal = compact ? { x: 186, y: 92 } : { x: 16, y: 218 }
              const bwid = chart.w / AUDIT.length
              return (
                <g>
                  <text x={chart.x} y={chart.y - 2} fontFamily={SANS} fontSize={12} fontWeight={600} fill="var(--ink-2)">Weekly audit score</text>
                  {AUDIT.map((v, k) => {
                    const hgt = (v / 100) * chart.h
                    return (
                      <motion.rect key={k} x={chart.x + k * bwid + 3} width={bwid - 6} rx={3} fill={k === AUDIT.length - 1 ? 'var(--good)' : 'var(--teal-soft)'} stroke="var(--teal)" strokeWidth={k === AUDIT.length - 1 ? 0 : 1}
                        initial={{ y: chart.y + 8 + chart.h, height: 0 }} animate={{ y: chart.y + 8 + chart.h - hgt, height: hgt }}
                        transition={{ duration: dur(0.5), delay: dur(0.15 + k * 0.12), ease: EASE }} />
                    )
                  })}
                  <motion.text x={chart.x + chart.w - bwid / 2} y={chart.y + 8 + chart.h - (AUDIT[AUDIT.length - 1] / 100) * chart.h - 5} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--good)" className="tabular"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur(1) }}>{AUDIT[AUDIT.length - 1]}</motion.text>
                  <text x={cal.x} y={cal.y + 4} fontFamily={SANS} fontSize={12} fontWeight={600} fill="var(--ink-2)">Habit calendar</text>
                  {Array.from({ length: 15 }, (_, k) => {
                    const col = k % 5
                    const row = Math.floor(k / 5)
                    const done = !HABIT_MISSES.has(k)
                    return (
                      <motion.rect key={k} x={cal.x + col * 17} y={cal.y + 12 + row * 17} width={13} height={13} rx={3}
                        fill={done ? 'var(--good)' : 'var(--surface-3)'} initial={{ opacity: 0 }} animate={{ opacity: done ? 0.85 : 1 }}
                        transition={{ duration: dur(0.2), delay: dur(0.4 + k * 0.05) }} />
                    )
                  })}
                  <text x={compact ? cal.x : chart.x} y={compact ? cal.y + 80 : cal.y + 76} fontFamily={SANS} fontSize={12} fill="var(--ink-3)">Illustrative</text>
                </g>
              )
            })()}
          </motion.g>
        </AnimatePresence>
        {/* Progress through the five S's */}
        {[1, 2, 3, 4, 5].map(k => {
          const px = 24 + (k - 1) * (compact ? 30 : 30)
          const py = card.h - 22
          const state = k < step ? 'done' : k === step ? 'active' : 'future'
          return (
            <g key={k}>
              <circle cx={px} cy={py} r={10}
                style={{ fill: state === 'done' ? 'var(--violet)' : state === 'active' ? 'var(--violet-soft)' : 'var(--surface-2)', stroke: state === 'future' ? 'var(--line-2)' : 'var(--violet)', transition: COLOR_T }}
                strokeWidth={1.5} />
              {state === 'done'
                ? <path d={`M ${px - 4} ${py} l 3 3 l 5 -6`} fill="none" stroke="var(--surface)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                : <text x={px} y={py + 4} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill={state === 'active' ? 'var(--violet)' : 'var(--ink-3)'}>{k}</text>}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export const fives: DiagramView = {
  title: '5S at a service desk',
  steps: [
    'A shared service desk before 5S: loose papers, tangled cables, spare kit, a broken headset and unlabeled boxes. Finding the right item means searching.',
    '**Sort** (Seiri; the book\'s label is Sorting): red-tag anything not needed for current work, then move it to the red-tag area. Unknown items wait there for a set period before they go.',
    '**Straighten** (Seiton; book label Straightening): a place for everything and everything in its place. Tools get shadow-board homes, papers get trays and cables get bundled.',
    '**Shine** (Seiso; book label Shining): clean everything, and clean to inspect. The dirt disappears, and cleaning reveals a frayed cable before it fails.',
    '**Standardize** (Seiketsu; book label Standardizing): labels, colour-coded trays, a marked floor zone and a daily checklist make the standard visible to anyone.',
    '**Self-Discipline** (Shitsuke; book label Sustaining): the team follows the standard every day, and weekly audits show the score rising as the habit forms.',
  ],
  View: FiveSView,
}
