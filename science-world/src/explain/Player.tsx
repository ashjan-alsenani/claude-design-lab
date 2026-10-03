/**
 * Plays an explainer: scene after scene, with narration under the stage,
 * play/pause, previous/next, replay and read-aloud.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Stage, sceneDuration } from './Stage';
import type { Explainer } from './types';
import { canSpeak, canSpeakArabic, isEnglish, speak, stopSpeaking } from '../lib/speech';
import { mixed } from '../lib/bidi';
import { play } from '../lib/sound';
import { Mascot } from '../components/Mascot';

interface Props {
  ex: Explainer;
  onClose: () => void;
  onDone?: () => void;
  doneLabel?: string;
  /** preview / screenshots: freeze at this scene and time */
  still?: { scene: number; t: number };
}

export function ExplainerPlayer({ ex, onClose, onDone, doneLabel = 'ابدئي الدرس ←', still }: Props) {
  const [i, setI] = useState(still?.scene ?? 0);
  const [nonce, setNonce] = useState(0);
  const [playing, setPlaying] = useState(!still);
  const [finished, setFinished] = useState(false);
  const [voice, setVoice] = useState(() => {
    try {
      return localStorage.getItem('explain.voice') !== 'off';
    } catch {
      return true;
    }
  });
  const scene = ex.scenes[i];
  const D = scene ? sceneDuration(scene) : 0;
  const en = isEnglish(scene?.say);
  const voiceAvailable = canSpeak() && (en || canSpeakArabic());

  // scene clock (seconds), pausable
  const offset = useRef(still?.t ?? 0);
  const startedAt = useRef(performance.now());
  const playingRef = useRef(playing);
  const speaking = useRef(false);
  const clock = useCallback(() => (playingRef.current ? offset.current + (performance.now() - startedAt.current) / 1000 : offset.current), []);

  const startScene = useCallback((k: number) => {
    stopSpeaking();
    offset.current = 0;
    startedAt.current = performance.now();
    setI(k);
    setNonce((n) => n + 1);
    setFinished(false);
  }, []);

  // narration at the start of every scene
  useEffect(() => {
    if (!scene || still || !voice || !voiceAvailable || !playingRef.current) return;
    speaking.current = true;
    speak(scene.say, { lang: en ? 'en' : 'ar', onEnd: () => (speaking.current = false) });
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, nonce, voice]);

  // advance when the scene (and its narration) is over
  useEffect(() => {
    if (still) return;
    const t = window.setInterval(() => {
      if (!playingRef.current) return;
      if (clock() >= D && !speaking.current) {
        if (i + 1 < ex.scenes.length) startScene(i + 1);
        else {
          playingRef.current = false;
          setPlaying(false);
          setFinished(true);
          play('level');
        }
      }
    }, 200);
    return () => window.clearInterval(t);
  }, [i, D, ex.scenes.length, clock, startScene, still]);

  useEffect(() => () => stopSpeaking(), []);

  const toggle = () => {
    play('tap');
    if (finished) {
      startScene(0);
      playingRef.current = true;
      setPlaying(true);
      return;
    }
    if (playingRef.current) {
      offset.current = clock();
      playingRef.current = false;
      setPlaying(false);
      stopSpeaking();
      speaking.current = false;
    } else {
      startedAt.current = performance.now();
      playingRef.current = true;
      setPlaying(true);
    }
  };
  const go = (k: number) => {
    play('tap');
    playingRef.current = true;
    setPlaying(true);
    startScene(Math.max(0, Math.min(ex.scenes.length - 1, k)));
  };

  return (
    <div className={`xplayer ${playing && !finished ? "is-playing" : ""}`}>
      <div className="xplayer__bar">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق الشرح">
          ✕
        </button>
        <div className="xplayer__title">🎬 {mixed(ex.title)}</div>
        {voiceAvailable && (
          <button
            type="button"
            className={`icon-btn ${voice ? '' : 'is-off'}`}
            aria-pressed={voice}
            aria-label={voice ? 'إيقاف صوت الشرح' : 'تشغيل صوت الشرح'}
            onClick={() => {
              const v = !voice;
              setVoice(v);
              try {
                localStorage.setItem('explain.voice', v ? 'on' : 'off');
              } catch {
                /* ignore */
              }
              if (!v) {
                stopSpeaking();
                speaking.current = false;
              }
            }}
          >
            {voice ? '🗣️' : '🔇'}
          </button>
        )}
      </div>

      <div className="xplayer__screen">
        {scene && <Stage key={`${i}-${nonce}`} scene={scene} seek={still ? still.t : 0} paused={!playing} clock={clock} />}
        {finished && (
          <motion.div className="xplayer__end" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <Mascot mood="celebrating" size={110} />
            <strong>🎉 انتهى الشرح!</strong>
            <span>هل وصلت الفكرة؟ يمكنكِ مشاهدته مرة أخرى في أي وقت.</span>
            <div className="xplayer__end-actions">
              {onDone && (
                <button type="button" className="btn btn--good btn--lg" onClick={onDone} autoFocus>
                  {doneLabel}
                </button>
              )}
              <button type="button" className="btn btn--ghost" onClick={toggle}>
                🔁 شاهدي مرة أخرى
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {scene && (
        <motion.div key={`c${i}`} className="xplayer__caption" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <p dir="auto" lang={en ? 'en' : 'ar'}>{mixed(scene.say)}</p>
          {scene.sayAr && <p className="xplayer__ar" dir="rtl">{mixed(scene.sayAr)}</p>}
        </motion.div>
      )}

      <div className="xplayer__controls">
        <button type="button" className="icon-btn" onClick={() => go(i - 1)} disabled={i === 0} aria-label="المشهد السابق">
          ⏭️
        </button>
        <button type="button" className="xplayer__play" onClick={toggle} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>
          {finished ? '🔁' : playing ? '⏸️' : '▶️'}
        </button>
        <button type="button" className="icon-btn" onClick={() => go(i + 1)} disabled={i >= ex.scenes.length - 1} aria-label="المشهد التالي">
          ⏮️
        </button>
        <button type="button" className="icon-btn" onClick={() => go(i)} aria-label="أعيدي المشهد">
          🔁
        </button>
      </div>
      <ol className="xplayer__dots" aria-label="المشاهد">
        {ex.scenes.map((s, k) => (
          <li key={k}>
            <button type="button" className={k === i ? 'on' : k < i ? 'done' : ''} onClick={() => go(k)} aria-label={`المشهد ${k + 1}${s.title ? `: ${s.title}` : ''}`} aria-current={k === i ? 'step' : undefined}>
              {k === i && playing && !finished && <span className="xplayer__fill" key={`${i}-${nonce}`} style={{ animationDuration: `${D}s` }} />}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
