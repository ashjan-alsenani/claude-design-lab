import { useMemo, useState } from 'react';
import type { GlossaryEntry } from '../data/glossary';
import type { McqQuestion } from '../data/types';
import { sample, shuffle } from '../lib/random';
import { QuestionCard } from '../activities/QuestionCard';
import { Mascot } from '../components/Mascot';

/** 🕵️ "من أنا؟" riddles built from the book's glossary definitions. */
export function Mystery({ entries, onFinish }: { entries: GlossaryEntry[]; onFinish: (score: number) => void }) {
  const rounds = useMemo<McqQuestion[]>(() => {
    const picks = sample(entries, Math.min(5, entries.length));
    return picks.map((e, i) => {
      const others = sample(
        entries.filter((x) => x.term !== e.term),
        3,
      );
      return {
        id: `mystery-${i}`,
        kind: 'mcq',
        prompt: `🕵️ من أنا؟ «${e.definition}»`,
        choices: shuffle([e, ...others]).map((x) => ({ id: x.term, text: x.term })),
        answer: e.term,
        explain: `أنا «${e.term}»: ${e.definition}`,
        hint: 'اقرأ الوصف مرة أخرى، وفكّر في الكلمات الجديدة التي تعلمتها.',
      };
    });
  }, [entries]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  return (
    <div className="mystery">
      <div className="mystery__head">
        <Mascot mood="thinking" size={70} />
        <div>
          <strong>اللغز {i + 1} من {rounds.length}</strong>
          <div className="activity__hint">اكتشف المصطلح العلمي من وصفه!</div>
        </div>
      </div>
      <QuestionCard
        key={i}
        question={rounds[i]}
        continueLabel={i === rounds.length - 1 ? 'النتيجة' : 'اللغز التالي'}
        onDone={(r) => {
          const s = score + (r.firstTry ? 1 : 0);
          setScore(s);
          if (i === rounds.length - 1) onFinish(s);
          else setI(i + 1);
        }}
      />
    </div>
  );
}
