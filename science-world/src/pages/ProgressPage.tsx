import { learner } from '../data/learner';
import { lessonNo } from '../lib/format';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { allLessons, lessonLabel, subjects } from '../data/units';
import { useProgress } from '../state/ProgressContext';
import { levelInfo, maxStarsFor, nextStop, nextStopPath, overallPercent, totalStars, unitLessonsDone } from '../state/journey';
import { ProgressBar, ProgressRing } from '../components/ProgressBar';
import { Stars } from '../components/Stars';
import { Mascot } from '../components/Mascot';

export function ProgressPage() {
  const { state, reset } = useProgress();
  const [confirm, setConfirm] = useState(false);
  const lvl = levelInfo(state);
  const pct = overallPercent(state);
  const done = Object.keys(state.lessons).length;
  const accuracy = state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
  const next = nextStop(state);

  return (
    <div className="page progress-page">
      <h1 className="page-title">📊 تقدّم {learner.name}</h1>

      <section className="progress-hero card">
        <ProgressRing value={pct} size={150} color="var(--sun-deep)">
          <strong>{pct}%</strong>
          <small>من الرحلة</small>
        </ProgressRing>
        <div className="progress-hero__info">
          <div className="level-row">
            <span className="level-badge level-badge--lg">{lvl.level}</span>
            <div>
              <div className="eyebrow">المستوى {lvl.level}</div>
              <h2>{lvl.title}</h2>
              <div className="level-row__bar">
                <ProgressBar value={(lvl.into / lvl.need) * 100} tone="sun" size="sm" label="التقدم نحو المستوى التالي" />
                <small>
                  {lvl.need - lvl.into} نجوم للمستوى التالي
                </small>
              </div>
            </div>
          </div>
          {next.kind !== 'done' ? (
            <Link to={nextStopPath(state)} className="btn btn--accent">
              التالي: {next.kind === 'lesson' ? `${next.lesson.emoji} ${next.lesson.title}` : next.kind === 'quiz' ? `🎓 اختبار ${next.unit.title}` : `👑 ${next.unit.boss.title}`} ←
            </Link>
          ) : (
            <div className="chip">🏆 أنهيت الرحلة كلها!</div>
          )}
        </div>
        <Mascot mood={pct > 50 ? 'celebrating' : 'encouraging'} size={100} />
      </section>

      <section className="stat-grid">
        {[
          { icon: '📚', v: `${done}/${allLessons.length}`, l: 'دروس مكتملة' },
          { icon: '⭐', v: `${totalStars(state)}/${maxStarsFor()}`, l: 'النجوم' },
          { icon: '🏅', v: state.badges.length, l: 'الأوسمة والكؤوس' },
          { icon: '🔥', v: `${state.streak.count} ${state.streak.count === 1 ? 'يوم' : 'أيام'}`, l: `أيام التعلم المتتالية (أفضل: ${state.streak.best})` },
          { icon: '🎯', v: `${accuracy}%`, l: 'إجابات صحيحة من أول مرة' },
          { icon: '🪙', v: state.coins, l: 'العملات' },
        ].map((s) => (
          <div key={s.l} className="stat-box card">
            <span className="stat-box__icon" aria-hidden="true">
              {s.icon}
            </span>
            <strong>{s.v}</strong>
            <span>{s.l}</span>
          </div>
        ))}
      </section>

      {subjects.filter((sub) => sub.units.length > 0).map((sub) => (
        <div key={sub.id} className="progress-subject" data-theme={sub.theme}>
          <h2 className="section-title">{sub.emoji} {sub.title} <span className="chip">{overallPercent(state, sub.id)}%</span></h2>
      {sub.units.map((u) => {
        const d = unitLessonsDone(state, u);
        const quiz = state.unitQuizzes[u.id];
        return (
          <section key={u.id} className="card unit-progress" data-theme={u.theme}>
            <div className="unit-progress__head">
              <span className="unit-block__emoji">{u.emoji}</span>
              <div>
                <div className="eyebrow">الوحدة {u.number}</div>
                <h2>{u.title}</h2>
              </div>
              <ProgressRing value={u.lessons.length ? (d / u.lessons.length) * 100 : 0} size={64} stroke={9}>
                <small>
                  {d}/{u.lessons.length}
                </small>
              </ProgressRing>
            </div>
            <ul className="unit-progress__list">
              {u.lessons.map((l) => (
                <li key={l.id} className={state.lessons[l.id] ? 'is-done' : ''}>
                  <span>
                    {state.lessons[l.id] ? '✅' : '⬜'} {lessonNo(lessonLabel(l))} {l.title}
                  </span>
                  {state.lessons[l.id] ? <Stars count={state.lessons[l.id].stars} size="sm" /> : <small>لم يكتمل</small>}
                </li>
              ))}
              <li className={quiz ? 'is-done' : ''}>
                <span>{quiz ? '✅' : '⬜'} 🎯 اختبار الوحدة</span>
                {quiz ? (
                  <span>
                    {quiz.best}/{quiz.total} <Stars count={quiz.stars} size="sm" />
                  </span>
                ) : (
                  <small>لم يبدأ</small>
                )}
              </li>
              <li className={state.bosses[u.id] ? 'is-done' : ''}>
                <span>{state.bosses[u.id] ? '🏆' : '⬜'} 👑 التحدي النهائي</span>
                <small>{state.bosses[u.id] ? 'تم الفوز!' : 'لم يكتمل'}</small>
              </li>
            </ul>
          </section>
        );
      })}
        </div>
      ))}

      <section className="card parents">
        <h2 className="card-title">👨‍👩‍👧 لولي الأمر</h2>
        <p className="page-sub">يُحفظ التقدم على هذا الجهاز فقط (في المتصفح). لا يوجد حساب ولا يُرسل أي شيء إلى الإنترنت.</p>
        {!confirm ? (
          <button type="button" className="btn btn--ghost" onClick={() => setConfirm(true)}>
            🗑️ البدء من جديد
          </button>
        ) : (
          <div className="parents__confirm">
            <strong>هل أنت متأكد؟ سيُمسح كل التقدم والجوائز.</strong>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                reset();
                setConfirm(false);
              }}
            >
              نعم، امسح التقدم
            </button>
            <button type="button" className="btn btn--good" onClick={() => setConfirm(false)}>
              لا، تراجع
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
