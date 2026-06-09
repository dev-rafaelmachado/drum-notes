"use client";

import * as React from "react";
import { Pause, Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PositionDisplay } from "./PositionDisplay";

type TransportControlsProps = {
  readonly isPlaying: boolean;
  readonly position: number;
  readonly duration: number;
  readonly onPlay: () => void;
  readonly onPause: () => void;
  readonly onStop: () => void;
  readonly onSeek: (seconds: number) => void;
};

export function TransportControls({
  isPlaying,
  position,
  duration,
  onPlay,
  onPause,
  onStop,
  onSeek,
}: TransportControlsProps): React.JSX.Element {
  return (
    <div className="flex flex-1 items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={isPlaying ? onPause : onPlay}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button variant="outline" size="icon" aria-label="Stop" onClick={onStop}>
        <Square className="h-4 w-4" />
      </Button>

      <input
        type="range"
        aria-label="Seek"
        min={0}
        max={duration || 0}
        step={0.01}
        value={Math.min(position, duration || 0)}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="h-1 flex-1 cursor-pointer accent-neutral-900"
      />

      <PositionDisplay position={position} duration={duration} />
    </div>
  );
}
