import { motion } from 'framer-motion';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { sfx } from '../audio/sound';
import { IslandArt } from '../components/art/Island';
import { celebrate } from '../components/Confetti';
import { Hud } from '../components/Hud';
import { Icon } from '../components/Icon';
import { TeamBar } from '../components/TeamBar';
import { ACTIVITIES } from '../data/activities';
import { navigate } from '../lib/router';
import type { ActivityId } from '../lib/types';
import { say } from '../state/guide';
import { ACTIVITY_ORDER, clearFreshUnlock, gemCount, isUnlocked, progressStore, useProgress } from '../state/progress';
import { useTeacher } from '../state/teacher';
import './map.css';

type Pt = [number, number];

// Serpentine route, reading right-to-left like the Arabic page.
const WIDE: Pt[] = [
  [86, 30],
  [63, 22],
  [40, 31],
  [16, 25],
  [15, 73],
  [38, 79],
  [61, 71],
  [85, 76],
];
const TALL: Pt[] = [
  [68, 6],
  [32, 18.5],
  [68, 31],
  [32, 43.5],
  [68, 56],
  [32, 68.5],
  [68, 81],
  [50, 93.5],
];

const wideQuery = '(min-width: 900px) and (min-aspect-ratio: 1/1)';
function useWide() {
  return useSyncExternalStore(
    (fn) => {
      const m = window.matchMedia(wideQuery);
      m.addEventListener('change', fn);
      return () => m.removeEventListener('change', fn);
    },
    () => window.matchMedia(wideQuery).matches,
    () => true,
  );
}

function routePath(pts: Pt[]): string {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const my = (y0 + y1) / 2;
    d += ` C${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
  }
  return d;
}

export function MapScreen() {
  const wide = useWide();
  const pts = wide ? WIDE : TALL;
  const progress = useProgress((p) => p);
  const unlockAll = useTeacher((t) => t.unlockAll);
  const gems = gemCount(progress);
  const [celebrating, setCelebrating] = useState<ActivityId | null>(null);

  const current = ACTIVITY_ORDER.find((id) => !progress.activities[id].completed && isUnlocked(progress, id, unlockAll)) ?? null;
  const reached = ACTIVITY_ORDER.reduce((n, id, i) => (isUnlocked(progress, id, unlockAll) ? i : n), 0);

  useEffect(() => {
    if (!progressStore.get().name) {
      navigate({ name: 'intro' });
      return;
    }
    const fresh = progressStore.get().freshUnlock;
    if (fresh) {
      const t = window.setTimeout(() => {
        setCelebrating(fresh);
        sfx('unlock');
        const i = ACTIVITY_ORDER.indexOf(fresh);
        const [x, y] = (window.matchMedia(wideQuery).matches ? WIDE : TALL)[i];
        if (window.matchMedia(wideQuery).matches) celebrate('sparkles', x / 100, Math.min(0.9, y / 100 + 0.08), 1.2);
        say(`فُتحت جزيرة «${ACTIVITIES[fresh].title}»! هيا إليها.`, 'wow');
        clearFreshUnlock();
      }, 700);
      return () => window.clearTimeout(t);
    }
    if (!progressStore.get().activities.gates.completed) say('اضغطي على «بوابة المعرفة» لتبدأ المغامرة!', 'happy');
  }, []);

  const d = useMemo(() => routePath(pts), [pts]);
  const lit = useMemo(() => routePath(pts.slice(0, reached + 1)), [pts, reached]);

  return (
    <div className="map-screen">
      <Hud />
      <TeamBar />
      <section className="map-head">
        <h1>خريطة الجزر{progress.name ? ` — رحلة ${progress.name}` : ''}</h1>
        <div className="map-progress" role="progressbar" aria-valuemin={0} aria-valuemax={8} aria-valuenow={gems} aria-label="الجزر المكتملة">
          <div className="map-progress-track">
            <motion.div className="map-progress-fill" initial={false} animate={{ width: `${(gems / 8) * 100}%` }} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }} />
          </div>
          <span className="num">أكملتِ {gems} من 8 جزر</span>
        </div>
      </section>

      <div className="map-world" data-layout={wide ? 'wide' : 'tall'}>
        <svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d={d} className="route-base" vectorEffect="non-scaling-stroke" />
          <path d={lit} className="route-lit" vectorEffect="non-scaling-stroke" />
          <path d={lit} className="route-glow" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="map-islands">
          {ACTIVITY_ORDER.map((id, i) => {
            const meta = ACTIVITIES[id];
            const res = progress.activities[id];
            const unlocked = isUnlocked(progress, id, unlockAll);
            const isCurrent = id === current;
            const [x, y] = pts[i];
            return (
              <li key={id} className="island-slot" style={{ left: `${x}%`, top: `${y}%`, ['--i' as string]: i }}>
                <motion.button
                  type="button"
                  className="island"
                  data-state={res.completed ? 'done' : unlocked ? 'open' : 'locked'}
                  data-current={isCurrent}
                  aria-label={`${meta.index}. ${meta.title}${res.completed ? ' — مكتملة' : unlocked ? '' : ' — مقفلة'}`}
                  aria-disabled={!unlocked}
                  onClick={() => {
                    if (!unlocked) {
                      sfx('wrong');
                      say(id === 'crown' ? 'أكملي الجزر السبع أولًا لتُفتح بوابة القصر الذهبية.' : 'هذه الجزيرة مقفلة. أكملي الجزيرة السابقة لفتحها.', 'think');
                      return;
                    }
                    sfx('whoosh');
                    navigate({ name: 'play', id });
                  }}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={celebrating === id ? { opacity: 1, y: 0, scale: [1, 1.18, 1], filter: ['brightness(1)', 'brightness(1.6)', 'brightness(1)'] } : { opacity: 1, y: 0, scale: 1 }}
                  transition={celebrating === id ? { duration: 1.1 } : { delay: 0.08 * i, type: 'spring', duration: 0.7, bounce: 0.25 }}
                  whileHover={unlocked ? { y: -6 } : undefined}
                  whileTap={unlocked ? { scale: 0.96 } : undefined}
                >
                  <span className="island-art">
                    <IslandArt id={id} locked={!unlocked} />
                  </span>
                  {isCurrent && <span className="island-beacon" aria-hidden />}
                  <span className="island-plate">
                    <span className="island-num">{meta.index}</span>
                    <span className="island-name">{meta.title}</span>
                    {!unlocked && <Icon name="lock" size={16} />}
                  </span>
                  {res.completed && (
                    <span className="island-done" aria-hidden>
                      <span className="island-check">
                        <Icon name="check" size={16} />
                      </span>
                      <span className="island-stars">
                        {[0, 1, 2].map((s) => (
                          <span key={s} data-on={s < res.stars}>
                            <Icon name="star" size={14} />
                          </span>
                        ))}
                      </span>
                    </span>
                  )}
                  {isCurrent && <span className="island-cta">{res.plays ? 'تابعي' : 'ابدئي هنا'}</span>}
                </motion.button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
