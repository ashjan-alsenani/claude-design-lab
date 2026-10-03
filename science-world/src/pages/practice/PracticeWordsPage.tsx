import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { allLessons } from '../../data/units';
import { usePractice, type MyWord } from '../../practice/store';
import type { Bank, PracticeQuestion } from '../../practice/types';
import { SessionRunner, type Played } from '../../practice/components/Runner';
import { Mascot } from '../../components/Mascot';
import { shuffle } from '../../lib/random';
import { canSpeak } from '../../lib/speech';

const dictionary = [...new Map(allLessons.filter((l) => l.unitId.startsWith('e')).flatMap((l) => l.vocab.map((v) => [v.word.toLowerCase(), v] as const))).values()];

/** Practice questions generated from «كلماتي»: listen → meaning, listen → spell, missing letters. */
function wordQuestions(words: MyWord[]): PracticeQuestion[] {
  const voice = canSpeak();
  return words.flatMap((w, i) => {
    const meaning = w.meaning ?? dictionary.find((d) => d.word.toLowerCase() === w.word.toLowerCase())?.meaning;
    const base = { lesson: 'words', concept: w.word.toLowerCase(), skill: 'vocabulary' as const, difficulty: 'medium' as const, cognitive: 'knowledge' as const, tip: `${w.word}: listen, say it, spell it.` };
    const out: PracticeQuestion[] = [];
    if (meaning) {
      const others = shuffle(dictionary.filter((d) => d.word.toLowerCase() !== w.word.toLowerCase() && d.meaning !== meaning)).slice(0, 3);
      out.push({
        ...base,
        id: `W-${i}-m`,
        type: 'choice',
        prompt: voice ? 'Listen. What does the word mean?' : `What does "${w.word}" mean?`,
        audio: voice ? w.word : undefined,
        options: shuffle([{ id: 'ok', text: meaning }, ...others.map((o, k) => ({ id: `x${k}`, text: o.meaning }))]),
        answer: 'ok',
        explanation: `"${w.word}" means: ${meaning}`,
        explanationAr: `${w.word} = ${meaning}`,
      });
    }
    const letters = w.word.split('');
    const gaps = letters.map((ch, k) => (ch !== ' ' && k % 2 === 1 ? '_' : ch)).join(' ');
    out.push(
      voice
        ? { ...base, id: `W-${i}-s`, type: 'text', prompt: 'Listen and write the word.', audio: w.word, answer: w.word, explanation: `The word is spelled: ${letters.join(' - ')}` }
        : { ...base, id: `W-${i}-s`, type: 'text', prompt: `Complete the word${meaning ? ` (${meaning})` : ''}.`, pattern: gaps, answer: w.word, explanation: `The word is spelled: ${letters.join(' - ')}` },
    );
    return out;
  });
}

export function PracticeWordsPage() {
  const { state, reviewWord } = usePractice();
  const navigate = useNavigate();
  const [done, setDone] = useState<Played[] | null>(null);
  const questions = useMemo(() => {
    const all = Object.values(state.words);
    const due = all.filter((w) => w.due <= Date.now());
    return shuffle(wordQuestions((due.length ? due : all).slice(0, 8)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const bank: Bank = { subject: 'english', unit: 'words', concepts: [], passages: [], questions };

  if (!questions.length)
    return (
      <div className="page locked-notice">
        <Mascot mood="happy" size={120} />
        <h1>كلماتي فارغة الآن</h1>
        <Link to="/practice/mistakes#words" className="btn btn--accent btn--lg">رجوع</Link>
      </div>
    );
  if (done) {
    const ok = done.filter((p) => p.result.ok).length;
    return (
      <div className="page practice-results">
        <div className="card reward-screen">
          <Mascot mood="celebrating" size={120} />
          <div className="reward-screen__kicker">🎉 راجعتِ كلماتكِ!</div>
          <h1>{ok} / {done.length} ✅</h1>
          <p className="page-sub">الكلمات التي أجبتِها صحيحة ستعود للمراجعة بعد أيام، والصعبة نراجعها قريبًا.</p>
          <div className="reward-screen__actions">
            <Link to="/practice/mistakes#words" className="btn btn--accent btn--lg">⭐ كلماتي</Link>
            <Link to="/practice" className="btn btn--ghost">🏠 التدريب</Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="page practice-run-page" data-theme="sky">
      <SessionRunner
        bank={bank}
        questions={questions}
        title="⭐ كلماتي"
        feedback="each"
        onExit={() => navigate('/practice/mistakes#words')}
        onRecord={(p) => reviewWord(p.q.concept, p.result.ok)}
        onFinish={setDone}
      />
    </div>
  );
}
