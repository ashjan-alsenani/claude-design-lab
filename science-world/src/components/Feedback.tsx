import type { ReactNode } from 'react';
import type { MascotMood } from '../data/types';
import { Mascot } from './Mascot';

const moods: Record<string, MascotMood> = { good: 'celebrating', oops: 'encouraging', reveal: 'thinking' };

/** Explains WHY after every answer — never just "right/wrong". */
export function Feedback({ tone, title, children }: { tone: 'good' | 'oops' | 'reveal'; title: string; children: ReactNode }) {
  return (
    <div className={`feedback feedback--${tone}`} role="status" aria-live="polite">
      <Mascot mood={moods[tone]} size={64} />
      <div>
        <div className="feedback__title">{title}</div>
        <div className="feedback__text">{children}</div>
      </div>
    </div>
  );
}
