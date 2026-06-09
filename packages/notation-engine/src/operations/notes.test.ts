import { describe, expect, it } from "vitest";

import { InvalidPositionError, MeasureNotFoundError } from "../errors";
import { createScore } from "./create-score";
import { hasNote, toggleNote } from "./notes";

function firstMeasureId(score: ReturnType<typeof createScore>): string {
  return score.measures[0]!.id;
}

describe("toggleNote", () => {
  it("adds a note when the cell is empty", () => {
    const score = createScore();
    const id = firstMeasureId(score);
    const next = toggleNote(score, id, "snare", 4);
    expect(hasNote(next.measures[0]!, "snare", 4)).toBe(true);
  });

  it("removes the note when toggled again", () => {
    const score = createScore();
    const id = firstMeasureId(score);
    const withNote = toggleNote(score, id, "snare", 4);
    const without = toggleNote(withNote, id, "snare", 4);
    expect(hasNote(without.measures[0]!, "snare", 4)).toBe(false);
  });

  it("does not mutate the original score", () => {
    const score = createScore();
    const id = firstMeasureId(score);
    toggleNote(score, id, "hiHat", 0);
    expect(score.measures[0]!.notes).toHaveLength(0);
  });

  it("rejects a position outside the subdivision grid", () => {
    // 4/4 sixteenths => 16 steps (0..15); 16 is out of range.
    const score = createScore({ subdivision: "sixteenth" });
    const id = firstMeasureId(score);
    expect(() => toggleNote(score, id, "kick", 16)).toThrow(InvalidPositionError);
    expect(() => toggleNote(score, id, "kick", -1)).toThrow(InvalidPositionError);
    expect(() => toggleNote(score, id, "kick", 2.5)).toThrow(InvalidPositionError);
  });

  it("throws when the measure does not exist", () => {
    const score = createScore();
    expect(() => toggleNote(score, "missing", "kick", 0)).toThrow(MeasureNotFoundError);
  });
});
