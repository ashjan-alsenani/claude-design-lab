/**
 * «حكاية المعرفة» — the animated film script for the interactive cinema.
 * Times are in seconds. Every caption and question is grounded in pp. 74–75.
 * Captions may contain [[verse]] tokens.
 */

export const FILM_DURATION = 86;

/**
 * Optional narration: place a recorded MP3 at public/media/narration.mp3 (86 s, matching
 * the caption timings below) and set this to 'media/narration.mp3'. The player keeps the
 * audio in sync with play, pause, seek and the question stops. Left null on purpose:
 * no synthetic or low-quality voice is used.
 */
export const NARRATION_SRC: string | null = null;

export interface Chapter {
  id: string;
  start: number;
  end: number;
  title: string;
}

export const CHAPTERS: Chapter[] = [
  { id: 'sources', start: 0, end: 12, title: 'ما مصادر التشريع؟' },
  { id: 'quran', start: 12, end: 26, title: 'القرآن الكريم' },
  { id: 'quran2', start: 26, end: 38, title: 'شمول القرآن وأحكامه' },
  { id: 'sunnah', start: 38, end: 50, title: 'السنة النبوية' },
  { id: 'types', start: 50, end: 64, title: 'أقسام السنة' },
  { id: 'relation', start: 64, end: 80, title: 'السنة مع القرآن' },
  { id: 'finale', start: 80, end: 86, title: 'الخاتمة' },
];

export interface Caption {
  start: number;
  end: number;
  text: string;
}

export const CAPTIONS: Caption[] = [
  { start: 0, end: 4, text: 'حكاية المعرفة: من مصادر التشريع الإسلامي' },
  { start: 4, end: 8, text: 'مصادر التشريع الإسلامي هي الأدلة الشرعية التي تُستنبط منها الأحكام الشرعية.' },
  { start: 8, end: 12, text: 'وأساسها مصدران: القرآن الكريم والسنة النبوية، وإليهما ترجع بقية المصادر كالإجماع والقياس.' },
  { start: 12, end: 16, text: 'القرآن الكريم هو المصدر الأول: كلام الله تعالى المنزل على نبيه محمد ﷺ بواسطة جبريل.' },
  { start: 16, end: 21, text: 'نتعبّد بتلاوته، ونُقل إلينا بالتواتر، مكتوبًا بين دفتي المصحف من سورة الفاتحة إلى سورة الناس.' },
  { start: 21, end: 26, text: 'وقد حفظه الله تعالى من أي تغيير أو تبديل: [[hijr9]]' },
  { start: 26, end: 31, text: 'جاء القرآن تبيانًا لكل شيء؛ فشمل العقيدة والعبادات والمعاملات والأحوال الشخصية وغيرها.' },
  { start: 31, end: 38, text: 'ومن أحكامه ما جاء مفصّلًا كالمواريث والطلاق، وما جاء مجملًا كالأمر بالشورى والعدل.' },
  { start: 38, end: 43, text: 'السنة النبوية هي المصدر الثاني: ما ثبت عن النبي ﷺ من قول أو فعل أو تقرير أو صفة خَلقية أو خُلُقية.' },
  { start: 43, end: 50, text: 'وهي حجة واجبة الاتباع؛ فالنبي ﷺ لا ينطق عن الهوى: [[nisa80]]' },
  { start: 50, end: 54, text: 'تنقسم السنة النبوية إلى ثلاثة أقسام.' },
  { start: 54, end: 57.5, text: 'القولية: الأحاديث التي قالها الرسول ﷺ في مختلف الأغراض والمناسبات.' },
  { start: 57.5, end: 61, text: 'الفعلية: الأفعال التي فعلها الرسول ﷺ، كأداء الصلوات الخمس وشعائر الحج.' },
  { start: 61, end: 64, text: 'التقريرية: قول أو فعل يصدر من الصحابي، فيقرّه النبي ﷺ أو يسكت عن إنكاره.' },
  { start: 64, end: 68, text: 'وتأتي السنة مع القرآن الكريم على ثلاث صور.' },
  { start: 68, end: 72, text: 'مؤكِّدة لما فيه: كقوله ﷺ «المسلمُ أخو المسلم»، تأكيدًا لقوله تعالى: [[hujurat10]]' },
  { start: 72, end: 76, text: 'شارحة ومبيّنة له: كبيان كيفية الصلاة والزكاة والصيام والحج.' },
  { start: 76, end: 80, text: 'ومستقلة بأحكام لم ترد فيه: كوجوب زكاة الفطر.' },
  { start: 80, end: 86, text: 'وقد هيّأ الله تعالى محدّثين أفذاذًا حفظوا السنة، فبقيت الشريعة مرنة صالحة لكل زمان ومكان.' },
];

export interface Cue {
  id: string;
  at: number;
  text: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const CUES: Cue[] = [
  {
    id: 'cue1',
    at: 26,
    text: 'توقّفي لحظة! ما المصدر الأول للتشريع الإسلامي؟',
    options: ['القرآن الكريم', 'السنة النبوية', 'القياس'],
    answer: 0,
    explanation: 'القرآن الكريم هو المصدر الأول، والسنة النبوية هي المصدر الثاني، أما القياس فمن المصادر التي ظهرت بالاجتهاد.',
  },
  {
    id: 'cue2',
    at: 50,
    text: 'لماذا كانت السنة النبوية حجة واجبة الاتباع؟',
    options: ['لأن النبي ﷺ لا ينطق عن الهوى، إن هو إلا وحي يوحى', 'لأنها كُتبت قبل القرآن الكريم', 'لأن الناس اعتادوا عليها'],
    answer: 0,
    explanation: 'مصدر السنة الوحي؛ ولهذا كانت السنة الثابتة حجة واجبة الاتباع كالقرآن في استنباط الأحكام.',
  },
  {
    id: 'cue3',
    at: 64,
    text: 'فعل صحابيٌّ فعلًا، فسكت النبي ﷺ عن إنكاره. ما نوع هذه السنة؟',
    options: ['السنة القولية', 'السنة الفعلية', 'السنة التقريرية'],
    answer: 2,
    explanation: 'الفعل صدر من الصحابي، وسكوت النبي ﷺ عن إنكاره إقرار له؛ فهي سنة تقريرية.',
  },
];
