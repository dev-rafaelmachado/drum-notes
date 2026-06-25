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
    setSpeed: vi.fn(),
    setLoop: vi.fn(),
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
  usePlaybackStore.setState({
    status: "idle",
    currentMeasureIndex: -1,
    currentStep: -1,
    speed: 1,
    loop: null,
  });
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

  it("defaults to 1× speed and no loop", () => {
    expect(usePlaybackStore.getState().speed).toBe(1);
    expect(usePlaybackStore.getState().loop).toBeNull();
  });

  it("sets the speed and forwards it to the engine", () => {
    usePlaybackStore.getState().setSpeed(0.5);

    expect(usePlaybackStore.getState().speed).toBe(0.5);
    expect(playbackEngine.setSpeed).toHaveBeenCalledWith(0.5);
  });

  it("starts a loop on the first selected measure", () => {
    usePlaybackStore.getState().toggleLoopMeasure(2);

    expect(usePlaybackStore.getState().loop).toEqual({ start: 2, end: 2 });
    expect(playbackEngine.setLoop).toHaveBeenLastCalledWith({ start: 2, end: 2 });
  });

  it("extends the loop to a later measure", () => {
    usePlaybackStore.setState({ loop: { start: 1, end: 1 } });
    usePlaybackStore.getState().toggleLoopMeasure(3);

    expect(usePlaybackStore.getState().loop).toEqual({ start: 1, end: 3 });
  });

  it("moves the loop start when selecting an earlier measure", () => {
    usePlaybackStore.setState({ loop: { start: 2, end: 4 } });
    usePlaybackStore.getState().toggleLoopMeasure(0);

    expect(usePlaybackStore.getState().loop).toEqual({ start: 0, end: 4 });
  });

  it("clears the loop when toggling the lone looped measure", () => {
    usePlaybackStore.setState({ loop: { start: 2, end: 2 } });
    usePlaybackStore.getState().toggleLoopMeasure(2);

    expect(usePlaybackStore.getState().loop).toBeNull();
    expect(playbackEngine.setLoop).toHaveBeenLastCalledWith(null);
  });

  it("restarts the selection when toggling a measure inside the range", () => {
    usePlaybackStore.setState({ loop: { start: 1, end: 4 } });
    usePlaybackStore.getState().toggleLoopMeasure(2);

    expect(usePlaybackStore.getState().loop).toEqual({ start: 2, end: 2 });
  });

  it("clears the loop and tells the engine", () => {
    usePlaybackStore.setState({ loop: { start: 1, end: 3 } });
    usePlaybackStore.getState().clearLoop();

    expect(usePlaybackStore.getState().loop).toBeNull();
    expect(playbackEngine.setLoop).toHaveBeenCalledWith(null);
  });

  describe("setLoop (AUDIO-007)", () => {
    it("sets a range directly and forwards it to the engine", () => {
      usePlaybackStore.getState().setLoop({ start: 1, end: 3 });

      expect(usePlaybackStore.getState().loop).toEqual({ start: 1, end: 3 });
      expect(playbackEngine.setLoop).toHaveBeenCalledWith({ start: 1, end: 3 });
    });

    it("overwrites an existing loop range", () => {
      usePlaybackStore.setState({ loop: { start: 0, end: 2 } });
      usePlaybackStore.getState().setLoop({ start: 3, end: 5 });

      expect(usePlaybackStore.getState().loop).toEqual({ start: 3, end: 5 });
    });

    it("clears the loop when called with null", () => {
      usePlaybackStore.setState({ loop: { start: 1, end: 2 } });
      usePlaybackStore.getState().setLoop(null);

      expect(usePlaybackStore.getState().loop).toBeNull();
      expect(playbackEngine.setLoop).toHaveBeenCalledWith(null);
    });
  });

  it("re-applies the session loop and speed when starting playback", async () => {
    usePlaybackStore.setState({ speed: 0.75, loop: { start: 1, end: 2 } });

    await usePlaybackStore.getState().play(SCORE);

    expect(playbackEngine.setSpeed).toHaveBeenCalledWith(0.75);
    expect(playbackEngine.setLoop).toHaveBeenCalledWith({ start: 1, end: 2 });
  });
});
