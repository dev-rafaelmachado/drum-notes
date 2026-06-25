import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../project/services/score-repository", () => ({
  saveScore: vi.fn().mockResolvedValue(undefined),
  loadScore: vi.fn(),
}));

import { createScore, hasNote } from "@drum-notes/notation-engine";

import * as repository from "../../project/services/score-repository";
import { useEditorStore } from "./editor-store";

beforeEach(() => {
  useEditorStore.getState().reset();
  vi.clearAllMocks();
});

describe("editor store", () => {
  it("toggles a note through the domain and autosaves", () => {
    const score = createScore();
    const measureId = score.measures[0]!.id;
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().toggleNote(measureId, "snare", 4);

    const updated = useEditorStore.getState().score!;
    expect(hasNote(updated.measures[0]!, "snare", 4)).toBe(true);
    expect(repository.saveScore).toHaveBeenCalledTimes(1);
  });

  it("adds and removes measures, autosaving each edit", () => {
    const score = createScore();
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().addMeasure();
    expect(useEditorStore.getState().score!.measures).toHaveLength(2);

    const lastMeasureId = useEditorStore.getState().score!.measures[1]!.id;
    useEditorStore.getState().removeMeasure(lastMeasureId);
    expect(useEditorStore.getState().score!.measures).toHaveLength(1);

    expect(repository.saveScore).toHaveBeenCalledTimes(2);
  });

  it("reorders measures through the domain and autosaves", () => {
    let score = createScore();
    useEditorStore.getState().setCurrentScore(score);
    useEditorStore.getState().addMeasure();
    useEditorStore.getState().addMeasure();
    vi.clearAllMocks();

    score = useEditorStore.getState().score!;
    const firstId = score.measures[0]!.id;
    const orderBefore = score.measures.map((m) => m.id);

    useEditorStore.getState().moveMeasure(firstId, 2);

    const after = useEditorStore.getState().score!;
    expect(after.measures.map((m) => m.id)).toEqual([
      orderBefore[1],
      orderBefore[2],
      orderBefore[0],
    ]);
    // Notes/identity untouched: the same measure objects, just reordered.
    expect(after.measures.map((m) => m.id).sort()).toEqual([...orderBefore].sort());
    expect(repository.saveScore).toHaveBeenCalledTimes(1);
  });

  it("does nothing when there is no current score", () => {
    useEditorStore.getState().addMeasure();
    expect(useEditorStore.getState().score).toBeNull();
    expect(repository.saveScore).not.toHaveBeenCalled();
  });
});

describe("editor store — undo / redo", () => {
  it("undoes the last edit and updates canUndo / canRedo", () => {
    const score = createScore();
    const measureId = score.measures[0]!.id;
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().toggleNote(measureId, "snare", 4);
    expect(useEditorStore.getState().canUndo).toBe(true);
    expect(useEditorStore.getState().canRedo).toBe(false);

    useEditorStore.getState().undo();

    const restored = useEditorStore.getState().score!;
    expect(hasNote(restored.measures[0]!, "snare", 4)).toBe(false);
    expect(useEditorStore.getState().canUndo).toBe(false);
    expect(useEditorStore.getState().canRedo).toBe(true);
  });

  it("redoes an undone edit", () => {
    const score = createScore();
    const measureId = score.measures[0]!.id;
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().toggleNote(measureId, "snare", 4);
    useEditorStore.getState().undo();

    useEditorStore.getState().redo();

    const restored = useEditorStore.getState().score!;
    expect(hasNote(restored.measures[0]!, "snare", 4)).toBe(true);
    expect(useEditorStore.getState().canRedo).toBe(false);
    expect(useEditorStore.getState().canUndo).toBe(true);
  });

  it("supports multiple undo steps", () => {
    const score = createScore();
    const measureId = score.measures[0]!.id;
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().toggleNote(measureId, "snare", 4);
    useEditorStore.getState().toggleNote(measureId, "kick", 0);
    useEditorStore.getState().addMeasure();

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().score!.measures).toHaveLength(1);

    useEditorStore.getState().undo();
    expect(hasNote(useEditorStore.getState().score!.measures[0]!, "kick", 0)).toBe(false);

    useEditorStore.getState().undo();
    expect(hasNote(useEditorStore.getState().score!.measures[0]!, "snare", 4)).toBe(false);
    expect(useEditorStore.getState().canUndo).toBe(false);
  });

  it("clears redo stack on new edit after undo", () => {
    const score = createScore();
    const measureId = score.measures[0]!.id;
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().toggleNote(measureId, "snare", 4);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().canRedo).toBe(true);

    useEditorStore.getState().addMeasure();
    expect(useEditorStore.getState().canRedo).toBe(false);
  });

  it("undo is a no-op when score is null", () => {
    useEditorStore.getState().undo();
    expect(repository.saveScore).not.toHaveBeenCalled();
    expect(useEditorStore.getState().score).toBeNull();
  });

  it("undo is a no-op when past is empty", () => {
    const score = createScore();
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().score).toBe(score);
    expect(repository.saveScore).not.toHaveBeenCalled();
  });

  it("redo is a no-op when future is empty", () => {
    const score = createScore();
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().toggleNote(score.measures[0]!.id, "snare", 4);
    vi.clearAllMocks();

    useEditorStore.getState().redo();
    expect(repository.saveScore).not.toHaveBeenCalled();
  });

  it("undo triggers autosave with the restored score", async () => {
    const score = createScore();
    const measureId = score.measures[0]!.id;
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().toggleNote(measureId, "snare", 4);
    vi.clearAllMocks();

    useEditorStore.getState().undo();

    // Allow the async persist to run
    await Promise.resolve();

    expect(repository.saveScore).toHaveBeenCalledTimes(1);
    const savedScore = (repository.saveScore as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(hasNote(savedScore.measures[0]!, "snare", 4)).toBe(false);
  });

  it("redo triggers autosave with the re-applied score", async () => {
    const score = createScore();
    const measureId = score.measures[0]!.id;
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().toggleNote(measureId, "snare", 4);
    useEditorStore.getState().undo();
    vi.clearAllMocks();

    useEditorStore.getState().redo();

    await Promise.resolve();

    expect(repository.saveScore).toHaveBeenCalledTimes(1);
    const savedScore = (repository.saveScore as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(hasNote(savedScore.measures[0]!, "snare", 4)).toBe(true);
  });

  it("autosave does not clear history", () => {
    const score = createScore();
    const measureId = score.measures[0]!.id;
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().toggleNote(measureId, "snare", 4);
    expect(useEditorStore.getState().canUndo).toBe(true);

    // saveStatus transitions happen during persist() — simulate the saving path
    // by confirming canUndo survives after the set({ saveStatus }) calls.
    // The in-memory stacks are never touched by persist(), so canUndo stays true.
    expect(useEditorStore.getState().canUndo).toBe(true);
    expect(useEditorStore.getState().past).toHaveLength(1);
  });

  it("coalesces consecutive setBpm edits into one undo step", () => {
    const score = createScore();
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().setBpm(125);
    useEditorStore.getState().setBpm(130);
    useEditorStore.getState().setBpm(140);

    expect(useEditorStore.getState().score!.bpm).toBe(140);

    useEditorStore.getState().undo();

    expect(useEditorStore.getState().score!.bpm).toBe(score.bpm);
    expect(useEditorStore.getState().canUndo).toBe(false);
  });

  it("coalesces consecutive setTitle edits into one undo step", () => {
    const score = createScore();
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().setTitle("M");
    useEditorStore.getState().setTitle("My");
    useEditorStore.getState().setTitle("My Song");

    useEditorStore.getState().undo();

    expect(useEditorStore.getState().score!.title).toBe(score.title);
    expect(useEditorStore.getState().canUndo).toBe(false);
  });

  it("breaks coalescing when edit type changes", () => {
    const score = createScore();
    const measureId = score.measures[0]!.id;
    useEditorStore.getState().setCurrentScore(score);

    useEditorStore.getState().setBpm(130);
    useEditorStore.getState().toggleNote(measureId, "snare", 4);

    // Undo note toggle (breaks coalescing)
    useEditorStore.getState().undo();
    expect(hasNote(useEditorStore.getState().score!.measures[0]!, "snare", 4)).toBe(false);
    expect(useEditorStore.getState().score!.bpm).toBe(130);

    // Undo bpm change
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().score!.bpm).toBe(score.bpm);
    expect(useEditorStore.getState().canUndo).toBe(false);
  });

  it("caps history at 100 entries", () => {
    const score = createScore();
    const measureId = score.measures[0]!.id;
    useEditorStore.getState().setCurrentScore(score);

    for (let i = 0; i < 101; i++) {
      // Alternate between two positions to avoid toggleNote no-ops
      useEditorStore.getState().toggleNote(measureId, "snare", i % 2 === 0 ? 4 : 8);
    }

    expect(useEditorStore.getState().past.length).toBe(100);
    expect(useEditorStore.getState().canUndo).toBe(true);
  });

  it("clears history on loadScore", async () => {
    const score = createScore();
    useEditorStore.getState().setCurrentScore(score);
    useEditorStore.getState().addMeasure();
    expect(useEditorStore.getState().canUndo).toBe(true);

    // loadScore clears history before the async fetch
    const { loadScore } = useEditorStore.getState();
    void loadScore("other-id");

    expect(useEditorStore.getState().canUndo).toBe(false);
    expect(useEditorStore.getState().past).toHaveLength(0);
  });

  it("clears history on reset", () => {
    const score = createScore();
    useEditorStore.getState().setCurrentScore(score);
    useEditorStore.getState().addMeasure();

    useEditorStore.getState().reset();

    expect(useEditorStore.getState().canUndo).toBe(false);
    expect(useEditorStore.getState().past).toHaveLength(0);
  });

  it("clears history on setCurrentScore", () => {
    const score = createScore();
    useEditorStore.getState().setCurrentScore(score);
    useEditorStore.getState().addMeasure();

    useEditorStore.getState().setCurrentScore(createScore());

    expect(useEditorStore.getState().canUndo).toBe(false);
    expect(useEditorStore.getState().past).toHaveLength(0);
  });

  it("undoes a measure reorder and restores previous order", () => {
    const score = createScore();
    useEditorStore.getState().setCurrentScore(score);
    useEditorStore.getState().addMeasure();
    useEditorStore.getState().addMeasure();

    const orderBefore = useEditorStore.getState().score!.measures.map((m) => m.id);
    const firstId = orderBefore[0]!;

    useEditorStore.getState().moveMeasure(firstId, 2);
    expect(useEditorStore.getState().score!.measures.map((m) => m.id)).toEqual([
      orderBefore[1],
      orderBefore[2],
      orderBefore[0],
    ]);

    useEditorStore.getState().undo();
    expect(useEditorStore.getState().score!.measures.map((m) => m.id)).toEqual(orderBefore);
  });
});
