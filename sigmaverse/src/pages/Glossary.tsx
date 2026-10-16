import { motion } from 'motion/react'
import { ArrowLeftRight, BookMarked, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Rich } from '../components/Rich'
import { Empty, PageHeader, Segmented } from '../components/ui'
import { LESSONS, MODULES, TONE } from '../data/curriculum'
import { confusedPairs } from '../data/glossary'
import { findTerm, glossary } from '../data/glossaryIndex'
import type { ModuleId } from '../data/types'

const modOf = (lesson: string) => LESSONS.find(l => l.id === lesson)!.module

export default function Glossary() {
  const [params, setParams] = useSearchParams()
  const focusTerm = params.get('term')
  const [q, setQ] = useState('')
  const [module, setModule] = useState<ModuleId | 0>(0)
  const [view, setView] = useState<'terms' | 'pairs'>('terms')
  const [open, setOpen] = useState<string | null>(focusTerm ? findTerm(focusTerm)?.term ?? null : null)
  const refs = useRef<Record<string, HTMLLIElement | null>>({})

  useEffect(() => {
    if (!focusTerm) return
    const t = findTerm(focusTerm)
    if (!t) return
    setOpen(t.term); setView('terms'); setQ(''); setModule(0)
    setTimeout(() => refs.current[t.term]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
  }, [focusTerm])

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return glossary
      .filter(g => module === 0 || modOf(g.lesson) === module)
      .filter(g => !needle || [g.term, g.acronym ?? '', ...(g.aliases ?? []), g.easy].join(' ').toLowerCase().includes(needle))
      .sort((a, b) => a.term.localeCompare(b.term))
  }, [q, module])

  return (
    <div>
      <PageHeader icon={<BookMarked className="size-5" />} title="Glossary" lead={`${glossary.length} Define Phase terms with plain-English meanings, precise detail, practical examples, related terms and the confusions examiners like to exploit.`}>
        <Segmented label="View" value={view} onChange={setView} options={[{ value: 'terms', label: 'All terms' }, { value: 'pairs', label: `Easily confused (${confusedPairs.length})` }]} />
      </PageHeader>

      {view === 'terms' ? (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
              <input className="field pl-9" placeholder="Search terms, acronyms and definitions" value={q} onChange={e => setQ(e.target.value)} aria-label="Search glossary" />
            </div>
            <select className="field sm:w-64" value={module} onChange={e => setModule(Number(e.target.value) as ModuleId | 0)} aria-label="Filter by module">
              <option value={0}>All modules</option>
              {MODULES.map(m => <option key={m.id} value={m.id}>{m.ref} {m.title}</option>)}
            </select>
          </div>
          {list.length === 0 ? <Empty icon={<Search className="size-6" />} title="No matching terms">Try a shorter search or another module.</Empty> : (
            <ul className="grid gap-2 lg:grid-cols-2">
              {list.map(g => {
                const isOpen = open === g.term
                const tone = TONE[MODULES.find(m => m.id === modOf(g.lesson))!.tone]
                return (
                  <li key={g.term} ref={el => { refs.current[g.term] = el }} className={`rounded-2xl border bg-surface transition-colors ${isOpen ? 'border-violet/50 shadow-md lg:col-span-2' : 'border-line'}`}>
                    <button className="flex w-full items-start gap-3 p-4 text-left" onClick={() => { setOpen(isOpen ? null : g.term); if (focusTerm) { params.delete('term'); setParams(params, { replace: true }) } }} aria-expanded={isOpen}>
                      <span className={`mt-1 size-2.5 shrink-0 rounded-full ${tone.bg}`} aria-hidden />
                      <span className="flex-1">
                        <span className="flex flex-wrap items-baseline gap-2"><span className="font-display text-lg font-semibold text-ink">{g.term}</span>{g.acronym && g.acronym !== g.term && <span className="chip">{g.acronym}</span>}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-ink-2"><Rich text={g.easy} noLinks /></span>
                      </span>
                    </button>
                    {isOpen && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 border-t border-line p-4 md:grid-cols-2">
                        <div><div className="text-xs font-semibold text-ink-3">Detailed explanation</div><p className="mt-1 text-[0.95rem] leading-relaxed text-ink"><Rich text={g.detail} /></p></div>
                        <div><div className="text-xs font-semibold text-ink-3">Practical example</div><p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2"><Rich text={g.example} /></p></div>
                        {g.confusion && <div className="rounded-xl bg-coral-soft p-3 md:col-span-2"><div className="text-xs font-semibold text-coral">Common confusion</div><p className="mt-1 text-sm leading-relaxed text-ink"><Rich text={g.confusion} /></p></div>}
                        <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                          <span className="text-xs font-semibold text-ink-3">Related:</span>
                          {g.related.map(r => <button key={r} className="chip hover:border-violet hover:text-violet" onClick={() => { const t = findTerm(r); if (t) { setOpen(t.term); setQ(''); setModule(0); setTimeout(() => refs.current[t.term]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80) } }}>{r}</button>)}
                          <Link to={`/lessons/${g.lesson}`} className="ml-auto text-sm font-semibold text-violet hover:underline">Syllabus topic {g.lesson}</Link>
                        </div>
                      </motion.div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {confusedPairs.map((p, i) => (
            <motion.article key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-violet-soft px-3 py-1.5 font-display font-semibold text-violet">{p.a}</span>
                <ArrowLeftRight className="size-4 shrink-0 text-ink-3" />
                <span className="rounded-xl bg-teal-soft px-3 py-1.5 font-display font-semibold text-teal">{p.b}</span>
              </div>
              <p className="mt-4 text-[0.97rem] leading-relaxed text-ink"><Rich text={p.difference} /></p>
              <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-ink-2"><span className="font-semibold text-ink">Memory hook: </span><Rich text={p.memoryHook} /></p>
              <Link to={`/lessons/${p.lesson}`} className="mt-3 inline-block text-sm font-semibold text-violet hover:underline">Lesson {p.lesson}</Link>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}
