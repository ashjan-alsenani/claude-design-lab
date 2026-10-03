import { learner } from '../data/learner';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getUnit, subjectOfUnit } from '../data/units';
import type { BossMission } from '../data/types';
import { useProgress } from '../state/ProgressContext';
import { isBossUnlocked } from '../state/journey';
import { QuestionCard } from '../activities/QuestionCard';
import { MascotMessage } from '../components/MascotMessage';
import { Mascot } from '../components/Mascot';
import { play } from '../lib/sound';
import { celebrate } from '../lib/confetti';
import { LockedNotice } from './LockedNotice';
import { mixed } from '../lib/bidi';

/** The unit's FINAL CHALLENGE: a story where each correct answer earns a key. */
export function BossPage() {
  const { unitId } = useParams();
  const unit = getUnit(unitId);
  const { state } = useProgress();
  if (!unit) return <LockedNotice title="لم نجد هذه الوحدة" text="" />;
  if (!isBossUnlocked(state, unit)) return <LockedNotice title="التحدي النهائي مقفل 🔒" text="أنهِ اختبار «تحقّق من تقدّمك» أولًا!" />;
  return <BossRun key={unit.id} unitId={unit.id} />;
}

function BossRun({ unitId }: { unitId: string }) {
  const unit = getUnit(unitId)!;
  const navigate = useNavigate();
  const { completeBoss, recordAnswer, setSubject } = useProgress();
  useEffect(() => {
    setSubject(subjectOfUnit(unitId).id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);
  const [phase, setPhase] = useState<'story' | 'play' | 'open'>('story');
  const [queue, setQueue] = useState<BossMission[]>(() => unit.boss.missions.slice());
  const [keys, setKeys] = useState<string[]>([]);
  const [retryNote, setRetryNote] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const total = unit.boss.missions.length;
  const mission = queue[0];
  const keySlots = useMemo(() => unit.boss.missions.map((m) => m.id), [unit]);

  function answered(correct: boolean) {
    recordAnswer(correct);
    setAttempt((a) => a + 1);
    const [cur, ...rest] = queue;
    if (correct) {
      play('star');
      const nk = [...keys, cur.id];
      setKeys(nk);
      setRetryNote(false);
      if (nk.length === total) {
        setPhase('open');
        completeBoss(unit.id);
        play('achievement');
        celebrate();
        return;
      }
      setQueue(rest);
    } else {
      // not punished: the mission simply comes back later
      setRetryNote(true);
      setQueue([...rest, cur]);
    }
  }

  return (
    <div className="lesson boss" data-theme={unit.theme}>
      <header className="lesson__bar">
        <Link to="/journey" className="icon-btn" aria-label="العودة إلى خريطة الرحلة">
          ✕
        </Link>
        <div className="lesson__bar-mid">
          <div className="lesson__bar-title">👑 {mixed(unit.boss.title)}</div>
          <div className="keys" aria-label={`المفاتيح: ${keys.length} من ${total}`}>
            {keySlots.map((id) => (
              <span key={id} className={`key ${keys.includes(id) ? 'key--on' : ''}`} aria-hidden="true">
                🔑
              </span>
            ))}
          </div>
        </div>
        <span className="chip">
          {keys.length}/{total}
        </span>
      </header>

      <AnimatePresence mode="wait">
        {phase === 'story' && (
          <motion.section key="story" className="boss-story card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="boss-story__badge">التحدي النهائي</div>
            <Mascot mood="surprised" size={140} />
            <h1>{mixed(unit.boss.title)}</h1>
            <p className="boss-story__text">{mixed(unit.boss.story)}</p>
            <div className="chest chest--closed" aria-hidden="true">
              🧰
            </div>
            <p className="boss-story__goal">
              اجمع {total} مفاتيح 🔑 لتفتح: <strong>{mixed(unit.boss.treasure)}</strong>
            </p>
            <button type="button" className="btn btn--sun btn--lg" onClick={() => setPhase('play')} autoFocus>
              أنا مستعد للتحدي! ⚔️
            </button>
          </motion.section>
        )}
        {phase === 'play' && mission && (
          <motion.section key={`${mission.id}-${attempt}`} className="boss-mission" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}>
            <MascotMessage mood={retryNote ? 'encouraging' : 'thinking'} size={80}>
              {retryNote && <strong>لا بأس يا {learner.name}! سنعود لتلك المهمة لاحقًا 💪 </strong>}
              {mixed(mission.story)}
            </MascotMessage>
            <div className="card">
              <QuestionCard question={mission.question} continueLabel="تابع المغامرة" onDone={(r) => answered(r.correct)} />
            </div>
          </motion.section>
        )}
        {phase === 'open' && (
          <motion.section key="open" className="boss-story card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}>
            <div className="chest chest--open" aria-hidden="true">
              <span className="chest__shine" />
              💎
            </div>
            <h1>فتحت {mixed(unit.boss.treasure)}! 🎉</h1>
            <p className="boss-story__text">{mixed(unit.boss.ending)}</p>
            <button type="button" className="btn btn--sun btn--lg" onClick={() => navigate(`/complete/${unit.id}`)} autoFocus>
              استلم جائزتك 🏆
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
