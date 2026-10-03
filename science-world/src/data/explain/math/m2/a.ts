import type { Actor } from '../../../../explain/types';
import type { Explainer } from '../../../../explain/types';

/* ---------- small helpers (positions are % of the stage) ---------- */

/** x on the stage of `cm` on a ruler actor of `length` cm, centred at `cx` with width `w`. */
const rulerX = (cm: number, length: number, cx: number, w: number) => cx - w / 2 + (w * (20 + 44 * cm)) / (length * 44 + 40);

/** Lesson 5-2: lines of the book's exercise, as bars (length in ملم). */
const BARS: { mm: number; label: string }[] = [
  { mm: 26, label: '٢٦ ملم' },
  { mm: 51, label: '٥١ ملم' },
  { mm: 88, label: '٨٨ ملم' },
  { mm: 96, label: '٩٦ ملم' },
  { mm: 122, label: '١٢٢ ملم' },
  { mm: 129, label: '١٢٩ ملم' },
];
const BAR_X0 = 24;
const BAR_K = 0.5;

/** Lesson 5-2: straight lines in a right angle that make a curve. */
const STRING_LINES = Array.from({ length: 7 }, (_, i) => ({ from: [8, i + 1] as [number, number], to: [7 - i, 8] as [number, number], color: '#2f6fe0' }));
const ARMS = [
  { from: [8, 0] as [number, number], to: [8, 8] as [number, number], color: '#1f2a44' },
  { from: [0, 8] as [number, number], to: [8, 8] as [number, number], color: '#1f2a44' },
];

/** Lesson 6-1: Mohammed's song, 8 cycles of 245 s (song 225 s + silence 20 s) on a time line 1:00 → 1:32:30. */
const T0 = 10;
const TK = 80 / 1950;
const tx = (s: number) => T0 + s * TK;

/** Lesson 6-1: the six children, in order of arrival (24-hour times), on a time line 15:30 → 17:00. */
const KIDS: { name: string; emoji: string; time: string; min: number }[] = [
  { name: 'عمار', emoji: '👦', time: '١٥:٤٥', min: 15 },
  { name: 'معاذ', emoji: '👦', time: '١٥:٥٠', min: 20 },
  { name: 'فارس', emoji: '👦', time: '١٦:١٥', min: 45 },
  { name: 'بثينة', emoji: '👧', time: '١٦:٢٠', min: 50 },
  { name: 'عائشة', emoji: '👧', time: '١٦:٤٠', min: 70 },
  { name: 'مروة', emoji: '👧', time: '١٦:٤٨', min: 78 },
];
const kx = (min: number) => 12 + min * (76 / 90);

/** Lesson 6-1: sports timetable, Wednesday, on a time line 12:00 → 15:00. */
const sx = (h: number, m: number) => 14 + ((h - 12) * 60 + m) * 0.4;

const explainers: Explainer[] = [
  /* =================================================================== */
  {
    lesson: 'm5-1',
    title: 'التعامل مع الطول',
    scenes: [
      {
        title: 'رايات باسمة',
        say: 'تريد باسمة تعليق رايات حول غرفتها. طول الغرفة ٤ م وعرضها ٣ م، وطول كل راية ٧٠ سم. أمتار وسنتيمترات معًا! كيف نحسب؟',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'room', kind: 'shape', shape: 'rect', x: 52, y: 48, w: 44, h: 44, color: 'sun', outline: true, in: 0.3 },
          { id: 'girl', kind: 'emoji', emoji: '👧', x: 16, y: 58, size: 14, in: 0.6, anim: [{ at: 1.2, effect: 'float' }] },
          { id: 'len', kind: 'text', text: '٤ م', x: 52, y: 19, size: 4.6, color: 'white', ltr: true, in: 1.6 },
          { id: 'wid', kind: 'text', text: '٣ م', x: 82, y: 48, size: 4.6, color: 'white', ltr: true, in: 2.4 },
          {
            id: 'flags',
            kind: 'flow',
            path: [[30, 26], [74, 26], [74, 70], [30, 70], [30, 26]],
            emoji: '🎏',
            count: 6,
            speed: 9,
            smooth: false,
            showPath: false,
            in: 3.6,
          },
          { id: 'flag', kind: 'text', text: '🎏 كل راية ٧٠ سم', x: 52, y: 86, size: 3.8, box: true, color: 'orange', in: 4.4 },
          { id: 'q', kind: 'text', text: 'م و سم معًا؟', x: 16, y: 76, size: 3.6, color: 'sun', in: 6.4, anim: [{ at: 6.8, effect: 'pulse' }] },
        ],
      },
      {
        title: 'المليمتر والسنتيمتر',
        say: 'انظري إلى المسطرة: بين ٠ و١ عشرة تدريجات صغيرة، وكل تدريج مليمتر واحد. إذن يوجد ١٠ ملم في السنتيمتر الواحد.',
        duration: 11,
        bg: 'paper',
        actors: [
          { id: 'ruler', kind: 'math', math: { type: 'ruler', length: 4, mark: 1, label: '١ سم' }, x: 50, y: 42, w: 56, in: 0.2 },
          {
            id: 'ant',
            kind: 'emoji',
            emoji: '🐜',
            x: rulerX(0, 4, 50, 56),
            y: 72,
            size: 6,
            in: 1.4,
            anim: [{ at: 2, to: { x: rulerX(1, 4, 50, 56) }, dur: 3.5 }],
          },
          { id: 'cnt', kind: 'counter', from: 0, to: 10, x: 76, y: 74, dur: 3.5, size: 5, suffix: ' ملم', in: 2 },
          { id: 'eq', kind: 'text', text: '١ سم = ١٠ ملم', x: 50, y: 88, size: 5, color: 'accent', ltr: true, in: 6.4, anim: [{ at: 6.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'وحدات الطول',
        say: 'رتّبنا وحدات الطول من الأصغر إلى الأكبر: ملم، سم، م، كم. في السنتيمتر ١٠ ملم، وفي المتر ١٠٠ سم، وفي الكيلومتر ١٠٠٠ م.',
        duration: 13,
        bg: 'board',
        actors: [
          ...([
            ['🐜', 'ملم', 84],
            ['✏️', 'سم', 61],
            ['🚪', 'م', 38],
            ['🛣️', 'كم', 15],
          ] as const).flatMap(([e, u, x], i): Actor[] => [
            { id: `e${i}`, kind: 'emoji', emoji: e, x, y: 24, size: 10, in: 0.4 + i * 0.6 },
            { id: `u${i}`, kind: 'text', text: u, x, y: 42, size: 4.4, box: true, color: 'sun', in: 0.6 + i * 0.6 },
          ]),
          { id: 'a1', kind: 'arrow', from: [78, 42], to: [67, 42], color: 'white', in: 3.2 },
          { id: 'a2', kind: 'arrow', from: [55, 42], to: [44, 42], color: 'white', in: 3.4 },
          { id: 'a3', kind: 'arrow', from: [32, 42], to: [21, 42], color: 'white', in: 3.6 },
          { id: 'r1', kind: 'text', text: '١ سم = ١٠ ملم', x: 50, y: 62, size: 4.6, color: 'white', ltr: true, in: 4.6 },
          { id: 'r2', kind: 'text', text: '١ م = ١٠٠ سم', x: 50, y: 74, size: 4.6, color: 'white', ltr: true, in: 6.6 },
          { id: 'r3', kind: 'text', text: '١ كم = ١٠٠٠ م', x: 50, y: 86, size: 4.6, color: 'sun', ltr: true, in: 8.6, anim: [{ at: 9, effect: 'glow' }] },
        ],
      },
      {
        title: 'إلى وحدة أصغر نضرب',
        say: 'من وحدة كبيرة إلى وحدة أصغر نضرب: ٤ م × ١٠٠ = ٤٠٠ سم. و٣ كم × ١٠٠٠ = ٣٠٠٠ م.',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'big1', kind: 'text', text: '٤ م', x: 20, y: 34, size: 7, color: 'white', ltr: true, in: 0.4 },
          { id: 'ar1', kind: 'arrow', from: [32, 34], to: [62, 34], color: 'sun', in: 1.4 },
          { id: 'op1', kind: 'text', text: '× ١٠٠', x: 47, y: 25, size: 4.4, color: 'sun', ltr: true, in: 1.8 },
          { id: 'sm1', kind: 'text', text: '٤٠٠ سم', x: 78, y: 34, size: 7, color: 'sun', ltr: true, in: 2.8, anim: [{ at: 3.2, effect: 'pulse' }] },
          { id: 'big2', kind: 'text', text: '٣ كم', x: 20, y: 60, size: 7, color: 'white', ltr: true, in: 4.8 },
          { id: 'ar2', kind: 'arrow', from: [32, 60], to: [62, 60], color: 'sun', in: 5.6 },
          { id: 'op2', kind: 'text', text: '× ١٠٠٠', x: 47, y: 51, size: 4.4, color: 'sun', ltr: true, in: 6 },
          { id: 'sm2', kind: 'text', text: '٣٠٠٠ م', x: 78, y: 60, size: 7, color: 'sun', ltr: true, in: 7, anim: [{ at: 7.4, effect: 'pulse' }] },
          { id: 'rule', kind: 'text', text: 'إلى وحدة أصغر: نضرب ×', x: 50, y: 85, size: 4, box: true, color: 'good', in: 8.4 },
        ],
      },
      {
        title: 'إلى وحدة أكبر نقسم',
        say: 'ومن وحدة صغيرة إلى وحدة أكبر نقسم: ٤٥ ملم ÷ ١٠ = ٤,٥ سم. فالسنتيمتر فيه ١٠ ملم.',
        duration: 10,
        bg: 'board',
        actors: [
          { id: 'mm', kind: 'text', text: '٤٥ ملم', x: 20, y: 38, size: 7, color: 'white', ltr: true, in: 0.4 },
          { id: 'ant', kind: 'emoji', emoji: '🐜', x: 20, y: 22, size: 7, in: 0.6 },
          { id: 'ar', kind: 'arrow', from: [34, 38], to: [62, 38], color: '#7be3a4', in: 1.6 },
          { id: 'op', kind: 'text', text: '÷ ١٠', x: 48, y: 29, size: 4.4, color: '#7be3a4', ltr: true, in: 2 },
          { id: 'cm', kind: 'text', text: '٤,٥ سم', x: 78, y: 38, size: 7, color: 'sun', ltr: true, in: 3, anim: [{ at: 3.4, effect: 'pulse' }] },
          { id: 'pen', kind: 'emoji', emoji: '✏️', x: 78, y: 22, size: 7, in: 3.2 },
          { id: 'eq', kind: 'text', text: '٤٥ ÷ ١٠ = ٤,٥', x: 50, y: 62, size: 5.5, color: 'white', ltr: true, in: 4.6, anim: [{ at: 5, effect: 'glow' }] },
          { id: 'rule', kind: 'text', text: 'إلى وحدة أكبر: نقسم ÷', x: 50, y: 84, size: 4, box: true, color: 'good', in: 6.4 },
        ],
      },
      {
        title: 'محيط غرفة باسمة',
        say: 'نعود إلى باسمة: نجمع الجوانب الأربعة للغرفة: ٤ + ٣ + ٤ + ٣ = ١٤ م. ثم نحوّل إلى سنتيمترات مثل طول الراية: ١٤ م = ١٤٠٠ سم.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'room', kind: 'shape', shape: 'rect', x: 50, y: 40, w: 40, h: 36, color: 'sun', outline: true, in: 0.2 },
          { id: 'walk', kind: 'flow', path: [[30, 22], [70, 22], [70, 58], [30, 58], [30, 22]], color: 'orange', count: 3, speed: 5, smooth: false, in: 0.8 },
          { id: 's1', kind: 'text', text: '٤ م', x: 50, y: 16, size: 4.2, color: 'white', ltr: true, in: 1.4 },
          { id: 's2', kind: 'text', text: '٣ م', x: 77, y: 40, size: 4.2, color: 'white', ltr: true, in: 2 },
          { id: 's3', kind: 'text', text: '٤ م', x: 50, y: 64, size: 4.2, color: 'white', ltr: true, in: 2.6 },
          { id: 's4', kind: 'text', text: '٣ م', x: 23, y: 40, size: 4.2, color: 'white', ltr: true, in: 3.2 },
          { id: 'eq1', kind: 'text', text: '٤ + ٣ + ٤ + ٣ = ١٤ م', x: 50, y: 76, size: 4.8, color: 'white', ltr: true, in: 4.2 },
          { id: 'eq2', kind: 'text', text: '١٤ م = ١٤ × ١٠٠ = ١٤٠٠ سم', x: 50, y: 88, size: 4.8, color: 'sun', ltr: true, in: 7.4, anim: [{ at: 7.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'نقيس لأقرب مليمتر',
        say: 'لنقِس الخط الأزرق: ينتهي بعد ٦ سم و٤ تدريجات صغيرة. ٦ سم = ٦٠ ملم، و٦٠ + ٤ = ٦٤ ملم.',
        duration: 11,
        bg: 'paper',
        actors: [
          { id: 'ruler', kind: 'math', math: { type: 'ruler', length: 9, mark: 6.4, label: '؟' }, x: 50, y: 42, w: 84, in: 0.2 },
          { id: 'e1', kind: 'text', text: '٦ سم = ٦٠ ملم', x: 50, y: 70, size: 4.8, color: 'ink', ltr: true, in: 3.6 },
          { id: 'e2', kind: 'text', text: '٦٠ + ٤ = ٦٤ ملم', x: 50, y: 84, size: 5.2, color: 'accent', ltr: true, in: 6, anim: [{ at: 6.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'يوجد ١٠ ملم في السنتيمتر، و١٠٠ سم في المتر، و١٠٠٠ م في الكيلومتر. وقبل أن نحسب، نحوّل كل القياسات إلى الوحدة نفسها.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'i1', kind: 'emoji', emoji: '✏️', x: 76, y: 24, size: 7, in: 0.3 },
          { id: 'r1', kind: 'text', text: '١ سم = ١٠ ملم', x: 44, y: 24, size: 5, color: 'white', ltr: true, in: 0.5 },
          { id: 'i2', kind: 'emoji', emoji: '🚪', x: 76, y: 40, size: 7, in: 2 },
          { id: 'r2', kind: 'text', text: '١ م = ١٠٠ سم', x: 44, y: 40, size: 5, color: 'white', ltr: true, in: 2.2 },
          { id: 'i3', kind: 'emoji', emoji: '🛣️', x: 76, y: 56, size: 7, in: 3.8 },
          { id: 'r3', kind: 'text', text: '١ كم = ١٠٠٠ م', x: 44, y: 56, size: 5, color: 'white', ltr: true, in: 4 },
          { id: 'same', kind: 'text', text: '🔄 الوحدة نفسها قبل الحساب', x: 50, y: 80, size: 4.2, box: true, color: 'sun', in: 7, anim: [{ at: 7.4, effect: 'glow' }] },
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm5-2',
    title: 'رسم الخطوط',
    scenes: [
      {
        title: 'خط طوله ١٢٢ ملم؟',
        say: 'نريد رسم خط مستقيم طوله ١٢٢ ملم، لكن المسطرة مكتوب عليها سنتيمترات! كيف نرسمه بدقة؟',
        duration: 9,
        bg: 'paper',
        actors: [
          { id: 'ruler', kind: 'math', math: { type: 'ruler', length: 10 }, x: 50, y: 50, w: 80, in: 0.2 },
          { id: 'pen', kind: 'emoji', emoji: '✏️', x: 20, y: 24, size: 10, in: 0.8, anim: [{ at: 1.4, effect: 'float' }] },
          { id: 'q', kind: 'text', text: '١٢٢ ملم', x: 64, y: 22, size: 5.5, color: 'accent', ltr: true, in: 1.6 },
          { id: 'cm', kind: 'text', text: 'المسطرة بالسنتيمتر', x: 50, y: 82, size: 3.8, box: true, color: 'blue', in: 3.4 },
          { id: 'qq', kind: 'text', text: '؟', x: 80, y: 22, size: 6, color: 'red', in: 4.6, anim: [{ at: 5, effect: 'pulse' }] },
        ],
      },
      {
        title: 'نصائح للرسم الدقيق',
        say: 'ثلاث نصائح: قلمكِ مسنون، وتحقّقي من مقياس المسطرة وحوّلي الطول إلى وحداتها، وابدئي دائمًا من «٠» لا من حافة المسطرة.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'e1', kind: 'emoji', emoji: '✏️', x: 80, y: 38, size: 13, in: 0.4 },
          { id: 't1', kind: 'text', text: 'قلم مسنون', x: 80, y: 62, size: 3.4, box: true, color: 'sun', in: 0.8 },
          { id: 'e2', kind: 'emoji', emoji: '🔄', x: 50, y: 38, size: 13, in: 3.2, anim: [{ at: 3.6, effect: 'spin' }] },
          { id: 't2', kind: 'text', text: 'حوّلي الوحدة', x: 50, y: 62, size: 3.4, box: true, color: 'sun', in: 3.6 },
          { id: 'e3', kind: 'emoji', emoji: '📏', x: 20, y: 38, size: 13, in: 7, anim: [{ at: 7.4, effect: 'pulse' }] },
          { id: 't3', kind: 'text', text: 'ابدئي من «٠»', x: 20, y: 62, size: 3.4, box: true, color: 'sun', in: 7.4 },
          { id: 'no', kind: 'text', text: 'لا من حافة المسطرة ✗', x: 22, y: 77, size: 2.8, color: '#ff9a9a', in: 8.6 },
        ],
      },
      {
        title: 'نرسم خطًّا طوله ٩,٦ سم',
        say: 'نضع نقطة عند «٠»، ثم نتحرك ٩ سنتيمترات كاملة، ثم ٦ تدريجات صغيرة. نضع نقطة ثانية ونصل النقطتين: ٩,٦ سم = ٩٦ ملم.',
        duration: 13,
        bg: 'paper',
        actors: [
          { id: 'ruler', kind: 'math', math: { type: 'ruler', length: 10 }, x: 50, y: 48, w: 84, in: 0 },
          { id: 'dot0', kind: 'shape', shape: 'circle', x: rulerX(0, 10, 50, 84), y: 74, w: 1.8, h: 2.9, color: 'blue', in: 1.4, anim: [{ at: 1.6, effect: 'pulse' }] },
          ...Array.from({ length: 15 }, (_, i): Actor => {
            const a = i < 9 ? i : 9 + (i - 9) / 10;
            const b = i < 9 ? i + 1 : 9 + (i - 8) / 10;
            return { id: `seg${i}`, kind: 'shape', shape: 'rect', x: (rulerX(a, 10, 50, 84) + rulerX(b, 10, 50, 84)) / 2, y: 74, w: rulerX(b, 10, 50, 84) - rulerX(a, 10, 50, 84) + 0.2, h: 1, color: 'blue', in: i < 9 ? 3.2 + i * 0.25 : 6.6 + (i - 9) * 0.17 };
          }),
          { id: 'dot1', kind: 'shape', shape: 'circle', x: rulerX(9.6, 10, 50, 84), y: 74, w: 1.8, h: 2.9, color: 'blue', in: 7.8, anim: [{ at: 8, effect: 'pulse' }] },
          {
            id: 'pen',
            kind: 'emoji',
            emoji: '✏️',
            x: rulerX(0, 10, 50, 84) + 2.4,
            y: 70,
            size: 6,
            in: 0.6,
            anim: [
              { at: 3, to: { x: rulerX(9, 10, 50, 84) + 2.4 }, dur: 2.3 },
              { at: 6.5, to: { x: rulerX(9.6, 10, 50, 84) + 2.4 }, dur: 1.1 },
            ],
          },
          { id: 's1', kind: 'text', text: 'نقطة عند «٠»', x: 50, y: 88, size: 4, box: true, color: 'blue', in: 0.8, out: 3 },
          { id: 's2', kind: 'text', text: '٩ سنتيمترات كاملة', x: 50, y: 88, size: 4, box: true, color: 'blue', in: 3.2, out: 6.4 },
          { id: 's3', kind: 'text', text: '+ ٦ تدريجات صغيرة', x: 50, y: 88, size: 4, box: true, color: 'blue', in: 6.6, out: 9.2 },
          { id: 'res', kind: 'text', text: '٩,٦ سم = ٩٦ ملم', x: 50, y: 88, size: 5, color: 'accent', ltr: true, in: 9.4, anim: [{ at: 9.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'حوّلي قبل أن ترسمي',
        say: 'مسطرتكِ بالسنتيمترات، فنحوّل أولًا. من ملم إلى سم نقسم على ١٠: ١٢٢ ملم = ١٢,٢ سم. ومن م إلى سم نضرب في ١٠٠: ٠,٠٨٨ م = ٨,٨ سم.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'a1', kind: 'text', text: '١٢٢ ملم', x: 20, y: 30, size: 6.4, color: 'white', ltr: true, in: 0.4 },
          { id: 'ar1', kind: 'arrow', from: [34, 30], to: [62, 30], color: '#7be3a4', in: 1.6 },
          { id: 'o1', kind: 'text', text: '÷ ١٠', x: 48, y: 21, size: 4.4, color: '#7be3a4', ltr: true, in: 2 },
          { id: 'b1', kind: 'text', text: '١٢,٢ سم', x: 78, y: 30, size: 6.4, color: 'sun', ltr: true, in: 3, anim: [{ at: 3.4, effect: 'pulse' }] },
          { id: 'a2', kind: 'text', text: '٠,٠٨٨ م', x: 20, y: 60, size: 6.4, color: 'white', ltr: true, in: 5.6 },
          { id: 'ar2', kind: 'arrow', from: [34, 60], to: [62, 60], color: 'sun', in: 6.6 },
          { id: 'o2', kind: 'text', text: '× ١٠٠', x: 48, y: 51, size: 4.4, color: 'sun', ltr: true, in: 7 },
          { id: 'b2', kind: 'text', text: '٨,٨ سم', x: 78, y: 60, size: 6.4, color: 'sun', ltr: true, in: 8, anim: [{ at: 8.4, effect: 'pulse' }] },
          { id: 'rule', kind: 'text', text: '🔄 إلى وحدة المسطرة أولًا', x: 50, y: 84, size: 4, box: true, color: 'good', in: 9.6 },
        ],
      },
      {
        title: 'هل تكفي المسطرة؟',
        say: 'نحوّل كل الخطوط إلى المليمترات ونقارن. مسطرة طولها ١٠ سم أي ١٠٠ ملم: الخطّان ١٢٢ ملم و١٢٩ ملم أطول منها.',
        duration: 12,
        bg: 'board',
        actors: [
          ...BARS.flatMap(({ mm, label }, i): Actor[] => {
            const w = mm * BAR_K;
            const long = mm > 100;
            return [
              { id: `b${i}`, kind: 'shape', shape: 'rect', x: BAR_X0 + w / 2, y: 20 + i * 11, w, h: 6, color: long ? 'orange' : 'good', in: 0.5 + i * 0.5 },
              { id: `l${i}`, kind: 'text', text: label, x: 15, y: 20 + i * 11, size: 2.8, color: 'white', ltr: true, in: 0.7 + i * 0.5 },
            ];
          }),
          { id: 'lim', kind: 'shape', shape: 'rect', x: BAR_X0 + 100 * BAR_K, y: 49, w: 0.6, h: 66, color: 'sun', in: 4.4 },
          { id: 'liml', kind: 'text', text: '١٠ سم = ١٠٠ ملم', x: BAR_X0 + 100 * BAR_K, y: 88, size: 3.6, color: 'sun', ltr: true, in: 4.8 },
          { id: 'ring', kind: 'shape', shape: 'rect', x: 82, y: 70.5, w: 18, h: 21, color: 'red', outline: true, in: 7.4, anim: [{ at: 7.8, effect: 'pulse' }] },
        ],
      },
      {
        title: 'منحنى من خطوط مستقيمة',
        say: 'نضع نقاطًا متساوية البعد على ضلعَي زاوية قائمة، ثم نصل الأقرب إلى الزاوية بالأبعد عنها… فيظهر منحنى جميل من خطوط مستقيمة فقط!',
        duration: 13,
        bg: 'paper',
        actors: [
          ...Array.from({ length: 8 }, (_, k): Actor => ({
            id: `g${k}`,
            kind: 'math',
            math: { type: 'grid', cols: 8, rows: 8, lines: [...ARMS, ...STRING_LINES.slice(0, k)] },
            x: 46,
            y: 50,
            w: 38,
            in: k === 0 ? 0.2 : 2.4 + k * 0.9,
          })),
          { id: 'pts', kind: 'text', text: 'نقاط كل ٥ مم', x: 81, y: 30, size: 3.2, box: true, color: 'blue', in: 1.2 },
          { id: 'res', kind: 'text', text: 'خطوط مستقيمة ← منحنى ✨', x: 50, y: 88, size: 3.8, box: true, color: 'accent', in: 9.6, anim: [{ at: 10, effect: 'glow' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'قبل الرسم نحوّل الطول إلى وحدة المسطرة، ونبدأ من «٠» بقلم مسنون. وكل تدريج صغير على مسطرة السنتيمترات = ١ ملم.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'l1', kind: 'text', text: '🔄 حوّلي إلى وحدة المسطرة', x: 50, y: 22, size: 4.2, box: true, color: 'sun', in: 0.4 },
          { id: 'l2', kind: 'text', text: '📏 ابدئي من «٠»', x: 50, y: 40, size: 4.2, box: true, color: 'sun', in: 2.8 },
          { id: 'l3', kind: 'text', text: '✏️ قلم مسنون', x: 50, y: 58, size: 4.2, box: true, color: 'sun', in: 4.6 },
          { id: 'l4', kind: 'text', text: 'تدريج صغير = ١ ملم', x: 50, y: 78, size: 5, color: 'white', in: 6.8, anim: [{ at: 7.2, effect: 'glow' }] },
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm6-1',
    title: 'الجداول الزمنية',
    scenes: [
      {
        title: 'نشيد محمد',
        say: 'يستمع محمد إلى نشيد مدته ٣ دقائق و٤٥ ثانية، ثم صمت ٢٠ ثانية، ثم يبدأ من جديد. بدأ الساعة الواحدة. هل كان يستمع للنشيد الساعة ١:٣٠؟',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'clock', kind: 'math', math: { type: 'clock', hour: 1, minute: 0 }, x: 26, y: 46, w: 26, in: 0.3 },
          { id: 'song', kind: 'emoji', emoji: '🎵', x: 50, y: 28, size: 9, in: 1, anim: [{ at: 1.4, effect: 'float' }] },
          { id: 'st', kind: 'text', text: '٣ دقائق و٤٥ ثانية', x: 74, y: 28, size: 3.2, box: true, color: 'sun', in: 1.4 },
          { id: 'sh', kind: 'emoji', emoji: '🤫', x: 50, y: 52, size: 9, in: 3.4 },
          { id: 'sl', kind: 'text', text: 'صمت ٢٠ ثانية', x: 74, y: 52, size: 3.2, box: true, color: 'grey', in: 3.8 },
          { id: 'rep', kind: 'text', text: '🔁 ثم من جديد', x: 70, y: 72, size: 3.4, color: 'white', in: 5.4 },
          { id: 'q', kind: 'text', text: 'الساعة ١:٣٠ ← نشيد أم صمت؟', x: 50, y: 88, size: 4, box: true, color: 'accent', in: 7.6, anim: [{ at: 8, effect: 'pulse' }] },
        ],
      },
      {
        title: 'دورة واحدة',
        say: 'نحوّل إلى ثوانٍ: ٣ دقائق = ١٨٠ ثانية. الدورة الواحدة = ١٨٠ + ٤٥ + ٢٠ = ٢٤٥ ثانية، أي ٤ دقائق و٥ ثوانٍ.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'sbar', kind: 'shape', shape: 'rect', x: 12 + (225 * 0.294) / 2, y: 40, w: 225 * 0.294, h: 14, color: 'sun', label: '🎵 النشيد', in: 0.4 },
          { id: 'qbar', kind: 'shape', shape: 'rect', x: 12 + 225 * 0.294 + (20 * 0.294) / 2, y: 40, w: 20 * 0.294, h: 14, color: 'grey', in: 1.6 },
          { id: 'sl1', kind: 'text', text: '١٨٠ + ٤٥ = ٢٢٥', x: 45, y: 24, size: 3.4, color: 'sun', ltr: true, in: 2.4 },
          { id: 'ql', kind: 'text', text: '🤫 ٢٠', x: 81, y: 24, size: 3.4, color: 'white', in: 1.8 },
          { id: 'eq', kind: 'text', text: '١٨٠ + ٤٥ + ٢٠ = ٢٤٥', x: 50, y: 64, size: 5.5, color: 'white', ltr: true, in: 5 },
          { id: 'res', kind: 'text', text: '٢٤٥ ثانية = ٤ دقائق و٥ ثوانٍ', x: 50, y: 84, size: 4, box: true, color: 'sun', in: 7.6, anim: [{ at: 8, effect: 'glow' }] },
        ],
      },
      {
        title: 'ماذا كان يحدث الساعة ١:٣٠؟',
        say: 'نصف ساعة = ١٨٠٠ ثانية. ١٨٠٠ ÷ ٢٤٥ = ٧ والباقي ٨٥: سبع دورات كاملة، والنشيد الثامن بدأ الساعة ١:٢٨:٣٥. إذن الساعة ١:٣٠ كان يستمع للنشيد!',
        duration: 14,
        bg: 'board',
        actors: [
          { id: 'axis', kind: 'arrow', from: [8, 52], to: [93, 52], color: 'white', in: 0 },
          ...Array.from({ length: 8 }, (_, i): Actor[] => [
            {
              id: `c${i}`,
              kind: 'shape',
              shape: 'rect',
              x: tx(245 * i) + (225 * TK) / 2,
              y: 44,
              w: 225 * TK,
              h: 10,
              color: i === 7 ? 'orange' : 'sun',
              in: 0.6 + i * 0.5,
              anim: i === 7 ? [{ at: 10.6, effect: 'pulse' }] : undefined,
            },
            { id: `n${i}`, kind: 'text', text: '١٢٣٤٥٦٧٨'[i], x: tx(245 * i) + (225 * TK) / 2, y: 33, size: 2.8, color: 'white', in: 0.7 + i * 0.5 },
          ]).flat(),
          { id: 't0', kind: 'text', text: '١:٠٠', x: tx(0), y: 59, size: 3.2, color: 'white', ltr: true, in: 0.3 },
          { id: 'now', kind: 'shape', shape: 'rect', x: tx(1800), y: 45, w: 0.7, h: 16, color: 'red', in: 5.2 },
          { id: 'nowl', kind: 'text', text: '١:٣٠', x: tx(1800), y: 59, size: 3.2, color: '#ff9a9a', ltr: true, in: 5.4 },
          { id: 'eight', kind: 'text', text: '١:٢٨:٣٥', x: tx(1715) - 3, y: 25, size: 3, color: 'orange', ltr: true, in: 8.4 },
          { id: 'eq', kind: 'text', text: '١٨٠٠ ÷ ٢٤٥ = ٧', x: 64, y: 72, size: 4.6, color: 'white', ltr: true, in: 3 },
          { id: 'rem', kind: 'text', text: 'والباقي ٨٥', x: 30, y: 72, size: 4.6, color: 'sun', in: 4 },
          { id: 'res', kind: 'text', text: 'كان يستمع للنشيد 🎵 ✓', x: 50, y: 87, size: 4.2, box: true, color: 'good', in: 11, anim: [{ at: 11.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'نظام ٢٤ ساعة',
        say: 'الرابعة والربع بعد الظهر نكتبها بنظام ٢٤ ساعة بإضافة ١٢ إلى الساعة: ٤ + ١٢ = ١٦، فتصبح ١٦:١٥.',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'clock', kind: 'math', math: { type: 'clock', hour: 4, minute: 15 }, x: 26, y: 44, w: 26, in: 0.3 },
          { id: 'cl', kind: 'text', text: 'الرابعة والربع بعد الظهر', x: 26, y: 82, size: 3, box: true, color: 'sun', in: 0.9 },
          { id: 'eq', kind: 'text', text: '٤ + ١٢ = ١٦', x: 70, y: 28, size: 5.5, color: 'white', ltr: true, in: 3.2 },
          { id: 'ar', kind: 'arrow', from: [70, 37], to: [70, 50], color: 'sun', in: 4.8 },
          { id: 'd24', kind: 'text', text: '١٦:١٥', x: 70, y: 62, size: 10, color: 'sun', ltr: true, in: 5.8, anim: [{ at: 6.2, effect: 'glow' }] },
          { id: 'ex', kind: 'text', text: '٤:٤٠ مساءً = ١٦:٤٠', x: 70, y: 84, size: 3.6, color: 'white', in: 8 },
        ],
      },
      {
        title: 'من وصل أولًا؟',
        say: 'حوّلنا أوقات وصول الأطفال إلى منزل جدهم إلى نظام ٢٤ ساعة، ووضعناها على خط الوقت: عمار أولًا، ثم معاذ، ثم فارس، ثم بثينة، ثم عائشة، وأخيرًا مروة.',
        duration: 14,
        bg: 'board',
        actors: [
          { id: 'axis', kind: 'arrow', from: [8, 58], to: [93, 58], color: 'white', in: 0 },
          ...KIDS.flatMap(({ name, emoji, time, min }, i): Actor[] => {
            const x = kx(min);
            const up = i % 2 === 0;
            const t = 1 + i * 1.4;
            return [
              { id: `d${i}`, kind: 'shape', shape: 'circle', x, y: 58, w: 1.8, h: 2.9, color: 'sun', in: t },
              { id: `e${i}`, kind: 'emoji', emoji, x, y: up ? 26 : 79, size: 6.5, in: t },
              { id: `n${i}`, kind: 'text', text: name, x, y: up ? 37 : 90, size: 2.6, color: 'white', in: t + 0.2 },
              { id: `t${i}`, kind: 'text', text: time, x, y: up ? 48 : 68, size: 3, color: 'sun', ltr: true, in: t + 0.2 },
            ];
          }),
        ],
      },
      {
        title: 'كم بقيت مروة؟',
        say: 'وصلت مروة ١٦:٤٨، والساعة الآن ١٨:٤٠. نقفز أولًا إلى الساعة الكاملة ١٧:٠٠: ١٢ دقيقة. ثم إلى ١٨:٤٠: ١٠٠ دقيقة. المجموع ١١٢ دقيقة.',
        duration: 14,
        bg: 'board',
        actors: [
          { id: 'axis', kind: 'arrow', from: [8, 60], to: [93, 60], color: 'white', in: 0 },
          { id: 'girl', kind: 'emoji', emoji: '👧', x: 14, y: 30, size: 7, in: 0.4 },
          { id: 'p1', kind: 'shape', shape: 'circle', x: 14, y: 60, w: 1.8, h: 2.9, color: 'sun', in: 0.6 },
          { id: 'l1', kind: 'text', text: '١٦:٤٨', x: 14, y: 67, size: 3.4, color: 'sun', ltr: true, in: 0.6 },
          { id: 'p3', kind: 'shape', shape: 'circle', x: 84, y: 60, w: 1.8, h: 2.9, color: 'sun', in: 1.6 },
          { id: 'l3', kind: 'text', text: '١٨:٤٠', x: 84, y: 67, size: 3.4, color: 'sun', ltr: true, in: 1.6 },
          { id: 'clk', kind: 'emoji', emoji: '🕰️', x: 84, y: 30, size: 7, in: 1.6 },
          { id: 'p2', kind: 'shape', shape: 'circle', x: 30, y: 60, w: 1.8, h: 2.9, color: 'white', in: 3.4 },
          { id: 'l2', kind: 'text', text: '١٧:٠٠', x: 30, y: 67, size: 3.4, color: 'white', ltr: true, in: 3.4 },
          { id: 'j1', kind: 'arrow', from: [15, 56], to: [29, 56], curve: -6, color: '#7be3a4', in: 4 },
          { id: 'j1l', kind: 'text', text: '١٢ دقيقة', x: 22, y: 43, size: 3.2, color: '#7be3a4', in: 4.6 },
          { id: 'j2', kind: 'arrow', from: [31, 56], to: [83, 56], curve: -12, color: '#7be3a4', in: 6.6 },
          { id: 'j2l', kind: 'text', text: '١٠٠ دقيقة', x: 57, y: 33, size: 3.2, color: '#7be3a4', in: 7.4 },
          { id: 'eq', kind: 'text', text: '١٢ + ١٠٠ = ١١٢', x: 70, y: 82, size: 5, color: 'white', ltr: true, in: 9.4 },
          { id: 'res', kind: 'text', text: 'ساعة و٥٢ دقيقة', x: 28, y: 82, size: 3.8, box: true, color: 'sun', in: 10.6, anim: [{ at: 11, effect: 'glow' }] },
        ],
      },
      {
        title: 'جدول بدون تعارض',
        say: 'يريد فارس كرة السلة يوم الأربعاء من ١٢:٢٠ إلى ١٤:٠٠. كرة القدم ذلك اليوم تبدأ ١٣:١٠ قبل أن تنتهي كرة السلة، فتتعارضان. لذلك يختار كرة القدم يوم الاثنين.',
        duration: 14,
        bg: 'board',
        actors: [
          { id: 'axis', kind: 'arrow', from: [10, 62], to: [92, 62], color: 'white', in: 0 },
          ...([
            ['١٢:٠٠', 12],
            ['١٣:٠٠', 13],
            ['١٤:٠٠', 14],
            ['١٥:٠٠', 15],
          ] as const).flatMap(([t, h], i): Actor[] => [
            { id: `tk${i}`, kind: 'shape', shape: 'rect', x: sx(h, 0), y: 62, w: 0.5, h: 4, color: 'white', in: 0.2 },
            { id: `tl${i}`, kind: 'text', text: t, x: sx(h, 0), y: 69, size: 3, color: 'white', ltr: true, in: 0.2 },
          ]),
          { id: 'bb', kind: 'shape', shape: 'rect', x: (sx(12, 20) + sx(14, 0)) / 2, y: 30, w: sx(14, 0) - sx(12, 20), h: 11, color: 'orange', label: '🏀 كرة السلة', in: 1 },
          { id: 'fb', kind: 'shape', shape: 'rect', x: (sx(13, 10) + sx(14, 45)) / 2, y: 47, w: sx(14, 45) - sx(13, 10), h: 11, color: 'good', label: '⚽ كرة القدم', in: 4 },
          { id: 'clash', kind: 'shape', shape: 'rect', x: (sx(13, 10) + sx(14, 0)) / 2, y: 38.5, w: sx(14, 0) - sx(13, 10) + 1, h: 32, color: 'red', outline: true, in: 7, anim: [{ at: 7.4, effect: 'shake' }] },
          { id: 'cl', kind: 'text', text: 'تعارض ✗', x: 88, y: 30, size: 3.6, box: true, color: 'bad', in: 7.4 },
          { id: 'ok', kind: 'text', text: '⚽ كرة القدم يوم الاثنين ✓', x: 50, y: 85, size: 4, box: true, color: 'good', in: 10.6, anim: [{ at: 11, effect: 'glow' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'بعد الظهر نضيف ١٢ إلى الساعة. الساعة ٦٠ دقيقة، والدقيقة ٦٠ ثانية. ولحساب المدة نقفز إلى الساعة الكاملة التالية ثم نكمل.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'l1', kind: 'text', text: 'بعد الظهر: + ١٢', x: 50, y: 22, size: 4.4, box: true, color: 'sun', in: 0.4 },
          { id: 'l2', kind: 'text', text: '١ ساعة = ٦٠ دقيقة', x: 50, y: 40, size: 4.6, color: 'white', in: 2.8 },
          { id: 'l3', kind: 'text', text: '١ دقيقة = ٦٠ ثانية', x: 50, y: 52, size: 4.6, color: 'white', in: 4 },
          { id: 'axis', kind: 'arrow', from: [20, 78], to: [82, 78], color: 'white', in: 5.6 },
          { id: 'j1', kind: 'arrow', from: [24, 75], to: [38, 75], curve: -5, color: '#7be3a4', in: 6.4 },
          { id: 'j2', kind: 'arrow', from: [39, 75], to: [76, 75], curve: -8, color: '#7be3a4', in: 7.4 },
          { id: 'hl', kind: 'text', text: 'الساعة الكاملة', x: 38, y: 86, size: 3, color: '#7be3a4', in: 6.8 },
        ],
      },
    ],
  },
];

export default explainers;
