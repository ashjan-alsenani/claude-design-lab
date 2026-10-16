import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LESSONS, MODULES, TONE } from '../data/curriculum'
import { lessonMastery, nextRecommendedLesson } from '../lib/insights'
import { useProfile } from '../lib/store'

/**
 * The four Define modules as a winding learning path. Completed lessons are
 * filled, the recommended current lesson pulses, the rest are outlined.
 */
export function JourneyMap({ compact = false }: { compact?: boolean }) {
  const p = useProfile()
  const current = nextRecommendedLesson(p)
  return (
    <div className={`grid gap-4 ${compact ? 'md:grid-cols-2 xl:grid-cols-4' : 'lg:grid-cols-2'}`}>
      {MODULES.map((m, mi) => {
        const ls = LESSONS.filter(l => l.module === m.id)
        const done = ls.filter(l => p.completed[l.id]).length
        const tone = TONE[m.tone]
        return (
          <motion.section
            key={m.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: mi * 0.06 }}
            className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={`text-sm font-bold ${tone.text}`}>Module {m.ref}</div>
                <h3 className="mt-0.5 font-display text-lg font-semibold leading-snug text-ink">{m.title}</h3>
              </div>
              <span className="tabular shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-2">{done}/{ls.length}</span>
            </div>
            {!compact && <p className="mt-2 text-sm leading-relaxed text-ink-2">{m.blurb}</p>}
            <ol className="relative mt-4 space-y-1">
              <span className="absolute bottom-3 left-[15px] top-3 w-0.5 rounded-full bg-surface-3" aria-hidden />
              <span className={`absolute left-[15px] top-3 w-0.5 rounded-full ${tone.bg} transition-[height] duration-700`} style={{ height: `calc(${(done / ls.length) * 100}% - 12px)` }} aria-hidden />
              {ls.map(l => {
                const isDone = !!p.completed[l.id]
                const isCur = l.id === current && !isDone
                const mastery = lessonMastery(p, l.id)
                return (
                  <li key={l.id} className="relative">
                    <Link to={`/lessons/${l.id}`} className="group flex items-center gap-3 rounded-xl py-1.5 pr-2 hover:bg-surface-2">
                      <span className={`relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold transition-colors ${isDone ? `${tone.bg} ${tone.border} text-surface` : isCur ? `${tone.border} bg-surface ${tone.text}` : 'border-line-2 bg-surface text-ink-3'}`}>
                        {isDone ? <Check className="size-4" /> : l.id.split('.')[2]}
                        {isCur && <span className={`absolute inset-0 rounded-full border-2 ${tone.border} motion-safe:animate-[pulse-ring_1.8s_var(--ease-out)_infinite]`} aria-hidden />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm ${isCur ? 'font-semibold text-ink' : isDone ? 'text-ink' : 'text-ink-2'}`}>{l.short}</span>
                        {isCur && <span className={`block text-xs font-semibold ${tone.text}`}>Up next</span>}
                      </span>
                      {mastery !== null && <span className="tabular text-xs font-semibold text-ink-3" title="Mastery estimate">{Math.round(mastery * 100)}%</span>}
                    </Link>
                  </li>
                )
              })}
            </ol>
          </motion.section>
        )
      })}
    </div>
  )
}
