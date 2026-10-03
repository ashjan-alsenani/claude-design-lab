import type { Actor, Anim, Explainer, TextActor } from '../../../../explain/types';
import { keepNumberGroups } from '../../../../lib/digits';

/*
 * Explainers for lessons m15-1 (قواعد قابلية القسمة), m15-2 (الضرب), m15-3 (القسمة ٢), m16-1 (الأعداد الخاصة).
 * Equations on the stage are LTR text actors with Arabic-Indic digits; numbers written digit by digit
 * (column work, «آخر رقمين») are laid out left → right like place value in the book (units on the right).
 */

/* ---------- helpers (positions are % of the stage) ---------- */

const T = (id: string, text: string, x: number, y: number, size: number, color = 'white', inAt = 0, more: Partial<TextActor> = {}): Actor => ({
  id,
  kind: 'text',
  text,
  x,
  y,
  size,
  color,
  in: inAt,
  ...more,
});
/** an equation (read left → right) */
const Q = (id: string, text: string, x: number, y: number, size: number, color = 'white', inAt = 0, more: Partial<TextActor> = {}): Actor =>
  T(id, text, x, y, size, color, inAt, { ltr: true, ...more });

/** light chalk green (readable on the board) */
const LG = '#7be3a4';
const dim = (t: number): Anim => ({ at: t, to: { opacity: 0.22 }, dur: 0.5 });

/** a round counter (16:10 stage → h = w × 1.6) */
const dot = (id: string, x: number, y: number, inAt: number, color = 'sun', d = 3, anim?: Anim[]): Actor => ({
  id,
  kind: 'shape',
  shape: 'circle',
  x,
  y,
  w: d,
  h: d * 1.6,
  color,
  in: inAt,
  anim,
});
const rect = (id: string, x: number, y: number, w: number, h: number, color: string, inAt = 0, more: Partial<Actor> = {}): Actor =>
  ({ id, kind: 'shape', shape: 'rect', x, y, w, h, color, in: inAt, ...more }) as Actor;

/** x of every character of a number written digit by digit (a space = small gap). */
const digitXs = (s: string, cx: number, size: number) => {
  const w = size * 0.66;
  const ws = [...s].map((c) => (c === ' ' ? w * 0.45 : w));
  const total = ws.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  return ws.map((wi) => {
    const c = x + wi / 2;
    x += wi;
    return c;
  });
};
/** A number written digit by digit; characters from index `hi` on get `hiColor` (e.g. the units digit). */
const digits = (p: string, s: string, cx: number, y: number, size: number, inAt = 0, hi = s.length, hiColor = 'sun', color = 'white'): Actor[] => {
  const xs = digitXs(s, cx, size);
  return [...s].flatMap((c, i): Actor[] => (c === ' ' ? [] : [T(`${p}${i}`, c, xs[i], y, size, i >= hi ? hiColor : color, inAt, { ltr: true })]));
};
/** an oval ring around characters [from, to] of `digits(…)` */
const ring = (id: string, s: string, cx: number, y: number, size: number, from: number, to: number, color: string, inAt: number): Actor => {
  const xs = digitXs(s, cx, size);
  const w = xs[to] - xs[from] + size * 0.95;
  return { id, kind: 'shape', shape: 'pill', x: (xs[from] + xs[to]) / 2, y: y + 0.6, w, h: size * 1.6 * 1.15, color, outline: true, in: inAt };
};

/* ---------- 15-2: the multiplication grid (× on the right, hundreds on the left as in the book) ---------- */
const GX = [24, 42, 60, 78];
const GY = [44, 63];
const grid = (inAt = 0): Actor[] =>
  [0, 1].flatMap((r) =>
    GX.map((x, c): Actor => ({
      id: `cell${r}${c}`,
      kind: 'shape',
      shape: 'rect',
      x,
      y: GY[r],
      w: 17,
      h: 17,
      color: r === 0 || c === 3 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)',
      in: inAt + (r * 4 + c) * 0.08,
    })),
  );
const gridLines = (inAt = 0): Actor[] => [
  rect('gh', 51, GY[0] + 8.5, 71, 0.5, 'rgba(255,255,255,0.55)', inAt),
  rect('gv', 69.5, (GY[0] + GY[1]) / 2, 0.35, 36, 'rgba(255,255,255,0.55)', inAt),
];

/* ---------- 15-3: short division «bus stop» (divisor on the left, quotient on top) ---------- */
const DX = [36, 45, 54];
const DY = 56;
const QY = 37;
const busStop = (divisor: string, dividend: string[], inAt = 0): Actor[] => [
  T('dv', divisor, 21, DY, 8, 'white', inAt, { ltr: true }),
  rect('bv', 27.5, DY, 0.6, 17, 'white', inAt),
  rect('bh', 43.5, DY - 8.5, 33, 0.7, 'white', inAt),
  ...dividend.map((d, i) => T(`dd${i}`, d, DX[i], DY, 8, 'white', inAt, { ltr: true })),
];

/* =================================================================== */
const raw: Explainer[] = [
  {
    lesson: 'm15-1',
    title: 'قواعد قابلية القسمة',
    scenes: [
      {
        title: 'عدد قابل للقسمة',
        say: 'العدد القابل للقسمة يمكن قسمته دون باقٍ. نوزّع ١٤ قرصًا على مجموعتين: في كل مجموعة ٧، ولا يبقى شيء. إذن ١٤ يقبل القسمة على ٢',
        duration: 11,
        bg: 'board',
        actors: [
          ...Array.from({ length: 14 }, (_, i): Actor => {
            const top = i % 2 === 0;
            const k = Math.floor(i / 2);
            return dot(`c${i}`, 50 + (i - 6.5) * 5.6, 26, 0.3 + i * 0.1, 'sun', 3.6, [{ at: 2.6 + k * 0.25, to: { x: 26 + k * 8, y: top ? 48 : 64 }, dur: 0.7 }]);
          }),
          { id: 'g1', kind: 'shape', shape: 'pill', x: 50, y: 48, w: 62, h: 12, color: 'rgba(255,255,255,0.12)', in: 2.2 },
          { id: 'g2', kind: 'shape', shape: 'pill', x: 50, y: 64, w: 62, h: 12, color: 'rgba(255,255,255,0.12)', in: 2.2 },
          T('n1', '٧', 86, 48, 4.4, 'sun', 5),
          T('n2', '٧', 86, 64, 4.4, 'sun', 5),
          Q('eq', '١٤ ÷ ٢ = ٧', 30, 84, 5, 'white', 6.4),
          T('ok', 'لا يبقى شيء ✓', 70, 84, 3.8, 'good', 7.2, { box: true, anim: [{ at: 7.6, effect: 'glow' }] }),
        ],
      },
      {
        title: 'القسمة على ٢',
        say: 'هل يقبل العدد القسمة على ٢؟ ننظر إلى رقم الآحاد فقط: في ٣٤ و٤٨ و٢٦٠ الآحاد ٤ و٨ و٠، فهي تقبل القسمة على ٢. أما ٣٧ و٢٩ فلا.',
        duration: 12,
        bg: 'board',
        actors: [
          ...(
            [
              ['٣٤', 82, true],
              ['٣٧', 66, false],
              ['٤٨', 50, true],
              ['٢٩', 34, false],
              ['٢٦٠', 18, true],
            ] as const
          ).flatMap(([s, x, ok], i): Actor[] => [
            ...digits(`n${i}`, s, x, 38, 7, 0.3 + i * 0.3, s.length - 1),
            ring(`r${i}`, s, x, 38, 7, s.length - 1, s.length - 1, 'sun', 2 + i * 0.25),
            T(`v${i}`, ok ? '✓' : '✗', x, 60, 6, ok ? 'good' : 'red', 4 + i * 0.7, ok ? {} : { anim: [{ at: 4.2 + i * 0.7, effect: 'shake' }] }),
          ]),
          T('rule', 'رقم الآحاد: ٠ ٢ ٤ ٦ ٨', 50, 82, 4, 'good', 8.2, { box: true, anim: [{ at: 8.6, effect: 'glow' }] }),
        ],
      },
      {
        title: 'القسمة على ٥ وعلى ١٠',
        say: 'يقبل العدد القسمة على ٥ إذا كان رقم آحاده ٥ أو ٠، ويقبل القسمة على ١٠ إذا كان رقم آحاده ٠ فقط. انظري: ٥٨٠ يقبل الاثنين!',
        duration: 13,
        bg: 'board',
        actors: [
          T('h0', 'العدد', 76, 22, 3.6, 'sun', 0.2),
          Q('h1', '÷ ٥', 50, 22, 4.4, 'sun', 0.2),
          Q('h2', '÷ ١٠', 26, 22, 4.4, 'sun', 0.2),
          rect('hl', 50, 28.5, 72, 0.5, 'rgba(255,255,255,0.45)', 0.2),
          rect('vl1', 63, 54, 0.4, 46, 'rgba(255,255,255,0.3)', 0.2),
          rect('vl2', 38, 54, 0.4, 46, 'rgba(255,255,255,0.3)', 0.2),
          ...(
            [
              ['٧٧٥', 40, true, false],
              ['٥٨٠', 56, true, true],
              ['٤١', 72, false, false],
            ] as const
          ).flatMap(([s, y, five, ten], i): Actor[] => [
            ...digits(`n${i}`, s, 76, y, 6, 0.6 + i * 0.4, s.length - 1),
            T(`a${i}`, five ? '✓' : '✗', 50, y, 5.4, five ? 'good' : 'red', 2.4 + i * 0.8),
            T(`b${i}`, ten ? '✓' : '✗', 26, y, 5.4, ten ? 'good' : 'red', 5.4 + i * 0.8),
          ]),
          T('r5', 'الآحاد ٥ أو ٠', 50, 87, 3.4, 'good', 8.6, { box: true }),
          T('r10', 'الآحاد ٠', 26, 87, 3.4, 'good', 9.4, { box: true }),
        ],
      },
      {
        title: 'القسمة على ٤',
        say: 'للقسمة على ٤ ننظر إلى العدد المكوّن من رقمي الآحاد والعشرات. في ٣٢٤ هو ٢٤، و٢٤ ÷ ٤ = ٦ دون باقٍ. أما ١٤٢ فلا يقبلها، لأن ٤٢ ليس مضاعفًا للعدد ٤.',
        duration: 13,
        bg: 'board',
        actors: [
          ...digits('a', '٣٢٤', 78, 32, 8, 0.3, 1),
          ring('ra', '٣٢٤', 78, 32, 8, 1, 2, 'sun', 1.4),
          { id: 'aa', kind: 'arrow', from: [66, 32], to: [58, 32], color: 'sun', in: 2.4 },
          Q('ae', '٢٤ ÷ ٤ = ٦', 40, 32, 5, 'white', 3),
          T('av', 'يقبل القسمة على ٤ ✓', 40, 44, 3.4, LG, 4.4),
          ...digits('b', '١٤٢', 78, 62, 8, 6, 1),
          ring('rb', '١٤٢', 78, 62, 8, 1, 2, 'sun', 7),
          { id: 'ba', kind: 'arrow', from: [66, 62], to: [58, 62], color: 'sun', in: 7.8 },
          T('be', '٤٢ ليس مضاعفًا لـ ٤', 38, 62, 3.4, 'bad', 8.4, { box: true, anim: [{ at: 8.8, effect: 'shake' }] }),
          T('rule', '👀 ننظر إلى آخر رقمين', 50, 86, 4, 'sun', 10.2),
        ],
      },
      {
        title: 'القسمة على ٢٥ وعلى ١٠٠',
        say: 'للقسمة على ٢٥ يجب أن ينتهي العدد بـ ٠٠ أو ٢٥ أو ٥٠ أو ٧٥، وللقسمة على ١٠٠ يجب أن ينتهي بـ ٠٠. إذن ٧٧٥ يقبل القسمة على ٢٥، و٢ ٠٠٥ لا يقبل القسمة على ١٠٠.',
        duration: 14,
        bg: 'board',
        actors: [
          Q('h25', '÷ ٢٥', 84, 24, 4.6, 'sun', 0.2),
          ...['٠٠', '٢٥', '٥٠', '٧٥'].map((s, i) => T(`e${i}`, s, 66 - i * 13, 24, 4.4, 'good', 0.8 + i * 0.4, { box: true, ltr: true })),
          Q('h100', '÷ ١٠٠', 84, 42, 4.6, 'sun', 3.2),
          T('f0', '٠٠', 66, 42, 4.4, 'good', 3.8, { box: true, ltr: true }),
          rect('sep', 50, 52, 72, 0.4, 'rgba(255,255,255,0.3)', 4.4),
          ...digits('a', '٧٧٥', 76, 66, 6.5, 5.2, 1),
          ring('ra', '٧٧٥', 76, 66, 6.5, 1, 2, 'sun', 6.2),
          { id: 'aa', kind: 'arrow', from: [64, 66], to: [52, 66], color: 'good', in: 6.8 },
          T('av', 'يقبل القسمة على ٢٥ ✓', 30, 66, 3.2, 'good', 7.2, { box: true }),
          ...digits('b', '٢ ٠٠٥', 76, 84, 6.5, 8.8, 2),
          ring('rb', '٢ ٠٠٥', 76, 84, 6.5, 3, 4, 'red', 9.8),
          { id: 'ba', kind: 'arrow', from: [62, 84], to: [52, 84], color: 'red', in: 10.4 },
          T('bv', 'لا يقبل القسمة على ١٠٠', 30, 84, 3.2, 'bad', 10.8, { box: true, anim: [{ at: 11.2, effect: 'shake' }] }),
        ],
      },
      {
        title: 'لغز: أصغر عدد',
        say: 'ما أصغر عدد يقبل القسمة على ٢ و٣ و٤ و٥؟ ليقبل القسمة على ٢ و٥ ينتهي بـ ٠. ومن هذه الأعداد يقبل القسمة على ٤: ٢٠ و٤٠ و٦٠. وعلى ٣ أيضًا: ٦٠ فقط!',
        duration: 15,
        bg: 'board',
        actors: [
          T('goal', '🔍 يقبل القسمة على ٢ و٣ و٤ و٥', 50, 20, 3.8, 'sun', 0.2, { box: true }),
          ...['١٠', '٢٠', '٣٠', '٤٠', '٥٠', '٦٠'].map((s, i): Actor => {
            const anim: Anim[] = [];
            if (i % 2 === 0) anim.push(dim(7));
            if (i === 1 || i === 3) anim.push(dim(10.6));
            if (i === 5) anim.push({ at: 11.2, to: { scale: 1.45, y: 44 }, dur: 0.6 }, { at: 12, effect: 'glow' });
            return T(`n${i}`, s, 84 - i * 13.6, 46, 6, 'white', 3 + i * 0.3, { ltr: true, anim });
          }),
          T('s1', 'على ٢ و٥: آحاده ٠', 50, 70, 3.8, 'white', 3.4, { box: true, out: 6.6 }),
          T('s2', 'على ٤: يبقى ٢٠ و٤٠ و٦٠', 50, 70, 3.8, 'white', 7.2, { box: true, out: 10.2 }),
          T('s3', 'على ٣: يبقى ٦٠ فقط', 50, 70, 3.8, 'white', 10.6, { box: true }),
          T('res', 'أصغر عدد هو ٦٠ 🎉', 50, 87, 4.4, 'good', 12.2, { box: true }),
        ],
      },
      {
        title: 'الخلاصة',
        say: 'للقسمة على ٢ و٥ و١٠ ننظر إلى رقم الآحاد. وللقسمة على ٤ و٢٥ و١٠٠ ننظر إلى العدد المكوّن من رقمي الآحاد والعشرات.',
        duration: 13,
        bg: 'board',
        actors: [
          T('hr', '👀 رقم الآحاد', 73, 22, 4.2, 'sun', 0.3, { box: true }),
          T('hl', '👀 آخر رقمين', 27, 22, 4.2, 'sun', 5.2, { box: true }),
          rect('mid', 50, 56, 0.5, 66, 'rgba(255,255,255,0.3)', 0.2),
          ...(
            [
              ['÷ ٢', '٠ ٢ ٤ ٦ ٨'],
              ['÷ ٥', '٥ أو ٠'],
              ['÷ ١٠', '٠'],
            ] as const
          ).flatMap(([d, r], i): Actor[] => [
            Q(`rd${i}`, d, 84, 40 + i * 18, 4.6, 'white', 1 + i * 1.2),
            T(`rr${i}`, r, 64, 40 + i * 18, 4.2, LG, 1.4 + i * 1.2),
          ]),
          ...(
            [
              ['÷ ٤', 'مضاعف للعدد ٤'],
              ['÷ ٢٥', '٠٠ ٢٥ ٥٠ ٧٥'],
              ['÷ ١٠٠', '٠٠'],
            ] as const
          ).flatMap(([d, r], i): Actor[] => [
            Q(`ld${i}`, d, 40, 40 + i * 18, 4.6, 'white', 6 + i * 1.2),
            T(`lr${i}`, r, 20, 40 + i * 18, i === 0 ? 3.4 : 4, LG, 6.4 + i * 1.2),
          ]),
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm15-2',
    title: 'الضرب بطريقة الشبكة',
    scenes: [
      {
        title: 'نجزّئ العدد',
        say: 'كيف نحسب ١٦٤ × ٥؟ نجزّئ ١٦٤ حسب القيمة المكانية: ١٠٠ و٦٠ و٤، ونكتب كل جزء في خانة من الشبكة، والعدد ٥ في جانبها.',
        duration: 12,
        bg: 'board',
        actors: [
          Q('top', '١٦٤ × ٥ = ؟', 50, 18, 5.5, 'white', 0.2),
          ...grid(4.2),
          ...gridLines(4.2),
          Q('p0', '١٠٠', 38, 28, 5, 'sun', 1.6, { anim: [{ at: 4.6, to: { x: GX[0], y: GY[0] }, dur: 0.9 }] }),
          Q('p1', '٦٠', 50, 28, 5, 'sun', 2.2, { anim: [{ at: 5, to: { x: GX[1], y: GY[0] }, dur: 0.9 }] }),
          Q('p2', '٤', 60, 28, 5, 'sun', 2.8, { anim: [{ at: 5.4, to: { x: GX[2], y: GY[0] }, dur: 0.9 }] }),
          T('x', '×', GX[3], GY[0], 5, 'white', 4.6),
          Q('five', '٥', GX[3], GY[1], 5, 'orange', 6.6, { anim: [{ at: 7, effect: 'pulse' }] }),
          Q('split', '١٦٤ = ١٠٠ + ٦٠ + ٤', 50, 86, 4.4, 'sun', 8),
        ],
      },
      {
        title: 'نضرب كل جزء',
        say: 'نضرب كل جزء في ٥: ١٠٠ × ٥ = ٥٠٠، ثم ٦٠ × ٥ = ٣٠٠، ثم ٤ × ٥ = ٢٠. نكتب كل ناتج في خانته.',
        duration: 12,
        bg: 'board',
        actors: [
          ...grid(),
          ...gridLines(),
          Q('h0', '١٠٠', GX[0], GY[0], 5, 'sun'),
          Q('h1', '٦٠', GX[1], GY[0], 5, 'sun'),
          Q('h2', '٤', GX[2], GY[0], 5, 'sun'),
          T('x', '×', GX[3], GY[0], 5, 'white'),
          Q('five', '٥', GX[3], GY[1], 5, 'orange'),
          ...(
            [
              ['٥٠٠', '١٠٠ × ٥ = ٥٠٠'],
              ['٣٠٠', '٦٠ × ٥ = ٣٠٠'],
              ['٢٠', '٤ × ٥ = ٢٠'],
            ] as const
          ).flatMap(([r, e], i): Actor[] => {
            const t = 1 + i * 3;
            return [
              Q(`e${i}`, e, 50, 86, 4.8, 'white', t, { out: t + 2.8 }),
              Q(`r${i}`, r, GX[i], GY[1], 5, 'white', t + 1, { anim: [{ at: t + 1.1, effect: 'pulse' }] }),
            ];
          }),
          T('done', 'نضرب كل خانة في ٥', 50, 86, 3.8, 'sun', 10.2, { box: true }),
        ],
      },
      {
        title: 'نجمع النواتج',
        say: 'الآن نجمع النواتج: ٥٠٠ + ٣٠٠ + ٢٠ = ٨٢٠. إذن ١٦٤ × ٥ = ٨٢٠',
        duration: 10,
        bg: 'board',
        actors: [
          ...grid(),
          ...gridLines(),
          Q('h0', '١٠٠', GX[0], GY[0], 5, 'sun'),
          Q('h1', '٦٠', GX[1], GY[0], 5, 'sun'),
          Q('h2', '٤', GX[2], GY[0], 5, 'sun'),
          T('x', '×', GX[3], GY[0], 5, 'white'),
          Q('five', '٥', GX[3], GY[1], 5, 'orange'),
          Q('r0', '٥٠٠', GX[0], GY[1], 5, 'white'),
          Q('r1', '٣٠٠', GX[1], GY[1], 5, 'white'),
          Q('r2', '٢٠', GX[2], GY[1], 5, 'white'),
          Q('m0', '٥٠٠', GX[0], GY[1], 5, 'sun', 0.8, { anim: [{ at: 1, to: { x: 22, y: 86 }, dur: 0.9 }] }),
          T('pl1', '+', 30.5, 86, 5, 'white', 1.8),
          Q('m1', '٣٠٠', GX[1], GY[1], 5, 'sun', 1.6, { anim: [{ at: 1.8, to: { x: 39, y: 86 }, dur: 0.9 }] }),
          T('pl2', '+', 47.5, 86, 5, 'white', 2.6),
          Q('m2', '٢٠', GX[2], GY[1], 5, 'sun', 2.4, { anim: [{ at: 2.6, to: { x: 54.5, y: 86 }, dur: 0.9 }] }),
          T('eqs', '=', 61.5, 86, 5, 'white', 3.8),
          Q('sum', '٨٢٠', 70, 86, 6, LG, 4.4, { anim: [{ at: 4.8, effect: 'glow' }] }),
          Q('top', '١٦٤ × ٥ = ٨٢٠', 50, 18, 5.5, LG, 6.4, { anim: [{ at: 6.8, effect: 'glow' }] }),
        ],
      },
      {
        title: 'مثال آخر: ٣٢٧ × ٨',
        say: 'لنجرّب ٣٢٧ × ٨: نجزّئه إلى ٣٠٠ و٢٠ و٧، ونضرب كل جزء في ٨، ثم نجمع: ٢ ٤٠٠ + ١٦٠ + ٥٦ = ٢ ٦١٦',
        duration: 13,
        bg: 'board',
        actors: [
          Q('top', '٣٢٧ × ٨', 50, 18, 5.5, 'white', 0.2),
          ...grid(0.4),
          ...gridLines(0.4),
          Q('h0', '٣٠٠', GX[0], GY[0], 5, 'sun', 1.2),
          Q('h1', '٢٠', GX[1], GY[0], 5, 'sun', 1.6),
          Q('h2', '٧', GX[2], GY[0], 5, 'sun', 2),
          T('x', '×', GX[3], GY[0], 5, 'white', 0.6),
          Q('k', '٨', GX[3], GY[1], 5, 'orange', 2.6),
          Q('r0', '٢ ٤٠٠', GX[0], GY[1], 4.6, 'white', 4, { anim: [{ at: 4.1, effect: 'pulse' }] }),
          Q('r1', '١٦٠', GX[1], GY[1], 5, 'white', 5.4, { anim: [{ at: 5.5, effect: 'pulse' }] }),
          Q('r2', '٥٦', GX[2], GY[1], 5, 'white', 6.8, { anim: [{ at: 6.9, effect: 'pulse' }] }),
          Q('sum', '٢ ٤٠٠ + ١٦٠ + ٥٦ = ٢ ٦١٦', 50, 86, 4.6, LG, 8.6, { anim: [{ at: 9.2, effect: 'glow' }] }),
        ],
      },
      {
        title: 'نقدّر أولًا',
        say: 'قبل أن نحسب ٨٦ × ٧ نقدّر الناتج: ٨٦ قريب من ٩٠، و٩٠ × ٧ = ٦٣٠. إذن الناتج الصحيح يجب أن يكون قريبًا من ٦٣٠.',
        duration: 11,
        bg: 'board',
        actors: [
          Q('top', '٨٦ × ٧', 50, 18, 5.5, 'white', 0.2),
          rect('line', 50, 50, 60, 0.6, 'white', 0.6),
          ...Array.from({ length: 11 }, (_, i): Actor => rect(`t${i}`, 20 + i * 6, 50, 0.4, i % 5 === 0 ? 5 : 3, 'white', 0.6)),
          Q('l80', '٨٠', 20, 58, 3.6, 'white', 0.8),
          Q('l90', '٩٠', 80, 58, 3.6, 'white', 0.8),
          dot('p', 56, 50, 1.6, 'sun', 3),
          Q('l86', '٨٦', 56, 59, 4, 'sun', 1.6),
          { id: 'j', kind: 'arrow', from: [56, 45], to: [79, 45], curve: -7, color: 'sun', in: 2.6 },
          T('jl', 'قريب من ٩٠', 68, 32, 3.4, 'sun', 3.2),
          Q('est', '٩٠ × ٧ = ٦٣٠', 50, 76, 5, 'white', 4.8),
          T('res', '🎯 الناتج قريب من ٦٣٠', 50, 89, 3.8, 'good', 6.6, { box: true, anim: [{ at: 7, effect: 'glow' }] }),
        ],
      },
      {
        title: 'الضرب العمودي',
        say: 'نضرب الآحاد: ٦ × ٧ = ٤٢، نكتب ٢ ونحمل ٤ إلى العشرات. ثم ٨ × ٧ = ٥٦، ونضيف المحمول: ٥٦ + ٤ = ٦٠. الناتج ٦٠٢، قريب من ٦٣٠.',
        duration: 15,
        bg: 'board',
        actors: [
          // columns: hundreds 40, tens 48, units 56
          T('t8', '٨', 48, 30, 7, 'white', 0.2),
          T('u6', '٦', 56, 30, 7, 'white', 0.2, { anim: [{ at: 1, effect: 'pulse' }] }),
          T('xx', '×', 36, 46, 6, 'white', 0.2),
          T('u7', '٧', 56, 46, 7, 'white', 0.2, { anim: [{ at: 1, effect: 'pulse' }] }),
          rect('bar', 46, 55, 26, 0.7, 'white', 0.2),
          Q('n1', '٦ × ٧ = ٤٢', 80, 34, 4.4, 'sun', 1.4, { out: 6 }),
          T('w2', '٢', 56, 66, 7, LG, 3, { anim: [{ at: 3.1, effect: 'pulse' }] }),
          T('c4', '٤', 48, 19, 3.8, 'orange', 4, { anim: [{ at: 4.1, effect: 'bounce' }] }),
          T('c4l', 'نحمل ٤', 32, 19, 3.2, 'orange', 4.4, { out: 6 }),
          Q('n2', '٨ × ٧ = ٥٦', 80, 34, 4.4, 'sun', 6.4),
          Q('n3', '٥٦ + ٤ = ٦٠', 80, 48, 4.4, 'orange', 8),
          T('w0', '٠', 48, 66, 7, LG, 9.4),
          T('w6', '٦', 40, 66, 7, LG, 9.6),
          T('res', '٦٠٢ قريب من ٦٣٠ ✓', 50, 86, 4, 'good', 11, { box: true, anim: [{ at: 11.4, effect: 'glow' }] }),
        ],
      },
      {
        title: 'الخلاصة',
        say: 'في طريقة الشبكة: نجزّئ العدد حسب القيمة المكانية، ثم نضرب كل جزء، ثم نجمع النواتج. ونقدّر الناتج أولًا لنتحقق من إجابتنا.',
        duration: 12,
        bg: 'board',
        actors: [
          T('s1', '١ نجزّئ', 78, 30, 4.4, 'sun', 0.4, { box: true }),
          Q('e1', '١٠٠ + ٦٠ + ٤', 78, 46, 3.8, 'white', 1),
          { id: 'a1', kind: 'arrow', from: [66, 30], to: [61, 30], color: 'sun', in: 2 },
          T('s2', '٢ نضرب', 50, 30, 4.4, 'sun', 2.4, { box: true }),
          Q('e2', '× ٥', 50, 46, 3.8, 'white', 3),
          { id: 'a2', kind: 'arrow', from: [39, 30], to: [34, 30], color: 'sun', in: 4 },
          T('s3', '٣ نجمع', 22, 30, 4.4, 'sun', 4.4, { box: true }),
          Q('e3', '٥٠٠ + ٣٠٠ + ٢٠', 22, 46, 3.8, 'white', 5),
          Q('fin', '١٦٤ × ٥ = ٨٢٠', 50, 66, 5.4, LG, 6.4, { anim: [{ at: 6.8, effect: 'glow' }] }),
          T('est', '🎯 نقدّر أولًا لنتحقق', 50, 86, 3.8, 'good', 8.4, { box: true }),
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm15-3',
    title: 'القسمة المختصرة',
    scenes: [
      {
        title: 'سرّ العدد ٣٧',
        say: 'لعبة جميلة: نختار عددًا أرقامه الثلاثة متشابهة مثل ٦٦٦، نجمع أرقامه فنحصل على ١٨، ثم نقسم ٦٦٦ على ١٨ فيكون الناتج ٣٧. جرّبي غيره: الناتج دائمًا ٣٧!',
        duration: 13,
        bg: 'board',
        actors: [
          Q('n', '٦٦٦', 50, 22, 8, 'white', 0.3),
          Q('s', '٦ + ٦ + ٦ = ١٨', 50, 40, 5, 'sun', 2),
          Q('d', '٦٦٦ ÷ ١٨ = ٣٧', 50, 56, 5.5, 'white', 4, { anim: [{ at: 4.4, effect: 'pulse' }] }),
          Q('o1', '١١١ ÷ ٣ = ٣٧', 76, 73, 4, 'white', 6.6),
          Q('o2', '٣٣٣ ÷ ٩ = ٣٧', 50, 73, 4, 'white', 7.2),
          Q('o3', '٥٥٥ ÷ ١٥ = ٣٧', 24, 73, 4, 'white', 7.8),
          T('res', 'دائمًا ٣٧! 🎉', 50, 88, 4.4, 'good', 9, { box: true, anim: [{ at: 9.4, effect: 'glow' }] }),
        ],
      },
      {
        title: 'نقدّر أولًا',
        say: 'نريد أن نحسب ١٠٤ ÷ ٤. نقدّر أولًا: ١٠٤ قريب من ١٠٠، و١٠٠ ÷ ٤ = ٢٥. إذن الناتج سيكون قريبًا من ٢٥.',
        duration: 11,
        bg: 'board',
        actors: [
          Q('top', '١٠٤ ÷ ٤ = ؟', 50, 18, 5.5, 'white', 0.2),
          { id: 'bar', kind: 'shape', shape: 'rect', x: 50, y: 44, w: 64, h: 14, color: 'white', outline: true, in: 1.6 },
          Q('bl', '١٠٠', 50, 31, 4, 'sun', 1.8),
          ...[0, 1, 2, 3].map((i): Actor => ({
            id: `seg${i}`,
            kind: 'shape',
            shape: 'rect',
            x: 26 + i * 16,
            y: 44,
            w: 15,
            h: 12,
            color: ['rgba(255,214,90,0.55)', 'rgba(123,227,164,0.55)', 'rgba(255,214,90,0.55)', 'rgba(123,227,164,0.55)'][i],
            label: '٢٥',
            in: 3.4 + i * 0.5,
          })),
          Q('eq', '١٠٠ ÷ ٤ = ٢٥', 50, 66, 5, 'white', 5.8),
          T('res', '🎯 الناتج قريب من ٢٥', 50, 84, 4, 'good', 7.4, { box: true, anim: [{ at: 7.8, effect: 'glow' }] }),
        ],
      },
      {
        title: 'نبدأ بالعشرات',
        say: 'نكتب القسمة المختصرة. نبدأ بـ ١٠ ÷ ٤: يدخل ٤ مرتين والباقي ٢. نكتب ٢ فوق العشرات، ونحمل الباقي ٢ إلى الآحاد.',
        duration: 13,
        bg: 'board',
        actors: [
          ...busStop('٤', ['١', '٠', '٤']),
          { id: 'rg', kind: 'shape', shape: 'pill', x: 40.5, y: DY + 0.6, w: 16, h: 15, color: 'sun', outline: true, in: 1 },
          // 10 counters shared into 4 groups → 2 each, 2 left over
          ...Array.from({ length: 10 }, (_, i): Actor => {
            const left = i >= 8;
            const to = left ? { x: 74 + (i - 8) * 8, y: 66 } : { x: 68 + (i % 4) * 6.5, y: i < 4 ? 32 : 42 };
            return dot(`c${i}`, 66 + (i % 5) * 5.5, i < 5 ? 26 : 34, 1.6 + i * 0.08, left ? 'orange' : 'sun', 3.4, [{ at: 3 + i * 0.12, to, dur: 0.7 }]);
          }),
          ...[0, 1, 2, 3].map((i): Actor => ({ id: `g${i}`, kind: 'shape', shape: 'pill', x: 68 + i * 6.5, y: 37, w: 5.4, h: 20, color: 'rgba(255,255,255,0.12)', in: 2.8 })),
          T('rl', 'الباقي ٢', 77, 79, 3.4, 'orange', 5.2),
          Q('note', '١٠ ÷ ٤ = ٢ والباقي ٢', 40, 84, 4.2, 'sun', 5.6),
          T('q2', '٢', DX[1], QY, 8, LG, 7.2, { anim: [{ at: 7.3, effect: 'pulse' }] }),
          T('cy', '٢', DX[2] - 4.2, DY - 3.5, 3.6, 'orange', 9, { anim: [{ at: 9.1, effect: 'bounce' }] }),
          { id: 'ca', kind: 'arrow', from: [70, 74], to: [52, 54], curve: 6, color: 'orange', dashed: true, in: 8.6 },
        ],
      },
      {
        title: 'ثم الآحاد',
        say: 'مع الباقي المحمول يصبح لدينا ٢٤. نقسم ٢٤ ÷ ٤ = ٦: أربعة صفوف في كل صف ٦. نكتب ٦ فوق الآحاد.',
        duration: 11,
        bg: 'board',
        actors: [
          ...busStop('٤', ['١', '٠', '٤']),
          T('q2', '٢', DX[1], QY, 8, LG),
          T('cy', '٢', DX[2] - 4.2, DY - 3.5, 3.6, 'orange'),
          { id: 'rg', kind: 'shape', shape: 'pill', x: DX[2] - 1.6, y: DY + 0.6, w: 11, h: 15, color: 'sun', outline: true, in: 0.8 },
          Q('n24', '٢٤', 78, 22, 5, 'sun', 1.4),
          ...Array.from({ length: 24 }, (_, i) => dot(`a${i}`, 67 + (i % 6) * 4.4, 36 + Math.floor(i / 6) * 9, 2.2 + Math.floor(i / 6) * 0.5, 'sun', 2.8)),
          ...[0, 1, 2, 3].map((r): Actor => Q(`rl${r}`, '٦', 93 - 4, 36 + r * 9, 3, 'white', 4.4 + r * 0.2)),
          Q('note', '٢٤ ÷ ٤ = ٦', 40, 84, 4.6, 'sun', 5.6),
          T('q6', '٦', DX[2], QY, 8, LG, 7, { anim: [{ at: 7.1, effect: 'pulse' }] }),
        ],
      },
      {
        title: 'الناتج والتحقّق',
        say: 'إذن ١٠٤ ÷ ٤ = ٢٦، وهو قريب من تقديرنا ٢٥. ونتحقّق بالضرب: ٢٦ × ٤ = ١٠٤ ✓',
        duration: 10,
        bg: 'board',
        actors: [
          ...busStop('٤', ['١', '٠', '٤']),
          T('q2', '٢', DX[1], QY, 8, LG),
          T('q6', '٦', DX[2], QY, 8, LG),
          T('cy', '٢', DX[2] - 4.2, DY - 3.5, 3.6, 'orange'),
          Q('eq', '١٠٤ ÷ ٤ = ٢٦', 77, 32, 5, 'white', 0.8, { anim: [{ at: 1.2, effect: 'glow' }] }),
          T('est', '🎯 قريب من ٢٥', 77, 50, 3.8, 'sun', 2.6),
          Q('chk', '٢٦ × ٤ = ١٠٤', 50, 82, 5, LG, 4.6),
          T('ok', '✓', 70, 82, 6, 'good', 5.4, { anim: [{ at: 5.5, effect: 'bounce' }] }),
        ],
      },
      {
        title: 'قسمة لها باقٍ',
        say: 'نقسم ٥٠٩ ÷ ٩: أولًا ٥٠ ÷ ٩ = ٥ والباقي ٥، فنحمله إلى الآحاد فتصبح ٥٩. ثم ٥٩ ÷ ٩ = ٦ والباقي ٥. الناتج ٥٦ والباقي ٥.',
        duration: 15,
        bg: 'board',
        actors: [
          ...busStop('٩', ['٥', '٠', '٩']),
          { id: 'rg1', kind: 'shape', shape: 'pill', x: 40.5, y: DY + 0.6, w: 16, h: 15, color: 'sun', outline: true, in: 1, out: 5.4 },
          Q('n1', '٥٠ ÷ ٩ = ٥ والباقي ٥', 46, 84, 4.2, 'sun', 1.6, { out: 6.2 }),
          T('q5', '٥', DX[1], QY, 8, LG, 3.2, { anim: [{ at: 3.3, effect: 'pulse' }] }),
          T('cy', '٥', DX[2] - 4.2, DY - 3.5, 3.6, 'orange', 4.4, { anim: [{ at: 4.5, effect: 'bounce' }] }),
          { id: 'rg2', kind: 'shape', shape: 'pill', x: DX[2] - 1.6, y: DY + 0.6, w: 11, h: 15, color: 'sun', outline: true, in: 6 },
          Q('n2', '٥٩ ÷ ٩ = ٦ والباقي ٥', 46, 84, 4.2, 'sun', 6.6),
          T('q6', '٦', DX[2], QY, 8, LG, 8.4, { anim: [{ at: 8.5, effect: 'pulse' }] }),
          T('rm', 'والباقي ٥', 72, QY, 4.4, 'orange', 9.6, { box: true, anim: [{ at: 10, effect: 'glow' }] }),
          Q('chk', '٥٦ × ٩ + ٥ = ٥٠٩', 78, 62, 3.6, 'white', 11.4),
          T('ok', 'نتحقّق ✓', 78, 72, 3.4, 'good', 12),
        ],
      },
      {
        title: 'انتبهي للباقي!',
        say: 'هل ٢٥٤ ÷ ٩ = ٢٧ والباقي ١١؟ خطأ! الباقي ١١ أكبر من ٩، ففيه مجموعة أخرى من ٩. الصواب: ٢٨ والباقي ٢، لأن الباقي دائمًا أصغر من المقسوم عليه.',
        duration: 15,
        bg: 'board',
        actors: [
          Q('w', '٢٥٤ ÷ ٩ = ٢٧ والباقي ١١', 50, 20, 4.6, 'white', 0.3, { anim: [{ at: 2.4, effect: 'shake' }, { at: 9, to: { opacity: 0.3 }, dur: 0.5 }] }),
          T('x', '✗', 82, 20, 6, 'red', 2.2),
          ...Array.from({ length: 11 }, (_, i): Actor => dot(`c${i}`, 24 + i * 5.2, 46, 3.4 + i * 0.1, i < 9 ? 'sun' : 'orange', 3.6)),
          T('cl', 'الباقي ١١', 50, 36, 3.4, 'orange', 3.6),
          { id: 'grp', kind: 'shape', shape: 'pill', x: 44.8, y: 46, w: 46, h: 13, color: 'good', outline: true, in: 5.4, anim: [{ at: 5.6, effect: 'pulse' }] },
          T('gl', 'مجموعة أخرى من ٩!', 44.8, 60, 3.6, 'good', 6),
          T('rl', 'يبقى ٢', 80, 60, 3.4, 'orange', 7),
          Q('r', '٢٥٤ ÷ ٩ = ٢٨ والباقي ٢', 50, 76, 4.6, LG, 9.4, { anim: [{ at: 9.8, effect: 'glow' }] }),
          T('rule', 'الباقي أصغر من المقسوم عليه', 50, 89, 3.6, 'sun', 11.2, { box: true }),
        ],
      },
      {
        title: 'الخلاصة',
        say: 'في القسمة المختصرة: نقدّر أولًا، ثم نقسم من المنزلة الكبرى ونحمل الباقي إلى المنزلة التالية، ثم نتحقّق بالضرب. والباقي دائمًا أصغر من المقسوم عليه.',
        duration: 13,
        bg: 'board',
        actors: [
          T('s1', '١ نقدّر أولًا 🎯', 50, 22, 4.2, 'sun', 0.4, { box: true }),
          T('s2', '٢ نقسم ونحمل الباقي', 50, 40, 4.2, 'sun', 2.4, { box: true }),
          T('s3', '٣ نتحقّق بالضرب ✓', 50, 58, 4.2, 'sun', 5, { box: true }),
          { id: 'a1', kind: 'arrow', from: [50, 27.5], to: [50, 33.5], color: 'white', in: 2 },
          { id: 'a2', kind: 'arrow', from: [50, 45.5], to: [50, 51.5], color: 'white', in: 4.6 },
          Q('ex', '١٠٤ ÷ ٤ = ٢٦', 50, 74, 4.4, 'white', 6.6),
          T('rule', 'الباقي أصغر من المقسوم عليه', 50, 88, 3.6, 'good', 8.6, { box: true, anim: [{ at: 9, effect: 'glow' }] }),
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm16-1',
    title: 'الأعداد الخاصة',
    scenes: [
      {
        title: 'عدد له صفات',
        say: 'لكل عدد صفات خاصة تعرّفنا به. العدد ٣٦ مثلًا: زوجي، وعدد مربّع، وله ٩ عوامل، ومجموع أرقامه ٩. لنتعرّف على هذه الصفات!',
        duration: 12,
        bg: 'board',
        actors: [
          Q('n', '٣٦', 50, 50, 14, 'white', 0.2, { anim: [{ at: 1, effect: 'float' }] }),
          T('t1', 'زوجي', 76, 26, 4.2, 'good', 2.2, { box: true }),
          T('t2', 'عدد مربّع', 24, 26, 4.2, 'sun', 3.4, { box: true }),
          T('t3', 'له ٩ عوامل', 76, 76, 4.2, 'purple', 4.8, { box: true }),
          T('t4', 'مجموع أرقامه ٩', 24, 76, 4.2, 'orange', 6.2, { box: true }),
          { id: 'a1', kind: 'arrow', from: [58, 42], to: [68, 32], color: 'white', dashed: true, in: 2 },
          { id: 'a2', kind: 'arrow', from: [42, 42], to: [32, 32], color: 'white', dashed: true, in: 3.2 },
          { id: 'a3', kind: 'arrow', from: [58, 60], to: [68, 70], color: 'white', dashed: true, in: 4.6 },
          { id: 'a4', kind: 'arrow', from: [42, 60], to: [32, 70], color: 'white', dashed: true, in: 6 },
        ],
      },
      {
        title: 'زوجي أم فردي؟',
        say: 'العدد الفردي مثل ٣ يبقى فيه قرص بلا شريك. إذا ضاعفناه نحصل على ٦: كل قرص يجد شريكه. لذلك ضعف أي عدد فردي يكون دائمًا عددًا زوجيًّا.',
        duration: 13,
        bg: 'board',
        actors: [
          ...[0, 1, 2].map((i): Actor => dot(`a${i}`, 46, 30 + i * 13, 0.4 + i * 0.3, 'orange', 5)),
          Q('l3', '٣', 46, 78, 5, 'orange', 1.4),
          T('odd', 'فردي', 26, 50, 4, 'orange', 2, { box: true, out: 7 }),
          { id: 'pr', kind: 'shape', shape: 'pill', x: 46, y: 37, w: 8, h: 26, color: 'rgba(255,255,255,0.14)', in: 2.6, out: 4.8 },
          T('al', 'بلا شريك', 30, 69, 3.4, 'white', 3, { out: 4.8 }),
          ...[0, 1, 2].map((i): Actor => dot(`b${i}`, 46, 30 + i * 13, 5, 'sun', 5, [{ at: 5.2, to: { x: 56 }, dur: 0.8 }])),
          ...[0, 1, 2].map((i): Actor => ({ id: `p${i}`, kind: 'shape', shape: 'pill', x: 51, y: 30 + i * 13, w: 15, h: 11, color: 'good', outline: true, in: 6.6 + i * 0.3 })),
          Q('dbl', '٣ × ٢ = ٦', 51, 78, 5, LG, 7.6, { anim: [{ at: 8, effect: 'pulse' }] }),
          T('even', 'زوجي', 78, 50, 4.4, 'good', 8.2, { box: true }),
          Q('ex', '٧ × ٢ = ١٤', 78, 66, 3.8, 'white', 9.6),
        ],
      },
      {
        title: 'الأعداد الأولية',
        say: 'العدد الأولي له عاملان فقط: ١ والعدد نفسه. الأعداد الأولية حتى ٢٠ هي ٢ و٣ و٥ و٧ و١١ و١٣ و١٧ و١٩. لاحظي: ٢ أولي وزوجي!',
        duration: 13,
        bg: 'board',
        actors: [
          ...Array.from({ length: 20 }, (_, i): Actor => {
            const n = i + 1;
            const prime = [2, 3, 5, 7, 11, 13, 17, 19].includes(n);
            const r = i < 10 ? 0 : 1;
            const c = i % 10;
            return T(`n${n}`, String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]), 86 - c * 8, 28 + r * 18, 4.6, 'white', 0.2 + i * 0.05, {
              ltr: true,
              anim: prime ? [{ at: 3.4, to: { scale: 1.3 }, dur: 0.5 }, { at: 4, effect: 'pulse' }] : [dim(3)],
            });
          }),
          T('def', 'عاملان فقط: ١ والعدد نفسه', 50, 68, 3.8, 'sun', 1.4, { box: true }),
          { id: 'r2', kind: 'shape', shape: 'circle', x: 78, y: 28.6, w: 6.5, h: 10.4, color: 'good', outline: true, in: 8.6 },
          T('two', '٢ أولي وزوجي ⭐', 50, 86, 4.2, 'good', 9, { box: true, anim: [{ at: 9.4, effect: 'glow' }] }),
        ],
      },
      {
        title: 'الأعداد المربّعة',
        say: 'العدد المربّع نرتّبه مربعًا: ١ × ١ = ١، و٢ × ٢ = ٤، و٣ × ٣ = ٩، و٤ × ٤ = ١٦. لاحظي كيف يكبر المربع صفًّا وعمودًا كل مرة!',
        duration: 13,
        bg: 'board',
        actors: [
          ...[1, 2, 3, 4].flatMap((n, k): Actor[] => {
            const cx = [84, 68, 48, 22][k];
            const sx = 4.4;
            const sy = 7;
            const t = 0.4 + k * 2.2;
            const dots: Actor[] = [];
            for (let r = 0; r < n; r++)
              for (let c = 0; c < n; c++) {
                const isNew = r === n - 1 || c === n - 1;
                dots.push(dot(`d${n}-${r}${c}`, cx + (c - (n - 1) / 2) * sx, 44 + (r - (n - 1) / 2) * sy, t + (isNew && n > 1 ? 0.6 : 0), isNew && n > 1 ? 'orange' : 'sun', 3.2));
              }
            const eq = ['١ × ١ = ١', '٢ × ٢ = ٤', '٣ × ٣ = ٩', '٤ × ٤ = ١٦'][k];
            return [...dots, Q(`e${n}`, eq, cx, 70, 3.4, 'white', t + 1)];
          }),
          T('sq', 'أعداد مربّعة: ١ ، ٤ ، ٩ ، ١٦', 50, 86, 4, 'sun', 10, { box: true, anim: [{ at: 10.4, effect: 'glow' }] }),
        ],
      },
      {
        title: 'المحقّقة: أيّ عدد؟',
        say: 'عدد مربّع بين ١٠ و٩٩، وزوجي، ومجموع أرقامه ٩. المربّعات هي ١٦ و٢٥ و٣٦ و٤٩ و٦٤ و٨١. نحذف الفردية، ثم نجمع الأرقام: ٣ + ٦ = ٩. إنه ٣٦!',
        duration: 15,
        bg: 'board',
        actors: [
          ...(
            [
              ['١٦', '٤ × ٤'],
              ['٢٥', '٥ × ٥'],
              ['٣٦', '٦ × ٦'],
              ['٤٩', '٧ × ٧'],
              ['٦٤', '٨ × ٨'],
              ['٨١', '٩ × ٩'],
            ] as const
          ).flatMap(([n, e], i): Actor[] => {
            const x = 84 - i * 13.6;
            const odd = i === 1 || i === 3 || i === 5;
            const anim: Anim[] = odd ? [dim(6.4)] : i === 2 ? [{ at: 10.6, to: { scale: 1.4, y: 44 }, dur: 0.6 }, { at: 11.4, effect: 'glow' }] : [dim(9.6)];
            return [Q(`n${i}`, n, x, 46, 6, 'white', 1.6 + i * 0.4, { anim }), Q(`e${i}`, e, x, 58, 2.8, 'sun', 1.8 + i * 0.4, { anim: i === 2 ? [] : [dim(odd ? 6.4 : 9.6)] })];
          }),
          T('c1', '١ مربّع بين ١٠ و٩٩', 50, 22, 3.8, 'sun', 0.4, { box: true, out: 5.6 }),
          T('c2', '٢ زوجي', 50, 22, 3.8, 'good', 5.8, { box: true, out: 8.8 }),
          T('c3', '٣ مجموع أرقامه ٩', 50, 22, 3.8, 'orange', 9, { box: true }),
          Q('s16', '١ + ٦ = ٧', 84, 72, 3.4, 'grey', 9.2, { out: 12 }),
          Q('s64', '٦ + ٤ = ١٠', 29.6, 72, 3.4, 'grey', 9.2, { out: 12 }),
          Q('s36', '٣ + ٦ = ٩ ✓', 56.8, 72, 3.8, LG, 10),
          T('res', 'إنه ٣٦ 🔍', 50, 87, 4.4, 'good', 12, { box: true }),
        ],
      },
      {
        title: 'مضاعفات وعوامل',
        say: 'عدد زوجي، من مضاعفات ٤، وعامل للعدد ٢٤، بين ١٠ و٢٠. مضاعفات ٤ هنا ١٢ و١٦. لكن ٢٤ يقبل القسمة على ١٢ فقط: ٢ × ١٢ = ٢٤. إنه ١٢!',
        duration: 15,
        bg: 'board',
        actors: [
          ...Array.from({ length: 11 }, (_, i): Actor => {
            const n = 10 + i;
            const anim: Anim[] = n % 2 === 1 ? [dim(4.6)] : n % 4 !== 0 ? [dim(7.6)] : n === 16 ? [dim(10.6)] : [{ at: 11.2, to: { scale: 1.45, y: 44 }, dur: 0.6 }, { at: 12, effect: 'glow' }];
            return Q(`n${n}`, String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]), 86 - i * 7.2, 46, 4.6, 'white', 0.8 + i * 0.1, { anim });
          }),
          T('c1', '١ زوجي', 50, 22, 3.8, 'good', 3.6, { box: true, out: 6.8 }),
          T('c2', '٢ من مضاعفات ٤', 50, 22, 3.8, 'sun', 7, { box: true, out: 9.8 }),
          Q('m4', '٤ × ٣ = ١٢     ٤ × ٤ = ١٦', 50, 64, 3.6, 'sun', 7.6, { out: 9.8 }),
          T('c3', '٣ عامل للعدد ٢٤', 50, 22, 3.8, 'orange', 10, { box: true }),
          Q('f', '٢ × ١٢ = ٢٤', 50, 66, 4.6, LG, 11),
          T('res', 'إنه ١٢ 🔍', 50, 85, 4.4, 'good', 12.6, { box: true }),
        ],
      },
      {
        title: 'مثال واحد يكفي',
        say: 'هل كل الأعداد الأولية فردية؟ لا! العدد ٢ أولي وزوجي. وهل كل مضاعف للعدد ٥ آحاده ٥؟ لا! العدد ١٠ آحاده ٠. لإثبات أن العبارة خاطئة يكفي مثال واحد.',
        duration: 15,
        bg: 'board',
        actors: [
          T('q1', 'كل الأعداد الأولية فردية؟', 62, 24, 3.8, 'white', 0.3, { box: true }),
          Q('x1', '٢', 22, 24, 7, 'sun', 2.6, { anim: [{ at: 2.8, effect: 'pulse' }] }),
          T('v1', 'خاطئة ✗', 62, 38, 3.6, 'bad', 3.8, { anim: [{ at: 4, effect: 'shake' }] }),
          T('q2', 'كل مضاعف للعدد ٥ آحاده ٥؟', 62, 56, 3.8, 'white', 5.6, { box: true }),
          Q('x2', '١٠', 22, 56, 7, 'sun', 8, { anim: [{ at: 8.2, effect: 'pulse' }] }),
          T('v2', 'خاطئة ✗', 62, 70, 3.6, 'bad', 9.2, { anim: [{ at: 9.4, effect: 'shake' }] }),
          T('rule', 'مثال واحد يكفي 💡', 50, 87, 4.2, 'good', 11, { box: true, anim: [{ at: 11.4, effect: 'glow' }] }),
        ],
      },
      {
        title: 'الخلاصة',
        say: 'نعرف العدد من صفاته: زوجي أو فردي، أولي، مربّع، من مضاعفات عدد، أو عامل لعدد. والعدد ٢ هو العدد الأولي الزوجي الوحيد.',
        duration: 13,
        bg: 'board',
        actors: [
          ...(
            [
              ['زوجي', '٢ ٤ ٦ ٨', 'good'],
              ['فردي', '١ ٣ ٥ ٧', 'orange'],
              ['أولي', '٢ ٣ ٥ ٧ ١١', 'accent'],
              ['مربّع', '١ ٤ ٩ ١٦ ٣٦', 'sun'],
              ['مضاعفات ٤', '٤ ٨ ١٢ ١٦', 'blue'],
              ['عوامل ٢٤', '١ ٢ ٣ ٤ ٦ ٨ ١٢ ٢٤', 'purple'],
            ] as const
          ).flatMap(([name, ex, col], i): Actor[] => {
            const x = [78, 50, 22][i % 3];
            const y = i < 3 ? 26 : 60;
            const t = 0.4 + i * 1.4;
            return [T(`h${i}`, name, x, y, 4, col, t, { box: true }), Q(`x${i}`, ex, x, y + 13, i === 5 ? 2.9 : 3.6, 'white', t + 0.4)];
          }),
          T('two', '٢ هو الأولي الزوجي الوحيد', 50, 89, 3.6, 'sun', 9.6),
        ],
      },
    ],
  },
];

/** Keep thousands groups such as «٢ ٠٠٥» together and in order in right-to-left text (narration and labels). */
const explainers: Explainer[] = raw.map((e) => ({
  ...e,
  scenes: e.scenes.map((sc) => ({
    ...sc,
    say: keepNumberGroups(sc.say),
    actors: sc.actors.map((a) => (a.kind === 'text' ? { ...a, text: keepNumberGroups(a.text) } : a)),
  })),
}));

export default explainers;
