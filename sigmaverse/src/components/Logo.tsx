import { Link } from 'react-router-dom'

export function Mark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="sv-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b2a7a" />
          <stop offset="1" stopColor="#5b3fd0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#sv-g)" />
      <path d="M21.5 9.5h-11l6 6.5-6 6.5h11" fill="none" stroke="#f6f5fb" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23.5" cy="22.5" r="2.2" fill="#ff8a66" />
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label="SigmaVerse home">
      <Mark />
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[1.15rem] font-bold tracking-tight text-ink">SigmaVerse</span>
          <span className="mt-1 block text-[11px] font-semibold text-ink-3">Define Mastery Academy</span>
        </span>
      )}
    </Link>
  )
}
