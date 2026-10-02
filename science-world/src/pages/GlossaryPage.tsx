import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { glossary } from '../data/glossary';
import { units } from '../data/units';

/** 📖 The book's glossary, searchable. */
export function GlossaryPage() {
  const [q, setQ] = useState('');
  const norm = (s: string) => s.replace(/[ً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/^ال/, '');
  const list = useMemo(() => {
    const n = norm(q.trim());
    return glossary.filter((g) => !n || norm(g.term).includes(n) || norm(g.definition).includes(n));
  }, [q]);
  return (
    <div className="page">
      <div className="challenge-run__bar">
        <Link to="/games" className="icon-btn" aria-label="رجوع إلى الألعاب">
          →
        </Link>
        <h1 className="page-title">📖 قاموس العلوم</h1>
      </div>
      <label className="search">
        <span aria-hidden="true">🔎</span>
        <input type="search" placeholder="ابحث عن كلمة… مثل: القلب" value={q} onChange={(e) => setQ(e.target.value)} aria-label="ابحث في القاموس" />
      </label>
      <p className="page-sub">{list.length} مصطلحًا</p>
      <dl className="glossary">
        {list.map((g) => {
          const u = units.find((x) => x.id === g.unitId)!;
          return (
            <div key={g.term} className="glossary__item" data-theme={u.theme}>
              <dt>
                {g.term} <span className="chip">{u.emoji} ص {g.page}</span>
              </dt>
              <dd>{g.definition}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
