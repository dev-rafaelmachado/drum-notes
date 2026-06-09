"use client";

import * as React from "react";

import { formatTime } from "../lib/format-time";

type PositionDisplayProps = {
  readonly position: number;
  readonly duration: number;
};

export function PositionDisplay({
  position,
  duration,
}: PositionDisplayProps): React.JSX.Element {
  return (
    <span
      className="font-mono text-xs tabular-nums text-neutral-500"
      aria-label="Playback position"
    >
      {formatTime(position)} / {formatTime(duration)}
    </span>
  );
}
