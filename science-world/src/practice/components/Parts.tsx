/** Building blocks shown inside practice questions: passages, audio, charts, tables, written sums, scratchpad. */
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { toArabicDigits } from '../../lib/digits';
import { canSpeak, speak, stopSpeaking } from '../../lib/speech';
import { mixed } from '../../lib/bidi';
import type { PChart, PColumn, Passage, PTable } from '../types';

/** Wraps the evidence words in <mark>. Case-insensitive, first occurrence. */
export function highlight(text: string, evidence?: string): ReactNode {
  if (!evidence) return text;
  const i = text.toLowerCase().indexOf(evidence.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="evidence">{text.slice(i, i + evidence.length)}</mark>
      {text.slice(i + evidence.length)}
    </>
  );
}

/* ---------------- Listening ---------------- */
export function AudioPlayer({ text, autoPlay = true }: { text: string; autoPlay?: boolean }) {
  const [on, setOn] = useState(false);
  const [plays, setPlays] = useState(0);
  const run = (slow: boolean) => {
    setOn(true);
    setPlays((p) => p + 1);
    speak(text, { slow, onEnd: () => setOn(false) });
  };
  useEffect(() => {
    if (!autoPlay || !canSpeak()) return;
    const t = window.setTimeout(() => run(false), 400);
    return () => {
      window.clearTimeout(t);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  if (!canSpeak()) return <p className="pq-audio__fallback" dir="ltr" lang="en">{text}</p>;
  return (
    <div className="pq-audio">
      <button type="button" className={`pq-audio__play ${on ? 'is-on' : ''}`} onClick={() => run(false)} aria-label="استمعي">
        <span aria-hidden="true">{on ? '🔊' : '▶️'}</span> استمعي
      </button>
      <button type="button" className="pq-audio__slow" onClick={() => run(true)} aria-label="استمعي ببطء">
        🐢
      </button>
      {plays > 0 && <span className="pq-audio__count">استمعتِ {plays}×</span>}
    </div>
  );
}

/* ---------------- Reading passage ---------------- */
export function PassageView({ passage, evidence }: { passage: Passage; evidence?: string }) {
  const [word, setWord] = useState<{ word: string; meaning: string; ar?: string } | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  // show the evidence: scroll the passage (not the page) to the highlighted words
  useEffect(() => {
    const box = textRef.current;
    const mark = box?.querySelector('mark');
    if (box && mark) box.scrollTo({ top: Math.max(0, (mark as HTMLElement).offsetTop - box.offsetTop - 40), behavior: 'smooth' });
  }, [evidence]);
  const [ar, setAr] = useState(false);
  // tappable glossary words: split the text around them
  const words = passage.glossary ?? [];
  const parts: ReactNode[] = [];
  if (evidence) parts.push(highlight(passage.text, evidence));
  else if (words.length) {
    const re = new RegExp(`\\b(${words.map((w) => w.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    let last = 0;
    for (const m of passage.text.matchAll(re)) {
      const i = m.index ?? 0;
      parts.push(passage.text.slice(last, i));
      const g = words.find((w) => w.word.toLowerCase() === m[0].toLowerCase())!;
      parts.push(
        <button key={i} type="button" className="pq-gloss" onClick={() => (setWord(g), setAr(false))}>
          {m[0]}
        </button>,
      );
      last = i + m[0].length;
    }
    parts.push(passage.text.slice(last));
  } else parts.push(passage.text);
  return (
    <article className="pq-passage" lang="en">
      <header className="pq-passage__head">
        <h4 dir="ltr">{passage.title}</h4>
        {canSpeak() && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => speak(passage.text)}>
            🔊 اسمعي النص
          </button>
        )}
      </header>
      <div className="pq-passage__text" dir="ltr" ref={textRef}>
        {passage.text.split('\n').length > 1 && !evidence && !words.length
          ? passage.text.split('\n').map((p, i) => <p key={i}>{p}</p>)
          : parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}
      </div>
      {words.length > 0 && !evidence && <p className="pq-passage__hint">👆 اضغطي على الكلمات الملوّنة لتعرفي معناها</p>}
      {word && (
        <div className="pq-gloss-card" role="status">
          <strong dir="ltr">{word.word}</strong> <span dir="ltr">= {word.meaning}</span>
          {word.ar && (ar ? <span className="pq-gloss-card__ar">{word.ar}</span> : <button type="button" className="link" onClick={() => setAr(true)}>بالعربي؟</button>)}
          <button type="button" className="pq-gloss-card__x" aria-label="إغلاق" onClick={() => setWord(null)}>
            ✕
          </button>
        </div>
      )}
    </article>
  );
}

/* ---------------- Tables & charts ---------------- */
export function DataTable({ table, arabic }: { table: PTable; arabic: boolean }) {
  const cell = (v: string | number) => (arabic && typeof v === 'number' ? toArabicDigits(v) : mixed(String(v)));
  return (
    <div className="pq-table-wrap">
      <table className="pq-table">
        {table.caption && <caption>{mixed(table.caption)}</caption>}
        <thead>
          <tr>
            {table.columns.map((c, i) => (
              <th key={i}>{mixed(c)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j}>{cell(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Chart({ chart, arabic }: { chart: PChart; arabic: boolean }) {
  const W = 340;
  const H = 210;
  const pad = { l: 40, r: 12, t: 16, b: 46 };
  const max = Math.max(...chart.points.map((p) => p.value));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step || 1;
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const n = chart.points.length;
  const x = (i: number) => pad.l + (iw / n) * (i + 0.5);
  const y = (v: number) => pad.t + ih - (v / top) * ih;
  const num = (v: number) => (arabic ? toArabicDigits(v) : String(v));
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  return (
    <figure className="pq-chart">
      {chart.title && <figcaption>{mixed(chart.title)}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={chart.title ?? 'رسم بياني'} direction="ltr">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="pq-chart__grid" />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" className="pq-chart__tick">
              {num(t)}
            </text>
          </g>
        ))}
        {chart.type === 'bar'
          ? chart.points.map((p, i) => {
              const bw = Math.min(42, (iw / n) * 0.6);
              return (
                <g key={i}>
                  <rect x={x(i) - bw / 2} y={y(p.value)} width={bw} height={pad.t + ih - y(p.value)} rx="5" className="pq-chart__bar" style={{ animationDelay: `${i * 70}ms` }} />
                  <text x={x(i)} y={y(p.value) - 5} textAnchor="middle" className="pq-chart__val">
                    {num(p.value)}
                  </text>
                </g>
              );
            })
          : (
            <>
              <polyline points={chart.points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')} className="pq-chart__line" />
              {chart.points.map((p, i) => (
                <g key={i}>
                  <circle cx={x(i)} cy={y(p.value)} r="5" className="pq-chart__dot" />
                  <text x={x(i)} y={y(p.value) - 9} textAnchor="middle" className="pq-chart__val">
                    {num(p.value)}
                  </text>
                </g>
              ))}
            </>
          )}
        {chart.points.map((p, i) => (
          <text key={i} x={x(i)} y={H - pad.b + 18} textAnchor="middle" className="pq-chart__label">
            {p.label.length > 12 ? p.label.slice(0, 11) + '…' : p.label}
          </text>
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih} y2={pad.t + ih} className="pq-chart__axis" />
      </svg>
      {(chart.xLabel || chart.yLabel) && (
        <div className="pq-chart__legend">
          {chart.yLabel && <span>↕ {mixed(chart.yLabel)}{chart.unit ? ` (${chart.unit})` : ''}</span>}
          {chart.xLabel && <span>↔ {mixed(chart.xLabel)}</span>}
        </div>
      )}
    </figure>
  );
}

function niceStep(max: number) {
  const raw = max / 5 || 1;
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

/* ---------------- Written (vertical) calculation ---------------- */
export function ColumnCalc({ column, arabic }: { column: PColumn; arabic: boolean }) {
  // align on the decimal point: pad integer and fraction parts with figure spaces
  const parts = column.lines.map((l) => l.replace(',', '.').split('.'));
  const intLen = Math.max(...parts.map((p) => p[0].length));
  const fracLen = Math.max(...parts.map((p) => (p[1] ?? '').length));
  const FS = ' ';
  const fmt = (p: string[]) => {
    const int = FS.repeat(intLen - p[0].length) + p[0];
    const frac = fracLen ? (p[1] !== undefined ? ',' + p[1] + FS.repeat(fracLen - p[1].length) : FS.repeat(fracLen + 1)) : '';
    const s = int + frac;
    return arabic ? s.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]) : s.replace(',', '.');
  };
  return (
    <div className="pq-column" dir="ltr" role="img" aria-label={column.lines.join(` ${column.op} `)}>
      {parts.map((p, i) => (
        <div key={i} className="pq-column__row">
          <span className="pq-column__op">{i === parts.length - 1 ? column.op : ''}</span>
          <span className="pq-column__num">{fmt(p)}</span>
        </div>
      ))}
      <div className="pq-column__line" />
    </div>
  );
}

/* ---------------- Scratchpad (draw with finger or pen) ---------------- */
export function Scratchpad({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const drawing = useRef(false);
  const [, force] = useState(0);

  const redraw = () => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3 * (window.devicePixelRatio || 1);
    ctx.strokeStyle = '#3f3fd1';
    for (const s of strokes.current) {
      ctx.beginPath();
      s.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
  };
  useEffect(() => {
    const c = ref.current!;
    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      redraw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
  };
  return (
    <div className="scratch" role="dialog" aria-label="مساحة للحل">
      <div className="scratch__bar">
        <strong>✏️ مساحة للحل</strong>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => (strokes.current.pop(), redraw(), force((v) => v + 1))}>
          ↩️ تراجع
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => ((strokes.current = []), redraw(), force((v) => v + 1))}>
          🧽 مسح
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
          ✕ إغلاق
        </button>
      </div>
      <canvas
        ref={ref}
        className="scratch__canvas"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          strokes.current.push([pos(e)]);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          strokes.current[strokes.current.length - 1].push(pos(e));
          redraw();
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
      />
    </div>
  );
}
