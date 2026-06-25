"use client";

import * as React from "react";

import { WAVEFORM_BUCKETS, secondsToPixel } from "../services/waveform-service";
import { useWaveformInteraction } from "../hooks/useWaveformInteraction";

type WaveformCanvasProps = {
  readonly waveformData: Float32Array;
  readonly duration: number;
  readonly position: number;
  /** Loop region in seconds to highlight, or null when no loop is active. */
  readonly loopStart: number | null;
  readonly loopEnd: number | null;
  /** Audio timestamps (in seconds) where measure tick marks should be drawn. */
  readonly measureTicks: readonly number[];
  readonly onDragSelect: (t1: number, t2: number) => void;
  readonly onClear: () => void;
};

const HEIGHT = 64;
const DEVICE_PIXEL_RATIO = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

function draw(
  canvas: HTMLCanvasElement,
  waveformData: Float32Array,
  duration: number,
  position: number,
  loopStart: number | null,
  loopEnd: number | null,
  measureTicks: readonly number[],
  dragStart: number | null,
  dragEnd: number | null,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  const buckets = waveformData.length / 2;
  const mid = height / 2;

  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, width, height);

  // Persisted loop region overlay (from playback-store)
  if (loopStart !== null && loopEnd !== null && loopStart < loopEnd) {
    const lx1 = secondsToPixel(loopStart, duration, width);
    const lx2 = secondsToPixel(loopEnd, duration, width);
    ctx.fillStyle = "rgba(124, 58, 237, 0.12)"; // violet-600/12
    ctx.fillRect(lx1, 0, lx2 - lx1, height);
  }

  // Live drag overlay
  if (dragStart !== null && dragEnd !== null) {
    const dx1 = Math.min(dragStart, dragEnd);
    const dx2 = Math.max(dragStart, dragEnd);
    ctx.fillStyle = "rgba(124, 58, 237, 0.22)";
    ctx.fillRect(dx1, 0, dx2 - dx1, height);
  }

  // Waveform bars
  const barWidth = width / buckets;
  ctx.fillStyle = "#a3a3a3"; // neutral-400
  for (let i = 0; i < buckets; i++) {
    const minAmp = waveformData[i * 2] ?? 0;
    const maxAmp = waveformData[i * 2 + 1] ?? 0;
    const yTop = mid - maxAmp * mid;
    const barHeight = Math.max(1, (maxAmp - minAmp) * mid);
    ctx.fillRect(i * barWidth, yTop, Math.max(1, barWidth - 0.5), barHeight);
  }

  // Measure tick marks
  ctx.strokeStyle = "#d4d4d4"; // neutral-300
  ctx.lineWidth = 1;
  for (const tick of measureTicks) {
    const tx = secondsToPixel(tick, duration, width);
    ctx.beginPath();
    ctx.moveTo(tx, 0);
    ctx.lineTo(tx, height);
    ctx.stroke();
  }

  // Playhead
  if (duration > 0) {
    const px = secondsToPixel(position, duration, width);
    ctx.strokeStyle = "#3b82f6"; // blue-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();
  }
}

export function WaveformCanvas({
  waveformData,
  duration,
  position,
  loopStart,
  loopEnd,
  measureTicks,
  onDragSelect,
  onClear,
}: WaveformCanvasProps): React.JSX.Element {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = React.useState(0);

  // Track container width for responsive sizing.
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setCanvasWidth(entry.contentRect.width);
    });
    observer.observe(container);
    setCanvasWidth(container.offsetWidth);
    return () => observer.disconnect();
  }, []);

  // Size the canvas backing store to device pixels.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasWidth <= 0) return;
    canvas.width = canvasWidth * DEVICE_PIXEL_RATIO;
    canvas.height = HEIGHT * DEVICE_PIXEL_RATIO;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${HEIGHT}px`;
    const ctx = canvas.getContext("2d");
    ctx?.scale(DEVICE_PIXEL_RATIO, DEVICE_PIXEL_RATIO);
  }, [canvasWidth]);

  const { dragState, onMouseDown, onMouseMove, onMouseUp, onMouseLeave } =
    useWaveformInteraction({ canvasRef, duration, onDragSelect, onClear });

  // Redraw whenever any visual input changes.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasWidth <= 0 || waveformData.length < 2) return;
    draw(
      canvas,
      waveformData,
      duration,
      position,
      loopStart,
      loopEnd,
      measureTicks,
      dragState ? dragState.startPx * DEVICE_PIXEL_RATIO : null,
      dragState ? dragState.currentPx * DEVICE_PIXEL_RATIO : null,
    );
  }, [
    waveformData,
    duration,
    position,
    loopStart,
    loopEnd,
    measureTicks,
    dragState,
    canvasWidth,
  ]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        aria-label="Audio waveform. Drag to select a loop region."
        role="img"
        style={{ display: "block", cursor: "crosshair" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />
    </div>
  );
}

// Re-export so consumers can reference the canonical bucket count.
export { WAVEFORM_BUCKETS };
