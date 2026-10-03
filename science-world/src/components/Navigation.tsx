import { NavLink } from 'react-router-dom';
import { play } from '../lib/sound';

const items = [
  { to: '/', label: 'الرئيسية', icon: '🏠', mobile: true },
  { to: '/journey', label: 'رحلة التعلم', short: 'الرحلة', icon: '🗺️', mobile: true },
  { to: '/lessons', label: 'الدروس', icon: '📚', mobile: true },
  { to: '/practice', label: 'تدرّبي', icon: '🏋️‍♀️', mobile: true },
  { to: '/games', label: 'الألعاب', icon: '🎮', mobile: true },
  { to: '/challenges', label: 'التحديات', icon: '🎯', mobile: false },
  { to: '/rewards', label: 'جوائزي', icon: '🏆', mobile: true },
  { to: '/progress', label: 'تقدّمي', icon: '📊', mobile: false },
];

/** Desktop: inline in the top bar. Mobile: a thumb-friendly bottom tab bar. */
export function Navigation({ variant }: { variant: 'top' | 'bottom' }) {
  const list = variant === 'bottom' ? items.filter((i) => i.mobile) : items;
  return (
    <nav className={`nav nav--${variant}`} aria-label="التنقل الرئيسي">
      {list.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.to === '/'} className="nav__item" onClick={() => play('tap')}>
          <span className="nav__icon" aria-hidden="true">
            {i.icon}
          </span>
          <span className="nav__label">{variant === 'bottom' && 'short' in i ? i.short : i.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
