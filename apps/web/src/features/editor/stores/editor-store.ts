import { create } from "zustand";
import * as engine from "@drum-notes/notation-engine";
import type { AudioReference, Instrument, Score } from "@drum-notes/notation-engine";

import { loadScore as loadScoreFromDb, saveScore } from "../../project/services/score-repository";

/**
 * Editor state orchestration. The store holds the current Score and exposes
 * actions; all business rules live in the domain (@drum-notes/notation-engine).
 * Every meaningful edit autosaves to IndexedDB (see docs/architecture/storage.md).
 */

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type LoadStatus = "idle" | "loading" | "ready" | "not-found" | "error";

type EditorState = {
  score: Score | null;
  loadStatus: LoadStatus;
  saveStatus: SaveStatus;

  loadScore: (id: string) => Promise<void>;
  setCurrentScore: (score: Score) => void;
  reset: () => void;

  setTitle: (title: string) => void;
  setBpm: (bpm: number) => void;
  addMeasure: () => void;
  removeMeasure: (measureId: string) => void;
  duplicateMeasure: (measureId: string) => void;
  toggleNote: (measureId: string, instrument: Instrument, position: number) => void;
  attachAudio: (audio: AudioReference) => void;
  detachAudio: () => void;
};

export const useEditorStore = create<EditorState>((set, get) => {
  async function persist(score: Score): Promise<void> {
    set({ saveStatus: "saving" });
    try {
      await saveScore(score);
      set({ saveStatus: "saved" });
    } catch {
      set({ saveStatus: "error" });
    }
  }

  /** Apply a pure domain operation to the current score, then autosave. */
  function edit(operation: (score: Score) => Score): void {
    const current = get().score;
    if (!current) {
      return;
    }
    const next = operation(current);
    set({ score: next });
    void persist(next);
  }

  return {
    score: null,
    loadStatus: "idle",
    saveStatus: "idle",

    async loadScore(id) {
      set({ loadStatus: "loading" });
      try {
        const score = await loadScoreFromDb(id);
        if (score) {
          set({ score, loadStatus: "ready", saveStatus: "saved" });
        } else {
          set({ score: null, loadStatus: "not-found" });
        }
      } catch {
        set({ loadStatus: "error" });
      }
    },

    setCurrentScore(score) {
      set({ score, loadStatus: "ready", saveStatus: "idle" });
    },

    reset() {
      set({ score: null, loadStatus: "idle", saveStatus: "idle" });
    },

    setTitle: (title) => edit((score) => engine.setTitle(score, title)),
    setBpm: (bpm) => edit((score) => engine.setBpm(score, bpm)),
    addMeasure: () => edit((score) => engine.addMeasure(score)),
    removeMeasure: (measureId) => edit((score) => engine.removeMeasure(score, measureId)),
    duplicateMeasure: (measureId) =>
      edit((score) => engine.duplicateMeasure(score, measureId)),
    toggleNote: (measureId, instrument, position) =>
      edit((score) => engine.toggleNote(score, measureId, instrument, position)),
    attachAudio: (audio) => edit((score) => engine.attachAudio(score, audio)),
    detachAudio: () => edit((score) => engine.detachAudio(score)),
  };
});
