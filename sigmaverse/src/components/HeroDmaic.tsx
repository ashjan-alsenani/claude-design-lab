import { motion } from 'motion/react'
import { useState } from 'react'
import { useReduced } from '../lib/motion'

const PHASES = [
  { k: 'D', name: 'Define', line: 'Frame the problem, the customer and the goal', color: 'var(--violet)' },
  { k: 'M', name: 'Measure', line: 'Baseline the process and trust the data', color: 'var(--sky)' },
  { k: 'A', name: 'Analyze', line: 'Prove the root causes', color: 'var(--teal)' },
  { k: 'I', name: 'Improve', line: 'Pilot and implement solutions', color: 'var(--amber)' },
  { k: 'C', name: 'Control', line: 'Sustain the gains', color: 'var(--coral)' },
]

/** Hero visual: the DMAIC cycle with Define as the active phase. */
export function HeroDmaic() {
  const reduced = useReduced()
  const [hover, setHover] = useState<number | null>(null)
  const cx = 220, cy = 200, R = 140
  const pts = PHASES.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / PHASES.length
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }
  })
  const shown = hover ?? 0
  return (
    <div className="relative">
      <svg viewBox="0 0 440 400" className="h-auto w-full" role="img" aria-label="The DMAIC cycle: Define, Measure, Analyze, Improve, Control. Define is the active phase.">
        <defs>
          <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="var(--violet)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--violet)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Orbit */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--line-2)" strokeWidth="2" />
        <motion.circle
          cx={cx} cy={cy} r={R} fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="6 18"
          initial={{ strokeDashoffset: 0 }}
          animate={reduced ? {} : { strokeDashoffset: -240 }}
          transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
          opacity={0.55}
        />
        {/* Centre */}
        <circle cx={cx} cy={cy} r="78" fill="var(--surface)" stroke="var(--line)" />
        <text x={cx} y={cy - 12} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="34" fill="var(--ink)">{PHASES[shown].name}</text>
        <foreignObject x={cx - 66} y={cy + 2} width="132" height="54">
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.3, textAlign: 'center', color: 'var(--ink-2)', fontFamily: 'var(--font-sans)' }}>{PHASES[shown].line}</p>
        </foreignObject>
        {/* Nodes */}
        {PHASES.map((ph, i) => {
          const active = i === 0
          const { x, y } = pts[i]
          return (
            <g key={ph.k} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'default' }}>
              {active && <circle cx={x} cy={y} r="62" fill="url(#hero-glow)" />}
              {active && !reduced && (
                <motion.circle cx={x} cy={y} r="38" fill="none" stroke="var(--violet)" strokeWidth="2"
                  initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 1.45, opacity: 0 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: [0.23, 1, 0.32, 1] }}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              )}
              <motion.circle
                cx={x} cy={y} r={active ? 38 : 27}
                fill={active ? 'var(--violet)' : 'var(--surface)'}
                stroke={active ? 'var(--violet)' : ph.color}
                strokeWidth={active ? 0 : 2.5}
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.09, duration: 0.5 }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
              <text x={x} y={y + (active ? 10 : 7)} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize={active ? 28 : 20} fill={active ? 'var(--surface)' : ph.color}>{ph.k}</text>
            </g>
          )
        })}
        {/* "You are here" */}
        <g>
          <rect x={pts[0].x + 46} y={pts[0].y - 14} width="98" height="28" rx="14" fill="var(--surface)" stroke="var(--violet)" />
          <text x={pts[0].x + 95} y={pts[0].y + 5} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="var(--violet)" fontFamily="var(--font-sans)">You are here</text>
        </g>
      </svg>
    </div>
  )
}
