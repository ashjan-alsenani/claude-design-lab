/**
 * Parametric math drawings. Lesson data describes WHAT to draw
 * (e.g. a number line from 0 to 10); these components draw it in the house style.
 * All numbers are shown with Arabic-Indic digits, like the book.
 */
import type { MathVisual, Point } from '../data/types';
import { toArabicDigits as ar } from '../lib/digits';

const INK = '#1f2a4d';
const ACCENT = '#2f7ff0';
const SUN = '#ffc83d';
const palette = ['#2f7ff0', '#ff6b6b', '#2fbf71', '#9b5de5', '#f0a500', '#19c3d6'];

function fmt(n: number) {
  return ar(Number.isInteger(n) ? n : Math.round(n * 1000) / 1000);
}

/* ---------------- Number line ---------------- */
function NumberLine({ v }: { v: Extract<MathVisual, { type: 'numberLine' }> }) {
  const W = 520;
  const pad = 30;
  const count = Math.round((v.max - v.min) / v.step);
  const x = (n: number) => pad + ((n - v.min) / (v.max - v.min)) * (W - pad * 2);
  const labelEvery = v.labelEvery ?? (count > 20 ? Math.ceil(count / 10) : 1);
  return (
    <svg viewBox={`0 0 ${W} 130`} className="art math-art" role="img" aria-label="خط الأعداد">
      <line x1={pad - 14} x2={W - pad + 14} y1={80} y2={80} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d={`M${W - pad + 18} 80 l-10 -6 v12z M${pad - 18} 80 l10 -6 v12z`} fill={INK} />
      {Array.from({ length: count + 1 }, (_, i) => {
        const n = v.min + i * v.step;
        const major = i % labelEvery === 0;
        return (
          <g key={i}>
            <line x1={x(n)} x2={x(n)} y1={major ? 70 : 74} y2={major ? 90 : 86} stroke={INK} strokeWidth={major ? 2.5 : 1.5} />
            {major && (
              <text x={x(n)} y={110} textAnchor="middle" className="math-num">
                {fmt(n)}
              </text>
            )}
          </g>
        );
      })}
      {v.jumps?.map((j, i) => {
        const x1 = x(j.from);
        const x2 = x(j.to);
        const h = Math.min(50, Math.abs(x2 - x1) / 2 + 12);
        return (
          <g key={`j${i}`}>
            <path d={`M${x1} 70 Q${(x1 + x2) / 2} ${70 - h} ${x2} 70`} fill="none" stroke={palette[i % palette.length]} strokeWidth="3" markerEnd="url(#nl-arrow)" />
            {j.label && (
              <text x={(x1 + x2) / 2} y={70 - h / 2 - 6} textAnchor="middle" className="math-label" fill={palette[i % palette.length]}>
                {j.label}
              </text>
            )}
          </g>
        );
      })}
      {v.points?.map((p, i) => (
        <g key={`p${i}`}>
          <circle cx={x(p.value)} cy={80} r="9" fill={p.color ?? SUN} stroke={INK} strokeWidth="2.5" />
          {p.label && (
            <text x={x(p.value)} y={52} textAnchor="middle" className="math-label">
              {p.label}
            </text>
          )}
        </g>
      ))}
      <defs>
        <marker id="nl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill={INK} />
        </marker>
      </defs>
    </svg>
  );
}

/* ---------------- Place value table ---------------- */
const placeNames = ['الآحاد', 'العشرات', 'المئات', 'آحاد الألوف', 'عشرات الألوف', 'مئات الألوف', 'الملايين'];
const decimalNames = ['أجزاء من عشرة', 'أجزاء من مئة', 'أجزاء من ألف'];
function PlaceValue({ v }: { v: Extract<MathVisual, { type: 'placeValue' }> }) {
  const raw = v.number.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[,٫]/g, '.').replace(/\s/g, '');
  const [int, dec = ''] = raw.split('.');
  const intDigits = int.split('');
  const cols = [
    ...intDigits.map((d, i) => ({ d, name: placeNames[intDigits.length - 1 - i] ?? '' })),
    ...dec.split('').filter(Boolean).map((d, i) => ({ d, name: decimalNames[i] ?? '' })),
  ];
  return (
    <div className="pv" dir="ltr" role="table" aria-label="جدول القيمة المكانية">
      {cols.map((c, i) => (
        <div key={i} className={`pv__col ${v.highlight?.includes(i) ? 'pv__col--hl' : ''} ${i === intDigits.length - 1 && dec ? 'pv__col--point' : ''}`} role="cell">
          <div className="pv__name" dir="rtl">
            {c.name}
          </div>
          <div className="pv__digit">{ar(c.d)}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Grid (area, perimeter, coordinates, transformations) ---------------- */
function Grid({ v }: { v: Extract<MathVisual, { type: 'grid' }> }) {
  const S = 34;
  const off = v.axes ? 28 : 6;
  const W = v.cols * S + off + 10;
  const H = v.rows * S + off + 10;
  // y grows upwards when axes are shown (coordinates), downwards otherwise
  const px = (x: number) => off + x * S;
  const py = (y: number) => (v.axes ? 6 + (v.rows - y) * S : 6 + y * S);
  const pts = (p: Point[]) => p.map(([x, y]) => `${px(x)},${py(y)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="art math-art" role="img" aria-label="شبكة مربعات">
      {Array.from({ length: v.cols + 1 }, (_, i) => (
        <line key={`c${i}`} x1={px(i)} x2={px(i)} y1={py(0)} y2={py(v.rows)} stroke="#c9d6ee" strokeWidth="1.5" />
      ))}
      {Array.from({ length: v.rows + 1 }, (_, i) => (
        <line key={`r${i}`} x1={px(0)} x2={px(v.cols)} y1={py(i)} y2={py(i)} stroke="#c9d6ee" strokeWidth="1.5" />
      ))}
      {v.cells?.map((c, i) => (
        <rect key={`cell${i}`} x={px(c.x)} y={v.axes ? py(c.y + 1) : py(c.y)} width={S} height={S} fill={c.color ?? '#9fc4ff'} opacity="0.85" />
      ))}
      {v.axes && (
        <g>
          <line x1={px(0)} x2={px(v.cols) + 6} y1={py(0)} y2={py(0)} stroke={INK} strokeWidth="2.5" />
          <line x1={px(0)} x2={px(0)} y1={py(0)} y2={py(v.rows) - 6} stroke={INK} strokeWidth="2.5" />
          {Array.from({ length: v.cols + 1 }, (_, i) => (
            <text key={`ax${i}`} x={px(i)} y={py(0) + 20} textAnchor="middle" className="math-num math-num--sm">
              {ar(i)}
            </text>
          ))}
          {Array.from({ length: v.rows + 1 }, (_, i) =>
            i === 0 ? null : (
              <text key={`ay${i}`} x={px(0) - 12} y={py(i) + 5} textAnchor="middle" className="math-num math-num--sm">
                {ar(i)}
              </text>
            ),
          )}
        </g>
      )}
      {v.shapes?.map((s, i) => (
        <g key={`s${i}`}>
          <polygon points={pts(s.points)} fill={s.color ?? palette[i % palette.length]} fillOpacity={s.dashed ? 0.12 : 0.55} stroke={s.color ?? palette[i % palette.length]} strokeWidth="3" strokeDasharray={s.dashed ? '7 5' : undefined} strokeLinejoin="round" />
          {s.label && (
            <text x={s.points.reduce((a, p) => a + px(p[0]), 0) / s.points.length} y={s.points.reduce((a, p) => a + py(p[1]), 0) / s.points.length + 6} textAnchor="middle" className="math-label">
              {s.label}
            </text>
          )}
        </g>
      ))}
      {v.lines?.map((l, i) => (
        <g key={`l${i}`}>
          <line x1={px(l.from[0])} y1={py(l.from[1])} x2={px(l.to[0])} y2={py(l.to[1])} stroke={l.color ?? '#e04848'} strokeWidth="3.5" strokeDasharray={l.dashed ? '8 6' : undefined} strokeLinecap="round" />
          {l.label && (
            <text x={px(l.to[0]) + 4} y={py(l.to[1]) - 6} className="math-label" fill={l.color ?? '#e04848'}>
              {l.label}
            </text>
          )}
        </g>
      ))}
      {v.dots?.map((d, i) => (
        <g key={`d${i}`}>
          <circle cx={px(d.x)} cy={py(d.y)} r="6" fill={d.color ?? SUN} stroke={INK} strokeWidth="2" />
          {d.label && (
            <text x={px(d.x) + 9} y={py(d.y) - 8} className="math-label">
              {d.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ---------------- Regular polygon ---------------- */
function Polygon({ v }: { v: Extract<MathVisual, { type: 'polygon' }> }) {
  const r = 90;
  const pts = Array.from({ length: v.sides }, (_, i) => {
    const a = (Math.PI * 2 * i) / v.sides - Math.PI / 2;
    return `${130 + r * Math.cos(a)},${115 + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 260 240" className="art math-art" role="img" aria-label={v.label ?? 'مضلع'}>
      <polygon points={pts} fill={v.color ?? '#9fc4ff'} fillOpacity="0.6" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {v.label && (
        <text x="130" y="232" textAnchor="middle" className="math-label">
          {v.label}
        </text>
      )}
    </svg>
  );
}

/* ---------------- Triangle with angles ---------------- */
function Triangle({ v }: { v: Extract<MathVisual, { type: 'triangle' }> }) {
  const shapes: Record<string, [Point, Point, Point]> = {
    equilateral: [[40, 200], [240, 200], [140, 27]],
    isosceles: [[60, 200], [220, 200], [140, 30]],
    right: [[50, 200], [230, 200], [50, 40]],
    scalene: [[30, 200], [250, 200], [90, 50]],
  };
  const p = shapes[v.kind ?? 'scalene'];
  const c: Point = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3];
  const toward = (a: Point, k = 0.28): Point => [a[0] + (c[0] - a[0]) * k, a[1] + (c[1] - a[1]) * k + 6];
  return (
    <svg viewBox="0 0 280 230" className="art math-art" role="img" aria-label="مثلث وزواياه">
      <polygon points={p.map((q) => q.join(',')).join(' ')} fill={v.color ?? '#ffe08a'} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {v.kind === 'right' && <path d="M50 180 h20 v20" fill="none" stroke={INK} strokeWidth="2.5" />}
      {p.map((q, i) => {
        const [x, y] = toward(q);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" className="math-label math-label--angle">
            {v.angles[i]}
          </text>
        );
      })}
    </svg>
  );
}

/* ---------------- 3D solids ---------------- */
function Solid({ v }: { v: Extract<MathVisual, { type: 'solid' }> }) {
  const f = '#9fc4ff';
  const f2 = '#7aaef7';
  const f3 = '#c6dcff';
  const st = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const };
  const hidden = { stroke: INK, strokeWidth: 2, strokeDasharray: '6 5', fill: 'none' };
  const body = () => {
    switch (v.name) {
      case 'cube':
        return (
          <g>
            <path d="M60 90 L170 90 L170 200 L60 200Z" fill={f} {...st} />
            <path d="M60 90 L110 45 L220 45 L170 90Z" fill={f3} {...st} />
            <path d="M170 90 L220 45 L220 155 L170 200Z" fill={f2} {...st} />
            <path d="M60 200 L110 155 L220 155 M110 155 L110 45" {...hidden} />
          </g>
        );
      case 'cuboid':
        return (
          <g>
            <path d="M30 110 L180 110 L180 200 L30 200Z" fill={f} {...st} />
            <path d="M30 110 L80 70 L230 70 L180 110Z" fill={f3} {...st} />
            <path d="M180 110 L230 70 L230 160 L180 200Z" fill={f2} {...st} />
            <path d="M30 200 L80 160 L230 160 M80 160 L80 70" {...hidden} />
          </g>
        );
      case 'squarePyramid':
        return (
          <g>
            <path d="M40 180 L170 200 L130 30Z" fill={f} {...st} />
            <path d="M170 200 L230 160 L130 30Z" fill={f2} {...st} />
            <path d="M40 180 L100 145 L230 160 M100 145 L130 30" {...hidden} />
          </g>
        );
      case 'triangularPyramid':
        return (
          <g>
            <path d="M40 190 L190 200 L130 30Z" fill={f} {...st} />
            <path d="M190 200 L230 140 L130 30Z" fill={f2} {...st} />
            <path d="M40 190 L230 140" {...hidden} />
          </g>
        );
      case 'triangularPrism':
        return (
          <g>
            <path d="M40 190 L100 80 L160 190Z" fill={f3} {...st} />
            <path d="M100 80 L220 60 L250 160 L160 190Z" fill={f} {...st} />
            <path d="M40 190 L130 170 L250 160 M130 170 L220 60" {...hidden} />
          </g>
        );
      case 'cylinder':
        return (
          <g>
            <path d="M60 50 V180 A70 22 0 0 0 200 180 V50" fill={f} {...st} />
            <ellipse cx="130" cy="50" rx="70" ry="22" fill={f3} {...st} />
            <path d="M60 180 A70 22 0 0 1 200 180" {...hidden} />
          </g>
        );
      case 'cone':
        return (
          <g>
            <path d="M130 25 L60 180 A70 22 0 0 0 200 180Z" fill={f} {...st} />
            <path d="M60 180 A70 22 0 0 1 200 180" {...hidden} />
          </g>
        );
      case 'sphere':
        return (
          <g>
            <circle cx="130" cy="115" r="85" fill={f} {...st} />
            <ellipse cx="130" cy="115" rx="85" ry="24" {...hidden} />
            <ellipse cx="100" cy="80" rx="22" ry="14" fill="#fff" opacity="0.6" />
          </g>
        );
    }
  };
  return (
    <svg viewBox="0 0 260 230" className="art math-art" role="img" aria-label="شكل ثلاثي الأبعاد">
      {body()}
    </svg>
  );
}

/* ---------------- Dot array ---------------- */
function DotArray({ v }: { v: Extract<MathVisual, { type: 'array' }> }) {
  const S = 30;
  return (
    <svg viewBox={`0 0 ${v.cols * S + 20} ${v.rows * S + 20}`} className="art math-art" role="img" aria-label={`${v.rows} صفوف في ${v.cols} أعمدة`}>
      {Array.from({ length: v.rows * v.cols }, (_, i) => (
        <circle key={i} cx={10 + (i % v.cols) * S + S / 2} cy={10 + Math.floor(i / v.cols) * S + S / 2} r={S / 2 - 5} fill={v.color ?? palette[Math.floor(i / v.cols) % palette.length]} stroke={INK} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* ---------------- Ruler ---------------- */
function Ruler({ v }: { v: Extract<MathVisual, { type: 'ruler' }> }) {
  const U = 44;
  const W = v.length * U + 40;
  return (
    <svg viewBox={`0 0 ${W} 120`} className="art math-art" role="img" aria-label="مسطرة بالسنتيمتر">
      <rect x="10" y="40" width={W - 20} height="64" rx="8" fill="#fff4d1" stroke={INK} strokeWidth="2.5" />
      {Array.from({ length: v.length * 10 + 1 }, (_, i) => {
        const x = 20 + (i * U) / 10;
        const h = i % 10 === 0 ? 24 : i % 5 === 0 ? 16 : 10;
        return <line key={i} x1={x} x2={x} y1={40} y2={40 + h} stroke={INK} strokeWidth={i % 10 === 0 ? 2 : 1} />;
      })}
      {Array.from({ length: v.length + 1 }, (_, i) => (
        <text key={i} x={20 + i * U} y={90} textAnchor="middle" className="math-num math-num--sm">
          {ar(i)}
        </text>
      ))}
      {v.mark !== undefined && (
        <g>
          <rect x="20" y="16" width={v.mark * U} height="12" rx="6" fill={ACCENT} />
          <text x={20 + v.mark * U} y="12" textAnchor="middle" className="math-label">
            {v.label ?? `${fmt(v.mark)} سم`}
          </text>
        </g>
      )}
    </svg>
  );
}

/* ---------------- Thermometer ---------------- */
function Thermometer({ v }: { v: Extract<MathVisual, { type: 'thermometer' }> }) {
  const top = 20;
  const bottom = 220;
  const y = (n: number) => bottom - ((n - v.min) / (v.max - v.min)) * (bottom - top);
  const step = (v.max - v.min) / 10 >= 5 ? 5 : 1;
  return (
    <svg viewBox="0 0 160 270" className="art math-art" role="img" aria-label={`ميزان حرارة يشير إلى ${v.value}`}>
      <rect x="62" y={top - 8} width="26" height={bottom - top + 16} rx="13" fill="#fff" stroke={INK} strokeWidth="3" />
      <rect x="69" y={y(v.value)} width="12" height={bottom - y(v.value) + 10} fill="#e8394d" />
      <circle cx="75" cy={bottom + 22} r="20" fill="#e8394d" stroke={INK} strokeWidth="3" />
      {Array.from({ length: Math.floor((v.max - v.min) / step) + 1 }, (_, i) => {
        const n = v.min + i * step;
        return (
          <g key={i}>
            <line x1="88" x2="100" y1={y(n)} y2={y(n)} stroke={INK} strokeWidth={n === 0 ? 3 : 1.5} />
            <text x="106" y={y(n) + 5} className="math-num math-num--sm" fill={n < 0 ? '#2f6fe0' : INK}>
              {fmt(n)}
            </text>
          </g>
        );
      })}
      <text x="20" y={y(v.value) + 5} className="math-label">
        {fmt(v.value)}°
      </text>
    </svg>
  );
}

/* ---------------- Clock ---------------- */
function Clock({ v }: { v: Extract<MathVisual, { type: 'clock' }> }) {
  const mA = (v.minute / 60) * 360;
  const hA = ((v.hour % 12) / 12) * 360 + (v.minute / 60) * 30;
  if (v.digital)
    return (
      <div className="digital-clock" dir="ltr">
        {ar(String(v.hour).padStart(2, '0'))}:{ar(String(v.minute).padStart(2, '0'))}
      </div>
    );
  return (
    <svg viewBox="0 0 220 220" className="art math-art" role="img" aria-label="ساعة">
      <circle cx="110" cy="110" r="96" fill="#fff" stroke={INK} strokeWidth="5" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;
        return (
          <text key={i} x={110 + 74 * Math.cos(a)} y={116 + 74 * Math.sin(a)} textAnchor="middle" className="math-num math-num--sm">
            {ar(i + 1)}
          </text>
        );
      })}
      <line x1="110" y1="110" x2="110" y2="58" stroke={INK} strokeWidth="7" strokeLinecap="round" transform={`rotate(${hA} 110 110)`} />
      <line x1="110" y1="110" x2="110" y2="34" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" transform={`rotate(${mA} 110 110)`} />
      <circle cx="110" cy="110" r="7" fill={SUN} stroke={INK} strokeWidth="2" />
    </svg>
  );
}

/* ---------------- Digit cards & hundred square ---------------- */
function Cards({ v }: { v: Extract<MathVisual, { type: 'cards' }> }) {
  return (
    <div className="digit-cards" dir="ltr">
      {v.items.map((c, i) => (
        <span key={i} className="digit-card" style={{ background: palette[i % palette.length], rotate: `${((i % 3) - 1) * 4}deg` }}>
          {ar(c)}
        </span>
      ))}
    </div>
  );
}

function HundredSquare({ v }: { v: Extract<MathVisual, { type: 'hundredSquare' }> }) {
  return (
    <svg viewBox="0 0 224 224" className="art math-art" role="img" aria-label={`${v.shaded} من ١٠٠ مظلّلة`}>
      {Array.from({ length: 100 }, (_, i) => (
        <rect key={i} x={2 + (i % 10) * 22} y={2 + Math.floor(i / 10) * 22} width="20" height="20" rx="3" fill={i < v.shaded ? v.color ?? ACCENT : '#eef4ff'} />
      ))}
    </svg>
  );
}

/** Renders any MathVisual. */
export function MathView({ v }: { v: MathVisual }) {
  switch (v.type) {
    case 'numberLine':
      return <NumberLine v={v} />;
    case 'placeValue':
      return <PlaceValue v={v} />;
    case 'grid':
      return <Grid v={v} />;
    case 'polygon':
      return <Polygon v={v} />;
    case 'triangle':
      return <Triangle v={v} />;
    case 'solid':
      return <Solid v={v} />;
    case 'array':
      return <DotArray v={v} />;
    case 'ruler':
      return <Ruler v={v} />;
    case 'thermometer':
      return <Thermometer v={v} />;
    case 'clock':
      return <Clock v={v} />;
    case 'cards':
      return <Cards v={v} />;
    case 'hundredSquare':
      return <HundredSquare v={v} />;
  }
}
