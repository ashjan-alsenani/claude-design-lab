import { useState } from 'react';

type Rec = { lang: string; interimResults: boolean; maxAlternatives: number; start: () => void; onresult: (e: { results: { 0: { transcript: string } }[][] & ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onerror: () => void; onend: () => void };

function recognizer(): Rec | null {
  const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? new C() : null;
}

/** 🎤 Say the word. Uses the browser's own speech recognition when available; friendly, never harsh. */
export function Pronounce({ word }: { word: string }) {
  const [state, setState] = useState<'idle' | 'listening' | 'good' | 'again'>('idle');
  const [heard, setHeard] = useState('');
  if (typeof window === 'undefined' || !recognizer()) return null;
  const start = () => {
    const r = recognizer();
    if (!r) return;
    r.lang = 'en-GB';
    r.interimResults = false;
    r.maxAlternatives = 3;
    setState('listening');
    r.onresult = (e) => {
      const alts = Array.from(e.results[0] as ArrayLike<{ transcript: string }>).map((a) => a.transcript.toLowerCase().trim());
      setHeard(alts[0] ?? '');
      const target = word.toLowerCase();
      setState(alts.some((a) => a.includes(target) || target.includes(a)) ? 'good' : 'again');
    };
    r.onerror = () => setState('again');
    r.onend = () => setState((s) => (s === 'listening' ? 'idle' : s));
    r.start();
  };
  return (
    <span className="pron">
      <button type="button" className={`say ${state === 'listening' ? 'say--on' : ''}`} onClick={start} aria-label={`قولي ${word}`} title="قولي الكلمة">
        🎤
      </button>
      {state === 'good' && <span className="pron__msg pron__msg--good">👏 Great!</span>}
      {state === 'again' && (
        <span className="pron__msg">
          💪 I heard “{heard || '…'}”. Listen 🔊 and try again!
        </span>
      )}
    </span>
  );
}
