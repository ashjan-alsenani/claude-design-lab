import { useMemo, useState } from 'react';
import { shuffle } from '../lib/random';
import { play } from '../lib/sound';
import { burst } from '../lib/confetti';
import { Feedback } from '../components/Feedback';

export interface Statement {
  id: string;
  text: string;
  answer: boolean;
  explain: string;
}

/** 🫧 Pop only the bubbles with TRUE statements. Find all the correct ones! */
export function BubblePop({ statements, onFinish }: { statements: Statement[]; onFinish: (score: number) => void }) {
  const bubbles = useMemo(() => {
    const t = shuffle(statements.filter((s) => s.answer)).slice(0, 5);
    const f = shuffle(statements.filter((s) => !s.answer)).slice(0, 5);
    return shuffle([...t, ...f]);
  }, [statements]);
  const target = bubbles.filter((b) => b.answer).length;
  const [popped, setPopped] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [note, setNote] = useState<{ tone: 'good' | 'oops'; text: string } | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const found = popped.length;

  function pop(b: Statement, x: number, y: number) {
    if (popped.includes(b.id)) return;
    if (b.answer) {
      play('correct');
      burst({ x, y });
      const n = [...popped, b.id];
      setPopped(n);
      setNote({ tone: 'good', text: b.explain });
      if (n.length === target) window.setTimeout(() => onFinish(Math.max(1, target * 2 - mistakes)), 900);
    } else {
      play('wrong');
      setMistakes((m) => m + 1);
      setShake(b.id);
      window.setTimeout(() => setShake(null), 450);
      setNote({ tone: 'oops', text: `هذه العبارة خاطئة. ${b.explain}` });
    }
  }

  return (
    <div className="bubbles-game">
      <p className="activity__hint">
        فرقع الفقاعات التي فيها عبارات <strong>صحيحة</strong> فقط 🫧 — وجدت {found}/{target}
      </p>
      <div className="bubbles">
        {bubbles.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className={`pop-bubble ${popped.includes(b.id) ? 'pop-bubble--popped' : ''} ${shake === b.id ? 'wiggle' : ''}`}
            style={{ animationDelay: `${(i % 5) * 0.5}s` }}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              pop(b, (r.left + r.width / 2) / window.innerWidth, (r.top + r.height / 2) / window.innerHeight);
            }}
            disabled={popped.includes(b.id)}
          >
            {popped.includes(b.id) ? '✨ صحيح!' : b.text}
          </button>
        ))}
      </div>
      {note && (
        <Feedback tone={note.tone} title={note.tone === 'good' ? 'فرقعة رائعة! 🫧' : 'انتبه! 🌟'}>
          {note.text}
        </Feedback>
      )}
    </div>
  );
}
