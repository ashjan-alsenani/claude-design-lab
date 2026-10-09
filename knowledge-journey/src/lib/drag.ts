import { useCallback, useRef, useState, type PointerEvent as RPointerEvent } from 'react';

/**
 * Minimal pointer-based drag & drop that works with mouse, pen and touch.
 * Drop targets are any elements carrying `data-drop="<id>"`.
 * A press without movement is reported as a tap, so the same element also
 * supports "tap to select, then tap a target" play.
 */
export interface DragState {
  id: string | null;
  dx: number;
  dy: number;
  over: string | null;
}

const THRESHOLD = 6;

export function findDropTarget(x: number, y: number): string | null {
  const els = document.elementsFromPoint?.(x, y) ?? [];
  for (const el of els) {
    const t = (el as HTMLElement).closest?.('[data-drop]') as HTMLElement | null;
    if (t) return t.dataset.drop ?? null;
  }
  return null;
}

export function useDragDrop({
  onDrop,
  onTap,
  onStart,
}: {
  onDrop: (id: string, target: string | null) => void;
  onTap?: (id: string) => void;
  onStart?: (id: string) => void;
}) {
  const [drag, setDrag] = useState<DragState>({ id: null, dx: 0, dy: 0, over: null });
  const origin = useRef<{ id: string; x: number; y: number; moved: boolean; pointer: number } | null>(null);
  const lastDragEnd = useRef(0);
  /** True right after a drag: lets onClick handlers ignore the synthetic click that follows. */
  const justDragged = useCallback(() => Date.now() - lastDragEnd.current < 350, []);

  const bind = useCallback(
    (id: string, disabled = false) => ({
      onPointerDown: (e: RPointerEvent<HTMLElement>) => {
        if (disabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
        origin.current = { id, x: e.clientX, y: e.clientY, moved: false, pointer: e.pointerId };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      },
      onPointerMove: (e: RPointerEvent<HTMLElement>) => {
        const o = origin.current;
        if (!o || o.id !== id || o.pointer !== e.pointerId) return;
        const dx = e.clientX - o.x;
        const dy = e.clientY - o.y;
        if (!o.moved && Math.hypot(dx, dy) < THRESHOLD) return;
        if (!o.moved) {
          o.moved = true;
          onStart?.(id);
        }
        setDrag({ id, dx, dy, over: findDropTarget(e.clientX, e.clientY) });
      },
      onPointerUp: (e: RPointerEvent<HTMLElement>) => {
        const o = origin.current;
        origin.current = null;
        if (!o || o.id !== id) return;
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        if (o.moved) {
          lastDragEnd.current = Date.now();
          const target = findDropTarget(e.clientX, e.clientY);
          setDrag({ id: null, dx: 0, dy: 0, over: null });
          onDrop(id, target);
        } else {
          onTap?.(id);
        }
      },
      onPointerCancel: () => {
        origin.current = null;
        setDrag({ id: null, dx: 0, dy: 0, over: null });
      },
    }),
    [onDrop, onTap, onStart],
  );

  return { drag, bind, justDragged };
}
