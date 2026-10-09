import { createPersistentStore, useStore } from './store';
import { TEAMS, type TeamId } from './teacher';

/**
 * How the journey is being played.
 * solo  — one student on her own device.
 * group — the class plays together on the board: teams take turns on every question.
 */
export interface Play {
  version: 1;
  mode: 'solo' | 'group';
  teams: TeamId[];
  scores: Record<string, number>;
  turn: number;
  /** last scoring event, for the scoreboard's "+points" animation */
  last: { team: TeamId; points: number; correct: boolean; key: number } | null;
}

const initial = (): Play => ({ version: 1, mode: 'solo', teams: [], scores: {}, turn: 0, last: null });

export const playStore = createPersistentStore('kj.play', initial, (s) => ({ ...initial(), ...(s as Partial<Play>) }));
export const usePlay = <S,>(sel: (p: Play) => S) => useStore(playStore, sel);

export const isGroup = () => playStore.get().mode === 'group';

export function startSolo() {
  playStore.set(initial());
}

export function startGroup(teams: TeamId[]) {
  const ordered = TEAMS.map((t) => t.id).filter((id) => teams.includes(id));
  playStore.set({ ...initial(), mode: 'group', teams: ordered, scores: Object.fromEntries(ordered.map((t) => [t, 0])) });
}

export function currentTeam(p: Play = playStore.get()): TeamId | null {
  if (p.mode !== 'group' || !p.teams.length) return null;
  return p.teams[p.turn % p.teams.length];
}

/**
 * Report one answer attempt. In group mode the team whose turn it is earns the
 * points when correct, and the turn passes to the next team either way.
 */
export function reportAnswer(correct: boolean, points = 10) {
  playStore.set((p) => {
    const team = currentTeam(p);
    if (!team) return p;
    const gain = correct ? Math.max(0, Math.round(points)) : 0;
    return {
      ...p,
      scores: { ...p.scores, [team]: (p.scores[team] ?? 0) + gain },
      turn: p.turn + 1,
      last: { team, points: gain, correct, key: (p.last?.key ?? 0) + 1 },
    };
  });
}

export function rankedTeams(p: Play = playStore.get()): TeamId[] {
  return [...p.teams].sort((a, b) => (p.scores[b] ?? 0) - (p.scores[a] ?? 0));
}
