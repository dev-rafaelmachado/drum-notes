"use client";

import * as React from "react";
import { Repeat } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePlaybackStore } from "../stores/playback-store";

/**
 * Per-measure loop control in the measure header (PRACT-001). Toggles the measure
 * into the session loop range: the first measure starts the loop, a later one
 * extends it, and toggling the lone looped measure clears it. `inLoop` drives the
 * pressed state; the heavy selection logic lives in the store.
 */
export function MeasureLoopButton({
  measureIndex,
  inLoop,
}: {
  readonly measureIndex: number;
  readonly inLoop: boolean;
}): React.JSX.Element {
  const toggleLoopMeasure = usePlaybackStore((state) => state.toggleLoopMeasure);

  return (
    <Button
      variant={inLoop ? "default" : "ghost"}
      size="icon"
      aria-label={`Toggle loop on measure ${measureIndex + 1}`}
      aria-pressed={inLoop}
      title="Loop this measure"
      onClick={() => toggleLoopMeasure(measureIndex)}
    >
      <Repeat className="h-4 w-4" />
    </Button>
  );
}
