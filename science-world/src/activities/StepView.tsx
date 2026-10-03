import type { LessonStep } from '../data/types';
import { VisualView } from '../illustrations/registry';
import { MascotMessage } from '../components/MascotMessage';
import { FlipCards, HotspotExplorer, ProcessPlayer, RevealCards, ThinkTalk } from './Discover';
import { DataReader, ExperimentLab, MatchGame, MemoryGame, OrderGame, SortGame } from './Play';
import { QuestionCard, type AnswerResult } from './QuestionCard';
import { DialoguePlayer } from './Dialogue';
import { mixed } from '../lib/bidi';

interface Props {
  step: LessonStep;
  onComplete: () => void;
  /** question steps report their result and continue by themselves */
  onAnswer: (r: AnswerResult) => void;
}

export const stepTitle: Record<LessonStep['type'], string> = {
  intro: 'لنبدأ!',
  reveal: 'اكتشف',
  hotspot: 'استكشف الرسم',
  process: 'شاهد ما يحدث',
  flip: 'بطاقات الكلمات',
  sort: 'صنّف',
  match: 'وصّل',
  order: 'رتّب',
  question: 'سؤال سريع',
  memory: 'لعبة الذاكرة',
  data: 'اقرأ البيانات',
  think: 'تحدّث عن!',
  experiment: 'مختبر التجارب',
  dialogue: 'اقرئي واستمعي',
};

export const stepIcon: Record<LessonStep['type'], string> = {
  intro: '👋',
  reveal: '🔍',
  hotspot: '👆',
  process: '🎬',
  flip: '🔄',
  sort: '🧺',
  match: '🔗',
  order: '🔢',
  question: '❓',
  memory: '🧠',
  data: '📊',
  think: '💬',
  experiment: '🧪',
  dialogue: '💬',
};

/** Picks the right activity component for a lesson step. */
export function StepView({ step, onComplete, onAnswer }: Props) {
  switch (step.type) {
    case 'intro':
      return (
        <div className="activity intro-step">
          {step.visual && <VisualView visual={step.visual} className="intro-step__visual" />}
          <MascotMessage mood="excited" size={110}>
            <p>{mixed(step.mascot)}</p>
            {step.hook && <p className="intro-step__hook">🤔 {step.hook}</p>}
          </MascotMessage>
        </div>
      );
    case 'reveal':
      return <RevealCards step={step} onComplete={onComplete} />;
    case 'hotspot':
      return <HotspotExplorer step={step} onComplete={onComplete} />;
    case 'process':
      return <ProcessPlayer step={step} onComplete={onComplete} />;
    case 'flip':
      return <FlipCards step={step} onComplete={onComplete} />;
    case 'sort':
      return <SortGame step={step} onComplete={onComplete} />;
    case 'match':
      return <MatchGame step={step} onComplete={onComplete} />;
    case 'order':
      return <OrderGame step={step} onComplete={onComplete} />;
    case 'memory':
      return <MemoryGame step={step} onComplete={onComplete} />;
    case 'data':
      return <DataReader step={step} onComplete={onComplete} />;
    case 'think':
      return <ThinkTalk step={step} onComplete={onComplete} />;
    case 'experiment':
      return <ExperimentLab step={step} onComplete={onComplete} />;
    case 'dialogue':
      return <DialoguePlayer step={step} onComplete={onComplete} />;
    case 'question':
      return <QuestionCard question={step.question} onDone={onAnswer} />;
  }
}

/** Which steps can be continued immediately (no interaction required). */
export function isPassive(step: LessonStep) {
  return step.type === 'intro';
}

/** Title shown in the header for steps that have one. */
export function headingOf(step: LessonStep): string {
  if ('title' in step && step.title) return step.title;
  return stepTitle[step.type];
}
