import { allLessons, getUnit, units } from '../data/units';
import type { Lesson, Unit, UnitId } from '../data/types';
import type { ProgressState } from './model';

/** Lessons unlock one after another across the whole journey. */
export function isLessonUnlocked(s: ProgressState, lessonId: string): boolean {
  const i = allLessons.findIndex((l) => l.id === lessonId);
  if (i <= 0) return i === 0;
  return Boolean(s.lessons[allLessons[i - 1].id]);
}

export function isLessonDone(s: ProgressState, lessonId: string): boolean {
  return Boolean(s.lessons[lessonId]);
}

export function unitLessonsDone(s: ProgressState, unit: Unit): number {
  return unit.lessons.filter((l) => s.lessons[l.id]).length;
}

export function isUnitQuizUnlocked(s: ProgressState, unit: Unit): boolean {
  return unitLessonsDone(s, unit) === unit.lessons.length;
}

export function isBossUnlocked(s: ProgressState, unit: Unit): boolean {
  return Boolean(s.unitQuizzes[unit.id]);
}

export function isUnitComplete(s: ProgressState, unitId: UnitId): boolean {
  const unit = getUnit(unitId)!;
  return isUnitQuizUnlocked(s, unit) && Boolean(s.unitQuizzes[unitId]) && Boolean(s.bosses[unitId]);
}

/** Where should "Continue learning" take the child? */
export function nextStop(s: ProgressState): { kind: 'lesson'; lesson: Lesson } | { kind: 'quiz' | 'boss'; unit: Unit } | { kind: 'done' } {
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => !s.lessons[l.id]);
    if (lesson) return { kind: 'lesson', lesson };
    if (!s.unitQuizzes[unit.id]) return { kind: 'quiz', unit };
    if (!s.bosses[unit.id]) return { kind: 'boss', unit };
  }
  return { kind: 'done' };
}

export function nextStopPath(s: ProgressState): string {
  const n = nextStop(s);
  if (n.kind === 'lesson') return `/lesson/${n.lesson.id}`;
  if (n.kind === 'quiz') return `/quiz/${n.unit.id}`;
  if (n.kind === 'boss') return `/boss/${n.unit.id}`;
  return '/progress';
}

export function totalStars(s: ProgressState): number {
  const lessonStars = Object.values(s.lessons).reduce((a, r) => a + r.stars, 0);
  const quizStars = Object.values(s.unitQuizzes).reduce((a, r) => a + (r?.stars ?? 0), 0);
  return lessonStars + quizStars;
}

export const maxStars = allLessons.length * 3 + units.length * 3;

export function overallPercent(s: ProgressState): number {
  const stops = allLessons.length + units.length * 2;
  const done =
    Object.keys(s.lessons).length +
    Object.keys(s.unitQuizzes).length +
    Object.values(s.bosses).filter(Boolean).length;
  return Math.round((done / stops) * 100);
}

/** Explorer level grows with stars: every 6 stars = one level. */
export function levelInfo(s: ProgressState) {
  const stars = totalStars(s);
  const level = Math.floor(stars / 6) + 1;
  const into = stars % 6;
  const titles = ['مستكشف صغير', 'باحث نشيط', 'عالم مبتدئ', 'عالم ماهر', 'عالم خبير', 'عبقري العلوم'];
  return { level, into, need: 6, title: titles[Math.min(titles.length - 1, Math.floor((level - 1) / 2))] };
}
