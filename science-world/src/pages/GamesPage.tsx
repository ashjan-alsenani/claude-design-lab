import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { units } from '../data/units';
import { glossary } from '../data/glossary';
import type { LessonStep, UnitId } from '../data/types';
import { useProgress } from '../state/ProgressContext';
import { learnedLessons } from '../state/learned';
import { SpinWheel } from '../games/SpinWheel';
import { Flashcards } from '../games/Flashcards';
import { StepView, stepIcon, headingOf } from '../activities/StepView';
import { Mascot } from '../components/Mascot';
import { MascotMessage } from '../components/MascotMessage';
import { play } from '../lib/sound';

type Game = 'wheel' | 'flash' | 'box' | null;
const playable: LessonStep['type'][] = ['sort', 'match', 'order', 'memory', 'hotspot', 'process', 'flip', 'experiment'];

export function GamesPage() {
  const { state } = useProgress();
  const [game, setGame] = useState<Game>(null);
  const [unitFilter, setUnitFilter] = useState<UnitId | 'all'>('all');
  const [replay, setReplay] = useState<{ key: string; step: LessonStep } | null>(null);
  const learned = learnedLessons(state);

  const boxItems = useMemo(
    () =>
      learned.flatMap((l) =>
        l.steps
          .map((s, i) => ({ s, i }))
          .filter(({ s }) => playable.includes(s.type))
          .map(({ s, i }) => ({ key: `${l.id}-${i}`, lesson: l, step: s })),
      ),
    [learned],
  );
  const deck = useMemo(() => glossary.filter((g) => unitFilter === 'all' || g.unitId === unitFilter), [unitFilter]);

  const tiles = [
    { id: 'wheel' as const, icon: '🎡', title: 'عجلة المراجعة', text: 'أدِر العجلة وأجب عن سؤال من دروسك', tone: 'coral', locked: learned.length === 0 },
    { id: 'flash' as const, icon: '🔄', title: 'بطاقات المصطلحات', text: `${glossary.length} مصطلحًا من قاموس الكتاب`, tone: 'aqua', locked: false },
    { id: 'box' as const, icon: '🧺', title: 'صندوق الألعاب', text: 'أعد لعب أنشطتك المفضلة', tone: 'leaf', locked: learned.length === 0 },
  ];

  if (game) {
    const t = tiles.find((x) => x.id === game)!;
    return (
      <div className="page">
        <div className="challenge-run__bar">
          <button
            type="button"
            className="icon-btn"
            onClick={() => {
              if (replay) setReplay(null);
              else setGame(null);
            }}
            aria-label="رجوع"
          >
            →
          </button>
          <h1 className="page-title">
            {t.icon} {t.title}
          </h1>
        </div>
        {game === 'wheel' && <SpinWheel lessons={learned} />}
        {game === 'flash' && (
          <>
            <div className="tabs" role="tablist" aria-label="اختر الوحدة">
              {[{ id: 'all' as const, label: 'الكل' }, ...units.map((u) => ({ id: u.id, label: `${u.emoji} ${u.title}` }))].map((tab) => (
                <button key={tab.id} type="button" role="tab" aria-selected={unitFilter === tab.id} className={`tab ${unitFilter === tab.id ? 'tab--on' : ''}`} onClick={() => setUnitFilter(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>
            <Flashcards key={unitFilter} entries={deck} />
          </>
        )}
        {game === 'box' &&
          (replay ? (
            <div className="replay">
              <h2 className="section-title">
                {stepIcon[replay.step.type]} {headingOf(replay.step)}
              </h2>
              <StepView key={replay.key} step={replay.step} onComplete={() => undefined} onAnswer={() => setReplay(null)} />
              <button type="button" className="btn btn--ghost" onClick={() => setReplay(null)}>
                🧺 العودة إلى الصندوق
              </button>
            </div>
          ) : (
            <div className="box-grid">
              {boxItems.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  className="box-item"
                  data-theme={units.find((u) => u.id === b.lesson.unitId)!.theme}
                  onClick={() => {
                    play('tap');
                    setReplay({ key: b.key, step: b.step });
                  }}
                >
                  <span className="box-item__icon">{stepIcon[b.step.type]}</span>
                  <span className="box-item__title">{headingOf(b.step)}</span>
                  <span className="box-item__lesson">
                    {b.lesson.emoji} {b.lesson.title}
                  </span>
                </button>
              ))}
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="page games">
      <header className="zone-hero zone-hero--leaf">
        <div>
          <h1 className="page-title">🎮 الألعاب</h1>
          <p className="page-sub">العب وراجع ما تعلّمته بطرق ممتعة!</p>
        </div>
        <Mascot mood="happy" size={110} />
      </header>
      {learned.length === 0 && <MascotMessage mood="encouraging">بعض الألعاب تُفتح بعد أول درس. ابدأ الآن من خريطة الرحلة! 🗺️</MascotMessage>}
      <div className="challenge-grid">
        {tiles.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`challenge-card challenge-card--${t.tone} ${t.locked ? 'challenge-card--locked' : ''}`}
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => {
              if (t.locked) return;
              play('tap');
              setGame(t.id);
            }}
            aria-disabled={t.locked}
          >
            <span className="challenge-card__icon">{t.locked ? '🔒' : t.icon}</span>
            <span className="challenge-card__title">{t.title}</span>
            <span className="challenge-card__text">{t.locked ? 'أكمل درسًا واحدًا لفتحها' : t.text}</span>
          </button>
        ))}
        <Link to="/games/glossary" className="challenge-card challenge-card--grape" onClick={() => play('tap')}>
          <span className="challenge-card__icon">📖</span>
          <span className="challenge-card__title">قاموس العلوم</span>
          <span className="challenge-card__text">ابحث عن معنى أي مصطلح في الكتاب</span>
        </Link>
      </div>
    </div>
  );
}
