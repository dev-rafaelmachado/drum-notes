import { describe, expect, it } from "vitest";

import { InvalidTimestampError } from "../errors";
import {
  activeMeasureAt,
  createSyncMap,
  hasMeasureTimestamp,
  measureStart,
  removeMeasureTimestamp,
  setMeasureTimestamp,
} from "./sync-map";

describe("setMeasureTimestamp", () => {
  it("adds an entry and keeps entries ordered by start", () => {
    let map = createSyncMap("score-1");
    map = setMeasureTimestamp(map, "m2", 4, 8);
    map = setMeasureTimestamp(map, "m1", 0, 4);

    expect(map.entries.map((entry) => entry.measureId)).toEqual(["m1", "m2"]);
    expect(map.entries[0]).toEqual({ measureId: "m1", start: 0, end: 4 });
  });

  it("replaces an existing entry for the same measure", () => {
    let map = setMeasureTimestamp(createSyncMap("s"), "m1", 0, 4);
    map = setMeasureTimestamp(map, "m1", 2, 6);

    expect(map.entries).toHaveLength(1);
    expect(map.entries[0]).toEqual({ measureId: "m1", start: 2, end: 6 });
  });

  it("rejects an invalid range", () => {
    const map = createSyncMap("s");
    expect(() => setMeasureTimestamp(map, "m1", 4, 4)).toThrow(InvalidTimestampError);
    expect(() => setMeasureTimestamp(map, "m1", 6, 2)).toThrow(InvalidTimestampError);
    expect(() => setMeasureTimestamp(map, "m1", -1, 2)).toThrow(InvalidTimestampError);
  });

  it("does not mutate the original map", () => {
    const map = createSyncMap("s");
    setMeasureTimestamp(map, "m1", 0, 4);
    expect(map.entries).toHaveLength(0);
  });
});

describe("removeMeasureTimestamp", () => {
  it("removes the entry for a measure", () => {
    let map = setMeasureTimestamp(createSyncMap("s"), "m1", 0, 4);
    map = removeMeasureTimestamp(map, "m1");
    expect(hasMeasureTimestamp(map, "m1")).toBe(false);
  });
});

describe("activeMeasureAt", () => {
  function mapped() {
    let map = createSyncMap("s");
    map = setMeasureTimestamp(map, "m1", 0, 4);
    map = setMeasureTimestamp(map, "m2", 4, 8);
    return map;
  }

  it("returns the measure whose window contains the position", () => {
    expect(activeMeasureAt(mapped(), 2)).toBe("m1");
    expect(activeMeasureAt(mapped(), 6)).toBe("m2");
  });

  it("treats start as inclusive and end as exclusive", () => {
    expect(activeMeasureAt(mapped(), 0)).toBe("m1");
    expect(activeMeasureAt(mapped(), 4)).toBe("m2"); // boundary belongs to the next
  });

  it("returns null before the first and after the last window", () => {
    const map = setMeasureTimestamp(createSyncMap("s"), "m1", 10, 14);
    expect(activeMeasureAt(map, 5)).toBeNull();
    expect(activeMeasureAt(map, 14)).toBeNull();
    expect(activeMeasureAt(map, 20)).toBeNull();
  });
});

describe("measureStart", () => {
  it("returns the start of a mapped measure or null", () => {
    const map = setMeasureTimestamp(createSyncMap("s"), "m1", 3, 7);
    expect(measureStart(map, "m1")).toBe(3);
    expect(measureStart(map, "missing")).toBeNull();
  });
});
