import type { Score } from "../model/score";
import { beatsPerMeasure, secondsPerBeat } from "../playback/metronome";
import { createSyncMap, setMeasureTimestamp, type SyncMap } from "./sync-map";

/**
 * Measure timestamp projection (see docs/specs/measure-timestamp-projection).
 * Given a single anchor measure and its start timestamp, project the `[start,
 * end)` window of every measure **at or after** the anchor from the project's
 * tempo. Measures before the anchor are not projected, so the returned map holds
 * only anchor-forward entries.
 *
 * Pure and framework-agnostic: it reuses the canonical timing helpers
 * (`beatsPerMeasure`, `secondsPerBeat`) and produces ordinary `SyncMap` entries,
 * indistinguishable from manually created mappings.
 */
export function projectMeasureTimestamps(
  score: Score,
  anchorMeasureId: string,
  anchorStart: number,
): SyncMap {
  let map = createSyncMap(score.id);

  const anchorIndex = score.measures.findIndex((measure) => measure.id === anchorMeasureId);
  if (anchorIndex === -1) {
    return map;
  }

  const measureDuration =
    beatsPerMeasure(score.timeSignature) * secondsPerBeat(score.bpm, score.timeSignature);

  for (let i = anchorIndex; i < score.measures.length; i += 1) {
    const start = anchorStart + (i - anchorIndex) * measureDuration;
    map = setMeasureTimestamp(map, score.measures[i]!.id, start, start + measureDuration);
  }

  return map;
}
