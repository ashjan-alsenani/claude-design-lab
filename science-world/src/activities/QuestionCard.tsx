import { learner } from '../data/learner';
import { useEffect, useMemo, useState } from 'react';
import type { Choice, Question } from '../data/types';
import { play } from '../lib/sound';
import { burst } from '../lib/confetti';
import { shuffle } from '../lib/random';
import { VisualView } from '../illustrations/registry';
import { Feedback } from '../components/Feedback';
import { NumberPad } from './NumberPad';
import { sameNumber, toArabicDigits } from '../lib/digits';

export interface AnswerResult {
  correct: boolean; // eventually answered correctly
  firstTry: boolean;
}

interface Props {
  question: Question;
  /** called once when the child presses "continue" after finishing */
  onDone: (r: AnswerResult) => void;
  /** 'timed' = one attempt, short feedback, auto-continue */
  mode?: 'learn' | 'timed';
  continueLabel?: string;
  /** inside another activity: report as soon as answered, no continue button */
  embedded?: boolean;
}

const praise = ['رائع! ⭐', `أحسنتِ يا ${learner.name}!`, 'ممتاز! 🎉', 'إجابة عبقرية! 🧠', 'صحيح تمامًا! ✅'];
const encourage = ['قريب! حاولي مرة أخرى 🌟', 'لا بأس، فكّري مرة أخرى 💪', 'تقريبًا! انظري جيدًا 👀'];

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

/** Max wrong tries before we show the answer and explain it. */
function maxTries(q: Question) {
  if (q.kind === 'tf') return 1;
  if (q.kind === 'tapAll' || q.kind === 'number') return 2;
  return Math.max(1, Math.min(2, q.choices.length - 2));
}

export function QuestionCard({ question: q, onDone, mode = 'learn', continueLabel = 'التالي', embedded = false }: Props) {
  const choices: Choice[] = useMemo(() => {
    if (q.kind === 'tf')
      return [
        { id: 'true', text: 'صحيح', emoji: '✅' },
        { id: 'false', text: 'خطأ', emoji: '❌' },
      ];
    if (q.kind === 'number') return [];
    return shuffle(q.choices);
  }, [q]);

  const [wrong, setWrong] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]); // tapAll
  const [status, setStatus] = useState<'answering' | 'oops' | 'right' | 'revealed'>('answering');
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [typed, setTyped] = useState('');

  useEffect(() => {
    setWrong([]);
    setSelected([]);
    setStatus('answering');
    setMsg('');
    setTyped('');
  }, [q]);

  const correctIds = q.kind === 'tf' ? [String(q.answer)] : q.kind === 'tapAll' ? q.answers : q.kind === 'number' ? [] : [q.answer];
  const done = status === 'right' || status === 'revealed';

  function finish(correct: boolean, firstTry: boolean) {
    if (embedded) {
      onDone({ correct, firstTry });
      return;
    }
    if (mode === 'timed') {
      window.setTimeout(() => onDone({ correct, firstTry }), correct ? 450 : 1100);
    }
  }

  function succeed(firstTry: boolean) {
    setStatus('right');
    setMsg(pick(praise));
    play('correct');
    burst({ x: 0.5, y: 0.7 });
    finish(true, firstTry);
  }

  function fail(id: string | null) {
    const nextWrong = id ? [...wrong, id] : [...wrong, `try${wrong.length}`];
    setWrong(nextWrong);
    setShakeId(id ?? 'all');
    window.setTimeout(() => setShakeId(null), 450);
    play('wrong');
    if (mode === 'timed' || nextWrong.length >= maxTries(q)) {
      setStatus('revealed');
      setMsg('لا بأس! هذه هي الإجابة الصحيحة 👇');
      finish(false, false);
    } else {
      setStatus('oops');
      setMsg(pick(encourage));
    }
  }

  function choose(id: string) {
    if (done) return;
    if (q.kind === 'tapAll') {
      play('tap');
      setStatus('answering');
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
      return;
    }
    if (wrong.includes(id)) return;
    if (correctIds.includes(id)) succeed(wrong.length === 0);
    else fail(id);
  }

  function checkNumber() {
    if (q.kind !== 'number' || done || typed === '') return;
    const ok = [q.answer, ...(q.accept ?? [])].some((a) => sameNumber(a, typed));
    if (ok) succeed(wrong.length === 0);
    else fail(null);
  }

  function checkTapAll() {
    const ok = selected.length === correctIds.length && selected.every((s) => correctIds.includes(s));
    if (ok) succeed(wrong.length === 0);
    else fail(null);
  }

  const stateOf = (id: string) => {
    if (done && correctIds.includes(id)) return 'right';
    if (wrong.includes(id)) return 'wrong';
    if (q.kind === 'tapAll' && selected.includes(id)) return done ? 'wrong' : 'picked';
    return '';
  };

  const sentence = q.kind === 'fill' ? q.sentence.split('___') : null;
  const filled = q.kind === 'fill' && done ? choices.find((c) => c.id === q.answer)?.text : null;

  return (
    <div className={`qcard qcard--${q.kind}`}>
      {q.visual && <VisualView visual={q.visual} className="qcard__visual" />}
      <h3 className="qcard__prompt">{q.prompt}</h3>
      {sentence && (
        <p className="qcard__sentence">
          {sentence[0]}
          <span className={`blank ${filled ? 'blank--filled' : ''}`}>{filled ?? '؟'}</span>
          {sentence[1]}
        </p>
      )}
      {q.kind === 'number' && (
        <>
          <NumberPad value={typed} onChange={(v) => { setTyped(v); if (status === 'oops') setStatus('answering'); }} onSubmit={checkNumber} disabled={done} unit={q.unit} shake={shakeId === 'all'} />
          {status === 'revealed' && (
            <p className="qcard__answer">
              الإجابة الصحيحة: <strong dir="ltr">{toArabicDigits(q.answer)}</strong> {q.unit}
            </p>
          )}
        </>
      )}
      {q.kind === 'tapAll' && <p className="qcard__hint-line">اختر كل الإجابات الصحيحة ثم اضغط «تحقّق»</p>}
      {q.kind !== 'number' && <div className={`choices choices--${q.kind === 'tf' ? 'tf' : choices.length > 4 ? 'many' : 'grid'}`} role="group" aria-label="الخيارات">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`choice choice--${stateOf(c.id)} ${shakeId === c.id || (shakeId === 'all' && selected.includes(c.id)) ? 'wiggle' : ''}`}
            onClick={() => choose(c.id)}
            disabled={done || wrong.includes(c.id)}
            aria-pressed={q.kind === 'tapAll' ? selected.includes(c.id) : undefined}
          >
            {c.emoji && (
              <span className="choice__emoji" aria-hidden="true">
                {c.emoji}
              </span>
            )}
            <span className="choice__text">{c.text}</span>
            {stateOf(c.id) === 'right' && <span className="choice__mark" aria-label="صحيح">✓</span>}
          </button>
        ))}
      </div>}
      {q.kind === 'tapAll' && !done && (
        <button type="button" className="btn btn--accent btn--block" disabled={selected.length === 0} onClick={checkTapAll}>
          تحقّق ✔️
        </button>
      )}
      {status !== 'answering' && (
        <Feedback tone={status === 'right' ? 'good' : status === 'oops' ? 'oops' : 'reveal'} title={msg}>
          {status === 'right' || status === 'revealed' ? q.explain : q.hint}
        </Feedback>
      )}
      {done && mode === 'learn' && !embedded && (
        <button type="button" className="btn btn--good btn--lg btn--block qcard__next" onClick={() => onDone({ correct: status === 'right', firstTry: status === 'right' && wrong.length === 0 })} autoFocus>
          {continueLabel} ←
        </button>
      )}
    </div>
  );
}
