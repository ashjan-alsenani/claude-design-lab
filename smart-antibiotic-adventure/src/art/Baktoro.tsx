import { useId } from 'react'
import { motion, AnimatePresence, type TargetAndTransition } from 'motion/react'
import './baktoro.css'

export type BaktoroMood = 'idle' | 'smug' | 'shocked' | 'dance' | 'surrender' | 'fallen' | 'hidden'

const SPIKES = ['#ff8fc7', '#ffd23f', '#5ec8ff', '#ff9f2e', '#a46bff', '#7be3b0']

/** Baktoro — a round, funny (never scary) bacteria villain. */
export function BaktoroArt({ mood = 'idle', size = 160 }: { mood?: BaktoroMood; size?: number }) {
  const id = useId()
  const shocked = mood === 'shocked' || mood === 'fallen'
  const smug = mood === 'smug' || mood === 'dance'
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden className={`baktoro-svg mood-${mood}`}>
      <defs>
        <radialGradient id={`${id}b`} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#e2ffb0" />
          <stop offset="0.45" stopColor="#8fdc4a" />
          <stop offset="1" stopColor="#3c9a1f" />
        </radialGradient>
        <radialGradient id={`${id}s`} cx="40%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* spikes */}
      <g className="bk-spikes">
        {SPIKES.concat(SPIKES).map((c, i) => (
          <g key={i} transform={`rotate(${i * 30 + 15} 100 108)`}>
            <path d="M100 26 110 46H90Z" fill={c} stroke="#17206b" strokeOpacity="0.15" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="100" cy="28" r="5" fill={c} />
          </g>
        ))}
      </g>
      {/* white flag (surrender) */}
      {mood === 'surrender' && (
        <g className="bk-flag">
          <rect x="160" y="40" width="4" height="78" rx="2" fill="#a77b4f" />
          <path d="M164 42c14-6 22 6 34 0v28c-12 6-20-6-34 0Z" fill="#fff" stroke="#c9d2f0" strokeWidth="2" />
        </g>
      )}
      {/* arms */}
      <g stroke="#3c9a1f" strokeWidth="9" strokeLinecap="round" fill="none">
        {mood === 'surrender' ? (
          <>
            <path className="bk-arm-l" d="M42 120c-12-6-18-18-16-30" />
            <path d="M158 112c6-6 6-14 4-20" />
          </>
        ) : shocked ? (
          <>
            <path className="bk-arm-l" d="M42 118c-14-10-18-24-12-36" />
            <path className="bk-arm-r" d="M158 118c14-10 18-24 12-36" />
          </>
        ) : (
          <>
            <path className="bk-arm-l" d="M42 124c-14 2-22 10-22 20" />
            <path className="bk-arm-r" d="M158 124c14 2 22 10 22 20" />
          </>
        )}
      </g>
      <g fill="#8fdc4a" stroke="#3c9a1f" strokeWidth="3">
        {mood === 'surrender' ? (
          <>
            <circle cx="26" cy="88" r="8" />
            <circle cx="162" cy="90" r="8" />
          </>
        ) : shocked ? (
          <>
            <circle cx="30" cy="80" r="8" />
            <circle cx="170" cy="80" r="8" />
          </>
        ) : (
          <>
            <circle cx="20" cy="146" r="8" />
            <circle cx="180" cy="146" r="8" />
          </>
        )}
      </g>
      {/* feet */}
      <g fill="#3c9a1f">
        <ellipse cx="78" cy="180" rx="16" ry="9" />
        <ellipse cx="122" cy="180" rx="16" ry="9" />
      </g>
      {/* body */}
      <circle cx="100" cy="108" r="62" fill={`url(#${id}b)`} stroke="#2f7a16" strokeWidth="3" />
      <ellipse cx="78" cy="78" rx="22" ry="14" fill={`url(#${id}s)`} transform="rotate(-25 78 78)" />
      <g fill="#2f7a16" opacity="0.22">
        <circle cx="140" cy="130" r="7" />
        <circle cx="62" cy="140" r="5" />
        <circle cx="132" cy="80" r="4" />
      </g>
      {/* brows */}
      <g stroke="#17206b" strokeWidth="6" strokeLinecap="round">
        {smug ? (
          <>
            <path d="M58 76l26 8" />
            <path d="M142 72l-24 6" />
          </>
        ) : shocked ? (
          <>
            <path d="M60 66q14-10 26-2" fill="none" />
            <path d="M140 66q-14-10-26-2" fill="none" />
          </>
        ) : mood === 'surrender' ? (
          <>
            <path d="M60 82l24-6" />
            <path d="M140 82l-24-6" />
          </>
        ) : (
          <>
            <path d="M60 76l24 2" />
            <path d="M140 76l-24 2" />
          </>
        )}
      </g>
      {/* eyes */}
      <g className="bk-eyes">
        <ellipse cx="76" cy="102" rx={shocked ? 17 : 15} ry={shocked ? 20 : smug ? 12 : 17} fill="#fff" stroke="#17206b" strokeOpacity="0.15" strokeWidth="2" />
        <ellipse cx="124" cy="102" rx={shocked ? 17 : 15} ry={shocked ? 20 : smug ? 12 : 17} fill="#fff" stroke="#17206b" strokeOpacity="0.15" strokeWidth="2" />
        {mood === 'fallen' ? (
          <g stroke="#17206b" strokeWidth="4" strokeLinecap="round">
            <path d="M68 94l16 16M84 94l-16 16M116 94l16 16M132 94l-16 16" />
          </g>
        ) : (
          <g className={smug ? 'bk-pupils-side' : ''}>
            <circle cx={smug ? 70 : 78} cy="104" r={shocked ? 6 : 8} fill="#17206b" />
            <circle cx={smug ? 118 : 126} cy="104" r={shocked ? 6 : 8} fill="#17206b" />
            <circle cx={smug ? 73 : 81} cy="100" r="2.6" fill="#fff" />
            <circle cx={smug ? 121 : 129} cy="100" r="2.6" fill="#fff" />
          </g>
        )}
      </g>
      {/* mouth */}
      {shocked ? (
        <g>
          <ellipse cx="100" cy="142" rx="13" ry="16" fill="#7a1638" />
          <ellipse cx="100" cy="150" rx="8" ry="6" fill="#ff6b8b" />
        </g>
      ) : smug ? (
        <g>
          <path d="M76 136q26 22 50-6" fill="#7a1638" stroke="#17206b" strokeWidth="3" strokeLinecap="round" />
          <path d="M84 138h8v6h-8z" fill="#fff" />
        </g>
      ) : mood === 'surrender' ? (
        <path d="M82 146q18-12 36 0" stroke="#17206b" strokeWidth="5" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <path d="M80 134q20 18 40 0" fill="#7a1638" stroke="#17206b" strokeWidth="3" strokeLinecap="round" />
          <path d="M90 136h7v6h-7zM103 136h7v6h-7z" fill="#fff" />
        </g>
      )}
      <ellipse cx="58" cy="128" rx="10" ry="6" fill="#ff7aa8" opacity="0.45" />
      <ellipse cx="142" cy="128" rx="10" ry="6" fill="#ff7aa8" opacity="0.45" />
      {/* sweat drop */}
      {(mood === 'surrender' || mood === 'shocked') && (
        <path className="bk-sweat" d="M156 70c4 6 6 10 6 13a6 6 0 0 1-12 0c0-3 2-7 6-13Z" fill="#9fdcff" stroke="#4cbcff" strokeWidth="1.5" />
      )}
      {/* dizzy stars */}
      {mood === 'fallen' && (
        <g className="bk-dizzy">
          {[0, 120, 240].map((a) => (
            <path
              key={a}
              transform={`rotate(${a} 100 40) translate(100 18)`}
              d="M0-8l2.4 5 5.6.8-4 4 1 5.6L0 4.8-5 7.4l1-5.6-4-4 5.6-.8Z"
              fill="#ffd23f"
              stroke="#e08a00"
              strokeWidth="1"
            />
          ))}
        </g>
      )}
    </svg>
  )
}

const MOTION: Record<BaktoroMood, TargetAndTransition> = {
  idle: { y: [0, -8, 0], rotate: [0, -3, 0], transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } },
  smug: { y: [0, -14, 0, -6, 0], rotate: [0, 6, -4, 0], transition: { duration: 1.1, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.6 } },
  shocked: { x: [0, -8, 8, -6, 6, 0], scale: [1, 1.08, 1], transition: { duration: 0.6, ease: 'easeOut' } },
  dance: { rotate: [0, -10, 10, -10, 10, 0], y: [0, -10, 0, -10, 0, 0], transition: { duration: 1.2, repeat: Infinity } },
  surrender: { rotate: [0, -4, 4, 0], y: [0, -4, 0], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
  fallen: { rotate: [0, -20, 92, 84, 90], y: [0, -40, 30, 22, 26], transition: { duration: 1.2, ease: 'easeOut' } },
  hidden: {},
}

/** Animated Baktoro with an optional speech bubble. */
export function Baktoro({
  mood = 'idle',
  size = 150,
  say,
  className = '',
  reduced = false,
}: {
  mood?: BaktoroMood
  size?: number
  say?: string | null
  className?: string
  reduced?: boolean
}) {
  return (
    <AnimatePresence>
      {mood !== 'hidden' && (
        <motion.div
          className={`baktoro ${className}`}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.35 }}
        >
          <AnimatePresence mode="wait">
            {say && (
              <motion.div
                key={say}
                className="bk-say"
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
                transition={{ type: 'spring', duration: 0.4, bounce: 0.4 }}
              >
                {say}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div key={mood} animate={reduced ? undefined : MOTION[mood]} style={{ transformOrigin: '50% 90%' }}>
            <BaktoroArt mood={mood} size={size} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
