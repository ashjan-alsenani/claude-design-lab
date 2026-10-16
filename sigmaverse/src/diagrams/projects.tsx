import { AnimatePresence, motion } from 'motion/react'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { DiagramView } from './Diagram'
import { fmt, pct } from '../lib/metrics'
import { useDur } from '../lib/motion'

/* ------------------------------------------------------------------ */
/* Shared SVG helpers                                                  */
/* ------------------------------------------------------------------ */

const EASE = [0.23, 1, 0.32, 1] as const
const SANS = 'var(--font-sans)'
const DISPLAY = 'var(--font-display)'
const COLOR_T = 'fill 300ms var(--ease-out), stroke 300ms var(--ease-out)'

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

function chipWidth(label: string, size = 12) { return label.length * size * 0.58 + 20 }

/** Lays chips out left to right, wrapping onto new rows. */
function flowChips(labels: string[], maxW: number, gap = 6, rowH = 30) {
  let x = 0
  let y = 0
  return labels.map(label => {
    const w = chipWidth(label)
    if (x > 0 && x + w > maxW) { x = 0; y += rowH }
    const pos = { label, x, y, w }
    x += w + gap
    return pos
  })
}

/* ------------------------------------------------------------------ */
/* 1. Project charter anatomy                                          */
/* ------------------------------------------------------------------ */

type Col = 'full' | 'left' | 'right'
interface CharterSection { id: string; title: string; fact?: string; row: number; col: Col; h: number }

const SECTIONS: CharterSection[] = [
  { id: 'business', title: 'Business case', fact: 'Repeat visits cost about $522,500 a year', row: 0, col: 'full', h: 56 },
  { id: 'problem', title: 'Problem statement', fact: '18.4% of fault visits repeat within 30 days (target 9%)', row: 1, col: 'full', h: 62 },
  { id: 'goal', title: 'Goal statement (SMART)', fact: '18.4% → 9.0% by 31 Mar 2027', row: 2, col: 'full', h: 54 },
  { id: 'scope', title: 'Scope', fact: 'In: residential fault visits. Out: installs, business', row: 3, col: 'left', h: 78 },
  { id: 'team', title: 'Team and roles', fact: 'Champion, Process Owner, Green Belt, team', row: 3, col: 'right', h: 78 },
  { id: 'miles', title: 'Milestones', row: 4, col: 'full', h: 54 },
  { id: 'sign', title: 'Sponsor sign-off', row: 5, col: 'full', h: 50 },
]

const PHASES = ['D', 'M', 'A', 'I', 'C']

interface CardSpec {
  title: string
  body?: string
  rows?: [string, string][]
  chips?: { labels: string[]; tone: 'coral' | 'teal'; round?: boolean }
}

const CARDS: CardSpec[] = [
  { title: 'Northwind Fibre charter', body: 'Reduce repeat fault visits for North region broadband customers. One page that authorises the work and sets its limits.' },
  { title: 'Business case', body: 'Repeat visits cost about $522,500 a year in engineer time, drive 31% of broadband complaints and are a top reason customers leave.' },
  {
    title: 'Problem statement',
    body: 'Between 1 Jan and 30 Jun 2026, 2,214 of 12,033 North region fault visits (18.4%) needed a repeat visit within 30 days, against a 9% target.',
    chips: { labels: ['No cause', 'No solution', 'No blame'], tone: 'coral' },
  },
  {
    title: 'Goal statement',
    body: 'Reduce the 30-day repeat visit rate from 18.4% to 9.0% by 31 Mar 2027, without average visit duration rising above 74 minutes.',
    chips: { labels: ['S', 'M', 'A', 'R', 'T'], tone: 'teal', round: true },
  },
  {
    title: 'Scope and boundaries',
    rows: [
      ['In', 'Residential FTTP and FTTC fault visits, North region'],
      ['Out', 'New installs, business customers, network-wide outages'],
      ['Start', 'Fault ticket assigned to an engineer'],
      ['End', 'Ticket closed as resolved'],
    ],
  },
  {
    title: 'Team and roles',
    rows: [
      ['Champion', 'Head of Field Operations North'],
      ['Owner', 'Regional Field Manager (Process Owner)'],
      ['Lead', 'Green Belt, 40% of time'],
      ['Team', 'Two senior engineers, a dispatcher, a data analyst, Finance'],
    ],
  },
  {
    title: 'Milestones',
    rows: [
      ['Define', '13 Nov 2026'],
      ['Measure', '18 Dec 2026'],
      ['Analyze', '5 Feb 2027'],
      ['Improve', '12 Mar 2027'],
      ['Control', '31 Mar 2027'],
    ],
  },
  { title: 'Sponsor sign-off', body: 'The Champion signs to commit people, time and data. Estimated benefit: about $267,000 a year, to be verified by Finance.' },
]

/** Builds one explanation card. Returns its height and content drawn from (0, 0). */
function buildCard(i: number, w: number): { h: number; node: ReactNode } {
  const c = CARDS[i]
  const pad = 16
  const inner = w - pad * 2
  const parts: ReactNode[] = []
  let y = pad + 16
  parts.push(<text key="t" x={pad} y={y} fontFamily={DISPLAY} fontSize={16.5} fontWeight={650} fill="var(--ink)">{c.title}</text>)
  y += 12
  if (c.body) {
    const lines = wrap(c.body, inner, 13)
    parts.push(<Lines key="b" x={pad} y={y + 14} lines={lines} size={13} lh={18.5} />)
    y += 14 + (lines.length - 1) * 18.5 + 8
  }
  if (c.rows) {
    const labelW = 64
    y += 6
    c.rows.forEach(([label, value], r) => {
      const lines = wrap(value, inner - labelW, 12.5)
      parts.push(
        <g key={`r${r}`}>
          <text x={pad} y={y + 13} fontFamily={SANS} fontSize={12} fontWeight={650} fill="var(--violet)">{label}</text>
          <Lines x={pad + labelW} y={y + 13} lines={lines} size={12.5} lh={16.5} />
        </g>,
      )
      y += 13 + (lines.length - 1) * 16.5 + 8
    })
  }
  if (c.chips) {
    const tone = c.chips.tone
    y += 4
    if (c.chips.round) {
      c.chips.labels.forEach((l, k) => {
        const cx = pad + 14 + k * 36
        parts.push(
          <motion.g key={`c${k}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + k * 0.08, duration: 0.3, ease: EASE }}>
            <circle cx={cx} cy={y + 14} r={14} fill={`var(--${tone}-soft)`} stroke={`var(--${tone})`} strokeWidth={1.5} />
            <text x={cx} y={y + 18.5} textAnchor="middle" fontFamily={DISPLAY} fontSize={13} fontWeight={700} fill={`var(--${tone})`}>{l}</text>
          </motion.g>,
        )
      })
      y += 36
    } else {
      const laid = flowChips(c.chips.labels, inner)
      laid.forEach((p, k) => {
        parts.push(
          <motion.g key={`c${k}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + k * 0.12, duration: 0.3, ease: EASE }}>
            <rect x={pad + p.x} y={y + p.y} width={p.w} height={24} rx={12} fill={`var(--${tone}-soft)`} stroke={`var(--${tone})`} strokeWidth={1.2} />
            <text x={pad + p.x + p.w / 2} y={y + p.y + 16} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill={`var(--${tone})`}>{p.label}</text>
          </motion.g>,
        )
      })
      y += laid[laid.length - 1].y + 32
    }
  }
  return { h: y + pad - 6, node: <>{parts}</> }
}

function CharterView({ step }: { step: number }) {
  const [ref, compact] = useCompact()
  const dur = useDur()
  const W = compact ? 360 : 720
  const sheet = compact ? { x: 12, y: 14, w: 336 } : { x: 20, y: 18, w: 392 }
  const innerX = sheet.x + 16
  const innerW = sheet.w - 32
  const gap = 8
  const rowY: number[] = []
  let yy = sheet.y + 56
  for (let r = 0; r < 6; r++) {
    rowY.push(yy)
    yy += Math.max(...SECTIONS.filter(s => s.row === r).map(s => s.h)) + gap
  }
  const sheetH = yy - sheet.y + 4
  const cardW = compact ? 336 : 268
  const cards = CARDS.map((_, i) => buildCard(i, cardW))
  const maxCardH = Math.max(...cards.map(c => c.h))
  const H = compact ? sheet.y + sheetH + 16 + maxCardH + 12 : sheet.y + sheetH + 16
  const half = (innerW - 10) / 2

  const box = (s: CharterSection) => {
    const x = s.col === 'right' ? innerX + half + 10 : innerX
    const w = s.col === 'full' ? innerW : half
    return { x, y: rowY[s.row], w, h: s.h }
  }

  const activeIdx = step - 1
  const active = activeIdx >= 0 ? box(SECTIONS[activeIdx]) : null
  const card = cards[step]
  let cardX = sheet.x
  let cardY = sheet.y + sheetH + 16
  if (!compact) {
    cardX = 432
    const centre = active ? active.y + active.h / 2 : sheet.y + 40
    cardY = Math.min(Math.max(sheet.y, centre - card.h / 2), H - 12 - card.h)
  }

  const label = step === 0 ? 'Project charter template for Northwind Fibre, all sections empty' : `Project charter for Northwind Fibre, ${SECTIONS[activeIdx].title} highlighted`

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      {/* Sheet */}
      <rect x={sheet.x + 3} y={sheet.y + 5} width={sheet.w} height={sheetH} rx={16} fill="var(--line)" opacity={0.6} />
      <rect x={sheet.x} y={sheet.y} width={sheet.w} height={sheetH} rx={16} fill="var(--surface)" stroke="var(--line-2)" />
      <text x={innerX} y={sheet.y + 32} fontFamily={DISPLAY} fontSize={17} fontWeight={700} fill="var(--ink)">Project charter</text>
      <text x={sheet.x + sheet.w - 16} y={sheet.y + 32} textAnchor="end" fontFamily={SANS} fontSize={12} fill="var(--ink-3)">Northwind Fibre</text>
      <line x1={innerX} x2={innerX + innerW} y1={sheet.y + 46} y2={sheet.y + 46} stroke="var(--line)" strokeWidth={1.5} />

      {SECTIONS.map((s, i) => {
        const b = box(s)
        const state = i === activeIdx ? 'active' : i < activeIdx ? 'done' : 'future'
        const revealed = state !== 'future'
        const facts = s.fact ? wrap(s.fact, b.w - 24, 12) : []
        return (
          <g key={s.id}>
            <rect
              x={b.x} y={b.y} width={b.w} height={b.h} rx={10}
              style={{
                fill: state === 'active' ? 'var(--violet-soft)' : state === 'done' ? 'var(--surface)' : 'var(--surface-2)',
                stroke: state === 'active' ? 'var(--violet)' : 'var(--line-2)',
                strokeWidth: state === 'active' ? 2 : 1,
                transition: COLOR_T,
              }}
            />
            <text x={b.x + 12} y={b.y + 20} fontFamily={SANS} fontSize={13} fontWeight={650} fill={state === 'future' ? 'var(--ink-3)' : state === 'active' ? 'var(--violet)' : 'var(--ink)'}>{s.title}</text>
            {state === 'done' && (
              <path d={`M ${b.x + b.w - 24} ${b.y + 15} l 4 4 l 7 -8`} fill="none" stroke="var(--good)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            )}
            {/* Body: skeleton bars until revealed */}
            {s.fact && (revealed ? (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur(0.4), delay: dur(0.15) }}>
                <Lines x={b.x + 12} y={b.y + 38} lines={facts} size={12} lh={15} fill="var(--ink-2)" />
              </motion.g>
            ) : (
              <g fill="var(--surface-3)">
                {(s.col === 'full' ? [0.72, 0.46] : [0.8, 0.62, 0.4]).map((f, k) => (
                  <rect key={k} x={b.x + 12} y={b.y + 30 + k * 11} width={(b.w - 24) * f} height={5} rx={2.5} />
                ))}
              </g>
            ))}
            {s.id === 'miles' && (() => {
              const x0 = b.x + 112
              const x1 = b.x + b.w - 18
              const sp = (x1 - x0) / 4
              const tone = revealed ? 'var(--violet)' : 'var(--line-2)'
              return (
                <g>
                  <line x1={x0} x2={x1} y1={b.y + 37} y2={b.y + 37} stroke={tone} strokeWidth={2} strokeLinecap="round" />
                  {PHASES.map((p, k) => (
                    <g key={p}>
                      <motion.circle cx={x0 + k * sp} cy={b.y + 37} r={5.5}
                        initial={false}
                        animate={{ scale: state === 'active' ? [0.9, 1.2, 1] : 1 }}
                        transition={{ duration: dur(0.5), delay: state === 'active' ? dur(0.1 + k * 0.12) : 0 }}
                        style={{ fill: revealed ? 'var(--violet)' : 'var(--surface)', transition: COLOR_T }}
                        stroke={tone} strokeWidth={1.5} />
                      <text x={x0 + k * sp} y={b.y + 24} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill={revealed ? 'var(--ink-2)' : 'var(--ink-3)'}>{p}</text>
                    </g>
                  ))}
                </g>
              )
            })()}
            {s.id === 'sign' && (
              <g>
                <line x1={b.x + b.w - 150} x2={b.x + b.w - 16} y1={b.y + 38} y2={b.y + 38} stroke="var(--line-2)" strokeWidth={1.2} />
                <text x={b.x + 12} y={b.y + 38} fontFamily={SANS} fontSize={12} fill="var(--ink-3)">Champion</text>
                {revealed && (
                  <motion.path
                    d={`M ${b.x + b.w - 144} ${b.y + 33} c 8 -16 14 -18 12 -4 c -2 10 6 6 12 -6 c 4 -8 8 -6 6 2 c -2 8 6 6 12 -2 c 6 -8 10 -6 10 0 c 0 6 8 4 16 -4 c 6 -6 14 -6 24 -2`}
                    fill="none" stroke="var(--indigo)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur(0.9), delay: dur(0.2), ease: EASE }}
                  />
                )}
              </g>
            )}
          </g>
        )
      })}

      {/* Leader from the highlighted section to the card (wide layout) */}
      {!compact && active && (
        <motion.g initial={false} animate={{ y: active.y + active.h / 2 }} transition={{ duration: dur(0.45), ease: EASE }}>
          <line x1={sheet.x + sheet.w - 2} x2={cardX} y1={0} y2={0} stroke="var(--violet)" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={sheet.x + sheet.w - 2} cy={0} r={3.5} fill="var(--violet)" />
        </motion.g>
      )}

      {/* Explanation card */}
      <motion.g initial={false} animate={{ x: cardX, y: cardY }} transition={{ duration: dur(0.45), ease: EASE }}>
        <motion.rect x={0} y={0} width={cardW} rx={16} initial={false} animate={{ height: card.h }} transition={{ duration: dur(0.35), ease: EASE }}
          fill="var(--surface)" stroke={step === 0 ? 'var(--line-2)' : 'var(--violet)'} strokeWidth={1.5} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.g key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: EASE }}>
            {card.node}
          </motion.g>
        </AnimatePresence>
      </motion.g>
    </svg>
  )
}

export const charter: DiagramView = {
  title: 'Anatomy of a project charter',
  steps: [
    'A **project charter** is the one-page agreement that authorises and bounds a project. We will fill in the Northwind Fibre charter one section at a time.',
    'The **business case** answers "why this project, why now". Repeat visits cost about $522,500 a year in engineer time and drive 31% of broadband complaints.',
    'The **problem statement** says what is wrong, where, when and how big, with a baseline of 18.4%. It follows the three NOs: **no cause, no solution, no blame**.',
    'The **goal statement** is SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and uses the same metric as the problem: 18.4% down to 9.0% by 31 Mar 2027.',
    '**Scope** lists what is in and out, and the **boundaries** mark where the process starts (ticket assigned) and ends (ticket closed as resolved).',
    '**Team and roles**: a Champion who removes barriers, a Process Owner who will keep the gains, a Green Belt lead and the people who do the work.',
    '**Milestones** give each DMAIC tollgate a date, from the Define review on 13 Nov 2026 to the Control handover on 31 Mar 2027.',
    '**Sponsor sign-off**: the Champion signs to commit people and time. The charter stays a living document and is updated if Measure changes the baseline.',
  ],
  View: CharterView,
}

/* ------------------------------------------------------------------ */
/* 2. Metric ladder: CTQ to project Y to guard rails to money          */
/* ------------------------------------------------------------------ */

const LADDER = { min: 75, max: 100, baseline: 81.3, entitlement: 93.6, goal: 95.0 }
const GAP = LADDER.goal - LADDER.baseline

interface Rung { title: string; sub: string; hWide: number; hNarrow: number }
const RUNGS: Rung[] = [
  { title: 'CTQ', sub: 'Customer requirement', hWide: 96, hNarrow: 146 },
  { title: 'Project Y', sub: 'Primary metric', hWide: 132, hNarrow: 180 },
  { title: 'Secondary metrics', sub: 'Guard rails, must not worsen', hWide: 104, hNarrow: 150 },
  { title: 'Financial metric', sub: 'The Y in money', hWide: 84, hNarrow: 116 },
]
const RUNG_FOR_STEP = [0, 1, 1, 2, 3]

function MetricLadderView({ step }: { step: number }) {
  const [ref, compact] = useCompact()
  const dur = useDur()
  const W = compact ? 380 : 720
  const x0 = compact ? 12 : 24
  const w = W - x0 * 2
  const gap = 16
  const tops: number[] = []
  let y = compact ? 12 : 16
  RUNGS.forEach(r => { tops.push(y); y += (compact ? r.hNarrow : r.hWide) + gap })
  const H = y - gap + (compact ? 12 : 16)
  const cx = compact ? x0 + 16 : x0 + 190
  const cw = compact ? w - 32 : w - 210
  const contentTop = (i: number) => tops[i] + (compact ? 62 : 22)
  const activeRung = RUNG_FOR_STEP[step]
  const sx = (v: number) => cx + ((v - LADDER.min) / (LADDER.max - LADDER.min)) * cw

  const label = [
    'Metric ladder. CTQ: P2 incident restored within 4 hours.',
    'Project Y with baseline 81.3 percent.',
    'Project Y with baseline 81.3, entitlement 93.6 and goal 95.0 percent; gap 13.7 points.',
    'Secondary metrics added as guard rails: reopened incidents and overtime must not rise.',
    'Financial metric added: service credits paid per month should fall.',
  ][step]

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      {/* Spine connectors */}
      {tops.slice(1).map((t, i) => (
        <path key={i}
          d={`M ${x0 + 26} ${t - gap + 2} L ${x0 + 26} ${t - 3} M ${x0 + 21} ${t - 8} L ${x0 + 26} ${t - 3} L ${x0 + 31} ${t - 8}`}
          fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
          style={{ stroke: i + 1 <= activeRung ? 'var(--violet)' : 'var(--line-2)', transition: COLOR_T }} />
      ))}

      {RUNGS.map((r, i) => {
        const h = compact ? r.hNarrow : r.hWide
        const top = tops[i]
        const state = i === activeRung ? 'active' : i < activeRung ? 'done' : 'future'
        return (
          <g key={r.title}>
            <rect x={x0} y={top} width={w} height={h} rx={16}
              style={{
                fill: state === 'future' ? 'var(--surface-2)' : 'var(--surface)',
                stroke: state === 'active' ? 'var(--violet)' : 'var(--line-2)',
                strokeWidth: state === 'active' ? 2 : 1,
                transition: COLOR_T,
              }}
              strokeDasharray={state === 'future' ? '5 5' : undefined} />
            <circle cx={x0 + 26} cy={top + 26} r={13} fill={state === 'future' ? 'var(--surface-3)' : 'var(--violet)'} />
            <text x={x0 + 26} y={top + 30.5} textAnchor="middle" fontFamily={DISPLAY} fontSize={13} fontWeight={700} fill={state === 'future' ? 'var(--ink-3)' : 'var(--surface)'}>{i + 1}</text>
            <text x={x0 + 48} y={top + 31} fontFamily={DISPLAY} fontSize={15.5} fontWeight={650} fill={state === 'future' ? 'var(--ink-3)' : 'var(--ink)'}>{r.title}</text>
            {compact
              ? <text x={x0 + w - 16} y={top + 31} textAnchor="end" fontFamily={SANS} fontSize={12} fill="var(--ink-3)">{r.sub.split(',')[0]}</text>
              : <Lines x={x0 + 20} y={top + 58} lines={wrap(r.sub, 150, 12)} size={12} fill="var(--ink-3)" />}
          </g>
        )
      })}

      {/* Rung 1: VOC to CTQ */}
      {(() => {
        const t = contentTop(0)
        const vocW = compact ? cw : 210
        const ctqX = compact ? cx : cx + vocW + 34
        const ctqY = compact ? t + 50 : t
        const ctqW = compact ? cw : cw - vocW - 34
        const bh = compact ? 34 : 50
        const vocLines = wrap('"When my service fails, get it back fast."', vocW - 24, 13)
        const ctqLines = wrap('P2 incident restored within 4 hours', ctqW - 24, 13)
        const ty = (n: number) => (bh - (n - 1) * 17) / 2 + 4.5
        return (
          <g>
            <rect x={cx} y={t} width={vocW} height={bh} rx={12} fill="var(--sky-soft)" />
            <Lines x={cx + 12} y={t + ty(vocLines.length)} lines={vocLines} size={13} lh={17} fill="var(--ink)" italic />
            {compact
              ? <path d={`M ${cx + 30} ${t + bh + 3} L ${cx + 30} ${ctqY - 3} M ${cx + 25} ${ctqY - 8} L ${cx + 30} ${ctqY - 3} L ${cx + 35} ${ctqY - 8}`} fill="none" stroke="var(--ink-3)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
              : <path d={`M ${cx + vocW + 6} ${t + bh / 2} L ${ctqX - 6} ${t + bh / 2} M ${ctqX - 11} ${t + bh / 2 - 5} L ${ctqX - 6} ${t + bh / 2} L ${ctqX - 11} ${t + bh / 2 + 5}`} fill="none" stroke="var(--ink-3)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />}
            <motion.g initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: dur(0.3), duration: dur(0.4), ease: EASE }}>
              <rect x={ctqX} y={ctqY} width={ctqW} height={bh} rx={12} fill="var(--violet-soft)" stroke="var(--violet)" strokeWidth={1.3} />
              <Lines x={ctqX + 12} y={ctqY + ty(ctqLines.length)} lines={ctqLines} size={13} lh={17} fill="var(--ink)" weight={600} />
            </motion.g>
          </g>
        )
      })()}

      {/* Rung 2: project Y scale */}
      {step >= 1 && (() => {
        const t = contentTop(1)
        const nameLines = wrap('P2 incidents restored within the 4-hour SLA, % per month', cw, 13)
        const labelY = t + 12 + (nameLines.length - 1) * 17 + 26
        const trackY = labelY + 8
        const tickY = trackY + 32
        const showGoal = step >= 2
        return (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur(0.4) }}>
            <Lines x={cx} y={t + 12} lines={nameLines} size={13} lh={17} fill="var(--ink)" weight={600} />
            <rect x={sx(LADDER.min)} y={trackY} width={cw} height={16} rx={8} fill="var(--surface-3)" />
            <motion.rect x={sx(LADDER.min)} y={trackY} height={16} rx={8} fill="var(--coral)" opacity={0.85}
              initial={{ width: 0 }} animate={{ width: sx(LADDER.baseline) - sx(LADDER.min) }} transition={{ duration: dur(0.7), ease: EASE }} />
            {showGoal && (
              <motion.rect x={sx(LADDER.baseline)} y={trackY} height={16} fill="var(--teal-soft)" stroke="var(--teal)" strokeWidth={1.3} strokeDasharray="4 3"
                initial={{ width: 0 }} animate={{ width: sx(LADDER.goal) - sx(LADDER.baseline) }} transition={{ duration: dur(0.9), delay: dur(0.35), ease: EASE }} />
            )}
            {showGoal && (
              <motion.text x={(sx(LADDER.baseline) + sx(LADDER.goal)) / 2} y={trackY + 12.5} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--teal)"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur(1.1), duration: dur(0.3) }}>
                Gap {fmt(GAP, 1)} pts
              </motion.text>
            )}
            {/* Ticks */}
            {[75, 80, 85, 90, 95, 100].map(v => (
              <g key={v}>
                <line x1={sx(v)} x2={sx(v)} y1={trackY + 19} y2={trackY + 23} stroke="var(--line-2)" />
                <text x={sx(v)} y={tickY} textAnchor="middle" fontFamily={SANS} fontSize={12} fill="var(--ink-3)" className="tabular">{v}%</text>
              </g>
            ))}
            {/* Baseline marker */}
            <line x1={sx(LADDER.baseline)} x2={sx(LADDER.baseline)} y1={trackY - 6} y2={trackY + 20} stroke="var(--coral)" strokeWidth={2} />
            <text x={sx(LADDER.baseline)} y={labelY - 4} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--coral)">Baseline {fmt(LADDER.baseline, 1)}%</text>
            {showGoal && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur(0.4), delay: dur(0.2) }}>
                <line x1={sx(LADDER.goal)} x2={sx(LADDER.goal)} y1={trackY - 6} y2={trackY + 20} stroke="var(--teal)" strokeWidth={2} />
                <text x={sx(LADDER.goal)} y={labelY - 4} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--teal)">Goal {fmt(LADDER.goal, 1)}%</text>
                <line x1={sx(LADDER.entitlement)} x2={sx(LADDER.entitlement)} y1={trackY - 3} y2={tickY + 6} stroke="var(--amber)" strokeWidth={2} strokeDasharray="3 2" />
                <text x={sx(LADDER.entitlement) - 6} y={tickY + 18} textAnchor="end" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--amber)">Entitlement {fmt(LADDER.entitlement, 1)}% (best month)</text>
              </motion.g>
            )}
          </motion.g>
        )
      })()}

      {/* Rung 3: guard rails */}
      {step >= 3 && (() => {
        const t = contentTop(2)
        const items = ['Incidents reopened within 72 hours', 'Engineer overtime hours']
        return (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur(0.4) }}>
            {items.map((name, k) => {
              const rowY = compact ? t + k * 44 : t + 8 + k * 38
              const laneX = compact ? cx : cx + 200
              const laneY = compact ? rowY + 8 : rowY - 12
              const laneW = compact ? cw - 96 : cw - 200 - 96
              const posts = Math.floor(laneW / 22)
              return (
                <g key={name}>
                  <text x={cx} y={compact ? rowY : rowY + 2} fontFamily={SANS} fontSize={12.5} fontWeight={600} fill="var(--ink)">{name}</text>
                  <rect x={laneX} y={laneY + 4} width={laneW} height={14} fill="var(--surface-2)" />
                  {[laneY + 2, laneY + 20].map(ry => (
                    <g key={ry}>
                      <line x1={laneX} x2={laneX + laneW} y1={ry} y2={ry} stroke="var(--amber)" strokeWidth={2} strokeLinecap="round" />
                      {Array.from({ length: posts + 1 }, (_, p) => (
                        <line key={p} x1={laneX + p * (laneW / posts)} x2={laneX + p * (laneW / posts)} y1={ry - 3} y2={ry + 3} stroke="var(--amber)" strokeWidth={1.5} />
                      ))}
                    </g>
                  ))}
                  <motion.circle cy={laneY + 11} r={5} fill="var(--teal)" initial={{ cx: laneX + 8 }} animate={{ cx: laneX + laneW - 8 }}
                    transition={{ duration: dur(1.6), delay: dur(0.2 + k * 0.25), ease: EASE }} />
                  <text x={laneX + laneW + 12} y={laneY + 15} fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--coral)">Must not rise</text>
                </g>
              )
            })}
          </motion.g>
        )
      })()}

      {/* Rung 4: financial */}
      {step >= 4 && (() => {
        const t = contentTop(3)
        const coinY = compact ? t + 30 : t + 18
        const coinX = compact ? cx + 10 : cx + 260
        return (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur(0.4) }}>
            <text x={cx} y={compact ? t : t + 14} fontFamily={SANS} fontSize={13} fontWeight={600} fill="var(--ink)">Service credits paid, $ per month</text>
            {!compact && <text x={cx} y={t + 34} fontFamily={SANS} fontSize={12} fill="var(--ink-3)">Direction: decrease</text>}
            {Array.from({ length: 6 }, (_, k) => (
              <motion.g key={k} initial={{ opacity: 1 }} animate={{ opacity: k >= 3 ? 0.18 : 1 }} transition={{ delay: dur(0.6 + (5 - k) * 0.15), duration: dur(0.4) }}>
                <circle cx={coinX + k * 26} cy={coinY} r={10} fill="var(--amber-soft)" stroke="var(--amber)" strokeWidth={1.5} />
                <text x={coinX + k * 26} y={coinY + 4} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--amber)">$</text>
              </motion.g>
            ))}
            <path d={`M ${coinX + 6 * 26 + 8} ${coinY - 8} L ${coinX + 6 * 26 + 8} ${coinY + 8} M ${coinX + 6 * 26 + 3} ${coinY + 3} L ${coinX + 6 * 26 + 8} ${coinY + 8} L ${coinX + 6 * 26 + 13} ${coinY + 3}`}
              fill="none" stroke="var(--good)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <text x={coinX + 6 * 26 + 22} y={coinY + 4} fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--good)">Fall</text>
          </motion.g>
        )
      })()}
    </svg>
  )
}

export const metricLadder: DiagramView = {
  title: 'From CTQ to the metrics that prove it',
  steps: [
    'Start with the customer. The [[Voice of the Customer]], "when my service fails, get it back fast", becomes a measurable [[Critical to Quality]] requirement: a P2 incident restored within 4 hours.',
    `The CTQ becomes the **project Y**, the primary metric: P2 incidents restored within the 4-hour SLA. Kestrel Mobile's baseline is ${fmt(LADDER.baseline, 1)}% of incidents per month.`,
    `Add the **goal** (${fmt(LADDER.goal, 1)}%) and the [[Entitlement]] (${fmt(LADDER.entitlement, 1)}%, the best month already achieved). The gap to close is ${fmt(GAP, 1)} percentage points; going beyond entitlement usually needs some redesign.`,
    '**Secondary (consequential) metrics** are guard rails, not targets: reopened incidents and engineer overtime must not rise while the project Y improves.',
    'A **financial metric** translates the project Y into money: service credits paid per month should fall. Every rung traces back to what the customer asked for.',
  ],
  View: MetricLadderView,
}

/* ------------------------------------------------------------------ */
/* 3. Benefits pipeline across DMAIC                                   */
/* ------------------------------------------------------------------ */

const BENEFIT_TYPES = [
  { key: 'hard', label: 'Hard savings', tone: 'teal' },
  { key: 'soft', label: 'Soft savings', tone: 'sky' },
  { key: 'avoid', label: 'Cost avoidance', tone: 'amber' },
] as const

/** Illustrative Northwind Fibre figures, $k per year. */
const STAGES = [
  { phase: ['Define'], status: 'Estimated', values: [267, 95, 60] },
  { phase: ['Measure', '+ Analyze'], status: 'Refined', values: [250, 85, 55] },
  { phase: ['Improve'], status: 'Implemented', values: [238, 78, 50] },
  { phase: ['Control'], status: 'Realized', values: [214, 64, 42] },
]
const sum = (a: readonly number[]) => a.reduce((s, v) => s + v, 0)
const EST_TOTAL = sum(STAGES[0].values)
const REAL_TOTAL = sum(STAGES[3].values)
const REALIZED_SHARE = pct(REAL_TOTAL / EST_TOTAL, 0)

function BenefitsView({ step }: { step: number }) {
  const [ref, compact] = useCompact()
  const dur = useDur()
  const W = compact ? 380 : 720
  const H = compact ? 470 : 430
  const left = compact ? 52 : 70
  const right = W - (compact ? 14 : 30)
  const top = compact ? 112 : 96
  const base = compact ? 368 : 336
  const yMax = 450
  const sy = (v: number) => base - (v / yMax) * (base - top)
  const colW = (right - left) / 4
  const barW = compact ? 44 : 70
  const barX = (i: number) => left + colW * i + (colW - barW) / 2
  const contrast = step >= 4

  const label = contrast
    ? `Estimated benefits ${EST_TOTAL} thousand dollars versus realized ${REAL_TOTAL} thousand, ${REALIZED_SHARE} of estimate`
    : `Benefits pipeline up to ${STAGES[Math.min(step, 3)].phase.join(' ')}: ${STAGES[Math.min(step, 3)].status} total ${sum(STAGES[Math.min(step, 3)].values)} thousand dollars a year`

  const legend = BENEFIT_TYPES.map((t, i) => {
    const lx = compact ? 14 + (i % 2) * 170 : 30 + i * 150
    const ly = compact ? 22 + Math.floor(i / 2) * 22 : 26
    return (
      <g key={t.key}>
        <rect x={lx} y={ly - 10} width={14} height={14} rx={4} fill={`var(--${t.tone})`} />
        <text x={lx + 21} y={ly + 1.5} fontFamily={SANS} fontSize={12.5} fontWeight={600} fill="var(--ink-2)">{t.label}</text>
      </g>
    )
  })
  const keyX = compact ? 184 : 490
  const keyY = compact ? 44 : 26

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      {legend}
      <g>
        <rect x={keyX} y={keyY - 10} width={14} height={14} rx={4} fill="var(--surface-3)" stroke="var(--ink-3)" strokeDasharray="3 2" />
        <text x={keyX + 21} y={keyY + 1.5} fontFamily={SANS} fontSize={12.5} fill="var(--ink-2)">Projection</text>
        <rect x={keyX + 98} y={keyY - 10} width={14} height={14} rx={4} fill="var(--ink-3)" />
        <text x={keyX + 119} y={keyY + 1.5} fontFamily={SANS} fontSize={12.5} fill="var(--ink-2)">Verified</text>
      </g>
      <text x={compact ? 14 : 30} y={compact ? 84 : 58} fontFamily={SANS} fontSize={12} fill="var(--ink-3)">Illustrative figures, Northwind Fibre, $k per year</text>

      {/* Grid */}
      {[0, 100, 200, 300, 400].map(v => (
        <g key={v}>
          <line x1={left} x2={right} y1={sy(v)} y2={sy(v)} stroke={v === 0 ? 'var(--line-2)' : 'var(--line)'} strokeWidth={v === 0 ? 1.5 : 1} />
          <text x={left - 8} y={sy(v) + 4} textAnchor="end" fontFamily={SANS} fontSize={12} fill="var(--ink-3)" className="tabular">${v}k</text>
        </g>
      ))}

      {STAGES.map((s, i) => {
        if (i > step) return null
        const verified = i === 3
        const dim = contrast && (i === 1 || i === 2)
        let acc = 0
        const total = sum(s.values)
        return (
          <motion.g key={s.status} initial={{ opacity: 0 }} animate={{ opacity: dim ? 0.3 : 1 }} transition={{ duration: dur(0.35) }}>
            {s.values.map((v, k) => {
              const y0 = sy(acc + v)
              const hh = sy(acc) - sy(acc + v)
              acc += v
              const tone = BENEFIT_TYPES[k].tone
              return (
                <motion.rect key={k} x={barX(i)} width={barW}
                  initial={{ y: base, height: 0 }} animate={{ y: y0, height: hh }}
                  transition={{ duration: dur(0.7), delay: dur(0.1 + k * 0.18), ease: EASE }}
                  fill={verified ? `var(--${tone})` : `var(--${tone}-soft)`}
                  stroke={`var(--${tone})`} strokeWidth={verified ? 0 : 1.4} strokeDasharray={verified ? undefined : '4 3'} />
              )
            })}
            <motion.text x={barX(i) + barW / 2} y={sy(total) - 8} textAnchor="middle" fontFamily={DISPLAY} fontSize={14} fontWeight={700} fill="var(--ink)" className="tabular"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur(0.7), duration: dur(0.3) }}>
              ${total}k
            </motion.text>
            <Lines x={barX(i) + barW / 2} y={base + 20} lines={s.phase} size={12.5} lh={15} anchor="middle" weight={700} fill="var(--ink)" />
            <text x={barX(i) + barW / 2} y={base + 20 + s.phase.length * 15 + 2} textAnchor="middle" fontFamily={SANS} fontSize={12} fill={verified ? 'var(--good)' : 'var(--ink-3)'} fontWeight={verified ? 700 : 400}>{s.status}</text>
          </motion.g>
        )
      })}

      {/* Finance verification stamp */}
      {step >= 3 && (
        <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: dur(0.9), duration: dur(0.35), ease: EASE }}>
          <g transform={`translate(${barX(3) + barW / 2} ${sy(REAL_TOTAL) - (compact ? 44 : 50)}) rotate(-6)`}>
            <rect x={compact ? -38 : -50} y={-13} width={compact ? 76 : 100} height={24} rx={7} fill="var(--good-soft)" stroke="var(--good)" strokeWidth={1.5} />
            <path d={`M ${compact ? -30 : -40} -1 l 4 4 l 7 -8`} fill="none" stroke="var(--good)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <text x={compact ? 5 : 6} y={4} textAnchor="middle" fontFamily={SANS} fontSize={12} fontWeight={700} fill="var(--good)">{compact ? 'Finance' : 'Finance verified'}</text>
          </g>
        </motion.g>
      )}

      {/* Estimated versus realized contrast */}
      {contrast && (() => {
        const gx = barX(3)
        const bx = gx + barW + (compact ? 4 : 8)
        return (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: dur(0.4), delay: dur(0.2) }}>
            <line x1={barX(0)} x2={gx + barW} y1={sy(EST_TOTAL)} y2={sy(EST_TOTAL)} stroke="var(--ink-3)" strokeDasharray="4 4" />
            <rect x={gx} y={sy(EST_TOTAL)} width={barW} height={sy(REAL_TOTAL) - sy(EST_TOTAL)} fill="none" stroke="var(--ink-3)" strokeDasharray="4 3" />
            <path d={`M ${bx} ${sy(EST_TOTAL)} h 5 V ${sy(REAL_TOTAL)} h -5`} fill="none" stroke="var(--coral)" strokeWidth={1.8} />
            {!compact && (
              <Lines x={bx + 10} y={(sy(EST_TOTAL) + sy(REAL_TOTAL)) / 2 - 2} lines={[`${REALIZED_SHARE} of`, 'estimate']} size={12} lh={14} fill="var(--coral)" weight={700} />
            )}
          </motion.g>
        )
      })()}
      {contrast && compact && (
        <motion.text x={W / 2} y={H - 10} textAnchor="middle" fontFamily={SANS} fontSize={12.5} fontWeight={700} fill="var(--coral)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur(0.3), duration: dur(0.3) }}>
          Realized is {REALIZED_SHARE} of the Define estimate
        </motion.text>
      )}
    </svg>
  )
}

export const benefits: DiagramView = {
  title: 'Benefits from estimate to verified result',
  steps: [
    'In **Define** the team records **estimated benefits** from the baseline, the goal and stated assumptions, split into hard savings, soft savings and cost avoidance. Northwind\'s hard savings estimate is about $267k a year.',
    'In **Measure** and **Analyze** better data refine the estimate: volumes, unit costs and the split between the three types all get sharper.',
    'In **Improve** the solution goes live and the team projects the run rate it is achieving. It is still a projection, not yet verified.',
    'In **Control** the Finance Representative verifies the **realized benefits** from actual data over an agreed period. Only verified benefits count as the project result.',
    `Compare **estimated benefits** with **realized benefits**: here Finance verified ${REALIZED_SHARE} of the Define estimate. A gap like this is common; report it honestly rather than quoting the estimate.`,
  ],
  View: BenefitsView,
}
