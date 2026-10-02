import { useId, useRef } from 'react'
import { motion, AnimatePresence, type TargetAndTransition } from 'motion/react'
import rigSkirt from '../assets/aleen-rig/skirt.webp'
import rigTorso from '../assets/aleen-rig/torso.webp'
import rigHead from '../assets/aleen-rig/head.webp'
import rigHands from '../assets/aleen-rig/hands.webp'
import { approach, hash01, makeBlinker, makeNod, mouthAt, phrases, shapeAt, useFrame, type Heard, type Look, type Speech } from './timeline'
import { Sparkle, Star } from '../art/objects'

/* ------------------------------------------------------------------ */
/*  Aleen — the supplied image, brought to life as a rigged character  */
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

/* Rig geometry, in pixels of the full-resolution source (547 × 1394). */
const RIG_W = 547
const RIG_H = 1394
const EYE_L = '225.3,161.0 229.0,155.8 236.5,153.7 245.8,153.7 252.3,155.8 257.9,160.1 261.6,165.3 259.7,169.6 252.3,171.7 243.9,172.2 236.5,171.3 230.0,168.7 226.2,165.3'
const EYE_R = '303.3,169.9 305.2,162.1 309.9,157.0 317.3,154.4 326.6,154.4 334.0,157.0 339.6,162.1 341.5,167.3 336.8,171.6 327.5,174.2 318.2,174.6 309.9,173.3 305.2,172.5'
const IRIS_L = { cx: 236.4, cy: 162.9, r: 10.8 }
const IRIS_R = { cx: 311.3, cy: 164.5, r: 10.2 }
const LASH_L = 'M224 161 Q236 150 253 154.5 Q259 158 263 166'
const LASH_R = 'M302 170 Q307 155 324 152.5 Q337 154 343 168'
/** her eyebrows: soft patches of her own drawing that can lift (pivot = outer end) */
const BROW_L = { cx: 238.5, cy: 139.5, rx: 30, ry: 10, px: 213, py: 141 }
const BROW_R = { cx: 326, cy: 142.5, rx: 33, ry: 10, px: 356, py: 145 }
const MOUTH = { cx: 282, cy: 236.5 }
/** Gaze offsets (source px). Her drawn eyes look toward the viewer's left (the other characters). */
const GAZE_VIEWER = 6.5

/**
 * Hand gestures, chosen per spoken phrase so they never loop mechanically.
 * Her hands are clasped in the artwork, so gestures are lifts of the clasped
 * hands from the elbows, a "presenting" move toward what she talks about, and
 * small rhythmic beats on stressed syllables.
 */
const GESTURES = [
  { lift: 20, side: 0, lean: 0.25, beat: 3 }, // lift: emphasis
  { lift: 16, side: -9, lean: -0.7, beat: 2.5 }, // present toward the others / the visual
  { lift: 9, side: 0, lean: 0, beat: 4.5 }, // small beats on the stressed syllables
  { lift: 1.5, side: 0, lean: 0, beat: 1.5 }, // hands at rest
]
function gestureFor(id: string, k: number, mood: AleenMood) {
  if (mood === 'point') return k % 2 ? GESTURES[0] : { lift: 20, side: -11, lean: -1.1, beat: 2 }
  if (mood === 'cheer') return { lift: 23, side: 0, lean: 0, beat: 5 }
  if (mood === 'sick') return { lift: 4, side: 0, lean: 0, beat: 0.8 }
  let i = Math.floor(hash01(id, k) * 4)
  const prev = k > 0 ? Math.floor(hash01(id, k - 1) * 4) : -1
  if (i === prev) i = (i + 1) % 4
  if (k === 0 && i === 3) i = 0
  return GESTURES[i]
}
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x))

export function AleenActor({
  mood = 'idle',
  height = 420,
  reduced = false,
  speech = null,
  heard = null,
  look = 'viewer',
  visual = { x: -1.5, y: 1.2 },
}: {
  mood?: AleenMood
  talking?: boolean
  height?: number
  reduced?: boolean
  /** her own line while she speaks; null when silent */
  speech?: Speech
  /** the line someone else is saying (she listens and reacts) */
  heard?: Heard
  /** where she looks: at the viewer, at the other character, or at the educational visual */
  look?: Look
  /** gaze offset (source px) toward this scene's visual */
  visual?: { x: number; y: number }
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const width = Math.round((height * RIG_W) / RIG_H)
  const k = height / RIG_H // source px → screen px
  const emote = EMOTE[mood]

  const rootRef = useRef<HTMLDivElement>(null)
  const torsoRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const handsRef = useRef<HTMLImageElement>(null)
  const eyesRef = useRef<SVGGElement>(null)
  const irisRefs = [useRef<SVGGElement>(null), useRef<SVGGElement>(null)]
  const lidRefs = [useRef<SVGGElement>(null), useRef<SVGGElement>(null)]
  const browRefs = [useRef<SVGGElement>(null), useRef<SVGGElement>(null)]
  const browsRef = useRef<SVGGElement>(null)
  const mouthRef = useRef<SVGGElement>(null)
  const upLipRef = useRef<SVGGElement>(null)
  const lowLipRef = useRef<SVGGElement>(null)
  const innerRef = useRef<SVGEllipseElement>(null)
  const tongueRef = useRef<SVGEllipseElement>(null)
  const seed = hash01(uid) * 10
  const st = useRef({
    o: 0, w: 0.5, gx: look === 'viewer' ? GAZE_VIEWER : 0, gy: 0, tilt: 0, lean: 0, lift: 0, side: 0, shrug: 0, bob: 0, brow: 0, browIn: 0,
    last: 0, sacc: 0, sx: 0, sy: 0, lastLook: look as string, lastPeak: 0, nextListenNod: 0, acked: '', moodAt: 0, mood: mood as string,
  })
  const blink = useRef(makeBlinker(height | 0))
  const nod = useRef(makeNod())

  useFrame((t, wall) => {
    const s = st.current
    const dt = s.last ? Math.min(0.1, wall - s.last) : 0.016
    s.last = wall
    if (s.mood !== mood) {
      s.mood = mood
      s.moodAt = wall
    }
    const sinceMood = wall - s.moodAt
    const speaking = !!speech && t >= speech.start && t <= speech.end
    const lt = speech ? t - speech.start : 0
    const N = nod.current

    // ---- mouth: her own voice only (jaw + lip shape from the sound) ----
    s.o = speaking ? approach(s.o, mouthAt(speech, t), dt, 35) : approach(s.o, 0, dt, 30)
    s.w = approach(s.w, speaking ? shapeAt(speech, t) : 0.5, dt, 20)

    // ---- gestures for the current phrase ----
    let liftT = 0
    let sideT = 0
    let leanT = 0
    if (speaking && !reduced) {
      const ps = phrases(speech!)
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        if (lt < p.s - 0.2 || lt > p.e + 0.7) continue
        const g = gestureFor(speech!.id, i, mood)
        const env = smooth((lt - (p.s - 0.2)) / 0.3) * (1 - smooth((lt - (p.e + 0.25)) / 0.4))
        liftT = Math.max(liftT, g.lift * env + g.beat * env * s.o)
        sideT = g.side * env
        leanT = g.lean * env
      }
      // a soft nod on strong stressed syllables
      if (s.o > 0.72 && wall - s.lastPeak > 1.1) {
        s.lastPeak = wall
        N.kick(wall, 0.45)
      }
    }
    // ---- listening: attentive, small nods, acknowledges the end of the line ----
    const listening = !!heard && t >= heard.start && t <= heard.end
    if (listening && !reduced && wall > s.nextListenNod) {
      if (s.nextListenNod) N.kick(wall, 0.5)
      s.nextListenNod = wall + 2.2 + hash01(heard!.id, Math.floor(wall)) * 1.6
    }
    if (!listening) s.nextListenNod = 0
    if (heard && t > heard.end + 0.05 && t < heard.end + 0.6 && s.acked !== heard.id) {
      s.acked = heard.id
      N.kick(wall, reduced ? 0.4 : 1)
    }
    if (mood === 'nod' && speaking && lt < 0.4) N.kick(wall, 1)
    // tiny idle fidget so she is never frozen
    if (!speaking && !reduced) liftT = Math.max(liftT, (Math.sin(wall * 0.37 + seed) * 0.5 + 0.5) ** 6 * 5)

    // ---- posture ----
    const lookLean = look === 'viewer' ? 0 : look === 'other' ? -0.6 : -0.9
    const sway = reduced ? 0 : Math.sin(wall * 0.55 + seed) * 0.45 + Math.sin(wall * 0.21 + seed * 2) * 0.25
    const surprise = mood === 'surprised' ? Math.exp(-sinceMood * 2.2) : 0
    let leanMood = 0
    let tiltMood = 0
    let shrugT = 0
    let bobT = 0
    if (mood === 'sick') {
      leanMood = -1.1
      tiltMood = -3.5
    } else if (mood === 'think') tiltMood = 4
    else if (mood === 'worried') {
      shrugT = 3
      tiltMood = -1.5
    } else if (mood === 'surprised') {
      shrugT = 2.5 * surprise
      leanMood = 1.4 * surprise
    }
    if (!reduced && (mood === 'cheer' || mood === 'happy' || mood === 'wave') && speaking) {
      const f = mood === 'cheer' ? 1.7 : 1.2
      bobT = Math.abs(Math.sin(wall * Math.PI * f)) * (mood === 'cheer' ? 7 : 4)
    }
    s.lean = approach(s.lean, lookLean + leanMood + leanT + sway, dt, 4)
    s.shrug = approach(s.shrug, shrugT + liftT * 0.08, dt, 6)
    s.bob = approach(s.bob, bobT, dt, 12)
    s.lift = approach(s.lift, liftT, dt, 9)
    s.side = approach(s.side, sideT, dt, 6)

    // ---- head ----
    const lookTilt = look === 'viewer' ? 0.6 : look === 'other' ? -1.6 : -2.2
    const headSway = reduced ? 0 : Math.sin(wall * 0.9 + seed) * 0.6
    const talkTilt = speaking && !reduced ? Math.sin(lt * 1.3 + seed) * 1.2 : 0
    s.tilt = approach(s.tilt, lookTilt + tiltMood + headSway + talkTilt, dt, 5)
    const n = reduced ? N.value(wall) * 0.4 : N.value(wall)

    // ---- eyes: gaze + micro saccades + blinking (blink when the gaze jumps) ----
    if (wall > s.sacc) {
      s.sacc = wall + 1.1 + Math.random() * 1.8
      s.sx = (Math.random() - 0.5) * 1.8
      s.sy = (Math.random() - 0.5) * 1.1
    }
    const gzx = mood === 'think' ? 2.5 : look === 'viewer' ? GAZE_VIEWER : look === 'other' ? 0 : visual.x
    const gzy = mood === 'think' ? -2.5 : look === 'visual' ? visual.y : mood === 'sick' || mood === 'worried' ? 1.5 : 0
    const jumped = s.lastLook !== look
    s.lastLook = look
    s.gx = approach(s.gx, gzx + (reduced ? 0 : s.sx), dt, 16)
    s.gy = approach(s.gy, gzy + (reduced ? 0 : s.sy) + n * 0.8, dt, 16)
    const b = blink.current(wall, jumped)

    // ---- eyebrows ----
    const phraseFlash = speaking && !reduced ? Math.max(0, 1 - Math.abs(lt % 3.1 - 0.35) * 3) * 0.9 : 0
    const browT = (mood === 'surprised' ? 2.4 * Math.max(surprise, 0.5) : 0) + (mood === 'think' ? 1.8 : 0) + (mood === 'happy' || mood === 'cheer' ? 0.8 : 0) + phraseFlash
    s.brow = approach(s.brow, browT, dt, 10)
    s.browIn = approach(s.browIn, mood === 'worried' ? 6 : mood === 'sick' ? 4 : 0, dt, 6)

    // ---- apply ----
    const px = (v: number) => (v * k).toFixed(2)
    if (rootRef.current) rootRef.current.style.transform = `translateY(${px(-s.bob)}px)`
    if (torsoRef.current) {
      const breath = reduced ? 0 : (Math.sin(wall * (mood === 'sick' ? 1.1 : 1.7) + seed) * 0.5 + 0.5) * (mood === 'sick' ? 0.006 : 0.004)
      torsoRef.current.style.transform = `translateY(${px(-s.shrug)}px) rotate(${s.lean.toFixed(3)}deg) scaleY(${(1 + breath).toFixed(4)})`
    }
    if (headRef.current) headRef.current.style.transform = `translateY(${px(n * 2.6)}px) rotate(${(s.tilt + n * 1.2).toFixed(3)}deg)`
    if (handsRef.current) {
      const h = handsRef.current.style
      // the forearms rise from the elbows: the hands move up (slightly foreshortened)
      h.transform = `translate(${px(s.side)}px, ${px(-s.lift)}px) scaleY(${(1 - s.lift * 0.0022).toFixed(4)})`
      h.filter = s.lift > 1 ? `drop-shadow(0 ${px(4 + s.lift * 0.15)}px ${px(5)}px rgb(15 20 70 / ${Math.min(0.28, s.lift * 0.02).toFixed(3)}))` : ''
    }
    // eye overlay only when it differs from the original drawing
    const showEyes = Math.abs(s.gx) > 0.25 || Math.abs(s.gy) > 0.25 || b > 0.02
    if (eyesRef.current) eyesRef.current.style.display = showEyes ? '' : 'none'
    if (showEyes) {
      irisRefs.forEach((r) => r.current?.setAttribute('transform', `translate(${s.gx.toFixed(2)} ${s.gy.toFixed(2)})`))
      lidRefs.forEach((r) => r.current?.setAttribute('transform', `translate(0 ${(b * 26).toFixed(2)})`))
    }
    const showBrows = s.brow > 0.08 || s.browIn > 0.15
    if (browsRef.current) browsRef.current.style.display = showBrows ? '' : 'none'
    if (showBrows) {
      browRefs[0].current?.setAttribute('transform', `translate(0 ${(-s.brow).toFixed(2)}) rotate(${(-s.browIn).toFixed(2)} ${BROW_L.px} ${BROW_L.py})`)
      browRefs[1].current?.setAttribute('transform', `translate(0 ${(-s.brow).toFixed(2)}) rotate(${s.browIn.toFixed(2)} ${BROW_R.px} ${BROW_R.py})`)
    }
    // mouth: her own lips part; jaw height from the vowel, width from the lip shape
    const o = s.o
    const vis = Math.min(1, Math.max(0, (o - 0.03) / 0.1))
    if (mouthRef.current) {
      mouthRef.current.style.display = vis > 0 ? '' : 'none'
      mouthRef.current.style.opacity = vis.toFixed(3)
    }
    if (vis > 0) {
      const round = 1 - s.w // 1 = rounded (u/o)
      const drop = 4.6 * o
      const rx = (10.5 + 8 * s.w) * (0.78 + 0.22 * o)
      const ry = 0.5 + drop * 0.62
      const cy = 235.6 + ry * 0.55
      innerRef.current?.setAttribute('rx', rx.toFixed(2))
      innerRef.current?.setAttribute('ry', ry.toFixed(2))
      innerRef.current?.setAttribute('cy', cy.toFixed(2))
      tongueRef.current?.setAttribute('cy', (cy + ry * 0.45).toFixed(2))
      tongueRef.current?.setAttribute('rx', (rx * 0.55).toFixed(2))
      tongueRef.current?.setAttribute('ry', (ry * 0.42).toFixed(2))
      tongueRef.current?.setAttribute('opacity', o > 0.35 ? '0.45' : '0')
      const sx = 1 - 0.1 * round * o
      const pucker = `translate(${MOUTH.cx} 0) scale(${sx.toFixed(3)} 1) translate(${-MOUTH.cx} 0)`
      upLipRef.current?.setAttribute('transform', pucker)
      lowLipRef.current?.setAttribute('transform', `${pucker} translate(0 ${drop.toFixed(2)})`)
    }
  })

  return (
    <div className="actor aleen-actor" style={{ width, height }}>
      <div className="actor-shadow" />
      <div ref={rootRef} className="aleen-body">
        <div className="rig">
          <img className="rig-layer" src={rigSkirt} alt="" draggable={false} />
          <div ref={torsoRef} className="rig-torso">
            <img className="rig-layer" src={rigTorso} alt="" draggable={false} />
            <img ref={handsRef} className="rig-layer rig-hands" src={rigHands} alt="" draggable={false} />
            <div ref={headRef} className="rig-head">
              <img className="rig-layer" src={rigHead} alt="" draggable={false} />
              <svg className="rig-face" viewBox={`0 0 ${RIG_W} ${RIG_H}`} aria-hidden>
                <defs>
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
                  <filter id={`${uid}feather2`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2.4" />
                  </filter>
                  <mask id={`${uid}mL`} maskUnits="userSpaceOnUse" x="0" y="0" width={RIG_W} height={RIG_H}>
                    <polygon points={EYE_L} fill="#fff" filter={`url(#${uid}feather)`} />
                  </mask>
                  <mask id={`${uid}mR`} maskUnits="userSpaceOnUse" x="0" y="0" width={RIG_W} height={RIG_H}>
                    <polygon points={EYE_R} fill="#fff" filter={`url(#${uid}feather)`} />
                  </mask>
                  {[BROW_L, BROW_R].map((br, i) => (
                    <mask key={i} id={`${uid}b${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={RIG_W} height={RIG_H}>
                      <ellipse cx={br.cx} cy={br.cy} rx={br.rx} ry={br.ry} fill="#fff" filter={`url(#${uid}feather2)`} />
                    </mask>
                  ))}
                  {/* her real lips, softly cut out so they can part and shape vowels */}
                  <mask id={`${uid}upLip`} maskUnits="userSpaceOnUse" x="0" y="0" width={RIG_W} height={RIG_H}>
                    <ellipse cx={MOUTH.cx} cy={231.5} rx={30} ry={6.5} fill="#fff" filter={`url(#${uid}feather)`} />
                  </mask>
                  <mask id={`${uid}lowLip`} maskUnits="userSpaceOnUse" x="0" y="0" width={RIG_W} height={RIG_H}>
                    <ellipse cx={MOUTH.cx} cy={241.8} rx={28} ry={7.2} fill="#fff" filter={`url(#${uid}feather)`} />
                    <rect x={MOUTH.cx - 34} y={226} width={68} height={10.2} fill="#000" />
                  </mask>
                  <linearGradient id={`${uid}lid`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#d4855f" />
                    <stop offset="1" stopColor="#df9473" />
                  </linearGradient>
                  <radialGradient id={`${uid}in`} cx="50%" cy="35%" r="65%">
                    <stop offset="0" stopColor="#3e0c16" />
                    <stop offset="1" stopColor="#6e1c28" />
                  </radialGradient>
                  <filter id={`${uid}soft`} x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="0.45" />
                  </filter>
                </defs>
                <g ref={browsRef} style={{ display: 'none' }}>
                  {[BROW_L, BROW_R].map((_, i) => (
                    <g key={i} ref={browRefs[i]}>
                      <image href={rigHead} x={0} y={0} width={RIG_W} height={RIG_H} mask={`url(#${uid}b${i})`} />
                    </g>
                  ))}
                </g>
                <g ref={eyesRef} style={{ display: 'none' }}>
                  {(
                    [
                      [IRIS_L, 'L', LASH_L],
                      [IRIS_R, 'R', LASH_R],
                    ] as const
                  ).map(([iris, key, lash], i) => (
                    <g key={key}>
                      <g mask={`url(#${uid}m${key})`}>
                        <rect x={iris.cx - 40} y={140} width={80} height={45} fill={`url(#${uid}sc)`} />
                        <g ref={irisRefs[i]}>
                          <image href={rigHead} x={0} y={0} width={RIG_W} height={RIG_H} clipPath={`url(#${uid}i${key})`} />
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
                    <ellipse ref={innerRef} cx={MOUTH.cx} cy={MOUTH.cy} rx={14} ry={1} fill={`url(#${uid}in)`} />
                    <ellipse ref={tongueRef} cx={MOUTH.cx} cy={MOUTH.cy + 3} rx={6} ry={1} fill="#c4505e" opacity={0} />
                  </g>
                  <g ref={upLipRef}>
                    <image href={rigHead} x={0} y={0} width={RIG_W} height={RIG_H} mask={`url(#${uid}upLip)`} />
                  </g>
                  <g ref={lowLipRef}>
                    <image href={rigHead} x={0} y={0} width={RIG_W} height={RIG_H} mask={`url(#${uid}lowLip)`} />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

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

/** Cartoon mouth driven by the character's own voice (openness + lip shape); closed smile otherwise. */
function useMouth(speech: Speech, size = 1) {
  const closed = useRef<SVGPathElement>(null)
  const open = useRef<SVGGElement>(null)
  const inner = useRef<SVGEllipseElement>(null)
  const tongue = useRef<SVGEllipseElement>(null)
  const st = useRef({ o: 0, w: 0.5, last: 0 })
  useFrame((t, wall) => {
    const s = st.current
    const dt = s.last ? Math.min(0.1, wall - s.last) : 0.016
    s.last = wall
    const live = !!speech && t >= speech.start && t <= speech.end
    s.o = approach(s.o, live ? mouthAt(speech, t) : 0, dt, live ? 35 : 30)
    s.w = approach(s.w, live ? shapeAt(speech, t) : 0.5, dt, 20)
    const isOpen = s.o > 0.06
    if (closed.current) closed.current.style.display = isOpen ? 'none' : ''
    if (open.current) open.current.style.display = isOpen ? '' : 'none'
    if (isOpen) {
      const rx = (4.5 + 5 * s.w + 1.5 * s.o) * size
      const ry = (1.4 + 6.2 * s.o) * size
      inner.current?.setAttribute('rx', rx.toFixed(2))
      inner.current?.setAttribute('ry', ry.toFixed(2))
      tongue.current?.setAttribute('cy', (ry * 0.55).toFixed(2))
      tongue.current?.setAttribute('rx', (rx * 0.55).toFixed(2))
      tongue.current?.setAttribute('ry', (ry * 0.35).toFixed(2))
    }
  })
  return { closed, open, inner, tongue }
}

/* ------------------------------------------------------------------ */
/*  Dr. Huda — friendly doctor (fully drawn, so she can act freely)    */
/* ------------------------------------------------------------------ */

export function Doctor({
  height = 400,
  happy = false,
  speech = null,
  heard = null,
  lookAt = 'aleen',
  gesture = 'explain',
  reduced = false,
}: {
  talking?: boolean
  height?: number
  happy?: boolean
  speech?: Speech
  /** the line Aleen (or someone else) is saying — she listens and reacts */
  heard?: Heard
  lookAt?: 'aleen' | 'viewer' | 'visual'
  /** how she gestures while speaking: an open explaining hand, or pointing with her clipboard toward the visual */
  gesture?: 'explain' | 'point'
  reduced?: boolean
}) {
  const id = useId()
  const { closed: mouthClosed, open: mouthOpen, inner: mouthInner, tongue: mouthTongue } = useMouth(speech)
  const pupils = useRef<SVGGElement>(null)
  const eyes = useRef<SVGGElement>(null)
  const brows = useRef<SVGPathElement>(null)
  const head = useRef<SVGGElement>(null)
  const body = useRef<SVGGElement>(null)
  const upper = useRef<SVGGElement>(null)
  const fore = useRef<SVGGElement>(null)
  const board = useRef<SVGGElement>(null)
  const seed = hash01(id) * 10
  const blink = useRef(makeBlinker((height | 0) + 3))
  const nod = useRef(makeNod())
  const st = useRef({ last: 0, px: 0, py: 0, tilt: 0, lean: 0, up: 0, fore: 0, board: 0, brow: 0, lastPeak: 0, nextNod: 0, acked: '', look: lookAt as string })

  useFrame((t, wall) => {
    const s = st.current
    const dt = s.last ? Math.min(0.1, wall - s.last) : 0.016
    s.last = wall
    const N = nod.current
    const speaking = !!speech && t >= speech.start && t <= speech.end
    const lt = speech ? t - speech.start : 0
    const listening = !!heard && t >= heard.start && t <= heard.end
    // gestures follow her phrases: the hand opens toward Aleen as she explains
    let upT = 0
    let foreT = 0
    let boardT = 0
    if (speaking && !reduced) {
      const ps = phrases(speech!)
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        if (lt < p.s - 0.25 || lt > p.e + 0.8) continue
        const env = smooth((lt - (p.s - 0.25)) / 0.35) * (1 - smooth((lt - (p.e + 0.3)) / 0.45))
        const variant = hash01(speech!.id, i)
        if (gesture === 'point' && i % 2 === 0) boardT = -16 * env
        else if (variant < 0.75 || i === 0) {
          upT = 14 * env
          foreT = (80 + 20 * variant) * env
        } else boardT = -8 * env
      }
      if (mouthAt(speech, t) > 0.7 && wall - s.lastPeak > 1.2) {
        s.lastPeak = wall
        N.kick(wall, 0.4)
      }
    }
    if (listening && !reduced && wall > s.nextNod) {
      if (s.nextNod) N.kick(wall, 0.6)
      s.nextNod = wall + 2 + hash01(heard!.id, Math.floor(wall)) * 1.5
    }
    if (!listening) s.nextNod = 0
    if (heard && t > heard.end + 0.05 && t < heard.end + 0.6 && s.acked !== heard.id) {
      s.acked = heard.id
      N.kick(wall, 1)
    }
    s.up = approach(s.up, upT, dt, 7)
    s.fore = approach(s.fore, foreT, dt, 7)
    s.board = approach(s.board, boardT, dt, 6)
    // posture: leans toward Aleen while listening, relaxed sway, breathing
    const sway = reduced ? 0 : Math.sin(wall * 0.5 + seed) * 0.6
    s.lean = approach(s.lean, (listening || lookAt === 'aleen' ? 1.2 : 0) + sway, dt, 3)
    s.tilt = approach(s.tilt, (lookAt === 'aleen' ? 3 : lookAt === 'visual' ? 2 : 0) + (listening ? 2 : 0) + (reduced ? 0 : Math.sin(wall * 0.8 + seed) * 1.2), dt, 4)
    s.brow = approach(s.brow, (speaking ? Math.max(0, 1 - Math.abs((lt % 2.7) - 0.3) * 2.5) * 2 : 0) + (listening ? 1 : 0), dt, 8)
    const n = N.value(wall) * (reduced ? 0.4 : 1)
    const breath = reduced ? 0 : (Math.sin(wall * 1.6 + seed) * 0.5 + 0.5) * 0.006
    body.current?.setAttribute('transform', `rotate(${s.lean.toFixed(2)} 120 380) translate(0 ${(-breath * 200).toFixed(2)})`)
    head.current?.setAttribute('transform', `translate(0 ${(n * 3).toFixed(2)}) rotate(${(s.tilt + n * 2).toFixed(2)} 120 150)`)
    upper.current?.setAttribute('transform', `rotate(${s.up.toFixed(2)} 62 200)`)
    fore.current?.setAttribute('transform', `rotate(${s.fore.toFixed(2)} 52 238)`)
    board.current?.setAttribute('transform', `rotate(${s.board.toFixed(2)} 178 200)`)
    brows.current?.setAttribute('transform', `translate(0 ${(-s.brow).toFixed(2)})`)
    // eyes: look at Aleen (stage right) / the viewer / the visual, natural blinks
    const tx = lookAt === 'aleen' ? 3.2 : lookAt === 'visual' ? 2.6 : 0
    const ty = lookAt === 'aleen' ? 0.6 : lookAt === 'visual' ? -1.2 : 0
    const jumped = s.look !== lookAt
    s.look = lookAt
    s.px = approach(s.px, tx, dt, 14)
    s.py = approach(s.py, ty, dt, 14)
    pupils.current?.setAttribute('transform', `translate(${s.px.toFixed(2)} ${s.py.toFixed(2)})`)
    const b = blink.current(wall, jumped)
    eyes.current?.setAttribute('transform', `translate(0 104) scale(1 ${(1 - b * 0.92).toFixed(3)}) translate(0 -104)`)
  })
  return (
    <div className="actor doctor" style={{ width: height * 0.6, height }}>
      <div className="actor-shadow" />
      <svg viewBox="0 0 240 400" width="100%" height="100%" aria-hidden overflow="visible">
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
        <g ref={body}>
          {/* coat */}
          <path d="M58 190c0-30 26-50 62-50s62 20 62 50l10 150H48Z" fill={`url(#${id}coat)`} stroke="#c9d6f5" strokeWidth="3" />
          <path d="M120 150v190" stroke="#c9d6f5" strokeWidth="3" />
          <rect x="70" y="250" width="34" height="26" rx="6" fill="#eef3ff" stroke="#c9d6f5" strokeWidth="2" />
          <rect x="76" y="244" width="5" height="16" rx="2" fill="#ff6b8b" />
          <rect x="84" y="244" width="5" height="16" rx="2" fill="#2f5bea" />
          {/* arm with clipboard */}
          <g ref={board}>
            <path d="M178 200c22 16 30 40 24 62" stroke="#ffffff" strokeWidth="26" strokeLinecap="round" fill="none" />
            <circle cx="202" cy="268" r="12" fill={`url(#${id}skin)`} />
            <rect x="184" y="262" width="44" height="56" rx="8" fill="#ffd23f" stroke="#e08a00" strokeWidth="3" />
            <rect x="192" y="274" width="28" height="4" rx="2" fill="#fff" />
            <rect x="192" y="284" width="22" height="4" rx="2" fill="#fff" />
            <path d="M193 298l6 6 12-12" stroke="#3cc46a" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
          {/* free arm: upper arm + forearm, so the hand can open and explain */}
          <g ref={upper}>
            <path d="M62 200q-8 20-10 38" stroke="#ffffff" strokeWidth="26" strokeLinecap="round" fill="none" />
            <g ref={fore}>
              <path d="M52 238q-3 16-5 30" stroke="#ffffff" strokeWidth="24" strokeLinecap="round" fill="none" />
              <circle cx="47" cy="268" r="12" fill={`url(#${id}skin)`} />
              <path d="M40 262q-4-6 0-10" stroke="#f2bf95" strokeWidth="5" strokeLinecap="round" fill="none" />
            </g>
          </g>
          {/* stethoscope */}
          <path d="M96 152c-8 40 0 70 24 76 24-6 32-36 24-76" stroke="#17206b" strokeWidth="5" fill="none" />
          <circle cx="120" cy="232" r="11" fill="#9aa6d6" stroke="#17206b" strokeWidth="4" />
          <g ref={head}>
            {/* hijab + face */}
            <path d="M54 110c0-48 30-80 66-80s66 32 66 80c0 30-10 50-22 62H76c-12-12-22-32-22-62Z" fill={`url(#${id}hijab)`} />
            <ellipse cx="120" cy="104" rx="44" ry="50" fill={`url(#${id}skin)`} />
            <path d="M76 86c6-30 24-44 44-44s38 14 44 44c-12-14-28-20-44-20s-32 6-44 20Z" fill={`url(#${id}hijab)`} />
            {/* eyes */}
            <g ref={eyes}>
              <ellipse cx="102" cy="104" rx="8" ry="10" fill="#fff" />
              <ellipse cx="138" cy="104" rx="8" ry="10" fill="#fff" />
              <g ref={pupils}>
                <circle cx="103" cy="106" r="5.5" fill="#3a2a1a" />
                <circle cx="139" cy="106" r="5.5" fill="#3a2a1a" />
                <circle cx="105" cy="103" r="2" fill="#fff" />
                <circle cx="141" cy="103" r="2" fill="#fff" />
              </g>
            </g>
            <path ref={brows} d="M92 88q10-6 18 0M130 88q10-6 18 0" stroke="#3a2a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="92" cy="122" rx="8" ry="5" fill="#ff8fa8" opacity="0.5" />
            <ellipse cx="148" cy="122" rx="8" ry="5" fill="#ff8fa8" opacity="0.5" />
            {/* mouth: talks with her own voice; a warm smile while she listens */}
            <g transform="translate(120 132)">
              <path ref={mouthClosed} d={happy ? 'M-14-4q14 16 28 0' : 'M-12-3q12 11 24 0'} stroke="#7a1638" strokeWidth="4" fill={happy ? '#7a1638' : 'none'} strokeLinecap="round" />
              <g ref={mouthOpen} style={{ display: 'none' }} data-mouth="doctor">
                <ellipse ref={mouthInner} cx="0" cy="1" rx="9" ry="6" fill="#7a1638" />
                <ellipse ref={mouthTongue} cx="0" cy="4" rx="5" ry="2" fill="#ff8fa8" />
              </g>
            </g>
            {/* head mirror */}
            <circle cx="120" cy="52" r="12" fill="#dfe8ff" stroke="#9aa6d6" strokeWidth="3" />
            <circle cx="120" cy="52" r="5" fill="#fff" />
          </g>
        </g>
      </svg>
    </div>
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
      animate={talking && mood === 'idle' ? { y: [0, -5, 0], rotate: [0, 2, -2, 0], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } } : anim[mood]}
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
