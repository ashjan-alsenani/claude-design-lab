import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Calculator, CheckCircle2, Clock, Flag, RotateCcw, Trophy, XCircle } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LESSONS, lessonMeta } from '../data/curriculum'
import type { LessonId, Question } from '../data/types'
import { MISTAKE_INFO } from '../lib/insights'
import { addXp, recordAnswer, touch, uid, update } from '../lib/store'
import { QuestionCard } from './QuestionCard'
import { Meter } from './ui'

export interface SessionConfig {
  mode: 'learn' | 'test' | 'timed' | 'mock'
  label: string
  questions: Question[]
  seconds?: number
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export function PracticeSession({ config, onExit, onRetake }: { config: SessionConfig; onExit: () => void; onRetake: () => void }) {
  const { questions, mode } = config
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [flags, setFlags] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const [startedAt] = useState(Date.now())
  const [now, setNow] = useState(Date.now())
  const [confirm, setConfirm] = useState(false)
  const finishedAt = useRef<number | null>(null)
  const learn = mode === 'learn'
  const timed = !!config.seconds

  useEffect(() => {
    if (submitted || !timed) return
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [submitted, timed])

  const elapsed = Math.round(((finishedAt.current ?? now) - startedAt) / 1000)
  const remaining = timed ? Math.max(0, config.seconds! - elapsed) : 0

  const submit = () => {
    if (submitted) return
    finishedAt.current = Date.now()
    setSubmitted(true)
    setConfirm(false)
    const correct = answers.filter((a, i) => a === questions[i].answer).length
    if (!learn) {
      questions.forEach((q, i) => {
        const a = answers[i]
        const ok = a === q.answer
        recordAnswer({ questionId: q.id, lesson: q.lesson, correct: ok, mistake: ok || a === null ? null : q.optionMistakes?.[a] ?? null, xp: 4 })
      })
    }
    update(p => {
      p.attempts.unshift({ id: uid(), at: Date.now(), mode: mode === 'mock' ? 'mock' : config.label, questionIds: questions.map(q => q.id), answers, correct, total: questions.length, durationSec: Math.round((Date.now() - startedAt) / 1000), flagged: [...flags] })
      if (p.attempts.length > 200) p.attempts.length = 200
      addXp(p, mode === 'mock' ? 40 : 15)
      touch(p)
    })
  }

  useEffect(() => { if (timed && remaining === 0 && !submitted) submit() }) // auto-submit when time runs out

  if (submitted) return <Results config={config} answers={answers} elapsed={elapsed} onExit={onExit} onRetake={onRetake} />

  const q = questions[idx]
  const answered = answers.filter(a => a !== null).length

  return (
    <div>
      <div className="sticky top-14 z-30 -mx-4 mb-5 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-md lg:top-0 lg:mx-0 lg:rounded-2xl lg:border">
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-ghost btn-sm" onClick={onExit}><ArrowLeft className="size-4" /> Exit</button>
          <span className="font-semibold text-ink">{config.label}</span>
          <span className="tabular text-sm text-ink-3">{answered}/{questions.length} answered</span>
          {timed && (
            <span className={`tabular ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-bold ${remaining < 120 ? 'bg-bad-soft text-bad' : 'bg-surface-2 text-ink'}`} role="timer" aria-live={remaining < 60 ? 'assertive' : 'off'}>
              <Clock className="size-4" /> {fmtTime(remaining)}
            </span>
          )}
          {!learn && <button className={`btn btn-primary btn-sm ${timed ? '' : 'ml-auto'}`} onClick={() => setConfirm(true)}>Submit</button>}
        </div>
        <Meter value={answered / questions.length} className="mt-3" label="Answered" />
      </div>

      {confirm && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber/40 bg-amber-soft p-4 sm:flex-row sm:items-center" role="alertdialog" aria-label="Confirm submission">
          <span className="flex-1 text-sm text-ink">{answered < questions.length ? `You have ${questions.length - answered} unanswered question${questions.length - answered > 1 ? 's' : ''}. Unanswered questions score zero.` : 'Submit your answers and see the full review?'}</span>
          <div className="flex gap-2"><button className="btn btn-ghost btn-sm" onClick={() => setConfirm(false)}>Keep working</button><button className="btn btn-primary btn-sm" onClick={submit}>Submit now</button></div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
        <motion.div key={q.id + idx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
          <QuestionCard
            key={q.id}
            q={q}
            index={idx}
            mode={learn ? 'learn' : 'test'}
            selected={answers[idx]}
            onSelect={i => setAnswers(a => { const n = [...a]; n[idx] = i; return n })}
            showTrapToggle={mode !== 'mock'}
          />
          <div className="mt-4 flex items-center justify-between gap-2">
            <button className="btn btn-soft" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}><ArrowLeft className="size-4" /> Previous</button>
            {!learn && (
              <button className={`btn btn-ghost btn-sm ${flags.has(q.id) ? 'text-amber' : ''}`} onClick={() => setFlags(f => { const n = new Set(f); if (n.has(q.id)) n.delete(q.id); else n.add(q.id); return n })} aria-pressed={flags.has(q.id)}>
                <Flag className="size-4" /> {flags.has(q.id) ? 'Flagged' : 'Flag for review'}
              </button>
            )}
            {idx < questions.length - 1
              ? <button className="btn btn-primary" onClick={() => setIdx(i => i + 1)}>Next <ArrowRight className="size-4" /></button>
              : learn ? <button className="btn btn-primary" onClick={submit}>Finish <CheckCircle2 className="size-4" /></button>
                : <button className="btn btn-primary" onClick={() => setConfirm(true)}>Review and submit</button>}
          </div>
        </motion.div>
        <nav className="order-first lg:order-none" aria-label="Question navigator">
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:sticky lg:top-28 lg:grid-cols-5">
            {questions.map((qq, i) => {
              const a = answers[i]
              const state = learn && a !== null ? (a === qq.answer ? 'bg-good-soft text-good border-good/40' : 'bg-bad-soft text-bad border-bad/40') : a !== null ? 'bg-violet-soft text-violet border-violet/30' : 'bg-surface text-ink-3 border-line'
              return (
                <button key={qq.id + i} onClick={() => setIdx(i)} className={`tabular relative h-9 rounded-lg border text-xs font-bold ${state} ${i === idx ? 'ring-2 ring-violet' : ''}`} aria-label={`Question ${i + 1}${a !== null ? ', answered' : ''}${flags.has(qq.id) ? ', flagged' : ''}`}>
                  {i + 1}
                  {flags.has(qq.id) && <Flag className="absolute -right-1 -top-1 size-3 fill-amber text-amber" />}
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

function Results({ config, answers, elapsed, onExit, onRetake }: { config: SessionConfig; answers: (number | null)[]; elapsed: number; onExit: () => void; onRetake: () => void }) {
  const { questions } = config
  const correct = answers.filter((a, i) => a === questions[i].answer).length
  const score = correct / questions.length
  const [review, setReview] = useState<'wrong' | 'all'>('wrong')

  const byLesson = useMemo(() => {
    const m = new Map<LessonId, { c: number; t: number }>()
    questions.forEach((q, i) => { const r = m.get(q.lesson) ?? { c: 0, t: 0 }; r.t++; if (answers[i] === q.answer) r.c++; m.set(q.lesson, r) })
    return LESSONS.filter(l => m.has(l.id)).map(l => ({ lesson: l, ...m.get(l.id)! }))
  }, [questions, answers])
  const math = questions.map((q, i) => ({ q, ok: answers[i] === q.answer })).filter(x => x.q.numeric)
  const wrong = questions.map((q, i) => ({ q, i })).filter(({ q, i }) => answers[i] !== q.answer)
  const revisit = byLesson.filter(b => b.c / b.t < 0.7).sort((a, b) => a.c / a.t - b.c / b.t)
  const mistakeTags = wrong.map(({ q, i }) => { const a = answers[i]; return a !== null ? q.optionMistakes?.[a] ?? null : null }).filter((t): t is NonNullable<typeof t> => !!t)
  const pass = score >= 0.7

  return (
    <div>
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-line bg-surface p-6 shadow-md sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className={`grid size-28 shrink-0 place-items-center rounded-full ${pass ? 'bg-good-soft text-good' : 'bg-amber-soft text-amber'}`}>
            <div className="text-center"><div className="tabular font-display text-4xl font-bold">{Math.round(score * 100)}%</div><div className="text-xs font-semibold">{correct}/{questions.length}</div></div>
          </div>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink md:text-3xl">{pass && <Trophy className="size-7 text-amber" />}{config.label} results</h1>
            <p className="mt-2 leading-relaxed text-ink-2">
              {config.mode === 'mock'
                ? pass ? 'At or above 70%, the pass mark of the full certification exam. This is a practice approximation of the Define component, not a prediction of your official result.' : 'Below 70%, the pass mark of the full certification exam. Use the topic breakdown below to decide what to revisit, then retake.'
                : pass ? 'Strong work. Review any misses below so they do not repeat.' : 'Every miss below is a lesson in disguise. Read the explanations, then revisit the suggested lessons.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="chip"><Clock className="size-3.5" /> {fmtTime(elapsed)} taken</span>
              {math.length > 0 && <span className="chip"><Calculator className="size-3.5" /> Calculations {math.filter(m => m.ok).length}/{math.length}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="btn btn-primary" onClick={onRetake}><RotateCcw className="size-4" /> Retake</button>
            <button className="btn btn-soft" onClick={onExit}>Back</button>
          </div>
        </div>
      </motion.section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink">Accuracy by topic</h2>
          <ul className="mt-3 space-y-3">
            {byLesson.map(b => (
              <li key={b.lesson.id} className="text-sm">
                <div className="flex justify-between gap-2"><Link to={`/lessons/${b.lesson.id}`} className="truncate text-ink hover:text-violet">{b.lesson.id} {b.lesson.short}</Link><span className="tabular shrink-0 font-semibold text-ink-2">{b.c}/{b.t}</span></div>
                <Meter value={b.c / b.t} tone={b.c / b.t >= 0.7 ? 'teal' : 'coral'} className="mt-1.5" label={`${b.lesson.short} accuracy`} />
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink">Recommended lessons to revisit</h2>
          {revisit.length === 0 ? <p className="mt-3 text-sm text-ink-2">No topic fell below 70% in this attempt.</p> : (
            <ul className="mt-3 space-y-2">
              {revisit.slice(0, 5).map(b => (
                <li key={b.lesson.id}><Link to={`/lessons/${b.lesson.id}`} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5 text-sm hover:bg-surface-3"><span className="font-medium text-ink">{b.lesson.id} {b.lesson.short}</span><ArrowRight className="size-4 text-ink-3" /></Link></li>
              ))}
            </ul>
          )}
          {mistakeTags.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-semibold text-ink">Mistake patterns saved to your notebook</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">{[...new Set(mistakeTags)].map(t => <span key={t} className="chip border-coral/30 bg-coral-soft text-coral">{MISTAKE_INFO[t].label}</span>)}</div>
            </>
          )}
        </section>
      </div>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-ink">Detailed answer review</h2>
          <div className="flex gap-1 rounded-xl border border-line bg-surface-2 p-1 text-sm">
            <button className={`rounded-lg px-3 py-1 font-semibold ${review === 'wrong' ? 'bg-surface shadow-sm' : 'text-ink-3'}`} onClick={() => setReview('wrong')}>Incorrect ({wrong.length})</button>
            <button className={`rounded-lg px-3 py-1 font-semibold ${review === 'all' ? 'bg-surface shadow-sm' : 'text-ink-3'}`} onClick={() => setReview('all')}>All</button>
          </div>
        </div>
        <div className="space-y-4">
          {(review === 'wrong' ? wrong : questions.map((q, i) => ({ q, i }))).map(({ q, i }) => (
            <div key={q.id + i}>
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold">{answers[i] === q.answer ? <CheckCircle2 className="size-4 text-good" /> : <XCircle className="size-4 text-bad" />}<span className="text-ink-3">{lessonMeta(q.lesson).short}</span></div>
              <QuestionCard q={q} index={i} mode="test" selected={answers[i]} reveal />
            </div>
          ))}
          {review === 'wrong' && wrong.length === 0 && <p className="rounded-2xl bg-good-soft p-4 text-sm font-semibold text-good">A perfect attempt. Nothing to review.</p>}
        </div>
      </section>
    </div>
  )
}
