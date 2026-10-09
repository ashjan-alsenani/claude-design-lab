import bank from '../data/questions.json';
import { shuffle, type Rng } from './random';
import type { Question, QuestionType } from './types';

export const DEFAULT_QUESTIONS = bank.questions as Question[];

/** A question as presented: options shuffled, with the correct index remapped. */
export interface PreparedQuestion extends Question {
  order: number[];
}

/** Types whose option order is meaningful and must not be shuffled. */
const FIXED_ORDER: QuestionType[] = ['truefalse', 'sunnahType'];

export function prepare(q: Question, rng: Rng = Math.random): PreparedQuestion {
  const idx = q.options.map((_, i) => i);
  const order = FIXED_ORDER.includes(q.type) ? idx : shuffle(idx, rng);
  return {
    ...q,
    order,
    options: order.map((i) => q.options[i]),
    answer: order.indexOf(q.answer),
  };
}

export function validateQuestion(q: Partial<Question>): string[] {
  const errors: string[] = [];
  if (!q.id || !q.id.trim()) errors.push('المعرّف مطلوب.');
  if (!q.text || !q.text.trim()) errors.push('نص السؤال مطلوب.');
  const opts = (q.options ?? []).map((o) => o.trim());
  if (opts.length < 2) errors.push('أضيفي خيارين على الأقل.');
  if (opts.some((o) => !o)) errors.push('لا تتركي خيارًا فارغًا.');
  if (new Set(opts).size !== opts.length) errors.push('الخيارات يجب ألا تتكرر.');
  if (q.answer === undefined || q.answer < 0 || q.answer >= opts.length) errors.push('حدّدي الإجابة الصحيحة.');
  if (!q.explanation || !q.explanation.trim()) errors.push('اكتبي تفسيرًا للإجابة.');
  return errors;
}

/** Questions usable in a strict four-option round (Lightning). */
export const isFourOption = (q: Question) => q.options.length === 4;
