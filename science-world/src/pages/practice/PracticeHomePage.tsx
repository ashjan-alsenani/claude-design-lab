import { Link } from 'react-router-dom';
import { subjects } from '../../data/units';
import { bankIndex } from '../../practice/bank';
import { usePractice, unitStats } from '../../practice/store';
import { Mascot } from '../../components/Mascot';
import { Ring } from '../../components/Ring';
import { play } from '../../lib/sound';
import { learner } from '../../data/learner';

/** «تدرّب واختبر نفسك» — choose a subject. */
export function PracticeHomePage() {
  const { state } = usePractice();
  const mistakes = Object.values(state.q).filter((r) => !r.last.ok).length;
  const words = Object.keys(state.words).length;
  const total = Object.values(bankIndex).reduce((a, u) => a + u.total, 0);
  const answered = Object.values(state.q).reduce((a, r) => a + r.attempts, 0);

  return (
    <div className="page practice-home">
      <header className="practice-hero">
        <div className="practice-hero__copy">
          <h1 className="page-title">🏋️‍♀️ تدرّبي واختبري نفسكِ</h1>
          <p className="page-sub">تعلّمي، تدرّبي، أخطئي وافهمي، ثم أتقني! كل خطأ يصير درسًا صغيرًا يا {learner.name}.</p>
          <div className="practice-hero__stats">
            <span className="stat-pill">📚 {total} سؤال</span>
            <span className="stat-pill">✍️ {answered} إجابة</span>
          </div>
        </div>
        <Mascot mood="excited" size={110} />
      </header>

      <section className="practice-subjects" aria-label="المواد">
        {subjects
          .filter((s) => s.units.length > 0)
          .map((s, i) => {
            const units = s.units.filter((u) => bankIndex[u.id]?.total);
            const count = units.reduce((a, u) => a + bankIndex[u.id].total, 0);
            const mastery = units.length ? Math.round(units.reduce((a, u) => a + unitStats(state, s.id, u.id, bankIndex[u.id].concepts.map((c) => c.id)).mastery, 0) / units.length) : 0;
            return (
              <Link key={s.id} to={`/practice/${s.id}`} className="practice-subject" data-theme={s.theme} style={{ animationDelay: `${i * 70}ms` }} onClick={() => play('tap')}>
                <span className="practice-subject__emoji" aria-hidden="true">{s.emoji}</span>
                <span className="practice-subject__text">
                  <strong>{s.title}</strong>
                  <small>{count ? `${count} سؤال في ${units.length} ${units.length === 1 ? 'وحدة' : 'وحدات'}` : 'قريبًا'}</small>
                </span>
                <Ring value={mastery} label={`إتقان ${s.title} ${mastery}%`} />
              </Link>
            );
          })}
      </section>

      <section className="practice-extras">
        <Link to="/practice/mistakes" className="tile tile--coral" onClick={() => play('tap')}>
          <span className="tile__icon" aria-hidden="true">❌</span>
          <span className="tile__title">أخطائي</span>
          <span className="tile__text">{mistakes ? `${mistakes} سؤالًا نتعلّم منها` : 'لا أخطاء بعد'}</span>
        </Link>
        <Link to="/practice/mistakes#words" className="tile tile--aqua" onClick={() => play('tap')}>
          <span className="tile__icon" aria-hidden="true">⭐</span>
          <span className="tile__title">كلماتي</span>
          <span className="tile__text">{words ? `${words} كلمة إنجليزية` : 'احفظي الكلمات الصعبة هنا'}</span>
        </Link>
      </section>
    </div>
  );
}
