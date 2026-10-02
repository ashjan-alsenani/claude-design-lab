import { useState } from 'react'
import { motion } from 'motion/react'
import { useGame } from '../state/game'
import { ar } from '../lib/env'
import { CityScene, CITY_FLOATERS, CityFloaterArt } from '../art/scenes'
import { Floater } from '../components/Parallax'
import { Aleen } from '../art/Aleen'
import { Baktoro } from '../art/Baktoro'
import { SoundToggle } from '../components/Hud'
import { Bursts, centerOf, Speech, useBursts } from '../components/fx'
import './landing.css'

export function Landing() {
  const { go, env, sfx, completed } = useGame()
  const [launching, setLaunching] = useState(false)
  const { bursts, burst, done } = useBursts()
  const started = Object.keys(completed).length > 0
  const floaters = env.lowPower || env.reducedMotion ? CITY_FLOATERS.slice(0, 6) : CITY_FLOATERS
  const aleenH = env.portrait ? Math.min(330, window.innerHeight * 0.42) : Math.min(560, window.innerHeight * 0.7)

  const start = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (launching) return
    const c = centerOf(e.currentTarget)
    setLaunching(true)
    sfx('celebrate')
    burst(c, 'stars', 14)
    // Let the rocket + Aleen hop play briefly, then fly through the portal.
    window.setTimeout(() => go({ name: 'map' }, { color: '#2f5bea', origin: c, kind: 'portal' }), env.reducedMotion ? 80 : 420)
  }

  return (
    <main className="landing">
      <CityScene />
      {floaters.map((f, i) => (
        <Floater key={i} x={f.x} y={f.y} depth={f.depth} dur={f.dur} delay={f.delay} rot={f.rot ?? 6} blur={f.blur}>
          <CityFloaterArt f={f} />
        </Floater>
      ))}

      <div className="landing-top">
        <SoundToggle />
      </div>

      <div className="landing-grid">
        <section className="landing-copy" aria-labelledby="title">
          <motion.p
            className="landing-kicker"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', duration: 0.6, bounce: 0.3 }}
          >
            <span aria-hidden>🏙️</span> مرحبًا بك في مدينة الصحة
          </motion.p>
          <h1 id="title" className="landing-title">
            {['مغامرة', 'المضاد', 'الذكي'].map((w, i) => (
              <motion.span
                key={w}
                className={`title-3d tw-${i}`}
                initial={{ opacity: 0, y: 40, rotateX: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.12, type: 'spring', duration: 0.8, bounce: 0.45 }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p
            className="landing-sub"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            هل تستطيع حماية مدينة الصحة
            <br />
            من البكتيريا المقاومة؟
          </motion.p>
          <motion.div
            className="landing-cta"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', duration: 0.6, bounce: 0.4 }}
          >
            <button type="button" className={`btn3d big pulse ${launching ? 'launching' : ''}`} onClick={start} disabled={launching}>
              {started ? 'تابع المغامرة' : 'ابدأ المغامرة'}
              <span className="rocket" aria-hidden>
                🚀
              </span>
            </button>
            <button
              type="button"
              className="btn3d pink film-btn"
              onClick={(e) => go({ name: 'film' }, { color: '#ff5fa8', origin: centerOf(e.currentTarget), kind: 'portal' })}
            >
              🎬 شاهد فيلم ألين
            </button>
            {started && <span className="landing-progress">أنهيت {ar(Object.keys(completed).length)} من ٥ مهمات ⭐</span>}
          </motion.div>
        </section>

        <div className="landing-hero">
          <div className="hero-bubble">
            <Speech who="ألين" tail="bottom" id="hello">
              أنا ألين! هيا نحمي مدينتنا معًا ✨
            </Speech>
          </div>
          <Aleen height={aleenH} mood={launching ? 'happy' : 'idle'} reduced={env.reducedMotion} />
          <div className="hero-baktoro">
            <Baktoro mood="smug" size={env.portrait ? 96 : 130} say="هِهِه! أنا باكتورو 😈" reduced={env.reducedMotion} />
          </div>
        </div>
      </div>
      <Bursts bursts={bursts} onDone={done} />
    </main>
  )
}
