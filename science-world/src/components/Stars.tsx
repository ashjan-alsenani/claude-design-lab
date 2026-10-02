/** 0–3 stars. `animate` pops them in one after another (reward screens). */
export function Stars({ count, max = 3, size = 'md', animate = false }: { count: number; max?: number; size?: 'sm' | 'md' | 'lg'; animate?: boolean }) {
  return (
    <span className={`stars stars--${size} ${animate ? 'stars--animate' : ''}`} aria-label={`${count} من ${max} نجوم`} role="img">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star ${i < count ? 'star--on' : ''}`} style={{ animationDelay: `${300 + i * 260}ms` }}>
          ★
        </span>
      ))}
    </span>
  );
}
