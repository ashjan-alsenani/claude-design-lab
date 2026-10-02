import { allLessons, questionPool, type PooledQuestion } from '../data/units';
import { glossary } from '../data/glossary';
import type { Lesson, UnitId } from '../data/types';
import type { ProgressState } from './model';

/** Challenges only use topics the child has already learned. */
export function learnedLessons(s: ProgressState): Lesson[] {
  return allLessons.filter((l) => s.lessons[l.id]);
}

export function learnedQuestions(s: ProgressState): PooledQuestion[] {
  const done = new Set(Object.keys(s.lessons));
  return questionPool.filter((p) => (p.lessonId ? done.has(p.lessonId) : Boolean(s.unitQuizzes[p.unitId])));
}

export function learnedUnits(s: ProgressState): UnitId[] {
  return Array.from(new Set(learnedLessons(s).map((l) => l.unitId)));
}

/** Glossary terms whose page belongs to a lesson the child finished. */
export function learnedGlossary(s: ProgressState) {
  const pages = new Set(learnedLessons(s).flatMap((l) => [l.page, l.page + 1]));
  return glossary.filter((g) => pages.has(g.page));
}
