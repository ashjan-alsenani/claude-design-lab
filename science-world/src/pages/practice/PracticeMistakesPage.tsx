import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getLesson, getSubject, getUnit, lessonLabel } from '../../data/units';
import type { SubjectId } from '../../data/types';
import { loadBank } from '../../practice/bank';
import { checkAnswer, type Answer } from '../../practice/check';
import { usePractice } from '../../practice/store';
import type { Bank, EnglishSkill, PracticeQuestion } from '../../practice/types';
import { Say } from '../../components/Say';
import { Pronounce } from '../../practice/components/Pronounce';
import { Mascot } from '../../components/Mascot';
import { mixed } from '../../lib/bidi';
import { play } from '../../lib/sound';

const skillAr: Record<EnglishSkill, string> = { vocabulary: '🔤 Vocabulary', grammar: '🧩 Grammar', listening: '🎧 Listening', reading: '📖 Reading', writing: '✍️ Writing' };

/** The correct answer as text, without needing the child's answer. */
function correctText(q: PracticeQuestion, en: boolean) {
  const dummy: Record<string, Answer> = {
    choice: { type: 'choice', id: '' }, tf: { type: 'tf', value: false }, multi: { type: 'multi', ids: [] }, number: { type: 'number', value: '' },
    remainder: { type: 'remainder', quotient: '', remainder: '' }, text: { type: 'text', value: '' }, order: { type: 'order', ids: [] },
    match: { type: 'match', pairs: {} }, sort: { type: 'sort', buckets: {} }, writing: { type: 'writing', text: '' },
  };
  return checkAnswer(q, dummy[q.type], !en).correct;
}

/** «أخطائي» and «كلماتي». */
export function PracticeMistakesPage() {
  const { hash } = useLocation();
  const [tab, setTab] = useState<'mistakes' | 'words'>(hash === '#words' ? 'words' : 'mistakes');
  return (
    <div className="page practice-mistakes">
      <div className="challenge-run__bar">
        <Link to="/practice" className="icon-btn" aria-label="رجوع">→</Link>
        <h1 className="page-title">{tab === 'mistakes' ? '❌ أخطائي' : '⭐ كلماتي'}</h1>
      </div>
      <div className="subject-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'mistakes'} className={`subject-tab ${tab === 'mistakes' ? 'subject-tab--on' : ''}`} onClick={() => setTab('mistakes')}>
          ❌ أخطائي
        </button>
        <button type="button" role="tab" aria-selected={tab === 'words'} className={`subject-tab ${tab === 'words' ? 'subject-tab--on' : ''}`} onClick={() => setTab('words')}>
          ⭐ كلماتي
        </button>
      </div>
      {tab === 'mistakes' ? <Mistakes /> : <Words />}
    </div>
  );
}

function Mistakes() {
  const { state } = usePractice();
  const navigate = useNavigate();
  const wrong = Object.entries(state.q).filter(([, r]) => !r.last.ok);
  const units = [...new Set(wrong.map(([, r]) => `${r.subject}/${r.unit}`))];
  const [banks, setBanks] = useState<Record<string, Bank>>({});
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    for (const k of units) {
      const [s, u] = k.split('/');
      if (!banks[k]) loadBank(s as SubjectId, u).then((b) => setBanks((x) => ({ ...x, [k]: b })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units.join()]);

  if (!wrong.length)
    return (
      <div className="locked-notice">
        <Mascot mood="celebrating" size={120} />
        <h2>لا توجد أخطاء الآن 🎉</h2>
        <p className="page-sub">عندما تخطئين في سؤال، ستجدينه هنا مع شرحه، ثم نتدرّب عليه بأسئلة جديدة.</p>
        <Link to="/practice" className="btn btn--accent btn--lg">ابدئي التدريب</Link>
      </div>
    );

  return (
    <div className="mistakes-list">
      {units.map((k) => {
        const [sid, uid] = k.split('/');
        const subject = getSubject(sid);
        const unit = getUnit(uid);
        const bank = banks[k];
        const en = sid === 'english';
        const items = wrong.filter(([, r]) => `${r.subject}/${r.unit}` === k);
        // group by skill (English) then concept
        const groups = new Map<string, typeof items>();
        for (const it of items) {
          const q = bank?.questions.find((x) => x.id === it[0]);
          const g = en && q?.skill ? `${q.skill}|${it[1].concept}` : `|${it[1].concept}`;
          groups.set(g, [...(groups.get(g) ?? []), it]);
        }
        return (
          <section key={k} className="mistakes-unit card" data-theme={unit?.theme}>
            <header className="mistakes-unit__head">
              <h2>{subject.emoji} {unit && mixed(unit.title)}</h2>
              <button type="button" className="btn btn--accent btn--sm" onClick={() => (play('tap'), navigate(`/practice/${sid}/${uid}/run?mode=mistakes`))}>
                🔁 راجعيها بأسئلة جديدة
              </button>
            </header>
            {!bank && <p className="page-sub">…</p>}
            {bank &&
              [...groups].map(([g, list]) => {
                const [skill, concept] = g.split('|');
                const c = bank.concepts.find((x) => x.id === concept);
                const lesson = c ? getLesson(c.lesson) : undefined;
                return (
                  <div key={g} className="mistakes-concept">
                    <div className="mistakes-concept__head">
                      <div>
                        {skill && <span className="pq-tag">{skillAr[skill as EnglishSkill]}</span>}
                        <strong dir="auto"> {mixed(c?.label ?? concept)}</strong>
                        <small> · {list.length} {list.length === 1 ? 'خطأ' : 'أخطاء'}{lesson ? ` · الدرس ${lessonLabel(lesson)}` : ''}</small>
                      </div>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate(`/practice/${sid}/${uid}/run?mode=concept&concept=${concept}`)}>
                        🎯 تدرّبي على هذا المفهوم
                      </button>
                    </div>
                    {list.map(([id, r]) => {
                      const q = bank.questions.find((x) => x.id === id);
                      if (!q) return null;
                      return (
                        <div key={id} className="mistake-item">
                          <button type="button" className="mistake-item__q" onClick={() => setOpen(open === id ? null : id)} aria-expanded={open === id} dir="auto">
                            {mixed(q.prompt)} <span aria-hidden="true">{open === id ? '▴' : '▾'}</span>
                          </button>
                          {open === id && (
                            <div className="mistake-item__body">
                              {r.last.given && <p className="mistake-item__wrong" dir="auto">✗ {en ? 'You answered:' : 'أجبتِ:'} {mixed(r.last.given)}</p>}
                              <p className="mistake-item__right" dir="auto">✓ {en ? 'Correct:' : 'الصحيح:'} {mixed(correctText(q, en))}</p>
                              <p dir="auto">💡 {mixed(q.explanation)}</p>
                              <p className="mistake-item__tip" dir="auto">{mixed(q.tip)}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </section>
        );
      })}
    </div>
  );
}

function Words() {
  const { state, removeWord } = usePractice();
  const navigate = useNavigate();
  const words = useMemo(() => Object.values(state.words).sort((a, b) => a.due - b.due), [state.words]);
  const due = words.filter((w) => w.due <= Date.now()).length;
  if (!words.length)
    return (
      <div className="locked-notice">
        <Mascot mood="happy" size={120} />
        <h2>كلماتي فارغة الآن</h2>
        <p className="page-sub">عندما تصعب عليكِ كلمة إنجليزية في التدريب، تُضاف هنا تلقائيًا (أو اضغطي ⭐)، ثم نراجعها حتى تحفظيها.</p>
      </div>
    );
  return (
    <div className="words-page">
      <div className="words-page__head card">
        <div>
          <strong>{words.length} كلمة</strong> · {due ? `${due} جاهزة للمراجعة اليوم` : 'لا توجد مراجعة اليوم 🎉'}
        </div>
        <button type="button" className="btn btn--accent btn--lg" onClick={() => navigate('/practice/words')}>
          🎯 تدرّبي على كلماتي
        </button>
      </div>
      <ul className="words-list" lang="en">
        {words.map((w) => (
          <li key={w.word} className="word-card">
            <span className="word-card__word" dir="ltr">{w.emoji} {w.word}</span>
            {w.meaning && <span className="word-card__meaning">{w.meaning}</span>}
            <span className="word-card__tools">
              <Say text={w.word} />
              <Pronounce word={w.word} />
              <span className="word-card__box" title="مستوى الحفظ">{'●'.repeat(w.box)}{'○'.repeat(4 - w.box)}</span>
              <button type="button" className="icon-btn icon-btn--sm" onClick={() => removeWord(w.word)} aria-label={`احذفي ${w.word}`}>
                ✕
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
