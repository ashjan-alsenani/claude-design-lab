import type { ProgressState } from '../state/model';
import { allLessons, units } from './units';

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
  {
    id: 'hero',
    title: 'بطل التعلم',
    emoji: '🦸',
    description: 'أكملت كل دروس الكتاب!',
    howTo: `أكمل كل الدروس الـ ${allLessons.length}`,
    kind: 'trophy',
    earned: (s) => lessonsDone(s) >= allLessons.length,
  },
  {
    id: 'champion',
    title: 'بطل المعرفة',
    emoji: '👑',
    description: 'هزمت كل التحديات النهائية!',
    howTo: 'أنهِ التحديات النهائية للوحدات الثلاث',
    kind: 'trophy',
    earned: (s) => units.every((u) => s.bosses[u.id]),
  },
];

/** Outfits for Nouri, unlocked by finishing units. */
export const characters = [
  { id: 'nouri', name: 'نوري المستكشف', outfit: 'none' as const, howTo: 'معك من البداية', unlocked: () => true },
  {
    id: 'doctor',
    name: 'نوري الطبيب',
    outfit: 'doctor' as const,
    howTo: 'أنهِ وحدة جسم الإنسان',
    unlocked: (s: ProgressState) => Boolean(s.bosses.u1),
  },
  {
    id: 'ranger',
    name: 'نوري حارس الغابة',
    outfit: 'ranger' as const,
    howTo: 'أنهِ وحدة الكائنات الحية في البيئة',
    unlocked: (s: ProgressState) => Boolean(s.bosses.u2),
  },
  {
    id: 'chemist',
    name: 'نوري الكيميائي',
    outfit: 'chemist' as const,
    howTo: 'أنهِ وحدة تغيرات المادة',
    unlocked: (s: ProgressState) => Boolean(s.bosses.u3),
  },
];

export function newlyEarned(s: ProgressState): Achievement[] {
  return achievements.filter((a) => !s.badges.includes(a.id) && a.earned(s));
}
