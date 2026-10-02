import { useId, type CSSProperties } from 'react'

/**
 * Shared "3D cartoon" object kit. Every object uses the same lighting recipe:
 * a top-left highlight, a soft core colour and a darker rim at the bottom
 * right, so all art reads as one universe.
 */
type P = { size?: number; className?: string; style?: CSSProperties; title?: string }

const svgProps = (size: number, className?: string, style?: CSSProperties, title?: string) => ({
  width: size,
  height: size,
  className,
  style,
  role: title ? 'img' : undefined,
  'aria-label': title,
  'aria-hidden': title ? undefined : true,
})

/** Radial "ball" gradient: light → base → shade. */
function Ball({ id, light, base, shade }: { id: string; light: string; base: string; shade: string }) {
  return (
    <radialGradient id={id} cx="35%" cy="30%" r="75%">
      <stop offset="0" stopColor={light} />
      <stop offset="0.45" stopColor={base} />
      <stop offset="1" stopColor={shade} />
    </radialGradient>
  )
}

export function Capsule({ size = 64, className, style, title, a = '#ff6b8b', b = '#ffffff' }: P & { a?: string; b?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" {...svgProps(size, className, style, title)}>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.3" stopColor={a} />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor={b} />
          <stop offset="1" stopColor="#b9c3e6" />
        </linearGradient>
      </defs>
      <g transform="rotate(-38 32 32)">
        <ellipse cx="32" cy="46" rx="22" ry="4" fill="#17206b" opacity="0.12" />
        <path d="M32 20h12a12 12 0 0 1 0 24H32Z" fill={`url(#${id}a)`} />
        <path d="M32 20H20a12 12 0 0 0 0 24h12Z" fill={`url(#${id}b)`} />
        <path d="M32 20h12a12 12 0 0 1 0 24H20a12 12 0 0 1 0-24Z" fill="none" stroke="#17206b" strokeOpacity="0.18" strokeWidth="1.5" />
        <rect x="14" y="23.5" width="30" height="4" rx="2" fill="#fff" opacity="0.75" />
      </g>
    </svg>
  )
}

export function Star({ size = 48, className, style, title, color = '#ffd23f' }: P & { color?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" {...svgProps(size, className, style, title)}>
      <defs>
        <Ball id={id} light="#fff6c7" base={color} shade="#f29a0b" />
      </defs>
      <path
        d="M32 5.5l7.8 16.2 17.7 2.4-12.9 12.4 3.2 17.6L32 45.6l-15.8 8.5 3.2-17.6L6.5 24.1l17.7-2.4Z"
        fill={`url(#${id})`}
        stroke="#e08a00"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M21 22.5c3-1 6-1 8-4" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  )
}

export function Heart({ size = 52, className, style, title }: P) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" {...svgProps(size, className, style, title)}>
      <defs>
        <Ball id={id} light="#ffd1e3" base="#ff5f8f" shade="#d12d63" />
      </defs>
      <path
        d="M32 55S7 41 7 23.5C7 15 13.5 9 21 9c5 0 8.6 2.6 11 6.4C34.4 11.6 38 9 43 9c7.5 0 14 6 14 14.5C57 41 32 55 32 55Z"
        fill={`url(#${id})`}
        stroke="#c2255a"
        strokeWidth="2"
      />
      <ellipse cx="20" cy="20" rx="5" ry="3.4" fill="#fff" opacity="0.75" transform="rotate(-30 20 20)" />
    </svg>
  )
}

export function MiniShield({ size = 56, className, style, title, gold = false }: P & { gold?: boolean }) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" {...svgProps(size, className, style, title)}>
      <defs>
        {gold ? (
          <Ball id={id} light="#fff3b0" base="#ffc83d" shade="#e08a00" />
        ) : (
          <Ball id={id} light="#c7f3ff" base="#4cbcff" shade="#2f5bea" />
        )}
      </defs>
      <path
        d="M32 5 54 13v16c0 15-9.5 25-22 30C19.5 54 10 44 10 29V13Z"
        fill={`url(#${id})`}
        stroke={gold ? '#c77800' : '#1c3aa8'}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M32 11v42M16 26h32" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
      <path d="M17 15.5 30 11" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
    </svg>
  )
}

export function Sparkle({ size = 28, className, style, color = '#fff' }: P & { color?: string }) {
  return (
    <svg viewBox="0 0 32 32" {...svgProps(size, className, style)}>
      <path d="M16 1c1.4 8 7 13.6 15 15-8 1.4-13.6 7-15 15-1.4-8-7-13.6-15-15 8-1.4 13.6-7 15-15Z" fill={color} />
    </svg>
  )
}

/** Friendly bacteria — rounded blob with eyes, used as ambient decoration. */
export function Germ({
  size = 60,
  className,
  style,
  title,
  hue = 'green',
  mood = 'happy',
  shield = false,
}: P & { hue?: 'green' | 'purple' | 'orange' | 'blue' | 'pink'; mood?: 'happy' | 'sleepy' | 'surprised'; shield?: boolean }) {
  const id = useId()
  const pal = {
    green: ['#d9ffb8', '#8ee05a', '#3f9e2a'],
    purple: ['#ecd9ff', '#b884ff', '#6c35d6'],
    orange: ['#ffe2b8', '#ffad5a', '#d96d14'],
    blue: ['#d2f1ff', '#63c5ff', '#1f73c9'],
    pink: ['#ffd9ec', '#ff8fc7', '#cf3f86'],
  }[hue]
  return (
    <svg viewBox="0 0 80 80" {...svgProps(size, className, style, title)}>
      <defs>
        <Ball id={id} light={pal[0]} base={pal[1]} shade={pal[2]} />
      </defs>
      <g stroke={pal[2]} strokeWidth="3.5" strokeLinecap="round">
        <path d="M14 30 6 26M12 50l-8 3M66 28l8-4M68 50l8 3M40 10V3M28 70l-3 7M52 70l3 7" />
      </g>
      <g fill={pal[1]}>
        <circle cx="6" cy="26" r="3" />
        <circle cx="4" cy="53" r="3" />
        <circle cx="74" cy="24" r="3" />
        <circle cx="76" cy="53" r="3" />
        <circle cx="40" cy="3" r="3" />
      </g>
      <path
        d="M40 9c17 0 30 12 30 29 0 18-13 31-30 31S10 56 10 38C10 21 23 9 40 9Z"
        fill={`url(#${id})`}
        stroke={pal[2]}
        strokeWidth="2"
      />
      <circle cx="24" cy="26" r="4" fill="#fff" opacity="0.55" />
      <circle cx="56" cy="52" r="3" fill={pal[2]} opacity="0.25" />
      <circle cx="22" cy="50" r="2.4" fill={pal[2]} opacity="0.25" />
      {mood === 'sleepy' ? (
        <g stroke="#17206b" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M28 37q4 3 8 0M44 37q4 3 8 0" />
        </g>
      ) : (
        <g className="blink" style={{ ['--delay' as string]: `${(size % 7) * 0.4}s` }}>
          <ellipse cx="32" cy="36" rx="6" ry={mood === 'surprised' ? 8 : 7} fill="#fff" />
          <ellipse cx="48" cy="36" rx="6" ry={mood === 'surprised' ? 8 : 7} fill="#fff" />
          <circle cx="33" cy="37" r="3.4" fill="#17206b" />
          <circle cx="49" cy="37" r="3.4" fill="#17206b" />
          <circle cx="34.3" cy="35.6" r="1.2" fill="#fff" />
          <circle cx="50.3" cy="35.6" r="1.2" fill="#fff" />
        </g>
      )}
      {mood === 'surprised' ? (
        <ellipse cx="40" cy="52" rx="4" ry="5" fill="#17206b" />
      ) : (
        <path d="M33 49q7 7 14 0" stroke="#17206b" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
      <ellipse cx="25" cy="46" rx="4" ry="2.4" fill="#ff7aa8" opacity="0.5" />
      <ellipse cx="55" cy="46" rx="4" ry="2.4" fill="#ff7aa8" opacity="0.5" />
      {shield && (
        <g transform="translate(46 44) scale(0.5)">
          <path d="M32 5 54 13v16c0 15-9.5 25-22 30C19.5 54 10 44 10 29V13Z" fill="#ffc83d" stroke="#c77800" strokeWidth="4" />
          <path d="M22 28l7 7 13-13" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      )}
    </svg>
  )
}

export function Cloud({ width = 180, className, style, opacity = 1 }: { width?: number; className?: string; style?: CSSProperties; opacity?: number }) {
  const id = useId()
  return (
    <svg viewBox="0 0 200 100" width={width} height={width / 2} className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#dfeeff" />
        </linearGradient>
      </defs>
      <path
        d="M40 88c-18 0-30-11-30-25s12-24 28-24c4-17 18-29 37-29 17 0 30 9 36 23 5-3 10-4 16-4 18 0 33 13 34 30 15 2 28 13 28 29H40Z"
        fill={`url(#${id})`}
        opacity={opacity}
      />
      <path d="M30 60c3-9 11-14 21-14" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
    </svg>
  )
}

export function Lock({ size = 34, className, style }: P) {
  const id = useId()
  return (
    <svg viewBox="0 0 48 48" {...svgProps(size, className, style)}>
      <defs>
        <Ball id={id} light="#fff3b0" base="#ffc83d" shade="#e08a00" />
      </defs>
      <path d="M15 21v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#8c94c4" strokeWidth="5" strokeLinecap="round" />
      <rect x="9" y="20" width="30" height="23" rx="8" fill={`url(#${id})`} stroke="#c77800" strokeWidth="2" />
      <circle cx="24" cy="30" r="3.5" fill="#8a5300" />
      <rect x="22.6" y="31" width="2.8" height="6" rx="1.4" fill="#8a5300" />
      <circle cx="17" cy="26" r="2.2" fill="#fff" opacity="0.8" />
    </svg>
  )
}

export function Bulb({ size = 56, className, style }: P) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" {...svgProps(size, className, style)}>
      <defs>
        <Ball id={id} light="#fffbe0" base="#ffe066" shade="#ffb000" />
      </defs>
      <g stroke="#ffcf3f" strokeWidth="3.5" strokeLinecap="round" opacity="0.9">
        <path d="M32 2v6M8 12l5 4M56 12l-5 4M3 32h6M55 32h6" />
      </g>
      <path d="M32 12c10 0 17 7.4 17 16.6 0 6-3 10-6 13-2 2-3 4-3 6.4H24c0-2.4-1-4.4-3-6.4-3-3-6-7-6-13C15 19.4 22 12 32 12Z" fill={`url(#${id})`} stroke="#e09a00" strokeWidth="2" />
      <rect x="23" y="49" width="18" height="5" rx="2.5" fill="#8c94c4" />
      <rect x="25" y="55" width="14" height="5" rx="2.5" fill="#6b73a8" />
      <path d="M24 22c2-3 5-4.5 8-4.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function CheckBadge({ size = 44, className, style }: P) {
  const id = useId()
  return (
    <svg viewBox="0 0 48 48" {...svgProps(size, className, style)}>
      <defs>
        <Ball id={id} light="#c9ffd9" base="#3cc46a" shade="#1f8a43" />
      </defs>
      <circle cx="24" cy="24" r="21" fill={`url(#${id})`} stroke="#fff" strokeWidth="3" />
      <path d="M14 25l7 7 14-15" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export function CrossBadge({ size = 44, className, style }: P) {
  const id = useId()
  return (
    <svg viewBox="0 0 48 48" {...svgProps(size, className, style)}>
      <defs>
        <Ball id={id} light="#ffd6d0" base="#ff7a6b" shade="#d1453a" />
      </defs>
      <circle cx="24" cy="24" r="21" fill={`url(#${id})`} stroke="#fff" strokeWidth="3" />
      <path d="M16 16l16 16M32 16 16 32" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  )
}
