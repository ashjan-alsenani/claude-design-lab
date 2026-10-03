import type { Explainer } from '../../../../explain/types';

/** Benchmark explainer: lesson 1-2 «القلب». */
const explainers: Explainer[] = [
  {
    lesson: '1-2',
    title: 'القلب: مضخّة الجسم',
    scenes: [
      {
        title: 'اسمعي قلبكِ',
        say: 'ضعي يدكِ على صدركِ… هل تشعرين بدقّات قلبكِ؟ القلب يعمل طوال الوقت، حتى وأنتِ نائمة.',
        bg: 'body',
        actors: [
          { id: 'girl', kind: 'emoji', emoji: '🧍‍♀️', x: 30, y: 58, size: 30 },
          { id: 'hand', kind: 'emoji', emoji: '✋', x: 12, y: 80, size: 9, in: 0.6, anim: [{ at: 1, to: { x: 32, y: 56 }, dur: 1.2 }] },
          { id: 'heart', kind: 'emoji', emoji: '🫀', x: 68, y: 52, size: 22, in: 1.8, anim: [{ at: 2.2, effect: 'beat' }] },
          { id: 'dub1', kind: 'text', text: 'دُق', x: 84, y: 30, size: 6, color: 'red', in: 2.6, anim: [{ at: 2.6, effect: 'pulse' }] },
          { id: 'dub2', kind: 'text', text: 'دُق', x: 52, y: 28, size: 5, color: 'red', in: 3.1, anim: [{ at: 3.1, effect: 'pulse' }] },
        ],
      },
      {
        title: 'حجمه ومكانه',
        say: 'اضمّي قبضة يدكِ: هذا هو حجم قلبكِ تقريبًا. يوجد القلب داخل الصدر جهة اليسار قليلًا، وتحيط به الضلوع لتحميه.',
        bg: 'body',
        actors: [
          { id: 'body', kind: 'art', art: 'body', highlight: 'heart', x: 30, y: 54, w: 34, in: 0 },
          { id: 'fist', kind: 'emoji', emoji: '✊', x: 74, y: 40, size: 16, in: 0.8 },
          { id: 'eq', kind: 'text', text: '=', x: 74, y: 58, size: 7, in: 1.6 },
          { id: 'h', kind: 'emoji', emoji: '🫀', x: 74, y: 76, size: 16, in: 2, anim: [{ at: 2.4, effect: 'beat' }] },
          { id: 'a1', kind: 'arrow', from: [60, 30], to: [36, 47], curve: -6, color: 'red', in: 3.2 },
          { id: 'a1l', kind: 'text', text: 'جهة اليسار قليلًا', x: 58, y: 16, size: 3.4, box: true, color: 'red', in: 3.6 },
          { id: 'ribs', kind: 'text', text: '🦴 الضلوع تحميه', x: 30, y: 92, size: 3.8, box: true, color: 'sun', in: 5 },
        ],
      },
      {
        title: 'القلب مضخّة',
        say: 'القلب عضلة تعمل مثل المضخّة: في كل مرة تنقبض، تدفع الدم إلى جميع أنحاء الجسم. وهذه هي الدورة الدموية.',
        bg: 'body',
        actors: [
          { id: 'heart', kind: 'emoji', emoji: '🫀', x: 50, y: 52, size: 18, anim: [{ at: 0.4, effect: 'beat' }] },
          { id: 'brain', kind: 'emoji', emoji: '🧠', x: 50, y: 14, size: 10, in: 0.6 },
          { id: 'arm', kind: 'emoji', emoji: '💪', x: 14, y: 46, size: 10, in: 0.9 },
          { id: 'hand', kind: 'emoji', emoji: '✋', x: 86, y: 46, size: 10, in: 1.2 },
          { id: 'leg', kind: 'emoji', emoji: '🦵', x: 30, y: 88, size: 10, in: 1.5 },
          { id: 'foot', kind: 'emoji', emoji: '🦶', x: 70, y: 88, size: 10, in: 1.8 },
          { id: 'f1', kind: 'flow', path: [[50, 45], [50, 22]], color: 'red', count: 3, speed: 1.6, in: 2.2 },
          { id: 'f2', kind: 'flow', path: [[44, 52], [22, 47]], color: 'red', count: 3, speed: 1.6, in: 2.4 },
          { id: 'f3', kind: 'flow', path: [[56, 52], [78, 47]], color: 'red', count: 3, speed: 1.6, in: 2.6 },
          { id: 'f4', kind: 'flow', path: [[46, 60], [32, 80]], color: 'red', count: 3, speed: 1.6, in: 2.8 },
          { id: 'f5', kind: 'flow', path: [[54, 60], [68, 80]], color: 'red', count: 3, speed: 1.6, in: 3 },
          { id: 'pump', kind: 'text', text: 'ينقبض ← يدفع الدم', x: 79, y: 18, size: 3.4, box: true, color: 'red', in: 3.6 },
        ],
      },
      {
        title: 'للقلب جانبان',
        say: 'للقلب جانبان: الجانب الأيمن يضخّ الدم بدون أكسجين إلى الرئتين، وهناك يأخذ الدم الأكسجين، ثم يضخّه الجانب الأيسر إلى أنحاء الجسم.',
        duration: 13,
        bg: 'body',
        actors: [
          { id: 'heart', kind: 'art', art: 'heart', x: 50, y: 62, w: 30 },
          { id: 'lungs', kind: 'emoji', emoji: '🫁', x: 50, y: 17, size: 14, in: 1 },
          { id: 'blue', kind: 'flow', path: [[42, 62], [30, 40], [42, 20]], color: 'blue', count: 4, speed: 2.4, in: 1.6 },
          { id: 'red', kind: 'flow', path: [[58, 20], [70, 40], [58, 55]], color: 'red', count: 4, speed: 2.4, in: 4.5 },
          { id: 'body', kind: 'flow', path: [[62, 72], [80, 82], [94, 70]], color: 'red', count: 3, speed: 2, in: 7.5 },
          { id: 'l1', kind: 'text', text: 'دم بدون أكسجين', x: 18, y: 54, size: 3, box: true, color: 'blue', in: 2 },
          { id: 'l2', kind: 'text', text: 'دم يحمل الأكسجين', x: 82, y: 22, size: 3, box: true, color: 'red', in: 5 },
          { id: 'l3', kind: 'text', text: 'إلى أنحاء الجسم', x: 84, y: 92, size: 3.2, color: 'red', in: 8 },
        ],
      },
      {
        title: 'ماذا يحمل الدم؟',
        say: 'الدم يجري داخل الأوعية الدموية. يحمل الغذاء والأكسجين إلى كل أجزاء الجسم، ويحمل الفضلات إلى أعضاء تتخلّص منها، مثل الكليتين والرئتين.',
        duration: 12,
        bg: 'body',
        actors: [
          { id: 'vessel', kind: 'shape', shape: 'pill', x: 50, y: 50, w: 90, h: 22, color: '#ffd0c6' },
          { id: 'food', kind: 'flow', path: [[6, 46], [94, 46]], emoji: '🍎', count: 3, speed: 4, showPath: false, in: 0.8 },
          { id: 'o2', kind: 'flow', path: [[6, 54], [94, 54]], emoji: '🫧', count: 3, speed: 3.4, showPath: false, in: 1.6 },
          { id: 'cells', kind: 'text', text: 'إلى كل أجزاء الجسم ←', x: 50, y: 25, size: 3.8, box: true, color: 'green', in: 2.4 },
          { id: 'waste', kind: 'flow', path: [[94, 50], [70, 70], [40, 84]], emoji: '🗑️', count: 2, speed: 3, in: 5.5 },
          { id: 'kid', kind: 'art', art: 'kidneys', x: 30, y: 84, w: 14, in: 6 },
          { id: 'lung', kind: 'emoji', emoji: '🫁', x: 14, y: 86, size: 9, in: 6.4 },
          { id: 'w', kind: 'text', text: 'الفضلات ← الكليتان والرئتان', x: 62, y: 88, size: 3.4, box: true, color: 'grey', in: 6.8 },
        ],
      },
      {
        title: 'الجهاز الدوري',
        say: 'القلب والأوعية الدموية والدم معًا يكوّنون الجهاز الدوري.',
        bg: 'sky',
        actors: [
          { id: 'b1', kind: 'text', text: '🫀 القلب', x: 84, y: 36, size: 4, box: true, color: 'red', in: 0.4 },
          { id: 'p1', kind: 'text', text: '+', x: 70, y: 36, size: 5, in: 1 },
          { id: 'b2', kind: 'text', text: 'الأوعية الدموية', x: 50, y: 36, size: 4, box: true, color: 'red', in: 1.2 },
          { id: 'p2', kind: 'text', text: '+', x: 30, y: 36, size: 5, in: 1.8 },
          { id: 'b3', kind: 'text', text: '🩸 الدم', x: 16, y: 36, size: 4, box: true, color: 'red', in: 2 },
          { id: 'eq', kind: 'arrow', from: [50, 52], to: [50, 66], color: 'ink', in: 2.8 },
          { id: 'res', kind: 'text', text: 'الجهاز الدوري ✨', x: 50, y: 78, size: 6.5, box: true, color: 'accent', in: 3.4, anim: [{ at: 3.8, effect: 'glow' }] },
        ],
      },
    ],
  },
];

export default explainers;
