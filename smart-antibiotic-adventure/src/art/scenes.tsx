import { useId, type ReactNode } from 'react'
import { Layer } from '../components/Parallax'
import { Cloud, Germ, Heart, Sparkle, Star, Capsule, MiniShield } from './objects'
import './scenes.css'

/* ------------------------------------------------------------------ */
/*  Shared building blocks (viewBox 1600 x 900, slice to cover)        */
/* ------------------------------------------------------------------ */

const VB = '0 0 1600 900'

function Svg({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox={VB} preserveAspectRatio="xMidYMax slice" className={`scene-svg ${className}`} aria-hidden>
      {children}
    </svg>
  )
}

function Windows({ x, y, cols, rows, gap = 34, c = '#fff8c9' }: { x: number; y: number; cols: number; rows: number; gap?: number; c?: string }) {
  const out: ReactNode[] = []
  for (let r = 0; r < rows; r++)
    for (let k = 0; k < cols; k++) {
      const lit = (r * 7 + k * 3) % 5 === 0
      out.push(
        <rect
          key={`${r}-${k}`}
          x={x + k * gap}
          y={y + r * (gap + 6)}
          width={18}
          height={24}
          rx={6}
          fill={c}
          className={lit ? 'win-blink' : undefined}
          style={lit ? { animationDelay: `${(r + k) * 0.7}s` } : undefined}
        />,
      )
    }
  return <g>{out}</g>
}

function Tree({ x, y, s = 1, c = '#5fd38a', d = '#2fa35d', delay = 0 }: { x: number; y: number; s?: number; c?: string; d?: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-9" y="-40" width="18" height="60" rx="8" fill="#a5734a" />
      <g className="sway" style={{ ['--delay' as string]: `${delay}s` }}>
        <circle cx="0" cy="-80" r="52" fill={d} />
        <circle cx="-28" cy="-62" r="36" fill={c} />
        <circle cx="24" cy="-96" r="34" fill={c} />
        <circle cx="-14" cy="-104" r="22" fill="#9df0b8" opacity="0.7" />
      </g>
    </g>
  )
}

function Flower({ x, y, c = '#ff8fc7', s = 1, delay = 0 }: { x: number; y: number; c?: string; s?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="sway" style={{ ['--delay' as string]: `${delay}s`, ['--dur' as string]: '3.4s' }}>
        <path d="M0 0v-34" stroke="#3fae5f" strokeWidth="5" strokeLinecap="round" />
        <path d="M0-14c8-8 16-6 18-2-6 5-12 6-18 2Z" fill="#5fd38a" />
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-48" rx="8" ry="12" fill={c} transform={`rotate(${a} 0 -36)`} />
        ))}
        <circle cx="0" cy="-36" r="7" fill="#ffd23f" />
      </g>
    </g>
  )
}

function Sun({ x, y, r = 70 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="spin-slow" style={{ ['--dur' as string]: '40s' }}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={-8} y={-r - 52} width={16} height={36} rx={8} fill="#ffe27a" opacity="0.8" transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle r={r + 16} fill="#fff3b0" opacity="0.6" />
      <circle r={r} fill="#ffd23f" />
      <circle r={r - 12} fill="#ffe27a" />
      <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.22} fill="#fff" opacity="0.6" />
    </g>
  )
}

function Hills({ c1, c2, c3 }: { c1: string; c2: string; c3: string }) {
  return (
    <g>
      <path d="M0 640C220 520 420 560 620 600s420-110 640-60 260 70 340 60v360H0Z" fill={c1} />
      <path d="M0 720c200-80 380-40 560-10s420 40 620-20 300-40 420-10v220H0Z" fill={c2} />
      <path d="M0 800c260-40 520-10 800 0s520-20 800-10v110H0Z" fill={c3} />
    </g>
  )
}

/** Drifting clouds as an HTML layer (cheaper than SVG animation). */
function Clouds({ n = 4, top = 4, dark = false }: { n?: number; top?: number; dark?: boolean }) {
  const specs = [
    { y: top, w: 220, d: 70, delay: 0 },
    { y: top + 9, w: 160, d: 90, delay: 30 },
    { y: top + 3, w: 260, d: 110, delay: 60 },
    { y: top + 14, w: 140, d: 80, delay: 15 },
    { y: top + 6, w: 190, d: 100, delay: 85 },
  ].slice(0, n)
  return (
    <div className="clouds" aria-hidden>
      {specs.map((c, i) => (
        <div key={i} className="cloud drift-x" style={{ top: `${c.y}%`, ['--dur' as string]: `${c.d}s`, ['--delay' as string]: `-${c.delay}s` }}>
          <Cloud width={c.w} opacity={dark ? 0.25 : 0.95} />
        </div>
      ))}
    </div>
  )
}

/** Rising bubbles / particles. */
export function Bubbles({ n = 10, color = 'rgb(255 255 255 / 0.55)', className = '' }: { n?: number; color?: string; className?: string }) {
  return (
    <div className={`bubbles rm-hide ${className}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => {
        const s = 10 + ((i * 37) % 26)
        return (
          <span
            key={i}
            className="bubble rise"
            style={{
              left: `${(i * 53) % 100}%`,
              width: s,
              height: s,
              background: color,
              ['--dur' as string]: `${8 + ((i * 13) % 9)}s`,
              ['--delay' as string]: `-${(i * 1.7) % 9}s`,
            }}
          />
        )
      })}
    </div>
  )
}

function Twinkles({ n = 12, color = '#fff' }: { n?: number; color?: string }) {
  return (
    <div className="twinkles" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <Sparkle
          key={i}
          size={10 + ((i * 7) % 14)}
          color={color}
          className="twinkle tw"
          style={{
            left: `${(i * 61 + 7) % 100}%`,
            top: `${(i * 37 + 3) % 55}%`,
            ['--delay' as string]: `${(i * 0.37) % 2.6}s`,
            ['--dur' as string]: `${2 + (i % 4) * 0.6}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Health City (landing)                                              */
/* ------------------------------------------------------------------ */

function Hospital({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="230" height="260" rx="22" fill="#ffffff" />
      <rect x="0" y="0" width="230" height="40" rx="18" fill="#4cbcff" />
      <rect x="85" y="-70" width="60" height="60" rx="16" fill="#fff" stroke="#ff6b8b" strokeWidth="6" />
      <path d="M115-58v36M97-40h36" stroke="#ff6b8b" strokeWidth="12" strokeLinecap="round" />
      <Windows x={24} y={62} cols={5} rows={3} gap={38} c="#bde9ff" />
      <rect x="90" y="196" width="50" height="64" rx="14" fill="#4cbcff" />
    </g>
  )
}

function ClockTower({ x, y, h = 330 }: { x: number; y: number; h?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-20 0 60-90 140 0Z" fill="#1fc8c0" />
      <rect x="0" y="0" width="120" height={h} rx="14" fill="#7be3b0" />
      <circle cx="60" cy="70" r="44" fill="#fff" stroke="#1fc8c0" strokeWidth="8" />
      <g transform="translate(60 70)">
        <g className="spin-slow" style={{ ['--dur' as string]: '12s' }}>
          <circle r="40" fill="none" />
          <rect x="-3" y="-34" width="6" height="36" rx="3" fill="#17206b" />
        </g>
        <g className="spin-slow" style={{ ['--dur' as string]: '120s' }}>
          <circle r="40" fill="none" />
          <rect x="-4" y="-22" width="8" height="24" rx="4" fill="#ff6b8b" />
        </g>
      </g>
      <circle cx="60" cy="70" r="6" fill="#17206b" />
      <Windows x={28} y={140} cols={2} rows={3} gap={44} c="#e4fff1" />
    </g>
  )
}

function Castle({ x, y, s = 1, gold = false }: { x: number; y: number; s?: number; gold?: boolean }) {
  const wall = gold ? '#ffe08a' : '#c9b6ff'
  const tower = gold ? '#ffc83d' : '#a46bff'
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="40" y="60" width="220" height="180" rx="10" fill={wall} />
      {[40, 80, 120, 160, 200, 240].map((t) => (
        <rect key={t} x={t} y="44" width="22" height="26" rx="4" fill={wall} />
      ))}
      <rect x="0" y="10" width="70" height="230" rx="10" fill={tower} />
      <rect x="230" y="10" width="70" height="230" rx="10" fill={tower} />
      <path d="M-8 14 35-60 78 14Z" fill="#ff6b8b" />
      <path d="M222 14l43-74 43 74Z" fill="#ff6b8b" />
      <g className="flag-wave">
        <rect x="33" y="-110" width="5" height="54" fill="#8c6a4a" />
        <path d="M38-110c16-6 26 8 42 0v26c-16 8-26-6-42 0Z" fill="#ffd23f" />
      </g>
      <g className="flag-wave" style={{ animationDelay: '-0.6s' }}>
        <rect x="263" y="-110" width="5" height="54" fill="#8c6a4a" />
        <path d="M268-110c16-6 26 8 42 0v26c-16 8-26-6-42 0Z" fill="#4cbcff" />
      </g>
      <path d="M120 240v-70a30 30 0 0 1 60 0v70Z" fill={gold ? '#c77800' : '#6c35d6'} />
      <circle cx="35" cy="80" r="14" fill="#fff8c9" />
      <circle cx="265" cy="80" r="14" fill="#fff8c9" />
      <g transform="translate(150 110)">
        <path d="M0-32 26-22v14c0 16-11 26-26 32-15-6-26-16-26-32v-14Z" fill={gold ? '#fff' : '#ffd23f'} stroke={gold ? '#c77800' : '#e08a00'} strokeWidth="4" />
      </g>
    </g>
  )
}

function House({ x, y, w = 120, c = '#ff9f2e', roof = '#ff6b8b' }: { x: number; y: number; w?: number; c?: string; roof?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M-12 0 ${w / 2}-60 ${w + 12} 0Z`} fill={roof} />
      <rect x="0" y="0" width={w} height="110" rx="10" fill={c} />
      <rect x={w / 2 - 16} y="56" width="32" height="54" rx="10" fill="#fff" opacity="0.85" />
      <rect x="14" y="20" width="24" height="24" rx="6" fill="#fff8c9" />
      <rect x={w - 38} y="20" width="24" height="24" rx="6" fill="#fff8c9" />
    </g>
  )
}

export function CityScene() {
  const id = useId()
  return (
    <div className="scene scene-city" aria-hidden>
      <Layer depth={0.15}>
        <Svg>
          <Sun x={1340} y={170} />
        </Svg>
        <Twinkles n={10} />
        <Clouds n={5} top={6} />
      </Layer>
      <Layer depth={0.4}>
        <Svg>
          <defs>
            <linearGradient id={`${id}far`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a8c8ff" />
              <stop offset="1" stopColor="#c7b6ff" />
            </linearGradient>
          </defs>
          <g fill={`url(#${id}far)`} opacity="0.85">
            <rect x="60" y="360" width="90" height="320" rx="14" />
            <rect x="170" y="300" width="110" height="380" rx="14" />
            <rect x="300" y="400" width="80" height="280" rx="14" />
            <rect x="1180" y="330" width="100" height="350" rx="14" />
            <rect x="1300" y="390" width="120" height="290" rx="14" />
            <rect x="1440" y="300" width="90" height="380" rx="14" />
            <circle cx="225" cy="300" r="40" />
          </g>
          <Windows x={186} y={330} cols={2} rows={5} gap={40} c="#e8e1ff" />
          <Windows x={1316} y={420} cols={2} rows={4} gap={44} c="#e8e1ff" />
          <Hills c1="#9fe3b5" c2="#7fd69d" c3="#6bcf8d" />
        </Svg>
      </Layer>
      <Layer depth={0.8}>
        <Svg>
          <Hospital x={300} y={420} />
          <ClockTower x={600} y={350} />
          <Castle x={1100} y={420} s={0.95} />
          <House x={780} y={570} c="#ffad5a" roof="#ff6b8b" />
          <House x={930} y={590} w={100} c="#a46bff" roof="#ffd23f" />
          <House x={60} y={590} w={110} c="#ff8fc7" roof="#a46bff" />
          <Tree x={250} y={700} s={0.9} delay={0.3} />
          <Tree x={1040} y={700} s={0.8} c="#7be3b0" d="#1fc8c0" delay={1.2} />
          <Tree x={1500} y={710} s={1.1} delay={0.6} />
        </Svg>
      </Layer>
      <Layer depth={1.4}>
        <Svg>
          <defs>
            <linearGradient id={`${id}plaza`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff2d6" />
              <stop offset="1" stopColor="#f6d9a8" />
            </linearGradient>
            <pattern id={`${id}tile`} width="120" height="60" patternUnits="userSpaceOnUse" patternTransform="skewX(-25)">
              <rect width="120" height="60" fill="none" stroke="#e8c48a" strokeWidth="3" />
              <circle cx="60" cy="30" r="10" fill="none" stroke="#efcf9d" strokeWidth="3" />
            </pattern>
          </defs>
          <path d="M0 760c300-30 600-40 800-40s500 10 800 40v140H0Z" fill={`url(#${id}plaza)`} />
          <path d="M0 760c300-30 600-40 800-40s500 10 800 40v140H0Z" fill={`url(#${id}tile)`} />
          <Flower x={90} y={800} c="#ff8fc7" delay={0.2} />
          <Flower x={130} y={815} c="#ffd23f" s={0.8} delay={0.9} />
          <Flower x={1480} y={805} c="#a46bff" delay={0.5} />
          <Flower x={1525} y={820} c="#ff7a6b" s={0.85} delay={1.4} />
          <Flower x={1430} y={822} c="#4cbcff" s={0.7} delay={0.1} />
        </Svg>
      </Layer>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Mission scenes                                                     */
/* ------------------------------------------------------------------ */

function Floor({ c1, c2, line }: { c1: string; c2: string; line: string }) {
  const id = useId()
  return (
    <g>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <pattern id={`${id}p`} width="140" height="70" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)">
          <rect width="140" height="70" fill="none" stroke={line} strokeWidth="3" />
        </pattern>
      </defs>
      <rect x="0" y="720" width="1600" height="180" fill={`url(#${id}f)`} />
      <rect x="0" y="720" width="1600" height="180" fill={`url(#${id}p)`} />
      <rect x="0" y="712" width="1600" height="14" fill="#fff" opacity="0.6" />
    </g>
  )
}

export function ClinicScene() {
  return (
    <div className="scene scene-clinic" aria-hidden>
      <Layer depth={0.3}>
        <Svg>
          <rect x="0" y="470" width="1600" height="250" fill="#ffe486" />
          <rect x="0" y="462" width="1600" height="16" fill="#ffd23f" />
          {/* window with sky */}
          <g transform="translate(980 120)">
            <rect x="0" y="0" width="360" height="260" rx="30" fill="#fff" />
            <rect x="16" y="16" width="328" height="228" rx="20" fill="#9fe0ff" />
            <circle cx="270" cy="80" r="36" fill="#ffd23f" />
            <path d="M50 150c0-18 16-30 34-28 6-18 34-22 46-6 20-4 36 10 34 30Z" fill="#fff" />
            <path d="M16 210c80-40 160-20 328-40v54a20 20 0 0 1-20 20H36a20 20 0 0 1-20-20Z" fill="#7be3b0" />
            <rect x="174" y="16" width="12" height="228" fill="#fff" />
            <rect x="16" y="124" width="328" height="12" fill="#fff" />
          </g>
          {/* eye chart */}
          <g transform="translate(240 150)">
            <rect width="170" height="240" rx="18" fill="#fff" />
            <text x="85" y="70" textAnchor="middle" fontSize="54" fontWeight="800" fill="#2f5bea">E</text>
            <text x="85" y="122" textAnchor="middle" fontSize="34" fontWeight="800" fill="#ff6b8b">ب ت</text>
            <text x="85" y="162" textAnchor="middle" fontSize="24" fontWeight="800" fill="#1fc8c0">ج ح خ</text>
            <text x="85" y="196" textAnchor="middle" fontSize="16" fontWeight="800" fill="#a46bff">د ذ ر ز</text>
          </g>
          {/* red cross sign */}
          <g transform="translate(640 120)" className="glow-soft">
            <circle cx="60" cy="60" r="60" fill="#fff" />
            <path d="M60 22v76M22 60h76" stroke="#ff6b8b" strokeWidth="26" strokeLinecap="round" />
          </g>
        </Svg>
      </Layer>
      <Layer depth={0.7}>
        <Svg>
          <Floor c1="#d7f1ff" c2="#a8dcff" line="#c2e6ff" />
          {/* bed */}
          <g transform="translate(1040 520)">
            <rect x="0" y="80" width="420" height="70" rx="20" fill="#4cbcff" />
            <rect x="10" y="40" width="400" height="60" rx="24" fill="#fff" />
            <rect x="20" y="20" width="110" height="50" rx="22" fill="#ffe486" />
            <rect x="0" y="0" width="22" height="210" rx="10" fill="#2f5bea" />
            <rect x="398" y="40" width="22" height="170" rx="10" fill="#2f5bea" />
          </g>
          {/* cabinet */}
          <g transform="translate(150 450)">
            <rect width="230" height="270" rx="22" fill="#fff" />
            <rect x="16" y="16" width="198" height="110" rx="14" fill="#c8ecff" />
            <rect x="34" y="60" width="34" height="56" rx="10" fill="#ff9f2e" />
            <rect x="82" y="72" width="30" height="44" rx="10" fill="#a46bff" />
            <rect x="126" y="56" width="40" height="60" rx="12" fill="#3cc46a" />
            <rect x="16" y="140" width="198" height="112" rx="14" fill="#ffe486" />
            <circle cx="115" cy="196" r="10" fill="#ff9f2e" />
          </g>
          {/* plant */}
          <g transform="translate(860 610)">
            <rect x="-40" y="40" width="80" height="80" rx="18" fill="#ff7a6b" />
            <g className="sway">
              <path d="M0 40C-20 0-60-10-70-40 -30-40-6-10 0 40Z" fill="#3cc46a" />
              <path d="M0 40C20-10 50-20 70-60 30-56 6-20 0 40Z" fill="#5fd38a" />
              <path d="M0 40C-6 0 0-50 10-80 24-40 12 0 0 40Z" fill="#7be3b0" />
            </g>
          </g>
        </Svg>
      </Layer>
      <Layer depth={0.2} className="lamp-layer">
        <Svg>
          <g className="lamp-swing">
            <rect x="798" y="0" width="4" height="70" fill="#8c94c4" />
            <path d="M740 110a60 44 0 0 1 120 0Z" fill="#ffd23f" />
            <circle cx="800" cy="112" r="14" fill="#fff8c9" />
          </g>
        </Svg>
      </Layer>
      <Twinkles n={8} color="#ffe27a" />
    </div>
  )
}

export function ClockScene() {
  return (
    <div className="scene scene-clock" aria-hidden>
      <Layer depth={0.3}>
        <Svg>
          {/* wallpaper stripes */}
          {Array.from({ length: 17 }, (_, i) => (
            <rect key={i} x={i * 100} y="0" width="50" height="720" fill="#fff" opacity="0.18" />
          ))}
          {/* big gears */}
          <g transform="translate(180 210)">
            <g className="spin-slow" style={{ ['--dur' as string]: '24s' }}>
              <Gear r={120} c="#7be3b0" />
            </g>
          </g>
          <g transform="translate(360 120)">
            <g className="spin-slow rev" style={{ ['--dur' as string]: '14s' }}>
              <Gear r={70} c="#1fc8c0" />
            </g>
          </g>
          <g transform="translate(1440 520)">
            <g className="spin-slow" style={{ ['--dur' as string]: '20s' }}>
              <Gear r={110} c="#9df0d8" />
            </g>
          </g>
          {/* shelves */}
          <g transform="translate(1120 150)">
            <rect x="0" y="100" width="320" height="16" rx="8" fill="#0d8e8a" />
            <rect x="0" y="240" width="320" height="16" rx="8" fill="#0d8e8a" />
            <rect x="24" y="40" width="44" height="60" rx="12" fill="#ff9f2e" />
            <rect x="84" y="56" width="36" height="44" rx="10" fill="#ff8fc7" />
            <rect x="140" y="34" width="50" height="66" rx="14" fill="#a46bff" />
            <rect x="210" y="50" width="40" height="50" rx="10" fill="#ffd23f" />
            <rect x="34" y="184" width="70" height="56" rx="12" fill="#fff" />
            <rect x="122" y="170" width="44" height="70" rx="12" fill="#4cbcff" />
            <rect x="190" y="190" width="90" height="50" rx="12" fill="#ff7a6b" />
          </g>
          {/* pendulum */}
          <g className="pendulum">
            <rect x="797" y="0" width="6" height="250" fill="#0d8e8a" />
            <circle cx="800" cy="260" r="34" fill="#ffd23f" stroke="#e08a00" strokeWidth="6" />
          </g>
        </Svg>
      </Layer>
      <Layer depth={0.7}>
        <Svg>
          <Floor c1="#c6fbe6" c2="#8fe6c5" line="#aef3d8" />
          <g transform="translate(120 560)">
            <rect width="300" height="160" rx="24" fill="#1fc8c0" />
            <rect x="20" y="20" width="120" height="120" rx="16" fill="#e4fff1" />
            <rect x="160" y="20" width="120" height="120" rx="16" fill="#e4fff1" />
          </g>
        </Svg>
      </Layer>
      <Bubbles n={12} />
    </div>
  )
}

function Gear({ r, c }: { r: number; c: string }) {
  const teeth = Math.round(r / 9)
  return (
    <g>
      {Array.from({ length: teeth }, (_, i) => (
        <rect key={i} x={-r * 0.1} y={-r - r * 0.16} width={r * 0.2} height={r * 0.3} rx={r * 0.05} fill={c} transform={`rotate(${(i * 360) / teeth})`} />
      ))}
      <circle r={r} fill={c} />
      <circle r={r * 0.45} fill="#fff" opacity="0.5" />
      <circle r={r * 0.18} fill={c} />
    </g>
  )
}

export function GardenScene() {
  return (
    <div className="scene scene-garden" aria-hidden>
      <Layer depth={0.15}>
        <Svg>
          <Sun x={260} y={150} r={60} />
          {/* rainbow */}
          <g fill="none" strokeWidth="26" opacity="0.55">
            <path d="M900 600a340 340 0 0 1 680 0" stroke="#ff8fc7" />
            <path d="M926 600a314 314 0 0 1 628 0" stroke="#ffd23f" />
            <path d="M952 600a288 288 0 0 1 576 0" stroke="#7be3b0" />
            <path d="M978 600a262 262 0 0 1 524 0" stroke="#5ec8ff" />
            <path d="M1004 600a236 236 0 0 1 472 0" stroke="#a46bff" />
          </g>
        </Svg>
        <Clouds n={3} top={5} />
      </Layer>
      <Layer depth={0.45}>
        <Svg>
          <Hills c1="#e9c8ff" c2="#d6a8ff" c3="#c08bff" />
          {/* school */}
          <g transform="translate(560 330)">
            <path d="M-20 80 200 0l220 80Z" fill="#ff8fc7" />
            <rect x="0" y="80" width="400" height="260" rx="16" fill="#fff4fb" />
            <rect x="160" y="200" width="80" height="140" rx="40" fill="#a46bff" />
            <Windows x={30} y={110} cols={2} rows={2} gap={50} c="#e8d9ff" />
            <Windows x={290} y={110} cols={2} rows={2} gap={50} c="#e8d9ff" />
            <circle cx="200" cy="130" r="30" fill="#fff" stroke="#ff8fc7" strokeWidth="6" />
            <rect x="196" y="-80" width="8" height="80" fill="#8c6a4a" />
            <path className="flag-wave" d="M204-80c20-8 34 8 54 0v34c-20 8-34-8-54 0Z" fill="#3cc46a" />
          </g>
        </Svg>
      </Layer>
      <Layer depth={0.9}>
        <Svg>
          <Tree x={150} y={760} s={1.1} c="#ff9fd2" d="#e86bb0" delay={0.4} />
          <Tree x={1450} y={760} s={1.2} c="#c5a3ff" d="#9a6bff" delay={1} />
          <Tree x={380} y={770} s={0.8} delay={1.6} />
          <path d="M600 900c60-120 140-180 200-180s140 60 200 180Z" fill="#fff0c9" />
          {Array.from({ length: 14 }, (_, i) => (
            <Flower key={i} x={60 + i * 115 + (i % 2) * 30} y={840 + (i % 3) * 18} s={0.8 + (i % 3) * 0.15} delay={i * 0.3} c={['#ff8fc7', '#ffd23f', '#a46bff', '#ff7a6b', '#5ec8ff'][i % 5]} />
          ))}
          {/* bench */}
          <g transform="translate(1060 690)">
            <rect x="0" y="0" width="220" height="22" rx="10" fill="#ff9f2e" />
            <rect x="0" y="34" width="220" height="22" rx="10" fill="#ff9f2e" />
            <rect x="20" y="56" width="16" height="50" rx="6" fill="#c45a0a" />
            <rect x="184" y="56" width="16" height="50" rx="6" fill="#c45a0a" />
          </g>
        </Svg>
      </Layer>
      <div className="butterflies rm-hide" aria-hidden>
        {[0, 1, 2].map((i) => (
          <svg key={i} viewBox="0 0 40 30" className={`butterfly b${i}`}>
            <g className="wings">
              <ellipse cx="12" cy="12" rx="10" ry="9" fill={['#ff8fc7', '#ffd23f', '#a46bff'][i]} />
              <ellipse cx="28" cy="12" rx="10" ry="9" fill={['#ff8fc7', '#ffd23f', '#a46bff'][i]} />
              <ellipse cx="13" cy="23" rx="6" ry="5" fill="#fff" opacity="0.8" />
              <ellipse cx="27" cy="23" rx="6" ry="5" fill="#fff" opacity="0.8" />
            </g>
            <rect x="18.5" y="6" width="3" height="20" rx="1.5" fill="#17206b" />
          </svg>
        ))}
      </div>
      <FloatHearts />
    </div>
  )
}

function FloatHearts() {
  return (
    <div className="float-hearts rm-hide" aria-hidden>
      {[12, 38, 66, 88].map((l, i) => (
        <div key={l} className="rise" style={{ left: `${l}%`, ['--dur' as string]: `${11 + i * 2}s`, ['--delay' as string]: `-${i * 3}s`, ['--rise' as string]: '-80vh' }}>
          <Heart size={22 + i * 4} />
        </div>
      ))}
    </div>
  )
}

export function LabScene() {
  return (
    <div className="scene scene-lab" aria-hidden>
      <Layer depth={0.2}>
        <div className="lab-blobs">
          {(['green', 'purple', 'pink', 'blue', 'orange'] as const).map((h, i) => (
            <div key={h} className="lab-blob float-y" style={{ left: `${8 + i * 20}%`, top: `${10 + (i % 2) * 22}%`, ['--dur' as string]: `${7 + i}s`, ['--amp' as string]: '-24px' }}>
              <Germ size={90 + (i % 3) * 30} hue={h} mood={i % 2 ? 'sleepy' : 'happy'} />
            </div>
          ))}
        </div>
      </Layer>
      <Layer depth={0.6}>
        <Svg>
          <Floor c1="#3a3fa8" c2="#2a2380" line="#4a4fc0" />
          {/* lab bench */}
          <rect x="0" y="600" width="1600" height="30" rx="10" fill="#7b4dff" />
          <rect x="0" y="626" width="1600" height="100" fill="#5a36d0" />
          {/* microscope */}
          <g transform="translate(1260 330)">
            <rect x="-20" y="250" width="200" height="30" rx="14" fill="#e8e1ff" />
            <path d="M40 250c0-60 20-120 70-170" stroke="#e8e1ff" strokeWidth="30" fill="none" strokeLinecap="round" />
            <rect x="70" y="0" width="56" height="150" rx="20" fill="#fff" transform="rotate(-25 98 75)" />
            <rect x="40" y="170" width="110" height="16" rx="8" fill="#a46bff" />
            <circle cx="60" cy="40" r="16" fill="#5ec8ff" />
          </g>
          {/* flasks */}
          <g transform="translate(220 450)">
            <path d="M40 0h40v60l40 90a20 20 0 0 1-18 28H18A20 20 0 0 1 0 150l40-90Z" fill="#ffffff" opacity="0.9" />
            <path d="M22 110h76l22 40a20 20 0 0 1-18 28H18A20 20 0 0 1 0 150Z" fill="#7be3b0" />
            <circle cx="40" cy="140" r="8" fill="#fff" className="bubble-pop" />
            <circle cx="70" cy="150" r="6" fill="#fff" className="bubble-pop" style={{ animationDelay: '0.8s' }} />
          </g>
          <g transform="translate(420 490)">
            <rect x="0" y="0" width="40" height="110" rx="18" fill="#fff" opacity="0.9" />
            <rect x="0" y="50" width="40" height="60" rx="18" fill="#ff8fc7" />
            <rect x="60" y="20" width="40" height="90" rx="18" fill="#fff" opacity="0.9" />
            <rect x="60" y="60" width="40" height="50" rx="18" fill="#ffd23f" />
          </g>
          {/* petri dishes */}
          <g transform="translate(700 560)">
            <ellipse cx="0" cy="30" rx="90" ry="26" fill="#bde9ff" opacity="0.7" />
            <ellipse cx="0" cy="24" rx="80" ry="20" fill="#e4fff1" />
            <circle cx="-30" cy="24" r="6" fill="#8ee05a" />
            <circle cx="10" cy="20" r="5" fill="#ff8fc7" />
            <circle cx="36" cy="28" r="7" fill="#b884ff" />
          </g>
          {/* blinking panel */}
          <g transform="translate(860 140)">
            <rect width="260" height="160" rx="22" fill="#2a2380" stroke="#8e5bff" strokeWidth="6" />
            {Array.from({ length: 8 }, (_, i) => (
              <circle key={i} cx={40 + (i % 4) * 60} cy={i < 4 ? 50 : 110} r="14" fill={['#7be3b0', '#ff8fc7', '#ffd23f', '#5ec8ff'][i % 4]} className="win-blink" style={{ animationDelay: `${i * 0.35}s` }} />
            ))}
          </g>
        </Svg>
      </Layer>
      <Bubbles n={16} color="rgb(160 220 255 / 0.35)" />
      <Twinkles n={14} color="#c9b6ff" />
    </div>
  )
}

export function CastleScene() {
  return (
    <div className="scene scene-castle" aria-hidden>
      <Layer depth={0.15}>
        <Svg>
          <Sun x={1380} y={160} r={64} />
        </Svg>
        <Twinkles n={16} color="#ffd23f" />
        <Clouds n={3} top={8} />
      </Layer>
      <Layer depth={0.3}>
        <Svg className="hazy">
          <Castle x={650} y={250} s={1} gold />
        </Svg>
      </Layer>
      <Layer depth={0.45}>
        <Svg>
          <Hills c1="#a6ecb9" c2="#7fdc98" c3="#5fcf7f" />
        </Svg>
      </Layer>
      <Layer depth={0.9}>
        <Svg>
          <Tree x={140} y={780} s={1.2} delay={0.3} />
          <Tree x={1480} y={790} s={1.1} c="#ffe08a" d="#ffc83d" delay={0.9} />
          <path d="M640 900c40-90 90-150 160-150s120 60 160 150Z" fill="#fff0bf" />
          {Array.from({ length: 10 }, (_, i) => (
            <Flower key={i} x={240 + i * 120 + (i % 2) * 40} y={850 + (i % 2) * 20} s={0.8} delay={i * 0.4} c={['#ffd23f', '#ff8fc7', '#ffffff', '#ff9f2e'][i % 4]} />
          ))}
        </Svg>
      </Layer>
    </div>
  )
}

/** Ambient floating objects for the landing city, layered by depth. */
export const CITY_FLOATERS: { kind: 'capsule' | 'star' | 'germ' | 'shield' | 'heart' | 'sparkle'; x: string; y: string; depth: number; size: number; dur: number; delay: number; rot?: number; blur?: number; hue?: 'green' | 'purple' | 'orange' | 'blue' | 'pink'; a?: string }[] = [
  { kind: 'capsule', x: '8%', y: '18%', depth: 2.4, size: 84, dur: 6, delay: 0, rot: 8 },
  { kind: 'star', x: '22%', y: '8%', depth: 1.2, size: 46, dur: 5, delay: 1 },
  { kind: 'germ', x: '40%', y: '12%', depth: 2.8, size: 84, dur: 4.4, delay: 0.5, hue: 'purple' },
  { kind: 'shield', x: '74%', y: '8%', depth: 1.8, size: 70, dur: 6.5, delay: 2 },
  { kind: 'heart', x: '4%', y: '56%', depth: 3, size: 60, dur: 4.8, delay: 1.5 },
  { kind: 'capsule', x: '62%', y: '6%', depth: 0.9, size: 48, dur: 7, delay: 3, blur: 1, a: '#8e5bff' },
  { kind: 'germ', x: '30%', y: '3%', depth: 0.7, size: 50, dur: 5.6, delay: 2, hue: 'orange', blur: 1.5 },
  { kind: 'star', x: '93%', y: '4%', depth: 2.2, size: 50, dur: 5.2, delay: 0.3 },
  { kind: 'sparkle', x: '50%', y: '24%', depth: 1.4, size: 30, dur: 3.6, delay: 0 },
  { kind: 'germ', x: '14%', y: '38%', depth: 1.6, size: 64, dur: 5, delay: 2.4, hue: 'pink' },
  { kind: 'capsule', x: '44%', y: '78%', depth: 3.2, size: 72, dur: 5.4, delay: 1.2, a: '#1fc8c0' },
  { kind: 'heart', x: '52%', y: '40%', depth: 1, size: 36, dur: 4.2, delay: 1.8, blur: 1 },
]

export function CityFloaterArt({ f }: { f: (typeof CITY_FLOATERS)[number] }) {
  switch (f.kind) {
    case 'capsule':
      return <Capsule size={f.size} a={f.a} />
    case 'star':
      return <Star size={f.size} />
    case 'germ':
      return <Germ size={f.size} hue={f.hue} />
    case 'shield':
      return <MiniShieldLazy size={f.size} />
    case 'heart':
      return <Heart size={f.size} />
    case 'sparkle':
      return <Sparkle size={f.size} color="#fff" className="twinkle" />
  }
}

function MiniShieldLazy({ size }: { size: number }) {
  return <MiniShield size={size} gold className="glow-pulse" />
}
