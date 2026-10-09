import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../audio/sound';
import type { ActivityProps } from '../components/ActivityShell';
import { ACTIVITY_GEM, Gem } from '../components/art/Gem';
import { StarSprite } from '../components/art/StarSprite';
import { celebrate } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { ACTIVITIES } from '../data/activities';
import { downloadCanvas, drawCertificate } from '../lib/certificate';
import { navigate } from '../lib/router';
import { accuracy, ACTIVITY_ORDER, BADGES, gemCount, learningActivities, progressStore, tierFor, TIERS, totalXp, useProgress } from '../state/progress';
import './crown.css';

export function Crown({ onFinish }: ActivityProps) {
  const [phase, setPhase] = useState<'gate' | 'open' | 'results'>('gate');
  const p = useProgress((x) => x);
  const recorded = useRef(false);
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tier = tierFor(p);
  const xp = totalXp(p);
  const gems = gemCount(p);
  const acc = accuracy(p);
  const completed = ACTIVITY_ORDER.filter((id) => p.activities[id].completed).length;

  const openGate = () => {
    sfx('open');
    setPhase('open');
    window.setTimeout(() => {
      if (!recorded.current) {
        recorded.current = true;
        onFinish({ score: 50, correct: 0, total: 0 });
      }
      sfx('fanfare');
      celebrate('confetti', 0.3, 0.3);
      window.setTimeout(() => celebrate('confetti', 0.7, 0.3), 350);
      setPhase('results');
    }, 1400);
  };

  useEffect(() => {
    if (phase !== 'results') return;
    let alive = true;
    const s = progressStore.get();
    void drawCertificate({
      name: s.name,
      title: tierFor(s).title,
      xp: totalXp(s),
      gems: gemCount(s),
      accuracy: accuracy(s),
      completed: ACTIVITY_ORDER.filter((id) => s.activities[id].completed).length,
      date: new Date(),
    }).then((c) => {
      if (!alive) return;
      canvasRef.current = c;
      setCertUrl(c.toDataURL('image/png'));
    });
    return () => {
      alive = false;
    };
  }, [phase, xp, gems, acc]);

  if (phase !== 'results') {
    return (
      <div className="crown-gate-stage">
        <motion.div className="palace-gate" data-open={phase === 'open'} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="palace-arch">
            <div className="palace-light" />
            <div className="palace-door l" />
            <div className="palace-door r" />
          </div>
        </motion.div>
        <div className="crown-gate-copy">
          <h2>البوابة الذهبية لقصر التتويج</h2>
          <p>جمعتِ جواهر الجزر السبع. حان وقت التتويج!</p>
          <button type="button" className="btn btn-gold btn-lg" onClick={openGate} disabled={phase === 'open'} autoFocus>
            <Icon name="crown" />
            افتحي البوابة الذهبية
          </button>
        </div>
      </div>
    );
  }

  const tierIndex = TIERS.findIndex((t) => t.id === tier.id);

  return (
    <div className="crown">
      <motion.section className="crown-hero" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.3 }}>
        <div className="crown-star">
          <StarSprite mood="cheer" size={120} />
        </div>
        <p className="crown-hello">مبارك يا {p.name}!</p>
        <h2 className="crown-title">{tier.title}</h2>
        <p className="crown-desc">{tier.description}</p>
        <div className="crown-gems" aria-label={`${gems} من 8 جواهر`}>
          {ACTIVITY_ORDER.map((id, i) => (
            <motion.span key={id} initial={{ y: -40, opacity: 0, rotate: -40 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ delay: 0.3 + i * 0.1, type: 'spring', bounce: 0.5 }}>
              <Gem hue={ACTIVITY_GEM[id]} size={44} dim={!p.activities[id].completed} />
            </motion.span>
          ))}
        </div>
      </motion.section>

      <section className="crown-board panel" aria-label="لوحة النتائج النهائية">
        <dl className="crown-stats">
          <div>
            <dt>اسم الطالبة</dt>
            <dd>{p.name}</dd>
          </div>
          <div>
            <dt>الأنشطة المكتملة</dt>
            <dd className="num">{completed} / 8</dd>
          </div>
          <div>
            <dt>مجموع النقاط</dt>
            <dd className="num">{xp} XP</dd>
          </div>
          <div>
            <dt>الجواهر</dt>
            <dd className="num">{gems}</dd>
          </div>
          <div>
            <dt>نسبة الإجابات الصحيحة</dt>
            <dd className="num">{acc}%</dd>
          </div>
          <div>
            <dt>اللقب النهائي</dt>
            <dd>{tier.title}</dd>
          </div>
        </dl>

        <ol className="tier-ladder" aria-label="مستويات الإنجاز">
          {TIERS.map((t, i) => (
            <li key={t.id} data-on={i <= tierIndex} data-current={i === tierIndex}>
              <Icon name={i === TIERS.length - 1 ? 'crown' : 'star'} size={20} />
              <span>{t.title}</span>
            </li>
          ))}
        </ol>

        <table className="crown-table">
          <caption className="sr-only">نتائج الجزر</caption>
          <thead>
            <tr>
              <th>الجزيرة</th>
              <th>النجوم</th>
              <th>النقاط</th>
              <th>الصحيحة</th>
            </tr>
          </thead>
          <tbody>
            {learningActivities.map((id) => {
              const r = p.activities[id];
              return (
                <tr key={id}>
                  <td>{ACTIVITIES[id].title}</td>
                  <td>
                    <span className="mini-stars" aria-label={`${r.stars} نجوم`}>
                      {[0, 1, 2].map((s) => (
                        <span key={s} data-on={s < r.stars}>
                          <Icon name="star" size={14} />
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="num">{r.bestScore}</td>
                  <td className="num">{r.total ? `${r.correct}/${r.total}` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="crown-badges">
          {BADGES.map((b) => {
            const on = p.badges.includes(b.id);
            return (
              <div key={b.id} className="cbadge" data-on={on} title={b.description}>
                <Icon name="trophy" size={22} />
                <strong>{b.name}</strong>
                <small>{b.description}</small>
              </div>
            );
          })}
        </div>
      </section>

      <section className="cert-section">
        <h3>شهادتكِ</h3>
        <div className="cert-frame">
          {certUrl ? <img src={certUrl} alt={`شهادة إنجاز باسم ${p.name} بلقب ${tier.title}`} className="cert-img print-area" /> : <div className="cert-loading">جارٍ تجهيز الشهادة…</div>}
        </div>
        <div className="row-center">
          <button type="button" className="btn btn-gold btn-lg" disabled={!certUrl} onClick={() => canvasRef.current && downloadCanvas(canvasRef.current, 'knowledge-journey-certificate.png')}>
            <Icon name="download" />
            تنزيل الشهادة (PNG)
          </button>
          <button type="button" className="btn btn-ghost" disabled={!certUrl} onClick={() => window.print()}>
            <Icon name="print" />
            طباعة
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate({ name: 'map' })}>
            <Icon name="map" />
            العودة للخريطة
          </button>
        </div>
      </section>
    </div>
  );
}
