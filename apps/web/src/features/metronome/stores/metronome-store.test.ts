import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/metronome-engine", () => ({
  metronomeEngine: {
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    setTiming: vi.fn(),
    setVolume: vi.fn(),
  },
}));

import { metronomeEngine } from "../services/metronome-engine";
import { useMetronomeStore } from "./metronome-store";

const TS = { numerator: 4, denominator: 4 } as const;

beforeEach(() => {
  vi.clearAllMocks();
  useMetronomeStore.setState({ isRunning: false, volume: 0.8 });
});

describe("metronome store", () => {
  it("starts the engine and marks it running", async () => {
    await useMetronomeStore.getState().start(120, TS);

    expect(metronomeEngine.start).toHaveBeenCalledWith(120, TS);
    expect(useMetronomeStore.getState().isRunning).toBe(true);
  });

  it("stops the engine and clears running", () => {
    useMetronomeStore.setState({ isRunning: true });

    useMetronomeStore.getState().stop();

    expect(metronomeEngine.stop).toHaveBeenCalledTimes(1);
    expect(useMetronomeStore.getState().isRunning).toBe(false);
  });

  it("toggles between start and stop", async () => {
    useMetronomeStore.getState().toggle(90, TS);
    // start is async; let the microtask resolve
    await Promise.resolve();
    expect(metronomeEngine.start).toHaveBeenCalledWith(90, TS);

    useMetronomeStore.setState({ isRunning: true });
    useMetronomeStore.getState().toggle(90, TS);
    expect(metronomeEngine.stop).toHaveBeenCalledTimes(1);
  });

  it("forwards tempo/meter changes to the engine", () => {
    useMetronomeStore.getState().sync(140, TS);
    expect(metronomeEngine.setTiming).toHaveBeenCalledWith(140, TS);
  });

  it("sets volume on the engine and in state", () => {
    useMetronomeStore.getState().setVolume(0.3);
    expect(metronomeEngine.setVolume).toHaveBeenCalledWith(0.3);
    expect(useMetronomeStore.getState().volume).toBe(0.3);
  });
});
