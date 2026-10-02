import type { Lesson, Question, Subject, SubjectId, Unit, UnitId } from './types';
import { subjects, getSubject } from './subjects';

export { subjects, getSubject };

/** All units / lessons of every subject (ids are unique across subjects). */
export const units: Unit[] = subjects.flatMap((s) => s.units);
export const allLessons: Lesson[] = units.flatMap((u) => u.lessons);

export function getUnit(id: string | undefined): Unit | undefined {
  return units.find((u) => u.id === id);
}

export function getLesson(id: string | undefined): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

export function unitOfLesson(lesson: Lesson): Unit {
  return units.find((u) => u.id === lesson.unitId)!;
}

export function subjectOfUnit(unitId: UnitId): Subject {
  return subjects.find((s) => s.units.some((u) => u.id === unitId)) ?? subjects[0];
}

export function subjectOfLesson(lesson: Lesson): Subject {
  return subjectOfUnit(lesson.unitId);
}

export function lessonsOf(subject: SubjectId): Lesson[] {
  return getSubject(subject).units.flatMap((u) => u.lessons);
}

/** The lesson number shown to children ("1-2"). */
export function lessonLabel(lesson: Lesson): string {
  return lesson.label ?? lesson.id;
}

/** Every question the child can meet in reviews and challenges, with its unit and lesson. */
export interface PooledQuestion {
  question: Question;
  unitId: UnitId;
  lessonId?: string;
}

export const questionPool: PooledQuestion[] = units.flatMap((u) => [
  ...u.lessons.flatMap((l) => l.quiz.map((q) => ({ question: q, unitId: u.id, lessonId: l.id }))),
  ...u.unitQuiz.map((q) => ({ question: q, unitId: u.id })),
]);
