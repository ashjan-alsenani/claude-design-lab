import type { IconName } from '../art/icons'

/**
 * The play park: short, replayable activities grouped into three corners.
 * Every finished activity earns a sticker for the album.
 */

export type ActivityId = 'memory' | 'truefalse' | 'sequence' | 'handwash' | 'catch' | 'detective' | 'coloring'

export type Activity = {
  id: ActivityId
  title: string
  desc: string
  icon: IconName
  emoji: string
  minutes: number
  /** card colours: light, main, dark */
  color: [string, string, string]
  sticker: { name: string; emoji: string }
  intro: string
}

export type Corner = { key: string; title: string; emoji: string; tint: string; ids: ActivityId[] }

export const ACTIVITIES: Record<ActivityId, Activity> = {
  memory: {
    id: 'memory',
    title: 'لعبة الذاكرة',
    desc: 'اقلب البطاقات وابحث عن كل زوجين متشابهين',
    icon: 'star',
    emoji: '🧠',
    minutes: 2,
    color: ['#e3d6ff', '#8e5bff', '#5028c4'],
    sticker: { name: 'بطل الذاكرة', emoji: '🧠' },
    intro: 'اقلب بطاقتين في كل مرة، وابحث عن الصورتين المتشابهتين! 👀',
  },
  truefalse: {
    id: 'truefalse',
    title: 'صح أم خطأ؟',
    desc: 'هل الجملة صحيحة؟ اختر ✅ أو ❌',
    icon: 'clipboard',
    emoji: '✅',
    minutes: 2,
    color: ['#cdeeff', '#2f9dea', '#1667b4'],
    sticker: { name: 'خبير الحقائق', emoji: '💡' },
    intro: 'سأقرأ لك جملة… هل هي صحيحة أم خاطئة؟ 🤔',
  },
  sequence: {
    id: 'sequence',
    title: 'رتّب الخطوات',
    desc: 'اضغط على الخطوات بالترتيب الصحيح',
    icon: 'calendar',
    emoji: '🧩',
    minutes: 2,
    color: ['#ffe0c2', '#ff9f2e', '#c4651c'],
    sticker: { name: 'المنظّم الذكي', emoji: '🧩' },
    intro: 'ما الخطوة الأولى؟ اضغط على البطاقات بالترتيب ١ ٢ ٣ 👆',
  },
  handwash: {
    id: 'handwash',
    title: 'اغسل يديك!',
    desc: 'افرك يديك بالصابون ٢٠ ثانية واطرد الجراثيم',
    icon: 'handwash',
    emoji: '🧼',
    minutes: 1,
    color: ['#c9f5ff', '#1fc8c0', '#0d8e8a'],
    sticker: { name: 'يدان نظيفتان', emoji: '🧼' },
    intro: 'هيا نغسل أيدينا! ضع الصابون أولًا 🧼',
  },
  catch: {
    id: 'catch',
    title: 'اصطد العادات الصحية',
    desc: 'حرّك الدرع والتقط الأشياء المفيدة فقط',
    icon: 'shield',
    emoji: '🛡️',
    minutes: 1,
    color: ['#d4f7dc', '#3cc46a', '#1f8a43'],
    sticker: { name: 'حارس الدرع', emoji: '🛡️' },
    intro: 'التقط الأشياء المفيدة بالدرع، وابتعد عن باكتورو وأصدقائه! 🛡️',
  },
  detective: {
    id: 'detective',
    title: 'المحقق الصغير',
    desc: 'ابحث عن التصرفات الخاطئة في الصور',
    icon: 'stop',
    emoji: '🔍',
    minutes: 2,
    color: ['#ffd8e8', '#ff5fa8', '#c42f75'],
    sticker: { name: 'المحقق الذكي', emoji: '🔍' },
    intro: 'في هذه الصور ٤ تصرفات خاطئة… هل تستطيع إيجادها؟ 🔍',
  },
  coloring: {
    id: 'coloring',
    title: 'لوّن كبسول',
    desc: 'اختر الألوان ولوّن البطل كما تحب',
    icon: 'pill',
    emoji: '🎨',
    minutes: 3,
    color: ['#fff1b8', '#ffc83d', '#c79400'],
    sticker: { name: 'الفنان الصغير', emoji: '🎨' },
    intro: 'اختر لونًا ثم اضغط على أي جزء لتلوينه 🎨',
  },
}

export const CORNERS: Corner[] = [
  { key: 'think', title: 'ركن التفكير', emoji: '🧠', tint: '#8e5bff', ids: ['memory', 'truefalse', 'sequence'] },
  { key: 'move', title: 'ركن الحركة', emoji: '⚡', tint: '#1fc8c0', ids: ['handwash', 'catch'] },
  { key: 'create', title: 'ركن الإبداع والملاحظة', emoji: '🎨', tint: '#ff5fa8', ids: ['detective', 'coloring'] },
]

export const ACTIVITY_IDS = CORNERS.flatMap((c) => c.ids)

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

export const MEMORY_CARDS: { icon: IconName; label: string; fact: string }[] = [
  { icon: 'doctor', label: 'الطبيب', fact: 'الطبيب هو من يقرر إذا كنا نحتاج إلى مضاد حيوي 🩺' },
  { icon: 'handwash', label: 'الصابون', fact: 'غسل اليدين بالماء والصابون يطرد الجراثيم 🧼' },
  { icon: 'vaccine', label: 'اللقاح', fact: 'اللقاحات تحمينا من أمراض كثيرة 💉' },
  { icon: 'pill', label: 'الدواء', fact: 'نأخذ الدواء كما وصفه الطبيب تمامًا 💊' },
  { icon: 'clock', label: 'الموعد', fact: 'نأخذ الجرعة في وقتها الصحيح ⏰' },
  { icon: 'shield', label: 'الدرع', fact: 'الاستخدام الصحيح يحمي فعالية المضادات الحيوية 🛡️' },
]

export const TRUE_FALSE: { text: string; answer: boolean; why: string }[] = [
  { text: 'المضادات الحيوية تعالج الزكام.', answer: false, why: 'الزكام سببه فيروس، والمضادات الحيوية لا تعمل ضد الفيروسات.' },
  { text: 'نأخذ المضاد الحيوي فقط عندما يصفه الطبيب.', answer: true, why: 'صحيح! الطبيب هو من يقرر ذلك بعد أن يفحصنا.' },
  { text: 'أستطيع أن أعطي دوائي لصديقي إذا مرض مثلي.', answer: false, why: 'الدواء خاص بك وحدك، وصديقك يحتاج إلى طبيبه.' },
  { text: 'غسل اليدين بالماء والصابون يساعد على منع العدوى.', answer: true, why: 'صحيح! الصابون يطرد الجراثيم عن أيدينا.' },
  { text: 'إذا شعرت بتحسن، أتوقف عن الدواء وحدي دون أن أسأل الطبيب.', answer: false, why: 'نلتزم بتعليمات الطبيب، ونسأله قبل أن نتوقف.' },
  { text: 'اللقاحات تحمينا من بعض الأمراض.', answer: true, why: 'صحيح! اللقاحات تساعد أجسامنا على حماية نفسها.' },
  { text: 'بقايا الدواء القديم في الدرج تصلح لأي مرض.', answer: false, why: 'لا نستخدم بقايا الدواء أبدًا دون استشارة الطبيب.' },
  { text: 'إذا استخدمنا المضادات الحيوية بطريقة خاطئة، قد تصبح البكتيريا مقاومة لها.', answer: true, why: 'صحيح! لذلك نستخدمها بالطريقة الصحيحة فقط.' },
  { text: 'كل البكتيريا ضارة.', answer: false, why: 'بعض البكتيريا مفيدة وتعيش في أجسامنا لتساعدنا!' },
  { text: 'عندما أعطس، أغطي فمي وأنفي بمنديل أو بمرفقي.', answer: true, why: 'صحيح! هكذا لا تنتقل الجراثيم إلى الآخرين.' },
]

export const SEQUENCES: { title: string; steps: { emoji: string; text: string }[] }[] = [
  {
    title: 'عندما أشعر بالمرض',
    steps: [
      { emoji: '🤒', text: 'أشعر بالتعب' },
      { emoji: '👨‍👩‍👧', text: 'أخبر أمي أو أبي' },
      { emoji: '🩺', text: 'نزور الطبيب' },
      { emoji: '💊', text: 'آخذ الدواء كما وصفه الطبيب' },
      { emoji: '😊', text: 'أرتاح وأتحسّن' },
    ],
  },
  {
    title: 'كيف أغسل يديّ؟',
    steps: [
      { emoji: '💧', text: 'أبلّل يديّ بالماء' },
      { emoji: '🧼', text: 'أضع الصابون' },
      { emoji: '🤲', text: 'أفرك يديّ ٢٠ ثانية' },
      { emoji: '🚿', text: 'أشطفهما بالماء' },
      { emoji: '🧻', text: 'أجففهما بمنشفة نظيفة' },
    ],
  },
]

export const DETECTIVE: { icon: IconName; text: string; wrong: boolean; why: string }[] = [
  { icon: 'share', text: 'سارة تعطي دواءها لأخيها', wrong: true, why: 'لا نشارك الدواء أبدًا، فكل شخص يحتاج إلى طبيبه.' },
  { icon: 'handwash', text: 'عمر يغسل يديه بالصابون', wrong: false, why: '' },
  { icon: 'leftover', text: 'ليلى تأخذ دواءً قديمًا من الدرج', wrong: true, why: 'بقايا الدواء القديم لا نستخدمها دون استشارة الطبيب.' },
  { icon: 'doctor', text: 'يوسف يسأل الطبيب قبل الدواء', wrong: false, why: '' },
  { icon: 'sneeze', text: 'خالد يعطس دون أن يغطي فمه', wrong: true, why: 'نغطي الفم والأنف عند العطس لنحمي من حولنا.' },
  { icon: 'vaccine', text: 'مريم تأخذ لقاحها', wrong: false, why: '' },
  { icon: 'stop', text: 'سلمى توقفت عن دوائها وحدها', wrong: true, why: 'نلتزم بتعليمات الطبيب ونسأله قبل التوقف عن الدواء.' },
  { icon: 'tissue', text: 'علي يعطس في منديل', wrong: false, why: '' },
  { icon: 'clock', text: 'هند تأخذ دواءها في موعده', wrong: false, why: '' },
]

export const CATCH_GOOD: { icon: IconName; label: string }[] = [
  { icon: 'handwash', label: 'صابون' },
  { icon: 'vaccine', label: 'لقاح' },
  { icon: 'doctor', label: 'طبيب' },
  { icon: 'tissue', label: 'منديل' },
  { icon: 'clipboard', label: 'وصفة' },
]
export const CATCH_BAD: { icon: IconName; label: string }[] = [
  { icon: 'leftover', label: 'دواء قديم' },
  { icon: 'share', label: 'مشاركة الدواء' },
  { icon: 'germ', label: 'جرثومة' },
]
