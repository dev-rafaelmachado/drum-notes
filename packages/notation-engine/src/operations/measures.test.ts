import { describe, expect, it } from "vitest";

import { MeasureNotFoundError } from "../errors";
import { createScore } from "./create-score";
import { addMeasure, duplicateMeasure, removeMeasure } from "./measures";
import { toggleNote } from "./notes";

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
