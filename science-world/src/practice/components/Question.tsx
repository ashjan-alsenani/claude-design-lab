/**
 * The question screen and the teaching feedback that follows every answer.
 * QUESTION → think → (optional hint / step-by-step) → answer → feedback (why, rule, tip)
 * → similar question or next.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { mixed } from '../../lib/bidi';
import { VisualView } from '../../illustrations/registry';
import { Say } from '../../components/Say';
import { Mascot } from '../../components/Mascot';
import { canSpeak, speak } from '../../lib/speech';
import { difficultyInfo } from '../bank';
import type { Answer, CheckResult } from '../check';
import type { Bank, PracticeQuestion } from '../types';
import { AudioPlayer, ColumnCalc, Chart, DataTable, PassageView, Scratchpad, highlight } from './Parts';
import { ChoiceInput, MatchInput, MultiInput, NumberInput, OrderInput, RemainderInput, SortInput, TextInput, TrueFalseInput } from './Inputs';
import { WritingFeedback, WritingTask } from './Writing';

const skillLabel: Record<string, string> = { listening: '🎧 Listening', vocabulary: '🔤 Vocabulary', grammar: '🧩 Grammar', reading: '📖 Reading', writing: '✍️ Writing' };
const styleLabel: Record<string, string> = {
  concept: '🌱 مفهوم', diagram: '🖼️ رسم', data: '📊 بيانات', experiment: '🧪 تجربة', scenario: '🌍 من الحياة', cause: '🔗 سبب ونتيجة', error: '🕵️ اكتشفي الخطأ',
  calculation: '✏️ حساب', visual: '📐 بصري', word: '🌍 مسألة حياتية', reasoning: '🧩 تفكير', estimate: '🎯 تقدير',
};

interface Props {
  q: PracticeQuestion;
  bank: Bank;
  result: CheckResult | null;
  answer: Answer | null;
  onSubmit: (a: Answer) => void;
  /** exam simulation: no hints */
  exam?: boolean;
  /** called when the child uses a hint or the step-by-step help */
  onHelp: () => void;
  conceptLabel?: string;
}

export function QuestionView({ q, bank, result, answer, onSubmit, exam, onHelp, conceptLabel }: Props) {
  const en = bank.subject === 'english';
  const math = bank.subject === 'math';
  const [hints, setHints] = useState(0);
  const [steps, setSteps] = useState(0);
  const [understand, setUnderstand] = useState(false);
  const [pad, setPad] = useState(false);
  const passage = q.passage ? bank.passages.find((p) => p.id === q.passage) : undefined;
  const d = difficultyInfo[q.difficulty];
  const sentence = q.sentence?.split('___');
  const filled = result && q.type === 'choice' ? q.options.find((o) => o.id === q.answer)?.text : null;
  const locked = Boolean(result);

  return (
    <div className={`pq ${en ? 'pq--en' : ''}`}>
      <div className="pq__chips">
        <span className={`pq-tag pq-tag--${q.difficulty}`}>
          {d.icon} {d.label}
        </span>
        {q.skill && <span className="pq-tag">{skillLabel[q.skill]}</span>}
        {!q.skill && q.style && <span className="pq-tag">{styleLabel[q.style]}</span>}
        {conceptLabel && <span className="pq-tag pq-tag--soft">{mixed(conceptLabel)}</span>}
      </div>

      {passage && <PassageView passage={passage} evidence={result && !result.ok ? q.evidence : undefined} />}
      {q.audio && !result && <AudioPlayer text={q.audio} />}

      <h3 className="qcard__prompt pq__prompt" dir="auto">
        {mixed(q.prompt)}
        {en && !q.audio && q.type !== 'writing' && <Say text={q.prompt} />}
      </h3>

      {q.visual && <VisualView visual={q.visual} className="qcard__visual pq__visual" />}
      {q.table && <DataTable table={q.table} arabic={!en} />}
      {q.chart && <Chart chart={q.chart} arabic={!en} />}
      {q.column && <ColumnCalc column={q.column} arabic={!en} />}
      {sentence && (
        <div className="qcard__sentence-row">
          <p className="qcard__sentence" dir="auto">
            {sentence[0]}
            <span className={`blank ${filled ? 'blank--filled' : ''}`}>{filled ?? (en ? '?' : '؟')}</span>
            {sentence[1]}
          </p>
          {en && <Say text={filled ? `${sentence[0]}${filled}${sentence[1]}` : q.sentence} />}
        </div>
      )}

      {/* help tools (never in the exam simulation) */}
      {!exam && !locked && (
        <div className="pq-help">
          {q.hints && hints < q.hints.length && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => (setHints((h) => h + 1), onHelp())}>
              💡 {en ? 'I need a hint' : 'أحتاج تلميحًا'} {q.hints.length > 1 ? `(${hints + 1}/${q.hints.length})` : ''}
            </button>
          )}
          {math && q.understand && !understand && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setUnderstand(true)}>
              🤔 ساعديني أفهم السؤال
            </button>
          )}
          {math && q.steps && steps < q.steps.length && q.type !== 'choice' && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => (setSteps((s) => s + 1), onHelp())}>
              👣 حلّيها معي خطوة بخطوة
            </button>
          )}
          {math && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPad((p) => !p)}>
              ✏️ مساحة للحل
            </button>
          )}
        </div>
      )}
      {hints > 0 && !locked && (
        <ul className="pq-hints">
          {q.hints!.slice(0, hints).map((h, i) => (
            <motion.li key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} dir="auto">
              💡 {mixed(h)}
            </motion.li>
          ))}
        </ul>
      )}
      {understand && q.understand && !locked && (
        <div className="pq-understand">
          <div>📌 <strong>ماذا نعرف؟</strong> {mixed(q.understand.know)}</div>
          <div>❓ <strong>ماذا نريد؟</strong> {mixed(q.understand.want)}</div>
          {q.understand.op && (
            <details>
              <summary>➕➖✖️➗ ما العملية المناسبة؟</summary>
              {mixed(q.understand.op)}
            </details>
          )}
        </div>
      )}
      {steps > 0 && !locked && (
        <ol className="pq-steps pq-steps--live">
          {q.steps!.slice(0, steps).map((s, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
              {mixed(s)}
            </motion.li>
          ))}
        </ol>
      )}
      {pad && <Scratchpad onClose={() => setPad(false)} />}

      <div className="pq__answer">
        <AnswerInput q={q} en={en} result={result} answer={answer} onSubmit={onSubmit} />
      </div>
    </div>
  );
}

function AnswerInput({ q, en, result, answer, onSubmit }: { q: PracticeQuestion; en: boolean; result: CheckResult | null; answer: Answer | null; onSubmit: (a: Answer) => void }) {
  const p = { en, result, answer, onSubmit };
  switch (q.type) {
    case 'choice':
      return <ChoiceInput q={q} {...p} />;
    case 'tf':
      return <TrueFalseInput q={q} {...p} />;
    case 'multi':
      return <MultiInput q={q} {...p} />;
    case 'number':
      return <NumberInput q={q} {...p} />;
    case 'remainder':
      return <RemainderInput q={q} {...p} />;
    case 'text':
      return <TextInput q={q} {...p} />;
    case 'order':
      return <OrderInput q={q} {...p} />;
    case 'match':
      return <MatchInput q={q} {...p} />;
    case 'sort':
      return <SortInput q={q} {...p} />;
    case 'writing':
      return <WritingTask q={q} done={Boolean(result)} onSubmit={onSubmit} />;
  }
}

/* ---------------- Feedback ---------------- */

const praiseAr = ['✅ أحسنتِ! إجابتكِ صحيحة', '🌟 رائع! إجابة صحيحة', '👏 ممتاز! هذا صحيح'];
const praiseEn = ['✅ Well done! That’s right.', '🌟 Great! Correct.', '👏 Excellent!'];
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

interface FeedbackProps {
  q: PracticeQuestion;
  bank: Bank;
  result: CheckResult;
  answer: Answer;
  onNext: () => void;
  onSimilar?: () => void;
  onAddWord?: () => void;
  wordAdded?: boolean;
  last: boolean;
}

export function FeedbackPanel({ q, bank, result, answer, onNext, onSimilar, onAddWord, wordAdded, last }: FeedbackProps) {
  const en = bank.subject === 'english';
  const math = bank.subject === 'math';
  const [title] = useState(() => (result.ok ? pick(en ? praiseEn : praiseAr) : en ? '❌ Not quite. Let’s understand it 👀' : math ? '❌ مو بالضبط، نشوف وين صار الخطأ 👀' : '❌ ليست الإجابة الصحيحة، خلينا نفهمها 👀'));
  const [ar, setAr] = useState(false);
  const [retype, setRetype] = useState('');
  const nextLabel = last ? (en ? 'See my results 🎉' : 'النتيجة 🎉') : result.ok ? (en ? 'Next ➜' : 'التالي ➜') : en ? 'I understand 👍' : 'فهمت 👍';

  if (q.type === 'writing' && answer.type === 'writing') {
    return (
      <motion.section className="pq-fb pq-fb--good" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}>
        <WritingFeedback q={q} text={answer.text} />
        <div className="pq-fb__tip">💡 {q.tip}</div>
        <div className="pq-fb__actions">
          <button type="button" className="btn btn--good btn--lg" onClick={onNext} autoFocus>
            {nextLabel}
          </button>
        </div>
      </motion.section>
    );
  }

  const L = en
    ? { yours: 'Your answer', right: 'Correct answer', whyWrong: 'Why is your answer not right?', whyRight: result.ok ? 'Why is it correct?' : 'Why is this the right answer?', steps: 'How do we solve it?', tip: '💡 Remember:', similar: result.ok ? 'Similar question 🔁' : 'Try a similar question 🔁' }
    : { yours: 'إجابتكِ', right: 'الإجابة الصحيحة', whyWrong: 'لماذا إجابتكِ غير صحيحة؟', whyRight: result.ok ? 'لماذا هذه الإجابة صحيحة؟' : 'لماذا هذه هي الإجابة الصحيحة؟', steps: math ? 'كيف نحلّها؟' : 'خطوة بخطوة', tip: '💡 تذكّري:', similar: result.ok ? 'سؤال مشابه 🔁' : 'جرّبي سؤالًا مشابهًا 🔁' };
  const compact = ['match', 'sort'].includes(q.type);

  return (
    <motion.section
      className={`pq-fb ${result.ok ? 'pq-fb--good' : 'pq-fb--oops'}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
      role="status"
      aria-live="polite"
    >
      <div className="pq-fb__head">
        <Mascot mood={result.ok ? 'celebrating' : 'thinking'} size={58} />
        <strong className="pq-fb__title">{title}</strong>
      </div>

      {!result.ok && !compact && (
        <div className="pq-fb__compare">
          <div className="pq-fb__row pq-fb__row--wrong">
            <span>{L.yours}</span>
            <strong dir="auto">{mixed(result.given)}</strong>
          </div>
          <div className="pq-fb__row pq-fb__row--right">
            <span>{L.right}</span>
            <strong dir="auto">{mixed(result.correct)}</strong>
          </div>
        </div>
      )}
      {!result.ok && compact && <p className="pq-fb__note">{en ? 'Green cards are right, red cards need to move. Correct answer:' : 'البطاقات الخضراء صحيحة، والحمراء في غير مكانها. الإجابة الصحيحة:'} <span dir="auto">{mixed(result.correct)}</span></p>}

      {!result.ok && result.why && (
        <div className="pq-fb__block pq-fb__block--why">
          <h4>{L.whyWrong}</h4>
          <p dir="auto">{mixed(result.why)}</p>
        </div>
      )}

      {/* listening: show the words that gave the answer */}
      {q.audio && (
        <div className="pq-fb__block pq-fb__audio" lang="en">
          <h4>{en ? (result.ok ? '🎧 You heard:' : '🎧 Listen again to:') : '🎧'}</h4>
          <p dir="ltr">
            {highlight(q.audio, q.evidence)} {canSpeak() && <button type="button" className="say" aria-label="استمعي مرة أخرى" onClick={() => speak(q.audio!)}>🔊</button>}
          </p>
        </div>
      )}
      {q.passage && q.evidence && (
        <div className="pq-fb__block pq-fb__evidence" lang="en">
          <h4>📖 {en ? 'The evidence in the text:' : 'الدليل في النص:'}</h4>
          <p dir="ltr">“{q.evidence}”</p>
        </div>
      )}

      <div className="pq-fb__block">
        <h4>{L.whyRight}</h4>
        <p dir="auto">{mixed(q.explanation)}</p>
        {en && q.explanationAr && (
          <>
            {!ar ? (
              <button type="button" className="link pq-fb__ar-btn" onClick={() => setAr(true)}>
                اشرحيها لي بالعربي 🇴🇲
              </button>
            ) : (
              <p className="pq-fb__ar" dir="rtl" lang="ar">
                {mixed(q.explanationAr)}
              </p>
            )}
          </>
        )}
      </div>

      {q.steps && q.steps.length > 0 && (
        <div className="pq-fb__block">
          <h4>{L.steps}</h4>
          <ol className="pq-steps">
            {q.steps.map((s, i) => (
              <li key={i} dir="auto">{mixed(s)}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="pq-fb__tip" dir="auto">
        {L.tip} {mixed(q.tip)}
      </div>

      {/* spelling: practise the right spelling straight away */}
      {!result.ok && q.type === 'text' && en && (
        <div className="pq-fb__retype" lang="en">
          <span dir="ltr">
            Type it again: <strong>{q.answer}</strong> <Say text={q.answer} />
          </span>
          <input dir="ltr" value={retype} onChange={(e) => setRetype(e.target.value)} autoCapitalize="off" spellCheck={false} aria-label="Type the word again" />
          {retype.trim().toLowerCase() === q.answer.toLowerCase() && <span className="pq-fb__ok">✅ Perfect!</span>}
        </div>
      )}

      <div className="pq-fb__actions">
        <button type="button" className="btn btn--good btn--lg" onClick={onNext} autoFocus>
          {nextLabel}
        </button>
        {onSimilar && (
          <button type="button" className="btn btn--ghost" onClick={onSimilar}>
            {L.similar}
          </button>
        )}
        {onAddWord && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onAddWord} disabled={wordAdded}>
            {wordAdded ? '⭐ في كلماتي' : '⭐ أضيفيها إلى كلماتي'}
          </button>
        )}
      </div>
    </motion.section>
  );
}
