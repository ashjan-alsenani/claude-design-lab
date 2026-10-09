/**
 * Wheel geometry. Segment i covers [i·w, (i+1)·w) degrees, measured clockwise
 * from 12 o'clock in the wheel's own frame. The pointer is fixed at 12 o'clock.
 */
export function segmentAt(rotationDeg: number, count: number): number {
  const w = 360 / count;
  const local = (((360 - (rotationDeg % 360)) % 360) + 360) % 360;
  return Math.floor(local / w) % count;
}

/** A random target rotation: several full turns plus a random landing angle. */
export function spinTarget(current: number, rng: () => number = Math.random, minTurns = 5): number {
  const turns = minTurns + Math.floor(rng() * 3);
  return current + turns * 360 + rng() * 360;
}

/** Ease-out quart — fast start, long graceful slowdown. */
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
