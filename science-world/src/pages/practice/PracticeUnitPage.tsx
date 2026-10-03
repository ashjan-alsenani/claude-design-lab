import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getLesson, getSubject, getUnit, lessonLabel, unitName } from '../../data/units';
import type { SubjectId } from '../../data/types';
import { bankIndex, difficultyInfo, loadBank } from '../../practice/bank';
import { applyFilters, buildSession, modesFor, type Filters, type ModeDef } from '../../practice/session';
import { conceptKey, conceptMastery, conceptStatus, usePractice, unitStats } from '../../practice/store';
import type { Bank, Difficulty, QuestionType } from '../../practice/types';
import { Ring } from '../../components/Ring';
import { Mascot } from '../../components/Mascot';
import { LockedNotice } from '../LockedNotice';
import { play } from '../../lib/sound';
import { mixed } from '../../lib/bidi';
import { useProgress } from '../../state/ProgressContext';

const typeLabel: Record<QuestionType, string> = {
  choice: 'اختيار', tf: 'صح أو خطأ', multi: 'اختيار متعدد', number: 'اكتبي العدد', remainder: 'قسمة بباقٍ', text: 'كتابة كلمة',
  order: 'ترتيب', match: 'توصيل', sort: 'تصنيف', writing: 'كتابة موجّهة',
};
const statusLabel = { new: 'لم أجرّبها', correct: 'أجبتها صح', wrong: 'أخطأت فيها', mastered: 'أتقنتها' } as const;
const conceptChip = { new: '⚪ جديد', weak: '🔴 تحتاج تدريبًا', learning: '🟡 أتعلّمها', mastered: '🟢 أتقنتها' } as const;

export function PracticeUnitPage() {
  const { subject: sid, unit: uid } = useParams();
  const unit = getUnit(uid);
  const subject = getSubject(sid);
  const { setSubject } = useProgress();
  useEffect(() => setSubject(subject.id), [subject.id, setSubject]);
  const [bank, setBank] = useState<Bank | null>(null);
  useEffect(() => {
    if (unit && bankIndex[unit.id]) loadBank(subject.id as SubjectId, unit.id).then(setBank);
  }, [unit, subject.id]);
  if (!unit || !bankIndex[unit.id]) return <LockedNotice title="لم نجد أسئلة هذه الوحدة بعد" text="أسئلة هذه الوحدة قيد الإعداد." />;
  if (!bank)
    return (
      <div className="loading" role="status">
        <Mascot mood="thinking" size={90} />
        <span>نوري يجهّز الأسئلة…</span>
      </div>
    );
  return <UnitHome bank={bank} />;
}

function UnitHome({ bank }: { bank: Bank }) {
  const { state } = usePractice();
  const navigate = useNavigate();
  const unit = getUnit(bank.unit)!;
  const subject = getSubject(bank.subject);
  const conceptIds = bank.concepts.map((c) => c.id);
  const st = unitStats(state, bank.subject, bank.unit, conceptIds);
  const [filters, setFilters] = useState<Filters>({});
  const filtered = useMemo(() => applyFilters(bank, state, filters), [bank, state, filters]);
  const lessons = [...new Set(bank.questions.map((q) => q.lesson))];
  const types = [...new Set(bank.questions.map((q) => q.type))];

  const go = (mode: string, extra: Record<string, string> = {}) => {
    play('tap');
    const p = new URLSearchParams({ mode, ...extra });
    navigate(`/practice/${bank.subject}/${bank.unit}/run?${p}`);
  };
  const available = (m: ModeDef) => buildSession(bank, state, m.id).length > 0;
  const groups: [ModeDef['group'], string][] = [
    ['main', '🚀 ابدئي التدريب'],
    ['focus', bank.subject === 'english' ? '🎒 المهارات' : '🔎 تدريب مركّز'],
    ['review', '🔁 راجعي وثبّتي'],
    ['exam', '🏆 الاستعداد للاختبار'],
  ];
  const modes = modesFor(bank.subject);

  return (
    <div className="page practice-unit-page" data-theme={unit.theme}>
      <div className="challenge-run__bar">
        <Link to={`/practice/${bank.subject}`} className="icon-btn" aria-label="رجوع">→</Link>
        <h1 className="page-title">
          {unit.emoji} {mixed(unit.title)}
        </h1>
      </div>

      <section className="practice-stats card">
        <Ring value={st.mastery} label={`الإتقان ${st.mastery}%`} size={92} />
        <div className="practice-stats__grid">
          <div><strong>{bankIndex[bank.unit].total}</strong><span>سؤال</span></div>
          <div><strong>{st.attempted} / {bank.questions.length}</strong><span>تدرّبتِ عليها</span></div>
          <div><strong>{st.accuracy}%</strong><span>الدقة</span></div>
          <div><strong>{st.mastered} / {conceptIds.length}</strong><span>مفاهيم أتقنتِها</span></div>
        </div>
        <div className="eyebrow practice-stats__unit">{subject.emoji} {unitName(unit)}</div>
      </section>

      {groups.map(([g, title]) => {
        const list = modes.filter((m) => m.group === g);
        if (!list.length) return null;
        return (
          <section key={g} className="practice-modes-sec">
            <h2 className="section-title">{title}</h2>
            <div className="practice-modes">
              {list.map((m, i) => {
                const ok = available(m);
                return (
                  <button key={m.id} type="button" className={`practice-mode practice-mode--${g}`} disabled={!ok} onClick={() => go(m.id)} style={{ animationDelay: `${i * 40}ms` }}>
                    <span className="practice-mode__icon" aria-hidden="true">{m.icon}</span>
                    <span className="practice-mode__title" dir="auto">{m.title}</span>
                    <span className="practice-mode__text">{ok ? m.text : m.group === 'review' ? 'تظهر بعد أن تتدرّبي' : 'قريبًا'}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="practice-concepts card">
        <h2 className="section-title">📈 إتقاني لكل درس ومفهوم</h2>
        {lessons.map((l) => {
          const lesson = getLesson(l);
          const cs = bank.concepts.filter((c) => c.lesson === l);
          const avg = Math.round(cs.reduce((a, c) => a + conceptMastery(state.c[conceptKey(bank.subject, bank.unit, c.id)]), 0) / Math.max(1, cs.length));
          return (
            <details key={l} className="practice-concepts__lesson">
              <summary>
                <span className="practice-concepts__title">
                  {lesson?.emoji} <bdi>{lesson ? lessonLabel(lesson) : l}</bdi> {lesson && mixed(lesson.title)}
                </span>
                <span className="concept-row__bar concept-row__bar--learning" aria-hidden="true">
                  <span style={{ width: `${avg}%` }} />
                </span>
                <span className="concept-row__pct">{avg}%</span>
              </summary>
              {cs.map((c) => {
                const rec = state.c[conceptKey(bank.subject, bank.unit, c.id)];
                const m = conceptMastery(rec);
                const s = conceptStatus(rec);
                return (
                  <button key={c.id} type="button" className="concept-row" onClick={() => go('concept', { concept: c.id })}>
                    <span className="concept-row__name" dir="auto">{mixed(c.label)}</span>
                    <span className={`concept-row__bar concept-row__bar--${s}`}>
                      <span style={{ width: `${m}%` }} />
                    </span>
                    <span className="concept-row__pct">{m}%</span>
                    <span className={`concept-row__chip concept-row__chip--${s}`}>{conceptChip[s]}</span>
                  </button>
                );
              })}
            </details>
          );
        })}
        <p className="practice-concepts__note">💡 يصبح المفهوم «متقنًا» بعد عدة إجابات صحيحة على أسئلة مختلفة عنه. اضغطي على أي مفهوم لتتدرّبي عليه.</p>
      </section>

      <section className="practice-filter card">
        <h2 className="section-title">🧺 اختاري أسئلتكِ بنفسكِ</h2>
        <FilterRow label="الدرس" value={filters.lesson} onChange={(v) => setFilters((f) => ({ ...f, lesson: v }))} options={lessons.map((l) => ({ v: l, t: getLesson(l) ? lessonLabel(getLesson(l)!) : l }))} />
        <FilterRow
          label="الصعوبة"
          value={filters.difficulty}
          onChange={(v) => setFilters((f) => ({ ...f, difficulty: v as Difficulty | undefined }))}
          options={(['easy', 'medium', 'hard', 'challenge'] as Difficulty[]).map((d) => ({ v: d, t: `${difficultyInfo[d].icon} ${difficultyInfo[d].label}` }))}
        />
        <FilterRow label="نوع السؤال" value={filters.type} onChange={(v) => setFilters((f) => ({ ...f, type: v as QuestionType | undefined }))} options={types.map((t) => ({ v: t, t: typeLabel[t] }))} />
        <FilterRow
          label="حالتي"
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v as Filters['status'] }))}
          options={(Object.keys(statusLabel) as (keyof typeof statusLabel)[]).map((k) => ({ v: k, t: statusLabel[k] }))}
        />
        <button
          type="button"
          className="btn btn--accent btn--lg btn--block"
          disabled={!filtered.length}
          onClick={() => go('custom', Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) as Record<string, string>)}
        >
          {filtered.length ? `ابدئي (${Math.min(15, filtered.length)} من ${filtered.length} سؤال) 🚀` : 'لا توجد أسئلة بهذه الاختيارات'}
        </button>
      </section>
    </div>
  );
}

function FilterRow({ label, value, options, onChange }: { label: string; value?: string; options: { v: string; t: string }[]; onChange: (v: string | undefined) => void }) {
  return (
    <div className="filter-row">
      <span className="filter-row__label">{label}</span>
      <div className="filter-row__chips">
        <button type="button" className={`chip-btn ${!value ? 'chip-btn--active' : ''}`} onClick={() => onChange(undefined)}>
          الكل
        </button>
        {options.map((o) => (
          <button key={o.v} type="button" className={`chip-btn ${value === o.v ? 'chip-btn--active' : ''}`} onClick={() => onChange(value === o.v ? undefined : o.v)}>
            <bdi>{o.t}</bdi>
          </button>
        ))}
      </div>
    </div>
  );
}
