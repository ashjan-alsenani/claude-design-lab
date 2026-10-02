import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useAnimationControls, useMotionValue } from 'motion/react'
import type { StepApi } from '../screens/MissionScreen'
import { SHIELD_ACTIONS } from '../data/missions'
import { Icon } from '../art/icons'
import { Star } from '../art/objects'
import { centerOf } from '../components/fx'
import { useGame } from '../state/game'
import { ar } from '../lib/env'
import './games.css'

const NEEDED = 4
const SHIELD_D = 'M150 12 280 60v100c0 88-58 146-130 172C78 306 20 248 20 160V60Z'
const PIECES = [
  { clip: { x: 150, y: 0, w: 150, h: 172 }, a: '#5ec8ff', b: '#2f5bea' },
  { clip: { x: 0, y: 0, w: 150, h: 172 }, a: '#7be3b0', b: '#1fc8c0' },
  { clip: { x: 150, y: 172, w: 150, h: 170 }, a: '#ffa6d4', b: '#ff5fa8' },
  { clip: { x: 0, y: 172, w: 150, h: 170 }, a: '#c9a6ff', b: '#7b4dff' },
]

export function ShieldStep({ api }: { api: StepApi }) {
  const { sfx } = useGame()
  const [pieces, setPieces] = useState(0)
  const [used, setUsed] = useState<number[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [flying, setFlying] = useState<number | null>(null)
  const shieldRef = useRef<HTMLDivElement>(null)
  const complete = pieces >= NEEDED

  const overShield = (x: number, y: number) => {
    const r = shieldRef.current?.getBoundingClientRect()
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  }

  const choose = (i: number) => {
    if (complete || used.includes(i) || flying !== null) return
    const a = SHIELD_ACTIONS[i]
    if (!a.good) {
      setMistakes((m) => m + 1)
      api.wrong(a.hint ?? 'هذا لا يحمينا من البكتيريا المقاومة. جرّب غيره!')
      return
    }
    setFlying(i)
  }

  const landed = (i: number) => {
    const n = pieces + 1
    setFlying(null)
    setUsed((u) => [...u, i])
    setPieces(n)
    sfx('piece')
    api.correct(centerOf(shieldRef.current), { firstTry: mistakes === 0, say: n < NEEDED ? `قطعة رقم ${ar(n)}! بقي ${ar(NEEDED - n)} 🛡️` : 'اكتمل الدرع الذهبي! 🛡️✨' })
    if (n >= NEEDED) {
      window.setTimeout(() => {
        sfx('celebrate')
        api.say('حمينا مدينة الصحة معًا! 🎉', 'celebrate')
        api.baktoro('fallen', 'آآآه! هُزمت! 😵')
        api.burst(centerOf(shieldRef.current), 'stars', 18)
      }, 700)
    }
  }

  return (
    <div className={`shield-game ${complete ? 'complete' : ''}`}>
      <h3 className="q-cloud">
        اختر التصرفات الصحيحة لبناء الدرع
        <span className="shield-counter">
          {ar(pieces)} / {ar(NEEDED)}
        </span>
      </h3>

      <div className="shield-arena">
        <div className="bubbles-col start">
          {[0, 1, 2].map((i) => (
            <ActionBubble key={i} i={i} used={used.includes(i)} flying={flying === i} onChoose={choose} onLanded={landed} target={shieldRef} overShield={overShield} reduced={api.reduced} />
          ))}
        </div>

        <div className="shield-core" ref={shieldRef}>
          <BigShield pieces={pieces} complete={complete} reduced={api.reduced} />
        </div>

        <div className="bubbles-col end">
          {[3, 4, 5].map((i) => (
            <ActionBubble key={i} i={i} used={used.includes(i)} flying={flying === i} onChoose={choose} onLanded={landed} target={shieldRef} overShield={overShield} reduced={api.reduced} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {complete && (
          <motion.div className="next-row" initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 1.6 }}>
            <button type="button" className="btn3d big ready" onClick={api.done}>
              أنهِ المهمة <span aria-hidden>🏆</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ActionBubble({
  i,
  used,
  flying,
  onChoose,
  onLanded,
  target,
  overShield,
  reduced,
}: {
  i: number
  used: boolean
  flying: boolean
  onChoose: (i: number) => void
  onLanded: (i: number) => void
  target: React.RefObject<HTMLDivElement | null>
  overShield: (x: number, y: number) => boolean
  reduced: boolean
}) {
  const a = SHIELD_ACTIONS[i]
  const ref = useRef<HTMLButtonElement>(null)
  const dragged = useRef(false)
  const ctl = useAnimationControls()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const landedRef = useRef(onLanded)
  useEffect(() => {
    landedRef.current = onLanded
  })

  useEffect(() => {
    void ctl.start({ opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.5, duration: 0.6, delay: 0.15 + i * 0.07 } })
  }, [ctl, i])

  // Once chosen, the bubble flies into the shield and becomes a piece.
  useEffect(() => {
    if (!flying) return
    const from = centerOf(ref.current)
    const to = centerOf(target.current)
    let live = true
    void ctl
      .start({
        x: to.x - from.x + mx.get(),
        y: to.y - from.y + my.get(),
        scale: 0.3,
        rotate: 200,
        opacity: 0.2,
        transition: { duration: reduced ? 0.1 : 0.55, ease: [0.4, 0, 0.2, 1] },
      })
      .then(() => live && landedRef.current(i))
    return () => {
      live = false
    }
  }, [flying, ctl, mx, my, target, reduced, i])

  const wiggle = () =>
    void ctl.start({ x: [0, -12, 12, -8, 8, 0], rotate: [0, -6, 6, -3, 3, 0], scale: 1, opacity: 1, transition: { duration: 0.5 } })

  return (
    <div className={`bubble-slot ${used ? 'used' : ''}`} style={{ ['--bd' as string]: `${-i * 0.8}s` }}>
      {!used ? (
        <motion.button
          ref={ref}
          type="button"
          className="action-bubble"
          style={{ x: mx, y: my }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={ctl}
          drag={!flying}
          dragSnapToOrigin
          dragMomentum={false}
          whileDrag={{ scale: 1.1, zIndex: 20 }}
          whileTap={{ scale: 0.94 }}
          onDragStart={() => {
            dragged.current = true
          }}
          onDragEnd={(e) => {
            const p = 'changedTouches' in e ? (e as TouchEvent).changedTouches[0] : (e as PointerEvent)
            if (p && overShield(p.clientX, p.clientY)) {
              onChoose(i)
              if (!a.good) wiggle()
            }
          }}
          onClick={() => {
            // a drag ends with a click event; only real taps/keys select here
            if (dragged.current) {
              dragged.current = false
              return
            }
            onChoose(i)
            if (!a.good) wiggle()
          }}
        >
          <span className="ab-icon">
            <Icon name={a.icon} size={58} />
          </span>
          <span className="ab-text">{a.text}</span>
        </motion.button>
      ) : (
        <motion.span className="bubble-done" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.6 }} aria-label={`${a.text}: أُضيفت إلى الدرع`}>
          ✓
        </motion.span>
      )}
    </div>
  )
}

function BigShield({ pieces, complete, reduced }: { pieces: number; complete: boolean; reduced: boolean }) {
  return (
    <div className="big-shield-wrap">
      {complete && !reduced && (
        <div className="orbit" aria-hidden>
          {Array.from({ length: 8 }, (_, k) => (
            <span key={k} className="orbit-star" style={{ ['--k' as string]: k }}>
              <Star size={30} />
            </span>
          ))}
        </div>
      )}
      <motion.svg
        viewBox="0 0 300 345"
        className="big-shield"
        role="img"
        aria-label={complete ? 'درع ذهبي مكتمل' : `الدرع: ${ar(pieces)} من ${ar(NEEDED)} قطع`}
        animate={complete ? { scale: [1, 1.12, 1], rotateY: [0, 360] } : { scale: 1 }}
        transition={{ duration: reduced ? 0 : 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
      >
        <defs>
          <clipPath id="shield-clip">
            <path d={SHIELD_D} />
          </clipPath>
          {PIECES.map((p, k) => (
            <linearGradient key={k} id={`piece-${k}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={p.a} />
              <stop offset="1" stopColor={p.b} />
            </linearGradient>
          ))}
          <linearGradient id="shield-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff3b0" />
            <stop offset="0.4" stopColor="#ffd23f" />
            <stop offset="0.75" stopColor="#ffb000" />
            <stop offset="1" stopColor="#e08a00" />
          </linearGradient>
          <linearGradient id="shield-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* depth */}
        <path d={SHIELD_D} transform="translate(0 12)" fill="rgb(23 32 107 / 0.22)" />
        {/* glass body */}
        <path d={SHIELD_D} fill="url(#shield-glass)" stroke="#fff" strokeWidth="6" strokeDasharray={complete ? undefined : '14 10'} />
        <g clipPath="url(#shield-clip)">
          {PIECES.map((p, k) =>
            k < pieces ? (
              <motion.g
                key={k}
                initial={{ opacity: 0, scale: 1.35 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.55, bounce: 0.5 }}
                style={{ originX: `${p.clip.x === 0 ? 75 : 225}px`, originY: `${p.clip.y === 0 ? 86 : 257}px` }}
              >
                <rect x={p.clip.x} y={p.clip.y} width={p.clip.w} height={p.clip.h} fill={`url(#piece-${k})`} />
                <rect x={p.clip.x + 10} y={p.clip.y + 10} width={p.clip.w - 20} height="14" rx="7" fill="#fff" opacity="0.35" />
              </motion.g>
            ) : null,
          )}
          <AnimatePresence>
            {complete && (
              <motion.rect key="gold" x="0" y="0" width="300" height="345" fill="url(#shield-gold)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} />
            )}
          </AnimatePresence>
          {/* seams */}
          <path d="M150 0v345M0 172h300" stroke="#fff" strokeWidth="5" opacity={complete ? 0.25 : 0.7} />
          {/* gloss */}
          <path d="M40 70 150 28v70C110 104 70 120 40 150Z" fill="#fff" opacity="0.25" />
        </g>
        <path d={SHIELD_D} fill="none" stroke={complete ? '#c77800' : 'rgb(23 32 107 / 0.25)'} strokeWidth="5" />
        {/* emblem */}
        <motion.g initial={false} animate={{ opacity: complete ? 1 : 0.35, scale: complete ? 1 : 0.9 }} style={{ originX: '150px', originY: '175px' }}>
          <circle cx="150" cy="175" r="48" fill={complete ? '#fff' : 'rgb(255 255 255 / 0.5)'} />
          <g transform="rotate(-35 150 175)">
            <rect x="116" y="160" width="68" height="30" rx="15" fill="#fff" stroke="#17206b" strokeOpacity="0.2" strokeWidth="2" />
            <path d="M150 160h19a15 15 0 0 1 0 30h-19Z" fill="#ff6b8b" />
          </g>
          {complete && <path d="M128 214l14 12 30-30" stroke="#3cc46a" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </motion.g>
      </motion.svg>
      <div className={`shield-floor ${complete ? 'gold' : ''}`} aria-hidden />
    </div>
  )
}
