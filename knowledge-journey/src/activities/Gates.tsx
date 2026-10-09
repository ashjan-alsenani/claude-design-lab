import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { sfx } from '../audio/sound';
import type { ActivityProps } from '../components/ActivityShell';
import { celebrate } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { Feedback } from '../components/QuestionCard';
import { RichText, VerseQuote } from '../components/RichText';
import { GATES, SOURCE_STATEMENTS, SOURCES_INTRO, type Gate } from '../data/lesson';
import { shuffle } from '../lib/random';
import { encourage, praise, say } from '../state/guide';
import './gates.css';

type GateId = Gate['id'];
type View = { kind: 'hall' } | { kind: 'gate'; id: GateId } | { kind: 'final' };

interface Tally {
  score: number;
  correct: number;
  total: number;
}

export function Gates({ onFinish }: ActivityProps) {
  const [view, setView] = useState<View>({ kind: 'hall' });
  const [passed, setPassed] = useState<Record<GateId, boolean>>({ quran: false, sunnah: false });
  const [tally, setTally] = useState<Tally>({ score: 0, correct: 0, total: 0 });
  const add = (t: Partial<Tally>) => setTally((p) => ({ score: p.score + (t.score ?? 0), correct: p.correct + (t.correct ?? 0), total: p.total + (t.total ?? 0) }));

  const bothDone = passed.quran && passed.sunnah;

  return (
    <div className="gates">
      <AnimatePresence mode="wait">
        {view.kind === 'hall' && (
          <motion.div key="hall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }} transition={{ duration: 0.4 }}>
            <header className="stage-intro">
              <h2>قاعة البوابتين</h2>
              <p>للتشريع الإسلامي مصدران أساسان. افتحي كل بوابة، واكتشفي كنوزها، ثم أجيبي عن سؤالها.</p>
            </header>
            <SourcesIntro />
            <div className="gates-row">
              {GATES.map((g) => (
                <GateDoor
                  key={g.id}
                  gate={g}
                  done={passed[g.id]}
                  onOpen={() => {
                    sfx('open');
                    setView({ kind: 'gate', id: g.id });
                  }}
                />
              ))}
            </div>
            <div className="row-center" style={{ marginTop: 26 }}>
              <button
                type="button"
                className="btn btn-gold btn-lg"
                disabled={!bothDone}
                onClick={() => {
                  sfx('whoosh');
                  setView({ kind: 'final' });
                  say('التحدي الأخير: لكل عبارة مصدرها. ركّزي!', 'happy');
                }}
              >
                <Icon name="sparkle" />
                {bothDone ? 'ابدئي التحدي النهائي' : 'افتحي البوابتين أولًا'}
              </button>
            </div>
          </motion.div>
        )}
        {view.kind === 'gate' && (
          <GateRoom
            key={view.id}
            gate={GATES.find((g) => g.id === view.id)!}
            onDone={(firstTry) => {
              setPassed((p) => ({ ...p, [view.id]: true }));
              add({ score: firstTry ? 20 : 10, correct: firstTry ? 1 : 0, total: 1 });
              setView({ kind: 'hall' });
            }}
          />
        )}
        {view.kind === 'final' && (
          <FinalChallenge
            key="final"
            onDone={(t) => {
              const total = { score: tally.score + t.score, correct: tally.correct + t.correct, total: tally.total + t.total };
              onFinish(total);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SourcesIntro() {
  const [open, setOpen] = useState(false);
  return (
    <div className="sources-intro panel">
      <button type="button" className="sources-intro-q" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon name="hint" />
        <span>ما مصادر التشريع الإسلامي؟</span>
        <span className="chip">{open ? 'إخفاء' : 'اكتشفي'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="sources-intro-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <div>
              <p>
                <strong>{SOURCES_INTRO.definition}</strong>
              </p>
              <p>{SOURCES_INTRO.pillars}</p>
              <p>{SOURCES_INTRO.later}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GateDoor({ gate, done, onOpen }: { gate: Gate; done: boolean; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      className="gate-door"
      data-gate={gate.id}
      data-done={done}
      onClick={onOpen}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      aria-label={`بوابة ${gate.name}${done ? ' — تم اكتشافها' : ''}`}
    >
      <span className="gate-arch">
        <span className="gate-glow" />
        <span className="gate-emblem">{gate.id === 'quran' ? <BookArt /> : <ScrollArt />}</span>
        <span className="gate-leaf l" />
        <span className="gate-leaf r" />
      </span>
      <span className="gate-label">
        <span className="gate-rank">{gate.rank}</span>
        <strong>{gate.name}</strong>
        {done ? (
          <span className="gate-status ok">
            <Icon name="check" size={16} /> اكتُشفت
          </span>
        ) : (
          <span className="gate-status">اضغطي لفتح البوابة</span>
        )}
      </span>
    </motion.button>
  );
}

function GateRoom({ gate, onDone }: { gate: Gate; onDone: (firstTry: boolean) => void }) {
  const [revealed, setRevealed] = useState<string[]>([]);
  const [stage, setStage] = useState<'explore' | 'quiz'>('explore');
  const [picked, setPicked] = useState<number | null>(null);
  const [misses, setMisses] = useState(0);
  const allSeen = revealed.length === gate.facts.length;
  const correct = picked === gate.quiz.answer;

  return (
    <motion.div
      className="gate-room"
      data-gate={gate.id}
      initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="gate-room-hero">
        <motion.div className="gate-room-art" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', bounce: 0.3 }}>
          {gate.id === 'quran' ? <BookArt open /> : <ScrollArt open />}
        </motion.div>
        <div>
          <span className="chip">{gate.rank}</span>
          <h2>{gate.name}</h2>
          <p>{gate.summary}</p>
        </div>
      </div>

      {stage === 'explore' && (
        <>
          <p className="gate-hint">
            اضغطي على كل بطاقة لكشف كنزها ({revealed.length}/{gate.facts.length})
          </p>
          <div className="fact-grid">
            {gate.facts.map((f, i) => {
              const on = revealed.includes(f.id);
              return (
                <motion.button
                  key={f.id}
                  type="button"
                  className="fact"
                  data-on={on}
                  aria-expanded={on}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  onClick={() => {
                    if (!on) {
                      sfx('pick');
                      setRevealed((r) => [...r, f.id]);
                    }
                  }}
                >
                  <span className="fact-title">
                    <span className="fact-icon">{on ? <Icon name="sparkle" size={18} /> : <Icon name="eye" size={18} />}</span>
                    {f.title}
                  </span>
                  <AnimatePresence>
                    {on && (
                      <motion.span className="fact-body" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.35 }}>
                        <span className="fact-text">{f.body}</span>
                        {f.verse && <VerseQuote id={f.verse} block />}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
          <div className="row-center" style={{ marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-gold btn-lg"
              disabled={!allSeen}
              onClick={() => {
                sfx('tap');
                setStage('quiz');
              }}
            >
              {allSeen ? 'إلى سؤال البوابة' : 'اكشفي جميع البطاقات'}
              <Icon name="next" />
            </button>
          </div>
        </>
      )}

      {stage === 'quiz' && (
        <motion.div className="gate-quiz panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3>
            <RichText text={gate.quiz.text} />
          </h3>
          <div className="gate-quiz-options">
            {gate.quiz.options.map((o, i) => {
              const state = picked === null ? 'idle' : i === gate.quiz.answer && correct ? 'right' : i === picked ? 'wrong' : 'dim';
              return (
                <button
                  key={i}
                  type="button"
                  className="qopt"
                  data-state={state}
                  disabled={correct}
                  onClick={() => {
                    setPicked(i);
                    if (i === gate.quiz.answer) {
                      sfx('correct');
                      praise();
                      celebrate('sparkles', 0.5, 0.6);
                    } else {
                      sfx('wrong');
                      encourage();
                      setMisses((m) => m + 1);
                    }
                  }}
                >
                  <span className="qopt-text">{o}</span>
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <Feedback
              correct={correct}
              explanation={correct ? gate.quiz.explanation : `${gate.quiz.explanation} جرّبي مرة أخرى.`}
            />
          )}
          {correct && (
            <div className="row-center" style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-teal btn-lg" onClick={() => onDone(misses === 0)} autoFocus>
                العودة إلى القاعة
                <Icon name="next" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function FinalChallenge({ onDone }: { onDone: (t: Tally) => void }) {
  const items = useMemo(() => shuffle(SOURCE_STATEMENTS), []);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<'quran' | 'sunnah' | null>(null);
  const [right, setRight] = useState(0);
  const item = items[i];
  const ok = answer === item.source;

  const choose = (s: 'quran' | 'sunnah') => {
    if (answer) return;
    setAnswer(s);
    if (s === item.source) {
      sfx('correct');
      setRight((r) => r + 1);
      praise();
    } else {
      sfx('wrong');
      encourage();
    }
  };
  const next = () => {
    if (i + 1 >= items.length) {
      const correct = right;
      onDone({ score: correct * 15, correct, total: items.length });
      return;
    }
    setI(i + 1);
    setAnswer(null);
  };

  return (
    <motion.div className="final" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <header className="stage-intro">
        <h2>تحدي المصدر الصحيح</h2>
        <p>إلى أي المصدرين تنتمي العبارة؟</p>
      </header>
      <div className="step-dots" aria-hidden>
        {items.map((it, k) => (
          <span key={it.id} data-on={k <= i} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          className="final-card panel"
          initial={{ opacity: 0, rotateX: -30, y: 30 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.25 }}
        >
          <p className="final-text">«{item.text}»</p>
          <div className="final-choices">
            {(['quran', 'sunnah'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className="final-choice"
                data-source={s}
                data-state={!answer ? 'idle' : s === item.source ? 'right' : s === answer ? 'wrong' : 'dim'}
                disabled={!!answer}
                onClick={() => choose(s)}
              >
                {s === 'quran' ? <BookArt /> : <ScrollArt />}
                <span>{s === 'quran' ? 'القرآن الكريم' : 'السنة النبوية'}</span>
              </button>
            ))}
          </div>
          {answer && <Feedback correct={ok} correctText={item.source === 'quran' ? 'القرآن الكريم' : 'السنة النبوية'} explanation={item.why} />}
          {answer && (
            <div className="row-center" style={{ marginTop: 14 }}>
              <button type="button" className="btn btn-gold" onClick={next} autoFocus>
                {i + 1 >= items.length ? 'استلمي الجوهرة' : 'العبارة التالية'}
                <Icon name="next" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────── illustrations ───────── */

export function BookArt({ open = false }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 120 100" className={`book-art ${open ? 'open' : ''}`} aria-hidden>
      <defs>
        <linearGradient id="book-cover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fd0c9" />
          <stop offset="1" stopColor="#0b6a6f" />
        </linearGradient>
        <radialGradient id="book-light" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6d1" />
          <stop offset="1" stopColor="#fff6d1" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="40" rx="56" ry="36" fill="url(#book-light)" className="pulse" />
      {/* stand */}
      <path d="M30 92l30-20 30 20" stroke="#b5751a" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M60 72 14 54V24l46 16 46-16v30Z" fill="url(#book-cover)" />
      <path d="M60 68 18 52V26l42 14Z" fill="#fffaf0" />
      <path d="M60 68l42-16V26L60 40Z" fill="#fff4dc" />
      <path d="M26 36l26 9M26 44l26 9M68 45l26-9M68 53l26-9" stroke="#e09e2c" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 40v28" stroke="#e09e2c" strokeWidth="2" />
      <path d="M60 10l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#ffd66e" className="bob" />
    </svg>
  );
}

export function ScrollArt({ open = false }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 120 100" className={`scroll-art ${open ? 'open' : ''}`} aria-hidden>
      <defs>
        <linearGradient id="scroll-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#f7e2c8" />
        </linearGradient>
        <radialGradient id="scroll-light" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fdd0e3" />
          <stop offset="1" stopColor="#fdd0e3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="50" rx="58" ry="40" fill="url(#scroll-light)" className="pulse" />
      <rect x="26" y="20" width="68" height="62" rx="4" fill="url(#scroll-paper)" />
      <rect x="18" y="14" width="84" height="12" rx="6" fill="#a283f1" />
      <rect x="18" y="76" width="84" height="12" rx="6" fill="#a283f1" />
      <circle cx="18" cy="20" r="6" fill="#ffd66e" />
      <circle cx="102" cy="20" r="6" fill="#ffd66e" />
      <circle cx="18" cy="82" r="6" fill="#ffd66e" />
      <circle cx="102" cy="82" r="6" fill="#ffd66e" />
      <path d="M38 38h44M38 48h44M38 58h30" stroke="#c7a46a" strokeWidth="3" strokeLinecap="round" />
      {/* three branches: saying, deed, approval */}
      <circle cx="40" cy="68" r="3.5" fill="#ef82b2" />
      <circle cx="52" cy="68" r="3.5" fill="#3fd0c9" />
      <circle cx="64" cy="68" r="3.5" fill="#f5c048" />
    </svg>
  );
}
