import type { ReactNode } from 'react';

interface Props {
  value: number; // 0–100
  label?: string;
  tone?: 'accent' | 'sun' | 'good';
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, label, tone = 'accent', size = 'md' }: Props) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`pbar pbar--${tone} pbar--${size}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-label={label}
    >
      <div className="pbar__fill" style={{ transform: `scaleX(${v / 100})` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 120, stroke = 14, children, color = 'var(--accent)' }: { value: number; size?: number; stroke?: number; children?: ReactNode; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sky-2)" strokeWidth={stroke} />
        <circle
          className="ring__arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring__label">{children}</div>
    </div>
  );
}
