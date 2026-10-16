import { AnimatePresence, motion } from 'motion/react'
import { Check, CheckCircle2, Layers, RotateCcw, Shuffle, Timer, X, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FlipCard } from '../components/FlipCard'
import { Rich } from '../components/Rich'
import { Empty, PageHeader, Segmented } from '../components/ui'
import { isLessonId, LESSONS, loadAllLessons, MODULES } from '../data/curriculum'
import { glossary } from '../data/glossaryIndex'
import type { Lesson, LessonId, ModuleId } from '../data/types'
import { gradeCard, intervalLabel, setCardFlag, type Grade } from '../lib/srs'
import { addXp, touch, update, useProfile } from '../lib/store'

interface Card { id: string; lesson: LessonId; module: ModuleId; front: string; back: string; source: 'lesson' | 'glossary' }

function useCards(): Card[] | null {
  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  useEffect(() => { loadAllLessons().then(setLessons) }, [])
  return useMemo(() => {
    if (!lessons) return null
    const modOf = (id: LessonId) => LESSONS.find(l => l.id === id)!.module
    const out: Card[] = []
    for (const l of lessons) l.flashcards.forEach((f, i) => out.push({ id: `${l.id}:${i}`, lesson: l.id, module: l.module, front: f.front, back: f.back, source: 'lesson' }))
    for (const g of glossary) out.push({ id: `g:${g.term}`, lesson: g.lesson, module: modOf(g.lesson), front: g.acronym && g.acronym !== g.term ? `${g.term} (${g.acronym})` : g.term, back: g.easy, source: 'glossary' })
    return out
  }, [lessons])
}

type Mode = 'study' | 'recall' | 'match' | 'browse'

export default function Flashcards() {
  const [params] = useSearchParams()
  const cards = useCards()
  const states = useProfile(p => p.cards)
  const [deck, setDeck] = useState<'all' | 'lesson' | 'glossary'>('all')
  const [module, setModule] = useState<ModuleId | 0>(0)
  const lessonFilter = isLessonId(params.get('lesson') ?? undefined) ? (params.get('lesson') as LessonId) : null
  const [mode, setMode] = useState<Mode>('study')

  const filtered = useMemo(() => (cards ?? []).filter(c => (deck === 'all' || c.source === deck) && (module === 0 || c.module === module) && (!lessonFilter || c.lesson === lessonFilter)), [cards, deck, module, lessonFilter])
  const now = Date.now()
  const due = filtered.filter(c => !states[c.id] || states[c.id].due <= now)
  const known = filtered.filter(c => states[c.id]?.known || (states[c.id]?.box ?? 0) >= 3).length
  const practice = filtered.filter(c => states[c.id]?.practice).length

  if (!cards) return <div className="h-96 animate-pulse rounded-3xl bg-surface-3" />

  return (
    <div>
      <PageHeader icon={<Layers className="size-5" />} title="Flashcard Studio" lead="Lesson flashcards and the full glossary, scheduled with spaced repetition: cards you find easy come back after longer gaps, cards you miss come back soon." />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented label="Mode" value={mode} onChange={setMode} options={[{ value: 'study', label: 'Spaced repetition' }, { value: 'recall', label: 'Quick recall' }, { value: 'match', label: 'Matching' }, { value: 'browse', label: 'Browse' }]} />
        <select className="field w-auto" value={deck} onChange={e => setDeck(e.target.value as typeof deck)} aria-label="Deck">
          <option value="all">All cards</option><option value="lesson">Lesson cards</option><option value="glossary">Glossary terms</option>
        </select>
        <select className="field w-auto" value={module} onChange={e => setModule(Number(e.target.value) as ModuleId | 0)} aria-label="Module filter">
          <option value={0}>All modules</option>
          {MODULES.map(m => <option key={m.id} value={m.id}>{m.ref} {m.short}</option>)}
        </select>
        {lessonFilter && <span className="chip">Lesson {lessonFilter} only</span>}
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Cards in selection', filtered.length], ['Due now', due.length], ['Known', known], ['Needs practice', practice]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-line bg-surface px-4 py-3"><div className="text-xs font-semibold text-ink-3">{l}</div><div className="tabular font-display text-2xl font-semibold text-ink">{v}</div></div>
        ))}
      </div>
      {filtered.length === 0 ? <Empty icon={<Layers className="size-6" />} title="No cards match">Change the deck or module filter.</Empty>
        : mode === 'study' ? <Study cards={due.length ? due : []} all={filtered} />
          : mode === 'recall' ? <Recall cards={filtered} />
            : mode === 'match' ? <Match cards={filtered} />
              : <Browse cards={filtered} />}
    </div>
  )
}

function Study({ cards, all }: { cards: Card[]; all: Card[] }) {
  const states = useProfile(p => p.cards)
  const [queue, setQueue] = useState(() => cards.slice(0, 30).map(c => c.id))
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const card = all.find(c => c.id === queue[0])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!card || (e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f) }
      if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade((['again', 'hard', 'good', 'easy'] as Grade[])[Number(e.key) - 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const grade = (g: Grade) => {
    if (!card) return
    gradeCard(card.id, g)
    setFlipped(false)
    setReviewed(r => r + 1)
    setQueue(q => (g === 'again' ? [...q.slice(1), q[0]] : q.slice(1)))
  }
  if (!card) return (
    <Empty icon={<CheckCircle2 className="size-6" />} title={reviewed ? `Session complete: ${reviewed} reviews` : 'Nothing is due right now'} action={<button className="btn btn-soft" onClick={() => { setQueue(all.slice().sort(() => Math.random() - 0.5).slice(0, 20).map(c => c.id)); setReviewed(0) }}><Shuffle className="size-4" /> Study 20 cards anyway</button>}>
      Spaced repetition schedules each card for the moment you are about to forget it. Come back when cards are due, or practise extra cards now.
    </Empty>
  )
  const st = states[card.id]
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm text-ink-3"><span>{queue.length} left in this session</span><span>{card.source === 'glossary' ? 'Glossary' : `Lesson ${card.lesson}`}</span></div>
      <FlipCard front={card.front} back={<Rich text={card.back} />} flipped={flipped} onFlip={() => setFlipped(f => !f)} minH="min-h-64" />
      <div className="mt-5 grid grid-cols-4 gap-2">
        {(['again', 'hard', 'good', 'easy'] as Grade[]).map((g, i) => (
          <button key={g} disabled={!flipped} onClick={() => grade(g)} className={`btn flex-col !h-auto py-2.5 ${g === 'again' ? 'btn-soft text-bad' : g === 'easy' ? 'btn-soft text-good' : 'btn-soft'}`}>
            <span>{g[0].toUpperCase() + g.slice(1)}</span>
            <span className="text-[11px] font-medium text-ink-3">{intervalLabel(st, g)} · {i + 1}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-ink-3">Space flips the card. Keys 1 to 4 grade it after flipping.</p>
    </div>
  )
}

function Recall({ cards }: { cards: Card[] }) {
  const [deck, setDeck] = useState<Card[]>([])
  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)
  const [score, setScore] = useState({ k: 0, n: 0 })
  const [time, setTime] = useState(8)
  const running = deck.length > 0 && i < deck.length
  useEffect(() => {
    if (!running || show) return
    if (time <= 0) { setShow(true); return }
    const t = window.setTimeout(() => setTime(s => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [running, show, time])
  const start = () => { setDeck(cards.slice().sort(() => Math.random() - 0.5).slice(0, 15)); setI(0); setShow(false); setScore({ k: 0, n: 0 }); setTime(8) }
  const mark = (k: boolean) => {
    const c = deck[i]
    gradeCard(c.id, k ? 'good' : 'again')
    if (!k) setCardFlag(c.id, 'practice', true)
    setScore(s => ({ k: s.k + (k ? 1 : 0), n: s.n + 1 }))
    setI(x => x + 1); setShow(false); setTime(8)
  }
  if (!running) return (
    <div className="mx-auto max-w-xl rounded-3xl border border-line bg-surface p-6 text-center shadow-sm">
      <Zap className="mx-auto size-8 text-amber" />
      <h2 className="mt-3 font-display text-xl font-semibold text-ink">Quick Recall</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">15 cards, 8 seconds each. Say the answer in your head before it appears, then judge yourself honestly.</p>
      {score.n > 0 && <p className="mt-3 font-semibold text-ink">Last round: {score.k}/{score.n} recalled</p>}
      <button className="btn btn-primary mt-5" onClick={start}><Timer className="size-4" /> {score.n ? 'Play again' : 'Start'}</button>
    </div>
  )
  const c = deck[i]
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm"><span className="text-ink-3">Card {i + 1} of {deck.length}</span><span className={`tabular font-bold ${time <= 3 && !show ? 'text-bad' : 'text-ink-2'}`}>{show ? 'Reveal' : `${time}s`}</span></div>
      <div className="h-1 overflow-hidden rounded-full bg-surface-3"><motion.div className="h-full bg-amber" animate={{ width: show ? '0%' : `${(time / 8) * 100}%` }} transition={{ duration: 1, ease: 'linear' }} /></div>
      <div className="mt-4 rounded-3xl border border-line bg-surface p-8 text-center shadow-md">
        <div className="font-display text-2xl font-semibold text-ink">{c.front}</div>
        <AnimatePresence>{show && <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 leading-relaxed text-ink-2"><Rich text={c.back} /></motion.p>}</AnimatePresence>
      </div>
      <div className="mt-4 flex justify-center gap-3">
        {!show ? <button className="btn btn-primary" onClick={() => setShow(true)}>Show answer</button> : <>
          <button className="btn btn-soft text-bad" onClick={() => mark(false)}><X className="size-4" /> Did not recall</button>
          <button className="btn btn-soft text-good" onClick={() => mark(true)}><Check className="size-4" /> Recalled</button>
        </>}
      </div>
    </div>
  )
}

function Match({ cards }: { cards: Card[] }) {
  const [round, setRound] = useState(0)
  const set = useMemo(() => cards.filter(c => c.source === 'glossary' || c.front.length < 60).slice().sort(() => Math.random() - 0.5).slice(0, 6), [cards, round])
  const backs = useMemo(() => set.slice().sort(() => Math.random() - 0.5), [set])
  const [pickF, setPickF] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string | null>(null)
  const [misses, setMisses] = useState(0)
  useEffect(() => { setMatched(new Set()); setPickF(null); setMisses(0) }, [set])
  const pickBack = (id: string) => {
    if (!pickF) return
    if (id === pickF) {
      const n = new Set(matched); n.add(id); setMatched(n); setPickF(null)
      if (n.size === set.length) update(p => { addXp(p, 10); touch(p) })
    } else { setWrong(id); setMisses(m => m + 1); setTimeout(() => setWrong(null), 500) }
  }
  const done = matched.size === set.length && set.length > 0
  return (
    <div>
      <p className="mb-4 text-sm text-ink-2">Select a term on the left, then its meaning on the right.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          {set.map(c => (
            <button key={c.id} disabled={matched.has(c.id)} onClick={() => setPickF(c.id)} className={`w-full rounded-xl border px-4 py-3 text-left font-semibold transition-colors ${matched.has(c.id) ? 'border-good/40 bg-good-soft text-good' : pickF === c.id ? 'border-violet bg-violet-soft text-ink' : 'border-line bg-surface text-ink hover:border-line-2'}`}>{c.front}</button>
          ))}
        </div>
        <div className="space-y-2">
          {backs.map(c => (
            <motion.button key={c.id} animate={wrong === c.id ? { x: [0, -6, 6, -4, 0] } : {}} transition={{ duration: 0.35 }} disabled={matched.has(c.id)} onClick={() => pickBack(c.id)} className={`w-full rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition-colors ${matched.has(c.id) ? 'border-good/40 bg-good-soft text-ink-2' : wrong === c.id ? 'border-bad bg-bad-soft' : 'border-line bg-surface text-ink-2 hover:border-line-2'}`}><Rich text={c.back} noLinks /></motion.button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        {done && <span className="font-semibold text-good">All matched with {misses} miss{misses === 1 ? '' : 'es'}.</span>}
        <button className="btn btn-soft btn-sm ml-auto" onClick={() => setRound(r => r + 1)}><RotateCcw className="size-4" /> New set</button>
      </div>
    </div>
  )
}

function Browse({ cards }: { cards: Card[] }) {
  const states = useProfile(p => p.cards)
  const [open, setOpen] = useState<string | null>(null)
  return (
    <ul className="grid gap-2 md:grid-cols-2">
      {cards.map(c => {
        const s = states[c.id]
        return (
          <li key={c.id} className="rounded-2xl border border-line bg-surface p-4">
            <button className="w-full text-left" onClick={() => setOpen(o => (o === c.id ? null : c.id))} aria-expanded={open === c.id}>
              <div className="flex items-start justify-between gap-2"><span className="font-semibold text-ink">{c.front}</span><span className="chip shrink-0">{c.source === 'glossary' ? 'Glossary' : c.lesson}</span></div>
              {open === c.id && <p className="mt-2 text-sm leading-relaxed text-ink-2"><Rich text={c.back} /></p>}
            </button>
            <div className="mt-3 flex gap-2">
              <button className={`btn btn-sm ${s?.known ? 'btn-primary' : 'btn-soft'}`} onClick={() => setCardFlag(c.id, 'known', !s?.known)} aria-pressed={!!s?.known}><Check className="size-3.5" /> Known</button>
              <button className={`btn btn-sm ${s?.practice ? 'btn-primary' : 'btn-soft'}`} onClick={() => setCardFlag(c.id, 'practice', !s?.practice)} aria-pressed={!!s?.practice}>Needs practice</button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
