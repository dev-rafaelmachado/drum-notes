import { describe, expect, it } from "vitest";

import { InvalidBpmError } from "../errors";
import { createScore } from "./create-score";
import { setBpm, setTitle } from "./score-settings";

describe("score settings", () => {
  it("updates the title without mutating the original", () => {
    const score = createScore({ title: "Old" });
    const next = setTitle(score, "New");
    expect(next.title).toBe("New");
    expect(score.title).toBe("Old");
  });

  it("updates the BPM", () => {
    const score = createScore({ bpm: 100 });
    expect(setBpm(score, 140).bpm).toBe(140);
  });

  it("rounds fractional BPM values", () => {
    expect(setBpm(createScore(), 119.6).bpm).toBe(120);
  });

  it("rejects non-positive BPM values", () => {
    const score = createScore();
    expect(() => setBpm(score, 0)).toThrow(InvalidBpmError);
    expect(() => setBpm(score, -10)).toThrow(InvalidBpmError);
  });
});
