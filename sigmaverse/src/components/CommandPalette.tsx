import { AnimatePresence, motion } from 'motion/react'
import { BookMarked, BookOpen, Calculator, CircleHelp, CornerDownLeft, FlaskConical, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LESSONS, loadAllLessons } from '../data/curriculum'
import { FORMULAS } from '../data/formulas'
import { glossary } from '../data/glossaryIndex'
import { QUESTIONS } from '../data/questions'
import type { Block, Lesson } from '../data/types'
import { LABS } from '../labs/registry'
import { plain } from './Rich'

interface Hit { kind: 'lesson' | 'section' | 'term' | 'question' | 'lab' | 'formula'; title: string; sub: string; to: string; score: number }

function blocksText(blocks: Block[]): string {
  return blocks.map(b => {
    switch (b.kind) {
      case 'p': return b.text
      case 'h': return b.text
      case 'list': return b.items.join(' ')
      case 'callout': return `${b.title} ${b.text}`
      case 'table': return b.rows.flat().join(' ')
      case 'advanced': case 'example': return `${b.title} ${blocksText(b.blocks)}`
      default: return ''
    }
  }).join(' ')
}

function scoreText(q: string[], text: string, weight: number) {
  const t = text.toLowerCase()
  let s = 0
  for (const w of q) {
    if (!t.includes(w)) return 0
    s += t.startsWith(w) ? 3 : new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(t) ? 2 : 1
  }
  return s * weight
}

export function useSearch(query: string) {
  const [lessons, setLessons] = useState<Lesson[] | null>(null)
  useEffect(() => { if (query && !lessons) loadAllLessons().then(setLessons).catch(() => setLessons([])) }, [query, lessons])
  return useMemo<Hit[]>(() => {
    const q = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!q.length) return []
    const hits: Hit[] = []
    for (const l of LESSONS) {
      const s = scoreText(q, `${l.id} ${l.short} ${l.officialTitle}`, 6)
      if (s) hits.push({ kind: 'lesson', title: l.short, sub: `Lesson ${l.id}`, to: `/lessons/${l.id}`, score: s })
    }
    for (const l of lessons ?? []) {
      for (const sec of l.sections) {
        const s = scoreText(q, plain(`${sec.title} ${blocksText(sec.blocks)}`), 1)
        if (s) hits.push({ kind: 'section', title: sec.title, sub: `Lesson ${l.id} · ${l.title}`, to: `/lessons/${l.id}#${sec.id}`, score: s + scoreText(q, sec.title, 3) })
      }
    }
    for (const g of glossary) {
      const s = scoreText(q, `${g.term} ${g.acronym ?? ''} ${(g.aliases ?? []).join(' ')}`, 5) || scoreText(q, plain(g.easy), 1)
      if (s) hits.push({ kind: 'term', title: g.term, sub: plain(g.easy).slice(0, 90), to: `/glossary?term=${encodeURIComponent(g.term)}`, score: s })
    }
    for (const lab of LABS) {
      const s = scoreText(q, `${lab.title} ${lab.blurb}`, 4)
      if (s) hits.push({ kind: 'lab', title: lab.title, sub: lab.blurb, to: `/labs/${lab.key}`, score: s })
    }
    for (const f of FORMULAS) {
      const s = scoreText(q, `${f.name} ${f.short}`, 5)
      if (s) hits.push({ kind: 'formula', title: `${f.name} (${f.short})`, sub: 'Formula Master', to: `/formulas/${f.id}`, score: s })
    }
    for (const qu of QUESTIONS) {
      const s = scoreText(q, plain(qu.stem), 1)
      if (s) hits.push({ kind: 'question', title: plain(qu.stem).slice(0, 110), sub: `Question · Lesson ${qu.lesson}`, to: `/practice/question/${qu.id}`, score: s })
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, 40)
  }, [query, lessons])
}

const ICON: Record<Hit['kind'], ReactNode> = {
  lesson: <BookOpen className="size-4" />, section: <BookOpen className="size-4" />, term: <BookMarked className="size-4" />,
  question: <CircleHelp className="size-4" />, lab: <FlaskConical className="size-4" />, formula: <Calculator className="size-4" />,
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const hits = useSearch(q)
  const nav = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 30) } }, [open])
  useEffect(() => setActive(0), [q])

  const go = (h: Hit) => { onClose(); nav(h.to) }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center p-3 pt-[10vh]" role="dialog" aria-modal="true" aria-label="Search">
          <motion.div className="absolute inset-0 bg-ink/30 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-surface shadow-lg" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.18 }}>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-5 text-ink-3" />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') onClose()
                  if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, hits.length - 1)) }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
                  if (e.key === 'Enter' && hits[active]) go(hits[active])
                }}
                placeholder="Search lessons, glossary terms, labs, formulas and questions"
                className="h-14 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
                aria-label="Search query"
                role="combobox"
                aria-expanded={hits.length > 0}
                aria-controls="palette-results"
              />
            </div>
            <ul id="palette-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
              {!q && <li className="px-3 py-6 text-center text-sm text-ink-3">Try "DPMO", "rework", "champion", "Pareto" or "conveyance".</li>}
              {q && hits.length === 0 && <li className="px-3 py-6 text-center text-sm text-ink-3">No matches for "{q}".</li>}
              {hits.map((h, i) => (
                <li key={`${h.kind}-${h.to}-${i}`} role="option" aria-selected={i === active}>
                  <button onMouseEnter={() => setActive(i)} onClick={() => go(h)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === active ? 'bg-surface-2' : ''}`}>
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-soft text-violet">{ICON[h.kind]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{h.title}</span>
                      <span className="block truncate text-xs text-ink-3">{h.sub}</span>
                    </span>
                    {i === active && <CornerDownLeft className="size-4 text-ink-3" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
