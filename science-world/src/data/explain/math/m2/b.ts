import type { Actor, Anim, XY } from '../../../../explain/types';
import type { Explainer } from '../../../../explain/types';

/* ---------- lesson 6-2 helpers: a calendar page (August 2023, like the book) ---------- */

/** Columns right → left: الأحد … السبت (the week starts on Sunday, as in the book). */
const CAL_X = [80, 70, 60, 50, 40, 30, 20];
const CAL_HEAD_Y = 20;
const CAL_Y = [29, 38, 47, 56, 65];
const DAY_NAMES = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const AR = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
/** cell [row][col] → day number; negative = previous month (30, 31 in grey). */
const calDay = (r: number, c: number) => r * 7 + c - 1;
const calCell = (day: number): XY => {
  const i = day + 1;
  return [CAL_X[i % 7], CAL_Y[Math.floor(i / 7)]];
};
const calendar = (inAt = 0): Actor[] => [
  ...DAY_NAMES.map((d, c): Actor => ({ id: `h${c}`, kind: 'text', text: d, x: CAL_X[c], y: CAL_HEAD_Y, size: 2.2, color: c === 5 ? 'red' : 'accent', in: inAt })),
  ...CAL_Y.flatMap((y, r) =>
    CAL_X.flatMap((x, c): Actor[] => {
      const d = calDay(r, c);
      if (d > 31) return [];
      const prev = d < 1;
      const t = inAt + 0.3 + r * 0.25;
      return [
        { id: `b${r}-${c}`, kind: 'shape', shape: 'rect', x, y, w: 9.2, h: 8, color: prev ? '#eef0f5' : '#e6f0ff', in: t },
        { id: `d${r}-${c}`, kind: 'text', text: AR(prev ? d + 31 : d), x, y, size: 3, color: prev ? 'grey' : 'ink', in: t },
      ];
    }),
  ),
];

/* ---------- lesson 7-1 helpers ---------- */

/** A square on the 16:10 stage (height = width × 1.6). */
const tile = (id: string, x: number, y: number, w: number, inAt: number, color = 'sun', label?: string, anim?: Anim[]): Actor => ({
  id,
  kind: 'shape',
  shape: 'rect',
  x,
  y,
  w,
  h: w * 1.6,
  color,
  label,
  in: inAt,
  anim,
});
/** small edge number used when counting the outer sides */
const edgeNo = (k: number, x: number, y: number, inAt: number): Actor => ({ id: `e${k}`, kind: 'text', text: AR(k), x, y, size: 2.8, color: 'sun', in: inAt });
/** a closed path for an ant walking around a rectangle */
const rectPath = (x1: number, y1: number, x2: number, y2: number): XY[] => [
  [x1, y1],
  [x2, y1],
  [x2, y2],
  [x1, y2],
  [x1, y1],
];

/* 3 × 2 rectangle of unit squares (lesson example: area ٦ سم², perimeter ١٠ سم) */
const R_X = [39, 50, 61];
const R_Y = [36, 53.6];
const RED = '#e8394d';
/* five 4-cm tiles: a row (x 26 … 74) and the 2 × 2 + 1 shape */
const ROW_X = [26, 38, 50, 62, 74];
const P_POS: XY[] = [
  [44, 53.2],
  [56, 53.2],
  [44, 34],
  [56, 34],
  [68, 34],
];

const explainers: Explainer[] = [
  /* =================================================================== */
  {
    lesson: 'm6-2',
    title: 'التقويمات ووحدات الوقت',
    scenes: [
      {
        title: 'هل هذا صحيح؟',
        say: 'قال صبي في الصف السادس: عُمري ٥٢٥٦٠٠ دقيقة! عدد كبير جدًّا… هل كلامه صحيح؟ لنتحقّق معًا.',
        duration: 9,
        bg: 'board',
        actors: [
          { id: 'boy', kind: 'emoji', emoji: '👦', x: 28, y: 58, size: 22, anim: [{ at: 0.6, effect: 'float' }] },
          { id: 'say', kind: 'text', text: 'عُمري', x: 70, y: 30, size: 4.6, box: true, color: 'sun', in: 1 },
          { id: 'num', kind: 'text', text: '٥٢٥ ٦٠٠', x: 70, y: 48, size: 8, color: 'sun', ltr: true, in: 1.6, anim: [{ at: 2.4, effect: 'pulse' }] },
          { id: 'unit', kind: 'text', text: 'دقيقة', x: 70, y: 64, size: 4.6, color: 'white', in: 2.2 },
          { id: 'q', kind: 'text', text: '؟', x: 50, y: 82, size: 9, color: 'sun', in: 4.4, anim: [{ at: 4.8, effect: 'bounce' }] },
        ],
      },
      {
        title: 'وحدات الوقت',
        say: 'القرن ١٠٠ سنة، والعقد ١٠ سنوات، والسنة ١٢ شهرًا، والأسبوع ٧ أيام، واليوم ٢٤ ساعة، والساعة ٦٠ دقيقة، والدقيقة ٦٠ ثانية.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'i1', kind: 'emoji', emoji: '🏛️', x: 90, y: 22, size: 6, in: 0.4 },
          { id: 't1', kind: 'text', text: 'القرن = ١٠٠ سنة', x: 68, y: 22, size: 3.4, box: true, color: 'sun', in: 0.4 },
          { id: 'i2', kind: 'emoji', emoji: '🔟', x: 90, y: 40, size: 6, in: 1.6 },
          { id: 't2', kind: 'text', text: 'العقد = ١٠ سنوات', x: 68, y: 40, size: 3.4, box: true, color: 'sun', in: 1.6 },
          { id: 'i3', kind: 'emoji', emoji: '📅', x: 90, y: 58, size: 6, in: 2.8 },
          { id: 't3', kind: 'text', text: 'السنة = ١٢ شهرًا', x: 68, y: 58, size: 3.4, box: true, color: 'sun', in: 2.8 },
          { id: 'i4', kind: 'emoji', emoji: '🗓️', x: 90, y: 76, size: 6, in: 4 },
          { id: 't4', kind: 'text', text: 'الأسبوع = ٧ أيام', x: 68, y: 76, size: 3.4, box: true, color: 'sun', in: 4 },
          { id: 'mid', kind: 'shape', shape: 'rect', x: 51, y: 50, w: 0.6, h: 66, color: 'rgba(255,255,255,0.3)', in: 0.2 },
          { id: 'i5', kind: 'emoji', emoji: '☀️', x: 45, y: 31, size: 6, in: 5.4 },
          { id: 't5', kind: 'text', text: 'اليوم = ٢٤ ساعة', x: 25, y: 31, size: 3.4, box: true, color: 'good', in: 5.4 },
          { id: 'i6', kind: 'emoji', emoji: '⏰', x: 45, y: 50, size: 6, in: 6.8 },
          { id: 't6', kind: 'text', text: 'الساعة = ٦٠ دقيقة', x: 25, y: 50, size: 3.4, box: true, color: 'good', in: 6.8 },
          { id: 'i7', kind: 'emoji', emoji: '⏱️', x: 45, y: 69, size: 6, in: 8.2 },
          { id: 't7', kind: 'text', text: 'الدقيقة = ٦٠ ثانية', x: 25, y: 69, size: 3.4, box: true, color: 'good', in: 8.2 },
        ],
      },
      {
        title: 'من الدقائق إلى السنوات',
        say: 'نحوّل إلى وحدة أكبر بالقسمة: ٥٢٥٦٠٠ ÷ ٦٠ = ٨٧٦٠ ساعة، ثم ٨٧٦٠ ÷ ٢٤ = ٣٦٥ يومًا، أي سنة واحدة فقط! والصبي عمره أكبر بكثير، إذن كلامه غير صحيح.',
        duration: 14,
        bg: 'board',
        actors: [
          { id: 'n1', kind: 'text', text: '٥٢٥ ٦٠٠', x: 58, y: 20, size: 5, color: 'white', ltr: true, in: 0.3 },
          { id: 'u1', kind: 'text', text: 'دقيقة', x: 76, y: 20, size: 3.8, color: 'white', in: 0.3 },
          { id: 'a1', kind: 'arrow', from: [58, 27], to: [58, 37], color: 'sun', in: 1.4 },
          { id: 'o1', kind: 'text', text: '÷ ٦٠', x: 70, y: 32, size: 4, color: 'sun', ltr: true, in: 1.6 },
          { id: 'n2', kind: 'text', text: '٨٧٦٠', x: 58, y: 44, size: 5, color: 'white', ltr: true, in: 2.8 },
          { id: 'u2', kind: 'text', text: 'ساعة', x: 74, y: 44, size: 3.8, color: 'white', in: 2.8 },
          { id: 'a2', kind: 'arrow', from: [58, 51], to: [58, 61], color: 'sun', in: 4 },
          { id: 'o2', kind: 'text', text: '÷ ٢٤', x: 70, y: 56, size: 4, color: 'sun', ltr: true, in: 4.2 },
          { id: 'n3', kind: 'text', text: '٣٦٥ يومًا = سنة واحدة', x: 58, y: 68, size: 4.4, box: true, color: 'good', in: 5.4, anim: [{ at: 6, effect: 'glow' }] },
          { id: 'boy', kind: 'emoji', emoji: '👦', x: 18, y: 46, size: 16, in: 7.5 },
          { id: 'x', kind: 'text', text: '✗ كلامه غير صحيح', x: 50, y: 86, size: 4.2, box: true, color: 'bad', in: 9, anim: [{ at: 9.4, effect: 'shake' }] },
        ],
      },
      {
        title: 'إلى وحدة أصغر: نضرب',
        say: 'وللتحويل إلى وحدة أصغر نضرب: اليوم ٢٤ ساعة، × ٦٠ = ١٤٤٠ دقيقة، × ٦٠ = ٨٦٤٠٠ ثانية. وفي الأسبوع: ٨٦٤٠٠ × ٧ = ٦٠٤٨٠٠ ثانية.',
        duration: 14,
        bg: 'board',
        actors: [
          { id: 'n0', kind: 'text', text: '١ يوم', x: 68, y: 20, size: 4.4, box: true, color: 'sun', in: 0.3 },
          { id: 'a0', kind: 'arrow', from: [68, 26.5], to: [68, 32.5], color: 'sun', in: 1 },
          { id: 'o0', kind: 'text', text: '× ٢٤', x: 80, y: 28, size: 3.6, color: 'sun', ltr: true, in: 1.2 },
          { id: 'n1', kind: 'text', text: '٢٤ ساعة', x: 68, y: 38, size: 4.4, color: 'white', in: 2 },
          { id: 'a1', kind: 'arrow', from: [68, 44], to: [68, 52], color: 'sun', in: 2.8 },
          { id: 'o1', kind: 'text', text: '× ٦٠', x: 80, y: 48, size: 3.6, color: 'sun', ltr: true, in: 3 },
          { id: 'n2', kind: 'text', text: '١٤٤٠ دقيقة', x: 68, y: 58, size: 4.4, color: 'white', in: 3.8 },
          { id: 'a2', kind: 'arrow', from: [68, 64], to: [68, 72], color: 'sun', in: 4.6 },
          { id: 'o2', kind: 'text', text: '× ٦٠', x: 80, y: 68, size: 3.6, color: 'sun', ltr: true, in: 4.8 },
          { id: 'n3', kind: 'text', text: '٨٦ ٤٠٠', x: 64, y: 79, size: 4.4, color: 'white', ltr: true, in: 5.6 },
          { id: 'u3', kind: 'text', text: 'ثانية', x: 78, y: 79, size: 4, color: 'white', in: 5.6 },
          { id: 'wk', kind: 'emoji', emoji: '🗓️', x: 28, y: 32, size: 9, in: 8 },
          { id: 'wl', kind: 'text', text: 'الأسبوع = ٧ أيام', x: 28, y: 48, size: 3.4, box: true, color: 'sun', in: 8.4 },
          { id: 'eq', kind: 'text', text: '٨٦ ٤٠٠ × ٧ = ٦٠٤ ٨٠٠', x: 28, y: 62, size: 3.6, color: 'white', ltr: true, in: 9.4, anim: [{ at: 9.8, effect: 'glow' }] },
          { id: 'eu', kind: 'text', text: 'ثانية في الأسبوع', x: 28, y: 72, size: 3.2, color: 'sun', in: 10 },
        ],
      },
      {
        title: 'أيّ شهر هذا؟',
        say: 'صفحة من تقويم ٢٠٢٣ بلا اسم شهر! اليومان ٣٠ و٣١ من الشهر السابق، وهذا الشهر فيه ٣١ يومًا أيضًا. شهران متتاليان كلٌّ منهما ٣١ يومًا: يناير أو أغسطس.',
        duration: 14,
        bg: 'paper',
        actors: [
          ...calendar(0),
          { id: 'r1', kind: 'shape', shape: 'pill', x: 75, y: 29, w: 21, h: 9.5, color: 'orange', outline: true, in: 2.6, anim: [{ at: 3, effect: 'pulse' }] },
          { id: 'l1', kind: 'text', text: 'من الشهر السابق', x: 72, y: 77, size: 3.2, box: true, color: 'orange', in: 3.2 },
          { id: 'r2', kind: 'shape', shape: 'circle', x: 40, y: 65, w: 8, h: 11, color: 'blue', outline: true, in: 5.2, anim: [{ at: 5.6, effect: 'pulse' }] },
          { id: 'l2', kind: 'text', text: 'هذا الشهر ٣١ يومًا', x: 30, y: 77, size: 3.2, box: true, color: 'blue', in: 5.6 },
          { id: 'res', kind: 'text', text: 'يناير أو أغسطس', x: 50, y: 89, size: 4, box: true, color: 'good', in: 9, anim: [{ at: 9.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'كل صفّ أسبوع',
        say: 'التقويم من النصف الثاني للسنة، إذن هو أغسطس، واليوم المحاط بالدائرة: الجمعة ١٨ أغسطس. لنعدّ الأيام من ١١ إلى ١٨: ٧ أيام، أي صفّ واحد = أسبوع.',
        duration: 14,
        bg: 'paper',
        actors: [
          ...calendar(0),
          { id: 'r18', kind: 'shape', shape: 'circle', x: calCell(18)[0], y: calCell(18)[1], w: 8, h: 11, color: 'red', outline: true, in: 1.2, anim: [{ at: 1.6, effect: 'pulse' }] },
          { id: 'date', kind: 'text', text: 'الجمعة ١٨ أغسطس ٢٠٢٣', x: 50, y: 76.5, size: 3.4, box: true, color: 'red', in: 2.6 },
          { id: 'r11', kind: 'shape', shape: 'circle', x: calCell(11)[0], y: calCell(11)[1], w: 8, h: 11, color: 'blue', outline: true, in: 5.6 },
          ...[12, 13, 14, 15, 16, 17, 18].flatMap((d, k): Actor[] => [
            { id: `k${d}`, kind: 'shape', shape: 'rect', x: calCell(d)[0], y: calCell(d)[1], w: 9.2, h: 8, color: 'rgba(47,127,240,0.35)', in: 6.6 + k * 0.5 },
            { id: `kn${d}`, kind: 'text', text: AR(k + 1), x: calCell(d)[0] + 3.4, y: calCell(d)[1] - 2.4, size: 2, color: 'blue', in: 6.6 + k * 0.5 },
          ]),
          { id: 'wk', kind: 'text', text: '٧ أيام = أسبوع', x: 50, y: 88.5, size: 3.4, box: true, color: 'blue', in: 10.4, anim: [{ at: 10.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'كم عمر جابر؟',
        say: 'وُلد جابر في ١١ يوليو ٢٠١٣. نعدّ السنوات الكاملة: ١٠ سنوات، ثم الشهور الكاملة: شهر واحد، ثم الأيام الباقية: ٧ أيام.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'cake', kind: 'emoji', emoji: '🎂', x: 88, y: 20, size: 7, in: 0.3 },
          { id: 'd1', kind: 'text', text: '١١ يوليو ٢٠١٣', x: 66, y: 20, size: 3.6, box: true, color: 'sun', in: 0.3 },
          { id: 'a1', kind: 'arrow', from: [43, 21], to: [43, 35], curve: 5, color: 'sun', in: 1.6 },
          { id: 'l1', kind: 'text', text: '١٠ سنوات', x: 27, y: 28, size: 4, color: 'sun', in: 2 },
          { id: 'd2', kind: 'text', text: '١١ يوليو ٢٠٢٣', x: 66, y: 36, size: 3.6, box: true, color: 'white', in: 2.4 },
          { id: 'a2', kind: 'arrow', from: [43, 37], to: [43, 51], curve: 5, color: 'sun', in: 4 },
          { id: 'l2', kind: 'text', text: 'شهر واحد', x: 27, y: 44, size: 4, color: 'sun', in: 4.4 },
          { id: 'd3', kind: 'text', text: '١١ أغسطس ٢٠٢٣', x: 66, y: 52, size: 3.6, box: true, color: 'white', in: 4.8 },
          { id: 'a3', kind: 'arrow', from: [43, 53], to: [43, 67], curve: 5, color: 'sun', in: 6.2 },
          { id: 'l3', kind: 'text', text: '٧ أيام', x: 27, y: 60, size: 4, color: 'sun', in: 6.6 },
          { id: 'd4', kind: 'text', text: '١٨ أغسطس ٢٠٢٣', x: 66, y: 68, size: 3.6, box: true, color: 'red', in: 7 },
          { id: 'res', kind: 'text', text: '١٠ سنوات وشهر و٧ أيام', x: 50, y: 86, size: 4.2, box: true, color: 'good', in: 8.8, anim: [{ at: 9.2, effect: 'glow' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'للتحويل إلى وحدة أصغر نضرب، وإلى وحدة أكبر نقسم. ولحساب العمر نعدّ السنوات الكاملة، ثم الشهور الكاملة، ثم الأيام الباقية.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'mi', kind: 'text', text: '×', x: 72, y: 24, size: 9, color: 'sun', in: 0.3 },
          { id: 'mt', kind: 'text', text: 'إلى وحدة أصغر', x: 72, y: 42, size: 3.8, box: true, color: 'sun', in: 0.6 },
          { id: 'me', kind: 'text', text: 'يوم ← ساعات ← دقائق', x: 72, y: 56, size: 3.2, color: 'white', in: 1.4 },
          { id: 'mid', kind: 'shape', shape: 'rect', x: 50, y: 42, w: 0.6, h: 44, color: 'rgba(255,255,255,0.3)', in: 0.2 },
          { id: 'di', kind: 'text', text: '÷', x: 28, y: 24, size: 9, color: 'green', in: 3 },
          { id: 'dt', kind: 'text', text: 'إلى وحدة أكبر', x: 28, y: 42, size: 3.8, box: true, color: 'good', in: 3.3 },
          { id: 'de', kind: 'text', text: 'دقائق ← ساعات ← أيام', x: 28, y: 56, size: 3.2, color: 'white', in: 4.1 },
          { id: 'age', kind: 'text', text: '🎂 سنوات ← شهور ← أيام', x: 50, y: 82, size: 4, box: true, color: 'accent', in: 6.4, anim: [{ at: 6.8, effect: 'glow' }] },
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm7-1',
    title: 'المساحة والمحيط',
    scenes: [
      {
        title: 'لغز البلاطات',
        say: 'عندنا خمس بلاطات مربعة، مساحة كلٍّ منها ١٦ سم². نريد ترتيبها معًا ليكون محيط الشكل ٤٠ سم. كيف؟ لنتعلّم أولًا: ما المساحة؟ وما المحيط؟',
        duration: 12,
        bg: 'board',
        actors: [
          ...[18, 34, 50, 66, 82].map((x, i) => tile(`t${i}`, x, i % 2 ? 46 : 38, 10, 0.3 + i * 0.25, RED, undefined, [{ at: 2 + i * 0.2, effect: 'float' }])),
          { id: 'l1', kind: 'text', text: 'كل بلاطة ١٦ سم²', x: 50, y: 70, size: 3.8, box: true, color: 'sun', in: 2.4 },
          { id: 'l2', kind: 'text', text: 'المحيط = ٤٠ سم ؟', x: 50, y: 86, size: 4.2, box: true, color: 'accent', in: 4.6, anim: [{ at: 5, effect: 'pulse' }] },
        ],
      },
      {
        title: 'المساحة: نعدّ المربعات',
        say: 'المساحة هي عدد ما يحتويه الشكل من الوحدات المربعة. كل مربع هنا ١ سم². لنعدّ: ١، ٢، ٣، ٤، ٥، ٦. إذن مساحة المستطيل ٦ سم².',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'frame', kind: 'shape', shape: 'rect', x: 50, y: 44.8, w: 33, h: 35.2, color: 'rgba(255,255,255,0.12)', in: 0.2 },
          ...Array.from({ length: 6 }, (_, i) => tile(`q${i}`, R_X[2 - (i % 3)], R_Y[Math.floor(i / 3)], 10.4, 2.4 + i * 0.6, 'sun', AR(i + 1))),
          { id: 'unit', kind: 'text', text: 'كل مربع = ١ سم²', x: 50, y: 74, size: 3.6, color: 'white', in: 1 },
          { id: 'res', kind: 'text', text: 'المساحة = ٦ سم²', x: 50, y: 87, size: 4.4, box: true, color: 'sun', in: 6.8, anim: [{ at: 7.2, effect: 'glow' }] },
        ],
      },
      {
        title: 'المحيط: نمشي حول الشكل',
        say: 'المحيط هو طول الخط الذي يحيط بالشكل من الخارج. تمشي النملة على الحدود: ٣ + ٢ + ٣ + ٢ = ١٠، إذن المحيط ١٠ سم.',
        duration: 12,
        bg: 'board',
        actors: [
          ...Array.from({ length: 6 }, (_, i) => tile(`q${i}`, R_X[i % 3], R_Y[Math.floor(i / 3)], 10.4, 0, 'rgba(255,255,255,0.14)')),
          { id: 'edge', kind: 'shape', shape: 'rect', x: 50, y: 44.8, w: 33, h: 35.2, color: 'orange', outline: true, in: 0.8 },
          { id: 'ant', kind: 'flow', path: rectPath(33.5, 27.2, 66.5, 62.4), emoji: '🐜', count: 1, speed: 6, smooth: false, showPath: false, in: 1.2 },
          { id: 's1', kind: 'text', text: '٣ سم', x: 50, y: 20, size: 3.4, color: 'orange', in: 2.2 },
          { id: 's2', kind: 'text', text: '٢ سم', x: 75, y: 44.8, size: 3.4, color: 'orange', in: 3.4 },
          { id: 's3', kind: 'text', text: '٣ سم', x: 50, y: 69, size: 3.4, color: 'orange', in: 4.6 },
          { id: 's4', kind: 'text', text: '٢ سم', x: 25, y: 44.8, size: 3.4, color: 'orange', in: 5.8 },
          { id: 'eq', kind: 'text', text: '٣ + ٢ + ٣ + ٢ = ١٠', x: 50, y: 79, size: 4.4, color: 'white', ltr: true, in: 7 },
          { id: 'res', kind: 'text', text: 'المحيط = ١٠ سم', x: 50, y: 90, size: 4, box: true, color: 'orange', in: 8.2, anim: [{ at: 8.6, effect: 'glow' }] },
        ],
      },
      {
        title: 'طول ضلع البلاطة',
        say: 'البلاطة مساحتها ١٦ سم²، أي ١٦ مربعًا صغيرًا: ٤ صفوف في كل صف ٤. مساحة المربع = الضلع × الضلع، و٤ × ٤ = ١٦، إذن طول ضلع البلاطة ٤ سم.',
        duration: 13,
        bg: 'board',
        actors: [
          tile('big', 34, 48, 25.6, 0.3, RED),
          ...[27.6, 34, 40.4].map((x, k): Actor => ({ id: `v${k}`, kind: 'shape', shape: 'rect', x, y: 48, w: 0.3, h: 40.4, color: 'rgba(255,255,255,0.75)', in: 1.6 + k * 0.3 })),
          ...[37.76, 48, 58.24].map((y, k): Actor => ({ id: `hz${k}`, kind: 'shape', shape: 'rect', x: 34, y, w: 25, h: 0.5, color: 'rgba(255,255,255,0.75)', in: 2.6 + k * 0.3 })),
          { id: 'n16', kind: 'text', text: '١٦ سم²', x: 34, y: 86, size: 4, box: true, color: 'sun', in: 3.8 },
          { id: 'sb', kind: 'text', text: '٤ سم', x: 34, y: 74.5, size: 3.4, color: 'sun', in: 5 },
          { id: 'ss', kind: 'text', text: '٤ سم', x: 14, y: 48, size: 3.4, color: 'sun', in: 5.4 },
          { id: 'eq', kind: 'text', text: '٤ × ٤ = ١٦', x: 70, y: 38, size: 5.5, color: 'white', ltr: true, in: 7 },
          { id: 'res', kind: 'text', text: 'طول الضلع = ٤ سم', x: 70, y: 58, size: 4, box: true, color: 'sun', in: 8.6, anim: [{ at: 9, effect: 'glow' }] },
        ],
      },
      {
        title: 'خمس بلاطات في صف',
        say: 'نضع البلاطات الخمس في صف واحد، ونعدّ الأضلاع الخارجية: ١٢ ضلعًا، وكل ضلع ٤ سم. المحيط = ١٢ × ٤ = ٤٨ سم. ليس ٤٠ بعد!',
        duration: 13,
        bg: 'board',
        actors: [
          ...ROW_X.map((x, i) => tile(`t${i}`, x, 44, 11.6, 0.2 + i * 0.15, RED)),
          ...ROW_X.map((x, k) => edgeNo(k + 1, x, 30.5, 1.6 + k * 0.4)),
          edgeNo(6, 83.5, 44, 3.6),
          ...[...ROW_X].reverse().map((x, k) => edgeNo(k + 7, x, 57.5, 4 + k * 0.4)),
          edgeNo(12, 16.5, 44, 6),
          { id: 'eq', kind: 'text', text: '١٢ × ٤ = ٤٨', x: 50, y: 74, size: 5, color: 'white', ltr: true, in: 7.4 },
          { id: 'res', kind: 'text', text: 'المحيط ٤٨ سم ✗', x: 50, y: 88, size: 4, box: true, color: 'bad', in: 9, anim: [{ at: 9.4, effect: 'shake' }] },
        ],
      },
      {
        title: 'ترتيب يعطي ٤٠ سم',
        say: 'نضع ٤ بلاطات في مربع كبير والخامسة بجانبه، فتختفي أضلاع داخل الشكل. يبقى ١٠ أضلاع: ١٠ × ٤ = ٤٠ سم. والمساحة لم تتغيّر: ٥ × ١٦ = ٨٠ سم².',
        duration: 14,
        bg: 'board',
        actors: [
          ...ROW_X.map((x, i) => tile(`t${i}`, x, 44, 11.6, 0, RED, undefined, [{ at: 0.8, to: { x: P_POS[i][0], y: P_POS[i][1] }, dur: 1.2 }])),
          edgeNo(1, 68, 21.5, 2.6),
          edgeNo(2, 56, 21.5, 2.9),
          edgeNo(3, 44, 21.5, 3.2),
          edgeNo(4, 34.5, 34, 3.5),
          edgeNo(5, 34.5, 53.2, 3.8),
          edgeNo(6, 44, 65.8, 4.1),
          edgeNo(7, 56, 65.8, 4.4),
          edgeNo(8, 65.5, 53.2, 4.7),
          edgeNo(9, 68, 46.5, 5),
          edgeNo(10, 77.5, 34, 5.3),
          { id: 'eq', kind: 'text', text: '١٠ × ٤ = ٤٠', x: 50, y: 77, size: 5, color: 'white', ltr: true, in: 6.6 },
          { id: 'res', kind: 'text', text: 'المحيط = ٤٠ سم ✓', x: 72, y: 90, size: 3.6, box: true, color: 'good', in: 7.8, anim: [{ at: 8.2, effect: 'glow' }] },
          { id: 'area', kind: 'text', text: 'المساحة: ٨٠ سم²', x: 28, y: 90, size: 3.6, box: true, color: 'sun', in: 10 },
        ],
      },
      {
        title: 'محيط المستطيل',
        say: 'مستطيل بنفسجي طوله ٤٦ ملم وعرضه ٢١ ملم. له ضلعان طويلان وضلعان قصيران، نجمع الأربعة: ٤٦ + ٢١ + ٤٦ + ٢١ = ١٣٤ ملم.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'rect', kind: 'shape', shape: 'rect', x: 50, y: 44, w: 46, h: 33.6, color: '#8b5cf6', in: 0.3 },
          { id: 'ant', kind: 'flow', path: rectPath(27, 27.2, 73, 60.8), emoji: '🐜', count: 1, speed: 6, smooth: false, showPath: false, in: 1.2 },
          { id: 's1', kind: 'text', text: '٤٦ ملم', x: 50, y: 20.5, size: 3.4, color: 'sun', in: 2 },
          { id: 's2', kind: 'text', text: '٢١ ملم', x: 82, y: 44, size: 3.4, color: 'sun', in: 3 },
          { id: 's3', kind: 'text', text: '٤٦ ملم', x: 50, y: 67.5, size: 3.4, color: 'sun', in: 4 },
          { id: 's4', kind: 'text', text: '٢١ ملم', x: 18, y: 44, size: 3.4, color: 'sun', in: 5 },
          { id: 'eq', kind: 'text', text: '٤٦ + ٢١ + ٤٦ + ٢١ = ١٣٤', x: 50, y: 78, size: 4.4, color: 'white', ltr: true, in: 6.6 },
          { id: 'res', kind: 'text', text: 'المحيط = ١٣٤ ملم', x: 50, y: 90, size: 4, box: true, color: 'sun', in: 8.4, anim: [{ at: 8.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'المساحة: عدد المربعات داخل الشكل، وتُقاس بوحدات مربعة مثل سم². المحيط: طول الخط حول الشكل من الخارج، ويُقاس بوحدات الطول مثل سم.',
        duration: 12,
        bg: 'board',
        actors: [
          ...Array.from({ length: 6 }, (_, i) => tile(`a${i}`, 64 + (i % 3) * 8, i < 3 ? 26 : 39.5, 7.4, 0.3 + i * 0.2, 'sun')),
          { id: 'at', kind: 'text', text: 'المساحة: داخل الشكل', x: 73, y: 58, size: 3.1, box: true, color: 'sun', in: 1.8 },
          { id: 'au', kind: 'text', text: 'سم²', x: 72, y: 74, size: 5.5, color: 'sun', in: 2.8 },
          { id: 'mid', kind: 'shape', shape: 'rect', x: 50, y: 52, w: 0.6, h: 70, color: 'rgba(255,255,255,0.3)', in: 0.2 },
          { id: 'pr', kind: 'shape', shape: 'rect', x: 28, y: 33, w: 24, h: 24, color: 'orange', outline: true, in: 5 },
          { id: 'ant', kind: 'flow', path: rectPath(16, 21, 40, 45), emoji: '🐜', count: 1, speed: 5, smooth: false, showPath: false, in: 5.4 },
          { id: 'pt', kind: 'text', text: 'المحيط: حول الشكل', x: 27, y: 58, size: 3.1, box: true, color: 'orange', in: 6 },
          { id: 'pu', kind: 'text', text: 'سم', x: 28, y: 74, size: 5.5, color: 'orange', in: 7 },
        ],
      },
    ],
  },
];

export default explainers;
