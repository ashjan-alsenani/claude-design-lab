import confetti from 'canvas-confetti';

const colors = ['#ffc83d', '#ff6b6b', '#2fbf71', '#5b5bf7', '#19c3d6', '#9b5de5'];

function reduced() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function burst(origin = { x: 0.5, y: 0.6 }) {
  if (reduced()) return;
  void confetti({ particleCount: 70, spread: 75, startVelocity: 38, origin, colors, scalar: 0.9, disableForReducedMotion: true });
}

export function celebrate() {
  if (reduced()) return;
  const end = Date.now() + 1400;
  const frame = () => {
    void confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
    void confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
