import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useGame, type Screen, type TransitionKind } from '../state/game'
import { ar } from '../lib/env'
import { CityScene, CITY_FLOATERS, CityFloaterArt } from '../art/scenes'
import { Floater } from '../components/Parallax'
import { Aleen } from '../art/Aleen'
import { Baktoro } from '../art/Baktoro'
import { Capsule, Heart, MiniShield, Sparkle, Star } from '../art/objects'
import { SoundToggle } from '../components/Hud'
import { Bursts, centerOf, Speech, useBursts } from '../components/fx'
import { ACTIVITY_IDS } from '../data/activities'
import './landing.css'

/* Aleen's rotating greetings: she feels alive, and each line points to something to do. */
const HELLOS = ['أنا ألين! هيا نحمي مدينتنا معًا ✨', 'اختر بوابة… المغامرة تنتظرك! 🚀', 'في ساحة الألعاب ملصقات جميلة 🎪', 'شاهد فيلمي القصير مع كبسول 🎬']
const TAUNTS = ['هِهِه! أنا باكتورو 😈', 'لن تهزموني أبدًا! 😜', 'أين المضاد الحيوي؟ 🙈']
const BALLOONS = [
  { c: '#ff6b8b', x: '18%', d: 19, dl: -3, s: 1 },
  { c: '#ffd23f', x: '57%', d: 23, dl: -11, s: 0.85 },
  { c: '#4cbcff', x: '82%', d: 21, dl: -6, s: 0.95 },
  { c: '#a46bff', x: '35%', d: 26, dl: -17, s: 0.75 },
]

type Portal = {
  key: string
  title: string
  emoji: string
  status: string
  aria: string
  color: string
  to: Screen
  kind: TransitionKind
  main?: boolean
}

export function Landing() {
  const { go, env, sfx, completed, activities } = useGame()
  const [launching, setLaunching] = useState<string | null>(null)
  const [hello, setHello] = useState(0)
  const [taunt, setTaunt] = useState(0)
  const { bursts, burst, done } = useBursts()
  const missions = Object.keys(completed).length
  const started = missions > 0
  const stickers = ACTIVITY_IDS.filter((id) => (activities[id] ?? 0) > 0).length
  const floaters = env.lowPower || env.reducedMotion ? CITY_FLOATERS.slice(0, 6) : CITY_FLOATERS
  const aleenH = env.portrait ? Math.min(460, window.innerHeight * 0.36, window.innerWidth * 0.72) : Math.min(520, window.innerHeight * 0.64)
  const calm = env.reducedMotion

  useEffect(() => {
    const a = window.setInterval(() => setHello((h) => (h + 1) % HELLOS.length), 4200)
    const b = window.setInterval(() => setTaunt((t) => (t + 1) % TAUNTS.length), 5200)
    return () => {
      window.clearInterval(a)
      window.clearInterval(b)
    }
  }, [])

  const portals: Portal[] = [
    {
      key: 'play',
      title: 'ساحة الألعاب',
      emoji: '🎪',
      status: `🏅 ${ar(stickers)}/${ar(ACTIVITY_IDS.length)}`,
      aria: `ساحة الألعاب: ٧ ألعاب، جمعت ${ar(stickers)} ملصقات`,
      color: 'green',
      to: { name: 'activities' },
      kind: 'bubbles',
    },
    {
      key: 'adventure',
      title: started ? 'تابع المغامرة' : 'ابدأ المغامرة',
      emoji: '🚀',
      status: `⭐ ${ar(missions)}/٥ مهمات`,
      aria: `${started ? 'تابع' : 'ابدأ'} المغامرة الكبرى: أنهيت ${ar(missions)} من ٥ مهمات`,
      color: 'orange',
      to: { name: 'map' },
      kind: 'portal',
      main: true,
    },
    {
      key: 'film',
      title: 'فيلم ألين',
      emoji: '🎬',
      status: '▶ ٣ دقائق',
      aria: 'فيلم ألين: فيلم متحرك قصير',
      color: 'pink',
      to: { name: 'film' },
      kind: 'portal',
    },
  ]

  const enter = (p: Portal, e: React.MouseEvent<HTMLButtonElement>) => {
    if (launching) return
    const c = centerOf(e.currentTarget)
    setLaunching(p.key)
    sfx(p.main ? 'celebrate' : 'pop')
    burst(c, 'stars', p.main ? 16 : 10)
    const color = p.color === 'green' ? '#3cc46a' : p.color === 'pink' ? '#ff5fa8' : '#2f5bea'
    window.setTimeout(() => go(p.to, { color, origin: c, kind: p.kind }), calm ? 80 : 420)
  }

  return (
    <main className={`landing ${calm ? 'calm' : ''}`}>
      <CityScene />
      {!calm && (
        <div className="balloons" aria-hidden>
          {BALLOONS.map((b, i) => (
            <span key={i} className="balloon" style={{ ['--c' as string]: b.c, left: b.x, ['--d' as string]: `${b.d}s`, ['--dl' as string]: `${b.dl}s`, ['--s' as string]: b.s }}>
              <i />
            </span>
          ))}
        </div>
      )}
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
            initial={{ opacity: 0, y: -14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', duration: 0.6, bounce: 0.45 }}
          >
            <span className="kicker-wave" aria-hidden>
              👋
            </span>{' '}
            مرحبًا بك في مدينة الصحة
          </motion.p>

          <h1 id="title" className="landing-title">
            {['مغامرة', 'المضاد', 'الذكي'].map((w, i) => (
              <motion.span
                key={w}
                className={`title-word tw-${i}`}
                initial={{ opacity: 0, y: -90, rotate: i % 2 ? 8 : -8, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.16, type: 'spring', duration: 0.9, bounce: 0.55 }}
              >
                <span className="title-3d" style={{ ['--i' as string]: i }}>
                  {w}
                </span>
              </motion.span>
            ))}
            <Sparkle size={34} className="title-spark s1 twinkle" color="#ffd23f" />
            <Sparkle size={24} className="title-spark s2 twinkle" color="#ffffff" />
            <Sparkle size={20} className="title-spark s3 twinkle" color="#ff8fc7" />
          </h1>

          <motion.p
            className="landing-sub"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', duration: 0.6, bounce: 0.35 }}
          >
            هل تستطيع حماية مدينة الصحة من البكتيريا المقاومة؟
          </motion.p>

          <nav className="portals" aria-label="اختر بوابتك">
            {portals.map((p, i) => (
              <motion.div
                key={p.key}
                className={`portal-slot ${p.main ? 'main' : ''}`}
                initial={{ opacity: 0, y: 40, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1 + (p.main ? 0 : 0.14 + i * 0.06), type: 'spring', duration: 0.8, bounce: 0.55 }}
              >
                <button
                  type="button"
                  className={`portal portal-${p.color} ${launching === p.key ? 'launching' : ''}`}
                  style={{ ['--bob' as string]: `${-i * 0.7}s` }}
                  onClick={(e) => enter(p, e)}
                  disabled={!!launching}
                  aria-label={p.aria}
                >
                  <span className="portal-float">
                  <span className="portal-halo" aria-hidden />
                  <span className="portal-orb" aria-hidden>
                    <span className="portal-glow" />
                    <span className="portal-emoji">{p.emoji}</span>
                    <span className="portal-shine" />
                  </span>
                  <span className="portal-label" aria-hidden>
                    <b>{p.title}</b>
                    <small>{p.status}</small>
                  </span>
                  </span>
                </button>
              </motion.div>
            ))}
          </nav>
        </section>

        <div className="landing-hero">
          <div className="hero-stage" aria-hidden>
            <svg className="rainbow" viewBox="0 0 400 210">
              {['#ff6b8b', '#ff9f2e', '#ffd23f', '#3cc46a', '#4cbcff', '#a46bff'].map((c, i) => (
                <path key={c} d={`M${20 + i * 14} 200 A${180 - i * 14} ${180 - i * 14} 0 0 1 ${380 - i * 14} 200`} stroke={c} strokeWidth="13" fill="none" strokeLinecap="round" style={{ ['--k' as string]: i }} />
              ))}
            </svg>
            <span className="stage-disc" />
            <span className="stage-sparkles">
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <Sparkle key={k} size={14 + (k % 3) * 6} color={['#fff', '#ffd23f', '#ff8fc7'][k % 3]} className="twinkle" style={{ ['--delay' as string]: `${k * 0.4}s` }} />
              ))}
            </span>
            {!calm && (
              <div className="hero-orbit">
                {[<Capsule key="c" size={46} />, <Star key="s" size={40} />, <Heart key="h" size={38} />, <MiniShield key="m" size={44} gold />, <Capsule key="c2" size={36} a="#1fc8c0" />].map((el, k) => (
                  <span key={k} className="orbit-item" style={{ ['--o' as string]: `${(k / 5) * -16}s` }}>
                    {el}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="hero-bubble">
            <Speech who="ألين" tail="bottom" id={hello}>
              {HELLOS[hello]}
            </Speech>
          </div>
          <Aleen height={aleenH} mood={launching ? 'happy' : 'idle'} reduced={calm} />
          <motion.div
            className="hero-baktoro"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, type: 'spring', duration: 0.8, bounce: 0.5 }}
          >
            <Baktoro mood="smug" size={env.portrait ? 90 : 124} say={TAUNTS[taunt]} reduced={calm} />
          </motion.div>
        </div>
      </div>
      <Bursts bursts={bursts} onDone={done} />
    </main>
  )
}
