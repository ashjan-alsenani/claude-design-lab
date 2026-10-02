import { learner } from '../data/learner';
import { useState, type PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import type { MascotMood } from '../data/types';
import { units } from '../data/units';
import { useProgress } from '../state/ProgressContext';
import { levelInfo, nextStop, nextStopPath, overallPercent, totalStars, unitLessonsDone } from '../state/journey';
import { Mascot } from '../components/Mascot';
import { ProgressBar } from '../components/ProgressBar';
import { play } from '../lib/sound';

const floaters = [
  { e: '🔬', x: 4, y: 12, d: 1.2 },
  { e: '🫀', x: 44, y: 10, d: 0.8 },
  { e: '🌱', x: 42, y: 84, d: 1.4 },
  { e: '🧪', x: 4, y: 80, d: 1 },
  { e: '🦋', x: 90, y: 92, d: 0.6 },
  { e: '🧊', x: 28, y: 92, d: 0.9 },
];

const moods: MascotMood[] = ['happy', 'excited', 'surprised', 'celebrating', 'thinking'];
const lines = [`مرحبًا يا ${learner.name}! أنا نوري، مرشدكِ في عالم العلوم 🤖`, 'هل أنتِ مستعدة للمغامرة؟ 🚀', 'أوه! لقد دغدغتِني 😄', `لنكتشف شيئًا جديدًا اليوم يا ${learner.name}! ✨`, 'هل تعرفين كم مرة يدق قلبك في الدقيقة؟ 🤔'];

function Floater({ e, x, y, d, mx, my, i }: { e: string; x: number; y: number; d: number; mx: MotionValue<number>; my: MotionValue<number>; i: number }) {
  const tx = useTransform(mx, (v) => v * 26 * d);
  const ty = useTransform(my, (v) => v * 20 * d);
  const [pop, setPop] = useState(0);
  return (
    <motion.button
      type="button"
      className="floater"
      style={{ left: `${x}%`, top: `${y}%`, x: tx, y: ty, animationDelay: `${i * 0.6}s` }}
      onClick={() => {
        play('star');
        setPop((p) => p + 1);
      }}
      aria-label="شكل متحرك"
      tabIndex={-1}
    >
      <motion.span key={pop} initial={pop ? { scale: 1.5, rotate: -20 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', duration: 0.5, bounce: 0.5 }}>
        {e}
      </motion.span>
    </motion.button>
  );
}

export function HomePage() {
  const { state } = useProgress();
  const navigate = useNavigate();
  const [m, setM] = useState(0);
  const mx = useSpring(useMotionValue(0), { stiffness: 80, damping: 14 });
  const my = useSpring(useMotionValue(0), { stiffness: 80, damping: 14 });

  const started = Object.keys(state.lessons).length > 0 || Boolean(state.lastLesson);
  const next = nextStop(state);
  const lvl = levelInfo(state);
  const nextLabel =
    next.kind === 'lesson' ? `${next.lesson.emoji} ${next.lesson.title}` : next.kind === 'quiz' ? `🎓 اختبار ${next.unit.title}` : next.kind === 'boss' ? `👑 التحدي النهائي: ${next.unit.title}` : '🏆 أكملت كل شيء!';

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <div className="page home">
      <section className="hero" onPointerMove={onMove} onPointerLeave={() => (mx.set(0), my.set(0))}>
        {floaters.map((f, i) => (
          <Floater key={i} {...f} mx={mx} my={my} i={i} />
        ))}
        <div className="hero__copy">
          <div className="hero__kicker">👋 أهلًا {learner.name}! · علوم الصف السادس</div>
          <h1 className="hero__title">
            مغامرة العلوم
            <span>مع نوري</span>
          </h1>
          <p className="hero__lead">اكتشفي جسمكِ العجيب، وعالم الكائنات الحية، وأسرار المادة… باللعب والتجارب والتحديات!</p>
          <div className="hero__cta">
            <button type="button" className="btn btn--sun btn--lg hero__start" onClick={() => navigate(started ? nextStopPath(state) : '/journey')}>
              {started ? 'أكملي التعلّم ←' : 'ابدئي التعلّم 🚀'}
            </button>
            {started && (
              <Link to="/journey" className="btn btn--ghost btn--lg">
                🗺️ خريطة الرحلة
              </Link>
            )}
          </div>
          {started && <div className="hero__next">التالي: {nextLabel}</div>}
        </div>
        <div className="hero__mascot">
          <div className="speech" key={m}>
            {lines[m % lines.length]}
          </div>
          <div
            onClickCapture={() => setM((v) => v + 1)}
          >
            <Mascot mood={moods[m % moods.length]} size={220} interactive label="اضغط على نوري" />
          </div>
          <div className="hero__ground" aria-hidden="true" />
        </div>
      </section>

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
            <span>رحلتي</span>
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

      <section className="home-tiles" aria-label="أقسام الموقع">
        {[
          { to: '/lessons', icon: '📚', title: 'الدروس', text: 'كل دروس الكتاب', tone: 'primary' },
          { to: '/challenges', icon: '🎯', title: 'منطقة التحديات', text: 'تحدي الدقيقة واللغز', tone: 'coral' },
          { to: '/games', icon: '🎮', title: 'الألعاب', text: 'عجلة وبطاقات وذاكرة', tone: 'leaf' },
          { to: '/challenges#review', icon: '📝', title: 'منطقة الاختبارات', text: 'مراجعة شاملة', tone: 'grape' },
          { to: '/rewards', icon: '🏆', title: 'جوائزي', text: `${state.badges.length} وسام`, tone: 'sun' },
          { to: '/progress', icon: '📊', title: 'تقدّمي', text: `${Object.keys(state.lessons).length} درس مكتمل`, tone: 'aqua' },
        ].map((t, i) => (
          <Link key={t.to + i} to={t.to} className={`tile tile--${t.tone}`} style={{ animationDelay: `${i * 50}ms` }} onClick={() => play('tap')}>
            <span className="tile__icon" aria-hidden="true">
              {t.icon}
            </span>
            <span className="tile__title">{t.title}</span>
            <span className="tile__text">{t.text}</span>
          </Link>
        ))}
      </section>

      <section className="home-worlds">
        <h2 className="section-title">🌍 عوالم المغامرة</h2>
        <div className="worlds">
          {units.map((u) => {
            const done = unitLessonsDone(state, u);
            return (
              <Link key={u.id} to="/journey" className="world card" data-theme={u.theme}>
                <span className="world__emoji" aria-hidden="true">
                  {u.emoji}
                </span>
                <div className="world__body">
                  <div className="eyebrow">الوحدة {u.number}</div>
                  <h3>{u.title}</h3>
                  <p>{u.intro}</p>
                  <ProgressBar value={u.lessons.length ? (done / u.lessons.length) * 100 : 0} size="sm" label={`تقدم ${u.title}`} />
                  <span className="world__count">
                    {done}/{u.lessons.length} دروس
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <p className="dedication">💜 صُمّم هذا العالم خصيصًا لـ <strong>{learner.fullName}</strong> لتتعلّم العلوم وهي تلعب.</p>
    </div>
  );
}
