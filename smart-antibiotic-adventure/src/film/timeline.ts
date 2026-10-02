import { createContext, useContext, useEffect, useRef } from 'react'
import dialogue from './dialogue.json'
import voiceMeta from './voice-meta.json'
import type { AleenMood } from './actors'

/**
 * The film timeline is built from the REAL length of every recorded line, so
 * dialogue never overlaps: each line starts at its scripted time or after the
 * previous line finishes plus a short natural pause, whichever is later.
 */

export type Speaker = 'aleen' | 'doctor' | 'capsule'
export type Look = 'viewer' | 'other'
export type TimedLine = {
  id: string
  who: Speaker
  text: string
  mood?: AleenMood
  look: Look
  start: number
  end: number
  mouth: string
}

type RawLine = { id: string; at: number; who: Speaker; text: string; say: string; mood?: string; look?: string }
type Meta = { who: string; voice: string; dur: number; mouth: string }

const META = voiceMeta as unknown as Record<string, Meta>
export const CAST = dialogue.cast as Record<Speaker, { name: string; gender: 'Female' | 'Male'; voice: string }>
export const SPEAKER_NAME: Record<Speaker, string> = { aleen: CAST.aleen.name, doctor: CAST.doctor.name, capsule: CAST.capsule.name }

const SAME_SPEAKER_GAP = 0.35
const TURN_GAP = 0.6 // listener reacts, then answers
const SCENE_TAIL = 1.2

export function buildLines(sceneKey: string): TimedLine[] {
  const raw = (dialogue.scenes as Record<string, RawLine[]>)[sceneKey] ?? []
  const out: TimedLine[] = []
  let prevEnd = -Infinity
  let prevWho: Speaker | null = null
  for (const l of raw) {
    const meta = META[l.id]
    if (!meta) throw new Error(`missing voice for ${l.id}`)
    // the generated voice must belong to this speaker (guards against mix-ups)
    if (meta.who !== l.who || meta.voice !== CAST[l.who].voice) throw new Error(`voice mismatch for ${l.id}`)
    const gap = prevWho === l.who ? SAME_SPEAKER_GAP : TURN_GAP
    const start = Math.max(l.at, prevEnd + gap)
    const end = start + meta.dur
    out.push({ id: l.id, who: l.who, text: l.text, mood: l.mood as AleenMood | undefined, look: (l.look as Look) ?? 'viewer', start, end, mouth: meta.mouth })
    prevEnd = end
    prevWho = l.who
  }
  return out
}

export function sceneLength(base: number, lines: TimedLine[]) {
  const last = lines[lines.length - 1]
  return Math.max(base, last ? last.end + SCENE_TAIL : base)
}

/* ------------------------------------------------------------------ */
/*  Lip-sync + per-frame helpers shared by every character             */
/* ------------------------------------------------------------------ */

export type Speech = { id?: string; start: number; mouth: string } | null

/** Global film clock (seconds). Characters read it every frame. */
export const FilmClock = createContext<() => number>(() => performance.now() / 1000)

/** Mouth openness 0..1 from the speaker's own audio envelope (40 ms frames). */
export function mouthAt(speech: Speech, t: number) {
  if (!speech) return 0
  const i = Math.floor((t - speech.start) / 0.04)
  if (i < 0 || i >= speech.mouth.length) return 0
  // interpolate between frames for smooth motion
  const a = +speech.mouth[i] / 9
  const b = i + 1 < speech.mouth.length ? +speech.mouth[i + 1] / 9 : 0
  const f = (t - speech.start) / 0.04 - i
  return a + (b - a) * f
}

/** Run `fn(filmTime, wallTime)` every animation frame. */
export function useFrame(fn: (t: number, wall: number) => void) {
  const now = useContext(FilmClock)
  const ref = useRef(fn)
  useEffect(() => {
    ref.current = fn
  })
  useEffect(() => {
    let raf = 0
    const loop = (w: number) => {
      ref.current(now(), w / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [now])
}

/** Natural random blinking: returns lid closure 0..1 for a wall-clock time. */
export function makeBlinker(seed = 0) {
  let next = 1.2 + (seed % 7) * 0.37
  let startAt = -1
  return (wall: number, force = false) => {
    if (startAt < 0 && (wall >= next || force)) startAt = wall
    if (startAt >= 0) {
      const p = (wall - startAt) / 0.16
      if (p >= 1) {
        startAt = -1
        // occasional double blink, otherwise 2.2–5.5 s apart
        next = wall + (Math.random() < 0.15 ? 0.25 : 2.2 + Math.random() * 3.3)
        return 0
      }
      return p < 0.45 ? p / 0.45 : 1 - (p - 0.45) / 0.55
    }
    return 0
  }
}

/** Smoothly approach a target (critically damped-ish). */
export function approach(cur: number, target: number, dt: number, speed = 10) {
  return cur + (target - cur) * (1 - Math.exp(-speed * dt))
}
