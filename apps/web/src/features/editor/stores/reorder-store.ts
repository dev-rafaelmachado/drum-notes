import { create } from "zustand";

/**
 * Transient drag state for measure reordering (EDIT-004). Session-only UI state,
 * never persisted: it just tracks which measure is being dragged and the gap the
 * pointer is over so the drop indicator can render. The actual reorder is a
 * domain edit dispatched on drop (see useMeasureReorder + editor-store).
 *
 * A `slot` is an insertion gap in `[0, measureCount]`: slot `i` is the gap above
 * measure `i`, and slot `measureCount` is the gap after the last measure.
 */
type ReorderState = {
  /** Index of the measure currently being dragged, or null when idle. */
  draggingIndex: number | null;
  /** Insertion gap the pointer is over, or null. */
  overSlot: number | null;

  startDrag: (index: number) => void;
  setOverSlot: (slot: number) => void;
  endDrag: () => void;
};

export const useReorderStore = create<ReorderState>((set) => ({
  draggingIndex: null,
  overSlot: null,

  startDrag: (index) => set({ draggingIndex: index, overSlot: null }),
  // Skip redundant updates so only the two measures whose indicator flips re-render.
  setOverSlot: (slot) => set((state) => (state.overSlot === slot ? state : { overSlot: slot })),
  endDrag: () => set({ draggingIndex: null, overSlot: null }),
}));
