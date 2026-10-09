import { useEffect, useRef, useState } from 'react';
import { sfx } from '../audio/sound';

/** Real wall-clock countdown. Calls onTimeout exactly once when it reaches 0. */
export function useCountdown(seconds: number, running: boolean, resetKey: unknown, onTimeout: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const cb = useRef(onTimeout);
  cb.current = onTimeout;

  useEffect(() => {
    setRemaining(seconds);
  }, [resetKey, seconds]);

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const base = seconds;
    let lastWhole = Math.ceil(base);
    let fired = false;
    const id = window.setInterval(() => {
      const left = Math.max(0, base - (performance.now() - start) / 1000);
      setRemaining(left);
      const whole = Math.ceil(left);
      if (whole !== lastWhole) {
        lastWhole = whole;
        if (whole <= 5 && whole > 0) sfx('countdown');
      }
      if (left <= 0 && !fired) {
        fired = true;
        window.clearInterval(id);
        cb.current();
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [running, resetKey, seconds]);

  return remaining;
}

/** Points: base for a correct answer plus a speed bonus proportional to time left. */
export function speedScore(correct: boolean, remaining: number, total: number, base = 50, bonus = 50): number {
  if (!correct) return 0;
  return base + Math.round(Math.max(0, Math.min(1, remaining / total)) * bonus);
}
