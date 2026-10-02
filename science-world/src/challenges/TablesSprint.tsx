import { useEffect, useMemo, useRef, useState } from 'react';
import type { NumberQuestion } from '../data/types';
import { QuestionCard } from '../activities/QuestionCard';
import { toArabicDigits as ar } from '../lib/digits';
import { play } from '../lib/sound';

const SECONDS = 60;

/** ✖️ Multiplication facts sprint: generated questions, typed on the keypad. */
export function TablesSprint({ onFinish }: { onFinish: (score: number) => void }) {
  const deck = useMemo<NumberQuestion[]>(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        const a = 2 + Math.floor(Math.random() * 11);
        const b = 2 + Math.floor(Math.random() * 11);
        return {
          id: `tbl-${i}`,
          kind: 'number',
          prompt: `${ar(a)} × ${ar(b)} = ؟`,
          answer: String(a * b),
          explain: `${ar(a)} × ${ar(b)} = ${ar(a * b)}`,
          hint: 'فكّري في جدول الضرب.',
        };
      }),
    [],
  );
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
    if (left <= 0 && !ended.current) {
      ended.current = true;
      play('level');
      onFinish(scoreRef.current);
    }
  }, [left, onFinish]);

  return (
    <div className="speed">
      <div className="speed__hud">
        <div className={`timer ${left <= 10 ? 'timer--hurry' : ''}`} role="timer">
          <svg viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="19" className="timer__track" />
            <circle cx="22" cy="22" r="19" className="timer__arc" style={{ strokeDashoffset: 119.4 * (1 - Math.max(0, left) / SECONDS) }} />
          </svg>
          <span>{ar(Math.max(0, left))}</span>
        </div>
        <div className="speed__score">
          ✖️ <strong>{ar(score)}</strong> إجابة صحيحة
        </div>
      </div>
      {left > 0 && (
        <QuestionCard
          key={i}
          question={deck[i % deck.length]}
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
