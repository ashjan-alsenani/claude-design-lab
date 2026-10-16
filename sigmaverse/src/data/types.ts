/**
 * Content contract for SigmaVerse.
 *
 * Rich text strings (type `Rich`) support a small inline markup that the
 * reader renders:
 *   **bold**            strong emphasis
 *   *italic*            emphasis
 *   [[Term]]            glossary link; the text must match a glossary term or one of its aliases
 *   [[Term|shown text]] glossary link with custom display text
 *   `code`              monospace (units, field names)
 *   $...$               inline KaTeX math, e.g. $DPU = \frac{D}{U}$
 *
 * Writing rules for all learner-facing text: English only, original wording
 * (paraphrase, never copy long passages from sources), and no em dash or
 * en dash characters. Use commas, colons, parentheses or separate sentences.
 */
export type Rich = string

export type ModuleId = 1 | 2 | 3 | 4

export type LessonId =
  | '1.1.1' | '1.1.2' | '1.1.3' | '1.1.4' | '1.1.5' | '1.1.6'
  | '1.2.1' | '1.2.2' | '1.2.3' | '1.2.4' | '1.2.5'
  | '1.3.1' | '1.3.2' | '1.3.3'
  | '1.4.1' | '1.4.2' | '1.4.3' | '1.4.4' | '1.4.5'

/** Keys of the interactive labs that a lesson can embed. */
export type LabKey =
  | 'yfx' | 'voice' | 'ctq' | 'pareto' | 'copq' | 'dpmo' | 'rty'
  | 'cycle' | 'charter' | 'smart' | 'waste' | 'fives'
  | 'history' | 'dmaic' | 'roles' | 'process' | 'metrics' | 'finance'
  | 'value' | 'lean-sigma'

/** Keys of the animated diagrams available to lessons. */
export type DiagramKey =
  | 'sigma-curve' | 'timeline' | 'dmaic' | 'yfx' | 'voices' | 'roles'
  | 'process' | 'ctq-tree' | 'copq-iceberg' | 'pareto' | 'dpmo-flow'
  | 'charter' | 'metric-ladder' | 'benefits' | 'lean-flow'
  | 'lean-history' | 'lean-vs-sigma' | 'wastes' | 'fives'

/** Source documents known to the academy (see data/sources.ts). */
export type SourceId = 'syllabus' | 'gb-101-200' | 'gb-201-300' | 'gb-301-400' | 'gb-401-500' | 'gb-501-600' | 'supplementary'

export interface SourceRef {
  source: SourceId
  /** Page numbers inside the supplied PDF file (1-based, as a PDF viewer shows them). */
  pdfPages?: number[]
  /** Printed page numbers in the book (printed = PDF page - 3 for the training book). */
  printedPages?: number[]
  /** What this reference supports, in one short sentence. */
  note: string
}

/** Content provenance for a lesson section or the whole lesson. */
export type ContentStatus = 'source-supported' | 'partial-source' | 'supplementary'

export type Block =
  | { kind: 'p'; text: Rich }
  | { kind: 'h'; text: string }
  | { kind: 'list'; ordered?: boolean; items: Rich[] }
  | { kind: 'callout'; tone: 'tip' | 'trap' | 'note' | 'supplementary' | 'memory'; title: string; text: Rich }
  | { kind: 'formula'; tex: string; caption?: Rich }
  | { kind: 'table'; caption?: string; head: string[]; rows: Rich[][] }
  /** Collapsible "go deeper" content, closed by default. */
  | { kind: 'advanced'; title: string; blocks: Block[] }
  /** Expandable worked example, closed by default. */
  | { kind: 'example'; title: string; blocks: Block[] }
  /** Inline animated diagram. */
  | { kind: 'diagram'; diagram: DiagramKey; caption: Rich }
  /** Embed an interactive lab inline (use sparingly, at most two per lesson). */
  | { kind: 'lab'; lab: LabKey; prompt: Rich }

export interface LessonSection {
  id: string // kebab-case, unique within the lesson
  title: string
  blocks: Block[]
}

export interface WorkedExample {
  title: string
  scenario: Rich
  steps: Rich[]
  answer: Rich
}

export interface Lesson {
  id: LessonId
  module: ModuleId
  /** Exact official syllabus wording for the topic. */
  officialTitle: string
  /** Friendly display title. */
  title: string
  subtitle: string
  readingMinutes: number
  status: ContentStatus
  objectives: string[]
  /** 1-2 paragraphs. */
  overview: Rich[]
  /** The main deep-reading body: 3-6 sections. Aim for 600-1200 words total for the main lessons. */
  sections: LessonSection[]
  whyItMatters: Rich[]
  businessExample: { title: string; industry: string; blocks: Block[] }
  visual: { diagram: DiagramKey; title: string; caption: Rich }
  definitions: { term: string; definition: Rich }[]
  comparisons: { title: string; head: string[]; rows: Rich[][] }[]
  misconceptions: { myth: Rich; reality: Rich }[]
  examTraps: { title: string; text: Rich }[]
  workedExamples: WorkedExample[]
  activity: { lab: LabKey; prompt: Rich }
  /** Ids of questions from the question bank used for "Check your understanding". */
  checkQuestionIds: string[]
  takeaways: Rich[]
  flashcards: { front: string; back: Rich }[]
  sources: SourceRef[]
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'trap' | 'master'

export type QuestionCategory =
  | 'definition' | 'concept' | 'scenario' | 'best-tool' | 'incorrect-statement'
  | 'compare' | 'calculation' | 'chart' | 'project-selection' | 'business-case'
  | 'waste' | 'ctq' | 'dmaic-boundary' | 'wording'

/** Exam-trap wording tags (see data/traps.ts). */
export type TrapTag =
  | 'not' | 'except' | 'least' | 'most' | 'best' | 'first' | 'primary'
  | 'before' | 'after' | 'without-rework' | 'first-pass' | 'total-defects'
  | 'defective-units' | 'per-opportunity' | 'cumulative-percentage'
  | 'verified-root-cause' | 'estimated-benefits' | 'realized-benefits'

/**
 * Mistake categories tracked in the learner's Mistake Notebook. Attach one to a
 * wrong option when choosing that option reveals a specific misunderstanding.
 */
export type MistakeTag =
  | 'defects-vs-defectives' | 'missing-opportunities' | 'missing-million'
  | 'percent-conversion' | 'rty-added-or-averaged' | 'fty-includes-rework'
  | 'copq-classification' | 'time-units' | 'gross-vs-net' | 'dpu-vs-dpmo'
  | 'fty-vs-rty' | 'voice-confusion' | 'role-confusion' | 'phase-boundary'
  | 'solution-in-problem' | 'smart-goal' | 'pareto-reading' | 'cumulative-percent'
  | 'waste-confusion' | 'five-s-order' | 'lean-vs-sigma' | 'ctq-vague'
  | 'cause-vs-root-cause' | 'estimated-vs-realized' | 'metric-type' | 'scope'
  | 'wording-negation' | 'history-facts' | 'process-boundary' | 'cycle-time'

export interface Question {
  id: string // e.g. "q-1.2.5-07"
  lesson: LessonId
  category: QuestionCategory
  difficulty: Difficulty
  /** Question stem. Use **bold** sparingly; trap words are highlighted by the app. */
  stem: Rich
  /** Optional data shown above the options (a small table). */
  table?: { head: string[]; rows: string[][] }
  options: [Rich, Rich, Rich, Rich]
  answer: 0 | 1 | 2 | 3
  /** Why the correct option is correct. */
  explanation: Rich
  /** One entry per option. The entry at `answer` restates briefly why it is right; the others explain why each is wrong. */
  optionNotes: [Rich, Rich, Rich, Rich]
  /** Mistake revealed by choosing each option (null for the answer or when not diagnostic). */
  optionMistakes?: [MistakeTag | null, MistakeTag | null, MistakeTag | null, MistakeTag | null]
  traps?: TrapTag[]
  /** True when the question requires arithmetic. */
  numeric?: boolean
}

export interface GlossaryTerm {
  term: string
  acronym?: string
  aliases?: string[]
  lesson: LessonId
  easy: Rich
  detail: Rich
  example: Rich
  related: string[]
  confusion?: Rich
}

export interface TrapEntry {
  tag: TrapTag
  word: string
  meaning: Rich
  whyMissed: Rich
  example: { stem: Rich; options: [Rich, Rich, Rich, Rich]; answer: 0 | 1 | 2 | 3; tempting: 0 | 1 | 2 | 3 }
  appears: Rich
  actually: Rich
  strategy: Rich
  practiceQuestionId: string
}
