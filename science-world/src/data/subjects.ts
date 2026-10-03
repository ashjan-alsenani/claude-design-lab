import type { Subject, SubjectId } from './types';
import { personalise } from './learner';
import { unit1 } from './unit1';
import { unit2 } from './unit2';
import { unit3 } from './unit3';
import { mathUnit1 } from './math/unit1';
import { mathUnit2 } from './math/unit2';
import { mathUnit3 } from './math/unit3';
import { mathUnit4 } from './math/unit4';
import { englishWelcome } from './english/welcome';
import { englishUnit1 } from './english/unit1';
import { englishUnit2 } from './english/unit2';
import { englishUnit3 } from './english/unit3';
import { englishLearningClub1 } from './english/learningClub1';

/** Every subject in the learning world. Add a subject = add an entry here. */
export const subjects: Subject[] = personalise<Subject[]>([
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
  {
    id: 'english',
    title: 'اللغة الإنجليزية',
    short: 'الإنجليزية',
    emoji: '🔤',
    tagline: 'الهوايات، التقنية، الأماكن — Team Together',
    theme: 'sky',
    // Semester 1 Class Book (parts 1 and 2), in book order.
    units: [englishWelcome, englishUnit1, englishUnit2, englishUnit3, englishLearningClub1].filter((u) => u.lessons.length > 0),
  },
]);

export function getSubject(id: SubjectId | string | undefined): Subject {
  return subjects.find((s) => s.id === id) ?? subjects[0];
}
