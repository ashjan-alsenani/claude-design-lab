import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AleenActor, CapsuleHero, Doctor, type AleenMood, type CapsuleMood } from './actors'
import { buildLines, sceneLength, SCENE_DUR, SPEAKER_NAME, type Heard, type Look, type Speaker, type Speech, type TimedLine } from './timeline'
import { BaktoroArt } from '../art/Baktoro'
import { Capsule, CheckBadge, Cloud, CrossBadge, Germ, Heart, MiniShield, Sparkle, Star } from '../art/objects'
import { Icon } from '../art/icons'

/* ------------------------------------------------------------------ */
/*  Script                                                             */
/* ------------------------------------------------------------------ */

export type SceneProps = {
  t: number
  talking: Speaker | null
  mood: AleenMood
  reduced: boolean
  /** each character's own line (null unless that character is speaking) */
  sp: Record<Speaker, Speech>
  /** the line each character is hearing from someone else (they listen and react) */
  heard: Record<Speaker, Heard>
  /** where Aleen looks right now */
  aleenLook: Look
  /** where Dr. Huda looks right now */
  docLook: 'aleen' | 'viewer' | 'visual'
}
export type FilmScene = { key: string; chapter: string; emoji: string; dur: number; lines: TimedLine[]; Comp: (p: SceneProps) => ReactNode }
export { SPEAKER_NAME }
export type { Speaker }

/* Beats are anchored to the dialogue: `cue(scene, line, s)` = when that line
   reaches `s` seconds (the spoken word that introduces the visual). */
const LINES = Object.fromEntries(Object.keys(SCENE_DUR).map((k) => [k, buildLines(k)]))
function cue(scene: string, id: string, offset = 0) {
  const l = LINES[scene].find((x) => x.id === id)
  if (!l) throw new Error(`no line ${id}`)
  return l.start + offset
}

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
function AleenSpot({
  mood,
  reduced,
  sp,
  heard,
  aleenLook,
  visual,
  x = 960,
  h = 470,
  enter = false,
}: Pick<SceneProps, 'mood' | 'reduced' | 'sp' | 'heard' | 'aleenLook'> & {
  /** where this scene's visual is, as a gaze offset */
  visual?: { x: number; y: number }
  x?: number
  h?: number
  enter?: boolean
}) {
  const actor = <AleenActor mood={mood} height={h} reduced={reduced} speech={sp.aleen} heard={heard.aleen} look={aleenLook} visual={visual} />
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
          {actor}
        </motion.div>
      )}
      {(!enter || reduced) && actor}
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

function S1({ t, mood, reduced, sp, heard, aleenLook }: SceneProps) {
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
      <AleenSpot mood={mood} reduced={reduced} sp={sp} heard={heard} aleenLook={aleenLook} enter />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  2 · Microscopic world                                              */
/* ------------------------------------------------------------------ */

// Kabsool arrives just before he speaks and zaps the harmful bacteria on «…محاربة البكتيريا الضارة»
const M_ENTER = cue('micro', 'micro-2', -0.6)
const M_FIGHT = cue('micro', 'micro-2', 4.6)
const HARMFUL = [
  { x: 120, y: 330, at: cue('micro', 'micro-2', 5.3) },
  { x: 330, y: 200, at: cue('micro', 'micro-2', 5.95) },
  { x: 470, y: 400, at: cue('micro', 'micro-2', 6.6) },
]
const M_DONE = HARMFUL[2].at + 0.6
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

function S2({ t, talking, mood, reduced, sp, heard, aleenLook }: SceneProps) {
  const [z1, z2, z3] = HARMFUL.map((h) => h.at)
  const capX = t < M_ENTER ? -260 : t < M_FIGHT ? 140 : t < z1 ? 40 : t < z2 ? 210 : t < z3 ? 330 : 330
  const capY = t < M_FIGHT ? 260 : t < z1 ? 300 : t < z2 ? 170 : 340
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
              <BaktoroArt mood={t > M_FIGHT - 0.8 ? 'shocked' : 'smug'} size={110} />
            </div>
          </At>
        ) : (
          t < h.at + 0.8 && <Zap key={`z${i}`} x={h.x + 30} y={h.y + 30} />
        ),
      )}
      <motion.div className="at" style={{ zIndex: 4 }} animate={{ left: capX, top: capY }} transition={{ type: 'spring', duration: 0.8, bounce: 0.3 }}>
        <CapsuleHero mood={t >= M_FIGHT && t < M_DONE ? 'fight' : t >= M_DONE ? 'happy' : 'idle'} talking={talking === 'capsule'} speech={sp.capsule} size={190} />
      </motion.div>
      <Pop show={t >= M_DONE + 0.2} className="badge-float bf-left">
        <CheckBadge size={44} /> طُردت البكتيريا الضارة!
      </Pop>
      <AleenSpot mood={mood} reduced={reduced} sp={sp} heard={heard} aleenLook={aleenLook} visual={{ x: -2.2, y: 1 }} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  3 · Bacteria vs viruses                                            */
/* ------------------------------------------------------------------ */

// panel A on «أعالج العدوى…البكتيريا», panel B on «علاج الفيروسات»
const VA_FIGHT = cue('virus', 'virus-1', 0.5)
const VA_ZAP = cue('virus', 'virus-1', 2.2)
const VB_FIGHT = cue('virus', 'virus-2', 1.4)
const VB_BOUNCE = VB_FIGHT + 1
const VB_NO = VB_BOUNCE + 0.6

function S3({ t, talking, mood, reduced, sp, heard, aleenLook }: SceneProps) {
  const virusMood: CapsuleMood = t >= VB_NO ? 'confused' : t >= VB_FIGHT ? 'fight' : 'idle'
  return (
    <div className="film-bg bg-violet">
      <Floaties n={8} />
      <div className="vs-panel panel-a">
        <p className="panel-title">عدوى بكتيرية 🦠</p>
        <div className="panel-stage">
          {t < VA_ZAP ? (
            <div className="wander" style={{ ['--wd' as string]: '2s' }}>
              <BaktoroArt mood={t > VA_FIGHT + 0.4 ? 'shocked' : 'smug'} size={120} />
            </div>
          ) : (
            t < VA_ZAP + 0.8 && <Zap x={40} y={40} />
          )}
          <motion.div className="panel-cap" animate={{ x: t >= VA_FIGHT && t < VA_ZAP + 0.2 ? -70 : 0 }} transition={{ type: 'spring', duration: 0.5 }}>
            <CapsuleHero mood={t >= VA_FIGHT && t < VA_ZAP + 0.2 ? 'fight' : t >= VA_ZAP + 0.2 ? 'happy' : 'idle'} size={130} talking={talking === 'capsule' && sp.capsule?.id === 'virus-1'} speech={sp.capsule?.id === 'virus-1' ? sp.capsule : null} />
          </motion.div>
        </div>
        <Pop show={t >= VA_ZAP + 0.2} className="verdict yes">
          <CheckBadge size={40} /> المضاد الحيوي يعمل
        </Pop>
      </div>
      <div className="vs-panel panel-b">
        <p className="panel-title">زكام وإنفلونزا 🤧</p>
        <div className="panel-stage">
          <motion.div className="wander" style={{ ['--wd' as string]: '2.4s' }} animate={t >= VB_BOUNCE ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.5 }}>
            <Icon name="virus" size={130} />
          </motion.div>
          <motion.div
            className="panel-cap"
            animate={{ x: t >= VB_FIGHT && t < VB_BOUNCE ? -80 : t >= VB_BOUNCE && t < VB_NO ? 30 : 0, rotate: t >= VB_BOUNCE && t < VB_NO ? 25 : 0 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.6 }}
          >
            <CapsuleHero mood={virusMood} size={130} talking={talking === 'capsule' && sp.capsule?.id === 'virus-2'} speech={sp.capsule?.id === 'virus-2' ? sp.capsule : null} />
          </motion.div>
        </div>
        <Pop show={t >= VB_NO} className="verdict no">
          <CrossBadge size={40} /> لا يعالج الفيروسات
        </Pop>
      </div>
      <AleenSpot mood={mood} reduced={reduced} sp={sp} heard={heard} aleenLook={aleenLook} visual={{ x: -2.4, y: 0.6 }} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  4 · Feeling sick → the doctor                                      */
/* ------------------------------------------------------------------ */

// the leftover medicine appears on «وجدت دواءً قديمًا»; Dr. Huda arrives to say «انتظري»
const D_THOUGHT = cue('doctor', 'doctor-1', 1.7)
const D_ARRIVE = cue('doctor', 'doctor-2', -0.6)
const D_NO = cue('doctor', 'doctor-2', 0.1)
const D_RX = cue('doctor', 'doctor-3', 2.5)
const D_HAPPY = cue('doctor', 'doctor-4')

function S4({ t, mood, reduced, sp, heard, aleenLook, docLook }: SceneProps) {
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
        {t >= D_THOUGHT && t < D_NO + 0.9 && (
          <motion.div
            className="thought"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4, transition: { duration: 0.3 } }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <Icon name="leftover" size={96} />
            <span className="q">؟</span>
            {t >= D_NO && (
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
        {t >= D_ARRIVE && (
          <motion.div
            className="at"
            style={{ left: 120, top: 260, zIndex: 4 }}
            initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.45, duration: 0.8 }}
          >
            <span className="portal-ring" />
            <Doctor speech={sp.doctor} heard={heard.doctor} lookAt={docLook} height={420} happy={t >= D_HAPPY} reduced={reduced} />
          </motion.div>
        )}
      </AnimatePresence>
      <Pop show={t >= D_RX} className="rx-badge">
        📋 فقط بوصفة أو نصيحة من الطبيب
      </Pop>
      <AleenSpot mood={mood} reduced={reduced} sp={sp} heard={heard} aleenLook={aleenLook} x={900} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  5 · How to use antibiotics correctly                               */
/* ------------------------------------------------------------------ */

// each card appears on the word that names it
const RULES = [
  { icon: '💊', text: 'الجرعة الصحيحة', ok: true, at: cue('rules', 'rules-1', 3.3) },
  { icon: '⏰', text: 'الوقت الصحيح', ok: true, at: cue('rules', 'rules-1', 4.75) },
  { icon: '📋', text: 'تعليمات الطبيب', ok: true, at: cue('rules', 'rules-1', 6.5) },
  { icon: '🗄️', text: 'لا نستخدم البقايا', ok: false, at: cue('rules', 'rules-2', 0.95) },
  { icon: '🤝', text: 'لا نشارك الدواء', ok: false, at: cue('rules', 'rules-2', 3) },
]

function S5({ t, mood, reduced, sp, heard, aleenLook, docLook }: SceneProps) {
  return (
    <div className="film-bg bg-sun">
      <Floaties n={10} kind="stars" />
      <At x={30} y={300} z={4}>
        <Doctor speech={sp.doctor} heard={heard.doctor} lookAt={docLook} height={380} happy gesture="point" reduced={reduced} />
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
      <AleenSpot mood={mood} reduced={reduced} sp={sp} heard={heard} aleenLook={aleenLook} visual={{ x: -2.6, y: -1 }} />
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

// «هاجمتُ البكتيريا فاختفى معظمها… لكن واحدة بقيت» → «صنعت درعًا… وبدأت تتكاثر» → «تأثيري أضعف»
const R_KAB = cue('resist', 'resist-2', -0.7)
const R_PILLS = cue('resist', 'resist-2', 0)
const R_GONE = cue('resist', 'resist-2', 1.25)
const R_SHIELD = cue('resist', 'resist-3', 2.55)
const R_CLONES = cue('resist', 'resist-3', 4.6)
const R_FIGHT = cue('resist', 'resist-4', 0.5)
const R_WORRY = cue('resist', 'resist-4', 1.2)
const R_WARN = cue('resist', 'resist-4', 3.1)

function S6({ t, talking, mood, reduced, sp, heard, aleenLook }: SceneProps) {
  const s = LENS[SURVIVOR]
  return (
    <div className="film-bg bg-lab">
      <Floaties n={8} />
      <div className="lens-big">
        <div className="lens-grid" />
        {LENS.map((g) => {
          const gone = t >= R_GONE && g.i !== SURVIVOR
          return (
            <motion.div
              key={g.i}
              className="lens-germ"
              style={{ left: g.x, top: g.y }}
              animate={gone ? { scale: 0.1, opacity: 0, rotate: 120 } : { scale: g.i === SURVIVOR && t >= R_SHIELD ? 1.3 : 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: gone ? (g.i % 4) * 0.12 : 0 }}
            >
              <div className="wander" style={{ ['--wd' as string]: `${2.4 + (g.i % 3)}s` }}>
                <Germ size={64} hue={g.i === SURVIVOR && t >= R_SHIELD ? 'purple' : g.hue} mood={t >= R_PILLS && t < R_GONE ? 'surprised' : 'happy'} shield={g.i === SURVIVOR && t >= R_SHIELD} />
              </div>
              {g.i === SURVIVOR && t >= R_SHIELD && <span className="glow-shield" />}
            </motion.div>
          )
        })}
        <AnimatePresence>
          {t >= R_PILLS - 0.6 && t < R_GONE + 0.4 &&
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
        {t >= R_CLONES &&
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
          { at: R_PILLS - 0.6, t: '💊 هجوم المضاد' },
          { at: R_GONE, t: '💨 اختفى معظمها… وواحدة بقيت' },
          { at: R_SHIELD, t: '🛡️ صنعت درعًا لامعًا' },
          { at: R_CLONES, t: '➕ تكاثرت البكتيريا المقاومة' },
        ].map((st, i) => (
          <Pop key={i} show={t >= st.at} className={`res-step ${i === 4 ? 'hot' : ''}`}>
            {st.t}
          </Pop>
        ))}
      </div>
      <AnimatePresence>
        {t >= R_KAB && (
          <motion.div className="at" style={{ left: 640, top: 360, zIndex: 6 }} initial={{ x: -160, opacity: 0 }} animate={{ x: t >= R_FIGHT && t < R_WORRY ? -50 : 0, opacity: 1 }} transition={{ type: 'spring', duration: 0.7, bounce: 0.35 }}>
            <CapsuleHero mood={t >= R_WORRY ? 'worried' : t >= R_FIGHT || (t >= R_PILLS - 0.6 && t < R_GONE) ? 'fight' : 'idle'} talking={talking === 'capsule'} speech={sp.capsule} size={140} />
          </motion.div>
        )}
      </AnimatePresence>
      <Pop show={t >= R_WARN} className="warn-badge">
        ⚠️ المضاد الحيوي أصبح أقل فاعلية
      </Pop>
      <AleenSpot mood={mood} reduced={reduced} sp={sp} heard={heard} aleenLook={aleenLook} x={990} h={440} visual={{ x: -2.6, y: 0.8 }} />
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

// each card appears on the words that say it
const HELP_AT = [
  cue('help', 'help-2', 1.8),
  cue('help', 'help-2', 4.1),
  cue('help', 'help-3', 0.3),
  cue('help', 'help-3', 2.7),
  cue('help', 'help-4', 0),
  cue('help', 'help-4', 2.9),
]

function S7({ t, mood, reduced, sp, heard, aleenLook, docLook }: SceneProps) {
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
        <Doctor speech={sp.doctor} heard={heard.doctor} lookAt={docLook} height={350} happy gesture="point" reduced={reduced} />
      </At>
      <div className="help-grid">
        {HELP.map((h, i) => (
          <Pop key={i} show={t >= HELP_AT[i]} className="help-card">
            <span className="help-icon">{h.icon}</span>
            <span>{h.text}</span>
          </Pop>
        ))}
      </div>
      <AleenSpot mood={mood} reduced={reduced} sp={sp} heard={heard} aleenLook={aleenLook} x={1000} h={440} visual={{ x: -2.6, y: -0.8 }} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  8 · Finale                                                         */
/* ------------------------------------------------------------------ */

function S8({ t, talking, mood, reduced, sp, heard, aleenLook, docLook }: SceneProps) {
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
      <Pop show={t >= cue('finale', 'finale-2')} className="finale-sub">
        الاستخدام الصحيح اليوم يساعدنا على حماية فعالية المضادات الحيوية للمستقبل.
      </Pop>
      <At x={70} y={300} z={4}>
        <Doctor speech={sp.doctor} heard={heard.doctor} lookAt={docLook} height={360} happy reduced={reduced} />
      </At>
      <motion.div className="at shield-stage" style={{ left: 390, top: 250, zIndex: 3 }} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4, duration: 1, delay: 1.2 }}>
        <div className="big-glow-shield">
          <MiniShield size={340} gold className="glow-pulse" />
        </div>
        <div className="shield-hero">
          <CapsuleHero mood="happy" size={170} talking={talking === 'capsule'} speech={sp.capsule} />
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
      <AleenSpot mood={mood} reduced={reduced} sp={sp} heard={heard} aleenLook={aleenLook} x={1010} h={430} />
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
    dur: SCENE_DUR.intro,
    Comp: S1,
    lines: LINES.intro,
  },
  {
    key: 'micro',
    chapter: 'عالم صغير',
    emoji: '🔬',
    dur: SCENE_DUR.micro,
    Comp: S2,
    lines: LINES.micro,
  },
  {
    key: 'virus',
    chapter: 'بكتيريا أم فيروس؟',
    emoji: '🤧',
    dur: SCENE_DUR.virus,
    Comp: S3,
    lines: LINES.virus,
  },
  {
    key: 'doctor',
    chapter: 'اسأل الطبيب',
    emoji: '🩺',
    dur: SCENE_DUR.doctor,
    Comp: S4,
    lines: LINES.doctor,
  },
  {
    key: 'rules',
    chapter: 'الاستخدام الصحيح',
    emoji: '💊',
    dur: SCENE_DUR.rules,
    Comp: S5,
    lines: LINES.rules,
  },
  {
    key: 'resist',
    chapter: 'مقاومة البكتيريا',
    emoji: '🛡️',
    dur: SCENE_DUR.resist,
    Comp: S6,
    lines: LINES.resist,
  },
  {
    key: 'help',
    chapter: 'كيف نساعد؟',
    emoji: '🧼',
    dur: SCENE_DUR.help,
    Comp: S7,
    lines: LINES.help,
  },
  {
    key: 'finale',
    chapter: 'معًا!',
    emoji: '🌟',
    dur: SCENE_DUR.finale,
    Comp: S8,
    lines: LINES.finale,
  },
]

// scene length grows to fit the real recorded dialogue
FILM.forEach((sc) => (sc.dur = sceneLength(sc.dur, sc.lines)))

export const FILM_STARTS = FILM.reduce<number[]>((acc, _sc, i) => [...acc, i === 0 ? 0 : acc[i - 1] + FILM[i - 1].dur], [])
export const FILM_TOTAL = FILM.reduce((a, sc) => a + sc.dur, 0)
