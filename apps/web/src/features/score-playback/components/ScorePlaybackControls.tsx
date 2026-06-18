"use client";

import * as React from "react";
import { Pause, Play, Square } from "lucide-react";
import type { Score } from "@drum-notes/notation-engine";

import { Button } from "@/components/ui/button";
import { usePlaybackStore } from "../stores/playback-store";

/**
 * Transport controls for playing the written score in the editor toolbar:
 * play / pause / resume / stop. Status drives which control is shown; the score
 * is supplied by the editor so playback always reflects the latest notation.
 */
export function ScorePlaybackControls({ score }: { readonly score: Score }): React.JSX.Element {
  const status = usePlaybackStore((state) => state.status);
  const play = usePlaybackStore((state) => state.play);
  const pause = usePlaybackStore((state) => state.pause);
  const resume = usePlaybackStore((state) => state.resume);
  const stop = usePlaybackStore((state) => state.stop);

  const isPlaying = status === "playing";
  const isIdle = status === "idle";

  return (
    <div className="flex items-center gap-1">
      {isPlaying ? (
        <Button
          variant="default"
          size="sm"
          aria-label="Pause playback"
          onClick={() => pause()}
        >
          <Pause className="h-4 w-4" />
          Pause
        </Button>
      ) : (
        <Button
          variant={isIdle ? "outline" : "default"}
          size="sm"
          aria-label={isIdle ? "Play score" : "Resume playback"}
          onClick={() => (isIdle ? play(score) : resume())}
        >
          <Play className="h-4 w-4" />
          {isIdle ? "Play" : "Resume"}
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        aria-label="Stop playback"
        disabled={isIdle}
        onClick={() => stop()}
      >
        <Square className="h-4 w-4" />
      </Button>
    </div>
  );
}
