import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { hush, useGuide } from '../state/guide';
import { StarSprite } from './art/StarSprite';
import './guide.css';

/** The floating guide star «سَنا». Sits in a corner, never over the play area's center. */
export function Guide() {
  const message = useGuide((g) => g.message);
  const mood = useGuide((g) => g.mood);
  const key = useGuide((g) => g.key);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!message) return;
    setOpen(true);
    const t = window.setTimeout(hush, Math.max(4500, message.length * 90));
    return () => window.clearTimeout(t);
  }, [message, key]);

  return (
    <div className="guide" data-mood={mood}>
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
      <AnimatePresence>
        {message && open && (
          <motion.div
            key={key}
            className="guide-bubble"
            initial={{ opacity: 0, y: 10, scale: 0.94, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.25 }}
            onClick={() => setOpen(false)}
            aria-hidden
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        type="button"
        className="guide-star"
        aria-label="سَنا، النجمة المرشدة"
        onClick={() => setOpen((o) => !o)}
        animate={
          mood === 'cheer'
            ? { y: [0, -18, 0], rotate: [0, -10, 10, 0] }
            : mood === 'think'
              ? { rotate: [0, -6, 6, -3, 0] }
              : { y: 0, rotate: 0 }
        }
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        key={`${key}-${mood}`}
      >
        <span className="guide-float">
          <StarSprite mood={mood} size={84} />
        </span>
      </motion.button>
    </div>
  );
}
