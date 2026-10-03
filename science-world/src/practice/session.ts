/**
 * Practice modes and question selection.
 * Selection favours new questions and concepts the child struggles with,
 * spreads questions across concepts, and never repeats a question inside a session.
 */
import type { SubjectId } from '../data/types';
import { shuffle } from '../lib/random';
import { conceptKey, conceptMastery, conceptStatus, type PracticeState } from './store';
import type { Bank, Difficulty, EnglishSkill, PracticeQuestion, QuestionType, Style } from './types';

export interface ModeDef {
  id: string;
  icon: string;
  title: string;
  text: string;
  /** only for these subjects (omit = all) */
  only?: SubjectId[];
  /** feedback after each question (default) or only at the end (real exam) */
  feedback?: 'each' | 'end';
  /** shown in the unit's "special" row */
  group: 'main' | 'review' | 'focus' | 'exam';
}

export const modes: ModeDef[] = [
  { id: 'quick', icon: '🎯', title: 'تدريب سريع', text: '١٠ أسئلة متنوعة', group: 'main' },
  { id: 'unit', icon: '📘', title: 'تدريب الوحدة', text: '٢٠ سؤالًا من كل الدروس، من الأسهل إلى الأصعب', group: 'main' },
  { id: 'challenge', icon: '🔥', title: 'تحدٍّ', text: 'أسئلة صعبة وأسئلة الخبراء', group: 'main' },
  { id: 'random', icon: '🎲', title: 'تدريب عشوائي', text: '١٥ سؤالًا عشوائيًا', group: 'main' },
  { id: 'mistakes', icon: '❌', title: 'راجعي أخطائي', text: 'أسئلة جديدة عن المفاهيم التي أخطأتِ فيها', group: 'review' },
  { id: 'weak', icon: '🧠', title: 'نقطة ضعفي', text: 'تدريب مركّز على المفاهيم الأضعف', group: 'review' },
  { id: 'mastered', icon: '⭐', title: 'أتقنتها', text: 'مراجعة سريعة لما أتقنتِه حتى لا يُنسى', group: 'review' },
  // science
  { id: 'data', icon: '📊', title: 'الرسوم والجداول', text: 'اقرئي البيانات واستنتجي', only: ['science'], group: 'focus' },
  { id: 'experiment', icon: '🧪', title: 'أسئلة التجارب', text: 'المتغيرات والتنبؤ والاستنتاج', only: ['science'], group: 'focus' },
  { id: 'concepts', icon: '🌱', title: 'فهم المفاهيم', text: 'لماذا وكيف يحدث ذلك؟', only: ['science'], group: 'focus' },
  { id: 'life', icon: '🌍', title: 'تطبيقات من الحياة', text: 'مواقف من حياتنا اليومية', only: ['science'], group: 'focus' },
  // math
  { id: 'understand', icon: '🧠', title: 'فهم الفكرة', text: 'المفاهيم والقواعد', only: ['math'], group: 'focus' },
  { id: 'solve', icon: '✏️', title: 'تدرّبي على الحل', text: 'حسابات بخطوات واضحة', only: ['math'], group: 'focus' },
  { id: 'think', icon: '🧩', title: 'مسائل تفكير', text: 'استدلال وتحليل', only: ['math'], group: 'focus' },
  { id: 'word', icon: '🌍', title: 'مسائل من الحياة', text: 'تسوّق ورحلات ومدرسة', only: ['math'], group: 'focus' },
  { id: 'visual', icon: '📐', title: 'تدريب بصري', text: 'خطوط أعداد وجداول ورسوم', only: ['math'], group: 'focus' },
  { id: 'detective', icon: '🕵️', title: 'اكتشفي الخطأ', text: 'أين أخطأ الطالب؟', only: ['math'], group: 'focus' },
  // english
  { id: 'listening', icon: '🎧', title: 'Listening', text: 'استمعي وأجيبي', only: ['english'], group: 'focus' },
  { id: 'vocabulary', icon: '🔤', title: 'Vocabulary', text: 'الكلمات والتهجئة', only: ['english'], group: 'focus' },
  { id: 'grammar', icon: '🧩', title: 'Grammar', text: 'القواعد', only: ['english'], group: 'focus' },
  { id: 'reading', icon: '📖', title: 'Reading', text: 'اقرئي وابحثي عن الدليل', only: ['english'], group: 'focus' },
  { id: 'writing', icon: '✍️', title: 'Writing', text: 'كتابة موجّهة خطوة بخطوة', only: ['english'], group: 'focus' },
  { id: 'mission', icon: '🎯', title: 'English Mission', text: '٢٠ نشاطًا من كل المهارات', only: ['english'], group: 'main' },
  // exams
  { id: 'exam-train', icon: '🏆', title: 'اختبار تدريبي', text: 'بأسلوب الاختبار، مع شرح بعد كل سؤال', group: 'exam' },
  { id: 'exam', icon: '📝', title: 'محاكاة الاختبار', text: 'بدون تلميحات، والنتيجة والشرح في النهاية', feedback: 'end', group: 'exam' },
];

export function modesFor(subject: SubjectId) {
  return modes.filter((m) => !m.only || m.only.includes(subject));
}

export interface Filters {
  lesson?: string;
  difficulty?: Difficulty;
  type?: QuestionType;
  status?: 'new' | 'correct' | 'wrong' | 'mastered';
  concept?: string;
  skill?: EnglishSkill;
}

const rank: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2, challenge: 3 };

function status(state: PracticeState, q: PracticeQuestion, bank: Bank) {
  const r = state.q[q.id];
  const c = state.c[conceptKey(bank.subject, bank.unit, q.concept)];
  return { attempted: Boolean(r), lastOk: r?.last.ok, mastered: conceptStatus(c) === 'mastered', mastery: conceptMastery(c) };
}

/** Weighted pick: new and previously-wrong questions first, at most `perConcept` per concept. */
function pick(pool: PracticeQuestion[], n: number, state: PracticeState, bank: Bank, perConcept = 2): PracticeQuestion[] {
  const weighted = shuffle(pool)
    .map((q) => {
      const s = status(state, q, bank);
      const w = !s.attempted ? 3 : s.lastOk === false ? 4 : s.mastered ? 0.4 : 1;
      return { q, key: Math.random() * w };
    })
    .sort((a, b) => b.key - a.key)
    .map((x) => x.q);
  const out: PracticeQuestion[] = [];
  const per = new Map<string, number>();
  const cap = Math.max(perConcept, Math.ceil(n / Math.max(1, new Set(pool.map((q) => q.concept)).size)));
  for (const q of weighted) {
    if (out.length >= n) break;
    const k = per.get(q.concept) ?? 0;
    if (k >= cap) continue;
    per.set(q.concept, k + 1);
    out.push(q);
  }
  for (const q of weighted) if (out.length < n && !out.includes(q)) out.push(q);
  return out;
}

/** Round-robin across lessons so every lesson is represented. */
function spreadLessons(pool: PracticeQuestion[], n: number, state: PracticeState, bank: Bank) {
  const lessons = [...new Set(pool.map((q) => q.lesson))];
  const per = lessons.map((l) => pick(pool.filter((q) => q.lesson === l), Math.ceil(n / lessons.length) + 1, state, bank));
  const out: PracticeQuestion[] = [];
  for (let i = 0; out.length < n && per.some((p) => p[i]); i++) for (const p of per) if (p[i] && out.length < n) out.push(p[i]);
  return out;
}

const progressive = (qs: PracticeQuestion[]) => qs.slice().sort((a, b) => rank[a.difficulty] - rank[b.difficulty]);
const noWriting = (q: PracticeQuestion) => q.type !== 'writing';

/** Exam-like balance: 25% easy · 40% medium · 25% hard · 10% challenge. */
function examMix(pool: PracticeQuestion[], n: number, state: PracticeState, bank: Bank) {
  const share: [Difficulty, number][] = [['easy', 0.25], ['medium', 0.4], ['hard', 0.25], ['challenge', 0.1]];
  const out: PracticeQuestion[] = [];
  for (const [d, f] of share) out.push(...spreadLessons(pool.filter((q) => q.difficulty === d), Math.round(n * f), state, bank));
  for (const q of shuffle(pool)) if (out.length < n && !out.includes(q)) out.push(q);
  return progressive(out.slice(0, n));
}

export function applyFilters(bank: Bank, state: PracticeState, f: Filters) {
  return bank.questions.filter((q) => {
    if (f.lesson && q.lesson !== f.lesson) return false;
    if (f.difficulty && q.difficulty !== f.difficulty) return false;
    if (f.type && q.type !== f.type) return false;
    if (f.concept && q.concept !== f.concept) return false;
    if (f.skill && q.skill !== f.skill) return false;
    if (f.status) {
      const s = status(state, q, bank);
      if (f.status === 'new' && s.attempted) return false;
      if (f.status === 'correct' && s.lastOk !== true) return false;
      if (f.status === 'wrong' && s.lastOk !== false) return false;
      if (f.status === 'mastered' && !s.mastered) return false;
    }
    return true;
  });
}

const styleIs = (...st: Style[]) => (q: PracticeQuestion) => Boolean(q.style && st.includes(q.style));

/** Builds the question list for a session. Returns [] when the mode has nothing to offer yet. */
export function buildSession(bank: Bank, state: PracticeState, mode: string, filters: Filters = {}): PracticeQuestion[] {
  const all = bank.questions;
  const concepts = [...new Set(all.map((q) => q.concept))];
  const cStatus = (c: string) => conceptStatus(state.c[conceptKey(bank.subject, bank.unit, c)]);
  switch (mode) {
    case 'quick':
      return pick(all.filter(noWriting), 10, state, bank);
    case 'unit':
      return progressive(spreadLessons(all.filter(noWriting), 20, state, bank));
    case 'challenge':
      return progressive(pick(all.filter((q) => (q.difficulty === 'hard' || q.difficulty === 'challenge') && noWriting(q)), 10, state, bank));
    case 'random':
      return shuffle(all.filter(noWriting)).slice(0, 15);
    case 'mistakes': {
      // new questions on the concepts with mistakes; a previously wrong question only if nothing else is left
      const wrongIds = new Set(all.filter((q) => state.q[q.id]?.last.ok === false).map((q) => q.id));
      const bad = new Set(all.filter((q) => wrongIds.has(q.id)).map((q) => q.concept));
      const fresh = all.filter((q) => bad.has(q.concept) && !wrongIds.has(q.id) && noWriting(q));
      const chosen = pick(fresh, 10, state, bank, 3);
      for (const q of all) if (chosen.length < 10 && wrongIds.has(q.id) && !chosen.includes(q)) chosen.push(q);
      return progressive(chosen);
    }
    case 'weak': {
      const scored = concepts
        .filter((c) => cStatus(c) !== 'new' && cStatus(c) !== 'mastered')
        .sort((a, b) => conceptMastery(state.c[conceptKey(bank.subject, bank.unit, a)]) - conceptMastery(state.c[conceptKey(bank.subject, bank.unit, b)]))
        .slice(0, 3);
      return progressive(pick(all.filter((q) => scored.includes(q.concept) && noWriting(q)), 10, state, bank, 4));
    }
    case 'mastered':
      return pick(all.filter((q) => cStatus(q.concept) === 'mastered' && noWriting(q)), 10, state, bank);
    case 'concept':
      return progressive(pick(all.filter((q) => q.concept === filters.concept && noWriting(q)), 6, state, bank, 6));
    case 'data':
      return pick(all.filter((q) => q.style === 'data' || Boolean(q.table || q.chart)), 10, state, bank);
    case 'experiment':
      return pick(all.filter(styleIs('experiment')), 10, state, bank);
    case 'concepts':
      return pick(all.filter((q) => styleIs('concept', 'cause', 'diagram')(q)), 10, state, bank);
    case 'life':
      return pick(all.filter(styleIs('scenario')), 10, state, bank);
    case 'understand':
      return pick(all.filter((q) => q.style === 'concept' || q.cognitive === 'knowledge' || q.cognitive === 'understanding'), 10, state, bank);
    case 'solve':
      return progressive(pick(all.filter((q) => q.style === 'calculation' || q.type === 'number' || q.type === 'remainder'), 10, state, bank));
    case 'think':
      return pick(all.filter((q) => q.style === 'reasoning' || q.cognitive === 'reasoning' || q.cognitive === 'analysis'), 10, state, bank);
    case 'word':
      return pick(all.filter(styleIs('word')), 10, state, bank);
    case 'visual':
      return pick(all.filter((q) => q.style === 'visual' || Boolean(q.visual?.math || q.column)), 10, state, bank);
    case 'detective':
      return pick(all.filter(styleIs('error')), 10, state, bank);
    case 'listening':
    case 'vocabulary':
    case 'grammar':
    case 'reading':
      return progressive(pick(all.filter((q) => q.skill === mode), 10, state, bank));
    case 'writing': {
      const tasks = all.filter((q) => q.skill === 'writing');
      return [...pick(tasks.filter(noWriting), 4, state, bank), ...pick(tasks.filter((q) => !noWriting(q)), 1, state, bank)];
    }
    case 'mission': {
      const by = (s: EnglishSkill, n: number) => pick(all.filter((q) => q.skill === s && noWriting(q)), n, state, bank);
      const writing = pick(all.filter((q) => q.skill === 'writing'), 2, state, bank).sort((a, b) => Number(a.type === 'writing') - Number(b.type === 'writing'));
      return [...by('vocabulary', 4), ...by('grammar', 5), ...by('listening', 4), ...by('reading', 5), ...writing.slice(0, 2)];
    }
    case 'exam-train':
    case 'exam': {
      if (bank.subject === 'english') {
        // exam structure: listening · grammar & vocabulary · reading · writing
        const by = (pred: (q: PracticeQuestion) => boolean, n: number) => examMix(all.filter((q) => pred(q) && noWriting(q)), n, state, bank);
        const write = pick(all.filter((q) => q.type === 'writing'), 1, state, bank);
        return [
          ...by((q) => q.skill === 'listening', 6),
          ...by((q) => q.skill === 'grammar' || q.skill === 'vocabulary', 10),
          ...by((q) => q.skill === 'reading', 6),
          ...write,
        ];
      }
      return examMix(all.filter(noWriting), 20, state, bank);
    }
    case 'custom':
      return progressive(pick(applyFilters(bank, state, filters), 15, state, bank, 15));
    default:
      return pick(all.filter(noWriting), 10, state, bank);
  }
}

/** Another question on the same concept (different wording, example or format). */
export function similarQuestion(bank: Bank, q: PracticeQuestion, used: Set<string>): PracticeQuestion | undefined {
  const same = bank.questions.filter((x) => x.concept === q.concept && x.id !== q.id && !used.has(x.id) && noWriting(x));
  const otherType = same.filter((x) => x.type !== q.type);
  const near = (xs: PracticeQuestion[]) => xs.sort((a, b) => Math.abs(rank[a.difficulty] - rank[q.difficulty]) - Math.abs(rank[b.difficulty] - rank[q.difficulty]))[0];
  return near(shuffle(otherType)) ?? near(shuffle(same)) ?? near(shuffle(bank.questions.filter((x) => x.lesson === q.lesson && !used.has(x.id) && x.id !== q.id && noWriting(x))));
}
