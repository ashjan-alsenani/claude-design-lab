import { motion } from 'motion/react'
import {
  ArrowRight, BookMarked, Bookmark, Calculator, Compass, Flame, Library, NotebookPen, PlayCircle, ShieldAlert, Sparkles, Target, Timer, TrendingDown, Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { HeroDmaic } from '../components/HeroDmaic'
import { JourneyMap } from '../components/JourneyMap'
import { Meter, Ring, Section } from '../components/ui'
import { LESSONS, lessonMeta } from '../data/curriculum'
import {
  level, mathReadiness, moduleCompletion, nextRecommendedLesson, overallAccuracy, overallMastery, recommendations, vocabProgress, weakAreas,
} from '../lib/insights'
import { today, useProfile } from '../lib/store'

const pct = (v: number) => `${Math.round(v * 100)}%`

function Stat({ label, value, sub, empty }: { label: string; value?: string; sub?: string; empty: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-semibold text-ink">{label}</div>
        <div className="text-xs leading-relaxed text-ink-3">{value ? sub : empty}</div>
      </div>
      <div className={`tabular font-display text-2xl font-semibold ${value ? 'text-ink' : 'text-ink-3'}`}>{value ?? '-'}</div>
    </div>
  )
}

export default function Dashboard() {
  const p = useProfile()
  const done = LESSONS.filter(l => p.completed[l.id]).length
  const completion = done / LESSONS.length
  const next = nextRecommendedLesson(p)
  const nextMeta = lessonMeta(next)
  const mastery = overallMastery(p)
  const math = mathReadiness(p)
  const vocab = vocabProgress(p)
  const acc = overallAccuracy(p)
  const weak = weakAreas(p, 4)
  const recs = recommendations(p)
  const lvl = level(p.xp)
  const qBookmarks = p.bookmarks.filter(b => b.kind === 'question').length
  const minutesToday = p.days[today()] ?? 0
  const isNew = done === 0 && !acc && Object.keys(p.formulas).length === 0
  const sessionMins = Math.max(0, Math.round((p.session.lastAt - p.session.startedAt) / 60000))
  const readingNext = p.reading[next]

  return (
    <div>
      {/* Hero */}
      <section className="relative grid items-center gap-6 overflow-hidden rounded-[2rem] border border-line bg-surface px-6 py-8 shadow-md md:grid-cols-[1.15fr_1fr] md:px-10 md:py-10">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-violet-soft blur-3xl" />
        <div className="relative">
          <h1 className="text-[2.2rem] font-bold leading-[1.05] text-ink md:text-5xl">Welcome to Your Define Mastery Journey</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-2">Learn every concept. Understand every formula. Recognize every exam trap.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={`/lessons/${next}${readingNext?.anchor ? `#${readingNext.anchor}` : ''}`} className="btn btn-primary h-12 px-5 text-base">
              <PlayCircle className="size-5" /> {isNew ? 'Start learning' : 'Continue Learning'}
            </Link>
            <Link to="/journey" className="btn btn-soft h-12 px-5 text-base"><Compass className="size-5" /> Explore Curriculum</Link>
          </div>
          <p className="mt-4 text-sm text-ink-3">Up next: <span className="font-semibold text-ink-2">Lesson {next} {nextMeta.short}</span></p>
        </div>
        <div className="relative mx-auto w-full max-w-[420px]"><HeroDmaic /></div>
      </section>

      {/* Quick actions */}
      <nav className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" aria-label="Quick actions">
        {[
          { to: '/practice?mode=calc', label: 'Practice Calculations', icon: <Calculator className="size-4" />, tone: 'text-teal bg-teal-soft' },
          { to: '/formulas', label: 'Open Formula Lab', icon: <Sparkles className="size-4" />, tone: 'text-violet bg-violet-soft' },
          { to: '/traps', label: 'Review Exam Traps', icon: <ShieldAlert className="size-4" />, tone: 'text-coral bg-coral-soft' },
          { to: '/mock', label: 'Take Mock Exam', icon: <Timer className="size-4" />, tone: 'text-amber bg-amber-soft' },
          { to: '/library', label: 'Open Reference Library', icon: <Library className="size-4" />, tone: 'text-sky bg-sky-soft' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="group flex items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 text-sm font-semibold text-ink shadow-sm transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-2">
            <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${a.tone}`}>{a.icon}</span>
            <span className="leading-tight">{a.label}</span>
          </Link>
        ))}
      </nav>

      {/* Progress overview */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Ring value={completion} size={132} stroke={10} tone="violet">
              <div className="text-center">
                <div className="tabular font-display text-3xl font-bold text-ink">{pct(completion)}</div>
                <div className="text-xs font-semibold text-ink-3">of Define</div>
              </div>
            </Ring>
            <div className="flex-1">
              <h2 className="font-display text-xl font-semibold text-ink">Overall Define completion</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">
                {done === 0 ? 'No lessons completed yet. Your progress appears here as you mark lessons complete.' : `${done} of ${LESSONS.length} lessons completed.`}
              </p>
              <div className="mt-4 space-y-2.5">
                {moduleCompletion(p).map(m => (
                  <div key={m.module.id} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 truncate text-ink-2">{m.module.short}</span>
                    <Meter value={m.done / m.total} tone={m.module.tone} label={`${m.module.title} completion`} />
                    <span className="tabular w-10 text-right text-xs font-semibold text-ink-3">{m.done}/{m.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-surface-2 p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="text-xs font-semibold text-ink-3">Recommended next lesson</div>
              <div className="font-display text-lg font-semibold text-ink">{next} {nextMeta.short}</div>
              {readingNext && readingNext.progress > 0.03 && <div className="mt-1 flex items-center gap-2 text-xs text-ink-3"><Meter value={readingNext.progress} className="max-w-32" label="Reading progress" /> {pct(readingNext.progress)} read</div>}
            </div>
            <Link to={`/lessons/${next}`} className="btn btn-primary">Open lesson <ArrowRight className="size-4" /></Link>
          </div>
        </motion.section>

        <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-ink">Readiness</h2>
          <div className="mt-2 divide-y divide-line">
            <Stat label="Current mastery estimate" value={mastery !== null ? pct(mastery) : undefined} sub="From completed lessons, question accuracy and flashcards." empty="Not measured yet: complete a lesson or answer questions." />
            <Stat label="Mathematical readiness" value={math ? pct(math.score) : undefined} sub={math ? `Based on ${math.attempts} calculation attempts.` : ''} empty="Solve formula problems to measure this." />
            <Stat label="Vocabulary progress" value={vocab.known ? `${vocab.known}/${vocab.total}` : undefined} sub="Glossary cards you know well." empty={`0 of ${vocab.total} terms known yet.`} />
            <Stat label="Quiz accuracy" value={acc ? pct(acc.rate) : undefined} sub={acc ? `Across ${acc.seen} answered questions.` : ''} empty="No questions answered yet." />
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink"><TrendingDown className="size-5 text-coral" /> Weak areas</h2>
          {weak.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-ink-2">Nothing to flag yet. When you miss a question or a calculation, the mistake category is saved here and drives your recommendations.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {weak.map(w => (
                <li key={w.tag}>
                  <Link to={`/lessons/${w.lesson}`} className="flex items-center justify-between gap-3 rounded-xl bg-coral-soft/60 px-3 py-2 text-sm hover:bg-coral-soft">
                    <span className="font-medium text-ink">{w.label}</span>
                    <span className="tabular shrink-0 text-xs font-semibold text-coral">{w.n} miss{w.n > 1 ? 'es' : ''}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to="/traps#notebook" className="mt-4 inline-block text-sm font-semibold text-violet hover:underline">Open Mistake Notebook</Link>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink"><Zap className="size-5 text-amber" /> Current study session</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-surface-2 p-3"><dt className="text-ink-3">Active for</dt><dd className="tabular font-display text-xl font-semibold text-ink">{sessionMins} min</dd></div>
            <div className="rounded-xl bg-surface-2 p-3"><dt className="text-ink-3">XP this session</dt><dd className="tabular font-display text-xl font-semibold text-ink">{p.session.xp}</dd></div>
            <div className="rounded-xl bg-surface-2 p-3"><dt className="text-ink-3">Answered</dt><dd className="tabular font-display text-xl font-semibold text-ink">{p.session.correct}/{p.session.answered}</dd></div>
            <div className="rounded-xl bg-surface-2 p-3"><dt className="text-ink-3">Cards reviewed</dt><dd className="tabular font-display text-xl font-semibold text-ink">{p.session.cards}</dd></div>
          </dl>
          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold text-ink-3"><span>Today's goal</span><span className="tabular">{minutesToday}/{p.settings.dailyGoalMinutes} min</span></div>
            <Meter value={minutesToday / p.settings.dailyGoalMinutes} tone="amber" className="mt-1.5" label="Daily goal" />
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-ink-2">
            <span className="flex items-center gap-1.5"><Flame className="size-4 text-coral" /> {p.streak.current} day streak</span>
            <span>Level {lvl.level} · {p.xp} XP</span>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm md:col-span-2 xl:col-span-1">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink"><Target className="size-5 text-violet" /> Recommended for you</h2>
          <ul className="mt-3 space-y-2">
            {recs.map(r => (
              <li key={r.to}>
                <Link to={r.to} className="group block rounded-xl border border-line px-3 py-2.5 hover:border-line-2 hover:bg-surface-2">
                  <div className="flex items-center justify-between gap-2 text-sm font-semibold text-ink">{r.title}<ArrowRight className="size-4 text-ink-3 transition-transform group-hover:translate-x-0.5" /></div>
                  <div className="mt-0.5 text-xs leading-relaxed text-ink-3">{r.reason}</div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-3">Recommendations are rule-based, using your own answers and mistakes. No AI analysis is involved.</p>
        </section>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link to="/notes" className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm hover:border-line-2">
          <span className="grid size-10 place-items-center rounded-xl bg-sky-soft text-sky"><NotebookPen className="size-5" /></span>
          <span className="flex-1"><span className="block font-semibold text-ink">Saved notes</span><span className="text-sm text-ink-3">{p.notes.length ? `${p.notes.length} note${p.notes.length > 1 ? 's' : ''} and ${p.bookmarks.filter(b => b.kind === 'paragraph').length} highlighted paragraphs` : 'Add notes from any lesson paragraph'}</span></span>
          <ArrowRight className="size-4 text-ink-3" />
        </Link>
        <Link to="/notes?tab=questions" className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm hover:border-line-2">
          <span className="grid size-10 place-items-center rounded-xl bg-amber-soft text-amber">{qBookmarks ? <BookMarked className="size-5" /> : <Bookmark className="size-5" />}</span>
          <span className="flex-1"><span className="block font-semibold text-ink">Bookmarked questions</span><span className="text-sm text-ink-3">{qBookmarks ? `${qBookmarks} saved for review` : 'Bookmark tricky questions while you practise'}</span></span>
          <ArrowRight className="size-4 text-ink-3" />
        </Link>
      </div>

      <Section title="Your study journey" action={<Link to="/journey" className="text-sm font-semibold text-violet hover:underline">Full journey</Link>}>
        <JourneyMap compact />
      </Section>
    </div>
  )
}
