import type { PlaybackSchedule } from "./schedule";

/**
 * Loop playback preparation (see docs/specs/loop-speed-control,
 * docs/adr/011-loop-speed.md). A loop region is expressed as a contiguous,
 * inclusive measure range and projected to a `[start, end)` window in seconds
 * from the existing playback schedule — no new notation model. Pure and
 * framework-agnostic: no Tone.js, no Browser APIs.
 */

export type LoopRegion = {
  /** Start of the loop in the playback timeline, in seconds (inclusive). */
  readonly start: number;
  /** End of the loop in the playback timeline, in seconds (exclusive). */
  readonly end: number;
};

function clampIndex(index: number, count: number): number {
  if (index < 0) {
    return 0;
  }
  if (index > count - 1) {
    return count - 1;
  }
  return index;
}

/**
 * The `[start, end)` window for an inclusive measure range. Reversed indices are
 * normalised (start ≤ end) and both are clamped to the schedule's measure count,
 * so callers can pass raw selection indices safely.
 */
export function loopRegion(
  schedule: PlaybackSchedule,
  startIndex: number,
  endIndex: number,
): LoopRegion {
  const count = schedule.measureStarts.length;
  const lo = clampIndex(Math.min(startIndex, endIndex), count);
  const hi = clampIndex(Math.max(startIndex, endIndex), count);

  return {
    start: schedule.measureStarts[lo]!,
    end: schedule.measureStarts[hi]! + schedule.measureDuration,
  };
}
