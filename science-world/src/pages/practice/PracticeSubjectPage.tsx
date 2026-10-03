import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSubject, unitName } from '../../data/units';
import { bankIndex } from '../../practice/bank';
import { usePractice, unitStats } from '../../practice/store';
import { Ring } from '../../components/Ring';
import { play } from '../../lib/sound';
import { mixed } from '../../lib/bidi';
import { useProgress } from '../../state/ProgressContext';

/** A subject's units with their practice statistics. */
export function PracticeSubjectPage() {
  const { subject: sid } = useParams();
  const subject = getSubject(sid);
  const { setSubject } = useProgress();
  useEffect(() => setSubject(subject.id), [subject.id, setSubject]);
  const { state } = usePractice();
  return (
    <div className="page practice-subject-page" data-theme={subject.theme}>
      <div className="challenge-run__bar">
        <Link to="/practice" className="icon-btn" aria-label="رجوع">→</Link>
        <h1 className="page-title">{subject.emoji} تدريب {subject.title}</h1>
      </div>
      <div className="practice-units">
        {subject.units.map((u, i) => {
          const idx = bankIndex[u.id];
          const ready = Boolean(idx?.total);
          const st = ready ? unitStats(state, subject.id, u.id, idx.concepts.map((c) => c.id)) : null;
          const inner = (
            <>
              <div className="practice-unit__sky" aria-hidden="true">
                <span>{u.emoji}</span>
              </div>
              <div className="practice-unit__body">
                <div className="eyebrow">{unitName(u)}</div>
                <h2>{mixed(u.title)}</h2>
                {ready && st ? (
                  <>
                    <div className="practice-unit__facts">
                      <span>📚 {idx.total} سؤال</span>
                      <span>✍️ تدرّبتِ على {st.attempted} / {idx.total}</span>
                      <span>🎯 الدقة {st.accuracy}%</span>
                    </div>
                    <span className="btn btn--accent">{st.attempted ? 'أكملي التدريب ←' : 'ابدئي التدريب 🚀'}</span>
                  </>
                ) : (
                  <p className="practice-unit__soon">🚧 أسئلة هذه الوحدة قيد الإعداد</p>
                )}
              </div>
              {ready && st && <Ring value={st.mastery} label={`الإتقان ${st.mastery}%`} />}
            </>
          );
          return ready ? (
            <Link key={u.id} to={`/practice/${subject.id}/${u.id}`} className="practice-unit" data-theme={u.theme} style={{ animationDelay: `${i * 60}ms` }} onClick={() => play('tap')}>
              {inner}
            </Link>
          ) : (
            <div key={u.id} className="practice-unit practice-unit--soon" data-theme={u.theme} style={{ animationDelay: `${i * 60}ms` }}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
