import { create } from "zustand";
import {
  createSyncMap,
  measureStart,
  removeMeasureTimestamp,
  setMeasureTimestamp,
  type SyncMap,
} from "@drum-notes/notation-engine";

import { useAudioStore } from "@/features/audio/stores/audio-store";
import { loadSyncMap, saveSyncMap } from "../services/sync-repository";

/**
 * Orchestrates the score-to-audio SyncMap: hydration, editing, and seeking
 * between a measure and the audio. Timing/resolution rules live in the domain;
 * this store only holds the current map and wires intent to storage and the
 * audio player (see docs/specs/score-sync, docs/adr/008-score-sync.md).
 *
 * The active measure is *derived* from the audio position, not stored here — see
 * useActiveMeasure.
 */

type SyncState = {
  syncMap: SyncMap | null;

  hydrate: (scoreId: string) => Promise<void>;
  /** Mark the given measure as starting at the current playback position. */
  markMeasure: (measureId: string, orderedMeasureIds: readonly string[]) => void;
  removeMeasure: (measureId: string) => void;
  /** Move audio playback to a mapped measure's start (score → audio). */
  seekToMeasure: (measureId: string) => void;
  reset: () => void;
};

export const useSyncStore = create<SyncState>((set, get) => {
  function persist(map: SyncMap): void {
    void saveSyncMap(map);
  }

  return {
    syncMap: null,

    async hydrate(scoreId) {
      if (get().syncMap?.scoreId === scoreId) {
        return;
      }
      const stored = await loadSyncMap(scoreId);
      set({ syncMap: stored ?? createSyncMap(scoreId) });
    },

    markMeasure(measureId, orderedMeasureIds) {
      const map = get().syncMap;
      if (!map) {
        return;
      }
      const audio = useAudioStore.getState();
      const start = audio.position;

      // End at the next already-mapped measure's start, otherwise the track end.
      const index = orderedMeasureIds.indexOf(measureId);
      let end = audio.duration > start ? audio.duration : start + 1;
      for (let i = index + 1; i < orderedMeasureIds.length; i += 1) {
        const entry = map.entries.find((candidate) => candidate.measureId === orderedMeasureIds[i]);
        if (entry && entry.start > start) {
          end = entry.start;
          break;
        }
      }

      let next = setMeasureTimestamp(map, measureId, start, end);

      // Close the previous mapped measure at this start so windows stay contiguous.
      for (let i = index - 1; i >= 0; i -= 1) {
        const entry = next.entries.find((candidate) => candidate.measureId === orderedMeasureIds[i]);
        if (entry) {
          if (entry.start < start) {
            next = setMeasureTimestamp(next, entry.measureId, entry.start, start);
          }
          break;
        }
      }

      set({ syncMap: next });
      persist(next);
    },

    removeMeasure(measureId) {
      const map = get().syncMap;
      if (!map) {
        return;
      }
      const next = removeMeasureTimestamp(map, measureId);
      set({ syncMap: next });
      persist(next);
    },

    seekToMeasure(measureId) {
      const map = get().syncMap;
      if (!map) {
        return;
      }
      const start = measureStart(map, measureId);
      if (start !== null) {
        useAudioStore.getState().seek(start);
      }
    },

    reset() {
      set({ syncMap: null });
    },
  };
});
