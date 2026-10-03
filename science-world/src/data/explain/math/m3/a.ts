import type { Actor, Anim, Explainer } from '../../../../explain/types';
import type { MathVisual, Point } from '../../../types';

/**
 * Math unit 3 (الهندسة): lessons m8-1, m8-2, m8-3 (book pp. ٤٠–٤٥).
 * Shapes, names and numbers come from the site lessons (src/data/math/unit3.ts) and the book transcript.
 */

/* ---------- helpers (positions are % of the stage) ---------- */

const MINT = '#3fb59a';
const ORANGE = '#ff8a3d';
const BLUE = '#5b8def';
const PINK = '#e8669a';
const PURPLE = '#9b5de5';
const RED = '#e04848';
const DIE = '#ff6b6b';

type GridV = Extract<MathVisual, { type: 'grid' }>;
/** A grid drawing (shapes / highlighted sides) as an actor. */
const grid = (id: string, v: Omit<GridV, 'type'>, x: number, y: number, w: number, inAt = 0, anim?: Anim[]): Actor => ({
  id,
  kind: 'math',
  math: { type: 'grid', ...v },
  x,
  y,
  w,
  in: inAt,
  anim,
});
/** Highlighted sides of a polygon (pairs of points). */
const sides = (pairs: [Point, Point][], color: string) => pairs.map(([from, to]) => ({ from, to, color }));

/** A square face of a net (16:10 stage → height = width × 1.6 so it looks square). */
const face = (id: string, x: number, y: number, inAt: number, color: string, size = 8.4, anim?: Anim[]): Actor => ({
  id,
  kind: 'shape',
  shape: 'rect',
  x,
  y,
  w: size,
  h: size * 1.6,
  color,
  in: inAt,
  anim,
});

/** The cube net used in the lesson (a cross): [col, row]. */
const CROSS: [number, number][] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [1, 2],
  [1, 3],
];

/* ---------- octagonal pyramid drawn on a grid (lesson 8-2, «لنستكشف») ---------- */
const APEX: Point = [5, 0.6];
const oct = (cx: number, cy: number, rx: number, ry: number): Point[] =>
  Array.from({ length: 8 }, (_, k) => {
    const a = ((22.5 + 45 * k) * Math.PI) / 180;
    return [+(cx + rx * Math.cos(a)).toFixed(2), +(cy + ry * Math.sin(a)).toFixed(2)] as Point;
  });
const BASE = oct(5, 7, 4.2, 1.3); // k0..k3 front (lower), k4..k7 back
const pyramid = (extraShapes: GridV['shapes'] = [], extraLines: GridV['lines'] = []): Omit<GridV, 'type'> => ({
  cols: 10,
  rows: 9,
  shapes: [{ points: [APEX, BASE[7], BASE[0], BASE[1], BASE[2], BASE[3], BASE[4]], color: BLUE }, ...(extraShapes ?? [])],
  lines: [
    ...[0, 1, 2, 3].map((k) => ({ from: APEX, to: BASE[k], color: '#1f2a4d' })),
    ...[0, 1, 2].map((k) => ({ from: BASE[k], to: BASE[k + 1], color: '#1f2a4d' })),
    { from: BASE[7], to: BASE[0], color: '#1f2a4d' },
    ...[4, 5, 6].map((k) => ({ from: BASE[k], to: BASE[k + 1], color: '#1f2a4d', dashed: true })),
    ...[5, 6].map((k) => ({ from: APEX, to: BASE[k], color: '#1f2a4d', dashed: true })),
    ...(extraLines ?? []),
  ],
});
const CUT = oct(5, 4.12, 2.31, 0.715);

/* ---------- die net (lesson 8-3, «لنستكشف») ---------- */
const DX = (c: number) => 24 + c * 10;
const DY = (r: number) => 30 + r * 16;
const dieFace = (id: string, c: number, r: number, inAt = 0): Actor => ({ id, kind: 'shape', shape: 'rect', x: DX(c), y: DY(r), w: 9.4, h: 15, color: DIE, in: inAt });
const pip = (id: string, c: number, r: number, t: string, inAt = 0, anim?: Anim[], col = 'white'): Actor => ({ id, kind: 'text', text: t, x: DX(c), y: DY(r), size: 6, color: col, in: inAt, anim });
const dieNet = (): Actor[] => [
  dieFace('f00', 0, 0),
  dieFace('f10', 1, 0, 0.1),
  dieFace('f11', 1, 1, 0.2),
  dieFace('f21', 2, 1, 0.3),
  dieFace('f31', 3, 1, 0.4),
  dieFace('f32', 3, 2, 0.5),
  pip('p2', 0, 0, '٢', 0.6),
  pip('p6', 1, 0, '٦', 0.6),
  pip('p3', 3, 1, '٣', 0.6),
];

const explainers: Explainer[] = [
  /* =================================================================== */
  {
    lesson: 'm8-1',
    title: 'تمييز المضلعات',
    scenes: [
      {
        title: 'نمط في جدار القلعة',
        say: 'على جدار قلعة الأشكال نمطٌ جميل: مربع كبير، وفي وسطه مربع صغير. كم مربعًا ترين؟ وكم زاوية قائمة؟ لكل شكل اسمٌ دقيق، فلنتعلّمه!',
        duration: 11,
        bg: 'paper',
        actors: [
          grid(
            'wall',
            {
              cols: 6,
              rows: 6,
              shapes: [
                { points: [[3, 0], [6, 3], [3, 6], [0, 3]], color: ORANGE },
                { points: [[3, 2], [4, 3], [3, 4], [2, 3]], color: MINT },
              ],
            },
            34,
            52,
            30,
            0.3,
          ),
          { id: 'castle', kind: 'emoji', emoji: '🏰', x: 74, y: 30, size: 13, in: 0.8, anim: [{ at: 1.2, effect: 'float' }] },
          { id: 'q1', kind: 'text', text: 'كم مربعًا؟', x: 74, y: 56, size: 3.8, box: true, color: 'accent', in: 3.5 },
          { id: 'q2', kind: 'text', text: 'كم زاوية قائمة؟', x: 74, y: 73, size: 3.8, box: true, color: 'orange', in: 5.5, anim: [{ at: 6, effect: 'pulse' }] },
        ],
      },
      {
        title: 'ما المضلّع؟',
        say: 'المضلّع شكل مغلق ثنائي الأبعاد، يتكوّن من ثلاثة أضلاع مستقيمة أو أكثر. مثل المثلث، والمضلّع الرباعي، والمضلّع الخماسي.',
        duration: 11,
        bg: 'paper',
        actors: [
          { id: 'p3', kind: 'math', math: { type: 'polygon', sides: 3, color: '#ffe08a' }, x: 76, y: 40, w: 18, in: 0.8 },
          { id: 'p4', kind: 'math', math: { type: 'polygon', sides: 4, color: '#b9ecdf' }, x: 50, y: 40, w: 18, in: 1.8 },
          { id: 'p5', kind: 'math', math: { type: 'polygon', sides: 5, color: '#9fc4ff' }, x: 24, y: 40, w: 18, in: 2.8 },
          { id: 'n3', kind: 'text', text: '٣ أضلاع', x: 76, y: 61, size: 3.6, color: 'ink', in: 1.2 },
          { id: 'n4', kind: 'text', text: '٤ أضلاع', x: 50, y: 61, size: 3.6, color: 'ink', in: 2.2 },
          { id: 'n5', kind: 'text', text: '٥ أضلاع', x: 24, y: 61, size: 3.6, color: 'ink', in: 3.2 },
          { id: 'c1', kind: 'text', text: 'مغلق ✓', x: 68, y: 80, size: 3.8, box: true, color: 'good', in: 4.6 },
          { id: 'c2', kind: 'text', text: 'أضلاع مستقيمة ✓', x: 34, y: 80, size: 3.8, box: true, color: 'good', in: 5.6, anim: [{ at: 6, effect: 'glow' }] },
        ],
      },
      {
        title: 'ليست مضلّعات',
        say: 'هذه الأشكال ليست مضلّعات: المكعب ثلاثي الأبعاد، والهلال أضلاعه منحنية، والحلزون منحنٍ وغير مغلق، والمستطيل الذي في ضلعه فجوة غير مغلق.',
        duration: 13,
        bg: 'paper',
        actors: [
          { id: 'cube', kind: 'emoji', emoji: '🧊', x: 82, y: 40, size: 12, in: 0.6 },
          { id: 'l1', kind: 'text', text: 'ثلاثي الأبعاد', x: 82, y: 61, size: 3, box: true, color: 'bad', in: 1.2 },
          { id: 'moon', kind: 'emoji', emoji: '🌙', x: 61, y: 40, size: 12, in: 3 },
          { id: 'l2', kind: 'text', text: 'أضلاع منحنية', x: 61, y: 72, size: 3, box: true, color: 'bad', in: 3.6 },
          { id: 'spiral', kind: 'emoji', emoji: '🌀', x: 39, y: 40, size: 12, in: 5.4 },
          { id: 'l3', kind: 'text', text: 'منحنٍ وغير مغلق', x: 39, y: 61, size: 3, box: true, color: 'bad', in: 6 },
          // a rectangle with a gap in its top side
          { id: 'gt1', kind: 'shape', shape: 'rect', x: 11.5, y: 30, w: 5, h: 1.4, color: '#8a5a2b', in: 7.8 },
          { id: 'gt2', kind: 'shape', shape: 'rect', x: 22.5, y: 30, w: 5, h: 1.4, color: '#8a5a2b', in: 7.8 },
          { id: 'gb', kind: 'shape', shape: 'rect', x: 17, y: 50, w: 17, h: 1.4, color: '#8a5a2b', in: 7.8 },
          { id: 'gl', kind: 'shape', shape: 'rect', x: 9, y: 40, w: 0.9, h: 21.4, color: '#8a5a2b', in: 7.8 },
          { id: 'gr', kind: 'shape', shape: 'rect', x: 25, y: 40, w: 0.9, h: 21.4, color: '#8a5a2b', in: 7.8 },
          { id: 'gap', kind: 'shape', shape: 'circle', x: 17, y: 30, w: 6, h: 9.6, color: 'red', outline: true, in: 8.6, anim: [{ at: 8.8, effect: 'pulse' }] },
          { id: 'l4', kind: 'text', text: 'غير مغلق', x: 17, y: 72, size: 3, box: true, color: 'bad', in: 8.6 },
          { id: 'no', kind: 'text', text: 'ليست مضلّعات ✗', x: 50, y: 87, size: 4.4, color: 'bad', in: 10, anim: [{ at: 10.3, effect: 'shake' }] },
        ],
      },
      {
        title: 'أزواج الأضلاع المتوازية',
        say: 'لنعدّ أزواج الأضلاع المتوازية. في هذا الشكل ضلعان متقابلان متوازيان فقط، فهو شبه منحرف. وهنا كلّ ضلعين متقابلين متوازيان، فهو متوازي أضلاع.',
        duration: 13,
        bg: 'paper',
        actors: [
          grid('trap', { cols: 6, rows: 4, shapes: [{ points: [[0, 1], [5, 1], [4, 3], [1, 3]], color: ORANGE }] }, 72, 42, 34, 0.3),
          grid(
            'trapH',
            { cols: 6, rows: 4, shapes: [{ points: [[0, 1], [5, 1], [4, 3], [1, 3]], color: ORANGE }], lines: sides([[[0, 1], [5, 1]], [[1, 3], [4, 3]]], RED) },
            72,
            42,
            34,
            2.2,
          ),
          { id: 'tc', kind: 'text', text: 'زوج واحد', x: 72, y: 68, size: 3.4, color: 'red', in: 3.4 },
          { id: 'tl', kind: 'text', text: 'شبه منحرف', x: 72, y: 82, size: 3.8, box: true, color: 'orange', in: 4.2 },
          grid('par', { cols: 6, rows: 4, shapes: [{ points: [[1, 3], [4, 3], [5, 1], [2, 1]], color: BLUE }] }, 28, 42, 34, 5.4),
          grid(
            'parH',
            {
              cols: 6,
              rows: 4,
              shapes: [{ points: [[1, 3], [4, 3], [5, 1], [2, 1]], color: BLUE }],
              lines: [...sides([[[2, 1], [5, 1]], [[1, 3], [4, 3]]], RED), ...sides([[[1, 3], [2, 1]], [[4, 3], [5, 1]]], PURPLE)],
            },
            28,
            42,
            34,
            7.4,
          ),
          { id: 'pc', kind: 'text', text: 'زوجان', x: 28, y: 68, size: 3.4, color: 'purple', in: 8.6 },
          { id: 'pl', kind: 'text', text: 'متوازي أضلاع', x: 28, y: 82, size: 3.8, box: true, color: 'blue', in: 9.4 },
        ],
      },
      {
        title: 'عائلة متوازي الأضلاع',
        say: 'المستطيل متوازي أضلاع كل زواياه قائمة. والمُعيّن متوازي أضلاع كل أضلاعه متطابقة. والمربع يجمع الصفتين: أضلاعه متطابقة وكل زواياه قائمة.',
        duration: 13,
        bg: 'paper',
        actors: [
          grid('rect', { cols: 6, rows: 4, shapes: [{ points: [[1, 1], [5, 1], [5, 3], [1, 3]], color: PINK }] }, 77, 42, 24, 0.4),
          { id: 'rn', kind: 'text', text: 'المستطيل', x: 77, y: 66, size: 3.8, box: true, color: PINK, in: 1 },
          { id: 'rp', kind: 'text', text: 'زواياه قائمة', x: 77, y: 80, size: 2.8, color: 'ink', in: 1.8 },
          grid('rh', { cols: 4, rows: 6, shapes: [{ points: [[2, 0], [4, 3], [2, 6], [0, 3]], color: BLUE }] }, 50, 40, 15, 3.6),
          { id: 'hn', kind: 'text', text: 'المُعيّن', x: 50, y: 66, size: 3.8, box: true, color: 'blue', in: 4.2 },
          { id: 'hp', kind: 'text', text: 'أضلاعه متطابقة', x: 50, y: 80, size: 2.8, color: 'ink', in: 5 },
          grid('sq', { cols: 4, rows: 4, shapes: [{ points: [[0.5, 0.5], [3.5, 0.5], [3.5, 3.5], [0.5, 3.5]], color: MINT }] }, 23, 40, 19, 7),
          { id: 'sn', kind: 'text', text: 'المربع', x: 23, y: 66, size: 3.8, box: true, color: 'good', in: 7.6, anim: [{ at: 8.2, effect: 'glow' }] },
          { id: 'sp', kind: 'text', text: 'الصفتان معًا', x: 23, y: 80, size: 2.8, color: 'ink', in: 8.4 },
        ],
      },
      {
        title: 'الطائرة الورقية',
        say: 'وهذا شكل الطائرة الورقية، ويسمّى الدالتون: كل ضلعين متجاورين فيه متطابقان. الضلعان العلويان متطابقان، والضلعان السفليان متطابقان.',
        duration: 12,
        bg: 'paper',
        actors: [
          grid('kite', { cols: 4, rows: 6, shapes: [{ points: [[2, 0], [4, 2], [2, 6], [0, 2]], color: PURPLE }] }, 66, 50, 22, 0.4),
          grid(
            'kiteU',
            { cols: 4, rows: 6, shapes: [{ points: [[2, 0], [4, 2], [2, 6], [0, 2]], color: PURPLE }], lines: sides([[[2, 0], [4, 2]], [[2, 0], [0, 2]]], ORANGE) },
            66,
            50,
            22,
            3,
          ),
          grid(
            'kiteL',
            {
              cols: 4,
              rows: 6,
              shapes: [{ points: [[2, 0], [4, 2], [2, 6], [0, 2]], color: PURPLE }],
              lines: [...sides([[[2, 0], [4, 2]], [[2, 0], [0, 2]]], ORANGE), ...sides([[[4, 2], [2, 6]], [[0, 2], [2, 6]]], MINT)],
            },
            66,
            50,
            22,
            6,
          ),
          { id: 'k', kind: 'emoji', emoji: '🪁', x: 88, y: 24, size: 9, in: 1, anim: [{ at: 1.4, effect: 'float' }] },
          { id: 'u', kind: 'text', text: 'ضلعان متطابقان', x: 28, y: 34, size: 3.6, box: true, color: 'orange', in: 3.4 },
          { id: 'l', kind: 'text', text: 'ضلعان متطابقان', x: 28, y: 56, size: 3.6, box: true, color: 'good', in: 6.4 },
          { id: 'r', kind: 'text', text: 'الطائرة الورقية 🪁', x: 28, y: 80, size: 4.2, box: true, color: 'purple', in: 8.4, anim: [{ at: 8.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'المسمّى الأكثر دقة',
        say: 'لنختر المسمّى الأكثر دقة لهذا الشكل: نعدّ الزوايا القائمة… ٢. ثم نعدّ أزواج الأضلاع المتوازية… زوج واحد فقط. إذن هو شبه منحرف.',
        duration: 13,
        bg: 'paper',
        actors: [
          grid('s', { cols: 6, rows: 5, shapes: [{ points: [[1, 4], [4, 4], [4, 2], [1, 1]], color: PINK }] }, 70, 46, 34, 0.3),
          { id: 'c1', kind: 'text', text: 'الزوايا القائمة: ٢', x: 28, y: 28, size: 3.6, box: true, color: 'red', in: 3.4 },
          grid(
            'sH',
            { cols: 6, rows: 5, shapes: [{ points: [[1, 4], [4, 4], [4, 2], [1, 1]], color: PINK }], lines: sides([[[1, 1], [1, 4]], [[4, 2], [4, 4]]], BLUE) },
            70,
            46,
            34,
            6,
          ),
          { id: 'ra1', kind: 'shape', shape: 'rect', x: 61.3, y: 55, w: 3, h: 4.8, color: 'red', outline: true, in: 2.4, anim: [{ at: 2.6, effect: 'pulse' }] },
          { id: 'ra2', kind: 'shape', shape: 'rect', x: 73.1, y: 55, w: 3, h: 4.8, color: 'red', outline: true, in: 2.8, anim: [{ at: 3, effect: 'pulse' }] },
          { id: 'c2', kind: 'text', text: 'أزواج متوازية: ١', x: 28, y: 46, size: 3.6, box: true, color: 'blue', in: 6.6 },
          { id: 'ar', kind: 'arrow', from: [28, 54], to: [28, 66], color: 'ink', in: 8.6 },
          { id: 'res', kind: 'text', text: 'شبه منحرف ✓', x: 28, y: 78, size: 5, box: true, color: 'accent', in: 9.2, anim: [{ at: 9.6, effect: 'glow' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'المضلّع شكل مغلق أضلاعه مستقيمة. ولنختار المسمّى الأكثر دقة للمضلّع الرباعي، نعدّ أزواج الأضلاع المتوازية والزوايا القائمة والأضلاع المتطابقة.',
        duration: 13,
        bg: 'paper',
        actors: [
          { id: 'def', kind: 'text', text: 'المضلّع: مغلق، أضلاعه مستقيمة', x: 50, y: 21, size: 4, box: true, color: 'accent', in: 0.3 },
          { id: 'h2', kind: 'text', text: 'زوجان', x: 85, y: 45, size: 3.6, box: true, color: 'blue', in: 2 },
          { id: 'n2', kind: 'text', text: 'متوازي الأضلاع • المستطيل • المُعيّن • المربع', x: 40, y: 45, size: 2.8, color: 'ink', in: 2.6 },
          { id: 'h1', kind: 'text', text: 'زوج واحد', x: 85, y: 61, size: 3.6, box: true, color: 'orange', in: 4.4 },
          { id: 'n1', kind: 'text', text: 'شبه المنحرف', x: 40, y: 61, size: 3.4, color: 'ink', in: 5 },
          { id: 'h0', kind: 'text', text: 'لا يوجد', x: 85, y: 77, size: 3.6, box: true, color: 'purple', in: 6.4 },
          { id: 'n0', kind: 'text', text: 'الطائرة الورقية 🪁', x: 40, y: 77, size: 3.4, color: 'ink', in: 7 },
          { id: 'tip', kind: 'text', text: 'أزواج الأضلاع المتوازية:', x: 82, y: 34, size: 2.6, color: 'grey', in: 1.4 },
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm8-2',
    title: 'الأشكال ثلاثية الأبعاد ومقاطعها',
    scenes: [
      {
        title: 'كيس فاطمة',
        say: 'وضعت فاطمة أشكالًا ثلاثية الأبعاد داخل كيس. أخذت كل زميلة شكلًا، ثم وصفته بعدد أوجهه وحوافه ورؤوسه.',
        duration: 10,
        bg: 'board',
        actors: [
          { id: 'bag', kind: 'emoji', emoji: '👜', x: 50, y: 56, size: 20, in: 0.2 },
          { id: 's1', kind: 'math', math: { type: 'solid', name: 'cube' }, x: 50, y: 56, w: 15, in: 1.4, anim: [{ at: 1.6, to: { x: 20, y: 30 }, dur: 0.9 }] },
          { id: 's2', kind: 'math', math: { type: 'solid', name: 'triangularPrism' }, x: 50, y: 56, w: 15, in: 2.2, anim: [{ at: 2.4, to: { x: 80, y: 30 }, dur: 0.9 }] },
          { id: 's3', kind: 'math', math: { type: 'solid', name: 'squarePyramid' }, x: 50, y: 56, w: 15, in: 3, anim: [{ at: 3.2, to: { x: 20, y: 70 }, dur: 0.9 }] },
          { id: 's4', kind: 'math', math: { type: 'solid', name: 'triangularPyramid' }, x: 50, y: 56, w: 15, in: 3.8, anim: [{ at: 4, to: { x: 80, y: 70 }, dur: 0.9 }] },
          { id: 'q', kind: 'text', text: 'أوجه • حواف • رؤوس', x: 50, y: 88, size: 4, color: 'sun', in: 6, anim: [{ at: 6.4, effect: 'pulse' }] },
        ],
      },
      {
        title: 'الوجه والحافة والرأس',
        say: 'الوجه سطح مستوٍ. والحافة خط يلتقي فيه وجهان. والرأس نقطة تلتقي فيها الحواف. للمكعب ٦ أوجه، و١٢ حافة، و٨ رؤوس.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'cube', kind: 'math', math: { type: 'solid', name: 'cube' }, x: 30, y: 50, w: 36, in: 0.2 },
          { id: 'fh', kind: 'shape', shape: 'rect', x: 28.2, y: 58.3, w: 12, h: 19, color: 'rgba(255, 200, 61, 0.55)', in: 1.2, anim: [{ at: 1.4, effect: 'pulse' }] },
          { id: 'fl', kind: 'text', text: 'الوجه: سطح مستوٍ', x: 74, y: 26, size: 3.4, box: true, color: 'sun', in: 1 },
          { id: 'fa', kind: 'arrow', from: [58, 28], to: [33, 52], curve: -4, color: 'sun', in: 1.6 },
          { id: 'el', kind: 'text', text: 'الحافة: يلتقي فيها وجهان', x: 72, y: 46, size: 3.4, box: true, color: 'good', in: 3.6 },
          { id: 'ea', kind: 'arrow', from: [55, 46], to: [40.5, 42], color: '#7be3a4', in: 4.2 },
          { id: 'vd', kind: 'shape', shape: 'circle', x: 37.4, y: 71.3, w: 3, h: 4.8, color: 'red', in: 6, anim: [{ at: 6.3, effect: 'pulse' }] },
          { id: 'vl', kind: 'text', text: 'الرأس: تلتقي فيه الحواف', x: 72, y: 66, size: 3.4, box: true, color: 'red', in: 5.8 },
          { id: 'va', kind: 'arrow', from: [55, 68], to: [40, 71], color: 'red', in: 6.4 },
          { id: 'cnt', kind: 'text', text: '٦ أوجه • ١٢ حافة • ٨ رؤوس', x: 50, y: 88, size: 4, color: 'white', in: 8.8, anim: [{ at: 9.2, effect: 'glow' }] },
        ],
      },
      {
        title: 'المنشور',
        say: 'المنشور له وجهان متطابقان ومتوازيان، وجميع أوجهه الأخرى مستطيلة. المنشور الثلاثي له ٥ أوجه: مثلثان و٣ مستطيلات، و٩ حواف، و٦ رؤوس.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'pr', kind: 'math', math: { type: 'solid', name: 'triangularPrism' }, x: 30, y: 50, w: 38, in: 0.2 },
          { id: 't1', kind: 'shape', shape: 'circle', x: 26.5, y: 59, w: 4, h: 6.4, color: 'sun', in: 1.4, anim: [{ at: 1.6, effect: 'pulse' }] },
          { id: 't2', kind: 'shape', shape: 'circle', x: 40.5, y: 53, w: 4, h: 6.4, color: 'sun', in: 1.8, anim: [{ at: 2, effect: 'pulse' }] },
          { id: 'l1', kind: 'text', text: 'وجهان متطابقان ومتوازيان', x: 72, y: 24, size: 3.3, box: true, color: 'sun', in: 1 },
          { id: 'l2', kind: 'text', text: 'الأوجه الأخرى مستطيلة', x: 72, y: 40, size: 3.3, box: true, color: 'accent', in: 4.2 },
          { id: 'cnt', kind: 'text', text: '٥ أوجه • ٩ حواف • ٦ رؤوس', x: 72, y: 60, size: 3.6, color: 'white', in: 7.4 },
          { id: 'res', kind: 'text', text: 'منشور ثلاثي', x: 72, y: 80, size: 4.6, box: true, color: 'good', in: 9, anim: [{ at: 9.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'الهرم',
        say: 'الهرم له وجه واحد مضلّع، وجميع أوجهه الأخرى مثلثات تلتقي في أحد الرؤوس. الهرم الذي قاعدته مربعة له ٥ أوجه، و٨ حواف، و٥ رؤوس.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'py', kind: 'math', math: { type: 'solid', name: 'squarePyramid' }, x: 30, y: 52, w: 38, in: 0.2 },
          { id: 'top', kind: 'shape', shape: 'circle', x: 30, y: 33.5, w: 3, h: 4.8, color: 'red', in: 3.6, anim: [{ at: 3.8, effect: 'pulse' }] },
          { id: 'l1', kind: 'text', text: 'وجه واحد مضلّع', x: 72, y: 24, size: 3.4, box: true, color: 'sun', in: 1 },
          { id: 'l2', kind: 'text', text: 'الباقي مثلثات', x: 72, y: 40, size: 3.4, box: true, color: 'accent', in: 2.6 },
          { id: 'l3', kind: 'text', text: 'تلتقي في رأس واحد', x: 72, y: 56, size: 3.4, box: true, color: 'red', in: 3.6 },
          { id: 'ta', kind: 'arrow', from: [56, 54], to: [33, 35], curve: 4, color: 'red', in: 4 },
          { id: 'cnt', kind: 'text', text: '٥ أوجه • ٨ حواف • ٥ رؤوس', x: 72, y: 72, size: 3.6, color: 'white', in: 7.6 },
          { id: 'res', kind: 'text', text: 'هرم قاعدته مربعة', x: 72, y: 87, size: 4, box: true, color: 'good', in: 9.4, anim: [{ at: 9.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'أيّ شكل تقصد؟',
        say: 'قالت إحدى الزميلات: «شكل له ٦ حواف و٤ أوجه متطابقة». المكعب له ٦ أوجه، وأوجه المنشور الثلاثي غير متطابقة. إنه الهرم الثلاثي!',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'girl', kind: 'emoji', emoji: '🧕', x: 84, y: 24, size: 11, in: 0.2 },
          { id: 'say', kind: 'text', text: '«٦ حواف و٤ أوجه متطابقة»', x: 50, y: 24, size: 3.8, box: true, color: 'accent', in: 0.8 },
          { id: 'a', kind: 'math', math: { type: 'solid', name: 'cube' }, x: 76, y: 60, w: 18, in: 2.4, anim: [{ at: 5.6, to: { opacity: 0.3 }, dur: 0.5 }] },
          { id: 'b', kind: 'math', math: { type: 'solid', name: 'triangularPyramid' }, x: 50, y: 60, w: 18, in: 2.8, anim: [{ at: 9.6, to: { scale: 1.15 }, dur: 0.6 }] },
          { id: 'c', kind: 'math', math: { type: 'solid', name: 'triangularPrism' }, x: 24, y: 60, w: 18, in: 3.2, anim: [{ at: 7.4, to: { opacity: 0.3 }, dur: 0.5 }] },
          { id: 'ax', kind: 'text', text: '٦ أوجه ✗', x: 76, y: 82, size: 3.4, color: 'bad', in: 5.6 },
          { id: 'cx', kind: 'text', text: 'غير متطابقة ✗', x: 24, y: 82, size: 3.4, color: 'bad', in: 7.4 },
          { id: 'ok', kind: 'text', text: 'هرم ثلاثي ✓', x: 50, y: 86, size: 4.4, box: true, color: 'good', in: 9.8, anim: [{ at: 10.2, effect: 'glow' }] },
        ],
      },
      {
        title: 'نقطع الهرم الثماني',
        say: 'صنعت مها هرمًا ثمانيًا، قاعدته مضلّع ثماني. قطعته بالسكين بحرص موازيًا للقاعدة، فظهر على سطح القطع مضلّع ثماني. هذا هو المقطع العرضي.',
        duration: 13,
        bg: 'paper',
        actors: [
          grid('pyr', pyramid(), 30, 50, 38, 0.2),
          { id: 'pl', kind: 'text', text: 'هرم ثماني', x: 30, y: 87, size: 3.4, color: 'ink', in: 1 },
          { id: 'knife', kind: 'emoji', emoji: '🔪', x: 56, y: 46, size: 8, in: 3, anim: [{ at: 3.4, to: { x: 8 }, dur: 1.8 }, { at: 5.4, to: { opacity: 0 }, dur: 0.3 }] },
          grid('pyrCut', pyramid([{ points: CUT, color: ORANGE }], [{ from: [0.2, 4.12], to: [9.8, 4.12], color: RED, dashed: true }]), 30, 50, 38, 5.2),
          { id: 'ar', kind: 'arrow', from: [52, 47], to: [62, 47], color: 'orange', in: 6.6 },
          { id: 'sec', kind: 'math', math: { type: 'polygon', sides: 8, color: '#ffc49d' }, x: 77, y: 45, w: 22, in: 7.2 },
          { id: 'sl', kind: 'text', text: 'المقطع: مضلّع ثماني', x: 77, y: 74, size: 3.4, box: true, color: 'orange', in: 8.2, anim: [{ at: 8.6, effect: 'glow' }] },
        ],
      },
      {
        title: 'قطع من الرأس إلى القاعدة',
        say: 'وإذا قطعت مها الهرم رأسيًا من الرأس إلى القاعدة، يكون المقطع مثلثًا. إذن شكل المقطع العرضي يعتمد على اتجاه القطع.',
        duration: 12,
        bg: 'paper',
        actors: [
          grid('pyr', pyramid(), 30, 50, 38, 0.2),
          { id: 'knife', kind: 'emoji', emoji: '🔪', x: 30, y: 16, size: 8, in: 1, anim: [{ at: 1.4, to: { y: 80 }, dur: 1.8 }, { at: 3.4, to: { opacity: 0 }, dur: 0.3 }] },
          grid('pyrCut', pyramid([{ points: [APEX, BASE[3], BASE[7]], color: ORANGE }]), 30, 50, 38, 3.4),
          { id: 'ar', kind: 'arrow', from: [52, 47], to: [62, 47], color: 'orange', in: 4.6 },
          { id: 'sec', kind: 'math', math: { type: 'triangle', kind: 'isosceles', angles: ['', '', ''], color: '#ffc49d' }, x: 77, y: 45, w: 22, in: 5.2 },
          { id: 'sl', kind: 'text', text: 'المقطع: مثلث', x: 77, y: 72, size: 3.6, box: true, color: 'orange', in: 6, anim: [{ at: 6.4, effect: 'glow' }] },
          { id: 'tip', kind: 'text', text: 'الشكل يعتمد على اتجاه القطع', x: 64, y: 88, size: 3.4, color: 'accent', in: 8.4 },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'الوجه سطح مستوٍ، والحافة خط يلتقي فيه وجهان، والرأس نقطة تلتقي فيها الحواف. أوجه المنشور الأخرى مستطيلات، وأوجه الهرم الأخرى مثلثات.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'd1', kind: 'text', text: 'الوجه: سطح مستوٍ', x: 70, y: 22, size: 3.4, box: true, color: 'sun', in: 0.3 },
          { id: 'd2', kind: 'text', text: 'الحافة: يلتقي فيها وجهان', x: 70, y: 37, size: 3.4, box: true, color: 'good', in: 1.4 },
          { id: 'd3', kind: 'text', text: 'الرأس: تلتقي فيه الحواف', x: 70, y: 52, size: 3.4, box: true, color: 'red', in: 2.6 },
          { id: 'pr', kind: 'math', math: { type: 'solid', name: 'triangularPrism' }, x: 24, y: 28, w: 15, in: 5 },
          { id: 'prl', kind: 'text', text: 'منشور: + مستطيلات', x: 24, y: 46, size: 3, color: 'white', in: 5.4 },
          { id: 'py', kind: 'math', math: { type: 'solid', name: 'squarePyramid' }, x: 24, y: 64, w: 15, in: 7 },
          { id: 'pyl', kind: 'text', text: 'هرم: + مثلثات', x: 24, y: 83, size: 3, color: 'white', in: 7.4 },
          { id: 'cut', kind: 'text', text: '🔪 المقطع يعتمد على اتجاه القطع', x: 70, y: 74, size: 3.2, box: true, color: 'accent', in: 9.4, anim: [{ at: 9.8, effect: 'glow' }] },
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm8-3',
    title: 'الشبكات',
    scenes: [
      {
        title: 'نفكّ الصندوق',
        say: 'لو فككنا صندوقًا وفرَدناه على الأرض، ماذا نرى؟ شكلًا مسطّحًا ثنائي الأبعاد! هذا الشكل المسطّح اسمه الشبكة.',
        duration: 10,
        bg: 'board',
        actors: [
          { id: 'box', kind: 'emoji', emoji: '📦', x: 74, y: 46, size: 20, in: 0.2, anim: [{ at: 1, effect: 'wiggle' }] },
          { id: 'ar', kind: 'arrow', from: [60, 46], to: [42, 46], color: 'sun', in: 2.6 },
          ...CROSS.map(([c, r], i) => face(`n${i}`, 20 + c * 7, 22 + r * 11.2, 3.4 + i * 0.25, '#e8b878', 6.6)),
          { id: 'nl', kind: 'text', text: 'الشبكة', x: 27, y: 82, size: 4.6, box: true, color: 'sun', in: 6, anim: [{ at: 6.4, effect: 'glow' }] },
          { id: 'fl', kind: 'text', text: 'شكل مسطّح', x: 74, y: 76, size: 3.6, color: 'white', in: 5 },
        ],
      },
      {
        title: 'نفرد المكعب',
        say: 'انظري: نفتح المكعب ونفرد أوجهه… فنحصل على ٦ مربعات متطابقة متصلة. هذه شبكة المكعب، لأن للمكعب ٦ أوجه متطابقة.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'cube', kind: 'math', math: { type: 'solid', name: 'cube' }, x: 50, y: 46, w: 22, in: 0.2, out: 2.6 },
          ...CROSS.map(([c, r], i) =>
            face(`f${i}`, 50, 46, 2.6, MINT, 8.6, [{ at: 3.2 + i * 0.45, to: { x: 41 + c * 9, y: 24 + r * 14.4 }, dur: 0.9 }]),
          ),
          { id: 'six', kind: 'text', text: '٦ مربعات متطابقة', x: 78, y: 40, size: 3.6, box: true, color: 'good', in: 7.4 },
          { id: 'nl', kind: 'text', text: 'شبكة المكعب', x: 78, y: 58, size: 4.2, box: true, color: 'sun', in: 8.8, anim: [{ at: 9.2, effect: 'glow' }] },
        ],
      },
      {
        title: 'نطوي الشبكة',
        say: 'والآن نطوي الشبكة على خطوطها: يرتفع كل مربع ويلتقي بجاره، فيصبح كل جزء من الشبكة وجهًا. وها هو المكعب من جديد!',
        duration: 12,
        bg: 'board',
        actors: [
          ...CROSS.map(([c, r], i) => {
            const centre = c === 1 && r === 1;
            return face(`f${i}`, 41 + c * 9, 24 + r * 14.4, 0, MINT, 8.6, [
              { at: centre ? 6.2 : 2 + i * 0.7, to: { x: 50, y: 46, scale: 0.5, opacity: 0 }, dur: 0.9 },
            ]);
          }),
          { id: 'a1', kind: 'arrow', from: [32, 38], to: [44, 30], curve: -5, color: 'sun', in: 0.8 },
          { id: 'a2', kind: 'arrow', from: [68, 38], to: [56, 30], curve: 5, color: 'sun', in: 1 },
          { id: 'cube', kind: 'math', math: { type: 'solid', name: 'cube' }, x: 50, y: 46, w: 24, in: 6.8, anim: [{ at: 7.4, effect: 'glow' }] },
          { id: 'res', kind: 'text', text: 'كل جزء ← وجه', x: 50, y: 85, size: 4.4, box: true, color: 'sun', in: 8 },
        ],
      },
      {
        title: 'الأوجه المتقابلة',
        say: 'عند الطيّ لا تتلامس الأوجه المتقابلة أبدًا. في صفٍّ من ثلاثة مربعات متتالية، يصبح الأول والثالث وجهين متقابلين.',
        duration: 12,
        bg: 'board',
        actors: [
          face('c0', 34, 24, 0.2, BLUE, 8.6),
          face('c1', 25, 38.4, 0.2, ORANGE, 8.6),
          face('c2', 34, 38.4, 0.2, PINK, 8.6),
          face('c3', 43, 38.4, 0.2, ORANGE, 8.6),
          face('c4', 34, 52.8, 0.2, BLUE, 8.6),
          face('c5', 34, 67.2, 0.2, PINK, 8.6),
          { id: 'x', kind: 'text', text: 'المتقابلان لا يتلامسان', x: 74, y: 26, size: 3.6, box: true, color: 'sun', in: 1 },
          { id: 'o1', kind: 'arrow', from: [25, 31], to: [43, 31], curve: -6, color: 'sun', in: 3 },
          { id: 'o2', kind: 'arrow', from: [39.5, 24], to: [39.5, 52.8], curve: -6, color: '#9fc4ff', in: 5 },
          { id: 'o3', kind: 'arrow', from: [28.5, 38.4], to: [28.5, 67.2], curve: 6, color: '#ffb3cf', in: 7 },
          { id: 'r', kind: 'text', text: 'الأول والثالث متقابلان', x: 74, y: 48, size: 3.6, color: 'white', in: 4 },
          { id: 'c', kind: 'text', text: '٣ أزواج متقابلة', x: 74, y: 70, size: 4.2, box: true, color: 'good', in: 8.6, anim: [{ at: 9, effect: 'glow' }] },
        ],
      },
      {
        title: 'شبكة النرد',
        say: 'هذه شبكة نرد، ومجموع النقاط في كل وجهين متقابلين ٧. في الصف الأوسط ثلاثة مربعات متتالية، فالأول يقابل الوجه ٣: ٧ − ٣ = ٤',
        duration: 13,
        bg: 'board',
        actors: [
          ...dieNet(),
          pip('q11', 1, 1, '؟', 0.8, [{ at: 7.8, to: { opacity: 0 }, dur: 0.3 }]),
          pip('q21', 2, 1, '؟', 0.8),
          pip('q32', 3, 2, '؟', 0.8),
          { id: 'rule', kind: 'text', text: 'المتقابلان مجموعهما ٧', x: 77, y: 26, size: 3.4, box: true, color: 'sun', in: 1.8 },
          { id: 'row', kind: 'shape', shape: 'pill', x: 44, y: 46, w: 34, h: 19, color: 'sun', outline: true, in: 4.2 },
          { id: 'o', kind: 'arrow', from: [54, 40], to: [36, 40], curve: 6, color: 'sun', in: 5.4 },
          { id: 'p4', kind: 'text', text: '٤', x: DX(1), y: DY(1), size: 6, color: 'sun', in: 8, anim: [{ at: 8.3, effect: 'pulse' }] },
          { id: 'eq', kind: 'text', text: '٧ − ٣ = ٤', x: 77, y: 50, size: 5, color: 'white', ltr: true, in: 8.4, anim: [{ at: 8.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'نكمل النرد',
        say: 'عند الطيّ يقع المربع الأخير في الأسفل مقابل الوجه ٦: ٧ − ٦ = ١. والمربع الباقي يقابل الوجه ٢: ٧ − ٢ = ٥. اكتمل النرد!',
        duration: 13,
        bg: 'board',
        actors: [
          ...dieNet(),
          pip('p4', 1, 1, '٤', 0.6),
          pip('q21', 2, 1, '؟', 0.6, [{ at: 6.6, to: { opacity: 0 }, dur: 0.3 }]),
          pip('q32', 3, 2, '؟', 0.6, [{ at: 3, to: { opacity: 0 }, dur: 0.3 }]),
          { id: 'o1', kind: 'arrow', from: [DX(1) + 3, DY(0) - 4], to: [DX(3) + 3, DY(2) - 4], curve: -10, color: 'sun', in: 1.4 },
          pip('p1', 3, 2, '١', 3.2, [{ at: 3.5, effect: 'pulse' }], 'sun'),
          { id: 'e1', kind: 'text', text: '٧ − ٦ = ١', x: 78, y: 30, size: 4.6, color: 'white', ltr: true, in: 3.4 },
          { id: 'o2', kind: 'arrow', from: [DX(0), DY(0) + 5], to: [DX(2) - 2, DY(1) + 4], curve: 8, color: '#7be3a4', in: 5 },
          pip('p5', 2, 1, '٥', 6.8, [{ at: 7.1, effect: 'pulse' }], 'sun'),
          { id: 'e2', kind: 'text', text: '٧ − ٢ = ٥', x: 78, y: 48, size: 4.6, color: 'white', ltr: true, in: 7 },
          { id: 'die', kind: 'emoji', emoji: '🎲', x: 78, y: 72, size: 11, in: 9.4, anim: [{ at: 9.8, effect: 'bounce' }] },
          { id: 'done', kind: 'text', text: 'اكتمل النرد! 🎉', x: 50, y: 88, size: 4, box: true, color: 'good', in: 10 },
        ],
      },
      {
        title: 'لكل شكل شبكته',
        say: 'لكل شكل ثلاثي الأبعاد شبكته. مربع على كل ضلع منه مثلث يُطوى إلى هرم قاعدته مربعة. و٦ مستطيلات تُطوى إلى متوازي مستطيلات.',
        duration: 13,
        bg: 'paper',
        actors: [
          grid(
            'pn',
            {
              cols: 6,
              rows: 6,
              shapes: [
                { points: [[2, 2], [4, 2], [4, 4], [2, 4]], color: ORANGE },
                { points: [[2, 2], [4, 2], [3, 0]], color: MINT },
                { points: [[4, 2], [4, 4], [6, 3]], color: MINT },
                { points: [[2, 4], [4, 4], [3, 6]], color: MINT },
                { points: [[2, 2], [2, 4], [0, 3]], color: MINT },
              ],
            },
            74,
            36,
            22,
            0.4,
          ),
          { id: 'pa', kind: 'arrow', from: [74, 56], to: [74, 63], color: 'ink', in: 2.6 },
          { id: 'ps', kind: 'math', math: { type: 'solid', name: 'squarePyramid' }, x: 74, y: 73, w: 13, in: 3, anim: [{ at: 3.4, effect: 'pulse' }] },
          { id: 'pl', kind: 'text', text: 'هرم قاعدته مربعة', x: 74, y: 88, size: 3, box: true, color: 'orange', in: 3.6 },
          grid(
            'cn',
            {
              cols: 7,
              rows: 6,
              shapes: [
                { points: [[1, 0], [6, 0], [6, 1], [1, 1]], color: '#8fd3ff' },
                { points: [[1, 1], [6, 1], [6, 3], [1, 3]], color: '#8fd3ff' },
                { points: [[1, 3], [6, 3], [6, 4], [1, 4]], color: '#8fd3ff' },
                { points: [[1, 4], [6, 4], [6, 6], [1, 6]], color: '#8fd3ff' },
                { points: [[0, 1], [1, 1], [1, 3], [0, 3]], color: '#8fd3ff' },
                { points: [[6, 1], [7, 1], [7, 3], [6, 3]], color: '#8fd3ff' },
              ],
            },
            28,
            36,
            25,
            6,
          ),
          { id: 'ca', kind: 'arrow', from: [28, 56], to: [28, 63], color: 'ink', in: 8.4 },
          { id: 'cs', kind: 'math', math: { type: 'solid', name: 'cuboid' }, x: 28, y: 73, w: 13, in: 8.8, anim: [{ at: 9.2, effect: 'pulse' }] },
          { id: 'cl', kind: 'text', text: 'متوازي مستطيلات', x: 28, y: 88, size: 3, box: true, color: 'blue', in: 9.4 },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'الشبكة شكل مسطّح نطويه فيكوّن شكلًا ثلاثي الأبعاد، وكل جزء منها يصبح وجهًا. الأوجه المتقابلة لا تتلامس، وفي النرد مجموع كل وجهين متقابلين ٧.',
        duration: 13,
        bg: 'board',
        actors: [
          ...CROSS.map(([c, r], i) => face(`n${i}`, 14 + c * 6.4, 30 + r * 10.2, 0.2 + i * 0.15, MINT, 6)),
          { id: 'd1', kind: 'text', text: 'الشبكة: شكل مسطّح يُطوى', x: 60, y: 24, size: 3.6, box: true, color: 'sun', in: 1 },
          { id: 'd2', kind: 'text', text: 'كل جزء ← وجه', x: 60, y: 40, size: 3.6, box: true, color: 'good', in: 3.4 },
          { id: 'd3', kind: 'text', text: 'المتقابلان لا يتلامسان', x: 60, y: 56, size: 3.6, box: true, color: 'accent', in: 5.8 },
          { id: 'die', kind: 'emoji', emoji: '🎲', x: 84, y: 76, size: 9, in: 8, anim: [{ at: 8.4, effect: 'bounce' }] },
          { id: 'd4', kind: 'text', text: 'النرد: المتقابلان = ٧', x: 56, y: 76, size: 3.6, color: 'white', in: 8.2, anim: [{ at: 8.6, effect: 'glow' }] },
        ],
      },
    ],
  },
];

export default explainers;
