import type { Actor, Anim, Explainer } from '../../../../explain/types';
import { keepNumberGroups, toArabicDigits } from '../../../../lib/digits';

/*
 * Explainers for lessons m14-1, m14-2, m14-3 (unit m4).
 * Equations on the stage are LTR text actors with Arabic-Indic digits and the decimal comma «,».
 * Thousands are grouped with a space as in the book (٣ ٤٥٦); see `keepNumberGroups` at the end.
 */

/* ---------- helpers ---------- */

/** 3456 → «٣ ٤٥٦» */
const fmtN = (v: number) => {
  const s = String(v);
  return toArabicDigits(s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s);
};

interface Line {
  X: (v: number) => number;
  y: number;
  actors: Actor[];
}

/** A chalk number line from min to max (x0 → x1). `labels` = values written under the line. */
function chalkLine(p: string, min: number, max: number, step: number, y: number, labels: number[], inAt = 0, x0 = 12, x1 = 88, labelSize = 2.8): Line {
  const X = (v: number) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  const count = Math.round((max - min) / step);
  const actors: Actor[] = [{ id: `${p}L`, kind: 'shape', shape: 'rect', x: (x0 + x1) / 2, y, w: x1 - x0 + 4, h: 0.6, color: 'white', in: inAt }];
  for (let i = 0; i <= count; i++) {
    const v = min + i * step;
    const major = labels.some((l) => Math.abs(l - v) < 1e-9);
    actors.push({ id: `${p}t${i}`, kind: 'shape', shape: 'rect', x: X(v), y, w: 0.3, h: major ? 5 : 3, color: 'white', in: inAt });
  }
  labels.forEach((v, k) => actors.push({ id: `${p}n${k}`, kind: 'text', text: fmtN(v), x: X(v), y: y + 6.5, size: labelSize, color: 'white', ltr: true, in: inAt }));
  return { X, y, actors };
}

const dot = (id: string, x: number, y: number, inAt: number, color = 'sun', anim?: Anim[]): Actor => ({ id, kind: 'shape', shape: 'circle', x, y, w: 2.2, h: 3.5, color, in: inAt, anim });
const ring = (id: string, x: number, y: number, inAt: number, color = '#8fd3ff', anim?: Anim[]): Actor => ({ id, kind: 'shape', shape: 'circle', x, y, w: 3.4, h: 5.4, color, outline: true, in: inAt, anim });

/** A jump arc above the line from a to b, with an optional label over it. */
function arc(id: string, L: Line, a: number, b: number, label: string, color: string, inAt: number, mag = 6): Actor[] {
  const xa = L.X(a);
  const xb = L.X(b);
  const yA = L.y - 2.5;
  const out: Actor[] = [{ id, kind: 'arrow', from: [xa, yA], to: [xb, yA], curve: (b > a ? -1 : 1) * mag, color, in: inAt }];
  if (label) out.push({ id: `${id}l`, kind: 'text', text: label, x: (xa + xb) / 2, y: yA - mag * 0.8 - 4.5, size: 3.2, color, ltr: true, in: inAt + 0.4 });
  return out;
}

/**
 * A frog hopping along a number line through `values` (first value = start).
 * Jump k starts at t0 + k × every. Returns the frog, its arcs and its landing marks.
 */
function frog(p: string, L: Line, values: number[], t0: number, every: number, color: string, mag: number, mark: 'dot' | 'ring', dx = 0, inAt = 0.3): Actor[] {
  const fy = L.y - 4.6;
  const anim: Anim[] = [];
  const marks: Actor[] = [];
  const arcs: Actor[] = [];
  for (let k = 1; k < values.length; k++) {
    const t = t0 + (k - 1) * every;
    const a = values[k - 1];
    const b = values[k];
    anim.push({ at: t, to: { x: (L.X(a) + L.X(b)) / 2 + dx, y: fy - mag * 1.1 }, dur: 0.3 });
    anim.push({ at: t + 0.3, to: { x: L.X(b) + dx, y: fy }, dur: 0.3 });
    arcs.push(...arc(`${p}a${k}`, L, a, b, '', color, t));
    marks.push(mark === 'dot' ? dot(`${p}m${k}`, L.X(b), L.y, t + 0.6, color) : ring(`${p}m${k}`, L.X(b), L.y, t + 0.6, color));
  }
  return [...arcs, ...marks, { id: `${p}f`, kind: 'emoji', emoji: '🐸', x: L.X(values[0]) + dx, y: fy, size: 5.5, in: inAt, anim }];
}

const range = (from: number, to: number, step: number) => Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

/** A row of thin columns (bar model): column i of n, left edge x0, spacing dx. */
const column = (id: string, i: number, x0: number, dx: number, y: number, h: number, color: string, inAt: number, anim?: Anim[]): Actor => ({
  id,
  kind: 'shape',
  shape: 'rect',
  x: x0 + i * dx + dx / 2,
  y,
  w: dx * 0.78,
  h,
  color,
  in: inAt,
  anim,
});

/* number lines used in lesson m14-1 */
const nl20 = (y = 56) => chalkLine('nl', 0, 20, 1, y, [0, 20], 0, 12, 88, 2.8);
/** coloured value labels under the line (row 0 just under it, row 1 a little lower) */
const labs = (p: string, L: Line, values: number[], color: string, row: 0 | 1, inAt: number, every = 0): Actor[] =>
  values.map((v, k): Actor => ({ id: `${p}${k}`, kind: 'text', text: fmtN(v), x: L.X(v), y: L.y + 6.5 + row * 5, size: 2.8, color, ltr: true, in: inAt + k * every }));

/* ===================================================================== */
const raw: Explainer[] = [
  {
    lesson: 'm14-1',
    title: 'المضاعفات المشتركة',
    scenes: [
      {
        title: 'متى يحدثان معًا؟',
        say: 'يومض ضوء المنارة كل ٤ دقائق، ويُقرع الجرس كل ٥ دقائق. الآن ومض الضوء وقُرع الجرس معًا! بعد كم دقيقة يحدث ذلك مرة أخرى؟',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'tower', kind: 'emoji', emoji: '🗼', x: 72, y: 46, size: 18, in: 0.3 },
          { id: 'tl', kind: 'text', text: 'كل ٤ دقائق', x: 72, y: 72, size: 3.6, box: true, color: 'sun', in: 1 },
          { id: 'flash', kind: 'emoji', emoji: '💡', x: 84, y: 26, size: 8, in: 1.4, anim: [{ at: 4.6, effect: 'pulse' }] },
          { id: 'bell', kind: 'emoji', emoji: '🔔', x: 28, y: 46, size: 18, in: 2.4 },
          { id: 'bl', kind: 'text', text: 'كل ٥ دقائق', x: 28, y: 72, size: 3.6, box: true, color: 'blue', in: 3 },
          { id: 'ding', kind: 'text', text: 'دنننغ!', x: 15, y: 26, size: 4, color: 'sun', in: 4.6, anim: [{ at: 4.6, effect: 'pulse' }] },
          { id: 'now', kind: 'text', text: 'الآن معًا!', x: 50, y: 30, size: 4, color: 'white', in: 4.8 },
          { id: 'q', kind: 'text', text: 'ومتى مرة أخرى؟', x: 50, y: 87, size: 4.2, box: true, color: 'accent', in: 7, anim: [{ at: 7.4, effect: 'pulse' }] },
        ],
      },
      (() => {
        const L = nl20();
        return {
          title: 'ضفدع يقفز ٤',
          say: 'تخيّلي ضفدعًا يقفز على خط الأعداد ٤ خطوات في كل قفزة، مثل ضوء المنارة. انظري أين يهبط: ٤، ٨، ١٢، ١٦، ٢٠. هذه مضاعفات العدد ٤.',
          duration: 12,
          bg: 'board' as const,
          actors: [
            ...L.actors,
            ...frog('a', L, range(0, 20, 4), 1.6, 1.2, 'sun', 7, 'dot'),
            ...labs('la', L, range(4, 16, 4), 'sun', 0, 2.2, 1.2),
            { id: 'tag', kind: 'text', text: '🗼 قفزات من ٤', x: 76, y: 20, size: 3.6, box: true, color: 'sun', in: 0.6 },
            { id: 'list', kind: 'text', text: '٤ ، ٨ ، ١٢ ، ١٦ ، ٢٠', x: 50, y: 84, size: 4.6, color: 'sun', ltr: true, in: 8.2, anim: [{ at: 8.6, effect: 'glow' }] },
          ],
        };
      })(),
      (() => {
        const L = nl20();
        return {
          title: 'ضفدع يقفز ٥',
          say: 'وهذا ضفدع آخر يقفز ٥ خطوات في كل قفزة، مثل الجرس. يهبط على ٥، ١٠، ١٥، ٢٠. هذه مضاعفات العدد ٥.',
          duration: 11,
          bg: 'board' as const,
          actors: [
            ...L.actors,
            ...frog('b', L, range(0, 20, 5), 1.6, 1.5, '#8fd3ff', 9, 'ring'),
            ...labs('lb', L, range(5, 15, 5), '#8fd3ff', 0, 2.2, 1.5),
            { id: 'tag', kind: 'text', text: '🔔 قفزات من ٥', x: 76, y: 20, size: 3.6, box: true, color: 'blue', in: 0.6 },
            { id: 'list', kind: 'text', text: '٥ ، ١٠ ، ١٥ ، ٢٠', x: 50, y: 84, size: 4.6, color: '#8fd3ff', ltr: true, in: 8, anim: [{ at: 8.4, effect: 'glow' }] },
          ],
        };
      })(),
      (() => {
        const L = nl20();
        return {
          title: 'يهبطان معًا!',
          say: 'والآن يقفز الضفدعان معًا على خط واحد. ينطلقان من ٠… ويهبطان معًا أول مرة عند ٢٠!',
          duration: 11,
          bg: 'board' as const,
          actors: [
            ...L.actors,
            ...frog('a', L, range(0, 20, 4), 1.6, 1.2, 'sun', 5, 'dot', -1.8),
            ...frog('b', L, range(0, 20, 5), 1.6, 1.5, '#8fd3ff', 10, 'ring', 1.8),
            ...labs('la', L, range(4, 16, 4), 'sun', 0, 2.2, 1.2),
            ...labs('lb', L, range(5, 15, 5), '#8fd3ff', 1, 2.2, 1.5),
            { id: 'ta', kind: 'text', text: '🗼 قفزات من ٤', x: 80, y: 18, size: 3.2, box: true, color: 'sun', in: 0.5 },
            { id: 'tb', kind: 'text', text: '🔔 قفزات من ٥', x: 20, y: 18, size: 3.2, box: true, color: 'blue', in: 0.8 },
            { id: 'meet', kind: 'shape', shape: 'circle', x: L.X(20), y: L.y, w: 6, h: 9.6, color: 'sun', outline: true, in: 8, anim: [{ at: 8.2, effect: 'pulse' }] },
            { id: 'res', kind: 'text', text: 'معًا عند ٢٠ 🎉', x: 50, y: 84, size: 4.6, box: true, color: 'accent', in: 8.4, anim: [{ at: 8.8, effect: 'glow' }] },
          ],
        };
      })(),
      {
        title: 'المضاعف المشترك',
        say: 'العدد ٢٠ موجود في قائمة مضاعفات ٤ وفي قائمة مضاعفات ٥، فهو مضاعف مشترك للعددين ٤ و٥. إذن يحدث ذلك مرة أخرى بعد ٢٠ دقيقة.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'la', kind: 'text', text: 'مضاعفات ٤', x: 82, y: 30, size: 3.6, box: true, color: 'sun', in: 0.3 },
          ...['٤', '٨', '١٢', '١٦', '٢٠'].map((d, i): Actor => ({ id: `a${i}`, kind: 'text', text: d, x: 65 - i * 10, y: 30, size: 5, color: 'sun', in: 0.6 + i * 0.3 })),
          { id: 'lb', kind: 'text', text: 'مضاعفات ٥', x: 82, y: 52, size: 3.6, box: true, color: 'blue', in: 2.4 },
          ...['٥', '١٠', '١٥', '٢٠'].map((d, i): Actor => ({ id: `b${i}`, kind: 'text', text: d, x: i === 3 ? 25 : 65 - i * 10, y: 52, size: 5, color: '#8fd3ff', in: 2.7 + i * 0.3 })),
          { id: 'band', kind: 'shape', shape: 'pill', x: 25, y: 41, w: 10, h: 38, color: 'sun', outline: true, in: 4.4, anim: [{ at: 4.6, effect: 'pulse' }] },
          { id: 'common', kind: 'text', text: 'مضاعف مشترك', x: 25, y: 67, size: 3.6, color: 'sun', in: 5 },
          { id: 'res', kind: 'text', text: 'بعد ٢٠ دقيقة 🗼🔔', x: 58, y: 84, size: 4.6, box: true, color: 'accent', in: 7.6, anim: [{ at: 8, effect: 'glow' }] },
        ],
      },
      (() => {
        const rows = [2, 3, 4, 6];
        const colors = ['sun', '#8fd3ff', '#7be3a4', 'orange'];
        const lines = rows.map((_s, r) => chalkLine(`r${r}`, 0, 12, 1, 26 + r * 15, [0, 12], 0.2 + r * 0.2, 34, 82, 2.4));
        return {
          title: 'العدد ١٢ مضاعف مشترك',
          say: 'العدد ١٢ مضاعف مشترك للعددين ٢ و٣، وللعددين ٤ و٦. بل هو مضاعف مشترك للأعداد ٢ و٣ و٤ و٦ معًا: كل القفزات تهبط على ١٢.',
          duration: 13,
          bg: 'board' as const,
          actors: [
            { id: 'band', kind: 'shape', shape: 'pill', x: 82, y: 49, w: 6, h: 64, color: 'rgba(255,200,61,0.18)', in: 0.2 },
            ...lines.flatMap((L) => L.actors),
            ...rows.flatMap((s, r): Actor[] => [
              { id: `lab${r}`, kind: 'text', text: `قفزات من ${toArabicDigits(s)}`, x: 18, y: 26 + r * 15, size: 3.2, color: colors[r], in: 1 + r * 1.6 },
              ...range(s, 12, s).flatMap((b, k) => arc(`j${r}-${k}`, lines[r], b - s, b, '', colors[r], 1.2 + r * 1.6 + k * 0.25, 2.6)),
            ]),
            { id: 'ring', kind: 'shape', shape: 'pill', x: 82, y: 49, w: 7, h: 66, color: 'sun', outline: true, in: 8, anim: [{ at: 8.2, effect: 'pulse' }] },
            { id: 'res', kind: 'text', text: '١٢ مضاعف مشترك للأعداد ٢ و٣ و٤ و٦', x: 50, y: 89, size: 3.6, box: true, color: 'accent', in: 8.8, anim: [{ at: 9.2, effect: 'glow' }] },
          ],
        };
      })(),
      (() => {
        const L = nl20(58);
        return {
          title: 'لغز مهنّد',
          say: 'يفكّر مهنّد في عدد أقل من ٢٠، وهو من مضاعفات ٣ ومن مضاعفات ٥. نُطلق ضفدعين: قفزات من ٣ وقفزات من ٥. يهبطان معًا عند ١٥. إذن العدد ١٥',
          duration: 13,
          bg: 'board' as const,
          actors: [
            { id: 'boy', kind: 'emoji', emoji: '🤔', x: 86, y: 84, size: 9, in: 0.2 },
            { id: 'c1', kind: 'text', text: 'أقل من ٢٠', x: 76, y: 22, size: 3, box: true, color: 'white', in: 0.6 },
            { id: 'c2', kind: 'text', text: 'من مضاعفات ٣', x: 50, y: 22, size: 3, box: true, color: 'sun', in: 1 },
            { id: 'c3', kind: 'text', text: 'من مضاعفات ٥', x: 24, y: 22, size: 3, box: true, color: 'blue', in: 1.4 },
            ...L.actors,
            ...frog('a', L, range(0, 18, 3), 2.6, 1, 'sun', 4, 'dot', -1.8, 2.2),
            ...frog('b', L, range(0, 15, 5), 2.6, 5 / 3, '#8fd3ff', 9, 'ring', 1.8, 2.2),
            ...labs('la', L, range(3, 18, 3), 'sun', 0, 3.2, 1),
            ...labs('lb', L, range(5, 15, 5), '#8fd3ff', 1, 3.2, 5 / 3),
            { id: 'no20', kind: 'text', text: '✗', x: L.X(20), y: L.y - 6, size: 4, color: 'red', in: 9 },
            { id: 'meet', kind: 'shape', shape: 'circle', x: L.X(15), y: L.y, w: 6, h: 9.6, color: 'sun', outline: true, in: 7.4, anim: [{ at: 7.6, effect: 'pulse' }] },
            { id: 'res', kind: 'text', text: 'العدد هو ١٥ 🎉', x: 50, y: 85, size: 4.6, box: true, color: 'accent', in: 9.6, anim: [{ at: 10, effect: 'glow' }] },
          ],
        };
      })(),
      {
        title: 'الخلاصة',
        say: 'المضاعف المشترك عدد يكون مضاعفًا لعددين أو أكثر في الوقت نفسه. نكتب مضاعفات كل عدد، ونبحث عن العدد الموجود في القائمتين.',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'fa', kind: 'emoji', emoji: '🐸', x: 80, y: 28, size: 9, in: 0.3 },
          { id: 'fal', kind: 'text', text: '٤ ، ٨ ، ١٢ ، ١٦ ، ٢٠', x: 80, y: 42, size: 3.6, color: 'sun', ltr: true, in: 0.8 },
          { id: 'fb', kind: 'emoji', emoji: '🐸', x: 20, y: 28, size: 9, in: 1.4 },
          { id: 'fbl', kind: 'text', text: '٥ ، ١٠ ، ١٥ ، ٢٠', x: 20, y: 42, size: 3.6, color: '#8fd3ff', ltr: true, in: 1.8 },
          { id: 'aa', kind: 'arrow', from: [72, 50], to: [56, 60], color: 'sun', in: 3 },
          { id: 'ab', kind: 'arrow', from: [28, 50], to: [44, 60], color: '#8fd3ff', in: 3.2 },
          { id: 'n', kind: 'text', text: '٢٠', x: 50, y: 64, size: 8, color: 'white', in: 3.8, anim: [{ at: 4.2, effect: 'glow' }] },
          { id: 'def', kind: 'text', text: 'مضاعف مشترك = في القائمتين', x: 50, y: 85, size: 4.2, box: true, color: 'accent', in: 5 },
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm14-2',
    title: 'استراتيجيات ذهنية للجمع والطرح',
    scenes: [
      {
        title: 'فكّري قبل أن تكتبي',
        say: 'قبل كتابة أي شيء، اسألي نفسك دائمًا: هل يمكنني إجراء العملية ذهنيًّا؟ مثلًا: كيف نحسب ٤٢٧ + ١٩٩ بسرعة دون ورقة وقلم؟',
        duration: 11,
        bg: 'board',
        actors: [
          { id: 'brain', kind: 'emoji', emoji: '🧠', x: 50, y: 34, size: 16, in: 0.3, anim: [{ at: 1, effect: 'float' }] },
          { id: 'q', kind: 'text', text: 'ذهنيًّا؟', x: 72, y: 22, size: 4, box: true, color: 'sun', in: 1.6 },
          { id: 'pen', kind: 'emoji', emoji: '✏️', x: 24, y: 30, size: 8, in: 2.4 },
          { id: 'x', kind: 'text', text: '✗', x: 24, y: 30, size: 9, color: 'red', in: 3 },
          { id: 'eq', kind: 'text', text: '٤٢٧ + ١٩٩ = ؟', x: 50, y: 70, size: 7, color: 'white', ltr: true, in: 5.4, anim: [{ at: 6, effect: 'pulse' }] },
        ],
      },
      (() => {
        const L = chalkLine('nl', 400, 650, 10, 60, [500], 0);
        return {
          title: 'نضيف ٢٠٠ بدلًا من ١٩٩',
          say: 'العدد ١٩٩ قريب جدًّا من ٢٠٠، وإضافة ٢٠٠ سهلة. نقفز من ٤٢٧ قفزة من ٢٠٠ فنصل إلى ٦٢٧. لكن انتبهي: أضفنا ١ زيادة!',
          duration: 12,
          bg: 'board' as const,
          actors: [
            { id: 'near', kind: 'text', text: '١٩٩ قريب من ٢٠٠', x: 50, y: 18, size: 4, box: true, color: 'sun', in: 0.4 },
            ...L.actors,
            dot('d1', L.X(427), 60, 1.6, 'white'),
            { id: 'd1l', kind: 'text', text: '٤٢٧', x: L.X(427), y: 67, size: 3, color: 'white', ltr: true, in: 1.6 },
            ...arc('j', L, 427, 627, '+ ٢٠٠', 'sun', 3, 9),
            dot('d2', L.X(627), 60, 3.8, 'sun', [{ at: 4.2, effect: 'pulse' }]),
            { id: 'd2l', kind: 'text', text: '٦٢٧', x: L.X(627), y: 67, size: 3, color: 'sun', ltr: true, in: 3.8 },
            { id: 'eq', kind: 'text', text: '٤٢٧ + ٢٠٠ = ٦٢٧', x: 50, y: 78, size: 4.6, color: 'white', ltr: true, in: 5 },
            { id: 'extra', kind: 'text', text: 'أضفنا ١ زيادة!', x: 50, y: 89, size: 3.8, color: 'orange', in: 7.6, anim: [{ at: 8, effect: 'shake' }] },
          ],
        };
      })(),
      (() => {
        const L = chalkLine('nl', 620, 630, 1, 50, range(620, 630, 1), 0);
        return {
          title: 'نطرح الواحد الزائد',
          say: 'نكبّر خط الأعداد قرب ٦٢٧، ونرجع خطوة واحدة: ٦٢٧ − ١ = ٦٢٦. إذن ٤٢٧ + ١٩٩ = ٤٢٧ + ٢٠٠ − ١ = ٦٢٦',
          duration: 12,
          bg: 'board' as const,
          actors: [
            { id: 'zoom', kind: 'emoji', emoji: '🔍', x: 86, y: 20, size: 7, in: 0.2 },
            ...L.actors,
            dot('d1', L.X(627), 50, 0.6, 'sun'),
            ...arc('j', L, 627, 626, '− ١', 'orange', 2, 5),
            dot('d2', L.X(626), 50, 2.8, '#7be3a4', [{ at: 3.2, effect: 'pulse' }]),
            { id: 'e1', kind: 'text', text: '٦٢٧ − ١ = ٦٢٦', x: 50, y: 22, size: 4.4, color: 'orange', ltr: true, in: 3.4 },
            { id: 'e2', kind: 'text', text: '٤٢٧ + ١٩٩ = ٤٢٧ + ٢٠٠ − ١', x: 50, y: 74, size: 4.4, color: 'white', ltr: true, in: 5.4 },
            { id: 'e3', kind: 'text', text: '= ٦٢٦', x: 50, y: 86, size: 5, color: '#7be3a4', ltr: true, in: 7.4, anim: [{ at: 7.8, effect: 'glow' }] },
          ],
        };
      })(),
      (() => {
        const L = chalkLine('nl', 1000, 3600, 100, 60, [2000, 3000], 0);
        return {
          title: 'وفي الطرح أيضًا',
          say: 'والآن ٣ ٤٥٦ − ١ ٩٩٧. العدد ١ ٩٩٧ قريب من ٢ ٠٠٠، فنطرح ٢ ٠٠٠ ونصل إلى ١ ٤٥٦. لكننا طرحنا ٣ زيادة!',
          duration: 12,
          bg: 'board' as const,
          actors: [
            { id: 'near', kind: 'text', text: '١ ٩٩٧ قريب من ٢ ٠٠٠', x: 50, y: 18, size: 4, box: true, color: 'sun', in: 0.4 },
            ...L.actors,
            dot('d1', L.X(3456), 60, 1.6, 'white'),
            { id: 'd1l', kind: 'text', text: '٣ ٤٥٦', x: L.X(3456), y: 67, size: 3, color: 'white', ltr: true, in: 1.6 },
            ...arc('j', L, 3456, 1456, '− ٢ ٠٠٠', 'sun', 3, 10),
            dot('d2', L.X(1456), 60, 3.8, 'sun', [{ at: 4.2, effect: 'pulse' }]),
            { id: 'd2l', kind: 'text', text: '١ ٤٥٦', x: L.X(1456), y: 67, size: 3, color: 'sun', ltr: true, in: 3.8 },
            { id: 'eq', kind: 'text', text: '٣ ٤٥٦ − ٢ ٠٠٠ = ١ ٤٥٦', x: 50, y: 78, size: 4.6, color: 'white', ltr: true, in: 5 },
            { id: 'extra', kind: 'text', text: 'طرحنا ٣ زيادة!', x: 50, y: 89, size: 3.8, color: 'orange', in: 7.6, anim: [{ at: 8, effect: 'shake' }] },
          ],
        };
      })(),
      (() => {
        const L = chalkLine('nl', 1450, 1465, 1, 50, [], 0);
        return {
          title: 'نُضيف ما طرحناه زيادة',
          say: 'طرحنا ٣ زيادة، فنُعيدها: نقفز ٣ خطوات إلى الأمام. ١ ٤٥٦ + ٣ = ١ ٤٥٩. إذن ٣ ٤٥٦ − ١ ٩٩٧ = ١ ٤٥٩',
          duration: 12,
          bg: 'board' as const,
          actors: [
            { id: 'zoom', kind: 'emoji', emoji: '🔍', x: 86, y: 20, size: 7, in: 0.2 },
            ...L.actors,
            dot('d1', L.X(1456), 50, 0.6, 'sun'),
            { id: 'd1l', kind: 'text', text: '١ ٤٥٦', x: L.X(1456), y: 57, size: 3, color: 'sun', ltr: true, in: 0.6 },
            ...arc('j', L, 1456, 1459, '+ ٣', '#7be3a4', 2, 6),
            dot('d2', L.X(1459), 50, 2.8, '#7be3a4', [{ at: 3.2, effect: 'pulse' }]),
            { id: 'd2l', kind: 'text', text: '١ ٤٥٩', x: L.X(1459) + 3, y: 57, size: 3, color: '#7be3a4', ltr: true, in: 2.8 },
            { id: 'e1', kind: 'text', text: '١ ٤٥٦ + ٣ = ١ ٤٥٩', x: 42, y: 22, size: 4.4, color: '#7be3a4', ltr: true, in: 3.4 },
            { id: 'e2', kind: 'text', text: '٣ ٤٥٦ − ١ ٩٩٧ = ٣ ٤٥٦ − ٢ ٠٠٠ + ٣', x: 50, y: 74, size: 4, color: 'white', ltr: true, in: 5.4 },
            { id: 'e3', kind: 'text', text: '= ١ ٤٥٩', x: 50, y: 86, size: 5, color: '#7be3a4', ltr: true, in: 7.4, anim: [{ at: 7.8, effect: 'glow' }] },
          ],
        };
      })(),
      {
        title: 'انتبهي!',
        say: 'في ٩ ٨٤٣ − ٧ ٩٩٧ نطرح ٨ ٠٠٠، فنكون قد طرحنا ٣ زيادة. لا نطرح ٣ مرة أخرى، بل نُضيفها: الناتج ١ ٨٤٦',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'q', kind: 'text', text: '٩ ٨٤٣ − ٧ ٩٩٧', x: 50, y: 20, size: 6, color: 'white', ltr: true, in: 0.3 },
          { id: 'w', kind: 'text', text: '٩ ٨٤٣ − ٨ ٠٠٠ − ٣', x: 50, y: 42, size: 4.6, color: 'white', ltr: true, in: 2, anim: [{ at: 4.6, effect: 'shake' }, { at: 6, to: { opacity: 0.35 }, dur: 0.4 }] },
          { id: 'wx', kind: 'text', text: '✗', x: 80, y: 42, size: 6, color: 'red', in: 4.4 },
          { id: 'r', kind: 'text', text: '٩ ٨٤٣ − ٨ ٠٠٠ + ٣ = ١ ٨٤٦', x: 46, y: 62, size: 4.6, color: '#7be3a4', ltr: true, in: 6.6 },
          { id: 'rx', kind: 'text', text: '✓', x: 86, y: 62, size: 6, color: '#7be3a4', in: 7.2 },
          { id: 'hint', kind: 'text', text: 'طرحنا زيادة ← نُضيف', x: 50, y: 84, size: 4.2, box: true, color: 'good', in: 8.4, anim: [{ at: 8.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'من حقيقة واحدة حقائق كثيرة',
        say: 'نعرف أن ٦٣ + ٢٨ = ٩١. منها نشتقّ حقائق جديدة: ٦,٣ + ٢,٨ = ٩,١ و٦٣٠ + ٢٨٠ = ٩١٠، والطرح عكس الجمع: ٩١ − ٢٨ = ٦٣',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'c', kind: 'text', text: '٦٣ + ٢٨ = ٩١', x: 50, y: 52, size: 4.8, box: true, color: 'accent', ltr: true, in: 0.3, anim: [{ at: 0.8, effect: 'pulse' }] },
          { id: 'a1', kind: 'arrow', from: [40, 46], to: [30, 32], color: 'sun', in: 2 },
          { id: 'f1', kind: 'text', text: '٦,٣ + ٢,٨ = ٩,١', x: 25, y: 24, size: 3.8, box: true, color: 'sun', ltr: true, in: 2.4 },
          { id: 'a2', kind: 'arrow', from: [60, 46], to: [70, 32], color: 'orange', in: 4.2 },
          { id: 'f2', kind: 'text', text: '٦٣٠ + ٢٨٠ = ٩١٠', x: 75, y: 24, size: 3.8, box: true, color: 'orange', ltr: true, in: 4.6 },
          { id: 'a3', kind: 'arrow', from: [40, 58], to: [30, 72], color: 'good', in: 6.8 },
          { id: 'f3', kind: 'text', text: '٩١ − ٢٨ = ٦٣', x: 25, y: 80, size: 3.8, box: true, color: 'good', ltr: true, in: 7.2 },
          { id: 'a4', kind: 'arrow', from: [60, 58], to: [70, 72], color: 'good', in: 8.4 },
          { id: 'f4', kind: 'text', text: '٩١ − ٦٣ = ٢٨', x: 75, y: 80, size: 3.8, box: true, color: 'good', ltr: true, in: 8.8 },
        ],
      },
      {
        title: 'الخلاصة',
        say: 'لجمع عدد قريب من ١٠٠ أو ١٠٠٠ نُضيف العدد السهل ثم نطرح الزيادة. ولطرحه نطرح العدد السهل ثم نُضيف الزيادة.',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'mid', kind: 'shape', shape: 'rect', x: 50, y: 52, w: 0.6, h: 62, color: 'rgba(255,255,255,0.3)', in: 0.2 },
          { id: 'ht', kind: 'text', text: 'الجمع', x: 74, y: 24, size: 4.6, box: true, color: 'sun', in: 0.4 },
          { id: 'h1', kind: 'text', text: '٤٢٧ + ١٩٩', x: 74, y: 42, size: 4.4, color: 'white', ltr: true, in: 1 },
          { id: 'ha', kind: 'arrow', from: [74, 49], to: [74, 57], color: 'sun', in: 1.6 },
          { id: 'h2', kind: 'text', text: '٤٢٧ + ٢٠٠ − ١', x: 74, y: 64, size: 3.9, color: 'sun', ltr: true, in: 2 },
          { id: 'st', kind: 'text', text: 'الطرح', x: 26, y: 24, size: 4.6, box: true, color: 'good', in: 5 },
          { id: 's1', kind: 'text', text: '٣ ٤٥٦ − ١ ٩٩٧', x: 26, y: 42, size: 4.4, color: 'white', ltr: true, in: 5.6 },
          { id: 'sa', kind: 'arrow', from: [26, 49], to: [26, 57], color: '#7be3a4', in: 6.2 },
          { id: 's2', kind: 'text', text: '٣ ٤٥٦ − ٢ ٠٠٠ + ٣', x: 27, y: 64, size: 3.9, color: '#7be3a4', ltr: true, in: 6.6 },
          { id: 'b', kind: 'text', text: '🧠 هل يمكنني الحساب ذهنيًّا؟', x: 50, y: 86, size: 4, color: 'sun', in: 9, anim: [{ at: 9.4, effect: 'glow' }] },
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm14-3',
    title: 'استراتيجيات ذهنية للضرب',
    scenes: [
      {
        title: 'كم نقطة هنا؟',
        say: 'هنا ٧ صفوف، في كل صف ١٥ نقطة. كيف نحسب ١٥ × ٧ ذهنيًّا؟ نستعين بحقائق جدول الضرب التي نعرفها!',
        duration: 10,
        bg: 'board',
        actors: [
          { id: 'arr', kind: 'math', math: { type: 'array', rows: 7, cols: 15 }, x: 50, y: 46, w: 60, in: 0.3 },
          { id: 'n15', kind: 'text', text: '١٥', x: 50, y: 16, size: 4, color: 'white', in: 1.4 },
          { id: 'n7', kind: 'text', text: '٧', x: 14, y: 46, size: 4, color: 'white', in: 2 },
          { id: 'q', kind: 'text', text: '١٥ × ٧ = ؟', x: 50, y: 82, size: 6, color: 'sun', ltr: true, in: 3.6, anim: [{ at: 4, effect: 'pulse' }] },
        ],
      },
      {
        title: 'نجزّئ ثم نجمع',
        say: 'نقسم ١٥ إلى ١٠ و٥. ١٠ × ٧ = ٧٠، و٥ × ٧ = ٣٥. ثم نجمع: ٧٠ + ٣٥ = ١٠٥. إذن ١٥ × ٧ = ١٠٥',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'a10', kind: 'math', math: { type: 'array', rows: 7, cols: 10 }, x: 40.4, y: 44, w: 40.85, anim: [{ at: 1.4, to: { x: 37.4 }, dur: 0.8 }] },
          { id: 'a5', kind: 'math', math: { type: 'array', rows: 7, cols: 5 }, x: 69.2, y: 44, w: 21.7, anim: [{ at: 1.4, to: { x: 75.2 }, dur: 0.8 }] },
          { id: 'n10', kind: 'text', text: '١٠', x: 37.4, y: 15, size: 3.8, color: 'white', in: 2.2 },
          { id: 'n5', kind: 'text', text: '٥', x: 75.2, y: 15, size: 3.8, color: 'white', in: 2.4 },
          { id: 'e1', kind: 'text', text: '١٠ × ٧ = ٧٠', x: 37.4, y: 74, size: 4.2, color: 'sun', ltr: true, in: 3.4 },
          { id: 'e2', kind: 'text', text: '٥ × ٧ = ٣٥', x: 75.2, y: 74, size: 4.2, color: '#8fd3ff', ltr: true, in: 5 },
          { id: 'e3', kind: 'text', text: '٧٠ + ٣٥ = ١٠٥', x: 56, y: 87, size: 5, box: true, color: 'accent', ltr: true, in: 7.4, anim: [{ at: 7.8, effect: 'glow' }] },
        ],
      },
      (() => {
        const L = chalkLine('nl', 15, 25, 1, 52, range(15, 25, 1), 0);
        return {
          title: 'قريب من مضاعفات ١٠',
          say: 'العدد ٢٠ من مضاعفات العدد ١٠. والعددان ١٩ و٢١ يقعان على جانبيه مباشرة، لذا نسمّيهما عددين قريبين من مضاعفات العدد ١٠.',
          duration: 11,
          bg: 'board' as const,
          actors: [
            ...L.actors,
            { id: 'r20', kind: 'shape', shape: 'circle', x: L.X(20), y: 52, w: 3.4, h: 5.4, color: 'sun', in: 0.6 },
            { id: 't20', kind: 'text', text: 'مضاعف للعدد ١٠', x: L.X(20), y: 22, size: 3.6, box: true, color: 'sun', in: 1 },
            { id: 'a20', kind: 'arrow', from: [L.X(20), 28], to: [L.X(20), 44], color: 'sun', in: 1.4 },
            dot('d19', L.X(19), 52, 3.4, '#7be3a4', [{ at: 3.8, effect: 'pulse' }]),
            dot('d21', L.X(21), 52, 3.8, '#7be3a4', [{ at: 4.2, effect: 'pulse' }]),
            ...arc('j1', L, 19, 20, '', '#7be3a4', 4.4, 3),
            ...arc('j2', L, 21, 20, '', '#7be3a4', 4.6, 3),
            { id: 'res', kind: 'text', text: '١٩ و٢١ قريبان من مضاعفات ١٠', x: 50, y: 80, size: 4, box: true, color: 'good', in: 6.4, anim: [{ at: 6.8, effect: 'glow' }] },
          ],
        };
      })(),
      {
        title: 'نقرّب ثم نطرح: ٣٩ × ٥',
        say: 'العدد ٣٩ قريب من ٤٠. نحسب ٤٠ مجموعة من ٥: ٤٠ × ٥ = ٢٠٠. لكن عندنا ٣٩ مجموعة فقط، فنطرح مجموعة واحدة: ٢٠٠ − ٥ = ١٩٥',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'near', kind: 'text', text: '٣٩ قريب من ٤٠', x: 46, y: 21, size: 3.8, box: true, color: 'sun', in: 0.3 },
          ...Array.from({ length: 40 }, (_, i): Actor =>
            column(`c${i}`, i, 12, 1.85, 46, 16, i === 39 ? '#ff8a80' : 'sun', 0.8 + i * 0.04, i === 39 ? [{ at: 6, to: { y: 30 }, dur: 0.6 }, { at: 6.8, effect: 'shake' }, { at: 8.6, to: { opacity: 0 }, dur: 0.4 }] : undefined),
          ),
          { id: 'g', kind: 'text', text: 'كل عمود = ٥', x: 22, y: 33, size: 2.8, color: 'white', in: 2.6 },
          { id: 'e1', kind: 'text', text: '٤٠ × ٥ = ٢٠٠', x: 50, y: 62, size: 4.2, color: 'white', ltr: true, in: 3.4 },
          { id: 'e2', kind: 'text', text: '١ × ٥ = ٥', x: 76, y: 21, size: 3.4, color: '#ff8a80', ltr: true, in: 6.4 },
          { id: 'e3', kind: 'text', text: '٢٠٠ − ٥ = ١٩٥', x: 50, y: 75, size: 4.4, color: 'orange', ltr: true, in: 8.4 },
          { id: 'e4', kind: 'text', text: '٣٩ × ٥ = ١٩٥', x: 50, y: 88, size: 5, box: true, color: 'accent', ltr: true, in: 10, anim: [{ at: 10.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'نقرّب ثم نجمع: ٤١ × ٦',
        say: 'والعدد ٤١ قريب من ٤٠ أيضًا. ٤٠ × ٦ = ٢٤٠، ثم نُضيف مجموعة واحدة من ٦: ٢٤٠ + ٦ = ٢٤٦',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'near', kind: 'text', text: '٤١ قريب من ٤٠', x: 46, y: 21, size: 3.8, box: true, color: 'sun', in: 0.3 },
          ...Array.from({ length: 41 }, (_, i): Actor =>
            i === 40
              ? column(`c${i}`, i, 11, 1.85, 26, 19, '#7be3a4', 5.6, [{ at: 6.2, to: { y: 46 }, dur: 0.6 }, { at: 6.9, effect: 'pulse' }])
              : column(`c${i}`, i, 11, 1.85, 46, 19, '#8fd3ff', 0.8 + i * 0.04),
          ),
          { id: 'g', kind: 'text', text: 'كل عمود = ٦', x: 22, y: 32, size: 2.8, color: 'white', in: 2.6 },
          { id: 'e1', kind: 'text', text: '٤٠ × ٦ = ٢٤٠', x: 50, y: 63, size: 4.2, color: 'white', ltr: true, in: 3.4 },
          { id: 'e2', kind: 'text', text: '١ × ٦ = ٦', x: 76, y: 21, size: 3.4, color: '#7be3a4', ltr: true, in: 5.8 },
          { id: 'e3', kind: 'text', text: '٢٤٠ + ٦ = ٢٤٦', x: 50, y: 75, size: 4.4, color: '#7be3a4', ltr: true, in: 7.6 },
          { id: 'e4', kind: 'text', text: '٤١ × ٦ = ٢٤٦', x: 50, y: 88, size: 5, box: true, color: 'accent', ltr: true, in: 9, anim: [{ at: 9.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'انتبهي!',
        say: 'في ٤٩ × ٧ نحسب ٥٠ × ٧ = ٣٥٠. هل نطرح ١؟ لا! نطرح مجموعة كاملة من ٧: ٣٥٠ − ٧ = ٣٤٣',
        duration: 12,
        bg: 'board',
        actors: [
          { id: 'top', kind: 'text', text: '٥٠ × ٧ = ٣٥٠', x: 50, y: 18, size: 4.6, color: 'white', ltr: true, in: 0.3 },
          ...Array.from({ length: 50 }, (_, i): Actor =>
            column(`c${i}`, i, 12.5, 1.5, 38, 14, i === 49 ? '#ff8a80' : 'orange', 0.6 + i * 0.03, i === 49 ? [{ at: 6.6, effect: 'pulse' }] : undefined),
          ),
          { id: 'w', kind: 'text', text: '٣٥٠ − ١ = ٣٤٩', x: 46, y: 57, size: 4.4, color: 'white', ltr: true, in: 3, anim: [{ at: 4.4, effect: 'shake' }, { at: 5.6, to: { opacity: 0.35 }, dur: 0.4 }] },
          { id: 'wx', kind: 'text', text: '✗', x: 74, y: 57, size: 5.5, color: 'red', in: 4.2 },
          { id: 'r', kind: 'text', text: '٣٥٠ − ٧ = ٣٤٣', x: 46, y: 70, size: 4.4, color: '#7be3a4', ltr: true, in: 6.8 },
          { id: 'rx', kind: 'text', text: '✓', x: 74, y: 70, size: 5.5, color: '#7be3a4', in: 7.4 },
          { id: 'hint', kind: 'text', text: 'نطرح ١ × ٧ = ٧', x: 50, y: 86, size: 4.2, box: true, color: 'good', in: 8.6, anim: [{ at: 9, effect: 'glow' }] },
        ],
      },
      (() => {
        const U = 0.96;
        const w = 42 * U;
        const h = 8 * U * 1.6;
        const x0 = 12;
        const y0 = 36;
        const lx = x0 + w / 4;
        const rx = x0 + (3 * w) / 4;
        return {
          title: 'نضاعف وننصّف',
          say: 'نعرف أن ٤٢ × ٨ = ٣٣٦. نقسم المستطيل نصفين ونضع نصفه تحت الآخر: نصّفنا ٤٢ فصار ٢١، وضاعفنا ٨ فصار ١٦. الناتج لم يتغيّر: ٢١ × ١٦ = ٣٣٦',
          duration: 14,
          bg: 'board' as const,
          actors: [
            { id: 'L', kind: 'shape', shape: 'rect', x: lx, y: y0, w: w / 2, h, color: 'sun', in: 0.3 },
            { id: 'R', kind: 'shape', shape: 'rect', x: rx, y: y0, w: w / 2, h, color: 'orange', in: 0.3, anim: [{ at: 4.4, to: { x: lx, y: y0 + h }, dur: 1.4 }] },
            { id: 'w42', kind: 'text', text: '٤٢', x: x0 + w / 2, y: y0 - h / 2 - 4, size: 3.6, color: 'white', in: 0.8, out: 4 },
            { id: 'h8', kind: 'text', text: '٨', x: x0 - 3.5, y: y0, size: 3.6, color: 'white', in: 0.8, out: 4 },
            { id: 'e1', kind: 'text', text: '٤٢ × ٨ = ٣٣٦', x: 74, y: 24, size: 4.4, color: 'white', ltr: true, in: 1.4 },
            { id: 'cut', kind: 'shape', shape: 'rect', x: x0 + w / 2, y: y0, w: 0.4, h: h + 4, color: 'white', in: 2.6, out: 4.2 },
            { id: 'w21', kind: 'text', text: '٢١', x: lx, y: y0 - h / 2 - 4, size: 3.6, color: 'sun', in: 6.2 },
            { id: 'h16', kind: 'text', text: '١٦', x: x0 - 3.5, y: y0 + h / 2, size: 3.6, color: 'sun', in: 6.6 },
            { id: 'half', kind: 'text', text: '٤٢ ÷ ٢ = ٢١', x: 74, y: 40, size: 3.8, color: 'sun', ltr: true, in: 7.2 },
            { id: 'dbl', kind: 'text', text: '٨ × ٢ = ١٦', x: 74, y: 52, size: 3.8, color: 'orange', ltr: true, in: 8.2 },
            { id: 'e2', kind: 'text', text: '٢١ × ١٦ = ٣٣٦', x: 74, y: 70, size: 4.6, box: true, color: 'accent', ltr: true, in: 9.8, anim: [{ at: 10.2, effect: 'glow' }] },
            { id: 'same', kind: 'text', text: 'الناتج نفسه ✓', x: 74, y: 84, size: 3.8, color: '#7be3a4', in: 10.8 },
          ],
        };
      })(),
      {
        title: 'الخلاصة',
        say: 'نستخدم حقائق جدول الضرب: نجزّئ العدد ثم نجمع، أو نقرّبه إلى مضاعف العدد ١٠ ثم نطرح أو نجمع، أو نضاعف أحد العددين وننصّف الآخر.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 'l1', kind: 'text', text: 'نجزّئ ثم نجمع', x: 80, y: 22, size: 3.4, box: true, color: 'sun', in: 0.4 },
          { id: 'q1', kind: 'text', text: '١٥ × ٧ = ١٠ × ٧ + ٥ × ٧', x: 38, y: 22, size: 3.8, color: 'white', ltr: true, in: 0.8 },
          { id: 'l2', kind: 'text', text: 'نقرّب ثم نطرح', x: 80, y: 40, size: 3.4, box: true, color: 'orange', in: 3 },
          { id: 'q2', kind: 'text', text: '٣٩ × ٥ = ٤٠ × ٥ − ١ × ٥', x: 38, y: 40, size: 3.8, color: 'white', ltr: true, in: 3.4 },
          { id: 'l3', kind: 'text', text: 'نقرّب ثم نجمع', x: 80, y: 58, size: 3.4, box: true, color: 'blue', in: 5.6 },
          { id: 'q3', kind: 'text', text: '٤١ × ٦ = ٤٠ × ٦ + ١ × ٦', x: 38, y: 58, size: 3.8, color: 'white', ltr: true, in: 6 },
          { id: 'l4', kind: 'text', text: 'نضاعف وننصّف', x: 80, y: 76, size: 3.4, box: true, color: 'good', in: 8.4 },
          { id: 'q4', kind: 'text', text: '٤٢ × ٨ = ٢١ × ١٦', x: 38, y: 76, size: 3.8, color: 'white', ltr: true, in: 8.8, anim: [{ at: 9.2, effect: 'glow' }] },
        ],
      },
    ],
  },
];

/** Keep thousands groups such as «٣ ٤٥٦» together and in order in right-to-left text (narration and labels). */
const explainers: Explainer[] = raw.map((e) => ({
  ...e,
  scenes: e.scenes.map((sc) => ({
    ...sc,
    say: keepNumberGroups(sc.say),
    actors: sc.actors.map((a) => (a.kind === 'text' ? { ...a, text: keepNumberGroups(a.text) } : a)),
  })),
}));

export default explainers;
