import { Bookmark, BookmarkCheck, CheckCircle2, CircleX, Eye, EyeOff, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonMeta } from '../data/curriculum'
import type { Question } from '../data/types'
import { recordAnswer, update, uid, useProfile } from '../lib/store'
import { Rich } from './Rich'
import { DifficultyBadge } from './ui'

const LETTERS = ['A', 'B', 'C', 'D']

export function useBookmarkQuestion(q: Question) {
  const marked = useProfile(p => p.bookmarks.some(b => b.kind === 'question' && b.ref === q.id))
  const toggle = () => update(p => {
    const i = p.bookmarks.findIndex(b => b.kind === 'question' && b.ref === q.id)
    if (i >= 0) p.bookmarks.splice(i, 1)
    else p.bookmarks.push({ id: uid(), kind: 'question', lesson: q.lesson, ref: q.id, label: q.stem.replace(/[*[\]`$]/g, '').slice(0, 140), at: Date.now() })
  })
  return { marked, toggle }
}

/**
 * Question with four options.
 * mode 'learn': answer is revealed and recorded immediately.
 * mode 'test': selection only; the parent reveals with `reveal` and records.
 */
export function QuestionCard({
  q, mode = 'learn', selected: selectedProp, onSelect, reveal = false, index, showTrapToggle = true, compact = false, onAnswered,
}: {
  q: Question
  mode?: 'learn' | 'test'
  selected?: number | null
  onSelect?: (i: number) => void
  reveal?: boolean
  index?: number
  showTrapToggle?: boolean
  compact?: boolean
  onAnswered?: (correct: boolean) => void
}) {
  const [own, setOwn] = useState<number | null>(null)
  const [traps, setTraps] = useState(false)
  const selected = selectedProp !== undefined ? selectedProp : own
  const revealed = mode === 'learn' ? selected !== null : reveal
  const { marked, toggle } = useBookmarkQuestion(q)

  const choose = (i: number) => {
    if (revealed) return
    if (mode === 'learn') {
      setOwn(i)
      onSelect?.(i)
      const correct = i === q.answer
      recordAnswer({ questionId: q.id, lesson: q.lesson, correct, mistake: correct ? null : q.optionMistakes?.[i] ?? null, xp: q.difficulty === 'advanced' || q.difficulty === 'master' || q.difficulty === 'trap' ? 10 : 5 })
      onAnswered?.(correct)
    } else {
      onSelect?.(i)
    }
  }

  return (
    <article className={`rounded-2xl border border-line bg-surface ${compact ? 'p-4' : 'p-5 sm:p-6'} font-sans`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {index !== undefined && <span className="tabular text-sm font-semibold text-ink-3">Question {index + 1}</span>}
        <DifficultyBadge d={q.difficulty} />
        {q.numeric && <span className="chip">Calculation</span>}
        <span className="chip">Lesson {q.lesson}</span>
        <div className="ml-auto flex gap-1">
          {showTrapToggle && (
            <button className="btn btn-ghost btn-sm" onClick={() => setTraps(t => !t)} aria-pressed={traps} title="Highlight trap wording">
              {traps ? <EyeOff className="size-4" /> : <Eye className="size-4" />}<span className="hidden sm:inline">{traps ? 'Hide trap words' : 'Reveal trap words'}</span>
            </button>
          )}
          <button className="btn btn-ghost btn-sm btn-icon" onClick={toggle} aria-label={marked ? 'Remove question bookmark' : 'Bookmark question'} title={marked ? 'Bookmarked' : 'Bookmark'}>
            {marked ? <BookmarkCheck className="size-4 text-amber" /> : <Bookmark className="size-4" />}
          </button>
        </div>
      </div>
      <div className="text-[1.04rem] font-medium leading-relaxed text-ink"><Rich text={q.stem} traps={traps} /></div>
      {q.table && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="tabular w-full min-w-[360px] text-sm">
            <thead><tr className="bg-surface-2">{q.table.head.map((h, i) => <th key={i} className="px-3 py-2 text-left font-semibold text-ink">{h}</th>)}</tr></thead>
            <tbody>{q.table.rows.map((r, i) => <tr key={i} className="border-t border-line">{r.map((c, j) => <td key={j} className="px-3 py-2 text-ink-2">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Answer options">
        {q.options.map((o, i) => {
          const isSel = selected === i
          const isAns = i === q.answer
          let cls = 'border-line hover:border-violet/60 hover:bg-violet-soft/30'
          if (!revealed && isSel) cls = 'border-violet bg-violet-soft/60 ring-2 ring-violet/20'
          if (revealed && isAns) cls = 'border-good bg-good-soft'
          if (revealed && isSel && !isAns) cls = 'border-bad bg-bad-soft'
          if (revealed && !isSel && !isAns) cls = 'border-line opacity-80'
          return (
            <div key={i}>
              <button
                role="radio"
                aria-checked={isSel}
                disabled={revealed}
                onClick={() => choose(i)}
                className={`flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-[0.97rem] leading-relaxed transition-colors duration-150 disabled:cursor-default ${cls}`}
              >
                <span className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${revealed && isAns ? 'bg-good text-surface' : revealed && isSel ? 'bg-bad text-surface' : isSel ? 'bg-violet text-surface' : 'bg-surface-2 text-ink-2'}`}>{LETTERS[i]}</span>
                <span className="flex-1 text-ink"><Rich text={o} traps={traps} /></span>
                {revealed && isAns && <CheckCircle2 className="mt-1 size-4 shrink-0 text-good" />}
                {revealed && isSel && !isAns && <CircleX className="mt-1 size-4 shrink-0 text-bad" />}
              </button>
              {revealed && (isSel || isAns) && (
                <p className="mt-1.5 px-3.5 pl-[3.25rem] text-sm leading-relaxed text-ink-2"><Rich text={q.optionNotes[i]} /></p>
              )}
            </div>
          )
        })}
      </div>
      {revealed && (
        <div className="mt-5 rounded-xl bg-surface-2 p-4">
          <div className={`flex items-center gap-2 font-semibold ${selected === q.answer ? 'text-good' : selected === null ? 'text-ink' : 'text-bad'}`}>
            {selected === q.answer ? <><CheckCircle2 className="size-5" /> Correct</> : selected === null ? 'Not answered' : <><CircleX className="size-5" /> Not quite. The best answer is {LETTERS[q.answer]}.</>}
          </div>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2"><Rich text={q.explanation} /></p>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-semibold text-ink-2 hover:text-ink">Why each option is right or wrong</summary>
            <ul className="mt-2 space-y-1.5">
              {q.optionNotes.map((n, i) => <li key={i} className="flex gap-2 leading-relaxed text-ink-2"><span className={`font-bold ${i === q.answer ? 'text-good' : 'text-ink-3'}`}>{LETTERS[i]}.</span><span><Rich text={n} /></span></li>)}
            </ul>
          </details>
          <Link to={`/lessons/${q.lesson}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-violet hover:underline">
            Review lesson {q.lesson}: {lessonMeta(q.lesson).short} <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      )}
    </article>
  )
}
