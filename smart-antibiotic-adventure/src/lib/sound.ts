/**
 * Sound-ready layer. Every sound moment in the app calls `play(name)`.
 * Sounds are synthesised with the Web Audio API so the app ships with no
 * audio files; swap any entry in `PATTERNS` for a real sample later by
 * replacing the body of `play`. Nothing in the experience depends on sound.
 */
export type SoundName =
  | 'click'
  | 'star'
  | 'correct'
  | 'wrong'
  | 'piece'
  | 'mission'
  | 'celebrate'
  | 'whoosh'
  | 'pop'

type Note = { f: number; t: number; d: number; type?: OscillatorType; g?: number }

const PATTERNS: Record<SoundName, Note[]> = {
  click: [{ f: 660, t: 0, d: 0.06, type: 'triangle', g: 0.12 }],
  pop: [{ f: 520, t: 0, d: 0.05, type: 'sine', g: 0.14 }, { f: 880, t: 0.03, d: 0.05, type: 'sine', g: 0.08 }],
  star: [
    { f: 1318, t: 0, d: 0.09, type: 'triangle', g: 0.1 },
    { f: 1760, t: 0.07, d: 0.14, type: 'triangle', g: 0.1 },
  ],
  correct: [
    { f: 523, t: 0, d: 0.1, type: 'triangle' },
    { f: 659, t: 0.08, d: 0.1, type: 'triangle' },
    { f: 784, t: 0.16, d: 0.1, type: 'triangle' },
    { f: 1046, t: 0.24, d: 0.22, type: 'triangle' },
  ],
  wrong: [
    { f: 330, t: 0, d: 0.12, type: 'sine', g: 0.12 },
    { f: 262, t: 0.1, d: 0.2, type: 'sine', g: 0.1 },
  ],
  piece: [
    { f: 784, t: 0, d: 0.08, type: 'sine' },
    { f: 1175, t: 0.06, d: 0.25, type: 'sine', g: 0.12 },
  ],
  whoosh: [{ f: 200, t: 0, d: 0.25, type: 'sawtooth', g: 0.03 }],
  mission: [
    { f: 523, t: 0, d: 0.12, type: 'square', g: 0.06 },
    { f: 659, t: 0.12, d: 0.12, type: 'square', g: 0.06 },
    { f: 784, t: 0.24, d: 0.12, type: 'square', g: 0.06 },
    { f: 1046, t: 0.36, d: 0.4, type: 'triangle', g: 0.14 },
  ],
  celebrate: [
    { f: 523, t: 0, d: 0.12, type: 'triangle' },
    { f: 659, t: 0.1, d: 0.12, type: 'triangle' },
    { f: 784, t: 0.2, d: 0.12, type: 'triangle' },
    { f: 1046, t: 0.3, d: 0.16, type: 'triangle' },
    { f: 784, t: 0.46, d: 0.1, type: 'triangle' },
    { f: 1046, t: 0.56, d: 0.5, type: 'triangle', g: 0.16 },
  ],
}

let ctx: AudioContext | null = null
let enabled = false

export function setSoundEnabled(on: boolean) {
  enabled = on
  if (on) ensureCtx()
}

function ensureCtx() {
  if (ctx) return ctx
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  try {
    ctx = new AC()
  } catch {
    ctx = null
  }
  return ctx
}

export function play(name: SoundName) {
  if (!enabled) return
  const ac = ensureCtx()
  if (!ac) return
  if (ac.state === 'suspended') void ac.resume()
  const now = ac.currentTime
  for (const n of PATTERNS[name]) {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = n.type ?? 'sine'
    osc.frequency.setValueAtTime(n.f, now + n.t)
    if (name === 'whoosh') osc.frequency.exponentialRampToValueAtTime(900, now + n.t + n.d)
    const peak = n.g ?? 0.13
    gain.gain.setValueAtTime(0.0001, now + n.t)
    gain.gain.exponentialRampToValueAtTime(peak, now + n.t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d)
    osc.connect(gain).connect(ac.destination)
    osc.start(now + n.t)
    osc.stop(now + n.t + n.d + 0.05)
  }
}
