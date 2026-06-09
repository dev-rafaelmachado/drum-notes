import { beforeEach, describe, expect, it, vi } from "vitest";

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
});
