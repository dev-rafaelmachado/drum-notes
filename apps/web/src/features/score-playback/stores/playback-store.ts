import { create } from "zustand";
import type { Score } from "@drum-notes/notation-engine";

import { useMetronomeStore } from "@/features/metronome/stores/metronome-store";
import { playbackEngine, type LoopRange } from "../services/playback-engine";

/**
 * Orchestrates score playback: transport status and the currently playing
 * measure/step (for the highlight). Scheduling math lives in the engine and the
 * timing in the domain; this store only holds UI state and wires intent (see
 * docs/specs/score-playback, docs/adr/010-score-playback.md).
 *
 * It also holds the session-only practice controls (PRACT-001, see
 * docs/specs/loop-speed-control, docs/adr/011-loop-speed.md): a loop region
 * (inclusive measure indices) and a playback speed. Both are kept in memory and
 * forwarded to the engine; they are never saved to the Score or storage.
 */

export type PlaybackStatus = "idle" | "playing" | "paused";

/** Available playback speeds (1× is the default). */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.5, 2] as const;

type PlaybackState = {
  status: PlaybackStatus;
  currentMeasureIndex: number;
  currentStep: number;
  speed: number;
  loop: LoopRange | null;

  play: (score: Score) => Promise<void>;
  playFrom: (score: Score, measureIndex: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setSpeed: (rate: number) => void;
  /** Toggle a measure into the loop range (select / extend / restart / clear). */
  toggleLoopMeasure: (measureIndex: number) => void;
  clearLoop: () => void;
};

const CLEARED = { currentMeasureIndex: -1, currentStep: -1 };

/** Next loop range when toggling `index` against the current `loop`. */
function nextLoop(loop: LoopRange | null, index: number): LoopRange | null {
  if (!loop) {
    return { start: index, end: index };
  }
  if (loop.start === index && loop.end === index) {
    return null; // toggling the lone looped measure clears it
  }
  if (index < loop.start) {
    return { start: index, end: loop.end };
  }
  if (index > loop.end) {
    return { start: loop.start, end: index };
  }
  return { start: index, end: index }; // inside the range → restart selection here
}

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
    // Re-apply the session loop/speed so a fresh transport picks them up.
    playbackEngine.setSpeed(get().speed);
    playbackEngine.setLoop(get().loop);
    set({ status: "playing", currentMeasureIndex: measureIndex, currentStep: 0 });
    await playbackEngine.start(score, measureIndex);
  }

  return {
    status: "idle",
    speed: 1,
    loop: null,
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

    setSpeed(rate) {
      set({ speed: rate });
      playbackEngine.setSpeed(rate);
    },

    toggleLoopMeasure(measureIndex) {
      const loop = nextLoop(get().loop, measureIndex);
      set({ loop });
      playbackEngine.setLoop(loop);
    },

    clearLoop() {
      set({ loop: null });
      playbackEngine.setLoop(null);
    },
  };
});
