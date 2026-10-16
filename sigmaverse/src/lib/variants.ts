import { formulaDef } from '../data/formulas'
import type { Difficulty, Question } from '../data/types'
import { generateProblem, type FormulaId, type Problem } from './problems'

const DEFINE_FORMULAS: FormulaId[] = ['dpu', 'dpo', 'dpmo', 'defective', 'fty', 'rty', 'final-yield', 'cycle', 'copq', 'pareto', 'improvement']

function fmtVal(v: number, p: Problem) {
  const s = v.toLocaleString('en-US', { maximumFractionDigits: p.decimals, minimumFractionDigits: 0 })
  return p.percent ? `${s}%` : p.unit === '$' ? `$${s}` : p.unit && !['DPMO', 'defects per unit', 'defects per opportunity'].includes(p.unit) ? `${s} ${p.unit}` : s
}

/**
 * Turns a generated free-response problem into a four-option question whose
 * distractors are the specific mistakes the generator knows about.
 */
export function problemToQuestion(p: Problem): Question | null {
  const def = formulaDef(p.formula)
  if (!def) return null
  const round = (v: number) => Math.round(v * 10 ** p.decimals) / 10 ** p.decimals
  const seen = new Set<number>([round(p.expected)])
  const distractors: { v: number; note: string; tag: Question['optionMistakes'] extends (infer T)[] | undefined ? T : never }[] = []
  for (const m of p.mistakes) {
    const v = round(m.value)
    if (seen.has(v) || !Number.isFinite(v)) continue
    seen.add(v)
    distractors.push({ v, note: m.message, tag: m.tag })
  }
  // Fill with arithmetic slips (factor of 10) if the generator has fewer than three mistakes.
  for (const f of [10, 0.1, 2, 0.5]) {
    if (distractors.length >= 3) break
    const v = round(p.expected * f)
    if (seen.has(v) || v === 0) continue
    seen.add(v)
    distractors.push({ v, note: `This is off by a factor of ${f >= 1 ? f : 1 / f}: an arithmetic or decimal-place slip.`, tag: null })
  }
  if (distractors.length < 3) return null
  const opts = [{ v: round(p.expected), correct: true, note: 'Correct.', tag: null as never }, ...distractors.slice(0, 3).map(d => ({ ...d, correct: false }))]
  // Deterministic shuffle by problem id.
  let h = 0
  for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  for (let i = opts.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [opts[i], opts[j]] = [opts[j], opts[i]] }
  const answer = opts.findIndex(o => o.correct) as 0 | 1 | 2 | 3
  return {
    id: `gen:${p.id}`,
    lesson: def.lesson,
    category: 'calculation',
    difficulty: p.difficulty,
    stem: `${p.context} ${p.question}`,
    table: p.table ? { head: p.table.head, rows: p.table.rows.map(r => r.map(c => (typeof c === 'number' ? c.toLocaleString('en-US') : c))) } : undefined,
    options: opts.map(o => fmtVal(o.v, p)) as [string, string, string, string],
    answer,
    explanation: p.solution.join(' '),
    optionNotes: opts.map(o => o.note) as [string, string, string, string],
    optionMistakes: opts.map(o => (o.correct ? null : o.tag ?? null)) as Question['optionMistakes'],
    numeric: true,
  }
}

export function generatedVariants(n: number, difficulty?: Difficulty): Question[] {
  const out: Question[] = []
  const levels: Difficulty[] = difficulty ? [difficulty] : ['beginner', 'intermediate', 'advanced', 'trap', 'master']
  let tries = 0
  while (out.length < n && tries < n * 6) {
    tries++
    const f = DEFINE_FORMULAS[Math.floor(Math.random() * DEFINE_FORMULAS.length)]
    const d = levels[Math.floor(Math.random() * levels.length)]
    const q = problemToQuestion(generateProblem(f, d, Math.floor(Math.random() * 1e9)))
    if (q) out.push(q)
  }
  return out
}
