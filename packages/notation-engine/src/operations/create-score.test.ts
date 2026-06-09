import { describe, expect, it } from "vitest";

import { createScore } from "./create-score";

describe("createScore", () => {
  it("creates a score with the given settings and one empty measure", () => {
    const score = createScore({
      title: "My Groove",
      bpm: 90,
      timeSignature: { numerator: 3, denominator: 4 },
      subdivision: "eighth",
    });

    expect(score.id).toBeTruthy();
    expect(score.title).toBe("My Groove");
    expect(score.bpm).toBe(90);
    expect(score.timeSignature).toEqual({ numerator: 3, denominator: 4 });
    expect(score.subdivision).toBe("eighth");
    expect(score.measures).toHaveLength(1);
    expect(score.measures[0]?.notes).toHaveLength(0);
  });

  it("applies sensible defaults", () => {
    const score = createScore();
    expect(score.title).toBe("Untitled");
    expect(score.bpm).toBe(120);
    expect(score.timeSignature).toEqual({ numerator: 4, denominator: 4 });
    expect(score.subdivision).toBe("sixteenth");
  });

  it("falls back to a default title for blank input", () => {
    expect(createScore({ title: "   " }).title).toBe("Untitled");
  });
});
