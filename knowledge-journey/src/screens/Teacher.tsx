import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { confirmAsk } from '../components/Confirm';
import { Icon } from '../components/Icon';
import { RichText } from '../components/RichText';
import { ACTIVITIES } from '../data/activities';
import { VERSES } from '../data/verses';
import { EMBEDDED } from '../lib/env';
import { navigate } from '../lib/router';
import { validateQuestion } from '../lib/questions';
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS, TOPIC_LABELS, type Difficulty, type Question, type QuestionType, type Topic } from '../lib/types';
import { accuracy, ACTIVITY_ORDER, gemCount, progressStore, totalXp, useProgress } from '../state/progress';
import {
  deleteQuestion,
  deleteSession,
  nextQuestionId,
  replaceBank,
  resetSession,
  restoreDefaultBank,
  TEAMS,
  teacherStore,
  upsertQuestion,
  useTeacher,
} from '../state/teacher';
import { TeamEmblem } from './Arena';
import { playStore, rankedTeams, usePlay } from '../state/play';
import './teacher.css';

type Tab = 'bank' | 'settings' | 'competition' | 'results';

export function Teacher() {
  const [tab, setTab] = useState<Tab>('bank');
  return (
    <div className="teacher">
      <header className="t-top">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate({ name: 'map' })}>
          <Icon name="map" />
          الخريطة
        </button>
        <h1>لوحة المعلمة</h1>
        <button type="button" className="btn btn-gold btn-sm" onClick={() => navigate({ name: 'arena' })}>
          <Icon name="users" />
          تشغيل المنافسة الصفية
        </button>
      </header>

      <p className="t-note">
        <Icon name="hint" size={18} />
        تُحفظ التعديلات والنتائج على هذا الجهاز وهذا المتصفح فقط. لم نضع كلمة مرور لأن كلمة المرور داخل كود المتصفح لا تحمي شيئًا فعليًا؛ الحفظ المشترك بين عدة أجهزة يحتاج خادمًا بمصادقة وصلاحيات حقيقية.
      </p>

      <nav className="t-tabs" role="tablist" aria-label="أقسام اللوحة">
        {(
          [
            ['bank', 'بنك الأسئلة'],
            ['settings', 'الإعدادات'],
            ['competition', 'جلسات المنافسة'],
            ['results', 'نتائج الطالبة على هذا الجهاز'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className="t-tab" onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      <div className="t-body">
        {tab === 'bank' && <Bank />}
        {tab === 'settings' && <Settings />}
        {tab === 'competition' && <Sessions />}
        {tab === 'results' && <Results />}
      </div>
    </div>
  );
}

/* ───────────── Question bank ───────────── */

const TYPES = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];
const TOPICS = Object.keys(TOPIC_LABELS) as Topic[];
const DIFFS = Object.keys(DIFFICULTY_LABELS) as Difficulty[];

function Bank() {
  const questions = useTeacher((s) => s.questions);
  const customized = useTeacher((s) => s.customized);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<Topic | ''>('');
  const [type, setType] = useState<QuestionType | ''>('');
  const [editing, setEditing] = useState<Question | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const list = useMemo(
    () =>
      questions.filter(
        (q) => (!topic || q.topic === topic) && (!type || q.type === type) && (!query || q.text.includes(query) || q.id.includes(query) || q.options.some((o) => o.includes(query))),
      ),
    [questions, topic, type, query],
  );

  const exportJson = async () => {
    if (EMBEDDED) {
      // downloads are blocked in the embedded viewer: hand the JSON over via the clipboard instead
      try {
        await navigator.clipboard.writeText(JSON.stringify({ version: 1, lesson: 'من مصادر التشريع الإسلامي (1)', questions }, null, 2));
        setNotice('نُسخ بنك الأسئلة (JSON) إلى الحافظة. الصقيه في ملف نصي واحفظيه باسم questions.json.');
      } catch {
        setNotice('تعذّر النسخ إلى الحافظة في هذا العارض. شغّلي الموقع من نسخته المستقلة لتنزيل الملف.');
      }
      return;
    }
    const blob = new Blob([JSON.stringify({ version: 1, lesson: 'من مصادر التشريع الإسلامي (1)', questions }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'questions.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const qs: Question[] = Array.isArray(data) ? data : data.questions;
      if (!Array.isArray(qs) || !qs.length) throw new Error('لا توجد أسئلة في الملف.');
      const bad = qs.map((q, i) => [i, validateQuestion(q)] as const).filter(([, e]) => e.length);
      if (bad.length) throw new Error(`السؤال رقم ${bad[0][0] + 1}: ${bad[0][1][0]}`);
      if (new Set(qs.map((q) => q.id)).size !== qs.length) throw new Error('توجد معرّفات مكررة.');
      replaceBank(qs);
      setNotice(`تم استيراد ${qs.length} سؤالًا.`);
    } catch (e) {
      setNotice(`تعذّر الاستيراد: ${(e as Error).message}`);
    }
  };

  return (
    <section className="t-section">
      <div className="t-toolbar">
        <label className="field-row">
          <span>بحث</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="نص أو معرّف" />
        </label>
        <label className="field-row">
          <span>الموضوع</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value as Topic | '')}>
            <option value="">الكل</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {TOPIC_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="field-row">
          <span>النوع</span>
          <select value={type} onChange={(e) => setType(e.target.value as QuestionType | '')}>
            <option value="">الكل</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {QUESTION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <div className="t-actions">
          <button
            type="button"
            className="btn btn-gold btn-sm"
            onClick={() => {
              setIsNew(true);
              setEditing({ id: nextQuestionId(questions), type: 'mcq', text: '', options: ['', '', '', ''], answer: 0, explanation: '', difficulty: 'easy', topic: 'sunnah' });
            }}
          >
            <Icon name="plus" size={18} />
            سؤال جديد
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={exportJson}>
            <Icon name="download" size={18} />
            {EMBEDDED ? 'نسخ JSON' : 'تصدير JSON'}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={18} />
            استيراد JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && void importJson(e.target.files[0])} />
          {customized && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                if (await confirmAsk('استعادة بنك الأسئلة الأصلي؟ ستُفقد تعديلاتكِ على هذا الجهاز.', 'استعادة الأصل')) {
                  restoreDefaultBank();
                  setNotice('تمت استعادة البنك الأصلي.');
                }
              }}
            >
              <Icon name="restart" size={18} />
              استعادة الأصل
            </button>
          )}
        </div>
      </div>
      {notice && (
        <p className="t-flash" role="status">
          {notice}
        </p>
      )}
      <p className="t-count num">
        {list.length} من {questions.length} سؤالًا {customized ? '(بنك معدَّل)' : '(البنك الأصلي)'}
      </p>
      <ul className="q-list">
        {list.map((q) => (
          <li key={q.id} className="q-row">
            <div className="q-meta">
              <span className="q-id num">{q.id}</span>
              <span className="chip">{QUESTION_TYPE_LABELS[q.type]}</span>
              <span className="chip soft">{TOPIC_LABELS[q.topic]}</span>
              <span className="chip soft" data-diff={q.difficulty}>
                {DIFFICULTY_LABELS[q.difficulty]}
              </span>
            </div>
            <p className="q-text">
              <RichText text={q.text} />
            </p>
            <p className="q-answer">
              <Icon name="check" size={16} /> <RichText text={q.options[q.answer] ?? ''} />
            </p>
            <div className="q-btns">
              <button
                type="button"
                className="btn btn-ghost-ink btn-sm"
                onClick={() => {
                  setIsNew(false);
                  setEditing(q);
                }}
              >
                <Icon name="edit" size={18} />
                تعديل
              </button>
              <button
                type="button"
                className="btn btn-ghost-ink btn-sm"
                onClick={async () => {
                  if (await confirmAsk(`حذف السؤال ${q.id}؟`, 'حذف')) deleteQuestion(q.id);
                }}
              >
                <Icon name="trash" size={18} />
                حذف
              </button>
            </div>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {editing && (
          <Editor
            initial={editing}
            isNew={isNew}
            existingIds={questions.map((q) => q.id)}
            onClose={() => setEditing(null)}
            onSave={(q) => {
              upsertQuestion(q);
              setEditing(null);
              setNotice(isNew ? `أُضيف السؤال ${q.id}.` : `حُفظ السؤال ${q.id}.`);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function presetOptions(type: QuestionType, current: string[]): string[] {
  if (type === 'truefalse') return ['صح', 'خطأ'];
  if (type === 'sunnahType') return ['القولية', 'الفعلية', 'التقريرية'];
  return current.length >= 2 && !(current[0] === 'صح' && current.length === 2) ? current : ['', '', '', ''];
}

function Editor({
  initial,
  isNew,
  existingIds,
  onClose,
  onSave,
}: {
  initial: Question;
  isNew: boolean;
  existingIds: string[];
  onClose: () => void;
  onSave: (q: Question) => void;
}) {
  const [q, setQ] = useState<Question>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const fixed = q.type === 'truefalse' || q.type === 'sunnahType';
  const set = (patch: Partial<Question>) => setQ((x) => ({ ...x, ...patch }));

  const save = () => {
    const clean = { ...q, id: q.id.trim(), text: q.text.trim(), explanation: q.explanation.trim(), options: q.options.map((o) => o.trim()) };
    const errs = validateQuestion(clean);
    if (isNew && existingIds.includes(clean.id)) errs.push('هذا المعرّف مستخدم من قبل.');
    setErrors(errs);
    if (!errs.length) onSave(clean);
  };

  return (
    <motion.div className="modal-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <motion.form
        className="editor panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="editor-head">
          <h2 id="editor-title">{isNew ? 'سؤال جديد' : `تعديل ${initial.id}`}</h2>
          <button type="button" className="icon-btn ink" onClick={onClose} aria-label="إغلاق">
            <Icon name="close" />
          </button>
        </div>
        <div className="editor-grid">
          <label className="field-row">
            <span>المعرّف</span>
            <input value={q.id} onChange={(e) => set({ id: e.target.value })} disabled={!isNew} />
          </label>
          <label className="field-row">
            <span>نوع السؤال</span>
            <select
              value={q.type}
              onChange={(e) => {
                const type = e.target.value as QuestionType;
                const options = presetOptions(type, q.options);
                set({ type, options, answer: Math.min(q.answer, options.length - 1) });
              }}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {QUESTION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="field-row">
            <span>الموضوع</span>
            <select value={q.topic} onChange={(e) => set({ topic: e.target.value as Topic })}>
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {TOPIC_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="field-row">
            <span>الصعوبة</span>
            <select value={q.difficulty} onChange={(e) => set({ difficulty: e.target.value as Difficulty })}>
              {DIFFS.map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_LABELS[d]}
                </option>
              ))}
            </select>
          </label>
          <label className="field-row wide">
            <span>نص السؤال</span>
            <textarea rows={3} value={q.text} onChange={(e) => set({ text: e.target.value })} />
          </label>
          <fieldset className="field-row wide opts">
            <legend>الخيارات — اختاري الإجابة الصحيحة بالدائرة</legend>
            {q.options.map((o, i) => (
              <div key={i} className="opt-row">
                <input type="radio" name="answer" checked={q.answer === i} onChange={() => set({ answer: i })} aria-label={`الخيار ${i + 1} هو الصحيح`} />
                <input
                  value={o}
                  disabled={fixed}
                  onChange={(e) => set({ options: q.options.map((x, j) => (j === i ? e.target.value : x)) })}
                  placeholder={`الخيار ${i + 1}`}
                  aria-label={`نص الخيار ${i + 1}`}
                />
                {!fixed && q.options.length > 2 && (
                  <button
                    type="button"
                    className="icon-btn ink"
                    aria-label={`حذف الخيار ${i + 1}`}
                    onClick={() => set({ options: q.options.filter((_, j) => j !== i), answer: q.answer === i ? 0 : q.answer > i ? q.answer - 1 : q.answer })}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                )}
              </div>
            ))}
            {!fixed && q.options.length < 4 && (
              <button type="button" className="btn btn-ghost-ink btn-sm" onClick={() => set({ options: [...q.options, ''] })}>
                <Icon name="plus" size={18} />
                إضافة خيار
              </button>
            )}
            <small className="muted">
              تحدي البرق يستخدم الأسئلة ذات الخيارات الأربعة فقط. لإدراج آية بالرسم العثماني اكتبي رمزها، مثل: {Object.keys(VERSES).map((k) => `[[${k}]]`).join(' ، ')}
            </small>
          </fieldset>
          <label className="field-row wide">
            <span>تفسير الإجابة (يظهر للطالبة بعد الإجابة)</span>
            <textarea rows={3} value={q.explanation} onChange={(e) => set({ explanation: e.target.value })} />
          </label>
        </div>
        {errors.length > 0 && (
          <ul className="editor-errors" role="alert">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        <div className="row-center">
          <button type="submit" className="btn btn-gold">
            <Icon name="check" />
            حفظ السؤال
          </button>
          <button type="button" className="btn btn-ghost-ink" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}

/* ───────────── Settings ───────────── */

function Settings() {
  const s = useTeacher((x) => x);
  const set = (patch: Partial<typeof s>) => teacherStore.set((x) => ({ ...x, ...patch }));
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, Math.round(v) || a));
  return (
    <section className="t-section t-settings panel">
      <label className="field-row">
        <span>مدة سؤال تحدي البرق (ثانية)</span>
        <input type="number" min={5} max={90} value={s.lightningSeconds} onChange={(e) => set({ lightningSeconds: clamp(+e.target.value, 5, 90) })} />
      </label>
      <label className="field-row">
        <span>عدد أسئلة تحدي البرق</span>
        <input type="number" min={3} max={30} value={s.lightningCount} onChange={(e) => set({ lightningCount: clamp(+e.target.value, 3, 30) })} />
      </label>
      <label className="field-row">
        <span>مؤقت «السؤال السريع» في العجلة (ثانية)</span>
        <input type="number" min={5} max={90} value={s.wheelQuickSeconds} onChange={(e) => set({ wheelQuickSeconds: clamp(+e.target.value, 5, 90) })} />
      </label>
      <label className="switch-row">
        <input type="checkbox" checked={s.unlockAll} onChange={(e) => set({ unlockAll: e.target.checked })} />
        <span>
          <strong>فتح جميع الجزر</strong>
          <small>مفيد للعرض على السبورة أو لتشغيل نشاط محدد في الحصة دون الترتيب.</small>
        </span>
      </label>
      <div className="danger">
        <h3>إعادة تصفير تقدم الطالبة</h3>
        <p className="muted">يمسح الاسم والنقاط والجواهر والشارات المحفوظة على هذا الجهاز.</p>
        <button
          type="button"
          className="btn btn-ghost-ink btn-sm"
          onClick={async () => {
            if (await confirmAsk('مسح تقدم الرحلة على هذا الجهاز؟ (الفردية أو الجماعية)', 'مسح التقدم')) {
              progressStore.reset();
              playStore.reset();
            }
          }}
        >
          <Icon name="trash" size={18} />
          مسح التقدم
        </button>
      </div>
    </section>
  );
}

/* ───────────── Competition sessions ───────────── */

function Sessions() {
  const sessions = useTeacher((s) => s.sessions);
  if (!sessions.length)
    return (
      <section className="t-section t-empty panel">
        <p>لا توجد جلسات منافسة مسجّلة بعد.</p>
        <button type="button" className="btn btn-gold" onClick={() => navigate({ name: 'arena' })}>
          <Icon name="users" />
          ابدئي أول منافسة
        </button>
      </section>
    );
  return (
    <section className="t-section sessions">
      {sessions.map((s) => {
        const ranked = [...s.teams].sort((a, b) => (s.scores[b] ?? 0) - (s.scores[a] ?? 0));
        return (
          <article key={s.id} className="session panel">
            <header>
              <h3>{s.label}</h3>
              <span className="chip">{s.finished ? 'منتهية' : 'جارية'}</span>
            </header>
            <p className="muted num">
              {new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(s.createdAt)} · {s.answered} سؤالًا مُجابًا
            </p>
            <ol className="session-scores">
              {ranked.map((t) => (
                <li key={t}>
                  <TeamEmblem id={t} size={22} />
                  <span>{TEAMS.find((x) => x.id === t)!.name}</span>
                  <strong className="num">{s.scores[t] ?? 0}</strong>
                </li>
              ))}
            </ol>
            <div className="q-btns">
              <button
                type="button"
                className="btn btn-ghost-ink btn-sm"
                onClick={async () => {
                  if (await confirmAsk('تصفير نقاط هذه الجلسة؟', 'تصفير')) resetSession(s.id);
                }}
              >
                <Icon name="restart" size={18} />
                تصفير النتائج
              </button>
              <button
                type="button"
                className="btn btn-ghost-ink btn-sm"
                onClick={async () => {
                  if (await confirmAsk('حذف هذه الجلسة؟', 'حذف')) deleteSession(s.id);
                }}
              >
                <Icon name="trash" size={18} />
                حذف
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

/* ───────────── Student results on this device ───────────── */

function Results() {
  const p = useProgress((x) => x);
  const play = usePlay((x) => x);
  return (
    <section className="t-section panel t-results">
      {play.mode === 'group' && (
        <div className="t-group">
          <h3>الرحلة الجماعية الحالية — نقاط الفرق</h3>
          <ol className="session-scores">
            {rankedTeams(play).map((t) => (
              <li key={t}>
                <TeamEmblem id={t} size={22} />
                <span>{TEAMS.find((x) => x.id === t)!.name}</span>
                <strong className="num">{play.scores[t] ?? 0}</strong>
              </li>
            ))}
          </ol>
        </div>
      )}
      <h3>{p.name ? `رحلة ${p.name}` : 'لم تبدأ أي طالبة رحلة على هذا الجهاز بعد'}</h3>
      <p className="muted num">
        النقاط: {totalXp(p)} · الجواهر: {gemCount(p)} / 8 · نسبة الإجابات الصحيحة: {accuracy(p)}%
      </p>
      <table className="crown-table">
        <thead>
          <tr>
            <th>النشاط</th>
            <th>الحالة</th>
            <th>النجوم</th>
            <th>أفضل نقاط</th>
            <th>الصحيحة</th>
            <th>مرات اللعب</th>
          </tr>
        </thead>
        <tbody>
          {ACTIVITY_ORDER.map((id) => {
            const r = p.activities[id];
            return (
              <tr key={id}>
                <td>{ACTIVITIES[id].title}</td>
                <td>{r.completed ? 'مكتمل' : '—'}</td>
                <td className="num">{r.stars}</td>
                <td className="num">{r.bestScore}</td>
                <td className="num">{r.total ? `${r.correct}/${r.total}` : '—'}</td>
                <td className="num">{r.plays}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
