import { subjects } from '../data/subjects';
import { useProgress } from '../state/ProgressContext';
import { play } from '../lib/sound';

/** Switch between العلوم and الرياضيات (remembered for the whole site). */
export function SubjectTabs({ compact = false }: { compact?: boolean }) {
  const { state, setSubject } = useProgress();
  return (
    <div className={`subject-tabs ${compact ? 'subject-tabs--compact' : ''}`} role="tablist" aria-label="اختاري المادة">
      {subjects.map((s) => (
        <button
          key={s.id}
          type="button"
          role="tab"
          aria-selected={state.subject === s.id}
          className={`subject-tab ${state.subject === s.id ? 'subject-tab--on' : ''}`}
          data-theme={s.theme}
          onClick={() => {
            play('tap');
            setSubject(s.id);
          }}
        >
          <span aria-hidden="true">{s.emoji}</span> {s.title}
        </button>
      ))}
    </div>
  );
}
