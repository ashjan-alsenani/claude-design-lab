import { useEffect, useRef } from 'react';
import { createMemoryStore } from '../state/store';
import { useReducedMotion } from '../lib/motion';

type Burst = { id: number; kind: 'confetti' | 'sparkles'; x: number; y: number; power: number };

const bursts = createMemoryStore<Burst[]>(() => []);
let seq = 0;

/** Fire a celebration. x/y are viewport fractions (0–1). */
export function celebrate(kind: Burst['kind'] = 'confetti', x = 0.5, y = 0.45, power = 1) {
  bursts.set((b) => [...b, { id: ++seq, kind, x, y, power }]);
}

const COLORS = ['#ffd66e', '#f5c048', '#f8a8cb', '#c2a9fb', '#7fe3dc', '#ffbfa8', '#ffffff'];

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
  shape: 0 | 1 | 2;
}

export function ConfettiLayer() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let parts: P[] = [];
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (b: Burst) => {
      const n = Math.round((reduced ? 18 : b.kind === 'confetti' ? 140 : 46) * b.power);
      const cx = b.x * window.innerWidth;
      const cy = b.y * window.innerHeight;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = b.kind === 'confetti' ? 6 + Math.random() * 10 : 2 + Math.random() * 5;
        parts.push({
          x: cx,
          y: cy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - (b.kind === 'confetti' ? 7 : 2),
          r: b.kind === 'confetti' ? 4 + Math.random() * 5 : 2 + Math.random() * 3,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life: b.kind === 'confetti' ? 160 + Math.random() * 60 : 60 + Math.random() * 40,
          shape: b.kind === 'sparkles' ? 2 : (Math.floor(Math.random() * 2) as 0 | 1),
        });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      parts = parts.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
      for (const p of parts) {
        p.vy += p.shape === 2 ? 0.05 : 0.22;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 0) ctx.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9);
        else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // four-point sparkle
          const s = p.r * 2;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        }
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
      if (!raf) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    const unsub = bursts.subscribe(() => {
      const list = bursts.get();
      if (!list.length) return;
      list.forEach(spawn);
      bursts.set([]);
    });
    return () => {
      unsub();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduced]);

  return <canvas ref={ref} aria-hidden style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 80 }} />;
}
