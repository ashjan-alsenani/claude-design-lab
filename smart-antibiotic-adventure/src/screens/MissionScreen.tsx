import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGame, type Point } from '../state/game'
import { missionById, type Step } from '../data/missions'
import { Hud } from '../components/Hud'
import { Bursts, centerOf, Confetti, Speech, useBursts } from '../components/fx'
import { Noor, type NoorMood } from '../art/Noor'
import { Baktoro, type BaktoroMood } from '../art/Baktoro'
import { Star } from '../art/objects'
import { CastleScene, ClinicScene, ClockScene, GardenScene, LabScene } from '../art/scenes'
import { QuizStep } from '../games/QuizStep'
import { ClockStep } from '../games/ClockStep'
import { SortStep } from '../games/SortStep'
import { LabStep } from '../games/LabStep'
import { CompareStep } from '../games/CompareStep'
import { ShieldStep } from '../games/ShieldStep'
import { ar } from '../lib/env'
import type { BurstSpec } from '../components/fx'
import './mission.css'

export type StepApi = {
  correct: (origin: Point, opts?: { firstTry?: boolean; say?: string; points?: number }) => void
  wrong: (hint: string) => void
  say: (text: string, mood?: NoorMood) => void
  baktoro: (mood: BaktoroMood, say?: string | null) => void
  burst: (p: Point, kind?: BurstSpec['kind'], n?: number) => void
  done: () => void
  reduced: boolean
  portrait: boolean
}

const TAUNTS = ['هِهِه! جرّب مرة أخرى 😜', 'ههههه! كدتُ أفوز 😈', 'أوووه، هذا يعجبني! 😏']
const CHEERS = ['أحسنت! 🌟', 'رائع جدًا! ✨', 'إجابة ذكية! 💡', 'ممتاز! 🎉']

const SCENES = [ClinicScene, ClockScene, GardenScene, LabScene, CastleScene]

export function MissionScreen({ id }: { id: number }) {
  const mission = missionById(id)
  const { go, addScore, completeMission, env, sfx } = useGame()
  const [phase, setPhase] = useState<'intro' | 'play' | 'complete'>('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [noorMood, setNoorMood] = useState<NoorMood>('idle')
  const [moodKey, setMoodKey] = useState(0)
  const [speech, setSpeech] = useState(mission.intro)
  const [bk, setBk] = useState<{ mood: BaktoroMood; say: string | null }>({ mood: 'idle', say: null })
  const [earned, setEarned] = useState(0)
  const [confetti, setConfetti] = useState(0)
  const { bursts, burst, done: burstDone } = useBursts()
  const timers = useRef<number[]>([])
  const Scene = SCENES[id - 1]

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const step: Step | undefined = mission.steps[stepIndex]

  const mistakesRef = useRef(0)

  const finish = () => {
    const earnedStars = mistakesRef.current <= 1 ? 3 : mistakesRef.current <= 3 ? 2 : 1
    setPhase('complete')
    completeMission(id, earnedStars)
    sfx('mission')
    setConfetti((c) => c + 1)
    setNoorMood('celebrate')
    setSpeech(`أنهينا ${mission.place}! 🎉`)
    if (id !== 5) setBk({ mood: 'shocked', say: 'سأعود! 💨' })
  }

  // Rebuilt each render so handlers always see current state; steps only call
  // it from event handlers, never from effect dependencies.
  const api: StepApi = {
    correct: (origin, opts) => {
      const firstTry = opts?.firstTry ?? true
      const pts = opts?.points ?? (firstTry ? 10 : 5)
      addScore(pts, origin, firstTry ? 3 : 1)
      setEarned((e) => e + pts)
      burst(origin, 'stars', 12)
      sfx('correct')
      setNoorMood('happy')
      setMoodKey((k) => k + 1)
      setSpeech(opts?.say ?? CHEERS[Math.floor(Math.random() * CHEERS.length)])
      setBk({ mood: 'shocked', say: 'أوه لااا! 😱' })
      later(() => setBk((b) => (b.mood === 'shocked' ? { mood: 'idle', say: null } : b)), 1800)
    },
    wrong: (hint) => {
      mistakesRef.current += 1
      setMistakes(mistakesRef.current)
      sfx('wrong')
      setNoorMood('tip')
      setSpeech(hint)
      setBk({ mood: 'smug', say: TAUNTS[Math.floor(Math.random() * TAUNTS.length)] })
      later(() => setBk((b) => (b.mood === 'smug' ? { mood: 'idle', say: null } : b)), 2200)
    },
    say: (text, mood = 'tip') => {
      setSpeech(text)
      setNoorMood(mood)
      setMoodKey((k) => k + 1)
    },
    baktoro: (mood, say = null) => setBk({ mood, say }),
    burst,
    done: () => {
      if (stepIndex + 1 < mission.steps.length) {
        setStepIndex(stepIndex + 1)
        setNoorMood('idle')
      } else {
        finish()
      }
    },
    reduced: env.reducedMotion,
    portrait: env.portrait,
  }

  const stars = mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1

  const toMap = (e: React.MouseEvent) =>
    go({ name: 'map' }, { color: mission.color, origin: centerOf(e.currentTarget as Element), kind: 'clouds' })

  const progress = phase === 'complete' ? 1 : phase === 'intro' ? 0.02 : stepIndex / mission.steps.length
  const noorH = env.portrait ? 150 : Math.min(440, Math.max(300, window.innerHeight * 0.52))

  return (
    <main className={`mission theme-${id}`}>
      <Scene />
      <Hud progress={progress} label={`المهمة ${ar(id)}: ${mission.title}`} onBack={toMap} />

      <div className="stage">
        <aside className="noor-col">
          <div className="noor-speech">
            <Speech who="نور" tail={env.portrait ? 'right' : 'bottom'} id={`${speech}-${moodKey}`}>
              {speech}
            </Speech>
          </div>
          <Noor height={noorH} mood={noorMood} moodKey={moodKey} reduced={env.reducedMotion} />
        </aside>

        <section className="play" aria-live="polite">
          <div className={`bk-slot ${bk.mood === 'idle' ? 'peek' : 'up'}`}>
            <Baktoro mood={bk.mood} say={bk.say} size={env.portrait ? 84 : 118} reduced={env.reducedMotion} />
          </div>

          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div
                key="intro"
                className="intro-card glass"
                initial={{ opacity: 0, y: 40, rotateX: -18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', duration: 0.7, bounce: 0.35 }}
              >
                <motion.div
                  className="intro-badge"
                  initial={{ rotateY: -180, scale: 0.7 }}
                  animate={{ rotateY: 0, scale: 1 }}
                  transition={{ type: 'spring', duration: 1, bounce: 0.4, delay: 0.2 }}
                >
                  <span aria-hidden>{mission.emoji}</span>
                </motion.div>
                <p className="intro-place">
                  المهمة {ar(id)} · {mission.place}
                </p>
                <h2 className="intro-title">{mission.title}</h2>
                <p className="intro-goal">
                  <span aria-hidden>🎯</span> {mission.goal}
                </p>
                <button
                  type="button"
                  className="btn3d theme big ready"
                  onClick={() => {
                    sfx('click')
                    setPhase('play')
                    setNoorMood('idle')
                    setSpeech(stepSpeech(mission.steps[0]))
                  }}
                >
                  ابدأ المهمة <span aria-hidden>✨</span>
                </button>
              </motion.div>
            )}

            {phase === 'play' && step && (
              <motion.div
                key={`step-${stepIndex}`}
                className="step-wrap"
                initial={{ opacity: 0, x: -60, rotateY: 12 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: 60, rotateY: -10, transition: { duration: 0.22 } }}
                transition={{ type: 'spring', duration: 0.6, bounce: 0.25 }}
              >
                <StepView step={step} api={api} missionId={id} onEnter={setSpeech} />
                <div className="step-dots" aria-hidden>
                  {mission.steps.map((_, i) => (
                    <span key={i} className={i < stepIndex ? 'past' : i === stepIndex ? 'now' : ''} />
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 'complete' && (
              <motion.div
                key="complete"
                className="complete-card glass"
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', duration: 0.7, bounce: 0.4 }}
              >
                <p className="complete-kicker">اكتملت المهمة!</p>
                <motion.div
                  className="complete-badge"
                  initial={{ rotateY: 540, scale: 0.6, opacity: 0 }}
                  animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: env.reducedMotion ? 0.2 : 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
                >
                  <span className="cb-emoji" aria-hidden>
                    {mission.emoji}
                  </span>
                  <span className="cb-ribbon">{mission.badge}</span>
                </motion.div>
                <div className="complete-stars" aria-label={`حصلت على ${ar(stars)} نجوم`}>
                  {[1, 2, 3].map((s) => (
                    <motion.span
                      key={s}
                      initial={{ scale: 0.4, opacity: 0, rotate: -90 }}
                      animate={{ scale: s <= stars ? 1 : 0.8, opacity: 1, rotate: 0 }}
                      transition={{ type: 'spring', bounce: 0.6, duration: 0.6, delay: 0.9 + s * 0.18 }}
                      className={s <= stars ? 'on' : 'off'}
                    >
                      <Star size={s === 2 ? 64 : 50} />
                    </motion.span>
                  ))}
                </div>
                <p className="complete-points">
                  +{ar(earned)} نقطة <span aria-hidden>⭐</span>
                </p>
                <button type="button" className="btn3d theme big ready" onClick={id === 5 ? (e) => go({ name: 'final' }, { color: '#ffc83d', origin: centerOf(e.currentTarget), kind: 'portal' }) : toMap}>
                  {id === 5 ? 'إلى الاحتفال الكبير 🎉' : 'العودة إلى الخريطة 🗺️'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <Bursts bursts={bursts} onDone={burstDone} />
      <Confetti fire={confetti} duration={2600} density={0.6} />
    </main>
  )
}

function stepSpeech(step: Step) {
  switch (step.kind) {
    case 'quiz':
      return 'اقرأ السؤال جيدًا، ثم اضغط على البطاقة الصحيحة 👇'
    case 'clock':
      return 'اسحب الكبسولة إلى الموعد الصحيح، أو اضغط على الموعد مباشرة ⏰'
    case 'sort':
      return 'اسحب كل بطاقة إلى السلة المناسبة، أو اضغط على السلة ✅❌'
    case 'lab':
      return 'انظر في المجهر! اضغط «ماذا سيحدث؟» لنتابع القصة 🔬'
    case 'compare':
      return 'اضغط على كل بطاقة لتكشف الإجابة 👆'
    case 'shield':
      return 'اختر التصرفات الصحيحة فقط لتبني الدرع 🛡️'
  }
}

function StepView({ step, api, missionId, onEnter }: { step: Step; api: StepApi; missionId: number; onEnter: (t: string) => void }) {
  useEffect(() => onEnter(stepSpeech(step)), [step, onEnter])
  switch (step.kind) {
    case 'quiz':
      return <QuizStep step={step} api={api} />
    case 'clock':
      return <ClockStep api={api} />
    case 'sort':
      return <SortStep step={step} api={api} />
    case 'lab':
      return <LabStep api={api} />
    case 'compare':
      return <CompareStep api={api} />
    case 'shield':
      return <ShieldStep api={api} key={missionId} />
  }
}
