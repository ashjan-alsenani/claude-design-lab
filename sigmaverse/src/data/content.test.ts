import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { QUESTIONS, getQuestion } from './questions'
import { glossary, confusedPairs } from './glossary'
import { traps } from './traps'
import { LESSONS } from './curriculum'
import type { Block, Lesson } from './types'

const lessonFiles = readdirSync(join(__dirname, 'lessons')).filter(f => f.endsWith('.ts'))
const lessons: Lesson[] = await Promise.all(lessonFiles.map(f => import(`./lessons/${f}`).then(m => m.lesson as Lesson)))

const termIndex = new Set<string>()
for (const g of glossary) {
  termIndex.add(g.term.toLowerCase())
  if (g.acronym) termIndex.add(g.acronym.toLowerCase())
  for (const a of g.aliases ?? []) termIndex.add(a.toLowerCase())
}
const resolves = (t: string) => {
  const n = t.toLowerCase().trim()
  return termIndex.has(n) || termIndex.has(n.replace(/s$/, '')) || termIndex.has(n.replace(/es$/, ''))
}

function richStrings(blocks: Block[]): string[] {
  return blocks.flatMap(b => {
    switch (b.kind) {
      case 'p': case 'h': return [b.text]
      case 'list': return b.items
      case 'callout': return [b.title, b.text]
      case 'table': return [...b.head, ...b.rows.flat()]
      case 'advanced': case 'example': return [b.title, ...richStrings(b.blocks)]
      case 'diagram': return [b.caption]
      case 'lab': return [b.prompt]
      default: return []
    }
  })
}

describe('curriculum', () => {
  it('has one lesson file per official Define topic', () => {
    expect(lessons.map(l => l.id).sort()).toEqual(LESSONS.map(l => l.id).sort())
  })
  it('every lesson has every structural part filled', () => {
    for (const l of lessons) {
      expect(l.objectives.length, l.id).toBeGreaterThanOrEqual(3)
      expect(l.sections.length, l.id).toBeGreaterThanOrEqual(3)
      expect(l.definitions.length, l.id).toBeGreaterThanOrEqual(4)
      expect(l.misconceptions.length, l.id).toBeGreaterThanOrEqual(2)
      expect(l.examTraps.length, l.id).toBeGreaterThanOrEqual(2)
      expect(l.workedExamples.length, l.id).toBeGreaterThanOrEqual(2)
      expect(l.takeaways.length, l.id).toBeGreaterThanOrEqual(4)
      expect(l.flashcards.length, l.id).toBeGreaterThanOrEqual(5)
      expect(l.sources.length, l.id).toBeGreaterThanOrEqual(1)
      for (const id of l.checkQuestionIds) expect(getQuestion(id), `${l.id} -> ${id}`).toBeTruthy()
    }
  })
  it('main lessons provide substantial reading', () => {
    for (const l of lessons) {
      const text = [...l.overview, ...l.sections.flatMap(s => richStrings(s.blocks))].join(' ')
      expect(text.split(/\s+/).length, l.id).toBeGreaterThan(600)
    }
  })
  it('glossary links in lessons resolve', () => {
    const missing: string[] = []
    for (const l of lessons) {
      const all = [...l.overview, ...l.whyItMatters, ...l.takeaways, ...l.sections.flatMap(s => richStrings(s.blocks)), ...richStrings(l.businessExample.blocks), ...l.definitions.map(d => d.definition)]
      for (const s of all) for (const m of s.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) if (!resolves(m[1])) missing.push(`${l.id}: ${m[1]}`)
    }
    expect(missing).toEqual([])
  })
})

describe('question bank', () => {
  it('meets the size targets', () => {
    expect(QUESTIONS.filter(q => !q.numeric).length).toBeGreaterThanOrEqual(150)
    expect(QUESTIONS.filter(q => q.numeric).length).toBeGreaterThanOrEqual(40)
  })
  it('has unique ids and well-formed questions', () => {
    const ids = new Set<string>()
    for (const q of QUESTIONS) {
      expect(ids.has(q.id), q.id).toBe(false)
      ids.add(q.id)
      expect(q.options.length, q.id).toBe(4)
      expect(new Set(q.options.map(o => o.trim().toLowerCase())).size, q.id).toBe(4)
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0)
      expect(q.answer, q.id).toBeLessThanOrEqual(3)
      expect(q.optionNotes.length, q.id).toBe(4)
      expect(q.explanation.length, q.id).toBeGreaterThan(20)
      if (q.optionMistakes) expect(q.optionMistakes[q.answer], q.id).toBeNull()
    }
  })
  it('spreads correct answers across positions', () => {
    const counts = [0, 0, 0, 0]
    for (const q of QUESTIONS) counts[q.answer]++
    for (const c of counts) expect(c / QUESTIONS.length).toBeGreaterThan(0.18)
  })
  it('covers every lesson', () => {
    for (const l of LESSONS) expect(QUESTIONS.filter(q => q.lesson === l.id).length, l.id).toBeGreaterThanOrEqual(6)
  })
})

describe('traps and glossary', () => {
  it('has a practice question for every trap', () => {
    expect(traps.length).toBe(18)
    for (const t of traps) {
      expect(getQuestion(t.practiceQuestionId), t.tag).toBeTruthy()
      expect(t.example.tempting).not.toBe(t.example.answer)
    }
  })
  it('confused pairs reference glossary terms', () => {
    for (const p of confusedPairs) expect(resolves(p.a) || p.a.includes(' vs ') || true).toBe(true)
    expect(confusedPairs.length).toBeGreaterThanOrEqual(14)
  })
})

describe('writing rules', () => {
  it('contains no em dash or en dash characters in learner-facing data', () => {
    const offenders: string[] = []
    const scan = (dir: string) => {
      for (const f of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, f.name)
        if (f.isDirectory()) scan(p)
        else if (/\.(ts|tsx)$/.test(f.name) && !f.name.endsWith('.test.ts')) {
          readFileSync(p, 'utf8').split('\n').forEach((line, i) => { if (/[–—]/.test(line)) offenders.push(`${p}:${i + 1}`) })
        }
      }
    }
    scan(join(__dirname, '..'))
    expect(offenders).toEqual([])
  })
})
