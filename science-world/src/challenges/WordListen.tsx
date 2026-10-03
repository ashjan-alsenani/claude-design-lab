import { useEffect, useMemo, useRef, useState } from 'react';
import type { McqQuestion, VocabWord } from '../data/types';
import { QuestionCard } from '../activities/QuestionCard';
import { canSpeak } from '../lib/speech';
import { shuffle } from '../lib/random';
import { play } from '../lib/sound';

const SECONDS = 60;

/** 👂 English listening sprint: hear a word from the lessons, pick its meaning. */
export function WordListen({ words, onFinish }: { words: VocabWord[]; onFinish: (score: number) => void }) {
  const deck = useMemo<McqQuestion[]>(() => {
    const voice = canSpeak();
    const uniq = [...new Map(words.map((w) => [w.word, w])).values()];
    return shuffle(uniq).map((w, i) => {
      const others = shuffle(uniq.filter((o) => o.word !== w.word && o.meaning !== w.meaning)).slice(0, 3);
      return {
        id: `wl-${i}`,
        kind: 'mcq',
        prompt: voice ? 'استمعي: ما معنى الكلمة؟' : `ما معنى «${w.word}»؟`,
        say: voice ? w.word : undefined,
        choices: shuffle([w, ...others]).map((c, k) => ({ id: c.word === w.word ? 'ok' : `x${k}`, text: c.meaning })),
        answer: 'ok',
        explain: `${w.word} = ${w.meaning}`,
        hint: 'استمعي مرة أخرى بالضغط على 🔊',
      };
    });
  }, [words]);
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
          <span>{Math.max(0, left)}</span>
        </div>
        <div className="speed__score">
          👂 <strong>{score}</strong> كلمة صحيحة
        </div>
      </div>
      {left > 0 && deck.length > 0 && (
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
