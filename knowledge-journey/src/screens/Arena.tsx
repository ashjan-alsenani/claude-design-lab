import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { sfx } from '../audio/sound';
import { celebrate } from '../components/Confetti';
import { SoundToggles } from '../components/Hud';
import { Icon } from '../components/Icon';
import { QuestionCard } from '../components/QuestionCard';
import { TimerRing } from '../components/TimerRing';
import { navigate } from '../lib/router';
import { isFourOption, prepare, type PreparedQuestion } from '../lib/questions';
import { sample } from '../lib/random';
import { speedScore, useCountdown } from '../lib/useCountdown';
import { awardTeam, finishSession, startSession, TEAMS, teacherStore, useTeacher, type TeamId } from '../state/teacher';
import '../activities/lightning.css';
import './arena.css';

type Phase = { kind: 'setup' } | { kind: 'play'; sessionId: string; questions: PreparedQuestion[]; seconds: number } | { kind: 'board'; sessionId: string };

export function Arena() {
  const [phase, setPhase] = useState<Phase>({ kind: 'setup' });
  return (
    <div className="arena">
      <div className="arena-lights" aria-hidden />
      <header className="arena-top">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate({ name: 'teacher' })}>
          <Icon name="teacher" />
          لوحة المعلمة
        </button>
        <h1>منافسة البرق الصفية</h1>
        <div className="row-center">
          <SoundToggles />
        </div>
      </header>
      {phase.kind === 'setup' && (
        <Setup
          onStart={(teams, count, seconds, label) => {
            const pool = teacherStore.get().questions.filter(isFourOption);
            const questions = sample(pool, Math.min(count, pool.length)).map((q) => prepare(q));
            const sessionId = startSession(teams, label);
            sfx('unlock');
            setPhase({ kind: 'play', sessionId, questions, seconds });
          }}
        />
      )}
      {phase.kind === 'play' && <Play {...phase} onEnd={() => setPhase({ kind: 'board', sessionId: phase.sessionId })} />}
      {phase.kind === 'board' && <Leaderboard sessionId={phase.sessionId} onAgain={() => setPhase({ kind: 'setup' })} />}
    </div>
  );
}

function Setup({ onStart }: { onStart: (teams: TeamId[], count: number, seconds: number, label: string) => void }) {
  const defaults = teacherStore.get();
  const [teams, setTeams] = useState<TeamId[]>(['stars', 'pearls', 'gems', 'moon']);
  const [count, setCount] = useState(Math.max(defaults.lightningCount, 8));
  const [seconds, setSeconds] = useState(defaults.lightningSeconds);
  const [label, setLabel] = useState(`حصة ${new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long' }).format(new Date())}`);
  const toggle = (t: TeamId) => setTeams((x) => (x.includes(t) ? x.filter((y) => y !== t) : [...x, t]));
  return (
    <motion.section className="arena-setup panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2>إعداد المنافسة</h2>
      <p className="muted">تعمل المنافسة على جهاز المعلمة وحده: تتناوب الفرق على الأسئلة، وتضغط المعلمة الإجابة التي يختارها الفريق.</p>
      <fieldset className="team-pick">
        <legend>الفرق المشاركة (اختاري فريقين على الأقل)</legend>
        {TEAMS.map((t) => (
          <label key={t.id} className="team-toggle" style={{ ['--team' as string]: t.color }} data-on={teams.includes(t.id)}>
            <input type="checkbox" checked={teams.includes(t.id)} onChange={() => toggle(t.id)} />
            <TeamEmblem id={t.id} />
            {t.name}
          </label>
        ))}
      </fieldset>
      <div className="arena-fields">
        <label className="field-row">
          <span>عدد الأسئلة</span>
          <input type="number" min={teams.length || 2} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </label>
        <label className="field-row">
          <span>ثوانٍ لكل سؤال</span>
          <input type="number" min={5} max={90} value={seconds} onChange={(e) => setSeconds(Number(e.target.value))} />
        </label>
        <label className="field-row wide">
          <span>اسم الجلسة</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} />
        </label>
      </div>
      <button
        type="button"
        className="btn btn-gold btn-lg"
        disabled={teams.length < 2 || count < 1 || seconds < 5}
        onClick={() => onStart(TEAMS.map((t) => t.id).filter((id) => teams.includes(id)), Math.min(30, count), Math.min(90, seconds), label.trim() || 'منافسة صفية')}
      >
        <Icon name="sparkle" />
        ابدئي المنافسة
      </button>
    </motion.section>
  );
}

export function TeamEmblem({ id, size = 26 }: { id: TeamId; size?: number }) {
  const team = TEAMS.find((t) => t.id === id)!;
  const d =
    id === 'stars'
      ? 'M12 2.5l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8 6.2 20l1.4-6.4-4.9-4.4 6.5-.7Z'
      : id === 'pearls'
        ? 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z'
        : id === 'gems'
          ? 'M7 4h10l4 5-9 11L3 9Z'
          : 'M15 3a9 9 0 1 0 6 15.5A8 8 0 0 1 15 3Z';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d={d} fill={team.color} stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function Play({ sessionId, questions, seconds, onEnd }: { sessionId: string; questions: PreparedQuestion[]; seconds: number; onEnd: () => void }) {
  const session = useTeacher((s) => s.sessions.find((x) => x.id === sessionId));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [gain, setGain] = useState(0);
  const teams = session?.teams ?? [];
  const team = teams[i % teams.length];
  const teamInfo = TEAMS.find((t) => t.id === team);
  const q = questions[i];
  const answered = picked !== null || timedOut;

  const remaining = useCountdown(seconds, !answered, i, () => {
    setTimedOut(true);
    sfx('timeout');
  });

  const pick = (k: number) => {
    if (answered || !team) return;
    setPicked(k);
    const ok = k === q.answer;
    const pts = speedScore(ok, remaining, seconds, 100, 50);
    setGain(pts);
    awardTeam(sessionId, team, pts);
    if (ok) {
      sfx('correct');
      celebrate('sparkles', 0.35, 0.4);
    } else sfx('wrong');
  };

  const next = () => {
    if (i + 1 >= questions.length) {
      finishSession(sessionId);
      onEnd();
      return;
    }
    setI(i + 1);
    setPicked(null);
    setTimedOut(false);
    setGain(0);
  };

  if (!session || !q) return null;
  const ranked = [...teams].sort((a, b) => (session.scores[b] ?? 0) - (session.scores[a] ?? 0));

  return (
    <div className="arena-play">
      <div className="arena-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            className="turn"
            style={{ ['--team' as string]: teamInfo?.color }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <TeamEmblem id={team} size={34} />
            <span>
              دور <strong>{teamInfo?.name}</strong>
            </span>
            <span className="num turn-count">
              سؤال {i + 1} / {questions.length}
            </span>
          </motion.div>
        </AnimatePresence>
        <QuestionCard key={q.id} q={q} picked={picked} timedOut={timedOut} onPick={pick} aside={<TimerRing remaining={remaining} total={seconds} size={84} />}>
          {answered && (
            <div className="row-center">
              <span className="gain num" data-ok={gain > 0}>
                {gain > 0 ? `+${gain} لـ${teamInfo?.name}` : 'لا نقاط في هذه الجولة'}
              </span>
              <button type="button" className="btn btn-gold btn-lg" onClick={next} autoFocus>
                {i + 1 >= questions.length ? 'لوحة الترتيب النهائية' : 'السؤال التالي'}
                <Icon name="next" />
              </button>
            </div>
          )}
        </QuestionCard>
      </div>
      <aside className="scoreboard" aria-label="ترتيب الفرق">
        <h2>الترتيب</h2>
        <ol>
          {ranked.map((t) => {
            const info = TEAMS.find((x) => x.id === t)!;
            return (
              <motion.li key={t} layout transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }} data-turn={t === team} style={{ ['--team' as string]: info.color }}>
                <TeamEmblem id={t} />
                <span className="sb-name">{info.name}</span>
                <span className="sb-score num">{session.scores[t] ?? 0}</span>
              </motion.li>
            );
          })}
        </ol>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { finishSession(sessionId); onEnd(); }}>
          إنهاء المنافسة الآن
        </button>
      </aside>
    </div>
  );
}

function Leaderboard({ sessionId, onAgain }: { sessionId: string; onAgain: () => void }) {
  const session = useTeacher((s) => s.sessions.find((x) => x.id === sessionId));
  const ranked = useMemo(() => (session ? [...session.teams].sort((a, b) => (session.scores[b] ?? 0) - (session.scores[a] ?? 0)) : []), [session]);
  useEffect(() => {
    sfx('fanfare');
    const id = window.setTimeout(() => celebrate('confetti', 0.5, 0.3, 1.4), 200);
    return () => window.clearTimeout(id);
  }, []);
  if (!session) return null;
  const podium = [ranked[1], ranked[0], ranked[2]].filter(Boolean) as TeamId[];
  return (
    <section className="leaderboard">
      <h2>لوحة الترتيب النهائية</h2>
      <p className="muted-light">{session.label}</p>
      <div className="podium">
        {podium.map((t) => {
          const info = TEAMS.find((x) => x.id === t)!;
          const place = ranked.indexOf(t) + 1;
          return (
            <motion.div
              key={t}
              className="podium-col"
              data-place={place}
              style={{ ['--team' as string]: info.color }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (3 - place) * 0.3, type: 'spring', bounce: 0.35 }}
            >
              {place === 1 && <Icon name="crown" size={48} className="podium-crown" />}
              <TeamEmblem id={t} size={56} />
              <strong>{info.name}</strong>
              <span className="num podium-score">{session.scores[t] ?? 0}</span>
              <div className="podium-block">{place}</div>
            </motion.div>
          );
        })}
      </div>
      {ranked.length > 3 && (
        <ol className="rest" start={4}>
          {ranked.slice(3).map((t) => (
            <li key={t}>
              {TEAMS.find((x) => x.id === t)!.name} — <span className="num">{session.scores[t] ?? 0}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="row-center">
        <button type="button" className="btn btn-gold btn-lg" onClick={onAgain}>
          <Icon name="replay" />
          منافسة جديدة
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => navigate({ name: 'teacher' })}>
          <Icon name="teacher" />
          لوحة المعلمة
        </button>
      </div>
    </section>
  );
}
