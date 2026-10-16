import { useEffect, useState } from 'react'
import { useProfile } from './store'

function useOsReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** True when the learner (or the operating system, in "system" mode) prefers reduced motion. */
export function useReduced() {
  const pref = useProfile(p => p.settings.motion)
  const os = useOsReducedMotion()
  return pref === 'reduced' || (pref === 'system' && os)
}

/** Animation speed multiplier: durations should be divided by this. */
export function useSpeed() {
  return useProfile(p => p.settings.speed)
}

/** Duration helper honouring speed and reduced motion (seconds). */
export function useDur() {
  const reduced = useReduced()
  const speed = useSpeed()
  return (s: number) => (reduced ? 0 : s / speed)
}
