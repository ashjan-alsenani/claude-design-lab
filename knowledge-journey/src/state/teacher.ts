import { DEFAULT_QUESTIONS } from '../lib/questions';
import type { Question } from '../lib/types';
import { createPersistentStore, useStore } from './store';

export const TEAMS = [
  { id: 'stars', name: 'فريق النجوم', color: '#f5c35b' },
  { id: 'pearls', name: 'فريق اللؤلؤ', color: '#9fe7f0' },
  { id: 'gems', name: 'فريق الجواهر', color: '#f59ac0' },
  { id: 'moon', name: 'فريق القمر', color: '#b9a4ff' },
] as const;

export type TeamId = (typeof TEAMS)[number]['id'];

export interface CompetitionSession {
  id: string;
  label: string;
  createdAt: number;
  teams: TeamId[];
  scores: Record<string, number>;
  answered: number;
  finished: boolean;
}

export interface TeacherState {
  version: 1;
  questions: Question[];
  /** True once the teacher edits the bank; false means "use the shipped JSON". */
  customized: boolean;
  lightningSeconds: number;
  lightningCount: number;
  wheelQuickSeconds: number;
  unlockAll: boolean;
  sessions: CompetitionSession[];
  activeSessionId: string | null;
}

const initial = (): TeacherState => ({
  version: 1,
  questions: DEFAULT_QUESTIONS,
  customized: false,
  lightningSeconds: 15,
  lightningCount: 10,
  wheelQuickSeconds: 15,
  unlockAll: false,
  sessions: [],
  activeSessionId: null,
});

export const teacherStore = createPersistentStore('kj.teacher', initial, (saved) => {
  const s = { ...initial(), ...(saved as Partial<TeacherState>) };
  // Pick up an updated shipped bank unless the teacher has made her own edits.
  if (!s.customized) s.questions = DEFAULT_QUESTIONS;
  return s;
});

export const useTeacher = <S,>(sel: (s: TeacherState) => S) => useStore(teacherStore, sel);

export function upsertQuestion(q: Question) {
  teacherStore.set((s) => {
    const i = s.questions.findIndex((x) => x.id === q.id);
    const questions = i === -1 ? [...s.questions, q] : s.questions.map((x, j) => (j === i ? q : x));
    return { ...s, questions, customized: true };
  });
}

export function deleteQuestion(id: string) {
  teacherStore.set((s) => ({ ...s, questions: s.questions.filter((q) => q.id !== id), customized: true }));
}

export function replaceBank(questions: Question[]) {
  teacherStore.set((s) => ({ ...s, questions, customized: true }));
}

export function restoreDefaultBank() {
  teacherStore.set((s) => ({ ...s, questions: DEFAULT_QUESTIONS, customized: false }));
}

export function nextQuestionId(questions: Question[]): string {
  const n = questions.reduce((m, q) => Math.max(m, Number(q.id.replace(/\D/g, '')) || 0), 0) + 1;
  return `q${String(n).padStart(2, '0')}`;
}

export function startSession(teams: TeamId[], label: string): string {
  const id = `s${Date.now().toString(36)}`;
  teacherStore.set((s) => ({
    ...s,
    activeSessionId: id,
    sessions: [
      { id, label, createdAt: Date.now(), teams, scores: Object.fromEntries(teams.map((t) => [t, 0])), answered: 0, finished: false },
      ...s.sessions,
    ],
  }));
  return id;
}

export function awardTeam(sessionId: string, team: TeamId, points: number) {
  teacherStore.set((s) => ({
    ...s,
    sessions: s.sessions.map((x) =>
      x.id === sessionId ? { ...x, scores: { ...x.scores, [team]: (x.scores[team] ?? 0) + points }, answered: x.answered + 1 } : x,
    ),
  }));
}

export function finishSession(sessionId: string) {
  teacherStore.set((s) => ({
    ...s,
    activeSessionId: s.activeSessionId === sessionId ? null : s.activeSessionId,
    sessions: s.sessions.map((x) => (x.id === sessionId ? { ...x, finished: true } : x)),
  }));
}

export function resetSession(sessionId: string) {
  teacherStore.set((s) => ({
    ...s,
    sessions: s.sessions.map((x) =>
      x.id === sessionId ? { ...x, scores: Object.fromEntries(x.teams.map((t) => [t, 0])), answered: 0, finished: false } : x,
    ),
  }));
}

export function deleteSession(sessionId: string) {
  teacherStore.set((s) => ({
    ...s,
    activeSessionId: s.activeSessionId === sessionId ? null : s.activeSessionId,
    sessions: s.sessions.filter((x) => x.id !== sessionId),
  }));
}
