/**
 * Unit 1 illustrations (human body). Hand-made SVG in one consistent style:
 * ink outline 3px, rounded joins, soft flat fills with a light highlight.
 * Props: `highlight` dims everything else; `frame` drives step-by-step processes.
 */
export interface ArtProps {
  highlight?: string;
  frame?: number;
}

const INK = '#1f2a4d';

function dim(highlight: string | undefined, id: string) {
  if (!highlight) return undefined;
  return highlight === id ? 'art-hl' : 'art-dim';
}

/* ------------------------------------------------------------ */
/* Full body with the main organs (book p.18)                    */
/* ------------------------------------------------------------ */
export function BodyArt({ highlight }: ArtProps) {
  return (
    <svg viewBox="0 0 300 400" className="art" role="img" aria-label="رسم لجسم الإنسان يظهر الأعضاء الرئيسية">
      <defs>
        <linearGradient id="body-skin" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#eaf5ff" />
          <stop offset="1" stopColor="#d6e9ff" />
        </linearGradient>
      </defs>
      {/* silhouette */}
      <g fill="url(#body-skin)" stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M100 120 Q150 96 200 120 L232 140 Q246 150 246 170 L252 262 Q254 276 240 278 L232 278 L222 186 L214 186 L214 352 Q214 372 194 372 L106 372 Q86 372 86 352 L86 186 L78 186 L68 278 L60 278 Q46 276 48 262 L54 170 Q54 150 68 140 Z" />
        <rect x="132" y="96" width="36" height="30" rx="10" />
        <circle cx="150" cy="58" r="46" />
      </g>
      {/* brain */}
      <g className={dim(highlight, 'brain')}>
        <path d="M118 56 Q114 26 150 22 Q186 24 184 56 Q182 72 150 72 Q118 72 118 56Z" fill="#ffb3c7" stroke={INK} strokeWidth="2.5" />
        <path d="M130 38 q8 6 0 12 M148 30 q8 8 0 16 q-6 6 2 12 M166 36 q-8 6 0 14" fill="none" stroke="#e0809b" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* lungs */}
      <g className={dim(highlight, 'lungs')} fill="#ff9eb0" stroke={INK} strokeWidth="2.5">
        <path d="M140 132 Q110 132 104 170 Q100 212 116 220 Q136 224 140 196 Z" />
        <path d="M160 132 Q190 132 196 170 Q200 212 184 220 Q164 224 160 196 Z" />
        <path d="M150 118 V140 M150 140 q-6 6 -12 8 M150 140 q6 6 12 8" fill="none" stroke="#c96a80" strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* heart: slightly to the body's left (viewer's right) */}
      <g className={dim(highlight, 'heart')}>
        <path className="art-beat" d="M160 168 q8 -10 16 -2 q8 9 -2 20 l-14 14 -14 -14 q-10 -11 -2 -20 q8 -8 16 2z" fill="#e8394d" stroke={INK} strokeWidth="2.5" style={{ transformOrigin: '160px 186px' }} />
      </g>
      {/* kidneys (at the back, under the ribs) */}
      <g className={dim(highlight, 'kidneys')} fill="#c0392b" stroke={INK} strokeWidth="2.5">
        <path d="M114 250 q-12 2 -12 18 q0 16 12 18 q8 0 8 -8 q-6 -10 0 -20 q0 -8 -8 -8z" />
        <path d="M186 250 q12 2 12 18 q0 16 -12 18 q-8 0 -8 -8 q6 -10 0 -20 q0 -8 8 -8z" />
      </g>
      {/* liver: body's right (viewer's left) */}
      <g className={dim(highlight, 'liver')}>
        <path d="M102 226 Q104 208 132 210 Q160 212 158 224 Q150 244 120 246 Q102 244 102 226Z" fill="#8e4b32" stroke={INK} strokeWidth="2.5" />
      </g>
      {/* stomach: body's left (viewer's right) */}
      <g className={dim(highlight, 'stomach')}>
        <path d="M170 212 Q196 206 200 226 Q204 252 178 256 Q160 258 158 246 Q170 244 176 236 Q170 226 170 212Z" fill="#ffa64d" stroke={INK} strokeWidth="2.5" />
      </g>
      {/* large intestine framing the small intestine */}
      <g className={dim(highlight, 'largeInt')}>
        <path d="M122 340 V280 Q122 268 134 268 H166 Q178 268 178 280 V336 Q178 346 166 346 H150" fill="none" stroke="#d98a4e" strokeWidth="14" strokeLinecap="round" />
        <path d="M122 340 V280 Q122 268 134 268 H166 Q178 268 178 280 V336 Q178 346 166 346 H150" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="1 0" opacity="0.25" />
      </g>
      {/* small intestine */}
      <g className={dim(highlight, 'smallInt')}>
        <path d="M136 284 h28 q8 0 8 8 t-8 8 h-28 q-8 0 -8 8 t8 8 h28 q8 0 8 8 t-8 8 h-24" fill="none" stroke="#f7c59f" strokeWidth="9" strokeLinecap="round" />
        <path d="M136 284 h28 q8 0 8 8 t-8 8 h-28 q-8 0 -8 8 t8 8 h28 q8 0 8 8 t-8 8 h-24" fill="none" stroke="#d9925f" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Heart: two sides, blood with / without oxygen (book p.20)     */
/* frame 0: blue blood arrives · 1: pumped to lungs              */
/* 2: comes back with oxygen · 3: pumped to the whole body       */
/* ------------------------------------------------------------ */
export function HeartArt({ frame, highlight }: ArtProps) {
  const f = frame ?? -1;
  const on = (n: number) => (f === -1 || f === n ? 'flow flow--on' : 'flow');
  return (
    <svg viewBox="0 0 320 300" className="art" role="img" aria-label="رسم للقلب: الجانب الأيمن أزرق والجانب الأيسر أحمر">
      {/* lungs at the top */}
      <g opacity={f === 1 || f === 2 || f === -1 ? 1 : 0.5} style={{ transition: 'opacity 300ms ease' }}>
        <path d="M118 26 Q90 26 86 52 Q84 78 104 78 Q124 78 126 52Z" fill="#ff9eb0" stroke={INK} strokeWidth="2.5" />
        <path d="M202 26 Q230 26 234 52 Q236 78 216 78 Q196 78 194 52Z" fill="#ff9eb0" stroke={INK} strokeWidth="2.5" />
        <text x="160" y="58" textAnchor="middle" className="art-label">الرئتان</text>
      </g>
      {/* heart body */}
      <g className="art-beat" style={{ transformOrigin: '160px 190px' }}>
        <path d="M160 128 Q196 88 236 116 Q270 146 240 200 Q214 240 160 272 Z" fill="#ef4b5f" stroke={INK} strokeWidth="3" className={dim(highlight, 'left')} />
        <path d="M160 128 Q124 88 84 116 Q50 146 80 200 Q106 240 160 272 Z" fill="#4c8dff" stroke={INK} strokeWidth="3" className={dim(highlight, 'right')} />
        <path d="M160 128 V268" stroke={INK} strokeWidth="3" />
      </g>
      <text x="112" y="186" textAnchor="middle" className="art-label art-label--light">
        <tspan x="112">الجانب</tspan>
        <tspan x="112" dy="18">الأيمن</tspan>
      </text>
      <text x="208" y="186" textAnchor="middle" className="art-label art-label--light">
        <tspan x="208">الجانب</tspan>
        <tspan x="208" dy="18">الأيسر</tspan>
      </text>
      {/* 0: blue blood from the body into the right side */}
      <path className={on(0)} d="M20 230 Q60 230 92 206" stroke="#4c8dff" />
      {/* 1: right side → lungs */}
      <path className={on(1)} d="M112 128 Q104 100 108 80" stroke="#4c8dff" />
      {/* 2: lungs → left side, now with oxygen */}
      <path className={on(2)} d="M212 80 Q218 104 208 128" stroke="#ef4b5f" />
      {/* 3: left side → whole body */}
      <path className={on(3)} d="M228 206 Q262 232 300 230" stroke="#ef4b5f" />
      <text x="8" y="262" className="art-label art-label--blue">دمٌ بدون أكسجين</text>
      <text x="312" y="262" textAnchor="end" className="art-label art-label--red">دمٌ يحمل أكسجين</text>
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Lungs & breathing (book p.24-25). frame 0 = شهيق, 1 = زفير    */
/* ------------------------------------------------------------ */
export function LungsArt({ frame, highlight }: ArtProps) {
  const mode = frame === 0 ? 'in' : frame === 1 ? 'out' : 'loop';
  return (
    <svg viewBox="0 0 300 320" className={`art lungs lungs--${mode}`} role="img" aria-label="الرئتان والقصبة الهوائية والحجاب الحاجز">
      {/* ribs hint */}
      <g stroke="#c9d6ee" strokeWidth="6" fill="none" strokeLinecap="round">
        <path d="M60 120 Q150 96 240 120" />
        <path d="M54 160 Q150 136 246 160" />
        <path d="M54 200 Q150 176 246 200" />
      </g>
      {/* windpipe */}
      <g className={dim(highlight, 'trachea')}>
        <rect x="140" y="20" width="20" height="90" rx="9" fill="#ffd1dc" stroke={INK} strokeWidth="3" />
        <path d="M144 34 h12 M144 48 h12 M144 62 h12 M144 76 h12 M144 90 h12" stroke="#e0809b" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g className={`lungs__pair ${dim(highlight, 'lungs') ?? ''}`}>
        <path d="M138 110 Q90 100 74 150 Q60 220 90 244 Q128 262 140 220 Z" fill="#ff9eb0" stroke={INK} strokeWidth="3" />
        <path d="M162 110 Q210 100 226 150 Q240 220 210 244 Q172 262 160 220 Z" fill="#ff9eb0" stroke={INK} strokeWidth="3" />
        <path d="M150 108 L124 140 L110 170 M124 140 L130 190 M150 108 L176 140 L190 170 M176 140 L170 190" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* diaphragm */}
      <path className={`lungs__diaphragm ${dim(highlight, 'diaphragm') ?? ''}`} d="M50 270 Q150 230 250 270" fill="none" stroke="#e8394d" strokeWidth="9" strokeLinecap="round" />
      {/* air arrows */}
      <g className="lungs__air">
        <path d="M150 -4 V14" />
        <path d="M150 14 l-8 -9 M150 14 l8 -9" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Digestive system: 5 numbered steps (book p.27)                */
/* frame 0 mouth · 1 oesophagus · 2 stomach · 3 intestine · 4 end*/
/* ------------------------------------------------------------ */
const foodPos = [
  [150, 72],
  [150, 140],
  [182, 214],
  [150, 296],
  [150, 372],
];
export function DigestiveArt({ frame, highlight }: ArtProps) {
  const f = frame ?? -1;
  const part = (n: number, id: string) => {
    if (highlight) return dim(highlight, id);
    if (f === -1) return undefined;
    return f === n ? 'art-hl' : 'art-dim';
  };
  const [fx, fy] = foodPos[Math.max(0, f)];
  return (
    <svg viewBox="0 0 300 420" className="art" role="img" aria-label="الجهاز الهضمي: الفم والمريء والمعدة والأمعاء">
      {/* head + torso outline */}
      <g fill="#eaf5ff" stroke={INK} strokeWidth="3">
        <path d="M86 150 Q150 128 214 150 L224 400 L76 400 Z" />
        <circle cx="150" cy="62" r="44" />
      </g>
      {/* mouth */}
      <g className={part(0, 'mouth')}>
        <path d="M130 76 Q150 96 170 76 Z" fill="#e8394d" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M136 79 h28" stroke="#fff" strokeWidth="4" />
      </g>
      {/* oesophagus */}
      <g className={part(1, 'oesophagus')}>
        <path d="M150 92 V196 Q150 208 164 210" fill="none" stroke="#ffb3c7" strokeWidth="14" strokeLinecap="round" />
        <path d="M150 92 V196 Q150 208 164 210" fill="none" stroke={INK} strokeWidth="2" opacity="0.3" />
      </g>
      {/* liver */}
      <g className={highlight ? dim(highlight, 'liver') : f === -1 ? undefined : 'art-dim'}>
        <path d="M96 196 Q100 176 130 180 Q150 184 146 198 Q138 216 112 216 Q94 214 96 196Z" fill="#8e4b32" stroke={INK} strokeWidth="2.5" />
      </g>
      {/* stomach */}
      <g className={part(2, 'stomach')}>
        <path d="M164 196 Q204 186 210 214 Q214 248 180 252 Q156 254 152 238 Q170 236 176 224 Q168 212 164 196Z" fill="#ffa64d" stroke={INK} strokeWidth="2.5" />
      </g>
      {/* large intestine (5) */}
      <g className={part(4, 'largeInt')}>
        <path d="M114 384 V280 Q114 262 132 262 H170 Q188 262 188 280 V346 Q188 360 170 360 H150 V392" fill="none" stroke="#d98a4e" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* small intestine (4) */}
      <g className={part(3, 'smallInt')}>
        <path d="M134 278 h34 q9 0 9 9 t-9 9 h-34 q-9 0 -9 9 t9 9 h34 q9 0 9 9 t-9 9 h-26" fill="none" stroke="#f7c59f" strokeWidth="10" strokeLinecap="round" />
        <path d="M134 278 h34 q9 0 9 9 t-9 9 h-34 q-9 0 -9 9 t9 9 h34 q9 0 9 9 t-9 9 h-26" fill="none" stroke="#d9925f" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* travelling food */}
      {f >= 0 && (
        <g className="food-dot" style={{ transform: `translate(${fx}px, ${fy}px)` }}>
          <circle r={f >= 3 ? 6 : f === 2 ? 9 : 11} fill="#7bd389" stroke={INK} strokeWidth="2.5" />
        </g>
      )}
      {/* step numbers */}
      {[
        [96, 80],
        [128, 140],
        [228, 220],
        [214, 304],
        [128, 400],
      ].map(([x, y], i) => (
        <g key={i} className={f === i ? 'num num--on' : 'num'}>
          <circle cx={x} cy={y} r="13" />
          <text x={x} y={y + 5} textAnchor="middle">
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Kidneys clean the blood (book p.28)                           */
/* frame 0 blood in · 1 cleaned · 2 urine leaves                 */
/* ------------------------------------------------------------ */
export function KidneysArt({ frame, highlight }: ArtProps) {
  const f = frame ?? -1;
  return (
    <svg viewBox="0 0 300 300" className="art" role="img" aria-label="الكليتان تنقيان الدم وتصنعان البول">
      {/* blood vessels */}
      <path d="M150 10 V250" stroke="#ef4b5f" strokeWidth="12" strokeLinecap="round" />
      <path d="M170 10 V250" stroke="#4c8dff" strokeWidth="12" strokeLinecap="round" />
      <path className={f === 0 || f === -1 ? 'flow flow--on' : 'flow'} d="M150 110 H96" stroke="#ef4b5f" />
      <path className={f === 1 || f === -1 ? 'flow flow--on' : 'flow'} d="M206 124 H170" stroke="#4c8dff" />
      <g className={dim(highlight, 'kidneys')} fill="#c0392b" stroke={INK} strokeWidth="3">
        <path className={f === 1 ? 'art-pulse' : undefined} d="M86 70 q-40 4 -40 54 q0 50 40 54 q24 0 24 -24 q-18 -30 0 -60 q0 -24 -24 -24z" style={{ transformOrigin: '80px 124px' }} />
        <path className={f === 1 ? 'art-pulse' : undefined} d="M234 70 q40 4 40 54 q0 50 -40 54 q-24 0 -24 -24 q18 -30 0 -60 q0 -24 24 -24z" style={{ transformOrigin: '240px 124px' }} />
      </g>
      {/* ureters + bladder */}
      <path d="M86 178 Q100 230 140 254 M234 178 Q220 230 180 254" fill="none" stroke="#f5d76e" strokeWidth="7" strokeLinecap="round" />
      <g className={dim(highlight, 'bladder')}>
        <ellipse cx="160" cy="268" rx="34" ry="24" fill="#fff1a8" stroke={INK} strokeWidth="3" />
      </g>
      {f === 2 && (
        <g className="drops">
          <circle cx="104" cy="214" r="6" fill="#f5d76e" />
          <circle cx="216" cy="214" r="6" fill="#f5d76e" />
        </g>
      )}
      <text x="160" y="274" textAnchor="middle" className="art-label">البول</text>
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Brain parts (book p.30): المخ (4 areas) · المخيخ · جذع الدماغ */
/* ------------------------------------------------------------ */
export function BrainArt({ highlight }: ArtProps) {
  return (
    <svg viewBox="0 0 320 300" className="art" role="img" aria-label="أجزاء الدماغ: المخ والمخيخ وجذع الدماغ">
      {/* head profile facing right */}
      <path d="M74 250 Q40 160 70 90 Q110 20 196 30 Q268 44 282 120 Q286 150 300 176 Q306 188 292 192 L284 194 Q290 214 278 222 Q282 240 262 244 Q236 248 230 270 L226 296 L104 296 Q100 270 74 250Z" fill="#ffe1c7" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="240" cy="120" r="6" fill={INK} />
      {/* cerebrum areas */}
      <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
        <path className={dim(highlight, 'speech')} d="M196 56 Q244 66 252 112 Q250 148 214 150 L190 104 Z" fill="#ffd166" />
        <path className={dim(highlight, 'movement')} d="M120 54 Q160 40 196 56 L190 104 L140 104 Z" fill="#ffe08a" />
        <path className={dim(highlight, 'hearing')} d="M140 104 L190 104 L214 150 Q180 170 140 160 Z" fill="#ffc94a" />
        <path className={dim(highlight, 'vision')} d="M120 54 L140 104 L140 160 Q100 160 88 130 Q84 80 120 54Z" fill="#ffdb70" />
      </g>
      <g fill="none" stroke="#d9a520" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
        <path d="M150 70 q10 8 0 16 M210 90 q-10 8 0 18 M120 110 q10 6 0 14 M170 128 q10 6 0 14" />
      </g>
      <path className={dim(highlight, 'cerebellum')} d="M100 160 Q132 160 140 176 Q138 204 106 204 Q84 198 88 176 Q90 162 100 160Z" fill="#ef4b5f" stroke={INK} strokeWidth="2.5" />
      <path className={dim(highlight, 'stem')} d="M146 158 Q168 162 166 190 L162 250 L142 250 L144 190 Q140 170 146 158Z" fill="#4c8dff" stroke={INK} strokeWidth="2.5" />
    </svg>
  );
}
