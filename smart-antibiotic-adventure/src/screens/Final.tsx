import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGame } from '../state/game'
import { CastleScene } from '../art/scenes'
import { Aleen } from '../art/Aleen'
import { Baktoro } from '../art/Baktoro'
import { MiniShield, Star, Sparkle } from '../art/objects'
import { Icon, type IconName } from '../art/icons'
import { Hud } from '../components/Hud'
import { Confetti, CountUp, centerOf } from '../components/fx'
import { Floater } from '../components/Parallax'
import { ar } from '../lib/env'
import aleenSrc from '../assets/aleen.webp'
import './final.css'

const RULES: { icon: IconName; text: string }[] = [
  { icon: 'doctor', text: 'الطبيب يقرر' },
  { icon: 'virus', text: 'لا مضاد للزكام' },
  { icon: 'calendar', text: 'أكمل الدواء' },
  { icon: 'nomedicine', text: 'لا أشارك دوائي' },
  { icon: 'handwash', text: 'أغسل يديّ' },
]

export function Final() {
  const { score, completed, env, go, reset, sfx, name, setName } = useGame()
  const [stage, setStage] = useState(0)
  const [shown, setShown] = useState(0)
  const [fire, setFire] = useState(1)
  const [cert, setCert] = useState(false)
  const totalStars = Object.values(completed).reduce((a, b) => a + b, 0)
  const certBtn = useRef<HTMLButtonElement>(null)
  const [today] = useState(() => new Intl.DateTimeFormat('ar-OM', { dateStyle: 'long' }).format(new Date()))

  const closeCert = () => {
    setCert(false)
    certBtn.current?.focus()
  }
  useEffect(() => {
    if (!cert) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCert()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cert])

  // Sequence: title → score counts up → badge → certificate unlock.
  useEffect(() => {
    const fast = env.reducedMotion
    const t = [
      window.setTimeout(() => setStage(1), fast ? 100 : 700),
      window.setTimeout(() => setShown(score), fast ? 150 : 1000),
      window.setTimeout(() => {
        setStage(2)
        setFire((f) => f + 1)
        sfx('celebrate')
      }, fast ? 300 : 2300),
      window.setTimeout(() => setStage(3), fast ? 400 : 3400),
    ]
    return () => t.forEach((x) => window.clearTimeout(x))
  }, [score, env.reducedMotion, sfx])

  return (
    <main className="final theme-5">
      <CastleScene />
      {!env.lowPower &&
        [8, 22, 78, 90, 50].map((x, i) => (
          <Floater key={x} x={`${x}%`} y={`${[18, 60, 22, 64, 8][i]}%`} depth={1 + i * 0.4} dur={4 + i}>
            <Star size={34 + i * 6} />
          </Floater>
        ))}
      <Hud progress={1} label="مدينة الصحة في أمان!" onBack={(e) => go({ name: 'map' }, { color: '#3cc46a', origin: centerOf(e.currentTarget as Element), kind: 'clouds' })} />

      <div className="final-grid">
        <section className="final-copy">
          <motion.h1
            className="final-title title-3d"
            initial={{ opacity: 0, scale: 0.6, rotate: -8, y: 30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            transition={{ type: 'spring', duration: 0.9, bounce: 0.55, delay: 0.2 }}
          >
            أحسنت! <span aria-hidden>🎉</span>
          </motion.h1>
          <motion.p
            className="final-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            أصبحت الآن <strong>حارس المضادات الحيوية</strong>
          </motion.p>

          <AnimatePresence>
            {stage >= 1 && (
              <motion.div className="final-score glass" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.45, duration: 0.6 }}>
                <div className="fs-item">
                  <Star size={46} className="glow-pulse" />
                  <span className="fs-num">
                    <CountUp value={shown} format={ar} duration={1.2} />
                  </span>
                  <span className="fs-label">نقطة</span>
                </div>
                <div className="fs-item">
                  <span className="fs-stars" aria-hidden>
                    ⭐
                  </span>
                  <span className="fs-num">
                    {ar(totalStars)} / {ar(15)}
                  </span>
                  <span className="fs-label">نجمة</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {stage >= 2 && (
              <motion.div className="rules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <p className="rules-title">قواعد الحارس الذهبية</p>
                <ul>
                  {RULES.map((r, i) => (
                    <motion.li key={r.text} initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.6 + i * 0.08 }}>
                      <Icon name={r.icon} size={46} />
                      <span>{r.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {stage >= 3 && (
              <motion.div className="final-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <button
                  type="button"
                  ref={certBtn}
                  className="btn3d big pulse ready"
                  onClick={() => {
                    sfx('click')
                    setCert(true)
                  }}
                >
                  <span aria-hidden>🔓</span> افتح شهادتك
                </button>
                <button
                  type="button"
                  className="btn3d small blue"
                  onClick={(e) => {
                    reset()
                    go({ name: 'landing' }, { color: '#2f5bea', origin: centerOf(e.currentTarget), kind: 'portal' })
                  }}
                >
                  <span aria-hidden>↻</span> العب من جديد
                </button>
                <button
                  type="button"
                  className="btn3d small pink"
                  onClick={(e) => go({ name: 'film' }, { color: '#ff5fa8', origin: centerOf(e.currentTarget), kind: 'portal' })}
                >
                  🎬 شاهد الفيلم
                </button>
                <button
                  type="button"
                  className="btn3d small green"
                  onClick={(e) => go({ name: 'activities' }, { color: '#3cc46a', origin: centerOf(e.currentTarget), kind: 'bubbles' })}
                >
                  🎪 ساحة الألعاب
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <div className="final-hero">
          <div className="hero-shield" aria-hidden>
            <MiniShield size={env.portrait ? 260 : 400} gold className="glow-pulse" />
            <div className="shield-rays" />
          </div>
          <AnimatePresence>
            {stage >= 2 && (
              <motion.div
                className="final-badge"
                initial={{ opacity: 0, scale: 0.4, rotateY: 720 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: env.reducedMotion ? 0.2 : 1.4, ease: [0.23, 1, 0.32, 1] }}
                aria-label="وسام حارس المضادات الحيوية"
              >
                <span className="fb-ring">
                  <MiniShield size={70} gold />
                </span>
                <span className="fb-ribbon">حارس المضادات</span>
              </motion.div>
            )}
          </AnimatePresence>
          <Aleen height={env.portrait ? 260 : Math.min(470, window.innerHeight * 0.58)} mood="celebrate" reduced={env.reducedMotion} />
          <div className="final-baktoro">
            <Baktoro mood="surrender" size={env.portrait ? 92 : 128} say="أستسلم! 🏳️" reduced={env.reducedMotion} />
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Sparkle key={i} size={18 + (i % 3) * 8} color={i % 2 ? '#fff' : '#ffd23f'} className="twinkle final-sp rm-hide" style={{ left: `${10 + i * 15}%`, top: `${12 + ((i * 29) % 60)}%`, ['--delay' as string]: `${i * 0.3}s` }} />
          ))}
        </div>
      </div>

      <Confetti fire={fire} duration={4200} />

      <AnimatePresence>
        {cert && (
          <motion.div className="cert-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCert}>
            <motion.div
              className="cert-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cert-title"
              initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', duration: 0.6, bounce: 0.35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <label className="cert-name-field">
                <span>اكتب اسمك على الشهادة:</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك هنا" maxLength={40} autoFocus />
              </label>

              <div className="certificate printable">
                <div className="cert-border">
                  <div className="cert-head">
                    <MiniShield size={64} gold />
                    <h2 id="cert-title">شهادة حارس المضادات الحيوية</h2>
                    <MiniShield size={64} gold />
                  </div>
                  <p className="cert-line">تُمنح هذه الشهادة إلى البطل/ة</p>
                  <p className="cert-name">{name.trim() || '..................'}</p>
                  <p className="cert-line">
                    لإكمال <b>مغامرة المضاد الذكي</b> وحماية مدينة الصحة من البكتيريا المقاومة
                  </p>
                  <div className="cert-meta">
                    <span>
                      <Star size={26} /> {ar(totalStars)} نجمة
                    </span>
                    <span>
                      <Star size={26} /> {ar(score)} نقطة
                    </span>
                    <span>📅 {today}</span>
                  </div>
                  <div className="cert-foot">
                    <img src={aleenSrc} alt="" className="cert-aleen" />
                    <span className="cert-sign">
                      توقيع: ألين
                      <br />
                      <small>قائدة فريق مدينة الصحة</small>
                    </span>
                  </div>
                </div>
              </div>

              <div className="cert-actions">
                <button type="button" className="btn3d green" onClick={() => window.print()}>
                  <span aria-hidden>🖨️</span> اطبع الشهادة
                </button>
                <button type="button" className="btn3d small blue" onClick={closeCert}>
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
