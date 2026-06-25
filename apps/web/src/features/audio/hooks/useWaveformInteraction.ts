import * as React from "react";

import { pixelToSeconds } from "../services/waveform-service";

type WaveformInteractionOptions = {
  readonly canvasRef: React.RefObject<HTMLCanvasElement | null>;
  readonly duration: number;
  readonly onDragSelect: (t1: number, t2: number) => void;
  readonly onClear: () => void;
};

type DragState = {
  readonly startPx: number;
  readonly currentPx: number;
} | null;

type WaveformInteraction = {
  readonly dragState: DragState;
  readonly onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  readonly onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  readonly onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  readonly onMouseLeave: (e: React.MouseEvent<HTMLCanvasElement>) => void;
};

const DRAG_THRESHOLD_PX = 4;

/** Extracts the x position relative to the canvas element. */
function relativeX(e: React.MouseEvent<HTMLCanvasElement>): number {
  const rect = e.currentTarget.getBoundingClientRect();
  return e.clientX - rect.left;
}

/**
 * Manages mouse drag interaction on a waveform canvas. Fires `onDragSelect`
 * when the user drags more than DRAG_THRESHOLD_PX; fires `onClear` on a plain
 * click. Callers pass the drag state down to the canvas for live overlay drawing.
 */
export function useWaveformInteraction({
  canvasRef,
  duration,
  onDragSelect,
  onClear,
}: WaveformInteractionOptions): WaveformInteraction {
  const [dragState, setDragState] = React.useState<DragState>(null);
  const startPxRef = React.useRef<number | null>(null);

  const onMouseDown = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const px = relativeX(e);
    startPxRef.current = px;
    setDragState({ startPx: px, currentPx: px });
  }, []);

  const onMouseMove = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (startPxRef.current === null) return;
    setDragState({ startPx: startPxRef.current, currentPx: relativeX(e) });
  }, []);

  const onMouseUp = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (startPxRef.current === null) return;
      const canvas = canvasRef.current;
      const endPx = relativeX(e);
      const width = canvas?.offsetWidth ?? 0;

      if (Math.abs(endPx - startPxRef.current) >= DRAG_THRESHOLD_PX) {
        const t1 = pixelToSeconds(Math.min(startPxRef.current, endPx), width, duration);
        const t2 = pixelToSeconds(Math.max(startPxRef.current, endPx), width, duration);
        onDragSelect(t1, t2);
      } else {
        onClear();
      }

      startPxRef.current = null;
      setDragState(null);
    },
    [canvasRef, duration, onDragSelect, onClear],
  );

  const onMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (startPxRef.current !== null) {
        onMouseUp(e);
      }
    },
    [onMouseUp],
  );

  return { dragState, onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}
