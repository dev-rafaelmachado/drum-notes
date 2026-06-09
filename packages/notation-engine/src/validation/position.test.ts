import { describe, expect, it } from "vitest";

import { isValidPosition, stepsPerBeat, stepsPerMeasure } from "./position";

describe("stepsPerMeasure", () => {
  it("computes 16 steps for 4/4 sixteenths", () => {
    expect(stepsPerMeasure({ numerator: 4, denominator: 4 }, "sixteenth")).toBe(16);
  });

  it("computes 8 steps for 4/4 eighths", () => {
    expect(stepsPerMeasure({ numerator: 4, denominator: 4 }, "eighth")).toBe(8);
  });

  it("computes 6 steps for 6/8 eighths", () => {
    expect(stepsPerMeasure({ numerator: 6, denominator: 8 }, "eighth")).toBe(6);
  });

  it("computes 12 steps for 3/4 sixteenths", () => {
    expect(stepsPerMeasure({ numerator: 3, denominator: 4 }, "sixteenth")).toBe(12);
  });
});

describe("stepsPerBeat", () => {
  it("is 4 for 4/4 sixteenths", () => {
    expect(stepsPerBeat({ numerator: 4, denominator: 4 }, "sixteenth")).toBe(4);
  });
});

describe("isValidPosition", () => {
  const ts = { numerator: 4, denominator: 4 } as const;

  it("accepts positions inside the grid", () => {
    expect(isValidPosition(ts, "sixteenth", 0)).toBe(true);
    expect(isValidPosition(ts, "sixteenth", 15)).toBe(true);
  });

  it("rejects positions outside the grid", () => {
    expect(isValidPosition(ts, "sixteenth", 16)).toBe(false);
    expect(isValidPosition(ts, "sixteenth", -1)).toBe(false);
    expect(isValidPosition(ts, "sixteenth", 1.5)).toBe(false);
  });
});
