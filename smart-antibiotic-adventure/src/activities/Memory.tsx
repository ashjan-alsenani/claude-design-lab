import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { MEMORY_CARDS } from '../data/activities'
import { Icon } from '../art/icons'
import { centerOf } from '../components/fx'
import { ar } from '../lib/env'
import { shuffle, starsFor, type PlayApi } from './ActivityShell'

type Card = { key: number; pair: number }

/** Flip two cards at a time; every match teaches one short fact. */
export function Memory({ api }: { api: PlayApi }) {
  const cards = useMemo<Card[]>(() => shuffle(MEMORY_CARDS.flatMap((_, i) => [i, i])).map((pair, key) => ({ key, pair })), [])
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const busy = useRef(false)
  const pairs = MEMORY_CARDS.length

  const flip = (c: Card, el: HTMLElement) => {
    if (busy.current || open.includes(c.key) || matched.has(c.pair)) return
    const next = [...open, c.key]
    setOpen(next)
    if (next.length < 2) return
    setMoves((m) => m + 1)
    const [a, b] = next.map((k) => cards[k])
    if (a.pair === b.pair) {
      const m = new Set(matched).add(a.pair)
      setMatched(m)
      setOpen([])
      api.correct(centerOf(el), { points: 5, say: MEMORY_CARDS[a.pair].fact })
      api.progress(m.size / pairs)
      if (m.size === pairs) {
        const extra = moves + 1 - pairs // perfect game = 6 moves
        api.finish(starsFor(extra, 3, 7), `وجدت كل الأزواج في ${ar(moves + 1)} محاولة!`)
      }
    } else {
      busy.current = true
      window.setTimeout(() => {
        setOpen([])
        busy.current = false
      }, api.reduced ? 500 : 900)
    }
  }

  return (
    <div className="memory">
      <p className="game-hint">
        المحاولات: <b>{ar(moves)}</b> · الأزواج: <b>{ar(matched.size)}</b> / {ar(pairs)}
      </p>
      <div className="memory-grid">
        {cards.map((c, i) => {
          const up = open.includes(c.key) || matched.has(c.pair)
          const info = MEMORY_CARDS[c.pair]
          return (
            <motion.button
              key={c.key}
              type="button"
              className={`mem-card ${up ? 'up' : ''} ${matched.has(c.pair) ? 'matched' : ''}`}
              onClick={(e) => flip(c, e.currentTarget)}
              aria-label={up ? info.label : `بطاقة ${ar(i + 1)} مقلوبة`}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: api.reduced ? 0 : i * 0.04, type: 'spring', duration: 0.45, bounce: 0.3 }}
            >
              <span className="mem-inner">
                <span className="mem-back" aria-hidden>
                  <span>؟</span>
                </span>
                <span className="mem-front" aria-hidden>
                  <Icon name={info.icon} size={64} />
                  <span className="mem-label">{info.label}</span>
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
