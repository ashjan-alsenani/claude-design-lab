import { motion, AnimatePresence } from 'motion/react'
import noorSrc from '../assets/noor.webp'
import { Bulb, Sparkle, Star } from './objects'
import './noor.css'

export type NoorMood = 'idle' | 'happy' | 'tip' | 'celebrate' | 'think'

/**
 * Noor is the supplied character image, untouched. Only her presentation is
 * animated: entrance, gentle float, sparkles, bounces and props around her.
 */
export function Noor({
  mood = 'idle',
  height = 420,
  className = '',
  reduced = false,
  moodKey = 0,
  entrance = true,
}: {
  mood?: NoorMood
  height?: number
  className?: string
  reduced?: boolean
  /** bump to replay the happy bounce for consecutive correct answers */
  moodKey?: number
  entrance?: boolean
}) {
  const width = Math.round(height * 0.392)
  const bounce =
    mood === 'happy'
      ? { y: [0, -26, 0, -10, 0], transition: { duration: 0.8, ease: 'easeOut' as const } }
      : mood === 'celebrate'
        ? { y: [0, -30, 0], transition: { duration: 0.9, repeat: Infinity, repeatDelay: 0.3, ease: 'easeOut' as const } }
        : { y: 0 }
  return (
    <motion.div
      className={`noor ${className}`}
      style={{ width, height }}
      initial={entrance ? { opacity: 0, x: 60 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', duration: 0.8, bounce: 0.25 }}
    >
      <div className="noor-glow" aria-hidden />
      <div className="noor-ground" aria-hidden />
      <div className={reduced ? 'noor-float-off' : 'noor-float'}>
        <motion.div key={`${mood}-${moodKey}`} animate={reduced ? undefined : bounce} style={{ height: '100%' }}>
          <img src={noorSrc} alt="نور، بطلة المغامرة" width={width} height={height} draggable={false} />
        </motion.div>
      </div>
      {/* ambient sparkles */}
      <Sparkle size={18} className="noor-sp twinkle rm-hide" style={{ top: '8%', insetInlineStart: '-6%', ['--delay' as string]: '0.2s' }} color="#ffd23f" />
      <Sparkle size={14} className="noor-sp twinkle rm-hide" style={{ top: '34%', insetInlineEnd: '-10%', ['--delay' as string]: '1.1s' }} color="#fff" />
      <Sparkle size={12} className="noor-sp twinkle rm-hide" style={{ top: '60%', insetInlineStart: '-12%', ['--delay' as string]: '1.8s' }} color="#ff8fc7" />

      <AnimatePresence>
        {mood === 'tip' && (
          <motion.div
            key="bulb"
            className="noor-bulb"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.5 }}
          >
            <Bulb size={Math.max(40, height * 0.14)} className="glow-pulse" />
          </motion.div>
        )}
        {(mood === 'happy' || mood === 'celebrate') && (
          <motion.div key={`stars-${moodKey}`} className="noor-stars" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const ang = (-160 + i * 35) * (Math.PI / 180)
              const r = height * 0.32
              return (
                <motion.span
                  key={i}
                  className="noor-star"
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                  animate={{
                    opacity: mood === 'celebrate' ? [0, 1, 1] : [0, 1, 0],
                    x: Math.cos(ang) * r,
                    y: Math.sin(ang) * r,
                    scale: 1,
                    rotate: 160,
                  }}
                  transition={{ duration: mood === 'celebrate' ? 0.8 : 1.1, delay: i * 0.05, ease: 'easeOut' }}
                >
                  <Star size={Math.max(22, height * 0.07)} />
                </motion.span>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
