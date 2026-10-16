import { motion } from 'motion/react'
import { RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useReduced } from '../lib/motion'

/** A 3D flip card. Falls back to a cross-fade with reduced motion. */
export function FlipCard({ front, back, flipped, onFlip, label, minH = 'min-h-56' }: { front: ReactNode; back: ReactNode; flipped: boolean; onFlip: () => void; label?: ReactNode; minH?: string }) {
  const reduced = useReduced()
  const face = `absolute inset-0 flex flex-col rounded-3xl border border-line p-6 shadow-md [backface-visibility:hidden]`
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={flipped ? 'Show front of card' : 'Reveal answer'}
      className={`group relative block w-full ${minH} text-left [perspective:1400px]`}
    >
      <motion.div
        className={`relative h-full w-full ${minH} [transform-style:preserve-3d]`}
        animate={reduced ? {} : { rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className={`${face} bg-surface ${reduced && flipped ? 'opacity-0' : ''}`}>
          {label && <div className="text-xs font-semibold text-ink-3">{label}</div>}
          <div className="flex flex-1 items-center justify-center text-center font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">{front}</div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-3"><RotateCw className="size-3.5" /> Tap to reveal</div>
        </div>
        <div className={`${face} bg-gradient-to-br from-violet-soft to-surface ${reduced ? (flipped ? '' : 'opacity-0') : '[transform:rotateY(180deg)]'}`}>
          {label && <div className="text-xs font-semibold text-violet">Answer</div>}
          <div className="flex flex-1 items-center justify-center overflow-y-auto text-center text-[1.02rem] leading-relaxed text-ink">{back}</div>
        </div>
      </motion.div>
    </button>
  )
}
