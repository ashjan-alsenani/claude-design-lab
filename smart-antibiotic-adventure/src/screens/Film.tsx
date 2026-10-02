import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGame } from '../state/game'
import { FILM, FILM_STARTS, FILM_TOTAL, SPEAKER_NAME, type Speaker } from '../film/scenes'
import { FilmClock, type Heard, type Look, type Speech, type TimedLine } from '../film/timeline'
import type { AleenMood } from '../film/actors'
import { SoundToggle } from '../components/Hud'
import { centerOf } from '../components/fx'
import { ar } from '../lib/env'
import '../film/film.css'

const W = 1280
const PARAMS = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams()
const RECORD = PARAMS.has('record')
const START = Math.max(0, Number(PARAMS.get('t')) || 0)
const AUDIT = PARAMS.has('audit')
const CAPTION_HOLD = 1.4

function sceneAt(time: number) {
  let i = 0
  while (i < FILM.length - 1 && time >= FILM_STARTS[i + 1]) i++
  return i
}
/** The line currently on screen: the latest one that has started, held briefly after it ends. */
function captionAt(lines: TimedLine[], t: number) {
  let cur: TimedLine | null = null
  for (const l of lines) if (t >= l.start - 0.05) cur = l
  if (cur && t > cur.end + CAPTION_HOLD) return null
  return cur
}

/* ------------------------------------------------------------------ */
/*  Character voice playback: fixed pre-recorded files, never a        */
/*  browser/device voice. A file that fails to load is never replaced  */
/*  by another voice — that line simply stays captions-only.            */
/* ------------------------------------------------------------------ */
const audioCache = new Map<string, HTMLAudioElement>()
const failed = new Set<string>()
function voiceFile(id: string) {
  let a = audioCache.get(id)
  if (!a) {
    a = new Audio(`${import.meta.env.BASE_URL}voices/${id}.mp3`)
    a.preload = 'auto'
    a.addEventListener('error', () => failed.add(id))
    audioCache.set(id, a)
  }
  return a
}
function stopAllVoices(except?: string) {
  audioCache.forEach((a, id) => {
    if (id !== except && !a.paused) a.pause()
  })
}

/* Soft background music, pre-mixed for this film: it dips under every line of
   dialogue and rises a little in transitions, the intro and the outro
   (tools/build_music.py). It follows the film clock like the voices do. */
let musicEl: HTMLAudioElement | null = null
function music() {
  if (!musicEl) {
    musicEl = new Audio(`${import.meta.env.BASE_URL}music/film-music.mp3`)
    musicEl.preload = 'auto'
  }
  return musicEl
}
function stopMusic() {
  if (musicEl && !musicEl.paused) musicEl.pause()
}

export function Film() {
  const { go, env } = useGame()
  const [time, setTime] = useState(START)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(RECORD)
  const [voices, setVoices] = useState(!RECORD)
  const [musicOn, setMusicOn] = useState(!RECORD)
  const [scale, setScale] = useState(1)
  const frameRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef(START)
  const voicesRef = useRef(voices)
  const musicRef = useRef(musicOn)
  useEffect(() => {
    voicesRef.current = voices
    musicRef.current = musicOn
    if (!musicOn) stopMusic()
  }, [voices, musicOn])
  const getFilmTime = useCallback(() => timeRef.current, [])

  const si = sceneAt(time)
  const scene = FILM[si]
  const t = time - FILM_STARTS[si]
  const line = captionAt(scene.lines, t)
  const lineKey = line?.id ?? ''
  const ended = time >= FILM_TOTAL - 0.05

  // scale the 1280×720 stage to the frame width
  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W))
    ro.observe(el)
    setScale(el.clientWidth / W)
    return () => ro.disconnect()
  }, [])

  // recording mode: 1 s black pre-roll (sync marker for muxing audio), then roll
  useEffect(() => {
    if (!RECORD) return
    let cancelled = false
    void document.fonts.ready.then(() =>
      window.setTimeout(() => {
        if (!cancelled) setPlaying(true)
      }, 1000),
    )
    return () => {
      cancelled = true
    }
  }, [])

  // warm the voice files once playback starts
  useEffect(() => {
    if (started && !RECORD) {
      FILM.forEach((sc) => sc.lines.forEach((l) => voiceFile(l.id)))
      music()
    }
  }, [started])

  // film clock + keeping each character's audio locked to the timeline
  useEffect(() => {
    if (!playing) {
      stopAllVoices()
      stopMusic()
      return
    }
    let raf = 0
    let last = performance.now()
    let acc = 0
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      let next = timeRef.current + dt
      if (next >= FILM_TOTAL) {
        next = FILM_TOTAL
        setPlaying(false)
      }
      timeRef.current = next
      // the one line that should be audible right now (lines never overlap)
      const s = sceneAt(next)
      const lt = next - FILM_STARTS[s]
      const active = FILM[s].lines.find((l) => lt >= l.start && lt < l.end - 0.03) ?? null
      stopAllVoices(active?.id)
      if (active && voicesRef.current && !failed.has(active.id)) {
        const a = voiceFile(active.id)
        const expected = lt - active.start
        if (a.paused) {
          if (Math.abs(a.currentTime - expected) > 0.08) a.currentTime = expected
          void a.play().catch(() => undefined)
        } else if (Math.abs(a.currentTime - expected) > 0.25) {
          a.currentTime = expected
        } else if (a.readyState >= 3 && !a.seeking) {
          // while a character speaks, their voice is the master clock: picture and
          // lips follow the sound exactly instead of drifting against it
          next += (a.currentTime - expected) * 0.3
          timeRef.current = next
        }
      }
      if (musicRef.current) {
        const m = music()
        if (m.paused) {
          if (Math.abs(m.currentTime - next) > 0.1) m.currentTime = next
          if (next < FILM_TOTAL - 0.1) void m.play().catch(() => undefined)
        } else {
          // stay locked to the picture without audible jumps: nudge the speed, seek only if far off
          const err = m.currentTime - next
          if (Math.abs(err) > 0.6) m.currentTime = next
          else m.playbackRate = Math.min(1.06, Math.max(0.94, 1 - err * 0.8))
        }
      }
      acc += dt
      if (acc > 0.05 || next === FILM_TOTAL) {
        acc = 0
        setTime(next)
      }
      if (next < FILM_TOTAL) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      stopAllVoices()
      stopMusic()
    }
  }, [playing])

  // test hook (recording/audit mode only): who should be speaking at this exact instant
  useEffect(() => {
    if (!RECORD) return
    ;(window as unknown as { __filmSpeaker: () => string }).__filmSpeaker = () => {
      const now = timeRef.current
      const s = sceneAt(now)
      const lt = now - FILM_STARTS[s]
      const l = FILM[s].lines.find((x) => lt >= x.start && lt <= x.end)
      return l ? `${l.who}:${l.id}` : ''
    }
  }, [])

  // audit hook (?audit): which voice files are audible, and where they should be
  useEffect(() => {
    if (!AUDIT) return
    ;(window as unknown as { __voiceState: () => unknown }).__voiceState = () => {
      const now = timeRef.current
      const s = sceneAt(now)
      const lt = now - FILM_STARTS[s]
      const l = FILM[s].lines.find((x) => lt >= x.start && lt < x.end - 0.03)
      const audible = [...audioCache.entries()].filter(([, a]) => !a.paused).map(([id, a]) => ({ id, at: a.currentTime }))
      const m = musicEl && !musicEl.paused ? { at: musicEl.currentTime } : null
      return { now, line: l ? { id: l.id, who: l.who, expected: lt - l.start } : null, audible, failed: [...failed], music: m }
    }
  }, [])

  // pause when the tab is hidden so audio and picture never drift apart
  useEffect(() => {
    const onVis = () => document.hidden && setPlaying(false)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      stopAllVoices()
      stopMusic()
    }
  }, [])

  useEffect(() => {
    if (!voices) stopAllVoices()
  }, [voices])

  const stopVoice = () => {
    stopAllVoices()
    stopMusic()
  }

  const seek = (to: number) => {
    stopAllVoices()
    stopMusic()
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
    setPlaying((p) => !p)
  }

  const fullscreen = () => {
    const el = shellRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void el.requestFullscreen?.()
  }

  // turn-taking: who speaks, and where everyone looks
  const speaking = line && t >= line.start - 0.05 && t <= line.end ? line.who : null
  const talking: Speaker | null = speaking
  const g0 = FILM_STARTS[si]
  const speech = (who: Speaker): Speech =>
    line && line.who === who ? { id: line.id, start: g0 + line.start, end: g0 + line.end, mouth: line.mouth, shape: line.shape } : null
  const sp: Record<Speaker, Speech> = { aleen: speech('aleen'), doctor: speech('doctor'), capsule: speech('capsule') }
  // everyone who is not speaking listens to the line (and reacts when it ends)
  const hear = (who: Speaker): Heard => (line && line.who !== who ? { id: line.id, start: g0 + line.start, end: g0 + line.end } : null)
  const heard: Record<Speaker, Heard> = { aleen: hear('aleen'), doctor: hear('doctor'), capsule: hear('capsule') }
  const aleenLook: Look = !line ? 'viewer' : line.who === 'aleen' ? line.look : 'other'
  const docLook: 'aleen' | 'viewer' | 'visual' = !line
    ? 'aleen'
    : line.who === 'doctor'
      ? line.look === 'other'
        ? 'aleen'
        : line.look
      : line.who === 'aleen'
        ? 'aleen'
        : 'visual'
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
                <FilmClock.Provider value={getFilmTime}>
                  <Scene t={t} talking={talking} mood={mood} reduced={env.reducedMotion} sp={sp} heard={heard} aleenLook={aleenLook} docLook={docLook} />
                </FilmClock.Provider>
              </motion.div>
            </AnimatePresence>

            {/* captions */}
            <div className="captions" aria-live="polite">
              <AnimatePresence mode="wait">
                {line && (
                  <motion.p
                    key={lineKey}
                    className={`caption who-${line.who}`}
                    data-line={line.id}
                    data-speaking={speaking ?? ''}
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

          {RECORD && !playing && time < 0.01 && <div className="preroll" />}
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
              className={`ctrl-btn voice ${voices ? 'on' : ''}`}
              onClick={() => setVoices((v) => !v)}
              aria-pressed={voices}
              title={voices ? 'كتم أصوات الشخصيات' : 'تشغيل أصوات الشخصيات'}
            >
              {voices ? '🔊' : '🔇'} <span className="ctrl-label">{voices ? 'أصوات الشخصيات' : 'الترجمة فقط'}</span>
            </button>
            <button
              type="button"
              className={`ctrl-btn voice ${musicOn ? 'on' : ''}`}
              onClick={() => setMusicOn((v) => !v)}
              aria-pressed={musicOn}
              aria-label={musicOn ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
              title={musicOn ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
            >
              🎵 <span className="ctrl-label">{musicOn ? 'الموسيقى' : 'بلا موسيقى'}</span>
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
