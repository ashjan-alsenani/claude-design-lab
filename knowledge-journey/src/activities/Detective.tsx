import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { sfx } from '../audio/sound';
import type { ActivityProps } from '../components/ActivityShell';
import { celebrate } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { Feedback } from '../components/QuestionCard';
import { RichText } from '../components/RichText';
import { CASES } from '../data/lesson';
import { encourage, say } from '../state/guide';
import './detective.css';

interface CaseResult {
  solved: boolean;
  firstTry: boolean;
  clues: number;
  points: number;
}

export function casePoints(cluesUsed: number, wrong: number): number {
  return Math.max(10, 30 - Math.max(0, cluesUsed - 1) * 5 - wrong * 10);
}

export function Detective({ onFinish }: ActivityProps) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<CaseResult[]>([]);
  const [clues, setClues] = useState<string[]>([]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const c = CASES[index];
  const lastWrong = wrong[wrong.length - 1];

  const choose = (i: number) => {
    if (solved || wrong.includes(i)) return;
    if (i === c.answer) {
      setSolved(true);
      sfx('stamp');
      window.setTimeout(() => sfx('correct'), 180);
      celebrate('sparkles', 0.5, 0.4);
      const r = { solved: true, firstTry: wrong.length === 0, clues: clues.length, points: casePoints(clues.length, wrong.length) };
      setResults((rs) => [...rs, r]);
      say(r.firstTry ? 'تم حل القضية ببراعة!' : 'تم حل القضية! التحليل الدقيق يصنع المحققات.', 'cheer');
    } else {
      sfx('wrong');
      setWrong((w) => [...w, i]);
      encourage();
    }
  };

  const next = () => {
    if (index + 1 >= CASES.length) {
      const all = results;
      const totalClues = all.reduce((s, r) => s + r.clues, 0);
      onFinish({
        score: all.reduce((s, r) => s + r.points, 0),
        correct: all.filter((r) => r.firstTry).length,
        total: CASES.length,
        feats: totalClues === 0 ? ['detective'] : [],
      });
      return;
    }
    sfx('whoosh');
    setIndex(index + 1);
    setClues([]);
    setWrong([]);
    setSolved(false);
  };

  return (
    <div className="detective">
      <header className="stage-intro">
        <h2>غرفة التحقيق</h2>
        <p>افحصي الأدلة المضيئة، ثم حدّدي الجواب. كل دليل تكشفينه يساعدكِ، لكن القضية المحلولة بأقل الأدلة تمنح نقاطًا أكثر.</p>
      </header>

      <ol className="case-board" aria-label="القضايا">
        {CASES.map((x, i) => (
          <li key={x.id} data-state={i < index || (i === index && solved) ? 'solved' : i === index ? 'active' : 'locked'}>
            <span className="case-tab-num">{i + 1}</span>
            <span className="case-tab-level">{x.level}</span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.article
          key={c.id}
          className="case-file"
          initial={{ opacity: 0, rotateY: -25, x: -40 }}
          animate={{ opacity: 1, rotateY: 0, x: 0 }}
          exit={{ opacity: 0, rotateY: 20, x: 40 }}
          transition={{ type: 'spring', duration: 0.7, bounce: 0.2 }}
        >
          <div className="case-paper">
            <div className="case-head">
              <span className="case-label">
                <Icon name="eye" size={18} /> القضية {index + 1} · {c.level}
              </span>
              <h3>{c.title}</h3>
            </div>
            <p className="case-scenario">
              <RichText text={c.scenario} />
            </p>

            <div className="clues">
              <h4>الأدلة</h4>
              <div className="clue-row">
                {c.clues.map((cl) => {
                  const open = clues.includes(cl.id);
                  return (
                    <button
                      key={cl.id}
                      type="button"
                      className="clue"
                      data-open={open}
                      aria-expanded={open}
                      onClick={() => {
                        if (open) return;
                        sfx('pick');
                        setClues((x) => [...x, cl.id]);
                      }}
                    >
                      <span className="clue-lens" aria-hidden>
                        <Icon name={open ? 'check' : 'eye'} size={18} />
                      </span>
                      <span className="clue-label">{cl.label}</span>
                      <AnimatePresence>
                        {open && (
                          <motion.span className="clue-reveal" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <RichText text={cl.reveal} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="case-q">
              <h4>{c.question}</h4>
              <div className="case-options">
                {c.options.map((o, i) => (
                  <button
                    key={o}
                    type="button"
                    className="qopt"
                    data-state={solved ? (i === c.answer ? 'right' : 'dim') : wrong.includes(i) ? 'wrong' : 'idle'}
                    disabled={solved || wrong.includes(i)}
                    onClick={() => choose(i)}
                  >
                    <span className="qopt-text">{o}</span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {!solved && lastWrong !== undefined && (
                <Feedback key={`w${lastWrong}`} correct={false} explanation={`${c.wrongNotes[lastWrong]} افحصي دليلًا آخر وحاولي مجددًا.`} />
              )}
              {solved && <Feedback key="ok" correct explanation={c.explanation} />}
            </AnimatePresence>

            {solved && (
              <div className="row-center" style={{ marginTop: 16 }}>
                <span className="case-points num">+{results[results.length - 1]?.points ?? 0} نقطة</span>
                <button type="button" className="btn btn-teal btn-lg" onClick={next} autoFocus>
                  {index + 1 >= CASES.length ? 'إغلاق الملفات واستلام الجوهرة' : 'القضية التالية'}
                  <Icon name="next" />
                </button>
              </div>
            )}

            <AnimatePresence>
              {solved && (
                <motion.div
                  className="stamp"
                  aria-hidden
                  initial={{ scale: 2.6, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                >
                  تم حل القضية
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
