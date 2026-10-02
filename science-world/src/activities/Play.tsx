/**
 * "Play" activities: sort (drag & drop with touch), match pairs, arrange in order,
 * memory cards, read a table/graph, run a virtual experiment.
 */
import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { motion } from 'framer-motion';
import type { DataStep, ExperimentStep, MatchStep, MemoryStep, OrderStep, SortStep } from '../data/types';
import { play } from '../lib/sound';
import { burst } from '../lib/confetti';
import { shuffle, shuffleNotSorted } from '../lib/random';
import { MascotMessage } from '../components/MascotMessage';
import { Feedback } from '../components/Feedback';
import { Art } from '../illustrations/registry';
import { QuestionCard } from './QuestionCard';
import type { ActivityProps } from './Discover';

function useCelebrateWhen(done: boolean, onComplete: () => void) {
  const fired = useRef(false);
  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true;
      play('star');
      burst();
      onComplete();
    }
  }, [done, onComplete]);
}

/* ============================================================
   SORT — drag items into the right group (mouse, touch, or tap-tap)
   ============================================================ */
export function SortGame({ step, onComplete }: ActivityProps<SortStep>) {
  const items = useMemo(() => shuffle(step.items), [step]);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [overBucket, setOverBucket] = useState<string | null>(null);
  const [oops, setOops] = useState<{ id: string; msg: string } | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean; pointer: number } | null>(null);

  const done = Object.keys(placed).length === step.items.length;
  useCelebrateWhen(done, onComplete);

  function tryPlace(itemId: string, bucketId: string) {
    const item = step.items.find((i) => i.id === itemId)!;
    if (item.bucket === bucketId) {
      play('drop');
      setPlaced((p) => ({ ...p, [itemId]: bucketId }));
      setOops(null);
    } else {
      play('wrong');
      const right = step.buckets.find((b) => b.id === item.bucket)!;
      setOops({ id: itemId, msg: `«${item.text}» ليس هنا. فكّر: هل هو من «${right.label}»؟` });
      window.setTimeout(() => setOops((o) => (o?.id === itemId ? { ...o, id: '' } : o)), 450);
    }
    setSelected(null);
  }

  function bucketAt(x: number, y: number): string | null {
    const el = document.elementFromPoint(x, y)?.closest('[data-bucket]') as HTMLElement | null;
    return el?.dataset.bucket ?? null;
  }

  const onDown = (e: RPointerEvent<HTMLButtonElement>, id: string) => {
    start.current = { x: e.clientX, y: e.clientY, moved: false, pointer: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id, x: e.clientX, y: e.clientY });
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!start.current || e.pointerId !== start.current.pointer || !drag) return;
    if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 8) start.current.moved = true;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
    setOverBucket(bucketAt(e.clientX, e.clientY));
  };
  const onUp = (e: RPointerEvent<HTMLButtonElement>, id: string) => {
    if (!start.current || e.pointerId !== start.current.pointer) return;
    const moved = start.current.moved;
    start.current = null;
    setDrag(null);
    setOverBucket(null);
    if (!moved) {
      play('tap');
      setSelected((s) => (s === id ? null : id));
      return;
    }
    const b = bucketAt(e.clientX, e.clientY);
    if (b) tryPlace(id, b);
  };

  const dragged = drag && start.current?.moved ? step.items.find((i) => i.id === drag.id) : null;

  return (
    <div className="activity">
      {step.mascot && <MascotMessage mood="excited">{step.mascot}</MascotMessage>}
      <p className="activity__hint">اسحب كل بطاقة إلى مكانها الصحيح — أو اضغط على البطاقة ثم على المجموعة 👆</p>
      <div className="sort-tray" aria-label="البطاقات">
        {items
          .filter((i) => !placed[i.id])
          .map((i) => (
            <button
              key={i.id}
              type="button"
              className={`token ${selected === i.id ? 'token--selected' : ''} ${oops?.id === i.id ? 'wiggle' : ''} ${dragged?.id === i.id ? 'token--ghosted' : ''}`}
              onPointerDown={(e) => onDown(e, i.id)}
              onPointerMove={onMove}
              onPointerUp={(e) => onUp(e, i.id)}
              onPointerCancel={() => {
                start.current = null;
                setDrag(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(i.id);
                }
              }}
              aria-pressed={selected === i.id}
            >
              {i.emoji && <span className="token__emoji">{i.emoji}</span>}
              {i.text}
            </button>
          ))}
        {done && <div className="sort-done">✨ رتّبت كل البطاقات!</div>}
      </div>
      <div className={`buckets buckets--${step.buckets.length}`}>
        {step.buckets.map((b) => (
          <button
            key={b.id}
            type="button"
            data-bucket={b.id}
            className={`bucket ${overBucket === b.id ? 'bucket--over' : ''} ${selected ? 'bucket--ready' : ''}`}
            onClick={() => selected && tryPlace(selected, b.id)}
            aria-label={`ضع هنا: ${b.label}`}
          >
            <div className="bucket__head">
              {b.emoji && <span className="bucket__emoji">{b.emoji}</span>}
              {b.label}
            </div>
            <div className="bucket__items">
              {step.items
                .filter((i) => placed[i.id] === b.id)
                .map((i) => (
                  <motion.span key={i.id} className="token token--placed" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    {i.emoji} {i.text} ✓
                  </motion.span>
                ))}
            </div>
          </button>
        ))}
      </div>
      {oops && !done && <Feedback tone="oops" title="قريب! 🌟">{oops.msg}</Feedback>}
      {done && <Feedback tone="good" title="أحسنت! 🎉">{step.explain}</Feedback>}
      {dragged && drag && (
        <div className="drag-ghost token" style={{ transform: `translate(${drag.x}px, ${drag.y}px) translate(-50%, -50%) rotate(-3deg)` }} aria-hidden="true">
          {dragged.emoji} {dragged.text}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MATCH — tap one on the right, then its partner
   ============================================================ */
const pairColors = ['#5b5bf7', '#ff6b6b', '#2fbf71', '#f0a500', '#9b5de5', '#19c3d6', '#e86fb0'];
export function MatchGame({ step, onComplete }: ActivityProps<MatchStep>) {
  const lefts = useMemo(() => shuffle(step.pairs), [step]);
  const rights = useMemo(() => shuffleNotSorted(step.pairs), [step]);
  const [pick, setPick] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const done = matched.length === step.pairs.length;
  useCelebrateWhen(done, onComplete);

  function chooseRight(id: string) {
    if (!pick || matched.includes(id)) return;
    if (id === pick) {
      play('correct');
      setMatched((m) => [...m, id]);
      setHint(null);
    } else {
      play('wrong');
      setWrong(id);
      const p = step.pairs.find((x) => x.id === pick)!;
      setHint(`فكّر مرة أخرى: ما الذي يناسب «${p.left}»؟`);
      window.setTimeout(() => setWrong(null), 450);
    }
    setPick(null);
  }

  return (
    <div className="activity">
      {step.mascot && <MascotMessage mood="happy">{step.mascot}</MascotMessage>}
      <p className="activity__hint">اضغط على بطاقة من اليمين، ثم على ما يناسبها من اليسار 🔗</p>
      <div className="match">
        <div className="match__col">
          {lefts.map((p) => {
            const m = matched.includes(p.id);
            const c = pairColors[step.pairs.findIndex((x) => x.id === p.id) % pairColors.length];
            return (
              <button
                key={p.id}
                type="button"
                className={`match__item ${pick === p.id ? 'match__item--pick' : ''} ${m ? 'match__item--done' : ''}`}
                style={m ? { borderColor: c, background: `${c}1a` } : undefined}
                disabled={m}
                onClick={() => {
                  play('tap');
                  setPick(p.id);
                }}
              >
                {p.leftEmoji && <span className="match__emoji">{p.leftEmoji}</span>}
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="match__col">
          {rights.map((p) => {
            const m = matched.includes(p.id);
            const c = pairColors[step.pairs.findIndex((x) => x.id === p.id) % pairColors.length];
            return (
              <button
                key={p.id}
                type="button"
                className={`match__item match__item--right ${m ? 'match__item--done' : ''} ${wrong === p.id ? 'wiggle' : ''} ${pick ? 'match__item--ready' : ''}`}
                style={m ? { borderColor: c, background: `${c}1a` } : undefined}
                disabled={m}
                onClick={() => chooseRight(p.id)}
              >
                {p.right}
              </button>
            );
          })}
        </div>
      </div>
      {hint && !done && <Feedback tone="oops" title="قريب! 🌟">{hint}</Feedback>}
      {done && <Feedback tone="good" title="توصيل رائع! 🔗">{step.explain}</Feedback>}
    </div>
  );
}

/* ============================================================
   ORDER — tap the items in the right order (food chains, steps)
   ============================================================ */
export function OrderGame({ step, onComplete }: ActivityProps<OrderStep>) {
  const pool = useMemo(() => shuffleNotSorted(step.items), [step]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const done = placed.length === step.items.length;
  useCelebrateWhen(done, onComplete);

  function choose(id: string) {
    const expected = step.items[placed.length];
    if (id === expected.id) {
      play('drop');
      setPlaced((p) => [...p, id]);
    } else {
      play('wrong');
      setWrong(id);
      setTries((t) => t + 1);
      window.setTimeout(() => setWrong(null), 450);
    }
  }
  const chain = step.layout === 'chain';
  const nextHint =
    placed.length === 0
      ? chain
        ? 'تذكّر: السلسلة الغذائية تبدأ دائمًا بالكائن المنتج (نبات) 🌱'
        : 'ما الذي يحدث أولًا؟'
      : chain
        ? `مَن يتغذّى على «${step.items[placed.length - 1].text}»؟`
        : `ماذا يأتي بعد «${step.items[placed.length - 1].text}»؟`;

  return (
    <div className="activity">
      {step.mascot && <MascotMessage mood="thinking">{step.mascot}</MascotMessage>}
      <div className={`order-slots ${chain ? 'order-slots--chain' : ''}`} aria-label="الترتيب">
        {step.items.map((it, i) => {
          const isPlaced = i < placed.length;
          return (
            <div key={it.id} className="order-slot-wrap">
              <div className={`order-slot ${isPlaced ? 'order-slot--filled' : ''} ${i === placed.length ? 'order-slot--next' : ''}`}>
                {isPlaced ? (
                  <motion.span initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="order-slot__content">
                    {it.emoji && <span className="order-slot__emoji">{it.emoji}</span>}
                    {it.text}
                  </motion.span>
                ) : (
                  <span className="order-slot__num">{i + 1}</span>
                )}
              </div>
              {i < step.items.length - 1 && (
                <span className="order-arrow" aria-hidden="true">
                  {chain ? '←' : '⬅'}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {chain && <p className="activity__hint">السهم يعني «يتغذّى عليه» ➜</p>}
      {!done && (
        <>
          <p className="activity__hint">👆 {nextHint}</p>
          <div className="order-pool">
            {pool
              .filter((p) => !placed.includes(p.id))
              .map((p) => (
                <button key={p.id} type="button" className={`token ${wrong === p.id ? 'wiggle token--wrong' : ''}`} onClick={() => choose(p.id)}>
                  {p.emoji && <span className="token__emoji">{p.emoji}</span>}
                  {p.text}
                </button>
              ))}
          </div>
          {tries > 0 && wrong && <Feedback tone="oops" title="ليس بعد! 🌟">{nextHint}</Feedback>}
        </>
      )}
      {done && <Feedback tone="good" title="ترتيب مثالي! 🏅">{step.explain}</Feedback>}
    </div>
  );
}

/* ============================================================
   MEMORY — find matching pairs
   ============================================================ */
export function MemoryGame({ step, onComplete, compact }: ActivityProps<MemoryStep> & { compact?: boolean }) {
  const cards = useMemo(
    () => shuffle(step.pairs.flatMap((p) => [{ key: `${p.id}-a`, pair: p.id, text: p.a, emoji: p.emoji }, { key: `${p.id}-b`, pair: p.id, text: p.b, emoji: undefined }])),
    [step],
  );
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);
  const done = found.length === step.pairs.length;
  useCelebrateWhen(done, onComplete);

  function flip(key: string, pair: string) {
    if (lock.current || open.includes(key) || found.includes(pair)) return;
    play('flip');
    const next = [...open, key];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((k) => cards.find((c) => c.key === k)!);
      if (a.pair === b.pair) {
        window.setTimeout(() => play('correct'), 120);
        setFound((f) => [...f, a.pair]);
        setOpen([]);
      } else {
        lock.current = true;
        window.setTimeout(() => {
          setOpen([]);
          lock.current = false;
        }, 900);
      }
    }
  }

  return (
    <div className="activity">
      {step.mascot && !compact && <MascotMessage mood="happy">{step.mascot}</MascotMessage>}
      <p className="activity__hint">
        اقلب بطاقتين متطابقتين 🧠 — الأزواج: {found.length}/{step.pairs.length} · المحاولات: {moves}
      </p>
      <div className={`memory memory--${cards.length > 12 ? 'lg' : 'md'}`}>
        {cards.map((c) => {
          const up = open.includes(c.key) || found.includes(c.pair);
          return (
            <button
              key={c.key}
              type="button"
              className={`mem ${up ? 'mem--up' : ''} ${found.includes(c.pair) ? 'mem--found' : ''}`}
              onClick={() => flip(c.key, c.pair)}
              aria-label={up ? c.text : 'بطاقة مقلوبة'}
            >
              <span className="mem__inner">
                <span className="mem__face mem__back" aria-hidden="true">
                  ⭐
                </span>
                <span className="mem__face mem__front">
                  {c.emoji && <span className="mem__emoji">{c.emoji}</span>}
                  {c.text}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {done && <Feedback tone="good" title="ذاكرة رائعة! 🧠">وجدت كل الأزواج في {moves} محاولة.</Feedback>}
    </div>
  );
}

/* ============================================================
   DATA — read a table / bar chart, then answer
   ============================================================ */
export function DataReader({ step, onComplete }: ActivityProps<DataStep>) {
  const [answered, setAnswered] = useState(false);
  const col = step.chartValueCol;
  const max = col !== undefined ? Math.max(...step.rows.map((r) => Number(r[col]) || 0)) : 0;
  return (
    <div className="activity">
      {step.mascot && <MascotMessage mood="thinking">{step.mascot}</MascotMessage>}
      <div className="data">
        <div className="card data__table-wrap">
          {step.caption && <div className="eyebrow">{step.caption}</div>}
          <table className="data__table">
            <thead>
              <tr>
                {step.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {step.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((v, j) => (
                    <td key={j}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {col !== undefined && (
          <div className="card bars" aria-label="تمثيل بياني بالأعمدة">
            {step.rows.map((r, i) => {
              const v = Number(r[col]) || 0;
              return (
                <div key={i} className="bars__row">
                  <span className="bars__label">{r[0]}</span>
                  <span className="bars__track">
                    <motion.span
                      className="bars__fill"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: v / max }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </span>
                  <span className="bars__value">
                    {v} {step.chartUnit}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <QuestionCard
        question={step.question}
        embedded
        onDone={() => {
          if (!answered) {
            setAnswered(true);
            onComplete();
          }
        }}
      />
    </div>
  );
}

/* ============================================================
   EXPERIMENT — try each condition and compare the results
   ============================================================ */
export function ExperimentLab({ step, onComplete }: ActivityProps<ExperimentStep>) {
  const [tried, setTried] = useState<string[]>([]);
  const [running, setRunning] = useState<string | null>(null);
  const all = tried.length === step.trials.length;
  useCelebrateWhen(all, onComplete);
  const max = Math.max(...step.trials.map((t) => t.value ?? 0), 1);

  function run(id: string) {
    if (running) return;
    play('tap');
    setRunning(id);
    window.setTimeout(() => {
      setRunning(null);
      setTried((t) => (t.includes(id) ? t : [...t, id]));
    }, 900);
  }

  return (
    <div className="activity">
      {step.mascot && <MascotMessage mood="excited">{step.mascot}</MascotMessage>}
      <div className="lab card">
        <div className="eyebrow">🧪 سؤال التجربة</div>
        <h3>{step.question}</h3>
        {step.art && (
          <div className="lab__art">
            <Art name={step.art} frame={running ? 1 : tried.length ? 2 : 0} />
          </div>
        )}
        <div className="lab__trials">
          {step.trials.map((t) => {
            const isDone = tried.includes(t.id);
            return (
              <div key={t.id} className={`trial ${isDone ? 'trial--done' : ''}`}>
                <button type="button" className="btn btn--accent" onClick={() => run(t.id)} disabled={Boolean(running)}>
                  {running === t.id ? '⏳ جارٍ التجريب…' : `${t.emoji ?? '▶️'} ${t.label}`}
                </button>
                {isDone && (
                  <motion.div className="trial__result" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    {t.value !== undefined && (
                      <span className="trial__bar">
                        <motion.span className="trial__fill" initial={{ scaleX: 0 }} animate={{ scaleX: t.value / max }} transition={{ duration: 0.7 }} />
                      </span>
                    )}
                    <span>{t.result}</span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {all && <Feedback tone="good" title="الاستنتاج 🔬">{step.conclusion}</Feedback>}
    </div>
  );
}
