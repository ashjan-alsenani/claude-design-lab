import { useEffect, useLayoutEffect, useRef, useState, useId } from 'react'
import { motion } from 'motion/react'
import { useGame, unlockedUpTo, TOTAL_MISSIONS } from '../state/game'
import { MISSIONS } from '../data/missions'
import { Hud } from '../components/Hud'
import { Floater } from '../components/Parallax'
import { Speech, TiltCard, centerOf } from '../components/fx'
import { Baktoro } from '../art/Baktoro'
import { CheckBadge, Cloud, Lock, Star, Sparkle, Capsule, Germ, Heart } from '../art/objects'
import { Bubbles } from '../art/scenes'
import noorSrc from '../assets/noor.webp'
import { ar } from '../lib/env'
import './map.css'

type Pt = { x: number; y: number }
const WIDE: Pt[] = [
  { x: 87, y: 68 },
  { x: 67, y: 34 },
  { x: 49, y: 66 },
  { x: 31, y: 32 },
  { x: 12, y: 58 },
]
const TALL: Pt[] = [
  { x: 68, y: 89 },
  { x: 30, y: 71 },
  { x: 68, y: 52 },
  { x: 31, y: 33 },
  { x: 62, y: 13 },
]

/** Smooth path through points (Catmull-Rom → cubic Bézier). */
function pathThrough(pts: Pt[]) {
  let d = `M${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`
  }
  return d
}
function segment(pts: Pt[], i: number) {
  const p0 = pts[i - 1] ?? pts[i]
  const p1 = pts[i]
  const p2 = pts[i + 1]
  const p3 = pts[i + 2] ?? p2
  return `M${p1.x} ${p1.y} C${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`
}

/** Cumulative path fraction (0..1) at each node, from sampled Bézier lengths. */
function nodeFractions(pts: Pt[]) {
  const lens = pts.slice(0, -1).map((_, i) => {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    let len = 0
    let prev = p1
    for (let k = 1; k <= 40; k++) {
      const t = k / 40
      const u = 1 - t
      const q = {
        x: u * u * u * p1.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p2.x,
        y: u * u * u * p1.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p2.y,
      }
      len += Math.hypot(q.x - prev.x, q.y - prev.y)
      prev = q
    }
    return len
  })
  const total = lens.reduce((a, b) => a + b, 0)
  let acc = 0
  return [0, ...lens.map((l) => (acc += l) / total)]
}

export function MissionMap() {
  const { completed, go, env, mapNode, setMapNode, sfx } = useGame()
  const tall = env.portrait
  const W = tall ? 900 : 1600
  const H = tall ? 1600 : 900
  const pts = (tall ? TALL : WIDE).map((p) => ({ x: (p.x / 100) * W, y: (p.y / 100) * H }))
  const pctPts = tall ? TALL : WIDE
  const unlocked = unlockedUpTo(completed)
  const allDone = Object.keys(completed).length >= TOTAL_MISSIONS
  const target = allDone ? TOTAL_MISSIONS : unlocked
  const [noorAt, setNoorAt] = useState(Math.min(mapNode, target))
  const [say, setSay] = useState<string>(
    allDone ? 'أنهيت كل المهمات! 🎉 هيا نحتفل في القلعة!' : unlocked === 1 ? 'اضغط على المهمة المضيئة لنبدأ!' : 'رائع! فُتحت مهمة جديدة ✨',
  )
  const [shake, setShake] = useState<number | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const pathD = pathThrough(pts)
  const fractions = nodeFractions(pts)
  const [boxW, setBoxW] = useState(W)
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setBoxW(el.clientWidth))
    ro.observe(el)
    setBoxW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  const gid = useId()

  // Walk Noor from where she stood to the newly unlocked mission.
  useEffect(() => {
    if (noorAt === target) return
    const t = window.setTimeout(() => {
      setNoorAt(target)
      setMapNode(target)
      sfx('pop')
    }, 650)
    return () => window.clearTimeout(t)
  }, [noorAt, target, setMapNode, sfx])

  // On tall layouts scroll the current mission into view.
  useEffect(() => {
    if (!tall) return
    const el = boxRef.current?.querySelector(`[data-node="${target}"]`)
    el?.scrollIntoView({ block: 'center', behavior: env.reducedMotion ? 'auto' : 'smooth' })
  }, [tall, target, env.reducedMotion])

  const open = (id: number, e: React.MouseEvent) => {
    if (id > unlocked && !(allDone && id <= TOTAL_MISSIONS)) {
      sfx('wrong')
      setShake(id)
      setSay('هذه المهمة مقفلة 🔒 أكمل المهمة المضيئة أولًا!')
      window.setTimeout(() => setShake(null), 500)
      return
    }
    sfx('click')
    const m = MISSIONS[id - 1]
    go({ name: 'mission', id }, { color: m.color, origin: centerOf(e.currentTarget), kind: 'bubbles' })
  }

  return (
    <main className="map-screen">
      <MapBackdrop />
      <Hud label="خريطة مدينة الصحة" />
      <div className="map-intro">
        <Speech who="نور" tail="none" id={say}>
          {say}
        </Speech>
        {allDone && (
          <motion.button
            type="button"
            className="btn3d big pulse ready"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.5, delay: 0.3 }}
            onClick={(e) => go({ name: 'final' }, { color: '#ffc83d', origin: centerOf(e.currentTarget), kind: 'portal' })}
          >
            الاحتفال الكبير 🎉
          </motion.button>
        )}
      </div>

      <div className={`map-scroll ${tall ? 'tall' : 'wide'}`}>
        <div className="map-box" ref={boxRef} style={{ aspectRatio: `${W} / ${H}` }}>
          {MISSIONS.map((m, i) => (
            <div
              key={m.id}
              className={`zone ${m.id <= unlocked || allDone ? 'lit' : ''}`}
              style={{ left: `${pctPts[i].x}%`, top: `${pctPts[i].y}%`, ['--mc' as string]: m.color, ['--mc2' as string]: m.colorB }}
              aria-hidden
            >
              <ZoneDecor id={m.id} />
            </div>
          ))}
          <svg className="map-paths" viewBox={`0 0 ${W} ${H}`} aria-hidden>
            <defs>
              <linearGradient id={`${gid}gold`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ffe27a" />
                <stop offset="1" stopColor="#ffb000" />
              </linearGradient>
            </defs>
            {/* meadow ribbon the road winds through */}
            <path d={pathD} className="land-edge" />
            <path d={pathD} className="land" />
            {/* road */}
            <path d={pathD} className="road-base" />
            <path d={pathD} className="road-top" />
            <path d={pathD} className="road-dots" />
            {/* completed segments glow gold */}
            {pts.slice(0, -1).map((_, i) =>
              completed[i + 1] ? (
                <motion.path
                  key={i}
                  d={segment(pts, i)}
                  className="road-done"
                  stroke={`url(#${gid}gold)`}
                  initial={{ pathLength: i + 1 === unlocked - 1 ? 0 : 1 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
                />
              ) : null,
            )}
          </svg>

          {MISSIONS.map((m, i) => {
            const id = m.id
            const done = !!completed[id]
            const isLocked = id > unlocked && !allDone
            const current = id === target && !done
            const state = done ? 'done' : isLocked ? 'locked' : current ? 'current' : 'open'
            const p = pctPts[i]
            return (
              <div
                key={id}
                data-node={id}
                className={`map-node state-${state} ${shake === id ? 'shake' : ''}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, ['--mc' as string]: m.color, ['--mc2' as string]: m.colorB, ['--fd' as string]: `${-i * 0.7}s` }}
              >
                <TiltCard max={12} disabled={isLocked}>
                  <button
                    type="button"
                    className="node-btn"
                    onClick={(e) => open(id, e)}
                    aria-label={`المهمة ${ar(id)}: ${m.place} — ${m.title}${done ? ' (مكتملة)' : isLocked ? ' (مقفلة)' : ''}`}
                  >
                    <span className="island" aria-hidden>
                      <span className="island-top" />
                      <span className="island-side" />
                    </span>
                    <span className="landmark" aria-hidden>
                      <Landmark id={id} />
                    </span>
                    {current && <span className="pulse-ring" aria-hidden />}
                    <span className="node-label">
                      <span className="node-num">{ar(id)}</span>
                      <span className="node-place">
                        {m.place} <span aria-hidden>{m.emoji}</span>
                      </span>
                    </span>
                  </button>
                </TiltCard>
                {isLocked && (
                  <span className="node-lock bob" aria-hidden>
                    <Lock size={40} />
                  </span>
                )}
                {current && (
                  <span className="node-arrow" aria-hidden>
                    ▼
                  </span>
                )}
                {done && (
                  <span className="node-done" aria-hidden>
                    <span className="node-stars">
                      {[1, 2, 3].map((s) => (
                        <Star key={s} size={26} className={s <= completed[id] ? 'earned' : 'empty'} />
                      ))}
                    </span>
                    <CheckBadge size={38} className="node-check" />
                    <Sparkle size={18} className="twinkle node-sp" color="#ffd23f" />
                  </span>
                )}
              </div>
            )
          })}

          {/* Noor walks along the actual road (CSS offset-path in map units) */}
          <div className="token-track" style={{ width: W, height: H, transform: `scale(${boxW / W})` }} aria-hidden>
            <motion.div
              className="noor-token"
              style={{ offsetPath: `path('${pathD}')` }}
              initial={false}
              animate={{ offsetDistance: `${fractions[noorAt - 1] * 100}%` }}
              transition={env.reducedMotion ? { duration: 0 } : { duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
            >
              <motion.img
                src={noorSrc}
                alt=""
                key={noorAt}
                animate={env.reducedMotion ? undefined : { y: [0, -14, 0, -14, 0, -14, 0, -8, 0] }}
                transition={{ duration: 1.4 }}
              />
              <span className="token-shadow" />
            </motion.div>
          </div>

          {!allDone && (
            <div className="map-baktoro" style={{ left: `${pctPts[4].x + (tall ? 12 : -3)}%`, top: `${pctPts[4].y + (tall ? 7 : -32)}%` }}>
              <Baktoro mood={unlocked >= 4 ? 'shocked' : 'smug'} size={tall ? 84 : 104} say={unlocked >= 4 ? 'أوه! إنها تقترب!' : 'لن تصلوا إلى القلعة!'} reduced={env.reducedMotion} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function MapBackdrop() {
  const { env } = useGame()
  return (
    <div className="map-backdrop" aria-hidden>
      <div className="map-sky" />
      <div className="map-clouds">
        {[8, 22, 40].map((t, i) => (
          <div key={t} className="cloud drift-x" style={{ top: `${t}%`, ['--dur' as string]: `${80 + i * 25}s`, ['--delay' as string]: `-${i * 30}s` }}>
            <Cloud width={180 - i * 30} opacity={0.85} />
          </div>
        ))}
      </div>
      {!env.lowPower && (
        <>
          <Floater x="6%" y="20%" depth={1.6} dur={6}>
            <Capsule size={54} />
          </Floater>
          <Floater x="88%" y="14%" depth={2} dur={5} delay={1}>
            <Germ size={58} hue="orange" />
          </Floater>
          <Floater x="52%" y="86%" depth={1.2} dur={5.5} delay={2}>
            <Heart size={40} />
          </Floater>
          <Floater x="94%" y="80%" depth={2.4} dur={4.6} delay={0.6}>
            <Star size={44} />
          </Floater>
        </>
      )}
      <Bubbles n={8} />
    </div>
  )
}

/** Themed props floating around each world zone. */
function ZoneDecor({ id }: { id: number }) {
  switch (id) {
    case 1:
      return (
        <>
          <span className="zd" style={{ left: '8%', top: '18%' }}>
            <Cloud width={90} />
          </span>
          <span className="zd float-y" style={{ left: '74%', top: '10%', ['--dur' as string]: '5s' }}>
            <Capsule size={36} />
          </span>
          <Sparkle size={18} className="zd twinkle" style={{ left: '80%', top: '62%' }} color="#ffd23f" />
        </>
      )
    case 2:
      return (
        <>
          <svg viewBox="-50 -50 100 100" className="zd zd-gear spin-slow" style={{ left: '10%', top: '16%', width: 54, ['--dur' as string]: '10s' }}>
            {Array.from({ length: 8 }, (_, k) => (
              <rect key={k} x="-7" y="-48" width="14" height="18" rx="4" fill="#1fc8c0" transform={`rotate(${k * 45})`} />
            ))}
            <circle r="36" fill="#1fc8c0" />
            <circle r="14" fill="#e4fff1" />
          </svg>
          <svg viewBox="-50 -50 100 100" className="zd zd-gear spin-slow rev" style={{ left: '76%', top: '58%', width: 38, ['--dur' as string]: '7s' }}>
            {Array.from({ length: 8 }, (_, k) => (
              <rect key={k} x="-7" y="-48" width="14" height="18" rx="4" fill="#7be3b0" transform={`rotate(${k * 45})`} />
            ))}
            <circle r="36" fill="#7be3b0" />
            <circle r="14" fill="#fff" />
          </svg>
        </>
      )
    case 3:
      return (
        <>
          <span className="zd float-y" style={{ left: '12%', top: '20%', ['--dur' as string]: '4.4s' }}>
            <Heart size={30} />
          </span>
          <span className="zd float-y" style={{ left: '78%', top: '14%', ['--dur' as string]: '5.2s', ['--delay' as string]: '-2s' }}>
            <Heart size={22} />
          </span>
          <Sparkle size={16} className="zd twinkle" style={{ left: '20%', top: '66%' }} color="#ff8fc7" />
        </>
      )
    case 4:
      return (
        <>
          <span className="zd float-y" style={{ left: '8%', top: '22%', ['--dur' as string]: '4s' }}>
            <Germ size={40} hue="blue" />
          </span>
          <span className="zd float-y" style={{ left: '80%', top: '60%', ['--dur' as string]: '5s', ['--delay' as string]: '-1s' }}>
            <Germ size={30} hue="purple" mood="sleepy" />
          </span>
          <Sparkle size={16} className="zd twinkle" style={{ left: '76%', top: '12%' }} color="#c9b6ff" />
        </>
      )
    default:
      return (
        <>
          <span className="zd float-y" style={{ left: '10%', top: '14%', ['--dur' as string]: '4.6s' }}>
            <Star size={34} />
          </span>
          <span className="zd float-y" style={{ left: '80%', top: '22%', ['--dur' as string]: '5.4s', ['--delay' as string]: '-2s' }}>
            <Star size={26} />
          </span>
          <Sparkle size={20} className="zd twinkle" style={{ left: '22%', top: '68%' }} color="#ffd23f" />
          <Sparkle size={14} className="zd twinkle" style={{ left: '74%', top: '70%', ['--delay' as string]: '1s' }} color="#fff" />
        </>
      )
  }
}

/** Small illustrated landmark per mission world. */
function Landmark({ id }: { id: number }) {
  const g = useId()
  switch (id) {
    case 1:
      return (
        <svg viewBox="0 0 120 110" className="lm">
          <rect x="16" y="34" width="88" height="70" rx="12" fill="#fff" />
          <rect x="16" y="34" width="88" height="16" rx="8" fill="#4cbcff" />
          <rect x="44" y="4" width="32" height="32" rx="9" fill="#fff" stroke="#ff6b8b" strokeWidth="4" />
          <path d="M60 11v18M51 20h18" stroke="#ff6b8b" strokeWidth="7" strokeLinecap="round" />
          <rect x="26" y="58" width="16" height="16" rx="4" fill="#bde9ff" />
          <rect x="78" y="58" width="16" height="16" rx="4" fill="#bde9ff" />
          <rect x="50" y="72" width="20" height="32" rx="8" fill="#ffd23f" />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 120 130" className="lm">
          <path d="M28 40 60 6l32 34Z" fill="#1fc8c0" />
          <rect x="34" y="40" width="52" height="86" rx="10" fill="#7be3b0" />
          <circle cx="60" cy="66" r="20" fill="#fff" stroke="#0d8e8a" strokeWidth="4" />
          <g transform="translate(60 66)">
            <g className="spin-slow lm-hand" style={{ ['--dur' as string]: '6s' }}>
              <circle r="16" fill="none" />
              <rect x="-1.5" y="-15" width="3" height="16" rx="1.5" fill="#17206b" />
            </g>
          </g>
          <rect x="57" y="56" width="6" height="12" rx="3" fill="#ff6b8b" />
          <rect x="50" y="98" width="20" height="28" rx="8" fill="#0d8e8a" />
        </svg>
      )
    case 3:
      return (
        <svg viewBox="0 0 120 110" className="lm">
          <rect x="54" y="56" width="12" height="44" rx="5" fill="#a5734a" />
          <g className="sway">
            <circle cx="60" cy="42" r="30" fill="#e86bb0" />
            <circle cx="44" cy="52" r="20" fill="#ff9fd2" />
            <circle cx="78" cy="34" r="18" fill="#ff9fd2" />
          </g>
          {[18, 34, 86, 102].map((x, i) => (
            <g key={x} transform={`translate(${x} 100)`}>
              <path d="M0 0v-14" stroke="#3fae5f" strokeWidth="3" />
              <circle cy="-18" r="7" fill={['#ffd23f', '#a46bff', '#5ec8ff', '#ff7a6b'][i]} />
              <circle cy="-18" r="3" fill="#fff" />
            </g>
          ))}
          <path d="M60 22c-4-6-12-4-12 2 0 6 12 12 12 12s12-6 12-12c0-6-8-8-12-2Z" fill="#ff5f8f" />
        </svg>
      )
    case 4:
      return (
        <svg viewBox="0 0 120 120" className="lm">
          <defs>
            <radialGradient id={`${g}d`} cx="40%" cy="30%" r="80%">
              <stop offset="0" stopColor="#e0d4ff" />
              <stop offset="1" stopColor="#7b4dff" />
            </radialGradient>
          </defs>
          <path d="M14 100a46 46 0 0 1 92 0Z" fill={`url(#${g}d)`} />
          <path d="M30 72a30 30 0 0 1 30-26" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
          <rect x="10" y="98" width="100" height="14" rx="7" fill="#3d6bff" />
          <rect x="54" y="20" width="12" height="30" rx="6" fill="#fff" />
          <circle cx="60" cy="16" r="8" fill="#5ec8ff" />
          <circle cx="44" cy="84" r="7" fill="#8ee05a" className="bob" />
          <circle cx="66" cy="78" r="6" fill="#ff8fc7" className="bob" style={{ animationDelay: '-0.5s' }} />
          <circle cx="80" cy="88" r="5" fill="#ffd23f" className="bob" style={{ animationDelay: '-1s' }} />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 140 130" className="lm">
          <rect x="30" y="50" width="80" height="70" rx="6" fill="#ffe08a" />
          {[30, 50, 70, 90].map((x) => (
            <rect key={x} x={x} y="40" width="14" height="16" rx="3" fill="#ffe08a" />
          ))}
          <rect x="12" y="30" width="30" height="90" rx="6" fill="#ffc83d" />
          <rect x="98" y="30" width="30" height="90" rx="6" fill="#ffc83d" />
          <path d="M8 32 27 2l19 30Z" fill="#ff6b8b" />
          <path d="M94 32l19-30 19 30Z" fill="#ff6b8b" />
          <path d="M58 120V96a12 12 0 0 1 24 0v24Z" fill="#c77800" />
          <path d="M70 58 84 64v8c0 8-6 13-14 16-8-3-14-8-14-16v-8Z" fill="#fff" stroke="#c77800" strokeWidth="3" />
        </svg>
      )
  }
}
