import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useAnimationControls, useMotionValue } from 'motion/react'
import type { Step } from '../data/missions'
import type { StepApi } from '../screens/MissionScreen'
import { Icon } from '../art/icons'
import { CheckBadge, CrossBadge } from '../art/objects'
import { centerOf } from '../components/fx'
import { ar } from '../lib/env'
import './games.css'

type Sort = Extract<Step, { kind: 'sort' }>

/** Sort actions into ✅ / ❌ baskets by drag, swipe or tap. */
export function SortStep({ step, api }: { step: Sort; api: StepApi }) {
  const [index, setIndex] = useState(0)
  const [placed, setPlaced] = useState<{ good: number[]; bad: number[] }>({ good: [], bad: [] })
  const [missed, setMissed] = useState(false)
  const [hover, setHover] = useState<'good' | 'bad' | null>(null)
  const [busy, setBusy] = useState(false)
  const goodRef = useRef<HTMLButtonElement>(null)
  const badRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const ctl = useAnimationControls()
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  useEffect(() => {
    void ctl.start({ opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.45, bounce: 0.4 } })
  }, [ctl])
  const item = step.items[index]
  const finished = index >= step.items.length

  const binAt = (x: number, y: number): 'good' | 'bad' | null => {
    for (const [k, r] of [
      ['good', goodRef.current?.getBoundingClientRect()],
      ['bad', badRef.current?.getBoundingClientRect()],
    ] as const) {
      if (r && x >= r.left - 20 && x <= r.right + 20 && y >= r.top - 30 && y <= r.bottom + 20) return k
    }
    return null
  }

  const decide = async (bin: 'good' | 'bad') => {
    if (busy || finished) return
    const ok = item.good === (bin === 'good')
    const binEl = bin === 'good' ? goodRef.current : badRef.current
    if (ok) {
      setBusy(true)
      const from = centerOf(cardRef.current)
      const to = centerOf(binEl)
      api.correct(to, { firstTry: !missed, say: item.why })
      await ctl.start({
        x: to.x - from.x + mx.get(),
        y: to.y - from.y + my.get(),
        scale: 0.25,
        rotate: bin === 'good' ? 18 : -18,
        opacity: 0,
        transition: { duration: api.reduced ? 0.1 : 0.45, ease: [0.4, 0, 0.2, 1] },
      })
      setPlaced((p) => ({ ...p, [bin]: [...p[bin], index] }))
      setMissed(false)
      setIndex((i) => i + 1)
      ctl.set({ x: 0, y: 0, scale: 0.9, rotate: 0, opacity: 0 })
      void ctl.start({ scale: 1, opacity: 1, transition: { type: 'spring', duration: 0.45, bounce: 0.4 } })
      setBusy(false)
    } else {
      setMissed(true)
      api.wrong(`فكّر مرة أخرى: ${item.text}… هل هذا تصرف ${bin === 'good' ? 'صحيح حقًا' : 'خاطئ حقًا'}؟`)
      await ctl.start({ x: 0, y: 0, rotate: 0, transition: { type: 'spring', duration: 0.4, bounce: 0.3 } })
      void ctl.start({ x: [0, -14, 14, -8, 8, 0], transition: { duration: 0.45 } })
    }
  }

  return (
    <div className="sort-game">
      <h3 className="q-cloud">هل هذا تصرف صحيح أم خاطئ؟</h3>

      <div className="sort-arena">
        <Bin
          kind="good"
          refEl={goodRef}
          count={placed.good.length}
          icons={placed.good.map((i) => step.items[i].icon)}
          hover={hover === 'good'}
          onClick={() => void decide('good')}
          disabled={finished}
        />

        <div className="sort-center">
          <AnimatePresence mode="popLayout">
            {!finished ? (
              <motion.div
                key="card"
                ref={cardRef}
                className="sort-card"
                drag={!busy}
                dragMomentum={false}
                dragElastic={0.8}
                animate={ctl}
                style={{ x: mx, y: my }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileDrag={{ scale: 1.06, rotate: -4, cursor: 'grabbing' }}
                onDrag={(e) => {
                  const p = 'touches' in e ? (e as TouchEvent).touches[0] : (e as PointerEvent)
                  if (p) setHover(binAt(p.clientX, p.clientY))
                }}
                onDragEnd={(e, info) => {
                  const p = 'changedTouches' in e ? (e as TouchEvent).changedTouches[0] : (e as PointerEvent)
                  setHover(null)
                  let bin = p ? binAt(p.clientX, p.clientY) : null
                  // a quick swipe toward a basket also counts (RTL: ✅ is on the right)
                  if (!bin && Math.abs(info.offset.x) > 110) bin = info.offset.x > 0 ? 'good' : 'bad'
                  if (bin) void decide(bin)
                  else void ctl.start({ x: 0, y: 0, transition: { type: 'spring', duration: 0.4, bounce: 0.3 } })
                }}
              >
                <motion.div key={index} className="sort-card-inner" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}>
                  <span className="sort-count">
                    {ar(index + 1)} / {ar(step.items.length)}
                  </span>
                  <Icon name={item.icon} size={110} />
                  <p className="sort-text">{item.text}</p>
                  <span className="sort-drag-hint" aria-hidden>
                    ⇆ اسحب أو اضغط على السلة
                  </span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="done" className="sort-done" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}>
                <span className="sort-done-emoji" aria-hidden>
                  🎉
                </span>
                <p>فرزت كل البطاقات!</p>
                <button type="button" className="btn3d theme ready" onClick={api.done} autoFocus>
                  التالي <span aria-hidden>←</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Bin
          kind="bad"
          refEl={badRef}
          count={placed.bad.length}
          icons={placed.bad.map((i) => step.items[i].icon)}
          hover={hover === 'bad'}
          onClick={() => void decide('bad')}
          disabled={finished}
        />
      </div>
    </div>
  )
}

function Bin({
  kind,
  refEl,
  count,
  icons,
  hover,
  onClick,
  disabled,
}: {
  kind: 'good' | 'bad'
  refEl: React.RefObject<HTMLButtonElement | null>
  count: number
  icons: Sort['items'][number]['icon'][]
  hover: boolean
  onClick: () => void
  disabled: boolean
}) {
  return (
    <motion.button
      ref={refEl}
      type="button"
      className={`sort-bin bin-${kind} ${hover ? 'hover' : ''}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      aria-label={kind === 'good' ? `تصرف صحيح، ${ar(count)} بطاقات` : `تصرف خاطئ، ${ar(count)} بطاقات`}
    >
      <span className="bin-badge">{kind === 'good' ? <CheckBadge size={54} /> : <CrossBadge size={54} />}</span>
      <span className="bin-label">{kind === 'good' ? 'تصرف صحيح' : 'تصرف خاطئ'}</span>
      <span className="bin-stack" aria-hidden>
        <AnimatePresence>
          {icons.map((ic, i) => (
            <motion.span key={i} className="bin-item" initial={{ y: -40, opacity: 0, scale: 0.5 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0.6, duration: 0.5 }}>
              <Icon name={ic} size={34} />
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
      <motion.span key={count} className="bin-count" initial={{ scale: 1.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}>
        {ar(count)}
      </motion.span>
    </motion.button>
  )
}
