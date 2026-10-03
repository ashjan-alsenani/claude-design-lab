/**
 * Dialogue / story player (English): lines appear one at a time like a chat,
 * each with a 🔊 button and an optional Arabic help line.
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { DialogueStep } from '../data/types';
import { play } from '../lib/sound';
import { canSpeak, isEnglish, speak, stopSpeaking } from '../lib/speech';
import { MascotMessage } from '../components/MascotMessage';
import { Say } from '../components/Say';
import type { ActivityProps } from './Discover';

export function DialoguePlayer({ step, onComplete }: ActivityProps<DialogueStep>) {
  const [shown, setShown] = useState(1);
  const [help, setHelp] = useState(true);
  const [playing, setPlaying] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const all = shown >= step.lines.length;

  useEffect(() => {
    if (all) onComplete();
  }, [all, onComplete]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    if (shown > 1) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [shown]);

  const side = (who: string) => {
    const k = step.cast.findIndex((c) => c.name === who);
    return k < 0 ? 'narrator' : k % 2 === 0 ? 'a' : 'b';
  };
  const emojiOf = (who: string) => step.cast.find((c) => c.name === who)?.emoji ?? '🙂';

  /** read every line from the first one, revealing as it goes */
  function playAll() {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    const readFrom = (k: number) => {
      if (k >= step.lines.length) {
        setPlaying(false);
        return;
      }
      setShown((s) => Math.max(s, k + 1));
      const line = step.lines[k];
      if (!isEnglish(line.text)) return readFrom(k + 1);
      speak(line.text, { onEnd: () => window.setTimeout(() => readFrom(k + 1), 250) });
    };
    readFrom(0);
  }

  return (
    <div className="activity dialogue">
      {step.mascot && <MascotMessage mood="happy">{step.mascot}</MascotMessage>}
      <div className="dialogue__bar">
        <div className="dialogue__cast" aria-label="الشخصيات">
          {step.scene && <span className="dialogue__scene" aria-hidden="true">{step.scene}</span>}
          {step.cast.map((c) => (
            <span key={c.name} className="dialogue__who">
              <span aria-hidden="true">{c.emoji}</span> <bdi>{c.name}</bdi>
            </span>
          ))}
        </div>
        <div className="dialogue__tools">
          {canSpeak() && (
            <button type="button" className={`btn btn--ghost btn--sm ${playing ? 'is-on' : ''}`} onClick={playAll}>
              {playing ? '⏹️ إيقاف' : '▶️ استمعي للكل'}
            </button>
          )}
          {step.lines.some((l) => l.ar) && (
            <button type="button" className="btn btn--ghost btn--sm" aria-pressed={help} onClick={() => setHelp((h) => !h)}>
              {help ? '🙈 إخفاء الترجمة' : '💡 الترجمة'}
            </button>
          )}
        </div>
      </div>
      <div className="dialogue__lines" lang="en">
        {step.lines.slice(0, shown).map((l, k) => {
          const s = side(l.who);
          return (
            <motion.div
              key={k}
              className={`line line--${s}`}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
            >
              {s !== 'narrator' && (
                <span className="line__avatar" aria-hidden="true">
                  {emojiOf(l.who)}
                </span>
              )}
              <div className="line__bubble">
                {s !== 'narrator' && <div className="line__name">{l.who}</div>}
                <div className="line__row">
                  <p className="line__text" dir="ltr">
                    {l.text}
                  </p>
                  <Say text={l.text} />
                </div>
                {help && l.ar && (
                  <p className="line__ar" dir="rtl" lang="ar">
                    {l.ar}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
        <div ref={endRef} />
      </div>
      {!all && (
        <button
          type="button"
          className="btn btn--sun btn--lg reveal-more"
          onClick={() => {
            play('flip');
            setShown((v) => v + 1);
          }}
        >
          السطر التالي 💬 ({shown}/{step.lines.length})
        </button>
      )}
    </div>
  );
}
