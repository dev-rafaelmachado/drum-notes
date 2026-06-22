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
