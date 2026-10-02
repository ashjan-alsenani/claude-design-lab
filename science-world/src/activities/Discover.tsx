/**
 * "Discover" activities: the child explores to learn
 * (reveal cards, diagram hotspots, step-by-step processes, flip cards, think-about-it).
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { FlipStep, HotspotStep, ProcessStep, RevealStep, ThinkStep } from '../data/types';
import { Art, SceneView, VisualView } from '../illustrations/registry';
import { MathView } from '../illustrations/math';
import { play } from '../lib/sound';
import { MascotMessage } from '../components/MascotMessage';

export interface ActivityProps<S> {
  step: S;
  onComplete: () => void;
}

/* ---------------- Reveal cards: tap to open one idea at a time ---------------- */
export function RevealCards({ step, onComplete }: ActivityProps<RevealStep>) {
  const [open, setOpen] = useState(1);
  useEffect(() => {
    if (open >= step.cards.length) onComplete();
  }, [open, step.cards.length, onComplete]);

  return (
    <div className="activity">
      {step.mascot && <MascotMessage mood="happy">{step.mascot}</MascotMessage>}
      <div className="reveal-list">
        {step.cards.slice(0, open).map((c, i) => (
          <motion.article
            key={i}
            className={`reveal-card card ${c.visual?.math ? 'reveal-card--stack' : ''}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}
          >
            {c.visual && <VisualView visual={c.visual} className="reveal-card__visual" />}
            <div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          </motion.article>
        ))}
      </div>
      {open < step.cards.length && (
        <button
          type="button"
          className="btn btn--sun btn--lg reveal-more"
          onClick={() => {
            play('flip');
            setOpen((o) => o + 1);
          }}
        >
          اكتشف المزيد 🔍 ({open}/{step.cards.length})
        </button>
      )}
    </div>
  );
}

/* ---------------- Hotspots: tap every glowing dot on the diagram ---------------- */
export function HotspotExplorer({ step, onComplete }: ActivityProps<HotspotStep>) {
  const [seen, setSeen] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const all = seen.length === step.spots.length;
  useEffect(() => {
    if (all) onComplete();
  }, [all, onComplete]);

  const activeSpot = step.spots.find((s) => s.id === active);
  const sceneIndex = activeSpot && step.scene ? step.scene.items.findIndex((it) => it.label === activeSpot.label) : -1;

  return (
    <div className="activity">
      {step.mascot && <MascotMessage mood="excited">{step.mascot}</MascotMessage>}
      <div className="hotspot-layout">
        <div className="hotspot-stage">
          <div className="hotspot-canvas">
          {step.art ? <Art name={step.art} highlight={active ?? undefined} /> : step.scene ? <SceneView scene={step.scene} active={sceneIndex} /> : null}
          {step.spots.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`hotspot ${step.scene && !step.art ? 'hotspot--scene' : ''} ${seen.includes(s.id) ? 'hotspot--seen' : ''} ${active === s.id ? 'hotspot--active' : ''}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              onClick={() => {
                play('tap');
                setActive(s.id);
                setSeen((v) => (v.includes(s.id) ? v : [...v, s.id]));
              }}
              aria-label={s.label}
            >
              <span aria-hidden="true">{seen.includes(s.id) ? '✓' : '+'}</span>
            </button>
          ))}
          </div>
        </div>
        <div className="hotspot-info">
          <div className="hotspot-count">
            اكتشفت {seen.length} من {step.spots.length} {all ? '🎉' : ''}
          </div>
          {activeSpot ? (
            <motion.div key={activeSpot.id} className="card hotspot-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
              <h3>{activeSpot.label}</h3>
              <p>{activeSpot.text}</p>
            </motion.div>
          ) : (
            <div className="card hotspot-card hotspot-card--empty">👆 اضغط على النقاط المضيئة لتكتشف!</div>
          )}
          <div className="hotspot-chips">
            {step.spots.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`chip-btn ${seen.includes(s.id) ? 'chip-btn--seen' : ''} ${active === s.id ? 'chip-btn--active' : ''}`}
                onClick={() => {
                  play('tap');
                  setActive(s.id);
                  setSeen((v) => (v.includes(s.id) ? v : [...v, s.id]));
                }}
              >
                {seen.includes(s.id) ? '✓ ' : ''}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Process: watch it happen, press NEXT STEP ---------------- */
export function ProcessPlayer({ step, onComplete }: ActivityProps<ProcessStep>) {
  const [i, setI] = useState(0);
  const last = i === step.steps.length - 1;
  useEffect(() => {
    if (last) onComplete();
  }, [last, onComplete]);
  const cur = step.steps[i];

  return (
    <div className="activity">
      {step.mascot && <MascotMessage mood="excited">{step.mascot}</MascotMessage>}
      <div className="process">
        <div className="process__stage card">
          {cur.math ? (
            <motion.div key={`m${i}`} className="process__math" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
              <MathView v={cur.math} />
            </motion.div>
          ) : step.art ? (
            <Art name={step.art} frame={cur.frame ?? i} />
          ) : (
            <motion.div key={i} className="process__emoji" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.45, bounce: 0.3 }}>
              {cur.emoji ?? '🔬'}
            </motion.div>
          )}
        </div>
        <div className="process__text">
          <ol className="process__dots" aria-label="الخطوات">
            {step.steps.map((_, k) => (
              <li key={k} className={k === i ? 'on' : k < i ? 'done' : ''} aria-current={k === i ? 'step' : undefined}>
                {k + 1}
              </li>
            ))}
          </ol>
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="card process__card">
            <div className="eyebrow">
              الخطوة {i + 1} {cur.emoji && step.art ? cur.emoji : ''}
            </div>
            <h3>{cur.title}</h3>
            <p>{cur.text}</p>
          </motion.div>
          <div className="process__nav">
            <button type="button" className="btn btn--ghost" disabled={i === 0} onClick={() => setI((v) => v - 1)}>
              → السابق
            </button>
            {!last ? (
              <button
                type="button"
                className="btn btn--sun btn--lg"
                onClick={() => {
                  play('tap');
                  setI((v) => v + 1);
                }}
              >
                الخطوة التالية ←
              </button>
            ) : (
              <span className="process__done">✅ شاهدت كل الخطوات!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Flip cards: word on the front, meaning on the back ---------------- */
export function FlipCards({ step, onComplete }: ActivityProps<FlipStep>) {
  const [flipped, setFlipped] = useState<number[]>([]);
  const all = flipped.length === step.cards.length;
  useEffect(() => {
    if (all) onComplete();
  }, [all, onComplete]);
  return (
    <div className="activity">
      {step.mascot && <MascotMessage mood="happy">{step.mascot}</MascotMessage>}
      <p className="activity__hint">اقلب كل البطاقات ({flipped.length}/{step.cards.length})</p>
      <div className="flip-grid">
        {step.cards.map((c, i) => {
          const on = flipped.includes(i);
          return (
            <button
              key={i}
              type="button"
              className={`flip ${on ? 'flip--on' : ''}`}
              onClick={() => {
                play('flip');
                setFlipped((f) => (f.includes(i) ? f : [...f, i]));
              }}
              aria-label={on ? `${c.front}: ${c.back}` : `اقلب بطاقة ${c.front}`}
            >
              <span className="flip__inner">
                <span className="flip__face flip__front">
                  {c.emoji && <span className="flip__emoji">{c.emoji}</span>}
                  <span className="flip__word">{c.front}</span>
                  <span className="flip__tap">اضغط لتقلب 🔄</span>
                </span>
                <span className="flip__face flip__back">{c.back}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Think & talk (تحدّث عن!) ---------------- */
export function ThinkTalk({ step, onComplete }: ActivityProps<ThinkStep>) {
  const [shown, setShown] = useState(false);
  return (
    <div className="activity think">
      <div className="think__bubble card">
        <div className="eyebrow">💬 تحدّث عن!</div>
        <h3>{step.prompt}</h3>
        {step.visual && <VisualView visual={step.visual} className="think__visual" />}
        <p className="activity__hint">فكّر قليلًا، وناقش الفكرة مع زميلك أو أحد أفراد أسرتك 🗣️</p>
      </div>
      {!shown ? (
        <button
          type="button"
          className="btn btn--sun btn--lg"
          onClick={() => {
            play('flip');
            setShown(true);
            onComplete();
          }}
        >
          فكّرت! أرني أفكارًا من الدرس 💡
        </button>
      ) : (
        <MascotMessage mood="thinking">
          <ul className="think__ideas">
            {step.ideas.map((idea, i) => (
              <li key={i}>{idea}</li>
            ))}
          </ul>
        </MascotMessage>
      )}
    </div>
  );
}
