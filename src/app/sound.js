/* ==========================================================================
   Sounds. Small, soft sounds made in the browser with the Web Audio API (no
   audio files): a tap for buttons, a pop for messages, a chime for correct
   answers, a little fanfare for celebrations and a whoosh between steps.
   They only play after the learner interacts, stay quiet in volume, and the
   speaker button in the header turns them off (remembered on this device).
   ========================================================================== */
const Sound = (() => {
  const KEY = 'omantel-clickup-hub:sound';
  let on = true, ctx = null, last = {}, hush = 0;
  try { on = window.localStorage.getItem(KEY) !== 'off'; } catch (e) { /* default on */ }
  const audio = () => {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { ctx = new AC(); } catch (e) { ctx = null; }
    return ctx;
  };
  function tone(freq, t0, dur, type, vol, to) {
    const c = ctx; const o = c.createOscillator(); const g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0); if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(t0, dur, vol) {
    const c = ctx; const len = Math.floor(c.sampleRate * dur); const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(600, t0); f.frequency.exponentialRampToValueAtTime(2400, t0 + dur); f.Q.value = 0.9;
    const g = c.createGain(); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(c.destination); src.start(t0);
  }
  const SOUNDS = {
    tap: t => tone(620, t, 0.05, 'triangle', 0.035, 520),
    toggle: t => { tone(520, t, 0.06, 'sine', 0.05); tone(780, t + 0.06, 0.08, 'sine', 0.05); },
    pop: t => tone(380, t, 0.09, 'sine', 0.07, 900),
    like: t => { tone(660, t, 0.07, 'sine', 0.06, 990); tone(1320, t + 0.07, 0.09, 'sine', 0.04); },
    whoosh: t => noise(t, 0.18, 0.05),
    success: t => [523.25, 659.25, 783.99].forEach((f, i) => tone(f, t + i * 0.075, 0.16, 'triangle', 0.06)),
    party: t => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.09, i === 3 ? 0.35 : 0.18, 'triangle', 0.07)),
    error: t => { tone(240, t, 0.12, 'square', 0.025, 200); tone(200, t + 0.12, 0.14, 'square', 0.02, 170); }
  };
  function play(name) {
    if (!on || hush > 0 || !SOUNDS[name]) return;
    const now = performance.now(); if (last[name] && now - last[name] < 90) return; last[name] = now;
    const c = audio(); if (!c) return;
    if (c.state === 'suspended') c.resume();
    try { SOUNDS[name](c.currentTime + 0.01); } catch (e) { /* never break the page for a sound */ }
  }
  function set(v) { on = v; try { window.localStorage.setItem(KEY, v ? 'on' : 'off'); } catch (e) { /* per-viewer convenience */ } if (v) play('toggle'); }
  /* Silence sounds while the page re-renders (for example a language switch). */
  function quiet(fn) { hush++; try { return fn(); } finally { setTimeout(() => { hush--; }, 50); } }
  return { play, set, quiet, get on() { return on; } };
})();
