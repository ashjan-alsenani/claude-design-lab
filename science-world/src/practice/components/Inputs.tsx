/**
 * One reusable input per question type. All are tap-based (no fiddly dragging),
 * so they work with a finger on a phone or tablet. When `result` is set the input
 * is locked and shows what was right (green) and wrong (red).
 */
import { useMemo, useState } from 'react';
import { NumberPad } from '../../activities/NumberPad';
import { mixed } from '../../lib/bidi';
import { shuffle, shuffleNotSorted } from '../../lib/random';
import { play } from '../../lib/sound';
import type { Answer, CheckResult } from '../check';
import type { ChoiceQ, MatchQ, MultiQ, NumberQ, OrderQ, PChoice, RemainderQ, SortQ, TextQ, TrueFalseQ } from '../types';
import { VisualView } from '../../illustrations/registry';

interface InputProps<Q> {
  q: Q;
  en: boolean;
  result: CheckResult | null;
  answer: Answer | null;
  onSubmit: (a: Answer) => void;
}

const CHECK = (en: boolean) => (en ? 'Check ✔️' : 'تحقّقي ✔️');

function ChoiceTile({ c, state, onClick, disabled, big }: { c: PChoice; state: string; onClick: () => void; disabled: boolean; big: boolean }) {
  return (
    <button type="button" className={`choice pq-choice ${big ? 'pq-choice--pic' : ''} choice--${state}`} onClick={onClick} disabled={disabled} aria-pressed={state === 'picked'}>
      {c.visual ? <VisualView visual={c.visual} className="pq-choice__visual" /> : c.emoji && <span className="choice__emoji" aria-hidden="true">{c.emoji}</span>}
      {c.text && <span className="choice__text">{mixed(c.text)}</span>}
      {state === 'right' && <span className="choice__mark" aria-label="الإجابة الصحيحة">✓</span>}
      {state === 'wrong' && <span className="choice__mark choice__mark--x" aria-label="إجابتكِ">✗</span>}
    </button>
  );
}

export function ChoiceInput({ q, result, answer, onSubmit }: InputProps<ChoiceQ>) {
  const opts = useMemo(() => (q.keepOrder ? q.options : shuffle(q.options)), [q]);
  const picked = answer?.type === 'choice' ? answer.id : null;
  const pictures = opts.every((o) => (o.emoji || o.visual) && o.text.length <= 18);
  const stateOf = (id: string) => (!result ? '' : id === q.answer ? 'right' : id === picked ? 'wrong' : 'dim');
  return (
    <div className={`choices pq-choices ${pictures ? 'pq-choices--pics' : opts.length > 4 ? 'choices--many' : 'choices--grid'}`} role="group">
      {opts.map((c) => (
        <ChoiceTile
          key={c.id}
          c={c}
          big={pictures}
          state={stateOf(c.id)}
          disabled={Boolean(result)}
          onClick={() => {
            play('tap');
            onSubmit({ type: 'choice', id: c.id });
          }}
        />
      ))}
    </div>
  );
}

export function TrueFalseInput({ q, en, result, answer, onSubmit }: InputProps<TrueFalseQ>) {
  const picked = answer?.type === 'tf' ? answer.value : null;
  const opts = [
    { v: true, text: en ? 'True' : 'صحيح', emoji: '✅' },
    { v: false, text: en ? 'False' : 'خطأ', emoji: '❌' },
  ];
  return (
    <div className="choices choices--tf" role="group">
      {opts.map((o) => {
        const state = !result ? '' : o.v === q.answer ? 'right' : o.v === picked ? 'wrong' : 'dim';
        return (
          <button key={String(o.v)} type="button" className={`choice choice--${state}`} disabled={Boolean(result)} onClick={() => (play('tap'), onSubmit({ type: 'tf', value: o.v }))}>
            <span className="choice__emoji" aria-hidden="true">{o.emoji}</span>
            <span className="choice__text">{o.text}</span>
          </button>
        );
      })}
    </div>
  );
}

export function MultiInput({ q, en, result, onSubmit }: InputProps<MultiQ>) {
  const opts = useMemo(() => shuffle(q.options), [q]);
  const [sel, setSel] = useState<string[]>([]);
  const stateOf = (id: string) => {
    if (!result) return sel.includes(id) ? 'picked' : '';
    if (q.answers.includes(id)) return 'right';
    return sel.includes(id) ? 'wrong' : 'dim';
  };
  return (
    <>
      <p className="qcard__hint-line">{en ? 'Choose ALL the correct answers, then press Check.' : 'اختاري كل الإجابات الصحيحة ثم اضغطي «تحقّقي»'}</p>
      <div className={`choices ${opts.length > 4 ? 'choices--many' : 'choices--grid'}`} role="group">
        {opts.map((c) => (
          <ChoiceTile key={c.id} c={c} big={false} state={stateOf(c.id)} disabled={Boolean(result)} onClick={() => (play('tap'), setSel((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id])))} />
        ))}
      </div>
      {!result && (
        <button type="button" className="btn btn--accent btn--block" disabled={!sel.length} onClick={() => onSubmit({ type: 'multi', ids: sel })}>
          {CHECK(en)}
        </button>
      )}
    </>
  );
}

export function NumberInput({ q, result, onSubmit }: InputProps<NumberQ>) {
  const [v, setV] = useState('');
  return <NumberPad value={v} onChange={setV} onSubmit={() => v && onSubmit({ type: 'number', value: v })} disabled={Boolean(result)} unit={q.unit} />;
}

export function RemainderInput({ result, onSubmit }: InputProps<RemainderQ>) {
  const [qv, setQ] = useState('');
  const [rv, setR] = useState('');
  const clean = (s: string) => s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[^0-9]/g, '');
  return (
    <div className="pq-rem">
      <label className="pq-rem__box">
        <span>الناتج</span>
        <input inputMode="numeric" value={qv} disabled={Boolean(result)} onChange={(e) => setQ(clean(e.target.value))} placeholder="؟" />
      </label>
      <label className="pq-rem__box">
        <span>الباقي</span>
        <input inputMode="numeric" value={rv} disabled={Boolean(result)} onChange={(e) => setR(clean(e.target.value))} placeholder="؟" />
      </label>
      {!result && (
        <button type="button" className="btn btn--accent btn--block" disabled={!qv} onClick={() => onSubmit({ type: 'remainder', quotient: qv, remainder: rv || '0' })}>
          تحقّقي ✔️
        </button>
      )}
    </div>
  );
}

export function TextInput({ q, en, result, onSubmit }: InputProps<TextQ>) {
  const [v, setV] = useState('');
  const tiles = useMemo(() => (q.scrambled ? [...q.scrambled.replace(/\s/g, '')] : []), [q]);
  const [used, setUsed] = useState<number[]>([]);
  return (
    <div className="pq-text">
      {q.pattern && (
        <div className="pq-pattern" dir="ltr" aria-label="الحروف الناقصة">
          {q.pattern.split(/\s+/).map((ch, i) => (
            <span key={i} className={ch === '_' ? 'pq-pattern__gap' : ''}>
              {ch === '_' ? '' : ch}
            </span>
          ))}
        </div>
      )}
      {tiles.length > 0 && !result && (
        <div className="pq-tiles" dir="ltr">
          {tiles.map((t, i) => (
            <button
              key={i}
              type="button"
              className="pq-tile"
              disabled={used.includes(i)}
              onClick={() => {
                play('tap');
                setUsed((u) => [...u, i]);
                setV((s) => s + t);
              }}
            >
              {t}
            </button>
          ))}
          <button type="button" className="pq-tile pq-tile--del" onClick={() => (setUsed((u) => u.slice(0, -1)), setV((s) => s.slice(0, -1)))} aria-label="امسحي">
            ⌫
          </button>
        </div>
      )}
      <input
        className="pq-text__input"
        dir={en ? 'ltr' : 'auto'}
        lang={en ? 'en' : 'ar'}
        value={v}
        disabled={Boolean(result)}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder={en ? 'Type here…' : 'اكتبي هنا…'}
        onChange={(e) => {
          setV(e.target.value);
          setUsed([]);
        }}
        onKeyDown={(e) => e.key === 'Enter' && v.trim() && onSubmit({ type: 'text', value: v })}
      />
      {!result && (
        <button type="button" className="btn btn--accent btn--block" disabled={!v.trim()} onClick={() => onSubmit({ type: 'text', value: v })}>
          {CHECK(en)}
        </button>
      )}
    </div>
  );
}

/** Tap the items in the right order; tap a placed item to send it back. */
export function OrderInput({ q, en, result, onSubmit }: InputProps<OrderQ>) {
  const pool = useMemo(() => shuffleNotSorted(q.items), [q]);
  const [placed, setPlaced] = useState<string[]>([]);
  const item = (id: string) => q.items.find((i) => i.id === id)!;
  const shown = result ? (result.ok ? placed : placed) : placed;
  return (
    <div className="pq-order">
      <p className="qcard__hint-line">{en ? 'Tap the cards in the right order.' : 'اضغطي على البطاقات بالترتيب الصحيح.'}</p>
      <ol className="pq-order__line" aria-label="ترتيبكِ">
        {shown.map((id, i) => (
          <li key={id}>
            <button
              type="button"
              className={`pq-chip ${result ? (result.marks?.[q.items[i]?.id] && q.items[i].id === id ? 'pq-chip--right' : 'pq-chip--wrong') : 'pq-chip--placed'}`}
              disabled={Boolean(result)}
              onClick={() => setPlaced((p) => p.filter((x) => x !== id))}
            >
              <span className="pq-chip__n">{i + 1}</span>
              {item(id).emoji} {mixed(item(id).text)}
            </button>
          </li>
        ))}
        {!result && placed.length < q.items.length && <li className="pq-order__slot">{placed.length + 1}</li>}
      </ol>
      {!result && (
        <div className="pq-order__pool">
          {pool
            .filter((i) => !placed.includes(i.id))
            .map((i) => (
              <button key={i.id} type="button" className="pq-chip" onClick={() => (play('tap'), setPlaced((p) => [...p, i.id]))}>
                {i.emoji} {mixed(i.text)}
              </button>
            ))}
        </div>
      )}
      {!result && (
        <button type="button" className="btn btn--accent btn--block" disabled={placed.length < q.items.length} onClick={() => onSubmit({ type: 'order', ids: placed })}>
          {CHECK(en)}
        </button>
      )}
    </div>
  );
}

/** Tap a card on the right side, then its partner on the left side. */
export function MatchInput({ q, en, result, onSubmit }: InputProps<MatchQ>) {
  const rights = useMemo(() => shuffle(q.pairs.map((p) => ({ id: p.id, text: p.right }))), [q]);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [left, setLeft] = useState<string | null>(null);
  const usedRight = new Set(Object.values(pairs));
  const colorOf = (leftId: string) => Object.keys(pairs).indexOf(leftId);
  return (
    <div className="pq-match">
      <p className="qcard__hint-line">{en ? 'Tap a card, then tap its partner.' : 'اضغطي على بطاقة، ثم على البطاقة التي تناسبها.'}</p>
      <div className="pq-match__cols">
        <div className="pq-match__col">
          {q.pairs.map((p) => {
            const c = pairs[p.id] ? colorOf(p.id) : -1;
            const mark = result ? (result.marks?.[p.id] ? 'pq-chip--right' : 'pq-chip--wrong') : '';
            return (
              <button
                key={p.id}
                type="button"
                className={`pq-chip pq-match__item ${left === p.id ? 'pq-chip--on' : ''} ${c >= 0 ? `pq-pair-${c % 6}` : ''} ${mark}`}
                disabled={Boolean(result)}
                onClick={() => {
                  play('tap');
                  if (pairs[p.id]) {
                    const n = { ...pairs };
                    delete n[p.id];
                    setPairs(n);
                  }
                  setLeft(p.id);
                }}
              >
                {p.leftEmoji} {mixed(p.left)}
              </button>
            );
          })}
        </div>
        <div className="pq-match__col">
          {rights.map((r) => {
            const owner = Object.keys(pairs).find((k) => pairs[k] === r.id);
            const c = owner ? colorOf(owner) : -1;
            return (
              <button
                key={r.id}
                type="button"
                className={`pq-chip pq-match__item ${c >= 0 ? `pq-pair-${c % 6}` : ''}`}
                disabled={Boolean(result) || (!left && !owner)}
                onClick={() => {
                  if (!left) return;
                  play('tap');
                  const n = { ...pairs };
                  if (owner) delete n[owner];
                  n[left] = r.id;
                  setPairs(n);
                  setLeft(null);
                }}
              >
                {mixed(r.text)}
              </button>
            );
          })}
        </div>
      </div>
      {!result && (
        <button type="button" className="btn btn--accent btn--block" disabled={usedRight.size < q.pairs.length} onClick={() => onSubmit({ type: 'match', pairs })}>
          {CHECK(en)}
        </button>
      )}
    </div>
  );
}

/** Tap an item, then the group it belongs to. */
export function SortInput({ q, en, result, onSubmit }: InputProps<SortQ>) {
  const items = useMemo(() => shuffle(q.items), [q]);
  const [where, setWhere] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string | null>(items[0]?.id ?? null);
  const nextFree = (w: Record<string, string>) => items.find((i) => !w[i.id])?.id ?? null;
  return (
    <div className="pq-sort">
      <p className="qcard__hint-line">{en ? 'Tap a card, then tap its group.' : 'اضغطي على البطاقة، ثم على المجموعة المناسبة.'}</p>
      <div className="pq-sort__pool">
        {items
          .filter((i) => !where[i.id])
          .map((i) => (
            <button key={i.id} type="button" className={`pq-chip ${sel === i.id ? 'pq-chip--on' : ''}`} disabled={Boolean(result)} onClick={() => (play('tap'), setSel(i.id))}>
              {i.emoji} {mixed(i.text)}
            </button>
          ))}
      </div>
      <div className="pq-sort__buckets" style={{ gridTemplateColumns: `repeat(${Math.min(q.buckets.length, 3)}, minmax(0, 1fr))` }}>
        {q.buckets.map((b) => (
          <div key={b.id} className={`pq-bucket ${sel && !result ? 'pq-bucket--ready' : ''}`}>
            <button
              type="button"
              className="pq-bucket__head"
              disabled={!sel || Boolean(result)}
              onClick={() => {
                if (!sel) return;
                play('drop');
                const w = { ...where, [sel]: b.id };
                setWhere(w);
                setSel(nextFree(w));
              }}
            >
              {b.emoji} {mixed(b.label)}
            </button>
            <div className="pq-bucket__items">
              {items
                .filter((i) => where[i.id] === b.id)
                .map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    className={`pq-chip pq-chip--sm ${result ? (result.marks?.[i.id] ? 'pq-chip--right' : 'pq-chip--wrong') : 'pq-chip--placed'}`}
                    disabled={Boolean(result)}
                    onClick={() => {
                      const w = { ...where };
                      delete w[i.id];
                      setWhere(w);
                      setSel(i.id);
                    }}
                  >
                    {i.emoji} {mixed(i.text)}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
      {!result && (
        <button type="button" className="btn btn--accent btn--block" disabled={Object.keys(where).length < items.length} onClick={() => onSubmit({ type: 'sort', buckets: where })}>
          {CHECK(en)}
        </button>
      )}
    </div>
  );
}
