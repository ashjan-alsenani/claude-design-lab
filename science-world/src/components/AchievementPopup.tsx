import { learner } from '../data/learner';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '../state/ProgressContext';
import { play } from '../lib/sound';
import { burst } from '../lib/confetti';
import { Mascot } from './Mascot';

/** Celebrates each newly unlocked badge/trophy, one at a time. */
export function AchievementPopup() {
  const { pendingAchievements, dismissAchievement } = useProgress();
  const current = pendingAchievements[0];

  useEffect(() => {
    if (!current) return;
    play('achievement');
    burst({ x: 0.5, y: 0.45 });
  }, [current]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          className="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          onClick={dismissAchievement}
        >
          <motion.div
            className="achievement card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ach-title"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', duration: 0.5, bounce: 0.35 } }}
            exit={{ scale: 0.96, opacity: 0, transition: { duration: 0.15 } }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="achievement__ribbon">{current.kind === 'trophy' ? `كأس جديدة لـ${learner.name}!` : `وسام جديد لـ${learner.name}!`}</div>
            <div className="achievement__medal" aria-hidden="true">
              {current.emoji}
            </div>
            <h2 id="ach-title">{current.title}</h2>
            <p>{current.description}</p>
            <Mascot mood="celebrating" size={90} />
            <button type="button" className="btn btn--sun btn--lg" onClick={dismissAchievement} autoFocus>
              رائع يا {learner.name}! ⭐
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
