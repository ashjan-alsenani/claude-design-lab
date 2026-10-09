import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useRef, useState } from 'react';
import { sfx } from '../audio/sound';
import type { ActivityProps } from '../components/ActivityShell';
import { Gem } from '../components/art/Gem';
import { celebrate } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { SUNNAH_KINDS, TREASURE_CARDS, type SunnahKind, type TreasureCard } from '../data/lesson';
import { useDragDrop } from '../lib/drag';
import { shuffle } from '../lib/random';
import { encourage, praise, say } from '../state/guide';
import { reportAnswer } from '../state/play';
import './chests.css';

const KINDS: SunnahKind[] = ['qawliyya', 'filiyya', 'taqririyya'];
const CHEST_GEM = { qawliyya: 'rose', filiyya: 'teal', taqririyya: 'gold' } as const;

type Msg = { ok: boolean; card: TreasureCard; text: string } | null;

export function Chests({ onFinish }: ActivityProps) {
  const cards = useMemo(() => shuffle(TREASURE_CARDS), []);
  const [placed, setPlaced] = useState<Record<string, SunnahKind>>({});
  const [misses, setMisses] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [shaking, setShaking] = useState<string | null>(null);
  const [opened, setOpened] = useState<SunnahKind | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const openTimer = useRef<number>(0);
  const finished = Object.keys(placed).length === cards.length;

  const attempt = useCallback(
    (cardId: string, kind: SunnahKind | null) => {
      if (!kind) return;
      const card = TREASURE_CARDS.find((c) => c.id === cardId)!;
      setSelected(null);
      reportAnswer(card.kind === kind, 15);
      if (card.kind === kind) {
        sfx('open');
        window.setTimeout(() => sfx('gem'), 250);
        setPlaced((p) => ({ ...p, [cardId]: kind }));
        setOpened(kind);
        window.clearTimeout(openTimer.current);
        openTimer.current = window.setTimeout(() => setOpened(null), 1500);
        setMsg({ ok: true, card, text: card.why });
        const el = document.querySelector(`[data-drop="${kind}"]`)?.getBoundingClientRect();
        if (el) celebrate('sparkles', (el.left + el.width / 2) / window.innerWidth, (el.top + el.height * 0.3) / window.innerHeight, 0.9);
        praise();
      } else {
        sfx('wrong');
        setMisses((m) => ({ ...m, [cardId]: (m[cardId] ?? 0) + 1 }));
        setShaking(cardId);
        window.setTimeout(() => setShaking(null), 500);
        setMsg({ ok: false, card, text: `ليس صندوق «${SUNNAH_KINDS[kind].short}». تلميح: ${card.hint}` });
        encourage();
      }
    },
    [],
  );

  const { drag, bind, justDragged } = useDragDrop({
    onDrop: (id, target) => attempt(id, (target as SunnahKind) ?? null),
    onStart: () => sfx('pick'),
  });

  const finish = () => {
    const firstTry = cards.filter((c) => !misses[c.id]).length;
    onFinish({ score: firstTry * 15 + (cards.length - firstTry) * 6, correct: firstTry, total: cards.length });
  };

  const remaining = cards.filter((c) => !placed[c.id]);

  return (
    <div className="chests">
      <header className="stage-intro">
        <h2>صندوق الكنوز المفقودة</h2>
        <p>اسحبي كل بطاقة إلى صندوق قسمها من أقسام السنة النبوية — أو اضغطي البطاقة ثم اضغطي الصندوق.</p>
      </header>

      <div className="chest-cards" aria-label="البطاقات">
        <AnimatePresence>
          {remaining.map((c, i) => {
            const isDrag = drag.id === c.id;
            return (
              <motion.button
                key={c.id}
                type="button"
                layout
                className="tcard"
                data-selected={selected === c.id}
                data-dragging={isDrag}
                data-shake={shaking === c.id}
                aria-pressed={selected === c.id}
                aria-label={`بطاقة: ${c.text}`}
                initial={{ opacity: 0, y: -20, rotate: (i % 2 ? 1 : -1) * 3 }}
                animate={
                  isDrag
                    ? { opacity: 1, x: drag.dx, y: drag.dy, rotate: 0, scale: 1.05 }
                    : { opacity: 1, x: 0, y: 0, rotate: (i % 2 ? 1 : -1) * 1.5, scale: 1 }
                }
                exit={{ opacity: 0, scale: 0.4, y: 120, transition: { duration: 0.35, ease: [0.77, 0, 0.175, 1] } }}
                style={isDrag ? { zIndex: 50 } : undefined}
                transition={isDrag ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0.2 }}
                {...bind(c.id)}
                onClick={() => {
                  if (justDragged()) return;
                  sfx('tap');
                  setSelected((s) => (s === c.id ? null : c.id));
                  if (selected !== c.id) say('ممتاز، والآن اضغطي على الصندوق المناسب.', 'happy');
                }}
              >
                <span className="tcard-shine" aria-hidden />
                {c.text}
                {misses[c.id] ? <span className="tcard-tries">حاولي مرة أخرى</span> : null}
              </motion.button>
            );
          })}
        </AnimatePresence>
        {finished && (
          <motion.div className="chest-done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Icon name="sparkle" size={28} />
            <p>أعدتِ جميع الكنوز إلى صناديقها!</p>
            <button type="button" className="btn btn-gold btn-lg" onClick={finish} autoFocus>
              استلمي الجوهرة
              <Icon name="next" />
            </button>
          </motion.div>
        )}
      </div>

      <div className="chest-msg-slot" aria-live="polite">
        <AnimatePresence mode="wait">
          {msg && (
            <motion.div
              key={`${msg.card.id}-${msg.ok}-${misses[msg.card.id] ?? 0}`}
              className="chest-msg"
              data-ok={msg.ok}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <Icon name={msg.ok ? 'check' : 'hint'} />
              <span>
                <strong>{msg.ok ? `صحيح! «${msg.card.text}» ← ${SUNNAH_KINDS[msg.card.kind].name}.` : 'فكّري مرة أخرى.'}</strong> {msg.text}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="chest-row">
        {KINDS.map((k) => {
          const count = Object.values(placed).filter((v) => v === k).length;
          const total = TREASURE_CARDS.filter((c) => c.kind === k).length;
          return (
            <button
              key={k}
              type="button"
              className="chest-slot"
              data-drop={k}
              data-kind={k}
              data-over={drag.over === k}
              data-armed={!!selected}
              aria-label={`صندوق ${SUNNAH_KINDS[k].name} (${count} من ${total})`}
              onClick={() => (selected ? attempt(selected, k) : say('اختاري بطاقة أولًا، ثم اضغطي الصندوق.', 'think'))}
            >
              <Chest3D kind={k} open={opened === k} full={count === total} />
              <span className="chest-name">{SUNNAH_KINDS[k].name}</span>
              <span className="chest-count num">
                {Array.from({ length: total }, (_, i) => (
                  <Gem key={i} hue={CHEST_GEM[k]} size={16} dim={i >= count} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Chest3D({ kind, open, full }: { kind: SunnahKind; open: boolean; full: boolean }) {
  return (
    <span className="chest3d" data-kind={kind} data-open={open} data-full={full}>
      <span className="chest-beam" aria-hidden />
      <AnimatePresence>
        {open && (
          <motion.span
            className="chest-gem"
            initial={{ y: 30, scale: 0.4, opacity: 0 }}
            animate={{ y: -70, scale: 1.1, opacity: 1, rotate: 360 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          >
            <Gem hue={CHEST_GEM[kind]} size={54} />
          </motion.span>
        )}
      </AnimatePresence>
      <span className="chest-lid">
        <span className="chest-lid-top" />
        <span className="chest-lid-front" />
      </span>
      <span className="chest-body">
        <span className="chest-band l" />
        <span className="chest-band r" />
        <span className="chest-lock">
          <KindIcon kind={kind} />
        </span>
      </span>
    </span>
  );
}

function KindIcon({ kind }: { kind: SunnahKind }) {
  const d =
    kind === 'qawliyya'
      ? 'M4 5h16v10H9l-5 4V5Zm4 4h8M8 12h5' // speech
      : kind === 'filiyya'
        ? 'M8 20v-6l-2-3 3-6 3 3 3-3 3 6-2 3v6M10 20h4' // action figure
        : 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Zm-3 9 2 2 4-4'; // seal of approval
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
