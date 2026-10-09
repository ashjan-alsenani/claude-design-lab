/** Circular countdown. `remaining` and `total` in seconds. */
export function TimerRing({ remaining, total, size = 76 }: { remaining: number; total: number; size?: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, remaining / total));
  const urgent = remaining <= 5;
  return (
    <div className="timer-ring" data-urgent={urgent} style={{ width: size, height: size }} role="timer" aria-label={`الوقت المتبقي ${Math.ceil(remaining)} ثانية`}>
      <svg viewBox="0 0 72 72" width={size} height={size} aria-hidden>
        <circle cx="36" cy="36" r={r} fill="rgb(255 255 255 / .12)" stroke="rgb(255 255 255 / .2)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={urgent ? '#ff9f87' : '#ffd66e'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <span className="num">{Math.ceil(remaining)}</span>
    </div>
  );
}
