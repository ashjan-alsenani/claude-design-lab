import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGame, type Point } from '../state/game'
import { ACTIVITIES, type ActivityId } from '../data/activities'
import { Hud } from '../components/Hud'
import { Bursts, centerOf, Confetti, Speech, useBursts, type BurstSpec } from '../components/fx'
import { Aleen, type AleenMood } from '../art/Aleen'
import { Star } from '../art/objects'
import { Bubbles } from '../art/scenes'
import { ar } from '../lib/env'
import './activities.css'

/** What every activity can do: talk through Aleen, reward, and finish. */
export type PlayApi = {
  say: (text: string, mood?: AleenMood) => void
  correct: (origin: Point, opts?: { points?: number; say?: string; quiet?: boolean }) => void
  wrong: (hint: string) => void
  burst: (p: Point, kind?: BurstSpec['kind'], n?: number) => void
  finish: (stars: number, summary?: string) => void
  progress: (p: number) => void
  reduced: boolean
  portrait: boolean
}

const CHEERS = ['أحسنت! 🌟', 'رائع! ✨', 'ممتاز! 🎉', 'برافو! 👏', 'ذكي جدًا! 💡']

export function ActivityShell({ id, children }: { id: ActivityId; children: (api: PlayApi, round: number) => ReactNode }) {
  const a = ACTIVITIES[id]
  const { go, addScore, completeActivity, activities, env, sfx } = useGame()
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro')
  const [round, setRound] = useState(0)
  const [speech, setSpeech] = useState(a.intro)
  const [mood, setMood] = useState<AleenMood>('idle')
  const [moodKey, setMoodKey] = useState(0)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ stars: number; summary?: string; newSticker: boolean }>({ stars: 0, newSticker: false })
  const [earned, setEarned] = useState(0)
  const [confetti, setConfetti] = useState(0)
  const [ending, setEnding] = useState(false)
  const { bursts, burst, done: burstDone } = useBursts()
  // let the last celebration play for a moment before the reward card
  useEffect(() => {
    if (!ending) return
    const t = window.setTimeout(() => {
      setPhase('done')
      setEnding(false)
    }, env.reducedMotion ? 100 : 700)
    return () => window.clearTimeout(t)
  }, [ending, env.reducedMotion])

  const talk = useCallback((text: string, m: AleenMood = 'idle') => {
    setSpeech(text)
    setMood(m)
    setMoodKey((k) => k + 1)
  }, [])

  const api: PlayApi = {
    say: talk,
    correct: (origin, opts) => {
      const pts = opts?.points ?? 5
      if (pts > 0) {
        addScore(pts, origin, opts?.quiet ? 1 : 2)
        setEarned((e) => e + pts)
      }
      burst(origin, 'stars', opts?.quiet ? 6 : 10)
      sfx('correct')
      talk(opts?.say ?? CHEERS[moodKey % CHEERS.length], 'happy')
    },
    wrong: (hint) => {
      sfx('wrong')
      talk(hint, 'tip')
    },
    burst,
    progress: setProgress,
    finish: (stars, summary) => {
      const had = (activities[id] ?? 0) > 0
      completeActivity(id, stars)
      setResult({ stars, summary, newSticker: !had })
      setProgress(1)
      sfx('mission')
      setConfetti((c) => c + 1)
      talk(had ? 'أحسنت! لعبت مرة أخرى وتحسّنت! 🌟' : `حصلت على ملصق جديد: «${a.sticker.name}»! 🎉`, 'celebrate')
      setEnding(true)
    },
    reduced: env.reducedMotion,
    portrait: env.portrait,
  }

  const start = () => {
    sfx('click')
    setRound((r) => r + 1)
    setEarned(0)
    setProgress(0)
    setPhase('play')
    talk(a.intro)
  }

  const toHub = (e: React.MouseEvent) => go({ name: 'activities' }, { color: a.color[1], origin: centerOf(e.currentTarget as Element), kind: 'bubbles' })
  const aleenH = env.portrait ? 130 : Math.min(400, Math.max(260, window.innerHeight * 0.46))

  return (
    <main className="act-screen" style={{ ['--c1' as string]: a.color[0], ['--c2' as string]: a.color[1], ['--c3' as string]: a.color[2] }}>
      <div className="act-bg" aria-hidden>
        <span className="act-blob b1" />
        <span className="act-blob b2" />
        <span className="act-blob b3" />
        <Bubbles n={env.lowPower ? 6 : 12} />
      </div>
      <Hud progress={phase === 'intro' ? 0.02 : progress} label={`${a.emoji} ${a.title}`} onBack={toHub} backLabel="ساحة الألعاب" backIcon="🎪" />

      <div className="act-stage">
        <aside className="act-guide">
          <div className="act-speech">
            <Speech who="ألين" tail={env.portrait ? 'right' : 'bottom'} id={`${speech}-${moodKey}`}>
              {speech}
            </Speech>
          </div>
          <Aleen height={aleenH} mood={mood} moodKey={moodKey} reduced={env.reducedMotion} />
        </aside>

        <section className="act-play" aria-live="polite">
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div
                key="intro"
                className="act-card act-intro glass"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.18 } }}
                transition={{ type: 'spring', duration: 0.6, bounce: 0.35 }}
              >
                <div className="act-badge" aria-hidden>
                  {a.emoji}
                </div>
                <h2 className="act-title">{a.title}</h2>
                <p className="act-desc">{a.desc}</p>
                <div className="act-meta">
                  <span>⏱️ {ar(a.minutes)} {a.minutes === 1 ? 'دقيقة' : a.minutes === 2 ? 'دقيقتان' : 'دقائق'}</span>
                  <span>
                    🏅 الملصق: {a.sticker.emoji} {a.sticker.name}
                  </span>
                </div>
                <button type="button" className="btn3d big act-go ready" onClick={start}>
                  هيا نلعب! <span aria-hidden>▶</span>
                </button>
              </motion.div>
            )}

            {phase === 'play' && (
              <motion.div
                key={`play-${round}`}
                className="act-game"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16, transition: { duration: 0.18 } }}
                transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
              >
                {children(api, round)}
              </motion.div>
            )}

            {phase === 'done' && (
              <motion.div
                key="done"
                className="act-card act-done glass"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
              >
                <p className="act-kicker">انتهت اللعبة! 🎉</p>
                <motion.div
                  className="sticker big"
                  style={{ ['--s1' as string]: a.color[0], ['--s2' as string]: a.color[1], ['--s3' as string]: a.color[2] }}
                  initial={{ rotateY: env.reducedMotion ? 0 : 540, scale: 0.7, opacity: 0 }}
                  animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: env.reducedMotion ? 0.2 : 1.1, ease: [0.23, 1, 0.32, 1], delay: 0.15 }}
                >
                  <span className="sticker-emoji" aria-hidden>
                    {a.sticker.emoji}
                  </span>
                  <span className="sticker-name">{a.sticker.name}</span>
                </motion.div>
                {result.newSticker && <p className="act-new">✨ ملصق جديد في ألبومك! ✨</p>}
                <div className="act-stars" aria-label={`حصلت على ${ar(result.stars)} من ٣ نجوم`}>
                  {[1, 2, 3].map((s) => (
                    <motion.span
                      key={s}
                      className={s <= result.stars ? 'on' : 'off'}
                      initial={{ scale: 0.5, opacity: 0, rotate: -60 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: 'spring', bounce: 0.55, duration: 0.55, delay: 0.7 + s * 0.15 }}
                    >
                      <Star size={s === 2 ? 60 : 46} />
                    </motion.span>
                  ))}
                </div>
                {result.summary && <p className="act-summary">{result.summary}</p>}
                {earned > 0 && (
                  <p className="act-points">
                    +{ar(earned)} نقطة <span aria-hidden>⭐</span>
                  </p>
                )}
                <div className="act-actions">
                  <button type="button" className="btn3d act-go" onClick={start}>
                    <span aria-hidden>↻</span> العب مرة أخرى
                  </button>
                  <button type="button" className="btn3d small blue" onClick={toHub}>
                    🎪 ألعاب أخرى
                  </button>
                </div>
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

/** Stars from mistakes: 0–1 → 3, 2–3 → 2, more → 1. */
export function starsFor(mistakes: number, ok = 1, good = 3) {
  return mistakes <= ok ? 3 : mistakes <= good ? 2 : 1
}

/** Fisher–Yates shuffle (new array). */
export function shuffle<T>(arr: readonly T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
