"use client";

import * as React from "react";
import { Timer, Volume2 } from "lucide-react";
import type { TimeSignature } from "@drum-notes/notation-engine";

import { Button } from "@/components/ui/button";
import { useMetronomeStore } from "../stores/metronome-store";

/**
 * Compact metronome control for the editor toolbar: a start/stop toggle and a
 * volume slider. It reads the project's tempo/meter via props and keeps a
 * running metronome in sync with live BPM / time-signature changes.
 */
export function MetronomePanel({
  bpm,
  timeSignature,
}: {
  readonly bpm: number;
  readonly timeSignature: TimeSignature;
}): React.JSX.Element {
  const isRunning = useMetronomeStore((state) => state.isRunning);
  const volume = useMetronomeStore((state) => state.volume);
  const toggle = useMetronomeStore((state) => state.toggle);
  const sync = useMetronomeStore((state) => state.sync);
  const setVolume = useMetronomeStore((state) => state.setVolume);

  React.useEffect(() => {
    // Runs only when bpm or the time-signature object actually changes.
    sync(bpm, timeSignature);
  }, [bpm, timeSignature, sync]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isRunning ? "default" : "outline"}
        size="sm"
        aria-label={isRunning ? "Stop metronome" : "Start metronome"}
        aria-pressed={isRunning}
        onClick={() => toggle(bpm, timeSignature)}
      >
        <Timer className="h-4 w-4" />
        Metronome
      </Button>

      <div className="flex items-center gap-1">
        <Volume2 className="h-4 w-4 text-neutral-500" aria-hidden />
        <input
          type="range"
          aria-label="Metronome volume"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          className="h-1 w-20 cursor-pointer accent-neutral-900"
        />
      </div>
    </div>
  );
}
