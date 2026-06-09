"use client";

import * as React from "react";
import type { Instrument, LayoutMeasure } from "@drum-notes/notation-engine";

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
  const isActive = useActiveMeasure(measure.id);

  return (
    <MeasureView
      measure={measure}
      index={index}
      stepsPerBeat={stepsPerBeat}
      canRemove={canRemove}
      isActive={isActive}
      headerActions={
        <MeasureSyncControls
          measureId={measure.id}
          index={index}
          orderedMeasureIds={orderedMeasureIds}
        />
      }
      onToggle={onToggle}
      onDuplicate={onDuplicate}
      onRemove={onRemove}
    />
  );
}
