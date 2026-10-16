import { AnimatePresence, motion } from 'motion/react'
import { Award, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ACHIEVEMENTS, evaluateAchievements } from '../lib/insights'
import { useReduced } from '../lib/motion'
import { addXp, update, useProfile } from '../lib/store'

const COLORS = ['var(--violet)', 'var(--teal)', 'var(--coral)', 'var(--amber)', 'var(--sky)']

/** Watches the profile for newly earned achievements and celebrates them. */
export function Celebrations() {
  const p = useProfile()
  const reduced = useReduced()
  const [toast, setToast] = useState<string[]>([])

  useEffect(() => {
    const fresh = evaluateAchievements(p)
    if (!fresh.length) return
    update(d => { for (const id of fresh) { d.achievements[id] = Date.now(); addXp(d, 25) } })
    setToast(t => [...t, ...fresh])
  }, [p])

  useEffect(() => {
    if (!toast.length) return
    const t = window.setTimeout(() => setToast(x => x.slice(1)), 5200)
    return () => window.clearTimeout(t)
  }, [toast])

  const current = ACHIEVEMENTS.find(a => a.id === toast[0])
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[95] flex justify-center px-4 lg:bottom-6" aria-live="polite">
      <AnimatePresence>
        {current && (
          <motion.div key={current.id} initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} transition={{ type: 'spring', damping: 22, stiffness: 300 }} className="pointer-events-auto relative flex w-full max-w-md items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-lg">
            {!reduced && Array.from({ length: 18 }).map((_, i) => (
              <motion.span key={i} className="absolute left-10 top-8 size-1.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: Math.cos((i / 18) * Math.PI * 2) * (50 + (i % 4) * 14), y: Math.sin((i / 18) * Math.PI * 2) * (40 + (i % 3) * 12) - 20, opacity: 0, rotate: 180 }}
                transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1] }} />
            ))}
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-soft text-amber"><Award className="size-6" /></span>
            <div className="flex-1">
              <div className="text-xs font-semibold text-ink-3">Achievement unlocked · +25 XP</div>
              <div className="font-display text-lg font-semibold text-ink">{current.title}</div>
              <div className="text-sm text-ink-2">{current.desc}</div>
              <Link to="/progress#achievements" className="text-xs font-semibold text-violet hover:underline" onClick={() => setToast(t => t.slice(1))}>See all achievements</Link>
            </div>
            <button className="btn btn-ghost btn-icon btn-sm self-start" onClick={() => setToast(t => t.slice(1))} aria-label="Dismiss"><X className="size-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
