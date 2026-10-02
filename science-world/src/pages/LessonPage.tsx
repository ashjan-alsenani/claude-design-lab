import { lessonNo } from '../lib/format';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { allLessons, getLesson, unitOfLesson } from '../data/units';
import type { Lesson } from '../data/types';
import { useProgress } from '../state/ProgressContext';
import { isLessonUnlocked, isUnitQuizUnlocked } from '../state/journey';
import { StepView, headingOf, isPassive, stepIcon } from '../activities/StepView';
import { ProgressBar } from '../components/ProgressBar';
import { QuizRunner } from '../components/QuizRunner';
import { RewardScreen } from '../components/RewardScreen';
import { MascotMessage } from '../components/MascotMessage';
import { Mascot } from '../components/Mascot';
import { play } from '../lib/sound';
import { LockedNotice } from './LockedNotice';

type Phase = 'intro' | 'steps' | 'quiz' | 'reward';

export function LessonPage() {
  const { id } = useParams();
  const lesson = getLesson(id);
  const { state } = useProgress();
  if (!lesson) return <LockedNotice title="لم نجد هذا الدرس" text="ربما تغيّر رابط الدرس." />;
  if (!isLessonUnlocked(state, lesson.id)) {
    return <LockedNotice title="هذا الدرس ما زال مقفلًا 🔒" text="أكمل الدرس الذي قبله أولًا لتفتحه!" />;
  }
  // key resets all local state when moving to the next lesson
  return <LessonRun key={lesson.id} lesson={lesson} />;
}

function LessonRun({ lesson }: { lesson: Lesson }) {
  const unit = unitOfLesson(lesson);
  const navigate = useNavigate();
  const { state, completeLesson, setLastLesson, recordAnswer } = useProgress();
  const [phase, setPhase] = useState<Phase>('intro');
  const [i, setI] = useState(0);
  const [stepDone, setStepDone] = useState(false);
  const [result, setResult] = useState<{ stars: number; coins: number; score: number; total: number } | null>(null);

  useEffect(() => setLastLesson(lesson.id), [lesson.id, setLastLesson]);

  const step = lesson.steps[i];
  const total = lesson.steps.length;
  const markDone = useCallback(() => setStepDone(true), []);

  useEffect(() => {
    setStepDone(step ? isPassive(step) : false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [i, step]);

  function next() {
    play('tap');
    if (i < total - 1) setI(i + 1);
    else setPhase('quiz');
  }

  const nextIdx = allLessons.findIndex((l) => l.id === lesson.id) + 1;
  const nextLesson = allLessons[nextIdx];
  const nextIsSameUnit = nextLesson && nextLesson.unitId === lesson.unitId;

  const progress = phase === 'intro' ? 0 : phase === 'steps' ? (i / (total + 1)) * 100 : phase === 'quiz' ? (total / (total + 1)) * 100 : 100;

  return (
    <div className="lesson" data-theme={unit.theme}>
      <header className="lesson__bar">
        <Link to="/journey" className="icon-btn" aria-label="العودة إلى خريطة الرحلة">
          ✕
        </Link>
        <div className="lesson__bar-mid">
          <div className="lesson__bar-title">
            <span aria-hidden="true">{lesson.emoji}</span> {lessonNo(lesson.id)} · {lesson.title}
          </div>
          <ProgressBar value={progress} label="تقدّم الدرس" />
        </div>
        <span className="chip">{phase === 'steps' ? `${i + 1}/${total}` : phase === 'quiz' ? 'التحدي 🎯' : phase === 'reward' ? '🏁' : '👋'}</span>
      </header>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.section key="intro" className="lesson-intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}>
            <div className="lesson-intro__hero card">
              <div className="lesson-intro__emoji" aria-hidden="true">
                {lesson.emoji}
              </div>
              <div className="eyebrow">
                {unit.emoji} الوحدة {unit.number}: {unit.title}
              </div>
              <h1>{lesson.title}</h1>
              {lesson.verse && <p className="verse">{lesson.verse}</p>}
            </div>
            <div className="lesson-intro__grid">
              <div className="card">
                <h2 className="card-title">🎯 في نهاية الدرس أستطيع أن…</h2>
                <ul className="checklist">
                  {lesson.objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
              {lesson.vocab.length > 0 && (
                <div className="card">
                  <h2 className="card-title">🔤 كلمات جديدة سنتعلمها</h2>
                  <div className="vocab">
                    {lesson.vocab.map((v) => (
                      <details key={v.word} className="vocab__item">
                        <summary>{v.word}</summary>
                        <p>{v.meaning}</p>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="lesson-intro__go">
              <Mascot mood="excited" size={90} />
              <button
                type="button"
                className="btn btn--accent btn--lg"
                onClick={() => {
                  play('tap');
                  setPhase('steps');
                }}
                autoFocus
              >
                لنبدأ المغامرة! 🚀
              </button>
            </div>
          </motion.section>
        )}

        {phase === 'steps' && step && (
          <motion.section key={`step-${i}`} className="lesson-step" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30, transition: { duration: 0.15 } }} transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}>
            <div className="lesson-step__head">
              <span className="lesson-step__icon" aria-hidden="true">
                {stepIcon[step.type]}
              </span>
              <h2>{headingOf(step)}</h2>
            </div>
            <StepView
              step={step}
              onComplete={markDone}
              onAnswer={(r) => {
                recordAnswer(r.firstTry);
                next();
              }}
            />
            {step.type !== 'question' && (
              <div className="lesson-step__foot">
                <button type="button" className="btn btn--ghost" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
                  → رجوع
                </button>
                <button type="button" className={`btn btn--good btn--lg ${stepDone ? 'btn--ready' : ''}`} onClick={next} disabled={!stepDone}>
                  {stepDone ? (i === total - 1 ? 'إلى تحدي الدرس 🎯' : 'التالي ←') : 'أكمل النشاط أولًا ✋'}
                </button>
              </div>
            )}
          </motion.section>
        )}

        {phase === 'quiz' && (
          <motion.section key="quiz" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <QuizRunner
              questions={lesson.quiz}
              title="تحدي الدرس"
              intro="هل أنتِ مستعدة للتحدي؟ كل إجابة صحيحة من أول مرة = نجمة ⭐"
              onFinish={(score, tot) => {
                const r = completeLesson(lesson.id, score, tot);
                setResult({ ...r, score, total: tot });
                setPhase('reward');
              }}
            />
          </motion.section>
        )}

        {phase === 'reward' && result && (
          <motion.section key="reward" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <RewardScreen
              title={`أكملت درس «${lesson.title}»!`}
              stars={result.stars}
              score={{ got: result.score, total: result.total }}
              coins={result.coins}
              actions={
                <>
                  {nextLesson && nextIsSameUnit && (
                    <button type="button" className="btn btn--sun btn--lg" onClick={() => navigate(`/lesson/${nextLesson.id}`)}>
                      الدرس التالي: {nextLesson.title} ←
                    </button>
                  )}
                  {!nextIsSameUnit && isUnitQuizUnlocked(state, unit) && (
                    <button type="button" className="btn btn--sun btn--lg" onClick={() => navigate(`/quiz/${unit.id}`)}>
                      إلى اختبار الوحدة «تحقق من تقدمك» 🎓
                    </button>
                  )}
                  <button type="button" className="btn btn--ghost" onClick={() => navigate('/journey')}>
                    🗺️ خريطة الرحلة
                  </button>
                  {result.stars < 3 && (
                    <button type="button" className="btn btn--ghost" onClick={() => setPhase('quiz')}>
                      🔁 أعد التحدي لتجمع 3 نجوم
                    </button>
                  )}
                </>
              }
            >
              <div className="card learned">
                <h2 className="card-title">📝 ماذا تعلّمتُ؟</h2>
                <ul className="checklist">
                  {lesson.summary.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              {result.stars < 3 && (
                <MascotMessage mood="encouraging" size={64}>
                  بقي القليل! يمكنك إعادة التحدي لتجمع كل النجوم 💪
                </MascotMessage>
              )}
            </RewardScreen>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
