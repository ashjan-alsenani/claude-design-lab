import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TRUE_FALSE } from '../data/activities'
import { CheckBadge, CrossBadge } from '../art/objects'
import { centerOf } from '../components/fx'
import { ar } from '../lib/env'
import { shuffle, starsFor, type PlayApi } from './ActivityShell'

const ROUND = 8

/** Quick true/false statements with a short, kind explanation after each. */
export function TrueFalse({ api }: { api: PlayApi }) {
  const qs = useMemo(() => shuffle(TRUE_FALSE).slice(0, ROUND), [])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<boolean | null>(null)
  const [right, setRight] = useState(0)
  const [streak, setStreak] = useState(0)
  const q = qs[i]

  const answer = (v: boolean, el: HTMLElement) => {
    if (picked !== null) return
    setPicked(v)
    if (v === q.answer) {
      setRight((r) => r + 1)
      setStreak((s) => s + 1)
      api.correct(centerOf(el), { points: 5, say: `${streak + 1 >= 3 ? `🔥 ${ar(streak + 1)} إجابات متتالية! ` : ''}${q.why}` })
    } else {
      setStreak(0)
      api.wrong(`ليس تمامًا… ${q.why}`)
    }
  }

  const next = () => {
    api.progress((i + 1) / ROUND)
    if (i + 1 >= ROUND) {
      api.finish(starsFor(ROUND - right, 1, 3), `أجبت إجابة صحيحة عن ${ar(right)} من ${ar(ROUND)} جمل!`)
      return
    }
    setI(i + 1)
    setPicked(null)
    api.say('الجملة التالية… فكّر جيدًا 🤔', 'think')
  }

  const ok = picked !== null && picked === q.answer

  return (
    <div className="tf">
      <div className="tf-dots" aria-hidden>
        {qs.map((_, k) => (
          <span key={k} className={k < i ? 'past' : k === i ? 'now' : ''} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          className="tf-card glass"
          initial={{ opacity: 0, x: -40, rotate: -2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: 40, rotate: 2, transition: { duration: 0.16 } }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0.3 }}
        >
          <p className="tf-num">
            الجملة {ar(i + 1)} من {ar(ROUND)}
          </p>
          <p className="tf-text">{q.text}</p>
          {picked !== null && (
            <motion.div className={`tf-verdict ${ok ? 'ok' : 'no'}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              {q.answer ? <CheckBadge size={34} /> : <CrossBadge size={34} />}
              <span>
                الجملة <b>{q.answer ? 'صحيحة' : 'خاطئة'}</b>. {q.why}
              </span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="tf-buttons">
        {picked === null ? (
          <>
            <button type="button" className="btn3d big green tf-btn" onClick={(e) => answer(true, e.currentTarget)}>
              ✅ صح
            </button>
            <button type="button" className="btn3d big pink tf-btn" onClick={(e) => answer(false, e.currentTarget)}>
              ❌ خطأ
            </button>
          </>
        ) : (
          <button type="button" className="btn3d big blue ready" onClick={next} autoFocus>
            {i + 1 >= ROUND ? 'النتيجة 🏁' : 'التالي ⬅️'}
          </button>
        )}
      </div>
    </div>
  )
}
