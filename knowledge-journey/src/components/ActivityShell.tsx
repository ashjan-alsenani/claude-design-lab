import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { sfx } from '../audio/sound';
import { ACTIVITIES } from '../data/activities';
import { navigate } from '../lib/router';
import type { ActivityId } from '../lib/types';
import { say } from '../state/guide';
import { ACTIVITY_ORDER, BADGES, recordRun, starsFor, type RunResult } from '../state/progress';
import { ACTIVITY_GEM, Gem } from './art/Gem';
import { celebrate } from './Confetti';
import { Hud } from './Hud';
import { Icon } from './Icon';
import { TeamBar } from './TeamBar';
import './shell.css';

export interface ActivityProps {
  onFinish: (run: RunResult) => void;
}

interface Reward {
  run: RunResult;
  stars: number;
  badges: string[];
}

export function ActivityShell({ id, Activity }: { id: ActivityId; Activity: ComponentType<ActivityProps> }) {
  const meta = ACTIVITIES[id];
  const [runKey, setRunKey] = useState(0);
  const [reward, setReward] = useState<Reward | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [id, runKey]);

  const finish = (run: RunResult) => {
    const badges = recordRun(id, run);
    setReward({ run, stars: starsFor(run.correct, run.total), badges });
    sfx('gem');
    celebrate('confetti', 0.5, 0.35);
    say(id === 'crown' ? 'مبارك! لقد تُوّجتِ في قصر المعرفة!' : 'أحسنتِ! لقد اقتربتِ من الكنز التالي!', 'cheer');
  };

  const nextId = ACTIVITY_ORDER[ACTIVITY_ORDER.indexOf(id) + 1];

  return (
    <div className="shell" data-activity={id}>
      <Hud title={meta.title} onBack={() => navigate({ name: 'map' })} />
      <TeamBar />
      <main ref={mainRef} tabIndex={-1} className="shell-main" aria-label={meta.title}>
        <Activity key={runKey} onFinish={finish} />
      </main>
      <AnimatePresence>
        {reward && id !== 'crown' && (
          <RewardModal
            key="reward"
            id={id}
            reward={reward}
            onReplay={() => {
              setReward(null);
              setRunKey((k) => k + 1);
            }}
            onMap={() => navigate({ name: 'map' })}
            onNext={nextId ? () => navigate({ name: 'map' }) : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RewardModal({
  id,
  reward,
  onReplay,
  onMap,
}: {
  id: ActivityId;
  reward: Reward;
  onReplay: () => void;
  onMap: () => void;
  onNext?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onMap();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onMap]);
  const { run, stars, badges } = reward;
  return (
    <motion.div className="modal-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="reward panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reward-title"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
      >
        <motion.div
          className="reward-gem"
          initial={{ y: 60, scale: 0.4, rotate: -30, opacity: 0 }}
          animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.9, bounce: 0.45, delay: 0.15 }}
        >
          <span className="reward-gem-glow" />
          <Gem hue={ACTIVITY_GEM[id]} size={112} />
        </motion.div>
        <h2 id="reward-title">حصلتِ على جوهرة {ACTIVITIES[id].title}!</h2>
        <div className="reward-stars" aria-label={`${stars} من 3 نجوم`}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              data-on={i < stars}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.45 + i * 0.15 }}
            >
              <Icon name="star" size={40} />
            </motion.span>
          ))}
        </div>
        <dl className="reward-stats">
          <div>
            <dt>النقاط</dt>
            <dd className="num">+{run.score} XP</dd>
          </div>
          {run.total > 0 && (
            <div>
              <dt>الإجابات الصحيحة</dt>
              <dd className="num">
                {run.correct} / {run.total}
              </dd>
            </div>
          )}
        </dl>
        {badges.length > 0 && (
          <div className="reward-badges">
            {badges.map((b) => {
              const badge = BADGES.find((x) => x.id === b)!;
              return (
                <motion.div key={b} className="badge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                  <Icon name="trophy" size={20} />
                  <span>
                    <strong>شارة جديدة: {badge.name}</strong>
                    <small>{badge.description}</small>
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
        <div className="reward-actions">
          <button ref={ref} type="button" className="btn btn-gold btn-lg" onClick={onMap}>
            <Icon name="map" />
            العودة إلى الخريطة
          </button>
          <button type="button" className="btn btn-ghost-ink" onClick={onReplay}>
            <Icon name="replay" />
            إعادة النشاط
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
