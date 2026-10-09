import type { ActivityId } from '../lib/types';

export interface ActivityMeta {
  id: ActivityId;
  index: number;
  title: string;
  tagline: string;
  goal: string;
}

export const ACTIVITIES: Record<ActivityId, ActivityMeta> = {
  gates: { id: 'gates', index: 1, title: 'بوابة المعرفة', tagline: 'افتحي بوابتي المصدرين الأساسيين', goal: 'القرآن الكريم والسنة النبوية' },
  chests: { id: 'chests', index: 2, title: 'صندوق الكنوز المفقودة', tagline: 'أعيدي كل بطاقة إلى صندوقها', goal: 'تصنيف أقسام السنة' },
  wheel: { id: 'wheel', index: 3, title: 'عجلة التحديات', tagline: 'أديري العجلة وواجهي التحدي', goal: 'تحديات متنوعة' },
  detective: { id: 'detective', index: 4, title: 'المحققة الذكية', tagline: 'افحصي الأدلة وحلّي القضايا', goal: 'الفهم والتحليل' },
  puzzle: { id: 'puzzle', index: 5, title: 'أحجية المعرفة', tagline: 'أعيدي بناء خريطة المفاهيم', goal: 'خريطة أقسام السنة' },
  cinema: { id: 'cinema', index: 6, title: 'السينما التفاعلية', tagline: 'شاهدي حكاية المعرفة وتفاعلي معها', goal: 'فيديو تفاعلي' },
  lightning: { id: 'lightning', index: 7, title: 'تحدي البرق', tagline: '10 أسئلة، 15 ثانية لكل سؤال', goal: 'مسابقة سريعة' },
  crown: { id: 'crown', index: 8, title: 'قصر التتويج', tagline: 'استلمي لقبكِ وشهادتكِ', goal: 'النتائج والشهادة' },
};
