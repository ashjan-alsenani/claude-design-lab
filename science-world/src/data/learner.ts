/**
 * Who this learning world is made for.
 * Set at build time, so one codebase serves several children:
 *   VITE_LEARNER_NAME       short name used in messages  (default: ألين)
 *   VITE_LEARNER_FULL_NAME  full name                    (default: ألين السعيدي)
 * Lesson texts write the name as `{name}`; it is filled in by `personalise`.
 */
const env = import.meta.env as Record<string, string | undefined>;

export const learner = {
  name: env.VITE_LEARNER_NAME?.trim() || 'ألين',
  fullName: env.VITE_LEARNER_FULL_NAME?.trim() || env.VITE_LEARNER_NAME?.trim() || 'ألين السعيدي',
};

/** Replace `{name}` in every string of a content object (units, lessons, questions…). */
export function personalise<T>(value: T): T {
  if (typeof value === 'string') return value.replaceAll('{name}', learner.name) as T;
  if (Array.isArray(value)) return value.map(personalise) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, personalise(v)])) as T;
  }
  return value;
}
