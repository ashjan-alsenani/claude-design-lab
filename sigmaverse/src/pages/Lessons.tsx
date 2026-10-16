import { BookOpen, Check, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Meter, PageHeader, StatusBadge } from '../components/ui'
import { LESSONS, loadAllLessons, MODULES, TONE } from '../data/curriculum'
import type { Lesson } from '../data/types'
import { useProfile } from '../lib/store'

export default function Lessons() {
  const p = useProfile()
  const [full, setFull] = useState<Record<string, Lesson>>({})
  useEffect(() => { loadAllLessons().then(ls => setFull(Object.fromEntries(ls.map(l => [l.id, l])))) }, [])
  return (
    <div>
      <PageHeader icon={<BookOpen className="size-5" />} title="Lessons" lead="Nineteen deep-reading lessons, one for each official Define Phase topic. Every lesson follows the same structure: objectives, explanation, business example, animated diagram, definitions, comparisons, misconceptions, exam traps, worked examples, an interactive lab, questions, takeaways, flashcards and source references." />
      {MODULES.map(m => (
        <section key={m.id} className="mb-10">
          <div className="mb-4 flex items-baseline gap-3">
            <span className={`font-display text-sm font-bold ${TONE[m.tone].text}`}>{m.ref}</span>
            <h2 className="font-display text-2xl font-semibold text-ink">{m.title}</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {LESSONS.filter(l => l.module === m.id).map(l => {
              const f = full[l.id]
              const r = p.reading[l.id]
              const done = !!p.completed[l.id]
              return (
                <Link key={l.id} to={`/lessons/${l.id}`} className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TONE[m.tone].soft} ${TONE[m.tone].text}`}>{l.id}</span>
                    {f && <StatusBadge status={f.status} />}
                    {done && <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-good"><Check className="size-3.5" /> Completed</span>}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ink">{f?.title ?? l.short}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-3">Syllabus: {l.officialTitle}</p>
                  {f && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-2">{f.subtitle}</p>}
                  <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-ink-3">
                    {f && <span className="flex items-center gap-1"><Clock className="size-3.5" /> {f.readingMinutes} min</span>}
                    {r && r.progress > 0.02 && !done && <><Meter value={r.progress} tone={m.tone} className="max-w-28" label="Reading progress" /><span className="tabular">{Math.round(r.progress * 100)}% read</span></>}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
