import type { Actor, Anim, Explainer, Scene, TextActor } from '../../../../explain/types';
import { keepNumberGroups, toArabicDigits } from '../../../../lib/digits';

/*
 * Explainers for lessons m11-1, m11-2, m12-1 (unit m4).
 * Equations on the stage are LTR text actors with Arabic-Indic digits and the decimal comma «,».
 * Thousands are grouped with a space as in the book (١ ٠٨٠); see `keepNumberGroups` at the end.
 */

/* ---------- helpers ---------- */

/** 1080 → «١ ٠٨٠», 0.27 → «٠,٢٧» */
const fmtN = (v: number) => {
  const [i, d] = String(Math.round(v * 1000) / 1000).split('.');
  const g = i.length > 3 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : i;
  return toArabicDigits(d ? `${g}.${d}` : g);
};

const fade = (t: number): Anim => ({ at: t, to: { opacity: 0 }, dur: 0.3 });

interface Line {
  X: (v: number) => number;
  y: number;
  actors: Actor[];
}

/** A chalk number line from min to max (x 12 → 88). `labels` = values written under the line. */
function chalkLine(p: string, min: number, max: number, step: number, y: number, labels: number[], inAt = 0, x0 = 12, x1 = 88): Line {
  const X = (v: number) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  const count = Math.round((max - min) / step);
  const actors: Actor[] = [{ id: `${p}L`, kind: 'shape', shape: 'rect', x: (x0 + x1) / 2, y, w: x1 - x0 + 4, h: 0.6, color: 'white', in: inAt }];
  for (let i = 0; i <= count; i++) {
    const v = min + i * step;
    const major = labels.some((l) => Math.abs(l - v) < 1e-9);
    actors.push({ id: `${p}t${i}`, kind: 'shape', shape: 'rect', x: X(v), y, w: 0.3, h: major ? 6 : 3.4, color: 'white', in: inAt });
  }
  labels.forEach((v, k) => actors.push({ id: `${p}n${k}`, kind: 'text', text: fmtN(v), x: X(v), y: y + 7.5, size: 2.8, color: 'white', ltr: true, in: inAt }));
  return { X, y, actors };
}

const dot = (id: string, x: number, y: number, inAt: number, color = 'sun', anim?: Anim[]): Actor => ({ id, kind: 'shape', shape: 'circle', x, y, w: 2.2, h: 3.5, color, in: inAt, anim });

/** A jump arc above the line from a to b, with its label. */
function arc(id: string, L: Line, a: number, b: number, label: string, color: string, inAt: number, mag = 6): Actor[] {
  const xa = L.X(a);
  const xb = L.X(b);
  const yA = L.y - 3;
  return [
    { id, kind: 'arrow', from: [xa, yA], to: [xb, yA], curve: (b > a ? -1 : 1) * mag, color, in: inAt },
    { id: `${id}l`, kind: 'text', text: label, x: (xa + xb) / 2, y: yA - mag - 5, size: 3.2, color, ltr: true, in: inAt + 0.4 },
  ];
}

/* hieroglyphs (lesson m11-2) */
const stick = (id: string, x: number, y: number, inAt: number, anim?: Anim[]): Actor => ({ id, kind: 'shape', shape: 'rect', x, y, w: 0.6, h: 10, color: '#bfe0ff', in: inAt, anim });
const archS = (id: string, x: number, y: number, inAt: number, size = 8, anim?: Anim[]): Actor => ({ id, kind: 'text', text: '∩', x, y, size, color: '#bfe0ff', in: inAt, anim });
const glyph = (id: string, e: string, x: number, y: number, inAt: number, size = 6, anim?: Anim[]): Actor => ({ id, kind: 'emoji', emoji: e, x, y, size, in: inAt, anim });

/* place-value columns on the board (lesson m12-1) */
const PV = [
  { x: 15, n: ['المئات'] },
  { x: 28, n: ['العشرات'] },
  { x: 41, n: ['الآحاد'] },
  { x: 59, n: ['أجزاء', 'من عشرة'] },
  { x: 72, n: ['أجزاء', 'من مئة'] },
  { x: 85, n: ['أجزاء', 'من ألف'] },
];
const pvTable = (): Actor[] => [
  ...PV.flatMap((c, i): Actor[] => [
    { id: `col${i}`, kind: 'shape', shape: 'rect', x: c.x, y: 60, w: 12, h: 44, color: i > 2 ? 'rgba(255,200,61,0.16)' : 'rgba(255,255,255,0.14)' },
    ...c.n.map((t, k): Actor => ({ id: `name${i}-${k}`, kind: 'text', text: t, x: c.x, y: c.n.length === 1 ? 33 : 30.5 + k * 5, size: 2.4, color: 'white' })),
  ]),
  { id: 'comma', kind: 'text', text: ',', x: 50, y: 63, size: 9, color: 'white' },
];
const pd = (id: string, d: string, col: number, inAt: number, anim?: Anim[], color = 'sun'): TextActor => ({ id, kind: 'text', text: d, x: PV[col].x, y: 61, size: 9, color, ltr: true, in: inAt, anim });

/* ===================================================================== */
const raw: Explainer[] = [
  {
    lesson: 'm11-1',
    title: 'التقريب وخط الأعداد',
    scenes: [
      {
        title: 'لغز منى',
        say: 'تفكّر منى في عدد. تقرّبه إلى أقرب ١٠ فيصير ١ ٠٨٠، ثم تقرّب الناتج إلى أقرب ١٠٠ فيصير ١ ١٠٠. ما أصغر عدد يمكن أن تفكّر فيه؟ وما أكبره؟',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'muna', kind: 'emoji', emoji: '🧕', x: 80, y: 46, size: 20, anim: [{ at: 0.3, effect: 'float' }] },
          { id: 'think', kind: 'emoji', emoji: '🤔', x: 90, y: 22, size: 8, in: 0.6 },
          { id: 'q', kind: 'text', text: '؟', x: 40, y: 20, size: 8, color: 'sun', in: 0.8, anim: [{ at: 1.2, effect: 'pulse' }] },
          { id: 'a1', kind: 'arrow', from: [40, 29], to: [40, 41], color: 'white', in: 1.8 },
          { id: 'a1l', kind: 'text', text: 'أقرب ١٠', x: 22, y: 35, size: 3.4, box: true, color: 'blue', in: 2 },
          { id: 'n1', kind: 'text', text: '١ ٠٨٠', x: 40, y: 50, size: 6.5, color: 'white', ltr: true, in: 2.6 },
          { id: 'a2', kind: 'arrow', from: [40, 59], to: [40, 71], color: 'white', in: 4.4 },
          { id: 'a2l', kind: 'text', text: 'أقرب ١٠٠', x: 22, y: 65, size: 3.4, box: true, color: 'purple', in: 4.6 },
          { id: 'n2', kind: 'text', text: '١ ١٠٠', x: 40, y: 80, size: 6.5, color: 'white', ltr: true, in: 5.2 },
          { id: 'ask', kind: 'text', text: 'أصغر عدد؟ أكبر عدد؟', x: 76, y: 84, size: 3.6, box: true, color: 'sun', in: 7.5 },
        ],
      },
      ((): Scene => {
        const L = chalkLine('nl', 40, 60, 1, 52, [40, 45, 50, 55, 60], 0);
        return {
          title: 'كلها تُقرَّب إلى ٥٠',
          say: 'قُرِّب عدد إلى أقرب ١٠ فكان الجواب ٥٠. كل الأعداد الكاملة من ٤٥ إلى ٥٤ أقرب إلى ٥٠ منها إلى ٤٠ أو ٦٠، فتُقرَّب كلها إلى ٥٠.',
          duration: 12,
          bg: 'board',
          actors: [
            { id: 'band', kind: 'shape', shape: 'pill', x: (L.X(45) + L.X(54)) / 2, y: 52, w: L.X(54) - L.X(45) + 5, h: 9, color: 'rgba(255,200,61,0.22)', in: 1.2 },
            ...L.actors,
            { id: 'q', kind: 'text', text: 'أقرب ١٠ ← ٥٠', x: 50, y: 22, size: 4.2, box: true, color: 'blue', in: 0.4 },
            ...Array.from({ length: 10 }, (_, k) => dot(`d${k}`, L.X(45 + k), 52, 1.6 + k * 0.3, 'sun', [{ at: 6, to: { x: L.X(50) }, dur: 1 }])),
            { id: 'ring', kind: 'shape', shape: 'circle', x: L.X(50), y: 52, w: 5, h: 8, color: 'sun', outline: true, in: 7.2, anim: [{ at: 7.4, effect: 'pulse' }] },
            { id: 'res', kind: 'text', text: 'من ٤٥ إلى ٥٤ ← ٥٠', x: 50, y: 82, size: 4.4, box: true, color: 'good', in: 8, anim: [{ at: 8.4, effect: 'glow' }] },
          ],
        };
      })(),
      ((): Scene => {
        const L = chalkLine('nl', 40, 60, 1, 46, [40, 45, 50, 55, 60], 0);
        return {
          title: '٤٥ في المنتصف تمامًا',
          say: 'العدد ٤٥ في المنتصف تمامًا بين ٤٠ و٥٠، فنقرّبه إلى الأعلى. لذلك ننظر إلى رقم الآحاد: ٥ أو أكثر نقرّب إلى الأعلى، وأقل من ٥ إلى الأسفل.',
          duration: 13,
          bg: 'board',
          actors: [
            ...L.actors,
            dot('d', L.X(45), 46, 0.4),
            ...arc('j1', L, 45, 40, '٥', 'white', 1.2, 6),
            ...arc('j2', L, 45, 50, '٥', 'white', 2.2, 6),
            { id: 'mid', kind: 'text', text: 'في المنتصف ← إلى الأعلى', x: 50, y: 63, size: 3.6, color: 'sun', in: 3.4 },
            { id: 'up', kind: 'text', text: 'الآحاد ٥ أو أكثر ↑', x: 72, y: 76, size: 3.6, box: true, color: 'good', in: 6.2 },
            { id: 'upx', kind: 'text', text: '٤٥ ← ٥٠', x: 72, y: 88, size: 3.6, color: '#7be3a4', in: 7 },
            { id: 'dn', kind: 'text', text: 'الآحاد أقل من ٥ ↓', x: 28, y: 76, size: 3.6, box: true, color: 'orange', in: 8.4 },
            { id: 'dnx', kind: 'text', text: '٧٠٤ ← ٧٠٠', x: 28, y: 88, size: 3.6, color: 'orange', in: 9.2 },
          ],
        };
      })(),
      ((): Scene => {
        const L = chalkLine('nl', 1070, 1090, 1, 52, [1070, 1075, 1080, 1085, 1090], 0);
        return {
          title: 'الخطوة ١: أقرب ١٠',
          say: 'نحلّ لغز منى. أيّ الأعداد تُقرَّب إلى ١ ٠٨٠؟ تمامًا مثل ٤٥ إلى ٥٤ مع ٥٠: إنها الأعداد من ١ ٠٧٥ إلى ١ ٠٨٤.',
          duration: 12,
          bg: 'board',
          actors: [
            { id: 'band', kind: 'shape', shape: 'pill', x: (L.X(1075) + L.X(1084)) / 2, y: 52, w: L.X(1084) - L.X(1075) + 5, h: 9, color: 'rgba(255,200,61,0.22)', in: 1.4 },
            ...L.actors,
            { id: 'q', kind: 'text', text: 'أقرب ١٠ ← ١ ٠٨٠', x: 50, y: 22, size: 4.2, box: true, color: 'blue', in: 0.4 },
            ...Array.from({ length: 10 }, (_, k) => dot(`d${k}`, L.X(1075 + k), 52, 1.8 + k * 0.3, 'sun', [{ at: 6.2, to: { x: L.X(1080) }, dur: 1 }])),
            { id: 'ring', kind: 'shape', shape: 'circle', x: L.X(1080), y: 52, w: 5, h: 8, color: 'sun', outline: true, in: 7.4 },
            { id: 'res', kind: 'text', text: 'من ١ ٠٧٥ إلى ١ ٠٨٤', x: 50, y: 82, size: 4.4, box: true, color: 'good', in: 8, anim: [{ at: 8.4, effect: 'glow' }] },
          ],
        };
      })(),
      ((): Scene => {
        const L = chalkLine('nl', 1000, 1100, 10, 44, [1000, 1050, 1100], 0);
        return {
          title: 'الخطوة ٢: أقرب ١٠٠',
          say: 'العدد ١ ٠٨٠ يقع بين ١ ٠٠٠ و١ ١٠٠، وهو أقرب إلى ١ ١٠٠. إذن أصغر عدد تفكّر فيه منى ١ ٠٧٥، وأكبر عدد ١ ٠٨٤.',
          duration: 12,
          bg: 'board',
          actors: [
            ...L.actors,
            dot('d', L.X(1080), 44, 0.4),
            { id: 'dl', kind: 'text', text: '١ ٠٨٠', x: L.X(1080), y: 51.5, size: 2.8, color: 'sun', ltr: true, in: 0.4 },
            ...arc('j1', L, 1080, 1100, '٢٠', '#7be3a4', 1.6, 5),
            ...arc('j2', L, 1080, 1000, '٨٠', '#c9d1e8', 2.8, 9),
            { id: 'ok', kind: 'text', text: '١ ٠٨٠ ← ١ ١٠٠ ✓', x: 50, y: 64, size: 4, color: '#7be3a4', in: 4.4 },
            { id: 'min', kind: 'text', text: 'أصغر عدد: ١ ٠٧٥', x: 72, y: 82, size: 4.2, box: true, color: 'good', in: 6.4, anim: [{ at: 6.8, effect: 'glow' }] },
            { id: 'max', kind: 'text', text: 'أكبر عدد: ١ ٠٨٤', x: 28, y: 82, size: 4.2, box: true, color: 'good', in: 7.6, anim: [{ at: 8, effect: 'glow' }] },
          ],
        };
      })(),
      ((): Scene => {
        const L = chalkLine('nl', 9940, 10080, 20, 50, [10000], 0);
        return {
          title: 'أيّهما أقرب إلى ١٠ ٠٠٠؟',
          say: 'أيّهما أقرب إلى ١٠ ٠٠٠: ٩ ٩٦٠ أم ١٠ ٠٦٠؟ نحسب البُعد: ٩ ٩٦٠ يبعد ٤٠ فقط، و١٠ ٠٦٠ يبعد ٦٠. إذن ٩ ٩٦٠ هو الأقرب.',
          duration: 12,
          bg: 'board',
          actors: [
            ...L.actors,
            dot('a', L.X(9960), 50, 0.6, 'sun'),
            { id: 'al', kind: 'text', text: '٩ ٩٦٠', x: L.X(9960), y: 57.5, size: 2.8, color: 'sun', ltr: true, in: 0.6 },
            dot('b', L.X(10060), 50, 1, 'orange'),
            { id: 'bl', kind: 'text', text: '١٠ ٠٦٠', x: L.X(10060), y: 57.5, size: 2.8, color: 'orange', ltr: true, in: 1 },
            ...arc('j1', L, 9960, 10000, '٤٠', 'sun', 3, 6),
            ...arc('j2', L, 10060, 10000, '٦٠', 'orange', 5, 8),
            { id: 'res', kind: 'text', text: '٩ ٩٦٠ هو الأقرب ✓', x: 50, y: 80, size: 4.4, box: true, color: 'good', in: 8, anim: [{ at: 8.4, effect: 'glow' }] },
          ],
        };
      })(),
      ((): Scene => {
        const L = chalkLine('nl', 4200, 7800, 600, 50, [6000, 7200], 0);
        return {
          title: 'العدد في المنتصف',
          say: 'يقع ٦ ٠٠٠ في منتصف المسافة بين عدد مفقود و٧ ٢٠٠. من ٦ ٠٠٠ إلى ٧ ٢٠٠ المسافة ١ ٢٠٠، فنرجع المسافة نفسها: العدد المفقود ٤ ٨٠٠.',
          duration: 13,
          bg: 'board',
          actors: [
            ...L.actors,
            dot('m', L.X(6000), 50, 0.4, 'sun'),
            dot('r', L.X(7200), 50, 0.8, 'white'),
            { id: 'q', kind: 'text', text: '؟', x: L.X(4800), y: 58, size: 5, color: 'sun', in: 1, anim: [fade(7.4)] },
            ...arc('j1', L, 6000, 7200, '١ ٢٠٠', 'sun', 2.4, 7),
            ...arc('j2', L, 6000, 4800, '١ ٢٠٠', 'sun', 5, 7),
            dot('l', L.X(4800), 50, 6.6, '#7be3a4'),
            { id: 'ans', kind: 'text', text: '٤ ٨٠٠', x: L.X(4800), y: 57.5, size: 2.8, color: '#7be3a4', ltr: true, in: 7.6 },
            { id: 'eq', kind: 'text', text: '٦ ٠٠٠ − ١ ٢٠٠ = ٤ ٨٠٠', x: 50, y: 80, size: 4.6, color: 'white', ltr: true, in: 8.2, anim: [{ at: 8.6, effect: 'glow' }] },
          ],
        };
      })(),
      {
        title: 'الخلاصة',
        say: 'للتقريب إلى أقرب ١٠ ننظر إلى رقم الآحاد. ولنعرف أيّ العددين أقرب، نحسب بُعد كل منهما. والعدد في المنتصف يبعد المسافة نفسها عن العددين.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'e1', kind: 'emoji', emoji: '🎯', x: 84, y: 26, size: 8, in: 0.3 },
          { id: 't1', kind: 'text', text: 'الآحاد ٥ أو أكثر ← للأعلى', x: 50, y: 26, size: 4, box: true, color: 'blue', in: 0.6 },
          { id: 'e2', kind: 'emoji', emoji: '📏', x: 84, y: 52, size: 8, in: 4 },
          { id: 't2', kind: 'text', text: 'الأقرب = البُعد الأصغر', x: 50, y: 52, size: 4, box: true, color: 'good', in: 4.3 },
          { id: 'e3', kind: 'emoji', emoji: '⚖️', x: 84, y: 78, size: 8, in: 7.6 },
          { id: 't3', kind: 'text', text: 'المنتصف: المسافة نفسها', x: 50, y: 78, size: 4, box: true, color: 'purple', in: 7.9, anim: [{ at: 8.3, effect: 'glow' }] },
        ],
      },
    ],
  },

  /* ===================================================================== */
  {
    lesson: 'm11-2',
    title: 'الأعداد الهيروغليفية',
    scenes: [
      {
        title: 'أعداد بلا صفر!',
        say: 'كان المصريون القدماء يكتبون الأعداد برموز يرسمونها ويكرّرونها. والمدهش أن نظام الأعداد الهيروغليفي لم يستخدم الرقم صفر!',
        duration: 10,
        bg: 'board',
        actors: [
          { id: 'jar', kind: 'emoji', emoji: '🏺', x: 50, y: 44, size: 20, anim: [{ at: 0.3, effect: 'float' }] },
          stick('s', 20, 26, 1.2),
          archS('a', 80, 24, 1.6, 9),
          glyph('r', '🌀', 22, 58, 2, 7),
          glyph('l', '🪷', 78, 58, 2.4, 7),
          glyph('f', '☝️', 32, 80, 2.8, 7),
          glyph('g', '🐸', 68, 80, 3.2, 7),
          { id: 'zero', kind: 'text', text: '٠', x: 50, y: 82, size: 9, color: 'white', in: 5.4 },
          { id: 'x', kind: 'text', text: '✗', x: 50, y: 82, size: 12, color: 'red', in: 6.2, anim: [{ at: 6.4, effect: 'shake' }] },
          { id: 'nz', kind: 'text', text: 'لا يوجد صفر', x: 50, y: 18, size: 3.8, box: true, color: 'bad', in: 6.8 },
        ],
      },
      {
        title: 'ستة رموز',
        say: 'هذه رموز الأعداد: العصا ١، والقوس ١٠، والحبل الملفوف ١٠٠، وزهرة اللوتس ١ ٠٠٠، والإصبع ١٠ ٠٠٠، والضفدع ١٠٠ ٠٠٠.',
        duration: 13,
        bg: 'board',
        actors: [
          ...[
            { e: '|', v: '١', n: 'العصا' },
            { e: '∩', v: '١٠', n: 'القوس' },
            { e: '🌀', v: '١٠٠', n: 'الحبل الملفوف' },
            { e: '🪷', v: '١ ٠٠٠', n: 'زهرة اللوتس' },
            { e: '☝️', v: '١٠ ٠٠٠', n: 'الإصبع' },
            { e: '🐸', v: '١٠٠ ٠٠٠', n: 'الضفدع' },
          ].flatMap((s, i): Actor[] => {
            const x = 85 - i * 14;
            const t = 0.4 + i * 1.6;
            const sym: Actor = s.e === '|' ? stick('sy0', x, 38, t) : s.e === '∩' ? archS('sy1', x, 37, t, 9) : glyph(`sy${i}`, s.e, x, 38, t, 8);
            return [
              { id: `bg${i}`, kind: 'shape', shape: 'rect', x, y: 50, w: 12.5, h: 50, color: 'rgba(255,255,255,0.1)', in: t },
              sym,
              { id: `v${i}`, kind: 'text', text: s.v, x, y: 58, size: 3.4, color: 'sun', ltr: true, in: t + 0.4 },
              { id: `n${i}`, kind: 'text', text: s.n, x, y: 67, size: 2.2, color: 'white', in: t + 0.4 },
            ];
          }),
          { id: 'rule', kind: 'text', text: 'كل رمز = ١٠ أضعاف الذي قبله', x: 50, y: 86, size: 3.6, box: true, color: 'accent', in: 10.6 },
        ],
      },
      {
        title: 'عشرة أضعاف',
        say: 'كل رمز قيمته عشرة أضعاف الرمز الذي قبله: عشر عصي قيمتها ١٠، مثل قوس واحد. وعشرة أقواس قيمتها ١٠٠، مثل حبل ملفوف واحد.',
        duration: 12,
        bg: 'board',
        actors: [
          ...Array.from({ length: 10 }, (_, i) => stick(`s${i}`, 20 + i * 4, 32, 0.4 + i * 0.12, [{ at: 3.2, to: { x: 78, opacity: 0 }, dur: 0.9 }])),
          { id: 'sl', kind: 'text', text: '١٠ × ١', x: 38, y: 46, size: 3.4, color: 'white', ltr: true, in: 1.8 },
          { id: 'sa', kind: 'arrow', from: [62, 32], to: [72, 32], color: 'sun', in: 2.6 },
          archS('A', 80, 30, 3.9, 10, [{ at: 4.1, effect: 'pulse' }]),
          { id: 'Al', kind: 'text', text: '= ١٠', x: 80, y: 46, size: 3.4, color: 'sun', ltr: true, in: 4.1 },
          ...Array.from({ length: 10 }, (_, i) => archS(`a${i}`, 20 + i * 4.2, 68, 5.4 + i * 0.12, 5, [{ at: 7.6, to: { x: 80, opacity: 0 }, dur: 0.9 }])),
          { id: 'al', kind: 'text', text: '١٠ × ١٠', x: 39, y: 82, size: 3.4, color: 'white', ltr: true, in: 6.6 },
          { id: 'aa', kind: 'arrow', from: [64, 68], to: [72, 68], color: 'sun', in: 7 },
          glyph('R', '🌀', 80, 67, 8.3, 9, [{ at: 8.5, effect: 'pulse' }]),
          { id: 'Rl', kind: 'text', text: '= ١٠٠', x: 80, y: 82, size: 3.4, color: 'sun', ltr: true, in: 8.5 },
        ],
      },
      {
        title: 'نقرأ العدد',
        say: 'لنقرأ هذه الرموز: حبل ملفوف قيمته ١٠٠، وقوس قيمته ١٠، وثلاث عصي قيمتها ٣. نجمع القيم: ١٠٠ + ١٠ + ٣ = ١١٣.',
        duration: 12,
        bg: 'board',
        actors: [
          glyph('r', '🌀', 24, 36, 0.3, 10),
          archS('a', 46, 34, 0.5, 12),
          stick('s1', 64, 36, 0.7),
          stick('s2', 69, 36, 0.8),
          stick('s3', 74, 36, 0.9),
          { id: 'v1', kind: 'text', text: '١٠٠', x: 24, y: 60, size: 5.5, color: 'sun', in: 2 },
          { id: 'p1', kind: 'text', text: '+', x: 35, y: 60, size: 5.5, color: 'white', in: 6.6 },
          { id: 'v2', kind: 'text', text: '١٠', x: 46, y: 60, size: 5.5, color: 'sun', in: 3.4 },
          { id: 'p2', kind: 'text', text: '+', x: 57, y: 60, size: 5.5, color: 'white', in: 6.8 },
          { id: 'v3', kind: 'text', text: '٣', x: 69, y: 60, size: 5.5, color: 'sun', in: 4.8 },
          { id: 'eqs', kind: 'text', text: '=', x: 80, y: 60, size: 5.5, color: 'white', in: 7.4 },
          { id: 'res', kind: 'text', text: '١١٣', x: 90, y: 60, size: 5.5, color: '#7be3a4', in: 7.8, anim: [{ at: 8.2, effect: 'glow' }] },
          { id: 'tip', kind: 'text', text: 'نجمع قيم الرموز', x: 50, y: 84, size: 3.8, box: true, color: 'accent', in: 8.6 },
        ],
      },
      {
        title: 'نكتب ٥ ٩٤٦',
        say: 'نكتب ٥ ٩٤٦ بالرموز: نفكّكه حسب منازله، ثم نرسم خمس زهرات لوتس، وتسعة حبال ملفوفة، وأربعة أقواس، وست عصي.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'eq', kind: 'text', text: '٥ ٩٤٦ = ٥ ٠٠٠ + ٩٠٠ + ٤٠ + ٦', x: 50, y: 18, size: 4.2, color: 'white', ltr: true, in: 0.3 },
          { id: 'r1', kind: 'text', text: '٥ ٠٠٠', x: 85, y: 35, size: 3.8, color: 'sun', ltr: true, in: 2 },
          ...Array.from({ length: 5 }, (_, i) => glyph(`l${i}`, '🪷', 70 - i * 7, 35, 2.4 + i * 0.2, 5.5)),
          { id: 'r2', kind: 'text', text: '٩٠٠', x: 85, y: 51, size: 3.8, color: 'sun', ltr: true, in: 4.2 },
          ...Array.from({ length: 9 }, (_, i) => glyph(`h${i}`, '🌀', 70 - i * 6.5, 51, 4.6 + i * 0.15, 5)),
          { id: 'r3', kind: 'text', text: '٤٠', x: 85, y: 66, size: 3.8, color: 'sun', ltr: true, in: 6.8 },
          ...Array.from({ length: 4 }, (_, i) => archS(`t${i}`, 70 - i * 6.5, 65, 7.2 + i * 0.2, 6)),
          { id: 'r4', kind: 'text', text: '٦', x: 85, y: 82, size: 3.8, color: 'sun', ltr: true, in: 8.8 },
          ...Array.from({ length: 6 }, (_, i) => stick(`o${i}`, 70 - i * 4, 82, 9.2 + i * 0.15)),
        ],
      },
      {
        title: 'لا رمز للصفر',
        say: 'والعدد ٢٠ ٦٨٠؟ نرسم إصبعين، وستة حبال ملفوفة، وثمانية أقواس. منزلتا الألوف والآحاد صفر، فلا نرسم لهما أي رمز.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'eq', kind: 'text', text: '٢٠ ٦٨٠ = ٢٠ ٠٠٠ + ٦٠٠ + ٨٠', x: 50, y: 18, size: 4.2, color: 'white', ltr: true, in: 0.3 },
          { id: 'r1', kind: 'text', text: '٢٠ ٠٠٠', x: 85, y: 34, size: 3.8, color: 'sun', ltr: true, in: 1.8 },
          ...Array.from({ length: 2 }, (_, i) => glyph(`f${i}`, '☝️', 70 - i * 7, 34, 2.2 + i * 0.2, 5.5)),
          { id: 'r2', kind: 'text', text: '٦٠٠', x: 85, y: 49, size: 3.8, color: 'sun', ltr: true, in: 3.4 },
          ...Array.from({ length: 6 }, (_, i) => glyph(`h${i}`, '🌀', 70 - i * 6.5, 49, 3.8 + i * 0.15, 5)),
          { id: 'r3', kind: 'text', text: '٨٠', x: 85, y: 63, size: 3.8, color: 'sun', ltr: true, in: 5.2 },
          ...Array.from({ length: 8 }, (_, i) => archS(`t${i}`, 70 - i * 6.5, 62, 5.6 + i * 0.15, 6)),
          { id: 'z', kind: 'shape', shape: 'rect', x: 48, y: 82, w: 60, h: 13, color: 'rgba(255,255,255,0.5)', outline: true, in: 8 },
          { id: 'zl', kind: 'text', text: 'الألوف ٠ والآحاد ٠ ← لا نرسم شيئًا', x: 48, y: 82, size: 3.2, color: 'white', in: 8.4 },
          { id: 'zx', kind: 'text', text: '٠ ✗', x: 88, y: 82, size: 4.6, color: '#ff8a8a', in: 9.2, anim: [{ at: 9.4, effect: 'shake' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'في نظامنا نكتب ١٠٨ بثلاثة أرقام، والصفر في منزلة العشرات. أما الهيروغليفي فيكرّر الرموز ونجمع قيمها: حبل ملفوف وثماني عصي، بلا صفر.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'mid', kind: 'shape', shape: 'rect', x: 50, y: 50, w: 0.6, h: 66, color: 'rgba(255,255,255,0.3)', in: 0.2 },
          { id: 'h1', kind: 'text', text: 'نظامنا', x: 75, y: 24, size: 4.4, box: true, color: 'blue', in: 0.4 },
          { id: 'n1', kind: 'text', text: '١٠٨', x: 75, y: 50, size: 11, color: 'white', in: 1 },
          { id: 'z', kind: 'shape', shape: 'circle', x: 75, y: 50, w: 6, h: 14, color: 'sun', outline: true, in: 2.6 },
          { id: 'zt', kind: 'text', text: 'نستعمل الصفر', x: 75, y: 75, size: 3.6, color: 'sun', in: 3 },
          { id: 'h2', kind: 'text', text: 'الهيروغليفي', x: 25, y: 24, size: 4.4, box: true, color: 'orange', in: 5.4 },
          glyph('r', '🌀', 11, 50, 6, 7),
          ...Array.from({ length: 8 }, (_, i) => stick(`s${i}`, 19 + i * 3, 50, 6.6 + i * 0.12)),
          { id: 'eq', kind: 'text', text: '١٠٠ + ٨ = ١٠٨', x: 25, y: 66, size: 3.6, color: 'white', ltr: true, in: 8 },
          { id: 'ht', kind: 'text', text: 'نكرّر الرموز ونجمع', x: 25, y: 77, size: 3.6, color: 'sun', in: 8.8 },
          { id: 'nz', kind: 'text', text: 'بلا صفر', x: 25, y: 88, size: 3.6, box: true, color: 'bad', in: 10 },
        ],
      },
    ],
  },

  /* ===================================================================== */
  {
    lesson: 'm12-1',
    title: 'النظام العشري',
    scenes: [
      {
        title: 'لغز جميلة',
        say: 'تفكّر جميلة في عدد عشري له رقمان عشريان. الرقم في منزلة الأجزاء من مئة يزيد بمقدار ٤ عن الرقم في منزلة الأجزاء من عشرة، ومجموعهما ١٠.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'jam', kind: 'emoji', emoji: '👩', x: 84, y: 40, size: 18, anim: [{ at: 0.3, effect: 'float' }] },
          { id: 'd0', kind: 'text', text: '٠', x: 22, y: 38, size: 10, color: 'white', in: 0.5 },
          { id: 'dc', kind: 'text', text: ',', x: 30, y: 40, size: 10, color: 'white', in: 0.5 },
          { id: 'd1', kind: 'text', text: '؟', x: 40, y: 38, size: 10, color: 'sun', in: 1.2, anim: [{ at: 1.6, effect: 'pulse' }] },
          { id: 'd2', kind: 'text', text: '؟', x: 56, y: 38, size: 10, color: 'orange', in: 1.8, anim: [{ at: 2.2, effect: 'pulse' }] },
          { id: 'l1', kind: 'text', text: 'أجزاء من عشرة', x: 40, y: 56, size: 2.6, color: 'sun', in: 2.6 },
          { id: 'l2', kind: 'text', text: 'أجزاء من مئة', x: 58, y: 63, size: 2.6, color: 'orange', in: 3.2 },
          { id: 'c1', kind: 'text', text: 'يزيد بمقدار ٤', x: 66, y: 84, size: 3.8, box: true, color: 'orange', in: 5.6 },
          { id: 'c2', kind: 'text', text: 'المجموع ١٠', x: 30, y: 84, size: 3.8, box: true, color: 'blue', in: 8.4 },
        ],
      },
      {
        title: 'الواحد ← ١٠ أجزاء',
        say: 'لنفهم المنازل العشرية. نقسم الواحد الكامل إلى ١٠ أجزاء متساوية. كل جزء منها جزء من عشرة، ونكتبه ٠,١',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'whole', kind: 'shape', shape: 'rect', x: 50, y: 38, w: 74, h: 20, color: 'sun', in: 0.3, anim: [fade(2.6)] },
          { id: 'one', kind: 'text', text: '١', x: 50, y: 18, size: 5, color: 'white', in: 0.6, anim: [fade(2.6)] },
          ...Array.from({ length: 10 }, (_, i): Actor => ({
            id: `p${i}`,
            kind: 'shape',
            shape: 'rect',
            x: 50 + (i - 4.5) * 7.4,
            y: 38,
            w: 6.6,
            h: 20,
            color: i === 9 ? 'orange' : 'sun',
            in: 2.6,
            anim: i === 9 ? [{ at: 5.6, to: { x: 50, y: 70 }, dur: 1 }] : undefined,
          })),
          { id: 'ten', kind: 'text', text: '١٠ أجزاء متساوية', x: 50, y: 56, size: 3.6, color: 'white', in: 3.4, anim: [fade(5.4)] },
          { id: 'v', kind: 'text', text: '٠,١', x: 32, y: 70, size: 7, color: 'orange', in: 7, anim: [{ at: 7.4, effect: 'glow' }] },
          { id: 'n', kind: 'text', text: 'جزء من عشرة', x: 72, y: 70, size: 4, box: true, color: 'orange', in: 7.6 },
        ],
      },
      {
        title: 'ثم ١٠٠ جزء',
        say: 'والآن نقسم كل جزء من عشرة إلى ١٠ أجزاء أصغر، فيصير الواحد ١٠٠ جزء. كل جزء صغير جزء من مئة: ٠,٠١. وإذا قسمنا مرة أخرى نحصل على أجزاء من ألف.',
        duration: 14,
        bg: 'paper',
        actors: [
          { id: 'sq', kind: 'math', math: { type: 'hundredSquare', shaded: 0 }, x: 30, y: 54, w: 36, in: 0.3 },
          { id: 'sq10', kind: 'math', math: { type: 'hundredSquare', shaded: 10, color: '#ff8a3d' }, x: 30, y: 54, w: 36, in: 2, anim: [fade(6)] },
          { id: 'sq1', kind: 'math', math: { type: 'hundredSquare', shaded: 1, color: '#e04848' }, x: 30, y: 54, w: 36, in: 6 },
          { id: 't0', kind: 'text', text: 'الواحد = ١٠٠ جزء', x: 74, y: 24, size: 3.8, color: 'ink', in: 0.8 },
          { id: 't1', kind: 'text', text: '٠,١ = ١٠ أجزاء من مئة', x: 74, y: 42, size: 3.6, box: true, color: 'orange', in: 2.6 },
          { id: 't2', kind: 'text', text: '٠,٠١', x: 74, y: 60, size: 7, color: 'red', in: 6.6, anim: [{ at: 7, effect: 'glow' }] },
          { id: 't2n', kind: 'text', text: 'جزء من مئة', x: 74, y: 72, size: 3.6, color: 'red', in: 7.2 },
          { id: 't3', kind: 'text', text: '٠,٠٠١ جزء من ألف', x: 74, y: 87, size: 3.4, box: true, color: 'purple', in: 10.4 },
        ],
      },
      {
        title: 'قيمة الرقم ٩',
        say: 'قيمة الرقم تعتمد على منزلته. الرقم ٩ في ٧٢,٩ قيمته ٠,٩، وفي ٣٩٢,٧٥ قيمته ٩٠، وفي ١٣,٠٩ قيمته ٠,٠٩',
        duration: 13,
        bg: 'paper',
        actors: [
          { id: 'a', kind: 'math', math: { type: 'placeValue', number: '72.9', highlight: [2] }, x: 36, y: 25, w: 40, in: 0.4 },
          { id: 'ar', kind: 'arrow', from: [60, 25], to: [70, 25], color: 'accent', in: 1.6 },
          { id: 'av', kind: 'text', text: '٠,٩', x: 81, y: 25, size: 5, box: true, color: 'accent', in: 2 },
          { id: 'b', kind: 'math', math: { type: 'placeValue', number: '392.75', highlight: [1] }, x: 36, y: 52, w: 52, in: 3.6 },
          { id: 'br', kind: 'arrow', from: [64, 52], to: [72, 52], color: 'accent', in: 4.8 },
          { id: 'bv', kind: 'text', text: '٩٠', x: 81, y: 52, size: 5, box: true, color: 'accent', in: 5.2 },
          { id: 'c', kind: 'math', math: { type: 'placeValue', number: '13.09', highlight: [3] }, x: 36, y: 79, w: 46, in: 6.8 },
          { id: 'cr', kind: 'arrow', from: [62, 79], to: [70, 79], color: 'accent', in: 8 },
          { id: 'cv', kind: 'text', text: '٠,٠٩', x: 81, y: 79, size: 5, box: true, color: 'accent', in: 8.4, anim: [{ at: 8.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'نحلّ لغز جميلة',
        say: 'نجرّب أزواج الأرقام التي مجموعها ١٠، ونبحث عن الزوج الذي الفرق بينهما ٤: إنه ٣ و٧. الأكبر ٧ في الأجزاء من مئة، فالعدد ٠,٣٧',
        duration: 13,
        bg: 'board',
        actors: [
          ...[
            ['١ + ٩', 'الفرق ٨'],
            ['٢ + ٨', 'الفرق ٦'],
            ['٣ + ٧', 'الفرق ٤'],
            ['٤ + ٦', 'الفرق ٢'],
          ].flatMap(([p, d], i): Actor[] => {
            const y = 22 + i * 15;
            const ok = i === 2;
            const t = 0.6 + i * 1.3;
            return [
              { id: `p${i}`, kind: 'text', text: p, x: 82, y, size: 4.4, color: 'white', ltr: true, in: t },
              { id: `d${i}`, kind: 'text', text: `${d} ${ok ? '✓' : '✗'}`, x: 62, y, size: 3.6, color: ok ? '#7be3a4' : '#ff8a8a', in: t + 0.5, anim: ok ? [{ at: 6.4, effect: 'glow' }] : [{ at: 6.4, to: { opacity: 0.4 }, dur: 0.5 }] },
            ];
          }),
          { id: 'ans', kind: 'text', text: '٠,٣٧', x: 24, y: 40, size: 11, color: 'sun', in: 8, anim: [{ at: 8.4, effect: 'glow' }] },
          { id: 'a1', kind: 'text', text: '٣ ← أجزاء من عشرة', x: 24, y: 62, size: 3, color: 'white', in: 9 },
          { id: 'a2', kind: 'text', text: '٧ ← أجزاء من مئة', x: 24, y: 72, size: 3, color: 'white', in: 9.6 },
          { id: 'ex', kind: 'text', text: '٧ − ٣ = ٤', x: 24, y: 86, size: 3.8, color: 'orange', ltr: true, in: 10.4 },
        ],
      },
      {
        title: 'من الأصغر إلى الأكبر',
        say: 'لنرتّب هذه الأعداد من الأصغر إلى الأكبر. نقارن الجزء الكامل أولًا: ٠ أصغر من ١. ثم نقارن الأجزاء من عشرة، ثم الأجزاء من مئة.',
        duration: 14,
        bg: 'board',
        actors: [
          ...[
            { t: '١,٠١', from: 82, to: 34 },
            { t: '١,١', from: 66, to: 18 },
            { t: '٠,١', from: 50, to: 66 },
            { t: '٠,١١', from: 34, to: 50 },
            { t: '٠,٠١', from: 18, to: 82 },
          ].map(
            (c, i): Actor => ({
              id: `c${i}`,
              kind: 'text',
              text: c.t,
              x: c.from,
              y: 26,
              size: 4.6,
              box: true,
              color: c.t.startsWith('٠') ? 'blue' : 'purple',
              in: 0.3 + i * 0.25,
              anim: [{ at: 4.2 + i * 0.5, to: { x: c.to, y: 60 }, dur: 1 }],
            }),
          ),
          { id: 'g0', kind: 'text', text: 'الجزء الكامل ٠', x: 66, y: 45, size: 3, color: '#9fc4ff', in: 3.2 },
          { id: 'g1', kind: 'text', text: 'الجزء الكامل ١', x: 26, y: 45, size: 3, color: '#d6b8ff', in: 3.6 },
          { id: 'sep', kind: 'shape', shape: 'rect', x: 42, y: 56, w: 0.5, h: 26, color: 'rgba(255,255,255,0.35)', in: 7 },
          { id: 'ar', kind: 'arrow', from: [88, 80], to: [12, 80], color: 'sun', in: 8.4 },
          { id: 'al', kind: 'text', text: 'من الأصغر إلى الأكبر', x: 50, y: 89, size: 3.4, color: 'sun', in: 8.8 },
        ],
      },
      {
        title: 'الضرب والقسمة على ١٠٠',
        say: 'عند الضرب في ١٠٠ ينتقل كل رقم منزلتين إلى اليسار: ٧,٢ يصبح ٧٢٠. وعند القسمة على ١٠٠ ينتقل كل رقم منزلتين إلى اليمين: ٢٧,٣ يصبح ٠,٢٧٣',
        duration: 16,
        bg: 'board',
        actors: [
          ...pvTable(),
          // 7,2 × 100
          pd('a7', '٧', 2, 0.3, [{ at: 1.8, to: { x: PV[0].x }, dur: 1.2 }, fade(7.4)]),
          pd('a2', '٢', 3, 0.3, [{ at: 1.8, to: { x: PV[1].x }, dur: 1.2 }, fade(7.4)]),
          pd('a0', '٠', 2, 3.3, [fade(7.4)], 'orange'),
          { id: 'ar1', kind: 'arrow', from: [44, 16], to: [14, 16], color: 'sun', in: 1.2, out: 7.4 },
          { id: 'ar1l', kind: 'text', text: 'منزلتان إلى اليسار', x: 29, y: 22.5, size: 3, color: 'sun', in: 1.6, out: 7.4 },
          { id: 'e1', kind: 'text', text: '٧,٢ × ١٠٠ = ٧٢٠', x: 50, y: 89, size: 4.6, color: 'white', ltr: true, in: 4, out: 7.4, anim: [{ at: 4.4, effect: 'glow' }] },
          // 27,3 ÷ 100
          pd('b2', '٢', 1, 7.8, [{ at: 9.4, to: { x: PV[3].x }, dur: 1.2 }]),
          pd('b7', '٧', 2, 7.8, [{ at: 9.4, to: { x: PV[4].x }, dur: 1.2 }]),
          pd('b3', '٣', 3, 7.8, [{ at: 9.4, to: { x: PV[5].x }, dur: 1.2 }]),
          pd('b0', '٠', 2, 10.9, undefined, 'orange'),
          { id: 'ar2', kind: 'arrow', from: [56, 16], to: [86, 16], color: '#7be3a4', in: 8.8 },
          { id: 'ar2l', kind: 'text', text: 'منزلتان إلى اليمين', x: 71, y: 22.5, size: 3, color: '#7be3a4', in: 9.2 },
          { id: 'e2', kind: 'text', text: '٢٧,٣ ÷ ١٠٠ = ٠,٢٧٣', x: 50, y: 89, size: 4.6, color: 'white', ltr: true, in: 11.6, anim: [{ at: 12, effect: 'glow' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'كل منزلة إلى اليمين أصغر بعشر مرات: آحاد، ثم أجزاء من عشرة، ثم من مئة، ثم من ألف. وعند الضرب في ١٠ أو ١٠٠ تنتقل الأرقام إلى منازل أكبر.',
        duration: 14,
        bg: 'board',
        actors: [
          ...[
            { v: '١', n: 'الآحاد' },
            { v: '٠,١', n: 'أجزاء من عشرة' },
            { v: '٠,٠١', n: 'أجزاء من مئة' },
            { v: '٠,٠٠١', n: 'أجزاء من ألف' },
          ].flatMap((c, i): Actor[] => {
            const x = 16 + i * 22.6;
            const t = 0.4 + i * 1.4;
            return [
              { id: `v${i}`, kind: 'text', text: c.v, x, y: 30, size: 5.2, box: true, color: ['sun', 'orange', 'red', 'purple'][i], in: t },
              { id: `n${i}`, kind: 'text', text: c.n, x, y: 44, size: 2.6, color: 'white', in: t + 0.3 },
            ];
          }),
          ...[0, 1, 2].map((i): Actor => ({ id: `ar${i}`, kind: 'arrow', from: [22 + i * 22.6, 22], to: [32.6 + i * 22.6, 22], curve: -3, color: 'sun', in: 1.4 + i * 1.4 })),
          ...[0, 1, 2].map((i): Actor => ({ id: `al${i}`, kind: 'text', text: '÷ ١٠', x: 27.3 + i * 22.6, y: 13.5, size: 2.6, color: 'sun', ltr: true, in: 1.6 + i * 1.4 })),
          { id: 'm', kind: 'text', text: '× ١٠٠ ← منزلتان إلى اليسار', x: 50, y: 66, size: 3.8, box: true, color: 'blue', in: 7.6 },
          { id: 'd', kind: 'text', text: '÷ ١٠٠ ← منزلتان إلى اليمين', x: 50, y: 82, size: 3.8, box: true, color: 'good', in: 9.6, anim: [{ at: 10, effect: 'glow' }] },
        ],
      },
    ],
  },
];

/** Keep thousands groups such as «١ ٠٨٠» together and in order in right-to-left text (narration and labels). */
const explainers: Explainer[] = raw.map((e) => ({
  ...e,
  scenes: e.scenes.map((sc) => ({
    ...sc,
    say: keepNumberGroups(sc.say),
    actors: sc.actors.map((a) => (a.kind === 'text' ? { ...a, text: keepNumberGroups(a.text) } : a)),
  })),
}));

export default explainers;
