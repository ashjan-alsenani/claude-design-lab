/**
 * Rule-based learning analytics and recommendations. No AI is involved: every
 * number here is derived from the learner's own recorded activity.
 */
import { LESSONS, MODULES } from '../data/curriculum'
import { QUESTIONS } from '../data/questions'
import { glossary } from '../data/glossaryIndex'
import type { LabKey, LessonId, MistakeTag } from '../data/types'
import type { FormulaId } from './problems'
import type { Profile } from './store'

export const MISTAKE_INFO: Record<MistakeTag, { label: string; lesson: LessonId; formula?: FormulaId; lab?: LabKey; advice: string }> = {
  'defects-vs-defectives': { label: 'Defects vs defective units', lesson: '1.2.5', formula: 'dpu', lab: 'dpmo', advice: 'A defective unit can hold several defects. DPU and DPMO count defects; proportion defective counts units.' },
  'missing-opportunities': { label: 'Forgetting opportunities per unit', lesson: '1.2.5', formula: 'dpmo', lab: 'dpmo', advice: 'DPO and DPMO divide by units multiplied by opportunities per unit.' },
  'missing-million': { label: 'Forgetting x 1,000,000', lesson: '1.2.5', formula: 'dpmo', lab: 'dpmo', advice: 'DPMO is DPO scaled to a million opportunities.' },
  'percent-conversion': { label: 'Percentage conversions', lesson: '1.2.5', formula: 'improvement', advice: 'Move between fraction, percent and per-million deliberately: 0.0423 = 4.23% = 42,300 per million.' },
  'rty-added-or-averaged': { label: 'Adding or averaging yields for RTY', lesson: '1.2.5', formula: 'rty', lab: 'rty', advice: 'RTY multiplies first time yields because a unit must pass every step.' },
  'fty-includes-rework': { label: 'Counting rework as first-time success', lesson: '1.2.5', formula: 'fty', lab: 'rty', advice: 'First time yield excludes anything reworked or scrapped.' },
  'copq-classification': { label: 'Classifying quality costs', lesson: '1.2.3', formula: 'copq', lab: 'copq', advice: 'Prevention and appraisal are costs of good quality; internal and external failures are the cost of poor quality.' },
  'time-units': { label: 'Inconsistent time units', lesson: '1.2.5', formula: 'cycle', lab: 'cycle', advice: 'Convert every duration to one unit before adding or dividing.' },
  'gross-vs-net': { label: 'Gross vs net benefits', lesson: '1.3.3', formula: 'roi', lab: 'finance', advice: 'Net benefit subtracts costs before ROI is calculated.' },
  'dpu-vs-dpmo': { label: 'DPU vs DPMO', lesson: '1.2.5', formula: 'dpmo', lab: 'dpmo', advice: 'DPU is per unit; DPMO is per million opportunities.' },
  'fty-vs-rty': { label: 'FTY vs RTY vs final yield', lesson: '1.2.5', formula: 'rty', lab: 'rty', advice: 'FTY is one step first time; RTY is all steps first time; final yield hides rework.' },
  'voice-confusion': { label: 'VOC, VOB and VOE', lesson: '1.1.5', lab: 'voice', advice: 'Ask whose need it is: the customer, the business or the employee.' },
  'role-confusion': { label: 'Six Sigma roles', lesson: '1.1.6', lab: 'roles', advice: 'Champions sponsor and remove barriers; Process Owners own the process; Belts lead the work.' },
  'phase-boundary': { label: 'DMAIC phase boundaries', lesson: '1.1.3', lab: 'dmaic', advice: 'Define frames the problem; root causes are proven in Analyze; control plans belong to Control.' },
  'solution-in-problem': { label: 'Solutions hidden in problem statements', lesson: '1.3.1', lab: 'charter', advice: 'A problem statement states what, where, when and how big, with no cause, solution or blame.' },
  'smart-goal': { label: 'SMART goal statements', lesson: '1.3.1', lab: 'smart', advice: 'Goals name a metric, baseline, target and date.' },
  'pareto-reading': { label: 'Reading Pareto charts', lesson: '1.2.4', formula: 'pareto', lab: 'pareto', advice: 'Bars are sorted counts; the line is the running cumulative percentage.' },
  'cumulative-percent': { label: 'Cumulative percentages', lesson: '1.2.4', formula: 'pareto', lab: 'pareto', advice: 'Cumulative percentage adds every bar up to and including the current one.' },
  'waste-confusion': { label: 'Telling the wastes apart', lesson: '1.4.4', lab: 'waste', advice: 'Motion moves people within a workstation; Conveyance moves things between places.' },
  'five-s-order': { label: '5S order and meaning', lesson: '1.4.5', lab: 'fives', advice: 'Sort, Straighten, Shine, Standardize, Self-Discipline: you cannot organise what you have not sorted.' },
  'lean-vs-sigma': { label: 'Lean vs Six Sigma focus', lesson: '1.4.3', lab: 'lean-sigma', advice: 'Lean attacks waste and delay; Six Sigma attacks variation and defects.' },
  'ctq-vague': { label: 'Measurable CTQs', lesson: '1.2.2', lab: 'ctq', advice: 'A CTQ needs a metric, an operational definition and a limit.' },
  'cause-vs-root-cause': { label: 'Potential vs proven causes', lesson: '1.1.4', lab: 'yfx', advice: 'Define lists suspected X\'s at most; Analyze proves which ones matter.' },
  'estimated-vs-realized': { label: 'Estimated vs realized benefits', lesson: '1.3.3', lab: 'finance', advice: 'Estimates come in Define; realized benefits are verified by Finance after implementation.' },
  'metric-type': { label: 'Choosing project metrics', lesson: '1.3.2', lab: 'metrics', advice: 'The primary metric is the project Y; secondary metrics guard against side effects.' },
  scope: { label: 'Project scope', lesson: '1.3.1', lab: 'charter', advice: 'State start and end boundaries and what is out of scope.' },
  'wording-negation': { label: 'Question wording (NOT, EXCEPT, BEST)', lesson: '1.1.3', advice: 'Underline the instruction word before reading the options.' },
  'history-facts': { label: 'History facts', lesson: '1.1.2', lab: 'history', advice: 'Anchor the timeline: Shewhart 1920s, Motorola 1986, GE 1995, TPS from the 1950s.' },
  'process-boundary': { label: 'Process boundaries', lesson: '1.2.1', lab: 'process', advice: 'A process starts with a trigger and ends when the output reaches the customer.' },
  'cycle-time': { label: 'Cycle time', lesson: '1.2.5', formula: 'cycle', lab: 'cycle', advice: 'Elapsed cycle time includes waiting inside the process.' },
}

const DAY = 86_400_000

export function weakAreas(p: Profile, limit = 5) {
  const since = Date.now() - 30 * DAY
  const counts = new Map<MistakeTag, number>()
  for (const m of p.mistakes) {
    if (m.at < since) continue
    counts.set(m.tag, (counts.get(m.tag) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([tag, n]) => ({ tag, n, ...MISTAKE_INFO[tag] }))
}

export function lessonAccuracy(p: Profile, lesson: LessonId) {
  let seen = 0, correct = 0
  for (const q of QUESTIONS) {
    if (q.lesson !== lesson) continue
    const s = p.qstats[q.id]
    if (!s) continue
    seen += s.seen
    correct += s.correct
  }
  return seen ? { seen, rate: correct / seen } : null
}

export function overallAccuracy(p: Profile) {
  let seen = 0, correct = 0
  for (const s of Object.values(p.qstats)) { seen += s.seen; correct += s.correct }
  return seen ? { seen, rate: correct / seen } : null
}

/**
 * Mastery estimate per lesson, 0-1, or null if there is no evidence yet.
 * 30% lesson completed, 55% question accuracy (needs at least 3 attempts), 15% lesson flashcards known.
 */
export function lessonMastery(p: Profile, lesson: LessonId): number | null {
  const done = p.completed[lesson] ? 1 : 0
  const acc = lessonAccuracy(p, lesson)
  const cards = Object.entries(p.cards).filter(([id]) => id.startsWith(`${lesson}:`))
  const known = cards.length ? cards.filter(([, c]) => c.box >= 3 || c.known).length / cards.length : 0
  if (!done && !acc && !cards.length) return null
  const accPart = acc && acc.seen >= 3 ? acc.rate : acc ? acc.rate * 0.5 : 0
  return 0.3 * done + 0.55 * accPart + 0.15 * known
}

export function overallMastery(p: Profile): number | null {
  const vals = LESSONS.map(l => lessonMastery(p, l.id))
  if (vals.every(v => v === null)) return null
  return vals.reduce<number>((s, v) => s + (v ?? 0), 0) / vals.length
}

export function mathReadiness(p: Profile): { score: number; attempts: number } | null {
  let attempts = 0, correct = 0
  for (const s of Object.values(p.formulas)) { if (!s) continue; attempts += s.attempts; correct += s.correct }
  for (const q of QUESTIONS) {
    if (!q.numeric) continue
    const s = p.qstats[q.id]
    if (s) { attempts += s.seen; correct += s.correct }
  }
  if (!attempts) return null
  // Confidence grows with volume: 20 attempts gives full weight.
  const rate = correct / attempts
  return { score: rate * Math.min(1, attempts / 20), attempts }
}

export function vocabProgress(p: Profile) {
  const total = glossary.length
  const known = glossary.filter(g => { const c = p.cards[`g:${g.term}`]; return c && (c.known || c.box >= 3) }).length
  return { known, total }
}

export function moduleCompletion(p: Profile) {
  return MODULES.map(m => {
    const ls = LESSONS.filter(l => l.module === m.id)
    const done = ls.filter(l => p.completed[l.id]).length
    return { module: m, done, total: ls.length }
  })
}

export function nextRecommendedLesson(p: Profile): LessonId {
  const firstOpen = LESSONS.find(l => !p.completed[l.id])
  if (p.lastLesson && !p.completed[p.lastLesson]) return p.lastLesson
  return firstOpen?.id ?? weakestLesson(p) ?? '1.2.5'
}

export function weakestLesson(p: Profile): LessonId | null {
  let worst: { id: LessonId; m: number } | null = null
  for (const l of LESSONS) {
    const m = lessonMastery(p, l.id)
    if (m === null) continue
    if (!worst || m < worst.m) worst = { id: l.id, m }
  }
  return worst?.id ?? null
}

export interface Recommendation { title: string; reason: string; to: string; kind: 'lesson' | 'lab' | 'formula' | 'practice' | 'flashcards' | 'mock' }

export function recommendations(p: Profile): Recommendation[] {
  const recs: Recommendation[] = []
  const weak = weakAreas(p, 3)
  for (const w of weak) {
    if (w.n < 2) continue
    recs.push({ kind: 'lesson', title: `Revisit lesson ${w.lesson}`, reason: `You have slipped on "${w.label}" ${w.n} times recently. ${w.advice}`, to: `/lessons/${w.lesson}` })
    if (w.formula) recs.push({ kind: 'formula', title: `Drill ${w.formula.toUpperCase()} in the Formula Master`, reason: `Targeted numeric practice for "${w.label}".`, to: `/formulas/${w.formula}` })
    else if (w.lab) recs.push({ kind: 'lab', title: 'Try the related lab', reason: `Hands-on practice for "${w.label}".`, to: `/labs/${w.lab}` })
  }
  const next = nextRecommendedLesson(p)
  if (!p.completed[next]) recs.push({ kind: 'lesson', title: `Continue with lesson ${next}`, reason: 'This is the next lesson on your Define journey.', to: `/lessons/${next}` })
  const dueCards = Object.values(p.cards).filter(c => c.due <= Date.now()).length
  if (dueCards >= 5) recs.push({ kind: 'flashcards', title: `Review ${dueCards} due flashcards`, reason: 'Spaced repetition works best when you review cards on the day they are due.', to: '/flashcards' })
  const completed = Object.keys(p.completed).length
  if (completed >= 10 && !p.attempts.some(a => a.mode === 'mock')) recs.push({ kind: 'mock', title: 'Take the Define mock exam', reason: 'You have covered most lessons. A timed attempt shows where you stand.', to: '/mock' })
  if (!Object.keys(p.formulas).length) recs.push({ kind: 'formula', title: 'Start the Formula Master with DPMO', reason: 'Your profile prioritises mathematics, and DPMO is the most tested Define calculation.', to: '/formulas/dpmo' })
  const seen = new Set<string>()
  return recs.filter(r => (seen.has(r.to) ? false : (seen.add(r.to), true))).slice(0, 5)
}

/* ----------------------------- achievements ----------------------------- */

export interface Achievement { id: string; title: string; desc: string; test: (p: Profile) => boolean }

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', title: 'First Step', desc: 'Complete your first lesson.', test: p => Object.keys(p.completed).length >= 1 },
  ...MODULES.map(m => ({ id: `module-${m.id}`, title: `${m.short} Complete`, desc: `Complete every lesson in ${m.title}.`, test: (p: Profile) => LESSONS.filter(l => l.module === m.id).every(l => p.completed[l.id]) })),
  { id: 'define-complete', title: 'Define Graduate', desc: 'Complete all 19 Define lessons.', test: p => LESSONS.every(l => p.completed[l.id]) },
  { id: 'dpmo-pro', title: 'DPMO Pro', desc: 'Solve 5 DPMO problems correctly.', test: p => (p.formulas.dpmo?.correct ?? 0) >= 5 },
  { id: 'rty-ace', title: 'RTY Ace', desc: 'Solve 5 RTY problems correctly.', test: p => (p.formulas.rty?.correct ?? 0) >= 5 },
  { id: 'formula-master', title: 'Formula Master', desc: 'Answer every Define formula correctly at least 3 times.', test: p => (['dpu', 'dpo', 'dpmo', 'defective', 'fty', 'rty', 'final-yield', 'cycle', 'copq', 'pareto'] as FormulaId[]).every(f => (p.formulas[f]?.correct ?? 0) >= 3) },
  { id: 'master-difficulty', title: 'Master Challenger', desc: 'Solve a Master Challenge problem.', test: p => Object.values(p.formulas).some(f => f?.best === 'master') },
  { id: 'hundred', title: 'Century', desc: 'Answer 100 practice questions.', test: p => Object.values(p.qstats).reduce((s, x) => s + x.seen, 0) >= 100 },
  { id: 'trap-hunter', title: 'Trap Hunter', desc: 'Answer all 18 trap practice questions correctly.', test: p => Array.from({ length: 18 }, (_, i) => `q-trap-${String(i + 1).padStart(2, '0')}`).every(id => (p.qstats[id]?.correct ?? 0) > 0) },
  { id: 'mock-pass', title: 'Mock Ready', desc: 'Score 70% or more on a Define mock exam.', test: p => p.attempts.some(a => a.mode === 'mock' && a.correct / a.total >= 0.7) },
  { id: 'labs-12', title: 'Lab Scientist', desc: 'Complete all 12 signature labs.', test: p => (['yfx', 'voice', 'ctq', 'pareto', 'copq', 'dpmo', 'rty', 'cycle', 'charter', 'smart', 'waste', 'fives'] as LabKey[]).every(k => p.labs[k]) },
  { id: 'streak-3', title: 'Three in a Row', desc: 'Study three days in a row.', test: p => p.streak.best >= 3 },
  { id: 'streak-7', title: 'Week of Focus', desc: 'Study seven days in a row.', test: p => p.streak.best >= 7 },
  { id: 'vocab-50', title: 'Fluent', desc: 'Mark 50 glossary flashcards as known.', test: p => Object.entries(p.cards).filter(([k, c]) => k.startsWith('g:') && (c.known || c.box >= 3)).length >= 50 },
]

export function evaluateAchievements(p: Profile): string[] {
  return ACHIEVEMENTS.filter(a => !p.achievements[a.id] && a.test(p)).map(a => a.id)
}

/** Level from XP: each level needs a little more than the last. */
export function level(xp: number) {
  let lvl = 1, need = 150, acc = 0
  while (xp >= acc + need) { acc += need; lvl++; need = Math.round(need * 1.18) }
  return { level: lvl, into: xp - acc, need }
}
