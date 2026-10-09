/**
 * Original sound design, synthesized live with the Web Audio API.
 * No audio files, no licensing concerns, nothing loads until the first user gesture.
 */
import { settingsStore } from '../state/settings';

export type Sfx =
  | 'tap'
  | 'pick'
  | 'drop'
  | 'correct'
  | 'wrong'
  | 'gem'
  | 'open'
  | 'whoosh'
  | 'tick'
  | 'countdown'
  | 'timeout'
  | 'stamp'
  | 'fanfare'
  | 'unlock';

const NOTE = (semitonesFromA4: number) => 440 * Math.pow(2, semitonesFromA4 / 12);

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private delay!: DelayNode;
  private noise!: AudioBuffer;
  private musicTimer: number | null = null;
  private nextChordAt = 0;
  private chordIndex = 0;

  /** Must be called from a user gesture at least once. */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    this.master.connect(comp).connect(ctx.destination);

    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = 0.55;
    this.sfxBus.connect(this.master);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0;
    this.musicBus.connect(this.master);

    // A soft feedback delay doubles as a tiny "room" for bells and music.
    this.delay = ctx.createDelay(1);
    this.delay.delayTime.value = 0.32;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2400;
    this.delay.connect(tone).connect(fb).connect(this.delay);
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    tone.connect(wet).connect(this.master);

    const len = ctx.sampleRate;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  private tone(
    freq: number,
    at: number,
    dur: number,
    { type = 'sine' as OscillatorType, gain = 0.2, glideTo = 0, bus = this.sfxBus, send = 0 } = {},
  ) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, at + dur);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(g).connect(bus);
    if (send) {
      const s = ctx.createGain();
      s.gain.value = send;
      g.connect(s).connect(this.delay);
    }
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  private bell(freq: number, at: number, gain = 0.14, dur = 1.1, bus = this.sfxBus) {
    this.tone(freq, at, dur, { type: 'sine', gain, bus, send: 0.6 });
    this.tone(freq * 2.01, at, dur * 0.5, { type: 'sine', gain: gain * 0.35, bus, send: 0.4 });
    this.tone(freq * 3.98, at, dur * 0.25, { type: 'sine', gain: gain * 0.12, bus });
  }

  private noiseBurst(at: number, dur: number, from: number, to: number, gain = 0.12, q = 1.2) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = q;
    bp.frequency.setValueAtTime(from, at);
    bp.frequency.exponentialRampToValueAtTime(to, at + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(bp).connect(g).connect(this.sfxBus);
    src.start(at, Math.random() * 0.5);
    src.stop(at + dur + 0.05);
  }

  play(name: Sfx, opts: { pitch?: number } = {}) {
    if (!settingsStore.get().sfx) return;
    this.unlock();
    if (!this.ctx || this.ctx.state !== 'running') {
      void this.ctx?.resume();
      if (!this.ctx) return;
    }
    const t = this.ctx.currentTime + 0.005;
    const p = opts.pitch ?? 1;
    switch (name) {
      case 'tap':
        this.tone(NOTE(15) * p, t, 0.09, { type: 'sine', gain: 0.08, glideTo: NOTE(10) * p });
        break;
      case 'pick':
        this.tone(NOTE(10), t, 0.12, { type: 'triangle', gain: 0.08, glideTo: NOTE(17) });
        break;
      case 'drop':
        this.tone(NOTE(5), t, 0.14, { type: 'sine', gain: 0.12, glideTo: NOTE(-2) });
        break;
      case 'correct':
        this.bell(NOTE(19), t, 0.12);
        this.bell(NOTE(26), t + 0.09, 0.1);
        break;
      case 'wrong':
        this.tone(NOTE(-2), t, 0.22, { type: 'triangle', gain: 0.09, glideTo: NOTE(-6) });
        this.tone(NOTE(-7), t + 0.12, 0.3, { type: 'triangle', gain: 0.07 });
        break;
      case 'gem':
        [0, 4, 7, 12, 16].forEach((s, i) => this.bell(NOTE(27 + s), t + i * 0.065, 0.08, 0.9));
        break;
      case 'unlock':
        [0, 7, 12].forEach((s, i) => this.bell(NOTE(15 + s), t + i * 0.11, 0.09, 1.2));
        this.noiseBurst(t, 0.6, 1200, 6000, 0.03, 0.8);
        break;
      case 'open':
        this.noiseBurst(t, 0.7, 400, 4000, 0.07);
        this.tone(NOTE(3), t, 0.7, { type: 'sine', gain: 0.07, glideTo: NOTE(22), send: 0.5 });
        break;
      case 'whoosh':
        this.noiseBurst(t, 0.55, 300, 2600, 0.09, 0.9);
        break;
      case 'tick':
        this.tone(1900 * p, t, 0.03, { type: 'square', gain: 0.025 });
        break;
      case 'countdown':
        this.tone(NOTE(12), t, 0.08, { type: 'triangle', gain: 0.07 });
        break;
      case 'timeout':
        this.tone(NOTE(0), t, 0.25, { type: 'triangle', gain: 0.09 });
        this.tone(NOTE(-5), t + 0.18, 0.4, { type: 'triangle', gain: 0.08 });
        break;
      case 'stamp':
        this.tone(140, t, 0.18, { type: 'sine', gain: 0.25, glideTo: 60 });
        this.noiseBurst(t, 0.12, 900, 300, 0.08, 0.7);
        break;
      case 'fanfare':
        [
          [0, 0],
          [4, 0.14],
          [7, 0.28],
          [12, 0.42],
          [16, 0.62],
          [19, 0.62],
          [24, 0.62],
        ].forEach(([s, d]) => this.bell(NOTE(15 + s), t + d, 0.09, 1.6));
        break;
    }
  }

  /* ───────────── generative ambient music ───────────── */

  private static CHORDS = [
    [-7, -3, 0, 4], // D maj7 colour (D F# A C#) relative to A4 = 0 → shifted below
    [-10, -5, -3, 2], // B m7
    [-14, -10, -7, -3], // G maj7
    [-12, -8, -5, 0], // A6-ish
  ];
  private static SCALE = [5, 7, 9, 12, 14, 17, 19, 21]; // D-major pentatonic bells

  setMusic(on: boolean) {
    this.unlock();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setTargetAtTime(on ? 0.32 : 0, now, on ? 1.2 : 0.4);
    if (on && this.musicTimer === null) {
      this.nextChordAt = now + 0.1;
      this.musicTimer = window.setInterval(() => this.scheduleMusic(), 400);
      this.scheduleMusic();
    } else if (!on && this.musicTimer !== null) {
      const id = this.musicTimer;
      this.musicTimer = null;
      window.setTimeout(() => window.clearInterval(id), 50);
    }
  }

  private scheduleMusic() {
    const ctx = this.ctx;
    if (!ctx || this.musicTimer === null) return;
    const chordLen = 6.4;
    while (this.nextChordAt < ctx.currentTime + 1.5) {
      const at = this.nextChordAt;
      const chord = SoundEngine.CHORDS[this.chordIndex % SoundEngine.CHORDS.length];
      chord.forEach((s, i) => this.pad(NOTE(s - 5), at + i * 0.05, chordLen + 1.5));
      // sparse bell melody above the pad
      for (let b = 0; b < 4; b++) {
        if (Math.random() < 0.55) {
          const n = SoundEngine.SCALE[Math.floor(Math.random() * SoundEngine.SCALE.length)];
          this.bell(NOTE(n), at + 0.8 + b * 1.45 + Math.random() * 0.2, 0.045, 2.2, this.musicBus);
        }
      }
      this.nextChordAt += chordLen;
      this.chordIndex++;
    }
  }

  private pad(freq: number, at: number, dur: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(0.05, at + 2.2);
    g.gain.setValueAtTime(0.05, at + dur - 2.4);
    g.gain.linearRampToValueAtTime(0.0001, at + dur);
    lp.connect(g).connect(this.musicBus);
    for (const detune of [-6, 6]) {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = freq;
      o.detune.value = detune;
      o.connect(lp);
      o.start(at);
      o.stop(at + dur + 0.1);
    }
  }
}

export const sound = new SoundEngine();
export const sfx = (name: Sfx, opts?: { pitch?: number }) => sound.play(name, opts);
