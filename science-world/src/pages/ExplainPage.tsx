import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getLesson, subjectOfLesson, unitOfLesson } from '../data/units';
import { loadExplainer } from '../explain/registry';
import { ExplainerPlayer } from '../explain/Player';
import type { Explainer } from '../explain/types';
import { useProgress } from '../state/ProgressContext';
import { Mascot } from '../components/Mascot';
import { LockedNotice } from './LockedNotice';

/** 🎬 Full-screen animated explainer of a lesson. ?scene=&t= freezes a moment (previews). */
export function ExplainPage() {
  const { lessonId } = useParams();
  const [params] = useSearchParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const lesson = getLesson(lessonId);
  const { setSubject } = useProgress();
  const [ex, setEx] = useState<Explainer | null | undefined>(undefined);
  useEffect(() => {
    if (lesson) setSubject(subjectOfLesson(lesson).id);
    if (lessonId) loadExplainer(lessonId).then((e) => setEx(e ?? null));
  }, [lessonId, lesson, setSubject]);
  if (!lesson || ex === null) return <LockedNotice title="لا يوجد شرح متحرك لهذا الدرس بعد" text="سيُضاف قريبًا." />;
  if (ex === undefined)
    return (
      <div className="loading" role="status">
        <Mascot mood="thinking" size={90} />
        <span>نوري يجهّز الشرح…</span>
      </div>
    );
  const still = params.has('scene') ? { scene: Number(params.get('scene')), t: Number(params.get('t') ?? 3) } : undefined;
  const back = () => (window.history.length > 1 ? navigate(-1) : navigate(`/lesson/${lesson.id}`));
  return (
    <div className="page explain-page" data-theme={unitOfLesson(lesson).theme}>
      <ExplainerPlayer key={search} ex={ex} still={still} onClose={back} onDone={() => navigate(`/lesson/${lesson.id}`, { replace: true })} />
    </div>
  );
}
