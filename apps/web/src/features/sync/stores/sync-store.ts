import { create } from "zustand";
import {
  createSyncMap,
  measureStart,
  projectMeasureTimestamps,
  removeMeasureTimestamp,
  setMeasureTimestamp,
  type Score,
  type SyncMap,
} from "@drum-notes/notation-engine";

import { useAudioStore } from "@/features/audio/stores/audio-store";
import { loadSyncMap, saveSyncMap, type SyncAnchor } from "../services/sync-repository";

/**
 * Orchestrates the score-to-audio SyncMap: hydration, editing, and seeking
 * between a measure and the audio. Timing/resolution rules live in the domain;
 * this store only holds the current map and wires intent to storage and the
 * audio player (see docs/specs/score-sync, docs/adr/008-score-sync.md).
 *
 * It also holds the projection anchor (AUDIO-006, see
 * docs/specs/measure-timestamp-projection): setting an anchor projects every
 * forward measure from the project's tempo, and the anchor is persisted so the
 * projection can be regenerated after edits or reload.
 *
 * The active measure is *derived* from the audio position, not stored here — see
 * useActiveMeasure.
 */

type SyncState = {
  syncMap: SyncMap | null;
  /** The measure driving projection, or null when none is set. */
  anchor: SyncAnchor | null;

  hydrate: (scoreId: string) => Promise<void>;
  /** Mark the given measure as starting at the current playback position. */
  markMeasure: (measureId: string, orderedMeasureIds: readonly string[]) => void;
  removeMeasure: (measureId: string) => void;
  /** Set a measure as the anchor at the current position and project forward. */
  projectFromAnchor: (score: Score, measureId: string) => void;
  /** Re-project all forward measures from the stored anchor; no-op without one. */
  regenerate: (score: Score) => void;
  /** Move audio playback to a mapped measure's start (score → audio). */
  seekToMeasure: (measureId: string) => void;
  reset: () => void;
};

export const useSyncStore = create<SyncState>((set, get) => {
  /** Persist the current map together with the current anchor. */
  function persist(map: SyncMap): void {
    void saveSyncMap(map, get().anchor);
  }

  /**
   * Project from `anchor`, keeping pre-anchor (non-projected) entries so manual
   * mappings before the anchor survive. Stores the anchor for regeneration.
   */
  function project(score: Score, anchor: SyncAnchor): void {
    const projection = projectMeasureTimestamps(score, anchor.measureId, anchor.start);
    const projectedIds = new Set(projection.entries.map((entry) => entry.measureId));
    const preserved = (get().syncMap?.entries ?? []).filter(
      (entry) => !projectedIds.has(entry.measureId),
    );
    const entries = [...preserved, ...projection.entries].sort((a, b) => a.start - b.start);
    const next: SyncMap = { scoreId: score.id, entries };

    set({ syncMap: next, anchor });
    persist(next);
  }

  return {
    syncMap: null,
    anchor: null,

    async hydrate(scoreId) {
      if (get().syncMap?.scoreId === scoreId) {
        return;
      }
      const stored = await loadSyncMap(scoreId);
      set({
        syncMap: stored?.map ?? createSyncMap(scoreId),
        anchor: stored?.anchor ?? null,
      });
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
      // Clearing the anchor measure drops the anchor so regeneration cannot
      // resurrect it from a measure the user just unmapped.
      if (get().anchor?.measureId === measureId) {
        set({ syncMap: next, anchor: null });
      } else {
        set({ syncMap: next });
      }
      persist(next);
    },

    projectFromAnchor(score, measureId) {
      if (!get().syncMap) {
        return;
      }
      project(score, { measureId, start: useAudioStore.getState().position });
    },

    regenerate(score) {
      const anchor = get().anchor;
      if (!anchor) {
        return;
      }
      project(score, anchor);
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
      set({ syncMap: null, anchor: null });
    },
  };
});
