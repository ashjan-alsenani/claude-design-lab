/**
 * Explainers live in src/data/explain/<subject>/<unitId>/*.ts (each default-exports Explainer[]).
 * Each unit is its own small chunk, loaded only when a child opens an explainer.
 */
import type { Explainer } from './types';
import { getLesson } from '../data/units';
import { personalise } from '../data/learner';
import lessonsWithExplainer from '../data/explain/lessons.json';

const files = import.meta.glob<{ default: Explainer[] }>('../data/explain/*/*/*.ts');
const unitOf = (path: string) => path.split('/').slice(-2)[0];
const ready = new Set<string>(lessonsWithExplainer as string[]);

/** Lessons that have an explainer (list written by scripts/explain-index.mjs before every build). */
export function hasExplainer(lessonId: string): boolean {
  return ready.has(lessonId);
}

export async function loadExplainer(lessonId: string): Promise<Explainer | undefined> {
  const l = getLesson(lessonId);
  if (!l) return undefined;
  const parts = await Promise.all(Object.entries(files).filter(([p]) => unitOf(p) === l.unitId).map(([, load]) => load()));
  const ex = parts.flatMap((m) => m.default).find((e) => e.lesson === lessonId);
  return ex ? personalise(ex) : undefined;
}
