/**
 * Loads question banks on demand. Each unit's JSON files become their own small chunk,
 * so a session downloads only the unit being practised. Overview screens use the index.
 */
import type { SubjectId } from '../data/types';
import type { Bank, BankFile, BankIndex, PracticeQuestion } from './types';
import indexJson from '../data/practice/index.json';
import { personalise } from '../data/learner';

export const bankIndex = indexJson as unknown as BankIndex;

const files = import.meta.glob<BankFile>('../data/practice/*/*/*.json', { import: 'default' });

const cache = new Map<string, Promise<Bank>>();

export function hasBank(unit: string): boolean {
  return Boolean(bankIndex[unit]?.total);
}

export function loadBank(subject: SubjectId, unit: string): Promise<Bank> {
  const key = `${subject}/${unit}`;
  let p = cache.get(key);
  if (!p) {
    const loaders = Object.entries(files)
      .filter(([path]) => path.includes(`/practice/${subject}/${unit}/`))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, load]) => load());
    p = Promise.all(loaders).then((parts) => personalise({
      subject,
      unit,
      concepts: parts.flatMap((f) => f.concepts),
      passages: parts.flatMap((f) => f.passages ?? []),
      questions: parts.flatMap((f) => f.questions),
    } as Bank));
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
}

export function questionById(bank: Bank, id: string): PracticeQuestion | undefined {
  return bank.questions.find((q) => q.id === id);
}

export const difficultyInfo = {
  easy: { label: 'مبتدئ', icon: '🌱' },
  medium: { label: 'تدريب', icon: '⭐' },
  hard: { label: 'تحدٍّ', icon: '🚀' },
  challenge: { label: 'خبيرة', icon: '🔥' },
} as const;
