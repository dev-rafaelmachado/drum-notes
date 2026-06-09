import { InvalidTimestampError } from "../errors";

/**
 * Score-to-audio synchronization, stored **separately from notation** (see
 * docs/adr/008-score-sync.md). A SyncMap references measures by id and maps each
 * to a `[start, end)` window in the track. It never modifies Score / Measure /
 * Note, so it is not an alternative score representation. Pure and
 * framework-agnostic: no Browser APIs.
 */

export type MeasureTimestamp = {
  readonly measureId: string;
  /** Start of the measure in the track, in seconds (inclusive). */
  readonly start: number;
  /** End of the measure in the track, in seconds (exclusive). */
  readonly end: number;
};

export type SyncMap = {
  readonly scoreId: string;
  /** Entries ordered by `start`. */
  readonly entries: readonly MeasureTimestamp[];
};

export function createSyncMap(scoreId: string): SyncMap {
  return { scoreId, entries: [] };
}

/**
 * Set (or replace) a measure's timestamp window. Entries stay ordered by start.
 * Rejects a non-finite, negative, or empty range so the map can never hold an
 * invalid window.
 */
export function setMeasureTimestamp(
  map: SyncMap,
  measureId: string,
  start: number,
  end: number,
): SyncMap {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= end) {
    throw new InvalidTimestampError(measureId, start, end);
  }
  const others = map.entries.filter((entry) => entry.measureId !== measureId);
  const entries = [...others, { measureId, start, end }].sort((a, b) => a.start - b.start);
  return { ...map, entries };
}

export function removeMeasureTimestamp(map: SyncMap, measureId: string): SyncMap {
  return {
    ...map,
    entries: map.entries.filter((entry) => entry.measureId !== measureId),
  };
}

export function hasMeasureTimestamp(map: SyncMap, measureId: string): boolean {
  return map.entries.some((entry) => entry.measureId === measureId);
}

/** The measure whose `[start, end)` window contains `seconds`, or null. */
export function activeMeasureAt(map: SyncMap, seconds: number): string | null {
  const entry = map.entries.find(
    (candidate) => seconds >= candidate.start && seconds < candidate.end,
  );
  return entry ? entry.measureId : null;
}

/** The start timestamp of a mapped measure, for seeking, or null if unmapped. */
export function measureStart(map: SyncMap, measureId: string): number | null {
  const entry = map.entries.find((candidate) => candidate.measureId === measureId);
  return entry ? entry.start : null;
}
