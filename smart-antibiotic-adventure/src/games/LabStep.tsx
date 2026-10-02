import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { StepApi } from '../screens/MissionScreen'
import { Capsule, Germ, Sparkle } from '../art/objects'
import { centerOf } from '../components/fx'
import './games.css'

const CAPTIONS = [
  { icon: '🦠', text: 'هذه بكتيريا كثيرة تعيش هنا. نراها فقط بالمجهر!' },
  { icon: '💊', text: 'جاء المضاد الحيوي لمحاربتها!' },
  { icon: '💨', text: 'اختفت معظم البكتيريا… لكن انتبه! بعضها بقي.' },
  { icon: '🛡️', text: 'البكتيريا الباقية صنعت لنفسها دروعًا صغيرة.' },
  { icon: '😮', text: 'ثم تكاثرت! صارت هناك بكتيريا مقاومة كثيرة.' },
]

const HUES = ['green', 'purple', 'orange', 'blue', 'pink'] as const
const SURVIVORS = [3, 8, 12]

/** Deterministic pseudo-random so layout is stable between renders. */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export function LabStep({ api }: { api: StepApi }) {
  const [phase, setPhase] = useState(0)
  const germs = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => {
        const a = rand(i + 1) * Math.PI * 2
        const r = 12 + rand(i + 7) * 30
        return {
          i,
          x: 50 + Math.cos(a) * r,
          y: 50 + Math.sin(a) * r,
          hue: HUES[i % HUES.length],
          size: 44 + Math.round(rand(i + 3) * 18),
          dur: 3 + rand(i + 11) * 3,
          dx: (rand(i + 5) - 0.5) * 30,
          dy: (rand(i + 9) - 0.5) * 30,
        }
      }),
    [],
  )
  const clones = useMemo(
    () =>
      SURVIVORS.flatMap((s, k) =>
        [0, 1, 2].map((j) => {
          const base = germs[s]
          const a = (j / 3) * Math.PI * 2 + k
          return { key: `${s}-${j}`, from: base, x: Math.min(86, Math.max(14, base.x + Math.cos(a) * 18)), y: Math.min(86, Math.max(14, base.y + Math.sin(a) * 18)) }
        }),
      ),
    [germs],
  )

  const next = (e: React.MouseEvent) => {
    const p = phase + 1
    setPhase(p)
    if (p === 2) api.burst(centerOf(e.currentTarget.closest('.lab-step')?.querySelector('.lens') ?? null), 'sparkles', 14)
    if (p === 3) api.baktoro('smug', 'هِهِه! درع لي! 🛡️')
    if (p === 4) api.baktoro('dance', 'صرنا أقوى! 💪')
    if (p === 4) api.say('لاحظ: البكتيريا هي التي تغيّرت وأصبحت مقاومة 🔍', 'tip')
  }

  const replay = () => {
    setPhase(0)
    api.baktoro('idle', null)
  }

  return (
    <div className="lab-step">
      <h3 className="q-cloud">ماذا يحدث داخل المجهر؟</h3>

      <div className="lab-stage">
        <div className="microscope-frame">
          <div className={`lens phase-${phase}`}>
            <div className="lens-grid" aria-hidden />
            {germs.map((g) => {
              const survivor = SURVIVORS.includes(g.i)
              const gone = phase >= 2 && !survivor
              return (
                <motion.div
                  key={g.i}
                  className="lab-germ"
                  style={{ left: `${g.x}%`, top: `${g.y}%` }}
                  initial={false}
                  animate={gone ? { scale: 0.2, opacity: 0, rotate: 90 } : { scale: survivor && phase >= 3 ? 1.15 : 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: gone ? 0.5 : 0.4, delay: gone ? (g.i % 5) * 0.08 : 0, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div
                    className="germ-wander"
                    style={{ ['--wdur' as string]: `${g.dur}s`, ['--wx' as string]: `${g.dx}px`, ['--wy' as string]: `${g.dy}px` }}
                  >
                    <Germ size={g.size} hue={survivor && phase >= 3 ? 'purple' : g.hue} mood={phase === 1 || (phase === 2 && survivor) ? 'surprised' : 'happy'} shield={survivor && phase >= 3} />
                    {survivor && phase >= 3 && <span className="shield-glow" />}
                  </div>
                  {gone && !api.reduced && <span className="puff" aria-hidden />}
                </motion.div>
              )
            })}

            {/* capsules flying in */}
            <AnimatePresence>
              {phase === 1 &&
                [0, 1, 2, 3, 4].map((k) => (
                  <motion.div
                    key={k}
                    className="lab-capsule"
                    initial={{ x: '-50%', y: -160, rotate: -40, opacity: 0, left: `${18 + k * 16}%` }}
                    animate={{ y: 120 + (k % 2) * 60, rotate: 320, opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.25 } }}
                    transition={{ duration: api.reduced ? 0.1 : 1.1, delay: k * 0.12, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Capsule size={56} />
                  </motion.div>
                ))}
            </AnimatePresence>

            {/* survivors multiply */}
            {phase >= 4 &&
              clones.map((c, n) => (
                <motion.div
                  key={c.key}
                  className="lab-germ"
                  initial={{ left: `${c.from.x}%`, top: `${c.from.y}%`, scale: 0.3, opacity: 0 }}
                  animate={{ left: `${c.x}%`, top: `${c.y}%`, scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8, bounce: 0.4, delay: n * 0.07 }}
                >
                  <div className="germ-wander" style={{ ['--wdur' as string]: `${3 + (n % 3)}s`, ['--wx' as string]: '8px', ['--wy' as string]: '-8px' }}>
                    <Germ size={48} hue="purple" shield />
                  </div>
                </motion.div>
              ))}
            <div className="lens-shine" aria-hidden />
          </div>
          <span className="lens-label" aria-hidden>
            🔬 ×١٠٠٠
          </span>
        </div>

        <div className="lab-side">
          <div className="lab-timeline" aria-hidden>
            {CAPTIONS.map((c, i) => (
              <span key={i} className={i < phase ? 'past' : i === phase ? 'now' : ''}>
                {c.icon}
              </span>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              className="lab-caption"
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', duration: 0.45, bounce: 0.3 }}
              aria-live="polite"
            >
              <span className="lab-cap-icon" aria-hidden>
                {CAPTIONS[phase].icon}
              </span>
              {CAPTIONS[phase].text}
            </motion.p>
          </AnimatePresence>

          {phase < 4 ? (
            <button type="button" className="btn3d theme ready" onClick={next}>
              ماذا سيحدث؟ <span aria-hidden>▶</span>
            </button>
          ) : (
            <motion.div className="lab-key" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.6 }}>
              <p className="key-msg">
                <Sparkle size={22} color="#ffd23f" className="twinkle" />
                البكتيريا هي التي تصبح مقاومة للمضاد، وليس جسم الإنسان.
              </p>
              <div className="lab-actions">
                <button type="button" className="btn3d small blue" onClick={replay}>
                  <span aria-hidden>↻</span> شاهد مرة أخرى
                </button>
                <button
                  type="button"
                  className="btn3d theme ready"
                  onClick={(e) => {
                    api.correct(centerOf(e.currentTarget), { say: 'أنت عالم مختبر رائع! 🔬', points: 10 })
                    api.done()
                  }}
                >
                  فهمت! <span aria-hidden>←</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
