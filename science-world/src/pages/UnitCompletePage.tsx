import { learner } from '../data/learner';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getUnit, subjectOfUnit } from '../data/units';
import { characters } from '../data/rewards';
import { useProgress } from '../state/ProgressContext';
import { Mascot } from '../components/Mascot';
import { Stars } from '../components/Stars';
import { celebrate } from '../lib/confetti';
import { play } from '../lib/sound';
import { LockedNotice } from './LockedNotice';

/** 🎉 Big celebration when a unit is finished. */
export function UnitCompletePage() {
  const { unitId } = useParams();
  const unit = getUnit(unitId);
  const { state, markUnitCelebrated } = useProgress();

  useEffect(() => {
    if (!unit || !state.bosses[unit.id]) return;
    play('level');
    celebrate();
    const t = window.setTimeout(celebrate, 1500);
    markUnitCelebrated(unit.id);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit?.id]);

  if (!unit) return <LockedNotice title="لم نجد هذه الوحدة" text="" />;
  if (!state.bosses[unit.id]) return <LockedNotice title="لم تنتهِ الوحدة بعد" text="أكمل الدروس والاختبار والتحدي النهائي 💪" />;

  const lessonStars = unit.lessons.reduce((a, l) => a + (state.lessons[l.id]?.stars ?? 0), 0);
  const quiz = state.unitQuizzes[unit.id];
  const stars = lessonStars + (quiz?.stars ?? 0);
  const maxStars = (unit.lessons.length + 1) * 3;
  const subjectUnits = subjectOfUnit(unit.id).units;
  const next = subjectUnits[subjectUnits.findIndex((u) => u.id === unit.id) + 1];
  const outfit = characters.find((c) => c.unitId === unit.id);

  return (
    <div className="page complete" data-theme={unit.theme}>
      <motion.div className="complete__card card" initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}>
        <div className="complete__rays" aria-hidden="true" />
        <div className="complete__kicker">🎉 مبروك يا {learner.name}!</div>
        <h1>أكملتِ مغامرة «{unit.world}»!</h1>
        <p className="page-sub">أنهيتِ كل دروس وحدة {unit.title} والاختبار والتحدي النهائي.</p>
        <Mascot mood="celebrating" size={160} outfit={outfit?.outfit} />
        <div className="complete__stats">
          <div className="mini-stat">
            <span className="mini-stat__icon">⭐</span>
            <strong>
              {stars}/{maxStars}
            </strong>
            <span>النجوم</span>
          </div>
          {quiz && (
            <div className="mini-stat">
              <span className="mini-stat__icon">🎯</span>
              <strong>
                {quiz.best}/{quiz.total}
              </strong>
              <span>اختبار الوحدة</span>
            </div>
          )}
          <div className="mini-stat">
            <span className="mini-stat__icon">🏆</span>
            <strong>كأس جديدة</strong>
            <span>كأس {unit.world}</span>
          </div>
        </div>
        <Stars count={Math.round((stars / maxStars) * 3)} size="lg" animate />
        {outfit && <p className="complete__unlock">🎁 فتحتِ شخصية جديدة: <strong>{outfit.name}</strong>!</p>}
        <div className="reward-screen__actions">
          {next ? (
            next.lessons.length > 0 && (
              <Link to={`/lesson/${next.lessons[0].id}`} className="btn btn--sun btn--lg">
                الوحدة التالية: {next.title} {next.emoji} ←
              </Link>
            )
          ) : (
            <Link to="/rewards" className="btn btn--sun btn--lg">
              👑 أنهيتِ كتاب {subjectOfUnit(unit.id).title} كله! شاهدي جوائزك
            </Link>
          )}
          <Link to="/rewards" className="btn btn--ghost">
            🏆 غرفة الجوائز
          </Link>
          <Link to="/journey" className="btn btn--ghost">
            🗺️ الخريطة
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
