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

/**
 * Move a measure to a new position. `toIndex` is the measure's final index in the
 * resulting score, clamped to a valid index; moving it to its current position is
 * a no-op. Unlike remove + add, the *same* `Measure` object is relocated, so its
 * `id` and notes are preserved (keeping id-keyed data like the SyncMap valid).
 */
export function moveMeasure(score: Score, measureId: string, toIndex: number): Score {
  const from = score.measures.findIndex((measure) => measure.id === measureId);
  if (from === -1) {
    throw new MeasureNotFoundError(measureId);
  }
  const target = Math.max(0, Math.min(toIndex, score.measures.length - 1));
  if (target === from) {
    return score;
  }
  const measures = [...score.measures];
  const [moved] = measures.splice(from, 1);
  measures.splice(target, 0, moved!);
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
