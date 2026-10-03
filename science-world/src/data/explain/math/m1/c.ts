import type { Actor, Explainer, TextActor } from '../../../../explain/types';

/*
 * Explainers for lessons m3-2, m4-1, m4-2, m4-3 (unit m1).
 * Equations on the stage are LTR text actors with Arabic-Indic digits and the decimal comma «,».
 */

/* ---------- helpers ---------- */

/** x position (stage %) of value v on a numberLine math actor centred at x with width w. */
const nlX = (x: number, w: number, min: number, max: number, v: number) => x - w / 2 + (w * (30 + ((v - min) / (max - min)) * 460)) / 520;
/** y position (stage %) of the line of a numberLine math actor centred at y with width w. */
const nlY = (y: number, w: number) => y - w * 0.2 + w * 0.4 * (80 / 130);

/** One big chalk digit (or comma / sign). */
const dg = (id: string, text: string, x: number, y: number, extra: Partial<TextActor> = {}): TextActor => ({
  id,
  kind: 'text',
  text,
  x,
  y,
  size: 7,
  color: 'white',
  ...extra,
});

/** Places the characters of a decimal number so that its comma sits at commaX. */
function placeNumber(prefix: string, str: string, commaX: number, y: number, step: number, half: number, extra: Partial<TextActor> = {}): TextActor[] {
  const [int, frac = ''] = str.split(',');
  const out: TextActor[] = [];
  [...int].forEach((c, i) => out.push(dg(`${prefix}i${i}`, c, commaX - half - step * (int.length - 1 - i), y, extra)));
  if (str.includes(',')) out.push(dg(`${prefix}c`, ',', commaX, y, extra));
  [...frac].forEach((c, i) => out.push(dg(`${prefix}f${i}`, c, commaX + half + step * i, y, extra)));
  return out;
}

/** Fade an actor away at time t (kept hidden until the scene ends). */
const fade = (t: number) => ({ at: t, to: { opacity: 0 }, dur: 0.3 });

/* Column layout for ١٢٥,٩ + ٩٣,٧ (lesson m4-1) */
const COL = { h: 30, t: 38, o: 46, c: 51, d: 56 };
const R1 = 30;
const R2 = 46;
const RR = 68;
const RC = 19;

function columnBase(): Actor[] {
  return [
    ...placeNumber('a', '١٢٥,٩', COL.c, R1, 8, 5),
    ...placeNumber('b', '٩٣,٧', COL.c, R2, 8, 5),
    dg('plus', '+', 20, R2, { color: 'sun' }),
    { id: 'line', kind: 'shape', shape: 'rect', x: 40, y: 57, w: 46, h: 1.2, color: 'white' },
  ];
}

/** A tall outline that frames the column being added. */
const colFrame = (x: number, extra: Partial<Actor> = {}): Actor =>
  ({ id: 'frame', kind: 'shape', shape: 'rect', x, y: 50, w: 7.5, h: 48, color: '#ffc83d', outline: true, ...extra }) as Actor;

/* Counters dealt into plates (lesson m4-2) */
const PLATES = [20, 40, 60, 80];
const PLATE_Y = 72;
const heapPos = (i: number): [number, number] => [26 + (i % 7) * 8, i < 7 ? 24 : 36];
const platePos = (i: number): [number, number] => {
  const p = i % 4;
  const k = Math.floor(i / 4);
  return [PLATES[p] + [-4, 4, 0][k], PLATE_Y + [-3, -3, 4][k]];
};
function plates(): Actor[] {
  return PLATES.map((x, i) => ({ id: `plate${i}`, kind: 'shape', shape: 'circle', x, y: PLATE_Y, w: 17, h: 27, color: '#ffffff' }) as Actor);
}
/** cookies: either in the heap, or already dealt (the first `dealt` ones are in plates). */
function cookies(dealt: number, extra: (i: number) => Partial<Actor> = () => ({})): Actor[] {
  return Array.from({ length: 14 }, (_, i) => {
    const [x, y] = i < dealt ? platePos(i) : heapPos(i);
    return { id: `c${i}`, kind: 'emoji', emoji: '🍪', x, y, size: 6, ...extra(i) } as Actor;
  });
}

/* Frog hops on a number line (lesson m4-3) */
function hops(id: string, x: number, w: number, min: number, max: number, values: number[], lineY: number, t0: number, gap: number, label: string, labelColor = 'sun', firstLabelOnly = false): Actor[] {
  const arcY = lineY - 2;
  const X = (v: number) => nlX(x, w, min, max, v);
  const frogY = lineY - 6;
  const anim = values.slice(1).flatMap((v, i) => {
    const a = values[i];
    const t = t0 + i * gap;
    return [
      { at: t, to: { x: (X(a) + X(v)) / 2, y: frogY - 9 }, dur: 0.3 },
      { at: t + 0.3, to: { x: X(v), y: frogY }, dur: 0.3 },
    ];
  });
  const arcs: Actor[] = values.slice(1).flatMap((v, i) => {
    const a = values[i];
    const t = t0 + i * gap + 0.6;
    const dir = v > a ? -1 : 1;
    const arc = [
      { id: `${id}-arc${i}`, kind: 'arrow', from: [X(a), arcY], to: [X(v), arcY], curve: dir * Math.min(7, Math.abs(X(v) - X(a)) / 2.4), color: labelColor, in: t } as Actor,
      { id: `${id}-lab${i}`, kind: 'text', text: label, x: (X(a) + X(v)) / 2, y: arcY - Math.min(13, Math.abs(X(v) - X(a)) / 1.2) - 3, size: 3, color: labelColor, ltr: true, in: t } as Actor,
    ];
    return firstLabelOnly && i > 0 ? arc.slice(0, 1) : arc;
  });
  return [{ id, kind: 'emoji', emoji: '🐸', x: X(values[0]), y: frogY, size: 7, in: t0 - 0.6, anim }, ...arcs];
}

const explainers: Explainer[] = [
  /* ================================================================== */
  {
    lesson: 'm3-2',
    title: 'حيل ذهنية للضرب',
    scenes: [
      {
        title: 'حقيقة نعرفها',
        say: 'هل يمكنكِ حساب ٧ × ١٨ في ذهنكِ؟ يبدو صعبًا! لكنكِ تعرفين حقيقة سهلة: ٧ × ٩ = ٦٣. ومنها نستنتج حقائق جديدة.',
        bg: 'board',
        duration: 10,
        actors: [
          { id: 'brain', kind: 'emoji', emoji: '🧠', x: 50, y: 30, size: 14, anim: [{ at: 0.5, effect: 'float' }] },
          { id: 'q', kind: 'text', text: '٧ × ١٨ = ؟', x: 50, y: 58, size: 6.5, color: 'white', ltr: true, in: 0.8, anim: [{ at: 1.2, effect: 'wiggle' }] },
          { id: 'fact', kind: 'text', text: '٧ × ٩ = ٦٣', x: 50, y: 80, size: 5, box: true, color: 'good', ltr: true, in: 4, anim: [{ at: 4.6, effect: 'glow' }] },
          { id: 'fl', kind: 'text', text: 'حقيقة نعرفها', x: 80, y: 80, size: 3.2, color: 'sun', in: 4.6 },
          { id: 'ar', kind: 'arrow', from: [50, 72], to: [50, 66], color: 'sun', in: 6.5 },
        ],
      },
      {
        title: 'الضعف',
        say: 'العدد ١٨ ضعف العدد ٩. إذا ضاعفنا عدد الأعمدة يتضاعف الناتج: ٦٣ + ٦٣ = ١٢٦، إذن ٧ × ١٨ = ١٢٦',
        bg: 'board',
        duration: 12,
        actors: [
          { id: 'arr1', kind: 'math', math: { type: 'array', rows: 7, cols: 9 }, x: 36, y: 42, w: 26 },
          { id: 'l1', kind: 'text', text: '٧ × ٩ = ٦٣', x: 36, y: 66, size: 3.6, color: 'white', ltr: true, in: 0.6 },
          { id: 'arr2', kind: 'math', math: { type: 'array', rows: 7, cols: 9 }, x: 36, y: 42, w: 26, in: 2, anim: [{ at: 2.4, to: { x: 64 }, dur: 1.2 }] },
          { id: 'l2', kind: 'text', text: '٧ × ٩ = ٦٣', x: 64, y: 66, size: 3.6, color: 'white', ltr: true, in: 3.8 },
          { id: 'x2', kind: 'text', text: '١٨ = ٩ + ٩', x: 50, y: 18, size: 3.8, color: 'sun', ltr: true, in: 4.4 },
          { id: 'res', kind: 'text', text: '٧ × ١٨ = ٦٣ + ٦٣ = ١٢٦', x: 50, y: 82, size: 4.6, box: true, color: 'good', ltr: true, in: 6.5, anim: [{ at: 7, effect: 'glow' }] },
        ],
      },
      {
        title: 'النصف',
        say: 'نعرف أن ٨ × ١٣ = ١٠٤. والعدد ٤ نصف العدد ٨، فنأخذ نصف الصفوف ويصبح الناتج نصف ١٠٤، أي ٥٢',
        bg: 'board',
        duration: 12,
        actors: [
          { id: 'top', kind: 'math', math: { type: 'array', rows: 4, cols: 13 }, x: 33, y: 36, w: 40 },
          { id: 'bot', kind: 'math', math: { type: 'array', rows: 4, cols: 13 }, x: 33, y: 60, w: 40, anim: [{ at: 4.5, to: { opacity: 0.18 }, dur: 1 }] },
          { id: 'f1', kind: 'text', text: '٨ × ١٣ = ١٠٤', x: 76, y: 30, size: 4.4, color: 'white', ltr: true, in: 0.8 },
          { id: 'cut', kind: 'shape', shape: 'rect', x: 33, y: 48, w: 46, h: 0.8, color: '#ffc83d', in: 3.5 },
          { id: 'half', kind: 'text', text: '٤ نصف ٨', x: 76, y: 48, size: 3.6, box: true, color: 'sun', in: 3.6 },
          { id: 'f2', kind: 'text', text: '٤ × ١٣ = ٥٢', x: 76, y: 66, size: 4.6, box: true, color: 'good', ltr: true, in: 6.5, anim: [{ at: 7, effect: 'glow' }] },
          { id: 'a', kind: 'arrow', from: [76, 36], to: [76, 41], color: 'sun', in: 3.6 },
          { id: 'a2', kind: 'arrow', from: [76, 54], to: [76, 59], color: 'sun', in: 6.2 },
        ],
      },
      {
        title: 'الضرب في ١٠',
        say: 'نعرف أن ٧ × ٣ = ٢١. فإذا صار ٧ سبعين، أي أكبر بعشر مرات، يصبح الناتج أكبر بعشر مرات أيضًا: ٧٠ × ٣ = ٢١٠',
        bg: 'board',
        duration: 12,
        actors: [
          // tokens placed right → left, the way the book prints «٧ × ٣ = ٢١»
          { id: 'a1', kind: 'text', text: '٧', x: 68, y: 34, size: 7, color: 'white', in: 0.4 },
          { id: 'x1', kind: 'text', text: '×', x: 58, y: 34, size: 6, color: 'white', in: 0.4 },
          { id: 'b1', kind: 'text', text: '٣', x: 50, y: 34, size: 7, color: 'white', in: 0.4 },
          { id: 'q1', kind: 'text', text: '=', x: 42, y: 34, size: 6, color: 'white', in: 0.4 },
          { id: 'r1', kind: 'text', text: '٢١', x: 31, y: 34, size: 7, color: 'white', in: 0.4 },
          { id: 'd1', kind: 'arrow', from: [68, 44], to: [68, 56], color: 'sun', in: 2.8 },
          { id: 'd1l', kind: 'text', text: '× ١٠', x: 80, y: 50, size: 4, color: 'sun', ltr: true, in: 3 },
          { id: 'a2', kind: 'text', text: '٧٠', x: 68, y: 66, size: 7, color: 'sun', in: 3.4 },
          { id: 'x2', kind: 'text', text: '×', x: 58, y: 66, size: 6, color: 'white', in: 3.6 },
          { id: 'b2', kind: 'text', text: '٣', x: 50, y: 66, size: 7, color: 'white', in: 3.6 },
          { id: 'q2', kind: 'text', text: '=', x: 42, y: 66, size: 6, color: 'white', in: 3.6 },
          { id: 'd2', kind: 'arrow', from: [31, 44], to: [31, 56], color: 'sun', in: 6 },
          { id: 'd2l', kind: 'text', text: '× ١٠', x: 19, y: 50, size: 4, color: 'sun', ltr: true, in: 6.2 },
          { id: 'r2', kind: 'text', text: '٢١٠', x: 31, y: 66, size: 7, color: 'sun', in: 6.6, anim: [{ at: 7, effect: 'pulse' }] },
          { id: 'ok', kind: 'text', text: '٧٠ × ٣ = ٢١٠', x: 50, y: 86, size: 4.4, box: true, color: 'good', ltr: true, in: 8 },
        ],
      },
      {
        title: 'عدد قريب من مضاعف ١٠',
        say: 'العدد ٢٩ قريب من ٣٠، و٣٠ من مضاعفات العدد ١٠. انظري: ٢٩ أقل من ٣٠ بواحد فقط.',
        bg: 'board',
        duration: 9,
        actors: [
          { id: 'nl', kind: 'math', math: { type: 'numberLine', min: 25, max: 35, step: 1, labelEvery: 5 }, x: 50, y: 46, w: 80 },
          { id: 'p29', kind: 'emoji', emoji: '🔵', x: nlX(50, 80, 25, 35, 29), y: nlY(46, 80), size: 3.4, in: 1 },
          { id: 'l29', kind: 'text', text: '٢٩', x: nlX(50, 80, 25, 35, 29) - 2.5, y: 39, size: 4.4, color: 'blue', in: 1 },
          { id: 'p30', kind: 'emoji', emoji: '🟢', x: nlX(50, 80, 25, 35, 30), y: nlY(46, 80), size: 3.4, in: 2.4, anim: [{ at: 2.8, effect: 'pulse' }] },
          { id: 'l30', kind: 'text', text: '٣٠', x: nlX(50, 80, 25, 35, 30) + 2.5, y: 39, size: 4.4, color: 'green', in: 2.4 },
          { id: 'eq', kind: 'text', text: '٢٩ = ٣٠ − ١', x: 50, y: 74, size: 5.5, color: 'white', ltr: true, in: 5 },
          { id: 'v', kind: 'text', text: 'قريب من مضاعف ١٠', x: 50, y: 88, size: 3.6, box: true, color: 'sun', in: 6 },
        ],
      },
      {
        title: 'نحسب ٢٩ × ٦',
        say: 'بدل ٢٩ نضرب ٣٠ × ٦ = ١٨٠. لكننا ضربنا ٦ زيادة، فنطرح ٦: ١٨٠ − ٦ = ١٧٤',
        bg: 'board',
        duration: 12,
        actors: [
          { id: 'q', kind: 'text', text: '٢٩ × ٦ = ؟', x: 50, y: 20, size: 5, color: 'white', ltr: true },
          { id: 's1', kind: 'text', text: '٣٠ × ٦ = ١٨٠', x: 50, y: 34, size: 5, color: 'sun', ltr: true, in: 1.2 },
          { id: 'nl', kind: 'math', math: { type: 'numberLine', min: 170, max: 180, step: 1, labelEvery: 2, jumps: [{ from: 180, to: 174, label: '−٦' }] }, x: 50, y: 60, w: 66, in: 4.5 },
          { id: 's2', kind: 'text', text: '١٨٠ − ٦ = ١٧٤', x: 50, y: 86, size: 5, box: true, color: 'good', ltr: true, in: 7, anim: [{ at: 7.5, effect: 'glow' }] },
        ],
      },
      {
        title: 'نجزّئ العدد',
        say: 'ولحساب ٤١ × ٥ نجزّئ ٤١ إلى ٤٠ و١. نضرب كل جزء في ٥: ٤٠ × ٥ = ٢٠٠ و١ × ٥ = ٥، ثم نجمع: ٢٠٥',
        bg: 'board',
        duration: 13,
        actors: [
          { id: 'n', kind: 'text', text: '٤١ × ٥', x: 50, y: 20, size: 6, color: 'white', ltr: true },
          { id: 'p40', kind: 'text', text: '٤٠', x: 50, y: 20, size: 6, box: true, color: 'blue', in: 1.4, anim: [{ at: 1.8, to: { x: 30, y: 42 }, dur: 1 }] },
          { id: 'p1', kind: 'text', text: '١', x: 50, y: 20, size: 6, box: true, color: 'orange', in: 1.4, anim: [{ at: 1.8, to: { x: 70, y: 42 }, dur: 1 }] },
          { id: 'e40', kind: 'text', text: '٤٠ × ٥ = ٢٠٠', x: 30, y: 60, size: 4.6, color: 'white', ltr: true, in: 4.5 },
          { id: 'e1', kind: 'text', text: '١ × ٥ = ٥', x: 70, y: 60, size: 4.6, color: 'white', ltr: true, in: 6.5 },
          { id: 'sum', kind: 'text', text: '٢٠٠ + ٥ = ٢٠٥', x: 50, y: 82, size: 5, box: true, color: 'good', ltr: true, in: 9, anim: [{ at: 9.5, effect: 'glow' }] },
        ],
      },
      {
        title: 'حيلنا الذهنية',
        say: 'من حقيقة نعرفها نستنتج حقائق جديدة: بالضعف، أو بالنصف، أو بالضرب في ١٠، أو بالتقريب إلى مضاعف ١٠ ثم التصحيح.',
        bg: 'board',
        duration: 11,
        actors: [
          { id: 't1', kind: 'text', text: '✌️ الضعف', x: 30, y: 26, size: 3.6, box: true, color: 'blue', in: 0.6 },
          { id: 'e1', kind: 'text', text: '٧ × ١٨ = ١٢٦', x: 30, y: 39, size: 3.8, color: 'white', ltr: true, in: 1 },
          { id: 't2', kind: 'text', text: '🍰 النصف', x: 70, y: 26, size: 3.6, box: true, color: 'orange', in: 2 },
          { id: 'e2', kind: 'text', text: '٤ × ١٣ = ٥٢', x: 70, y: 39, size: 3.8, color: 'white', ltr: true, in: 2.4 },
          { id: 't3', kind: 'text', text: 'الضرب في ١٠', x: 30, y: 60, size: 3.6, box: true, color: 'purple', in: 3.6 },
          { id: 'e3', kind: 'text', text: '٧٠ × ٣ = ٢١٠', x: 30, y: 73, size: 3.8, color: 'white', ltr: true, in: 4 },
          { id: 't4', kind: 'text', text: 'قريب من مضاعف ١٠', x: 70, y: 60, size: 3.6, box: true, color: 'good', in: 5.2 },
          { id: 'e4', kind: 'text', text: '٢٩ × ٦ = ١٨٠ − ٦', x: 70, y: 73, size: 3.8, color: 'white', ltr: true, in: 5.6 },
          { id: 'brain', kind: 'emoji', emoji: '🧠', x: 50, y: 88, size: 8, in: 7, anim: [{ at: 7.4, effect: 'glow' }] },
        ],
      },
    ],
  },

  /* ================================================================== */
  {
    lesson: 'm4-1',
    title: 'جمع الأعداد العشرية',
    scenes: [
      {
        title: 'حبلا فاطمة',
        say: 'لدى فاطمة حبلان: الأول طوله ٩٣,٧ مترًا، والآخر ١٢٥,٩ مترًا. إذا وصلناهما معًا، فكم يكون طولهما؟',
        bg: 'board',
        duration: 10,
        actors: [
          { id: 'rope', kind: 'emoji', emoji: '🪢', x: 50, y: 22, size: 10 },
          { id: 'b1', kind: 'shape', shape: 'pill', x: 30, y: 44, w: 30, h: 7, color: '#ffc83d', in: 0.8, anim: [{ at: 4.5, to: { x: 30, y: 66 }, dur: 1 }] },
          { id: 'l1', kind: 'text', text: '٩٣,٧ م', x: 30, y: 54, size: 4, color: 'white', in: 1, anim: [{ at: 4.5, to: { y: 57 }, dur: 1 }] },
          { id: 'b2', kind: 'shape', shape: 'pill', x: 60, y: 44, w: 40, h: 7, color: '#7fd3ff', in: 2, anim: [{ at: 4.5, to: { x: 65, y: 66 }, dur: 1 }] },
          { id: 'l2', kind: 'text', text: '١٢٥,٩ م', x: 64, y: 54, size: 4, color: 'white', in: 2.2, anim: [{ at: 4.5, to: { x: 65, y: 57 }, dur: 1 }] },
          { id: 'br', kind: 'shape', shape: 'rect', x: 47.5, y: 76, w: 70, h: 1, color: 'white', in: 5.8 },
          { id: 'q', kind: 'text', text: '؟ م', x: 47.5, y: 86, size: 5.5, color: 'sun', in: 6.2, anim: [{ at: 6.6, effect: 'pulse' }] },
        ],
      },
      {
        title: 'الفاصلة تحت الفاصلة',
        say: 'نكتب العددين عموديًّا بحيث تكون الفاصلة تحت الفاصلة، فيقع كل رقم تحت رقم من منزلته: الآحاد تحت الآحاد، والأجزاء من عشرة تحتها.',
        bg: 'board',
        duration: 12,
        actors: [
          ...placeNumber('a', '١٢٥,٩', COL.c, R1, 8, 5),
          // first written the wrong way (digits pushed one place left), then slid so the commas line up
          ...placeNumber('b', '٩٣,٧', COL.c - 8, R2, 8, 5, { in: 1 }).map((d) => ({ ...d, anim: [{ at: 4, to: { x: d.x + 8 }, dur: 1 }] })),
          dg('plus', '+', 20, R2, { color: 'sun', in: 1 }),
          { id: 'bad', kind: 'emoji', emoji: '❌', x: 78, y: 38, size: 7, in: 2, anim: [{ at: 2.2, effect: 'shake' }, fade(3.8)] },
          { id: 'cl', kind: 'shape', shape: 'rect', x: COL.c, y: 38, w: 0.6, h: 30, color: '#ffc83d', in: 5.4 },
          { id: 'good', kind: 'emoji', emoji: '✅', x: 78, y: 38, size: 7, in: 5.6 },
          { id: 'line', kind: 'shape', shape: 'rect', x: 40, y: 57, w: 46, h: 1.2, color: 'white', in: 6 },
          { id: 'hd', kind: 'text', text: 'آحاد', x: COL.o, y: 68, size: 2.8, color: 'sun', in: 7 },
          { id: 'hf', kind: 'text', text: 'أجزاء من عشرة', x: COL.d + 6, y: 78, size: 2.8, color: 'sun', in: 7.6 },
          { id: 'ha', kind: 'arrow', from: [COL.d + 4, 74], to: [COL.d, 62], color: 'sun', in: 7.6 },
        ],
      },
      {
        title: 'نبدأ من اليمين',
        say: 'نبدأ بالأجزاء من عشرة: ٩ + ٧ = ١٦. نكتب ٦ تحت الخط، ونحمل ١ إلى منزلة الآحاد.',
        bg: 'board',
        duration: 11,
        actors: [
          ...columnBase(),
          colFrame(COL.d, { in: 0.5, anim: [{ at: 0.8, effect: 'pulse' }] } as Partial<Actor>),
          { id: 'sum', kind: 'text', text: '٩ + ٧ = ١٦', x: 78, y: 38, size: 4.6, color: 'sun', ltr: true, in: 1.5 },
          dg('r6', '٦', COL.d, RR, { color: 'sun', in: 3.6 }),
          dg('k1', '١', 82, 38, { size: 4, color: 'sun', in: 5, anim: [{ at: 5.4, to: { x: COL.o, y: RC }, dur: 1.2 }] }),
          { id: 'n', kind: 'text', text: 'نكتب ٦ ونحمل ١', x: 76, y: 84, size: 3.4, box: true, color: 'sun', in: 6.5 },
        ],
      },
      {
        title: 'الفاصلة ثم الآحاد',
        say: 'ننزل الفاصلة تحت الفاصلة. ثم نجمع الآحاد مع الرقم المحمول: ٥ + ٣ + ١ = ٩',
        bg: 'board',
        duration: 10,
        actors: [
          ...columnBase(),
          dg('r6', '٦', COL.d, RR, { color: 'sun' }),
          dg('k1', '١', COL.o, RC, { size: 4, color: 'sun' }),
          dg('rc', ',', COL.c, R2, { color: 'sun', in: 0.6, anim: [{ at: 1, to: { y: RR }, dur: 1 }] }),
          colFrame(COL.o, { in: 3, anim: [{ at: 3.3, effect: 'pulse' }] } as Partial<Actor>),
          { id: 'sum', kind: 'text', text: '٥ + ٣ + ١ = ٩', x: 78, y: 38, size: 4.6, color: 'sun', ltr: true, in: 4 },
          dg('r9', '٩', COL.o, RR, { color: 'sun', in: 6 }),
        ],
      },
      {
        title: 'العشرات والمئات',
        say: 'العشرات: ٢ + ٩ = ١١، نكتب ١ ونحمل ١ إلى المئات. ثم المئات: ١ + ١ = ٢',
        bg: 'board',
        duration: 12,
        actors: [
          ...columnBase(),
          dg('r6', '٦', COL.d, RR, { color: 'sun' }),
          dg('rc', ',', COL.c, RR, { color: 'sun' }),
          dg('r9', '٩', COL.o, RR, { color: 'sun' }),
          dg('k1', '١', COL.o, RC, { size: 4, color: 'sun' }),
          colFrame(COL.t, { in: 0.5, anim: [{ at: 6, to: { x: COL.h }, dur: 0.8 }] } as Partial<Actor>),
          { id: 's1', kind: 'text', text: '٢ + ٩ = ١١', x: 78, y: 34, size: 4.6, color: 'sun', ltr: true, in: 1.2 },
          dg('r1', '١', COL.t, RR, { color: 'sun', in: 3 }),
          dg('k2', '١', 82, 34, { size: 4, color: 'sun', in: 4, anim: [{ at: 4.3, to: { x: COL.h, y: RC }, dur: 1.2 }] }),
          { id: 's2', kind: 'text', text: '١ + ١ = ٢', x: 78, y: 52, size: 4.6, color: 'sun', ltr: true, in: 7 },
          dg('r2', '٢', COL.h, RR, { color: 'sun', in: 8.6 }),
        ],
      },
      {
        title: 'الناتج',
        say: 'إذن ١٢٥,٩ + ٩٣,٧ = ٢١٩,٦. طول الحبلين معًا ٢١٩,٦ مترًا.',
        bg: 'board',
        duration: 8,
        actors: [
          ...columnBase(),
          ...placeNumber('r', '٢١٩,٦', COL.c, RR, 8, 5, { color: 'sun' }),
          dg('k1', '١', COL.o, RC, { size: 4, color: 'sun' }),
          dg('k2', '١', COL.h, RC, { size: 4, color: 'sun' }),
          { id: 'rope', kind: 'emoji', emoji: '🪢', x: 79, y: 40, size: 10, in: 1 },
          { id: 'res', kind: 'text', text: '٢١٩,٦ مترًا', x: 79, y: 66, size: 4.4, box: true, color: 'good', in: 1.8, anim: [{ at: 2.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'انتبهي!',
        say: 'في ٤,٦١ + ٠,٨ لا نضع ٨ تحت آخر رقم. نضع الفاصلة تحت الفاصلة، ونكتب صفرًا في المنزلة الفارغة: ٠,٨٠، فيكون الناتج ٥,٤١',
        bg: 'board',
        duration: 13,
        actors: [
          ...placeNumber('wa', '٤,٦١', 26, 28, 6, 3.5, { size: 5.5 }),
          ...placeNumber('wb', '٠,٨', 32, 42, 6, 3.5, { size: 5.5 }),
          dg('wp', '+', 12, 42, { size: 5, color: 'sun' }),
          { id: 'wl', kind: 'shape', shape: 'rect', x: 28, y: 51, w: 28, h: 1, color: 'white' },
          ...placeNumber('wr', '٤,٦٩', 26, 60, 6, 3.5, { size: 5.5, color: '#ff8a8a', in: 1.5 }),
          { id: 'wx', kind: 'emoji', emoji: '❌', x: 28, y: 78, size: 8, in: 2.5, anim: [{ at: 2.7, effect: 'shake' }] },
          { id: 'mid', kind: 'shape', shape: 'rect', x: 50, y: 52, w: 0.5, h: 70, color: 'rgba(255,255,255,0.4)' },
          ...placeNumber('ra', '٤,٦١', 72, 28, 6, 3.5, { size: 5.5, in: 4.5 }),
          ...placeNumber('rb', '٠,٨', 72, 42, 6, 3.5, { size: 5.5, in: 5 }),
          dg('rz', '٠', 72 + 3.5 + 6, 42, { size: 5.5, color: 'sun', in: 6.6, anim: [{ at: 7, effect: 'pulse' }] }),
          dg('rp', '+', 58, 42, { size: 5, color: 'sun', in: 5 }),
          { id: 'rl', kind: 'shape', shape: 'rect', x: 72, y: 51, w: 28, h: 1, color: 'white', in: 7.5 },
          ...placeNumber('rr', '٥,٤١', 72, 60, 6, 3.5, { size: 5.5, color: 'sun', in: 8.5 }),
          { id: 'rok', kind: 'emoji', emoji: '✅', x: 72, y: 78, size: 8, in: 9.5 },
        ],
      },
      {
        title: 'خطوات الجمع',
        say: 'لجمع الأعداد العشرية: نضع الفاصلة تحت الفاصلة، ونكتب صفرًا في المنزلة الفارغة إن احتجنا، ثم نجمع من اليمين ونحمل إلى المنزلة التالية.',
        bg: 'board',
        duration: 12,
        actors: [
          { id: 's1', kind: 'text', text: '١ الفاصلة تحت الفاصلة', x: 50, y: 28, size: 4, box: true, color: 'blue', in: 0.6 },
          { id: 's2', kind: 'text', text: '٢ صفر في المنزلة الفارغة', x: 50, y: 46, size: 4, box: true, color: 'orange', in: 3 },
          { id: 's3', kind: 'text', text: '٣ نجمع من اليمين ونحمل', x: 50, y: 64, size: 4, box: true, color: 'good', in: 5.5 },
          { id: 'eq', kind: 'text', text: '١٢٥,٩ + ٩٣,٧ = ٢١٩,٦', x: 50, y: 84, size: 5, color: 'sun', ltr: true, in: 8, anim: [{ at: 8.5, effect: 'glow' }] },
        ],
      },
    ],
  },

  /* ================================================================== */
  {
    lesson: 'm4-2',
    title: 'القسمة والباقي',
    scenes: [
      {
        title: 'نوزّع بالتساوي',
        say: 'لدينا ١٤ قطعة بسكويت، ونريد توزيعها على ٤ أطباق بالتساوي. كم قطعة في كل طبق؟ هذه قسمة: ١٤ ÷ ٤',
        bg: 'board',
        duration: 10,
        actors: [
          ...cookies(0, (i) => ({ in: 0.3 + i * 0.12 })),
          ...plates().map((p, i) => ({ ...p, in: 2.6 + i * 0.3 })),
          { id: 'q', kind: 'text', text: '١٤ ÷ ٤ = ؟', x: 50, y: 92, size: 4.4, color: 'sun', ltr: true, in: 5.5, anim: [{ at: 6, effect: 'pulse' }] },
        ],
      },
      {
        title: 'جولة بعد جولة',
        say: 'نضع قطعة في كل طبق، ثم جولة ثانية، ثم ثالثة. صار في كل طبق ٣ قطع.',
        bg: 'board',
        duration: 10,
        actors: [
          ...plates(),
          ...cookies(0, (i) => (i < 12 ? { anim: [{ at: 0.8 + i * 0.45, to: { x: platePos(i)[0], y: platePos(i)[1] }, dur: 0.4 }] } : {})),
          { id: 'r1', kind: 'text', text: 'الجولة ١', x: 88, y: 40, size: 3, color: 'sun', in: 0.8, anim: [fade(2.5)] },
          { id: 'r2', kind: 'text', text: 'الجولة ٢', x: 88, y: 40, size: 3, color: 'sun', in: 2.6, anim: [fade(4.3)] },
          { id: 'r3', kind: 'text', text: 'الجولة ٣', x: 88, y: 40, size: 3, color: 'sun', in: 4.4, anim: [fade(6.3)] },
          ...PLATES.map((x, i) => ({ id: `n${i}`, kind: 'text', text: '٣', x, y: 92, size: 4.4, color: 'sun', in: 6.8 + i * 0.2 }) as Actor),
        ],
      },
      {
        title: 'ما بقي هو الباقي',
        say: 'بقيت قطعتان. لا تكفيان لنضع قطعة أخرى في كل طبق، فهما الباقي. إذن ١٤ ÷ ٤ = ٣ والباقي ٢',
        bg: 'board',
        duration: 12,
        actors: [
          ...plates(),
          ...cookies(12).map((c, i) =>
            i === 12
              ? ({ ...c, x: 66, y: 30, anim: [{ at: 1, effect: 'pulse' }] } as Actor)
              : i === 13
                ? ({ ...c, x: 74, y: 30, anim: [{ at: 2.2, to: { x: 60, y: 56 }, dur: 0.8 }, { at: 3.3, effect: 'shake' }, { at: 4.4, to: { x: 74, y: 30 }, dur: 0.8 }] } as Actor)
                : c,
          ),
          { id: 'no', kind: 'text', text: 'لا تكفي ٤ أطباق', x: 70, y: 44, size: 3.2, box: true, color: 'bad', in: 3.4, anim: [fade(6.2)] },
          { id: 'eq', kind: 'text', text: '١٤ ÷ ٤ = ٣', x: 28, y: 26, size: 5, color: 'white', ltr: true, in: 6.5 },
          { id: 'rem', kind: 'text', text: 'الباقي ٢', x: 28, y: 42, size: 4.2, box: true, color: 'sun', in: 7.2, anim: [{ at: 7.7, effect: 'glow' }] },
          { id: 'lt', kind: 'text', text: '٢ < ٤', x: 70, y: 44, size: 4, color: 'sun', ltr: true, in: 9 },
        ],
      },
      {
        title: 'قسمة بدون باقٍ',
        say: 'أما ٢٥ ÷ ٥ فتوزيعها متساوٍ تمامًا: ٥ صفوف في كل صف ٥، ولا يبقى شيء. الباقي صفر.',
        bg: 'board',
        duration: 9,
        actors: [
          { id: 'arr', kind: 'math', math: { type: 'array', rows: 5, cols: 5 }, x: 34, y: 52, w: 30 },
          { id: 'eq', kind: 'text', text: '٢٥ ÷ ٥ = ٥', x: 74, y: 40, size: 5, color: 'white', ltr: true, in: 1.5 },
          { id: 'ok', kind: 'text', text: 'بدون باقٍ ✅', x: 74, y: 60, size: 4, box: true, color: 'good', in: 4, anim: [{ at: 4.5, effect: 'glow' }] },
        ],
      },
      {
        title: 'نتحقق',
        say: 'نتحقق بالضرب: ٣ قطع في كل طبق من ٤ أطباق تساوي ١٢، ثم نضيف الباقي: ١٢ + ٢ = ١٤. رجعنا إلى العدد نفسه!',
        bg: 'board',
        duration: 12,
        actors: [
          ...plates().map((p) => ({ ...p, y: 30 }) as Actor),
          ...Array.from({ length: 14 }, (_, i) => {
            const [x, y] = i < 12 ? [platePos(i)[0], platePos(i)[1] - (PLATE_Y - 30)] : [46 + (i - 12) * 8, 51];
            return { id: `c${i}`, kind: 'emoji', emoji: '🍪', x, y, size: 6, anim: i >= 12 ? [{ at: 5.5, effect: 'pulse' }] : undefined } as Actor;
          }),
          { id: 'ring', kind: 'shape', shape: 'pill', x: 50, y: 51, w: 17, h: 12, color: '#ffc83d', outline: true, in: 5.5 },
          { id: 'e1', kind: 'text', text: '٣ × ٤ = ١٢', x: 50, y: 64, size: 5, color: 'white', ltr: true, in: 1.5 },
          { id: 'e2', kind: 'text', text: '١٢ + ٢ = ١٤', x: 50, y: 78, size: 5, color: 'sun', ltr: true, in: 5.5 },
          { id: 'ok', kind: 'emoji', emoji: '✅', x: 74, y: 78, size: 7, in: 8, anim: [{ at: 8.4, effect: 'bounce' }] },
          { id: 'lab', kind: 'text', text: 'الناتج × ٤ + الباقي', x: 50, y: 91, size: 3, color: 'sun', in: 9 },
        ],
      },
      {
        title: 'ماذا نفعل بالباقي؟',
        say: 'يضع فيصل ٧٥ صورة في دفتر، والصفحة تتسع لـ ٦ صور. ٧٥ ÷ ٦ = ١٢ والباقي ٣. الصور الثلاث الباقية تحتاج صفحة أخرى، إذن ١٣ صفحة.',
        bg: 'board',
        duration: 13,
        actors: [
          ...Array.from({ length: 12 }, (_, i) => ({ id: `pg${i}`, kind: 'emoji', emoji: '📘', x: 14 + (i % 6) * 9, y: i < 6 ? 30 : 48, size: 6.5, in: 0.8 + i * 0.25 }) as Actor),
          { id: 'six', kind: 'text', text: '٦ صور في كل صفحة', x: 36, y: 62, size: 3, color: 'white', in: 3.5 },
          { id: 'eq', kind: 'text', text: '٧٥ ÷ ٦ = ١٢', x: 36, y: 76, size: 4.6, color: 'white', ltr: true, in: 4.5 },
          { id: 'rem', kind: 'text', text: 'الباقي ٣', x: 36, y: 89, size: 3.6, box: true, color: 'sun', in: 5.5 },
          { id: 'p13', kind: 'emoji', emoji: '📗', x: 80, y: 38, size: 12, in: 7.5, anim: [{ at: 8, effect: 'bounce' }] },
          { id: 'ph', kind: 'text', text: '🖼️🖼️🖼️', x: 80, y: 56, size: 4, in: 8 },
          { id: 'res', kind: 'text', text: '١٣ صفحة', x: 80, y: 76, size: 5, box: true, color: 'good', in: 9.5, anim: [{ at: 10, effect: 'glow' }] },
        ],
      },
      {
        title: 'خلاصة القسمة',
        say: 'نوزّع بالتساوي، وما يبقى هو الباقي، وهو دائمًا أصغر من العدد الذي نقسم عليه. ونتحقق: الناتج × المقسوم عليه + الباقي.',
        bg: 'board',
        duration: 12,
        actors: [
          { id: 'eq', kind: 'text', text: '١٤ ÷ ٤ = ٣', x: 62, y: 26, size: 5.5, color: 'white', ltr: true, in: 0.5 },
          { id: 'rem', kind: 'text', text: 'الباقي ٢', x: 28, y: 26, size: 4.4, box: true, color: 'sun', in: 1.5 },
          { id: 'lt', kind: 'text', text: '٢ < ٤', x: 50, y: 48, size: 5, color: 'sun', ltr: true, in: 4 },
          { id: 'ltl', kind: 'text', text: 'الباقي أصغر', x: 78, y: 48, size: 3.4, color: 'white', in: 4.4 },
          { id: 'chk', kind: 'text', text: '٣ × ٤ + ٢ = ١٤', x: 50, y: 72, size: 5.5, box: true, color: 'good', ltr: true, in: 7, anim: [{ at: 7.5, effect: 'glow' }] },
        ],
      },
    ],
  },

  /* ================================================================== */
  {
    lesson: 'm4-3',
    title: 'المتتاليات العددية',
    scenes: [
      {
        title: 'قفزات متساوية',
        say: 'يبدأ الضفدع عند ٤، ويقفز ٥ في كل مرة: ٤، ٩، ١٤، ١٩. هذه متتالية قاعدتها «أضف ٥».',
        bg: 'board',
        duration: 11,
        actors: [
          { id: 'nl', kind: 'math', math: { type: 'numberLine', min: 0, max: 20, step: 1, labelEvery: 5 }, x: 50, y: 56, w: 84 },
          ...hops('frog', 50, 84, 0, 20, [4, 9, 14, 19], nlY(56, 84), 1.5, 1.4, '+٥'),
          ...[4, 9, 14, 19].map((v, i) => ({ id: `t${i}`, kind: 'text', text: ['٤', '٩', '١٤', '١٩'][i], x: nlX(50, 84, 0, 20, v), y: 84, size: 4.4, box: true, color: 'sun', in: 1 + i * 1.4 + (i ? 0.6 : 0) }) as Actor),
          { id: 'rule', kind: 'text', text: 'القاعدة: أضف ٥', x: 50, y: 20, size: 4, box: true, color: 'good', in: 7.5, anim: [{ at: 8, effect: 'glow' }] },
        ],
      },
      {
        title: 'الحد والخطوة',
        say: 'في المتتالية ٦٠، ١١٠، ١٦٠، ٢١٠ كل عدد اسمه حد. وطول القفزة اسمه الخطوة، وهي هنا «+٥٠».',
        bg: 'board',
        duration: 11,
        actors: [
          { id: 'nl', kind: 'math', math: { type: 'numberLine', min: 50, max: 220, step: 10, labelEvery: 5, points: [{ value: 60 }, { value: 110 }, { value: 160 }, { value: 210 }] }, x: 50, y: 58, w: 84 },
          ...[60, 110, 160, 210].map((v, i) => ({ id: `t${i}`, kind: 'text', text: ['٦٠', '١١٠', '١٦٠', '٢١٠'][i], x: nlX(50, 84, 50, 220, v), y: 81, size: 4.4, box: true, color: 'sun', in: 0.5 + i * 0.4 }) as Actor),
          ...[60, 110, 160, 210].map((v, i) => ({ id: `h${i}`, kind: 'text', text: 'حد', x: nlX(50, 84, 50, 220, v), y: 90, size: 3.2, color: '#7dffb0', in: 2.6 + i * 0.3 }) as Actor),
          ...[60, 110, 160].map((v, i) => ({ id: `a${i}`, kind: 'arrow', from: [nlX(50, 84, 50, 220, v), 56], to: [nlX(50, 84, 50, 220, v + 50), 56], curve: -7, color: 'sun', in: 5.5 + i * 0.5 }) as Actor),
          ...[60, 110, 160].map((v, i) => ({ id: `al${i}`, kind: 'text', text: '+٥٠', x: nlX(50, 84, 50, 220, v + 25), y: 38, size: 3.6, color: 'sun', ltr: true, in: 5.8 + i * 0.5 }) as Actor),
          { id: 'step', kind: 'text', text: 'الخطوة = +٥٠', x: 50, y: 22, size: 4, box: true, color: 'good', in: 7.5, anim: [{ at: 8, effect: 'glow' }] },
        ],
      },
      {
        title: 'الحد التالي',
        say: 'المتتالية ٣، ٧، ١١، ١٥، ١٩ قاعدتها «أضف ٤». لنجد الحد التالي نقفز ٤ أخرى: ١٩ + ٤ = ٢٣',
        bg: 'board',
        duration: 12,
        actors: [
          { id: 'nl', kind: 'math', math: { type: 'numberLine', min: 0, max: 25, step: 1, labelEvery: 5, points: [{ value: 3 }, { value: 7 }, { value: 11 }, { value: 15 }, { value: 19 }] }, x: 50, y: 52, w: 84 },
          ...hops('frog', 50, 84, 0, 25, [15, 19, 23], nlY(52, 84), 5, 2.2, '+٤'),
          ...[3, 7, 11, 15, 19].map((v, i) => ({ id: `t${i}`, kind: 'text', text: ['٣', '٧', '١١', '١٥', '١٩'][i], x: nlX(50, 84, 0, 25, v), y: 80, size: 4, box: true, color: 'sun', in: 0.5 + i * 0.4 }) as Actor),
          { id: 'rule', kind: 'text', text: 'أضف ٤', x: 22, y: 20, size: 4, box: true, color: 'good', in: 2.8 },
          { id: 'eq', kind: 'text', text: '١٩ + ٤ = ٢٣', x: 66, y: 20, size: 4.6, color: 'white', ltr: true, in: 7 },
          { id: 'next', kind: 'text', text: '٢٣', x: nlX(50, 84, 0, 25, 23), y: 80, size: 4.4, box: true, color: 'good', in: 7.8, anim: [{ at: 8.2, effect: 'glow' }] },
        ],
      },
      {
        title: 'حدود ناقصة',
        say: 'متتالية تبدأ بـ ٠ وتنتهي بـ ٢٠، وبينهما ٣ حدود ناقصة. نعدّ القفزات: ٤. الفرق ٢٠ − ٠ = ٢٠. ثم ٢٠ ÷ ٤ = ٥، فالقاعدة +٥',
        bg: 'board',
        duration: 13,
        actors: [
          { id: 'nl', kind: 'math', math: { type: 'numberLine', min: 0, max: 20, step: 1, labelEvery: 20, points: [{ value: 0 }, { value: 20 }] }, x: 50, y: 36, w: 84 },
          ...[0, 5, 10, 15].map((v, i) => ({ id: `a${i}`, kind: 'arrow', from: [nlX(50, 84, 0, 20, v), nlY(36, 84) - 2], to: [nlX(50, 84, 0, 20, v + 5), nlY(36, 84) - 2], curve: -6, color: 'sun', in: 1.5 + i * 0.5 }) as Actor),
          ...[0, 5, 10, 15].map((v, i) => ({ id: `n${i}`, kind: 'text', text: ['١', '٢', '٣', '٤'][i], x: nlX(50, 84, 0, 20, v + 2.5), y: 23, size: 3.4, color: '#e08a00', in: 1.7 + i * 0.5 }) as Actor),
          ...[5, 10, 15].map((v, i) => ({ id: `q${i}`, kind: 'text', text: '؟', x: nlX(50, 84, 0, 20, v), y: 47.5, size: 4, color: 'ink', in: 0.8, anim: [fade(10)] }) as Actor),
          { id: 's1', kind: 'text', text: 'عدد القفزات = ٤', x: 50, y: 65, size: 3.8, color: 'white', in: 3.5 },
          { id: 's2', kind: 'text', text: '٢٠ − ٠ = ٢٠', x: 50, y: 76, size: 4.2, color: 'white', ltr: true, in: 5.5 },
          { id: 's3', kind: 'text', text: '٢٠ ÷ ٤ = ٥', x: 50, y: 87, size: 4.6, box: true, color: 'good', ltr: true, in: 8, anim: [{ at: 8.5, effect: 'glow' }] },
          ...[5, 10, 15].map((v, i) => ({ id: `r${i}`, kind: 'text', text: ['٥', '١٠', '١٥'][i], x: nlX(50, 84, 0, 20, v), y: 47.5, size: 3.4, box: true, color: 'sun', in: 10 + i * 0.4 }) as Actor),
        ],
      },
      {
        title: 'نجرّب الطريقة',
        say: 'خمسة حدود: الأول ٢ والأخير ١٤. القفزات ٤، والفرق ١٤ − ٢ = ١٢، و١٢ ÷ ٤ = ٣. إذن: ٢، ٥، ٨، ١١، ١٤',
        bg: 'board',
        duration: 13,
        actors: [
          { id: 'nl', kind: 'math', math: { type: 'numberLine', min: 0, max: 16, step: 1, labelEvery: 2, points: [{ value: 2 }, { value: 14 }] }, x: 50, y: 40, w: 84 },
          { id: 's1', kind: 'text', text: '١٤ − ٢ = ١٢', x: 32, y: 74, size: 4.4, color: 'white', ltr: true, in: 1.5 },
          { id: 's2', kind: 'text', text: '١٢ ÷ ٤ = ٣', x: 68, y: 74, size: 4.4, color: 'sun', ltr: true, in: 3.5 },
          ...hops('frog', 50, 84, 0, 16, [2, 5, 8, 11, 14], nlY(40, 84), 5.5, 1.1, '+٣'),
          { id: 'seq', kind: 'text', text: '٢، ٥، ٨، ١١، ١٤', x: 50, y: 88, size: 4.4, box: true, color: 'good', in: 10.2, anim: [{ at: 10.6, effect: 'glow' }] },
        ],
      },
      {
        title: 'نطرح في كل مرة',
        say: 'متتالية تبدأ بـ ٢٠٠ ونطرح ٣٠ في كل مرة: ٢٠٠، ١٧٠، ١٤٠… نستمر بالقفز إلى اليسار، فنتجاوز الصفر ونصل إلى −١٠',
        bg: 'board',
        duration: 13,
        actors: [
          { id: 'nl', kind: 'math', math: { type: 'numberLine', min: -40, max: 200, step: 10, labelEvery: 4 }, x: 50, y: 54, w: 86 },
          ...hops('frog', 50, 86, -40, 200, [200, 170, 140, 110, 80, 50, 20, -10], nlY(54, 86), 1.5, 1, '−٣٠', 'sun', true),
          { id: 'rule', kind: 'text', text: 'اطرح ٣٠', x: 22, y: 20, size: 4, box: true, color: 'good', in: 0.5 },
          { id: 'neg', kind: 'text', text: '−١٠', x: nlX(50, 86, -40, 200, -10) + 8, y: 84, size: 4.6, box: true, color: 'red', ltr: true, in: 9, anim: [{ at: 9.4, effect: 'glow' }] },
          { id: 'lab', kind: 'text', text: 'أقل من صفر', x: 52, y: 84, size: 3.4, color: 'white', in: 9.6 },
        ],
      },
      {
        title: 'خلاصة المتتاليات',
        say: 'المتتالية أعداد مرتبة وفق قاعدة. كل عدد حد، وطول القفزة هو الخطوة. وقد تكون الحدود أعدادًا عشرية مثل ٠,٦، ٠,٩، ١,٢ أو سالبة.',
        bg: 'board',
        duration: 12,
        actors: [
          { id: 'nl', kind: 'math', math: { type: 'numberLine', min: 0, max: 20, step: 1, labelEvery: 5, points: [{ value: 4 }, { value: 9 }, { value: 14 }, { value: 19 }], jumps: [{ from: 4, to: 9, label: '+٥' }, { from: 9, to: 14, label: '+٥' }, { from: 14, to: 19, label: '+٥' }] }, x: 50, y: 34, w: 70 },
          { id: 'w1', kind: 'text', text: 'حد', x: 22, y: 64, size: 4, box: true, color: 'sun', in: 2 },
          { id: 'w2', kind: 'text', text: 'الخطوة', x: 50, y: 64, size: 4, box: true, color: 'blue', in: 3 },
          { id: 'w3', kind: 'text', text: 'القاعدة', x: 78, y: 64, size: 4, box: true, color: 'good', in: 4 },
          { id: 'dec', kind: 'text', text: '٠,٦، ٠,٩، ١,٢', x: 30, y: 84, size: 4.2, color: 'white', in: 7 },
          { id: 'decl', kind: 'text', text: '+٠,٣', x: 30, y: 75, size: 3.2, color: 'sun', ltr: true, in: 7.4 },
          { id: 'neg', kind: 'text', text: '٢٠، −١٠، −٤٠', x: 70, y: 84, size: 4.2, color: 'white', in: 9 },
          { id: 'negl', kind: 'text', text: '−٣٠', x: 70, y: 75, size: 3.2, color: 'sun', ltr: true, in: 9.4 },
        ],
      },
    ],
  },
];

export default explainers;
