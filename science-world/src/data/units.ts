import type { Lesson, Question, Unit, UnitId } from './types';
import { unit1 } from './unit1';
import { unit2 } from './unit2';
import { unit3 } from './unit3';

export const units: Unit[] = [unit1, unit2, unit3];

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
