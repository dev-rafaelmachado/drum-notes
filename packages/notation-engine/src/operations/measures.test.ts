import { describe, expect, it } from "vitest";

import { MeasureNotFoundError } from "../errors";
import { createScore } from "./create-score";
import { addMeasure, duplicateMeasure, moveMeasure, removeMeasure } from "./measures";
import { toggleNote } from "./notes";

/** A score with `count` measures, each tagged so its identity is easy to assert. */
function scoreWith(count: number): ReturnType<typeof createScore> {
  let score = createScore();
  for (let i = 1; i < count; i += 1) {
    score = addMeasure(score);
  }
  return score;
}

describe("measure operations", () => {
  it("appends an empty measure", () => {
    const score = createScore();
    const next = addMeasure(score);
    expect(next.measures).toHaveLength(2);
    expect(next.measures[1]?.notes).toHaveLength(0);
    expect(score.measures).toHaveLength(1);
  });

  it("removes a measure and keeps the order of the rest", () => {
    let score = addMeasure(addMeasure(createScore()));
    const [first, second, third] = score.measures;
    score = removeMeasure(score, second!.id);
    expect(score.measures.map((m) => m.id)).toEqual([first!.id, third!.id]);
  });

  it("throws when removing a missing measure", () => {
    expect(() => removeMeasure(createScore(), "nope")).toThrow(MeasureNotFoundError);
  });

  it("duplicates a measure with its notes right after the original", () => {
    let score = createScore();
    const measureId = score.measures[0]!.id;
    score = toggleNote(score, measureId, "snare", 4);

    const next = duplicateMeasure(score, measureId);
    expect(next.measures).toHaveLength(2);

    const [original, copy] = next.measures;
    expect(copy!.id).not.toBe(original!.id);
    expect(copy!.notes).toEqual(original!.notes);
  });

  it("keeps the duplicate independent from the original", () => {
    let score = createScore();
    const measureId = score.measures[0]!.id;
    score = toggleNote(score, measureId, "kick", 0);
    score = duplicateMeasure(score, measureId);

    const copyId = score.measures[1]!.id;
    score = toggleNote(score, copyId, "kick", 8);

    expect(score.measures[0]!.notes).toHaveLength(1);
    expect(score.measures[1]!.notes).toHaveLength(2);
  });
});

describe("moveMeasure", () => {
  it("moves a measure forward", () => {
    const score = scoreWith(4);
    const ids = score.measures.map((m) => m.id);
    const next = moveMeasure(score, ids[1]!, 2);
    expect(next.measures.map((m) => m.id)).toEqual([ids[0], ids[2], ids[1], ids[3]]);
  });

  it("moves a measure backward", () => {
    const score = scoreWith(4);
    const ids = score.measures.map((m) => m.id);
    const next = moveMeasure(score, ids[3]!, 1);
    expect(next.measures.map((m) => m.id)).toEqual([ids[0], ids[3], ids[1], ids[2]]);
  });

  it("moves a measure to the first position", () => {
    const score = scoreWith(3);
    const ids = score.measures.map((m) => m.id);
    const next = moveMeasure(score, ids[2]!, 0);
    expect(next.measures.map((m) => m.id)).toEqual([ids[2], ids[0], ids[1]]);
  });

  it("moves a measure to the last position", () => {
    const score = scoreWith(3);
    const ids = score.measures.map((m) => m.id);
    const next = moveMeasure(score, ids[0]!, 2);
    expect(next.measures.map((m) => m.id)).toEqual([ids[1], ids[2], ids[0]]);
  });

  it("treats a self-move as a no-op", () => {
    const score = scoreWith(3);
    const ids = score.measures.map((m) => m.id);
    const next = moveMeasure(score, ids[1]!, 1);
    expect(next.measures.map((m) => m.id)).toEqual(ids);
  });

  it("clamps an out-of-range index to the last position", () => {
    const score = scoreWith(3);
    const ids = score.measures.map((m) => m.id);
    expect(moveMeasure(score, ids[0]!, 99).measures.map((m) => m.id)).toEqual([
      ids[1],
      ids[2],
      ids[0],
    ]);
    // A negative index clamps to the first position.
    expect(moveMeasure(score, ids[2]!, -5).measures.map((m) => m.id)).toEqual([
      ids[2],
      ids[0],
      ids[1],
    ]);
  });

  it("preserves the moved measure's id and notes", () => {
    let score = scoreWith(3);
    const movedId = score.measures[1]!.id;
    score = toggleNote(score, movedId, "snare", 4);
    const original = score.measures[1]!;

    const moved = moveMeasure(score, movedId, 0).measures[0]!;

    expect(moved.id).toBe(movedId);
    expect(moved.notes).toEqual(original.notes);
  });

  it("throws when moving a missing measure", () => {
    expect(() => moveMeasure(scoreWith(2), "nope", 0)).toThrow(MeasureNotFoundError);
  });

  it("keeps the relative order of the untouched measures", () => {
    const score = scoreWith(5);
    const ids = score.measures.map((m) => m.id);
    const next = moveMeasure(score, ids[2]!, 0);
    expect(next.measures.map((m) => m.id)).toEqual([ids[2], ids[0], ids[1], ids[3], ids[4]]);
  });
});
