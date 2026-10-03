/**
 * Checks an answer and explains it: correct?, what the child gave, the right answer,
 * and (when we can tell) WHY the child's answer is wrong.
 */
import { normalizeNumber, sameNumber, toArabicDigits } from '../lib/digits';
import type { PracticeQuestion } from './types';

export type Answer =
  | { type: 'choice'; id: string }
  | { type: 'tf'; value: boolean }
  | { type: 'multi'; ids: string[] }
  | { type: 'number'; value: string }
  | { type: 'remainder'; quotient: string; remainder: string }
  | { type: 'text'; value: string }
  | { type: 'order'; ids: string[] }
  | { type: 'match'; pairs: Record<string, string> }
  | { type: 'sort'; buckets: Record<string, string> }
  | { type: 'writing'; text: string };

export interface CheckResult {
  ok: boolean;
  /** the child's answer as text */
  given: string;
  /** the right answer as text */
  correct: string;
  /** diagnosis of this specific wrong answer, when known */
  why?: string;
  /** per-item marks for order / match / sort / multi (true = right) */
  marks?: Record<string, boolean>;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.!?,;:]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Math answers are shown with the book's Arabic-Indic digits; English with Western digits. */
export function showNumber(v: string, arabic: boolean) {
  const n = normalizeNumber(v);
  return arabic ? toArabicDigits(n).replace('-', '−') : n;
}

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export function checkAnswer(q: PracticeQuestion, a: Answer, arabicDigits = true): CheckResult {
  switch (q.type) {
    case 'choice': {
      const id = a.type === 'choice' ? a.id : '';
      const opt = (x: string) => q.options.find((o) => o.id === x);
      const txt = (x: string) => {
        const o = opt(x);
        return o ? `${o.emoji ? o.emoji + ' ' : ''}${o.text}`.trim() : '';
      };
      return { ok: id === q.answer, given: txt(id), correct: txt(q.answer), why: id !== q.answer ? q.wrongWhy?.[id] : undefined };
    }
    case 'tf': {
      const v = a.type === 'tf' ? a.value : !q.answer;
      const en = /[A-Za-z]/.test(q.prompt) && !/[؀-ۿ]/.test(q.prompt);
      const label = (b: boolean) => (en ? (b ? 'True' : 'False') : b ? 'صحيح' : 'خطأ');
      return { ok: v === q.answer, given: label(v), correct: label(q.answer), why: v !== q.answer ? q.wrongWhy : undefined };
    }
    case 'multi': {
      const ids = a.type === 'multi' ? a.ids : [];
      const marks: Record<string, boolean> = {};
      for (const o of q.options) marks[o.id] = ids.includes(o.id) === q.answers.includes(o.id);
      const names = (xs: string[]) => q.options.filter((o) => xs.includes(o.id)).map((o) => o.text).join('، ');
      const ok = ids.length === q.answers.length && ids.every((x) => q.answers.includes(x));
      return { ok, given: names(ids) || '—', correct: names(q.answers), marks };
    }
    case 'number': {
      const v = a.type === 'number' ? a.value : '';
      const ok = [q.answer, ...(q.accept ?? [])].some((x) => sameNumber(x, v));
      const known = ok ? undefined : q.mistakes?.find((m) => sameNumber(m.answer, v));
      const unit = q.unit ? ` ${q.unit}` : '';
      return { ok, given: showNumber(v, arabicDigits) + unit, correct: showNumber(q.answer, arabicDigits) + unit, why: known?.why };
    }
    case 'remainder': {
      const qv = a.type === 'remainder' ? a.quotient : '';
      const rv = a.type === 'remainder' ? a.remainder : '';
      const ok = sameNumber(qv, q.quotient) && sameNumber(rv || '0', q.remainder);
      const known = ok ? undefined : q.mistakes?.find((m) => sameNumber(m.quotient, qv) && sameNumber(m.remainder, rv || '0'));
      const show = (x: string, y: string) => `${showNumber(x, arabicDigits)} والباقي ${showNumber(y || '0', arabicDigits)}`;
      let why = known?.why;
      if (!ok && !why && sameNumber(qv, q.quotient)) why = 'الناتج صحيح، لكن انتبهي للباقي: اضربي الناتج في المقسوم عليه ثم اطرحيه من المقسوم.';
      return { ok, given: show(qv, rv), correct: show(q.quotient, q.remainder), why };
    }
    case 'text': {
      const v = a.type === 'text' ? a.value : '';
      const ok = [q.answer, ...(q.accept ?? [])].some((x) => norm(x) === norm(v));
      const known = ok ? undefined : q.mistakes?.find((m) => norm(m.answer) === norm(v));
      return { ok, given: v.trim() || '—', correct: q.answer, why: known?.why };
    }
    case 'order': {
      const ids = a.type === 'order' ? a.ids : [];
      const marks: Record<string, boolean> = {};
      q.items.forEach((it, i) => (marks[it.id] = ids[i] === it.id));
      const txt = (xs: string[]) => xs.map((x) => q.items.find((i) => i.id === x)?.text ?? '').join(' ← ');
      const sentence = q.items.every((i) => !i.emoji) && q.items.every((i) => /[A-Za-z]/.test(i.text) && i.text.split(' ').length <= 3);
      const join = (xs: string[]) => (sentence ? xs.map((x) => q.items.find((i) => i.id === x)?.text ?? '').join(' ') : txt(xs));
      return { ok: q.items.every((it, i) => ids[i] === it.id), given: join(ids), correct: join(q.items.map((i) => i.id)), marks };
    }
    case 'match': {
      const pairs = a.type === 'match' ? a.pairs : {};
      const marks: Record<string, boolean> = {};
      for (const p of q.pairs) marks[p.id] = pairs[p.id] === p.id;
      const right = (id: string) => q.pairs.find((p) => p.id === id)?.right ?? '؟';
      return {
        ok: q.pairs.every((p) => marks[p.id]),
        given: q.pairs.map((p) => `${p.left} ↔ ${right(pairs[p.id])}`).join(' · '),
        correct: q.pairs.map((p) => `${p.left} ↔ ${p.right}`).join(' · '),
        marks,
      };
    }
    case 'sort': {
      const b = a.type === 'sort' ? a.buckets : {};
      const marks: Record<string, boolean> = {};
      for (const it of q.items) marks[it.id] = b[it.id] === it.bucket;
      const label = (id: string) => q.buckets.find((x) => x.id === id)?.label ?? '';
      return {
        ok: q.items.every((it) => marks[it.id]),
        given: q.items.filter((it) => !marks[it.id]).map((it) => `${it.text} → ${label(b[it.id])}`).join(' · '),
        correct: q.items.map((it) => `${it.text} → ${label(it.bucket)}`).join(' · '),
        marks,
      };
    }
    case 'writing': {
      const text = a.type === 'writing' ? a.text : '';
      return { ok: wordCount(text) >= q.minWords, given: text, correct: q.model };
    }
  }
}
