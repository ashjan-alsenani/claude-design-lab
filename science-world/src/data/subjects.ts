import type { Subject, SubjectId } from './types';
import { unit1 } from './unit1';
import { unit2 } from './unit2';
import { unit3 } from './unit3';
import { mathUnit1 } from './math/unit1';
import { mathUnit2 } from './math/unit2';
import { mathUnit3 } from './math/unit3';
import { mathUnit4 } from './math/unit4';

/** Every subject in the learning world. Add a subject = add an entry here. */
export const subjects: Subject[] = [
  {
    id: 'science',
    title: 'العلوم',
    emoji: '🔬',
    tagline: 'جسم الإنسان، الكائنات الحية، تغيّرات المادة',
    theme: 'coral',
    units: [unit1, unit2, unit3],
  },
  {
    id: 'math',
    title: 'الرياضيات',
    emoji: '🔢',
    tagline: 'الأعداد، القياس، الهندسة',
    theme: 'ocean',
    units: [mathUnit1, mathUnit2, mathUnit3, mathUnit4].filter((u) => u.lessons.length > 0),
  },
];

export function getSubject(id: SubjectId | string | undefined): Subject {
  return subjects.find((s) => s.id === id) ?? subjects[0];
}
