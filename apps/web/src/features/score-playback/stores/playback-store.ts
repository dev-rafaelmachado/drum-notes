import { create } from "zustand";
import type { Score } from "@drum-notes/notation-engine";

import { useMetronomeStore } from "@/features/metronome/stores/metronome-store";
import { playbackEngine } from "../services/playback-engine";

/**
 * Orchestrates score playback: transport status and the currently playing
 * measure/step (for the highlight). Scheduling math lives in the engine and the
 * timing in the domain; this store only holds UI state and wires intent (see
 * docs/specs/score-playback, docs/adr/010-score-playback.md).
 */

export type PlaybackStatus = "idle" | "playing" | "paused";

type PlaybackState = {
  status: PlaybackStatus;
  currentMeasureIndex: number;
  currentStep: number;

  play: (score: Score) => Promise<void>;
  playFrom: (score: Score, measureIndex: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

const CLEARED = { currentMeasureIndex: -1, currentStep: -1 };

export const usePlaybackStore = create<PlaybackState>((set, get) => {
  playbackEngine.setHandlers({
    onProgress: ({ measureIndex, step }) =>
      set({ currentMeasureIndex: measureIndex, currentStep: step }),
    onEnded: () => set({ status: "idle", ...CLEARED }),
  });

  async function begin(score: Score, measureIndex: number): Promise<void> {
    // Single transport owner: the metronome and score playback are mutually
    // exclusive (see docs/adr/010-score-playback.md).
    useMetronomeStore.getState().stop();
    set({ status: "playing", currentMeasureIndex: measureIndex, currentStep: 0 });
    await playbackEngine.start(score, measureIndex);
  }

  return {
    status: "idle",
    ...CLEARED,

    play: (score) => begin(score, 0),
    playFrom: (score, measureIndex) => begin(score, measureIndex),

    pause() {
      if (get().status === "playing") {
        playbackEngine.pause();
        set({ status: "paused" });
      }
    },

    resume() {
      if (get().status === "paused") {
        playbackEngine.resume();
        set({ status: "playing" });
      }
    },

    stop() {
      playbackEngine.stop();
      set({ status: "idle", ...CLEARED });
    },
  };
});
