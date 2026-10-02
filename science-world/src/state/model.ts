import type { UnitId } from '../data/types';

export interface LessonRecord {
  stars: number; // 1–3
  score: number; // correct first tries in the mini quiz
  total: number;
  completedAt: string;
}

export interface QuizRecord {
  best: number;
  total: number;
  stars: number;
}

export interface ProgressState {
  version: 1;
  lessons: Record<string, LessonRecord>;
  unitQuizzes: Partial<Record<UnitId, QuizRecord>>;
  bosses: Partial<Record<UnitId, boolean>>;
  challenges: Record<string, number>; // challenge id → best score
  coins: number;
  points: number; // challenge points 🎯
  correct: number;
  answered: number;
  badges: string[];
  streak: { count: number; best: number; last: string };
  sound: boolean;
  lastLesson?: string;
  celebratedUnits: UnitId[];
}

export const initialProgress: ProgressState = {
  version: 1,
  lessons: {},
  unitQuizzes: {},
  bosses: {},
  challenges: {},
  coins: 0,
  points: 0,
  correct: 0,
  answered: 0,
  badges: [],
  streak: { count: 0, best: 0, last: '' },
  sound: true,
  celebratedUnits: [],
};

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime();
  return Math.round(ms / 86_400_000);
}

/** Learning streak: counts consecutive days on which the child learned something. */
export function touchStreak(s: ProgressState): ProgressState {
  const t = today();
  if (s.streak.last === t) return s;
  const gap = s.streak.last ? daysBetween(s.streak.last, t) : Infinity;
  const count = gap === 1 ? s.streak.count + 1 : 1;
  return { ...s, streak: { count, best: Math.max(count, s.streak.best), last: t } };
}

/** Accepts anything from storage and returns a valid state (protects against old/corrupt data). */
export function hydrate(raw: unknown): ProgressState {
  if (!raw || typeof raw !== 'object') return initialProgress;
  const r = raw as Partial<ProgressState>;
  if (r.version !== 1) return initialProgress;
  return {
    ...initialProgress,
    ...r,
    streak: { ...initialProgress.streak, ...(r.streak ?? {}) },
  } as ProgressState;
}

export function starsFor(score: number, total: number): number {
  if (total === 0) return 3;
  const ratio = score / total;
  if (ratio >= 0.99) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}
