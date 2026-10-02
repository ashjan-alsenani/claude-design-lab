import { motion } from 'motion/react'
import { useGame, TOTAL_MISSIONS } from '../state/game'
import { Star } from '../art/objects'
import { CountUp } from './fx'
import { ar } from '../lib/env'
import './hud.css'

export function SoundToggle() {
  const { sound, toggleSound } = useGame()
  return (
    <button
      type="button"
      className="icon-btn sound-btn"
      onClick={toggleSound}
      aria-pressed={sound}
      aria-label={sound ? 'إيقاف الصوت' : 'تشغيل الصوت'}
      title={sound ? 'إيقاف الصوت' : 'تشغيل الصوت'}
    >
      <span aria-hidden>{sound ? '🔊' : '🔇'}</span>
    </button>
  )
}

export function Hud({
  progress,
  label,
  onBack,
  backLabel = 'الخريطة',
}: {
  /** 0..1 progress shown in the bar */
  progress?: number
  label?: string
  onBack?: (e: React.MouseEvent) => void
  backLabel?: string
}) {
  const { score, completed, scoreTarget } = useGame()
  const done = Object.keys(completed).length
  const p = progress ?? done / TOTAL_MISSIONS
  return (
    <header className="hud">
      <div className="hud-side">
        {onBack && (
          <button type="button" className="icon-btn hud-back" onClick={onBack} aria-label={`العودة إلى ${backLabel}`} title={backLabel}>
            <span aria-hidden>🗺️</span>
          </button>
        )}
      </div>
      <div className="hud-center">
        {label && <div className="hud-label">{label}</div>}
        <div
          className="hud-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(p * 100)}
          aria-label="التقدّم"
        >
          <motion.div
            className="hud-fill"
            initial={false}
            animate={{ scaleX: Math.max(0.04, p) }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.2 }}
          >
            <span className="hud-shine" />
          </motion.div>
        </div>
      </div>
      <div className="hud-side end">
        <div className="score-pill" ref={scoreTarget} role="status" aria-label={`النقاط ${ar(score)}`}>
          <Star size={30} className="score-star" />
          <span className="score-num" aria-hidden>
            <CountUp value={score} format={ar} />
          </span>
        </div>
        <SoundToggle />
      </div>
    </header>
  )
}
