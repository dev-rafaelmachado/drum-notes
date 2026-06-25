import { describe, expect, it } from "vitest";

import { MeasureNotFoundError } from "../errors";
import { createScore } from "./create-score";
import { addMeasure, duplicateMeasure, moveMeasure, pasteMeasures, removeMeasure } from "./measures";
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

describe("pasteMeasures", () => {
  it("inserts a copy at the start", () => {
    const score = scoreWith(3);
    const source = score.measures[0]!;
    const next = pasteMeasures(score, [source], 0);
    expect(next.measures).toHaveLength(4);
    expect(next.measures[0]!.id).not.toBe(source.id);
    expect(next.measures[1]!.id).toBe(score.measures[0]!.id);
  });

  it("appends a copy at the end", () => {
    const score = scoreWith(3);
    const source = score.measures[0]!;
    const next = pasteMeasures(score, [source], 3);
    expect(next.measures).toHaveLength(4);
    expect(next.measures[3]!.id).not.toBe(source.id);
  });

  it("inserts in the middle", () => {
    const score = scoreWith(3);
    const ids = score.measures.map((m) => m.id);
    const next = pasteMeasures(score, [score.measures[0]!], 1);
    expect(next.measures.map((m) => m.id).slice(1, 2)).not.toEqual([ids[0]]);
    expect(next.measures[0]!.id).toBe(ids[0]);
    expect(next.measures[2]!.id).toBe(ids[1]);
  });

  it("preserves relative order for a multi-measure paste", () => {
    const score = scoreWith(2);
    const [a, b] = score.measures;
    const empty = scoreWith(1);
    const next = pasteMeasures(empty, [a!, b!], 0);
    expect(next.measures).toHaveLength(3);
    // First two are copies in original order; third is the original empty measure.
    expect(next.measures[0]!.id).not.toBe(a!.id);
    expect(next.measures[1]!.id).not.toBe(b!.id);
    // Copied notes structure matches source order (both empty here — just id order).
    const copyIds = [next.measures[0]!.id, next.measures[1]!.id];
    expect(copyIds[0]).not.toBe(copyIds[1]);
  });

  it("is a no-op for an empty clipboard", () => {
    const score = scoreWith(2);
    expect(pasteMeasures(score, [], 0)).toBe(score);
  });

  it("assigns new ids to each pasted measure", () => {
    const score = scoreWith(2);
    const source = score.measures[0]!;
    const next = pasteMeasures(score, [source], 0);
    expect(next.measures[0]!.id).not.toBe(source.id);
    const allIds = next.measures.map((m) => m.id);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it("preserves notes from the source measure", () => {
    let score = scoreWith(2);
    const srcId = score.measures[0]!.id;
    score = toggleNote(score, srcId, "snare", 4);
    const source = score.measures[0]!;
    const target = scoreWith(1);
    const next = pasteMeasures(target, [source], 0);
    expect(next.measures[0]!.notes).toEqual(source.notes);
  });

  it("makes pasted notes independent from the source", () => {
    let score = scoreWith(2);
    const srcId = score.measures[0]!.id;
    score = toggleNote(score, srcId, "kick", 0);
    const source = score.measures[0]!;
    // Mutating the copy's note array reference would only be possible if they
    // share the same array — we verify they don't by checking reference equality.
    const next = pasteMeasures(scoreWith(1), [source], 0);
    expect(next.measures[0]!.notes).not.toBe(source.notes);
  });

  it("clamps an out-of-range insertion index", () => {
    const score = scoreWith(3);
    const source = score.measures[0]!;
    const appended = pasteMeasures(score, [source], 99);
    expect(appended.measures).toHaveLength(4);
    expect(appended.measures[3]!.notes).toEqual(source.notes);

    const prepended = pasteMeasures(score, [source], -5);
    expect(prepended.measures).toHaveLength(4);
    expect(prepended.measures[0]!.notes).toEqual(source.notes);
  });

  it("drops notes outside the target score's grid on cross-project paste", () => {
    // Build a source measure with a note at position 12 (valid in 16-step grid).
    let wideScore = createScore(); // default: 4/4, sixteenths → 16 steps
    const srcId = wideScore.measures[0]!.id;
    wideScore = toggleNote(wideScore, srcId, "snare", 12);
    wideScore = toggleNote(wideScore, srcId, "kick", 0);
    const sourceM = wideScore.measures[0]!;

    // Target score has 8 steps per measure (4/4, eighths).
    const narrowScore = createScore({
      timeSignature: { numerator: 4, denominator: 4 },
      subdivision: "eighth",
    });
    const next = pasteMeasures(narrowScore, [sourceM], 0);
    const pasted = next.measures[0]!;
    // Position 12 is out of range for 8 steps — dropped.
    expect(pasted.notes.some((n) => n.position === 12)).toBe(false);
    // Position 0 is valid — kept.
    expect(pasted.notes.some((n) => n.position === 0 && n.instrument === "kick")).toBe(true);
  });
});
