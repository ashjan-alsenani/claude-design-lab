/**
 * Explainers live in src/data/explain/<subject>/<unitId>/*.ts (each default-exports Explainer[]).
 * Each unit is its own small chunk, loaded only when a child opens an explainer.
 */
import type { Explainer } from './types';
import { getLesson } from '../data/units';
import { personalise } from '../data/learner';

const files = import.meta.glob<{ default: Explainer[] }>('../data/explain/*/*/*.ts');
const unitOf = (path: string) => path.split('/').slice(-2)[0];
const units = new Set(Object.keys(files).map(unitOf));

/** Units that have explainers (every lesson of such a unit is expected to have one). */
export function hasExplainer(lessonId: string): boolean {
  const l = getLesson(lessonId);
  return Boolean(l && units.has(l.unitId));
}

export async function loadExplainer(lessonId: string): Promise<Explainer | undefined> {
  const l = getLesson(lessonId);
  if (!l) return undefined;
  const parts = await Promise.all(Object.entries(files).filter(([p]) => unitOf(p) === l.unitId).map(([, load]) => load()));
  const ex = parts.flatMap((m) => m.default).find((e) => e.lesson === lessonId);
  return ex ? personalise(ex) : undefined;
}
