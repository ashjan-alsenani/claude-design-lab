import { learner } from '../data/learner';
import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { play } from '../lib/sound';
import { celebrate } from '../lib/confetti';
import { Mascot } from './Mascot';
import { Stars } from './Stars';

interface Props {
  title: string;
  subtitle?: string;
  stars: number;
  score?: { got: number; total: number };
  coins?: number;
  children?: ReactNode;
  actions: ReactNode;
}

const headlines = [`رائع يا ${learner.name}! ⭐`, `أحسنتِ يا ${learner.name}!`, 'أنتِ تتقدّمين بسرعة! 🚀', `ممتاز يا ${learner.name}! فتحتِ مستوى جديدًا!`];

/** Stars + coins + confetti after a lesson / quiz. */
export function RewardScreen({ title, subtitle, stars, score, coins, children, actions }: Props) {
  useEffect(() => {
    play('level');
    const t = window.setTimeout(() => play('star'), 700);
    celebrate();
    return () => window.clearTimeout(t);
  }, []);

  return (
    <motion.div className="reward-screen" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', duration: 0.5, bounce: 0.25 }}>
      <div className="reward-screen__burst" aria-hidden="true" />
      <Mascot mood="celebrating" size={150} />
      <div className="reward-screen__kicker">{headlines[Math.min(stars, 3)]}</div>
      <h1>{title}</h1>
      {subtitle && <p className="reward-screen__sub">{subtitle}</p>}
      <Stars count={stars} size="lg" animate />
      <div className="reward-screen__stats">
        {score && (
          <div className="mini-stat">
            <span className="mini-stat__icon">🎯</span>
            <strong>
              {score.got}/{score.total}
            </strong>
            <span>إجابات من أول مرة</span>
          </div>
        )}
        {coins !== undefined && coins > 0 && (
          <div className="mini-stat">
            <span className="mini-stat__icon coin-spin">🪙</span>
            <strong>+{coins}</strong>
            <span>عملة</span>
          </div>
        )}
      </div>
      {children}
      <div className="reward-screen__actions">{actions}</div>
    </motion.div>
  );
}
