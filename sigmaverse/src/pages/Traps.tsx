import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, BookOpen, Crosshair, Eye, EyeOff, NotebookTabs, ShieldAlert, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { QuestionCard } from '../components/QuestionCard'
import { Rich } from '../components/Rich'
import { Empty, PageHeader } from '../components/ui'
import { lessonMeta } from '../data/curriculum'
import { getQuestion } from '../data/questions'
import { traps } from '../data/traps'
import { MISTAKE_INFO } from '../lib/insights'
import { update, useProfile } from '../lib/store'

const LETTERS = ['A', 'B', 'C', 'D']

export default function Traps() {
  const [sel, setSel] = useState(traps[0].tag)
  const [showWords, setShowWords] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const loc = useLocation()
  const t = traps.find(x => x.tag === sel)!
  const practice = getQuestion(t.practiceQuestionId)
  const qstats = useProfile(p => p.qstats)
  useEffect(() => setRevealed(false), [sel])
  useEffect(() => {
    if (loc.hash === '#notebook') setTimeout(() => document.getElementById('notebook')?.scrollIntoView({ behavior: 'smooth' }), 150)
  }, [loc.hash])

  return (
    <div>
      <PageHeader icon={<ShieldAlert className="size-5" />} title="The Exam Trap Detector" lead="Multiple-choice exams test reading as much as knowledge. Learn the eighteen wording traps that turn a known concept into a wrong answer, see what each question appears to ask versus what it actually asks, and keep a personal notebook of your own mistake patterns." />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Trap wording">
        {traps.map(x => {
          const solved = (qstats[x.practiceQuestionId]?.correct ?? 0) > 0
          return (
            <button key={x.tag} role="tab" aria-selected={sel === x.tag} onClick={() => setSel(x.tag)} className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-bold tracking-wide transition-colors ${sel === x.tag ? 'border-coral bg-coral text-surface' : solved ? 'border-good/40 bg-good-soft text-good' : 'border-line bg-surface text-ink-2 hover:border-coral/50 hover:text-coral'}`}>
              {x.word}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={t.tag} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
            <div className="inline-block rounded-xl bg-coral-soft px-3 py-1 font-mono text-lg font-bold tracking-wide text-coral">{t.word}</div>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">What the wording means</h2>
            <p className="mt-1 leading-relaxed text-ink-2"><Rich text={t.meaning} /></p>
            <h2 className="mt-5 font-display text-lg font-semibold text-ink">Why candidates misunderstand it</h2>
            <p className="mt-1 leading-relaxed text-ink-2"><Rich text={t.whyMissed} /></p>
            <h2 className="mt-5 font-display text-lg font-semibold text-ink">Strategy</h2>
            <p className="mt-1 rounded-2xl bg-teal-soft p-4 leading-relaxed text-ink"><Rich text={t.strategy} /></p>
          </section>

          <section className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-ink">Exam-style example</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowWords(s => !s)} aria-pressed={showWords}>{showWords ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {showWords ? 'Hide trap words' : 'Reveal trap words'}</button>
            </div>
            <p className="mt-3 text-[1.02rem] font-medium leading-relaxed text-ink"><Rich text={t.example.stem} traps={showWords} /></p>
            <ul className="mt-3 space-y-2">
              {t.example.options.map((o, i) => {
                const tempting = revealed && i === t.example.tempting
                const correct = revealed && i === t.example.answer
                return (
                  <li key={i} className={`flex gap-3 rounded-xl border px-3 py-2.5 text-sm leading-relaxed transition-colors ${correct ? 'border-good bg-good-soft' : tempting ? 'border-coral bg-coral-soft' : 'border-line'}`}>
                    <span className="font-bold text-ink-3">{LETTERS[i]}</span>
                    <span className="flex-1 text-ink"><Rich text={o} traps={showWords} /></span>
                    {tempting && <span className="shrink-0 text-xs font-bold text-coral">Tempting</span>}
                    {correct && <span className="shrink-0 text-xs font-bold text-good">Correct</span>}
                  </li>
                )
              })}
            </ul>
            {!revealed && <button className="btn btn-primary btn-sm mt-4" onClick={() => setRevealed(true)}>Reveal the tempting answer and the correct one</button>}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-line-2 p-4">
                <div className="text-xs font-semibold text-ink-3">What the question appears to ask</div>
                <p className="mt-1 leading-relaxed text-ink-2"><Rich text={t.appears} /></p>
              </div>
              <div className="rounded-2xl border-2 border-violet/40 bg-violet-soft/50 p-4">
                <div className="text-xs font-semibold text-violet">What the question actually asks</div>
                <p className="mt-1 leading-relaxed text-ink"><Rich text={t.actually} /></p>
              </div>
            </div>
          </section>
        </motion.div>
      </AnimatePresence>

      {practice && (
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold text-ink"><Crosshair className="size-5 text-coral" /> Practice question: {t.word}</h2>
          <QuestionCard key={practice.id} q={practice} />
          <Link to="/practice?mode=trap" className="btn btn-soft mt-4">Exam Trap Mode practice set <ArrowRight className="size-4" /></Link>
        </section>
      )}

      <MistakeNotebook />
    </div>
  )
}

function MistakeNotebook() {
  const mistakes = useProfile(p => p.mistakes)
  const qstats = useProfile(p => p.qstats)
  const groups = useMemo(() => {
    const m = new Map<string, { n: number; last: number }>()
    for (const x of mistakes) { const g = m.get(x.tag) ?? { n: 0, last: 0 }; g.n++; g.last = Math.max(g.last, x.at); m.set(x.tag, g) }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n)
  }, [mistakes])
  const missedQuestions = useMemo(() => Object.entries(qstats).filter(([, s]) => !s.lastCorrect).sort((a, b) => b[1].lastAt - a[1].lastAt).slice(0, 12).map(([id]) => getQuestion(id)).filter(Boolean), [qstats])

  return (
    <section id="notebook" className="mt-12 scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl font-semibold text-ink"><NotebookTabs className="size-6 text-violet" /> Mistake Notebook</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-2">Every wrong answer that reveals a known misconception is saved here automatically, from questions, formula drills and labs. Patterns that repeat drive your recommendations.</p>
        </div>
        {mistakes.length > 0 && (
          <div className="flex gap-2">
            <Link to="/practice?mode=weak" className="btn btn-primary btn-sm">Practise weak areas</Link>
            <button className="btn btn-ghost btn-sm" onClick={() => { if (window.confirm('Clear all saved mistake patterns? Question history is kept.')) update(p => { p.mistakes = [] }) }}><Trash2 className="size-4" /> Clear</button>
          </div>
        )}
      </div>
      {groups.length === 0 ? (
        <Empty icon={<NotebookTabs className="size-6" />} title="Your notebook is empty">Mistakes are saved here as you practise. A clean notebook today simply means there is no evidence yet.</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {groups.map(([tag, g]) => {
            const info = MISTAKE_INFO[tag as keyof typeof MISTAKE_INFO]
            return (
              <div key={tag} className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold text-ink">{info.label}</div>
                  <span className="tabular shrink-0 rounded-full bg-coral-soft px-2 py-0.5 text-xs font-bold text-coral">{g.n}x</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{info.advice}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Link to={`/lessons/${info.lesson}`} className="btn btn-soft btn-sm"><BookOpen className="size-3.5" /> Lesson {info.lesson}</Link>
                  {info.formula && <Link to={`/formulas/${info.formula}`} className="btn btn-soft btn-sm">Formula drill</Link>}
                  {info.lab && <Link to={`/labs/${info.lab}`} className="btn btn-soft btn-sm">Lab</Link>}
                  <span className="ml-auto self-center text-ink-3">Last {new Date(g.last).toLocaleDateString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {missedQuestions.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 font-display text-lg font-semibold text-ink">Questions you last answered incorrectly</h3>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {missedQuestions.map(q => (
              <li key={q!.id}><Link to={`/practice/question/${q!.id}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-2"><span className="chip shrink-0">{lessonMeta(q!.lesson).short}</span><span className="min-w-0 flex-1 truncate text-ink">{q!.stem.replace(/[*[\]`$]/g, '')}</span><ArrowRight className="size-4 shrink-0 text-ink-3" /></Link></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
