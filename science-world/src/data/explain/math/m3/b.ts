import type { Actor, Anim, Explainer } from '../../../../explain/types';

/*
 * Unit m3 (part b): angles of a triangle, translation, reflection, rotation.
 *
 * Moving shapes are drawn with thin pills (one per side) so they can slide and turn exactly on top
 * of a static `grid` drawing. All geometry is computed in stage pixels for a 700 × 437.5 stage and
 * converted to % (every size scales with the stage width, so the overlay stays aligned).
 * Grid drawings are kept below the 340 px max-height of `.math-art` even on the widest (980 px) stage.
 */

type P = [number, number];
const WS = 700;
const HS = 437.5;
const r2 = (n: number) => Math.round(n * 100) / 100;
const pc = (p: P) => ({ x: r2((p[0] / WS) * 100), y: r2((p[1] / HS) * 100) });

const MINT = '#3fb59a';
const ORANGE = '#ff8a3d';
const BLUE = '#5b8def';
const PINK = '#e8669a';
const GREY = '#8a94a6';
const RED = '#e04848';
const PURPLE = '#7a3fc4';

/* ---------- squared grid drawn with pills (so moving shapes can sit on top of it) ---------- */
interface GSpec {
  cols: number;
  rows: number;
  /** coordinate axes with numbers (then y grows upwards) */
  axes?: boolean;
  /** centre of the squared area on the stage (%) and one square in stage pixels */
  x: number;
  y: number;
  u: number;
}
interface GDraw {
  shapes?: { points: P[]; color: string; label?: string }[];
  lines?: { from: P; to: P; color?: string }[];
  dots?: P[];
}
function grid(g: GSpec) {
  const u = g.u;
  const x0 = (g.x / 100) * WS - (g.cols * u) / 2;
  const yTop = (g.y / 100) * HS - (g.rows * u) / 2;
  const pt = (i: number, j: number): P => [x0 + i * u, g.axes ? yTop + (g.rows - j) * u : yTop + j * u];
  const at = (i: number, j: number, dx = 0, dy = 0) => pc([pt(i, j)[0] + dx, pt(i, j)[1] + dy]);
  const draw = (id: string, d: GDraw = {}, inAt = 0.1): Actor[] => {
    const out: Actor[] = [];
    const L = '#d9e2f2';
    for (let i = 0; i <= g.cols; i++) out.push(seg(`${id}v${i}`, pt(i, 0), pt(i, g.rows), L, inAt, [], 2));
    for (let j = 0; j <= g.rows; j++) out.push(seg(`${id}h${j}`, pt(0, j), pt(g.cols, j), L, inAt, [], 2));
    if (g.axes) {
      out.push(seg(`${id}ax`, pt(0, 0), pt(g.cols, 0), '#1f2a4d', inAt, [], 3));
      out.push(seg(`${id}ay`, pt(0, 0), pt(0, g.rows), '#1f2a4d', inAt, [], 3));
      const AR = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣', '١٤', '١٥'];
      for (let i = 0; i <= g.cols; i++) out.push(tx(`${id}nx${i}`, AR[i], at(i, 0, 0, 13), inAt, { size: 2, color: '#1f2a4d' }));
      for (let j = 1; j <= g.rows; j++) out.push(tx(`${id}ny${j}`, AR[j], at(0, j, -12, 0), inAt, { size: 2, color: '#1f2a4d' }));
    }
    (d.lines ?? []).forEach((l, k) => {
      // dashed mirror line: short pills along the line
      const A = pt(...l.from);
      const B = pt(...l.to);
      const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
      const n = Math.round(len / (u * 0.5));
      for (let m = 0; m < n; m += 1) {
        if (m % 2) continue;
        const a = m / n;
        const b = Math.min(1, (m + 1) / n);
        out.push(seg(`${id}l${k}-${m}`, [A[0] + (B[0] - A[0]) * a, A[1] + (B[1] - A[1]) * a], [A[0] + (B[0] - A[0]) * b, A[1] + (B[1] - A[1]) * b], l.color ?? RED, inAt, [], 4));
      }
    });
    (d.shapes ?? []).forEach((sh, k) => {
      const ps = sh.points.map(([i, j]) => pt(i, j));
      out.push(...poly(`${id}s${k}-`, ps, sh.color, inAt, [], 8));
      if (sh.label) {
        const c: P = [ps.reduce((a, q) => a + q[0], 0) / ps.length, ps.reduce((a, q) => a + q[1], 0) / ps.length];
        out.push(tx(`${id}sl${k}`, sh.label, pc(c), inAt, { size: 3, color: sh.color }));
      }
    });
    (d.dots ?? []).forEach((q, k) => out.push(dot(`${id}d${k}`, pt(...q), '#222', inAt, [], 14)));
    return out;
  };
  return { pt, u, draw, at };
}

/* ---------- rigid motions in stage pixels ---------- */
interface Motion {
  at: number;
  dur: number;
  f: (p: P, s: number) => P;
  steps?: number;
}
const slide = (at: number, dur: number, dx: number, dy: number): Motion => ({ at, dur, f: (p, s) => [p[0] + dx * s, p[1] + dy * s] });
const rot = (p: P, c: P, deg: number): P => {
  const a = (deg * Math.PI) / 180;
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};
/** turn about centre c; positive = clockwise on screen */
const turn = (at: number, dur: number, c: P, deg: number): Motion => ({ at, dur, f: (p, s) => rot(p, c, deg * s), steps: Math.max(2, Math.ceil(Math.abs(deg) / 12)) });
/** move vertex v to o while turning by deg (a torn corner travelling to the line) */
const carry = (at: number, dur: number, v: P, o: P, deg: number): Motion => ({
  at,
  dur,
  f: (p, s) => {
    const q = rot(p, v, deg * s);
    return [q[0] + (o[0] - v[0]) * s, q[1] + (o[1] - v[1]) * s];
  },
  steps: Math.max(4, Math.ceil(Math.abs(deg) / 12)),
});

/** A thick line A–B (a pill) that can appear, slide and turn rigidly. */
function seg(id: string, A: P, B: P, color: string, appear: number, motions: Motion[] = [], th = 7, out?: number): Actor {
  const pose = (a: P, b: P) => ({
    c: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as P,
    rot: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI - 90,
    len: Math.hypot(b[0] - a[0], b[1] - a[1]),
  });
  const p0 = pose(A, B);
  // `in` < 0 lets the first keyframe set the rotation invisibly; the pill then fades in at `appear`.
  const anim: Anim[] = [
    { at: 0, to: { rotate: r2(p0.rot), opacity: 0 }, dur: 0.01 },
    { at: Math.max(0.1, appear), to: { opacity: 1 }, dur: 0.4 },
  ];
  let a = A;
  let b = B;
  let prev = p0.rot;
  for (const m of motions) {
    const n = m.steps ?? 1;
    for (let i = 1; i <= n; i++) {
      const q = pose(m.f(a, i / n), m.f(b, i / n));
      let r = q.rot;
      while (r - prev > 180) r -= 360;
      while (r - prev < -180) r += 360;
      prev = r;
      anim.push({ at: m.at + ((i - 1) * m.dur) / n, to: { ...pc(q.c), rotate: r2(r) }, dur: m.dur / n });
    }
    a = m.f(a, 1);
    b = m.f(b, 1);
  }
  return { id, kind: 'shape', shape: 'pill', ...pc(p0.c), w: r2((th / WS) * 100), h: r2(((p0.len + th) / HS) * 100), color, in: -0.4, anim, out };
}

/** Outline of a polygon (one pill per side) moving as one piece. */
const poly = (id: string, pts: P[], color: string, appear: number, motions: Motion[] = [], th = 7, out?: number): Actor[] =>
  pts.map((p, i) => seg(`${id}${i}`, p, pts[(i + 1) % pts.length], color, appear, motions, th, out));

/** A round marker (vertex / centre) that can follow the same motions. */
function dot(id: string, p: P, color: string, appear: number, motions: Motion[] = [], d = 15, out?: number): Actor {
  const anim: Anim[] = [];
  let q = p;
  for (const m of motions) {
    const n = m.steps ?? 1;
    for (let i = 1; i <= n; i++) anim.push({ at: m.at + ((i - 1) * m.dur) / n, to: pc(m.f(q, i / n)), dur: m.dur / n });
    q = m.f(q, 1);
  }
  return { id, kind: 'shape', shape: 'circle', ...pc(p), w: r2((d / WS) * 100), h: r2((d / HS) * 100), color, in: appear, anim, out };
}

/* ---------- angle "fans": an angle drawn as rays between its two arms ---------- */
const deg = (a: P, b: P) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const wrap = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;
/** interior corner of a triangle at v (start direction and sweep, clockwise on screen) */
function corner(v: P, p: P, q: P) {
  const dp = deg(v, p);
  const d = wrap(deg(v, q) - dp);
  return d > 0 ? { start: dp, sweep: d } : { start: deg(v, q), sweep: -d };
}
function fan(id: string, v: P, start: number, sweep: number, color: string, appear: number, motions: Motion[] = [], L = 52, out?: number): Actor[] {
  const n = Math.max(3, Math.round(sweep / 6));
  return Array.from({ length: n + 1 }, (_, j) => {
    const a = ((start + (sweep * j) / n) * Math.PI) / 180;
    return seg(`${id}${j}`, v, [v[0] + L * Math.cos(a), v[1] + L * Math.sin(a)], color, appear, motions, 5, out);
  });
}
const along = (v: P, a: number, r: number): P => [v[0] + r * Math.cos((a * Math.PI) / 180), v[1] + r * Math.sin((a * Math.PI) / 180)];

/** A triangle whose three corners are torn off and laid side by side on a straight line at o. */
function tearScene(tri: [P, P, P], o: P, colors: [string, string, string], labels: [string, string, string] | null, t0: number, lineAt: number) {
  const actors: Actor[] = [];
  actors.push(...poly('side', tri, '#ffffff', 0.2, [], 6));
  let next = 180;
  tri.forEach((v, i) => {
    const c = corner(v, tri[(i + 1) % 3], tri[(i + 2) % 3]);
    const turnBy = wrap(next - c.start);
    const mv = carry(t0 + i * 1.6, 1.4, v, o, turnBy);
    actors.push(...fan(`f${i}`, v, c.start, c.sweep, colors[i], 0.6 + i * 0.3, [mv], 64));
    if (labels) {
      const from = along(v, c.start + c.sweep / 2, 90);
      const to = along(o, next + c.sweep / 2, 92);
      actors.push({ id: `fl${i}`, kind: 'text', text: labels[i], ...pc(from), size: 3, color: colors[i], ltr: true, in: 1 + i * 0.3, anim: [{ at: t0 + i * 1.6, to: pc(to), dur: 1.4 }] });
    }
    next += c.sweep;
  });
  actors.push(seg('line', [o[0] - 125, o[1]], [o[0] + 125, o[1]], '#ffffff', lineAt, [], 6));
  return actors;
}

/* ---------- small text helpers ---------- */
type TextOpts = Partial<Extract<Actor, { kind: 'text' }>>;
const tx = (id: string, text: string, pos: { x: number; y: number }, inAt: number, o: TextOpts = {}): Actor => ({ id, kind: 'text', text, ...pos, size: 3, color: 'ink', in: inAt, ...o });

/* =================================================================== */
/* m9-1 geometry (board) */
const T1: [P, P, P] = [
  [80, 345],
  [360, 345],
  [150, 120],
];
// right triangle 90° / 40° / 50°: right angle at A
const T2: [P, P, P] = [
  [95, 322],
  [355, 322],
  [95, 104],
];
const LINE_O: P = [525, 330];

/** static fans on a straight line (for «the missing corner») */
function lineFans(o: P, parts: { a: number; color: string; inAt: number; id: string }[]): Actor[] {
  let s = 180;
  return parts.flatMap((p) => {
    const f = fan(p.id, o, s, p.a, p.color, p.inAt, [], 60);
    s += p.a;
    return f;
  });
}

/* =================================================================== */
/* m10-1 */
const G1 = grid({ cols: 15, rows: 7, x: 50, y: 52, u: 36 });
const MTRI: P[] = [
  [0, 0],
  [1, 2],
  [4, 2],
];
const G2 = grid({ cols: 7, rows: 4, x: 50, y: 50, u: 52 });
const G3 = grid({ cols: 10, rows: 4, x: 50, y: 50, u: 42 });
const G4 = grid({ cols: 12, rows: 5, axes: true, x: 50, y: 50, u: 38 });
const QUAD: P[] = [
  [5, 1],
  [7, 1],
  [7, 4],
  [5, 2],
];
const G5 = grid({ cols: 8, rows: 7, axes: true, x: 33, y: 53, u: 32 });
const TA: P[] = [
  [2, 4],
  [4, 4],
  [3, 6],
];
const G6 = grid({ cols: 10, rows: 5, x: 50, y: 45, u: 38 });
const TRAP6: P[] = [
  [1, 4],
  [3, 4],
  [3, 1],
  [1, 3],
];

/* m10-2 */
const R1 = grid({ cols: 8, rows: 6, x: 50, y: 52, u: 38 });
const RT: P[] = [
  [5, 5],
  [7, 5],
  [5, 1],
];
const RT_IMG: P[] = RT.map(([x, y]) => [8 - x, y]);
const R2 = grid({ cols: 8, rows: 4, x: 50, y: 48, u: 50 });
const R5 = grid({ cols: 7, rows: 7, axes: true, x: 32, y: 53, u: 31 });
const RQ: P[] = [
  [4, 4],
  [6, 6],
  [6, 3],
  [4, 3],
];
const RQ_IMG: P[] = [
  [4, 4],
  [6, 6],
  [3, 6],
  [3, 4],
];
const R6 = grid({ cols: 8, rows: 6, x: 31, y: 53, u: 34 });

/* m10-3 */
const D3 = grid({ cols: 6, rows: 6, axes: true, x: 34, y: 53, u: 36 });
const DTRI: P[] = [
  [2, 3],
  [4, 3],
  [3, 6],
];
const D5 = grid({ cols: 10, rows: 10, axes: true, x: 34, y: 53, u: 22 });
const DTRAP: P[] = [
  [2, 9],
  [4, 8],
  [4, 6],
  [2, 6],
];
const D6 = grid({ cols: 6, rows: 6, axes: true, x: 50, y: 49, u: 36 });

const px = (g: ReturnType<typeof grid>, pts: P[]) => pts.map(([i, j]) => g.pt(i, j));
const CLOCK_C: P = [238, 236];
const clockNum = (n: number, r = 82): P => along(CLOCK_C, -90 + 30 * n, r);
const AR = ['١٢', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١'];

const explainers: Explainer[] = [
  /* =================================================================== */
  {
    lesson: 'm9-1',
    title: 'مجموع زوايا المثلث',
    scenes: [
      {
        title: 'قصّت سُميّة الزوايا',
        say: 'رسمت سُميّة مثلثًا، ولوّنت زواياه الثلاث، ثم قصّتها بالمقصّ. ماذا سيحدث لو وضعت الزوايا الثلاث معًا؟',
        duration: 9,
        bg: 'board',
        actors: [
          ...poly('side', T1, '#ffffff', 0.2, [], 6),
          ...fan('a', T1[0], corner(T1[0], T1[1], T1[2]).start, corner(T1[0], T1[1], T1[2]).sweep, '#ffd166', 1),
          ...fan('b', T1[1], corner(T1[1], T1[2], T1[0]).start, corner(T1[1], T1[2], T1[0]).sweep, '#8fd3ff', 1.3),
          ...fan('c', T1[2], corner(T1[2], T1[0], T1[1]).start, corner(T1[2], T1[0], T1[1]).sweep, '#ff9a8a', 1.6),
          {
            id: 'cut',
            kind: 'emoji',
            emoji: '✂️',
            ...pc([60, 290]),
            size: 8,
            in: 2.4,
            anim: [
              { at: 3, to: pc([150, 300]), dur: 0.8 },
              { at: 4, to: pc([335, 290]), dur: 0.9 },
              { at: 5.1, to: pc([200, 150]), dur: 0.9 },
            ],
          },
          { id: 'q', kind: 'text', text: '؟', ...pc([540, 200]), size: 14, color: 'sun', in: 6, anim: [{ at: 6.4, effect: 'pulse' }] },
          tx('ql', 'ماذا تكوّن معًا؟', pc([540, 330]), 6.6, { size: 3.6, box: true, color: 'sun' }),
        ],
      },
      {
        title: 'نضع الزوايا معًا',
        say: 'لاحظي: الزوايا الثلاث تلتقي في نقطة واحدة، وتكوّن معًا خطًا مستقيمًا. والخط المستقيم زاوية قياسها ١٨٠°.',
        duration: 11,
        bg: 'board',
        actors: [
          ...tearScene(T1, LINE_O, ['#ffd166', '#8fd3ff', '#ff9a8a'], null, 1, 6),
          tx('st', 'خط مستقيم', pc([LINE_O[0], 370]), 6.6, { size: 3.6, color: 'white' }),
          tx('deg', '١٨٠°', pc([LINE_O[0], 210]), 7.6, { size: 7, color: 'sun', ltr: true, anim: [{ at: 8, effect: 'glow' }] }),
        ],
      },
      {
        title: 'مع أيّ مثلث',
        say: 'جرّبي مثلثًا آخر زواياه ٩٠° و٤٠° و٥٠°. مرة أخرى تكوّن زواياه خطًا مستقيمًا: مجموعها ١٨٠°.',
        duration: 12,
        bg: 'board',
        actors: [
          ...tearScene(T2, LINE_O, ['#7be3a4', '#8fd3ff', '#ffd166'], ['٩٠°', '٤٠°', '٥٠°'], 1.6, 6.4),
          tx('eq', '٩٠° + ٤٠° + ٥٠° = ١٨٠°', pc([350, 392]), 7.4, { size: 4.2, color: 'white', ltr: true, anim: [{ at: 7.8, effect: 'glow' }] }),
        ],
      },
      {
        title: 'نحسب الزاوية الثالثة',
        say: 'قاس بدر زاويتين في مثلث: ١٠٧° و٣٠°. نجمعهما فيكون ١٣٧°، ثم نطرح من ١٨٠، فتكون الزاوية الثالثة ٤٣°.',
        duration: 13,
        bg: 'board',
        actors: [
          seg('line', [60, 300], [340, 300], '#ffffff', 0.2, [], 6),
          ...lineFans([200, 300], [
            { id: 'a', a: 107, color: '#ffd166', inAt: 0.6 },
            { id: 'b', a: 30, color: '#8fd3ff', inAt: 1.4 },
          ]),
          tx('la', '١٠٧°', pc(along([200, 300], 180 + 53.5, 88)), 0.9, { color: '#ffd166', ltr: true }),
          tx('lb', '٣٠°', pc(along([200, 300], 287 + 15, 92)), 1.7, { color: '#8fd3ff', ltr: true }),
          tx('lq', '؟', pc(along([200, 300], 317 + 21.5, 84)), 2.4, { size: 5, color: 'white', out: 9.6 }),
          ...fan('c', [200, 300], 317, 43, '#7be3a4', 9.8, [], 60),
          tx('lc', '٤٣°', pc(along([200, 300], 317 + 21.5, 92)), 10.1, { color: '#7be3a4', ltr: true, anim: [{ at: 10.4, effect: 'glow' }] }),
          tx('e1', '١٠٧ + ٣٠ = ١٣٧', pc([525, 150]), 4, { size: 4.4, color: 'white', ltr: true }),
          tx('e2', '١٨٠ − ١٣٧ = ٤٣', pc([525, 230]), 6.4, { size: 4.4, color: 'white', ltr: true }),
          tx('e3', 'الزاوية الثالثة ٤٣°', pc([525, 320]), 8.6, { size: 4, box: true, color: 'good', anim: [{ at: 9, effect: 'glow' }] }),
        ],
      },
      {
        title: 'متطابق الأضلاع',
        say: 'في المثلث متطابق الأضلاع الزوايا الثلاث متساوية. نقسم ١٨٠ على ٣، فتكون كل زاوية ٦٠°.',
        duration: 10,
        bg: 'board',
        actors: [
          { id: 't0', kind: 'math', math: { type: 'triangle', angles: ['٦٠°', '؟', '؟'], kind: 'equilateral', color: '#9fc4ff' }, x: 30, y: 55, w: 36, in: 0.3, out: 5.4 },
          { id: 't1', kind: 'math', math: { type: 'triangle', angles: ['٦٠°', '٦٠°', '٦٠°'], kind: 'equilateral', color: '#9fc4ff' }, x: 30, y: 55, w: 36, in: 5.6 },
          tx('eq', '١٨٠ ÷ ٣ = ٦٠', pc([500, 190]), 2.6, { size: 5, color: 'white', ltr: true }),
          tx('r', 'كل زاوية ٦٠°', pc([500, 290]), 6.2, { size: 4.2, box: true, color: 'good', anim: [{ at: 6.6, effect: 'glow' }] }),
        ],
      },
      {
        title: 'متطابق الضلعين',
        say: 'في المثلث متطابق الضلعين زاويتان متساويتان. إذا كانت الزاوية الثالثة ١١٦°: نطرح ١٨٠ − ١١٦ = ٦٤، ثم نقسم ٦٤ ÷ ٢ = ٣٢°.',
        duration: 13,
        bg: 'board',
        actors: [
          { id: 't0', kind: 'math', math: { type: 'triangle', angles: ['؟', '؟', '١١٦°'], kind: 'isosceles' }, x: 28, y: 55, w: 36, in: 0.3, out: 8.8 },
          { id: 't1', kind: 'math', math: { type: 'triangle', angles: ['٣٢°', '٣٢°', '١١٦°'], kind: 'isosceles' }, x: 28, y: 55, w: 36, in: 9 },
          tx('same', 'زاويتان متساويتان', pc([500, 110]), 1.4, { size: 3.6, box: true, color: 'sun' }),
          tx('e1', '١٨٠ − ١١٦ = ٦٤', pc([500, 200]), 4, { size: 4.6, color: 'white', ltr: true }),
          tx('e2', '٦٤ ÷ ٢ = ٣٢', pc([500, 275]), 6.6, { size: 4.6, color: 'white', ltr: true }),
          tx('r', 'كل منهما ٣٢°', pc([500, 355]), 9.4, { size: 4.2, box: true, color: 'good', anim: [{ at: 9.8, effect: 'glow' }] }),
        ],
      },
      {
        title: 'هل تكوّن مثلثًا؟',
        say: 'انتبهي! الزوايا ٩٠° و٦٣° و٣٠° مجموعها ١٨٣°، وليس ١٨٠°، فلا تكوّن مثلثًا. أما ٩٠° و٥٠° و٤٠° فمجموعها ١٨٠°، فهي زوايا مثلث.',
        duration: 13,
        bg: 'board',
        actors: [
          tx('w', '٩٠ + ٦٣ + ٣٠ = ١٨٣', pc([350, 120]), 0.6, { size: 5, color: 'white', ltr: true }),
          tx('wx', 'لا تكوّن مثلثًا ✗', pc([350, 195]), 3, { size: 4, box: true, color: 'bad', anim: [{ at: 3.4, effect: 'shake' }] }),
          tx('g', '٩٠ + ٥٠ + ٤٠ = ١٨٠', pc([350, 280]), 6.4, { size: 5, color: 'white', ltr: true }),
          tx('gx', 'زوايا مثلث ✓', pc([350, 355]), 8.6, { size: 4, box: true, color: 'good', anim: [{ at: 9, effect: 'glow' }] }),
        ],
      },
      {
        title: 'الخلاصة',
        say: 'مجموع قياسات الزوايا الداخلية لأي مثلث يساوي ١٨٠°. ولإيجاد الزاوية الثالثة نطرح مجموع الزاويتين المعلومتين من ١٨٠.',
        duration: 11,
        bg: 'board',
        actors: [
          seg('line', [80, 300], [330, 300], '#ffffff', 0.2, [], 6),
          ...lineFans([205, 300], [
            { id: 'a', a: 50, color: '#ffd166', inAt: 0.5 },
            { id: 'b', a: 60, color: '#8fd3ff', inAt: 0.9 },
            { id: 'c', a: 70, color: '#ff9a8a', inAt: 1.3 },
          ]),
          tx('d', '١٨٠°', pc([205, 340]), 2, { size: 5, color: 'sun', ltr: true }),
          tx('r1', 'مجموع زوايا المثلث = ١٨٠°', pc([520, 170]), 2.6, { size: 3, box: true, color: 'accent', anim: [{ at: 3, effect: 'glow' }] }),
          tx('r2', 'الثالثة = ١٨٠ − الزاويتين', pc([520, 270]), 6, { size: 3.2, color: 'white' }),
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm10-1',
    title: 'الانسحاب على الشبكة',
    scenes: [
      {
        title: 'نمط محمود',
        say: 'كوّن محمود هذا النمط بتحريك مثلث واحد مرة بعد مرة. لاحظي: المثلث لا يدور أبدًا، بل ينزلق فقط.',
        duration: 11,
        bg: 'paper',
        actors: [
          ...G1.draw('g', { shapes: [{ points: MTRI, color: '#8fd3ff' }] }),
          ...[1, 2, 3, 4, 5].flatMap((k) => poly(`s${k}-`, px(G1, MTRI.map(([x, y]) => [x + 2 * k, y + k])), BLUE, 1.2 + k * 1.3 - 0.35, [], 5)),
          ...poly(
            'm',
            px(G1, MTRI),
            ORANGE,
            0.6,
            [1, 2, 3, 4, 5].map((k) => slide(0.4 + k * 1.3, 0.9, 2 * G1.u, G1.u)),
          ),
          tx('l', 'ينزلق ولا يدور', pc([350, 400]), 8, { size: 3.6, box: true, color: 'accent', anim: [{ at: 8.4, effect: 'pulse' }] }),
        ],
      },
      {
        title: 'نتابع رأسًا واحدًا',
        say: 'لنعدّ المربعات: نختار رأسًا واحدًا ونتابعه. انتقل مربعين إلى اليمين، ثم مربعًا واحدًا إلى الأسفل. والمثلث كله تحرّك بالمقدار نفسه.',
        duration: 12,
        bg: 'paper',
        actors: [
          ...G2.draw('g', { shapes: [{ points: MTRI, color: '#8fd3ff' }] }),
          ...poly('m', px(G2, MTRI), ORANGE, 0.5, [slide(1.6, 0.8, G2.u, 0), slide(2.8, 0.8, G2.u, 0), slide(4.4, 0.8, 0, G2.u)]),
          dot('v', G2.pt(0, 0), RED, 0.9, [slide(1.6, 0.8, G2.u, 0), slide(2.8, 0.8, G2.u, 0), slide(4.4, 0.8, 0, G2.u)], 17),
          tx('c1', '١', G2.at(0.5, 0, 0, -16), 2.4, { color: RED, size: 3.4 }),
          tx('c2', '٢', G2.at(1.5, 0, 0, -16), 3.6, { color: RED, size: 3.4 }),
          tx('c3', '١', G2.at(2, 0.5, -14, 0), 5.2, { color: BLUE, size: 3.4 }),
          tx('r', '٢ إلى اليمين', pc([462, 395]), 6, { size: 3.4, box: true, color: RED }),
          tx('d', '١ إلى الأسفل', pc([238, 395]), 7, { size: 3.4, box: true, color: 'blue' }),
        ],
      },
      {
        title: 'دون استدارة',
        say: 'الانسحاب تحريك الشكل بمقدار معيّن واتجاه معيّن دون استدارة. إذا دار الشكل فهذا ليس انسحابًا. في الانسحاب يبقى الشكل كما هو.',
        duration: 12,
        bg: 'paper',
        actors: [
          ...G3.draw('g', { shapes: [{ points: MTRI.map(([x, y]) => [x, y + 1]), color: '#8fd3ff' }] }),
          ...(() => {
            const pts = px(G3, MTRI.map(([x, y]) => [x, y + 1]));
            const c: P = [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];
            const bad: Motion = { at: 1.2, dur: 2, f: (p, s) => { const q = rot(p, c, 90 * s); return [q[0] + 5 * G3.u * s, q[1]]; }, steps: 8 };
            return [
              ...poly('bad', pts, RED, 0.6, [bad], 7, 5.6),
              tx('bx', 'دار! ليس انسحابًا ✗', pc([350, 98]), 3.4, { size: 3.4, box: true, color: 'bad', out: 5.6, anim: [{ at: 3.8, effect: 'shake' }] }),
              ...poly('ok', pts, MINT, 6, [slide(6.6, 1.6, 5 * G3.u, 0)]),
              tx('ok', 'انسحاب ✓', pc([350, 98]), 8.4, { size: 3.6, box: true, color: 'good', anim: [{ at: 8.8, effect: 'glow' }] }),
              tx('k', 'الحجم نفسه، الاتجاه نفسه', pc([350, 375]), 9.4, { size: 3.2, color: 'ink' }),
            ];
          })(),
        ],
      },
      {
        title: '٤ مربعات إلى اليمين',
        say: 'لنسحب الشكل الرباعي ٤ مربعات إلى اليمين: ننقله مربعًا بعد مربع. الرأس (٥، ١) صار (٩، ١). تغيّر العدد الأول (س) فقط.',
        duration: 13,
        bg: 'paper',
        actors: [
          ...G4.draw('g', { shapes: [{ points: QUAD, color: MINT }] }),
          ...poly('m', px(G4, QUAD), ORANGE, 0.6, [0, 1, 2, 3].map((k) => slide(1.4 + k * 1, 0.7, G4.u, 0))),
          dot('v', G4.pt(5, 1), RED, 1, [0, 1, 2, 3].map((k) => slide(1.4 + k * 1, 0.7, G4.u, 0)), 15),
          ...[0, 1, 2, 3].map((k) => tx(`c${k}`, ['١', '٢', '٣', '٤'][k], G4.at(7.5 + k, 4, 0, -16), 2.1 + k, { color: RED, size: 3.2 })),
          tx('from', 'من (٥، ١)', pc([480, 400]), 6.2, { size: 3.4, box: true, color: MINT }),
          { id: 'ar', kind: 'arrow', from: [59, 91.4], to: [44, 91.4], color: 'ink', in: 6.8 },
          tx('to', 'إلى (٩، ١)', pc([220, 400]), 7.4, { size: 3.4, box: true, color: ORANGE }),
          tx('x', 'يتغيّر العدد الأول (س)', pc([350, 92]), 9, { size: 3, box: true, color: 'accent', anim: [{ at: 9.4, effect: 'pulse' }] }),
        ],
      },
      {
        title: 'نصف الانسحاب بالأعداد',
        say: 'انسحب المثلث (أ) إلى (ب): الرأس (٢، ٤) صار (٥، ٤). و٥ − ٢ = ٣، إذن +٣ في اتجاه (س)، و٠ في اتجاه (ص) لأنه لم يصعد ولم ينزل.',
        duration: 14,
        bg: 'paper',
        actors: [
          ...G5.draw('g', { shapes: [{ points: TA, color: MINT, label: 'أ' }] }),
          ...poly('m', px(G5, TA), ORANGE, 0.6, [slide(1.6, 1.6, 3 * G5.u, 0)]),
          dot('v', G5.pt(2, 4), RED, 1, [slide(1.6, 1.6, 3 * G5.u, 0)], 13),
          tx('b', 'ب', G5.at(6, 4.7), 3.4, { size: 3.4, color: ORANGE }),
          tx('c', 'من (٢، ٤) إلى (٥، ٤)', pc([505, 100]), 3.8, { size: 3.2, color: 'ink' }),
          tx('e', '٥ − ٢ = ٣', pc([505, 175]), 6, { size: 5, color: 'blue', ltr: true }),
          tx('sx', '+٣ في اتجاه (س)', pc([505, 255]), 8.2, { size: 3.6, box: true, color: 'good' }),
          tx('sy', '٠ في اتجاه (ص)', pc([505, 330]), 10.2, { size: 3.6, box: true, color: 'blue' }),
        ],
      },
      {
        title: 'الخلاصة',
        say: 'الانسحاب تحريك الشكل بمقدار معيّن واتجاه معيّن دون استدارة. نعدّ المربعات إلى اليمين أو اليسار، وإلى الأعلى أو الأسفل.',
        duration: 11,
        bg: 'paper',
        actors: [
          ...G6.draw('g', { shapes: [{ points: TRAP6, color: MINT }] }),
          ...poly('m', px(G6, TRAP6), ORANGE, 0.5, [slide(1.4, 1.8, 4 * G6.u, 0), slide(3.8, 0.8, 0, -G6.u)]),
          tx('a', 'بمقدار معيّن', pc([560, 370]), 5, { size: 3.2, box: true, color: 'accent' }),
          tx('b', 'باتجاه معيّن', pc([350, 370]), 5.8, { size: 3.2, box: true, color: 'accent' }),
          tx('c', 'دون استدارة', pc([140, 370]), 6.6, { size: 3.2, box: true, color: 'accent', anim: [{ at: 7, effect: 'glow' }] }),
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm10-2',
    title: 'انعكاس الأشكال',
    scenes: [
      {
        title: 'قاعة المرايا',
        say: 'في قاعة المرايا يظهر لكل شكل صورة على الجهة الأخرى من خط المرآة. الانعكاس هو ما تُظهره المرآة، والصورة هي الشكل الناتج بعد الانعكاس.',
        duration: 12,
        bg: 'paper',
        actors: [
          ...R1.draw('g', { lines: [{ from: [4, 0], to: [4, 6] }], shapes: [{ points: RT, color: MINT }] }),
          { id: 'mir', kind: 'emoji', emoji: '🪞', ...R1.at(4, 0, 0, -22), size: 6, in: 0.6 },
          ...RT.map((p, i) => dot(`d${i}`, R1.pt(p[0], p[1]), ORANGE, 1.4 + i * 0.3, [slide(2.4 + i * 0.6, 1.2, (RT_IMG[i][0] - p[0]) * R1.u, 0)], 14)),
          ...poly('img', px(R1, RT_IMG), ORANGE, 5.2),
          tx('ls', 'الشكل', pc([590, 230]), 0.8, { size: 3.6, box: true, color: MINT }),
          tx('li', 'الصورة', pc([110, 230]), 5.8, { size: 3.6, box: true, color: ORANGE, anim: [{ at: 6.2, effect: 'pulse' }] }),
          tx('lm', 'خط المرآة', pc([350, 410]), 1, { size: 3.2, color: 'red' }),
        ],
      },
      {
        title: 'المسافة نفسها',
        say: 'النقطة تبعد مربعين عن خط المرآة، فصورتها تبعد مربعين أيضًا من الجهة الأخرى. كل نقطة وصورتها على بُعدين متساويين من خط المرآة.',
        duration: 12,
        bg: 'paper',
        actors: [
          ...R2.draw('g', { lines: [{ from: [4, 0], to: [4, 4] }] }),
          dot('o', R2.pt(6, 2), MINT, 0.4, [], 18),
          tx('lo', 'الأصل', R2.at(6, 2, 0, -30), 0.8, { size: 3.2, color: MINT }),
          tx('a1', '١', R2.at(5.5, 2, 0, 22), 1.6, { color: MINT, size: 3.6 }),
          tx('a2', '٢', R2.at(4.5, 2, 0, 22), 2.4, { color: MINT, size: 3.6 }),
          dot('m', R2.pt(6, 2), ORANGE, 3, [slide(3.6, 0.8, -R2.u, 0), slide(4.6, 0.8, -R2.u, 0), slide(5.6, 0.8, -R2.u, 0), slide(6.6, 0.8, -R2.u, 0)], 18),
          tx('b1', '١', R2.at(3.5, 2, 0, 22), 6.4, { color: ORANGE, size: 3.6 }),
          tx('b2', '٢', R2.at(2.5, 2, 0, 22), 7.4, { color: ORANGE, size: 3.6 }),
          tx('lb', 'الصورة', R2.at(2, 2, 0, -30), 7.6, { size: 3.2, color: ORANGE }),
          tx('r', 'المسافة نفسها ✓', pc([350, 392]), 8.6, { size: 3.8, box: true, color: 'good', anim: [{ at: 9, effect: 'glow' }] }),
        ],
      },
      {
        title: 'نعكس رأسًا رأسًا',
        say: 'نعكس كل رأس وحده: نعدّ مربعاته إلى خط المرآة، ثم نعدّ مثلها في الجهة الأخرى. ثم نصل الرؤوس الجديدة، فتظهر الصورة مقلوبة.',
        duration: 13,
        bg: 'paper',
        actors: [
          ...R1.draw('g', { lines: [{ from: [4, 0], to: [4, 6] }], shapes: [{ points: RT, color: MINT }] }),
          ...(() => {
            const out: Actor[] = [];
            const order = [2, 0, 1];
            order.forEach((vi, k) => {
              const [x, y] = RT[vi];
              const d = x - 4;
              const t = 0.8 + k * 2.6;
              const dy = y === 1 ? -18 : 18;
              out.push(dot(`d${vi}`, R1.pt(x, y), ORANGE, t, [slide(t + 1, 1.2, -2 * d * R1.u, 0)], 14));
              const n = ['١', '٢', '٣'][d - 1];
              out.push(tx(`n${vi}a`, n, R1.at(4 + d / 2, y, 0, dy), t + 0.4, { color: MINT, size: 3.2 }));
              out.push(tx(`n${vi}b`, n, R1.at(4 - d / 2, y, 0, dy), t + 2, { color: ORANGE, size: 3.2 }));
            });
            return out;
          })(),
          ...poly('img', px(R1, RT_IMG), ORANGE, 9),
          tx('li', 'الصورة', pc([110, 230]), 9.6, { size: 3.6, box: true, color: ORANGE, anim: [{ at: 10, effect: 'pulse' }] }),
        ],
      },
      {
        title: 'انتبهي!',
        say: 'انتبهي! إذا سحبنا الشكل إلى الجهة الأخرى فقط فلن يكون صورة: ضلعه القائم صار بعيدًا عن المرآة. في الانعكاس ينقلب الشكل، ويبقى كل رأس على البُعد نفسه.',
        duration: 13,
        bg: 'paper',
        actors: [
          ...R1.draw('g', { lines: [{ from: [4, 0], to: [4, 6] }], shapes: [{ points: RT, color: MINT }] }),
          ...poly('bad', px(R1, RT), RED, 0.6, [slide(1.2, 1.6, -4 * R1.u, 0)], 7, 6),
          tx('bx', 'ليست صورة ✗', pc([110, 230]), 3.2, { size: 3.4, box: true, color: 'bad', out: 6, anim: [{ at: 3.6, effect: 'shake' }] }),
          tx('far', '٣', R1.at(2.5, 3), 4, { size: 4, color: RED, out: 6 }),
          tx('near', '١', R1.at(4.5, 3), 4.4, { size: 4, color: MINT }),
          ...poly('ok', px(R1, RT_IMG), MINT, 7),
          tx('near2', '١', R1.at(3.5, 3), 7.6, { size: 4, color: MINT }),
          tx('ok', 'الصورة ✓', pc([110, 230]), 8.2, { size: 3.6, box: true, color: 'good', anim: [{ at: 8.6, effect: 'glow' }] }),
        ],
      },
      {
        title: 'خط مرآة مائل',
        say: 'قد يكون خط المرآة مائلًا، مثل الخط ص = س. عند الانعكاس فيه يتبادل العددان: الرأس (٦، ٣) صورته (٣، ٦). والرأسان اللذان على الخط لا يتحرّكان.',
        duration: 14,
        bg: 'paper',
        actors: [
          ...R5.draw('g', { lines: [{ from: [0, 0], to: [7, 7] }], shapes: [{ points: RQ, color: PINK }] }),
          dot('a', R5.pt(6, 3), ORANGE, 1, [slide(2, 1.4, R5.pt(3, 6)[0] - R5.pt(6, 3)[0], R5.pt(3, 6)[1] - R5.pt(6, 3)[1])], 13),
          dot('b', R5.pt(4, 3), ORANGE, 3.6, [slide(4.4, 1, R5.pt(3, 4)[0] - R5.pt(4, 3)[0], R5.pt(3, 4)[1] - R5.pt(4, 3)[1])], 13),
          ...poly('img', px(R5, RQ_IMG), ORANGE, 6),
          dot('s1', R5.pt(4, 4), MINT, 9.4, [], 15),
          dot('s2', R5.pt(6, 6), MINT, 9.6, [], 15),
          tx('l', 'ص = س', R5.at(6, 1.3), 0.6, { size: 3, color: 'red' }),
          tx('c', 'الرأس (٦، ٣) ← (٣، ٦)', pc([500, 120]), 3.6, { size: 3.4, color: 'ink' }),
          tx('sw', 'يتبادل العددان', pc([500, 200]), 6.6, { size: 3.8, box: true, color: 'accent', anim: [{ at: 7, effect: 'pulse' }] }),
          tx('st', 'على الخط: لا يتحرّك', pc([500, 300]), 9.8, { size: 3.4, box: true, color: 'good' }),
        ],
      },
      {
        title: 'الخلاصة',
        say: 'الانعكاس هو ما تُظهره المرآة، والصورة هي الشكل الناتج. كل نقطة وصورتها على بُعدين متساويين من خط المرآة.',
        duration: 10,
        bg: 'paper',
        actors: [
          ...R6.draw('g', { lines: [{ from: [4, 0], to: [4, 6] }], shapes: [{ points: RT, color: MINT }] }),
          ...poly('img', px(R6, RT_IMG), ORANGE, 1),
          tx('a', '🪞 الانعكاس: ما تُظهره المرآة', pc([515, 120]), 2, { size: 3, box: true, color: 'accent' }),
          tx('b', 'الصورة: الشكل الناتج', pc([515, 210]), 4, { size: 3, box: true, color: ORANGE }),
          tx('c', 'المسافة نفسها من الخط', pc([515, 300]), 6, { size: 3, box: true, color: 'good', anim: [{ at: 6.4, effect: 'glow' }] }),
        ],
      },
    ],
  },

  /* =================================================================== */
  {
    lesson: 'm10-3',
    title: 'الدوران على الشبكة',
    scenes: [
      {
        title: 'ما الدوران؟',
        say: 'الدولاب يدور حول نقطة في وسطه. الدوران هو تدوير شكل بأكمله حول نقطة تُسمّى مركز الدوران، ومركز الدوران لا يتحرّك.',
        duration: 11,
        bg: 'paper',
        actors: [
          { id: 'wheel', kind: 'emoji', emoji: '🎡', x: 78, y: 50, size: 22, in: 0.3, anim: [{ at: 0.8, effect: 'spin' }] },
          ...(() => {
            const C: P = [210, 290];
            const tri: P[] = [C, [210, 130], [300, 260]];
            return [
              ...poly('o', tri, GREY, 1.2, [], 5),
              ...poly('m', tri, PURPLE, 1.6, [turn(3, 2.4, C, 90)]),
              dot('c', C, '#222', 1.4, [], 18),
              { id: 'ca', kind: 'arrow', from: [21, 83], to: [28.5, 70.5], color: 'ink', in: 6 } as Actor,
              tx('cl', 'مركز الدوران', pc([140, 395]), 6.4, { size: 3.4, box: true, color: 'ink' }),
            ];
          })(),
        ],
      },
      {
        title: 'اتجاه عقارب الساعة',
        say: 'يشير العقرب إلى ١٠. ندوّره ٩٠°، أي ربع دورة، في اتجاه عقارب الساعة: ١١ ثم ١٢ ثم ١. والاتجاه المعاكس هو عكس اتجاه عقارب الساعة.',
        duration: 13,
        bg: 'paper',
        actors: [
          { id: 'face', kind: 'shape', shape: 'circle', ...pc(CLOCK_C), w: 30, h: 48, color: '#ffffff' },
          ...AR.map((n, i): Actor => {
            const hl = i === 11 ? 2.9 : i === 0 ? 3.6 : i === 1 ? 4.3 : null;
            return tx(`n${i}`, n, pc(clockNum(i)), 0.2, { size: 3, color: hl ? RED : 'ink', anim: hl ? [{ at: hl, effect: 'pulse' }] : undefined });
          }),
          seg('hand', CLOCK_C, along(CLOCK_C, -90 + 300, 58), 'ink', 0.6, [turn(2.4, 2.4, CLOCK_C, 90)], 8),
          dot('hub', CLOCK_C, '#222', 0.6, [], 14),
          tx('cw', '🔃 اتجاه عقارب الساعة', pc([510, 110]), 1.4, { size: 3, box: true, color: 'good' }),
          tx('q', '٩٠° = ربع دورة', pc([520, 200]), 5.4, { size: 3.6, color: 'ink' }),
          tx('acw', '🔄 عكس اتجاه عقارب الساعة', pc([510, 300]), 8, { size: 2.8, box: true, color: 'orange' }),
        ],
      },
      {
        title: 'ندوّر المثلث ٩٠°',
        say: 'نثبّت النقطة السوداء، وهي مركز الدوران، وندوّر المثلث كله ٩٠° في اتجاه عقارب الساعة. صار رأسه يشير إلى اليمين. ورقة الشفّ تساعدك على ذلك.',
        duration: 13,
        bg: 'paper',
        actors: [
          ...D3.draw('g', { shapes: [{ points: DTRI, color: MINT }], dots: [[3, 3]] }),
          ...poly('m', px(D3, DTRI), ORANGE, 0.8, [turn(2.4, 2.8, D3.pt(3, 3), 90)]),
          dot('c', D3.pt(3, 3), '#222', 0.4, [], 14),
          tx('a', '٩٠° مع عقارب الساعة', pc([515, 110]), 5.6, { size: 3.4, box: true, color: ORANGE }),
          tx('b', '● لا يتحرّك', pc([515, 200]), 7, { size: 3.4, color: 'ink' }),
          tx('t', '📄 ورقة الشفّ تساعدك', pc([515, 290]), 9, { size: 3.2, box: true, color: 'accent' }),
        ],
      },
      {
        title: 'مرة بعد مرة',
        say: 'ندوّره ٩٠° مرة ثانية فيشير إلى الأسفل، أي دار ١٨٠°. ثم مرة ثالثة فيشير إلى اليسار. تكوّن شكل يشبه نجمة رباعية الرؤوس.',
        duration: 13,
        bg: 'paper',
        actors: [
          ...D3.draw('g', { shapes: [{ points: DTRI, color: MINT }], dots: [[3, 3]] }),
          ...poly('s1', px(D3, DTRI).map((p) => rot(p, D3.pt(3, 3), 90)), ORANGE, 0.3, [], 6),
          ...poly('s2', px(D3, DTRI).map((p) => rot(p, D3.pt(3, 3), 180)), BLUE, 4.4, [], 6),
          ...poly('s3', px(D3, DTRI).map((p) => rot(p, D3.pt(3, 3), 270)), PINK, 7.6, [], 6),
          ...poly('m', px(D3, DTRI).map((p) => rot(p, D3.pt(3, 3), 90)), PURPLE, 0.8, [turn(1.6, 2.6, D3.pt(3, 3), 90), turn(4.8, 2.6, D3.pt(3, 3), 90)], 7, 7.6),
          dot('c', D3.pt(3, 3), '#222', 0.4, [], 14),
          tx('e', '٩٠° + ٩٠° = ١٨٠°', pc([545, 120]), 4.6, { size: 4.2, color: 'blue', ltr: true }),
          tx('star', 'نجمة رباعية الرؤوس ⭐', pc([545, 240]), 8.4, { size: 3.2, box: true, color: 'accent', anim: [{ at: 8.8, effect: 'glow' }] }),
        ],
      },
      {
        title: 'حول النقطة (أ)',
        say: 'ندوّر شبه المنحرف ٩٠° في اتجاه عقارب الساعة حول النقطة (أ). النقطة (أ) تبقى مكانها، والرأس (٢، ٩) ينتقل إلى (٧، ٨).',
        duration: 13,
        bg: 'paper',
        actors: [
          ...D5.draw('g', { shapes: [{ points: DTRAP, color: MINT }] }),
          ...poly('m', px(D5, DTRAP), ORANGE, 0.8, [turn(2.4, 3, D5.pt(4, 6), 90)], 6),
          dot('v', D5.pt(2, 9), RED, 1.2, [turn(2.4, 3, D5.pt(4, 6), 90)], 13),
          dot('a', D5.pt(4, 6), '#222', 0.4, [], 14),
          tx('al', 'أ', D5.at(4, 6, 10, 14), 0.6, { size: 3.4, color: 'ink' }),
          tx('s', '(أ) تبقى مكانها', pc([515, 120]), 6, { size: 3.4, box: true, color: 'good' }),
          tx('c', 'الرأس (٢، ٩) ← (٧، ٨)', pc([515, 215]), 8, { size: 3.4, color: RED }),
        ],
      },
      {
        title: 'في الاتجاهين',
        say: 'يمكن أن ندوّر في اتجاهين: ٩٠° في اتجاه عقارب الساعة يجعل رأس المثلث يشير إلى اليمين، و٩٠° عكس اتجاه عقارب الساعة يجعله يشير إلى اليسار.',
        duration: 13,
        bg: 'paper',
        actors: [
          ...D6.draw('g', { shapes: [{ points: DTRI, color: MINT }], dots: [[3, 3]] }),
          ...poly('cw', px(D6, DTRI), ORANGE, 0.8, [turn(1.6, 2.4, D6.pt(3, 3), 90)]),
          ...poly('acw', px(D6, DTRI), BLUE, 5.4, [turn(6, 2.4, D6.pt(3, 3), -90)]),
          dot('c', D6.pt(3, 3), '#222', 0.4, [], 14),
          tx('lc', '↻ مع عقارب الساعة', pc([505, 402]), 4.2, { size: 2.8, box: true, color: ORANGE }),
          tx('la', '↺ عكس عقارب الساعة', pc([195, 402]), 8.6, { size: 2.8, box: true, color: BLUE }),
        ],
      },
      {
        title: 'الخلاصة',
        say: 'نصف الدوران بثلاثة أشياء: مركز الدوران، والزاوية مثل ٩٠° أو ١٨٠°، والاتجاه: مع عقارب الساعة أو عكسها. وأربعة دورانات ٩٠° تعيد الشكل إلى مكانه.',
        duration: 13,
        bg: 'paper',
        actors: [
          ...(() => {
            const C: P = [175, 230];
            const tri: P[] = [
              [145, 230],
              [205, 230],
              [175, 140],
            ];
            return [...poly('m', tri, PURPLE, 0.4, [turn(1, 6, C, 360)]), dot('ctr', C, '#222', 0.3, [], 14)];
          })(),
          tx('n4', '٤ × ٩٠° = ٣٦٠°', pc([175, 340]), 7.4, { size: 3.8, color: PURPLE, ltr: true }),
          tx('a', '● مركز الدوران', pc([510, 110]), 2, { size: 3.4, box: true, color: 'ink' }),
          tx('b', 'الزاوية: ٩٠° أو ١٨٠°', pc([510, 200]), 4, { size: 3.4, box: true, color: 'accent' }),
          tx('c', 'الاتجاه: ↻ أو ↺', pc([510, 290]), 6, { size: 3.4, box: true, color: 'orange' }),
        ],
      },
    ],
  },
];

export default explainers;
