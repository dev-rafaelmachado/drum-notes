"use client";

import * as React from "react";
import type { Instrument, LayoutMeasure } from "@drum-notes/notation-engine";

import { MeasureLoopButton } from "@/features/score-playback/components/MeasureLoopButton";
import { MeasurePlaybackButton } from "@/features/score-playback/components/MeasurePlaybackButton";
import { usePlaybackStore } from "@/features/score-playback/stores/playback-store";
import type { LoopRole } from "./MeasureView";
import { MeasureSyncControls } from "@/features/sync/components/MeasureSyncControls";
import { useActiveMeasure } from "@/features/sync/hooks/useActiveMeasure";
import { MeasureView } from "./MeasureView";

/**
 * Binds a measure to synchronization: it subscribes to *its own* active state
 * (so only the measure whose highlight flips re-renders during playback) and
 * supplies the per-measure sync controls to the measure header.
 */
export function EditorMeasure({
  measure,
  index,
  stepsPerBeat,
  canRemove,
  orderedMeasureIds,
  onToggle,
  onDuplicate,
  onRemove,
}: {
  readonly measure: LayoutMeasure;
  readonly index: number;
  readonly stepsPerBeat: number;
  readonly canRemove: boolean;
  readonly orderedMeasureIds: readonly string[];
  readonly onToggle: (measureId: string, instrument: Instrument, position: number) => void;
  readonly onDuplicate: (measureId: string) => void;
  readonly onRemove: (measureId: string) => void;
}): React.JSX.Element {
  // The playhead step for *this* measure, or -1 when playback is elsewhere or
  // stopped — so only the playing measure re-renders as the highlight advances.
  const playheadStep = usePlaybackStore((state) =>
    state.status !== "idle" && state.currentMeasureIndex === index ? state.currentStep : -1,
  );
  const isActive = useActiveMeasure(measure.id) || playheadStep >= 0;

  // This measure's role in the loop region (or "none"). A per-measure string
  // selector keeps re-renders local when the loop changes.
  const loopRole = usePlaybackStore((state): LoopRole => {
    const loop = state.loop;
    if (!loop || index < loop.start || index > loop.end) {
      return "none";
    }
    if (loop.start === loop.end) {
      return "single";
    }
    if (index === loop.start) {
      return "start";
    }
    if (index === loop.end) {
      return "end";
    }
    return "inside";
  });

  return (
    <MeasureView
      measure={measure}
      index={index}
      stepsPerBeat={stepsPerBeat}
      canRemove={canRemove}
      isActive={isActive}
      playheadStep={playheadStep}
      loopRole={loopRole}
      headerActions={
        <>
          <MeasureLoopButton measureIndex={index} inLoop={loopRole !== "none"} />
          <MeasurePlaybackButton measureIndex={index} />
          <MeasureSyncControls
            measureId={measure.id}
            index={index}
            orderedMeasureIds={orderedMeasureIds}
          />
        </>
      }
      onToggle={onToggle}
      onDuplicate={onDuplicate}
      onRemove={onRemove}
    />
  );
}
