import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../audio/sound';
import type { ActivityProps } from '../components/ActivityShell';
import { celebrate } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { QuestionCard } from '../components/QuestionCard';
import { TimerRing } from '../components/TimerRing';
import { useReducedMotion } from '../lib/motion';
import { isFourOption, prepare, type PreparedQuestion } from '../lib/questions';
import { shuffle } from '../lib/random';
import type { Question, QuestionType } from '../lib/types';
import { easeOutQuart, segmentAt, spinTarget } from '../lib/wheel';
import { encourage, praise, say } from '../state/guide';
import { teacherStore } from '../state/teacher';
import './wheel.css';

interface Segment {
  id: QuestionType | 'quick';
  label: string;
  color: string;
  ink: string;
}

export const SEGMENTS: Segment[] = [
  { id: 'mcq', label: 'اختيار من متعدد', color: '#c2a9fb', ink: '#36216d' },
  { id: 'truefalse', label: 'صح أم خطأ', color: '#7fe3dc', ink: '#0b4f52' },
  { id: 'complete', label: 'أكملي العبارة', color: '#ffd66e', ink: '#5c3a06' },
  { id: 'definition', label: 'التعريف الصحيح', color: '#f8a8cb', ink: '#6b1f45' },
  { id: 'sunnahType', label: 'نوع السنة', color: '#9adff5', ink: '#123f5c' },
  { id: 'quick', label: 'سؤال سريع', color: '#ffbfa8', ink: '#6b2a19' },
];

const ROUNDS = 6;

function poolFor(seg: Segment, bank: Question[]): Question[] {
  if (seg.id === 'quick') return bank.filter((q) => q.type === 'mcq' && isFourOption(q));
  return bank.filter((q) => q.type === seg.id);
}

export function Wheel({ onFinish }: ActivityProps) {
  const reduced = useReducedMotion();
  const bank = useMemo(() => teacherStore.get().questions, []);
  const quickSeconds = useMemo(() => teacherStore.get().wheelQuickSeconds, []);
  const wheelRef = useRef<SVGGElement>(null);
  const rotation = useRef(0);
  const used = useRef(new Set<string>());
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState<number | null>(null);
  const [q, setQ] = useState<PreparedQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [remaining, setRemaining] = useState(quickSeconds);
  const [round, setRound] = useState(0);
  const [tally, setTally] = useState({ score: 0, correct: 0, total: 0 });

  const isQuick = landed !== null && SEGMENTS[landed].id === 'quick';
  const answered = picked !== null || timedOut;

  const spin = () => {
    if (spinning || (q && !answered)) return;
    setQ(null);
    setPicked(null);
    setTimedOut(false);
    setLanded(null);
    setSpinning(true);
    say('العجلة تدور… أيّ تحدٍّ ستختار؟', 'wow');
    const start = rotation.current;
    const end = spinTarget(start);
    const duration = reduced ? 900 : 5200;
    const t0 = performance.now();
    let lastSeg = segmentAt(start, SEGMENTS.length);
    let lastTickAt = 0;
    const frame = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const r = start + (end - start) * easeOutQuart(t);
      rotation.current = r;
      wheelRef.current?.setAttribute('transform', `rotate(${r} 200 200)`);
      const seg = segmentAt(r, SEGMENTS.length);
      if (seg !== lastSeg && now - lastTickAt > 40) {
        // pitch drops as the wheel slows: the click itself tells you it is about to stop
        sfx('tick', { pitch: 0.6 + 0.6 * (1 - t) });
        lastTickAt = now;
      }
      lastSeg = seg;
      if (t < 1) requestAnimationFrame(frame);
      else land(r);
    };
    requestAnimationFrame(frame);
  };

  const land = (r: number) => {
    const idx = segmentAt(r, SEGMENTS.length);
    const seg = SEGMENTS[idx];
    let pool = poolFor(seg, bank).filter((x) => !used.current.has(x.id));
    if (!pool.length) pool = poolFor(seg, bank);
    if (!pool.length) pool = bank; // a teacher-edited bank may lack this type
    const chosen = shuffle(pool)[0];
    used.current.add(chosen.id);
    setSpinning(false);
    setLanded(idx);
    setRemaining(quickSeconds);
    sfx('unlock');
    window.setTimeout(() => setQ(prepare(chosen)), reduced ? 0 : 450);
  };

  // countdown for the quick segment
  useEffect(() => {
    if (!q || !isQuick || answered) return;
    const startedAt = performance.now();
    const base = remaining;
    let last = Math.ceil(base);
    const id = window.setInterval(() => {
      const left = Math.max(0, base - (performance.now() - startedAt) / 1000);
      setRemaining(left);
      if (Math.ceil(left) !== last) {
        last = Math.ceil(left);
        if (last <= 5 && last > 0) sfx('countdown');
      }
      if (left <= 0) {
        window.clearInterval(id);
        setTimedOut(true);
        sfx('timeout');
        setTally((t) => ({ ...t, total: t.total + 1 }));
        setRound((r) => r + 1);
        say('انتهى الوقت! اقرئي التوضيح، ثم أديري العجلة من جديد.', 'think');
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, isQuick, answered]);

  const pick = (i: number) => {
    if (!q || answered) return;
    setPicked(i);
    const ok = i === q.answer;
    const bonus = isQuick ? Math.round((remaining / quickSeconds) * 10) : 0;
    setTally((t) => ({ score: t.score + (ok ? 20 + bonus : 0), correct: t.correct + (ok ? 1 : 0), total: t.total + 1 }));
    setRound((r) => r + 1);
    if (ok) {
      sfx('correct');
      celebrate('sparkles', 0.5, 0.55);
      praise();
    } else {
      sfx('wrong');
      encourage();
    }
  };

  const done = round >= ROUNDS && answered;

  return (
    <div className="wheel-stage">
      <header className="stage-intro">
        <h2>عجلة التحديات</h2>
        <p>أديري العجلة، وحيثما تتوقف يكون نوع التحدي. {ROUNDS} جولات.</p>
      </header>
      <div className="step-dots" aria-label={`الجولة ${Math.min(round + (answered ? 0 : 1), ROUNDS)} من ${ROUNDS}`}>
        {Array.from({ length: ROUNDS }, (_, i) => (
          <span key={i} data-on={i < round} />
        ))}
      </div>

      <div className="wheel-layout" data-has-q={!!q}>
        <div className="wheel-col">
          <div className="wheel-wrap">
            <svg viewBox="0 0 400 420" className="wheel-svg" role="img" aria-label="عجلة التحديات">
              <defs>
                <radialGradient id="wheel-rim" cx="50%" cy="50%" r="50%">
                  <stop offset=".86" stopColor="#ffe6a3" />
                  <stop offset=".93" stopColor="#e09e2c" />
                  <stop offset="1" stopColor="#8a5410" />
                </radialGradient>
                <radialGradient id="wheel-shade" cx="50%" cy="40%" r="60%">
                  <stop offset=".6" stopColor="#fff" stopOpacity="0" />
                  <stop offset="1" stopColor="#36216d" stopOpacity=".28" />
                </radialGradient>
              </defs>
              <ellipse cx="200" cy="404" rx="120" ry="12" fill="rgb(10 6 40 / .35)" />
              <circle cx="200" cy="200" r="196" fill="url(#wheel-rim)" />
              <g ref={wheelRef} transform={`rotate(${rotation.current} 200 200)`}>
                {SEGMENTS.map((s, i) => {
                  const a0 = ((i * 60 - 90) * Math.PI) / 180;
                  const a1 = (((i + 1) * 60 - 90) * Math.PI) / 180;
                  const R = 172;
                  const mid = i * 60 + 30;
                  return (
                    <g key={s.id}>
                      <path
                        d={`M200 200L${200 + R * Math.cos(a0)} ${200 + R * Math.sin(a0)}A${R} ${R} 0 0 1 ${200 + R * Math.cos(a1)} ${200 + R * Math.sin(a1)}Z`}
                        fill={s.color}
                        stroke="#fff"
                        strokeWidth="3"
                      />
                      <g transform={`rotate(${mid} 200 200)`}>
                        <text x="200" y="92" textAnchor="middle" fill={s.ink} className="wheel-label" transform={mid > 90 && mid < 270 ? 'rotate(180 200 87)' : undefined}>
                          {s.label}
                        </text>
                        <circle cx="200" cy="128" r="11" fill="#fff" opacity=".7" />
                        <text x="200" y="133" textAnchor="middle" fill={s.ink} className="wheel-num">
                          {i + 1}
                        </text>
                      </g>
                    </g>
                  );
                })}
                <circle cx="200" cy="200" r="172" fill="url(#wheel-shade)" pointerEvents="none" />
              </g>
              {/* rim bulbs */}
              {Array.from({ length: 18 }, (_, i) => {
                const a = (i * 20 * Math.PI) / 180;
                return (
                  <circle
                    key={i}
                    cx={200 + 185 * Math.cos(a)}
                    cy={200 + 185 * Math.sin(a)}
                    r="5"
                    className={`bulb ${spinning ? 'on' : ''}`}
                    style={{ animationDelay: `${(i % 2) * 0.25}s` }}
                  />
                );
              })}
              {/* hub */}
              <circle cx="200" cy="200" r="34" fill="#fffaf0" stroke="#e09e2c" strokeWidth="6" />
              <path d="M200 182l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1Z" fill="#f5c048" />
              {/* pointer */}
              <path d="M200 40 182 4h36Z" fill="#f5c048" stroke="#8a5410" strokeWidth="3" strokeLinejoin="round" className={landed !== null ? 'pointer-hit' : ''} />
            </svg>
          </div>
          <AnimatePresence mode="wait">
            {landed !== null && (
              <motion.p
                key={landed + '-' + round}
                className="wheel-landed"
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{ background: SEGMENTS[landed].color, color: SEGMENTS[landed].ink }}
              >
                توقفت العجلة عند: <strong>{SEGMENTS[landed].label}</strong>
              </motion.p>
            )}
          </AnimatePresence>
          {!done && (
            <button type="button" className="btn btn-gold btn-lg wheel-btn" onClick={spin} disabled={spinning || (!!q && !answered)}>
              <Icon name="replay" />
              {spinning ? 'تدور…' : round === 0 ? 'أديري العجلة' : 'أديري مرة أخرى'}
            </button>
          )}
        </div>

        <div className="wheel-q-col">
          {q && (
            <QuestionCard
              key={q.id + round}
              q={q}
              picked={picked}
              timedOut={timedOut}
              onPick={pick}
              label={landed !== null ? SEGMENTS[landed].label : undefined}
              aside={isQuick && !answered ? <TimerRing remaining={remaining} total={quickSeconds} size={64} /> : null}
            >
              {done && (
                <div className="row-center">
                  <button type="button" className="btn btn-gold btn-lg" onClick={() => onFinish(tally)} autoFocus>
                    أنهيتِ الجولات — استلمي الجوهرة
                    <Icon name="next" />
                  </button>
                </div>
              )}
            </QuestionCard>
          )}
          {!q && !spinning && round === 0 && (
            <div className="wheel-legend panel">
              <h3>أنواع التحديات</h3>
              <ul>
                {SEGMENTS.map((s) => (
                  <li key={s.id}>
                    <span style={{ background: s.color }} />
                    {s.label}
                    {s.id === 'quick' && <small> — بمؤقت {quickSeconds} ثانية</small>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
