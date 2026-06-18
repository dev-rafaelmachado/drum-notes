import { describe, expect, it } from "vitest";

import { addMeasure } from "../operations/measures";
import { createScore } from "../operations/create-score";
import { buildPlaybackSchedule } from "./schedule";
import { loopRegion } from "./loop";

/** A schedule for `count` measures at the given tempo (4/4 @ 120 → 2 s each). */
function scheduleWith(count: number, bpm = 120) {
  let score = createScore({ bpm });
  for (let i = 1; i < count; i += 1) {
    score = addMeasure(score);
  }
  return buildPlaybackSchedule(score);
}

describe("loopRegion", () => {
  it("projects an inclusive measure range to a [start, end) window", () => {
    const schedule = scheduleWith(4); // measures at 0, 2, 4, 6
    expect(loopRegion(schedule, 1, 2)).toEqual({ start: 2, end: 6 });
  });

  it("handles a single-measure loop", () => {
    const schedule = scheduleWith(4);
    expect(loopRegion(schedule, 0, 0)).toEqual({ start: 0, end: 2 });
  });

  it("normalises reversed indices", () => {
    const schedule = scheduleWith(4);
    expect(loopRegion(schedule, 3, 1)).toEqual({ start: 2, end: 8 });
  });

  it("clamps out-of-range indices to the whole score", () => {
    const schedule = scheduleWith(4);
    expect(loopRegion(schedule, -1, 10)).toEqual({ start: 0, end: 8 });
  });

  it("scales the window with the tempo", () => {
    const slow = scheduleWith(2, 60);
    const fast = scheduleWith(2, 120);

    const slowLength = (() => {
      const r = loopRegion(slow, 0, 1);
      return r.end - r.start;
    })();
    const fastLength = (() => {
      const r = loopRegion(fast, 0, 1);
      return r.end - r.start;
    })();

    expect(fastLength).toBeCloseTo(slowLength / 2);
  });
});
