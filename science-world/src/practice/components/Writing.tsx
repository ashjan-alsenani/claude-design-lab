/**
 * Guided writing (English). Teaches HOW to write: picture panels, guiding steps,
 * optional helpers, live word count and a checklist. There is no AI marking here,
 * so we only check what a program can check reliably and show a model answer on request.
 */
import { useMemo, useState } from 'react';
import { wordCount, type Answer } from '../check';
import type { WritingQ } from '../types';
import { Say } from '../../components/Say';

const LINKING = ['First', 'Then', 'Next', 'After that', 'Finally', 'because', 'but', 'and', 'so', 'also'];

/** Common Grade 6 misspellings → correct spelling. */
const MISSPELT: Record<string, string> = {
  becuse: 'because', becouse: 'because', beacuse: 'because', freind: 'friend', freinds: 'friends', realy: 'really', wich: 'which',
  thier: 'their', untill: 'until', wen: 'when', whith: 'with', wiht: 'with', beutiful: 'beautiful', beatiful: 'beautiful',
  exiting: 'exciting', intresting: 'interesting', favorit: 'favourite', favourit: 'favourite', alot: 'a lot', allways: 'always',
  tomorow: 'tomorrow', togather: 'together', sudenly: 'suddenly', finaly: 'finally', happend: 'happened', wanna: 'want to',
  becaus: 'because', diffrent: 'different', evry: 'every', everyday: 'every day', libary: 'library', footbal: 'football',
  vollyball: 'volleyball', volleybal: 'volleyball', karatee: 'karate', badmington: 'badminton', gymnastic: 'gymnastics',
  photografy: 'photography', vidio: 'video', computor: 'computer', camra: 'camera', tablit: 'tablet',
};

export interface WritingReport {
  words: number;
  checks: { id: string; label: string; ok: boolean | null; tip?: string }[];
  spelling: { wrong: string; right: string }[];
  repeated: string[];
}

export function analyseWriting(text: string, q: WritingQ): WritingReport {
  const words = wordCount(text);
  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const capitalStarts = sentences.length > 0 && sentences.every((s) => /^[^A-Za-z]*[A-Z]/.test(s));
  const lowerI = /(^|\s)i(\s|'|$)/.test(text);
  const fullStops = /[.!?]["')]*\s*$/.test(text.trim()) && sentences.length >= 2;
  const linking = LINKING.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(text));
  const tokens = text.toLowerCase().match(/[a-z']+/g) ?? [];
  const spelling = [...new Set(tokens)].filter((t) => MISSPELT[t]).map((t) => ({ wrong: t, right: MISSPELT[t] }));
  const counts = new Map<string, number>();
  for (const t of tokens) if (t.length > 3 && !['that', 'they', 'were', 'with', 'have', 'this', 'there', 'then'].includes(t)) counts.set(t, (counts.get(t) ?? 0) + 1);
  const repeated = [...counts].filter(([, n]) => n >= 4).map(([w]) => w);
  return {
    words,
    spelling,
    repeated,
    checks: [
      { id: 'words', label: `At least ${q.minWords} words`, ok: words >= q.minWords, tip: `You have ${words}. Add more details: who, where, what, how you felt.` },
      { id: 'caps', label: 'Capital letters', ok: capitalStarts && !lowerI, tip: lowerI ? 'Write "I" as a capital letter.' : 'Start every sentence with a capital letter.' },
      { id: 'stops', label: 'Full stops', ok: fullStops, tip: 'End every sentence with a full stop (.).' },
      { id: 'linking', label: 'Linking words', ok: linking, tip: 'Use First, Then, Next, After that, Finally.' },
      { id: 'parts', label: 'Beginning, middle and end', ok: sentences.length >= 4 ? true : null, tip: 'Write at least one sentence for the beginning, the middle and the end.' },
      { id: 'tense', label: 'Correct tense', ok: null, tip: 'A story about the past uses past verbs: went, saw, played.' },
      { id: 'spell', label: 'Checked spelling', ok: spelling.length === 0 ? null : false, tip: 'Read your work again slowly.' },
    ],
  };
}

export function WritingTask({ q, done, onSubmit }: { q: WritingQ; done: boolean; onSubmit: (a: Answer) => void }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const report = useMemo(() => analyseWriting(text, q), [text, q]);
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const pct = Math.min(100, Math.round((report.words / q.minWords) * 100));

  return (
    <div className="pq-write" lang="en">
      {q.pictures && (
        <ol className="pq-write__pics" dir="ltr">
          {q.pictures.map((p, i) => (
            <li key={i}>
              <span className="pq-write__pic" aria-hidden="true">{p.emoji}</span>
              {p.caption && <span className="pq-write__cap">{p.caption}</span>}
            </li>
          ))}
        </ol>
      )}
      {q.guide && (
        <div className="pq-write__guide card" dir="ltr">
          <strong>Plan your writing</strong>
          <ol>
            {q.guide.map((g, i) => (
              <li key={i}>
                <span className="pq-write__step">STEP {i + 1}</span> {g}
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="pq-write__helpers">
        <button type="button" className={`btn btn--ghost btn--sm ${open.starter ? 'is-on' : ''}`} onClick={() => toggle('starter')}>💡 Starting sentence</button>
        {q.words && <button type="button" className={`btn btn--ghost btn--sm ${open.words ? 'is-on' : ''}`} onClick={() => toggle('words')}>💡 Useful words</button>}
        <button type="button" className={`btn btn--ghost btn--sm ${open.linking ? 'is-on' : ''}`} onClick={() => toggle('linking')}>💡 Linking words</button>
        {q.frame && <button type="button" className={`btn btn--ghost btn--sm ${open.frame ? 'is-on' : ''}`} onClick={() => toggle('frame')}>💡 Help me organise</button>}
      </div>
      <div className="pq-write__help" dir="ltr">
        {open.starter && (
          <p>
            <em>{q.starter}</em> <button type="button" className="link" onClick={() => setText((t) => (t ? t : q.starter + ' '))}>use it</button>
          </p>
        )}
        {open.words && q.words && (
          <div className="pq-write__words">
            {q.words.map((w) => (
              <button key={w} type="button" className="pq-chip pq-chip--sm" onClick={() => setText((t) => (t && !t.endsWith(' ') ? t + ' ' : t) + w + ' ')}>
                {w}
              </button>
            ))}
          </div>
        )}
        {open.linking && <p>First, … Then, … Next, … After that, … Finally, …</p>}
        {open.frame && q.frame && (
          <ul>
            {q.frame.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        )}
      </div>
      <label className="pq-write__label" dir="ltr">
        ✍️ Write here
        <textarea
          className="pq-write__area"
          dir="ltr"
          rows={8}
          value={text}
          disabled={done}
          spellCheck
          onChange={(e) => setText(e.target.value)}
          placeholder={q.starter}
        />
      </label>
      <div className="pq-write__count" dir="ltr" aria-live="polite">
        <div className="pq-write__bar"><span style={{ width: `${pct}%` }} /></div>
        <strong>{report.words} / {q.minWords}</strong>
        {report.words >= q.minWords && <span className="pq-write__ok">✅ Great! You reached {q.minWords} words.</span>}
      </div>
      <ul className="pq-check" dir="ltr">
        {report.checks.map((c) => {
          const ok = c.ok ?? ticked[c.id] ?? false;
          return (
            <li key={c.id}>
              <button type="button" className={`pq-check__item ${ok ? 'is-ok' : ''}`} disabled={c.ok !== null || done} onClick={() => setTicked((t) => ({ ...t, [c.id]: !t[c.id] }))}>
                <span aria-hidden="true">{ok ? '☑' : '☐'}</span> {c.label}
              </button>
            </li>
          );
        })}
      </ul>
      {report.spelling.length > 0 && (
        <div className="pq-write__spell" dir="ltr">
          👀 Check these words:{' '}
          {report.spelling.map((s) => (
            <span key={s.wrong}>
              <s>{s.wrong}</s> → <strong>{s.right}</strong> <Say text={s.right} />{' '}
            </span>
          ))}
        </div>
      )}
      {!done && (
        <button type="button" className="btn btn--good btn--lg btn--block" disabled={report.words < 5} onClick={() => onSubmit({ type: 'writing', text })}>
          I finished ✔️
        </button>
      )}
    </div>
  );
}

/** Feedback after writing: what is good, what to improve, and the model answer on request. */
export function WritingFeedback({ q, text }: { q: WritingQ; text: string }) {
  const r = analyseWriting(text, q);
  const [model, setModel] = useState(false);
  const good = r.checks.filter((c) => c.ok);
  const todo = r.checks.filter((c) => c.ok === false);
  return (
    <div className="pq-write-fb" dir="ltr" lang="en">
      <p className="pq-write-fb__title">{r.words >= q.minWords ? '🌟 Great work! You wrote ' + r.words + ' words.' : `👏 Good start! You wrote ${r.words} of ${q.minWords} words.`}</p>
      {good.length > 0 && <p>✅ {good.map((c) => c.label).join(' · ')}</p>}
      {todo.length > 0 && (
        <div>
          <strong>Let's improve:</strong>
          <ul>
            {todo.map((c) => (
              <li key={c.id}>{c.tip}</li>
            ))}
            {r.spelling.map((s) => (
              <li key={s.wrong}>
                "{s.wrong}" → "{s.right}"
              </li>
            ))}
            {r.repeated.map((w) => (
              <li key={w}>You used "{w}" many times. Try a different word sometimes.</li>
            ))}
          </ul>
        </div>
      )}
      <p className="pq-write-fb__note">🔍 Read your writing again: check the tense and the spelling yourself.</p>
      {!model ? (
        <button type="button" className="btn btn--ghost" onClick={() => setModel(true)}>
          👀 Show me an example
        </button>
      ) : (
        <div className="pq-write-fb__model card">
          <strong>Example answer</strong> <Say text={q.model} />
          <p>{q.model}</p>
        </div>
      )}
    </div>
  );
}
