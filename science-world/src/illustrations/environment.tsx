import type { ArtProps } from './body';

const INK = '#1f2a4d';

function dim(highlight: string | undefined, id: string) {
  if (!highlight) return undefined;
  return highlight === id ? 'art-hl' : 'art-dim';
}
const show = (frame: number | undefined, from: number) => (frame === undefined || frame >= from ? 'fade fade--on' : 'fade');

function Sun({ x, y, r = 26 }: { x: number; y: number; r?: number }) {
  return (
    <g className="art-sun" style={{ transformOrigin: `${x}px ${y}px` }}>
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${x} ${y - r - 6} V${y - r - 18}`} stroke="#ffb703" strokeWidth="5" strokeLinecap="round" transform={`rotate(${i * 45} ${x} ${y})`} />
      ))}
      <circle cx={x} cy={y} r={r} fill="#ffd23f" stroke={INK} strokeWidth="3" />
    </g>
  );
}

function Tree({ x, y, s = 1, dead = false }: { x: number; y: number; s?: number; dead?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-6 0 V-44 M0 -40 L-16 -60 M0 -34 L14 -54" stroke="#8a5a3b" strokeWidth="8" strokeLinecap="round" fill="none" />
      {!dead && <circle cx="0" cy="-62" r="30" fill="#3fbf6f" stroke={INK} strokeWidth="3" />}
      {!dead && <circle cx="-12" cy="-70" r="8" fill="#7fe0a0" opacity="0.7" />}
    </g>
  );
}

/* ------------------------------------------------------------ */
/* How plants make food (book p.37)                              */
/* frame 0 sunlight · 1 CO2 from air · 2 water from soil ·       */
/* 3 sugar is made and stored · 4 oxygen goes out to the air     */
/* ------------------------------------------------------------ */
export function PhotosynthesisArt({ frame, highlight }: ArtProps) {
  const f = frame;
  const act = (n: number) => (f === undefined || f === n ? 'flow flow--on' : 'flow');
  return (
    <svg viewBox="0 0 320 300" className="art" role="img" aria-label="النبات يصنع غذاءه باستخدام ضوء الشمس والماء وثاني أكسيد الكربون">
      <rect x="0" y="0" width="320" height="220" fill="#eaf6ff" />
      <rect x="0" y="220" width="320" height="80" fill="#a86b45" />
      <g className={dim(highlight, 'sun')}>
        <Sun x={52} y={50} />
      </g>
      {/* sunlight */}
      <path className={act(0)} d="M80 78 L150 128" stroke="#ffb703" />
      {/* CO2 */}
      <g className={dim(highlight, 'co2')}>
        <path className={act(1)} d="M300 76 Q250 92 196 124" stroke="#7c86a6" />
        <text x="314" y="96" textAnchor="end" className="art-label art-label--small">ثاني أكسيد الكربون</text>
      </g>
      {/* plant */}
      <path d="M160 222 V120" stroke="#2f9e57" strokeWidth="8" strokeLinecap="round" />
      <path d="M160 170 Q118 150 108 120 Q146 120 160 160Z" fill="#3fbf6f" stroke={INK} strokeWidth="3" className={f === 3 ? 'art-pulse' : undefined} style={{ transformOrigin: '140px 150px' }} />
      <path d="M160 150 Q206 126 214 96 Q172 98 160 140Z" fill="#3fbf6f" stroke={INK} strokeWidth="3" className={f === 3 ? 'art-pulse' : undefined} style={{ transformOrigin: '186px 120px' }} />
      <path d="M160 124 Q140 96 150 74 Q172 94 160 124Z" fill="#5fd389" stroke={INK} strokeWidth="3" />
      {/* roots */}
      <path d="M160 222 q-10 20 -30 30 M160 222 q4 24 0 44 M160 222 q14 18 34 26" stroke="#e8d3b0" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* water */}
      <g className={dim(highlight, 'water')}>
        <path className={act(2)} d="M60 270 Q110 262 150 244" stroke="#4cc9f0" />
        <path className={act(2)} d="M270 274 Q220 262 172 246" stroke="#4cc9f0" />
        <text x="40" y="292" className="art-label art-label--light">الماء</text>
      </g>
      {/* sugar stored */}
      <g className={show(f, 3)}>
        <rect x="118" y="186" width="84" height="26" rx="13" fill="#fff" stroke={INK} strokeWidth="2.5" />
        <text x="160" y="204" textAnchor="middle" className="art-label">سكر 🍬</text>
      </g>
      {/* oxygen out */}
      <g className={show(f, 4)}>
        <path className={f === 4 || f === undefined ? 'flow flow--on' : 'flow'} d="M206 108 Q240 60 268 40" stroke="#2fbf71" />
        <text x="276" y="30" textAnchor="middle" className="art-label art-label--green">أكسجين</text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Acid rain (book p.46)                                         */
/* frame 0 burning fuel · 1 gases rise · 2 mix with water vapour  */
/* 3 acid rain falls · 4 trees die, lakes become acidic          */
/* ------------------------------------------------------------ */
export function AcidRainArt({ frame }: ArtProps) {
  const f = frame ?? 4;
  return (
    <svg viewBox="0 0 320 280" className="art" role="img" aria-label="كيف تتكون الأمطار الحمضية">
      <rect width="320" height="280" fill={f >= 3 ? '#dfe5ee' : '#eaf6ff'} style={{ transition: 'fill 400ms ease' }} />
      {/* hills + lake */}
      <path d="M0 200 Q80 160 170 196 Q240 220 320 190 V280 H0Z" fill="#7cc576" stroke={INK} strokeWidth="3" />
      <path d="M180 244 Q250 226 320 236 V280 H170Z" fill={f >= 4 ? '#7fb3a2' : '#4cc9f0'} stroke={INK} strokeWidth="2.5" style={{ transition: 'fill 400ms ease' }} />
      {/* factory */}
      <g>
        <rect x="30" y="150" width="80" height="50" rx="6" fill="#c9d3e6" stroke={INK} strokeWidth="3" />
        <rect x="44" y="96" width="14" height="56" fill="#9aa5c0" stroke={INK} strokeWidth="3" />
        <rect x="76" y="110" width="14" height="42" fill="#9aa5c0" stroke={INK} strokeWidth="3" />
        <rect x="42" y="166" width="16" height="16" rx="3" fill="#ffd23f" stroke={INK} strokeWidth="2" />
        <rect x="70" y="166" width="16" height="16" rx="3" fill="#ffd23f" stroke={INK} strokeWidth="2" />
        {f === 0 && <text x="70" y="220" textAnchor="middle" fontSize="22">🔥</text>}
      </g>
      {/* smoke */}
      <g className={show(f, 1)}>
        <g className="smoke">
          <circle cx="52" cy="82" r="12" fill="#8d93a5" />
          <circle cx="66" cy="66" r="15" fill="#8d93a5" />
          <circle cx="88" cy="56" r="17" fill="#7a8195" />
          <circle cx="84" cy="96" r="10" fill="#8d93a5" />
        </g>
        <text x="112" y="112" className="art-label art-label--small">
          <tspan x="112">ثاني أكسيد الكبريت</tspan>
          <tspan x="112" dy="15">+ أكسيد النيتروجين</tspan>
        </text>
      </g>
      {/* cloud */}
      <g className={show(f, 2)}>
        <path d="M150 64 q-30 0 -30 -22 q0 -22 26 -22 q8 -18 34 -16 q26 2 30 24 q26 0 26 20 q0 16 -20 16 Z" fill={f >= 2 ? '#7a8195' : '#fff'} stroke={INK} strokeWidth="3" style={{ transition: 'fill 400ms ease' }} />
        <text x="178" y="48" textAnchor="middle" className="art-label art-label--light art-label--small">أحماض</text>
      </g>
      {/* rain */}
      <g className={`${show(f, 3)} rain`}>
        {[140, 160, 180, 200, 220, 240].map((x, i) => (
          <path key={x} d={`M${x} ${80 + (i % 2) * 10} l-6 16`} stroke="#5fae9a" strokeWidth="4" strokeLinecap="round" />
        ))}
      </g>
      {/* trees */}
      <Tree x={150} y={196} s={0.7} dead={f >= 4} />
      <Tree x={250} y={214} s={0.6} dead={f >= 4} />
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Deforestation before/after (book p.42) frame 0 forest · 1 cut  */
/* · 2 only grass, poor soil                                      */
/* ------------------------------------------------------------ */
export function ForestArt({ frame }: ArtProps) {
  const f = frame ?? 0;
  return (
    <svg viewBox="0 0 320 240" className="art" role="img" aria-label="غابة قبل إزالتها وبعدها">
      <rect width="320" height="240" fill="#eaf6ff" />
      <Sun x={270} y={44} r={20} />
      <path d="M0 180 H320 V240 H0Z" fill={f === 2 ? '#c8a27a' : '#6b4a32'} style={{ transition: 'fill 400ms ease' }} />
      <path d="M0 176 H320 V186 H0Z" fill={f === 2 ? '#b9d48a' : '#3fbf6f'} style={{ transition: 'fill 400ms ease' }} />
      {[30, 80, 130, 180, 230, 280].map((x, i) =>
        f === 0 ? (
          <Tree key={x} x={x} y={182} s={0.9 + (i % 2) * 0.15} />
        ) : f === 1 ? (
          <g key={x}>
            <rect x={x - 8} y={166} width="16" height="16" rx="3" fill="#8a5a3b" stroke={INK} strokeWidth="2.5" />
            <ellipse cx={x} cy={166} rx="8" ry="3" fill="#e8c9a0" stroke={INK} strokeWidth="2" />
          </g>
        ) : (
          <path key={x} d={`M${x - 10} 180 l4 -12 l4 12 l4 -14 l4 14`} stroke="#8fbf5a" strokeWidth="3" fill="none" />
        ),
      )}
      {f === 0 && (
        <g fontSize="22">
          <text x="60" y="110">🐒</text>
          <text x="200" y="100">🦜</text>
          <text x="150" y="170">🦋</text>
        </g>
      )}
      {f === 1 && <text x="250" y="160" fontSize="40">🚛</text>}
      {f === 2 && <text x="150" y="168" fontSize="34">🐄</text>}
      {f === 2 && <text x="160" y="224" textAnchor="middle" className="art-label art-label--light">تربة فقيرة</text>}
      {f === 0 && <text x="160" y="224" textAnchor="middle" className="art-label art-label--light">تربة غنية بالأوراق المتحللة</text>}
    </svg>
  );
}

/* ------------------------------------------------------------ */
/* Air pollution scene with hotspots (book p.44)                 */
/* ------------------------------------------------------------ */
export function PollutionArt({ highlight }: ArtProps) {
  return (
    <svg viewBox="0 0 320 240" className="art" role="img" aria-label="مدينة فيها سيارات ومصنع وطاقة نظيفة">
      <rect width="320" height="240" fill="#e7eaf2" />
      <path d="M0 40 Q80 20 160 44 Q240 64 320 36 V90 H0Z" fill="#b8bccb" opacity="0.6" />
      {/* city */}
      <g fill="#c9d3e6" stroke={INK} strokeWidth="2.5">
        <rect x="120" y="110" width="40" height="90" rx="4" />
        <rect x="166" y="90" width="36" height="110" rx="4" />
      </g>
      {/* factory */}
      <g className={dim(highlight, 'factory')}>
        <rect x="10" y="140" width="90" height="60" rx="6" fill="#d0d6e4" stroke={INK} strokeWidth="3" />
        <rect x="24" y="86" width="14" height="56" fill="#9aa5c0" stroke={INK} strokeWidth="3" />
        <rect x="60" y="100" width="14" height="42" fill="#9aa5c0" stroke={INK} strokeWidth="3" />
        <g className="smoke">
          <circle cx="32" cy="72" r="12" fill="#7a8195" />
          <circle cx="48" cy="56" r="15" fill="#6c7387" />
          <circle cx="70" cy="84" r="11" fill="#7a8195" />
        </g>
      </g>
      {/* cars */}
      <g className={dim(highlight, 'cars')}>
        <path d="M110 214 h70 v-12 q0 -10 -10 -12 l-10 -10 h-30 l-10 10 q-10 2 -10 12z" fill="#ff6b6b" stroke={INK} strokeWidth="2.5" />
        <circle cx="126" cy="216" r="7" fill={INK} />
        <circle cx="164" cy="216" r="7" fill={INK} />
        <g className="smoke smoke--small">
          <circle cx="100" cy="208" r="6" fill="#8d93a5" />
          <circle cx="88" cy="202" r="8" fill="#9ea4b5" />
        </g>
      </g>
      {/* clean energy */}
      <g className={dim(highlight, 'wind')}>
        <path d="M262 200 L266 110 L270 200Z" fill="#fff" stroke={INK} strokeWidth="2.5" />
        <g className="turbine" style={{ transformOrigin: '266px 110px' }}>
          <path d="M266 110 L266 70 M266 110 L301 130 M266 110 L231 130" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        </g>
        <circle cx="266" cy="110" r="5" fill="#ffd23f" stroke={INK} strokeWidth="2" />
      </g>
      <g className={dim(highlight, 'solar')}>
        <path d="M212 206 l14 -30 h40 l-14 30z" fill="#4c6fff" stroke={INK} strokeWidth="2.5" />
        <path d="M226 191 h40 M232 176 l-12 30 M246 176 l-12 30" stroke="#9fb4ff" strokeWidth="2" />
      </g>
      <path d="M0 222 H320 V240 H0Z" fill="#5c6680" />
    </svg>
  );
}
