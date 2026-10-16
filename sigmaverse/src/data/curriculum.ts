import type { Lesson, LessonId, ModuleId } from './types'

export type Tone = 'violet' | 'teal' | 'coral' | 'amber' | 'sky' | 'indigo'

export interface ModuleMeta {
  id: ModuleId
  ref: string
  title: string
  short: string
  tone: Tone
  blurb: string
}

export const MODULES: ModuleMeta[] = [
  { id: 1, ref: '1.1', title: 'The Basics of Six Sigma', short: 'Basics', tone: 'violet', blurb: 'What Six Sigma means, where it came from, how projects run, Y = f(X), the three voices and who does what.' },
  { id: 2, ref: '1.2', title: 'The Fundamentals of Six Sigma', short: 'Fundamentals', tone: 'teal', blurb: 'Processes, CTQs, the cost of poor quality, Pareto analysis and the core metrics: DPU, DPMO, FTY, RTY and cycle time.' },
  { id: 3, ref: '1.3', title: 'Selecting Lean Six Sigma Projects', short: 'Projects', tone: 'coral', blurb: 'Business cases, charters, SMART goals, project metrics and how benefits are evaluated and captured.' },
  { id: 4, ref: '1.4', title: 'The Lean Enterprise', short: 'Lean', tone: 'amber', blurb: 'Lean thinking and its history, how Lean and Six Sigma combine, the seven elements of waste and 5S.' },
]

export interface LessonMeta { id: LessonId; module: ModuleId; officialTitle: string; short: string }

export const LESSONS: LessonMeta[] = [
  { id: '1.1.1', module: 1, officialTitle: 'Meanings of Six Sigma', short: 'Meanings of Six Sigma' },
  { id: '1.1.2', module: 1, officialTitle: 'General History of Six Sigma & Continuous Improvement', short: 'History of Six Sigma' },
  { id: '1.1.3', module: 1, officialTitle: 'Deliverables of a Lean Six Sigma Project', short: 'Project Deliverables' },
  { id: '1.1.4', module: 1, officialTitle: 'The Problem Solving Strategy Y = f(x)', short: 'Y = f(X)' },
  { id: '1.1.5', module: 1, officialTitle: 'Voice of the Customer, Business and Employee', short: 'VOC, VOB and VOE' },
  { id: '1.1.6', module: 1, officialTitle: 'Six Sigma Roles & Responsibilities', short: 'Roles & Responsibilities' },
  { id: '1.2.1', module: 2, officialTitle: 'Defining a Process', short: 'Defining a Process' },
  { id: '1.2.2', module: 2, officialTitle: "Critical to Quality Characteristics (CTQ's)", short: 'CTQs' },
  { id: '1.2.3', module: 2, officialTitle: 'Cost of Poor Quality (COPQ)', short: 'Cost of Poor Quality' },
  { id: '1.2.4', module: 2, officialTitle: 'Pareto Analysis (80:20 rule)', short: 'Pareto Analysis' },
  { id: '1.2.5', module: 2, officialTitle: 'Basic Six Sigma Metrics: including DPU, DPMO, FTY, RTY Cycle Time; deriving these metrics', short: 'Basic Six Sigma Metrics' },
  { id: '1.3.1', module: 3, officialTitle: 'Building a Business Case & Project Charter', short: 'Business Case & Charter' },
  { id: '1.3.2', module: 3, officialTitle: 'Developing Project Metrics', short: 'Project Metrics' },
  { id: '1.3.3', module: 3, officialTitle: 'Financial Evaluation & Benefits Capture', short: 'Financial Evaluation' },
  { id: '1.4.1', module: 4, officialTitle: 'Understanding Lean', short: 'Understanding Lean' },
  { id: '1.4.2', module: 4, officialTitle: 'The History of Lean', short: 'History of Lean' },
  { id: '1.4.3', module: 4, officialTitle: 'Lean & Six Sigma', short: 'Lean & Six Sigma' },
  { id: '1.4.4', module: 4, officialTitle: 'The Seven Elements of Waste: Overproduction, Correction, Inventory, Motion, Overprocessing, Conveyance, Waiting.', short: 'Seven Elements of Waste' },
  { id: '1.4.5', module: 4, officialTitle: '5S: Sort, Straighten, Shine, Standardize, Self-Discipline', short: '5S' },
]

export const lessonMeta = (id: LessonId) => LESSONS.find(l => l.id === id)!
export const moduleMeta = (id: ModuleId) => MODULES.find(m => m.id === id)!
export const toneOf = (id: LessonId): Tone => moduleMeta(lessonMeta(id).module).tone
export const isLessonId = (s: string | undefined): s is LessonId => !!s && LESSONS.some(l => l.id === s)

export function nextLesson(id: LessonId): LessonMeta | undefined {
  const i = LESSONS.findIndex(l => l.id === id)
  return LESSONS[i + 1]
}
export function prevLesson(id: LessonId): LessonMeta | undefined {
  const i = LESSONS.findIndex(l => l.id === id)
  return i > 0 ? LESSONS[i - 1] : undefined
}

const loaders = import.meta.glob<{ lesson: Lesson }>('./lessons/L*.ts')
const cache = new Map<LessonId, Lesson>()

export async function loadLesson(id: LessonId): Promise<Lesson> {
  const hit = cache.get(id)
  if (hit) return hit
  const path = `./lessons/L${id.replace(/\./g, '-')}.ts`
  const loader = loaders[path]
  if (!loader) throw new Error(`Lesson ${id} is not available`)
  const mod = await loader()
  cache.set(id, mod.lesson)
  return mod.lesson
}

export async function loadAllLessons(): Promise<Lesson[]> {
  return Promise.all(LESSONS.map(l => loadLesson(l.id)))
}

/** Tailwind class helpers per tone, written out so the classes are statically discoverable. */
export const TONE = {
  violet: { text: 'text-violet', bg: 'bg-violet', soft: 'bg-violet-soft', border: 'border-violet', ring: 'ring-violet', hex: 'var(--violet)' },
  teal: { text: 'text-teal', bg: 'bg-teal', soft: 'bg-teal-soft', border: 'border-teal', ring: 'ring-teal', hex: 'var(--teal)' },
  coral: { text: 'text-coral', bg: 'bg-coral', soft: 'bg-coral-soft', border: 'border-coral', ring: 'ring-coral', hex: 'var(--coral)' },
  amber: { text: 'text-amber', bg: 'bg-amber', soft: 'bg-amber-soft', border: 'border-amber', ring: 'ring-amber', hex: 'var(--amber)' },
  sky: { text: 'text-sky', bg: 'bg-sky', soft: 'bg-sky-soft', border: 'border-sky', ring: 'ring-sky', hex: 'var(--sky)' },
  indigo: { text: 'text-indigo', bg: 'bg-indigo', soft: 'bg-indigo-soft', border: 'border-indigo', ring: 'ring-indigo', hex: 'var(--indigo)' },
} as const
