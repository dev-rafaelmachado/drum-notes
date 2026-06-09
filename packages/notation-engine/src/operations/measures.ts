import { MeasureNotFoundError } from "../errors";
import { createMeasure } from "../model/measure";
import type { Score } from "../model/score";

export function addMeasure(score: Score): Score {
  return { ...score, measures: [...score.measures, createMeasure()] };
}

export function removeMeasure(score: Score, measureId: string): Score {
  const measures = score.measures.filter((measure) => measure.id !== measureId);
  if (measures.length === score.measures.length) {
    throw new MeasureNotFoundError(measureId);
  }
  return { ...score, measures };
}

/** Insert a copy of a measure (new id, copied notes) right after the original. */
export function duplicateMeasure(score: Score, measureId: string): Score {
  const index = score.measures.findIndex((measure) => measure.id === measureId);
  if (index === -1) {
    throw new MeasureNotFoundError(measureId);
  }
  const original = score.measures[index]!;
  const copy = createMeasure(original.notes.map((note) => ({ ...note })));
  const measures = [...score.measures];
  measures.splice(index + 1, 0, copy);
  return { ...score, measures };
}
