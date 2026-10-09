import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { sfx, sound } from '../audio/sound';
import { StarSprite } from '../components/art/StarSprite';
import { celebrate } from '../components/Confetti';
import { SoundToggles } from '../components/Hud';
import { Icon } from '../components/Icon';
import { useReducedMotion } from '../lib/motion';
import { navigate } from '../lib/router';
import { say } from '../state/guide';
import { progressStore, setName, useProgress } from '../state/progress';
import './intro.css';

type Phase = 'idle' | 'opening' | 'zoom' | 'name';

const TITLE = ['رحلة', 'إلى', 'كنوز', 'المعرفة'];

export function Intro() {
  const savedName = useProgress((p) => p.name);
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('idle');
  const [name, setNameInput] = useState(savedName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === 'name') window.setTimeout(() => inputRef.current?.focus(), 350);
  }, [phase]);

  const start = () => {
    sound.unlock();
    sfx('open');
    setPhase('opening');
    const t1 = reduced ? 50 : 1100;
    window.setTimeout(() => {
      sfx('whoosh');
      setPhase('zoom');
      celebrate('sparkles', 0.5, 0.5, 1.4);
    }, t1);
    window.setTimeout(() => setPhase('name'), t1 + (reduced ? 50 : 900));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) {
      inputRef.current?.focus();
      return;
    }
    setName(n);
    sfx('unlock');
    say(`أهلًا بكِ يا ${n}! الجزيرة الأولى تنتظركِ، اضغطي عليها لنبدأ.`, 'cheer');
    navigate({ name: 'map' });
  };

  const opened = phase !== 'idle';

  return (
    <div className="intro" data-phase={phase}>
      <div className="intro-top">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate({ name: 'teacher' })}>
          <Icon name="teacher" />
          <span>لوحة المعلمة</span>
        </button>
        <div className="row-center">
          <SoundToggles />
        </div>
      </div>

      <motion.div
        className="intro-world"
        animate={phase === 'zoom' || phase === 'name' ? { scale: reduced ? 1 : 3.2, opacity: 0, filter: 'blur(6px)' } : { scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: [0.77, 0, 0.175, 1] }}
        style={{ transformOrigin: '50% 58%' }}
      >
        <div className="intro-island">
          <IntroIsland opened={opened} />
        </div>
      </motion.div>

      <AnimatePresence>
        {phase === 'idle' && (
          <motion.section className="intro-copy" exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}>
            <h1 className="intro-title" aria-label="رحلة إلى كنوز المعرفة">
              {TITLE.map((w, i) => (
                <motion.span
                  key={w}
                  aria-hidden
                  initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.25 + i * 0.16, duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                >
                  {w}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="intro-sub"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.7 }}
            >
              ثمانية تحديات، ثمانية كنوز، ومغامرة لا تُنسى!
            </motion.p>
            <motion.p className="intro-lesson" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
              درس «من مصادر التشريع الإسلامي (1)»
            </motion.p>
            <motion.div
              className="intro-cta"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.35, type: 'spring', bounce: 0.4 }}
            >
              <button type="button" className="btn btn-gold btn-lg intro-start" onClick={start}>
                <Icon name="sparkle" />
                {savedName ? `تابعي المغامرة يا ${savedName}` : 'ابدئي المغامرة'}
              </button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'name' && (
          <motion.div className="intro-name-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <motion.form
              className="intro-name panel"
              onSubmit={submit}
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', duration: 0.7, bounce: 0.3, delay: 0.1 }}
            >
              <div className="intro-name-star">
                <StarSprite mood="cheer" size={110} />
              </div>
              <h2>مرحبًا بكِ في عالم الكنوز!</h2>
              <p>أنا «سَنا»، نجمتكِ المرشدة. سأرافقكِ في الجزر الثماني حتى قصر التتويج. ما اسمكِ أو لقبكِ؟</p>
              <label className="field">
                <span className="sr-only">اسمكِ أو لقبكِ</span>
                <input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={40}
                  placeholder="اكتبي اسمكِ هنا"
                  autoComplete="off"
                  required
                />
              </label>
              <button type="submit" className="btn btn-gold btn-lg" disabled={!name.trim()}>
                انطلقي إلى الخريطة
                <Icon name="next" />
              </button>
              {savedName && (
                <button
                  type="button"
                  className="btn btn-ghost-ink btn-sm"
                  onClick={() => {
                    if (window.confirm('هل تريدين بدء رحلة جديدة؟ سيُمسح التقدم المحفوظ على هذا الجهاز.')) {
                      progressStore.reset();
                      setNameInput('');
                    }
                  }}
                >
                  <Icon name="restart" size={18} />
                  بدء رحلة جديدة من الصفر
                </button>
              )}
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IntroIsland({ opened }: { opened: boolean }) {
  return (
    <svg viewBox="0 0 400 420" className="intro-svg" aria-hidden>
      <defs>
        <linearGradient id="ii-rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b79cf6" />
          <stop offset=".5" stopColor="#6745bd" />
          <stop offset="1" stopColor="#24165a" />
        </linearGradient>
        <linearGradient id="ii-lawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9fbf5" />
          <stop offset="1" stopColor="#6fd8cc" />
        </linearGradient>
        <linearGradient id="ii-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf2" />
          <stop offset="1" stopColor="#ecdcff" />
        </linearGradient>
        <linearGradient id="ii-dome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0bf" />
          <stop offset="1" stopColor="#e09e2c" />
        </linearGradient>
        <radialGradient id="ii-light" cx="50%" cy="60%" r="60%">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".4" stopColor="#fff2c4" />
          <stop offset="1" stopColor="#ffd66e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ii-door" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8260dc" />
          <stop offset="1" stopColor="#4e3196" />
        </linearGradient>
        <radialGradient id="ii-under" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#7fe3dc" stopOpacity=".55" />
          <stop offset="1" stopColor="#7fe3dc" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="380" rx="150" ry="36" fill="url(#ii-under)" />
      <path d="M40 252c0-12 22-20 46-22 38-4 76-6 114-6s76 2 114 6c24 2 46 10 46 22 0 16-18 28-34 40-20 14-36 32-52 52-16 20-36 52-74 52s-54-28-70-48-36-40-56-56c-16-12-34-24-34-40Z" fill="url(#ii-rock)" />
      <path d="M70 290c40 12 88 16 130 16s90-4 130-16" stroke="#fff" strokeOpacity=".16" strokeWidth="3" fill="none" />
      <path d="M180 384l12 30 12-28-12-10Z" fill="#c2a9fb" />
      <path d="M232 360l7 20 7-18-7-6Z" fill="#b5f3ee" />
      <ellipse cx="200" cy="250" rx="162" ry="32" fill="url(#ii-lawn)" />
      <ellipse cx="200" cy="244" rx="140" ry="20" fill="#fff" opacity=".25" />

      {/* palace */}
      <rect x="88" y="150" width="34" height="96" fill="url(#ii-wall)" />
      <rect x="278" y="150" width="34" height="96" fill="url(#ii-wall)" />
      <path d="M84 154c0-22 21-36 21-54 0 18 21 32 21 54Z" fill="url(#ii-dome)" />
      <path d="M274 154c0-22 21-36 21-54 0 18 21 32 21 54Z" fill="url(#ii-dome)" />
      <circle cx="105" cy="96" r="5" fill="#ffd66e" />
      <circle cx="295" cy="96" r="5" fill="#ffd66e" />
      <rect x="122" y="160" width="156" height="86" fill="url(#ii-wall)" />
      <path d="M132 164c0-50 28-82 68-100 40 18 68 50 68 100Z" fill="url(#ii-dome)" />
      <path d="M200 64V40" stroke="#e09e2c" strokeWidth="5" />
      <path d="M200 24a10 10 0 1 0 8 16 12 12 0 1 1-8-16Z" fill="#ffd66e" />
      <path d="M140 196a10 10 0 0 1 20 0v14h-20Zm100 0a10 10 0 0 1 20 0v14h-20Z" fill="#c2a9fb" />
      <path d="M96 190a9 9 0 0 1 18 0v12H96Zm190 0a9 9 0 0 1 18 0v12h-18Z" fill="#c2a9fb" />

      {/* gate */}
      <path d="M164 246v-48a36 36 0 0 1 72 0v48Z" fill="#2a1a5e" />
      <g className={`intro-light ${opened ? 'on' : ''}`}>
        <path d="M164 246v-48a36 36 0 0 1 72 0v48Z" fill="url(#ii-light)" />
        <ellipse cx="200" cy="220" rx="90" ry="70" fill="url(#ii-light)" opacity=".7" />
      </g>
      <g className={`intro-door left ${opened ? 'open' : ''}`}>
        <path d="M164 246v-48a36 36 0 0 1 36-36v84Z" fill="url(#ii-door)" stroke="#ffd66e" strokeWidth="3" />
        <circle cx="193" cy="214" r="3" fill="#ffd66e" />
        <path d="M172 200h20M172 224h20" stroke="#ffd66e" strokeOpacity=".5" strokeWidth="2" />
      </g>
      <g className={`intro-door right ${opened ? 'open' : ''}`}>
        <path d="M236 246v-48a36 36 0 0 0-36-36v84Z" fill="url(#ii-door)" stroke="#ffd66e" strokeWidth="3" />
        <circle cx="207" cy="214" r="3" fill="#ffd66e" />
        <path d="M208 200h20M208 224h20" stroke="#ffd66e" strokeOpacity=".5" strokeWidth="2" />
      </g>
      <path d="M156 160a44 44 0 0 1 88 0" stroke="#ffd66e" strokeWidth="5" fill="none" className="pulse" />
      {/* garden sparkles */}
      <circle cx="70" cy="244" r="5" fill="#f8a8cb" />
      <circle cx="330" cy="244" r="5" fill="#ffd66e" />
      <circle cx="150" cy="262" r="4" fill="#ffd66e" />
      <circle cx="252" cy="262" r="4" fill="#f8a8cb" />
    </svg>
  );
}
