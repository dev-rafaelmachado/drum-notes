import { describe, expect, it } from "vitest";

import { INSTRUMENTS } from "@drum-notes/notation-engine";

import { INSTRUMENT_VOICES } from "./instrument-voices";

describe("instrument voices", () => {
  it("has a voice for every supported instrument", () => {
    for (const instrument of INSTRUMENTS) {
      expect(INSTRUMENT_VOICES[instrument]).toBeDefined();
    }
  });

  it("defines no voices beyond the supported instruments", () => {
    expect(Object.keys(INSTRUMENT_VOICES).sort()).toEqual([...INSTRUMENTS].sort());
  });

  it("uses a known voice kind for each instrument", () => {
    for (const instrument of INSTRUMENTS) {
      expect(["membrane", "noise", "metal"]).toContain(INSTRUMENT_VOICES[instrument].kind);
    }
  });
});
