import { Link } from 'react-router-dom';
import { useProgress } from '../state/ProgressContext';
import { totalStars } from '../state/journey';
import { getSubject, subjects } from '../data/units';
import { learner } from '../data/learner';
import { play } from '../lib/sound';
import { Navigation } from './Navigation';

export function TopBar() {
  const { state, toggleSound, setSubject } = useProgress();
  const current = getSubject(state.subject);
  // the pill cycles through the subjects: العلوم → الرياضيات → الإنجليزية → …
  const list = subjects.filter((s) => s.units.length > 0);
  const other = list.length > 1 ? list[(list.findIndex((s) => s.id === current.id) + 1) % list.length] : undefined;
  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label={`مغامرة ${learner.name} — الصفحة الرئيسية`}>
        <span className="brand__logo" aria-hidden="true">🤖</span>
        <span className="brand__name">مغامرة {learner.name}</span>
      </Link>
      <Navigation variant="top" />
      <div className="topbar__stats">
        {other && (
          <button
            type="button"
            className="stat-pill subject-switch"
            data-theme={current.theme}
            onClick={() => {
              play('tap');
              setSubject(other.id);
            }}
            aria-label={`المادة الحالية ${current.title}. اضغطي للانتقال إلى ${other.title}`}
            title={`انتقلي إلى ${other.title}`}
          >
            <span aria-hidden="true">{current.emoji}</span>
            <span className="subject-switch__name">{current.title}</span>
            <span aria-hidden="true">⇄</span>
          </button>
        )}
        <Link to="/progress" className="stat-pill" aria-label={`نجومي ${totalStars(state)}`}>
          <span aria-hidden="true">⭐</span>
          {totalStars(state)}
        </Link>
        <Link to="/rewards" className="stat-pill stat-pill--coin" aria-label={`عملاتي ${state.coins}`}>
          <span aria-hidden="true">🪙</span>
          {state.coins}
        </Link>
        <Link to="/progress" className="stat-pill stat-pill--fire hide-sm" aria-label={`أيام التعلم المتتالية ${state.streak.count}`}>
          <span aria-hidden="true">🔥</span>
          {state.streak.count}
        </Link>
        <button
          type="button"
          className="icon-btn sound-btn"
          onClick={toggleSound}
          aria-pressed={state.sound}
          aria-label={state.sound ? 'إيقاف الأصوات' : 'تشغيل الأصوات'}
          title={state.sound ? 'الصوت يعمل' : 'الصوت متوقف'}
        >
          {state.sound ? '🔊' : '🔇'}
        </button>
      </div>
    </header>
  );
}
