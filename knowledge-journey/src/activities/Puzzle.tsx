import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { sfx } from '../audio/sound';
import type { ActivityProps } from '../components/ActivityShell';
import { celebrate } from '../components/Confetti';
import { Icon } from '../components/Icon';
import { PUZZLE_PIECES, PUZZLE_SLOTS, type PuzzleSlot } from '../data/lesson';
import { useDragDrop } from '../lib/drag';
import { checkBoard, puzzleScore, type Board } from '../lib/puzzle';
import { shuffle } from '../lib/random';
import { encourage, praise, say } from '../state/guide';
import './puzzle.css';

const piece = (id: string) => PUZZLE_PIECES.find((p) => p.id === id)!;

export function Puzzle({ onFinish }: ActivityProps) {
  const order = useMemo(() => shuffle(PUZZLE_PIECES.map((p) => p.id)), []);
  const [board, setBoard] = useState<Board>({});
  const [locked, setLocked] = useState<string[]>([]); // slot ids verified correct
  const [selected, setSelected] = useState<string | null>(null);
  const [bounced, setBounced] = useState<string[]>([]);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [misplaced, setMisplaced] = useState<string[]>([]); // piece ids ever wrong
  const [msg, setMsg] = useState('');
  const complete = locked.length === PUZZLE_SLOTS.length;

  const onBoard = new Set(Object.values(board).filter(Boolean) as string[]);
  const tray = order.filter((id) => !onBoard.has(id));

  const place = (pieceId: string, slotId: string | null) => {
    setSelected(null);
    if (!slotId) return;
    if (slotId === 'tray') {
      setBoard((b) => Object.fromEntries(Object.entries(b).filter(([, p]) => p !== pieceId)));
      return;
    }
    if (locked.includes(slotId)) return;
    sfx('drop');
    setBoard((b) => {
      const next: Board = {};
      for (const [s, p] of Object.entries(b)) if (p !== pieceId) next[s] = p;
      next[slotId] = pieceId; // whatever was in the slot goes back to the tray
      return next;
    });
  };

  const { drag, bind, justDragged } = useDragDrop({ onDrop: place, onStart: () => sfx('pick') });

  const check = () => {
    const { right, wrong } = checkBoard(board, PUZZLE_SLOTS);
    const nowLocked = Array.from(new Set([...locked, ...right]));
    setLocked(nowLocked);
    if (wrong.length) {
      sfx('wrong');
      setMistakes((m) => m + wrong.length);
      const wrongPieces = wrong.map((s) => board[s]!) ;
      setMisplaced((x) => Array.from(new Set([...x, ...wrongPieces])));
      setBounced(wrong);
      window.setTimeout(() => {
        setBounced([]);
        setBoard((b) => Object.fromEntries(Object.entries(b).filter(([s]) => !wrong.includes(s))));
      }, 650);
      setMsg(`${right.length ? `${right.length} قطعة في مكانها الصحيح. ` : ''}${wrong.length} قطعة عادت إلى الصندوق — تذكّري: كل تعريف يقع تحت اسم قسمه مباشرة.`);
      encourage();
    } else if (nowLocked.length === PUZZLE_SLOTS.length) {
      sfx('fanfare');
      celebrate('confetti', 0.5, 0.4);
      setMsg('اكتملت خريطة المفاهيم وأضاءت!');
      praise();
    } else if (right.length) {
      sfx('correct');
      setMsg('كل القطع الموضوعة صحيحة! أكملي البقية.');
    } else {
      setMsg('ضعي بعض القطع أولًا، ثم اضغطي «تحقّقي».');
    }
  };

  const hint = () => {
    const slot = PUZZLE_SLOTS.find((s) => !locked.includes(s.id) && board[s.id] !== s.piece);
    if (!slot) return;
    sfx('unlock');
    setHints((h) => h + 1);
    setBoard((b) => {
      const next: Board = {};
      for (const [s, p] of Object.entries(b)) if (p !== slot.piece && s !== slot.id) next[s] = p;
      next[slot.id] = slot.piece;
      return next;
    });
    setLocked((l) => [...l, slot.id]);
    say(`تلميح: «${piece(slot.piece).text.slice(0, 40)}${piece(slot.piece).text.length > 40 ? '…' : ''}» وُضعت في مكانها.`, 'happy');
  };

  const reset = () => {
    sfx('whoosh');
    setBoard({});
    setLocked([]);
    setMsg('');
  };

  const finish = () => {
    const clean = PUZZLE_PIECES.filter((p) => !misplaced.includes(p.id)).length;
    onFinish({ score: puzzleScore(hints, mistakes), correct: clean, total: PUZZLE_PIECES.length, feats: hints === 0 ? ['architect'] : [] });
  };

  const tapSlot = (s: PuzzleSlot) => {
    if (locked.includes(s.id)) return;
    if (selected) place(selected, s.id);
    else if (board[s.id]) {
      sfx('tap');
      place(board[s.id]!, 'tray');
    } else say('اختاري قطعة من الصندوق أولًا.', 'think');
  };

  const slot = (id: string) => PUZZLE_SLOTS.find((s) => s.id === id)!;
  const cols = ['qawliyya', 'filiyya', 'taqririyya'] as const;

  const renderSlot = (s: PuzzleSlot) => {
    const pid = board[s.id];
    const isLocked = locked.includes(s.id);
    return (
      <button
        key={s.id}
        type="button"
        className="pz-slot"
        data-kind={s.kind}
        data-drop={s.id}
        data-filled={!!pid}
        data-locked={isLocked}
        data-over={drag.over === s.id}
        data-bounce={bounced.includes(s.id)}
        data-armed={!!selected && !isLocked}
        aria-label={pid ? `خانة فيها: ${piece(pid).text}${isLocked ? ' (مثبّتة)' : ''}` : 'خانة فارغة'}
        onClick={() => tapSlot(s)}
      >
        {pid ? (
          <motion.span layoutId={pid} className="pz-piece in-slot" data-kind={piece(pid).kind} transition={{ type: 'spring', duration: 0.45, bounce: 0.2 }}>
            {piece(pid).text}
            {isLocked && <Icon name="check" size={16} className="pz-lock" />}
          </motion.span>
        ) : (
          <span className="pz-empty">{s.kind === 'root' ? 'المفهوم الرئيس' : s.kind === 'branch' ? 'القسم' : 'التعريف'}</span>
        )}
      </button>
    );
  };

  return (
    <div className="puzzle">
      <header className="stage-intro">
        <h2>أحجية المعرفة</h2>
        <p>أعيدي بناء خريطة مفاهيم السنة النبوية: اسحبي كل قطعة إلى خانتها، ثم اضغطي «تحقّقي».</p>
      </header>

      <div className="pz-board" data-complete={complete}>
        <svg className="pz-lines" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden>
          {[250, 150, 50].map((x, i) => (
            <g key={x} data-on={locked.includes(['s-q', 's-f', 's-t'][i])}>
              <path d={`M150 14 C150 26 ${x} 22 ${x} 34`} vectorEffect="non-scaling-stroke" />
              <path d={`M${x} 52 L${x} 64`} vectorEffect="non-scaling-stroke" />
            </g>
          ))}
        </svg>
        <div className="pz-row root">{renderSlot(slot('s-root'))}</div>
        <div className="pz-row">{cols.map((c) => renderSlot(PUZZLE_SLOTS.find((s) => s.kind === 'branch' && s.column === c)!))}</div>
        <div className="pz-row defs">{cols.map((c) => renderSlot(PUZZLE_SLOTS.find((s) => s.kind === 'definition' && s.column === c)!))}</div>
        <AnimatePresence>
          {complete && <motion.div className="pz-glow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} aria-hidden />}
        </AnimatePresence>
      </div>

      <div className="pz-msg" aria-live="polite">
        {msg}
      </div>

      {!complete && (
        <div className="pz-tray" data-drop="tray" aria-label="صندوق القطع">
          {tray.length === 0 && <span className="pz-tray-empty">كل القطع على اللوحة — اضغطي «تحقّقي».</span>}
          {tray.map((id) => {
            const p = piece(id);
            const isDrag = drag.id === id;
            return (
              <motion.button
                key={id}
                layoutId={id}
                type="button"
                className="pz-piece"
                data-kind={p.kind}
                data-selected={selected === id}
                aria-pressed={selected === id}
                animate={isDrag ? { x: drag.dx, y: drag.dy, scale: 1.05, zIndex: 50 } : { x: 0, y: 0, scale: 1, zIndex: 1 }}
                transition={isDrag ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.2 }}
                {...bind(id)}
                onClick={() => {
                  if (justDragged()) return;
                  sfx('tap');
                  setSelected((s) => (s === id ? null : id));
                }}
              >
                {p.text}
              </motion.button>
            );
          })}
        </div>
      )}

      <div className="row-center pz-actions">
        {!complete ? (
          <>
            <button type="button" className="btn btn-gold btn-lg" onClick={check} disabled={onBoard.size === locked.length}>
              <Icon name="check" />
              تحقّقي
            </button>
            <button type="button" className="btn btn-ghost" onClick={hint}>
              <Icon name="hint" />
              تلميح
            </button>
            <button type="button" className="btn btn-ghost" onClick={reset}>
              <Icon name="restart" />
              إعادة المحاولة
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-gold btn-lg" onClick={finish} autoFocus>
            استلمي المكافأة
            <Icon name="next" />
          </button>
        )}
      </div>
      <p className="pz-meta num">
        التلميحات: {hints} · الأخطاء: {mistakes}
      </p>
    </div>
  );
}
