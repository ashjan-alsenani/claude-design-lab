import type { CSSProperties } from 'react';

/** Circular progress: fills once when it appears. */
export function Ring({ value, label, size }: { value: number; label: string; size?: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" role="img" aria-label={label} style={size ? { width: size, height: size } : undefined}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="ring__track" />
        <circle cx="32" cy="32" r={r} className="ring__fill" style={{ strokeDasharray: c, '--ring-off': c * (1 - value / 100), '--ring-c': c } as CSSProperties} />
      </svg>
      <span className="ring__value">{value}%</span>
    </div>
  );
}

