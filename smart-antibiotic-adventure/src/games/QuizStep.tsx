import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'motion/react'
import type { Step } from '../data/missions'
import type { StepApi } from '../screens/MissionScreen'
import { Icon } from '../art/icons'
import { Bulb, CheckBadge, CrossBadge } from '../art/objects'
import { TiltCard, centerOf } from '../components/fx'
import './games.css'

type Quiz = Extract<Step, { kind: 'quiz' }>

export function QuizStep({ step, api }: { step: Quiz; api: StepApi }) {
  const [tried, setTried] = useState<number[]>([])
  const [solved, setSolved] = useState<number | null>(null)

  const pick = (i: number, el: HTMLElement) => {
    if (solved !== null || tried.includes(i)) return
    const opt = step.options[i]
    if (opt.correct) {
      setSolved(i)
      api.correct(centerOf(el), { firstTry: tried.length === 0 })
    } else {
      setTried((t) => [...t, i])
      api.wrong(opt.hint ?? 'فكّر مرة أخرى، أنت قريب!')
    }
  }

  return (
    <div className="quiz">
      <motion.h3
        className="q-cloud"
        initial={{ opacity: 0, y: -16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.35 }}
      >
        {step.question}
      </motion.h3>

      <div className={`options n${step.options.length}`} role="group" aria-label="الخيارات">
        {step.options.map((o, i) => (
          <OptionCard
            key={i}
            index={i}
            text={o.text}
            icon={o.icon}
            state={solved === i ? 'correct' : tried.includes(i) ? 'wrong' : solved !== null ? 'faded' : 'idle'}
            onPick={pick}
            reduced={api.reduced}
          />
        ))}
      </div>

      <AnimatePresence>
        {solved !== null && (
          <motion.div
            className="fact-block"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 0.55, bounce: 0.35, delay: 0.35 }}
          >
            <div className="fact-card">
              <Bulb size={52} className="glow-pulse" />
              <p className="fact-text">
                <span className="fact-label">هل تعلم؟</span>
                {step.fact}
              </p>
            </div>
            <div className="next-row">
              <button type="button" className="btn3d theme ready" onClick={api.done} autoFocus>
                التالي <span aria-hidden>←</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function OptionCard({
  index,
  text,
  icon,
  state,
  onPick,
  reduced,
}: {
  index: number
  text: string
  icon: Quiz['options'][number]['icon']
  state: 'idle' | 'correct' | 'wrong' | 'faded'
  onPick: (i: number, el: HTMLElement) => void
  reduced: boolean
}) {
  const controls = useAnimationControls()
  useEffect(() => {
    if (state === 'wrong')
      void controls.start({ x: [0, -12, 12, -8, 8, -3, 0], rotate: [0, -3, 3, -2, 2, 0, 0], transition: { duration: 0.5 } })
    if (state === 'correct')
      void controls.start({ scale: [1, 1.12, 1.04], y: [0, -12, -6], transition: { duration: 0.5, ease: 'easeOut' } })
  }, [state, controls])
  return (
    <motion.div
      className="opt-wrap"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 50, rotate: index % 2 ? 6 : -6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 0.6, bounce: 0.45, delay: 0.1 + index * 0.08 }}
    >
      <TiltCard max={9} disabled={state !== 'idle'}>
        <motion.button
          type="button"
          className={`opt-card s-${state}`}
          animate={controls}
          whileTap={state === 'idle' ? { scale: 0.95, y: 4 } : undefined}
          onClick={(e) => {
            if (state !== 'idle') return
            onPick(index, e.currentTarget)
          }}
          aria-disabled={state !== 'idle'}
        >
          <span className="opt-icon">
            <Icon name={icon} size={88} />
          </span>
          <span className="opt-text">{text}</span>
          {state === 'correct' && (
            <motion.span className="opt-badge" initial={{ scale: 0.4, rotate: -90, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.6, duration: 0.5 }}>
              <CheckBadge size={52} />
            </motion.span>
          )}
          {state === 'wrong' && (
            <motion.span className="opt-badge" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <CrossBadge size={40} />
            </motion.span>
          )}
        </motion.button>
      </TiltCard>
    </motion.div>
  )
}
