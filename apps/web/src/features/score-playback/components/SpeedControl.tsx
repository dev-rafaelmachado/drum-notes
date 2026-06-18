"use client";

import * as React from "react";
import { Gauge } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PLAYBACK_SPEEDS, usePlaybackStore } from "../stores/playback-store";

/**
 * Playback speed selector for the editor toolbar (PRACT-001). A segmented set of
 * fixed rates bound to the session speed; changing it takes effect immediately,
 * including while playing. Speed scales the transport rate (pitch unchanged).
 */
export function SpeedControl(): React.JSX.Element {
  const speed = usePlaybackStore((state) => state.speed);
  const setSpeed = usePlaybackStore((state) => state.setSpeed);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
      <Gauge className="h-4 w-4 text-neutral-500" aria-hidden />
      {PLAYBACK_SPEEDS.map((rate) => {
        const active = rate === speed;
        return (
          <Button
            key={rate}
            variant={active ? "default" : "outline"}
            size="sm"
            aria-label={`Set playback speed to ${rate}×`}
            aria-pressed={active}
            onClick={() => setSpeed(rate)}
          >
            {rate}×
          </Button>
        );
      })}
    </div>
  );
}
