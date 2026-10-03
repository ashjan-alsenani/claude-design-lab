import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { SEQUENCES } from '../data/activities'
import { centerOf } from '../components/fx'
import { ar } from '../lib/env'
import { shuffle, starsFor, type PlayApi } from './ActivityShell'

/** Tap the steps in the right order; placed steps fill the numbered track. */
export function Sequence({ api }: { api: PlayApi }) {
  const [r, setR] = useState(0)
  const [placed, setPlaced] = useState<number[]>([])
  const [shake, setShake] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const seq = SEQUENCES[r]
  const order = useMemo(() => shuffle(seq.steps.map((_, k) => k)), [seq])
  const total = SEQUENCES.reduce((n, s) => n + s.steps.length, 0)
  const before = SEQUENCES.slice(0, r).reduce((n, s) => n + s.steps.length, 0)

  const tap = (k: number, el: HTMLElement) => {
    if (placed.includes(k)) return
    if (k !== placed.length) {
      setMistakes((m) => m + 1)
      setShake(k)
      window.setTimeout(() => setShake(null), 450)
      api.wrong(`ليست هذه الخطوة رقم ${ar(placed.length + 1)} بعد… ماذا نفعل ${placed.length === 0 ? 'أولًا' : 'بعد ذلك'}؟ 🤔`)
      return
    }
    const next = [...placed, k]
    setPlaced(next)
    api.progress((before + next.length) / total)
    if (next.length < seq.steps.length) {
      api.correct(centerOf(el), { points: 3, quiet: true, say: `خطوة ${ar(next.length)}: ${seq.steps[k].text} ✔️` })
      return
    }
    api.correct(centerOf(el), { points: 10, say: `رتّبت «${seq.title}» كلها! 🎉` })
    window.setTimeout(() => {
      if (r + 1 < SEQUENCES.length) {
        setR(r + 1)
        setPlaced([])
        api.say(`الآن: «${SEQUENCES[r + 1].title}» — ما الخطوة الأولى؟`, 'think')
      } else {
        api.finish(starsFor(mistakes, 1, 4), 'رتّبت كل الخطوات بنجاح!')
      }
    }, 1100)
  }

  return (
    <div className="seq">
      <h3 className="seq-title">
        <span aria-hidden>🧩</span> {seq.title}
        <small>
          الجولة {ar(r + 1)} من {ar(SEQUENCES.length)}
        </small>
      </h3>
      <ol className="seq-track" aria-label="الخطوات المرتبة">
        {seq.steps.map((_, slot) => {
          const k = placed[slot]
          return (
            <li key={slot} className={`seq-slot ${k !== undefined ? 'filled' : ''}`}>
              <span className="seq-n">{ar(slot + 1)}</span>
              <AnimatePresence>
                {k !== undefined && (
                  <motion.span
                    className="seq-placed"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', duration: 0.45, bounce: 0.45 }}
                  >
                    <span className="seq-emoji" aria-hidden>
                      {seq.steps[k].emoji}
                    </span>
                    {seq.steps[k].text}
                  </motion.span>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ol>
      <div className="seq-pool">
        {order.map((k, i) =>
          placed.includes(k) ? (
            <span key={`${r}-${k}`} className="seq-card ghost" aria-hidden />
          ) : (
            <motion.button
              key={`${r}-${k}`}
              type="button"
              className={`seq-card ${shake === k ? 'shake' : ''}`}
              onClick={(e) => tap(k, e.currentTarget)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: api.reduced ? 0 : i * 0.05, type: 'spring', duration: 0.4, bounce: 0.3 }}
            >
              <span className="seq-emoji" aria-hidden>
                {seq.steps[k].emoji}
              </span>
              {seq.steps[k].text}
            </motion.button>
          ),
        )}
      </div>
    </div>
  )
}
