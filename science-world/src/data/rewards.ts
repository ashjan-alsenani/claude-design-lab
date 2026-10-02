import type { ProgressState } from '../state/model';
import { lessonsOf, subjects, units } from './units';

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  description: string;
  /** shown on the locked card */
  howTo: string;
  kind: 'badge' | 'trophy';
  earned: (s: ProgressState) => boolean;
}

const lessonsDone = (s: ProgressState) => Object.keys(s.lessons).length;
const quizPerfect = (s: ProgressState) =>
  Object.values(s.lessons).some((r) => r.total > 0 && r.score === r.total) ||
  Object.values(s.unitQuizzes).some((r) => r && r.best === r.total);

export const achievements: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'الدرس الأول',
    emoji: '⭐',
    description: 'أكملت أول درس في الرحلة!',
    howTo: 'أكمل الدرس الأول لتفتحها',
    kind: 'badge',
    earned: (s) => lessonsDone(s) >= 1,
  },
  {
    id: 'explorer',
    title: 'المستكشف الخارق',
    emoji: '🔎',
    description: 'أكملت ٥ دروس!',
    howTo: 'أكمل ٥ دروس لتفتحها',
    kind: 'badge',
    earned: (s) => lessonsDone(s) >= 5,
  },
  {
    id: 'perfect',
    title: 'العلامة الكاملة',
    emoji: '💯',
    description: 'أجبت عن كل أسئلة اختبار من المحاولة الأولى!',
    howTo: 'أجب عن كل أسئلة اختبار صحيحًا من أول مرة',
    kind: 'badge',
    earned: quizPerfect,
  },
  {
    id: 'quiz-master',
    title: 'سيد الاختبارات',
    emoji: '🎓',
    description: 'أنهيت اختبار «تحقق من تقدمك» لوحدة كاملة.',
    howTo: 'أنهِ اختبار وحدة لتفتحها',
    kind: 'badge',
    earned: (s) => Object.keys(s.unitQuizzes).length >= 1,
  },
  {
    id: 'fast-thinker',
    title: 'المفكر السريع',
    emoji: '⚡',
    description: 'أجبت عن ٨ أسئلة أو أكثر في تحدي الدقيقة!',
    howTo: 'اجمع ٨ إجابات في تحدي ٦٠ ثانية',
    kind: 'badge',
    earned: (s) => (s.challenges['speed'] ?? 0) >= 8,
  },
  {
    id: 'tables',
    title: 'بطلة جدول الضرب',
    emoji: '✖️',
    description: 'حللتِ ١٥ ناتج ضرب أو أكثر في سباق الدقيقة!',
    howTo: 'حلّي ١٥ ناتج ضرب في سباق جدول الضرب',
    kind: 'badge',
    earned: (s) => (s.challenges['tables'] ?? 0) >= 15,
  },
  {
    id: 'memory',
    title: 'ذاكرة حديدية',
    emoji: '🧠',
    description: 'فزت في تحدي الذاكرة!',
    howTo: 'افز في تحدي بطاقات الذاكرة',
    kind: 'badge',
    earned: (s) => (s.challenges['memory'] ?? 0) >= 1,
  },
  {
    id: 'streak',
    title: 'متعلم مثابر',
    emoji: '🔥',
    description: 'تعلمت ٣ أيام متتالية!',
    howTo: 'تعلّم ٣ أيام متتالية',
    kind: 'badge',
    earned: (s) => s.streak.best >= 3,
  },
  {
    id: 'star-collector',
    title: 'جامع النجوم',
    emoji: '🌟',
    description: 'جمعت ٣٠ نجمة!',
    howTo: 'اجمع ٣٠ نجمة',
    kind: 'badge',
    earned: (s) =>
      Object.values(s.lessons).reduce((a, r) => a + r.stars, 0) +
        Object.values(s.unitQuizzes).reduce((a, r) => a + (r?.stars ?? 0), 0) >=
      30,
  },
  ...units.map<Achievement>((u) => ({
    id: `trophy-${u.id}`,
    title: `كأس ${u.world}`,
    emoji: '🏆',
    description: `أنهيت التحدي النهائي لوحدة «${u.title}»!`,
    howTo: `أنهِ التحدي النهائي لوحدة «${u.title}»`,
    kind: 'trophy',
    earned: (s) => Boolean(s.bosses[u.id]),
  })),
  ...subjects
    .filter((sub) => sub.units.length > 0)
    .map<Achievement>((sub) => ({
      id: sub.id === 'science' ? 'hero' : `hero-${sub.id}`,
      title: `بطلة ${sub.title}`,
      emoji: sub.id === 'science' ? '🦸' : '🦸‍♀️',
      description: `أكملتِ كل دروس كتاب ${sub.title}!`,
      howTo: `أكملي كل دروس ${sub.title} الـ ${lessonsOf(sub.id).length}`,
      kind: 'trophy',
      earned: (s) => lessonsOf(sub.id).every((l) => s.lessons[l.id]),
    })),
  {
    id: 'champion',
    title: 'بطلة المعرفة',
    emoji: '👑',
    description: 'هزمتِ كل التحديات النهائية في كل المواد!',
    howTo: 'أنهي التحديات النهائية لكل الوحدات',
    kind: 'trophy',
    earned: (s) => units.every((u) => s.bosses[u.id]),
  },
];

/** Outfits for Nouri, unlocked by finishing units. */
export const characters: { id: string; name: string; outfit: 'none' | 'doctor' | 'ranger' | 'chemist' | 'cap' | 'crown'; howTo: string; unitId?: string; unlocked: (s: ProgressState) => boolean }[] = [
  { id: 'nouri', name: 'نوري المستكشف', outfit: 'none', howTo: 'معك من البداية', unlocked: () => true },
  { id: 'doctor', name: 'نوري الطبيب', outfit: 'doctor', unitId: 'u1', howTo: 'أنهي وحدة جسم الإنسان', unlocked: (s) => Boolean(s.bosses.u1) },
  { id: 'ranger', name: 'نوري حارس الغابة', outfit: 'ranger', unitId: 'u2', howTo: 'أنهي وحدة الكائنات الحية في البيئة', unlocked: (s) => Boolean(s.bosses.u2) },
  { id: 'chemist', name: 'نوري الكيميائي', outfit: 'chemist', unitId: 'u3', howTo: 'أنهي وحدة تغيرات المادة', unlocked: (s) => Boolean(s.bosses.u3) },
  { id: 'cap', name: 'نوري عبقري الأعداد', outfit: 'cap', unitId: 'm1', howTo: 'أنهي أول وحدة في الرياضيات', unlocked: (s) => Boolean(s.bosses.m1) },
  { id: 'crown', name: 'نوري ملك الرياضيات', outfit: 'crown', unitId: 'm4', howTo: 'أنهي آخر وحدة في الرياضيات', unlocked: (s) => Boolean(s.bosses.m4) },
];

export function newlyEarned(s: ProgressState): Achievement[] {
  return achievements.filter((a) => !s.badges.includes(a.id) && a.earned(s));
}
