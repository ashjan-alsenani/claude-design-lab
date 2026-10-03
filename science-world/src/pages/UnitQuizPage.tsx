import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getUnit, subjectOfUnit, unitName } from '../data/units';
import { useProgress } from '../state/ProgressContext';
import { isUnitQuizUnlocked } from '../state/journey';
import { QuizRunner } from '../components/QuizRunner';
import { RewardScreen } from '../components/RewardScreen';
import { LockedNotice } from './LockedNotice';

/** "تحقّق من تقدّمك" — the book's end-of-unit questions. */
export function UnitQuizPage() {
  const { unitId } = useParams();
  const unit = getUnit(unitId);
  const navigate = useNavigate();
  const { state, completeUnitQuiz, setSubject } = useProgress();
  useEffect(() => {
    if (unit) setSubject(subjectOfUnit(unit.id).id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit?.id]);
  const [result, setResult] = useState<{ stars: number; coins: number; score: number; total: number } | null>(null);
  const [round, setRound] = useState(0);

  if (!unit) return <LockedNotice title="لم نجد هذه الوحدة" text="" />;
  if (!isUnitQuizUnlocked(state, unit)) return <LockedNotice title="اختبار الوحدة مقفل 🔒" text="أكمل كل دروس الوحدة أولًا!" />;

  return (
    <div className="lesson" data-theme={unit.theme}>
      <header className="lesson__bar">
        <Link to="/journey" className="icon-btn" aria-label="العودة إلى خريطة الرحلة">
          ✕
        </Link>
        <div className="lesson__bar-mid">
          <div className="lesson__bar-title">
            {unit.emoji} {unitName(unit)}: {unit.title}
          </div>
        </div>
        <span className="chip">🎓 اختبار</span>
      </header>
      {!result ? (
        <QuizRunner
          key={round}
          questions={unit.unitQuiz}
          title="تحقّق من تقدّمك"
          intro="هذه أسئلة الكتاب في نهاية الوحدة. خذ وقتك، واقرأ كل سؤال جيدًا 🌟"
          onFinish={(score, total) => setResult({ ...completeUnitQuiz(unit.id, score, total), score, total })}
        />
      ) : (
        <RewardScreen
          title={`أنهيت اختبار وحدة «${unit.title}»!`}
          subtitle="لقد فتحت التحدي النهائي للوحدة 👑"
          stars={result.stars}
          score={{ got: result.score, total: result.total }}
          coins={result.coins}
          actions={
            <>
              <button type="button" className="btn btn--sun btn--lg" onClick={() => navigate(`/boss/${unit.id}`)}>
                إلى التحدي النهائي 👑
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setResult(null);
                  setRound((r) => r + 1);
                }}
              >
                🔁 أعد الاختبار
              </button>
            </>
          }
        />
      )}
    </div>
  );
}
