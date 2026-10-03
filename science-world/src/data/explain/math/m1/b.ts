import type { Actor, Anim } from '../../../../explain/types';
import type { Explainer } from '../../../../explain/types';

/* ---------- small helpers (positions are % of the stage) ---------- */

/** A unit square (16:10 stage → height = width × 1.6 so it looks square). */
const SQ = 7;
const sq = (id: string, x: number, y: number, inAt: number, color = 'sun', anim?: Anim[]): Actor => ({
  id,
  kind: 'shape',
  shape: 'rect',
  x,
  y,
  w: SQ,
  h: SQ * 1.6,
  color,
  in: inAt,
  anim,
});

/** Place-value table for lesson 3-1 (columns left → right, like the book). */
const PV_X = [22, 36, 50, 64, 78];
const PV_NAMES = [['عشرات', 'الألوف'], ['آحاد', 'الألوف'], ['المئات'], ['العشرات'], ['الآحاد']];
const pvTable = (): Actor[] =>
  PV_X.flatMap((x, i): Actor[] => [
    { id: `col${i}`, kind: 'shape', shape: 'rect', x, y: 60, w: 13, h: 44, color: 'rgba(255,255,255,0.14)' },
    ...PV_NAMES[i].map((t, k): Actor => ({ id: `name${i}-${k}`, kind: 'text', text: t, x, y: PV_NAMES[i].length === 1 ? 33 : 30.5 + k * 5, size: 2.5, color: 'white' })),
  ]);
/** «منزلة واحدة / منزلتان…» arrow above the table, with its label under it. */
const shift = (from: number, to: number, label: string, inAt: number): Actor[] => [
  { id: 'ar', kind: 'arrow', from: [from, 16], to: [to, 16], color: 'sun', in: inAt },
  { id: 'arl', kind: 'text', text: label, x: (from + to) / 2, y: 22.5, size: 3, color: 'sun', in: inAt + 0.4 },
];
const digit = (id: string, d: string, col: number, inAt = 0, anim?: Anim[], color = 'sun'): Actor => ({
  id,
  kind: 'text',
  text: d,
  x: PV_X[col],
  y: 61,
  size: 9,
  color,
  ltr: true,
  in: inAt,
  anim,
});

/* ---------- lesson 2-2 helpers ---------- */
const PAIR_X = [30, 50, 70];
/** n socks in a row that then slide into pairs (top/bottom); a last odd one goes to the right alone. */
const socks = (n: number, moveAt: number): Actor[] =>
  Array.from({ length: n }, (_, i): Actor => {
    const startX = 50 + (i - (n - 1) / 2) * 10;
    const pair = Math.floor(i / 2);
    const alone = n % 2 === 1 && i === n - 1;
    const to = alone ? { x: 88, y: 50 } : { x: PAIR_X[pair] ?? 70, y: i % 2 === 0 ? 38 : 60 };
    const anim: Anim[] = [{ at: moveAt + i * 0.25, to, dur: 0.9 }];
    if (alone) anim.push({ at: moveAt + n * 0.25 + 1.4, effect: 'shake' });
    return { id: `s${i}`, kind: 'emoji', emoji: '🧦', x: startX, y: 30, size: 8, in: 0.3 + i * 0.15, anim };
  });

const raw: Explainer[] = [
  /* =================================================================== */
  {
    lesson: 'm2-2',
    title: 'الفردي والزوجي',
    scenes: [
      {
        title: 'لكل جورب شريك؟',
        say: 'معنا ٦ جوارب. لنضعها أزواجًا… انظري: كل جورب وجد شريكه، ولم يبقَ أي جورب وحده. إذن ٦ عدد زوجي.',
        duration: 10,
        bg: 'board',
        actors: [
          ...socks(6, 2),
          ...PAIR_X.map((x, k): Actor => ({ id: `p${k}`, kind: 'shape', shape: 'pill', x, y: 49, w: 13, h: 42, color: 'rgba(255,255,255,0.12)', in: 4.4 + k * 0.3 })),
          { id: 'res', kind: 'text', text: '٦ ← عدد زوجي ✓', x: 50, y: 85, size: 4.6, box: true, color: 'good', in: 5.8, anim: [{ at: 6.2, effect: 'glow' }] },
        ],
      },
      {
        title: 'جورب بلا شريك',
        say: 'والآن ٧ جوارب. نكوّن الأزواج… فيبقى جورب واحد وحده بلا شريك. إذن ٧ عدد فردي.',
        duration: 10,
        bg: 'board',
        actors: [
          ...socks(7, 2),
          ...PAIR_X.map((x, k): Actor => ({ id: `p${k}`, kind: 'shape', shape: 'pill', x, y: 49, w: 13, h: 42, color: 'rgba(255,255,255,0.12)', in: 4.6 + k * 0.3 })),
          { id: 'alone', kind: 'text', text: 'وحده!', x: 88, y: 68, size: 4, color: 'sun', in: 5.2 },
          { id: 'res', kind: 'text', text: '٧ ← عدد فردي', x: 50, y: 85, size: 4.6, box: true, color: 'orange', in: 6.2, anim: [{ at: 6.6, effect: 'pulse' }] },
        ],
      },
      {
        title: 'يقبل القسمة على ٢',
        say: 'العدد الزوجي يقبل القسمة على ٢: نوزّع ٨ أقراص على مجموعتين، فيصير في كل مجموعة ٤ أقراص، ولا يبقى شيء.',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'g1', kind: 'shape', shape: 'rect', x: 70, y: 58, w: 26, h: 40, color: 'rgba(255,255,255,0.12)', in: 2.6 },
          { id: 'g2', kind: 'shape', shape: 'rect', x: 30, y: 58, w: 26, h: 40, color: 'rgba(255,255,255,0.12)', in: 2.6 },
          ...Array.from({ length: 8 }, (_, i): Actor => {
            const right = i % 2 === 0;
            const k = Math.floor(i / 2);
            const gx = (right ? 70 : 30) + (k % 2 === 0 ? -5 : 5);
            const gy = k < 2 ? 50 : 66;
            return { id: `c${i}`, kind: 'emoji', emoji: '🟡', x: 15 + i * 10, y: 26, size: 6, in: 0.3 + i * 0.15, anim: [{ at: 3 + i * 0.35, to: { x: gx, y: gy }, dur: 0.7 }] };
          }),
          { id: 'n1', kind: 'text', text: '٤', x: 70, y: 84, size: 5, color: 'sun', in: 6.2 },
          { id: 'n2', kind: 'text', text: '٤', x: 30, y: 84, size: 5, color: 'sun', in: 6.2 },
          { id: 'eq', kind: 'text', text: '٨ ÷ ٢ = ٤', x: 50, y: 84, size: 4.6, color: 'white', ltr: true, in: 7, anim: [{ at: 7.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'رقم الآحاد يُخبرنا',
        say: 'لا نحتاج إلى العدّ! ننظر إلى رقم الآحاد فقط: إذا كان ٠ أو ٢ أو ٤ أو ٦ أو ٨ فالعدد زوجي، وإذا كان ١ أو ٣ أو ٥ أو ٧ أو ٩ فالعدد فردي.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'le', kind: 'text', text: 'زوجي', x: 82, y: 36, size: 4.4, box: true, color: 'good', in: 0.8 },
          ...['٠', '٢', '٤', '٦', '٨'].map((d, i): Actor => ({ id: `e${i}`, kind: 'text', text: d, x: 66 - i * 12, y: 36, size: 5, color: 'green', box: true, in: 1.4 + i * 0.4 })),
          { id: 'lo', kind: 'text', text: 'فردي', x: 82, y: 66, size: 4.4, box: true, color: 'orange', in: 5.6 },
          ...['١', '٣', '٥', '٧', '٩'].map((d, i): Actor => ({ id: `o${i}`, kind: 'text', text: d, x: 66 - i * 12, y: 66, size: 5, color: 'orange', box: true, in: 6.2 + i * 0.4 })),
          { id: 'hint', kind: 'text', text: '👀 انظري إلى الآحاد', x: 50, y: 88, size: 3.6, color: 'sun', in: 9 },
        ],
      },
      {
        title: 'أعداد كبيرة؟ سهل!',
        say: 'حتى الأعداد الكبيرة: ٧ ٦٨٩ آحاده ٩، فهو عدد فردي. و٦ ٥٧٨ آحاده ٨، فهو عدد زوجي.',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'n1', kind: 'text', text: '٧ ٦٨', x: 28.4, y: 34, size: 8, color: 'white', ltr: true, in: 0.4 },
          { id: 'd1', kind: 'text', text: '٩', x: 42, y: 34, size: 8, color: 'orange', ltr: true, in: 0.4, anim: [{ at: 1.6, effect: 'pulse' }] },
          { id: 'r1', kind: 'shape', shape: 'circle', x: 42, y: 35, w: 9, h: 15, color: 'orange', outline: true, in: 1.4 },
          { id: 'a1', kind: 'arrow', from: [48, 34], to: [60, 34], color: 'orange', in: 2.2 },
          { id: 'l1', kind: 'text', text: 'عدد فردي', x: 74, y: 34, size: 4.4, box: true, color: 'orange', in: 2.8 },
          { id: 'n2', kind: 'text', text: '٦ ٥٧', x: 28.4, y: 68, size: 8, color: 'white', ltr: true, in: 5 },
          { id: 'd2', kind: 'text', text: '٨', x: 42, y: 68, size: 8, color: '#7be3a4', ltr: true, in: 5, anim: [{ at: 6.2, effect: 'pulse' }] },
          { id: 'r2', kind: 'shape', shape: 'circle', x: 42, y: 69, w: 9, h: 15, color: 'good', outline: true, in: 6 },
          { id: 'a2', kind: 'arrow', from: [48, 68], to: [60, 68], color: 'good', in: 6.8 },
          { id: 'l2', kind: 'text', text: 'عدد زوجي', x: 74, y: 68, size: 4.4, box: true, color: 'good', in: 7.4 },
        ],
      },
      {
        title: 'انتبهي!',
        say: 'انتبهي: لا ننظر إلى الرقم الأول. في العدد ٢٧ الرقم ٢ زوجي، لكن آحاده ٧، إذن ٢٧ عدد فردي.',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'n2', kind: 'text', text: '٢', x: 42, y: 50, size: 14, color: 'white', ltr: true, in: 0.3 },
          { id: 'n7', kind: 'text', text: '٧', x: 56, y: 50, size: 14, color: 'white', ltr: true, in: 0.3 },
          { id: 'aw', kind: 'arrow', from: [24, 31], to: [37, 42], color: 'red', in: 1.6 },
          { id: 'w', kind: 'text', text: 'زوجي؟ ✗', x: 20, y: 22, size: 4.2, box: true, color: 'bad', in: 1.8, anim: [{ at: 3.2, effect: 'shake' }] },
          { id: 'x', kind: 'text', text: '✗', x: 42, y: 50, size: 16, color: 'red', in: 3, anim: [{ at: 5.5, to: { opacity: 0, scale: 0.8 }, dur: 0.35 }] },
          { id: 'ring', kind: 'shape', shape: 'circle', x: 56, y: 51, w: 13, h: 22, color: 'good', outline: true, in: 5.6 },
          { id: 'ar', kind: 'arrow', from: [74, 76], to: [62, 62], color: 'good', in: 6.2 },
          { id: 'r', kind: 'text', text: 'الآحاد ٧ ← فردي ✓', x: 76, y: 85, size: 4.2, box: true, color: 'good', in: 6.8, anim: [{ at: 7.2, effect: 'glow' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'العدد الزوجي يقبل القسمة على ٢ وآحاده ٠ أو ٢ أو ٤ أو ٦ أو ٨. والعدد الفردي لا يقبل القسمة على ٢ وآحاده ١ أو ٣ أو ٥ أو ٧ أو ٩.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'ei', kind: 'emoji', emoji: '👟', x: 72, y: 24, size: 10, in: 0.3 },
          { id: 'et', kind: 'text', text: 'عدد زوجي', x: 72, y: 42, size: 5, box: true, color: 'good', in: 0.6 },
          { id: 'ed', kind: 'text', text: '٠ ٢ ٤ ٦ ٨', x: 72, y: 60, size: 5.5, color: '#7be3a4', in: 1.4 },
          { id: 'ex', kind: 'text', text: 'يقبل القسمة على ٢', x: 72, y: 78, size: 3.6, color: 'white', in: 2.4 },
          { id: 'oi', kind: 'emoji', emoji: '🧦', x: 28, y: 24, size: 10, in: 5.5 },
          { id: 'ot', kind: 'text', text: 'عدد فردي', x: 28, y: 42, size: 5, box: true, color: 'orange', in: 5.8 },
          { id: 'od', kind: 'text', text: '١ ٣ ٥ ٧ ٩', x: 28, y: 60, size: 5.5, color: 'sun', in: 6.6 },
          { id: 'ox', kind: 'text', text: 'لا يقبل القسمة على ٢', x: 28, y: 78, size: 3.6, color: 'white', in: 7.6 },
          { id: 'mid', kind: 'shape', shape: 'rect', x: 50, y: 52, w: 0.6, h: 70, color: 'rgba(255,255,255,0.3)', in: 0.2 },
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm2-3',
    title: 'الأعداد الأوليّة',
    scenes: [
      {
        title: 'مستطيلات من ٦ مربعات',
        say: 'معنا ٦ مربعات. نستطيع ترتيبها صفًّا واحدًا: ١ × ٦. ونستطيع ترتيبها صفّين: ٢ × ٣. إذن عوامل ٦ هي ١ و٢ و٣ و٦',
        duration: 12,
        bg: 'board',
        actors: [
          ...Array.from({ length: 6 }, (_, i) =>
            sq(`q${i}`, 50 + (i - 2.5) * 8, 40, 0.3 + i * 0.2, 'sun', [
              { at: 5 + i * 0.15, to: { x: 50 + ((i % 3) - 1) * 8, y: i < 3 ? 33 : 46 }, dur: 0.9 },
            ]),
          ),
          { id: 'l1', kind: 'text', text: '١ × ٦', x: 50, y: 60, size: 5, color: 'white', ltr: true, in: 2, anim: [{ at: 4.8, to: { opacity: 0, scale: 0.8 }, dur: 0.35 }] },
          { id: 'l2', kind: 'text', text: '٢ × ٣', x: 50, y: 63, size: 5, color: 'white', ltr: true, in: 6.6 },
          { id: 'f', kind: 'text', text: 'عوامل ٦: ١، ٢، ٣، ٦', x: 50, y: 82, size: 4.2, box: true, color: 'sun', in: 8.4 },
        ],
      },
      {
        title: 'وماذا عن ٧؟',
        say: 'والآن ٧ مربعات. صفّ واحد ممكن: ١ × ٧. لكن إذا جرّبنا صفّين يبقى مربع وحده! لا نستطيع بناء مستطيل آخر. عوامل ٧ هي ١ و٧ فقط.',
        duration: 13,
        bg: 'board',
        actors: [
          ...Array.from({ length: 7 }, (_, i) =>
            sq(`q${i}`, 50 + (i - 3) * 8, 38, 0.3 + i * 0.2, i === 6 ? 'orange' : 'sun', [
              {
                at: 5 + i * 0.15,
                to: i === 6 ? { x: 66, y: 33 } : { x: 50 + ((i % 3) - 1) * 8, y: i < 3 ? 33 : 46 },
                dur: 0.9,
              },
              ...(i === 6 ? [{ at: 6.8, effect: 'shake' as const }] : []),
            ]),
          ),
          { id: 'l1', kind: 'text', text: '١ × ٧ ✓', x: 50, y: 58, size: 5, color: '#7be3a4', ltr: true, in: 2, anim: [{ at: 4.8, to: { opacity: 0, scale: 0.8 }, dur: 0.35 }] },
          { id: 'x', kind: 'text', text: 'يبقى مربع وحده ✗', x: 50, y: 62, size: 4, box: true, color: 'bad', in: 7 },
          { id: 'f', kind: 'text', text: 'عوامل ٧: ١ و٧ فقط', x: 50, y: 82, size: 4.2, box: true, color: 'sun', in: 9.4 },
        ],
      },
      {
        title: 'العدد الأولي',
        say: 'العدد الذي له عاملان مختلفان فقط، هما العدد ١ والعدد نفسه، نسمّيه عددًا أوليًّا. مثل ٢ و٣ و٥ و٧ و١١',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'n', kind: 'text', text: '٧', x: 50, y: 28, size: 11, color: 'white', in: 0.3 },
          { id: 'a1', kind: 'arrow', from: [46, 36], to: [35, 46], color: 'sun', in: 1 },
          { id: 'a2', kind: 'arrow', from: [54, 36], to: [65, 46], color: 'sun', in: 1 },
          { id: 'f1', kind: 'text', text: '١', x: 30, y: 54, size: 5, box: true, color: 'sun', in: 1.6 },
          { id: 'f2', kind: 'text', text: '٧', x: 70, y: 54, size: 5, box: true, color: 'sun', in: 1.8 },
          { id: 'two', kind: 'text', text: 'عاملان فقط', x: 50, y: 54, size: 3.6, color: 'white', in: 2.4 },
          { id: 'gem', kind: 'text', text: '💎 عدد أولي', x: 50, y: 72, size: 4.6, box: true, color: 'accent', in: 3.6, anim: [{ at: 4, effect: 'glow' }] },
          ...['٢', '٣', '٥', '٧', '١١'].map((d, i): Actor => ({ id: `e${i}`, kind: 'text', text: d, x: 74 - i * 12, y: 89, size: 4.6, color: 'sun', in: 6 + i * 0.4 })),
        ],
      },
      {
        title: 'العدد ١',
        say: 'هل العدد ١ عدد أولي؟ لا! بمربع واحد نبني شكلًا واحدًا فقط: ١ × ١. للعدد ١ عامل واحد فقط، لا عاملان.',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'q', kind: 'text', text: '؟', x: 70, y: 40, size: 9, color: 'sun', in: 0.3, anim: [{ at: 3.4, to: { opacity: 0, scale: 0.8 }, dur: 0.35 }] },
          sq('one', 50, 38, 1.2),
          { id: 'l', kind: 'text', text: '١ × ١', x: 50, y: 56, size: 5, color: 'white', ltr: true, in: 2.6 },
          { id: 'f', kind: 'text', text: 'عامل واحد فقط: ١', x: 50, y: 70, size: 4, box: true, color: 'sun', in: 4.4 },
          { id: 'no', kind: 'text', text: '١ ليس عددًا أوليًّا ✗', x: 50, y: 86, size: 4.4, box: true, color: 'bad', in: 6.4, anim: [{ at: 6.8, effect: 'shake' }] },
        ],
      },
      {
        title: 'العدد ٢ أوليّ',
        say: 'العدد ٢ يُبنى صفًّا واحدًا فقط: ١ × ٢، فهو أوليّ. أما الأعداد الزوجية الأخرى مثل ٤ و٨ فنرتّبها في صفّين، فلها عوامل أكثر. إذن ٢ هو العدد الزوجي الأولي الوحيد.',
        duration: 14,
        bg: 'board',
        actors: [
          // 2 = 1 × 2 (right)
          sq('a0', 74, 44, 0.4),
          sq('a1', 82, 44, 0.6),
          { id: 'al', kind: 'text', text: '١ × ٢', x: 78, y: 62, size: 4.4, color: 'white', ltr: true, in: 1.2 },
          { id: 'ag', kind: 'text', text: 'أوليّ 💎', x: 78, y: 75, size: 3.8, box: true, color: 'good', in: 2.2 },
          // 4 = 2 × 2 (middle)
          ...Array.from({ length: 4 }, (_, i) => sq(`b${i}`, 46 + (i % 2) * 8, i < 2 ? 37 : 50, 4 + i * 0.15, 'grey')),
          { id: 'bl', kind: 'text', text: '٢ × ٢', x: 50, y: 64, size: 4.4, color: 'white', ltr: true, in: 5 },
          // 8 = 2 × 4 (left)
          ...Array.from({ length: 8 }, (_, i) => sq(`c${i}`, 11 + (i % 4) * 8, i < 4 ? 37 : 50, 5.6 + i * 0.1, 'grey')),
          { id: 'cl', kind: 'text', text: '٢ × ٤', x: 23, y: 64, size: 4.4, color: 'white', ltr: true, in: 6.6 },
          { id: 'nl', kind: 'text', text: 'ليست أولية', x: 36, y: 76, size: 3.8, box: true, color: 'grey', in: 7.6 },
          { id: 'res', kind: 'text', text: '٢ هو العدد الزوجي الأولي الوحيد', x: 50, y: 89, size: 3.6, color: 'sun', in: 10, anim: [{ at: 10.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'بين ١٠ و ٢٠',
        say: 'لنبحث عن الأعداد الأولية بين ١٠ و٢٠: إنها ١١ و١٣ و١٧ و١٩. أما الأعداد الأخرى فلها عوامل أكثر، مثل ١٥ = ٣ × ٥',
        duration: 12,
        bg: 'board',
        actors: [
          ...['١٠', '١١', '١٢', '١٣', '١٤', '١٥', '١٦', '١٧', '١٨', '١٩', '٢٠'].map((n, i): Actor => {
            const prime = [1, 3, 7, 9].includes(i);
            return {
              id: `n${i}`,
              kind: 'text',
              text: n,
              x: 14 + i * 7.2,
              y: 44,
              size: 4.4,
              color: 'white',
              in: 0.3 + i * 0.12,
              anim: prime ? [{ at: 3 + [1, 3, 7, 9].indexOf(i) * 0.7, to: { y: 32, scale: 1.4 }, dur: 0.6 }, { at: 6, effect: 'glow' }] : [{ at: 6, to: { opacity: 0.35 }, dur: 0.6 }],
            };
          }),
          { id: 'gem', kind: 'text', text: '💎 ١١ ، ١٣ ، ١٧ ، ١٩', x: 50, y: 64, size: 4.6, box: true, color: 'accent', in: 6.4 },
          { id: 'ex', kind: 'text', text: '١٥ = ٣ × ٥', x: 50, y: 84, size: 4.4, color: 'sun', ltr: true, in: 8.4 },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'العدد الأولي له عاملان مختلفان فقط: ١ والعدد نفسه، فلا يُبنى إلا صفًّا واحدًا. والعدد ١ ليس عددًا أوليًّا.',
        duration: 11,
        bg: 'board',
        actors: [
          ...Array.from({ length: 5 }, (_, i) => sq(`q${i}`, 26 + i * 8, 30, 0.3 + i * 0.15)),
          { id: 'l', kind: 'text', text: '١ × ٥', x: 76, y: 30, size: 4.4, color: 'white', ltr: true, in: 1.4 },
          { id: 'def', kind: 'text', text: 'عدد أولي = عاملان فقط 💎', x: 50, y: 52, size: 4.6, box: true, color: 'accent', in: 2.4, anim: [{ at: 2.8, effect: 'glow' }] },
          { id: 'f', kind: 'text', text: '١ والعدد نفسه', x: 50, y: 66, size: 4, color: 'sun', in: 3.6 },
          { id: 'no', kind: 'text', text: '١ ليس أوليًّا ✗', x: 50, y: 84, size: 4, box: true, color: 'bad', in: 7 },
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm3-1',
    title: 'الضرب في ١٠ و ١٠٠ و ١٠٠٠ والقسمة عليها',
    scenes: [
      {
        title: 'لغز فيصل',
        say: 'يفكّر فيصل في عدد: يضربه في ١٠٠، ثم يقسمه على ١٠، ثم يضربه في ١٠٠٠، فيحصل على ١٧٠ ٠٠٠. ما العدد؟ لنكتشف السرّ!',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'f', kind: 'emoji', emoji: '🤔', x: 50, y: 32, size: 16, in: 0.2, anim: [{ at: 1, effect: 'float' }] },
          { id: 'q', kind: 'text', text: '؟', x: 18, y: 62, size: 6, color: 'sun', in: 1.2, anim: [{ at: 9, effect: 'pulse' }] },
          { id: 'o1', kind: 'text', text: '× ١٠٠', x: 35, y: 62, size: 4.6, color: 'white', ltr: true, in: 2.2 },
          { id: 'o2', kind: 'text', text: '÷ ١٠', x: 51, y: 62, size: 4.6, color: 'white', ltr: true, in: 3.6 },
          { id: 'o3', kind: 'text', text: '× ١ ٠٠٠', x: 69, y: 62, size: 4.6, color: 'white', ltr: true, in: 5 },
          { id: 'o4', kind: 'text', text: '= ١٧٠ ٠٠٠', x: 50, y: 82, size: 5.5, color: 'sun', ltr: true, in: 6.6 },
        ],
      },
      {
        title: 'جدول القيمة المكانية',
        say: 'لنضع العدد ٢٥ في جدول القيمة المكانية: الرقم ٢ في منزلة العشرات، والرقم ٥ في منزلة الآحاد.',
        duration: 9,
        bg: 'board',
        actors: [
          ...pvTable(),
          digit('d2', '٢', 3, 1.4, [{ at: 2.2, effect: 'pulse' }]),
          digit('d5', '٥', 4, 2.6, [{ at: 3.4, effect: 'pulse' }]),
          { id: 'n', kind: 'text', text: '٢٥', x: 50, y: 89, size: 4.6, color: 'white', ltr: true, in: 4.4 },
        ],
      },
      {
        title: '× ١٠',
        say: 'عندما نضرب في ١٠ تتحرك الأرقام منزلة واحدة إلى اليسار، ونضع صفرًا في الآحاد. ٢٥ × ١٠ = ٢٥٠',
        duration: 10,
        bg: 'board',
        actors: [
          ...pvTable(),
          digit('d2', '٢', 3, 0, [{ at: 2.4, to: { x: PV_X[2] }, dur: 1.2 }]),
          digit('d5', '٥', 4, 0, [{ at: 2.4, to: { x: PV_X[3] }, dur: 1.2 }]),
          ...shift(76, 60, 'منزلة واحدة', 1.6),
          digit('z1', '٠', 4, 4.2, [{ at: 4.4, effect: 'pulse' }], 'white'),
          { id: 'eq', kind: 'text', text: '٢٥ × ١٠ = ٢٥٠', x: 50, y: 89, size: 4.6, color: 'white', ltr: true, in: 5.4, anim: [{ at: 5.8, effect: 'glow' }] },
        ],
      },
      {
        title: '× ١٠٠',
        say: 'وعندما نضرب في ١٠٠ تتحرك الأرقام منزلتين إلى اليسار، ونضع صفرين. ٢٥ × ١٠٠ = ٢ ٥٠٠',
        duration: 10,
        bg: 'board',
        actors: [
          ...pvTable(),
          digit('d2', '٢', 3, 0, [{ at: 2.4, to: { x: PV_X[1] }, dur: 1.5 }]),
          digit('d5', '٥', 4, 0, [{ at: 2.4, to: { x: PV_X[2] }, dur: 1.5 }]),
          ...shift(76, 46, 'منزلتان', 1.6),
          digit('z1', '٠', 3, 4.4, undefined, 'white'),
          digit('z2', '٠', 4, 4.7, undefined, 'white'),
          { id: 'eq', kind: 'text', text: '٢٥ × ١٠٠ = ٢ ٥٠٠', x: 50, y: 89, size: 4.6, color: 'white', ltr: true, in: 5.6, anim: [{ at: 6, effect: 'glow' }] },
        ],
      },
      {
        title: '× ١٠٠٠',
        say: 'وعندما نضرب في ١٠٠٠ تتحرك الأرقام ثلاث منازل إلى اليسار، ونضع ثلاثة أصفار. ٢٥ × ١٠٠٠ = ٢٥ ٠٠٠',
        duration: 10,
        bg: 'board',
        actors: [
          ...pvTable(),
          digit('d2', '٢', 3, 0, [{ at: 2.4, to: { x: PV_X[0] }, dur: 1.8 }]),
          digit('d5', '٥', 4, 0, [{ at: 2.4, to: { x: PV_X[1] }, dur: 1.8 }]),
          ...shift(76, 32, 'ثلاث منازل', 1.6),
          digit('z1', '٠', 2, 4.6, undefined, 'white'),
          digit('z2', '٠', 3, 4.9, undefined, 'white'),
          digit('z3', '٠', 4, 5.2, undefined, 'white'),
          { id: 'eq', kind: 'text', text: '٢٥ × ١ ٠٠٠ = ٢٥ ٠٠٠', x: 50, y: 89, size: 4.6, color: 'white', ltr: true, in: 6, anim: [{ at: 6.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'القسمة عكس الضرب',
        say: 'القسمة عكس الضرب: عندما نقسم على ١٠٠ تتحرك الأرقام منزلتين إلى اليمين، ويخرج صفران. ٢٥ ٠٠٠ ÷ ١٠٠ = ٢٥٠',
        duration: 11,
        bg: 'board',
        actors: [
          ...pvTable(),
          digit('d2', '٢', 0, 0, [{ at: 2.6, to: { x: PV_X[2] }, dur: 1.5 }]),
          digit('d5', '٥', 1, 0, [{ at: 2.6, to: { x: PV_X[3] }, dur: 1.5 }]),
          digit('z1', '٠', 2, 0, [{ at: 2.6, to: { x: PV_X[4] }, dur: 1.5 }], 'white'),
          digit('z2', '٠', 3, 0, [{ at: 2.6, to: { x: 92, opacity: 0 }, dur: 1.5 }], 'white'),
          digit('z3', '٠', 4, 0, [{ at: 2.6, to: { x: 104, opacity: 0 }, dur: 1.5 }], 'white'),
          ...shift(24, 54, 'منزلتان', 1.4),
          { id: 'eq', kind: 'text', text: '٢٥ ٠٠٠ ÷ ١٠٠ = ٢٥٠', x: 50, y: 89, size: 4.6, color: 'white', ltr: true, in: 5.2, anim: [{ at: 5.6, effect: 'glow' }] },
        ],
      },
      {
        title: 'حلّ لغز فيصل',
        say: 'نضرب في ١٠٠ ثم نقسم على ١٠ ثم نضرب في ١٠٠٠: هذا مثل الضرب في ١٠ ٠٠٠. و١٧٠ ٠٠٠ ÷ ١٠ ٠٠٠ = ١٧. فيصل يفكّر في ١٧',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'f', kind: 'emoji', emoji: '🤔', x: 84, y: 26, size: 11, in: 0.2, anim: [{ at: 9, to: { opacity: 0, scale: 0.8 }, dur: 0.35 }] },
          { id: 'l1', kind: 'text', text: '؟ × ١٠٠ ÷ ١٠ × ١ ٠٠٠', x: 46, y: 28, size: 4.6, color: 'white', ltr: true, in: 0.6 },
          { id: 'l2', kind: 'text', text: '= ؟ × ١٠ ٠٠٠', x: 46, y: 44, size: 4.6, color: 'sun', ltr: true, in: 3 },
          { id: 'l3', kind: 'text', text: '١٧٠ ٠٠٠ ÷ ١٠ ٠٠٠ = ١٧', x: 46, y: 62, size: 4.6, color: 'white', ltr: true, in: 6 },
          { id: 'bulb', kind: 'emoji', emoji: '💡', x: 84, y: 26, size: 11, in: 9.2, anim: [{ at: 9.6, effect: 'bounce' }] },
          { id: 'res', kind: 'text', text: 'العدد هو ١٧ 🎉', x: 50, y: 82, size: 5, box: true, color: 'accent', in: 9.4, anim: [{ at: 9.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'في الضرب في ١٠ أو ١٠٠ أو ١٠٠٠ تتحرك الأرقام منزلة أو منزلتين أو ثلاث منازل إلى اليسار، وفي القسمة تتحرك إلى اليمين.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'mt', kind: 'text', text: 'الضرب', x: 30, y: 22, size: 4.6, box: true, color: 'sun', in: 0.3 },
          { id: 'ma', kind: 'arrow', from: [42, 34], to: [18, 34], color: 'sun', in: 0.8 },
          { id: 'mal', kind: 'text', text: 'إلى اليسار', x: 30, y: 41, size: 3.2, color: 'sun', in: 1.2 },
          { id: 'dt', kind: 'text', text: 'القسمة', x: 70, y: 22, size: 4.6, box: true, color: 'good', in: 6.6 },
          { id: 'da', kind: 'arrow', from: [58, 34], to: [82, 34], color: '#7be3a4', in: 7.1 },
          { id: 'dal', kind: 'text', text: 'إلى اليمين', x: 70, y: 41, size: 3.2, color: '#7be3a4', in: 7.5 },
          { id: 'r1', kind: 'text', text: '١٠ ← منزلة واحدة', x: 50, y: 58, size: 4, color: 'white', in: 2 },
          { id: 'r2', kind: 'text', text: '١٠٠ ← منزلتان', x: 50, y: 70, size: 4, color: 'white', in: 3.2 },
          { id: 'r3', kind: 'text', text: '١ ٠٠٠ ← ثلاث منازل', x: 50, y: 82, size: 4, color: 'white', in: 4.4 },
        ],
      },
    ],
  },
];

/**
 * `.xtext` uses `unicode-bidi: plaintext`, so a line made only of Arabic-Indic digits and
 * symbols would be laid out right-to-left even with `ltr: true` (Arabic-Indic digits pull the
 * spaces/operators between them to the right-to-left side). An LRM mark at the start and before
 * every space keeps equations such as «٢٥ × ١٠ = ٢٥٠» left-to-right as in the book.
 */
const LRM = '\u200E';
const explainers: Explainer[] = raw.map((e) => ({
  ...e,
  scenes: e.scenes.map((sc) => ({
    ...sc,
    actors: sc.actors.map((a) => (a.kind === 'text' && a.ltr ? { ...a, text: LRM + a.text.replace(/ /g, LRM + ' ') } : a)),
  })),
}));

export default explainers;
