import { AnimatePresence, Reorder, motion, useDragControls } from 'motion/react'
import { ArrowDown, ArrowUp, CheckCircle2, CircleX, GripVertical } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { LabProps } from './registry'
import { Feedback, KnowledgeCheck, LabShell, shuffle, type CheckItem } from './kit'
import { Segmented } from '../components/ui'
import { recordLab, update } from '../lib/store'

interface Event { id: string; key: number; year: string; title: string; detail: string }
type DeckId = 'sigma' | 'lean'

const DECKS: Record<DeckId, { name: string; events: Event[] }> = {
  sigma: {
    name: 'Six Sigma and quality',
    events: [
      { id: 'shewhart', key: 1924, year: '1924', title: 'Shewhart\'s control chart', detail: 'Walter Shewhart at Bell Labs separates routine variation from unusual variation with the first control chart.' },
      { id: 'deming', key: 1950, year: '1950', title: 'Deming lectures in Japan', detail: 'W. Edwards Deming teaches statistical quality control to Japanese managers and engineers.' },
      { id: 'feigenbaum', key: 1955, year: '1950s', title: 'Feigenbaum: Total Quality Control', detail: 'Armand Feigenbaum argues that quality is every department\'s job, not only inspection\'s.' },
      { id: 'crosby', key: 1979, year: '1979', title: 'Crosby: Quality is Free', detail: 'Philip Crosby popularises zero defects and the cost of quality.' },
      { id: 'motorola', key: 1986, year: '1986', title: 'Motorola develops Six Sigma', detail: 'Bill Smith and Mikel Harry create Six Sigma; CEO Bob Galvin champions it.' },
      { id: 'baldrige', key: 1988, year: '1988', title: 'Motorola wins the first Baldrige Award', detail: 'The Malcolm Baldrige National Quality Award recognises Motorola\'s quality results.' },
      { id: 'allied', key: 1991, year: '1991', title: 'AlliedSignal adopts Six Sigma', detail: 'Larry Bossidy takes Six Sigma beyond Motorola and reports large savings.' },
      { id: 'ge', key: 1995, year: '1995', title: 'GE launches Six Sigma', detail: 'Jack Welch makes Six Sigma famous, tying it to executive targets.' },
      { id: 'lss', key: 2002, year: 'Early 2000s', title: 'Lean Six Sigma becomes the usual name', detail: 'Lean speed and Six Sigma precision combine under one DMAIC roadmap.' },
    ],
  },
  lean: {
    name: 'Lean',
    events: [
      { id: 'ford', key: 1913, year: '1913', title: 'Ford\'s moving assembly line', detail: 'Highland Park shows the power of flow, at the cost of huge inventories and low variety.' },
      { id: 'loom', key: 1924, year: '1924', title: 'Toyoda automatic loom', detail: 'Sakichi Toyoda\'s loom stops itself when a thread breaks: the root of jidoka.' },
      { id: 'toyota', key: 1937, year: '1937', title: 'Toyota Motor Company founded', detail: 'Kiichiro Toyoda builds a car business and pushes Just-in-Time production.' },
      { id: 'ohno', key: 1955, year: '1950s onward', title: 'Ohno builds the Toyota Production System', detail: 'Taiichi Ohno develops TPS on the shop floor and names the seven wastes.' },
      { id: 'oil', key: 1973, year: '1973', title: 'Oil crisis', detail: 'Toyota recovers faster than most manufacturers, and the world starts paying attention to TPS.' },
      { id: 'krafcik', key: 1988, year: '1988', title: 'Krafcik coins "lean"', detail: 'John Krafcik, at MIT, calls Toyota-style production lean because it uses less of everything.' },
      { id: 'machine', key: 1990, year: '1990', title: 'The Machine That Changed the World', detail: 'Womack, Jones and Roos make lean production a mainstream term.' },
      { id: 'thinking', key: 1996, year: '1996', title: 'Lean Thinking', detail: 'Womack and Jones set out five principles: value, value stream, flow, pull, perfection.' },
      { id: 'lss2', key: 2002, year: 'Early 2000s', title: 'Lean Six Sigma', detail: 'Lean is combined with Six Sigma, so Green Belts study waste and variation together.' },
    ],
  },
}

function Row({ ev, index, total, status, onMove, locked }: { ev: Event; index: number; total: number; status: boolean | null; onMove: (dir: -1 | 1) => void; locked: boolean }) {
  const controls = useDragControls()
  const tone = status === null ? 'border-line bg-surface' : status ? 'border-good bg-good-soft' : 'border-bad bg-bad-soft'
  return (
    <Reorder.Item value={ev.id} dragListener={false} dragControls={controls} className={`flex items-center gap-2 rounded-xl border px-2 py-2 shadow-sm ${tone}`} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
      <button type="button" aria-hidden tabIndex={-1} disabled={locked} className="hidden cursor-grab touch-none p-1 text-ink-3 active:cursor-grabbing sm:block" onPointerDown={e => !locked && controls.start(e)}>
        <GripVertical className="size-4" />
      </button>
      <span className="tabular w-5 shrink-0 text-center text-sm font-semibold text-ink-3">{index + 1}</span>
      <span className="flex-1 text-sm font-semibold leading-snug text-ink">{ev.title}{status !== null && <span className="ml-2 font-normal text-ink-2">({ev.year})</span>}</span>
      {status !== null && (status ? <CheckCircle2 className="size-4 shrink-0 text-good" aria-label="Correct position" /> : <CircleX className="size-4 shrink-0 text-bad" aria-label="Wrong position" />)}
      <button className="btn btn-ghost btn-sm btn-icon shrink-0" aria-label={`Move ${ev.title} earlier`} disabled={locked || index === 0} onClick={() => onMove(-1)}><ArrowUp className="size-4" /></button>
      <button className="btn btn-ghost btn-sm btn-icon shrink-0" aria-label={`Move ${ev.title} later`} disabled={locked || index === total - 1} onClick={() => onMove(1)}><ArrowDown className="size-4" /></button>
    </Reorder.Item>
  )
}

function Timeline({ events, tone }: { events: Event[]; tone: string }) {
  const sorted = [...events].sort((a, b) => a.key - b.key)
  return (
    <ol className="relative mt-4 space-y-4 pl-6">
      <motion.span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-0.5 origin-top rounded bg-line-2" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }} />
      {sorted.map((e, i) => (
        <motion.li key={e.id} className="relative" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}>
          <span aria-hidden className="absolute -left-6 top-1 size-4 rounded-full border-4 border-surface" style={{ background: tone }} />
          <div className="tabular font-display text-sm font-semibold" style={{ color: tone }}>{e.year}</div>
          <div className="font-semibold text-ink">{e.title}</div>
          <p className="text-sm leading-relaxed text-ink-2">{e.detail}</p>
        </motion.li>
      ))}
    </ol>
  )
}

/* ---------------- Challenge: which came first? ---------------- */

function Challenge() {
  const [seed, setSeed] = useState(0)
  const all = useMemo(() => [...DECKS.sigma.events, ...DECKS.lean.events.filter(e => e.id !== 'lss2')], [])
  const pairs = useMemo(() => {
    const out: [Event, Event][] = []
    let guard = 0
    while (out.length < 8 && guard++ < 200) {
      const [a, b] = shuffle(all).slice(0, 2)
      if (Math.abs(a.key - b.key) < 2) continue
      if (out.some(([x, y]) => (x.id === a.id && y.id === b.id) || (x.id === b.id && y.id === a.id))) continue
      out.push([a, b])
    }
    return out
  }, [seed, all])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  if (i >= pairs.length) {
    return (
      <div className="rounded-2xl bg-violet-soft p-5">
        <p className="font-display text-2xl font-semibold text-ink">{score} of {pairs.length} correct</p>
        <p className="mt-1 text-sm text-ink-2">Anchor dates: Ford 1913, Shewhart 1924, Deming 1950, Motorola 1986, Krafcik 1988, GE 1995, Lean Thinking 1996.</p>
        <button className="btn btn-primary mt-4" onClick={() => { setSeed(s => s + 1); setI(0); setPicked(null); setScore(0) }}>New challenge</button>
      </div>
    )
  }
  const [a, b] = pairs[i]
  const first = a.key < b.key ? a : b
  const choose = (id: string) => {
    if (picked) return
    setPicked(id)
    if (id === first.id) setScore(s => s + 1)
    else update(p => { p.mistakes.push({ at: Date.now(), tag: 'history-facts', lesson: '1.1.2' }) })
  }
  const next = () => {
    setI(i + 1); setPicked(null)
    if (i + 1 >= pairs.length) recordLab('history', Math.round((score / pairs.length) * 100))
  }
  return (
    <div>
      <div className="mb-3 flex justify-between text-sm text-ink-3"><span className="tabular">Pair {i + 1} of {pairs.length}</span><span className="tabular">Score {score}</span></div>
      <h3 className="text-lg font-semibold text-ink">Which came first?</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[a, b].map(e => {
          const show = picked !== null
          const cls = show && e.id === first.id ? 'border-good bg-good-soft' : show && e.id === picked ? 'border-bad bg-bad-soft' : 'border-line hover:border-violet hover:bg-violet-soft/40'
          return (
            <button key={e.id} disabled={show} onClick={() => choose(e.id)} className={`rounded-2xl border p-4 text-left transition-colors disabled:cursor-default ${cls}`}>
              <span className="block font-semibold text-ink">{e.title}</span>
              {show && <span className="tabular mt-1 block font-display text-lg font-semibold text-violet">{e.year}</span>}
            </button>
          )
        })}
      </div>
      {picked && <><Feedback ok={picked === first.id}>{first.title} ({first.year}) came first. {first.detail}</Feedback><button className="btn btn-primary mt-3" onClick={next}>{i + 1 < pairs.length ? 'Next pair' : 'See score'}</button></>}
    </div>
  )
}

const CHECK: CheckItem[] = [
  { q: 'Which company developed Six Sigma, and roughly when?', options: ['Toyota, 1950s', 'Motorola, around 1986', 'GE, 1995', 'Ford, 1913'], answer: 1, why: 'Motorola developed Six Sigma around 1986. GE made it famous from 1995.' },
  { q: 'Who coined the term "lean" for Toyota-style production?', options: ['Taiichi Ohno', 'John Krafcik', 'Henry Ford', 'W. Edwards Deming'], answer: 1, why: 'John Krafcik used the word in 1988; Womack, Jones and Roos popularised it in 1990.' },
  { q: 'Which came FIRST?', options: ['Lean Thinking (1996)', 'GE launches Six Sigma (1995)', 'Shewhart\'s control chart (1924)', 'Crosby\'s Quality is Free (1979)'], answer: 2, why: 'Shewhart\'s control chart dates from 1924, long before the others.' },
]

/* ---------------- Lab ---------------- */

export default function HistoryLab({ embedded }: LabProps) {
  const [deck, setDeck] = useState<DeckId>('sigma')
  const [order, setOrder] = useState<string[]>(() => shuffle(DECKS.sigma.events.map(e => e.id)))
  const [checked, setChecked] = useState(false)
  const [reveal, setReveal] = useState(false)
  const events = DECKS[deck].events
  const byId = (id: string) => events.find(e => e.id === id)!
  const sortedKeys = useMemo(() => events.map(e => e.key).sort((a, b) => a - b), [events])
  const status = order.map((id, i) => byId(id).key === sortedKeys[i])
  const right = status.filter(Boolean).length
  const tone = deck === 'sigma' ? 'var(--violet)' : 'var(--amber)'

  const start = (d: DeckId) => { setDeck(d); setOrder(shuffle(DECKS[d].events.map(e => e.id))); setChecked(false); setReveal(false) }
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= order.length) return
    const n = [...order]; [n[i], n[j]] = [n[j], n[i]]; setOrder(n); setChecked(false)
  }
  const check = () => {
    setChecked(true)
    const wrong = status.filter(s => !s).length
    if (wrong) update(p => { p.mistakes.push({ at: Date.now(), tag: 'history-facts', lesson: deck === 'sigma' ? '1.1.2' : '1.4.2' }) })
  }

  const explore = (
    <div className="space-y-4">
      <Segmented label="Deck" value={deck} onChange={start} options={[{ value: 'sigma', label: DECKS.sigma.name }, { value: 'lean', label: DECKS.lean.name }]} size="sm" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm text-ink-2">Earliest at the top. Drag the grip on desktop, or use the arrows.</p>
          <Reorder.Group axis="y" values={order} onReorder={o => { setOrder(o); setChecked(false) }} className="space-y-2">
            {order.map((id, i) => <Row key={id} ev={byId(id)} index={i} total={order.length} status={checked ? status[i] : null} onMove={dir => move(i, dir)} locked={reveal} />)}
          </Reorder.Group>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={check} disabled={reveal}>Check order</button>
            <button className="btn btn-soft" onClick={() => { setReveal(true); setChecked(true) }}>Reveal timeline</button>
          </div>
          {checked && !reveal && <Feedback ok={right === order.length}>{right === order.length ? 'Every milestone is in the right place.' : `${right} of ${order.length} in the right position. Move the red ones and check again, or reveal the timeline.`}</Feedback>}
        </div>
        <div>
          <AnimatePresence mode="wait">
            {reveal ? (
              <motion.div key="tl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="font-display text-lg font-semibold text-ink">The correct timeline</h3>
                <Timeline events={events} tone={tone} />
              </motion.div>
            ) : (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-2xl border border-dashed border-line-2 p-4 text-sm leading-relaxed text-ink-2">
                <p className="font-semibold text-ink">Clues</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {deck === 'sigma' ? <>
                    <li>Statistical quality control comes before quality as a company-wide philosophy.</li>
                    <li>Motorola built Six Sigma before it won an award for its results.</li>
                    <li>AlliedSignal adopted Six Sigma a few years before GE made it famous.</li>
                  </> : <>
                    <li>Flow on a moving line came before Toyota existed as a car company.</li>
                    <li>The world noticed TPS after a crisis in the 1970s.</li>
                    <li>The word "lean" was coined two years before the book that popularised it.</li>
                  </>}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  return (
    <LabShell
      lab="history"
      embedded={embedded}
      instructions="Choose a deck, put the milestones in order from earliest to latest, then check. Correct positions turn green. Reveal the timeline to see every date with a short explanation."
      scenario="You are preparing a five-minute history briefing for new Yellow Belts at a telecom operator and want the story in the right order."
      explore={explore}
      challenge={<Challenge />}
      check={<KnowledgeCheck lab="history" items={CHECK} />}
      onReset={() => start(deck)}
      onNewExample={() => start(deck === 'sigma' ? 'lean' : 'sigma')}
    />
  )
}
