import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { sfx } from '../audio/sound';
import type { ActivityProps } from '../components/ActivityShell';
import { celebrate } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { Feedback } from '../components/QuestionCard';
import { RichText, VerseQuote } from '../components/RichText';
import { CAPTIONS, CHAPTERS, CUES, FILM_DURATION, NARRATION_SRC } from '../data/film';
import { easeOut, ramp, useTimeline, window01 } from '../lib/timeline';
import { encourage, praise, say } from '../state/guide';
import { BookArt, ScrollArt } from './Gates';
import './cinema.css';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Entrance style driven by the film clock (so pausing freezes it). */
function enter(p: number, dy = 30, scale = 0.08): CSSProperties {
  const e = easeOut(p);
  return { opacity: e, transform: `translateY(${(1 - e) * dy}px) scale(${1 - scale + scale * e})` };
}

export function Cinema({ onFinish }: ActivityProps) {
  const [stage, setStage] = useState<'hall' | 'film'>('hall');
  const [curtain, setCurtain] = useState(false);
  const tl = useTimeline(FILM_DURATION, CUES);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [captions, setCaptions] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // keep optional narration audio in lock-step with the film clock
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (Math.abs(a.currentTime - tl.time) > 0.35) a.currentTime = tl.time;
    if (tl.playing && a.paused) void a.play().catch(() => undefined);
    if (!tl.playing && !a.paused) a.pause();
  }, [tl.time, tl.playing]);

  useEffect(() => {
    if (tl.activeCue) {
      sfx('unlock');
      setPicked(null);
      say('توقّف العرض! أجيبي عن السؤال لنكمل الحكاية.', 'wow');
    }
  }, [tl.activeCue]);

  const startShow = () => {
    sfx('open');
    setCurtain(true);
    window.setTimeout(() => {
      setStage('film');
      tl.play();
      playerRef.current?.focus();
    }, 1100);
  };

  const answer = (i: number) => {
    if (!tl.activeCue || picked !== null) return;
    setPicked(i);
    const ok = i === tl.activeCue.answer;
    setResults((r) => ({ ...r, [tl.activeCue!.id]: ok }));
    if (ok) {
      sfx('correct');
      praise();
    } else {
      sfx('wrong');
      encourage();
    }
  };

  const allAnswered = CUES.every((c) => c.id in results);
  const finished = tl.ended && allAnswered;

  useEffect(() => {
    if (finished) {
      sfx('fanfare');
      celebrate('confetti', 0.5, 0.3);
      say('انتهت الحكاية! هل لاحظتِ كيف ترتبط السنة بالقرآن؟', 'cheer');
    }
  }, [finished]);

  const onKey = (e: React.KeyboardEvent) => {
    if (tl.activeCue) return;
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault();
      if (tl.playing) tl.pause();
      else tl.play();
    } else if (e.key === 'ArrowLeft') tl.seek(tl.time + 5);
    else if (e.key === 'ArrowRight') tl.seek(tl.time - 5);
  };

  const caption = CAPTIONS.find((c) => tl.time >= c.start && tl.time < c.end);
  const chapter = CHAPTERS.find((c) => tl.time >= c.start && tl.time < c.end) ?? CHAPTERS[CHAPTERS.length - 1];

  return (
    <div className="cinema">
      {stage === 'hall' && (
        <div className="hall">
          <div className="hall-screen">
            <div className={`curtain l ${curtain ? 'open' : ''}`} />
            <div className={`curtain r ${curtain ? 'open' : ''}`} />
            <div className="hall-valance" />
            <motion.div className="hall-card panel" initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={curtain ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.3 }}>
              <span className="hall-film">
                <Icon name="film" size={30} />
              </span>
              <h2>حان وقت مشاهدة حكاية المعرفة!</h2>
              <p>فيلم متحرك قصير (دقيقة ونصف تقريبًا) عن مصادر التشريع الإسلامي. سيتوقف العرض ثلاث مرات لتجيبي عن أسئلة سريعة.</p>
              <button type="button" className="btn btn-gold btn-lg" onClick={startShow} disabled={curtain} autoFocus>
                <Icon name="play" />
                ابدئي العرض
              </button>
            </motion.div>
          </div>
          <div className="hall-lights" aria-hidden>
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <div className="hall-seats" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
        </div>
      )}

      {stage === 'film' && (
        <div className="player" ref={playerRef} tabIndex={0} onKeyDown={onKey} aria-label="مشغّل حكاية المعرفة. المسافة للتشغيل والإيقاف، والأسهم للتقديم والترجيع.">
          {NARRATION_SRC && <audio ref={audioRef} src={NARRATION_SRC} preload="auto" />}
          <div className="film" data-playing={tl.playing}>
            <FilmStage t={tl.time} />
            {captions && caption && (
              <div className="film-caption" key={caption.start}>
                <RichText text={caption.text} />
              </div>
            )}
            <div className="film-chapter">{chapter.title}</div>
            {!tl.playing && !tl.activeCue && !tl.ended && (
              <button type="button" className="film-bigplay" onClick={tl.play} aria-label="تشغيل">
                <Icon name="play" size={42} />
              </button>
            )}
            <AnimatePresence>
              {tl.activeCue && (
                <motion.div className="film-cue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    className="film-cue-card panel"
                    role="dialog"
                    aria-modal="true"
                    aria-label="سؤال أثناء العرض"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', bounce: 0.3 }}
                  >
                    <span className="chip">
                      سؤال {CUES.indexOf(tl.activeCue) + 1} من {CUES.length}
                    </span>
                    <h3>{tl.activeCue.text}</h3>
                    <div className="film-cue-options">
                      {tl.activeCue.options.map((o, i) => (
                        <button
                          key={o}
                          type="button"
                          className="qopt"
                          data-state={picked === null ? 'idle' : i === tl.activeCue!.answer ? 'right' : i === picked ? 'wrong' : 'dim'}
                          disabled={picked !== null}
                          onClick={() => answer(i)}
                          autoFocus={i === 0}
                        >
                          <span className="qopt-text">{o}</span>
                        </button>
                      ))}
                    </div>
                    {picked !== null && <Feedback correct={picked === tl.activeCue.answer} correctText={tl.activeCue.options[tl.activeCue.answer]} explanation={tl.activeCue.explanation} />}
                    {picked !== null && (
                      <button type="button" className="btn btn-gold" onClick={tl.resolveCue} autoFocus>
                        <Icon name="play" />
                        تابعي المشاهدة
                      </button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {finished && (
                <motion.div className="film-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="panel film-end-card">
                    <h3>انتهت الحكاية!</h3>
                    <p className="num">
                      أجبتِ عن {Object.values(results).filter(Boolean).length} من {CUES.length} أسئلة إجابة صحيحة.
                    </p>
                    <div className="row-center">
                      <button
                        type="button"
                        className="btn btn-gold btn-lg"
                        autoFocus
                        onClick={() => {
                          const c = Object.values(results).filter(Boolean).length;
                          onFinish({ score: 40 + c * 20, correct: c, total: CUES.length, feats: ['cinema'] });
                        }}
                      >
                        استلمي الجوهرة
                        <Icon name="next" />
                      </button>
                      <button type="button" className="btn btn-ghost-ink" onClick={() => tl.seek(0)}>
                        <Icon name="replay" />
                        شاهدي مرة أخرى
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="controls">
            <button type="button" className="icon-btn" onClick={tl.playing ? tl.pause : tl.play} disabled={!!tl.activeCue} aria-label={tl.playing ? 'إيقاف مؤقت' : 'تشغيل'}>
              <Icon name={tl.playing ? 'pause' : 'play'} />
            </button>
            <button type="button" className="icon-btn" onClick={() => tl.seek(0)} disabled={!!tl.activeCue} aria-label="من البداية">
              <Icon name="restart" />
            </button>
            <span className="time num" dir="ltr">
              {fmt(tl.time)} / {fmt(FILM_DURATION)}
            </span>
            <div className="scrub">
              <input
                type="range"
                min={0}
                max={FILM_DURATION}
                step={0.1}
                value={tl.time}
                disabled={!!tl.activeCue}
                onChange={(e) => tl.seek(Number(e.target.value))}
                aria-label="موضع العرض"
                aria-valuetext={`${fmt(tl.time)} — ${chapter.title}`}
                style={{ ['--p' as string]: `${(tl.time / FILM_DURATION) * 100}%` }}
              />
              {CUES.map((c) => (
                <span key={c.id} className="scrub-cue" data-done={c.id in results} style={{ right: `${(c.at / FILM_DURATION) * 100}%` }} title="سؤال" />
              ))}
            </div>
            <button type="button" className="icon-btn" aria-pressed={captions} onClick={() => setCaptions((c) => !c)} aria-label="الترجمة النصية">
              <span className="cc">نص</span>
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="ملء الشاشة"
              onClick={() => {
                const el = playerRef.current;
                if (!el) return;
                if (document.fullscreenElement) void document.exitFullscreen();
                else void el.requestFullscreen?.().catch(() => undefined);
              }}
            >
              <Icon name="fullscreen" />
            </button>
          </div>
          <ol className="chapters">
            {CHAPTERS.map((c) => (
              <li key={c.id} data-on={chapter.id === c.id} data-past={tl.time >= c.end}>
                {c.title}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ────────────────────── The film itself ────────────────────── */

function Scene({ t, a, b, children, className = '' }: { t: number; a: number; b: number; children: ReactNode; className?: string }) {
  const o = window01(t, a, b, 0.7);
  if (o <= 0) return null;
  return (
    <div className={`scene ${className}`} style={{ opacity: o }}>
      {children}
    </div>
  );
}

function Tag({ p, children, tone = 'teal' }: { p: number; children: ReactNode; tone?: 'teal' | 'pink' | 'gold' | 'lav' }) {
  return (
    <span className="ftag" data-tone={tone} style={enter(p, 24)}>
      {children}
    </span>
  );
}

export function FilmStage({ t }: { t: number }) {
  return (
    <div className="film-stage" aria-hidden>
      <div className="film-bg" style={{ backgroundPosition: `${-t * 6}px 0, ${-t * 2}px 0, 0 0` }} />

      {/* 1 · sources */}
      <Scene t={t} a={0} b={4.4}>
        <div className="f-title" style={enter(ramp(t, 0.2, 1.6), 40, 0.2)}>
          <span className="f-title-star">
            <Icon name="sparkle" size={48} />
          </span>
          <h3>حكاية المعرفة</h3>
          <p style={enter(ramp(t, 1.2, 2.4))}>من مصادر التشريع الإسلامي</p>
        </div>
      </Scene>
      <Scene t={t} a={3.8} b={12.4}>
        <div className="f-def" style={enter(ramp(t, 4, 5))}>
          الأدلة الشرعية <span>التي تُستنبط منها الأحكام</span>
        </div>
        <div className="f-pillars">
          <div className="f-pillar" style={enter(ramp(t, 4.6, 6), 80)}>
            <BookArt open />
            <strong>القرآن الكريم</strong>
          </div>
          <div className="f-pillar" style={enter(ramp(t, 5.2, 6.6), 80)}>
            <ScrollArt open />
            <strong>السنة النبوية</strong>
          </div>
        </div>
        <div className="f-stones">
          <Tag p={ramp(t, 8.2, 9.2)} tone="lav">
            الإجماع
          </Tag>
          <Tag p={ramp(t, 8.6, 9.6)} tone="lav">
            القياس
          </Tag>
        </div>
      </Scene>

      {/* 2 · Quran */}
      <Scene t={t} a={11.8} b={26.4} className="split">
        <div className="f-hero" style={enter(ramp(t, 12, 13.4), 60)}>
          <BookArt open />
          <h4>القرآن الكريم</h4>
          <span className="f-rank">المصدر الأول</span>
        </div>
        <div className="f-tags">
          {['كلام الله تعالى', 'نزل بواسطة جبريل', 'المتعبَّد بتلاوته', 'المنقول بالتواتر', 'من الفاتحة إلى الناس', 'محفوظ من التغيير'].map((x, i) => (
            <Tag key={x} p={ramp(t, 13 + i * 1.5, 14 + i * 1.5)} tone={i === 5 ? 'gold' : 'teal'}>
              {x}
            </Tag>
          ))}
          <div className="f-verse" style={enter(ramp(t, 21.4, 22.6))}>
            <VerseQuote id="hijr9" />
          </div>
        </div>
      </Scene>

      {/* 3 · comprehensiveness */}
      <Scene t={t} a={25.8} b={38.4}>
        <h4 className="f-head" style={enter(ramp(t, 26.2, 27))}>
          تبيانٌ لكل شيء
        </h4>
        <div className="f-domains">
          {['العقيدة', 'العبادات', 'المعاملات', 'الأحوال الشخصية', 'وغيرها'].map((x, i) => (
            <span key={x} className="f-domain" data-lit={t > 27 + i * 0.7} style={enter(ramp(t, 26.6 + i * 0.7, 27.6 + i * 0.7))}>
              {x}
            </span>
          ))}
        </div>
        <div className="f-rulings">
          <div className="f-ruling" style={enter(ramp(t, 31.2, 32.2), 40)}>
            <strong>أحكام مفصّلة</strong>
            <span>المواريث · الطلاق</span>
          </div>
          <div className="f-ruling alt" style={enter(ramp(t, 33.6, 34.6), 40)}>
            <strong>أحكام مجملة</strong>
            <span>الشورى · العدل</span>
            <small>دون تفصيل أسلوب التطبيق</small>
          </div>
        </div>
      </Scene>

      {/* 4 · Sunnah */}
      <Scene t={t} a={37.8} b={50.4} className="split">
        <div className="f-hero" style={enter(ramp(t, 38, 39.4), 60)}>
          <ScrollArt open />
          <h4>السنة النبوية</h4>
          <span className="f-rank">المصدر الثاني</span>
        </div>
        <div className="f-tags">
          {['قول', 'فعل', 'تقرير', 'صفة خَلقية', 'صفة خُلُقية'].map((x, i) => (
            <Tag key={x} p={ramp(t, 38.8 + i * 0.8, 39.8 + i * 0.8)} tone="pink">
              {x}
            </Tag>
          ))}
          <div className="f-seal" style={{ ...enter(ramp(t, 43.2, 44), 0, 0.6) }}>
            حجة واجبة الاتباع
          </div>
          <div className="f-verse" style={enter(ramp(t, 45, 46))}>
            <VerseQuote id="nisa80" />
          </div>
        </div>
      </Scene>

      {/* 5 · three types */}
      <Scene t={t} a={49.8} b={64.4}>
        <h4 className="f-head" style={enter(ramp(t, 50.2, 51))}>
          أقسام السنة النبوية
        </h4>
        <div className="f-lanterns">
          {[
            { at: 54, name: 'القولية', def: 'الأحاديث التي قالها ﷺ', tone: 'pink' },
            { at: 57.5, name: 'الفعلية', def: 'كأداء الصلاة والحج', tone: 'teal' },
            { at: 61, name: 'التقريرية', def: 'إقرار قول أو فعل الصحابي', tone: 'gold' },
          ].map((x, i) => {
            const lit = ramp(t, x.at, x.at + 0.8);
            return (
              <div key={x.name} className="f-lantern" data-tone={x.tone} style={{ ...enter(ramp(t, 51 + i * 0.5, 52 + i * 0.5), 50), ['--lit' as string]: lit }}>
                <span className="f-lantern-glow" />
                <strong>{x.name}</strong>
                <span style={{ opacity: lit }}>{x.def}</span>
              </div>
            );
          })}
        </div>
      </Scene>

      {/* 6 · relation */}
      <Scene t={t} a={63.8} b={80.4}>
        <div className="f-relation">
          <div className="f-side" style={enter(ramp(t, 64.2, 65.4), 40)}>
            <BookArt />
            <strong>القرآن</strong>
          </div>
          <div className="f-bridges">
            {[
              { at: 68, name: 'مؤكِّدة', ex: '«المسلم أخو المسلم» ← [[hujurat10]]' },
              { at: 72, name: 'شارحة ومبيّنة', ex: 'كيفية الصلاة والزكاة والصيام والحج' },
              { at: 76, name: 'مستقلة بأحكام', ex: 'وجوب زكاة الفطر' },
            ].map((x) => (
              <div key={x.name} className="f-bridge" style={enter(ramp(t, x.at, x.at + 0.9), 20)} data-now={t >= x.at && t < x.at + 4}>
                <span className="f-bridge-line" style={{ transform: `scaleX(${easeOut(ramp(t, x.at, x.at + 1))})` }} />
                <strong>{x.name}</strong>
                <small>
                  <RichText text={x.ex} />
                </small>
              </div>
            ))}
          </div>
          <div className="f-side" style={enter(ramp(t, 64.6, 65.8), 40)}>
            <ScrollArt />
            <strong>السنة</strong>
          </div>
        </div>
      </Scene>

      {/* 7 · finale */}
      <Scene t={t} a={79.8} b={FILM_DURATION + 1}>
        <div className="f-finale" style={enter(ramp(t, 80.2, 81.6), 40, 0.15)}>
          <div className="f-pillars small">
            <BookArt open />
            <ScrollArt open />
          </div>
          <h4>شريعة صالحة لكل زمان ومكان</h4>
          <p style={enter(ramp(t, 83.5, 84.5))}>النهاية</p>
        </div>
      </Scene>
    </div>
  );
}
