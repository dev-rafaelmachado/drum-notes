import * as React from "react";

import { useEditorStore } from "../stores/editor-store";
import { useReorderStore } from "../stores/reorder-store";

export type MeasureReorder = {
  /** Spread onto the drag handle to start a native drag from it. */
  handleProps: {
    draggable: true;
    onDragStart: (event: React.DragEvent) => void;
    onDragEnd: () => void;
  };
  /** Spread onto the measure element so it acts as a drop target. */
  dropTargetProps: {
    onDragOver: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  };
  moveLeft: () => void;
  moveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
};

/**
 * Wires one measure into drag-and-drop and keyboard reordering (EDIT-004). The
 * handlers read state lazily via `getState()` rather than subscribing, so the
 * bound component does not re-render on every `dragover`; the drop indicator
 * subscribes separately (see EditorMeasure). The drop commits a single
 * `moveMeasure` domain edit, which autosaves like any other edit.
 */
export function useMeasureReorder(
  measureId: string,
  index: number,
  measureCount: number,
): MeasureReorder {
  const onDragStart = React.useCallback(
    (event: React.DragEvent) => {
      event.dataTransfer.effectAllowed = "move";
      // Firefox only starts a drag once some data is set.
      event.dataTransfer.setData("text/plain", measureId);
      useReorderStore.getState().startDrag(index);
    },
    [measureId, index],
  );

  const onDragEnd = React.useCallback(() => {
    useReorderStore.getState().endDrag();
  }, []);

  const onDragOver = React.useCallback(
    (event: React.DragEvent) => {
      if (useReorderStore.getState().draggingIndex === null) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      // Drop above this measure when the pointer is in its top half, below otherwise.
      const rect = event.currentTarget.getBoundingClientRect();
      const isAfter = event.clientY > rect.top + rect.height / 2;
      useReorderStore.getState().setOverSlot(isAfter ? index + 1 : index);
    },
    [index],
  );

  const onDrop = React.useCallback((event: React.DragEvent) => {
    const { draggingIndex, overSlot, endDrag } = useReorderStore.getState();
    endDrag();
    if (draggingIndex === null || overSlot === null) {
      return;
    }
    event.preventDefault();
    const score = useEditorStore.getState().score;
    const moved = score?.measures[draggingIndex];
    if (!moved) {
      return;
    }
    // Removing the dragged measure shifts later slots down by one.
    const toIndex = overSlot > draggingIndex ? overSlot - 1 : overSlot;
    useEditorStore.getState().moveMeasure(moved.id, toIndex);
  }, []);

  const moveLeft = React.useCallback(() => {
    useEditorStore.getState().moveMeasure(measureId, index - 1);
  }, [measureId, index]);

  const moveRight = React.useCallback(() => {
    useEditorStore.getState().moveMeasure(measureId, index + 1);
  }, [measureId, index]);

  return {
    handleProps: { draggable: true, onDragStart, onDragEnd },
    dropTargetProps: { onDragOver, onDrop },
    moveLeft,
    moveRight,
    canMoveLeft: index > 0,
    canMoveRight: index < measureCount - 1,
  };
}
