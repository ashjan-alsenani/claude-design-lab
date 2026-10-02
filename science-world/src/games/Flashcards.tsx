import { useMemo, useState } from 'react';
import type { GlossaryEntry } from '../data/glossary';
import { shuffle } from '../lib/random';
import { play } from '../lib/sound';

/** 🔄 Flashcards from the book's glossary: think, flip, then say if you knew it. */
export function Flashcards({ entries }: { entries: GlossaryEntry[] }) {
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => shuffle(entries), [entries, seed]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knew, setKnew] = useState(0);
  const [again, setAgain] = useState<GlossaryEntry[]>([]);
  const done = i >= deck.length;
  const card = deck[i];

  function answer(k: boolean) {
    play(k ? 'correct' : 'flip');
    if (k) setKnew((v) => v + 1);
    else setAgain((a) => [...a, card]);
    setFlipped(false);
    setI((v) => v + 1);
  }

  if (deck.length === 0) return <p className="activity__hint">لا توجد بطاقات بعد.</p>;

  if (done)
    return (
      <div className="card flash-done">
        <h3>🎉 أنهيت المجموعة!</h3>
        <p>
          عرفت {knew} من {deck.length} بطاقة.
        </p>
        {again.length > 0 && (
          <p className="activity__hint">
            راجع هذه الكلمات: {again.map((a) => a.term).join('، ')}
          </p>
        )}
        <button
          type="button"
          className="btn btn--sun"
          onClick={() => {
            setSeed((s) => s + 1);
            setI(0);
            setKnew(0);
            setAgain([]);
          }}
        >
          🔁 العب مرة أخرى
        </button>
      </div>
    );

  return (
    <div className="flash">
      <div className="flash__count">
        بطاقة {i + 1} من {deck.length}
      </div>
      <button
        type="button"
        className={`flip flip--big ${flipped ? 'flip--on' : ''}`}
        onClick={() => {
          play('flip');
          setFlipped((f) => !f);
        }}
        aria-label={flipped ? card.definition : `ما معنى ${card.term}؟ اضغط لتقلب`}
      >
        <span className="flip__inner">
          <span className="flip__face flip__front">
            <span className="flip__word">{card.term}</span>
            <span className="flip__tap">ما معناها؟ فكّر ثم اقلب 🔄</span>
          </span>
          <span className="flip__face flip__back">
            {card.definition}
            <small className="flash__page">صفحة {card.page} في الكتاب</small>
          </span>
        </span>
      </button>
      {flipped && (
        <div className="flash__actions">
          <button type="button" className="btn btn--good" onClick={() => answer(true)}>
            عرفتها! ✅
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => answer(false)}>
            أحتاج مراجعة 🔁
          </button>
        </div>
      )}
    </div>
  );
}
