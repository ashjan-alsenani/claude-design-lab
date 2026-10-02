import { learner } from '../data/learner';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSubject } from '../data/units';
import { SubjectTabs } from '../components/SubjectTabs';
import type { MemoryStep } from '../data/types';
import { useProgress } from '../state/ProgressContext';
import { isBossUnlocked } from '../state/journey';
import { learnedGlossary, learnedLessons, learnedQuestions } from '../state/learned';
import { sample } from '../lib/random';
import { SpeedChallenge } from '../challenges/SpeedChallenge';
import { BubblePop, type Statement } from '../challenges/BubblePop';
import { Mystery } from '../challenges/Mystery';
import { TablesSprint } from '../challenges/TablesSprint';
import { MemoryGame } from '../activities/Play';
import { QuizRunner } from '../components/QuizRunner';
import { MascotMessage } from '../components/MascotMessage';
import { Mascot } from '../components/Mascot';
import { play } from '../lib/sound';
import { celebrate } from '../lib/confetti';

type Mode = 'speed' | 'bubbles' | 'memory' | 'mystery' | 'review' | 'tables';

const cards: { id: Mode; icon: string; title: string; text: string; tone: string; need: number; only?: 'math' }[] = [
  { id: 'tables', icon: '✖️', title: 'سباق جدول الضرب', text: 'كم ناتج ضرب تحلّين في 60 ثانية؟', tone: 'grape', need: 0, only: 'math' },
  { id: 'speed', icon: '⏱️', title: 'تحدي الدقيقة', text: 'أجب عن أكبر عدد من الأسئلة في 60 ثانية!', tone: 'coral', need: 1 },
  { id: 'bubbles', icon: '🫧', title: 'فرقع الصحيح', text: 'جد 5 عبارات صحيحة بين الفقاعات.', tone: 'aqua', need: 2 },
  { id: 'memory', icon: '🧠', title: 'تحدي الذاكرة', text: 'طابق كل مصطلح مع معناه.', tone: 'grape', need: 1 },
  { id: 'mystery', icon: '🕵️', title: 'لغز «من أنا؟»', text: 'اكتشف المصطلح العلمي من وصفه.', tone: 'leaf', need: 2 },
  { id: 'review', icon: '📝', title: 'اختبار المراجعة الشامل', text: '10 أسئلة مختلطة من كل ما تعلمته.', tone: 'sun', need: 2 },
];

export function ChallengesPage() {
  const { state, recordChallenge } = useProgress();
  const { hash } = useLocation();
  const [mode, setMode] = useState<Mode | null>(null);
  const [result, setResult] = useState<{ mode: Mode; score: number; best: boolean } | null>(null);
  const [round, setRound] = useState(0);
  const learnedCount = learnedLessons(state).length;

  useEffect(() => {
    if (hash === '#review' && learnedCount >= 2) setMode('review');
  }, [hash, learnedCount]);

  const pool = useMemo(() => learnedQuestions(state).map((p) => p.question), [state]);
  // True/false statements: the book's "ماذا تعلّمتُ؟" facts, true/false questions, and fill-in sentences.
  const statements = useMemo<Statement[]>(() => {
    const out: Statement[] = learnedLessons(state).flatMap((l) => l.summary.map((t, i) => ({ id: `${l.id}-s${i}`, text: t, answer: true, explain: t })));
    for (const q of pool) {
      if (q.kind === 'tf') out.push({ id: q.id, text: q.prompt, answer: q.answer, explain: q.explain });
      if (q.kind === 'fill')
        q.choices.forEach((c) =>
          out.push({ id: `${q.id}-${c.id}`, text: q.sentence.replace('___', c.text), answer: c.id === q.answer, explain: q.explain }),
        );
    }
    return out;
  }, [pool, state]);
  const glossaryPool = useMemo(() => learnedGlossary(state), [state]);
  const memoryStep = useMemo<MemoryStep>(() => {
    const words = sample(
      learnedLessons(state).flatMap((l) => l.vocab.map((v) => ({ ...v, lesson: l.id }))),
      6,
    );
    return { type: 'memory', title: 'تحدي الذاكرة', pairs: words.map((w, i) => ({ id: `m${i}`, a: w.word, b: w.meaning.length > 60 ? w.meaning.slice(0, 58) + '…' : w.meaning })) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, mode]);

  function finish(m: Mode, score: number) {
    const { best } = recordChallenge(m, score);
    setResult({ mode: m, score, best });
    play('achievement');
    celebrate();
  }

  const close = () => {
    setMode(null);
    setResult(null);
    setRound((r) => r + 1);
  };

  if (mode && !result) {
    const c = cards.find((x) => x.id === mode)!;
    return (
      <div className="page challenge-run">
        <div className="challenge-run__bar">
          <button type="button" className="icon-btn" onClick={close} aria-label="خروج من التحدي">
            ✕
          </button>
          <h1 className="page-title">
            {c.icon} {c.title}
          </h1>
        </div>
        {mode === 'speed' && <SpeedChallenge key={round} questions={pool} onFinish={(s) => finish('speed', s)} />}
        {mode === 'bubbles' && <BubblePop key={round} statements={statements} onFinish={(s) => finish('bubbles', s)} />}
        {mode === 'memory' && <MemoryGame key={round} step={memoryStep} compact onComplete={() => window.setTimeout(() => finish('memory', 1), 1200)} />}
        {mode === 'mystery' && <Mystery key={round} entries={glossaryPool} onFinish={(s) => finish('mystery', s)} />}
        {mode === 'tables' && <TablesSprint key={round} onFinish={(s) => finish('tables', s)} />}
        {mode === 'review' && <QuizRunner key={round} questions={sample(pool, Math.min(10, pool.length))} title="اختبار المراجعة الشامل" onFinish={(s) => finish('review', s)} />}
      </div>
    );
  }

  if (result) {
    const c = cards.find((x) => x.id === result.mode)!;
    return (
      <div className="page challenge-result">
        <motion.div className="card reward-screen" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <Mascot mood="celebrating" size={140} />
          <div className="reward-screen__kicker">{result.best ? 'رقم قياسي جديد! 🏅' : `أحسنتِ يا ${learner.name}! 🌟`}</div>
          <h1>
            {c.icon} {c.title}
          </h1>
          <div className="reward-screen__stats">
            <div className="mini-stat">
              <span className="mini-stat__icon">🎯</span>
              <strong>{result.mode === 'memory' ? 'فوز!' : result.score}</strong>
              <span>{result.mode === 'memory' ? 'وجدت كل الأزواج' : 'النتيجة'}</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat__icon">🏅</span>
              <strong>+{result.score * 10}</strong>
              <span>نقاط التحدي</span>
            </div>
          </div>
          <div className="reward-screen__actions">
            <button
              type="button"
              className="btn btn--sun btn--lg"
              onClick={() => {
                setResult(null);
                setRound((r) => r + 1);
              }}
            >
              🔁 العب مرة أخرى
            </button>
            <button type="button" className="btn btn--ghost" onClick={close}>
              🎯 كل التحديات
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page challenges">
      <header className="zone-hero zone-hero--coral">
        <div>
          <h1 className="page-title">🎯 منطقة التحديات</h1>
          <SubjectTabs compact />
          <p className="page-sub">تحديات مثيرة من الدروس التي أنهيتِها. هل أنتِ مستعدة؟</p>
          <div className="zone-hero__points">🏅 نقاط التحدي: {state.points}</div>
        </div>
        <Mascot mood="excited" size={120} />
      </header>
      {learnedCount === 0 && state.subject !== 'math' && (
        <MascotMessage mood="encouraging">
          أكملي درسكِ الأول في {getSubject(state.subject).title} لتفتحي التحديات! 🔓{' '}
          <Link to="/journey" className="link">
            إلى الرحلة ←
          </Link>
        </MascotMessage>
      )}
      <div className="challenge-grid">
        {cards.filter((c) => !c.only || c.only === state.subject).map((c, i) => {
          const locked = learnedCount < c.need || (c.id === 'mystery' && glossaryPool.length < 4) || (c.id === 'bubbles' && statements.filter((x) => x.answer).length < 3);
          const best = state.challenges[c.id];
          return (
            <button
              key={c.id}
              type="button"
              className={`challenge-card challenge-card--${c.tone} ${locked ? 'challenge-card--locked' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => {
                if (locked) return;
                play('tap');
                setMode(c.id);
              }}
              aria-disabled={locked}
            >
              <span className="challenge-card__icon" aria-hidden="true">
                {locked ? '🔒' : c.icon}
              </span>
              <span className="challenge-card__title">{c.title}</span>
              <span className="challenge-card__text">{locked ? (c.need <= 1 ? 'أكملي درسًا واحدًا لفتحه' : 'أكملي دروسًا أكثر لفتحه') : c.text}</span>
              {best !== undefined && !locked && <span className="challenge-card__best">أفضل نتيجة: {c.id === 'memory' ? '✓' : best}</span>}
            </button>
          );
        })}
      </div>

      <h2 className="section-title">👑 التحديات النهائية</h2>
      <div className="boss-list">
        {getSubject(state.subject).units.map((u) => {
          const open = isBossUnlocked(state, u);
          return open ? (
            <Link key={u.id} to={`/boss/${u.id}`} className="boss-card" data-theme={u.theme}>
              <span className="boss-card__icon">{state.bosses[u.id] ? '🏆' : '👑'}</span>
              <span>
                <strong>{u.boss.title}</strong>
                <small>{state.bosses[u.id] ? 'فزت بها! العب مرة أخرى' : 'اجمع المفاتيح وافتح الكنز'}</small>
              </span>
            </Link>
          ) : (
            <div key={u.id} className="boss-card boss-card--locked" data-theme={u.theme}>
              <span className="boss-card__icon">🔒</span>
              <span>
                <strong>{u.boss.title || `التحدي النهائي ${u.number}`}</strong>
                <small>أنهِ اختبار وحدة «{u.title}» لفتحه</small>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
