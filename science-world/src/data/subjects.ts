import type { Subject, SubjectId } from './types';
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
  {
    id: 'english',
    title: 'اللغة الإنجليزية',
    emoji: '🔤',
    tagline: 'الهوايات والرياضة، التقنية، والمزيد — Team Together',
    theme: 'sky',
    // Semester 1 part 1: Welcome, Unit 1 and Unit 2 (lessons 1–8).
    // Part 2 of the book appends lessons to englishUnit2 and adds Unit 3.
    units: [englishWelcome, englishUnit1, englishUnit2].filter((u) => u.lessons.length > 0),
  },
];

export function getSubject(id: SubjectId | string | undefined): Subject {
  return subjects.find((s) => s.id === id) ?? subjects[0];
}
