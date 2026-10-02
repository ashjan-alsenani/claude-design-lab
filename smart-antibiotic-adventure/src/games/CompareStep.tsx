import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { StepApi } from '../screens/MissionScreen'
import { Germ, CheckBadge, CrossBadge } from '../art/objects'
import { Icon } from '../art/icons'
import { centerOf } from '../components/fx'
import './games.css'

/**
 * Two flip cards. In RTL the first card sits on the right:
 * RIGHT = bacteria (✅ can become resistant), LEFT = human body (❌ does not).
 */
export function CompareStep({ api }: { api: StepApi }) {
  const [flipped, setFlipped] = useState<{ germ: boolean; body: boolean }>({ germ: false, body: false })
  const both = flipped.germ && flipped.body

  const flip = (k: 'germ' | 'body', el: HTMLElement) => {
    if (flipped[k]) return
    setFlipped((f) => ({ ...f, [k]: true }))
    api.burst(centerOf(el), k === 'germ' ? 'germs' : 'sparkles', 8)
    if (k === 'germ') api.say('نعم! البكتيريا يمكن أن تصبح مقاومة 🛡️🦠', 'tip')
    else api.say('صحيح! جسمك لا يصبح مقاومًا للمضاد الحيوي ❤️', 'tip')
  }

  return (
    <div className="compare-step">
      <h3 className="q-cloud">من الذي يمكن أن يصبح مقاومًا للمضاد الحيوي؟</h3>
      <div className="compare-grid">
        <FlipCard
          flipped={flipped.germ}
          onFlip={(el) => flip('germ', el)}
          tone="germ"
          front={
            <>
              <Germ size={130} hue="purple" />
              <span className="fc-name">البكتيريا</span>
              <span className="fc-q">اضغط لتكشف 👆</span>
            </>
          }
          back={
            <>
              <Germ size={120} hue="purple" shield />
              <span className="fc-name">البكتيريا</span>
              <span className="fc-verdict yes">
                <CheckBadge size={40} /> يمكن أن تصبح مقاومة
              </span>
            </>
          }
          label="البكتيريا"
        />
        <div className="compare-vs" aria-hidden>
          VS
        </div>
        <FlipCard
          flipped={flipped.body}
          onFlip={(el) => flip('body', el)}
          tone="body"
          front={
            <>
              <Icon name="body" size={130} />
              <span className="fc-name">جسم الإنسان</span>
              <span className="fc-q">اضغط لتكشف 👆</span>
            </>
          }
          back={
            <>
              <Icon name="body" size={120} />
              <span className="fc-name">جسم الإنسان</span>
              <span className="fc-verdict no">
                <CrossBadge size={40} /> لا يصبح مقاومًا
              </span>
            </>
          }
          label="جسم الإنسان"
        />
      </div>
      <AnimatePresence>
        {both && (
          <motion.div className="fact-block" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', duration: 0.5, delay: 0.4 }}>
            <p className="key-msg big">البكتيريا هي التي تصبح مقاومة للمضاد، وليس جسم الإنسان.</p>
            <div className="next-row">
              <button
                type="button"
                className="btn3d theme ready"
                onClick={(e) => {
                  api.correct(centerOf(e.currentTarget), { say: 'فهمتَ السر الكبير! 🌟', points: 10 })
                  api.done()
                }}
                autoFocus
              >
                التالي <span aria-hidden>←</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FlipCard({
  flipped,
  onFlip,
  front,
  back,
  tone,
  label,
}: {
  flipped: boolean
  onFlip: (el: HTMLElement) => void
  front: React.ReactNode
  back: React.ReactNode
  tone: 'germ' | 'body'
  label: string
}) {
  return (
    <button
      type="button"
      className={`flip-card tone-${tone}`}
      onClick={(e) => onFlip(e.currentTarget)}
      aria-pressed={flipped}
      aria-label={flipped ? undefined : `اكشف: ${label}`}
    >
      <motion.span className="flip-inner" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', duration: 0.8, bounce: 0.3 }}>
        <span className="flip-face front">{front}</span>
        <span className="flip-face back">{back}</span>
      </motion.span>
    </button>
  )
}
