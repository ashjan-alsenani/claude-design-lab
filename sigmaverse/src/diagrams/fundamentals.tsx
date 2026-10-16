import { AnimatePresence, animate, motion } from 'motion/react'
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import type { DiagramView } from './Diagram'
import { dpmo, dpo, dpu, fmt, pareto, proportionDefective, sigmaFromDpmo, vitalFew } from '../lib/metrics'
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

/** Approximate rendered width of a label (Figtree averages about 0.53em per character). */
const textW = (s: string, size: number) => s.length * size * 0.53

/** Greedy word wrap by approximate character count. */
function wrapText(text: string, max: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const w of text.split(' ')) {
    if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w } else cur = cur ? `${cur} ${w}` : w
  }
  if (cur) out.push(cur)
  return out
}

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

function Chip({ x, y, w, h = 32, text, tone, active, size = 12.5 }: { x: number; y: number; w: number; h?: number; text: string; tone: Tone; active: boolean; size?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={active ? soft(tone) : 'var(--surface)'} stroke={active ? c(tone) : 'var(--line-2)'} strokeWidth={active ? 1.75 : 1.25} />
      <text x={x + w / 2} y={y + h / 2 + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={500} fill="var(--ink)">{text}</text>
    </g>
  )
}

function Arrow({ x1, y1, x2, y2, color = 'var(--ink-3)' }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - 7 * Math.cos(a)
  const hy = y2 - 7 * Math.sin(a)
  const p = (s: number) => `${hx + 4.5 * Math.cos(a + (s * Math.PI) / 2)},${hy + 4.5 * Math.sin(a + (s * Math.PI) / 2)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={1.75} />
      <path d={`M${x2},${y2} L${p(1)} L${p(-1)} Z`} fill={color} />
    </g>
  )
}

function CountUp({ to, digits = 0, on = true }: { to: number; digits?: number; on?: boolean }) {
  const reduced = useReduced()
  const [v, setV] = useState(on && reduced ? to : 0)
  useEffect(() => {
    if (!on) { setV(0); return }
    if (reduced) { setV(to); return }
    const ctrl = animate(0, to, { duration: 1.1, ease: EASE, onUpdate: setV })
    return () => ctrl.stop()
  }, [on, to, reduced])
  return <>{fmt(v, digits)}</>
}

/* ------------------------------------------------------------------ */
/* 1. Process map (high-level SIPOC view)                              */
/* ------------------------------------------------------------------ */

const SUPPLIERS = ['Monitoring system', 'Customers', 'Parts depot']
const INPUTS = ['Alarm', 'Fault report', 'Spare parts', 'Engineers']
const ACTIVITIES = ['Detect and log', 'Classify and prioritise', 'Diagnose the fault', 'Dispatch and repair', 'Verify and close']
const OUTPUTS = ['Service restored', 'Closed ticket', 'Customer update']
const CUSTOMERS = ['Affected customer', 'Service desk', 'SLA reporting']
const START = 'Start: fault detected or reported'
const END = 'End: service restored, ticket closed'
const OWNER = 'Process owner: Network Operations manager'
const NOTE = ['Define needs only this high-level view.', 'Detailed SIPOC and process maps are', 'built in Measure (topic 2.1.2).']

type Col = { key: string; title: string; tone: Tone; items: string[]; at: number }
const COLS: Col[] = [
  { key: 's', title: 'Suppliers', tone: 'indigo', items: SUPPLIERS, at: 1 },
  { key: 'i', title: 'Inputs', tone: 'sky', items: INPUTS, at: 1 },
  { key: 'p', title: 'Process', tone: 'violet', items: ACTIVITIES, at: 2 },
  { key: 'o', title: 'Outputs', tone: 'teal', items: OUTPUTS, at: 3 },
  { key: 'c', title: 'Customers', tone: 'coral', items: CUSTOMERS, at: 4 },
]

function Boundary({ x, y, w, text, kind }: { x: number; y: number; w: number; text: string; kind: 'start' | 'end' }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={30} rx={15} fill={c('violet')} />
      {kind === 'start'
        ? <path d={`M${x + 16},${y + 9} l9,6 l-9,6 z`} fill="var(--surface)" />
        : <rect x={x + 14} y={y + 9} width={11} height={12} rx={2} fill="var(--surface)" />}
      <text x={x + 34} y={y + 19.5} fontSize={12} fontWeight={700} fill="var(--surface)">{text}</text>
    </g>
  )
}

function ProcessMapView({ step }: { step: number }) {
  const n = useNarrow()
  const isNew = (at: number) => step === at
  const label = [
    'Process boundaries: a start trigger and an end point, with the process owner named.',
    'Suppliers and the inputs they provide appear on the left.',
    'Five activities appear inside the boundaries.',
    'Outputs of the process appear.',
    'Customers who receive the outputs appear.',
    'A note says detailed SIPOC belongs to the Measure phase, topic 2.1.2.',
  ][Math.min(step, 5)]

  if (!n) {
    const W = 800
    const fx = 284
    const fw = 200
    const frameTop = 46
    const midY = 201
    const colX: Record<string, { x: number; w: number }> = { s: { x: 10, w: 120 }, i: { x: 150, w: 110 }, o: { x: 508, w: 130 }, c: { x: 662, w: 128 } }
    const H = step >= 5 ? 470 : 470
    return (
      <Svg w={W} h={H} label={label}>
        {/* column headings */}
        {COLS.map(col => {
          const cx = col.key === 'p' ? fx + fw / 2 : colX[col.key].x + colX[col.key].w / 2
          return (
            <Show key={col.key} on={step >= (col.key === 'p' ? 0 : col.at)}>
              <text x={cx} y={30} textAnchor="middle" fontFamily={DISPLAY} fontSize={15} fontWeight={700} fill={c(col.tone)}>{col.title}</text>
            </Show>
          )
        })}

        {/* boundary frame */}
        <Show on>
          <rect x={fx} y={frameTop} width={fw} height={312} rx={18} fill="var(--surface-2)" stroke={c('violet')} strokeWidth={isNew(0) ? 2 : 1.5} strokeDasharray="6 5" />
          <Boundary x={fx + 8} y={frameTop + 10} w={fw - 16} text="Start: fault reported" kind="start" />
          <Boundary x={fx + 8} y={frameTop + 272} w={fw - 16} text="End: service restored" kind="end" />
          <text x={fx + fw / 2} y={frameTop + 336} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="var(--ink-2)">{OWNER}</text>
        </Show>

        {/* activities */}
        {ACTIVITIES.map((a, j) => (
          <Show key={a} on={step >= 2} delay={j * 0.1}>
            <Chip x={fx + 14} y={frameTop + 54 + j * 42} w={fw - 28} h={34} text={a} tone="violet" active={isNew(2)} />
            {j < ACTIVITIES.length - 1 && <Arrow x1={fx + fw / 2} y1={frameTop + 54 + j * 42 + 34} x2={fx + fw / 2} y2={frameTop + 54 + (j + 1) * 42} color="var(--line-2)" />}
          </Show>
        ))}

        {/* side columns */}
        {COLS.filter(col => col.key !== 'p').map(col => {
          const { x, w } = colX[col.key]
          const total = col.items.length * 32 + (col.items.length - 1) * 12
          const y0 = midY - total / 2
          return col.items.map((it, j) => (
            <Show key={col.key + it} on={step >= col.at} delay={j * 0.08 + (col.key === 'i' ? 0.25 : 0)}>
              <Chip x={x} y={y0 + j * 44} w={w} text={it} tone={col.tone} active={isNew(col.at)} />
            </Show>
          ))
        })}

        {/* flow arrows between columns */}
        <Show on={step >= 1}><Arrow x1={134} y1={midY} x2={147} y2={midY} /></Show>
        <Show on={step >= 1}><Arrow x1={264} y1={midY} x2={281} y2={midY} /></Show>
        <Show on={step >= 3}><Arrow x1={488} y1={midY} x2={505} y2={midY} /></Show>
        <Show on={step >= 4}><Arrow x1={642} y1={midY} x2={659} y2={midY} /></Show>

        {/* note */}
        <Show on={step >= 5}>
          <rect x={150} y={400} width={500} height={56} rx={14} fill={soft('amber')} stroke={c('amber')} strokeWidth={1.25} />
          <text x={170} y={423} fontSize={13} fontWeight={700} fill="var(--ink)">{NOTE[0]}</text>
          <text x={170} y={443} fontSize={13} fill="var(--ink-2)">{`${NOTE[1]} ${NOTE[2]}`}</text>
        </Show>
      </Svg>
    )
  }

  // Narrow: a vertical stack, top to bottom.
  const W = 360
  const X0 = 12
  const AW = W - 2 * X0
  const out: ReactNode[] = []
  let y = 8
  const packRow = (col: Col) => {
    out.push(
      <Show key={`${col.key}-h`} on={step >= col.at}>
        <text x={X0} y={y + 16} fontFamily={DISPLAY} fontSize={14} fontWeight={700} fill={c(col.tone)}>{col.title}</text>
      </Show>,
    )
    y += 26
    let x = X0
    col.items.forEach((it, j) => {
      const w = textW(it, 12) + 22
      if (x + w > X0 + AW) { x = X0; y += 38 }
      const cx = x
      const cy = y
      out.push(
        <Show key={col.key + it} on={step >= col.at} delay={j * 0.08}>
          <Chip x={cx} y={cy} w={w} h={30} text={it} tone={col.tone} active={isNew(col.at)} size={12} />
        </Show>,
      )
      x += w + 8
    })
    y += 30
  }
  const down = (at: number) => {
    const yy = y
    out.push(<Show key={`down-${yy}`} on={step >= at}><Arrow x1={W / 2} y1={yy + 4} x2={W / 2} y2={yy + 20} /></Show>)
    y += 24
  }
  packRow(COLS[0])
  down(1)
  packRow(COLS[1])
  down(1)
  // process frame
  const fTop = y
  const fH = 30 + 12 + ACTIVITIES.length * 38 + 4 + 30 + 18
  out.push(
    <Show key="frame" on>
      <rect x={X0} y={fTop} width={AW} height={fH} rx={18} fill="var(--surface-2)" stroke={c('violet')} strokeWidth={isNew(0) ? 2 : 1.5} strokeDasharray="6 5" />
      <Boundary x={X0 + 10} y={fTop + 10} w={AW - 20} text={START} kind="start" />
      <Boundary x={X0 + 10} y={fTop + fH - 40} w={AW - 20} text={END} kind="end" />
    </Show>,
  )
  ACTIVITIES.forEach((a, j) => {
    const ay = fTop + 52 + j * 38
    out.push(
      <Show key={a} on={step >= 2} delay={j * 0.1}>
        <Chip x={X0 + 30} y={ay} w={AW - 60} h={30} text={a} tone="violet" active={isNew(2)} size={12.5} />
      </Show>,
    )
  })
  y = fTop + fH + 8
  out.push(
    <Show key="owner" on>
      <text x={W / 2} y={y + 12} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--ink-2)">{OWNER}</text>
    </Show>,
  )
  y += 18
  down(3)
  packRow(COLS[3])
  down(4)
  packRow(COLS[4])
  y += 14
  const noteY = y
  out.push(
    <Show key="note" on={step >= 5}>
      <rect x={X0} y={noteY} width={AW} height={76} rx={14} fill={soft('amber')} stroke={c('amber')} strokeWidth={1.25} />
      {NOTE.map((l, j) => <text key={j} x={X0 + 14} y={noteY + 24 + j * 19} fontSize={12.5} fontWeight={j === 0 ? 700 : 400} fill={j === 0 ? 'var(--ink)' : 'var(--ink-2)'}>{l}</text>)}
    </Show>,
  )
  const H = noteY + 84
  return <Svg w={W} h={H} label={label}>{out}</Svg>
}

export const processMap: DiagramView = {
  title: 'A process at a glance: telecom fault handling',
  steps: [
    "Start with the [[Process Boundary|boundaries]]. The process starts when a fault is detected or reported and ends when service is restored and the ticket closed. A named owner is accountable for it.",
    "[[Supplier|Suppliers]] provide the **inputs**: monitoring systems raise alarms, customers report faults, the depot supplies parts and engineers supply their time.",
    "Inside the boundaries, a few high-level **activities** turn inputs into outputs. Four to eight steps is enough at this level.",
    "The **outputs** are what the process delivers: restored service, a closed ticket and an update to the customer.",
    "[[Customer|Customers]] receive the outputs. Some are external, like the affected customer; others are internal, like the service desk and SLA reporting.",
    "Define needs only this high-level picture. In this syllabus, the detailed [[SIPOC]] and process maps belong to the Measure phase (topic 2.1.2).",
  ],
  View: ProcessMapView,
}

/* ------------------------------------------------------------------ */
/* 2. CTQ tree                                                         */
/* ------------------------------------------------------------------ */

const BRANCHES: { driver: string; metric: string; spec: string }[] = [
  { driver: 'Speed of answer', metric: 'Queue-to-answer time', spec: '95% answered within 30 s' },
  { driver: 'Time to resolve', metric: 'Fault restoration time', spec: 'Restored within 4 h (USL)' },
  { driver: 'First contact resolution', metric: 'Resolved on first contact', spec: 'At least 80% of faults' },
]
const LEVELS: { name: string; note: string; chip: string; tone: Tone }[] = [
  { name: 'Need', note: 'Vague, in their words', chip: 'Need: vague', tone: 'coral' },
  { name: 'Drivers', note: 'More specific', chip: 'Driver: specific', tone: 'amber' },
  { name: 'CTQs', note: 'Measurable, with a limit', chip: 'CTQ: measurable', tone: 'teal' },
]

function DrawPath({ d, on, delay = 0, color = 'var(--line-2)' }: { d: string; on: boolean; delay?: number; color?: string }) {
  return (
    <motion.path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: on ? delay : 0 }} />
  )
}

function CtqTreeView({ step }: { step: number }) {
  const n = useNarrow()
  const ctqOn = (b: number) => step >= b + 2
  const ctqNew = (b: number) => step === b + 2
  const levels = step >= 5
  const label = [
    'A customer need: I want fast service.',
    'Three drivers branch from the need: speed of answer, time to resolve, first contact resolution.',
    'CTQ for speed of answer: 95% of calls answered within 30 seconds.',
    'CTQ for time to resolve: faults restored within 4 hours.',
    'CTQ for first contact resolution: at least 80% resolved on first contact.',
    'Levels labelled: the need is vague, drivers are more specific, CTQs are measurable with a limit.',
  ][Math.min(step, 5)]

  const NeedBox = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
    <Show on>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={step === 0 ? soft('coral') : 'var(--surface)'} stroke={c('coral')} strokeWidth={step === 0 ? 2 : 1.5} />
      {n
        ? <text x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fontFamily={DISPLAY} fontSize={16} fontWeight={700} fill="var(--ink)">"I want fast service"</text>
        : <text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle" fontFamily={DISPLAY} fontSize={17} fontWeight={700} fill="var(--ink)"><tspan x={x + w / 2}>"I want</tspan><tspan x={x + w / 2} dy={21}>fast service"</tspan></text>}
    </Show>
  )

  if (!n) {
    const W = 760
    const H = 360
    const ys = [92, 196, 300]
    const need = { x: 16, y: 164, w: 168, h: 64 }
    const drv = { x: 234, w: 204, h: 48 }
    const ctq = { x: 484, w: 264, h: 64 }
    const heads = [need.x + need.w / 2, drv.x + drv.w / 2, ctq.x + ctq.w / 2]
    return (
      <Svg w={W} h={H} label={label}>
        {LEVELS.map((lv, i) => (
          <Show key={lv.name} on={i === 0 || (i === 1 ? step >= 1 : step >= 2)}>
            <text x={heads[i]} y={24} textAnchor="middle" fontFamily={DISPLAY} fontSize={15} fontWeight={700} fill={levels ? c(lv.tone) : 'var(--ink-2)'}>{lv.name}</text>
          </Show>
        ))}
        {LEVELS.map((lv, i) => (
          <Show key={lv.note} on={levels} delay={i * 0.12}>
            <text x={heads[i]} y={43} textAnchor="middle" fontSize={12.5} fill="var(--ink-2)">{lv.note}</text>
          </Show>
        ))}
        <Show on={levels} dy={0}>
          <Arrow x1={heads[0] + 74} y1={39} x2={heads[1] - 52} y2={39} color="var(--line-2)" />
          <Arrow x1={heads[1] + 52} y1={39} x2={heads[2] - 82} y2={39} color="var(--line-2)" />
        </Show>

        {BRANCHES.map((b, i) => {
          const y = ys[i]
          const sx = need.x + need.w
          const sy = need.y + need.h / 2
          return (
            <g key={b.driver}>
              <DrawPath d={`M${sx},${sy} C${sx + 36},${sy} ${drv.x - 36},${y} ${drv.x},${y}`} on={step >= 1} delay={i * 0.12} />
              <DrawPath d={`M${drv.x + drv.w},${y} L${ctq.x},${y}`} on={ctqOn(i)} color={c('teal')} />
            </g>
          )
        })}
        <NeedBox {...need} />
        {BRANCHES.map((b, i) => {
          const y = ys[i]
          return (
            <g key={b.metric}>
              <Show on={step >= 1} delay={0.25 + i * 0.12}>
                <rect x={drv.x} y={y - drv.h / 2} width={drv.w} height={drv.h} rx={12} fill={step === 1 ? soft('amber') : 'var(--surface)'} stroke={c('amber')} strokeWidth={step === 1 ? 2 : 1.5} />
                <text x={drv.x + drv.w / 2} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={600} fill="var(--ink)">{b.driver}</text>
              </Show>
              <Show on={ctqOn(i)} delay={0.3}>
                <rect x={ctq.x} y={y - ctq.h / 2} width={ctq.w} height={ctq.h} rx={12} fill={ctqNew(i) ? soft('teal') : 'var(--surface)'} stroke={c('teal')} strokeWidth={ctqNew(i) ? 2 : 1.5} />
                <text x={ctq.x + 14} y={y - 6} fontSize={13.5} fontWeight={700} fill="var(--ink)">{b.metric}</text>
                <text x={ctq.x + 14} y={y + 15} fontSize={13.5} fontWeight={600} fill={c('teal')}>{b.spec}</text>
              </Show>
            </g>
          )
        })}
      </Svg>
    )
  }

  const W = 360
  const need = { x: 12, y: 14, w: 336, h: 48 }
  const trunk = 30
  const yDrv = (b: number) => 84 + b * 124
  const H = levels ? 498 : 452
  return (
    <Svg w={W} h={H} label={label}>
      {BRANCHES.map((b, i) => {
        const dy = yDrv(i) + 20
        const cy = yDrv(i) + 52 + 28
        return (
          <g key={b.driver}>
            <DrawPath d={`M${trunk},${need.y + need.h} L${trunk},${dy} L48,${dy}`} on={step >= 1} delay={i * 0.12} />
            <DrawPath d={`M62,${yDrv(i) + 40} L62,${cy} L76,${cy}`} on={ctqOn(i)} color={c('teal')} />
          </g>
        )
      })}
      <NeedBox {...need} />
      {BRANCHES.map((b, i) => {
        const y = yDrv(i)
        return (
          <g key={b.metric}>
            <Show on={step >= 1} delay={0.25 + i * 0.12}>
              <rect x={48} y={y} width={300} height={40} rx={12} fill={step === 1 ? soft('amber') : 'var(--surface)'} stroke={c('amber')} strokeWidth={step === 1 ? 2 : 1.5} />
              <text x={62} y={y + 25} fontSize={13.5} fontWeight={600} fill="var(--ink)">{b.driver}</text>
            </Show>
            <Show on={ctqOn(i)} delay={0.3}>
              <rect x={76} y={y + 52} width={272} height={56} rx={12} fill={ctqNew(i) ? soft('teal') : 'var(--surface)'} stroke={c('teal')} strokeWidth={ctqNew(i) ? 2 : 1.5} />
              <text x={90} y={y + 75} fontSize={13} fontWeight={700} fill="var(--ink)">{b.metric}</text>
              <text x={90} y={y + 96} fontSize={13} fontWeight={600} fill={c('teal')}>{b.spec}</text>
            </Show>
          </g>
        )
      })}
      <Show on={levels}>
        {(() => {
          let x = 12
          return LEVELS.map(lv => {
            const t = lv.chip
            const w = textW(t, 12) + 20
            const g = (
              <g key={lv.name}>
                <rect x={x} y={460} width={w} height={28} rx={14} fill={soft(lv.tone)} />
                <text x={x + w / 2} y={478} textAnchor="middle" fontSize={12} fontWeight={600} fill={c(lv.tone)}>{t}</text>
              </g>
            )
            x += w + 8
            return g
          })
        })()}
      </Show>
    </Svg>
  )
}

export const ctqTree: DiagramView = {
  title: 'CTQ tree: from a need to a measurable requirement',
  steps: [
    "Start with what the customer says: **\"I want fast service.\"** True, but too vague to measure or improve.",
    "Ask *what does fast mean to you?* Three **drivers** emerge: speed of answer, time to resolve, and resolving it the first time.",
    "Each driver becomes a [[Critical to Quality|CTQ]] with a metric and a limit. Speed of answer: **95% of calls answered within 30 s**.",
    "Time to resolve: **faults restored within 4 h**. Each fault over 4 hours counts as a defect.",
    "First contact resolution: **at least 80% of faults resolved on the first contact**, with no repeat call.",
    "Read the [[CTQ Tree]] left to right: a vague need becomes specific drivers, then measurable CTQs you can count defects against.",
  ],
  View: CtqTreeView,
}

/* ------------------------------------------------------------------ */
/* 3. COPQ iceberg                                                     */
/* ------------------------------------------------------------------ */

type Cat = 'internal' | 'external' | 'appraisal' | 'prevention'
const CATS: { k: Cat; name: string; tone: Tone }[] = [
  { k: 'prevention', name: 'Prevention', tone: 'good' },
  { k: 'appraisal', name: 'Appraisal', tone: 'sky' },
  { k: 'internal', name: 'Internal failure', tone: 'amber' },
  { k: 'external', name: 'External failure', tone: 'bad' },
]
const toneOf = (k: Cat) => CATS.find(x => x.k === k)!.tone
const VISIBLE: { t: string; cat: Cat; side: -1 | 1; row: number }[] = [
  { t: 'Scrap', cat: 'internal', side: -1, row: 0 },
  { t: 'Rework', cat: 'internal', side: -1, row: 1 },
  { t: 'Warranty claims', cat: 'external', side: 1, row: 0 },
  { t: 'SLA credits', cat: 'external', side: 1, row: 1 },
]
const HIDDEN: { t: string; cat: Cat }[] = [
  { t: 'Expediting', cat: 'internal' },
  { t: 'Extra inspection', cat: 'appraisal' },
  { t: 'Overtime', cat: 'internal' },
  { t: 'Lost customers', cat: 'external' },
  { t: 'Management time', cat: 'internal' },
  { t: 'Lost goodwill', cat: 'external' },
]
const TIP: [number, number][] = [[-0.22, 0], [-0.15, -54], [-0.05, -78], [0.02, -64], [0.09, -90], [0.16, -46], [0.22, 0]]
const MASS: [number, number][] = [[-0.22, 0], [-0.55, 36], [-0.85, 108], [-1, 170], [-0.88, 226], [-0.55, 252], [-0.1, 264], [0.4, 252], [0.8, 222], [0.98, 160], [0.82, 92], [0.5, 34], [0.22, 0]]

function IcebergView({ step }: { step: number }) {
  const n = useNarrow()
  const W = n ? 360 : 720
  const cx = W / 2
  const hw = n ? 172 : 250
  const wy = n ? 140 : 150
  const H = wy + 264 + (n ? 84 : 52)
  const pts = (p: [number, number][]) => p.map(([dx, dy], i) => `${i ? 'L' : 'M'}${(cx + dx * hw).toFixed(1)},${(wy + dy).toFixed(1)}`).join('') + 'Z'
  const cats = step >= 3
  const fs = n ? 12 : 13
  const pillH = n ? 26 : 28
  const tipEdge = 0.22 * hw
  const label = [
    'The visible tip of an iceberg: scrap, rework, warranty claims and SLA credits.',
    'A waterline separates costs seen in the accounts from hidden ones.',
    'The hidden mass below: expediting, extra inspection, overtime, lost customers, management time and lost goodwill.',
    'Each cost is coloured by its cost of quality category: prevention, appraisal, internal failure, external failure.',
  ][Math.min(step, 3)]

  const Pill = ({ x, y, t, cat, anchor }: { x: number; y: number; t: string; cat: Cat; anchor: 'start' | 'middle' | 'end' }) => {
    const w = textW(t, fs) + 22
    const left = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2
    const tone = toneOf(cat)
    return (
      <g>
        <rect x={left} y={y - pillH / 2} width={w} height={pillH} rx={pillH / 2} fill={cats ? soft(tone) : 'var(--surface)'} stroke={cats ? c(tone) : 'var(--line-2)'} strokeWidth={cats ? 1.5 : 1.25} />
        <text x={left + w / 2} y={y + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight={600} fill={cats ? c(tone) : 'var(--ink)'}>{t}</text>
      </g>
    )
  }

  return (
    <Svg w={W} h={H} label={label}>
      {/* water */}
      <Show on={step >= 1} dy={0}>
        <rect x={0} y={wy} width={W} height={H - wy} fill={c('sky')} fillOpacity={0.08} />
      </Show>

      {/* hidden mass */}
      <Show on={step >= 2} dy={-10}>
        <path d={pts(MASS)} fill={c('sky')} fillOpacity={0.2} stroke={c('sky')} strokeWidth={1.5} strokeLinejoin="round" />
      </Show>

      {/* tip */}
      <Show on>
        <path d={pts(TIP)} fill="var(--surface)" stroke={c('sky')} strokeWidth={1.75} strokeLinejoin="round" />
        <path d={`M${cx - 0.05 * hw},${wy - 78} L${cx},${wy}`} stroke={c('sky')} strokeOpacity={0.35} strokeWidth={1} />
      </Show>

      {/* waterline */}
      <motion.line x1={0} x2={W} y1={wy} y2={wy} stroke={c('sky')} strokeWidth={2} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: step >= 1 ? 1 : 0, opacity: step >= 1 ? 1 : 0 }} transition={{ duration: 0.8, ease: EASE }} />
      <Show on={step >= 1}>
        <text x={W - 12} y={wy - 10} textAnchor="end" fontSize={fs} fontWeight={600} fill="var(--ink-2)">Seen in the accounts</text>
        <text x={12} y={wy + 22} fontSize={fs} fontWeight={600} fill={c('sky')}>{n ? 'Hidden below' : 'Hidden, rarely measured'}</text>
      </Show>

      {/* visible costs */}
      {VISIBLE.map((v, i) => {
        const y = (n ? 66 : 74) + v.row * (n ? 36 : 40)
        const x = v.side < 0 ? cx - tipEdge - 12 : cx + tipEdge + 12
        return (
          <Show key={v.t} on delay={i * 0.08}>
            <Pill x={x} y={y} t={v.t} cat={v.cat} anchor={v.side < 0 ? 'end' : 'start'} />
          </Show>
        )
      })}

      {/* hidden costs */}
      {HIDDEN.map((h, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = cx + (col ? 1 : -1) * (n ? 0.4 : 0.4) * hw
        const y = wy + (n ? 100 : 80) + row * 50
        return (
          <Show key={h.t} on={step >= 2} delay={0.2 + i * 0.09}>
            <Pill x={x} y={y} t={h.t} cat={h.cat} anchor="middle" />
          </Show>
        )
      })}

      {/* category legend */}
      <Show on={cats}>
        {CATS.map((ct, i) => {
          const cols = n ? 2 : 4
          const cw = (W - 24) / cols
          const wideX = 12 + CATS.slice(0, i).reduce((sum, p) => sum + textW(p.name + (p.k === 'prevention' ? ' (the cure)' : ''), fs) + 48, 0)
          const x = n ? 12 + (i % cols) * cw : wideX
          const y = wy + 264 + 26 + Math.floor(i / cols) * 26
          return (
            <g key={ct.k}>
              <rect x={x} y={y - 10} width={14} height={14} rx={4} fill={soft(ct.tone)} stroke={c(ct.tone)} strokeWidth={1.5} />
              <text x={x + 21} y={y + 1.5} fontSize={fs} fontWeight={600} fill="var(--ink)">{ct.name}{ct.k === 'prevention' ? ' (the cure)' : ''}</text>
            </g>
          )
        })}
      </Show>
    </Svg>
  )
}

export const iceberg: DiagramView = {
  title: 'The cost of poor quality iceberg',
  steps: [
    "Above the water sit the failure costs everyone can see: **scrap, rework, warranty claims and SLA credits**. They show up in reports.",
    "The **waterline** separates what the accounts capture from what they miss. Most of the [[Cost of Poor Quality|cost of poor quality]] lies below it.",
    "Below the surface: expediting, extra inspection, overtime, lost customers, lost goodwill and management time spent firefighting. Often several times the visible tip.",
    "Sort every cost into the four [[Cost of Quality]] categories: prevention, appraisal, internal failure and external failure. Prevention is the investment that shrinks the iceberg.",
  ],
  View: IcebergView,
}

/* ------------------------------------------------------------------ */
/* 4. Pareto chart                                                     */
/* ------------------------------------------------------------------ */

const PARETO_RAW: { label: string; value: number }[] = [
  { label: 'Billing query', value: 156 },
  { label: 'Other', value: 49 },
  { label: 'Router setup', value: 412 },
  { label: 'Account access', value: 61 },
  { label: 'Line fault', value: 287 },
  { label: 'Missed appointment', value: 37 },
  { label: 'Wi-Fi coverage', value: 98 },
]
const SHORT: Record<string, string> = {
  'Billing query': 'Billing', Other: 'Other', 'Router setup': 'Router setup', 'Account access': 'Account',
  'Line fault': 'Line fault', 'Missed appointment': 'Missed appt', 'Wi-Fi coverage': 'Wi-Fi',
}
const P_ROWS = pareto(PARETO_RAW)
const P_VITAL = vitalFew(P_ROWS)
const P_TOTAL = P_ROWS[P_ROWS.length - 1].cumValue
const P_LAST_VITAL = P_VITAL[P_VITAL.length - 1]
const P_BEFORE = P_ROWS[P_VITAL.length - 2]

function ParetoView({ step }: { step: number }) {
  const n = useNarrow()
  const W = n ? 360 : 720
  const L = n ? 46 : 72
  const R = n ? 316 : 648
  const T = n ? 42 : 46
  const B = n ? 238 : 296
  const H = n ? 344 : 370
  const band = (R - L) / P_ROWS.length
  const barW = band * 0.64
  const xc = (i: number) => L + band * (i + 0.5)
  const yL = (v: number) => B - (v / P_TOTAL) * (B - T)
  const yR = (p: number) => B - (p / 100) * (B - T)
  const sorted = step >= 1
  const lineOn = step >= 2
  const vital = step >= 3
  const isVital = (label: string) => P_VITAL.some(r => r.label === label)
  const posOf = (label: string) => (sorted ? P_ROWS.findIndex(r => r.label === label) : PARETO_RAW.findIndex(r => r.label === label))
  const fs = n ? 11 : 12.5
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const linePts = P_ROWS.map((r, i) => [xc(i), yR(r.cumPercent)] as const)
  const lineD = linePts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  const k = P_VITAL.length - 1
  const prev = P_BEFORE ? P_BEFORE.cumPercent : 0
  const prevX = P_BEFORE ? xc(k - 1) : L
  const crossX = prevX + ((80 - prev) / (P_LAST_VITAL.cumPercent - prev)) * (xc(k) - prevX)
  const y80 = yR(80)
  const footer = [
    'Unsorted, it is hard to see what matters most.',
    'Sorted largest first. Other stays last, whatever its size.',
    `The cumulative line climbs steeply, then flattens, ending at ${fmt(P_ROWS[P_ROWS.length - 1].cumPercent, 0)}%.`,
    `Vital few: ${P_VITAL.length} of ${P_ROWS.length} categories, ${fmt(P_LAST_VITAL.cumPercent, 1)}% of contacts.`,
  ][Math.min(step, 3)]
  const label = [
    `Bar chart of ${P_ROWS.length} complaint categories in no particular order, out of ${fmt(P_TOTAL, 0)} contacts.`,
    `Bars sorted in descending order: ${P_ROWS.map(r => `${r.label} ${r.value}`).join(', ')}.`,
    `Cumulative percentage line: ${P_ROWS.map(r => `${fmt(r.cumPercent, 1)}%`).join(', ')}.`,
    `80% reference line; vital few highlighted: ${P_VITAL.map(r => r.label).join(', ')}.`,
  ][Math.min(step, 3)]

  return (
    <Svg w={W} h={H} label={label}>
      {/* grid and axes */}
      {ticks.map(f => (
        <g key={f}>
          <line x1={L} x2={R} y1={yL(f * P_TOTAL)} y2={yL(f * P_TOTAL)} stroke="var(--line)" strokeWidth={1} />
          <line x1={L - 5} x2={L} y1={yL(f * P_TOTAL)} y2={yL(f * P_TOTAL)} stroke="var(--ink-3)" strokeWidth={1.25} />
          <text x={L - 9} y={yL(f * P_TOTAL) + 4} textAnchor="end" fontSize={fs} fill="var(--ink-2)" className="tabular">{fmt(f * P_TOTAL, 0)}</text>
        </g>
      ))}
      <line x1={L} x2={L} y1={T} y2={B} stroke="var(--ink-3)" strokeWidth={1.25} />
      <line x1={L} x2={R} y1={B} y2={B} stroke="var(--ink-3)" strokeWidth={1.25} />
      <text x={n ? 4 : 16} y={T - 24} fontSize={fs} fontWeight={700} fill="var(--ink-2)">Contacts</text>

      <Show on={lineOn} dy={0}>
        <line x1={R} x2={R} y1={T} y2={B} stroke={c('coral')} strokeWidth={1.25} />
        {ticks.map(f => (
          <g key={f}>
            <line x1={R} x2={R + 5} y1={yR(f * 100)} y2={yR(f * 100)} stroke={c('coral')} strokeWidth={1.25} />
            <text x={R + 9} y={yR(f * 100) + 4} fontSize={fs} fill={c('coral')} className="tabular">{fmt(f * 100, 0)}%</text>
          </g>
        ))}
        <text x={W - 4} y={T - 24} textAnchor="end" fontSize={fs} fontWeight={700} fill={c('coral')}>Cumulative %</text>
      </Show>

      {/* bars */}
      {PARETO_RAW.map((r, i) => {
        const other = r.label === 'Other'
        const hl = vital && isVital(r.label)
        const fill = vital ? (hl ? c('teal') : 'var(--surface-3)') : other ? 'var(--ink-3)' : c('teal')
        const y = yL(r.value)
        return (
          <motion.g key={r.label} initial={{ x: xc(i), opacity: 0 }} animate={{ x: xc(posOf(r.label)), opacity: 1 }}
            transition={{ x: { duration: 0.9, ease: EASE, delay: sorted ? 0.05 * i : 0 }, opacity: { duration: 0.4, delay: i * 0.06 } }}>
            <motion.rect x={-barW / 2} width={barW} rx={4} initial={{ y: B, height: 0 }} animate={{ y, height: B - y }} transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
              fill={fill} fillOpacity={vital ? 1 : other ? 0.45 : 0.85} stroke={vital && !hl ? 'var(--line-2)' : 'none'} />
            <Show on={!lineOn} dy={0}>
              <text y={y - 7} textAnchor="middle" fontSize={fs} fontWeight={700} fill="var(--ink)" className="tabular">{r.value}</text>
            </Show>
            {n ? (
              <text transform={`translate(4,${B + 12}) rotate(-38)`} textAnchor="end" fontSize={11} fill={hl ? 'var(--ink)' : 'var(--ink-2)'} fontWeight={hl ? 700 : 500}>{SHORT[r.label]}</text>
            ) : (
              <text y={B + 20} textAnchor="middle" fontSize={12.5} fill={hl ? 'var(--ink)' : 'var(--ink-2)'} fontWeight={hl ? 700 : 500}>
                {r.label.split(' ').length > 1
                  ? <><tspan x={0}>{r.label.split(' ')[0]}</tspan><tspan x={0} dy={15}>{r.label.split(' ').slice(1).join(' ')}</tspan></>
                  : r.label}
              </text>
            )}
          </motion.g>
        )
      })}

      {/* 80% reference */}
      <Show on={vital} dy={0}>
        <line x1={R} x2={crossX} y1={y80} y2={y80} stroke={c('coral')} strokeWidth={1.5} strokeDasharray="5 4" />
        <line x1={crossX} x2={crossX} y1={y80} y2={B} stroke={c('coral')} strokeWidth={1.5} strokeDasharray="5 4" />
        <rect x={R - (n ? 38 : 44)} y={y80 - 22} width={n ? 34 : 40} height={18} rx={9} fill={c('coral')} />
        <text x={R - (n ? 21 : 24)} y={y80 - 9} textAnchor="middle" fontSize={fs} fontWeight={700} fill="var(--surface)">80%</text>
      </Show>

      {/* cumulative line */}
      <motion.path d={lineD} fill="none" stroke={c('coral')} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: lineOn ? 1 : 0, opacity: lineOn ? 1 : 0 }} transition={{ duration: 1.1, ease: EASE }} />
      {linePts.map(([x, y], i) => (
        <Show key={i} on={lineOn} dy={0} delay={0.15 + i * 0.13}>
          <circle cx={x} cy={y} r={4} fill="var(--surface)" stroke={c('coral')} strokeWidth={2} />
          {!n && <text x={x} y={y - 11} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={c('coral')} className="tabular">{fmt(P_ROWS[i].cumPercent, 1)}%</text>}
        </Show>
      ))}

      {/* footer */}
      <AnimatePresence mode="wait">
        <motion.text key={Math.min(step, 3)} x={W / 2} y={n ? H - 26 : H - 10} textAnchor="middle" fontSize={n ? 12 : 13} fontWeight={600} fill={vital ? c('teal') : 'var(--ink-2)'}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {(n ? wrapText(footer, 46) : [footer]).map((l, j) => <tspan key={j} x={W / 2} dy={j ? 16 : 0}>{l}</tspan>)}
        </motion.text>
      </AnimatePresence>
    </Svg>
  )
}

export const paretoDiagram: DiagramView = {
  title: 'Building a Pareto chart',
  steps: [
    `One month of repeat contacts, ${fmt(P_TOTAL, 0)} in total, counted by reason. In this order the bars do not tell you where to look first.`,
    "Sort the bars in **descending order**. \"Other\" is a mixture of minor reasons, so it always goes **last**, even when it is bigger than a named category.",
    `Add the [[Cumulative Percentage|cumulative percentage]] line on the right axis (0% to 100%). It rises fast over the big categories and ends at exactly ${fmt(P_ROWS[P_ROWS.length - 1].cumPercent, 0)}%.`,
    `Draw across from 80% and drop down. ${P_VITAL.length - 1} categories reach ${fmt(P_BEFORE ? P_BEFORE.cumPercent : 0, 1)}% and ${P_VITAL.length} reach ${fmt(P_LAST_VITAL.cumPercent, 1)}%: these are the [[Vital Few|vital few]] to investigate first.`,
  ],
  View: ParetoView,
}

/* ------------------------------------------------------------------ */
/* 5. DPMO flow                                                        */
/* ------------------------------------------------------------------ */

const UNITS = 500
const OPP = 6
const COLS_N = 25
const DOUBLE = 8
const DEFECTIVE_TARGET = 37

/** Deterministic pseudo-random generator so the grid looks the same on every visit. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const DEFECT_ORDER: number[] = (() => {
  const rand = mulberry32(1986)
  const picked: number[] = []
  while (picked.length < DEFECTIVE_TARGET) {
    const u = 1 + Math.floor(rand() * (UNITS - 1)) // unit 0 is the one we zoom into
    if (!picked.includes(u)) picked.push(u)
  }
  return picked
})()
const DEFECTS_ON = new Map<number, number>(DEFECT_ORDER.map((u, i) => [u, i < DOUBLE ? 2 : 1]))
const D = [...DEFECTS_ON.values()].reduce((s, v) => s + v, 0)
const DEFECTIVE = DEFECTS_ON.size
const TOTAL_OPP = UNITS * OPP
const V_DPU = dpu(D, UNITS)
const V_DPO = dpo(D, UNITS, OPP)
const V_DPMO = dpmo(D, UNITS, OPP)
const V_SIGMA = sigmaFromDpmo(V_DPMO)
const V_PDEF = proportionDefective(DEFECTIVE, UNITS)
const FIELDS = ['Customer name', 'Address', 'Product', 'Quantity', 'Price', 'Delivery date']

function Frac({ x, y, num, den, size, color = 'var(--ink)', delay = 0, on = true }: { x: number; y: number; num: string; den: string; size: number; color?: string; delay?: number; on?: boolean }) {
  const w = Math.max(textW(num, size), textW(den, size)) + 10
  return (
    <motion.g initial={{ opacity: 0, y: -8 }} animate={{ opacity: on ? 1 : 0, y: on ? 0 : -8 }} transition={{ duration: 0.45, ease: EASE, delay: on ? delay : 0 }}>
      <text x={x} y={y - 9} textAnchor="middle" fontFamily={DISPLAY} fontSize={size} fontWeight={700} fill={color} className="tabular">{num}</text>
      <line x1={x - w / 2} x2={x + w / 2} y1={y - 3} y2={y - 3} stroke="var(--ink-2)" strokeWidth={1.5} />
      <text x={x} y={y + size + 1} textAnchor="middle" fontFamily={DISPLAY} fontSize={size} fontWeight={700} fill={color} className="tabular">{den}</text>
    </motion.g>
  )
}

function DpmoFlowView({ step }: { step: number }) {
  const n = useNarrow()
  const W = n ? 360 : 760
  const grid = n ? { x: 20, y: 44, pitch: 12.8, cell: 10 } : { x: 24, y: 64, pitch: 14, cell: 11 }
  const rows = UNITS / COLS_N
  const gridBottom = grid.y + rows * grid.pitch
  const panel = n ? { x: 12, y: gridBottom + 34, w: 336 } : { x: 404, y: 24, w: 340 }
  const ledgerH = 66
  const stageY = panel.y + ledgerH + (n ? 18 : 22)
  const size = n ? 15 : 17
  const H = n ? stageY + 300 : 430
  const cellXY = (u: number) => ({ x: grid.x + (u % COLS_N) * grid.pitch, y: grid.y + Math.floor(u / COLS_N) * grid.pitch })
  const label = [
    `A grid of ${UNITS} order forms, one square per unit.`,
    `Each form has ${OPP} fields that could be wrong: ${fmt(TOTAL_OPP, 0)} opportunities.`,
    `${D} defects marked on ${DEFECTIVE} forms; ${DOUBLE} forms have two defects.`,
    'Formula: DPMO equals defects divided by units times opportunities, times one million.',
    `Substitution: ${D} divided by ${UNITS} times ${OPP}, equals ${fmt(V_DPO, 4)}, times one million.`,
    `Result: ${fmt(V_DPMO, 0)} DPMO, about ${fmt(V_SIGMA, 2)} sigma. DPU is ${fmt(V_DPU, 2)}; ${DEFECTIVE} defective units.`,
  ][Math.min(step, 5)]

  const ledger: { k: string; v: number; tone: Tone; at: number }[] = [
    { k: 'Units', v: UNITS, tone: 'indigo', at: 0 },
    { k: 'Opportunities', v: TOTAL_OPP, tone: 'sky', at: 1 },
    { k: 'Defects', v: D, tone: 'coral', at: 2 },
  ]
  const cellW = (panel.w - 16) / 3
  const zoom = cellXY(0)
  const x0 = panel.x + 14
  const eqX = x0 + textW('DPMO =', size) + 6
  const fracW = Math.max(textW('U × O', size), textW(`${UNITS} × ${OPP}`, size)) + 10
  const fracX = eqX + 10 + fracW / 2
  const tailX = fracX + fracW / 2 + 10
  const rowF = stageY + 26
  const rowC = rowF + (n ? 62 : 66)
  const rowP = rowC + (n ? 40 : 44)
  const rowR = rowP + (n ? 46 : 50)

  return (
    <Svg w={W} h={H} label={label}>
      {/* grid caption */}
      <text x={grid.x} y={grid.y - 14} fontSize={n ? 13 : 14} fontWeight={700} fill="var(--ink)">{fmt(UNITS, 0)} order forms</text>
      <text x={grid.x + grid.pitch * COLS_N - (grid.pitch - grid.cell)} y={grid.y - 14} textAnchor="end" fontSize={n ? 12 : 12.5} fill="var(--ink-3)">1 square = 1 unit</text>

      {/* units */}
      {Array.from({ length: rows }, (_, r) => (
        <motion.g key={r} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: r * 0.025 }}>
          {Array.from({ length: COLS_N }, (_, col) => {
            const u = r * COLS_N + col
            const { x, y } = cellXY(u)
            return <rect key={col} x={x} y={y} width={grid.cell} height={grid.cell} rx={2} fill={c('indigo')} fillOpacity={step >= 2 ? 0.14 : 0.28} />
          })}
        </motion.g>
      ))}

      {/* defects */}
      {DEFECT_ORDER.map((u, i) => {
        const { x, y } = cellXY(u)
        const two = (DEFECTS_ON.get(u) ?? 0) > 1
        return (
          <motion.rect key={u} x={x} y={y} width={grid.cell} height={grid.cell} rx={2} fill={c('coral')}
            stroke={two ? 'var(--ink)' : 'none'} strokeWidth={two ? 1.5 : 0}
            initial={{ opacity: 0 }} animate={{ opacity: step >= 2 ? 1 : 0 }} transition={{ duration: 0.3, delay: step >= 2 ? 0.2 + i * 0.022 : 0 }} />
        )
      })}

      {/* zoomed unit marker */}
      <Show on={step === 1} dy={0}>
        <rect x={zoom.x - 2.5} y={zoom.y - 2.5} width={grid.cell + 5} height={grid.cell + 5} rx={3.5} fill="none" stroke={c('sky')} strokeWidth={2} />
      </Show>

      {/* defect legend */}
      <Show on={step >= 2}>
        <g transform={`translate(${grid.x}, ${gridBottom + (n ? 12 : 18)})`}>
          <rect width={11} height={11} rx={2} fill={c('coral')} />
          <text x={17} y={10} fontSize={n ? 12 : 12.5} fill="var(--ink-2)">1 defect ({DEFECTIVE - DOUBLE} forms)</text>
          <rect x={n ? 150 : 170} width={11} height={11} rx={2} fill={c('coral')} stroke="var(--ink)" strokeWidth={1.5} />
          <text x={(n ? 150 : 170) + 17} y={10} fontSize={n ? 12 : 12.5} fill="var(--ink-2)">2 defects ({DOUBLE} forms)</text>
        </g>
      </Show>

      {/* ledger */}
      {ledger.map((l, i) => {
        const x = panel.x + i * (cellW + 8)
        const on = step >= l.at
        return (
          <g key={l.k}>
            <rect x={x} y={panel.y} width={cellW} height={ledgerH} rx={12} fill={on && step === l.at ? soft(l.tone) : 'var(--surface-2)'} stroke={on ? c(l.tone) : 'var(--line)'} strokeWidth={on && step === l.at ? 1.75 : 1} strokeDasharray={on ? undefined : '4 4'} />
            <text x={x + 12} y={panel.y + 22} fontSize={n ? 11.5 : 12.5} fontWeight={600} fill="var(--ink-2)">{l.k}</text>
            <text x={x + 12} y={panel.y + 51} fontFamily={DISPLAY} fontSize={n ? 21 : 24} fontWeight={700} fill={on ? c(l.tone) : 'var(--ink-3)'} className="tabular">
              {on ? <CountUp to={l.v} on={on} /> : '?'}
            </text>
          </g>
        )
      })}

      {/* stage: steps 0 to 2 */}
      <AnimatePresence mode="wait">
        {step <= 2 && (
          <motion.g key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
            {step === 0 && (
              <>
                <text x={x0} y={stageY + 24} fontFamily={DISPLAY} fontSize={n ? 16 : 18} fontWeight={700} fill="var(--ink)">Units</text>
                {['A unit is the item the customer receives:', 'here, one completed order form.', `We inspect ${fmt(UNITS, 0)} of them.`].map((l, j) => (
                  <text key={j} x={x0} y={stageY + 50 + j * 21} fontSize={n ? 13 : 14} fill="var(--ink-2)">{l}</text>
                ))}
              </>
            )}
            {step === 1 && (() => {
              const fx = x0
              const fy = stageY + 4
              const fw = n ? 150 : 158
              const rowH = n ? 21 : 24
              return (
                <>
                  <rect x={fx} y={fy} width={fw} height={20 + FIELDS.length * rowH} rx={10} fill="var(--surface)" stroke={c('sky')} strokeWidth={1.5} />
                  <text x={fx + 12} y={fy + 16} fontSize={11.5} fontWeight={700} fill={c('sky')}>Order form</text>
                  {FIELDS.map((f, j) => (
                    <motion.g key={f} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + j * 0.08, duration: 0.3 }}>
                      <rect x={fx + 10} y={fy + 24 + j * rowH} width={fw - 20} height={rowH - 5} rx={4} fill={soft('sky')} />
                      <text x={fx + 16} y={fy + 24 + j * rowH + rowH * 0.56} fontSize={11.5} fill="var(--ink)">{f}</text>
                    </motion.g>
                  ))}
                  <text x={fx + fw + 14} y={fy + 30} fontFamily={DISPLAY} fontSize={n ? 26 : 30} fontWeight={700} fill={c('sky')}>{OPP}</text>
                  {['fields that', 'can each be', 'wrong'].map((l, j) => <text key={j} x={fx + fw + 14} y={fy + 52 + j * 18} fontSize={n ? 12.5 : 13.5} fill="var(--ink-2)">{l}</text>)}
                  <text x={fx + fw + 14} y={fy + 126} fontSize={n ? 13 : 14} fontWeight={700} fill="var(--ink)" className="tabular">{UNITS} × {OPP} =</text>
                  <text x={fx + fw + 14} y={fy + 146} fontSize={n ? 13 : 14} fontWeight={700} fill={c('sky')} className="tabular">{fmt(TOTAL_OPP, 0)}</text>
                </>
              )
            })()}
            {step === 2 && (
              <>
                <text x={x0} y={stageY + 24} fontFamily={DISPLAY} fontSize={n ? 16 : 18} fontWeight={700} fill={c('coral')}>{D} defects</text>
                {[`Found on ${DEFECTIVE} forms: ${DOUBLE} of them`, 'have two errors each.', `Defects (${D}) and defective`, `units (${DEFECTIVE}) are different counts.`].map((l, j) => (
                  <text key={j} x={x0} y={stageY + 50 + j * 21} fontSize={n ? 13 : 14} fill="var(--ink-2)">{l}</text>
                ))}
              </>
            )}
          </motion.g>
        )}
      </AnimatePresence>

      {/* formula */}
      <Show on={step >= 3}>
        <text x={eqX} y={rowF + 6} textAnchor="end" fontFamily={DISPLAY} fontSize={size} fontWeight={700} fill="var(--ink)">DPMO =</text>
        <Frac x={fracX} y={rowF} num="D" den="U × O" size={size} />
        <text x={tailX} y={rowF + 6} fontFamily={DISPLAY} fontSize={size} fontWeight={700} fill="var(--ink)" className="tabular">× 1,000,000</text>
      </Show>

      {/* substitution */}
      <Show on={step >= 4} dy={0}>
        <text x={eqX} y={rowC + 6} textAnchor="end" fontFamily={DISPLAY} fontSize={size} fontWeight={700} fill="var(--ink-2)">=</text>
        <Frac x={fracX} y={rowC} num={String(D)} den={`${UNITS} × ${OPP}`} size={size} color={c('coral')} on={step >= 4} delay={0.15} />
        <motion.text x={tailX} y={rowC + 6} fontFamily={DISPLAY} fontSize={size} fontWeight={700} fill="var(--ink)" className="tabular"
          initial={{ opacity: 0 }} animate={{ opacity: step >= 4 ? 1 : 0 }} transition={{ delay: step >= 4 ? 0.45 : 0, duration: 0.3 }}>× 1,000,000</motion.text>
        <motion.g initial={{ opacity: 0, y: -6 }} animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : -6 }} transition={{ delay: step >= 4 ? 0.8 : 0, duration: 0.4, ease: EASE }}>
          <text x={eqX} y={rowP} textAnchor="end" fontFamily={DISPLAY} fontSize={size} fontWeight={700} fill="var(--ink-2)">=</text>
          <text x={eqX + 10} y={rowP} fontFamily={DISPLAY} fontSize={size} fontWeight={700} fill="var(--ink)" className="tabular">
            <tspan fill={c('sky')}>{fmt(V_DPO, 4)}</tspan> × 1,000,000
          </text>
          <text x={panel.x + panel.w - 4} y={rowP} textAnchor="end" fontSize={n ? 11.5 : 12} fill="var(--ink-3)">DPO</text>
        </motion.g>
      </Show>

      {/* result */}
      <Show on={step >= 5}>
        <text x={eqX} y={rowR + 8} textAnchor="end" fontFamily={DISPLAY} fontSize={size} fontWeight={700} fill="var(--ink-2)">=</text>
        <text x={eqX + 10} y={rowR + 10} fontFamily={DISPLAY} fontSize={n ? 30 : 34} fontWeight={800} fill={c('coral')} className="tabular">
          <CountUp to={V_DPMO} on={step >= 5} /><tspan fontSize={n ? 16 : 18} fontWeight={700} fill="var(--ink)" dx={6}>DPMO</tspan>
        </text>
        <text x={eqX + 10} y={rowR + 34} fontSize={n ? 13 : 14} fill="var(--ink-2)">
          About <tspan fontWeight={700} fill="var(--ink)" className="tabular">{fmt(V_SIGMA, 2)}σ</tspan> (with the 1.5σ shift)
        </text>
        <line x1={x0} x2={panel.x + panel.w - 4} y1={rowR + 50} y2={rowR + 50} stroke="var(--line)" />
        <text x={x0} y={rowR + 72} fontSize={n ? 12.5 : 13.5} fill="var(--ink-2)" className="tabular">
          <tspan fontWeight={700} fill="var(--ink)">DPU</tspan> = {D} / {UNITS} = {fmt(V_DPU, 2)}
        </text>
        <text x={x0} y={rowR + 94} fontSize={n ? 12.5 : 13.5} fill="var(--ink-2)" className="tabular">
          <tspan fontWeight={700} fill="var(--ink)">Defective units</tspan> = {DEFECTIVE} of {UNITS} = {fmt(V_PDEF * 100, 1)}%
        </text>
      </Show>
    </Svg>
  )
}

export const dpmoFlow: DiagramView = {
  title: 'From units to DPMO',
  steps: [
    `Start with the **units**: ${fmt(UNITS, 0)} order forms. A [[Unit|unit]] is the item the customer receives, here one completed form.`,
    `Each form has ${OPP} fields that could be wrong, so each unit has ${OPP} [[Opportunity|opportunities]]. In total: ${UNITS} × ${OPP} = ${fmt(TOTAL_OPP, 0)} chances for a defect.`,
    `Inspection finds **${D} defects**. Some forms have two, so only ${DEFECTIVE} forms are [[Defective|defective]]: count **total defects**, not defective units.`,
    "The formula divides defects by **total opportunities** and scales to a million: $DPMO = \\frac{D}{U \\times O} \\times 1{,}000{,}000$.",
    `Substitute the counts: ${D} / (${UNITS} × ${OPP}) = ${fmt(V_DPO, 4)} defects per opportunity ([[DPO]]), then multiply by 1,000,000.`,
    `Result: **${fmt(V_DPMO, 0)} DPMO**, about ${fmt(V_SIGMA, 2)} sigma with the 1.5σ shift. Compare [[DPU]] = ${D} / ${UNITS} = ${fmt(V_DPU, 2)}, and ${DEFECTIVE} defective units (${fmt(V_PDEF * 100, 1)}%).`,
  ],
  View: DpmoFlowView,
}
