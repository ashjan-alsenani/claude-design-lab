import { useId, useRef } from 'react'
import { motion, AnimatePresence, type TargetAndTransition } from 'motion/react'
import rigBody from '../assets/aleen-rig/body.webp'
import rigHead from '../assets/aleen-rig/head.webp'
import rigHands from '../assets/aleen-rig/hands.webp'
import { approach, makeBlinker, mouthAt, useFrame, type Speech } from './timeline'
import { Sparkle, Star } from '../art/objects'

/* ------------------------------------------------------------------ */
/*  Aleen — the supplied image, brought to life through body language  */
/* ------------------------------------------------------------------ */

export type AleenMood = 'idle' | 'wave' | 'talk' | 'happy' | 'surprised' | 'sick' | 'think' | 'worried' | 'cheer' | 'nod' | 'point'

const EMOTE: Partial<Record<AleenMood, string>> = {
  wave: '👋',
  happy: '😊',
  surprised: '😮',
  sick: '🤒',
  think: '🤔',
  worried: '😟',
  cheer: '🎉',
  nod: '👍',
  point: '👉',
}

const BODY: Record<AleenMood, TargetAndTransition> = {
  idle: { rotate: [0, 1.5, 0, -1.5, 0], y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  talk: { rotate: [0, 1.2, -0.8, 1, 0], y: [0, -3, 0, -2, 0], transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } },
  wave: { rotate: [0, -4, 4, -4, 4, 0], y: [0, -8, 0], transition: { duration: 1.2, repeat: Infinity, repeatDelay: 0.3 } },
  happy: { y: [0, -34, 0, -16, 0], scaleY: [1, 1.03, 0.95, 1.01, 1], transition: { duration: 1, repeat: Infinity, repeatDelay: 0.5, ease: 'easeOut' } },
  surprised: { x: [0, 18, 14], y: [0, -26, 0], scale: [1, 1.06, 1.03], rotate: [0, 4, 2], transition: { duration: 0.5, ease: 'easeOut' } },
  sick: { rotate: [-3, -6, -3], y: [6, 10, 6], transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } },
  think: { rotate: [0, 3, 3, 0], y: [0, -3, 0], transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  worried: { x: [0, -3, 3, -3, 3, 0], rotate: [0, -1, 1, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.8 } },
  cheer: { y: [0, -44, 0], scaleY: [1, 1.04, 0.94], rotate: [0, -3, 3, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeOut' } },
  nod: { rotate: [0, 4, 0, 4, 0], y: [0, 4, 0, 4, 0], transition: { duration: 1, repeat: Infinity, repeatDelay: 0.6 } },
  point: { rotate: [0, -5, -5, 0], x: [0, -10, -10, 0], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } },
}

/* Rig geometry, in pixels of the full-resolution source (547 × 1394). */
const RIG_W = 547
const RIG_H = 1394
const EYE_L = '225.3,161.0 229.0,155.8 236.5,153.7 245.8,153.7 252.3,155.8 257.9,160.1 261.6,165.3 259.7,169.6 252.3,171.7 243.9,172.2 236.5,171.3 230.0,168.7 226.2,165.3'
const EYE_R = '303.3,169.9 305.2,162.1 309.9,157.0 317.3,154.4 326.6,154.4 334.0,157.0 339.6,162.1 341.5,167.3 336.8,171.6 327.5,174.2 318.2,174.6 309.9,173.3 305.2,172.5'
const IRIS_L = { cx: 236.4, cy: 162.9, r: 10.8 }
const IRIS_R = { cx: 311.3, cy: 164.5, r: 10.2 }
const LASH_L = 'M224 161 Q236 150 253 154.5 Q259 158 263 166'
const LASH_R = 'M302 170 Q307 155 324 152.5 Q337 154 343 168'
const MOUTH = { cx: 282, cy: 236.5 }
/** Gaze offsets (source px). Her drawn eyes look toward the viewer's left (the other characters). */
const GAZE_VIEWER = 6.5

export function AleenActor({
  mood = 'idle',
  talking = false,
  height = 420,
  reduced = false,
  speech = null,
  look = 'viewer',
}: {
  mood?: AleenMood
  talking?: boolean
  height?: number
  reduced?: boolean
  /** her own audio envelope while she speaks; null when silent */
  speech?: Speech
  /** where she looks: at the viewer, or at the other character */
  look?: 'viewer' | 'other'
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const width = Math.round((height * RIG_W) / RIG_H)
  const body = talking && (mood === 'idle' || mood === 'point' || mood === 'nod') ? BODY.talk : BODY[mood]
  const emote = EMOTE[mood]

  const headRef = useRef<HTMLDivElement>(null)
  const handsRef = useRef<HTMLImageElement>(null)
  const eyesRef = useRef<SVGGElement>(null)
  const irisRefs = [useRef<SVGGElement>(null), useRef<SVGGElement>(null)]
  const lidRefs = [useRef<SVGGElement>(null), useRef<SVGGElement>(null)]
  const mouthRef = useRef<SVGGElement>(null)
  const lowLipRef = useRef<SVGGElement>(null)
  const innerRef = useRef<SVGEllipseElement>(null)
  const teethRef = useRef<SVGRectElement>(null)
  const tongueRef = useRef<SVGEllipseElement>(null)
  const st = useRef({ mouth: 0, gx: look === 'viewer' ? GAZE_VIEWER : 0, gy: 0, rot: 0, lift: 0, last: 0, sacc: 0, sx: 0, sy: 0 })
  const blink = useRef(makeBlinker(height | 0))

  useFrame((t, wall) => {
    const s = st.current
    const dt = s.last ? Math.min(0.1, wall - s.last) : 0.016
    s.last = wall
    const speaking = !!speech && t >= speech.start && t <= speech.start + (speech.mouth.length - 1) * 0.04
    // ---- mouth: driven only by her own audio ----
    let target = mouthAt(speech, t)
    const round = mood === 'surprised' || mood === 'worried'
    // mouth closes the instant her audio ends
    s.mouth = speaking ? approach(s.mouth, target, dt, 28) : 0
    // ---- eyes: gaze + micro saccades + blinking ----
    if (wall > s.sacc) {
      s.sacc = wall + 1.2 + Math.random() * 1.8
      s.sx = (Math.random() - 0.5) * 2
      s.sy = (Math.random() - 0.5) * 1.2
    }
    const gTarget = (look === 'viewer' ? GAZE_VIEWER : 0) + (reduced ? 0 : s.sx)
    s.gx = approach(s.gx, gTarget, dt, 14)
    s.gy = approach(s.gy, reduced ? 0 : s.sy + (mood === 'sick' || mood === 'worried' ? 1.5 : 0), dt, 14)
    const b = blink.current(wall)
    // ---- head: turns toward whoever she attends to, nods with her syllables ----
    const base = look === 'other' ? -1.6 : 0.5
    const nod = speaking ? (s.mouth - 0.35) * 2.2 : 0
    const sway = reduced ? 0 : Math.sin(wall * 1.3) * 0.5
    s.rot = approach(s.rot, base + nod + sway, dt, 8)
    // ---- hands: small emphasis gestures while she talks ----
    let lift = 0
    if (speaking && !reduced) {
      const ph = ((t - speech!.start) % 2.4) / 2.4
      lift = ph < 0.45 ? Math.sin((ph / 0.45) * Math.PI) * 10 : 0
    }
    if ((mood === 'cheer' || mood === 'happy') && !reduced) lift = Math.max(lift, (Math.sin(wall * 7) * 0.5 + 0.5) * 9)
    s.lift = approach(s.lift, lift, dt, 12)

    if (headRef.current) headRef.current.style.transform = `rotate(${s.rot.toFixed(2)}deg)`
    if (handsRef.current) handsRef.current.style.transform = `scaleY(${((140 - s.lift) / 140).toFixed(4)})`
    // eye overlay only when it differs from the original drawing
    const showEyes = Math.abs(s.gx) > 0.25 || Math.abs(s.gy) > 0.25 || b > 0.02
    if (eyesRef.current) eyesRef.current.style.display = showEyes ? '' : 'none'
    if (showEyes) {
      irisRefs.forEach((r) => r.current?.setAttribute('transform', `translate(${s.gx.toFixed(2)} ${s.gy.toFixed(2)})`))
      lidRefs.forEach((r) => r.current?.setAttribute('transform', `translate(0 ${(b * 26).toFixed(2)})`))
    }
    // mouth overlay
    const o = s.mouth
    if (mouthRef.current) mouthRef.current.style.display = o > 0.07 ? '' : 'none'
    if (o > 0.07) {
      // interior opens just below her lip line; her own lower lip drops to reveal it
      const drop = (round ? 9 : 7.5) * o
      const rxIn = round ? 9 + 5 * o : 15 + 6 * o
      const ryIn = 0.8 + drop * 0.62
      const cyIn = 235.6 + ryIn * 0.55
      innerRef.current?.setAttribute('rx', rxIn.toFixed(2))
      innerRef.current?.setAttribute('ry', ryIn.toFixed(2))
      innerRef.current?.setAttribute('cy', cyIn.toFixed(2))
      lowLipRef.current?.setAttribute('transform', `translate(0 ${drop.toFixed(2)})`)
      if (teethRef.current) {
        teethRef.current.setAttribute('x', (MOUTH.cx - rxIn * 0.6).toFixed(2))
        teethRef.current.setAttribute('width', (rxIn * 1.2).toFixed(2))
        teethRef.current.setAttribute('y', (cyIn - ryIn + 0.2).toFixed(2))
        teethRef.current.setAttribute('height', (o > 0.3 ? Math.min(2.6, ryIn * 0.4) : 0).toFixed(2))
      }
      tongueRef.current?.setAttribute('cy', (cyIn + ryIn * 0.6).toFixed(2))
      tongueRef.current?.setAttribute('rx', (rxIn * 0.5).toFixed(2))
      tongueRef.current?.setAttribute('ry', (ryIn * 0.4).toFixed(2))
    }
  })

  return (
    <div className="actor aleen-actor" style={{ width, height }}>
      <div className="actor-shadow" />
      <motion.div key={mood} className="aleen-body" animate={reduced ? undefined : body} style={{ transformOrigin: '50% 100%' }}>
        <div className="rig">
          <img className="rig-layer" src={rigBody} alt="" draggable={false} />
          <img ref={handsRef} className="rig-layer rig-hands" src={rigHands} alt="" draggable={false} />
          <div ref={headRef} className="rig-head">
            <img className="rig-layer" src={rigHead} alt="" draggable={false} />
            <svg className="rig-face" viewBox={`0 0 ${RIG_W} ${RIG_H}`} aria-hidden>
              <defs>
                <clipPath id={`${uid}eL`}>
                  <polygon points={EYE_L} />
                </clipPath>
                <clipPath id={`${uid}eR`}>
                  <polygon points={EYE_R} />
                </clipPath>
                <clipPath id={`${uid}iL`}>
                  <circle cx={IRIS_L.cx} cy={IRIS_L.cy} r={IRIS_L.r} />
                </clipPath>
                <clipPath id={`${uid}iR`}>
                  <circle cx={IRIS_R.cx} cy={IRIS_R.cy} r={IRIS_R.r} />
                </clipPath>
                <linearGradient id={`${uid}sc`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#9c8584" />
                  <stop offset="0.4" stopColor="#c7b8b7" />
                  <stop offset="1" stopColor="#d1c3c2" />
                </linearGradient>
                <filter id={`${uid}feather`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="0.7" />
                </filter>
                <mask id={`${uid}mL`} maskUnits="userSpaceOnUse" x="0" y="0" width={RIG_W} height={RIG_H}>
                  <polygon points={EYE_L} fill="#fff" filter={`url(#${uid}feather)`} />
                </mask>
                <mask id={`${uid}mR`} maskUnits="userSpaceOnUse" x="0" y="0" width={RIG_W} height={RIG_H}>
                  <polygon points={EYE_R} fill="#fff" filter={`url(#${uid}feather)`} />
                </mask>
                {/* her real lower lip, softly cut out so it can drop open */}
                <mask id={`${uid}lowLip`} maskUnits="userSpaceOnUse" x="0" y="0" width={RIG_W} height={RIG_H}>
                  <ellipse cx={MOUTH.cx} cy={241.8} rx={28} ry={7.2} fill="#fff" filter={`url(#${uid}feather)`} />
                  <rect x={MOUTH.cx - 34} y={226} width={68} height={10.2} fill="#000" />
                </mask>
                <linearGradient id={`${uid}lid`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d4855f" />
                  <stop offset="1" stopColor="#df9473" />
                </linearGradient>
                <linearGradient id={`${uid}lip`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#e2604f" />
                  <stop offset="0.55" stopColor="#ee6a5f" />
                  <stop offset="1" stopColor="#f07a6c" />
                </linearGradient>
                <filter id={`${uid}soft`} x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="0.45" />
                </filter>
              </defs>
              <g ref={eyesRef} style={{ display: 'none' }}>
                {(
                  [
                    [EYE_L, IRIS_L, 'L', LASH_L],
                    [EYE_R, IRIS_R, 'R', LASH_R],
                  ] as const
                ).map(([, iris, k, lash], i) => (
                  <g key={k}>
                    <g mask={`url(#${uid}m${k})`}>
                      <rect x={iris.cx - 40} y={140} width={80} height={45} fill={`url(#${uid}sc)`} />
                      <g ref={irisRefs[i]}>
                        <image href={rigHead} x={0} y={0} width={RIG_W} height={RIG_H} clipPath={`url(#${uid}i${k})`} />
                      </g>
                      <g ref={lidRefs[i]}>
                        <rect x={iris.cx - 40} y={124} width={80} height={28} fill={`url(#${uid}lid)`} />
                        <rect x={iris.cx - 40} y={150} width={80} height={2.6} rx={1.3} fill="#3a1b12" />
                      </g>
                    </g>
                    <path d={lash} fill="none" stroke="#2c140d" strokeWidth={2.1} strokeLinecap="round" opacity={0.85} filter={`url(#${uid}soft)`} />
                  </g>
                ))}
              </g>
              <g ref={mouthRef} style={{ display: 'none' }} data-mouth="aleen">
                <g filter={`url(#${uid}soft)`}>
                  <ellipse ref={innerRef} cx={MOUTH.cx} cy={MOUTH.cy} rx={16} ry={1} fill="#5c1520" />
                  <ellipse ref={tongueRef} cx={MOUTH.cx} cy={MOUTH.cy + 3} rx={6} ry={1} fill="#d9606c" />
                  <rect ref={teethRef} x={MOUTH.cx - 7} y={MOUTH.cy} width={14} height={0} rx={1.2} fill="#fbf3ec" />
                </g>
                <g ref={lowLipRef}>
                  <image href={rigHead} x={0} y={0} width={RIG_W} height={RIG_H} mask={`url(#${uid}lowLip)`} />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* emotion bubble */}
      <AnimatePresence mode="wait">
        {emote && (
          <motion.span
            key={mood}
            className="emote"
            initial={{ scale: 0.4, opacity: 0, y: 20, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', bounce: 0.6, duration: 0.5 }}
          >
            {emote}
          </motion.span>
        )}
      </AnimatePresence>

      {mood === 'sick' && (
        <>
          <span className="prop thermo">🌡️</span>
          <span className="prop sweat s1">💧</span>
          <span className="prop sweat s2">💧</span>
          <span className="prop dizzy">💫</span>
        </>
      )}
      {mood === 'worried' && <span className="prop sweat s1">💦</span>}
      {(mood === 'happy' || mood === 'cheer') &&
        [0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="prop orbit-star"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.1, 0.6], x: [0, (i % 2 ? 1 : -1) * (60 + i * 18)], y: [0, -80 - i * 20] }}
            transition={{ duration: 1.3, delay: i * 0.18, repeat: Infinity, repeatDelay: 0.4 }}
          >
            <Star size={28} />
          </motion.span>
        ))}
      {mood === 'think' && (
        <span className="think-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      )}
      <Sparkle size={16} className="prop twinkle sp-a" color="#ffd23f" />
      <Sparkle size={12} className="prop twinkle sp-b" color="#fff" />
    </div>
  )
}

/** Mouth driven by the character's own voice envelope; closed shape otherwise. */
function useMouth(speech: Speech) {
  const closed = useRef<SVGPathElement>(null)
  const open = useRef<SVGGElement>(null)
  const inner = useRef<SVGEllipseElement>(null)
  const tongue = useRef<SVGEllipseElement>(null)
  const st = useRef({ o: 0, last: 0 })
  useFrame((t, wall) => {
    const s = st.current
    const dt = s.last ? Math.min(0.1, wall - s.last) : 0.016
    s.last = wall
    const live = !!speech && t >= speech.start && t <= speech.start + (speech.mouth.length - 1) * 0.04
    s.o = live ? approach(s.o, mouthAt(speech, t), dt, 28) : 0
    const isOpen = s.o > 0.07
    if (closed.current) closed.current.style.display = isOpen ? 'none' : ''
    if (open.current) open.current.style.display = isOpen ? '' : 'none'
    if (isOpen) {
      inner.current?.setAttribute('rx', (6 + 5 * s.o).toFixed(2))
      inner.current?.setAttribute('ry', (1.5 + 8 * s.o).toFixed(2))
      tongue.current?.setAttribute('cy', (1 + 5 * s.o).toFixed(2))
      tongue.current?.setAttribute('rx', (3 + 3 * s.o).toFixed(2))
      tongue.current?.setAttribute('ry', (0.6 + 2.6 * s.o).toFixed(2))
    }
  })
  return { closed, open, inner, tongue }
}

/* ------------------------------------------------------------------ */
/*  Dr. Huda — friendly doctor (fully drawn, so her mouth can talk)    */
/* ------------------------------------------------------------------ */

export function Doctor({
  talking = false,
  height = 400,
  happy = false,
  speech = null,
  lookAt = 'aleen',
}: {
  talking?: boolean
  height?: number
  happy?: boolean
  speech?: Speech
  lookAt?: 'aleen' | 'viewer'
}) {
  const id = useId()
  const { closed: mouthClosed, open: mouthOpen, inner: mouthInner, tongue: mouthTongue } = useMouth(speech)
  const pupils = useRef<SVGGElement>(null)
  useFrame(() => {
    // Dr. Huda faces the viewer; when addressing Aleen her eyes turn to Aleen (stage right)
    pupils.current?.setAttribute('transform', `translate(${lookAt === 'aleen' ? 3.2 : 0} ${lookAt === 'aleen' ? 0.6 : 0})`)
  })
  return (
    <motion.div
      className="actor doctor"
      style={{ width: height * 0.6, height }}
      animate={talking ? { y: [0, -4, 0], rotate: [0, 1, -1, 0] } : { y: [0, -3, 0] }}
      transition={{ duration: talking ? 0.9 : 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="actor-shadow" />
      <svg viewBox="0 0 240 400" width="100%" height="100%" aria-hidden>
        <defs>
          <linearGradient id={`${id}coat`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#dfe8ff" />
          </linearGradient>
          <radialGradient id={`${id}skin`} cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#ffe4cc" />
            <stop offset="1" stopColor="#f2bf95" />
          </radialGradient>
          <linearGradient id={`${id}hijab`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3fd6cf" />
            <stop offset="1" stopColor="#14a39d" />
          </linearGradient>
        </defs>
        {/* legs + shoes */}
        <rect x="88" y="330" width="24" height="52" rx="10" fill="#2f5bea" />
        <rect x="128" y="330" width="24" height="52" rx="10" fill="#2f5bea" />
        <ellipse cx="98" cy="384" rx="20" ry="10" fill="#17206b" />
        <ellipse cx="142" cy="384" rx="20" ry="10" fill="#17206b" />
        {/* coat */}
        <path d="M58 190c0-30 26-50 62-50s62 20 62 50l10 150H48Z" fill={`url(#${id}coat)`} stroke="#c9d6f5" strokeWidth="3" />
        <path d="M120 150v190" stroke="#c9d6f5" strokeWidth="3" />
        <rect x="70" y="250" width="34" height="26" rx="6" fill="#eef3ff" stroke="#c9d6f5" strokeWidth="2" />
        <rect x="76" y="244" width="5" height="16" rx="2" fill="#ff6b8b" />
        <rect x="84" y="244" width="5" height="16" rx="2" fill="#2f5bea" />
        {/* arm waving with clipboard */}
        <g className={talking ? 'doc-arm talk' : 'doc-arm'}>
          <path d="M178 200c22 16 30 40 24 62" stroke="#ffffff" strokeWidth="26" strokeLinecap="round" fill="none" />
          <circle cx="202" cy="268" r="12" fill={`url(#${id}skin)`} />
          <rect x="184" y="262" width="44" height="56" rx="8" fill="#ffd23f" stroke="#e08a00" strokeWidth="3" />
          <rect x="192" y="274" width="28" height="4" rx="2" fill="#fff" />
          <rect x="192" y="284" width="22" height="4" rx="2" fill="#fff" />
          <path d="M193 298l6 6 12-12" stroke="#3cc46a" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
        <path d="M62 200c-18 20-22 46-16 64" stroke="#ffffff" strokeWidth="26" strokeLinecap="round" fill="none" />
        <circle cx="47" cy="268" r="12" fill={`url(#${id}skin)`} />
        {/* stethoscope */}
        <path d="M96 152c-8 40 0 70 24 76 24-6 32-36 24-76" stroke="#17206b" strokeWidth="5" fill="none" />
        <circle cx="120" cy="232" r="11" fill="#9aa6d6" stroke="#17206b" strokeWidth="4" />
        {/* hijab + face */}
        <path d="M54 110c0-48 30-80 66-80s66 32 66 80c0 30-10 50-22 62H76c-12-12-22-32-22-62Z" fill={`url(#${id}hijab)`} />
        <ellipse cx="120" cy="104" rx="44" ry="50" fill={`url(#${id}skin)`} />
        <path d="M76 86c6-30 24-44 44-44s38 14 44 44c-12-14-28-20-44-20s-32 6-44 20Z" fill={`url(#${id}hijab)`} />
        {/* eyes (blink) */}
        <g className="blink">
          <ellipse cx="102" cy="104" rx="8" ry="10" fill="#fff" />
          <ellipse cx="138" cy="104" rx="8" ry="10" fill="#fff" />
          <g ref={pupils}>
            <circle cx="103" cy="106" r="5.5" fill="#3a2a1a" />
            <circle cx="139" cy="106" r="5.5" fill="#3a2a1a" />
            <circle cx="105" cy="103" r="2" fill="#fff" />
            <circle cx="141" cy="103" r="2" fill="#fff" />
          </g>
        </g>
        <path d="M92 88q10-6 18 0M130 88q10-6 18 0" stroke="#3a2a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="92" cy="122" rx="8" ry="5" fill="#ff8fa8" opacity="0.5" />
        <ellipse cx="148" cy="122" rx="8" ry="5" fill="#ff8fa8" opacity="0.5" />
        {/* mouth: talks */}
        <g transform="translate(120 132)">
          <path ref={mouthClosed} d={happy ? 'M-14-4q14 16 28 0' : 'M-11-2q11 10 22 0'} stroke="#7a1638" strokeWidth="4" fill={happy ? '#7a1638' : 'none'} strokeLinecap="round" />
          <g ref={mouthOpen} style={{ display: 'none' }} data-mouth="doctor">
            <ellipse ref={mouthInner} cx="0" cy="1" rx="9" ry="6" fill="#7a1638" />
            <ellipse ref={mouthTongue} cx="0" cy="4" rx="5" ry="2" fill="#ff8fa8" />
          </g>
        </g>
        {/* head mirror */}
        <circle cx="120" cy="52" r="12" fill="#dfe8ff" stroke="#9aa6d6" strokeWidth="3" />
        <circle cx="120" cy="52" r="5" fill="#fff" />
      </svg>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Kabsool — the friendly antibiotic hero                             */
/* ------------------------------------------------------------------ */

export type CapsuleMood = 'idle' | 'fight' | 'confused' | 'worried' | 'happy'

export function CapsuleHero({
  mood = 'idle',
  talking = false,
  size = 200,
  shielded = false,
  speech = null,
}: {
  mood?: CapsuleMood
  talking?: boolean
  size?: number
  shielded?: boolean
  speech?: Speech
}) {
  const id = useId()
  const { closed: mouthClosed, open: mouthOpen, inner: mouthInner, tongue: mouthTongue } = useMouth(speech)
  const anim: Record<CapsuleMood, TargetAndTransition> = {
    idle: { y: [0, -10, 0], rotate: [0, 3, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
    fight: { x: [0, 30, 0], rotate: [0, -8, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.3 } },
    confused: { rotate: [0, -10, 10, 0], y: [0, -6, 0], transition: { duration: 1.4, repeat: Infinity } },
    worried: { x: [0, -4, 4, -4, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.6 } },
    happy: { y: [0, -30, 0], rotate: [0, 360], transition: { duration: 1.1, repeat: Infinity, repeatDelay: 0.6 } },
  }
  return (
    <motion.div
      className="actor capsule-hero"
      style={{ width: size, height: size }}
      animate={talking && mood === 'idle' ? { y: [0, -6, 0], rotate: [0, 3, -3, 0], transition: { duration: 0.8, repeat: Infinity } } : anim[mood]}
      key={`${mood}-${talking}`}
    >
      <svg viewBox="0 0 220 220" width="100%" height="100%" aria-hidden>
        <defs>
          <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffb3c4" />
            <stop offset="0.35" stopColor="#ff5f8f" />
            <stop offset="1" stopColor="#c2255a" />
          </linearGradient>
          <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#c9d2f0" />
          </linearGradient>
        </defs>
        {/* cape */}
        <path className="cape" d="M70 92c-30 20-50 60-46 96 30-8 52-30 66-62Z" fill="#4cbcff" />
        {/* feet */}
        <ellipse cx="88" cy="190" rx="16" ry="9" fill="#17206b" />
        <ellipse cx="132" cy="190" rx="16" ry="9" fill="#17206b" />
        <rect x="83" y="160" width="10" height="28" rx="5" fill="#17206b" />
        <rect x="127" y="160" width="10" height="28" rx="5" fill="#17206b" />
        {/* body: vertical capsule */}
        <path d="M60 110V80a50 50 0 0 1 100 0v30Z" fill={`url(#${id}r)`} />
        <path d="M60 110v30a50 50 0 0 0 100 0v-30Z" fill={`url(#${id}w)`} />
        <path d="M60 80a50 50 0 0 1 100 0v60a50 50 0 0 1-100 0Z" fill="none" stroke="#17206b" strokeOpacity="0.2" strokeWidth="3" />
        <rect x="74" y="44" width="14" height="60" rx="7" fill="#fff" opacity="0.5" />
        {/* arms with gloves */}
        <g className={mood === 'fight' ? 'cap-arm punch' : 'cap-arm'}>
          <path d="M160 120c18 0 28-10 32-24" stroke="#17206b" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="194" cy="92" r="13" fill="#ffd23f" stroke="#e08a00" strokeWidth="3" />
        </g>
        <path d={mood === 'confused' ? 'M60 120c-18-4-26-18-26-32' : 'M60 124c-18 4-28 14-30 28'} stroke="#17206b" strokeWidth="7" strokeLinecap="round" fill="none" />
        <circle cx={mood === 'confused' ? 34 : 30} cy={mood === 'confused' ? 86 : 154} r="13" fill="#ffd23f" stroke="#e08a00" strokeWidth="3" />
        {/* face */}
        <g className="blink">
          <ellipse cx="94" cy="112" rx="11" ry={mood === 'worried' ? 14 : 13} fill="#fff" stroke="#17206b" strokeOpacity="0.15" strokeWidth="2" />
          <ellipse cx="126" cy="112" rx="11" ry={mood === 'worried' ? 14 : 13} fill="#fff" stroke="#17206b" strokeOpacity="0.15" strokeWidth="2" />
          <circle cx="96" cy="114" r="6" fill="#17206b" />
          <circle cx="128" cy="114" r="6" fill="#17206b" />
          <circle cx="98" cy="111" r="2" fill="#fff" />
          <circle cx="130" cy="111" r="2" fill="#fff" />
        </g>
        {mood === 'fight' && <path d="M82 96l22 6M138 96l-22 6" stroke="#17206b" strokeWidth="5" strokeLinecap="round" />}
        {mood === 'worried' && <path d="M82 98l20-6M138 98l-20-6" stroke="#17206b" strokeWidth="5" strokeLinecap="round" />}
        <g transform="translate(110 140)">
          {mood === 'worried' || mood === 'confused' ? (
            <path ref={mouthClosed} d="M-10 4q10-8 20 0" stroke="#17206b" strokeWidth="4" fill="none" strokeLinecap="round" />
          ) : (
            <path ref={mouthClosed} d="M-12-2q12 14 24 0" stroke="#17206b" strokeWidth="4" fill="#7a1638" strokeLinecap="round" />
          )}
          <g ref={mouthOpen} style={{ display: 'none' }} data-mouth="capsule">
            <ellipse ref={mouthInner} cx="0" cy="1" rx="9" ry="6" fill="#7a1638" stroke="#17206b" strokeWidth="2.5" />
            <ellipse ref={mouthTongue} cx="0" cy="4" rx="5" ry="2" fill="#ff8fa8" />
          </g>
        </g>
        <ellipse cx="80" cy="132" rx="7" ry="4" fill="#ff8fa8" opacity="0.6" />
        <ellipse cx="140" cy="132" rx="7" ry="4" fill="#ff8fa8" opacity="0.6" />
        {mood === 'confused' && (
          <text x="172" y="60" fontSize="44" fontWeight="800" fill="#ffd23f" stroke="#e08a00" strokeWidth="2">
            ?
          </text>
        )}
        {mood === 'worried' && <path d="M170 60c4 6 6 10 6 13a6 6 0 0 1-12 0c0-3 2-7 6-13Z" fill="#9fdcff" />}
      </svg>
      {shielded && <span className="hero-bubble-shield" />}
    </motion.div>
  )
}
