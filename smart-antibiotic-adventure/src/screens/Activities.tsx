import { motion } from 'motion/react'
import { useGame } from '../state/game'
import { ACTIVITIES, ACTIVITY_IDS, CORNERS, type ActivityId } from '../data/activities'
import { Hud } from '../components/Hud'
import { centerOf, Speech } from '../components/fx'
import { Aleen } from '../art/Aleen'
import { Icon } from '../art/icons'
import { Star } from '../art/objects'
import { Bubbles } from '../art/scenes'
import { ar } from '../lib/env'
import '../activities/activities.css'

/** The play park: activities grouped into corners, plus the sticker album. */
export function Activities() {
  const { go, activities, env } = useGame()
  const earned = ACTIVITY_IDS.filter((id) => (activities[id] ?? 0) > 0).length
  const total = ACTIVITY_IDS.length
  const next = ACTIVITY_IDS.find((id) => !activities[id])
  const say =
    earned === 0
      ? 'أهلًا بك في ساحة الألعاب! اختر أي لعبة… كل لعبة تمنحك ملصقًا جديدًا ✨'
      : earned < total
        ? `رائع! جمعت ${ar(earned)} من ${ar(total)} ملصقات. جرّب «${ACTIVITIES[next!].title}»! 🎯`
        : 'واو! جمعت كل الملصقات! 🏆 العب مجددًا لتحصل على ٣ نجوم في كل لعبة.'

  const open = (id: ActivityId, e: React.MouseEvent) =>
    go({ name: 'activity', id }, { color: ACTIVITIES[id].color[1], origin: centerOf(e.currentTarget), kind: 'bubbles' })

  let n = 0
  return (
    <main className="hub">
      <div className="act-bg hub-bg" aria-hidden>
        <span className="act-blob b1" />
        <span className="act-blob b2" />
        <span className="act-blob b3" />
        <Bubbles n={env.lowPower ? 6 : 14} />
      </div>
      <Hud
        progress={earned / total}
        label="ساحة الألعاب"
        onBack={(e) => go({ name: 'landing' }, { color: '#2f5bea', origin: centerOf(e.currentTarget as Element), kind: 'portal' })}
        backLabel="الصفحة الرئيسية"
        backIcon="🏠"
      />

      <header className="hub-hero">
        <div className="hub-copy">
          <motion.h1
            className="hub-title title-3d"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 0.7, bounce: 0.45 }}
          >
            ساحة الألعاب <span aria-hidden>🎪</span>
          </motion.h1>
          <p className="hub-sub">ألعاب قصيرة وممتعة لتصبح بطلًا في حماية المضادات الحيوية</p>
          <div className="hub-stats">
            <span className="hub-pill">
              🏅 الملصقات: <b>{ar(earned)}</b> / {ar(total)}
            </span>
            <button type="button" className="btn3d small" onClick={(e) => go({ name: 'map' }, { color: '#2f5bea', origin: centerOf(e.currentTarget), kind: 'portal' })}>
              🗺️ المغامرة
            </button>
            <button type="button" className="btn3d small pink" onClick={(e) => go({ name: 'film' }, { color: '#ff5fa8', origin: centerOf(e.currentTarget), kind: 'portal' })}>
              🎬 الفيلم
            </button>
          </div>
        </div>
        <div className="hub-guide">
          <div className="hub-speech">
            <Speech who="ألين" tail="bottom" id={say}>
              {say}
            </Speech>
          </div>
          <Aleen height={env.portrait ? 150 : 250} mood={earned === total ? 'celebrate' : 'idle'} reduced={env.reducedMotion} />
        </div>
      </header>

      {CORNERS.map((c) => (
        <section key={c.key} className="corner" aria-labelledby={`corner-${c.key}`} style={{ ['--tint' as string]: c.tint }}>
          <h2 id={`corner-${c.key}`} className="corner-title">
            <span className="corner-emoji" aria-hidden>
              {c.emoji}
            </span>
            {c.title}
          </h2>
          <div className="act-grid">
            {c.ids.map((id) => {
              const a = ACTIVITIES[id]
              const stars = activities[id] ?? 0
              const i = n++
              return (
                <motion.button
                  key={id}
                  type="button"
                  className="act-tile"
                  style={{ ['--c1' as string]: a.color[0], ['--c2' as string]: a.color[1], ['--c3' as string]: a.color[2] }}
                  onClick={(e) => open(id, e)}
                  initial={{ opacity: 0, y: 22, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: env.reducedMotion ? 0 : 0.08 + i * 0.05, type: 'spring', duration: 0.55, bounce: 0.3 }}
                  aria-label={`${a.title}: ${a.desc}${stars ? ` — حصلت على ${ar(stars)} نجوم` : ''}`}
                >
                  {stars > 0 ? <span className="tile-chip done">✓ لديك الملصق</span> : <span className="tile-chip new">جديد!</span>}
                  <span className="tile-art" aria-hidden>
                    <span className="tile-emoji">{a.emoji}</span>
                    <span className="tile-icon">
                      <Icon name={a.icon} size={52} />
                    </span>
                  </span>
                  <span className="tile-title">{a.title}</span>
                  <span className="tile-desc">{a.desc}</span>
                  <span className="tile-foot">
                    <span className="tile-play" aria-hidden>
                      ▶ العب
                    </span>
                    <span className="tile-time">⏱️ {ar(a.minutes)} {a.minutes === 1 ? 'دقيقة' : a.minutes === 2 ? 'دقيقتان' : 'دقائق'}</span>
                    <span className="tile-stars" aria-hidden>
                      {[1, 2, 3].map((s) => (
                        <Star key={s} size={22} className={s <= stars ? 'on' : 'off'} />
                      ))}
                    </span>
                  </span>
                </motion.button>
              )
            })}
          </div>
        </section>
      ))}

      <section className="album glass" aria-labelledby="album-title">
        <h2 id="album-title" className="album-title">
          📒 ألبوم ملصقاتي
          <small>
            {ar(earned)} من {ar(total)}
          </small>
        </h2>
        <div className="album-bar" aria-hidden>
          <span style={{ transform: `scaleX(${earned / total})` }} />
        </div>
        <ul className="album-grid">
          {ACTIVITY_IDS.map((id, i) => {
            const a = ACTIVITIES[id]
            const has = (activities[id] ?? 0) > 0
            return (
              <li key={id}>
                <button
                  type="button"
                  className={`sticker ${has ? '' : 'locked'}`}
                  style={{ ['--s1' as string]: a.color[0], ['--s2' as string]: a.color[1], ['--s3' as string]: a.color[2], ['--rot' as string]: `${((i * 53) % 13) - 6}deg` }}
                  onClick={(e) => open(id, e)}
                  aria-label={has ? `ملصق ${a.sticker.name}` : `ملصق مقفل — العب «${a.title}» لتحصل عليه`}
                >
                  <span className="sticker-emoji" aria-hidden>
                    {has ? a.sticker.emoji : '🔒'}
                  </span>
                  <span className="sticker-name">{has ? a.sticker.name : a.title}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
