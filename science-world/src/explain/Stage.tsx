/**
 * Renders one scene of an explainer. All motion is CSS keyframes generated from the scene data,
 * so the whole stage can be paused (play-state) and jumped to any moment (negative delays).
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Art } from '../illustrations/registry';
import { MathView } from '../illustrations/math';
import { toArabicDigits } from '../lib/digits';
import { mixed } from '../lib/bidi';
import type { Actor, Anim, Scene, XY } from './types';

/** How long a scene lasts: its own duration, or long enough to read the narration. */
export function sceneDuration(s: Scene) {
  if (s.duration) return s.duration;
  const words = s.say.split(/\s+/).length;
  return Math.max(6, Math.min(14, 2 + words * 0.42));
}

const COLORS: Record<string, string> = {
  accent: 'var(--accent)', good: 'var(--good)', bad: 'var(--coral)', ink: 'var(--ink)', sun: 'var(--sun-deep)',
  blue: '#2f7ff0', red: '#e04848', green: '#1f9a59', purple: '#7a3fc4', orange: '#ff8a3d', white: '#fff', grey: '#7c86a6',
};
const color = (c?: string, fallback = 'var(--accent)') => (c ? COLORS[c] ?? c : fallback);

interface Frame { t: number; x: number; y: number; s: number; r: number; o: number }

/** Keyframes for an actor's position/scale/rotation/opacity over the scene. */
function timeline(a: Actor & { x?: number; y?: number }, D: number): Frame[] {
  const start = a.in ?? 0;
  let cur: Frame = { t: 0, x: a.x ?? 50, y: a.y ?? 50, s: 1, r: 0, o: 1 };
  const frames: Frame[] = [];
  const push = (f: Frame) => frames.push({ ...f, t: Math.max(0, Math.min(D, f.t)) });
  push({ ...cur, t: 0, o: 0, s: 0.6 });
  if (start > 0) push({ ...cur, t: start, o: 0, s: 0.6 });
  push({ ...cur, t: start + 0.35 });
  const moves = (a.anim ?? []).filter((m) => m.to).sort((p, q) => p.at - q.at);
  for (const m of moves) {
    const t0 = Math.max(m.at, start + 0.35);
    push({ ...cur, t: t0 });
    cur = { ...cur, x: m.to!.x ?? cur.x, y: m.to!.y ?? cur.y, s: m.to!.scale ?? cur.s, r: m.to!.rotate ?? cur.r, o: m.to!.opacity ?? cur.o, t: t0 + (m.dur ?? 0.8) };
    push(cur);
  }
  if (a.out !== undefined) {
    push({ ...cur, t: a.out });
    cur = { ...cur, t: a.out + 0.3, o: 0, s: cur.s * 0.9 };
    push(cur);
  }
  push({ ...cur, t: D });
  // keep increasing times only
  return frames.filter((f, i) => i === 0 || f.t >= frames[i - 1].t);
}

function keyframesCss(name: string, frames: Frame[], D: number) {
  const pct = (t: number) => Math.min(100, (t / D) * 100).toFixed(3);
  return `@keyframes ${name}{${frames
    .map((f) => `${pct(f.t)}%{left:${f.x}%;top:${f.y}%;opacity:${f.o};transform:translate(-50%,-50%) scale(${f.s}) rotate(${f.r}deg)}`)
    .join('')}}`;
}

/** Smooth path through points (Catmull-Rom → cubic Bézier) in the given pixel space. */
function pathD(points: XY[], W: number, H: number, smooth = true) {
  const p = points.map(([x, y]) => [(x / 100) * W, (y / 100) * H]);
  if (p.length < 2) return '';
  if (!smooth || p.length < 3) return 'M' + p.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join(' L');
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function arrowD(from: XY, to: XY, curve: number, W: number, H: number) {
  const [x1, y1] = [(from[0] / 100) * W, (from[1] / 100) * H];
  const [x2, y2] = [(to[0] / 100) * W, (to[1] / 100) * H];
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const k = (curve / 100) * W;
  const cx = mx - ((y2 - y1) / len) * k;
  const cy = my + ((x2 - x1) / len) * k;
  return { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, end: [x2, y2], angle: (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI };
}

/** delays relative to the seek point, so a paused stage can show any moment */
const delay = (t: number, seek: number) => `${(t - seek).toFixed(3)}s`;

/** fade out at `out` (arrows, flows) */
const outStyle = (out: number | undefined, seek: number): CSSProperties | undefined =>
  out === undefined ? undefined : { animation: `xout 0.3s ease ${delay(out, seek)} both` };

export function Stage({ scene, seek = 0, paused = false, clock }: { scene: Scene; seek?: number; paused?: boolean; clock: () => number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ W: 800, H: 500 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ W: el.clientWidth, H: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const D = sceneDuration(scene);
  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);
  const css = useMemo(
    () =>
      scene.actors
        .filter((a) => a.kind !== 'arrow' && a.kind !== 'flow')
        .map((a, i) => keyframesCss(`xa-${uid}-${i}`, timeline(a as Actor & { x: number; y: number }, D), D))
        .join('\n'),
    [scene, D, uid],
  );
  const { W, H } = size;
  const fs = (pct: number) => `${(pct / 100) * W}px`;

  return (
    <div ref={ref} className={`xstage xstage--${scene.bg ?? 'sky'} ${paused ? 'is-paused' : ''}`} role="img" aria-label={scene.say}>
      <style>{css}</style>
      {scene.title && (
        <div className="xstage__title" style={{ animationDelay: delay(0, seek) }}>
          {mixed(scene.title)}
        </div>
      )}
      {/* arrows and flows live in one SVG layer in stage pixels */}
      <svg className="xstage__svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
        </defs>
        {scene.actors.map((a, i) => {
          if (a.kind === 'arrow') {
            const { d, end, angle } = arrowD(a.from, a.to, a.curve ?? 0, W, H);
            const c = color(a.color, 'var(--ink)');
            const sw = Math.max(3, W / 160);
            const hs = sw * 3.2;
            return (
              <g key={a.id} style={outStyle(a.out, seek)}>
                <path d={d} pathLength={1} className={`xarrow__line ${a.dashed ? 'is-dashed' : ''}`} stroke={c} style={{ animationDelay: delay(a.in ?? 0, seek), strokeWidth: sw }} />
                <polygon
                  points={`0,0 ${-hs},${-hs * 0.6} ${-hs},${hs * 0.6}`}
                  fill={c}
                  className="xarrow__head"
                  transform={`translate(${end[0]} ${end[1]}) rotate(${angle})`}
                  style={{ animationDelay: delay((a.in ?? 0) + 0.75, seek) }}
                />
              </g>
            );
          }
          if (a.kind === 'flow' && a.showPath !== false) {
            return (
              <g key={a.id + i} style={outStyle(a.out, seek)}>
                <path d={pathD(a.path, W, H, a.smooth !== false)} className="xflow__path" stroke={color(a.color, 'var(--accent)')} style={{ animationDelay: delay(a.in ?? 0, seek) }} />
              </g>
            );
          }
          return null;
        })}
      </svg>
      {scene.actors.map((a) => {
        if (a.kind !== 'arrow' || !a.label) return null;
        const lx = (a.from[0] + a.to[0]) / 2;
        const ly = (a.from[1] + a.to[1]) / 2 - 4;
        return (
          <span key={a.id + '-l'} className="xlabel xlabel--arrow" style={{ left: `${lx}%`, top: `${ly}%`, fontSize: fs(3), animationDelay: delay((a.in ?? 0) + 0.5, seek) }}>
            {mixed(a.label)}
          </span>
        );
      })}
      {/* travellers along flows */}
      {scene.actors.map((a) => {
        if (a.kind !== 'flow') return null;
        const d = pathD(a.path, W, H, a.smooth !== false);
        const n = a.count ?? 4;
        const sp = a.speed ?? 4;
        return Array.from({ length: n }, (_, k) => (
          <span style={outStyle(a.out, seek)} key={`${a.id}-w${k}`} className="xtraveller-wrap">
          <span
            key={`${a.id}-${k}`}
            className={`xtraveller ${a.emoji ? '' : 'xtraveller--dot'}`}
            style={
              {
                offsetPath: `path('${d}')`,
                fontSize: fs(4.2),
                background: a.emoji ? undefined : color(a.color, 'var(--accent)'),
                width: a.emoji ? undefined : fs(2.2),
                height: a.emoji ? undefined : fs(2.2),
                animationDuration: `${sp}s, 0.4s`,
                animationDelay: `${delay((a.in ?? 0) + (k * sp) / n, seek)}, ${delay(a.in ?? 0, seek)}`,
              } as CSSProperties
            }
          >
            {a.emoji}
          </span>
          </span>
        ));
      })}
      {/* positioned actors */}
      {scene.actors
        .filter((a) => a.kind !== 'arrow' && a.kind !== 'flow')
        .map((a, i) => (
          <div
            key={a.id}
            className={`xactor xactor--${a.kind}`}
            style={{ animation: `xa-${uid}-${i} ${D}s linear ${delay(0, seek)} both`, zIndex: a.kind === 'art' || a.kind === 'shape' ? 1 : 2 }}
          >
            <Effects anim={a.anim} seek={seek}>
              <ActorBody a={a} W={W} H={H} fs={fs} clock={clock} paused={paused} />
            </Effects>
          </div>
        ))}
    </div>
  );
}

/** Looping / one-shot effects (pulse, beat, shake…) wrap the actor body. */
function Effects({ anim, seek, children }: { anim?: Anim[]; seek: number; children: React.ReactNode }) {
  const effects = (anim ?? []).filter((m) => m.effect && m.effect !== 'none');
  let node = <>{children}</>;
  for (const e of effects.reverse()) node = (
    <div className={`xfx xfx--${e.effect}`} style={{ animationDelay: delay(e.at, seek) }}>
      {node}
    </div>
  );
  return node;
}

function ActorBody({ a, W, H, fs, clock, paused }: { a: Actor; W: number; H: number; fs: (p: number) => string; clock: () => number; paused: boolean }) {
  switch (a.kind) {
    case 'emoji':
      return (
        <span className="xemoji" style={{ fontSize: fs(a.size ?? 10) }} aria-hidden="true">
          {a.emoji}
        </span>
      );
    case 'text':
      return (
        <span
          className={`xtext ${a.box ? 'xtext--box' : ''}`}
          dir={a.ltr ? 'ltr' : 'auto'}
          style={{ fontSize: fs(a.size ?? 4), color: a.box ? undefined : color(a.color, 'var(--ink)'), borderColor: a.box ? color(a.color, 'var(--accent)') : undefined }}
        >
          {a.ltr ? a.text : mixed(a.text)}
        </span>
      );
    case 'art':
      return (
        <div className="xart" style={{ width: (a.w / 100) * W }}>
          <Art name={a.art} highlight={a.highlight} frame={a.frame} />
        </div>
      );
    case 'math':
      return (
        <div className="xmath" style={{ width: (a.w / 100) * W }}>
          <MathView v={a.math} />
        </div>
      );
    case 'shape':
      return (
        <div
          className={`xshape xshape--${a.shape} ${a.outline ? 'xshape--outline' : ''}`}
          style={{ width: (a.w / 100) * W, height: (a.h / 100) * H, background: a.outline ? 'transparent' : color(a.color, 'var(--accent-soft)'), borderColor: color(a.color, 'var(--accent)'), fontSize: fs(3) }}
        >
          {a.label && <span>{mixed(a.label)}</span>}
        </div>
      );
    case 'counter':
      return <Counter a={a} fs={fs} clock={clock} paused={paused} />;
    default:
      return null;
  }
}

function Counter({ a, fs, clock, paused }: { a: Extract<Actor, { kind: 'counter' }>; fs: (p: number) => string; clock: () => number; paused: boolean }) {
  const [v, setV] = useState(a.from);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = clock() - (a.in ?? 0);
      const k = Math.max(0, Math.min(1, t / (a.dur ?? 2)));
      setV(a.from + (a.to - a.from) * k);
      if (!paused && k < 1) raf = requestAnimationFrame(tick);
    };
    tick();
    if (!paused) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [a, clock, paused]);
  const n = v.toFixed(a.decimals ?? 0);
  return (
    <span className="xcounter" style={{ fontSize: fs(a.size ?? 7) }}>
      {a.prefix}
      {a.arabic === false ? n : toArabicDigits(n)}
      {a.suffix}
    </span>
  );
}
