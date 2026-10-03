import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { glossaryFor } from '../data/glossary';
import { getLesson, getSubject, lessonLabel, units } from '../data/units';
import { Say } from '../components/Say';
import { useProgress } from '../state/ProgressContext';
import { SubjectTabs } from '../components/SubjectTabs';

/** 📖 The book's glossary, searchable. */
export function GlossaryPage() {
  const [q, setQ] = useState('');
  const { state } = useProgress();
  const subject = getSubject(state.subject);
  const glossary = useMemo(() => glossaryFor(subject.id), [subject.id]);
  const norm = (s: string) => s.toLowerCase().replace(/[ً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/^ال/, '');
  const list = useMemo(() => {
    const n = norm(q.trim());
    return glossary.filter((g) => !n || norm(g.term).includes(n) || norm(g.definition).includes(n));
  }, [q, glossary]);
  return (
    <div className="page">
      <div className="challenge-run__bar">
        <Link to="/games" className="icon-btn" aria-label="رجوع إلى الألعاب">
          →
        </Link>
        <h1 className="page-title">📖 قاموس {subject.title}</h1>
        <SubjectTabs compact />
      </div>
      <label className="search">
        <span aria-hidden="true">🔎</span>
        <input type="search" placeholder={subject.id === 'english' ? 'ابحثي عن كلمة… مثل: karate' : subject.id === 'math' ? 'ابحثي عن كلمة… مثل: المحيط' : 'ابحثي عن كلمة… مثل: القلب'} value={q} onChange={(e) => setQ(e.target.value)} aria-label="ابحث في القاموس" />
      </label>
      <p className="page-sub">{list.length} مصطلحًا</p>
      <dl className="glossary">
        {list.map((g) => {
          const u = units.find((x) => x.id === g.unitId)!;
          return (
            <div key={g.term + g.page} className="glossary__item" data-theme={u.theme}>
              <dt>
                {g.term} <Say text={g.term} />
                <span className="chip">
                  {u.emoji} {g.lessonId ? `درس ${lessonLabel(getLesson(g.lessonId)!)}` : `ص ${g.page}`}
                </span>
              </dt>
              <dd>{g.definition}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
