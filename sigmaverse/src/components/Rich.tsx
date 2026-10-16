import { Fragment, memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Tex } from './Math'
import { findTerm } from '../data/glossaryIndex'

const TRAP_RE = /\b(NOT|EXCEPT|LEAST|MOST|BEST|FIRST|PRIMARY|BEFORE|AFTER)\b|\b(without rework|first[- ]pass|first time|total defects|defective units|per opportunity|per million opportunities|cumulative percentage|cumulative percent|verified root cause|estimated benefits|realized benefits|realised benefits)\b/g

function highlightTraps(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  TRAP_RE.lastIndex = 0
  while ((m = TRAP_RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(<mark key={`${key}-t${m.index}`} className="trap-word">{m[0]}</mark>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

type Opts = { traps?: boolean; noLinks?: boolean }

/** Finds inline math. A $...$ span starting with a digit and holding no backslash is treated as currency. */
const mathRe = {
  exec(s: string): RegExpExecArray | null {
    let i = s.indexOf('$')
    while (i !== -1) {
      const j = s.indexOf('$', i + 1)
      if (j === -1) return null
      const body = s.slice(i + 1, j)
      if (body.trim() && (!/^\s*\d/.test(body) || body.includes('\\'))) {
        const m = [s.slice(i, j + 1), body] as unknown as RegExpExecArray
        m.index = i
        return m
      }
      i = j
    }
    return null
  },
}

const PATTERNS: { re: { exec(s: string): RegExpExecArray | null }; kind: 'math' | 'code' | 'term' | 'bold' | 'italic' }[] = [
  { re: mathRe, kind: 'math' },
  { re: /`([^`]+)`/, kind: 'code' },
  { re: /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/, kind: 'term' },
  { re: /\*\*([^*]+(?:\*(?!\*)[^*]*)*)\*\*/, kind: 'bold' },
  { re: /(?<![*\w])\*([^*\n]+)\*(?![*\w])/, kind: 'italic' },
]

function parse(text: string, opts: Opts, keyBase = 'r'): ReactNode[] {
  const out: ReactNode[] = []
  let rest = text
  let k = 0
  while (rest.length) {
    let best: { idx: number; m: RegExpExecArray; kind: (typeof PATTERNS)[number]['kind'] } | null = null
    for (const p of PATTERNS) {
      const m = p.re.exec(rest)
      if (m && (best === null || m.index < best.idx)) best = { idx: m.index, m, kind: p.kind }
    }
    if (!best) {
      out.push(...(opts.traps ? highlightTraps(rest, `${keyBase}${k}`) : [rest]))
      break
    }
    if (best.idx > 0) {
      const plain = rest.slice(0, best.idx)
      out.push(...(opts.traps ? highlightTraps(plain, `${keyBase}${k}p`) : [plain]))
    }
    const key = `${keyBase}-${k++}`
    const m = best.m
    switch (best.kind) {
      case 'math': out.push(<Tex key={key} tex={m[1]} />); break
      case 'code': out.push(<code key={key} className="inline-code">{m[1]}</code>); break
      case 'term': out.push(opts.noLinks ? <Fragment key={key}>{m[2] ?? m[1]}</Fragment> : <TermLink key={key} term={m[1]} display={m[2] ?? m[1]} />); break
      case 'bold': out.push(<strong key={key}>{parse(m[1], opts, key)}</strong>); break
      case 'italic': out.push(<em key={key}>{parse(m[1], opts, key)}</em>); break
    }
    rest = rest.slice(best.idx + m[0].length)
  }
  return out
}

export const Rich = memo(function Rich({ text, traps, noLinks }: { text: string; traps?: boolean; noLinks?: boolean }) {
  return <>{parse(text, { traps, noLinks })}</>
})

/** Strip markup for search, speech and plain contexts. */
export function plain(text: string): string {
  return text
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b ?? a)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\$([^$]+)\$/g, (_, t: string) => t.replace(/\\(times|cdot)/g, ' x ').replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1 / $2').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}^_]/g, ''))
}

function TermLink({ term, display }: { term: string; display: string }) {
  const entry = findTerm(term)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!open || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const w = Math.min(340, window.innerWidth - 24)
    const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 12))
    const below = r.bottom + 8
    const top = below + 220 > window.innerHeight && r.top > 240 ? r.top - 8 : below
    setPos({ top, left })
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return
      if (e.type === 'pointerdown' && (pop.current?.contains(e.target as Node) || ref.current?.contains(e.target as Node))) return
      setOpen(false)
    }
    const onScroll = () => setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
      window.removeEventListener('scroll', onScroll, { capture: true })
    }
  }, [open])

  if (!entry) return <>{display}</>
  const above = pos && ref.current && pos.top < ref.current.getBoundingClientRect().top
  return (
    <>
      <button ref={ref} type="button" className="term-link inline font-[inherit] text-[inherit]" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        {display}
      </button>
      {open && pos && createPortal(
        <div
          ref={pop}
          role="dialog"
          aria-label={`Definition of ${entry.term}`}
          className="fixed z-[80] w-[min(340px,calc(100vw-24px))] rounded-2xl border border-line bg-surface p-4 text-left font-sans shadow-lg"
          style={{ top: pos.top, left: pos.left, transform: above ? 'translateY(-100%)' : undefined, animation: 'pop-in 180ms var(--ease-out)' }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-base font-semibold text-ink">{entry.term}</span>
            {entry.acronym && <span className="chip">{entry.acronym}</span>}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-2"><Rich text={entry.easy} noLinks /></p>
          {entry.confusion && <p className="mt-2 rounded-lg bg-coral-soft px-2.5 py-1.5 text-xs leading-relaxed text-ink"><strong className="text-coral">Often confused: </strong><Rich text={entry.confusion} noLinks /></p>}
          <Link to={`/glossary?term=${encodeURIComponent(entry.term)}`} className="mt-3 inline-block text-xs font-semibold text-violet hover:underline" onClick={() => setOpen(false)}>Open in glossary</Link>
        </div>,
        document.body,
      )}
    </>
  )
}
