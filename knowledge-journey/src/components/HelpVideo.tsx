import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { createMemoryStore, useStore } from '../state/store';
import { Icon } from './Icon';

const open = createMemoryStore(() => false);
export const openHelpVideo = () => open.set(true);

/** Button that opens the "how to use the site" tutorial video. */
export function HelpVideoButton({ className = 'btn btn-ghost btn-sm' }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={openHelpVideo} aria-label="كيف أستخدم الموقع؟">
      <Icon name="film" />
      <span>كيف أستخدم الموقع؟</span>
    </button>
  );
}

export function HelpVideoLayer() {
  const isOpen = useStore(open, (o) => o);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && open.set(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="modal-scrim" style={{ zIndex: 96 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => open.set(false)}>
          <motion.div
            className="help-video panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="help-head">
              <h2 id="help-title">كيف أستخدم الموقع؟</h2>
              <button ref={closeRef} type="button" className="icon-btn ink" onClick={() => open.set(false)} aria-label="إغلاق الفيديو">
                <Icon name="close" />
              </button>
            </div>
            <video className="help-player" controls playsInline preload="metadata">
              <source src="media/how-to-use.webm" type="video/webm" />
              <source src="media/how-to-use.mp4" type="video/mp4" />
              متصفحكِ لا يدعم تشغيل الفيديو.
            </video>
            <p className="help-note">جولة مصوّرة (قرابة 4 دقائق ونصف) بتعليق صوتي وشرح نصي على الشاشة: الوضع الجماعي، الفرق والدور، الأنشطة، لوحة المعلمة، والتتويج.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
