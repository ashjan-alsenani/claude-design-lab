import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGame } from '../state/game'
import { FILM, FILM_STARTS, FILM_TOTAL, SPEAKER_NAME, type Line, type Speaker } from '../film/scenes'
import type { AleenMood } from '../film/actors'
import { SoundToggle } from '../components/Hud'
import { centerOf } from '../components/fx'
import { ar } from '../lib/env'
import '../film/film.css'

const W = 1280
const PARAMS = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams()
const RECORD = PARAMS.has('record')
const START = Math.max(0, Number(PARAMS.get('t')) || 0)

const VOICE: Record<Speaker, { pitch: number; rate: number }> = {
  aleen: { pitch: 1.5, rate: 0.95 },
  doctor: { pitch: 1.05, rate: 0.92 },
  capsule: { pitch: 1.8, rate: 1.02 },
}

function sceneAt(time: number) {
  let i = 0
  while (i < FILM.length - 1 && time >= FILM_STARTS[i + 1]) i++
  return i
}
function lineAt(lines: Line[], t: number) {
  let idx = -1
  lines.forEach((l, i) => {
    if (t >= l.at) idx = i
  })
  return idx
}
/** Rough on-screen speaking time when no voice is used. */
const estSpeak = (text: string) => 0.8 + text.split(/\s+/).length * 0.38

function useArabicVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const pick = () => {
      const vs = window.speechSynthesis.getVoices()
      setVoice(vs.find((v) => v.lang.toLowerCase().startsWith('ar')) ?? null)
    }
    pick()
    window.speechSynthesis.addEventListener('voiceschanged', pick)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pick)
  }, [])
  return voice
}

export function Film() {
  const { go, env } = useGame()
  const [time, setTime] = useState(START)
  const [playing, setPlaying] = useState(RECORD)
  const [started, setStarted] = useState(RECORD)
  const [narrate, setNarrate] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [scale, setScale] = useState(1)
  const voice = useArabicVoice()
  const frameRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef(START)
  const spokenRef = useRef('')
  const speakingRef = useRef(false)

  const si = sceneAt(time)
  const scene = FILM[si]
  const t = time - FILM_STARTS[si]
  const li = lineAt(scene.lines, t)
  const line = li >= 0 ? scene.lines[li] : null
  const lineKey = line ? `${si}-${li}` : ''
  const ended = time >= FILM_TOTAL - 0.05
  const canNarrate = !!voice

  // scale the 1280×720 stage to the frame width
  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W))
    ro.observe(el)
    setScale(el.clientWidth / W)
    return () => ro.disconnect()
  }, [])

  // film clock (holds while a narrated line is still being spoken)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    let acc = 0
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      let next = timeRef.current + dt
      if (narrate && speakingRef.current) {
        const s = sceneAt(timeRef.current)
        const lt = timeRef.current - FILM_STARTS[s]
        const nextLine = FILM[s].lines.find((l) => l.at > lt)
        const boundary = FILM_STARTS[s] + (nextLine ? nextLine.at : FILM[s].dur) - 0.01
        if (next > boundary) next = Math.max(timeRef.current, boundary)
      }
      if (next >= FILM_TOTAL) {
        next = FILM_TOTAL
        setPlaying(false)
      }
      timeRef.current = next
      acc += dt
      if (acc > 0.05 || next === FILM_TOTAL) {
        acc = 0
        setTime(next)
      }
      if (next < FILM_TOTAL) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, narrate])

  // narration: speak each new line once
  useEffect(() => {
    if (!narrate || !voice || !playing || !line || spokenRef.current === lineKey) return
    spokenRef.current = lineKey
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(line.text.replace(/\p{Extended_Pictographic}/gu, '').replace(/‍/g, '').replace(/️/g, ''))
    u.voice = voice
    u.lang = voice.lang
    u.pitch = VOICE[line.who].pitch
    u.rate = VOICE[line.who].rate
    u.onstart = () => {
      speakingRef.current = true
      setSpeaking(true)
    }
    u.onend = u.onerror = () => {
      speakingRef.current = false
      setSpeaking(false)
    }
    speakingRef.current = true
    window.speechSynthesis.speak(u)
  }, [narrate, voice, playing, line, lineKey])

  useEffect(() => () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  const stopVoice = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    speakingRef.current = false
    setSpeaking(false)
  }

  const seek = (to: number) => {
    stopVoice()
    spokenRef.current = ''
    timeRef.current = to
    setTime(to)
  }

  const togglePlay = () => {
    if (ended) {
      seek(0)
      setPlaying(true)
      return
    }
    setStarted(true)
    if (playing) {
      setPlaying(false)
      if ('speechSynthesis' in window) window.speechSynthesis.pause()
    } else {
      setPlaying(true)
      if ('speechSynthesis' in window) window.speechSynthesis.resume()
    }
  }

  const fullscreen = () => {
    const el = shellRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.()
  }

  // who is talking right now (mouth/voice waves)
  const talking: Speaker | null = line
    ? narrate && canNarrate
      ? speaking
        ? line.who
        : null
      : t < line.at + estSpeak(line.text)
        ? line.who
        : null
    : null
  const mood: AleenMood = line?.mood ?? 'idle'

  // keyboard: space toggles
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'BUTTON') {
        e.preventDefault()
        togglePlay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const Scene = scene.Comp

  return (
    <main className={`film-screen ${RECORD ? 'recording' : ''}`}>
      {!RECORD && (
        <header className="film-top">
          <button
            type="button"
            className="icon-btn"
            aria-label="العودة إلى البداية"
            title="الرئيسية"
            onClick={(e) => {
              stopVoice()
              go({ name: 'landing' }, { color: '#2f5bea', origin: centerOf(e.currentTarget), kind: 'portal' })
            }}
          >
            <span aria-hidden>🏠</span>
          </button>
          <h1 className="film-heading">
            <span aria-hidden>🎬</span> فيلم ألين: المضادات الحيوية
          </h1>
          <SoundToggle />
        </header>
      )}

      <div className="film-shell" ref={shellRef}>
        <div className="film-frame" ref={frameRef}>
          <div className={`film-stage ${playing ? '' : 'paused'}`} style={{ transform: `scale(${scale})` }}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={scene.key}
                className="scene-wrap"
                initial={env.reducedMotion ? { opacity: 0 } : { clipPath: 'circle(0% at 50% 50%)' }}
                animate={env.reducedMotion ? { opacity: 1 } : { clipPath: 'circle(150% at 50% 50%)' }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
              >
                <Scene t={t} talking={talking} mood={mood} reduced={env.reducedMotion} />
              </motion.div>
            </AnimatePresence>

            {/* captions */}
            <div className="captions" aria-live="polite">
              <AnimatePresence mode="wait">
                {line && (
                  <motion.p
                    key={lineKey}
                    className={`caption who-${line.who}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                    transition={{ type: 'spring', duration: 0.45, bounce: 0.3 }}
                  >
                    <span className="cap-who">{SPEAKER_NAME[line.who]}</span>
                    {line.text}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="chapter-chip">
              {scene.emoji} {scene.chapter}
            </div>
          </div>

          {/* poster / play overlay */}
          <AnimatePresence>
            {(!started || ended) && !RECORD && (
              <motion.button
                type="button"
                className="film-poster"
                onClick={togglePlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                aria-label={ended ? 'شاهد مرة أخرى' : 'شغّل الفيلم'}
              >
                <span className="poster-play">{ended ? '↻' : '▶'}</span>
                <span className="poster-text">{ended ? 'شاهد مرة أخرى' : 'شاهد فيلم ألين'}</span>
                <span className="poster-sub">مغامرة متحركة عن الاستخدام الصحيح للمضادات الحيوية · {ar(Math.round(FILM_TOTAL / 60 * 10) / 10)} دقيقة تقريبًا</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {!RECORD && (
          <div className="film-controls">
            <button type="button" className="ctrl-btn ctrl-play" onClick={togglePlay} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>
              {playing ? '⏸' : '▶'}
            </button>
            <div className="film-progress" role="group" aria-label="فصول الفيلم">
              <div className="fp-track">
                <div className="fp-fill" style={{ transform: `scaleX(${time / FILM_TOTAL})` }} />
              </div>
              {FILM.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={`fp-chapter ${i === si ? 'now' : ''} ${time > FILM_STARTS[i] ? 'seen' : ''}`}
                  style={{ insetInlineStart: `${(FILM_STARTS[i] / FILM_TOTAL) * 100}%`, width: `${(s.dur / FILM_TOTAL) * 100}%` }}
                  onClick={() => {
                    seek(FILM_STARTS[i])
                    setStarted(true)
                    setPlaying(true)
                  }}
                  aria-label={`الفصل ${ar(i + 1)}: ${s.chapter}`}
                  title={s.chapter}
                >
                  <span aria-hidden>{s.emoji}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`ctrl-btn voice ${narrate ? 'on' : ''}`}
              onClick={() => {
                if (narrate) stopVoice()
                spokenRef.current = ''
                setNarrate((n) => !n)
              }}
              disabled={!canNarrate}
              aria-pressed={narrate}
              title={canNarrate ? 'صوت الراوي' : 'لا يتوفر صوت عربي في هذا المتصفح'}
            >
              🗣️ <span className="ctrl-label">{canNarrate ? (narrate ? 'الصوت مُفعّل' : 'تشغيل الصوت') : 'الترجمة فقط'}</span>
            </button>
            <button type="button" className="ctrl-btn" onClick={() => seek(0)} aria-label="من البداية" title="من البداية">
              ↻
            </button>
            <button type="button" className="ctrl-btn" onClick={fullscreen} aria-label="ملء الشاشة" title="ملء الشاشة">
              ⛶
            </button>
          </div>
        )}
        {!RECORD && (
          <div className="film-actions">
            <a className="btn3d small green" href="/aleen-film.mp4" download>
              ⬇️ تحميل الفيديو
            </a>
            <button type="button" className="btn3d small" onClick={(e) => { stopVoice(); go({ name: 'map' }, { color: '#2f5bea', origin: centerOf(e.currentTarget), kind: 'bubbles' }) }}>
              🎮 العب المغامرة
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
