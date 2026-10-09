import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { PreparedQuestion } from '../lib/questions';
import { QUESTION_TYPE_LABELS } from '../lib/types';
import { Icon } from './Icon';
import { RichText } from './RichText';
import './question.css';

const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

export function QuestionCard({
  q,
  picked,
  timedOut = false,
  onPick,
  label,
  aside,
  children,
}: {
  q: PreparedQuestion;
  picked: number | null;
  timedOut?: boolean;
  onPick: (i: number) => void;
  label?: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const locked = picked !== null || timedOut;
  return (
    <motion.article
      className="qcard panel"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 0.55, bounce: 0.22 }}
    >
      <div className="qcard-head">
        <span className="chip">{label ?? QUESTION_TYPE_LABELS[q.type]}</span>
        {aside}
      </div>
      <h2 className="qcard-text">
        <RichText text={q.text} />
      </h2>
      <div className={`qcard-options ${q.options.length === 2 ? 'two' : ''}`} role="group" aria-label="الخيارات">
        {q.options.map((o, i) => {
          const state = !locked ? 'idle' : i === q.answer ? 'right' : i === picked ? 'wrong' : 'dim';
          return (
            <button
              key={i}
              type="button"
              className="qopt"
              data-state={state}
              disabled={locked}
              onClick={() => onPick(i)}
              aria-label={`${LETTERS[i]}: ${o.replace(/\[\[\w+\]\]/g, 'آية')}`}
            >
              <span className="qopt-letter" aria-hidden>
                {state === 'right' ? <Icon name="check" size={18} /> : state === 'wrong' ? <Icon name="close" size={18} /> : LETTERS[i]}
              </span>
              <span className="qopt-text">
                <RichText text={o} />
              </span>
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {locked && (
          <Feedback
            correct={picked === q.answer}
            timedOut={timedOut && picked === null}
            correctText={q.options[q.answer]}
            explanation={q.explanation}
          />
        )}
      </AnimatePresence>
      {children}
    </motion.article>
  );
}

export function Feedback({
  correct,
  timedOut = false,
  correctText,
  explanation,
}: {
  correct: boolean;
  timedOut?: boolean;
  correctText?: string;
  explanation: string;
}) {
  return (
    <motion.div
      className="feedback"
      data-ok={correct}
      role="status"
      initial={{ opacity: 0, height: 0, y: -6 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="feedback-inner">
        <strong className="feedback-title">
          <Icon name={correct ? 'check' : timedOut ? 'timer' : 'hint'} size={20} />
          {correct ? 'إجابة صحيحة!' : timedOut ? 'انتهى الوقت' : 'ليست الإجابة الصحيحة — لنفهم السبب'}
        </strong>
        {!correct && correctText && (
          <p className="feedback-answer">
            الإجابة الصحيحة: <RichText text={correctText} />
          </p>
        )}
        <p className="feedback-why">
          <RichText text={explanation} />
        </p>
      </div>
    </motion.div>
  );
}
