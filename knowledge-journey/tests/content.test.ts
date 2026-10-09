import { describe, expect, it } from 'vitest';
import bank from '../src/data/questions.json';
import { CAPTIONS, CHAPTERS, CUES, FILM_DURATION } from '../src/data/film';
import { CASES, GATES, PUZZLE_PIECES, PUZZLE_SLOTS, SOURCE_STATEMENTS, TREASURE_CARDS } from '../src/data/lesson';
import { VERSES } from '../src/data/verses';
import { SEGMENTS } from '../src/activities/Wheel';
import { isFourOption, validateQuestion } from '../src/lib/questions';
import type { Question } from '../src/lib/types';

const qs = bank.questions as Question[];
const tokens = (s: string) => [...s.matchAll(/\[\[(\w+)\]\]/g)].map((m) => m[1]);

describe('question bank', () => {
  it('has 40–60 questions with unique ids', () => {
    expect(qs.length).toBeGreaterThanOrEqual(40);
    expect(qs.length).toBeLessThanOrEqual(60);
    expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
  });

  it.each(qs.map((q) => [q.id, q] as const))('%s is complete and valid', (_, q) => {
    expect(validateQuestion(q)).toEqual([]);
    expect(['easy', 'medium', 'hard']).toContain(q.difficulty);
    expect(q.topic).toBeTruthy();
    for (const t of [...tokens(q.text), ...q.options.flatMap(tokens), ...tokens(q.explanation)]) expect(VERSES).toHaveProperty(t);
  });

  it('true/false and sunnah-type questions use their fixed option sets', () => {
    for (const q of qs.filter((x) => x.type === 'truefalse')) expect(q.options).toEqual(['صح', 'خطأ']);
    for (const q of qs.filter((x) => x.type === 'sunnahType')) expect(q.options).toEqual(['القولية', 'الفعلية', 'التقريرية']);
  });

  it('has enough four-option questions for a 10-question lightning round', () => {
    expect(qs.filter(isFourOption).length).toBeGreaterThanOrEqual(20);
  });

  it('every wheel segment has a pool of at least 5 questions', () => {
    for (const s of SEGMENTS) {
      const pool = s.id === 'quick' ? qs.filter((q) => q.type === 'mcq' && isFourOption(q)) : qs.filter((q) => q.type === s.id);
      expect(pool.length, s.id).toBeGreaterThanOrEqual(5);
    }
  });

  it('covers every lesson topic', () => {
    const topics = new Set(qs.map((q) => q.topic));
    for (const t of ['sources', 'quran', 'sunnah', 'authority', 'relation', 'qawliyya', 'filiyya', 'taqririyya']) expect(topics).toContain(t);
  });
});

describe('verses', () => {
  it('are stored in Uthmani script with references', () => {
    for (const v of Object.values(VERSES)) {
      expect(v.text.length).toBeGreaterThan(8);
      expect(v.text).toMatch(/[ً-ْٰ]/); // carries tashkeel
      expect(v.ref).toMatch(/^\d+:\d+$/);
    }
    // compare canonically: the same marks may be stored in a different (equivalent) order
    expect(VERSES.hijr9.text.normalize('NFC')).toBe('إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَٰفِظُونَ'.normalize('NFC'));
  });
});

describe('activity content', () => {
  it('gate quizzes and statements are answerable', () => {
    for (const g of GATES) expect(g.quiz.options[g.quiz.answer]).toBeTruthy();
    expect(new Set(SOURCE_STATEMENTS.map((s) => s.source))).toEqual(new Set(['quran', 'sunnah']));
  });
  it('treasure cards cover all three kinds', () => {
    const kinds = new Set(TREASURE_CARDS.map((c) => c.kind));
    expect(kinds.size).toBe(3);
    for (const c of TREASURE_CARDS) expect(c.hint && c.why).toBeTruthy();
  });
  it('cases progress from easy to hard and every wrong option has a teaching note', () => {
    expect(CASES.map((c) => c.level)).toEqual(['سهلة', 'سهلة', 'متوسطة', 'متوسطة', 'صعبة', 'صعبة']);
    for (const c of CASES) {
      expect(c.options[c.answer]).toBeTruthy();
      c.options.forEach((_, i) => {
        if (i !== c.answer) expect(c.wrongNotes[i].length, `${c.id}:${i}`).toBeGreaterThan(5);
      });
    }
  });
  it('every puzzle slot has exactly one matching piece', () => {
    expect(PUZZLE_SLOTS.map((s) => s.piece).sort()).toEqual(PUZZLE_PIECES.map((p) => p.id).sort());
  });
  it('film: 60–90 s, captions contiguous, three cues inside the film', () => {
    expect(FILM_DURATION).toBeGreaterThanOrEqual(60);
    expect(FILM_DURATION).toBeLessThanOrEqual(90);
    for (let i = 1; i < CAPTIONS.length; i++) expect(CAPTIONS[i].start).toBe(CAPTIONS[i - 1].end);
    expect(CAPTIONS.at(-1)!.end).toBe(FILM_DURATION);
    expect(CHAPTERS.at(-1)!.end).toBe(FILM_DURATION);
    expect(CUES).toHaveLength(3);
    for (const c of CUES) {
      expect(c.at).toBeGreaterThan(0);
      expect(c.at).toBeLessThan(FILM_DURATION);
      expect(c.options[c.answer]).toBeTruthy();
    }
  });
});
