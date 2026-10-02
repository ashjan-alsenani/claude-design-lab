import { createContext, useContext, useEffect, type CSSProperties, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'

type Par = { x: MotionValue<number>; y: MotionValue<number> }
const ParCtx = createContext<Par | null>(null)

/**
 * Pointer-driven depth. Pointer position is normalised to -1..1 and smoothed
 * by a spring; each <Layer> multiplies it by its depth, so near objects move
 * more than far ones. Disabled (static) on touch, reduced motion, low power.
 */
export function ParallaxRoot({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const x = useSpring(rx, { stiffness: 60, damping: 18, mass: 0.6 })
  const y = useSpring(ry, { stiffness: 60, damping: 18, mass: 0.6 })

  useEffect(() => {
    if (!enabled) {
      rx.set(0)
      ry.set(0)
      return
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      rx.set((e.clientX / window.innerWidth) * 2 - 1)
      ry.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled, rx, ry])

  return <ParCtx.Provider value={{ x, y }}>{children}</ParCtx.Provider>
}

export function Layer({
  depth,
  children,
  className = '',
  style,
}: {
  depth: number
  children?: ReactNode
  className?: string
  style?: CSSProperties
}) {
  const par = useContext(ParCtx)
  const fallback = useMotionValue(0)
  const px = par?.x ?? fallback
  const py = par?.y ?? fallback
  const x = useTransform(px, (v) => v * depth * -14)
  const y = useTransform(py, (v) => v * depth * -9)
  return (
    <motion.div className={`layer ${className}`} style={{ ...style, x, y }}>
      {children}
    </motion.div>
  )
}

/** A floating decorative object at a % position with its own bob loop. */
export function Floater({
  x,
  y,
  depth = 1,
  children,
  dur = 5,
  delay = 0,
  amp = -14,
  rot = 0,
  blur = 0,
  className = '',
}: {
  x: string
  y: string
  depth?: number
  children: ReactNode
  dur?: number
  delay?: number
  amp?: number
  rot?: number
  blur?: number
  className?: string
}) {
  return (
    <Layer depth={depth} className={`floater ${className}`} style={{ left: x, top: y, filter: blur ? `blur(${blur}px)` : undefined }}>
      <div
        className="float-y"
        style={{
          ['--dur' as string]: `${dur}s`,
          ['--delay' as string]: `${-delay}s`,
          ['--amp' as string]: `${amp}px`,
          ['--rot' as string]: `${rot}deg`,
        }}
      >
        {children}
      </div>
    </Layer>
  )
}
