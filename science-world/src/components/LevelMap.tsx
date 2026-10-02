import { lessonNo } from '../lib/format';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Unit } from '../data/types';
import { useProgress } from '../state/ProgressContext';
import { isBossUnlocked, isLessonDone, isLessonUnlocked, isUnitQuizUnlocked } from '../state/journey';
import { allLessons } from '../data/units';
import { play } from '../lib/sound';
import { Mascot } from './Mascot';
import { Stars } from './Stars';

type NodeState = 'done' | 'current' | 'locked';
interface MapNode {
  key: string;
  label: string;
  sub: string;
  icon: string;
  state: NodeState;
  stars?: number;
  to: string;
  lockedMsg: string;
  kind: 'lesson' | 'quiz' | 'boss';
}

const ROW = 128;
const xs = [50, 76, 58, 26, 42, 72]; // zig-zag positions (% from left)

/** One island of the journey: lessons → unit quiz → final challenge. */
export function LevelMap({ unit }: { unit: Unit }) {
  const { state } = useProgress();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  const firstOpen = (() => {
    const l = unit.lessons.find((x) => isLessonUnlocked(state, x.id) && !isLessonDone(state, x.id));
    return l?.id;
  })();

  const nodes: MapNode[] = [
    ...unit.lessons.map<MapNode>((l) => {
      const done = isLessonDone(state, l.id);
      const open = isLessonUnlocked(state, l.id);
      const prev = allLessons[allLessons.findIndex((x) => x.id === l.id) - 1];
      return {
        key: l.id,
        label: l.title,
        sub: `المستوى ${lessonNo(l.id)}`,
        icon: l.emoji,
        state: done ? 'done' : open ? 'current' : 'locked',
        stars: state.lessons[l.id]?.stars,
        to: `/lesson/${l.id}`,
        lockedMsg: prev ? `أكمل الدرس ${lessonNo(prev.id)} «${prev.title}» لتفتح هذا المستوى!` : '',
        kind: 'lesson',
      };
    }),
    {
      key: `${unit.id}-quiz`,
      label: 'تحقّق من تقدّمك',
      sub: 'اختبار الوحدة',
      icon: '🎯',
      state: state.unitQuizzes[unit.id] ? 'done' : isUnitQuizUnlocked(state, unit) ? 'current' : 'locked',
      stars: state.unitQuizzes[unit.id]?.stars,
      to: `/quiz/${unit.id}`,
      lockedMsg: 'أكمل كل دروس هذه الوحدة لتفتح اختبارها!',
      kind: 'quiz',
    },
    {
      key: `${unit.id}-boss`,
      label: unit.boss.title || 'التحدي النهائي',
      sub: 'التحدي النهائي',
      icon: '👑',
      state: state.bosses[unit.id] ? 'done' : isBossUnlocked(state, unit) ? 'current' : 'locked',
      to: `/boss/${unit.id}`,
      lockedMsg: 'أنهِ اختبار الوحدة لتفتح التحدي النهائي!',
      kind: 'boss',
    },
  ];

  const height = nodes.length * ROW + 40;
  const pts = nodes.map((_, i) => ({ x: xs[i % xs.length], y: i * ROW + ROW / 2 + 10 }));
  const path = pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const my = (prev.y + p.y) / 2;
    return `${d} C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
  }, '');
  const doneCount = nodes.filter((n) => n.state === 'done').length;
  const donePts = pts.slice(0, Math.max(1, doneCount + 1));
  const donePath = donePts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = donePts[i - 1];
    const my = (prev.y + p.y) / 2;
    return `${d} C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
  }, '');

  function open(n: MapNode) {
    if (n.state === 'locked') {
      play('wrong');
      setToast(n.lockedMsg);
      window.setTimeout(() => setToast((t) => (t === n.lockedMsg ? null : t)), 2600);
      return;
    }
    play('tap');
    navigate(n.to);
  }

  return (
    <div className="map" style={{ height }} data-theme={unit.theme}>
      <svg className="map__path" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={path} className="map__road" vectorEffect="non-scaling-stroke" />
        <path d={path} className="map__dash" vectorEffect="non-scaling-stroke" />
        {doneCount > 0 && <path d={donePath} className="map__trail" vectorEffect="non-scaling-stroke" />}
      </svg>
      {nodes.map((n, i) => {
        const p = pts[i];
        const isHere = n.kind === 'lesson' ? n.key === firstOpen : n.state === 'current' && !firstOpen;
        return (
          <div key={n.key} className={`station station--${n.state} station--${n.kind}`} style={{ left: `${p.x}%`, top: p.y }}>
            {isHere && (
              <div className="station__you" aria-hidden="true">
                <Mascot mood="excited" size={58} />
              </div>
            )}
            <button
              type="button"
              className="station__btn"
              onClick={() => open(n)}
              aria-label={`${n.sub}: ${n.label}${n.state === 'locked' ? ' (مقفل)' : n.state === 'done' ? ' (مكتمل)' : ''}`}
            >
              <span className="station__icon" aria-hidden="true">
                {n.state === 'locked' ? '🔒' : n.icon}
              </span>
              {n.state === 'done' && <span className="station__check" aria-hidden="true">✓</span>}
            </button>
            <div className="station__label">
              <span className="station__sub">{n.sub}</span>
              <span className="station__name">{n.label}</span>
              {n.state === 'done' && n.stars !== undefined && <Stars count={n.stars} size="sm" />}
            </div>
          </div>
        );
      })}
      <AnimatePresence>
        {toast && (
          <motion.div className="map__toast" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}>
            🔒 {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
