/**
 * Practice progress: every attempt, mastery per concept, sessions, mistakes and «كلماتي».
 * Saved in localStorage behind a small storage interface so a database can replace it later.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SubjectId } from '../data/types';
import type { QuestionType } from './types';

export interface Attempt {
  ok: boolean;
  /** what the child answered (display text) */
  given?: string;
  t: number;
  /** answered with hints / step-by-step help */
  helped?: boolean;
}

export interface QuestionRecord {
  subject: SubjectId;
  unit: string;
  concept: string;
  type: QuestionType;
  attempts: number;
  correct: number;
  last: Attempt;
}

export interface ConceptRecord {
  /** most recent first, capped */
  hist: { qid: string; type: QuestionType; ok: boolean; helped?: boolean; t: number }[];
}

export interface SessionRecord {
  t: number;
  subject: SubjectId;
  unit: string;
  mode: string;
  total: number;
  correct: number;
}

export interface MyWord {
  word: string;
  meaning?: string;
  emoji?: string;
  added: number;
  /** spaced repetition: next review time and current interval (days) */
  due: number;
  box: number;
}

export interface PracticeState {
  version: 1;
  q: Record<string, QuestionRecord>;
  c: Record<string, ConceptRecord>;
  sessions: SessionRecord[];
  words: Record<string, MyWord>;
}

export interface PracticeStorage {
  load(): PracticeState | null;
  save(s: PracticeState): void;
}

const KEY = 'science-world.practice.v1';
export const localPracticeStorage: PracticeStorage = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as PracticeState) : null;
    } catch {
      return null;
    }
  },
  save(s) {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage full or blocked: keep playing in memory */
    }
  },
};

const empty = (): PracticeState => ({ version: 1, q: {}, c: {}, sessions: [], words: {} });

export const conceptKey = (subject: SubjectId, unit: string, concept: string) => `${subject}/${unit}/${concept}`;

/* ---------------- Mastery ---------------- */

/**
 * 0–100. A concept is only mastered after several correct answers to DIFFERENT questions
 * (ideally different formats); recent mistakes pull it down again.
 */
export function conceptMastery(rec: ConceptRecord | undefined): number {
  if (!rec || rec.hist.length === 0) return 0;
  const recent = rec.hist.slice(0, 8);
  const okQs = new Set(recent.filter((h) => h.ok).map((h) => h.qid));
  const okTypes = new Set(recent.filter((h) => h.ok).map((h) => h.type));
  const wrong = recent.slice(0, 5).filter((h) => !h.ok).length;
  const helped = recent.filter((h) => h.ok && h.helped).length;
  let score = Math.min(okQs.size, 4) * 22 + Math.min(okTypes.size, 2) * 6 - wrong * 18 - helped * 4;
  if (!recent[0].ok) score -= 10;
  return Math.max(0, Math.min(100, score));
}

export function isMastered(rec: ConceptRecord | undefined): boolean {
  if (!rec) return false;
  const recent = rec.hist.slice(0, 6);
  const okQs = new Set(recent.filter((h) => h.ok).map((h) => h.qid));
  return okQs.size >= 3 && recent[0]?.ok === true && conceptMastery(rec) >= 80;
}

export type ConceptStatus = 'new' | 'weak' | 'learning' | 'mastered';
export function conceptStatus(rec: ConceptRecord | undefined): ConceptStatus {
  if (!rec || rec.hist.length === 0) return 'new';
  if (isMastered(rec)) return 'mastered';
  const recent = rec.hist.slice(0, 5);
  const acc = recent.filter((h) => h.ok).length / recent.length;
  return acc < 0.6 ? 'weak' : 'learning';
}

/* ---------------- Context ---------------- */

interface Api {
  state: PracticeState;
  record: (a: { id: string; subject: SubjectId; unit: string; concept: string; type: QuestionType; ok: boolean; given?: string; helped?: boolean }) => void;
  finishSession: (s: Omit<SessionRecord, 't'>) => void;
  addWord: (w: { word: string; meaning?: string; emoji?: string }) => void;
  removeWord: (word: string) => void;
  reviewWord: (word: string, ok: boolean) => void;
}

const Ctx = createContext<Api | null>(null);

export function PracticeProvider({ children, storage = localPracticeStorage }: { children: ReactNode; storage?: PracticeStorage }) {
  const [state, setState] = useState<PracticeState>(() => ({ ...empty(), ...(storage.load() ?? {}) }));
  useEffect(() => storage.save(state), [state, storage]);

  const record = useCallback<Api['record']>((a) => {
    const t = Date.now();
    setState((s) => {
      const prev = s.q[a.id];
      const ck = conceptKey(a.subject, a.unit, a.concept);
      const crec = s.c[ck] ?? { hist: [] };
      return {
        ...s,
        q: {
          ...s.q,
          [a.id]: {
            subject: a.subject,
            unit: a.unit,
            concept: a.concept,
            type: a.type,
            attempts: (prev?.attempts ?? 0) + 1,
            correct: (prev?.correct ?? 0) + (a.ok ? 1 : 0),
            last: { ok: a.ok, given: a.given, t, helped: a.helped },
          },
        },
        c: { ...s.c, [ck]: { hist: [{ qid: a.id, type: a.type, ok: a.ok, helped: a.helped, t }, ...crec.hist].slice(0, 12) } },
      };
    });
  }, []);

  const api = useMemo<Api>(
    () => ({
      state,
      record,
      finishSession: (r) => setState((s) => ({ ...s, sessions: [{ ...r, t: Date.now() }, ...s.sessions].slice(0, 60) })),
      addWord: (w) =>
        setState((s) =>
          s.words[w.word.toLowerCase()]
            ? s
            : { ...s, words: { ...s.words, [w.word.toLowerCase()]: { ...w, added: Date.now(), due: Date.now(), box: 0 } } },
        ),
      removeWord: (word) =>
        setState((s) => {
          const words = { ...s.words };
          delete words[word.toLowerCase()];
          return { ...s, words };
        }),
      // Leitner boxes: 0 → today, 1 → 1 day, 2 → 3 days, 3 → 7 days, 4 → 14 days
      reviewWord: (word, ok) =>
        setState((s) => {
          const w = s.words[word.toLowerCase()];
          if (!w) return s;
          const box = ok ? Math.min(4, w.box + 1) : 0;
          const days = [0, 1, 3, 7, 14][box];
          return { ...s, words: { ...s.words, [word.toLowerCase()]: { ...w, box, due: Date.now() + days * 86400000 } } };
        }),
    }),
    [state, record],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function usePractice(): Api {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePractice must be used inside <PracticeProvider>');
  return v;
}

/* ---------------- Unit statistics ---------------- */

export interface UnitStats {
  attempted: number;
  correct: number;
  answers: number;
  accuracy: number;
  mastery: number;
  mastered: number;
  weak: number;
}

export function unitStats(state: PracticeState, subject: SubjectId, unit: string, conceptIds: string[]): UnitStats {
  let attempted = 0;
  let correct = 0;
  let answers = 0;
  for (const r of Object.values(state.q)) {
    if (r.unit !== unit || r.subject !== subject) continue;
    attempted++;
    answers += r.attempts;
    correct += r.correct;
  }
  const masteries = conceptIds.map((c) => conceptMastery(state.c[conceptKey(subject, unit, c)]));
  const statuses = conceptIds.map((c) => conceptStatus(state.c[conceptKey(subject, unit, c)]));
  return {
    attempted,
    correct,
    answers,
    accuracy: answers ? Math.round((100 * correct) / answers) : 0,
    mastery: masteries.length ? Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length) : 0,
    mastered: statuses.filter((s) => s === 'mastered').length,
    weak: statuses.filter((s) => s === 'weak').length,
  };
}
