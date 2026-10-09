import { useEffect, useSyncExternalStore } from 'react';
import { useSettings } from '../state/settings';

const query = '(prefers-reduced-motion: reduce)';
const subscribe = (fn: () => void) => {
  const m = window.matchMedia?.(query);
  m?.addEventListener?.('change', fn);
  return () => m?.removeEventListener?.('change', fn);
};
const systemReduced = () => window.matchMedia?.(query).matches ?? false;

/** True when motion should be minimized (OS setting, or the in-app override). */
export function useReducedMotion(): boolean {
  const pref = useSettings((s) => s.motion);
  const sys = useSyncExternalStore(subscribe, systemReduced, () => false);
  return pref === 'reduce' || (pref === 'system' && sys);
}

export function useReducedMotionClass() {
  const reduced = useReducedMotion();
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduced);
  }, [reduced]);
  return reduced;
}

export const spring = { type: 'spring', duration: 0.5, bounce: 0.2 } as const;
export const easeOut = [0.23, 1, 0.32, 1] as const;
