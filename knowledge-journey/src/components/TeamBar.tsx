import { AnimatePresence, motion } from 'framer-motion';
import { currentTeam, usePlay } from '../state/play';
import { TEAMS } from '../state/teacher';
import { TeamEmblem } from './TeamEmblem';
import './teambar.css';

/** Live team scoreboard for group (board) play. Highlights whose turn it is. */
export function TeamBar() {
  const p = usePlay((x) => x);
  if (p.mode !== 'group') return null;
  const turn = currentTeam(p);
  const turnInfo = TEAMS.find((t) => t.id === turn);
  return (
    <div className="teambar" role="region" aria-label="نقاط الفرق">
      <AnimatePresence>
        {turnInfo && p.turn > 0 && (
          <motion.div
            key={p.turn}
            className="turn-banner"
            aria-hidden
            style={{ ['--team' as string]: turnInfo.color }}
            initial={{ opacity: 0, y: -20, scale: 0.85 }}
            animate={{ opacity: [0, 1, 1, 0], y: [-20, 0, 0, -10], scale: [0.85, 1, 1, 0.95] }}
            transition={{ duration: 2.6, times: [0, 0.12, 0.8, 1], delay: 0.9 }}
          >
            <TeamEmblem id={turnInfo.id} size={40} />
            الدور على <strong>{turnInfo.name}</strong>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {turn ? `الدور على ${TEAMS.find((t) => t.id === turn)!.name}` : ''}
      </span>
      {p.teams.map((id) => {
        const t = TEAMS.find((x) => x.id === id)!;
        const active = id === turn;
        return (
          <motion.div key={id} className="tb-team" data-active={active} style={{ ['--team' as string]: t.color }} layout>
            <TeamEmblem id={id} size={28} />
            <span className="tb-name">{t.name}</span>
            <span className="tb-score num">{p.scores[id] ?? 0}</span>
            {active && <span className="tb-turn">دورها</span>}
            <AnimatePresence>
              {p.last && p.last.team === id && p.last.points > 0 && (
                <motion.span
                  key={p.last.key}
                  className="tb-gain num"
                  initial={{ opacity: 0, y: 6, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -26, scale: 1.1 }}
                  transition={{ duration: 1.6 }}
                >
                  +{p.last.points}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
