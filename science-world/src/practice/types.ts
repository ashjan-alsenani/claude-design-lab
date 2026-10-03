/**
 * Practice & Master («تدرّب واختبر نفسك») — question bank schema.
 *
 * Questions are pure data stored as JSON under src/data/practice/<subject>/<unitId>/*.json
 * (one or more files per unit, merged when loaded). Only the unit being practised is loaded.
 * `scripts/practice-index.mjs` validates every bank and writes a small index
 * (counts + concepts per unit) so overview screens never load whole banks.
 */
import type { SubjectId, Visual } from '../data/types';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'challenge';
export type Cognitive = 'knowledge' | 'understanding' | 'application' | 'analysis' | 'reasoning';
export type EnglishSkill = 'listening' | 'vocabulary' | 'grammar' | 'reading' | 'writing';

/**
 * What kind of thinking a question asks for — drives the subject-specific modes.
 *  science: concept · diagram · data (tables/graphs) · experiment · scenario (real life) · cause · error
 *  math:    concept · calculation · visual · word (real-life problem) · reasoning · error (find the mistake) · estimate
 *  english: the `skill` field is used instead (listening, vocabulary, grammar, reading, writing)
 */
export type Style = 'concept' | 'diagram' | 'data' | 'experiment' | 'scenario' | 'cause' | 'error' | 'calculation' | 'visual' | 'word' | 'reasoning' | 'estimate';

export interface PChoice {
  id: string;
  text: string;
  emoji?: string;
  visual?: Visual;
}

/** A small table shown with the question (science data, math timetables…). */
export interface PTable {
  caption?: string;
  columns: string[];
  rows: (string | number)[][];
}

/** A simple chart drawn in SVG. */
export interface PChart {
  type: 'bar' | 'line';
  title?: string;
  xLabel?: string;
  yLabel?: string;
  unit?: string;
  points: { label: string; value: number }[];
}

/** Written calculation shown vertically, always left-to-right. */
export interface PColumn {
  op: '+' | '−' | '×' | '÷';
  lines: string[]; // operands, e.g. ['8.72', '6.25']
}

export interface PBase {
  /** unique, e.g. "SCI-U1-001", "MATH-M1-ROUND-023", "ENG-E1-GRM-014" */
  id: string;
  /** lesson id from the site, e.g. "1-2", "m1-2", "e1-3" */
  lesson: string;
  /** concept id (kebab-case), declared in the bank's `concepts` list */
  concept: string;
  /** english only: which skill area */
  skill?: EnglishSkill;
  style?: Style;
  difficulty: Difficulty;
  cognitive: Cognitive;
  /** the question. Arabic for science & math, English for English */
  prompt: string;
  /** optional sentence with ___ for the missing word (choice questions) */
  sentence?: string;
  visual?: Visual;
  table?: PTable;
  chart?: PChart;
  column?: PColumn;
  /** id of a passage in the bank's `passages` (reading questions) */
  passage?: string;
  /** exact words from the passage (or audio) that prove the answer — highlighted in feedback */
  evidence?: string;
  /** listening: the text read aloud by the browser voice (the child does not see it until feedback) */
  audio?: string;
  /** progressive hints, never the answer itself */
  hints?: string[];
  /** math word problems: «ساعدني أفهم السؤال» */
  understand?: { know: string; want: string; op?: string };
  /** WHY the correct answer is correct (child friendly). English questions: simple English */
  explanation: string;
  /** english only: the same explanation in Arabic (shown on «اشرحها لي بالعربي») */
  explanationAr?: string;
  /** tiny memory rule shown after every answer (💡 تذكّر) */
  tip: string;
  /** worked solution, one short step per line (math «كيف نحلها؟», science reasoning chains) */
  steps?: string[];
}

export interface ChoiceQ extends PBase {
  type: 'choice';
  options: PChoice[];
  answer: string;
  /** why each wrong option is wrong (keyed by option id) */
  wrongWhy?: Record<string, string>;
  /** keep the options in the given order (sequences, sizes, number lines) */
  keepOrder?: boolean;
}
export interface TrueFalseQ extends PBase {
  type: 'tf';
  answer: boolean;
  /** shown when the child picks the wrong side */
  wrongWhy?: string;
}
export interface MultiQ extends PBase {
  type: 'multi';
  options: PChoice[];
  answers: string[];
}
export interface NumberQ extends PBase {
  type: 'number';
  /** Western or Arabic-Indic digits; decimal comma or point; normalised when checking */
  answer: string;
  accept?: string[];
  /** printed after the box, e.g. 'سم' */
  unit?: string;
  /** known wrong answers and what they reveal (error diagnosis) */
  mistakes?: { answer: string; why: string }[];
}
export interface RemainderQ extends PBase {
  type: 'remainder';
  quotient: string;
  remainder: string;
  mistakes?: { quotient: string; remainder: string; why: string }[];
}
export interface TextQ extends PBase {
  type: 'text';
  /** the word/phrase to type (case-insensitive, spaces trimmed) */
  answer: string;
  accept?: string[];
  /** missing-letters pattern shown to the child, e.g. "c _ m e r a" */
  pattern?: string;
  /** scrambled letters shown to the child, e.g. "meraac" */
  scrambled?: string;
  mistakes?: { answer: string; why: string }[];
}
export interface OrderQ extends PBase {
  type: 'order';
  /** listed in the CORRECT order; shuffled for the child */
  items: { id: string; text: string; emoji?: string }[];
}
export interface MatchQ extends PBase {
  type: 'match';
  pairs: { id: string; left: string; right: string; leftEmoji?: string }[];
}
export interface SortQ extends PBase {
  type: 'sort';
  buckets: { id: string; label: string; emoji?: string }[];
  items: { id: string; text: string; emoji?: string; bucket: string }[];
}
/** Guided writing (English): never auto-marked right/wrong; checklist + word count + model answer. */
export interface WritingQ extends PBase {
  type: 'writing';
  task: 'story' | 'review' | 'interview' | 'paragraph' | 'message';
  minWords: number;
  /** picture story panels (emoji scenes), in order */
  pictures?: { emoji: string; caption?: string }[];
  /** useful words to use */
  words?: string[];
  /** guiding questions, one per step ("Who is in the story?") */
  guide?: string[];
  /** a starting sentence offered on request */
  starter: string;
  /** sentence frame offered on request (reviews) */
  frame?: string[];
  /** full model answer, only shown when the child asks */
  model: string;
}

export type PracticeQuestion = ChoiceQ | TrueFalseQ | MultiQ | NumberQ | RemainderQ | TextQ | OrderQ | MatchQ | SortQ | WritingQ;
export type QuestionType = PracticeQuestion['type'];

export interface Concept {
  id: string;
  /** Arabic name shown to the child, e.g. «وظيفة القلب» (English units: an English label is fine) */
  label: string;
  lesson: string;
  /** english: skill of the concept */
  skill?: EnglishSkill;
}

export interface Passage {
  id: string;
  title: string;
  text: string;
  /** words a child can tap for a simple meaning */
  glossary?: { word: string; meaning: string; ar?: string }[];
}

/** One JSON file of a unit's bank. */
export interface BankFile {
  subject: SubjectId;
  unit: string;
  concepts: Concept[];
  passages?: Passage[];
  questions: PracticeQuestion[];
}

/** A unit's full bank, merged from its files. */
export interface Bank {
  subject: SubjectId;
  unit: string;
  concepts: Concept[];
  passages: Passage[];
  questions: PracticeQuestion[];
}

/** Written by scripts/practice-index.mjs. */
export interface BankIndex {
  [unitId: string]: { subject: SubjectId; total: number; concepts: Concept[]; byLesson: Record<string, number>; byDifficulty: Record<Difficulty, number> };
}
