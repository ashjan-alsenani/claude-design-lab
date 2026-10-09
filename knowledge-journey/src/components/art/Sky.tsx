import { memo, useMemo } from 'react';
import { seeded } from '../../lib/random';
import './art.css';

function Cloud({ width = 260 }: { width?: number }) {
  return (
    <svg viewBox="0 0 260 90" width={width} aria-hidden>
      <defs>
        <linearGradient id="cloud-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset="1" stopColor="#f3dcff" stopOpacity=".55" />
        </linearGradient>
      </defs>
      <path
        d="M30 78c-16 0-26-9-26-21s11-21 25-21c3-16 18-27 36-27 14 0 26 6 32 16 6-6 15-9 25-9 19 0 34 13 36 30 4-2 9-3 14-3 18 0 32 11 32 26 0 6-3 9-9 9Z"
        fill="url(#cloud-g)"
      />
    </svg>
  );
}

function FarIsland() {
  return (
    <svg viewBox="0 0 120 80" aria-hidden>
      <ellipse cx="60" cy="22" rx="52" ry="10" fill="#c9b6ff" />
      <path d="M10 24c10 10 22 16 30 30 6 10 14 22 20 22s14-12 20-22c8-14 20-20 30-30Z" fill="#7d5ad8" />
    </svg>
  );
}

/** Ambient sky: gradient, twinkling stars, drifting clouds, rising motes. CSS-only motion. */
export const Sky = memo(function Sky({ variant = 'dusk', motes = true, orb = false }: { variant?: 'dusk' | 'night' | 'gold'; motes?: boolean; orb?: boolean }) {
  const stars = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: 70 }, (_, i) => ({
      i,
      x: r() * 100,
      y: r() * 100,
      s: r() < 0.12 ? 1.6 : 0.6 + r() * 0.7,
      d: 2 + r() * 4,
      delay: -r() * 6,
    }));
  }, []);
  const moteList = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: 14 }, (_, i) => ({ i, left: r() * 100, dur: 12 + r() * 14, delay: -r() * 20, x: (r() - 0.5) * 120 }));
  }, []);
  return (
    <div className="sky" data-variant={variant} aria-hidden>
      <svg className="sky-stars" viewBox="0 0 100 100" preserveAspectRatio="none">
        {stars.map((s) => (
          <circle
            key={s.i}
            cx={s.x}
            cy={s.y}
            r={s.s * 0.18}
            fill={s.s > 1.4 ? '#ffe6a3' : '#fff'}
            style={{ ['--d' as string]: `${s.d}s`, ['--delay' as string]: `${s.delay}s` }}
          />
        ))}
      </svg>
      {orb && <div className="sky-orb" />}
      <div className="sky-far-island" style={{ top: '22%', right: '6%', ['--dur' as string]: '8s' }}>
        <FarIsland />
      </div>
      <div className="sky-far-island" style={{ top: '48%', left: '4%', width: 70, ['--dur' as string]: '6s', opacity: 0.35 }}>
        <FarIsland />
      </div>
      <div className="sky-cloud" style={{ top: '14%', ['--dur' as string]: '150s', ['--delay' as string]: '-40s', ['--o' as string]: 0.55 }}>
        <Cloud width={240} />
      </div>
      <div className="sky-cloud" style={{ top: '38%', ['--dur' as string]: '190s', ['--delay' as string]: '-120s', ['--o' as string]: 0.4 }}>
        <Cloud width={320} />
      </div>
      <div className="sky-cloud" style={{ top: '66%', ['--dur' as string]: '130s', ['--delay' as string]: '-70s', ['--o' as string]: 0.6 }}>
        <Cloud width={380} />
      </div>
      <div className="sky-cloud" style={{ top: '80%', ['--dur' as string]: '170s', ['--delay' as string]: '-10s', ['--o' as string]: 0.7 }}>
        <Cloud width={460} />
      </div>
      {motes &&
        moteList.map((m) => (
          <span
            key={m.i}
            className="sky-mote"
            style={{ left: `${m.left}%`, ['--dur' as string]: `${m.dur}s`, ['--delay' as string]: `${m.delay}s`, ['--x' as string]: `${m.x}px` }}
          />
        ))}
    </div>
  );
});
