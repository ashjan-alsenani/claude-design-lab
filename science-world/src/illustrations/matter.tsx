import type { ReactNode } from 'react';
import type { ArtProps } from './body';

const INK = '#1f2a4d';

function Beaker({ x, y, children, liquid = '#bfe9ff', level = 70, label }: { x: number; y: number; children?: ReactNode; liquid?: string; level?: number; label?: string }) {
  // beaker 90 wide, 110 tall, origin top-left
  const top = 110 - level;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M6 ${top} H84 V100 Q84 110 74 110 H16 Q6 110 6 100Z`} fill={liquid} style={{ transition: 'fill 500ms ease' }} />
      {children}
      <path d="M0 0 H90 M6 0 V100 Q6 110 16 110 H74 Q84 110 84 100 V0" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M14 30 h12 M14 50 h8 M14 70 h12" stroke="#7c86a6" strokeWidth="2" />
      {label && (
        <text x="45" y="132" textAnchor="middle" className="art-label">
          {label}
        </text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------ */
/* Ice ⇄ water (book p.54). frame 0 ice · 1 heating → water ·    */
/* 2 cooling → ice again                                         */
/* ------------------------------------------------------------ */
export function IceCycleArt({ frame }: ArtProps) {
  const f = frame ?? 0;
  const water = f === 1;
  return (
    <svg viewBox="0 0 320 240" className="art" role="img" aria-label="الثلج يتحول إلى ماء بالتسخين ويعود ثلجًا بالتبريد">
      <path d="M90 60 Q160 0 230 60" fill="none" stroke={f === 2 ? '#4c8dff' : '#c9d3e6'} strokeWidth="5" markerEnd="url(#arrow-blue)" />
      <path d="M230 190 Q160 250 90 190" fill="none" stroke={f === 1 ? '#ff6b6b' : '#c9d3e6'} strokeWidth="5" markerEnd="url(#arrow-red)" />
      <defs>
        <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#4c8dff" />
        </marker>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#ff6b6b" />
        </marker>
      </defs>
      <text x="160" y="22" textAnchor="middle" className="art-label art-label--blue">تبريد ❄️</text>
      <text x="160" y="236" textAnchor="middle" className="art-label art-label--red">تسخين 🔥</text>
      <Beaker x={115} y={66} liquid={water ? '#8fd3ff' : 'transparent'} level={water ? 56 : 0}>
        <g className={water ? 'fade' : 'fade fade--on'}>
          <rect x="20" y="66" width="28" height="28" rx="6" fill="#e6f7ff" stroke="#7cc8ee" strokeWidth="3" transform="rotate(-8 34 80)" />
          <rect x="44" y="70" width="28" height="28" rx="6" fill="#e6f7ff" stroke="#7cc8ee" strokeWidth="3" transform="rotate(10 58 84)" />
          <rect x="32" y="42" width="26" height="26" rx="6" fill="#e6f7ff" stroke="#7cc8ee" strokeWidth="3" />
        </g>
      </Beaker>
      <text x="160" y="196" textAnchor="middle" className="art-label">{water ? 'ماء (سائل)' : 'ثلج (صلب)'}</text>
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Burning match — an irreversible change (book p.55)            */
/* ------------------------------------------------------------ */
export function MatchArt({ frame }: ArtProps) {
  const f = frame ?? 0;
  return (
    <svg viewBox="0 0 320 200" className="art" role="img" aria-label="عود ثقاب يحترق ويتحول إلى كربون أسود">
      <rect x="60" y="120" width="200" height="12" rx="6" fill={f >= 2 ? '#2b2b2b' : '#e9c48f'} stroke={INK} strokeWidth="3" style={{ transition: 'fill 600ms ease' }} />
      <ellipse cx="262" cy="126" rx="16" ry="12" fill={f >= 2 ? '#1a1a1a' : '#e63946'} stroke={INK} strokeWidth="3" style={{ transition: 'fill 600ms ease' }} />
      {f === 1 && (
        <g className="flame" style={{ transformOrigin: '262px 120px' }}>
          <path d="M262 60 Q290 96 274 118 Q262 130 250 118 Q236 96 262 60Z" fill="#ffb703" />
          <path d="M262 84 Q276 104 268 116 Q262 122 256 116 Q250 102 262 84Z" fill="#fff3b0" />
        </g>
      )}
      {f >= 2 && (
        <g className="smoke">
          <circle cx="262" cy="96" r="8" fill="#9ea4b5" />
          <circle cx="270" cy="76" r="10" fill="#b8bccb" />
        </g>
      )}
      <text x="160" y="176" textAnchor="middle" className="art-label">
        {f === 0 ? 'عود ثقاب جديد' : f === 1 ? 'يحترق…' : 'كربون أسود — لا يعود كما كان!'}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Sieving (book p.57). frame 0 mixture · 1 shake · 2 separated   */
/* ------------------------------------------------------------ */
export function SieveArt({ frame }: ArtProps) {
  const f = frame ?? 0;
  const stones = [
    [118, 92],
    [146, 86],
    [176, 94],
    [200, 88],
    [132, 100],
    [190, 102],
  ];
  return (
    <svg viewBox="0 0 320 250" className="art" role="img" aria-label="الغربال يفصل الحصى عن التربة">
      <g className={f === 1 ? 'shake' : undefined}>
        <path d="M90 70 H230 L214 112 H106Z" fill="#f5e6cf" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M106 112 H214" stroke={INK} strokeWidth="3" strokeDasharray="4 5" />
        {stones.map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="11" ry="8" fill="#8d93a5" stroke={INK} strokeWidth="2" />
        ))}
        {f === 0 && <path d="M110 104 Q160 90 210 104 L206 110 H114Z" fill="#a86b45" />}
      </g>
      {/* falling soil */}
      {f === 1 && (
        <g className="fall">
          {[120, 140, 160, 180, 200].map((x) => (
            <circle key={x} cx={x} cy={130} r="3.5" fill="#a86b45" />
          ))}
        </g>
      )}
      {/* container */}
      <path d="M96 170 H224 L212 230 H108Z" fill="#dbe5f5" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d={f >= 1 ? 'M104 200 Q160 188 216 200 L212 228 H108Z' : 'M108 228 H212'} fill="#a86b45" style={{ transition: 'd 500ms ease' }} />
      <text x="160" y="40" textAnchor="middle" className="art-label">
        {f === 0 ? 'تربة مخلوطة بالحصى' : f === 1 ? 'نهزّ الغربال…' : 'الحصى بقيت فوق، والتربة نزلت!'}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Filtration with funnel + filter paper (book p.60-61)          */
/* frame 0 cloudy mixture · 1 pour · 2 clear water passes ·       */
/* 3 sand stays on the paper                                     */
/* ------------------------------------------------------------ */
export function FilterArt({ frame }: ArtProps) {
  const f = frame ?? 3;
  return (
    <svg viewBox="0 -24 320 304" className="art" role="img" aria-label="الترشيح: القمع وورقة الترشيح">
      {/* source beaker */}
      <g transform={f >= 1 ? 'translate(24 10) rotate(-28 60 60)' : 'translate(10 40)'} style={{ transition: 'transform 500ms var(--ease-out)' }}>
        <Beaker x={0} y={0} liquid={f >= 2 ? 'transparent' : '#c9b48a'} level={f >= 2 ? 0 : 60}>
          {f < 2 && [20, 36, 52, 66].map((x) => <circle key={x} cx={x} cy={96} r="4" fill="#8a6a40" />)}
        </Beaker>
      </g>
      {/* funnel */}
      <path d="M150 70 H270 L222 140 V176 H198 V140Z" fill="#fff" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M160 76 H260 L212 136Z" fill="#f4f1e8" stroke="#c9b48a" strokeWidth="2" />
      {f >= 3 && <path d="M190 112 Q210 104 232 112 L212 134Z" fill="#a8844f" />}
      {f === 1 && <path d="M136 70 Q170 60 200 90" stroke="#c9b48a" strokeWidth="8" fill="none" strokeLinecap="round" />}
      {f >= 2 && (
        <g className="drip">
          <circle cx="210" cy="190" r="4" fill="#4cc9f0" />
        </g>
      )}
      {/* glass below */}
      <Beaker x={165} y={160} liquid={f >= 2 ? '#bfe9ff' : 'transparent'} level={f >= 2 ? 48 : 0} />
      <text x="160" y="-6" textAnchor="middle" className="art-label">
        {['ماء مع رمل (مخلوط)', 'نصبّ المخلوط في القمع', 'الماء يمرّ من الثقوب الدقيقة', 'الرمل يبقى على ورقة الترشيح'][f]}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Sand filter layers (book p.60) — hotspot diagram              */
/* ------------------------------------------------------------ */
export function SandFilterArt({ highlight }: ArtProps) {
  const dim = (id: string) => (highlight ? (highlight === id ? 'art-hl' : 'art-dim') : undefined);
  return (
    <svg viewBox="0 0 320 300" className="art" role="img" aria-label="مرشح الرمل: مياه غير نقية ثم رمال ناعمة ثم رمال خشنة ثم حصى">
      <rect x="100" y="20" width="120" height="240" rx="14" fill="#f4f9ff" stroke={INK} strokeWidth="3" />
      <rect className={dim('dirty')} x="104" y="30" width="112" height="50" fill="#b08d57" />
      <g className={dim('fine')}>
        <rect x="104" y="80" width="112" height="56" fill="#f2d49b" />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={110 + ((i * 37) % 100)} cy={86 + ((i * 13) % 46)} r="1.6" fill="#c9a86b" />
        ))}
      </g>
      <g className={dim('coarse')}>
        <rect x="104" y="136" width="112" height="56" fill="#e2b874" />
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={112 + ((i * 29) % 96)} cy={144 + ((i * 17) % 42)} r="4" fill="#c4914a" />
        ))}
      </g>
      <g className={dim('gravel')}>
        <rect x="104" y="192" width="112" height="62" rx="0" fill="#c9cfdb" />
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx={116 + ((i * 23) % 92)} cy={204 + ((i * 19) % 42)} rx="10" ry="7" fill="#8d93a5" stroke={INK} strokeWidth="1.5" />
        ))}
      </g>
      <path d="M160 0 V24" stroke="#b08d57" strokeWidth="8" strokeLinecap="round" className="drip-line" />
      <path className={dim('clean')} d="M160 262 V280 H250" stroke="#4cc9f0" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path className={dim('clean')} d="M240 250 H290 L284 296 H246Z" fill="#bfe9ff" stroke={INK} strokeWidth="3" />
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Dissolving (book p.64). frame 0 solute at the bottom ·        */
/* 1 stirring · 2 spread evenly (uniform solution)               */
/* ------------------------------------------------------------ */
const grains = Array.from({ length: 22 }, (_, i) => ({ id: i, bx: 30 + ((i * 7) % 30), by: 100 - (i % 4) * 4, sx: 14 + ((i * 29) % 62), sy: 50 + ((i * 17) % 52) }));
export function DissolveArt({ frame }: ArtProps) {
  const f = frame ?? 2;
  return (
    <svg viewBox="0 0 320 220" className="art" role="img" aria-label="ذوبان المادة المذابة في المادة المذيبة">
      <Beaker x={115} y={40} liquid={f === 2 ? '#ffd8a8' : '#bfe9ff'} level={74}>
        {grains.map((g) => (
          <circle
            key={g.id}
            r={f === 2 ? 2 : 3.5}
            fill={f === 2 ? '#ff9f43' : '#fff'}
            stroke={f === 2 ? 'none' : INK}
            strokeWidth="1"
            style={{ transform: `translate(${f === 2 ? g.sx : g.bx}px, ${f === 2 ? g.sy : g.by}px)`, transition: 'transform 900ms var(--ease-out), fill 500ms ease' }}
          />
        ))}
        {f === 1 && <path className="spoon" d="M50 -30 L46 70" stroke="#9aa5c0" strokeWidth="6" strokeLinecap="round" />}
      </Beaker>
      <text x="40" y="70" className="art-label art-label--small">المادة المذيبة 💧</text>
      <text x="40" y="200" className="art-label art-label--small">{f === 2 ? 'محلول متجانس ✨' : 'المادة المذابة'}</text>
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Four mixtures in water (check your progress, book p.68)       */
/* ------------------------------------------------------------ */
export function MixturesArt({ highlight }: ArtProps) {
  const dim = (id: string) => (highlight ? (highlight === id ? 'art-hl' : 'art-dim') : undefined);
  return (
    <svg viewBox="0 0 420 170" className="art" role="img" aria-label="أربعة مخاليط: ملح وماء، رمل وماء، دقيق وماء، حبات فول وماء">
      <g className={dim('salt')}>
        <Beaker x={4} y={10} liquid="#bfe9ff" level={70} label="ملح وماء" />
      </g>
      <g className={dim('sand')}>
        <Beaker x={110} y={10} liquid="#bfe9ff" level={70} label="رمل وماء">
          <path d="M8 104 Q45 92 82 104 V106 H8Z" fill="#d9b779" />
        </Beaker>
      </g>
      <g className={dim('flour')}>
        <Beaker x={216} y={10} liquid="#e3eef6" level={70} label="دقيق وماء">
          {[20, 40, 60, 30, 55, 70, 25].map((x, i) => (
            <circle key={i} cx={x} cy={50 + i * 7} r="5" fill="#fff" opacity="0.9" />
          ))}
        </Beaker>
      </g>
      <g className={dim('beans')}>
        <Beaker x={322} y={10} liquid="#bfe9ff" level={70} label="فول وماء">
          {[24, 44, 64].map((x) => (
            <ellipse key={x} cx={x} cy={98} rx="9" ry="6" fill="#8a5a3b" stroke={INK} strokeWidth="1.5" />
          ))}
        </Beaker>
      </g>
    </svg>
  );
}
