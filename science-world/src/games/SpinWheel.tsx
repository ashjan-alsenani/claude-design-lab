import { useState } from 'react';
import type { Lesson, Question } from '../data/types';
import { QuestionCard } from '../activities/QuestionCard';
import { useProgress } from '../state/ProgressContext';
import { play } from '../lib/sound';

const colors = ['#ff6b6b', '#ffc83d', '#2fbf71', '#19c3d6', '#5b5bf7', '#9b5de5', '#ff8a3d', '#e86fb0'];

/** 🎡 Spin the wheel → land on a learned lesson → answer one of its questions. */
export function SpinWheel({ lessons }: { lessons: Lesson[] }) {
  const { recordAnswer, addCoins } = useProgress();
  const segs = lessons.slice(-8);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<{ lesson: Lesson; q: Question } | null>(null);
  const [round, setRound] = useState(0);
  const n = segs.length;
  const slice = 360 / n;

  function spin() {
    if (spinning || n === 0) return;
    play('tap');
    setPicked(null);
    const target = Math.floor(Math.random() * n);
    // pointer is at the top; segment i spans [i*slice, (i+1)*slice) clockwise from top
    const end = 360 * 5 + (360 - (target * slice + slice / 2));
    const next = angle - (angle % 360) + end;
    setSpinning(true);
    setAngle(next);
    window.setTimeout(() => {
      setSpinning(false);
      play('star');
      const l = segs[target];
      setPicked({ lesson: l, q: l.quiz[Math.floor(Math.random() * l.quiz.length)] });
      setRound((r) => r + 1);
    }, 3200);
  }

  const r = 140;
  const path = (i: number) => {
    const a0 = ((i * slice - 90) * Math.PI) / 180;
    const a1 = (((i + 1) * slice - 90) * Math.PI) / 180;
    const large = slice > 180 ? 1 : 0;
    return `M 150 150 L ${150 + r * Math.cos(a0)} ${150 + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${150 + r * Math.cos(a1)} ${150 + r * Math.sin(a1)} Z`;
  };

  return (
    <div className="wheel-game">
      <div className="wheel-wrap">
        <div className="wheel-pointer" aria-hidden="true">
          ▼
        </div>
        <svg viewBox="0 0 300 300" className="wheel" style={{ transform: `rotate(${angle}deg)` }} aria-hidden="true">
          {n === 1 ? (
            <circle cx="150" cy="150" r={r} fill={colors[0]} />
          ) : (
            segs.map((_, i) => <path key={i} d={path(i)} fill={colors[i % colors.length]} stroke="#fff" strokeWidth="3" />)
          )}
          {segs.map((l, i) => {
            const a = ((i + 0.5) * slice - 90) * (Math.PI / 180);
            return (
              <text key={l.id} x={150 + 92 * Math.cos(a)} y={150 + 92 * Math.sin(a)} textAnchor="middle" dominantBaseline="central" fontSize="30">
                {l.emoji}
              </text>
            );
          })}
          <circle cx="150" cy="150" r="26" fill="#fff" stroke="#1f2a4d" strokeWidth="4" />
          <text x="150" y="151" textAnchor="middle" dominantBaseline="central" fontSize="22">
            ⭐
          </text>
        </svg>
      </div>
      <button type="button" className="btn btn--sun btn--lg" onClick={spin} disabled={spinning}>
        {spinning ? 'العجلة تدور… 🎡' : picked ? 'أدِر العجلة مرة أخرى 🎡' : 'أدِر العجلة! 🎡'}
      </button>
      {picked && (
        <div className="card wheel-q">
          <div className="eyebrow">
            {picked.lesson.emoji} سؤال من درس: {picked.lesson.title}
          </div>
          <QuestionCard
            key={round}
            question={picked.q}
            continueLabel="أدِر مرة أخرى"
            onDone={(res) => {
              recordAnswer(res.firstTry);
              if (res.firstTry) addCoins(3);
              spin();
            }}
          />
        </div>
      )}
    </div>
  );
}
