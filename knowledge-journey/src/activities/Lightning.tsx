import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { sfx } from '../audio/sound';
import type { ActivityProps } from '../components/ActivityShell';
import { celebrate } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { QuestionCard } from '../components/QuestionCard';
import { TimerRing } from '../components/TimerRing';
import { navigate } from '../lib/router';
import { isFourOption, prepare } from '../lib/questions';
import { sample } from '../lib/random';
import { speedScore, useCountdown } from '../lib/useCountdown';
import { encourage, praise, say } from '../state/guide';
import { teacherStore } from '../state/teacher';
import './lightning.css';

export function Lightning({ onFinish }: ActivityProps) {
  const [mode, setMode] = useState<'lobby' | 'solo'>('lobby');
  return mode === 'lobby' ? <Lobby onSolo={() => setMode('solo')} /> : <Solo onFinish={onFinish} />;
}

function Lobby({ onSolo }: { onSolo: () => void }) {
  const { lightningSeconds, lightningCount } = teacherStore.get();
  return (
    <div className="lightning lobby">
      <div className="arena-lights" aria-hidden />
      <header className="stage-intro">
        <motion.div className="bolt-badge" initial={{ scale: 0.6, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <svg viewBox="0 0 64 64" width="84" height="84" aria-hidden>
            <path d="M38 4 14 36h14l-6 24 28-34H35l7-22Z" fill="#ffd66e" stroke="#fff3c4" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <h2>تحدي البرق</h2>
        <p>
          {lightningCount} أسئلة عشوائية، {lightningSeconds} ثانية لكل سؤال. كلما أسرعتِ في الإجابة الصحيحة زادت نقاطكِ!
        </p>
      </header>
      <div className="lobby-modes">
        <button type="button" className="mode-card" onClick={() => { sfx('whoosh'); onSolo(); }}>
          <Icon name="sparkle" size={30} />
          <strong>تحدٍّ فردي</strong>
          <span>العبي وحدكِ واجمعي الجوهرة.</span>
        </button>
        <button type="button" className="mode-card" onClick={() => navigate({ name: 'arena' })}>
          <Icon name="users" size={30} />
          <strong>منافسة صفية</strong>
          <span>للمعلمة: فرق الصف تتنافس على شاشة واحدة.</span>
        </button>
      </div>
    </div>
  );
}

function Solo({ onFinish }: ActivityProps) {
  const settings = teacherStore.get();
  const seconds = settings.lightningSeconds;
  const questions = useMemo(() => {
    const pool = settings.questions.filter(isFourOption);
    return sample(pool, Math.min(settings.lightningCount, pool.length)).map((q) => prepare(q));
  }, [settings]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gain, setGain] = useState<number | null>(null);
  const q = questions[i];
  const answered = picked !== null || timedOut;

  const remaining = useCountdown(seconds, !answered, i, () => {
    setTimedOut(true);
    setStreak(0);
    sfx('timeout');
    say('انتهت المهلة! انظري إلى الإجابة الصحيحة وتوضيحها.', 'think');
  });

  const pick = (k: number) => {
    if (answered) return;
    setPicked(k);
    const ok = k === q.answer;
    const pts = speedScore(ok, remaining, seconds);
    setScore((s) => s + pts);
    setGain(pts);
    if (ok) {
      setCorrect((c) => c + 1);
      setStreak((s) => s + 1);
      sfx('correct');
      celebrate('sparkles', 0.5, 0.35, 0.8);
      if (streak + 1 >= 3) say(`سلسلة ${streak + 1} إجابات صحيحة! أنتِ كالبرق!`, 'cheer');
      else praise();
    } else {
      setStreak(0);
      sfx('wrong');
      encourage();
    }
  };

  const next = () => {
    if (i + 1 >= questions.length) {
      onFinish({ score: Math.round(score / 5), correct, total: questions.length, feats: correct >= 8 ? ['lightning'] : [] });
      return;
    }
    setI(i + 1);
    setPicked(null);
    setTimedOut(false);
    setGain(null);
  };

  if (!q) return <p className="stage-intro">لا توجد أسئلة رباعية الخيارات كافية في بنك الأسئلة.</p>;

  return (
    <div className="lightning">
      <div className="arena-lights" aria-hidden />
      <div className="bolt-bar">
        <span className="bolt-progress num">
          سؤال {i + 1} / {questions.length}
        </span>
        <span className="bolt-score num">
          <Icon name="sparkle" size={18} /> {score} نقطة
          <AnimatePresence>
            {gain !== null && gain > 0 && (
              <motion.em key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: -18 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
                +{gain}
              </motion.em>
            )}
          </AnimatePresence>
        </span>
        {streak >= 2 && <span className="bolt-streak">سلسلة × {streak}</span>}
      </div>
      <div className="bolt-track" aria-hidden>
        <motion.span animate={{ width: `${((i + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>
      <QuestionCard
        key={q.id}
        q={q}
        picked={picked}
        timedOut={timedOut}
        onPick={pick}
        aside={<TimerRing remaining={answered ? remaining : remaining} total={seconds} size={72} />}
      >
        {answered && (
          <div className="row-center">
            <button type="button" className="btn btn-gold btn-lg" onClick={next} autoFocus>
              {i + 1 >= questions.length ? 'النتيجة النهائية' : 'السؤال التالي'}
              <Icon name="next" />
            </button>
          </div>
        )}
      </QuestionCard>
    </div>
  );
}
