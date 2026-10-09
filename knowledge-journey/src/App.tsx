import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect } from 'react';
import { ACTIVITY_COMPONENTS } from './activities/registry';
import { sound } from './audio/sound';
import { ActivityShell } from './components/ActivityShell';
import { Sky } from './components/art/Sky';
import { ConfettiLayer } from './components/Confetti';
import { ConfirmLayer } from './components/Confirm';
import { HelpVideoLayer } from './components/HelpVideo';
import { Guide } from './components/Guide';
import { useReducedMotionClass } from './lib/motion';
import { parseHash, useHash, navigate } from './lib/router';
import { Arena } from './screens/Arena';
import { Intro } from './screens/Intro';
import { MapScreen } from './screens/MapScreen';
import { Teacher } from './screens/Teacher';
import { isUnlocked, progressStore } from './state/progress';
import { teacherStore } from './state/teacher';
import { usePlay } from './state/play';

export default function App() {
  const reduced = useReducedMotionClass();
  const route = parseHash(useHash());
  const group = usePlay((p) => p.mode === 'group');
  useEffect(() => {
    document.documentElement.classList.toggle('board-mode', group);
  }, [group]);

  // Unlock audio on the first interaction anywhere (never auto-plays music).
  useEffect(() => {
    const once = () => sound.unlock();
    window.addEventListener('pointerdown', once, { once: true });
    window.addEventListener('keydown', once, { once: true });
    return () => {
      window.removeEventListener('pointerdown', once);
      window.removeEventListener('keydown', once);
    };
  }, []);

  // Guard deep links into locked activities.
  useEffect(() => {
    if (route.name === 'play') {
      const p = progressStore.get();
      if (!p.name || !isUnlocked(p, route.id, teacherStore.get().unlockAll)) navigate({ name: p.name ? 'map' : 'intro' });
    }
  }, [route]);

  const key = route.name === 'play' ? `play-${route.id}` : route.name;
  const skyVariant = route.name === 'teacher' || route.name === 'arena' ? 'night' : route.name === 'play' && route.id === 'crown' ? 'gold' : 'dusk';
  const Activity = route.name === 'play' ? ACTIVITY_COMPONENTS[route.id] : undefined;

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'never'}>
      <Sky variant={skyVariant} motes={!reduced} orb={route.name === 'intro'} />
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          className="screen"
          initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none', transform: 'none' } }}
          exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {route.name === 'intro' && <Intro />}
          {route.name === 'map' && <MapScreen />}
          {route.name === 'play' && Activity && <ActivityShell id={route.id} Activity={Activity} />}
          {route.name === 'teacher' && <Teacher />}
          {route.name === 'arena' && <Arena />}
        </motion.div>
      </AnimatePresence>
      {route.name !== 'teacher' && route.name !== 'arena' && <Guide />}
      <ConfettiLayer />
      <ConfirmLayer />
      <HelpVideoLayer />
    </MotionConfig>
  );
}
