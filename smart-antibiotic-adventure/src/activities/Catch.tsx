import { useEffect, useRef, useState } from 'react'
import { CATCH_BAD, CATCH_GOOD } from '../data/activities'
import { Icon } from '../art/icons'
import { Heart, MiniShield } from '../art/objects'
import { BaktoroArt } from '../art/Baktoro'
import { ar } from '../lib/env'
import { useGame } from '../state/game'
import type { PlayApi } from './ActivityShell'

const DURATION = 40
const LIVES = 3
type Item = { id: number; x: number; y: number; v: number; good: boolean; k: number; rot: number }

/** Move the shield to catch helpful things; avoid old medicine, sharing and germs. */
export function Catch({ api }: { api: PlayApi }) {
  const { sfx } = useGame()
  const fieldRef = useRef<HTMLDivElement>(null)
  const st = useRef({ x: 50, target: 50, items: [] as Item[], id: 0, spawnIn: 0.6, t: 0, caught: 0, bad: 0, lives: LIVES, over: false, hold: 0 })
  const [, setFrame] = useState(0)
  const [started, setStarted] = useState(false)
  const [flash, setFlash] = useState<{ good: boolean; id: number } | null>(null)

  useEffect(() => {
    if (!started) return
    let raf = 0
    let prev = performance.now()
    const loop = (now: number) => {
      const s = st.current
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      if (s.over) return
      s.t += dt
      if (s.hold) s.target = Math.max(6, Math.min(94, s.target + s.hold * 70 * dt))
      s.x += (s.target - s.x) * Math.min(1, dt * 14)
      const h = fieldRef.current?.clientHeight ?? 420
      // spawn
      s.spawnIn -= dt
      if (s.spawnIn <= 0) {
        const good = Math.random() < 0.62
        const pool = good ? CATCH_GOOD : CATCH_BAD
        s.items.push({ id: ++s.id, x: 8 + Math.random() * 84, y: -60, v: 120 + Math.min(110, s.t * 3.2) + Math.random() * 40, good, k: Math.floor(Math.random() * pool.length), rot: (Math.random() - 0.5) * 30 })
        s.spawnIn = Math.max(0.55, 1.05 - s.t * 0.012)
      }
      // move + collide with the shield (bottom band)
      const catchY = h - 92
      for (const it of s.items) {
        it.y += it.v * dt * (api.reduced ? 0.8 : 1)
        if (it.y > catchY - 30 && it.y < catchY + 30 && Math.abs(it.x - s.x) < 11) {
          it.y = 99999
          if (it.good) {
            s.caught++
            sfx('star')
            api.progress(Math.min(1, s.caught / 12))
            if (s.caught % 4 === 0) api.say(`🛡️ ${ar(s.caught)} أشياء مفيدة! استمر!`, 'happy')
          } else {
            s.lives = Math.max(0, s.lives - 1)
            s.bad++
            sfx('wrong')
            api.say(CATCH_BAD[it.k].label === 'جرثومة' ? 'أوه! هذه جرثومة، ابتعد عنها! 🦠' : `لا نريد «${CATCH_BAD[it.k].label}»! ابتعد عنه ⚠️`, 'tip')
          }
          setFlash({ good: it.good, id: it.id })
        }
      }
      s.items = s.items.filter((it) => it.y < h + 60)
      // the round always plays out: little hands are never "game over"-ed
      if (s.t >= DURATION) {
        s.over = true
        const stars = s.caught >= 10 && s.bad <= 2 ? 3 : s.caught >= 6 ? 2 : 1
        api.finish(stars, `التقطت ${ar(s.caught)} أشياء مفيدة${s.bad ? ` ولمستَ ${ar(s.bad)} أشياء ضارة` : ' دون أي شيء ضار'}!`)
        return
      }
      setFrame((f) => f + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started])

  useEffect(() => {
    const key = (e: KeyboardEvent, down: boolean) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      st.current.hold = down ? (e.key === 'ArrowLeft' ? -1 : 1) : 0
    }
    const kd = (e: KeyboardEvent) => key(e, true)
    const ku = (e: KeyboardEvent) => key(e, false)
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    return () => {
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
    }
  }, [])

  const point = (clientX: number) => {
    const r = fieldRef.current?.getBoundingClientRect()
    if (!r) return
    st.current.target = Math.max(6, Math.min(94, ((clientX - r.left) / r.width) * 100))
  }

  const s = st.current
  const left = Math.max(0, DURATION - s.t)

  return (
    <div className="catch">
      <div className="catch-bar">
        <span className="catch-lives" aria-label={`القلوب ${ar(s.lives)}`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <Heart key={i} size={30} className={i < s.lives ? '' : 'lost'} />
          ))}
        </span>
        <span className="catch-score">🛡️ {ar(s.caught)}</span>
        <span className="catch-time">⏱️ {ar(Math.ceil(left))}</span>
      </div>
      <div
        ref={fieldRef}
        className="catch-field"
        onPointerMove={(e) => point(e.clientX)}
        onPointerDown={(e) => point(e.clientX)}
        style={{ touchAction: 'none' }}
      >
        <div className="catch-legend" aria-hidden>
          <span>✅ التقط: صابون، لقاح، طبيب، منديل، وصفة</span>
          <span>⛔ تجنّب: دواء قديم، مشاركة الدواء، الجراثيم</span>
        </div>
        {s.items.map((it) => {
          const info = it.good ? CATCH_GOOD[it.k] : CATCH_BAD[it.k]
          return (
            <div key={it.id} className="catch-item" style={{ left: `${it.x}%`, transform: `translate(-50%, ${it.y}px) rotate(${it.rot}deg)` }}>
              {!it.good && info.icon === 'germ' ? <BaktoroArt mood="smug" size={58} /> : <Icon name={info.icon} size={58} />}
              <span className="catch-label">{info.label}</span>
            </div>
          )
        })}
        <div className="catch-shield" style={{ left: `${s.x}%` }}>
          <MiniShield size={86} gold />
          {flash && <span key={flash.id} className={`catch-pop ${flash.good ? 'good' : 'bad'}`}>{flash.good ? '+١' : '−❤️'}</span>}
        </div>
        {!started && (
          <div className="catch-start">
            <button type="button" className="btn3d big green ready" onClick={() => setStarted(true)} autoFocus>
              ابدأ! ▶
            </button>
            <p>حرّك الدرع بإصبعك أو بالفأرة أو بالأسهم ⬅️ ➡️</p>
          </div>
        )}
      </div>
      <div className="catch-pad">
        <button
          type="button"
          className="icon-btn big"
          aria-label="يمين"
          onPointerDown={() => (st.current.hold = 1)}
          onPointerUp={() => (st.current.hold = 0)}
          onPointerLeave={() => (st.current.hold = 0)}
        >
          ➡️
        </button>
        <button
          type="button"
          className="icon-btn big"
          aria-label="يسار"
          onPointerDown={() => (st.current.hold = -1)}
          onPointerUp={() => (st.current.hold = 0)}
          onPointerLeave={() => (st.current.hold = 0)}
        >
          ⬅️
        </button>
      </div>
    </div>
  )
}
