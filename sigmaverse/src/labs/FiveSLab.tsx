import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowUp, Check, Lock, Play, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { LabProps } from './registry'
import { Feedback, KnowledgeCheck, LabShell, shuffle, type CheckItem } from './kit'
import { useDur, useReduced } from '../lib/motion'
import { recordLab, update } from '../lib/store'

/* ------------------------------------------------------------------ */
/* Model                                                               */
/* ------------------------------------------------------------------ */

type Kind = 'useful' | 'useless' | 'unknown'
type Freq = 'A' | 'B' | 'C'
type Shape = 'headset' | 'cable' | 'paper' | 'binder' | 'device' | 'case' | 'box' | 'small' | 'mouse' | 'pens'
interface Item { id: string; name: string; shape: Shape; kind: Kind; freq?: Freq; use: string; why: string }
interface Workspace { id: string; name: string; scenario: string; items: Item[] }

const WORKSPACES: Workspace[] = [
  {
    id: 'desk', name: 'Service desk position', scenario: 'A Kestrel Mobile service desk agent loses about 6 minutes per hour searching a cluttered desk for the headset, the console cable and the right forms.',
    items: [
      { id: 'headset', name: 'Headset', shape: 'headset', kind: 'useful', freq: 'A', use: 'Used on every call', why: 'Used all day: class A, keep within arm\'s reach.' },
      { id: 'notepad', name: 'Call notepad and pen', shape: 'paper', kind: 'useful', freq: 'A', use: 'Used several times an hour', why: 'Used many times a day: class A.' },
      { id: 'console', name: 'Console cable', shape: 'cable', kind: 'useful', freq: 'A', use: 'Used several times a day for router checks', why: 'Daily use: class A, at the desk.' },
      { id: 'labeller', name: 'Label printer', shape: 'device', kind: 'useful', freq: 'B', use: 'Used about once a week', why: 'Weekly use: class B, nearby in the same room.' },
      { id: 'module', name: 'Spare optical module', shape: 'small', kind: 'useful', freq: 'B', use: 'Swapped about once a week', why: 'Weekly use: class B, the room cabinet.' },
      { id: 'toolkit', name: 'Small tool kit', shape: 'case', kind: 'useful', freq: 'B', use: 'Opened most weeks', why: 'Weekly use: class B.' },
      { id: 'binder', name: 'Quarterly audit binder', shape: 'binder', kind: 'useful', freq: 'C', use: 'Opened once a quarter', why: 'Quarterly use: class C, a remote store a few minutes away.' },
      { id: 'calib', name: 'Line-test calibration kit', shape: 'case', kind: 'useful', freq: 'C', use: 'Used once a quarter', why: 'Quarterly use: class C.' },
      { id: 'directory', name: '2019 phone directory', shape: 'binder', kind: 'useless', use: 'Out of date for six years', why: 'Useless: it clutters the desk and causes mistakes. Dispose of it now.' },
      { id: 'mouse', name: 'Broken mouse', shape: 'mouse', kind: 'useless', use: 'Does not work', why: 'Useless: dispose of it immediately.' },
      { id: 'toner', name: 'Empty toner boxes', shape: 'box', kind: 'useless', use: 'Empty packaging', why: 'Useless: recycle it.' },
      { id: 'usb', name: 'Unlabelled USB drive', shape: 'small', kind: 'unknown', use: 'Nobody knows whose it is', why: 'Unknown: red-tag it with today\'s date. If nobody claims it in the set period, remove it.' },
      { id: 'cables', name: 'Box of mixed cables', shape: 'box', kind: 'unknown', use: 'Some might be needed', why: 'Unknown: red-tag and move to the holding area; remove what nobody uses within 30 days.' },
    ],
  },
  {
    id: 'ap', name: 'Invoice clerk desk', scenario: 'An accounts payable clerk at Brightwater Utilities keys 450 invoices a day. Supplier codes, stamps and binders are buried under old paperwork.',
    items: [
      { id: 'calc', name: 'Calculator', shape: 'device', kind: 'useful', freq: 'A', use: 'Used on most invoices', why: 'Used many times a day: class A.' },
      { id: 'stamp', name: 'Received date stamp', shape: 'small', kind: 'useful', freq: 'A', use: 'Every paper invoice', why: 'Daily use: class A.' },
      { id: 'headset2', name: 'Headset', shape: 'headset', kind: 'useful', freq: 'A', use: 'Supplier calls every day', why: 'Daily use: class A.' },
      { id: 'punch', name: 'Hole punch', shape: 'device', kind: 'useful', freq: 'B', use: 'About weekly for filing', why: 'Weekly use: class B, nearby.' },
      { id: 'codes', name: 'Cost-centre code list', shape: 'paper', kind: 'useful', freq: 'B', use: 'Checked a few times a week', why: 'Weekly use: class B. (Better still, build the lookup into the system.)' },
      { id: 'yearend', name: 'Year-end archive binder', shape: 'binder', kind: 'useful', freq: 'C', use: 'Opened once a quarter', why: 'Quarterly use: class C, remote store.' },
      { id: 'cartridge', name: 'Spare scanner cartridge', shape: 'case', kind: 'useful', freq: 'C', use: 'Replaced every few months', why: 'Used every few months: class C.' },
      { id: 'pens', name: 'Dried-out pens', shape: 'pens', kind: 'useless', use: 'Do not write', why: 'Useless: dispose of them.' },
      { id: 'policy', name: '2021 approval policy printout', shape: 'paper', kind: 'useless', use: 'Superseded twice', why: 'Useless and dangerous: an old policy causes mistakes.' },
      { id: 'stapler', name: 'Broken stapler', shape: 'mouse', kind: 'useless', use: 'Jammed for months', why: 'Useless: dispose of it.' },
      { id: 'keys', name: 'Unlabelled keys', shape: 'small', kind: 'unknown', use: 'Might open a cabinet', why: 'Unknown: red-tag and hold for a set period.' },
      { id: 'folder', name: 'Old supplier folder', shape: 'binder', kind: 'unknown', use: 'May hold a live contract', why: 'Unknown: red-tag it and ask the team before removing.' },
    ],
  },
]

const CLUTTER: [number, number][] = [[170, 214], [215, 222], [262, 210], [395, 220], [440, 212], [490, 220], [180, 352], [240, 372], [300, 350], [360, 378], [420, 352], [480, 372], [540, 360], [150, 300]]
const SLOT: Record<Freq, [number, number][]> = {
  A: [[180, 216], [232, 216], [408, 216], [460, 216]],
  B: [[590, 140], [635, 140], [680, 140]],
  C: [[590, 362], [635, 362], [680, 362]],
}
const TAG_SLOTS: [number, number][] = [[50, 356], [95, 356], [72, 330]]
const BIN: [number, number] = [70, 168]

interface DirtSpot { id: string; x: number; y: number; problem?: string; fix?: string }
const DIRT: DirtSpot[] = [
  { id: 'd1', x: 262, y: 236 },
  { id: 'd2', x: 470, y: 268, problem: 'Frayed headset cable behind the desk', fix: 'Replace it now and route cables through a clip so they cannot be crushed.' },
  { id: 'd3', x: 214, y: 300, problem: 'PC vent clogged with dust, running hot', fix: 'Clean the vent and add it to the weekly cleaning checklist.' },
  { id: 'd4', x: 640, y: 102 },
  { id: 'd5', x: 532, y: 226, problem: 'Loose wall socket with exposed wire', fix: 'Isolate it and report to facilities today: a safety defect found by cleaning.' },
]

interface Standard { id: string; label: string; correct: boolean; note: string }
const STANDARDS: Standard[] = [
  { id: 'labels', label: 'Label every location with the item name', correct: true, note: 'Labels let anyone find and return an item.' },
  { id: 'colour', label: 'Colour-code zones A, B and C', correct: true, note: 'Colour makes the frequency rule visible at a glance.' },
  { id: 'shadow', label: 'Shadow outlines for the A items', correct: true, note: 'An empty outline shows instantly that something is missing.' },
  { id: 'checklist', label: 'Five-minute end-of-day reset checklist', correct: true, note: 'A written routine keeps Shine and Straighten alive.' },
  { id: 'photo', label: 'Photo of the standard layout at the desk', correct: true, note: 'A picture of normal makes abnormal obvious.' },
  { id: 'audit', label: 'Monthly audit with scores on the team board', correct: false, note: 'Good idea, wrong step: auditing and keeping the habit is Self-Discipline (step 5). Standardize writes the rule; Self-Discipline keeps it.' },
  { id: 'desk', label: 'Buy a bigger desk', correct: false, note: 'Not a standard. More space usually just means more clutter.' },
]

const STEPS = ['Sort', 'Straighten', 'Shine', 'Standardize', 'Self-Discipline'] as const
const JAPANESE = ['Seiri', 'Seiton', 'Seiso', 'Seiketsu', 'Shitsuke']
const STEP_WHY = [
  'Remove what is not needed before organising anything: otherwise you carefully organise clutter.',
  'Give every remaining item a home by frequency of use. You can only do this once the unneeded items are gone.',
  'Clean and inspect. Cleaning an organised space is fast and makes problems visible.',
  'Write the rules, labels and visual standards that keep the first three S\'s in place.',
  'Make following the standard a habit, checked by audit. Without it the workplace drifts back.',
]

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

function ItemIcon({ shape, n }: { shape: Shape; n: number }) {
  const s = { stroke: 'var(--ink-2)', strokeWidth: 1.5 }
  let body
  switch (shape) {
    case 'headset': body = <g><path d="M-13 4 v-6 a13 13 0 0 1 26 0 v6" fill="none" {...s} strokeWidth={3} /><rect x={-16} y={0} width={7} height={12} rx={3} fill="var(--indigo)" /><rect x={9} y={0} width={7} height={12} rx={3} fill="var(--indigo)" /></g>; break
    case 'cable': body = <g><path d="M-16 8 C -8 -10, 4 18, 16 -4" fill="none" stroke="var(--sky)" strokeWidth={3.5} strokeLinecap="round" /><rect x={12} y={-9} width={8} height={8} rx={2} fill="var(--sky)" /></g>; break
    case 'paper': body = <g><rect x={-12} y={-12} width={24} height={26} rx={2} fill="var(--surface)" {...s} /><path d="M-7 -5 h14 M-7 0 h14 M-7 5 h9" {...s} strokeWidth={1.2} /></g>; break
    case 'binder': body = <g><rect x={-14} y={-14} width={26} height={28} rx={3} fill="var(--violet)" opacity={0.75} /><rect x={-14} y={-14} width={6} height={28} rx={2} fill="var(--indigo)" /></g>; break
    case 'device': body = <g><rect x={-15} y={-10} width={30} height={22} rx={4} fill="var(--surface-3)" {...s} /><rect x={-9} y={-6} width={18} height={7} rx={1.5} fill="var(--teal-soft)" stroke="var(--teal)" /></g>; break
    case 'case': body = <g><rect x={-16} y={-8} width={32} height={20} rx={4} fill="var(--amber)" opacity={0.8} /><rect x={-6} y={-13} width={12} height={6} rx={2} fill="none" stroke="var(--amber)" strokeWidth={2.5} /></g>; break
    case 'box': body = <g><rect x={-15} y={-11} width={30} height={23} rx={2} fill="var(--amber-soft)" stroke="var(--amber)" strokeWidth={1.5} /><path d="M-15 -4 h30" stroke="var(--amber)" /></g>; break
    case 'small': body = <g><rect x={-9} y={-7} width={18} height={14} rx={3} fill="var(--coral)" opacity={0.8} /><rect x={9} y={-3} width={5} height={6} rx={1} fill="var(--ink-3)" /></g>; break
    case 'mouse': body = <g><rect x={-10} y={-13} width={20} height={26} rx={10} fill="var(--surface-3)" {...s} /><path d="M0 -13 v9" {...s} /><path d="M-6 2 l12 8 M6 2 l-12 8" stroke="var(--bad)" strokeWidth={1.8} /></g>; break
    case 'pens': body = <g>{[-8, -2, 4].map((x, i) => <rect key={i} x={x} y={-13} width={4} height={26} rx={2} fill={['var(--sky)', 'var(--coral)', 'var(--ink-3)'][i]} transform={`rotate(${-12 + i * 10} ${x} 0)`} />)}</g>; break
  }
  return (
    <g>
      {body}
      <circle cx={15} cy={-14} r={8} fill="var(--ink)" />
      <text x={15} y={-10} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={10} fontWeight={700} fill="var(--surface)">{n}</text>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Lab state                                                           */
/* ------------------------------------------------------------------ */

interface SimPoint { week: number; score: number }

function simulate(start: number, audit: 'none' | 'monthly' | 'weekly', board: boolean, leader: boolean, std: number): SimPoint[] {
  const decay = Math.max(0.5, 6 - (audit === 'weekly' ? 3 : audit === 'monthly' ? 1.5 : 0) - (board ? 1 : 0) - (leader ? 1 : 0) - 0.3 * std)
  const pts: SimPoint[] = [{ week: 0, score: start }]
  let s = start
  for (let w = 1; w <= 12; w++) {
    s = Math.max(25, s - decay)
    if (audit === 'weekly') s = Math.min(start, s + 2)
    if (audit === 'monthly' && w % 4 === 0) s = Math.min(start, s + 5)
    pts.push({ week: w, score: Math.round(s * 10) / 10 })
  }
  return pts
}

export default function FiveSLab({ embedded }: LabProps) {
  const [wsIdx, setWsIdx] = useState(0)
  const ws = WORKSPACES[wsIdx]
  const [layoutSeed, setLayoutSeed] = useState(0)
  const clutter = useMemo(() => shuffle(CLUTTER), [layoutSeed, wsIdx]) // eslint-disable-line react-hooks/exhaustive-deps
  const [stage, setStage] = useState(0) // highest unlocked stage
  const [view, setView] = useState(0) // stage being shown
  const [sorted, setSorted] = useState<Record<string, Kind>>({})
  const [placed, setPlaced] = useState<Record<string, Freq>>({})
  const [cleaned, setCleaned] = useState<Record<string, boolean>>({})
  const [stds, setStds] = useState<Record<string, boolean>>({})
  const [audit, setAudit] = useState<'none' | 'monthly' | 'weekly'>('none')
  const [board, setBoard] = useState(false)
  const [leader, setLeader] = useState(false)
  const [sim, setSim] = useState<SimPoint[] | null>(null)
  const [week, setWeek] = useState(0)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const [lockMsg, setLockMsg] = useState<string | null>(null)
  const reduced = useReduced()
  const dur = useDur()
  const timer = useRef<number | undefined>(undefined)

  const items = ws.items
  const useful = items.filter(i => i.kind === 'useful')
  const sortDone = items.every(i => sorted[i.id])
  const placeDone = useful.every(i => placed[i.id])
  const shineDone = DIRT.every(d => cleaned[d.id])
  const stdCount = STANDARDS.filter(s => s.correct && stds[s.id]).length
  const stdDone = stdCount >= 3
  const done = [sortDone, placeDone, shineDone, stdDone, !!sim && week >= 12]

  useEffect(() => {
    for (let k = 0; k < 4; k++) if (done[k] && stage === k) { setStage(k + 1) }
  }, [done, stage])

  const reset = (nextWs = wsIdx) => {
    window.clearInterval(timer.current)
    setWsIdx(nextWs); setLayoutSeed(s => s + 1); setStage(0); setView(0); setSorted({}); setPlaced({}); setCleaned({}); setStds({})
    setAudit('none'); setBoard(false); setLeader(false); setSim(null); setWeek(0); setMsg(null); setFocus(null); setLockMsg(null)
  }
  useEffect(() => () => window.clearInterval(timer.current), [])

  /* Position of each item for the current state */
  const pos = (it: Item, idx: number): { x: number; y: number; opacity: number; scale: number } => {
    const c = clutter[idx % clutter.length]
    if (sorted[it.id] === 'useless') return { x: BIN[0], y: BIN[1], opacity: 0, scale: 0.6 }
    if (sorted[it.id] === 'unknown') {
      const k = items.filter(i => i.kind === 'unknown').indexOf(it)
      const t = TAG_SLOTS[k % TAG_SLOTS.length]
      return { x: t[0], y: t[1], opacity: 1, scale: 0.9 }
    }
    const f = placed[it.id]
    if (f) {
      const k = useful.filter(i => i.freq === f).indexOf(it)
      const t = SLOT[f][k % SLOT[f].length]
      return { x: t[0], y: t[1], opacity: 1, scale: 1 }
    }
    return { x: c[0], y: c[1], opacity: 1, scale: 1 }
  }

  /* Clutter that creeps back during the Self-Discipline simulation */
  const simScore = sim ? sim[Math.min(week, 12)].score : null
  const creep = sim && simScore !== null ? Math.round(((sim[0].score - simScore) / sim[0].score) * 10) : 0

  const sortItem = (it: Item, k: Kind) => {
    if (sorted[it.id]) return
    if (k === it.kind) {
      setSorted(s => ({ ...s, [it.id]: k }))
      setMsg({ ok: true, text: `${it.name}: ${it.why}` })
    } else {
      setMsg({ ok: false, text: `${it.name} is not ${k}. Look at how it is used: "${it.use}". Try again.` })
    }
  }
  const placeItem = (it: Item, f: Freq) => {
    if (placed[it.id]) return
    if (f === it.freq) { setPlaced(p => ({ ...p, [it.id]: f })); setMsg({ ok: true, text: `${it.name} goes to ${f}. ${it.why}` }) }
    else setMsg({ ok: false, text: `${it.name} is "${it.use.toLowerCase()}". ${f === 'A' ? 'A is for daily use, within arm\'s reach.' : f === 'B' ? 'B is for about weekly use, nearby.' : 'C is for monthly or quarterly use, in a remote store.'} Try again.` })
  }
  const clean = (d: DirtSpot) => {
    if (view !== 2 || cleaned[d.id]) return
    setCleaned(c => ({ ...c, [d.id]: true }))
    setMsg(d.problem ? { ok: false, text: `Hidden problem found: ${d.problem}. ${d.fix}` } : { ok: true, text: 'Clean. Nothing abnormal under this one.' })
  }
  const run = () => {
    const start = Math.min(100, 75 + 5 * stdCount)
    const pts = simulate(start, audit, board, leader, stdCount)
    setSim(pts)
    window.clearInterval(timer.current)
    if (reduced) { setWeek(12); return }
    setWeek(0)
    let w = 0
    timer.current = window.setInterval(() => { w += 1; setWeek(w); if (w >= 12) window.clearInterval(timer.current) }, Math.max(60, dur(0.18) * 1000))
  }

  const goStage = (k: number) => {
    if (k > stage) { setLockMsg(`${STEPS[k]} is locked until ${STEPS[stage]} is complete. ${STEP_WHY[k]}`); return }
    setLockMsg(null); setView(k); setMsg(null); setFocus(null)
  }

  const labelsOn = !!stds.labels
  const colourOn = !!stds.colour
  const shadowOn = !!stds.shadow
  const zoneTone = (f: Freq) => (colourOn ? (f === 'A' ? 'var(--good)' : f === 'B' ? 'var(--sky)' : 'var(--amber)') : 'var(--line-2)')
  const ariaState = `${ws.name}. ${Object.values(sorted).filter(k => k === 'useless').length} items disposed, ${Object.keys(placed).length} of ${useful.length} items placed, ${Object.keys(cleaned).length} of ${DIRT.length} spots cleaned${simScore !== null ? `, 5S score ${Math.round(simScore)} at week ${week}` : ''}.`

  const svg = (
    <svg viewBox="0 0 720 420" className="h-auto w-full rounded-2xl border border-line" role="img" aria-label={ariaState}>
      <rect width={720} height={420} fill="var(--surface-2)" />
      <rect y={280} width={720} height={140} fill="var(--surface-3)" opacity={0.6} />
      {/* Bin */}
      <g><rect x={50} y={150} width={40} height={46} rx={4} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} /><rect x={46} y={144} width={48} height={8} rx={2} fill="var(--ink-3)" /><text x={70} y={214} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={12} fill="var(--ink-2)">Dispose</text></g>
      {/* Red tag area */}
      <rect x={18} y={300} width={112} height={92} rx={8} fill="var(--bad-soft)" stroke="var(--bad)" strokeDasharray="5 4" />
      <text x={74} y={406} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={12} fill="var(--bad)">Red tag area</text>
      {/* Wall socket */}
      <rect x={522} y={214} width={20} height={24} rx={3} fill="var(--surface)" stroke="var(--ink-3)" />
      {/* Desk */}
      <rect x={150} y={238} width={360} height={14} rx={3} fill="var(--ink-3)" opacity={0.65} />
      <rect x={160} y={252} width={10} height={90} fill="var(--ink-3)" opacity={0.5} /><rect x={490} y={252} width={10} height={90} fill="var(--ink-3)" opacity={0.5} />
      {/* PC tower */}
      <rect x={196} y={270} width={36} height={64} rx={4} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} />
      {[0, 1, 2].map(i => <line key={i} x1={204} x2={224} y1={292 + i * 7} y2={292 + i * 7} stroke="var(--ink-3)" />)}
      {/* Monitor */}
      <rect x={290} y={160} width={84} height={56} rx={4} fill="var(--surface)" stroke="var(--ink-3)" strokeWidth={1.5} /><rect x={326} y={216} width={12} height={22} fill="var(--ink-3)" />
      {/* Zone A band */}
      <motion.rect x={150} y={196} width={360} height={42} rx={6} fill="none" stroke={zoneTone('A')} strokeWidth={2} strokeDasharray={colourOn ? undefined : '5 5'} initial={false} animate={{ opacity: view >= 1 ? 1 : 0 }} />
      {view >= 1 && <text x={156} y={192} fontFamily="var(--font-sans)" fontSize={12} fontWeight={600} fill="var(--ink-2)">A: arm's reach, daily</text>}
      {/* Zone B cabinet */}
      <rect x={565} y={110} width={140} height={58} rx={6} fill="var(--surface)" stroke={zoneTone('B')} strokeWidth={view >= 1 ? 2 : 1.5} />
      <text x={635} y={186} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={12} fontWeight={600} fill="var(--ink-2)">B: room cabinet, weekly</text>
      {/* Zone C remote store */}
      <rect x={565} y={326} width={140} height={64} rx={6} fill="var(--surface)" stroke={zoneTone('C')} strokeWidth={view >= 1 ? 2 : 1.5} strokeDasharray="6 4" />
      <text x={635} y={406} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={12} fontWeight={600} fill="var(--ink-2)">C: central store, monthly</text>
      {/* Shadow outlines */}
      {shadowOn && SLOT.A.slice(0, useful.filter(i => i.freq === 'A').length).map(([x, y], i) => <rect key={i} x={x - 20} y={y - 18} width={40} height={36} rx={6} fill="none" stroke="var(--ink-3)" strokeDasharray="3 3" />)}
      {/* Dirt and hidden problems */}
      {DIRT.map(d => (
        <g key={d.id} {...(view === 2 && !cleaned[d.id] ? { role: 'button', tabIndex: 0, 'aria-label': 'Dirty spot: clean it', onClick: () => clean(d), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clean(d) } }, style: { cursor: 'pointer' } } : {})}>
          <motion.ellipse cx={d.x} cy={d.y} rx={18} ry={10} fill="var(--amber)" initial={false} animate={{ opacity: cleaned[d.id] ? 0 : 0.45, scale: cleaned[d.id] ? 0.9 : 1 }} transition={{ duration: dur(0.4) }} style={{ transformOrigin: `${d.x}px ${d.y}px` }} />
          {view === 2 && !cleaned[d.id] && <circle cx={d.x} cy={d.y} r={20} fill="none" stroke="var(--amber)" strokeWidth={2} strokeDasharray="4 3" />}
          {cleaned[d.id] && d.problem && (
            <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: `${d.x}px ${d.y}px` }}>
              <path d={`M${d.x} ${d.y - 12} L${d.x + 12} ${d.y + 9} L${d.x - 12} ${d.y + 9} Z`} fill="var(--bad)" />
              <text x={d.x} y={d.y + 6} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={12} fontWeight={700} fill="var(--surface)">!</text>
            </motion.g>
          )}
        </g>
      ))}
      {/* Items */}
      {items.map((it, idx) => {
        const p = pos(it, idx)
        const showLabel = labelsOn && placed[it.id]
        return (
          <motion.g key={`${ws.id}-${it.id}`} initial={false} animate={{ x: p.x, y: p.y, opacity: p.opacity, scale: p.scale }} transition={{ duration: dur(0.7), ease: [0.23, 1, 0.32, 1] }}>
            {focus === it.id && <circle r={24} fill="none" stroke="var(--amber)" strokeWidth={2.5} />}
            <ItemIcon shape={it.shape} n={idx + 1} />
            {sorted[it.id] === 'unknown' && <g><rect x={-20} y={4} width={14} height={9} rx={2} fill="var(--bad)" /><line x1={-13} y1={4} x2={-17} y2={-2} stroke="var(--bad)" /></g>}
            {showLabel && <text y={30} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={11} fill="var(--ink-2)">{it.name.split(' ')[0]}</text>}
          </motion.g>
        )
      })}
      {/* Clutter creeping back */}
      {Array.from({ length: Math.max(0, creep) }).map((_, i) => {
        const c = CLUTTER[(i * 5) % CLUTTER.length]
        return <motion.rect key={`creep-${i}`} x={c[0] - 12 + (i % 3) * 6} y={c[1] - 8} width={24} height={16} rx={2} fill="var(--surface)" stroke="var(--coral)" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 0.9, y: 0 }} transition={{ duration: dur(0.3) }} />
      })}
    </svg>
  )

  /* Stage panels */
  const tabTone = (k: number) => (done[k] ? 'border-good bg-good-soft text-good' : k === view ? 'border-amber bg-amber-soft text-ink' : k <= stage ? 'border-line bg-surface text-ink' : 'border-line bg-surface-2 text-ink-3')

  const panel = (() => {
    if (view === 0) return (
      <div>
        <p className="text-sm leading-relaxed text-ink-2">Classify every item. <strong className="text-ink">Useful</strong> items stay for now, <strong className="text-ink">useless</strong> items are disposed of immediately and <strong className="text-ink">unknown</strong> items are red-tagged and held for a set period (the book's useful, useless, unknown method).</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {items.map((it, idx) => (
            <li key={it.id} className={`rounded-xl border p-2.5 ${sorted[it.id] ? 'border-good/40 bg-good-soft/40' : 'border-line'}`} onMouseEnter={() => setFocus(it.id)} onMouseLeave={() => setFocus(null)}>
              <div className="flex items-baseline justify-between gap-2 text-sm"><span className="font-semibold text-ink"><span className="tabular text-ink-3">{idx + 1}.</span> {it.name}</span>{sorted[it.id] && <span className="chip">{sorted[it.id]}</span>}</div>
              <div className="text-xs text-ink-3">{it.use}</div>
              {!sorted[it.id] && (
                <div className="mt-2 flex gap-1.5">
                  {(['useful', 'useless', 'unknown'] as Kind[]).map(k => <button key={k} className="btn btn-soft btn-sm flex-1 px-1 capitalize" onFocus={() => setFocus(it.id)} onClick={() => sortItem(it, k)}>{k === 'unknown' ? 'Red tag' : k}</button>)}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
    if (view === 1) return (
      <div>
        <p className="text-sm leading-relaxed text-ink-2">Give each useful item a home by <strong className="text-ink">frequency of use</strong>: A within arm's reach (daily), B nearby (about weekly), C in a remote store (monthly or quarterly).</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {useful.map(it => (
            <li key={it.id} className={`rounded-xl border p-2.5 ${placed[it.id] ? 'border-good/40 bg-good-soft/40' : 'border-line'}`} onMouseEnter={() => setFocus(it.id)} onMouseLeave={() => setFocus(null)}>
              <div className="flex items-baseline justify-between gap-2 text-sm"><span className="font-semibold text-ink">{it.name}</span>{placed[it.id] && <span className="chip">Zone {placed[it.id]}</span>}</div>
              <div className="text-xs text-ink-3">{it.use}</div>
              {!placed[it.id] && <div className="mt-2 flex gap-1.5">{(['A', 'B', 'C'] as Freq[]).map(f => <button key={f} className="btn btn-soft btn-sm flex-1" onFocus={() => setFocus(it.id)} onClick={() => placeItem(it, f)}>{f}</button>)}</div>}
            </li>
          ))}
        </ul>
      </div>
    )
    if (view === 2) return (
      <div>
        <p className="text-sm leading-relaxed text-ink-2">Select each dirty spot in the workspace to clean it. <strong className="text-ink">Cleaning is inspection</strong>: watch for problems the dirt was hiding. {Object.keys(cleaned).length} of {DIRT.length} cleaned.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DIRT.map((d, i) => <button key={d.id} className="btn btn-soft btn-sm" disabled={!!cleaned[d.id]} onClick={() => clean(d)}>{cleaned[d.id] ? <Check className="size-4" /> : <Sparkles className="size-4" />} Spot {i + 1}</button>)}
        </div>
        {DIRT.some(d => d.problem && cleaned[d.id]) && (
          <ul className="mt-3 space-y-1.5 text-sm">
            {DIRT.filter(d => d.problem && cleaned[d.id]).map(d => <li key={d.id} className="rounded-xl bg-bad-soft px-3 py-2 text-ink"><strong>{d.problem}.</strong> {d.fix}</li>)}
          </ul>
        )}
      </div>
    )
    if (view === 3) return (
      <div>
        <p className="text-sm leading-relaxed text-ink-2">Choose the standards that will keep Sort, Straighten and Shine in place. Pick at least three. Watch the workspace: each standard changes what you can see.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {STANDARDS.map(s => {
            const on = !!stds[s.id]
            return (
              <li key={s.id}>
                <label className={`flex h-full cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-sm ${on ? (s.correct ? 'border-good bg-good-soft/50' : 'border-amber bg-amber-soft/50') : 'border-line'}`}>
                  <input type="checkbox" className="mt-1 accent-[var(--amber)]" checked={on} onChange={e => { setStds(x => ({ ...x, [s.id]: e.target.checked })); if (e.target.checked) setMsg({ ok: s.correct, text: s.note }) }} />
                  <span><span className="font-semibold text-ink">{s.label}</span>{on && <span className="mt-0.5 block text-xs text-ink-2">{s.note}</span>}</span>
                </label>
              </li>
            )
          })}
        </ul>
        <p className="mt-2 text-xs text-ink-3 tabular">{stdCount} valid standards chosen.</p>
      </div>
    )
    return (
      <div>
        <p className="text-sm leading-relaxed text-ink-2">Decide how the team will keep the standard, then run 12 simulated weeks. <span className="font-semibold text-ink">Illustrative model:</span> the numbers show the pattern of sustain versus decay, not a forecast.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <fieldset>
            <legend className="label">Audit frequency</legend>
            <div className="flex flex-col gap-1.5">
              {(['none', 'monthly', 'weekly'] as const).map(a => (
                <label key={a} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm capitalize ${audit === a ? 'border-amber bg-amber-soft/60' : 'border-line'}`}><input type="radio" name="audit" className="accent-[var(--amber)]" checked={audit === a} onChange={() => setAudit(a)} />{a === 'none' ? 'No audits' : a}</label>
              ))}
            </div>
          </fieldset>
          <label className="flex cursor-pointer items-start gap-2 self-start rounded-lg border border-line p-2.5 text-sm"><input type="checkbox" className="mt-1 accent-[var(--amber)]" checked={board} onChange={e => setBoard(e.target.checked)} />Share audit scores on the team board</label>
          <label className="flex cursor-pointer items-start gap-2 self-start rounded-lg border border-line p-2.5 text-sm"><input type="checkbox" className="mt-1 accent-[var(--amber)]" checked={leader} onChange={e => setLeader(e.target.checked)} />Team leader joins the audits</label>
        </div>
        <button className="btn btn-primary mt-3" onClick={run}><Play className="size-4" /> Run 12 weeks</button>
        {sim && <SustainChart sim={sim} week={week} />}
      </div>
    )
  })()

  const explore = (
    <div className="space-y-4">
      <ol className="grid grid-cols-5 gap-1.5" aria-label="5S stages">
        {STEPS.map((s, k) => (
          <li key={s}>
            <button onClick={() => goStage(k)} aria-current={view === k ? 'step' : undefined} aria-disabled={k > stage}
              className={`flex w-full flex-col items-center gap-0.5 rounded-xl border px-1 py-2 text-center transition-colors ${tabTone(k)}`}>
              <span className="tabular flex items-center gap-1 text-xs font-semibold">{done[k] ? <Check className="size-3.5" /> : k > stage ? <Lock className="size-3.5" /> : null}{k + 1}</span>
              <span className="text-[11px] font-semibold leading-tight sm:text-sm">{s}</span>
              <span className="hidden text-[11px] text-ink-3 sm:block">{JAPANESE[k]}</span>
            </button>
          </li>
        ))}
      </ol>
      <AnimatePresence>{lockMsg && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-ink-2" role="status"><Lock className="mr-1.5 inline size-4 text-ink-3" />{lockMsg}</motion.p>}</AnimatePresence>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div>{svg}<p className="mt-2 text-xs leading-relaxed text-ink-3"><strong className="text-ink-2">Why this order:</strong> {STEP_WHY[view]}</p></div>
        <div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <h3 className="font-display text-lg font-semibold text-ink">{view + 1}. {STEPS[view]} <span className="text-sm font-normal text-ink-3">({JAPANESE[view]})</span></h3>
              <div className="mt-2">{panel}</div>
            </motion.div>
          </AnimatePresence>
          {msg && <Feedback ok={msg.ok}>{msg.text}</Feedback>}
          {done[view] && view < 4 && <button className="btn btn-primary mt-3" onClick={() => goStage(view + 1)}>Continue to {STEPS[view + 1]}</button>}
        </div>
      </div>
    </div>
  )

  return (
    <LabShell
      lab="fives"
      embedded={embedded}
      instructions="Work through the five steps in order. Each step unlocks when the previous one is complete, and the workspace changes as you go: unneeded items leave, kept items move to their zones, dirt is cleaned and standards appear. In the last step, choose how the team sustains the gains and simulate twelve weeks."
      scenario={ws.scenario}
      explore={explore}
      challenge={<Challenge />}
      check={<KnowledgeCheck lab="fives" items={CHECK} />}
      onReset={() => reset()}
      onNewExample={() => reset((wsIdx + 1) % WORKSPACES.length)}
    />
  )
}

function SustainChart({ sim, week }: { sim: SimPoint[]; week: number }) {
  const W = 360, H = 170, L = 34, B = 26, Tp = 10
  const x = (w: number) => L + (w / 12) * (W - L - 10)
  const y = (s: number) => Tp + (1 - s / 100) * (H - Tp - B)
  const shown = sim.slice(0, Math.min(week, 12) + 1)
  const d = shown.map((p, i) => `${i ? 'L' : 'M'}${x(p.week).toFixed(1)} ${y(p.score).toFixed(1)}`).join(' ')
  const last = shown[shown.length - 1]
  const tone = last.score >= 85 ? 'var(--good)' : last.score >= 65 ? 'var(--amber)' : 'var(--bad)'
  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`5S score over 12 weeks: starts at ${Math.round(sim[0].score)}, week ${last.week} score ${Math.round(last.score)}`}>
        {[25, 50, 75, 100].map(v => <g key={v}><line x1={L} x2={W - 10} y1={y(v)} y2={y(v)} stroke="var(--line)" /><text x={L - 6} y={y(v) + 4} textAnchor="end" fontFamily="var(--font-sans)" fontSize={11} fill="var(--ink-3)">{v}</text></g>)}
        {[0, 4, 8, 12].map(w => <text key={w} x={x(w)} y={H - 8} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={11} fill="var(--ink-3)">wk {w}</text>)}
        <path d={d} fill="none" stroke={tone} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(last.week)} cy={y(last.score)} r={5} fill={tone} />
      </svg>
      <p className="tabular text-sm text-ink-2">Week {last.week}: 5S audit score <strong className="text-ink">{Math.round(last.score)}</strong> of 100.{week >= 12 && (last.score >= 85 ? ' The standard is holding: Self-Discipline is working.' : last.score >= 65 ? ' Slipping. More frequent audits and visible scores would hold the gains.' : ' The workplace has drifted back to clutter. A standard nobody audits is soon ignored.')}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Challenge                                                           */
/* ------------------------------------------------------------------ */

const MATCH_POOL: { text: string; step: number }[] = [
  { text: 'Delete 140 unused macros from the shared library', step: 0 },
  { text: 'Red-tag an unlabelled box and hold it for 30 days', step: 0 },
  { text: 'Keep the console cable within arm\'s reach because it is used daily', step: 1 },
  { text: 'Group remaining macros by call type with clear names', step: 1 },
  { text: 'Fix broken links inside knowledge articles', step: 2 },
  { text: 'Clean the van every Friday and report damaged tools', step: 2 },
  { text: 'Publish a naming rule and a photo of the standard layout', step: 3 },
  { text: 'Introduce colour-coded zones and a restock checklist', step: 3 },
  { text: 'Team lead audits two vans a week and shares scores', step: 4 },
  { text: 'Monthly compliance check discussed in the huddle', step: 4 },
]

function Challenge() {
  const [seed, setSeed] = useState(0)
  const [order, setOrder] = useState<number[]>(() => shuffle([0, 1, 2, 3, 4]))
  const matches = useMemo(() => [0, 1, 2, 3, 4].map(s => shuffle(MATCH_POOL.filter(m => m.step === s))[0]).sort(() => Math.random() - 0.5), [seed])
  const [picks, setPicks] = useState<(number | null)[]>([null, null, null, null, null])
  const [checked, setChecked] = useState(false)
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (checked || j < 0 || j >= order.length) return
    const n = [...order]; [n[i], n[j]] = [n[j], n[i]]; setOrder(n)
  }
  const orderOk = order.map((s, i) => s === i)
  const matchOk = matches.map((m, i) => picks[i] === m.step)
  const score = orderOk.filter(Boolean).length + matchOk.filter(Boolean).length
  const check = () => {
    setChecked(true)
    recordLab('fives', Math.round((score / 10) * 100))
    const wrong = orderOk.filter(x => !x).length + matchOk.filter(x => !x).length
    if (wrong) update(p => { for (let k = 0; k < Math.min(wrong, 3); k++) p.mistakes.push({ at: Date.now(), tag: 'five-s-order', lesson: '1.4.5' }) })
  }
  const again = () => { setSeed(s => s + 1); setOrder(shuffle([0, 1, 2, 3, 4])); setPicks([null, null, null, null, null]); setChecked(false) }
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">1. Put the five steps in syllabus order</h3>
        <ol className="mt-3 space-y-2">
          {order.map((s, i) => (
            <motion.li layout key={s} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }} className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${checked ? (orderOk[i] ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft') : 'border-line bg-surface'}`}>
              <span className="tabular w-5 text-sm font-semibold text-ink-3">{i + 1}</span>
              <span className="flex-1 font-semibold text-ink">{STEPS[s]}</span>
              {checked && !orderOk[i] && <span className="text-xs text-ink-2">should be {STEPS.indexOf(STEPS[s]) + 1}</span>}
              <button className="btn btn-ghost btn-sm btn-icon" aria-label={`Move ${STEPS[s]} up`} disabled={checked || i === 0} onClick={() => move(i, -1)}><ArrowUp className="size-4" /></button>
              <button className="btn btn-ghost btn-sm btn-icon" aria-label={`Move ${STEPS[s]} down`} disabled={checked || i === order.length - 1} onClick={() => move(i, 1)}><ArrowDown className="size-4" /></button>
            </motion.li>
          ))}
        </ol>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-ink">2. Match each action to its step</h3>
        <ul className="mt-3 space-y-2">
          {matches.map((m, i) => (
            <li key={m.text} className={`rounded-xl border p-2.5 ${checked ? (matchOk[i] ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft') : 'border-line'}`}>
              <label className="block text-sm text-ink" htmlFor={`fs-m-${i}`}>{m.text}</label>
              <select id={`fs-m-${i}`} className="field mt-1.5 py-1.5 text-sm" disabled={checked} value={picks[i] ?? ''} onChange={e => { const n = [...picks]; n[i] = e.target.value === '' ? null : Number(e.target.value); setPicks(n) }}>
                <option value="">Choose a step</option>
                {STEPS.map((s, k) => <option key={s} value={k}>{s}</option>)}
              </select>
              {checked && !matchOk[i] && <p className="mt-1 text-xs text-ink-2">Answer: {STEPS[m.step]}. {STEP_WHY[m.step]}</p>}
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-2">
        {!checked ? <button className="btn btn-primary" disabled={picks.some(p => p === null)} onClick={check}>Check answers</button>
          : <div className="flex flex-wrap items-center gap-3"><span className="font-semibold text-ink tabular">{score} of 10 correct.</span><button className="btn btn-primary" onClick={again}>New challenge</button></div>}
        {checked && <Feedback ok={score === 10}>{score === 10 ? 'Perfect order and matching.' : 'Remember: Sort, Straighten, Shine, Standardize, Self-Discipline. Standardize writes the rule; Self-Discipline keeps it.'}</Feedback>}
      </div>
    </div>
  )
}

const CHECK: CheckItem[] = [
  { q: 'What is the correct syllabus order of 5S?', options: ['Sort, Shine, Straighten, Standardize, Self-Discipline', 'Sort, Straighten, Shine, Standardize, Self-Discipline', 'Straighten, Sort, Shine, Self-Discipline, Standardize', 'Shine, Sort, Straighten, Standardize, Self-Discipline'], answer: 1, why: 'Sort, Straighten, Shine, Standardize, Self-Discipline (Seiri, Seiton, Seiso, Seiketsu, Shitsuke).' },
  { q: 'In the Sort step, what happens to an item whose usefulness is unknown?', options: ['It is thrown away immediately', 'It is moved to arm\'s reach', 'It is red-tagged and removed if nobody uses it within a set period', 'It is cleaned'], answer: 2, why: 'Useful items are kept, useless items disposed of, and unknown items are tagged and held for a set period.' },
  { q: 'A team posts a cleaning schedule on the wall. Which S is this?', options: ['Shine', 'Standardize', 'Self-Discipline', 'Sort'], answer: 1, why: 'Creating the rule or schedule is Standardize. Following and auditing it over time is Self-Discipline.' },
  { q: 'An item is used about once a week. Where should it be stored?', options: ['Within arm\'s reach (A)', 'Nearby, in the same room (B)', 'In a remote store (C)', 'In the red tag area'], answer: 1, why: 'Weekly use is class B: nearby, for example a cabinet in the same room.' },
]
