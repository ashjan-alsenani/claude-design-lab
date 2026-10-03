import { useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { learner } from '../data/learner';
import type { MascotMood, Subject, SubjectId } from '../data/types';
import { getSubject, lessonsOf, subjects } from '../data/units';
import { useProgress } from '../state/ProgressContext';
import { levelInfo, nextStop, nextStopPath, overallPercent, stopPath, totalStars } from '../state/journey';
import { Mascot } from '../components/Mascot';
import { ProgressBar } from '../components/ProgressBar';
import { play } from '../lib/sound';

/** Little things that float around each subject's world card. */
const worldDecor: Record<SubjectId, string[]> = {
  science: ['🫀', '🌱', '🧪'],
  math: ['📐', '➗', '🔷'],
  english: ['💬', '📖', '🎧'],
};

const moods: MascotMood[] = ['happy', 'excited', 'surprised', 'celebrating', 'thinking'];

function greeting() {
  const h = new Date().getHours();
  return h >= 4 && h < 12 ? { icon: '☀️', text: 'صباح الخير' } : { icon: '🌙', text: 'مساء الخير' };
}

/** Circular progress: fills once when it appears. */
function Ring({ value, label }: { value: number; label: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" role="img" aria-label={label}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="ring__track" />
        <circle cx="32" cy="32" r={r} className="ring__fill" style={{ strokeDasharray: c, '--ring-off': c * (1 - value / 100), '--ring-c': c } as CSSProperties} />
      </svg>
      <span className="ring__value">{value}%</span>
    </div>
  );
}

export function HomePage() {
  const { state, setSubject } = useProgress();
  const navigate = useNavigate();
  const [m, setM] = useState(0);

  const ready = subjects.filter((s) => s.units.length > 0);
  const current = getSubject(state.subject);
  const started = Object.keys(state.lessons).length > 0 || Boolean(state.lastLesson);
  const next = nextStop(state);
  const lvl = levelInfo(state);
  const hello = greeting();

  const lines = [
    `أهلًا يا ${learner.name}! أنا نوري، رفيقكِ في كل المواد 🤖`,
    `معي ${ready.map((s) => s.short ?? s.title).join(' و')}… اختاري كوكبًا! 🪐`,
    'أوه! لقد دغدغتِني 😄',
    'هل تعرفين كم مرة يدق قلبك في الدقيقة؟ 🤔',
    'كم ضلعًا للشكل السداسي؟ 🔷',
    `هيا نقرأ بالإنجليزية: Let's go! 🚀`,
  ];

  const go = (path: string, id: SubjectId) => {
    play('tap');
    setSubject(id);
    navigate(path);
  };

  const nextTitle =
    next.kind === 'lesson'
      ? next.lesson.title
      : next.kind === 'quiz'
        ? `اختبار ${next.unit.title}`
        : next.kind === 'boss'
          ? `التحدي النهائي: ${next.unit.boss.title}`
          : 'أنهيتِ كل شيء! 🏆';
  const nextEmoji = next.kind === 'lesson' ? next.lesson.emoji : next.kind === 'quiz' ? '🎓' : next.kind === 'boss' ? '👑' : '🏆';

  return (
    <div className="page home">
      {/* ---------- Hero: Nouri with the subject planets ---------- */}
      <section className="hero">
        <span className="hero__spark" style={{ top: '14%', insetInlineStart: '46%' }} aria-hidden="true">✦</span>
        <span className="hero__spark" style={{ top: '78%', insetInlineStart: '6%', animationDelay: '1.2s' }} aria-hidden="true">✦</span>
        <span className="hero__spark" style={{ top: '30%', insetInlineStart: '4%', animationDelay: '2s' }} aria-hidden="true">✦</span>

        <div className="hero__copy">
          <div className="hero__kicker">
            {hello.icon} {hello.text} يا {learner.name}
          </div>
          <h1 className="hero__title">
            مغامرة التعلّم
            <span>مع نوري</span>
          </h1>
          <p className="hero__lead">العلوم والرياضيات والإنجليزية في عالم واحد. اكتشفي والعبي واجمعي النجوم!</p>
          <div className="hero__cta">
            <button type="button" className="btn btn--sun btn--lg hero__start" onClick={() => navigate(started ? nextStopPath(state) : '/journey')}>
              {started ? 'أكملي التعلّم ←' : 'ابدئي المغامرة 🚀'}
            </button>
            <Link to="/journey" className="btn btn--ghost btn--lg">
              🗺️ خريطة الرحلة
            </Link>
          </div>
        </div>

        <div className="hero__stage">
          <div className="speech" key={m}>
            {lines[m % lines.length]}
          </div>
          <div className="orbit">
            <div className="orbit__path" aria-hidden="true" />
            <div className="orbit__ring">
              {ready.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className="planet"
                  data-theme={s.theme}
                  style={{ '--a': `${(360 / ready.length) * i - 90}deg` } as CSSProperties}
                  onClick={() => go('/journey', s.id)}
                  aria-label={`افتحي رحلة ${s.title}`}
                >
                  <span className="planet__body">
                    <span aria-hidden="true">{s.emoji}</span>
                    <small>{s.short ?? s.title}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="orbit__center" onClickCapture={() => setM((v) => v + 1)}>
              <Mascot mood={moods[m % moods.length]} size={140} interactive label="اضغطي على نوري" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Continue where you left off ---------- */}
      {started && (
        <button type="button" className="resume" data-theme={current.theme} onClick={() => navigate(nextStopPath(state))}>
          <span className="resume__icon" aria-hidden="true">
            {nextEmoji}
          </span>
          <span className="resume__text">
            <span className="resume__label">
              {current.emoji} أكملي {current.short ?? current.title} من حيث توقفتِ
            </span>
            <strong>{nextTitle}</strong>
          </span>
          <span className="resume__go" aria-hidden="true">
            ←
          </span>
        </button>
      )}

      {/* ---------- Subject worlds ---------- */}
      <section aria-labelledby="worlds-title">
        <h2 id="worlds-title" className="section-title">
          🪐 عوالمكِ
        </h2>
        <div className="worlds-home">
          {subjects.map((sub, i) => (
            <WorldCard key={sub.id} sub={sub} index={i} onGo={go} />
          ))}
        </div>
      </section>

      {/* ---------- Level & totals ---------- */}
      <section className="home-stats card" aria-label="ملخص تقدمي">
        <div className="home-stats__level">
          <span className="level-badge">{lvl.level}</span>
          <div>
            <div className="eyebrow">المستوى</div>
            <strong>{lvl.title}</strong>
          </div>
        </div>
        <div className="home-stats__bar">
          <div className="home-stats__row">
            <span>رحلتي في كل المواد</span>
            <strong>{overallPercent(state)}%</strong>
          </div>
          <ProgressBar value={overallPercent(state)} tone="sun" label="نسبة إنجاز الرحلة" />
        </div>
        <div className="home-stats__pills">
          <span className="stat-pill">⭐ {totalStars(state)}</span>
          <span className="stat-pill stat-pill--coin">🪙 {state.coins}</span>
          <span className="stat-pill stat-pill--fire">🔥 {state.streak.count}</span>
        </div>
      </section>

      {/* ---------- Shortcuts ---------- */}
      <section className="home-tiles" aria-label="أقسام الموقع">
        {[
          { to: '/lessons', icon: '📚', title: 'الدروس', text: 'كل دروس الكتب', tone: 'primary' },
          { to: '/challenges', icon: '🎯', title: 'التحديات', text: 'سباقات وألغاز', tone: 'coral' },
          { to: '/games', icon: '🎮', title: 'الألعاب', text: 'عجلة وبطاقات وذاكرة', tone: 'leaf' },
          { to: '/challenges#review', icon: '📝', title: 'المراجعة', text: 'اختبار شامل', tone: 'grape' },
          { to: '/rewards', icon: '🏆', title: 'جوائزي', text: `${state.badges.length} وسام`, tone: 'sun' },
          { to: '/progress', icon: '📊', title: 'تقدّمي', text: `${Object.keys(state.lessons).length} درس مكتمل`, tone: 'aqua' },
        ].map((t, i) => (
          <Link key={t.to + i} to={t.to} className={`tile tile--${t.tone}`} style={{ animationDelay: `${300 + i * 50}ms` }} onClick={() => play('tap')}>
            <span className="tile__icon" aria-hidden="true">
              {t.icon}
            </span>
            <span className="tile__title">{t.title}</span>
            <span className="tile__text">{t.text}</span>
          </Link>
        ))}
      </section>

      <p className="dedication">💜 صُمّم هذا العالم خصيصًا لـ <strong>{learner.fullName}</strong> لتتعلّم وهي تلعب.</p>
    </div>
  );
}

function WorldCard({ sub, index, onGo }: { sub: Subject; index: number; onGo: (path: string, id: SubjectId) => void }) {
  const { state } = useProgress();
  const ready = sub.units.length > 0;
  const lessons = lessonsOf(sub.id);
  const done = lessons.filter((l) => state.lessons[l.id]).length;
  const pct = overallPercent(state, sub.id);
  const nx = nextStop(state, sub.id);
  return (
    <article className="world-card" data-theme={sub.theme} style={{ animationDelay: `${120 + index * 70}ms` }}>
      <div className="world-card__sky" aria-hidden="true">
        {worldDecor[sub.id].map((d, k) => (
          <span key={k} className="world-card__decor" style={{ animationDelay: `${k * 0.9}s` }}>
            {d}
          </span>
        ))}
        <span className="world-card__planet">{sub.emoji}</span>
      </div>
      <div className="world-card__body">
        <div className="world-card__head">
          <div>
            <h3>{sub.title}</h3>
            <p>{sub.tagline}</p>
          </div>
          <Ring value={pct} label={`أنجزتِ ${pct}% من ${sub.title}`} />
        </div>
        <div className="world-card__facts">
          <span>⭐ {totalStars(state, sub.id)}</span>
          <span>
            📘 {done} من {lessons.length} درس
          </span>
        </div>
        {ready && nx.kind === 'lesson' && (
          <div className="world-card__next">
            التالي: {nx.lesson.emoji} {nx.lesson.title}
          </div>
        )}
        <div className="world-card__actions">
          <button type="button" className="btn btn--accent" disabled={!ready} onClick={() => onGo(stopPath(nx), sub.id)}>
            {!ready ? 'قريبًا 🚧' : done > 0 ? 'أكملي ←' : 'ابدئي 🚀'}
          </button>
          {ready && (
            <button type="button" className="btn btn--ghost" onClick={() => onGo('/journey', sub.id)}>
              🗺️ الخريطة
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
