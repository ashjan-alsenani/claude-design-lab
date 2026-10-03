/**
 * Runs a practice session: question → feedback → (similar question) → next … → results.
 * Exam simulation ('end' feedback) records answers silently and reviews everything at the end.
 */
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { play } from '../../lib/sound';
import { burst } from '../../lib/confetti';
import { checkAnswer, type Answer, type CheckResult } from '../check';
import { similarQuestion } from '../session';
import type { Bank, PracticeQuestion } from '../types';
import { FeedbackPanel, QuestionView } from './Question';
import { ProgressBar } from '../../components/ProgressBar';

export interface Played {
  q: PracticeQuestion;
  answer: Answer;
  result: CheckResult;
  helped: boolean;
  /** asked as a "similar question" after another one */
  similar?: boolean;
}

interface Props {
  bank: Bank;
  questions: PracticeQuestion[];
  title: ReactNode;
  feedback: 'each' | 'end';
  onRecord: (p: Played) => void;
  onFinish: (played: Played[]) => void;
  onExit: () => void;
  /** english vocabulary: offer «⭐ أضيفيها إلى كلماتي» */
  onAddWord?: (q: PracticeQuestion) => void;
  isWordAdded?: (q: PracticeQuestion) => boolean;
}

export function SessionRunner({ bank, questions, title, feedback, onRecord, onFinish, onExit, onAddWord, isWordAdded }: Props) {
  const [queue, setQueue] = useState(questions);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [helped, setHelped] = useState(false);
  const played = useRef<Played[]>([]);
  const used = useMemo(() => new Set(questions.map((q) => q.id)), [questions]);
  const [, bump] = useState(0);
  const q = queue[i];
  const en = bank.subject === 'english';
  const concepts = useMemo(() => new Map(bank.concepts.map((c) => [c.id, c.label])), [bank]);
  const similarFlags = useRef(new Set<string>());

  const submit = (a: Answer) => {
    if (result) return;
    const r = checkAnswer(q, a, !en);
    const p: Played = { q, answer: a, result: r, helped, similar: similarFlags.current.has(q.id) };
    played.current.push(p);
    onRecord(p);
    if (feedback === 'end') {
      next();
      return;
    }
    setAnswer(a);
    setResult(r);
    if (r.ok) {
      play('correct');
      if (q.type !== 'writing') burst({ x: 0.5, y: 0.75 });
    } else play('wrong');
  };

  function next() {
    setAnswer(null);
    setResult(null);
    setHelped(false);
    if (i + 1 >= queue.length) onFinish(played.current);
    else setI(i + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const similar = useMemo(() => (q ? similarQuestion(bank, q, used) : undefined), [bank, q, used]);
  const askSimilar = () => {
    if (!similar) return;
    used.add(similar.id);
    similarFlags.current.add(similar.id);
    setQueue((qs) => [...qs.slice(0, i + 1), similar, ...qs.slice(i + 1)]);
    bump((v) => v + 1);
    setAnswer(null);
    setResult(null);
    setHelped(false);
    setI(i + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!q) return null;
  const done = played.current.length;
  const correct = played.current.filter((p) => p.result.ok).length;

  return (
    <div className="practice-run">
      <div className="lesson__bar">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="خروج من التدريب">
          ✕
        </button>
        <div className="lesson__bar-mid">
          <div className="lesson__bar-title">{title}</div>
          <ProgressBar value={(i / queue.length) * 100} label="تقدّم التدريب" />
        </div>
        <span className="stat-pill">
          {feedback === 'end' ? `${i + 1}/${queue.length}` : `✅ ${correct}/${done}`}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={q.id + i} className="card practice-card" dir={en ? 'ltr' : undefined} lang={en ? 'en' : undefined} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
          {similarFlags.current.has(q.id) && <div className="pq-similar-tag">🔁 {en ? 'Similar question: same idea, new situation' : 'سؤال مشابه: نفس الفكرة بموقف جديد'}</div>}
          <QuestionView q={q} bank={bank} result={result} answer={answer} onSubmit={submit} exam={feedback === 'end'} onHelp={() => setHelped(true)} conceptLabel={concepts.get(q.concept)} />
          {result && answer && (
            <FeedbackPanel
              q={q}
              bank={bank}
              result={result}
              answer={answer}
              last={i + 1 >= queue.length}
              onNext={next}
              onSimilar={similar && q.type !== 'writing' ? askSimilar : undefined}
              onAddWord={onAddWord && q.skill === 'vocabulary' ? () => onAddWord(q) : undefined}
              wordAdded={isWordAdded?.(q)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
