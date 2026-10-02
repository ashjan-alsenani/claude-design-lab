import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AleenActor, CapsuleHero, Doctor, type AleenMood, type CapsuleMood } from './actors'
import { BaktoroArt } from '../art/Baktoro'
import { Capsule, CheckBadge, Cloud, CrossBadge, Germ, Heart, MiniShield, Sparkle, Star } from '../art/objects'
import { Icon } from '../art/icons'

/* ------------------------------------------------------------------ */
/*  Script                                                             */
/* ------------------------------------------------------------------ */

export type Speaker = 'aleen' | 'doctor' | 'capsule'
export type Line = { at: number; who: Speaker; text: string; mood?: AleenMood }
export type SceneProps = { t: number; talking: Speaker | null; mood: AleenMood; reduced: boolean }
export type FilmScene = { key: string; chapter: string; emoji: string; dur: number; lines: Line[]; Comp: (p: SceneProps) => ReactNode }

export const SPEAKER_NAME: Record<Speaker, string> = { aleen: 'ألين', doctor: 'الدكتورة هدى', capsule: 'كبسول' }

/* ------------------------------------------------------------------ */
/*  Shared stage pieces (stage is 1280 × 720)                          */
/* ------------------------------------------------------------------ */

function At({ x, y, children, z = 2, className = '' }: { x: number; y: number; children: ReactNode; z?: number; className?: string }) {
  return (
    <div className={`at ${className}`} style={{ left: x, top: y, zIndex: z }}>
      {children}
    </div>
  )
}

/** Aleen standing on the right of the stage, feet on the ground line. */
function AleenSpot({ mood, talking, reduced, x = 960, h = 470, enter = false }: { mood: AleenMood; talking: boolean; reduced: boolean; x?: number; h?: number; enter?: boolean }) {
  return (
    <motion.div
      className="at"
      style={{ left: x, top: 690 - h, zIndex: 5 }}
      initial={enter ? { x: 360, opacity: 0 } : false}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', duration: 1.4, bounce: 0.2 }}
    >
      {enter && !reduced && (
        <motion.div className="walk-bob" animate={{ y: [0, -10, 0, -10, 0, -10, 0] }} transition={{ duration: 1.3 }}>
          <AleenActor mood={mood} talking={talking} height={h} reduced={reduced} />
        </motion.div>
      )}
      {(!enter || reduced) && <AleenActor mood={mood} talking={talking} height={h} reduced={reduced} />}
    </motion.div>
  )
}

function Pop({ show, children, delay = 0, className = '' }: { show: boolean; children: ReactNode; delay?: number; className?: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', bounce: 0.5, duration: 0.6, delay }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Floaties({ n = 10, kind = 'mix' }: { n?: number; kind?: 'mix' | 'stars' | 'cells' }) {
  return (
    <div className="floaties" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="floaty"
          style={{ left: `${(i * 37 + 5) % 96}%`, top: `${(i * 53 + 7) % 80}%`, ['--d' as string]: `${4 + (i % 4)}s`, ['--dl' as string]: `${-i * 0.7}s` }}
        >
          {kind === 'cells' ? (
            <span className="blood-cell" style={{ width: 40 + (i % 3) * 18, height: 40 + (i % 3) * 18 }} />
          ) : kind === 'stars' || i % 3 === 0 ? (
            <Star size={20 + (i % 3) * 10} />
          ) : i % 3 === 1 ? (
            <Capsule size={34 + (i % 2) * 14} />
          ) : (
            <Sparkle size={18} color="#fff" className="twinkle" />
          )}
        </span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  1 · Title                                                          */
/* ------------------------------------------------------------------ */

function S1({ t, talking, mood, reduced }: SceneProps) {
  return (
    <div className="film-bg bg-sky">
      <div className="film-clouds">
        <span className="cloud-a">
          <Cloud width={260} />
        </span>
        <span className="cloud-b">
          <Cloud width={200} />
        </span>
      </div>
      <Floaties n={12} />
      <At x={70} y={110} z={4}>
        <motion.h2
          className="film-title"
          initial={{ opacity: 0, y: 40, rotateX: -60 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: 'spring', bounce: 0.45, duration: 1, delay: 0.3 }}
        >
          كيفية استخدام
          <br />
          <span className="ft-accent">المضادات الحيوية</span>
          <br />
          بشكل صحيح؟
        </motion.h2>
        <Pop show={t >= 2.2} className="film-subtitle">
          وما دورنا في الحد من مقاومة البكتيريا؟ 🛡️
        </Pop>
      </At>
      <At x={760} y={110} z={3}>
        <motion.div animate={{ rotate: [0, 10, -6, 0], y: [0, -14, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <MiniShield size={130} gold className="glow-pulse" />
        </motion.div>
      </At>
      <AleenSpot mood={mood} talking={talking === 'aleen'} reduced={reduced} enter />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  2 · Microscopic world                                              */
/* ------------------------------------------------------------------ */

const HARMFUL = [
  { x: 120, y: 330, at: 6.3 },
  { x: 330, y: 200, at: 7.4 },
  { x: 470, y: 400, at: 8.5 },
]
const FRIENDLY = [
  { x: 640, y: 150, hue: 'blue' as const },
  { x: 60, y: 120, hue: 'purple' as const },
  { x: 700, y: 420, hue: 'pink' as const },
  { x: 250, y: 480, hue: 'orange' as const },
]

function Zap({ x, y }: { x: number; y: number }) {
  return (
    <motion.div className="zap" style={{ left: x, top: y }} initial={{ scale: 0.3, opacity: 1 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: 0.7 }}>
      ✨
    </motion.div>
  )
}

function S2({ t, talking, mood, reduced }: SceneProps) {
  const capX = t < 4 ? -260 : t < 6 ? 140 : t < 7.4 ? 40 : t < 8.5 ? 210 : 330
  const capY = t < 6 ? 260 : t < 7.4 ? 300 : t < 8.5 ? 170 : 340
  return (
    <div className="film-bg bg-body">
      <Floaties n={14} kind="cells" />
      <div className="micro-label">🔬 داخل جسم الإنسان</div>
      {FRIENDLY.map((f, i) => (
        <At key={i} x={f.x} y={f.y}>
          <div className="wander" style={{ ['--wd' as string]: `${3 + i}s` }}>
            <Germ size={74} hue={f.hue} />
          </div>
        </At>
      ))}
      {HARMFUL.map((h, i) =>
        t < h.at ? (
          <At key={i} x={h.x} y={h.y} z={3}>
            <div className="wander" style={{ ['--wd' as string]: `${2 + i * 0.5}s` }}>
              <BaktoroArt mood={t > 5 ? 'shocked' : 'smug'} size={110} />
            </div>
          </At>
        ) : (
          t < h.at + 0.8 && <Zap key={`z${i}`} x={h.x + 30} y={h.y + 30} />
        ),
      )}
      <motion.div className="at" style={{ zIndex: 4 }} animate={{ left: capX, top: capY }} transition={{ type: 'spring', duration: 0.8, bounce: 0.3 }}>
        <CapsuleHero mood={t >= 6 && t < 9 ? 'fight' : t >= 9 ? 'happy' : 'idle'} talking={talking === 'capsule'} size={190} />
      </motion.div>
      <Pop show={t >= 9.2} className="badge-float bf-left">
        <CheckBadge size={44} /> طُردت البكتيريا الضارة!
      </Pop>
      <AleenSpot mood={mood} talking={talking === 'aleen'} reduced={reduced} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  3 · Bacteria vs viruses                                            */
/* ------------------------------------------------------------------ */

function S3({ t, talking, mood, reduced }: SceneProps) {
  const virusMood: CapsuleMood = t >= 6.5 ? 'confused' : t >= 5 ? 'fight' : 'idle'
  return (
    <div className="film-bg bg-violet">
      <Floaties n={8} />
      <div className="vs-panel panel-a">
        <p className="panel-title">عدوى بكتيرية 🦠</p>
        <div className="panel-stage">
          {t < 2.6 ? (
            <div className="wander" style={{ ['--wd' as string]: '2s' }}>
              <BaktoroArt mood={t > 1.6 ? 'shocked' : 'smug'} size={120} />
            </div>
          ) : (
            t < 3.4 && <Zap x={40} y={40} />
          )}
          <motion.div className="panel-cap" animate={{ x: t >= 1.2 && t < 2.8 ? -70 : 0 }} transition={{ type: 'spring', duration: 0.5 }}>
            <CapsuleHero mood={t >= 1.2 && t < 2.8 ? 'fight' : t >= 2.8 ? 'happy' : 'idle'} size={130} talking={talking === 'capsule' && t < 5} />
          </motion.div>
        </div>
        <Pop show={t >= 2.8} className="verdict yes">
          <CheckBadge size={40} /> المضاد الحيوي يعمل
        </Pop>
      </div>
      <div className="vs-panel panel-b">
        <p className="panel-title">زكام وإنفلونزا 🤧</p>
        <div className="panel-stage">
          <motion.div className="wander" style={{ ['--wd' as string]: '2.4s' }} animate={t >= 6 ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.5 }}>
            <Icon name="virus" size={130} />
          </motion.div>
          <motion.div
            className="panel-cap"
            animate={{ x: t >= 5 && t < 6 ? -80 : t >= 6 && t < 6.6 ? 30 : 0, rotate: t >= 6 && t < 6.6 ? 25 : 0 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.6 }}
          >
            <CapsuleHero mood={virusMood} size={130} talking={talking === 'capsule' && t >= 5} />
          </motion.div>
        </div>
        <Pop show={t >= 6.6} className="verdict no">
          <CrossBadge size={40} /> لا يعالج الفيروسات
        </Pop>
      </div>
      <AleenSpot mood={mood} talking={talking === 'aleen'} reduced={reduced} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  4 · Feeling sick → the doctor                                      */
/* ------------------------------------------------------------------ */

function S4({ t, talking, mood, reduced }: SceneProps) {
  return (
    <div className="film-bg bg-room">
      <div className="room-window">
        <span className="moon">🌙</span>
        <span className="tw-star twinkle">✦</span>
      </div>
      <div className="room-bed" />
      <div className="room-drawer">
        <span>🗄️</span>
      </div>
      {/* thinking about leftover antibiotics */}
      <AnimatePresence>
        {t >= 1 && t < 6.2 && (
          <motion.div
            className="thought"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4, transition: { duration: 0.3 } }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <Icon name="leftover" size={96} />
            <span className="q">؟</span>
            {t >= 5.2 && (
              <motion.span className="thought-x" initial={{ scale: 0.4, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6 }}>
                <CrossBadge size={70} />
              </motion.span>
            )}
            <i className="dot d1" />
            <i className="dot d2" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* doctor appears through a sparkle portal */}
      <AnimatePresence>
        {t >= 4.6 && (
          <motion.div
            className="at"
            style={{ left: 120, top: 260, zIndex: 4 }}
            initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.45, duration: 0.8 }}
          >
            <span className="portal-ring" />
            <Doctor talking={talking === 'doctor'} height={420} happy={t >= 11} />
          </motion.div>
        )}
      </AnimatePresence>
      <Pop show={t >= 7.5} className="rx-badge">
        📋 فقط بوصفة أو نصيحة من الطبيب
      </Pop>
      <AleenSpot mood={mood} talking={talking === 'aleen'} reduced={reduced} x={900} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  5 · How to use antibiotics correctly                               */
/* ------------------------------------------------------------------ */

const RULES = [
  { icon: '💊', text: 'الجرعة الصحيحة', ok: true, at: 1.6 },
  { icon: '⏰', text: 'الوقت الصحيح', ok: true, at: 3.2 },
  { icon: '📋', text: 'تعليمات الطبيب', ok: true, at: 4.8 },
  { icon: '🗄️', text: 'لا نستخدم البقايا', ok: false, at: 6.4 },
  { icon: '🤝', text: 'لا نشارك الدواء', ok: false, at: 8 },
]

function S5({ t, talking, mood, reduced }: SceneProps) {
  return (
    <div className="film-bg bg-sun">
      <Floaties n={10} kind="stars" />
      <At x={30} y={300} z={4}>
        <Doctor talking={talking === 'doctor'} height={380} happy />
      </At>
      <div className="rules-grid">
        {RULES.map((r, i) => (
          <Pop key={i} show={t >= r.at} className={`rule-card ${r.ok ? 'ok' : 'no'}`}>
            <span className="rule-icon">{r.icon}</span>
            <span className="rule-text">{r.text}</span>
            <span className="rule-mark">{r.ok ? <CheckBadge size={40} /> : <CrossBadge size={40} />}</span>
          </Pop>
        ))}
      </div>
      <AleenSpot mood={mood} talking={talking === 'aleen'} reduced={reduced} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  6 · Antibiotic resistance                                          */
/* ------------------------------------------------------------------ */

const LENS = Array.from({ length: 12 }, (_, i) => {
  const a = i * 2.39996
  const r = 60 + ((i * 47) % 150)
  return { i, x: 260 + Math.cos(a) * r, y: 250 + Math.sin(a) * r * 0.85, hue: (['green', 'blue', 'orange', 'pink'] as const)[i % 4] }
})
const SURVIVOR = 5
const CLONES = [
  { x: 150, y: 150 },
  { x: 360, y: 120 },
  { x: 420, y: 300 },
  { x: 120, y: 340 },
  { x: 290, y: 400 },
]

function S6({ t, talking, mood, reduced }: SceneProps) {
  const s = LENS[SURVIVOR]
  return (
    <div className="film-bg bg-lab">
      <Floaties n={8} />
      <div className="lens-big">
        <div className="lens-grid" />
        {LENS.map((g) => {
          const gone = t >= 4 && g.i !== SURVIVOR
          return (
            <motion.div
              key={g.i}
              className="lens-germ"
              style={{ left: g.x, top: g.y }}
              animate={gone ? { scale: 0.1, opacity: 0, rotate: 120 } : { scale: g.i === SURVIVOR && t >= 6.5 ? 1.3 : 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: gone ? (g.i % 4) * 0.12 : 0 }}
            >
              <div className="wander" style={{ ['--wd' as string]: `${2.4 + (g.i % 3)}s` }}>
                <Germ size={64} hue={g.i === SURVIVOR && t >= 6.5 ? 'purple' : g.hue} mood={t >= 2 && t < 4 ? 'surprised' : 'happy'} shield={g.i === SURVIVOR && t >= 6.5} />
              </div>
              {g.i === SURVIVOR && t >= 6.5 && <span className="glow-shield" />}
            </motion.div>
          )
        })}
        <AnimatePresence>
          {t >= 2 && t < 4.4 &&
            [0, 1, 2, 3, 4, 5].map((k) => (
              <motion.div
                key={k}
                className="lens-pill"
                initial={{ x: 60 + k * 70, y: -80, rotate: -30, opacity: 0 }}
                animate={{ y: 160 + (k % 3) * 70, rotate: 300, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ duration: reduced ? 0.1 : 1.1, delay: k * 0.1 }}
              >
                <Capsule size={52} />
              </motion.div>
            ))}
        </AnimatePresence>
        {t >= 9 &&
          CLONES.map((c, k) => (
            <motion.div
              key={k}
              className="lens-germ"
              initial={{ left: s.x, top: s.y, scale: 0.3, opacity: 0 }}
              animate={{ left: c.x, top: c.y, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.9, delay: k * 0.12 }}
            >
              <div className="wander" style={{ ['--wd' as string]: `${2 + (k % 3)}s` }}>
                <Germ size={64} hue="purple" shield />
              </div>
              <span className="glow-shield" />
            </motion.div>
          ))}
        <div className="lens-shine" />
      </div>
      <div className="res-steps">
        {[
          { at: 0.3, t: '🦠 بكتيريا كثيرة' },
          { at: 2, t: '💊 هجوم المضاد' },
          { at: 4, t: '💨 اختفى معظمها… وواحدة نجت' },
          { at: 6.5, t: '🛡️ صنعت درعًا لامعًا' },
          { at: 9, t: '➕ تكاثرت البكتيريا المقاومة' },
        ].map((st, i) => (
          <Pop key={i} show={t >= st.at} className={`res-step ${i === 4 ? 'hot' : ''}`}>
            {st.t}
          </Pop>
        ))}
      </div>
      <AnimatePresence>
        {t >= 11.5 && (
          <motion.div className="at" style={{ left: 600, top: 330, zIndex: 6 }} initial={{ x: -200, opacity: 0 }} animate={{ x: [-200, -40, 10], opacity: 1 }} transition={{ duration: 1.2, times: [0, 0.6, 1] }}>
            <CapsuleHero mood={t >= 12.4 ? 'worried' : 'fight'} talking={talking === 'capsule'} size={150} />
          </motion.div>
        )}
      </AnimatePresence>
      <Pop show={t >= 12.6} className="warn-badge">
        ⚠️ المضاد الحيوي أصبح أقل فاعلية
      </Pop>
      <AleenSpot mood={mood} talking={talking === 'aleen'} reduced={reduced} x={990} h={440} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  7 · How we all help                                                */
/* ------------------------------------------------------------------ */

const HELP = [
  { icon: '🩺', text: 'المضادات الحيوية فقط بإرشاد طبي' },
  { icon: '💊', text: 'نتبع التعليمات الموصوفة بدقة' },
  { icon: '🚫', text: 'لا نشارك المضادات الحيوية أبدًا' },
  { icon: '🚫', text: 'لا نستخدم البقايا دون استشارة' },
  { icon: '🧼', text: 'نغسل أيدينا باستمرار' },
  { icon: '💉', text: 'اللقاحات والنظافة تمنع العدوى' },
]

function S7({ t, talking, mood, reduced }: SceneProps) {
  return (
    <div className="film-bg bg-park">
      <Floaties n={10} />
      <div className="help-hearts" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ left: `${20 + i * 25}%`, ['--d' as string]: `${8 + i * 2}s`, ['--dl' as string]: `${-i * 3}s` }}>
            <Heart size={30} />
          </span>
        ))}
      </div>
      <At x={20} y={330} z={4}>
        <Doctor talking={talking === 'doctor'} height={350} happy />
      </At>
      <div className="help-grid">
        {HELP.map((h, i) => (
          <Pop key={i} show={t >= 1.2 + i * 1.3} className="help-card">
            <span className="help-icon">{h.icon}</span>
            <span>{h.text}</span>
          </Pop>
        ))}
      </div>
      <AleenSpot mood={mood} talking={talking === 'aleen'} reduced={reduced} x={1000} h={440} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  8 · Finale                                                         */
/* ------------------------------------------------------------------ */

function S8({ t, talking, mood, reduced }: SceneProps) {
  return (
    <div className="film-bg bg-gold">
      <div className="gold-rays" />
      <Floaties n={16} kind="stars" />
      <div className="finale-icons" aria-hidden>
        {['🩺', '💊', '🧼', '💉', '❤️', '⭐', '🛡️', '✨'].map((e, i) => (
          <span key={i} style={{ ['--k' as string]: i }}>
            {e}
          </span>
        ))}
      </div>
      <motion.h2 className="finale-title" initial={{ opacity: 0, scale: 0.6, y: -30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.5, duration: 1, delay: 0.3 }}>
        معاً نحافظ على فعالية المضادات الحيوية
      </motion.h2>
      <Pop show={t >= 4.5} className="finale-sub">
        الاستخدام الصحيح اليوم يساعدنا على حماية فعالية المضادات الحيوية للمستقبل.
      </Pop>
      <At x={70} y={300} z={4}>
        <Doctor talking={talking === 'doctor'} height={360} happy />
      </At>
      <motion.div className="at shield-stage" style={{ left: 390, top: 250, zIndex: 3 }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4, duration: 1, delay: 1.2 }}>
        <div className="big-glow-shield">
          <MiniShield size={340} gold className="glow-pulse" />
        </div>
        <div className="shield-hero">
          <CapsuleHero mood="happy" size={170} />
        </div>
      </motion.div>
      <At x={700} y={540} z={4}>
        <div className="friend-row">
          {(['blue', 'pink', 'orange'] as const).map((h, i) => (
            <div key={h} className="wander" style={{ ['--wd' as string]: `${1.6 + i * 0.4}s` }}>
              <Germ size={64} hue={h} />
            </div>
          ))}
        </div>
      </At>
      <AleenSpot mood={mood} talking={talking === 'aleen'} reduced={reduced} x={1010} h={430} />
      <div className="confetti-css" aria-hidden>
        {Array.from({ length: reduced ? 0 : 28 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 37) % 100}%`, ['--c' as string]: ['#ffd23f', '#ff8fc7', '#5ec8ff', '#7be3b0', '#a46bff'][i % 5], ['--d' as string]: `${3 + (i % 5) * 0.6}s`, ['--dl' as string]: `${-(i % 7) * 0.5}s` }} />
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export const FILM: FilmScene[] = [
  {
    key: 'intro',
    chapter: 'البداية',
    emoji: '🎬',
    dur: 8,
    Comp: S1,
    lines: [{ at: 0.6, who: 'aleen', text: 'مرحبًا! أنا ألين 👋 هيا نتعلم معًا كيف نستخدم المضادات الحيوية بشكل صحيح!', mood: 'wave' }],
  },
  {
    key: 'micro',
    chapter: 'عالم صغير',
    emoji: '🔬',
    dur: 12,
    Comp: S2,
    lines: [
      { at: 0.3, who: 'aleen', text: 'واو! انظروا… هذا عالم صغير جدًا داخل أجسامنا!', mood: 'surprised' },
      { at: 4.2, who: 'capsule', text: 'أنا كبسول، المضاد الحيوي! أساعد الجسم في محاربة البكتيريا الضارة.' },
      { at: 9.2, who: 'aleen', text: 'رائع يا كبسول! 🎉', mood: 'cheer' },
    ],
  },
  {
    key: 'virus',
    chapter: 'بكتيريا أم فيروس؟',
    emoji: '🤧',
    dur: 11,
    Comp: S3,
    lines: [
      { at: 0.3, who: 'capsule', text: 'أنا أعالج بعض أنواع العدوى البكتيرية…' },
      { at: 4.8, who: 'capsule', text: 'لكنني لا أعمل ضد الفيروسات، مثل الزكام والإنفلونزا!' },
      { at: 8.6, who: 'aleen', text: 'فهمت! الزكام لا يحتاج مضادًا حيويًا.', mood: 'nod' },
    ],
  },
  {
    key: 'doctor',
    chapter: 'اسأل الطبيب',
    emoji: '🩺',
    dur: 13,
    Comp: S4,
    lines: [
      { at: 0.4, who: 'aleen', text: 'أشعر بالتعب… هل آخذ الدواء القديم من الدرج؟ 🤔', mood: 'sick' },
      { at: 5, who: 'doctor', text: 'لا يا ألين! المضاد الحيوي يُستخدم فقط عندما يصفه الطبيب أو المختص الصحي.', mood: 'surprised' },
      { at: 10.6, who: 'aleen', text: 'شكرًا يا دكتورة هدى! سأسأل الطبيب دائمًا.', mood: 'happy' },
    ],
  },
  {
    key: 'rules',
    chapter: 'الاستخدام الصحيح',
    emoji: '💊',
    dur: 13,
    Comp: S5,
    lines: [
      { at: 0.3, who: 'doctor', text: 'إليكِ الطريقة الصحيحة: الجرعة الصحيحة، في الوقت الصحيح، وحسب تعليمات الطبيب.', mood: 'point' },
      { at: 6.2, who: 'aleen', text: 'ولا نستخدم بقايا الدواء القديم، ولا نشارك دواءنا مع أحد!', mood: 'point' },
      { at: 10.6, who: 'doctor', text: 'أحسنتِ يا ألين!', mood: 'happy' },
    ],
  },
  {
    key: 'resist',
    chapter: 'مقاومة البكتيريا',
    emoji: '🛡️',
    dur: 16,
    Comp: S6,
    lines: [
      { at: 0.3, who: 'aleen', text: 'والآن… ما هي مقاومة البكتيريا؟', mood: 'think' },
      { at: 2.2, who: 'capsule', text: 'هاجمتُ البكتيريا فاختفى معظمها… لكن واحدة نجت!', mood: 'surprised' },
      { at: 6.6, who: 'aleen', text: 'أوه لا! صنعت لنفسها درعًا لامعًا… ثم تكاثرت!', mood: 'worried' },
      { at: 11.6, who: 'capsule', text: 'عندما تقاوم البكتيريا، قد أصبح أقل فاعلية ضدها.', mood: 'worried' },
    ],
  },
  {
    key: 'help',
    chapter: 'كيف نساعد؟',
    emoji: '🧼',
    dur: 14,
    Comp: S7,
    lines: [
      { at: 0.3, who: 'doctor', text: 'كلنا نستطيع أن نساعد في الحد من مقاومة البكتيريا!', mood: 'cheer' },
      { at: 4.6, who: 'aleen', text: 'نستخدم المضاد فقط بإرشاد طبي، ونتبع التعليمات، ولا نشاركه، ولا نستخدم البقايا!', mood: 'cheer' },
      { at: 10.2, who: 'doctor', text: 'ونغسل أيدينا، ونأخذ اللقاحات المناسبة لنمنع العدوى.', mood: 'nod' },
    ],
  },
  {
    key: 'finale',
    chapter: 'معًا!',
    emoji: '🌟',
    dur: 13,
    Comp: S8,
    lines: [
      { at: 0.6, who: 'aleen', text: 'معاً نحافظ على فعالية المضادات الحيوية!', mood: 'cheer' },
      { at: 4.6, who: 'doctor', text: 'الاستخدام الصحيح اليوم يساعدنا على حماية فعالية المضادات الحيوية للمستقبل.', mood: 'happy' },
      { at: 10.4, who: 'capsule', text: 'إلى اللقاء يا أبطال! 💪', mood: 'wave' },
    ],
  },
]

export const FILM_STARTS = FILM.reduce<number[]>((acc, _sc, i) => [...acc, i === 0 ? 0 : acc[i - 1] + FILM[i - 1].dur], [])
export const FILM_TOTAL = FILM.reduce((a, sc) => a + sc.dur, 0)
