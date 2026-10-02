import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { StepApi } from '../screens/MissionScreen'
import { Capsule, Bulb, Sparkle } from '../art/objects'
import { centerOf } from '../components/fx'
import { ar } from '../lib/env'
import './games.css'

const TARGETS = [
  { id: 11, label: '١١ صباحًا', icon: '☀️', correct: false, hint: '١١ صباحًا بعد ٤ ساعات فقط! الطبيب قال كل ٨ ساعات. عُدّ معي من ٧.' },
  { id: 15, label: '٣ عصرًا', icon: '🌤️', correct: true, hint: '' },
  { id: 21, label: '٩ مساءً', icon: '🌙', correct: false, hint: '٩ مساءً بعد ١٤ ساعة، هذا متأخر جدًا! جرّب موعدًا أقرب.' },
]

/** Drag (or tap) the capsule to the next dose time on the clock. */
export function ClockStep({ api }: { api: StepApi }) {
  const [solved, setSolved] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [wrongId, setWrongId] = useState<number | null>(null)
  const refs = useRef<Record<number, HTMLButtonElement | null>>({})

  const hitTest = (x: number, y: number) => {
    for (const t of TARGETS) {
      const r = refs.current[t.id]?.getBoundingClientRect()
      if (r && x >= r.left - 16 && x <= r.right + 16 && y >= r.top - 16 && y <= r.bottom + 16) return t.id
    }
    return null
  }

  const choose = (id: number) => {
    if (solved) return
    const t = TARGETS.find((x) => x.id === id)!
    const el = refs.current[id]
    if (t.correct) {
      setSolved(true)
      api.correct(centerOf(el), { firstTry: mistakes === 0, say: 'صحيح! ٧ صباحًا + ٨ ساعات = ٣ عصرًا ⏰' })
    } else {
      setMistakes((m) => m + 1)
      setWrongId(id)
      window.setTimeout(() => setWrongId(null), 520)
      api.wrong(t.hint)
    }
  }

  return (
    <div className="clock-game">
      <h3 className="q-cloud">متى موعد الجرعة التالية؟</h3>

      <div className="clock-row">
        <div className="rx-card" aria-label="وصفة الطبيب">
          <span className="rx-title">📋 وصفة الطبيب</span>
          <span className="rx-line">
            <b>💊 جرعة كل {ar(8)} ساعات</b>
          </span>
          <span className="rx-line">الجرعة الأولى: {ar(7)} صباحًا</span>
        </div>

        <div className="clock-wrap">
          <BigClock solved={solved} reduced={api.reduced} />
          <AnimatePresence>
            {!solved && (
              <motion.div
                className="capsule-drag"
                drag
                dragSnapToOrigin
                dragMomentum={false}
                dragElastic={0.9}
                whileDrag={{ scale: 1.2, rotate: 20, cursor: 'grabbing' }}
                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
                onDrag={(e) => {
                  const p = 'touches' in e ? (e as TouchEvent).touches[0] : (e as PointerEvent)
                  if (p) setHover(hitTest(p.clientX, p.clientY))
                }}
                onDragEnd={(e) => {
                  const p = 'changedTouches' in e ? (e as TouchEvent).changedTouches[0] : (e as PointerEvent)
                  const hit = p ? hitTest(p.clientX, p.clientY) : null
                  setHover(null)
                  if (hit !== null) choose(hit)
                }}
                aria-hidden
              >
                <span className="capsule-float">
                  <Capsule size={84} />
                  <span className="drag-hint">اسحبني</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="time-targets" role="group" aria-label="اختر موعد الجرعة التالية">
        {TARGETS.map((t, i) => (
          <motion.button
            key={t.id}
            type="button"
            ref={(el) => void (refs.current[t.id] = el)}
            className={`time-pill ${hover === t.id ? 'hover' : ''} ${solved && t.correct ? 'correct' : ''} ${wrongId === t.id ? 'wrong' : ''}`}
            onClick={() => choose(t.id)}
            initial={{ opacity: 0, y: 30 }}
            animate={wrongId === t.id ? { opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0, x: 0 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.4, delay: wrongId === t.id ? 0 : 0.2 + i * 0.08 }}
            whileTap={{ scale: 0.95 }}
            disabled={solved && !t.correct}
          >
            <span className="tp-icon" aria-hidden>
              {t.icon}
            </span>
            {t.label}
            {solved && t.correct && (
              <motion.span className="tp-pill" initial={{ scale: 0.4, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6 }}>
                <Capsule size={44} />
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {solved && (
          <motion.div className="fact-block" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', duration: 0.5, delay: 1.2 }}>
            <div className="fact-card">
              <Bulb size={52} className="glow-pulse" />
              <p className="fact-text">
                <span className="fact-label">هل تعلم؟</span>
                مواعيد الدواء المنتظمة تجعل الدواء يعمل جيدًا داخل الجسم. اطلب من أهلك ضبط منبّه!
              </p>
            </div>
            <div className="next-row">
              <button type="button" className="btn3d theme ready" onClick={api.done}>
                التالي <span aria-hidden>←</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BigClock({ solved, reduced }: { solved: boolean; reduced: boolean }) {
  const nums = Array.from({ length: 12 }, (_, i) => i + 1)
  return (
    <div className={`big-clock ${solved ? 'solved' : ''}`}>
      <svg viewBox="0 0 300 300" aria-hidden>
        <defs>
          <radialGradient id="clockface" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#d8fff1" />
          </radialGradient>
          <linearGradient id="clockrim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5fe3d8" />
            <stop offset="1" stopColor="#0d8e8a" />
          </linearGradient>
        </defs>
        <circle cx="150" cy="158" r="140" fill="rgb(23 32 107 / 0.15)" />
        <circle cx="150" cy="150" r="140" fill="url(#clockrim)" />
        <circle cx="150" cy="150" r="118" fill="url(#clockface)" />
        {/* morning → afternoon arc shows the 8 hours */}
        {solved && (
          <motion.path
            d="M 95 245.3 A 110 110 0 1 1 260 150"
            fill="none"
            stroke="#ffd23f"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduced ? 0 : 1.6, ease: [0.77, 0, 0.175, 1] }}
          />
        )}
        {nums.map((n) => {
          const a = ((n * 30 - 90) * Math.PI) / 180
          const hl = n === 7 || (solved && n === 3)
          return (
            <g key={n}>
              {hl && <circle cx={150 + Math.cos(a) * 92} cy={150 + Math.sin(a) * 92} r="19" fill={n === 7 ? '#ffd23f' : '#3cc46a'} />}
              <text x={150 + Math.cos(a) * 92} y={150 + Math.sin(a) * 92 + 9} textAnchor="middle" fontSize="26" fontWeight="800" fill={hl ? '#fff' : '#17206b'}>
                {ar(n)}
              </text>
            </g>
          )
        })}
        {/* minute hand: spins 8 times while time passes */}
        <motion.g
          initial={{ rotate: 0 }}
          animate={{ rotate: solved ? 360 * 8 : 0 }}
          transition={{ duration: reduced ? 0 : 1.6, ease: [0.77, 0, 0.175, 1] }}
          style={{ originX: '50%', originY: '50%' }}
        >
          <circle cx="150" cy="150" r="100" fill="none" />
          <rect x="146" y="58" width="8" height="96" rx="4" fill="#ff6b8b" />
        </motion.g>
        {/* hour hand: 7 → 3 (240°) */}
        <motion.g
          initial={{ rotate: 210 }}
          animate={{ rotate: solved ? 450 : 210 }}
          transition={{ duration: reduced ? 0 : 1.6, ease: [0.77, 0, 0.175, 1] }}
          style={{ originX: '50%', originY: '50%' }}
        >
          <circle cx="150" cy="150" r="100" fill="none" />
          <rect x="144" y="86" width="12" height="68" rx="6" fill="#17206b" />
        </motion.g>
        <circle cx="150" cy="150" r="12" fill="#17206b" />
        <circle cx="150" cy="150" r="5" fill="#ffd23f" />
      </svg>
      {solved && !reduced && (
        <div className="clock-sparks" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Sparkle key={i} size={20} color="#ffd23f" className="twinkle" style={{ position: 'absolute', left: `${50 + 46 * Math.cos(i)}%`, top: `${50 + 46 * Math.sin(i)}%`, ['--delay' as string]: `${i * 0.2}s` }} />
          ))}
        </div>
      )}
    </div>
  )
}
