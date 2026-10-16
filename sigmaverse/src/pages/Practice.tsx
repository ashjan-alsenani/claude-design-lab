import { BookOpenCheck, Calculator, ClipboardCheck, Dices, Eye, ShieldAlert, Swords, Timer, TrendingDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PracticeSession, type SessionConfig } from '../components/PracticeSession'
import { PageHeader } from '../components/ui'
import { isLessonId, LESSONS, lessonMeta } from '../data/curriculum'
import { QUESTIONS } from '../data/questions'
import type { Difficulty, Question } from '../data/types'
import { weakAreas } from '../lib/insights'
import { getProfile, useProfile } from '../lib/store'
import { generatedVariants } from '../lib/variants'

type Mode = 'learn' | 'test' | 'timed' | 'calc' | 'trap' | 'weak' | 'mixed'

const MODES: { id: Mode; title: string; desc: string; icon: ReactNode; tone: string }[] = [
  { id: 'learn', title: 'Learn Mode', desc: 'Immediate feedback and the full explanation after every answer.', icon: <BookOpenCheck className="size-5" />, tone: 'bg-teal-soft text-teal' },
  { id: 'test', title: 'Test Mode', desc: 'Answers stay hidden until you submit the whole set.', icon: <ClipboardCheck className="size-5" />, tone: 'bg-violet-soft text-violet' },
  { id: 'timed', title: 'Timed Practice', desc: 'Test mode against the clock: about 1 minute 47 seconds per question, the same pace as the real exam.', icon: <Timer className="size-5" />, tone: 'bg-amber-soft text-amber' },
  { id: 'calc', title: 'Calculation-Only', desc: 'Numeric questions from the bank plus freshly generated variants with fresh numbers.', icon: <Calculator className="size-5" />, tone: 'bg-sky-soft text-sky' },
  { id: 'trap', title: 'Exam Trap Mode', desc: 'Only questions that hinge on tricky wording: NOT, EXCEPT, FIRST, per opportunity and more.', icon: <ShieldAlert className="size-5" />, tone: 'bg-coral-soft text-coral' },
  { id: 'weak', title: 'Weak Areas', desc: 'Questions you missed before and topics behind your recent mistake patterns.', icon: <TrendingDown className="size-5" />, tone: 'bg-coral-soft text-coral' },
  { id: 'mixed', title: 'Randomized Mixed', desc: 'A shuffled mix from every Define topic and difficulty.', icon: <Dices className="size-5" />, tone: 'bg-indigo-soft text-indigo' },
]

function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] }
  return r
}

function buildSet(mode: Mode, count: number, lesson: string, difficulty: Difficulty | 'any'): Question[] {
  const p = getProfile()
  let pool = QUESTIONS.filter(q => (lesson === 'all' || q.lesson === lesson) && (difficulty === 'any' || q.difficulty === difficulty))
  if (mode === 'calc') {
    pool = pool.filter(q => q.numeric)
    const bank = shuffle(pool).slice(0, Math.ceil(count / 2))
    const gen = lesson === 'all' ? generatedVariants(count - bank.length, difficulty === 'any' ? undefined : difficulty) : []
    return shuffle([...bank, ...gen]).slice(0, count)
  }
  if (mode === 'trap') pool = pool.filter(q => (q.traps?.length ?? 0) > 0 || q.difficulty === 'trap' || q.category === 'wording')
  if (mode === 'weak') {
    const missed = new Set(Object.entries(p.qstats).filter(([, s]) => s.seen > s.correct).map(([id]) => id))
    const weakLessons = new Set(weakAreas(p, 5).map(w => w.lesson))
    const ranked = pool.filter(q => missed.has(q.id) || weakLessons.has(q.lesson))
    pool = ranked.length >= 5 ? ranked : pool.filter(q => !p.qstats[q.id])
  }
  return shuffle(pool).slice(0, count)
}

export default function Practice() {
  const [params, setParams] = useSearchParams()
  const initialLesson = isLessonId(params.get('lesson') ?? undefined) ? params.get('lesson')! : 'all'
  const [mode, setMode] = useState<Mode>((MODES.find(m => m.id === params.get('mode'))?.id) ?? 'learn')
  const [lesson, setLesson] = useState(initialLesson)
  const [count, setCount] = useState(10)
  const [difficulty, setDifficulty] = useState<Difficulty | 'any'>('any')
  const [session, setSession] = useState<SessionConfig | null>(null)
  const attempts = useProfile(p => p.attempts.filter(a => a.mode !== 'mock').slice(0, 6))
  const hasWeak = useProfile(p => p.mistakes.length > 0 || Object.values(p.qstats).some(s => s.seen > s.correct))

  const available = useMemo(() => buildSet(mode, 999, lesson, difficulty).length, [mode, lesson, difficulty])

  const start = () => {
    const qs = buildSet(mode, count, lesson, difficulty)
    if (!qs.length) return
    const m = MODES.find(x => x.id === mode)!
    setSession({
      mode: mode === 'learn' || mode === 'calc' || mode === 'trap' || mode === 'weak' || mode === 'mixed' ? (mode === 'mixed' ? 'test' : 'learn') : mode === 'timed' ? 'timed' : 'test',
      label: `${m.title}${lesson !== 'all' ? ` · ${lessonMeta(lesson as never).short}` : ''}`,
      questions: qs,
      seconds: mode === 'timed' ? Math.round(qs.length * 107) : undefined,
    })
    params.delete('mode'); setParams(params, { replace: true })
  }

  if (session) return <PracticeSession config={session} onExit={() => setSession(null)} onRetake={start} />

  return (
    <div>
      <PageHeader icon={<Swords className="size-5" />} title="Practice Arena" lead={`${QUESTIONS.length} original practice questions across every Define topic, plus unlimited generated calculation variants. Every question explains why the answer is right and why each other option is wrong. These are educational practice items, not official exam questions.`} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} aria-pressed={mode === m.id} className={`flex flex-col rounded-2xl border bg-surface p-4 text-left shadow-sm transition-all duration-200 ${mode === m.id ? 'border-violet ring-2 ring-violet/25' : 'border-line hover:border-line-2'}`}>
            <span className={`grid size-10 place-items-center rounded-xl ${m.tone}`}>{m.icon}</span>
            <span className="mt-3 font-display text-base font-semibold text-ink">{m.title}</span>
            <span className="mt-1 text-sm leading-relaxed text-ink-2">{m.desc}</span>
          </button>
        ))}
        <Link to="/mock" className="flex flex-col rounded-2xl border border-line bg-gradient-to-br from-violet-soft to-surface p-4 shadow-sm hover:border-line-2">
          <span className="grid size-10 place-items-center rounded-xl bg-violet text-surface"><Timer className="size-5" /></span>
          <span className="mt-3 font-display text-base font-semibold text-ink">Final Define Mock Exam</span>
          <span className="mt-1 text-sm leading-relaxed text-ink-2">19 timed questions approximating the Define share of the 100-question exam.</span>
        </Link>
      </div>

      <section className="mt-6 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="label" htmlFor="p-lesson">Topic</label>
            <select id="p-lesson" className="field" value={lesson} onChange={e => setLesson(e.target.value)}>
              <option value="all">All Define topics</option>
              {LESSONS.map(l => <option key={l.id} value={l.id}>{l.id} {l.short}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="p-diff">Difficulty</label>
            <select id="p-diff" className="field" value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty | 'any')}>
              <option value="any">Any difficulty</option>
              <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="trap">Exam trap</option><option value="master">Master challenge</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="p-count">Questions</label>
            <select id="p-count" className="field" value={count} onChange={e => setCount(Number(e.target.value))}>
              {[5, 10, 15, 20, 30, 40].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn btn-primary h-[2.6rem] w-full" onClick={start} disabled={available === 0}>Start {MODES.find(m => m.id === mode)!.title}</button>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-3">
          {available === 0 ? (mode === 'weak' && !hasWeak ? 'No weak areas recorded yet. Answer some questions first.' : 'No questions match this combination. Widen the topic or difficulty.') : `${mode === 'calc' && lesson === 'all' ? `${available} bank questions plus generated variants` : `${available} matching question${available === 1 ? '' : 's'}`} available.`}
          {mode === 'mixed' && ' Mixed sets run in Test Mode.'}
        </p>
      </section>

      {attempts.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-semibold text-ink">Recent attempts</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {attempts.map(a => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 truncate text-ink">{a.mode}</span>
                <span className="tabular shrink-0 text-ink-3">{new Date(a.at).toLocaleDateString()} · {a.correct}/{a.total} · {Math.round((a.correct / a.total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink-2">
        <Eye className="mr-2 inline size-4 text-violet" />
        Tip: every question has a <span className="font-semibold text-ink">Reveal trap words</span> button that highlights NOT, EXCEPT, FIRST, per opportunity and similar wording. Use it after answering to see what you might have missed.
      </section>
    </div>
  )
}
