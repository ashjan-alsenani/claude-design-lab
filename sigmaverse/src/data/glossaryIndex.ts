import { glossary } from './glossary'
import type { GlossaryTerm } from './types'

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim()

const index = new Map<string, GlossaryTerm>()
for (const g of glossary) {
  index.set(norm(g.term), g)
  if (g.acronym) index.set(norm(g.acronym), g)
  for (const a of g.aliases ?? []) index.set(norm(a), g)
}

export function findTerm(term: string): GlossaryTerm | undefined {
  const n = norm(term)
  return index.get(n) ?? index.get(n.replace(/s$/, '')) ?? index.get(n.replace(/es$/, ''))
}

export { glossary }
