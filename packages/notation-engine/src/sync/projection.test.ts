import { describe, expect, it } from "vitest";

import { addMeasure } from "../operations/measures";
import { createScore } from "../operations/create-score";
import type { Score } from "../model/score";
import { activeMeasureAt } from "./sync-map";
import { projectMeasureTimestamps } from "./projection";

/** A score with `count` measures at the given tempo/meter. */
function scoreWith(count: number, input: Parameters<typeof createScore>[0] = {}): Score {
  let score = createScore(input);
  for (let i = 1; i < count; i += 1) {
    score = addMeasure(score);
  }
  return score;
}

describe("projectMeasureTimestamps", () => {
  it("projects measures at or after the anchor from the tempo (4/4 @ 120 → 2 s)", () => {
    const score = scoreWith(4, { bpm: 120 });
    const [, m2, m3, m4] = score.measures;

    const map = projectMeasureTimestamps(score, m2!.id, 5);

    expect(map.entries).toEqual([
      { measureId: m2!.id, start: 5, end: 7 },
      { measureId: m3!.id, start: 7, end: 9 },
      { measureId: m4!.id, start: 9, end: 11 },
    ]);
  });

  it("gives the anchor measure its provided start and one measure of length", () => {
    const score = scoreWith(4, { bpm: 120 });
    const anchor = score.measures[1]!;

    const map = projectMeasureTimestamps(score, anchor.id, 5);
    const entry = map.entries.find((candidate) => candidate.measureId === anchor.id);

    expect(entry).toEqual({ measureId: anchor.id, start: 5, end: 7 });
  });

  it("leaves measures before the anchor out of the map", () => {
    const score = scoreWith(4, { bpm: 120 });
    const [m1, m2] = score.measures;

    const map = projectMeasureTimestamps(score, m2!.id, 5);

    expect(map.entries.some((entry) => entry.measureId === m1!.id)).toBe(false);
    expect(map.entries).toHaveLength(3);
  });

  it("scales the measure duration with the time signature (3/4 @ 120 → 1.5 s)", () => {
    const score = scoreWith(2, { bpm: 120, timeSignature: { numerator: 3, denominator: 4 } });
    const [m1, m2] = score.measures;

    const map = projectMeasureTimestamps(score, m1!.id, 0);

    expect(map.entries[0]).toEqual({ measureId: m1!.id, start: 0, end: 1.5 });
    expect(map.entries[1]).toEqual({ measureId: m2!.id, start: 1.5, end: 3 });
  });

  it("scales the measure duration with the BPM (120 BPM = half of 60 BPM)", () => {
    const slow = scoreWith(1, { bpm: 60 });
    const fast = scoreWith(1, { bpm: 120 });

    const slowEnd = projectMeasureTimestamps(slow, slow.measures[0]!.id, 0).entries[0]!.end;
    const fastEnd = projectMeasureTimestamps(fast, fast.measures[0]!.id, 0).entries[0]!.end;

    expect(fastEnd).toBeCloseTo(slowEnd / 2);
  });

  it("projects a single-measure score", () => {
    const score = scoreWith(1, { bpm: 120 });
    const map = projectMeasureTimestamps(score, score.measures[0]!.id, 3);

    expect(map.entries).toEqual([{ measureId: score.measures[0]!.id, start: 3, end: 5 }]);
  });

  it("projects every measure when the anchor is the first one", () => {
    const score = scoreWith(3, { bpm: 120 });
    const map = projectMeasureTimestamps(score, score.measures[0]!.id, 0);

    expect(map.entries).toHaveLength(3);
  });

  it("projects only the last measure when the anchor is last", () => {
    const score = scoreWith(3, { bpm: 120 });
    const last = score.measures[2]!;

    const map = projectMeasureTimestamps(score, last.id, 10);

    expect(map.entries).toEqual([{ measureId: last.id, start: 10, end: 12 }]);
  });

  it("returns an empty map for an unknown anchor", () => {
    const score = scoreWith(3, { bpm: 120 });
    const map = projectMeasureTimestamps(score, "missing", 0);

    expect(map.entries).toHaveLength(0);
    expect(map.scoreId).toBe(score.id);
  });

  it("produces entries that resolve through activeMeasureAt", () => {
    const score = scoreWith(3, { bpm: 120 });
    const [, m2] = score.measures;

    const map = projectMeasureTimestamps(score, score.measures[0]!.id, 0);

    // m2 window is [2, 4) — a position inside it resolves to m2.
    expect(activeMeasureAt(map, 3)).toBe(m2!.id);
  });
});
