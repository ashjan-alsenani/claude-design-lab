import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { createMemoryStore, useStore } from '../state/store';
import { Icon } from './Icon';

interface Ask {
  message: string;
  confirmLabel: string;
  resolve: (ok: boolean) => void;
}

const asks = createMemoryStore<Ask | null>(() => null);

/** In-page replacement for window.confirm (which embedded frames block). */
export function confirmAsk(message: string, confirmLabel = 'نعم، تابعي'): Promise<boolean> {
  return new Promise((resolve) => asks.set({ message, confirmLabel, resolve }));
}

export function ConfirmLayer() {
  const ask = useStore(asks, (a) => a);
  const okRef = useRef<HTMLButtonElement>(null);
  const close = (ok: boolean) => {
    ask?.resolve(ok);
    asks.set(null);
  };
  useEffect(() => {
    if (!ask) return;
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask]);
  return (
    <AnimatePresence>
      {ask && (
        <motion.div className="modal-scrim" style={{ zIndex: 95 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="confirm panel"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-msg"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
          >
            <p id="confirm-msg">{ask.message}</p>
            <div className="row-center">
              <button ref={okRef} type="button" className="btn btn-gold" onClick={() => close(true)}>
                <Icon name="check" />
                {ask.confirmLabel}
              </button>
              <button type="button" className="btn btn-ghost-ink" onClick={() => close(false)}>
                إلغاء
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
