import { describe, expect, it } from 'vitest';
import { casePoints } from '../src/activities/Detective';
import { PUZZLE_SLOTS } from '../src/data/lesson';
import { checkBoard, puzzleScore } from '../src/lib/puzzle';
import { DEFAULT_QUESTIONS, prepare } from '../src/lib/questions';
import { seeded, shuffle } from '../src/lib/random';
import { cueBetween } from '../src/lib/timeline';
import { speedScore } from '../src/lib/useCountdown';
import { segmentAt, spinTarget } from '../src/lib/wheel';
import { accuracy, applyRun, gemCount, initialProgress, isUnlocked, starsFor, tierFor, totalXp, type Progress } from '../src/state/progress';

describe('prepare (option shuffling)', () => {
  it('keeps the same correct answer text for every question and many seeds', () => {
    for (const q of DEFAULT_QUESTIONS) {
      for (let s = 1; s < 6; s++) {
        const p = prepare(q, seeded(s));
        expect(p.options[p.answer]).toBe(q.options[q.answer]);
        expect([...p.options].sort()).toEqual([...q.options].sort());
      }
    }
  });
  it('does not reorder true/false options', () => {
    const tf = DEFAULT_QUESTIONS.find((q) => q.type === 'truefalse')!;
    expect(prepare(tf, seeded(3)).options).toEqual(['صح', 'خطأ']);
  });
  it('shuffle is a permutation', () => {
    const a = [1, 2, 3, 4, 5, 6];
    expect(shuffle(a, seeded(9)).sort()).toEqual(a);
  });
});

describe('wheel', () => {
  it('maps rotation to the segment under the 12 o’clock pointer', () => {
    expect(segmentAt(0, 6)).toBe(0);
    expect(segmentAt(10, 6)).toBe(5); // wheel turned clockwise → the previous segment comes under the pointer
    expect(segmentAt(-10, 6)).toBe(0);
    expect(segmentAt(360 * 7 + 90, 6)).toBe(4);
  });
  it('a segment centre rotated to the pointer is that segment', () => {
    for (let i = 0; i < 6; i++) expect(segmentAt(-(i * 60 + 30) + 720, 6)).toBe(i);
  });
  it('spins at least five full turns and lands everywhere over many spins', () => {
    const rng = seeded(42);
    const seen = new Set<number>();
    for (let k = 0; k < 300; k++) {
      const end = spinTarget(0, rng);
      expect(end).toBeGreaterThanOrEqual(5 * 360);
      seen.add(segmentAt(end, 6));
    }
    expect(seen.size).toBe(6);
  });
});

describe('film timeline cues', () => {
  const cues = [
    { id: 'a', at: 10 },
    { id: 'b', at: 20 },
  ];
  it('stops at the first unanswered cue crossed', () => {
    expect(cueBetween(9.9, 10.1, cues, new Set())?.id).toBe('a');
    expect(cueBetween(0, 30, cues, new Set())?.id).toBe('a');
    expect(cueBetween(0, 30, cues, new Set(['a']))?.id).toBe('b');
    expect(cueBetween(10, 10.5, cues, new Set())).toBeNull(); // resuming exactly at a cue does not re-trigger
  });
});

describe('scoring', () => {
  it('speed score rewards correct and faster answers', () => {
    expect(speedScore(false, 10, 15)).toBe(0);
    expect(speedScore(true, 15, 15)).toBe(100);
    expect(speedScore(true, 0, 15)).toBe(50);
    expect(speedScore(true, 7.5, 15)).toBe(75);
  });
  it('detective points drop with clues and mistakes but never below 10', () => {
    expect(casePoints(0, 0)).toBe(30);
    expect(casePoints(1, 0)).toBe(30);
    expect(casePoints(3, 0)).toBe(20);
    expect(casePoints(3, 5)).toBe(10);
  });
  it('puzzle checks placements and scores hints/mistakes', () => {
    const board = { 's-root': 'p-root', 's-q': 'p-f', 's-f': 'p-f' };
    const r = checkBoard(board, PUZZLE_SLOTS);
    expect(r.right.sort()).toEqual(['s-f', 's-root']);
    expect(r.wrong).toEqual(['s-q']);
    expect(r.complete).toBe(false);
    const full = Object.fromEntries(PUZZLE_SLOTS.map((s) => [s.id, s.piece]));
    expect(checkBoard(full, PUZZLE_SLOTS).complete).toBe(true);
    expect(puzzleScore(0, 0)).toBe(100);
    expect(puzzleScore(2, 3)).toBe(65);
    expect(puzzleScore(10, 10)).toBe(30);
  });
  it('stars follow accuracy', () => {
    expect(starsFor(10, 10)).toBe(3);
    expect(starsFor(7, 10)).toBe(2);
    expect(starsFor(3, 10)).toBe(1);
    expect(starsFor(0, 0)).toBe(3);
  });
});

describe('progress', () => {
  const run = (p: Progress, id: Parameters<typeof applyRun>[1], score: number, correct: number, total: number) => applyRun(p, id, { score, correct, total }).next;

  it('unlocks islands in sequence; the palace needs all seven', () => {
    let p = initialProgress();
    expect(isUnlocked(p, 'gates')).toBe(true);
    expect(isUnlocked(p, 'chests')).toBe(false);
    p = run(p, 'gates', 100, 8, 8);
    expect(isUnlocked(p, 'chests')).toBe(true);
    expect(p.freshUnlock).toBe('chests');
    expect(isUnlocked(p, 'crown')).toBe(false);
    for (const id of ['chests', 'wheel', 'detective', 'puzzle', 'cinema', 'lightning'] as const) p = run(p, id, 50, 5, 10);
    expect(isUnlocked(p, 'crown')).toBe(true);
    expect(isUnlocked(initialProgress(), 'crown', true)).toBe(true);
  });

  it('keeps the best score, counts gems and computes accuracy', () => {
    let p = run(initialProgress(), 'gates', 60, 4, 8);
    p = run(p, 'gates', 40, 2, 8);
    expect(p.activities.gates.bestScore).toBe(60);
    expect(p.activities.gates.correct).toBe(4);
    expect(p.activities.gates.plays).toBe(2);
    p = run(p, 'gates', 90, 8, 8);
    expect(p.activities.gates.correct).toBe(8);
    expect(totalXp(p)).toBe(90);
    expect(gemCount(p)).toBe(1);
    expect(accuracy(p)).toBe(100);
  });

  it('awards badges once', () => {
    const r1 = applyRun(initialProgress(), 'gates', { score: 10, correct: 8, total: 8 });
    expect(r1.earned).toEqual(expect.arrayContaining(['first-gem', 'flawless']));
    const r2 = applyRun(r1.next, 'chests', { score: 10, correct: 8, total: 8, feats: ['detective'] });
    expect(r2.earned).toEqual(['detective']);
  });

  it('assigns the top tier only for full, accurate journeys', () => {
    let p = initialProgress();
    expect(tierFor(p).title).toBe('مستكشفة المعرفة');
    for (const id of ['gates', 'chests', 'wheel', 'detective', 'puzzle', 'cinema', 'lightning'] as const) p = run(p, id, 50, 10, 10);
    expect(tierFor(p).title).toBe('سفيرة المعرفة');
    let q = initialProgress();
    for (const id of ['gates', 'chests', 'wheel', 'detective', 'puzzle', 'cinema', 'lightning'] as const) q = run(q, id, 50, 6, 10);
    expect(tierFor(q).title).toBe('نجمة المعرفة');
  });
});
