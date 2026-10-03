import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { play, setSoundEnabled, type SoundName } from '../lib/sound'
import { storage, useEnv } from '../lib/env'

export type Screen =
  | { name: 'landing' }
  | { name: 'map' }
  | { name: 'mission'; id: number }
  | { name: 'final' }
  | { name: 'film' }
  | { name: 'activities' }
  | { name: 'activity'; id: string }

export type TransitionKind = 'portal' | 'bubbles' | 'clouds'

export type Point = { x: number; y: number }

type Saved = {
  completed: Record<number, number>
  score: number
  sound: boolean
  mapNode: number
  name: string
  /** play-park activities: best stars (1–3) per activity id; a finished activity earns its sticker */
  activities: Record<string, number>
}

const KEY = 'smart-antibiotic-adventure:v1'
const EMPTY: Saved = { completed: {}, score: 0, sound: false, mapNode: 1, name: '', activities: {} }

export type Flight = { id: number; from: Point; delay: number }

type Game = {
  screen: Screen
  completed: Record<number, number>
  score: number
  sound: boolean
  mapNode: number
  name: string
  activities: Record<string, number>
  env: ReturnType<typeof useEnv>
  transition: { active: boolean; color: string; origin: Point; kind: TransitionKind; phase: 'in' | 'out' }
  flights: Flight[]
  scoreTarget: React.RefObject<HTMLDivElement | null>
  go: (screen: Screen, opts?: { color?: string; origin?: Point; kind?: TransitionKind }) => void
  addScore: (points: number, from?: Point, stars?: number) => void
  completeMission: (id: number, stars: number) => void
  completeActivity: (id: string, stars: number) => void
  setMapNode: (n: number) => void
  setName: (n: string) => void
  toggleSound: () => void
  sfx: (s: SoundName) => void
  reset: () => void
  landFlight: (id: number) => void
}

const Ctx = createContext<Game | null>(null)

export function useGame() {
  const g = useContext(Ctx)
  if (!g) throw new Error('useGame outside provider')
  return g
}

export const TOTAL_MISSIONS = 5

/** Highest mission the child may enter (1-based). */
export function unlockedUpTo(completed: Record<number, number>) {
  let n = 1
  while (completed[n] && n < TOTAL_MISSIONS) n++
  return n
}

export function GameProvider({ children }: { children: ReactNode }) {
  const env = useEnv()
  const [saved, setSaved] = useState<Saved>(() => ({ ...EMPTY, ...storage.get<Saved>(KEY, EMPTY) }))
  const [screen, setScreen] = useState<Screen>(() =>
    typeof location !== 'undefined' && (location.hash === '#film' || new URLSearchParams(location.search).has('record'))
      ? { name: 'film' }
      : typeof location !== 'undefined' && location.hash === '#play'
        ? { name: 'activities' }
        : { name: 'landing' },
  )
  // follow #film / #play when the address changes (shared links, back button)
  useEffect(() => {
    const onHash = () => {
      if (location.hash === '#film') setScreen({ name: 'film' })
      else if (location.hash === '#play') setScreen((cur) => (cur.name === 'activity' || cur.name === 'activities' ? cur : { name: 'activities' }))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  // keep a shareable #film link for the movie page
  useEffect(() => {
    const want = screen.name === 'film' ? '#film' : screen.name === 'activities' || screen.name === 'activity' ? '#play' : ''
    if (location.hash !== want) history.replaceState(null, '', location.pathname + location.search + want)
  }, [screen.name])
  const [transition, setTransition] = useState<Game['transition']>({
    active: false,
    color: '#2f5bea',
    origin: { x: 0, y: 0 },
    kind: 'portal',
    phase: 'in',
  })
  const [flights, setFlights] = useState<Flight[]>([])
  const scoreTarget = useRef<HTMLDivElement | null>(null)
  const flightId = useRef(0)
  const busy = useRef(false)

  useEffect(() => storage.set(KEY, saved), [saved])
  useEffect(() => setSoundEnabled(saved.sound), [saved.sound])

  const sfx = useCallback((s: SoundName) => play(s), [])

  const go: Game['go'] = useCallback(
    (next, opts) => {
      if (busy.current) return
      const origin = opts?.origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      const color = opts?.color ?? '#2f5bea'
      const kind = opts?.kind ?? 'portal'
      // Transition budget ~700ms total: cover 340ms, swap, reveal 360ms.
      const cover = env.reducedMotion ? 160 : 340
      busy.current = true
      play('whoosh')
      setTransition({ active: true, color, origin, kind, phase: 'in' })
      window.setTimeout(() => {
        setScreen(next)
        window.scrollTo({ top: 0 })
        setTransition((t) => ({ ...t, phase: 'out' }))
        window.setTimeout(() => {
          setTransition((t) => ({ ...t, active: false }))
          busy.current = false
        }, cover + 40)
      }, cover)
    },
    [env.reducedMotion],
  )

  const addScore: Game['addScore'] = useCallback((points, from, stars = 3) => {
    if (from) {
      const created: Flight[] = Array.from({ length: stars }, (_, i) => ({
        id: ++flightId.current,
        from: { x: from.x + (i - (stars - 1) / 2) * 26, y: from.y },
        delay: i * 0.08,
      }))
      setFlights((f) => [...f, ...created])
      // Score lands slightly after the stars start travelling.
      window.setTimeout(() => setSaved((s) => ({ ...s, score: s.score + points })), 520)
    } else {
      setSaved((s) => ({ ...s, score: s.score + points }))
    }
  }, [])

  const landFlight = useCallback((id: number) => {
    setFlights((f) => f.filter((x) => x.id !== id))
    play('star')
  }, [])

  const completeMission = useCallback((id: number, stars: number) => {
    setSaved((s) => ({ ...s, completed: { ...s.completed, [id]: Math.max(stars, s.completed[id] ?? 0) } }))
  }, [])

  const completeActivity = useCallback((id: string, stars: number) => {
    setSaved((s) => ({ ...s, activities: { ...s.activities, [id]: Math.max(stars, s.activities?.[id] ?? 0) } }))
  }, [])

  const value = useMemo<Game>(
    () => ({
      screen,
      completed: saved.completed,
      score: saved.score,
      sound: saved.sound,
      mapNode: saved.mapNode,
      name: saved.name,
      activities: saved.activities ?? {},
      env,
      transition,
      flights,
      scoreTarget,
      go,
      addScore,
      completeMission,
      completeActivity,
      landFlight,
      sfx,
      setMapNode: (n) => setSaved((s) => ({ ...s, mapNode: n })),
      setName: (n) => setSaved((s) => ({ ...s, name: n.slice(0, 40) })),
      toggleSound: () =>
        setSaved((s) => {
          const on = !s.sound
          setSoundEnabled(on)
          if (on) play('click')
          return { ...s, sound: on }
        }),
      reset: () => setSaved((s) => ({ ...EMPTY, sound: s.sound, name: s.name, activities: s.activities ?? {} })),
    }),
    [screen, saved, env, transition, flights, go, addScore, completeMission, completeActivity, landFlight, sfx],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
