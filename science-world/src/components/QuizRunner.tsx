import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Question } from '../data/types';
import { QuestionCard } from '../activities/QuestionCard';
import { useProgress } from '../state/ProgressContext';
import { ProgressBar } from './ProgressBar';
import { MascotMessage } from './MascotMessage';

interface Props {
  questions: Question[];
  title: string;
  intro?: string;
  onFinish: (score: number, total: number) => void;
}

/** One question at a time, big answer buttons, first-try answers earn stars. */
export function QuizRunner({ questions, title, intro, onFinish }: Props) {
  const { recordAnswer } = useProgress();
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  return (
    <div className="quiz">
      <div className="quiz__head">
        <div className="quiz__title">
          🎯 {title}
          <span className="chip">
            سؤال {Math.min(i + 1, questions.length)} من {questions.length}
          </span>
        </div>
        <ProgressBar value={(i / questions.length) * 100} tone="sun" label="تقدّم الاختبار" />
        <div className="quiz__pips" aria-hidden="true">
          {questions.map((_, k) => (
            <span key={k} className={`pip ${results[k] === true ? 'pip--good' : results[k] === false ? 'pip--try' : k === i ? 'pip--now' : ''}`}>
              {results[k] === true ? '★' : results[k] === false ? '•' : ''}
            </span>
          ))}
        </div>
      </div>
      {i === 0 && intro && results.length === 0 && (
        <MascotMessage mood="excited" size={72}>
          {intro}
        </MascotMessage>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
          <QuestionCard
            question={questions[i]}
            continueLabel={i === questions.length - 1 ? 'النتيجة' : 'السؤال التالي'}
            onDone={(r) => {
              recordAnswer(r.firstTry);
              const s = score + (r.firstTry ? 1 : 0);
              setScore(s);
              setResults((x) => [...x, r.firstTry]);
              if (i === questions.length - 1) onFinish(s, questions.length);
              else setI(i + 1);
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
