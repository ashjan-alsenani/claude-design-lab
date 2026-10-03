import type { Actor, Anim, Explainer, XY } from '../../../../explain/types';

/**
 * Lessons 3-5 «المحاليل», 3-6 «كيف نجعل المواد الصلبة تذوب أسرع؟», 3-7 «كيف يؤثر حجم الحبيبات على الذوبان؟».
 * Sources: site lessons (src/data/unit3.ts) and the book, pp. 62–67.
 */

const WATER = '#bfe9ff';
const DRINK = '#ffd8a8';
const TEA = '#e3a86b';
const HOT = '#ffd0c2';
const POWDER = '#ff9f43';

interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** A glass of liquid (a filled rounded rectangle). */
function glass(id: string, x: number, y: number, w: number, h: number, color = WATER, inAt = 0): Actor {
  return { id, kind: 'shape', shape: 'rect', x, y, w, h, color, in: inAt };
}

interface GrainOpts {
  n: number;
  /** centre x of the pile and the y of its bottom row */
  cx: number;
  bottom: number;
  color?: string;
  /** grain width in % of stage width */
  size?: number;
  cols?: number;
  inAt?: number;
  /** where the grains spread to when they dissolve */
  spread?: Box;
  at?: number;
  step?: number;
  /** only the first `moves` grains dissolve (default all) */
  moves?: number;
  shrink?: number;
  fade?: number;
  dur?: number;
}

/** Round grains piled at the bottom of a glass; optionally spreading evenly through the liquid (dissolving). */
function grains(p: string, o: GrainOpts): Actor[] {
  const size = o.size ?? 2.2;
  const cols = o.cols ?? 5;
  return Array.from({ length: o.n }, (_, k): Actor => {
    const row = Math.floor(k / cols);
    const col = k % cols;
    const x = o.cx + (col - (cols - 1) / 2) * size * 1.1 + (row % 2 ? size * 0.5 : 0);
    const y = o.bottom - row * size * 1.5;
    const anim: Anim[] = [];
    if (o.spread && k < (o.moves ?? o.n)) {
      const t = (k * 7) % o.n;
      const sc = 5;
      const rows = Math.ceil(o.n / sc);
      const b = o.spread;
      const tx = b.x0 + ((t % sc) + 0.5) * ((b.x1 - b.x0) / sc) + (((t * 3) % 5) - 2) * 0.4;
      const ty = b.y0 + (Math.floor(t / sc) + 0.5) * ((b.y1 - b.y0) / rows) + (((t * 2) % 5) - 2) * 0.6;
      anim.push({ at: (o.at ?? 1) + k * (o.step ?? 0.2), to: { x: tx, y: ty, scale: o.shrink, opacity: o.fade }, dur: o.dur ?? 1.4 });
    }
    return { id: `${p}${k}`, kind: 'shape', shape: 'circle', x, y, w: size, h: size * 1.6, color: o.color ?? 'white', in: o.inAt, anim };
  });
}

/** One grain seen up close: a block of particles; each ring (outer first) leaves at peel[ring]. */
function grainBlock(p: string, cx: number, cy: number, n: number, dx: number, dy: number, color: string, peel: number[], inAt = 0): Actor[] {
  const out: Actor[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = cx + (i - (n - 1) / 2) * dx;
      const y = cy + (j - (n - 1) / 2) * dy;
      const ring = Math.min(i, j, n - 1 - i, n - 1 - j);
      const at = (peel[ring] ?? peel[peel.length - 1]) + ((i * 3 + j * 5) % 4) * 0.15;
      out.push({
        id: `${p}${i}-${j}`,
        kind: 'shape',
        shape: 'rect',
        x,
        y,
        w: dx * 0.82,
        h: dy * 0.82,
        color,
        in: inAt,
        anim: [{ at, to: { x: cx + (x - cx) * 2.1, y: cy + (y - cy) * 2.1, opacity: 0, scale: 0.6 }, dur: 1.6 }],
      });
    }
  }
  return out;
}

/** Particles circling inside a zoom bubble (slow when cold, fast when hot). */
function jiggle(p: string, loops: XY[][], color: string, speed: number, inAt: number): Actor[] {
  return loops.map((path, i): Actor => ({ id: `${p}${i}`, kind: 'flow', path, color, count: 3, speed: speed + i * 0.3, showPath: false, in: inAt }));
}

const loopsAt = (cx: number, cy: number): XY[][] => [
  [[cx - 8, cy - 14], [cx + 6, cy - 18], [cx + 10, cy - 4], [cx - 2, cy - 2], [cx - 8, cy - 14]],
  [[cx - 10, cy + 4], [cx + 2, cy + 2], [cx + 8, cy + 16], [cx - 6, cy + 18], [cx - 10, cy + 4]],
  [[cx + 2, cy - 8], [cx + 11, cy + 6], [cx - 1, cy + 10], [cx - 11, cy - 4], [cx + 2, cy - 8]],
];

const explainers: Explainer[] = [
  /* ================================================================== */
  {
    lesson: '3-5',
    title: 'المحلول: مادة مُذابة في مادة مُذيبة',
    scenes: [
      {
        title: 'أين الملح؟',
        say: 'انظري إلى ماء البحر. هل يمكنكِ رؤية الملح فيه؟ الملح موجود في ماء البحر، لكننا لا نراه! فكيف يحدث ذلك؟',
        bg: 'sea',
        actors: [
          { id: 'sea', kind: 'emoji', emoji: '🌊', x: 50, y: 58, size: 30, anim: [{ at: 0.4, effect: 'float' }] },
          { id: 'salt', kind: 'emoji', emoji: '🧂', x: 18, y: 36, size: 12, in: 1.4 },
          { id: 'look', kind: 'emoji', emoji: '🔍', x: 78, y: 40, size: 12, in: 2.4, anim: [{ at: 2.8, to: { x: 64, y: 52 }, dur: 1.4 }] },
          { id: 'q', kind: 'text', text: 'هل ترين الملح؟', x: 50, y: 22, size: 4.6, box: true, color: 'accent', in: 3.6, anim: [{ at: 4, effect: 'pulse' }] },
        ],
      },
      {
        title: 'جزءا المحلول',
        say: 'كل محلول له جزءان: المادة التي تذوب تُسمّى المادة المُذابة، مثل الملح. والسائل الذي تذوب فيه يُسمّى المادة المُذيبة، مثل الماء.',
        duration: 12,
        bg: 'lab',
        actors: [
          glass('g', 50, 56, 22, 44),
          { id: 'salt', kind: 'emoji', emoji: '🧂', x: 18, y: 36, size: 11, in: 0.6 },
          { id: 'l1', kind: 'text', text: 'المادة المُذابة', x: 18, y: 56, size: 3.6, box: true, color: 'orange', in: 1 },
          { id: 'a1', kind: 'arrow', from: [26, 38], to: [44, 70], curve: -6, color: 'orange', in: 1.6 },
          ...grains('s', { n: 15, cx: 50, bottom: 74, inAt: 2.2, spread: { x0: 41, x1: 59, y0: 38, y1: 76 }, at: 3.2, step: 0.12 }),
          { id: 'l2', kind: 'text', text: '💧 المادة المُذيبة', x: 82, y: 40, size: 3.6, box: true, color: 'blue', in: 5.4 },
          { id: 'a2', kind: 'arrow', from: [80, 48], to: [62, 56], curve: 4, color: 'blue', in: 5.8 },
          { id: 'res', kind: 'text', text: '🌊 ماء البحر محلول', x: 50, y: 88, size: 4, box: true, color: 'accent', in: 8, anim: [{ at: 8.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'لنصنع مشروبًا باردًا',
        say: 'نضع ملعقة من مسحوق المشروب البارد في ١٠٠ مل من الماء. المسحوق هو المادة المُذابة، والماء هو المادة المُذيبة.',
        bg: 'lab',
        actors: [
          glass('g', 50, 58, 22, 44),
          { id: 'ml', kind: 'text', text: '١٠٠ مل ماء', x: 50, y: 46, size: 3.4, color: 'blue', in: 0.6 },
          { id: 'spoon', kind: 'emoji', emoji: '🥄', x: 22, y: 22, size: 10, in: 1.2, anim: [{ at: 1.6, to: { x: 44, y: 30, rotate: -30 }, dur: 1.2 }, { at: 3.6, to: { opacity: 0 }, dur: 0.5 }] },
          ...grains('p', { n: 15, cx: 50, bottom: 76, color: POWDER, inAt: 2.9 }),
          { id: 'l1', kind: 'text', text: '🧃 المادة المُذابة', x: 20, y: 72, size: 3.4, box: true, color: 'orange', in: 4.4 },
          { id: 'a1', kind: 'arrow', from: [26, 79], to: [43, 76], color: 'orange', in: 4.8 },
          { id: 'l2', kind: 'text', text: '💧 المادة المُذيبة', x: 82, y: 42, size: 3.4, box: true, color: 'blue', in: 6.4 },
          { id: 'a2', kind: 'arrow', from: [80, 50], to: [62, 58], curve: 4, color: 'blue', in: 6.8 },
        ],
      },
      {
        title: 'يبدأ الذوبان',
        say: 'راقبي المسحوق: تتحرّك جزيئات المادة المُذابة بين جزيئات المادة المُذيبة، وتنتشر شيئًا فشيئًا في كل الماء.',
        bg: 'lab',
        actors: [
          glass('g', 50, 58, 22, 44),
          { id: 'tint', kind: 'shape', shape: 'rect', x: 50, y: 58, w: 22, h: 44, color: DRINK, anim: [{ at: 0, to: { opacity: 0 }, dur: 0.01 }, { at: 6.2, to: { opacity: 1 }, dur: 1.2 }] },
          ...grains('p', { n: 15, cx: 50, bottom: 76, color: POWDER, spread: { x0: 41, x1: 59, y0: 40, y1: 78 }, at: 1.2, step: 0.35, shrink: 0.7 }),
          { id: 'l', kind: 'text', text: 'تنتشر بين جزيئات الماء', x: 72, y: 30, size: 3.2, box: true, color: 'orange', in: 2.4 },
          { id: 'a', kind: 'arrow', from: [76, 38], to: [61, 50], curve: 4, color: 'orange', in: 2.8 },
          { id: 'sw', kind: 'emoji', emoji: '🌀', x: 20, y: 56, size: 10, in: 1.4, anim: [{ at: 1.6, effect: 'spin' }] },
        ],
      },
      {
        title: 'محلول متجانس',
        say: 'بعد خمس دقائق، هل ترين المسحوق؟ لا! انتشرت جزيئاته بالتساوي، فصار المحلول متجانسًا: يبدو بنفس الشكل في جميع أجزائه.',
        duration: 12,
        bg: 'lab',
        actors: [
          glass('g', 50, 54, 22, 44, DRINK),
          ...grains('p', { n: 15, cx: 50, bottom: 72, color: POWDER, spread: { x0: 41, x1: 59, y0: 36, y1: 74 }, at: 0, step: 0, dur: 0.01, shrink: 0.7 }).map(
            (a): Actor => ({ ...a, anim: [...(a.anim ?? []), { at: 2.4, to: { opacity: 0 }, dur: 2.4 }] }),
          ),
          { id: 'clock', kind: 'emoji', emoji: '⏱️', x: 18, y: 30, size: 10, in: 0.4, anim: [{ at: 0.8, effect: 'pulse' }] },
          { id: 'min', kind: 'text', text: 'بعد ٥ دقائق', x: 18, y: 46, size: 3.4, box: true, color: 'ink', in: 0.8 },
          { id: 'eye', kind: 'text', text: 'لا نرى المسحوق 👀', x: 20, y: 70, size: 3.2, box: true, color: 'orange', in: 4.6 },
          { id: 'top', kind: 'arrow', from: [70, 46], to: [61, 40], color: 'accent', in: 6.4 },
          { id: 'bot', kind: 'arrow', from: [70, 62], to: [61, 68], color: 'accent', in: 6.6 },
          { id: 'same', kind: 'text', text: 'الشكل نفسه ✓', x: 82, y: 54, size: 3.4, box: true, color: 'accent', in: 6.8 },
          { id: 'res', kind: 'text', text: 'متجانس ✨', x: 50, y: 88, size: 5, box: true, color: 'good', in: 8, anim: [{ at: 8.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'مخلوط أم مادة نقية؟',
        say: 'مسحوق المشروب البارد مخلوط: فيه حبيبات السكر ومواد أخرى. أما السكر فمادة نقية تتكوّن من حبيبات السكر فقط. ويمكن فصل معظم المخاليط بسهولة.',
        duration: 13,
        bg: 'lab',
        actors: [
          { id: 'n1', kind: 'text', text: '🧃 مسحوق المشروب', x: 74, y: 20, size: 3.6, box: true, color: 'orange', in: 0.3 },
          { id: 'c1', kind: 'shape', shape: 'circle', x: 74, y: 52, w: 26, h: 42, color: '#eef3ff', in: 0.5 },
          ...[
            [68, 42], [76, 40], [82, 48], [70, 52], [78, 56], [66, 60], [74, 64], [82, 60],
          ].map(([x, y], i): Actor => ({ id: `m${i}`, kind: 'shape', shape: 'circle', x, y, w: 3, h: 4.8, color: i % 2 ? 'sun' : 'red', in: 1 + i * 0.1 })),
          { id: 'k1', kind: 'text', text: 'سكر + مواد أخرى', x: 74, y: 80, size: 3, color: 'ink', in: 2.2 },
          { id: 'r1', kind: 'text', text: 'مخلوط', x: 74, y: 90, size: 4.2, box: true, color: 'orange', in: 2.8, anim: [{ at: 3, effect: 'pulse' }] },
          { id: 'n2', kind: 'text', text: '🍬 السكر', x: 26, y: 20, size: 3.6, box: true, color: 'purple', in: 4.4 },
          { id: 'c2', kind: 'shape', shape: 'circle', x: 26, y: 52, w: 26, h: 42, color: '#eef3ff', in: 4.6 },
          ...[
            [20, 42], [28, 40], [34, 48], [22, 52], [30, 56], [18, 60], [26, 64], [34, 60],
          ].map(([x, y], i): Actor => ({ id: `s${i}`, kind: 'shape', shape: 'circle', x, y, w: 3, h: 4.8, color: 'sun', in: 5 + i * 0.1 })),
          { id: 'k2', kind: 'text', text: 'حبيبات السكر فقط', x: 26, y: 80, size: 3, color: 'ink', in: 6 },
          { id: 'r2', kind: 'text', text: 'مادة نقية', x: 26, y: 90, size: 4.2, box: true, color: 'purple', in: 6.6, anim: [{ at: 6.8, effect: 'pulse' }] },
          { id: 'vs', kind: 'text', text: '≠', x: 50, y: 52, size: 7, color: 'grey', in: 7.4 },
        ],
      },
      {
        title: 'تذكّري',
        say: 'المادة المُذابة + المادة المُذيبة = محلول. مثل الملح في ماء البحر، ومسحوق المشروب في الماء، والسكر في الشاي.',
        duration: 11,
        bg: 'sky',
        actors: [
          { id: 'h1', kind: 'text', text: 'مادة مُذابة', x: 82, y: 26, size: 3.6, box: true, color: 'orange', in: 0.3 },
          { id: 'hp', kind: 'text', text: '+', x: 66, y: 26, size: 5, in: 0.8 },
          { id: 'h2', kind: 'text', text: 'مادة مُذيبة', x: 50, y: 26, size: 3.6, box: true, color: 'blue', in: 1.1 },
          { id: 'he', kind: 'text', text: '=', x: 34, y: 26, size: 5, in: 1.6 },
          { id: 'h3', kind: 'text', text: 'محلول ✨', x: 18, y: 26, size: 3.8, box: true, color: 'accent', in: 1.9, anim: [{ at: 2.3, effect: 'glow' }] },
          ...(
            [
              ['🧂 الملح', '💧 الماء', '🌊 ماء البحر'],
              ['🧃 المسحوق', '💧 الماء', '🥤 مشروب بارد'],
              ['🍬 السكر', '🍵 الشاي', '🍵 محلول'],
            ] as const
          ).flatMap(([a, b, c], r): Actor[] => {
            const y = 48 + r * 15;
            const t = 3.4 + r * 1.4;
            return [
              { id: `a${r}`, kind: 'text', text: a, x: 82, y, size: 3.4, color: 'ink', in: t },
              { id: `p${r}`, kind: 'text', text: '+', x: 66, y, size: 3.6, color: 'grey', in: t },
              { id: `b${r}`, kind: 'text', text: b, x: 50, y, size: 3.4, color: 'ink', in: t + 0.3 },
              { id: `e${r}`, kind: 'text', text: '=', x: 34, y, size: 3.6, color: 'grey', in: t + 0.5 },
              { id: `c${r}`, kind: 'text', text: c, x: 18, y, size: 3.4, color: 'accent', in: t + 0.6 },
            ];
          }),
        ],
      },
    ],
  },

  /* ================================================================== */
  {
    lesson: '3-6',
    title: 'كيف نجعل السكر يذوب أسرع؟',
    scenes: [
      {
        title: 'شاي الجدة',
        say: 'قدّم محمد كوب شاي لجدته، فقالت: لا أشعر بطعم السكر! قال محمد: وضعت ملعقتين صغيرتين كعادتي. فلماذا بقي الشاي مُرًّا؟',
        duration: 11,
        bg: 'sky',
        actors: [
          { id: 'boy', kind: 'emoji', emoji: '👦🏽', x: 24, y: 58, size: 22 },
          { id: 'gran', kind: 'emoji', emoji: '👵🏽', x: 76, y: 58, size: 22 },
          { id: 'tea', kind: 'emoji', emoji: '🍵', x: 50, y: 70, size: 10, in: 0.6, anim: [{ at: 0.6, to: { x: 57 }, dur: 1.2 }] },
          { id: 'g1', kind: 'text', text: 'لا أشعر بطعم السكر!', x: 74, y: 24, size: 3.2, box: true, color: 'red', in: 2 },
          { id: 'b1', kind: 'text', text: 'وضعت ملعقتين 🥄🥄', x: 26, y: 24, size: 3.2, box: true, color: 'blue', in: 4.4 },
          { id: 'q', kind: 'text', text: 'لماذا الشاي مُرّ؟', x: 50, y: 88, size: 4.2, box: true, color: 'accent', in: 7, anim: [{ at: 7.4, effect: 'pulse' }] },
        ],
      },
      {
        title: 'السكر في القاع',
        say: 'انظري داخل الكوب: السكر ما زال في القاع ولم يذب بعد. كيف يجعل محمد الشاي أحلى دون أن يضيف سكرًا؟',
        bg: 'lab',
        actors: [
          glass('g', 38, 56, 22, 44, TEA),
          ...grains('s', { n: 15, cx: 38, bottom: 74, inAt: 0.8 }),
          { id: 'l', kind: 'text', text: 'السكر لم يذب بعد', x: 78, y: 72, size: 3.4, box: true, color: 'bad', in: 2.2, anim: [{ at: 2.4, effect: 'shake' }] },
          { id: 'a', kind: 'arrow', from: [60, 74], to: [48, 74], color: 'bad', in: 2.6 },
          { id: 'q', kind: 'text', text: 'أحلى دون سكر إضافي؟', x: 72, y: 30, size: 3.4, box: true, color: 'accent', in: 5, anim: [{ at: 5.4, effect: 'pulse' }] },
        ],
      },
      {
        title: 'سرّ التحريك',
        say: 'لنقارن كوبين: في الكوب الذي نحرّكه ينتشر السكر ويذوب أسرع بكثير من الكوب الذي لا نحرّكه.',
        duration: 11,
        bg: 'lab',
        actors: [
          { id: 'n1', kind: 'text', text: 'بدون تحريك', x: 72, y: 22, size: 3.4, box: true, color: 'grey', in: 0.3 },
          glass('g1', 72, 58, 22, 44, TEA),
          ...grains('a', { n: 15, cx: 72, bottom: 76, spread: { x0: 63, x1: 81, y0: 60, y1: 78 }, at: 4, step: 1.2, moves: 3 }),
          { id: 'n2', kind: 'text', text: '🥄 مع التحريك', x: 28, y: 22, size: 3.4, box: true, color: 'accent', in: 0.6 },
          glass('g2', 28, 58, 22, 44, TEA),
          { id: 'spoon', kind: 'emoji', emoji: '🥄', x: 30, y: 44, size: 10, in: 1.2, anim: [{ at: 1.4, effect: 'wiggle' }] },
          ...grains('b', { n: 15, cx: 28, bottom: 76, spread: { x0: 19, x1: 37, y0: 40, y1: 78 }, at: 1.8, step: 0.15, shrink: 0.7 }),
          { id: 'r2', kind: 'text', text: 'يذوب أسرع ✓', x: 28, y: 89, size: 3.6, box: true, color: 'good', in: 5.4, anim: [{ at: 5.8, effect: 'glow' }] },
          { id: 'r1', kind: 'text', text: 'أبطأ', x: 72, y: 89, size: 3.6, box: true, color: 'grey', in: 6.2 },
        ],
      },
      {
        title: 'لماذا ينجح التحريك؟',
        say: 'التحريك يجعل جزيئات المادة المُذابة تنتشر في الفراغات بين جزيئات المادة المُذيبة أسرع. نقول: التحريك يزيد معدل الذوبان.',
        duration: 12,
        bg: 'lab',
        actors: [
          { id: 'zoom', kind: 'shape', shape: 'circle', x: 50, y: 52, w: 38, h: 62, color: '#e4f5ff' },
          ...[38, 46, 54, 62].flatMap((x, i) =>
            [32, 44, 56, 68].map((y, j): Actor => ({ id: `w${i}-${j}`, kind: 'shape', shape: 'circle', x, y, w: 3.6, h: 5.8, color: 'blue', in: 0.3 })),
          ),
          ...(
            [
              [42, 38], [50, 50], [58, 38], [42, 62], [58, 62], [50, 38], [42, 50], [58, 50], [50, 62],
            ] as const
          ).map(([tx, ty], k): Actor => ({
            id: `s${k}`,
            kind: 'shape',
            shape: 'circle',
            x: 46 + (k % 3) * 4,
            y: 72.5 + Math.floor(k / 3) * 3.2,
            w: 2.8,
            h: 4.5,
            color: POWDER,
            in: 0.8,
            anim: [{ at: 2.4 + k * 0.3, to: { x: tx, y: ty }, dur: 1.2 }],
          })),
          { id: 'swirl', kind: 'arrow', from: [70, 28], to: [70, 74], curve: -8, color: 'accent', in: 1.8 },
          { id: 'l1', kind: 'text', text: 'المادة المُذيبة', x: 17, y: 32, size: 3.2, box: true, color: 'blue', in: 0.6 },
          { id: 'l2', kind: 'text', text: 'المادة المُذابة', x: 17, y: 74, size: 3.2, box: true, color: 'orange', in: 1.2 },
          { id: 'l2a', kind: 'arrow', from: [29, 76], to: [42, 76], color: 'orange', in: 1.4 },
          { id: 'l3', kind: 'text', text: 'في الفراغات ✓', x: 84, y: 50, size: 3.2, box: true, color: 'accent', in: 4.4 },
          { id: 'rate', kind: 'text', text: 'التحريك يزيد معدل الذوبان 📈', x: 50, y: 91, size: 3.4, box: true, color: 'good', in: 7.4, anim: [{ at: 7.8, effect: 'glow' }] },
        ],
      },
      {
        title: 'اختبار عادل',
        say: 'خطّطت آمنة وأمل لاختبار عادل بثلاث كؤوس: غيّرتا عدد مرات التحريك فقط، وأبقتا كمية السكر وكمية الماء ودرجة حرارته كما هي.',
        duration: 13,
        bg: 'lab',
        actors: [
          { id: 'n1', kind: 'text', text: 'بدون تحريك', x: 80, y: 20, size: 3, box: true, color: 'grey', in: 0.3 },
          { id: 'n2', kind: 'text', text: 'كل دقيقتين', x: 50, y: 20, size: 3, box: true, color: 'accent', in: 0.6 },
          { id: 'm2', kind: 'text', text: 'نحرّك ٣ مرات', x: 50, y: 66, size: 2.6, color: 'ink', in: 1 },
          { id: 'n3', kind: 'text', text: 'كل دقيقة', x: 20, y: 20, size: 3, box: true, color: 'accent', in: 0.9 },
          { id: 'm3', kind: 'text', text: 'نحرّك ٣ مرات', x: 20, y: 66, size: 2.6, color: 'ink', in: 1.2 },
          glass('g1', 80, 44, 16, 30),
          glass('g2', 50, 44, 16, 30),
          glass('g3', 20, 44, 16, 30),
          { id: 'sp2', kind: 'emoji', emoji: '🥄', x: 52, y: 34, size: 7, in: 1.2, anim: [{ at: 1.4, effect: 'wiggle' }] },
          { id: 'sp3', kind: 'emoji', emoji: '🥄', x: 22, y: 34, size: 7, in: 1.2, anim: [{ at: 1.4, effect: 'wiggle' }] },
          ...grains('a', { n: 10, cx: 80, bottom: 56, size: 1.8, inAt: 0.4 }),
          ...grains('b', { n: 10, cx: 50, bottom: 56, size: 1.8, inAt: 0.4, spread: { x0: 43, x1: 57, y0: 33, y1: 57 }, at: 2.4, step: 0.5, shrink: 0.7 }),
          ...grains('c', { n: 10, cx: 20, bottom: 56, size: 1.8, inAt: 0.4, spread: { x0: 13, x1: 27, y0: 33, y1: 57 }, at: 1.8, step: 0.22, shrink: 0.7 }),
          { id: 'chg', kind: 'text', text: '🔄 نغيّر: عدد مرات التحريك', x: 50, y: 78, size: 3.2, box: true, color: 'accent', in: 4.4 },
          { id: 'fix', kind: 'text', text: '📌 ثابت: السكر، الماء، الحرارة', x: 50, y: 90, size: 3.2, box: true, color: 'green', in: 7 },
        ],
      },
      {
        title: 'ماء ساخن أم ماء بارد؟',
        say: 'نضع ملعقة صغيرة من السكر في ١٠٠ مل من الماء البارد، ثم في الماء الساخن، ونحرّك الكأسين. في الماء الساخن يذوب السكر أسرع!',
        duration: 12,
        bg: 'lab',
        actors: [
          { id: 'n1', kind: 'text', text: '🧊 ماء بارد', x: 72, y: 22, size: 3.6, box: true, color: 'blue', in: 0.3 },
          glass('g1', 72, 58, 22, 44),
          { id: 'n2', kind: 'text', text: '♨️ ماء ساخن', x: 28, y: 22, size: 3.6, box: true, color: 'red', in: 0.6 },
          glass('g2', 28, 58, 22, 44, HOT),
          { id: 'sp1', kind: 'emoji', emoji: '🥄', x: 74, y: 44, size: 9, in: 1.6, anim: [{ at: 1.8, effect: 'wiggle' }] },
          { id: 'sp2', kind: 'emoji', emoji: '🥄', x: 30, y: 44, size: 9, in: 1.6, anim: [{ at: 1.8, effect: 'wiggle' }] },
          ...grains('a', { n: 15, cx: 72, bottom: 76, inAt: 1, spread: { x0: 63, x1: 81, y0: 48, y1: 78 }, at: 3, step: 0.6, moves: 8, shrink: 0.8 }),
          ...grains('b', { n: 15, cx: 28, bottom: 76, inAt: 1, spread: { x0: 19, x1: 37, y0: 40, y1: 78 }, at: 2.4, step: 0.12, shrink: 0.6 }),
          { id: 'clock', kind: 'emoji', emoji: '⏱️', x: 50, y: 50, size: 9, in: 2.2, anim: [{ at: 2.4, effect: 'pulse' }] },
          { id: 'r2', kind: 'text', text: 'يذوب أسرع ✓', x: 28, y: 89, size: 3.6, box: true, color: 'good', in: 6.4, anim: [{ at: 6.8, effect: 'glow' }] },
          { id: 'r1', kind: 'text', text: 'أبطأ', x: 72, y: 89, size: 3.6, box: true, color: 'grey', in: 7.2 },
        ],
      },
      {
        title: 'لماذا تساعد الحرارة؟',
        say: 'الحرارة تُكسب الجزيئات طاقة فتتحرّك أسرع. لذلك تنتشر جزيئات المادة المُذابة في الماء الساخن بسهولة، فتذوب أسرع.',
        duration: 11,
        bg: 'lab',
        actors: [
          { id: 'c1', kind: 'shape', shape: 'circle', x: 72, y: 54, w: 34, h: 52, color: WATER },
          ...jiggle('cold', loopsAt(72, 54), 'blue', 9, 0.6),
          { id: 'l1', kind: 'text', text: '🧊 حركة بطيئة', x: 72, y: 88, size: 3.6, box: true, color: 'blue', in: 1.2 },
          { id: 'c2', kind: 'shape', shape: 'circle', x: 28, y: 54, w: 34, h: 52, color: HOT, in: 2.4 },
          ...jiggle('hot', loopsAt(28, 54), 'red', 1.8, 2.8),
          { id: 'en', kind: 'text', text: 'الحرارة ← طاقة ⚡', x: 28, y: 17, size: 3.2, box: true, color: 'sun', in: 3.2, anim: [{ at: 3.4, effect: 'pulse' }] },
          { id: 'l2', kind: 'text', text: '🔥 حركة أسرع', x: 28, y: 88, size: 3.6, box: true, color: 'red', in: 3.6, anim: [{ at: 4, effect: 'glow' }] },
        ],
      },
      {
        title: 'تذكّري',
        say: 'لتذوب المادة الصلبة أسرع: نحرّك المحلول، أو نستخدم الماء الساخن. هكذا يصبح شاي محمد أحلى دون سكر إضافي!',
        bg: 'sky',
        actors: [
          { id: 'a', kind: 'text', text: '🥄 التحريك', x: 72, y: 30, size: 4.4, box: true, color: 'accent', in: 0.4 },
          { id: 'b', kind: 'text', text: '♨️ التسخين', x: 28, y: 30, size: 4.4, box: true, color: 'red', in: 1.4 },
          { id: 'aa', kind: 'arrow', from: [70, 40], to: [56, 62], color: 'accent', in: 2.4 },
          { id: 'ba', kind: 'arrow', from: [30, 40], to: [44, 62], color: 'red', in: 2.6 },
          { id: 'res', kind: 'text', text: 'تذوب أسرع ✨', x: 50, y: 74, size: 6, box: true, color: 'good', in: 3.4, anim: [{ at: 3.8, effect: 'glow' }] },
          { id: 'tea', kind: 'emoji', emoji: '🍵', x: 84, y: 76, size: 9, in: 5, anim: [{ at: 5.4, effect: 'bounce' }] },
        ],
      },
    ],
  },

  /* ================================================================== */
  {
    lesson: '3-7',
    title: 'حجم الحبيبات والذوبان',
    scenes: [
      {
        title: 'ما زال مُرًّا!',
        say: 'مرة أخرى قدّم محمد الشاي لجدته. حرّكه جيدًا هذه المرة، لكنه بقي مُرًّا! قال محمد: وضعت قطعتين من السكر. فما السبب؟',
        duration: 11,
        bg: 'sky',
        actors: [
          { id: 'boy', kind: 'emoji', emoji: '👦🏽', x: 24, y: 58, size: 22 },
          { id: 'gran', kind: 'emoji', emoji: '👵🏽', x: 76, y: 58, size: 22 },
          { id: 'tea', kind: 'emoji', emoji: '🍵', x: 50, y: 70, size: 10, in: 0.4, anim: [{ at: 0.6, effect: 'wiggle' }] },
          { id: 'g1', kind: 'text', text: 'حرّكته لكنه مُرّ!', x: 74, y: 24, size: 3.4, box: true, color: 'red', in: 2 },
          { id: 'b1', kind: 'text', text: 'قطعتين من السكر', x: 26, y: 24, size: 3.4, box: true, color: 'blue', in: 4.6 },
          { id: 'q', kind: 'text', text: 'ما السبب؟', x: 50, y: 88, size: 4.4, box: true, color: 'accent', in: 7.4, anim: [{ at: 7.8, effect: 'pulse' }] },
        ],
      },
      {
        title: 'ملح خشن أم ملح ناعم؟',
        say: 'كأسان فيهما نفس كمية الماء ونفس كمية الملح، ونحرّك الاثنين. الملح الناعم حبيباته صغيرة فيذوب أسرع من الملح الخشن ذي الحبيبات الكبيرة.',
        duration: 13,
        bg: 'lab',
        actors: [
          { id: 'n1', kind: 'text', text: '🪨 ملح خشن', x: 72, y: 20, size: 3.6, box: true, color: 'grey', in: 0.3 },
          { id: 'k1', kind: 'text', text: 'حبيبات كبيرة', x: 72, y: 29, size: 3, color: 'ink', in: 0.6 },
          glass('g1', 72, 60, 22, 40),
          { id: 'n2', kind: 'text', text: '🧂 ملح ناعم', x: 28, y: 20, size: 3.6, box: true, color: 'accent', in: 1 },
          { id: 'k2', kind: 'text', text: 'حبيبات صغيرة', x: 28, y: 29, size: 3, color: 'ink', in: 1.3 },
          glass('g2', 28, 60, 22, 40),
          ...grains('big', { n: 5, cx: 72, bottom: 74, size: 5, cols: 3, inAt: 1.8, spread: { x0: 64, x1: 80, y0: 62, y1: 76 }, at: 3, step: 0.4, shrink: 0.75, dur: 6 }),
          ...grains('fine', { n: 25, cx: 28, bottom: 76, size: 1.5, cols: 7, inAt: 1.8, spread: { x0: 19, x1: 37, y0: 44, y1: 78 }, at: 3, step: 0.08, shrink: 0.5, fade: 0, dur: 2.4 }),
          { id: 'sp1', kind: 'emoji', emoji: '🥄', x: 74, y: 46, size: 8, in: 2.4, anim: [{ at: 2.6, effect: 'wiggle' }] },
          { id: 'sp2', kind: 'emoji', emoji: '🥄', x: 30, y: 46, size: 8, in: 2.4, anim: [{ at: 2.6, effect: 'wiggle' }] },
          { id: 'r2', kind: 'text', text: 'يذوب أسرع 🐇', x: 28, y: 89, size: 3.6, box: true, color: 'good', in: 6.8, anim: [{ at: 7.2, effect: 'glow' }] },
          { id: 'r1', kind: 'text', text: 'أبطأ 🐢', x: 72, y: 89, size: 3.6, box: true, color: 'grey', in: 7.6 },
        ],
      },
      {
        title: 'كيف تذوب الحبيبة؟',
        say: 'لنقترب من حبيبة واحدة: تذوب الجزيئات الخارجية أولًا لأنها أكثر اتصالًا بالسائل، ثم تتصل الجزيئات التي تحتها بالسائل فتذوب هي أيضًا.',
        duration: 13,
        bg: 'lab',
        actors: [
          glass('w', 40, 54, 56, 74),
          ...grainBlock('p', 40, 54, 5, 6, 9.6, 'white', [2.4, 6.4, 9.6], 0.4),
          { id: 'l0', kind: 'text', text: 'السائل 💧', x: 84, y: 22, size: 3.2, box: true, color: 'blue', in: 0.8 },
          { id: 'l1', kind: 'text', text: '١ الخارجية أولًا', x: 84, y: 46, size: 3.2, box: true, color: 'accent', in: 2.4, anim: [{ at: 2.6, effect: 'pulse' }] },
          { id: 'l2', kind: 'text', text: '٢ ثم التي تحتها', x: 84, y: 66, size: 3.2, box: true, color: 'purple', in: 6.4, anim: [{ at: 6.6, effect: 'pulse' }] },
        ],
      },
      {
        title: 'صغيرة أم كبيرة؟',
        say: 'الحبيبة الصغيرة فيها جزيئات قليلة، فتذوب بسرعة. أما الحبيبة الكبيرة ففيها جزيئات كثيرة، فتحتاج وقتًا أطول حتى تتصل كلها بالسائل وتذوب.',
        duration: 13,
        bg: 'lab',
        actors: [
          glass('w1', 70, 54, 36, 52),
          { id: 'k1', kind: 'text', text: 'حبيبة كبيرة', x: 70, y: 20, size: 3.2, color: 'ink', in: 0.6 },
          ...grainBlock('b', 70, 54, 5, 5, 8, 'white', [2, 5, 8], 0.4),
          { id: 'l1', kind: 'text', text: 'كثيرة ← أبطأ 🐢', x: 70, y: 90, size: 3.4, box: true, color: 'grey', in: 1 },
          glass('w2', 26, 54, 30, 52),
          { id: 'k2', kind: 'text', text: 'حبيبة صغيرة', x: 26, y: 20, size: 3.2, color: 'ink', in: 0.6 },
          ...grainBlock('s', 26, 54, 2, 5, 8, 'white', [2], 0.4),
          { id: 'l2', kind: 'text', text: 'قليلة ← أسرع 🐇', x: 26, y: 90, size: 3.4, box: true, color: 'good', in: 1.4, anim: [{ at: 4.4, effect: 'glow' }] },
        ],
      },
      {
        title: 'سرّ شاي محمد',
        say: 'استخدم محمد قطع سكر كبيرة، والقطع الكبيرة تستغرق وقتًا أطول لتذوب. لذلك لم يذب السكر كله بعد، وبقي الشاي مُرًّا.',
        duration: 11,
        bg: 'lab',
        actors: [
          { id: 'n1', kind: 'text', text: 'قطع سكر كبيرة', x: 72, y: 22, size: 3.4, box: true, color: 'grey', in: 0.3 },
          glass('g1', 72, 58, 22, 44, TEA),
          { id: 'c1', kind: 'shape', shape: 'rect', x: 67, y: 72, w: 7, h: 11, color: 'white', in: 0.6, anim: [{ at: 2, to: { scale: 0.8 }, dur: 8 }] },
          { id: 'c2', kind: 'shape', shape: 'rect', x: 77, y: 72, w: 7, h: 11, color: 'white', in: 0.8, anim: [{ at: 2, to: { scale: 0.8 }, dur: 8 }] },
          { id: 'sp1', kind: 'emoji', emoji: '🥄', x: 74, y: 44, size: 8, in: 1.2, anim: [{ at: 1.4, effect: 'wiggle' }] },
          { id: 'n2', kind: 'text', text: 'حبيبات سكر صغيرة', x: 28, y: 22, size: 3.4, box: true, color: 'accent', in: 3 },
          glass('g2', 28, 58, 22, 44, TEA, 3),
          ...grains('s', { n: 20, cx: 28, bottom: 76, size: 1.6, inAt: 3.2, spread: { x0: 19, x1: 37, y0: 40, y1: 78 }, at: 4, step: 0.1, shrink: 0.5, fade: 0, dur: 2 }),
          { id: 'sp2', kind: 'emoji', emoji: '🥄', x: 30, y: 44, size: 8, in: 3.4, anim: [{ at: 3.6, effect: 'wiggle' }] },
          { id: 'r1', kind: 'text', text: 'لم يذب كله بعد', x: 72, y: 89, size: 3.4, box: true, color: 'bad', in: 6.4, anim: [{ at: 6.6, effect: 'shake' }] },
          { id: 'r2', kind: 'text', text: 'يذوب أسرع ✓', x: 28, y: 89, size: 3.4, box: true, color: 'good', in: 7.2 },
        ],
      },
      {
        title: 'خطّطي لاختبار عادل',
        say: 'نتنبّأ أولًا، ثم نغيّر حجم الحبيبات فقط، ونُبقي كمية الماء وكمية الملح والتحريك كما هي. ثم ندوّن النتائج في جدول ونمثّلها بالأعمدة.',
        duration: 13,
        bg: 'lab',
        actors: [
          { id: 'pr', kind: 'text', text: '💭 أكتب تنبؤي', x: 80, y: 20, size: 3.2, box: true, color: 'purple', in: 0.4 },
          { id: 'chg', kind: 'text', text: '🔄 نغيّر: حجم الحبيبات', x: 76, y: 36, size: 3.2, box: true, color: 'accent', in: 1.8 },
          { id: 'fix', kind: 'text', text: '📌 ثابت: الماء، الملح، التحريك', x: 70, y: 52, size: 3.2, box: true, color: 'green', in: 3.6 },
          { id: 'tab', kind: 'text', text: '📋 جدول ثم 📊 أعمدة', x: 76, y: 68, size: 3.2, box: true, color: 'ink', in: 6.4 },
          { id: 'axis', kind: 'shape', shape: 'rect', x: 26, y: 84, w: 34, h: 1.2, color: 'ink', in: 7.4 },
          { id: 'bar1', kind: 'shape', shape: 'rect', x: 34, y: 66, w: 10, h: 34, color: 'grey', in: 8 },
          { id: 'bar2', kind: 'shape', shape: 'rect', x: 18, y: 76, w: 10, h: 14, color: 'green', in: 8.6 },
          { id: 'x1', kind: 'text', text: 'خشن', x: 34, y: 90, size: 3, color: 'ink', in: 8 },
          { id: 'x2', kind: 'text', text: 'ناعم', x: 18, y: 90, size: 3, color: 'ink', in: 8.6 },
          { id: 'yl', kind: 'text', text: '⏱️ زمن الذوبان', x: 26, y: 36, size: 3, box: true, color: 'ink', in: 7.6 },
        ],
      },
      {
        title: 'تذكّري',
        say: 'حجم الحبيبات يؤثر على معدل الذوبان: الحبيبات الصغيرة تذوب أسرع من الحبيبات الكبيرة، والمسحوق الناعم يذوب في زمن أقل.',
        bg: 'sky',
        actors: [
          { id: 'h', kind: 'text', text: 'حجم الحبيبات يؤثر', x: 50, y: 22, size: 4.6, box: true, color: 'accent', in: 0.3 },
          ...grains('s', { n: 10, cx: 84, bottom: 46, size: 1.6, inAt: 1.2, color: 'grey' }),
          { id: 'r1', kind: 'text', text: 'حبيبات صغيرة ← أسرع 🐇', x: 48, y: 44, size: 3.8, box: true, color: 'good', in: 1.4 },
          { id: 'big', kind: 'shape', shape: 'circle', x: 84, y: 62, w: 6, h: 9.6, color: 'grey', in: 3 },
          { id: 'r2', kind: 'text', text: 'حبيبات كبيرة ← أبطأ 🐢', x: 48, y: 62, size: 3.8, box: true, color: 'grey', in: 3.2 },
          { id: 'r3', kind: 'text', text: 'مسحوق ناعم ← زمن أقل ⏱️', x: 48, y: 82, size: 4.2, box: true, color: 'accent', in: 5, anim: [{ at: 5.4, effect: 'glow' }] },
        ],
      },
    ],
  },
];

export default explainers;
