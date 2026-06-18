import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Score } from "@drum-notes/notation-engine";

import type { PlaybackHandlers } from "../services/playback-engine";

const hoisted = vi.hoisted(() => ({
  registeredHandlers: null as PlaybackHandlers | null,
  metronomeStop: vi.fn(),
}));

vi.mock("../services/playback-engine", () => ({
  playbackEngine: {
    setHandlers: vi.fn((handlers: PlaybackHandlers) => {
      hoisted.registeredHandlers = handlers;
    }),
    start: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
  },
}));

vi.mock("@/features/metronome/stores/metronome-store", () => ({
  useMetronomeStore: { getState: () => ({ stop: hoisted.metronomeStop }) },
}));

import { playbackEngine } from "../services/playback-engine";
import { usePlaybackStore } from "./playback-store";

const SCORE = { id: "s1", bpm: 120 } as unknown as Score;

beforeEach(() => {
  vi.clearAllMocks();
  usePlaybackStore.setState({ status: "idle", currentMeasureIndex: -1, currentStep: -1 });
});

describe("playback store", () => {
  it("plays from the start, stops the metronome, and starts the engine", async () => {
    await usePlaybackStore.getState().play(SCORE);

    expect(hoisted.metronomeStop).toHaveBeenCalledTimes(1);
    expect(playbackEngine.start).toHaveBeenCalledWith(SCORE, 0);
    expect(usePlaybackStore.getState().status).toBe("playing");
    expect(usePlaybackStore.getState().currentMeasureIndex).toBe(0);
  });

  it("plays from a chosen measure", async () => {
    await usePlaybackStore.getState().playFrom(SCORE, 2);

    expect(playbackEngine.start).toHaveBeenCalledWith(SCORE, 2);
    expect(usePlaybackStore.getState().currentMeasureIndex).toBe(2);
  });

  it("pauses only while playing", () => {
    usePlaybackStore.setState({ status: "playing" });
    usePlaybackStore.getState().pause();

    expect(playbackEngine.pause).toHaveBeenCalledTimes(1);
    expect(usePlaybackStore.getState().status).toBe("paused");

    usePlaybackStore.getState().pause();
    expect(playbackEngine.pause).toHaveBeenCalledTimes(1);
  });

  it("resumes only while paused", () => {
    usePlaybackStore.setState({ status: "paused" });
    usePlaybackStore.getState().resume();

    expect(playbackEngine.resume).toHaveBeenCalledTimes(1);
    expect(usePlaybackStore.getState().status).toBe("playing");

    usePlaybackStore.getState().resume();
    expect(playbackEngine.resume).toHaveBeenCalledTimes(1);
  });

  it("stops and clears the highlight", () => {
    usePlaybackStore.setState({ status: "playing", currentMeasureIndex: 3, currentStep: 5 });
    usePlaybackStore.getState().stop();

    expect(playbackEngine.stop).toHaveBeenCalledTimes(1);
    expect(usePlaybackStore.getState().status).toBe("idle");
    expect(usePlaybackStore.getState().currentMeasureIndex).toBe(-1);
    expect(usePlaybackStore.getState().currentStep).toBe(-1);
  });

  it("updates the highlight from engine progress and clears it on end", () => {
    expect(hoisted.registeredHandlers).not.toBeNull();

    hoisted.registeredHandlers?.onProgress({ measureIndex: 1, step: 4 });
    expect(usePlaybackStore.getState().currentMeasureIndex).toBe(1);
    expect(usePlaybackStore.getState().currentStep).toBe(4);

    hoisted.registeredHandlers?.onEnded();
    expect(usePlaybackStore.getState().status).toBe("idle");
    expect(usePlaybackStore.getState().currentMeasureIndex).toBe(-1);
  });
});
