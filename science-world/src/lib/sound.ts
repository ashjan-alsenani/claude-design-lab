/**
 * Tiny synthesized sound effects (Web Audio) — no audio files to download.
 * Sounds are optional: nothing plays until the child presses a button,
 * and the global toggle in the top bar turns them off.
 * To use recorded sounds later, replace `play` with HTMLAudioElement playback.
 */
export type SoundName = 'tap' | 'correct' | 'wrong' | 'star' | 'achievement' | 'level' | 'flip' | 'drop';

let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const recipes: Record<SoundName, () => void> = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.06),
  flip: () => {
    tone(520, 0, 0.06, 'triangle', 0.05);
    tone(780, 0.05, 0.08, 'triangle', 0.05);
  },
  drop: () => tone(440, 0, 0.1, 'sine', 0.08),
  correct: () => {
    tone(784, 0, 0.12, 'triangle');
    tone(1047, 0.1, 0.2, 'triangle');
  },
  wrong: () => {
    // soft "hmm", never a buzzer
    tone(392, 0, 0.14, 'sine', 0.07);
    tone(349, 0.12, 0.2, 'sine', 0.06);
  },
  star: () => {
    [1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.07, 0.18, 'sine', 0.08));
  },
  achievement: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.09));
  },
  level: () => {
    [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.35, 'triangle', 0.1));
  },
};

export function play(name: SoundName) {
  if (!enabled) return;
  try {
    recipes[name]();
  } catch {
    /* audio unavailable — silently ignore */
  }
}
