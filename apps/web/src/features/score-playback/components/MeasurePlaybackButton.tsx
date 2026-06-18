"use client";

import * as React from "react";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/features/editor/stores/editor-store";
import { usePlaybackStore } from "../stores/playback-store";

/**
 * Per-measure "play from here" control in the measure header. Reads the latest
 * score from the editor store at click time so playback always starts from the
 * current notation at the chosen measure.
 */
export function MeasurePlaybackButton({
  measureIndex,
}: {
  readonly measureIndex: number;
}): React.JSX.Element {
  const playFrom = usePlaybackStore((state) => state.playFrom);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Play from measure ${measureIndex + 1}`}
      title="Play from here"
      onClick={() => {
        const score = useEditorStore.getState().score;
        if (score) {
          void playFrom(score, measureIndex);
        }
      }}
    >
      <Play className="h-4 w-4" />
    </Button>
  );
}
