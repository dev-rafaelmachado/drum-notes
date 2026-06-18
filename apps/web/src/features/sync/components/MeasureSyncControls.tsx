"use client";

import * as React from "react";
import { Anchor, MapPin, Play, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/features/audio/stores/audio-store";
import { useEditorStore } from "@/features/editor/stores/editor-store";
import { formatTime } from "@/shared/lib/format-time";
import { useSyncStore } from "../stores/sync-store";

/**
 * Per-measure synchronization controls in the measure header. Only shown when a
 * reference track is loaded: mark this measure at the current playback position,
 * jump playback to it, clear its mapping, or set it as the projection anchor —
 * which auto-projects every forward measure from the project's tempo (AUDIO-006).
 */
export function MeasureSyncControls({
  measureId,
  index,
  orderedMeasureIds,
}: {
  readonly measureId: string;
  readonly index: number;
  readonly orderedMeasureIds: readonly string[];
}): React.JSX.Element | null {
  const trackReady = useAudioStore((state) => state.status === "ready");
  const entry = useSyncStore((state) =>
    state.syncMap?.entries.find((candidate) => candidate.measureId === measureId),
  );
  const isAnchor = useSyncStore((state) => state.anchor?.measureId === measureId);
  const markMeasure = useSyncStore((state) => state.markMeasure);
  const removeMeasure = useSyncStore((state) => state.removeMeasure);
  const seekToMeasure = useSyncStore((state) => state.seekToMeasure);
  const projectFromAnchor = useSyncStore((state) => state.projectFromAnchor);

  if (!trackReady) {
    return null;
  }

  const label = `measure ${index + 1}`;

  function setAsAnchor(): void {
    const score = useEditorStore.getState().score;
    if (score) {
      projectFromAnchor(score, measureId);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {isAnchor ? (
        <span
          className="text-blue-600"
          title="Projection anchor"
          aria-label={`${label} is the projection anchor`}
        >
          <Anchor className="h-4 w-4" aria-hidden />
        </span>
      ) : null}

      {entry ? (
        <>
          <span className="font-mono text-xs tabular-nums text-blue-600">
            {formatTime(entry.start)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Jump playback to ${label}`}
            onClick={() => seekToMeasure(measureId)}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Clear sync for ${label}`}
            onClick={() => removeMeasure(measureId)}
          >
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Mark ${label} at current position`}
          title="Mark at current position"
          onClick={() => markMeasure(measureId, orderedMeasureIds)}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      )}

      {!isAnchor ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Set ${label} as projection anchor and project forward`}
          title="Set as anchor — project forward at current position"
          onClick={setAsAnchor}
        >
          <Anchor className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
