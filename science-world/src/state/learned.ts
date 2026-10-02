import { lessonsOf, questionPool, subjectOfUnit, type PooledQuestion } from '../data/units';
import { glossaryFor } from '../data/glossary';
import type { Lesson, SubjectId } from '../data/types';
import type { ProgressState } from './model';

/** Challenges only use topics the child has already learned (in the chosen subject). */
export function learnedLessons(s: ProgressState, subject: SubjectId = s.subject): Lesson[] {
  return lessonsOf(subject).filter((l) => s.lessons[l.id]);
}

export function learnedQuestions(s: ProgressState, subject: SubjectId = s.subject): PooledQuestion[] {
  const done = new Set(learnedLessons(s, subject).map((l) => l.id));
  return questionPool.filter(
    (p) => subjectOfUnit(p.unitId).id === subject && (p.lessonId ? done.has(p.lessonId) : Boolean(s.unitQuizzes[p.unitId])),
  );
}

/** Glossary terms from lessons the child finished. */
export function learnedGlossary(s: ProgressState, subject: SubjectId = s.subject) {
  const learned = learnedLessons(s, subject);
  const pages = new Set(learned.flatMap((l) => [l.page, l.page + 1]));
  const lessonIds = new Set(learned.map((l) => l.id));
  return glossaryFor(subject).filter((g) => (g.lessonId ? lessonIds.has(g.lessonId) : pages.has(g.page)));
}
