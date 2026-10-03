import type { Actor, Anim, Explainer, Scene, TextActor } from '../../../../explain/types';
import { keepNumberGroups, toArabicDigits } from '../../../../lib/digits';

/*
 * Explainers for lessons m12-2, m12-3, m13-1 (unit m4).
 * Equations on the stage are LTR text actors with Arabic-Indic digits and the decimal comma «,».
 * Negative numbers use «−» and are always written in LTR actors (inside Arabic labels the sign would jump to the other side).
 */

/* ---------- helpers ---------- */

/** −3 → «−٣», 0.21 → «٠,٢١» */
const n = (v: number) => (v < 0 ? '−' : '') + toArabicDigits(Math.round(Math.abs(v) * 1000) / 1000);

const fade = (t: number): Anim => ({ at: t, to: { opacity: 0 }, dur: 0.3 });

const tx = (id: string, text: string, x: number, y: number, inAt: number, size = 4, color = 'white', extra: Partial<TextActor> = {}): TextActor => ({
  id,
  kind: 'text',
  text,
  x,
  y,
  size,
  color,
  ltr: true,
  in: inAt,
  ...extra,
});

const dot = (id: string, x: number, y: number, inAt: number, color = 'sun', anim?: Anim[]): Actor => ({ id, kind: 'shape', shape: 'circle', x, y, w: 2.6, h: 4.2, color, in: inAt, anim });

/* ----- column calculations (lesson m12-2): ones | comma | tenths | hundredths, left → right ----- */
const O = 34;
const CM = 40;
const T = 46;
const H = 54;
const R1 = 32;
const R2 = 48;
const RES = 68;
const cd = (id: string, d: string, x: number, y: number, inAt: number, anim?: Anim[], color = 'white', size = 7): TextActor => tx(id, d, x, y, inAt, size, color, anim ? { anim } : {});
/** a whole row of a column sum: [ones, tenths, hundredths] */
const row = (p: string, digits: [string, string, string], y: number, inAt: number, color = 'white'): Actor[] => [
  cd(`${p}o`, digits[0], O, y, inAt, undefined, color),
  cd(`${p}c`, ',', CM, y, inAt, undefined, color),
  cd(`${p}t`, digits[1], T, y, inAt, undefined, color),
  cd(`${p}h`, digits[2], H, y, inAt, undefined, color),
];
const sumFrame = (sign: string, inAt = 0): Actor[] => [
  cd('sign', sign, 24, R2, inAt),
  { id: 'bar', kind: 'shape', shape: 'rect', x: 40, y: 57, w: 40, h: 0.7, color: 'white', in: inAt },
];
/** outline that walks over the columns: hundredths → tenths → ones */
const colRing = (times: [number, number, number], end: number): Actor => ({
  id: 'ring',
  kind: 'shape',
  shape: 'pill',
  x: H,
  y: 50,
  w: 7,
  h: 50,
  color: 'sun',
  outline: true,
  in: times[0],
  anim: [{ at: times[1], to: { x: T }, dur: 0.6 }, { at: times[2], to: { x: O }, dur: 0.6 }, fade(end)],
});

/* ----- magic square (lesson m12-2) ----- */
const MX = [20, 32, 44];
const MY = [30, 49, 68];
const MAGIC = [
  ['٠,٦', '٠,١', '٠,٨'],
  ['٠,٧', '٠,٥', '٠,٣'],
  ['٠,٢', '٠,٩', '٠,٤'],
];
const magicCells = (): Actor[] =>
  MY.flatMap((y, r) => MX.map((x, c): Actor => ({ id: `cell${r}${c}`, kind: 'shape', shape: 'rect', x, y, w: 11, h: 17.6, color: 'rgba(255,200,61,0.16)' })));
const magicNum = (r: number, c: number, inAt: number, color = 'white', anim?: Anim[]): Actor => tx(`m${r}${c}`, MAGIC[r][c], MX[c], MY[r], inAt, 3.8, color, anim ? { anim } : {});

/* ----- number lines on the board ----- */
interface HLine {
  X: (v: number) => number;
  y: number;
  actors: Actor[];
}
/** horizontal chalk number line (x0 → x1); `labels` written under it */
function hLine(p: string, min: number, max: number, step: number, y: number, labels: number[], inAt = 0, x0 = 12, x1 = 88): HLine {
  const X = (v: number) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  const count = Math.round((max - min) / step);
  const actors: Actor[] = [{ id: `${p}L`, kind: 'shape', shape: 'rect', x: (x0 + x1) / 2, y, w: x1 - x0 + 4, h: 0.6, color: 'white', in: inAt }];
  for (let i = 0; i <= count; i++) {
    const v = min + i * step;
    const major = labels.some((l) => Math.abs(l - v) < 1e-9);
    actors.push({ id: `${p}t${i}`, kind: 'shape', shape: 'rect', x: X(v), y, w: Math.abs(v) < 1e-9 ? 0.6 : 0.3, h: major ? 6 : 3.4, color: Math.abs(v) < 1e-9 ? 'sun' : 'white', in: inAt });
  }
  labels.forEach((v, k) =>
    actors.push(tx(`${p}n${k}`, n(v), X(v), y + 7.5, inAt, 2.8, Math.abs(v) < 1e-9 ? 'sun' : v < 0 ? '#9cc7ff' : 'white')),
  );
  return { X, y, actors };
}

interface VLine {
  Y: (v: number) => number;
  x: number;
  actors: Actor[];
}
/** vertical chalk number line / thermometer scale through zero: positives up, negatives down */
function vLine(p: string, min: number, max: number, x: number, yTop: number, yBot: number, labelEvery = 1, inAt = 0): VLine {
  const Y = (v: number) => yBot - ((v - min) / (max - min)) * (yBot - yTop);
  const actors: Actor[] = [
    { id: `${p}up`, kind: 'shape', shape: 'rect', x: x + 0.5, y: (Y(max) + Y(0)) / 2, w: 2.4, h: Y(0) - Y(max) + 3, color: 'rgba(255,140,90,0.35)', in: inAt },
    { id: `${p}dn`, kind: 'shape', shape: 'rect', x: x + 0.5, y: (Y(min) + Y(0)) / 2, w: 2.4, h: Y(min) - Y(0) + 3, color: 'rgba(110,170,255,0.35)', in: inAt },
    { id: `${p}L`, kind: 'shape', shape: 'rect', x, y: (yTop + yBot) / 2, w: 0.5, h: yBot - yTop + 5, color: 'white', in: inAt },
  ];
  for (let v = min; v <= max; v++) {
    const zero = v === 0;
    const major = (v - min) % labelEvery === 0 || zero;
    actors.push({ id: `${p}t${v - min}`, kind: 'shape', shape: 'rect', x, y: Y(v), w: zero ? 5 : major ? 3 : 1.8, h: zero ? 0.9 : 0.5, color: zero ? 'sun' : 'white', in: inAt });
    if (major) actors.push(tx(`${p}n${v - min}`, n(v), x + 6, Y(v), inAt, 2.8, zero ? 'sun' : v < 0 ? '#9cc7ff' : '#ffb98a'));
  }
  return { Y, x, actors };
}

/** a jump arc above a horizontal line from a to b, with its label */
function arc(id: string, L: HLine, a: number, b: number, label: string, color: string, inAt: number, mag = 6): Actor[] {
  const xa = L.X(a);
  const xb = L.X(b);
  const yA = L.y - 3;
  return [
    { id, kind: 'arrow', from: [xa, yA], to: [xb, yA], curve: (b > a ? -1 : 1) * mag, color, in: inAt },
    tx(`${id}l`, label, (xa + xb) / 2, yA - mag - 5, inAt + 0.4, 3.2, color),
  ];
}

/* ----- gifts (lesson m12-3): أ on the right … هـ on the left ----- */
const GX = [82, 66, 50, 34, 18];
const GL = ['(أ)', '(ب)', '(ج)', '(د)', '(هـ)'];
const gifts = (y: number, inAt = 0, anim?: (i: number) => Anim[] | undefined): Actor[] =>
  GX.flatMap((x, i): Actor[] => [
    { id: `g${i}`, kind: 'emoji', emoji: '🎁', x, y, size: 9, in: inAt + i * 0.15, anim: anim?.(i) },
    { id: `gl${i}`, kind: 'text', text: GL[i], x, y: y - 14, size: 3.6, color: 'white', in: inAt + i * 0.15 },
  ]);
const pairPill = (id: string, a: number, label: string, y: number, inAt: number, anim?: Anim[]): Actor[] => [
  { id, kind: 'shape', shape: 'pill', x: (GX[a] + GX[a + 1]) / 2, y, w: 26, h: 10, color: 'sun', outline: true, in: inAt, anim },
  { id: `${id}t`, kind: 'text', text: label, x: (GX[a] + GX[a + 1]) / 2, y, size: 3.2, color: 'sun', in: inAt, anim },
];
const price = (i: number, v: string, y: number, inAt: number, anim?: Anim[]): Actor => ({ id: `pr${i}`, kind: 'text', text: v, x: GX[i], y, size: 4.2, box: true, color: 'sun', in: inAt, anim });

/* ===================================================================== */
const raw: Explainer[] = [
  {
    lesson: 'm12-2',
    title: 'العمليات على الأعداد العشرية',
    scenes: [
      {
        title: 'المربع السحري',
        say: 'في المربع السحري مجموع كل صف وكل عمود وكل قطر ١,٥. نستخدم الأعداد من ٠,١ إلى ٠,٩ مرة واحدة. هل تستطيعين إكماله؟',
        duration: 11,
        bg: 'board',
        actors: [
          ...magicCells(),
          magicNum(0, 0, 0.6, 'sun'),
          magicNum(1, 1, 0.9, 'sun'),
          magicNum(2, 2, 1.2, 'sun'),
          ...[0, 1, 2].map((k): Actor => ({ id: `dg${k}`, kind: 'shape', shape: 'rect', x: MX[k], y: MY[k], w: 11, h: 17.6, color: 'sun', outline: true, in: 2.2 + k * 0.3 })),
          tx('eq', '٠,٦ + ٠,٥ + ٠,٤ = ١,٥', 74, 32, 3, 3.8, 'sun', { anim: [{ at: 3.6, effect: 'glow' }] }),
          { id: 'sum', kind: 'text', text: 'المجموع دائمًا ١,٥', x: 74, y: 48, size: 3.4, box: true, color: 'sun', in: 4.4 },
          { id: 'ask', kind: 'text', text: 'أكملي المربع؟ 🔮', x: 74, y: 66, size: 3.6, box: true, color: 'accent', in: 7.2, anim: [{ at: 7.6, effect: 'pulse' }] },
          ...['٠,١', '٠,٢', '٠,٣', '٠,٤', '٠,٥', '٠,٦', '٠,٧', '٠,٨', '٠,٩'].map((v, i) => tx(`k${i}`, v, 14 + i * 9, 88, 5.2 + i * 0.15, 3, 'white')),
        ],
      },
      {
        title: 'الفاصلة تحت الفاصلة',
        say: 'نريد ٤,٥ + ٢,٦٨. انتبهي: لا نرتّب الأرقام من آخرها! نضع الفاصلتين تحت بعضهما، ثم نكتب ٤,٥ على صورة ٤,٥٠',
        duration: 11,
        bg: 'board',
        actors: [
          cd('a4', '٤', O + 8, R1, 0.4, [{ at: 2.8, effect: 'shake' }, { at: 4.2, to: { x: O }, dur: 1 }]),
          cd('ac', ',', CM + 8, R1, 0.4, [{ at: 2.8, effect: 'shake' }, { at: 4.2, to: { x: CM }, dur: 1 }]),
          cd('a5', '٥', T + 8, R1, 0.4, [{ at: 2.8, effect: 'shake' }, { at: 4.2, to: { x: T }, dur: 1 }]),
          ...row('b', ['٢', '٦', '٨'], R2, 1),
          ...sumFrame('+', 1),
          { id: 'x', kind: 'text', text: '✗', x: 68, y: R1, size: 7, color: 'red', in: 2.6, out: 4.2 },
          { id: 'line', kind: 'shape', shape: 'rect', x: CM, y: 40, w: 0.5, h: 36, color: 'sun', in: 5.4, anim: [{ at: 5.6, effect: 'pulse' }] },
          { id: 'lbl', kind: 'text', text: 'الفاصلتان تحت بعضهما', x: 40, y: 74, size: 3.2, box: true, color: 'sun', in: 5.8 },
          cd('z', '٠', H, R1, 7.4, [{ at: 7.6, effect: 'pulse' }], 'sun'),
          tx('same', '٤,٥ = ٤,٥٠', 78, 40, 8.2, 4.4, 'sun', { anim: [{ at: 8.6, effect: 'glow' }] }),
        ],
      },
      {
        title: 'نجمع من اليمين',
        say: 'نبدأ من اليمين: ٠ + ٨ = ٨. ثم ٥ + ٦ = ١١، نكتب ١ ونحمل ١. ثم ٤ + ٢ + ١ = ٧. الناتج ٧,١٨',
        duration: 12,
        bg: 'board',
        actors: [
          ...row('a', ['٤', '٥', '٠'], R1, 0),
          ...row('b', ['٢', '٦', '٨'], R2, 0),
          ...sumFrame('+'),
          colRing([0.6, 3.6, 6.8], 9.4),
          tx('s1', '٠ + ٨ = ٨', 76, 30, 1.2, 3.8),
          cd('rh', '٨', H, RES, 1.8, undefined, 'sun'),
          tx('s2', '٥ + ٦ = ١١', 76, 46, 3.8, 3.8),
          cd('rt', '١', T, RES, 4.6, undefined, 'sun'),
          cd('carry', '١', T, RES, 5.2, [{ at: 5.4, to: { x: O, y: 21 }, dur: 0.9 }], 'orange', 4.2),
          tx('s3', '٤ + ٢ + ١ = ٧', 76, 62, 7, 3.8),
          cd('ro', '٧', O, RES, 7.8, undefined, 'sun'),
          cd('rc', ',', CM, RES, 7.8, undefined, 'sun'),
          tx('res', '٤,٥ + ٢,٦٨ = ٧,١٨', 50, 86, 9, 4.4, 'sun', { box: true, anim: [{ at: 9.4, effect: 'glow' }] }),
        ],
      },
      {
        title: 'الطرح: نستلف',
        say: 'والطرح ٩,٤ − ٢,٣٨: نكتب ٩,٤٠. الصفر أصغر من ٨، فنستلف من الأجزاء من عشرة: ١٠ − ٨ = ٢. ثم ٣ − ٣ = ٠، و٩ − ٢ = ٧. الناتج ٧,٠٢',
        duration: 14,
        bg: 'board',
        actors: [
          cd('ao', '٩', O, R1, 0),
          cd('ac', ',', CM, R1, 0),
          cd('at', '٤', T, R1, 0, [{ at: 3.2, to: { opacity: 0.3 }, dur: 0.4 }]),
          cd('ah', '٠', H, R1, 0, [{ at: 1.8, effect: 'shake' }, { at: 3.6, to: { opacity: 0.3 }, dur: 0.4 }]),
          ...row('b', ['٢', '٣', '٨'], R2, 0),
          ...sumFrame('−'),
          colRing([1.4, 7, 9.2], 11),
          { id: 'lt', kind: 'text', text: '٠ أصغر من ٨', x: 76, y: 22, size: 3.2, box: true, color: 'orange', in: 2, out: 4.6 },
          cd('b3', '٣', T, 21, 3.4, undefined, 'orange', 4.2),
          cd('b10', '١٠', H, 21, 3.8, undefined, 'orange', 4.2),
          tx('s1', '١٠ − ٨ = ٢', 76, 34, 4.8, 3.8),
          cd('rh', '٢', H, RES, 5.6, undefined, 'sun'),
          tx('s2', '٣ − ٣ = ٠', 76, 50, 7.4, 3.8),
          cd('rt', '٠', T, RES, 8, [{ at: 8.2, effect: 'pulse' }], 'sun'),
          tx('s3', '٩ − ٢ = ٧', 76, 66, 9.4, 3.8),
          cd('ro', '٧', O, RES, 10, undefined, 'sun'),
          cd('rc', ',', CM, RES, 10, undefined, 'sun'),
          tx('res', '٩,٤ − ٢,٣٨ = ٧,٠٢', 50, 86, 11, 4.4, 'sun', { box: true, anim: [{ at: 11.4, effect: 'glow' }] }),
        ],
      },
      {
        title: 'انتبهي!',
        say: 'الناتج ٧,٠٢ وليس ٧,٢٠! في ٧,٠٢ لا يوجد أي جزء من عشرة، فنكتب صفرًا في منزلتها، والرقم ٢ في منزلة الأجزاء من مئة.',
        duration: 12,
        bg: 'board',
        actors: [
          ...[30, 54, 76].map((x, i): Actor => ({ id: `band${i}`, kind: 'shape', shape: 'rect', x, y: 58, w: 18, h: 50, color: i ? 'rgba(255,200,61,0.14)' : 'rgba(255,255,255,0.12)' })),
          { id: 'h0', kind: 'text', text: 'الآحاد', x: 30, y: 26, size: 2.6, color: 'white' },
          { id: 'h1', kind: 'text', text: 'أجزاء من عشرة', x: 54, y: 26, size: 2.6, color: 'white' },
          { id: 'h2', kind: 'text', text: 'أجزاء من مئة', x: 76, y: 26, size: 2.6, color: 'white' },
          cd('w0', '٧', 30, 44, 0.6, undefined, 'white'),
          cd('wc', ',', 42, 44, 0.6, undefined, 'white'),
          cd('w1', '٢', 54, 44, 0.6, [{ at: 2.2, effect: 'shake' }], 'white'),
          cd('w2', '٠', 76, 44, 0.6, [{ at: 2.2, effect: 'shake' }], 'white'),
          { id: 'wx', kind: 'text', text: '✗', x: 12, y: 44, size: 7, color: 'red', in: 1.8 },
          cd('r0', '٧', 30, 70, 4, undefined, 'sun'),
          cd('rc', ',', 42, 70, 4, undefined, 'sun'),
          cd('r1', '٠', 54, 70, 4, [{ at: 5.4, effect: 'pulse' }], 'sun'),
          cd('r2', '٢', 76, 70, 4, [{ at: 7.6, effect: 'pulse' }], 'sun'),
          { id: 'rv', kind: 'text', text: '✓', x: 12, y: 70, size: 7, color: 'good', in: 4.6 },
          tx('eq', '٩,٤ − ٢,٣٨ = ٧,٠٢', 50, 89, 9, 4, 'sun', { anim: [{ at: 9.4, effect: 'glow' }] }),
        ],
      },
      ((): Scene => {
        const L = hLine('nl', 4.5, 10, 0.5, 56, [5, 6, 7, 8, 9, 10], 0);
        return {
          title: 'نكمل إلى ١٠',
          say: 'ما العدد الذي نضيفه إلى ٤,٧٩ ليصبح الناتج ١٠؟ نقفز أولًا إلى أقرب عدد كامل: ٠,٢١ توصلنا إلى ٥، ثم ٥ توصلنا إلى ١٠. إذن نضيف ٥,٢١',
          duration: 14,
          bg: 'board',
          actors: [
            ...L.actors,
            dot('p', L.X(4.79), 56, 0.6),
            { id: 'pl', kind: 'text', text: '٤,٧٩', x: L.X(4.79) + 1, y: 73, size: 3.4, box: true, color: 'sun', in: 0.8 },
            { id: 'pa', kind: 'arrow', from: [L.X(4.79) + 1, 68], to: [L.X(4.79), 60], color: 'sun', in: 1 },
            dot('ten', L.X(10), 56, 1.2, 'good'),
            ...arc('j1', L, 4.79, 5, '+ ٠,٢١', 'orange', 3, 5),
            dot('five', L.X(5), 56, 3.8, 'orange', [{ at: 4, effect: 'pulse' }]),
            ...arc('j2', L, 5, 10, '+ ٥', '#7be3a4', 6, 14),
            tx('sum', '٥ + ٠,٢١ = ٥,٢١', 30, 85, 9, 3.8, 'sun', { box: true, anim: [{ at: 9.4, effect: 'glow' }] }),
            tx('chk', '٤,٧٩ + ٥,٢١ = ١٠ ✓', 72, 85, 11, 3.6, 'good', { box: true }),
          ],
        };
      })(),
      {
        title: 'نكمل المربع السحري',
        say: 'في الصف الأول ٠,٦ و٠,١ ومجموعهما ٠,٧. والمجموع يجب أن يكون ١,٥، و١,٥ − ٠,٧ = ٠,٨. وهكذا نكمل المربع كله بالجمع والطرح.',
        duration: 13,
        bg: 'board',
        actors: [
          ...magicCells(),
          magicNum(0, 0, 0, 'sun'),
          magicNum(1, 1, 0, 'sun'),
          magicNum(2, 2, 0, 'sun'),
          magicNum(0, 1, 0.8, 'white', [{ at: 1, effect: 'pulse' }]),
          { id: 'rowR', kind: 'shape', shape: 'pill', x: 32, y: 30, w: 40, h: 20, color: 'orange', outline: true, in: 1.6, out: 9.4 },
          tx('e1', '٠,٦ + ٠,١ = ٠,٧', 74, 28, 2.4, 3.8),
          tx('e2', '١,٥ − ٠,٧ = ٠,٨', 74, 42, 4.6, 3.8, 'sun'),
          magicNum(0, 2, 5.8, '#7be3a4', [{ at: 6.2, effect: 'glow' }]),
          magicNum(1, 0, 7.6, 'white'),
          magicNum(1, 2, 7.9, 'white'),
          magicNum(2, 0, 8.2, 'white'),
          magicNum(2, 1, 8.5, 'white'),
          { id: 'ok', kind: 'text', text: 'كل صف = ١,٥ ✓', x: 74, y: 62, size: 3.6, box: true, color: 'good', in: 9.6 },
          tx('r2', '٠,٧ + ٠,٥ + ٠,٣ = ١,٥', 74, 78, 10.2, 3.4, '#7be3a4'),
        ],
      },
      {
        title: 'الخلاصة',
        say: 'نضع الفواصل العشرية تحت بعضها ثم نجمع أو نطرح من اليمين. ويمكن إضافة صفر في آخر الجزء العشري: ٩,٤ = ٩,٤٠. وللإكمال إلى ١٠ نقفز إلى عدد كامل أولًا.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'b1', kind: 'text', text: 'الفواصل تحت بعضها', x: 66, y: 26, size: 4, box: true, color: 'sun', in: 0.4 },
          tx('b1e', '٤,٥٠ + ٢,٦٨', 24, 26, 1, 3.8, 'sun'),
          { id: 'b2', kind: 'text', text: 'صفر لا يغيّر القيمة', x: 66, y: 50, size: 4, box: true, color: 'good', in: 4.4 },
          tx('b2e', '٩,٤ = ٩,٤٠', 24, 50, 5, 3.8, '#7be3a4'),
          { id: 'b3', kind: 'text', text: 'الإكمال إلى ١٠', x: 66, y: 74, size: 4, box: true, color: 'accent', in: 8.4 },
          tx('b3e', '٤,٧٩ → ٥ → ١٠', 24, 74, 9, 3.8, 'white'),
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm12-3',
    title: 'تطبيقات على الأعداد العشرية',
    scenes: [
      {
        title: 'هدايا طيف',
        say: 'اشترت طيف خمس هدايا بمبلغ ٢٠ ريالًا. (أ) و(ب) معًا ٧ ريالات، و(ب) و(ج) ٦، و(ج) و(د) ٧، و(د) و(هـ) ٩. فما تكلفة كل هدية؟',
        duration: 13,
        bg: 'board',
        actors: [
          ...gifts(38, 0.3),
          ...pairPill('p0', 0, '٧ ريالات', 58, 2.4),
          ...pairPill('p1', 1, '٦ ريالات', 72, 3.8),
          ...pairPill('p2', 2, '٧ ريالات', 58, 5.2),
          ...pairPill('p3', 3, '٩ ريالات', 72, 6.6),
          { id: 'tot', kind: 'text', text: 'المجموع ٢٠ ريالًا 💰', x: 26, y: 88, size: 3.4, box: true, color: 'sun', in: 1.2 },
          { id: 'ask', kind: 'text', text: 'ما تكلفة كل هدية؟', x: 72, y: 88, size: 3.4, box: true, color: 'accent', in: 8.6, anim: [{ at: 9, effect: 'pulse' }] },
        ],
      },
      {
        title: 'نبدأ بالهدية (هـ)',
        say: 'كوني منظّمة! (أ) و(ب) ٧ ريالات، و(ج) و(د) ٧ ريالات، فالهدايا الأربع معًا ١٤ ريالًا. إذن (هـ) = ٢٠ − ١٤ = ٦ ريالات.',
        duration: 13,
        bg: 'board',
        actors: [
          ...gifts(34, 0, (i) => (i === 4 ? [{ at: 7.6, effect: 'bounce' }] : undefined)),
          ...pairPill('p0', 0, '٧ ريالات', 54, 1, [{ at: 1.4, effect: 'glow' }]),
          ...pairPill('p2', 2, '٧ ريالات', 54, 2.2, [{ at: 2.6, effect: 'glow' }]),
          tx('e1', '٧ + ٧ = ١٤', 50, 72, 3.8, 4.4),
          tx('e2', '٢٠ − ١٤ = ٦', 50, 86, 6.2, 4.4, 'sun'),
          price(4, '٦ ريالات', 76, 7.4, [{ at: 7.8, effect: 'glow' }]),
        ],
      },
      {
        title: 'الإجابات تتساقط',
        say: 'بعد (هـ) تتساقط الإجابات: (د) = ٩ − ٦ = ٣، و(ج) = ٧ − ٣ = ٤، و(ب) = ٦ − ٤ = ٢، و(أ) = ٧ − ٢ = ٥. للتحقّق: المجموع ٢٠',
        duration: 15,
        bg: 'board',
        actors: [
          ...gifts(32, 0),
          price(4, '٦', 50, 0),
          ...[
            { i: 3, rule: '(د) + (هـ) = ٩', eq: '٩ − ٦ = ٣', v: '٣' },
            { i: 2, rule: '(ج) + (د) = ٧', eq: '٧ − ٣ = ٤', v: '٤' },
            { i: 1, rule: '(ب) + (ج) = ٦', eq: '٦ − ٤ = ٢', v: '٢' },
            { i: 0, rule: '(أ) + (ب) = ٧', eq: '٧ − ٢ = ٥', v: '٥' },
          ].flatMap((s, k): Actor[] => {
            const t = 0.8 + k * 2.4;
            return [
              { id: `rule${k}`, kind: 'text', text: s.rule, x: 50, y: 66, size: 3.6, color: 'white', in: t, out: t + 2.2 },
              tx(`eq${k}`, s.eq, 50, 80, t + 0.6, 4.6, 'sun', { out: t + 2.2 }),
              price(s.i, s.v, 50, t + 1.4, [{ at: t + 1.6, effect: 'pulse' }]),
            ];
          }),
          tx('chk', '٥ + ٢ + ٤ + ٣ + ٦ = ٢٠ ✓', 50, 74, 10.8, 4.4, 'good', { box: true, anim: [{ at: 11.2, effect: 'glow' }] }),
        ],
      },
      {
        title: 'نحوّل الوحدات',
        say: 'نحتاج إلى تحويل القياسات: ١ كغم = ١ ٠٠٠ غم، و١ لتر = ١ ٠٠٠ مل، و١ كم = ١ ٠٠٠ م، و١ م = ١٠٠ سم. فالدلو الذي فيه ٢,٧٥ لتر يحوي ٢ ٧٥٠ مل.',
        duration: 15,
        bg: 'board',
        actors: [
          { id: 'c1', kind: 'text', text: '⚖️ ١ كغم = ١ ٠٠٠ غم', x: 72, y: 24, size: 3.2, box: true, color: 'sun', in: 0.6 },
          { id: 'c2', kind: 'text', text: '🧃 ١ لتر = ١ ٠٠٠ مل', x: 28, y: 24, size: 3.2, box: true, color: 'blue', in: 2 },
          { id: 'c3', kind: 'text', text: '🛣️ ١ كم = ١ ٠٠٠ م', x: 72, y: 42, size: 3.2, box: true, color: 'green', in: 3.4 },
          { id: 'c4', kind: 'text', text: '📏 ١ م = ١٠٠ سم', x: 28, y: 42, size: 3.2, box: true, color: 'orange', in: 4.8 },
          { id: 'bucket', kind: 'emoji', emoji: '🪣', x: 86, y: 70, size: 10, in: 7.4 },
          { id: 'from', kind: 'text', text: '٢,٧٥ لتر', x: 68, y: 70, size: 4.2, box: true, color: 'blue', in: 7.8 },
          { id: 'ar', kind: 'arrow', from: [58, 70], to: [42, 70], color: 'sun', in: 8.8 },
          tx('op', '× ١ ٠٠٠', 50, 62, 9, 3.4, 'sun'),
          { id: 'to', kind: 'text', text: '٢ ٧٥٠ مل', x: 30, y: 70, size: 4.2, box: true, color: 'good', in: 10, anim: [{ at: 10.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'الوحدة نفسها أولًا',
        say: 'اشترت حنان ٢ كغم من الطماطم، واستخدمت ٤٠٠ غم للحساء. نحوّل أولًا: ٢ كغم = ٢ ٠٠٠ غم. ثم نطرح: ٢ ٠٠٠ − ٤٠٠ = ١ ٦٠٠ غم.',
        duration: 13,
        bg: 'board',
        actors: [
          ...[
            [70, 30],
            [78, 30],
            [66, 40],
            [74, 40],
            [82, 40],
          ].map(([x, y], i): Actor => ({
            id: `t${i}`,
            kind: 'emoji',
            emoji: '🍅',
            x,
            y,
            size: 7,
            in: 0.3 + i * 0.15,
            anim: i < 2 ? [{ at: 6.4 + i * 0.4, to: { x: 26, y: 34, scale: 0.6 }, dur: 0.9 }, fade(7.6 + i * 0.4)] : undefined,
          })),
          { id: 'kg', kind: 'text', text: '٢ كغم', x: 74, y: 56, size: 4.2, box: true, color: 'red', in: 1, out: 4 },
          { id: 'g', kind: 'text', text: '٢ ٠٠٠ غم', x: 74, y: 56, size: 4.2, box: true, color: 'sun', in: 4, anim: [{ at: 4.3, effect: 'pulse' }] },
          tx('conv', '× ١ ٠٠٠', 74, 68, 3.2, 3.2, 'sun'),
          { id: 'pot', kind: 'emoji', emoji: '🍲', x: 26, y: 40, size: 13, in: 5.4 },
          { id: 'use', kind: 'text', text: '٤٠٠ غم', x: 26, y: 58, size: 4.2, box: true, color: 'orange', in: 5.8 },
          tx('eq', '٢ ٠٠٠ − ٤٠٠ = ١ ٦٠٠', 50, 84, 8.4, 4.6, 'sun', { anim: [{ at: 8.8, effect: 'glow' }] }),
        ],
      },
      {
        title: 'كم لعبة بريالين؟',
        say: 'سعر لعبة الألغاز ٠,٦٥٠ ريال، ومع جواهر ريالان. نجمع: ٣ ألعاب ثمنها ١,٩٥٠، أما ٤ ألعاب فأكثر من ٢. يتبقى ٢ − ١,٩٥٠ = ٠,٠٥٠ ريال، أي ٥٠ بيسة.',
        duration: 15,
        bg: 'board',
        actors: [
          { id: 'tag', kind: 'text', text: '🧩 ٠,٦٥٠ ريال', x: 74, y: 20, size: 3.6, box: true, color: 'sun', in: 0.3 },
          { id: 'wal', kind: 'text', text: '💵 ريالان', x: 28, y: 20, size: 3.6, box: true, color: 'good', in: 0.8 },
          ...['٠,٦٥٠', '١,٣٠٠', '١,٩٥٠ ✓', '٢,٦٠٠ ✗'].flatMap((v, i): Actor[] => {
            const t = 1.8 + i * 1.3;
            const y = 36 + i * 13;
            const bad = i === 3;
            return [
              { id: `pz${i}`, kind: 'emoji', emoji: '🧩', x: 86, y, size: 6, in: t, anim: bad ? [{ at: t + 0.6, effect: 'shake' }] : undefined },
              tx(`sum${i}`, v, 70, y, t + 0.2, 4, bad ? 'red' : i === 2 ? '#7be3a4' : 'white', bad ? { anim: [{ at: t + 0.6, effect: 'shake' }] } : {}),
            ];
          }),
          { id: 'three', kind: 'text', text: '٣ ألعاب', x: 30, y: 40, size: 4.4, box: true, color: 'accent', in: 7.4 },
          tx('left', '٢ − ١,٩٥٠ = ٠,٠٥٠', 30, 58, 9, 3.8, 'sun'),
          { id: 'bz', kind: 'text', text: '٠,٠٥٠ ريال = ٥٠ بيسة', x: 30, y: 76, size: 3.6, box: true, color: 'good', in: 11, anim: [{ at: 11.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'في المسائل الحياتية ننظّم الحل خطوة بخطوة، ونحوّل القياسات إلى الوحدة نفسها قبل الجمع أو الطرح. وفي الريال ثلاث منازل عشرية: ٠,٠٥٠ ريال = ٥٠ بيسة.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'i1', kind: 'emoji', emoji: '🎁', x: 84, y: 26, size: 8, in: 0.3 },
          { id: 'b1', kind: 'text', text: 'خطوة بعد خطوة', x: 56, y: 26, size: 4.2, box: true, color: 'sun', in: 0.6 },
          { id: 'i2', kind: 'emoji', emoji: '⚖️', x: 84, y: 50, size: 8, in: 3.6 },
          { id: 'b2', kind: 'text', text: 'الوحدة نفسها أولًا', x: 56, y: 50, size: 4.2, box: true, color: 'good', in: 3.9 },
          { id: 'i3', kind: 'emoji', emoji: '💰', x: 84, y: 74, size: 8, in: 7.2 },
          { id: 'b3', kind: 'text', text: '٠,٠٥٠ ريال = ٥٠ بيسة', x: 52, y: 74, size: 4.2, box: true, color: 'accent', in: 7.5, anim: [{ at: 8, effect: 'glow' }] },
          tx('s1', '١ كغم = ١ ٠٠٠ غم', 20, 38, 5, 2.8, '#ffe08a', { ltr: false }),
          tx('s2', '١ لتر = ١ ٠٠٠ مل', 20, 48, 5.3, 2.8, '#ffe08a', { ltr: false }),
          tx('s3', '١ كم = ١ ٠٠٠ م', 20, 58, 5.6, 2.8, '#ffe08a', { ltr: false }),
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm13-1',
    title: 'الأعداد الموجبة والأعداد السالبة',
    scenes: [
      {
        title: 'لغز الفرق',
        say: 'الفرق بين عددين هو ٣، وأحد العددين −٢. ماذا يمكن أن يكون العدد الآخر؟ لنتعرّف أولًا على الأعداد الأصغر من صفر.',
        duration: 10,
        bg: 'board',
        actors: [
          { id: 'think', kind: 'emoji', emoji: '🤔', x: 80, y: 44, size: 16, in: 0.2, anim: [{ at: 1, effect: 'float' }] },
          { id: 'd', kind: 'text', text: 'الفرق = ٣', x: 44, y: 28, size: 4.6, box: true, color: 'sun', in: 0.8 },
          { id: 'o', kind: 'text', text: 'أحد العددين', x: 52, y: 48, size: 4.2, color: 'white', in: 2.4 },
          tx('m2', '−٢', 30, 48, 2.6, 6, '#9cc7ff', { anim: [{ at: 3.2, effect: 'pulse' }] }),
          { id: 'q', kind: 'text', text: 'العدد الآخر؟', x: 44, y: 70, size: 4.6, box: true, color: 'accent', in: 4.4, anim: [{ at: 4.8, effect: 'pulse' }] },
          { id: 'snow', kind: 'emoji', emoji: '❄️', x: 16, y: 80, size: 7, in: 6.6, anim: [{ at: 7, effect: 'float' }] },
        ],
      },
      ((): Scene => {
        const V = vLine('v', -5, 5, 50, 18, 88, 1, 0);
        return {
          title: 'الصفر في المنتصف',
          say: 'هذا خط أعداد رأسي مثل ميزان الحرارة. فوق الصفر الأعداد الموجبة، وتحت الصفر الأعداد السالبة ونكتبها بالإشارة −. والصفر ليس موجبًا ولا سالبًا.',
          duration: 13,
          bg: 'board',
          actors: [
            ...V.actors,
            { id: 'pos', kind: 'text', text: 'الأعداد الموجبة ▲', x: 26, y: 32, size: 3.4, box: true, color: 'orange', in: 1.6 },
            { id: 'neg', kind: 'text', text: 'الأعداد السالبة ▼', x: 26, y: 74, size: 3.4, box: true, color: 'blue', in: 4.4 },
            { id: 'zero', kind: 'text', text: 'ليس موجبًا ولا سالبًا', x: 76, y: V.Y(0), size: 3, box: true, color: 'sun', in: 8 },
            dot('m', 50, V.Y(0), 1, 'red', [
              { at: 2, to: { y: V.Y(4) }, dur: 1.4 },
              { at: 4.6, to: { y: V.Y(-4) }, dur: 2 },
              { at: 7.2, to: { y: V.Y(0) }, dur: 1.2 },
              { at: 8.4, effect: 'pulse' },
            ]),
          ],
        };
      })(),
      ((): Scene => {
        const L = hLine('h', -5, 5, 1, 54, [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], 0);
        return {
          title: 'يسار الصفر ويمينه',
          say: 'وعلى خط الأعداد الأفقي: يسار الصفر الأعداد السالبة، ويمينه الأعداد الموجبة. هذه النقطة يسار الصفر بثلاثة أقسام، فهي −٣.',
          duration: 12,
          bg: 'board',
          actors: [
            { id: 'nb', kind: 'shape', shape: 'rect', x: (L.X(-5) + L.X(0)) / 2, y: 54, w: L.X(0) - L.X(-5), h: 5, color: 'rgba(110,170,255,0.3)', in: 1 },
            { id: 'pb', kind: 'shape', shape: 'rect', x: (L.X(0) + L.X(5)) / 2, y: 54, w: L.X(5) - L.X(0), h: 5, color: 'rgba(255,140,90,0.3)', in: 2.2 },
            ...L.actors,
            { id: 'nl', kind: 'text', text: '◀ السالبة', x: 31, y: 30, size: 3.6, box: true, color: 'blue', in: 1.2 },
            { id: 'pl', kind: 'text', text: 'الموجبة ▶', x: 69, y: 30, size: 3.6, box: true, color: 'orange', in: 2.4 },
            dot('p', L.X(-3), 54, 4.2, 'red', [{ at: 4.4, effect: 'pulse' }]),
            ...[0, -1, -2].flatMap((a, k) => arc(`j${k}`, L, a, a - 1, n(k + 1), 'sun', 5.4 + k * 0.9, 4)),
            tx('ans', '−٣', L.X(-3), 80, 8.6, 6, '#9cc7ff', { anim: [{ at: 9, effect: 'glow' }] }),
          ],
        };
      })(),
      ((): Scene => {
        const V = vLine('v', -5, 4, 46, 16, 88, 1, 0);
        const days: [string, number, number][] = [
          ['الاثنين', -2, 1],
          ['الثلاثاء', 1, 1.8],
          ['الأربعاء', 3, 2.6],
          ['الخميس', -4, 3.4],
        ];
        return {
          title: 'أيّ يوم كان الأبرد؟',
          say: 'درجات الحرارة الصغرى: الاثنين −٢، والثلاثاء ١، والأربعاء ٣، والخميس −٤. الأبرد هو الأدنى على الميزان: الخميس. كلما ابتعد العدد السالب عن الصفر صار أصغر.',
          duration: 14,
          bg: 'board',
          actors: [
            ...V.actors,
            ...days.flatMap(([d, v, t], i): Actor[] => [
              dot(`dd${i}`, 46, V.Y(v), t, v < 0 ? '#6fa8ff' : 'orange'),
              { id: `dl${i}`, kind: 'text', text: d, x: 26, y: V.Y(v), size: 3.2, box: true, color: v < 0 ? 'blue' : 'orange', in: t, anim: d === 'الخميس' ? [{ at: 6.4, effect: 'pulse' }] : undefined },
              { id: `da${i}`, kind: 'arrow', from: [34, V.Y(v)], to: [43.5, V.Y(v)], color: 'white', in: t + 0.2 },
            ]),
            { id: 'cold', kind: 'emoji', emoji: '🥶', x: 12, y: V.Y(-4), size: 6, in: 6 },
            { id: 'warm', kind: 'emoji', emoji: '☀️', x: 12, y: V.Y(3), size: 6, in: 6.4 },
            { id: 'ol', kind: 'text', text: 'من الأبرد', x: 76, y: 34, size: 3.4, color: 'white', in: 8 },
            tx('ord', '−٤ < −٢ < ١ < ٣', 76, 46, 8.4, 4, 'sun', { anim: [{ at: 8.8, effect: 'glow' }] }),
            { id: 'far', kind: 'text', text: 'أبعد عن الصفر = أصغر', x: 76, y: 66, size: 3, box: true, color: 'blue', in: 10.4 },
          ],
        };
      })(),
      ((): Scene => {
        const V = vLine('v', -10, 2, 50, 16, 88, 2, 0);
        return {
          title: 'تنخفض درجة الحرارة',
          say: 'في الساعة ٨ مساءً كانت درجة الحرارة −٢°س، ثم انخفضت ٦ درجات حتى منتصف الليل. الانخفاض نزول على الميزان: من −٢ ننزل ٦ أقسام فنصل إلى −٨°س.',
          duration: 14,
          bg: 'board',
          actors: [
            ...V.actors,
            { id: 'eve', kind: 'text', text: '٨ مساءً', x: 30, y: V.Y(-2), size: 3.2, box: true, color: 'orange', in: 0.6 },
            { id: 'night', kind: 'text', text: 'منتصف الليل 🌙', x: 26, y: V.Y(-8), size: 3.2, box: true, color: 'purple', in: 7.6 },
            dot('m', 50, V.Y(-2), 0.8, 'red', [{ at: 3, to: { y: V.Y(-8) }, dur: 3.6 }, { at: 7, effect: 'pulse' }]),
            { id: 'ar', kind: 'arrow', from: [64, V.Y(-2)], to: [64, V.Y(-8)], curve: -4, color: 'sun', in: 3 },
            { id: 'arl', kind: 'text', text: '٦ درجات ▼', x: 78, y: V.Y(-5), size: 3.2, color: 'sun', in: 3.4 },
            tx('eq', '−٢ − ٦ = −٨', 78, 82, 8.6, 4.2, 'sun', { box: true, anim: [{ at: 9, effect: 'glow' }] }),
          ],
        };
      })(),
      ((): Scene => {
        const V = vLine('v', -3, 5, 50, 16, 88, 1, 0);
        return {
          title: 'ترتفع درجة الحرارة',
          say: 'وفي الساعة ٨ صباحًا كانت −١°س، ثم ارتفعت ٤ درجات. الارتفاع صعود: نصعد ١ إلى الصفر، ثم ٣ أخرى، فتصبح ٣°س.',
          duration: 13,
          bg: 'board',
          actors: [
            ...V.actors,
            { id: 'sun', kind: 'emoji', emoji: '☀️', x: 84, y: 22, size: 9, in: 0.4, anim: [{ at: 1, effect: 'float' }] },
            { id: 'mor', kind: 'text', text: '٨ صباحًا', x: 30, y: V.Y(-1), size: 3.2, box: true, color: 'orange', in: 0.6 },
            dot('m', 50, V.Y(-1), 0.8, 'red', [
              { at: 2.6, to: { y: V.Y(0) }, dur: 1 },
              { at: 4, effect: 'pulse' },
              { at: 5.6, to: { y: V.Y(3) }, dur: 2 },
              { at: 8, effect: 'pulse' },
            ]),
            { id: 'a1', kind: 'arrow', from: [63, V.Y(-1)], to: [63, V.Y(0)], color: 'sun', in: 2.6 },
            tx('a1l', '١', 70, (V.Y(-1) + V.Y(0)) / 2, 3, 3.6, 'sun'),
            { id: 'a2', kind: 'arrow', from: [63, V.Y(0)], to: [63, V.Y(3)], color: '#7be3a4', in: 5.6 },
            tx('a2l', '٣', 70, (V.Y(0) + V.Y(3)) / 2, 6, 3.6, '#7be3a4'),
            { id: 'noon', kind: 'text', text: 'منتصف النهار', x: 28, y: V.Y(3), size: 3.2, box: true, color: 'good', in: 8 },
            tx('eq', '١ + ٣ = ٤', 84, 44, 9, 3.8, 'white'),
            tx('res', '٣°', 84, 62, 9.6, 5.5, 'sun', { box: true, anim: [{ at: 10, effect: 'glow' }] }),
          ],
        };
      })(),
      ((): Scene => {
        const L = hLine('h', -6, 3, 1, 56, [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3], 0);
        return {
          title: 'حلّ اللغز',
          say: 'نعود إلى اللغز: من −٢ نتحرّك ٣ أقسام إلى اليمين فنصل إلى ١، أو ٣ أقسام إلى اليسار فنصل إلى −٥. إذن العدد الآخر ١ أو −٥.',
          duration: 14,
          bg: 'board',
          actors: [
            ...L.actors,
            dot('p', L.X(-2), 56, 0.4, 'sun', [{ at: 0.8, effect: 'pulse' }]),
            ...[-2, -1, 0].flatMap((a, k) => arc(`r${k}`, L, a, a + 1, n(k + 1), '#7be3a4', 1.8 + k * 0.8, 4)),
            dot('pr', L.X(1), 56, 4.2, 'good'),
            tx('ar', '١', L.X(1), 80, 4.4, 5.5, '#7be3a4', { box: true }),
            ...[-2, -3, -4].flatMap((a, k) => arc(`l${k}`, L, a, a - 1, n(k + 1), 'orange', 6 + k * 0.8, 4)),
            dot('pl', L.X(-5), 56, 8.4, 'orange'),
            tx('al', '−٥', L.X(-5), 80, 8.6, 5.5, 'orange', { box: true }),
            { id: 'or', kind: 'text', text: 'أو', x: (L.X(-5) + L.X(1)) / 2, y: 80, size: 4.6, color: 'white', in: 10 },
          ],
        };
      })(),
      ((): Scene => {
        const V = vLine('v', -3, 3, 22, 20, 84, 1, 0);
        return {
          title: 'الخلاصة',
          say: 'العدد الموجب أكبر من صفر، والعدد السالب أصغر من صفر ونكتبه بالإشارة −. كلما ابتعد العدد السالب عن الصفر صار أصغر. والفرق بين عددين هو عدد الأقسام بينهما.',
          duration: 14,
          bg: 'board',
          actors: [
            ...V.actors,
            { id: 'b1', kind: 'text', text: 'موجب: أكبر من صفر ▲', x: 64, y: 22, size: 3.6, box: true, color: 'orange', in: 0.6 },
            { id: 'b2', kind: 'text', text: 'سالب: أصغر من صفر ▼', x: 64, y: 40, size: 3.6, box: true, color: 'blue', in: 3 },
            tx('b3', '−١٣ < −٧ < −٢', 64, 58, 6, 4.2, 'sun'),
            { id: 'b4', kind: 'text', text: 'الفرق = عدد الأقسام', x: 64, y: 78, size: 3.6, box: true, color: 'good', in: 9, anim: [{ at: 9.4, effect: 'glow' }] },
            dot('m', 22, V.Y(0), 0.6, 'red', [{ at: 1, to: { y: V.Y(2) }, dur: 1 }, { at: 3.2, to: { y: V.Y(-2) }, dur: 1.6 }, { at: 6, to: { y: V.Y(0) }, dur: 1 }]),
          ],
        };
      })(),
    ],
  },
];

/** Keep thousands groups such as «١ ٠٠٠» together and in order in right-to-left text (narration and labels). */
const explainers: Explainer[] = raw.map((e) => ({
  ...e,
  scenes: e.scenes.map((sc) => ({
    ...sc,
    say: keepNumberGroups(sc.say),
    actors: sc.actors.map((a) => (a.kind === 'text' ? { ...a, text: keepNumberGroups(a.text) } : a)),
  })),
}));

export default explainers;
