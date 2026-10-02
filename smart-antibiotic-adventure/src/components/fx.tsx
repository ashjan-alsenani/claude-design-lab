import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useGame, type Point } from '../state/game'
import { Star, Sparkle, Germ, Capsule } from '../art/objects'
import './fx.css'

/* ------------------------------------------------------------------ */
/*  World transition overlay (portal / bubbles / clouds) ~700ms        */
/* ------------------------------------------------------------------ */
export function TransitionOverlay() {
  const { transition, env } = useGame()
  const { active, color, origin, phase, kind } = transition
  const r = Math.hypot(Math.max(origin.x, window.innerWidth - origin.x), Math.max(origin.y, window.innerHeight - origin.y)) + 40
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="tr"
          className={`transition-overlay kind-${kind}`}
          style={{ ['--tc' as string]: color }}
          initial={
            env.reducedMotion
              ? { opacity: 0 }
              : { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }
          }
          animate={
            env.reducedMotion
              ? { opacity: phase === 'in' ? 1 : 0 }
              : phase === 'in'
                ? { clipPath: `circle(${r}px at ${origin.x}px ${origin.y}px)` }
                : { clipPath: `circle(0px at ${window.innerWidth / 2}px ${window.innerHeight / 2}px)` }
          }
          transition={{ duration: env.reducedMotion ? 0.16 : 0.34, ease: [0.77, 0, 0.175, 1] }}
          aria-hidden
        >
          {!env.reducedMotion && (
            <div className="tr-art">
              {kind === 'bubbles' &&
                Array.from({ length: 14 }, (_, i) => (
                  <span key={i} className="tr-bubble" style={{ left: `${(i * 37) % 100}%`, width: 30 + ((i * 23) % 70), height: 30 + ((i * 23) % 70), animationDelay: `${(i % 5) * 0.04}s` }} />
                ))}
              {kind === 'portal' && (
                <>
                  <div className="tr-ring" />
                  <div className="tr-ring r2" />
                  <div className="tr-star">
                    <Star size={120} />
                  </div>
                </>
              )}
              {kind === 'clouds' && (
                <div className="tr-capsule">
                  <Capsule size={140} />
                </div>
              )}
              {Array.from({ length: 10 }, (_, i) => (
                <Sparkle key={i} size={16 + (i % 3) * 10} className="tr-spark" style={{ left: `${(i * 29 + 11) % 95}%`, top: `${(i * 43 + 7) % 90}%` }} />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/*  Stars flying from an answer toward the score counter               */
/* ------------------------------------------------------------------ */
export function FlyingStars() {
  const { flights, scoreTarget, landFlight, env } = useGame()
  return (
    <div className="fly-layer" aria-hidden>
      {flights.map((f) => {
        const t = scoreTarget.current?.getBoundingClientRect()
        const to: Point = t ? { x: t.left + t.width / 2, y: t.top + t.height / 2 } : { x: window.innerWidth - 60, y: 30 }
        const mid = { x: (f.from.x + to.x) / 2 + (f.from.x > to.x ? 60 : -60), y: Math.min(f.from.y, to.y) - 120 }
        return (
          <motion.div
            key={f.id}
            className="fly-star"
            initial={{ x: f.from.x, y: f.from.y, scale: 0.6, opacity: 0, rotate: 0 }}
            animate={
              env.reducedMotion
                ? { x: to.x, y: to.y, opacity: [0, 1, 0], scale: 0.8 }
                : { x: [f.from.x, mid.x, to.x], y: [f.from.y, mid.y, to.y], scale: [0.6, 1.3, 0.7], opacity: [0, 1, 1], rotate: 360 }
            }
            transition={{ duration: 0.75, delay: f.delay, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={() => landFlight(f.id)}
          >
            <Star size={34} />
          </motion.div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Animated number count-up                                           */
/* ------------------------------------------------------------------ */
export function CountUp({ value, format = (n: number) => String(n), duration = 0.8 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const mv = useMotionValue(value)
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 })
  const text = useTransform(spring, (v) => format(Math.round(v)))
  useEffect(() => mv.set(value), [value, mv])
  return <motion.span>{text}</motion.span>
}

/* ------------------------------------------------------------------ */
/*  Particle burst at a point (correct answers, snaps)                 */
/* ------------------------------------------------------------------ */
export type BurstSpec = { id: number; x: number; y: number; n?: number; kind?: 'stars' | 'sparkles' | 'germs' }

export function Bursts({ bursts, onDone }: { bursts: BurstSpec[]; onDone: (id: number) => void }) {
  const { env } = useGame()
  return (
    <div className="burst-layer" aria-hidden>
      {bursts.map((b) => {
        const n = env.reducedMotion ? 4 : (b.n ?? 10)
        return (
          <div key={b.id} className="burst" style={{ left: b.x, top: b.y }}>
            {Array.from({ length: n }, (_, i) => {
              const a = (i / n) * Math.PI * 2 + (b.id % 7) * 0.3
              const dist = (env.reducedMotion ? 30 : 70) + ((i * 37) % 50)
              return (
                <motion.span
                  key={i}
                  className="burst-p"
                  initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
                  animate={{ x: Math.cos(a) * dist, y: Math.sin(a) * dist + 20, scale: [0.5, 1.1, 0.6], opacity: [1, 1, 0], rotate: 200 }}
                  transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                  onAnimationComplete={i === 0 ? () => onDone(b.id) : undefined}
                >
                  {b.kind === 'germs' ? (
                    <Germ size={22} hue={i % 2 ? 'purple' : 'green'} />
                  ) : i % 2 && b.kind !== 'sparkles' ? (
                    <Star size={22} />
                  ) : (
                    <Sparkle size={18} color={['#ffd23f', '#ff8fc7', '#5ec8ff', '#7be3b0'][i % 4]} />
                  )}
                </motion.span>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export function useBursts() {
  const [bursts, setBursts] = useState<BurstSpec[]>([])
  const idRef = useRef(0)
  const burst = (p: Point, kind: BurstSpec['kind'] = 'stars', n?: number) =>
    setBursts((b) => [...b, { id: ++idRef.current, x: p.x, y: p.y, kind, n }])
  const done = (id: number) => setBursts((b) => b.filter((x) => x.id !== id))
  return { bursts, burst, done }
}

export function centerOf(el: Element | null): Point {
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/* ------------------------------------------------------------------ */
/*  Confetti (canvas)                                                  */
/* ------------------------------------------------------------------ */
export function Confetti({ fire, duration = 3500, density = 1 }: { fire: number; duration?: number; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { env } = useGame()
  useEffect(() => {
    if (!fire) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
    }
    resize()
    const colors = ['#ffd23f', '#ff8fc7', '#5ec8ff', '#7be3b0', '#a46bff', '#ff7a6b', '#ffffff']
    const count = Math.round((env.reducedMotion ? 40 : env.lowPower ? 90 : 170) * density)
    const W = window.innerWidth
    const parts = Array.from({ length: count }, (_, i) => {
      const fromLeft = i % 2 === 0
      return {
        x: fromLeft ? -10 : W + 10,
        y: window.innerHeight * (0.55 + Math.random() * 0.3),
        vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 8),
        vy: -(10 + Math.random() * 10),
        r: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: colors[i % colors.length],
        shape: i % 3,
        delay: Math.random() * 400,
      }
    })
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = now - start
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of parts) {
        if (t < p.delay) continue
        p.vy += 0.32
        p.vx *= 0.985
        p.vy *= 0.985
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, Math.min(1, (duration - t) / 600))
        ctx.fillStyle = p.c
        if (p.shape === 0) ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
        else if (p.shape === 1) {
          ctx.beginPath()
          ctx.arc(0, 0, p.r / 1.4, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.beginPath()
          for (let k = 0; k < 5; k++) {
            const a = (k * 4 * Math.PI) / 5 - Math.PI / 2
            ctx.lineTo(Math.cos(a) * p.r, Math.sin(a) * p.r)
          }
          ctx.fill()
        }
        ctx.restore()
      }
      if (t < duration) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [fire, duration, density, env.reducedMotion, env.lowPower])
  return <canvas ref={ref} className="confetti" aria-hidden />
}

/* ------------------------------------------------------------------ */
/*  Desktop-only sparkle cursor trail (normal cursor kept)             */
/* ------------------------------------------------------------------ */
export function CursorSparkles() {
  const { env } = useGame()
  const ref = useRef<HTMLCanvasElement>(null)
  const enabled = env.finePointer && !env.reducedMotion && !env.lowPower
  useEffect(() => {
    if (!enabled) return
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
    }
    resize()
    type S = { x: number; y: number; life: number; s: number; c: string; vy: number }
    const ps: S[] = []
    let last = 0
    let raf = 0
    let running = false
    const colors = ['#ffd23f', '#ffffff', '#ff8fc7', '#7be3b0']
    const loop = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life -= 0.035
        p.y += p.vy
        if (p.life <= 0) {
          ps.splice(i, 1)
          continue
        }
        ctx.globalAlpha = p.life * 0.8
        ctx.fillStyle = p.c
        const s = p.s * p.life
        ctx.beginPath()
        ctx.moveTo(p.x, p.y - s)
        ctx.quadraticCurveTo(p.x, p.y, p.x + s, p.y)
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + s)
        ctx.quadraticCurveTo(p.x, p.y, p.x - s, p.y)
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - s)
        ctx.fill()
      }
      if (ps.length) raf = requestAnimationFrame(loop)
      else running = false
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const now = performance.now()
      if (now - last < 45) return
      last = now
      ps.push({ x: e.clientX + 8, y: e.clientY + 10, life: 1, s: 4 + Math.random() * 4, c: colors[(Math.random() * colors.length) | 0], vy: 0.4 })
      if (ps.length > 24) ps.shift()
      if (!running) {
        running = true
        raf = requestAnimationFrame(loop)
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
    }
  }, [enabled])
  if (!enabled) return null
  return <canvas ref={ref} className="cursor-sparkles" aria-hidden />
}

/* ------------------------------------------------------------------ */
/*  3D tilt on pointer (cards, mission nodes)                          */
/* ------------------------------------------------------------------ */
export function TiltCard({ children, className = '', max = 10, disabled = false }: { children: ReactNode; className?: string; max?: number; disabled?: boolean }) {
  const { env } = useGame()
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 18 })
  const sry = useSpring(ry, { stiffness: 200, damping: 18 })
  const off = disabled || env.reducedMotion || !env.finePointer
  return (
    <motion.div
      className={`tilt ${className}`}
      style={off ? undefined : { rotateX: srx, rotateY: sry, transformPerspective: 800 }}
      onPointerMove={(e) => {
        if (off) return
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        ry.set(px * max * 2)
        rx.set(-py * max * 2)
      }}
      onPointerLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Speech bubble with typed-in reveal                                 */
/* ------------------------------------------------------------------ */
export function Speech({
  who = 'نور',
  children,
  tail = 'right',
  className = '',
  id,
}: {
  who?: string
  children: ReactNode
  tail?: 'left' | 'right' | 'bottom' | 'none'
  className?: string
  id?: string | number
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        className={`speech ${className}`}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
        transition={{ type: 'spring', duration: 0.45, bounce: 0.35 }}
        role="status"
        aria-live="polite"
      >
        {who && <span className="who">{who}</span>}
        {children}
        {tail !== 'none' && <span className={`tail tail-${tail}`} />}
      </motion.div>
    </AnimatePresence>
  )
}

/** Measure an element's rect after layout; re-measures on resize. */
export function useRect<T extends Element>() {
  const ref = useRef<T>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const m = () => setRect(el.getBoundingClientRect())
    m()
    const ro = new ResizeObserver(m)
    ro.observe(el)
    window.addEventListener('resize', m)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', m)
    }
  }, [])
  return [ref, rect] as const
}
