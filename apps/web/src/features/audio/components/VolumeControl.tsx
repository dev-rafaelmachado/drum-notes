"use client";

import * as React from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";

type VolumeControlProps = {
  readonly volume: number; // linear 0..1
  readonly onVolumeChange: (level: number) => void;
};

export function VolumeControl({
  volume,
  onVolumeChange,
}: VolumeControlProps): React.JSX.Element {
  const Icon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-neutral-500" aria-hidden />
      <input
        type="range"
        aria-label="Volume"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        className="h-1 w-24 cursor-pointer accent-neutral-900"
      />
    </div>
  );
}
