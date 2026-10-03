/**
 * Educational content model.
 * Every lesson is pure data: a list of short "steps" rendered by the lesson player.
 * Add a new lesson by adding data, never by writing a new page component.
 */

export type UnitId = string; // science: u1–u3 · math: m1–m4 · english: e0–e2
export type SubjectId = 'science' | 'math' | 'english';
export type UnitTheme = 'coral' | 'leaf' | 'grape' | 'ocean' | 'sunset' | 'mint' | 'berry' | 'sky' | 'lemon' | 'violet';
export type MascotMood = 'happy' | 'excited' | 'thinking' | 'surprised' | 'celebrating' | 'encouraging';

/** A visual: an illustration key from the SVG library, or an emoji fallback. */
export interface Visual {
  /** key in illustrations/registry.tsx */
  art?: string;
  emoji?: string;
  /** Optional AI-generated asset path, see ASSETS.md. Falls back to art/emoji if missing. */
  asset?: string;
  /** A parametric math drawing (number line, place value, grid, shape…). */
  math?: MathVisual;
  alt: string;
}

/* ---------- Math drawings (rendered by illustrations/math.tsx) ---------- */
export type Point = [number, number];
export type MathVisual =
  | { type: 'numberLine'; min: number; max: number; step: number; labelEvery?: number; points?: { value: number; label?: string; color?: string }[]; jumps?: { from: number; to: number; label?: string }[] }
  | { type: 'placeValue'; number: string; highlight?: number[] }
  | {
      type: 'grid';
      cols: number;
      rows: number;
      /** show axes with numbers (coordinate grid) */
      axes?: boolean;
      cells?: { x: number; y: number; color?: string }[];
      shapes?: { points: Point[]; color?: string; label?: string; dashed?: boolean }[];
      lines?: { from: Point; to: Point; color?: string; dashed?: boolean; label?: string }[];
      dots?: { x: number; y: number; label?: string; color?: string }[];
    }
  | { type: 'polygon'; sides: number; label?: string; color?: string }
  | { type: 'triangle'; angles: [string, string, string]; kind?: 'equilateral' | 'isosceles' | 'right' | 'scalene'; color?: string }
  | { type: 'solid'; name: 'cube' | 'cuboid' | 'squarePyramid' | 'triangularPyramid' | 'triangularPrism' | 'cylinder' | 'cone' | 'sphere' }
  | { type: 'array'; rows: number; cols: number; color?: string }
  | { type: 'ruler'; length: number; mark?: number; label?: string }
  | { type: 'thermometer'; min: number; max: number; value: number; unit?: string }
  | { type: 'clock'; hour: number; minute: number; digital?: boolean }
  | { type: 'cards'; items: string[] }
  | { type: 'hundredSquare'; shaded: number; color?: string };

export interface Choice {
  id: string;
  text: string;
  emoji?: string;
}

/* ---------- Questions (used in lessons, mini quizzes, unit quizzes, challenges) ---------- */

interface QuestionBase {
  id: string;
  prompt: string;
  visual?: Visual;
  /** shown after a correct answer: why it is right (from the book) */
  explain: string;
  /** shown after a wrong answer: a gentle hint that points back to the lesson */
  hint: string;
  /** English: a word or sentence read aloud with a 🔊 button (listening questions) */
  say?: string;
}

export interface McqQuestion extends QuestionBase {
  kind: 'mcq';
  choices: Choice[];
  answer: string; // choice id
}

export interface TrueFalseQuestion extends QuestionBase {
  kind: 'tf';
  answer: boolean;
}

export interface FillQuestion extends QuestionBase {
  kind: 'fill';
  /** sentence with ___ where the missing word goes */
  sentence: string;
  choices: Choice[];
  answer: string;
}

/** Tap every picture that matches the prompt. */
export interface TapAllQuestion extends QuestionBase {
  kind: 'tapAll';
  choices: Choice[];
  answers: string[];
}

/** Type the answer on a big on-screen keypad (math). Digits may be Arabic-Indic or Western. */
export interface NumberQuestion extends QuestionBase {
  kind: 'number';
  /** the correct answer, e.g. '345' or '0.25' or '-3' (Western or Arabic-Indic digits) */
  answer: string;
  /** other accepted forms, e.g. ['0.5', '0.50'] */
  accept?: string[];
  /** shown after the input box, e.g. 'سم' */
  unit?: string;
}

export type Question = McqQuestion | TrueFalseQuestion | FillQuestion | TapAllQuestion | NumberQuestion;

/* ---------- Lesson steps ---------- */

export interface IntroStep {
  type: 'intro';
  mascot: string;
  visual?: Visual;
  /** a "did you know / think about it" hook question */
  hook?: string;
}

export interface ExplainCard {
  title: string;
  text: string;
  visual?: Visual;
}

/** Short explanation cards revealed one at a time by tapping. */
export interface RevealStep {
  type: 'reveal';
  title: string;
  mascot?: string;
  cards: ExplainCard[];
}

export interface Hotspot {
  id: string;
  label: string;
  text: string;
  /** percent position inside the illustration (x from left) */
  x: number;
  y: number;
}

/** A simple emoji "scene" when no hand-drawn art exists (habitats, gardens...). */
export interface Scene {
  bg: 'sky' | 'sea' | 'savanna' | 'garden' | 'forest' | 'lab' | 'home';
  items: { emoji: string; x: number; y: number; size?: number; label?: string }[];
}

/** Tap every hotspot on a diagram to discover it.
 *  Use `art` (hand-drawn SVG key) or `scene`. A spot with the same id as an
 *  art region highlights that region when opened. */
export interface HotspotStep {
  type: 'hotspot';
  title: string;
  mascot?: string;
  art?: string;
  scene?: Scene;
  spots: Hotspot[];
}

/** Watch a process happen: press "next step". */
export interface ProcessStep {
  type: 'process';
  title: string;
  mascot?: string;
  art?: string;
  steps: { title: string; text: string; emoji?: string; frame?: number; math?: MathVisual }[];
}

/** Flip cards: front = term, back = meaning. */
export interface FlipStep {
  type: 'flip';
  title: string;
  mascot?: string;
  cards: { front: string; back: string; emoji?: string }[];
}

/** Drag (or tap) items into buckets. */
export interface SortStep {
  type: 'sort';
  title: string;
  mascot?: string;
  buckets: { id: string; label: string; emoji?: string }[];
  items: { id: string; text: string; emoji?: string; bucket: string }[];
  explain: string;
}

/** Match the left item with the right item. */
export interface MatchStep {
  type: 'match';
  title: string;
  mascot?: string;
  pairs: { id: string; left: string; right: string; leftEmoji?: string }[];
  explain: string;
}

/** Arrange items in the right order (food chain, process steps...). */
export interface OrderStep {
  type: 'order';
  title: string;
  mascot?: string;
  /** items listed in the CORRECT order; the player shuffles them */
  items: { id: string; text: string; emoji?: string }[];
  /** chain renders arrows between items (food chains) */
  layout?: 'list' | 'chain';
  explain: string;
}

export interface QuestionStep {
  type: 'question';
  question: Question;
}

/** Memory game with pairs (term ↔ meaning). */
export interface MemoryStep {
  type: 'memory';
  title: string;
  mascot?: string;
  pairs: { id: string; a: string; b: string; emoji?: string }[];
}

/** A data table / graph to read, followed by a question. */
export interface DataStep {
  type: 'data';
  title: string;
  mascot?: string;
  caption?: string;
  columns: string[];
  rows: (string | number)[][];
  /** draws a simple bar chart of column `chartValueCol` labelled by column 0 */
  chartValueCol?: number;
  chartUnit?: string;
  question: Question;
}

/** "Talk about it" (تحدث عن) — think, then reveal ideas from the book. */
export interface ThinkStep {
  type: 'think';
  title: string;
  prompt: string;
  ideas: string[];
  visual?: Visual;
}

/** A virtual investigation: choose a variable and see the book's result. */
export interface ExperimentStep {
  type: 'experiment';
  title: string;
  mascot?: string;
  question: string;
  art?: string;
  trials: { id: string; label: string; emoji?: string; result: string; value?: number }[];
  conclusion: string;
}

/** A short conversation or story read line by line (English dialogues, picture stories).
 *  Every English line has a 🔊 button; `ar` is an optional Arabic help line. */
export interface DialogueStep {
  type: 'dialogue';
  title: string;
  mascot?: string;
  /** emoji that sets the scene, e.g. '🏞️' */
  scene?: string;
  cast: { name: string; emoji: string }[];
  /** `who` is a cast name; leave it empty for a narrator line */
  lines: { who: string; text: string; ar?: string }[];
}

export type LessonStep =
  | IntroStep
  | RevealStep
  | HotspotStep
  | ProcessStep
  | FlipStep
  | SortStep
  | MatchStep
  | OrderStep
  | QuestionStep
  | MemoryStep
  | DataStep
  | ThinkStep
  | ExperimentStep
  | DialogueStep;

export interface VocabWord {
  word: string;
  meaning: string;
}

export interface Lesson {
  id: string; // unique across subjects, e.g. "1-1" (science) or "m1-1" (math)
  /** number shown to the child (defaults to id), e.g. "1-1" for math lesson "m1-1" */
  label?: string;
  unitId: UnitId;
  title: string;
  emoji: string;
  /** book page reference */
  page: number;
  /** "أستطيع" learning objectives from the book */
  objectives: string[];
  vocab: VocabWord[];
  /** optional verse box printed in the book */
  verse?: string;
  steps: LessonStep[];
  /** "ماذا تعلّمتُ؟" — key takeaways from the book */
  summary: string[];
  /** 3–5 questions shown one at a time at the end */
  quiz: Question[];
}

export interface BossMission {
  id: string;
  story: string;
  question: Question;
}

export interface Unit {
  id: UnitId;
  number: number;
  /** replaces "الوحدة {number}" (e.g. 'Welcome') */
  numberLabel?: string;
  title: string;
  world: string; // name of the map world
  emoji: string;
  /** css custom-property theme name */
  theme: UnitTheme;
  intro: string;
  lessons: Lesson[];
  /** "تحقق من تقدمك" — the book's end-of-unit questions */
  unitQuiz: Question[];
  boss: {
    title: string;
    story: string;
    treasure: string;
    missions: BossMission[];
    ending: string;
  };
}

export interface Subject {
  id: SubjectId;
  title: string; // العلوم
  emoji: string;
  /** short line under the title */
  tagline: string;
  theme: UnitTheme;
  units: Unit[];
}
