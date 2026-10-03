import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Germ } from '../art/objects'
import { centerOf } from '../components/fx'
import { ar } from '../lib/env'
import { useGame } from '../state/game'
import type { PlayApi } from './ActivityShell'

const STEPS = [
  { key: 'wet', emoji: '💧', label: 'بلّل', say: 'أولًا نبلّل أيدينا بالماء 💧' },
  { key: 'soap', emoji: '🧼', label: 'صابون', say: 'رائع! الآن نضع الصابون 🧼' },
  { key: 'scrub', emoji: '🤲', label: 'افرك', say: 'افرك يديك! حرّك إصبعك أو الفأرة فوق اليدين، أو اضغط عليهما 🤲 حتى نصل إلى ٢٠' },
  { key: 'rinse', emoji: '🚿', label: 'اشطف', say: 'ممتاز! الآن نشطف الصابون بالماء 🚿' },
  { key: 'dry', emoji: '🧻', label: 'جفّف', say: 'وأخيرًا نجفف أيدينا بمنشفة نظيفة 🧻' },
] as const

const GERMS = [
  { x: 18, y: 30, hue: 'green' },
  { x: 30, y: 62, hue: 'purple' },
  { x: 12, y: 74, hue: 'orange' },
  { x: 36, y: 22, hue: 'pink' },
  { x: 64, y: 28, hue: 'blue' },
  { x: 82, y: 40, hue: 'green' },
  { x: 70, y: 66, hue: 'purple' },
  { x: 88, y: 76, hue: 'orange' },
] as const

const SCRUB_SECONDS = 20

/** Wet → soap → scrub for 20 seconds (germs fade) → rinse → dry. */
export function HandWash({ api }: { api: PlayApi }) {
  const { sfx } = useGame()
  const [step, setStep] = useState(0)
  const [scrub, setScrub] = useState(0) // seconds of scrubbing
  const [foam, setFoam] = useState<{ id: number; x: number; y: number }[]>([])
  const lastMove = useRef(0)
  const foamId = useRef(0)
  const handsRef = useRef<HTMLDivElement>(null)
  const scrubbing = STEPS[step]?.key === 'scrub'

  useEffect(() => {
    api.say(STEPS[0].say)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // scrub time only runs while the child is actively rubbing
  useEffect(() => {
    if (!scrubbing) return
    let raf = 0
    let prev = performance.now()
    const tick = (now: number) => {
      const dt = (now - prev) / 1000
      prev = now
      if (now - lastMove.current < 180) setScrub((s) => Math.min(SCRUB_SECONDS, s + dt))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scrubbing])

  // reached 20 seconds
  useEffect(() => {
    if (!scrubbing || scrub < SCRUB_SECONDS) return
    const el = handsRef.current
    api.correct(centerOf(el), { points: 10, say: 'وصلنا إلى ٢٠ ثانية! طردنا كل الجراثيم 🎉' })
    const t = window.setTimeout(() => advance(), 900)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrub >= SCRUB_SECONDS, scrubbing])

  const advance = () => {
    const n = step + 1
    api.progress(n / STEPS.length)
    if (n >= STEPS.length) {
      api.finish(3, 'يداك نظيفتان ولامعتان! ✨ تذكّر: ٢٠ ثانية بالماء والصابون.')
      return
    }
    setStep(n)
    api.say(STEPS[n].say, n === 2 ? 'tip' : 'idle')
  }

  const doStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    sfx('pop')
    api.burst(centerOf(e.currentTarget), 'sparkles', 8)
    if (STEPS[step].key === 'rinse') setFoam([])
    advance()
  }

  const rub = (clientX: number, clientY: number, boost = 0) => {
    if (!scrubbing) return
    lastMove.current = performance.now()
    if (boost) setScrub((s) => Math.min(SCRUB_SECONDS, s + boost))
    const box = handsRef.current?.getBoundingClientRect()
    if (!box || Math.random() > (api.reduced ? 0.15 : 0.35)) return
    const id = ++foamId.current
    setFoam((f) => [...f.slice(-28), { id, x: ((clientX - box.left) / box.width) * 100, y: ((clientY - box.top) / box.height) * 100 }])
  }

  const cleanLevel = scrub / SCRUB_SECONDS
  const shown = step <= 2 ? GERMS.filter((_, i) => cleanLevel < (i + 1) / (GERMS.length + 1)) : []
  const sec = Math.floor(scrub)

  return (
    <div className="wash">
      <ol className="wash-steps" aria-label="خطوات غسل اليدين">
        {STEPS.map((s, i) => (
          <li key={s.key} className={i < step ? 'past' : i === step ? 'now' : ''}>
            <span aria-hidden>{i < step ? '✔️' : s.emoji}</span>
            {s.label}
          </li>
        ))}
      </ol>

      <div
        ref={handsRef}
        className={`wash-hands ${step >= 1 ? 'wet' : ''} ${step >= 2 && step < 4 ? 'soapy' : ''} ${step >= 4 ? 'clean' : ''} ${scrubbing ? 'scrubbing' : ''}`}
        onPointerMove={(e) => rub(e.clientX, e.clientY)}
        onPointerDown={(e) => rub(e.clientX, e.clientY, 0.7)}
        role={scrubbing ? 'button' : undefined}
        tabIndex={scrubbing ? 0 : -1}
        aria-label={scrubbing ? 'افرك اليدين' : undefined}
        onKeyDown={(e) => {
          if (scrubbing && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            const c = centerOf(handsRef.current)
            rub(c.x, c.y, 1)
          }
        }}
      >
        <Hands />
        <AnimatePresence>
          {shown.map((g) => (
            <motion.span
              key={`${g.x}-${g.y}`}
              className="wash-germ"
              style={{ left: `${g.x}%`, top: `${g.y}%` }}
              exit={{ opacity: 0, scale: 0.4, rotate: 120, transition: { duration: 0.35 } }}
            >
              <Germ size={46} hue={g.hue} mood={scrubbing ? 'surprised' : 'happy'} />
            </motion.span>
          ))}
        </AnimatePresence>
        {foam.map((f) => (
          <span key={f.id} className="foam" style={{ left: `${f.x}%`, top: `${f.y}%` }} aria-hidden />
        ))}
        {step === 1 && <span className="drops" aria-hidden />}
        {step >= 4 && <span className="shine" aria-hidden>✨</span>}
      </div>

      {scrubbing ? (
        <div className="wash-meter" role="progressbar" aria-valuemin={0} aria-valuemax={SCRUB_SECONDS} aria-valuenow={sec} aria-label="ثواني الفرك">
          <div className="wash-fill" style={{ transform: `scaleX(${cleanLevel})` }} />
          <span className="wash-count">
            {ar(sec)} / {ar(SCRUB_SECONDS)} ثانية
          </span>
        </div>
      ) : (
        step < STEPS.length && (
          <button type="button" className="btn3d big act-go ready" onClick={doStep}>
            <span aria-hidden>{STEPS[step].emoji}</span> {STEPS[step].label}
          </button>
        )
      )}
    </div>
  )
}

/** Two friendly cartoon hands, palms toward us. */
function Hands() {
  const hand = (flip: boolean) => (
    <g transform={flip ? 'translate(400 0) scale(-1 1)' : undefined}>
      <rect x="40" y="70" width="34" height="96" rx="17" fill="url(#skin)" stroke="#e0a77e" strokeWidth="3" />
      <rect x="78" y="48" width="34" height="116" rx="17" fill="url(#skin)" stroke="#e0a77e" strokeWidth="3" />
      <rect x="116" y="56" width="34" height="108" rx="17" fill="url(#skin)" stroke="#e0a77e" strokeWidth="3" />
      <rect x="152" y="84" width="30" height="86" rx="15" fill="url(#skin)" stroke="#e0a77e" strokeWidth="3" />
      <rect x="168" y="168" width="28" height="70" rx="14" transform="rotate(-38 182 200)" fill="url(#skin)" stroke="#e0a77e" strokeWidth="3" />
      <path d="M38 140c0-14 10-22 26-22h96c14 0 24 8 24 24v66c0 32-24 54-60 54h-26c-34 0-60-24-60-58Z" fill="url(#skin)" stroke="#e0a77e" strokeWidth="3" />
      <path d="M70 200q30 18 70 0" stroke="#e8a985" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
      <rect x="66" y="252" width="80" height="40" rx="14" fill="#8ec5ff" />
    </g>
  )
  return (
    <svg viewBox="0 0 400 300" className="hands-svg" aria-hidden>
      <defs>
        <radialGradient id="skin" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#ffe7d2" />
          <stop offset="1" stopColor="#f6c39c" />
        </radialGradient>
      </defs>
      {hand(false)}
      {hand(true)}
    </svg>
  )
}
