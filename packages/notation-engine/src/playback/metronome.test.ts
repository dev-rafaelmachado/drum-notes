import { describe, expect, it } from "vitest";

import { beatsPerMeasure, isAccentBeat, secondsPerBeat } from "./metronome";

const FOUR_FOUR = { numerator: 4, denominator: 4 } as const;
const THREE_FOUR = { numerator: 3, denominator: 4 } as const;
const SIX_EIGHT = { numerator: 6, denominator: 8 } as const;

describe("beatsPerMeasure", () => {
  it("is the meter's numerator", () => {
    expect(beatsPerMeasure(FOUR_FOUR)).toBe(4);
    expect(beatsPerMeasure(THREE_FOUR)).toBe(3);
    expect(beatsPerMeasure(SIX_EIGHT)).toBe(6);
  });
});

describe("secondsPerBeat", () => {
  it("derives the beat duration from the BPM in /4 meters", () => {
    expect(secondsPerBeat(120, FOUR_FOUR)).toBe(0.5);
    expect(secondsPerBeat(60, FOUR_FOUR)).toBe(1);
  });

  it("accounts for the denominator (eighth-note clicks in 6/8)", () => {
    expect(secondsPerBeat(120, SIX_EIGHT)).toBe(0.25);
  });
});

describe("isAccentBeat", () => {
  it("accents the first beat of each measure", () => {
    expect(isAccentBeat(0, FOUR_FOUR)).toBe(true);
    expect(isAccentBeat(1, FOUR_FOUR)).toBe(false);
    expect(isAccentBeat(3, FOUR_FOUR)).toBe(false);
    expect(isAccentBeat(4, FOUR_FOUR)).toBe(true); // next downbeat
  });

  it("respects the meter length", () => {
    expect(isAccentBeat(3, THREE_FOUR)).toBe(true);
    expect(isAccentBeat(2, THREE_FOUR)).toBe(false);
  });
});
