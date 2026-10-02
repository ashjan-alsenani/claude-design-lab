import type { IconName } from '../art/icons'

export type QuizOption = { text: string; icon: IconName; correct?: boolean; hint?: string }

export type Step =
  | { kind: 'quiz'; question: string; options: QuizOption[]; fact: string }
  | { kind: 'clock' }
  | { kind: 'sort'; items: { text: string; icon: IconName; good: boolean; why: string }[] }
  | { kind: 'lab' }
  | { kind: 'compare' }
  | { kind: 'shield' }

export type Mission = {
  id: number
  title: string
  place: string
  emoji: string
  color: string
  colorB: string
  intro: string
  goal: string
  steps: Step[]
  badge: string
}

export const MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'من يصف الدواء؟',
    place: 'منطقة العيادة',
    emoji: '🏥',
    color: '#4cbcff',
    colorB: '#ffd23f',
    intro: 'مرحبًا! أنا ألين 👋 أهلًا بك في العيادة. هنا نتعرّف على المضاد الحيوي: ما هو؟ ومن يقرر أننا نحتاجه؟',
    goal: 'اعرف متى نحتاج المضاد الحيوي',
    badge: 'صديق الطبيب',
    steps: [
      {
        kind: 'quiz',
        question: 'من الذي يقرر أنك تحتاج مضادًا حيويًا؟',
        options: [
          { text: 'الطبيب', icon: 'doctor', correct: true },
          { text: 'صديقي في المدرسة', icon: 'friend', hint: 'صديقك يحبك، لكنه ليس طبيبًا. من يفحصك في العيادة؟' },
          { text: 'إعلان في التلفاز', icon: 'tv', hint: 'الإعلان لا يعرف ما في جسمك. فكّر في الشخص الذي يفحصك.' },
        ],
        fact: 'الطبيب يفحصك أولًا، ثم يقرر إن كنت تحتاج مضادًا حيويًا أم لا.',
      },
      {
        kind: 'quiz',
        question: 'المضاد الحيوي يحارب نوعًا واحدًا من الجراثيم. ما هو؟',
        options: [
          { text: 'البكتيريا', icon: 'germ', correct: true },
          { text: 'فيروس الزكام', icon: 'virus', hint: 'الفيروسات مختلفة! المضاد الحيوي لا يؤثر فيها.' },
          { text: 'الألم وحده', icon: 'pain', hint: 'المضاد الحيوي ليس مسكّنًا للألم. إنه يحارب نوعًا من الجراثيم.' },
        ],
        fact: 'المضاد الحيوي يقضي على البكتيريا فقط، ولا يعالج الفيروسات.',
      },
      {
        kind: 'quiz',
        question: 'عندك زكام وسيلان في الأنف 🤧 هل تحتاج مضادًا حيويًا؟',
        options: [
          { text: 'لا، الزكام سببه فيروس', icon: 'sneeze', correct: true },
          { text: 'نعم، دائمًا', icon: 'pill', hint: 'تذكّر: الزكام سببه فيروس، والمضاد الحيوي لا يحارب الفيروسات.' },
        ],
        fact: 'الزكام يتحسن غالبًا بالراحة والسوائل. وإذا قلق أهلك يسألون الطبيب.',
      },
    ],
  },
  {
    id: 2,
    title: 'في الوقت الصحيح',
    place: 'برج ساعة الدواء',
    emoji: '⏰',
    color: '#1fc8c0',
    colorB: '#7be3b0',
    intro: 'هذا برج ساعة الدواء ⏰ للدواء مواعيد مثل مواعيد المدرسة! هيا نتعلّم كيف نأخذه في وقته.',
    goal: 'خذ الدواء في موعده وأكمله',
    badge: 'سيد المواعيد',
    steps: [
      { kind: 'clock' },
      {
        kind: 'quiz',
        question: 'قال الطبيب: خذ الدواء ٧ أيام. في اليوم الثالث شعرت بتحسن. ماذا تفعل؟',
        options: [
          { text: 'أكمله كما قال الطبيب', icon: 'calendar', correct: true },
          { text: 'أتوقف فورًا', icon: 'stop', hint: 'بعض البكتيريا ما زالت مختبئة! إذا توقفت مبكرًا قد تعود أقوى.' },
          { text: 'آخذ جرعة مضاعفة', icon: 'double', hint: 'الجرعة المضاعفة ليست آمنة. الطبيب حدّد الكمية المناسبة لك.' },
        ],
        fact: 'نكمل الدواء كما قال الطبيب حتى لو شعرنا بتحسن، لأن بعض البكتيريا تبقى مختبئة.',
      },
      {
        kind: 'quiz',
        question: 'أوه! نسيت جرعة واحدة. ماذا أفعل؟',
        options: [
          { text: 'أخبر أهلي ليسألوا الطبيب أو الصيدلي', icon: 'parent', correct: true },
          { text: 'آخذ جرعتين معًا', icon: 'double', hint: 'لا نأخذ جرعتين معًا وحدنا. الكبار يعرفون من يسألون.' },
        ],
        fact: 'عند نسيان جرعة، نخبر الكبار ليسألوا الطبيب أو الصيدلي عن الصواب.',
      },
    ],
  },
  {
    id: 3,
    title: 'الدواء ليس هدية',
    place: 'حديقة الصداقة',
    emoji: '🤝',
    color: '#a46bff',
    colorB: '#ff8fc7',
    intro: 'نحن في حديقة الصداقة 🌸 الأصدقاء يتشاركون الألعاب والابتسامات… لكن هل نتشارك الدواء؟',
    goal: 'افرز التصرفات الصحيحة والخاطئة',
    badge: 'الصديق الحكيم',
    steps: [
      {
        kind: 'sort',
        items: [
          { text: 'أعطي دوائي لصديقي المريض', icon: 'share', good: false, why: 'دواؤك وُصف لك أنت فقط. صديقك يحتاج طبيبًا يفحصه.' },
          { text: 'أغسل يديّ بالماء والصابون', icon: 'handwash', good: true, why: 'غسل اليدين يبعد الجراثيم عنك وعن أصدقائك.' },
          { text: 'أحتفظ ببقايا الدواء لمرة قادمة', icon: 'leftover', good: false, why: 'لا نحتفظ ببقايا المضاد الحيوي. المرض القادم قد يكون مختلفًا تمامًا.' },
          { text: 'أخبر الكبار عندما أشعر بالتعب', icon: 'parent', good: true, why: 'الكبار يساعدونك ويأخذونك إلى الطبيب عند الحاجة.' },
          { text: 'آخذ دواء أخي لأن مرضنا يشبه بعضه', icon: 'bottle', good: false, why: 'حتى لو تشابه المرض، الطبيب وحده يعرف الدواء المناسب لك.' },
          { text: 'أغطي فمي عند العطس', icon: 'tissue', good: true, why: 'تغطية الفم تحمي أصدقاءك من الجراثيم.' },
        ],
      },
      {
        kind: 'quiz',
        question: 'صديقتك سارة مريضة وتطلب من دوائك. ماذا تقول لها؟',
        options: [
          { text: 'اذهبي مع أهلك إلى الطبيب', icon: 'doctor', correct: true },
          { text: 'خذي نصف دوائي', icon: 'share', hint: 'مشاركة الدواء قد تؤذي سارة. من يعرف الدواء المناسب لها؟' },
        ],
        fact: 'الصديق الحقيقي ينصح صديقه بزيارة الطبيب، ولا يعطيه دواءه.',
      },
    ],
  },
  {
    id: 4,
    title: 'سر البكتيريا المقاومة',
    place: 'مختبر البكتيريا',
    emoji: '🔬',
    color: '#3d6bff',
    colorB: '#8e5bff',
    intro: 'مرحبًا بك في المختبر 🔬 سننظر في المجهر لنكتشف كيف تصبح بعض البكتيريا مقاومة للمضاد الحيوي!',
    goal: 'اكتشف كيف تنشأ المقاومة',
    badge: 'عالم المختبر',
    steps: [
      { kind: 'lab' },
      { kind: 'compare' },
      {
        kind: 'quiz',
        question: 'من الذي يصبح مقاومًا للمضاد الحيوي؟',
        options: [
          { text: 'البكتيريا', icon: 'germShield', correct: true },
          { text: 'جسم الإنسان', icon: 'body', hint: 'جسمك لا يتغير! تذكّر ما رأيته في المجهر: من لبس الدروع؟' },
          { text: 'الدواء نفسه', icon: 'pill', hint: 'الدواء لا يتغير. انظر من الذي حصل على درع صغير.' },
        ],
        fact: 'البكتيريا هي التي تصبح مقاومة للمضاد، وليس جسم الإنسان.',
      },
      {
        kind: 'quiz',
        question: 'ما الذي يساعد البكتيريا على أن تصبح مقاومة؟',
        options: [
          { text: 'استخدام المضاد بلا حاجة أو عدم إكماله', icon: 'nomedicine', correct: true },
          { text: 'غسل اليدين', icon: 'handwash', hint: 'غسل اليدين يحمينا! ابحث عن الخطأ في استخدام الدواء.' },
          { text: 'زيارة الطبيب', icon: 'doctor', hint: 'الطبيب يساعدنا. فكّر في الاستخدام الخاطئ للدواء.' },
        ],
        fact: 'كلما استخدمنا المضاد الحيوي بلا حاجة، أعطينا البكتيريا فرصة لتصبح أقوى.',
      },
    ],
  },
  {
    id: 5,
    title: 'لنبنِ درع الحماية',
    place: 'قلعة الدرع',
    emoji: '🛡️',
    color: '#3cc46a',
    colorB: '#ffc83d',
    intro: 'وصلنا إلى قلعة الدرع 🏰 المهمة الأخيرة: اختر التصرفات الصحيحة لنبني الدرع الذهبي ونحمي مدينة الصحة!',
    goal: 'اجمع ٤ قطع للدرع الذهبي',
    badge: 'حارس المضادات الحيوية',
    steps: [{ kind: 'shield' }],
  },
]

export const SHIELD_ACTIONS: { text: string; icon: IconName; good: boolean; hint?: string }[] = [
  { text: 'أتبع تعليمات الطبيب', icon: 'clipboard', good: true },
  { text: 'مضاد حيوي للزكام', icon: 'sneeze', good: false, hint: 'الزكام سببه فيروس، والمضاد الحيوي لا يعالجه.' },
  { text: 'أغسل يديّ جيدًا', icon: 'handwash', good: true },
  { text: 'لا أشارك دوائي', icon: 'nomedicine', good: true },
  { text: 'أوقف الدواء عندما أتحسن', icon: 'stop', good: false, hint: 'نكمل الدواء كما قال الطبيب، حتى لو تحسنّا.' },
  { text: 'آخذ اللقاحات في موعدها', icon: 'vaccine', good: true },
]

export const missionById = (id: number) => MISSIONS.find((m) => m.id === id)!
