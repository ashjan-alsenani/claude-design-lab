import { useId } from 'react'
import { Capsule, Germ, Heart, MiniShield, Star } from './objects'

/** Illustrated answer/action icons. Same lighting recipe as objects.tsx. */
export type IconName =
  | 'doctor'
  | 'friend'
  | 'tv'
  | 'germ'
  | 'virus'
  | 'tissue'
  | 'pain'
  | 'stop'
  | 'double'
  | 'parent'
  | 'handwash'
  | 'share'
  | 'leftover'
  | 'sneeze'
  | 'body'
  | 'bottle'
  | 'vaccine'
  | 'clipboard'
  | 'calendar'
  | 'shield'
  | 'pill'
  | 'heart'
  | 'star'
  | 'nomedicine'
  | 'clock'
  | 'pharmacist'
  | 'germShield'

const OUT = '#17206b'

function Face({ cx, cy, r, skin = '#ffd7b5' }: { cx: number; cy: number; r: number; skin?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={skin} stroke={OUT} strokeOpacity="0.2" strokeWidth="1.5" />
      <circle cx={cx - r * 0.35} cy={cy - r * 0.05} r={r * 0.12} fill={OUT} />
      <circle cx={cx + r * 0.35} cy={cy - r * 0.05} r={r * 0.12} fill={OUT} />
      <path d={`M${cx - r * 0.35} ${cy + r * 0.35}q${r * 0.35} ${r * 0.3} ${r * 0.7} 0`} stroke={OUT} strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx={cx - r * 0.58} cy={cy + r * 0.28} rx={r * 0.16} ry={r * 0.1} fill="#ff8fa8" opacity="0.6" />
      <ellipse cx={cx + r * 0.58} cy={cy + r * 0.28} rx={r * 0.16} ry={r * 0.1} fill="#ff8fa8" opacity="0.6" />
    </g>
  )
}

function ClockFace({ id, h }: { id: string; h: number }) {
  const ang = (h % 12) * 30
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#cdeffd" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="33" r="25" fill="#1fc8c0" />
      <circle cx="32" cy="33" r="20" fill={`url(#${id})`} />
      {[0, 90, 180, 270].map((a) => (
        <rect key={a} x="31" y="15" width="2" height="4" rx="1" fill={OUT} transform={`rotate(${a} 32 33)`} />
      ))}
      <rect x="30.5" y="20" width="3" height="14" rx="1.5" fill={OUT} transform={`rotate(${ang} 32 33)`} />
      <rect x="31" y="17" width="2" height="17" rx="1" fill="#ff6b8b" transform="rotate(0 32 33)" />
      <circle cx="32" cy="33" r="2.6" fill={OUT} />
    </g>
  )
}

export function Icon({ name, size = 72 }: { name: IconName; size?: number }) {
  const id = useId()
  const common = { width: size, height: size, viewBox: '0 0 64 64', 'aria-hidden': true as const }
  switch (name) {
    case 'germ':
      return <Germ size={size} hue="green" />
    case 'germShield':
      return <Germ size={size} hue="purple" shield />
    case 'shield':
      return <MiniShield size={size} gold />
    case 'pill':
      return <Capsule size={size} />
    case 'heart':
      return <Heart size={size} />
    case 'star':
      return <Star size={size} />
    case 'doctor':
      return (
        <svg {...common}>
          <path d="M12 60c0-12 9-19 20-19s20 7 20 19Z" fill="#fff" stroke="#b9c3e6" strokeWidth="2" />
          <path d="M27 41l5 9 5-9" fill="#4cbcff" />
          <Face cx={32} cy={26} r={13} />
          <path d="M19 22c1-9 7-13 13-13s12 4 13 13c-4-4-9-5-13-5s-9 1-13 5Z" fill="#5a3a2a" />
          <path d="M22 44v6a6 6 0 0 0 12 0" stroke="#2f5bea" strokeWidth="2.5" fill="none" />
          <circle cx="34" cy="50" r="3" fill="#2f5bea" />
          <rect x="40" y="46" width="10" height="10" rx="3" fill="#ff6b8b" />
          <path d="M45 48v6M42 51h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'pharmacist':
      return (
        <svg {...common}>
          <path d="M12 60c0-12 9-19 20-19s20 7 20 19Z" fill="#7be3b0" stroke="#3cc46a" strokeWidth="2" />
          <Face cx={32} cy={26} r={13} />
          <path d="M19 22c1-9 7-13 13-13s12 4 13 13c-4-4-9-5-13-5s-9 1-13 5Z" fill="#2c2340" />
          <g transform="translate(36 38) scale(0.42)">
            <rect x="10" y="14" width="44" height="46" rx="10" fill="#ffad5a" stroke="#d96d14" strokeWidth="3" />
            <rect x="14" y="4" width="36" height="12" rx="4" fill="#fff" stroke="#b9c3e6" strokeWidth="3" />
            <path d="M32 26v20M22 36h20" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          </g>
        </svg>
      )
    case 'friend':
      return (
        <svg {...common}>
          <path d="M4 60c0-9 6-15 14-15s14 6 14 15Z" fill="#ff8fc7" />
          <path d="M32 60c0-9 6-15 14-15s14 6 14 15Z" fill="#4cbcff" />
          <Face cx={18} cy={33} r={10} />
          <Face cx={46} cy={33} r={10} />
          <path d="M8 31c0-8 5-12 10-12s10 4 10 12c-3-3-6-4-10-4s-7 1-10 4Z" fill="#fff" />
          <path d="M36 30c0-7 4-11 10-11s10 4 10 11c-3-2-6-3-10-3s-7 1-10 3Z" fill="#3a2a1a" />
        </svg>
      )
    case 'parent':
      return (
        <svg {...common}>
          <path d="M2 62c0-13 8-21 19-21s19 8 19 21Z" fill="#8e5bff" />
          <path d="M34 62c0-8 5-13 12-13s12 5 12 13Z" fill="#ffd23f" />
          <Face cx={21} cy={26} r={12} />
          <path d="M8 26c0-11 6-16 13-16s13 5 13 16c0 4-2 8-2 8l-1-10c-3-3-6-4-10-4s-8 1-10 4l-1 10s-2-4-2-8Z" fill="#fff" />
          <Face cx={46} cy={39} r={8.5} />
          <path d="M37 37c0-6 4-9 9-9s9 3 9 9c-3-2-5-3-9-3s-6 1-9 3Z" fill="#3a2a1a" />
          <g transform="translate(26 44)">
            <Heart size={16} />
          </g>
        </svg>
      )
    case 'tv':
      return (
        <svg {...common}>
          <path d="M22 8l10 9 10-9" stroke="#8c94c4" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="6" y="16" width="52" height="38" rx="10" fill="#a46bff" stroke="#6c35d6" strokeWidth="2" />
          <rect x="11" y="21" width="36" height="28" rx="6" fill="#bde9ff" />
          <path d="M11 41l10-8 8 6 8-6 10 8v2a6 6 0 0 1-6 6H17a6 6 0 0 1-6-6Z" fill="#7be3b0" />
          <circle cx="52" cy="28" r="2.5" fill="#ffd23f" />
          <circle cx="52" cy="36" r="2.5" fill="#ff8fc7" />
          <rect x="16" y="54" width="6" height="5" rx="2" fill="#6c35d6" />
          <rect x="42" y="54" width="6" height="5" rx="2" fill="#6c35d6" />
        </svg>
      )
    case 'virus':
      return (
        <svg {...common}>
          <defs>
            <radialGradient id={id} cx="35%" cy="30%" r="75%">
              <stop offset="0" stopColor="#e6f7ff" />
              <stop offset="0.5" stopColor="#63c5ff" />
              <stop offset="1" stopColor="#1f73c9" />
            </radialGradient>
          </defs>
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i} transform={`rotate(${i * 36} 32 32)`}>
              <rect x="30.5" y="5" width="3" height="10" fill="#1f73c9" />
              <circle cx="32" cy="5" r="3.6" fill="#ff8fc7" />
            </g>
          ))}
          <circle cx="32" cy="32" r="17" fill={`url(#${id})`} />
          <circle cx="26" cy="31" r="2.5" fill={OUT} />
          <circle cx="38" cy="31" r="2.5" fill={OUT} />
          <path d="M27 39q5 3 10 0" stroke={OUT} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'tissue':
    case 'sneeze':
      return (
        <svg {...common}>
          <Face cx={28} cy={32} r={18} />
          <path d="M12 26c0-12 7-18 16-18s16 6 16 18c-4-5-10-7-16-7s-12 2-16 7Z" fill="#3a2a1a" />
          <path d="M26 38c-2 4-1 9 3 10" stroke="#7fd3ff" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="29" cy="49" r="2.4" fill="#7fd3ff" />
          {name === 'tissue' ? (
            <path d="M40 34c6-3 14-2 18 3-3 6-9 10-17 9-3-4-3-8-1-12Z" fill="#fff" stroke="#b9c3e6" strokeWidth="2" />
          ) : (
            <g fill="#bde9ff">
              <circle cx="50" cy="30" r="3" />
              <circle cx="56" cy="36" r="2.2" />
              <circle cx="52" cy="42" r="2.6" />
              <circle cx="58" cy="26" r="1.8" />
            </g>
          )}
          <path d="M19 24l5 3M37 24l-5 3" stroke={OUT} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'pain':
      return (
        <svg {...common}>
          <Face cx={32} cy={34} r={20} />
          <path d="M12 30c0-14 9-20 20-20s20 6 20 20c-5-6-12-8-20-8s-15 2-20 8Z" fill="#3a2a1a" />
          <path d="M44 6l-5 9h6l-6 10" stroke="#ffd23f" strokeWidth="3.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <rect x="16" y="32" width="12" height="5" rx="2.5" fill="#fff" opacity="0.9" transform="rotate(-20 22 34)" />
        </svg>
      )
    case 'stop':
      return (
        <svg {...common}>
          <path d="M22 4h20l14 14v20L42 52v8H22v-8L8 38V18Z" fill="#ff7a6b" stroke="#d1453a" strokeWidth="2.5" transform="translate(0 2) scale(1 0.92)" />
          <rect x="17" y="24" width="30" height="10" rx="5" fill="#fff" />
        </svg>
      )
    case 'double':
      return (
        <svg {...common}>
          <g transform="translate(-8 -6)">
            <Capsule size={52} />
          </g>
          <g transform="translate(14 14)">
            <Capsule size={52} a="#8e5bff" />
          </g>
        </svg>
      )
    case 'handwash':
      return (
        <svg {...common}>
          <g fill="#bde9ff" stroke="#4cbcff" strokeWidth="1.5">
            <circle cx="14" cy="14" r="6" />
            <circle cx="50" cy="10" r="4.5" />
            <circle cx="54" cy="24" r="3.5" />
            <circle cx="8" cy="30" r="3.5" />
          </g>
          <path d="M14 44c0-10 7-20 16-20h8c4 0 6 3 6 6l-12 2" fill="#ffd7b5" stroke="#d99a6c" strokeWidth="2" strokeLinejoin="round" />
          <path d="M50 40c0 10-7 18-16 18H22c-4 0-8-3-8-8v-6h36Z" fill="#ffc7a0" stroke="#d99a6c" strokeWidth="2" />
          <g fill="#fff" stroke="#9fd7ff" strokeWidth="1.5">
            <circle cx="24" cy="46" r="4" />
            <circle cx="32" cy="50" r="5" />
            <circle cx="41" cy="46" r="4" />
          </g>
        </svg>
      )
    case 'share':
      return (
        <svg {...common}>
          <path d="M6 46c6-6 12-8 18-6l10 3" stroke="#ffc7a0" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M58 46c-6-6-12-8-18-6" stroke="#ffd7b5" strokeWidth="9" strokeLinecap="round" fill="none" />
          <g transform="translate(14 0)">
            <Capsule size={38} />
          </g>
          <path d="M22 54h20" stroke="#8c94c4" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 5" />
        </svg>
      )
    case 'leftover':
    case 'bottle':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffb86b" />
              <stop offset="0.5" stopColor="#ff9f2e" />
              <stop offset="1" stopColor="#d96d14" />
            </linearGradient>
          </defs>
          <rect x="16" y="6" width="32" height="12" rx="4" fill="#fff" stroke="#b9c3e6" strokeWidth="2" />
          <rect x="12" y="16" width="40" height="44" rx="11" fill={`url(#${id})`} stroke="#c45a0a" strokeWidth="2" />
          <rect x="17" y="28" width="30" height="20" rx="5" fill="#fff" />
          <path d="M32 32v12M26 38h12" stroke="#ff6b8b" strokeWidth="4" strokeLinecap="round" />
          <rect x="16" y="20" width="5" height="34" rx="2.5" fill="#fff" opacity="0.4" />
          {name === 'leftover' && (
            <g>
              <circle cx="50" cy="50" r="11" fill="#ffd23f" stroke="#e08a00" strokeWidth="2" />
              <path d="M50 44v6l4 3" stroke="#8a5300" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            </g>
          )}
        </svg>
      )
    case 'nomedicine':
      return (
        <svg {...common}>
          <g transform="translate(6 6)">
            <Capsule size={52} />
          </g>
          <circle cx="32" cy="32" r="25" fill="none" stroke="#ff4f6b" strokeWidth="6" />
          <path d="M14 14l36 36" stroke="#ff4f6b" strokeWidth="6" strokeLinecap="round" />
        </svg>
      )
    case 'body':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffd7b5" />
              <stop offset="1" stopColor="#f2b48a" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="12" r="8" fill={`url(#${id})`} />
          <path d="M20 22h24l-2 18h-4l-2 20h-4l-2-14-2 14h-4l-2-20h-4Z" fill={`url(#${id})`} />
          <path d="M20 22l-8 16M44 22l8 16" stroke="#f2b48a" strokeWidth="6" strokeLinecap="round" />
          <path d="M28 32a4 4 0 0 1 4-4 4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6Z" fill="#ff5f8f" />
        </svg>
      )
    case 'vaccine':
      return (
        <svg {...common}>
          <g transform="rotate(-40 32 32)">
            <rect x="22" y="14" width="20" height="32" rx="5" fill="#bde9ff" stroke="#4cbcff" strokeWidth="2.5" />
            <rect x="24" y="30" width="16" height="14" rx="3" fill="#7be3b0" />
            <rect x="18" y="10" width="28" height="6" rx="3" fill="#8e5bff" />
            <rect x="29" y="2" width="6" height="10" rx="2" fill="#8e5bff" />
            <rect x="30.5" y="46" width="3" height="14" rx="1.5" fill="#8c94c4" />
            <path d="M26 20h6M26 25h4" stroke="#4cbcff" strokeWidth="2" strokeLinecap="round" />
          </g>
          <g transform="translate(40 36)">
            <Star size={22} />
          </g>
        </svg>
      )
    case 'clipboard':
      return (
        <svg {...common}>
          <rect x="12" y="8" width="40" height="52" rx="8" fill="#4cbcff" stroke="#1f73c9" strokeWidth="2" />
          <rect x="17" y="15" width="30" height="40" rx="4" fill="#fff" />
          <rect x="24" y="4" width="16" height="9" rx="4" fill="#ffd23f" stroke="#e08a00" strokeWidth="2" />
          <path d="M22 26l3 3 6-6M22 38l3 3 6-6" stroke="#3cc46a" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M34 27h8M34 39h8" stroke="#b9c3e6" strokeWidth="3" strokeLinecap="round" />
          <rect x="22" y="47" width="20" height="3" rx="1.5" fill="#b9c3e6" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="8" y="12" width="48" height="46" rx="10" fill="#fff" stroke="#b9c3e6" strokeWidth="2" />
          <path d="M8 22a10 10 0 0 1 10-10h28a10 10 0 0 1 10 10v4H8Z" fill="#ff7a6b" />
          <rect x="18" y="6" width="5" height="12" rx="2.5" fill="#8c94c4" />
          <rect x="41" y="6" width="5" height="12" rx="2.5" fill="#8c94c4" />
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={i} cx={16 + (i % 4) * 11} cy={i < 4 ? 34 : 46} r="3.6" fill={i < 6 ? '#3cc46a' : '#ffd23f'} />
          ))}
        </svg>
      )
    case 'clock':
      return (
        <svg {...common}>
          <ClockFace id={id} h={3} />
        </svg>
      )
  }
}
