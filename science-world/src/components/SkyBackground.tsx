/** Soft living background: drifting clouds and twinkling sparkles (decorative, CSS-only). */
export function SkyBackground() {
  return (
    <div className="sky" aria-hidden="true">
      <span className="cloud cloud--1" />
      <span className="cloud cloud--2" />
      <span className="cloud cloud--3" />
      {[
        [8, 22],
        [86, 14],
        [70, 38],
        [18, 64],
        [92, 72],
        [44, 10],
      ].map(([x, y], i) => (
        <span key={i} className="spark" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.7}s` }}>
          ✦
        </span>
      ))}
    </div>
  );
}
