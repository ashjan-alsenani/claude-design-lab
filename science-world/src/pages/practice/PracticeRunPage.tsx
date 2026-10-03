import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSubject, getUnit, allLessons } from '../../data/units';
import type { SubjectId } from '../../data/types';
import { loadBank } from '../../practice/bank';
import { buildSession, modes, type Filters } from '../../practice/session';
import { conceptKey, isMastered, usePractice } from '../../practice/store';
import type { Bank, EnglishSkill, PracticeQuestion } from '../../practice/types';
import { SessionRunner, type Played } from '../../practice/components/Runner';
import { useProgress } from '../../state/ProgressContext';
import { Mascot } from '../../components/Mascot';
import { celebrate } from '../../lib/confetti';
import { play } from '../../lib/sound';
import { mixed } from '../../lib/bidi';
import { showNumber } from '../../practice/check';

/** English vocabulary meanings from the lessons (for «كلماتي»). */
const vocabMeaning = new Map(allLessons.flatMap((l) => l.vocab.map((v) => [v.word.toLowerCase(), v.meaning] as const)));

export function wordOf(q: PracticeQuestion): string | null {
  if (q.type === 'text') return q.answer;
  if (q.type === 'choice') {
    const o = q.options.find((x) => x.id === q.answer);
    if (o && /^[A-Za-z][A-Za-z '-]*$/.test(o.text)) return o.text;
  }
  return null;
}

/** A new session (other unit, mode or filters) always starts from a clean state. */
export function PracticeRunPage() {
  const { pathname, search } = useLocation();
  return <Run key={pathname + search} />;
}

function Run() {
  const { subject: sid, unit: uid } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const subject = getSubject(sid);
  const { setSubject } = useProgress();
  useEffect(() => setSubject(subject.id), [subject.id, setSubject]);
  const unit = getUnit(uid);
  const { state, record, finishSession, addWord } = usePractice();
  const progress = useProgress();
  const [bank, setBank] = useState<Bank | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[] | null>(null);
  const [played, setPlayed] = useState<Played[] | null>(null);
  const [round, setRound] = useState(0);
  const mode = params.get('mode') ?? 'quick';
  const def = modes.find((m) => m.id === mode);
  const filters: Filters = {
    lesson: params.get('lesson') ?? undefined,
    difficulty: (params.get('difficulty') as Filters['difficulty']) ?? undefined,
    type: (params.get('type') as Filters['type']) ?? undefined,
    status: (params.get('status') as Filters['status']) ?? undefined,
    concept: params.get('concept') ?? undefined,
    skill: (params.get('skill') as EnglishSkill) ?? undefined,
  };

  useEffect(() => {
    if (unit) loadBank(subject.id as SubjectId, unit.id).then(setBank);
  }, [unit, subject.id]);
  useEffect(() => {
    // build once per round, from the progress at the start of the session
    if (bank) setQuestions(buildSession(bank, state, mode, filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bank, mode, round]);

  const back = `/practice/${subject.id}/${unit?.id}`;
  const title = mode === 'concept' ? `🎯 ${bank?.concepts.find((c) => c.id === filters.concept)?.label ?? ''}` : `${def?.icon ?? '🎯'} ${def?.title ?? 'تدريب'}`;

  if (!unit || !bank || !questions)
    return (
      <div className="loading" role="status">
        <Mascot mood="thinking" size={90} />
        <span>نوري يجهّز الأسئلة…</span>
      </div>
    );
  if (!questions.length)
    return (
      <div className="page locked-notice">
        <Mascot mood="encouraging" size={120} />
        <h1>{mode === 'mistakes' ? 'لا توجد أخطاء لنراجعها 🎉' : 'لا توجد أسئلة هنا بعد'}</h1>
        <Link to={back} className="btn btn--accent btn--lg">العودة للوحدة</Link>
      </div>
    );

  if (played)
    return (
      <Results
        bank={bank}
        played={played}
        mode={mode}
        title={title}
        back={back}
        onAgain={() => {
          setPlayed(null);
          setQuestions(null);
          setRound((r) => r + 1);
        }}
        go={(m) => navigate(`/practice/${subject.id}/${unit.id}/run?mode=${m}`)}
      />
    );

  return (
    <div className="page practice-run-page" data-theme={unit.theme}>
      <SessionRunner
        key={round}
        bank={bank}
        questions={questions}
        title={mixed(title)}
        feedback={def?.feedback ?? 'each'}
        onExit={() => navigate(back)}
        onRecord={(p) => {
          record({ id: p.q.id, subject: bank.subject, unit: bank.unit, concept: p.q.concept, type: p.q.type, ok: p.result.ok, given: p.result.given, helped: p.helped });
          progress.recordAnswer(p.result.ok);
          if (!p.result.ok && bank.subject === 'english' && p.q.skill === 'vocabulary') {
            const w = wordOf(p.q);
            if (w) addWord({ word: w, meaning: vocabMeaning.get(w.toLowerCase()) });
          }
        }}
        onAddWord={(q) => {
          const w = wordOf(q);
          if (w) addWord({ word: w, meaning: vocabMeaning.get(w.toLowerCase()) });
        }}
        isWordAdded={(q) => {
          const w = wordOf(q);
          return Boolean(w && state.words[w.toLowerCase()]);
        }}
        onFinish={(p) => {
          const correct = p.filter((x) => x.result.ok).length;
          finishSession({ subject: bank.subject, unit: bank.unit, mode, total: p.length, correct });
          progress.addCoins(5);
          play('level');
          if (correct / Math.max(1, p.length) >= 0.7) celebrate();
          setPlayed(p);
        }}
      />
    </div>
  );
}

const skillNames: Record<EnglishSkill, string> = { vocabulary: 'Vocabulary', grammar: 'Grammar', listening: 'Listening', reading: 'Reading', writing: 'Writing' };

function Results({ bank, played, mode, title, back, onAgain, go }: { bank: Bank; played: Played[]; mode: string; title: string; back: string; onAgain: () => void; go: (mode: string) => void }) {
  const { state } = usePractice();
  const en = bank.subject === 'english';
  const total = played.length;
  const correct = played.filter((p) => p.result.ok).length;
  const acc = Math.round((100 * correct) / Math.max(1, total));
  const label = (id: string) => bank.concepts.find((c) => c.id === id)?.label ?? id;
  const touched = [...new Set(played.map((p) => p.q.concept))];
  const mastered = touched.filter((c) => isMastered(state.c[conceptKey(bank.subject, bank.unit, c)]));
  const review = touched.filter((c) => !mastered.includes(c) && played.some((p) => p.q.concept === c && !p.result.ok));
  const [open, setOpen] = useState<number | null>(null);
  const exam = mode === 'exam' || mode === 'exam-train';

  const skills = useMemo(() => {
    if (!en) return [];
    const by = new Map<EnglishSkill, { ok: number; n: number }>();
    for (const p of played) {
      const s = p.q.skill!;
      const v = by.get(s) ?? { ok: 0, n: 0 };
      v.n++;
      if (p.result.ok) v.ok++;
      by.set(s, v);
    }
    return [...by].map(([s, v]) => ({ s, ...v, stars: Math.round((5 * v.ok) / v.n) }));
  }, [en, played]);
  const weakest = skills.filter((s) => s.s !== 'writing').sort((a, b) => a.ok / a.n - b.ok / b.n)[0];

  return (
    <div className="page practice-results">
      <motion.div className="card reward-screen" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
        <Mascot mood={acc >= 70 ? 'celebrating' : 'encouraging'} size={120} />
        <div className="reward-screen__kicker">🎉 أنهيتِ التدريب!</div>
        <h1 dir="auto">{title}</h1>
        <div className="practice-results__nums">
          <div><strong>{showNumber(String(total), true)}</strong><span>سؤال</span></div>
          <div className="is-good"><strong>{showNumber(String(correct), true)}</strong><span>✅ صحيحة</span></div>
          <div className="is-review"><strong>{showNumber(String(total - correct), true)}</strong><span>🔁 تحتاج مراجعة</span></div>
          <div><strong>{showNumber(String(acc), true)}٪</strong><span>⭐ الدقة</span></div>
        </div>

        {skills.length > 0 && (
          <div className="practice-results__skills" dir="ltr">
            {skills.map((s) => (
              <div key={s.s}>
                <span>{skillNames[s.s]}</span>
                <span aria-label={`${s.stars} of 5`}>{'⭐'.repeat(s.stars)}{'☆'.repeat(5 - s.stars)}</span>
                {exam && <small>{s.ok}/{s.n}</small>}
              </div>
            ))}
            {weakest && weakest.ok < weakest.n && <p className="practice-results__focus">👉 Focus next on {skillNames[weakest.s]}</p>}
          </div>
        )}

        {mastered.length > 0 && (
          <div className="practice-results__list practice-results__list--good">
            <h2>🌟 المفاهيم التي أتقنتِها</h2>
            <div>{mastered.map((c) => <span key={c} className="chip" dir="auto">{mixed(label(c))}</span>)}</div>
          </div>
        )}
        {review.length > 0 && (
          <div className="practice-results__list practice-results__list--review">
            <h2>👀 مفاهيم تحتاج مراجعة</h2>
            <div>{review.map((c) => <span key={c} className="chip" dir="auto">{mixed(label(c))}</span>)}</div>
          </div>
        )}

        <div className="reward-screen__actions">
          {total - correct > 0 && (
            <button type="button" className="btn btn--sun btn--lg" onClick={() => go('mistakes')}>
              🔁 راجعي أخطائي
            </button>
          )}
          <button type="button" className="btn btn--accent btn--lg" onClick={onAgain}>
            🎯 تدريب جديد
          </button>
          {review.length > 0 && (
            <button type="button" className="btn btn--ghost" onClick={() => go('weak')}>
              🧠 تدرّبي على نقطة ضعفكِ
            </button>
          )}
          <Link to={back} className="btn btn--ghost">🏠 العودة للوحدة</Link>
        </div>
      </motion.div>

      {/* review of every answer (always useful, essential after the exam simulation) */}
      <section className="practice-review card">
        <h2 className="section-title">📋 مراجعة إجاباتكِ</h2>
        {played.map((p, i) => (
          <div key={i} className={`practice-review__item ${p.result.ok ? 'is-ok' : 'is-wrong'}`}>
            <button type="button" className="practice-review__head" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              <span>{p.result.ok ? '✅' : '❌'}</span>
              <span className="practice-review__q" dir="auto">{mixed(p.q.prompt)}</span>
              <span aria-hidden="true">{open === i ? '▴' : '▾'}</span>
            </button>
            {open === i && (
              <div className="practice-review__body">
                {p.q.type !== 'writing' && (
                  <>
                    <p dir="auto"><strong>{en ? 'Your answer:' : 'إجابتكِ:'}</strong> {mixed(p.result.given)}</p>
                    {!p.result.ok && <p dir="auto"><strong>{en ? 'Correct answer:' : 'الإجابة الصحيحة:'}</strong> {mixed(p.result.correct)}</p>}
                    {!p.result.ok && p.result.why && <p dir="auto">👀 {mixed(p.result.why)}</p>}
                  </>
                )}
                <p dir="auto">💡 {mixed(p.q.explanation)}</p>
                <p dir="auto" className="practice-review__tip">{mixed(p.q.tip)}</p>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
