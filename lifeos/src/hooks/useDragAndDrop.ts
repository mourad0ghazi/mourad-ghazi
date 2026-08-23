// ─────────────────────────────────────────────────────────────
// LifeOS – useDragAndDrop : réordonnancement de liste par
// glisser-déposer HTML5 (léger, sans dépendance)
// ─────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from 'react';

interface DragState {
  index: number | null;
  over: number | null;
}

/**
 * Retourne les props à attacher aux éléments d'une liste pour les
 * réordonner par drag & drop. `onReorder(from, to)` est appelé au drop.
 */
export function useDragReorder(onReorder: (from: number, to: number) => void) {
  const [drag, setDrag] = useState<DragState>({ index: null, over: null });
  const stateRef = useRef(drag);
  stateRef.current = drag;

  const dragProps = useCallback(
    (index: number) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'move';
        setDrag((d) => ({ ...d, index }));
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (stateRef.current.index !== null && stateRef.current.index !== index) {
          setDrag((d) => (d.over === index ? d : { ...d, over: index }));
        }
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const from = stateRef.current.index;
        if (from !== null && from !== index) onReorder(from, index);
        setDrag({ index: null, over: null });
      },
      onDragEnd: () => setDrag({ index: null, over: null }),
    }),
    [onReorder],
  );

  return { drag, dragProps };
}
