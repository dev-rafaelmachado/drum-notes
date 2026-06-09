import { create } from "zustand";
import type { TimeSignature } from "@drum-notes/notation-engine";

import { metronomeEngine } from "../services/metronome-engine";

/**
 * Orchestrates the project metronome: start/stop, volume, and keeping the engine
 * in sync with the score's tempo/meter. The timing math lives in the domain and
 * the click scheduling in the engine; this store only holds UI state and wires
 * intent to the engine (see docs/specs/metronome).
 */

const DEFAULT_VOLUME = 0.8;

type MetronomeState = {
  isRunning: boolean;
  volume: number; // linear 0..1

  start: (bpm: number, timeSignature: TimeSignature) => Promise<void>;
  stop: () => void;
  toggle: (bpm: number, timeSignature: TimeSignature) => void;
  /** Forward the score's current tempo/meter so a running metronome follows live. */
  sync: (bpm: number, timeSignature: TimeSignature) => void;
  setVolume: (level: number) => void;
};

export const useMetronomeStore = create<MetronomeState>((set, get) => {
  metronomeEngine.setVolume(DEFAULT_VOLUME);

  return {
    isRunning: false,
    volume: DEFAULT_VOLUME,

    async start(bpm, timeSignature) {
      await metronomeEngine.start(bpm, timeSignature);
      set({ isRunning: true });
    },

    stop() {
      metronomeEngine.stop();
      set({ isRunning: false });
    },

    toggle(bpm, timeSignature) {
      if (get().isRunning) {
        get().stop();
      } else {
        void get().start(bpm, timeSignature);
      }
    },

    sync(bpm, timeSignature) {
      metronomeEngine.setTiming(bpm, timeSignature);
    },

    setVolume(level) {
      const clamped = Math.max(0, Math.min(level, 1));
      metronomeEngine.setVolume(clamped);
      set({ volume: clamped });
    },
  };
});
