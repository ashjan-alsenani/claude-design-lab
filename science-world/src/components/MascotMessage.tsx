import type { ReactNode } from 'react';
import type { MascotMood } from '../data/types';
import { Mascot, type Outfit } from './Mascot';

interface Props {
  mood?: MascotMood;
  children: ReactNode;
  size?: number;
  outfit?: Outfit;
  /** stack the bubble under the mascot (narrow places) */
  compact?: boolean;
}

/** نوري + speech bubble. Used to introduce, explain, hint and celebrate. */
export function MascotMessage({ mood = 'happy', children, size = 96, outfit, compact }: Props) {
  return (
    <div className={`mascot-msg ${compact ? 'mascot-msg--compact' : ''}`}>
      <Mascot mood={mood} size={size} outfit={outfit} />
      <div className="bubble" role="status" aria-live="polite">
        {children}
      </div>
    </div>
  );
}
