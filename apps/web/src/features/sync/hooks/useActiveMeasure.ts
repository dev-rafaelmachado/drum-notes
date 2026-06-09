import { activeMeasureAt } from "@drum-notes/notation-engine";

import { useAudioStore } from "@/features/audio/stores/audio-store";
import { useSyncStore } from "../stores/sync-store";

/**
 * Whether `measureId` is the active measure at the current playback position.
 *
 * Subscribing per-measure to a boolean means a component only re-renders when
 * *its own* active state flips (at a window boundary), not on every position
 * tick — so following playback stays cheap across the whole score.
 */
export function useActiveMeasure(measureId: string): boolean {
  const syncMap = useSyncStore((state) => state.syncMap);
  return useAudioStore((state) =>
    syncMap ? activeMeasureAt(syncMap, state.position) === measureId : false,
  );
}
