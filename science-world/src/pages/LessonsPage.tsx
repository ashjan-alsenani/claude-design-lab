import { Link } from 'react-router-dom';
import { units } from '../data/units';
import { useProgress } from '../state/ProgressContext';
import { isBossUnlocked, isUnitQuizUnlocked } from '../state/journey';
import { LessonCard } from '../components/LessonCard';
import { Stars } from '../components/Stars';

export function LessonsPage() {
  const { state } = useProgress();
  return (
    <div className="page">
      <h1 className="page-title">📚 الدروس</h1>
      <p className="page-sub">كل دروس كتاب العلوم — الصف السادس، الفصل الدراسي الأول.</p>
      {units.map((u) => (
        <section key={u.id} className="unit-block" data-theme={u.theme}>
          <div className="unit-block__head">
            <span className="unit-block__emoji" aria-hidden="true">
              {u.emoji}
            </span>
            <div>
              <div className="eyebrow">الوحدة {u.number}</div>
              <h2>{u.title}</h2>
            </div>
          </div>
          <div className="lesson-list">
            {u.lessons.map((l) => (
              <LessonCard key={l.id} lesson={l} />
            ))}
            {isUnitQuizUnlocked(state, u) ? (
              <Link to={`/quiz/${u.id}`} className="lesson-card lesson-card--quiz">
                <span className="lesson-card__emoji">🎯</span>
                <span className="lesson-card__body">
                  <span className="lesson-card__num">اختبار الوحدة</span>
                  <span className="lesson-card__title">تحقّق من تقدّمك</span>
                  <span className="lesson-card__meta">{u.unitQuiz.length} سؤالًا من الكتاب</span>
                </span>
                <span className="lesson-card__end">{state.unitQuizzes[u.id] ? <Stars count={state.unitQuizzes[u.id]!.stars} size="sm" /> : <span className="lesson-card__go">ابدأ ←</span>}</span>
              </Link>
            ) : (
              <div className="lesson-card lesson-card--locked">
                <span className="lesson-card__emoji">🔒</span>
                <span className="lesson-card__body">
                  <span className="lesson-card__num">اختبار الوحدة</span>
                  <span className="lesson-card__title">تحقّق من تقدّمك</span>
                  <span className="lesson-card__meta">أكمل كل دروس الوحدة لفتحه</span>
                </span>
              </div>
            )}
            {isBossUnlocked(state, u) && (
              <Link to={`/boss/${u.id}`} className="lesson-card lesson-card--boss">
                <span className="lesson-card__emoji">👑</span>
                <span className="lesson-card__body">
                  <span className="lesson-card__num">التحدي النهائي</span>
                  <span className="lesson-card__title">{u.boss.title}</span>
                  <span className="lesson-card__meta">{state.bosses[u.id] ? '🏆 تم الفوز!' : 'اجمع المفاتيح وافتح الكنز'}</span>
                </span>
              </Link>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
