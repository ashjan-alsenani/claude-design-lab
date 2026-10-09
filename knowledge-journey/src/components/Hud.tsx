import { motion } from 'framer-motion';
import { sfx, sound } from '../audio/sound';
import { navigate } from '../lib/router';
import { ACTIVITY_ORDER, gemCount, starCount, totalXp, useProgress } from '../state/progress';
import { settingsStore, useSettings } from '../state/settings';
import { ACTIVITY_GEM, Gem } from './art/Gem';
import { Icon } from './Icon';
import './hud.css';

export function SoundToggles() {
  const music = useSettings((s) => s.music);
  const fx = useSettings((s) => s.sfx);
  return (
    <>
      <button
        type="button"
        className="icon-btn"
        aria-pressed={music}
        aria-label={music ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى الهادئة'}
        title={music ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
        onClick={() => {
          const on = !music;
          settingsStore.set((s) => ({ ...s, music: on }));
          sound.setMusic(on);
        }}
      >
        <Icon name="music" />
        {!music && <span className="icon-slash" aria-hidden />}
      </button>
      <button
        type="button"
        className="icon-btn"
        aria-pressed={fx}
        aria-label={fx ? 'كتم المؤثرات الصوتية' : 'تشغيل المؤثرات الصوتية'}
        title={fx ? 'كتم المؤثرات' : 'تشغيل المؤثرات'}
        onClick={() => {
          settingsStore.set((s) => ({ ...s, sfx: !fx }));
          if (!fx) window.setTimeout(() => sfx('tap'), 0);
        }}
      >
        <Icon name={fx ? 'speaker' : 'mute'} />
      </button>
    </>
  );
}

export function Hud({ title, onBack }: { title?: string; onBack?: () => void }) {
  const xp = useProgress(totalXp);
  const gems = useProgress(gemCount);
  const stars = useProgress(starCount);
  const done = useProgress((p) => ACTIVITY_ORDER.map((id) => p.activities[id].completed));
  return (
    <header className="hud">
      <div className="hud-start">
        {onBack ? (
          <button type="button" className="btn btn-ghost btn-sm hud-back" onClick={onBack}>
            <Icon name="map" />
            <span>الخريطة</span>
          </button>
        ) : (
          <button type="button" className="hud-brand" onClick={() => navigate({ name: 'intro' })} aria-label="الصفحة الافتتاحية">
            <Gem hue="gold" size={30} />
            <span>رحلة إلى كنوز المعرفة</span>
          </button>
        )}
        {title && <h1 className="hud-title">{title}</h1>}
      </div>
      <div className="hud-stats" aria-label="تقدّمكِ">
        <div className="hud-gems" title={`${gems} من 8 جواهر`}>
          {ACTIVITY_ORDER.map((id, i) => (
            <motion.span key={id} initial={false} animate={done[i] ? { scale: [1.5, 1] } : { scale: 1 }} transition={{ duration: 0.5 }}>
              <Gem hue={ACTIVITY_GEM[id]} size={20} dim={!done[i]} />
            </motion.span>
          ))}
        </div>
        <span className="hud-pill" title="الجواهر">
          <Gem hue="violet" size={18} />
          <span className="num">{gems}/8</span>
          <span className="sr-only">جواهر</span>
        </span>
        <span className="hud-pill" title="النجوم">
          <Icon name="star" size={18} />
          <span className="num">{stars}</span>
          <span className="sr-only">نجوم</span>
        </span>
        <span className="hud-pill hud-xp" title="نقاط الخبرة XP">
          <Icon name="sparkle" size={18} />
          <motion.span key={xp} className="num" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {xp}
          </motion.span>
          <span className="hud-unit">XP</span>
        </span>
      </div>
      <div className="hud-end">
        <SoundToggles />
      </div>
    </header>
  );
}
