import { getSubject, getUnit, lessonsOf, subjectOfUnit, units } from '../data/units';
import type { Lesson, SubjectId, Unit, UnitId } from '../data/types';
import type { ProgressState } from './model';

/** Lessons unlock one after another inside each subject. */
export function isLessonUnlocked(s: ProgressState, lessonId: string): boolean {
  const unit = units.find((u) => u.lessons.some((l) => l.id === lessonId));
  if (!unit) return false;
  const list = lessonsOf(subjectOfUnit(unit.id).id);
  const i = list.findIndex((l) => l.id === lessonId);
  if (i <= 0) return i === 0;
  return Boolean(s.lessons[list[i - 1].id]);
}

/** The lesson just before this one in its subject (for "complete X to unlock"). */
export function previousLesson(lessonId: string): Lesson | undefined {
  const unit = units.find((u) => u.lessons.some((l) => l.id === lessonId));
  if (!unit) return undefined;
  const list = lessonsOf(subjectOfUnit(unit.id).id);
  return list[list.findIndex((l) => l.id === lessonId) - 1];
}

export function nextLessonInSubject(lessonId: string): Lesson | undefined {
  const unit = units.find((u) => u.lessons.some((l) => l.id === lessonId));
  if (!unit) return undefined;
  const list = lessonsOf(subjectOfUnit(unit.id).id);
  return list[list.findIndex((l) => l.id === lessonId) + 1];
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

export type Stop = { kind: 'lesson'; lesson: Lesson } | { kind: 'quiz' | 'boss'; unit: Unit } | { kind: 'done' };

/** Where should "Continue learning" take the child in a subject? */
export function nextStop(s: ProgressState, subject: SubjectId = s.subject): Stop {
  for (const unit of getSubject(subject).units) {
    const lesson = unit.lessons.find((l) => !s.lessons[l.id]);
    if (lesson) return { kind: 'lesson', lesson };
    if (!s.unitQuizzes[unit.id]) return { kind: 'quiz', unit };
    if (!s.bosses[unit.id]) return { kind: 'boss', unit };
  }
  return { kind: 'done' };
}

export function stopPath(n: Stop): string {
  if (n.kind === 'lesson') return `/lesson/${n.lesson.id}`;
  if (n.kind === 'quiz') return `/quiz/${n.unit.id}`;
  if (n.kind === 'boss') return `/boss/${n.unit.id}`;
  return '/progress';
}

export function nextStopPath(s: ProgressState, subject: SubjectId = s.subject): string {
  return stopPath(nextStop(s, subject));
}

function unitsFor(subject?: SubjectId): Unit[] {
  return subject ? getSubject(subject).units : units;
}

export function totalStars(s: ProgressState, subject?: SubjectId): number {
  const list = unitsFor(subject);
  const lessonStars = list.flatMap((u) => u.lessons).reduce((a, l) => a + (s.lessons[l.id]?.stars ?? 0), 0);
  const quizStars = list.reduce((a, u) => a + (s.unitQuizzes[u.id]?.stars ?? 0), 0);
  return lessonStars + quizStars;
}

export function maxStarsFor(subject?: SubjectId): number {
  const list = unitsFor(subject);
  return list.flatMap((u) => u.lessons).length * 3 + list.length * 3;
}

export function overallPercent(s: ProgressState, subject?: SubjectId): number {
  const list = unitsFor(subject);
  const stops = list.flatMap((u) => u.lessons).length + list.length * 2;
  if (!stops) return 0;
  const done =
    list.flatMap((u) => u.lessons).filter((l) => s.lessons[l.id]).length +
    list.filter((u) => s.unitQuizzes[u.id]).length +
    list.filter((u) => s.bosses[u.id]).length;
  return Math.round((done / stops) * 100);
}

/** Explorer level grows with stars (all subjects): every 6 stars = one level. */
export function levelInfo(s: ProgressState) {
  const stars = totalStars(s);
  const level = Math.floor(stars / 6) + 1;
  const into = stars % 6;
  const titles = ['مستكشفة صغيرة', 'باحثة نشيطة', 'عالمة مبتدئة', 'عالمة ماهرة', 'عالمة خبيرة', 'عبقرية المعرفة'];
  return { level, into, need: 6, title: titles[Math.min(titles.length - 1, Math.floor((level - 1) / 2))] };
}
