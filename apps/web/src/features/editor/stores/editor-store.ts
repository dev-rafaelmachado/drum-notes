import { create } from "zustand";
import * as engine from "@drum-notes/notation-engine";
import type { AudioReference, Instrument, Measure, Score } from "@drum-notes/notation-engine";

import { loadScore as loadScoreFromDb, saveScore } from "../../project/services/score-repository";

/**
 * Editor state orchestration. The store holds the current Score and exposes
 * actions; all business rules live in the domain (@drum-notes/notation-engine).
 * Every meaningful edit autosaves to IndexedDB (see docs/architecture/storage.md).
 *
 * History (EDIT-001): each `edit()` call pushes a snapshot of the pre-edit Score
 * onto `past`. Undo/redo swap between `past` and `future`. History is session-only
 * (in-memory); autosave never clears the stacks.
 */

const MAX_HISTORY = 100;

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type LoadStatus = "idle" | "loading" | "ready" | "not-found" | "error";

type EditorState = {
  score: Score | null;
  loadStatus: LoadStatus;
  saveStatus: SaveStatus;

  past: readonly Score[];
  future: readonly Score[];
  canUndo: boolean;
  canRedo: boolean;

  /** Measures currently highlighted for copy (EDIT-003). */
  selectedMeasureIds: ReadonlySet<string>;
  /** Snapshot of measures ready to paste (EDIT-003). Session-only; not persisted. */
  clipboard: readonly Measure[] | null;
  canPaste: boolean;

  loadScore: (id: string) => Promise<void>;
  setCurrentScore: (score: Score) => void;
  reset: () => void;

  undo: () => void;
  redo: () => void;

  setTitle: (title: string) => void;
  setBpm: (bpm: number) => void;
  addMeasure: () => void;
  removeMeasure: (measureId: string) => void;
  moveMeasure: (measureId: string, toIndex: number) => void;
  duplicateMeasure: (measureId: string) => void;
  toggleNote: (measureId: string, instrument: Instrument, position: number) => void;
  attachAudio: (audio: AudioReference) => void;
  detachAudio: () => void;

  /** Select a measure. Without shiftKey replaces the selection; with shiftKey extends to a range. */
  selectMeasure: (measureId: string, shiftKey: boolean) => void;
  clearSelection: () => void;
  /** Copy selected measures (score order) to the clipboard. Not undoable. */
  copySelectedMeasures: () => void;
  /** Paste clipboard at `atIndex`; defaults to after the last selected measure (or append). */
  pasteMeasures: (atIndex?: number) => void;
};

export const useEditorStore = create<EditorState>((set, get) => {
  // Tracks the last edit type to enable coalescing of continuous inputs.
  let lastEditType: string | null = null;
  // Anchor for shift-click range selection (EDIT-003).
  let selectionAnchorId: string | null = null;

  async function persist(score: Score): Promise<void> {
    set({ saveStatus: "saving" });
    try {
      await saveScore(score);
      set({ saveStatus: "saved" });
    } catch {
      set({ saveStatus: "error" });
    }
  }

  /**
   * Apply a pure domain operation to the current score, push a history entry,
   * and autosave. Pass `editType` for continuous inputs (setBpm, setTitle) to
   * coalesce consecutive edits of the same type into a single undo step.
   */
  function edit(operation: (score: Score) => Score, editType?: string): void {
    const { score, past } = get();
    if (!score) return;

    const next = operation(score);

    const shouldCoalesce = editType !== undefined && editType === lastEditType;
    const newPast = shouldCoalesce
      ? past
      : ([...past.slice(-(MAX_HISTORY - 1)), score] as readonly Score[]);

    lastEditType = editType ?? null;

    set({
      score: next,
      past: newPast,
      future: [],
      canUndo: newPast.length > 0,
      canRedo: false,
    });
    void persist(next);
  }

  function clearHistory(): void {
    lastEditType = null;
    set({ past: [], future: [], canUndo: false, canRedo: false });
  }

  function clearSelectionState(): void {
    selectionAnchorId = null;
    set({ selectedMeasureIds: new Set<string>() });
  }

  return {
    score: null,
    loadStatus: "idle",
    saveStatus: "idle",

    past: [],
    future: [],
    canUndo: false,
    canRedo: false,

    selectedMeasureIds: new Set<string>(),
    clipboard: null,
    canPaste: false,

    async loadScore(id) {
      set({ loadStatus: "loading" });
      clearHistory();
      clearSelectionState();
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
      clearHistory();
      clearSelectionState();
      set({ score, loadStatus: "ready", saveStatus: "idle" });
    },

    reset() {
      clearHistory();
      clearSelectionState();
      set({ score: null, loadStatus: "idle", saveStatus: "idle", clipboard: null, canPaste: false });
    },

    undo() {
      const { score, past, future } = get();
      if (!score || past.length === 0) return;
      const previous = past[past.length - 1]!;
      const newPast = past.slice(0, -1) as readonly Score[];
      const newFuture = [score, ...future] as readonly Score[];
      lastEditType = null;
      set({
        score: previous,
        past: newPast,
        future: newFuture,
        canUndo: newPast.length > 0,
        canRedo: true,
      });
      void persist(previous);
    },

    redo() {
      const { score, past, future } = get();
      if (!score || future.length === 0) return;
      const next = future[0]!;
      const newFuture = future.slice(1) as readonly Score[];
      const newPast = [...past, score] as readonly Score[];
      lastEditType = null;
      set({
        score: next,
        past: newPast,
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      });
      void persist(next);
    },

    setTitle: (title) => edit((score) => engine.setTitle(score, title), "setTitle"),
    setBpm: (bpm) => edit((score) => engine.setBpm(score, bpm), "setBpm"),
    addMeasure: () => edit((score) => engine.addMeasure(score)),
    removeMeasure: (measureId) => edit((score) => engine.removeMeasure(score, measureId)),
    moveMeasure: (measureId, toIndex) =>
      edit((score) => engine.moveMeasure(score, measureId, toIndex)),
    duplicateMeasure: (measureId) =>
      edit((score) => engine.duplicateMeasure(score, measureId)),
    toggleNote: (measureId, instrument, position) =>
      edit((score) => engine.toggleNote(score, measureId, instrument, position)),
    attachAudio: (audio) => edit((score) => engine.attachAudio(score, audio)),
    detachAudio: () => edit((score) => engine.detachAudio(score)),

    selectMeasure(measureId, shiftKey) {
      const { score } = get();
      if (!score) return;
      if (!shiftKey || selectionAnchorId === null) {
        selectionAnchorId = measureId;
        set({ selectedMeasureIds: new Set([measureId]) });
        return;
      }
      const anchorIndex = score.measures.findIndex((m) => m.id === selectionAnchorId);
      const clickIndex = score.measures.findIndex((m) => m.id === measureId);
      if (anchorIndex === -1) {
        selectionAnchorId = measureId;
        set({ selectedMeasureIds: new Set([measureId]) });
        return;
      }
      const from = Math.min(anchorIndex, clickIndex);
      const to = Math.max(anchorIndex, clickIndex);
      const range = score.measures.slice(from, to + 1).map((m) => m.id);
      set({ selectedMeasureIds: new Set(range) });
    },

    clearSelection() {
      clearSelectionState();
    },

    copySelectedMeasures() {
      const { score, selectedMeasureIds } = get();
      if (!score || selectedMeasureIds.size === 0) return;
      const clipboard = score.measures.filter((m) => selectedMeasureIds.has(m.id));
      set({ clipboard, canPaste: clipboard.length > 0 });
    },

    pasteMeasures(atIndex) {
      const { clipboard, score, selectedMeasureIds } = get();
      if (!clipboard || clipboard.length === 0 || !score) return;
      let target = atIndex;
      if (target === undefined) {
        const lastSelectedIndex = score.measures.reduce(
          (max, m, i) => (selectedMeasureIds.has(m.id) ? i : max),
          -1,
        );
        target = lastSelectedIndex === -1 ? score.measures.length : lastSelectedIndex + 1;
      }
      edit((s) => engine.pasteMeasures(s, clipboard, target!));
    },
  };
});
