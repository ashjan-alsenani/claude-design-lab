export type QuestionType = 'mcq' | 'truefalse' | 'complete' | 'definition' | 'sunnahType';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Topic =
  | 'sources'
  | 'quran'
  | 'sunnah'
  | 'authority'
  | 'relation'
  | 'qawliyya'
  | 'filiyya'
  | 'taqririyya';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  /** Index into `options` of the correct answer. */
  answer: number;
  explanation: string;
  difficulty: Difficulty;
  topic: Topic;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'اختيار من متعدد',
  truefalse: 'صح أم خطأ',
  complete: 'أكملي العبارة',
  definition: 'اختاري التعريف الصحيح',
  sunnahType: 'حدّدي نوع السنة',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
};

export const TOPIC_LABELS: Record<Topic, string> = {
  sources: 'مصادر التشريع',
  quran: 'القرآن الكريم',
  sunnah: 'السنة النبوية',
  authority: 'حجية السنة ومكانتها',
  relation: 'علاقة السنة بالقرآن',
  qawliyya: 'السنة القولية',
  filiyya: 'السنة الفعلية',
  taqririyya: 'السنة التقريرية',
};

export type ActivityId =
  | 'gates'
  | 'chests'
  | 'wheel'
  | 'detective'
  | 'puzzle'
  | 'cinema'
  | 'lightning'
  | 'crown';
