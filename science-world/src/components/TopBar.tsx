import { Link } from 'react-router-dom';
import { useProgress } from '../state/ProgressContext';
import { totalStars } from '../state/journey';
import { Navigation } from './Navigation';

export function TopBar() {
  const { state, toggleSound } = useProgress();
  return (
    <header className="topbar">
      <Link to="/" className="brand" aria-label="مغامرة العلوم — الصفحة الرئيسية">
        <span className="brand__logo" aria-hidden="true">🤖</span>
        <span className="brand__name">مغامرة العلوم</span>
      </Link>
      <Navigation variant="top" />
      <div className="topbar__stats">
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
