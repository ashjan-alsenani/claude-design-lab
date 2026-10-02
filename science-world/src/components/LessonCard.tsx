import { lessonNo } from '../lib/format';
import { Link } from 'react-router-dom';
import type { Lesson } from '../data/types';
import { useProgress } from '../state/ProgressContext';
import { isLessonDone, isLessonUnlocked } from '../state/journey';
import { allLessons } from '../data/units';
import { Stars } from './Stars';

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { state } = useProgress();
  const done = isLessonDone(state, lesson.id);
  const open = isLessonUnlocked(state, lesson.id);
  const prev = allLessons[allLessons.findIndex((l) => l.id === lesson.id) - 1];
  const activities = lesson.steps.filter((s) => s.type !== 'intro').length;
  const body = (
    <>
      <span className="lesson-card__emoji" aria-hidden="true">
        {open ? lesson.emoji : '🔒'}
      </span>
      <span className="lesson-card__body">
        <span className="lesson-card__num">الدرس {lessonNo(lesson.id)}</span>
        <span className="lesson-card__title">{lesson.title}</span>
        <span className="lesson-card__meta">
          {open ? `🎮 ${activities} أنشطة · 🎯 ${lesson.quiz.length} أسئلة` : prev ? `أكمل الدرس ${lessonNo(prev.id)} لفتحه` : ''}
        </span>
      </span>
      <span className="lesson-card__end">
        {done ? <Stars count={state.lessons[lesson.id].stars} size="sm" /> : open ? <span className="lesson-card__go">ابدأ ←</span> : null}
      </span>
    </>
  );
  return open ? (
    <Link to={`/lesson/${lesson.id}`} className={`lesson-card ${done ? 'lesson-card--done' : ''}`}>
      {body}
    </Link>
  ) : (
    <div className="lesson-card lesson-card--locked" aria-disabled="true">
      {body}
    </div>
  );
}
