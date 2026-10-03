import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { DETECTIVE } from '../data/activities'
import { Icon } from '../art/icons'
import { CheckBadge, CrossBadge } from '../art/objects'
import { centerOf } from '../components/fx'
import { ar } from '../lib/env'
import { shuffle, starsFor, type PlayApi } from './ActivityShell'

/** A wall of little photos: find the 4 wrong behaviours. Right ones are praised, never punished. */
export function Detective({ api }: { api: PlayApi }) {
  const tiles = useMemo(() => shuffle(DETECTIVE), [])
  const [seen, setSeen] = useState<Set<number>>(new Set())
  const [misses, setMisses] = useState(0)
  const wrongTotal = DETECTIVE.filter((d) => d.wrong).length
  const found = tiles.filter((t, i) => t.wrong && seen.has(i)).length

  const tap = (i: number, el: HTMLElement) => {
    if (seen.has(i)) return
    const t = tiles[i]
    const next = new Set(seen).add(i)
    setSeen(next)
    if (t.wrong) {
      const f = found + 1
      api.progress(f / wrongTotal)
      api.correct(centerOf(el), { points: 10, say: `🔍 وجدته! ${t.why}` })
      if (f === wrongTotal) {
        window.setTimeout(() => api.finish(starsFor(misses, 1, 3), `وجدت التصرفات الخاطئة الأربعة!`), 1400)
      }
    } else {
      setMisses((m) => m + 1)
      api.say(`👍 هذا تصرف صحيح: «${t.text}». ابحث عن التصرف الخاطئ!`, 'tip')
    }
  }

  return (
    <div className="detective">
      <p className="game-hint">
        وجدت <b>{ar(found)}</b> من <b>{ar(wrongTotal)}</b> تصرفات خاطئة 🔍
      </p>
      <div className="det-grid">
        {tiles.map((t, i) => {
          const open = seen.has(i)
          return (
            <motion.button
              key={t.text}
              type="button"
              className={`det-tile ${open ? (t.wrong ? 'is-wrong' : 'is-right') : ''}`}
              style={{ ['--tilt' as string]: `${((i * 37) % 7) - 3}deg` }}
              onClick={(e) => tap(i, e.currentTarget)}
              aria-pressed={open}
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: api.reduced ? 0 : i * 0.05, type: 'spring', duration: 0.45, bounce: 0.3 }}
            >
              <span className="det-photo">
                <Icon name={t.icon} size={70} />
                {open && (
                  <motion.span className="det-mark" initial={{ scale: 0.6, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6, duration: 0.45 }}>
                    {t.wrong ? <CrossBadge size={44} /> : <CheckBadge size={44} />}
                  </motion.span>
                )}
              </span>
              <span className="det-caption">{t.text}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
