import { useCallback, useEffect, useRef, useState } from 'react';

export interface CuePoint {
  id: string;
  at: number;
}

/** First unanswered cue in (from, to]. Seeking/playing past it must stop there. */
export function cueBetween<T extends CuePoint>(from: number, to: number, cues: T[], answered: Set<string>): T | null {
  for (const c of cues) if (!answered.has(c.id) && c.at > from && c.at <= to) return c;
  return null;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** 0→1 progress of t between a and b. */
export const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
/** Fade in over `fade`s after `a`, fade out before `b`. */
export const window01 = (t: number, a: number, b: number, fade = 0.6) => Math.min(ramp(t, a, a + fade), 1 - ramp(t, b - fade, b));

/**
 * A master clock for the film. Advances with requestAnimationFrame while playing,
 * halts exactly on unanswered cue points, and refuses to seek past them.
 */
export function useTimeline<T extends CuePoint>(duration: number, cues: T[]) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeCue, setActiveCue] = useState<T | null>(null);
  const answered = useRef(new Set<string>());
  const timeRef = useRef(0);
  const raf = useRef(0);

  const stopAt = useCallback(
    (t: number, cue: T | null) => {
      timeRef.current = t;
      setTime(t);
      if (cue) {
        setPlaying(false);
        setActiveCue(cue);
      }
    },
    [],
  );

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const from = timeRef.current;
      const to = Math.min(duration, from + dt);
      const cue = cueBetween(from, to, cues, answered.current);
      if (cue) {
        stopAt(cue.at, cue);
        return;
      }
      timeRef.current = to;
      setTime(to);
      if (to >= duration) {
        setPlaying(false);
        return;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, duration, cues, stopAt]);

  const play = useCallback(() => {
    if (activeCue) return;
    if (timeRef.current >= duration) {
      timeRef.current = 0;
      setTime(0);
    }
    setPlaying(true);
  }, [activeCue, duration]);

  const pause = useCallback(() => setPlaying(false), []);

  const seek = useCallback(
    (t: number) => {
      const target = Math.max(0, Math.min(duration, t));
      const cue = target > timeRef.current ? cueBetween(timeRef.current, target, cues, answered.current) : null;
      if (cue) stopAt(cue.at, cue);
      else stopAt(target, null);
    },
    [cues, duration, stopAt],
  );

  const resolveCue = useCallback(() => {
    if (!activeCue) return;
    answered.current.add(activeCue.id);
    setActiveCue(null);
    setPlaying(true);
  }, [activeCue]);

  return { time, playing, activeCue, play, pause, seek, resolveCue, answered: answered.current, ended: time >= duration };
}
