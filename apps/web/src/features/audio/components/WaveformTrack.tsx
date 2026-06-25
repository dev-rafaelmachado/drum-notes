"use client";

import * as React from "react";
import { activeMeasureAt } from "@drum-notes/notation-engine";

import { useEditorStore } from "@/features/editor/stores/editor-store";
import { usePlaybackStore } from "@/features/score-playback/stores/playback-store";
import { useSyncStore } from "@/features/sync/stores/sync-store";
import { useAudioStore } from "../stores/audio-store";
import { WaveformCanvas } from "./WaveformCanvas";

/**
 * Connected waveform container (AUDIO-007, see docs/specs/waveform-display).
 * Reads waveform data and playback position from the audio store, the loop
 * region from the playback store, and measure timestamps from the sync store.
 * Drag events are translated to measure indices and forwarded to setLoop.
 */
export function WaveformTrack(): React.JSX.Element | null {
  const waveformData = useAudioStore((s) => s.waveformData);
  const waveformStatus = useAudioStore((s) => s.waveformStatus);
  const duration = useAudioStore((s) => s.duration);
  const position = useAudioStore((s) => s.position);

  const loop = usePlaybackStore((s) => s.loop);
  const setLoop = usePlaybackStore((s) => s.setLoop);
  const clearLoop = usePlaybackStore((s) => s.clearLoop);

  const syncMap = useSyncStore((s) => s.syncMap);
  const score = useEditorStore((s) => s.score);

  const orderedMeasureIds = React.useMemo(
    () => score?.measures.map((m) => m.id) ?? [],
    [score],
  );

  // Derive the loop region in seconds from measure indices + SyncMap.
  const loopSeconds = React.useMemo(() => {
    if (!loop || !syncMap) return null;
    const startId = orderedMeasureIds[loop.start];
    const endId = orderedMeasureIds[loop.end];
    if (!startId || !endId) return null;
    const startEntry = syncMap.entries.find((e) => e.measureId === startId);
    const endEntry = syncMap.entries.find((e) => e.measureId === endId);
    if (!startEntry || !endEntry) return null;
    return { start: startEntry.start, end: endEntry.end };
  }, [loop, syncMap, orderedMeasureIds]);

  // Measure start timestamps for tick marks.
  const measureTicks = React.useMemo(
    () => syncMap?.entries.map((e) => e.start) ?? [],
    [syncMap],
  );

  const handleDragSelect = React.useCallback(
    (t1: number, t2: number) => {
      if (!syncMap || orderedMeasureIds.length === 0) return;
      const startId = activeMeasureAt(syncMap, t1);
      const endId = activeMeasureAt(syncMap, t2);
      if (!startId || !endId) return;
      const startIndex = orderedMeasureIds.indexOf(startId);
      const endIndex = orderedMeasureIds.indexOf(endId);
      if (startIndex === -1 || endIndex === -1) return;
      setLoop({ start: Math.min(startIndex, endIndex), end: Math.max(startIndex, endIndex) });
    },
    [syncMap, orderedMeasureIds, setLoop],
  );

  if (waveformStatus === "generating") {
    return (
      <div
        className="flex h-16 w-full items-center justify-center rounded bg-neutral-100"
        aria-label="Generating waveform…"
      >
        <span className="text-xs text-neutral-400">Generating waveform…</span>
      </div>
    );
  }

  if (!waveformData || waveformStatus !== "ready") return null;

  return (
    <WaveformCanvas
      waveformData={waveformData}
      duration={duration}
      position={position}
      loopStart={loopSeconds?.start ?? null}
      loopEnd={loopSeconds?.end ?? null}
      measureTicks={measureTicks}
      onDragSelect={handleDragSelect}
      onClear={clearLoop}
    />
  );
}
