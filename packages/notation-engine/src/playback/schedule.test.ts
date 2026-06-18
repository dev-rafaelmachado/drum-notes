import { describe, expect, it } from "vitest";

import { addMeasure } from "../operations/measures";
import { toggleNote } from "../operations/notes";
import { createScore } from "../operations/create-score";
import { buildPlaybackSchedule } from "./schedule";

describe("buildPlaybackSchedule", () => {
  it("derives step and measure durations from the tempo (4/4 @ 120, sixteenths)", () => {
    const score = createScore({ bpm: 120, subdivision: "sixteenth" });
    const schedule = buildPlaybackSchedule(score);

    expect(schedule.stepDuration).toBeCloseTo(0.125); // a sixteenth note
    expect(schedule.measureDuration).toBeCloseTo(2); // 16 steps * 0.125
    expect(schedule.duration).toBeCloseTo(2); // one measure
  });

  it("places measure starts at multiples of the measure duration", () => {
    let score = createScore({ bpm: 120, subdivision: "sixteenth" });
    score = addMeasure(score);
    score = addMeasure(score);
    const schedule = buildPlaybackSchedule(score);

    expect(schedule.measureStarts).toEqual([0, 2, 4]);
    expect(schedule.duration).toBeCloseTo(6);
  });

  it("schedules a note at measureStart + step * stepDuration", () => {
    let score = createScore({ bpm: 120, subdivision: "sixteenth" });
    score = addMeasure(score);
    const secondMeasureId = score.measures[1]!.id;
    score = toggleNote(score, secondMeasureId, "snare", 4);

    const schedule = buildPlaybackSchedule(score);
    expect(schedule.notes).toHaveLength(1);
    expect(schedule.notes[0]).toMatchObject({
      instrument: "snare",
      measureIndex: 1,
      step: 4,
    });
    // second measure starts at 2 s; step 4 * 0.125 = 0.5 s
    expect(schedule.notes[0]!.time).toBeCloseTo(2.5);
  });

  it("orders notes by time and keeps empty measures advancing time", () => {
    let score = createScore({ bpm: 120, subdivision: "sixteenth" });
    const id = score.measures[0]!.id;
    score = toggleNote(score, id, "kick", 8);
    score = toggleNote(score, id, "hiHat", 0);
    score = addMeasure(score); // empty measure still extends duration

    const schedule = buildPlaybackSchedule(score);
    expect(schedule.notes.map((n) => n.step)).toEqual([0, 8]);
    expect(schedule.duration).toBeCloseTo(4);
  });

  it("faster BPM yields a shorter duration", () => {
    const slow = buildPlaybackSchedule(createScore({ bpm: 60, subdivision: "sixteenth" }));
    const fast = buildPlaybackSchedule(createScore({ bpm: 120, subdivision: "sixteenth" }));
    expect(fast.duration).toBeLessThan(slow.duration);
  });
});
