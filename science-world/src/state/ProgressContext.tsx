import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { UnitId } from '../data/types';
import { newlyEarned, type Achievement } from '../data/rewards';
import { setSoundEnabled } from '../lib/sound';
import { hydrate, initialProgress, starsFor, touchStreak, type ProgressState } from './model';
import { localProgressStorage, type ProgressStorage } from './storage';

interface ProgressApi {
  state: ProgressState;
  /** call after every answered question (first try counts for accuracy stats) */
  recordAnswer: (correct: boolean) => void;
  completeLesson: (lessonId: string, score: number, total: number) => { stars: number; coins: number; first: boolean };
  completeUnitQuiz: (unitId: UnitId, score: number, total: number) => { stars: number; coins: number };
  completeBoss: (unitId: UnitId) => void;
  recordChallenge: (id: string, score: number) => { best: boolean };
  addCoins: (n: number) => void;
  setLastLesson: (id: string) => void;
  markUnitCelebrated: (id: UnitId) => void;
  toggleSound: () => void;
  reset: () => void;
  /** achievements waiting to be celebrated by <AchievementPopup> */
  pendingAchievements: Achievement[];
  dismissAchievement: () => void;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children, storage = localProgressStorage }: { children: ReactNode; storage?: ProgressStorage }) {
  const [state, setState] = useState<ProgressState>(() => touchStreak(hydrate(storage.load())));
  const [pending, setPending] = useState<Achievement[]>([]);
  const first = useRef(true);

  // Persist + detect new achievements after every change.
  useEffect(() => {
    storage.save(state);
    setSoundEnabled(state.sound);
    const fresh = newlyEarned(state);
    if (fresh.length) {
      setState((s) => ({ ...s, badges: [...s.badges, ...fresh.map((a) => a.id)] }));
      // Don't pop old achievements on first load (e.g. after data migration); just record them.
      if (!first.current) setPending((p) => [...p, ...fresh]);
    }
    first.current = false;
  }, [state, storage]);

  const update = useCallback((fn: (s: ProgressState) => ProgressState) => setState((s) => fn(touchStreak(s))), []);

  const api = useMemo<ProgressApi>(
    () => ({
      state,
      recordAnswer: (correct) =>
        update((s) => ({ ...s, answered: s.answered + 1, correct: s.correct + (correct ? 1 : 0), coins: s.coins + (correct ? 2 : 0) })),
      completeLesson: (lessonId, score, total) => {
        const stars = starsFor(score, total);
        const prev = state.lessons[lessonId];
        const firstTime = !prev;
        const coins = firstTime ? 10 + stars * 2 : Math.max(0, stars - (prev?.stars ?? 0)) * 2;
        update((s) => {
          const old = s.lessons[lessonId];
          const best = !old || stars >= old.stars ? { stars, score, total, completedAt: new Date().toISOString() } : old;
          return { ...s, coins: s.coins + coins, lessons: { ...s.lessons, [lessonId]: best } };
        });
        return { stars, coins, first: firstTime };
      },
      completeUnitQuiz: (unitId, score, total) => {
        const stars = starsFor(score, total);
        const coins = 15 + stars * 3;
        update((s) => {
          const old = s.unitQuizzes[unitId];
          const rec = !old || score >= old.best ? { best: score, total, stars } : old;
          return { ...s, coins: s.coins + coins, unitQuizzes: { ...s.unitQuizzes, [unitId]: rec } };
        });
        return { stars, coins };
      },
      completeBoss: (unitId) => update((s) => ({ ...s, coins: s.coins + (s.bosses[unitId] ? 5 : 40), points: s.points + 50, bosses: { ...s.bosses, [unitId]: true } })),
      recordChallenge: (id, score) => {
        const best = score > (state.challenges[id] ?? 0);
        update((s) => ({
          ...s,
          points: s.points + score * 10,
          challenges: { ...s.challenges, [id]: Math.max(score, s.challenges[id] ?? 0) },
        }));
        return { best };
      },
      addCoins: (n) => update((s) => ({ ...s, coins: s.coins + n })),
      setLastLesson: (id) => setState((s) => (s.lastLesson === id ? s : { ...s, lastLesson: id })),
      markUnitCelebrated: (id) =>
        setState((s) => (s.celebratedUnits.includes(id) ? s : { ...s, celebratedUnits: [...s.celebratedUnits, id] })),
      toggleSound: () => setState((s) => ({ ...s, sound: !s.sound })),
      reset: () => {
        storage.clear();
        first.current = true;
        setPending([]);
        setState(touchStreak({ ...initialProgress, sound: state.sound }));
      },
      pendingAchievements: pending,
      dismissAchievement: () => setPending((p) => p.slice(1)),
    }),
    [state, pending, update, storage],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress must be used inside <ProgressProvider>');
  return v;
}
