import { useEffect, useState } from 'react';
import { canSpeak, isEnglish, speak, stopSpeaking } from '../lib/speech';

interface Props {
  text: string | undefined;
  /** big round button for listening questions */
  big?: boolean;
  label?: string;
  className?: string;
}

/** 🔊 button that reads English text aloud. Renders nothing for Arabic text or without speech support. */
export function Say({ text, big = false, label, className = '' }: Props) {
  const [on, setOn] = useState(false);
  useEffect(() => () => stopSpeaking(), []);
  if (!canSpeak() || !isEnglish(text)) return null;
  const run = (slow: boolean) => {
    setOn(true);
    speak(text, { slow, onEnd: () => setOn(false) });
  };
  const button = (
    <button
      type="button"
      className={`say ${big ? 'say--big' : ''} ${on ? 'say--on' : ''} ${className}`}
      aria-label={label ?? `استمعي: ${text}`}
      title="استمعي"
      onClick={(e) => {
        e.stopPropagation();
        run(false);
      }}
    >
      <span aria-hidden="true">🔊</span>
      {big && <span className="say__label">{label ?? 'استمعي'}</span>}
    </button>
  );
  if (!big) return button;
  return (
    <span className="say-row">
      {button}
      <button type="button" className="say say--slow" aria-label="استمعي ببطء" title="ببطء" onClick={() => run(true)}>
        <span aria-hidden="true">🐢</span>
      </button>
    </span>
  );
}
