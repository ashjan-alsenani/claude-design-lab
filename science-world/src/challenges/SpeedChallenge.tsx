import { useEffect, useMemo, useRef, useState } from 'react';
import type { Question } from '../data/types';
import { QuestionCard } from '../activities/QuestionCard';
import { sample } from '../lib/random';
import { play } from '../lib/sound';

const SECONDS = 60;

/** ⏱️ Answer as many as you can in 60 seconds (one attempt each). */
export function SpeedChallenge({ questions, onFinish }: { questions: Question[]; onFinish: (score: number) => void }) {
  const deck = useMemo(() => sample(questions.filter((q) => q.kind === 'tf' || q.kind === 'mcq'), 40), [questions]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const ended = useRef(false);
  const scoreRef = useRef(0);

  useEffect(() => {
    const t = window.setInterval(() => setLeft((l) => l - 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if ((left <= 0 || i >= deck.length) && !ended.current) {
      ended.current = true;
      play('level');
      onFinish(scoreRef.current);
    }
  }, [left, i, deck.length, onFinish]);

  const q = deck[i];
  return (
    <div className="speed">
      <div className="speed__hud">
        <div className={`timer ${left <= 10 ? 'timer--hurry' : ''}`} role="timer" aria-live="off">
          <svg viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="19" className="timer__track" />
            <circle cx="22" cy="22" r="19" className="timer__arc" style={{ strokeDashoffset: 119.4 * (1 - Math.max(0, left) / SECONDS) }} />
          </svg>
          <span>{Math.max(0, left)}</span>
        </div>
        <div className="speed__score">
          ⚡ <strong>{score}</strong> إجابة صحيحة
        </div>
      </div>
      {q && left > 0 && (
        <QuestionCard
          key={i}
          question={q}
          mode="timed"
          onDone={(r) => {
            if (r.correct) {
              scoreRef.current += 1;
              setScore(scoreRef.current);
            }
            setI((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}
