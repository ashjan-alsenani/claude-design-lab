import type { ActivityId } from '../lib/types';
import { createPersistentStore, useStore } from './store';

export interface ActivityResult {
  completed: boolean;
  /** Best XP earned in a single run. */
  bestScore: number;
  stars: number;
  /** Correct / total answers from the best run (feeds overall accuracy). */
  correct: number;
  total: number;
  plays: number;
}

export interface Progress {
  version: 1;
  name: string;
  activities: Record<ActivityId, ActivityResult>;
  badges: string[];
  /** Activity just unlocked and not yet celebrated on the map. */
  freshUnlock: ActivityId | null;
  startedAt: number | null;
  finishedAt: number | null;
}

export const ACTIVITY_ORDER: ActivityId[] = [
  'gates',
  'chests',
  'wheel',
  'detective',
  'puzzle',
  'cinema',
  'lightning',
  'crown',
];

const emptyResult = (): ActivityResult => ({ completed: false, bestScore: 0, stars: 0, correct: 0, total: 0, plays: 0 });

export const initialProgress = (): Progress => ({
  version: 1,
  name: '',
  activities: Object.fromEntries(ACTIVITY_ORDER.map((id) => [id, emptyResult()])) as Progress['activities'],
  badges: [],
  freshUnlock: null,
  startedAt: null,
  finishedAt: null,
});

export function hydrateProgress(saved: unknown): Progress {
  const base = initialProgress();
  if (!saved || typeof saved !== 'object' || (saved as Progress).version !== 1) return base;
  const s = saved as Partial<Progress>;
  return {
    ...base,
    ...s,
    activities: Object.fromEntries(
      ACTIVITY_ORDER.map((id) => [id, { ...emptyResult(), ...(s.activities?.[id] ?? {}) }]),
    ) as Progress['activities'],
    badges: Array.isArray(s.badges) ? s.badges : [],
  };
}

export const progressStore = createPersistentStore('kj.progress', initialProgress, hydrateProgress);
export const useProgress = <S,>(sel: (p: Progress) => S) => useStore(progressStore, sel);

/* ───────────── pure scoring helpers (unit-tested) ───────────── */

export function starsFor(correct: number, total: number): number {
  if (total <= 0) return 3;
  const r = correct / total;
  if (r >= 0.9) return 3;
  if (r >= 0.6) return 2;
  return 1;
}

export const totalXp = (p: Progress) => ACTIVITY_ORDER.reduce((s, id) => s + p.activities[id].bestScore, 0);
export const gemCount = (p: Progress) => ACTIVITY_ORDER.filter((id) => p.activities[id].completed).length;
export const starCount = (p: Progress) => ACTIVITY_ORDER.reduce((s, id) => s + p.activities[id].stars, 0);
export const learningActivities = ACTIVITY_ORDER.filter((id) => id !== 'crown');

export function accuracy(p: Progress): number {
  let c = 0;
  let t = 0;
  for (const id of ACTIVITY_ORDER) {
    c += p.activities[id].correct;
    t += p.activities[id].total;
  }
  return t === 0 ? 0 : Math.round((c / t) * 100);
}

export function isUnlocked(p: Progress, id: ActivityId, unlockAll = false): boolean {
  if (unlockAll) return true;
  const i = ACTIVITY_ORDER.indexOf(id);
  if (i <= 0) return true;
  if (id === 'crown') return learningActivities.every((a) => p.activities[a].completed);
  return p.activities[ACTIVITY_ORDER[i - 1]].completed;
}

export interface Tier {
  id: string;
  title: string;
  min: number;
  description: string;
}

/** Achievement tiers, from accuracy × completion. */
export const TIERS: Tier[] = [
  { id: 'explorer', title: 'مستكشفة المعرفة', min: 0, description: 'بدأتِ الرحلة واكتشفتِ كنوزها الأولى.' },
  { id: 'star', title: 'نجمة المعرفة', min: 55, description: 'أضاءت إجاباتكِ طريق الجزر.' },
  { id: 'princess', title: 'أميرة الكنوز', min: 75, description: 'جمعتِ الكنوز بثقة ومهارة.' },
  { id: 'ambassador', title: 'سفيرة المعرفة', min: 90, description: 'أتقنتِ الدرس وصرتِ سفيرة لمعرفته.' },
];

export function tierFor(p: Progress): Tier {
  const done = learningActivities.filter((a) => p.activities[a].completed).length / learningActivities.length;
  const score = accuracy(p) * done;
  return [...TIERS].reverse().find((t) => score >= t.min) ?? TIERS[0];
}

/* ───────────── badges ───────────── */

export interface Badge {
  id: string;
  name: string;
  description: string;
}

export const BADGES: Badge[] = [
  { id: 'first-gem', name: 'الجوهرة الأولى', description: 'أكملتِ أول جزيرة.' },
  { id: 'flawless', name: 'بلا أخطاء', description: 'أنهيتِ نشاطًا بثلاث نجوم.' },
  { id: 'detective', name: 'المحققة البارعة', description: 'حللتِ القضايا الست دون كشف أي دليل.' },
  { id: 'architect', name: 'مهندسة الأحجية', description: 'أكملتِ الأحجية دون تلميح.' },
  { id: 'cinema', name: 'رفيقة الحكاية', description: 'شاهدتِ حكاية المعرفة كاملة.' },
  { id: 'lightning', name: 'سريعة البرق', description: 'أجبتِ 8 أسئلة أو أكثر في تحدي البرق.' },
  { id: 'halfway', name: 'منتصف الطريق', description: 'أكملتِ أربع جزر.' },
  { id: 'crowned', name: 'المتوّجة', description: 'وصلتِ إلى قصر التتويج.' },
];

export interface RunResult {
  score: number;
  correct: number;
  total: number;
  /** Extra badge ids earned by this run (activity-specific feats). */
  feats?: string[];
}

/** Pure reducer: apply a finished run. Returns next progress and newly earned badges. */
export function applyRun(p: Progress, id: ActivityId, run: RunResult): { next: Progress; earned: string[] } {
  const prev = p.activities[id];
  const stars = starsFor(run.correct, run.total);
  const better = !prev.completed || run.score > prev.bestScore;
  const result: ActivityResult = {
    completed: true,
    plays: prev.plays + 1,
    bestScore: Math.max(prev.bestScore, run.score),
    stars: Math.max(prev.stars, stars),
    correct: better ? run.correct : prev.correct,
    total: better ? run.total : prev.total,
  };
  const activities = { ...p.activities, [id]: result };
  const nextIndex = ACTIVITY_ORDER.indexOf(id) + 1;
  const nextId = ACTIVITY_ORDER[nextIndex];
  const draft: Progress = {
    ...p,
    activities,
    startedAt: p.startedAt ?? Date.now(),
    finishedAt: id === 'crown' ? Date.now() : p.finishedAt,
  };
  const freshUnlock =
    !prev.completed && nextId && !p.activities[nextId].completed && isUnlocked(draft, nextId) ? nextId : p.freshUnlock;

  const earned = new Set<string>(run.feats ?? []);
  earned.add('first-gem');
  if (stars === 3) earned.add('flawless');
  if (gemCount(draft) >= 4) earned.add('halfway');
  if (id === 'crown') earned.add('crowned');
  const fresh = [...earned].filter((b) => !p.badges.includes(b) && BADGES.some((x) => x.id === b));
  return { next: { ...draft, freshUnlock, badges: [...p.badges, ...fresh] }, earned: fresh };
}

export function recordRun(id: ActivityId, run: RunResult): string[] {
  let earned: string[] = [];
  progressStore.set((p) => {
    const r = applyRun(p, id, run);
    earned = r.earned;
    return r.next;
  });
  return earned;
}

export function setName(name: string) {
  progressStore.set((p) => ({ ...p, name: name.trim().slice(0, 40), startedAt: p.startedAt ?? Date.now() }));
}

export function clearFreshUnlock() {
  progressStore.set((p) => (p.freshUnlock ? { ...p, freshUnlock: null } : p));
}
