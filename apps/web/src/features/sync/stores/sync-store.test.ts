import { beforeEach, describe, expect, it, vi } from "vitest";
import { activeMeasureAt, addMeasure, createScore, type Score } from "@drum-notes/notation-engine";

const audioState = { position: 0, duration: 30, seek: vi.fn() };

vi.mock("@/features/audio/stores/audio-store", () => ({
  useAudioStore: { getState: () => audioState },
}));

vi.mock("../services/sync-repository", () => ({
  saveSyncMap: vi.fn().mockResolvedValue(undefined),
  loadSyncMap: vi.fn().mockResolvedValue(null),
}));

import * as repository from "../services/sync-repository";
import { useSyncStore } from "./sync-store";

/** A score with `count` measures at the given tempo (default 4/4 @ 120 → 2 s). */
function scoreWith(count: number, bpm = 120): Score {
  let score = createScore({ bpm });
  for (let i = 1; i < count; i += 1) {
    score = addMeasure(score);
  }
  return score;
}

beforeEach(() => {
  vi.clearAllMocks();
  audioState.position = 0;
  audioState.duration = 30;
  audioState.seek = vi.fn();
  useSyncStore.getState().reset();
});

describe("sync store", () => {
  it("hydrates a fresh map when none is stored", async () => {
    await useSyncStore.getState().hydrate("s1");
    expect(useSyncStore.getState().syncMap).toEqual({ scoreId: "s1", entries: [] });
  });

  it("marks a measure at the current position and closes the previous one", async () => {
    await useSyncStore.getState().hydrate("s1");
    const ids = ["m1", "m2", "m3"];

    audioState.position = 0;
    useSyncStore.getState().markMeasure("m1", ids);
    audioState.position = 4;
    useSyncStore.getState().markMeasure("m2", ids);

    const entries = useSyncStore.getState().syncMap!.entries;
    expect(entries.find((e) => e.measureId === "m1")).toEqual({
      measureId: "m1",
      start: 0,
      end: 4,
    });
    expect(entries.find((e) => e.measureId === "m2")).toEqual({
      measureId: "m2",
      start: 4,
      end: 30,
    });
    expect(repository.saveSyncMap).toHaveBeenCalledTimes(2);
  });

  it("seeks audio to a mapped measure's start", async () => {
    await useSyncStore.getState().hydrate("s1");
    audioState.position = 7;
    useSyncStore.getState().markMeasure("m1", ["m1"]);

    useSyncStore.getState().seekToMeasure("m1");

    expect(audioState.seek).toHaveBeenCalledWith(7);
  });

  it("does not seek for an unmapped measure", async () => {
    await useSyncStore.getState().hydrate("s1");
    useSyncStore.getState().seekToMeasure("missing");
    expect(audioState.seek).not.toHaveBeenCalled();
  });

  it("removes a measure's mapping and autosaves", async () => {
    await useSyncStore.getState().hydrate("s1");
    useSyncStore.getState().markMeasure("m1", ["m1"]);

    useSyncStore.getState().removeMeasure("m1");

    expect(useSyncStore.getState().syncMap!.entries).toHaveLength(0);
    expect(repository.saveSyncMap).toHaveBeenCalledTimes(2); // mark + remove
  });

  it("projects forward measures from an anchor and stores it", async () => {
    const score = scoreWith(4);
    await useSyncStore.getState().hydrate(score.id);
    audioState.position = 5;

    useSyncStore.getState().projectFromAnchor(score, score.measures[1]!.id);

    const state = useSyncStore.getState();
    expect(state.anchor).toEqual({ measureId: score.measures[1]!.id, start: 5 });
    expect(state.syncMap!.entries).toEqual([
      { measureId: score.measures[1]!.id, start: 5, end: 7 },
      { measureId: score.measures[2]!.id, start: 7, end: 9 },
      { measureId: score.measures[3]!.id, start: 9, end: 11 },
    ]);
    expect(repository.saveSyncMap).toHaveBeenLastCalledWith(state.syncMap, state.anchor);
  });

  it("projected entries resolve through activeMeasureAt and seek to their start", async () => {
    const score = scoreWith(4);
    await useSyncStore.getState().hydrate(score.id);
    audioState.position = 5;
    useSyncStore.getState().projectFromAnchor(score, score.measures[1]!.id);

    const map = useSyncStore.getState().syncMap!;
    // Measure index 2 window is [7, 9).
    expect(activeMeasureAt(map, 8)).toBe(score.measures[2]!.id);

    useSyncStore.getState().seekToMeasure(score.measures[2]!.id);
    expect(audioState.seek).toHaveBeenCalledWith(7);
  });

  it("preserves pre-anchor manual mappings when projecting", async () => {
    const score = scoreWith(4);
    await useSyncStore.getState().hydrate(score.id);
    const ids = score.measures.map((m) => m.id);

    audioState.position = 1;
    useSyncStore.getState().markMeasure(ids[0]!, ids); // manual pre-anchor mapping

    audioState.position = 5;
    useSyncStore.getState().projectFromAnchor(score, ids[1]!);

    const entries = useSyncStore.getState().syncMap!.entries;
    expect(entries.find((e) => e.measureId === ids[0]!)?.start).toBe(1);
    expect(entries).toHaveLength(4);
  });

  it("regenerates forward measures from the stored anchor, overwriting overrides", async () => {
    const score = scoreWith(4);
    await useSyncStore.getState().hydrate(score.id);
    const ids = score.measures.map((m) => m.id);

    audioState.position = 5;
    useSyncStore.getState().projectFromAnchor(score, ids[1]!);

    // Manually override a projected measure, then regenerate.
    audioState.position = 12;
    useSyncStore.getState().markMeasure(ids[2]!, ids);
    expect(useSyncStore.getState().syncMap!.entries.find((e) => e.measureId === ids[2]!)?.start).toBe(
      12,
    );

    useSyncStore.getState().regenerate(score);
    expect(useSyncStore.getState().syncMap!.entries.find((e) => e.measureId === ids[2]!)).toEqual({
      measureId: ids[2]!,
      start: 7,
      end: 9,
    });
  });

  it("regeneration is a no-op without a stored anchor", async () => {
    const score = scoreWith(3);
    await useSyncStore.getState().hydrate(score.id);

    useSyncStore.getState().regenerate(score);

    expect(useSyncStore.getState().syncMap!.entries).toHaveLength(0);
    expect(repository.saveSyncMap).not.toHaveBeenCalled();
  });

  it("hydrates a stored anchor so it survives reload", async () => {
    const anchor = { measureId: "m2", start: 5 };
    vi.mocked(repository.loadSyncMap).mockResolvedValueOnce({
      map: { scoreId: "s9", entries: [{ measureId: "m2", start: 5, end: 7 }] },
      anchor,
    });

    await useSyncStore.getState().hydrate("s9");

    expect(useSyncStore.getState().anchor).toEqual(anchor);
  });
});
