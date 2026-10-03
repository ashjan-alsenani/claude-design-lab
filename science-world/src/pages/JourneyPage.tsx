import { getSubject, unitName } from '../data/units';
import { SubjectTabs } from '../components/SubjectTabs';
import { useProgress } from '../state/ProgressContext';
import { isUnitComplete, unitLessonsDone } from '../state/journey';
import { LevelMap } from '../components/LevelMap';
import { MascotMessage } from '../components/MascotMessage';
import { ProgressBar } from '../components/ProgressBar';
import { mixed } from '../lib/bidi';

const islandDecor: Record<string, string[]> = {
  coral: ['🏖️', '🌴', '🐚', '🦀'],
  leaf: ['🌳', '🦜', '🍄', '🐛'],
  grape: ['⚗️', '🔮', '🧊', '✨'],
  ocean: ['🔢', '🐬', '💯', '🌊'],
  sunset: ['📏', '⏰', '📅', '🧭'],
  mint: ['🔷', '📐', '🔺', '🧊'],
  berry: ['➗', '✖️', '🔟', '🌡️'],
  sky: ['💬', '🌟', '📖', '🎈'],
  lemon: ['⚽', '🏸', '🎨', '🛹'],
  violet: ['💻', '📱', '🎧', '📷'],
};

export function JourneyPage() {
  const { state } = useProgress();
  const subject = getSubject(state.subject);
  return (
    <div className="page journey">
      <header className="journey__head">
        <div className="page-head">
          <h1 className="page-title">🗺️ رحلة {subject.title}</h1>
          <SubjectTabs />
        </div>
        <MascotMessage mood="happy" size={72} compact>
          اتبع الطريق من جزيرة إلى جزيرة! كل محطة تفتح المحطة التي بعدها ⭐
        </MascotMessage>
        <ul className="legend" aria-label="دليل الخريطة">
          <li>
            <span className="legend__dot legend__dot--done">✓</span> مكتمل
          </li>
          <li>
            <span className="legend__dot legend__dot--current">⭐</span> المحطة الحالية
          </li>
          <li>
            <span className="legend__dot legend__dot--locked">🔒</span> مقفل
          </li>
        </ul>
      </header>
      {subject.units.length === 0 && <p className="page-sub">قريبًا… 🚧</p>}
      {subject.units.map((u) => {
        const done = unitLessonsDone(state, u);
        return (
          <section key={u.id} className={`island island--${u.theme}`} data-theme={u.theme} aria-labelledby={`island-${u.id}`}>
            <div className="island__decor" aria-hidden="true">
              {islandDecor[u.theme].map((d, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.8}s` }}>
                  {d}
                </span>
              ))}
            </div>
            <div className="island__head card">
              <span className="island__emoji" aria-hidden="true">
                {u.emoji}
              </span>
              <div className="island__title">
                <div className="eyebrow">{unitName(u)}</div>
                <h2 id={`island-${u.id}`}>{u.world}</h2>
                <p>{mixed(u.title)}</p>
              </div>
              <div className="island__progress">
                <ProgressBar value={u.lessons.length ? (done / u.lessons.length) * 100 : 0} label={`تقدم ${u.title}`} />
                <span>
                  {done}/{u.lessons.length} {isUnitComplete(state, u.id) ? '🏆' : ''}
                </span>
              </div>
            </div>
            <LevelMap unit={u} />
          </section>
        );
      })}
    </div>
  );
}
