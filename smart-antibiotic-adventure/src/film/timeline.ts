import { createContext, useContext, useEffect, useRef } from 'react'
import dialogue from './dialogue.json'
import voiceMeta from './voice-meta.json'
import type { AleenMood } from './actors'

/**
 * The film timeline is built from the REAL length of every recorded line, so
 * dialogue never overlaps: each line starts at its scripted time or after the
 * previous line finishes plus a short natural pause, whichever is later.
 * tools/build_music.py mirrors this logic to place the music ducking.
 */

export type Speaker = 'aleen' | 'doctor' | 'capsule'
export type Look = 'viewer' | 'other' | 'visual'
export type TimedLine = {
  id: string
  who: Speaker
  text: string
  mood?: AleenMood
  look: Look
  start: number
  end: number
  mouth: string
  shape: string
}

type RawLine = { id: string; at: number; who: Speaker; text: string; say: string; mood?: string; look?: string }
type Meta = { who: string; voice: string; dur: number; mouth: string; shape: string }

const META = voiceMeta as unknown as Record<string, Meta>
export const CAST = dialogue.cast as Record<Speaker, { name: string; gender: 'Female' | 'Male'; voice: string }>
export const SPEAKER_NAME: Record<Speaker, string> = { aleen: CAST.aleen.name, doctor: CAST.doctor.name, capsule: CAST.capsule.name }
export const SCENE_DUR = dialogue.sceneDur as Record<string, number>

/** lip-sync frame length (s) — matches tools/generate_voices.py */
export const FRAME = 0.02
const SAME_SPEAKER_GAP = 0.4
const TURN_GAP = 0.75 // the listener reacts (nod, smile), then answers
const SCENE_TAIL = 1.4

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
    out.push({ id: l.id, who: l.who, text: l.text, mood: l.mood as AleenMood | undefined, look: (l.look as Look) ?? 'viewer', start, end, mouth: meta.mouth, shape: meta.shape })
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

/** A character's own line, in global film time. */
export type Speech = { id: string; start: number; end: number; mouth: string; shape: string } | null
/** What a listener knows about the line being spoken to them. */
export type Heard = { id: string; start: number; end: number } | null

/** Global film clock (seconds). Characters read it every frame. */
export const FilmClock = createContext<() => number>(() => performance.now() / 1000)

function track(s: string, t: number, rest: number) {
  const x = t / FRAME
  const i = Math.floor(x)
  if (i < 0 || i >= s.length) return rest
  const a = +s[i] / 9
  const b = i + 1 < s.length ? +s[i + 1] / 9 : rest
  return a + (b - a) * (x - i)
}
/** Mouth openness 0..1 from the speaker's own audio (jaw height × loudness). */
export function mouthAt(speech: Speech, t: number) {
  return speech ? track(speech.mouth, t - speech.start, 0) : 0
}
/** Lip shape 0..1: 0 rounded (u/o) · 0.5 neutral · 1 spread (i/e). */
export function shapeAt(speech: Speech, t: number) {
  return speech ? track(speech.shape, t - speech.start, 0.5) : 0.5
}

/** Phrases inside a line (speech between pauses), local seconds. Cached per line. */
const phraseCache = new Map<string, { s: number; e: number; peak: number }[]>()
export function phrases(speech: NonNullable<Speech>) {
  let p = phraseCache.get(speech.id)
  if (p) return p
  p = []
  const m = speech.mouth
  let quiet = 99
  let cur: { s: number; e: number; peak: number } | null = null
  for (let i = 0; i < m.length; i++) {
    const v = +m[i]
    if (v >= 2) {
      if (!cur || quiet >= 11) {
        cur = { s: i * FRAME, e: i * FRAME, peak: 0 }
        p.push(cur)
      }
      cur.e = i * FRAME
      cur.peak = Math.max(cur.peak, v)
      quiet = 0
    } else quiet++
  }
  phraseCache.set(speech.id, p)
  return p
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
      const p = (wall - startAt) / 0.17
      if (p >= 1) {
        startAt = -1
        // occasional double blink, otherwise 2.4–5.5 s apart
        next = wall + (Math.random() < 0.15 ? 0.28 : 2.4 + Math.random() * 3.1)
        return 0
      }
      return p < 0.42 ? p / 0.42 : 1 - (p - 0.42) / 0.58
    }
    return 0
  }
}

/** Smoothly approach a target (critically damped-ish). */
export function approach(cur: number, target: number, dt: number, speed = 10) {
  return cur + (target - cur) * (1 - Math.exp(-speed * dt))
}

/** A soft, decaying head-nod impulse: call kick() to start one; value() → 0..1..0. */
export function makeNod() {
  let at = -99
  let amp = 0
  return {
    kick(wall: number, a = 1) {
      if (wall - at > 0.55) {
        at = wall
        amp = a
      }
    },
    value(wall: number) {
      const p = (wall - at) / 0.62
      if (p < 0 || p > 1) return 0
      return amp * Math.sin(p * Math.PI) * (1 - p * 0.35)
    },
    since: (wall: number) => wall - at,
  }
}

/** Deterministic pseudo-random 0..1 from a string + index (stable gestures per line). */
export function hash01(s: string, k = 0) {
  let h = 2166136261 ^ k
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return ((h >>> 0) % 10000) / 10000
}
