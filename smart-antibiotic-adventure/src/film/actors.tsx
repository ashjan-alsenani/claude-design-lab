import { useId } from 'react'
import { motion, AnimatePresence, type TargetAndTransition } from 'motion/react'
import aleenSrc from '../assets/aleen.webp'
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

export function AleenActor({
  mood = 'idle',
  talking = false,
  height = 420,
  reduced = false,
}: {
  mood?: AleenMood
  talking?: boolean
  height?: number
  reduced?: boolean
}) {
  const width = Math.round(height * 0.392)
  const body = talking && (mood === 'idle' || mood === 'point' || mood === 'nod') ? BODY.talk : BODY[mood]
  const emote = EMOTE[mood]
  return (
    <div className="actor aleen-actor" style={{ width, height }}>
      <div className="actor-shadow" />
      <motion.div
        key={mood}
        className="aleen-body"
        animate={reduced ? undefined : body}
        style={{ transformOrigin: '50% 100%' }}
      >
        <img src={aleenSrc} alt="" width={width} height={height} draggable={false} />
      </motion.div>

      {/* talking: animated voice waves beside her face */}
      {talking && (
        <span className="voice-waves" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      )}

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

      {/* mood props */}
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

/* ------------------------------------------------------------------ */
/*  Dr. Huda — friendly doctor (fully drawn, so her mouth can talk)    */
/* ------------------------------------------------------------------ */

export function Doctor({ talking = false, height = 400, happy = false }: { talking?: boolean; height?: number; happy?: boolean }) {
  const id = useId()
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
          <circle cx="103" cy="106" r="5.5" fill="#3a2a1a" />
          <circle cx="139" cy="106" r="5.5" fill="#3a2a1a" />
          <circle cx="105" cy="103" r="2" fill="#fff" />
          <circle cx="141" cy="103" r="2" fill="#fff" />
        </g>
        <path d="M92 88q10-6 18 0M130 88q10-6 18 0" stroke="#3a2a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="92" cy="122" rx="8" ry="5" fill="#ff8fa8" opacity="0.5" />
        <ellipse cx="148" cy="122" rx="8" ry="5" fill="#ff8fa8" opacity="0.5" />
        {/* mouth: talks */}
        <g transform="translate(120 132)">
          {talking ? (
            <ellipse className="mouth-talk" cx="0" cy="0" rx="9" ry="7" fill="#7a1638" />
          ) : (
            <path d={happy ? 'M-14-4q14 16 28 0' : 'M-11-2q11 10 22 0'} stroke="#7a1638" strokeWidth="4" fill={happy ? '#7a1638' : 'none'} strokeLinecap="round" />
          )}
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

export function CapsuleHero({ mood = 'idle', talking = false, size = 200, shielded = false }: { mood?: CapsuleMood; talking?: boolean; size?: number; shielded?: boolean }) {
  const id = useId()
  const anim: Record<CapsuleMood, TargetAndTransition> = {
    idle: { y: [0, -10, 0], rotate: [0, 3, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
    fight: { x: [0, 30, 0], rotate: [0, -8, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.3 } },
    confused: { rotate: [0, -10, 10, 0], y: [0, -6, 0], transition: { duration: 1.4, repeat: Infinity } },
    worried: { x: [0, -4, 4, -4, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.6 } },
    happy: { y: [0, -30, 0], rotate: [0, 360], transition: { duration: 1.1, repeat: Infinity, repeatDelay: 0.6 } },
  }
  return (
    <motion.div className="actor capsule-hero" style={{ width: size, height: size }} animate={anim[mood]} key={mood}>
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
          {talking ? (
            <ellipse className="mouth-talk" rx="9" ry="7" fill="#7a1638" />
          ) : mood === 'worried' || mood === 'confused' ? (
            <path d="M-10 4q10-8 20 0" stroke="#17206b" strokeWidth="4" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M-12-2q12 14 24 0" stroke="#17206b" strokeWidth="4" fill="#7a1638" strokeLinecap="round" />
          )}
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
