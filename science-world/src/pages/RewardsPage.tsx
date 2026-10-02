import { lessonNo } from '../lib/format';
import { achievements, characters } from '../data/rewards';
import { allLessons } from '../data/units';
import { useProgress } from '../state/ProgressContext';
import { totalStars } from '../state/journey';
import { RewardBadge } from '../components/RewardBadge';
import { Mascot } from '../components/Mascot';

export function RewardsPage() {
  const { state } = useProgress();
  const badges = achievements.filter((a) => a.kind === 'badge');
  const trophies = achievements.filter((a) => a.kind === 'trophy');
  const has = (id: string) => state.badges.includes(id);

  return (
    <div className="page rewards">
      <header className="zone-hero zone-hero--sun">
        <div>
          <h1 className="page-title">🏆 غرفة الجوائز</h1>
          <p className="page-sub">كل ما جمعته في مغامرتك!</p>
          <div className="treasure-row">
            <span className="treasure">
              ⭐ <strong>{totalStars(state)}</strong> نجمة
            </span>
            <span className="treasure">
              🪙 <strong>{state.coins}</strong> عملة
            </span>
            <span className="treasure">
              🏅 <strong>{state.badges.length}</strong> وسام
            </span>
            <span className="treasure">
              🎯 <strong>{state.points}</strong> نقطة تحدٍّ
            </span>
          </div>
        </div>
        <Mascot mood="celebrating" size={120} />
      </header>

      <section>
        <h2 className="section-title">🏆 الكؤوس</h2>
        <div className="reward-grid">
          {trophies.map((a) => (
            <RewardBadge key={a.id} emoji={a.emoji} title={a.title} description={a.description} howTo={a.howTo} unlocked={has(a.id)} kind="trophy" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">🏅 الأوسمة</h2>
        <div className="reward-grid">
          {badges.map((a) => (
            <RewardBadge key={a.id} emoji={a.emoji} title={a.title} description={a.description} howTo={a.howTo} unlocked={has(a.id)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">🤖 شخصيات نوري</h2>
        <div className="reward-grid reward-grid--chars">
          {characters.map((c) => {
            const on = c.unlocked(state);
            return (
              <div key={c.id} className={`char-card ${on ? '' : 'char-card--locked'}`}>
                <Mascot mood={on ? 'happy' : 'thinking'} size={96} outfit={c.outfit} />
                <strong>{c.name}</strong>
                <small>{on ? 'مفتوحة ✓' : c.howTo}</small>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="section-title">🎨 ملصقات الدروس</h2>
        <div className="sticker-grid">
          {allLessons.map((l) => {
            const on = Boolean(state.lessons[l.id]);
            return (
              <div key={l.id} className={`sticker ${on ? 'sticker--on' : ''}`} title={on ? l.title : `أكمل الدرس ${lessonNo(l.id)} لتفتحه!`}>
                <span className="sticker__emoji" aria-hidden="true">
                  {l.emoji}
                </span>
                <span className="sticker__label">{on ? l.title : `أكمل الدرس ${lessonNo(l.id)} لتفتحه!`}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
